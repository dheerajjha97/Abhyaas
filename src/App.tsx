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
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ContactUs } from './pages/ContactUs';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { AdSenseTracker } from './components/ads/AdSenseTracker';

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
      <div className="min-h-screen w-full bg-slate-100/90 dark:bg-slate-950 flex flex-col items-center justify-start relative font-sans antialiased text-slate-900 dark:text-slate-100">
        {/* Main Centered App Container */}
        <div className="w-full max-w-md sm:max-w-xl min-h-screen flex flex-col relative z-10 px-3 sm:px-5 pt-2 pb-8 bg-slate-50 dark:bg-slate-900 sm:border-x sm:border-slate-200/80 dark:sm:border-slate-800/80 shadow-sm">
          <main className="flex-1 pb-24 sm:pb-28">
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
