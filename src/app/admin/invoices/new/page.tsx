"use client";

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2, Plus, Trash2, Send, DownloadCloud } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function CreateInvoicePage() {
  const { formatPrice } = useCurrency();
  const [items, setItems] = useState([
    { id: 1, description: 'Custom Web Development', qty: 1, price: 1500 },
    { id: 2, description: 'UI/UX Design Audit', qty: 1, price: 500 },
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const tax = subtotal * 0.2; // 20% tax example
  const total = subtotal + tax;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/admin/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Back to Invoices
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Create Invoice</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost">Save Draft</Button>
          <Button variant="secondary" icon={<DownloadCloud size={16} />}>Preview PDF</Button>
          <Button variant="primary" icon={<Send size={16} />}>Send Invoice</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Editor Form */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Invoice Details</h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--clr-text-muted)' }}>INV-2026-1045</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input label="Customer Name" placeholder="e.g. Acme Corp" />
                <Input label="Customer Email" placeholder="billing@acmecorp.com" />
                <Input label="Billing Address" placeholder="123 Business St, Tech City" />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Issue Date</label>
                    <input type="date" defaultValue="2026-07-10" style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Due Date</label>
                    <input type="date" defaultValue="2026-07-24" style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Line Items</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px' }}>
                  <div style={{ flex: 3 }}>Description</div>
                  <div style={{ flex: 1 }}>Qty</div>
                  <div style={{ flex: 1 }}>Price ($)</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>Amount</div>
                  <div style={{ width: '32px' }}></div>
                </div>

                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 3 }}>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description" 
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="number" 
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 600, fontSize: '15px' }}>
                      {formatPrice(item.qty * item.price)}
                    </div>
                    <div style={{ width: '32px' }}>
                      <Button variant="ghost" size="sm" icon={<Trash2 size={16} color="#ff4444" />} onClick={() => removeItem(item.id)} />
                    </div>
                  </div>
                ))}

                <div>
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addItem}>Add Line Item</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Additional Settings</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Currency</label>
                  <select style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>DZD (DA)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Tax Rate (%)</label>
                  <input type="number" defaultValue="20" style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Notes / Terms (Optional)</label>
                <textarea rows={4} placeholder="Thank you for your business. Please pay within 14 days." style={{ width: '100%', padding: '14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Live Preview & Summary Panel */}
        <div style={{ flex: 1 }}>
          <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card>
              <CardBody style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)' }}>Summary</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Tax (20%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--clr-text-muted)' }}>Discount</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--clr-primary)' }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,230,176,0.1)', border: '1px solid rgba(0,230,176,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color="var(--clr-accent)" />
                  <span style={{ fontSize: '13px', color: 'var(--clr-text)' }}>Payment links will be attached to the email.</span>
                </div>
              </CardBody>
            </Card>

            <div style={{ background: '#fff', color: '#333', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>TroveSeek Ltd</strong>
                  <div style={{ color: '#666', marginTop: '4px' }}>London, UK</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 300, color: '#999' }}>INVOICE</div>
                  <strong style={{ fontSize: '14px' }}>#INV-2026-1045</strong>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '16px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Billed To</div>
                  <strong>Acme Corp</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Amount Due</div>
                  <strong style={{ fontSize: '16px', color: '#7c6fff' }}>{formatPrice(total)}</strong>
                </div>
              </div>
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>
                Live preview of customer PDF
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
