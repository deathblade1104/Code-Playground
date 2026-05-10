'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { OrderResponse, OrderStatus } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrder();
  }, [isAuthenticated, orderNumber, router]);

  const loadOrder = async () => {
    try {
      const orderData = await apiClient.getOrder(orderNumber);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium">{item.bookTitle}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <p className="font-bold text-lg">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-xl font-bold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

