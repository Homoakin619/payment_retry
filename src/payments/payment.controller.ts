import { Body, Controller, Param, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { IncomingWebhookPayload } from "../types/payment.interface";

@Controller("payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post("employees")
    async payEmployees(
        @Body("employeeIds") employeeIds: string[],
        @Body("narration") narration: string
    ) {
        return await this.paymentService.payEmployees(employeeIds, narration);
    }

    @Post("webhook")
    async handleWebhook(@Body() payload: IncomingWebhookPayload) {
        return await this.paymentService.handleWebhook(payload);
    }

    @Post("retry/:transactionId")
    async retryPayment(@Param("transactionId") transactionId: string) {
        return await this.paymentService.processPaymentRetry(transactionId);
    }
}
