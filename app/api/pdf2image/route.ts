import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf') as Blob
    const pageNumber = parseInt(formData.get('page') as string)

    if (!pdfFile || !pageNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert blob to buffer
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())

    // Load and extract the specified page using pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const page = pdfDoc.getPages()[pageNumber - 1]

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Create a new document with just this page
    const newPdfDoc = await PDFDocument.create()
    const [extractedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1])
    newPdfDoc.addPage(extractedPage)
    
    // Get the page dimensions for proper scaling
    const { width, height } = extractedPage.getSize()
    const targetWidth = 800
    const scale = targetWidth / width
    const targetHeight = Math.round(height * scale)

    // Convert the PDF page to an image using Sharp
    const imageBuffer = await sharp(await newPdfDoc.save(), {
      density: 300 // Higher density for better quality
    })
    .resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .jpeg({ quality: 90 })
    .toBuffer()

    // Return the image
    return new NextResponse(
      new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' }), 
      {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': imageBuffer.length.toString()
        }
      }
    )
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
