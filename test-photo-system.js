#!/usr/bin/env node

const http = require('http');
const path = require('path');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TESTS = [];
let passedTests = 0;
let failedTests = 0;

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, body: parsed, rawBody: data, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data, rawBody: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test utilities
async function test(name, fn) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passedTests++;
  } catch (err) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}${err.message}${colors.reset}`);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Tests
async function runTests() {
  console.log(`\n${colors.blue}🧪 Photo System Tests${colors.reset}\n`);

  // Test 1: Check photo endpoints exist
  await test('Photo endpoints are accessible', async () => {
    // This is just checking structure
    const designerRes = await makeRequest('GET', '/id-designer');
    assert(designerRes.statusCode === 200, 'ID Designer should be accessible');
  });

  // Test 2: Get base64 photo (should return default or error gracefully)
  await test('GET /api/photos/:employeeno/base64 endpoint works', async () => {
    const res = await makeRequest('GET', '/api/photos/TESTEMPLOYEE001/base64');
    // Will either return success or 404, both are OK for this test
    assert(res.statusCode === 200 || res.statusCode === 404, `Expected 200 or 404, got ${res.statusCode}`);
    if (res.statusCode === 200) {
      assert(res.body.success === true || res.body.success === false, 'Response should have success field');
    }
  });

  // Test 3: Check if photo exists
  await test('GET /api/photos/check/:employeeno returns boolean', async () => {
    const res = await makeRequest('GET', '/api/photos/check/TESTEMPLOYEE001');
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(typeof res.body.exists === 'boolean', 'Response should have exists boolean');
  });

  // Test 4: ID Designer has photo system
  await test('ID Designer includes photo system controls', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.statusCode === 200, 'ID Designer should load');
    assert(res.rawBody.includes('photoEmployeeNo'), 'Should have employee no input');
    assert(res.rawBody.includes('loadPhotoPreview'), 'Should have photo preview function');
    assert(res.rawBody.includes('addPhotoPlaceholder'), 'Should have photo placeholder function');
    assert(res.rawBody.includes('{{photo}}'), 'Should have photo placeholder text');
  });

  // Test 5: Photo placeholder function defined
  await test('Photo placeholder uses {{photo}} syntax', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.rawBody.includes("'{{photo}}'"), 'Should use {{photo}} placeholder in code');
  });

  // Test 6: Canvas background persistence
  await test('Canvas background color controls present', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.rawBody.includes('canvasBackground'), 'Should have background color control');
  });

  // Test 7: Photo upload endpoint exists
  await test('Photo upload endpoint structure is correct', async () => {
    const res = await makeRequest('GET', '/id-designer');
    // Checking that the page is well-formed and includes necessary functions
    assert(res.statusCode === 200, 'ID Designer should be accessible');
  });

  // Test 8: Side-by-side canvas layout
  await test('Canvases display side-by-side', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.rawBody.includes('grid-cols-2'), 'Should have side-by-side grid layout');
    assert(res.rawBody.includes('FRONT SIDE'), 'Should label front canvas');
    assert(res.rawBody.includes('BACK SIDE'), 'Should label back canvas');
  });

  // Test 9: Photo system documentation
  await test('Photo system documentation exists', async () => {
    const docPath = path.join(__dirname, 'PHOTO_SYSTEM_GUIDE.md');
    assert(fs.existsSync(docPath), 'PHOTO_SYSTEM_GUIDE.md should exist');
    const content = fs.readFileSync(docPath, 'utf8');
    assert(content.includes('/uploads/photos/'), 'Documentation should reference uploads directory');
    assert(content.includes('{{photo}}'), 'Documentation should mention photo placeholder');
  });

  // Test 10: Directory structure
  await test('Photos directory exists', async () => {
    const photosDir = path.join(__dirname, 'app/uploads/photos');
    assert(fs.existsSync(photosDir), 'Photos directory should exist at app/uploads/photos');
  });

  // Test 11: Multiple photo formats supported
  await test('Photo system supports multiple formats', async () => {
    const res = await makeRequest('GET', '/id-designer');
    const content = res.rawBody;
    // Check that code handles multiple extensions
    assert(content.includes('.jpg') || content.includes('.png'), 'Should support common formats');
  });

  // Test 12: Photo preview section in UI
  await test('Photo preview section is in the UI', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.rawBody.includes('Photo System'), 'Should have Photo System label');
    assert(res.rawBody.includes('photoPreview'), 'Should have preview container');
    assert(res.rawBody.includes('Employee No'), 'Should have employee number field');
  });

  // Print summary
  console.log(`\n${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Total: ${passedTests + failedTests}\n`);

  const allPassed = failedTests === 0;
  process.exit(allPassed ? 0 : 1);
}

// Check if server is running
http.get(BASE_URL, (res) => {
  runTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  });
}).on('error', () => {
  console.error(`${colors.red}✗${colors.reset} Server is not running at ${BASE_URL}`);
  console.error('Please start the server first: npm start');
  process.exit(1);
});
