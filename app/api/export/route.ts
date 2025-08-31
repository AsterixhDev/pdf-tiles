import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { QualityPreset } from '@/types/pdf'

export const maxDuration = 300 // 5 minutes max for large PDFs
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { images, filename, quality = 'medium' } = data as {
      images: { url: string; width: number; height: number }[]
      filename: string
      quality: QualityPreset
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Process each image
    for (const image of images) {
      try {
        // Fetch the image data
        const response = await fetch(image.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }
        const imageData = await response.arrayBuffer()

        // Create a new page with the image dimensions
        const page = pdfDoc.addPage([image.width, image.height])

        // Embed the image
        let embeddedImage
        try {
          // Try as PNG first
          embeddedImage = await pdfDoc.embedPng(imageData)
        } catch {
          try {
            // Try as JPEG if PNG fails
            embeddedImage = await pdfDoc.embedJpg(imageData)
          } catch (error) {
            console.error('Failed to embed image:', error)
            continue
          }
        }

        // Draw the image on the page
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        })
      } catch (error) {
        console.error('Error processing image:', error)
        continue
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save()

    // Return the PDF as a response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error in export route:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
