import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, BookOpen, MessageCircle, Mail, ChevronRight, Truck, CreditCard, RefreshCw, ShieldCheck, Settings, User, ArrowRight, ExternalLink } from 'lucide-react';
import { useStoreSettingsStore } from '../../store';

const HelpCenterPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const storeEmail = useStoreSettingsStore((state) => state.store.email);

    const categories = [
        { icon: Truck, title: 'Shipping & Delivery', desc: 'Track orders, shipping methods, and delivery times', link: '/shipping', color: 'from-blue-500 to-cyan-500', articles: 12 },
        { icon: RefreshCw, title: 'Returns & Refunds', desc: 'Return policy, refund process, and exchanges', link: '/returns', color: 'from-emerald-500 to-teal-500', articles: 8 },
        { icon: CreditCard, title: 'Payment & Billing', desc: 'Payment methods, invoices, and billing issues', link: '/help', color: 'from-violet-500 to-indigo-500', articles: 10 },
        { icon: ShieldCheck, title: 'Account & Security', desc: 'Account settings, password, and security', link: '/profile', color: 'from-amber-500 to-orange-500', articles: 7 },
        { icon: Settings, title: 'Product & Orders', desc: 'Product info, order management, and tracking', link: '/orders', color: 'from-rose-500 to-pink-500', articles: 15 },
        { icon: User, title: 'Vendor Support', desc: 'Selling on our platform, commissions, payouts', link: '/vendor', color: 'from-purple-500 to-fuchsia-500', articles: 9 },
    ];

    const popularArticles = [
        { title: 'How to track my order?', category: 'Shipping', views: '12.5K' },
        { title: 'How to request a refund?', category: 'Returns', views: '9.8K' },
        { title: 'Accepted payment methods', category: 'Payment', views: '8.2K' },
        { title: 'How to change my password?', category: 'Account', views: '7.1K' },
        { title: 'Shipping costs and delivery times', category: 'Shipping', views: '6.9K' },
        { title: 'How to become a vendor?', category: 'Vendor', views: '5.4K' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="container mx-auto px-4 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                            <HelpCircle className="h-4 w-4" /> Help Center
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                            How can we help?
                        </h1>
                        <p className="text-lg text-white/60 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            Search our knowledge base or browse categories below
                        </p>

                        {/* Search */}
                        <div className="max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search for articles, topics, questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 text-base bg-white rounded-2xl shadow-2xl shadow-black/10 outline-none focus:ring-4 focus:ring-violet-400/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categories.map((cat, i) => (
                            <Link key={i} to={cat.link} className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover-card transition-all">
                                <div className={`h-12 w-12 mb-4 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <cat.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">{cat.title}</h3>
                                <p className="text-sm text-slate-500 mb-3">{cat.desc}</p>
                                <span className="text-xs font-medium text-violet-600 flex items-center gap-1">
                                    {cat.articles} articles <ChevronRight className="h-3 w-3" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-16 lg:py-20 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                        Popular Articles
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-3">
                        {popularArticles.map((article, i) => (
                            <div key={i} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-violet-700 transition-colors">{article.title}</p>
                                        <p className="text-xs text-slate-400">{article.category} • {article.views} views</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still need help */}
            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                        Still Need Help?
                    </h2>
                    <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                        Can't find what you're looking for? Our support team is ready to help.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/contact">
                            <button className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all flex items-center gap-2 text-sm ripple-effect">
                                <MessageCircle className="h-4 w-4" /> Contact Support
                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </button>
                        </Link>
                        <a href={storeEmail ? `mailto:${storeEmail}` : '/contact'}>
                            <button className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" /> {storeEmail ? 'Email Us' : 'Contact Us'}
                            </button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpCenterPage;
