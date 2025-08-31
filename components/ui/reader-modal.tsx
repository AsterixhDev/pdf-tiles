import { useEffect, useState } from 'react'
import { usePdfStore } from '@/lib/store/usePdfStore'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Download,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QUALITY_PRESETS, QualityPreset } from '@/types/pdf'

interface ReaderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId?: string
  initialPage?: number
}

export function ReaderModal({ open, onOpenChange, fileId, initialPage = 1 }: ReaderModalProps) {
  const { files } = usePdfStore()
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [scale, setScale] = useState(1)
  const file = files.find((f) => f.id === fileId)
  const preview = file?.previews.find((p) => p.pageNumber === currentPage)

  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage)
    }
  }, [initialPage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'ArrowLeft':
          setCurrentPage((prev) => Math.max(1, prev - 1))
          break
        case 'ArrowRight':
          setCurrentPage((prev) => Math.min(file?.pageCount || 1, prev + 1))
          break
        case 'Escape':
          onOpenChange(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, file?.pageCount, onOpenChange])

  if (!file || !preview) return null

  const handleDownload = async (quality: QualityPreset) => {
    // Create a temporary link to download the image
    const a = document.createElement('a')
    a.href = preview.imageUrl
    a.download = `${file.name.replace('.pdf', '')}_page${currentPage}_${quality}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {currentPage} of {file.pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(file.pageCount, prev + 1))}
              disabled={currentPage >= file.pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((prev) => Math.max(0.25, prev - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((prev) => Math.min(3, prev + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale(1)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.entries(QUALITY_PRESETS) as [QualityPreset, { dpi: number }][]).map(
                  ([quality, { dpi }]) => (
                    <DropdownMenuItem
                      key={quality}
                      onSelect={() => handleDownload(quality)}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)} ({dpi} DPI)
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div
            className="relative mx-auto"
            style={{
              width: preview.width * scale,
              height: preview.height * scale,
            }}
          >
            <img
              src={preview.imageUrl}
              alt={`Page ${currentPage} of ${file.name}`}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
