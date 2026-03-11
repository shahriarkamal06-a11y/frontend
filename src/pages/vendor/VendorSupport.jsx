import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  ChevronRight,
  Search,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Plus,
  Filter,
  MoreVertical,
  Headphones,
  BookOpen,
  Video,
  ExternalLink
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils';

const VendorSupport = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);

  const [tickets, setTickets] = useState([
    {
      id: 'TKT-2026-001',
      subject: 'Payout not received',
      category: 'payments',
      status: 'open',
      priority: 'high',
      createdAt: '2026-03-10T10:30:00Z',
      updatedAt: '2026-03-10T14:20:00Z',
      messages: [
        {
          id: 1,
          sender: 'vendor',
          content: 'I have not received my scheduled payout from March 1st. The status shows completed in my dashboard but the funds are not in my account.',
          timestamp: '2026-03-10T10:30:00Z',
          attachments: []
        },
        {
          id: 2,
          sender: 'support',
          content: 'Thank you for contacting us. I apologize for the inconvenience. Let me check your payout status and get back to you shortly.',
          timestamp: '2026-03-10T14:20:00Z',
          agent: 'Sarah M.',
          attachments: []
        }
      ]
    },
    {
      id: 'TKT-2026-002',
      subject: 'Product listing issue',
      category: 'products',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2026-03-08T16:45:00Z',
      updatedAt: '2026-03-09T09:15:00Z',
      messages: [
        {
          id: 1,
          sender: 'vendor',
          content: 'I am unable to update the images for my product SKU-12345. The upload keeps failing.',
          timestamp: '2026-03-08T16:45:00Z',
          attachments: []
        },
        {
          id: 2,
          sender: 'support',
          content: 'This issue has been resolved. The image upload feature was temporarily down for maintenance. Please try again now.',
          timestamp: '2026-03-09T09:15:00Z',
          agent: 'Mike T.',
          attachments: []
        }
      ]
    },
    {
      id: 'TKT-2026-003',
      subject: 'Account verification',
      category: 'account',
      status: 'pending',
      priority: 'low',
      createdAt: '2026-03-12T11:00:00Z',
      updatedAt: '2026-03-12T11:00:00Z',
      messages: [
        {
          id: 1,
          sender: 'vendor',
          content: 'I submitted my documents for account verification 3 days ago. What is the status?',
          timestamp: '2026-03-12T11:00:00Z',
          attachments: []
        }
      ]
    }
  ]);

  const faqs = [
    {
      question: 'How do I set up my payout method?',
      answer: 'Go to Settings > Payments and connect your bank account or PayPal. You can choose your payout schedule (daily, weekly, or monthly) and set a minimum payout threshold.',
      category: 'payments'
    },
    {
      question: 'What are the fees for selling?',
      answer: 'We charge a 5% platform fee on each sale. There are no monthly or listing fees. Payment processing fees (2.9% + $0.30) are also deducted from each transaction.',
      category: 'payments'
    },
    {
      question: 'How do I handle returns?',
      answer: 'You can manage returns from the Orders page. Click on the order and select "Process Return". You have 48 hours to approve or decline return requests.',
      category: 'orders'
    },
    {
      question: 'Can I offer discount codes?',
      answer: 'Yes! Go to Marketing > Coupons to create discount codes for your products. You can set percentage or fixed amount discounts, usage limits, and expiration dates.',
      category: 'marketing'
    },
    {
      question: 'How do I improve my product visibility?',
      answer: 'Optimize your product titles and descriptions with relevant keywords. Use high-quality images, offer competitive prices, and maintain good customer ratings to appear higher in search results.',
      category: 'products'
    }
  ];

  const resources = [
    { title: 'Vendor Guide', description: 'Complete guide to selling on our platform', icon: BookOpen, link: '#' },
    { title: 'Video Tutorials', description: 'Learn with step-by-step video guides', icon: Video, link: '#' },
    { title: 'API Documentation', description: 'Technical docs for developers', icon: FileText, link: '#' },
    { title: 'Community Forum', description: 'Connect with other vendors', icon: MessageSquare, link: '#' }
  ];

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-rose-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          messages: [...t.messages, {
            id: t.messages.length + 1,
            sender: 'vendor',
            content: newMessage,
            timestamp: new Date().toISOString(),
            attachments: []
          }],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    
    setTickets(updatedTickets);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-8">
        <div className="px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-violet-200 text-sm mt-1">Get help and connect with our team</p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-900">Live Chat</h3>
            <p className="text-sm text-slate-500 mt-1">Chat with our support team</p>
            <button className="mt-4 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-all">
              Start Chat
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900">Email Support</h3>
            <p className="text-sm text-slate-500 mt-1">Get a response within 24 hours</p>
            <a href="mailto:support@example.com" className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all">
              Send Email
            </a>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Phone Support</h3>
            <p className="text-sm text-slate-500 mt-1">Mon-Fri, 9am-6pm EST</p>
            <a href="tel:+1234567890" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">
              +1 (234) 567-890
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-8 w-fit">
          {['tickets', 'faqs', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'tickets' ? 'My Tickets' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'tickets' ? 'Search tickets...' : 'Search FAQs...'}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        {activeTab === 'tickets' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Support Tickets</h2>
              <button 
                onClick={() => setShowNewTicket(true)}
                className="px-4 py-2 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New Ticket
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Last Update</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{ticket.subject}</p>
                            <p className="text-xs text-slate-500 font-mono">{ticket.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 capitalize">{ticket.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{formatRelativeTime(ticket.updatedAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 text-sm">{faq.answer}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
                  {faq.category}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, i) => (
              <a
                key={i}
                href={resource.link}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                      <resource.icon className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{resource.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{resource.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-slate-400" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-slate-500 font-mono">{selectedTicket.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedTicket.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'vendor' 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      {message.sender === 'support' && message.agent && (
                        <p className="text-xs text-slate-500 mb-1">{message.agent}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'vendor' ? 'text-violet-200' : 'text-slate-400'
                      }`}>
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'resolved' && (
                <div className="p-6 border-t border-slate-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorSupport;
