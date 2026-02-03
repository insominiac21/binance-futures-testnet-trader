# Step-by-Step Setup & Run Walkthrough

This guide provides a comprehensive walkthrough for setting up and running the Binance Futures trading bot from scratch.

## Table of Contents

1. [Create Binance Futures Testnet Account](#1-create-binance-futures-testnet-account)
2. [Set Up Python Environment](#2-set-up-python-environment)
3. [Configure API Credentials](#3-configure-api-credentials)
4. [Test Connection](#4-test-connection)
5. [Place Orders](#5-place-orders)
6. [View Logs](#6-view-logs)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Create Binance Futures Testnet Account

### Step 1.1: Register for Testnet

1. Navigate to the Binance Futures Testnet website
2. Create an account (email + password)
3. Verify your email address
4. Log in to the testnet dashboard

### Step 1.2: Generate API Keys

1. In the testnet dashboard, navigate to **API Management**
2. Click **Create API Key**
3. Name your API key (e.g., "TradingBot")
4. Complete any security verification (if required)
5. **IMPORTANT**: Copy and save both:
   - **API Key** (public identifier)
   - **Secret Key** (private, never share)
6. Enable **Futures Trading** permissions for the API key

### Step 1.3: Add Testnet Funds

1. In the testnet dashboard, find the **Deposit** or **Get Testnet Funds** option
2. Add testnet USDT to your Futures account (usually a button click)
3. Verify funds appear in your **Futures Wallet**

---

## 2. Set Up Python Environment

### Step 2.1: Verify Python Installation

**Check Python version (3.8+ required):**

```bash
python --version
```

If Python is not installed, download from [python.org](https://www.python.org/downloads/).

### Step 2.2: Install `uv` Package Manager

**Windows (PowerShell):**
```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify installation:
```bash
uv --version
```

### Step 2.3: Navigate to Project Directory

```bash
cd path/to/trading_bot
```

### Step 2.4: Create Virtual Environment

**Windows (PowerShell):**
```powershell
uv venv .venv
```

**macOS/Linux:**
```bash
uv venv .venv
```

This creates a `.venv/` directory in your project.

### Step 2.5: Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

If you get an execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

**Verify activation:** Your prompt should now show `(.venv)` prefix.

### Step 2.6: Install Dependencies

```bash
uv pip install -r requirements.txt
```

**Expected output:**
```
Resolved 3 packages in 1.2s
Installed 3 packages in 0.5s
 + httpx==0.27.0
 + python-dotenv==1.0.1
 + ...
```

---

## 3. Configure API Credentials

You have **two options** for setting API credentials:

### Option A: Environment Variables (Temporary)

**Windows (PowerShell):**
```powershell
$env:BINANCE_API_KEY="your_api_key_from_testnet"
$env:BINANCE_API_SECRET="your_secret_key_from_testnet"
```

**macOS/Linux (bash/zsh):**
```bash
export BINANCE_API_KEY="your_api_key_from_testnet"
export BINANCE_API_SECRET="your_secret_key_from_testnet"
```

⚠️ **Note**: These variables only persist for the current terminal session.

### Option B: .env File (Persistent, Recommended)

**Step 1:** Copy the example file:
```bash
cp .env.example .env
```

**Step 2:** Edit `.env` file:
```bash
# Windows
notepad .env

# macOS/Linux
nano .env
# or
code .env  # if using VS Code
```

**Step 3:** Replace placeholders with your actual credentials:
```
BINANCE_API_KEY=abc123your_actual_api_key_here
BINANCE_API_SECRET=xyz789your_actual_secret_here
```

**Step 4:** Save and close the file.

✅ **Advantage**: Credentials persist across terminal sessions and are auto-loaded by `python-dotenv`.

⚠️ **Security**: `.env` is in `.gitignore` and will NOT be committed to git.

---

## 4. Test Connection

Verify that everything is configured correctly before placing orders.

### Command

```bash
python cli.py test-connection
```

### Expected Success Output

```
Testing connection to Binance Futures Testnet...
Base URL: https://testnet.binancefuture.com
✓ Connection successful!
```

### Possible Errors

#### Error: "API credentials not found"

**Output:**
```
ERROR: API credentials not found in environment variables.
Please set BINANCE_API_KEY and BINANCE_API_SECRET.
```

**Solution:** Go back to [Step 3](#3-configure-api-credentials) and set your credentials.

#### Error: "Connection timeout"

**Output:**
```
✗ Connection failed: Connection timeout. Please check your internet connection.
```

**Solution:**
- Check your internet connection
- Verify you can access https://testnet.binancefuture.com in a browser
- Check if a firewall/VPN is blocking access

---

## 5. Place Orders

### 5.1: Place a MARKET Order (BUY)

#### Command

```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
```

#### Expected Output

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
Order ID: 283764823
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

✅ **Success!** You've placed your first order.

### 5.2: Place a LIMIT Order (SELL)

#### Command

```bash
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500
```

#### Expected Output

```
==================================================
ORDER REQUEST SUMMARY
==================================================
Symbol:       ETHUSDT
Side:         SELL
Type:         LIMIT
Quantity:     0.01
Price:        3500.0
Time in Force: GTC
==================================================

==================================================
ORDER RESPONSE
==================================================
Order ID: 283764824
Symbol: ETHUSDT
Status: NEW
Side: SELL
Type: LIMIT
Quantity: 0.01
Executed Qty: 0.0
Price: 3500.0
==================================================

✓ Order placed successfully!
```

**Note:** LIMIT orders may have `Status: NEW` (pending) until the price is reached.

### 5.3: Dry Run Mode (Testing)

Test order validation **without** actually sending to the exchange:

#### Command

```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run
```

#### Expected Output

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

✅ **Perfect for testing** before placing real (testnet) orders.

---

## 6. View Logs

All API requests, responses, and errors are logged to `logs/trading_bot.log`.

### View Logs

**Windows (PowerShell):**
```powershell
Get-Content logs\trading_bot.log -Tail 50
```

**Windows (Command Prompt):**
```cmd
type logs\trading_bot.log
```

**macOS/Linux:**
```bash
tail -f logs/trading_bot.log  # Follow mode (live updates)
# or
cat logs/trading_bot.log      # View entire file
```

### Example Log Output

```
2026-02-04 10:15:32 - trading_bot - INFO - Creating order request: BTCUSDT BUY MARKET 0.001
2026-02-04 10:15:32 - trading_bot - INFO - Placing order: POST /fapi/v1/order
2026-02-04 10:15:32 - trading_bot - DEBUG - Request params: {'symbol': 'BTCUSDT', 'side': 'BUY', 'type': 'MARKET', 'quantity': '0.001', 'timestamp': 1707043532000, 'recvWindow': 5000, 'signature': '[REDACTED]'}
2026-02-04 10:15:33 - trading_bot - INFO - Order response: status=200
2026-02-04 10:15:33 - trading_bot - DEBUG - Response body: {'orderId': 283764823, 'symbol': 'BTCUSDT', ...}
2026-02-04 10:15:33 - trading_bot - INFO - Order placed successfully: 283764823
```

**Note:** Signatures are **[REDACTED]** for security.

### Log Rotation

- **Max file size:** 1MB
- **Backup files:** 3 (trading_bot.log.1, trading_bot.log.2, trading_bot.log.3)
- **Old logs:** Automatically rotated when file size exceeds 1MB

---

## 7. Troubleshooting

### 7.1: Invalid API Key

#### Symptoms

```
✗ API Error: API Error -2015: Invalid API-key, IP, or permissions for action.
```

#### Solutions

1. **Verify API key and secret** are correct (copy-paste from testnet dashboard)
2. **Check API permissions**: Ensure "Futures Trading" is enabled
3. **Regenerate API key** if necessary and update `.env` or environment variables
4. **Testnet vs Production**: Ensure you're using **testnet** keys, not production

### 7.2: Timestamp/recvWindow Error

#### Symptoms

```
✗ API Error: API Error -1021: Timestamp for this request is outside of the recvWindow.
```

#### Causes

- Your system clock is out of sync with Binance servers

#### Solutions

**Windows:**
1. Open **Settings** > **Time & Language** > **Date & Time**
2. Enable **Set time automatically**
3. Click **Sync now**

**macOS:**
```bash
sudo sntp -sS time.apple.com
```

**Linux:**
```bash
sudo ntpdate pool.ntp.org
# or
sudo timedatectl set-ntp true
```

Retry the command after syncing time.

### 7.3: Symbol Not Allowed / Precision Issue

#### Symptoms

```
✗ API Error: API Error -1111: Precision is over the maximum defined for this asset.
```

#### Causes

- Quantity has too many decimal places for the symbol

#### Solutions

1. **Check symbol info** on Binance Testnet (e.g., BTCUSDT min qty = 0.001, step size = 0.001)
2. **Adjust quantity**: Use valid precision (e.g., 0.001, 0.002, not 0.0015)
3. **Common valid quantities**:
   - BTCUSDT: 0.001, 0.01, 0.1
   - ETHUSDT: 0.01, 0.1, 1.0

### 7.4: Insufficient Margin

#### Symptoms

```
✗ API Error: API Error -2019: Margin is insufficient.
```

#### Causes

- Not enough USDT in your Futures wallet

#### Solutions

1. **Add testnet funds**: Go to testnet dashboard and deposit testnet USDT
2. **Reduce order size**: Try a smaller quantity
3. **Check balance**: Verify funds in Futures wallet (not Spot wallet)

### 7.5: HTTP Timeout

#### Symptoms

```
✗ Network Error: Request timeout. The order may or may not have been placed.
```

#### Causes

- Slow network connection
- Binance server issues

#### Solutions

1. **Check internet connection**
2. **Retry the command**
3. **Increase timeout** (advanced): Edit `bot/client.py`, increase `timeout` parameter
4. **Check Binance status**: Verify testnet is operational

### 7.6: Connection Refused

#### Symptoms

```
✗ Network Error: Network error. Please check your connection.
```

#### Causes

- Firewall blocking outbound HTTPS
- VPN/proxy issues
- DNS resolution failure

#### Solutions

1. **Test URL in browser**: Visit https://testnet.binancefuture.com
2. **Disable VPN temporarily**
3. **Check firewall rules**
4. **Try different network** (e.g., mobile hotspot)

### 7.7: Module Not Found

#### Symptoms

```
ModuleNotFoundError: No module named 'httpx'
```

#### Causes

- Dependencies not installed or wrong virtual environment

#### Solutions

1. **Verify virtual environment is activated**: Look for `(.venv)` in prompt
2. **Reinstall dependencies**:
   ```bash
   uv pip install -r requirements.txt
   ```
3. **Check Python path**:
   ```bash
   which python  # macOS/Linux
   where python  # Windows
   ```
   Should point to `.venv/Scripts/python` or `.venv/bin/python`

---

## Additional Tips

### Verify Environment Variables

**Windows (PowerShell):**
```powershell
echo $env:BINANCE_API_KEY
echo $env:BINANCE_API_SECRET
```

**macOS/Linux:**
```bash
echo $BINANCE_API_KEY
echo $BINANCE_API_SECRET
```

Should print your keys (not empty).

### Clear Logs

If you want to start fresh:

**Windows:**
```powershell
Remove-Item logs\trading_bot.log*
```

**macOS/Linux:**
```bash
rm logs/trading_bot.log*
```

### Deactivate Virtual Environment

When done working:

```bash
deactivate
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Activate venv (Windows) | `.\.venv\Scripts\Activate.ps1` |
| Activate venv (macOS/Linux) | `source .venv/bin/activate` |
| Install dependencies | `uv pip install -r requirements.txt` |
| Test connection | `python cli.py test-connection` |
| MARKET order | `python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001` |
| LIMIT order | `python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500` |
| Dry run | `python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run` |
| View logs | `cat logs/trading_bot.log` |
| Deactivate venv | `deactivate` |

---

## Next Steps

1. ✅ Place at least **one MARKET order** and **one LIMIT order**
2. ✅ Review logs in `logs/trading_bot.log`
3. ✅ Experiment with dry-run mode
4. ✅ Review [CHECKLIST.md](../CHECKLIST.md) for submission requirements

🎉 **Congratulations!** You've successfully set up and run the trading bot.
