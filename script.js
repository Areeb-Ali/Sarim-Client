// ========== DATA INPUT - EDIT THESE VALUES ========== //
const data = {
    lastUpdated: new Date().toLocaleString(),
    startingCapital: 5.3,
    activeTrades: [
        {
            pair: "BTC/USDT",
            direction: "long",
            entryPrice: 116591,
            leverage: 100,
            marginUsed: 0.25,
            currentPrice: 116481.8
        },
        // {
        //     pair: "BTC/USDT",
        //     direction: "long",
        //     entryPrice: 113060.6,
        //     leverage: 100,
        //     marginUsed: 0.215,
        //     currentPrice: 114866.9
        // }
    ],
    spotInvestments: [
        { asset: "USDT", quantity: 5.68, entryPrice: 1, currentPrice: 1 }
    ]
};
// ========== END OF DATA INPUT ========== //

const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 4
    }).format(amount);
};

const calculatePnlFromMargin = (entry, current, margin, leverage, isShort = false) => {
    const quantity = (margin * leverage) / entry;
    const priceDiff = isShort ? entry - current : current - entry;
    const pnlAmount = priceDiff * quantity;
    const pnlPercent = ((priceDiff / entry) * leverage * 100).toFixed(2);
    return {
        amount: pnlAmount,
        percent: Math.abs(pnlPercent),
        isProfit: pnlAmount >= 0
    };
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
    const totalSpot = data.spotInvestments.reduce((acc, item) =>
        acc + (item.quantity * item.currentPrice), 0);
    const totalTrades = data.activeTrades.reduce((acc, trade) => {
        const pnl = calculatePnlFromMargin(
            trade.entryPrice,
            trade.currentPrice,
            trade.marginUsed,
            trade.leverage,
            trade.direction === 'short'
        );
        return acc + trade.marginUsed + pnl.amount;
    }, 0);
    return totalSpot + totalTrades;
};

const updateTotals = () => {
    const totalValue = calculateTotalValue();
    document.getElementById('totalValue').textContent = formatMoney(totalValue);
    const dailyPnlAmount = totalValue - data.startingCapital;
    const dailyPnlPercent = (dailyPnlAmount / data.startingCapital) * 100;
    document.getElementById('dailyPnl').textContent = `${dailyPnlAmount >= 0 ? '+' : ''}${formatMoney(dailyPnlAmount)} (${dailyPnlPercent.toFixed(2)}%)`;
    document.getElementById('dailyPnl').className = dailyPnlAmount >= 0 ? 'positive' : 'negative';
};

const renderTrades = () => {
    const tradesHTML = data.activeTrades.map(trade => {
        const pnl = calculatePnlFromMargin(
            trade.entryPrice,
            trade.currentPrice,
            trade.marginUsed,
            trade.leverage,
            trade.direction === 'short'
        );
        const quantity = (trade.marginUsed * trade.leverage) / trade.entryPrice;
        const currentValue = quantity * trade.currentPrice;
        return `
            <div class="trade-item">
                <div>
                    <span class="trade-direction ${trade.direction}">
                        ${trade.direction.toUpperCase()}
                    </span> ${trade.pair}<br>
                    Margin: $${trade.marginUsed}, Leverage: ${trade.leverage}x
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

document.getElementById('updateTime').textContent = data.lastUpdated;
document.getElementById('startingCapitalDisplay').textContent = formatMoney(data.startingCapital);
updateTotals();
renderTrades();
renderSpotInvestments();

// ========== CAPITAL CHART ========== //
const capitalData = [
    { date: "2025-08-03", capital: 5.3 },
    { date: "2025-08-04", capital: 5 },
    { date: "2025-08-05", capital: 4.8 },
    { date: "2025-08-06", capital: 5.69 },
    { date: "2025-08-07", capital: 5.93 },
    { date: "2025-08-08", capital: 5.9 }


];

const renderChart = () => {
    const seriesData = capitalData.map(item => ({
        x: new Date(item.date).getTime(), // Make sure this is a timestamp
        y: item.capital
    }));

    const options = {
        chart: {
            type: 'line',
            height: 350, // use fixed height
            toolbar: {
                show: true
            }
        },
        series: [{
            name: 'Capital',
            data: seriesData
        }],
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeUTC: false
            }
        },
        yaxis: {
            labels: {
                formatter: (value) => `$${value.toFixed(2)}`
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
            x: {
                format: 'yyyy-MM-dd'
            },
            y: {
                formatter: value => `$${value.toFixed(2)}`
            }
        },
        responsive: [{
            breakpoint: 768,
            options: {
                chart: {
                    height: 300
                }
            }
        }]
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
};


renderChart();

// Theme toggle
// const toggleBtn = document.getElementById('themeToggle');
// const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

// if (localStorage.getItem('theme') === 'dark' ||
//     (!localStorage.getItem('theme') && prefersDarkScheme.matches)) {
//     document.body.classList.add('dark');
//     toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
// }

// toggleBtn.addEventListener('click', () => {
//     document.body.classList.toggle('dark');
//     const isDark = document.body.classList.contains('dark');
//     toggleBtn.innerHTML = isDark
//         ? '<i class="fas fa-sun"></i> Light Mode'
//         : '<i class="fas fa-moon"></i> Dark Mode';
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// });

const tradeHistory = [
    {
        date: "2025-08-04",
        pair: "BTC/USDT",
        direction: "long",
        entryPrice: 114415,
        exitPrice: 114866,
        result: "+39.46%",
        twitterLink: "https://x.com/areebithink/status/1952310045871648955"
    },
    {
        date: "2025-08-05",
        pair: "BTC/USDT",
        direction: "long",
        entryPrice: 113060,
        exitPrice: 114866,
        result: "+159.76%",
        twitterLink: "https://x.com/areebithink/status/1952753924705784053"
    },
    {
        date: "2025-08-07",
        pair: "BTC/USDT",
        direction: "long",
        entryPrice: 114993,
        exitPrice: 116070,
        result: "+93.66%",
        twitterLink: "https://x.com/areebithink/status/1953383104510583239"
    },
];

const renderTradeHistory = () => {
    const historyHTML = tradeHistory.map(trade => `
        <div class="trade-item">
            <div>
                <strong>${trade.date}</strong> — ${trade.pair} 
                <span class="trade-direction ${trade.direction}">${trade.direction.toUpperCase()}</span><br>
                Entry: ${trade.entryPrice}, Exit: ${trade.exitPrice} — <strong>${trade.result}</strong>
            </div>
            <div>
                <a href="${trade.twitterLink}" target="_blank" class="twitter-link">View Tweet</a>
            </div>
        </div>
    `).join('');
    document.getElementById('tradeHistory').innerHTML = historyHTML;
};

renderTradeHistory();