# trading_bot/bot/validators.py
"""
Input validation utilities for CLI arguments.
"""

from typing import Literal, Optional


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


def validate_symbol(symbol: str) -> str:
    """
    Validate trading symbol.
    
    Args:
        symbol: Trading pair symbol
    
    Returns:
        Validated and normalized symbol
    
    Raises:
        ValidationError: If symbol is invalid
    """
    if not symbol:
        raise ValidationError("Symbol cannot be empty")
    
    symbol = symbol.upper().strip()
    
    # Basic check: should end with USDT for USDT-M futures
    if not symbol.endswith("USDT"):
        raise ValidationError(
            f"Invalid symbol '{symbol}'. "
            "Symbol must end with 'USDT' for USDT-M futures."
        )
    
    return symbol


def validate_side(side: str) -> Literal["BUY", "SELL"]:
    """
    Validate order side.
    
    Args:
        side: Order side (buy/sell)
    
    Returns:
        Validated and normalized side
    
    Raises:
        ValidationError: If side is invalid
    """
    side_upper = side.upper().strip()
    
    if side_upper not in ["BUY", "SELL"]:
        raise ValidationError(
            f"Invalid side '{side}'. Must be 'BUY' or 'SELL'."
        )
    
    return side_upper  # type: ignore


def validate_order_type(order_type: str) -> Literal["MARKET", "LIMIT"]:
    """
    Validate order type.
    
    Args:
        order_type: Order type (market/limit)
    
    Returns:
        Validated and normalized order type
    
    Raises:
        ValidationError: If order type is invalid
    """
    type_upper = order_type.upper().strip()
    
    if type_upper not in ["MARKET", "LIMIT"]:
        raise ValidationError(
            f"Invalid order type '{order_type}'. Must be 'MARKET' or 'LIMIT'."
        )
    
    return type_upper  # type: ignore


def validate_quantity(quantity: str) -> float:
    """
    Validate order quantity.
    
    Args:
        quantity: Order quantity as string
    
    Returns:
        Validated quantity as float
    
    Raises:
        ValidationError: If quantity is invalid
    """
    try:
        qty = float(quantity)
    except ValueError:
        raise ValidationError(
            f"Invalid quantity '{quantity}'. Must be a valid number."
        )
    
    if qty <= 0:
        raise ValidationError(
            f"Invalid quantity '{qty}'. Must be greater than 0."
        )
    
    return qty


def validate_price(price: Optional[str], order_type: str) -> Optional[float]:
    """
    Validate order price.
    
    Args:
        price: Order price as string (optional)
        order_type: Order type (MARKET or LIMIT)
    
    Returns:
        Validated price as float, or None for MARKET orders
    
    Raises:
        ValidationError: If price validation fails
    """
    order_type_upper = order_type.upper()
    
    # LIMIT orders require price
    if order_type_upper == "LIMIT":
        if price is None:
            raise ValidationError(
                "Price is required for LIMIT orders. Use --price option."
            )
        
        try:
            price_float = float(price)
        except ValueError:
            raise ValidationError(
                f"Invalid price '{price}'. Must be a valid number."
            )
        
        if price_float <= 0:
            raise ValidationError(
                f"Invalid price '{price_float}'. Must be greater than 0."
            )
        
        return price_float
    
    # MARKET orders should not have price
    elif order_type_upper == "MARKET":
        if price is not None:
            # Warn and ignore (could also raise error)
            return None
        return None
    
    return None


def validate_order_params(
    symbol: str,
    side: str,
    order_type: str,
    quantity: str,
    price: Optional[str] = None
) -> tuple[str, str, str, float, Optional[float]]:
    """
    Validate all order parameters.
    
    Args:
        symbol: Trading pair symbol
        side: Order side
        order_type: Order type
        quantity: Order quantity
        price: Order price (optional)
    
    Returns:
        Tuple of validated (symbol, side, type, quantity, price)
    
    Raises:
        ValidationError: If any validation fails
    """
    validated_symbol = validate_symbol(symbol)
    validated_side = validate_side(side)
    validated_type = validate_order_type(order_type)
    validated_quantity = validate_quantity(quantity)
    validated_price = validate_price(price, validated_type)
    
    return (
        validated_symbol,
        validated_side,
        validated_type,
        validated_quantity,
        validated_price
    )
