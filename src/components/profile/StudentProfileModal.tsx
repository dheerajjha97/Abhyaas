import React, { useState, useEffect } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { ALL_AVAILABLE_SUBJECTS, StudentProfile } from '../../types/studentProfile';
import {
  X,
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  UserCheck,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_EMOJIS = ['🎓', '🧑‍🎓', '🎒', '📚', '🌟', '✍️', '🚀', '🔬', '💡'];

const BOARD_OPTIONS = [
  'BSEB (Bihar Board)',
  'CBSE Board',
  'UP Board',
  'All State Boards',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    currentUser,
    isSyncing,
    signInWithGoogle,
    signOutUser,
  } = useStudentProfile();
  const isFirstTimeSetup = !profile.isConfigured;

  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSavedSuccess(false);
      setShowAllSubjects(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Filter available subjects based on selected class
  const availableForClass = ALL_AVAILABLE_SUBJECTS.filter((sub) =>
    sub.classes.includes(formData.classId)
  );

  const displayedSubjects = availableForClass.filter((sub) => {
    if (formData.classId === '10' || showAllSubjects) return true;
    return sub.stream === formData.stream || sub.stream === 'General';
  });

  const handleClassChange = (newClass: string) => {
    // Save current selectedSubjects to the active classId
    const updatedClassSubs = {
      ...(formData.classSubjects || {}),
      [formData.classId]: formData.selectedSubjects,
    };

    // Load saved subjects for newClass, or assign defaults
    let newSubjects = updatedClassSubs[newClass];
    if (!newSubjects || newSubjects.length === 0) {
      if (newClass === '10') {
        newSubjects = ['Science', 'Mathematics', 'Social Science', 'Hindi', 'English'];
      } else if (formData.stream === 'Arts') {
        newSubjects = ['History', 'Political Science', 'Geography', 'Home Science', 'Hindi'];
      } else if (formData.stream === 'Commerce') {
        newSubjects = ['Accountancy', 'Business Studies', 'Economics', 'Entrepreneurship', 'Hindi'];
      } else {
        newSubjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Hindi'];
      }
      updatedClassSubs[newClass] = newSubjects;
    }

    setFormData((prev) => ({
      ...prev,
      classId: newClass,
      classSubjects: updatedClassSubs,
      selectedSubjects: newSubjects,
    }));
  };

  const handleStreamPreset = (stream: 'Science' | 'Arts' | 'Commerce' | 'General') => {
    let subs: string[] = [];
    if (formData.classId === '10') {
      subs = ['Science', 'Mathematics', 'Social Science', 'Hindi', 'English'];
    } else if (stream === 'Science') {
      subs = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Hindi'];
    } else if (stream === 'Arts') {
      subs = ['History', 'Political Science', 'Geography', 'Home Science', 'Hindi'];
    } else if (stream === 'Commerce') {
      subs = ['Accountancy', 'Business Studies', 'Economics', 'Entrepreneurship', 'Hindi'];
    } else {
      subs = ['Hindi', 'English', 'History', 'Political Science'];
    }

    const updatedClassSubs = {
      ...(formData.classSubjects || {}),
      [formData.classId]: subs,
    };

    setFormData((prev) => ({
      ...prev,
      stream,
      classSubjects: updatedClassSubs,
      selectedSubjects: subs,
    }));
  };

  const toggleSubjectItem = (subjectName: string) => {
    const current = formData.selectedSubjects;
    let nextSubs: string[];
    if (current.includes(subjectName)) {
      if (current.length <= 1) return; // Keep at least 1 subject
      nextSubs = current.filter((s) => s !== subjectName);
    } else {
      nextSubs = [...current, subjectName];
    }
    const updatedClassSubs = {
      ...(formData.classSubjects || {}),
      [formData.classId]: nextSubs,
    };
    setFormData((prev) => ({
      ...prev,
      selectedSubjects: nextSubs,
      classSubjects: updatedClassSubs,
    }));
  };

  const handleSave = () => {
    updateProfile({
      ...formData,
      isConfigured: true,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSkipOrCancel = () => {
    if (isFirstTimeSetup) {
      // Mark as configured with existing defaults so it won't prompt repeatedly if dismissed
      updateProfile({ isConfigured: true });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              {formData.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-extrabold leading-tight">
                  {isFirstTimeSetup
                    ? '👋 Abhyaas में आपका स्वागत है!'
                    : 'विद्यार्थी प्रोफ़ाइल (Student Profile)'}
                </h3>
                {isFirstTimeSetup && (
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    Quick Setup
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-100/90 font-medium mt-0.5">
                {isFirstTimeSetup
                  ? 'कृपया अपनी Class, Board और पसंदीदा विषय चुनें'
                  : 'अपनी कक्षा और विषय चुनें, जो होम पेज पर दिखेंगे'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkipOrCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
          {/* Firebase Cloud Sync Card */}
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Firebase क्लाउड सिंक
                    </span>
                    {currentUser ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Connected
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Local Storage
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser
                      ? currentUser.email || currentUser.displayName || 'Google Account Connected'
                      : 'Google से सिंक करें ताकि डेटा कभी खो न जाए'}
                  </p>
                </div>
              </div>
              {currentUser ? (
                <button
                  type="button"
                  onClick={signOutUser}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>लॉगआउट</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  <span>Google लॉगिन</span>
                </button>
              )}
            </div>
          </div>

          {/* Name & Avatar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              आपका नाम (Student Name)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा. राहुल कुमार"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Avatar Selector */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">अवतार:</span>
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarEmoji: emoji })}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer ${
                    formData.avatarEmoji === emoji
                      ? 'bg-indigo-600 text-white scale-110 shadow-md ring-2 ring-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>अपनी कक्षा चुनें (Select Class)</span>
              <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                कक्षा {formData.classId}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {['10', '11', '12'].map((cls) => {
                const isSelected = formData.classId === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleClassChange(cls)}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-md font-extrabold scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">
                      {cls === '10' ? '🎒' : cls === '11' ? '📚' : '🎓'}
                    </span>
                    <span className="text-xs font-bold">Class {cls}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full mt-0.5">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stream Selection (if Class 11 or 12) */}
          {formData.classId !== '10' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                आपकी स्ट्रीम (Select Stream)
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'Science', label: 'साइंस (Science)', emoji: '🔬' },
                  { id: 'Arts', label: 'आर्ट्स (Arts)', emoji: '🏛️' },
                  { id: 'Commerce', label: 'कॉमर्स (Commerce)', emoji: '📊' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      handleStreamPreset(st.id as any);
                      setShowAllSubjects(false);
                    }}
                    className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      formData.stream === st.id
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>{st.emoji}</span>
                    <span>{st.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Board Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              बोर्ड (Examination Board)
            </label>
            <select
              value={formData.board}
              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              {BOARD_OPTIONS.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection (Checkboxes / Chips) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>मेरे चुने हुए विषय ({formData.selectedSubjects.length})</span>
              </label>
              {formData.classId !== '10' && (
                <button
                  type="button"
                  onClick={() => setShowAllSubjects(!showAllSubjects)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer bg-indigo-50/80 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800"
                >
                  {showAllSubjects ? `केवल ${formData.stream} के विषय दिखाएं` : '+ अन्य स्ट्रीम के विषय देखें'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayedSubjects.map((sub) => {
                const isSelected = formData.selectedSubjects.includes(sub.name);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubjectItem(sub.name)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl ${sub.bg} flex items-center justify-center text-lg shrink-0`}
                      >
                        {sub.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {sub.name}
                          </h4>
                          {formData.classId !== '10' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {sub.stream === 'General' ? 'Lang' : sub.stream}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {sub.hindiName}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium truncate">
            होम स्क्रीन पर <strong>Class {formData.classId}</strong> के विषय दिखेंगे
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipOrCancel}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFirstTimeSetup ? 'बाद में करें (Skip)' : 'रद्द करें'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>सहेजा गया!</span>
                </>
              ) : isFirstTimeSetup ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>शुरू करें (Save & Start) 🚀</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>प्रोफ़ाइल सहेजें</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
