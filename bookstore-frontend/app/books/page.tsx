'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, BookOpen, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { NetworkError } from '@/components/ErrorMessage';

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [page]);

  const loadBooks = async () => {
    try {
      setNetworkError(false);
      setLoading(true);
      const response = await apiClient.getBooks(page, 20);
      setBooks(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to load books:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearching(true);
      try {
        const results = await apiClient.searchBooks(query);
        setSearchResults(results);
      } catch (error: any) {
        console.error('Search failed:', error);
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          setNetworkError(true);
        }
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddToCart = async (bookId: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const cart = await apiClient.getCart();
      const existingItem = cart.items.find((item) => item.bookId === bookId);
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      await apiClient.editCart({
        items: [
          ...cart.items.filter((item) => item.bookId !== bookId).map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
          })),
          { bookId, quantity: currentQuantity + 1 },
        ],
      });

      alert('Book added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add book to cart');
    }
  };

  const displayBooks = searchQuery.trim().length >= 2 ? searchResults : books;
  const isSearchMode = searchQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 dark:from-purple-800 dark:via-blue-800 dark:to-purple-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              All Books
            </h1>
          </div>
          <p className="text-purple-100 text-lg mb-8 ml-14">
            Explore our complete collection
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl ml-14">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searching && (
              <div className="mt-4 flex items-center text-white/80">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Searching...</span>
              </div>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {networkError ? (
          <NetworkError />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading books...</p>
          </div>
        ) : displayBooks.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl">
            {/* Beautiful gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-purple-900/30 dark:to-gray-900"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-200/50 via-transparent to-transparent dark:from-purple-500/20"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative text-center py-32 px-4">
              {/* Icon with animation */}
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-8 shadow-2xl animate-pulse">
                <BookOpen className="h-16 w-16 text-white animate-bounce" />
              </div>

              <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                {isSearchMode ? 'No books found' : 'No books available'}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                {isSearchMode
                  ? 'Try searching with different keywords or explore our full collection.'
                  : 'Check back soon for new arrivals!'}
              </p>

              {isSearchMode && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center mb-2">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-purple-500 dark:text-purple-400 mr-2" />
                  {isSearchMode ? 'Search Results' : 'Our Collection'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {isSearchMode
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                    : `Showing ${books.length} of ${totalElements} book${totalElements !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {displayBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <BookCard book={book} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {!isSearchMode && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Page {page + 1} of {totalPages} • {totalElements} total books
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                  <div className="flex items-center space-x-1 px-4">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex items-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

