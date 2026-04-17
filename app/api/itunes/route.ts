import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get("term")
  const country = searchParams.get("country") || "cn"

  if (!term) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=10`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    const results = (data.results || []).map((r: Record<string, unknown>) => ({
      name: r.trackName as string,
      icon: (r.artworkUrl512 || r.artworkUrl100) as string,
      bundleId: r.bundleId as string,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
