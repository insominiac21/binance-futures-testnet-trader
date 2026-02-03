# Sample Output Examples

This document shows example outputs for all CLI commands to help you understand what to expect.

---

## 1. Test Connection

### Command
```bash
python cli.py test-connection
```

### Success Output
```
Testing connection to Binance Futures Testnet...
Base URL: https://testnet.binancefuture.com
✓ Connection successful!
```

### Error Output (Invalid Credentials)
```
Testing connection to Binance Futures Testnet...
Base URL: https://testnet.binancefuture.com
✗ Connection failed: Connection timeout. Please check your internet connection.
```

### Error Output (Missing Credentials)
```
ERROR: API credentials not found in environment variables.
Please set BINANCE_API_KEY and BINANCE_API_SECRET.

On Windows (PowerShell):
  $env:BINANCE_API_KEY="your_api_key"
  $env:BINANCE_API_SECRET="your_api_secret"

On macOS/Linux (bash/zsh):
  export BINANCE_API_KEY="your_api_key"
  export BINANCE_API_SECRET="your_api_secret"

Or create a .env file in the project root.
```

---

## 2. Place MARKET Order (BUY)

### Command
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
```

### Success Output
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

---

## 3. Place MARKET Order (SELL)

### Command
```bash
python cli.py place-order --symbol ETHUSDT --side SELL --type MARKET --quantity 0.01
```

### Success Output
```
==================================================
ORDER REQUEST SUMMARY
==================================================
Symbol:       ETHUSDT
Side:         SELL
Type:         MARKET
Quantity:     0.01
==================================================

==================================================
ORDER RESPONSE
==================================================
Order ID: 283764824
Symbol: ETHUSDT
Status: FILLED
Side: SELL
Type: MARKET
Quantity: 0.01
Executed Qty: 0.01
Average Price: 3421.75
==================================================

✓ Order placed successfully!
```

---

## 4. Place LIMIT Order (BUY)

### Command
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001 --price 60000
```

### Success Output
```
==================================================
ORDER REQUEST SUMMARY
==================================================
Symbol:       BTCUSDT
Side:         BUY
Type:         LIMIT
Quantity:     0.001
Price:        60000.0
Time in Force: GTC
==================================================

==================================================
ORDER RESPONSE
==================================================
Order ID: 283764825
Symbol: BTCUSDT
Status: NEW
Side: BUY
Type: LIMIT
Quantity: 0.001
Executed Qty: 0.0
Price: 60000.0
==================================================

✓ Order placed successfully!
```

**Note:** Status is `NEW` because the limit price hasn't been reached yet.

---

## 5. Place LIMIT Order (SELL)

### Command
```bash
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500
```

### Success Output
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
Order ID: 283764826
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

---

## 6. Dry Run Mode

### Command
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run
```

### Output
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

---

## 7. Validation Errors

### Invalid Symbol
```bash
python cli.py place-order --symbol BTC --side BUY --type MARKET --quantity 0.001
```

**Output:**
```
✗ Validation Error: Invalid symbol 'BTC'. Symbol must end with 'USDT' for USDT-M futures.
```

### Invalid Side
```bash
python cli.py place-order --symbol BTCUSDT --side LONG --type MARKET --quantity 0.001
```

**Output:**
```
✗ Validation Error: Invalid side 'LONG'. Must be 'BUY' or 'SELL'.
```

### Invalid Order Type
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type STOP --quantity 0.001
```

**Output:**
```
✗ Validation Error: Invalid order type 'STOP'. Must be 'MARKET' or 'LIMIT'.
```

### Invalid Quantity (Zero)
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0
```

**Output:**
```
✗ Validation Error: Invalid quantity '0.0'. Must be greater than 0.
```

### Invalid Quantity (Negative)
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity -0.001
```

**Output:**
```
✗ Validation Error: Invalid quantity '-0.001'. Must be greater than 0.
```

### Invalid Quantity (Not a Number)
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity abc
```

**Output:**
```
✗ Validation Error: Invalid quantity 'abc'. Must be a valid number.
```

### Missing Price for LIMIT Order
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001
```

**Output:**
```
✗ Validation Error: Price is required for LIMIT orders. Use --price option.
```

### Invalid Price (Zero)
```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001 --price 0
```

**Output:**
```
✗ Validation Error: Invalid price '0.0'. Must be greater than 0.
```

---

## 8. API Errors

### Invalid API Key
```
✗ API Error: API Error -2015: Invalid API-key, IP, or permissions for action.
```

### Timestamp Out of Sync
```
✗ API Error: API Error -1021: Timestamp for this request is outside of the recvWindow.
```

### Precision Error
```
✗ API Error: API Error -1111: Precision is over the maximum defined for this asset.
```

### Insufficient Margin
```
✗ API Error: API Error -2019: Margin is insufficient.
```

---

## 9. Network Errors

### Timeout
```
✗ Network Error: Request timeout. The order may or may not have been placed.
```

### Connection Refused
```
✗ Network Error: Network error. Please check your connection.
```

---

## 10. Help Output

### Main Help
```bash
python cli.py --help
```

**Output:**
```
usage: cli.py [-h] {test-connection,place-order} ...

Binance Futures Testnet Trading Bot

positional arguments:
  {test-connection,place-order}
                        Available commands
    test-connection     Test connection to Binance Futures API
    place-order         Place an order on Binance Futures

optional arguments:
  -h, --help            show this help message and exit

Examples:
  Test connection:
    python cli.py test-connection

  Place MARKET order:
    python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001

  Place LIMIT order:
    python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500

  Dry run (don't send order):
    python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run
```

### Place Order Help
```bash
python cli.py place-order --help
```

**Output:**
```
usage: cli.py place-order [-h] --symbol SYMBOL --side {BUY,SELL,buy,sell} --type {MARKET,LIMIT,market,limit} --quantity QUANTITY [--price PRICE] [--dry-run]

optional arguments:
  -h, --help            show this help message and exit
  --symbol SYMBOL       Trading pair symbol (e.g., BTCUSDT)
  --side {BUY,SELL,buy,sell}
                        Order side: BUY or SELL
  --type {MARKET,LIMIT,market,limit}
                        Order type: MARKET or LIMIT
  --quantity QUANTITY   Order quantity
  --price PRICE         Order price (required for LIMIT orders)
  --dry-run             Print order summary but don't send to exchange
```

---

## 11. Sample Log File Output

### Location
```
logs/trading_bot.log
```

### Sample Contents
```
2026-02-04 10:15:30 - trading_bot - INFO - Creating order request: BTCUSDT BUY MARKET 0.001
2026-02-04 10:15:30 - trading_bot - INFO - Placing order: BTCUSDT BUY MARKET
2026-02-04 10:15:30 - trading_bot - INFO - Placing order: POST /fapi/v1/order
2026-02-04 10:15:30 - trading_bot - DEBUG - Request params: {'symbol': 'BTCUSDT', 'side': 'BUY', 'type': 'MARKET', 'quantity': '0.001', 'timestamp': 1707043530000, 'recvWindow': 5000, 'signature': '[REDACTED]'}
2026-02-04 10:15:31 - trading_bot - INFO - Order response: status=200
2026-02-04 10:15:31 - trading_bot - DEBUG - Response body: {'orderId': 283764823, 'symbol': 'BTCUSDT', 'status': 'FILLED', 'clientOrderId': 'abc123', 'price': '0', 'avgPrice': '65432.10', 'origQty': '0.001', 'executedQty': '0.001', 'cumQty': '0.001', 'cumQuote': '65.43210', 'timeInForce': None, 'type': 'MARKET', 'reduceOnly': False, 'closePosition': False, 'side': 'BUY', 'positionSide': 'BOTH', 'stopPrice': '0', 'workingType': 'CONTRACT_PRICE', 'priceProtect': False, 'origType': 'MARKET', 'updateTime': 1707043531000}
2026-02-04 10:15:31 - trading_bot - INFO - Order placed successfully: 283764823

2026-02-04 10:16:45 - trading_bot - INFO - Creating order request: ETHUSDT SELL LIMIT 0.01
2026-02-04 10:16:45 - trading_bot - INFO - Placing order: ETHUSDT SELL LIMIT
2026-02-04 10:16:45 - trading_bot - INFO - Placing order: POST /fapi/v1/order
2026-02-04 10:16:45 - trading_bot - DEBUG - Request params: {'symbol': 'ETHUSDT', 'side': 'SELL', 'type': 'LIMIT', 'quantity': '0.01', 'price': '3500.0', 'timeInForce': 'GTC', 'timestamp': 1707043605000, 'recvWindow': 5000, 'signature': '[REDACTED]'}
2026-02-04 10:16:46 - trading_bot - INFO - Order response: status=200
2026-02-04 10:16:46 - trading_bot - DEBUG - Response body: {'orderId': 283764824, 'symbol': 'ETHUSDT', 'status': 'NEW', 'clientOrderId': 'xyz789', 'price': '3500.0', 'avgPrice': '0.0', 'origQty': '0.01', 'executedQty': '0.0', 'cumQty': '0.0', 'cumQuote': '0', 'timeInForce': 'GTC', 'type': 'LIMIT', 'reduceOnly': False, 'closePosition': False, 'side': 'SELL', 'positionSide': 'BOTH', 'stopPrice': '0', 'workingType': 'CONTRACT_PRICE', 'priceProtect': False, 'origType': 'LIMIT', 'updateTime': 1707043606000}
2026-02-04 10:16:46 - trading_bot - INFO - Order placed successfully: 283764824
```

**Key Points:**
- ✅ Signatures are **[REDACTED]** (security)
- ✅ Full request and response bodies logged (debugging)
- ✅ Timestamps for all events
- ✅ Clear separation between INFO and DEBUG levels

---

## 12. Exit Codes

| Exit Code | Meaning |
|-----------|---------|
| `0` | Success |
| `1` | Error (validation, API, network, or unexpected) |

---

## Usage Summary

### Quick Commands Reference

```bash
# Test connection
python cli.py test-connection

# MARKET orders
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
python cli.py place-order --symbol ETHUSDT --side SELL --type MARKET --quantity 0.01

# LIMIT orders
python cli.py place-order --symbol BTCUSDT --side BUY --type LIMIT --quantity 0.001 --price 60000
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500

# Dry run (test without sending)
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run

# View logs
cat logs/trading_bot.log           # macOS/Linux
type logs\trading_bot.log          # Windows
Get-Content logs\trading_bot.log   # Windows PowerShell
```

---

**All examples shown are representative. Actual responses will vary based on market conditions and testnet state.**
