// js/games/pesawat/enemy.js

class Enemy {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (CONFIG.canvasWidth - this.width);
        this.y = -this.height; 
        this.speed = CONFIG.enemySpeed || 2; 
        this.color = '#ff3333'; 
    }
    update() { this.y += this.speed; }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 10, this.y, 10, 30);
        ctx.beginPath(); ctx.moveTo(this.x + 10, this.y + 10); ctx.lineTo(this.x, this.y + 18); ctx.lineTo(this.x + 10, this.y + 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.x + 20, this.y + 10); ctx.lineTo(this.x + 30, this.y + 18); ctx.lineTo(this.x + 20, this.y + 25); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(this.x + 12, this.y + 16, 6, 8);
    }
}

// --- PESAWAT AI PEMBAWA BONUS ---
class AIFighter {
    constructor(type) {
        this.type = type; // 'bomb', 'weapon', atau 'life'
        this.width = 32;
        this.height = 32;
        this.x = Math.random() * (CONFIG.canvasWidth - this.width);
        this.y = -this.height;
        this.speed = 2;
        this.health = 3; 
        
        // Warna membedakan isi bonusnya
        if (this.type === 'bomb') this.color = '#e056fd';      // Ungu = Bom
        else if (this.type === 'weapon') this.color = '#f1c40f'; // Emas = Senjata Besar
        else if (this.type === 'life') this.color = '#2ecc71';   // Hijau = Nyawa
    }
    update(playerX) {
        if (this.x < playerX) this.x += 1.0; else this.x -= 1.0;
        this.y += this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = this.color; ctx.fillRect(this.x + 8, this.y, 16, 28);
        ctx.beginPath(); ctx.moveTo(this.x + 8, this.y + 8); ctx.lineTo(this.x - 4, this.y + 24); ctx.lineTo(this.x + 8, this.y + 20); ctx.fill();
        ctx.beginPath(); ctx.moveTo(this.x + 24, this.y + 8); ctx.lineTo(this.x + 36, this.y + 24); ctx.lineTo(this.x + 24, this.y + 20); ctx.fill();
        ctx.fillStyle = '#00ffff'; ctx.fillRect(this.x + 12, this.y + 14, 8, 6);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(this.x + 10, this.y - 4, 4, 4); ctx.fillRect(this.x + 18, this.y - 4, 4, 4);
    }
}

// --- PENGAWAL BOSS (BERGERAK BEBAS, MEMANTUL DI DINDING, NYAWA TEBAL) ---
class BossGuard {
    constructor(level) {
        this.width = 24;
        this.height = 24;
        this.x = Math.random() * (CONFIG.canvasWidth - this.width);
        this.y = -this.height;
        
        // Gerak Zig-zag
        this.speedX = (Math.random() > 0.5 ? 1 : -1) * (1.5 + (level * 0.2)); 
        this.speedY = 1.5 + (level * 0.2);
        
        this.health = 5 + level; // Butuh banyak tembakan!
        this.color = '#7f8fa6'; // Warna Abu-abu Baja
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Jika menabrak dinding layar, memantul!
        if (this.x <= 0 || this.x + this.width >= CONFIG.canvasWidth) {
            this.speedX *= -1; 
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.moveTo(this.x + 12, this.y); ctx.lineTo(this.x, this.y + 24); ctx.lineTo(this.x + 24, this.y + 24); ctx.fill();
        ctx.fillStyle = '#e74c3c'; // Mata merah
        ctx.fillRect(this.x + 8, this.y + 12, 8, 4);
    }
}