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

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
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
        // Update spaceship movement flags based on input
        this.spaceship.moveForward = this.keys.ArrowUp;
        this.spaceship.moveBackward = this.keys.ArrowDown;
        this.spaceship.moveLeft = this.keys.ArrowLeft;
        this.spaceship.moveRight = this.keys.ArrowRight;
        this.spaceship.moveUp = this.keys.q;
        this.spaceship.moveDown = this.keys.e;
    }
} 