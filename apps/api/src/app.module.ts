import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// ── Global Providers ──
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// ── Feature Modules ──
import { AuthModule } from './modules/auth/auth.module';
import { StoreModule } from './modules/store/store.module';
import { TablesModule } from './modules/tables/tables.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    // ── Environment Configuration ──
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // ── Database (TypeORM + PostgreSQL) ──
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'smart_order_user'),
        password: configService.get<string>('DB_PASSWORD', 'smart_order_pass_2026'),
        database: configService.get<string>('DB_DATABASE', 'smart_order_db'),
        entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // ── WebSocket (Global) ──
    WebsocketModule,

    // ── Feature Modules ──
    AuthModule,
    StoreModule,
    TablesModule,
    SessionsModule,
    MenuModule,
    OrdersModule,
    ServiceRequestsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    // Global Exception Filter — chuẩn hóa error response
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global Response Interceptor — wrap response { success, data, timestamp }
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
