import * as THREE from 'three';

export class StarField {
    constructor(scene, count = 1000) {
        this.scene = scene;
        
        // Create star geometry and material
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.4,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            map: this.createStarTexture()
        });

        // Create star positions
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        this.velocities = new Float32Array(count * 3); // For twinkling effect
        this.twinkleSpeed = new Float32Array(count);
        this.originalSizes = new Float32Array(count);

        for (let i = 0; i < count * 3; i += 3) {
            // Random position in a large sphere
            const radius = 50 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);

            // Add slight movement to each star
            this.velocities[i] = (Math.random() - 0.5) * 0.001;
            this.velocities[i + 1] = (Math.random() - 0.5) * 0.001;
            this.velocities[i + 2] = (Math.random() - 0.5) * 0.001;

            // Random star color (white to blue to yellow)
            const colorChoice = Math.random();
            if (colorChoice > 0.8) {
                // Blue-ish stars
                colors[i] = 0.6 + Math.random() * 0.2;
                colors[i + 1] = 0.7 + Math.random() * 0.2;
                colors[i + 2] = 1.0;
            } else if (colorChoice > 0.6) {
                // Yellow-ish stars
                colors[i] = 1.0;
                colors[i + 1] = 0.9 + Math.random() * 0.1;
                colors[i + 2] = 0.6 + Math.random() * 0.2;
            } else {
                // White stars
                colors[i] = 1.0;
                colors[i + 1] = 1.0;
                colors[i + 2] = 1.0;
            }
            
            // Random star size
            sizes[i/3] = Math.random() * 3 + 1;
            this.twinkleSpeed[i/3] = 0.1 + Math.random() * 0.2;
            this.originalSizes[i/3] = sizes[i/3];
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(this.stars);
        
        // Store references for animation
        this.positions = positions;
        this.geometry = starGeometry;
    }

    createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    update(camera, time) {
        this.stars.position.copy(camera.position);
        
        // Animate star positions
        const positions = this.geometry.attributes.position.array;
        const sizes = this.geometry.attributes.size.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.velocities[i];
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2];
            
            // Twinkling effect
            const idx = i/3;
            sizes[idx] = this.originalSizes[idx] * 
                (0.8 + Math.sin(time * this.twinkleSpeed[idx]) * 0.2);
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
    }

    dispose() {
        this.stars.geometry.dispose();
        this.stars.material.dispose();
        this.scene.remove(this.stars);
    }
} 