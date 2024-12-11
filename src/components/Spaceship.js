import * as THREE from '../../../libs/three/build/three.module.js';

export class Spaceship {
    constructor(scene, gameState, soundManager) {
        this.scene = scene;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = 0.5;
        this.drag = 0.95;
        this.gameState = gameState;
        this.collisionRadius = 1.5; // Radius for collision detection
        this.invulnerable = false;
        this.blinkDuration = 1500; // Duration of invulnerability in ms
        this.blinkInterval = null;
        this.soundManager = soundManager;
        this.forwardDirection = new THREE.Vector3(0, 0, 1);
        this.moveForward = false;
        this.moveBackward = false;
        this.cameraQuaternion = new THREE.Quaternion();
        this.magneticRadius = 15;
        this.magneticForce = 0.5;
        this.moveLeft = false;
        this.moveRight = false;

        // Tractor beam properties
        this.tractorBeamActive = false;
        this.tractorBeamRange = 20;
        this.tractorBeamForce = 0.2;
        
        this.createModel();
        this.addToScene();
    }

    createModel() {
        // Create UFO body (main disc)
        const bodyGeometry = new THREE.Group();
        
        // Main disc
        const discGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        const discMaterial = new THREE.MeshPhongMaterial({
            color: 0x3366ff,
            shininess: 100,
            emissive: 0x112244
        });
        const disc = new THREE.Mesh(discGeometry, discMaterial);
        
        // Dome (top)
        const domeGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshPhongMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.9,
            shininess: 150,
            emissive: 0x112244
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = 0.25;

        // Bottom rim
        const rimGeometry = new THREE.TorusGeometry(2, 0.2, 16, 32);
        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0x4477ff,
            shininess: 80,
            emissive: 0x112244
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.y = -0.25;
        rim.rotation.x = Math.PI / 2;

        // Create running lights around the rim
        const lightCount = 8;
        const lights = new THREE.Group();
        for (let i = 0; i < lightCount; i++) {
            const angle = (i / lightCount) * Math.PI * 2;
            const light = new THREE.PointLight(0x00ffff, 0.5, 3);
            light.position.set(
                Math.cos(angle) * 2,
                -0.25,
                Math.sin(angle) * 2
            );
            lights.add(light);

            // Add small glowing spheres at light positions
            const glowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
            glowSphere.position.copy(light.position);
            lights.add(glowSphere);
        }

        // Engine glow (bottom center)
        const engineGlow = new THREE.PointLight(0x00ffff, 1, 5);
        engineGlow.position.y = -0.5;
        
        // Assemble the UFO
        this.mesh = new THREE.Group();
        this.mesh.add(disc);
        this.mesh.add(dome);
        this.mesh.add(rim);
        this.mesh.add(lights);
        this.mesh.add(engineGlow);

        // Create shield effect (invisible by default)
        const shieldGeometry = new THREE.SphereGeometry(3, 32, 32);
        const shieldMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.shield.visible = false;
        this.mesh.add(this.shield);

        // Store references for animation
        this.lights = lights;
        this.engineGlow = engineGlow;

        // Create tractor beam effect
        const beamGeometry = new THREE.CylinderGeometry(3, 0.5, 15, 16, 1, true);
        this.tractorBeamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        this.tractorBeam = new THREE.Mesh(beamGeometry, this.tractorBeamMaterial);
        this.tractorBeam.rotation.x = Math.PI / 2;
        this.tractorBeam.position.y = -7.5;
        this.tractorBeam.visible = false;
        this.mesh.add(this.tractorBeam);

        // Add collection range indicator
        const collectionRangeGeometry = new THREE.TorusGeometry(20, 0.1, 8, 64);
        const collectionRangeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        this.collectionRange = new THREE.Mesh(collectionRangeGeometry, collectionRangeMaterial);
        this.collectionRange.rotation.x = Math.PI / 2; // Make it horizontal
        this.mesh.add(this.collectionRange);
    }

    addToScene() {
        this.scene.add(this.mesh);
    }

    update() {
        // Get camera's forward and right vectors for movement relative to view
        const cameraForward = new THREE.Vector3(0, 0, -1);
        const cameraRight = new THREE.Vector3(1, 0, 0);
        const cameraUp = new THREE.Vector3(0, 1, 0); // Add up vector
        
        cameraForward.applyQuaternion(this.cameraQuaternion);
        cameraRight.applyQuaternion(this.cameraQuaternion);
        // No need to apply quaternion to up vector as we want world-space vertical movement
        
        // Calculate movement direction based on input
        const moveDirection = new THREE.Vector3(0, 0, 0);
        if (this.moveForward) moveDirection.add(cameraForward);
        if (this.moveBackward) moveDirection.sub(cameraForward);
        if (this.moveRight) moveDirection.add(cameraRight);
        if (this.moveLeft) moveDirection.sub(cameraRight);
        if (this.moveUp) moveDirection.add(cameraUp);     // Add vertical movement
        if (this.moveDown) moveDirection.sub(cameraUp);   // Add vertical movement

        // Apply movement if there is input
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            this.velocity.add(moveDirection.multiplyScalar(0.02));
        }

        // Apply velocity to position
        this.position.add(this.velocity.clone());
        
        // Update mesh position
        this.mesh.position.copy(this.position);
        
        // Apply drag to slow down
        this.velocity.multiplyScalar(0.98);
        
        // Update effects
        if (this.gameState.magneticFieldActive) {
            this.updateMagneticFieldEffect();
        }
        if (this.gameState.shieldActive) {
            this.updateShieldEffect();
        }

        // Add UFO-specific effects
        // Rotate the running lights
        if (this.lights) {
            this.lights.rotation.y += 0.02;
        }

        // Pulse the engine glow based on velocity
        if (this.engineGlow) {
            const speed = this.velocity.length();
            this.engineGlow.intensity = 0.5 + speed * 2;
        }

        // Rotate tractor beam effect
        if (this.tractorBeamActive) {
            this.tractorBeamMaterial.opacity = 0.2 + Math.sin(Date.now() * 0.005) * 0.1;
            this.tractorBeam.rotation.y += 0.02;
        }

        // Pulse the collection range indicator
        if (this.collectionRange) {
            this.collectionRange.material.opacity = 0.1 + Math.sin(Date.now() * 0.003) * 0.05;
            this.collectionRange.rotation.z += 0.01; // Slow rotation for visual effect
        }
    }

    accelerate(direction) {
        // Convert direction from local to world space for horizontal movement
        const worldDirection = new THREE.Vector3();
        
        // Handle vertical movement directly (y-axis)
        const verticalMovement = direction.y;
        direction.y = 0; // Remove vertical component for horizontal movement
        
        // Convert horizontal movement to world space
        worldDirection.copy(direction).applyQuaternion(this.mesh.quaternion);
        
        // Add back vertical movement
        worldDirection.y = verticalMovement;
        
        // Apply acceleration
        const acceleration = worldDirection.multiplyScalar(0.02);
        this.velocity.add(acceleration);
        
        // Limit speed
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }
    }

    activateShield() {
        if (this.gameState.shieldActive) return;
        this.shield.visible = true;
        this.gameState.shieldActive = true;
        this.soundManager.playSound('shield');
        setTimeout(() => {
            this.shield.visible = false;
            this.gameState.shieldActive = false;
        }, 2000);
    }

    getPosition() {
        return this.mesh.position;
    }

    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
        this.position.set(x, y, z);
    }

    checkCollisions(asteroids) {
        if (this.gameState.shieldActive) return;

        const spaceshipPos = this.getPosition();
        const collisionRadius = 2;

        // Check collisions with other spaceships
        this.gameState.spaceships.forEach(otherShip => {
            if (otherShip === this) return;
            
            const distance = spaceshipPos.distanceTo(otherShip.position);
            if (distance < collisionRadius * 2) {
                // Collision response
                const direction = new THREE.Vector3().subVectors(spaceshipPos, otherShip.position).normalize();
                this.velocity.add(direction.multiplyScalar(0.5));
                otherShip.velocity.sub(direction.multiplyScalar(0.5));
                
                // Damage both ships
                this.gameState.energy = Math.max(0, this.gameState.energy - 20);
                if (this.soundManager) {
                    this.soundManager.playSound('collision');
                }
            }
        });

        for (const asteroid of asteroids) {
            const distance = spaceshipPos.distanceTo(asteroid.position);
            if (distance < collisionRadius) {
                this.gameState.energy -= 20;
                this.soundManager.playSound('collision');
                
                if (this.gameState.energy <= 0) {
                    this.gameState.energy = 0;
                    this.gameState.gameOver = true;
                }
                break;
            }
        }
    }

    handleCollision() {
        // Reduce energy
        this.gameState.energy = Math.max(0, this.gameState.energy - 25);

        // Make invulnerable temporarily
        this.invulnerable = true;

        // Blink effect
        this.blinkInterval = setInterval(() => {
            this.mesh.visible = !this.mesh.visible;
        }, 100);

        // Reset after duration
        setTimeout(() => {
            this.invulnerable = false;
            clearInterval(this.blinkInterval);
            this.mesh.visible = true;
        }, this.blinkDuration);

        // Check for game over
        if (this.gameState.energy <= 0) {
            this.gameState.gameOver = true;
        }
    }

    updateForwardDirection(direction) {
        this.forwardDirection.copy(direction);
    }

    setCamera(camera) {
        this.camera = camera;
        this.cameraQuaternion.copy(camera.quaternion);
    }

    updateCameraOrientation(quaternion) {
        this.cameraQuaternion.copy(quaternion);
    }

    attractOrb(orb) {
        if (!this.gameState.magneticFieldActive) return;

        const orbPosition = orb.position.clone();
        const direction = this.position.clone().sub(orbPosition);
        const distance = direction.length();

        if (distance < this.magneticRadius) {
            direction.normalize();
            const force = (1 - distance / this.magneticRadius) * this.magneticForce;
            orb.position.add(direction.multiplyScalar(force));
        }
    }

    activateMagneticField() {
        if (this.gameState.magneticFieldActive) return;
        this.gameState.magneticFieldActive = true;
        this.soundManager.playSound('magnetic');
        
        // Optional: Add visual effect for magnetic field
        this.showMagneticFieldEffect();
        
        setTimeout(() => {
            this.gameState.magneticFieldActive = false;
            this.hideMagneticFieldEffect();
        }, 5000); // 5 seconds duration
    }

    showMagneticFieldEffect() {
        if (!this.magneticField) {
            const geometry = new THREE.SphereGeometry(this.magneticRadius, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x4444ff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            this.magneticField = new THREE.Mesh(geometry, material);
            this.mesh.add(this.magneticField);
        }
        this.magneticField.visible = true;
    }

    hideMagneticFieldEffect() {
        if (this.magneticField) {
            this.magneticField.visible = false;
        }
    }

    activateTractorBeam() {
        if (!this.tractorBeamActive) {
            this.tractorBeamActive = true;
            this.tractorBeam.visible = true;
            this.soundManager.playSound('tractor');
        }
    }

    deactivateTractorBeam() {
        if (this.tractorBeamActive) {
            this.tractorBeamActive = false;
            this.tractorBeam.visible = false;
            this.soundManager.stopSound('tractor');
        }
    }

    collect(amount) {
        // Increase energy when collecting an orb
        this.gameState.energy = Math.min(100, this.gameState.energy + amount);
        
        // Play collection sound if available
        if (this.soundManager && this.soundManager.playSound) {
            this.soundManager.playSound('collect');
        }
        
        // Visual feedback
        if (this.engineGlow) {
            // Temporarily boost engine glow intensity instead of opacity
            const originalIntensity = this.engineGlow.intensity;
            this.engineGlow.intensity = 2.0;
            setTimeout(() => {
                this.engineGlow.intensity = originalIntensity;
            }, 200);
        }
    }
} 