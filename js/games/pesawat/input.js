// =======================================================
// PESAWAT INPUT HANDLER (PC & MOBILE TOUCH)
// =======================================================

class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        
        this.touchX = 0;
        this.touchY = 0;
        this.isTouching = false;

        // 1. Keyboard PC
        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });

        window.addEventListener('keyup', e => {
            const index = this.keys.indexOf(e.key);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
        });

        // 2. Sentuhan Layar HP
        window.addEventListener('touchstart', e => {
            if (e.target.tagName === 'CANVAS') {
                this.isTouching = true;
                this.updateTouchPos(e, e.target);
            }
        }, { passive: false });

        window.addEventListener('touchmove', e => {
            if (e.target.tagName === 'CANVAS' && this.isTouching) {
                e.preventDefault(); // Mencegah layar HP ikut ter-scroll saat bermain
                this.updateTouchPos(e, e.target);
            }
        }, { passive: false });

        window.addEventListener('touchend', e => {
            if (e.target.tagName === 'CANVAS') {
                this.isTouching = false;
            }
        }, { passive: false });
    }

    updateTouchPos(e, canvas) {
        if (e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            
            // Hitung rasio ukuran asli kanvas vs ukuran tampilan di HP
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // Sesuaikan koordinat sentuhan dengan rasio
            this.touchX = (e.touches[0].clientX - rect.left) * scaleX;
            // Offset -60 agar pesawat berada tepat di atas jempol (tidak tertutup)
            this.touchY = ((e.touches[0].clientY - rect.top) * scaleY) - 60; 
        }
    }
}