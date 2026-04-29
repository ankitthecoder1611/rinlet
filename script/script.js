const canvas = document.getElementById('cyberBg');
const ctx = canvas.getContext('2d');

// Set canvas size to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Character set (using katakana, numbers, and Latin)
const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charArray = chars.split('');

const fontSize = 16;
const columns = canvas.width / fontSize; // Number of columns for the rain

// An array of drops - one per column
const drops = [];
// Initialize drops to start just above the screen
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

// Drawing the characters
function draw() {
    // Semi-transparent black background creates the trailing effect
    ctx.fillStyle = 'rgba(5, 5, 9, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the character color (faint cyber blue for depth)
    ctx.fillStyle = '#00f2fe'; 
    ctx.font = fontSize + 'px arial';

    // Looping over drops
    for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw the character
        // x = i*fontSize, y = drops[i]*fontSize
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Sending the drop back to the top randomly after it has crossed the screen
        // Randomness adds variance to the rain sequence
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Incrementing Y coordinate
        drops[i]++;
    }
}

// Draw loop
setInterval(draw, 33); // Approximately 30 FPS

// Resize handler to keep animation full screen
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Recalculate columns on resize
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

    // Visual feedback in terminal
    terminalBody.innerHTML += `<p class="output-line">> AUDIT_START: ${url}</p>`;
    terminalBody.innerHTML += `<p class="output-line">> Handing over to Dashboard UI...</p>`;

    setTimeout(() => {
        window.location.href = 'http://127.0.0.1:3000/dashboard.html';
    }, 1500);
});