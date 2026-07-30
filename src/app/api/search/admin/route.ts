import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    // Allow any admin/staff role
    const STAFF_ROLES = [
      'SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING', 
      'SUPPORT', 'CONTENT_EDITOR', 'FINANCE', 'EMPLOYEE'
    ];
    if (!session?.user || !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Search Users
    const users = await db.user.findMany({
      where: { 
        OR: [
          { name: { contains: query } }, 
          { email: { contains: query } }
        ] 
      },
      take: 5
    });
    users.forEach(u => results.push({ 
      id: `user-${u.id}`, 
      type: 'User', 
      title: u.name || u.email || 'Unknown', 
      subtitle: u.email, 
      link: `/admin/users` 
    }));

    // Search Products
    const products = await db.product.findMany({
      where: { name: { contains: query } },
      take: 5
    });
    products.forEach(p => results.push({ 
      id: `product-${p.id}`, 
      type: 'Product', 
      title: p.name, 
      subtitle: `$${p.price} - ${p.status}`, 
      link: `/admin/products/${p.id}/edit` 
    }));

    // Search Orders
    const orders = await db.order.findMany({
      where: { orderNumber: { contains: query } },
      take: 5
    });
    orders.forEach(o => results.push({ 
      id: `order-${o.id}`, 
      type: 'Order', 
      title: `Order #${o.orderNumber}`, 
      subtitle: o.status, 
      link: `/admin/orders` 
    }));

    // Search Chat Sessions (Tickets)
    const tickets = await db.chatSession.findMany({
      where: { subject: { contains: query } },
      take: 3
    });
    tickets.forEach(t => results.push({
      id: `ticket-${t.id}`,
      type: 'Ticket',
      title: t.subject || 'General Inquiry',
      subtitle: `Status: ${t.status}`,
      link: `/admin/support`
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
