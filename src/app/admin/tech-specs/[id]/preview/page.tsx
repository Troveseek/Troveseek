import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import PreviewActions from './PreviewActions';

export default async function PreviewTechSpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const spec = await db.techSpec.findUnique({
    where: { id },
    include: { service: { select: { name: true } } },
  });

  if (!spec) return notFound();

  let sections: { title: string; content: string }[] = [];
  try { sections = JSON.parse(spec.sections || '[]'); } catch {}

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <PreviewActions specId={spec.id} />

      <div id="print-spec" style={{ background: '#fff', color: '#1a1a2e', borderRadius: '16px', padding: '48px', boxShadow: '0 4px 32px rgba(0,0,0,0.1)' }}>
        {/* Spec Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '32px', borderBottom: '2px solid #eee' }}>
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Technical Specification — {spec.specNumber}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px 0', color: '#1a1a2e' }}>{spec.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px', color: '#666' }}>
            <span>Client: <strong>{spec.clientName}</strong></span>
            {spec.service && <span>Service: <strong>{spec.service.name}</strong></span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', color: '#999', marginTop: '8px' }}>
            <span>Created: {format(new Date(spec.createdAt), 'MMMM d, yyyy')}</span>
            {spec.validUntil && <span>Valid until: {format(new Date(spec.validUntil), 'MMMM d, yyyy')}</span>}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
              {idx + 1}. {section.title}
            </h2>
            {section.content ? (
              <div dangerouslySetInnerHTML={{ __html: section.content }} style={{ lineHeight: 1.8, color: '#333', fontSize: '15px' }} />
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No content</p>
            )}
          </div>
        ))}

        {/* Pricing */}
        {spec.totalPrice && (
          <div style={{ marginTop: '40px', padding: '24px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
            <div style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Project Cost</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a2e', marginTop: '4px' }}>
              {spec.currency} {spec.totalPrice.toLocaleString()}
            </div>
          </div>
        )}

        {/* Signature Area */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
            
            {/* Company Signature */}
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Signature</div>
              {spec.companySignature ? (
                <div>
                  <img src={spec.companySignature} alt="Company Signature" style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }} />
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>TroveSeek</div>
                  {spec.companySignedAt && (
                    <div style={{ fontSize: '12px', color: '#999' }}>Signed on {format(new Date(spec.companySignedAt), 'MMMM d, yyyy h:mm a')}</div>
                  )}
                </div>
              ) : (
                <div style={{ width: '250px', height: '80px', borderBottom: '1px solid #333', position: 'relative' }}>
                  <span style={{ position: 'absolute', bottom: '-20px', left: 0, fontSize: '12px', color: '#999' }}>TroveSeek</span>
                </div>
              )}
            </div>

            {/* Client Signature */}
            <div style={{ flex: '1 1 250px' }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Signature</div>
              {spec.signatureData ? (
                <div>
                  <img src={spec.signatureData} alt="Client Signature" style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }} />
                  <div style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>{spec.signerName}</div>
                  {spec.signedAt && (
                    <div style={{ fontSize: '12px', color: '#999' }}>Signed on {format(new Date(spec.signedAt), 'MMMM d, yyyy h:mm a')}</div>
                  )}
                </div>
              ) : (
                <div style={{ width: '250px', height: '80px', borderBottom: '1px solid #333', position: 'relative' }}>
                  <span style={{ position: 'absolute', bottom: '-20px', left: 0, fontSize: '12px', color: '#999' }}>{spec.clientName}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #print-spec, #print-spec * {
            visibility: visible;
          }
          #print-spec {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}} />
    </div>
  );
}
