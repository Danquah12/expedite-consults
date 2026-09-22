import { NextResponse } from 'next/server';
import { fetchActualPropertyPhotos } from '@/app/trueplace/photoService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!address) {
      return NextResponse.json(
        { status: 'error', message: 'Address parameter is required.' },
        { status: 400 }
      );
    }

    const coordinates =
      latStr && lngStr
        ? { lat: parseFloat(latStr), lng: parseFloat(lngStr) }
        : undefined;

    const photos = await fetchActualPropertyPhotos(address, coordinates);

    return NextResponse.json({
      status: 'ok',
      address,
      photosCount: photos.length,
      primaryPhoto: photos[0] || null,
      photos,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to fetch property photos' },
      { status: 500 }
    );
  }
}
