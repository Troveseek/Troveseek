import re

file_path = "e:/jibli_app/jibli_app/troveseek/web/src/app/(client)/blog/[slug]/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add getLocale import
if "import { getLocale } from 'next-intl/server';" not in content:
    content = content.replace("import db from '@/lib/db';", "import db from '@/lib/db';\nimport { getLocale } from 'next-intl/server';")

# generateMetadata
if "const locale = await getLocale();" not in content.split("export default async function")[0]:
    content = re.sub(
        r"(export async function generateMetadata.*?{)(.*?)(const post = await db\.blogPost)",
        r"\1\2const locale = await getLocale();\n  const isAr = locale === 'ar';\n  \3",
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r"title: post\.metaTitle \|\| post\.title,",
        r"title: (isAr ? (post.metaTitleAr || post.titleAr) : (post.metaTitle || post.title)) || post.title,",
        content
    )
    content = re.sub(
        r"description: post\.metaDescription \|\| post\.excerpt,",
        r"description: (isAr ? (post.metaDescriptionAr || post.excerptAr) : (post.metaDescription || post.excerpt)) || post.excerpt,",
        content
    )

# BlogPostPage
if "const locale = await getLocale();" not in content.split("export default async function")[1]:
    content = re.sub(
        r"export default async function BlogPostPage\(\{ params \}: \{ params: Promise<\{ slug: string \}> \}\) \{",
        r"export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {\n  const locale = await getLocale();\n  const isAr = locale === 'ar';",
        content
    )

content = re.sub(
    r"tags = JSON\.parse\(post\.tags \|\| '\[\]'\);",
    r"tags = JSON.parse((isAr ? post.tagsAr : post.tags) || post.tags || '[]');",
    content
)

content = re.sub(
    r"let htmlWithIds = post\.content \|\| '';",
    r"let htmlWithIds = (isAr ? post.contentAr : post.content) || post.content || '';",
    content
)

replacements = [
    (r"<Link href=\"/\">Home</Link> / <Link href=\"/blog\">Blog</Link> \{post\.category \? `/ \$\{post\.category\}` : ''\} / \{post\.title\}", r"<Link href=\"/\">{isAr ? 'الرئيسية' : 'Home'}</Link> / <Link href=\"/blog\">{isAr ? 'المدونة' : 'Blog'}</Link> {post.category ? `/ ${post.category}` : ''} / {isAr ? (post.titleAr || post.title) : post.title}"),
    (r"'Recently'", r"(isAr ? 'مؤخراً' : 'Recently')"),
    (r">\{post\.title\}</h1>", r">{isAr ? (post.titleAr || post.title) : post.title}</h1>"),
    (r"'TroveSeek Team'", r"(isAr ? 'فريق TroveSeek' : 'TroveSeek Team')"),
    (r">Author<", r">{isAr ? 'المؤلف' : 'Author'}<"),
    (r"No Cover Image", r"{isAr ? 'لا توجد صورة غلاف' : 'No Cover Image'}"),
    (r">This post has no content yet\.<", r">{isAr ? 'لا يوجد محتوى في هذه المشاركة بعد.' : 'This post has no content yet.'}<"),
    (r">Thank you for reading this article\. If you found it helpful, consider sharing it with your network!<", r">{isAr ? 'شكراً لقراءة هذا المقال. إذا وجدته مفيداً، ففكر في مشاركته مع شبكتك!' : 'Thank you for reading this article. If you found it helpful, consider sharing it with your network!'}<"),
    (r">Share this article<", r">{isAr ? 'شارك هذا المقال' : 'Share this article'}<"),
    (r"\{post\.reviewCount\} Comments", r"{isAr ? `${post.reviewCount} تعليق` : `${post.reviewCount} Comments`}"),
    (r">Table of Contents<", r">{isAr ? 'جدول المحتويات' : 'Table of Contents'}<"),
    (r">Newsletter<", r">{isAr ? 'النشرة الإخبارية' : 'Newsletter'}<"),
    (r">[\s]*Enjoying this post\? Subscribe to get more like it delivered to your inbox\.[\s]*<", r">\n              {isAr ? 'هل تستمتع بهذا المقال؟ اشترك للحصول على المزيد مثله في صندوق الوارد الخاص بك.' : 'Enjoying this post? Subscribe to get more like it delivered to your inbox.'}\n            <"),
    (r"\"Your email address\"", r"isAr ? 'عنوان بريدك الإلكتروني' : 'Your email address'"),
    (r">Subscribe<", r">{isAr ? 'اشتراك' : 'Subscribe'}<")
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
