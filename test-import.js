/**
 * Promoter Import Module - Test Suite
 * Tests Excel file upload, validation, and bulk import
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const http = require('http');
const FormData = require('form-data');

/**
 * Create a test Excel file
 */
async function createTestExcelFile(filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Promoters');

  // Headers
  const headers = [
    'employeeno', 'promoter_id', 'first_name', 'last_name', 'full_name',
    'date_hired', 'brand', 'category', 'contact_no', 'address',
    'emergency_contact', 'contact_person', 'location', 'district', 'division', 'hrgen'
  ];

  worksheet.columns = headers.map(header => ({
    header: header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' '),
    key: header,
    width: 15
  }));

  // Add sample data rows
  const testData = [
    {
      employeeno: 'E101', promoter_id: 'P101', first_name: 'Maria', last_name: 'Santos',
      full_name: 'Maria Santos', date_hired: '2023-06-15', brand: 'Brand A',
      category: 'Category 1', contact_no: '+639175551234', address: '123 Main St',
      emergency_contact: '+639175555678', contact_person: 'Juan Santos',
      location: 'Manila', district: 'District 1', division: 'Sales', hrgen: 'HR-101'
    },
    {
      employeeno: 'E102', promoter_id: 'P102', first_name: 'Juan', last_name: 'Dela Cruz',
      full_name: 'Juan Dela Cruz', date_hired: '2023-07-20', brand: 'Brand B',
      category: 'Category 2', contact_no: '+639175559101', address: '456 Oak Ave',
      emergency_contact: '+639175552345', contact_person: 'Maria Dela Cruz',
      location: 'Cebu', district: 'District 2', division: 'Marketing', hrgen: 'HR-102'
    },
    {
      employeeno: 'E103', promoter_id: 'P103', first_name: 'Ana', last_name: 'Garcia',
      full_name: 'Ana Garcia', date_hired: '2023-08-10', brand: 'Brand C',
      category: 'Category 1', contact_no: '+639175553456', address: '789 Pine Rd',
      emergency_contact: '+639175556789', contact_person: 'Pedro Garcia',
      location: 'Davao', district: 'District 3', division: 'Support', hrgen: 'HR-103'
    }
  ];

  testData.forEach(row => {
    worksheet.addRow(row);
  });

  await workbook.xlsx.writeFile(filename);
  return filename;
}

/**
 * Create a test Excel file with missing required columns
 */
async function createBadExcelFile(filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Promoters');

  // Missing first_name column
  const headers = ['employeeno', 'promoter_id', 'last_name', 'brand'];

  worksheet.columns = headers.map(header => ({
    header: header,
    key: header,
    width: 15
  }));

  worksheet.addRow({
    employeeno: 'E999', promoter_id: 'P999', last_name: 'TestUser', brand: 'Brand X'
  });

  await workbook.xlsx.writeFile(filename);
  return filename;
}

/**
 * Upload file via HTTP POST
 */
function uploadFile(filePath, endpoint = '/import-promoters') {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', fileStream);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: form.getHeaders()
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
    form.pipe(req);
  });
}

/**
 * Run import tests
 */
async function runImportTests() {
  console.log('\n🧪 PROMOTER IMPORT MODULE - TEST SUITE\n');
  console.log('=' .repeat(70));

  let passed = 0;
  let failed = 0;
  const testFiles = [];

  try {
    // Test 1: Upload valid Excel file
    console.log('\n✓ TEST 1: Upload valid Excel file with 3 records');
    const testFile1 = path.join(__dirname, 'test_import_valid.xlsx');
    testFiles.push(testFile1);
    
    await createTestExcelFile(testFile1);
    const result1 = await uploadFile(testFile1);

    if (result1.statusCode === 200 && result1.body.success) {
      console.log('  ✅ Status: 200 OK');
      console.log('  ✅ Response has success flag: true');
      console.log('  ✅ Import Summary:');
      console.log(`     - Imported: ${result1.body.summary.imported_count}`);
      console.log(`     - Updated: ${result1.body.summary.updated_count}`);
      console.log(`     - Failed: ${result1.body.summary.failed_count}`);
      console.log(`     - Total Processed: ${result1.body.summary.total_rows_processed}`);
      
      if (result1.body.errors && result1.body.errors.length > 0) {
        console.log('  ⚠️  Errors:');
        result1.body.errors.forEach(err => console.log(`     - ${err}`));
      }
      passed++;
    } else {
      console.log('  ❌ Failed: Wrong status or missing success flag');
      console.log('  Response:', result1.body);
      failed++;
    }

    // Test 2: Upload Excel file with missing required columns
    console.log('\n✓ TEST 2: Upload Excel with missing required columns');
    const testFile2 = path.join(__dirname, 'test_import_bad.xlsx');
    testFiles.push(testFile2);
    
    await createBadExcelFile(testFile2);
    const result2 = await uploadFile(testFile2);

    if (result2.statusCode === 400 && result2.body.error) {
      console.log('  ✅ Status: 400 Bad Request');
      console.log(`  ✅ Error caught: "${result2.body.error}"`);
      passed++;
    } else {
      console.log('  ❌ Failed: Should return 400 error');
      console.log('  Response:', result2.body);
      failed++;
    }

    // Test 3: Upload without file
    console.log('\n✓ TEST 3: Upload without file (error handling)');
    const form = new FormData();
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/import-promoters',
      method: 'POST',
      headers: form.getHeaders()
    };

    const result3 = await new Promise((resolve, reject) => {
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
      form.pipe(req);
    });

    if (result3.statusCode === 400 && result3.body.error) {
      console.log('  ✅ Status: 400 Bad Request');
      console.log(`  ✅ Error message: "${result3.body.error}"`);
      passed++;
    } else {
      console.log('  ❌ Failed: Should return 400 error');
      console.log('  Response:', result3.statusCode, result3.body);
      failed++;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 TEST RESULTS: ${passed} passed, ${failed} failed\n`);

    if (failed === 0) {
      console.log('✅ ALL IMPORT MODULE TESTS PASSED!\n');
    } else {
      console.log(`⚠️  Some tests failed. Please review.\n`);
    }

  } catch (err) {
    console.error('❌ Test Error:', err.message);
    failed++;
  } finally {
    // Cleanup test files
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Check if form-data package is available
try {
  require('form-data');
  runImportTests();
} catch (e) {
  console.log('⚠️  form-data package not installed. Installing...');
  console.log('Please run: npm install form-data');
  console.log('Then run: node test-import.js');
  process.exit(1);
}
