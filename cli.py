# trading_bot/cli.py
"""
Command-line interface for the Binance Futures trading bot.
"""

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from bot.client import BinanceFuturesClient, BinanceClientError, BinanceNetworkError
from bot.logging_config import setup_logger
from bot.orders import (
    create_order_request,
    place_order,
    print_order_summary,
    print_order_response,
    OrderError
)
from bot.validators import ValidationError


# Load environment variables from .env file if it exists
load_dotenv()

logger = setup_logger()


def get_api_credentials() -> tuple[str, str]:
    """
    Get API credentials from environment variables.
    
    Returns:
        Tuple of (api_key, api_secret)
    
    Raises:
        SystemExit: If credentials are not set
    """
    api_key = os.getenv("BINANCE_API_KEY")
    api_secret = os.getenv("BINANCE_API_SECRET")
    
    if not api_key or not api_secret:
        print("ERROR: API credentials not found in environment variables.")
        print("Please set BINANCE_API_KEY and BINANCE_API_SECRET.")
        print("\nOn Windows (PowerShell):")
        print('  $env:BINANCE_API_KEY="your_api_key"')
        print('  $env:BINANCE_API_SECRET="your_api_secret"')
        print("\nOn macOS/Linux (bash/zsh):")
        print('  export BINANCE_API_KEY="your_api_key"')
        print('  export BINANCE_API_SECRET="your_api_secret"')
        print("\nOr create a .env file in the project root.")
        sys.exit(1)
    
    return api_key, api_secret


def get_base_url() -> str:
    """
    Get base URL from environment or use testnet default.
    
    Returns:
        Base URL for Binance Futures API
    """
    return os.getenv("BINANCE_BASE_URL", "https://testnet.binancefuture.com")


def cmd_test_connection(args: argparse.Namespace) -> int:
    """
    Test connection to Binance Futures API.
    
    Args:
        args: Command-line arguments
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    print("Testing connection to Binance Futures Testnet...")
    
    try:
        api_key, api_secret = get_api_credentials()
        base_url = get_base_url()
        
        print(f"Base URL: {base_url}")
        
        with BinanceFuturesClient(api_key, api_secret, base_url) as client:
            client.test_connectivity()
        
        print("✓ Connection successful!")
        return 0
    
    except BinanceNetworkError as e:
        print(f"✗ Connection failed: {e}")
        return 1
    
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        logger.error(f"Test connection error: {e}", exc_info=True)
        return 1


def cmd_place_order(args: argparse.Namespace) -> int:
    """
    Place an order on Binance Futures.
    
    Args:
        args: Command-line arguments
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    try:
        # Create order request (validates inputs)
        order_request = create_order_request(
            symbol=args.symbol,
            side=args.side,
            order_type=args.type,
            quantity=args.quantity,
            price=args.price
        )
        
        # Print order summary
        print_order_summary(order_request)
        
        # Dry run mode - don't actually place order
        if args.dry_run:
            print("DRY RUN MODE: Order not sent to exchange.")
            print("Remove --dry-run flag to place the order.")
            return 0
        
        # Get credentials and create client
        api_key, api_secret = get_api_credentials()
        base_url = get_base_url()
        
        # Place the order
        with BinanceFuturesClient(api_key, api_secret, base_url) as client:
            response = place_order(client, order_request)
        
        # Print response
        print_order_response(response)
        print("✓ Order placed successfully!")
        
        return 0
    
    except ValidationError as e:
        print(f"✗ Validation Error: {e}")
        return 1
    
    except BinanceClientError as e:
        print(f"✗ API Error: {e}")
        return 1
    
    except BinanceNetworkError as e:
        print(f"✗ Network Error: {e}")
        return 1
    
    except OrderError as e:
        print(f"✗ Order Error: {e}")
        return 1
    
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        logger.error(f"Place order error: {e}", exc_info=True)
        return 1


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Binance Futures Testnet Trading Bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Test connection:
    python cli.py test-connection
  
  Place MARKET order:
    python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001
  
  Place LIMIT order:
    python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.01 --price 3500
  
  Dry run (don't send order):
    python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001 --dry-run
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Test connection command
    parser_test = subparsers.add_parser(
        "test-connection",
        help="Test connection to Binance Futures API"
    )
    
    # Place order command
    parser_order = subparsers.add_parser(
        "place-order",
        help="Place an order on Binance Futures"
    )
    parser_order.add_argument(
        "--symbol",
        required=True,
        help="Trading pair symbol (e.g., BTCUSDT)"
    )
    parser_order.add_argument(
        "--side",
        required=True,
        choices=["BUY", "SELL", "buy", "sell"],
        help="Order side: BUY or SELL"
    )
    parser_order.add_argument(
        "--type",
        required=True,
        choices=["MARKET", "LIMIT", "market", "limit"],
        help="Order type: MARKET or LIMIT"
    )
    parser_order.add_argument(
        "--quantity",
        required=True,
        help="Order quantity"
    )
    parser_order.add_argument(
        "--price",
        help="Order price (required for LIMIT orders)"
    )
    parser_order.add_argument(
        "--dry-run",
        action="store_true",
        help="Print order summary but don't send to exchange"
    )
    
    # Parse arguments
    args = parser.parse_args()
    
    # Show help if no command specified
    if not args.command:
        parser.print_help()
        return 0
    
    # Route to appropriate command handler
    if args.command == "test-connection":
        return cmd_test_connection(args)
    elif args.command == "place-order":
        return cmd_place_order(args)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
