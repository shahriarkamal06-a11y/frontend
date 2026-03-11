import { Truck, Clock, Globe, Package, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 py-20 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="container mx-auto px-4 lg:px-8 relative text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                        <Truck className="h-4 w-4" /> Shipping Information
                    </span>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                        Shipping & Delivery
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Everything you need to know about getting your orders delivered
                    </p>
                </div>
            </section>

            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                    {/* Shipping Methods */}
                    <h2 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>Shipping Methods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                        {[
                            { icon: Package, title: 'Standard Shipping', time: '5-7 business days', price: '$9.99', desc: 'Free on orders over $100', color: 'from-blue-500 to-cyan-500', popular: false },
                            { icon: Truck, title: 'Express Shipping', time: '2-3 business days', price: '$19.99', desc: 'Fast & reliable', color: 'from-violet-500 to-indigo-500', popular: true },
                            { icon: Clock, title: 'Overnight Shipping', time: 'Next business day', price: '$39.99', desc: 'Order by 2PM EST', color: 'from-amber-500 to-orange-500', popular: false },
                        ].map((method, i) => (
                            <div key={i} className={`relative p-6 rounded-2xl border hover-card transition-all ${method.popular ? 'border-violet-200 bg-violet-50/30 shadow-md' : 'border-slate-100 bg-white'}`}>
                                {method.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full">
                                        Most Popular
                                    </span>
                                )}
                                <div className={`h-12 w-12 mb-4 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center shadow-md`}>
                                    <method.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{method.title}</h3>
                                <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" /> {method.time}
                                </p>
                                <p className="text-2xl font-bold text-slate-900 mb-1">{method.price}</p>
                                <p className="text-xs text-emerald-600 font-medium">{method.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* International */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">International Shipping</h2>
                                <p className="text-sm text-slate-500">We ship to 100+ countries worldwide</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { region: 'North America (US & Canada)', time: '5-7 days', price: 'From $9.99' },
                                { region: 'Europe (EU & UK)', time: '7-14 days', price: 'From $14.99' },
                                { region: 'Asia Pacific', time: '10-18 days', price: 'From $19.99' },
                                { region: 'Rest of World', time: '14-21 days', price: 'From $24.99' },
                            ].map((region, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{region.region}</p>
                                        <p className="text-xs text-slate-500">{region.time}</p>
                                    </div>
                                    <span className="text-sm font-bold text-violet-600">{region.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ-like sections */}
                    <div className="space-y-8">
                        {[
                            { title: 'Order Processing', items: ['Orders are processed within 1-2 business days', 'You\'ll receive a confirmation email once your order ships', 'Tracking information is provided via email', 'Business days exclude weekends and holidays'] },
                            { title: 'Tracking Your Order', items: ['Log in to your account and go to "My Orders"', 'Click on the order to view tracking details', 'You can also use the tracking number in the shipping email', 'Contact support if tracking info is not updating'] },
                            { title: 'Delivery Notes', items: ['Signature may be required for high-value orders', 'Someone must be available to receive the package', 'If delivery is attempted and no one is home, a re-delivery note will be left', 'PO Box addresses are accepted for standard shipping only'] },
                        ].map((section, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
                                <h3 className="font-bold text-lg text-slate-900 mb-4">{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <p className="text-slate-500 mb-4">Still have questions about shipping?</p>
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

export default ShippingPage;
