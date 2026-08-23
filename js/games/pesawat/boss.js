// js/games/pesawat/boss.js

class Boss {
    constructor(level) {
        this.level = level;
        this.type = (level - 1) % 3; // 0 = Kapal Induk, 1 = UFO, 2 = Naga Angkasa
        
        this.width = 140;
        this.height = 90;
        this.x = (CONFIG.canvasWidth / 2) - (this.width / 2);
        this.y = -this.height - 20;
        
        this.speed = 1.5 + (level * 0.3);
        this.direction = 1; // 1 ke kanan, -1 ke kiri

        // Nyawa Boss
        this.maxHealth = 50 + (level * 30);
        this.health = this.maxHealth;
        this.isEnraged = false; // Mode Ngamuk
    }

    update() {
        if (this.y < 40) {
            this.y += 2; // Animasi perlahan masuk arena
        } else {
            this.x += this.speed * this.direction;
            if (this.x <= 0 || this.x + this.width >= CONFIG.canvasWidth) {
                this.direction *= -1; // Memantul di pinggir
            }
        }

        // FASE NGAMUK: Jika nyawa sisa 30%, Boss jadi lebih cepat!
        if (!this.isEnraged && this.health < this.maxHealth * 0.3) {
            this.isEnraged = true;
            this.speed += 1.5;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Efek Kedip Merah saat Ngamuk
        let baseColor = '#2c3e50'; 
        if (this.isEnraged && Math.floor(Date.now() / 150) % 2 === 0) {
            baseColor = '#e74c3c'; // Merah menyala
        }

        if (this.type === 0) {
            // --- TIPE 0: KAPAL INDUK ---
            ctx.fillStyle = baseColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 40);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(this.x + 40, this.y + this.height - 10, 10, 10);
            ctx.fillRect(this.x + this.width - 50, this.y + this.height - 10, 10, 10);

        } else if (this.type === 1) {
            // --- TIPE 1: UFO ALIEN ---
            ctx.fillStyle = baseColor === '#e74c3c' ? baseColor : '#8e44ad'; // Ungu
            ctx.beginPath();
            ctx.ellipse(this.x + (this.width/2), this.y + (this.height/2) + 10, this.width/2, this.height/3, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Kaca Kubah UFO
            ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x + (this.width/2), this.y + (this.height/2) - 10, this.width/4, 0, Math.PI*2);
            ctx.fill();

        } else {
            // --- TIPE 2: NAGA ANGKASA (Segmen Bergerak) ---
            ctx.fillStyle = baseColor === '#e74c3c' ? baseColor : '#27ae60'; // Hijau
            let wave = Math.sin(Date.now() / 200) * 15;
            
            for(let i=0; i<4; i++) {
                ctx.beginPath();
                ctx.arc(this.x + (this.width/2) + (i%2===0? wave : -wave), this.y + (i*22), 35 - (i*5), 0, Math.PI*2);
                ctx.fill();
            }
            // Mata Naga
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + (this.width/2) - 15 + wave, this.y - 10, 8, 8);
            ctx.fillRect(this.x + (this.width/2) + 5 + wave, this.y - 10, 8, 8);
        }
        
        ctx.restore();
    }
}