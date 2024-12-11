import * as THREE from 'three';

export class SoundManager {
    constructor() {
        // Create audio listener and loader
        this.listener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();
        this.sounds = {};
        this.initialized = false;
    }

    async initializeSounds() {
        // Create sound objects
        this.sounds = {
            engine: new THREE.Audio(this.listener),
            collect: new THREE.Audio(this.listener),
            shield: new THREE.Audio(this.listener),
            collision: new THREE.Audio(this.listener),
            gameOver: new THREE.Audio(this.listener),
            background: new THREE.Audio(this.listener),
            tractor: new THREE.Audio(this.listener)
        };

        // Use local audio files or free-to-use URLs
        try {
            await Promise.all([
                this.loadSound('engine', 'assets/sounds/engine.mp3', 0.3, true),
                this.loadSound('collect', 'assets/sounds/collect.mp3', 0.5),
                this.loadSound('shield', 'assets/sounds/shield.mp3', 0.4),
                this.loadSound('collision', 'assets/sounds/collision.mp3', 0.4),
                this.loadSound('gameOver', 'assets/sounds/gameover.mp3', 0.5),
                this.loadSound('background', 'assets/sounds/background.mp3', 0.2, true),
                this.loadSound('tractor', 'assets/sounds/tractor.mp3', 0.3, true)
            ]);
            this.initialized = true;
            console.log('All sounds loaded successfully');
        } catch (error) {
            console.warn('Some sound files failed to load:', error);
            this.initialized = true; // Continue without sound
        }
    }

    async loadSound(name, url, volume = 1.0, loop = false) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    this.sounds[name].setBuffer(buffer);
                    this.sounds[name].setVolume(volume);
                    this.sounds[name].setLoop(loop);
                    resolve();
                },
                undefined,
                reject
            );
        });
    }

    playSound(name) {
        const sound = this.sounds[name];
        if (sound && sound.buffer && !sound.isPlaying) {
            sound.play();
        }
    }

    stopSound(name) {
        const sound = this.sounds[name];
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    updateEngineSound(velocity) {
        if (this.sounds.engine && this.sounds.engine.buffer) {
            const speed = velocity.length();
            this.sounds.engine.setVolume(Math.min(speed * 2, 0.3));
            
            if (speed > 0.01 && !this.sounds.engine.isPlaying) {
                this.sounds.engine.play();
            } else if (speed <= 0.01 && this.sounds.engine.isPlaying) {
                this.sounds.engine.stop();
            }
        }
    }

    startBackgroundMusic() {
        if (this.initialized && this.sounds.background) {
            this.sounds.background.play();
        }
    }

    stopBackgroundMusic() {
        this.stopSound('background');
    }

    dispose() {
        Object.values(this.sounds).forEach(sound => {
            sound.stop();
            sound.disconnect();
        });
    }
} 