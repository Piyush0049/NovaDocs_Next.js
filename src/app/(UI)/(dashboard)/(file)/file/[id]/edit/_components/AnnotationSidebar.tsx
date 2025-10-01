"use client";

import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  EyeIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

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
  createdAt: Date;
  updatedAt: Date;
}

interface AnnotationSidebarProps {
  annotations: Annotation[];
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  onClose: () => void;
}

export default function AnnotationSidebar({
  annotations,
  selectedAnnotation,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onClose,
}: AnnotationSidebarProps) {
  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'highlight': return SparklesIcon;
      case 'comment': return ChatBubbleBottomCenterTextIcon;
      case 'text': return EyeIcon;
      case 'drawing': return PencilIcon;
      case 'shape': return Squares2X2Icon;
      default: return PencilIcon;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <motion.div
      className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold text-white">Annotations</h3>
        <motion.button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <XMarkIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {annotations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-4">
              <PencilIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            </div>
            <h4 className="text-gray-300 font-medium mb-2">No annotations yet</h4>
            <p className="text-gray-500 text-sm">
              Select a tool from the toolbar and click on the document to add annotations.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {annotations.map((annotation, index) => {
              const IconComponent = getAnnotationIcon(annotation.type);
              
              return (
                <motion.div
                  key={annotation.id}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedAnnotation === annotation.id
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-lg'
                      : 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onSelectAnnotation(annotation.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${annotation.color}30` }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: annotation.color }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300 capitalize">
                          {annotation.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(annotation.createdAt)}
                        </span>
                      </div>
                      
                      {annotation.content && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {annotation.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>({Math.round(annotation.x)}, {Math.round(annotation.y)})</span>
                        </div>
                        
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this annotation?')) {
                              onDeleteAnnotation(annotation.id);
                            }
                          }}
                          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
