import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const GetUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const jwtService = new JwtService({ secret: 'secret' });

    const jwtToken = request.cookies['access_token'];
    if (!jwtToken) {
      return null;
    }

    try {
      const payload = jwtService.verify(jwtToken);
      return payload.id;
    } catch (error) {
      return null;
    }
  },
);
