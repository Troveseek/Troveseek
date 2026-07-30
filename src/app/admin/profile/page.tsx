"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { User, Mail, Shield, Briefcase } from 'lucide-react';

export default function AdminProfilePage() {
  const { data: session } = useSession();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>My Profile</h1>
      <p style={{ color: 'var(--clr-text-muted)', marginBottom: '32px' }}>
        View your account details and role information.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--clr-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{session?.user?.name || 'Employee'}</h2>
              <p style={{ color: 'var(--clr-text-muted)' }}>{session?.user?.email || 'Loading...'}</p>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--clr-border)' }}></div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--clr-surface-muted)', borderRadius: '8px', height: 'fit-content' }}>
                <User size={20} color="var(--clr-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</div>
                <div style={{ fontWeight: 500 }}>{session?.user?.name || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--clr-surface-muted)', borderRadius: '8px', height: 'fit-content' }}>
                <Mail size={20} color="var(--clr-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</div>
                <div style={{ fontWeight: 500 }}>{session?.user?.email || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--clr-surface-muted)', borderRadius: '8px', height: 'fit-content' }}>
                <Shield size={20} color="var(--clr-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Role</div>
                <div style={{ fontWeight: 500 }}>
                  <span style={{ padding: '4px 8px', background: 'var(--clr-primary-light, #e0e7ff)', color: 'var(--clr-primary, #4f46e5)', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                    {(session?.user as any)?.role || 'EMPLOYEE'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '10px', background: 'var(--clr-surface-muted)', borderRadius: '8px', height: 'fit-content' }}>
                <Briefcase size={20} color="var(--clr-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
                <div style={{ fontWeight: 500 }}>{(session?.user as any)?.department || 'General'}</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
