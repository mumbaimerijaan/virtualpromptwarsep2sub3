import React, { memo } from 'react';
import { Menu, Globe, ChevronRight, UserPlus, Search, Edit3, CheckSquare, BookOpen, MessageSquare, ShieldCheck, Megaphone, Bot, Clock, Home as HomeIcon, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import logoImg from '../assets/logo.png';
import heroImg from '../assets/hero.png';
import miiLogo from '../assets/make-in-india-gears.png';

export const ActionItem = memo(({ icon: Icon, title, iconColorClass, iconBgClass, hasBorder = true, onClick }) => {
  return (
    <button 
      onClick={onClick}
      role="link"
      aria-label={`Navigate to ${title}`}
      className={`w-full flex items-center justify-between py-4 px-5 bg-white transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 ${hasBorder ? 'border-b border-slate-100' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${iconBgClass} ${iconColorClass}`} aria-hidden="true">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-slate-800 text-[15px]">
          {title}
        </span>
      </div>
      <ChevronRight size={18} className="text-slate-400" aria-hidden="true" />
    </button>
  );
});

export const FeaturedCard = memo(({ badge, title, description, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full relative mt-6 mb-2 group overflow-visible text-left focus:outline-none"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
      
      <div className="relative bg-white border border-orange-100 rounded-[28px] p-5 flex items-start gap-5 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.1)] transition-all hover:shadow-[0_20px_40px_-5px_rgba(249,115,22,0.15)] active:scale-[0.98]">
        {/* Icon Area */}
        <div className="w-16 h-16 rounded-[22px] bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 border border-orange-100 shadow-sm">
          <Star size={30} strokeWidth={2.5} className="fill-orange-500/20" />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
              {badge}
            </span>
          </div>
          <h3 className="text-[17px] font-black text-slate-800 leading-tight mb-1.5">
            {title}
          </h3>
          <p className="text-[12px] text-slate-500 font-bold leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 transition-transform group-hover:translate-x-1 border border-orange-100 shadow-sm">
          <ChevronRight size={20} strokeWidth={3} />
        </div>

        {/* Design Accents (Sparkles) */}
        <div className="absolute -top-3 -right-3 opacity-40 group-hover:opacity-100 transition-opacity">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-orange-400">
            <path d="M12 3L14.5 9L21 12L14.5 15L12 21L9.5 15L3 12L9.5 9L12 3Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </button>
  );
});

export const Header = ({ currentLang, onLangChange, t }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === ROUTES.HOME;
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' }
  ];

  const currentLangLabel = languages.find(l => l.code === currentLang)?.label || 'English';

  return (
    <header className="w-full flex justify-between items-center py-5 relative">
      <div className="flex gap-3 items-center z-10">
        <div className="w-12 h-12 overflow-hidden flex items-center justify-center flex-shrink-0">
          <img src={logoImg} alt="Matdaan Saathi Logo" className="w-[100%] h-[100%] object-contain" onError={(e) => e.target.style.display='none'} />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-lg font-bold text-[#1A237E] leading-tight">Matdaan</h1>
            <h1 className="text-lg font-bold text-emerald-500 leading-tight">Saathi</h1>
          </div>
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium tracking-wide">
            {t?.hero?.tagline}
          </p>
          <p className="text-[8px] font-mono text-slate-300 mt-0.5 leading-none">v1.1.0</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!isHomePage && (
          <button 
            aria-label="Go to Home" 
            onClick={() => navigate(ROUTES.HOME)}
            className="p-1.5 bg-white border border-slate-200 rounded-full text-slate-800 focus:outline-none hover:text-indigo-600 transition-colors shadow-sm"
          >
            <HomeIcon size={20} strokeWidth={2} />
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            aria-label={`Select language. Currently ${currentLangLabel}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50 focus:outline-none bg-white shadow-sm transition-all"
          >
            <Globe size={16} className="text-indigo-600" />
            <span className="font-semibold text-[13px] text-slate-700">{currentLangLabel}</span>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${isLangOpen ? 'rotate-90' : ''}`} />
          </button>

          {isLangOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsLangOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLangChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[14px] font-medium transition-colors hover:bg-slate-50 flex items-center justify-between ${
                      currentLang === lang.code ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    {lang.label}
                    {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

import sparkImg from '../assets/spark.png';

export const Hero = ({ t }) => {
  return (
    <div className="relative mt-2 mb-6 bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
      <div className="flex items-end justify-between gap-6">
        {/* Left column: Text */}
        <div className="flex-1 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[36px] font-bold text-[#1A237E] tracking-tight leading-tight">
              {t?.hero?.intent?.split('...')[0]}<span className="text-emerald-500">...</span>
            </h2>
            <img src={sparkImg} alt="" className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[280px]">
            {t?.hero?.subtitle}
          </p>
        </div>

        {/* Right column: Image */}
        <div className="w-[42%] flex-shrink-0">
          <img 
            src={heroImg} 
            alt="" 
            className="w-full h-auto object-contain" 
            aria-hidden="true" 
            onError={(e) => e.target.style.display='none'} 
          />
        </div>
      </div>
    </div>
  );
};

export const ActionCardList = ({ onAction, t }) => {
  const items = t?.actionList?.items || [];
  const featured = t?.actionList?.featured;

  const iconMap = {
    'register': UserPlus,
    'check_name': Search,
    'update_details': Edit3,
    'voting_process': CheckSquare,
    'track_status': Clock,
    'understand_elections': BookOpen
  };

  const colorMap = {
    'register': { icon: 'text-emerald-600', bg: 'bg-emerald-50' },
    'check_name': { icon: 'text-blue-500', bg: 'bg-blue-50' },
    'update_details': { icon: 'text-orange-500', bg: 'bg-orange-50' },
    'voting_process': { icon: 'text-indigo-600', bg: 'bg-indigo-50' },
    'track_status': { icon: 'text-amber-500', bg: 'bg-amber-50' },
    'understand_elections': { icon: 'text-red-500', bg: 'bg-red-50' }
  };

  return (
    <div className="flex flex-col">
      {featured && (
        <FeaturedCard 
          badge={featured.badge}
          title={featured.title}
          description={featured.description}
          onClick={() => onAction(featured.id)}
        />
      )}

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden mt-2 mb-4">
        {items.map((item, index) => (
          <ActionItem 
            key={item.id}
            icon={iconMap[item.id]} 
            title={item.title} 
            iconColorClass={colorMap[item.id]?.icon}
            iconBgClass={colorMap[item.id]?.bg}
            hasBorder={index !== items.length - 1}
            onClick={() => onAction(item.id)}
          />
        ))}
        
        <div className="p-3 bg-white">
          <button 
            onClick={() => onAction('intent_input')}
            className="w-full flex items-center justify-between p-4 bg-[#F4F6FF] rounded-2xl border border-indigo-100 hover:bg-[#EEF2FF] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                <MessageSquare size={20} strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-indigo-900 text-[15px]">
                  {t?.actionList?.input?.title}
                </span>
                <span className="text-[12px] text-slate-500 mt-0.5">
                  {t?.actionList?.input?.subtitle}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-indigo-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TrustBadge = ({ t }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <ShieldCheck size={16} className="text-emerald-500" aria-hidden="true" />
    <span className="text-[13px] font-medium text-slate-600">{t?.trustBadge}</span>
  </div>
);

export const UpdatesCard = ({ onClick, t }) => (
  <div className="bg-[#F0FDF4] rounded-2xl p-4 mb-24">
    <div className="flex gap-4 items-start">
      <div className="p-2.5 bg-white rounded-full text-emerald-500 shadow-sm flex-shrink-0">
        <Megaphone size={20} aria-hidden="true" />
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-[12px] font-bold text-emerald-600 uppercase tracking-wide mb-1">{t?.updatesCard?.label}</h3>
        <p className="text-slate-800 font-bold text-[14px]">{t?.updatesCard?.title}</p>
        <p className="text-slate-500 text-[13px] mt-0.5">{t?.updatesCard?.subtitle}</p>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClick}
            className="flex items-center gap-1 text-[13px] font-bold text-emerald-600 border border-emerald-200 bg-white rounded-full px-4 py-1.5 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {t?.updatesCard?.button} <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  </div>
);


export const Footer = () => (
  <footer className="py-6 flex items-center justify-center gap-3 border-t border-slate-100 mt-auto bg-[#F8FAFC]">
    <div className="w-16 h-12 flex items-center justify-center opacity-90">
        <img src={miiLogo} alt="Make in India" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'} />
    </div>
    <div className="h-6 w-px bg-slate-300"></div>
    <p className="text-[11px] font-medium text-slate-500">
      A Make in India initiative to increase voter awareness
    </p>
  </footer>
);

export const FloatingAssistant = memo(({ onClick, t }) => (
  <div className="fixed bottom-6 left-0 right-0 mx-auto w-full md:w-[60%] pointer-events-none z-40">
    <div className="absolute right-6 bottom-0">
      <button 
        onClick={onClick}
        role="button"
        aria-label="Ask our AI assistant for help"
        className="pointer-events-auto bg-[#303F9F] hover:bg-[#283593] text-white rounded-[32px] shadow-[0_8px_20px_rgba(48,63,159,0.3)] p-2.5 pr-6 flex items-center gap-3 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        <div className="bg-white text-[#303F9F] p-2 rounded-full shadow-sm" aria-hidden="true">
          <Bot size={22} />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-[13px] leading-none mb-1">{t?.floatingAssistant?.title}</span>
          <span className="text-[11px] text-indigo-100 leading-none">{t?.floatingAssistant?.subtitle}</span>
        </div>
      </button>
    </div>
  </div>
));
export { BottomNav } from './BottomNav'; 
