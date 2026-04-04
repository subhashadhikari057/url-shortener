import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const allowedOrigin = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const dataSource = app.get(DataSource);
  const redisService = app.get(RedisService);
  const port = Number(configService.get<string>('PORT', '3000'));
  const databaseHost = configService.get<string>('DATABASE_HOST', 'localhost');
  const databasePort = Number(
    configService.get<string>('DATABASE_PORT', '5432'),
  );
  const databaseName = configService.get<string>(
    'DATABASE_NAME',
    'url_shortener',
  );

  if (dataSource.isInitialized) {
    logger.log(
      `Database connected: postgres://${databaseHost}:${databasePort}/${databaseName}`,
    );
  }

  const redisStatus = await redisService.ping();
  if (redisStatus === 'PONG') {
    logger.log('Redis connected: Upstash REST API is reachable');
  } else {
    logger.warn('Redis is configured, but did not return PONG');
  }

  await app.listen(port);
  logger.log(`CORS enabled for frontend origin ${allowedOrigin}`);
  logger.log(`Application is running on port ${port}`);
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start. Check your database settings.');
  logger.error(error);
  process.exit(1);
});
