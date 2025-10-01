"use client";

import { motion } from "framer-motion";
import { 
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

interface PDFViewerToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
}

export default function PDFViewerToolbar({
  currentPage,
  totalPages,
  zoom,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
  onPageChange
}: PDFViewerToolbarProps) {
  return (
    <div className="p-4 border-b text-gray-300 border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
      {/* Page Navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onPrevPage}
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
                if (!isNaN(page)) {
                  onPageChange(page);
                }
              }}
              className="w-12 text-center bg-transparent border-none outline-none text-sm"
              min={1}
              max={totalPages}
            />
            <span className="text-sm text-gray-500">of {totalPages}</span>
          </div>
          
          <motion.button
            onClick={onNextPage}
            disabled={currentPage === totalPages}
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
            onClick={onZoomOut}
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
            onClick={onZoomIn}
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
          animate={{ width: `${(currentPage / totalPages) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
