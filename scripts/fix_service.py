import re

file_path = "e:/jibli_app/jibli_app/troveseek/web/src/app/(client)/services/[slug]/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add getLocale import
if "import { getLocale } from 'next-intl/server';" not in content:
    content = content.replace("import db from '@/lib/db';", "import db from '@/lib/db';\nimport { getLocale } from 'next-intl/server';")

# Add isAr extraction to generateMetadata
if "const locale = await getLocale();" not in content.split("export default async function")[0]:
    content = re.sub(
        r"(export async function generateMetadata.*?{)(.*?)(const service = await db\.service)",
        r"\1\2const locale = await getLocale();\n  const isAr = locale === 'ar';\n  \3",
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"title: service\.metaTitle \|\| service\.name,",
        r"title: (isAr ? (service.metaTitleAr || service.nameAr) : (service.metaTitle || service.name)) || service.name,",
        content
    )
    content = re.sub(
        r"description: service\.metaDescription \|\| service\.description,",
        r"description: (isAr ? (service.metaDescriptionAr || service.descriptionAr) : (service.metaDescription || service.description)) || service.description,",
        content
    )

# Add isAr extraction to ServiceDetailPage
if "const locale = await getLocale();" not in content.split("export default async function")[1]:
    content = re.sub(
        r"export default async function ServiceDetailPage\(\{ params \}: \{ params: Promise<\{ slug: string \}> \}\) \{",
        r"export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {\n  const locale = await getLocale();\n  const isAr = locale === 'ar';",
        content
    )

# Replace JSON parsing
json_parsing = """  let process = [];
  let portfolio = [];
  let testimonials = [];
  let tiers = [];
  
  try { if (isAr && service.processAr && service.processAr !== "[]") process = JSON.parse(service.processAr); else if (service.process && service.process !== "[]") process = JSON.parse(service.process); } catch(e){}
  try { if (isAr && service.portfolioAr && service.portfolioAr !== "[]") portfolio = JSON.parse(service.portfolioAr); else if (service.portfolio && service.portfolio !== "[]") portfolio = JSON.parse(service.portfolio); } catch(e){}
  try { if (isAr && service.testimonialsAr && service.testimonialsAr !== "[]") testimonials = JSON.parse(service.testimonialsAr); else if (service.testimonials && service.testimonials !== "[]") testimonials = JSON.parse(service.testimonials); } catch(e){}
  try { if (isAr && service.tiersAr && service.tiersAr !== "[]") tiers = JSON.parse(service.tiersAr); else if (service.tiers && service.tiers !== "[]") tiers = JSON.parse(service.tiers); } catch(e){}"""

content = re.sub(
    r"  let process = \[\];.*?try \{ if \(service\.tiers && service\.tiers !== \"\[\]\"\) tiers = JSON\.parse\(service\.tiers\); \} catch\(e\)\{\}",
    json_parsing,
    content,
    flags=re.DOTALL
)

replacements = [
    (r"> Back to Services", r"> {isAr ? 'العودة للخدمات' : 'Back to Services'}"),
    (r">\{service\.name\}<", r">{isAr && service.nameAr ? service.nameAr : service.name}<"),
    (r">\{service\.description\}<", r">{isAr && service.descriptionAr ? service.descriptionAr : service.description}<"),
    (r">Request a Quote<", r">{isAr ? 'اطلب عرض سعر' : 'Request a Quote'}<"),
    (r"<Button variant=\"secondary\" size=\"lg\">View Portfolio</Button>", r"<a href=\"#portfolio\" style={{textDecoration: 'none'}}><Button variant=\"secondary\" size=\"lg\">{isAr ? 'عرض الأعمال' : 'View Portfolio'}</Button></a>"),
    (r">How We Work<", r">{isAr ? 'كيف نعمل' : 'How We Work'}<"),
    (r">Our Process<", r">{isAr ? 'عمليتنا' : 'Our Process'}<"),
    (r"Client: \{proj\.client\}", r"{isAr ? 'العميل' : 'Client'}: {proj.client}"),
    (r">Project Preview<", r">{isAr ? 'معاينة المشروع' : 'Project Preview'}<"),
    (r">Our Work<", r">{isAr ? 'أعمالنا' : 'Our Work'}<"),
    (r">Recent Projects<", r">{isAr ? 'المشاريع الحديثة' : 'Recent Projects'}<"),
    (r">Client Feedback<", r">{isAr ? 'آراء العملاء' : 'Client Feedback'}<"),
    (r">What Our Clients Say<", r">{isAr ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}<"),
    (r">Transparent Pricing<", r">{isAr ? 'تسعير شفاف' : 'Transparent Pricing'}<"),
    (r">Choose Your Tier<", r">{isAr ? 'اختر الباقة' : 'Choose Your Tier'}<"),
    (r"Most Popular<", r">{isAr ? 'الأكثر شعبية' : 'Most Popular'}<"),
    (r">Starting from<", r">{isAr ? 'يبدأ من' : 'Starting from'}<"),
    (r">Get Started<", r">{isAr ? 'ابدأ الآن' : 'Get Started'}<"),
    (r">Ready to Start Your Project\?<", r">{isAr ? 'هل أنت مستعد لبدء مشروعك؟' : 'Ready to Start Your Project?'}<"),
    (r">[\s]*Contact our team to discuss your requirements and receive a detailed proposal within 24 hours\.[\s]*<", r">\n            {isAr ? 'تواصل مع فريقنا لمناقشة متطلباتك وسنرسل لك عرضاً تفصيلياً خلال 24 ساعة.' : 'Contact our team to discuss your requirements and receive a detailed proposal within 24 hours.'}\n          <"),
    (r">Request a Free Quote<", r">{isAr ? 'اطلب عرض سعر مجاني' : 'Request a Free Quote'}<"),
    (r">Chat with Us<", r">{isAr ? 'تحدث معنا' : 'Chat with Us'}<")
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Fix portfolio ID specifically
content = content.replace("Our Work</div>", "Our Work</div>").replace("<section>", "<section id=\"portfolio\">", 1)
# actually the first <section> is Process. The second one is Portfolio. Let's do it right.
content = content.replace("Our Work</div>", "Our Work</div>").replace("{/* Portfolio */}\n        {portfolio.length > 0 && (\n          <section>", "{/* Portfolio */}\n        {portfolio.length > 0 && (\n          <section id=\"portfolio\">")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
