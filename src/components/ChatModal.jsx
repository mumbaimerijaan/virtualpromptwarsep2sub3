import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, UserPlus, Search, Edit3, CheckSquare, BookOpen, CheckCircle2, ShieldCheck, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import botImg from '../assets/bot.png';
import botBgImg from '../assets/bot-bg.png';

import { ChatService } from '../services/chat.service';
import { ROUTES } from '../lib/routes';
import { initFirebase } from '../lib/firebase';
import { sanitizeHTML } from '../utils/sanitize';
import { findFAQMatch, findRouteMatch } from '../utils/intentMatcher';

export const ChatModal = ({ isOpen, onClose, t, lang, faqData }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      isWelcome: true,
      content: t?.initial?.welcome || "Hi there! 👋\n\nI'm Saathi, your election assistant. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const lastFocusedElement = useRef(null);
  const navigate = useNavigate();

  const INITIAL_MESSAGES = useMemo(() => ([
    {
      id: 1,
      type: 'bot',
      isWelcome: true,
      content: t?.initial?.welcome || "Hi there! 👋\n\nI'm Saathi, your election assistant. How can I help you today?",
    }
  ]), [t]);

  // Sync initial message when t changes (language swap)
  useEffect(() => {
    if (!hasInteracted) {
      setMessages(INITIAL_MESSAGES);
    }
  }, [INITIAL_MESSAGES, hasInteracted]);

  // Initialize Session ID
  useEffect(() => {
    let storedSession = localStorage.getItem('saathi_session_id');
    if (!storedSession) {
      storedSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('saathi_session_id', storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // Firestore Subscription
  useEffect(() => {
    if (isOpen && sessionId && hasInteracted) {
      setIsSyncing(true);
      const unsubscribe = ChatService.subscribeToMessages(sessionId, (newMessages) => {
        if (newMessages.length > 0) {
          setMessages([...INITIAL_MESSAGES, ...newMessages]);
        }
        setIsSyncing(false);
      });
      return () => unsubscribe();
    }
  }, [isOpen, sessionId, hasInteracted, INITIAL_MESSAGES]);

  // Accessibility: Focus Management & Keyboard Trap
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      lastFocusedElement.current = document.activeElement;
      
      // Auto-focus input when modal opens (WCAG 2.1)
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
          if (e.key === 'Escape') {
            onClose();
          }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => {
          document.removeEventListener('keydown', handleTabKey);
          clearTimeout(timer);
          // Restore focus on close
          lastFocusedElement.current?.focus();
        };
      }
    }
  }, [isOpen, onClose]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleRoute = (intentOrPath) => {
    const routeMap = {
      'REGISTER_VOTER': ROUTES.REGISTER,
      'CHECK_NAME': ROUTES.CHECK_VOTER_LIST,
      'UPDATE_DETAILS': ROUTES.UPDATE_DETAILS,
      'VOTING_PROCESS': ROUTES.VOTING_PROCESS,
      'LEARN_ELECTIONS': ROUTES.HOW_ELECTIONS_WORK,
      'TRACK_STATUS': ROUTES.STATUS,
      [ROUTES.REGISTER]: ROUTES.REGISTER,
      [ROUTES.CHECK_VOTER_LIST]: ROUTES.CHECK_VOTER_LIST,
      [ROUTES.UPDATE_DETAILS]: ROUTES.UPDATE_DETAILS,
      [ROUTES.VOTING_PROCESS]: ROUTES.VOTING_PROCESS,
      [ROUTES.HOW_ELECTIONS_WORK]: ROUTES.HOW_ELECTIONS_WORK,
    };

    const targetRoute = routeMap[intentOrPath] || null;
    
    if (targetRoute) {
      onClose();
      navigate(targetRoute);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setHasInteracted(true);
    setIsLoading(true);
    
    try {
      await ChatService.saveMessage(sessionId, { type: 'user', content: userMessage });

      const pageMatch = findRouteMatch(userMessage);
      if (pageMatch) {
        await ChatService.saveMessage(sessionId, {
          type: 'bot',
          content: t?.messages?.intentMatch?.replace('{title}', pageMatch.title) || `I can help you with that! You can access the ${pageMatch.title} page directly here.`,
          intent: pageMatch.route,
          suggestions: ["Go to Page", "Something else?"]
        });
        setIsLoading(false);
        return;
      }

      const faqMatch = findFAQMatch(userMessage, faqData);
      if (faqMatch) {
        await ChatService.saveMessage(sessionId, {
          type: 'bot',
          content: faqMatch.answer,
          intent: 'FAQ_REPLY',
          suggestions: faqMatch.keywords?.slice(0, 3) || ["More FAQs", "Main Menu"]
        });
        setIsLoading(false);
        return;
      }


      const response = await ChatService.sendToAI({
        prompt: userMessage,
        history: messages.map(m => ({
          id: m.id,
          type: m.type,
          content: m.content,
          timestamp: Date.now()
        })),
        currentLanguage: lang
      });
      
      await ChatService.saveMessage(sessionId, {
        type: 'bot',
        content: response.message,
        intent: response.intent,
        suggestions: response.suggestions
      });

    } catch (error) {
      console.error("Chat flow error:", error);
      await ChatService.saveMessage(sessionId, {
        type: 'bot',
        content: t?.messages?.error || "Sorry, I'm having trouble connecting right now.",
        intent: "ERROR",
        suggestions: t?.messages?.defaultSuggestions || ["Register as a voter", "Check voter list", "How to vote"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const getAriaStatus = () => {
    if (isLoading) return t?.aria?.loading || "Bot is auditing the prompt...";
    if (isSyncing) return t?.aria?.syncing || "Synchronizing chat history...";
    if (messages.length > 1 && !isLoading) return t?.aria?.ready || "Insights ready";
    return "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center bg-slate-900/40 backdrop-blur-sm sm:p-4 transition-opacity" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {getAriaStatus()}
      </div>

      <div 
        ref={modalRef}
        className="w-full md:w-[60%] bg-[#F4F6FF] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden animate-slide-up"
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 rounded-t-3xl sm:rounded-t-3xl relative z-10 flex items-center justify-between shadow-sm">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full sm:hidden"></div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center p-1.5 border-2 border-indigo-50">
                <img src={botImg} alt="Saathi Avatar" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 id="modal-title" className="font-bold text-slate-800 text-[17px] leading-tight flex items-center gap-1.5">
                {t?.header?.title || "Saathi Assistant"} 
                <CheckCircle2 size={14} className="text-blue-500" />
              </h2>
              <p className="text-slate-500 text-[12px] mt-0.5">{t?.header?.subtitle || "Your smart guide for elections"}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium mt-1">
                <ShieldCheck size={12} /> {t?.header?.badges || "Trusted • Secure • Always Here"}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {hasInteracted && (
              <button 
                onClick={() => {
                  setMessages(INITIAL_MESSAGES);
                  setHasInteracted(false);
                }}
                className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-100 flex items-center gap-1 px-3"
                aria-label={t?.header?.back || "Back to topics"}
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
                <span className="text-[12px] font-bold">{t?.header?.back || "Back"}</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 -mr-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-100"
              aria-label="Close Assistant"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className="flex-1 overflow-y-auto bg-[#F4F6FF] p-5 pb-8 relative no-scrollbar scroll-smooth"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="flex flex-col gap-4">
            {!hasInteracted && (
              <div className="w-full relative mb-4 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden bg-white min-h-[340px]">
                 <img src={botBgImg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none block" />
                 
                 <div className="absolute top-0 left-0 w-[55%] h-[55%] z-10 p-5 flex flex-col justify-center">
                    <p className="text-[14.5px] text-slate-700 leading-snug whitespace-pre-wrap font-medium">{messages[0].content}</p>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-full h-[45%] z-10 p-4 flex flex-col justify-end">
                    <div className="relative flex items-center bg-slate-50/80 backdrop-blur-sm rounded-full border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all shadow-sm">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={t?.initial?.inputPlaceholder || "Type your question here..."}
                        className="w-full bg-transparent border-none py-3.5 pl-5 pr-14 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-full"
                        disabled={isLoading}
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1.5 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
                        aria-label="Send message"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                 </div>
              </div>
            )}

            {hasInteracted && messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[14.5px] leading-relaxed shadow-sm ${
                    msg.type === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100'
                  }`}
                >
                  {msg.type === 'user' ? (
                    msg.content
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(msg.content) }} />
                  )}
                </div>

                {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                   <div className="flex flex-col gap-2 mt-3 w-full pl-2">
                     {msg.suggestions.map((suggestion, idx) => (
                       <button
                         key={idx}
                         onClick={() => {
                           const route = msg.intent !== "UNKNOWN" && msg.intent !== "ERROR" ? msg.intent : suggestion;
                           handleRoute(route);
                         }}
                         className="self-start text-left bg-white text-indigo-600 text-[13.5px] font-medium px-4 py-2.5 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-between min-w-[200px]"
                       >
                         {suggestion}
                         <ChevronRight size={14} className="text-indigo-400 opacity-60" />
                       </button>
                     ))}
                   </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white rounded-[20px] rounded-bl-sm px-4 py-3 border border-slate-100 shadow-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {hasInteracted && (
          <div className="bg-white p-4 border-t border-slate-100/50 pb-6 sm:pb-4 rounded-b-3xl">
            <div className="relative flex items-center bg-slate-50 rounded-full border border-slate-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your question here..."
                className="w-full bg-transparent border-none py-3.5 pl-5 pr-14 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-full"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white py-3 border-t border-slate-50 rounded-b-3xl mt-auto">
          <div className="flex items-center justify-center gap-1.5 opacity-60">
             <div className="w-12 h-10 flex items-center justify-center">
                 <img src="https://www.makeinindia.com/foundation/assets/images/mii-logo.png" alt="Make in India" className="w-full h-full object-contain" />
             </div>
             <span className="text-[10px] font-medium text-slate-500">A Make in India initiative to increase voter awareness</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopicCard = ({ icon: Icon, title, color, bg, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 items-start hover:bg-slate-50 transition-colors text-left"
  >
    <div className={`p-2 rounded-full ${bg} ${color}`}>
      <Icon size={18} />
    </div>
    <div className="flex w-full items-center justify-between">
      <span className="font-semibold text-[12px] leading-tight text-slate-800 pr-2">{title}</span>
      <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
    </div>
  </button>
);
