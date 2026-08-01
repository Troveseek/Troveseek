"use client";

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { User, Mail, Shield, Briefcase, Camera, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload profile picture');

      showToast('success', 'Profile picture updated successfully!');
      if (update) await update();
      router.refresh();
    } catch (err: any) {
      showToast('error', err.message || 'Could not upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      const res = await fetch('/api/user/profile/image', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove image');

      showToast('success', 'Profile picture removed');
      if (update) await update();
      router.refresh();
    } catch (err: any) {
      showToast('error', err.message || 'Could not remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--clr-text)' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>
          Manage your enterprise administrative profile and avatar credentials.
        </p>
      </div>

      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '24px',
          background: message.type === 'success' ? 'rgba(0, 229, 176, 0.1)' : 'rgba(255, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0, 229, 176, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#00e5b0' : '#ff4444',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo & Identity</CardTitle>
        </CardHeader>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Avatar Upload Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--clr-primary)',
                background: session?.user?.image
                  ? `url(${session.user.image}) center/cover no-repeat`
                  : 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '800',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(124, 111, 255, 0.25)'
              }}>
                {!session?.user?.image && userInitials}
              </div>

              {isUploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Loader2 size={24} className="animate-spin" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '220px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--clr-text)', margin: 0 }}>
                  {session?.user?.name || 'Administrator'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: '2px 0 0' }}>
                  {session?.user?.email || 'admin@troveseek.com'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  style={{ display: 'none' }}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: 'var(--clr-primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 10px rgba(124, 111, 255, 0.25)'
                  }}
                >
                  <Camera size={15} />
                  {isUploading ? 'Uploading...' : 'Upload New Photo'}
                </button>

                {session?.user?.image && (
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    disabled={isUploading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: 'rgba(255, 68, 68, 0.1)',
                      color: '#ff4444',
                      border: '1px solid rgba(255, 68, 68, 0.2)',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                Recommended: Square PNG or JPG, max 5MB.
              </span>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--clr-border)' }} />

          {/* Account Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
              <div style={{ padding: '10px', background: 'var(--clr-primary-dim)', borderRadius: '10px', height: 'fit-content', color: 'var(--clr-primary)' }}>
                <User size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Full Name</div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-text)', marginTop: '4px' }}>{session?.user?.name || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
              <div style={{ padding: '10px', background: 'var(--clr-primary-dim)', borderRadius: '10px', height: 'fit-content', color: 'var(--clr-primary)' }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-text)', marginTop: '4px', wordBreak: 'break-all' }}>{session?.user?.email || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
              <div style={{ padding: '10px', background: 'var(--clr-primary-dim)', borderRadius: '10px', height: 'fit-content', color: 'var(--clr-primary)' }}>
                <Shield size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Role Authorization</div>
                <div style={{ marginTop: '6px' }}>
                  <span style={{ padding: '4px 10px', background: 'rgba(0, 229, 176, 0.1)', color: 'var(--clr-accent)', border: '1px solid rgba(0, 229, 176, 0.25)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {(session?.user as any)?.role || 'EMPLOYEE'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
              <div style={{ padding: '10px', background: 'var(--clr-primary-dim)', borderRadius: '10px', height: 'fit-content', color: 'var(--clr-primary)' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Department</div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-text)', marginTop: '4px' }}>{(session?.user as any)?.department || 'Engineering & Operations'}</div>
              </div>
            </div>
          </div>

        </CardBody>
      </Card>
    </div>
  );
}
