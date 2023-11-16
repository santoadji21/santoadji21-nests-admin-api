import { AuthGuard } from '@/apps/auth/guard/auth.guard';
import { User } from '@/apps/users/entities/user.entity';
import { UsersController } from '@/apps/users/users.controller';
import { UsersService } from '@/apps/users/users.service';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';
import { Module } from '@nestjs/common';

import { Role } from '@/apps/role/entities/role.entity';
import { RoleService } from '@/apps/role/role.service';
import { RoleGuard } from '@/common/guards/role.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from '@/apps/permission/permission.service';
import { Permission } from '@/apps/permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
    JwtCommonModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthGuard,
    RoleService,
    RoleGuard,
    PermissionService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
