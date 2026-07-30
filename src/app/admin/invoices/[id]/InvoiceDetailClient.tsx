"use client";

import React, { useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function InvoiceDetailClient({ invoice, backLink = "/admin/invoices" }: { invoice: any, backLink?: string }) {
  const { formatPrice } = useCurrency();

  useEffect(() => {
    // If the URL contains ?download=true, automatically open the print dialog
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('download') === 'true') {
        setTimeout(() => window.print(), 500);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={backLink}>
            <Button variant="ghost" icon={<ArrowLeft size={20} />} />
          </Link>
          <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>
            Invoice {invoice.invoiceNum}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<Printer size={16} />} onClick={handlePrint}>Print / Save PDF</Button>
        </div>
      </div>

      <Card id="print-invoice" style={{ background: '#fff', color: '#000' }}>
        <CardBody style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', fontFamily: 'var(--font-display)' }}>TroveSeek</h2>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>123 Tech Avenue</p>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>San Francisco, CA 94107</p>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>contact@troveseek.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '36px', margin: '0 0 12px 0', color: '#333', textTransform: 'uppercase' }}>Invoice</h1>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <span style={{ color: '#666', width: '100px' }}>Invoice #:</span>
                <span style={{ fontWeight: 600, width: '120px' }}>{invoice.invoiceNum}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <span style={{ color: '#666', width: '100px' }}>Issued Date:</span>
                <span style={{ fontWeight: 600, width: '120px' }}>{new Date(invoice.issuedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <span style={{ color: '#666', width: '100px' }}>Due Date:</span>
                <span style={{ fontWeight: 600, width: '120px' }}>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#eee', width: '100%' }} />

          {/* Customer Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Bill To</h4>
              {invoice.order?.user ? (
                <>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>{invoice.order.user.name}</p>
                  <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>{invoice.order.user.email}</p>
                </>
              ) : (
                <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>Guest Customer</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Status</h4>
              <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'danger' : 'default'} style={{ fontSize: '16px', padding: '6px 12px' }}>
                {invoice.status}
              </Badge>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '12px 0', color: '#333' }}>Item Description</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: '#333' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: '#333' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '12px 0', color: '#333' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.order?.items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px 0', color: '#444' }}>{item.itemName}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: '#444' }}>{item.quantity}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: '#444' }}>
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: '#444', fontWeight: 600 }}>
                      {formatPrice(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>
                  {formatPrice(invoice.order?.totalAmount || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                <span style={{ color: '#333', fontWeight: 700, fontSize: '18px' }}>Total Due:</span>
                <span style={{ color: '#333', fontWeight: 700, fontSize: '18px' }}>
                  {formatPrice(invoice.order?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
            <p>Thank you for your business!</p>
            <p>If you have any questions regarding this invoice, please contact contact@troveseek.com.</p>
          </div>
        </CardBody>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #print-invoice, #print-invoice * {
            visibility: visible;
          }
          #print-invoice {
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
