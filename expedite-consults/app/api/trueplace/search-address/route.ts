import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ status: 'ok', suggestions: [] });
    }

    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${encodeURIComponent(
      query
    )}&countryCode=USA&f=json&maxSuggestions=7`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ status: 'ok', suggestions: [] });
    }

    const data = await res.json();
    const rawSuggestions = data.suggestions || [];

    const formatted = rawSuggestions.map((s: any) => {
      const parts = s.text.split(',').map((p: string) => p.trim());
      const statePart = parts.length >= 3 ? parts[parts.length - 2] : '';
      return {
        label: s.text,
        magicKey: s.magicKey,
        streetAddress: parts[0] || s.text,
        cityState: parts.slice(1, 3).join(', '),
        state: statePart.slice(0, 2).toUpperCase(),
        isCollection: s.isCollection,
      };
    });

    return NextResponse.json({
      status: 'ok',
      query,
      suggestions: formatted,
      scope: 'UNITED_STATES_NATIONWIDE',
    });
  } catch (error: any) {
    console.warn('Address autocomplete search error:', error.message);
    return NextResponse.json({ status: 'ok', suggestions: [] });
  }
}
