'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Book } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadBook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const loadBook = async () => {
    try {
      if (!params?.id) return;
      const bookData = await apiClient.getBook(Number(params.id));
      setBook(bookData);
    } catch (error) {
      console.error('Failed to load book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!book) return;

    try {
      const cart = await apiClient.getCart();
      const existingItem = cart.items.find((item) => item.bookId === book.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      await apiClient.editCart({
        items: [
          ...cart.items.filter((item) => item.bookId !== book.id).map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
          })),
          { bookId: book.id, quantity: currentQuantity + 1 },
        ],
      });

      alert('Book added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add book to cart');
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

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Book not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {/* Book cover placeholder - you can integrate S3 image URL here */}
            <div className="bg-gray-200 rounded-lg aspect-[3/4] flex items-center justify-center">
              <span className="text-gray-400">Book Cover</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-lg text-gray-600 mb-4">By {book.author.name}</p>

            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                {book.genre}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-blue-600 mb-2">${book.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{book.description || 'No description available'}</p>
            </div>

            <div className="flex space-x-4">
              {book.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => router.push('/cart')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-md font-medium"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

