import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://keygen.co/gen", {
      headers: {
        'User-Agent': 'Mimic Key Decoder (Next.js Proxy)'
      },
      next: { revalidate: 3600 } // Cache for 1 hour to prevent spamming their server
    });
    
    if (!res.ok) {
      throw new Error(`Upstream API returned ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Keygen proxy error:", error);
    return NextResponse.json({ error: 'Failed to fetch keygen data' }, { status: 500 });
  }
}
