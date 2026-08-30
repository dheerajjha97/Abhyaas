import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionRepository } from '../services/questionRepository';
import { Paper } from '../types/question';
import { HeaderBar } from '../components/ui/HeaderBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Illustration } from '../components/ui/Illustration';
import { Play, BookOpen, FileText, ArrowRight, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

export const Preparation: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();

  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPaperData = () => {
    if (!paperId) return;
    setLoading(true);
    setError(false);
    questionRepository
      .getPaperById(paperId)
      .then((data) => {
        if (data) {
          setPaper(data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPaperData();
  }, [paperId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4 animate-in fade-in">
        <div className="w-44 mx-auto">
          <Illustration name="welcome" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-indigo-700">आपकी तैयारी लोड हो रही है...</h3>
          <p className="text-xs text-slate-500">कृपया प्रतीक्षा करें</p>
        </div>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="py-16 text-center space-y-4 max-w-sm mx-auto px-4">
        <HeaderBar showBack title="त्रुटि" />
        <div className="w-44 mx-auto">
          <Illustration name="error" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">सवाल लोड नहीं हो पाए।</h3>
          <p className="text-xs text-slate-500">
            कृपया Internet connection check करें या दोबारा प्रयास करें।
          </p>
        </div>
        <button
          onClick={fetchPaperData}
          className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>फिर कोशिश करें</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      <HeaderBar
        showBack
        title={`${paper.subject} • ${paper.paperName}`}
        subtitle={`Class ${paper.class} • ${paper.year}`}
      />

      {/* Preparation Header Banner */}
      <GlassCard variant="accent" padding="md" className="border-indigo-200">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{paper.year} Model Paper</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
              आज की तैयारी
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              नीचे दिए गए 3 प्रमुख सेक्शन में से चुनकर पढ़ाई शुरू करें:
            </p>
          </div>
          <div className="w-20 shrink-0">
            <Illustration name="preparation" size={75} />
          </div>
        </div>
      </GlassCard>

      {/* Three Interactive Cards */}
      <div className="space-y-4">
        {/* 1. MCQ Quiz Card */}
        <GlassCard
          variant="interactive"
          onClick={() => navigate(`/paper/${paper.id}/quiz`)}
          className="p-5 overflow-hidden border-indigo-200/80 shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" /> MCQ Test
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                MCQ Quiz
              </h3>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {paper.mcqs.length} Questions
              </p>
              <p className="text-xs text-slate-500">
                अपना ज्ञान परखें और समयबद्ध क्विज़ हल करें।
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md group-hover:bg-indigo-700 transition-colors">
                  <span>Quiz शुरू करें</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="w-24 shrink-0">
              <Illustration name="quiz" size={90} />
            </div>
          </div>
        </GlassCard>

        {/* 2. Short Answer Card */}
        <GlassCard
          variant="interactive"
          onClick={() => navigate(`/paper/${paper.id}/short`)}
          className="p-5 overflow-hidden border-purple-200/80 shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 px-2.5 py-0.5 rounded-full">
                <FileText className="w-3 h-3 text-purple-600" /> 2-3 Marks Answers
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Short Answers
              </h3>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {paper.shortQuestions.length} Questions
              </p>
              <p className="text-xs text-slate-500">
                Important answers सीखें और त्वरित उत्तर देखें।
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 py-2 px-4 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md group-hover:bg-purple-700 transition-colors">
                  <span>पढ़ना शुरू करें</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="w-24 shrink-0">
              <Illustration name="study" size={90} />
            </div>
          </div>
        </GlassCard>

        {/* 3. Long Answer Card */}
        <GlassCard
          variant="interactive"
          onClick={() => navigate(`/paper/${paper.id}/long`)}
          className="p-5 overflow-hidden border-pink-200/80 shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 px-2.5 py-0.5 rounded-full">
                <BookOpen className="w-3 h-3 text-pink-600" /> 5 Marks Long Answers
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Long Answers
              </h3>
              <p className="text-xs font-bold text-pink-600 dark:text-pink-400">
                {paper.longQuestions.length} Questions
              </p>
              <p className="text-xs text-slate-500">
                Descriptive answers तैयार करें विस्तृत उत्तरों के साथ।
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 py-2 px-4 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md group-hover:bg-pink-700 transition-colors">
                  <span>पढ़ना शुरू करें</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="w-24 shrink-0">
              <Illustration name="books" size={90} />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
