import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { setId: 'asc' },
    });

    const data = topics.map((t) => ({
      set_id: t.setId,
      theme: JSON.parse(t.themeJson),
      story_context: t.storyContext,
      mechanic_type: t.mechanicType,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách chủ đề' },
      { status: 500 }
    );
  }
}