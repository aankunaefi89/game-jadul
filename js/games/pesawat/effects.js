// js/games/pesawat/effects.js

// --- 1. KELAS PARTIKEL LEDAKAN ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || '#ff9f43';
        this.size = Math.random() * 3 + 2;
        // Kecepatan menyebar ke segala arah
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1.0; // Transparansi memudar
        this.decay = Math.random() * 0.03 + 0.02; // Kecepatan memudar
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// --- 2. PENGELOLA LAYAR BERGETAR (SCREEN SHAKE) ---
class ScreenShaker {
    constructor() {
        this.shakeTimer = 0;
        this.intensity = 0;
    }

    trigger(duration = 15, intensity = 6) {
        this.shakeTimer = duration;
        this.intensity = intensity;
    }

    getOffset() {
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            let offsetX = (Math.random() - 0.5) * this.intensity;
            let offsetY = (Math.random() - 0.5) * this.intensity;
            return { x: offsetX, y: offsetY };
        }
        return { x: 0, y: 0 };
    }
}