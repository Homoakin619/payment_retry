import { Injectable } from "@nestjs/common";
import { IBasePaymentProvider, VerifyAccountResponse, VerifyTransactionResponse } from "../types/base.provider.interface";

interface TransferToAccountPayload {
    accountNumber: string;
    bank: string;
    amount: number;
    currency: string;
}

@Injectable()
export class PaystackProvider implements IBasePaymentProvider {

    async verifyAccount(payload: { accountNumber: string, bank: string }): Promise<VerifyAccountResponse> {
        return {
            accountName: "John Doe",
            accountNumber: payload.accountNumber,
            bankCode: "044",
            status: true
        }
    }

    async verifyTransaction(payload: { transactionReference: string }): Promise<VerifyTransactionResponse> {
        return { status: "pending", exists: false, transactionReference: payload.transactionReference, amount: 1000 }
    }
    async retryTransfer(payload: { transactionReference: string }): Promise<any> {
        return { status: "pending" }
    }
    async transferToAccount(payload: { accountNumber: string, accountName: string, bankCode: string, amount: number, reference: string }): Promise<any> {
        return { status: "transfer processed", reference: payload.reference }
    }
}