import React, { useState } from 'react';
import { HeaderBar } from '../components/ui/HeaderBar';
import { Mail, Send, Check, Copy, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jhadheeraj97@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent(`[Abhyaas - ${category.toUpperCase()}] ${subject || 'Student Query'}`);
    const mailBody = encodeURIComponent(message || 'Hello Abhyaas Team,\n\n');
    window.location.href = `mailto:jhadheeraj97@gmail.com?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <HeaderBar
        title="Contact Us"
        subtitle="संपर्क एवं सहायता"
        showBack={true}
      />

      <div className="space-y-5 px-1">
        {/* Contact Info Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              हमसे संपर्क करें (Get in Touch)
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            यदि आपको किसी प्रश्न या उत्तर में कोई त्रुटि मिलती है, नया मॉडल पेपर सुझाना चाहते हैं, या तकनीकी सहायता चाहिए, तो आप सीधे संपर्क कर सकते हैं।
          </p>

          {/* Official Email Box */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">आधिकारिक ईमेल आईडी</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">jhadheeraj97@gmail.com</p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              type="button"
              className="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हो गया!' : 'ईमेल कॉपी करें'}</span>
            </button>
          </div>
        </div>

        {/* Quick Email Composer Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black">सीधा संदेश भेजें (Send Message)</h3>
          </div>

          <form onSubmit={handleSendMail} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                विषय श्रेणी (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="question-error">प्रश्न / उत्तर में सुधार (Correction)</option>
                <option value="new-paper">नया मॉडल पेपर अनुरोध (New Paper Request)</option>
                <option value="tech-issue">तकनीकी समस्या / बग रिपोर्ट (App Bug)</option>
                <option value="adsense-legal">कॉपीराइट या विधिक पूछताछ (AdSense/Legal)</option>
                <option value="general">सामान्य सुझाव (General Feedback)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                शीर्षक (Subject)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="जैसे: कक्षा 10 विज्ञान मॉडल सेट 2 में सुधार"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                आपका संदेश (Message)
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="अपना संदेश यहाँ लिखें..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ईमेल भेजें (Open in Gmail / Email App)</span>
            </button>
          </form>
        </div>

        {/* Developer & Disclaimer Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>उत्तर देने की समय-सीमा (Response Time)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            सभी संदेशों और प्रतिक्रियाओं की समीक्षा डेवलपर (Dheeraj Jha) द्वारा 24 से 48 घंटे के भीतर की जाती है। आपके अमूल्य सुझावों से ऐप को और बेहतर बनाने में मदद मिलती है।
          </p>
        </div>
      </div>
    </div>
  );
};
