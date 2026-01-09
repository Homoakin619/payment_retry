import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { IncomingWebhookPayload, ProcessPaymentPayload } from "../types/payment.interface";
import PrismaService from "src/prisma/prisma.service";
import { IBasePaymentProvider, PaymentProviderEnum, ServerTransactionStatus } from "src/types/base.provider.interface";
import { Transactions } from "@prisma/client";
import { PaymentQueueProducer } from "src/queues/producers/payment.queue";
import { generateTransactionReference, getPastDate } from "src/shared";
import { BasePaymentProvider } from "src/providers/base.provider";
import { PaymentRetryQueueProducer } from "src/queues/producers/payment-retry.queue";


@Injectable()
export class PaymentService {
    private paymentService: IBasePaymentProvider
    constructor(private prisma: PrismaService,
        private readonly paymentQueue: PaymentQueueProducer,
        private readonly paymentRetryQueue: PaymentRetryQueueProducer,
        private readonly paymentProvider: BasePaymentProvider
    ) {
        this.paymentService = this.paymentProvider.getProvider(PaymentProviderEnum.Paystack)
    }

    async handleWebhook(payload: IncomingWebhookPayload) {
        const { transactionReference, status } = payload
        const transaction = await this.prisma.transactions.findFirst({
            where: { transactionReference }
        })
        if (!transaction) {
            throw new NotFoundException("Transaction not found")
        }

        if (transaction.status === "completed") {
            return
        }

        switch (status) {
            case ServerTransactionStatus.Success:
                return await this.prisma.transactions.update({
                    where: { transactionReference },
                    data: { status: "completed" }
                })
            case ServerTransactionStatus.Failed:
                return await this.handleFailedPayment(transaction, payload)
            default:
                return null
        }
    }

    private async handleFailedPayment(transaction: Transactions, providerResponse: any) {
        try {
            const user = await this.prisma.user.findFirst({ where: { id: transaction.userId } })
            if (!user) {
                throw new BadRequestException("User not found")
            }

            await Promise.all([
                this.prisma.transactionLogs.create({
                    data: {
                        transactionId: transaction.id,
                        status: "failed",
                        providerResponse
                    }
                }),
                this.prisma.transactions.update({
                    where: { transactionReference: transaction.transactionReference },
                    data: { status: "failed" }
                }),

                this.paymentRetryQueue.queuePayment({
                    userId: transaction.userId,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    narration: transaction.narration,
                    accountName: user.accountName,
                    accountNumber: transaction.accountNumber,
                })
            ])
        } catch (error) {
            console.log(error)
        }
    }

    async payEmployees(employeeIds: string[], narration: string) {
        await Promise.all(employeeIds.map(userId => this.paymentQueue.queueUserPayment({ userId, narration })))
        return { message: "Employees payment queued successfully" }
    }

    async processUserPayment(payload: ProcessPaymentPayload) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId }
            })
            if (!user) {
                throw new NotFoundException("User not found")
            }

            const today = new Date()
            const pastFiveDays = getPastDate(5)

            // Check for existing transaction with same narration and amount for this user in the last 5 days
            const existingTransaction = await this.prisma.transactions.findFirst({
                where: {
                    userId: payload.userId,
                    narration: payload.narration,
                    amount: payload.amount,
                    createdAt: { gte: pastFiveDays, lte: today },
                    status: { not: "failed" }
                }
            })

            if (existingTransaction) {
                throw new BadRequestException("A similar transaction already exists, possible duplicate transaction")
            }

            const transactionReference = generateTransactionReference()

            // Create transaction first to lock it in
            const transaction = await this.prisma.transactions.create({
                data: {
                    transactionReference,
                    userId: payload.userId,
                    amount: payload.amount,
                    currency: user.currency,
                    status: "pending",
                    narration: payload.narration,
                    accountNumber: user.accountNumber
                }
            })

            const verification = await this.paymentService.verifyAccount({
                accountNumber: user.accountNumber,
                bank: user.bankName
            })

            if (!verification.status) {
                await this.prisma.transactions.update({
                    where: { id: transaction.id },
                    data: { status: "failed" }
                })
                throw new BadRequestException(`Account verification failed for user ${payload.userId}`)
            }

            // Pass the reference to the provider for their own idempotency check
            await this.paymentService.transferToAccount({
                accountNumber: verification.accountNumber,
                accountName: verification.accountName,
                bankCode: verification.bankCode,
                amount: transaction.amount,
                currency: transaction.currency,
                reference: transactionReference
            })
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error
            }
            console.error("Payment processing error:", error)
            throw new InternalServerErrorException("An error occurred while processing payment")
        }
    }

    async processPaymentRetry(transactionId: string) {
        const transaction = await this.prisma.transactions.findFirst({ where: { id: transactionId, status: "failed" } })
        if (!transaction) {
            throw new NotFoundException("No record found for transaction")
        }

        const { exists, status } = await this.paymentService.verifyTransaction({ transactionReference: transaction.transactionReference })
        if (exists && status !== ServerTransactionStatus.Failed) {
            throw new ForbiddenException("Cannot retry a transaction currently being processed")
        }

        await this.paymentService.retryTransfer({ transactionReference: transaction.transactionReference })

        await this.prisma.transactions.update({
            where: { id: transactionId },
            data: { status: "pending" }
        })
    }
}