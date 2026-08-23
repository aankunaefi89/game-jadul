// js/games/pesawat/bonus.js

class BonusLife {
    constructor(x, y) {
        this.width = 25; this.height = 25; this.x = x; this.y = y;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
        this.dy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
    }
    update() { 
        this.x += this.dx; 
        this.y += this.dy; 
        
        // Pantulan dengan pengaman dorongan agar tidak nyangkut di dinding
        if (this.x <= 0) { this.x = 1; this.dx *= -1; }
        else if (this.x + this.width >= CONFIG.canvasWidth) { this.x = CONFIG.canvasWidth - this.width - 1; this.dx *= -1; }
        
        if (this.y <= 0) { this.y = 5; this.dy = Math.abs(this.dy) + 0.5; } // Dorong ke bawah
        else if (this.y + this.height >= CONFIG.canvasHeight) { this.y = CONFIG.canvasHeight - this.height - 5; this.dy = -Math.abs(this.dy) - 0.5; } // Dorong ke atas
    }
    draw(ctx) {
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('+', this.x + (this.width / 2), this.y + 18);
    }
}

class WeaponBonus {
    constructor(x, y) {
        this.width = 25; this.height = 25; this.x = x; this.y = y;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
        this.dy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
    }
    update() { 
        this.x += this.dx; 
        this.y += this.dy; 
        
        if (this.x <= 0) { this.x = 1; this.dx *= -1; }
        else if (this.x + this.width >= CONFIG.canvasWidth) { this.x = CONFIG.canvasWidth - this.width - 1; this.dx *= -1; }
        
        if (this.y <= 0) { this.y = 5; this.dy = Math.abs(this.dy) + 0.5; }
        else if (this.y + this.height >= CONFIG.canvasHeight) { this.y = CONFIG.canvasHeight - this.height - 5; this.dy = -Math.abs(this.dy) - 0.5; }
    }
    draw(ctx) {
        ctx.fillStyle = '#f1c40f'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#000000'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('W', this.x + (this.width / 2), this.y + 18);
    }
}

class BombBonus {
    constructor(x, y) {
        this.width = 25; this.height = 25; this.x = x; this.y = y;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
        this.dy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
    }
    update() { 
        this.x += this.dx; 
        this.y += this.dy; 
        
        if (this.x <= 0) { this.x = 1; this.dx *= -1; }
        else if (this.x + this.width >= CONFIG.canvasWidth) { this.x = CONFIG.canvasWidth - this.width - 1; this.dx *= -1; }
        
        if (this.y <= 0) { this.y = 5; this.dy = Math.abs(this.dy) + 0.5; }
        else if (this.y + this.height >= CONFIG.canvasHeight) { this.y = CONFIG.canvasHeight - this.height - 5; this.dy = -Math.abs(this.dy) - 0.5; }
    }
    draw(ctx) {
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('B', this.x + (this.width / 2), this.y + 18);
    }
}

class ShieldBonus {
    constructor(x, y) {
        this.width = 25; this.height = 25; this.x = x; this.y = y;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
        this.dy = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random());
    }
    update() { 
        this.x += this.dx; 
        this.y += this.dy; 
        
        if (this.x <= 0) { this.x = 1; this.dx *= -1; }
        else if (this.x + this.width >= CONFIG.canvasWidth) { this.x = CONFIG.canvasWidth - this.width - 1; this.dx *= -1; }
        
        if (this.y <= 0) { this.y = 5; this.dy = Math.abs(this.dy) + 0.5; }
        else if (this.y + this.height >= CONFIG.canvasHeight) { this.y = CONFIG.canvasHeight - this.height - 5; this.dy = -Math.abs(this.dy) - 0.5; }
    }
    draw(ctx) {
        ctx.fillStyle = '#0984e3'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('S', this.x + (this.width / 2), this.y + 18);
    }
}