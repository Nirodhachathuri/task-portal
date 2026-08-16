import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { taskUpdateSchema } from '@/lib/validation';

async function ownedTask(id: string, userId: string) {
  return prisma.task.findFirst({ where: { id, userId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await ownedTask(id, userId))) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  try {
    const body = taskUpdateSchema.parse(await request.json());
    const task = await prisma.task.update({ where: { id }, data: body });
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ error: 'Invalid task data.' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!(await ownedTask(id, userId))) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
