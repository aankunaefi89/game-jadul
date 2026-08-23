class MarioGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        this.container.innerHTML =
            '<canvas id="marioCanvas"></canvas>';

        this.canvas =
            document.getElementById('marioCanvas');

        this.ctx =
            this.canvas.getContext('2d');

        this.canvas.width =
            MARIO_CONFIG.canvasWidth;

        this.canvas.height =
            MARIO_CONFIG.canvasHeight;

        this.isRunning = false;
        this.score = 0;

        this.coinCount = 0;

        this.lives = 3;
        this.time = 400;
        this.lastTimerUpdate = 0;

        this.flagReached = false;

        this.finishState = 'playing';

        this.playerVisible = true;

        this.isPaused = false;
        this.isMuted = false;

        this.area = 'overworld';
        this.currentWorld = '1-1';
        this.pipeTransition = false;

        // MAP
        this.map = new MarioMap(
            this.canvas.width,
            this.canvas.height
        );

        // PLAYER
        this.player =
            new MarioPlayer(50, 328);

            this.sounds = {
            coin: new Audio('assets/sound/coin.wav'),
            die: new Audio('assets/sound/die.wav'),
            fireball: new Audio('assets/sound/fireball.wav'),
            hit: new Audio('assets/sound/hit.wav'),
            jump: new Audio('assets/sound/jump.wav'),
            powerup: new Audio('assets/sound/Powerup.wav'),
            win: new Audio('assets/sound/win.wav'),
            bgm: new Audio('assets/sound/bgm.wav')
        };

    this.player.sounds = this.sounds;
    this.sounds.bgm.loop = true;
    this.sounds.bgm.volume = 0.25;

        // CAMERA
        this.cameraX = 0;

        // KEYBOARD
        this.keys = {};

        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;

            // PAUSE = P
            if (e.code === 'KeyP' && !e.repeat) {
                this.togglePause();
            }

            // MUTE = M
            if (e.code === 'KeyM' && !e.repeat) {
                this.toggleMute();
            }

            if (
                [
                    'Space',
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight'
                ].includes(e.code)
            ) {
                e.preventDefault();
                
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });

        
    }

    playSound(name) {
        const sound = this.sounds[name];

        if (!sound) return;

        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    toggleMute() {
    this.isMuted = !this.isMuted;

    Object.values(this.sounds).forEach(sound => {
        sound.muted = this.isMuted;
    });
}

    togglePause() {
        if (
            this.finishState !== 'playing'
        ) {
            return;
        }

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.sounds.bgm.pause();
        } else {
            this.lastTimerUpdate =
                performance.now();

            if (!this.isMuted) {
                this.sounds.bgm
                    .play()
                    .catch(() => {});
            }
        }
    }



    start() {
        this.isRunning = true;

        this.score = 0;
        this.coinCount = 0;
        this.lives = 3;
        this.time = 400;

        this.flagReached = false;
        this.finishState = 'playing';
        this.playerVisible = true;

        this.lastTimerUpdate =
            performance.now();

        this.map.reset();

        this.player =
            new MarioPlayer(50, 328);
        this.player.sounds = this.sounds;

        this.cameraX = 0;

        this.keys = {};

        this.sounds.bgm.currentTime = 0;
        this.sounds.bgm.play().catch(() => {});

        this.area = 'overworld';
        this.map.area = 'overworld';

        this.currentWorld = '1-1';

        this.loop();
    }


    stop() {
        this.isRunning = false;
    }

    addCoin(amount = 1) {
    this.coinCount += amount;

    // SEMENTARA 10 UNTUK TEST
    while (this.coinCount >= 100) {
        this.coinCount -= 100;
        this.lives++;
    }
}


    checkCollisions() {

        // =========================
        // KOIN
        // =========================

        this.map.getActiveCoins().forEach(coin => {

            if (coin.collected) return;

            if (
                this.player.x <
                coin.x + 15 &&

                this.player.x +
                this.player.width >
                coin.x - 15 &&

                this.player.y <
                coin.y + 15 &&

                this.player.y +
                this.player.height >
                coin.y - 15
            ) {
                coin.collected = true;
                this.score += 10;
                this.addCoin(1);
                this.playSound('coin');
            }
        });

    
        // =========================
        // BONUS / POWERUP
        // =========================

        this.map.powerups.forEach(powerup => {

            if (!powerup.active) return;

            if (
                this.player.x < powerup.x + powerup.width &&
                this.player.x + this.player.width > powerup.x &&
                this.player.y < powerup.y + powerup.height &&
                this.player.y + this.player.height > powerup.y
            ) {

                powerup.active = false;
                this.playSound('powerup');

                // MUSHROOM
                if (powerup.type === 'mushroom') {
                    this.player.makeBig();
                    this.score += 1000;
                }

                // FIRE FLOWER
                else if (powerup.type === 'flower') {
                    this.player.makeFire();
                    this.score += 1000;
                }
            }
        });


        // =========================
        // MUSUH
        // =========================

        this.map.enemies.forEach(enemy => {

            if (!enemy.alive) return;

            if (
                this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y
            ) {

                // Mario menginjak musuh
                if (
                    this.player.vy > 0 &&
                    this.player.y +
                    this.player.height -
                    this.player.vy <= enemy.y + 10
                ) {

                    enemy.alive = false;
                    this.player.vy = -8;
                    this.score += 50;
                    this.playSound('hit');

                } else {

                    // Mario terkena musuh
                    if (this.player.big) {

                        this.player.makeSmall();

                    } else {

                        this.respawnPlayer();
                        return;
                    }
                }
            }
        });

        } // tutup checkCollisions()


        respawnPlayer() {
            this.sounds.bgm.pause();
            this.sounds.bgm.currentTime = 0;

            this.playSound('die');

            this.lives--;

            // GAME OVER
            if (this.lives <= 0) {
                this.stop();

                setTimeout(() => {
                    alert('GAME OVER');
                }, 100);

                return;
            }

            // Reset map
            this.map.reset();

            this.area = 'overworld';
            this.map.area = 'overworld';

            // Reset Mario
            this.player.resetPosition();

            // Reset kamera
            this.cameraX = 0;

            // Reset keyboard
            this.keys = {};

            // Reset timer
            this.time = 400;
            this.lastTimerUpdate = performance.now();

            // Reset kondisi finish
            this.flagReached = false;
            this.finishState = 'playing';
            this.playerVisible = true;

            this.isPaused = false;
            this.isMuted = false;

            this.sounds.bgm.currentTime = 0;
            this.sounds.bgm.play().catch(() => {});
        }

        startWorld12() {

            this.currentWorld = '1-2';
            this.area = 'world1-2';
            this.map.area = 'world1-2';

            this.finishState = 'playing';
            this.flagReached = false;
            this.playerVisible = true;

            // DATA WORLD 1-2
            this.world12 = new World12();

            // sementara map memakai data World 1-2
            this.map.worldWidth =
                this.world12.worldWidth;

            this.map.platforms =
                this.world12.platforms;

            this.map.blocks =
                this.world12.blocks;

            this.map.coins =
                this.world12.coins;

            this.map.pipes =
                this.world12.pipes;

            this.map.enemies =
                this.world12.enemies;

            // Mario mulai dari kiri
            this.player.x = 80;
            this.player.y =
                360 - this.player.height;

            this.player.vy = 0;
            this.player.onGround = true;

            this.cameraX = 0;

            this.time = 400;
            this.lastTimerUpdate =
                performance.now();

            this.keys = {};

            // sementara pakai mode underground
            this.map.area = 'underground';
        }


    update() {

    if (!this.isRunning) return;
    if (this.isPaused) return;

    if (this.pipeTransition) return;

    // =========================
    // UPDATE MARIO
    // =========================

    if (this.finishState === 'playing') {
        this.player.update(
            this.keys,
            this.map
        );
    }

    // =========================
    // SCORE DARI BLOK
    // =========================

        if (this.map.pendingScore > 0) {
            this.score += this.map.pendingScore;

            this.addCoin(
    Math.floor(this.map.pendingScore / 10)
);

            this.map.pendingScore = 0;
        }

        if (this.map.pendingEnemyScore > 0) {
            this.score += this.map.pendingEnemyScore;
            this.map.pendingEnemyScore = 0;
        }


        // =========================
        // UPDATE MUSUH
        // =========================

        this.map.updateEnemies();


        // =========================
        // UPDATE BONUS
        // =========================

        this.map.updatePowerups();
        this.map.updateDebris();

        // =========================
        // MASUK PIPA
        // =========================

        if (
            this.area === 'overworld' &&
            this.keys['ArrowDown']
        ) {
            const pipe = this.map.pipes.find(pipe => {

                if (!pipe.enterable) return false;

                const playerCenter =
                    this.player.x + this.player.width / 2;

                return (
                    playerCenter > pipe.x &&
                    playerCenter < pipe.x + pipe.width &&
                    Math.abs(
                        this.player.y + this.player.height - pipe.y
                    ) < 5
                );
            });

            if (pipe && !this.pipeTransition) {

                this.pipeTransition = true;
                this.keys = {};

                // Mario turun ke dalam pipa
                const enterPipe = setInterval(() => {

                    this.player.y += 2;

                    if (
                        this.player.y >=
                        pipe.y + 20
                    ) {
                        clearInterval(enterPipe);

                        this.area = 'underground';
                        this.map.area = 'underground';

                        this.player.x = 100;
                        this.player.y =
                            360 - this.player.height;

                        this.player.vy = 0;
                        this.player.onGround = true;

                        this.cameraX = 0;

                        this.pipeTransition = false;
                    }

                }, 16);
            }
        }

        // =========================
        // KELUAR DARI UNDERGROUND
        // =========================

        if (
            this.area === 'underground' &&
            this.keys['ArrowDown']
        ) {
            const pipe = this.map.undergroundExit;

            const playerCenter =
                this.player.x + this.player.width / 2;

            const onPipe =
                playerCenter > pipe.x &&
                playerCenter < pipe.x + pipe.width &&
                Math.abs(
                    this.player.y + this.player.height - pipe.y
                ) < 6;

            if (onPipe && !this.pipeTransition) {

                this.pipeTransition = true;
                this.keys = {};

                // Mario turun ke pipa underground
                const exitPipe = setInterval(() => {

                    this.player.y += 2;

                    if (
                        this.player.y >=
                        pipe.y + 20
                    ) {
                        clearInterval(exitPipe);

                        // Kembali ke overworld
                        this.area = 'overworld';
                        this.map.area = 'overworld';

                        const overworldPipe =
                            this.map.pipes.find(
                                p => p.exitOnly
                            );

                        this.player.x =
                            overworldPipe.x +
                            overworldPipe.width / 2 -
                            this.player.width / 2;

                        // Mario tersembunyi di dalam pipa
                        this.player.y =
                            overworldPipe.y + 10;

                        this.player.vy = 0;
                        this.player.onGround = false;

                        this.cameraX =
                            Math.max(
                                0,
                                this.player.x -
                                this.canvas.width / 2
                            );

                        // Mario muncul ke atas
                        const targetY =
                            overworldPipe.y -
                            this.player.height;

                        const emergePipe = setInterval(() => {

                            this.player.y -= 2;

                            if (this.player.y <= targetY) {

                                clearInterval(emergePipe);

                                this.player.y = targetY;
                                this.player.vy = 0;
                                this.player.onGround = true;

                                this.pipeTransition = false;
                                this.keys = {};
                            }

                        }, 16);
                    }

                }, 16);
            }
        }


        // =========================
        // COLLISION
        // =========================

        this.checkCollisions();

        // =========================
        // FINISH WORLD 1-1
        // =========================

        const goal = this.map.goal;

        // -------------------------
        // 1. MARIO MENYENTUH TIANG
        // -------------------------
        if (this.finishState === 'playing') {

            const touchPole =
                this.player.x + this.player.width >= goal.x &&
                this.player.x <= goal.x + 20 &&
                this.player.y + this.player.height >= goal.y &&
                this.player.y <= goal.y + goal.height;

            if (touchPole) {

                this.finishState = 'pole';

                this.sounds.bgm.pause();

                this.playSound('win');

                this.flagReached = true;

                this.score += 1000;

                // Tempel Mario pada tiang
                this.player.x =
                    goal.x - this.player.width + 5;

                this.player.vy = 0;
            }
        }


        // -------------------------
        // 2. TURUN DI TIANG
        // -------------------------
        if (this.finishState === 'pole') {

            // Kunci posisi X Mario
            this.player.x =
                goal.x - this.player.width + 5;

            this.player.vy = 0;

            // Mario turun
            this.player.y += 2;

            // Bendera ikut turun
            if (
                goal.flagY <
                goal.flagTargetY
            ) {
                goal.flagY += 2;
            }

            // Sampai tanah
            const groundY =
                360 - this.player.height;

            if (this.player.y >= groundY) {

                this.player.y = groundY;

                this.finishState = 'walkCastle';

                this.player.facing = 1;
            }
        }


        // -------------------------
        // 3. JALAN OTOMATIS
        // -------------------------
        if (this.finishState === 'walkCastle') {

            this.player.x += 2;

            this.player.facing = 1;

            this.player.onGround = true;
            this.player.isMoving = true;

            // Masuk pintu castle
            if (
                this.player.x >=
                this.map.castle.x + 60
            ) {
                this.playerVisible = false;
                this.finishState = 'finished';

                setTimeout(() => {
                    this.stop();

                    alert(
                        'WORLD 1-1 SELESAI!\nSCORE: ' +
                        this.score
                    );
                }, 700);
            }
        }



        // =========================
        // JATUH KE LUBANG
        // =========================

        if (
            this.finishState === 'playing' &&
            this.player.y > this.canvas.height + 100
        ) {
            this.respawnPlayer();
        }


        // =========================
        // CAMERA
        // =========================

        const maxCamera =
            Math.max(
                0,
                this.map.worldWidth -
                this.canvas.width
            );

        this.cameraX =
            Math.max(
                0,

                Math.min(
                    this.player.x -
                    this.canvas.width / 2,

                    maxCamera
                )
            );
    }


    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // =========================
        // MAP
        // =========================

        this.map.draw(
            this.ctx,
            this.cameraX
        );


        // =========================
        // MARIO
        // =========================

        if (this.playerVisible) {
            this.player.draw(
                this.ctx,
                this.cameraX
            );
        }


        // =========================
        // HUD
        // =========================

        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.font = 'bold 16px monospace';

        // MARIO
        this.ctx.fillText(
            'MARIO',
            25,
            25
        );

        this.ctx.fillText(
            String(this.score).padStart(6, '0'),
            25,
            45
        );

        // COIN
        this.ctx.fillText(
            '× ' + this.coinCount,
            200,
            45
        );

        // WORLD
        this.ctx.fillText(
            'WORLD',
            350,
            25
        );

        this.ctx.fillText(
            '1-1',
            365,
            45
        );

        // TIME
        this.ctx.fillText(
            'TIME',
            520,
            25
        );

        this.ctx.fillText(
            String(this.time).padStart(3, '0'),
            525,
            45
        );

        this.ctx.fillText(
            '× ' + this.lives,
            120,
            45
        );

        if (this.isPaused) {
            this.ctx.fillStyle =
                'rgba(0, 0, 0, 0.55)';

            this.ctx.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );

            this.ctx.fillStyle = '#ffffff';

            this.ctx.font =
                'bold 30px monospace';

            this.ctx.textAlign = 'center';

            this.ctx.fillText(
                'PAUSED',
                this.canvas.width / 2,
                this.canvas.height / 2
            );

            this.ctx.font =
                '16px monospace';

            this.ctx.fillText(
                'P = CONTINUE   M = MUTE',
                this.canvas.width / 2,
                this.canvas.height / 2 + 35
            );

            this.ctx.textAlign = 'left';
        }

        if (this.isPaused) {
            this.ctx.fillStyle =
                'rgba(0, 0, 0, 0.55)';

            this.ctx.fillRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );

            this.ctx.fillStyle = '#ffffff';

            this.ctx.font =
                'bold 30px monospace';

            this.ctx.textAlign = 'center';

            this.ctx.fillText(
                'PAUSED',
                this.canvas.width / 2,
                this.canvas.height / 2
            );

            this.ctx.font =
                '16px monospace';

            this.ctx.fillText(
                'P = CONTINUE   M = MUTE',
                this.canvas.width / 2,
                this.canvas.height / 2 + 35
            );

            this.ctx.textAlign = 'left';
        }
    }


    loop() {

        if (!this.isRunning) return;

        // =========================
        // TIMER
        // =========================

        if (
            this.finishState === 'playing' &&
            !this.isPaused
        ) {

            const now = performance.now();

            if (
                now - this.lastTimerUpdate >= 1000
            ) {
                this.time--;

                this.lastTimerUpdate = now;

                if (this.time <= 0) {
                    this.time = 0;
                    this.respawnPlayer();

                    if (this.isRunning) {
                        this.time = 400;
                        this.lastTimerUpdate =
                            performance.now();
                    }

                    return;
                }
            }
        }

        this.update();

        this.draw();

        requestAnimationFrame(
            () => this.loop()
        );
    }
}


function loadMarioGame() {

    window.marioGameInstance =
        new MarioGame(
            'canvas-placeholder'
        );

    window.marioGameInstance.start();
}