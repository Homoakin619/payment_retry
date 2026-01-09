
import { Injectable } from "@nestjs/common";
import { IBasePaymentProvider, PaymentProviderEnum } from "../types/base.provider.interface";
import { PaystackProvider } from "./paystack.provider";

@Injectable()
export class BasePaymentProvider {
    private providersMap = new Map<PaymentProviderEnum, IBasePaymentProvider>();
    
    constructor(private readonly paystackProvider: PaystackProvider) {
        this._registerProviders();
    }

    _registerProviders() {
        this.providersMap.set(PaymentProviderEnum.Paystack, this.paystackProvider);
    }
    
    getProvider(provider: PaymentProviderEnum): IBasePaymentProvider {
        const service = this.providersMap.get(provider);
        if (!service) {
            throw new Error(`Provider ${provider} not found`);
        }
        return service;
    }
}
