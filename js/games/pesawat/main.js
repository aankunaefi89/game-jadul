// js/games/pesawat/main.js

let activePesawatGame = null;

function loadPesawatGame() {
    // Bersihkan placeholder dan jalankan game di dalam canvas-placeholder
    const container = document.getElementById("canvas-placeholder");
    container.innerHTML = ""; // Kosongkan teks "Memuat Permainan..."

    // Mulai game pesawat
    activePesawatGame = new PesawatGame("canvas-placeholder");
    activePesawatGame.start();
    
    // Set skor global awal (untuk integrasi dengan leaderboard nanti)
    globalScore = 0;
    globalLevel = 1;
}

// Override fungsi backToMenu bawaan atau pastikan game berhenti saat keluar
const originalBackToMenu = window.backToMenu;
window.backToMenu = function() {
    if (activePesawatGame) {
        activePesawatGame.stop();
        activePesawatGame = null;
    }
    if (typeof originalBackToMenu === 'function') {
        originalBackToMenu();
    }
};