# trading_bot/bot/orders.py
"""
Order placement business logic layer.
"""

from typing import Optional

from .client import BinanceFuturesClient
from .logging_config import setup_logger
from .models import OrderRequest, OrderResponse
from .validators import validate_order_params, ValidationError


logger = setup_logger()


class OrderError(Exception):
    """Exception raised for order-related errors."""
    pass


def create_order_request(
    symbol: str,
    side: str,
    order_type: str,
    quantity: str,
    price: Optional[str] = None
) -> OrderRequest:
    """
    Create and validate an order request.
    
    Args:
        symbol: Trading pair symbol
        side: Order side (BUY/SELL)
        order_type: Order type (MARKET/LIMIT)
        quantity: Order quantity
        price: Order price (required for LIMIT)
    
    Returns:
        Validated OrderRequest object
    
    Raises:
        ValidationError: If validation fails
    """
    logger.info(f"Creating order request: {symbol} {side} {order_type} {quantity}")
    
    # Validate all parameters
    validated = validate_order_params(symbol, side, order_type, quantity, price)
    symbol_v, side_v, type_v, quantity_v, price_v = validated
    
    # Create order request
    order_request = OrderRequest(
        symbol=symbol_v,
        side=side_v,
        order_type=type_v,
        quantity=quantity_v,
        price=price_v,
        time_in_force="GTC" if type_v == "LIMIT" else None
    )
    
    logger.debug(f"Order request created: {order_request}")
    return order_request


def place_order(
    client: BinanceFuturesClient,
    order_request: OrderRequest
) -> OrderResponse:
    """
    Place an order using the Binance client.
    
    Args:
        client: BinanceFuturesClient instance
        order_request: Validated OrderRequest
    
    Returns:
        OrderResponse from the API
    
    Raises:
        OrderError: If order placement fails
    """
    try:
        logger.info(f"Placing order: {order_request.symbol} {order_request.side} {order_request.order_type}")
        
        response = client.place_order(
            symbol=order_request.symbol,
            side=order_request.side,
            order_type=order_request.order_type,
            quantity=order_request.quantity,
            price=order_request.price,
            time_in_force=order_request.time_in_force
        )
        
        logger.info(f"Order placed successfully: Order ID {response.order_id}")
        return response
    
    except Exception as e:
        logger.error(f"Failed to place order: {e}", exc_info=True)
        raise OrderError(f"Order placement failed: {e}") from e


def print_order_summary(order_request: OrderRequest) -> None:
    """
    Print a formatted summary of the order request.
    
    Args:
        order_request: OrderRequest to summarize
    """
    print("\n" + "=" * 50)
    print("ORDER REQUEST SUMMARY")
    print("=" * 50)
    print(f"Symbol:       {order_request.symbol}")
    print(f"Side:         {order_request.side}")
    print(f"Type:         {order_request.order_type}")
    print(f"Quantity:     {order_request.quantity}")
    
    if order_request.price:
        print(f"Price:        {order_request.price}")
    
    if order_request.time_in_force:
        print(f"Time in Force: {order_request.time_in_force}")
    
    print("=" * 50 + "\n")


def print_order_response(response: OrderResponse) -> None:
    """
    Print a formatted order response.
    
    Args:
        response: OrderResponse to print
    """
    print("\n" + "=" * 50)
    print("ORDER RESPONSE")
    print("=" * 50)
    print(response)
    print("=" * 50 + "\n")
