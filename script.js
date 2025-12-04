// --- 1. PRELOADER ---
window.addEventListener('load', () => {
    // Initialize Icons
    lucide.createIcons();

    // Fade out preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 700);
    }, 2500);
});

// --- 2. DARK MODE & THEME TOGGLE ---
const themeBtn = document.getElementById('theme-toggle');
const html = document.documentElement;
const body = document.body;

themeBtn.addEventListener('click', () => {
    html.classList.toggle('dark');

    // Update Background Colors for Transition
    if (html.classList.contains('dark')) {
        body.classList.replace('bg-[#e6e6e6]', 'bg-dark');
        body.classList.replace('text-zinc-900', 'text-[#e0e0e0]');
    } else {
        body.classList.replace('bg-dark', 'bg-[#e6e6e6]');
        body.classList.replace('text-[#e0e0e0]', 'text-zinc-900');
    }
});

// --- 3. MOBILE MENU ---
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

// --- 4. TERMINAL LOGIC ---
const terminalModal = document.getElementById('terminal-modal');
const terminalContent = document.getElementById('terminal-content');
const openTerminalBtn = document.getElementById('open-terminal-btn');
const mobileTerminalBtn = document.getElementById('mobile-terminal-btn');
const closeTerminalBtn = document.getElementById('close-terminal');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

function toggleTerminal(show) {
    if (show) {
        terminalModal.classList.remove('hidden');
        // Trigger reflow for animation
        void terminalModal.offsetWidth;
        terminalModal.classList.remove('opacity-0');
        terminalModal.classList.add('opacity-100');
        terminalContent.classList.remove('scale-95');
        terminalContent.classList.add('scale-100');
        terminalInput.focus();

        // Close mobile menu if open
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
mobileTerminalBtn.addEventListener('click', () => toggleTerminal(true));
closeTerminalBtn.addEventListener('click', () => toggleTerminal(false));

// Hotkey (~ or `)
window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        const isHidden = terminalModal.classList.contains('hidden');
        toggleTerminal(isHidden);
    }
});

// Command Parser
terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = terminalInput.value.trim().toLowerCase();
        if (!cmd) return;

        const historyLine = document.createElement('div');
        historyLine.className = 'opacity-50';
        historyLine.textContent = `> ${cmd}`;
        terminalOutput.appendChild(historyLine);

        let response = '';
        switch (cmd) {
            case 'help': response = 'Available commands: about, projects, contact, email, clear'; break;
            case 'about': response = 'Cresvero: Growing Business Through Tech. We architect digital ecosystems.'; break;
            case 'projects': response = 'Capabilities: [WEB_INFRA] [APP_ECOSYSTEMS] [CLOUD_SCALING]'; break;
            case 'contact':
            case 'email': response = 'Mail: cresvero.tech@gmail.com'; break;
            case 'clear':
                terminalOutput.innerHTML = '';
                terminalInput.value = '';
                return;
            default: response = `Command not found: ${cmd}`;
        }

        const responseLine = document.createElement('div');
        responseLine.className = 'opacity-90 mb-2';
        responseLine.textContent = response;
        terminalOutput.appendChild(responseLine);

        // Auto Scroll
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        terminalInput.value = '';
    }
});

// --- 5. SCROLL ANIMATIONS (Intersection Observer) ---
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));

// --- 6. THREE.JS PRODUCT VISUALIZATION ---
const canvasContainer = document.getElementById('canvas-container');
const engineStatus = document.getElementById('engine-status');

// Setup Three Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
canvasContainer.appendChild(renderer.domElement);

// Geometries
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

// Animation Loop & Interaction
let rotationSpeed = 1;

canvasContainer.addEventListener('mouseenter', () => {
    rotationSpeed = 5;
    engineStatus.textContent = 'ACCELERATING';
});
canvasContainer.addEventListener('mouseleave', () => {
    rotationSpeed = 1;
    engineStatus.textContent = 'IDLE';
});

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

// Resize
window.addEventListener('resize', () => {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});

// --- 7. CONTACT FORM HANDLER ---
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Loading State
    submitBtn.classList.remove('border-zinc-500', 'text-zinc-400');
    submitBtn.classList.add('border-white', 'text-white');
    btnText.textContent = "UPLOADING...";

    // Simulate Sending
    setTimeout(() => {
        // Success State
        submitBtn.classList.remove('border-white', 'text-white');
        submitBtn.classList.add('bg-sage', 'border-sage', 'text-black');
        btnText.textContent = "SENT SUCCESSFULLY";
        submitBtn.querySelector('i').remove(); // Remove icon

        // Reset after 3s
        setTimeout(() => {
            contactForm.reset();
            btnText.textContent = "SEND TRANSMISSION";
            submitBtn.classList.remove('bg-sage', 'border-sage', 'text-black');
            submitBtn.classList.add('border-zinc-500', 'text-zinc-400');
            // Note: In real app, re-add icon logic needed
            location.reload(); // Simple reset for this demo
        }, 3000);
    }, 1500);
});