# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Add These to Vercel Dashboard

Go to: **Your Project → Settings → Environment Variables**

Add the following:

### Required Variables

```
BINANCE_API_KEY=your_testnet_api_key_here
BINANCE_API_SECRET=your_testnet_secret_here
BINANCE_BASE_URL=https://testnet.binancefuture.com
```

### Optional Variables

```
DASHBOARD_TOKEN=your_secure_token_here
```

## How to Get Testnet API Keys

1. Visit: https://testnet.binancefuture.com/
2. Login with your Binance account
3. Go to API Key Management
4. Create new API key
5. Copy the API Key and Secret
6. **IMPORTANT**: Enable "Futures Trading" permissions

## After Adding Variables

1. Redeploy your app in Vercel
2. Visit your dashboard URL
3. Test the connection

## Troubleshooting

### 401 Unauthorized Error
- ❌ API keys not set in Vercel
- ❌ API keys are from live Binance (must use testnet keys)
- ❌ Futures trading permission not enabled

### Fix:
1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add all required variables
4. Click "Redeploy" in Deployments tab
