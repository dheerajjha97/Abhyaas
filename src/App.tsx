import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StudentProfileProvider, useStudentProfile } from './context/StudentProfileContext';
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
import { BottomNavigation } from './components/ui/BottomNavigation';

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
      {/* Outer wrapper: Centered mobile container on desktop with rich frosted glass ambient blurred background blobs */}
      <div className="min-h-screen w-full bg-[#ecf2f9] dark:bg-slate-950 flex flex-col items-center justify-start relative overflow-x-hidden font-sans">
        {/* Frosted Glass Theme Ambient Blurred Background Light Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-300 dark:bg-indigo-900/40 rounded-full blur-[100px] opacity-40" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-amber-200 dark:bg-amber-900/30 rounded-full blur-[120px] opacity-40" />
          <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-teal-200 dark:bg-teal-900/30 rounded-full blur-[100px] opacity-30" />
        </div>

        {/* Main Centered Mobile Frame */}
        <div className="w-full max-w-md sm:max-w-lg min-h-screen flex flex-col relative z-10 px-3 sm:px-4 pt-2 pb-8 bg-white/20 dark:bg-slate-900/30 backdrop-blur-2xl sm:rounded-[40px] sm:my-3 sm:border-8 sm:border-slate-800/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
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
      <AppContent />
    </StudentProfileProvider>
  );
}
