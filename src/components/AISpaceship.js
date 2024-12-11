import { Spaceship } from './Spaceship.js';
import * as THREE from 'three';

export class AISpaceship extends Spaceship {
    constructor(scene, gameState, soundManager, position, index) {
        super(scene, gameState, soundManager);
        
        // AI ship colors (darker versions)
        const aiColors = [
            0x990066,  // Darker pink
            0x006633,  // Darker green
            0x994400   // Darker orange
        ];

        // Set the AI ship color
        this.setColor(aiColors[index]);
        
        // Set initial position
        if (position) {
            this.position.copy(position);
        }
        
        // AI-specific properties
        this.detectionRadius = 40 + (index * 5);
        this.state = 'seeking';
        this.target = null;
        this.wanderInterval = 3000 - (index * 200);
        this.lastWanderTime = 0;
        this.personalSpace = 15;
        this.score = 0;
        
        // Adjust AI ship capabilities
        this.maxSpeed = 0.6;
        this.collectionRadius = 2.5;
        this.collectionCooldown = 0;
        this.minCollectionInterval = 1000;
        
        // AI behavior update interval
        this.updateInterval = setInterval(() => this.updateBehavior(), 1000);
    }

    collect(amount) {
        const now = Date.now();
        if (now - this.collectionCooldown < this.minCollectionInterval) {
            return; // Skip collection if on cooldown
        }
        
        super.collect(amount);
        this.collectionCooldown = now;
        
        // Visual feedback for AI collection
        if (this.engineGlow) {
            const originalIntensity = this.engineGlow.intensity;
            this.engineGlow.intensity = 2.0;
            setTimeout(() => {
                this.engineGlow.intensity = originalIntensity;
            }, 200);
        }
    }

    updateBehavior() {
        // Find nearest orb and player
        const nearestOrb = this.findNearestOrb();
        const nearestShip = this.findNearestShip();

        // More aggressive orb collection behavior
        if (nearestShip && nearestShip.distance < this.personalSpace) {
            this.state = 'evading';
            this.target = nearestShip.position;
        } else if (nearestOrb) {
            this.state = 'pursuing';
            this.target = nearestOrb.position;
            // Activate magnetic field when close to orbs (if available)
            if (this.gameState.magneticFieldActive !== undefined && 
                this.position.distanceTo(nearestOrb.position) < 20) {
                this.gameState.magneticFieldActive = true;
            }
        } else {
            this.state = 'seeking';
            if (!this.target || Date.now() - this.lastWanderTime > this.wanderInterval) {
                this.target = this.getRandomPosition();
                this.lastWanderTime = Date.now();
            }
        }
    }

    update() {
        super.update();

        // Execute behavior based on state
        switch (this.state) {
            case 'evading':
                this.evade();
                break;
            case 'pursuing':
                this.pursue();
                break;
            case 'seeking':
                this.explore();
                break;
        }
    }

    pursue() {
        if (!this.target) return;
        const direction = new THREE.Vector3().subVectors(this.target, this.position);
        direction.normalize();
        this.accelerate(direction);
    }

    explore() {
        if (!this.target) {
            this.target = this.getRandomPosition();
        }
        this.pursue();
    }

    getRandomPosition() {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 50;
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 20, // Some vertical variation
            Math.sin(angle) * radius
        );
    }

    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        super.dispose();
    }

    findNearestOrb() {
        if (!this.gameState.energyOrbs || !this.gameState.energyOrbs.orbs) {
            return null;
        }

        let nearestOrb = null;
        let nearestDistance = Infinity;

        this.gameState.energyOrbs.orbs.forEach(orb => {
            const distance = this.position.distanceTo(orb.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestOrb = orb;
            }
        });

        return nearestOrb;
    }

    findNearestShip() {
        let nearest = null;
        let minDistance = Infinity;

        this.gameState.spaceships.forEach(ship => {
            if (ship === this) return;
            const distance = this.position.distanceTo(ship.position);
            if (distance < this.detectionRadius && distance < minDistance) {
                nearest = ship;
                minDistance = distance;
            }
        });

        return nearest ? { position: nearest.position, distance: minDistance } : null;
    }

    evade() {
        if (!this.target) return;
        const direction = new THREE.Vector3().subVectors(this.position, this.target);
        direction.normalize();
        this.accelerate(direction);
    }
} 