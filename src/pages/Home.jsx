// src/pages/Home.jsx
// 메인 / 문제 선택 화면 — 학생 입장 + 10개 카드 그리드

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Lock, CheckCircle, ChevronRight, Sparkles, Lightbulb, BookOpen, GraduationCap } from 'lucide-react';
import ConceptIntroModal from '../components/common/ConceptIntroModal';

export default function Home({ problems, completedIds, entered = false, setEntered }) {
  const navigate = useNavigate();
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);

  const completedCount = completedIds.size;
  const mainProblems = problems.filter((p) => !p.isTutorial && !p.hidden);
  const mainCompleted = mainProblems.filter((p) => completedIds.has(p.id)).length;
  const total = mainProblems.length;

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isIncompleteModalOpen, setIsIncompleteModalOpen] = useState(false);

  useEffect(() => {
    if (entered) {
      const tutorialDone = localStorage.getItem('abstraction_tutorial_first_done') === 'true';
      if (!tutorialDone) {
        navigate('/practice/problem_practice');
      }
    }
  }, [entered, navigate]);

  const handleStartClick = () => {
    const isPassed = localStorage.getItem('abstraction_quiz_passed') === 'true';
    if (isPassed) {
      setIsChoiceModalOpen(true);
    } else {
      setIsNoticeModalOpen(true);
    }
  };

  const handleGoToProblems = () => {
    setIsChoiceModalOpen(false);
    const tutorialDone = localStorage.getItem('abstraction_tutorial_first_done') === 'true';
    if (!tutorialDone) {
      navigate('/practice/problem_practice');
    } else {
      setEntered(true);
    }
  };

  if (!entered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        {/* Hero */}
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} />
            중학교 정보 수업
          </div>
          <div className="mb-6">
            <h1 className="text-6xl font-extrabold text-indigo-500 tracking-tight leading-none">
              추상화
            </h1>
            <p className="text-slate-400 text-2xl font-semibold mt-2">
              (Abstraction)
            </p>
          </div>
          <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
            일상 속 다양한 상황을 통해<br />
            추상화를 재미있게 배워보세요! 🧩
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleStartClick}
            className="btn-primary text-xl px-10 py-5 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer rounded-2xl min-w-[260px] font-black transform hover:-translate-y-0.5"
          >
            <span>🚀</span>
            학습 시작
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Notice Modal for First-time / Non-passed Users */}
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-indigo-100 text-center space-y-5 animate-bounce-in">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
                🧩
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-1.5">추상화 학습 안내</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  개념을 학습한 후 퀴즈 10문항을 모두 맞혀야<br />실생활 문제 풀기로 넘어갈 수 있습니다.
                </p>
              </div>

              <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">📖</span>
                  <p className="text-xs sm:text-sm font-extrabold text-indigo-950">
                    <strong className="text-indigo-600">1단계:</strong> 추상화 개념 학습
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">📝</span>
                  <p className="text-xs sm:text-sm font-extrabold text-indigo-950">
                    <strong className="text-indigo-600">2단계:</strong> 추상화 퀴즈 객관식 10개 풀기
                  </p>
                </div>
                <div className="flex items-center gap-2.5 pt-1 border-t border-indigo-200/80">
                  <span className="text-base shrink-0">🏆</span>
                  <p className="text-xs sm:text-sm font-black text-indigo-900 leading-relaxed">
                    퀴즈 10문항을 <span className="text-purple-600 underline decoration-purple-300">모두 맞혀야</span> 실생활 문제 풀기가 열립니다!
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsNoticeModalOpen(false);
                    navigate('/learn');
                  }}
                  className="btn-primary text-base py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <span>🚀</span>
                  <span>확인 및 학습 시작하기</span>
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer pt-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Choice Modal for Passed Users */}
        {isChoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-indigo-100 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                🎓
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">이동할 메뉴를 선택하세요</h3>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  이미 개념 퀴즈를 모두 통과하셨습니다!<br />원하는 학습 메뉴를 선택해주세요.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsChoiceModalOpen(false);
                    navigate('/learn');
                  }}
                  className="btn-secondary text-base py-4 px-6 rounded-2xl font-black border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <span>📖</span>
                  <span>개념 학습 & 퀴즈 풀러가기</span>
                </button>
                <button
                  onClick={handleGoToProblems}
                  className="btn-primary text-base py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <span>✏️</span>
                  <span>실생활 문제 풀러가기</span>
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={() => setIsChoiceModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">
              문제를 선택하세요 👆
            </h2>
            <p className="text-slate-400 mt-1">실생활 문제 중 원하는 것을 골라 시작하세요.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (mainCompleted === total && total > 0) {
                  setIsCertModalOpen(true);
                } else {
                  setIsIncompleteModalOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-900 border-2 border-emerald-600 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="학습 완료 상태 및 인증 확인"
            >
              <Trophy size={16} className="text-emerald-600" />
              <span>{mainCompleted === total && total > 0 ? '학습 완료!' : `${mainCompleted}개 완료`}</span>
            </button>
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

      {/* Problem Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {problems.filter((p) => !p.isTutorial && !p.hidden).map((problem, idx) => {
          const isDone = completedIds.has(problem.id);
          return (
            <button
              key={problem.id}
              onClick={() => navigate(`/practice/${problem.id}`)}
              className={`card-bento text-left hover:-translate-y-2 transition-all duration-200 cursor-pointer group relative overflow-hidden ${isDone ? 'border-2 border-emerald-300' : 'border border-transparent hover:border-indigo-200'}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Theme gradient bg */}
              <div
                className={`absolute inset-0 opacity-5 bg-gradient-to-br ${problem.themeBg}`}
              />

              {/* Badge status */}
              <div className="absolute top-3 right-3">
                {isDone ? (
                  <CheckCircle size={20} className="text-emerald-500" />
                ) : (
                  <Lock size={16} className="text-slate-300" />
                )}
              </div>

              {/* Emoji */}
              <div
                className="text-4xl mb-3 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${problem.themeColor}15` }}
              >
                {problem.emoji}
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                {problem.title}
              </h3>
              {!problem.isTutorial && (
                <p className="text-xs text-slate-400 mb-3">{problem.category}</p>
              )}

              {/* Badge */}
              <div className="flex items-center gap-1">
                <span className={`text-lg ${isDone ? 'grayscale-0' : 'grayscale opacity-30'}`}>
                  {problem.badgeIcon}
                </span>
                <span className={`text-xs font-semibold ${isDone ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {isDone ? '해결 완료' : '미해결'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* All complete */}
      {completedCount === problems.length && (
        <div className="mt-10 card-bento bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-center py-10 animate-bounce-in">
          <p className="text-5xl mb-4">🏆</p>
          <h2 className="text-2xl font-extrabold text-indigo-700 mb-2">모든 문제를 해결했어요!</h2>
          <p className="text-slate-500">추상화 마스터가 되었습니다. 정말 훌륭해요!</p>
        </div>
      )}

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
    </div>
  );
}
