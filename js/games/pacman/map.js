// =======================================================
// PACMAN MAP & RENDERER
// =======================================================

class PacmanMap {
    constructor(ctx, tileSize, mapLayout) {
        this.ctx = ctx;
        this.tileSize = tileSize;
        this.map = mapLayout;
        this.rows = this.map.length;
        this.cols = this.map[0].length;
    }

    drawMap() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.map[y][x] === 1) {
                    this.ctx.fillStyle = "#0b5ed7";
                    this.ctx.fillRect(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }

    drawGhostHouse() {
        const x = 8.5 * this.tileSize;
        const y = 8.5 * this.tileSize;
        const w = 4 * this.tileSize;
        const h = 3 * this.tileSize;

        // Lantai rumah hantu
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(x, y, w, h);

        // Bingkai luar
        this.ctx.strokeStyle = "#4da3ff";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, w, h);

        // Pintu
        this.ctx.strokeStyle = "#ff66cc";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + this.tileSize + 8);
        this.ctx.lineTo(x + w - 8, y + this.tileSize + 8);
        this.ctx.stroke();
    }

    drawDots(dots, superDots) {
        // Gambar titik kecil biasa
        this.ctx.fillStyle = "white";
        for (const dot of dots) {
            if (dot.eaten) continue;
            
            const isSuper = superDots.some(sd => sd.x === dot.x && sd.y === dot.y);
            if (isSuper) continue;

            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.tileSize + this.tileSize / 2,
                dot.y * this.tileSize + this.tileSize / 2,
                3, 0, Math.PI * 2
            );
            this.ctx.fill();
        }

        // Gambar super dots (titik besar)
        this.ctx.fillStyle = "orange";
        for (const dot of superDots) {
            if (dot.eaten) continue;

            this.ctx.beginPath();
            this.ctx.arc(
                dot.x * this.tileSize + this.tileSize / 2,
                dot.y * this.tileSize + this.tileSize / 2,
                6, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    drawFruit(fruit) {
        if (!fruit) return;

        const x = fruit.x * this.tileSize;
        const y = fruit.y * this.tileSize;

        // Cherry kiri
        this.ctx.beginPath();
        this.ctx.fillStyle = "#d40000";
        this.ctx.arc(x + 8, y + 15, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Cherry kanan
        this.ctx.beginPath();
        this.ctx.arc(x + 15, y + 15, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Tangkai kiri
        this.ctx.strokeStyle = "#3cb043";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + 10);
        this.ctx.quadraticCurveTo(x + 10, y + 4, x + 12, y + 2);
        this.ctx.stroke();

        // Tangkai kanan
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + 10);
        this.ctx.quadraticCurveTo(x + 14, y + 4, x + 12, y + 2);
        this.ctx.stroke();

        // Daun
        this.ctx.fillStyle = "#33cc33";
        this.ctx.beginPath();
        this.ctx.ellipse(x + 15, y + 4, 3, 5, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
}