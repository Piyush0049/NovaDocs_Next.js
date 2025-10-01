"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Set initial progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Start simulated progress updates for UI feedback
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) {
          progress = 90; // Cap at 90% until actual upload completes
          clearInterval(interval);
        }
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }, 200);
      
      // Upload to server using axios with credentials to include cookies
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true, // This ensures cookies are sent with the request
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(percentCompleted, 90) }));
          }
        }
      });
      
      // Clear interval
      clearInterval(interval);
      
      // Set progress to 100%
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      // Remove progress bar after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
      }, 1500);
      
      // Return file data
      return response.data.file;
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.error || error.message || 'Upload failed');
      
      // Remove progress bar
      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });
      
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        // Upload files to server
        const uploadPromises = pdfFiles.map(file => uploadFile(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        
        // Filter out failed uploads
        const successfulUploads = uploadedFiles.filter(file => file !== null);
        
        // Notify parent component about successful uploads
        if (successfulUploads.length > 0) {
          onFileUpload(pdfFiles);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: isUploading
  });

  return (
    <div className="space-y-6">
      
      {/* Upload Area */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload PDFs</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to upload</span>
        </div>

        <motion.div
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isUploading ? "opacity-70 pointer-events-none" : ""
          } ${
            isDragActive || dropzoneActive
              ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
          }`}
          whileHover={{ scale: isUploading ? 1 : 1.02 }}
          whileTap={{ scale: isUploading ? 1 : 0.98 }}
        >
          {/* Dropzone functionality on inner div */}
          <div {...getRootProps()}>
            <input {...getInputProps()} disabled={isUploading} />
            
            {/* Background Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0"
              animate={{ opacity: isDragActive ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ 
                  y: isDragActive ? -10 : 0,
                  rotate: isDragActive ? 5 : 0 
                }}
                transition={{ duration: 0.3 }}
              >
                <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              </motion.div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? "Drop your PDFs here" : "Upload PDF Files"}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Support for PDF files up to 50MB each
              </p>
              
              <motion.button
                type="button"
                className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium ${
                  isUploading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: isUploading ? 1 : 1.05, y: isUploading ? 0 : -2 }}
                whileTap={{ scale: isUploading ? 1 : 0.95 }}
                disabled={isUploading}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                {isUploading ? "Uploading..." : "Choose Files"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Error Message */}
      {uploadError && (
        <motion.div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <XMarkIcon className="w-5 h-5 mr-2" />
            <span>{uploadError}</span>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Uploading...</h3>
          
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <motion.div
              key={fileId}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Uploading PDF...
                  </span>
                </div>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
