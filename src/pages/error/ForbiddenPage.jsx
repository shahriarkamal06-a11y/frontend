import { Link } from 'react-router-dom';
import { Home, Lock, Shield, ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 403 Illustration */}
                <motion.div 
                    className="relative mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="text-[10rem] font-black leading-none bg-gradient-to-br from-rose-500 to-pink-600 bg-clip-text text-transparent select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        403
                    </motion.div>
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="h-28 w-28 bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-rose-200">
                            <Lock className="h-12 w-12 text-rose-500" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-slate-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Access Forbidden
                </motion.h1>
                
                <motion.p 
                    className="text-slate-500 mb-8 leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    You don't have permission to access this resource. This area is restricted 
                    and requires special privileges. If you believe this is an error, please contact support.
                </motion.p>

                {/* Security Shield Animation */}
                <motion.div 
                    className="flex justify-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <motion.div
                        className="flex gap-4"
                        animate={{ x: [0, 5, 0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-rose-400"
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <a
                        href="mailto:support@example.com"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:shadow-md transition-all text-sm"
                    >
                        <Mail className="h-4 w-4" />
                        Contact Support
                    </a>
                </motion.div>

                <motion.button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-rose-600 transition-colors"
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

export default ForbiddenPage;
