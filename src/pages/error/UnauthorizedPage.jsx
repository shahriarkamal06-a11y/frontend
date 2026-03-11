import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Home, ShieldAlert, ArrowLeft, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 401 Illustration */}
                <motion.div 
                    className="relative mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="text-[10rem] font-black leading-none bg-gradient-to-br from-amber-500 to-yellow-600 bg-clip-text text-transparent select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        401
                    </motion.div>
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="h-28 w-28 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            {isAuthenticated ? (
                                <ShieldAlert className="h-12 w-12 text-amber-600" />
                            ) : (
                                <UserX className="h-12 w-12 text-amber-600" />
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-slate-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {isAuthenticated ? 'Access Denied' : 'Authentication Required'}
                </motion.h1>
                
                <motion.p 
                    className="text-slate-500 mb-8 leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {isAuthenticated 
                        ? `Sorry ${user?.name || ''}, you don't have permission to access this page. Please contact an administrator if you believe this is an error.`
                        : 'You need to sign in to access this page. Please log in with your credentials to continue.'
                    }
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {!isAuthenticated && (
                        <motion.button
                            onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </motion.button>
                    )}
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
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-600 transition-colors"
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

export default UnauthorizedPage;
