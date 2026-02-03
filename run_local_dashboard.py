#!/usr/bin/env python3
"""
Simple local server to run the web dashboard for testing.
This allows testing the UI without Node.js/Vercel.

The API endpoints are implemented as Python Flask routes.
"""
import os
import hmac
import hashlib
import time
from urllib import response
from urllib.parse import urlencode
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='web', static_url_path='')

# Configuration
API_KEY = os.getenv('BINANCE_API_KEY', '')
API_SECRET = os.getenv('BINANCE_API_SECRET', '')
BASE_URL = os.getenv('BINANCE_BASE_URL', 'https://testnet.binancefuture.com')
DASHBOARD_TOKEN = os.getenv('DASHBOARD_TOKEN', '')

# Enforce testnet
if 'testnet' not in BASE_URL.lower():
    raise ValueError("ERROR: Only testnet URLs allowed. Set BINANCE_BASE_URL to testnet URL.")


def generate_signature(params: Dict[str, Any]) -> str:
    """Generate HMAC SHA256 signature for Binance API."""
    query_string = urlencode(params)
    return hmac.new(
        API_SECRET.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory('web', 'index.html')


@app.route('/styles.css')
def styles():
    """Serve the CSS file."""
    return send_from_directory('web', 'styles.css')


@app.route('/app.js')
def app_js():
    """Serve the JavaScript file."""
    return send_from_directory('web', 'app.js')


@app.route('/api/time', methods=['GET'])
def api_time():
    """Test connection to Binance API."""
    try:
        # Optional token check
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        # Make request to Binance
        with httpx.Client() as client:
            response = client.get(f'{BASE_URL}/fapi/v1/time')
            response.raise_for_status()
            data = response.json()
            
            return jsonify({
                'serverTime': data['serverTime'],
                'baseUrl': BASE_URL,
                'message': 'Connection successful!'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/balance', methods=['GET'])
def api_balance():
    """Get account balance."""
    try:
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        params = {
            'timestamp': int(time.time() * 1000),
            'recvWindow': 5000
        }
        params['signature'] = generate_signature(params)
        
        headers = {'X-MBX-APIKEY': API_KEY}
        
        with httpx.Client() as client:
            response = client.get(
                f'{BASE_URL}/fapi/v2/balance',
                params=params,
                headers=headers
            )
            if response.status_code == 200:
                balances = response.json()
                # Filter to show only USDT
                usdt = [b for b in balances if b['asset'] == 'USDT']
                return jsonify({'balance': usdt[0] if usdt else None})
            else:
                return jsonify({'error': response.text}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/positions', methods=['GET'])
def api_positions():
    """Get current open positions and algo orders."""
    try:
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        params = {
            'timestamp': int(time.time() * 1000),
            'recvWindow': 5000
        }
        params['signature'] = generate_signature(params)
        
        headers = {'X-MBX-APIKEY': API_KEY}
        
        # Get open positions
        with httpx.Client() as client:
            response = client.get(
                f'{BASE_URL}/fapi/v2/positionRisk',
                params=params,
                headers=headers
            )
            
            if response.status_code == 200:
                positions = response.json()
                # Filter only positions with non-zero position amount
                active_positions = [p for p in positions if float(p.get('positionAmt', 0)) != 0]
            else:
                active_positions = []
        
        # Get algo orders (STOP orders)
        algo_params = {
            'timestamp': int(time.time() * 1000),
            'recvWindow': 5000
        }
        algo_params['signature'] = generate_signature(algo_params)
        
        with httpx.Client() as client:
            algo_response = client.get(
                f'{BASE_URL}/fapi/v1/algoOrders',
                params=algo_params,
                headers=headers
            )
            
            print(f"[DEBUG] Algo orders response status: {algo_response.status_code}")
            if algo_response.status_code == 200:
                algo_orders = algo_response.json()
                print(f"[DEBUG] Total algo orders: {len(algo_orders)}")
                # Filter only active algo orders (NEW or WORKING status)
                active_algos = [a for a in algo_orders if a.get('algoStatus') in ['NEW', 'WORKING']]
                print(f"[DEBUG] Active algo orders: {len(active_algos)}")
            else:
                print(f"[DEBUG] Algo orders error: {algo_response.text}")
                active_algos = []
        
        return jsonify({
            'positions': active_positions,
            'algoOrders': active_algos
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/prices', methods=['GET'])
def api_prices():
    """Get current market prices for symbols."""
    try:
        # Optional token check
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
        prices = {}
        
        with httpx.Client() as client:
            for symbol in symbols:
                response = client.get(f'{BASE_URL}/fapi/v1/ticker/price', params={'symbol': symbol})
                if response.status_code == 200:
                    data = response.json()
                    prices[symbol] = float(data['price'])
        
        return jsonify({'prices': prices})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/exchange-info', methods=['GET'])
def api_exchange_info():
    """Get exchange information including filters for symbols."""
    try:
        # Optional token check
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        with httpx.Client() as client:
            response = client.get(f'{BASE_URL}/fapi/v1/exchangeInfo')
            if response.status_code == 200:
                data = response.json()
                # Extract only the symbols we support
                supported_symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
                symbol_info = {}
                
                for symbol_data in data.get('symbols', []):
                    if symbol_data['symbol'] in supported_symbols:
                        filters = {}
                        for f in symbol_data.get('filters', []):
                            filters[f['filterType']] = f
                        
                        symbol_info[symbol_data['symbol']] = {
                            'quantityPrecision': symbol_data.get('quantityPrecision'),
                            'pricePrecision': symbol_data.get('pricePrecision'),
                            'filters': filters
                        }
                
                return jsonify({'symbols': symbol_info})
            else:
                return jsonify({'error': 'Failed to fetch exchange info'}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/place-order', methods=['POST'])
def api_place_order():
    """Place an order on Binance Futures."""
    print("[DEBUG] === PLACE ORDER ENDPOINT HIT ===")
    try:
        # Optional token check
        if DASHBOARD_TOKEN:
            token = request.headers.get('X-Dashboard-Token', '')
            if token != DASHBOARD_TOKEN:
                print("[DEBUG] Token validation failed")
                return jsonify({'error': 'Invalid dashboard token'}), 401
        
        # Parse request body
        data = request.get_json()
        print(f"[DEBUG] Received order data: {data}")
        if not data:
            print("[DEBUG] No request body")
            return jsonify({'error': 'Invalid request body'}), 400
        
        # Extract order parameters
        symbol = data.get('symbol', '').upper()
        side = data.get('side', '').upper()
        order_type = data.get('type', '').upper()
        quantity = data.get('quantity')
        price = data.get('price')
        stop_price = data.get('stopPrice')
        dry_run = data.get('dryRun', False)
        
        # Validate required fields
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        if side not in ['BUY', 'SELL']:
            return jsonify({'error': 'Side must be BUY or SELL'}), 400
        if order_type not in ['MARKET', 'LIMIT', 'STOP', 'STOP_MARKET']:
            return jsonify({'error': 'Type must be MARKET, LIMIT, STOP, or STOP_MARKET'}), 400
        if not quantity or float(quantity) <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        # Get current market price for determining STOP order type
        current_price = None
        if order_type in ['LIMIT', 'STOP', 'STOP_MARKET']:
            with httpx.Client() as client:
                price_response = client.get(f'{BASE_URL}/fapi/v1/ticker/price', params={'symbol': symbol})
                if price_response.status_code == 200:
                    current_price = float(price_response.json()['price'])
        
        # Basic parameter validation - let Binance validate ranges
        if order_type == 'LIMIT':
            if not price or float(price) <= 0:
                return jsonify({'error': 'Price is required for LIMIT orders'}), 400
        
        if order_type in ['STOP', 'STOP_MARKET']:
            if not stop_price or float(stop_price) <= 0:
                return jsonify({'error': 'Stop price is required for STOP orders'}), 400
            if order_type == 'STOP' and (not price or float(price) <= 0):
                return jsonify({'error': 'Price is required for STOP limit orders'}), 400
        
        # Dry run - just validate and return
        if dry_run:
            order_params = {
                'symbol': symbol,
                'side': side,
                'type': order_type,
                'quantity': str(quantity)
            }
            if price:
                order_params['price'] = str(price)
            if stop_price:
                order_params['stopPrice'] = str(stop_price)
            
            return jsonify({
                'success': True,
                'dryRun': True,
                'message': 'Order validated successfully (dry run)',
                'params': order_params
            })
        
        # Build order parameters
        timestamp = int(time.time() * 1000)
        params = {
            'symbol': symbol,
            'side': side,
            'timestamp': timestamp,
            'recvWindow': 5000
        }
        
        # Route to correct endpoint based on order type
        # STOP orders moved to Algo endpoint (Dec 2025 Binance migration)
        is_algo_order = order_type in ['STOP', 'STOP_MARKET', 'TAKE_PROFIT', 'TAKE_PROFIT_MARKET', 'TRAILING_STOP_MARKET']
        
        if is_algo_order:
            # Algo Order endpoint - use triggerPrice instead of stopPrice
            params['algoType'] = 'CONDITIONAL'
            params['type'] = order_type
            params['quantity'] = str(quantity)
            params['triggerPrice'] = str(stop_price)  # KEY: triggerPrice not stopPrice
            
            if order_type == 'STOP':
                # STOP is stop-limit: needs price + timeInForce
                params['price'] = str(price)
                params['timeInForce'] = 'GTC'
            # STOP_MARKET only needs triggerPrice + quantity (no price/timeInForce)
            
            endpoint = f'{BASE_URL}/fapi/v1/algoOrder'
        else:
            # Regular order endpoint for MARKET and LIMIT
            params['type'] = order_type
            params['quantity'] = str(quantity)
            
            if order_type == 'LIMIT':
                params['price'] = str(price)
                params['timeInForce'] = 'GTC'
            
            endpoint = f'{BASE_URL}/fapi/v1/order'
        
        # Generate signature
        signature = generate_signature(params)
        params['signature'] = signature
        
        # Redact signature for logging
        debug_params = params.copy()
        debug_params['signature'] = '[REDACTED]'
        print(f"[DEBUG] Sending params: {debug_params}")
        print(f"[DEBUG] Using endpoint: {endpoint}")
        
        # Make request to Binance
        headers = {
            'X-MBX-APIKEY': API_KEY
        }
        
        with httpx.Client() as client:
            response = client.post(
                endpoint,
                headers=headers,
                params=params
            )
            
            print(f"[DEBUG] Response status: {response.status_code}")
            print(f"[DEBUG] Response body: {response.text}")
            
            if response.status_code != 200:
                error_data = response.json()
                return jsonify({
                    'error': error_data.get('msg', 'Unknown error'),
                    'code': error_data.get('code')
                }), response.status_code
            
            result = response.json()
            
            # Handle different response formats (Algo vs Regular orders)
            if 'algoId' in result:
                # Algo order response - normalize to standard format
                return jsonify({
                    'success': True,
                    'orderId': result.get('algoId'),
                    'symbol': result.get('symbol'),
                    'status': result.get('algoStatus', 'WORKING'),
                    'type': order_type,
                    'triggerPrice': result.get('triggerPrice'),
                    'price': result.get('price'),
                    'quantity': result.get('quantity'),
                    'message': 'Algo order placed successfully'
                }), 200
            else:
                # Regular order response
                return jsonify({'success': True, **result}), 200
    
    except Exception as e:
        print(f"[ERROR] Exception during order placement: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Check if API keys are configured
    if not API_KEY or not API_SECRET:
        print("\n⚠️  WARNING: API keys not found in .env file")
        print("Please configure BINANCE_API_KEY and BINANCE_API_SECRET\n")
    
    print("\n" + "="*60)
    print("🚀 Binance Futures Trading Dashboard - Local Server")
    print("="*60)
    print(f"\n📡 Base URL: {BASE_URL}")
    print(f"🔐 Token Auth: {'Enabled' if DASHBOARD_TOKEN else 'Disabled'}")
    print(f"\n🌐 Dashboard: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server\n")
    
    app.run(host='localhost', port=5000, debug=True)
