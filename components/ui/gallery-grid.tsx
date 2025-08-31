import { useState } from 'react'
import { usePdfStore } from '@/lib/store/usePdfStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreVertical, Download, ZoomIn, Trash, GripVertical, FileOutput } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QUALITY_PRESETS, QualityPreset } from '@/types/pdf'
import { cn } from '@/lib/utils'
import { ReaderModal } from './reader-modal'
import { PageReorderDialog } from './page-reorder-dialog'
import { ExportDialog } from './export-dialog'

export function GalleryGrid() {
  const { files, activeFileId, setActiveFile, removeFile } = usePdfStore()
  const [selectedPage, setSelectedPage] = useState<{fileId: string; pageNumber: number} | null>(null)
  const [reorderingFile, setReorderingFile] = useState<string | null>(null)
  const [exportingFile, setExportingFile] = useState<string | null>(null)

  const handleDownload = async (fileId: string, pageNumber: number, quality: QualityPreset) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    const preview = file.previews.find((p) => p.pageNumber === pageNumber)
    if (!preview) return

    // Create a temporary link to download the image
    const a = document.createElement('a')
    a.href = preview.imageUrl
    a.download = `${file.name.replace('.pdf', '')}_page${pageNumber}_${quality}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No PDF files uploaded yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {files.map((file) => (
          <div key={file.id} className="space-y-4">
            <h3 className="font-semibold truncate" title={file.name}>
              {file.name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {file.previews.map((preview) => (
                <Card
                  key={preview.pageNumber}
                  className={cn(
                    'group relative cursor-pointer hover:ring-2 hover:ring-primary transition-all',
                    activeFileId === file.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => {
                    setActiveFile(file.id)
                    setSelectedPage({ fileId: file.id, pageNumber: preview.pageNumber })
                  }}
                >
                  <CardContent className="p-2">
                    <div className="relative aspect-[3/4]">
                      <img
                        src={preview.imageUrl}
                        alt={`Page ${preview.pageNumber} of ${file.name}`}
                        className="object-cover w-full h-full rounded"
                      />
                      <div className="absolute bottom-0 right-0 p-1 bg-background/80 text-xs rounded-tl">
                        {preview.pageNumber}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => setSelectedPage({ fileId: file.id, pageNumber: preview.pageNumber })}>
                            <ZoomIn className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDownload(file.id, preview.pageNumber, 'high')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setReorderingFile(file.id)}>
                            <GripVertical className="mr-2 h-4 w-4" />
                            Reorder Pages
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setExportingFile(file.id)}>
                            <FileOutput className="mr-2 h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => {
                              // TODO: Implement page deletion
                              console.log('Delete page', preview.pageNumber)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ReaderModal
        open={selectedPage !== null}
        onOpenChange={(open: boolean) => !open && setSelectedPage(null)}
        fileId={selectedPage?.fileId}
        initialPage={selectedPage?.pageNumber}
      />

      {reorderingFile && (
        <PageReorderDialog
          fileId={reorderingFile}
          onClose={() => setReorderingFile(null)}
          onSave={() => setReorderingFile(null)}
        />
      )}

      {exportingFile && (
        <ExportDialog
          fileId={exportingFile}
          open={true}
          onOpenChange={(open) => !open && setExportingFile(null)}
        />
      )}
    </>
  )
}
