const canvas = document.getElementById('cyberBg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

const fontSize = 16;
const columns = canvas.width / fontSize; 


const drops = [];

for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}


function draw() {
    
    ctx.fillStyle = 'rgba(5, 5, 9, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    ctx.fillStyle = '#00f2fe'; 
    ctx.font = fontSize + 'px arial';

    
    for (let i = 0; i < drops.length; i++) {
        
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }


        drops[i]++;
    }
}

setInterval(draw, 33);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newColumns = canvas.width / fontSize;
    for (let x = 0; x < newColumns; x++) {
        if(!drops[x]) drops[x] = 1;
    }
});


document.getElementById('scanBtn').addEventListener('click', () => {
    const targetInput = document.getElementById('targetUrl');
    const terminalBody = document.querySelector('.terminal-body');
    const url = targetInput.value.trim();
    
    if (!url) return alert("CRITICAL_ERROR: URL Required");

    localStorage.setItem('scannedTarget', url);

    terminalBody.innerHTML += `<p class="output-line">> AUDIT_START: ${url}</p>`;
    terminalBody.innerHTML += `<p class="output-line">> Handing over to Dashboard UI...</p>`;

    setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/dashboard.html';
    }, 1500);
});
