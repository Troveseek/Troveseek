"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, MapPin, Loader, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/ui/LocationPickerMap'), { ssr: false });

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/locations?active=false');
      if (res.ok) {
        const json = await res.json();
        setLocations(json.data ?? []);
      }
    } catch {
      setError('Failed to load locations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await fetchLocations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const method = editForm.id ? 'PATCH' : 'POST';
      const url = editForm.id ? `/api/locations/${editForm.id}` : '/api/locations';
      
      const payload = { ...editForm };
      payload.latitude = parseFloat(payload.latitude);
      payload.longitude = parseFloat(payload.longitude);
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      setIsEditing(false);
      await fetchLocations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tableData = isLoading
    ? [{ name: <span style={{ color: 'var(--clr-text-muted)' }}><Loader size={14} className="spin" /> Loading...</span>, address: '-', coordinates: '-', status: '-', actions: '-' }]
    : locations.length === 0
    ? [{ name: 'No locations added yet.', address: '-', coordinates: '-', status: '-', actions: '-' }]
    : locations.map((loc) => ({
        name: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} color="var(--clr-primary)" />
            <span style={{ fontWeight: 600 }}>{loc.name}</span>
          </div>
        ),
        address: loc.address,
        coordinates: <code style={{ fontSize: '12px' }}>{loc.latitude}, {loc.longitude}</code>,
        status: loc.isActive ? <span style={{ color: '#00e5b0' }}>Active</span> : <span style={{ color: 'var(--clr-text-muted)' }}>Inactive</span>,
        actions: (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm" icon={<Edit size={14} />} onClick={() => { setEditForm(loc); setIsEditing(true); }} />
            <Button
              variant="ghost" size="sm"
              icon={deletingId === loc.id ? <Loader size={14} className="spin" /> : <Trash2 size={14} color="#ff4444" />}
              onClick={() => handleDelete(loc.id, loc.name)}
              disabled={deletingId === loc.id}
            />
          </div>
        ),
      }));

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: 0 }}>
          {editForm.id ? 'Edit Location' : 'New Location'}
        </h1>
        {error && <div style={{ color: '#ff4444' }}>{error}</div>}
        <Card>
          <CardBody>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Name (e.g. Headquarters)</label>
                <input required type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Address</label>
                <input required type="text" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Select Location on Map</label>
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>Click anywhere on the map to drop a pin and auto-fill the coordinates below.</p>
                <LocationPickerMap
                  latitude={editForm.latitude}
                  longitude={editForm.longitude}
                  onChange={(lat, lng) => setEditForm({...editForm, latitude: lat, longitude: lng})}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Latitude</label>
                  <input required type="number" step="any" value={editForm.latitude || ''} onChange={e => setEditForm({...editForm, latitude: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Longitude</label>
                  <input required type="number" step="any" value={editForm.longitude || ''} onChange={e => setEditForm({...editForm, longitude: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Phone (optional)</label>
                <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email (optional)</label>
                <input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Google Maps Link (optional)</label>
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '8px' }}>Paste the full Google Maps URL (e.g., https://maps.app.goo.gl/...) to make this location clickable.</p>
                <input type="url" value={editForm.mapUrl || ''} onChange={e => setEditForm({...editForm, mapUrl: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }} placeholder="https://maps.app.goo.gl/..." />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.isActive ?? true} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} />
                Active
              </label>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Location'}</Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Office Locations</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: '4px' }}>Manage the maps locations shown on the contact page.</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => { setEditForm({}); setIsEditing(true); }}>
          Add Location
        </Button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
        </CardHeader>
        <DataTable
          columns={[
            { key: 'name', label: 'Office Name' },
            { key: 'address', label: 'Address' },
            { key: 'coordinates', label: 'Coordinates' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
