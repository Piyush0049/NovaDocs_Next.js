"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DocumentTextIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilSquareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../dashboard/page";

interface PDFViewerProps {
  file: PDFFile;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, file.pageCount));

  const actions = [
    { icon: PencilSquareIcon, label: "Edit", action: () => console.log("Edit PDF") },
    { icon: ShareIcon, label: "Share", action: () => console.log("Share PDF") },
    { icon: ArrowDownTrayIcon, label: "Download", action: () => console.log("Download PDF") },
  ];

  return (
    <motion.div
      className="h-full flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm" title={file.name}>
                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file.pageCount} pages • {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <action.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
        
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </motion.button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= file.pageCount) {
                    setCurrentPage(page);
                  }
                }}
                className="w-12 text-center bg-transparent border-none outline-none text-sm"
                min={1}
                max={file.pageCount}
              />
              <span className="text-sm text-gray-500">of {file.pageCount}</span>
            </div>
            
            <motion.button
              onClick={handleNextPage}
              disabled={currentPage === file.pageCount}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleZoomOut}
              disabled={zoom === 50}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </motion.button>
            
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 min-w-[60px] text-center">
              <span className="text-sm font-medium">{zoom}%</span>
            </div>
            
            <motion.button
              onClick={handleZoomIn}
              disabled={zoom === 200}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentPage / file.pageCount) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <motion.div
          className="max-w-full mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: zoom / 100 }}
          transition={{ duration: 0.3 }}
        >
          {/* PDF Page Placeholder */}
          <div className="aspect-[8.5/11] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative">
            
            {/* Loading State */}
            {file.status === 'processing' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-gray-500 dark:text-gray-400">Processing PDF...</p>
                </div>
              </div>
            ) : (
              <div className="p-8 h-full">
                {/* Simulated PDF Content */}
                <div className="h-full space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-1/3 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="text-sm text-gray-500">Page {currentPage}</div>
                  </div>
                  
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Page Number Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentPage} / {file.pageCount}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Uploaded: {file.uploadDate.toLocaleDateString()}</span>
            <span>•</span>
            <span className={`flex items-center gap-1 ${
              file.status === 'ready' ? 'text-green-600 dark:text-green-400' : 
              file.status === 'processing' ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-red-600 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                file.status === 'ready' ? 'bg-green-500' : 
                file.status === 'processing' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              {file.status === 'ready' ? 'Ready' : 
               file.status === 'processing' ? 'Processing' : 'Error'}
            </span>
          </div>
          <div>
            Zoom: {zoom}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
