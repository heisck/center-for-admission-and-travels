declare module '@paystack/paystack-sdk' {
  export interface PaystackResponse<T = unknown> {
    status: boolean
    message?: string
    data?: T
  }

  class Paystack {
    constructor(secretKey: string)

    transaction: {
      initialize(payload: Record<string, unknown>): Promise<PaystackResponse<any>>
      verify(payload: { reference: string }): Promise<PaystackResponse<any>>
    }
  }

  export default Paystack
}
