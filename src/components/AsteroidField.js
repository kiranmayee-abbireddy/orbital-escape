import * as THREE from 'three';

export class AsteroidField {
    constructor(scene, count = 50, spawnRadius = 150) {
        this.scene = scene;
        this.asteroids = [];
        this.spawnRadius = spawnRadius;
        this.maxAsteroids = count;
        this.lastPlayerPos = new THREE.Vector3();
        this.spawnThreshold = 50; // Distance to move before checking for new asteroids
        
        // Create asteroid geometries of different sizes
        this.geometries = [
            new THREE.IcosahedronGeometry(1, 0),  // Small
            new THREE.IcosahedronGeometry(2, 0),  // Medium
            new THREE.IcosahedronGeometry(3, 0)   // Large
        ];

        // Create asteroid material
        this.material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true
        });

        this.generateInitialAsteroids();
    }

    generateInitialAsteroids() {
        const count = this.maxAsteroids;
        for (let i = 0; i < count; i++) {
            this.spawnAsteroid(new THREE.Vector3(0, 0, 0));
        }
    }

    spawnAsteroid(centerPos) {
        // Random position within spawn radius around center position
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = this.spawnRadius * (0.3 + Math.random() * 0.7);

        const position = new THREE.Vector3(
            centerPos.x + r * Math.sin(phi) * Math.cos(theta),
            centerPos.y + r * Math.sin(phi) * Math.sin(theta),
            centerPos.z + r * Math.cos(phi)
        );

        // Random geometry
        const geometry = this.geometries[Math.floor(Math.random() * this.geometries.length)];
        const asteroid = new THREE.Mesh(geometry, this.material);
        
        asteroid.position.copy(position);
        
        // Random rotation
        asteroid.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        // Random rotation speed
        asteroid.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        this.asteroids.push(asteroid);
        this.scene.add(asteroid);
        return asteroid;
    }

    update(playerPosition) {
        // Check if player has moved enough to spawn new asteroids
        if (playerPosition.distanceTo(this.lastPlayerPos) > this.spawnThreshold) {
            this.maintainAsteroidField(playerPosition);
            this.lastPlayerPos.copy(playerPosition);
        }

        // Update asteroid rotations
        this.asteroids.forEach(asteroid => {
            asteroid.rotation.x += asteroid.rotationSpeed.x;
            asteroid.rotation.y += asteroid.rotationSpeed.y;
            asteroid.rotation.z += asteroid.rotationSpeed.z;
            
            // Remove asteroids that are too far from the player
            if (asteroid.position.distanceTo(playerPosition) > this.spawnRadius * 2) {
                this.scene.remove(asteroid);
                this.asteroids = this.asteroids.filter(a => a !== asteroid);
            }
        });
    }

    maintainAsteroidField(playerPosition) {
        // Add new asteroids if we're below the maximum
        while (this.asteroids.length < this.maxAsteroids) {
            this.spawnAsteroid(playerPosition);
        }
    }

    // Get all asteroid positions for collision detection
    getAsteroids() {
        return this.asteroids;
    }

    // Clean up resources
    dispose() {
        this.asteroids.forEach(asteroid => {
            this.scene.remove(asteroid);
            asteroid.geometry.dispose();
        });
        this.material.dispose();
        this.asteroids = [];
    }

    createAsteroid() {
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 30,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        const scale = 1 + Math.random() * 2;
        mesh.scale.set(scale, scale, scale);
        
        // Random position
        mesh.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        
        // Create asteroid object with position directly accessible
        const asteroid = {
            position: mesh.position,
            scale: mesh.scale,
            mesh: mesh
        };
        
        this.scene.add(mesh);
        return asteroid;
    }
} 