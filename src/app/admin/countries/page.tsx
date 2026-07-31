"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Edit, Globe, Plus, Trash2, Loader, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const METHOD_COLORS: Record<string, string> = {
  'Stripe': 'var(--clr-primary)',
  'Baridi Mob': '#00e5b0',
  'Crypto': '#ffaa00',
  'Binance': '#f3ba2f',
};

const ALL_METHODS = ['Stripe', 'Baridi Mob', 'Binance', 'Crypto'];

type Country = {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  currency: string;
  taxRate: number;
  methods: string; // JSON string
  defaultLanguage: string;
  isActive: boolean;
}

export default function CountriesAdminPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Country>>({});
  const [saving, setSaving] = useState(false);

  // New State
  const [isCreating, setIsCreating] = useState(false);

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
    setEditingId(c.id);
    setEditForm({ ...c });
    setIsCreating(false);
  };

  const handleNewClick = () => {
    setEditingId('new');
    setIsCreating(true);
    setEditForm({
      code: '',
      name: '',
      currency: 'USD',
      taxRate: 0,
      methods: '[]',
      defaultLanguage: 'en',
      isActive: true
    });
  };

  const handleMethodToggle = (method: string) => {
    try {
      let current = JSON.parse(editForm.methods || '[]');
      if (current.includes(method)) {
        current = current.filter((m: string) => m !== method);
      } else {
        current.push(method);
      }
      setEditForm({ ...editForm, methods: JSON.stringify(current) });
    } catch (e) {
      setEditForm({ ...editForm, methods: JSON.stringify([method]) });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isNew = editingId === 'new';
      const url = isNew ? '/api/countries' : `/api/countries/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(isNew ? 'Country added' : 'Country updated');
      setEditingId(null);
      setIsCreating(false);
      fetchCountries();
    } catch (e) {
      toast.error('Failed to save country');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;
    try {
      const res = await fetch(`/api/countries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Country deleted');
      fetchCountries();
      if (editingId === id) setEditingId(null);
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

      {/* Edit Panel */}
      {editingId && (
        <Card style={{ border: '2px solid var(--clr-primary)' }}>
          <CardHeader style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              {isCreating ? 'New Country' : `Edit: ${editForm.name}`}
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setEditingId(null)} icon={<X size={16}/>}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} icon={saving ? <Loader size={16} className="spin" /> : <Save size={16}/>}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>
          <CardBody style={{ padding: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Country Name</label>
                  <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="e.g. United States" />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>ISO Code</label>
                  <input type="text" value={editForm.code || ''} onChange={e => setEditForm({...editForm, code: e.target.value.toLowerCase()})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="us" maxLength={2} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Currency</label>
                  <input type="text" value={editForm.currency || ''} onChange={e => setEditForm({...editForm, currency: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="USD" maxLength={3} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Tax Rate (%)</label>
                  <input type="number" value={editForm.taxRate || 0} onChange={e => setEditForm({...editForm, taxRate: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Default Language</label>
                <select value={editForm.defaultLanguage || 'en'} onChange={e => setEditForm({...editForm, defaultLanguage: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                  <option value="en">English (en)</option>
                  <option value="ar">Arabic (ar)</option>
                  <option value="fr">French (fr)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px' }}>Country Active</span>
                <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} style={{ accentColor: 'var(--clr-primary)', width: '18px', height: '18px' }} />
              </div>
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px', color: 'var(--clr-text-muted)' }}>Enabled Payment Methods</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ALL_METHODS.map(method => {
                  let parsed = [];
                  try { parsed = JSON.parse(editForm.methods || '[]'); } catch(e) {}
                  const isChecked = parsed.includes(method);
                  return (
                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{method}</span>
                      <input type="checkbox" checked={isChecked} onChange={() => handleMethodToggle(method)} style={{ accentColor: 'var(--clr-primary)', width: '18px', height: '18px' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Countries Table */}
      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ position: 'relative', maxWidth: '360px', flex: 1 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}><Search size={16} /></div>
            <input type="text" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 12px 10px 36px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
          </div>
        </CardHeader>
        <DataTable
          columns={[
            { key: 'flag', label: 'Country' },
            { key: 'currency', label: 'Currency' },
            { key: 'tax', label: 'Tax Rate' },
            { key: 'methods', label: 'Payment Methods' },
            { key: 'active', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
