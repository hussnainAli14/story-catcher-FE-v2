import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        We encountered an unexpected error. Please try refreshing the page.
      </p>
      {error && (
        <details className="text-left bg-gray-100 p-4 rounded mb-4">
          <summary className="cursor-pointer font-semibold">Error Details</summary>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorBoundary;
