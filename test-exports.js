#!/usr/bin/env node

/**
 * Test Export Functionality
 * Tests Word, PDF, and Excel export endpoints
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:3000';

/**
 * Make HTTP POST request
 */
function makeRequest(method, endpoint, bodyData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data)
        });
      });
    });

    req.on('error', reject);

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

/**
 * Test PDF export
 */
async function testPdfExport() {
  console.log('\n📄 Testing PDF Export...');
  
  const sampleData = {
    generatedIDs: [
      {
        promoter: {
          id: '1',
          promoter_id: 'P001',
          full_name: 'John Doe',
          employeeno: 'E001',
          brand: 'Brand A',
          location: 'Manila',
          contact_no: '09123456789',
          date_hired: '2023-01-15',
          division: 'Sales',
          category: 'Promoter',
          emergency_contact: 'Jane Doe',
          contact_person: 'Manager',
          address: 'Manila, Philippines'
        },
        frontCanvas: {
          version: '5.3.0',
          objects: [
            {
              type: 'text',
              left: 50,
              top: 50,
              text: 'EMPLOYEE ID',
              fontSize: 24,
              fontFamily: 'Arial',
              fill: '#000000'
            }
          ],
          width: 1080,
          height: 1920
        },
        backCanvas: {
          version: '5.3.0',
          objects: [
            {
              type: 'text',
              left: 50,
              top: 50,
              text: 'BACK SIDE',
              fontSize: 20,
              fontFamily: 'Arial',
              fill: '#000000'
            }
          ],
          width: 1080,
          height: 1920
        }
      }
    ],
    templateName: 'Test Template',
    layout: 'side-by-side',
    idsPerPage: 1
  };

  try {
    const response = await makeRequest('POST', '/api/export/pdf', sampleData);
    
    if (response.status === 200) {
      const filename = path.join(__dirname, 'test_export.pdf');
      fs.writeFileSync(filename, response.body);
      console.log(`✅ PDF Export Success: ${response.body.length} bytes saved to ${filename}`);
    } else {
      console.error(`❌ PDF Export Failed: Status ${response.status}`);
      console.error(response.body.toString());
    }
  } catch (error) {
    console.error('❌ PDF Export Error:', error.message);
  }
}

/**
 * Test Word export
 */
async function testWordExport() {
  console.log('\n📝 Testing Word Export...');
  
  const sampleData = {
    generatedIDs: [
      {
        promoter: {
          id: '1',
          promoter_id: 'P001',
          full_name: 'John Doe',
          employeeno: 'E001',
          brand: 'Brand A',
          location: 'Manila',
          contact_no: '09123456789',
          date_hired: '2023-01-15',
          division: 'Sales',
          category: 'Promoter',
          emergency_contact: 'Jane Doe',
          contact_person: 'Manager',
          address: 'Manila, Philippines'
        },
        frontCanvas: {
          version: '5.3.0',
          objects: [
            {
              type: 'text',
              left: 50,
              top: 50,
              text: 'EMPLOYEE ID',
              fontSize: 24,
              fontFamily: 'Arial',
              fill: '#000000'
            }
          ],
          width: 1080,
          height: 1920
        },
        backCanvas: {
          version: '5.3.0',
          objects: [
            {
              type: 'text',
              left: 50,
              top: 50,
              text: 'BACK SIDE',
              fontSize: 20,
              fontFamily: 'Arial',
              fill: '#000000'
            }
          ],
          width: 1080,
          height: 1920
        }
      }
    ],
    templateName: 'Test Template',
    layout: 'side-by-side',
    idsPerPage: 1
  };

  try {
    const response = await makeRequest('POST', '/api/export/word', sampleData);
    
    if (response.status === 200) {
      const filename = path.join(__dirname, 'test_export.docx');
      fs.writeFileSync(filename, response.body);
      console.log(`✅ Word Export Success: ${response.body.length} bytes saved to ${filename}`);
    } else {
      console.error(`❌ Word Export Failed: Status ${response.status}`);
      console.error(response.body.toString());
    }
  } catch (error) {
    console.error('❌ Word Export Error:', error.message);
  }
}

/**
 * Test Excel export
 */
async function testExcelExport() {
  console.log('\n📈 Testing Excel Export...');
  
  try {
    const response = await makeRequest('GET', '/api/export/excel');
    
    if (response.status === 200) {
      const filename = path.join(__dirname, 'test_export.xlsx');
      fs.writeFileSync(filename, response.body);
      console.log(`✅ Excel Export Success: ${response.body.length} bytes saved to ${filename}`);
    } else {
      console.error(`❌ Excel Export Failed: Status ${response.status}`);
      console.error(response.body.toString());
    }
  } catch (error) {
    console.error('❌ Excel Export Error:', error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Export Functionality Test Suite');
  console.log('===================================');
  
  try {
    // Wait a moment for server to be ready
    await new Promise(r => setTimeout(r, 2000));
    
    await testPdfExport();
    await testWordExport();
    await testExcelExport();
    
    console.log('\n✅ All tests completed!');
    console.log('Generated files:');
    console.log('  - test_export.pdf');
    console.log('  - test_export.docx');
    console.log('  - test_export.xlsx');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTests().catch(console.error);
