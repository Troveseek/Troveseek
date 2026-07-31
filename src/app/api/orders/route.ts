import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// GET /api/orders - Fetch all orders with status filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const where: any = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { name: { contains: search } } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        items: true,
        invoice: { select: { invoiceNum: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// PATCH /api/orders - Bulk update order status (Admin/Sales/Support only)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SUPPORT'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields: id, status' }, { status: 400 });
  }

  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
  });

  // Write to audit log
  await db.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE_ORDER_STATUS',
      resource: 'Order',
      resourceId: id,
      details: JSON.stringify({ previousStatus: undefined, newStatus: status }),
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    },
  });

  return NextResponse.json({ data: order });
}

// POST /api/orders - Place a new order (Client + Admin)
export async function POST(req: NextRequest) {
  const session = await auth();

  const body = await req.json();
  const { items, totalAmount, paymentMethod, transactionId, billingInfo } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  if (!totalAmount || totalAmount <= 0) {
    return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
  }

  if (billingInfo?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
  }

  try {
    // If user is logged in, attach the order to their account
    // If guest, create order without userId (guest checkout)
    const userId = session?.user ? (session.user as any).id : null;

    if (!userId) {
      // For now, require login to place an order
      return NextResponse.json({ error: 'You must be logged in to place an order' }, { status: 401 });
    }

    // Fetch product details to get itemName + unitPrice from DB
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true }
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Generate order number
    const orderNumber = `TRV-${Date.now().toString().slice(-8)}`;
    const isStripe = paymentMethod === 'card';

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount: Number(totalAmount),
        status: 'PENDING',
        paymentStatus: 'UNPAID', // Always unpaid initially
        paymentMethod: paymentMethod || 'card',
        transactionId: transactionId || null,
        billingInfo: billingInfo ? JSON.stringify(billingInfo) : null,
        items: {
          create: items.map((item: any) => {
            const product = productMap.get(item.productId) as any;
            const unitPrice = Number(item.price ?? product?.price ?? 0);
            const quantity = Number(item.quantity ?? 1);
            return {
              productId: item.productId || null,
              itemName: product?.name ?? item.name ?? 'Unknown Item',
              quantity,
              unitPrice,
              totalPrice: unitPrice * quantity,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    let checkoutUrl = null;
    if (isStripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
      }

      // Determine site currency
      const siteCurrencyObj = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
      const siteCurrency = (siteCurrencyObj?.value || 'USD').toLowerCase();
      
      const stripe = new (require('stripe').default)(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' });

      const sessionCheckout = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.items.map((item: any) => ({
          price_data: {
            currency: siteCurrency,
            product_data: { name: item.itemName },
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?success=true&order=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?canceled=true`,
        metadata: {
          orderId: order.id,
        },
      });
      checkoutUrl = sessionCheckout.url;
    }

    // Write audit log
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE_ORDER',
        resource: 'Order',
        resourceId: order.id,
        details: JSON.stringify({ orderNumber, totalAmount, itemCount: items.length, paymentMethod }),
        ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
      },
    });

    // Notify Admins
    const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: 'New Order Received',
          message: `Order ${orderNumber} placed for $${totalAmount.toFixed(2)}`,
          type: 'SUCCESS',
          link: `/admin/orders/${order.id}`,
        })),
      });
    }

    // Notify Client in-app
    await db.notification.create({
      data: {
        userId,
        title: 'Order Confirmed',
        message: `Your order ${orderNumber} has been received.`,
        type: 'SUCCESS',
        link: `/profile`,
      }
    });

    // Send receipt email to the client if preferences allow
    const userPrefs = await db.user.findUnique({ where: { id: userId }, select: { notifyEmailOrders: true } });
    const customerEmail = billingInfo?.email || (session?.user as any)?.email;
    if (customerEmail && userPrefs?.notifyEmailOrders !== false) {
      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation: ${orderNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Thank You for Your Order!</h2>
            <p>Your order <strong>${orderNumber}</strong> has been received and is currently being processed.</p>
            
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Status:</strong> Pending Verification</p>
            </div>

            <p style="font-size: 14px; color: #666;">We will notify you once your order has been updated. You can also track your order status in your profile if you are registered.</p>
            <hr style="border: 1px solid #eaeaea; margin-top: 32px;"/>
            <p style="font-size: 12px; color: #999;">If you have any questions, please reply to this email.</p>
          </div>
        `
      });
    }

    return NextResponse.json({ 
      success: true, 
      order, 
      url: isStripe ? checkoutUrl : null 
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
