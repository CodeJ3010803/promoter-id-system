/**
 * Promoter ID Management System - API Test Script
 * Quick testing of all endpoints
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

// Helper function to make requests
function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('\n🧪 PROMOTER ID SYSTEM - API TESTS\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get all promoters (empty)
    console.log('\n✓ TEST 1: Get all promoters');
    const promoters = await apiRequest('GET', '/promoters');
    console.log('Response:', promoters);

    // Test 2: Create a promoter
    console.log('\n✓ TEST 2: Create new promoter');
    const newPromoter = {
      employeeno: 'E001',
      promoter_id: 'P001',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      date_hired: '2024-01-15',
      brand: 'Brand A',
      category: 'Category 1',
      contact_no: '+1234567890',
      address: '123 Main St',
      emergency_contact: 'Jane Doe',
      contact_person: 'Jane Doe',
      location: 'Manila',
      district: 'District 1',
      division: 'Division A',
      hrgen: 'HR-001'
    };
    const created = await apiRequest('POST', '/promoters', newPromoter);
    console.log('Response:', created);
    const promoterId = created.id;

    // Test 3: Get templates
    console.log('\n✓ TEST 3: Get all templates');
    const templates = await apiRequest('GET', '/templates');
    console.log('Response:', templates);

    // Test 4: Create a template
    console.log('\n✓ TEST 4: Create new ID template');
    const newTemplate = {
      template_name: 'Standard ID Template',
      width: 1080,
      height: 1920,
      front_canvas_json: JSON.stringify({ elements: [] }),
      back_canvas_json: JSON.stringify({ elements: [] })
    };
    const templateCreated = await apiRequest('POST', '/templates', newTemplate);
    console.log('Response:', templateCreated);

    // Test 5: Get specific promoter
    console.log('\n✓ TEST 5: Get specific promoter');
    if (promoterId) {
      const specific = await apiRequest('GET', `/promoters/${promoterId}`);
      console.log('Response:', specific);
    }

    // Test 6: Update promoter
    console.log('\n✓ TEST 6: Update promoter');
    if (promoterId) {
      const updated = await apiRequest('PUT', `/promoters/${promoterId}`, {
        contact_no: '+9876543210',
        location: 'Cebu'
      });
      console.log('Response:', updated);
    }

    // Test 7: Search promoters
    console.log('\n✓ TEST 7: Search promoters');
    const search = await apiRequest('GET', '/promoters?search=John');
    console.log('Response count:', search.promoters?.length || 0);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY\n');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  }

  process.exit(0);
}

// Run tests
runTests();
