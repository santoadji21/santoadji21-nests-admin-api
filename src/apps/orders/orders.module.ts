import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/apps/orders/entities/order.entity';
import { OrderItem } from '@/apps/orders/entities/order-item';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), JwtCommonModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
