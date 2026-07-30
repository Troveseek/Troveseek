import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  employeeRole: z.string().optional(),
  department: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.employeeRole) updateData.role = validatedData.employeeRole;
    if (validatedData.department) updateData.department = validatedData.department;
    
    if (validatedData.password) {
       updateData.passwordHash = await hashPassword(validatedData.password);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Failed to update employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
