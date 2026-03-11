import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, MoreVertical,
  Trash2, Phone, Mail, ChevronDown, Check, CheckCheck, ShoppingBag,
  Headphones, Volume2, VolumeX, ArrowDown, CornerDownLeft, WifiOff,
  Package, MapPin, RefreshCw, CreditCard, Lock, Globe, Moon, Bell,
  HelpCircle, FileText, LogOut, History, Truck, Home, Heart, Tag,
  Calculator, Ruler, MessageSquare, Download, Shield, AlertTriangle,
  Star, Gift, Smile, Paperclip, Image, Zap, Clock, Users, Sparkles,
  Search, Copy, ThumbsUp, ThumbsDown, ExternalLink
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

const STORAGE_KEY = 'chat_widget_data';
const MAX_MESSAGES = 200;

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return 'chat_ssr';
  }

  let id = localStorage.getItem('chat_session_id');
  if (!id) {
    id = 'chat_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('chat_session_id', id);
  }
  return id;
};

const QUICK_ACTIONS = [
  { icon: ShoppingBag, label: 'My Orders', message: 'I want to check my order status', color: 'from-blue-500 to-cyan-500' },
  { icon: Headphones, label: 'Live Agent', message: 'Connect me to a support agent', color: 'from-violet-500 to-purple-500' },
  { icon: Package, label: 'Track Order', message: 'I want to track my order', color: 'from-emerald-500 to-teal-500' },
  { icon: RefreshCw, label: 'Returns', message: 'I need help with a return or refund', color: 'from-amber-500 to-orange-500' },
  { icon: CreditCard, label: 'Payment', message: 'I have a payment issue', color: 'from-pink-500 to-rose-500' },
  { icon: Truck, label: 'Shipping', message: 'Tell me about shipping options', color: 'from-indigo-500 to-blue-500' },
];

const EMOJI_LIST = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '✨', '😂', '🤔', '😍', '🙏'];

const BOT_RESPONSES = {
  default: "👋 Hello! Welcome to our store. I'm your AI assistant. How can I help you today?",
  order: "📦 I can help you track your order! Please provide your order number or email address.",
  shipping: "🚚 We offer:\n• Free standard shipping (5-7 days)\n• Express shipping $9.99 (2-3 days)\n• Same-day delivery in select areas\n\nWould you like to know more?",
  return: "↩️ Our return policy:\n• 30-day hassle-free returns\n• Free return shipping\n• Full refund or exchange\n\nWould you like to start a return?",
  product: "🛍️ I can help you find products! What are you looking for?",
  human: "👤 I'm connecting you to a support agent. They'll be with you shortly. Average wait time: ~2 minutes.",
  help: "I can help with:\n📦 Order tracking\n🛍️ Product info\n🚚 Shipping details\n↩️ Returns & refunds\n👤 Account issues\n\nWhat do you need?",
};

const getBotResponse = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('order') || m.includes('track')) return BOT_RESPONSES.order;
  if (m.includes('ship')) return BOT_RESPONSES.shipping;
  if (m.includes('return') || m.includes('refund')) return BOT_RESPONSES.return;
  if (m.includes('product') || m.includes('item') || m.includes('buy')) return BOT_RESPONSES.product;
  if (m.includes('human') || m.includes('agent') || m.includes('person')) return BOT_RESPONSES.human;
  if (m.includes('help')) return BOT_RESPONSES.help;
  return "Thanks for reaching out! I'm here to help. What can I assist you with?";
};

const playSound = (enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio playback can be blocked in some browsers or environments.
  }
};

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Message Bubble ────────────────────────────────────────
const MessageBubble = ({ message, isLast, onReact }) => {
  const isUser = message.sender_role === 'customer' || message.isUser;
  const isSystem = message.sender_role === 'system' || message.message_type === 'system';
  const [showReactions, setShowReactions] = useState(false);

  if (isSystem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-3">
        <div className="px-4 py-1.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full text-xs text-slate-500 flex items-center gap-1.5 shadow-sm border border-slate-100">
          <Zap className="w-3 h-3 text-violet-400" />
          {message.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <motion.div
          initial={isLast ? { scale: 0 } : false} animate={{ scale: 1 }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${isUser
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-200'
              : 'bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-100 border border-slate-200'
            }`}
        >
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-violet-600" />}
        </motion.div>
        <div className="flex flex-col">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isUser
                  ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white rounded-2xl rounded-tr-md shadow-lg shadow-violet-500/20'
                  : 'bg-white text-slate-700 rounded-2xl rounded-tl-md shadow-md shadow-slate-100 border border-slate-100 hover:shadow-lg transition-shadow'
                }`}
            >
              {message.text}
            </motion.div>
            {/* Reaction button */}
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`absolute -bottom-2 ${isUser ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:shadow-md`}
            >
              <Smile className="w-3 h-3 text-slate-400" />
            </button>
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute -bottom-8 ${isUser ? 'left-0' : 'right-0'} bg-white rounded-full px-2 py-1 shadow-lg border border-slate-100 flex gap-0.5 z-10`}
                >
                  {EMOJI_LIST.slice(0, 6).map(e => (
                    <button key={e} onClick={() => { onReact?.(message.id, e); setShowReactions(false); }}
                      className="hover:scale-125 transition-transform text-sm p-0.5">{e}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {message.reaction && <span className="text-sm mt-0.5">{message.reaction}</span>}
          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isUser ? 'justify-end' : ''}`}>
            <Clock className="w-2.5 h-2.5 text-slate-300" />
            <span className="text-[10px] text-slate-400">{message.time || formatTime(message.created_at || Date.now())}</span>
            {isUser && (
              <span className={message.status === 'read' ? 'text-blue-500' : 'text-violet-400'}>
                {message.status === 'sent' && <Check className="w-3 h-3" />}
                {(message.status === 'delivered' || message.status === 'read') && <CheckCheck className="w-3 h-3" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Typing Indicator ──────────────────────────────────────
const TypingIndicator = ({ name }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start mb-3">
    <div className="flex gap-2 max-w-[85%]">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
          <Bot className="w-4 h-4 text-violet-600" />
        </motion.div>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-slate-100 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                className="w-1.5 h-1.5 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full" />
            ))}
          </div>
          {name && <span className="text-[10px] text-slate-400 ml-1">{name} is typing</span>}
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Main Chat Widget ──────────────────────────────────────
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window === 'undefined'
      ? false
      : (window.matchMedia?.('(max-width: 640px)')?.matches ?? false)
  ));
  const { connected, connectionStatus, emit, on, off } = useSocket(isOpen);
  const sessionId = useRef(getSessionId()).current;
  const [messages, setMessages] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeout = useRef(null);

  // Save messages
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    if (!connected) return;

    emit('chat:join', { sessionId, userName: 'Customer', userEmail: null });

    const onHistory = (history) => {
      if (history.length > 0) setMessages(history);
      else if (messages.length === 0) {
        setMessages([{
          id: 'welcome', text: BOT_RESPONSES.default, sender_role: 'bot', sender_name: 'AI Assistant',
          time: formatTime(Date.now()), status: 'delivered', created_at: new Date().toISOString()
        }]);
      }
    };

    const onMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, time: formatTime(msg.created_at || Date.now()) }];
      });
      setIsTyping(false);
      if (!isOpen || isMinimized) setUnreadCount(p => p + 1);
      if (msg.sender_role !== 'customer') playSound(soundEnabled);
    };

    const onTyping = (data) => {
      if (data.role !== 'customer') {
        setIsTyping(data.isTyping);
        setTypingUser(data.name || 'Agent');
      }
    };

    const onRead = () => {
      setMessages(prev => prev.map(m => m.sender_role === 'customer' ? { ...m, status: 'read' } : m));
    };

    on('chat:history', onHistory);
    on('chat:message', onMessage);
    on('chat:typing', onTyping);
    on('chat:read', onRead);

    return () => { off('chat:history', onHistory); off('chat:message', onMessage); off('chat:typing', onTyping); off('chat:read', onRead); };
  }, [connected, emit, on, off, sessionId, isOpen, isMinimized, soundEnabled]);

  // Initial welcome if no socket
  useEffect(() => {
    if (messages.length === 0 && !connected) {
      setMessages([{
        id: 'welcome', text: BOT_RESPONSES.default, sender_role: 'bot', sender_name: 'AI Assistant',
        time: formatTime(Date.now()), status: 'delivered', created_at: new Date().toISOString()
      }]);
    }
  }, []);

  // Scroll handling
  const scrollToBottom = useCallback((b = 'smooth') => messagesEndRef.current?.scrollIntoView({ behavior: b }), []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  useEffect(() => { if (!showScrollBtn) scrollToBottom(); }, [messages, isTyping, showScrollBtn, scrollToBottom]);
  useEffect(() => { if (isOpen && !isMinimized) { setTimeout(() => inputRef.current?.focus(), 150); setUnreadCount(0); } }, [isOpen, isMinimized]);

  // Mobile listener
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const handler = e => setIsMobile(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  // Send message
  const handleSend = useCallback((text = inputText) => {
    if (!text.trim()) return;
    const userMsg = {
      id: 'local_' + Date.now(), text: text.trim(), sender_role: 'customer', isUser: true,
      sender_name: 'You', time: formatTime(Date.now()), status: 'sent', created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setShowEmoji(false);

    if (connected) {
      emit('chat:message', { sessionId, text: text.trim(), senderRole: 'customer' });
    } else {
      // Fallback: local bot response
      setIsTyping(true);
      setTimeout(() => {
        const botMsg = {
          id: 'bot_' + Date.now(), text: getBotResponse(text), sender_role: 'bot', sender_name: 'AI Assistant',
          time: formatTime(Date.now()), status: 'delivered', created_at: new Date().toISOString()
        };
        setIsTyping(false);
        setMessages(prev => [...prev, botMsg]);
        playSound(soundEnabled);
        if (!isOpen || isMinimized) setUnreadCount(p => p + 1);
      }, 1000 + Math.random() * 800);
    }
  }, [inputText, connected, emit, sessionId, isOpen, isMinimized, soundEnabled]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (connected) {
      emit('chat:typing', { sessionId, isTyping: true, role: 'customer' });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => emit('chat:typing', { sessionId, isTyping: false, role: 'customer' }), 1500);
    }
  };

  const handleReact = (msgId, emoji) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: emoji } : m));
  };

  const handleClear = () => { setMessages([]); setShowOptions(false); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem('chat_session_id'); };
  const toggleChat = () => { if (isOpen) { setIsOpen(false); setIsMinimized(false); setShowOptions(false); } else { setIsOpen(true); setIsMinimized(false); setUnreadCount(0); } };

  const filteredMessages = searchMode && searchTerm
    ? messages.filter(m => m.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  const connLabel = connectionStatus === 'connected' ? 'Live' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : connectionStatus === 'error' ? 'Offline' : 'Connecting...';
  const connColor = connectionStatus === 'connected' ? 'bg-emerald-400' : connectionStatus === 'error' ? 'bg-red-400' : 'bg-amber-400';

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed z-50 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-violet-500/30 transition-transform"
            style={{ right: 'max(1.25rem, env(safe-area-inset-right))', bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            aria-label="Open support chat"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ──────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div ref={chatRef}
            initial={{ opacity: 0, scale: 0.85, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`fixed z-50 flex flex-col overflow-hidden backdrop-blur-xl ${isMobile
                ? (isMinimized ? 'left-2 right-2 bottom-2 rounded-2xl h-[72px]' : 'inset-0 rounded-none')
                : (isMinimized ? 'bottom-5 right-5 w-80 rounded-2xl' : 'bottom-4 right-4 w-[420px] h-[600px] rounded-3xl')
              }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(248,247,255,0.98) 100%)',
              boxShadow: '0 25px 60px -12px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.08)',
              ...(isMobile && !isMinimized ? { height: '100dvh' } : {}),
            }}
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white select-none"
              onClick={isMinimized ? () => setIsMinimized(false) : undefined}>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                    className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${connColor} rounded-full border-2 border-purple-600`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight">Support Chat</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 ${connColor} rounded-full`} />
                    <span className="text-[11px] text-white/75">{connLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {!isMinimized && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setSearchMode(!searchMode); setSearchTerm(''); }}
                      className="p-2 rounded-lg hover:bg-white/15 transition-colors" title="Search">
                      <Search className="w-4 h-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                      className="p-2 rounded-lg hover:bg-white/15 transition-colors">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setShowOptions(!showOptions); }}
                      className="p-2 rounded-lg hover:bg-white/15 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={e => { e.stopPropagation(); isMinimized ? setIsMinimized(false) : setIsMinimized(true); }}
                  className="p-2 rounded-lg hover:bg-white/15 transition-colors">
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={e => { e.stopPropagation(); toggleChat(); }}
                  className="p-2 rounded-lg hover:bg-white/15 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options dropdown */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-3 mt-1.5 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 overflow-hidden">
                    {[
                      { icon: History, label: 'Clear Chat', fn: handleClear, color: 'text-slate-600' },
                      {
                        icon: Download, label: 'Export Chat', fn: () => {
                          const b = new Blob([JSON.stringify({ messages, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                          const a = document.createElement('a'); a.href = URL.createObjectURL(b);
                          a.download = `chat-${new Date().toISOString().split('T')[0]}.json`; a.click(); setShowOptions(false);
                        }, color: 'text-slate-600'
                      },
                      { icon: Star, label: 'Rate Chat', fn: () => { setShowRating(true); setShowOptions(false); }, color: 'text-amber-500' },
                      { icon: Phone, label: 'Call Support', fn: () => window.location.href = 'tel:+1234567890', color: 'text-emerald-500' },
                      { icon: Mail, label: 'Email Support', fn: () => window.location.href = 'mailto:support@store.com', color: 'text-blue-500' },
                    ].map(item => (
                      <button key={item.label} onClick={() => { item.fn(); setShowOptions(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50 flex items-center gap-2.5 transition-colors">
                        <item.icon className={`w-4 h-4 ${item.color}`} /> {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isMinimized ? (
              <div className="p-3 bg-white/80 cursor-pointer hover:bg-violet-50/50 transition-colors" onClick={() => setIsMinimized(false)}>
                <p className="text-sm text-slate-600 truncate">{messages[messages.length - 1]?.text?.substring(0, 60) || 'Chat minimized'}...</p>
              </div>
            ) : (
              <>
                {/* Search bar */}
                <AnimatePresence>
                  {searchMode && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-b border-slate-100 bg-white/80 overflow-hidden">
                      <div className="px-3 py-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search messages..."
                          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" autoFocus />
                        <button onClick={() => setSearchMode(false)} className="text-xs text-violet-500 font-medium">Done</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rating overlay */}
                <AnimatePresence>
                  {showRating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-100">
                          <Star className="w-8 h-8 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Rate Your Experience</h3>
                        <p className="text-sm text-slate-500 mb-6">How was our support today?</p>
                        <div className="flex gap-3 justify-center mb-6">
                          {[1, 2, 3, 4, 5].map(s => (
                            <motion.button key={s} whileHover={{ scale: 1.2, y: -3 }} whileTap={{ scale: 0.9 }}
                              onClick={() => { setRating(s); handleSend(`⭐ I rate this ${s}/5 stars`); setShowRating(false); }}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${s <= rating ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-violet-50'
                                }`}>
                              <Star className="w-5 h-5" fill={s <= rating ? 'currentColor' : 'none'} />
                            </motion.button>
                          ))}
                        </div>
                        <button onClick={() => setShowRating(false)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Maybe later</button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Messages ─────────────────────────────── */}
                <div className="relative flex-1 overflow-hidden">
                  <div ref={containerRef} onScroll={handleScroll}
                    className="h-full overflow-y-auto scroll-smooth px-3 py-3"
                    style={{ background: 'linear-gradient(180deg, rgba(248,247,255,0.5) 0%, rgba(255,255,255,0.3) 100%)' }}>
                    <AnimatePresence mode="popLayout">
                      {filteredMessages.map((msg, idx) => (
                        <MessageBubble key={msg.id || idx} message={msg} isLast={idx === filteredMessages.length - 1} onReact={handleReact} />
                      ))}
                    </AnimatePresence>
                    {isTyping && <TypingIndicator name={typingUser} />}
                    <div ref={messagesEndRef} className="h-2" />
                  </div>

                  <AnimatePresence>
                    {showScrollBtn && (
                      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-violet-600 text-white text-xs rounded-full shadow-lg flex items-center gap-1 hover:bg-violet-700 transition-colors">
                        <ArrowDown className="w-3 h-3" /> Latest
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Quick Actions ────────────────────────── */}
                {messages.length < 4 && (
                  <div className="px-3 py-2 border-t border-slate-100/80">
                    <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Quick Actions</p>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                      {QUICK_ACTIONS.map((a, i) => (
                        <motion.button key={a.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleSend(a.message)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${a.color} text-white text-[11px] font-medium rounded-xl whitespace-nowrap shadow-sm hover:shadow-md transition-shadow`}>
                          <a.icon className="w-3 h-3" /> {a.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Emoji picker ─────────────────────────── */}
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-white/80 overflow-hidden">
                      <div className="px-3 py-2 grid grid-cols-6 gap-1">
                        {EMOJI_LIST.map(e => (
                          <button key={e} onClick={() => setInputText(prev => prev + e)}
                            className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-violet-50">{e}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Input ────────────────────────────────── */}
                <div className="bg-white/90 backdrop-blur-sm border-t border-slate-100/80 px-3 py-3"
                  style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))` }}>
                  <div className="flex gap-2 items-end">
                    <div className="flex gap-0.5">
                      <button onClick={() => setShowEmoji(!showEmoji)}
                        className="p-2 rounded-xl hover:bg-violet-50 text-slate-400 hover:text-violet-500 transition-colors">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 relative">
                      <input ref={inputRef} type="text" value={inputText} onChange={handleInputChange} onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 focus:bg-white transition-all placeholder:text-slate-400" />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleSend()} disabled={!inputText.trim()}
                      className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 px-1">
                    <span className="text-[9px] text-slate-400">
                      {connected ? '🟢 Connected' : '🔴 Offline mode'} • Press Enter to send
                    </span>
                    <span className="text-[9px] text-slate-300">Powered by AI</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
