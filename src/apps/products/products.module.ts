import { Permission } from '@/apps/permission/entities/permission.entity';
import { PermissionService } from '@/apps/permission/permission.service';
import { Product } from '@/apps/products/entities/product.entity';
import { ProductsController } from '@/apps/products/products.controller';
import { ProductsService } from '@/apps/products/products.service';
import { Role } from '@/apps/role/entities/role.entity';
import { RoleService } from '@/apps/role/role.service';
import { User } from '@/apps/users/entities/user.entity';
import { UsersService } from '@/apps/users/users.service';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Role, Permission]),
    JwtCommonModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    UsersService,
    JwtService,
    RoleService,
    PermissionService,
  ],
})
export class ProductsModule {}
