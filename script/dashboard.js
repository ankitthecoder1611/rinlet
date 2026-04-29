document.addEventListener('DOMContentLoaded', () => {
    
    const modules = [
        'https', 'headers', 'domain', 'injection', 'directories', 
        'subdomains', 'tech', 'sql', 'xss', 'auth', 'rate', 'ports'
    ];

    
    let safetyScoreChart, threatDistChart, auditChronologyChart;
    let safeCount = 0;
    let vulnCount = 0;
    
    const scannedTarget = localStorage.getItem('scannedTarget');

    
const CODESPACE_URL = "https://bug-free-sniffle-5gprxxjprpq3w4x-3000.app.github.dev"; 

    const LOCAL_URL = "http://127.0.0.1:3000";
    

    const API_BASE = window.location.hostname.includes('github.dev') ? CODESPACE_URL : LOCAL_URL;

    if (scannedTarget) {
        document.getElementById('targetDisplay').innerText = scannedTarget;
        initializeCharts();
        startRealAudit(scannedTarget);
    } else {
        document.getElementById('targetDisplay').innerText = "NO_ACTIVE_SESSION";
    }

    function initializeCharts() {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#8b949e', font: { family: 'Fira Code', size: 10 } } }
            },
            animation: { duration: 500 }
        };

        safetyScoreChart = new Chart(document.getElementById('safetyScoreChart'), {
            type: 'doughnut',
            data: {
                labels: ['Secure', 'Remaining'],
                datasets: [{ data: [0, 100], backgroundColor: ['#00f2fe', '#161b22'], borderWidth: 0 }]
            },
            options: { ...commonOptions, cutout: '85%' }
        });

        threatDistChart = new Chart(document.getElementById('threatDistChart'), {
            type: 'pie',
            data: {
                labels: ['Safe', 'Vuln', 'Pending'],
                datasets: [{ data: [0, 0, 12], backgroundColor: ['#00ff41', '#f85149', '#30363d'], borderWidth: 0 }]
            },
            options: commonOptions
        });

        auditChronologyChart = new Chart(document.getElementById('auditLineChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'SECURITY_INDEX',
                    data: [],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: { grid: { color: '#161b22' }, ticks: { color: '#8b949e' } },
                    y: { min: 0, max: 100, grid: { color: '#161b22' }, ticks: { color: '#8b949e' } }
                }
            }
        });
    }

    async function startRealAudit(target) {
        try {
            console.log(`[!] Contacting Backend: ${API_BASE}/api/scan`);
            
            const response = await fetch(`${API_BASE}/api/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: target })
            });

            if (!response.ok) throw new Error("COULD_NOT_REACH_SECURITY_ENGINE");
            
            const realData = await response.json();

            for (let i = 0; i < modules.length; i++) {
                const modId = modules[i];
                const element = document.getElementById(`mod-${modId}`);
                
                if (element) {
                    const statusEl = element.querySelector('.mod-status');
                    statusEl.innerText = "AUDITING...";
                    statusEl.className = "mod-status status-scanning";
                }

                await new Promise(r => setTimeout(r, 600));

                const isSafe = realData[modId] ?? false; 

                if (isSafe) {
                    safeCount++;
                    if (element) {
                        element.querySelector('.mod-status').className = "mod-status status-safe";
                        element.querySelector('.mod-status').innerText = "PASSED";
                    }
                } else {
                    vulnCount++;
                    if (element) {
                        element.querySelector('.mod-status').className = "mod-status status-vuln";
                        element.querySelector('.mod-status').innerText = "VULN_FOUND";
                        element.style.borderColor = "var(--danger)";
                    }
                }

                updateDashboardMetrics(modId, i + 1);
            }
        } catch (error) {
            console.error("SOC_ERROR:", error);
            const targetEl = document.getElementById('targetDisplay');
            targetEl.innerText = "ERROR: BACKEND_UNREACHABLE";
            targetEl.style.color = "#f85149";
            

            console.warn("HINT: Ensure your port 3000 is set to 'Public' in the Ports tab.");
        }
    }

    function updateDashboardMetrics(moduleName, step) {
        const total = modules.length;
        const currentSafety = Math.round((safeCount / step) * 100);


        safetyScoreChart.data.datasets[0].data = [currentSafety, 100 - currentSafety];
        safetyScoreChart.update();


        threatDistChart.data.datasets[0].data = [safeCount, vulnCount, total - step];
        threatDistChart.update();

        auditChronologyChart.data.labels.push(moduleName.toUpperCase());
        auditChronologyChart.data.datasets[0].data.push(currentSafety);
        auditChronologyChart.update();

        const threatLevel = document.getElementById('threatLevel');
        if (threatLevel) {
            if (currentSafety >= 80) { threatLevel.innerText = "STABLE"; threatLevel.style.color = "#00ff41"; }
            else if (currentSafety >= 50) { threatLevel.innerText = "WARNING"; threatLevel.style.color = "#ffbd2e"; }
            else { threatLevel.innerText = "CRITICAL"; threatLevel.style.color = "#f85149"; }
        }
    }
});
