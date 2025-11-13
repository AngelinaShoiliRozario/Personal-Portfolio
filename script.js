// ===== Three.js Background Animation =====
let scene, camera, renderer, particles, particleSystem;
let mouse = { x: 0, y: 0 };

function initThreeJS() {
    const canvas = document.getElementById('three-canvas');

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particle network
    createParticleNetwork();

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Track mouse movement
    document.addEventListener('mousemove', onMouseMove);
}

function createParticleNetwork() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create particles
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;

        // Cyan color for particles
        colors[i] = 0;
        colors[i + 1] = 0.94;
        colors[i + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Create connecting lines
    createConnectionLines();
}

function createConnectionLines() {
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });

    const positions = particleSystem.geometry.attributes.position.array;
    const linePositions = [];

    // Create connections between nearby particles
    for (let i = 0; i < positions.length; i += 30) {
        for (let j = i + 30; j < positions.length; j += 30) {
            const dx = positions[i] - positions[j];
            const dy = positions[i + 1] - positions[j + 1];
            const dz = positions[i + 2] - positions[j + 2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < 15) {
                linePositions.push(
                    positions[i], positions[i + 1], positions[i + 2],
                    positions[j], positions[j + 1], positions[j + 2]
                );
            }
        }
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate particle system
    if (particleSystem) {
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.001;

        // Mouse interaction
        particleSystem.rotation.x += mouse.y * 0.00005;
        particleSystem.rotation.y += mouse.x * 0.00005;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ===== Navigation =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');

        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('active')
            ? 'rotate(45deg) translate(5px, 5px)'
            : 'none';
        spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('active')
            ? 'rotate(-45deg) translate(7px, -6px)'
            : 'none';
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== Stat Counter Animation =====
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Trigger counter animation when in view
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const target = parseInt(statNumber.getAttribute('data-target'));
            animateCounter(statNumber, target);
            statObserver.unobserve(statNumber);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

// ===== Reveal Animation on Scroll =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.reveal-animation').forEach(element => {
    revealObserver.observe(element);
});

// ===== Typing Effect =====
const typingText = document.querySelector('.typing-text');
if (typingText) {
    const text = typingText.textContent;
    typingText.textContent = '';
    let index = 0;

    function typeText() {
        if (index < text.length) {
            typingText.textContent += text.charAt(index);
            index++;
            setTimeout(typeText, 100);
        }
    }

    // Start typing after a short delay
    setTimeout(typeText, 500);
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Parallax Effect for Sections =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 800;
    }
});

// ===== Glitch Effect on Hover =====
const glitchText = document.querySelector('.glitch-text');
if (glitchText) {
    glitchText.addEventListener('mouseenter', () => {
        glitchText.style.animation = 'glitch 0.3s infinite';
    });

    glitchText.addEventListener('mouseleave', () => {
        glitchText.style.animation = 'glitch 3s infinite';
    });
}

// ===== Button Ripple Effect =====
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-glow');

        // Reset animation
        ripple.style.width = '0';
        ripple.style.height = '0';

        // Trigger animation
        setTimeout(() => {
            ripple.style.width = '300px';
            ripple.style.height = '300px';
        }, 10);
    });
});

// ===== Skill Tag Interaction =====
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.05)';
    });

    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== Cube Interaction =====
const techCube = document.querySelector('.tech-cube');
if (techCube) {
    let isHovering = false;

    techCube.addEventListener('mouseenter', () => {
        isHovering = true;
        techCube.style.animationPlayState = 'paused';
    });

    techCube.addEventListener('mouseleave', () => {
        isHovering = false;
        techCube.style.animationPlayState = 'running';
    });

    techCube.addEventListener('mousemove', (e) => {
        if (isHovering) {
            const rect = techCube.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (y / rect.height) * 30;
            const rotateY = (x / rect.width) * 30;

            techCube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    });
}

// ===== Timeline Animation Enhancement =====
const timelineMarker = document.querySelector('.timeline-marker');
if (timelineMarker) {
    window.addEventListener('scroll', () => {
        const markerPosition = timelineMarker.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (markerPosition < windowHeight * 0.7) {
            timelineMarker.style.animation = 'pulse-marker 1s infinite';
        }
    });
}

// ===== Card Tilt Effect =====
function initCardTilt() {
    const cards = document.querySelectorAll('.skill-category, .pillar-card, .stat-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== Scroll Progress Indicator =====
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #00f0ff 0%, #7000ff 100%);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ===== Cursor Trail Effect =====
function createCursorTrail() {
    const coords = { x: 0, y: 0 };
    const circles = [];
    const colors = ['#00f0ff', '#7000ff', '#ff006e'];

    // Create cursor circles
    for (let i = 0; i < 20; i++) {
        const circle = document.createElement('div');
        circle.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${colors[i % colors.length]};
            pointer-events: none;
            opacity: ${1 - i * 0.05};
            z-index: 9998;
            transition: transform 0.1s ease;
        `;
        circles.push(circle);
        document.body.appendChild(circle);
    }

    // Track cursor
    window.addEventListener('mousemove', (e) => {
        coords.x = e.clientX;
        coords.y = e.clientY;
    });

    // Animate circles
    function animateCircles() {
        let x = coords.x;
        let y = coords.y;

        circles.forEach((circle, index) => {
            circle.style.left = x - 5 + 'px';
            circle.style.top = y - 5 + 'px';
            circle.style.transform = `scale(${(20 - index) / 20})`;

            const nextCircle = circles[index + 1] || circles[0];
            x += (parseFloat(nextCircle.style.left) - x) * 0.3;
            y += (parseFloat(nextCircle.style.top) - y) * 0.3;
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();
}

// ===== Performance Optimization =====
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js background
    initThreeJS();

    // Initialize card tilt effect
    initCardTilt();

    // Create scroll progress indicator
    createScrollProgress();

    // Create cursor trail only on desktop
    if (!isMobileDevice()) {
        createCursorTrail();
    }

    // Add loading complete class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ===== Preloader =====
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// ===== Enhanced Scroll Animations =====
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Add any scroll-end effects here
    }, 100);
});

// ===== Easter Egg: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Easter egg activated!
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, 3000);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// ===== Console Message =====
console.log('%c🚀 Welcome to my Portfolio!', 'color: #00f0ff; font-size: 24px; font-weight: bold;');
console.log('%cBuilding a better world through technology', 'color: #7000ff; font-size: 14px;');
console.log('%cInterested in connecting? Let\'s build something amazing together!', 'color: #ff006e; font-size: 12px;');
