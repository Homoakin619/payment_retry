

export const configurations = () => {
    return {
        paystackApiKey: process.env.PAYSTACK_API_KEY,
        redisHost: process.env.REDIS_HOST,
        redisPassword: process.env.REDIS_PASSWORD
    }
}