// js/games/pesawat/bullet.js

class Bullet {
    constructor(x, y, level = 1, dx = 0) {
        this.level = level;
        this.width = level === 1 ? 4 : (level === 2 ? 8 : 12);
        this.height = level === 1 ? 10 : (level === 2 ? 15 : 20);
        
        this.x = x - (this.width / 2);
        this.y = y;
        this.speed = 7 + (level * 1.5); 
        this.dx = dx; // BARU: Kecepatan horizontal untuk efek menyebar
        
        this.color = level === 1 ? '#ff9f43' : (level === 2 ? '#f1c40f' : '#e1b12c');
    }

    update() {
        this.y -= this.speed;
        this.x += this.dx; // Peluru bergerak miring jika ada dx
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class EnemyBullet {
    constructor(x, y) {
        this.width = 6;
        this.height = 12;
        this.x = x - (this.width / 2);
        this.y = y;
        this.speed = 5; 
        this.color = '#ff4757'; 
    }

    update() {
        this.y += this.speed; 
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}