"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Info, AlertTriangle, XCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationDropdown() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/system-alerts?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  // SSE Subscription
  useEffect(() => {
    fetchNotifications();

    const eventSource = new EventSource('/api/system-alerts/stream');
    
    eventSource.addEventListener('notification', (e) => {
      try {
        const newNotifs: Notification[] = JSON.parse(e.data);
        if (newNotifs.length > 0) {
          setNotifications(prev => {
            // Merge unique notifications
            const merged = [...newNotifs, ...prev];
            const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
            return unique.slice(0, 50); // Keep last 50
          });
          
          const unreadNew = newNotifs.filter(n => !n.isRead);
          setUnreadCount(prev => prev + unreadNew.length);
          
          // Show Toast for each new unread notification
          unreadNew.forEach(notif => {
            if (notif.type === 'SUCCESS') toast.success(notif.title, { description: notif.message });
            else if (notif.type === 'WARNING') toast.warning(notif.title, { description: notif.message });
            else if (notif.type === 'ERROR') toast.error(notif.title, { description: notif.message });
            else toast(notif.title, { description: notif.message });
          });
        }
      } catch (err) {
        console.error('Error parsing notification', err);
      }
    });

    return () => eventSource.close();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/system-alerts', { method: 'PATCH', body: JSON.stringify({}) });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/system-alerts', { method: 'PATCH', body: JSON.stringify({ id }) });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={16} color="var(--clr-success)" />;
      case 'WARNING': return <AlertTriangle size={16} color="var(--clr-warning)" />;
      case 'ERROR': return <XCircle size={16} color="var(--clr-danger)" />;
      default: return <Info size={16} color="var(--clr-primary)" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '50%',
          color: 'var(--clr-text)', position: 'relative'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '0', right: '0',
            background: 'var(--clr-danger)', color: '#fff',
            fontSize: '10px', fontWeight: 'bold',
            minWidth: '16px', height: '16px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid var(--clr-surface)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: '0', marginTop: '8px',
          width: '340px', background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)', borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 100,
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{isAr ? 'الإشعارات' : 'Notifications'}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={14} /> {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '14px' }}>
                {isAr ? 'لا توجد لديك إشعارات.' : 'You have no notifications.'}
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                  style={{ 
                    padding: '16px', borderBottom: '1px solid var(--clr-border)',
                    display: 'flex', gap: '12px', cursor: n.link ? 'pointer' : 'default',
                    background: n.isRead ? 'transparent' : 'var(--clr-surface-2)',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: n.isRead ? 500 : 600, color: 'var(--clr-text)' }}>{n.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    {n.link && (
                      <Link href={n.link} style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--clr-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        {isAr ? 'عرض التفاصيل ←' : 'View Details →'}
                      </Link>
                    )}
                  </div>
                  {!n.isRead && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--clr-primary)', alignSelf: 'center' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
