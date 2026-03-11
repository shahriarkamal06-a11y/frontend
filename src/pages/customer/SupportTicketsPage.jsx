import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Search, Filter, Calendar, Clock, CheckCircle, AlertCircle, User, Paperclip, Send, Eye, Reply, ArrowRight, Star } from 'lucide-react';

const SupportTicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tickets from API
    const loadTickets = async () => {
      try {
        // Replace with actual API call
        // const response = await supportAPI.getTickets();
        // setTickets(response.data);
        setTickets([]);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Order Issue',
    priority: 'medium',
    message: '',
    attachments: []
  });

  const categories = ['Order Issue', 'Return/Refund', 'Account', 'Product Question', 'Technical Support', 'Billing'];
  const priorities = ['low', 'medium', 'high'];

  const statusConfig = {
    open: { color: 'bg-blue-50 text-blue-700', icon: MessageSquare, label: 'Open' },
    pending: { color: 'bg-amber-50 text-amber-700', icon: Clock, label: 'Pending' },
    resolved: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Resolved' },
    closed: { color: 'bg-slate-50 text-slate-700', icon: CheckCircle, label: 'Closed' },
  };

  const priorityConfig = {
    low: { color: 'bg-slate-100 text-slate-700', label: 'Low' },
    medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium' },
    high: { color: 'bg-rose-100 text-rose-700', label: 'High' },
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  const handleReply = () => {
    if (replyText.trim() && selectedTicket) {
      // In a real app, this would send the reply to the server
      console.log('Sending reply:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Support Tickets
              </h1>
              <p className="text-slate-600">Get help with your orders and account</p>
            </div>
            <button
              onClick={() => setShowNewTicket(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Open Tickets</span>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{openTickets}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Pending</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{pendingTickets}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Resolved</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{resolvedTickets}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Avg Response Time</span>
                <AlertCircle className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets by ID, subject, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTicket?.id === ticket.id ? 'border-violet-500 shadow-md' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-mono text-slate-600">{ticket.id}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[ticket.priority].color}`}>
                    {priorityConfig[ticket.priority].label}
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">{ticket.subject}</h3>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span>{ticket.category}</span>
                  <span className={`px-2 py-1 rounded-full ${statusConfig[ticket.status].color}`}>
                    {statusConfig[ticket.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{ticket.created}</span>
                  <span>{ticket.messages.length} messages</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-mono">{selectedTicket.id}</span>
                        <span>•</span>
                        <span>{selectedTicket.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[selectedTicket.priority].color}`}>
                          {priorityConfig[selectedTicket.priority].label}
                        </span>
                        <span>•</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[selectedTicket.status].color}`}>
                          {statusConfig[selectedTicket.status].label}
                        </span>
                      </div>
                    </div>
                    {selectedTicket.assignedTo !== 'Unassigned' && (
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Assigned to</p>
                        <p className="font-medium text-slate-900">{selectedTicket.assignedTo}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Created: {selectedTicket.created}</span>
                    <span>•</span>
                    <span>Last updated: {selectedTicket.lastUpdated}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'customer' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'customer' ? 'bg-violet-100' : 'bg-slate-100'
                        }`}>
                          {message.sender === 'customer' ? (
                            <User className="h-4 w-4 text-violet-600" />
                          ) : (
                            <User className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                        <div className={`flex-1 ${message.sender === 'customer' ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">{message.name}</span>
                            <span className="text-xs text-slate-500">{message.timestamp}</span>
                          </div>
                          <div className={`inline-block p-3 rounded-lg ${
                            message.sender === 'customer' ? 'bg-violet-50 text-violet-900' : 'bg-slate-50 text-slate-900'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center gap-1 text-xs bg-white/50 px-2 py-1 rounded">
                                    <Paperclip className="h-3 w-3" />
                                    {attachment}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply */}
                {selectedTicket.status === 'open' && (
                  <div className="p-6 border-t border-slate-100">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all resize-none"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <button className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            Attach File
                          </button>
                          <button
                            onClick={handleReply}
                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Ticket</h3>
                <p className="text-slate-600">Choose a ticket from the list to view details and messages</p>
              </div>
            )}
          </div>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Create New Ticket</h2>
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                >
                  <AlertCircle className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue..."
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all"
                    >
                      {priorities.map(pri => (
                        <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    placeholder="Provide detailed information about your issue..."
                    value={newTicket.message}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-violet-500 focus:bg-white transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attach Files
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 py-3 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketsPage;
