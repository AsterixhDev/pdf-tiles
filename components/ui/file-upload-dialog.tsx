import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useFileUpload } from '@/lib/hooks/useFileUpload'

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FileUploadDialog({ open, onOpenChange }: FileUploadDialogProps) {
  const { uploadFile, isUploading, progress } = useFileUpload()
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setError(null)
      await uploadFile(file)
      onOpenChange(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [uploadFile, onOpenChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            Drop a PDF file here or click to browse
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`
            mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-colors duration-200 ease-in-out
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
            ${isUploading ? 'cursor-not-allowed opacity-60' : ''}
          `}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="space-y-4">
              <p>Uploading file...</p>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <p>
              {isDragActive
                ? "Drop the PDF file here"
                : "Drag 'n' drop a PDF file here, or click to select"}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
