#!/bin/bash

# Create main project directory
mkdir -p orbital-escape/{assets/{models,textures,sounds},libs}

# Create main files
touch orbital-escape/index.html
touch orbital-escape/style.css
touch orbital-escape/script.js
touch orbital-escape/PLANNING.md

# Initialize npm project
cd orbital-escape
npm init -y

# Install Three.js
npm install three

# Create basic index.html content
cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbital Escape</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container"></div>
    <script type="module" src="script.js"></script>
</body>
</html>
EOL

# Create basic style.css content
cat > style.css << 'EOL'
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    overflow: hidden;
}

#game-container {
    width: 100vw;
    height: 100vh;
}
EOL

# Create basic script.js content
cat > script.js << 'EOL'
import * as THREE from 'three';

// Initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Basic animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
EOL

# Create PLANNING.md content
cat > PLANNING.md << 'EOL'
# Orbital Escape - Development Plan

## Game Overview
A 3D web-based game where players pilot a spaceship through an asteroid field while collecting energy orbs. Built using Three.js for 3D rendering.

## Technical Stack
- HTML5, CSS3, JavaScript
- Three.js for 3D graphics
- Node.js & npm for development
- VS Code with Live Server

## Project Structure

orbital-escape/
├── index.html
├── style.css
├── script.js
├── PLANNING.md
├── assets/
│   ├── models/
│   ├── textures/
│   └── sounds/
└── libs/
    └── three.min.js

## Development Phases

### Phase 1: Project Setup
- [x] Create project directory structure
- [ ] Initialize npm project
- [ ] Install Three.js
- [ ] Set up basic HTML boilerplate
- [ ] Configure development environment

### Phase 2: Basic Scene Setup
- [ ] Initialize Three.js scene
- [ ] Set up camera
- [ ] Configure renderer
- [ ] Add basic lighting
- [ ] Implement responsive canvas

### Phase 3: Core Game Objects
- [ ] Create spaceship model
- [ ] Generate asteroid field
- [ ] Add energy orbs
- [ ] Implement basic materials and textures

### Phase 4: Player Controls
- [ ] Keyboard input handling
- [ ] Spaceship movement
- [ ] Camera following logic
- [ ] Mobile touch controls

### Phase 5: Game Mechanics
- [ ] Collision detection system
- [ ] Energy collection system
- [ ] Shield/health system
- [ ] Score tracking

### Phase 6: Game Loop
- [ ] Animation system
- [ ] Physics updates
- [ ] Game state management
- [ ] Performance optimization

### Phase 7: Polish & UI
- [ ] HUD implementation
- [ ] Start/pause menu
- [ ] Victory/defeat screens
- [ ] Sound effects and music
- [ ] Visual effects (particles, trails)

## Game Features

### Core Mechanics
1. Spaceship Control
   - WASD/Arrow keys for movement
   - Smooth acceleration/deceleration
   - Optional: Roll and pitch controls

2. Collision System
   - Asteroid collision damage
   - Energy orb collection
   - Shield mechanics

3. Scoring System
   - Points for collected orbs
   - Time-based scoring
   - High score tracking

### Visual Elements
1. Spaceship
   - Basic geometric model
   - Engine effects
   - Shield visualization

2. Environment
   - Asteroid field
   - Background starfield
   - Energy orb effects

3. UI Elements
   - Health/shield bar
   - Energy counter
   - Timer
   - Score display

## Performance Considerations
- Object pooling for asteroids
- Level of detail (LOD) for distant objects
- Efficient collision detection
- Mobile device optimization

## Future Enhancements
- Multiple levels
- Power-ups
- Different spaceship types
- Multiplayer support
- Achievements system

## Testing Strategy
- Browser compatibility testing
- Performance benchmarking
- Mobile device testing
- User control testing

## Release Plan
1. Alpha Version
   - Basic movement and collisions
   - Simple placeholder graphics
   - Core game loop

2. Beta Version
   - Complete game mechanics
   - Improved graphics
   - Basic UI implementation

3. Release Version
   - Polished graphics
   - Complete UI
   - Sound effects
   - Performance optimization
EOL

echo "Project structure created successfully!" 