# 🔄 Environment Switching Guide

## Quick Reference: Development vs Production

---

## 🟢 Development Mode (Test Payments)

### When to Use
- Local development
- Testing payment flows
- Debugging
- Before deploying to production

### Configuration

**Local .env file:**
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
MP_ACCESS_TOKEN_TEST=TEST-your-test-token-here
MP_ACCESS_TOKEN_PROD=APP_USR-your-production-token-here
```

### What Happens
- ✅ Uses **TEST** MercadoPago credentials
- ✅ Payments are simulated (no real money)
- ✅ Can use test credit cards
- ✅ Console shows: `🟢 MercadoPago: Using TEST credentials`

### Test Credit Cards

**Approved Payment:**
```
Card Number: 5031 7557 3453 0604
Expiry: 11/25
CVV: 123
Name: APRO
```

**Rejected Payment:**
```
Card Number: 5031 4332 1540 6351
Expiry: 11/25
CVV: 123
Name: OTHE
```

**Pending Payment:**
```
Card Number: 5031 7557 3453 0604
Expiry: 11/25
CVV: 123
Name: CONT
```

More test cards: [MercadoPago Test Cards](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/testing)

---

## 🔴 Production Mode (Real Payments)

### When to Use
- Deployed application
- Accepting real customer payments
- After testing is complete

### Configuration

**Render Environment Variables:**
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend.onrender.com
MP_ACCESS_TOKEN_PROD=APP_USR-your-production-token-here
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

### What Happens
- ✅ Uses **PRODUCTION** MercadoPago credentials
- ✅ Processes real payments
- ✅ Real money is charged
- ✅ Console shows: `🔴 MercadoPago: Using PRODUCTION credentials`

### ⚠️ Important
- Real credit cards only
- Real money is charged
- Payments go to your MercadoPago account
- Test cards will NOT work

---

## 🔄 How to Switch Environments

### Local Development → Production

1. **Update Render Environment Variables:**
   - Go to Render Dashboard
   - Select your backend service
   - Navigate to "Environment" tab
   - Set `NODE_ENV=production`
   - Click "Save Changes"

2. **Verify Deployment:**
   - Check Render logs
   - Look for: `🔴 MercadoPago: Using PRODUCTION credentials`

3. **Test with Small Transaction:**
   - Create a low-price product
   - Complete a real purchase
   - Verify payment in MercadoPago dashboard

### Production → Development (Rollback)

1. **Update Render Environment Variables:**
   - Set `NODE_ENV=development`
   - Click "Save Changes"

2. **Verify:**
   - Check logs for: `🟢 MercadoPago: Using TEST credentials`

---

## 📊 Environment Comparison Table

| Feature | Development | Production |
|---------|------------|------------|
| **NODE_ENV** | `development` | `production` |
| **MercadoPago Token** | TEST token | PROD token |
| **Payment Processing** | Simulated | Real |
| **Money Charged** | No | Yes |
| **Test Cards** | ✅ Work | ❌ Don't work |
| **Real Cards** | ✅ Work (simulated) | ✅ Work (real charge) |
| **Webhook URL** | localhost (ngrok) | HTTPS production URL |
| **Frontend URL** | localhost:5173 | Production domain |
| **Backend URL** | localhost:3001 | Render URL |

---

## 🧪 Testing Strategy

### Phase 1: Local Development
```
NODE_ENV=development
↓
Use test cards
↓
Verify order creation
↓
Verify webhook processing
↓
Verify stock updates
```

### Phase 2: Staging (Optional)
```
NODE_ENV=development (on Render)
↓
Deploy to Render
↓
Test with test cards
↓
Verify webhooks work with HTTPS
```

### Phase 3: Production Testing
```
NODE_ENV=production
↓
Create low-price test product
↓
Complete real purchase
↓
Verify everything works
↓
Refund test transaction
```

### Phase 4: Go Live
```
NODE_ENV=production
↓
Update product prices
↓
Accept real customer payments
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T
- Use production credentials in development
- Commit `.env` file to Git
- Test with real cards in development
- Use test cards in production
- Forget to update `NODE_ENV` when deploying

### ✅ DO
- Keep separate credentials for dev and prod
- Use `.env.example` for documentation
- Test thoroughly in development first
- Verify environment in logs
- Update all environment variables when switching

---

## 🔍 How to Verify Current Environment

### Check Backend Logs

When your server starts, you'll see:

**Development:**
```
🟢 MercadoPago: Using TEST credentials
Server listening on port 3001
```

**Production:**
```
🔴 MercadoPago: Using PRODUCTION credentials
Server listening on port 3001
```

### Check API Response

The order creation response includes the environment:

```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "paymentUrl": "https://...",
  "environment": "test" // or "production"
}
```

---

## 📝 Quick Commands

### Check Current Environment (Local)
```bash
echo $NODE_ENV
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🆘 Troubleshooting

### "Using wrong credentials"
- Check `NODE_ENV` value
- Restart server after changing environment variables
- Verify correct token is set for the environment

### "Webhook not working"
- Development: Use ngrok or similar for local testing
- Production: Ensure HTTPS URL is configured in MercadoPago

### "Test cards not working"
- Verify `NODE_ENV=development`
- Check that you're using correct test card numbers
- Ensure test token is valid

---

**Remember: Always test in development before deploying to production! 🚀**

