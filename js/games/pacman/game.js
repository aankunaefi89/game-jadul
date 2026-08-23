// =======================================================
// PACMAN GAME ENGINE & CONTROLLER
// =======================================================

class PacmanGameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        this.score = 0;
        this.level = 1;
        this.lives = 3;

        this.playerSpeed = 170;
        this.ghostSpeed = 300;

        this.playerLoop = null;
        this.ghostLoop = null;
        this.frightenedTimer = null;
        this.fruitTimer = null;
        this.spawnTimers = [];

        this.frightened = false;
        this.combo = 0;

        this.fruit = null;
        this.fruitSpawned = false;

        this.dots = [];
        this.superDots = [];

        this.mapRenderer = null;
        this.player = null;
        this.ghostController = null;
        this.keydownHandler = null;
        this.audio = new PacmanAudio();
    }

    cleanup() {
        if (this.playerLoop) clearInterval(this.playerLoop);
        if (this.ghostLoop) clearInterval(this.ghostLoop);
        if (this.frightenedTimer) clearTimeout(this.frightenedTimer);
        if (this.fruitTimer) clearTimeout(this.fruitTimer);

        for (let t of this.spawnTimers) {
            clearTimeout(t);
        }
        this.spawnTimers = [];

        if (this.keydownHandler) {
            window.removeEventListener("keydown", this.keydownHandler);
            this.keydownHandler = null;
        }
    }

    init() {
        this.cleanup();

        this.canvas = document.getElementById("pacmanCanvas");
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");

        if (window.innerWidth < 700) {
            const size = Math.min(window.innerWidth - 20, 600);
            this.canvas.width = size;
            this.canvas.height = size;
            PACMAN_CONFIG.tileSize = size / PACMAN_CONFIG.map[0].length;
        }

        // Inisialisasi Modul Lain
        this.mapRenderer = new PacmanMap(this.ctx, PACMAN_CONFIG.tileSize, PACMAN_CONFIG.map);
        this.player = new PacmanPlayer(PACMAN_CONFIG.playerSpawn, PACMAN_CONFIG.tileSize, PACMAN_CONFIG.map);
        
        this.ghostController = new PacmanGhostController(
            PACMAN_CONFIG.ghostSpawn,
            PACMAN_CONFIG.tileSize,
            PACMAN_CONFIG.map,
            this.player,
            (x, y) => this.player.isWalkable(x, y),
            (sx, sy, tx, ty) => this.player.findPath ? this.player.findPath(sx, sy, tx, ty) : []
        );

        // Tambahkan fungsi pathfinding manual jika belum ada di player
        this.player.findPath = (sx, sy, tx, ty) => {
            const queue = [];
            const visited = new Set();
            queue.push({ x: sx, y: sy, path: [] });
            visited.add(sx + "," + sy);
            const dirs = [ {x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0} ];

            while(queue.length) {
                const node = queue.shift();
                if(node.x === tx && node.y === ty) return node.path;
                for(const d of dirs) {
                    let nx = node.x + d.x;
                    let ny = node.y + d.y;
                    if(ny === 10) {
                        if(nx < 0) nx = PACMAN_CONFIG.map[0].length - 1;
                        if(nx >= PACMAN_CONFIG.map[0].length) nx = 0;
                    }
                    if(!this.player.isWalkable(nx, ny)) continue;
                    const key = nx + "," + ny;
                    if(visited.has(key)) continue;
                    visited.add(key);
                    queue.push({ x:nx, y:ny, path:[ ...node.path, { x:nx-node.x, y:ny-node.y } ] });
                }
            }
            return [];
        };

        this.resetGameData();
        this.setupKeyboardInput();
        this.startLoops();
    }

    resetGameData() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.fruit = null;
        this.fruitSpawned = false;

        this.player.x = PACMAN_CONFIG.playerSpawn.x;
        this.player.y = PACMAN_CONFIG.playerSpawn.y;
        this.player.dir = "right";

        // Generate Dots
        this.dots = [];
        for (let y = 0; y < PACMAN_CONFIG.map.length; y++) {
            for (let x = 0; x < PACMAN_CONFIG.map[0].length; x++) {
                if (PACMAN_CONFIG.map[y][x] === 0) {
                    // Pastikan koordinat dot bukan bagian dari super dots agar tidak dobel/bentrok
                    const isSuperCoord = PACMAN_CONFIG.superDotsCoords.some(sd => sd.x === x && sd.y === y);
                    if (!isSuperCoord) {
                        this.dots.push({ x: x, y: y, eaten: false });
                    }
                }
            }
        }

        this.superDots = PACMAN_CONFIG.superDotsCoords.map(sd => ({ x: sd.x, y: sd.y, eaten: false }));

        // Ghost Timer Spawns
        this.ghostController.ghosts[0].active = true;
        this.spawnTimers.push(setTimeout(() => this.ghostController.activateGhost(1), 3000));
        this.spawnTimers.push(setTimeout(() => this.ghostController.activateGhost(2), 6000));
        this.spawnTimers.push(setTimeout(() => this.ghostController.activateGhost(3), 9000));
    }

    setupKeyboardInput() {
        this.keydownHandler = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }
            switch (e.key) {
                case "ArrowLeft": this.player.dir = "left"; break;
                case "ArrowRight": this.player.dir = "right"; break;
                case "ArrowUp": this.player.dir = "up"; break;
                case "ArrowDown": this.player.dir = "down"; break;
            }
        };
        window.addEventListener("keydown", this.keydownHandler);
    }

    startLoops() {
        if (this.playerLoop) clearInterval(this.playerLoop);
        if (this.ghostLoop) clearInterval(this.ghostLoop);

        // Loop Player & Game Logic
        this.playerLoop = setInterval(() => {
            this.player.move();
            this.player.animateMouth();
            this.ghostController.animateGhosts();
            this.eatDots();
            this.eatSuperDots();
            this.checkFruit();
            this.eatFruit();
            this.checkCollisions();
            this.checkLevelComplete();
            this.render();
        }, this.playerSpeed);

        // Loop Ghost Movement
        this.ghostLoop = setInterval(() => {
            this.ghostController.moveGhosts(this.frightened);
            this.checkCollisions();
            this.render();
        }, this.ghostSpeed);
    }

    eatDots() {
        for (const dot of this.dots) {
            if (dot.eaten) continue;
            if (dot.x === this.player.x && dot.y === this.player.y) {
                dot.eaten = true;
                this.score += 10;
                document.getElementById("pc-score").innerText = this.score;
                this.audio.playChomp();
            }
        }
    }

    eatSuperDots() {
        for (const dot of this.superDots) {
            if (dot.eaten) continue;
            if (dot.x === this.player.x && dot.y === this.player.y) {
                dot.eaten = true;
                this.score += 50;
                document.getElementById("pc-score").innerText = this.score;
                this.audio.playPowerEat();

                this.frightened = true;
                clearTimeout(this.frightenedTimer);
                this.frightenedTimer = setTimeout(() => {
                    this.frightened = false;
                    this.combo = 0;
                }, 7000);
            }
        }
    }

    checkFruit() {
        if (this.fruit || this.fruitSpawned) return;
        let eaten = this.dots.filter(d => d.eaten).length;
        if (eaten < 30) return;

        const candidates = this.dots.filter(d => !d.eaten);
        if (candidates.length > 0) {
            const p = candidates[Math.floor(Math.random() * candidates.length)];
            this.fruit = { x: p.x, y: p.y };
        }
        this.fruitSpawned = true;
        clearTimeout(this.fruitTimer);
        this.fruitTimer = setTimeout(() => { this.fruit = null; }, 8000);
    }

    eatFruit() {
        if (!this.fruit) return;
        if (this.player.x === this.fruit.x && this.player.y === this.fruit.y) {
            this.score += 500;
            document.getElementById("pc-score").innerText = this.score;
            this.audio.playPowerEat();
            this.fruit = null;
        }
    }

    checkCollisions() {
        for (const ghost of this.ghostController.ghosts) {
            if (!ghost.active || ghost.x !== this.player.x || ghost.y !== this.player.y) continue;

            if (this.frightened) {
                if (ghost.dead) continue;
                this.combo++;
                let bonus = this.combo === 1 ? 200 : (this.combo === 2 ? 400 : (this.combo === 3 ? 800 : 1600));
                this.score += bonus;
                document.getElementById("pc-score").innerText = this.score;
                ghost.dead = true;
                continue;
            }

            if (!ghost.dead) {
                this.lives--;
                document.getElementById("pc-lives").innerText = this.lives;
                this.audio.playDeath();

                if (this.lives <= 0) {
                    this.cleanup();
                    document.getElementById("pacman-final-score").innerText = this.score;
                    document.getElementById("pacman-overlay").style.display = "flex";
                    return;
                }
                this.player.x = PACMAN_CONFIG.playerSpawn.x;
                this.player.y = PACMAN_CONFIG.playerSpawn.y;
                this.player.dir = "right";
                return;
            }
        }
    }

    checkLevelComplete() {
        let remainingDots = this.dots.filter(d => !d.eaten).length;
        let remainingSuper = this.superDots.filter(sd => !sd.eaten).length;
        let totalRemaining = remainingDots + remainingSuper;

        if (totalRemaining === 0) {
            this.level++;
            this.playerSpeed = Math.max(130, this.playerSpeed - 2);
            this.ghostSpeed = Math.max(170, this.ghostSpeed - 8);
            
            const levelEl = document.getElementById("pc-level");
            if (levelEl) levelEl.innerText = this.level;

            this.dots.forEach(d => d.eaten = false);
            this.superDots.forEach(sd => sd.eaten = false);
            
            this.fruit = null;
            this.fruitSpawned = false;

            this.player.x = PACMAN_CONFIG.playerSpawn.x;
            this.player.y = PACMAN_CONFIG.playerSpawn.y;
            this.player.dir = "right";

            this.ghostController.ghosts.forEach(g => {
                g.x = g.startX;
                g.y = g.startY;
                g.dead = false;
            });

            this.startLoops();
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.mapRenderer.drawMap();
        this.mapRenderer.drawGhostHouse();
        this.mapRenderer.drawDots(this.dots, this.superDots);
        this.mapRenderer.drawFruit(this.fruit);
        this.player.draw(this.ctx);
        this.ghostController.draw(this.ctx, this.frightened);
    }
}