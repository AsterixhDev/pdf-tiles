'use client';

import { useState } from 'react';
import { usePdfStore } from '@/lib/store/usePdfStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { QUALITY_PRESETS, QualityPreset } from '@/types/pdf';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
}

export function ExportDialog({ open, onOpenChange, fileId }: ExportDialogProps) {
  const { files } = usePdfStore();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [filename, setFilename] = useState('');

  const file = files.find((f) => f.id === fileId);
  if (!file) return null;

  // Set default filename when the dialog opens
  if (!filename && open) {
    setFilename(file.name);
  }

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgress(0);

      // Prepare the images array based on the current arrangement
      const images = file.arrangement.map((index) => {
        const preview = file.previews[index];
        return {
          url: preview.imageUrl,
          width: preview.width,
          height: preview.height,
        };
      });

      // Call the export API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images,
          filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
          quality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF exported successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to export PDF: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="document.pdf"
              disabled={isExporting}
            />
          </div>

          <div className="space-y-2">
            <Label>Quality</Label>
            <RadioGroup
              value={quality}
              onValueChange={(value) => setQuality(value as QualityPreset)}
              disabled={isExporting}
              className="flex gap-4"
            >
              {Object.entries(QUALITY_PRESETS).map(([key, { dpi }]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`quality-${key}`} />
                  <Label htmlFor={`quality-${key}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({dpi} DPI)
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Generating PDF...
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
