import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PaymentService } from "src/payments/payment.service";

@Processor('paymentQueue')
export class PaymentQueueConsumer extends WorkerHost {
    constructor(
    private readonly paymentService: PaymentService,
    
    ) {
        super()
    }

    async process(job) {
        try{
            await this.paymentService.processUserPayment(job.data)
        } catch(error) {
            console.log(error)
        }
     
    }

}



