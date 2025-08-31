import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import * as fs from 'fs-extra'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
// Temporary directory for processing
const TMP_DIR = '/tmp/pdf-previews'
fs.ensureDirSync(TMP_DIR)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf') as Blob
    const pageNumber = parseInt(formData.get('page') as string)

    if (!pdfFile || !pageNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    const page = pages[pageNumber - 1]

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Create a new document with just this page
    const singlePagePdf = await PDFDocument.create()
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageNumber - 1])
    singlePagePdf.addPage(copiedPage)

    // Save to temporary file
    const tmpPath = join(TMP_DIR, `${uuidv4()}.pdf`)
    await fs.writeFile(tmpPath, await singlePagePdf.save())

    try {
      // Convert to PNG using sharp
      const image = await sharp(tmpPath, { density: 300 })
        .resize(800, null, { // Resize to max width of 800px while maintaining aspect ratio
          withoutEnlargement: true,
          fit: 'contain'
        })
        .png()
        .toBuffer()

      // Clean up
      await fs.remove(tmpPath)

      return new NextResponse(Buffer.from(image), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } finally {
      // Ensure cleanup
      await fs.remove(tmpPath).catch(() => {})
    }
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
