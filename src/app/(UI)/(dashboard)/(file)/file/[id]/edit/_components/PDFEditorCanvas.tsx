"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  PaintBrushIcon,
  Square2StackIcon,
  DocumentDuplicateIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon
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

// Thumbnail Component
const PDFThumbnail = ({ 
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

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: 0.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setIsLoaded(true);
      } catch (error) {
        console.error('Thumbnail render error:', error);
      }
    };

    renderThumbnail();
  }, [pdfDoc, pageNum]);

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
      {isActive && (
        <motion.div
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r"
          layoutId="activeIndicator"
        />
      )}
    </motion.div>
  );
};

// Main PDF Canvas Renderer
const PDFCanvasRenderer = ({ 
  file, 
  currentPage, 
  zoom,
  panOffset,
  onLoad, 
  onError,
  onPdfDocLoad,
  isDragging
}: {
  file: PDFFile;
  currentPage: number;
  zoom: number;
  panOffset: { x: number; y: number };
  onLoad: (pageCount: number) => void;
  onError: (error: string) => void;
  onPdfDocLoad: (pdfDoc: any) => void;
  isDragging: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPDF = async () => {
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
        const totalPages = pdf.numPages;
        
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

        const baseScale = 1.5;
        const scale = baseScale * (zoom / 100);
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
      } catch (err) {
        console.error('Error rendering page:', err);
        throw err;
      }
    };

    if (!pdfDocRef.current) {
      loadPDF();
    } else {
      renderPage(pdfDocRef.current, currentPage).catch(console.error);
    }

    return () => {
      isMounted = false;
    };
  }, [file.url, currentPage, zoom, onLoad, onError, onPdfDocLoad]);

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
      className="relative overflow-hidden"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <canvas
        ref={canvasRef}
        className="shadow-2xl"
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default function PDFEditorCanvas({
  file,
  currentPage: initialPage,
  zoom: initialZoom,
  annotations,
  selectedTool: initialTool,
  selectedAnnotation,
  onPageChange,
  onZoomChange,
  onAddAnnotation,
  onUpdateAnnotation,
  onSelectAnnotation,
}: PDFEditorCanvasProps) {
  // State Management
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(initialZoom);
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [ready, setReady] = useState(false);
  const [actualPageCount, setActualPageCount] = useState(file.pageCount || 1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const lastTouchPosition = useRef<{ x: number; y: number } | null>(null);

  // Check file readiness
  const isFileReady = file && file.url && (
    file.status === 'ready' || 
    file.status === 'completed' || 
    file.status === 'success' ||
    (file.url && !file.status)
  );

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= actualPageCount) {
      setCurrentPage(page);
      onPageChange(page);
      setPanOffset({ x: 0, y: 0 }); // Reset pan on page change
    }
  }, [actualPageCount, onPageChange]);

  // Zoom handlers
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
    setPanOffset({ x: 0, y: 0 });
  }, [onZoomChange]);

  // Touch handlers for pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      pinchStartDistance.current = distance;
    } else if (e.touches.length === 1 && selectedTool === 'pan') {
      lastTouchPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, [selectedTool]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = distance / pinchStartDistance.current;
      const newZoom = Math.min(300, Math.max(25, zoom * scale));
      setZoom(newZoom);
      onZoomChange(newZoom);
      pinchStartDistance.current = distance;
    } else if (e.touches.length === 1 && selectedTool === 'pan' && lastTouchPosition.current) {
      const deltaX = e.touches[0].clientX - lastTouchPosition.current.x;
      const deltaY = e.touches[0].clientY - lastTouchPosition.current.y;
      
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastTouchPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, [zoom, onZoomChange, selectedTool]);

  const handleTouchEnd = useCallback(() => {
    pinchStartDistance.current = null;
    lastTouchPosition.current = null;
  }, []);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'pan') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    } else if (selectedTool === 'draw' && ready) {
      setIsDrawing(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - rect.left - panOffset.x) * (100 / zoom),
        y: (e.clientY - rect.top - panOffset.y) * (100 / zoom),
      };
      setDrawingPoints([point]);
    }
  }, [selectedTool, ready, zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectedTool === 'pan') {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isDrawing && selectedTool === 'draw') {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - rect.left - panOffset.x) * (100 / zoom),
        y: (e.clientY - rect.top - panOffset.y) * (100 / zoom),
      };
      setDrawingPoints(prev => [...prev, point]);
    }
  }, [isDragging, isDrawing, selectedTool, dragStart, zoom, panOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
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
  }, [isDragging, isDrawing, drawingPoints, onAddAnnotation, currentPage]);

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
        }
      } else {
        if (e.key === 'ArrowLeft') {
          handlePageChange(currentPage - 1);
        } else if (e.key === 'ArrowRight') {
          handlePageChange(currentPage + 1);
        } else if (e.key === 'h') {
          setSelectedTool('pan');
        } else if (e.key === 'v') {
          setSelectedTool('select');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange, handleZoomIn, handleZoomOut, handleZoomReset]);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Tool buttons configuration
  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select', shortcut: 'V' },
    { id: 'pan', icon: HandRaisedIcon, label: 'Pan', shortcut: 'H' },
    { id: 'highlight', icon: Square2StackIcon, label: 'Highlight' },
    { id: 'comment', icon: ChatBubbleLeftIcon, label: 'Comment' },
    { id: 'text', icon: DocumentTextIcon, label: 'Text' },
    { id: 'draw', icon: PencilIcon, label: 'Draw' },
    { id: 'shape', icon: DocumentDuplicateIcon, label: 'Shape' },
  ];

  const renderAnnotation = useCallback((annotation: Annotation) => {
    if (annotation.page !== currentPage) return null;

    const scaledStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${annotation.x * (zoom / 100) + panOffset.x}px`,
      top: `${annotation.y * (zoom / 100) + panOffset.y}px`,
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
                <p className="text-sm text-gray-700">{annotation.content}</p>
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
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAnnotation(annotation.id);
            }}
          >
            {annotation.content}
          </motion.div>
        );

      default:
        return null;
    }
  }, [currentPage, zoom, panOffset, selectedAnnotation, onSelectAnnotation]);

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
            {/* Sidebar Header */}
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
              <h3 className="font-semibold text-gray-800">Pages</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Thumbnails List */}
            <div className="flex-1 overflow-y-auto p-4">
              {pdfDoc && Array.from({ length: actualPageCount }, (_, i) => i + 1).map(pageNum => (
                <PDFThumbnail
                  key={pageNum}
                  pageNum={pageNum}
                  isActive={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
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
            {/* Menu Toggle */}
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
            
            {/* File Name */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{file.name}</h2>
              <p className="text-xs text-gray-500">
                Page {currentPage} of {actualPageCount}
              </p>
            </div>
          </div>

          {/* Center Tools */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {tools.map(tool => (
              <motion.button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-2 rounded-lg transition-all relative group ${
                  selectedTool === tool.id
                    ? 'bg-white shadow-md text-blue-600'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tool.icon className="w-5 h-5" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {tool.label}
                    {tool.shortcut && <span className="ml-1 opacity-75">({tool.shortcut})</span>}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
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

            {/* Action Buttons */}
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

        {/* Bottom Navigation Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </motion.button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (!isNaN(page)) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-12 text-center bg-transparent border-none outline-none text-gray-700 text-sm"
                  min={1}
                  max={actualPageCount}
                />
                <span className="text-sm text-gray-500">of {actualPageCount}</span>
              </div>
              
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === actualPageCount}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Current Tool Display */}
            <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {tools.find(t => t.id === selectedTool)?.label || 'Select'}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                {ready ? 'Ready' : 'Loading...'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${(currentPage / actualPageCount) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {Math.round((currentPage / actualPageCount) * 100)}%
            </span>
          </div>
        </div>

        {/* Main PDF Display Area */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          <div
            ref={canvasContainerRef}
            className="w-full h-full overflow-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: selectedTool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 
                     selectedTool === 'draw' ? 'crosshair' : 
                     'default' 
            }}
          >
            {isFileReady ? (
              <div className="flex items-center justify-center min-h-full p-8">
                <div className="relative">
                  <PDFCanvasRenderer
                    file={file}
                    currentPage={currentPage}
                    zoom={zoom}
                    panOffset={panOffset}
                    onLoad={(totalPages) => {
                      setReady(true);
                      setActualPageCount(totalPages);
                    }}
                    onError={(error) => {
                      console.error('PDF Error:', error);
                      setReady(false);
                    }}
                    onPdfDocLoad={(pdfDoc) => {
                      setPdfDoc(pdfDoc);
                    }}
                    isDragging={isDragging}
                  />
                  
                  {/* Annotations Layer */}
                  {ready && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="relative w-full h-full pointer-events-auto"
                        onClick={handleCanvasClick}
                      >
                        {annotations.map(renderAnnotation)}
                        
                        {/* Current drawing path */}
                        {isDrawing && drawingPoints.length > 1 && (
                          <svg className="absolute inset-0 pointer-events-none">
                            <path
                              d={drawingPoints
                                .map((point, index) => 
                                  `${index === 0 ? 'M' : 'L'} ${point.x * (zoom / 100) + panOffset.x} ${point.y * (zoom / 100) + panOffset.y}`
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
                  )}
                </div>
              </div>
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

          {/* Floating Action Buttons (Mobile) */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3 md:hidden">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <DocumentDuplicateIcon className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              onClick={toggleFullscreen}
              className="w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-6 h-6" />
              ) : (
                <ArrowsPointingOutIcon className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <AnimatePresence>
            {selectedTool === 'pan' && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-6 left-6 bg-black/80 text-white px-4 py-2 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <HandRaisedIcon className="w-4 h-4" />
                  <span>Pan Mode: Click and drag to move • Press H to toggle</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                <p className="text-sm text-gray-600 mt-2">Please wait while we prepare your document</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  // Canvas click handler for annotations
  function handleCanvasClick(e: React.MouseEvent) {
    if (selectedTool === 'select' || selectedTool === 'pan' || !ready) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) * (100 / zoom);
    const y = (e.clientY - rect.top - panOffset.y) * (100 / zoom);

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
  }
}
