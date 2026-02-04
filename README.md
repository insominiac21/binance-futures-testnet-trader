# Binance Futures Trading Bot

A production-ready trading bot for Binance Futures Testnet (USDT-M). Built for the PrimeTrade.ai Python Developer Intern assignment.

## 🎯 Live Demo

**Dashboard:** [https://demo.app]([https://your-vercel-app.vercel.app](https://binance-futures-testnet-trader-assi.vercel.app/))

## Features

### Python CLI
- ✅ Place **MARKET** and **LIMIT** orders
- ✅ Support **BUY** and **SELL** sides
- ✅ CLI with comprehensive input validation
- ✅ Structured logging to rotating log files
- ✅ Robust exception handling (API errors, network failures, validation errors)
- ✅ Direct REST API implementation with HMAC SHA256 signing
- ✅ Testnet support (default: `https://testnet.binancefuture.com`)
- ✅ Dry-run mode for testing
- ✅ Connection testing

### Web Dashboard (Bonus) 🌐
- ✅ **Deployed UI** on Vercel with serverless backend
- ✅ **FOUR order types** (assignment asked for one, implemented all!):
  - **MARKET**: Instant execution at market price
  - **LIMIT**: Execute at specific price with GTC
  - **STOP**: Conditional stop-limit order (Algo API)
  - **STOP_MARKET**: Conditional stop-market order (Algo API)
- ✅ **Live price updates** - Real-time market prices every 10 seconds
- ✅ **Smart STOP validation** - Enforces trigger price logic (BUY > current, SELL < current)
- ✅ **Position tracking** - View open positions AND active STOP orders
- ✅ **Algo Order Support** - Uses Binance's `/fapi/v1/algoOrder` endpoint (Dec 2025 migration)
- ✅ Clean HTML/CSS/JS interface (no frameworks)
- ✅ Secure: API keys server-side only
- ✅ Optional token-based authentication
- ✅ Real-time order confirmation with endpoint verification

## Requirements

- Python 3.8+
- `uv` package manager (recommended) or `pip`
- Binance Futures Testnet account with API keys
- (Optional) Node.js 18+ for web dashboard deployment

## Project Structure

```
trading_bot/
├── bot/                      # Python trading bot package
│   ├── __init__.py           # Package initialization
│   ├── client.py             # Binance Futures REST client (HMAC SHA256)
│   ├── orders.py             # Order placement business logic
│   ├── validators.py         # Input validation utilities
│   ├── logging_config.py     # Logger with rotating file handler
│   └── models.py             # Data models (OrderRequest, OrderResponse)
├── web/                      # Web dashboard (HTML/CSS/JS)
│   ├── index.html            # Dashboard UI
│   ├── styles.css            # Styling
│   ├── app.js                # Frontend logic
│   └── README_WEB.md         # Dashboard documentation
├── api/                      # Vercel serverless functions (TypeScript)
│   ├── time.ts               # GET /api/time endpoint
│   ├── place-order.ts        # POST /api/place-order endpoint
│   └── _lib/                 # Shared utilities
│       ├── binance.ts        # Binance API client
│       ├── validate.ts       # Validation helpers
│       └── types.ts          # TypeScript types
├── docs/
│   ├── ARCHITECTURE.md       # Architecture & data flow diagrams
│   └── STEP_BY_STEP.md       # Detailed setup & run walkthrough
├── logs/
│   └── .gitkeep              # Log files stored here
├── cli.py                    # Python CLI entry point
├── package.json              # Node.js dependencies
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel deployment config
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── CHECKLIST.md              # Assignment acceptance criteria
```

## Quick Start

### 🚀 Deploy to Vercel (Recommended)

```bash
# 1. Clone and navigate
cd trading_bot

# 2. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 3. Deploy to Vercel
# Visit https://vercel.com/new
# Import your repo
# Add environment variables:
#   BINANCE_API_KEY
#   BINANCE_API_SECRET
#   BINANCE_BASE_URL=https://testnet.binancefuture.com
#   DASHBOARD_TOKEN (optional)
# Click Deploy!
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.**

### 🐍 Local Development

```bash
# 1. Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your Binance testnet API keys

# 4. Run dashboard
python run_local_dashboard.py
```

Visit http://localhost:5000

---

### 3. Configure API Credentials

Get your API keys from [Binance Futures Testnet](https://testnet.binancefuture.com).

**Option A: Environment Variables**

**Windows (PowerShell):**
```powershell
$env:BINANCE_API_KEY="your_api_key_here"
$env:BINANCE_API_SECRET="your_api_secret_here"
```

**macOS/Linux:**
```bash
export BINANCE_API_KEY="your_api_key_here"
export BINANCE_API_SECRET="your_api_secret_here"
```

**Option B: .env File**

```bash
cp .env.example .env
# Edit .env and add your credentials
```

## Usage

### Test Connection

Verify connectivity to Binance Futures Testnet:

```bash
python cli.py test-connection
```

**Expected Output:**
```
Testing connection to Binance Futures Testnet...
Base URL: https://testnet.binancefuture.com
✓ Connection successful!
```

### Place MARKET Order

```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
```

**Example Output:**
```
==================================================
ORDER REQUEST SUMMARY
==================================================
Symbol:       BTCUSDT
Side:         BUY
Type:         MARKET
Quantity:     0.001
==================================================

==================================================
ORDER RESPONSE
==================================================
Order ID: 12345678
Symbol: BTCUSDT
Status: FILLED
Side: BUY
Type: MARKET
Quantity: 0.001
Executed Qty: 0.001
Average Price: 65432.10
==================================================

✓ Order placed successfully!
```

### Place LIMIT Order

```bash
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500
```

### Dry Run Mode

Test order validation without sending to exchange:

```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run
```

**Output:**
```
==================================================
ORDER REQUEST SUMMARY
==================================================
Symbol:       BTCUSDT
Side:         BUY
Type:         MARKET
Quantity:     0.001
==================================================

DRY RUN MODE: Order not sent to exchange.
Remove --dry-run flag to place the order.
```

## Logging

All API requests, responses, and errors are logged to `logs/trading_bot.log`.

- **Rotating file handler**: 1MB max size, 3 backup files
- **Sanitized logging**: API signatures are redacted
- **Detailed error traces**: Full stack traces for debugging

**View logs:**
```bash
# Windows
type logs\trading_bot.log

# macOS/Linux
cat logs/trading_bot.log
```

---

## 🌐 Web Dashboard (Bonus)

A deployed web interface for placing orders via browser!

### Quick Start

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

3. **Deploy to Vercel:**
   ```bash
   npm run deploy
   ```

### Features

- 🌐 Clean single-page UI (HTML/CSS/JS)
- 🔐 Secure: API keys stored server-side only
- 📊 MARKET, LIMIT, and STOP order support (STOP is bonus!)
- ✅ Dry-run mode
- 🎯 Real-time connection testing

### Deploy to Vercel

1. Push repo to GitHub
2. Import to Vercel: https://vercel.com/new
3. Set environment variables:
   - `BINANCE_API_KEY`
   - `BINANCE_API_SECRET`
   - `BINANCE_BASE_URL=https://testnet.binancefuture.com`
   - `DASHBOARD_TOKEN` (optional security)
4. Deploy!

**Full documentation:** See [web/README_WEB.md](web/README_WEB.md)

---

## 🎯 STOP Order Implementation (Binance Dec 2025 Migration)

### The Challenge

**Binance migrated STOP orders to a new endpoint in December 2025:**
- Old: `/fapi/v1/order` (regular orders)
- New: `/fapi/v1/algoOrder` (conditional orders)

**Order types affected:**
- `STOP` (stop-limit)
- `STOP_MARKET`
- `TAKE_PROFIT`
- `TAKE_PROFIT_MARKET`

### Our Solution

**Smart Endpoint Routing:**
```python
# Backend automatically routes to correct endpoint
if order_type in ['STOP', 'STOP_MARKET', ...]:
    endpoint = '/fapi/v1/algoOrder'
    params['algoType'] = 'CONDITIONAL'
    params['triggerPrice'] = stopPrice  # KEY: triggerPrice not stopPrice!
else:
    endpoint = '/fapi/v1/order'
```

**Frontend Validation:**
- **BUY STOP**: Trigger must be **ABOVE** current price (breakout logic)
- **SELL STOP**: Trigger must be **BELOW** current price (stop-loss logic)
- Real-time validation blocks invalid orders with clear error messages
- Dynamic hints update based on selected side and current market price

**Position Tracking:**
- Regular positions from `/fapi/v2/positionRisk`
- Algo orders from `/fapi/v1/algoOrders`
- Combined display shows both active positions and pending STOP orders
- Timestamps converted to local timezone

**Example:**
```
Current ETH Price: $2264

❌ BUY STOP with trigger=$2200 → Rejected (would immediately trigger)
✅ BUY STOP with trigger=$2350 → Accepted (breakout order)
✅ SELL STOP with trigger=$2200 → Accepted (stop-loss order)
```

### Why This Matters

- ✅ **Production-ready**: Handles real Binance API changes
- ✅ **Educational**: Users learn proper STOP order logic
- ✅ **Future-proof**: Works with latest Binance Futures API (2025+)
- ✅ **Complete**: Supports all conditional order types

---

## Assumptions

1. **Testnet Environment**: All orders are placed on Binance Futures Testnet (not production)
2. **USDT-M Futures**: Symbols must end with "USDT" (basic validation)
3. **Default Time-in-Force**: LIMIT orders use "GTC" (Good-Till-Cancel)
4. **Quantity Precision**: No automatic precision adjustment; user must provide valid quantity
5. **API Key Security**: Never commit API keys; always use environment variables or .env file
6. **Logging Retention**: Old logs are automatically rotated and kept for debugging

## Error Handling

The bot handles various error scenarios:

- ✅ **Validation Errors**: Invalid symbol, side, type, quantity, or price
- ✅ **API Errors**: Binance error responses (invalid keys, insufficient margin, etc.)
- ✅ **Network Errors**: Timeouts, connection failures, DNS issues
- ✅ **Missing Credentials**: Clear instructions if API keys not set

All errors are logged and displayed with user-friendly messages.

## Troubleshooting

See [docs/STEP_BY_STEP.md](docs/STEP_BY_STEP.md) for detailed troubleshooting guide.

## Submission Checklist

See [CHECKLIST.md](CHECKLIST.md) for complete assignment acceptance criteria.

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture and data flow diagrams
- **[STEP_BY_STEP.md](docs/STEP_BY_STEP.md)**: Comprehensive setup and run walkthrough
- **[LIVE_PRICES.md](docs/LIVE_PRICES.md)**: Live price updates technical writeup
- **[CHECKLIST.md](CHECKLIST.md)**: Assignment requirements checklist

## License

Built for educational purposes as part of the PrimeTrade.ai internship assignment.
