import React from 'react';
import { getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TroveSeek',
  description: 'Read how TroveSeek collects, uses, and protects your personal data.',
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px', color: 'var(--clr-text)', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
        {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      </h1>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '3rem' }}>
        {isAr ? 'آخر تحديث: أغسطس 2026' : 'Last Updated: August 2026'}
      </p>

      {isAr ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. جمع البيانات</h2>
            <p>نقوم بجمع المعلومات اللازمة لتقديم خدماتنا بأعلى جودة، ومعالجة المعاملات، وتحسين تجربة المستخدم. يشمل ذلك تفاصيل الحساب، معلومات الدفع، وبيانات وتحليلات الاستخدام للمنصة.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. أمن وحماية البيانات</h2>
            <p>نحن نأخذ أمن بياناتك على محمل الجد. نستخدم تشفيراً بمستوى المؤسسات (Enterprise-grade) ومعايير أمان رائدة في الصناعة لحماية بياناتك الشخصية والمالية من الوصول غير المصرح به أو التسريب.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. مشاركة الأطراف الثالثة</h2>
            <p>نحن لا نبيع بياناتك الشخصية لأي جهة. قد نشارك المعلومات فقط مع معالجي الدفع الموثوقين ومقدمي الخدمات لأغراض تشغيلية بحتة ولضمان تقديم الخدمة بسلاسة.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. ملفات تعريف الارتباط (Cookies)</h2>
            <p>تستخدم منصتنا ملفات تعريف الارتباط لتحسين تجربتك، وتخصيص المحتوى، وتحليل حركة المرور. يمكنك إدارة تفضيلاتك من خلال إعدادات المتصفح الخاص بك.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. حقوقك</h2>
            <p>بموجب قوانين حماية البيانات، لديك الحق في الوصول إلى بياناتك الشخصية، أو تصحيحها، أو طلب حذفها بالكامل في أي وقت عبر التواصل مع فريق الدعم لدينا.</p>
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Data Collection</h2>
            <p>We collect information necessary to provide our services at the highest quality, process transactions, and improve user experience. This includes account details, payment information, and platform usage analytics.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Data Security</h2>
            <p>We take your data security seriously. We employ enterprise-grade encryption and industry-leading security standards to protect your personal and financial data against unauthorized access or breaches.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. Third-Party Sharing</h2>
            <p>We do not sell your personal data. We may share information exclusively with trusted payment processors and service providers strictly for operational purposes to ensure seamless service delivery.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Cookies & Tracking</h2>
            <p>Our platform uses cookies to enhance your experience, personalize content, and analyze site traffic. You can manage your cookie preferences through your browser settings.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Your Rights</h2>
            <p>Under applicable data protection laws, you have the right to access, correct, or request the complete deletion of your personal data at any time by contacting our support team.</p>
          </section>
        </div>
      )}
    </div>
  );
}
