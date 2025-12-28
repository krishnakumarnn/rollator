// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { join } from 'node:path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: '*', credentials: true });
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
    const port = Number(process.env.PORT || 8080);
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
}
bootstrap();
