'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { ISBNCheckResponse } from '@/types';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CheckISBNPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isbn, setIsbn] = useState('');
  const [result, setResult] = useState<ISBNCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated || !isAdmin) {
    router.push('/');
    return null;
  }

  const handleCheck = async () => {
    if (!isbn.trim()) {
      setError('ISBN is required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiClient.checkISBN(isbn);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check ISBN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Check ISBN</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <Input
            label="ISBN (10 or 13 digits)"
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="e.g., 9781234567890"
          />

          <Button onClick={handleCheck} disabled={loading || !isbn.trim()}>
            {loading ? <LoadingSpinner size="sm" /> : 'Check ISBN'}
          </Button>

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h3 className="font-semibold mb-2">Check Result</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ISBN:</strong> {result.isbn}</p>
                <p><strong>Message:</strong> {result.message}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className={`p-2 rounded ${result.mightExist ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <strong>Might Exist:</strong> {result.mightExist ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded ${result.definitelyExists ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <strong>Definitely Exists:</strong> {result.definitelyExists ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded ${result.actuallyExists ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <strong>Actually Exists:</strong> {result.actuallyExists ? 'Yes' : 'No'}
                  </div>
                  <div className={`p-2 rounded ${result.isFalsePositive ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <strong>False Positive:</strong> {result.isFalsePositive ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

