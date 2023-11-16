import { Permission } from '@/apps/permission/entities/permission.entity';
import { PermissionService } from '@/apps/permission/permission.service';
import { Role } from '@/apps/role/entities/role.entity';
import { RoleController } from '@/apps/role/role.controller';
import { RoleService } from '@/apps/role/role.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RoleController],
  providers: [RoleService, PermissionService],
  exports: [RoleService],
})
export class RoleModule {}
