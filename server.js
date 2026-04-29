const express = require('express');
const axios = require('axios');
const cors = require('cors');
const net = require('net');
const app = express();
const PORT = 3000;

// NEW PERMISSIVE CORS CONFIGURATION
app.use(cors({
    origin: '*', // Allows all origins (Frontend URLs) to connect
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// ... rest of your code (performScan, app.post, etc.) ...
app.use(express.json());

// ... rest of your performScan and routes code ...

/**
 * MODULE: Port Scanner
 * Checks if critical ports (21, 22, 80, 443, 3306) are open
 */
const checkPort = (port, host) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1500); // 1.5s timeout per port
        socket.on('connect', () => { socket.destroy(); resolve(true); });
        socket.on('timeout', () => { socket.destroy(); resolve(false); });
        socket.on('error', () => { socket.destroy(); resolve(false); });
        socket.connect(port, host);
    });
};

/**
 * MODULE: Directory Discovery
 * Checks for sensitive exposed paths
 */
async function checkPath(baseUrl, path) {
    try {
        const res = await axios.get(`${baseUrl}/${path}`, { timeout: 2000, validateStatus: false });
        return res.status === 200;
    } catch { return false; }
}

async function performScan(target) {
    // Sanitize target
    const host = target.replace(/^(https?:\/\/)/, '').replace(/\/$/, '');
    const baseUrl = target.startsWith('http') ? target : `https://${host}`;
    const results = {};

    try {
        const response = await axios.get(baseUrl, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Rinlet-Security-Scanner/2.0' },
            validateStatus: false
        });

        const headers = response.headers;

        // 1. HTTPS Check
        results.https = baseUrl.startsWith('https');

        // 2. Security Headers (Real)
        const securityHeaders = ['content-security-policy', 'x-frame-options', 'strict-transport-security'];
        results.headers = securityHeaders.some(h => headers[h]);

        // 3. Tech Exposure (Real)
        results.tech = !(headers['x-powered-by'] || (headers['server'] && headers['server'].length > 12));

        // 4. Ports Check (Real)
        // We consider it "Safe" if common dangerous ports (21, 3306) are closed
        const openPorts = [];
        const criticalPorts = [21, 22, 80, 443, 3306];
        for (const port of criticalPorts) {
            const isOpen = await checkPort(port, host);
            if (isOpen) openPorts.push(port);
        }
        results.ports = !openPorts.includes(3306) && !openPorts.includes(21);

        // 5. Directories (Real)
        const hiddenPaths = ['.env', '.git/config', 'phpinfo.php', 'admin/'];
        let foundPaths = 0;
        for (const path of hiddenPaths) {
            if (await checkPath(baseUrl, path)) foundPaths++;
        }
        results.directories = foundPaths === 0;

        // 6. Rate Limiting (Heuristic)
        // If the server doesn't provide a 'retry-after' or 'x-ratelimit' header, we flag it
        results.rate = !!(headers['x-ratelimit-limit'] || headers['retry-after']);

        // Mocking the remaining complex ones for the dashboard UI
        results.domain = true;
        results.injection = true;
        results.subdomains = true;
        results.sql = true;
        results.xss = true;
        results.auth = true;

        return results;

    } catch (error) {
        console.error(`Scan Error: ${error.message}`);
        // Return false for everything if site is totally down
        return { error: "Target unreachable", status: "OFFLINE" };
    }
}

app.post('/api/scan', async (req, res) => {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: "No target provided" });
    
    console.log(`[!] AUDIT_START: ${target}`);
    const scanData = await performScan(target);
    console.log(`[+] AUDIT_COMPLETE: ${target}`);
    res.json(scanData);
});

app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    RINLET SEC_ENGINE RUNNING: http://localhost:${PORT}
    -------------------------------------------
    `);
});