'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useFileUpload } from '@/lib/hooks/useFileUpload';

interface FormValues {
  name: string;
  fileUrl: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualAddDialog({ open, onOpenChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { uploadFile } = useFileUpload();

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      fileUrl: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Fetch the PDF file with timeout
        const response = await fetch(data.fileUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (response.status === 404) {
          throw new Error('PDF file not found at the specified URL');
        }

        if (response.status === 403 || response.status === 401) {
          throw new Error('Access to the PDF file is restricted');
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF file: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/pdf')) {
          throw new Error('The URL does not point to a valid PDF file');
        }

        const blob = await response.blob();
        const maxSize = 100 * 1024 * 1024; // 100MB limit
        if (blob.size > maxSize) {
          throw new Error('PDF file is too large (max 100MB)');
        }

        // Create a File object from the blob
        const file = new File([blob], data.name.endsWith('.pdf') ? data.name : `${data.name}.pdf`, {
          type: 'application/pdf',
        });

        await uploadFile(file);
        onOpenChange(false);
        form.reset();
        toast.success('PDF added successfully');
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and the URL.');
      } else {
        toast.error('Failed to add PDF: ' + (error as Error).message);
      }
      // Log error for debugging
      console.error('PDF upload error:', error);
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
