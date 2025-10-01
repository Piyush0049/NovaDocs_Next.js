"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  PaintBrushIcon,
  XMarkIcon,
  CheckIcon,
  ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../page";

interface PDFEditorProps {
  file: PDFFile;
  currentPage: number;
  onPageChange: (page: number) => void;
  onBackToView: () => void;
}

interface Annotation {
  id: string;
  type: 'highlight' | 'comment' | 'drawing';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  content?: string;
}

export default function PDFEditor({ 
  file, 
  currentPage, 
  onPageChange, 
  onBackToView 
}: PDFEditorProps) {
  const [selectedTool, setSelectedTool] = useState<'select' | 'highlight' | 'comment' | 'draw'>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const tools = [
    { id: 'select', icon: XMarkIcon, label: 'Select', color: 'bg-gray-500' },
    { id: 'highlight', icon: PaintBrushIcon, label: 'Highlight', color: 'bg-yellow-500' },
    { id: 'comment', icon: ChatBubbleBottomCenterTextIcon, label: 'Comment', color: 'bg-blue-500' },
    { id: 'draw', icon: PencilIcon, label: 'Draw', color: 'bg-red-500' },
  ] as const;

  const handleSaveAnnotations = async () => {
    try {
      // Here you would typically save annotations to your backend
      console.log('Saving annotations:', annotations);
      
      // Simulate API call
      const response = await fetch(`/api/files/${file.id}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations, pageNumber: currentPage }),
      });

      if (response.ok) {
        alert('Annotations saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save annotations:', error);
      alert('Failed to save annotations');
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'select') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool === 'highlight' ? 'highlight' : selectedTool === 'comment' ? 'comment' : 'drawing',
      x,
      y,
      color: selectedTool === 'highlight' ? '#ffff00' : selectedTool === 'comment' ? '#3b82f6' : '#ef4444',
      width: selectedTool === 'highlight' ? 100 : 20,
      height: selectedTool === 'highlight' ? 20 : 20,
    };

    if (selectedTool === 'comment') {
      const content = prompt('Enter your comment:');
      if (content) {
        newAnnotation.content = content;
        setAnnotations(prev => [...prev, newAnnotation]);
      }
    } else {
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  return (
    <motion.div
      className="flex-1 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Editor Toolbar */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-blue-50/50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
              Annotation Tools:
            </span>
            
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTool === tool.id
                    ? `${tool.color} text-white shadow-lg`
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tool.icon className="w-4 h-4" />
                {tool.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setAnnotations([])}
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Clear All
            </motion.button>

            <motion.button
              onClick={handleSaveAnnotations}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckIcon className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          {selectedTool === 'select' && 'Select and move annotations'}
          {selectedTool === 'highlight' && 'Click and drag to highlight text'}
          {selectedTool === 'comment' && 'Click to add a comment'}
          {selectedTool === 'draw' && 'Click and drag to draw'}
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
          <div 
            className="relative aspect-[8.5/11] bg-white cursor-crosshair"
            onClick={handleCanvasClick}
          >
            {/* PDF Background - you would render the actual PDF here */}
            <div className="absolute inset-0 p-8">
              <div className="h-full space-y-4 opacity-30">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
                  <div className="text-sm text-gray-500">Page {currentPage}</div>
                </div>
                
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annotations Layer */}
            {annotations.map((annotation) => (
              <motion.div
                key={annotation.id}
                className="absolute cursor-pointer"
                style={{
                  left: annotation.x,
                  top: annotation.y,
                  width: annotation.width || 20,
                  height: annotation.height || 20,
                  backgroundColor: annotation.type === 'highlight' ? `${annotation.color}80` : annotation.color,
                  border: annotation.type === 'comment' ? `2px solid ${annotation.color}` : 'none',
                  borderRadius: annotation.type === 'comment' ? '50%' : '4px',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedTool === 'select') {
                    if (window.confirm('Remove this annotation?')) {
                      removeAnnotation(annotation.id);
                    }
                  }
                }}
              >
                {annotation.type === 'comment' && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg text-xs z-10">
                    {annotation.content}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Page indicator */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentPage} / {file.pageCount || 1}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
