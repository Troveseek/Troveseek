"use client";

import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, Package, Monitor, FileText, Heart, Settings, LogOut, 
  CheckCircle2, UploadCloud, Bell, Shield, Loader, MessageSquare, 
  Send, ChevronDown, ChevronUp, Download, AlertTriangle 
} from 'lucide-react';
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
  const searchParams = useSearchParams();
  
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'subscriptions', 'invoices', 'favorites', 'support', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // States for profile forms
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
  const [isSaving, setIsSaving] = useState(false);

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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const navItems = [
    { id: 'profile', label: isAr ? 'الملف الشخصي' : 'Profile', icon: <User size={18} /> },
    { id: 'orders', label: isAr ? 'طلباتي' : 'My Orders', icon: <Package size={18} />, badge: user.orders.length },
    { id: 'subscriptions', label: isAr ? 'اشتراكاتي' : 'Subscriptions', icon: <Monitor size={18} /> },
    { id: 'invoices', label: isAr ? 'فواتيري' : 'Invoices', icon: <FileText size={18} />, badge: user.invoices?.length },
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
      toast.success(isAr ? 'تم تحديث الصورة الشخصية!' : 'Profile picture updated!');
      router.refresh();
    } catch (error) {
      toast.error(isAr ? 'تعذر رفع الصورة' : 'Could not upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      const res = await fetch('/api/user/profile/image', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove image');
      toast.success(isAr ? 'تمت إزالة الصورة الشخصية!' : 'Profile picture removed!');
      router.refresh();
    } catch (error) {
      toast.error(isAr ? 'تعذر إزالة الصورة' : 'Could not remove image');
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
      toast.success(isAr ? 'تم حفظ التغييرات بنجاح!' : 'Profile updated successfully!');
      router.refresh();
    } catch (error) {
      toast.error(isAr ? 'تعذر تحديث الملف الشخصي' : 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error(isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'New password must be at least 8 characters');
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
      
      toast.success(isAr ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
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
      toast.success(isAr ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error(isAr ? 'تعذر حذف الحساب' : 'Could not delete account');
    }
  };

  const filteredOrders = user.orders.filter(order => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'COMPLETED') return order.status === 'COMPLETED' || order.status === 'PAID';
    return order.status === orderFilter;
  });

  return (
    <div className={styles.container}>
      {/* Mobile Top Header Banner */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileUserRow}>
          {user.image ? (
            <div className={styles.mobileAvatar} style={{ background: `url(${user.image}) center/cover` }}></div>
          ) : (
            <div className={styles.mobileAvatar}>{getInitials(user.name)}</div>
          )}
          <div className={styles.mobileUserInfo}>
            <div className={styles.mobileUserName}>{user.name}</div>
            <div className={styles.mobileUserEmail}>{user.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className={styles.drawerLogoutBtn}
            style={{ padding: '8px 12px', background: 'rgba(255, 68, 68, 0.12)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '8px', color: '#ff5555', cursor: 'pointer' }}
            title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className={styles.mobileUserStats}>
          <div className={styles.statChip}>
            <div className={styles.statValue}>{user.orders.length}</div>
            <div className={styles.statLabel}>{isAr ? 'الطلبات' : 'Orders'}</div>
          </div>
          <div className={styles.statChip}>
            <div className={styles.statValue}>{subscriptions.length}</div>
            <div className={styles.statLabel}>{isAr ? 'الاشتراكات' : 'Subscriptions'}</div>
          </div>
          <div className={styles.statChip}>
            <div className={styles.statValue}>{user.invoices?.length || 0}</div>
            <div className={styles.statLabel}>{isAr ? 'الفواتير' : 'Invoices'}</div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrolling Tabs */}
      <div className={styles.mobileTabs}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`${styles.mobileTabItem} ${activeTab === item.id ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span style={{ 
                background: activeTab === item.id ? '#fff' : 'var(--clr-primary)', 
                color: activeTab === item.id ? 'var(--clr-primary)' : '#fff',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                marginLeft: '4px'
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.avatarSection}>
          {user.image ? (
            <div className={styles.avatar} style={{ background: `url(${user.image}) center/cover` }}></div>
          ) : (
            <div className={styles.avatar}>{getInitials(user.name)}</div>
          )}
          <div style={{ width: '100%' }}>
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
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{ 
                  background: activeTab === item.id ? 'rgba(255,255,255,0.25)' : 'var(--clr-surface-3)', 
                  color: activeTab === item.id ? '#fff' : 'var(--clr-text-muted)',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <button onClick={handleSignOut} className={`${styles.navItem} ${styles.danger}`}>
            <LogOut size={18} />
            <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.content}>
        <div className={styles.panelCard}>
          {activeTab === 'profile' && (
            <div>
              <h2 className={styles.sectionTitle}>{isAr ? 'معلومات الملف الشخصي' : 'Profile Information'}</h2>
              
              <div className={styles.avatarUploadSection}>
                {user.image ? (
                  <div className={styles.avatar} style={{ width: '80px', height: '80px', background: `url(${user.image}) center/cover` }}></div>
                ) : (
                  <div className={styles.avatar} style={{ width: '80px', height: '80px', fontSize: '32px' }}>{getInitials(user.name)}</div>
                )}
                
                <div className={styles.uploadButtons}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                  />
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={isUploading ? <Loader className="spin" size={16} /> : <UploadCloud size={16} />} 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isAr ? 'رفع صورة جديدة' : 'Upload Picture'}
                  </Button>
                  {user.image && (
                    <Button variant="secondary" size="sm" onClick={handleImageRemove} disabled={isUploading}>
                      {isAr ? 'إزالة' : 'Remove'}
                    </Button>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <Input label={isAr ? 'الاسم الأول' : 'First Name'} value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input label={isAr ? 'الاسم الأخير' : 'Last Name'} value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              
              <div className={styles.formGroup}>
                <div>
                  <Input label={isAr ? 'البريد الإلكتروني' : 'Email Address'} defaultValue={user.email} disabled />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--clr-accent)', marginTop: '6px' }}>
                    <CheckCircle2 size={13} /> {isAr ? 'موثق' : 'Verified'}
                  </div>
                </div>
                <Input label={isAr ? 'رقم الهاتف' : 'Phone Number'} placeholder="+1 (555) 000-0000" />
              </div>

              <div style={{ marginTop: '28px' }}>
                <Button 
                  variant="primary" 
                  onClick={handleProfileSave} 
                  disabled={isSaving}
                  icon={isSaving ? <Loader className="spin" size={16} /> : undefined}
                >
                  {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className={styles.orderFilterBar}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{isAr ? 'طلباتي' : 'My Orders'}</h2>
                <div className={styles.orderFilterPills}>
                  <Button variant={orderFilter === 'ALL' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('ALL')}>{isAr ? 'الكل' : 'All'}</Button>
                  <Button variant={orderFilter === 'COMPLETED' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('COMPLETED')}>{isAr ? 'مكتمل' : 'Completed'}</Button>
                  <Button variant={orderFilter === 'PENDING' ? 'primary' : 'ghost'} size="sm" onClick={() => setOrderFilter('PENDING')}>{isAr ? 'قيد الانتظار' : 'Pending'}</Button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '54px 16px', background: 'var(--clr-surface)', borderRadius: '16px', marginTop: '16px' }}>
                  <Package size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'لم يتم العثور على طلبات' : 'No orders found'}</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                    {orderFilter === 'ALL' 
                      ? (isAr ? 'عندما تشتري منتجاً أو خدمة، ستظهر هنا.' : 'When you purchase a product or service, it will appear here.') 
                      : (isAr ? `ليس لديك أي طلبات ${orderFilter === 'COMPLETED' ? 'مكتملة' : 'قيد الانتظار'}.` : `You have no ${orderFilter.toLowerCase()} orders.`)}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order: any) => {
                  const isExpanded = expandedOrders.includes(order.id);
                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <div className={styles.orderId}>{isAr ? 'طلب #' : 'Order #'}{order.orderNumber || order.id.substring(0, 8).toUpperCase()}</div>
                          <div className={styles.orderDate}>{isAr ? 'تاريخ ' : 'Placed on '}{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <Badge variant={order.status === 'COMPLETED' || order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      {isExpanded && (
                        <div className={styles.orderItems}>
                          {order.items?.map((item: any) => (
                            <div key={item.id} className={styles.orderItem}>
                              <div className={styles.itemThumb}>
                                <Package size={22} color={'var(--clr-primary)'} />
                              </div>
                              <div style={{ flex: 1, minWidth: '140px' }}>
                                <div className={styles.itemName}>{item.itemName}</div>
                                <div className={styles.itemMeta}>{isAr ? 'الكمية:' : 'Qty:'} {item.quantity}</div>
                              </div>
                              <div className={styles.itemRight}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatPrice(item.totalPrice)}</div>
                                {(order.status === 'COMPLETED' || order.status === 'PAID') && item.fileUrl && (
                                  <Button variant="secondary" size="sm" onClick={() => window.open(`/api/user/orders/${order.id}/download/${item.id}`, '_blank')}>
                                    <Download size={13} style={{ marginRight: '4px' }} />
                                    {isAr ? 'تنزيل' : 'Download'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          {(!order.items || order.items.length === 0) && (
                            <div className={styles.orderItem}>
                              <div className={styles.itemThumb}>
                                <Package size={22} color={'var(--clr-primary)'} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className={styles.itemName}>{isAr ? 'عناصر الطلب' : 'Order Item(s)'}</div>
                                <div className={styles.itemMeta}>{isAr ? 'لا توجد تفاصيل إضافية لهذا الطلب.' : 'No item breakdown for this order.'}</div>
                              </div>
                              <div style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={styles.orderFooter}>
                        <div className={styles.orderTotal}>
                          {isAr ? 'الإجمالي: ' : 'Total: '}
                          <span style={{ color: 'var(--clr-primary)' }}>{formatPrice(order.totalAmount)}</span>
                        </div>
                        <div className={styles.orderActions}>
                          {(order.status === 'COMPLETED' || order.status === 'PAID') && order.items?.some((i: any) => i.fileUrl) && (
                            <Button variant="secondary" size="sm" onClick={() => {
                              order.items.forEach((item: any) => {
                                if (item.fileUrl) window.open(`/api/user/orders/${order.id}/download/${item.id}`, '_blank');
                              });
                            }}>
                              <Download size={13} />
                              {isAr ? 'تنزيل الكل' : 'Download All'}
                            </Button>
                          )}
                          <Button variant="primary" size="sm" onClick={() => toggleOrderDetails(order.id)}>
                            {isExpanded ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ChevronUp size={14} />
                                {isAr ? 'إخفاء التفاصيل' : 'Hide Details'}
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ChevronDown size={14} />
                                {isAr ? 'عرض التفاصيل' : 'View Details'}
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>{isAr ? 'اشتراكاتي' : 'My Subscriptions'}</h2>
                {subscriptions.length > 0 && (
                  <Button onClick={handleManageBilling} variant="secondary" size="sm" icon={<Settings size={14} />}>
                    {isAr ? 'إدارة الفواتير والاشتراك' : 'Manage Billing'}
                  </Button>
                )}
              </div>
              
              {subsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                  <Loader size={28} className="spin" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '54px 16px', background: 'var(--clr-surface)', borderRadius: '16px' }}>
                  <Monitor size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'لا توجد اشتراكات نشطة' : 'No active subscriptions'}</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                    {isAr ? 'عندما تشترك في خطة SaaS، ستظهر تفاصيل اشتراكك هنا.' : 'When you subscribe to a SaaS plan, your active subscription will appear here.'}
                  </p>
                </div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} className={styles.subscriptionCard}>
                    <div className={styles.subLogo}>
                      {sub.saas?.logo ? (
                        <img src={sub.saas.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        sub.saas?.name?.charAt(0).toUpperCase() || 'S'
                      )}
                    </div>
                    <div className={styles.subInfo}>
                      <div className={styles.subName}>{sub.saas?.name || 'SaaS Plan'}</div>
                      <div className={styles.subPlan}>{sub.planName} Plan • {sub.billingCycle}</div>
                    </div>
                    <div className={styles.subPricingArea}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--clr-text)' }}>{formatPrice(sub.price)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                          {isAr ? 'التجديد في: ' : 'Renews: '}{new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'CANCELED' ? 'danger' : 'warning'}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h2 className={styles.sectionTitle}>{isAr ? 'فواتيري' : 'My Invoices'}</h2>
              
              {(!user.invoices || user.invoices.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '54px 16px', background: 'var(--clr-surface)', borderRadius: '16px' }}>
                  <FileText size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'لا توجد فواتير بعد' : 'No Invoices Yet'}</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                    {isAr ? 'لم تقم بأي عمليات شراء تتطلب إصدار فاتورة.' : "You haven't made any purchases requiring an invoice."}
                  </p>
                </div>
              ) : (
                user.invoices.map(inv => (
                  <div key={inv.id} className={styles.invoiceCard}>
                    <div className={styles.invoiceLeft}>
                      <div className={styles.invoiceIconBox}>
                        <FileText size={22} color="var(--clr-primary)" />
                      </div>
                      <div>
                        <div className={styles.invoiceNum}>{inv.invoiceNum}</div>
                        <div className={styles.invoiceDates}>
                          <span>{isAr ? 'الإصدار: ' : 'Issued: '}{new Date(inv.issuedAt).toLocaleDateString()}</span>
                          <span>{isAr ? 'الطلب: #' : 'Order: #'}{inv.order.orderNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.invoiceRight}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>
                        {formatPrice(inv.order.totalAmount)}
                      </div>
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'DRAFT' ? 'default' : 'danger'}>
                        {inv.status}
                      </Badge>
                      <Button variant="secondary" size="sm" onClick={() => window.open(`/invoices/${inv.id}`, '_blank')}>
                        {isAr ? 'عرض الفاتورة' : 'View Invoice'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div style={{ textAlign: 'center', padding: '54px 16px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--clr-surface)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                 <Heart size={32} color="var(--clr-text-muted)" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {isAr ? 'لا توجد منتجات في المفضلة' : 'No Favorites Yet'}
              </h3>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {isAr ? 'العناصر التي تحفظها في المفضلة ستظهر هنا للوصول السريع.' : 'Items you favorite in the store will appear here for quick access.'}
              </p>
              <Button variant="primary" onClick={() => router.push('/shop')}>
                {isAr ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </div>
          )}

          {activeTab === 'support' && (
            <SupportChatPanel userId={user.id} isAr={isAr} />
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className={styles.sectionTitle}>{isAr ? 'إعدادات الحساب' : 'Account Settings'}</h2>
              
              <div style={{ marginBottom: '36px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="var(--clr-primary)" /> {isAr ? 'الأمان وكلمة المرور' : 'Security & Password'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
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

              <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '28px 0' }} />

              <div style={{ marginBottom: '36px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} color="var(--clr-primary)" /> {isAr ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notifyEmailOrders} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifyEmailOrders(e.target.checked); updatePreference('notifyEmailOrders', e.target.checked); }} />
                    <span style={{ fontSize: '14px', color: 'var(--clr-text)' }}>{isAr ? 'إشعارات البريد الإلكتروني للطلبات والاشتراكات' : 'Email notifications for orders and subscriptions'}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notifyMarketing} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifyMarketing(e.target.checked); updatePreference('notifyMarketing', e.target.checked); }} />
                    <span style={{ fontSize: '14px', color: 'var(--clr-text)' }}>{isAr ? 'رسائل التسويق وتحديثات المنتجات الجديدة' : 'Marketing emails and new product updates'}</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notifySecurity} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} onChange={(e) => { setNotifySecurity(e.target.checked); updatePreference('notifySecurity', e.target.checked); }} />
                    <span style={{ fontSize: '14px', color: 'var(--clr-text)' }}>{isAr ? 'تنبيهات الأمان ونشاط الحساب' : 'Security alerts and account activity'}</span>
                  </label>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={18} color="#ff4444" />
                  <h4 style={{ color: '#ff4444', margin: 0, fontSize: '15px', fontWeight: 700 }}>{isAr ? 'منطقة الخطر' : 'Danger Zone'}</h4>
                </div>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                  {isAr ? 'بمجرد حذف حسابك، سيتم مسح جميع بياناتك وطلباتك نهائياً. لا يمكن التراجع عن هذا الإجراء.' : 'Once you delete your account, all your data, licenses and history will be permanently erased. This cannot be undone.'}
                </p>
                <Button variant="ghost" style={{ border: '1px solid #ff4444', color: '#ff4444' }} onClick={handleDeleteAccount}>
                  {isAr ? 'حذف الحساب نهائياً' : 'Delete Account'}
                </Button>
              </div>
            </div>
          )}
        </div>
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
          }
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
      setChatInput(content);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>{isAr ? 'محادثة الدعم المباشر' : 'Live Support Chat'}</h2>
      <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
        {isAr ? 'تحدث مباشرة مع فريق الدعم لدينا. نرد عادة خلال دقائق.' : 'Chat live with our support team. We typically respond within minutes.'}
      </p>

      <div style={{ border: '1px solid var(--clr-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'clamp(420px, 60vh, 560px)' }}>
        {/* Chat header */}
        <div style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={18} color="#fff" />
          <span style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '14px' }}>
            {isAr ? 'فريق دعم TroveSeek' : 'TroveSeek Support Team'}
          </span>
          <span style={{ marginLeft: isAr ? 'unset' : 'auto', marginRight: isAr ? 'auto' : 'unset', fontSize: '12px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5b0', display: 'inline-block' }}></span>
            {isAr ? 'متصل الآن' : 'Online'}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--clr-surface)' }}>
          {isConnecting ? (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '14px' }}>
              <Loader size={22} className="spin" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              {isAr ? 'جاري الاتصال...' : 'Connecting to chat...'}
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', margin: 'auto', fontSize: '14px' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>{isAr ? 'ابدأ محادثتك!' : 'Start the conversation!'}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                {isAr ? 'أرسل استفسارك وسيقوم فريقنا بالرد عليك مباشرة.' : 'Send a message and our team will get back to you.'}
              </p>
            </div>
          ) : chatMessages.map(msg => {
            const isMine = msg.senderRole === 'CLIENT';
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', borderRadius: '14px',
                  background: isMine ? 'var(--clr-primary)' : 'var(--clr-surface-2)',
                  color: isMine ? '#fff' : 'var(--clr-text)',
                  border: isMine ? 'none' : '1px solid var(--clr-border)',
                  fontSize: '14px', lineHeight: 1.5,
                  borderBottomRightRadius: isMine ? '3px' : '14px',
                  borderBottomLeftRadius: isMine ? '14px' : '3px',
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
        <form onSubmit={sendMessage} style={{ padding: '12px 14px', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: '8px', background: 'var(--clr-surface-2)' }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type a message...'}
            style={{
              flex: 1, background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
              borderRadius: '24px', padding: '9px 16px', color: 'var(--clr-text)',
              outline: 'none', fontSize: '14px'
            }}
          />
          <button type="submit" disabled={!chatInput.trim()} style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: chatInput.trim() ? 'var(--clr-primary)' : 'var(--clr-surface-3)',
            color: '#fff', border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s', flexShrink: 0
          }}>
            <Send size={15} style={{ marginLeft: isAr ? 0 : '2px', marginRight: isAr ? '2px' : 0 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
