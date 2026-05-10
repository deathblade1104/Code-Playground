'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { CartResponse } from '@/types';
import CartItemCard from '@/components/CartItemCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCart();
  }, [isAuthenticated, router]);

  const loadCart = async () => {
    try {
      const cartData = await apiClient.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await apiClient.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item from cart');
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;
    try {
      const updatedCart = await apiClient.editCart({
        items: cart.items.map((item) =>
          item.itemId === itemId ? { bookId: item.bookId, quantity } : { bookId: item.bookId, quantity: item.quantity }
        ),
      });
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      const order = await apiClient.checkout();
      router.push(`/orders/${order.orderNumber}`);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      await apiClient.clearCart();
      await loadCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/books')}>Browse Books</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Items ({cart.totalItems})</h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
            {cart.items.map((item) => (
              <CartItemCard
                key={item.itemId}
                item={item}
                onRemove={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full"
                disabled={checkingOut || cart.items.length === 0}
              >
                {checkingOut ? <LoadingSpinner size="sm" /> : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

