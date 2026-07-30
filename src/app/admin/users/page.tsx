import React from 'react';
import db from '@/lib/db';
import UsersClient from './UsersClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function UsersAdminPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    redirect('/admin'); // Only Admins can view user management
  }

  const users = await db.user.findMany({
    where: {
      role: { in: ['CLIENT', 'GUEST'] }
    },
    orderBy: { createdAt: 'desc' },
  });

  return <UsersClient initialUsers={users} />;
}
