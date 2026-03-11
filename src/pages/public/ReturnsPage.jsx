import { RefreshCw, Clock, CheckCircle2, AlertCircle, ArrowRight, Package, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReturnsPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-20 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="container mx-auto px-4 lg:px-8 relative text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                        <RefreshCw className="h-4 w-4" /> Returns & Refunds
                    </span>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                        Easy Returns & Refunds
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        We want you to love what you buy. If not, returning is simple.
                    </p>
                </div>
            </section>

            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                    {/* Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 -mt-16 relative z-10 mb-16">
                        {[
                            { icon: Clock, title: '30-Day Returns', desc: 'Return within 30 days of delivery', color: 'from-emerald-500 to-teal-500' },
                            { icon: CreditCard, title: 'Full Refund', desc: 'Money back to original payment', color: 'from-violet-500 to-indigo-500' },
                            { icon: Package, title: 'Free Return Shipping', desc: 'We cover return shipping costs', color: 'from-amber-500 to-orange-500' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.06] border border-slate-100 text-center hover-card group">
                                <div className={`h-14 w-14 mx-auto mb-4 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                    <item.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Return Process */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>How to Return an Item</h2>
                    <div className="space-y-4 mb-16">
                        {[
                            { step: 1, title: 'Initiate a Return', desc: 'Go to your Orders page and click "Return Item" on the order you want to return. Select your reason.' },
                            { step: 2, title: 'Pack Your Item', desc: 'Repackage the item in its original packaging. Include all accessories, manuals, and tags.' },
                            { step: 3, title: 'Ship It Back', desc: 'Print the prepaid return label we provide and drop off at any authorized carrier location.' },
                            { step: 4, title: 'Get Your Refund', desc: 'Once we receive and inspect the item, your refund will be processed within 5-7 business days.' },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-colors group">
                                <div className="h-10 w-10 shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                                    {step.step}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-600">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Return Policy Details */}
                    <div className="space-y-6 mb-16">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Eligible for Return
                            </h3>
                            <ul className="space-y-2.5">
                                {[
                                    'Items returned within 30 days of delivery',
                                    'Items in original, unused condition',
                                    'Items with all original packaging and tags',
                                    'Electronics in unopened packaging',
                                    'Clothing items that have not been worn or washed',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-rose-500" /> Not Eligible for Return
                            </h3>
                            <ul className="space-y-2.5">
                                {[
                                    'Items returned after 30 days',
                                    'Items that have been used, damaged, or altered',
                                    'Personalized or custom-made items',
                                    'Digital products and gift cards',
                                    'Intimate apparel and swimwear (hygiene reasons)',
                                    'Items marked as "Final Sale"',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Refund Info */}
                    <div className="bg-violet-50/50 rounded-2xl border border-violet-100 p-8 mb-16">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="h-8 w-8 text-violet-600" />
                            <h3 className="text-xl font-bold text-slate-900">Refund Information</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600">
                            <p>• Refunds are processed to the original payment method used for the purchase.</p>
                            <p>• Credit card refunds may take 5-10 business days to appear on your statement.</p>
                            <p>• PayPal refunds are processed within 3-5 business days.</p>
                            <p>• Original shipping charges are non-refundable unless the return is due to our error.</p>
                            <p>• You will receive an email confirmation once your refund has been processed.</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <p className="text-slate-500 mb-4">Need help with a return?</p>
                        <Link to="/contact">
                            <button className="group px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2 text-sm mx-auto ripple-effect">
                                Contact Support <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReturnsPage;
