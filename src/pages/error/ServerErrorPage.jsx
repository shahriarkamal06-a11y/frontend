import { Link } from 'react-router-dom';
import { Home, ServerCrash, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ServerErrorPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 500 Illustration */}
                <motion.div 
                    className="relative mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="text-[10rem] font-black leading-none bg-gradient-to-br from-red-500 via-red-600 to-rose-700 bg-clip-text text-transparent select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        500
                    </motion.div>
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="h-28 w-28 bg-gradient-to-br from-red-500/30 to-rose-600/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-500/30">
                            <ServerCrash className="h-12 w-12 text-red-400" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-white mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Internal Server Error
                </motion.h1>
                
                <motion.p 
                    className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Something went wrong on our end. We're working to fix the issue. 
                    Please try again in a few moments.
                </motion.p>

                {/* Animated Server Status */}
                <motion.div 
                    className="flex justify-center gap-2 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-8 rounded-full bg-gradient-to-t from-red-600 to-red-400"
                            animate={{ 
                                scaleY: [0.3, 1, 0.3],
                            }}
                            transition={{ 
                                duration: 0.8, 
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </motion.div>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reload Page
                    </motion.button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-2xl hover:bg-slate-800 hover:text-white transition-all text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </motion.div>

                <motion.div
                    className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Error ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                        If the problem persists, please contact our support team with this error ID.
                    </p>
                </motion.div>

                <motion.button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ x: -4 }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </motion.button>
            </div>
        </div>
    );
};

export default ServerErrorPage;
