import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';
import { Customer } from '../../database/entities/customer.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(customerId: number, dto: CreateReviewDto) {
    // Check if customer already reviewed this product → update instead
    let review = await this.reviewRepo.findOne({
      where: { customer_id: customerId, product_id: dto.product_id },
    });

    if (review) {
      review.rating = dto.rating;
      review.comment = dto.comment ?? review.comment;
      review.order_id = dto.order_id ?? review.order_id;
      review = await this.reviewRepo.save(review);
    } else {
      review = this.reviewRepo.create({
        customer_id: customerId,
        ...dto,
      });
      review = await this.reviewRepo.save(review);
    }

    await this.recalculateProductStats(dto.product_id);

    return this.reviewRepo.findOne({
      where: { id: review.id },
      relations: ['customer'],
    });
  }

  async getByProduct(productId: number, page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { product_id: productId, is_visible: true },
      relations: ['customer'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSummary(productId: number) {
    const reviews = await this.reviewRepo.find({
      where: { product_id: productId, is_visible: true },
      select: ['rating'],
    });

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    for (const review of reviews) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      totalRating += review.rating;
    }

    const totalCount = reviews.length;

    return {
      avg_rating: totalCount > 0 ? +(totalRating / totalCount).toFixed(1) : 0,
      total_count: totalCount,
      distribution,
    };
  }

  async getByStore(storeId: number) {
    return this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.customer', 'customer')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoin('product.category', 'category')
      .where('category.store_id = :storeId', { storeId })
      .orderBy('review.created_at', 'DESC')
      .getMany();
  }

  async toggleVisibility(reviewId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    review.is_visible = !review.is_visible;
    const updated = await this.reviewRepo.save(review);

    await this.recalculateProductStats(review.product_id);

    return updated;
  }

  async delete(reviewId: number, customerId?: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }

    if (customerId && review.customer_id !== customerId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    const productId = review.product_id;
    await this.reviewRepo.remove(review);
    await this.recalculateProductStats(productId);

    return { deleted: true };
  }

  private async recalculateProductStats(productId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.is_visible = true')
      .getRawOne();

    await this.productRepo.update(productId, {
      avg_rating: result.avg ? +parseFloat(result.avg).toFixed(1) : 0,
      review_count: +result.count || 0,
    });
  }
}
