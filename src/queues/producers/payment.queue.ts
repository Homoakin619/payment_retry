import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentQueueProducer {
  constructor(@InjectQueue('paymentQueue') private readonly paymentQueue) {}

  async queueUserPayment(payload: PaymentQueueProducerPayload) {
    const jobId = `pay-${payload.userId}`;
    const existingJob = await this.paymentQueue.getJob(jobId);
    
    if (existingJob) {
      if(existingJob.isCompleted() || existingJob.isFailed()) {
        await this.paymentQueue.add('payUser', payload, {
          jobId: jobId,
          delay: timeToMilliseconds({time: 5, unit: 'minutes'}),
        });
        return
      }
      
    }
    
    await this.paymentQueue.add('payUser', payload, {
      jobId: jobId,
      delay: timeToMilliseconds({time: 5, unit: 'minutes'}),
    });    
  }
}

interface PaymentQueueProducerPayload {
  userId: string
  narration: string
}

interface TimeInterface {
  time: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

function timeToMilliseconds({time, unit}: TimeInterface) {
  if (unit === 'seconds') {
    return time * 1000;
  }
  if (unit === 'minutes') {
    return time * 1000 * 60;
  }
  if (unit === 'hours') {
    return time * 1000 * 60 * 60;
  }
  if (unit === 'days') {
    return time * 1000 * 60 * 60 * 24;
  }
}

