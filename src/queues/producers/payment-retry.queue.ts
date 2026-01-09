import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { ProcessPaymentPayload } from "src/types/payment.interface";

@Injectable()
export class PaymentRetryQueueProducer {
  constructor(@InjectQueue('paymentRetryQueue') private readonly paymentRetryQueue) {}

  async queuePayment(payload: ProcessPaymentPayload) {
    const jobId = `retry-${payload.userId}-payment`;
    const existingJob = await this.paymentRetryQueue.getJob(jobId);
    
    if (existingJob) {
      if(existingJob.isCompleted() || existingJob.isFailed()) {
        await this.paymentRetryQueue.add('retryUserPayment', payload, {
          jobId: jobId,
          delay: timeToMilliseconds({time: 5, unit: 'minutes'}),
        });
        return
      }
    }
    
    await this.paymentRetryQueue.add('retryUserPayment', payload, {
      jobId: jobId,
      delay: timeToMilliseconds({time: 5, unit: 'minutes'}),
    });    
  }
}

interface PaymentQueueProducerPayload {
  userId: string
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

