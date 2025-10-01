"use client";

import { motion } from 'framer-motion';
import { 
  CursorArrowRaysIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilIcon,
  Squares2X2Icon,
  PhotoIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface AnnotationToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  annotations: any[];
  onDeleteAnnotation: (id: string) => void;
}

export default function AnnotationToolbar({ 
  selectedTool, 
  onToolChange,
  annotations,
  onDeleteAnnotation 
}: AnnotationToolbarProps) {
  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select', color: 'bg-gray-600' },
    { id: 'highlight', icon: SparklesIcon, label: 'Highlight', color: 'bg-yellow-600' },
    { id: 'comment', icon: ChatBubbleBottomCenterTextIcon, label: 'Comment', color: 'bg-blue-600' },
    { id: 'text', icon: EyeIcon, label: 'Text', color: 'bg-green-600' },
    { id: 'draw', icon: PencilIcon, label: 'Draw', color: 'bg-red-600' },
    { id: 'shape', icon: Squares2X2Icon, label: 'Shape', color: 'bg-purple-600' },
    { id: 'image', icon: PhotoIcon, label: 'Image', color: 'bg-indigo-600' },
  ];

  return (
    <motion.div
      className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-6 gap-2"
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Tools */}
      {tools.map((tool, index) => (
        <motion.button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
            selectedTool === tool.id
              ? `${tool.color} text-white shadow-lg scale-110`
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          }`}
          whileHover={{ scale: selectedTool === tool.id ? 1.1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {tool.label}
          </div>
        </motion.button>
      ))}

      {/* Divider */}
      <div className="w-8 h-px bg-gray-600 my-2" />

      {/* Actions */}
      <motion.button
        className="w-12 h-12 rounded-xl bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 group relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Undo"
      >
        <ArrowUturnLeftIcon className="w-5 h-5" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Undo
        </div>
      </motion.button>

      <motion.button
        className="w-12 h-12 rounded-xl bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 group relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Redo"
      >
        <ArrowUturnRightIcon className="w-5 h-5" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Redo
        </div>
      </motion.button>

      <motion.button
        className="w-12 h-12 rounded-xl bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-200 group relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Clear All"
        onClick={() => {
          if (confirm('Delete all annotations?')) {
            annotations.forEach(ann => onDeleteAnnotation(ann.id));
          }
        }}
      >
        <TrashIcon className="w-5 h-5" />
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Clear All
        </div>
      </motion.button>
    </motion.div>
  );
}
