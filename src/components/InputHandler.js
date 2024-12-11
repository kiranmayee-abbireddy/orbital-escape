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

        // Touch controls state
        this.touchControls = {
            moveX: 0,
            moveY: 0,
            verticalMoveY: 0,
            touchStartX: 0,
            touchStartY: 0
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
        // Create touch control elements
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        touchControls.innerHTML = `
            <div class="touch-zone movement-zone"></div>
            <div class="touch-zone vertical-zone"></div>
            <div class="touch-buttons">
                <button class="shield-button">Shield</button>
                <button class="magnet-button">Magnet</button>
            </div>
        `;
        document.body.appendChild(touchControls);

        // Get touch zones
        const movementZone = touchControls.querySelector('.movement-zone');
        const verticalZone = touchControls.querySelector('.vertical-zone');
        const shieldButton = touchControls.querySelector('.shield-button');
        const magnetButton = touchControls.querySelector('.magnet-button');

        // Movement zone touch handlers
        movementZone.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.touchControls.touchStartX = touch.clientX;
            this.touchControls.touchStartY = touch.clientY;
        });

        movementZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.moveX = (touch.clientX - this.touchControls.touchStartX) / 50;
            this.touchControls.moveY = (touch.clientY - this.touchControls.touchStartY) / 50;
        });

        movementZone.addEventListener('touchend', () => {
            this.touchControls.moveX = 0;
            this.touchControls.moveY = 0;
        });

        // Vertical movement zone handlers
        verticalZone.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.touchControls.touchStartY = touch.clientY;
        });

        verticalZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchControls.verticalMoveY = (touch.clientY - this.touchControls.touchStartY) / 50;
        });

        verticalZone.addEventListener('touchend', () => {
            this.touchControls.verticalMoveY = 0;
        });

        // Shield button handler
        shieldButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.Space = true;
        });

        shieldButton.addEventListener('touchend', () => {
            this.keys.Space = false;
        });

        // Magnet button handler
        magnetButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.Shift = true;
        });

        magnetButton.addEventListener('touchend', () => {
            this.keys.Shift = false;
        });
    }

    update() {
        // Keyboard controls
        this.spaceship.moveForward = this.keys.ArrowUp || this.keys.w;
        this.spaceship.moveBackward = this.keys.ArrowDown || this.keys.s;
        this.spaceship.moveLeft = this.keys.ArrowLeft || this.keys.a;
        this.spaceship.moveRight = this.keys.ArrowRight || this.keys.d;
        this.spaceship.moveUp = this.keys.q;
        this.spaceship.moveDown = this.keys.e;
        this.spaceship.shieldActive = this.keys.Space;
        this.spaceship.magneticFieldActive = this.keys.Shift;

        // Touch controls
        if (Math.abs(this.touchControls.moveX) > 0.1 || Math.abs(this.touchControls.moveY) > 0.1) {
            this.spaceship.moveLeft = this.touchControls.moveX < 0;
            this.spaceship.moveRight = this.touchControls.moveX > 0;
            this.spaceship.moveForward = this.touchControls.moveY < 0;
            this.spaceship.moveBackward = this.touchControls.moveY > 0;
        }

        // Handle vertical movement from vertical control
        if (Math.abs(this.touchControls.verticalMoveY) > 0.1) {
            this.spaceship.moveUp = this.touchControls.verticalMoveY < 0;
            this.spaceship.moveDown = this.touchControls.verticalMoveY > 0;
        }
    }
} 