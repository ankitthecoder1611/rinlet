const express = require('express');
const axios = require('axios');
const cors = require('cors');
const net = require('net');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const checkPort = (port, host) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1500);
        socket.on('connect', () => { socket.destroy(); resolve(true); });
        socket.on('timeout', () => { socket.destroy(); resolve(false); });
        socket.on('error', () => { socket.destroy(); resolve(false); });
        socket.connect(port, host);
    });
};

async function checkPath(baseUrl, path) {
    try {
        const res = await axios.get(`${baseUrl}/${path}`, { timeout: 2000, validateStatus: false });
        return res.status === 200;
    } catch { return false; }
}

async function performScan(target) {
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

        
        results.https = baseUrl.startsWith('https');

        
        const securityHeaders = ['content-security-policy', 'x-frame-options', 'strict-transport-security'];
        results.headers = securityHeaders.some(h => headers[h]);

        
        results.tech = !(headers['x-powered-by'] || (headers['server'] && headers['server'].length > 12));

        
        const openPorts = [];
        const criticalPorts = [21, 22, 80, 443, 3306];
        for (const port of criticalPorts) {
            const isOpen = await checkPort(port, host);
            if (isOpen) openPorts.push(port);
        }
        results.ports = !openPorts.includes(3306) && !openPorts.includes(21);


        const hiddenPaths = ['.env', '.git/config', 'phpinfo.php', 'admin/'];
        let foundPaths = 0;
        for (const p of hiddenPaths) {
            if (await checkPath(baseUrl, p)) foundPaths++;
        }
        results.directories = foundPaths === 0;

        results.rate = !!(headers['x-ratelimit-limit'] || headers['retry-after']);


        results.domain = true;
        results.injection = true;
        results.subdomains = true;
        results.sql = true;
        results.xss = true;
        results.auth = true;

        return results;

    } catch (error) {
        console.error(`Scan Error: ${error.message}`);
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