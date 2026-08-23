// js/games/pesawat/player.js

class Player {
    // 1. Parameter 'game' ditambahkan di sini
    constructor(game) {
        this.game = game;
        this.width = 36;
        this.height = 36;
        this.x = (CONFIG.canvasWidth / 2) - (this.width / 2);
        this.y = CONFIG.canvasHeight - 60;
        this.speed = CONFIG.playerSpeed;
        this.lives = CONFIG.startingLives; 
        
        this.weaponLevel = 1; 
        this.maxWeaponLevel = 3;
        this.spreadLevel = 1; 
        this.maxSpreadLevel = 5;
        
        this.shield = false; 

        this.bullets = [];      
        this.fireCooldown = 0;  
        this.fireRate = 12;     
    }

    update(input, deltaTime) {
        // Kurangi jeda tembakan
        if (this.fireCooldown > 0) this.fireCooldown--;

        // Update posisi semua peluru yang ditembakkan
        for (let bullet of this.bullets) {
            if (typeof bullet.update === 'function') bullet.update();
        }
        // Hapus peluru yang sudah keluar batas atas layar
        this.bullets = this.bullets.filter(b => b.y > -20);

        const activeInput = input || (this.game && this.game.input);
        if (!activeInput) return;

        const isTouching = activeInput.isTouching || false;
        const touchX = activeInput.touchX || 0;
        const touchY = activeInput.touchY || 0;
        const keys = activeInput.keys || [];

        // --- KONTROL SENTUH (HP) ---
        if (isTouching) {
            let centerX = this.x + (this.width / 2);
            let centerY = this.y + (this.height / 2);
            
            let dx = touchX - centerX;
            let dy = touchY - centerY;
            
            this.x += dx * 0.2;
            this.y += dy * 0.2;

            // Otomatis menembak saat disentuh
            this.shoot();
        } 
        // --- KONTROL KEYBOARD (PC) ---
        else {
            if (keys.includes('ArrowRight')) this.x += this.speed;
            else if (keys.includes('ArrowLeft')) this.x -= this.speed;
            
            if (keys.includes('ArrowUp')) this.y -= this.speed;
            else if (keys.includes('ArrowDown')) this.y += this.speed;

            if (keys.includes(' ')) this.shoot();
        }

        // 2. Menggunakan CONFIG agar tidak error
        if (this.x < 0) this.x = 0;
        if (this.x > CONFIG.canvasWidth - this.width) this.x = CONFIG.canvasWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > CONFIG.canvasHeight - this.height) this.y = CONFIG.canvasHeight - this.height;
    }

    // 3. Fungsi menembak ditambahkan di sini
    shoot() {
        if (this.fireCooldown <= 0) {
            this.bullets.push({
                x: this.x + (this.width / 2) - 2,
                y: this.y,
                width: 4,
                height: 15,
                speed: 12,
                update: function() { this.y -= this.speed; },
                draw: function(ctx) { 
                    ctx.fillStyle = '#f1c40f'; 
                    ctx.fillRect(this.x, this.y, this.width, this.height); 
                }
            });
            
            this.fireCooldown = this.fireRate;
            
            if (this.game && typeof this.game.playAudio === 'function') {
                this.game.playAudio('laser');
            }
        }
    }

    draw(ctx) {
        // Gambar peluru
        for (let bullet of this.bullets) {
            if (typeof bullet.draw === 'function') bullet.draw(ctx);
        }
        
        // Gambar gelembung perisai
        if (this.shield) {
            ctx.strokeStyle = 'rgba(9, 132, 227, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x + (this.width/2), this.y + (this.height/2), 28, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Gambar body pesawat
        ctx.fillStyle = '#00d2d3'; 
        ctx.fillRect(this.x + 14, this.y + 5, 8, 26); 
        ctx.fillRect(this.x + 16, this.y, 4, 8);      
        ctx.fillRect(this.x, this.y + 16, 36, 6);     
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 16, this.y + 10, 4, 6); 
    }

    checkCollision(enemies) {
        for (let enemy of enemies) {
            if (
                this.x < enemy.x + enemy.width &&
                this.x + this.width > enemy.x &&
                this.y < enemy.y + enemy.height &&
                this.y + this.height > enemy.y
            ) return true; 
        }
        return false;
    }
}