import * as THREE from '../../node_modules/three/build/three.module.js';

export class EnergyOrbs {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;
        this.orbs = [];
        this.spawnRadius = 100;
        this.maxOrbs = 20;
        this.lastPlayerPos = new THREE.Vector3();
        this.spawnThreshold = 40;
        this.spaceship = null;
        
        // Create shared geometry and material for all orbs
        this.geometry = new THREE.SphereGeometry(0.5, 8, 8);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        // Create glow effect material
        this.glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        this.glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2
        });

        // Add collection effect properties
        this.collectionEffects = [];
        
        // Create collection effect material
        this.effectMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        this.generateInitialOrbs();
    }

    generateInitialOrbs() {
        const count = this.maxOrbs;
        for (let i = 0; i < count; i++) {
            this.spawnOrb(new THREE.Vector3(0, 0, 0));
        }
    }

    spawnOrb(centerPos) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = this.spawnRadius * (0.3 + Math.random() * 0.7);

        const position = new THREE.Vector3(
            centerPos.x + r * Math.sin(phi) * Math.cos(theta),
            centerPos.y + r * Math.sin(phi) * Math.sin(theta),
            centerPos.z + r * Math.cos(phi)
        );

        const orb = new THREE.Mesh(this.geometry, this.material);
        const glow = new THREE.Mesh(this.glowGeometry, this.glowMaterial);
        
        orb.position.copy(position);
        glow.position.copy(position);
        
        orb.add(glow);
        this.orbs.push(orb);
        this.scene.add(orb);
        return orb;
    }

    update(time, playerPosition) {
        const spaceshipPos = this.gameState.spaceships[0].position;
        const attractionRadius = 40; // Larger radius for initial attraction
        const collectionRadius = 5; // Smaller radius for actual collection

        this.orbs.forEach(orb => {
            const distance = spaceshipPos.distanceTo(orb.position);
            
            // Attraction zone
            if (distance < attractionRadius) {
                const direction = new THREE.Vector3().subVectors(spaceshipPos, orb.position);
                direction.normalize();
                
                // Exponential attraction force (stronger as orbs get closer)
                const force = Math.pow(1 - distance / attractionRadius, 2) * 0.5;
                orb.position.add(direction.multiplyScalar(force));
                
                // Make orbs glow brighter and spin faster when being attracted
                orb.rotation.y += 0.1;
                orb.material.opacity = Math.min(1, 0.8 + force);
                if (orb.children[0]) {
                    orb.children[0].material.opacity = Math.min(1, 0.4 + force);
                    orb.children[0].scale.setScalar(1 + force);
                }
            }
        });

        // Update collection effects
        this.updateCollectionEffects();

        // Check for collection and maintain orb field
        this.checkCollisions(collectionRadius);
        this.maintainOrbField(playerPosition);
    }

    maintainOrbField(playerPosition) {
        // Add new orbs if we're below the maximum
        while (this.orbs.length < this.maxOrbs) {
            this.spawnOrb(playerPosition);
        }
    }

    // Check for collision with spaceship and collect orb
    checkCollisions(collectionRadius) {
        this.gameState.spaceships.forEach(ship => {
            const shipPos = ship.position;
            this.orbs.forEach((orb, index) => {
                if (shipPos.distanceTo(orb.position) < collectionRadius) {
                    // Call collect on the ship
                    ship.collect(10);
                    
                    // Create collection effect
                    this.createCollectionEffect(orb.position.clone());
                    
                    // Remove the orb
                    this.scene.remove(orb);
                    this.orbs.splice(index, 1);
                    
                    // Only update score for player collection (first ship)
                    if (ship === this.gameState.spaceships[0]) {
                        // Update game state with bonus for quick collection
                        const speedBonus = Math.floor(ship.velocity.length() * 5);
                        this.gameState.score += 10 + speedBonus;
                    }
                }
            });
        });
    }

    createCollectionEffect(position) {
        const geometry = new THREE.RingGeometry(0, 2, 16);
        const effect = new THREE.Mesh(geometry, this.effectMaterial.clone());
        effect.position.copy(position);
        effect.material.opacity = 1;
        effect.scale.setScalar(0.1);
        effect.life = 1.0;
        this.scene.add(effect);
        this.collectionEffects.push(effect);
    }

    updateCollectionEffects() {
        for (let i = this.collectionEffects.length - 1; i >= 0; i--) {
            const effect = this.collectionEffects[i];
            effect.life -= 0.05;
            effect.scale.setScalar(1 - effect.life);
            effect.material.opacity = effect.life;
            
            if (effect.life <= 0) {
                this.scene.remove(effect);
                effect.geometry.dispose();
                effect.material.dispose();
                this.collectionEffects.splice(i, 1);
            }
        }
    }

    // Clean up resources
    dispose() {
        this.orbs.forEach(orb => {
            this.scene.remove(orb);
        });
        this.geometry.dispose();
        this.material.dispose();
        this.glowGeometry.dispose();
        this.glowMaterial.dispose();
        this.orbs = [];
    }

    setSpaceship(spaceship) {
        this.spaceship = spaceship;
        this.gameState = spaceship.gameState;
    }
} 