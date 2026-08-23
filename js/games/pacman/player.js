// =======================================================
// PACMAN PLAYER CONTROLLER & ANIMATION
// =======================================================

class PacmanPlayer {
    constructor(spawn, tileSize, mapLayout) {
        this.x = spawn.x;
        this.y = spawn.y;
        this.dir = "right";
        this.tileSize = tileSize;
        this.map = mapLayout;
        this.rows = this.map.length;
        this.cols = this.map[0].length;

        // Animasi mulut
        this.mouthAngle = 0.20;
        this.mouthClosing = false;
    }

    isWalkable(x, y) {
        const tunnelRow = 10;
        if (y === tunnelRow) {
            if (x < 0 || x >= this.cols) return true;
        }
        if (x < 0 || x >= this.cols) return false;
        if (!this.map[y]) return false;
        
        const tile = this.map[y][x];
        return (tile === 0 || tile === 4 || tile === 5);
    }

    move() {
        let nx = this.x;
        let ny = this.y;

        switch (this.dir) {
            case "left": nx--; break;
            case "right": nx++; break;
            case "up": ny--; break;
            case "down": ny++; break;
        }

        const tunnelRow = 10;
        if (ny === tunnelRow) {
            if (nx < 0) nx = this.cols - 1;
            if (nx >= this.cols) nx = 0;
        } else {
            if (nx < 0 || nx >= this.cols) return;
        }

        if (this.isWalkable(nx, ny)) {
            this.x = nx;
            this.y = ny;
        }
    }

    animateMouth() {
        if (this.mouthClosing) {
            this.mouthAngle -= 0.03;
            if (this.mouthAngle <= 0.05) {
                this.mouthClosing = false;
            }
        } else {
            this.mouthAngle += 0.03;
            if (this.mouthAngle >= 0.45) {
                this.mouthClosing = true;
            }
        }
    }

    draw(ctx) {
        let rotation = 0;
        switch (this.dir) {
            case "right": rotation = 0; break;
            case "down": rotation = Math.PI / 2; break;
            case "left": rotation = Math.PI; break;
            case "up": rotation = -Math.PI / 2; break;
        }

        const cx = this.x * this.tileSize + this.tileSize / 2;
        const cy = this.y * this.tileSize + this.tileSize / 2;
        const r = this.tileSize / 2 - 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, this.mouthAngle, Math.PI * 2 - this.mouthAngle);
        ctx.closePath();
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
    }
}