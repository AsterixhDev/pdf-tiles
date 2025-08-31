'use client';

import { useState } from 'react'
import { FileUploadDialog } from '@/components/ui/file-upload-dialog'
import { GalleryGrid } from '@/components/ui/gallery-grid'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Home() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  return (
    <main className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">PDF Gallery</h1>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </div>

      <GalleryGrid />

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </main>
  )
}
