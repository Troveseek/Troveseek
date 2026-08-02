import 'dotenv/config';
import db from '../src/lib/db';

const EXCHANGE_RATE = 220; // 1 USD = 220 DZD (approximate/commercial rate)

const categoriesData = [
  { slug: 'web-mobile', name: 'Web & Mobile', nameAr: 'تطوير الويب والتطبيقات', description: 'Development services', descriptionAr: 'خدمات التطوير' },
  { slug: 'e-commerce', name: 'E-commerce', nameAr: 'التجارة الإلكترونية', description: 'Online store solutions', descriptionAr: 'حلول المتاجر الإلكترونية' },
  { slug: 'business-finance', name: 'Business & Finance', nameAr: 'الأعمال والمالية', description: 'Financial & consulting services', descriptionAr: 'خدمات مالية واستشارية' },
  { slug: 'design-creative', name: 'Design & Creative', nameAr: 'التصميم والإبداع', description: 'Graphic and pixel art', descriptionAr: 'تصميم جرافيك وبكسل آرت' },
  { slug: 'media-production', name: 'Media & Production', nameAr: 'الإنتاج الإعلامي', description: 'Video & photo production', descriptionAr: 'إنتاج الفيديو والتصوير' },
  { slug: 'marketing-events', name: 'Marketing & Events', nameAr: 'التسويق والفعاليات', description: 'Digital marketing & event management', descriptionAr: 'التسويق الرقمي وإدارة الفعاليات' },
  { slug: 'it-office', name: 'IT & Office', nameAr: 'تقنية المعلومات والمكتبية', description: 'IT, networks & office services', descriptionAr: 'خدمات تقنية ومكتبية' }
];

const services = [
  {
    categorySlug: 'web-mobile',
    name: 'Web Development',
    nameAr: 'تطوير الويب',
    slug: 'web-development',
    description: 'Custom, responsive websites tailored to your brand, optimized for performance and conversions.',
    descriptionAr: 'مواقع إلكترونية مخصصة ومتجاوبة مع الهواتف الذكية، مصممة خصيصاً لعلامتك التجارية لضمان أفضل أداء.',
    basePrice: 500,
    estimatedDays: 14,
    status: 'ACTIVE',
    tagline: 'Building Your Digital Home',
    taglineAr: 'نبني منزلك الرقمي',
    process: JSON.stringify([
      { title: 'Discovery & Planning', description: 'Understanding your goals and target audience.' },
      { title: 'Design & Prototyping', description: 'Creating visually stunning and user-friendly layouts.' },
      { title: 'Development', description: 'Coding the website with modern technologies.' },
      { title: 'Testing & Launch', description: 'Ensuring everything works perfectly before going live.' }
    ]),
    processAr: JSON.stringify([
      { title: 'الاستكشاف والتخطيط', description: 'فهم أهدافك وجمهورك المستهدف.' },
      { title: 'التصميم والنمذجة', description: 'إنشاء تخطيطات جذابة بصرياً وسهلة الاستخدام.' },
      { title: 'التطوير والبرمجة', description: 'برمجة الموقع باستخدام أحدث التقنيات.' },
      { title: 'الاختبار والإطلاق', description: 'التأكد من عمل كل شيء بشكل مثالي قبل الإطلاق.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Basic', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['Landing Page', 'Mobile Responsive', 'Basic SEO'] },
      { name: 'Standard', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, features: ['Up to 5 Pages', 'CMS Integration', 'Contact Forms'] },
      { name: 'Premium', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['Unlimited Pages', 'Custom Features', 'Advanced SEO', 'Priority Support'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'الأساسية', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['صفحة هبوط', 'متجاوب مع الجوال', 'تحسين محركات البحث الأساسي'] },
      { name: 'القياسية', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, features: ['حتى 5 صفحات', 'لوحة تحكم للمحتوى', 'نماذج تواصل'] },
      { name: 'الاحترافية', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['صفحات غير محدودة', 'خصائص مخصصة', 'تحسين محركات بحث متقدم', 'دعم فني كأولوية'] }
    ]),
    features: JSON.stringify(['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Secure']),
    featuresAr: JSON.stringify(['تصميم متجاوب', 'محسن لمحركات البحث', 'سريع التحميل', 'آمن وموثوق'])
  },
  {
    categorySlug: 'web-mobile',
    name: 'Mobile Development',
    nameAr: 'تطوير تطبيقات الجوال',
    slug: 'mobile-development',
    description: 'High-performance iOS and Android applications that provide seamless user experiences.',
    descriptionAr: 'تطبيقات عالية الأداء لأنظمة أندرويد و iOS توفر تجربة مستخدم سلسة ومميزة.',
    basePrice: 1500,
    estimatedDays: 30,
    status: 'ACTIVE',
    tagline: 'Your Business in Every Pocket',
    taglineAr: 'عملك في جيب كل عميل',
    process: JSON.stringify([
      { title: 'Requirement Analysis', description: 'Defining app features and functionalities.' },
      { title: 'UI/UX Design', description: 'Crafting intuitive mobile interfaces.' },
      { title: 'App Development', description: 'Building the app for iOS and Android.' },
      { title: 'Deployment', description: 'Publishing to App Store and Google Play.' }
    ]),
    processAr: JSON.stringify([
      { title: 'تحليل المتطلبات', description: 'تحديد ميزات ووظائف التطبيق.' },
      { title: 'تصميم واجهة المستخدم', description: 'صياغة واجهات هواتف ذكية بديهية.' },
      { title: 'تطوير التطبيق', description: 'بناء التطبيق لأنظمة أندرويد و iOS.' },
      { title: 'الإطلاق', description: 'النشر على متجر آبل وجوجل بلاي.' }
    ]),
    tiers: JSON.stringify([
      { name: 'MVP', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['Core Features', 'Single Platform', 'Basic UI'] },
      { name: 'Professional', price: 4000, priceDzd: 4000 * EXCHANGE_RATE, features: ['Cross-Platform', 'Advanced UI/UX', 'API Integration'] },
      { name: 'Enterprise', price: 8000, priceDzd: 8000 * EXCHANGE_RATE, features: ['Full Custom Solution', 'Admin Dashboard', 'Ongoing Maintenance'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'نسخة أولية (MVP)', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['الميزات الأساسية', 'منصة واحدة', 'واجهة مستخدم بسيطة'] },
      { name: 'احترافية', price: 4000, priceDzd: 4000 * EXCHANGE_RATE, features: ['متعدد المنصات', 'واجهة مستخدم متقدمة', 'ربط مع واجهات برمجية'] },
      { name: 'للمؤسسات', price: 8000, priceDzd: 8000 * EXCHANGE_RATE, features: ['حلول مخصصة بالكامل', 'لوحة تحكم إدارية', 'صيانة مستمرة'] }
    ]),
    features: JSON.stringify(['Cross-Platform', 'Native Performance', 'Push Notifications', 'App Store Optimization']),
    featuresAr: JSON.stringify(['تطبيقات متعددة المنصات', 'أداء عالي', 'إشعارات فورية', 'تحسين ظهور التطبيق بالمتجر'])
  },
  {
    categorySlug: 'e-commerce',
    name: 'E-commerce Services',
    nameAr: 'خدمات التجارة الإلكترونية',
    slug: 'ecommerce-services',
    description: 'Complete online store setups with secure payment gateways and inventory management.',
    descriptionAr: 'إنشاء متاجر إلكترونية متكاملة مع بوابات دفع آمنة وأنظمة إدارة المخزون.',
    basePrice: 800,
    estimatedDays: 20,
    status: 'ACTIVE',
    tagline: 'Start Selling Globally',
    taglineAr: 'ابدأ البيع عالمياً',
    process: JSON.stringify([
      { title: 'Store Setup', description: 'Configuring your platform (Shopify, WooCommerce, etc.).' },
      { title: 'Design & Branding', description: 'Customizing the store to match your brand.' },
      { title: 'Product Upload', description: 'Adding your catalog and configuring variants.' },
      { title: 'Payment & Launch', description: 'Setting up gateways and going live.' }
    ]),
    processAr: JSON.stringify([
      { title: 'إعداد المتجر', description: 'تهيئة منصتك (شوبيفاي، ووكومرس، الخ).' },
      { title: 'التصميم والهوية', description: 'تخصيص المتجر ليتناسب مع هويتك التجارية.' },
      { title: 'إضافة المنتجات', description: 'إضافة الكتالوج الخاص بك وتهيئة المتغيرات.' },
      { title: 'الدفع والإطلاق', description: 'إعداد بوابات الدفع وإطلاق المتجر.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Starter Store', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['Up to 50 Products', 'Standard Theme', '1 Payment Gateway'] },
      { name: 'Growth Store', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['Up to 500 Products', 'Premium Design', 'Multiple Gateways', 'Inventory Sync'] },
      { name: 'Enterprise Store', price: 3500, priceDzd: 3500 * EXCHANGE_RATE, features: ['Unlimited Products', 'Custom Theme', 'ERP Integration', 'Multi-currency'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'المتجر المبتدئ', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['حتى 50 منتج', 'قالب قياسي', 'بوابة دفع واحدة'] },
      { name: 'متجر النمو', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['حتى 500 منتج', 'تصميم احترافي', 'بوابات دفع متعددة', 'مزامنة المخزون'] },
      { name: 'متجر الشركات', price: 3500, priceDzd: 3500 * EXCHANGE_RATE, features: ['منتجات غير محدودة', 'قالب مخصص', 'ربط مع أنظمة ERP', 'متعدد العملات'] }
    ]),
    features: JSON.stringify(['Secure Checkout', 'Inventory Management', 'Mobile Ready', 'Analytics Dashboard']),
    featuresAr: JSON.stringify(['دفع آمن', 'إدارة المخزون', 'جاهز للهواتف', 'لوحة تحكم إحصائيات'])
  },
  {
    categorySlug: 'business-finance',
    name: 'Visa Card Services',
    nameAr: 'خدمات بطاقات فيزا',
    slug: 'visa-card-services',
    description: 'Assistance with issuing and managing physical and virtual Visa cards for your business operations.',
    descriptionAr: 'المساعدة في إصدار وإدارة بطاقات فيزا الفعلية والافتراضية لعملياتك التجارية.',
    basePrice: 50,
    estimatedDays: 3,
    status: 'ACTIVE',
    tagline: 'Seamless Global Payments',
    taglineAr: 'مدفوعات عالمية سلسة',
    process: JSON.stringify([
      { title: 'Application', description: 'Submitting required business documents.' },
      { title: 'Verification', description: 'Identity and business verification process.' },
      { title: 'Card Issuance', description: 'Generating virtual cards instantly or shipping physical ones.' }
    ]),
    processAr: JSON.stringify([
      { title: 'تقديم الطلب', description: 'إرسال وثائق العمل المطلوبة.' },
      { title: 'التحقق', description: 'عملية التحقق من الهوية والشركة.' },
      { title: 'إصدار البطاقة', description: 'إصدار بطاقات افتراضية فورياً أو شحن البطاقات الفعلية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Virtual Card', price: 50, priceDzd: 50 * EXCHANGE_RATE, features: ['Instant Issuance', 'Online Purchases', 'Prepaid Balance'] },
      { name: 'Physical Card', price: 120, priceDzd: 120 * EXCHANGE_RATE, features: ['ATM Withdrawals', 'In-Store Purchases', 'Higher Limits'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'بطاقة افتراضية', price: 50, priceDzd: 50 * EXCHANGE_RATE, features: ['إصدار فوري', 'مشتريات عبر الإنترنت', 'رصيد مسبق الدفع'] },
      { name: 'بطاقة بلاستيكية', price: 120, priceDzd: 120 * EXCHANGE_RATE, features: ['سحب من الصراف', 'شراء من المتاجر', 'حدود مالية أعلى'] }
    ]),
    features: JSON.stringify(['Global Acceptance', 'Secure Transactions', 'Expense Tracking', 'Multi-currency']),
    featuresAr: JSON.stringify(['مقبولة عالمياً', 'معاملات آمنة', 'تتبع النفقات', 'متعددة العملات'])
  },
  {
    categorySlug: 'business-finance',
    name: 'Business Consulting & Startups',
    nameAr: 'استشارات الأعمال والشركات الناشئة',
    slug: 'business-consulting-startups',
    description: 'Expert guidance to help you plan, launch, and scale your startup successfully.',
    descriptionAr: 'إرشادات خبراء لمساعدتك في تخطيط وإطلاق وتوسيع شركتك الناشئة بنجاح.',
    basePrice: 300,
    estimatedDays: 7,
    status: 'ACTIVE',
    tagline: 'Turn Your Ideas Into Reality',
    taglineAr: 'حوّل أفكارك إلى واقع',
    process: JSON.stringify([
      { title: 'Initial Consultation', description: 'Discussing your vision and challenges.' },
      { title: 'Market Research', description: 'Analyzing competitors and target market.' },
      { title: 'Strategy Development', description: 'Creating actionable business plans and financial models.' },
      { title: 'Execution Support', description: 'Guiding you through the launch phase.' }
    ]),
    processAr: JSON.stringify([
      { title: 'الاستشارة الأولية', description: 'مناقشة رؤيتك والتحديات.' },
      { title: 'دراسة السوق', description: 'تحليل المنافسين والسوق المستهدف.' },
      { title: 'تطوير الاستراتيجية', description: 'إنشاء خطط عمل ونماذج مالية قابلة للتنفيذ.' },
      { title: 'دعم التنفيذ', description: 'توجيهك خلال مرحلة الإطلاق.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Idea Validation', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['Market Analysis', 'Feasibility Study', '1-on-1 Strategy Call'] },
      { name: 'Business Plan', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['Full Business Plan', 'Financial Projections', 'Pitch Deck'] },
      { name: 'Startup Mentorship', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['Monthly Retainer', 'Growth Strategy', 'Investor Connections'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'التحقق من الفكرة', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['تحليل السوق', 'دراسة جدوى مبدئية', 'مكالمة استراتيجية'] },
      { name: 'خطة العمل', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['خطة عمل كاملة', 'توقعات مالية', 'ملف العرض الاستثماري'] },
      { name: 'توجيه الشركات الناشئة', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['عقد شهري', 'استراتيجية النمو', 'ربط مع مستثمرين'] }
    ]),
    features: JSON.stringify(['Expert Advisors', 'Data-Driven Strategies', 'Financial Modeling', 'Pitch Deck Creation']),
    featuresAr: JSON.stringify(['مستشارون خبراء', 'استراتيجيات مبنية على البيانات', 'نمذجة مالية', 'تصميم العروض التقديمية للاستثمار'])
  },
  {
    categorySlug: 'design-creative',
    name: 'Graphic Design',
    nameAr: 'التصميم الجرافيكي',
    slug: 'graphic-design',
    description: 'Creative and impactful visual designs that communicate your brand message.',
    descriptionAr: 'تصاميم مرئية إبداعية ومؤثرة توصل رسالة علامتك التجارية بأفضل صورة.',
    basePrice: 150,
    estimatedDays: 5,
    status: 'ACTIVE',
    tagline: 'Visualizing Your Brand Story',
    taglineAr: 'تجسيد قصة علامتك التجارية',
    process: JSON.stringify([
      { title: 'Briefing', description: 'Gathering requirements and design preferences.' },
      { title: 'Concept Creation', description: 'Drafting initial design concepts.' },
      { title: 'Revisions', description: 'Refining the chosen concept based on feedback.' },
      { title: 'Final Delivery', description: 'Providing high-resolution and source files.' }
    ]),
    processAr: JSON.stringify([
      { title: 'جمع المتطلبات', description: 'فهم متطلبات التصميم وتفضيلاتك.' },
      { title: 'ابتكار الأفكار', description: 'رسم المفاهيم والتصاميم الأولية.' },
      { title: 'التعديلات', description: 'تنقيح التصميم المختار بناءً على ملاحظاتك.' },
      { title: 'التسليم النهائي', description: 'تسليم الملفات الأصلية وبجودة عالية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Logo Design', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['2 Concepts', '3 Revisions', 'High-Res Files'] },
      { name: 'Brand Identity', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['Logo Design', 'Business Cards', 'Letterhead', 'Brand Guidelines'] },
      { name: 'Marketing Materials', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['Social Media Posts', 'Flyers', 'Banners'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'تصميم الشعار', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['مفهومان للتصميم', '3 مراجعات', 'ملفات عالية الجودة'] },
      { name: 'الهوية البصرية', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['تصميم الشعار', 'بطاقات العمل', 'الأوراق الرسمية', 'دليل الهوية'] },
      { name: 'المواد التسويقية', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['تصاميم السوشيال ميديا', 'نشرات إعلانية', 'لافتات'] }
    ]),
    features: JSON.stringify(['Unique Concepts', 'Print-Ready Files', 'Fast Turnaround', 'Full Copyrights']),
    featuresAr: JSON.stringify(['أفكار فريدة', 'ملفات جاهزة للطباعة', 'تسليم سريع', 'حقوق ملكية كاملة'])
  },
  {
    categorySlug: 'design-creative',
    name: 'Pixel Art',
    nameAr: 'فن البكسل',
    slug: 'pixel-art',
    description: 'Custom pixel art illustrations, sprites, and animations for games and digital projects.',
    descriptionAr: 'رسومات بكسل مخصصة وشخصيات متحركة للألعاب والمشاريع الرقمية.',
    basePrice: 80,
    estimatedDays: 4,
    status: 'ACTIVE',
    tagline: 'Retro Aesthetics, Modern Design',
    taglineAr: 'جماليات الريترو بتصميم عصري',
    process: JSON.stringify([
      { title: 'Concept Sketch', description: 'Rough sketching of the artwork.' },
      { title: 'Pixelation', description: 'Converting sketches into pixel-perfect designs.' },
      { title: 'Color & Shading', description: 'Applying color palettes and details.' },
      { title: 'Animation (Optional)', description: 'Creating sprite sheets and loops.' }
    ]),
    processAr: JSON.stringify([
      { title: 'رسم المفهوم', description: 'رسم تخطيطي أولي للعمل الفني.' },
      { title: 'التحويل للبكسل', description: 'تحويل الرسوم إلى تصاميم بكسل دقيقة.' },
      { title: 'التلوين والتظليل', description: 'تطبيق لوحات الألوان والتفاصيل.' },
      { title: 'التحريك (اختياري)', description: 'إنشاء أوراق الحركة والتكرارات.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Sprite/Icon', price: 80, priceDzd: 80 * EXCHANGE_RATE, features: ['1 Character/Prop', 'Static Image', 'Commercial Rights'] },
      { name: 'Animated Sprite', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['1 Character', 'Idle/Walk Animation', 'Sprite Sheet'] },
      { name: 'Full Scene', price: 400, priceDzd: 400 * EXCHANGE_RATE, features: ['Detailed Background', 'Multiple Elements', 'Atmospheric Effects'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'شخصية/أيقونة', price: 80, priceDzd: 80 * EXCHANGE_RATE, features: ['شخصية واحدة أو أداة', 'صورة ثابتة', 'حقوق تجارية'] },
      { name: 'شخصية متحركة', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['شخصية واحدة', 'حركة المشي/الوقوف', 'ملف الحركة'] },
      { name: 'مشهد كامل', price: 400, priceDzd: 400 * EXCHANGE_RATE, features: ['خلفية مفصلة', 'عناصر متعددة', 'مؤثرات بصرية'] }
    ]),
    features: JSON.stringify(['Custom Palettes', 'Game-Ready Assets', 'Sprite Sheets', 'High Detail']),
    featuresAr: JSON.stringify(['لوحات ألوان مخصصة', 'أصول جاهزة للألعاب', 'ملفات حركة', 'تفاصيل دقيقة'])
  },
  {
    categorySlug: 'media-production',
    name: 'Filmmaking',
    nameAr: 'صناعة الأفلام',
    slug: 'filmmaking',
    description: 'Professional filmmaking services from scripting to final cut for short films, documentaries, and commercials.',
    descriptionAr: 'خدمات صناعة الأفلام الاحترافية من كتابة السيناريو إلى المونتاج للأفلام القصيرة، الوثائقية، والإعلانات.',
    basePrice: 2500,
    estimatedDays: 45,
    status: 'ACTIVE',
    tagline: 'Cinematic Storytelling',
    taglineAr: 'رواية القصص بأسلوب سينمائي',
    process: JSON.stringify([
      { title: 'Pre-production', description: 'Scripting, storyboarding, and casting.' },
      { title: 'Production', description: 'Filming with professional gear and crew.' },
      { title: 'Post-production', description: 'Editing, color grading, and sound design.' },
      { title: 'Delivery', description: 'Final export in cinematic formats.' }
    ]),
    processAr: JSON.stringify([
      { title: 'ما قبل الإنتاج', description: 'كتابة السيناريو، رسم القصة، واختيار الممثلين.' },
      { title: 'الإنتاج', description: 'التصوير بمعدات وطاقم احترافي.' },
      { title: 'ما بعد الإنتاج', description: 'المونتاج، تلوين الفيديو، وتصميم الصوت.' },
      { title: 'التسليم', description: 'التصدير النهائي بصيغ سينمائية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Short Commercial', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['Up to 60 Seconds', '1 Shooting Day', 'Basic Color Grading'] },
      { name: 'Documentary/Short Film', price: 6000, priceDzd: 6000 * EXCHANGE_RATE, features: ['Up to 15 Mins', '3 Shooting Days', 'Advanced Sound Design'] },
      { name: 'Premium Production', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, features: ['Full Crew', 'Cinema Cameras', 'Visual Effects (VFX)'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'إعلان قصير', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['حتى 60 ثانية', 'يوم تصوير واحد', 'تلوين أساسي'] },
      { name: 'فيلم وثائقي/قصير', price: 6000, priceDzd: 6000 * EXCHANGE_RATE, features: ['حتى 15 دقيقة', '3 أيام تصوير', 'هندسة صوت متقدمة'] },
      { name: 'إنتاج ممتاز', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, features: ['طاقم كامل', 'كاميرات سينمائية', 'مؤثرات بصرية'] }
    ]),
    features: JSON.stringify(['4K/8K Resolution', 'Professional Audio', 'Color Grading', 'Drone Footage']),
    featuresAr: JSON.stringify(['جودة 4K/8K', 'صوت احترافي', 'تلوين سينمائي', 'تصوير جوي (درون)'])
  },
  {
    categorySlug: 'media-production',
    name: 'Video Production',
    nameAr: 'إنتاج الفيديو',
    slug: 'video-production',
    description: 'Engaging promotional videos, corporate interviews, and YouTube content editing.',
    descriptionAr: 'مقاطع فيديو ترويجية جذابة، مقابلات للشركات، وتحرير محتوى يوتيوب.',
    basePrice: 500,
    estimatedDays: 7,
    status: 'ACTIVE',
    tagline: 'Captivating Video Content',
    taglineAr: 'محتوى فيديو يأسر الأنظار',
    process: JSON.stringify([
      { title: 'Ideation', description: 'Defining the video goal and style.' },
      { title: 'Filming/Animation', description: 'Recording footage or creating motion graphics.' },
      { title: 'Editing', description: 'Cutting, adding transitions, and text overlays.' },
      { title: 'Audio & Export', description: 'Adding background music and rendering.' }
    ]),
    processAr: JSON.stringify([
      { title: 'توليد الأفكار', description: 'تحديد هدف الفيديو وأسلوبه.' },
      { title: 'التصوير/التحريك', description: 'تسجيل اللقطات أو إنشاء الرسوم المتحركة.' },
      { title: 'المونتاج', description: 'القص، إضافة الانتقالات، والنصوص.' },
      { title: 'الصوت والتصدير', description: 'إضافة موسيقى خلفية واستخراج الفيديو.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Social Media Reel', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['Up to 30 Seconds', 'Vertical Format', 'Trending Audio'] },
      { name: 'Corporate Video', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, features: ['Up to 3 Minutes', 'Interviews & B-Roll', 'Branded Graphics'] },
      { name: 'YouTube Editing (Monthly)', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['4 Videos per Month', 'Thumbnails Included', 'SEO Tags'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'ريلز انستجرام/تيك توك', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['حتى 30 ثانية', 'ص صيغة عمودية', 'صوتيات رائجة'] },
      { name: 'فيديو تعريفي للشركة', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, features: ['حتى 3 دقائق', 'مقابلات ولقطات داعمة', 'رسوميات بهوية الشركة'] },
      { name: 'مونتاج يوتيوب (شهري)', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['4 فيديوهات شهرياً', 'يشمل الصور المصغرة', 'كلمات مفتاحية'] }
    ]),
    features: JSON.stringify(['Fast Delivery', 'Licensed Music', 'Motion Graphics', 'Subtitles/Captions']),
    featuresAr: JSON.stringify(['تسليم سريع', 'موسيقى مرخصة', 'رسوم متحركة', 'ترجمة ونصوص توضيحية'])
  },
  {
    categorySlug: 'media-production',
    name: 'Photography',
    nameAr: 'التصوير الفوتوغرافي',
    slug: 'photography',
    description: 'High-quality professional photography for products, events, and portraits.',
    descriptionAr: 'تصوير فوتوغرافي احترافي وعالي الجودة للمنتجات، الفعاليات، والبورتريه.',
    basePrice: 200,
    estimatedDays: 5,
    status: 'ACTIVE',
    tagline: 'Capturing Perfect Moments',
    taglineAr: 'نوثق أجمل اللحظات',
    process: JSON.stringify([
      { title: 'Planning', description: 'Discussing location, style, and shot list.' },
      { title: 'Photoshoot', description: 'Conducting the professional photo session.' },
      { title: 'Retouching', description: 'Editing and color correcting the best photos.' },
      { title: 'Delivery', description: 'Providing a secure digital gallery.' }
    ]),
    processAr: JSON.stringify([
      { title: 'التخطيط', description: 'مناقشة الموقع، الأسلوب، وقائمة اللقطات.' },
      { title: 'جلسة التصوير', description: 'تنفيذ جلسة التصوير الاحترافية.' },
      { title: 'التعديل والريتوش', description: 'تعديل وتصحيح ألوان أفضل الصور.' },
      { title: 'التسليم', description: 'توفير معرض صور رقمي آمن.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Portrait Session', price: 200, priceDzd: 200 * EXCHANGE_RATE, features: ['1 Hour Session', '10 Retouched Photos', '1 Location'] },
      { name: 'Product Photography', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['Up to 20 Products', 'White Background/Lifestyle', 'High-Res'] },
      { name: 'Event Coverage', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['Up to 4 Hours', 'Unlimited Photos', 'Highlight Album'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'جلسة بورتريه', price: 200, priceDzd: 200 * EXCHANGE_RATE, features: ['جلسة لمدة ساعة', '10 صور معدلة', 'موقع واحد'] },
      { name: 'تصوير المنتجات', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['حتى 20 منتج', 'خلفية بيضاء أو نمط حياة', 'دقة عالية'] },
      { name: 'تغطية الفعاليات', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['حتى 4 ساعات', 'صور غير محدودة', 'ألبوم لأبرز اللحظات'] }
    ]),
    features: JSON.stringify(['Professional Lighting', 'High-End Retouching', 'Online Gallery', 'Commercial Rights']),
    featuresAr: JSON.stringify(['إضاءة احترافية', 'تعديل متقدم', 'معرض إلكتروني', 'حقوق تجارية'])
  },
  {
    categorySlug: 'marketing-events',
    name: 'Events & Conferences',
    nameAr: 'الفعاليات والمؤتمرات',
    slug: 'events-conferences',
    description: 'End-to-end event planning, management, and execution for corporate and public events.',
    descriptionAr: 'تخطيط، إدارة، وتنفيذ الفعاليات من البداية للنهاية للمناسبات الخاصة بالشركات والمناسبات العامة.',
    basePrice: 1500,
    estimatedDays: 60,
    status: 'ACTIVE',
    tagline: 'Memorable Experiences',
    taglineAr: 'تجارب لا تُنسى',
    process: JSON.stringify([
      { title: 'Conceptualization', description: 'Defining event goals, theme, and budget.' },
      { title: 'Planning & Logistics', description: 'Booking venues, vendors, and managing schedules.' },
      { title: 'Marketing', description: 'Promoting the event to your target audience.' },
      { title: 'Execution', description: 'On-site management during the event day.' }
    ]),
    processAr: JSON.stringify([
      { title: 'وضع التصور', description: 'تحديد أهداف الفعالية، الفكرة، والميزانية.' },
      { title: 'التخطيط واللوجستيات', description: 'حجز القاعات، الموردين، وإدارة الجداول.' },
      { title: 'التسويق', description: 'الترويج للفعالية لجمهورك المستهدف.' },
      { title: 'التنفيذ', description: 'إدارة ميدانية خلال يوم الفعالية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Micro Event', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['Up to 50 Attendees', 'Venue Sourcing', 'Basic Catering Setup'] },
      { name: 'Corporate Seminar', price: 5000, priceDzd: 5000 * EXCHANGE_RATE, features: ['Up to 200 Attendees', 'AV Equipment', 'Registration System'] },
      { name: 'Large Conference', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, features: ['500+ Attendees', 'Multi-day', 'Full Marketing & VIP Handling'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'فعالية مصغرة', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['حتى 50 ضيف', 'البحث عن قاعة', 'تنسيق الضيافة الأساسية'] },
      { name: 'ندوة للشركات', price: 5000, priceDzd: 5000 * EXCHANGE_RATE, features: ['حتى 200 ضيف', 'تجهيزات صوت وضوء', 'نظام تسجيل إلكتروني'] },
      { name: 'مؤتمر ضخم', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, features: ['500+ ضيف', 'عدة أيام', 'تسويق كامل وإدارة كبار الشخصيات'] }
    ]),
    features: JSON.stringify(['Venue Management', 'Vendor Coordination', 'On-site Staff', 'Ticketing Solutions']),
    featuresAr: JSON.stringify(['إدارة القاعات', 'تنسيق الموردين', 'طاقم تنظيمي ميداني', 'حلول حجز التذاكر'])
  },
  {
    categorySlug: 'marketing-events',
    name: 'Social Media Management',
    nameAr: 'إدارة وسائل التواصل الاجتماعي',
    slug: 'social-media-management',
    description: 'Grow your online presence with tailored content, community engagement, and analytics.',
    descriptionAr: 'عزز حضورك الرقمي بمحتوى مخصص، وتفاعل مع المجتمع، وتحليلات دقيقة.',
    basePrice: 400,
    estimatedDays: 30,
    status: 'ACTIVE',
    tagline: 'Connecting Brands with People',
    taglineAr: 'نربط العلامات التجارية بالجمهور',
    process: JSON.stringify([
      { title: 'Audit & Strategy', description: 'Analyzing current profiles and defining a content strategy.' },
      { title: 'Content Creation', description: 'Designing graphics, writing copy, and planning the calendar.' },
      { title: 'Publishing & Engagement', description: 'Scheduling posts and interacting with followers.' },
      { title: 'Reporting', description: 'Monthly analytics on reach, engagement, and growth.' }
    ]),
    processAr: JSON.stringify([
      { title: 'التدقيق والاستراتيجية', description: 'تحليل الحسابات الحالية وبناء استراتيجية المحتوى.' },
      { title: 'صناعة المحتوى', description: 'تصميم الجرافيك، كتابة النصوص، وجدولة التقويم.' },
      { title: 'النشر والتفاعل', description: 'جدولة المنشورات والتفاعل مع المتابعين.' },
      { title: 'التقارير', description: 'تحليلات شهرية حول الوصول، التفاعل، والنمو.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Starter', price: 400, priceDzd: 400 * EXCHANGE_RATE, features: ['2 Platforms', '12 Posts/Month', 'Basic Reporting'] },
      { name: 'Growth', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['3 Platforms', '20 Posts/Month', 'Community Management', 'Reels Creation'] },
      { name: 'Enterprise', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['All Platforms', 'Daily Posting', 'Ad Management', '24/7 Support'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'البداية', price: 400, priceDzd: 400 * EXCHANGE_RATE, features: ['منصتان', '12 منشور/شهر', 'تقارير أساسية'] },
      { name: 'النمو', price: 800, priceDzd: 800 * EXCHANGE_RATE, features: ['3 منصات', '20 منشور/شهر', 'إدارة المجتمع والردود', 'تصميم ريلز'] },
      { name: 'المؤسسات', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, features: ['كل المنصات', 'نشر يومي', 'إدارة الحملات الإعلانية', 'دعم 24/7'] }
    ]),
    features: JSON.stringify(['Content Strategy', 'Graphic Design Included', 'Community Engagement', 'Performance Analytics']),
    featuresAr: JSON.stringify(['استراتيجية محتوى', 'تصاميم جرافيك متضمنة', 'إدارة مجتمع', 'إحصائيات الأداء'])
  },
  {
    categorySlug: 'marketing-events',
    name: 'Digital Marketing',
    nameAr: 'التسويق الرقمي',
    slug: 'digital-marketing',
    description: 'Data-driven marketing campaigns including SEO, PPC, and Email Marketing to drive sales.',
    descriptionAr: 'حملات تسويقية تعتمد على البيانات تشمل تحسين محركات البحث، الإعلانات الممولة، والتسويق عبر البريد لزيادة المبيعات.',
    basePrice: 600,
    estimatedDays: 30,
    status: 'ACTIVE',
    tagline: 'Maximize Your ROI',
    taglineAr: 'ضاعف عائد الاستثمار',
    process: JSON.stringify([
      { title: 'Goal Setting', description: 'Defining KPIs and target audience.' },
      { title: 'Campaign Setup', description: 'Creating ad accounts, tracking pixels, and landing pages.' },
      { title: 'Launch & Monitor', description: 'Running ads and closely monitoring performance.' },
      { title: 'Optimization', description: 'A/B testing and adjusting budgets to maximize ROI.' }
    ]),
    processAr: JSON.stringify([
      { title: 'تحديد الأهداف', description: 'تحديد مؤشرات الأداء والجمهور المستهدف.' },
      { title: 'إعداد الحملة', description: 'إنشاء الحسابات الإعلانية، رموز التتبع، وصفحات الهبوط.' },
      { title: 'الإطلاق والمراقبة', description: 'تشغيل الإعلانات ومراقبة الأداء عن كثب.' },
      { title: 'التحسين', description: 'اختبار (أ/ب) وتعديل الميزانيات لتعظيم العائد.' }
    ]),
    tiers: JSON.stringify([
      { name: 'SEO Focus', price: 600, priceDzd: 600 * EXCHANGE_RATE, features: ['On-page SEO', 'Content Marketing', 'Backlink Building'] },
      { name: 'Paid Ads (PPC)', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, features: ['Google Ads', 'Meta Ads', 'Retargeting Campaigns'] },
      { name: 'Omnichannel', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['SEO + PPC', 'Email Automation', 'Conversion Rate Optimization'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'محركات البحث (SEO)', price: 600, priceDzd: 600 * EXCHANGE_RATE, features: ['تحسين داخلي', 'تسويق بالمحتوى', 'بناء روابط خلفية'] },
      { name: 'إعلانات ممولة', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, features: ['إعلانات جوجل', 'إعلانات ميتا', 'حملات إعادة الاستهداف'] },
      { name: 'تسويق شامل', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, features: ['بحث + ممول', 'أتمتة البريد', 'تحسين معدل التحويل'] }
    ]),
    features: JSON.stringify(['Google Ads', 'Meta (Facebook/IG) Ads', 'SEO Optimization', 'Email Automation']),
    featuresAr: JSON.stringify(['إعلانات جوجل', 'إعلانات ميتا', 'تحسين محركات البحث', 'أتمتة البريد الإلكتروني'])
  },
  {
    categorySlug: 'it-office',
    name: 'Network and IT Solutions',
    nameAr: 'حلول الشبكات وتقنية المعلومات',
    slug: 'network-it-solutions',
    description: 'Secure, reliable network setups and comprehensive IT support for modern businesses.',
    descriptionAr: 'إعداد شبكات آمنة وموثوقة ودعم تقني شامل للشركات الحديثة.',
    basePrice: 500,
    estimatedDays: 14,
    status: 'ACTIVE',
    tagline: 'Connecting Your Business Safely',
    taglineAr: 'نربط أعمالك بأمان',
    process: JSON.stringify([
      { title: 'Assessment', description: 'Evaluating your current IT infrastructure.' },
      { title: 'Design', description: 'Planning a scalable network architecture.' },
      { title: 'Implementation', description: 'Installing hardware, routers, and configuring firewalls.' },
      { title: 'Maintenance', description: 'Ongoing support and security updates.' }
    ]),
    processAr: JSON.stringify([
      { title: 'التقييم', description: 'تقييم بنيتك التحتية التقنية الحالية.' },
      { title: 'التصميم', description: 'تخطيط هيكلة شبكات قابلة للتوسع.' },
      { title: 'التنفيذ', description: 'تركيب الأجهزة، الموجهات، وإعداد جدران الحماية.' },
      { title: 'الصيانة', description: 'دعم مستمر وتحديثات أمنية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Office Setup', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['Router Configuration', 'Wi-Fi Setup', 'Basic Firewall'] },
      { name: 'Enterprise Network', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['VLANs', 'Advanced Security', 'VPN Setup', 'Server Rack Config'] },
      { name: 'Monthly IT Support', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, features: ['24/7 Monitoring', 'Helpdesk Support', 'Data Backup'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'إعداد مكتبي', price: 500, priceDzd: 500 * EXCHANGE_RATE, features: ['برمجة الراوتر', 'إعداد شبكة واي فاي', 'جدار حماية أساسي'] },
      { name: 'شبكة للشركات', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, features: ['شبكات افتراضية VLAN', 'أمان متقدم', 'إعداد VPN', 'تجهيز خوادم'] },
      { name: 'دعم تقني شهري', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, features: ['مراقبة 24/7', 'مكتب مساعدة', 'نسخ احتياطي للبيانات'] }
    ]),
    features: JSON.stringify(['Cybersecurity', 'Cloud Integration', 'Hardware Setup', '24/7 Monitoring']),
    featuresAr: JSON.stringify(['أمن سيبراني', 'ربط سحابي', 'إعداد أجهزة', 'مراقبة على مدار الساعة'])
  },
  {
    categorySlug: 'it-office',
    name: 'Printing, Office & Thesis Services',
    nameAr: 'خدمات الطباعة والمكتبية والرسائل الجامعية',
    slug: 'printing-office-thesis',
    description: 'High-quality printing, office supplies sourcing, and professional formatting/binding for academic theses.',
    descriptionAr: 'طباعة عالية الجودة، توفير مستلزمات مكتبية، وتنسيق وتجليد احترافي للرسائل الجامعية.',
    basePrice: 50,
    estimatedDays: 2,
    status: 'ACTIVE',
    tagline: 'Professional Print & Paper Solutions',
    taglineAr: 'حلول ورقية وطباعية احترافية',
    process: JSON.stringify([
      { title: 'Submission', description: 'Uploading documents or requesting supplies.' },
      { title: 'Formatting & Review', description: 'Ensuring correct layout, margins, and paper quality.' },
      { title: 'Production', description: 'High-speed printing and professional binding.' },
      { title: 'Delivery', description: 'Local pickup or courier shipping.' }
    ]),
    processAr: JSON.stringify([
      { title: 'تقديم الطلب', description: 'رفع المستندات أو طلب المستلزمات.' },
      { title: 'التنسيق والمراجعة', description: 'التأكد من التخطيط، الهوامش، وجودة الورق.' },
      { title: 'الإنتاج', description: 'طباعة سريعة وتجليد احترافي.' },
      { title: 'التسليم', description: 'استلام محلي أو شحن سريع.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Document Printing', price: 50, priceDzd: 50 * EXCHANGE_RATE, features: ['Up to 500 Pages', 'B&W or Color', 'Stapling/Binding'] },
      { name: 'Thesis Formatting & Binding', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['Academic Formatting', 'Hardcover Binding', 'Gold Foil Lettering'] },
      { name: 'Corporate Office Supplies', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['Bulk Paper', 'Custom Envelopes', 'Pens & Stationery Box'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'طباعة مستندات', price: 50, priceDzd: 50 * EXCHANGE_RATE, features: ['حتى 500 صفحة', 'أبيض وأسود أو ملون', 'تدبيس/تغليف'] },
      { name: 'تنسيق وتجليد الرسائل', price: 150, priceDzd: 150 * EXCHANGE_RATE, features: ['تنسيق أكاديمي', 'تجليد صلب', 'طباعة باللون الذهبي'] },
      { name: 'مستلزمات مكتبية للشركات', price: 300, priceDzd: 300 * EXCHANGE_RATE, features: ['ورق بكميات كبيرة', 'أظرف مطبوعة', 'صندوق قرطاسية'] }
    ]),
    features: JSON.stringify(['Laser Printing', 'Academic Formatting', 'Premium Paper', 'Fast Turnaround']),
    featuresAr: JSON.stringify(['طباعة ليزر', 'تنسيق أكاديمي', 'ورق فاخر', 'إنجاز سريع'])
  }
];

async function main() {
  console.log('Seeding Categories and Services...');

  // Create Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const upsertedCat = await db.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
    categoryMap[cat.slug] = upsertedCat.id;
    console.log(`Upserted category: ${cat.name}`);
  }

  for (const service of services) {
    const { categorySlug, ...serviceData } = service;
    const categoryId = categoryMap[categorySlug];
    
    await db.service.upsert({
      where: { slug: service.slug },
      update: {
        ...serviceData,
        categoryId
      },
      create: {
        ...serviceData,
        categoryId
      }
    });
    console.log(`Upserted service: ${service.name}`);
  }

  console.log('✅ Categories and Services seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
