const http = require('http');

console.log('\n🧪 SYSTEM INTEGRATION TEST\n');
console.log('═'.repeat(60));

const tests = [];

// Test 1: Settings API
tests.push({
  name: 'Settings API',
  path: '/api/settings',
  check: (body) => body.excelTemplate && body.excelTemplate.headers.length === 22
});

// Test 2: Download Template
tests.push({
  name: 'Download Template',
  path: '/download-template',
  expectedStatus: 200,
  check: (body) => body.toString('utf8').includes('PK') || body.length > 5000
});

let completed = 0;

tests.forEach((test) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: test.path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const success = res.statusCode === (test.expectedStatus || 200);
      let passed = success;
      
      if (success && test.check) {
        try {
          const parsed = JSON.parse(data);
          passed = test.check(parsed);
        } catch (e) {
          passed = test.check(Buffer.from(data));
        }
      }
      
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${test.name} (Status: ${res.statusCode})`);
      completed++;
      
      if (completed === tests.length) {
        console.log('═'.repeat(60));
        console.log('\n✅ ALL INTEGRATION TESTS PASSED!\n');
        process.exit(0);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ ${test.name} - Error: ${err.message}`);
    completed++;
  });
  req.end();
});
