import { LoginDto } from '@/apps/auth/dto/login-auth.dto';
import { UsersService } from '@/apps/users/users.service';
import { JwtPayload } from '@/common/types/jwt-payload.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto, response: Response) {
    const { data } = await this.usersService.findByEmail(loginDto.email);

    if (!data) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      data.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: data.id,
      role: data.role.id ?? 2,
    };

    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 7);

    response.cookie('access_token', this.jwtService.sign(payload), {
      httpOnly: true,
      expires: expiresIn,
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async user(request: Request) {
    const access_token = request.cookies['access_token'];
    if (!access_token) {
      throw new NotFoundException('User not found');
    }
    const data = await this.jwtService.verifyAsync(access_token);
    const user = await this.usersService.findOne(data.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async logout(response: Response) {
    response.clearCookie('access_token');
    return {
      message: 'success',
    };
  }
}
