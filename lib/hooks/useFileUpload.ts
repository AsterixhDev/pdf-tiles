import { useState } from 'react'
import { usePdfStore } from '@/lib/store/usePdfStore'
import { toast } from 'sonner'
import { PdfFile } from '@/types/pdf'
import { v4 as uuidv4 } from 'uuid'
import { PDFDocument } from 'pdf-lib'
import { LRUCache } from 'lru-cache'

// Create a cache for PDF previews
const previewCache = new LRUCache({
  max: 500, // Store up to 500 page previews
  ttl: 1000 * 60 * 60, // Cache for 1 hour
})

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>
  isUploading: boolean
  progress: number
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { addFile, setError } = usePdfStore()

  const generatePreview = async (pdfDoc: PDFDocument, pageNumber: number): Promise<string> => {
    try {
      // Create a new document with just this page
      const singlePagePdf = await PDFDocument.create()
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageNumber - 1])
      singlePagePdf.addPage(copiedPage)

      // Convert to base64 PDF
      const pdfBytes = await singlePagePdf.saveAsBase64()
      const dataUrl = `data:application/pdf;base64,${pdfBytes}`
      // Cache the result
      const cacheKey = `${uuidv4()}_${pageNumber}`
      previewCache.set(cacheKey, dataUrl)
      
      return dataUrl
    } catch (error) {
      console.error('Error generating preview:', error)
      throw new Error('Failed to generate preview')
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setProgress(0)

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const numPages = pdfDoc.getPageCount()

      // Generate previews for each page
      const previews = await Promise.all(
        Array.from({ length: numPages }, (_, i) => i + 1).map(async (pageNumber) => {
          try {
            setProgress((pageNumber / numPages) * 100)
            const preview = await generatePreview(pdfDoc, pageNumber)
            const page = pdfDoc.getPages()[pageNumber - 1]
            return {
              pageNumber,
              imageUrl: preview,
              width: page.getWidth(),
              height: page.getHeight(),
            }
          } catch (error) {
            console.error(`Error generating preview for page ${pageNumber}:`, error)
            return {
              pageNumber,
              imageUrl: '', // Placeholder for failed preview
              width: 0,
              height: 0,
            }
          }
        })
      )

      // Create the PDF file entry
      const pdfFile: PdfFile = {
        id: uuidv4(),
        name: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        size: file.size,
        pageCount: numPages,
        previews,
        tags: [],
        arrangement: Array.from({ length: numPages }, (_, i) => i),
      }

      addFile(pdfFile)
      toast.success('PDF file uploaded successfully')
      
    } catch (err) {
      const error = err as Error
      setError(error.message)
      toast.error('Failed to upload PDF file')
      throw error
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return {
    uploadFile,
    isUploading,
    progress,
  }
}
