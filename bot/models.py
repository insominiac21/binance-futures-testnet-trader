# trading_bot/bot/models.py
"""
Data models for order requests and responses.
"""

from dataclasses import dataclass
from typing import Optional, Literal


@dataclass
class OrderRequest:
    """Represents an order request to be sent to Binance."""
    symbol: str
    side: Literal["BUY", "SELL"]
    order_type: Literal["MARKET", "LIMIT"]
    quantity: float
    price: Optional[float] = None
    time_in_force: Optional[str] = None  # Required for LIMIT orders
    
    def to_params(self) -> dict:
        """Convert to API parameters dictionary."""
        params = {
            "symbol": self.symbol,
            "side": self.side,
            "type": self.order_type,
            "quantity": str(self.quantity),
        }
        
        if self.order_type == "LIMIT":
            if self.price is None:
                raise ValueError("Price is required for LIMIT orders")
            params["price"] = str(self.price)
            params["timeInForce"] = self.time_in_force or "GTC"
        
        return params


@dataclass
class OrderResponse:
    """Represents a successful order response from Binance."""
    order_id: int
    symbol: str
    status: str
    side: str
    order_type: str
    quantity: str
    executed_qty: str
    avg_price: Optional[str] = None
    price: Optional[str] = None
    
    @classmethod
    def from_api_response(cls, data: dict) -> "OrderResponse":
        """Create OrderResponse from Binance API response."""
        return cls(
            order_id=data.get("orderId", 0),
            symbol=data.get("symbol", ""),
            status=data.get("status", ""),
            side=data.get("side", ""),
            order_type=data.get("type", ""),
            quantity=data.get("origQty", "0"),
            executed_qty=data.get("executedQty", "0"),
            avg_price=data.get("avgPrice"),
            price=data.get("price"),
        )
    
    def __str__(self) -> str:
        """Pretty print order response."""
        lines = [
            f"Order ID: {self.order_id}",
            f"Symbol: {self.symbol}",
            f"Status: {self.status}",
            f"Side: {self.side}",
            f"Type: {self.order_type}",
            f"Quantity: {self.quantity}",
            f"Executed Qty: {self.executed_qty}",
        ]
        
        if self.avg_price:
            lines.append(f"Average Price: {self.avg_price}")
        elif self.price:
            lines.append(f"Price: {self.price}")
        
        return "\n".join(lines)


@dataclass
class APIError:
    """Represents an error response from Binance API."""
    code: int
    msg: str
    
    @classmethod
    def from_api_response(cls, data: dict) -> "APIError":
        """Create APIError from Binance error response."""
        return cls(
            code=data.get("code", -1),
            msg=data.get("msg", "Unknown error"),
        )
    
    def __str__(self) -> str:
        return f"API Error {self.code}: {self.msg}"
