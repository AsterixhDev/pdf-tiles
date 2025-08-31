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

  const generatePreview = async (pdfBytes: ArrayBuffer, pageNumber: number): Promise<string> => {
    // Check cache first
    const cacheKey = `${uuidv4()}_${pageNumber}`
    const cached = previewCache.get(cacheKey)
    if (cached) return cached as string

    // Generate preview using API route
    const formData = new FormData()
    formData.append('pdf', new Blob([pdfBytes]))
    formData.append('page', pageNumber.toString())

    const response = await fetch('/api/preview', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to generate preview')
    }

    // Convert response to base64
    const imageBlob = await response.blob()
    const base64url = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(imageBlob)
    })

    // Cache the result
    previewCache.set(cacheKey, base64url)
    return base64url
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
            const preview = await generatePreview(arrayBuffer, pageNumber)
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
