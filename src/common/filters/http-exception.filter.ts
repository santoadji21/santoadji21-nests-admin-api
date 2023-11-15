import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Custom error response structure
    response.status(status).json({
      success: false,
      message:
        (exceptionResponse as any).message || 'An unexpected error occurred',
      errorCode: status,
      data: (exceptionResponse as any).data || null,
    });
  }
}
