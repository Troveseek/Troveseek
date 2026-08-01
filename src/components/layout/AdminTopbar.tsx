"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import AdminCommandPalette from '../ui/AdminCommandPalette';
import styles from './AdminTopbar.module.css';

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Close dropdowns when clicking outside
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Read current theme on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const currentTheme = savedTheme === 'light' || (!savedTheme && prefersLight) ? 'light' : 'dark';
    
    setTheme(currentTheme);
    if (currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    localStorage.setItem('theme', newTheme);
  };
  
  // Format pathname for breadcrumbs (e.g. /admin/products -> Admin / Products)
  const paths = pathname.split('/').filter(Boolean);
  
  const userInitials = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.topbar}>
      <div className={styles.leftArea}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        
        <div className={styles.breadcrumbs}>
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const text = path.charAt(0).toUpperCase() + path.slice(1);
            
            return (
              <React.Fragment key={path}>
                {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                <span className={isLast ? styles.breadcrumbCurrent : styles.breadcrumbLink}>
                  {text}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.rightArea}>
        <div className={styles.searchBarContainer}>
          <AdminCommandPalette />
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{ opacity: mounted ? 1 : 0 }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <NotificationDropdown />
        </div>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <div className={styles.userProfile} onClick={() => { setShowProfile(!showProfile); }} style={{ cursor: 'pointer' }}>
            <div className={styles.avatar}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                userInitials
              )}
            </div>
          </div>

          {showProfile && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', 
              background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', 
              borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 50,
              padding: '8px'
            }}>
              <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid var(--clr-border)', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{session?.user?.name || 'Employee'}</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{session?.user?.email || 'Loading...'}</div>
              </div>
              
              <Link href="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontSize: '13px', color: 'var(--clr-text)', textDecoration: 'none', borderRadius: '6px' }} onClick={() => setShowProfile(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontSize: '13px', color: 'var(--clr-text)', textDecoration: 'none', borderRadius: '6px' }} onClick={() => setShowProfile(false)}>
                <Settings size={16} /> Global Settings
              </Link>
              
              <div style={{ height: '1px', background: 'var(--clr-border)', margin: '8px 0' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontSize: '13px', color: '#ff4444', cursor: 'pointer', borderRadius: '6px' }} onClick={() => { setShowProfile(false); signOut({ callbackUrl: '/admin/login' }); }}>
                <LogOut size={16} /> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
