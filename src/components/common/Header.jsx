// src/components/common/Header.jsx
import { useState } from 'react';
import { Volume2, VolumeX, Settings, Lightbulb, Home as HomeIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ConceptIntroModal from './ConceptIntroModal';

export default function Header({ soundOn, onToggleSound, completedCount = 0, totalCount = 10, showProgress = false, showConceptBtn = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4 relative">
          {/* Left section: Home Button + Main Title */}
          <div className="flex items-center gap-3 sm:gap-6 z-10">
            <button
              onClick={() => {
                const event = new CustomEvent('request-navigate-home', { cancelable: true });
                const notCancelled = window.dispatchEvent(event);
                if (notCancelled) {
                  navigate('/', { state: { resetHome: Date.now() } });
                }
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-sm sm:text-base cursor-pointer shrink-0 transition-colors"
              title="홈으로 이동"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                <HomeIcon size={20} />
              </div>
              <span className="hidden lg:inline font-black text-slate-800 tracking-tight select-none">
                III. 알고리즘과 프로그래밍 - 추상화와 알고리즘
              </span>
            </button>

            {/* Concept Modal Button (실습 문제 페이지에서만 표시) */}
            {showConceptBtn && (
              <button
                onClick={() => setIsConceptModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold px-3 py-1.5 rounded-full border border-indigo-200 transition-all cursor-pointer shadow-xs hover:shadow-sm transform hover:-translate-y-0.5 ml-1"
              >
                <Lightbulb size={15} className="text-indigo-600 shrink-0" />
                <span>개념 팝업</span>
              </button>
            )}
          </div>

          {/* Center section: Top Navigation Menu Bar */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center z-10 whitespace-nowrap">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => navigate('/learn', { state: { mode: 'SLIDES' } })}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  location.pathname === '/learn' && (!location.state || location.state?.mode === 'SLIDES')
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
                }`}
              >
                <span>📖</span>
                <span>개념 학습</span>
              </button>
              <button
                onClick={() => navigate('/learn', { state: { mode: 'QUIZ' } })}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  location.pathname === '/learn' && location.state?.mode === 'QUIZ'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50/70'
                }`}
              >
                <span>📝</span>
                <span>개념 퀴즈</span>
              </button>
              <button
                onClick={() => navigate('/practice')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  location.pathname.startsWith('/practice')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/70'
                }`}
              >
                <span>✏️</span>
                <span>실생활 문제</span>
              </button>
            </nav>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <button
              onClick={onToggleSound}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title={soundOn ? '소리 끄기' : '소리 켜기'}
              aria-label={soundOn ? '소리 끄기' : '소리 켜기'}
            >
              {soundOn ? (
                <Volume2 size={18} className="text-slate-600" />
              ) : (
                <VolumeX size={18} className="text-slate-400" />
              )}
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              title="교사 관리자"
            >
              <Settings size={16} />
              <span className="hidden sm:inline font-medium">관리자</span>
            </button>
          </div>
        </div>
      </header>

      {/* Concept Intro Modal */}
      <ConceptIntroModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />
    </>
  );
}
