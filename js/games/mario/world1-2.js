class World12 {

    constructor() {

        this.worldWidth = 5200;

        this.platforms = [];
        this.blocks = [];
        this.coins = [];
        this.pipes = [];
        this.enemies = [];

        this.setup();
    }

    setup() {

        // =========================
        // GROUND
        // =========================

        this.platforms = [
            { x: 0, y: 360, width: 5200, height: 40 }
        ];

        // =========================
        // BLOCKS / CEILING
        // =========================

        this.blocks = [];

        // Ceiling awal
        for (let x = 0; x < 900; x += 30) {
            this.blocks.push({
                x: x,
                y: 60,
                type: 'brick'
            });
        }

        // Platform brick pertama
        for (let x = 300; x <= 600; x += 30) {
            this.blocks.push({
                x: x,
                y: 270,
                type: 'brick'
            });
        }

        // Platform kedua
        for (let x = 850; x <= 1060; x += 30) {
            this.blocks.push({
                x: x,
                y: 240,
                type: 'brick'
            });
        }

        // =========================
        // COINS
        // =========================

        this.coins = [
            { x: 330, y: 220, collected: false },
            { x: 390, y: 220, collected: false },
            { x: 450, y: 220, collected: false },
            { x: 510, y: 220, collected: false },
            { x: 570, y: 220, collected: false },

            { x: 880, y: 190, collected: false },
            { x: 940, y: 190, collected: false },
            { x: 1000, y: 190, collected: false }
        ];

        // =========================
        // PIPES
        // =========================

        this.pipes = [
            {
                x: 1250,
                y: 300,
                width: 50,
                height: 60
            },

            {
                x: 1900,
                y: 270,
                width: 50,
                height: 90
            }
        ];

        // =========================
        // ENEMIES
        // =========================

        this.enemies = [
            {
                x: 700,
                y: 330,
                width: 30,
                height: 30,
                vx: -1,
                alive: true,
                minX: 650,
                maxX: 800
            },

            {
                x: 1450,
                y: 330,
                width: 30,
                height: 30,
                vx: -1,
                alive: true,
                minX: 1350,
                maxX: 1600
            }
        ];
    }
}