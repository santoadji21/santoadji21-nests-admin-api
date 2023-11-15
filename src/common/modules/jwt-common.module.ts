import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [],
  providers: [JwtService],
  exports: [JwtModule],
})
export class JwtCommonModule {}
