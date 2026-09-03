// src/pages/Home.jsx
// 메인 대시보드 — 3가지 학습 코스(개념 학습, 개념 퀴즈, 실생활 문제) 바로가기 및 실생활 문제 선택 화면

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy,
  Lock,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Lightbulb,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import ConceptIntroModal from '../components/common/ConceptIntroModal';
import confetti from 'canvas-confetti';

export default function Home({ problems, completedIds, entered = false, setEntered }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);

  // 학습 상태 로컬스토리지 확인
  const [learnDone, setLearnDone] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    setLearnDone(localStorage.getItem('abstraction_learn_completed') === 'true');
    setQuizDone(localStorage.getItem('abstraction_quiz_passed') === 'true');
  }, [location]);

  const mainProblems = problems.filter((p) => !p.isTutorial && !p.hidden);
  const mainCompleted = mainProblems.filter((p) => completedIds.has(p.id)).length;
  const total = mainProblems.length;
  const problemsDone = mainCompleted === total && total > 0;

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isIncompleteModalOpen, setIsIncompleteModalOpen] = useState(false);

  const isPracticeRoute = location.pathname.startsWith('/practice') || location.state?.showGrid || entered;

  // 메인 대시보드 (홈 URL이고 /practice가 아닐 때 3개 카드 대시보드 표시)
  if (!isPracticeRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-4 sm:py-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-4 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs sm:text-sm font-extrabold px-4 py-1 rounded-full mb-3 shadow-2xs">
            <Sparkles size={16} className="text-indigo-600" />
            중학교 정보
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-2">
            추상화 <span className="text-indigo-600">(Abstraction)</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-bold max-w-xl mx-auto leading-relaxed break-keep">
            단계별 활동을 통해 추상화를 학습해봅시다.
          </p>
        </div>

        {/* 3 Main Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {/* Card 1: 개념 학습 */}
          <div
            onClick={() => navigate('/learn', { state: { mode: 'SLIDES' } })}
            className={`card-bento p-6 rounded-3xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden hover:-translate-y-1.5 hover:shadow-xl ${learnDone
                ? 'bg-white border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
              }`}
          >
            <div className="absolute top-4 right-4">
              {learnDone ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  학습 완료
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  미완료
                </span>
              )}
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                📖
              </div>
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">Step 1</span>
              <h2 className="text-xl font-black text-slate-800 mt-1 mb-2 group-hover:text-indigo-600 transition-colors">
                개념 학습
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed break-keep">
                핵심 개념과 내용을 슬라이드로 학습합니다.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                학습하기 <ChevronRight size={16} />
              </span>
            </div>
          </div>

          {/* Card 2: 개념 퀴즈 */}
          <div
            onClick={() => navigate('/learn', { state: { mode: 'QUIZ' } })}
            className={`card-bento p-6 rounded-3xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden hover:-translate-y-1.5 hover:shadow-xl ${quizDone
                ? 'bg-white border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
              }`}
          >
            <div className="absolute top-4 right-4">
              {quizDone ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  학습 완료
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  미완료
                </span>
              )}
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                📝
              </div>
              <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">Step 2</span>
              <h2 className="text-xl font-black text-slate-800 mt-1 mb-2 group-hover:text-purple-600 transition-colors">
                개념 퀴즈
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed break-keep">
                객관식 퀴즈를 통해 학습 성과를 점검합니다.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                퀴즈 풀기 <ChevronRight size={16} />
              </span>
            </div>
          </div>

          {/* Card 3: 실생활 문제 */}
          <div
            onClick={() => navigate('/practice')}
            className={`card-bento p-6 rounded-3xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-200 group relative overflow-hidden hover:-translate-y-1.5 hover:shadow-xl ${problemsDone
                ? 'bg-white border-emerald-300 ring-2 ring-emerald-100 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
              }`}
          >
            <div className="absolute top-4 right-4">
              {problemsDone ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  학습 완료
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  {mainCompleted} / {total} 완료
                </span>
              )}
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                ✏️
              </div>
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Step 3</span>
              <h2 className="text-xl font-black text-slate-800 mt-1 mb-2 group-hover:text-emerald-600 transition-colors">
                실생활 문제 해결
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed break-keep">
                일상 속 다양한 상황의 문제를 해결합니다.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 group-hover:text-slate-900 group-hover:translate-x-1 transition-all">
                문제 풀러가기 <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* 학습 현황 알림 버튼 (메뉴 아래로 이동) */}
        <div className="flex justify-center w-full animate-fade-up mt-1 mb-4" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={(e) => {
              if (learnDone && quizDone && problemsDone) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { x, y }
                });
                setIsCertModalOpen(true);
              } else {
                setIsIncompleteModalOpen(true);
              }
            }}
            className={
              learnDone && quizDone && problemsDone
                ? "flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 active:scale-95 transition-all cursor-pointer"
                : "flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold border border-slate-200 shadow-sm transition-all cursor-pointer"
            }
          >
            {learnDone && quizDone && problemsDone ? (
              <>
                <Trophy size={18} className="text-white drop-shadow-sm" />
                <span className="drop-shadow-sm tracking-wide">추상화 마스터 인증서</span>
              </>
            ) : (
              <>
                <Trophy size={18} className="text-slate-400" />
                <span>인증서 발급 대기 중 (진행도: {(learnDone ? 1 : 0) + (quizDone ? 1 : 0) + (problemsDone ? 1 : 0)}/3)</span>
              </>
            )}
          </button>
        </div>





        {/* Concept Modal */}
        <ConceptIntroModal
          isOpen={isConceptModalOpen}
          onClose={() => setIsConceptModalOpen(false)}
        />

        {/* Certification Modal */}
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border-2 border-emerald-300 text-center space-y-5 animate-bounce-in relative">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-300">
                🏆
              </div>
              <div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2 border border-emerald-200">
                  전체 학습 완료 인증서
                </span>
                <h3 className="text-2xl font-black text-slate-800">추상화 마스터</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                  모든 학습 과정을 완벽하게 수료했습니다! 🥳
                </p>
              </div>
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer text-sm"
              >
                인증서 닫기
              </button>
            </div>
          </div>
        )}

        {/* Incomplete Progress Notice Modal */}
        {isIncompleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center space-y-5 animate-bounce-in relative">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-amber-300">
                🎯
              </div>
              <div>
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2 border border-amber-200">
                  학습 진행 안내
                </span>
                <h3 className="text-2xl font-black text-slate-800">조금만 더 힘내세요!</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                  3단계의 과정을 모두 완료해야 합니다.
                </p>
              </div>
              <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-bold text-slate-600">현재 해결 완료:</span>
                  <span className="font-black text-emerald-700">{(learnDone ? 1 : 0) + (quizDone ? 1 : 0) + (problemsDone ? 1 : 0)}개</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-bold text-slate-600">남은 단계 수:</span>
                  <span className="font-black text-amber-700">{3 - ((learnDone ? 1 : 0) + (quizDone ? 1 : 0) + (problemsDone ? 1 : 0))}개</span>
                </div>
              </div>
              <button
                onClick={() => setIsIncompleteModalOpen(false)}
                className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer text-sm"
              >
                확인 및 학습 계속하기 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex items-center justify-center p-4 overflow-hidden relative">
        <div className="relative w-full max-w-[780px]">
          {/* 메인 콘텐츠 바깥 왼쪽 위 모서리에 떠 있는 버튼 */}
          <button
            onClick={() => navigate('/', { state: { resetHome: Date.now() } })}
            className="absolute top-0 -left-[105px] flex items-center gap-1.5 bg-white/80 backdrop-blur hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-sm hover:shadow-md z-50"
          >
            <span className="text-lg leading-none">←</span>
            <span>메인화면</span>
          </button>

          {/* 메인 카드보드 컨테이너 */}
          <div className="card-bento w-full max-w-[780px] h-[600px] bg-white shadow-2xl p-6 relative overflow-hidden flex flex-col rounded-3xl border border-indigo-100 animate-fade-up">
            {/* Header */}
            <div className="mb-6 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">
                    문제를 선택하세요 👆
                  </h2>
                  <p className="text-slate-400 mt-1">실생활 문제 중 원하는 것을 골라 시작하세요.</p>
                </div>
                <div className="flex items-center gap-2.5">

                  <button
                    onClick={() => setIsConceptModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-900 border-2 border-indigo-600 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <BookOpen size={16} className="text-indigo-600" />
                    <span>개념 설명 보기</span>
                  </button>
                  <button
                    onClick={() => navigate('/practice/problem_practice')}
                    className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-900 border-2 border-purple-600 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <GraduationCap size={17} className="text-purple-600" />
                    <span>튜토리얼</span>
                  </button>
                </div>
              </div>

              {/* Overall progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>전체 진도</span>
                  <span className="font-bold">{mainCompleted} / {total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${total > 0 ? (mainCompleted / total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Problem Grid (Scrollable) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 flex-1 overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {problems.filter((p) => !p.isTutorial && !p.hidden).map((problem, idx) => {
                const isDone = completedIds.has(problem.id);
                return (
                  <button
                    key={problem.id}
                    onClick={() => navigate(`/practice/${problem.id}`)}
                    className={`card-bento !p-3.5 flex flex-col items-center justify-center text-center hover:-translate-y-2 transition-all duration-200 cursor-pointer group relative overflow-hidden aspect-square ${isDone ? 'border-2 border-emerald-300' : 'border border-transparent hover:border-indigo-200'}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Theme gradient bg */}
                    <div
                      className={`absolute inset-0 opacity-5 bg-gradient-to-br ${problem.themeBg}`}
                    />

                    {/* Emoji (Status Indicator) */}
                    <div
                      className={`text-2xl mb-1.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isDone ? 'grayscale-0 opacity-100' : 'grayscale opacity-40'}`}
                      style={{ background: isDone ? `${problem.themeColor}15` : '#f1f5f9' }}
                    >
                      {problem.emoji}
                    </div>

                    {/* Title & Category */}
                    <div className="flex flex-col justify-center">
                      <h3 className={`font-bold text-[11px] sm:text-[12px] leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-3 break-keep ${isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                        {problem.title}
                      </h3>
                      {!problem.isTutorial && (
                        <p className="text-[10px] text-slate-400 line-clamp-1">{problem.category}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>


          </div>
        </div>
      </div>

      {/* Concept Intro Modal Popup */}
      <ConceptIntroModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />

      {/* Certification Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border-2 border-emerald-300 text-center space-y-5 animate-bounce-in relative">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-300">
              🏆
            </div>

            <div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block mb-2 border border-emerald-200">
                학습 완료 인증서
              </span>
              <h3 className="text-2xl font-black text-slate-800">추상화 실생활 문제 마스터</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                모든 실생활 문제를 완벽하게 해결했습니다! 🥳
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-600">성명 / 대상:</span>
                <span className="font-extrabold text-slate-800">중학교 정보 수강생</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-600">해결 문제 수:</span>
                <span className="font-extrabold text-emerald-700">{mainCompleted} / {total}개 (100%)</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-600">달성 등급:</span>
                <span className="font-extrabold text-amber-600">추상화 사고력 마스터 ⭐⭐⭐⭐⭐</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm border-t border-emerald-200/80 pt-2">
                <span className="font-bold text-slate-600">인증 일자:</span>
                <span className="font-extrabold text-slate-700">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCertModalOpen(false)}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer text-sm"
            >
              인증서 확인 및 닫기
            </button>
          </div>
        </div>
      )}

      {/* Incomplete Progress Notice Modal */}
      {isIncompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center space-y-5 animate-bounce-in relative">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-amber-300">
              🎯
            </div>

            <div>
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2 border border-amber-200">
                학습 진행 안내
              </span>
              <h3 className="text-2xl font-black text-slate-800">조금만 더 힘내세요!</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
                모든 문제를 해결하면 학습 완료 인증서가 발급됩니다.
              </p>
            </div>

            <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-600">현재 해결 완료:</span>
                <span className="font-black text-emerald-700">{mainCompleted}개</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-600">남은 문제 수:</span>
                <span className="font-black text-amber-700">{total - mainCompleted}개</span>
              </div>
              <div className="pt-2 border-t border-amber-200/80 text-xs font-extrabold text-amber-900 leading-relaxed">
                💡 남은 {total - mainCompleted}개의 실생활 문제를 모두 풀어서 [추상화 마스터 인증서]를 획득해보세요!
              </div>
            </div>

            <button
              onClick={() => setIsIncompleteModalOpen(false)}
              className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer text-sm"
            >
              확인 및 문제 계속 풀기 🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
