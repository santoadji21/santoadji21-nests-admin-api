import { AuthController } from '@/apps/auth/auth.controller';
import { AuthService } from '@/apps/auth/auth.service';
import { JwtCommonModule } from '@/common/modules/jwt-common.module';
import { UsersModule } from '@/apps/users/users.module';
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => UsersModule), JwtCommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
