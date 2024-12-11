export class UIController {
    constructor(gameState, soundManager) {
        this.gameState = gameState;
        this.soundManager = soundManager;
        this.startTime = 0;
        
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // Update every 100ms instead of every frame
        
        // Fixed positions for AI pilots
        this.aiPilots = [
            { name: "Stark", score: 0 },
            { name: "Zuck", score: 0 },
            { name: "Alia", score: 0 }
        ];
        
        this.currentAINames = [];
        this.rankings = [];
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        // Get all UI elements
        this.scoreElement = document.getElementById('score-value');
        this.timerElement = document.getElementById('timer-value');
        this.energyFill = document.getElementById('energy-fill');
        this.shieldStatus = document.getElementById('shield-ready');
        this.startMenu = document.getElementById('start-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverMenu = document.getElementById('game-over');
        this.finalScore = document.getElementById('final-score');
        this.finalTime = document.getElementById('final-time');
        this.rankingsList = document.getElementById('rankings-list');
        this.playerNameInput = document.getElementById('player-name');
        
        // Ensure all elements exist
        if (!this.startMenu || !this.pauseMenu || !this.gameOverMenu) {
            console.error('Required UI elements not found');
        }
    }

    setupEventListeners() {
        // Start game button
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start button clicked'); // Debug log
                this.startGame();
            });
        } else {
            console.error('Start button not found');
        }

        // Pause menu buttons
        const resumeButton = document.getElementById('resume');
        const restartButton = document.getElementById('restart');
        if (resumeButton) resumeButton.addEventListener('click', () => this.togglePause());
        if (restartButton) restartButton.addEventListener('click', () => this.restartGame());

        // Game over menu buttons
        const restartGameButton = document.getElementById('restart-game');
        const returnMenuButton = document.getElementById('return-menu');
        if (restartGameButton) {
            restartGameButton.addEventListener('click', () => {
                this.restartGame();
                this.gameOverMenu.classList.add('hidden');
            });
        }
        if (returnMenuButton) {
            returnMenuButton.addEventListener('click', () => this.returnToMainMenu());
        }

        // ESC key for pause
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState.gameStarted) {
                this.togglePause();
            }
        });
    }

    startGame() {
        console.log('Starting game...'); 
        
        // Hide start menu
        if (this.startMenu) {
            this.startMenu.classList.add('hidden');
        }

        // Generate new AI names only when starting a new game
        this.generateNewAINames();
        this.setupLeaderboard();

        // Reset game state
        this.gameState.gameStarted = true;
        this.gameState.paused = false;
        this.gameState.gameOver = false;
        this.gameState.score = 0;
        this.gameState.energy = 100;
        this.startTime = Date.now();

        // Start background music
        if (this.soundManager) {
            this.soundManager.startBackgroundMusic();
        }

        // Reset all game objects
        this.resetGameObjects();
    }

    generateNewAINames() {
        // Reset scores but keep names in fixed positions
        this.currentAINames = this.aiPilots.map(pilot => ({
            name: pilot.name,
            score: 0
        }));
    }

    setupLeaderboard() {
        // Initialize rankings with fixed positions
        this.rankings = [
            { id: 0, name: this.playerNameInput?.value || 'Player', score: 0, isPlayer: true, position: 0 },
            ...this.currentAINames
        ];
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
        // Don't regenerate AI names here, only reset scores
        this.gameState.gameStarted = false;
        this.gameState.gameOver = false;
        this.gameState.score = 0;
        this.gameState.energy = 100;
        
        // Reset game objects
        this.resetGameObjects();
        
        // Reset scores but keep the same names
        if (this.rankings) {
            this.rankings.forEach(rank => {
                rank.score = 0;
            });
        }
    }

    showGameOver() {
        this.finalScore.textContent = this.gameState.score;
        this.finalTime.textContent = this.timerElement.textContent;
        this.gameOverMenu.classList.remove('hidden');
    }

    update() {
        if (!this.gameState.gameStarted) return;

        // Update score
        if (this.scoreElement) {
            this.scoreElement.textContent = this.gameState.score;
        }

        // Update timer
        if (this.timerElement) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update energy bar
        if (this.energyFill) {
            this.energyFill.style.width = `${this.gameState.energy}%`;
        }

        // Update shield status
        if (this.shieldStatus) {
            this.shieldStatus.textContent = this.gameState.shieldActive ? 'Active' : 'Ready';
        }

        // Show game over screen if needed
        if (this.gameState.gameOver) {
            this.showGameOver();
        }

        if (this.gameState.gameStarted && !this.gameState.paused) {
            this.updateLeaderboard();
        }
    }

    resetGameObjects() {
        if (this.gameState.spaceships) {
            // Reset player ship position
            const playerShip = this.gameState.spaceships[0];
            if (playerShip) {
                playerShip.position.set(0, 0, 0);
                playerShip.velocity.set(0, 0, 0);
            }

            // Reset AI ships
            for (let i = 1; i < this.gameState.spaceships.length; i++) {
                const aiShip = this.gameState.spaceships[i];
                if (aiShip) {
                    // Randomize AI ship positions
                    aiShip.position.set(
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100
                    );
                    aiShip.velocity.set(0, 0, 0);
                }
            }
        }

        // Reset other game objects
        if (typeof this.resetAsteroids === 'function') {
            this.resetAsteroids();
        }
        if (typeof this.resetEnergyOrbs === 'function') {
            this.resetEnergyOrbs();
        }
    }

    updateLeaderboard() {
        if (!this.gameState.gameStarted) return;

        // Update scores while keeping positions fixed
        if (this.gameState.spaceships) {
            // Update player score
            this.rankings[0].score = this.gameState.score;
            
            // Update AI scores
            for (let i = 1; i < this.rankings.length; i++) {
                const aiShip = this.gameState.spaceships[i];
                if (aiShip) {
                    this.rankings[i].score = aiShip.score;
                }
            }

            // Find highest score
            const highestScore = Math.max(...this.rankings.map(r => r.score));

            // Update display with fixed positions
            if (this.rankingsList) {
                const newHTML = this.rankings.map((rank, index) => {
                    const formattedScore = rank.score.toString().padStart(6, '0');
                    const isHighest = rank.score === highestScore && rank.score > 0;
                    
                    // Determine ship icon class based on index
                    let shipIconClass = rank.isPlayer ? 'player-ship' : `ai-ship-${index}`;
                    
                    return `
                        <div class="ranking-item ${rank.isPlayer ? 'player' : ''} ${isHighest ? 'highest-score' : ''}">
                            <div class="position">
                                <span class="ship-icon ${shipIconClass}">🚀</span>
                            </div>
                            <div class="name">${rank.name}</div>
                            <div class="score">${formattedScore}</div>
                        </div>
                    `;
                }).join('');

                this.rankingsList.innerHTML = newHTML;
            }
        }
    }
} 