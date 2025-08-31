import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = decodeURIComponent(searchParams.get('url') || '')
    const quality = parseInt(searchParams.get('quality') || '75')
    const format = (searchParams.get('format') || 'jpeg') as 'jpeg' | 'png'

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 })
    }

    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Process the image with sharp
    let processedImage = sharp(buffer)

    // Resize based on quality setting
    if (quality <= 32) {
      processedImage = processedImage.resize(120, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    } else if (quality <= 75) {
      processedImage = processedImage.resize(320, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    } else {
      processedImage = processedImage.resize(480, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Convert to specified format and quality
    if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ quality })
    } else {
      processedImage = processedImage.png({
        quality,
        compressionLevel: 9,
        palette: true
      })
    }

    const outputBuffer = await processedImage.toBuffer()

    // Return the processed image with appropriate headers
    return new NextResponse(Buffer.from(outputBuffer), {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': outputBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}
