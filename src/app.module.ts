import { AuthModule } from '@/apps/auth/auth.module';
import { PermissionModule } from '@/apps/permission/permission.module';
import { RoleModule } from '@/apps/role/role.module';
import { UsersModule } from '@/apps/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './apps/products/products.module';
import { MinioClientModule } from './apps/minio-client/minio-client.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './apps/orders/orders.module';
import * as Joi from 'joi';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgresql',
      port: 5432,
      username: 'root',
      password: 'adminpassword',
      database: 'admindb',
      autoLoadEntities: true,
      synchronize: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    UsersModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    ProductsModule,
    MinioClientModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MINIO_ENDPOINT: Joi.string().required(),
        MINIO_PORT: Joi.number().required(),
        MINIO_ACCESS_KEY: Joi.string().required(),
        MINIO_SECRET_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
