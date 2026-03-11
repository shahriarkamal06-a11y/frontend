import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Package, CreditCard, Truck, Shield, HelpCircle, RefreshCw, User, MapPin } from 'lucide-react';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState(new Set(['faq1']));

  const categories = [
    {
      id: 'general',
      name: 'General',
      icon: HelpCircle,
      color: 'from-violet-500 to-indigo-500',
      faqs: [
        {
          id: 'faq1',
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for all unused items in their original packaging. Simply contact our customer service team to initiate a return. Refunds are processed within 5-7 business days after we receive the returned item.'
        },
        {
          id: 'faq2',
          question: 'How do I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this number on our Order Tracking page or the carrier\'s website to monitor your package\'s journey.'
        },
        {
          id: 'faq3',
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location. You can check if we ship to your country during checkout.'
        }
      ]
    },
    {
      id: 'shipping',
      name: 'Shipping & Delivery',
      icon: Truck,
      color: 'from-emerald-500 to-teal-500',
      faqs: [
        {
          id: 'faq4',
          question: 'What are your shipping options?',
          answer: 'We offer Standard Shipping (5-7 business days, $9.99), Express Shipping (2-3 business days, $14.99), and Next Day Delivery (1 business day, $24.99). Free standard shipping on orders over $100.'
        },
        {
          id: 'faq5',
          question: 'How long does delivery take?',
          answer: 'Standard orders typically arrive within 5-7 business days. Express orders arrive in 2-3 business days. Next Day Delivery orders arrive the following business day if ordered before 2 PM EST.'
        },
        {
          id: 'faq6',
          question: 'Can I change my shipping address?',
          answer: 'You can update your shipping address within 2 hours of placing your order. After that, please contact our customer service team immediately for assistance.'
        }
      ]
    },
    {
      id: 'payment',
      name: 'Payment & Pricing',
      icon: CreditCard,
      color: 'from-amber-500 to-orange-500',
      faqs: [
        {
          id: 'faq7',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secure and encrypted.'
        },
        {
          id: 'faq8',
          question: 'Is my payment information secure?',
          answer: 'Absolutely. We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed through secure payment gateways.'
        },
        {
          id: 'faq9',
          question: 'Do you offer payment plans?',
          answer: 'Yes, we offer payment plans through our partnership with Affirm for purchases over $100. You can select Affirm at checkout to see available payment options.'
        }
      ]
    },
    {
      id: 'orders',
      name: 'Orders & Returns',
      icon: Package,
      color: 'from-rose-500 to-pink-500',
      faqs: [
        {
          id: 'faq10',
          question: 'How do I cancel or modify my order?',
          answer: 'Orders can be cancelled or modified within 2 hours of placement. After that, please contact customer service immediately. Once an order ships, it cannot be cancelled.'
        },
        {
          id: 'faq11',
          question: 'What if my item arrives damaged?',
          answer: 'If your item arrives damaged, please contact us within 48 hours with photos of the damage. We\'ll arrange for a replacement or full refund, including return shipping if needed.'
        },
        {
          id: 'faq12',
          question: 'How do I return a gift?',
          answer: 'Gift recipients can return items for store credit or exchange. Please include the order number and gift receipt information when initiating the return.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account & Security',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      faqs: [
        {
          id: 'faq13',
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email. Password reset links expire after 24 hours for security.'
        },
        {
          id: 'faq14',
          question: 'Is my personal information protected?',
          answer: 'Yes, we take data privacy seriously. We never sell your personal information and only use it to process orders and improve your shopping experience. See our Privacy Policy for details.'
        },
        {
          id: 'faq15',
          question: 'Can I delete my account?',
          answer: 'Yes, you can request account deletion from your account settings or by contacting customer service. Please note this will remove your order history and saved information.'
        }
      ]
    }
  ];

  const toggleItem = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600">
              Find answers to common questions about our products, services, and policies
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="space-y-8 max-w-4xl mx-auto">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <category.icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{category.name}</h2>
                  <span className="text-sm text-slate-500">({category.faqs.length} questions)</span>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {/* FAQ Items */}
              {expandedCategory === category.id && (
                <div className="border-t border-slate-100">
                  {category.faqs.map((faq, index) => (
                    <div key={faq.id} className={`${index !== category.faqs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-medium text-slate-900 pr-4">{faq.question}</h3>
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        {expandedItems.has(faq.id) && (
                          <p className="mt-3 text-slate-600 leading-relaxed">{faq.answer}</p>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-8 max-w-2xl mx-auto">
            <HelpCircle className="h-12 w-12 text-violet-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Still Need Help?</h2>
            <p className="text-slate-600 mb-6">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 transition-all">
                Contact Support
              </button>
              <button className="px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
