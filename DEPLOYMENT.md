# Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Binance Testnet API keys

### Step 1: Prepare Repository

1. **Clean unnecessary files:**
   ```bash
   # Already in .gitignore, just verify:
   # - .venv/
   # - .env
   # - __pycache__/
   # - logs/*.log
   # - check_filters.py
   ```

2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy: Binance Futures Dashboard with STOP orders"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Import Project:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `trading_bot` directory as root (if not already)

2. **Configure Environment Variables:**
   ```
   BINANCE_API_KEY=your_testnet_api_key
   BINANCE_API_SECRET=your_testnet_api_secret
   BINANCE_BASE_URL=https://testnet.binancefuture.com
   DASHBOARD_TOKEN=your_optional_token (recommended for security)
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your dashboard will be live at `https://your-app.vercel.app`

### Step 3: Test Deployment

1. **Visit your dashboard URL**
2. **Test connection** - Should show Binance Testnet connection
3. **Check live prices** - Should update every 10 seconds
4. **Place test orders** - Try MARKET, LIMIT, and STOP orders

### Step 4: Update README

Update the live demo URL in README.md:
```markdown
**Dashboard:** [https://your-app.vercel.app](https://your-app.vercel.app)
```

---

## 🛠️ Local Development

### Run Flask Server

```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # macOS/Linux

# Run server
python run_local_dashboard.py
```

Visit http://localhost:5000

### Features

- ✅ Live price updates (10s interval)
- ✅ STOP order validation (enforces trigger logic)
- ✅ Position tracking (shows positions + algo orders)
- ✅ Four order types: MARKET, LIMIT, STOP, STOP_MARKET
- ✅ Debug logging to terminal

---

## 📋 File Structure for Deployment

**Required files:**
```
trading_bot/
├── web/                    # Frontend (static)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── run_local_dashboard.py  # Backend (Python)
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel config
├── .env.example           # Template for env vars
├── README.md              # Documentation
└── DEPLOYMENT.md          # This file
```

**Not needed for deployment (excluded via .gitignore):**
- `.venv/` - Virtual environment
- `.env` - Local env vars (use Vercel env vars instead)
- `logs/` - Log files
- `__pycache__/` - Python cache
- `check_filters.py` - Test script
- `bot/`, `cli.py` - CLI version (optional)
- `api/` - Old TypeScript API (replaced by Python)
- `docs/` - Documentation (optional)

---

## 🔒 Security Best Practices

1. **Never commit API keys**
   - Use `.env` locally
   - Use Vercel environment variables for production

2. **Enable DASHBOARD_TOKEN**
   ```env
   DASHBOARD_TOKEN=your_secret_token_here
   ```
   - Prevents unauthorized access to your dashboard
   - Pass token via X-Dashboard-Token header

3. **Use HTTPS only**
   - Vercel provides HTTPS automatically
   - Never use HTTP in production

4. **Monitor API usage**
   - Check Binance API key restrictions
   - Set IP whitelist if possible

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Make sure `requirements.txt` includes all dependencies:
```txt
flask==3.0.0
httpx==0.25.2
python-dotenv==1.0.0
```

### Issue: STOP orders fail with -4120
**Solution:** This is correct! Check validation:
- BUY STOP: trigger > current price
- SELL STOP: trigger < current price

### Issue: Positions not showing algo orders
**Solution:** Check terminal logs:
```
[DEBUG] Algo orders response status: 200
[DEBUG] Total algo orders: 3
[DEBUG] Active algo orders: 3
```

### Issue: Time showing wrong timezone
**Solution:** Frontend uses `toLocaleString()` - automatically shows local time

---

## 📚 Additional Resources

- **Binance Futures API Docs:** https://developers.binance.com/docs/derivatives/usds-margined-futures
- **Vercel Python Runtime:** https://vercel.com/docs/functions/serverless-functions/runtimes/python
- **Binance Testnet:** https://testnet.binancefuture.com/

---

## ✅ Pre-Deployment Checklist

- [ ] API keys tested on testnet
- [ ] `.env` file NOT committed
- [ ] Requirements.txt up to date
- [ ] All features working locally
- [ ] README updated with live URL
- [ ] .gitignore excludes sensitive files
- [ ] Vercel environment variables configured
- [ ] STOP order validation tested
- [ ] Position tracking shows algo orders
