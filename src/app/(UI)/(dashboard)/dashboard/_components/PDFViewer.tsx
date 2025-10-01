"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PDFFile } from "../../dashboard/page";
import PDFViewerHeader from "./PDFComponents/PDFViewerHeader";
import PDFViewerToolbar from "./PDFComponents/PDFViewerToolbar";
import PDFViewerContent from "./PDFComponents/PDFViewerContent";
import PDFViewerStatusBar from "./PDFComponents/PDFViewerStatusBar";
import PDFEditor from "./PDFComponents/PDFEditor";
import { useRouter } from "next/navigation";

interface PDFViewerProps {
  file: PDFFile;
  onClose?: () => void;
}

export type ViewMode = 'view' | 'edit';

export default function PDFViewer({ file, onClose }: PDFViewerProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>('view');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, file.pageCount || 1));

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (file.pageCount || 1)) {
      setCurrentPage(page);
    }
  };

  const handleEdit = () => {
    setViewMode('edit');
    router.push(`/file/${file.id}/edit`);
  };

  const handleBackToView = () => {
    setViewMode('view');
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <PDFViewerHeader 
        file={file} 
        viewMode={viewMode}
        onClose={onClose}
        onEdit={handleEdit}
        onBackToView={handleBackToView}
      />

      {/* Conditional Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'edit' ? (
          <PDFEditor 
            key="editor"
            file={file} 
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onBackToView={handleBackToView}
          />
        ) : (
          <motion.div
            key="viewer"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Toolbar */}
            <PDFViewerToolbar
              currentPage={currentPage}
              totalPages={file.pageCount || 1}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onPageChange={handlePageChange}
            />

            {/* PDF Content */}
            <PDFViewerContent
              file={file}
              currentPage={currentPage}
              zoom={zoom}
            />

            {/* Status Bar */}
            <PDFViewerStatusBar
              file={file}
              currentPage={currentPage}
              zoom={zoom}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
