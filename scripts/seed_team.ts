import 'dotenv/config';
import db from '../src/lib/db';

async function main() {
  console.log('Seeding team members...');

  await db.teamMember.deleteMany({}); // Clear existing team members

  const members = [
    {
      name: 'Bouketir Djaber',
      nameAr: 'جابر بوكثير',
      role: 'Founder & CEO, Full Stack Developer',
      roleAr: 'المؤسس والرئيس التنفيذي، مطور شامل',
      bio: 'Visionary Founder, CEO, and Full Stack Developer. Passionate about building robust scalable architectures and guiding the technical and strategic vision of the company.',
      bioAr: 'المؤسس والرئيس التنفيذي ومطور واجهات متكاملة برؤية استراتيجية. يمتلك خبرة عميقة في قيادة وتطوير البنى التحتية القابلة للتوسع، وتوجيه الرؤية التقنية والاستراتيجية للشركة.',
      linkedIn: 'https://www.linkedin.com/in/boukthir-djaber',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Hadil Naggar',
      nameAr: 'هديل نجار',
      role: 'HR & Media Manager, AI Engineer',
      roleAr: 'مديرة الموارد البشرية والإعلام، مهندسة ذكاء اصطناعي',
      bio: 'HR and Media Manager with a unique background as a 4-year AI Engineer from Setif. She bridges the gap between technical excellence in AI and strategic talent acquisition, while also leading design and media initiatives.',
      bioAr: 'مديرة الموارد البشرية والإعلام، بلمسة تصميمية وخلفية فريدة كمهندسة ذكاء اصطناعي لمدة 4 سنوات في سطيف. تجمع بين التميز التقني وإدارة المواهب الاستراتيجية، وتقود مبادرات التصميم والإعلام بنجاح.',
      linkedIn: 'https://www.linkedin.com/in/hadil-naggar',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Seghir Bouali Zineddine',
      nameAr: 'صغير بوعلي زين الدين',
      role: 'COO & Video Editor',
      roleAr: 'مدير العمليات ومحرر فيديو',
      bio: 'Chief Operating Officer and Lead Video Editor. He ensures seamless day-to-day operations across all TroveSeek departments while simultaneously directing high-impact visual media and video editing campaigns.',
      bioAr: 'مدير العمليات والمحرر الرئيسي للفيديو. يضمن سير العمليات اليومية بسلاسة عبر جميع الأقسام بالتزامن مع قيادة وإخراج حملات الوسائط المرئية عالية التأثير والمحتوى الإبداعي.',
      linkedIn: 'https://www.linkedin.com/in/zghir-bouali-zinediin',
      displayOrder: 3,
      isActive: true,
    }
  ];

  for (const member of members) {
    await db.teamMember.create({
      data: member
    });
    console.log(`Created team member: ${member.name}`);
  }

  console.log('Team seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Process will exit
  });
