"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Upload, Shield, ShieldAlert, BadgeDollarSign, 
  Megaphone, Headphones, PenTool, PieChart, Sliders, Save, Loader
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ROLES = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full access to everything', icon: ShieldAlert, color: 'var(--clr-danger)' },
  { id: 'ADMIN', label: 'Admin', desc: 'All except employee management', icon: Shield, color: 'var(--clr-primary)' },
  { id: 'SALES_MANAGER', label: 'Sales Manager', desc: 'Orders, Products, SaaS, Services', icon: BadgeDollarSign, color: 'var(--clr-success)' },
  { id: 'MARKETING', label: 'Marketing', desc: 'Blog, SEO, Analytics, Coupons', icon: Megaphone, color: '#f59e0b' },
  { id: 'SUPPORT', label: 'Support', desc: 'Messages, Orders, Customers', icon: Headphones, color: '#0ea5e9' },
  { id: 'CONTENT_EDITOR', label: 'Content Editor', desc: 'Blog, Announcements', icon: PenTool, color: '#ec4899' },
  { id: 'FINANCE', label: 'Finance', desc: 'Payments, Invoices, Reports', icon: PieChart, color: '#10b981' },
  { id: 'CUSTOM', label: 'Custom', desc: 'Granular permissions', icon: Sliders, color: 'var(--clr-text-muted)' },
];

const MODULES = [
  'Dashboard', 'Products', 'SaaS', 'Services', 'Blog', 'Tech Specs', 
  'Orders', 'Payments', 'Invoices', 'Messages', 'Users', 'Countries', 
  'Announcements', 'Marketing', 'Analytics', 'Settings', 'Employees'
];

export default function EmployeeFormPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Management');
  const [password, setPassword] = useState('');
  
  const [permissions, setPermissions] = useState<Record<string, { read: boolean, write: boolean, delete: boolean }>>(() => {
    const initial: any = {};
    MODULES.forEach(mod => {
      initial[mod] = { read: false, write: false, delete: false };
    });
    return initial;
  });

  const togglePermission = (module: string, action: 'read' | 'write' | 'delete') => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          employeeRole: selectedRole,
          department,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create employee');
      }

      router.push('/admin/employees');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-section">
      <div className="page-hdr">
        <div className="page-hdr-left">
          <Link href="/admin/employees" style={{ textDecoration: 'none', color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Employees
          </Link>
          <h3>Add New Employee</h3>
          <p>Create a new manager account and assign permissions</p>
        </div>
        <div className="page-hdr-right">
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} 
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'var(--clr-danger-light, #fee2e2)', color: 'var(--clr-danger, #ef4444)', borderRadius: '8px', marginBottom: '24px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 350px', alignItems: 'start' }}>
        
        {/* Left Column - Main Details & Permissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input label="Full Name *" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} />
                <Input label="Email Address *" type="email" placeholder="john@troveseek.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: '8px' }}>
                    Department
                  </label>
                  <select 
                    className="form-input" 
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)' }}
                  >
                    <option>Management</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>Support</option>
                    <option>Development</option>
                    <option>Finance</option>
                  </select>
                </div>
                <Input label="Job Title" placeholder="e.g. Senior Sales Rep" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Assignment</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {ROLES.map(role => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div 
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `1px solid ${isSelected ? role.color : 'var(--clr-border)'}`,
                        background: isSelected ? `${role.color}10` : 'var(--clr-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Icon size={20} color={role.color} />
                        <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{role.label}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {role.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Permissions Grid */}
              {selectedRole === 'custom' && (
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px dashed var(--clr-border)' }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Granular Permissions Matrix</h4>
                  
                  <div style={{ border: '1px solid var(--clr-border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'var(--clr-surface-elevated)', borderBottom: '1px solid var(--clr-border)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)' }}>Module</th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', textAlign: 'center' }}>Read</th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', textAlign: 'center' }}>Write</th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--clr-danger)', textAlign: 'center' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map((mod, idx) => (
                          <tr key={mod} style={{ borderBottom: idx === MODULES.length - 1 ? 'none' : '1px solid var(--clr-border)' }}>
                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{mod}</td>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={permissions[mod].read}
                                onChange={() => togglePermission(mod, 'read')}
                                style={{ accentColor: 'var(--clr-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={permissions[mod].write}
                                onChange={() => togglePermission(mod, 'write')}
                                style={{ accentColor: 'var(--clr-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={permissions[mod].delete}
                                onChange={() => togglePermission(mod, 'delete')}
                                style={{ accentColor: 'var(--clr-danger)', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Avatar & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{
                border: '2px dashed var(--clr-border)',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                background: 'var(--clr-surface-elevated)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', background: 'var(--clr-surface)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  color: 'var(--clr-text-muted)'
                }}>
                  <Upload size={24} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-primary)', marginBottom: '4px' }}>
                  Click to upload
                </p>
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input label="Temporary Password *" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--clr-primary)' }} />
                  Require password change on first login
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--clr-primary)' }} />
                  Send welcome email with instructions
                </label>
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
