"use client"
import { PdfConversionProvider, usePdfConversion } from "@/lib/hooks/usePdfToImage";
import { PdfPagePreview } from "@/types/pdf";
import Image, { ImageProps } from "next/image";
import React, { useState,useEffect } from "react";

interface PreviewDisplayItemProps extends Omit<ImageProps, 'src'> {
  src:string;
  preview?: PdfPagePreview;
}
export default function PreviewDisplay({preview, ...props}:PreviewDisplayItemProps){
    return <PdfConversionProvider>
        <PreviewDisplayItem preview={preview} {...props} src={props.src || preview?.imageUrl|| ''}/>
    </PdfConversionProvider>
}


export function PreviewDisplayItem({
  preview,
  src,
  ...props
}: PreviewDisplayItemProps) {
  const { imageUrls, loading, error, convert } = usePdfConversion();
  const [isConverting, setIsConverting] = useState(false);
  useEffect(()=>{
    console.log(imageUrls)
  },[imageUrls])

  useEffect(() => {
    // Only start conversion if we don't have previews and conversion hasn't started yet
    if (src && imageUrls.length === 0 && !loading && !isConverting) {
      setIsConverting(true);
      convert(src);
    }
  }, [src, imageUrls, loading, isConverting, convert]);



  // Handle loading and error states
  if (imageUrls.length===0&&(loading || isConverting)) {
    return <div>Generating preview for page {preview?.pageNumber}...</div>;
  }
  if (error) {
    return <div>Error generating preview for page {preview?.pageNumber}.</div>;
  }

    // Determine the source URL: use the converted image if available, otherwise the existing one
  const source = imageUrls[0] || preview?.imageUrl || '';
  // Display the Next.js Image component with the correct source
  return (
    <Image
        src={source}
        {...props}
        width={ preview?.width||props.width}
        height={ preview?.height||props.height}
      />
  );
}