// =======================================================
// TETRIS BOARD MODULE
// =======================================================

class TetrisBoard {
    constructor(ctx, cols, rows, blockSize) {
        this.ctx = ctx;
        this.cols = cols;
        this.rows = rows;
        this.blockSize = blockSize;
        this.grid = this.getEmptyGrid();
    }

    getEmptyGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    reset() {
        this.grid = this.getEmptyGrid();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Gambar grid yang sudah terkunci
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] > 0) {
                    this.drawBlock(c, r, TETRIS_CONFIG.colors[this.grid[r][c]]);
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
        
        // Efek mengkilap sederhana pada balok
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, 3);
    }

    isInside(x, y) {
        return x >= 0 && x < this.cols && y < this.rows;
    }

    isOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] !== 0;
    }

    isValidMove(pieceShape, offsetX, offsetY) {
        for (let r = 0; r < pieceShape.length; r++) {
            for (let c = 0; c < pieceShape[r].length; c++) {
                if (pieceShape[r][c] !== 0) {
                    let newX = c + offsetX;
                    let newY = r + offsetY;

                    if (!this.isInside(newX, newY)) return false;
                    if (newY >= 0 && this.isOccupied(newX, newY)) return false;
                }
            }
        }
        return true;
    }

    lockPiece(piece) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c] !== 0) {
                    let boardX = c + piece.x;
                    let boardY = r + piece.y;
                    if (boardY >= 0) {
                        this.grid[boardY][boardX] = piece.shape[r][c];
                    }
                }
            }
        }
    }

    clearLines() {
        let clearedRows = [];

        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell !== 0)) {
                clearedRows.push(r); // Simpan koordinat Y baris yang hancur
                this.grid.splice(r, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                r++; // Cek ulang baris yang sama setelah digeser
            }
        }

        return clearedRows; // Mengembalikan array, bukan sekadar angka
    }
}