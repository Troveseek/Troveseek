"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Loader, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamAdminPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeam = () => {
    fetch('/api/team?all=true')
      .then(res => res.json())
      .then(data => { setTeam(data.data || []); setLoading(false); });
  };

  useEffect(() => { loadTeam(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Member deleted');
      loadTeam();
    } else {
      toast.error('Failed to delete');
    }
  };

  const moveOrder = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= team.length) return;
    const newTeam = [...team];
    const temp = newTeam[index];
    newTeam[index] = newTeam[index + direction];
    newTeam[index + direction] = temp;
    
    // Update local immediately for UX
    setTeam(newTeam);
    
    // In a real app we'd bulk update orders here, for now just update the two swapped items
    await fetch(`/api/team/${newTeam[index].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTeam[index], displayOrder: index }) });
    await fetch(`/api/team/${newTeam[index + direction].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTeam[index + direction], displayOrder: index + direction }) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Team CMS</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage the team members shown on the home page.</p>
        </div>
        <Link href="/admin/team/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>Add Team Member</Button>
        </Link>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>
        ) : team.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No team members found. Add one to get started.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)' }}>
                <th style={{ padding: '16px' }}>Order</th>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, i) => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button variant="ghost" size="iconOnly" onClick={() => moveOrder(i, -1)} disabled={i === 0}><MoveUp size={14}/></Button>
                      <Button variant="ghost" size="iconOnly" onClick={() => moveOrder(i, 1)} disabled={i === team.length - 1}><MoveDown size={14}/></Button>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500, color: 'var(--clr-text)' }}>{member.name}</td>
                  <td style={{ padding: '16px', color: 'var(--clr-text-muted)' }}>{member.role}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: member.isActive ? 'rgba(0,229,176,0.1)' : 'rgba(255,68,68,0.1)', color: member.isActive ? '#00e5b0' : '#ff4444' }}>
                      {member.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link href={`/admin/team/${member.id}/edit`}>
                        <Button variant="ghost" size="sm" icon={<Edit2 size={14} />}>Edit</Button>
                      </Link>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--clr-danger)' }} icon={<Trash2 size={14} />} onClick={() => handleDelete(member.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
