"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import PDFEditorCanvas from './PDFEditorCanvas';
import AnnotationToolbar from './AnnotationToolbar';
import AnnotationSidebar from './AnnotationSidebar';
import PropertiesPanel from './PropertiesPanel';

interface PDFFile {
  id: string;
  name: string;
  url: string;
  size: number;
  pageCount: number;
  status: string;
  uploadDate: Date | string;
}

// Updated Annotation interface to match the database model
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
  fontFamily?: string; // This was missing
  opacity?: number;
  strokeWidth?: number;
  points?: Array<{ x: number; y: number }>;
  createdAt: Date;
  updatedAt: Date;
}

interface PDFEditorProps {
  fileId: string;
}

export default function PDFEditor({ fileId }: PDFEditorProps) {
  const router = useRouter();
  const [file, setFile] = useState<PDFFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load file data
  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/files/${fileId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load file');
        }

        const data = await response.json();
        setFile(data.file);
      } catch (error) {
        console.error('Failed to load file:', error);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId]);

  // Load existing annotations
  useEffect(() => {
    if (!file) return;

    const loadAnnotations = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}/annotations`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAnnotations(data.annotations || []);
        }
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    };

    loadAnnotations();
  }, [fileId, file]);

  // Save annotations
  const saveAnnotations = useCallback(async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/files/${fileId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations }),
        credentials: 'include',
      });

      if (response.ok) {
        setHasChanges(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save annotations:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [annotations, hasChanges, fileId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveAnnotations, 30000);
    return () => clearInterval(interval);
  }, [saveAnnotations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveAnnotations();
            break;
          case 'z':
            e.preventDefault();
            // Implement undo
            break;
          case 'y':
            e.preventDefault();
            // Implement redo
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setSelectedAnnotation(null);
        setSelectedTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveAnnotations]);

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setHasChanges(true);
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => 
      prev.map(ann => 
        ann.id === id 
          ? { ...ann, ...updates, updatedAt: new Date() }
          : ann
      )
    );
    setHasChanges(true);
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
    setHasChanges(true);
  }, []);

  const handlePreview = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Save before previewing?')) {
        saveAnnotations();
      }
    }
    window.open(`/file/${fileId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Error Loading File</h2>
          <p className="text-gray-400 mb-4">{error || 'File not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Header */}
      <motion.header
        className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-50"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>
          
          <div>
            <h1 className="text-lg font-semibold text-white truncate max-w-md">
              {file.name.replace('.pdf', '')}
            </h1>
            <p className="text-sm text-gray-400">
              {hasChanges ? 'Unsaved changes' : 'All changes saved'}
              {saving && ' • Saving...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Annotations ({annotations.length})
          </motion.button>

          <motion.button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <EyeIcon className="w-4 h-4" />
            Preview
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShareIcon className="w-4 h-4" />
            Share
          </motion.button>

          <motion.button
            onClick={saveAnnotations}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={hasChanges ? { scale: 1.02 } : {}}
            whileTap={hasChanges ? { scale: 0.98 } : {}}
          >
            <CloudArrowUpIcon className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Annotation Toolbar */}
        <AnnotationToolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          annotations={annotations}
          onDeleteAnnotation={deleteAnnotation}
        />

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <AnnotationSidebar
              annotations={annotations.filter(ann => ann.page === currentPage)}
              selectedAnnotation={selectedAnnotation}
              onSelectAnnotation={setSelectedAnnotation}
              onUpdateAnnotation={updateAnnotation}
              onDeleteAnnotation={deleteAnnotation}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden bg-gray-850">
          <PDFEditorCanvas
            file={file}
            currentPage={currentPage}
            zoom={zoom}
            annotations={annotations.filter(ann => ann.page === currentPage)}
            selectedTool={selectedTool}
            selectedAnnotation={selectedAnnotation}
            onPageChange={setCurrentPage}
            onZoomChange={setZoom}
            onAddAnnotation={addAnnotation}
            onUpdateAnnotation={updateAnnotation}
            onSelectAnnotation={setSelectedAnnotation}
          />
        </div>

        {/* Properties Panel */}
        <AnimatePresence>
          {propertiesOpen && selectedAnnotation && (
            <PropertiesPanel
              annotation={annotations.find(ann => ann.id === selectedAnnotation)}
              onUpdateAnnotation={updateAnnotation}
              onClose={() => setPropertiesOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <motion.div
        className="h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-400"
        initial={{ y: 32 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <span>Page {currentPage} of {file.pageCount}</span>
          <span>•</span>
          <span>{zoom}% zoom</span>
          <span>•</span>
          <span>{annotations.length} annotations</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+S to save</span>
          <span>•</span>
          <span>ESC to deselect</span>
        </div>
      </motion.div>
    </div>
  );
}
