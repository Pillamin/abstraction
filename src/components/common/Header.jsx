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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left section: Home Button + Main Title + Concept Button */}
          <div className="flex items-center gap-3">
            {/* Home Icon Button */}
            <button
              onClick={() => {
                const event = new CustomEvent('request-navigate-home', { cancelable: true });
                const notCancelled = window.dispatchEvent(event);
                if (notCancelled) {
                  navigate('/', { state: { resetHome: Date.now() } });
                }
              }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
              title="홈으로 이동"
            >
              <HomeIcon size={20} />
            </button>

            {/* Main Title Text (클릭 불가 고정 텍스트) */}
            <span className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight shrink-0 select-none">
              Ⅲ. 알고리즘과 프로그래밍 - 추상화
            </span>

            {/* Concept Modal Button (실습 문제 페이지에서만 표시) */}
            {showConceptBtn && (
              <button
                onClick={() => setIsConceptModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold px-3 py-1.5 rounded-full border border-indigo-200 transition-all cursor-pointer shadow-xs hover:shadow-sm transform hover:-translate-y-0.5 ml-1"
              >
                <Lightbulb size={15} className="text-indigo-600 shrink-0" />
                <span>개념 설명 보기</span>
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
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
