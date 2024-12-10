import * as THREE from '../../node_modules/three/build/three.module.js';

export class Skybox {
    constructor(scene) {
        this.scene = scene;
        
        // Create a large sphere for the skybox
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        // Flip the geometry inside out
        geometry.scale(-1, 1, 1);

        // Load space texture
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            // Using a reliable space texture URL
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/2294472375_24a3b8ef46_o.jpg',
            // Optional callback after loading
            () => {
                console.log('Skybox texture loaded successfully');
            },
            // Progress callback
            undefined,
            // Error callback
            (err) => {
                console.error('Error loading skybox texture:', err);
                // Fallback to a color if texture fails to load
                material.color.set(0x000020);
            }
        );

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            fog: false
        });

        // Create and add the skybox
        this.skybox = new THREE.Mesh(geometry, material);
        this.scene.add(this.skybox);

        // Add some fog for depth effect
        this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
        this.scene.fog.color.setHSL(0.6, 0.2, 0.1);
    }

    update(camera) {
        // Make skybox follow camera
        this.skybox.position.copy(camera.position);
    }

    dispose() {
        this.skybox.geometry.dispose();
        this.skybox.material.dispose();
        if (this.skybox.material.map) {
            this.skybox.material.map.dispose();
        }
        this.scene.remove(this.skybox);
    }
} 