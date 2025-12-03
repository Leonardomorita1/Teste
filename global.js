/* -------------------------------------------
 * CONFIGURAÇÃO E ESTADO GLOBAL
 * ------------------------------------------- */
const CONFIG = {
    scrollLimit: 500, // Pixels para a animação completar
    colors: {
        mesh: 0x2A62C6,
        ambient: 0x042476,
        light: 0x042476
    },
    positions: {
        start: { x: 0, y: 0, z: 0 },
        end: { x: 4.5, y: 3, z: 0 } // Posição fixa de destino (topo direito)
    }
};

const state = {
    mouseX: 0,
    targetScroll: 0,
    currentScroll: 0
};

let scene, camera, renderer, mesh;

/* -------------------------------------------
 * 1. THREE.JS (OTIMIZADO)
 * ------------------------------------------- */
function initThree() {
    const container = document.getElementById('three-container');
    if (!container) return;

    // Cena e Câmera Fixa (Sem lógica complexa de mobile)
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18; // Distância segura para visualização

    // Renderizador Otimizado
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limita pixelRatio para performance
    container.appendChild(renderer.domElement);

    // Objeto (Icosaedro)
    const geometry = new THREE.IcosahedronGeometry(9, 1); // 2º param reduzido para performance se necessário
    const material = new THREE.MeshPhongMaterial({
        color: CONFIG.colors.mesh,
        specular: 0xAAAAAA,
        shininess: 50,
        transparent: true,
        opacity: 0.3, // Aumentado levemente para visibilidade
        wireframe: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(CONFIG.colors.ambient, 5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(CONFIG.colors.light, 15);
    dirLight.position.set(15, 15, 15);
    scene.add(dirLight);

    // Listeners Otimizados
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('mousemove', e => {
        state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    }, { passive: true });

    animate();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Loop de Animação Unificado (Render + Lógica)
function animate() {
    requestAnimationFrame(animate);

    // 1. Atualiza Scroll (Lerp suave)
    state.targetScroll = window.scrollY;
    // Interpolação simples para suavizar movimento
    state.currentScroll += (state.targetScroll - state.currentScroll) * 0.1;

    const progress = Math.min(1, state.currentScroll / CONFIG.scrollLimit);

    // 2. Movimento do Objeto (Posição baseada no Scroll)
    mesh.position.x = CONFIG.positions.start.x + (CONFIG.positions.end.x - CONFIG.positions.start.x) * progress;
    mesh.position.y = CONFIG.positions.start.y + (CONFIG.positions.end.y - CONFIG.positions.start.y) * progress;
    
    // Zoom out leve ao rolar
    mesh.position.z = CONFIG.positions.start.z + progress * 2;

    // 3. Rotação (Constante + Mouse)
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.002;
    mesh.rotation.z += state.mouseX * 0.01;

    // 4. Paralaxe da Câmera
    camera.position.x += (state.mouseX * 0.5 - camera.position.x) * 0.05;

    renderer.render(scene, camera);
}

/* -------------------------------------------
 * 2. UTILITÁRIOS (SCROLL & REVEAL)
 * ------------------------------------------- */
function initUtils() {
    // Smooth Scroll via Event Delegation (Mais leve que adicionar listeners em cada link)
    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (link && link.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Scroll Reveal com IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

/* -------------------------------------------
 * 3. PARTICLES.JS (CONFIG COMPACTADA)
 * ------------------------------------------- */
function initParticles() {
    // Configuração minificada para limpeza de código
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } }, // Reduzi qtd para performance
            color: { value: "#4CAF50" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#3B82F6", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 1.5, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
}

/* -------------------------------------------
 * INICIALIZAÇÃO
 * ------------------------------------------- */
window.addEventListener('load', () => {
    try {
        initParticles();
        initThree();
        initUtils();
    } catch (e) {
        console.warn("Recursos visuais reduzidos:", e);
    }
});