document.addEventListener("DOMContentLoaded", () => {
    // cursor con inercia
    const dot = document.getElementById("dot");
    const outline = document.getElementById("outline");
    let mouseX = 0, mouseY = 0, outX = 0, outY = 0;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + "px"; dot.style.top = mouseY + "px";
    });

    function renderCursor() {
        outX += (mouseX - outX) * 0.12; outY += (mouseY - outY) * 0.12;
        outline.style.left = outX + "px"; outline.style.top = outY + "px";
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    document.querySelectorAll("a, button, .project-item, .tab-btn, .color-dot-opt").forEach(el => {
        el.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
    });

    // florecitas
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    let flowerArray = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize);
    resize();

    class FlowerParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 4 + 3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.2) * 0.4;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.015;
            this.petals = 5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spin;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
            ctx.globalAlpha = 0.35;
            for (let i = 0; i < this.petals; i++) {
                ctx.rotate((Math.PI * 2) / this.petals);
                ctx.beginPath();
                ctx.arc(this.size * 1.3, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim();
            ctx.globalAlpha = 0.6;
            ctx.fill();
            ctx.restore();
        }
    }

    function init() {
        flowerArray = [];
        for (let i = 0; i < 45; i++) flowerArray.push(new FlowerParticle());
    }
    init();

    function drawLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < flowerArray.length; i++) {
            flowerArray[i].update();
            flowerArray[i].draw();
            for (let j = i + 1; j < flowerArray.length; j++) {
                const dx = flowerArray[i].x - flowerArray[j].x;
                const dy = flowerArray[i].y - flowerArray[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();
                    ctx.globalAlpha = (130 - dist) * 0.0006;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(flowerArray[i].x, flowerArray[i].y);
                    ctx.lineTo(flowerArray[j].x, flowerArray[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(drawLoop);
    }
    drawLoop();

    // tilt 3d card
    document.querySelectorAll(".js-tilt").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left - (r.width / 2);
            const y = e.clientY - r.top - (r.height / 2);
            card.style.transform = `perspective(1000px) rotateX(${-(y / r.height) * 10}deg) rotateY(${(x / r.width) * 10}deg)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // selector jardines
    const panel = document.getElementById("themePanel");
    document.getElementById("themeToggleBtn").addEventListener("click", () => panel.classList.toggle("active"));

    document.querySelectorAll(".color-dot-opt").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".color-dot-opt").forEach(x => x.classList.remove("active"));
            btn.classList.add("active");
            document.documentElement.style.setProperty('--accent-primary', btn.getAttribute("data-primary"));
            document.documentElement.style.setProperty('--accent-secondary', btn.getAttribute("data-secondary"));
        });
    });

    const words = ["experiencias bonitas.", "soluciones de software", "interfaces super hiper megas lindisimas"];
    let wIdx = 0, cIdx = 0, del = false;
    function type() {
        const cur = words[wIdx];
        document.getElementById("typewriter").textContent = del ? cur.substring(0, cIdx - 1) : cur.substring(0, cIdx + 1);
        cIdx = del ? cIdx - 1 : cIdx + 1;
        let s = del ? 40 : 80;
        if (!del && cIdx === cur.length) { s = 2000; del = true; }
        else if (del && cIdx === 0) { del = false; wIdx = (wIdx + 1) % words.length; s = 400; }
        setTimeout(type, s);
    }
    type();

    // Intersection Observer y Scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("active");
                if (e.target.id === "sobre-mi") animateCounters();
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(r => observer.observe(r));

    window.addEventListener("scroll", () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const progress = document.getElementById("scroll-progress");
        if(progress) progress.style.width = (window.scrollY / h * 100) + "%";
        document.getElementById("mainHeader").classList.toggle("scrolled", window.scrollY > 40);
    });

    document.querySelectorAll(".tab-btn").forEach(b => {
        b.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("active"));
            document.querySelectorAll(".tab-content-panel").forEach(x => x.classList.remove("active"));
            b.classList.add("active");
            document.getElementById(b.getAttribute("data-tab")).classList.add("active");
        });
    });

    function animateCounters() {
        document.querySelectorAll(".counter").forEach(c => {
            const tgt = +c.getAttribute("data-target");
            let cur = 0;
            const u = () => {
                cur += tgt / 15;
                if (cur < tgt) { c.innerText = Math.ceil(cur) + "+"; setTimeout(u, 50); }
                else c.innerText = tgt + "+";
            };
            u();
        });
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById("formSuccess").classList.add("active");
    setTimeout(() => {
        document.getElementById("formSuccess").classList.remove("active");
        e.target.reset();
    }, 3000);
}