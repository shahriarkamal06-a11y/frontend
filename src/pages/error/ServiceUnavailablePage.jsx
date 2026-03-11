import { Link } from 'react-router-dom';
import { Home, Clock, Wrench, ArrowLeft, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceUnavailablePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 503 Illustration */}
                <motion.div 
                    className="relative mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="text-[10rem] font-black leading-none bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 bg-clip-text text-transparent select-none"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        503
                    </motion.div>
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <div className="h-28 w-28 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-slate-300">
                            <Wrench className="h-12 w-12 text-slate-600" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.h1 
                    className="text-3xl font-bold text-slate-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Service Unavailable
                </motion.h1>
                
                <motion.p 
                    className="text-slate-500 mb-6 leading-relaxed max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    We're currently performing maintenance or experiencing high traffic. 
                    Our team is working hard to restore full service as quickly as possible.
                </motion.p>

                {/* Maintenance Timer Animation */}
                <motion.div 
                    className="flex justify-center items-center gap-3 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                >
                    <motion.div
                        className="flex flex-col items-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Working on it</span>
                    </motion.div>
                </motion.div>

                {/* Progress Bar */}
                <motion.div 
                    className="max-w-xs mx-auto mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: ["0%", "70%", "60%", "85%", "75%"] }}
                            transition={{ 
                                duration: 8, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>Maintenance in progress</span>
                        <span>Estimated: 30 min</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-2xl shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40 transition-all text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Clock className="h-4 w-4" />
                        Check Status
                    </motion.button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:shadow-md transition-all text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </motion.div>

                <motion.div
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Bell className="h-4 w-4" />
                    <span>We'll be back shortly</span>
                </motion.div>

                <motion.button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ x: -4 }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </motion.button>
            </div>
        </div>
    );
};

export default ServiceUnavailablePage;
