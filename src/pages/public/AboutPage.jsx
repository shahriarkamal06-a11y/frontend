import { Link } from 'react-router-dom';
import {
    Zap, Shield, Globe, Users, Heart, Award, ArrowRight,
    Star, Package, Truck, HeadphonesIcon, RefreshCw
} from 'lucide-react';
import { useStoreSettingsStore } from '../../store';
import { formatCurrency } from '../../utils';

const values = [
    {
        icon: Zap,
        title: 'Innovation First',
        description: 'We constantly push boundaries to bring you the latest and most innovative products across every category.',
        gradient: 'from-violet-500 to-indigo-500',
    },
    {
        icon: Shield,
        title: 'Quality Guaranteed',
        description: 'Every product undergoes rigorous quality checks. We stand behind everything we sell with our satisfaction guarantee.',
        gradient: 'from-emerald-500 to-teal-500',
    },
    {
        icon: Globe,
        title: 'Global Marketplace',
        description: 'Connecting thousands of vendors with millions of customers worldwide, creating a borderless shopping experience.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Heart,
        title: 'Customer Obsessed',
        description: 'Our customers are at the heart of everything we do. Your satisfaction is our ultimate measure of success.',
        gradient: 'from-rose-500 to-pink-500',
    },
];

const stats = [
    { value: '50K+', label: 'Products Available' },
    { value: '1M+', label: 'Happy Customers' },
    { value: '500+', label: 'Verified Vendors' },
    { value: '99.9%', label: 'Uptime Guarantee' },
];

const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-Founder', avatar: 'SC', color: 'from-violet-500 to-indigo-500' },
    { name: 'Marcus Johnson', role: 'CTO', avatar: 'MJ', color: 'from-blue-500 to-cyan-500' },
    { name: 'Emily Rodriguez', role: 'VP of Product', avatar: 'ER', color: 'from-emerald-500 to-teal-500' },
    { name: 'David Park', role: 'VP of Design', avatar: 'DP', color: 'from-amber-500 to-orange-500' },
];

const features = [
    { icon: Package, title: 'Curated Selection', desc: 'Hand-picked products from verified vendors worldwide' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over $100 with express options' },
    { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Round-the-clock customer support via chat, email & phone' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free return policy on all purchases' },
];

const AboutPage = () => {
    const store = useStoreSettingsStore((state) => state.store);
    const storeName = store.name || 'our store';
    const freeShippingThreshold = store.shippingConfig?.freeShippingThreshold ?? 100;

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="gradient-mesh py-20 lg:py-32">
                    <div className="container mx-auto px-4 lg:px-8 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                                <Award className="h-4 w-4 text-amber-400" />
                                <span className="text-sm text-white/80 font-medium">Trusted by 1M+ customers worldwide</span>
                            </div>
                            <h1
                                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Redefining the Future of{' '}
                                <span className="gradient-text-warm">eCommerce</span>
                            </h1>
                            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
                                We're building the world's most customizable and scalable eCommerce platform,
                                empowering vendors and delighting customers with a premium shopping experience.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    to="/products"
                                    className="px-8 py-3.5 bg-white text-slate-900 font-semibold rounded-2xl shadow-xl shadow-black/10 hover:shadow-black/20 hover:bg-slate-50 transition-all flex items-center gap-2 text-sm"
                                >
                                    Explore Products <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm"
                                >
                                    Join as Vendor
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative -mt-12 z-10">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-xl shadow-black/[0.03] hover-card"
                            >
                                <p className="text-3xl lg:text-4xl font-bold gradient-text mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    {stat.value}
                                </p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 lg:py-28">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3 block">Our Story</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                                Built by Entrepreneurs, <br />for Entrepreneurs
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Founded in 2024, {storeName} was born from a simple idea: every business deserves
                                a world-class online store without the complexity. We saw small businesses struggling
                                with clunky, expensive platforms and decided to build something better.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                Today, we power thousands of stores across 50+ countries, processing millions of
                                transactions every month. Our platform combines cutting-edge technology with
                                intuitive design, making it possible for anyone to launch, grow, and scale their
                                online business.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">2024</p>
                                    <p className="text-sm text-slate-500">Year Founded</p>
                                </div>
                                <div className="w-px bg-slate-200" />
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">50+</p>
                                    <p className="text-sm text-slate-500">Countries</p>
                                </div>
                                <div className="w-px bg-slate-200" />
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">200+</p>
                                    <p className="text-sm text-slate-500">Team Members</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=500&fit=crop"
                                    alt="Team collaboration"
                                    className="w-full h-80 lg:h-[28rem] object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = '';
                                        e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                                        e.target.style.minHeight = '320px';
                                    }}
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">4.9/5 Rating</p>
                                        <p className="text-xs text-slate-500">From 10K+ reviews</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3 block">Our Values</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            What Drives Us Forward
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover-card group">
                                <div className={`h-12 w-12 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <value.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3 block">Why Choose Us</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            The EcomSaaS Advantage
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group">
                                <div className="h-14 w-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-violet-200 transition-colors">
                                    <feature.icon className="h-7 w-7 text-violet-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {feature.title === 'Fast Delivery'
                                        ? `Free shipping on orders over ${formatCurrency(freeShippingThreshold, store.currency || 'USD')} with express options`
                                        : feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3 block">Leadership</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                            Meet Our Team
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {team.map((member, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover-card">
                                <div className={`h-20 w-20 bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                    <span className="text-2xl font-bold text-white">{member.avatar}</span>
                                </div>
                                <h3 className="font-bold text-slate-900">{member.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="relative gradient-mesh rounded-3xl p-12 lg:p-20 text-center overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                                Ready to Start Selling?
                            </h2>
                            <p className="text-white/70 mb-8 max-w-lg mx-auto">
                                Join thousands of successful vendors on our platform and reach millions of customers worldwide.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    to="/products"
                                    className="px-8 py-3.5 bg-white text-slate-900 font-semibold rounded-2xl shadow-xl hover:bg-slate-50 transition-all text-sm flex items-center gap-2"
                                >
                                    Shop Now <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-2xl hover:bg-white/20 transition-all text-sm"
                                >
                                    Create Your Store
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
