import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
  });

  // Kiểm tra dữ liệu đầu vào bằng DTO; loại bỏ trường lạ client gửi lên (VD: price, total, role)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap(function collect(e): string[] {
          return [...Object.values(e.constraints ?? {}), ...(e.children ?? []).flatMap(collect)];
        });
        return new BadRequestException({ statusCode: 400, message: messages[0] ?? 'Dữ liệu không hợp lệ', errors: messages });
      },
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`GICUNGCO API đang chạy tại http://localhost:${port}/api`);
}
await bootstrap();
