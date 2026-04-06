#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Photo System Setup Helper
 * Creates necessary directories and example files for the photo system
 */

const UPLOADS_DIR = path.join(__dirname, 'app/uploads');
const PHOTOS_DIR = path.join(UPLOADS_DIR, 'photos');

console.log('📸 Photo System Setup Helper\n');

// Create directories
console.log('Creating directories...');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`✓ Created: ${UPLOADS_DIR}`);
}

if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  console.log(`✓ Created: ${PHOTOS_DIR}`);
}

// Create default.png as a base64 encoded minimal PNG
// This is a 100x100 white PNG with "No Photo" text
const defaultPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAADlklEQVR4nO3ay27bMBCG9yTpyJL1sJ2k7pHo0fAB+gF9gXpAHsA9QF+gJ3AC2AaC+qxtW5IsUaJI0pJE0rJpx6ftODiKNS3S/n+GoMSSI4qz3+wMZ2cqCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIg/BnV4xFG4zHGyQSj8Rjj5OuNx9fHx1gul1gsFmi32wi5jDabjVMUhWazGWJd13VQkiTU6/WQy/jzarWCZrNJvrn7wnnSNI2ypnE+n1OpVAp5fP++Xy6X1Ov1QmpZr9czarjdbimKYti3u1c4T7quE8dxnPP8QMaRhkNQqVQoGAySLMsUx3EYcxyXg8Fgr2uY55lkWdZBWdahzv1ydSkkz3PIcRywbZtGoxEFg0GKx+PkuT7F43FyXJdsxyHf94nne3TZaVClUpFGJT5eNd+HQXz/xBNPPPHEE0+8UqNRAqCrq2sPQ6Ew1Ov1jnZsOBxSpVIhiqJU1/W988zlcnkSMI7jMpvNdnYMo/HhMf1+f8vgYrFI5XJ5ZwBuNhvK5/OHBZFlWZpOp/u8t/a7FhIWYVkWlUrlYK8pNBqNfV5bW1taq9Uo/VwJIWmaSVVVUsCQqEQJZNJF1C5XG5//6NxgzCfz6nRaOw1BW3b3ms2oxVuNhvK5/Pk+z4FAgGKx+MklUrR6ekpnZ+f0/X1Nd3c3NBZR4bDIZ2fn9Pt7S2l02lKp9N0fX1NQRAQRSF5pD4+Pqbr62v6+vqix8dHSiQSVK/X9XspFovRyckJxeNxGg6Hdx8WBRpomyaLxYJGoxEVi0WanZ3RYrGgyWRCrVaLGo0GNZvNV5+3tbWlZDJJ2WxWWpT/5/X1lZrNJr2+vkqLUvI8j87OzqjRaByEhHn2dKt52e12dHp6So+Pj9J6jMXZbEbH/QePj481YMtXnFarVfl4pVJR7vP5/JoZ9fpsLGQ61XX7ldsNJi3LLEhEQERECMIjRESEIDxCREQIwiNERIQgPEJERFAHf+X8S3h31XRxvV5/8XcU1uXqXTTd+/sLaVE+/g0+5DFdLtR0r2uZKqfTqfwRzOVyVcjn89Ih+OxNVeFwSNo6VUbH42Fpaw/QuHD3cBQl14w0NjY2pJWRjTxjY2PHBOwYnfyeKpfL5YL41mqlTUndyU5pIRGckBiBuoUhfshGdnPXb1IqtegG/C+UtLJ+Afl+J7G1VvU4AAAAAElFTkSuQmCC';

const defaultPngPath = path.join(PHOTOS_DIR, 'default.png');
if (!fs.existsSync(defaultPngPath)) {
  try {
    fs.writeFileSync(defaultPngPath, Buffer.from(defaultPngBase64, 'base64'));
    console.log(`✓ Created: default.png`);
  } catch (err) {
    console.error(`✗ Failed to create default.png: ${err.message}`);
  }
}

// Create a configuration info file
const configInfo = `# Photo System Configuration
Generated: ${new Date().toISOString()}

## Directory Structure
\`\`\`
${PHOTOS_DIR}/
├── default.png (placeholder image)
├── EMP001.jpg (employee photos go here)
├── EMP002.png
└── ... (more employee photos)
\`\`\`

## File Naming Convention
Employee photos should be named: \`{EMPLOYEENO}.{ext}\`

Examples:
- EMP001.jpg
- EMP002.png
- EMP003.gif

## Supported Formats
- JPG / JPEG
- PNG
- GIF
- WebP

## File Size Limit
Maximum 5MB per photo

## Default Fallback
If an employee photo is not found, the system will automatically fall back to \`default.png\`

## API Endpoints
- GET /api/photos/:employeeno - Get binary photo
- GET /api/photos/:employeeno/base64 - Get base64-encoded data URL
- GET /api/photos/check/:employeeno - Check if photo exists
- POST /api/photos/:employeeno - Upload photo for employee

## Testing
To test the photo system, run: \`node test-photo-system.js\`

Last updated: ${new Date().toISOString()}
`;

const configPath = path.join(PHOTOS_DIR, '.config.md');
fs.writeFileSync(configPath, configInfo);
console.log('✓ Created: configuration file');

// List current photos
console.log('\n📁 Current photos in directory:');
try {
  const files = fs.readdirSync(PHOTOS_DIR);
  if (files.length === 0) {
    console.log('  (empty - ready for photos)');
  } else {
    files.forEach(file => {
      const filePath = path.join(PHOTOS_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  • ${file} (${sizeMB} MB)`);
    });
  }
} catch (err) {
  console.error(`✗ Error reading directory: ${err.message}`);
}

console.log(`\n✓ Photo system setup complete!`);
console.log(`\nPhotos directory: ${PHOTOS_DIR}`);
console.log(`Ready to add employee photos with naming: EMP###.jpg\n`);
