// role.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/common/types/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies['access_token'];

    if (!jwt) {
      throw new UnauthorizedException('Invalid token provided');
    }

    try {
      const payload = this.jwtService.verify(jwt);
      return requiredRoles.some((role) => payload.role === role);
    } catch (e) {
      throw new UnauthorizedException('Unauthorized resource access');
    }
  }
}
