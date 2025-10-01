"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  HandRaisedIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../page";

interface PDFViewerContentProps {
  file: PDFFile;
  currentPage: number;
  zoom: number;
}

const PDFPageFrame = ({
  url,
  pageNumber,
  onLoad,
  onError,
}: {
  url: string;
  pageNumber: number;
  onLoad: () => void;
  onError: () => void;
}) => {
  const src = `${url}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <iframe
      src={src}
      title={`PDF page ${pageNumber}`}
      className="w-full h-full border-0"
      loading="lazy"
      onLoad={onLoad}
      onError={onError}
      style={{ 
        background: 'transparent',
        borderRadius: '12px',
      }}
    />
  );
};

export default function PDFViewerContent({
  file,
  currentPage,
  zoom,
}: PDFViewerContentProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const [isHandTool, setIsHandTool] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle mouse dragging for panning [web:162][web:170]
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isHandTool) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - scrollOffset.x,
      y: e.clientY - scrollOffset.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isHandTool) return;
    
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setScrollOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsHandTool(!isHandTool);
      }
      if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen);
      }
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setIsHandTool(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHandTool, isFullscreen]);

  const toggleHandTool = () => {
    setIsHandTool(!isHandTool);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className={`flex-1 relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
      }`}
    >
      {/* Professional Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <motion.button
          onClick={toggleHandTool}
          className={`p-3 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isHandTool 
              ? 'bg-blue-600 text-white shadow-blue-500/25' 
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Hand Tool (H)"
        >
          <HandRaisedIcon className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={toggleFullscreen}
          className="p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? (
            <ArrowsPointingInIcon className="w-5 h-5" />
          ) : (
            <ArrowsPointingOutIcon className="w-5 h-5" />
          )}
        </motion.button>

        {/* Status Indicator */}
        <div className="px-3 py-2 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            <div className={`w-2 h-2 rounded-full ${
              file.status === 'ready' ? 'bg-green-500' : 
              file.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {isHandTool ? 'Hand Tool Active' : 'Select Mode'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className={`h-full flex items-center justify-center p-6 ${
          isHandTool ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          ref={contentRef}
          style={{
            transform: `scale(${zoom / 100}) translate(${scrollOffset.x}px, ${scrollOffset.y}px)`,
            transformOrigin: "center center",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: zoom / 100,
            x: scrollOffset.x,
            y: scrollOffset.y
          }}
          transition={{ 
            duration: isDragging ? 0 : 0.3,
            ease: "easeOut"
          }}
          className={`relative shadow-2xl rounded-2xl overflow-hidden ${
            isFullscreen ? 'max-w-6xl w-full aspect-[8.5/11]' : 'max-w-4xl w-full aspect-[8.5/11]'
          }`}
        //   style={{
        //     background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        //     border: '1px solid rgba(226, 232, 240, 0.8)',
        //     boxShadow: `
        //       0 25px 50px -12px rgba(0, 0, 0, 0.25),
        //       0 0 0 1px rgba(255, 255, 255, 0.05) inset,
        //       0 1px 0 rgba(255, 255, 255, 0.1) inset
        //     `
        //   }}
        >
          {/* PDF Content */}
          {file.url && file.status === "ready" && !failed ? (
            <>
              {/* Loading Overlay */}
              <AnimatePresence>
                {!ready && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 bg-white/95 backdrop-blur-sm rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="relative"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <motion.div
                        className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-2 border-2 border-blue-300/50 border-b-transparent rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-800 mb-1">
                        Loading Document
                      </p>
                      <p className="text-sm text-gray-500">
                        Page {currentPage} of {file.pageCount || 1}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PDF Frame */}
              <PDFPageFrame
                url={file.url}
                pageNumber={currentPage}
                onLoad={() => setReady(true)}
                onError={() => setFailed(true)}
              />
            </>
          ) : (
            // Error/Processing State
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <motion.div
                className="p-4 rounded-full bg-gray-100 dark:bg-gray-700"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <DocumentTextIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {file.status === "processing" ? "Processing Document" : "Document Unavailable"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {file.status === "processing" 
                    ? "Your PDF is being processed and will be available shortly." 
                    : "This document could not be loaded. Please try again later."}
                </p>
              </div>
            </div>
          )}

          {/* Modern Page Indicator */}
          <motion.div
            className="absolute bottom-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{currentPage}</span>
              <div className="w-1 h-1 bg-white/60 rounded-full" />
              <span className="text-white/80">{file.pageCount || 1}</span>
            </div>
          </motion.div>

          {/* Document Title Overlay */}
          {ready && (
            <motion.div
              className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                {file.name.replace('.pdf', '')}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Instructions Overlay */}
      {/* {isHandTool && (
        <motion.div
          className="absolute bottom-6 left-6 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <HandRaisedIcon className="w-4 h-4" />
            <span>Click and drag to pan • Press H to toggle • ESC to exit</span>
          </div>
        </motion.div>
      )} */}

      {/* Fullscreen Instructions */}
      {isFullscreen && (
        <motion.div
          className="absolute top-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm">Press F or ESC to exit fullscreen</p>
        </motion.div>
      )}
    </div>
  );
}
