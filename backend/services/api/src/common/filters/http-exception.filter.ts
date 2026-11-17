import type {
  ExceptionFilter,
  ArgumentsHost} from '@nestjs/common';
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

type ErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  requestId?: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest & { requestId?: string }>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = isHttp ? exception.getResponse() : 'Internal server error';

    const message =
      typeof raw === 'string'
        ? raw
        : typeof raw === 'object' && raw !== null && 'message' in raw
          ? (raw as { message: string | string[] }).message
          : 'Unexpected error';

    const body: ErrorBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
      path: request.url,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { requestId: request.requestId, path: request.url, status },
        isHttp ? exception.message : 'Unhandled exception',
      );
    }

    void response.status(status).send(body);
  }
}