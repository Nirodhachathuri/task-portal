import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { taskSchema } from '@/lib/validation';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = taskSchema.parse(await request.json());
    const task = await prisma.task.create({ data: { ...body, userId } });
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid task data.' }, { status: 400 });
  }
}
