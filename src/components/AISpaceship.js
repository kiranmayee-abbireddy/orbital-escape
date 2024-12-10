import { Spaceship } from './Spaceship.js';
import * as THREE from '../../node_modules/three/build/three.module.js';

export class AISpaceship extends Spaceship {
    constructor(scene, gameState, soundManager, color = 0xff0000) {
        super(scene, gameState, soundManager);
        
        // AI specific properties
        this.target = null;
        this.state = 'seeking'; // seeking, collecting, evading
        this.detectionRadius = 50;
        this.personalSpace = 15;
        this.lastStateChange = Date.now();
        this.stateTimeout = 3000; // Time before AI can change states

        // Set colors after the model is created in the parent constructor
        this.setColors(color);
    }

    setColors(color) {
        // Set main ship color
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(color);
        }
        
        // Set engine glow color
        if (this.engineGlow && this.engineGlow.material) {
            this.engineGlow.material.color.setHex(color);
        }

        // Set tractor beam color if it exists
        if (this.tractorBeam && this.tractorBeam.material) {
            this.tractorBeam.material.color.setHex(color);
        }
    }

    update() {
        super.update();
        this.updateAI();
    }

    updateAI() {
        const now = Date.now();
        if (now - this.lastStateChange < this.stateTimeout) return;

        // Find nearest orb and player
        const nearestOrb = this.findNearestOrb();
        const nearestShip = this.findNearestShip();

        // Update AI state based on situation
        if (nearestShip && nearestShip.distance < this.personalSpace) {
            this.state = 'evading';
            this.target = nearestShip.position;
        } else if (nearestOrb) {
            this.state = 'collecting';
            this.target = nearestOrb.position;
        } else {
            this.state = 'seeking';
            this.target = this.getRandomPosition();
        }

        // Execute behavior based on state
        switch (this.state) {
            case 'evading':
                this.evade();
                break;
            case 'collecting':
                this.pursue();
                break;
            case 'seeking':
                this.explore();
                break;
        }
    }

    findNearestOrb() {
        let nearest = null;
        let minDistance = Infinity;

        this.gameState.energyOrbs.orbs.forEach(orb => {
            const distance = this.position.distanceTo(orb.position);
            if (distance < this.detectionRadius && distance < minDistance) {
                nearest = orb;
                minDistance = distance;
            }
        });

        return nearest ? { position: nearest.position, distance: minDistance } : null;
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

    pursue() {
        if (!this.target) return;
        const direction = new THREE.Vector3().subVectors(this.target, this.position);
        direction.normalize();
        this.accelerate(direction);
    }

    explore() {
        if (!this.target || this.position.distanceTo(this.target) < 5) {
            this.target = this.getRandomPosition();
        }
        this.pursue();
    }

    getRandomPosition() {
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 50;
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }
} 