import { Link } from 'react-router-dom';
import { Home, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BadRequestPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 400 Illustration */}
                <motion.div 
                    className="relative mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="text-[10rem] font-black leading-none bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        400
                    </motion.div>
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="h-28 w-28 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <AlertCircle className="h-12 w-12 text-orange-500" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-slate-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Bad Request
                </motion.h1>
                
                <motion.p 
                    className="text-slate-500 mb-8 leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    The request could not be understood by the server due to malformed syntax. 
                    Please check your input and try again.
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </motion.button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:shadow-md transition-all text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </motion.div>

                <motion.button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-600 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ x: -4 }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </motion.button>
            </div>
        </div>
    );
};

export default BadRequestPage;
