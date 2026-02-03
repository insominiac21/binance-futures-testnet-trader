# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

✅ Python 3.8+ installed  
✅ `uv` package manager installed  
✅ Binance Futures Testnet account with API keys

## 🚀 Fast Setup (5 Steps)

### 1️⃣ Create & Activate Virtual Environment

**Windows (PowerShell):**
```powershell
uv venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
uv venv .venv
source .venv/bin/activate
```

### 2️⃣ Install Dependencies

```bash
uv pip install -r requirements.txt
```

### 3️⃣ Set API Credentials

**Quick Method (Environment Variables):**

**Windows (PowerShell):**
```powershell
$env:BINANCE_API_KEY="your_api_key"
$env:BINANCE_API_SECRET="your_secret_key"
```

**macOS/Linux:**
```bash
export BINANCE_API_KEY="your_api_key"
export BINANCE_API_SECRET="your_secret_key"
```

**Persistent Method (.env file):**
```bash
cp .env.example .env
# Edit .env and add your keys
```

### 4️⃣ Test Connection

```bash
python cli.py test-connection
```

Expected: `✓ Connection successful!`

### 5️⃣ Place Your First Order

**MARKET Order:**
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
```

**LIMIT Order:**
```bash
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500
```

## 🎯 Common Commands

| Action | Command |
|--------|---------|
| **Test connection** | `python cli.py test-connection` |
| **Buy BTC (market)** | `python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001` |
| **Sell ETH (limit)** | `python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500` |
| **Dry run (test)** | `python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run` |
| **View logs** | `cat logs/trading_bot.log` (Linux/Mac) or `type logs\trading_bot.log` (Windows) |

## 🔍 Verify Success

### Check Order Output
```
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

### Check Logs
```bash
tail logs/trading_bot.log
```

Look for:
```
INFO - Order placed successfully: 12345678
```

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **"API credentials not found"** | Set `BINANCE_API_KEY` and `BINANCE_API_SECRET` environment variables |
| **"Invalid API-key"** | Verify keys from testnet dashboard; ensure Futures trading enabled |
| **"Timestamp outside recvWindow"** | Sync your system clock: Settings → Date & Time → Sync now |
| **"Connection timeout"** | Check internet; verify https://testnet.binancefuture.com is accessible |
| **"Precision is over maximum"** | Use valid quantity (e.g., 0.001, 0.01) for the symbol |
| **"Margin is insufficient"** | Add testnet USDT to your Futures wallet |

## 📚 Full Documentation

- **Detailed Setup:** [docs/STEP_BY_STEP.md](docs/STEP_BY_STEP.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Full README:** [README.md](README.md)
- **Requirements Checklist:** [CHECKLIST.md](CHECKLIST.md)

## 🎓 Assignment Deliverables

✅ Place at least **1 MARKET order**  
✅ Place at least **1 LIMIT order**  
✅ Review `logs/trading_bot.log` for request/response logs  
✅ Verify all checklist items in [CHECKLIST.md](CHECKLIST.md)

---

**Time to complete:** ~5 minutes  
**Estimated review time:** <60 minutes

🚀 **Happy Trading on Testnet!**
