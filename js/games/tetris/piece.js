// =======================================================
// TETRIS PIECE MODULE
// =======================================================

class TetrisPiece {
    constructor(ctx, blockSize) {
        this.ctx = ctx;
        this.blockSize = blockSize;
    }

    // Ubah fungsi ini agar menerima ID spesifik dari Game Engine
    spawnPiece(id) {
        this.typeId = id;
        this.shape = TETRIS_CONFIG.shapes[this.typeId];
        this.color = TETRIS_CONFIG.colors[this.typeId];

        // Posisi awal di tengah atas papan
        this.x = Math.floor((TETRIS_CONFIG.cols - this.shape[0].length) / 2);
        this.y = 0;
    }

    draw() {
        for (let r = 0; r < this.shape.length; r++) {
            for (let c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c] !== 0) {
                    let drawX = (this.x + c) * this.blockSize;
                    let drawY = (this.y + r) * this.blockSize;

                    this.ctx.fillStyle = this.color;
                    this.ctx.fillRect(drawX, drawY, this.blockSize - 1, this.blockSize - 1);

                    // Efek mengkilap pada blok aktif
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(drawX, drawY, this.blockSize - 1, 3);
                }
            }
        }
    }

    moveLeft() { this.x--; }
    moveRight() { this.x++; }
    moveDown() { this.y++; }

    rotate() {
        const N = this.shape.length;
        let ret = Array.from({ length: N }, () => Array(N).fill(0));
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                ret[c][N - 1 - r] = this.shape[r][c];
            }
        }
        this.shape = ret;
    }
}