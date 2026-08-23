// js/games/snake/player.js

class Snake {
    constructor(game) {
        this.game = game;
        this.gridSize = game.gridSize;
        // Posisi awal ular
        this.segments = [
            { x: 3 * this.gridSize, y: 3 * this.gridSize },
            { x: 2 * this.gridSize, y: 3 * this.gridSize },
            { x: 1 * this.gridSize, y: 3 * this.gridSize }
        ];
        this.dx = this.gridSize; // Bergerak ke kanan saat mulai
        this.dy = 0;
        this.isGhostMode = false;
    }

    update() {
        if (this.game.isGameOver) return;

        // Hitung posisi kepala yang baru
        let head = { x: this.segments[0].x + this.dx, y: this.segments[0].y + this.dy };

        // 1. Logika Portal Teleportasi
        if (this.game.portals.length > 0) {
            if (head.x === this.game.portals[0].x && head.y === this.game.portals[0].y) {
                head.x = this.game.portals[1].x;
                head.y = this.game.portals[1].y;
            } else if (head.x === this.game.portals[1].x && head.y === this.game.portals[1].y) {
                head.x = this.game.portals[0].x;
                head.y = this.game.portals[0].y;
            }
        }

        // 2. Deteksi Tabrakan (Collision)
        let hitWall = head.x < 0 || head.x >= this.game.canvas.width || head.y < 0 || head.y >= this.game.canvas.height;
        let hitSelf = false;
        
        // Mulai dari 3 agar kepala tidak dihitung menabrak lehernya sendiri
        for (let i = 3; i < this.segments.length; i++) { 
            if (this.segments[i].x === head.x && this.segments[i].y === head.y) hitSelf = true; 
        }
        
        let hitObstacle = this.game.obstacles.some(obs => obs.x === head.x && obs.y === head.y);

        // 3. Logika Ghost Mode (Tembus pandang)
        if (this.isGhostMode) {
            hitSelf = false;
            hitObstacle = false;
            // Tembus dinding layar
            if (head.x < 0) head.x = this.game.canvas.width - this.gridSize;
            if (head.x >= this.game.canvas.width) head.x = 0;
            if (head.y < 0) head.y = this.game.canvas.height - this.gridSize;
            if (head.y >= this.game.canvas.height) head.y = 0;
            hitWall = false;
        }

        // Jika nabrak dan tidak sedang Ghost Mode, panggil fungsi mati di game
        if (hitWall || hitSelf || hitObstacle) {
            this.game.handleDeath();
            return;
        }

        // Pindahkan kepala ke posisi baru
        this.segments.unshift(head);

        // Cek apakah ular memakan makanan
        if (head.x === this.game.food.x && head.y === this.game.food.y) {
            this.game.handleEatFood(); // Biarkan engine game mengatur skor & efek
        } else {
            // Jika tidak makan, hapus ekor agar ular terlihat berjalan
            this.segments.pop(); 
        }
    }

    draw(ctx) {
        this.segments.forEach((part, index) => {
            if (this.isGhostMode) {
                // Efek tembus pandang ungu
                ctx.fillStyle = (index === 0) ? "rgba(168, 85, 247, 0.9)" : "rgba(168, 85, 247, 0.4)";
            } else {
                // Efek belang-belang hijau
                ctx.fillStyle = (index === 0) ? "#2ed573" : ((index % 2 === 0) ? "#1abc9c" : "#16a085");
            }
            ctx.fillRect(part.x + 0.5, part.y + 0.5, this.gridSize - 1, this.gridSize - 1);
        });
    }
}