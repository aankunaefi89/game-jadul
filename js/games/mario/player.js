class MarioPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.width = 32;
        this.height = 32;

        this.vy = 0;
        this.onGround = false;

        this.big = false;
        this.facing = 1;

        this.fire = false;

        this.fireballs = [];
        this.shootWasDown = false;

        this.sprite = new Image();
        this.sprite.src = 'assets/img/marioimg/mario.png';

        this.jumpWasDown = false;

        this.frame = 0;
        this.frameTimer = 0;

        this.isMoving = false;
    }

    resetPosition() {
        this.big = false;
        this.fire = false;

        this.width = 32;
        this.height = 32;

        this.x = 50;
        this.y = 328;

        this.vy = 0;
        this.onGround = true;
    }

    makeBig() {
        if (this.big) return;

        this.big = true;

        this.height = 48;
        this.y -= 16;
    }

    makeSmall() {
        if (!this.big) return;

        this.big = false;
        this.fire = false;

        this.height = 32;
        this.y += 16;
    }

    makeFire() {
        if (!this.big) {
            this.makeBig();
        }

        this.fire = true;
    }

    playSound(name) {
        if (!this.sounds) return;

        const sound = this.sounds[name];

        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    shootFireball() {
        if (!this.fire) return;

        // Maksimal 2 fireball
        if (this.fireballs.length >= 2) return;

        this.fireballs.push({
            x:
                this.facing === 1
                    ? this.x + this.width
                    : this.x - 12,

            y: this.y + this.height / 2,

            width: 12,
            height: 12,

            vx: 7 * this.facing,
            vy: 1,

            active: true
        });

        this.playSound('fireball');
}

    update(keys, map) {
        let moving = false;
        const oldX = this.x;

        // KANAN
        if (
            keys['ArrowRight'] ||
            keys['d'] ||
            keys['D']
        ) {
            this.x += MARIO_CONFIG.playerSpeed;
            this.facing = 1;
            moving = true;
        }

        // KIRI
        if (
            keys['ArrowLeft'] ||
            keys['a'] ||
            keys['A']
        ) {
            this.x -= MARIO_CONFIG.playerSpeed;
            this.facing = -1;
            moving = true;
        }

        if (this.x < 0) {
            this.x = 0;
        }

        this.isMoving = moving;

        // =========================
        // COLLISION SAMPING BLOCK / TANGGA
        // =========================

        map.getActiveBlocks().forEach(block => {
            if (block.broken) return;

            const blockWidth = 30;
            const blockHeight = 30;

            const overlapY =
                this.y + this.height > block.y &&
                this.y < block.y + blockHeight;

            if (!overlapY) return;

            // Menabrak dari kiri
            if (
                this.x + this.width > block.x &&
                oldX + this.width <= block.x
            ) {
                this.x = block.x - this.width;
            }

            // Menabrak dari kanan
            else if (
                this.x < block.x + blockWidth &&
                oldX >= block.x + blockWidth
            ) {
                this.x = block.x + blockWidth;
            }
        });

        // LOMPAT
        const jumpDown =
            keys[' '] ||
            keys['Space'] ||
            keys['ArrowUp'] ||
            keys['w'] ||
            keys['W'];

        if (
            jumpDown &&
            !this.jumpWasDown &&
            this.onGround
        ) {
            this.vy = MARIO_CONFIG.jumpForce;
            this.onGround = false;
            this.playSound('jump');
        }

        this.jumpWasDown = jumpDown;

        // =========================
        // TEMBAK FIREBALL
        // Z / X
        // =========================

        const shootDown =
            keys['z'] ||
            keys['Z'] ||
            keys['x'] ||
            keys['X'];

        if (
            shootDown &&
            !this.shootWasDown &&
            this.fire
        ) {
            this.shootFireball();
        }

        this.shootWasDown = shootDown;

        // GRAVITASI
        const oldY = this.y;

        this.vy += MARIO_CONFIG.gravity;
        this.y += this.vy;

        this.onGround = false;

        // PLATFORM
        const platform =
            map.getPlatformBelow(this);

        if (platform) {
            this.y =
                platform.y - this.height;

            this.vy = 0;
            this.onGround = true;
        }

        // =========================
        // BLOK DARI BAWAH
        // =========================

        if (this.vy < 0) {
            const playerTop = this.y;
            const oldTop = oldY;

            map.getActiveBlocks().forEach(block => {

                if (block.broken) return;

                const blockBottom =
                    block.y + 30;

                const horizontal =
                    this.x + this.width > block.x &&
                    this.x < block.x + 30;

                const hitFromBelow =
                    oldTop >= blockBottom &&
                    playerTop <= blockBottom;

                if (
                    horizontal &&
                    hitFromBelow
                ) {
                    this.y = blockBottom;
                    this.vy = 0;

                    map.hitBlock(block);
                }
            });
        }

        // =========================
        // CEILING UNDERGROUND
        // =========================

        if (
            map.area === 'underground' &&
            this.vy < 0
        ) {
            map.undergroundCeiling.forEach(ceiling => {

                const horizontal =
                    this.x + this.width > ceiling.x &&
                    this.x < ceiling.x + ceiling.width;

                const ceilingBottom =
                    ceiling.y + ceiling.height;

                const hitFromBelow =
                    oldY >= ceilingBottom &&
                    this.y <= ceilingBottom;

                if (
                    horizontal &&
                    hitFromBelow
                ) {
                    this.y = ceilingBottom;
                    this.vy = 0;
                }
            });
        }

        // =========================
        // BERDIRI DI ATAS BLOCK
        // =========================

        if (this.vy >= 0) {

            map.getActiveBlocks().forEach(block => {
                if (block.broken) return;

                const blockWidth = 30;
                const blockHeight = 30;

                const horizontal =
                    this.x + this.width > block.x &&
                    this.x < block.x + blockWidth;

                const previousBottom =
                    oldY + this.height;

                const currentBottom =
                    this.y + this.height;

                if (
                    horizontal &&
                    previousBottom <= block.y &&
                    currentBottom >= block.y
                ) {
                    this.y =
                        block.y - this.height;

                    this.vy = 0;
                    this.onGround = true;
                }
            });
        }

        // COLLISION PIPA
        map.getActivePipes().forEach(pipe => {
            const overlapX =
                this.x + this.width > pipe.x &&
                this.x < pipe.x + pipe.width;

            const overlapY =
                this.y + this.height > pipe.y &&
                this.y < pipe.y + pipe.height;

            if (overlapX && overlapY) {

                if (
                    this.vy >= 0 &&
                    this.y + this.height - this.vy <= pipe.y + 10
                ) {
                    this.y =
                        pipe.y - this.height;

                    this.vy = 0;
                    this.onGround = true;
                }

                else if (
                    this.x + this.width / 2 <
                    pipe.x + pipe.width / 2
                ) {
                    this.x =
                        pipe.x - this.width;
                }

                else {
                    this.x =
                        pipe.x + pipe.width;
                }
            }
        });

        // ANIMASI JALAN
        if (moving && this.onGround) {
            this.frameTimer++;

            if (this.frameTimer >= 7) {
                this.frameTimer = 0;
                this.frame++;

                if (this.frame > 2) {
                    this.frame = 0;
                }
            }
        } else {
            this.frame = 0;
            this.frameTimer = 0;
        }

        this.isMoving = moving;

        // =========================
        // UPDATE FIREBALL
        // =========================

        this.fireballs.forEach(ball => {

            if (!ball.active) return;

            ball.vy += 0.25;

            ball.x += ball.vx;
            ball.y += ball.vy;

            // Pantul di tanah
            const floor = map.getSolidObjects().find(obj => {

                return (
                    ball.x + ball.width > obj.x &&
                    ball.x < obj.x + obj.width &&
                    ball.y + ball.height >= obj.y &&
                    ball.y + ball.height <= obj.y + 12 &&
                    ball.vy >= 0
                );
            });

            if (floor) {
                ball.y = floor.y - ball.height;
                ball.vy = -4;
            }

            // Kena musuh
            map.enemies.forEach(enemy => {

                if (!enemy.alive) return;

                if (
                    ball.x < enemy.x + enemy.width &&
                    ball.x + ball.width > enemy.x &&
                    ball.y < enemy.y + enemy.height &&
                    ball.y + ball.height > enemy.y
                ) {
                    enemy.alive = false;
                    ball.active = false;

                    // SCORE +100
                    map.pendingEnemyScore =
                        (map.pendingEnemyScore || 0) + 100;

                    // EFEK +100 DI ATAS GOOMBA
                    map.enemyHitEffects.push({
                        x: enemy.x,
                        y: enemy.y,
                        timer: 20
                    });
                }
            });

            // Keluar dunia
            if (
                ball.x < 0 ||
                ball.x > map.worldWidth ||
                ball.y > 450
            ) {
                ball.active = false;
            }
        });

        this.fireballs =
            this.fireballs.filter(ball => ball.active);

        // BATAS DUNIA
        if (
            this.x + this.width >
            map.worldWidth
        ) {
            this.x =
                map.worldWidth - this.width;
        }
    }

    draw(ctx, cameraX) {
    if (
        !this.sprite.complete ||
        !this.sprite.naturalWidth
    ) {
        return;
    }

    const screenX = this.x - cameraX;

    let sx;
    let sy;
    let sw;
    let sh;

    // =========================
    // MARIO KECIL
    // =========================
    if (!this.big) {

        // LOMPAT
        if (!this.onGround) {
            sx = 180;
            sy = 0;
            sw = 16;
            sh = 16;
        }

        // DIAM
        else if (!this.isMoving) {
            sx = 150;
            sy = 0;
            sw = 16;
            sh = 16;
        }

        // JALAN
        else {
            const frames = [
                { x: 30,  y: 0, w: 16, h: 16 },
                { x: 60,  y: 0, w: 16, h: 16 },
                { x: 120, y: 0, w: 16, h: 16 }
            ];

            const f = frames[this.frame];

            sx = f.x;
            sy = f.y;
            sw = f.w;
            sh = f.h;
        }
    }

    // =========================
    // MARIO BESAR
    // =========================
    else {

        // LOMPAT
        if (!this.onGround) {
            sx = 240;
            sy = 52;
            sw = 18;
            sh = 32;
        }

        // DIAM
        else if (!this.isMoving) {
            sx = 90;
            sy = 52;
            sw = 18;
            sh = 32;
        }

        // JALAN
        else {
            const frames = [
                { x: 120, y: 52, w: 18, h: 32 },
                { x: 150, y: 52, w: 18, h: 32 },
                { x: 240, y: 52, w: 18, h: 32 }
            ];

            const f = frames[this.frame];

            sx = f.x;
            sy = f.y;
            sw = f.w;
            sh = f.h;
        }
    }

    ctx.save();

    // =========================
// EFEK FIRE MARIO
// =========================
if (this.fire) {
    ctx.filter =
        'sepia(1) saturate(6) hue-rotate(330deg) brightness(1.4)';
}

    // Sprite asli menghadap kanan.
    // Flip hanya ketika Mario bergerak ke kiri.
    if (this.facing === 1) {

        ctx.translate(
            screenX + this.width,
            0
        );

        ctx.scale(-1, 1);

        ctx.drawImage(
            this.sprite,
            sx,
            sy,
            sw,
            sh,
            0,
            this.y,
            this.width,
            this.height
        );

    } else {

        ctx.drawImage(
            this.sprite,
            sx,
            sy,
            sw,
            sh,
            screenX,
            this.y,
            this.width,
            this.height
        );
    }

    ctx.restore();

    // =========================
        // FIREBALL
        // =========================

        this.fireballs.forEach(ball => {

            if (!ball.active) return;

            ctx.drawImage(
                this.sprite,

                330, 0,
                16, 16,

                ball.x - cameraX,
                ball.y,
                ball.width,
                ball.height
            );
        });
}
}