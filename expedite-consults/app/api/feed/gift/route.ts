import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipient,
      giftName = "💎 1,000 Diamonds",
      amount = 1000,
      sender = "Kwesi Asiedu",
    } = body;

    if (!recipient) {
      return NextResponse.json({ success: false, error: "Recipient username required" }, { status: 400 });
    }

    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return NextResponse.json({
      success: true,
      transactionId,
      sender,
      recipient,
      giftName,
      amount,
      message: `✨ Sent ${giftName} to @${recipient}!`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[POST /api/feed/gift]", error);
    return NextResponse.json({ success: false, error: "Failed to send gift" }, { status: 500 });
  }
}
