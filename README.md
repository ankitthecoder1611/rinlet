```
██████╗ ██╗███╗   ██╗██╗     ███████╗████████╗
██╔══██╗██║████╗  ██║██║     ██╔════╝╚══██╔══╝
██████╔╝██║██╔██╗ ██║██║     █████╗     ██║   
██╔══██╗██║██║╚██╗██║██║     ██╔══╝     ██║   
██║  ██║██║██║ ╚████║███████╗███████╗   ██║   
╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   
```
> **Real-time cyber vulnerability scanner with SOC-style dashboard.**  
> First-Strike Reconnaissance. Before they get in.

---

## DEMO

```
rinlet@pwn:~$ run-audit --target https://example.com
[!] AUDIT_START: https://example.com
[+] HTTPS        ........... PASSED
[+] HEADERS      ........... VULN_FOUND
[+] DOMAIN       ........... PASSED
[+] INJECTION    ........... PASSED
[!] RATE_LIMIT   ........... VULN_FOUND
[+] PORT_SCAN    ........... PASSED
[+] AUDIT_COMPLETE — SAFETY_INDEX: 83%
```

---

## FEATURES

| MODULE | WHAT IT CHECKS |
|---|---|
| `HTTPS` | SSL/TLS encryption enforced |
| `HEADERS` | CSP, X-Frame-Options, HSTS |
| `DOMAIN` | SPF / DKIM / DMARC records |
| `INJECTION` | Field sanitization integrity |
| `DIRECTORIES` | Exposed `.env`, `.git`, `admin/` paths |
| `SUBDOMAINS` | Abandoned dev/staging hosts |
| `TECH_STACK` | Server version disclosure |
| `SQL_INJ` | Database query escape logic |
| `XSS_VULN` | Client-side script reflection |
| `AUTH_BYPASS` | Session & cookie security |
| `RATE_LIMIT` | Brute-force & DoS resilience |
| `PORT_SCAN` | Open ports (21, 22, 80, 443, 3306) |

---

## QUICKSTART

### Prerequisites
- [Node.js](https://nodejs.org) v16 or higher
- npm (bundled with Node)

### Setup

```bash
# Clone the repo
git clone https://github.com/ankitthecoder1611/rinlet.git
cd rinlet

# Install dependencies
npm install

# Start the security engine
node server.js
```

Then open your browser at:

```
http://127.0.0.1:3000/index.html
```

Enter any target URL and hit `EXECUTE`.

---

## STACK

```
Frontend  →  HTML / CSS / Vanilla JS / Chart.js
Backend   →  Node.js / Express 4 / Axios
Probing   →  HTTP, TCP Sockets, DNS (native net module)
```

---

## ARCHITECTURE

```
[index.html]     →  User inputs target URL
     ↓
[server.js]      →  POST /api/scan
     ↓
[performScan()]  →  Parallel async probing (HTTP / TCP / DNS)
     ↓
[JSON results]   →  Returned to dashboard
     ↓
[dashboard.js]   →  Sequential module reveal + Chart.js telemetry
```

---

## LEGAL

```
[!] LEGAL_WARNING: RINLET is a high-precision reconnaissance tool.
    Unauthorized use against foreign infrastructure is strictly
    prohibited. Use for ethical defense and authorized testing only.
    Developers assume no liability for misuse.
```

---

## AUTHOR

Built at **IILM University, SCSE**  
RINLET SEC_CORE v1.0