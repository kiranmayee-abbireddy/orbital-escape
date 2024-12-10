import * as THREE from './node_modules/three/build/three.module.js';
import { Spaceship } from './src/components/Spaceship.js';
import { InputHandler } from './src/components/InputHandler.js';
import { CameraController } from './src/components/CameraController.js';
import { UIController } from './src/components/UIController.js';
import { AsteroidField } from './src/components/AsteroidField.js';
import { EnergyOrbs } from './src/components/EnergyOrbs.js';
import { StarField } from './src/components/StarField.js';
import { EngineEffects } from './src/components/EngineEffects.js';
import { SoundManager } from './src/components/SoundManager.js';
import { Skybox } from './src/components/Skybox.js';
import { SpaceEffects } from './src/components/SpaceEffects.js';
import { AISpaceship } from './src/components/AISpaceship.js';

// Game state
const gameState = {
    paused: false,
    gameStarted: false,
    score: 0,
    energy: 100,
    shieldActive: false,
    gameOver: false,
    magneticFieldActive: false,
    spaceships: [], // Array to hold all spaceships including player
    aiCount: 3, // Number of AI opponents
    energyOrbs: null // Add this line
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Space black background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create starfield
const starField = new StarField(scene, 2000);
const skybox = new Skybox(scene);
const spaceEffects = new SpaceEffects(scene);

// Create sound manager and add listener to camera
const soundManager = new SoundManager();
camera.add(soundManager.listener);

// Create energy orbs first
const energyOrbs = new EnergyOrbs(scene, gameState);
gameState.energyOrbs = energyOrbs; // Store reference in game state

// Create spaceship
const spaceship = new Spaceship(scene, gameState, soundManager);
spaceship.setPosition(0, 0, 0);
gameState.spaceships.push(spaceship);

// Create engine effects
const engineEffects = new EngineEffects(scene, spaceship);

// Create camera controller
const cameraController = new CameraController(camera, spaceship);

// Create input handler
const inputHandler = new InputHandler(spaceship);

// Create UI controller
const uiController = new UIController(gameState, soundManager);

// Create asteroid field
const asteroidField = new AsteroidField(scene, 50, 150);

// Create AI spaceships
const aiColors = [0xff0000, 0x00ff00, 0x0000ff]; // Different colors for each AI
for (let i = 0; i < gameState.aiCount; i++) {
    const aiShip = new AISpaceship(scene, gameState, soundManager, aiColors[i]);
    const angle = (i / gameState.aiCount) * Math.PI * 2;
    aiShip.setPosition(
        Math.cos(angle) * 30,
        0,
        Math.sin(angle) * 30
    );
    gameState.spaceships.push(aiShip);
}

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    const time = Date.now() * 0.001;
    
    requestAnimationFrame(animate);
    
    if (gameState.gameStarted && !gameState.paused && !gameState.gameOver) {
        inputHandler.update();
        spaceship.update();
        engineEffects.update();
        soundManager.updateEngineSound(spaceship.velocity);
        cameraController.update();
        uiController.update();
        asteroidField.update(spaceship.getPosition());
        energyOrbs.update(time, spaceship.getPosition());
        energyOrbs.checkCollisions(spaceship, gameState);
        spaceship.checkCollisions(asteroidField.getAsteroids());
        starField.update(camera, time);
        skybox.update(camera);
        spaceEffects.update();
        gameState.spaceships.forEach(ship => {
            if (ship !== spaceship) { // Skip player ship as it's already updated
                ship.update();
            }
        });
    }
    
    renderer.render(scene, camera);
}

animate();

// Export necessary variables for other modules
export { scene, camera, renderer, gameState, spaceship, uiController, inputHandler, asteroidField, energyOrbs, starField, engineEffects, soundManager };
