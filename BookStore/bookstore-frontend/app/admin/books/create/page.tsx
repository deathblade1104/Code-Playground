'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Book, Genre, CreateBookRequest, Author } from '@/types';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookOpen, DollarSign, Package, User, Tag, Image, AlertCircle, CheckCircle, X, Upload, Plus, ChevronDown, RefreshCw, Search } from 'lucide-react';

export default function CreateBookPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    authorId: 0,
    genre: Genre.OTHER,
    isbn: '',
    s3Path: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [authorSearchResults, setAuthorSearchResults] = useState<Author[]>([]);
  const [searchingAuthors, setSearchingAuthors] = useState(false);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
      return;
    }
    loadAuthors();

    // Reload authors when page becomes visible (e.g., when returning from create author page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAuthors();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, isAdmin, router]);

  const loadAuthors = async () => {
    try {
      setLoadingAuthors(true);
      const allAuthors = await apiClient.getAllAuthors();
      setAuthors(allAuthors);

      // If authorId is set but selectedAuthor is not, find and set it
      if (formData.authorId && !selectedAuthor) {
        const author = allAuthors.find(a => a.id === formData.authorId);
        if (author) {
          setSelectedAuthor(author);
          setAuthorSearchQuery(author.name);
        }
      }
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoadingAuthors(false);
    }
  };

  const handleAuthorSearch = async (query: string) => {
    setAuthorSearchQuery(query);
    if (query.trim().length >= 1) {
      setSearchingAuthors(true);
      setShowAuthorDropdown(true);
      try {
        const results = await apiClient.searchAuthors(query);
        setAuthorSearchResults(results);
      } catch (error) {
        console.error('Author search failed:', error);
        setAuthorSearchResults([]);
      } finally {
        setSearchingAuthors(false);
      }
    } else {
      setAuthorSearchResults([]);
      setShowAuthorDropdown(true);
    }
  };

  const handleSelectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({ ...formData, authorId: author.id });
    setAuthorSearchQuery(author.name);
    setShowAuthorDropdown(false);
  };

  const handleClearAuthor = () => {
    setSelectedAuthor(null);
    setFormData({ ...formData, authorId: 0 });
    setAuthorSearchQuery('');
    setAuthorSearchResults([]);
    setShowAuthorDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.createBook(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/books');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const response = await apiClient.getPresignedUrl({ fileName: file.name });
      // TODO: Upload file to S3 using presigned URL
      // For now, just set the S3 path
      setFormData({ ...formData, s3Path: response.s3Path });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get upload URL');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-purple-400">
              Create New Book
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg ml-14">
            Add a new book to your collection
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Alert Messages */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg flex items-start space-x-3 animate-slide-in">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg flex items-start space-x-3 animate-slide-in">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Book created successfully! Redirecting...
                </p>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full mr-3"></div>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Title *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    ISBN *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="10 or 13 digits"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Genre *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-gray-100 transition-all"
                    required
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value as Genre })}
                  >
                    {Object.values(Genre).map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-gray-100 transition-all resize-none"
                    rows={5}
                    placeholder="Enter book description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full mr-3"></div>
                Pricing & Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Price *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Stock *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Author & Cover Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full mr-3"></div>
                Author & Cover
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Author *
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={loadAuthors}
                        disabled={loadingAuthors}
                        className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                        title="Refresh authors list"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${loadingAuthors ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/admin/authors/create')}
                        className="flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Author
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        required={!formData.authorId}
                        placeholder="Search for an author..."
                        value={authorSearchQuery}
                        onChange={(e) => handleAuthorSearch(e.target.value)}
                        onFocus={() => {
                          if (authorSearchQuery || authors.length > 0) {
                            setShowAuthorDropdown(true);
                          }
                        }}
                        onBlur={(e) => {
                          // Delay closing to allow click on dropdown items
                          setTimeout(() => {
                            if (!document.querySelector('.author-dropdown:focus-within')) {
                              setShowAuthorDropdown(false);
                            }
                          }, 200);
                        }}
                        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-gray-100 transition-all"
                      />
                      {authorSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearAuthor}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Author Dropdown */}
                    {showAuthorDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowAuthorDropdown(false)}
                        />
                        <div className="author-dropdown absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {searchingAuthors ? (
                            <div className="flex items-center justify-center px-4 py-3 text-gray-600 dark:text-gray-400">
                              <LoadingSpinner size="sm" />
                              <span className="ml-2 text-sm">Searching...</span>
                            </div>
                          ) : authorSearchQuery.trim().length >= 1 ? (
                            authorSearchResults.length > 0 ? (
                              <>
                                {authorSearchResults.map((author) => (
                                    <button
                                    key={author.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent input blur
                                      handleSelectAuthor(author);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors ${
                                      selectedAuthor?.id === author.id
                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                        : ''
                                    }`}
                                  >
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {author.name}
                                    </div>
                                    {author.bio && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                        {author.bio}
                                      </div>
                                    )}
                                  </button>
                                ))}
                                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAuthorDropdown(false);
                                      router.push('/admin/authors/create');
                                    }}
                                    className="flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors w-full"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Create new author "{authorSearchQuery}"
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="px-4 py-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  No authors found matching "{authorSearchQuery}"
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAuthorDropdown(false);
                                    router.push('/admin/authors/create');
                                  }}
                                  className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create new author
                                </button>
                              </div>
                            )
                          ) : authors.length > 0 ? (
                            <>
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                                All Authors
                              </div>
                              {authors.map((author) => (
                                    <button
                                    key={author.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent input blur
                                      handleSelectAuthor(author);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors ${
                                      selectedAuthor?.id === author.id
                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                        : ''
                                    }`}
                                  >
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {author.name}
                                  </div>
                                  {author.bio && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                      {author.bio}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                No authors available
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAuthorDropdown(false);
                                  router.push('/admin/authors/create');
                                }}
                                className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Create first author
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      required
                      value={formData.authorId || ''}
                    />
                  </div>
                  {!formData.authorId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                      Type to search authors or <button type="button" onClick={() => router.push('/admin/authors/create')} className="text-purple-600 dark:text-purple-400 hover:underline">create one</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Image className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Cover Image
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      required
                      placeholder="e.g., covers/book-cover.jpg"
                      value={formData.s3Path}
                      onChange={(e) => setFormData({ ...formData, s3Path: e.target.value })}
                      className="w-full"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                          {uploading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span className="ml-2">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Cover
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      Upload cover image or enter existing S3 path
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="px-8 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Create Book
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

