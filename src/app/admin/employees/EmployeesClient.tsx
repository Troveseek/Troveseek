"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Shield, Plus, Search, Filter, Edit, Lock, Trash2, Loader, ShieldAlert, BadgeDollarSign, Megaphone, Headphones, PenTool, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function EmployeesClient({ initialEmployees }: { initialEmployees: any[] }) {
  const [employees, setEmployees] = useState<any[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // store ID of user being updated

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? emp.isActive : !emp.isActive);
      return matchesStatus && matchesSearch;
    });
  }, [employees, statusFilter, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s account?`)) return;
    try {
      setIsUpdating(id);
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees(prev => prev.filter(e => e.id !== id));
      } else {
        alert('Failed to delete employee');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reset ${name}'s password to the default (TempPassword123!)?`)) return;
    try {
      setIsUpdating(id);
      const res = await fetch(`/api/users/${id}/reset-password`, { method: 'POST' });
      if (res.ok) {
        alert('Password reset successfully!');
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return <ShieldAlert size={14} color="var(--clr-danger)" />;
      case 'ADMIN': return <Shield size={14} color="var(--clr-primary)" />;
      case 'SALES_MANAGER': return <BadgeDollarSign size={14} color="var(--clr-success)" />;
      case 'MARKETING': return <Megaphone size={14} color="#f59e0b" />;
      case 'SUPPORT': return <Headphones size={14} color="#0ea5e9" />;
      case 'CONTENT_EDITOR': return <PenTool size={14} color="#ec4899" />;
      case 'FINANCE': return <PieChart size={14} color="#10b981" />;
      default: return <Shield size={14} color="var(--clr-text-muted)" />;
    }
  };

  return (
    <div className="page-section">
      <div className="page-hdr">
        <div className="page-hdr-left">
          <h3>Employee Management</h3>
          <p>Manage team members and configure role-based access</p>
        </div>
        <div className="page-hdr-right">
          <Link href="/admin/employees/new" style={{ textDecoration: 'none' }}>
            <Button variant="primary">
              <Plus size={16} /> Add Employee
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
        </CardHeader>
        <CardBody>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <Input
                placeholder="Search by name, email, or role..."
                iconLeft={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <Button 
                variant="secondary" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} /> Filter
                {statusFilter !== 'All' && (
                  <span style={{ 
                    marginLeft: '6px', width: '8px', height: '8px', 
                    borderRadius: '50%', background: 'var(--clr-primary)' 
                  }} />
                )}
              </Button>

              {/* Inline Filter Menu */}
              {showFilters && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', padding: '16px', zIndex: 50,
                  width: '240px', boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Status
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['All', 'Active', 'Inactive'].map(status => (
                      <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="statusFilter"
                          checked={statusFilter === status}
                          onChange={() => { setStatusFilter(status); setShowFilters(false); }}
                          style={{ accentColor: 'var(--clr-primary)' }}
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 600, fontSize: '16px'
                        }}>
                          {emp.image ? <img src={emp.image} alt={emp.name} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : (emp.name?.[0]?.toUpperCase() || '?')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--clr-text)', fontSize: '14px' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getRoleIcon(emp.role)}
                        <span style={{ fontWeight: 500, fontSize: '13px' }}>{emp.role.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.department || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={emp.isActive ? 'success' : 'default'}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link href={`/admin/employees/${emp.id}/edit`}>
                          <Button variant="ghost" size="sm" icon={<Edit size={14} />} title="Edit Employee" disabled={isUpdating === emp.id} />
                        </Link>
                        <Button variant="ghost" size="sm" icon={<Lock size={14} />} title="Reset Password" onClick={() => handleResetPassword(emp.id, emp.name)} disabled={isUpdating === emp.id} />
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="var(--clr-danger)" />} title="Delete" onClick={() => handleDelete(emp.id, emp.name)} disabled={isUpdating === emp.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--clr-text-muted)' }}>
                    No employees found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
