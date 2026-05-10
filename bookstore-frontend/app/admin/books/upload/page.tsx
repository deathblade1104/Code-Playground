'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { PresignedUrlResponse, ISBNCheckResponse } from '@/types';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function UploadBookCoverPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [fileName, setFileName] = useState('');
  const [presignedUrl, setPresignedUrl] = useState<PresignedUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (!isAuthenticated || !isAdmin) {
    router.push('/');
    return null;
  }

  const handleGetPresignedUrl = async () => {
    if (!fileName.trim()) {
      setError('File name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getPresignedUrl({ fileName });
      setPresignedUrl(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get presigned URL');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!presignedUrl || !file) {
      setError('Please get presigned URL and select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload file to S3 using presigned URL
      const response = await fetch(presignedUrl.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      alert(`File uploaded successfully! S3 Path: ${presignedUrl.s3Path}`);
      setPresignedUrl(null);
      setFile(null);
      setFileName('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Book Cover</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <Input
            label="File Name"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="e.g., book-cover.jpg"
          />

          <Button onClick={handleGetPresignedUrl} disabled={loading || !fileName.trim()}>
            {loading ? <LoadingSpinner size="sm" /> : 'Get Presigned URL'}
          </Button>

          {presignedUrl && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold mb-2">Presigned URL Generated</h3>
              <p className="text-sm text-gray-600 mb-2">
                <strong>S3 Path:</strong> {presignedUrl.s3Path}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Expires in:</strong> {presignedUrl.expirationMinutes} minutes
              </p>

              {file && (
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                  {uploading ? <LoadingSpinner size="sm" /> : 'Upload File'}
                </Button>
              )}
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

