/**
 * Loading Spinner Component
 * Lightweight loading indicator
 */

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;