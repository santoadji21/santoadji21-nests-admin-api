import { AuthGuard } from '@/apps/auth/guard/auth.guard';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';
import { User } from '@/apps/users/entities/user.entity';
import { UsersController } from '@/apps/users/users.controller';
import { UsersService } from '@/apps/users/users.service';
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from '@/apps/role/role.service';
import { Role } from '@/apps/role/entities/role.entity';
import { RoleGuard } from '@/common/guards/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), JwtCommonModule],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard, RoleService, RoleGuard],
  exports: [UsersService],
})
export class UsersModule {}
