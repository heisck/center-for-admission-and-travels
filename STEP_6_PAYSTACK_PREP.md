# STEP 6: PAYSTACK PREPARATION

## Payment Schema

The Payment model is already defined in `prisma/schema.prisma`:

```prisma
model Payment {
  id              String        @id @default(cuid())
  reference       String        @unique // Paystack reference
  amount          Float
  currency        String        @default("GHS")
  status          PaymentStatus
  paymentMethod   String?
  customerEmail   String
  customerName    String?
  customerPhone   String?
  packageId       String?
  metadata        Json?
  paystackData    Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum PaymentStatus {
  pending
  processing
  success
  failed
  cancelled
}
```

## API Endpoints Created

### 1. `/api/payments/verify` (POST)
- Verifies Paystack payment using reference
- Returns payment status and details
- **Status**: Mock implementation ready
- **TODO**: Replace with real Paystack API call

### 2. `/api/payments/webhook` (POST)
- Handles Paystack webhook events
- Processes `charge.success` and `charge.failed` events
- **Status**: Mock implementation ready
- **TODO**: Add signature verification and database updates

## Integration Steps

### 1. Install Dependencies
```bash
npm install axios
# or
npm install @paystack/paystack-sdk
```

### 2. Set Environment Variables
```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### 3. Update Verification Endpoint
Replace mock in `app/api/payments/verify/route.ts` with:
```typescript
import axios from 'axios'

const response = await axios.get(
  `https://api.paystack.co/transaction/verify/${reference}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  }
)
```

### 4. Update Webhook Handler
Add signature verification in `app/api/payments/webhook/route.ts`:
```typescript
import crypto from 'crypto'

const signature = request.headers.get('x-paystack-signature')
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
  .update(JSON.stringify(body))
  .digest('hex')

if (hash !== signature) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

### 5. Frontend Integration
Create payment initialization on frontend:
```typescript
// Initialize Paystack payment
const initializePayment = async (amount: number, email: string) => {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    body: JSON.stringify({ amount, email }),
  })
  const { data } = await response.json()
  
  // Use Paystack inline JS
  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email,
    amount: amount * 100, // Convert to kobo
    ref: data.reference,
    callback: (response) => {
      // Verify payment
      verifyPayment(response.reference)
    },
  })
  handler.openIframe()
}
```

## Payment Flow

1. **User initiates payment** → Frontend calls `/api/payments/initialize`
2. **Payment initialized** → Paystack reference generated
3. **User completes payment** → Paystack redirects/callback
4. **Payment verified** → Frontend calls `/api/payments/verify`
5. **Webhook received** → Paystack sends webhook to `/api/payments/webhook`
6. **Status updated** → Database updated with payment status

## Security Considerations

1. **Never expose secret key** on frontend
2. **Always verify webhook signatures**
3. **Use HTTPS** in production
4. **Validate amounts** server-side
5. **Store payment data** securely in database

## Testing

Use Paystack test keys:
- Test Secret Key: `sk_test_...`
- Test Public Key: `pk_test_...`
- Test Cards: See Paystack documentation

## Status

✅ **Schema designed** - Payment model in Prisma
✅ **Endpoints created** - Verify and webhook routes
✅ **Mock implementation** - Ready for real integration
⏳ **Pending** - Real Paystack SDK integration
⏳ **Pending** - Frontend payment initialization
⏳ **Pending** - Database integration
