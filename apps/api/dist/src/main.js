// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { join } from 'node:path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: '*', credentials: true });
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
    await app.listen(8080, '0.0.0.0');
}
bootstrap();
