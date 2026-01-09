import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { services } from './services';
import { controllers } from './controllers';
import { configurations } from './constants';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: configurations().redisHost,
        port: 6379,
        password: configurations().redisPassword,
      },
    }),
    BullBoardModule.forRoot({
      route: '/bull-board',
      adapter: ExpressAdapter,
    }),
    BullModule.registerQueue({
      name: 'paymentQueue',
    }),
    BullBoardModule.forFeature({
      name: 'paymentQueue',
      adapter: BullMQAdapter
    }),
    BullModule.registerQueue({
      name: 'paymentRetryQueue',
    }),
    BullBoardModule.forFeature({
      name: 'paymentRetryQueue',
      adapter: BullMQAdapter
    }),
  ],
  controllers: [AppController, ...controllers],
  providers: [AppService, ...services],
})
export class AppModule {}
