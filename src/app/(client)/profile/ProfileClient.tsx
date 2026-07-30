"use client";

import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Package, Monitor, FileText, Heart, Settings, LogOut, CheckCircle2, UploadCloud, Bell, Shield, Loader, MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import styles from './page.module.css';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/providers/CurrencyProvider';

type UserProps = {
  id: string;
  name: string;
  email: string;
  image: string;
  orders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
      id: string;
      itemName: string;
      quantity: number;
      totalPrice: number;
      fileUrl: string | null;
    }[];
  }[];
  invoices?: {
    id: string;
    invoiceNum: string;
    pdfUrl: string | null;
    issuedAt: string;
    dueDate: string;
    status: string;
    order: {
      orderNumber: string;
      totalAmount: number;
    };
  }[];
};

export default function ProfileClient({ user }: { user: UserProps }) {
  const { formatPrice } = useCurrency();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for forms
  const [firstName, setFirstName] = useState(user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  
  // Notification Preferences
  const [notifyEmailOrders, setNotifyEmailOrders] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [notifySecurity, setNotifySecurity] = useState(true);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setNotifyEmailOrders(data.preferences.notifyEmailOrders);
          setNotifyMarketing(data.preferences.notifyMarketing);
          setNotifySecurity(data.preferences.notifySecurity);
        }
      })
      .catch(console.error);
  }, []);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) {
        toast.success(isAr ? 'تم تحديث التفضيلات' : 'Preferences updated');
      } else {
        toast.error('Failed to update preference');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update preference');
    }
  };
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(res => res.json())
      .then(data => setSubscriptions(data.data || []))
      .catch(console.error)
      .finally(() => setSubsLoading(false));
  }, []);

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/subscriptions/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        toast.info(data.message, { duration: 5000 });
      } else {
        toast.error(data.error || 'Failed to open billing portal');
      }
    } catch {
      toast.error('Error opening billing portal');
    }
  };
  const [isSaving, setIsSaving] = useState(false);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const navItems = [
    { id: 'profile', label: isAr ? 'الملف الشخصي' : 'Profile', icon: <User size={18} /> },
    { id: 'orders', label: isAr ? 'طلباتي' : 'My Orders', icon: <Package size={18} /> },
    { id: 'subscriptions', label: isAr ? 'اشتراكاتي' : 'My Subscriptions', icon: <Monitor size={18} /> },
    { id: 'invoices', label: isAr ? 'فواتيري' : 'My Invoices', icon: <FileText size={18} /> },
    { id: 'favorites', label: isAr ? 'المفضلة' : 'Favorites', icon: <Heart size={18} /> },
    { id: 'support', label: isAr ? 'محادثة الدعم' : 'Support Chat', icon: <MessageSquare size={18} /> },
    { id: 'settings', label: isAr ? 'الإعدادات' : 'Settings', icon: <Settings size={18} /> },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image');
      toast.success('Profile picture updated!');
      router.refresh();
    } catch (error) {
      toast.error('Could not upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      const res = await fetch('/api/user/profile/image', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove image');
      toast.success('Profile picture removed!');
      router.refresh();
    } catch (error) {
      toast.error('Could not remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName }),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error) {
      toast.error('Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update password');
      }
      
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(isAr ? 'هل أنت متأكد تماماً أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error('Could not delete account');
    }
  };

  const filteredOrders = user.orders.filter(order => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'COMPLETED') return order.status === 'COMPLETED' || order.status === 'PAID';
    return order.status === orderFilter;
  });

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.avatarSection}>
          {user.image ? (
            <div className={styles.avatar} style={{ background: `url(${user.image}) center/cover` }}></div>
          ) : (
            <div className={styles.avatar}>{getInitials(user.name)}</div>
          )}
          <div>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button onClick={handleSignOut} className={`${styles.navItem} ${styles.danger}`} style={{ marginTop: 'auto' }}>
            <LogOut size={18} />
            {isAr ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.content}>
        {activeTab === 'profile' && (
          <div>
            <h2 className={styles.sectionTitle}>{isAr ? 'معلومات الملف الشخصي' : 'Profile Information'}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              {user.image ? (
                <div className={styles.avatar} style={{ width: '100px', height: '100px', background: `url(${user.image}) center/cover` }}></div>
              ) : (
                <div className={styles.avatar} style={{ width: '100px', height: '100px', fontSize: '40px' }}>{getInitials(user.name)}</div>
              )}
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
                <Button 
                  variant="primary" 
                  icon={isUploading ? <Loader className="spin" size={16} /> : <UploadCloud size={16} />} 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isAr ? 'رفع جديد' : 'Upload New'}
                </Button>
                {user.image && (
                  <Button variant="secondary" onClick={handleImageRemove} disabled={isUploading}>{isAr ? 'إزالة' : 'Remove'}</Button>
                )}
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
              <Input label={isAr ? 'الاسم الأول' : 'First Name'} value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label={isAr ? 'الاسم الأخير' : 'Last Name'} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            
            <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
              <div>
                <Input label={isAr ? 'البريد الإلكتروني' : 'Email Address'} defaultValue={user.email} disabled />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--clr-accent)', marginTop: '8px' }}>
                  <CheckCircle2 size={12} /> {isAr ? 'موثق' : 'Verified'}
                </div>
              </div>
              <Input label={isAr ? 'رقم الهاتف' : 'Phone Number'} placeholder="+1 (555) 000-0000" />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '32px' }}>
              <Input label={isAr ? 'البلد' : 'Country'} defaultValue="United States" />
              <Input label={isAr ? 'تفضيل اللغة' : 'Language Preference'} defaultValue="English" />
            </div>

            <Button 
              variant="primary" 
              onClick={handleProfileSave} 
              disabled={isSaving}
              icon={isSaving ? <Loader className="spin" size={16} /> : undefined}
            >
              {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{isAr ? 'طلباتي' : 'My Orders'}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant={orderFilter === 'ALL' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('ALL')}>{isAr ? 'الكل' : 'All'}</Button>
                <Button variant={orderFilter === 'COMPLETED' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('COMPLETED')}>{isAr ? 'مكتمل' : 'Completed'}</Button>
                <Button variant={orderFilter === 'PENDING' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('PENDING')}>{isAr ? 'قيد الانتظار' : 'Pending'}</Button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--clr-surface)', borderRadius: '16px' }}>
                <Package size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{isAr ? 'لم يتم العثور على طلبات' : 'No orders found'}</h3>
                <p style={{ color: 'var(--clr-text-muted)' }}>{orderFilter === 'ALL' ? (isAr ? 'عندما تشتري منتجاً أو خدمة، ستظهر هنا.' : 'When you purchase a product or service, it will appear here.') : (isAr ? `ليس لديك أي طلبات ${orderFilter === 'COMPLETED' ? 'مكتملة' : 'قيد الانتظار'}.` : `You have no ${orderFilter.toLowerCase()} orders.`)}</p>
              </div>
            ) : (
              filteredOrders.map((order: any) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <div className={styles.orderId}>{isAr ? 'طلب #' : 'Order #'}{order.id.substring(0, 8).toUpperCase()}</div>
                      <div className={styles.orderDate}>{isAr ? 'تاريخ ' : 'Placed on '}{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Badge variant={order.status === 'COMPLETED' || order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  {expandedOrders.includes(order.id) && (
                    <div className={styles.orderItems}>
                      {order.items?.map((item: any) => (
                        <div key={item.id} className={styles.orderItem}>
                          <div className={styles.itemThumb} style={{ background: 'rgba(124, 111, 255, 0.1)' }}>
                            <Package size={24} color={'var(--clr-primary)'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className={styles.itemName}>{item.itemName}</div>
                            <div className={styles.itemMeta}>{isAr ? 'الكمية:' : 'Qty:'} {item.quantity}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontWeight: 600 }}>${item.totalPrice.toFixed(2)}</div>
                            {(order.status === 'COMPLETED' || order.status === 'PAID') && item.fileUrl && (
                              <Button variant="secondary" size="sm" onClick={() => window.open(`/api/user/orders/${order.id}/download/${item.id}`, '_blank')}>
                                {isAr ? 'تنزيل' : 'Download'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <div className={styles.orderItem}>
                          <div className={styles.itemThumb} style={{ background: 'rgba(124, 111, 255, 0.1)' }}>
                            <Package size={24} color={'var(--clr-primary)'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className={styles.itemName}>{isAr ? 'عناصر الطلب' : 'Order Item(s)'}</div>
                            <div className={styles.itemMeta}>{isAr ? 'لا توجد عناصر مفصلة في هذا الطلب.' : 'No items detailed in this order.'}</div>
                          </div>
                          <div style={{ fontWeight: 600 }}>${order.totalAmount.toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>{isAr ? 'الإجمالي: $' : 'Total: $'}{order.totalAmount.toFixed(2)}</div>
                    <div className={styles.orderActions}>
                      {(order.status === 'COMPLETED' || order.status === 'PAID') && order.items?.some((i: any) => i.fileUrl) && (
                        <Button variant="secondary" size="sm" onClick={() => {
                          order.items.forEach((item: any) => {
                            if (item.fileUrl) window.open(`/api/user/orders/${order.id}/download/${item.id}`, '_blank');
                          });
                        }}>
                          {isAr ? 'تنزيل الكل' : 'Download All'}
                        </Button>
                      )}
                      <Button variant="primary" size="sm" onClick={() => toggleOrderDetails(order.id)}>
                        {expandedOrders.includes(order.id) 
                          ? (isAr ? 'إخفاء التفاصيل' : 'Hide Details') 
                          : (isAr ? 'عرض التفاصيل' : 'View Details')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{isAr ? 'اشتراكاتي' : 'My Subscriptions'}</h2>
              {subscriptions.length > 0 && (
                <Button onClick={handleManageBilling} variant="secondary" size="sm" icon={<Settings size={14} />}>
                  {isAr ? 'إدارة الفواتير' : 'Manage Billing'}
                </Button>
              )}
            </div>
            
            {subsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--clr-surface)', borderRadius: '16px', marginTop: '24px' }}>
                <Monitor size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{isAr ? 'لا توجد اشتراكات نشطة' : 'No active subscriptions'}</h3>
                <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'عندما تشترك في منتج SaaS، سيظهر هنا.' : 'When you subscribe to a SaaS product, it will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {subscriptions.map(sub => (
                  <div key={sub.id} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'var(--clr-primary)' }}>
                        {sub.saas?.logo ? <img src={sub.saas.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : sub.saas?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{sub.saas?.name || 'SaaS Product'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{sub.planName} Plan • {sub.billingCycle}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{formatPrice(sub.price)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                          {isAr ? 'التجديد في:' : 'Renews:'} {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'CANCELED' ? 'danger' : 'warning'}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className={styles.sectionTitle}>{isAr ? 'إعدادات الحساب' : 'Account Settings'}</h2>
            
            <div style={{ marginBottom: '48px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="var(--clr-primary)" /> {isAr ? 'الأمان وكلمة المرور' : 'Security & Password'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                <Input type="password" label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <Input type="password" label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Input type="password" label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <Button 
                  variant="primary" 
                  style={{ alignSelf: 'flex-start' }} 
                  onClick={handlePasswordUpdate}
                  disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  icon={isSaving ? <Loader className="spin" size={16} /> : undefined}
                >
                  {isSaving ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? 'تحديث كلمة المرور' : 'Update Password')}
                </Button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '32px 0' }} />

            <div style={{ marginBottom: '48px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--clr-primary)" /> {isAr ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifyEmailOrders} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifyEmailOrders(e.target.checked); updatePreference('notifyEmailOrders', e.target.checked); }} />
                  <span style={{ fontSize: '14px' }}>{isAr ? 'إشعارات البريد الإلكتروني للطلبات والاشتراكات' : 'Email notifications for orders and subscriptions'}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifyMarketing} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifyMarketing(e.target.checked); updatePreference('notifyMarketing', e.target.checked); }} />
                  <span style={{ fontSize: '14px' }}>{isAr ? 'رسائل التسويق وتحديثات المنتجات' : 'Marketing emails and product updates'}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={notifySecurity} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifySecurity(e.target.checked); updatePreference('notifySecurity', e.target.checked); }} />
                  <span style={{ fontSize: '14px' }}>{isAr ? 'تنبيهات الأمان ونشاط تسجيل الدخول' : 'Security alerts and login activity'}</span>
                </label>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '32px 0' }} />
            
            <div className={styles.dangerZone}>
              <h4 style={{ color: '#ff4444', marginBottom: '8px', fontSize: '16px' }}>{isAr ? 'منطقة الخطر' : 'Danger Zone'}</h4>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {isAr ? 'بمجرد حذف حسابك، لا يمكنك التراجع. يرجى التأكد.' : 'Once you delete your account, there is no going back. Please be certain.'}
              </p>
              <Button variant="ghost" style={{ border: '1px solid #ff4444', color: '#ff4444' }} onClick={handleDeleteAccount}>
                {isAr ? 'حذف الحساب' : 'Delete Account'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <h2 className={styles.sectionTitle}>{isAr ? 'فواتيري' : 'My Invoices'}</h2>
            
            {(!user.invoices || user.invoices.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--clr-surface)', borderRadius: '16px', marginTop: '24px' }}>
                <FileText size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{isAr ? 'لا توجد فواتير بعد' : 'No Invoices Yet'}</h3>
                <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'لم تقم بأي عمليات شراء تتطلب فاتورة.' : "You haven't made any purchases requiring an invoice."}</p>
              </div>
            ) : (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user.invoices.map(inv => (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124, 111, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} color="var(--clr-primary)" />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--clr-text)' }}>{inv.invoiceNum}</h4>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--clr-text-muted)' }}>
                          <span>{isAr ? 'تاريخ الإصدار: ' : 'Issued: '}{new Date(inv.issuedAt).toLocaleDateString()}</span>
                          <span>{isAr ? 'تاريخ الاستحقاق: ' : 'Due: '}{new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                          {isAr ? 'الطلب: #' : 'Order: #'}{inv.order.orderNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600 }}>
                        {formatPrice(inv.order.totalAmount)}
                      </div>
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'DRAFT' ? 'default' : 'danger'}>
                        {inv.status}
                      </Badge>
                      <Button variant="secondary" size="sm" onClick={() => window.open(`/invoices/${inv.id}`, '_blank')} style={{ marginTop: '4px' }}>
                        {isAr ? 'عرض الفاتورة' : 'View Invoice'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--clr-surface)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               <Heart size={32} color="var(--clr-text-muted)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              {isAr ? 'لا توجد مفضلة بعد' : 'No Favorites Yet'}
            </h3>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>
              {isAr ? 'العناصر التي تفضلها ستظهر هنا.' : "Items you favorite will appear here."}
            </p>
          </div>
        )}

        {activeTab === 'support' && (
          <SupportChatPanel userId={user.id} isAr={isAr} />
        )}
      </main>
    </div>
  );
}

function SupportChatPanel({ userId, isAr }: { userId: string, isAr: boolean }) {
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/chat/session');
        const data = await res.json();
        if (res.ok && data.sessions?.length > 0) {
          setSessionId(data.sessions[0].id);
          setChatMessages(data.sessions[0].messages || []);
        } else if (res.ok) {
          const createRes = await fetch('/api/chat/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: 'Support Chat from Profile' })
          });
          const createData = await createRes.json();
          if (createRes.ok && createData.session) {
            setSessionId(createData.session.id);
          } else {
            console.error('Failed to create chat session:', createData.error);
          }
        } else {
          console.error('Failed to fetch chat sessions:', data.error);
        }
      } finally {
        setIsConnecting(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const es = new EventSource(`/api/chat/stream?sessionId=${sessionId}`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'connected') return;
      setChatMessages(prev => prev.find(m => m.id === data.id) ? prev : [...prev, data]);
    };
    return () => es.close();
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId) return;
    const content = chatInput;
    setChatInput('');
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content })
      });
    } catch {
      setChatInput(content); // restore on failure
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>{isAr ? 'محادثة الدعم' : 'Support Chat'}</h2>
      <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginBottom: '24px' }}>{isAr ? 'تحدث مباشرة مع فريق الدعم لدينا. نرد عادة خلال دقائق.' : 'Chat live with our support team. We typically respond within minutes.'}</p>

      <div style={{ border: '1px solid var(--clr-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px' }}>
        {/* Chat header */}
        <div style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} color="#fff" />
          <span style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{isAr ? 'دعم TroveSeek' : 'TroveSeek Support'}</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5b0', display: 'inline-block' }}></span>
            {isAr ? 'متصل' : 'Online'}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--clr-surface-2)' }}>
          {isConnecting ? (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '14px' }}>
              <Loader size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              {isAr ? 'جاري الاتصال...' : 'Connecting...'}
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '14px' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>{isAr ? 'ابدأ المحادثة!' : 'Start the conversation!'}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{isAr ? 'فريقنا هنا لمساعدتك.' : 'Our team is here to help you.'}</p>
            </div>
          ) : chatMessages.map(msg => {
            const isMine = msg.senderRole === 'CLIENT';
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: '14px',
                  background: isMine ? 'var(--clr-primary)' : 'var(--clr-surface)',
                  color: isMine ? '#fff' : 'var(--clr-text)',
                  border: isMine ? 'none' : '1px solid var(--clr-border)',
                  fontSize: '14px', lineHeight: 1.5,
                  borderBottomRightRadius: isMine ? '4px' : '14px',
                  borderBottomLeftRadius: isMine ? '14px' : '4px',
                }}>
                  {msg.content}
                  <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, textAlign: isMine ? 'right' : 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: '8px', background: 'var(--clr-surface)' }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
            style={{
              flex: 1, background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)',
              borderRadius: '24px', padding: '10px 16px', color: 'var(--clr-text)',
              outline: 'none', fontSize: '14px'
            }}
          />
          <button type="submit" disabled={!chatInput.trim()} style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: chatInput.trim() ? 'var(--clr-primary)' : 'var(--clr-surface-3)',
            color: '#fff', border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s'
          }}>
            <Send size={16} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
