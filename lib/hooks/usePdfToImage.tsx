'use client';


import { useState, useCallback,createContext, useContext, ReactNode } from 'react';
import pdfToImageBlobs from '../utils/loadPdf';

interface UsePdfToImageResult {
  imageUrls: string[];
  loading: boolean;
  error: unknown;
  convert: (pdfUrl: string) => void;
}

export function usePdfToImage(): UsePdfToImageResult {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const convert = useCallback(async (pdfUrl: string) => {
    setLoading(true);
    setError(null);
    setImageUrls([]); // Clear previous results
    try {
      const urls = await pdfToImageBlobs(pdfUrl);
      setImageUrls(urls);
      setLoading(false);
    } catch (e) {
      setError(e);
      console.error("Error converting PDF to images:", e);
    } finally {
      setLoading(false);
    }
  }, []); // The useCallback hook ensures the 'convert' function reference is stable

  return { imageUrls, loading, error, convert };
}



// Define the shape of the context's value
interface PdfConversionContextValue {
  imageUrls: string[];
  loading: boolean;
  error: unknown;
  convert: (pdfUrl: string) => void;
}

// Create the context with an initial undefined value
const PdfConversionContext = createContext<PdfConversionContextValue | undefined>(undefined);

// Props for the provider component
interface PdfConversionProviderProps {
  children: ReactNode;
}

// Create the context provider component
export function PdfConversionProvider({ children }: PdfConversionProviderProps) {
  // Use the custom hook to manage the conversion state
  const { imageUrls, loading, error, convert } = usePdfToImage();

  return (
    <PdfConversionContext.Provider value={{ imageUrls, loading, error, convert }}>
      {children}
    </PdfConversionContext.Provider>
  );
}

// Create a custom hook for easier context consumption
export function usePdfConversion() {
  const context = useContext(PdfConversionContext);
  if (context === undefined) {
    throw new Error('usePdfConversion must be used within a PdfConversionProvider');
  }
  return context;
}
