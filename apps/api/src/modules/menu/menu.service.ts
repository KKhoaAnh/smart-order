import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Option } from '../../database/entities/option.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
  ) {}

  // ── Categories ──

  async getCategories(storeId: number) {
    return this.categoryRepo.find({
      where: { store_id: storeId },
      order: { priority: 'ASC' },
    });
  }

  async createCategory(storeId: number, dto: CreateCategoryDto) {
    const category = new Category();
    category.store_id = storeId;
    category.name = dto.name;
    category.priority = dto.priority ?? 0;
    category.is_active = dto.is_active ?? true;
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const result = await this.categoryRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Danh mục không tồn tại');
    return { message: 'Đã xóa danh mục' };
  }

  // ── Products ──

  async getFullMenu(storeId: number) {
    const categories = await this.categoryRepo.find({
      where: { store_id: storeId, is_active: true },
      order: { priority: 'ASC' },
    });

    const menu = [];
    for (const cat of categories) {
      const products = await this.productRepo.find({
        where: { category_id: cat.id },
        relations: ['variants', 'options'],
        order: { is_popular: 'DESC', name: 'ASC' },
      });
      menu.push({
        ...cat,
        products: products.map((p) => ({
          ...p,
          base_price: Number(p.base_price),
          avg_rating: Number(p.avg_rating) || 0,
          review_count: p.review_count || 0,
          variants: p.variants.map((v) => ({ ...v, price_adjustment: Number(v.price_adjustment) })),
          options: p.options.map((o) => ({ ...o, price: Number(o.price) })),
        })),
      });
    }
    return menu;
  }

  async getProduct(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variants', 'options', 'category'],
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const product = new Product();
    product.category_id = dto.category_id;
    product.name = dto.name;
    product.description = dto.description || '';
    product.base_price = dto.base_price;
    product.image_url = dto.image_url || '';
    product.is_available = dto.is_available ?? true;
    product.is_popular = dto.is_popular ?? false;
    product.preparation_time = dto.preparation_time ?? 5;

    if (dto.option_ids && dto.option_ids.length > 0) {
      product.options = await this.optionRepo.find({ where: { id: In(dto.option_ids) } });
    }

    const saved = await this.productRepo.save(product);

    if (dto.variants && dto.variants.length > 0) {
      for (const v of dto.variants) {
        const variant = new ProductVariant();
        variant.product_id = saved.id;
        variant.variant_name = v.variant_name;
        variant.price_adjustment = v.price_adjustment;
        variant.is_default = v.is_default ?? false;
        await this.variantRepo.save(variant);
      }
    }

    return this.getProduct(saved.id);
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['options'] });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');

    if (dto.category_id !== undefined) product.category_id = dto.category_id;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.base_price !== undefined) product.base_price = dto.base_price;
    if (dto.image_url !== undefined) product.image_url = dto.image_url;
    if (dto.is_available !== undefined) product.is_available = dto.is_available;
    if (dto.is_popular !== undefined) product.is_popular = dto.is_popular;
    if (dto.preparation_time !== undefined) product.preparation_time = dto.preparation_time;

    if (dto.option_ids) {
      product.options = await this.optionRepo.find({ where: { id: In(dto.option_ids) } });
    }

    await this.productRepo.save(product);
    return this.getProduct(id);
  }

  async toggleAvailability(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    product.is_available = !product.is_available;
    return this.productRepo.save(product);
  }

  async deleteProduct(id: number) {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Sản phẩm không tồn tại');
    return { message: 'Đã xóa sản phẩm' };
  }

  // ── Options ──

  async getAllOptions() {
    return this.optionRepo.find({ order: { option_type: 'ASC', option_name: 'ASC' } });
  }
}
