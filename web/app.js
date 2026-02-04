// web/app.js

// Get API base URL (relative for deployed, localhost for dev)
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : '';

// DOM elements
const testConnectionBtn = document.getElementById('testConnectionBtn');
const connectionResult = document.getElementById('connectionResult');
const orderForm = document.getElementById('orderForm');
const typeSelect = document.getElementById('type');
const symbolSelect = document.getElementById('symbol');
const priceGroup = document.getElementById('priceGroup');
const stopPriceGroup = document.getElementById('stopPriceGroup');
const orderSummarySection = document.getElementById('orderSummarySection');
const orderResponseSection = document.getElementById('orderResponseSection');
const orderSummary = document.getElementById('orderSummary');
const orderResponse = document.getElementById('orderResponse');
const loadingOverlay = document.getElementById('loadingOverlay');
const baseUrlDisplay = document.getElementById('baseUrl');
const dashboardTokenInput = document.getElementById('dashboardToken');

// Store current market prices
let marketPrices = {};
let exchangeInfo = {};
let availableBalance = 0;

// Fetch exchange info with filters
async function fetchExchangeInfo() {
    try {
        const response = await fetch(`${API_BASE}/api/exchange-info`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            // Backend already returns symbols as object with filters organized
            if (data.symbols) {
                exchangeInfo = data.symbols;
            }
            console.log('Exchange Info loaded:', Object.keys(exchangeInfo).length, 'symbols');
        }
    } catch (error) {
        console.error('Error fetching exchange info:', error);
    }
}

// Fetch current market prices
async function fetchPrices() {
    try {
        const response = await fetch(`${API_BASE}/api/prices`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            marketPrices = data.prices;
            updatePriceHints();
        }
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// Update price hints based on current symbol
function updatePriceHints() {
    const symbol = symbolSelect.value;
    const currentPrice = marketPrices[symbol];
    const symbolInfo = exchangeInfo[symbol];
    
    if (currentPrice) {
        const priceInput = document.getElementById('price');
        const stopPriceInput = document.getElementById('stopPrice');
        const side = document.getElementById('side').value;
        const orderType = typeSelect.value;
        const quantityInput = document.getElementById('quantity');
        
        // Helper to format price based on magnitude
        const formatPrice = (price) => {
            if (price >= 1000) {
                return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return price.toFixed(2);
        };
        
        // Get filter values if available
        let minQty = 0.001, maxQty = 1000, stepSize = 0.001;
        let minPrice = 0, maxPrice = 1000000, tickSize = 0.01;
        let minNotional = 5;
        let percentPriceMultiplier = 0.1; // ±10% default
        
        if (symbolInfo && symbolInfo.filters) {
            const lotSize = symbolInfo.filters['LOT_SIZE'];
            if (lotSize) {
                minQty = parseFloat(lotSize.minQty);
                maxQty = parseFloat(lotSize.maxQty);
                stepSize = parseFloat(lotSize.stepSize);
            }
            
            const priceFilter = symbolInfo.filters['PRICE_FILTER'];
            if (priceFilter) {
                minPrice = parseFloat(priceFilter.minPrice);
                maxPrice = parseFloat(priceFilter.maxPrice);
                tickSize = parseFloat(priceFilter.tickSize);
            }
            
            const minNotionalFilter = symbolInfo.filters['MIN_NOTIONAL'];
            if (minNotionalFilter) {
                minNotional = parseFloat(minNotionalFilter.notional);
            }
            
            const percentPrice = symbolInfo.filters['PERCENT_PRICE'];
            if (percentPrice) {
                percentPriceMultiplier = parseFloat(percentPrice.multiplierUp) - 1;
            }
        }
        
        // Update quantity hint with symbol-specific units and affordable quantity
        const qtyHint = document.querySelector('#quantityGroup small');
        if (qtyHint) {
            const coinName = symbol.replace('USDT', '');
            const minNotionalQty = (minNotional / currentPrice).toFixed(3);
            const affordableQty = availableBalance > 0 ? Math.floor((availableBalance * 0.95) / currentPrice / stepSize) * stepSize : 0;
            const affordableQtyStr = affordableQty > 0 ? ` | <strong style="color: #0d9488;">💰 You can buy: ${affordableQty.toFixed(3)} ${coinName} ($${(affordableQty * currentPrice).toFixed(2)})</strong>` : '';
            qtyHint.innerHTML = `💡 <strong>Range:</strong> ${minQty}-${maxQty} ${coinName} | <strong>Step:</strong> ${stepSize} | <strong>Min:</strong> $${minNotional} (≥${minNotionalQty} ${coinName})${affordableQtyStr}`;
        }
        
        // Update LIMIT price placeholder and hint
        const minPriceRange = currentPrice * (1 - percentPriceMultiplier);
        const maxPriceRange = currentPrice * (1 + percentPriceMultiplier);
        priceInput.placeholder = formatPrice(currentPrice);
        
        const priceHint = priceGroup.querySelector('small');
        if (priceHint) {
            if (orderType === 'LIMIT') {
                if (side === 'BUY') {
                    priceHint.innerHTML = `📈 <strong>BUY LIMIT:</strong> Current: $${formatPrice(currentPrice)} | Enter ≤ $${formatPrice(currentPrice)} (range: $${formatPrice(minPriceRange)})`;
                } else {
                    priceHint.innerHTML = `📈 <strong>SELL LIMIT:</strong> Current: $${formatPrice(currentPrice)} | Enter ≥ $${formatPrice(currentPrice)} (range: $${formatPrice(maxPriceRange)})`;
                }
            } else {
                priceHint.innerHTML = `📈 <strong>LIMIT:</strong> Current: $${formatPrice(currentPrice)} | Valid range: $${formatPrice(minPriceRange)} - $${formatPrice(maxPriceRange)}`;
            }
        }
        
        // Update STOP price placeholder and hint with trigger rules
        const stopHint = stopPriceGroup.querySelector('small');
        if (stopHint) {
            const side = document.getElementById('side').value;
            if (side === 'BUY') {
                stopHint.innerHTML = `🎯 <strong>BUY STOP:</strong> Current: $${formatPrice(currentPrice)} | <span style="color: #10b981">Trigger MUST be &gt; $${formatPrice(currentPrice)}</span> (breakout)`;
            } else {
                stopHint.innerHTML = `🎯 <strong>SELL STOP:</strong> Current: $${formatPrice(currentPrice)} | <span style="color: #ef4444">Trigger MUST be &lt; $${formatPrice(currentPrice)}</span> (stop-loss)`;
            }
        }
        stopPriceInput.placeholder = side === 'BUY' ? formatPrice(currentPrice * 1.02) : formatPrice(currentPrice * 0.98);
    }
    
    // Validate inputs after updating hints
    validateInputs();
}

// Real-time validation function - validates each field independently
function validateInputs() {
    const priceInput = document.getElementById('price');
    const stopPriceInput = document.getElementById('stopPrice');
    const quantityInput = document.getElementById('quantity');
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const orderType = document.getElementById('type').value;
    const side = document.getElementById('side').value;
    const symbol = document.getElementById('symbol');
    const stopPriceGroup = document.getElementById('stopPriceGroup');
    const priceGroup = document.getElementById('priceGroup');
    
    // Get error message divs
    const quantityError = document.getElementById('quantityError');
    const priceError = document.getElementById('priceError');
    const stopPriceError = document.getElementById('stopPriceError');
    
    // Clear all errors
    quantityError.style.display = 'none';
    priceError.style.display = 'none';
    stopPriceError.style.display = 'none';
    submitBtn.disabled = false;
    
    let hasErrors = false;
    
    const currentPrice = marketPrices[symbol.value];
    const quantity = parseFloat(quantityInput.value);
    const price = parseFloat(priceInput.value);
    const stopPrice = parseFloat(stopPriceInput.value);
    
    // 1. Validate QUANTITY for all order types
    if (quantityInput.value && quantity > 0) {
        // Calculate notional value
        let notionalValue = 0;
        if (orderType === 'MARKET' && currentPrice) {
            notionalValue = quantity * currentPrice;
        } else if (orderType === 'LIMIT' && price > 0) {
            notionalValue = quantity * price;
        } else if ((orderType === 'STOP' || orderType === 'STOP_MARKET') && stopPrice > 0) {
            notionalValue = quantity * stopPrice;
        }
        
        // Check balance (cost = notional for new positions)
        if (availableBalance > 0 && notionalValue > availableBalance) {
            quantityError.textContent = `❌ Insufficient balance! Need $${notionalValue.toFixed(2)} but only have $${availableBalance.toFixed(2)}`;
            quantityError.style.display = 'block';
            hasErrors = true;
        }
        
        // Check minimum notional
        if (notionalValue > 0 && notionalValue < 5) {
            quantityError.textContent = `❌ Order value too small! Need minimum $5, currently $${notionalValue.toFixed(2)}`;
            quantityError.style.display = 'block';
            hasErrors = true;
        }
    }
    
    // 2. Validate LIMIT PRICE (only for LIMIT and STOP orders)
    if ((orderType === 'LIMIT' || orderType === 'STOP') && priceGroup.style.display !== 'none' && priceInput.value) {
        if (!currentPrice) {
            priceError.textContent = '⏳ Waiting for live price data...';
            priceError.style.display = 'block';
            hasErrors = true;
        } else if (price <= 0) {
            priceError.textContent = '❌ Price must be greater than 0';
            priceError.style.display = 'block';
            hasErrors = true;
        } else {
            // Check ±10% price range for LIMIT orders
            const minAllowed = currentPrice * 0.9;
            const maxAllowed = currentPrice * 1.1;
            
            if (orderType === 'LIMIT' && (price < minAllowed || price > maxAllowed)) {
                priceError.textContent = `⚠️ Price should be within ±10% of current ($${currentPrice.toFixed(2)}): $${minAllowed.toFixed(2)} - $${maxAllowed.toFixed(2)}`;
                priceError.style.display = 'block';
                hasErrors = true;
            }
        }
    }
    
    // 3. Validate STOP PRICE (only for STOP orders)
    const isStopOrderType = orderType === 'STOP' || orderType === 'STOP_MARKET';
    const stopPriceVisible = stopPriceGroup.style.display !== 'none';
    
    if (isStopOrderType && stopPriceVisible && stopPriceInput.value) {
        if (!currentPrice) {
            stopPriceError.textContent = '⏳ Waiting for live price data...';
            stopPriceError.style.display = 'block';
            hasErrors = true;
        } else if (stopPrice <= 0) {
            stopPriceError.textContent = '❌ Stop price must be greater than 0';
            stopPriceError.style.display = 'block';
            hasErrors = true;
        } else {
            // Validate trigger direction
            if (side === 'BUY' && stopPrice <= currentPrice) {
                stopPriceError.textContent = `❌ BUY STOP trigger must be ABOVE current price ($${currentPrice.toFixed(2)})`;
                stopPriceError.style.display = 'block';
                hasErrors = true;
            } else if (side === 'SELL' && stopPrice >= currentPrice) {
                stopPriceError.textContent = `❌ SELL STOP trigger must be BELOW current price ($${currentPrice.toFixed(2)})`;
                stopPriceError.style.display = 'block';
                hasErrors = true;
            }
            
            // Validate limit price vs trigger for STOP orders
            if (orderType === 'STOP' && price > 0) {
                if (side === 'BUY' && price < stopPrice) {
                    priceError.textContent = `⚠️ Limit price should be >= trigger ($${stopPrice.toFixed(2)}) for BUY STOP`;
                    priceError.style.display = 'block';
                    hasErrors = true;
                } else if (side === 'SELL' && price > stopPrice) {
                    priceError.textContent = `⚠️ Limit price should be <= trigger ($${stopPrice.toFixed(2)}) for SELL STOP`;
                    priceError.style.display = 'block';
                    hasErrors = true;
                }
            }
        }
    }
    
    submitBtn.disabled = hasErrors;
}

// Update hints when symbol or side changes
symbolSelect.addEventListener('change', () => {
    updatePriceHints();
    validateInputs();
});
document.getElementById('side').addEventListener('change', () => {
    updatePriceHints();
    validateInputs();
});
document.getElementById('type').addEventListener('change', validateInputs);

// Add real-time validation on input
document.getElementById('price').addEventListener('input', validateInputs);
document.getElementById('stopPrice').addEventListener('input', validateInputs);
document.getElementById('quantity').addEventListener('input', validateInputs);

// Fetch balance function
async function fetchBalance() {
    try {
        const response = await fetch(`${API_BASE}/api/balance`, {
            headers: getHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            if (data.balance) {
                availableBalance = parseFloat(data.balance.availableBalance);
                updatePriceHints(); // Update hints with new balance
            }
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

// Fetch prices on page load and every 10 seconds
fetchExchangeInfo(); // Fetch once on load
fetchBalance(); // Fetch balance once
fetchPrices();
setInterval(fetchPrices, 10000);
setInterval(fetchBalance, 15000); // Update balance every 15 seconds

// Show/hide price fields based on order type
typeSelect.addEventListener('change', () => {
    const orderType = typeSelect.value;
    const typeHint = document.getElementById('typeHint');
    
    // Update hint text
    if (orderType === 'MARKET') {
        typeHint.innerHTML = '📊 <strong>MARKET:</strong> Executes immediately at current price';
    } else if (orderType === 'LIMIT') {
        typeHint.innerHTML = '📈 <strong>LIMIT:</strong> Buy/sell at specific price or better (price within ±10% of market)';
    } else if (orderType === 'STOP_MARKET') {
        typeHint.innerHTML = '🎯 <strong>STOP_MARKET:</strong> Triggers market order when stop price reached';
    } else if (orderType === 'STOP') {
        typeHint.innerHTML = '🎯 <strong>STOP_LOSS_LIMIT:</strong> Triggers limit order at specified price when stop reached';
    }
    
    if (orderType === 'LIMIT' || orderType === 'STOP') {
        priceGroup.style.display = 'block';
        document.getElementById('price').required = true;
        updatePriceHints();
    } else {
        priceGroup.style.display = 'none';
        document.getElementById('price').required = false;
    }
    
    if (orderType === 'STOP_MARKET' || orderType === 'STOP') {
        stopPriceGroup.style.display = 'block';
        document.getElementById('stopPrice').required = true;
        updatePriceHints();
    } else {
        stopPriceGroup.style.display = 'none';
        document.getElementById('stopPrice').required = false;
    }
    
    // Validate after changing type
    validateInputs();
});

// Get headers with optional dashboard token
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = dashboardTokenInput.value.trim();
    if (token) {
        headers['X-Dashboard-Token'] = token;
    }
    
    return headers;
}

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Format JSON for display
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

// Test connection
testConnectionBtn.addEventListener('click', async () => {
    showLoading();
    connectionResult.innerHTML = '';
    connectionResult.className = 'result-box';
    
    try {
        const response = await fetch(`${API_BASE}/api/time`, {
            headers: getHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok) {
            connectionResult.className = 'result-box success';
            connectionResult.textContent = `✓ Connection successful!\n\n` +
                `Server Time: ${new Date(data.serverTime).toLocaleString()}\n` +
                `Base URL: ${data.baseUrl}`;
            
            // Update base URL display
            baseUrlDisplay.textContent = data.baseUrl;
            
            // Check if it's testnet
            if (!data.baseUrl.includes('testnet')) {
                baseUrlDisplay.style.color = 'var(--danger-color)';
                alert('⚠️ WARNING: Not using testnet URL!');
            }
        } else {
            throw new Error(data.error || data.message || 'Connection failed');
        }
    } catch (error) {
        connectionResult.className = 'result-box error';
        connectionResult.textContent = `✗ Connection failed:\n${error.message}`;
        baseUrlDisplay.textContent = 'Connection Error';
    } finally {
        hideLoading();
    }
});

// Add input listeners for real-time STOP order validation
document.getElementById('type').addEventListener('change', validateInputs);
document.getElementById('side').addEventListener('change', validateInputs);
document.getElementById('stopPrice').addEventListener('input', validateInputs);
document.getElementById('price').addEventListener('input', validateInputs);
document.getElementById('symbol').addEventListener('change', validateInputs);

// Place order
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const symbol = document.getElementById('symbol').value;
    const side = document.getElementById('side').value;
    const orderType = document.getElementById('type').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const symbolInfo = exchangeInfo[symbol];
    const currentPrice = parseFloat(marketPrices[symbol]);
    
    // Simple validation - just show what Binance expects
    if (symbolInfo && currentPrice && !isNaN(currentPrice)) {
        const lotSize = symbolInfo.filters?.['LOT_SIZE'];
        const minNotionalFilter = symbolInfo.filters?.['MIN_NOTIONAL'];
        
        if (lotSize && minNotionalFilter) {
            const minQty = parseFloat(lotSize.minQty);
            const maxQty = parseFloat(lotSize.maxQty);
            const stepSize = parseFloat(lotSize.stepSize);
            const minNotional = parseFloat(minNotionalFilter.notional);
            const coinName = symbol.replace('USDT', '');
            const orderValue = currentPrice * quantity;
            let warnings = [];
            
            // Simple range checks
            if (quantity < minQty || quantity > maxQty) {
                warnings.push(`Quantity out of range\\nAllowed: ${minQty} to ${maxQty} ${coinName}`);
            }
            
            if (orderValue < minNotional) {
                const needed = (minNotional / currentPrice + stepSize).toFixed(3);
                warnings.push(`Order value too low ($${orderValue.toFixed(2)})\\nMinimum: $${minNotional}\\nTry: ${needed} ${coinName}`);
            }
            
            // Show warnings
            if (warnings.length > 0) {
                const proceed = confirm('⚠️ ' + warnings.join('\\n\\n') + '\\n\\nProceed anyway?');
                if (!proceed) {
                    return;
                }
            }
        }
    }
    
    const orderData = {
        symbol: symbol,
        side: side,
        type: orderType,
        quantity: quantity,
        dryRun: document.getElementById('dryRun').checked
    };
    
    // Add price for LIMIT/STOP
    if (orderData.type === 'LIMIT' || orderData.type === 'STOP') {
        const priceValue = document.getElementById('price').value;
        if (priceValue) {
            orderData.price = parseFloat(priceValue);
        }
    }
    
    // Add stopPrice for STOP and STOP_MARKET
    if (orderData.type === 'STOP' || orderData.type === 'STOP_MARKET') {
        const stopPriceValue = document.getElementById('stopPrice').value;
        if (stopPriceValue) {
            orderData.stopPrice = parseFloat(stopPriceValue);
        }
    }
    
    // Show order summary
    orderSummarySection.style.display = 'block';
    orderSummary.className = 'result-box';
    orderSummary.textContent = 
        `Symbol:       ${orderData.symbol}\n` +
        `Side:         ${orderData.side}\n` +
        `Type:         ${orderData.type}\n` +
        `Quantity:     ${orderData.quantity}\n` +
        (orderData.price ? `Price:        ${orderData.price}\n` : '') +
        (orderData.stopPrice ? `Stop Price:   ${orderData.stopPrice}\n` : '') +
        (orderData.dryRun ? `\n⚠️ DRY RUN MODE - Order will not be sent\n` : '');
    
    // If dry run, don't call API
    if (orderData.dryRun) {
        orderResponseSection.style.display = 'block';
        orderResponse.className = 'result-box warning';
        orderResponse.textContent = 
            `✓ Dry run completed\n\n` +
            `Request validated successfully.\n` +
            `Remove dry-run checkbox to place the order.`;
        return;
    }
    
    // Call API
    showLoading();
    orderResponseSection.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/api/place-order`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        orderResponseSection.style.display = 'block';
        
        if (response.ok) {
            const isAlgoOrder = data.orderId && data.triggerPrice;
            const endpoint = isAlgoOrder ? '/fapi/v1/algoOrder' : '/fapi/v1/order';
            const createTime = data.createTime ? new Date(data.createTime).toLocaleString() : 'N/A';
            
            orderResponse.className = 'result-box success';
            let text = `✓ Order placed successfully!\n\n`;
            text += `🌐 Binance Endpoint: ${endpoint}\n`;
            text += `📡 Yes, this went to REAL Binance Testnet!\n\n`;
            text += `Order ID:     ${data.orderId || data.algoId || 'N/A'}\n`;
            text += `Symbol:       ${data.symbol || orderData.symbol}\n`;
            text += `Status:       ${data.status || data.algoStatus || 'N/A'}\n`;
            text += `Side:         ${data.side || orderData.side}\n`;
            text += `Type:         ${data.type || orderData.type}\n`;
            text += `Quantity:     ${data.quantity || data.origQty || orderData.quantity}\n`;
            
            if (data.triggerPrice) {
                text += `Trigger:      $${parseFloat(data.triggerPrice).toFixed(2)}\n`;
            }
            if (data.price) {
                text += `Price:        $${parseFloat(data.price).toFixed(2)}\n`;
            }
            text += `Time:         ${createTime}\n`;
            
            if (data.message) {
                text += `\n${data.message}`;
            }
            
            orderResponse.textContent = text;
        } else {
            orderResponse.className = 'result-box error';
            
            if (data.code) {
                // Binance API error
                orderResponse.textContent = 
                    `✗ Order failed\n\n` +
                    `Error Code: ${data.code}\n` +
                    `Message: ${data.msg || data.message || 'Unknown error'}`;
            } else {
                // Validation or server error
                orderResponse.textContent = 
                    `✗ Order failed\n\n` +
                    `${data.error || data.message || 'Unknown error'}`;
            }
            
            // If margin insufficient, show helpful message
            if (data.code === -2019) {
                orderResponse.textContent += 
                    `\n\n💡 TIP: Your testnet account needs USDT balance.\n` +
                    `Click "Check Balance" above to see your funds.\n` +
                    `Visit testnet.binancefuture.com to get test USDT.`;
            }
        }
    } catch (error) {
        orderResponseSection.style.display = 'block';
        orderResponse.className = 'result-box error';
        orderResponse.textContent = 
            `✗ Request failed\n\n` +
            `${error.message}\n\n` +
            `Check your network connection and try again.`;
    } finally {
        hideLoading();
    }
});

// Balance check
const checkBalanceBtn = document.getElementById('checkBalanceBtn');
const balanceResult = document.getElementById('balanceResult');

// Positions check
const checkPositionsBtn = document.getElementById('checkPositionsBtn');
const positionsResult = document.getElementById('positionsResult');

checkBalanceBtn.addEventListener('click', async () => {
    balanceResult.style.display = 'block';
    balanceResult.className = 'result-box';
    balanceResult.textContent = 'Checking balance...';
    
    try {
        const response = await fetch(`${API_BASE}/api/balance`, {
            headers: getHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok && data.balance) {
            const available = parseFloat(data.balance.availableBalance);
            const total = parseFloat(data.balance.balance);
            const locked = total - available;
            
            balanceResult.className = available >= 100 ? 'result-box success' : 'result-box warning';
            balanceResult.textContent = 
                `✓ Balance Retrieved\n\n` +
                `Available: ${available.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n` +
                `Total: ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n` +
                `Locked in positions: ${locked.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
            
            if (available < 100) {
                balanceResult.textContent += 
                    `\n\n⚠️ Available too low for BTC (need ≥$100)\n` +
                    `$${locked.toFixed(2)} locked in positions\n` +
                    `Click "Check Positions" to see them\n\n` +
                    `Options:\n` +
                    `• Close positions to free margin\n` +
                    `• Trade BNBUSDT (min $5)\n` +
                    `• Trade ETHUSDT (min $20)`;
            }
        } else {
            balanceResult.className = 'result-box error';
            balanceResult.textContent = 
                `✗ Failed to get balance\n\n` +
                `${data.error || 'Unknown error'}`;
        }
    } catch (error) {
        balanceResult.className = 'result-box error';
        balanceResult.textContent = 
            `✗ Request failed\n\n` +
            `${error.message}`;
    }
});

checkPositionsBtn.addEventListener('click', async () => {
    positionsResult.style.display = 'block';
    positionsResult.className = 'result-box';
    positionsResult.textContent = 'Checking positions...';
    
    try {
        const response = await fetch(`${API_BASE}/api/positions`, {
            headers: getHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok) {
            let hasContent = false;
            let text = '';
            
            // Display open positions
            if (data.positions && data.positions.length > 0) {
                hasContent = true;
                text += `✓ Open Positions (${data.positions.length})\n\n`;
                
                data.positions.forEach(pos => {
                    const amt = parseFloat(pos.positionAmt);
                    const entryPrice = parseFloat(pos.entryPrice);
                    const markPrice = parseFloat(pos.markPrice);
                    const unrealizedPnL = parseFloat(pos.unRealizedProfit);
                    const side = amt > 0 ? 'LONG' : 'SHORT';
                    const pnlSign = unrealizedPnL >= 0 ? '+' : '';
                    
                    text += `${pos.symbol}:\n`;
                    text += `  Side: ${side} | Qty: ${Math.abs(amt)}\n`;
                    text += `  Entry: $${entryPrice.toFixed(2)} | Now: $${markPrice.toFixed(2)}\n`;
                    text += `  PnL: ${pnlSign}$${unrealizedPnL.toFixed(2)}\n\n`;
                });
                
                text += `💡 To close: LONG→SELL | SHORT→BUY (same qty)\n\n`;
            }
            
            // Display algo orders (STOP orders)
            if (data.algoOrders && data.algoOrders.length > 0) {
                hasContent = true;
                text += `🎯 Active STOP Orders (${data.algoOrders.length})\n\n`;
                
                data.algoOrders.forEach(order => {
                    const createTime = new Date(order.createTime);
                    const localTime = createTime.toLocaleString();
                    
                    text += `${order.symbol} - ${order.side} ${order.orderType}\n`;
                    text += `  Trigger: $${parseFloat(order.triggerPrice).toFixed(2)}`;
                    if (order.price && parseFloat(order.price) > 0) {
                        text += ` | Limit: $${parseFloat(order.price).toFixed(2)}`;
                    }
                    text += `\n`;
                    text += `  Qty: ${order.quantity} | Status: ${order.algoStatus}\n`;
                    text += `  Created: ${localTime}\n`;
                    text += `  AlgoId: ${order.algoId}\n\n`;
                });
                
                text += `💡 STOP orders execute when price hits trigger\n`;
                text += `⚠️ Cancel via Binance web/app (algoId needed)\n`;
            }
            
            if (hasContent) {
                positionsResult.className = 'result-box success';
                positionsResult.textContent = text;
            } else {
                positionsResult.className = 'result-box';
                positionsResult.textContent = 
                    `✓ No Open Positions or STOP Orders\n\n` +
                    `No active futures positions.\n` +
                    `No pending STOP orders.\n` +
                    `All balance available for trading.`;
            }
        } else {
            positionsResult.className = 'result-box error';
            positionsResult.textContent = 
                `✗ Failed to get positions\n\n` +
                `${data.error || 'Unknown error'}`;
        }
    } catch (error) {
        positionsResult.className = 'result-box error';
        positionsResult.textContent = 
            `✗ Request failed\n\n` +
            `${error.message}`;
    }
});

// Initialize: Test connection on load
window.addEventListener('load', () => {
    testConnectionBtn.click();
});
