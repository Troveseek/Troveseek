const db = require('./src/lib/db').default;

async function run() {
  try {
    const res = await db.siteSetting.findMany();
    console.log('OK, got site settings:', res.length);
    process.exit(0);
  } catch (e) {
    console.error('Error in findMany:', e);
    process.exit(1);
  }
}

run();
