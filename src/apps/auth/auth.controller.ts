import { AuthService } from '@/apps/auth/auth.service';
import { LoginDto } from '@/apps/auth/dto/login-auth.dto';
import { AuthGuard } from '@/apps/auth/guard/auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  user(@Req() request: Request) {
    return this.authService.user(request);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.logout(response);
  }
}
