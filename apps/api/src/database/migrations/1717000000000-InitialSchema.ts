import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1717000000000 implements MigrationInterface {
  name = 'InitialSchema1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Store ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stores" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(200) NOT NULL,
        "address" TEXT NOT NULL DEFAULT '',
        "phone" VARCHAR(20) NOT NULL DEFAULT '',
        "logo_url" VARCHAR(500),
        "opening_hours" VARCHAR(200),
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ── Tables ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tables" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
        "table_number" VARCHAR(50) NOT NULL,
        "qr_code_token" VARCHAR(200) NOT NULL UNIQUE,
        "capacity" INT DEFAULT 0,
        "area" VARCHAR(100) DEFAULT '',
        "status" VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_tables_store_id" ON "tables" ("store_id");
      CREATE INDEX IF NOT EXISTS "IDX_tables_qr_code_token" ON "tables" ("qr_code_token");
    `);

    // ── Table Sessions ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "table_sessions" (
        "id" SERIAL PRIMARY KEY,
        "table_id" INT NOT NULL REFERENCES "tables"("id") ON DELETE CASCADE,
        "session_token" VARCHAR(200) NOT NULL UNIQUE,
        "device_fingerprint" VARCHAR(500) DEFAULT '',
        "ip_address" VARCHAR(50) DEFAULT '',
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "opened_at" TIMESTAMP NOT NULL DEFAULT now(),
        "closed_at" TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "IDX_sessions_token" ON "table_sessions" ("session_token");
      CREATE INDEX IF NOT EXISTS "IDX_sessions_table_status" ON "table_sessions" ("table_id", "status");
    `);

    // ── Roles ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" SERIAL PRIMARY KEY,
        "role_name" VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    // ── Users ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
        "username" VARCHAR(100) NOT NULL UNIQUE,
        "password_hash" VARCHAR(200) NOT NULL,
        "full_name" VARCHAR(200) NOT NULL DEFAULT '',
        "phone" VARCHAR(20) DEFAULT '',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ── User Roles (join table) ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "user_id" INT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" INT NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        PRIMARY KEY ("user_id", "role_id")
      );
    `);

    // ── Categories ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL REFERENCES "stores"("id") ON DELETE CASCADE,
        "name" VARCHAR(100) NOT NULL,
        "priority" INT NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ── Products ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" SERIAL PRIMARY KEY,
        "category_id" INT NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "name" VARCHAR(200) NOT NULL,
        "description" TEXT DEFAULT '',
        "base_price" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "image_url" VARCHAR(500) DEFAULT '',
        "is_available" BOOLEAN NOT NULL DEFAULT true,
        "is_popular" BOOLEAN NOT NULL DEFAULT false,
        "preparation_time" INT DEFAULT 5,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_products_category" ON "products" ("category_id");
    `);

    // ── Product Variants ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_variants" (
        "id" SERIAL PRIMARY KEY,
        "product_id" INT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "variant_name" VARCHAR(100) NOT NULL,
        "price_adjustment" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "is_default" BOOLEAN NOT NULL DEFAULT false
      );
    `);

    // ── Options ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "options" (
        "id" SERIAL PRIMARY KEY,
        "option_name" VARCHAR(100) NOT NULL,
        "option_type" VARCHAR(20) NOT NULL,
        "price" DECIMAL(12,0) NOT NULL DEFAULT 0
      );
    `);

    // ── Product Options (join table) ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_options" (
        "product_id" INT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "option_id" INT NOT NULL REFERENCES "options"("id") ON DELETE CASCADE,
        PRIMARY KEY ("product_id", "option_id")
      );
    `);

    // ── Orders ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL REFERENCES "stores"("id"),
        "table_id" INT NOT NULL REFERENCES "tables"("id"),
        "session_id" INT NOT NULL REFERENCES "table_sessions"("id"),
        "order_number" VARCHAR(20) NOT NULL,
        "total_amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "order_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "payment_status" VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
        "reject_reason" TEXT DEFAULT '',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_orders_store_status" ON "orders" ("store_id", "order_status");
      CREATE INDEX IF NOT EXISTS "IDX_orders_session" ON "orders" ("session_id");
    `);

    // ── Order Items ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "product_id" INT NOT NULL REFERENCES "products"("id"),
        "variant_id" INT REFERENCES "product_variants"("id"),
        "quantity" INT NOT NULL DEFAULT 1,
        "price" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "subtotal" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "note" TEXT DEFAULT '',
        "order_round" INT NOT NULL DEFAULT 1,
        "item_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_order_items_order" ON "order_items" ("order_id");
      CREATE INDEX IF NOT EXISTS "IDX_order_items_status" ON "order_items" ("item_status");
    `);

    // ── Order Item Options ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_item_options" (
        "id" SERIAL PRIMARY KEY,
        "order_item_id" INT NOT NULL REFERENCES "order_items"("id") ON DELETE CASCADE,
        "option_id" INT NOT NULL REFERENCES "options"("id"),
        "price" DECIMAL(12,0) NOT NULL DEFAULT 0
      );
    `);

    // ── Payments ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE UNIQUE,
        "payment_method" VARCHAR(20) NOT NULL DEFAULT 'CASH',
        "amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
        "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "paid_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ── Service Requests ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_requests" (
        "id" SERIAL PRIMARY KEY,
        "table_id" INT NOT NULL REFERENCES "tables"("id"),
        "session_id" INT NOT NULL REFERENCES "table_sessions"("id"),
        "request_type" VARCHAR(20) NOT NULL,
        "message" TEXT DEFAULT '',
        "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "IDX_sr_status" ON "service_requests" ("status");
    `);

    // ── Notifications ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "store_id" INT NOT NULL REFERENCES "stores"("id"),
        "type" VARCHAR(50) NOT NULL,
        "reference_id" INT NOT NULL DEFAULT 0,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "IDX_notif_store_read" ON "notifications" ("store_id", "is_read");
    `);

    // ── Activity Logs ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES "users"("id"),
        "action" VARCHAR(100) NOT NULL,
        "entity_type" VARCHAR(50) NOT NULL DEFAULT '',
        "entity_id" INT DEFAULT 0,
        "details" JSONB,
        "ip_address" VARCHAR(50) DEFAULT '',
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_item_options" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_options" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "options" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_variants" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "table_sessions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tables" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stores" CASCADE`);
  }
}
