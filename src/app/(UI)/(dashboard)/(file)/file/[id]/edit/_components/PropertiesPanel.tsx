"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  XMarkIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon
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

interface PropertiesPanelProps {
  annotation: Annotation | undefined;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  annotation,
  onUpdateAnnotation,
  onClose,
}: PropertiesPanelProps) {
  const [localContent, setLocalContent] = useState(annotation?.content || '');

  if (!annotation) return null;

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#000000', '#374151', '#6b7280', '#9ca3af'
  ];

  const handleContentUpdate = () => {
    if (localContent !== annotation.content) {
      onUpdateAnnotation(annotation.id, { content: localContent });
    }
  };

  return (
    <motion.div
      className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Properties</h3>
        </div>
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
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            Annotation Info
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white capitalize">{annotation.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Page:</span>
              <span className="text-white">{annotation.page}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="text-white">
                ({Math.round(annotation.x)}, {Math.round(annotation.y)})
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {(annotation.type === 'comment' || annotation.type === 'text') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Content
            </label>
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleContentUpdate}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter text..."
            />
          </div>
        )}

        {/* Color */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
            <SwatchIcon className="w-4 h-4" />
            Color
          </label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <motion.button
                key={color}
                onClick={() => onUpdateAnnotation(annotation.id, { color })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  annotation.color === color
                    ? 'border-white shadow-lg scale-110'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: annotation.color === color ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={annotation.opacity || 1}
            onChange={(e) => onUpdateAnnotation(annotation.id, { opacity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>{Math.round((annotation.opacity || 1) * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Font Size (for text annotations) */}
        {annotation.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Font Size
            </label>
            <input
              type="range"
              min="8"
              max="72"
              step="2"
              value={annotation.fontSize || 16}
              onChange={(e) => onUpdateAnnotation(annotation.id, { fontSize: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>8px</span>
              <span>{annotation.fontSize || 16}px</span>
              <span>72px</span>
            </div>
          </div>
        )}

        {/* Stroke Width (for drawings and shapes) */}
        {(annotation.type === 'drawing' || annotation.type === 'shape') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Stroke Width
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={annotation.strokeWidth || 2}
              onChange={(e) => onUpdateAnnotation(annotation.id, { strokeWidth: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1px</span>
              <span>{annotation.strokeWidth || 2}px</span>
              <span>10px</span>
            </div>
          </div>
        )}

        {/* Size (for highlights and shapes) */}
        {(annotation.type === 'highlight' || annotation.type === 'shape') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Width
              </label>
              <input
                type="number"
                value={annotation.width || 0}
                onChange={(e) => onUpdateAnnotation(annotation.id, { width: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Height
              </label>
              <input
                type="number"
                value={annotation.height || 0}
                onChange={(e) => onUpdateAnnotation(annotation.id, { height: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="500"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
