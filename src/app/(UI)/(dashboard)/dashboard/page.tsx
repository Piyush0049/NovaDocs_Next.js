"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";
import FileUpload from "./_components/FileUpload";
import FileGrid from "./_components/FileGrid";
import PDFViewer from "./_components/PDFViewer";
import QuickActions from "./_components/QuickActions";
import StatsCards from "./_components/StatsCards";
import RecentActivity from "./_components/RecentActivity";

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'error';
  thumbnail: string;
  pageCount: number;
  url: string;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch files from API or local storage
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Check local storage first
        const cached = localStorage.getItem("user_files");
        if (cached) {
          setFiles(JSON.parse(cached));
        }

        // Fetch from API
        const res = await axios.get("/api/files/my-files", { withCredentials: true });
        const fetchedFiles: PDFFile[] = res.data.files.map((f: any) => ({
          id: f._id,
          name: f.originalName,
          size: f.size,
          uploadDate: f.createdAt ? new Date(f.createdAt) : new Date(),
          status: 'ready',
          thumbnail: f.thumbnail || '/pdf-thumb-placeholder.jpg',
          pageCount: f.pageCount || 0,
          url: f.url,
        }));

        setFiles(fetchedFiles);

        // Update local storage
        localStorage.setItem("user_files", JSON.stringify(fetchedFiles));
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  // Handle file upload
  const handleFileUpload = (newFiles: File[]) => {
    const uploadedFiles: PDFFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      status: 'processing',
      thumbnail: '/pdf-thumb-placeholder.jpg',
      pageCount: 0,
      url: URL.createObjectURL(file)
    }));

    // Update UI immediately
    setFiles(prev => [...uploadedFiles, ...prev]);

    // Update local storage
    const updatedFiles = [...uploadedFiles, ...files];
    localStorage.setItem("user_files", JSON.stringify(updatedFiles));

    // Simulate processing
    uploadedFiles.forEach((file, index) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
  f.id === file.id
    ? {
        id: f.id,
        name: f.name,
        size: f.size,
        uploadDate: f.uploadDate,
        status: 'ready',  // literal type
        thumbnail: f.thumbnail,
        pageCount: Math.floor(Math.random() * 20) + 1,
        url: f.url
      }
    : f
));

      }, (index + 1) * 2000);
    });
  };

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);

      // Update local storage
      localStorage.setItem("user_files", JSON.stringify(updated));
      return updated;
    });

    if (selectedFile?.id === fileId) setSelectedFile(null);
  };

  return (
    <div className="h-screen min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden z-[100000]">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 30, repeat: Infinity }} />
        <motion.div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-yellow-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 35, repeat: Infinity }} />
      </div>

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'} overflow-hidden`}>
          <div className="h-full flex">

            {/* Left Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <StatsCards files={files} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                  <QuickActions />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                  <FileUpload onFileUpload={handleFileUpload} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                  <FileGrid files={files} onFileSelect={setSelectedFile} onFileDelete={handleFileDelete} viewMode={viewMode} onViewModeChange={setViewMode} selectedFile={selectedFile} />
                </motion.div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-96 border-l border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="h-full flex flex-col">
                {selectedFile ? <PDFViewer file={selectedFile} /> : <div className="flex-1 p-6"><RecentActivity files={files} /></div>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
