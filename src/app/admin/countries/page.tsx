"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Globe, Plus, Trash2, Loader, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const METHOD_COLORS: Record<string, string> = {
  'Stripe': 'var(--clr-primary)',
  'Baridi Mob': '#00e5b0',
  'Crypto': '#ffaa00',
  'Binance': '#f3ba2f',
};

type Country = {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  currency: string;
  taxRate: number;
  methods: string;
  defaultLanguage: string;
  isActive: boolean;
}

export default function CountriesAdminPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/countries');
      const data = await res.json();
      setCountries(data.data || []);
    } catch (e) {
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleEditClick = (c: Country) => {
    router.push(`/admin/countries/${c.id}/edit`);
  };

  const handleNewClick = () => {
    router.push('/admin/countries/new');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;
    try {
      const res = await fetch(`/api/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Country deleted');
      fetchCountries();
    } catch (e) {
      toast.error('Failed to delete country');
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const tableData = filteredCountries.map(country => {
    let parsedMethods: string[] = [];
    try {
      parsedMethods = JSON.parse(country.methods || '[]');
    } catch(e) {}

    return {
      flag: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{country.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{country.code.toUpperCase()}</div>
          </div>
        </div>
      ),
      currency: country.currency,
      tax: `${country.taxRate}%`,
      methods: (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {parsedMethods.length > 0 ? parsedMethods.map(m => (
            <span key={m} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '999px', background: `${METHOD_COLORS[m] || 'var(--clr-primary)'}22`, color: METHOD_COLORS[m] || 'var(--clr-primary)' }}>
              {m}
            </span>
          )) : <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>—</span>}
        </div>
      ),
      active: country.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="default">Disabled</Badge>,
      actions: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" icon={<Edit size={14} />} onClick={() => handleEditClick(country)} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} onClick={() => handleDelete(country.id)} />
        </div>
      ),
    };
  });

  if (loading && countries.length === 0) {
    return <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Countries Management</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Configure per-country settings, currencies, and payment methods</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <Globe size={16} color="var(--clr-primary)" />
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--clr-text)' }}>{countries.filter(c => c.isActive).length}</span>
            <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>active</span>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleNewClick}>Add Country</Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '360px', flex: 1 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}><Search size={16} /></div>
            <input type="text" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 12px 10px 36px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'flag', label: 'Country' },
            { key: 'currency', label: 'Currency' },
            { key: 'tax', label: 'Tax Rate' },
            { key: 'methods', label: 'Payment Methods' },
            { key: 'active', label: 'Status' },
            { key: 'actions', label: '' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
