export class UIController {
    constructor(gameState, soundManager) {
        this.gameState = gameState;
        this.soundManager = soundManager;
        this.startTime = 0;
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        // HUD elements
        this.scoreElement = document.getElementById('score-value');
        this.timerElement = document.getElementById('timer-value');
        this.energyFill = document.getElementById('energy-fill');
        this.shieldStatus = document.getElementById('shield-ready');

        // Menu elements
        this.startMenu = document.getElementById('start-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverMenu = document.getElementById('game-over');
        this.finalScore = document.getElementById('final-score');
        this.finalTime = document.getElementById('final-time');

        // Add camera controls help
        const cameraHelp = document.createElement('div');
        cameraHelp.className = 'camera-controls';
        cameraHelp.innerHTML = `
            <h3>Camera Controls:</h3>
            <p>Right Click + Mouse: Rotate View</p>
            <p>Mouse Wheel: Zoom</p>
            <p>Q/E: Rotate Left/Right</p>
            <p>R/F: Rotate Up/Down</p>
            <p>C: Reset Camera</p>
        `;
        document.body.appendChild(cameraHelp);

        // Update controls help text
        const controlsHelp = document.createElement('div');
        controlsHelp.className = 'controls-help';
        controlsHelp.innerHTML = `
            <h3>Controls:</h3>
            <p>W/S: Move Forward/Backward</p>
            <p>A/D: Strafe Left/Right</p>
            <p>Space: Activate Shield</p>
            <p>Click + Drag: Change View</p>
            <p>Mouse Wheel: Zoom</p>
        `;
        document.body.appendChild(controlsHelp);
    }

    setupEventListeners() {
        // Start game
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });

        // Pause/Resume
        document.getElementById('resume').addEventListener('click', () => {
            this.togglePause();
        });

        // Restart
        document.getElementById('restart').addEventListener('click', () => {
            this.restartGame();
        });

        // ESC key for pause
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState.gameStarted) {
                this.togglePause();
            }
        });

        // Game over menu buttons
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
            this.gameOverMenu.classList.add('hidden');
        });

        document.getElementById('return-menu').addEventListener('click', () => {
            this.returnToMainMenu();
        });
    }

    startGame() {
        this.startMenu.classList.add('hidden');
        this.gameState.gameStarted = true;
        this.gameState.paused = false;
        this.gameState.gameOver = false;
        this.gameState.score = 0;
        this.gameState.energy = 100;
        this.gameState.shieldActive = false;
        this.startTime = Date.now();
        this.soundManager.startBackgroundMusic();
    }

    togglePause() {
        this.gameState.paused = !this.gameState.paused;
        this.pauseMenu.classList.toggle('hidden');
    }

    restartGame() {
        this.gameState.score = 0;
        this.gameState.energy = 100;
        this.startTime = Date.now();
        this.gameState.paused = false;
        this.pauseMenu.classList.add('hidden');
        // Additional reset logic can be added here
    }

    returnToMainMenu() {
        this.gameOverMenu.classList.add('hidden');
        this.startMenu.classList.remove('hidden');
        this.resetGame();
    }

    resetGame() {
        this.gameState.gameStarted = false;
        this.gameState.gameOver = false;
        this.gameState.score = 0;
        this.gameState.energy = 100;
        this.gameState.shieldActive = false;
        
        // Reset game objects
        this.resetGameObjects();
    }

    showGameOver() {
        this.finalScore.textContent = this.gameState.score;
        this.finalTime.textContent = this.timerElement.textContent;
        this.gameOverMenu.classList.remove('hidden');
    }

    update() {
        if (!this.gameState.gameStarted) return;

        if (this.gameState.gameOver) {
            this.showGameOver();
            return;
        }

        // Update score
        this.scoreElement.textContent = this.gameState.score;

        // Update timer
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update energy bar
        this.energyFill.style.width = `${this.gameState.energy}%`;

        // Update shield status
        this.shieldStatus.textContent = this.gameState.shieldActive ? 'Active' : 'Ready';
    }
} 