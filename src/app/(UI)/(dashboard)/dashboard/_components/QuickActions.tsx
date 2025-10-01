"use client";

import { motion } from "framer-motion";
import { 
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  LockClosedIcon,
  ScissorsIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const quickActions = [
  {
    title: "Edit PDF",
    description: "Add text, images, and annotations",
    icon: PencilSquareIcon,
    color: "from-blue-500 to-cyan-500",
    action: "edit"
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files",
    icon: DocumentDuplicateIcon,
    color: "from-green-500 to-emerald-500",
    action: "merge"
  },
  {
    title: "Share Document",
    description: "Generate shareable links",
    icon: ShareIcon,
    color: "from-purple-500 to-pink-500",
    action: "share"
  },
  {
    title: "Password Protect",
    description: "Secure your documents",
    icon: LockClosedIcon,
    color: "from-orange-500 to-red-500",
    action: "protect"
  },
  {
    title: "Split PDF",
    description: "Extract specific pages",
    icon: ScissorsIcon,
    color: "from-indigo-500 to-purple-500",
    action: "split"
  },
  {
    title: "OCR Recognition",
    description: "Extract text from scanned PDFs",
    icon: MagnifyingGlassIcon,
    color: "from-teal-500 to-blue-500",
    action: "ocr"
  }
];

export default function QuickActions() {
  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <motion.button
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.action}
            onClick={() => handleAction(action.action)}
            className="group relative p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-3 shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </motion.div>

              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>

            {/* Hover Arrow */}
            <motion.div
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -10 }}
              whileHover={{ x: 0 }}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
