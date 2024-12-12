import * as THREE from 'three';

export class UIController {
    constructor(gameState, soundManager) {
        this.gameState = gameState;
        this.soundManager = soundManager;
        
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
        this.energyFill = document.getElementById('energy-fill');
        this.shieldStatus = document.getElementById('shield-ready');
        this.startMenu = document.getElementById('start-menu');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverMenu = document.getElementById('game-over');
        this.finalScore = document.getElementById('final-score');
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
                this.startGame();
            });
        }

        // Only keep Main Menu button handler
        const returnMenuButton = document.getElementById('return-menu');
        if (returnMenuButton) {
            returnMenuButton.addEventListener('click', () => {
                this.returnToMainMenu();
            });
        }

        // ESC key for pause
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState.gameStarted && !this.gameState.gameOver) {
                this.togglePause();
            }
        });
    }

    startGame() {
        console.log('Starting game...'); 
        
        // Hide all menus
        this.startMenu.classList.add('hidden');
        this.gameOverMenu.classList.add('hidden');

        // Generate new AI names only when starting a new game
        this.generateNewAINames();
        this.setupLeaderboard();

        // Reset game state
        this.gameState.gameStarted = true;
        this.gameState.paused = false;
        this.gameState.gameOver = false;
        this.gameState.score = 0;
        this.gameState.energy = 100;

        // Reset all spaceships with random positions
        this.gameState.spaceships.forEach((ship, index) => {
            if (ship.reset) {
                if (index === 0) {
                    // Player ship starts at a random position away from center
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 50;
                    const startPos = new THREE.Vector3(
                        Math.cos(angle) * radius,
                        (Math.random() - 0.5) * 20,
                        Math.sin(angle) * radius
                    );
                    ship.reset(startPos);
                } else {
                    // AI ships get random positions
                    const randomPos = new THREE.Vector3(
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100
                    );
                    ship.reset(randomPos);
                }
            }
        });

        // Start background music
        if (this.soundManager) {
            this.soundManager.startBackgroundMusic();
        }
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

    returnToMainMenu() {
        // Hide game over menu and show start menu
        this.gameOverMenu.classList.add('hidden');
        this.startMenu.classList.remove('hidden');
        
        // Reset game state
        this.gameState.gameOver = false;
        this.gameState.gameStarted = false;
        this.gameState.paused = false;
        
        // Reset all game objects
        this.resetGame();
        
        // Stop background music
        if (this.soundManager) {
            this.soundManager.stopBackgroundMusic();
        }
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
        this.gameOverMenu.classList.remove('hidden');
        // Only show final score from rankings
        const playerScore = this.rankings.find(r => r.isPlayer)?.score || 0;
        this.finalScore.textContent = playerScore;
    }

    update() {
        if (!this.gameState.gameStarted) return;

        if (this.gameState.gameStarted && !this.gameState.paused) {
            this.updateLeaderboard();
            this.updateEnergyBar();
            this.updateShieldStatus();
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

    updateEnergyBar() {
        if (this.energyFill) {
            this.energyFill.style.width = `${this.gameState.energy}%`;
        }
    }

    updateShieldStatus() {
        if (this.shieldStatus) {
            this.shieldStatus.textContent = this.gameState.shieldActive ? 'Active' : 'Ready';
        }
    }
} 