"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Globe, Plus, Trash2, Loader, Edit, Search, CheckCircle2, 
  XCircle, Sparkles, RefreshCw, Layers, CreditCard, DollarSign,
  Filter, AlertTriangle, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { parsePaymentMethods, getCountryFlag, STANDARD_PAYMENT_METHODS } from '@/lib/data/countries';

const METHOD_COLOR_MAP: Record<string, string> = {
  'Stripe': 'var(--clr-primary)',
  'Baridi Mob': '#00e5b0',
  'Binance': '#f3ba2f',
  'Crypto': '#ffaa00',
  'PayPal': '#0070ba',
  'Bank Transfer': '#8b5cf6',
  'Cash on Delivery': '#10b981'
};

type Country = {
  id: string;
  code: string;
  name: string;
  nameAr?: string | null;
  currency: string;
  taxRate: number;
  methods: string;
  methodsList?: string[];
  defaultLanguage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function CountriesAdminPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteModalCountry, setDeleteModalCountry] = useState<Country | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/countries');
      if (!res.ok) throw new Error('Failed to load countries');
      const data = await res.json();
      setCountries(data.data || []);
    } catch (e) {
      toast.error('Failed to load countries from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleToggleStatus = async (country: Country) => {
    const nextState = !country.isActive;
    setTogglingId(country.id);

    // Optimistic update
    setCountries(prev => prev.map(c => c.id === country.id ? { ...c, isActive: nextState } : c));

    try {
      const res = await fetch(`/api/countries/${country.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState })
      });

      if (!res.ok) throw new Error('Update failed');
      toast.success(`${country.name} is now ${nextState ? 'Active' : 'Disabled'}`);
    } catch (e) {
      // Revert on failure
      setCountries(prev => prev.map(c => c.id === country.id ? { ...c, isActive: !nextState } : c));
      toast.error('Failed to update country status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSeedPresets = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_presets' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seeding failed');
      
      toast.success(data.message || 'Standard preset countries added successfully!');
      fetchCountries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed countries');
    } finally {
      setSeeding(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalCountry) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/countries/${deleteModalCountry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      toast.success(`Country "${deleteModalCountry.name}" deleted`);
      setDeleteModalCountry(null);
      fetchCountries();
    } catch (e) {
      toast.error('Failed to delete country');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = countries.length;
    const active = countries.filter(c => c.isActive).length;
    const currencies = new Set(countries.map(c => c.currency.toUpperCase())).size;
    const methodsSet = new Set<string>();
    countries.forEach(c => {
      const list = c.methodsList || parsePaymentMethods(c.methods);
      list.forEach(m => methodsSet.add(m));
    });
    return { total, active, currencies, methodsCount: methodsSet.size };
  }, [countries]);

  // Filtered dataset
  const filteredCountries = useMemo(() => {
    return countries.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.nameAr && c.nameAr.toLowerCase().includes(search.toLowerCase())) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.currency.toLowerCase().includes(search.toLowerCase());

      const statusMatch = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? c.isActive : !c.isActive;

      const methods = c.methodsList || parsePaymentMethods(c.methods);
      const methodMatch = 
        methodFilter === 'ALL' ? true : methods.includes(methodFilter);

      return nameMatch && statusMatch && methodMatch;
    });
  }, [countries, search, statusFilter, methodFilter]);

  const tableData = filteredCountries.map(country => {
    const methods = country.methodsList || parsePaymentMethods(country.methods);
    const flag = getCountryFlag(country.code);

    return {
      country: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '28px',
            lineHeight: 1,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--clr-surface-elevated)',
            border: '1px solid var(--clr-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {flag}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--clr-text)' }}>
                {country.name}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--clr-surface-elevated)',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text-muted)',
                letterSpacing: '0.5px'
              }}>
                {country.code.toUpperCase()}
              </span>
            </div>
            {country.nameAr && (
              <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '2px', fontFamily: 'var(--font-arabic, inherit)' }}>
                {country.nameAr}
              </div>
            )}
          </div>
        </div>
      ),
      currency: (
        <div>
          <span style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'inline-block'
          }}>
            {country.currency.toUpperCase()}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
            Lang: {country.defaultLanguage.toUpperCase()}
          </div>
        </div>
      ),
      tax: (
        <div>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: country.taxRate > 0 ? 'var(--clr-text)' : 'var(--clr-text-muted)'
          }}>
            {country.taxRate}%
          </span>
          <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>
            {country.taxRate > 0 ? 'VAT / Tax' : 'Zero Tax'}
          </div>
        </div>
      ),
      methods: (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '320px' }}>
          {methods.length > 0 ? methods.map(m => {
            const color = METHOD_COLOR_MAP[m] || 'var(--clr-primary)';
            return (
              <span 
                key={m} 
                style={{ 
                  padding: '3px 9px', 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  borderRadius: '999px', 
                  background: `${color}18`, 
                  color: color,
                  border: `1px solid ${color}35`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                {m}
              </span>
            );
          }) : (
            <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
              No methods enabled
            </span>
          )}
        </div>
      ),
      active: (
        <button
          type="button"
          onClick={() => handleToggleStatus(country)}
          disabled={togglingId === country.id}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Click to toggle status"
        >
          {country.isActive ? (
            <Badge variant="success" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}>
              <CheckCircle2 size={12} /> Active
            </Badge>
          ) : (
            <Badge variant="default" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'var(--clr-surface-elevated)', color: 'var(--clr-text-muted)' }}>
              <XCircle size={12} /> Disabled
            </Badge>
          )}
        </button>
      ),
      actions: (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Edit size={15} />} 
            onClick={() => router.push(`/admin/countries/${country.id}/edit`)}
            title="Edit Country Configuration"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Trash2 size={15} color="#ef4444" />} 
            onClick={() => setDeleteModalCountry(country)}
            title="Delete Country"
          />
        </div>
      ),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0, color: 'var(--clr-text)', letterSpacing: '-0.5px' }}>
                Countries & Regional Settings
              </h1>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '2px', marginBottom: 0 }}>
                Configure localized currencies, regional tax rates, and specific payment gateways per country.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={seeding ? <Loader className="spin" size={14} /> : <Sparkles size={14} />} 
            onClick={handleSeedPresets}
            disabled={seeding || loading}
          >
            {seeding ? 'Installing Pre-sets...' : 'Quick Seed 7 Pre-sets'}
          </Button>

          <Button 
            variant="primary" 
            icon={<Plus size={16} />} 
            onClick={() => router.push('/admin/countries/new')}
          >
            Add New Country
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Countries
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--clr-text)', marginTop: '4px' }}>
                {metrics.total}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                {metrics.active} active for checkout
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Markets
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {metrics.active}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                {metrics.total > 0 ? `${Math.round((metrics.active / metrics.total) * 100)}% enabled` : '0%'}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Currencies In Use
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
                {metrics.currencies}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                Multi-currency enabled
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Payment Methods
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {metrics.methodsCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                Configured across regions
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card with Search & Filters */}
      <Card>
        {/* Controls Toolbar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--clr-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'var(--clr-surface)'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', maxWidth: '400px', flex: 1 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search by country, Arabic name, code (DZ, US) or currency..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ 
                width: '100%', 
                background: 'var(--clr-surface-elevated)', 
                border: '1px solid var(--clr-border)', 
                borderRadius: '8px', 
                padding: '10px 14px 10px 38px', 
                color: 'var(--clr-text)', 
                fontSize: '14px', 
                outline: 'none',
                transition: 'border-color 0.2s'
              }} 
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', background: 'var(--clr-surface-elevated)', padding: '3px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              {(['ALL', 'ACTIVE', 'DISABLED'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: statusFilter === tab ? 'var(--clr-primary)' : 'transparent',
                    color: statusFilter === tab ? '#fff' : 'var(--clr-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Active' : 'Disabled'}
                </button>
              ))}
            </div>

            {/* Payment Method Filter Dropdown */}
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-surface-elevated)',
                color: 'var(--clr-text)',
                fontSize: '13px',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Payment Gateways</option>
              {STANDARD_PAYMENT_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}
              onClick={fetchCountries}
              title="Refresh countries list"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Table Content */}
        {loading && countries.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Loader className="spin" size={32} color="var(--clr-primary)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--clr-text)' }}>Loading Countries...</div>
            <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>Fetching configuration from database</div>
          </div>
        ) : filteredCountries.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--clr-text-muted)' }}>
              <Globe size={28} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--clr-text)' }}>
              {countries.length === 0 ? 'No Countries Configured Yet' : 'No Countries Match Filters'}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', maxWidth: '400px', margin: '8px auto 20px' }}>
              {countries.length === 0 
                ? 'Get started in seconds by seeding standard global and MENA countries with their currencies and payment methods.'
                : 'Try adjusting your search criteria or resetting the status and payment method filters.'}
            </p>
            {countries.length === 0 && (
              <Button variant="primary" icon={<Sparkles size={16} />} onClick={handleSeedPresets} disabled={seeding}>
                {seeding ? 'Seeding...' : 'Seed Global Preset Countries'}
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'country', label: 'Country & Region' },
              { key: 'currency', label: 'Currency / Lang' },
              { key: 'tax', label: 'Tax Rate' },
              { key: 'methods', label: 'Enabled Payment Gateways' },
              { key: 'active', label: 'Status' },
              { key: 'actions', label: '' },
            ]}
            data={tableData}
          />
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteModalCountry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--clr-text)' }}>
              Delete Country?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
              Are you sure you want to remove <strong>{deleteModalCountry.name} ({deleteModalCountry.code.toUpperCase()})</strong>? Users from this country will no longer have localized currency or payment options configured.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setDeleteModalCountry(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                style={{ background: '#ef4444', borderColor: '#ef4444' }} 
                onClick={confirmDelete}
                disabled={isDeleting}
                icon={isDeleting ? <Loader className="spin" size={16} /> : <Trash2 size={16} />}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
