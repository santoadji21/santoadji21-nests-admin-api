import { AuthController } from '@/apps/auth/auth.controller';
import { AuthService } from '@/apps/auth/auth.service';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';
import { UsersModule } from '@/apps/users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [UsersModule, JwtCommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
