import React from 'react';
import { HeaderBar } from '../components/ui/HeaderBar';
import { ShieldCheck, Mail, Lock, Eye, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-6 pb-24">
      <HeaderBar
        title="Privacy Policy"
        subtitle="गोपनीयता नीति & AdSense नीतियां"
        showBack={true}
      />

      <div className="space-y-5 px-1">
        {/* Intro Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Privacy Policy for Abhyaas
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: September 4, 2026
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            At <strong>Abhyaas</strong> (accessible from our web application), one of our main priorities is the privacy of our visitors and students. This Privacy Policy document outlines the types of information that is collected and recorded by Abhyaas and how we use it.
          </p>
        </div>

        {/* Google AdSense & Cookies - Crucial for AdSense Approval */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/60 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Google AdSense & DoubleClick DART Cookie
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  Google Ads Settings <ExternalLink className="w-3 h-3" />
                </a>{' '}
                or via{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  aboutads.info <ExternalLink className="w-3 h-3" />
                </a>.
              </span>
            </li>
          </ul>
        </div>

        {/* Data We Collect / Local Storage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-black">
              User Data & Offline Storage
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Abhyaas is designed as an educational revision platform. We respect student privacy:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1 leading-relaxed">
            <li><strong>Local State:</strong> Quiz scores, bookmarked questions, and offline papers are stored securely on your device (browser LocalStorage & IndexedDB). We do not sell your personal activity or study logs.</li>
            <li><strong>Optional Cloud Sync:</strong> If you sign in via Google, we only store your basic name, class selection, and quiz progress to synchronize your revision across devices.</li>
          </ul>
        </div>

        {/* Children's Information (COPPA) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-black">
              Children's Privacy Protection
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online educational activity. Abhyaas does not knowingly collect any Personal Identifiable Information from children under the age of 13.
          </p>
        </div>

        {/* Contact Us Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              प्रश्न या गोपनीयता संबंधी सुझाव?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              संपर्क करें: jhadheeraj97@gmail.com
            </p>
          </div>
          <Link
            to="/contact"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs shrink-0 active:scale-95 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
