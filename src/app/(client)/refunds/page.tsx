import React from 'react';
import { getLocale } from 'next-intl/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | TroveSeek',
  description: 'Read the refund policy for TroveSeek digital products, SaaS, and services.',
};

export default async function RefundsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px', color: 'var(--clr-text)', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
        {isAr ? 'سياسة الاسترجاع' : 'Refund Policy'}
      </h1>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '3rem' }}>
        {isAr ? 'آخر تحديث: أغسطس 2026' : 'Last Updated: August 2026'}
      </p>

      {isAr ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. المنتجات والأصول الرقمية</h2>
            <p>نظراً لطبيعة الأصول والمنتجات الرقمية القابلة للتنزيل الفوري، تعتبر جميع المبيعات نهائية. يتم إصدار المبالغ المستردة فقط واستثنائياً إذا ثبت من خلال فريق الدعم الفني أن الملف تالف فنياً أو معيب بشكل يمنع استخدامه كما هو معلن.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. اشتراكات البرمجيات كخدمة (SaaS)</h2>
            <p>يمكنك إلغاء اشتراكك في برمجياتنا في أي وقت تريده. سيسري الإلغاء فوراً ولن يتم تجديد الفوترة في الدورة التالية. ومع ذلك، نحن لا نقدم أي استرداد مالي جزئي أو كلي للوقت غير المستخدم في فترة فوترة مدفوعة ومفعلة بالفعل.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. الخدمات الاحترافية والاستشارية</h2>
            <p>يتم تقييم طلبات استرداد المبالغ للخدمات الاستشارية والتطوير المخصص على أساس كل حالة على حدة. يعتمد التقييم بشكل صارم على الإنجازات المحققة (Milestones) والموارد التي تم تخصيصها للمشروع حتى تاريخ طلب الإلغاء.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. معالجة المبالغ المستردة</h2>
            <p>في حال الموافقة على طلب الاسترداد، ستتم معالجة المبلغ خلال 5 إلى 10 أيام عمل. سيتم إرجاع المبلغ حصرياً إلى طريقة الدفع الأصلية التي تم استخدامها أثناء عملية الشراء.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. تقديم طلب استرداد</h2>
            <p>لتقديم طلب استرداد، يرجى التواصل مع فريق الدعم الفني عبر صفحة "تواصل معنا" مع تقديم رقم الطلب ووصف تفصيلي ومبرر لسبب طلب الاسترداد.</p>
          </section>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Digital Products & Assets</h2>
            <p>Due to the nature of instantly downloadable digital assets, all sales are considered final. Refunds are only issued in exceptional cases where our technical support team confirms that a file is corrupted or fundamentally defective, preventing it from being used as advertised.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. SaaS Subscriptions</h2>
            <p>You may cancel your SaaS subscription at any time. The cancellation will take effect immediately, preventing future billing. However, we do not provide full or partial refunds for unused time within an already paid and active billing cycle.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. Professional & Consulting Services</h2>
            <p>Refund requests for bespoke development and consulting services are evaluated on a strict case-by-case basis. The evaluation depends entirely on the milestones already achieved and the resources allocated to the project up to the date of the cancellation request.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Refund Processing</h2>
            <p>If a refund request is approved, the funds will be processed within 5 to 10 business days. The refund will be issued exclusively to the original payment method used during the transaction.</p>
          </section>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Submitting a Request</h2>
            <p>To submit a refund request, please contact our support team via the "Contact Us" page. Ensure you provide your order number and a detailed, justified description of why you are requesting a refund.</p>
          </section>
        </div>
      )}
    </div>
  );
}
