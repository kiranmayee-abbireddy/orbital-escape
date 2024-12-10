import * as THREE from '../../node_modules/three/build/three.module.js';

export class EngineEffects {
    constructor(scene, spaceship) {
        this.scene = scene;
        this.spaceship = spaceship;
        
        // Create engine glow
        const engineGlowGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
        this.engineGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        
        this.engineGlow = new THREE.Mesh(engineGlowGeometry, this.engineGlowMaterial);
        this.engineGlow.position.z = 1.2; // Position behind spaceship
        this.engineGlow.rotation.x = Math.PI; // Rotate to point backward
        
        // Create particle system for engine trail
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        
        this.particlePositions = new Float32Array(particleCount * 3);
        this.particleVelocities = [];
        this.particleLifetimes = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particleVelocities.push(new THREE.Vector3());
            this.particleLifetimes.push(0);
        }
        
        particleGeometry.setAttribute('position', 
            new THREE.BufferAttribute(this.particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
        
        // Add engine glow to spaceship
        this.spaceship.mesh.add(this.engineGlow);
    }
    
    update() {
        const velocity = this.spaceship.velocity;
        const speed = velocity.length();
        
        // Update engine glow based on speed
        this.engineGlow.visible = speed > 0.01;
        this.engineGlowMaterial.opacity = Math.min(speed * 2, 0.6);
        
        // Update particle system
        const positions = this.particles.geometry.attributes.position.array;
        const spaceshipPos = this.spaceship.getPosition();
        
        for (let i = 0; i < positions.length; i += 3) {
            if (this.particleLifetimes[i/3] <= 0 && speed > 0.01) {
                // Spawn new particle
                positions[i] = spaceshipPos.x;
                positions[i+1] = spaceshipPos.y;
                positions[i+2] = spaceshipPos.z;
                
                this.particleVelocities[i/3].copy(velocity)
                    .multiplyScalar(-1)
                    .add(new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1
                    ));
                
                this.particleLifetimes[i/3] = 1.0;
            } else {
                // Update existing particle
                positions[i] += this.particleVelocities[i/3].x * 0.1;
                positions[i+1] += this.particleVelocities[i/3].y * 0.1;
                positions[i+2] += this.particleVelocities[i/3].z * 0.1;
                this.particleLifetimes[i/3] -= 0.02;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    dispose() {
        this.engineGlow.geometry.dispose();
        this.engineGlowMaterial.dispose();
        this.particles.geometry.dispose();
        this.particles.material.dispose();
        this.scene.remove(this.particles);
        this.spaceship.mesh.remove(this.engineGlow);
    }
} 