const http = require('http');

console.log('\n🧪 PROMOTERS LIST MODULE - TEST SUITE\n');
console.log('═'.repeat(70));

let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Test 1: Get all promoters
async function testGetAllPromoters() {
  console.log('\n✓ TEST 1: Get all promoters');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/promoters',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.json.success && Array.isArray(response.json.promoters)) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Found: ${response.json.promoters.length} promoters`);
      testsPassed++;
      return response.json.promoters;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
      return [];
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
    return [];
  }
}

// Test 2: Filter by search parameter
async function testFilterSearch() {
  console.log('\n✓ TEST 2: Filter by search parameter');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/promoters?search=maria',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.json.success) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Search results: ${response.json.promoters.length} records`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 3: Filter by brand
async function testFilterBrand() {
  console.log('\n✓ TEST 3: Filter by brand parameter');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/promoters?brand=Brand%20A',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.json.success) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Brand filter: ${response.json.promoters.length} records`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 4: Filter by location
async function testFilterLocation() {
  console.log('\n✓ TEST 4: Filter by location parameter');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/promoters?location=Manila',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.json.success) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Location filter: ${response.json.promoters.length} records`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 5: Multiple filters combined
async function testMultipleFilters() {
  console.log('\n✓ TEST 5: Multiple filters combined');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/promoters?name=Maria&brand=Brand%20A',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.json.success) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Combined filters: ${response.json.promoters.length} records`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 6: Serve Promoters List page
async function testPromotersPage() {
  console.log('\n✓ TEST 6: Serve Promoters List page (GET /promoters)');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/promoters',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.body.includes('Promoters List')) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Page contains: "Promoters List"`);
      console.log(`  ✅ HTML size: ${Math.round(response.body.length / 1024)}KB`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 7: Export promoters endpoint exists
async function testExportEndpoint() {
  console.log('\n✓ TEST 7: Export promoters endpoint');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/export-promoters',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.headers['content-type'].includes('spreadsheet')) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Content-Type: ${response.headers['content-type']}`);
      console.log(`  ✅ File size: ${response.body.length} bytes`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}, Content-Type: ${response.headers['content-type']}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 8: Export with filters
async function testExportWithFilters() {
  console.log('\n✓ TEST 8: Export with filters');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/export-promoters?search=maria&brand=Brand%20A',
      method: 'GET'
    });

    if (response.statusCode === 200 && response.headers['content-type'].includes('spreadsheet')) {
      console.log(`  ✅ Status: 200 OK`);
      console.log(`  ✅ Filtered export: ${response.body.length} bytes`);
      testsPassed++;
    } else {
      console.log(`  ❌ Failed: Status ${response.statusCode}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    testsFailed++;
  }
}

// Run all tests
async function runAllTests() {
  const promoters = await testGetAllPromoters();
  await testFilterSearch();
  await testFilterBrand();
  await testFilterLocation();
  await testMultipleFilters();
  await testPromotersPage();
  await testExportEndpoint();
  await testExportWithFilters();

  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed\n`);

  if (testsFailed === 0) {
    console.log('✅ ALL PROMOTERS LIST MODULE TESTS PASSED!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review.\n');
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Start tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
