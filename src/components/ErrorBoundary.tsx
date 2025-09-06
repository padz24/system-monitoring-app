/**
 * Error Boundary Component
 * Catches and displays React errors gracefully
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The application encountered an unexpected error. This might be due to network issues or system limitations.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </button>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              If the problem persists, try refreshing or check the browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;