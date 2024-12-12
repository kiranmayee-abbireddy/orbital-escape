import * as THREE from 'three';
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
    score: 0,
    energy: 100,
    gameStarted: false,
    gameOver: false,
    paused: false,
    shieldActive: false,
    spaceships: [], // Array to hold all ships (player + AI)
    aiCount: 3
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Initialize game components
const soundManager = new SoundManager();
const uiController = new UIController(gameState, soundManager);

// After scene setup and before animation loop
const aiCount = 3; // Number of AI ships
gameState.aiCount = aiCount;
gameState.spaceships = [];

// Initialize player spaceship first
const spaceship = new Spaceship(scene, gameState, soundManager);
gameState.spaceships.push(spaceship);

// Initialize AI spaceships
for (let i = 0; i < aiCount; i++) {
    const randomPosition = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    const aiShip = new AISpaceship(scene, gameState, soundManager, randomPosition, i);
    gameState.spaceships.push(aiShip);
}

// Initialize other game components with the player spaceship
const inputHandler = new InputHandler(spaceship);
const cameraController = new CameraController(camera, spaceship);
const engineEffects = new EngineEffects(scene, spaceship);
const asteroidField = new AsteroidField(scene);
const energyOrbs = new EnergyOrbs(scene, gameState);
gameState.energyOrbs = energyOrbs;
const starField = new StarField(scene);
const skybox = new Skybox(scene);
const spaceEffects = new SpaceEffects(scene);

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// After scene setup
camera.position.set(0, 5, 10); // Set initial camera position
camera.lookAt(0, 0, 0);

// After initializing components
// Make sure spaceship is added to scene
spaceship.addToScene(scene);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!gameState.paused && gameState.gameStarted && !gameState.gameOver) {
        // Update game components
        inputHandler.update();
        
        // Check for asteroid collisions before updating player position
        if (spaceship.checkAsteroidCollision(asteroidField.getAsteroids())) {
            if (!gameState.shieldActive) {
                // Create explosion at ship's position
                createExplosion(spaceship.position);
                
                // Trigger game over
                gameState.gameOver = true;
                uiController.showGameOver();
                
                // Play explosion sound
                soundManager.playSound('explosion');
                
                // Stop background music
                soundManager.stopBackgroundMusic();
            }
        }

        // Continue with normal updates if no collision or shield is active
        spaceship.update();
        cameraController.update();
        asteroidField.update(spaceship.getPosition());
        energyOrbs.update(spaceship.getPosition());
        starField.update(camera, performance.now() * 0.001);
        engineEffects.update(spaceship.velocity);
        skybox.update(camera);
        spaceEffects.update();
        uiController.update();
        
        // Update AI spaceships
        gameState.spaceships.forEach(ship => {
            if (ship !== spaceship) {
                ship.update();
            }
        });
    }
    
    renderer.render(scene, camera);
}

// Start animation loop
animate();

// Add explosion effect
function createExplosion(position) {
    const particleCount = 30;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        
        // Random direction
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.2 + Math.random() * 0.3;
        
        particle.velocity = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi)
        ).multiplyScalar(speed);
        
        particle.position.copy(position);
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate explosion
    function animateExplosion() {
        particles.children.forEach((particle, index) => {
            particle.position.add(particle.velocity);
            particle.material.opacity -= 0.02;
            
            if (particle.material.opacity <= 0) {
                particles.remove(particle);
                if (particles.children.length === 0) {
                    scene.remove(particles);
                }
            }
        });
        
        if (particles.children.length > 0) {
            requestAnimationFrame(animateExplosion);
        }
    }
    
    animateExplosion();
}
