
// ========== DATA INPUT - EDIT THESE VALUES ========== //
const data = {
    lastUpdated: new Date().toLocaleString(),
    startingCapital: 5.3,
    activeTrades: [
        {
            pair: "BTC/USDT",
            direction: "long",
            entryPrice: 114415.4,   // Your entry price
            quantity: 0.000001999,      // Quantity of coins
            currentPrice: 114964.9 // Current market price
        },
        // {
        //     pair: "ETH/USDT",
        //     direction: "short",
        //     entryPrice: 2500,
        //     quantity: 10,
        //     currentPrice: 2455
        // }
    ],
    spotInvestments: [
        { asset: "USDT", quantity: 5.0, entryPrice: 1, currentPrice: 1 },
        // { asset: "TIA", quantity: 0.61, entryPrice: 3.2, currentPrice: 3.595 },
        // { asset: "AVAX", quantity: 0.05, entryPrice: 26.977, currentPrice: 25.344},
        // { asset: "BKN", quantity: 11.66, entryPrice: 0.25707, currentPrice: 0.23342 },
        // { asset: "FET", quantity: 1.82, entryPrice: 0.8193, currentPrice: 0.7874 },
        // { asset: "USDT", quantity: 14.6, entryPrice: 1, currentPrice: 1 }
    ]
};
// ========== END OF DATA INPUT ========== //

// Utility functions
const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 4
    }).format(amount);
};

const calculatePnl = (entry, current, quantity, isShort = false) => {
    const priceDiff = isShort ? entry - current : current - entry;
    const pnlAmount = priceDiff * quantity;
    const pnlPercent = ((priceDiff / entry) * 100).toFixed(2);

    return {
        amount: pnlAmount,
        percent: Math.abs(pnlPercent),
        isProfit: pnlAmount >= 0
    };
};

const calculateTotalValue = () => {
    // Calculate total spot value
    const totalSpot = data.spotInvestments.reduce((acc, item) =>
        acc + (item.quantity * item.currentPrice), 0);

    // Calculate total trade value (including P&L)
    const totalTrades = data.activeTrades.reduce((acc, trade) => {
        const pnl = calculatePnl(trade.entryPrice, trade.currentPrice,
            trade.quantity, trade.direction === 'short');
        return acc + (trade.quantity * trade.currentPrice);
    }, 0);

    return totalSpot + totalTrades;
};

const updateTotals = () => {
    const totalValue = calculateTotalValue();
    document.getElementById('totalValue').textContent = formatMoney(totalValue);

    // Calculate 24h P&L (using startingCapital)
    const dailyPnlAmount = totalValue - data.startingCapital;
    const dailyPnlPercent = (dailyPnlAmount / data.startingCapital) * 100;

    document.getElementById('dailyPnl').textContent = `${dailyPnlAmount >= 0 ? '+' : ''}${formatMoney(dailyPnlAmount)} (${dailyPnlPercent.toFixed(2)}%)`;
    document.getElementById('dailyPnl').className = dailyPnlAmount >= 0 ? 'positive' : 'negative';
};

const renderTrades = () => {
    const tradesHTML = data.activeTrades.map(trade => {
        const pnl = calculatePnl(trade.entryPrice, trade.currentPrice,
            trade.quantity, trade.direction === 'short');
        const currentValue = trade.quantity * trade.currentPrice;

        return `
                    <div class="trade-item">
                        <div>
                            <span class="trade-direction ${trade.direction}">
                                ${trade.direction.toUpperCase()}
                            </span>
                            ${trade.pair}
                        </div>
                        <div>
                            <div>${formatMoney(currentValue)}</div>
                            <div class="${pnl.isProfit ? 'positive' : 'negative'}">
                                ${pnl.isProfit ? '+' : '-'}${formatMoney(Math.abs(pnl.amount))} (${pnl.percent}%)
                            </div>
                        </div>
                    </div>
                `;
    }).join('');
    document.getElementById('activeTrades').innerHTML = tradesHTML;
};

const renderSpotInvestments = () => {
    const spotHTML = data.spotInvestments.map(asset => {
        const pnl = calculatePnl(asset.entryPrice, asset.currentPrice, asset.quantity);
        const currentValue = asset.quantity * asset.currentPrice;

        return `
                    <div class="trade-item">
                        <div>${asset.asset}</div>
                        <div>
                            <div>${asset.quantity} @ ${formatMoney(asset.currentPrice)}</div>
                            <div class="${pnl.isProfit ? 'positive' : 'negative'}">
                                ${formatMoney(currentValue)} (${pnl.isProfit ? '+' : '-'}${pnl.percent}%)
                            </div>
                        </div>
                    </div>
                `;
    }).join('');
    document.getElementById('spotInvestments').innerHTML = spotHTML;
};

// Initial render
document.getElementById('updateTime').textContent = data.lastUpdated;
document.getElementById('startingCapitalDisplay').textContent = formatMoney(data.startingCapital); // Display starting capital
updateTotals();
renderTrades();
renderSpotInvestments();

// ========== DATA INPUT - EDIT THESE VALUES ========== //
const capitalData = [
    { date: "2025-08-03", capital: 5.3 },
    { date: "2025-08-04", capital: 5.22 },
    { date: "2025-08-05", capital: 5.4 },
    // { date: "2025-02-08", capital: 28.7 },
    // { date: "2025-02-09", capital: 28.7 },
    // { date: "2025-02-10", capital: 29.1 },
    // { date: "2025-02-11", capital: 29.3 },
    // { date: "2025-02-12", capital: 29.1  },
    // { date: "2025-02-13", capital: 29  },
    // { date: "2025-02-14", capital: 29.2  },
    // { date: "2025-02-15", capital: 28.8  },
    // { date: "2025-02-16", capital: 28.7  },
    // { date: "2025-02-17", capital: 29.1  },
    // { date: "2025-02-18", capital: 28.7  },
    // { date: "2025-02-19", capital: 23  },
    // { date: "2025-02-20", capital: 23.4  },
    // { date: "2025-02-21", capital: 24.1  },

];
// ========== END OF DATA INPUT ========== //

// Format data for ApexCharts
const processData = (data) => {
    return {
        dates: data.map(item => item.date),
        capital: data.map(item => item.capital)
    };
};


// Render the chart
const renderChart = () => {
    const processedData = processData(capitalData);

    const options = {
        chart: {
            type: 'line',
            height: '100%',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            }
        },
        series: [{
            name: 'Capital',
            data: processedData.capital
        }],
        xaxis: {
            categories: processedData.dates,
            type: 'datetime',
            labels: {
                formatter: function (value) {
                    return new Date(value).toLocaleDateString();
                }
            }
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return `$${value.toLocaleString()}`;
                }
            },
            title: {
                text: 'Capital Value (USD)'
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#16c784'],
        tooltip: {
            enabled: true,
            x: {
                formatter: function (value) {
                    return new Date(value).toLocaleDateString();
                }
            },
            y: {
                formatter: function (value) {
                    return `$${value.toLocaleString()}`;
                }
            }
        },
        markers: {
            size: 5,
            colors: ['#16c784'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 5
        }
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
};

// Initial render
renderChart();
