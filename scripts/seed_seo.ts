import 'dotenv/config';
import db from '../src/lib/db';

async function main() {
  const settings = [
    {
      key: 'seo_title',
      value: 'TroveSeek | Elevate Your Digital Commerce'
    },
    {
      key: 'seo_description',
      value: 'TroveSeek is a premium digital commerce platform offering bespoke SaaS solutions, exclusive digital assets, and cutting-edge professional services to scale your business globally.'
    }
  ];

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value }
    });
  }

  console.log('SEO settings seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Process will exit
  });
