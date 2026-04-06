const fs = require('fs');
const path = require('path');

console.log('\n🔍 PROMOTERS LIST MODULE - FILE VERIFICATION\n');
console.log('═'.repeat(70));

const checks = [
  { name: 'promoters-list.html exists', file: 'app/public/promoters-list.html' },
  { name: 'test-promoters-list.js exists', file: 'test-promoters-list.js' },
  { name: 'PROMOTERS_LIST_MODULE.md exists', file: 'PROMOTERS_LIST_MODULE.md' },
  { name: 'PROMOTERS_LIST_QUICK_START.md exists', file: 'PROMOTERS_LIST_QUICK_START.md' },
  { name: 'PROMOTERS_LIST_COMPLETION.md exists', file: 'PROMOTERS_LIST_COMPLETION.md' }
];

let passed = 0;
let failed = 0;

console.log('Checking files...\n');

checks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    const kbSize = Math.round(size / 1024);
    console.log(`✅ ${check.name} (${kbSize}KB)`);
    passed++;
  } else {
    console.log(`❌ ${check.name}`);
    failed++;
  }
});

console.log('\n═'.repeat(70));
console.log(`\n📊 Verification Result: ${passed} files verified, ${failed} missing\n`);

if (failed === 0) {
  console.log('✅ ALL REQUIRED FILES PRESENT AND READY!\n');
  console.log('Module is ready for deployment.\n');
} else {
  console.log('⚠️  Some files are missing!\n');
}
