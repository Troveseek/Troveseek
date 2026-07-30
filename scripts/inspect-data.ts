import db from '../src/lib/db';

async function main() {
  const products = await db.product.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('Products:', products);

  const saas = await db.saaS.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('SaaS:', saas);

  const services = await db.service.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('Services:', services);

  const categories = await db.category.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('Categories:', categories);

  const blogs = await db.blogPost.findMany({ select: { id: true, title: true, titleAr: true } });
  console.log('Blogs:', blogs);

  const team = await db.teamMember.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('Team:', team);

  const testimonials = await db.testimonial.findMany({ select: { id: true, name: true, nameAr: true } });
  console.log('Testimonials:', testimonials);

  const gallery = await db.galleryImage.findMany({ select: { id: true, title: true, titleAr: true } });
  console.log('Gallery:', gallery);

  const heroes = await db.pageHero.findMany({ select: { id: true, title: true, titleAr: true } });
  console.log('Heroes:', heroes);
}

main().catch(console.error).finally(() => process.exit(0));
