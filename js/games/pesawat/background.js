// js/games/pesawat/background.js

class Background {
    constructor() {
        this.stars = [];
        for(let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.canvasWidth,
                y: Math.random() * CONFIG.canvasHeight,
                size: Math.random() * 2,
                speed: Math.random() * 1.5
            });
        }
        // Properti Planet
        this.planetY = -150;
        this.planetX = Math.random() * (CONFIG.canvasWidth - 100) + 50;
        this.planetRadius = 60;
    }

    update() {
        for(let star of this.stars) {
            star.y += star.speed;
            if(star.y > CONFIG.canvasHeight) star.y = 0;
        }
        // Gerakkan planet sangat perlahan ke bawah
        this.planetY += 0.2; 
        if(this.planetY > CONFIG.canvasHeight + 200) {
            this.planetY = -200;
            this.planetX = Math.random() * (CONFIG.canvasWidth - 100) + 50;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#0a0a23';
        ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

        // Gambar Planet
        ctx.fillStyle = '#34495e'; // Warna dasar planet
        ctx.beginPath();
        ctx.arc(this.planetX, this.planetY, this.planetRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Cincin atmosfer planet
        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.beginPath();
        ctx.arc(this.planetX - 5, this.planetY - 5, this.planetRadius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        for(let star of this.stars) {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
    }
}