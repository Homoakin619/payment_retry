import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PaymentService } from "src/payments/payment.service";

@Processor('paymentRetryQueue')
export class PaymentRetryQueueConsumer extends WorkerHost {
    constructor(
    private readonly paymentService: PaymentService,
    
    ) {
        super()
    }

    async process(job) {
        try{
            const { userId } = job.data
            await this.paymentService.processPaymentRetry(userId)
        } catch(error) {
            console.log(error)
        }
     
    }

}



