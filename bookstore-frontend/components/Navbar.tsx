'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen, ShoppingCart, Package, LayoutDashboard, Settings, LogOut, User, Search, ChevronDown, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BookStore
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link
                href="/books"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Books
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/cart"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/books"
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                {/* User Button */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Welcome back</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      {/* Header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user?.name}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <Mail className="h-3 w-3 mr-1" />
                              <span className="truncate">{user?.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3 text-purple-600 dark:text-purple-400" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Package className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
                          My Orders
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
                          Shopping Cart
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>

                      {/* Logout Button */}
                      <div className="p-3">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

