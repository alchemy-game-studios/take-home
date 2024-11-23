import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { error } from 'express-openapi-validator';

@Catch(...Object.values(error))
export class OpenApiExceptionFilter implements ExceptionFilter {
  catch(error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(error.status).json(error);
  }
}
