import * as THREE from 'three';

export class SpaceEffects {
    constructor(scene) {
        this.scene = scene;
        this.nebulae = [];
        this.galaxies = [];
        
        this.createNebulae();
        this.createGalaxies();
    }

    createNebulae() {
        // Create several colorful nebulae
        const nebulaColors = [
            new THREE.Color(0xff3366), // Pink
            new THREE.Color(0x4411aa), // Purple
            new THREE.Color(0x22ffdd)  // Cyan
        ];

        nebulaColors.forEach(color => {
            const particles = 1000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particles * 3);
            const colors = new Float32Array(particles * 3);

            // Create nebula shape (cloud-like distribution)
            for (let i = 0; i < positions.length; i += 3) {
                // Random position within ellipsoid
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const r = 50 + Math.random() * 30;

                positions[i] = r * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = (r * 0.5) * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = r * Math.cos(phi);

                // Color with slight variation
                const intensity = 0.5 + Math.random() * 0.5;
                colors[i] = color.r * intensity;
                colors[i + 1] = color.g * intensity;
                colors[i + 2] = color.b * intensity;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 2,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                map: this.createNebulaTexture()
            });

            const nebula = new THREE.Points(geometry, material);
            nebula.position.set(
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
                Math.random() * 400 - 200
            );
            nebula.rotation.x = Math.random() * Math.PI;
            nebula.rotation.y = Math.random() * Math.PI;

            this.nebulae.push({
                mesh: nebula,
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.0001,
                    (Math.random() - 0.5) * 0.0001,
                    (Math.random() - 0.5) * 0.0001
                )
            });

            this.scene.add(nebula);
        });
    }

    createGalaxies() {
        const galaxyCount = 3;
        for (let i = 0; i < galaxyCount; i++) {
            const particles = 5000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particles * 3);
            const colors = new Float32Array(particles * 3);

            // Create spiral galaxy
            for (let j = 0; j < positions.length; j += 3) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 50;
                const spiralAngle = angle + (radius * 0.1); // Spiral factor

                positions[j] = Math.cos(spiralAngle) * radius;
                positions[j + 1] = (Math.random() - 0.5) * 5; // Thickness
                positions[j + 2] = Math.sin(spiralAngle) * radius;

                // Colors from center to edge
                const distanceFromCenter = radius / 50;
                colors[j] = 1 - distanceFromCenter * 0.5;
                colors[j + 1] = 0.5 + distanceFromCenter * 0.5;
                colors[j + 2] = 1;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.5,
                transparent: true,
                opacity: 0.8,
                vertexColors: true,
                blending: THREE.AdditiveBlending
            });

            const galaxy = new THREE.Points(geometry, material);
            galaxy.position.set(
                Math.random() * 800 - 400,
                Math.random() * 800 - 400,
                Math.random() * 800 - 400
            );
            galaxy.rotation.x = Math.random() * Math.PI;
            galaxy.rotation.y = Math.random() * Math.PI;

            this.galaxies.push({
                mesh: galaxy,
                rotationSpeed: 0.0001 + Math.random() * 0.0001
            });

            this.scene.add(galaxy);
        }
    }

    createNebulaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    update() {
        // Rotate nebulae
        this.nebulae.forEach(nebula => {
            nebula.mesh.rotation.x += nebula.rotationSpeed.x;
            nebula.mesh.rotation.y += nebula.rotationSpeed.y;
            nebula.mesh.rotation.z += nebula.rotationSpeed.z;
        });

        // Rotate galaxies
        this.galaxies.forEach(galaxy => {
            galaxy.mesh.rotation.y += galaxy.rotationSpeed;
        });
    }

    dispose() {
        [...this.nebulae, ...this.galaxies].forEach(obj => {
            obj.mesh.geometry.dispose();
            obj.mesh.material.dispose();
            if (obj.mesh.material.map) {
                obj.mesh.material.map.dispose();
            }
            this.scene.remove(obj.mesh);
        });
    }
} 