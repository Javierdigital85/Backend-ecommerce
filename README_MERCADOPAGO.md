# 💳 MercadoPago Integration - Complete Guide

## 📚 Documentation Index

This directory contains comprehensive documentation for your MercadoPago integration:

1. **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Start here! Summary of all changes made
2. **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Step-by-step production deployment
3. **[ENVIRONMENT_SWITCHING_GUIDE.md](./ENVIRONMENT_SWITCHING_GUIDE.md)** - How to switch between test and production
4. **[SECURITY_REVIEW.md](./SECURITY_REVIEW.md)** - Security best practices and recommendations
5. **[.env.example](./.env.example)** - Template for environment variables

---

## 🚀 Quick Start

### For Development (Test Payments)

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your credentials:**
   ```env
   NODE_ENV=development
   MP_ACCESS_TOKEN_TEST=your-test-token-here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Verify in logs:**
   ```
   🟢 MercadoPago: Using TEST credentials
   ```

5. **Test with test cards:**
   - Card: 5031 7557 3453 0604
   - Expiry: 11/25
   - CVV: 123
   - Name: APRO

### For Production (Real Payments)

1. **Read the deployment guide:**
   - [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)

2. **Get production credentials from MercadoPago**

3. **Update Render environment variables:**
   ```env
   NODE_ENV=production
   MP_ACCESS_TOKEN_PROD=your-production-token
   ```

4. **Deploy and verify:**
   ```
   🔴 MercadoPago: Using PRODUCTION credentials
   ```

---

## 🔧 What Was Fixed

### Critical Bugs
- ✅ Fixed webhook data ID typo (uppercase → lowercase)
- ✅ Fixed order model status typo ("apprived" → "approved")
- ✅ Added missing BACKEND_URL environment variable

### Improvements
- ✅ Environment-based configuration (auto-switch between test/prod)
- ✅ Enhanced logging throughout the payment flow
- ✅ Better error handling and validation
- ✅ Comprehensive documentation

---

## 📋 Answers to Your Questions

### 1. How do I configure MercadoPago for REAL payments?

**Answer:** Set `NODE_ENV=production` in your Render environment variables. The system will automatically use production credentials.

**Details:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 2 & 3

---

### 2. What credentials do I need for production?

**Answer:** You need:
- Production Access Token (starts with `APP_USR-`)
- Webhook Secret

**How to get them:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 2

---

### 3. Where do I obtain production credentials?

**Answer:** 
1. Go to [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Navigate to "Your integrations" → "Credentials"
3. Complete account verification
4. Access "Production credentials" tab

**Full guide:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 2

---

### 4. How do I switch between test and production?

**Answer:** Simply change the `NODE_ENV` environment variable:
- `NODE_ENV=development` → Test mode (test cards, no real money)
- `NODE_ENV=production` → Production mode (real cards, real money)

**Full guide:** See [ENVIRONMENT_SWITCHING_GUIDE.md](./ENVIRONMENT_SWITCHING_GUIDE.md)

---

### 5. Do I need to change the Preference creation code?

**Answer:** No! The code now automatically selects the correct credentials based on `NODE_ENV`. However, I added some improvements:
- Auto-return on approval
- Better metadata
- Statement descriptor
- Payment method options

**See changes in:** `src/controllers/orderController.ts`

---

### 6. Are my back_urls and notification_url correct?

**Answer:** Yes, they're correctly configured! They use environment variables:
- `back_urls`: Uses `FRONTEND_URL` for success/failure/pending pages
- `notification_url`: Uses `BACKEND_URL` for webhook endpoint

**Important:** Make sure these environment variables are set correctly in Render.

---

### 7. Should I update MercadoPago SDK settings?

**Answer:** The current SDK version (2.10.1) is good. I added:
- Timeout configuration (5000ms)
- Idempotency key support
- Better error handling

**No breaking changes needed!**

---

### 8. What environment variables need updating in Render?

**Answer:** For production, set these in Render:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend.onrender.com
MP_ACCESS_TOKEN_PROD=APP_USR-your-production-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-strong-secret-key
```

**Full list:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 3

---

### 9. How can I safely test real transactions?

**Answer:** Two options:

**Option 1 (Recommended):**
1. Set `NODE_ENV=production`
2. Create a product with very low price ($10 ARS or $0.10 USD)
3. Complete purchase with your own card
4. Verify everything works
5. Refund the transaction in MercadoPago dashboard

**Option 2:**
- Keep using test mode until you're 100% confident
- Then switch to production

**Full guide:** See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 5

---

## 🔒 Security Checklist

Before going to production:

- [ ] Read [SECURITY_REVIEW.md](./SECURITY_REVIEW.md)
- [ ] `.env` file is in `.gitignore`
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Different secrets for dev and production
- [ ] HTTPS enabled on all endpoints
- [ ] Webhook signature validation enabled
- [ ] CORS configured for production domain

---

## 📊 Current Status

✅ **Ready for Production** (after completing setup steps)

**What's Working:**
- ✅ Environment-based configuration
- ✅ Webhook signature validation
- ✅ Order creation and tracking
- ✅ Stock management
- ✅ Payment status updates
- ✅ Comprehensive logging

**What You Need to Do:**
1. Get production credentials from MercadoPago
2. Update Render environment variables
3. Test with small real transaction
4. Go live!

---

## 🆘 Need Help?

### Common Issues
See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) Section 7 (Troubleshooting)

### Documentation
- All guides are in this directory
- Start with [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)

### MercadoPago Support
- [Official Documentation](https://www.mercadopago.com.ar/developers/en/docs)
- [Support](https://www.mercadopago.com.ar/developers/en/support)

---

**Good luck with your e-commerce platform! 🚀💰**

