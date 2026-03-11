import { ShieldCheck, Eye, Lock, Database, Globe, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettingsStore } from '../../store';

const PrivacyPolicyPage = () => {
    const storeName = useStoreSettingsStore((state) => state.store.name) || 'our store';
    const sections = [
        {
            icon: Database,
            title: 'Information We Collect',
            content: [
                'Personal information: name, email address, phone number, shipping/billing address',
                'Account information: username, password (encrypted), account preferences',
                'Payment information: credit card details (processed securely via Stripe)',
                'Usage data: browsing history, search queries, pages visited, time spent on site',
                'Device information: IP address, browser type, operating system, device identifiers',
                'Communication data: emails, chat messages, support requests',
            ]
        },
        {
            icon: Eye,
            title: 'How We Use Your Information',
            content: [
                'Process orders and manage your account',
                'Send order confirmations, shipping updates, and promotional emails',
                'Personalize your shopping experience and recommend products',
                'Improve our website, products, and customer service',
                'Prevent fraud and ensure security of transactions',
                'Comply with legal obligations and resolve disputes',
            ]
        },
        {
            icon: Lock,
            title: 'Data Security',
            content: [
                'All data is encrypted in transit using TLS 1.3 encryption',
                'Payment data is processed by PCI-DSS Level 1 compliant payment processors',
                'We employ firewalls, intrusion detection, and regular security audits',
                'Access to personal data is restricted to authorized personnel only',
                'We conduct regular vulnerability assessments and penetration testing',
                'Backup data is encrypted and stored in geographically distributed data centers',
            ]
        },
        {
            icon: Globe,
            title: 'Data Sharing & Third Parties',
            content: [
                'We do NOT sell your personal information to third parties',
                'We share data with service providers who assist in order fulfillment (shipping carriers)',
                'Payment processors receive only the necessary transaction data',
                'Analytics providers receive anonymized usage data',
                'We may disclose data when required by law or to protect our rights',
                'In the event of a merger or acquisition, data may be transferred with notice to users',
            ]
        },
        {
            icon: UserCheck,
            title: 'Your Rights',
            content: [
                'Access: Request a copy of all personal data we hold about you',
                'Correction: Update or correct inaccurate personal information',
                'Deletion: Request deletion of your personal data (Right to be Forgotten)',
                'Portability: Receive your data in a portable, machine-readable format',
                'Opt-out: Unsubscribe from marketing emails at any time',
                'Restrict processing: Limit how we use your data in certain circumstances',
            ]
        },
    ];

    return (
        <div className="min-h-screen">
            <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-20 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '30px 30px'
                }} />
                <div className="container mx-auto px-4 lg:px-8 relative text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium mb-6 border border-white/10 animate-fade-in-up">
                        <ShieldCheck className="h-4 w-4" /> Legal
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                        Privacy Policy
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
                            At {storeName}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make a purchase, or use our services. Please read this privacy policy carefully. By using our platform, you consent to the data practices described in this statement.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 lg:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                        <section.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                                </div>
                                <ul className="space-y-2.5">
                                    {section.content.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0 mt-2" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-violet-50 rounded-2xl border border-violet-100 text-center">
                        <p className="text-sm text-slate-600 mb-4">
                            If you have questions about our privacy practices, please contact us.
                        </p>
                        <Link to="/contact">
                            <button className="group px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center gap-2 mx-auto">
                                Contact Us <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
