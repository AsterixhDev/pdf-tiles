export interface PdfFile {
  id: string;
  name: string;
  fileUrl: string;
  uploadedAt: string | null;
  size: number;
  pageCount: number;
  tags: string[];
  previews: PdfPagePreview[];
  arrangement: number[];
}

export interface PdfPagePreview {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

export type QualityPreset = 'low' | 'medium' | 'high';

export interface QualityPresetConfig {
  scale: number;
  dpi: number;
}

export const QUALITY_PRESETS: Record<QualityPreset, QualityPresetConfig> = {
  low: { scale: 1, dpi: 72 },
  medium: { scale: 2, dpi: 150 },
  high: { scale: 3, dpi: 300 },
};
