import { NextResponse } from 'next/server';
import { propertyLedger } from '@/app/trueplace/ledgerEngine';

export async function GET() {
  try {
    const stats = propertyLedger.getStats();
    const blocks = propertyLedger.getBlocks();
    const properties = propertyLedger.getProperties();

    return NextResponse.json({
      status: 'ok',
      cadenceMinutes: 30,
      stats,
      blocks,
      totalProperties: properties.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to retrieve ledger status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let source = 'API_SCHEDULED_OR_MANUAL';
    try {
      const body = await request.json();
      if (body?.source) source = body.source;
    } catch {
      // Body is optional
    }

    const newBlock = await propertyLedger.triggerSync(source);
    const stats = propertyLedger.getStats();
    const properties = propertyLedger.getProperties();

    return NextResponse.json({
      status: 'ok',
      message: '30-minute real inventory synchronization cycle completed successfully.',
      newBlock,
      stats,
      properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to trigger 30-minute sync cycle' },
      { status: 500 }
    );
  }
}
