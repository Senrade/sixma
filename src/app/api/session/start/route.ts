import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardCode } = body;

    const session = await prisma.userSession.create({
      data: {
        cardCode: cardCode || 'GUEST_CARD',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      cardCode: session.cardCode,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Không thể tạo phiên chơi' },
      { status: 500 }
    );
  }
}