import * as THREE from 'three';

export class EnergyOrbs {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;
        this.orbs = [];
        this.spawnRadius = 100;
        this.maxOrbs = 20;
        this.lastPlayerPos = new THREE.Vector3();
        this.spawnThreshold = 40;
        
        // Create shared geometry and material for all orbs
        this.geometry = new THREE.SphereGeometry(0.5, 8, 8);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        // Initialize with default position
        this.generateInitialOrbs();

        // Add collection effect properties
        this.collectionEffects = [];
        this.playerCollectionRadius = 20; // Larger radius for player
        this.aiCollectionRadius = 2.5;    // Smaller radius for AI ships
        this.attractionRadius = 25;       // Adjusted attraction radius
        this.collectionCooldown = new Map();
    }

    generateInitialOrbs() {
        const count = this.maxOrbs;
        for (let i = 0; i < count; i++) {
            this.spawnOrb(new THREE.Vector3(0, 0, 0));
        }
    }

    spawnOrb(centerPos = new THREE.Vector3(0, 0, 0)) {
        // Ensure centerPos is a Vector3
        if (!(centerPos instanceof THREE.Vector3)) {
            console.warn('Invalid centerPos, using default position');
            centerPos = new THREE.Vector3(0, 0, 0);
        }

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = this.spawnRadius * (0.3 + Math.random() * 0.7);

        const position = new THREE.Vector3(
            centerPos.x + r * Math.sin(phi) * Math.cos(theta),
            centerPos.y + r * Math.sin(phi) * Math.sin(theta),
            centerPos.z + r * Math.cos(phi)
        );

        const orb = new THREE.Mesh(this.geometry, this.material);
        orb.position.copy(position);
        this.orbs.push(orb);
        this.scene.add(orb);
        
        // Store reference in gameState
        this.gameState.energyOrbs = this;
        
        return orb;
    }

    update(playerPosition) {
        if (!playerPosition) {
            console.warn('Invalid player position in EnergyOrbs update');
            return;
        }

        // Check collisions with all spaceships
        this.checkCollisions();
        
        // Update attraction effects
        this.updateAttractionEffects();
        
        // Maintain orb field
        this.maintainOrbField(playerPosition);
        
        // Update collection effects
        this.updateCollectionEffects();
    }

    maintainOrbField(playerPosition) {
        // Add new orbs if we're below the maximum
        while (this.orbs.length < this.maxOrbs) {
            this.spawnOrb(playerPosition);
        }
    }

    checkCollisions() {
        if (!this.gameState.spaceships) return;
        const now = Date.now();

        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const orb = this.orbs[i];
            
            this.gameState.spaceships.forEach((ship, shipIndex) => {
                if (!ship.position) return;
                
                // Check cooldown
                const lastCollection = this.collectionCooldown.get(ship) || 0;
                if (now - lastCollection < 500) return;

                const distance = ship.position.distanceTo(orb.position);
                // Use different collection radius for player vs AI
                const effectiveRadius = shipIndex === 0 ? 
                    this.playerCollectionRadius : this.aiCollectionRadius;
                
                if (distance < effectiveRadius) {
                    // Remove the orb
                    this.scene.remove(orb);
                    this.orbs.splice(i, 1);
                    
                    // Create collection effect
                    this.createCollectionEffect(orb.position.clone());
                    
                    // Update collection cooldown
                    this.collectionCooldown.set(ship, now);
                    
                    // Update game state - both player and AI get points
                    if (shipIndex === 0) {
                        this.gameState.score += 100;
                    } else {
                        ship.score += 100;
                    }
                    ship.collect(20);
                    
                    return;
                }
            });
        }
    }

    updateAttractionEffects() {
        const player = this.gameState.spaceships[0];
        if (!player || !player.position || !player.magneticFieldActive) return;

        this.orbs.forEach(orb => {
            const distance = player.position.distanceTo(orb.position);
            if (distance < this.attractionRadius) {
                const direction = new THREE.Vector3().subVectors(player.position, orb.position);
                direction.normalize();
                const force = (1 - distance / this.attractionRadius) * 0.5;
                orb.position.add(direction.multiplyScalar(force));
            }
        });
    }

    createCollectionEffect(position) {
        const geometry = new THREE.RingGeometry(0, 2, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        const effect = new THREE.Mesh(geometry, material);
        effect.position.copy(position);
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