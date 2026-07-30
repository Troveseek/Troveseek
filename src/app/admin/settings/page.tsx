"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { 
  Settings as SettingsIcon, Palette, CreditCard, Mail, 
  Shield, TrendingUp, Bell, HardDrive, AlertTriangle, 
  Terminal, Scale, Save, DownloadCloud, RotateCcw, Link as LinkIcon, Loader 
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const navItems = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'seo', label: 'SEO', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup', icon: HardDrive },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
    { id: 'api', label: 'API', icon: Terminal },
    { id: 'legal', label: 'Legal', icon: Scale },
  ];

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'backup') {
      fetch('/api/admin/backups')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBackups(data);
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/admin/backups', { method: 'POST' });
      if (!res.ok) throw new Error('Backup failed');
      toast.success('Backup created successfully!');
      
      const newBackups = await fetch('/api/admin/backups').then(r => r.json());
      if (Array.isArray(newBackups)) setBackups(newBackups);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const settingsArray = Object.keys(settings).map(key => ({ key, value: String(settings[key]) }));
    
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsArray),
    });

    if (res.ok) {
      toast.success('Settings updated successfully');
      router.refresh(); // Force Next.js to re-fetch the layout to apply custom CSS/colors immediately
    } else {
      toast.error('Failed to update settings');
    }
    setSaving(false);
  };

  // ─── TABS CONTENT ─────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>General Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Site Name" value={settings.site_name || ''} onChange={e => updateSetting('site_name', e.target.value)} placeholder="TroveSeek Ltd" />
              <Input label="Tagline" value={settings.site_tagline || ''} onChange={e => updateSetting('site_tagline', e.target.value)} placeholder="Enterprise Digital Commerce Platform" />
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Default Language</label>
                  <select value={settings.site_language || 'en'} onChange={e => updateSetting('site_language', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                    <option value="en">English (EN)</option>
                    <option value="ar">Arabic (AR)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Primary Currency</label>
                  <select value={settings.site_currency || 'USD'} onChange={e => updateSetting('site_currency', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="DZD">DZD (د.ج)</option>
                  </select>
                </div>
              </div>

              {/* Logos */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <div style={{ flex: 1, border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '16px', background: 'var(--clr-surface-elevated)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Light Mode Logo</span>
                  {settings.site_logo_light ? (
                    <div style={{ position: 'relative', background: '#f5f5f5', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'center', marginBottom: '12px', border: '1px solid var(--clr-border)' }}>
                      <img src={settings.site_logo_light} alt="Light Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                      <button onClick={() => updateSetting('site_logo_light', '')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>×</button>
                    </div>
                  ) : null}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'var(--clr-surface)', border: '1px dashed var(--clr-border)', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--clr-text-muted)' }}>
                    <DownloadCloud size={16} /> Upload Image
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => updateSetting('site_logo_light', ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} style={{ display: 'none' }} />
                  </label>
                  <input type="text" value={settings.site_logo_light || ''} onChange={e => updateSetting('site_logo_light', e.target.value)} placeholder="Or paste URL..." style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
                
                <div style={{ flex: 1, border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '16px', background: 'var(--clr-surface-elevated)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Dark Mode Logo</span>
                  {settings.site_logo_dark ? (
                    <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'center', marginBottom: '12px', border: '1px solid var(--clr-border)' }}>
                      <img src={settings.site_logo_dark} alt="Dark Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                      <button onClick={() => updateSetting('site_logo_dark', '')} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.5)', color: '#000', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>×</button>
                    </div>
                  ) : null}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'var(--clr-surface)', border: '1px dashed var(--clr-border)', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--clr-text-muted)' }}>
                    <DownloadCloud size={16} /> Upload Image
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => updateSetting('site_logo_dark', ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} style={{ display: 'none' }} />
                  </label>
                  <input type="text" value={settings.site_logo_dark || ''} onChange={e => updateSetting('site_logo_dark', e.target.value)} placeholder="Or paste URL..." style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
              </div>

            </div>
            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Changes</Button>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Appearance</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Default Dark Mode</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>Force dark mode for all new visitors.</p>
              </div>
              <input type="checkbox" checked={settings.app_dark_mode === 'true'} onChange={e => updateSetting('app_dark_mode', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Primary Color</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="color" 
                    value={settings.app_primary_color || '#7c6fff'} 
                    onChange={e => updateSetting('app_primary_color', e.target.value)} 
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden' }} 
                  />
                  <input type="text" value={settings.app_primary_color || '#7c6fff'} onChange={e => updateSetting('app_primary_color', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>Accent Color</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="color" 
                    value={settings.app_accent_color || '#00e5b0'} 
                    onChange={e => updateSetting('app_accent_color', e.target.value)} 
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden' }} 
                  />
                  <input type="text" value={settings.app_accent_color || '#00e5b0'} onChange={e => updateSetting('app_accent_color', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Custom CSS Overrides</label>
              <textarea rows={6} value={settings.app_custom_css || ''} onChange={e => updateSetting('app_custom_css', e.target.value)} placeholder="body { ... }" style={{ width: '100%', padding: '16px', background: 'var(--clr-bg)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontFamily: 'var(--font-mono)', fontSize: '13px', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
            
            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Appearance</Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Payment Configurations</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stripe Configuration */}
              <div style={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#635BFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>S</div>
                    Stripe Configuration
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Enable Gateway</span>
                    <input type="checkbox" checked={settings.pay_stripe_enabled === 'true'} onChange={e => updateSetting('pay_stripe_enabled', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Input type="password" label="Publishable Key" value={settings.pay_stripe_pk || ''} onChange={e => updateSetting('pay_stripe_pk', e.target.value)} />
                  <Input type="password" label="Secret Key" value={settings.pay_stripe_sk || ''} onChange={e => updateSetting('pay_stripe_sk', e.target.value)} />
                  <Input type="password" label="Webhook Secret" value={settings.pay_stripe_webhook || ''} onChange={e => updateSetting('pay_stripe_webhook', e.target.value)} />
                </div>
              </div>

              {/* Baridi Mob Configuration */}
              <div style={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#00cc99', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>B</div>
                    Baridi Mob (Algeria) 🇩🇿
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Enable Gateway</span>
                    <input type="checkbox" checked={settings.pay_baridi_enabled === 'true'} onChange={e => updateSetting('pay_baridi_enabled', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Account Full Name</label>
                    <Input value={settings.pay_baridi_name || ''} onChange={e => updateSetting('pay_baridi_name', e.target.value)} placeholder="TroveSeek LTD" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>RIP Number (Account details shown to client)</label>
                    <Input value={settings.pay_baridi_rip || ''} onChange={e => updateSetting('pay_baridi_rip', e.target.value)} placeholder="00799999000000001234" />
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,204,153,0.1)', border: '1px solid rgba(0,204,153,0.2)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#009973' }}><strong>Workflow:</strong> Clients will transfer money manually to this RIP and upload a receipt. You must manually verify and confirm the order.</p>
                  </div>
                </div>
              </div>

              {/* Crypto Configuration */}
              <div style={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#f3ba2f', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>₿</div>
                    Crypto & Binance Pay
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Enable Gateway</span>
                    <input type="checkbox" checked={settings.pay_crypto_enabled === 'true'} onChange={e => updateSetting('pay_crypto_enabled', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>USDT Wallet Address (TRC20)</label>
                    <Input value={settings.pay_crypto_usdt || ''} onChange={e => updateSetting('pay_crypto_usdt', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Binance Pay Merchant ID</label>
                    <Input value={settings.pay_crypto_binance || ''} onChange={e => updateSetting('pay_crypto_binance', e.target.value)} />
                  </div>
                </div>
              </div>
              
              <div>
                <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Payment Settings</Button>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Email Configuration</h3>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, padding: '16px', background: 'rgba(124,111,255,0.05)', border: '2px solid var(--clr-primary)', borderRadius: '12px', cursor: 'pointer' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--clr-primary)' }}>Resend API</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>Recommended for transactional emails.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input type="password" label="Resend API Key" value={settings.email_resend_api || ''} onChange={e => updateSetting('email_resend_api', e.target.value)} />
              <div style={{ display: 'flex', gap: '16px' }}>
                <Input label="Sender Name" value={settings.email_sender_name || ''} onChange={e => updateSetting('email_sender_name', e.target.value)} style={{ flex: 1 }} />
                <Input label="Sender Email" value={settings.email_sender_address || ''} onChange={e => updateSetting('email_sender_address', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Config</Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Security Settings</h3>
            
            <div style={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Two-Factor Authentication (2FA)</label>
                <select value={settings.sec_2fa || 'optional'} onChange={e => updateSetting('sec_2fa', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                  <option value="optional">Optional for all users</option>
                  <option value="admin">Required for Admins only</option>
                  <option value="all">Required for all users</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Session Timeout (Hours)</label>
                  <input type="number" value={settings.sec_session_timeout || '24'} onChange={e => updateSetting('sec_session_timeout', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Max Login Attempts</label>
                  <input type="number" value={settings.sec_max_logins || '5'} onChange={e => updateSetting('sec_max_logins', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Security Policies</Button>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>SEO & Meta</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Default Meta Title" value={settings.seo_title || ''} onChange={e => updateSetting('seo_title', e.target.value)} />
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Default Meta Description</label>
                <textarea rows={3} value={settings.seo_description || ''} onChange={e => updateSetting('seo_description', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}></textarea>
              </div>
              <Input label="Google Analytics ID" value={settings.seo_ga || ''} onChange={e => updateSetting('seo_ga', e.target.value)} placeholder="G-XXXXXXXXXX" />
              <Input label="Facebook Pixel ID" value={settings.seo_fb || ''} onChange={e => updateSetting('seo_fb', e.target.value)} placeholder="123456789012345" />
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save SEO Config</Button>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Legal Documents</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Terms of Service URL</label>
                <Input value={settings.legal_terms || ''} onChange={e => updateSetting('legal_terms', e.target.value)} placeholder="/terms" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Privacy Policy URL</label>
                <Input value={settings.legal_privacy || ''} onChange={e => updateSetting('legal_privacy', e.target.value)} placeholder="/privacy" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Refund Policy URL</label>
                <Input value={settings.legal_refund || ''} onChange={e => updateSetting('legal_refund', e.target.value)} placeholder="/refunds" />
              </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--clr-primary)' }}>reCAPTCHA Integration v3</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Site Key</label>
                  <Input value={settings.legal_captcha_site || ''} onChange={e => updateSetting('legal_captcha_site', e.target.value)} placeholder="6Lc..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Secret Key</label>
                  <Input type="password" value={settings.legal_captcha_secret || ''} onChange={e => updateSetting('legal_captcha_secret', e.target.value)} placeholder="6Lc..." />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Cookie Consent Banner</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>Require explicit consent for cookies from EU visitors (GDPR).</p>
              </div>
              <input type="checkbox" checked={settings.legal_cookie === 'true'} onChange={e => updateSetting('legal_cookie', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Legal Config</Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Notification Preferences</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Master Email Notifications</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>Enable or disable all outgoing system emails globally.</p>
              </div>
              <input type="checkbox" checked={settings.notify_email_enabled !== 'false'} onChange={e => updateSetting('notify_email_enabled', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="System Alerts Webhook URL (Discord/Slack)" value={settings.notify_webhook_url || ''} onChange={e => updateSetting('notify_webhook_url', e.target.value)} placeholder="https://hooks.slack.com/services/..." />
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Notifications</Button>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Database Backups</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Automated Backup Frequency</label>
                <select value={settings.backup_frequency || 'weekly'} onChange={e => updateSetting('backup_frequency', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                  <option value="disabled">Disabled</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Retention Policy (Days to keep)</label>
                <input type="number" value={settings.backup_retention_days || '30'} onChange={e => updateSetting('backup_retention_days', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Backup Config</Button>
              <Button type="button" variant="secondary" icon={isBackingUp ? <Loader className="spin" size={16} /> : <HardDrive size={16} />} onClick={handleTriggerBackup} disabled={isBackingUp}>
                {isBackingUp ? 'Creating Backup...' : 'Trigger Manual Backup'}
              </Button>
            </div>

            {/* List of Backups */}
            <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-elevated)' }}>
                <h4 style={{ margin: 0, fontSize: '15px' }}>Available Backups</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {backups.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '14px' }}>
                    No backups found.
                  </div>
                ) : (
                  backups.map((backup, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: i < backups.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HardDrive size={20} style={{ color: 'var(--clr-text-muted)' }} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{backup.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                            {new Date(backup.createdAt).toLocaleString()} • {(backup.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <a href={`/api/admin/backups/download?file=${backup.name}`} style={{ padding: '6px 12px', background: 'var(--clr-primary)', color: '#fff', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Maintenance Mode</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-danger-light, #fee2e2)', border: '1px solid var(--clr-danger, #ef4444)', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--clr-danger, #b91c1c)' }}>Enable Maintenance Mode</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-danger, #b91c1c)' }}>Lock down the client-facing site immediately. Admins can still log in here.</p>
              </div>
              <input type="checkbox" checked={settings.maintenance_mode === 'true'} onChange={e => updateSetting('maintenance_mode', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-danger, #ef4444)', width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Custom Maintenance Message</label>
                <textarea rows={4} value={settings.maintenance_message || 'We are currently undergoing scheduled maintenance. Please check back later.'} onChange={e => updateSetting('maintenance_message', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Bypass IPs (Comma separated)</label>
                <Input value={settings.maintenance_bypass_ips || ''} onChange={e => updateSetting('maintenance_bypass_ips', e.target.value)} placeholder="192.168.1.1, 10.0.0.5" />
              </div>
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save Maintenance Settings</Button>
            </div>
          </div>
        );

      case 'api':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', margin: 0 }}>API & Integration</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Public API Access</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>Allow external services to query public products and services.</p>
              </div>
              <input type="checkbox" checked={settings.api_public_enabled === 'true'} onChange={e => updateSetting('api_public_enabled', e.target.checked ? 'true' : 'false')} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Webhook Secret</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input type="text" value={settings.api_webhook_secret || ''} onChange={e => updateSetting('api_webhook_secret', e.target.value)} placeholder="whsec_..." />
                  <Button type="button" variant="secondary" onClick={() => {
                    const array = new Uint8Array(24);
                    window.crypto.getRandomValues(array);
                    const secret = 'whsec_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
                    updateSetting('api_webhook_secret', secret);
                  }}>Generate</Button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Rate Limit (Requests / min)</label>
                <input type="number" value={settings.api_rate_limit || '60'} onChange={e => updateSetting('api_rate_limit', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>

            <div>
              <Button variant="primary" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSave} disabled={saving}>Save API Settings</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 120px)' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Global Settings</h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Configure platform preferences and integrations</p>
      </div>

      <Card style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar for Settings */}
        <div style={{ width: '220px', borderRight: '1px solid var(--clr-border)', background: 'var(--clr-surface-elevated)', overflowY: 'auto', padding: '16px 0' }}>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  background: active ? 'rgba(124,111,255,0.08)' : 'transparent',
                  border: 'none',
                  borderRight: active ? '3px solid var(--clr-primary)' : '3px solid transparent',
                  color: active ? 'var(--clr-primary)' : 'var(--clr-text)',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Right Content Area */}
        <CardBody style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
          {renderContent()}
        </CardBody>
      </Card>
    </div>
  );
}
