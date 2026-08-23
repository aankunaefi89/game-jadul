// =======================================================
// PACMAN MAIN LOADER & UI HANDLER
// =======================================================

let pacmanGameInstance = null;

function cleanupPacmanMemory() {
    if (pacmanGameInstance) {
        pacmanGameInstance.cleanup();
        pacmanGameInstance = null;
    }
}

function loadPacmanGame() {
    cleanupPacmanMemory();

    const placeholder = document.getElementById("canvas-placeholder");
    placeholder.innerHTML = `
        <div id="touch-zone"
            style="
                position:relative;
                width:100%;
                max-width:462px;
                aspect-ratio:1/1;
                margin:auto;
                display:flex;
                justify-content:center;
                align-items:center;">
        
            <canvas
                id="pacmanCanvas"
                width="462"
                height="462"
                style="
                    width:100%;
                    height:100%;
                    background:#000;
                    border:2px solid #3d85c6;
                    box-sizing:border-box;">
            </canvas>

            <div id="pacman-overlay"
                style="
                    display:none;
                    position:absolute;
                    inset:0;
                    background:rgba(0,0,0,.85);
                    color:white;
                    justify-content:center;
                    align-items:center;
                    flex-direction:column;
                    z-index:100;">

                <h2>GAME OVER</h2>
                <div>Score : <span id="pacman-final-score">0</span></div>
                <br>
                <div class="input-box-area">
                    <input id="player-name-input" maxlength="12" placeholder="Nama Kamu">
                    <button onclick="submitScore()">KIRIM</button>
                </div>
                <br>
                <button onclick="window.startPacman()">MAIN LAGI</button>
            </div>
        </div>

        <div id="mobile-pad" style="display:none;">
            <button id="btn-up">▲</button>
            <div class="pad-middle">
                <button id="btn-left">◀</button>
                <button id="btn-down">▼</button>
                <button id="btn-right">▶</button>
            </div>
        </div>

        <div id="pacman-info" style="color:white; text-align:center; margin-top:8px; font-weight:bold;">
            ❤️ <span id="pc-lives">3</span> &nbsp;&nbsp;
            ⭐ <span id="pc-level">1</span> &nbsp;&nbsp;
            🎯 <span id="pc-score">0</span>
        </div>
    `;

    pacmanGameInstance = new PacmanGameEngine();
    pacmanGameInstance.init();

    // Setup Mobile Controller Style & Events
    const mobile = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    const pad = document.getElementById("mobile-pad");

    if (mobile && pad) {
        pad.style.display = "flex";
        pad.style.position = "relative";
        pad.style.flexDirection = "column";
        pad.style.alignItems = "center";
        pad.style.justifyContent = "center";
        pad.style.gap = "12px";
        pad.style.width = "100%";
        pad.style.marginTop = "10px";
        pad.style.marginBottom = "10px";

        const middle = pad.querySelector(".pad-middle");
        if (middle) {
            middle.style.display = "flex";
            middle.style.gap = "12px";
        }

        pad.querySelectorAll("button").forEach(btn => {
            btn.style.width = "75px";
            btn.style.height = "75px";
            btn.style.borderRadius = "50%";
            btn.style.border = "none";
            btn.style.fontSize = "24px";
            btn.style.background = "rgba(50, 120, 255, 0.35)"; // Transparan
            btn.style.color = "white";
            btn.style.backdropFilter = "blur(4px)";
            btn.style.cursor = "pointer";
        });

        // Event touch tombol transparan
        document.getElementById("btn-left").addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (pacmanGameInstance && pacmanGameInstance.player) pacmanGameInstance.player.dir = "left";
        });
        document.getElementById("btn-right").addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (pacmanGameInstance && pacmanGameInstance.player) pacmanGameInstance.player.dir = "right";
        });
        document.getElementById("btn-up").addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (pacmanGameInstance && pacmanGameInstance.player) pacmanGameInstance.player.dir = "up";
        });
        document.getElementById("btn-down").addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (pacmanGameInstance && pacmanGameInstance.player) pacmanGameInstance.player.dir = "down";
        });
    }
}

window.startPacman = function () {
    if (!pacmanGameInstance) return;
    document.getElementById("pacman-overlay").style.display = "none";
    document.getElementById("pc-score").innerText = "0";
    document.getElementById("pc-level").innerText = "1";
    document.getElementById("pc-lives").innerText = "3";
    pacmanGameInstance.init();
};