"use client";

import { motion } from "framer-motion";
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { PDFFile } from "../../dashboard/page";

interface RecentActivityProps {
  files: PDFFile[];
}

interface ActivityItem {
  id: string;
  type: 'upload' | 'edit' | 'share' | 'delete' | 'view';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  fileId?: string;
  fileName?: string;
}

const activityIcons = {
  upload: CloudArrowUpIcon,
  edit: PencilSquareIcon,
  share: ShareIcon,
  delete: TrashIcon,
  view: DocumentTextIcon,
};

const activityColors = {
  upload: "from-green-500 to-emerald-500",
  edit: "from-blue-500 to-cyan-500",
  share: "from-purple-500 to-pink-500",
  delete: "from-red-500 to-orange-500",
  view: "from-gray-500 to-gray-600",
};

export default function RecentActivity({ files }: RecentActivityProps) {
  // Generate sample activity data based on files
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Add upload activities for each file
    files.forEach(file => {
      activities.push({
        id: `upload-${file.id}`,
        type: 'upload',
        title: 'File Uploaded',
        description: `${file.name} was uploaded successfully`,
        timestamp: file.uploadDate,
        user: 'You',
        fileId: file.id,
        fileName: file.name
      });
    });

    // Add some sample activities
    const sampleActivities: ActivityItem[] = [
      {
        id: 'edit-1',
        type: 'edit',
        title: 'Document Edited',
        description: 'Added annotations to page 3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: 'You',
        fileId: files[0]?.id,
        fileName: files[0]?.name
      },
      {
        id: 'share-1',
        type: 'share',
        title: 'Document Shared',
        description: 'Shared with john@example.com',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        user: 'You',
        fileId: files[1]?.id,
        fileName: files[1]?.name
      },
      {
        id: 'view-1',
        type: 'view',
        title: 'Document Viewed',
        description: 'Opened for editing',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        user: 'You',
        fileId: files[0]?.id,
        fileName: files[0]?.name
      }
    ];

    return [...activities, ...sampleActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Show latest 10 activities
  };

  const activities = generateActivities();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest actions and updates
            </p>
          </div>
          <motion.button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {activities.length > 0 ? (
          <div className="p-6 space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  {/* Activity Icon */}
                  <motion.div
                    className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                        
                        {/* File Reference */}
                        {activity.fileName && (
                          <motion.div
                            className="mt-2 inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <DocumentTextIcon className="w-3 h-3 mr-1" />
                            {activity.fileName.length > 25 
                              ? `${activity.fileName.substring(0, 25)}...` 
                              : activity.fileName
                            }
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex-shrink-0 ml-4">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <UserIcon className="w-3 h-3 mr-1" />
                      {activity.user}
                    </div>
                  </div>

                  {/* Activity Indicator Line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-11 mt-12 w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            className="flex-1 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ClockIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </motion.div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                No recent activity
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-48">
                Start uploading and editing PDFs to see your activity timeline here
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/30">
        <motion.button
          className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All Activity
        </motion.button>
      </div>
    </motion.div>
  );
}
