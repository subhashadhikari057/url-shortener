import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);
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

  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start. Check your database settings.');
  logger.error(error);
  process.exit(1);
});
