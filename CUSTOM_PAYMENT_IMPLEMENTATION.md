# Custom Payment Gateway Implementation Guide

## What Was Added

### 1. Database Schema (Prisma)

**File**: `prisma/schema.prisma`

- New `AdminPaymentConfig` model to store bank and card details
- Updated `Subscription` model with new fields:
  - `paymentMethod`: Track which payment method was used (MONNIFY, BANK_TRANSFER, CARD)
  - `manualPaymentProof`: Store file URL for payment verification
  - `paymentVerifiedAt` & `paymentVerifiedBy`: Track admin verification

### 2. API Endpoints Created

#### Admin Payment Configuration API

**File**: `app/api/admin/payment-config/route.ts`

- **GET** /api/admin/payment-config - Get current payment configuration
- **POST** /api/admin/payment-config - Update payment config (admin only)
- Stores: Bank account details (name, number, bank, code) and Card details (holder name, last 4 digits, brand)

#### Subscription Initialization API

**File**: `app/api/subscriptions/initialize/route.ts`

- **POST** /api/subscriptions/initialize
- Initializes subscription with custom payment method
- Body: `{ salonId, planKey, paymentMethod: "MONNIFY" | "BANK_TRANSFER" | "CARD_PAYMENT" }`
- Returns payment details (bank or card info) for display to user

### 3. Utility Functions

**File**: `lib/payment-config.ts`

- `getPaymentConfig()`: Fetch active payment configuration
- `hasCustomPaymentMethods()`: Check if custom options are available
- `getAvailablePaymentMethods()`: Get list of enabled methods
- `formatBankAccountForDisplay()`: Mask account numbers
- `generatePaymentReference()`: Create transaction reference

## Next Steps: Update Registration Page

The registration page needs updates to:

### Add New State Variables

```typescript
const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
  "MONNIFY" | "BANK_TRANSFER" | "CARD_PAYMENT"
>("MONNIFY");
const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
const [loadingPaymentConfig, setLoadingPaymentConfig] = useState(false);
```

### Fetch Payment Config on Mount

```typescript
useEffect(() => {
  const fetchPaymentConfig = async () => {
    setLoadingPaymentConfig(true);
    try {
      const res = await fetch("/api/admin/payment-config");
      const data = await res.json();
      setPaymentConfig(data);
      // If custom methods available, default to bank transfer
      if (data.acceptBankTransfer) {
        setSelectedPaymentMethod("BANK_TRANSFER");
      }
    } catch (err) {
      console.error("Failed to load payment config:", err);
    } finally {
      setLoadingPaymentConfig(false);
    }
  };
  fetchPaymentConfig();
}, []);
```

### Update Payment Step Form

Replace the current payment step (lines ~1000-1050) with:

1. Show payment method selection (radio buttons):
   - Monnify (always available as fallback)
   - Bank Transfer (if enabled in config)
   - Card Payment (if enabled in config)
2. For bank/card: Display the configured details
3. For bank/card: Show file upload for payment proof
4. Update handlePaymentSubmit to use custom payment flow

### Update handleRegisterAndActivate Function

Instead of directly calling Monnify, check selected payment method:

- If "MONNIFY": Call /api/payments/monnify/initialize (existing)
- If "BANK_TRANSFER" or "CARD_PAYMENT":
  1. Call POST /api/subscriptions/initialize with paymentMethod
  2. Get bank/card details from response
  3. Show success to users with payment reference
  4. Store payment proof file
  5. Redirect to login after submitting

## Admin Setup

### To Configure Custom Payment in Admin Dashboard

**Endpoint**: POST /api/admin/payment-config

```bash
curl -X POST http://localhost:3000/api/admin/payment-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "bankAccountName": "Your Business Name",
    "bankAccountNumber": "0123456789",
    "bankName": "Zenith Bank",
    "bankCode": "057",
    "cardHolderName": "Your Name",
    "cardLastFour": "1234",
    "cardBrand": "VISA",
    "acceptBankTransfer": true,
    "acceptCardPayment": true,
    "paymentNote": "Please include your registration email in the transaction reference"
  }'
```

## Payment Flow for Users

### Using Bank Transfer:

1. User selects plan and chooses "Bank Transfer" payment method
2. Shown bank account details and payment reference number
3. Upload payment proof (screenshot/receipt)
4. Admin verifies in dashboard
5. Subscription activated upon verification

### Using Card Payment:

1. User selects plan and chooses "Card Payment" method
2. Shown card details
3. Upload payment proof
4. Admin verifies
5. Subscription activated

### Using Monnify (Existing):

1. User selects plan, defaults to Monnify
2. Redirected to Monnify checkout
3. Automatic verification upon successful payment

## Files Modified/Created

### Created:

- ✅ `app/api/admin/payment-config/route.ts` - Admin config API
- ✅ `app/api/subscriptions/initialize/route.ts` - Custom payment init
- ✅ `lib/payment-config.ts` - Utility functions
- ✅ `prisma/schema.prisma` - Schema updates

### To Update:

- `app/register-salon-owner/page.tsx` - Add custom payment UI
- `app/admin/dashboard/...` - Create admin payment config page
- `prisma/migrations/...` - Run migration after schema update

## Running Migrations

After schema changes:

```bash
pnpm exec prisma migrate dev --name add_custom_payment_config
```

This will create migration files automatically.

## Testing the Implementation

1. **Set up admin payment config**:

   ```bash
   # Login as super admin and call POST /api/admin/payment-config
   ```

2. **Test registration flow**:
   - Create new account
   - Select paid plan
   - See bank/card payment options
   - Choose payment method
   - Complete registration with payment proof

3. **Verify subscriptions**:
   - Check subscription gets created with correct paymentMethod
   - Admin can verify payments and activate subscriptions

## Environment Variables (if needed)

No new env vars needed - uses existing database

## Security Notes

- ✅ Payment details masked (only last 4 digits for cards)
- ✅ Admin-only API for configuration
- ✅ Payment proof file storage (frontend should upload to secure storage)
- ✅ Payment verification workflow prevents unauthorized plan activation
