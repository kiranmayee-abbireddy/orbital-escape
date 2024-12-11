import * as THREE from 'three';
import { gsap } from 'gsap';
import { createMetallicTexture, createNormalMap } from '../utils/TextureGenerator.js';

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
        
        // Create textures
        const metalTextureUrl = createMetallicTexture();
        const normalMapUrl = createNormalMap();
        
        this.textureLoader = new THREE.TextureLoader();
        this.metalTexture = this.textureLoader.load(metalTextureUrl);
        this.normalMap = this.textureLoader.load(normalMapUrl);
        
        this.createModel();
        this.addToScene();
    }

    createModel() {
        // Use the generated textures directly
        const metalTexture = this.metalTexture;
        const normalMap = this.normalMap;
        
        // Main disc (core body)
        const discGeometry = new THREE.CylinderGeometry(2, 2.2, 0.5, 32);
        const discMaterial = new THREE.MeshPhongMaterial({
            color: 0x3399ff,
            shininess: 90,
            emissive: 0x1155aa,
            emissiveIntensity: 0.3
        });
        const disc = new THREE.Mesh(discGeometry, discMaterial);

        // Top dome (cockpit)
        const domeGeometry = new THREE.SphereGeometry(1.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.9,
            shininess: 100,
            emissive: 0x1155aa,
            emissiveIntensity: 0.2
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = 0.25;

        // Decorative ring around dome
        const domeRingGeometry = new THREE.TorusGeometry(1.3, 0.08, 16, 32);
        const domeRingMaterial = new THREE.MeshPhongMaterial({
            color: 0x3399ff,
            shininess: 90,
            emissive: 0x1155aa
        });
        const domeRing = new THREE.Mesh(domeRingGeometry, domeRingMaterial);
        domeRing.position.y = 0.25;
        domeRing.rotation.x = Math.PI / 2;

        // Bottom rim with details
        const rimGeometry = new THREE.TorusGeometry(2.2, 0.2, 16, 32);
        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0x3399ff,
            shininess: 90,
            emissive: 0x1155aa
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.y = -0.25;
        rim.rotation.x = Math.PI / 2;

        // Add windows around the body
        const windows = new THREE.Group();
        const windowCount = 12;
        const windowGeometry = new THREE.CircleGeometry(0.15, 16);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });

        for (let i = 0; i < windowCount; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            const angle = (i / windowCount) * Math.PI * 2;
            window.position.set(
                Math.cos(angle) * 1.9,
                0,
                Math.sin(angle) * 1.9
            );
            window.rotation.y = -angle;
            window.rotation.x = Math.PI / 2;
            windows.add(window);
        }

        // Add engine thrusters
        const thrusters = new THREE.Group();
        const thrusterCount = 6;
        const thrusterGeometry = new THREE.CylinderGeometry(0.2, 0.1, 0.3, 16);
        const thrusterMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 90
        });

        for (let i = 0; i < thrusterCount; i++) {
            const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
            const angle = (i / thrusterCount) * Math.PI * 2;
            thruster.position.set(
                Math.cos(angle) * 1.8,
                -0.4,
                Math.sin(angle) * 1.8
            );
            thrusters.add(thruster);
        }

        // Add engine glow
        const engineGlows = new THREE.Group();
        const glowGeometry = new THREE.CircleGeometry(0.15, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < thrusterCount; i++) {
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            const angle = (i / thrusterCount) * Math.PI * 2;
            glow.position.set(
                Math.cos(angle) * 1.8,
                -0.45,
                Math.sin(angle) * 1.8
            );
            glow.rotation.x = Math.PI / 2;
            engineGlows.add(glow);
        }

        // Add antenna on top
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            shininess: 90
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 0.9;

        // Add antenna light
        const antennaLightGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const antennaLightMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const antennaLight = new THREE.Mesh(antennaLightGeometry, antennaLightMaterial);
        antennaLight.position.y = 1.15;

        // Add abduction beam effect
        const beamGeometry = new THREE.CylinderGeometry(0.2, 2, 4, 32, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        this.beam = new THREE.Mesh(beamGeometry, beamMaterial);
        this.beam.position.y = -2;

        // Assemble the UFO
        this.mesh = new THREE.Group();
        this.mesh.add(disc);
        this.mesh.add(dome);
        this.mesh.add(domeRing);
        this.mesh.add(rim);
        this.mesh.add(windows);
        this.mesh.add(thrusters);
        this.mesh.add(engineGlows);
        this.mesh.add(antenna);
        this.mesh.add(antennaLight);
        this.mesh.add(this.beam);

        // Store references for animations
        this.engineGlows = engineGlows;
        this.antennaLight = antennaLight;
        this.windows = windows;

        // Start animations
        this.animateEngineGlow();
        this.animateAntennaLight();
        this.animateWindows();
        this.animateBeam();
    }

    animateEngineGlow() {
        const animate = () => {
            this.engineGlows.children.forEach(glow => {
                glow.material.opacity = 0.4 + Math.sin(Date.now() * 0.005) * 0.3;
            });
            requestAnimationFrame(animate);
        };
        animate();
    }

    animateAntennaLight() {
        const animate = () => {
            this.antennaLight.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
            requestAnimationFrame(animate);
        };
        animate();
    }

    animateWindows() {
        const animate = () => {
            this.windows.children.forEach((window, i) => {
                window.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.002 + i) * 0.2;
            });
            requestAnimationFrame(animate);
        };
        animate();
    }

    animateBeam() {
        const animate = () => {
            if (!this.beam) return;
            
            const time = Date.now() * 0.001;
            // Subtle rotation
            this.beam.rotation.y = time * 0.5;
            // Pulsing opacity
            this.beam.material.opacity = 0.2 + Math.sin(time * 2) * 0.1;
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    setColor(color) {
        if (!this.mesh) return;

        // Find all components that need color update
        const disc = this.mesh.children.find(child => child.geometry instanceof THREE.CylinderGeometry);
        const dome = this.mesh.children.find(child => child.geometry instanceof THREE.SphereGeometry);
        const domeRing = this.mesh.children.find(child => child.geometry instanceof THREE.TorusGeometry);

        // Update main body colors
        if (disc) {
            disc.material.color.setHex(color);
            disc.material.emissive.setHex(color);
        }
        if (dome) {
            dome.material.color.setHex(color);
            dome.material.emissive.setHex(color);
        }
        if (domeRing) {
            domeRing.material.color.setHex(color);
            domeRing.material.emissive.setHex(color);
        }

        // Update engine glows with a brighter version of the color
        if (this.engineGlows) {
            const glowColor = new THREE.Color(color);
            glowColor.multiplyScalar(1.5); // Make it brighter
            this.engineGlows.children.forEach(glow => {
                glow.material.color.copy(glowColor);
            });
        }

        // Update beam color
        if (this.beam) {
            this.beam.material.color.setHex(color);
        }

        this.baseColor = color;
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

    checkCollisions() {
        // Check collisions with energy orbs
        if (this.gameState.energyOrbs) {
            this.gameState.energyOrbs.orbs.forEach((orb, index) => {
                if (this.position.distanceTo(orb.position) < this.collisionRadius + orb.radius) {
                    // Remove the orb
                    this.gameState.energyOrbs.removeOrb(index);
                    
                    // Update energy and score
                    this.gameState.energy = Math.min(100, this.gameState.energy + 20);
                    this.gameState.score += 100; // Add 100 points for collecting an orb
                    
                    // Play collection sound
                    if (this.soundManager) {
                        this.soundManager.playSound('collect');
                    }
                }
            });
        }

        // Check collisions with asteroids
        if (this.gameState.asteroidField) {
            this.gameState.asteroidField.getAsteroids().forEach(asteroid => {
                const asteroidRadius = asteroid.geometry.parameters.radius || 1;
                if (this.position.distanceTo(asteroid.position) < this.collisionRadius + asteroidRadius) {
                    if (!this.gameState.shieldActive) {
                        // Reduce energy and score on asteroid collision
                        this.gameState.energy = Math.max(0, this.gameState.energy - 30);
                        this.gameState.score = Math.max(0, this.gameState.score - 50); // Lose 50 points for hitting asteroid
                        
                        if (this.soundManager) {
                            this.soundManager.playSound('hit');
                        }

                        // Check for game over
                        if (this.gameState.energy <= 0) {
                            this.gameState.gameOver = true;
                        }
                    } else {
                        // Bonus points for destroying asteroid with shield
                        this.gameState.score += 25; // Add 25 points for shield destruction
                        if (this.soundManager) {
                            this.soundManager.playSound('shield');
                        }
                    }
                }
            });
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
            const originalIntensity = this.engineGlow.intensity;
            this.engineGlow.intensity = 2.0;
            setTimeout(() => {
                this.engineGlow.intensity = originalIntensity;
            }, 200);
        }
    }

    // Add a method to pulse the engine glow
    pulseEngineGlow() {
        if (!this.engineGlow) return;
        
        const originalOpacity = 0.5;
        const pulseOpacity = 0.8;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Sine wave for smooth pulse
            const pulse = Math.sin(progress * Math.PI);
            const opacity = originalOpacity + (pulseOpacity - originalOpacity) * pulse;
            
            this.engineGlow.material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.engineGlow.material.opacity = originalOpacity;
            }
        };

        requestAnimationFrame(animate);
    }
} 