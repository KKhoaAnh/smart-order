import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from '../../database/entities/promotion.entity';
import { OrderPromotion } from '../../database/entities/order-promotion.entity';
import { Product } from '../../database/entities/product.entity';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/create-promotion.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
    @InjectRepository(OrderPromotion)
    private readonly orderPromotionRepo: Repository<OrderPromotion>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ── Tạo khuyến mãi ──
  async create(storeId: number, dto: CreatePromotionDto) {
    // Uppercase mã nếu có
    if (dto.code) {
      dto.code = dto.code.toUpperCase().trim();

      // Kiểm tra trùng mã trong cùng store
      const existing = await this.promotionRepo.findOne({
        where: { store_id: storeId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Mã "${dto.code}" đã tồn tại trong cửa hàng`);
      }
    }

    const promotion = this.promotionRepo.create({
      ...dto,
      store_id: storeId,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
    });

    return this.promotionRepo.save(promotion);
  }

  // ── Lấy danh sách KM của store ──
  async findAllByStore(storeId: number) {
    const promotions = await this.promotionRepo.find({
      where: { store_id: storeId },
      order: { created_at: 'DESC' },
    });

    return promotions.map((p) => this.serializePromotion(p));
  }

  // ── Chi tiết KM ──
  async findOne(id: number) {
    const promotion = await this.promotionRepo.findOne({
      where: { id },
    });
    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }
    return this.serializePromotion(promotion);
  }

  // ── Cập nhật KM ──
  async update(id: number, dto: UpdatePromotionDto) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }

    if (dto.code) {
      dto.code = dto.code.toUpperCase().trim();
      // Kiểm tra trùng mã (trừ chính nó)
      const existing = await this.promotionRepo.findOne({
        where: { store_id: promotion.store_id, code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Mã "${dto.code}" đã tồn tại`);
      }
    }

    const updateData: any = { ...dto };
    if (dto.start_date) updateData.start_date = new Date(dto.start_date);
    if (dto.end_date) updateData.end_date = new Date(dto.end_date);

    Object.assign(promotion, updateData);
    return this.promotionRepo.save(promotion).then((p) => this.serializePromotion(p));
  }

  // ── Xóa KM ──
  async remove(id: number) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException('Khuyến mãi không tồn tại');
    }
    await this.promotionRepo.remove(promotion);
    return { message: 'Đã xóa khuyến mãi' };
  }

  // ── Lấy KM đang chạy (cho customer banner) ──
  async getActiveByStore(storeId: number) {
    const now = new Date();
    const promotions = await this.promotionRepo.find({
      where: {
        store_id: storeId,
        is_active: true,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
      order: { created_at: 'DESC' },
    });

    // Chỉ trả về các KM có mã (để khách biết nhập mã gì)
    return promotions
      .filter((p) => p.code)
      .map((p) => this.serializePromotion(p));
  }

  // ── Validate mã giảm giá ──
  async validateCoupon(dto: ValidateCouponDto) {
    const { code, store_id, order_amount, customer_id } = dto;

    // 1. Tìm mã
    const promotion = await this.promotionRepo.findOne({
      where: { code: code.toUpperCase().trim(), store_id },
    });

    if (!promotion) {
      return { valid: false, message: 'Mã giảm giá không tồn tại' };
    }

    // 2. Kiểm tra is_active
    if (!promotion.is_active) {
      return { valid: false, message: 'Mã giảm giá đã ngừng hoạt động' };
    }

    // 3. Kiểm tra thời hạn
    const now = new Date();
    if (now < new Date(promotion.start_date)) {
      return { valid: false, message: 'Mã giảm giá chưa bắt đầu' };
    }
    if (now > new Date(promotion.end_date)) {
      return { valid: false, message: 'Mã giảm giá đã hết hạn' };
    }

    // 4. Kiểm tra giới hạn sử dụng tổng
    if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
      return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // 5. Kiểm tra đơn tối thiểu
    if (Number(promotion.min_order_amount) > 0 && order_amount < Number(promotion.min_order_amount)) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(Number(promotion.min_order_amount))}đ`,
        min_order_amount: Number(promotion.min_order_amount),
      };
    }

    // 6. Kiểm tra giới hạn/khách
    if (customer_id && promotion.per_customer_limit) {
      const usageCount = await this.orderPromotionRepo.count({
        where: {
          promotion_id: promotion.id,
        },
      });
      // Đếm đơn hàng của customer có dùng promotion này
      const customerUsage = await this.orderPromotionRepo
        .createQueryBuilder('op')
        .innerJoin('op.order', 'order')
        .where('op.promotion_id = :promotionId', { promotionId: promotion.id })
        .andWhere('order.customer_id = :customerId', { customerId: customer_id })
        .getCount();

      if (customerUsage >= promotion.per_customer_limit) {
        return { valid: false, message: 'Bạn đã sử dụng mã này rồi' };
      }
    }

    // 7. Tính discount_amount
    const discountAmount = this.calculateDiscount(promotion, order_amount);

    return {
      valid: true,
      promotion_name: promotion.name,
      discount_type: promotion.type,
      discount_value: Number(promotion.value),
      discount_amount: discountAmount,
      message: 'Mã giảm giá hợp lệ',
    };
  }

  // ── Áp dụng promotion vào đơn hàng ──
  async applyPromotion(
    code: string,
    storeId: number,
    orderAmount: number,
    orderId: number,
    customerId?: number,
  ): Promise<{ discount_amount: number; promotion_id: number; usage_count: number }> {
    // Validate lại
    const result = await this.validateCoupon({
      code,
      store_id: storeId,
      order_amount: orderAmount,
      customer_id: customerId,
    });

    if (!result.valid) {
      throw new BadRequestException(result.message);
    }

    const promotion = await this.promotionRepo.findOne({
      where: { code: code.toUpperCase().trim(), store_id: storeId },
    });

    if (!promotion) {
      throw new BadRequestException('Khuyến mãi không tồn tại');
    }

    const discountAmount = result.discount_amount || 0;

    // Tạo OrderPromotion record
    const orderPromotion = this.orderPromotionRepo.create({
      order_id: orderId,
      promotion_id: promotion.id,
      code_used: code.toUpperCase().trim(),
      discount_amount: discountAmount,
    });
    await this.orderPromotionRepo.save(orderPromotion);

    // Tăng usage_count
    promotion.usage_count = (promotion.usage_count || 0) + 1;
    await this.promotionRepo.save(promotion);

    return {
      discount_amount: discountAmount,
      promotion_id: promotion.id,
      usage_count: promotion.usage_count,
    };
  }

  // ── Helper: Tính số tiền giảm ──
  private calculateDiscount(promotion: Promotion, orderAmount: number): number {
    let discount = 0;

    switch (promotion.type) {
      case 'PERCENT':
        discount = Math.floor(orderAmount * Number(promotion.value) / 100);
        // Áp dụng max_discount nếu có
        if (promotion.max_discount && discount > Number(promotion.max_discount)) {
          discount = Number(promotion.max_discount);
        }
        break;

      case 'FIXED':
        discount = Number(promotion.value);
        // Không giảm quá tổng đơn
        if (discount > orderAmount) {
          discount = orderAmount;
        }
        break;

      case 'FREE_ITEM':
        // Giảm bằng giá sản phẩm miễn phí
        discount = Number(promotion.value);
        if (discount > orderAmount) {
          discount = orderAmount;
        }
        break;
    }

    return discount;
  }

  // ── Helper: Serialize dates & numbers ──
  private serializePromotion(p: Promotion) {
    return {
      ...p,
      value: Number(p.value),
      min_order_amount: Number(p.min_order_amount),
      max_discount: p.max_discount ? Number(p.max_discount) : null,
      start_date: p.start_date instanceof Date ? p.start_date.toISOString() : p.start_date,
      end_date: p.end_date instanceof Date ? p.end_date.toISOString() : p.end_date,
      created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
      updated_at: p.updated_at instanceof Date ? p.updated_at.toISOString() : p.updated_at,
    };
  }
}
