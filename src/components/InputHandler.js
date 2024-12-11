import * as THREE from '../../node_modules/three/build/three.module.js';

export class InputHandler {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            q: false,
            e: false
        };

        // Touch controls
        this.touchControls = {
            active: false,
            startX: 0,
            startY: 0,
            moveX: 0,
            moveY: 0,
            verticalStartY: 0,
            verticalMoveY: 0
        };

        // Create touch UI elements
        this.createTouchUI();

        // Event listeners for keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Event listeners for touch
        this.joystick.addEventListener('touchstart', (e) => this.onTouchStart(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e));
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Vertical control events
        this.verticalControl.addEventListener('touchstart', (e) => this.onVerticalTouchStart(e));
        this.verticalControl.addEventListener('touchmove', (e) => this.onVerticalTouchMove(e));
        this.verticalControl.addEventListener('touchend', (e) => this.onVerticalTouchEnd(e));
    }

    createTouchUI() {
        // Create joystick container
        this.joystick = document.createElement('div');
        this.joystick.className = 'joystick';
        this.joystick.innerHTML = '<div class="joystick-knob"></div>';
        document.body.appendChild(this.joystick);

        // Create vertical control
        this.verticalControl = document.createElement('div');
        this.verticalControl.className = 'vertical-control';
        this.verticalControl.innerHTML = '<div class="vertical-knob"></div>';
        document.body.appendChild(this.verticalControl);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .joystick {
                position: fixed;
                left: 50px;
                bottom: 50px;
                width: 120px;
                height: 120px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 60px;
                touch-action: none;
            }
            .joystick-knob {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 25px;
                transform: translate(-50%, -50%);
            }
            .vertical-control {
                position: fixed;
                right: 50px;
                bottom: 50px;
                width: 80px;
                height: 200px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 40px;
                touch-action: none;
            }
            .vertical-knob {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 30px;
                transform: translate(-50%, -50%);
            }
        `;
        document.head.appendChild(style);
    }

    onTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.joystick.getBoundingClientRect();
        this.touchControls.active = true;
        this.touchControls.startX = touch.clientX - rect.left;
        this.touchControls.startY = touch.clientY - rect.top;
        e.preventDefault();
    }

    onTouchMove(e) {
        if (!this.touchControls.active) return;
        const touch = e.touches[0];
        const rect = this.joystick.getBoundingClientRect();
        
        this.touchControls.moveX = touch.clientX - rect.left - this.touchControls.startX;
        this.touchControls.moveY = touch.clientY - rect.top - this.touchControls.startY;
        
        // Limit joystick movement
        const maxDistance = 35;
        const distance = Math.sqrt(
            this.touchControls.moveX * this.touchControls.moveX + 
            this.touchControls.moveY * this.touchControls.moveY
        );
        
        if (distance > maxDistance) {
            const scale = maxDistance / distance;
            this.touchControls.moveX *= scale;
            this.touchControls.moveY *= scale;
        }

        // Update joystick knob position
        const knob = this.joystick.querySelector('.joystick-knob');
        knob.style.transform = `translate(${this.touchControls.moveX}px, ${this.touchControls.moveY}px)`;
        
        e.preventDefault();
    }

    onTouchEnd(e) {
        this.touchControls.active = false;
        this.touchControls.moveX = 0;
        this.touchControls.moveY = 0;
        
        // Reset joystick knob position
        const knob = this.joystick.querySelector('.joystick-knob');
        knob.style.transform = 'translate(-50%, -50%)';
        
        e.preventDefault();
    }

    onVerticalTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.verticalControl.getBoundingClientRect();
        this.touchControls.verticalStartY = touch.clientY - rect.top;
        e.preventDefault();
    }

    onVerticalTouchMove(e) {
        const touch = e.touches[0];
        const rect = this.verticalControl.getBoundingClientRect();
        this.touchControls.verticalMoveY = touch.clientY - rect.top - this.touchControls.verticalStartY;
        
        // Limit vertical movement
        const maxDistance = 70;
        this.touchControls.verticalMoveY = Math.max(-maxDistance, 
            Math.min(maxDistance, this.touchControls.verticalMoveY));

        // Update vertical control knob position
        const knob = this.verticalControl.querySelector('.vertical-knob');
        knob.style.transform = `translate(-50%, ${this.touchControls.verticalMoveY}px)`;
        
        e.preventDefault();
    }

    onVerticalTouchEnd(e) {
        this.touchControls.verticalMoveY = 0;
        
        // Reset vertical control knob position
        const knob = this.verticalControl.querySelector('.vertical-knob');
        knob.style.transform = 'translate(-50%, -50%)';
        
        e.preventDefault();
    }

    onKeyDown(event) {
        const key = event.key;
        if (key in this.keys) {
            this.keys[key] = true;
            event.preventDefault(); // Prevent default browser scrolling
        }
    }

    onKeyUp(event) {
        const key = event.key;
        if (key in this.keys) {
            this.keys[key] = false;
        }
    }

    update() {
        // Handle keyboard input
        this.spaceship.moveForward = this.keys.ArrowUp;
        this.spaceship.moveBackward = this.keys.ArrowDown;
        this.spaceship.moveLeft = this.keys.ArrowLeft;
        this.spaceship.moveRight = this.keys.ArrowRight;
        this.spaceship.moveUp = this.keys.q;
        this.spaceship.moveDown = this.keys.e;

        // Handle touch input
        if (this.touchControls.active) {
            const deadzone = 5;
            const sensitivity = 0.03;
            
            // Horizontal and forward/backward movement
            if (Math.abs(this.touchControls.moveX) > deadzone) {
                this.spaceship.moveRight = this.touchControls.moveX > 0;
                this.spaceship.moveLeft = this.touchControls.moveX < 0;
            }
            
            if (Math.abs(this.touchControls.moveY) > deadzone) {
                this.spaceship.moveForward = this.touchControls.moveY < 0;
                this.spaceship.moveBackward = this.touchControls.moveY > 0;
            }
        }

        // Handle vertical movement from vertical control
        if (Math.abs(this.touchControls.verticalMoveY) > 5) {
            this.spaceship.moveUp = this.touchControls.verticalMoveY < 0;
            this.spaceship.moveDown = this.touchControls.verticalMoveY > 0;
        }
    }
} 