import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { setupBullBoard } from './bull-board.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });

  app.use(json({ limit: '3mb' }));

  const paymentQueue = app.get<Queue>(getQueueToken('paymentQueue'));
  const paymentRetryQueue = app.get<Queue>(getQueueToken('paymentRetryQueue'));
  setupBullBoard(app, [paymentQueue, paymentRetryQueue]);
  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`${process.env.NODE_ENV} app running on: ${await app.getUrl()}`);
}
bootstrap();
