export function createMetallicTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Create metallic base
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#a0a0a0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add noise for texture
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = Math.random() * 50;
        ctx.fillStyle = `rgba(255,255,255,${brightness/100})`;
        ctx.fillRect(x, y, 1, 1);
    }

    return canvas.toDataURL();
}

export function createNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Create normal map pattern
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
            const nx = (Math.random() * 2 - 1) * 0.2;
            const ny = (Math.random() * 2 - 1) * 0.2;
            const nz = 1;
            ctx.fillStyle = `rgb(
                ${Math.floor((nx + 1) * 127.5)},
                ${Math.floor((ny + 1) * 127.5)},
                ${Math.floor(nz * 255)}
            )`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    return canvas.toDataURL();
} 