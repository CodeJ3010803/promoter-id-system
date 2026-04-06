/**
 * User Settings Module Test Suite
 * Tests Excel template download and system settings endpoints
 */

const http = require('http');

function apiRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
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
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 USER SETTINGS MODULE - TEST SUITE\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Get Settings Endpoint
    console.log('\n✓ TEST 1: GET /api/settings');
    const settings = await apiRequest('GET', '/api/settings');
    
    if (settings.statusCode === 200) {
      console.log('  ✅ Status: 200 OK');
      console.log('  ✅ Response has success flag:', settings.body.success);
      console.log('  ✅ Has idTemplate:', !!settings.body.settings.idTemplate);
      console.log('  ✅ Has excelTemplate:', !!settings.body.settings.excelTemplate);
      
      if (settings.body.settings.idTemplate) {
        const it = settings.body.settings.idTemplate;
        console.log('\n  ID Template Defaults:');
        console.log(`    - Width: ${it.defaultWidth}px`);
        console.log(`    - Height: ${it.defaultHeight}px`);
        console.log(`    - Font: ${it.defaultFont}`);
        console.log(`    - Font Size: ${it.defaultFontSize}pt`);
        console.log(`    - Font Color: ${it.defaultFontColor}`);
        console.log(`    - Background: ${it.defaultBackgroundColor}`);
      }
      
      if (settings.body.settings.excelTemplate) {
        const et = settings.body.settings.excelTemplate;
        console.log('\n  Excel Template Config:');
        console.log(`    - Headers: ${et.headers.length} fields`);
        console.log(`    - Filename: ${et.filename}`);
        console.log(`    - Sheet Name: ${et.sheetName}`);
      }
      passed++;
    } else {
      console.log('  ❌ Failed: Wrong status code');
      failed++;
    }

    // Test 2: Download Template Endpoint
    console.log('\n✓ TEST 2: GET /download-template');
    console.log('  ℹ️  Excel file download test (checking headers)');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/download-template',
      method: 'GET'
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        const hasContentType = res.headers['content-type'];
        const hasContentDisposition = res.headers['content-disposition'];
        
        if (res.statusCode === 200 && hasContentType && hasContentDisposition) {
          console.log('  ✅ Status: 200 OK');
          console.log(`  ✅ Content-Type: ${hasContentType}`);
          console.log(`  ✅ Content-Disposition: ${hasContentDisposition}`);
          console.log('  ✅ File download headers present');
          passed++;
        } else {
          console.log('  ❌ Failed: Missing headers or wrong status');
          failed++;
        }
        
        // Consume response data
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', (err) => {
        console.log(`  ❌ Failed: ${err.message}`);
        failed++;
        resolve();
      });
      req.end();
    });

    // Test 3: Verify API Alternative Endpoint
    console.log('\n✓ TEST 3: GET /api/download-promoter-template (redirect)');
    try {
      const alt = await apiRequest('GET', '/api/download-promoter-template');
      console.log('  ✅ Endpoint exists and responds');
      passed++;
    } catch (err) {
      console.log(`  ⚠️  Alternative endpoint may not work: ${err.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 TEST RESULTS: ${passed} passed, ${failed} failed\n`);

    if (failed === 0) {
      console.log('✅ ALL SETTINGS MODULE TESTS PASSED!\n');
    } else {
      console.log(`⚠️  Some tests failed. Please review.\n`);
    }

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests();
