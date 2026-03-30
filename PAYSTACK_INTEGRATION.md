# Paystack Payment Gateway Integration

## Overview
Paystack payment gateway has been integrated into the Precious Beauty Link Platform for processing subscription payments.

## Configuration

### Environment Variables Added to `.env`
```
PAYSTACK_SECRET_KEY="sk_test_22c35372ca07ca543b5c97ee5b4bf5edfcf45034"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_a01e4cb1bdbb0794a7a7bf2451b8893696f815fd"
PAYSTACK_BASE_URL="https://api.paystack.co"
```

## API Endpoints Created

### 1. Payment Initialization
**Endpoint**: `POST /api/payments/paystack/initialize`  
**Purpose**: Initiate a Paystack payment transaction  
**Request**:
```json
{
  "planKey": "STARTER|STANDARD|GROWTH|PREMIUM"
}
```

**Response**:
```json
{
  "redirectUrl": "https://checkout.paystack.com/...",
  "reference": "sub_[salonId]_[plan]_[uuid]",
  "accessCode": "access_code_from_paystack",
  "provider": "paystack"
}
```

### 2. Payment Verification
**Endpoint**: `POST /api/payments/paystack/verify`  
**Purpose**: Verify a completed Paystack payment  
**Request**:
```json
{
  "reference": "sub_[salonId]_[plan]_[uuid]"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "subscription": {
    "id": "subscription_id",
    "status": "ACTIVE",
    "plan": "STARTER"
  }
}
```

### 3. Webhook Handler
**Endpoint**: `POST /api/payments/paystack/webhook`  
**Purpose**: Receive and process Paystack payment webhooks  
**Triggered by**: Paystack on successful charge completion  
**Actions**:
- Verifies webhook signature
- Updates subscription status to ACTIVE
- Records payment transaction

## Webhook Configuration in Paystack Dashboard

1. Go to your Paystack Dashboard → Settings → API Keys & Webhooks
2. Add Webhook URL: `https://your-domain.com/api/payments/paystack/webhook`
3. Select events: `charge.success`

## Payment Flow

1. **User initiates subscription**:
   - Call `/api/payments/paystack/initialize` with plan selection
   - Receives redirect URL from Paystack

2. **User completes payment**:
   - User is redirected to Paystack checkout
   - User completes payment on Paystack

3. **Payment verification** (2 methods):
   - **Automatic via Webhook**: Paystack sends webhook → subscription auto-activated
   - **Manual via Verify Endpoint**: Frontend calls `/api/payments/paystack/verify` → subscription activated

4. **Subscription activation**:
   - Status changed from `PENDING_PAYMENT` to `ACTIVE`
   - Current period set for 30 days from verification

## Available Payment Methods

The system now supports these payment methods via `/api/subscriptions/initialize`:
- `MONNIFY` - Monnify payment gateway
- `PAYSTACK` - Paystack payment gateway  
- `BANK_TRANSFER` - Manual bank transfer (if admin configured)
- `CARD_PAYMENT` - Manual card payment (if admin configured)

## Amount Configuration

Plan amounts (in NGN):
- STARTER: 5,000 NGN
- STANDARD: 10,000 NGN
- GROWTH: 20,000 NGN
- PREMIUM: 30,000 NGN

**Note**: Amounts are automatically converted to Kobo (1 NGN = 100 Kobo) for Paystack API

## Testing

### Test Mode
- **Secret Key**: `sk_test_22c35372ca07ca543b5c97ee5b4bf5edfcf45034`
- **Public Key**: `pk_test_a01e4cb1bdbb0794a7a7bf2451b8893696f815fd`
- **Base URL**: `https://api.paystack.co` (production endpoint, uses test keys)

### Test Card Details
For testing in Paystack sandbox:
- **Card Number**: 4084084084084081
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

## Security Notes

1. **Secret key never exposed**: Secret key only used server-side
2. **Public key safe**: Public key available to frontend (prefixed with `NEXT_PUBLIC_`)
3. **Webhook signature verification**: All webhooks validated with secret key
4. **Payment reference unique**: Combines salon ID, plan, and UUID for uniqueness

## Error Handling

- Invalid/missing authentication: Returns 401 Unauthorized
- Missing required fields: Returns 400 Bad Request
- Missing configuration: Returns 500 Server Error
- Invalid plan: Returns 400 Bad Request
- Subscription not found: Returns 404 Not Found
- Payment verification failed: Returns 400 Bad Request

## Integration Points

### In Frontend Components
When user selects a subscription plan:
```typescript
// Call initialize endpoint
const response = await fetch('/api/payments/paystack/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ planKey: 'STARTER' })
});

const { redirectUrl } = await response.json();
window.location.href = redirectUrl; // Redirect to Paystack checkout
```

### Payment Status Tracking
Check subscription status:
- `PENDING_PAYMENT`: Awaiting payment
- `ACTIVE`: Payment verified, subscription active
- `CANCELLED`: Subscription cancelled
- `EXPIRED`: Subscription period ended

## Related Files
- Environment config: `.env`
- Payment endpoints: `app/api/payments/paystack/*`
- Payment config utilities: `lib/payment-config.ts`
- Subscription initialization: `app/api/subscriptions/initialize/route.ts`
- Database schema: `prisma/schema.prisma`

## Next Steps
1. Configure webhook in Paystack dashboard
2. Test payment flow with test credentials
3. Update frontend to include Paystack option in payment method selection
4. Add callback handling after successful payment
5. Set up payment verification endpoint to be called on redirect
