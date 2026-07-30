"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', display: 'flex' }}>
      <AdminSidebar isOpen={sidebarOpen} />
      <div style={{ flex: 1, marginLeft: '260px', transition: 'margin-left 0.3s ease' }}>
        <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ 
          padding: '88px 32px 32px',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </div>
    </div>
    </SessionProvider>
  );
}
