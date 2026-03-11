import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreSettingsStore } from '../../store';

const TermsPage = () => {
    const storeName = useStoreSettingsStore((state) => state.store.name) || 'our store';
    const sections = [
        { title: '1. Acceptance of Terms', content: `By accessing or using ${storeName} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use our platform. We reserve the right to update these terms at any time, and it is your responsibility to review them periodically.` },
        { title: '2. Account Registration', content: 'To access certain features, you must register an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration. We reserve the right to suspend or terminate accounts that violate these terms.' },
        { title: '3. Products and Pricing', content: 'We strive to provide accurate product descriptions and pricing. However, errors may occur. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice. Prices are subject to change without notice. All prices are displayed in USD unless otherwise stated.' },
        { title: '4. Orders and Payment', content: 'By placing an order, you make an offer to purchase the products. We may accept or decline your order at our discretion. Payment must be made at the time of ordering using accepted payment methods. All payments are processed securely through our payment partner, Stripe. You agree to pay all charges incurred by your account.' },
        { title: '5. Shipping and Delivery', content: 'Shipping terms are detailed on our Shipping page. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, weather, or other circumstances outside our control. Risk of loss transfers to the buyer upon delivery to the carrier.' },
        { title: '6. Returns and Refunds', content: 'Our return policy allows returns within 30 days of delivery. Items must be in original, unused condition. Please refer to our Returns page for full details. Refunds are processed to the original payment method within 5-10 business days after we receive the returned item.' },
        { title: '7. Vendor Terms', content: 'Vendors who sell through our platform agree to maintain accurate product listings, fulfill orders promptly, and adhere to our quality standards. We charge a commission on each sale. Vendors are responsible for providing accurate product descriptions, images, and pricing. We reserve the right to remove vendors who violate our terms.' },
        { title: '8. Intellectual Property', content: `All content on the Platform, including text, graphics, logos, images, and software, is the property of ${storeName} or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.` },
        { title: '9. Limitation of Liability', content: `To the maximum extent permitted by law, ${storeName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill arising from your use of the Platform. Our total liability shall not exceed the amount paid by you for the specific product or service giving rise to the claim.` },
        { title: '10. Governing Law', content: 'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles. Any dispute arising from these terms shall be resolved exclusively in the state or federal courts located in San Francisco, California.' },
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
                        <FileText className="h-4 w-4" /> Legal
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in-up" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
                        Terms of Service
                    </h1>
                    <p className="text-white/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Last updated: March 1, 2026
                    </p>
                </div>
            </section>

            <section className="py-16 lg:py-20 bg-white">
                <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <div key={i} className="border-b border-slate-100 pb-8 last:border-0">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
                                <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <p className="text-sm text-slate-600 mb-4">
                            Questions about our terms? Get in touch with our legal team.
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

export default TermsPage;
