// js/games/snake/food.js

class Food {
    constructor(game) {
        this.game = game;
        this.gridSize = game.gridSize;
        this.x = 0;
        this.y = 0;
        this.type = 'normal';
        this.timer = null;
        this.timeLeft = 0;
    }

    generate() {
        this.clearTimer();
        const timerBar = document.getElementById("food-timer-bar");
        if (timerBar) timerBar.style.display = "none";

        let validPosition = false;
        
        // Cari posisi acak yang TIDAK menabrak ular, rintangan, atau portal
        while (!validPosition) {
            this.x = Math.floor(Math.random() * (this.game.canvas.width / this.gridSize)) * this.gridSize;
            this.y = Math.floor(Math.random() * (this.game.canvas.height / this.gridSize)) * this.gridSize;
            
            let onSnake = this.game.player.segments.some(part => part.x === this.x && part.y === this.y);
            let onObstacle = this.game.obstacles.some(obs => obs.x === this.x && obs.y === this.y);
            let onPortal = this.game.portals.some(pt => pt.x === this.x && pt.y === this.y);

            if (!onSnake && !onObstacle && !onPortal) {
                validPosition = true;
            }
        }

        // Tentukan jenis makanan secara acak (gacha)
        let rand = Math.random();
        if (rand < 0.10) {
            this.type = 'mystery';
            this.startCountdown();
        } else if (rand < 0.22) { 
            this.type = 'gold'; 
            this.startCountdown();
        } else if (rand < 0.35) { 
            this.type = 'slow'; 
        } else {
            this.type = 'normal'; 
        }
    }

    startCountdown() {
        this.timeLeft = 60; 
        const timerBar = document.getElementById("food-timer-bar");
        if (!timerBar) return;

        timerBar.style.display = "block";
        timerBar.style.width = "330px";
        timerBar.style.background = (this.type === 'mystery') ? "#e11d48" : "#ffcc00";

        this.timer = setInterval(() => {
            if (this.game.isGameOver) { this.clearTimer(); return; }
            
            this.timeLeft--;
            timerBar.style.width = `${(this.timeLeft / 60) * 330}px`;

            if (this.timeLeft <= 0) {
                this.clearTimer();
                this.generate(); // Ganti letak makanan kalau waktunya keburu habis
            }
        }, 100);
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    draw(ctx) {
        if (this.type === 'gold') {
            ctx.fillStyle = "#ffcc00"; 
        } else if (this.type === 'slow') {
            ctx.fillStyle = "#00e5ff"; 
        } else if (this.type === 'mystery') {
            // Efek kelap-kelip untuk kotak misteri
            ctx.fillStyle = (Math.floor(Date.now() / 150) % 2 === 0) ? "#e11d48" : "#f43f5e";
        } else {
            ctx.fillStyle = "#ff4757"; 
        }
        
        if (this.type === 'mystery') {
            // Makanan misteri berbentuk kotak
            ctx.fillRect(this.x + 1, this.y + 1, this.gridSize - 2, this.gridSize - 2);
        } else {
            // Makanan normal berbentuk bulat (apel)
            ctx.beginPath(); 
            ctx.arc(this.x + this.gridSize/2, this.y + this.gridSize/2, this.gridSize/2 - 1, 0, Math.PI * 2); 
            ctx.fill();
        }
    }
}