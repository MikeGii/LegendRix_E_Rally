// src/app/api/placeholder/[...dimensions]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const [width = '150', height = '60'] = params.dimensions

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#334155"/>
      <rect x="20%" y="30%" width="60%" height="40%" fill="#64748b" rx="4"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">No Image</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  })
}