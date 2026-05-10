'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Book } from '@/types';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { NetworkError } from '@/components/ErrorMessage';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setNetworkError(false);
      const response = await apiClient.getBooks(0, 12);
      setBooks(response.content || []);
    } catch (error: any) {
      console.error('Failed to load books:', error);
      // Check if it's a network error
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setNetworkError(true);
        console.error('Backend API is not reachable. Please ensure the backend server is running on http://localhost:8080');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      alert('You need admin privileges to add books. Please contact an administrator.');
      return;
    }
    router.push('/admin/books/create');
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearching(true);
      try {
        const results = await apiClient.searchBooks(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
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

  return (
    <div className="min-h-screen">
      {networkError ? (
        <NetworkError apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'} />
      ) : (
        <>
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                  Welcome to BookStore
                </h1>
                <p className="text-xl md:text-2xl text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
                  Discover your next favorite book from our curated collection
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search for books by title, author, or genre..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl text-lg shadow-xl bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-white/50 dark:focus:ring-gray-600/50 transition-all border border-gray-200"
                    />
                    {searching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-900"/>
              </svg>
            </div>
          </div>

          {/* Books Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {loading ? (
              <div className="flex justify-center py-24">
                <LoadingSpinner size="lg" />
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
                    <Sparkles className="h-16 w-16 text-white animate-bounce" />
                  </div>

                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                    {searchQuery.trim().length >= 2 ? 'No books found' : 'Start Your Collection'}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                    {searchQuery.trim().length >= 2
                      ? 'Try searching with different keywords or explore our full collection.'
                      : 'Every great bookstore starts with a single book. Add yours and begin the journey!'}
                  </p>

                  {!searchQuery && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={() => router.push('/books')}
                        className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1"
                      >
                        <Search className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                        Explore Collection
                        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={handleAddBookClick}
                        className="inline-flex items-center px-10 py-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 text-gray-900 dark:text-gray-100 rounded-2xl text-lg font-bold transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1"
                      >
                        <Sparkles className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
                        Add Your First Book
                      </button>
                    </div>
                  )}

                  {searchQuery.trim().length >= 2 && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold text-lg hover:underline transition-all"
                    >
                      ← Clear search and start over
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Sparkles className="h-8 w-8 text-purple-500 dark:text-purple-400 mr-2" />
                      {searchQuery.trim().length >= 2 ? 'Search Results' : 'Featured Books'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {searchQuery.trim().length >= 2
                        ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                        : 'Handpicked selections for you'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayBooks.map((book, index) => (
                    <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <BookCard book={book} onAddToCart={handleAddToCart} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {!searchQuery && books.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => router.push('/books')}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View All Books
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
