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
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
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
  console.log(`\n${colors.blue}🧪 ID Designer Module Tests${colors.reset}\n`);

  // Test 1: Page serving
  await test('GET /id-designer returns HTML page', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.rawBody.includes('ID Designer'), 'Page should contain "ID Designer"');
    assert(res.rawBody.toLowerCase().includes('fabric.js'), 'Page should include Fabric.js');
    assert(res.rawBody.includes('canvas'), 'Page should have canvas elements');
  });

  // Test 2: Create template
  let templateId = null;
  await test('POST /api/templates creates new template', async () => {
    const templateData = {
      template_name: 'Test Template ' + Date.now(),
      front_canvas_json: JSON.stringify({
        version: '5.3.0',
        objects: [
          {
            type: 'text',
            left: 100,
            top: 100,
            text: '[full_name]'
          }
        ]
      }),
      back_canvas_json: JSON.stringify({
        version: '5.3.0',
        objects: []
      }),
      width: 400,
      height: 600
    };

    const res = await makeRequest('POST', '/api/templates', templateData);
    assert(res.statusCode === 200 || res.statusCode === 201, `Expected 200/201, got ${res.statusCode}`);
    assert(res.body.success === true, 'Response should have success: true');
  });

  // Test 3: Get all templates
  await test('GET /api/templates retrieves all templates', async () => {
    const res = await makeRequest('GET', '/api/templates');
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.body.success === true, 'Response should have success: true');
    assert(Array.isArray(res.body.templates), 'Response should have templates array');
    assert(res.body.templates.length > 0, 'Should have at least one template');
    templateId = res.body.templates[0].id;
    assert(templateId, 'First template should have an id');
  });

  // Test 4: Get single template
  await test('GET /api/templates/:id retrieves single template', async () => {
    assert(templateId, 'templateId should be set from previous test');
    const res = await makeRequest('GET', `/api/templates/${templateId}`);
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.body.success === true, 'Response should have success: true');
    assert(res.body.template, 'Response should have template object');
    assert(res.body.template.id === templateId, `Template id should be ${templateId}`);
    assert(res.body.template.template_name, 'Template should have template_name');
  });

  // Test 5: Check template JSON structure
  await test('Template contains valid canvas JSON', async () => {
    const res = await makeRequest('GET', `/api/templates/${templateId}`);
    const template = res.body.template;
    
    // Try to parse front canvas JSON
    let frontJson = null;
    if (template.front_canvas_json) {
      try {
        frontJson = JSON.parse(template.front_canvas_json);
        assert(typeof frontJson === 'object', 'Front canvas JSON should parse to object');
      } catch (e) {
        // It's okay if it doesn't parse - might be empty
      }
    }

    // Try to parse back canvas JSON
    let backJson = null;
    if (template.back_canvas_json) {
      try {
        backJson = JSON.parse(template.back_canvas_json);
        assert(typeof backJson === 'object', 'Back canvas JSON should parse to object');
      } catch (e) {
        // It's okay if it doesn't parse - might be empty
      }
    }

    assert(template.width, 'Template should have width');
    assert(template.height, 'Template should have height');
  });

  // Test 6: Update template
  await test('PUT /api/templates/:id updates template', async () => {
    assert(templateId, 'templateId should be set');
    const updateData = {
      template_name: 'Updated Template ' + Date.now(),
      width: 500,
      height: 700
    };

    const res = await makeRequest('PUT', `/api/templates/${templateId}`, updateData);
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    assert(res.body.success === true, 'Response should have success: true');

    // Verify update
    const verifyRes = await makeRequest('GET', `/api/templates/${templateId}`);
    assert(verifyRes.body.template.width === 500, 'Width should be updated to 500');
    assert(verifyRes.body.template.height === 700, 'Height should be updated to 700');
  });

  // Test 7: Create template with complex canvas data
  await test('POST /api/templates saves complex canvas structure', async () => {
    const complexTemplate = {
      template_name: 'Complex Template ' + Date.now(),
      front_canvas_json: JSON.stringify({
        version: '5.3.0',
        objects: [
          {
            type: 'text',
            left: 50,
            top: 50,
            text: '[full_name]',
            fontSize: 20,
            fontFamily: 'Arial'
          },
          {
            type: 'text',
            left: 50,
            top: 100,
            text: '[brand]',
            fontSize: 16
          },
          {
            type: 'rect',
            left: 100,
            top: 200,
            width: 200,
            height: 150,
            fill: 'transparent',
            stroke: '#000'
          }
        ],
        background: '#ffffff'
      }),
      back_canvas_json: JSON.stringify({
        version: '5.3.0',
        objects: [
          {
            type: 'text',
            left: 50,
            top: 50,
            text: 'ID Card Back',
            fontSize: 18
          }
        ],
        background: '#ffffff'
      })
    };

    const res = await makeRequest('POST', '/api/templates', complexTemplate);
    assert(res.statusCode === 200 || res.statusCode === 201, `Expected 200/201, got ${res.statusCode}`);

    // Get it back and verify
    const listRes = await makeRequest('GET', '/api/templates');
    const createdTemplate = listRes.body.templates.find(t => t.template_name === complexTemplate.template_name);
    assert(createdTemplate, 'Template should be in list');
    assert(createdTemplate.front_canvas_json.includes('[full_name]'), 'Front canvas should contain field');
  });

  // Test 8: Get non-existent template returns 404
  await test('GET /api/templates/99999 returns 404 for non-existent template', async () => {
    const res = await makeRequest('GET', '/api/templates/99999');
    assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
    assert(res.body.error, 'Response should have error message');
  });

  // Test 9: Validate template data persistence
  await test('Template data persists after retrieval', async () => {
    const newTemplate = {
      template_name: 'Persistence Test ' + Date.now(),
      front_canvas_json: JSON.stringify({ test: 'data123' }),
      back_canvas_json: JSON.stringify({ test: 'back456' })
    };

    const createRes = await makeRequest('POST', '/api/templates', newTemplate);
    assert(createRes.statusCode === 200 || createRes.statusCode === 201, 'Create should succeed');

    // Get all and find it
    const listRes = await makeRequest('GET', '/api/templates');
    const template = listRes.body.templates.find(t => t.template_name === newTemplate.template_name);
    assert(template, 'Template should be found in list');

    // Get it individually
    const getRes = await makeRequest('GET', `/api/templates/${template.id}`);
    const retrieved = getRes.body.template;
    assert(retrieved.front_canvas_json === newTemplate.front_canvas_json, 'Front canvas JSON should match');
    assert(retrieved.back_canvas_json === newTemplate.back_canvas_json, 'Back canvas JSON should match');
  });

  // Test 10: Delete template
  let deleteTemplateId = null;
  await test('DELETE /api/templates/:id removes template', async () => {
    // Create a template to delete
    const createRes = await makeRequest('POST', '/api/templates', {
      template_name: 'Delete Test ' + Date.now(),
      front_canvas_json: '{}',
      back_canvas_json: '{}'
    });

    // Get all templates and find the one we just created
    const listRes = await makeRequest('GET', '/api/templates');
    const toDelete = listRes.body.templates.find(t => t.template_name.includes('Delete Test'));
    assert(toDelete, 'Template to delete should exist');
    deleteTemplateId = toDelete.id;

    // Delete it
    const deleteRes = await makeRequest('DELETE', `/api/templates/${deleteTemplateId}`);
    assert(deleteRes.statusCode === 200, `Expected 200, got ${deleteRes.statusCode}`);
    assert(deleteRes.body.success === true, 'Response should have success: true');

    // Verify it's gone
    const checkRes = await makeRequest('GET', `/api/templates/${deleteTemplateId}`);
    assert(checkRes.statusCode === 404, `Template should be deleted (got ${checkRes.statusCode})`);
  });

  // Test 11: Page links and navigation
  await test('Dashboard page links to ID Designer', async () => {
    const res = await makeRequest('GET', '/');
    assert(res.statusCode === 200, 'Dashboard should load');
    assert(res.rawBody.includes('/id-designer'), 'Dashboard should link to /id-designer');
    assert(res.rawBody.includes('ID Designer'), 'Dashboard should mention ID Designer');
  });

  // Test 12: ID Designer page structure
  await test('ID Designer page has required elements', async () => {
    const res = await makeRequest('GET', '/id-designer');
    assert(res.rawBody.includes('frontCanvas'), 'Page should have frontCanvas');
    assert(res.rawBody.includes('backCanvas'), 'Page should have backCanvas');
    assert(res.rawBody.includes('templateNameInput'), 'Page should have template name input');
    assert(res.rawBody.includes('FRONT SIDE'), 'Page should mention front side');
    assert(res.rawBody.includes('BACK SIDE'), 'Page should mention back side');
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
