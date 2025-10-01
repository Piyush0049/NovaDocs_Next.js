"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  DocumentTextIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
  ClockIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../dashboard/page";

interface FileGridProps {
  files: PDFFile[];
  onFileSelect: (file: PDFFile) => void;
  onFileDelete: (fileId: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedFile: PDFFile | null;
}

// Enhanced PDF Thumbnail Component with better error handling and loading states
const PDFThumbnail = ({ url, width = 200, height = 260 }: { url: string; width?: number; height?: number }) => {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const loadPdfJs = async () => {
      try {
        setLoading(true);
        setError(false);

        // Dynamically load PDF.js library
        if (typeof window !== 'undefined' && !window.pdfjsLib) {
          // Load PDF.js library script
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Wait for pdfjsLib to be available
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          await generateThumbnail();
        }
      } catch (err) {
        console.error('Error loading PDF.js:', err);
        if (mountedRef.current) {
          setError(true);
          setLoading(false);
        }
      }
    };

    const generateThumbnail = async () => {
      try {
        if (!window.pdfjsLib) {
          throw new Error('PDF.js library not loaded');
        }

        // Load the PDF document
        const loadingTask = window.pdfjsLib.getDocument({
          url: url,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          disableWorkerFetch: false,
          disableStreamingFetch: false,
        });
        
        const pdf = await loadingTask.promise;
        
        if (!mountedRef.current) return;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Calculate scale
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });

        // Use ref canvas or create new one
        const canvas = canvasRef.current || document.createElement('canvas');
        const context = canvas.getContext('2d', { 
          alpha: false,
          willReadFrequently: true 
        });
        
        if (!context) {
          throw new Error('Could not create canvas context');
        }

        // Set dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Clear and set white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Render the page
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          enableWebGL: false,
          renderInteractiveForms: false,
          background: 'white',
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;
        
        if (!mountedRef.current) return;

        // Convert to data URL with optimized settings
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailSrc(thumbnailDataUrl);
        
        // Clean up
        pdf.destroy();
        
      } catch (err) {
        console.error('Error generating PDF thumbnail:', err);
        if (mountedRef.current) {
          setError(true);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    if (url) {
      loadPdfJs();
    } else {
      setError(true);
      setLoading(false);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, [url, width, height]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl animate-pulse">
        <div className="flex flex-col items-center space-y-3 p-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Loading PDF...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !thumbnailSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
        <div className="text-center p-4">
          <div className="relative inline-block">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">PDF Preview</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Unable to load</p>
        </div>
      </div>
    );
  }

  // Success state - show the thumbnail
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-inner relative group">
      <img
        src={thumbnailSrc}
        alt="PDF Preview"
        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        style={{ 
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onError={() => {
          setError(true);
          setThumbnailSrc('');
        }}
      />
      <canvas 
        ref={canvasRef}
        className="hidden"
        width={width}
        height={height}
      />
      {/* Overlay gradient for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
    </div>
  );
};

// Add window type declaration for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function FileGrid({ 
  files, 
  onFileSelect, 
  onFileDelete, 
  viewMode, 
  onViewModeChange,
  selectedFile 
}: FileGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const filteredFiles = files
    .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'size': return b.size - a.size;
        default: return 0;
      }
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  const handleImageError = (fileId: string) => {
    setImageErrors(prev => new Set(prev).add(fileId));
  };

  const FileMenu = ({ file }: { file: PDFFile }) => (
    <motion.div
      className="absolute right-2 top-2 z-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm py-2 min-w-[160px]">
        {[
          { icon: EyeIcon, label: "Preview", action: () => onFileSelect(file) },
          { icon: PencilSquareIcon, label: "Edit", action: () => console.log("Edit", file.id) },
          { icon: ShareIcon, label: "Share", action: () => console.log("Share", file.id) },
          { icon: TrashIcon, label: "Delete", action: () => onFileDelete(file.id), danger: true }
        ].map((item) => (
          <motion.button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
              item.danger 
                ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My PDFs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredFiles.length} of {files.length} files
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <motion.input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 w-64"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <motion.button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ListBulletIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                className={`group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  selectedFile?.id === file.id 
                    ? 'border-blue-400 dark:border-blue-500 shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/20' 
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => onFileSelect(file)}
              >
                {/* Status Badge */}
                {file.status !== 'ready' && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                      file.status === 'processing' 
                        ? 'bg-yellow-100/90 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 animate-pulse'
                        : 'bg-red-100/90 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {file.status === 'processing' && (
                        <ClockIcon className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      {file.status === 'processing' ? 'Processing' : 'Error'}
                    </span>
                  </div>
                )}

                {/* Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === file.id ? null : file.id);
                  }}
                  className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm shadow-md"
                >
                  <EllipsisVerticalIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Menu Dropdown */}
                <AnimatePresence>
                  {menuOpen === file.id && <FileMenu file={file} />}
                </AnimatePresence>

                {/* PDF Preview Section with Enhanced Styling */}
                <div className="p-4">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-900 mb-4 relative">
                    {file.url && file.status === 'ready' && !imageErrors.has(file.id) ? (
                      <PDFThumbnail url={file.url} width={250} height={320} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <div className="text-center">
                          <div className="relative inline-block">
                            <DocumentTextIcon className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                            {file.status === 'processing' && (
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                <ClockIcon className="w-4 h-4 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {file.status === 'processing' ? 'Processing PDF...' : 'PDF Document'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {file.pageCount || 0} pages
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end">
                      <div className="p-3 text-white w-full">
                        <p className="text-xs font-medium">Click to view</p>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{formatFileSize(file.size)}</span>
                      <span className="flex items-center">
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        {file.pageCount || 0} pages
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      <ClockIcon className="w-3 h-3 inline mr-1" />
                      {formatDate(file.uploadDate)}
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedFile?.id === file.id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute top-3 right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <motion.svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeWidth="3"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                className={`group flex items-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedFile?.id === file.id 
                    ? 'border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onFileSelect(file)}
              >
                {/* Small PDF Preview for List View */}
                <div className="flex-shrink-0 w-14 h-18 rounded-lg overflow-hidden mr-4 shadow-sm bg-gray-100 dark:bg-gray-900">
                  {file.url && file.status === 'ready' && !imageErrors.has(file.id) ? (
                    <PDFThumbnail url={file.url} width={56} height={72} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <DocumentTextIcon className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </h3>
                    {file.status !== 'ready' && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        file.status === 'processing' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {file.status === 'processing' && <ClockIcon className="w-3 h-3 mr-1 animate-spin" />}
                        {file.status === 'processing' ? 'Processing' : 'Error'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-medium">{formatFileSize(file.size)}</span>
                    <span className="flex items-center">
                      <DocumentTextIcon className="w-3 h-3 mr-1" />
                      {file.pageCount || 0} pages
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {formatDate(file.uploadDate)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileSelect(file);
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </motion.button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === file.id ? null : file.id);
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>

                  {/* Menu Dropdown */}
                  <AnimatePresence>
                    {menuOpen === file.id && <FileMenu file={file} />}
                  </AnimatePresence>
                </div>

                {/* Selection Indicator */}
                {selectedFile?.id === file.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No files found' : 'No PDFs uploaded yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? `No files match "${searchTerm}". Try a different search term.` 
              : 'Upload your first PDF to get started with editing and collaboration.'
            }
          </p>
        </motion.div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  );
}
