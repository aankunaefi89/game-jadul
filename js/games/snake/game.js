// js/games/snake/game.js

class SnakeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // 1. Suntikkan Antarmuka (UI) Game ke dalam layar
        this.container.innerHTML = `
            <div id="touch-zone" style="position:relative; width:330px; height:330px; display:flex; justify-content:center; align-items:center;">
                <canvas id="snakeCanvas" width="330" height="330" style="background:#111; border:2px solid #555; display:block; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 210, 211, 0.2);"></canvas>
                
                <div id="snake-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:none; flex-direction:column; align-items:center; justify-content:center; color:#fff; padding:10px; box-sizing:border-box; border-radius: 8px; z-index: 10;">
                    <h2 style="color:#ff4757; margin:5px 0; font-size:26px;">GAME OVER</h2>
                    <p style="margin:5px 0 15px 0; font-size:16px;">Skor Akhir: <span id="snake-final-score" style="color:#2ed573; font-weight:bold;">0</span></p>
                    
                    <div id="input-score-area" class="input-box-area" style="width: 85%;">
                        <input type="text" id="player-name-input" placeholder="Nama Kamu" maxlength="12">
                        <button onclick="submitScore()">KIRIM SKOR</button>
                    </div>
                    <button onclick="restartSnakeGame()" style="margin-top:10px; padding:10px; font-weight:bold; background:#2ed573; border:none; border-radius:4px; width:85%; cursor:pointer; color:white;">MAIN LAGI ↻</button>
                </div>
            </div>
            
            <div style="color:#fff; width:330px; display:flex; justify-content:space-between; margin-top:10px; font-size:14px; align-items:center; font-weight: bold;">
                <span>❤️ Nyawa: <span id="snk-lives" style="color: #ff4757;">3</span></span>
                <span>⭐ Lvl: <span id="snk-level" style="color: #f1c40f;">1</span></span>
                <span>🎯 Skor: <span id="snk-score" style="color: #00d2d3;">0</span></span>
            </div>

            <div id="powerup-status" style="color: #ffc107; font-weight: bold; height: 20px; margin-top: 5px; text-align: center;"></div>
            <div id="food-timer-bar" style="width: 330px; height: 6px; background: #ffcc00; margin-top: 5px; display: none; transition: width 0.1s linear; border-radius:3px;"></div>

            <div style="color:#aaa; font-size:12px; margin-top:10px; font-style:italic; text-align:center; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 4px;">
                🍎 Merah (+10) | 👑 Emas (+50) | 🌀 Biru (Rem) | 🎁 Box (Power-Up!)
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(3, 65px); grid-template-rows: repeat(3, 48px); gap:10px; margin-top:15px; justify-content:center; width:330px;">
                <div></div><button id="btn-up" style="background:rgba(51,51,51,0.9); color:#fff; border:1px solid #00d2d3; border-radius:8px; font-size:22px; cursor: pointer; touch-action: manipulation;">▲</button><div></div>
                <button id="btn-left" style="background:rgba(51,51,51,0.9); color:#fff; border:1px solid #00d2d3; border-radius:8px; font-size:22px; cursor: pointer; touch-action: manipulation;">◀</button><div></div><button id="btn-right" style="background:rgba(51,51,51,0.9); color:#fff; border:1px solid #00d2d3; border-radius:8px; font-size:22px; cursor: pointer; touch-action: manipulation;">▶</button>
                <div></div><button id="btn-down" style="background:rgba(51,51,51,0.9); color:#fff; border:1px solid #00d2d3; border-radius:8px; font-size:22px; cursor: pointer; touch-action: manipulation;">▼</button><div></div>
            </div>
        `;

        this.canvas = document.getElementById("snakeCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.gridSize = 15;

        // Status Game
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.defaultSpeed = 130;
        this.speed = this.defaultSpeed;
        this.isGameOver = false;

        this.obstacles = [];
        this.portals = [];
        this.particles = [];
        
        this.isDoubleScore = false;
        this.powerUpTimer = null;
        this.gameInterval = null;

        // 2. Hubungkan Modul yang telah kita buat
        this.input = new InputHandler(this);
        this.player = new Snake(this);
        this.food = new Food(this);
    }

    start() {
        this.stop(); // Bersihkan sisa sebelumnya dengan tuntas
        
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.speed = this.defaultSpeed;
        this.isGameOver = false;
        this.particles = [];
        this.isDoubleScore = false;
        this.player.isGhostMode = false;

        document.getElementById("snake-overlay").style.display = "none";
        document.getElementById("powerup-status").innerText = "";

        this.player = new Snake(this); // Reset ular ke tengah
        this.generateLevel(this.level);
        this.updateStats();
        this.food.generate();

        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
    }

    stop() {
        this.isGameOver = true;
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.powerUpTimer) clearTimeout(this.powerUpTimer);
        this.food.clearTimer(); // Hentikan timer makanan
    }

    generateLevel(lvl) {
        this.obstacles = [];
        this.portals = []; 
        let mid = 11 * this.gridSize;

        if (lvl === 3 || lvl === 4) {
            for(let i = -3; i <= 3; i++) {
                this.obstacles.push({ x: mid + (i * this.gridSize), y: mid });
                if(i !== 0) this.obstacles.push({ x: mid, y: mid + (i * this.gridSize) });
            }
        } else if (lvl >= 5) {
            for (let i = 4; i <= 8; i++) {
                this.obstacles.push({ x: i * this.gridSize, y: 5 * this.gridSize });
                this.obstacles.push({ x: 5 * this.gridSize, y: i * this.gridSize });
                this.obstacles.push({ x: (22 - i) * this.gridSize, y: 5 * this.gridSize });
                this.obstacles.push({ x: 17 * this.gridSize, y: i * this.gridSize });
                this.obstacles.push({ x: i * this.gridSize, y: 17 * this.gridSize });
                this.obstacles.push({ x: 5 * this.gridSize, y: (22 - i) * this.gridSize });
                this.obstacles.push({ x: (22 - i) * this.gridSize, y: 17 * this.gridSize });
                this.obstacles.push({ x: 17 * this.gridSize, y: (22 - i) * this.gridSize });
            }
        }

        if (lvl === 4 || lvl === 7) {
            this.portals = [
                { x: 2 * this.gridSize, y: 2 * this.gridSize },
                { x: 19 * this.gridSize, y: 19 * this.gridSize }
            ];
        }
    }

    gameLoop() {
        if (this.isGameOver) return;
        this.player.update();
        if (!this.isGameOver) this.draw();
    }

    handleDeath() {
        if (typeof playHitSound === "function") playHitSound(); 
        this.triggerScreenShake(); 
        this.lives--; 
        this.updateStats();
        this.food.clearTimer();
        
        const timerBar = document.getElementById("food-timer-bar");
        if (timerBar) timerBar.style.display = "none";

        if (this.lives > 0) {
            // Respawn ular
            this.player = new Snake(this);
            this.food.generate(); 
        } else {
            // Mati total
            this.stop();
            if (typeof window.globalScore !== 'undefined') window.globalScore = this.score; 
            
            document.getElementById("snake-final-score").innerText = this.score;
            document.getElementById("input-score-area").style.display = "flex";
            document.getElementById("snake-overlay").style.display = "flex";
        }
    }

    handleEatFood() {
        if (typeof playEatSound === "function") playEatSound(); 
            
        let basePoints = 0;
        let pColor = "#ff2222";

        if (this.food.type === 'gold') {
            basePoints = 50; pColor = "#ffcc00";
        } else if (this.food.type === 'slow') {
            basePoints = 10; pColor = "#00e5ff";
            this.speed = Math.min(this.speed + 25, this.defaultSpeed); 
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
        } else if (this.food.type === 'mystery') {
            basePoints = 20; pColor = "#e11d48";
            let type = Math.random() < 0.5 ? 'ghost' : 'double';
            this.activatePowerUp(type);
        } else {
            basePoints = 10; pColor = "#ff2222";
        }

        this.score += this.isDoubleScore ? (basePoints * 2) : basePoints;
        this.spawnExplosion(this.food.x, this.food.y, pColor);
        
        this.checkLevelUp();
        this.updateStats(); 
        this.food.generate();
    }

    activatePowerUp(type) {
        if (this.powerUpTimer) clearTimeout(this.powerUpTimer);
        this.player.isGhostMode = false;
        this.isDoubleScore = false;

        const statusDiv = document.getElementById("powerup-status");
        
        if (type === 'ghost') {
            this.player.isGhostMode = true;
            statusDiv.innerText = "👻 GHOST MODE ACTIVE (5s)!";
            statusDiv.style.color = "#a855f7";
        } else if (type === 'double') {
            this.isDoubleScore = true;
            statusDiv.innerText = "💰 DOUBLE SCORE ACTIVE (5s)!";
            statusDiv.style.color = "#2ed573";
        }

        this.powerUpTimer = setTimeout(() => {
            this.player.isGhostMode = false;
            this.isDoubleScore = false;
            if(statusDiv) statusDiv.innerText = "";
        }, 5000);
    }

    checkLevelUp() {
        let targetLevel = Math.floor(this.score / 200) + 1;
        if (targetLevel > 10) targetLevel = 10;
        
        if (targetLevel > this.level) {
            this.level = targetLevel; 
            if (this.lives < 5) this.lives += 1;
            
            this.speed = this.speed * 0.90; // Ular makin cepat
            this.generateLevel(this.level); 
            
            clearInterval(this.gameInterval); 
            this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
        }
    }

    updateStats() {
        document.getElementById("snk-lives").innerText = this.lives;
        document.getElementById("snk-level").innerText = this.level;
        document.getElementById("snk-score").innerText = this.score;
    }

    triggerScreenShake() {
        const arena = document.getElementById("touch-zone");
        if(!arena) return;
        let intensity = 8;
        let shakeInterval = setInterval(() => {
            let shakeX = (Math.random() - 0.5) * intensity;
            let shakeY = (Math.random() - 0.5) * intensity;
            arena.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
            intensity *= 0.8; 
            if (intensity < 1) {
                clearInterval(shakeInterval);
                arena.style.transform = "translate(0px, 0px)";
            }
        }, 30);
    }

    spawnExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + this.gridSize / 2, y: y + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
                radius: Math.random() * 3 + 1, alpha: 1, color: color
            });
        }
    }

    draw() {
        // 1. Bersihkan layar
        this.ctx.fillStyle = "#111"; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 2. Gambar Portal Teleportasi
        this.portals.forEach(pt => {
            this.ctx.fillStyle = "#a855f7"; 
            this.ctx.beginPath();
            this.ctx.arc(pt.x + this.gridSize/2, pt.y + this.gridSize/2, this.gridSize/2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 3. Gambar Tembok Rintangan
        this.ctx.fillStyle = "#7f8c8d"; 
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x + 1, obs.y + 1, this.gridSize - 2, this.gridSize - 2);
            this.ctx.strokeStyle = "#bdc3c7";
            this.ctx.strokeRect(obs.x + 1, obs.y + 1, this.gridSize - 2, this.gridSize - 2);
        });

        // 4. Perintahkan Food dan Player untuk menggambar dirinya sendiri
        this.food.draw(this.ctx);
        this.player.draw(this.ctx);

        // 5. Gambar Partikel Ledakan
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.alpha -= 0.04; 
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
}

// Global Wrapper untuk dipanggil dari HTML atau main.js
function loadSnakeGame() {
    if (window.snakeGameInstance) {
        window.snakeGameInstance.stop(); // Hentikan yang lama jika ada
    }
    window.snakeGameInstance = new SnakeGame("canvas-placeholder");
    window.snakeGameInstance.start();
}

function restartSnakeGame() {
    if (window.snakeGameInstance) {
        window.snakeGameInstance.start();
    }
}