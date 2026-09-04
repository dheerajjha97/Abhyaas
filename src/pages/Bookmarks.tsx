import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../utils/bookmarkStorage';
import { BookmarkedQuestion, QuestionType } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Illustration } from '../components/ui/Illustration';
import { Bookmark, Trash2, ArrowRight, HelpCircle, FileText, BookOpen, Filter } from 'lucide-react';

export const Bookmarks: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [selectedTab, setSelectedTab] = useState<QuestionType | 'all'>('all');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadBookmarks = () => {
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
    loadBookmarks();
    setToast({ id: Date.now().toString(), type: 'info', message: 'बुकमार्क हटा दिया गया' });
  };

  const filtered = selectedTab === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.type === selectedTab);

  const typeIcons = {
    mcq: <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />,
    short: <FileText className="w-3.5 h-3.5 text-purple-500" />,
    long: <BookOpen className="w-3.5 h-3.5 text-pink-500" />,
  };

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <HeaderBar title="सहेजे गए सवाल" subtitle="Saved Important Questions" />

      {/* Filter Tabs */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['all', 'mcq', 'short', 'long'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                selectedTab === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center py-12 space-y-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="w-36 mx-auto">
            <Illustration name="bookmark" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              अभी कोई सवाल सेव नहीं है
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Important questions को bookmark करके बाद में जल्दी पढ़ें और रिवीजन करें।
            </p>
          </div>

          <button
            onClick={() => navigate('/class/12/subjects')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            तैयारी शुरू करें
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center py-8 border border-slate-200/90 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">इस कैटेगरी में कोई सहेजा सवाल नहीं है।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/paper/${item.paperId}/${item.type}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                  {typeIcons[item.type]}
                  <span className="uppercase">{item.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Class {item.classId} • {item.subject}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="बुकमार्क हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {item.question}
              </h4>

              {item.answer && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">Ans:</span>
                  {item.answer}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="truncate">{item.paperName}</span>
                <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                  पढ़ें <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
