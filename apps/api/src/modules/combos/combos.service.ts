import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Combo } from '../../database/entities/combo.entity';
import { ComboItem } from '../../database/entities/combo-item.entity';
import { Product } from '../../database/entities/product.entity';
import { CreateComboDto, UpdateComboDto } from './dto/create-combo.dto';

@Injectable()
export class CombosService {
  constructor(
    @InjectRepository(Combo)
    private readonly comboRepo: Repository<Combo>,
    @InjectRepository(ComboItem)
    private readonly comboItemRepo: Repository<ComboItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ── Tạo combo ──
  async create(storeId: number, dto: CreateComboDto) {
    // Tính original_price từ tổng base_price × quantity
    let originalPrice = 0;
    for (const item of dto.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.product_id },
      });
      if (!product) {
        throw new NotFoundException(`Sản phẩm #${item.product_id} không tồn tại`);
      }
      originalPrice += Number(product.base_price) * (item.quantity || 1);
    }

    const combo = this.comboRepo.create({
      store_id: storeId,
      name: dto.name,
      description: dto.description,
      image_url: dto.image_url,
      combo_price: dto.combo_price,
      original_price: originalPrice,
      is_active: dto.is_active ?? true,
      priority: dto.priority ?? 0,
    });

    const saved = await this.comboRepo.save(combo);

    // Tạo combo items
    for (const item of dto.items) {
      const comboItem = this.comboItemRepo.create({
        combo_id: saved.id,
        product_id: item.product_id,
        default_variant_id: item.default_variant_id || undefined,
        quantity: item.quantity || 1,
      });
      await this.comboItemRepo.save(comboItem);
    }

    return this.findOne(saved.id);
  }

  // ── Danh sách combo của store (Admin) ──
  async findAllByStore(storeId: number) {
    const combos = await this.comboRepo.find({
      where: { store_id: storeId },
      relations: ['items', 'items.product', 'items.default_variant'],
      order: { priority: 'ASC', created_at: 'DESC' },
    });

    return combos.map((c) => this.serializeCombo(c));
  }

  // ── Chi tiết combo ──
  async findOne(id: number) {
    const combo = await this.comboRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.product.variants', 'items.product.options', 'items.default_variant'],
    });
    if (!combo) {
      throw new NotFoundException('Combo không tồn tại');
    }
    return this.serializeCombo(combo);
  }

  // ── Combo đang bán (cho Customer App) ──
  async getActiveByStore(storeId: number) {
    const combos = await this.comboRepo.find({
      where: { store_id: storeId, is_active: true },
      relations: ['items', 'items.product', 'items.product.variants', 'items.product.options', 'items.default_variant'],
      order: { priority: 'ASC', created_at: 'DESC' },
    });

    // Lọc chỉ combo có tất cả sản phẩm còn available
    return combos
      .filter((c) => c.items.every((item) => item.product?.is_available))
      .map((c) => this.serializeComboWithProducts(c));
  }

  // ── Cập nhật combo ──
  async update(id: number, dto: UpdateComboDto) {
    const combo = await this.comboRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!combo) {
      throw new NotFoundException('Combo không tồn tại');
    }

    // Cập nhật fields cơ bản
    if (dto.name !== undefined) combo.name = dto.name;
    if (dto.description !== undefined) combo.description = dto.description;
    if (dto.image_url !== undefined) combo.image_url = dto.image_url;
    if (dto.combo_price !== undefined) combo.combo_price = dto.combo_price;
    if (dto.is_active !== undefined) combo.is_active = dto.is_active;
    if (dto.priority !== undefined) combo.priority = dto.priority;

    // Nếu cập nhật items → xóa cũ, tạo mới + tính lại original_price
    if (dto.items && dto.items.length > 0) {
      await this.comboItemRepo.delete({ combo_id: id });

      let originalPrice = 0;
      for (const item of dto.items) {
        const product = await this.productRepo.findOne({
          where: { id: item.product_id },
        });
        if (product) {
          originalPrice += Number(product.base_price) * (item.quantity || 1);
        }
      }
      combo.original_price = originalPrice;

      combo.items = [];
      for (const item of dto.items) {
        const comboItem = this.comboItemRepo.create({
          combo_id: id,
          product_id: item.product_id,
          default_variant_id: item.default_variant_id || undefined,
          quantity: item.quantity || 1,
        });
        await this.comboItemRepo.save(comboItem);
      }
    }

    await this.comboRepo.save(combo);
    return this.findOne(id);
  }

  // ── Xóa combo ──
  async remove(id: number) {
    const combo = await this.comboRepo.findOne({ where: { id } });
    if (!combo) {
      throw new NotFoundException('Combo không tồn tại');
    }
    await this.comboRepo.remove(combo);
    return { message: 'Đã xóa combo' };
  }

  // ── Helper: Serialize cơ bản ──
  private serializeCombo(combo: Combo) {
    const comboPrice = Number(combo.combo_price);
    const originalPrice = Number(combo.original_price);
    const savePercent = originalPrice > 0
      ? Math.round((1 - comboPrice / originalPrice) * 100)
      : 0;

    return {
      id: combo.id,
      store_id: combo.store_id,
      name: combo.name,
      description: combo.description,
      image_url: combo.image_url,
      combo_price: comboPrice,
      original_price: originalPrice,
      save_percent: savePercent,
      is_active: combo.is_active,
      priority: combo.priority,
      items: (combo.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        product_image: item.product?.image_url || null,
        default_variant_id: item.default_variant_id,
        quantity: item.quantity,
        base_price: item.product ? Number(item.product.base_price) : 0,
      })),
      created_at: combo.created_at instanceof Date ? combo.created_at.toISOString() : combo.created_at,
      updated_at: combo.updated_at instanceof Date ? combo.updated_at.toISOString() : combo.updated_at,
    };
  }

  // ── Helper: Serialize với đầy đủ variants/options (cho Customer) ──
  private serializeComboWithProducts(combo: Combo) {
    const base = this.serializeCombo(combo);
    return {
      ...base,
      items: (combo.items || []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product?.name || '',
        product_image: item.product?.image_url || null,
        default_variant_id: item.default_variant_id,
        quantity: item.quantity,
        base_price: item.product ? Number(item.product.base_price) : 0,
        variants: (item.product?.variants || []).map((v) => ({
          id: v.id,
          variant_name: v.variant_name,
          price_adjustment: Number(v.price_adjustment),
          is_default: v.is_default,
        })),
        options: (item.product?.options || []).map((o) => ({
          id: o.id,
          option_name: o.option_name,
          option_type: o.option_type,
          price: Number(o.price),
        })),
      })),
    };
  }
}
