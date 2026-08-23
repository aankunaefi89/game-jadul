// =======================================================
// TETRIS GAME ENGINE (WITH JUICE & MOBILE CONTROLS)
// =======================================================

class TetrisGameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.nextCanvas = null;
        this.nextCtx = null;
        
        this.board = null;
        this.currentPiece = null;
        this.gameLoopInterval = null;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000; 
        this.isGameOver = false;
        
        this.nextPieceId = null; 
        this.combo = 0; // Sistem Combo
        this.particles = []; // Array Partikel Ledakan
        this.floatingTexts = []; // Array Teks Animasi

        this.keydownHandler = null;
    }

    cleanup() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        if (this.keydownHandler) {
            window.removeEventListener("keydown", this.keydownHandler);
            this.keydownHandler = null;
        }
    }

    init() {
        this.cleanup();

        const placeholder = document.getElementById("canvas-placeholder");
        if (placeholder) {
            placeholder.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 100%;">
                    
                    <!-- Skor Header -->
                    <div style="margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #fff; text-align: center;">
                        Skor: <span id="tetris-score">0</span> | Baris: <span id="tetris-lines">0</span> | Level: <span id="tetris-level">1</span>
                    </div>
                    
                    <!-- Area Canvas Utama & Next Piece (Berjajar ke Samping) -->
                    <div style="display: flex; flex-direction: row; gap: 15px; align-items: flex-start; justify-content: center; flex-wrap: wrap;">
                        
                        <!-- Canvas Utama -->
                        <div style="position: relative;">
                            <canvas id="tetrisCanvas" width="220" height="440" style="background: #000; border: 2px solid #00d2d3; border-radius: 4px; box-shadow: 0 0 15px rgba(0,210,211,0.3);"></canvas>
                            
                            <!-- Overlay Game Over -->
                            <div id="tetris-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); flex-direction: column; justify-content: center; align-items: center; border-radius: 4px; z-index: 10;">
                                <h3 style="color: #ff4757; margin-bottom: 5px;">GAME OVER</h3>
                                <p style="margin: 5px 0 10px 0; font-size: 14px; color: white;">Skor Akhir: <span id="tetris-final-score">0</span></p>
                                <div id="score-form-wrapper" style="margin-bottom: 10px; text-align: center;">
                                    <input type="text" id="player-name-input" placeholder="Nama Anda" maxlength="15" style="padding: 5px; border-radius: 4px; border: 1px solid #555; text-align: center; margin-bottom: 5px;"><br>
                                    <button onclick="submitScore()" style="padding: 5px 10px; background: #ffc107; border: none; font-weight: bold; border-radius: 4px; cursor: pointer;">Simpan Skor</button>
                                </div>
                                <button onclick="initTetris()" style="padding: 6px 12px; background: #2ed573; border: none; color: white; font-weight: bold; border-radius: 4px; cursor: pointer;">Main Lagi</button>
                            </div>
                        </div>

                        <!-- Canvas Next Piece -->
                        <div style="background: rgba(0, 0, 0, 0.6); border: 2px solid #0b5394; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center;">
                            <h4 style="margin: 0 0 10px 0; color: #fff; font-size: 14px;">NEXT</h4>
                            <canvas id="nextCanvas" width="80" height="80" style="background: #111; border-radius: 4px;"></canvas>
                        </div>
                    </div>

                    <!-- Kontrol Sentuh (Berjajar Rapi di Bawah) -->
                    <div id="tetris-controls" style="display: flex; justify-content: center; gap: 8px; margin-top: 20px; width: 100%; max-width: 350px; flex-wrap: wrap;">
                        <button id="btn-t-left" style="flex: 1; min-width: 50px; padding: 15px 0; background: rgba(51,51,51,0.9); border: 2px solid #00d2d3; color: white; border-radius: 8px; font-size: 20px; cursor: pointer; touch-action: manipulation;">⬅️</button>
                        <button id="btn-t-down" style="flex: 1; min-width: 50px; padding: 15px 0; background: rgba(51,51,51,0.9); border: 2px solid #00d2d3; color: white; border-radius: 8px; font-size: 20px; cursor: pointer; touch-action: manipulation;">⬇️</button>
                        <button id="btn-t-right" style="flex: 1; min-width: 50px; padding: 15px 0; background: rgba(51,51,51,0.9); border: 2px solid #00d2d3; color: white; border-radius: 8px; font-size: 20px; cursor: pointer; touch-action: manipulation;">➡️</button>
                        <button id="btn-t-rotate" style="flex: 1.5; min-width: 70px; padding: 15px 5px; background: #ffc107; border: 2px solid #e0a800; color: black; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; touch-action: manipulation;">🔄 Putar</button>
                        <button id="btn-t-drop" style="flex: 1.5; min-width: 70px; padding: 15px 5px; background: #ff4757; border: 2px solid #ff6b81; color: white; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; touch-action: manipulation;">⏬ Drop</button>
                    </div>
                </div>
            `;
        }

        this.canvas = document.getElementById("tetrisCanvas");
        this.nextCanvas = document.getElementById("nextCanvas");
        
        if (!this.canvas || !this.nextCanvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.nextCtx = this.nextCanvas.getContext("2d");

        this.board = new TetrisBoard(this.ctx, TETRIS_CONFIG.cols, TETRIS_CONFIG.rows, TETRIS_CONFIG.blockSize);
        this.currentPiece = new TetrisPiece(this.ctx, TETRIS_CONFIG.blockSize);

        this.resetGameData();
        this.setupKeyboardInput();
        this.setupTouchControls(); 
        this.startLoop();
    }

    resetGameData() {
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = 0;
        this.dropInterval = 1000;
        this.isGameOver = false;
        this.particles = [];
        this.floatingTexts = [];
        this.board.reset();

        let firstPieceId = Math.floor(Math.random() * (TETRIS_CONFIG.shapes.length - 1)) + 1;
        this.nextPieceId = Math.floor(Math.random() * (TETRIS_CONFIG.shapes.length - 1)) + 1;
        
        this.currentPiece.spawnPiece(firstPieceId);
        this.drawNextPiece();
        this.updateUI();
    }

    drawNextPiece() {
        if (!this.nextCtx || !this.nextPieceId) return;
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const shape = TETRIS_CONFIG.shapes[this.nextPieceId];
        const color = TETRIS_CONFIG.colors[this.nextPieceId];
        const bs = 20; 
        const offsetX = (this.nextCanvas.width - shape[0].length * bs) / 2;
        const offsetY = (this.nextCanvas.height - shape.length * bs) / 2;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 0) {
                    this.nextCtx.fillStyle = color;
                    this.nextCtx.fillRect(offsetX + c * bs, offsetY + r * bs, bs - 1, bs - 1);
                    this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.nextCtx.fillRect(offsetX + c * bs, offsetY + r * bs, bs - 1, 3);
                }
            }
        }
    }

    updateUI() {
        const scoreEl = document.getElementById("tetris-score");
        const linesEl = document.getElementById("tetris-lines");
        const levelEl = document.getElementById("tetris-level");
        if (scoreEl) scoreEl.innerText = this.score;
        if (linesEl) linesEl.innerText = this.lines;
        if (levelEl) levelEl.innerText = this.level;
    }

    startLoop() {
        if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = setInterval(() => {
            this.update(true); // true = turun dari gravitasi
        }, this.dropInterval);
    }

    // Sistem Partikel Ledakan
    createParticles(rowY) {
        let drawY = rowY * TETRIS_CONFIG.blockSize;
        for(let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: drawY + Math.random() * TETRIS_CONFIG.blockSize,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 1) * 12,
                life: 1.0,
                color: TETRIS_CONFIG.colors[Math.floor(Math.random() * 7) + 1]
            });
        }
    }

    // Sistem Teks Mengambang
    createFloatingText(text, color) {
        this.floatingTexts.push({
            text: text,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            alpha: 1.0,
            color: color
        });
    }

    update(isGravity = false) {
        if (this.isGameOver) return;

        // Gerak partikel & teks
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.6; // Gravitasi partikel
            p.life -= 0.03;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.floatingTexts.forEach(ft => {
            ft.y -= 1.5; // Teks terbang ke atas
            ft.alpha -= 0.02;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);

        if (isGravity) {
            if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                this.currentPiece.moveDown();
            } else {
                this.lockAndCheckLines();
            }
        }
        this.render();
    }

    lockAndCheckLines() {
        this.board.lockPiece(this.currentPiece);
        let clearedRows = this.board.clearLines(); 
        
        if (clearedRows.length > 0) {
            this.combo++;
            
            // Ledakkan setiap baris yang hancur
            clearedRows.forEach(rowY => this.createParticles(rowY));
            this.calculateScore(clearedRows.length);
        } else {
            this.combo = 0; // Putus combo jika tidak ada yang pecah
        }

        this.currentPiece.spawnPiece(this.nextPieceId);
        this.nextPieceId = Math.floor(Math.random() * (TETRIS_CONFIG.shapes.length - 1)) + 1;
        this.drawNextPiece();

        if (!this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.isGameOver = true;
            this.cleanup();
            const finalScoreEl = document.getElementById("tetris-final-score");
            if (finalScoreEl) finalScoreEl.innerText = this.score;
            const overlay = document.getElementById("tetris-overlay");
            if (overlay) overlay.style.display = "flex";
        }
    }

    calculateScore(clearedCount) {
        const linePoints = [0, 100, 300, 500, 800];
        let gainedScore = linePoints[clearedCount] * this.level;
        
        let textMsg = "";
        let colorMsg = "#fff";

        if (clearedCount === 1) { textMsg = "SINGLE!"; colorMsg = "#00d2d3"; }
        if (clearedCount === 2) { textMsg = "DOUBLE!"; colorMsg = "#2ed573"; }
        if (clearedCount === 3) { textMsg = "TRIPLE!"; colorMsg = "#ffc107"; }
        if (clearedCount === 4) { textMsg = "TETRIS!!"; colorMsg = "#ff4757"; }

        if (this.combo > 1) {
            gainedScore += (50 * this.combo * this.level);
            this.createFloatingText(`COMBO x${this.combo}!`, "#ff9f43");
        }
        
        this.createFloatingText(textMsg, colorMsg);

        this.score += gainedScore;
        this.lines += clearedCount;
        this.level = Math.floor(this.lines / 5) + 1;
        this.dropInterval = Math.max(200, 1000 - (this.level - 1) * 100);
        
        this.updateUI();
        this.startLoop(); 
    }

    hardDrop() {
        while (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.moveDown();
            this.score += 2; // Bonus drop cepat
        }
        this.lockAndCheckLines();
        this.updateUI();
        this.update();
    }

    setupKeyboardInput() {
        this.keydownHandler = (e) => {
            if (this.isGameOver) return;
            if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) e.preventDefault();

            switch (e.key) {
                case "ArrowLeft":
                    if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x - 1, this.currentPiece.y)) this.currentPiece.moveLeft();
                    break;
                case "ArrowRight":
                    if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x + 1, this.currentPiece.y)) this.currentPiece.moveRight();
                    break;
                case "ArrowDown":
                    if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                        this.currentPiece.moveDown();
                        this.score += 1;
                    }
                    break;
                case "ArrowUp":
                    let originalShape = this.currentPiece.shape;
                    this.currentPiece.rotate();
                    if (!this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
                        this.currentPiece.shape = originalShape;
                    }
                    break;
                case " ":
                    this.hardDrop();
                    break;
            }
            this.update();
        };
        window.addEventListener("keydown", this.keydownHandler);
    }

    setupTouchControls() {
        // Fungsi pembantu agar tombol merespons lebih cepat tanpa jeda "klik"
        const bindButton = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            // Gunakan pointerdown agar responsif di HP dan PC
            btn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                if (!this.isGameOver) { action(); this.update(); this.updateUI(); }
            });
        };

        bindButton("btn-t-left", () => {
            if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x - 1, this.currentPiece.y)) this.currentPiece.moveLeft();
        });
        bindButton("btn-t-right", () => {
            if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x + 1, this.currentPiece.y)) this.currentPiece.moveRight();
        });
        bindButton("btn-t-down", () => {
            if (this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
                this.currentPiece.moveDown();
                this.score += 1;
            }
        });
        bindButton("btn-t-rotate", () => {
            let originalShape = this.currentPiece.shape;
            this.currentPiece.rotate();
            if (!this.board.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
                this.currentPiece.shape = originalShape;
            }
        });
        bindButton("btn-t-drop", () => {
            this.hardDrop();
        });
    }

    render() {
        if (!this.ctx || !this.board) return;
        this.board.draw();
        
        if (this.currentPiece) this.currentPiece.draw();

        // Render Partikel
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 5, 5); // Ukuran kotak partikel
        });
        this.ctx.globalAlpha = 1.0;

        // Render Teks Mengambang (Combo/Juice)
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 20px 'Segoe UI', Arial";
        this.floatingTexts.forEach(ft => {
            this.ctx.globalAlpha = ft.alpha;
            this.ctx.fillStyle = ft.color;
            this.ctx.shadowColor = "black";
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(ft.text, ft.x, ft.y);
        });
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }
}