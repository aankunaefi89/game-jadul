// js/games/pesawat/game.js

class PesawatGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Hapus isi sebelumnya dan masukkan canvas
        this.container.innerHTML = '<canvas id="pesawatCanvas"></canvas>';
        this.canvas = document.getElementById('pesawatCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = CONFIG.canvasWidth;
        this.canvas.height = CONFIG.canvasHeight;
        this.isRunning = false;
        this.isPaused = false; 

        // --- INISIALISASI INPUT, BACKGROUND & PLAYER YANG BENAR ---
        this.input = new InputHandler(this); 
        this.background = new Background(); 
        this.player = new Player(this);     
        
        this.enemies = [];
        this.enemyTimer = 0;
        this.enemyInterval = 60; 
        
        this.enemyBullets = [];
        this.aiEnemies = [];
        this.aiTimer = 0;
        
        this.bombs = [];
        this.bonuses = [];
        this.weaponBonuses = [];
        this.shields = [];

        // EFEK KHUSUS (Partikel & Screen Shake)
        this.particles = [];
        this.shaker = new ScreenShaker();

        this.score = 0;
        this.level = 1;
        
        this.boss = null;
        this.bossSpawnScore = 500; 
        this.isBossActive = false;
        this.guardTimer = 0; 
        
        this.isTransitioning = false; 
        this.transitionTimer = 0;

        this.levelMessage = "TEKAN 'P' UNTUK PAUSE";
        this.messageTimer = 180; 

        document.addEventListener('keydown', (e) => {
            if ((e.key === 'p' || e.key === 'P') && this.isRunning) {
                this.isPaused = !this.isPaused;
            }
        });
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }
    stop() { this.isRunning = false; }

    // --- GENERATOR EFEK SUARA ARKADE DIGITAL (WEB AUDIO API) ---
    playAudio(type) {
        try {
            window.audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            let ctx = window.audioCtx;
            if (!ctx) return;
            
            let osc = ctx.createOscillator();
            let gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            let now = ctx.currentTime;

            if (type === 'laser') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'explosion') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.linearRampToValueAtTime(30, now + 0.3);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'powerup') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch(e) {}
    }

    spawnExplosion(x, y, color = '#ff9f43', count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 30px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("PAUSED", this.canvas.width/2, this.canvas.height/2);
            this.ctx.textAlign = 'left';
            requestAnimationFrame(() => this.gameLoop());
            return;
        }

        // --- EFEK LAYAR BERGETAR (SCREEN SHAKE) ---
        let shake = this.shaker.getOffset();
        this.ctx.save();
        this.ctx.translate(shake.x, shake.y);

        this.background.update(); 
        this.player.update(this.input);

        // --- UPDATE PELURU MUSUH ---
        for (let k = this.enemyBullets.length - 1; k >= 0; k--) {
            let eb = this.enemyBullets[k];
            if (!eb) continue; 
            eb.update();
            if (
                this.player.x < eb.x + eb.width &&
                this.player.x + this.player.width > eb.x &&
                this.player.y < eb.y + eb.height &&
                this.player.y + this.player.height > eb.y
            ) {
                this.enemyBullets.splice(k, 1);
                this.handlePlayerHit();
                break; 
            } else if (eb.y > this.canvas.height) {
                this.enemyBullets.splice(k, 1);
            }
        }

        // --- MASA TRANSISI NAIK LEVEL ---
        if (this.isTransitioning) {
            this.transitionTimer--;
            if (this.transitionTimer <= 0) {
                this.isTransitioning = false;
            }
        } 
        // --- 1. JIKA BOSS AKTIF ---
        else if (this.isBossActive && this.boss) {
            this.boss.update();
            this.guardTimer++;
            let guardInterval = Math.max(40, 150 - (this.level * 15));
            if (this.guardTimer >= guardInterval) {
                this.enemies.push(new BossGuard(this.level));
                this.guardTimer = 0;
            }

            let fireChance = this.boss.isEnraged ? 0.06 : 0.03;
            if (Math.random() < fireChance + (this.level * 0.005)) {
                this.enemyBullets.push(new EnemyBullet(this.boss.x + 20, this.boss.y + this.boss.height));
                this.enemyBullets.push(new EnemyBullet(this.boss.x + this.boss.width - 20, this.boss.y + this.boss.height));
            }

            for (let j = this.player.bullets.length - 1; j >= 0; j--) {
                let bullet = this.player.bullets[j];
                if (!this.boss) break;

                if (
                    bullet.x < this.boss.x + this.boss.width &&
                    bullet.x + bullet.width > this.boss.x &&
                    bullet.y < this.boss.y + this.boss.height &&
                    bullet.y + bullet.height > this.boss.y
                ) {
                    this.player.bullets.splice(j, 1);
                    this.boss.health -= this.player.weaponLevel; 
                    this.playAudio('laser');

                    if (this.boss.health <= 0) {
                        this.spawnExplosion(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, '#ff4757', 40);
                        this.playAudio('explosion');
                        this.shaker.trigger(30, 10); 

                        this.score += 200; 
                        this.isBossActive = false;
                        this.boss = null;
                        this.level++;     
                        
                        this.isTransitioning = true;
                        this.transitionTimer = 180;
                        this.levelMessage = `LEVEL ${this.level} START!`;
                        this.messageTimer = 180; 
                    }
                }
            }

            if (
                this.boss && 
                this.player.x < this.boss.x + this.boss.width &&
                this.player.x + this.player.width > this.boss.x &&
                this.player.y < this.boss.y + this.boss.height &&
                this.player.y + this.player.height > this.boss.y
            ) {
                this.handlePlayerHit();
            }

        } else {
            // --- 2. MODE MUSUH BIASA & FORMASI GELOMBANG ---
            if (this.score >= this.level * this.bossSpawnScore && !this.isBossActive) {
                this.isBossActive = true;
                this.boss = new Boss(this.level);
                this.enemies = []; 
                this.guardTimer = 0;
            }

            let currentInterval = Math.max(20, this.enemyInterval - (this.level * 8));
            this.enemyTimer++;
            if (this.enemyTimer >= currentInterval) {
                if (Math.random() < 0.25) {
                    let startX = Math.random() * (CONFIG.canvasWidth - 200) + 50;
                    for (let f = 0; f < 4; f++) {
                        let formEnemy = new Enemy();
                        formEnemy.x = startX + (f * 35);
                        formEnemy.y = -60 - (f * 20); 
                        this.enemies.push(formEnemy);
                    }
                } else {
                    let newEnemy = new Enemy();
                    newEnemy.speed += (this.level * 0.5); 
                    this.enemies.push(newEnemy);
                }
                this.enemyTimer = 0;
            }
        }

        // --- 3. MUNCULKAN PESAWAT AI BONUS ---
        if (!this.isTransitioning) {
            this.aiTimer++;
            if (this.aiTimer >= 300 - (this.level * 10)) { 
                let rand = Math.random();
                let bonusType = 'bomb'; 
                if (rand < 0.25) bonusType = 'shield'; 
                else if (rand < 0.5) bonusType = 'weapon';
                else if (rand < 0.75) bonusType = 'life';
                
                this.aiEnemies.push(new AIFighter(bonusType));
                this.aiTimer = 0;
            }
        }

        // UPDATE SEMUA MUSUH
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            enemy.update();

            if (Math.random() < 0.003 + (this.level * 0.001)) { 
                this.enemyBullets.push(new EnemyBullet(enemy.x + (enemy.width/2), enemy.y + enemy.height));
            }

            if (
                this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y
            ) {
                this.handlePlayerHit();
                this.spawnExplosion(enemy.x, enemy.y, '#ff3333', 10);
                this.enemies.splice(i, 1);
                continue;
            }

            for (let j = this.player.bullets.length - 1; j >= 0; j--) {
                let bullet = this.player.bullets[j];
                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    this.player.bullets.splice(j, 1); 
                    this.playAudio('laser');

                    if (enemy.health !== undefined) {
                        enemy.health -= this.player.weaponLevel;
                        if (enemy.health <= 0) {
                            this.spawnExplosion(enemy.x, enemy.y, '#7f8fa6', 15);
                            this.playAudio('explosion');
                            this.enemies.splice(i, 1);
                            this.score += 20;
                        }
                    } else {
                        this.spawnExplosion(enemy.x, enemy.y, '#ff3333', 10);
                        this.playAudio('explosion');
                        this.enemies.splice(i, 1);       
                        this.score += 10;          
                    }
                    globalScore = this.score;  
                    break; 
                }
            }
            if (this.enemies[i] && this.enemies[i].y > this.canvas.height) this.enemies.splice(i, 1);
        }

        // UPDATE PESAWAT AI
        for (let i = this.aiEnemies.length - 1; i >= 0; i--) {
            let ai = this.aiEnemies[i];
            if (!ai) continue;
            ai.update(this.player.x);

            if (Math.random() < 0.01 + (this.level * 0.002)) { 
                this.enemyBullets.push(new EnemyBullet(ai.x + (ai.width/2), ai.y + ai.height));
            }

            for (let j = this.player.bullets.length - 1; j >= 0; j--) {
                let bullet = this.player.bullets[j];
                if (
                    bullet.x < ai.x + ai.width &&
                    bullet.x + bullet.width > ai.x &&
                    bullet.y < ai.y + ai.height &&
                    bullet.y + bullet.height > ai.y
                ) {
                    this.player.bullets.splice(j, 1); 
                    ai.health -= this.player.weaponLevel; 
                    this.playAudio('laser');

                    if (ai.health <= 0) {
                        this.spawnExplosion(ai.x, ai.y, '#e056fd', 20);
                        this.playAudio('explosion');

                        if (ai.type === 'bomb') this.bombs.push(new BombBonus(ai.x, ai.y));
                        else if (ai.type === 'shield') this.shields.push(new ShieldBonus(ai.x, ai.y));
                        else if (ai.type === 'weapon') this.weaponBonuses.push(new WeaponBonus(ai.x, ai.y));
                        else if (ai.type === 'life') this.bonuses.push(new BonusLife(ai.x, ai.y));
                        
                        this.score += 30; 
                        this.aiEnemies.splice(i, 1);
                        break; 
                    }
                }
            }
        }

        // --- CEK PEMAIN AMBIL BONUS ---
        this.checkBonusCollision(this.bonuses, () => { 
            if (this.player.lives < CONFIG.maxLives) this.player.lives++;
            this.playAudio('powerup');
        });
        this.checkBonusCollision(this.weaponBonuses, () => { 
            if (this.player.weaponLevel < this.player.maxWeaponLevel) this.player.weaponLevel++;
            this.playAudio('powerup');
        });
        this.checkBonusCollision(this.shields, () => { 
            this.player.shield = true; 
            this.playAudio('powerup');
        }); 
        
        this.checkBonusCollision(this.bombs, () => {
            this.player.spreadLevel = this.player.maxSpreadLevel;
            this.score += (this.enemies.length * 10);
            this.enemies = []; 
            this.enemyBullets = []; 
            this.shaker.trigger(20, 8); 
            this.playAudio('explosion');
            this.levelMessage = "💥 MAX SPREAD & ENEMY CLEAR! 💥";
            this.messageTimer = 60; 
        });

        // UPDATE PARTIKEL LEDAKAN
        for (let p = this.particles.length - 1; p >= 0; p--) {
            let part = this.particles[p];
            part.update();
            if (part.alpha <= 0) this.particles.splice(p, 1);
        }

        // --- 4. RENDER GRAFIS ---
        this.background.draw(this.ctx);
        this.player.draw(this.ctx);
        
        for (let eb of this.enemyBullets) eb.draw(this.ctx);
        for (let enemy of this.enemies) enemy.draw(this.ctx);
        for (let ai of this.aiEnemies) ai.draw(this.ctx);
        for (let bonus of this.bonuses) bonus.draw(this.ctx);
        for (let wBonus of this.weaponBonuses) wBonus.draw(this.ctx);
        for (let shield of this.shields) shield.draw(this.ctx); 
        for (let bomb of this.bombs) bomb.draw(this.ctx); 
        for (let part of this.particles) part.draw(this.ctx); 

        if (this.isBossActive && this.boss) {
            this.boss.draw(this.ctx);
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(CONFIG.canvasWidth/2 - 100, 60, 200, 10);
            let healthRatio = Math.max(0, this.boss.health / this.boss.maxHealth);
            this.ctx.fillStyle = this.boss.isEnraged ? '#e74c3c' : '#2ecc71';
            this.ctx.fillRect(CONFIG.canvasWidth/2 - 100, 60, 200 * healthRatio, 10);
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(CONFIG.canvasWidth/2 - 100, 60, 200, 10);
        }

        // --- 5. TAMPILKAN UI ---
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.fillText(`SCORE: ${this.score}`, 15, 25);
        this.ctx.fillText(`LEVEL: ${this.level}`, 15, 45);
        this.ctx.fillText(`LIVES: ❤️ ${this.player.lives}/${CONFIG.maxLives}`, CONFIG.canvasWidth - 115, 25);

        if (this.messageTimer > 0) {
            this.messageTimer--;
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.levelMessage, this.canvas.width / 2, 120);
            this.ctx.textAlign = 'left'; 
        }

        this.ctx.restore(); 
        requestAnimationFrame(() => this.gameLoop());
    }
    
    checkBonusCollision(bonusArray, action) {
        for (let b = bonusArray.length - 1; b >= 0; b--) {
            let bonus = bonusArray[b];
            bonus.update();
            if (
                this.player.x < bonus.x + bonus.width &&
                this.player.x + this.player.width > bonus.x &&
                this.player.y < bonus.y + bonus.height &&
                this.player.y + this.player.height > bonus.y
            ) {
                action();
                bonusArray.splice(b, 1);
            } 
        }
    }

    handlePlayerHit() {
        if (this.player.shield) {
            this.player.shield = false; 
            this.spawnExplosion(this.player.x, this.player.y, '#0984e3', 15);
            return;
        }

        this.shaker.trigger(20, 8); 
        this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff4757', 25);
        this.playAudio('explosion');

        this.player.lives--;
        this.player.weaponLevel = 1; 
        this.player.spreadLevel = 1; 

        if (this.player.lives <= 0) {
            this.gameOver();
        } else {
            this.player.x = CONFIG.canvasWidth / 2 - this.player.width / 2;
            this.player.y = CONFIG.canvasHeight - 60;
            this.enemies = [];
            this.aiEnemies = [];
            this.enemyBullets = []; 
        }
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ff3333';
        this.ctx.font = 'bold 32px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px sans-serif';
        this.ctx.fillText(`Skor Akhir: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 20);

        let inputArea = document.getElementById("input-score-area");
        if (!inputArea) {
            inputArea = document.createElement("div");
            inputArea.id = "input-score-area";
            inputArea.className = "input-box-area";
            inputArea.innerHTML = `
                <div id="score-form-wrapper">
                    <input type="text" id="player-name-input" placeholder="Masukkan Nama Anda" maxlength="15">
                    <button onclick="submitScore()">Simpan Skor</button>
                </div>
                <button onclick="restartGame()" style="background-color: #2ecc71; margin-top: 10px; width: 100%; padding: 8px; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Main Lagi 🔄</button>
            `;
            this.container.appendChild(inputArea);
        } else {
            inputArea.style.display = "flex";
            if (!inputArea.innerHTML.includes("Main Lagi")) {
                inputArea.innerHTML += `<button onclick="restartGame()" style="background-color: #2ecc71; margin-top: 10px; width: 100%; padding: 8px; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Main Lagi 🔄</button>`;
            }
        }
    }
}

// --- FUNGSI RESTART GAME (GLOBAL) ---
function restartGame() {
    let inputArea = document.getElementById("input-score-area");
    if (inputArea) {
        inputArea.style.display = "none";
    }
    
    if (window.pesawatGameInstance) {
        window.pesawatGameInstance.stop();
    }
    // PERBAIKAN: Gunakan 'canvas-placeholder' bukan 'pesawat-container-id'
    window.pesawatGameInstance = new PesawatGame('canvas-placeholder'); 
    window.pesawatGameInstance.start();
}