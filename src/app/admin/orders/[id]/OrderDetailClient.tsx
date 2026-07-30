"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, User, Package, CreditCard, FileText, Trash2, Save, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderDetailClient({ initialOrder }: { initialOrder: any }) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.trackingNumber || '');

  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder((prev: any) => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveTrackingNumber = async () => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder((prev: any) => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to update tracking', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/orders');
      }
    } catch (err) {
      console.error('Failed to delete order', err);
      setIsUpdating(false);
    }
  };

  const generateInvoice = async () => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${order.id}/invoice`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setOrder((prev: any) => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to generate invoice', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const autoGenerateTracking = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let generated = 'TRV';
    for(let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTrackingNumber(generated);
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: generated }),
      });
      if (res.ok) {
        const json = await res.json();
        setOrder((prev: any) => ({ ...prev, ...json.data }));
      }
    } catch (err) {
      console.error('Failed to auto-generate tracking', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const tableData = order.items.map((item: any) => ({
    id: item.id,
    name: item.itemName,
    price: formatPrice(item.unitPrice),
    quantity: item.quantity,
    total: formatPrice(item.totalPrice),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/orders">
          <Button variant="ghost" icon={<ArrowLeft size={20} />} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>
            Order {order.orderNumber}
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={deleteOrder} disabled={isUpdating}>Delete</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--clr-primary)" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Order Items</h3>
            </CardHeader>
            <DataTable 
              columns={[
                { key: 'name', label: 'Item' },
                { key: 'price', label: 'Unit Price' },
                { key: 'quantity', label: 'Qty' },
                { key: 'total', label: 'Total' },
              ]}
              data={tableData}
            />
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--clr-border)' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                Total: {formatPrice(order.totalAmount)}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--clr-primary)" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Invoice</h3>
            </CardHeader>
            <CardBody style={{ padding: '20px' }}>
              {order.invoice ? (
                <div>
                  <Badge variant="success">Issued</Badge>
                  <p style={{ fontSize: '14px', marginTop: '12px' }}>Invoice Num: {order.invoice.invoiceNum}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No invoice generated yet.</span>
                  <Button variant="secondary" onClick={generateInvoice} disabled={isUpdating}>Generate Invoice</Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--clr-primary)" />
              <h3 style={{ margin: 0, fontSize: '14px' }}>Customer</h3>
            </CardHeader>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.user ? (
                <>
                  <div style={{ fontWeight: 600 }}>{order.user.name || 'Unknown'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{order.user.email}</div>
                  <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '8px' }}>ID: {order.user.id}</div>
                </>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Guest Customer</div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--clr-primary)" />
              <h3 style={{ margin: 0, fontSize: '14px' }}>Payment & Billing</h3>
            </CardHeader>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '4px' }}>Method</label>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentMethod || 'N/A'}</div>
              </div>
              {order.transactionId && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '4px' }}>Transaction ID / Hash</label>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{order.transactionId}</div>
                </div>
              )}
              {order.billingInfo && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '4px' }}>Billing Address</label>
                  {(() => {
                    try {
                      const b = JSON.parse(order.billingInfo);
                      return (
                        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          {b.firstName} {b.lastName}<br />
                          {b.email}<br />
                          {b.address}<br />
                          {b.city}, {b.state} {b.zip}<br />
                          {b.country}
                        </div>
                      );
                    } catch {
                      return <div style={{ fontSize: '13px' }}>Invalid JSON data</div>;
                    }
                  })()}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--clr-primary)" />
              <h3 style={{ margin: 0, fontSize: '14px' }}>Order Status</h3>
            </CardHeader>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '8px' }}>Payment Status</label>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'default'}>{order.paymentStatus}</Badge>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '8px' }}>Fulfillment Status</label>
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={isUpdating}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--clr-border)',
                    background: 'var(--clr-surface)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', display: 'block', marginBottom: '8px' }}>Tracking Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1Z9999999999999999"
                    disabled={isUpdating}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--clr-border)',
                      background: 'var(--clr-surface)',
                      fontSize: '13px',
                    }}
                  />
                  <Button variant="secondary" onClick={autoGenerateTracking} disabled={isUpdating} icon={<Zap size={14} />} title="Auto-generate tracking number" />
                  <Button variant="secondary" onClick={saveTrackingNumber} disabled={isUpdating} icon={<Save size={14} />} title="Save tracking number" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
