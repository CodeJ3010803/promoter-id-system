/**
 * Check Database and Display Current Records
 */

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/promoters.db', (err) => {
  if (err) {
    console.error('Database Error:', err);
    process.exit(1);
  }

  console.log('📋 Current Promoters in Database:');
  console.log('=' .repeat(60));
  
  db.all('SELECT id, promoter_id, full_name, employeeno, brand, location FROM promoters ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Query Error:', err);
    } else if (rows && rows.length > 0) {
      rows.forEach((r, i) => {
        console.log(`${i + 1}. ${r.full_name}`);
        console.log(`   └─ ID: ${r.promoter_id} | Employee: ${r.employeeno} | Brand: ${r.brand} | Location: ${r.location}`);
      });
    } else {
      console.log('No promoters found');
    }

    console.log('\n📐 Current Templates in Database:');
    console.log('=' .repeat(60));
    
    db.all('SELECT id, template_name, width, height FROM id_templates ORDER BY id DESC', (err, templates) => {
      if (err) {
        console.error('Query Error:', err);
      } else if (templates && templates.length > 0) {
        templates.forEach((t, i) => {
          console.log(`${i + 1}. ${t.template_name}`);
          console.log(`   └─ ID: ${t.id} | Size: ${t.width}x${t.height}px`);
        });
      } else {
        console.log('No templates found');
      }

      db.close();
    });
  });
});
