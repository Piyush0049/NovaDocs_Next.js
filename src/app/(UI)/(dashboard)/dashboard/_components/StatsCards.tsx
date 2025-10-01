"use client";

import { motion } from "framer-motion";
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../dashboard/page";

interface StatsCardsProps {
  files: PDFFile[];
}

export default function StatsCards({ files }: StatsCardsProps) {
  const stats = [
    {
      title: "Total PDFs",
      value: files.length.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: DocumentTextIcon,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Storage Used",
      value: `${(files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)}MB`,
      change: "+8%",
      changeType: "increase" as const,
      icon: CloudArrowUpIcon,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total Views",
      value: "1,284",
      change: "+23%",
      changeType: "increase" as const,
      icon: EyeIcon,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Processing",
      value: files.filter(f => f.status === 'processing').length.toString(),
      change: "0",
      changeType: "neutral" as const,
      icon: ClockIcon,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          {/* Background Gradient */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          
          {/* Card Content */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            
            {/* Icon */}
            <motion.div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4 shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Stats */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              
              <div className="flex items-end justify-between">
                <motion.p 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                >
                  {stat.value}
                </motion.p>
                
                {stat.changeType !== 'neutral' && (
                  <motion.span 
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                  >
                    {stat.change}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Progress Bar for Storage */}
            {stat.title === "Storage Used" && (
              <motion.div
                className="mt-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: index * 0.1 + 0.7 }}
              >
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 1.5, delay: index * 0.1 + 1 }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
