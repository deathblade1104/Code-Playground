'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { AdminDashboardResponse, LowStockBook } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
      return;
    }
    loadDashboard();
  }, [isAuthenticated, isAdmin, router]);

  const loadDashboard = async () => {
    try {
      const dashboardData = await apiClient.getAdminDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  const stats = dashboard.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Books</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-600">{stats.outOfStockBooks}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completed Orders</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Cancelled Orders</h3>
          <p className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Books */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Low Stock Books</h2>
            <Button
              size="sm"
              onClick={() => router.push('/admin/low-stock')}
            >
              View All
            </Button>
          </div>
          {dashboard.lowStockBooks.length === 0 ? (
            <p className="text-gray-500">No low stock books</p>
          ) : (
            <div className="space-y-3">
              {dashboard.lowStockBooks.slice(0, 5).map((book) => (
                <div key={book.bookId} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {book.currentStock} (Threshold: {book.threshold})
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {dashboard.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recentOrders.slice(0, 5).map((order) => (
                <div key={order.orderNumber} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.userEmail} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push('/admin/books')}
            className="w-full"
          >
            Manage Books
          </Button>
          <Button
            onClick={() => router.push('/admin/books/create')}
            className="w-full"
          >
            Create New Book
          </Button>
          <Button
            onClick={() => router.push('/admin/books/upload')}
            variant="secondary"
            className="w-full"
          >
            Upload Book Cover
          </Button>
          <Button
            onClick={() => router.push('/admin/books/isbn-check')}
            variant="secondary"
            className="w-full"
          >
            Check ISBN
          </Button>
        </div>
      </div>
    </div>
  );
}

