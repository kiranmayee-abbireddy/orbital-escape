import * as THREE from '../../node_modules/three/build/three.module.js';

export class SoundManager {
    constructor() {
        // Create audio listener and loader
        this.listener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();
        this.sounds = {};
        
        // Initialize sound effects
        this.initializeSounds();
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

        // Load and set up sound files using direct URLs
        try {
            await Promise.all([
                this.loadSound('engine', 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3', 0.3, true),
                this.loadSound('collect', 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c6a442.mp3', 0.5),
                this.loadSound('shield', 'https://cdn.pixabay.com/download/audio/2022/03/22/audio_c8595d6c67.mp3', 0.4),
                this.loadSound('collision', 'https://cdn.pixabay.com/download/audio/2022/03/25/audio_c8a49a2c42.mp3', 0.4),
                this.loadSound('gameOver', 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8c8b3312d.mp3', 0.5),
                this.loadSound('background', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_c84861c9c6.mp3', 0.2, true),
                this.loadSound('tractor', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8595d6c67.mp3', 0.3, true)
            ]);
            console.log('All sounds loaded successfully');
        } catch (error) {
            console.warn('Some sound files failed to load:', error);
            // Continue game without sound if loading fails
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
        this.playSound('background');
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