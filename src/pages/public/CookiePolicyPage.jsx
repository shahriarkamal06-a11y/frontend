import { Cookie, Settings, ArrowRight, ToggleLeft, Shield, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStoreSettingsStore } from '../../store';

const CookiePolicyPage = () => {
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: true,
        marketing: false,
        functional: true,
    });
    const storeName = useStoreSettingsStore((state) => state.store.name) || 'our store';

    return (
        <div className="min-h-screen">
            <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-20 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="container mx-auto px-4 lg:px-8 relative text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                        <Cookie className="h-4 w-4" /> Legal
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                        Cookie Policy
                    </h1>
                    <p className="text-white/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Last updated: March 1, 2026
                    </p>
                </div>
            </section>

            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                    <div className="prose prose-slate max-w-none mb-12">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            This Cookie Policy explains how {storeName} uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control our use of them.
                        </p>
                    </div>

                    {/* Cookie Types */}
                    <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>Types of Cookies We Use</h2>
                    <div className="space-y-4 mb-12">
                        {[
                            { icon: Shield, title: 'Strictly Necessary', desc: 'Essential for the website to function. These cannot be disabled.', key: 'necessary', locked: true, examples: 'Session cookies, authentication, cart storage, CSRF protection' },
                            { icon: BarChart3, title: 'Analytics & Performance', desc: 'Help us understand how visitors interact with our website.', key: 'analytics', locked: false, examples: 'Google Analytics, page load times, error tracking, visitor counts' },
                            { icon: Settings, title: 'Functional Cookies', desc: 'Enable enhanced functionality and personalization.', key: 'functional', locked: false, examples: 'Language preferences, theme settings, recently viewed products' },
                            { icon: ToggleLeft, title: 'Marketing Cookies', desc: 'Used to deliver relevant advertisements and track ad performance.', key: 'marketing', locked: false, examples: 'Social media pixels, retargeting cookies, ad conversion tracking' },
                        ].map((cookie, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 group hover:border-violet-200 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                                            <cookie.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">{cookie.title}</h3>
                                            <p className="text-sm text-slate-600 mb-2">{cookie.desc}</p>
                                            <p className="text-xs text-slate-400"><span className="font-medium">Examples:</span> {cookie.examples}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !cookie.locked && setPreferences(prev => ({ ...prev, [cookie.key]: !prev[cookie.key] }))}
                                        className={`shrink-0 w-12 h-6 rounded-full transition-all ${preferences[cookie.key]
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600'
                                                : 'bg-slate-300'
                                            } ${cookie.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                                    >
                                        <div className={`h-5 w-5 bg-white rounded-full shadow-sm transition-transform ${preferences[cookie.key] ? 'translate-x-6.5 ml-[26px]' : 'translate-x-0.5 ml-[2px]'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-6">
                            <h3 className="font-bold text-slate-900 mb-3">How to Manage Cookies</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                You can manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies may impact your ability to use our website. You can also use the toggles above to manage your cookie preferences on our platform.
                            </p>
                        </div>
                        <div className="border-b border-slate-100 pb-6">
                            <h3 className="font-bold text-slate-900 mb-3">Third-Party Cookies</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We may use third-party services that set their own cookies, such as Google Analytics, Stripe (payment processing), and social media platforms. These third parties have their own privacy and cookie policies, which we encourage you to review.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-3">Updates to This Policy</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => setPreferences({ necessary: true, analytics: true, marketing: true, functional: true })}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm shadow-lg shadow-violet-500/25 transition-all"
                        >
                            Accept All Cookies
                        </button>
                        <button
                            onClick={() => setPreferences({ necessary: true, analytics: false, marketing: false, functional: false })}
                            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-200 transition-all"
                        >
                            Necessary Only
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CookiePolicyPage;
