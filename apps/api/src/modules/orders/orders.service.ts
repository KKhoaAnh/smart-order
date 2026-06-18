import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { OrderItemOption } from '../../database/entities/order-item-option.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Option } from '../../database/entities/option.entity';
import { TableSession } from '../../database/entities/table-session.entity';
import { Payment } from '../../database/entities/payment.entity';
import { CreateOrderDto, AddOrderItemsDto, OrderItemDto } from './dto/create-order.dto';
import { OrderGateway } from '../websocket/order.gateway';
import { TablesService } from '../tables/tables.service';
import { serializeDates } from '../../common/utils/serialize-dates';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderItemOption)
    private readonly orderItemOptionRepo: Repository<OrderItemOption>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly orderGateway: OrderGateway,
    private readonly tablesService: TablesService,
  ) {}

  // ── Tạo đơn hàng mới ──
  async createOrder(dto: CreateOrderDto) {
    // 1. Validate session
    const session = await this.sessionRepo.findOne({
      where: { session_token: dto.session_token, status: 'ACTIVE' },
      relations: ['table'],
    });
    if (!session) {
      throw new BadRequestException('Phiên đã hết hạn hoặc không hợp lệ');
    }

    // 2. Kiểm tra đã có order active chưa
    const existingOrder = await this.orderRepo.findOne({
      where: {
        session_id: session.id,
        order_status: 'PENDING',
      },
    });
    // Nếu đã có order PENDING, chuyển sang addItems
    if (existingOrder) {
      return this.addItems(existingOrder.id, dto);
    }

    // 3. Tạo order number
    const orderNumber = await this.generateOrderNumber(session.table.store_id);

    // 4. Tạo order trong transaction
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const order = new Order();
      order.store_id = session.table.store_id;
      order.table_id = session.table_id;
      order.session_id = session.id;
      order.order_number = orderNumber;
      order.order_status = 'PENDING';
      order.payment_status = 'UNPAID';
      order.total_amount = 0;

      const saved = await manager.save(Order, order);

      // 5. Tạo order items
      let totalAmount = 0;
      for (const itemDto of dto.items) {
        const itemTotal = await this.createOrderItem(manager, saved.id, itemDto, 1);
        totalAmount += itemTotal;
      }

      // 6. Cập nhật total
      saved.total_amount = totalAmount;
      await manager.save(Order, saved);

      return saved;
    });

    // 7. Lấy chi tiết (sau khi transaction commit)
    const detail = await this.getOrderDetail(savedOrder.id);

    // 8. WebSocket: Thông báo POS có đơn mới
    this.orderGateway.emitNewOrder(session.table.store_id, detail);

    return detail;
  }

  // ── Gọi thêm món (append vào order cũ) ──
  async addItems(orderId: number, dto: AddOrderItemsDto) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.order_status === 'COMPLETED' || order.order_status === 'CANCELLED') {
      throw new BadRequestException('Đơn hàng đã hoàn thành hoặc đã hủy, không thể gọi thêm');
    }

    // Validate session
    const session = await this.sessionRepo.findOne({
      where: { session_token: dto.session_token, status: 'ACTIVE' },
    });
    if (!session) {
      throw new BadRequestException('Phiên đã hết hạn');
    }

    // Tính round tiếp theo
    const maxRound = await this.orderItemRepo
      .createQueryBuilder('item')
      .select('MAX(item.order_round)', 'max')
      .where('item.order_id = :orderId', { orderId })
      .getRawOne();
    const newRound = (maxRound?.max || 0) + 1;

    return this.dataSource.transaction(async (manager) => {
      let addedTotal = 0;
      for (const itemDto of dto.items) {
        const itemTotal = await this.createOrderItem(manager, orderId, itemDto, newRound);
        addedTotal += itemTotal;
      }

      // Cập nhật total_amount
      order.total_amount = Number(order.total_amount) + addedTotal;
      // Reset status về PENDING nếu đã CONFIRMED (vì có món mới)
      if (order.order_status === 'CONFIRMED') {
        order.order_status = 'PENDING';
      }
      await manager.save(Order, order);

      return order;
    }).then(async (savedOrder) => {
      // Lấy chi tiết sau khi transaction commit
      const detail = await this.getOrderDetail(orderId);

      // WebSocket: Thông báo POS có món mới
      this.orderGateway.emitOrderItemsAdded(savedOrder.store_id, detail);

      return detail;
    });
  }

  // ── Lấy chi tiết đơn hàng ──
  async getOrderDetail(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: [
        'table',
        'items',
        'items.product',
        'items.variant',
        'items.selected_options',
        'items.selected_options.option',
        'payment',
      ],
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return serializeDates({
      ...order,
      total_amount: Number(order.total_amount),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
        selected_options: item.selected_options.map((so) => ({
          ...so,
          price: Number(so.price),
        })),
      })),
    });
  }

  // ── Lấy orders theo store (cho POS) ──
  async getOrdersByStore(storeId: number, status?: string) {
    const where: any = { store_id: storeId };
    if (status) where.order_status = status;

    return this.orderRepo.find({
      where,
      relations: ['table', 'items', 'items.product', 'items.variant'],
      order: { created_at: 'DESC' },
    });
  }

  // ── Lấy orders theo session (cho Customer) ──
  async getOrdersBySession(sessionToken: string) {
    const session = await this.sessionRepo.findOne({
      where: { session_token: sessionToken },
    });
    if (!session) throw new BadRequestException('Session không hợp lệ');

    return this.orderRepo.find({
      where: { session_id: session.id },
      relations: ['items', 'items.product', 'items.variant', 'items.selected_options', 'items.selected_options.option'],
      order: { created_at: 'DESC' },
    });
  }

  // ── Cập nhật trạng thái order ──
  async updateOrderStatus(orderId: number, status: string, rejectReason?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['session'],
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    order.order_status = status;
    if (rejectReason) order.reject_reason = rejectReason;

    const saved = await this.orderRepo.save(order);

    // WebSocket: Thông báo Customer trạng thái đơn thay đổi
    if (order.session) {
      this.orderGateway.emitOrderStatusChanged(
        order.session.session_token,
        { order_id: orderId, status, reject_reason: rejectReason },
      );
    }

    return saved;
  }

  // ── Cập nhật trạng thái item ──
  async updateItemStatus(itemId: number, status: string) {
    const item = await this.orderItemRepo.findOne({
      where: { id: itemId },
      relations: ['order', 'order.session', 'product'],
    });
    if (!item) throw new NotFoundException('Món không tồn tại trong đơn');

    item.item_status = status;
    if (status === 'COOKING') {
      item.cooking_started_at = new Date();
    } else if (status === 'PENDING') {
      item.cooking_started_at = null;
    }

    await this.orderItemRepo.save(item);

    // WebSocket: Thông báo thay đổi trạng thái món
    if (item.order?.session) {
      this.orderGateway.emitItemStatusChanged(
        item.order.store_id,
        item.order.session.session_token,
        serializeDates({
          order_id: item.order_id,
          item_id: itemId,
          id: itemId,
          item_status: status,
          product_name: item.product?.name,
          cooking_started_at: item.cooking_started_at,
        }),
      );
    }

    // Kiểm tra nếu tất cả items đều SERVED → auto COMPLETED
    if (status === 'SERVED') {
      const allItems = await this.orderItemRepo.find({
        where: { order_id: item.order_id },
      });
      const allServed = allItems.every((i) => i.item_status === 'SERVED');
      if (allServed) {
        await this.updateOrderStatus(item.order_id, 'COMPLETED');
      }
    }

    return item;
  }

  // ── Thanh toán ──
  async processPayment(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['session'],
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Tạo payment record
    const payment = new Payment();
    payment.order_id = orderId;
    payment.payment_method = 'CASH';
    payment.amount = order.total_amount;
    payment.status = 'SUCCESS';
    payment.paid_at = new Date();
    await this.paymentRepo.save(payment);

    // Update order
    order.payment_status = 'PAID';
    order.order_status = 'COMPLETED';
    await this.orderRepo.save(order);

    // Đóng phiên → bàn trống (nếu không còn session ACTIVE khác)
    if (order.session) {
      this.orderGateway.emitPaymentCompleted(
        order.session.session_token,
        { order_id: orderId, amount: order.total_amount, method: 'CASH' },
      );

      order.session.status = 'EXPIRED';
      order.session.closed_at = new Date();
      await this.sessionRepo.save(order.session);
    }

    const table = await this.tablesService.syncTableStatus(order.table_id);

    this.orderGateway.emitTableStatusChanged(order.store_id, {
      table_id: table.id,
      status: table.status,
      table_number: table.table_number,
    });

    return this.getOrderDetail(orderId);
  }

  // ── Helper: Tạo order item ──
  private async createOrderItem(
    manager: any,
    orderId: number,
    dto: OrderItemDto,
    round: number,
  ): Promise<number> {
    const product = await this.productRepo.findOne({ where: { id: dto.product_id } });
    if (!product) throw new NotFoundException(`Sản phẩm #${dto.product_id} không tồn tại`);
    if (!product.is_available) throw new BadRequestException(`${product.name} hiện đã hết`);

    let price = Number(product.base_price);

    // Variant price
    if (dto.variant_id) {
      const variant = await this.variantRepo.findOne({ where: { id: dto.variant_id } });
      if (variant) {
        price += Number(variant.price_adjustment);
      }
    }

    // Options price
    let optionsTotal = 0;
    const selectedOptions: { option_id: number; price: number }[] = [];
    if (dto.option_ids && dto.option_ids.length > 0) {
      for (const optId of dto.option_ids) {
        const opt = await this.optionRepo.findOne({ where: { id: optId } });
        if (opt) {
          optionsTotal += Number(opt.price);
          selectedOptions.push({ option_id: opt.id, price: Number(opt.price) });
        }
      }
    }

    const subtotal = (price + optionsTotal) * dto.quantity;

    // Save order item
    const item = new OrderItem();
    item.order_id = orderId;
    item.product_id = dto.product_id;
    item.variant_id = dto.variant_id!;
    item.quantity = dto.quantity;
    item.price = price;
    item.subtotal = subtotal;
    item.note = dto.note!;
    item.order_round = round;
    item.item_status = 'PENDING';
    const savedItem = await manager.save(OrderItem, item);

    // Save selected options
    for (const so of selectedOptions) {
      const oio = new OrderItemOption();
      oio.order_item_id = savedItem.id;
      oio.option_id = so.option_id;
      oio.price = so.price;
      await manager.save(OrderItemOption, oio);
    }

    return subtotal;
  }

  // ── Helper: Generate order number ──
  private async generateOrderNumber(storeId: number): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const count = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.store_id = :storeId', { storeId })
      .andWhere('DATE(order.created_at) = CURRENT_DATE')
      .getCount();

    return `#${String(count + 1).padStart(3, '0')}`;
  }
}
