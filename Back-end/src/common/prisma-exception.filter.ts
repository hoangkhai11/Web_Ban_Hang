import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/** Chuyển lỗi Prisma thường gặp thành mã HTTP dễ hiểu thay vì lỗi 500. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const map: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, 'Dữ liệu bị trùng (giá trị duy nhất đã tồn tại)'],
      P2003: [HttpStatus.CONFLICT, 'Không thể thực hiện vì dữ liệu đang được tham chiếu'],
      P2025: [HttpStatus.NOT_FOUND, 'Không tìm thấy dữ liệu'],
    };
    const [statusCode, message] = map[e.code] ?? [HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi cơ sở dữ liệu'];
    res.status(statusCode).json({ statusCode, message });
  }
}
