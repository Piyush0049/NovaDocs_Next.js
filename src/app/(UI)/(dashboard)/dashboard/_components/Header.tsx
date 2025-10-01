"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useUser } from "@/contexts/UserContext";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { user, loading, error, fetchProfile, clearProfile } = useUser();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Format member since date
  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      clearProfile();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const ProfileMenu = () => (
    <motion.div
      className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm py-2 z-50"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {user && (
        <>
          {/* Profile Header */}
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>{user.files?.length || 0} PDFs </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <motion.button
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              whileHover={{ x: 4 }}
            >
              <UserCircleIcon className="w-4 h-4 mr-3" />
              View Profile
            </motion.button>
            
            <motion.button
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              whileHover={{ x: 4 }}
            >
              <Cog6ToothIcon className="w-4 h-4 mr-3" />
              Settings
            </motion.button>

            <hr className="my-2 border-gray-200/50 dark:border-gray-700/50" />

            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              whileHover={{ x: 4 }}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
              Sign Out
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <motion.header 
      className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-50 relative"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bars3Icon className="w-6 h-6" />
          </motion.button>

          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NovaDocs
            </h1>
          </motion.div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <motion.input
              type="text"
              placeholder="Search PDFs..."
              className="w-full pl-10 pr-4 py-2 placeholder:text-gray-300 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-300"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-lg text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BellIcon className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Settings */}
          <motion.button
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
              ) : user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : user ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              )}
              
              <div className="hidden lg:block text-left">
                {loading ? (
                  <div className="space-y-1">
                    <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-24 h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                ) : user ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </>
                ) : error ? (
                  <p className="text-sm text-red-500">Error loading profile</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Guest</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Not logged in</p>
                  </>
                )}
              </div>
            </motion.button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && <ProfileMenu />}
          </div>
        </div>
      </div>

      {/* Click outside to close profile menu */}
      {profileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </motion.header>
  );
}
