"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Info, AlertTriangle, XCircle, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import styles from './NotificationDropdown.module.css';

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
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter((n: Notification) => !n.isRead).length);
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
            const merged = [...newNotifs, ...prev];
            const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
            return unique.slice(0, 50);
          });
          
          const unreadNew = newNotifs.filter(n => !n.isRead);
          setUnreadCount(prev => prev + unreadNew.length);
          
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
    if (interval > 1) return Math.floor(interval) + (isAr ? " سنة" : "y ago");
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + (isAr ? " شهر" : "mo ago");
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (isAr ? " يوم" : "d ago");
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (isAr ? " ساعة" : "h ago");
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + (isAr ? " دقيقة" : "m ago");
    return Math.floor(seconds) + (isAr ? " ثوانٍ" : "s ago");
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={styles.bellBtn}
        aria-label={isAr ? 'الإشعارات' : 'Notifications'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={() => setIsOpen(false)} />
          
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h3 className={styles.dropdownTitle}>{isAr ? 'الإشعارات' : 'Notifications'}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className={styles.markReadBtn}
                  >
                    <Check size={14} /> {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
                  </button>
                )}
                <button 
                  className={styles.mobileCloseBtn}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.notifList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <div>{isAr ? 'لا توجد لديك إشعارات.' : 'You have no notifications.'}</div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                    className={`${styles.notifItem} ${!n.isRead ? styles.unread : ''}`}
                  >
                    <div className={styles.notifIconBox}>{getIcon(n.type)}</div>
                    <div className={styles.notifBody}>
                      <div className={styles.notifTop}>
                        <h4 className={styles.notifItemTitle}>{n.title}</h4>
                        <span className={styles.notifTime}>{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className={styles.notifMessage}>
                        {n.message}
                      </p>
                      {n.link && (
                        <Link 
                          href={n.link} 
                          className={styles.notifLink}
                          onClick={() => setIsOpen(false)}
                        >
                          <span>{isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                          {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                        </Link>
                      )}
                    </div>
                    {!n.isRead && (
                      <div className={styles.unreadDot} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
