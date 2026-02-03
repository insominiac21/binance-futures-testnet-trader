# trading_bot/bot/client.py
"""
Binance Futures Testnet REST API client with HMAC SHA256 signing.
"""

import hashlib
import hmac
import time
from typing import Optional
from urllib.parse import urlencode

import httpx

from .logging_config import setup_logger, sanitize_params
from .models import APIError, OrderResponse


class BinanceClientError(Exception):
    """Exception raised for Binance API errors."""
    pass


class BinanceNetworkError(Exception):
    """Exception raised for network-related errors."""
    pass


class BinanceFuturesClient:
    """
    Client for interacting with Binance Futures Testnet API.
    
    Implements HMAC SHA256 signing for authenticated endpoints.
    """
    
    def __init__(
        self,
        api_key: str,
        api_secret: str,
        base_url: str = "https://testnet.binancefuture.com",
        timeout: float = 10.0
    ):
        """
        Initialize Binance Futures client.
        
        Args:
            api_key: Binance API key
            api_secret: Binance API secret
            base_url: Base URL for API (default: testnet)
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.logger = setup_logger()
        
        self.client = httpx.Client(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"X-MBX-APIKEY": self.api_key}
        )
    
    def _generate_signature(self, query_string: str) -> str:
        """
        Generate HMAC SHA256 signature for request.
        
        Args:
            query_string: URL-encoded query string
        
        Returns:
            Hex-encoded signature
        """
        return hmac.new(
            self.api_secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
    
    def _sign_request(self, params: dict) -> dict:
        """
        Sign request parameters with timestamp and signature.
        
        Args:
            params: Request parameters
        
        Returns:
            Parameters with timestamp and signature
        """
        # Add timestamp and recvWindow
        signed_params = params.copy()
        signed_params["timestamp"] = int(time.time() * 1000)
        signed_params["recvWindow"] = 5000
        
        # Create query string and generate signature
        query_string = urlencode(signed_params)
        signature = self._generate_signature(query_string)
        signed_params["signature"] = signature
        
        return signed_params
    
    def test_connectivity(self) -> bool:
        """
        Test connectivity to Binance Futures API.
        
        Returns:
            True if connection successful
        
        Raises:
            BinanceNetworkError: If connection fails
        """
        endpoint = "/fapi/v1/time"
        
        try:
            self.logger.info(f"Testing connectivity: GET {endpoint}")
            response = self.client.get(endpoint)
            
            self.logger.info(
                f"Connectivity test response: status={response.status_code}"
            )
            
            if response.status_code == 200:
                data = response.json()
                self.logger.info(f"Server time: {data.get('serverTime')}")
                return True
            else:
                raise BinanceNetworkError(
                    f"Connectivity test failed: HTTP {response.status_code}"
                )
        
        except httpx.TimeoutException as e:
            self.logger.error(f"Timeout during connectivity test: {e}")
            raise BinanceNetworkError(
                "Connection timeout. Please check your internet connection."
            ) from e
        
        except httpx.NetworkError as e:
            self.logger.error(f"Network error during connectivity test: {e}")
            raise BinanceNetworkError(
                "Network error. Please check your internet connection."
            ) from e
        
        except Exception as e:
            self.logger.error(f"Unexpected error during connectivity test: {e}")
            raise BinanceNetworkError(f"Connectivity test failed: {e}") from e
    
    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None,
        time_in_force: Optional[str] = None
    ) -> OrderResponse:
        """
        Place an order on Binance Futures.
        
        Args:
            symbol: Trading pair symbol
            side: BUY or SELL
            order_type: MARKET or LIMIT
            quantity: Order quantity
            price: Order price (required for LIMIT)
            time_in_force: Time in force (default GTC for LIMIT)
        
        Returns:
            OrderResponse object
        
        Raises:
            BinanceClientError: If API returns an error
            BinanceNetworkError: If network error occurs
        """
        endpoint = "/fapi/v1/order"
        
        # Build parameters
        params = {
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "quantity": str(quantity),
        }
        
        # Add price and timeInForce for LIMIT orders
        if order_type == "LIMIT":
            if price is None:
                raise ValueError("Price is required for LIMIT orders")
            params["price"] = str(price)
            params["timeInForce"] = time_in_force or "GTC"
        
        # Sign the request
        signed_params = self._sign_request(params)
        
        # Log request (sanitized)
        self.logger.info(f"Placing order: POST {endpoint}")
        self.logger.debug(f"Request params: {sanitize_params(signed_params)}")
        
        try:
            response = self.client.post(endpoint, params=signed_params)
            
            self.logger.info(f"Order response: status={response.status_code}")
            
            # Parse response
            response_data = response.json()
            self.logger.debug(f"Response body: {response_data}")
            
            # Check for errors
            if response.status_code != 200:
                error = APIError.from_api_response(response_data)
                self.logger.error(f"API error: {error}")
                raise BinanceClientError(str(error))
            
            # Parse successful response
            order_response = OrderResponse.from_api_response(response_data)
            self.logger.info(f"Order placed successfully: {order_response.order_id}")
            
            return order_response
        
        except httpx.TimeoutException as e:
            self.logger.error(f"Timeout while placing order: {e}")
            raise BinanceNetworkError(
                "Request timeout. The order may or may not have been placed."
            ) from e
        
        except httpx.NetworkError as e:
            self.logger.error(f"Network error while placing order: {e}")
            raise BinanceNetworkError(
                "Network error. Please check your connection."
            ) from e
        
        except BinanceClientError:
            raise
        
        except Exception as e:
            self.logger.error(f"Unexpected error while placing order: {e}", exc_info=True)
            raise BinanceNetworkError(f"Unexpected error: {e}") from e
    
    def close(self):
        """Close the HTTP client."""
        self.client.close()
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
