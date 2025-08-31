import { useState } from 'react'
import { usePdfStore } from '@/lib/store/usePdfStore'
import { toast } from 'sonner'
import { PdfFile } from '@/types/pdf'
import * as pdfjsLib from 'pdfjs-dist'
import { v4 as uuidv4 } from 'uuid'

// Initialize pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>
  isUploading: boolean
  progress: number
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { addFile, setError } = usePdfStore()

  const generatePreview = async (pdfDoc: any, pageNumber: number) => {
    const page = await pdfDoc.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.0 })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not get canvas context')

    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    return {
      pageNumber,
      imageUrl: canvas.toDataURL('image/jpeg', 0.7),
      width: viewport.width,
      height: viewport.height,
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setProgress(0)

      // Create blob URL for the file
      const fileUrl = URL.createObjectURL(file)
      
      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      // Generate previews for all pages
      const previews = []
      const pageCount = pdfDoc.numPages
      
      for (let i = 1; i <= pageCount; i++) {
        const preview = await generatePreview(pdfDoc, i)
        previews.push(preview)
        setProgress((i / pageCount) * 100)
      }

      // Create the PDF file entry
      const pdfFile: PdfFile = {
        id: uuidv4(),
        name: file.name,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        pageCount,
        tags: [],
        previews,
        arrangement: Array.from({ length: pageCount }, (_, i) => i),
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
