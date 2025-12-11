// --- 1. UTILS ---
window.addEventListener('load', () => {
    lucide.createIcons();
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 500);
    }, 700);

    updateSystemTime();
    setInterval(updateSystemTime, 1000);
});

// System Time Logic
function updateSystemTime() {
    const now = new Date();
    const timeString = now.toUTCString().split(' ')[4];
    const el = document.getElementById('system-time');
    if (el) el.textContent = `${timeString} UTC`;
}

// --- 2. TEXT SCRAMBLE EFFECT ---
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="opacity-50">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// --- 3. ANIMATION OBSERVER & SCROLL TOP ---
const observerOptions = { threshold: 0.15 };
const scrollTopBtn = document.getElementById('scroll-top-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.remove('opacity-0', 'translate-y-10');
        scrollTopBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
    } else {
        scrollTopBtn.classList.add('opacity-0', 'translate-y-10');
        scrollTopBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if (entry.target.classList.contains('scramble-target')) {
                if (!entry.target.dataset.scrambled) {
                    const originalText = entry.target.innerText;
                    const scramble = new TextScramble(entry.target);
                    scramble.setText(originalText);
                    entry.target.dataset.scrambled = "true";
                }
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));

// --- 4. COPY EMAIL FEATURE ---
function copyEmail() {
    const email = "amalsonuoff@gmail.com";
    // Use Clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => showToast("EMAIL COPIED TO CLIPBOARD"));
    } else {
        // Fallback for non-secure contexts (like some previews)
        const textArea = document.createElement("textarea");
        textArea.value = email;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("EMAIL COPIED TO CLIPBOARD");
        } catch (err) {
            showToast("ERROR COPYING EMAIL");
        }
        document.body.removeChild(textArea);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = msg;
    toast.classList.remove('hide');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
    }, 3000);
}

// --- 5. THEME & MENU ---
const themeBtn = document.getElementById('theme-toggle');
const html = document.documentElement;
const body = document.body;

function toggleTheme(forceDark = null) {
    const isDark = forceDark !== null ? forceDark : !html.classList.contains('dark');
    if (isDark) {
        html.classList.add('dark');
        body.classList.replace('bg-[#e6e6e6]', 'bg-dark');
        body.classList.replace('text-zinc-900', 'text-[#e0e0e0]');
    } else {
        html.classList.remove('dark');
        body.classList.replace('bg-dark', 'bg-[#e6e6e6]');
        body.classList.replace('text-[#e0e0e0]', 'text-zinc-900');
    }
}

themeBtn.addEventListener('click', () => toggleTheme());

const menuBtn = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link a');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('closed');
        mobileMenu.classList.add('open');
        menuBtn.innerHTML = '<i data-lucide="x" class="w-6 h-6"></i>';
    } else {
        mobileMenu.classList.remove('open');
        mobileMenu.classList.add('closed');
        menuBtn.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
    }
    lucide.createIcons();
}
menuBtn.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

// --- 6. TERMINAL LOGIC ---
const terminalModal = document.getElementById('terminal-modal');
const terminalContent = document.getElementById('terminal-content');
const openTerminalBtn = document.getElementById('open-terminal-btn');
const closeTerminalBtn = document.getElementById('close-terminal');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const matrixCanvas = document.getElementById('matrix-canvas');

function toggleTerminal(show) {
    if (show) {
        terminalModal.classList.remove('hidden');
        void terminalModal.offsetWidth;
        terminalModal.classList.remove('opacity-0');
        terminalModal.classList.add('opacity-100');
        terminalContent.classList.remove('scale-95');
        terminalContent.classList.add('scale-100');
        terminalInput.focus();
        if (isMenuOpen) toggleMenu();
    } else {
        terminalModal.classList.remove('opacity-100');
        terminalModal.classList.add('opacity-0');
        terminalContent.classList.remove('scale-100');
        terminalContent.classList.add('scale-95');
        setTimeout(() => {
            terminalModal.classList.add('hidden');
        }, 300);
    }
}

openTerminalBtn.addEventListener('click', () => toggleTerminal(true));
closeTerminalBtn.addEventListener('click', () => toggleTerminal(false));

window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        const isHidden = terminalModal.classList.contains('hidden');
        toggleTerminal(isHidden);
    }
});

// Matrix Effect
let matrixInterval;
function startMatrix() {
    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    matrixCanvas.classList.add('active');

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    const fontSize = 16;
    const columns = matrixCanvas.width / fontSize;
    const rainDrops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = '#b9c095'; // Sage Green
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };
    matrixInterval = setInterval(draw, 30);
    setTimeout(() => {
        clearInterval(matrixInterval);
        matrixCanvas.classList.remove('active');
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }, 5000); // Run for 5s
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const rawCmd = terminalInput.value.trim().toLowerCase();
        if (!rawCmd) return;

        const parts = rawCmd.split(' ');
        const cmd = parts[0];
        const arg = parts[1];

        const historyLine = document.createElement('div');
        historyLine.className = 'opacity-50';
        historyLine.textContent = `> ${terminalInput.value}`;
        terminalOutput.appendChild(historyLine);

        let response = '';

        switch (cmd) {
            case 'help':
                response = 'CMDS: about, projects, contact, email, theme [dark/light], time, stack, matrix, clear';
                break;
            case 'about':
                response = 'Cresvero: Est 2024. Building future-proof digital systems.';
                break;
            case 'projects':
                response = 'Featured: IKARA [AI Art Recognition]. See #projects for more.';
                break;
            case 'contact':
            case 'email':
                response = 'Mail: amalsonuoff@gmail.com';
                break;
            case 'time':
                response = new Date().toString();
                break;
            case 'stack':
                response = 'CORE: React, Three.js, Node.js, Tailwind, Python.';
                break;
            case 'matrix':
                response = 'Wake up, Neo...';
                startMatrix();
                toggleTerminal(false); // Hide terminal to see effect
                break;
            case 'theme':
                if (arg === 'light') {
                    toggleTheme(false);
                    response = 'Theme set to LIGHT.';
                } else if (arg === 'dark') {
                    toggleTheme(true);
                    response = 'Theme set to DARK.';
                } else {
                    toggleTheme();
                    response = 'Theme toggled.';
                }
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                terminalInput.value = '';
                return;
            default:
                response = `Command not found: ${cmd}`;
        }
        const responseLine = document.createElement('div');
        responseLine.className = 'opacity-90 mb-2';
        responseLine.textContent = response;
        terminalOutput.appendChild(responseLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalInput.value = '';
    }
});

// --- 7. THREE.JS ---
const canvasContainer = document.getElementById('canvas-container');
const engineStatus = document.getElementById('engine-status');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
canvasContainer.appendChild(renderer.domElement);

const geometry = new THREE.IcosahedronGeometry(2.2, 0);
const material = new THREE.MeshNormalMaterial({ wireframe: true, transparent: true, opacity: 0.5 });
const coreGeometry = new THREE.OctahedronGeometry(1.2, 0);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xb9c095, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
const core = new THREE.Mesh(coreGeometry, coreMaterial);
const group = new THREE.Group();
group.add(cube);
group.add(core);
scene.add(group);
camera.position.z = 6;

let rotationSpeed = 1;
canvasContainer.addEventListener('mouseenter', () => { rotationSpeed = 5; engineStatus.textContent = 'ACCELERATING'; });
canvasContainer.addEventListener('mouseleave', () => { rotationSpeed = 1; engineStatus.textContent = 'IDLE'; });

function animate() {
    requestAnimationFrame(animate);
    group.rotation.x += 0.003 * rotationSpeed;
    group.rotation.y += 0.005 * rotationSpeed;
    const time = Date.now() * 0.0015;
    core.scale.setScalar(1 + Math.sin(time * 2) * 0.15);
    cube.rotation.z = Math.sin(time) * 0.2;
    renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});
