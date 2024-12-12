const fs = require('fs-extra');
const path = require('path');

// Clean dist directory if it exists
if (fs.existsSync('dist')) {
    fs.removeSync('dist');
}

// Create fresh dist directory
fs.ensureDirSync('dist');

try {
    // Copy only necessary files
    const filesToCopy = [
        'index.html',
        'style.css',
        'script.js'
    ];

    filesToCopy.forEach(file => {
        fs.copySync(file, path.join('dist', file));
    });

    // Copy src directory with a flatter structure
    const srcDir = 'src';
    fs.readdirSync(srcDir, { withFileTypes: true })
        .forEach(dirent => {
            if (dirent.isDirectory()) {
                const componentsDir = path.join(srcDir, dirent.name);
                fs.readdirSync(componentsDir).forEach(file => {
                    const srcPath = path.join(componentsDir, file);
                    const destPath = path.join('dist/src', dirent.name, file);
                    fs.ensureDirSync(path.dirname(destPath));
                    fs.copySync(srcPath, destPath);
                });
            }
        });

    console.log('Build completed successfully!');
} catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
} 