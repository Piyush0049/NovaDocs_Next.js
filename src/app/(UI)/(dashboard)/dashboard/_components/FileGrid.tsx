"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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
        ].map((item, index) => (
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
              className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 border placeholder:text-gray-300 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 w-64"
              whileFocus={{ scale: 1.02 }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border text-gray-300 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
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
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
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
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
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
                className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedFile?.id === file.id 
                    ? 'border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onFileSelect(file)}
              >
                {/* Status Badge */}
                {file.status !== 'ready' && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      file.status === 'processing' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {file.status === 'processing' && <ClockIcon className="w-3 h-3 mr-1" />}
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
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white dark:hover:bg-gray-700"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </button>

                {/* Menu Dropdown */}
                <AnimatePresence>
                  {menuOpen === file.id && <FileMenu file={file} />}
                </AnimatePresence>

                {/* File Preview */}
                <div className="p-6">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    {file.thumbnail && (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.pageCount} pages</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(file.uploadDate)}
                    </p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedFile?.id === file.id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-blue-500 pointer-events-none"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      />
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
                    ? 'border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onFileSelect(file)}
              >
                {/* File Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </h3>
                    {file.status !== 'ready' && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        file.status === 'processing' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {file.status === 'processing' && <ClockIcon className="w-3 h-3 mr-1" />}
                        {file.status === 'processing' ? 'Processing' : 'Error'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{file.pageCount} pages</span>
                    <span>{formatDate(file.uploadDate)}</span>
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
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
