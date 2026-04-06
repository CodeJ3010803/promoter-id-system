#!/usr/bin/env node

/**
 * Batch Photo Upload Script
 * 
 * Usage:
 *   node batch-upload-photos.js <source-directory>
 * 
 * Examples:
 *   node batch-upload-photos.js "C:/photos"
 *   node batch-upload-photos.js "./test-photos"
 * 
 * Photo naming convention:
 *   - Must be: {EMPLOYEENO}.{EXT}
 *   - Examples: EMP001.jpg, EMP002.png, EMP003.gif
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3000';
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Parse command line arguments
const sourceDir = process.argv[2];

if (!sourceDir) {
  console.error('Usage: node batch-upload-photos.js <source-directory>');
  console.error('Example: node batch-upload-photos.js "./photos"');
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Directory not found: ${sourceDir}`);
  process.exit(1);
}

console.log(`📸 Batch Photo Upload Tool\n`);
console.log(`Source directory: ${path.resolve(sourceDir)}`);
console.log(`Server: ${BASE_URL}\n`);

// Get list of photo files
const files = fs.readdirSync(sourceDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
});

if (files.length === 0) {
  console.error('No supported photo files found in directory');
  console.error(`Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  process.exit(1);
}

console.log(`Found ${files.length} photo file(s)\n`);

// Validate filenames
const validFiles = [];
const invalidFiles = [];

files.forEach(file => {
  const nameWithoutExt = path.basename(file, path.extname(file));
  if (nameWithoutExt.toUpperCase().match(/^EMP\d{3,}$/)) {
    validFiles.push(file);
  } else {
    invalidFiles.push(file);
  }
});

if (invalidFiles.length > 0) {
  console.log('⚠️  Files with invalid naming (will skip):');
  invalidFiles.forEach(file => {
    console.log(`   • ${file} (Expected: EMP###.{ext})`);
  });
  console.log();
}

if (validFiles.length === 0) {
  console.error('No files with valid naming convention (EMP###.ext)');
  process.exit(1);
}

console.log(`Valid files to upload: ${validFiles.length}\n`);

// Upload each file
let uploaded = 0;
let failed = 0;

async function uploadFile(filename) {
  return new Promise((resolve) => {
    const ext = path.extname(filename);
    const employeeNo = path.basename(filename, ext);
    const filepath = path.join(sourceDir, filename);
    
    try {
      const fileStream = fs.createReadStream(filepath);
      const form = new FormData();
      form.append('photo', fileStream);
      
      const uploadUrl = new URL(BASE_URL + `/api/photos/${employeeNo}`);
      const req = http.request(uploadUrl, {
        method: 'POST',
        headers: form.getHeaders()
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (res.statusCode === 200 && response.success) {
              console.log(`✓ ${employeeNo}${ext} → ${response.filename}`);
              uploaded++;
            } else {
              console.log(`✗ ${employeeNo}${ext} - Server error: ${response.message || 'Unknown'}`);
              failed++;
            }
          } catch (e) {
            console.log(`✗ ${employeeNo}${ext} - Invalid response from server`);
            failed++;
          }
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`✗ ${employeeNo}${ext} - Upload failed: ${err.message}`);
        failed++;
        resolve();
      });
      
      form.pipe(req);
    } catch (err) {
      console.log(`✗ ${filename} - Error: ${err.message}`);
      failed++;
      resolve();
    }
  });
}

// Main upload loop
(async () => {
  // Check server first
  console.log('Checking server...');
  try {
    await new Promise((resolve, reject) => {
      http.get(BASE_URL, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      }).on('error', reject);
    });
    console.log('✓ Server is running\n');
  } catch (err) {
    console.error(`✗ Cannot connect to server at ${BASE_URL}`);
    console.error('Please start the server first: npm start');
    process.exit(1);
  }
  
  // Upload files
  console.log('Uploading photos...\n');
  for (const file of validFiles) {
    await uploadFile(file);
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Upload Summary');
  console.log(`${'='.repeat(50)}`);
  console.log(`Uploaded:  ${uploaded}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Total:     ${uploaded + failed}`);
  console.log(`${'='.repeat(50)}\n`);
  
  if (failed === 0) {
    console.log('✓ All photos uploaded successfully!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${failed} upload(s) failed. Check server logs.\n`);
    process.exit(1);
  }
})();
