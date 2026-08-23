// =======================================================
// PACMAN GHOST AI & CONTROLLER
// =======================================================

class PacmanGhostController {
    constructor(ghostSpawns, tileSize, mapLayout, playerInstance, isWalkableCallback, findPathCallback) {
        this.tileSize = tileSize;
        this.map = mapLayout;
        this.rows = this.map.length;
        this.cols = this.map[0].length;
        this.player = playerInstance;
        this.isWalkable = isWalkableCallback;
        this.findPath = findPathCallback;

        this.ghostFrame = 0;
        this.ghostAnimForward = true;

        this.ghosts = [];
        for (const g of ghostSpawns) {
            this.ghosts.push({
                name: g.name,
                color: g.color,
                x: g.x,
                y: g.y,
                startX: g.x,
                startY: g.y,
                dir: g.dir,
                dead: false,
                active: false
            });
        }
    }

    activateGhost(index) {
        if (this.ghosts[index]) {
            this.ghosts[index].active = true;
        }
    }

    getOppositeDirection(dir) {
        switch(dir) {
            case "left": return "right";
            case "right": return "left";
            case "up": return "down";
            case "down": return "up";
            default: return "";
        }
    }

    animateGhosts() {
        if (this.ghostAnimForward) {
            this.ghostFrame++;
            if (this.ghostFrame >= 4) { this.ghostAnimForward = false; }
        } else {
            this.ghostFrame--;
            if (this.ghostFrame <= 0) { this.ghostAnimForward = true; }
        }
    }

    moveGhosts(frightened) {
        for (const ghost of this.ghosts) {
            if (!ghost.active) continue;

            // Jika hantu mati, berjalan pulang ke markas
            if (ghost.dead) {
                const path = this.findPath(ghost.x, ghost.y, ghost.startX, ghost.startY);
                if (path.length > 0) {
                    ghost.x += path[0].x;
                    ghost.y += path[0].y;
                }
                if (ghost.x === ghost.startX && ghost.y === ghost.startY) {
                    ghost.dead = false;
                }
                continue;
            }

            const dirs = [];
            if (this.isWalkable(ghost.x, ghost.y - 1)) dirs.push({ x: 0, y: -1, dir: "up" });
            if (this.isWalkable(ghost.x, ghost.y + 1)) dirs.push({ x: 0, y: 1, dir: "down" });
            if (this.isWalkable(ghost.x - 1, ghost.y)) dirs.push({ x: -1, y: 0, dir: "left" });
            if (this.isWalkable(ghost.x + 1, ghost.y)) dirs.push({ x: 1, y: 0, dir: "right" });

            if (dirs.length === 0) continue;

            const opposite = this.getOppositeDirection(ghost.dir);
            let available = dirs.filter(d => d.dir !== opposite);
            if (available.length === 0) { available = dirs; }

            let move;
            if (Math.random() < 0.7) {
                let best = frightened ? -1 : 999999;

                for (const d of available) {
                    const nx = ghost.x + d.x;
                    const ny = ghost.y + d.y;

                    let targetX = this.player.x;
                    let targetY = this.player.y;

                    // Logika khusus Clyde
                    if (ghost.name === "clyde") {
                        const distPlayer = Math.abs(ghost.x - this.player.x) + Math.abs(ghost.y - this.player.y);
                        if (distPlayer < 6) {
                            targetX = 1;
                            targetY = this.rows - 2;
                        }
                    }

                    // Logika khusus Pinky
                    if (ghost.name === "pinky") {
                        switch (this.player.dir) {
                            case "left": targetX -= 4; break;
                            case "right": targetX += 4; break;
                            case "up": targetY -= 4; break;
                            case "down": targetY += 4; break;
                        }
                    }

                    // Logika khusus Inky
                    if (ghost.name === "inky") {
                        const blinky = this.ghosts.find(g => g.name === "blinky");
                        if (blinky) {
                            const px = this.player.x;
                            const py = this.player.y;
                            const vx = px - blinky.x;
                            const vy = py - blinky.y;
                            targetX = px + vx;
                            targetY = py + vy;
                        }
                    }

                    const dist = Math.abs(nx - targetX) + Math.abs(ny - targetY);

                    if (frightened) {
                        if (dist > best || best === -1) {
                            best = dist;
                            move = d;
                        }
                    } else {
                        if (dist < best) {
                            best = dist;
                            move = d;
                        }
                    }
                }
            } else {
                move = available[Math.floor(Math.random() * available.length)];
            }

            ghost.dir = move.dir;
            ghost.x += move.x;
            ghost.y += move.y;
        }
    }

    draw(ctx, frightened) {
        for (const g of this.ghosts) {
            if (!g.active) continue;

            let color = g.color;
            if (frightened) {
                color = "#3da5ff";
            }

            const x = g.x * this.tileSize;
            const y = g.y * this.tileSize;

            // Jika mati (hanya mata)
            if (g.dead) {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(x + 8, y + 11, 3, 0, Math.PI * 2);
                ctx.arc(x + 14, y + 11, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#0033aa";
                ctx.beginPath();
                let px = 0, py = 0;
                switch (g.dir) {
                    case "left": px = -1.5; break;
                    case "right": px = 1.5; break;
                    case "up": py = -1.5; break;
                    case "down": py = 1.5; break;
                }
                ctx.arc(x + 8 + px, y + 11 + py, 1.5, 0, Math.PI * 2);
                ctx.arc(x + 14 + px, y + 11 + py, 1.5, 0, Math.PI * 2);
                ctx.fill();
                continue;
            }

            // Badan hantu
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x + 11, y + 10, 9, Math.PI, 0);
            ctx.lineTo(x + 20, y + 18);

            const leg = this.ghostFrame;
            ctx.lineTo(x + 20, y + 18);
            ctx.lineTo(x + 18, y + 20 + (leg % 2));
            ctx.lineTo(x + 15, y + 18);
            ctx.lineTo(x + 11, y + 20 + ((leg + 1) % 2));
            ctx.lineTo(x + 7, y + 18);
            ctx.lineTo(x + 4, y + 20 + (leg % 2));
            ctx.lineTo(x + 2, y + 18);
            ctx.closePath();
            ctx.fill();

            // Mata putih
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x + 8, y + 11, 2.3, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 11, 2.3, 0, Math.PI * 2);
            ctx.fill();

            // Pupil mata
            let px = 0, py = 0;
            switch (g.dir) {
                case "left": px = -1.2; break;
                case "right": px = 1.2; break;
                case "up": py = -1.2; break;
                case "down": py = 1.2; break;
            }
            ctx.fillStyle = "#0033aa";
            ctx.beginPath();
            ctx.arc(x + 8 + px, y + 12 + py, 1.2, 0, Math.PI * 2);
            ctx.arc(x + 14 + px, y + 12 + py, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}