import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwt = request.cookies['access_token'];

    if (!jwt) {
      throw new UnauthorizedException('Invalid token provided');
    }
    try {
      const data = this.jwtService.verify(jwt);
      return Boolean(data);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access token');
    }
  }
}
