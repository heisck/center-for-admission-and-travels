# Payment Setup Guide

## Overview
The payment system has been fully integrated with Paystack. The checkout page now dynamically fetches package prices from the database instead of using hardcoded values.

## What Was Implemented

### 1. Payment API Routes

#### `/api/payment/initialize` (POST)
- Initializes a Paystack payment transaction
- Fetches package price from database if `packageId` is provided
- Creates a payment record in the database
- Returns Paystack authorization URL for redirect

**Request Body:**
```json
{
  "packageId": "package-id",
  "email": "customer@example.com",
  "name": "Customer Name",
  "phone": "+233123456789",
  "paymentMethod": "card" // or "mobile_money"
}
```

#### `/api/payment/verify` (GET)
- Verifies payment status using Paystack reference
- Updates payment record in database
- Returns payment details

**Query Params:**
- `reference`: Paystack payment reference

#### `/api/payment/webhook` (POST)
- Handles Paystack webhook events
- Updates payment status automatically
- Verifies webhook signature for security

### 2. Package API Route

#### `/api/packages/[id]` (GET)
- Fetches a single package by ID from database
- Returns package details including price, description, highlights, etc.

### 3. Admin Payment Settings

#### `/admin/payment-settings`
- Admin page to view and configure payment settings
- Shows configuration status
- Provides instructions for setting up Paystack
- Accessible from admin dashboard via "Payment" tab

### 4. Updated Checkout Page

#### `/checkout`
- Now fetches package data dynamically from API
- Displays actual package price from database
- Integrates with Paystack payment flow
- Supports card and mobile money payments
- Shows loading and error states
- Calculates taxes and totals dynamically

### 5. Payment Callback Page

#### `/payment/callback`
- Handles payment verification after Paystack redirect
- Shows success/failed/pending states
- Displays payment details
- Provides navigation options

## Environment Variables

Add these to your `.env` file:

```env
# Payment Configuration (Paystack)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYMENT_CURRENCY=GHS
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Instructions

### Step 1: Get Paystack API Keys

1. Sign up for a Paystack account at https://paystack.com
2. Go to Settings → API Keys & Webhooks
3. Copy your **Public Key** (starts with `pk_test_` for test mode)
4. Copy your **Secret Key** (starts with `sk_test_` for test mode)

### Step 2: Update Environment Variables

1. Open your `.env` file
2. Replace the placeholder values with your actual Paystack keys:
   ```env
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key
   PAYSTACK_SECRET_KEY=sk_test_your_actual_key
   PAYMENT_CURRENCY=GHS
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### Step 3: Configure Webhook (Production)

For production, set up Paystack webhooks:

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `charge.success`, `charge.failed`
4. Save webhook

### Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to a package page
3. Click "Book Now" or checkout button
4. Fill in customer details
5. Select payment method (Card or Mobile Money)
6. Click "Proceed to Payment"
7. You'll be redirected to Paystack payment page
8. Use Paystack test cards:
   - Card Number: `4084084084084081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`

## How It Works

### Payment Flow

1. **Customer selects package** → Clicks checkout
2. **Checkout page loads** → Fetches package from `/api/packages/[id]`
3. **Customer fills form** → Enters personal and payment details
4. **Payment initialized** → POST to `/api/payment/initialize`
   - Package price fetched from database
   - Payment record created
   - Paystack transaction initialized
5. **Redirect to Paystack** → Customer completes payment
6. **Callback** → Paystack redirects to `/payment/callback`
7. **Verification** → GET `/api/payment/verify?reference=...`
8. **Status updated** → Payment record updated in database
9. **Confirmation** → Customer sees success/failed message

### Database Schema

The `Payment` model stores:
- Reference (Paystack transaction reference)
- Amount and currency
- Status (pending, processing, success, failed, cancelled)
- Customer details (email, name, phone)
- Package ID (if payment is for a package)
- Paystack response data (full transaction details)

## Admin Features

### Payment Settings Page

Access via Admin Dashboard → Payment tab

Features:
- View current configuration status
- Input Paystack API keys
- Configure currency and base URL
- See setup instructions
- Get .env file update instructions

## Important Notes

1. **Test vs Live Keys**: Use `pk_test_` and `sk_test_` for development. Switch to `pk_live_` and `sk_live_` for production.

2. **Currency**: Default is GHS (Ghanaian Cedis). Change `PAYMENT_CURRENCY` in `.env` if needed.

3. **Base URL**: Update `NEXT_PUBLIC_BASE_URL` to your production domain when deploying.

4. **Security**: Never commit your secret keys to version control. Always use environment variables.

5. **Package Prices**: Prices are now pulled from the database. Update package prices in the admin panel under Packages.

## Troubleshooting

### Payment initialization fails
- Check that Paystack keys are correctly set in `.env`
- Verify keys are active in Paystack dashboard
- Check server logs for error messages

### Package not found
- Ensure package ID exists in database
- Check that `/api/packages/[id]` route is working
- Verify database connection

### Webhook not working
- Ensure webhook URL is publicly accessible
- Check webhook signature verification
- Verify Paystack webhook configuration

### Payment callback issues
- Check that `NEXT_PUBLIC_BASE_URL` matches your domain
- Verify callback URL in Paystack dashboard
- Check browser console for errors

## Next Steps

1. ✅ Add your Paystack API keys to `.env`
2. ✅ Test payment flow with test cards
3. ✅ Configure webhook for production
4. ✅ Update `NEXT_PUBLIC_BASE_URL` for production
5. ✅ Switch to live keys when ready

## Support

For Paystack integration issues:
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com

For application issues:
- Check server logs
- Review API route error messages
- Verify database connection
