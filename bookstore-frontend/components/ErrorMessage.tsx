'use client';

import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({
  title,
  message,
  type = 'error'
}: ErrorMessageProps) {
  const bgColors = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const textColors = {
    error: 'text-red-700 dark:text-red-400',
    warning: 'text-yellow-700 dark:text-yellow-400',
    info: 'text-blue-700 dark:text-blue-400',
  };

  const iconColors = {
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    info: 'text-blue-500 dark:text-blue-400',
  };

  return (
    <div className={`${bgColors[type]} border-2 rounded-xl p-6 max-w-2xl mx-auto`}>
      <div className="flex items-start">
        <AlertCircle className={`h-6 w-6 ${iconColors[type]} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold mb-2 ${textColors[type]}`}>
              {title}
            </h3>
          )}
          <p className={`${textColors[type]} text-sm`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

interface NetworkErrorProps {
  apiUrl?: string;
}

export function NetworkError({ apiUrl = 'http://localhost:8080' }: NetworkErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <WifiOff className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Connect to Backend
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The frontend cannot reach the backend API server.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Troubleshooting Steps:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Ensure the Spring Boot backend is running</li>
                <li>Check if the backend is accessible at: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{apiUrl}</code></li>
                <li>Verify CORS configuration allows requests from <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">http://localhost:3000</code></li>
                <li>Check the browser console for detailed error messages</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Quick Check
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Try accessing the backend directly:
              </p>
              <a
                href={`${apiUrl}/api/books`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
              >
                {apiUrl}/api/books
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

