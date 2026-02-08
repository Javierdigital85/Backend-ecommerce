# 🚀 MercadoPago Production Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Obtaining Production Credentials](#obtaining-production-credentials)
3. [Environment Configuration](#environment-configuration)
4. [Deploying to Render](#deploying-to-render)
5. [Testing Before Going Live](#testing-before-going-live)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before deploying to production, ensure you have:

- ✅ A verified MercadoPago account
- ✅ Business information completed in MercadoPago
- ✅ Backend deployed on Render (or similar platform)
- ✅ Frontend deployed and connected to backend
- ✅ MongoDB database accessible from production
- ✅ SSL certificate (HTTPS) for your backend URL

---

## 2. Obtaining Production Credentials

### Step 1: Access MercadoPago Developer Dashboard

1. Go to [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers) (or your country's version)
2. Log in with your MercadoPago account
3. Navigate to **"Your integrations"** → **"Credentials"**

### Step 2: Complete Account Verification

**IMPORTANT**: You cannot use production credentials until your account is verified.

1. Click on **"Activate production credentials"**
2. Complete the following:
   - ✅ Business information (company name, tax ID, etc.)
   - ✅ Identity verification (upload required documents)
   - ✅ Bank account information
   - ✅ Accept terms and conditions for production

3. Wait for MercadoPago to approve your account (usually 24-48 hours)

### Step 3: Get Your Production Access Token

1. Once approved, go to **"Credentials"** → **"Production credentials"**
2. Copy your **Production Access Token** (starts with `APP_USR-`)
3. **NEVER share this token publicly or commit it to Git**

### Step 4: Configure Webhook

1. In the MercadoPago dashboard, go to **"Webhooks"**
2. Click **"Create webhook"**
3. Configure:
   - **URL**: `https://your-backend-url.com/api/webhook`
   - **Events**: Select "Payments"
   - **Version**: v1 or v2 (your code supports both)
4. Copy the **Webhook Secret** provided

---

## 3. Environment Configuration

### Development Environment (.env for local)

```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
MP_ACCESS_TOKEN_TEST=TEST-your-test-token-here
MP_ACCESS_TOKEN_PROD=APP_USR-your-production-token-here
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

### Production Environment (Render Environment Variables)

Set these in your Render dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.onrender.com
MP_ACCESS_TOKEN_PROD=APP_USR-your-production-token-here
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-super-secret-jwt-key
MONGO_DB_URI=your-mongodb-connection-string
GOOGLE_API_KEY=your-google-api-key
```

**CRITICAL**: Make sure `NODE_ENV=production` to use production credentials!

---

## 4. Deploying to Render

### Step 1: Update Environment Variables in Render

1. Go to your Render dashboard
2. Select your backend service
3. Navigate to **"Environment"** tab
4. Add/Update the following variables:
   - `NODE_ENV` = `production`
   - `BACKEND_URL` = `https://your-service.onrender.com`
   - `FRONTEND_URL` = `https://your-frontend-domain.com`
   - `MP_ACCESS_TOKEN_PROD` = Your production token
   - `MERCADOPAGO_WEBHOOK_SECRET` = Your webhook secret

### Step 2: Verify Webhook URL

1. Make sure your webhook URL is accessible: `https://your-backend.onrender.com/api/webhook`
2. Test it with a POST request (you can use Postman or curl)
3. Update the webhook URL in MercadoPago dashboard if needed

### Step 3: Deploy

1. Push your code changes to your Git repository
2. Render will automatically deploy
3. Check the logs for: `🔴 MercadoPago: Using PRODUCTION credentials`

---

## 5. Testing Before Going Live

### Option 1: Use MercadoPago Test Cards (Development Mode)

Keep `NODE_ENV=development` and use test cards:

**Approved Payment:**

- Card: 5031 7557 3453 0604
- Expiry: 11/25
- CVV: 123
- Name: APRO

**Rejected Payment:**

- Card: 5031 4332 1540 6351
- Expiry: 11/25
- CVV: 123
- Name: OTHE

### Option 2: Small Real Transaction (Production Mode)

**RECOMMENDED APPROACH:**

1. Set `NODE_ENV=production` in Render
2. Create a test product with a **very small price** (e.g., $10 ARS or $0.10 USD)
3. Complete a real purchase with your own credit card
4. Verify:
   - ✅ Payment is processed
   - ✅ Webhook is received and processed
   - ✅ Order status is updated to "approved"
   - ✅ Stock is reduced
   - ✅ You receive the payment in your MercadoPago account

5. **Refund the test transaction** in MercadoPago dashboard

---

## 6. Security Checklist

### ✅ Environment Variables

- [ ] All sensitive credentials are in environment variables (not hardcoded)
- [ ] `.env` file is in `.gitignore`
- [ ] Production credentials are NEVER committed to Git
- [ ] Different credentials for development and production

### ✅ HTTPS/SSL

- [ ] Backend uses HTTPS in production
- [ ] Frontend uses HTTPS in production
- [ ] Webhook URL uses HTTPS

### ✅ Authentication & Authorization

- [ ] JWT tokens are stored in HTTP-only cookies
- [ ] Order creation requires authentication
- [ ] User can only access their own orders

### ✅ CORS Configuration

- [ ] CORS is configured to allow only your frontend domain
- [ ] Credentials are enabled in CORS

### ✅ Webhook Security

- [ ] Webhook signature validation is enabled
- [ ] Webhook secret is stored securely
- [ ] Webhook only processes payment events

### ✅ Payment Data

- [ ] Never store credit card numbers
- [ ] Only store MercadoPago payment IDs and references
- [ ] Sensitive data is not logged

---

## 7. Troubleshooting

### Issue: "MercadoPago: Using TEST credentials" in production

**Solution:**

- Check that `NODE_ENV=production` in Render environment variables
- Restart your Render service after updating environment variables

### Issue: Webhook not receiving notifications

**Solutions:**

1. Verify webhook URL is correct in MercadoPago dashboard
2. Check that your backend is accessible via HTTPS
3. Review webhook logs in MercadoPago dashboard
4. Check your backend logs for webhook errors
5. Ensure `MERCADOPAGO_WEBHOOK_SECRET` matches the one in MercadoPago

### Issue: Payment approved but order not updated

**Solutions:**

1. Check webhook logs in your backend
2. Verify `external_reference` matches the order ID
3. Check MongoDB connection
4. Review webhook controller logs

### Issue: "Invalid signature" error in webhook

**Solutions:**

1. Verify `MERCADOPAGO_WEBHOOK_SECRET` is correct
2. Check that the webhook secret in Render matches MercadoPago
3. Ensure you're not modifying the request body before validation

### Issue: CORS errors when creating order

**Solutions:**

1. Verify `FRONTEND_URL` in backend matches your actual frontend URL
2. Check CORS configuration in `server.ts`
3. Ensure `credentials: true` is set in both frontend and backend

---

## 8. Monitoring & Maintenance

### Recommended Practices

1. **Monitor Webhook Logs**: Regularly check webhook processing logs
2. **Set Up Alerts**: Configure alerts for failed payments or webhook errors
3. **Regular Testing**: Periodically test the payment flow
4. **Keep Credentials Secure**: Rotate secrets periodically
5. **Update Dependencies**: Keep MercadoPago SDK updated

### Useful MercadoPago Dashboard Sections

- **Payments**: View all transactions
- **Webhooks**: Monitor webhook deliveries and errors
- **Reports**: Download payment reports
- **Refunds**: Process refunds if needed

---

## 9. Going Live Checklist

Before accepting real payments:

- [ ] Production credentials obtained and configured
- [ ] `NODE_ENV=production` set in Render
- [ ] Webhook configured and tested
- [ ] Small test transaction completed successfully
- [ ] All security measures implemented
- [ ] HTTPS enabled on all endpoints
- [ ] Error handling and logging in place
- [ ] Backup and recovery plan established
- [ ] Customer support process defined
- [ ] Refund process documented

---

## 10. Support & Resources

### MercadoPago Resources

- [Official Documentation](https://www.mercadopago.com.ar/developers/en/docs)
- [API Reference](https://www.mercadopago.com.ar/developers/en/reference)
- [Test Cards](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/testing)
- [Support](https://www.mercadopago.com.ar/developers/en/support)

### Your Application Logs

- Backend logs: Check Render dashboard → Logs
- Webhook logs: Check MercadoPago dashboard → Webhooks
- MongoDB logs: Check MongoDB Atlas → Monitoring

---

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review MercadoPago documentation
3. Check your application logs
4. Contact MercadoPago support for payment-specific issues

**Good luck with your production deployment! 🚀**
