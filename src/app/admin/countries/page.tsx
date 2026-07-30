"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Edit, BarChart2, Globe } from 'lucide-react';

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', tax: '0%', active: true, methods: ['Stripe', 'Crypto'] },
  { code: 'DZ', name: 'Algeria', currency: 'DZD', tax: '19%', active: true, methods: ['Baridi Mob', 'Crypto'] },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', tax: '20%', active: true, methods: ['Stripe'] },
  { code: 'FR', name: 'France', currency: 'EUR', tax: '20%', active: true, methods: ['Stripe'] },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', tax: '5%', active: true, methods: ['Stripe', 'Crypto', 'Binance'] },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', tax: '7.5%', active: false, methods: ['Crypto'] },
  { code: 'IN', name: 'India', currency: 'INR', tax: '18%', active: true, methods: ['Stripe'] },
  { code: 'BR', name: 'Brazil', currency: 'BRL', tax: '15%', active: false, methods: [] },
];

const METHOD_COLORS: Record<string, string> = {
  'Stripe': 'var(--clr-primary)',
  'Baridi Mob': '#00e5b0',
  'Crypto': '#ffaa00',
  'Binance': '#f3ba2f',
};

export default function CountriesAdminPage() {
  const [search, setSearch] = useState('');
  const [editingCountry, setEditingCountry] = useState<string | null>(null);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const tableData = filteredCountries.map(country => ({
    flag: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>{country.code === 'US' ? '🇺🇸' : country.code === 'DZ' ? '🇩🇿' : country.code === 'GB' ? '🇬🇧' : country.code === 'FR' ? '🇫🇷' : country.code === 'AE' ? '🇦🇪' : country.code === 'NG' ? '🇳🇬' : country.code === 'IN' ? '🇮🇳' : '🇧🇷'}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{country.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{country.code}</div>
        </div>
      </div>
    ),
    currency: country.currency,
    tax: country.tax,
    methods: (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {country.methods.length > 0 ? country.methods.map(m => (
          <span key={m} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '999px', background: `${METHOD_COLORS[m]}22`, color: METHOD_COLORS[m] }}>
            {m}
          </span>
        )) : <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>—</span>}
      </div>
    ),
    active: country.active ? <Badge variant="success">Active</Badge> : <Badge variant="default">Disabled</Badge>,
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="ghost" size="sm" icon={<Edit size={14} />} onClick={() => setEditingCountry(country.code)} />
        <Button variant="ghost" size="sm" icon={<BarChart2 size={14} />} />
      </div>
    ),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Countries Management</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Configure per-country settings, currencies, and payment methods</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={16} color="var(--clr-primary)" />
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--clr-text)' }}>{COUNTRIES.filter(c => c.active).length}</span>
          <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>active countries</span>
        </div>
      </div>

      {/* Edit Panel */}
      {editingCountry && (
        <Card style={{ border: '2px solid var(--clr-primary)' }}>
          <CardHeader style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)', flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              Edit: {COUNTRIES.find(c => c.code === editingCountry)?.name}
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setEditingCountry(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => setEditingCountry(null)}>Save Changes</Button>
            </div>
          </CardHeader>
          <CardBody style={{ padding: '24px', display: 'flex', gap: '32px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Currency</label>
                <select style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                  <option>USD — US Dollar</option>
                  <option>DZD — Algerian Dinar</option>
                  <option>EUR — Euro</option>
                  <option>GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Tax Rate (%)</label>
                <input type="number" defaultValue={COUNTRIES.find(c => c.code === editingCountry)?.tax.replace('%', '')} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Default Language</label>
                <select style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px' }}>Country Active</span>
                <input type="checkbox" defaultChecked={COUNTRIES.find(c => c.code === editingCountry)?.active} style={{ accentColor: 'var(--clr-primary)', width: '18px', height: '18px' }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px', color: 'var(--clr-text-muted)' }}>Enabled Payment Methods</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Stripe', 'Baridi Mob', 'Binance Pay', 'Crypto'].map(method => (
                  <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{method}</span>
                    <input type="checkbox" defaultChecked={COUNTRIES.find(c => c.code === editingCountry)?.methods.includes(method.split(' ')[0])} style={{ accentColor: 'var(--clr-primary)', width: '18px', height: '18px' }} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(124,111,255,0.06)', borderRadius: '8px', border: '1px solid rgba(124,111,255,0.2)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>
                  <strong style={{ color: 'var(--clr-primary)' }}>Custom Pricing Rule</strong><br />
                  Apply a percentage markup or discount for this country.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'center' }}>
                  <select style={{ padding: '6px 10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none', fontSize: '13px' }}>
                    <option>No adjustment</option>
                    <option>+% markup</option>
                    <option>-% discount</option>
                  </select>
                  <input type="number" placeholder="0" style={{ width: '70px', padding: '6px 10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none', fontSize: '13px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>%</span>
                </div>
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
