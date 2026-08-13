// src/components/common/LegalModal.jsx
import { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { marked } from 'marked';

import privacyMd from '../../../개인정보처리방침.md?raw';
import termsMd from '../../../이용약관.md?raw';

export default function LegalModal({ isOpen, activeTab = 'privacy', onClose }) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contentMd = currentTab === 'privacy' ? privacyMd : termsMd;
  const htmlContent = marked.parse(contentMd || '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
              <button
                onClick={() => setCurrentTab('privacy')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentTab === 'privacy'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                개인정보처리방침
              </button>
              <button
                onClick={() => setCurrentTab('terms')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentTab === 'terms'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                이용약관
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="닫기 (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-700 text-sm leading-relaxed space-y-4">
          <div
            className="markdown-body space-y-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:border-b [&_h1]:border-slate-200 [&_h1]:pb-3 [&_h1]:mb-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:border-l-4 [&_h3]:border-blue-600 [&_h3]:pl-3 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-blue-600 [&_code]:font-mono [&_code]:text-xs [&_hr]:my-4 [&_hr]:border-slate-200"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Footer Button */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
