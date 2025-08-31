'use client';

import { useState } from 'react';
import { usePdfStore } from '@/lib/store/usePdfStore';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const manualAddSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  fileUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((url) => url.toLowerCase().endsWith('.pdf'), {
      message: 'URL must point to a PDF file',
    }),
});

type ManualAddForm = z.infer<typeof manualAddSchema>;

interface ManualAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualAddDialog({ open, onOpenChange }: ManualAddDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { uploadFile } = useFileUpload();

  const form = useForm<ManualAddForm>({
    resolver: zodResolver(manualAddSchema),
    defaultValues: {
      name: '',
      fileUrl: '',
    },
  });

  const onSubmit = async (data: ManualAddForm) => {
    try {
      setIsLoading(true);

      // Fetch the PDF file
      const response = await fetch(data.fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF file');
      }

      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error('File is not a PDF');
      }

      // Create a File object from the blob
      const file = new File([blob], data.name.endsWith('.pdf') ? data.name : `${data.name}.pdf`, {
        type: 'application/pdf',
      });

      await uploadFile(file);
      onOpenChange(false);
      form.reset();
      toast.success('PDF added successfully');
    } catch (error) {
      toast.error('Failed to add PDF: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add PDF by URL</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Document name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/document.pdf"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add PDF'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
