"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Upload, Shield, ShieldAlert, BadgeDollarSign, 
  Megaphone, Headphones, PenTool, PieChart, Sliders, Save, Loader, Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
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
];

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Management');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/employees/${id}`);
        if (!res.ok) throw new Error('Failed to fetch employee');
        const json = await res.json();
        const emp = json.data;
        
        setName(emp.name || '');
        setEmail(emp.email || '');
        setDepartment(emp.department || 'Management');
        setSelectedRole(emp.role || 'ADMIN');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Please fill in Name and Email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const payload: any = {
        name,
        email,
        employeeRole: selectedRole,
        department,
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update employee');
      }

      router.push('/admin/employees');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee account?')) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      router.push('/admin/employees');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '8px', color: 'var(--clr-text-muted)' }}><Loader className="spin" size={24} /> Loading employee...</div>;
  }

  return (
    <div className="page-section">
      <div className="page-hdr">
        <div className="page-hdr-left">
          <Link href="/admin/employees" style={{ textDecoration: 'none', color: 'var(--clr-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Employees
          </Link>
          <h3>Edit Employee</h3>
          <p>Update manager account and permissions</p>
        </div>
        <div className="page-hdr-right" style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost" onClick={handleDelete} disabled={isSubmitting} style={{ color: 'var(--clr-danger)' }}>
             {isSubmitting ? <Loader className="spin" size={16} /> : <Trash2 size={16} />} Delete
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} 
            {isSubmitting ? 'Saving...' : 'Update Employee'}
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
              <CardTitle>Reset Password</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input label="New Password" type="password" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--clr-primary)' }} />
                  Require password change on next login
                </label>
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
