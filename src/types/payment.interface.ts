
export interface IncomingWebhookPayload {
    transactionReference: string;
    status: string;
    amount: number;
    currency: string;
    error?: string
}

export interface ProcessPaymentPayload {
    userId: string
    amount: number
    narration: string
    accountNumber: string
    accountName: string
    currency: string
}