class MarioMap {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = MARIO_CONFIG.worldWidth;

        this.area = 'overworld';

        this.reset();

        this.enemySprite = new Image();
        this.enemySprite.src = 'assets/img/marioimg/enemies.png';

        this.enemyFrame = 0;
        this.enemyFrameTimer = 0;

        this.itemSprite = new Image();
        this.itemSprite.src = 'assets/img/marioimg/items.png';

        this.coinFrame = 0;
        this.coinFrameTimer = 0;

        this.blockSprite = new Image();
        this.blockSprite.src = 'assets/img/marioimg/blocks.png';

        this.tileSprite = new Image();
        this.tileSprite.src = 'assets/img/marioimg/tiles-blocks-custom.png';
    }

    updatePowerups() {
        this.coinFrameTimer++;

        if (this.coinFrameTimer >= 8) {
            this.coinFrame++;
            this.coinFrameTimer = 0;

            if (this.coinFrame > 3) {
                this.coinFrame = 0;
            }
        }
    this.powerups.forEach(powerup => {
        if (!powerup.active) return;

        // Flower diam di tempat
if (powerup.type === 'flower') {
    return;
}

        powerup.vy += MARIO_CONFIG.gravity;
        powerup.y += powerup.vy;
        powerup.x += powerup.vx;

        const platform = this.platforms.find(p => {
            return (
                powerup.x + powerup.width > p.x &&
                powerup.x < p.x + p.width &&
                powerup.y + powerup.height >= p.y &&
                powerup.y + powerup.height <= p.y + 10
            );
        });

        if (platform) {
            powerup.y = platform.y - powerup.height;
            powerup.vy = 0;
        }

        if (
            powerup.x <= 0 ||
            powerup.x + powerup.width >= this.worldWidth
        ) {
            powerup.vx *= -1;
        }
    });
}

    reset() {
    this.area = 'overworld';

    // TANAH
        this.platforms = [
            // GROUND WORLD 1-1
            { x: 0,    y: 360, width: 2050, height: 40 },

            // Lubang pertama
            { x: 2150, y: 360, width: 450, height: 40 },

            // Lubang kedua
            { x: 2700, y: 360, width: 650, height: 40 },

            // Lubang ketiga
            { x: 3450, y: 360, width: 1750, height: 40 }
        ];

        this.powerups = [];

        this.pendingScore = 0;

        this.debris = [];
        
        this.pendingEnemyScore = 0;
        this.enemyHitEffects = [];

        this.undergroundCeiling = [
            {
                x: 0,
                y: 70,
                width: 1000,
                height: 30
            }
        ];

        // AWAN
        this.clouds = [
            { x: 200, y: 60 },
            { x: 600, y: 90 },
            { x: 1100, y: 50 },
            { x: 1500, y: 80 },
            { x: 2100, y: 50 },
            { x: 2600, y: 90 },
            { x: 3300, y: 60 }
        ];

        this.goal = {
            x: 4550,
            y: 120,
            width: 12,
            height: 240,

            flagY: 135,
            flagTargetY: 300
        };

        this.castle = {
            x: 4750,
            y: 270,
            width: 150,
            height: 90
        };

        // PIPA
        this.pipes = [
            { x: 700,  y: 310, width: 50, height: 50 },
            { x: 950,  y: 290, width: 50, height: 70 },
            { x: 1200, y: 270, width: 50, height: 90 },
            {
                x: 1500,
                y: 250,
                width: 50,
                height: 110,
                enterable: true,
                target: 'underground'
            },

            {
                x: 2750,
                y: 310,
                width: 50,
                height: 50,
                exitOnly: true
            },

            // Bagian akhir
            { x: 3900, y: 310, width: 50, height: 50 }
        ];

        this.undergroundExit = {
            x: 800,
            y: 300,
            width: 50,
            height: 60
        };

        this.undergroundPlatforms = [
            {
                x: 0,
                y: 360,
                width: 1000,
                height: 40
            }
        ];

        this.undergroundCoins = [
            // BARIS BAWAH
            { x: 170, y: 310, collected: false },
            { x: 210, y: 310, collected: false },
            { x: 250, y: 310, collected: false },
            { x: 290, y: 310, collected: false },
            { x: 330, y: 310, collected: false },

            // DI ATAS BLOK
            { x: 430, y: 220, collected: false },
            { x: 470, y: 220, collected: false },
            { x: 510, y: 220, collected: false },
            { x: 550, y: 220, collected: false },

            // MENDEKATI PIPA KELUAR
            { x: 650, y: 300, collected: false },
            { x: 690, y: 300, collected: false },
            { x: 730, y: 300, collected: false }
        ];

        this.undergroundBlocks = [
            // PLATFORM TENGAH
            { x: 400, y: 270, type: 'brick' },
            { x: 430, y: 270, type: 'brick' },
            { x: 460, y: 270, type: 'brick' },
            { x: 490, y: 270, type: 'brick' },
            { x: 520, y: 270, type: 'brick' },
            { x: 550, y: 270, type: 'brick' },

            // PLATFORM TINGGI
            { x: 600, y: 210, type: 'brick' },
            { x: 630, y: 210, type: 'brick' },
            { x: 660, y: 210, type: 'brick' }
        ];

        // KOIN
        this.coins = [
            { x: 300, y: 300, collected: false },
            { x: 340, y: 300, collected: false },
            { x: 380, y: 300, collected: false },

            { x: 480, y: 240, collected: false },
            { x: 520, y: 240, collected: false },

            { x: 730, y: 190, collected: false },

            { x: 1230, y: 240, collected: false },
            { x: 1270, y: 240, collected: false }
        ];

        // =========================
        // BLOCK
        // =========================

        this.blocks = [
            // AWAL LEVEL
            { x: 400, y: 250, type: 'question', content: 'coin' },

            { x: 520, y: 250, type: 'brick' },
            { x: 550, y: 250, type: 'question', content: 'mushroom' },
            { x: 580, y: 250, type: 'brick' },
            { x: 610, y: 250, type: 'question', content: 'coin' },
            { x: 640, y: 250, type: 'brick' },

            // QUESTION BLOCK TINGGI
            { x: 550, y: 150, type: 'question', content: 'coin' },

            // TENGAH
            { x: 1750, y: 250, type: 'brick' },
            { x: 1780, y: 250, type: 'question', content: 'flower' },
            { x: 1810, y: 250, type: 'brick' },

            { x: 1900, y: 180, type: 'brick' },
            { x: 1930, y: 180, type: 'brick' },
            { x: 1960, y: 180, type: 'brick' },

            { x: 2300, y: 250, type: 'question', content: 'coin' },
            { x: 2330, y: 250, type: 'brick' },
            { x: 2360, y: 250, type: 'question', content: 'coin' },

            // MENDEKATI AKHIR
            { x: 3000, y: 250, type: 'brick' },
            { x: 3030, y: 250, type: 'brick' },
            { x: 3060, y: 250, type: 'question', content: 'coin' },
            { x: 3090, y: 250, type: 'brick' },

    // TANGGA — BIARKAN SEMUA PUNYA KAMU TETAP DI SINI

            // =========================
            // TANGGA AKHIR WORLD 1-1
            // =========================

            // Tangga naik
            { x: 4000, y: 330, type: 'stair' },

            { x: 4030, y: 330, type: 'stair' },
            { x: 4030, y: 300, type: 'stair' },

            { x: 4060, y: 330, type: 'stair' },
            { x: 4060, y: 300, type: 'stair' },
            { x: 4060, y: 270, type: 'stair' },

            { x: 4090, y: 330, type: 'stair' },
            { x: 4090, y: 300, type: 'stair' },
            { x: 4090, y: 270, type: 'stair' },
            { x: 4090, y: 240, type: 'stair' },

            { x: 4120, y: 330, type: 'stair' },
            { x: 4120, y: 300, type: 'stair' },
            { x: 4120, y: 270, type: 'stair' },
            { x: 4120, y: 240, type: 'stair' },
            { x: 4120, y: 210, type: 'stair' },

            { x: 4150, y: 330, type: 'stair' },
            { x: 4150, y: 300, type: 'stair' },
            { x: 4150, y: 270, type: 'stair' },
            { x: 4150, y: 240, type: 'stair' },
            { x: 4150, y: 210, type: 'stair' },
            { x: 4150, y: 180, type: 'stair' }
                    ];

        // MUSUH
        this.enemies = [
            {
                x: 650, y: 330,
                width: 30, height: 30,
                vx: -1,
                minX: 500,
                maxX: 680,
                alive: true
            },

            {
                x: 1650, y: 330,
                width: 30, height: 30,
                vx: -1,
                minX: 1550,
                maxX: 2000,
                alive: true
            },

            {
                x: 2250, y: 330,
                width: 30, height: 30,
                vx: -1,
                minX: 2150,
                maxX: 2550,
                alive: true
            },

            {
                x: 3200, y: 330,
                width: 30, height: 30,
                vx: -1,
                minX: 3100,
                maxX: 3300,
                alive: true
            }
        ];
        }

        updateEnemyHitEffects() {
            this.enemyHitEffects.forEach(effect => {
                effect.timer--;

                if (effect.timer > 0) {
                    effect.y -= 1;
                }
            });
            

            this.enemyHitEffects =
                this.enemyHitEffects.filter(
                    effect => effect.timer > 0
                );
        }
    
    updateEnemies() {

    // Animasi Goomba
    this.enemyFrameTimer++;

    if (this.enemyFrameTimer >= 10) {
        this.enemyFrame =
            this.enemyFrame === 0 ? 1 : 0;

        this.enemyFrameTimer = 0;
    }

    this.enemies.forEach(enemy => {

        if (!enemy.alive) return;

        enemy.x += enemy.vx;

        if (
            enemy.x <= enemy.minX ||
            enemy.x >= enemy.maxX
        ) {
            enemy.vx *= -1;
        }
    });
}

        getActiveCoins() {
            return this.area === 'underground'
                ? this.undergroundCoins
                : this.coins;
        }

        getActiveBlocks() {
            return this.area === 'underground'
                ? this.undergroundBlocks
                : this.blocks;
        }

        getActivePipes() {
            if (this.area === 'underground') {
                return [this.undergroundExit];
            }

            return this.pipes;
        }

        getActivePlatforms() {

            if (this.area === 'underground') {
                return [
                    ...this.undergroundPlatforms,
                    ...this.undergroundCeiling
                ];
            }

            return this.platforms;
        }

    getPlatformBelow(player) {
        const left = player.x;
        const right = player.x + player.width;
        const bottom = player.y + player.height;

        let result = null;

        const activePlatforms =
            this.area === 'underground'
                ? this.undergroundPlatforms
                : this.platforms;

        activePlatforms.forEach(platform => {
            const horizontal =
                right > platform.x &&
                left < platform.x + platform.width;

            const falling =
                player.vy >= 0;

            const landing =
                bottom <= platform.y + 15 &&
                bottom >= platform.y - 15;

            if (horizontal && falling && landing) {
                if (!result || platform.y < result.y) {
                    result = platform;
                }
            }
        });

        return result;
    }

    hitBlock(block) {
    if (block.type !== 'question') {
        return;
    }

    const content = block.content;

    block.type = 'used';

    // COIN
    if (content === 'coin') {
        this.pendingScore += 10;
    }

    // MUSHROOM
    if (content === 'mushroom') {
        this.powerups.push({
            x: block.x,
            y: block.y - 30,
            width: 30,
            height: 30,
            vx: 1.5,
            vy: 0,
            active: true,
            type: 'mushroom'
        });
    }

    // FIRE FLOWER
    if (content === 'flower') {
        this.powerups.push({
            x: block.x,
            y: block.y - 30,
            width: 30,
            height: 30,
            vx: 0,
            vy: 0,
            active: true,
            type: 'flower'
        });
    }
}

    getSolidObjects() {

        const solids = [
            ...this.getActivePlatforms(),

            ...this.getActivePipes().map(pipe => ({
                x: pipe.x,
                y: pipe.y,
                width: pipe.width,
                height: pipe.height
            })),

            ...this.getActiveBlocks()
                .filter(block => !block.broken)
                .map(block => ({
                    x: block.x,
                    y: block.y,
                    width: 30,
                    height: 30
                }))
        ];

        // CEILING KHUSUS UNDERGROUND
        if (this.area === 'underground') {
            solids.push(
                ...this.undergroundCeiling
            );
        }

        return solids;
    }

        breakBrick(block) {
            if (block.broken) return;

            block.broken = true;

            const pieces = [
                { x: block.x,      y: block.y,      vx: -2, vy: -6 },
                { x: block.x + 15, y: block.y,      vx:  2, vy: -6 },
                { x: block.x,      y: block.y + 15, vx: -2, vy: -3 },
                { x: block.x + 15, y: block.y + 15, vx:  2, vy: -3 }
            ];

            pieces.forEach(piece => {
                this.debris.push({
                    ...piece,
                    width: 15,
                    height: 15,
                    active: true
                });
            });
        }

        updateDebris() {
            this.debris.forEach(piece => {
                if (!piece.active) return;

                piece.vy += MARIO_CONFIG.gravity;

                piece.x += piece.vx;
                piece.y += piece.vy;

                if (piece.y > this.canvasHeight + 50) {
                    piece.active = false;
                }
            });
        }

    draw(ctx, cameraX) {
        if (this.area === 'underground') {

    // BACKGROUND
    ctx.fillStyle = '#000000';
    ctx.fillRect(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
    );

    // =========================
    // CEILING UNDERGROUND
    // =========================

    this.undergroundCeiling.forEach(ceiling => {

        for (
            let x = ceiling.x;
            x < ceiling.x + ceiling.width;
            x += 30
        ) {
            ctx.drawImage(
                this.tileSprite,
                60, 20,
                20, 20,

                x - cameraX,
                ceiling.y,

                30,
                30
            );
        }
    });

    // LANTAI BATA
    this.undergroundPlatforms.forEach(platform => {

        for (
            let x = platform.x;
            x < platform.x + platform.width;
            x += 30
        ) {
            ctx.drawImage(
                this.tileSprite,
                60, 20,
                20, 20,
                x - cameraX,
                platform.y,
                30, 40
            );
        }
    });

    // BLOK
    this.undergroundBlocks.forEach(block => {
        ctx.drawImage(
            this.tileSprite,
            60, 20,
            20, 20,
            block.x - cameraX,
            block.y,
            30, 30
        );
    });

    // COIN
    const coinFrames = [
        { x: 128, y: 95, w: 8, h: 14 },
        { x: 160, y: 95, w: 4, h: 14 },
        { x: 191, y: 95, w: 1, h: 14 },
        { x: 220, y: 95, w: 4, h: 14 }
    ];

    const frame =
        coinFrames[this.coinFrame];

    this.undergroundCoins.forEach(coin => {

        if (coin.collected) return;

        ctx.drawImage(
            this.itemSprite,

            frame.x,
            frame.y,
            frame.w,
            frame.h,

            coin.x - cameraX - 8,
            coin.y - 12,
            16,
            24
        );
    });

    // PIPA KELUAR
    const pipe = this.undergroundExit;
    const pipeX = pipe.x - cameraX;

    ctx.fillStyle = '#00a800';

    ctx.fillRect(
        pipeX - 5,
        pipe.y,
        pipe.width + 10,
        18
    );

    ctx.fillRect(
        pipeX,
        pipe.y + 18,
        pipe.width,
        pipe.height - 18
    );

    ctx.fillStyle = '#80d010';

    ctx.fillRect(
        pipeX + 5,
        pipe.y + 3,
        8,
        pipe.height - 5
    );

    return;
}


        // Langit
        ctx.fillStyle = '#5c94fc';
        ctx.fillRect(
            0,
            0,
            this.canvasWidth,
            this.canvasHeight
        );

        // Awan
        this.clouds.forEach(cloud => {
            const x = cloud.x - cameraX;
            const y = cloud.y;

            ctx.fillStyle = '#ffffff';

            ctx.beginPath();
            ctx.arc(x, y + 10, 12, 0, Math.PI * 2);
            ctx.arc(x + 15, y, 16, 0, Math.PI * 2);
            ctx.arc(x + 32, y + 10, 12, 0, Math.PI * 2);
            ctx.fill();
        });

        // =========================
        // POWERUP SPRITE
        // =========================

        this.powerups.forEach(powerup => {

            if (!powerup.active) return;

            let sx;
            let sy;

            // MUSHROOM
            if (powerup.type === 'mushroom') {
                sx = 184;
                sy = 34;
            }

            // FIRE FLOWER
            else if (powerup.type === 'flower') {
                sx = 0;
                sy = 64;
            }

            else {
                return;
            }

            ctx.drawImage(
                this.itemSprite,

                sx,
                sy,
                16,
                16,

                powerup.x - cameraX,
                powerup.y,
                powerup.width,
                powerup.height
            );
        });

        // =========================
        // GROUND / PLATFORM
        // =========================

        this.getActivePlatforms().forEach(platform => {
            const tileSize = 30;

            for (
                let x = platform.x;
                x < platform.x + platform.width;
                x += tileSize
            ) {
                ctx.drawImage(
                    this.tileSprite,

                    60, 20,
                    20, 20,

                    x - cameraX,
                    platform.y,
                    Math.min(
                        tileSize,
                        platform.x + platform.width - x
                    ),
                    platform.height
                );
            }
        });

        // =========================
        // PIPA
        // =========================

        this.pipes.forEach(pipe => {
            const x = pipe.x - cameraX;

            // kepala pipa
            ctx.fillStyle = '#00a800';
            ctx.fillRect(
                x - 5,
                pipe.y,
                pipe.width + 10,
                18
            );

            // highlight kepala
            ctx.fillStyle = '#80d010';
            ctx.fillRect(
                x,
                pipe.y + 3,
                8,
                12
            );

            // badan pipa
            ctx.fillStyle = '#00a800';
            ctx.fillRect(
                x,
                pipe.y + 18,
                pipe.width,
                pipe.height - 18
            );

            // highlight badan
            ctx.fillStyle = '#80d010';
            ctx.fillRect(
                x + 6,
                pipe.y + 18,
                8,
                pipe.height - 18
            );

            // sisi gelap
            ctx.fillStyle = '#006800';
            ctx.fillRect(
                x + pipe.width - 8,
                pipe.y + 18,
                8,
                pipe.height - 18
            );

            // outline
            ctx.strokeStyle = '#003800';
            ctx.lineWidth = 2;

            ctx.strokeRect(
                x - 5,
                pipe.y,
                pipe.width + 10,
                18
            );

            ctx.strokeRect(
                x,
                pipe.y + 18,
                pipe.width,
                pipe.height - 18
            );
        });

        // =========================
        // BLOCK SPRITE
        // =========================

        this.blocks.forEach(block => {
            const x = block.x - cameraX;
            if (block.broken) return;

            // QUESTION BLOCK
            if (block.type === 'question') {
                ctx.drawImage(
                    this.itemSprite,
                    0, 0,
                    16, 16,
                    x,
                    block.y,
                    30, 30
                );
            }

            // USED BLOCK
            else if (block.type === 'used') {
                ctx.drawImage(
                    this.itemSprite,
                    32, 0,
                    16, 16,
                    x,
                    block.y,
                    30, 30
                );
            }

            // BRICK / STAIR
            else {
                ctx.drawImage(
                    this.tileSprite,
                    60, 20,
                    20, 20,
                    x,
                    block.y,
                    30, 30
                );
            }
        });

        // =========================
        // PECAHAN BRICK
        // =========================

        this.debris.forEach(piece => {
            if (!piece.active) return;

            ctx.drawImage(
                this.tileSprite,
                60, 20,
                20, 20,

                piece.x - cameraX,
                piece.y,
                piece.width,
                piece.height
            );
        });

        // FINISH / TIANG BENDERA
            const goalX = this.goal.x - cameraX;

            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(
                goalX,
                this.goal.y,
                6,
                this.goal.height
            );

            ctx.fillStyle = '#ff3333';

            ctx.beginPath();
            ctx.moveTo(goalX + 6, this.goal.flagY);
            ctx.lineTo(goalX + 45, this.goal.flagY + 15);
            ctx.lineTo(goalX + 6, this.goal.flagY + 30);
            ctx.fill();

            ctx.fillStyle = '#c8a000';

            ctx.fillRect(
                goalX - 8,
                this.goal.y + this.goal.height,
                30,
                10
            );

            // =========================
            // CASTLE
            // =========================

            const castleX = this.castle.x - cameraX;

            // badan
            ctx.fillStyle = '#9b6b43';
            ctx.fillRect(
                castleX,
                this.castle.y,
                this.castle.width,
                this.castle.height
            );

            // bagian atas
            ctx.fillStyle = '#70452c';

            ctx.fillRect(castleX, this.castle.y - 25, 35, 25);
            ctx.fillRect(castleX + 58, this.castle.y - 25, 35, 25);
            ctx.fillRect(castleX + 115, this.castle.y - 25, 35, 25);

            // pintu
            ctx.fillStyle = '#111111';

            ctx.fillRect(
                castleX + 60,
                this.castle.y + 45,
                30,
                45
            );

            // jendela
            ctx.fillRect(
                castleX + 20,
                this.castle.y + 30,
                15,
                20
            );

            ctx.fillRect(
                castleX + 115,
                this.castle.y + 30,
                15,
                20
            );

        // =========================
        // COIN SPRITE
        // =========================

        const coinFrames = [
            { x: 128, y: 95, w: 8, h: 14 },
            { x: 160, y: 95, w: 4, h: 14 },
            { x: 191, y: 95, w: 1, h: 14 },
            { x: 220, y: 95, w: 4, h: 14 }
        ];

        const coinSprite =
            coinFrames[this.coinFrame];

        this.coins.forEach(coin => {

            if (coin.collected) return;

            ctx.drawImage(
                this.itemSprite,

                coinSprite.x,
                coinSprite.y,
                coinSprite.w,
                coinSprite.h,

                coin.x - cameraX - 8,
                coin.y - 12,
                16,
                24
            );
        });

        // =========================
        // EFEK MUSUH KENA FIREBALL
        // =========================

        this.enemyHitEffects.forEach(effect => {

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';

            ctx.fillText(
                '+100',
                effect.x - cameraX,
                effect.y
            );
        });

        // =========================
        // GOOMBA
        // =========================

        this.enemies.forEach(enemy => {

            if (!enemy.alive) return;

            if (
                this.enemySprite.complete &&
                this.enemySprite.naturalWidth !== 0
            ) {

                // Goomba ada di kiri atas enemies.png
                const sx =
                    this.enemyFrame === 0
                        ? 0
                        : 30;

                const sy = 0;

                const sw = 18;
                const sh = 18;

                ctx.drawImage(
                    this.enemySprite,

                    sx,
                    sy,
                    sw,
                    sh,

                    enemy.x - cameraX,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );

            } else {

                // fallback
                ctx.fillStyle = '#8b4513';

                ctx.fillRect(
                    enemy.x - cameraX,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );
            }
        });
            }
        }