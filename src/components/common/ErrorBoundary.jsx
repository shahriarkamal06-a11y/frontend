import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ 
      error, 
      errorInfo,
      errorCount: this.state.errorCount + 1 
    });
    
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also send to error reporting service here
    // Sentry.captureException(error);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Try to recover by re-rendering
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-rose-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-slate-600 mb-6">
              We apologize for the inconvenience. Our team has been notified and we're working to fix the issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-48">
                <p className="text-xs font-mono text-rose-600 mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-xs text-slate-600">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex justify-center gap-4">
              <Link
                to="/"
                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="text-sm text-slate-600 hover:text-slate-700 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>

            {this.state.errorCount > 1 && (
              <p className="mt-4 text-xs text-rose-600">
                This error has occurred {this.state.errorCount} times. Please contact support if it persists.
              </p>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for individual sections
export const ErrorFallback = ({ error, resetErrorBoundary, title = 'Error loading content' }) => (
  <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl">
    <div className="flex items-center gap-3 mb-3">
      <AlertTriangle className="h-5 w-5 text-rose-600" />
      <h3 className="font-semibold text-rose-900">{title}</h3>
    </div>
    <p className="text-sm text-rose-700 mb-4">
      {error?.message || 'An error occurred while loading this content.'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Try Again
    </button>
  </div>
);

export default ErrorBoundary;
