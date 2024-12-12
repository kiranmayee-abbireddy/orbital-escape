import * as THREE from 'three';

export class InputHandler {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false,
            q: false,
            e: false,
            Shift: false,
            Control: false,
            Space: false
        };

        // Touch controls state with higher threshold
        this.touchControls = {
            moveX: 0,
            moveY: 0,
            verticalMove: 0,
            touchStartX: 0,
            touchStartY: 0,
            verticalStartY: 0,
            threshold: 0.2  // Increased threshold to prevent accidental movement
        };

        this.setupKeyboardControls();
        this.setupTouchControls();
    }

    setupKeyboardControls() {
        // Event listeners for keyboard
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
                e.preventDefault(); // Prevent default browser scrolling
            }
            // Handle WASD keys
            if (e.key.toLowerCase() === 'w') this.keys.ArrowUp = true;
            if (e.key.toLowerCase() === 'a') this.keys.ArrowLeft = true;
            if (e.key.toLowerCase() === 's') this.keys.ArrowDown = true;
            if (e.key.toLowerCase() === 'd') this.keys.ArrowRight = true;
        });

        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
            // Handle WASD keys
            if (e.key.toLowerCase() === 'w') this.keys.ArrowUp = false;
            if (e.key.toLowerCase() === 'a') this.keys.ArrowLeft = false;
            if (e.key.toLowerCase() === 's') this.keys.ArrowDown = false;
            if (e.key.toLowerCase() === 'd') this.keys.ArrowRight = false;
        });
    }

    setupTouchControls() {
        const movementZone = document.querySelector('.movement-zone');
        const verticalZone = document.querySelector('.vertical-zone');
        const shieldButton = document.querySelector('.shield-button');
        const magnetButton = document.querySelector('.magnet-button');

        // Movement touch handling
        movementZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.touchStartX = touch.clientX;
            this.touchControls.touchStartY = touch.clientY;
        });

        movementZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchControls.touchStartX;
            const deltaY = touch.clientY - this.touchControls.touchStartY;
            
            // Convert deltas to movement (-1 to 1 range)
            this.touchControls.moveX = Math.max(-1, Math.min(1, deltaX / 50));
            this.touchControls.moveY = Math.max(-1, Math.min(1, deltaY / 50));
        });

        movementZone.addEventListener('touchend', () => {
            this.touchControls.moveX = 0;
            this.touchControls.moveY = 0;
        });

        // Vertical movement touch handling
        verticalZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.verticalStartY = touch.clientY;
        });

        verticalZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaY = touch.clientY - this.touchControls.verticalStartY;
            this.touchControls.verticalMove = Math.max(-1, Math.min(1, deltaY / 50));
        });

        verticalZone.addEventListener('touchend', () => {
            this.touchControls.verticalMove = 0;
        });

        // Shield button
        shieldButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.Space = true;
        });

        shieldButton.addEventListener('touchend', () => {
            this.keys.Space = false;
        });

        // Magnet button
        magnetButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.Shift = true;
        });

        magnetButton.addEventListener('touchend', () => {
            this.keys.Shift = false;
        });
    }

    update() {
        // Reset movement flags first
        this.spaceship.moveForward = false;
        this.spaceship.moveBackward = false;
        this.spaceship.moveLeft = false;
        this.spaceship.moveRight = false;
        this.spaceship.moveUp = false;
        this.spaceship.moveDown = false;

        // Update movement based on touch controls with higher threshold
        if (Math.abs(this.touchControls.moveX) > this.touchControls.threshold) {
            this.spaceship.moveLeft = this.touchControls.moveX < -this.touchControls.threshold;
            this.spaceship.moveRight = this.touchControls.moveX > this.touchControls.threshold;
        }
        
        if (Math.abs(this.touchControls.moveY) > this.touchControls.threshold) {
            this.spaceship.moveForward = this.touchControls.moveY < -this.touchControls.threshold;
            this.spaceship.moveBackward = this.touchControls.moveY > this.touchControls.threshold;
        }
        
        if (Math.abs(this.touchControls.verticalMove) > this.touchControls.threshold) {
            this.spaceship.moveUp = this.touchControls.verticalMove < -this.touchControls.threshold;
            this.spaceship.moveDown = this.touchControls.verticalMove > this.touchControls.threshold;
        }

        // Update keyboard controls
        if (this.keys.ArrowUp || this.keys.w) this.spaceship.moveForward = true;
        if (this.keys.ArrowDown || this.keys.s) this.spaceship.moveBackward = true;
        if (this.keys.ArrowLeft || this.keys.a) this.spaceship.moveLeft = true;
        if (this.keys.ArrowRight || this.keys.d) this.spaceship.moveRight = true;
        if (this.keys.q) this.spaceship.moveUp = true;
        if (this.keys.e) this.spaceship.moveDown = true;
        
        this.spaceship.shieldActive = this.keys.Space;
        this.spaceship.magneticFieldActive = this.keys.Shift;
    }
} 