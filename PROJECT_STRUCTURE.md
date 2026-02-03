# Project Directory Tree

```
trading_bot/
│
├── bot/                          # Core trading bot package
│   ├── __init__.py               # Package initialization
│   ├── client.py                 # Binance Futures REST client (HMAC SHA256 signing)
│   ├── models.py                 # Data models (OrderRequest, OrderResponse, APIError)
│   ├── orders.py                 # Order placement business logic
│   ├── validators.py             # Input validation utilities
│   └── logging_config.py         # Logger configuration with rotating file handler
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Architecture overview & data flow diagrams
│   └── STEP_BY_STEP.md           # Detailed setup and run walkthrough
│
├── logs/                         # Log files directory
│   └── .gitkeep                  # Keeps directory in git
│   └── trading_bot.log           # (generated) Main log file
│
├── cli.py                        # CLI entry point (argparse-based)
├── README.md                     # Main project documentation
├── CHECKLIST.md                  # Assignment acceptance criteria checklist
├── requirements.txt              # Python dependencies (httpx, python-dotenv)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
│
└── .venv/                        # (created by user) Virtual environment
    └── ...                       # (not committed to git)
```

## File Descriptions

### Core Application Files

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `cli.py` | CLI entry point | ~200 | argparse, command routing, env var loading |
| `bot/client.py` | API client | ~250 | HMAC SHA256 signing, httpx, error handling |
| `bot/orders.py` | Business logic | ~120 | Order creation, validation orchestration |
| `bot/validators.py` | Input validation | ~180 | Type-safe validation, clear error messages |
| `bot/models.py` | Data models | ~120 | OrderRequest, OrderResponse dataclasses |
| `bot/logging_config.py` | Logging setup | ~80 | Rotating file handler, sanitization |

### Documentation Files

| File | Purpose | Pages | Key Sections |
|------|---------|-------|--------------|
| `README.md` | Main docs | 3 | Setup, usage, examples, assumptions |
| `docs/ARCHITECTURE.md` | Architecture | 5 | High-level design, data flow, diagrams |
| `docs/STEP_BY_STEP.md` | Tutorial | 8 | Setup walkthrough, troubleshooting |
| `CHECKLIST.md` | Requirements | 4 | Acceptance criteria mapping |

### Configuration Files

| File | Purpose | Content |
|------|---------|---------|
| `requirements.txt` | Dependencies | httpx, python-dotenv |
| `.env.example` | Env template | API key placeholders |
| `.gitignore` | Git rules | Python, venv, logs, .env |

## Total Project Stats

- **Total Python Files:** 7
- **Total Lines of Code:** ~950
- **Total Documentation Pages:** ~20
- **Total Files:** 14 (excluding generated logs/venv)

## Dependency Graph

```
cli.py
 ├─> bot/orders.py
 │    ├─> bot/client.py
 │    │    ├─> bot/models.py
 │    │    └─> bot/logging_config.py
 │    ├─> bot/validators.py
 │    └─> bot/models.py
 └─> bot/logging_config.py
```

## Execution Flow

```
1. User runs: python cli.py place-order --symbol BTCUSDT ...
2. cli.py parses arguments
3. cli.py loads API credentials from environment
4. bot/orders.py creates order request
5. bot/validators.py validates all inputs
6. bot/models.py constructs OrderRequest dataclass
7. bot/client.py signs request with HMAC SHA256
8. bot/client.py sends POST to Binance Futures API
9. bot/logging_config.py logs request/response
10. bot/models.py parses OrderResponse
11. cli.py displays formatted output to user
```

## Key Design Patterns

- **Layered Architecture**: CLI → Business Logic → Client → API
- **Dependency Injection**: Client passed to order functions
- **Data Transfer Objects**: Dataclasses for type-safe data
- **Context Managers**: HTTP client resource management
- **Exception Hierarchy**: Custom exceptions for different error types
- **Single Responsibility**: Each module has one clear purpose

## Development Workflow

```bash
# 1. Setup
uv venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1 on Windows
uv pip install -r requirements.txt

# 2. Configure
cp .env.example .env
# Edit .env with your API keys

# 3. Test
python cli.py test-connection

# 4. Trade
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001

# 5. Review
cat logs/trading_bot.log
```
