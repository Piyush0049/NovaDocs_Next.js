"use client";

import { PDFFile } from "../../page";

interface PDFViewerStatusBarProps {
  file: PDFFile;
  currentPage: number;
  zoom: number;
}

export default function PDFViewerStatusBar({ 
  file, 
  currentPage, 
  zoom 
}: PDFViewerStatusBarProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>Uploaded: {formatDate(file.uploadDate)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Page: {currentPage} of {file.pageCount || 1}</span>
          <span>•</span>
          <span>Zoom: {zoom}%</span>
        </div>
      </div>
    </div>
  );
}
