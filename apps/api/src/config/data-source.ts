import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env từ root monorepo hoặc local
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'smart_order_user',
  password: process.env.DB_PASSWORD || 'smart_order_pass_2026',
  database: process.env.DB_DATABASE || 'smart_order_db',
  entities: [path.resolve(__dirname, '../database/entities/**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
