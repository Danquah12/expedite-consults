import { NextResponse } from 'next/server';
import { resolveNationalAddress, evaluateNationalAddress } from '@/app/trueplace/nationalAVMService';
import { propertyLedger } from '@/app/trueplace/ledgerEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { magicKey, singleLine, beds, baths, sqft, listPrice } = body || {};

    if (!magicKey && !singleLine) {
      return NextResponse.json(
        { status: 'error', message: 'magicKey or singleLine address is required.' },
        { status: 400 }
      );
    }

    const resolved = await resolveNationalAddress(magicKey, singleLine);
    if (!resolved) {
      return NextResponse.json(
        { status: 'error', message: 'Unable to resolve address through National Geocoding Service.' },
        { status: 404 }
      );
    }

    const property = evaluateNationalAddress(resolved, { beds, baths, sqft, listPrice });

    // Append to live ledger memory
    const existing = propertyLedger.getProperties();
    if (!existing.some(p => p.address.toLowerCase() === property.address.toLowerCase())) {
      existing.unshift(property);
    }

    return NextResponse.json({
      status: 'ok',
      message: `Successfully resolved and evaluated ${property.address}, ${property.city}, ${property.state}`,
      property,
      resolvedMetadata: {
        county: resolved.county,
        coordinates: resolved.coordinates,
        neighborhood: resolved.neighborhood,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to evaluate address' },
      { status: 500 }
    );
  }
}
