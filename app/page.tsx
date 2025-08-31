'use client';

import { useState } from 'react'
import { FileUploadDialog } from '@/components/ui/file-upload-dialog'
import { ManualAddDialog } from '@/components/ui/manual-add-dialog'
import { GalleryGrid } from '@/components/ui/gallery-grid'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Upload, Link } from 'lucide-react'

export default function Home() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [manualAddOpen, setManualAddOpen] = useState(false)

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">PDF Gallery</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add PDF
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setManualAddOpen(true)}>
              <Link className="mr-2 h-4 w-4" />
              Add by URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GalleryGrid />

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />

      <ManualAddDialog
        open={manualAddOpen}
        onOpenChange={setManualAddOpen}
      />
    </main>
  )
}
