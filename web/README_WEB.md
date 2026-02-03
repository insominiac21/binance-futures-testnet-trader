# Web Dashboard - README

## 🌐 Binance Futures Trading Dashboard

A lightweight web interface for placing orders on Binance Futures Testnet. Built with vanilla HTML/CSS/JavaScript frontend and TypeScript serverless functions on Vercel.

---

## ✨ Features

- ✅ **Clean single-page UI** - No frameworks, just HTML/CSS/JS
- ✅ **Real-time connection testing** - Verify API connectivity
- ✅ **Order placement** - MARKET, LIMIT, and STOP orders
- ✅ **Dry-run mode** - Test orders without sending to exchange
- ✅ **Secure** - API keys stored server-side only
- ✅ **Responsive** - Works on desktop and mobile
- ✅ **Testnet-only** - Enforced security checks

---

## 🏗️ Architecture

```
Frontend (Static)          Backend (Serverless)
┌─────────────┐            ┌──────────────┐
│ index.html  │────GET────→│  /api/time   │
│ styles.css  │            └──────────────┘
│ app.js      │                   │
└─────────────┘                   ▼
       │                   Binance Testnet
       │                   /fapi/v1/time
       │
       └───────POST────→┌────────────────────┐
                        │ /api/place-order   │
                        └────────────────────┘
                                  │
                                  ▼
                           Binance Testnet
                           /fapi/v1/order
```

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+ installed
- Binance Futures Testnet API keys
- Vercel CLI (optional, for dev server)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Environment Variables

Create a `.env.local` file (for local development):

```bash
BINANCE_API_KEY=your_testnet_api_key
BINANCE_API_SECRET=your_testnet_secret_key
BINANCE_BASE_URL=https://testnet.binancefuture.com
DASHBOARD_TOKEN=optional_secret_token
```

### Step 3: Run Development Server

**Option A: Using Vercel CLI (Recommended)**

```bash
npm run dev
```

This starts the Vercel dev server at `http://localhost:3000`.

**Option B: Using Python HTTP Server (Frontend only)**

```bash
cd web
python -m http.server 8000
```

Open `http://localhost:8000` - Note: API calls won't work without backend.

### Step 4: Open Dashboard

Visit `http://localhost:3000` in your browser.

---

## 📦 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Add web dashboard"
git remote add origin https://github.com/yourusername/trading-bot.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### Step 3: Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `BINANCE_API_KEY` | Your testnet API key | ✅ Yes |
| `BINANCE_API_SECRET` | Your testnet secret key | ✅ Yes |
| `BINANCE_BASE_URL` | `https://testnet.binancefuture.com` | ✅ Yes |
| `DASHBOARD_TOKEN` | Optional security token | ⚠️ Optional |

### Step 4: Deploy

Click **"Deploy"**. Vercel will build and deploy your dashboard.

### Step 5: Access Your Dashboard

Visit your deployed URL: `https://your-project.vercel.app`

---

## 🔒 Security Considerations

### ⚠️ IMPORTANT: This is for TESTNET ONLY

1. **API Keys are Server-Side**
   - Keys are stored in Vercel environment variables
   - Never exposed to the browser
   - HMAC signing happens on the server

2. **Testnet Enforcement**
   - Backend validates `BINANCE_BASE_URL` contains "testnet"
   - Refuses requests if not testnet
   - Prevents accidental production use

3. **Dashboard Token (Optional)**
   - Set `DASHBOARD_TOKEN` environment variable
   - Frontend must provide matching token via `X-DASHBOARD-TOKEN` header
   - Token is stored in browser (localStorage or session)
   - ⚠️ **WARNING**: Anyone with the URL can use the dashboard if no token is set
   - ✅ **Recommendation**: For private use, always set a strong token

4. **Signature Redaction**
   - All logs redact HMAC signatures
   - API secrets never logged
   - Safe for debugging

### 🛡️ Best Practices

- ✅ Only use testnet API keys (never production)
- ✅ Set a strong `DASHBOARD_TOKEN` for private deployments
- ✅ Regularly rotate testnet API keys
- ✅ Monitor Vercel logs for suspicious activity
- ✅ Keep the deployment URL private if no token is set

---

## 🎨 UI Guide

### Connection Test

1. Click **"Test Connection"** button
2. Verifies backend can reach Binance Testnet
3. Displays server time and base URL
4. Green = Success, Red = Error

### Placing Orders

1. **Symbol**: Trading pair (e.g., BTCUSDT, ETHUSDT)
2. **Side**: BUY or SELL
3. **Type**: MARKET, LIMIT, or STOP
4. **Quantity**: Amount to trade (e.g., 0.05)
5. **Price**: Required for LIMIT/STOP orders
6. **Stop Price**: Required for STOP orders
7. **Dry Run**: Check to validate without sending

### Order Types Explained

| Type | Price Required | Stop Price Required | When Executed |
|------|----------------|---------------------|---------------|
| **MARKET** | ❌ No | ❌ No | Immediately at market price |
| **LIMIT** | ✅ Yes | ❌ No | When market reaches limit price |
| **STOP** | ✅ Yes | ✅ Yes | When stop price hit, limit order placed |

---

## 🐛 Troubleshooting

### "Connection failed"

- Check your internet connection
- Verify Binance Testnet is accessible: https://testnet.binancefuture.com
- Check Vercel logs for errors

### "Unauthorized: Invalid or missing dashboard token"

- Enter your `DASHBOARD_TOKEN` in the security token field
- Token is case-sensitive
- Token is stored in browser session

### "Invalid API-key, IP, or permissions"

- Verify API keys are correct in Vercel environment variables
- Ensure Futures trading permission is enabled on testnet API key
- Regenerate keys if necessary

### "Order's notional must be no smaller than 100"

- Increase order quantity (minimum ~$100 order value)
- Example: Use 0.05 ETH or 0.002 BTC

### "Price/StopPrice required"

- LIMIT orders need price
- STOP orders need both price and stop price

---

## 📝 API Endpoints

### GET /api/time

Test connectivity to Binance.

**Response:**
```json
{
  "serverTime": 1707148825052,
  "baseUrl": "https://testnet.binancefuture.com"
}
```

### POST /api/place-order

Place an order.

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "side": "BUY",
  "type": "MARKET",
  "quantity": 0.05,
  "dryRun": false
}
```

**Response (Success):**
```json
{
  "orderId": 8251794716,
  "symbol": "ETHUSDT",
  "status": "NEW",
  "side": "BUY",
  "type": "MARKET",
  "quantity": "0.050",
  "executedQty": "0.000",
  "avgPrice": "0.00"
}
```

**Response (Error):**
```json
{
  "code": -4164,
  "msg": "Order's notional must be no smaller than 100",
  "error": "Binance API Error -4164: ..."
}
```

---

## 🎯 Bonus Features

### Multiple Algorithmic Order Types

The dashboard implements **TWO bonus features** (assignment asked for one):

#### 1. STOP_MARKET Orders
**Pure market execution when triggered**

- Select "STOP_MARKET" as order type
- Enter **Stop Price** (trigger price)
- When market hits stop price → executes MARKET order
- **BUY STOP**: stopPrice must be > current market (breakout)
- **SELL STOP**: stopPrice must be < current market (stop-loss)
- **Parameters**: Only `stopPrice` + `quantity` needed

#### 2. STOP (STOP_LOSS_LIMIT) Orders
**Limit order execution when triggered**

- Select "STOP (STOP_LOSS_LIMIT)" as order type
- Enter **Stop Price** (trigger) AND **Price** (limit)
- When market hits stop price → places LIMIT order at your price
- **Use case**: More price control than STOP_MARKET
- **Parameters**: Needs `stopPrice`, `price`, `quantity`, `timeInForce`

**Why these two?**
- Cover both use cases: fast execution (MARKET) vs. price control (LIMIT)
- Simple to implement vs. OCO/TWAP/Grid complexity
- Native Binance Futures API support
- Educational value for understanding algorithmic orders
- Real-world applicability in trading strategies

### Token-Based Security

Optional dashboard token for added security:

- Set `DASHBOARD_TOKEN` in Vercel
- Enter token in UI security field
- Protects against unauthorized access

---

## 📚 Related Documentation

- **Main README**: [../README.md](../README.md)
- **Python CLI**: [../cli.py](../cli.py)
- **Architecture**: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Checklist**: [../CHECKLIST.md](../CHECKLIST.md)

---

## 🤝 Contributing

This is an assignment project, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

Built for educational purposes as part of PrimeTrade.ai Python Developer Intern assignment.

---

**⚠️ REMINDER: TESTNET ONLY - NO REAL MONEY INVOLVED**
