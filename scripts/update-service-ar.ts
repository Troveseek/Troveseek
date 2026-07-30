import db from '../src/lib/db';

async function main() {
  const arabicText = 'خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية خدمة تجريبية';

  await db.service.updateMany({
    where: {
      name: 'test service'
    },
    data: {
      descriptionAr: arabicText,
    }
  });
  console.log('Updated service descriptions to Arabic');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });
