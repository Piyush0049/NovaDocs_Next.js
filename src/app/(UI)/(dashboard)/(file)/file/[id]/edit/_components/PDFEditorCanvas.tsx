import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface PDFFile {
  id: string;
  name: string;
  url: string;
  status?: string;
  pageCount?: number;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'text' | 'draw' | 'drawing' | 'shape' | 'image';
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
  imageUrl?: string;
}

interface PDFViewerProps {
  file: PDFFile;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedTool?: string;
  annotations?: Annotation[];
  selectedAnnotation?: string | null;
  onAddAnnotation?: (annotation: Omit<Annotation, 'id'>) => void;
  onUpdateAnnotation?: (id: string, updates: Partial<Annotation>) => void;
  onSelectAnnotation?: (id: string | null) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const AnnotationOverlay = React.memo(({
  annotations,
  selectedAnnotation,
  onSelectAnnotation,
  onUpdateAnnotation,
  zoom,
  currentPage,
}: {
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  zoom: number;
  currentPage: number;
  containerWidth: number;
  containerHeight: number;
}) => {
  const renderAnnotation = (annotation: Annotation) => {
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
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
            whileHover={{ scale: 1.02 }}
          />
        );

      case 'comment':
        return (
          <motion.div
            key={annotation.id}
            style={scaledStyle}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white"
              style={{ backgroundColor: annotation.color }}
            >
              💬
            </div>
            {selectedAnnotation === annotation.id && (
              <motion.div
                className="absolute top-10 left-0 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 min-w-[256px] z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <textarea
                  className="w-full p-2 border rounded resize-none"
                  value={annotation.content || ''}
                  onChange={(e) => onUpdateAnnotation(annotation.id, { content: e.target.value })}
                  placeholder="Enter your comment..."
                  rows={3}
                />
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
              minWidth: '100px',
              background: selectedAnnotation === annotation.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
          >
            {selectedAnnotation === annotation.id ? (
              <input
                type="text"
                value={annotation.content || ''}
                onChange={(e) => onUpdateAnnotation(annotation.id, { content: e.target.value })}
                className="bg-transparent border-none outline-none w-full"
                placeholder="Enter text..."
                autoFocus
              />
            ) : (
              annotation.content || 'Click to edit'
            )}
          </motion.div>
        );

      case 'draw':
      case 'drawing':
        if (!annotation.points || annotation.points.length < 2) return null;
        return (
          <svg
            key={annotation.id}
            className="absolute inset-0 pointer-events-none"
            style={{ 
              zIndex: 15,
              width: '100%',
              height: '100%',
            }}
          >
            <path
              d={annotation.points
                .map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x * (zoom / 100)} ${point.y * (zoom / 100)}`
                )
                .join(' ')}
              stroke={annotation.color || '#ef4444'}
              strokeWidth={(annotation.strokeWidth || 3) * (zoom / 100)}
              fill="none"
              opacity={annotation.opacity || 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'shape':
        return (
          <motion.div
            key={annotation.id}
            style={{
              ...scaledStyle,
              width: (annotation.width || 0) * (zoom / 100),
              height: (annotation.height || 0) * (zoom / 100),
              border: `${(annotation.strokeWidth || 2) * (zoom / 100)}px solid ${annotation.color}`,
              backgroundColor: 'transparent',
              borderRadius: '4px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
          />
        );

      case 'image':
        return (
          <motion.div
            key={annotation.id}
            style={{
              ...scaledStyle,
              width: (annotation.width || 100) * (zoom / 100),
              height: (annotation.height || 100) * (zoom / 100),
              border: selectedAnnotation === annotation.id ? '2px solid #3b82f6' : 'none',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
            whileHover={{ scale: 1.02 }}
          >
            {annotation.imageUrl && (
              <img
                src={annotation.imageUrl}
                alt="Annotation"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className="relative w-full h-full"
        style={{ pointerEvents: 'auto' }}
      >
        {annotations.map(renderAnnotation)}
      </div>
    </div>
  );
});

// Memoized PDF Renderer with annotation support
const ContinuousPDFRenderer = React.memo(({ 
  file, 
  zoom,
  selectedTool,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onSelectAnnotation,
  onUpdateAnnotation,
  currentPage,
  onLoad, 
  onError,
  onPdfDocLoad
}: {
  file: PDFFile;
  zoom: number;
  selectedTool: string;
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  currentPage: number;
  onLoad: (pageCount: number) => void;
  onError: (error: string) => void;
  onPdfDocLoad: (pdfDoc: any) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesHostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const pdfDocRef = useRef<any>(null);
  const renderTasksRef = useRef<Map<number, any>>(new Map());
  const isInitializedRef = useRef(false);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [showGeminiOptions, setShowGeminiOptions] = useState(false);
  const [geminiOptionsPosition, setGeminiOptionsPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (imageUrl) {
        // Get click position from stored scroll position
        const x = scrollPositionRef.current.x;
        const y = scrollPositionRef.current.y;
        
        onAddAnnotation({
          type: 'image',
          page: currentPage,
          x,
          y,
          width: 100,
          height: 100,
          color: '#000000',
          opacity: 1,
          imageUrl,
        });
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [currentPage, onAddAnnotation]);

  // Handle canvas click for adding annotations
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'select' || !containerRef.current) return;
    
    const rect = (overlayRef.current || containerRef.current).getBoundingClientRect();
    const x = (e.clientX - rect.left) * (100 / zoom);
    const y = (e.clientY - rect.top) * (100 / zoom);

    // Store position for image upload
    scrollPositionRef.current = { x, y };

    // Clear any selected annotation
    onSelectAnnotation(null);

    switch (selectedTool) {
      case 'comment':
        onAddAnnotation({
          type: 'comment',
          page: currentPage,
          x,
          y,
          color: '#3b82f6',
          content: '',
          width: 32,
          height: 32,
          opacity: 1,
        });
        break;

      case 'highlight':
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
        break;

      case 'text':
        onAddAnnotation({
          type: 'text',
          page: currentPage,
          x,
          y,
          color: '#000000',
          content: 'New text',
          fontSize: 16,
          fontFamily: 'Arial',
          opacity: 1,
        });
        break;

      case 'shape':
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
        break;

      case 'image':
        // Trigger file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        break;
    }
  }, [selectedTool, zoom, currentPage, onAddAnnotation, onSelectAnnotation]);

  // Handle drawing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool !== 'draw' || !containerRef.current) return;
    
    const rect = (overlayRef.current || containerRef.current).getBoundingClientRect();
    setIsDrawing(true);
    const point = {
      x: (e.clientX - rect.left) * (100 / zoom),
      y: (e.clientY - rect.top) * (100 / zoom),
    };
    setDrawingPoints([point]);
  }, [selectedTool, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || selectedTool !== 'draw' || !containerRef.current) return;
    
    const rect = (overlayRef.current || containerRef.current).getBoundingClientRect();
    const point = {
      x: (e.clientX - rect.left) * (100 / zoom),
      y: (e.clientY - rect.top) * (100 / zoom),
    };
    setDrawingPoints(prev => [...prev, point]);
  }, [isDrawing, selectedTool, zoom]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawingPoints.length > 1) {
      onAddAnnotation({
        type: 'draw', // Use 'draw' consistently
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

  // Handle text selection for Gemini options
  useEffect(() => {
    const handleMouseUp = () => {
      if (selectedTool !== 'select') {
        setShowGeminiOptions(false);
        setSelectedText(null);
        setSelectionRect(null);
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectionRect(rect);
          setGeminiOptionsPosition({
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - 10, // Position above the selection
          });
          setShowGeminiOptions(true);
        }
      } else {
        setShowGeminiOptions(false);
        setSelectedText(null);
        setSelectionRect(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedTool]);

  // Memoized render single page function
  const renderSinglePage = useCallback(async (page: any, pageNum: number, currentZoom: number): Promise<{ canvas: HTMLCanvasElement; textLayer: HTMLDivElement }> => {
    const baseScale = 1.5;
    const scale = baseScale * (currentZoom / 100);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.cssText = `
      display: block;
      border-radius: 8px;
    `;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const existingTask = renderTasksRef.current.get(pageNum);
    if (existingTask) {
      try {
        existingTask.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
    }

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });
    
    renderTasksRef.current.set(pageNum, renderTask);
    
    try {
      await renderTask.promise;
    } catch (error: any) {
      if (error.name === 'RenderingCancelledException') {
        throw error;
      }
      throw error;
    } finally {
      renderTasksRef.current.delete(pageNum);
    }

    // Create text layer for text selection
    const textLayer = document.createElement('div');
    textLayer.className = 'textLayer';
    textLayer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${canvas.width}px;
      height: ${canvas.height}px;
      overflow: hidden;
      opacity: 0.2;
      line-height: 1.0;
      pointer-events: ${selectedTool === 'select' ? 'auto' : 'none'};
    `;

    try {
      const textContent = await page.getTextContent();
      const pdfjsLib = (window as any).pdfjsLib;
      
      if (pdfjsLib && typeof pdfjsLib.renderTextLayer === 'function') {
        await pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
          textDivs: [],
          enhanceTextSelection: true,
        }).promise;
        
        const textDivs = textLayer.querySelectorAll('div');
        textDivs.forEach((div: HTMLDivElement) => {
          div.style.pointerEvents = selectedTool === 'select' ? 'all' : 'none';
          div.style.userSelect = selectedTool === 'select' ? 'text' : 'none';
          div.style.webkitUserSelect = selectedTool === 'select' ? 'text' : 'none';
          div.style.color = 'transparent';
          div.style.position = 'absolute';
          div.style.whiteSpace = 'pre';
          div.style.cursor = selectedTool === 'select' ? 'text' : 'default';
        });
      }
    } catch (e) {
      console.warn(`Text layer render failed for page ${pageNum}:`, e);
    }
    
    return { canvas, textLayer };
  }, [selectedTool]);

  const renderAllPages = useCallback(async (pdf: any, currentZoom: number) => {
    if (!pagesHostRef.current) return;
    
    const container = pagesHostRef.current;
    container.innerHTML = '';
    
    renderTasksRef.current.forEach((task) => {
      try {
        task.cancel();
      } catch (e) {
        // Ignore cancellation errors
      }
    });
    renderTasksRef.current.clear();
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const { canvas, textLayer } = await renderSinglePage(page, pageNum, currentZoom);
        
        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page-container';
        pageContainer.setAttribute('data-page-number', pageNum.toString());
        pageContainer.style.cssText = `
          position: relative;
          margin: 20px auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          overflow: hidden;
          background: white;
          display: inline-block;
        `;
        
        const pageLabel = document.createElement('div');
        pageLabel.className = 'page-label';
        pageLabel.textContent = `Page ${pageNum}`;
        pageLabel.style.cssText = `
          position: absolute;
          top: -30px;
          left: 0;
          font-size: 12px;
          color: #666;
          font-weight: 500;
          z-index: 10;
        `;
        
        pageContainer.appendChild(pageLabel);
        pageContainer.appendChild(canvas);
        pageContainer.appendChild(textLayer);
        
        container.appendChild(pageContainer);
        
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          continue;
        }
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, [renderSinglePage]);

  // Load PDF only once
  useEffect(() => {
    let isMounted = true;
    
    const loadPDF = async () => {
      if (isInitializedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);

        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              
              const existing = document.querySelector('link[data-pdfjs-viewer]');
              if (!existing) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css';
                link.setAttribute('data-pdfjs-viewer', 'true');
                document.head.appendChild(link);
              }
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load PDF.js'));
            document.head.appendChild(script);
          });
        }

        if (!isMounted) return;

        const pdfjsLib = (window as any).pdfjsLib;
        
        if (!file.url) {
          throw new Error('PDF URL is missing');
        }

        const loadingTask = pdfjsLib.getDocument({
          url: file.url,
          withCredentials: false,
          isEvalSupported: false,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        
        pdfDocRef.current = pdf;
        onPdfDocLoad(pdf);
        isInitializedRef.current = true;
        
        await renderAllPages(pdf, zoom);
        
        if (!isMounted) return;

        setLoading(false);
        onLoad(pdf.numPages);
        
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

    loadPDF();

    return () => {
      isMounted = false;
      renderTasksRef.current.forEach((task) => {
        try {
          task.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      });
      renderTasksRef.current.clear();
    };
  }, [file.url]);

  // Handle zoom changes and tool changes
  useEffect(() => {
    if (pdfDocRef.current && !loading && isInitializedRef.current) {
      renderAllPages(pdfDocRef.current, zoom);
    }
  }, [zoom, selectedTool, renderAllPages, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg font-medium text-gray-800">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Failed</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto bg-gray-50 p-4"
      style={{
        textAlign: 'center',
        userSelect: selectedTool === 'select' ? 'text' : 'none',
        WebkitUserSelect: selectedTool === 'select' ? 'text' : 'none',
        MozUserSelect: selectedTool === 'select' ? 'text' : 'none',
        msUserSelect: selectedTool === 'select' ? 'text' : 'none'
      }}
    >
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      
      <div className="relative inline-block">
        <div ref={pagesHostRef} />
        {/* Overlay layer (handles interactions and drawing) */}
        <div
          ref={overlayRef}
          className="absolute inset-0"
          style={{ 
            cursor: selectedTool === 'draw' ? 'crosshair' : 
                   selectedTool === 'select' ? 'text' : 
                   selectedTool === 'image' ? 'crosshair' :
                   'default' 
          }}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Current drawing path */}
          {isDrawing && drawingPoints.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
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
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          
          {/* Render annotations for current page */}
          <AnnotationOverlay
            annotations={annotations.filter(ann => ann.page === currentPage)}
            selectedAnnotation={selectedAnnotation}
            onSelectAnnotation={onSelectAnnotation}
            onUpdateAnnotation={onUpdateAnnotation}
            zoom={zoom}
            currentPage={currentPage}
            containerWidth={overlayRef.current?.clientWidth || 0}
            containerHeight={overlayRef.current?.clientHeight || 0}
          />
        </div>
      </div>
    </div>
  );
});

// Memoized Thumbnail Component (unchanged)
const PDFThumbnail = React.memo(({ 
  pageNum, 
  isActive, 
  onClick,
  pdfDoc 
}: {
  pageNum: number;
  isActive: boolean;
  onClick: () => void;
  pdfDoc: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const renderTaskRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas || !isMountedRef.current) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 0.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // Ignore cancellation errors
          }
        }

        const task = page.render({
          canvasContext: context,
          viewport: viewport,
        });
        renderTaskRef.current = task;
        
        await task.promise;
        
        if (isMountedRef.current) {
          setIsLoaded(true);
        }
      } catch (error: any) {
        if (error.name === 'RenderingCancelledException') {
          return;
        }
      } finally {
        renderTaskRef.current = null;
      }
    };

    renderThumbnail();
  }, [pdfDoc, pageNum]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
    };
  }, []);

  return (
    <motion.div
      onClick={onClick}
      className={`relative cursor-pointer group mb-3 ${isActive ? 'ring-2 ring-blue-500' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
        {!isLoaded && (
          <div className="w-full h-32 bg-gray-100 animate-pulse flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <span className="text-white text-xs font-medium">Page {pageNum}</span>
        </div>
      </div>
    </motion.div>
  );
});

export default function PDFViewer({
  file,
  zoom: initialZoom,
  onZoomChange,
  selectedTool = 'select',
  annotations = [],
  selectedAnnotation = null,
  onAddAnnotation = () => {},
  onUpdateAnnotation = () => {},
  onSelectAnnotation = () => {},
  currentPage = 1,
  onPageChange = () => {},
  onUndo = () => {},
  onRedo = () => {},
  canUndo = false,
  canRedo = false,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [ready, setReady] = useState(false);
  const [actualPageCount, setActualPageCount] = useState(file.pageCount || 1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVisiblePage, setCurrentVisiblePage] = useState(currentPage);

  const isFileReady = useMemo(() => file && file.url && (
    file.status === 'ready' || 
    file.status === 'completed' || 
    file.status === 'success' ||
    (file.url && !file.status)
  ), [file]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(300, zoom + 25);
    setZoom(newZoom);
    onZoomChange(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(25, zoom - 25);
    setZoom(newZoom);
    onZoomChange(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
    onZoomChange(100);
  }, [onZoomChange]);

  const scrollToPage = useCallback((pageNum: number) => {
    const pageContainer = document.querySelector(`.pdf-page-container[data-page-number="${pageNum}"]`) as HTMLElement;
    if (pageContainer) {
      pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentVisiblePage(pageNum);
      onPageChange(pageNum);
    }
  }, [onPageChange]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleLoad = useCallback((totalPages: number) => {
    setReady(true);
    setActualPageCount(totalPages);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('PDF Error:', error);
    setReady(false);
  }, []);

  const handlePdfDocLoad = useCallback((pdfDoc: any) => {
    setPdfDoc(pdfDoc);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        } else if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          onUndo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, onUndo, onRedo]);

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Sidebar with Thumbnails */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg"
          >
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
              <h3 className="font-semibold text-gray-800">Pages</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {pdfDoc && Array.from({ length: actualPageCount }, (_, i) => i + 1).map(pageNum => (
                <PDFThumbnail
                  key={pageNum}
                  pageNum={pageNum}
                  isActive={pageNum === currentVisiblePage}
                  onClick={() => scrollToPage(pageNum)}
                  pdfDoc={pdfDoc}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </motion.button>
            )}
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{file.name}</h2>
              <p className="text-xs text-gray-500">
                {actualPageCount} pages • Tool: {selectedTool}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                {ready ? 'Ready' : 'Loading...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                disabled={zoom <= 25}
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-3 py-1 hover:bg-gray-200 rounded transition-colors text-sm font-medium"
              >
                {zoom}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                disabled={zoom >= 300}
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => window.print()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <PrinterIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file.url;
                  link.download = file.name;
                  link.click();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main PDF Display Area */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isFileReady ? (
            <ContinuousPDFRenderer
              file={file}
              zoom={zoom}
              selectedTool={selectedTool}
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onAddAnnotation={onAddAnnotation}
              onUpdateAnnotation={onUpdateAnnotation}
              onSelectAnnotation={onSelectAnnotation}
              currentPage={currentVisiblePage}
              onLoad={handleLoad}
              onError={handleError}
              onPdfDocLoad={handlePdfDocLoad}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">PDF Not Available</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {file.status === 'processing' 
                    ? 'Your PDF is being processed. Please wait...' 
                    : 'This PDF file is not ready for viewing.'}
                </p>
                {file.status === 'processing' && (
                  <motion.div
                    className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {!ready && isFileReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/90 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-lg font-medium text-gray-800">Loading PDF...</p>
              <p className="text-sm text-gray-600 mt-2">Preparing annotation tools...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
