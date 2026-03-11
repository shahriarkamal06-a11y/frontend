import { Component } from 'react';
import { Home, RefreshCw, AlertTriangle, Bug, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log to error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center px-4">
                    <div className="max-w-2xl w-full">
                        <motion.div 
                            className="bg-white rounded-3xl shadow-2xl shadow-red-500/10 overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Header with Icon */}
                            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-8 text-center">
                                <motion.div
                                    className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                >
                                    <Bug className="h-10 w-10 text-white" />
                                </motion.div>
                                <motion.h1 
                                    className="text-3xl font-bold text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Oops! Something Went Wrong
                                </motion.h1>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                                        <p className="text-amber-800 text-sm">
                                            We've encountered an unexpected error. Our team has been notified and is working on a fix.
                                        </p>
                                    </div>

                                    {this.state.error && (
                                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Error Details</p>
                                            <p className="text-sm text-red-600 font-mono break-all">
                                                {this.state.error.toString()}
                                            </p>
                                            {this.state.errorInfo && (
                                                <details className="mt-2">
                                                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                                                        Stack Trace
                                                    </summary>
                                                    <pre className="mt-2 text-xs text-slate-500 overflow-x-auto p-2 bg-slate-100 rounded">
                                                        {this.state.errorInfo.componentStack}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <motion.button
                                            onClick={this.handleReset}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Reload Application
                                        </motion.button>
                                        <motion.button
                                            onClick={this.handleGoHome}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Home className="h-4 w-4" />
                                            Go to Homepage
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        onClick={() => window.history.back()}
                                        className="mt-6 w-full inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                                        whileHover={{ x: -4 }}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Go back to previous page
                                    </motion.button>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <span>Error ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Particles Animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-red-400/30 rounded-full"
                                    style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${30 + (i % 2) * 40}%`,
                                    }}
                                    animate={{
                                        y: [0, -30, 0],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
