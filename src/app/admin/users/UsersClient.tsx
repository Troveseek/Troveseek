"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Edit, Shield, Mail, Key, Loader, X, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UsersClient({ initialUsers = [] }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation state
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (user: any) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: editingUser.role,
          isActive: editingUser.isActive
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...json.data } : u));
        setEditingUser(null);
      }
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's password to the default (TempPassword123!)?")) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Password reset successfully!');
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      console.error('Failed to reset password', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser || deleteConfirmText !== 'DELETE') return;
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
        setDeletingUser(null);
        setDeleteConfirmText('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableData = useMemo(() => {
    const filtered = users.filter((user) => {
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? user.isActive : !user.isActive);
        const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) || 
                              user.email?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    
    if (filtered.length === 0) {
      return [{
        name: 'No users found.',
        email: '-', role: '-', lastLogin: '-', status: '-', actions: '-'
      }];
    }
    
    return filtered.map((user) => ({
      name: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 600, fontSize: '14px', flexShrink: 0
             }}>
                {user.image ? <img src={user.image} alt={user.name} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : (user.name?.[0]?.toUpperCase() || '?')}
             </div>
             {user.name || 'Unknown User'}
          </div>
      ),
      email: user.email,
      role: <Badge variant={user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'warning' : 'default'}>{user.role}</Badge>,
      lastLogin: user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : 'Never',
      status: <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Suspended'}</Badge>,
      actions: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" icon={<Edit size={14} />} onClick={() => handleEdit(user)} title="Edit Role/Status" />
          <a href={`mailto:${user.email}`}>
            <Button variant="ghost" size="sm" icon={<Mail size={14} />} title="Send Email" />
          </a>
          <Button variant="ghost" size="sm" icon={<Key size={14} color="#ffaa00" />} onClick={() => handlePasswordReset(user.id)} title="Reset Password" />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="#ef4444" />} onClick={() => { setDeletingUser(user); setDeleteConfirmText(''); }} title="Delete User" />
        </div>
      ),
    }));
  }, [users, statusFilter, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Users & Access</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage employee roles and client accounts</p>
        </div>
        <Link href="/admin/users/invite"><Button variant="primary" icon={<Shield size={16} />}>Invite User</Button></Link>
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
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--clr-surface-elevated)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 36px',
                  color: 'var(--clr-text)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Button variant="secondary" icon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
                Filters {statusFilter !== 'All' && `(${statusFilter})`}
              </Button>
              {showFilters && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px',
                  background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', padding: '16px', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['All', 'Active', 'Suspended'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="status" 
                          checked={statusFilter === s} 
                          onChange={() => { setStatusFilter(s); setShowFilters(false); }} 
                          style={{ accentColor: 'var(--clr-primary)' }}
                        />
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
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'lastLogin', label: 'Verified Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <Button variant="ghost" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setEditingUser(null)} icon={<X size={16} />} />
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Edit User</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--clr-text-muted)' }}>Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)' }}
                >
                  <option value="GUEST">GUEST</option>
                  <option value="CLIENT">CLIENT</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={editingUser.isActive} 
                  onChange={(e) => setEditingUser({...editingUser, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>Active Account</label>
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--clr-surface)', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <Button variant="ghost" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => { setDeletingUser(null); setDeleteConfirmText(''); }} icon={<X size={16} />} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#ef4444' }}>Delete User</h2>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--clr-text)' }}>
                You are about to permanently delete:
              </p>
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{deletingUser.name || 'Unknown User'}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--clr-text-muted)' }}>{deletingUser.email}</p>
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', lineHeight: 1.5 }}>
                <strong>⚠️ This action is irreversible.</strong> All data associated with this user — orders, sessions, and accounts — will be permanently deleted.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--clr-text-muted)' }}>
                Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--clr-border)',
                  background: 'var(--clr-surface-elevated)',
                  color: 'var(--clr-text)',
                  fontSize: '14px',
                  outline: 'none',
                  letterSpacing: '2px',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => { setDeletingUser(null); setDeleteConfirmText(''); }}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteUser}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                style={{ 
                  background: deleteConfirmText === 'DELETE' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)', 
                  borderColor: 'transparent',
                  cursor: deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer' 
                }}
                icon={isDeleting ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
