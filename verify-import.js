const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/promoters.db');

db.all('SELECT employeeno, first_name, last_name, promoter_id, category FROM promoters ORDER BY created_at DESC LIMIT 5', (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('\n📊 Last 5 Imported Records:');
    console.log('═'.repeat(80));
    rows.forEach(r => {
      console.log(`  • ${r.employeeno} | ${r.first_name} ${r.last_name} | ${r.promoter_id} | ${r.category}`);
    });
    console.log('═'.repeat(80));
  }
  db.close();
});
