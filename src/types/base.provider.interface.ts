

export type VerifyAccountResponse = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  status: boolean;
}

export type VerifyTransactionResponse = {
  transactionReference: string;
  amount: number;
  status: string;
  exists: boolean
}

export enum ServerTransactionStatus {
  Failed = 'failed',
  Success = 'success',
  Processing = 'processing',
  Pending = 'pending',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export interface TransferToAccountResponse {
  status: typeof ServerTransactionStatus;
  accountNumber?: string;
  accountName?: string;
  bank?: string;
  amount?: number;
  reference: string;
  currency?: string;
  providerResponse?: any;
  meta?: any;
}


export interface IBasePaymentProvider {
  verifyAccount(payload: { accountNumber: string, bank: string }): Promise<VerifyAccountResponse>;
  verifyTransaction(payload: { transactionReference: string }): Promise<VerifyTransactionResponse>;
  retryTransfer(payload: { transactionReference: string }): Promise<any>
  transferToAccount(payload: { accountNumber: string, accountName: string, bankCode: string, amount: number, currency: string, reference: string }): Promise<TransferToAccountResponse>
}


export enum PaymentProviderEnum {
  Paystack = 'paystack',
  Flutterwave = 'flutterwave'
}