import { PaymentService } from "./payments/payment.service";
import PrismaService from "./prisma/prisma.service";
import { BasePaymentProvider } from "./providers/base.provider";
import { PaystackProvider } from "./providers/paystack.provider";
import { PaymentQueueConsumer } from "./queues/consumers/payment.consumer";
import { PaymentRetryQueueConsumer } from "./queues/consumers/paymentRetry.consumer";
import { PaymentRetryQueueProducer } from "./queues/producers/payment-retry.queue";
import { PaymentQueueProducer } from "./queues/producers/payment.queue";


export const services = [
    PrismaService,
    PaystackProvider,
    BasePaymentProvider,
    PaymentService,
    PaymentQueueConsumer,
    PaymentRetryQueueConsumer,
    PaymentRetryQueueProducer,
    PaymentQueueProducer,
]