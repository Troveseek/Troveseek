import React from 'react';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmployeesClient from './EmployeesClient';

export default async function EmployeesAdminPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    redirect('/admin'); // Only Admins can view employee management
  }

  const STAFF_ROLES = [
    'CONTENT_EDITOR', 'SUPPORT', 'MARKETING',
    'FINANCE', 'SALES_MANAGER', 'ADMIN', 'SUPER_ADMIN',
    'CUSTOM', 'EMPLOYEE'
  ];

  const employees = await db.user.findMany({
    where: {
      role: { in: STAFF_ROLES },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <EmployeesClient initialEmployees={employees} />;
}
