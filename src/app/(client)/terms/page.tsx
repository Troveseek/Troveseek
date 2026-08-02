import React from 'react';
import { getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | TroveSeek',
  description: 'Read the terms of service and usage conditions for TroveSeek platform.',
};

export default async function TermsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px', color: 'var(--clr-text)', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
        {isAr ? 'شروط الخدمة' : 'Terms of Service'}
      </h1>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '3rem' }}>
        {isAr ? 'آخر تحديث: أغسطس 2026' : 'Last Updated: August 2026'}
      </p>

      {isAr ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. قبول الشروط</h2>
            <p>من خلال الوصول إلى واستخدام المنتجات الرقمية، وحلول SaaS، والخدمات الاحترافية لـ TroveSeek، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام منصتنا.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. الملكية الفكرية</h2>
            <p>تظل جميع المحتويات والبرمجيات والتصاميم والأصول الرقمية المقدمة على المنصة ملكية فكرية حصرية لـ TroveSeek أو المرخصين لها. شراء أي أصل رقمي يمنحك ترخيصاً بالاستخدام وفقاً للشروط المحددة، وليس نقلاً للملكية.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. التزامات المستخدم</h2>
            <p>بصفتك مستخدماً، فإنك توافق على عدم توزيع أو إعادة بيع أو الهندسة العكسية لأي من منتجات أو برمجيات TroveSeek دون الحصول على إذن كتابي صريح. الاستخدام غير المصرح به قد يعرضك للمساءلة القانونية.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. حدود المسؤولية</h2>
            <p>لا تتحمل TroveSeek، بأي حال من الأحوال، مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام أو عدم القدرة على استخدام خدماتنا، بما في ذلك فقدان البيانات أو تعطل الأعمال.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. التعديلات على الخدمة</h2>
            <p>نحتفظ بالحق في تعديل أو إيقاف الخدمة (أو أي جزء منها) في أي وقت دون إشعار مسبق. لن نكون مسؤولين تجاهك أو تجاه أي طرف ثالث عن أي تعديل أو تعليق أو إيقاف للخدمة.</p>
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using TroveSeek's digital products, SaaS solutions, and professional services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Intellectual Property</h2>
            <p>All content, software, designs, and digital assets provided on the platform remain the exclusive intellectual property of TroveSeek or its licensors. Purchasing a digital asset grants you a license to use it according to specific terms, not a transfer of ownership.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. User Obligations</h2>
            <p>As a user, you agree not to distribute, resell, or reverse-engineer any of TroveSeek's products or software without explicit written authorization. Unauthorized use may result in legal action.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Limitation of Liability</h2>
            <p>In no event shall TroveSeek be liable for any indirect, incidental, special, or consequential damages arising out of the use or inability to use our services, including loss of data or business interruption.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Modifications to Service</h2>
            <p>We reserve the right to modify or discontinue the Service (or any part thereof) at any time without prior notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.</p>
          </section>
        </div>
      )}
    </div>
  );
}
