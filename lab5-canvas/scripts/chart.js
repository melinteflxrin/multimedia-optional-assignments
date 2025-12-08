window.onload = function() {
    // DOM and variable initialization
    let canvas = document.getElementById('chartCanvas');
    let context = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;
    let xIncrement = 150;
    let yIncrement = 100;
    let valueIncrement = 20;
    let textOffset = 5;
    let seriesCount = 3;
    let seriesColors = ['green', 'red', 'blue'];
    let dataSeries = Array.from({length: seriesCount}, () => []);
    let running = true;
    let intervalId = null;
    let updateInterval = 1000;
    let minValue = 0;
    let maxValue = height;
    let showGrid = true;
    let chartType = 'line';
    const tooltip = document.getElementById('tooltip');

    // Theme switching
    function setTheme(theme) {
        document.body.classList.remove('theme-dark', 'theme-high');
        if (theme === 'dark') document.body.classList.add('theme-dark');
        else if (theme === 'high') document.body.classList.add('theme-high');
    }
    document.getElementById('themeLight').onclick = function() { setTheme('light'); };
    document.getElementById('themeDark').onclick = function() { setTheme('dark'); };
    document.getElementById('themeHigh').onclick = function() { setTheme('high'); };

    document.getElementById('exportBtn').onclick = function() {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Chart type logic
    document.getElementById('lineChartBtn').onclick = function() { chartType = 'line'; draw(); };
    document.getElementById('barChartBtn').onclick = function() { chartType = 'bar'; draw(); };
    document.getElementById('areaChartBtn').onclick = function() { chartType = 'area'; draw(); };
    document.getElementById('scatterChartBtn').onclick = function() { chartType = 'scatter'; draw(); };

    // Tooltip logic
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        let found = false;
        for (let s = 0; s < seriesCount; s++) {
            let smoothed = (typeof getSmoothed === 'function') ? getSmoothed(dataSeries[s]) : dataSeries[s];
            for (let i = 0; i < smoothed.length; i++) {
                let x = i * valueIncrement;
                let y = height - smoothed[i];
                if (Math.abs(mouseX - x) < 8 && Math.abs(mouseY - y) < 8) {
                    tooltip.style.display = 'block';
                    tooltip.style.left = (rect.left + x + 20) + 'px';
                    tooltip.style.top = (rect.top + y - 10) + 'px';
                    tooltip.innerHTML = `<b>Series ${s+1}</b><br>X: ${x}<br>Y: ${smoothed[i].toFixed(1)}`;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) {
            tooltip.style.display = 'none';
        }
    });
    canvas.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
    });

    function drawVerticalLines()
    {
        if (!showGrid) return;
        context.strokeStyle = 'gray';
        context.lineWidth = 1;
        for(let i = 0; i< width; i += xIncrement)
        {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.stroke();
        }
    }

    function drawHorizontalLines()
    {
        if (!showGrid) return;
        context.strokeStyle = 'gray';
        context.lineWidth = 1;
        for (let i = 0; i < height; i += yIncrement)
        {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(width, i);
            context.stroke();
        }
    }

    function drawChart()
    {
        // Moving average smoothing window size
        let windowSize = 3;
        function getSmoothed(series) {
            let smoothed = [];
            for (let i = 0; i < series.length; i++) {
                let start = Math.max(0, i - Math.floor(windowSize / 2));
                let end = Math.min(series.length, i + Math.ceil(windowSize / 2));
                let sum = 0;
                for (let j = start; j < end; j++) {
                    sum += series[j];
                }
                smoothed[i] = sum / (end - start);
            }
            return smoothed;
        }
        for (let s = 0; s < seriesCount; s++) {
            context.strokeStyle = seriesColors[s % seriesColors.length];
            context.lineWidth = 5;
            let smoothed = getSmoothed(dataSeries[s]);
            if (chartType === 'line') {
                context.beginPath();
                context.moveTo(0, height - smoothed[0]);
                for (let i = 1; i < smoothed.length; i++) {
                    context.lineTo(i * valueIncrement, height - smoothed[i]);
                }
                context.stroke();
            } else if (chartType === 'bar') {
                for (let i = 0; i < smoothed.length; i++) {
                    context.beginPath();
                    context.rect(i * valueIncrement - 8, height - smoothed[i], 16, smoothed[i]);
                    context.fillStyle = seriesColors[s % seriesColors.length];
                    context.fill();
                }
            } else if (chartType === 'area') {
                context.beginPath();
                context.moveTo(0, height);
                for (let i = 0; i < smoothed.length; i++) {
                    context.lineTo(i * valueIncrement, height - smoothed[i]);
                }
                context.lineTo((smoothed.length - 1) * valueIncrement, height);
                context.closePath();
                context.fillStyle = seriesColors[s % seriesColors.length] + '88';
                context.fill();
                context.strokeStyle = seriesColors[s % seriesColors.length];
                context.stroke();
            } else if (chartType === 'scatter') {
                for (let i = 0; i < smoothed.length; i++) {
                    context.beginPath();
                    context.arc(i * valueIncrement, height - smoothed[i], 6, 0, 2 * Math.PI);
                    context.fillStyle = seriesColors[s % seriesColors.length];
                    context.fill();
                }
            }
        }
    }

    function drawVerticalLabels()
    {
        for (let i = 0; i < height; i += yIncrement)
        {
            context.strokeText(height - i, textOffset, i + 2 * textOffset);
        }
    }

    function drawHorizontalLabels()
    {
        for (let i = 0; i < width; i+=xIncrement)
        {
            context.strokeText(i, i + textOffset, height - textOffset);
        }
    }

    function generateRandomNumber()
    {
        return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    }

    function generateData()
    {
        for (let s = 0; s < seriesCount; s++) {
            for (let i = 0; i <= width; i += valueIncrement) {
                dataSeries[s][i / valueIncrement] = generateRandomNumber();
            }
        }
    }

    function draw()
    {
        context.clearRect(0, 0, width, height);
        drawVerticalLines();
        drawHorizontalLines();
        drawVerticalLabels();
        drawHorizontalLabels();
        drawChart();

        // Statistics panel
        let statsHtml = '';
        for (let s = 0; s < seriesCount; s++) {
            let smoothed = (typeof getSmoothed === 'function') ? getSmoothed(dataSeries[s]) : dataSeries[s];
            let current = smoothed[smoothed.length - 1];
            let min = Math.min(...smoothed);
            let max = Math.max(...smoothed);
            let avg = (smoothed.reduce((a, b) => a + b, 0) / smoothed.length).toFixed(1);
            let trend = '';
            if (smoothed.length > 1) {
                let diff = smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2];
                trend = diff > 0 ? 'Rising ▲' : (diff < 0 ? 'Falling ▼' : 'Stable');
            }
            statsHtml += `<b>Series ${s+1} (${seriesColors[s]})</b>: ` +
                `Current: ${current.toFixed(1)}, Min: ${min.toFixed(1)}, Max: ${max.toFixed(1)}, Avg: ${avg}, Trend: ${trend}<br>`;
        }
        document.getElementById('statsContent').innerHTML = statsHtml;
    }

    function generateNewValue()
    {
        for (let s = 0; s < seriesCount; s++) {
            let newValue = generateRandomNumber();
            dataSeries[s].push(newValue);
            dataSeries[s].shift();
        }
    }

    function startInterval() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(function() {
            if (running) {
                generateNewValue();
                draw();
            }
        }, updateInterval);
    }

    // Controls
    document.getElementById('startBtn').onclick = function() {
        running = true;
    };
    document.getElementById('pauseBtn').onclick = function() {
        running = false;
    };
    document.getElementById('speedSlider').oninput = function(e) {
        updateInterval = parseInt(e.target.value);
        startInterval();
    };
    document.getElementById('minValue').oninput = function(e) {
        minValue = parseInt(e.target.value);
    };
    document.getElementById('maxValue').oninput = function(e) {
        maxValue = parseInt(e.target.value);
    };
    document.getElementById('gridToggle').onchange = function(e) {
        showGrid = e.target.checked;
        draw();
    };
    document.getElementById('resetBtn').onclick = function() {
        generateData();
        draw();
    };

    startInterval();

    generateData();
    draw();
}