// =======================================================
// TETRIS MAIN CONTROLLER
// =======================================================

let tetrisGame = null;

function initTetris() {
    if (!tetrisGame) {
        tetrisGame = new TetrisGameEngine();
    }
    tetrisGame.init();
}

function stopTetris() {
    if (tetrisGame) {
        tetrisGame.cleanup();
    }
}