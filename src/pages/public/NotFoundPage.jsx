import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[12rem] font-black leading-none gradient-text select-none" style={{ fontFamily: 'var(--font-display)' }}>
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-full flex items-center justify-center animate-bounce-in">
                            <ShoppingBag className="h-10 w-10 text-violet-500" />
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    Page Not Found
                </h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all text-sm"
                    >
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                    >
                        <Search className="h-4 w-4" />
                        Browse Products
                    </Link>
                </div>

                <button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back to previous page
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
