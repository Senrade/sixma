import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> } // Khai báo params là Promise chuẩn Next 15
) {
  try {
    // Bắt buộc phải có await để giải mã params
    const resolvedParams = await params;
    const setId = resolvedParams.setId;

    console.log("🔥 [API Backend] Đang tìm kiếm mã:", setId);

    if (!setId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã màn chơi' }, { status: 400 });
    }

    const topic = await prisma.topic.findUnique({
      where: { setId: setId.toUpperCase() },
    });

    if (!topic) {
      console.log("❌ [API Backend] KHÔNG TÌM THẤY TRONG DATABASE!");
      return NextResponse.json({ success: false, error: 'Không tìm thấy màn chơi' }, { status: 404 });
    }

    const topicData = {
      set_id: topic.setId,
      theme: JSON.parse(topic.themeJson),
      story_context: topic.storyContext,
      mechanic_type: topic.mechanicType,
      simulated_post: JSON.parse(topic.simulatedPost),
      traps: JSON.parse(topic.trapsJson),
      dialogue_trigger: JSON.parse(topic.dialogueTrigger),
    };

    console.log("✅ [API Backend] TÌM THẤY THÀNH CÔNG!");
    return NextResponse.json({ success: true, data: topicData });
    
  } catch (error) {
    console.error('🚨 [API Backend] LỖI SERVER:', error);
    return NextResponse.json({ success: false, error: 'Lỗi truy vấn cơ sở dữ liệu' }, { status: 500 });
  }
}