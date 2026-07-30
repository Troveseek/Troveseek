const { createClient } = require('@libsql/client');
const c = createClient({ url: 'file:./dev.db' });
c.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 5")
  .then(r => { console.log('OK tables:', r.rows.length, r.rows.map(x => x.name).join(', ')); process.exit(0); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
