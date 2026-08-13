// src/components/common/Footer.jsx
import { useState } from 'react';
import LegalModal from './LegalModal';

export default function Footer() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');

  const openLegal = (tab) => {
    setActiveTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <>
      <footer className="w-full bg-white border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center flex-wrap gap-3 text-slate-500">
          <span>© 2026 교사 김상륜(신방학중학교)</span>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => openLegal('privacy')}
            className="hover:text-blue-600 hover:underline transition-colors font-medium cursor-pointer"
          >
            개인정보처리방침
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => openLegal('terms')}
            className="hover:text-blue-600 hover:underline transition-colors font-medium cursor-pointer"
          >
            이용약관
          </button>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalOpen}
        activeTab={activeTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}
