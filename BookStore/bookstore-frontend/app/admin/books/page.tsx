'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Book, PageResponse } from '@/types';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';

export default function AdminBooksPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockDelta, setStockDelta] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
      return;
    }
    loadBooks();
  }, [isAuthenticated, isAdmin, router, page]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBooks(page, 20, true); // Include out of stock
      setBooks(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedBook || stockDelta === 0) return;

    setUpdatingStock(true);
    try {
      await apiClient.updateStock(selectedBook.id, stockDelta);
      await loadBooks();
      setSelectedBook(null);
      setStockDelta(0);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
        <Button onClick={() => router.push('/admin/books/create')}>
          Create New Book
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} showAddToCart={false} />
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setStockDelta(0);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Stock Update Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Update Stock: {selectedBook.title}</h2>
            <p className="text-gray-600 mb-4">Current Stock: {selectedBook.stock}</p>

            <div className="mb-4">
              <Input
                label="Stock Change (positive to add, negative to subtract)"
                type="number"
                value={stockDelta || ''}
                onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
              />
              {stockDelta !== 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  New stock will be: {selectedBook.stock + stockDelta}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedBook(null);
                  setStockDelta(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStock}
                disabled={stockDelta === 0 || updatingStock}
              >
                {updatingStock ? <LoadingSpinner size="sm" /> : 'Update Stock'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

