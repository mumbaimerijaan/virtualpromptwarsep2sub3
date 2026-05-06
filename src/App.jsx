import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header, Hero, ActionCardList, TrustBadge, UpdatesCard, FloatingAssistant, Footer, BottomNav } from './components';
import ScrollToTop from './components/ScrollToTop';
import { ChatModal } from './components/ChatModal';
import { RouteAnnouncer } from './components/RouteAnnouncer';
import { ROUTES } from './lib/routes';
import { initFirebase } from './lib/firebase';
import { initGA, trackPageView } from './lib/AnalyticsService';

// Lazy loading all 14 pages for optimal code splitting
const RegisterVoterPage = React.lazy(() => import('./pages').then(m => ({ default: m.RegisterVoterPage })));
const CheckVoterListPage = React.lazy(() => import('./pages').then(m => ({ default: m.CheckVoterListPage })));
const UpdateDetailsPage = React.lazy(() => import('./pages').then(m => ({ default: m.UpdateDetailsPage })));
const VotingProcessPage = React.lazy(() => import('./pages').then(m => ({ default: m.VotingProcessPage })));
const HowElectionsWorkPage = React.lazy(() => import('./pages').then(m => ({ default: m.HowElectionsWorkPage })));
const KeyTermsPage = React.lazy(() => import('./pages').then(m => ({ default: m.KeyTermsPage })));
const UpdatesPage = React.lazy(() => import('./pages').then(m => ({ default: m.UpdatesPage })));
const ElectionParticipantsPage = React.lazy(() => import('./pages').then(m => ({ default: m.ElectionParticipantsPage })));
const StatusPage = React.lazy(() => import('./pages').then(m => ({ default: m.StatusPage })));
const FAQPage = React.lazy(() => import('./pages').then(m => ({ default: m.FAQPage })));
const IssueResolutionPage = React.lazy(() => import('./pages').then(m => ({ default: m.IssueResolutionPage })));
const LostVoterIdPage = React.lazy(() => import('./pages').then(m => ({ default: m.LostVoterIdPage })));
const EmergencyPage = React.lazy(() => import('./pages').then(m => ({ default: m.EmergencyPage })));
const SpecialSupportPage = React.lazy(() => import('./pages').then(m => ({ default: m.SpecialSupportPage })));
const SIR2026Page = React.lazy(() => import('./pages').then(m => ({ default: m.SIR2026Page })));
const FallbackHelpPage = React.lazy(() => import('./pages').then(m => ({ default: m.FallbackHelpPage })));

import LoadingSkeleton from './components/Skeleton/LoadingSkeleton';

// Local data imports (Initial/English)
import commonEn from './data/en/common.json';
import registerEn from './data/en/registerVoter.json';
import checkListEn from './data/en/checkVoterList.json';
import updateEn from './data/en/updateDetails.json';
import votingEn from './data/en/votingProcess.json';
import electionsEn from './data/en/howElectionsWork.json';
import statusEn from './data/en/status.json';
import faqPageEn from './data/en/faqPage.json';
import faqEn from './data/en/faq.json';
import updatesPageEn from './data/en/updatesPage.json';
import sirEn from './data/en/sir2026.json';
import chatEn from './data/en/chat.json';
import issueEn from './data/en/issueResolution.json';
import faqsEn from './data/en/faqs_full.json';

// Hindi imports
import commonHi from './data/hi/common.json';
import registerHi from './data/hi/registerVoter.json';
import checkListHi from './data/hi/checkVoterList.json';
import updateHi from './data/hi/updateDetails.json';
import votingHi from './data/hi/votingProcess.json';
import electionsHi from './data/hi/howElectionsWork.json';
import statusHi from './data/hi/status.json';
import faqPageHi from './data/hi/faqPage.json';
import faqHi from './data/hi/faq.json';
import updatesPageHi from './data/hi/updatesPage.json';
import sirHi from './data/hi/sir2026.json';
import chatHi from './data/hi/chat.json';
import issueHi from './data/hi/issueResolution.json';
import faqsHi from './data/hi/faqs_full.json';

// Marathi imports
import commonMr from './data/mr/common.json';
import registerMr from './data/mr/registerVoter.json';
import checkListMr from './data/mr/checkVoterList.json';
import updateMr from './data/mr/updateDetails.json';
import votingMr from './data/mr/votingProcess.json';
import electionsMr from './data/mr/howElectionsWork.json';
import statusMr from './data/mr/status.json';
import faqPageMr from './data/mr/faqPage.json';
import faqMr from './data/mr/faq.json';
import updatesPageMr from './data/mr/updatesPage.json';
import sirMr from './data/mr/sir2026.json';
import chatMr from './data/mr/chat.json';
import issueMr from './data/mr/issueResolution.json';
import faqsMr from './data/mr/faqs_full.json';

const LOCALES = {
  en: { common: commonEn, register: registerEn, checkList: checkListEn, update: updateEn, voting: votingEn, elections: electionsEn, status: statusEn, faqPage: faqPageEn, faq: faqEn, updatesPage: updatesPageEn, sir: sirEn, chat: chatEn, issue: issueEn, faqs_full: faqsEn },
  hi: { common: commonHi, register: registerHi, checkList: checkListHi, update: updateHi, voting: votingHi, elections: electionsHi, status: statusHi, faqPage: faqPageHi, faq: faqHi, updatesPage: updatesPageHi, sir: sirHi, chat: chatHi, issue: issueHi, faqs_full: faqsHi },
  mr: { common: commonMr, register: registerMr, checkList: checkListMr, update: updateMr, voting: votingMr, elections: electionsMr, status: statusMr, faqPage: faqPageMr, faq: faqMr, updatesPage: updatesPageMr, sir: sirMr, chat: chatMr, issue: issueMr, faqs_full: faqsMr }
};

function HomePage({ t }) {
  const navigate = useNavigate();

  const handleAction = (actionName) => {
    switch(actionName) {
      case 'register': navigate(ROUTES.REGISTER); break;
      case 'check_name': navigate(ROUTES.CHECK_VOTER_LIST); break;
      case 'update_details': navigate(ROUTES.UPDATE_DETAILS); break;
      case 'voting_process': navigate(ROUTES.VOTING_PROCESS); break;
      case 'understand_elections': navigate(ROUTES.HOW_ELECTIONS_WORK); break;
      case 'updates': navigate(ROUTES.UPDATES); break;
      case 'intent_input': 
        window.dispatchEvent(new CustomEvent('open-chat'));
        break;
      case 'faq': navigate(ROUTES.FAQ); break;
      case 'track_status': navigate(ROUTES.STATUS); break;
      case 'report_issue': navigate(ROUTES.ISSUE_RESOLUTION); break;
      case 'sir2026': navigate(ROUTES.SIR2026); break;
      default: console.log(`Action triggered: ${actionName}`);
    }
  };

  return (
    <main className="flex-1 flex flex-col" id="main-content">
      <Hero t={t} />
      <ActionCardList onAction={handleAction} t={t} />
      <UpdatesCard onClick={() => handleAction('updates')} t={t} />
      <TrustBadge t={t} />
    </main>
  );
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('saathi_lang') || 'en');
  const location = useLocation();

  const t = useMemo(() => LOCALES[language], [language]);

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  // Initialize Firebase AppCheck and Chat Event Listener
  useEffect(() => {
    initFirebase();
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('saathi_lang', lang);
  };

  return (
    <div className="min-h-screen relative w-full bg-white flex justify-center">
      <RouteAnnouncer />
      <div className="w-full md:w-[60%] bg-[#F9FAFB] min-h-screen flex flex-col">
        <ScrollToTop />
        <div className="flex-1 overflow-y-auto px-5 scroll-smooth">
          <Header currentLang={language} onLangChange={changeLanguage} t={t.common} />
          
          <div className="flex-1 flex flex-col">
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage t={t.common} />} />
                <Route path={ROUTES.REGISTER} element={<RegisterVoterPage t={t.register} />} />
                <Route path={ROUTES.CHECK_VOTER_LIST} element={<CheckVoterListPage t={t.checkList} />} />
                <Route path={ROUTES.UPDATE_DETAILS} element={<UpdateDetailsPage t={t.update} />} />
                <Route path={ROUTES.VOTING_PROCESS} element={<VotingProcessPage t={t.voting} />} />
                <Route path={ROUTES.HOW_ELECTIONS_WORK} element={<HowElectionsWorkPage t={t.elections} />} />
                <Route path={ROUTES.KEY_TERMS} element={<KeyTermsPage />} />
                <Route path={ROUTES.UPDATES} element={<UpdatesPage t={t.updatesPage} />} />
                <Route path={ROUTES.PARTICIPANTS} element={<ElectionParticipantsPage />} />
                <Route path={ROUTES.STATUS} element={<StatusPage t={t.status} />} />
                <Route path={ROUTES.FAQ} element={<FAQPage t={t.faqPage} faqData={t.faqs_full} />} />
                <Route path={ROUTES.ISSUE_RESOLUTION} element={<IssueResolutionPage t={t.issue} />} />
                <Route path={ROUTES.LOST_VOTER_ID} element={<LostVoterIdPage />} />
                <Route path={ROUTES.EMERGENCY} element={<EmergencyPage />} />
                <Route path={ROUTES.SPECIAL_SUPPORT} element={<SpecialSupportPage />} />
                <Route path={ROUTES.SIR2026} element={<SIR2026Page t={t.sir} />} />
                <Route path={ROUTES.HELP} element={<FallbackHelpPage />} />
                <Route path={ROUTES.FALLBACK} element={<Navigate to={ROUTES.HOME} />} />
              </Routes>
            </Suspense>
          </div>
        </div>
        
        {location.pathname === ROUTES.HOME && <Footer />}
        <BottomNav onOpenChat={() => setIsChatOpen(true)} t={t.common} />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} t={t.chat} lang={language} faqData={t.faqs_full} />
      </div>
    </div>
  );
}

export default App;
