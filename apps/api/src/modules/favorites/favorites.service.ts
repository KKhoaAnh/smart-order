import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../database/entities/favorite.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ── Thêm yêu thích ──
  async create(customerId: number, productId: number) {
    // Kiểm tra sản phẩm tồn tại
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Kiểm tra đã yêu thích chưa
    const existing = await this.favoriteRepo.findOne({
      where: { customer_id: customerId, product_id: productId },
    });
    if (existing) {
      throw new ConflictException('Sản phẩm đã có trong danh sách yêu thích');
    }

    const favorite = this.favoriteRepo.create({
      customer_id: customerId,
      product_id: productId,
    });

    return this.favoriteRepo.save(favorite);
  }

  // ── Bỏ yêu thích ──
  async remove(customerId: number, productId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: { customer_id: customerId, product_id: productId },
    });
    if (!favorite) {
      throw new NotFoundException('Không tìm thấy trong danh sách yêu thích');
    }

    await this.favoriteRepo.remove(favorite);
    return { message: 'Đã bỏ yêu thích' };
  }

  // ── Lấy danh sách yêu thích ──
  async getAll(customerId: number) {
    const favorites = await this.favoriteRepo.find({
      where: { customer_id: customerId },
      relations: [
        'product',
        'product.category',
        'product.variants',
      ],
      order: { created_at: 'DESC' },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      product_id: fav.product_id,
      created_at: fav.created_at,
      product: fav.product
        ? {
            id: fav.product.id,
            name: fav.product.name,
            description: fav.product.description,
            base_price: Number(fav.product.base_price),
            image_url: fav.product.image_url,
            is_available: fav.product.is_available,
            is_popular: fav.product.is_popular,
            category_name: fav.product.category?.name,
            variants: fav.product.variants?.map((v) => ({
              id: v.id,
              name: v.variant_name,
              price_adjustment: Number(v.price_adjustment),
              is_default: v.is_default,
            })),
          }
        : null,
    }));
  }

  // ── Lấy danh sách product_id yêu thích (dùng cho check nhanh) ──
  async getFavoriteProductIds(customerId: number): Promise<number[]> {
    const favorites = await this.favoriteRepo.find({
      where: { customer_id: customerId },
      select: ['product_id'],
    });
    return favorites.map((f) => f.product_id);
  }
}
