"use client";

import { motion } from "framer-motion";
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../page";
import { ViewMode } from "../PDFViewer";

interface PDFViewerHeaderProps {
  file: PDFFile;
  viewMode: ViewMode;
  onClose?: () => void;
  onEdit: () => void;
  onBackToView: () => void;
}

export default function PDFViewerHeader({ 
  file, 
  viewMode, 
  onClose, 
  onEdit, 
  onBackToView 
}: PDFViewerHeaderProps) {
  
  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this PDF: ${file.name}`,
          url: file.url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(file.url);
      alert('PDF link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.open(file.url, '_blank');
  };

  const actions = viewMode === 'view' ? [
    { icon: PencilSquareIcon, label: "Edit", action: onEdit },
    { icon: ShareIcon, label: "Share", action: handleShare },
    { icon: PrinterIcon, label: "Print", action: handlePrint },
    { icon: ArrowDownTrayIcon, label: "Download", action: handleDownload },
  ] : [];

  return (
    <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {viewMode === 'edit' && (
            <motion.button
              onClick={onBackToView}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
          )}
          
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm" title={file.name}>
              {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
            </h3>
            <p className="text-xs text-gray-200 dark:text-gray-400">
              {file.pageCount || 0} pages • {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          
          {viewMode === 'edit' && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
              Edit Mode
            </span>
          )}
        </div>
        
        {onClose && (
          <motion.button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Action Buttons - Only show in view mode */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              className="flex-1 flex text-gray-300 items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
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
      )}
    </div>
  );
}
