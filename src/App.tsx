import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StudentProfileProvider, useStudentProfile } from './context/StudentProfileContext';
import { StudentProgressProvider } from './context/StudentProgressContext';
import { StudentProfileModal } from './components/profile/StudentProfileModal';
import { Home } from './pages/Home';
import { Subjects } from './pages/Subjects';
import { Papers } from './pages/Papers';
import { Preparation } from './pages/Preparation';
import { Quiz } from './pages/Quiz';
import { QuizResult } from './pages/QuizResult';
import { ShortQuestions } from './pages/ShortQuestions';
import { LongQuestions } from './pages/LongQuestions';
import { Bookmarks } from './pages/Bookmarks';
import { Search } from './pages/Search';
import { More } from './pages/More';
import { SyllabusView } from './pages/SyllabusView';
import { NotesView } from './pages/NotesView';
import { MockTestGenerator } from './pages/MockTestGenerator';
import { MistakeNotebook } from './pages/MistakeNotebook';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ContactUs } from './pages/ContactUs';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { DesktopNavbar } from './components/ui/DesktopNavbar';
import { AdSenseTracker } from './components/ads/AdSenseTracker';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Register Service Worker for PWA support
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    });
  }
};

const AppContent: React.FC = () => {
  const { isProfileModalOpen, closeProfileModal } = useStudentProfile();

  return (
    <Router>
      <ScrollToTop />
      <AdSenseTracker />
      {/* Outer wrapper: Clean, professional neutral background */}
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col relative font-sans antialiased text-slate-900 dark:text-slate-100">
        {/* Responsive App Container: Fluid and multi-column on desktop/tablet, clean on mobile */}
        <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col relative z-10 px-3.5 sm:px-6 lg:px-8 pt-2 pb-8 transition-all">
          <DesktopNavbar />

          <main className="flex-1 pb-24 md:pb-12">
            {/* PWA In-App Install Prompt Banner */}
            <PWAInstallPrompt />
            <OfflineIndicator />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/papers" element={<Papers />} />
              <Route path="/notes" element={<NotesView />} />
              <Route path="/syllabus" element={<SyllabusView />} />
              <Route path="/class/:classId/subjects" element={<Subjects />} />
              <Route path="/class/:classId/subject/:subjectId/papers" element={<Papers />} />
              <Route path="/class/:classId/subject/:subjectId/syllabus" element={<SyllabusView />} />
              <Route path="/class/:classId/subject/:subjectId/notes" element={<NotesView />} />
              <Route path="/syllabus/:subjectId" element={<SyllabusView />} />
              <Route path="/notes/:subjectId" element={<NotesView />} />
              <Route path="/paper/:paperId" element={<Preparation />} />
              <Route path="/paper/:paperId/quiz" element={<Quiz />} />
              <Route path="/paper/:paperId/quiz/result" element={<QuizResult />} />
              <Route path="/paper/:paperId/short" element={<ShortQuestions />} />
              <Route path="/paper/:paperId/long" element={<LongQuestions />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/mistakes" element={<MistakeNotebook />} />
              <Route path="/search" element={<Search />} />
              <Route path="/more" element={<More />} />
              <Route path="/mock-test" element={<MockTestGenerator />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </main>

          <BottomNavigation />
        </div>
      </div>

      {/* Global Student Profile Modal - pops up on first launch if not configured, or on demand */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </Router>
  );
};

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <StudentProfileProvider>
      <StudentProgressProvider>
        <AppContent />
      </StudentProgressProvider>
    </StudentProfileProvider>
  );
}
