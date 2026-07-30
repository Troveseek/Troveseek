import re

file_path = "e:/jibli_app/jibli_app/troveseek/web/src/app/(client)/saas/[slug]/SaasDetailClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (r"<h2>Screenshots</h2>", r"<h2>{isAr ? 'لقطات الشاشة' : 'Screenshots'}</h2>"),
    (r"<h2>What's Included</h2>", r"<h2>{isAr ? 'ما يحتويه' : 'What\'s Included'}</h2>"),
    (r"No features listed yet\.", r"{isAr ? 'لا توجد ميزات مدرجة بعد.' : 'No features listed yet.'}"),
    (r"<h2>Subscription Plans</h2>", r"<h2>{isAr ? 'خطط الاشتراك' : 'Subscription Plans'}</h2>"),
    (r">Monthly<", r">{isAr ? 'شهرياً' : 'Monthly'}<"),
    (r">Yearly<", r">{isAr ? 'سنوياً' : 'Yearly'}<"),
    (r">Yearly\{", r">{isAr ? 'سنوياً' : 'Yearly'}\{"),
    (r"Save \{avgSaving\}%", r"{isAr ? `وفر ${avgSaving}%` : `Save ${avgSaving}%`}"),
    (r">MOST POPULAR<", r">{isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}<"),
    (r"\{billingCycle === 'yearly' \? '/yr' : '/mo'\}", r"{billingCycle === 'yearly' ? (isAr ? '/سنوياً' : '/yr') : (isAr ? '/شهرياً' : '/mo')}"),
    (r"\{saas\.hasFreeTrial \? 'Start Free Trial' : 'Get Started'\}", r"{saas.hasFreeTrial ? (isAr ? 'ابدأ التجربة المجانية' : 'Start Free Trial') : (isAr ? 'ابدأ الآن' : 'Get Started')}"),
    (r"Why Choose \{saas\.name\}\?", r"{isAr ? `لماذا تختار ${saas.name}؟` : `Why Choose ${saas.name}?`}"),
    (r"Frequently Asked Questions", r"{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}"),
    (r">Customer Reviews<", r">{isAr ? 'تقييمات العملاء' : 'Customer Reviews'}<"),
    (r">\{avgRating\.toFixed\(1\)\} average from \{reviews\.length\} review\{reviews\.length !== 1 \? 's' : ''\}<", r">{isAr ? `${avgRating.toFixed(1)} متوسط من ${reviews.length} تقييم` : `${avgRating.toFixed(1)} average from ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}<"),
    (r">Write a Review<", r">{isAr ? 'اكتب تقييماً' : 'Write a Review'}<"),
    (r">Share Your Experience<", r">{isAr ? 'شارك تجربتك' : 'Share Your Experience'}<"),
    (r">Your Rating \*<", r">{isAr ? 'تقييمك *' : 'Your Rating *'}<"),
    (r">Your Name \*<", r">{isAr ? 'اسمك *' : 'Your Name *'}<"),
    (r">Your Review \*<", r">{isAr ? 'مراجعتك *' : 'Your Review *'}<"),
    (r"placeholder=\{`Share your experience with \$\{saas\.name\}\.\.\.`\}", r"placeholder={isAr ? `شارك تجربتك مع ${saas.name}...` : `Share your experience with ${saas.name}...`}"),
    (r"Submit Review", r"{isAr ? 'إرسال التقييم' : 'Submit Review'}"),
    (r">Reviews are published after moderation\.<", r">{isAr ? 'يتم نشر التقييمات بعد المراجعة.' : 'Reviews are published after moderation.'}<"),
    (r"✓ Thank you! Your review has been submitted for moderation\.", r"✓ {isAr ? 'شكراً لك! تم إرسال تقييمك للمراجعة.' : 'Thank you! Your review has been submitted for moderation.'}"),
    (r"✗ Something went wrong\. Please try again\.", r"✗ {isAr ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'}"),
    (r">No reviews yet<", r">{isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}<"),
    (r">Be the first to review \{saas\.name\}!<", r">{isAr ? `كن أول من يقيم ${saas.name}!` : `Be the first to review ${saas.name}!`}<"),
    (r"'Starting From' : 'Pricing'", r"(isAr ? 'يبدأ من' : 'Starting From') : (isAr ? 'التسعير' : 'Pricing')"),
    (r">\{billingCycle === 'monthly' \? 'per month' : 'per month, billed yearly'\}<", r">{billingCycle === 'monthly' ? (isAr ? 'لكل شهر' : 'per month') : (isAr ? 'لكل شهر، تدفع سنوياً' : 'per month, billed yearly')}<"),
    (r"Save \$\{annualSaving\.toFixed\(0\)\} per year", r"{isAr ? `وفر $${annualSaving.toFixed(0)} سنوياً` : `Save $${annualSaving.toFixed(0)} per year`}"),
    (r"\+ \{features\.length - 5\} more features", r"{isAr ? `+ ${features.length - 5} ميزات أخرى` : `+ ${features.length - 5} more features`}"),
    (r"'🚀 Start Free Trial' : '🚀 Get Started'", r"(isAr ? '🚀 ابدأ التجربة المجانية' : '🚀 Start Free Trial') : (isAr ? '🚀 ابدأ الآن' : '🚀 Get Started')"),
    (r">14-day free trial · No credit card required<", r">{isAr ? 'نسخة تجريبية مجانية لمدة 14 يوماً · لا يتطلب بطاقة ائتمان' : '14-day free trial · No credit card required'}<"),
    (r">Launch Demo<", r">{isAr ? 'إطلاق العرض التوضيحي' : 'Launch Demo'}<"),
    (r"> Documentation<", r"> {isAr ? 'التوثيق' : 'Documentation'}<"),
    (r"> Community Forum<", r"> {isAr ? 'منتدى المجتمع' : 'Community Forum'}<"),
    (r"> GitHub Repository<", r"> {isAr ? 'مستودع GitHub' : 'GitHub Repository'}<"),
    (r"> Contact Support<", r"> {isAr ? 'اتصل بالدعم' : 'Contact Support'}<"),
    (r"> 30-day money-back guarantee<", r"> {isAr ? 'ضمان استعادة الأموال لمدة 30 يوماً' : '30-day money-back guarantee'}<")
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
