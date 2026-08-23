// js/games/snake/input.js

class InputHandler {
    constructor(game) {
        this.game = game;
        this.startX = 0;
        this.startY = 0;

        // 1. KONTROL KEYBOARD (PC)
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault(); 
            }
            this.handleInput(e.key);
        });

        // 2. KONTROL SENTUH & USAP (HP)
        const touchZone = document.getElementById("touch-zone");
        if (touchZone) {
            touchZone.addEventListener("touchstart", (e) => {
                if (e.target.tagName === 'CANVAS') e.preventDefault();
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            }, { passive: false });

            touchZone.addEventListener("touchmove", (e) => {
                if (this.game.isGameOver || !this.startX || !this.startY) return;
                if (e.target.tagName === 'CANVAS') e.preventDefault();

                let diffX = e.touches[0].clientX - this.startX;
                let diffY = e.touches[0].clientY - this.startY;

                if (Math.abs(diffX) > 15 || Math.abs(diffY) > 15) {
                    if (Math.abs(diffX) > Math.abs(diffY)) {
                        this.handleInput(diffX > 0 ? 'ArrowRight' : 'ArrowLeft');
                    } else {
                        this.handleInput(diffY > 0 ? 'ArrowDown' : 'ArrowUp');
                    }
                    this.startX = 0;
                    this.startY = 0;
                }
            }, { passive: false });
        }

        // 3. KONTROL D-PAD LAYAR (Jika tombol ditekan)
        const btnUp = document.getElementById("btn-up");
        const btnDown = document.getElementById("btn-down");
        const btnLeft = document.getElementById("btn-left");
        const btnRight = document.getElementById("btn-right");

        if (btnUp) btnUp.onpointerdown = (e) => { e.preventDefault(); this.handleInput('ArrowUp'); };
        if (btnDown) btnDown.onpointerdown = (e) => { e.preventDefault(); this.handleInput('ArrowDown'); };
        if (btnLeft) btnLeft.onpointerdown = (e) => { e.preventDefault(); this.handleInput('ArrowLeft'); };
        if (btnRight) btnRight.onpointerdown = (e) => { e.preventDefault(); this.handleInput('ArrowRight'); };
    }

    handleInput(key) {
        if (this.game.isGameOver) return;
        
        // Pastikan ular tidak bisa mundur menabrak badannya sendiri
        if (key === "ArrowLeft" && this.game.player.dx === 0) { 
            this.game.player.dx = -this.game.gridSize; 
            this.game.player.dy = 0; 
        }
        if (key === "ArrowUp" && this.game.player.dy === 0) { 
            this.game.player.dx = 0; 
            this.game.player.dy = -this.game.gridSize; 
        }
        if (key === "ArrowRight" && this.game.player.dx === 0) { 
            this.game.player.dx = this.game.gridSize; 
            this.game.player.dy = 0; 
        }
        if (key === "ArrowDown" && this.game.player.dy === 0) { 
            this.game.player.dx = 0; 
            this.game.player.dy = this.game.gridSize; 
        }
    }
}