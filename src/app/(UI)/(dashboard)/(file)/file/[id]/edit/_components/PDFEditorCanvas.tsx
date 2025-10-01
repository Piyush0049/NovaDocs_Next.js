"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface PDFFile {
  id: string;
  name: string;
  url: string;
  pageCount: number;
  status: string;
}

interface Annotation {
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
}

interface PDFEditorCanvasProps {
  file: PDFFile;
  currentPage: number;
  zoom: number;
  annotations: Annotation[];
  selectedTool: string;
  selectedAnnotation: string | null;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onSelectAnnotation: (id: string | null) => void;
}

// Canvas-based PDF Renderer using PDF.js
const PDFCanvasRenderer = ({ 
  file, 
  currentPage, 
  zoom, 
  onLoad, 
  onError 
}: {
  file: PDFFile;
  currentPage: number;
  zoom: number;
  onLoad: (pageCount: number) => void;
  onError: (error: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js from CDN if not already loaded
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              // Set worker
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js'));
            document.head.appendChild(script);
          });
        }

        if (!isMounted) return;

        const pdfjsLib = (window as any).pdfjsLib;
        
        // Check if URL is valid
        if (!file.url) {
          throw new Error('PDF URL is missing');
        }

        console.log('Loading PDF from URL:', file.url);
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: file.url,
          withCredentials: false,
          isEvalSupported: false,
          // Add CORS proxy if needed (you might need to set up your own proxy)
          // If the PDF is on a different domain, you might need a proxy
          httpHeaders: {
            'Access-Control-Allow-Origin': '*'
          }
        });
        
        loadingTask.onProgress = (progress: any) => {
          console.log(`Loading PDF: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        };
        
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        
        pdfDocRef.current = pdf;
        const totalPages = pdf.numPages;
        
        // Render the current page
        await renderPage(pdf, currentPage);
        
        if (!isMounted) return;

        setLoading(false);
        onLoad(totalPages);
        
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          const errorMessage = err.message || 'Failed to load PDF';
          setError(errorMessage);
          setLoading(false);
          onError(errorMessage);
        }
      }
    };

    const renderPage = async (pdf: any, pageNum: number) => {
      try {
        if (!canvasRef.current) return;
        
        const page = await pdf.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Calculate viewport with zoom
        const baseScale = 1.5;
        const scale = baseScale * (zoom / 100);
        const viewport = page.getViewport({ scale });
        
        // Set canvas dimensions
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Clear canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
      } catch (err) {
        console.error('Error rendering page:', err);
        throw err;
      }
    };

    // Load PDF initially
    if (!pdfDocRef.current) {
      loadPDF();
    } else {
      // Just re-render if PDF is already loaded
      renderPage(pdfDocRef.current, currentPage).catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [file.url, currentPage, zoom]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl">
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg font-medium text-gray-800 mb-2">Loading PDF</p>
          <p className="text-sm text-gray-600">Page {currentPage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Loading Failed</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <motion.button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Retry
            </motion.button>
            {file.url && (
              <motion.button
                onClick={() => window.open(file.url, '_blank')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Open in New Tab
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full shadow-lg rounded-lg"
      style={{
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
};

export default function PDFEditorCanvas({
  file,
  currentPage,
  zoom,
  annotations,
  selectedTool,
  selectedAnnotation,
  onPageChange,
  onZoomChange,
  onAddAnnotation,
  onUpdateAnnotation,
  onSelectAnnotation,
}: PDFEditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [actualPageCount, setActualPageCount] = useState(file.pageCount || 1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Check if file has a valid URL and status
  const isFileReady = file && file.url && (
    file.status === 'ready' || 
    file.status === 'completed' || 
    file.status === 'success' ||
    // Allow loading even without explicit status if URL exists
    (file.url && !file.status)
  );

  useEffect(() => {
    console.log('File status:', file.status);
    console.log('File URL:', file.url);
    console.log('Is file ready?', isFileReady);
  }, [file, isFileReady]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'select' || !ready) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (100 / zoom);
    const y = (e.clientY - rect.top) * (100 / zoom);

    if (selectedTool === 'comment') {
      const content = prompt('Enter your comment:');
      if (!content) return;

      onAddAnnotation({
        type: 'comment',
        page: currentPage,
        x,
        y,
        color: '#3b82f6',
        content,
        width: 32,
        height: 32,
        opacity: 1,
      });
    } else if (selectedTool === 'highlight') {
      onAddAnnotation({
        type: 'highlight',
        page: currentPage,
        x,
        y,
        width: 150,
        height: 20,
        color: '#fbbf24',
        opacity: 0.6,
      });
    } else if (selectedTool === 'text') {
      const content = prompt('Enter text:');
      if (!content) return;

      onAddAnnotation({
        type: 'text',
        page: currentPage,
        x,
        y,
        color: '#000000',
        content,
        fontSize: 16,
        fontFamily: 'Arial',
        opacity: 1,
      });
    } else if (selectedTool === 'shape') {
      onAddAnnotation({
        type: 'shape',
        page: currentPage,
        x,
        y,
        width: 100,
        height: 100,
        color: '#ef4444',
        opacity: 0.8,
        strokeWidth: 2,
      });
    }
  }, [selectedTool, currentPage, zoom, onAddAnnotation, ready]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'draw' && ready) {
      setIsDrawing(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - rect.left) * (100 / zoom),
        y: (e.clientY - rect.top) * (100 / zoom),
      };
      setDrawingPoints([point]);
    }
  }, [selectedTool, zoom, ready]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawing && selectedTool === 'draw') {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - rect.left) * (100 / zoom),
        y: (e.clientY - rect.top) * (100 / zoom),
      };
      setDrawingPoints(prev => [...prev, point]);
    }
  }, [isDrawing, selectedTool, zoom]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawingPoints.length > 1) {
      onAddAnnotation({
        type: 'drawing',
        page: currentPage,
        x: Math.min(...drawingPoints.map(p => p.x)),
        y: Math.min(...drawingPoints.map(p => p.y)),
        color: '#ef4444',
        opacity: 1,
        strokeWidth: 3,
        points: drawingPoints,
      });
    }
    setIsDrawing(false);
    setDrawingPoints([]);
  }, [isDrawing, drawingPoints, onAddAnnotation, currentPage]);

  const handleAnnotationClick = useCallback((e: React.MouseEvent, annotation: Annotation) => {
    e.stopPropagation();
    onSelectAnnotation(annotation.id);
  }, [onSelectAnnotation]);

  const renderAnnotation = useCallback((annotation: Annotation) => {
    // Only render annotations for current page
    if (annotation.page !== currentPage) return null;

    const scaledStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${annotation.x * (zoom / 100)}px`,
      top: `${annotation.y * (zoom / 100)}px`,
      color: annotation.color,
      opacity: annotation.opacity || 1,
      cursor: 'pointer',
      zIndex: selectedAnnotation === annotation.id ? 20 : 10,
    };

    switch (annotation.type) {
      case 'highlight':
        return (
          <motion.div
            key={annotation.id}
            style={{
              ...scaledStyle,
              width: (annotation.width || 0) * (zoom / 100),
              height: (annotation.height || 0) * (zoom / 100),
              backgroundColor: annotation.color,
              borderRadius: '4px',
              border: selectedAnnotation === annotation.id ? '2px solid #3b82f6' : 'none',
            }}
            onClick={(e) => handleAnnotationClick(e, annotation)}
            whileHover={{ scale: 1.02 }}
            layoutId={annotation.id}
          />
        );

      case 'comment':
        return (
          <motion.div
            key={annotation.id}
            style={scaledStyle}
            onClick={(e) => handleAnnotationClick(e, annotation)}
            whileHover={{ scale: 1.1 }}
            layoutId={annotation.id}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white"
              style={{ backgroundColor: annotation.color }}
            >
              💬
            </div>
            {selectedAnnotation === annotation.id && (
              <motion.div
                className="absolute top-10 left-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 min-w-64 max-w-80 z-30"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">Comment</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{annotation.content}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 'text':
        return (
          <motion.div
            key={annotation.id}
            style={{
              ...scaledStyle,
              fontSize: (annotation.fontSize || 16) * (zoom / 100),
              fontFamily: annotation.fontFamily || 'Arial',
              border: selectedAnnotation === annotation.id ? '2px dashed #3b82f6' : 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: selectedAnnotation === annotation.id ? '#3b82f610' : 'transparent',
              minWidth: '50px',
              minHeight: '20px',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={(e) => handleAnnotationClick(e, annotation)}
            whileHover={{ scale: 1.02 }}
            layoutId={annotation.id}
          >
            {annotation.content}
          </motion.div>
        );

      case 'shape':
        return (
          <motion.div
            key={annotation.id}
            style={{
              ...scaledStyle,
              width: (annotation.width || 0) * (zoom / 100),
              height: (annotation.height || 0) * (zoom / 100),
              border: `${annotation.strokeWidth || 2}px solid ${annotation.color}`,
              borderRadius: '8px',
              backgroundColor: selectedAnnotation === annotation.id ? `${annotation.color}20` : 'transparent',
            }}
            onClick={(e) => handleAnnotationClick(e, annotation)}
            whileHover={{ scale: 1.02 }}
            layoutId={annotation.id}
          />
        );

      case 'drawing':
        if (!annotation.points || annotation.points.length < 2) return null;
        
        const pathData = annotation.points
          .map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x * (zoom / 100)} ${point.y * (zoom / 100)}`
          )
          .join(' ');

        return (
          <svg
            key={annotation.id}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              zIndex: selectedAnnotation === annotation.id ? 20 : 10,
              left: 0,
              top: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <path
              d={pathData}
              stroke={annotation.color}
              strokeWidth={annotation.strokeWidth || 2}
              fill="none"
              opacity={annotation.opacity || 1}
              onClick={(e) => {
                e.stopPropagation();
                handleAnnotationClick(e as any, annotation);
              }}
              style={{ 
                pointerEvents: 'auto', 
                cursor: 'pointer',
                filter: selectedAnnotation === annotation.id ? 'drop-shadow(0 0 4px #3b82f6)' : 'none'
              }}
            />
          </svg>
        );

      default:
        return null;
    }
  }, [selectedAnnotation, handleAnnotationClick, currentPage, zoom]);

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Bar */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </motion.button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= actualPageCount) {
                    onPageChange(page);
                  }
                }}
                className="w-12 text-center bg-transparent border-none outline-none text-white text-sm"
                min={1}
                max={actualPageCount}
              />
              <span className="text-sm text-gray-400">of {actualPageCount}</span>
            </div>
            
            <motion.button
              onClick={() => onPageChange(Math.min(actualPageCount, currentPage + 1))}
              disabled={currentPage === actualPageCount}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Tool Status */}
          <div className="px-3 py-1 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">
              {selectedTool === 'select' ? 'Select Mode' : 
               selectedTool === 'highlight' ? 'Highlight Tool' :
               selectedTool === 'comment' ? 'Comment Tool' :
               selectedTool === 'text' ? 'Text Tool' :
               selectedTool === 'draw' ? 'Drawing Tool' :
               selectedTool === 'shape' ? 'Shape Tool' : 'Unknown Tool'}
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-300">
              {ready ? 'Ready' : 'Loading...'}
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onZoomChange(Math.max(50, zoom - 25))}
            disabled={zoom <= 50}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </motion.button>
          
          <div className="px-3 py-1 bg-gray-700 rounded-lg min-w-[80px] text-center">
            <span className="text-sm font-medium text-white">{zoom}%</span>
          </div>
          
          <motion.button
            onClick={() => onZoomChange(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gray-900 p-8">
        <motion.div
          className="mx-auto shadow-2xl rounded-xl overflow-hidden relative bg-white"
          style={{
            width: 'fit-content',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* PDF Renderer */}
          {isFileReady ? (
            <div className="relative">
              <PDFCanvasRenderer
                file={file}
                currentPage={currentPage}
                zoom={zoom}
                onLoad={(pageCount) => {
                  setReady(true);
                  setActualPageCount(pageCount);
                }}
                onError={(error) => {
                  setReady(false);
                  console.error('PDF loading error:', error);
                }}
              />
              
              {/* Annotation Layer */}
              <div
                ref={canvasRef}
                className="absolute inset-0"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  pointerEvents: ready ? 'auto' : 'none',
                  cursor: selectedTool === 'select' ? 'default' : 
                         selectedTool === 'draw' ? 'crosshair' : 'crosshair'
                }}
              >
                {annotations.filter(a => a.page === currentPage).map(renderAnnotation)}
                
                {/* Current drawing path */}
                {isDrawing && drawingPoints.length > 1 && (
                  <svg className="absolute top-0 left-0 pointer-events-none" width="100%" height="100%">
                    <path
                      d={drawingPoints
                        .map((point, index) => 
                          `${index === 0 ? 'M' : 'L'} ${point.x * (zoom / 100)} ${point.y * (zoom / 100)}`
                        )
                        .join(' ')}
                      stroke="#ef4444"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.8"
                    />
                  </svg>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-xl">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  {file.status === 'processing' ? 'Processing PDF...' : 'PDF not available'}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {file.status || 'Unknown'}
                </p>
                {file.url && (
                  <p className="text-xs text-gray-400 mt-1">
                    URL: {file.url.substring(0, 50)}...
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}