"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SupportClient({ initialStats = { open: 0, urgent: 0, resolvedToday: 0, avgResponseTime: '—' }, initialTickets = [] }: { initialStats?: any, initialTickets?: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/chat/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        toast.success('Status updated');
        router.refresh();
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      toast.error('Error updating status');
    }
  };

  const formattedTickets = initialTickets.map((ticket: any) => ({
    id: `#${ticket.id.substring(0, 8).toUpperCase()}`,
    customer: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--clr-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>
          {(ticket.user?.name || ticket.user?.email || '?')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-text)' }}>{ticket.user?.name || 'Unknown'}</div>
          <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{ticket.user?.email}</div>
        </div>
      </div>
    ),
    subject: <span style={{ fontWeight: 600 }}>{ticket.subject || 'General Inquiry'}</span>,
    department: <Badge variant="default">{ticket.department || 'Support'}</Badge>,
    status: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {ticket.status === 'RESOLVED' ? <CheckCircle2 size={14} color="var(--clr-text-muted)" /> : ticket.status === 'URGENT' ? <AlertCircle size={14} color="#ff4444" /> : <Clock size={14} color="#ffaa00" />}
        <select 
          value={ticket.status} 
          onChange={(e) => updateStatus(ticket.id, e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: ticket.status === 'OPEN' ? '#ffaa00' : ticket.status === 'URGENT' ? '#ff4444' : 'var(--clr-text-muted)',
            fontWeight: 600,
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <option value="OPEN">OPEN</option>
          <option value="URGENT">URGENT</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
    ),
    lastUpdated: new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString(),
    actions: <Button variant="secondary" size="sm" onClick={() => router.push('/admin/messages')}>Reply</Button>,
    _id: ticket.id,
    _status: ticket.status,
    _subject: ticket.subject || 'General Inquiry',
  }));

  const filteredTickets = React.useMemo(() => {
    return formattedTickets.filter(t => {
      const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
                            t._subject.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t._status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedTickets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Support Tickets</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage customer inquiries and technical support requests</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: 'Open Tickets', value: initialStats.open.toString(), color: '#ffaa00' },
          { label: 'Urgent', value: initialStats.urgent.toString(), color: '#ff4444' },
          { label: 'Resolved Today', value: initialStats.resolvedToday.toString(), color: 'var(--clr-accent)' },
          { label: 'Avg Response Time', value: initialStats.avgResponseTime, color: 'var(--clr-primary)' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</span>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search tickets by ID, customer, or subject..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 12px 10px 36px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Button variant="secondary" icon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
                Filters {statusFilter !== 'All' && `(${statusFilter})`}
              </Button>
              {showFilters && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '16px', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['All', 'Open', 'Resolved', 'Urgent'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="radio" name="status" checked={statusFilter === s} onChange={() => { setStatusFilter(s); setShowFilters(false); }} style={{ accentColor: 'var(--clr-primary)' }} />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <DataTable 
          columns={[
            { key: 'id', label: 'Ticket ID' },
            { key: 'customer', label: 'Customer' },
            { key: 'subject', label: 'Subject' },
            { key: 'department', label: 'Department' },
            { key: 'status', label: 'Status' },
            { key: 'lastUpdated', label: 'Last Updated' },
            { key: 'actions', label: '' },
          ]}
          data={filteredTickets}
        />
      </Card>
    </div>
  );
}
