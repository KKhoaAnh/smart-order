// ============================================================
// Smart Order QR — Database Seed Runner
// Chạy: npm run seed (từ apps/api)
// ============================================================

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Store } from '../entities/store.entity';
import { Table } from '../entities/table.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Option } from '../entities/option.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'smart_order_user',
    password: process.env.DB_PASSWORD || 'smart_order_pass_2026',
    database: process.env.DB_DATABASE || 'smart_order_db',
    entities: [path.resolve(__dirname, '../entities/**/*.entity{.ts,.js}')],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  console.log('📦 Database connected. Starting seed...');

  const storeRepo = dataSource.getRepository(Store);
  const tableRepo = dataSource.getRepository(Table);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const optionRepo = dataSource.getRepository(Option);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const variantRepo = dataSource.getRepository(ProductVariant);

  // ── 1. Tạo Store ──
  let store = await storeRepo.findOne({ where: { id: 1 } });
  if (!store) {
    store = new Store();
    store.name = 'Coffee House Demo';
    store.address = '123 Nguyễn Huệ, Quận 1, TP.HCM';
    store.phone = '0909 123 456';
    store.opening_hours = '07:00 - 22:00';
    store.status = 'ACTIVE';
    store = await storeRepo.save(store);
    console.log('✅ Store created:', store.name);
  }

  // ── 2. Tạo 10 Bàn ──
  const existingTables = await tableRepo.count();
  if (existingTables === 0) {
    const areas = ['Trong nhà', 'Trong nhà', 'Trong nhà', 'Trong nhà', 'Trong nhà',
                    'Ngoài trời', 'Ngoài trời', 'Ngoài trời', 'VIP', 'VIP'];
    const capacities = [2, 2, 4, 4, 6, 2, 4, 4, 6, 8];

    for (let i = 1; i <= 10; i++) {
      const t = new Table();
      t.store_id = store.id;
      t.table_number = `Bàn ${i}`;
      t.qr_code_token = `table_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      t.capacity = capacities[i - 1];
      t.area = areas[i - 1];
      t.status = 'AVAILABLE';
      await tableRepo.save(t);
    }
    console.log('✅ 10 tables created');
  }

  // ── 3. Tạo Roles ──
  const roleNames = ['Admin', 'Cashier', 'Kitchen', 'Waiter'];
  for (const roleName of roleNames) {
    const exists = await roleRepo.findOne({ where: { role_name: roleName } });
    if (!exists) {
      const r = new Role();
      r.role_name = roleName;
      await roleRepo.save(r);
    }
  }
  console.log('✅ Roles seeded: Admin, Cashier, Kitchen, Waiter');

  // ── 4. Tạo Users ──
  const adminExists = await userRepo.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const adminRole = await roleRepo.findOne({ where: { role_name: 'Admin' } });
    const cashierRole = await roleRepo.findOne({ where: { role_name: 'Cashier' } });
    const kitchenRole = await roleRepo.findOne({ where: { role_name: 'Kitchen' } });

    // Admin (có cả quyền Admin + Cashier)
    const admin = new User();
    admin.store_id = store.id;
    admin.username = 'admin';
    admin.password_hash = await bcrypt.hash('admin123', 10);
    admin.full_name = 'Quản trị viên';
    admin.phone = '0909 111 111';
    admin.is_active = true;
    admin.roles = [adminRole!, cashierRole!];
    await userRepo.save(admin);

    // Bếp
    const kitchen = new User();
    kitchen.store_id = store.id;
    kitchen.username = 'kitchen';
    kitchen.password_hash = await bcrypt.hash('kitchen123', 10);
    kitchen.full_name = 'Đầu bếp';
    kitchen.phone = '0909 222 222';
    kitchen.is_active = true;
    kitchen.roles = [kitchenRole!];
    await userRepo.save(kitchen);

    // Thu ngân
    const cashier = new User();
    cashier.store_id = store.id;
    cashier.username = 'cashier';
    cashier.password_hash = await bcrypt.hash('cashier123', 10);
    cashier.full_name = 'Thu ngân';
    cashier.phone = '0909 333 333';
    cashier.is_active = true;
    cashier.roles = [cashierRole!];
    await userRepo.save(cashier);

    console.log('✅ Users: admin/admin123, kitchen/kitchen123, cashier/cashier123');
  }

  // ── 5. Tạo Options ──
  const existingOptions = await optionRepo.count();
  if (existingOptions === 0) {
    const optionData = [
      { option_name: '100% đường', option_type: 'sugar' as const, price: 0 },
      { option_name: '70% đường', option_type: 'sugar' as const, price: 0 },
      { option_name: '50% đường', option_type: 'sugar' as const, price: 0 },
      { option_name: '0% đường', option_type: 'sugar' as const, price: 0 },
      { option_name: '100% đá', option_type: 'ice' as const, price: 0 },
      { option_name: '70% đá', option_type: 'ice' as const, price: 0 },
      { option_name: '50% đá', option_type: 'ice' as const, price: 0 },
      { option_name: 'Không đá', option_type: 'ice' as const, price: 0 },
      { option_name: 'Trân châu đen', option_type: 'topping' as const, price: 5000 },
      { option_name: 'Trân châu trắng', option_type: 'topping' as const, price: 5000 },
      { option_name: 'Thạch dừa', option_type: 'topping' as const, price: 5000 },
      { option_name: 'Pudding', option_type: 'topping' as const, price: 8000 },
      { option_name: 'Kem cheese', option_type: 'topping' as const, price: 10000 },
      { option_name: 'Shot Espresso', option_type: 'topping' as const, price: 10000 },
    ];
    for (const od of optionData) {
      const o = new Option();
      o.option_name = od.option_name;
      o.option_type = od.option_type;
      o.price = od.price;
      await optionRepo.save(o);
    }
    console.log('✅ 14 options created (sugar, ice, topping)');
  }

  // ── 6. Tạo Categories & Products ──
  const existingCategories = await categoryRepo.count();
  if (existingCategories === 0) {
    const allOptions = await optionRepo.find();
    const sugarOpts = allOptions.filter((o) => o.option_type === 'sugar');
    const iceOpts = allOptions.filter((o) => o.option_type === 'ice');
    const toppingOpts = allOptions.filter((o) => o.option_type === 'topping');
    const drinkOpts = [...sugarOpts, ...iceOpts, ...toppingOpts];

    // Helper tạo sản phẩm
    const createProduct = async (
      catId: number, data: any, options: Option[], sizes?: { name: string; adj: number; def: boolean }[]
    ) => {
      const p = new Product();
      p.category_id = catId;
      p.name = data.name;
      p.description = data.description;
      p.base_price = data.base_price;
      p.is_available = true;
      p.is_popular = data.is_popular || false;
      p.preparation_time = data.preparation_time || 5;
      p.options = options;
      const saved = await productRepo.save(p);

      if (sizes) {
        for (const s of sizes) {
          const v = new ProductVariant();
          v.product_id = saved.id;
          v.variant_name = s.name;
          v.price_adjustment = s.adj;
          v.is_default = s.def;
          await variantRepo.save(v);
        }
      }
      return saved;
    };

    const sml = [
      { name: 'Size S', adj: 0, def: true },
      { name: 'Size M', adj: 6000, def: false },
      { name: 'Size L', adj: 12000, def: false },
    ];
    const ml = [
      { name: 'Size M', adj: 0, def: true },
      { name: 'Size L', adj: 6000, def: false },
    ];
    const mlLarge = [
      { name: 'Size M', adj: 0, def: true },
      { name: 'Size L', adj: 10000, def: false },
    ];

    // === Cà phê ===
    const c1 = new Category(); c1.store_id = store.id; c1.name = 'Cà phê'; c1.priority = 1; c1.is_active = true;
    const catCoffee = await categoryRepo.save(c1);
    await createProduct(catCoffee.id, { name: 'Cà phê sữa đá', description: 'Cà phê phin truyền thống với sữa đặc', base_price: 29000, is_popular: true, preparation_time: 5 }, drinkOpts, sml);
    await createProduct(catCoffee.id, { name: 'Cà phê đen đá', description: 'Cà phê đen nguyên chất', base_price: 25000, preparation_time: 5 }, drinkOpts, sml);
    await createProduct(catCoffee.id, { name: 'Bạc xỉu', description: 'Cà phê với nhiều sữa, vị ngọt nhẹ', base_price: 32000, is_popular: true, preparation_time: 5 }, drinkOpts, sml);
    await createProduct(catCoffee.id, { name: 'Americano', description: 'Espresso pha loãng với nước', base_price: 39000, preparation_time: 3 }, drinkOpts, sml);
    await createProduct(catCoffee.id, { name: 'Latte', description: 'Espresso với sữa tươi béo ngậy', base_price: 45000, is_popular: true, preparation_time: 5 }, drinkOpts, sml);
    await createProduct(catCoffee.id, { name: 'Cappuccino', description: 'Espresso, sữa tươi và bọt sữa mịn', base_price: 45000, preparation_time: 5 }, drinkOpts, sml);
    console.log('✅ Cà phê: 6 sản phẩm');

    // === Trà ===
    const c2 = new Category(); c2.store_id = store.id; c2.name = 'Trà'; c2.priority = 2; c2.is_active = true;
    const catTea = await categoryRepo.save(c2);
    await createProduct(catTea.id, { name: 'Trà đào cam sả', description: 'Trà đào thơm mát với cam tươi và sả', base_price: 39000, is_popular: true, preparation_time: 5 }, drinkOpts, ml);
    await createProduct(catTea.id, { name: 'Trà vải', description: 'Trà xanh với vải thiều tươi', base_price: 39000, preparation_time: 5 }, drinkOpts, ml);
    await createProduct(catTea.id, { name: 'Trà sen vàng', description: 'Trà ướp hương sen thanh mát', base_price: 35000, preparation_time: 5 }, drinkOpts, ml);
    await createProduct(catTea.id, { name: 'Hồng trà sữa', description: 'Hồng trà thơm với sữa tươi', base_price: 39000, is_popular: true, preparation_time: 5 }, drinkOpts, ml);
    console.log('✅ Trà: 4 sản phẩm');

    // === Freeze ===
    const c3 = new Category(); c3.store_id = store.id; c3.name = 'Freeze'; c3.priority = 3; c3.is_active = true;
    const catFreeze = await categoryRepo.save(c3);
    await createProduct(catFreeze.id, { name: 'Freeze Trà xanh', description: 'Đá xay trà xanh matcha béo ngậy', base_price: 49000, is_popular: true, preparation_time: 7 }, toppingOpts, mlLarge);
    await createProduct(catFreeze.id, { name: 'Freeze Socola', description: 'Đá xay socola đậm đà', base_price: 49000, preparation_time: 7 }, toppingOpts, mlLarge);
    await createProduct(catFreeze.id, { name: 'Freeze Cookie & Cream', description: 'Đá xay cookie với kem vanilla', base_price: 55000, preparation_time: 7 }, toppingOpts, mlLarge);
    console.log('✅ Freeze: 3 sản phẩm');

    // === Bánh & Snack ===
    const c4 = new Category(); c4.store_id = store.id; c4.name = 'Bánh & Snack'; c4.priority = 4; c4.is_active = true;
    const catFood = await categoryRepo.save(c4);
    await createProduct(catFood.id, { name: 'Bánh mì ốp la', description: 'Bánh mì nóng giòn với trứng ốp la', base_price: 25000, is_popular: true, preparation_time: 10 }, []);
    await createProduct(catFood.id, { name: 'Croissant bơ', description: 'Bánh sừng trâu bơ Pháp', base_price: 30000, preparation_time: 5 }, []);
    await createProduct(catFood.id, { name: 'Mousse Tiramisu', description: 'Bánh mousse tiramisu mềm mịn', base_price: 35000, preparation_time: 3 }, []);
    await createProduct(catFood.id, { name: 'Khoai tây chiên', description: 'Khoai tây chiên giòn với sốt mayo', base_price: 35000, is_popular: true, preparation_time: 10 }, []);
    console.log('✅ Bánh & Snack: 4 sản phẩm');

    // === Nước ép ===
    const c5 = new Category(); c5.store_id = store.id; c5.name = 'Nước ép & Sinh tố'; c5.priority = 5; c5.is_active = true;
    const catJuice = await categoryRepo.save(c5);
    const juiceOpts = [...sugarOpts, ...iceOpts];
    await createProduct(catJuice.id, { name: 'Nước ép cam', description: 'Cam tươi ép nguyên chất', base_price: 35000, preparation_time: 5 }, juiceOpts, ml);
    await createProduct(catJuice.id, { name: 'Sinh tố bơ', description: 'Sinh tố bơ sáp béo ngậy', base_price: 39000, is_popular: true, preparation_time: 5 }, juiceOpts, ml);
    await createProduct(catJuice.id, { name: 'Nước ép dưa hấu', description: 'Dưa hấu tươi ép mát lạnh', base_price: 30000, preparation_time: 5 }, juiceOpts, ml);
    console.log('✅ Nước ép & Sinh tố: 3 sản phẩm');
  }

  // ── Done ──
  console.log('\n🎉 Seed completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - 1 Store: ${store.name}`);
  console.log(`   - ${await tableRepo.count()} Tables`);
  console.log(`   - ${await roleRepo.count()} Roles`);
  console.log(`   - ${await userRepo.count()} Users`);
  console.log(`   - ${await categoryRepo.count()} Categories`);
  console.log(`   - ${await productRepo.count()} Products`);
  console.log(`   - ${await variantRepo.count()} Variants`);
  console.log(`   - ${await optionRepo.count()} Options`);

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
