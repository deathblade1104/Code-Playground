'use client';

import { Book } from '@/types';
import Link from 'next/link';
import { ShoppingCart, BookOpen, Tag } from 'lucide-react';

interface BookCardProps {
  book: Book;
  showAddToCart?: boolean;
  onAddToCart?: (bookId: number) => void;
}

export default function BookCard({ book, showAddToCart = true, onAddToCart }: BookCardProps) {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(book.id);
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      {/* Book Cover Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <BookOpen className="h-24 w-24 text-blue-400 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300" />
        {book.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {book.title}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
          <span className="text-gray-500 dark:text-gray-400">By</span>
          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{book.author.name}</span>
        </p>

        <div className="flex items-center mb-4">
          <Tag className="h-4 w-4 text-purple-500 dark:text-purple-400 mr-1" />
          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium">
            {book.genre.replace('_', ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{book.description || 'No description available'}</p>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${book.price.toFixed(2)}</span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
            book.stock > 0
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            {book.stock > 0 ? (
              <>
                <span className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full"></span>
                <span>{book.stock} in stock</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 bg-red-500 dark:bg-red-400 rounded-full"></span>
                <span>Out of stock</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/books/${book.id}`}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Details
          </Link>
          {showAddToCart && book.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

