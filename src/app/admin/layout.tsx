"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopbar from '@/components/layout/AdminTopbar';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <div className={styles.adminLayout}>
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={styles.adminMainWrapper}>
          <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className={styles.adminContent}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
