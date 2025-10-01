export interface PDFFile {
  id: string;
  name: string;
  url: string;
  size: number;
  pageCount: number;
  status: string;
  uploadDate: Date | string;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'drawing' | 'text' | 'shape' | 'image';
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  strokeWidth?: number;
  points?: Array<{ x: number; y: number }>;
  createdAt: Date;
  updatedAt: Date;
}
