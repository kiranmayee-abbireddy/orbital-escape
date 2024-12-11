import * as THREE from 'three';

export class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target;
        this.target.setCamera(camera);
        
        // Camera positioning
        this.distance = 10;
        this.minDistance = 5;
        this.maxDistance = 20;
        
        // Camera rotation
        this.rotationX = 0;  // Vertical rotation (pitch)
        this.rotationY = 0;  // Horizontal rotation (yaw)
        this.smoothRotX = 0;
        this.smoothRotY = 0;
        this.rotationSpeed = 0.003;
        this.smoothFactor = 0.1;
        
        // Mouse control
        this.isMouseControlActive = false;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.setupMouseControls();
        this.setupKeyboardControls();
    }

    setupMouseControls() {
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.isMouseControlActive = true;
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isMouseControlActive = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isMouseControlActive) {
                const deltaX = e.clientX - this.mouseX;
                const deltaY = e.clientY - this.mouseY;
                
                this.rotationY -= deltaX * this.rotationSpeed;
                this.rotationX -= deltaY * this.rotationSpeed;
                
                // Limit vertical rotation
                this.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.rotationX));
                
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }
        });

        // Add mouse wheel zoom
        document.addEventListener('wheel', (e) => {
            this.distance += e.deltaY * 0.01;
            this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
        });
    }

    setupKeyboardControls() {
        // Add keyboard controls for camera rotation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'q':
                    this.rotationY += 0.1; // Rotate left
                    break;
                case 'e':
                    this.rotationY -= 0.1; // Rotate right
                    break;
                case 'r':
                    this.rotationX -= 0.1; // Rotate up
                    break;
                case 'f':
                    this.rotationX += 0.1; // Rotate down
                    break;
                case 'c':
                    // Reset camera position
                    this.rotationX = 0;
                    this.rotationY = 0;
                    this.distance = 10;
                    break;
            }
            // Limit vertical rotation
            this.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.rotationX));
        });
    }

    update() {
        // Get target position (spaceship)
        const targetPos = this.target.getPosition();
        
        // Smooth out rotation changes
        this.smoothRotX += (this.rotationX - this.smoothRotX) * this.smoothFactor;
        this.smoothRotY += (this.rotationY - this.smoothRotY) * this.smoothFactor;
        
        // Calculate camera position based on spherical coordinates
        const theta = this.smoothRotY;
        const phi = this.smoothRotX + Math.PI/2;
        
        const x = targetPos.x + this.distance * Math.sin(phi) * Math.cos(theta);
        const y = targetPos.y + this.distance * Math.cos(phi);
        const z = targetPos.z + this.distance * Math.sin(phi) * Math.sin(theta);
        
        // Update camera position and look at target
        this.camera.position.set(x, y, z);
        this.camera.lookAt(targetPos);
        
        // Update spaceship's camera orientation for movement direction
        this.target.updateCameraOrientation(this.camera.quaternion);
    }
} 