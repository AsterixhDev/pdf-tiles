// utils/pdfToImageBlobs.ts
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

// Set the worker source for pdfjs-dist. Using a CDN is generally safe for client-side rendering.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Converts a base64 encoded PDF URL into an array of image blob URLs.
 * @param {string} base64PdfUrl - The PDF data URL (e.g., "data:application/pdf;base64,...").
 * @returns {Promise<string[]>} A promise that resolves to an array of image blob URLs.
 */
const pdfToImageBlobs = async (base64PdfUrl: string): Promise<string[]> => {
  const imagesList: string[] = [];
  
  // Extract base64 data, ignoring the "data:application/pdf;base64," prefix.
  const base64Data = base64PdfUrl.split(',')[1];
  const pdfData = atob(base64Data);

  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: pdfData }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Create the canvas for this page inside the loop
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");
    
    if (!canvasContext) {
      console.error("Failed to get 2D canvas context.");
      continue;
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // The render context now requires the canvas element itself.
    const render_context = {
      canvasContext: canvasContext,
      viewport: viewport,
      canvas: canvas, // <-- Add this line to fix the TypeScript error
    };
    
    await page.render(render_context).promise;
    
    // Create a blob from the canvas image and get its URL.
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      imagesList.push(blobUrl);
    }
  }
  
  return imagesList;
};

export default pdfToImageBlobs;
