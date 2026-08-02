import 'dotenv/config';
import db from '../src/lib/db';

const EXCHANGE_RATE = 220;

const categoriesData = [
  { slug: 'web-mobile', name: 'Web & Mobile', nameAr: 'تطوير الويب والتطبيقات', description: 'Development services', descriptionAr: 'خدمات التطوير' },
  { slug: 'e-commerce', name: 'E-commerce', nameAr: 'التجارة الإلكترونية', description: 'Online store solutions', descriptionAr: 'حلول المتاجر الإلكترونية' },
  { slug: 'business-finance', name: 'Business & Finance', nameAr: 'الأعمال والمالية', description: 'Financial & consulting services', descriptionAr: 'خدمات مالية واستشارية' },
  { slug: 'design-creative', name: 'Design & Creative', nameAr: 'التصميم والإبداع', description: 'Graphic and pixel art', descriptionAr: 'تصميم جرافيك وبكسل آرت' },
  { slug: 'media-production', name: 'Media & Production', nameAr: 'الإنتاج الإعلامي', description: 'Video & photo production', descriptionAr: 'إنتاج الفيديو والتصوير' },
  { slug: 'marketing-events', name: 'Marketing & Events', nameAr: 'التسويق والفعاليات', description: 'Digital marketing & event management', descriptionAr: 'التسويق الرقمي وإدارة الفعاليات' },
  { slug: 'it-office', name: 'IT & Office', nameAr: 'تقنية المعلومات والمكتبية', description: 'IT, networks & office services', descriptionAr: 'خدمات تقنية ومكتبية' }
];

const sharedTestimonials = JSON.stringify([
  { quote: "Troveseek transformed our digital presence. Professional, responsive, and incredibly talented team.", author: "Sarah Jenkins", role: "Marketing Director" },
  { quote: "Outstanding service from start to finish. They delivered exactly what we needed, ahead of schedule.", author: "Michael Chen", role: "Startup Founder" }
]);

const sharedTestimonialsAr = JSON.stringify([
  { quote: "أحدثت تروفسيك نقلة نوعية في حضورنا الرقمي. فريق محترف، متجاوب، وموهوب بشكل استثنائي.", author: "سارة الجاسم", role: "مديرة التسويق" },
  { quote: "خدمة متميزة من البداية للنهاية. قدموا لنا بالضبط ما نحتاجه وقبل الموعد المحدد.", author: "محمد عبدالله", role: "مؤسس شركة ناشئة" }
]);

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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Professional Web Development Services | Troveseek',
    metaDescription: 'Get a custom, responsive, and high-performance website tailored for your business needs. Contact Troveseek today.',
    metaTitleAr: 'خدمات تطوير الويب الاحترافية | تروفسيك',
    metaDescriptionAr: 'احصل على موقع إلكتروني مخصص، متجاوب وعالي الأداء يلبي احتياجات عملك. تواصل مع تروفسيك اليوم.',
    process: JSON.stringify([
      { title: '01. Discovery & Planning', desc: 'Understanding your goals and target audience.' },
      { title: '02. Design & Prototyping', desc: 'Creating visually stunning and user-friendly layouts.' },
      { title: '03. Development', desc: 'Coding the website with modern technologies.' },
      { title: '04. Testing & Launch', desc: 'Ensuring everything works perfectly before going live.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. الاستكشاف والتخطيط', desc: 'فهم أهدافك وجمهورك المستهدف.' },
      { title: '02. التصميم والنمذجة', desc: 'إنشاء تخطيطات جذابة بصرياً وسهلة الاستخدام.' },
      { title: '03. التطوير والبرمجة', desc: 'برمجة الموقع باستخدام أحدث التقنيات.' },
      { title: '04. الاختبار والإطلاق', desc: 'التأكد من عمل كل شيء بشكل مثالي قبل الإطلاق.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Basic', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '14 Days', features: ['Landing Page', 'Mobile Responsive', 'Basic SEO'] },
      { name: 'Standard', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, duration: '30 Days', isPopular: true, features: ['Up to 5 Pages', 'CMS Integration', 'Contact Forms'] },
      { name: 'Premium', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: '45 Days', features: ['Unlimited Pages', 'Custom Features', 'Advanced SEO', 'Priority Support'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'الأساسية', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '14 يوم', features: ['صفحة هبوط', 'متجاوب مع الجوال', 'تحسين محركات البحث الأساسي'] },
      { name: 'القياسية', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, duration: '30 يوم', isPopular: true, features: ['حتى 5 صفحات', 'لوحة تحكم للمحتوى', 'نماذج تواصل'] },
      { name: 'الاحترافية', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: '45 يوم', features: ['صفحات غير محدودة', 'خصائص مخصصة', 'تحسين محركات بحث متقدم', 'دعم فني كأولوية'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Mobile App Development iOS & Android | Troveseek',
    metaDescription: 'Launch your high-performance mobile application for iOS and Android with Troveseek’s expert mobile development team.',
    metaTitleAr: 'تطوير تطبيقات الجوال iOS وأندرويد | تروفسيك',
    metaDescriptionAr: 'أطلق تطبيقك المتميز للهواتف الذكية مع فريق تروفسيك المتخصص في برمجة تطبيقات iOS وأندرويد.',
    process: JSON.stringify([
      { title: '01. Requirement Analysis', desc: 'Defining app features and functionalities.' },
      { title: '02. UI/UX Design', desc: 'Crafting intuitive mobile interfaces.' },
      { title: '03. App Development', desc: 'Building the app for iOS and Android.' },
      { title: '04. Deployment', desc: 'Publishing to App Store and Google Play.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. تحليل المتطلبات', desc: 'تحديد ميزات ووظائف التطبيق.' },
      { title: '02. تصميم واجهة المستخدم', desc: 'صياغة واجهات هواتف ذكية بديهية.' },
      { title: '03. تطوير التطبيق', desc: 'بناء التطبيق لأنظمة أندرويد و iOS.' },
      { title: '04. الإطلاق', desc: 'النشر على متجر آبل وجوجل بلاي.' }
    ]),
    tiers: JSON.stringify([
      { name: 'MVP', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '30 Days', features: ['Core Features', 'Single Platform', 'Basic UI'] },
      { name: 'Professional', price: 4000, priceDzd: 4000 * EXCHANGE_RATE, duration: '60 Days', isPopular: true, features: ['Cross-Platform', 'Advanced UI/UX', 'API Integration'] },
      { name: 'Enterprise', price: 8000, priceDzd: 8000 * EXCHANGE_RATE, duration: '90+ Days', features: ['Full Custom Solution', 'Admin Dashboard', 'Ongoing Maintenance'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'نسخة أولية (MVP)', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '30 يوم', features: ['الميزات الأساسية', 'منصة واحدة', 'واجهة مستخدم بسيطة'] },
      { name: 'احترافية', price: 4000, priceDzd: 4000 * EXCHANGE_RATE, duration: '60 يوم', isPopular: true, features: ['متعدد المنصات', 'واجهة مستخدم متقدمة', 'ربط مع واجهات برمجية'] },
      { name: 'للمؤسسات', price: 8000, priceDzd: 8000 * EXCHANGE_RATE, duration: '90+ يوم', features: ['حلول مخصصة بالكامل', 'لوحة تحكم إدارية', 'صيانة مستمرة'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'E-commerce Store Development & Setup | Troveseek',
    metaDescription: 'Start selling online with a fully optimized e-commerce store built by Troveseek. Secure payments and beautiful designs.',
    metaTitleAr: 'برمجة وتجهيز المتاجر الإلكترونية | تروفسيك',
    metaDescriptionAr: 'ابدأ البيع عبر الإنترنت من خلال متجر إلكتروني متكامل وآمن من تصميم وبرمجة تروفسيك.',
    process: JSON.stringify([
      { title: '01. Store Setup', desc: 'Configuring your platform (Shopify, WooCommerce, etc.).' },
      { title: '02. Design & Branding', desc: 'Customizing the store to match your brand.' },
      { title: '03. Product Upload', desc: 'Adding your catalog and configuring variants.' },
      { title: '04. Payment & Launch', desc: 'Setting up gateways and going live.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. إعداد المتجر', desc: 'تهيئة منصتك (شوبيفاي، ووكومرس، الخ).' },
      { title: '02. التصميم والهوية', desc: 'تخصيص المتجر ليتناسب مع هويتك التجارية.' },
      { title: '03. إضافة المنتجات', desc: 'إضافة الكتالوج الخاص بك وتهيئة المتغيرات.' },
      { title: '04. الدفع والإطلاق', desc: 'إعداد بوابات الدفع وإطلاق المتجر.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Starter Store', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '14 Days', features: ['Up to 50 Products', 'Standard Theme', '1 Payment Gateway'] },
      { name: 'Growth Store', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '25 Days', isPopular: true, features: ['Up to 500 Products', 'Premium Design', 'Multiple Gateways', 'Inventory Sync'] },
      { name: 'Enterprise Store', price: 3500, priceDzd: 3500 * EXCHANGE_RATE, duration: '45 Days', features: ['Unlimited Products', 'Custom Theme', 'ERP Integration', 'Multi-currency'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'المتجر المبتدئ', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '14 يوم', features: ['حتى 50 منتج', 'قالب قياسي', 'بوابة دفع واحدة'] },
      { name: 'متجر النمو', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '25 يوم', isPopular: true, features: ['حتى 500 منتج', 'تصميم احترافي', 'بوابات دفع متعددة', 'مزامنة المخزون'] },
      { name: 'متجر الشركات', price: 3500, priceDzd: 3500 * EXCHANGE_RATE, duration: '45 يوم', features: ['منتجات غير محدودة', 'قالب مخصص', 'ربط مع أنظمة ERP', 'متعدد العملات'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Virtual & Physical Visa Card Services | Troveseek',
    metaDescription: 'Get assistance issuing and managing your business Visa cards to streamline your global payments securely.',
    metaTitleAr: 'خدمات إصدار بطاقات فيزا الافتراضية والفعلية | تروفسيك',
    metaDescriptionAr: 'احصل على المساعدة في إصدار وإدارة بطاقات فيزا لأعمالك لتسهيل مدفوعاتك العالمية بكل أمان.',
    process: JSON.stringify([
      { title: '01. Application', desc: 'Submitting required business documents.' },
      { title: '02. Verification', desc: 'Identity and business verification process.' },
      { title: '03. Card Issuance', desc: 'Generating virtual cards instantly or shipping physical ones.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. تقديم الطلب', desc: 'إرسال وثائق العمل المطلوبة.' },
      { title: '02. التحقق', desc: 'عملية التحقق من الهوية والشركة.' },
      { title: '03. إصدار البطاقة', desc: 'إصدار بطاقات افتراضية فورياً أو شحن البطاقات الفعلية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Virtual Card', price: 50, priceDzd: 50 * EXCHANGE_RATE, duration: '24 Hours', features: ['Instant Issuance', 'Online Purchases', 'Prepaid Balance'] },
      { name: 'Physical Card', price: 120, priceDzd: 120 * EXCHANGE_RATE, duration: '7 Days', isPopular: true, features: ['ATM Withdrawals', 'In-Store Purchases', 'Higher Limits'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'بطاقة افتراضية', price: 50, priceDzd: 50 * EXCHANGE_RATE, duration: '24 ساعة', features: ['إصدار فوري', 'مشتريات عبر الإنترنت', 'رصيد مسبق الدفع'] },
      { name: 'بطاقة بلاستيكية', price: 120, priceDzd: 120 * EXCHANGE_RATE, duration: '7 أيام', isPopular: true, features: ['سحب من الصراف', 'شراء من المتاجر', 'حدود مالية أعلى'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Business Consulting & Startup Strategies | Troveseek',
    metaDescription: 'Expert consulting services to guide your startup from idea to successful execution. Data-driven growth strategies.',
    metaTitleAr: 'استشارات الأعمال واستراتيجيات الشركات الناشئة | تروفسيك',
    metaDescriptionAr: 'خدمات استشارية متخصصة لتوجيه شركتك الناشئة من الفكرة إلى التنفيذ الناجح عبر استراتيجيات مبنية على البيانات.',
    process: JSON.stringify([
      { title: '01. Initial Consultation', desc: 'Discussing your vision and challenges.' },
      { title: '02. Market Research', desc: 'Analyzing competitors and target market.' },
      { title: '03. Strategy Development', desc: 'Creating actionable business plans and financial models.' },
      { title: '04. Execution Support', desc: 'Guiding you through the launch phase.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. الاستشارة الأولية', desc: 'مناقشة رؤيتك والتحديات.' },
      { title: '02. دراسة السوق', desc: 'تحليل المنافسين والسوق المستهدف.' },
      { title: '03. تطوير الاستراتيجية', desc: 'إنشاء خطط عمل ونماذج مالية قابلة للتنفيذ.' },
      { title: '04. دعم التنفيذ', desc: 'توجيهك خلال مرحلة الإطلاق.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Idea Validation', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '7 Days', features: ['Market Analysis', 'Feasibility Study', '1-on-1 Strategy Call'] },
      { name: 'Business Plan', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '20 Days', isPopular: true, features: ['Full Business Plan', 'Financial Projections', 'Pitch Deck'] },
      { name: 'Startup Mentorship', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: 'Monthly', features: ['Monthly Retainer', 'Growth Strategy', 'Investor Connections'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'التحقق من الفكرة', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '7 أيام', features: ['تحليل السوق', 'دراسة جدوى مبدئية', 'مكالمة استراتيجية'] },
      { name: 'خطة العمل', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '20 يوم', isPopular: true, features: ['خطة عمل كاملة', 'توقعات مالية', 'ملف العرض الاستثماري'] },
      { name: 'توجيه الشركات الناشئة', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: 'شهرياً', features: ['عقد شهري', 'استراتيجية النمو', 'ربط مع مستثمرين'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Professional Graphic Design & Branding | Troveseek',
    metaDescription: 'Elevate your brand with Troveseek’s graphic design services. Logos, branding, and marketing materials.',
    metaTitleAr: 'تصميم جرافيكي وهويات بصرية احترافية | تروفسيك',
    metaDescriptionAr: 'ارتقِ بعلامتك التجارية مع خدمات التصميم الجرافيكي من تروفسيك. تصميم الشعارات، الهويات البصرية، والمواد التسويقية.',
    process: JSON.stringify([
      { title: '01. Briefing', desc: 'Gathering requirements and design preferences.' },
      { title: '02. Concept Creation', desc: 'Drafting initial design concepts.' },
      { title: '03. Revisions', desc: 'Refining the chosen concept based on feedback.' },
      { title: '04. Final Delivery', desc: 'Providing high-resolution and source files.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. جمع المتطلبات', desc: 'فهم متطلبات التصميم وتفضيلاتك.' },
      { title: '02. ابتكار الأفكار', desc: 'رسم المفاهيم والتصاميم الأولية.' },
      { title: '03. التعديلات', desc: 'تنقيح التصميم المختار بناءً على ملاحظاتك.' },
      { title: '04. التسليم النهائي', desc: 'تسليم الملفات الأصلية وبجودة عالية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Logo Design', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '5 Days', features: ['2 Concepts', '3 Revisions', 'High-Res Files'] },
      { name: 'Brand Identity', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '14 Days', isPopular: true, features: ['Logo Design', 'Business Cards', 'Letterhead', 'Brand Guidelines'] },
      { name: 'Marketing Materials', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '7 Days', features: ['Social Media Posts', 'Flyers', 'Banners'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'تصميم الشعار', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '5 أيام', features: ['مفهومان للتصميم', '3 مراجعات', 'ملفات عالية الجودة'] },
      { name: 'الهوية البصرية', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '14 يوم', isPopular: true, features: ['تصميم الشعار', 'بطاقات العمل', 'الأوراق الرسمية', 'دليل الهوية'] },
      { name: 'المواد التسويقية', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '7 أيام', features: ['تصاميم السوشيال ميديا', 'نشرات إعلانية', 'لافتات'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Custom Pixel Art & Game Sprites | Troveseek',
    metaDescription: 'Get stunning retro pixel art designs, character sprites, and environments for your next game or digital project.',
    metaTitleAr: 'تصميم فن البكسل وشخصيات الألعاب | تروفسيك',
    metaDescriptionAr: 'احصل على تصاميم بكسل مذهلة، وشخصيات ألعاب، وبيئات ريترو لمشروعك الرقمي القادم.',
    process: JSON.stringify([
      { title: '01. Concept Sketch', desc: 'Rough sketching of the artwork.' },
      { title: '02. Pixelation', desc: 'Converting sketches into pixel-perfect designs.' },
      { title: '03. Color & Shading', desc: 'Applying color palettes and details.' },
      { title: '04. Animation (Optional)', desc: 'Creating sprite sheets and loops.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. رسم المفهوم', desc: 'رسم تخطيطي أولي للعمل الفني.' },
      { title: '02. التحويل للبكسل', desc: 'تحويل الرسوم إلى تصاميم بكسل دقيقة.' },
      { title: '03. التلوين والتظليل', desc: 'تطبيق لوحات الألوان والتفاصيل.' },
      { title: '04. التحريك (اختياري)', desc: 'إنشاء أوراق الحركة والتكرارات.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Sprite/Icon', price: 80, priceDzd: 80 * EXCHANGE_RATE, duration: '3 Days', features: ['1 Character/Prop', 'Static Image', 'Commercial Rights'] },
      { name: 'Animated Sprite', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '6 Days', isPopular: true, features: ['1 Character', 'Idle/Walk Animation', 'Sprite Sheet'] },
      { name: 'Full Scene', price: 400, priceDzd: 400 * EXCHANGE_RATE, duration: '14 Days', features: ['Detailed Background', 'Multiple Elements', 'Atmospheric Effects'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'شخصية/أيقونة', price: 80, priceDzd: 80 * EXCHANGE_RATE, duration: '3 أيام', features: ['شخصية واحدة أو أداة', 'صورة ثابتة', 'حقوق تجارية'] },
      { name: 'شخصية متحركة', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '6 أيام', isPopular: true, features: ['شخصية واحدة', 'حركة المشي/الوقوف', 'ملف الحركة'] },
      { name: 'مشهد كامل', price: 400, priceDzd: 400 * EXCHANGE_RATE, duration: '14 يوم', features: ['خلفية مفصلة', 'عناصر متعددة', 'مؤثرات بصرية'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Professional Filmmaking & Commercials | Troveseek',
    metaDescription: 'High-end filmmaking services, short films, documentaries, and TV commercials crafted by our creative crew.',
    metaTitleAr: 'صناعة الأفلام والإعلانات التجارية | تروفسيك',
    metaDescriptionAr: 'خدمات صناعة الأفلام، الأفلام القصيرة، الوثائقيات، والإعلانات التلفزيونية بلمسة سينمائية متقدمة.',
    process: JSON.stringify([
      { title: '01. Pre-production', desc: 'Scripting, storyboarding, and casting.' },
      { title: '02. Production', desc: 'Filming with professional gear and crew.' },
      { title: '03. Post-production', desc: 'Editing, color grading, and sound design.' },
      { title: '04. Delivery', desc: 'Final export in cinematic formats.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. ما قبل الإنتاج', desc: 'كتابة السيناريو، رسم القصة، واختيار الممثلين.' },
      { title: '02. الإنتاج', desc: 'التصوير بمعدات وطاقم احترافي.' },
      { title: '03. ما بعد الإنتاج', desc: 'المونتاج، تلوين الفيديو، وتصميم الصوت.' },
      { title: '04. التسليم', desc: 'التصدير النهائي بصيغ سينمائية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Short Commercial', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: '20 Days', features: ['Up to 60 Seconds', '1 Shooting Day', 'Basic Color Grading'] },
      { name: 'Documentary/Short Film', price: 6000, priceDzd: 6000 * EXCHANGE_RATE, duration: '45 Days', isPopular: true, features: ['Up to 15 Mins', '3 Shooting Days', 'Advanced Sound Design'] },
      { name: 'Premium Production', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, duration: '90 Days', features: ['Full Crew', 'Cinema Cameras', 'Visual Effects (VFX)'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'إعلان قصير', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: '20 يوم', features: ['حتى 60 ثانية', 'يوم تصوير واحد', 'تلوين أساسي'] },
      { name: 'فيلم وثائقي/قصير', price: 6000, priceDzd: 6000 * EXCHANGE_RATE, duration: '45 يوم', isPopular: true, features: ['حتى 15 دقيقة', '3 أيام تصوير', 'هندسة صوت متقدمة'] },
      { name: 'إنتاج ممتاز', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, duration: '90 يوم', features: ['طاقم كامل', 'كاميرات سينمائية', 'مؤثرات بصرية'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Corporate Video Production & Editing | Troveseek',
    metaDescription: 'Boost your brand with professional video production, YouTube editing, and social media video content.',
    metaTitleAr: 'إنتاج ومونتاج الفيديو للشركات | تروفسيك',
    metaDescriptionAr: 'عزز علامتك التجارية من خلال إنتاج فيديو احترافي، مونتاج يوتيوب، ومقاطع الفيديو لمنصات التواصل الاجتماعي.',
    process: JSON.stringify([
      { title: '01. Ideation', desc: 'Defining the video goal and style.' },
      { title: '02. Filming/Animation', desc: 'Recording footage or creating motion graphics.' },
      { title: '03. Editing', desc: 'Cutting, adding transitions, and text overlays.' },
      { title: '04. Audio & Export', desc: 'Adding background music and rendering.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. توليد الأفكار', desc: 'تحديد هدف الفيديو وأسلوبه.' },
      { title: '02. التصوير/التحريك', desc: 'تسجيل اللقطات أو إنشاء الرسوم المتحركة.' },
      { title: '03. المونتاج', desc: 'القص، إضافة الانتقالات، والنصوص.' },
      { title: '04. الصوت والتصدير', desc: 'إضافة موسيقى خلفية واستخراج الفيديو.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Social Media Reel', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '3 Days', features: ['Up to 30 Seconds', 'Vertical Format', 'Trending Audio'] },
      { name: 'Corporate Video', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, duration: '10 Days', isPopular: true, features: ['Up to 3 Minutes', 'Interviews & B-Roll', 'Branded Graphics'] },
      { name: 'YouTube Editing', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: 'Monthly', features: ['4 Videos per Month', 'Thumbnails Included', 'SEO Tags'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'ريلز انستجرام/تيك توك', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '3 أيام', features: ['حتى 30 ثانية', 'صيغة عمودية', 'صوتيات رائجة'] },
      { name: 'فيديو تعريفي للشركة', price: 1200, priceDzd: 1200 * EXCHANGE_RATE, duration: '10 أيام', isPopular: true, features: ['حتى 3 دقائق', 'مقابلات ولقطات داعمة', 'رسوميات بهوية الشركة'] },
      { name: 'مونتاج يوتيوب', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: 'شهرياً', features: ['4 فيديوهات شهرياً', 'يشمل الصور المصغرة', 'كلمات مفتاحية'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Professional Photography Services | Troveseek',
    metaDescription: 'High-end photography for events, corporate portraits, and e-commerce products.',
    metaTitleAr: 'خدمات التصوير الفوتوغرافي الاحترافية | تروفسيك',
    metaDescriptionAr: 'تصوير فوتوغرافي عالي الجودة للفعاليات، البورتريه المؤسسي، ومنتجات التجارة الإلكترونية.',
    process: JSON.stringify([
      { title: '01. Planning', desc: 'Discussing location, style, and shot list.' },
      { title: '02. Photoshoot', desc: 'Conducting the professional photo session.' },
      { title: '03. Retouching', desc: 'Editing and color correcting the best photos.' },
      { title: '04. Delivery', desc: 'Providing a secure digital gallery.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. التخطيط', desc: 'مناقشة الموقع، الأسلوب، وقائمة اللقطات.' },
      { title: '02. جلسة التصوير', desc: 'تنفيذ جلسة التصوير الاحترافية.' },
      { title: '03. التعديل والريتوش', desc: 'تعديل وتصحيح ألوان أفضل الصور.' },
      { title: '04. التسليم', desc: 'توفير معرض صور رقمي آمن.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Portrait Session', price: 200, priceDzd: 200 * EXCHANGE_RATE, duration: '3 Days', features: ['1 Hour Session', '10 Retouched Photos', '1 Location'] },
      { name: 'Product Photography', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '7 Days', isPopular: true, features: ['Up to 20 Products', 'White Background/Lifestyle', 'High-Res'] },
      { name: 'Event Coverage', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '5 Days', features: ['Up to 4 Hours', 'Unlimited Photos', 'Highlight Album'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'جلسة بورتريه', price: 200, priceDzd: 200 * EXCHANGE_RATE, duration: '3 أيام', features: ['جلسة لمدة ساعة', '10 صور معدلة', 'موقع واحد'] },
      { name: 'تصوير المنتجات', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '7 أيام', isPopular: true, features: ['حتى 20 منتج', 'خلفية بيضاء أو نمط حياة', 'دقة عالية'] },
      { name: 'تغطية الفعاليات', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: '5 أيام', features: ['حتى 4 ساعات', 'صور غير محدودة', 'ألبوم لأبرز اللحظات'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Corporate Event & Conference Management | Troveseek',
    metaDescription: 'Expert event planning and management for corporate seminars, public events, and large conferences.',
    metaTitleAr: 'إدارة وتخطيط الفعاليات والمؤتمرات | تروفسيك',
    metaDescriptionAr: 'إدارة وتخطيط الفعاليات باحترافية للندوات المؤسسية، المناسبات العامة، والمؤتمرات الكبرى.',
    process: JSON.stringify([
      { title: '01. Conceptualization', desc: 'Defining event goals, theme, and budget.' },
      { title: '02. Planning & Logistics', desc: 'Booking venues, vendors, and managing schedules.' },
      { title: '03. Marketing', desc: 'Promoting the event to your target audience.' },
      { title: '04. Execution', desc: 'On-site management during the event day.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. وضع التصور', desc: 'تحديد أهداف الفعالية، الفكرة، والميزانية.' },
      { title: '02. التخطيط واللوجستيات', desc: 'حجز القاعات، الموردين، وإدارة الجداول.' },
      { title: '03. التسويق', desc: 'الترويج للفعالية لجمهورك المستهدف.' },
      { title: '04. التنفيذ', desc: 'إدارة ميدانية خلال يوم الفعالية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Micro Event', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '30 Days', features: ['Up to 50 Attendees', 'Venue Sourcing', 'Basic Catering Setup'] },
      { name: 'Corporate Seminar', price: 5000, priceDzd: 5000 * EXCHANGE_RATE, duration: '60 Days', isPopular: true, features: ['Up to 200 Attendees', 'AV Equipment', 'Registration System'] },
      { name: 'Large Conference', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, duration: '120 Days', features: ['500+ Attendees', 'Multi-day', 'Full Marketing & VIP Handling'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'فعالية مصغرة', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: '30 يوم', features: ['حتى 50 ضيف', 'البحث عن قاعة', 'تنسيق الضيافة الأساسية'] },
      { name: 'ندوة للشركات', price: 5000, priceDzd: 5000 * EXCHANGE_RATE, duration: '60 يوم', isPopular: true, features: ['حتى 200 ضيف', 'تجهيزات صوت وضوء', 'نظام تسجيل إلكتروني'] },
      { name: 'مؤتمر ضخم', price: 15000, priceDzd: 15000 * EXCHANGE_RATE, duration: '120 يوم', features: ['500+ ضيف', 'عدة أيام', 'تسويق كامل وإدارة كبار الشخصيات'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Social Media Management Services | Troveseek',
    metaDescription: 'Grow your following and engage your community with expert social media management and content creation strategies.',
    metaTitleAr: 'خدمات إدارة وسائل التواصل الاجتماعي | تروفسيك',
    metaDescriptionAr: 'زد من متابعيك وتفاعل مجتمعك عبر استراتيجيات محتوى وإدارة منصات تواصل اجتماعي خبيرة.',
    process: JSON.stringify([
      { title: '01. Audit & Strategy', desc: 'Analyzing current profiles and defining a content strategy.' },
      { title: '02. Content Creation', desc: 'Designing graphics, writing copy, and planning the calendar.' },
      { title: '03. Publishing & Engagement', desc: 'Scheduling posts and interacting with followers.' },
      { title: '04. Reporting', desc: 'Monthly analytics on reach, engagement, and growth.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. التدقيق والاستراتيجية', desc: 'تحليل الحسابات الحالية وبناء استراتيجية المحتوى.' },
      { title: '02. صناعة المحتوى', desc: 'تصميم الجرافيك، كتابة النصوص، وجدولة التقويم.' },
      { title: '03. النشر والتفاعل', desc: 'جدولة المنشورات والتفاعل مع المتابعين.' },
      { title: '04. التقارير', desc: 'تحليلات شهرية حول الوصول، التفاعل، والنمو.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Starter', price: 400, priceDzd: 400 * EXCHANGE_RATE, duration: 'Monthly', features: ['2 Platforms', '12 Posts/Month', 'Basic Reporting'] },
      { name: 'Growth', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: 'Monthly', isPopular: true, features: ['3 Platforms', '20 Posts/Month', 'Community Management', 'Reels Creation'] },
      { name: 'Enterprise', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: 'Monthly', features: ['All Platforms', 'Daily Posting', 'Ad Management', '24/7 Support'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'البداية', price: 400, priceDzd: 400 * EXCHANGE_RATE, duration: 'شهرياً', features: ['منصتان', '12 منشور/شهر', 'تقارير أساسية'] },
      { name: 'النمو', price: 800, priceDzd: 800 * EXCHANGE_RATE, duration: 'شهرياً', isPopular: true, features: ['3 منصات', '20 منشور/شهر', 'إدارة المجتمع والردود', 'تصميم ريلز'] },
      { name: 'المؤسسات', price: 1500, priceDzd: 1500 * EXCHANGE_RATE, duration: 'شهرياً', features: ['كل المنصات', 'نشر يومي', 'إدارة الحملات الإعلانية', 'دعم 24/7'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Digital Marketing SEO & PPC Services | Troveseek',
    metaDescription: 'Drive more sales with targeted PPC campaigns, SEO optimization, and email marketing. Maximize your digital ROI.',
    metaTitleAr: 'خدمات التسويق الرقمي، محركات البحث والإعلانات | تروفسيك',
    metaDescriptionAr: 'زد مبيعاتك عبر حملات إعلانية موجهة، تحسين محركات البحث، والتسويق البريدي. ضاعف عائدك الاستثماري الرقمي.',
    process: JSON.stringify([
      { title: '01. Goal Setting', desc: 'Defining KPIs and target audience.' },
      { title: '02. Campaign Setup', desc: 'Creating ad accounts, tracking pixels, and landing pages.' },
      { title: '03. Launch & Monitor', desc: 'Running ads and closely monitoring performance.' },
      { title: '04. Optimization', desc: 'A/B testing and adjusting budgets to maximize ROI.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. تحديد الأهداف', desc: 'تحديد مؤشرات الأداء والجمهور المستهدف.' },
      { title: '02. إعداد الحملة', desc: 'إنشاء الحسابات الإعلانية، رموز التتبع، وصفحات الهبوط.' },
      { title: '03. الإطلاق والمراقبة', desc: 'تشغيل الإعلانات ومراقبة الأداء عن كثب.' },
      { title: '04. التحسين', desc: 'اختبار (أ/ب) وتعديل الميزانيات لتعظيم العائد.' }
    ]),
    tiers: JSON.stringify([
      { name: 'SEO Focus', price: 600, priceDzd: 600 * EXCHANGE_RATE, duration: 'Monthly', features: ['On-page SEO', 'Content Marketing', 'Backlink Building'] },
      { name: 'Paid Ads (PPC)', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, duration: 'Monthly', isPopular: true, features: ['Google Ads', 'Meta Ads', 'Retargeting Campaigns'] },
      { name: 'Omnichannel', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: 'Monthly', features: ['SEO + PPC', 'Email Automation', 'Conversion Rate Optimization'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'محركات البحث (SEO)', price: 600, priceDzd: 600 * EXCHANGE_RATE, duration: 'شهرياً', features: ['تحسين داخلي', 'تسويق بالمحتوى', 'بناء روابط خلفية'] },
      { name: 'إعلانات ممولة', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, duration: 'شهرياً', isPopular: true, features: ['إعلانات جوجل', 'إعلانات ميتا', 'حملات إعادة الاستهداف'] },
      { name: 'تسويق شامل', price: 2500, priceDzd: 2500 * EXCHANGE_RATE, duration: 'شهرياً', features: ['بحث + ممول', 'أتمتة البريد', 'تحسين معدل التحويل'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Network Setup & IT Support Solutions | Troveseek',
    metaDescription: 'Secure your business with robust IT networks, hardware setups, and 24/7 technical support.',
    metaTitleAr: 'إعداد الشبكات وحلول الدعم التقني | تروفسيك',
    metaDescriptionAr: 'أمّن شركتك بشبكات تقنية قوية، إعدادات أجهزة احترافية، ودعم فني على مدار الساعة.',
    process: JSON.stringify([
      { title: '01. Assessment', desc: 'Evaluating your current IT infrastructure.' },
      { title: '02. Design', desc: 'Planning a scalable network architecture.' },
      { title: '03. Implementation', desc: 'Installing hardware, routers, and configuring firewalls.' },
      { title: '04. Maintenance', desc: 'Ongoing support and security updates.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. التقييم', desc: 'تقييم بنيتك التحتية التقنية الحالية.' },
      { title: '02. التصميم', desc: 'تخطيط هيكلة شبكات قابلة للتوسع.' },
      { title: '03. التنفيذ', desc: 'تركيب الأجهزة، الموجهات، وإعداد جدران الحماية.' },
      { title: '04. الصيانة', desc: 'دعم مستمر وتحديثات أمنية.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Office Setup', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '7 Days', features: ['Router Configuration', 'Wi-Fi Setup', 'Basic Firewall'] },
      { name: 'Enterprise Network', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: '14 Days', isPopular: true, features: ['VLANs', 'Advanced Security', 'VPN Setup', 'Server Rack Config'] },
      { name: 'Monthly IT Support', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, duration: 'Monthly', features: ['24/7 Monitoring', 'Helpdesk Support', 'Data Backup'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'إعداد مكتبي', price: 500, priceDzd: 500 * EXCHANGE_RATE, duration: '7 أيام', features: ['برمجة الراوتر', 'إعداد شبكة واي فاي', 'جدار حماية أساسي'] },
      { name: 'شبكة للشركات', price: 2000, priceDzd: 2000 * EXCHANGE_RATE, duration: '14 يوم', isPopular: true, features: ['شبكات افتراضية VLAN', 'أمان متقدم', 'إعداد VPN', 'تجهيز خوادم'] },
      { name: 'دعم تقني شهري', price: 1000, priceDzd: 1000 * EXCHANGE_RATE, duration: 'شهرياً', features: ['مراقبة 24/7', 'مكتب مساعدة', 'نسخ احتياطي للبيانات'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
    features: JSON.stringify(['Cybersecurity', 'Cloud Integration', 'Hardware Setup', '24/7 Monitoring']),
    featuresAr: JSON.stringify(['أمن سيبراني', 'ربط سحابي', 'إعداد أجهزة', 'مراقبة على مدار الساعة'])
  },
  {
    categorySlug: 'it-office',
    name: 'Printing, Office & Thesis Writing',
    nameAr: 'خدمات الطباعة والمكتبية والرسائل الجامعية',
    slug: 'printing-office-thesis',
    description: 'High-quality printing, office supplies sourcing, and professional formatting/binding for academic theses.',
    descriptionAr: 'طباعة عالية الجودة، توفير مستلزمات مكتبية، وتنسيق وتجليد احترافي للرسائل الجامعية.',
    basePrice: 50,
    estimatedDays: 2,
    status: 'ACTIVE',
    tagline: 'Professional Print & Paper Solutions',
    taglineAr: 'حلول ورقية وطباعية احترافية',
    contactEmail: 'contact@troveseek.com',
    contactPhone: '0561309037',
    metaTitle: 'Professional Printing, Office Supplies & Thesis Binding | Troveseek',
    metaDescription: 'Fast, high-quality document printing, premium office supplies, and professional university thesis formatting and binding.',
    metaTitleAr: 'الطباعة الاحترافية والمستلزمات وتجليد الرسائل | تروفسيك',
    metaDescriptionAr: 'طباعة مستندات سريعة وعالية الجودة، مستلزمات مكتبية ممتازة، وتنسيق وتجليد احترافي للرسائل الجامعية.',
    process: JSON.stringify([
      { title: '01. Submission', desc: 'Uploading documents or requesting supplies.' },
      { title: '02. Formatting & Review', desc: 'Ensuring correct layout, margins, and paper quality.' },
      { title: '03. Production', desc: 'High-speed printing and professional binding.' },
      { title: '04. Delivery', desc: 'Local pickup or courier shipping.' }
    ]),
    processAr: JSON.stringify([
      { title: '01. تقديم الطلب', desc: 'رفع المستندات أو طلب المستلزمات.' },
      { title: '02. التنسيق والمراجعة', desc: 'التأكد من التخطيط، الهوامش، وجودة الورق.' },
      { title: '03. الإنتاج', desc: 'طباعة سريعة وتجليد احترافي.' },
      { title: '04. التسليم', desc: 'استلام محلي أو شحن سريع.' }
    ]),
    tiers: JSON.stringify([
      { name: 'Document Printing', price: 50, priceDzd: 50 * EXCHANGE_RATE, duration: '24 Hours', features: ['Up to 500 Pages', 'B&W or Color', 'Stapling/Binding'] },
      { name: 'Thesis Formatting & Binding', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '3 Days', isPopular: true, features: ['Academic Formatting', 'Hardcover Binding', 'Gold Foil Lettering'] },
      { name: 'Corporate Office Supplies', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '5 Days', features: ['Bulk Paper', 'Custom Envelopes', 'Pens & Stationery Box'] }
    ]),
    tiersAr: JSON.stringify([
      { name: 'طباعة مستندات', price: 50, priceDzd: 50 * EXCHANGE_RATE, duration: '24 ساعة', features: ['حتى 500 صفحة', 'أبيض وأسود أو ملون', 'تدبيس/تغليف'] },
      { name: 'تنسيق وتجليد الرسائل', price: 150, priceDzd: 150 * EXCHANGE_RATE, duration: '3 أيام', isPopular: true, features: ['تنسيق أكاديمي', 'تجليد صلب', 'طباعة باللون الذهبي'] },
      { name: 'مستلزمات مكتبية للشركات', price: 300, priceDzd: 300 * EXCHANGE_RATE, duration: '5 أيام', features: ['ورق بكميات كبيرة', 'أظرف مطبوعة', 'صندوق قرطاسية'] }
    ]),
    testimonials: sharedTestimonials,
    testimonialsAr: sharedTestimonialsAr,
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
