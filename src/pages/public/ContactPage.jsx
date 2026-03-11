import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStoreSettingsStore } from '../../store';
import { formatCurrency } from '../../utils';
import { formatStoreAddress } from '../../utils/storeSettings';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const store = useStoreSettingsStore((state) => state.store);
    const address = formatStoreAddress(store.address);
    const freeShippingThreshold = store.shippingConfig?.freeShippingThreshold ?? 100;
    const contactCards = [
        store.email ? { icon: Mail, title: 'Email Us', info: store.email, desc: 'We reply within 24 hours', color: 'from-violet-500 to-indigo-500' } : null,
        store.phone ? { icon: Phone, title: 'Call Us', info: store.phone, desc: 'Use the number configured in store settings', color: 'from-emerald-500 to-teal-500' } : null,
        address ? { icon: MapPin, title: 'Visit Us', info: address, desc: 'Store address from admin settings', color: 'from-rose-500 to-pink-500' } : null,
    ].filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen">
            <section className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 py-20 lg:py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="container mx-auto px-4 lg:px-8 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                            <MessageCircle className="h-4 w-4" /> Get in Touch
                        </span>
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                            We'd Love to Hear From You
                        </h1>
                        <p className="text-lg text-white/60 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            Have a question, feedback, or need help? Our team is here to assist you.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    {contactCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24 relative z-10 mb-20">
                            {contactCards.map((item, i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 shadow-xl shadow-black/[0.06] border border-slate-100 text-center hover-card group">
                                    <div className={`h-14 w-14 mx-auto mb-5 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        <item.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                                    <p className="font-medium text-violet-600 mb-1 break-words">{item.info}</p>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="-mt-10 mb-20 text-center text-sm text-slate-500">
                            Contact details will appear here when they are configured in admin store settings.
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                Send Us a Message
                            </h2>
                            <p className="text-slate-500 mb-8">Fill out the form below and we'll get back to you soon.</p>

                            {submitted && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    <p className="text-sm font-medium text-emerald-700">Message sent successfully. We'll respond soon.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all input-premium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all input-premium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all input-premium"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all resize-none input-premium"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>
                                <button type="submit" className="group w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm ripple-effect">
                                    <Send className="h-4 w-4" />
                                    Send Message
                                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </button>
                            </form>
                        </div>

                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                                Frequently Asked Questions
                            </h2>
                            <p className="text-slate-500 mb-8">Quick answers to questions you might have.</p>
                            <div className="space-y-4">
                                {[
                                    { q: 'How long does shipping take?', a: `Standard shipping takes 5-7 business days. Express shipping is 2-3 business days. Free shipping starts at ${formatCurrency(freeShippingThreshold, store.currency || 'USD')}.` },
                                    { q: 'What is your return policy?', a: 'We offer a 30-day money-back guarantee on all products. Items must be in original condition with tags attached.' },
                                    { q: 'Do you ship internationally?', a: 'Yes. International shipping availability depends on the options configured in store settings.' },
                                    { q: 'How can I track my order?', a: 'Once your order ships, you will receive a tracking number via email. You can also check your order status in your account.' },
                                    { q: 'How do I contact support?', a: store.email ? `You can reach us at ${store.email}${store.phone ? ` or ${store.phone}` : ''}.` : 'Use the contact form on this page and we will get back to you soon.' },
                                ].map((faq, i) => (
                                    <details key={i} className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 transition-colors">
                                        <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-semibold text-slate-900 list-none">
                                            {faq.q}
                                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open:rotate-90" />
                                        </summary>
                                        <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed -mt-1">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
