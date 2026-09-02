// src/pages/Practice.jsx
// 스텝바이스텝 메인 학습 페이지 — 튜토리얼 단계별 팝업 모달 안내

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, HelpCircle, BookOpen } from 'lucide-react';
import Step1StateDefinition from '../components/step/Step1StateDefinition';
import Step2FeatureExtraction from '../components/step/Step2FeatureExtraction';
import Step3IpoStructuring from '../components/step/Step3IpoStructuring';
import ConceptIntroModal from '../components/common/ConceptIntroModal';

const TOTAL_STEPS = 3;

export default function Practice({ problems, completedIds, onComplete, soundOn }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [justFinished, setJustFinished] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);

  const problem = problems.find((p) => p.id === id);

  useEffect(() => {
    setJustFinished(false);
    if (!id) return;

    try {
      const savedProgress = localStorage.getItem(`abstraction_step_progress_${id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        const loadedSteps = new Set(Array.isArray(parsed) ? parsed : []);
        setCompletedSteps(loadedSteps);

        // Next unsolved step to jump into directly
        const nextTarget = [1, 2, 3].find((s) => !loadedSteps.has(s)) || 1;
        setCurrentStep(nextTarget);
      } else {
        setCurrentStep(1);
        setCompletedSteps(new Set());
      }
    } catch {
      setCurrentStep(1);
      setCompletedSteps(new Set());
    }

    if (problem?.isTutorial) {
      setShowTutorialModal(true);
    }
  }, [id, problem]);

  useEffect(() => {
    if (problem?.isTutorial) {
      setShowTutorialModal(true);
    }
  }, [currentStep]);

  if (!problem || problem.hidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-lg mb-4">문제를 찾을 수 없거나 비공개(숨김) 처리된 문제입니다.</p>
        <button onClick={() => navigate('/', { state: { showGrid: true } })} className="btn-primary">
          문제 선택 화면으로 돌아가기
        </button>
      </div>
    );
  }

  function handleStepComplete() {
    const updated = new Set(completedSteps);
    updated.add(currentStep);
    setCompletedSteps(updated);

    try {
      localStorage.setItem(`abstraction_step_progress_${id}`, JSON.stringify([...updated]));
    } catch (e) {
      console.error(e);
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // All steps done
      if (problem.isTutorial) {
        localStorage.setItem('abstraction_tutorial_first_done', 'true');
      }
      onComplete(problem.id);
      setJustFinished(true);
    }
  }

  if (justFinished) {
    return (
      <div className="card-bento p-8 text-center max-w-lg mx-auto my-12 animate-fade-up">
        <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-500 mb-4 animate-bounce">
          <Trophy size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          {problem.isTutorial ? '튜토리얼 학습 완료! 🥳' : '문제 해결 완료! 🎉'}
        </h2>
        <div className="text-5xl mb-4">{problem.badgeIcon}</div>
        <p className="text-slate-500 mb-8 text-lg">
          <strong className="text-indigo-600">'{problem.title}'</strong> 뱃지를 획득했어요!
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => {
              if (problem.isTutorial) {
                localStorage.setItem('abstraction_tutorial_first_done', 'true');
              }
              navigate('/', { state: { resetHome: Date.now() } });
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base px-8 py-4 flex items-center justify-center gap-2 cursor-pointer font-black shadow-md hover:shadow-lg transition-all rounded-2xl transform hover:-translate-y-0.5"
          >
            <span>🏁</span>
            <span>학습 완료</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container h-full w-full max-w-7xl mx-auto px-4 py-2 flex flex-col overflow-hidden">
      {/* Back button (언제든지 홈/문제 목록으로 이동 가능) */}
      <div className="flex items-center justify-between mb-2.5 shrink-0">
        <button
          onClick={() => navigate('/', { state: { showGrid: true } })}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 shadow-2xs hover:shadow-xs active:scale-95"
        >
          <ArrowLeft size={18} className="text-slate-600" />
          <span>문제 목록으로 돌아가기</span>
        </button>
      </div>

      {/* Bento Layout: left 1/3 + right 2/3 */}
      <div className="practice-bento-layout grid grid-cols-1 lg:grid-cols-3 gap-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Left: Problem Card */}
        <div className="practice-left-col lg:col-span-1 lg:h-full lg:flex lg:flex-col lg:min-h-0">
          <div
            className="card-bento lg:flex-1 lg:overflow-y-auto p-4 flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, white 60%, ${problem.themeColor}08 100%)`,
            }}
          >
            <div>
              <div className="mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl mb-1 shadow-xs">
                  {problem.badgeIcon}
                </div>
                <span
                  className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white mb-1.5"
                  style={{ background: problem.themeColor }}
                >
                  {problem.category}
                </span>
                <h1 className="text-lg font-extrabold text-slate-800 leading-snug">{problem.title}</h1>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{problem.description}</p>
              </div>

              {/* Step progress */}
              <div className="space-y-2 mb-3">
                {(() => {
                  const targetStep = [1, 2, 3].find((s) => !completedSteps.has(s)) || 4;
                  return [1, 2, 3].map((step) => {
                    const labels = ['상태 정의', '핵심 요소 추출', 'IPO 구조화'];
                    const isDone = completedSteps.has(step);
                    const isCurrent = currentStep === step;
                    const isTarget = step === targetStep;
                    const isClickable = isDone || isCurrent || isTarget;

                    return (
                      <button
                        key={step}
                        disabled={!isClickable}
                        onClick={() => isClickable && setCurrentStep(step)}
                        className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                          isClickable
                            ? 'cursor-pointer hover:shadow-md transform hover:-translate-y-0.5'
                            : 'cursor-not-allowed opacity-50'
                        } ${
                          isCurrent
                            ? 'bg-white shadow-md border-2 border-indigo-600 ring-2 ring-indigo-100'
                            : isDone
                            ? 'bg-emerald-50/80 border border-emerald-300'
                            : isTarget
                            ? 'bg-amber-50/70 border-2 border-amber-500 shadow-2xs'
                            : 'bg-slate-100/60 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-indigo-600 text-white'
                                : isTarget
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-300 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : step}
                          </div>
                          <span
                            className={`text-xs truncate ${
                              isCurrent
                                ? 'text-indigo-900 font-black'
                                : isDone
                                ? 'text-emerald-800 font-bold'
                                : isTarget
                                ? 'text-amber-900 font-bold'
                                : 'text-slate-400 font-medium'
                            }`}
                          >
                            {step}단계: {labels[step - 1]}
                          </span>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Concept badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>추상화 3단계 과정</span>
              <span className="font-bold text-slate-600">Step {currentStep} / 3</span>
            </div>
          </div>
        </div>

        {/* Right: Step Content */}
        <div className="practice-right-col lg:col-span-2 lg:h-full lg:flex lg:flex-col lg:min-h-0">
          {/* Step tabs & Guide Popup Button Row */}
          <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
            <div className="flex gap-2">
              {(() => {
                const targetStep = [1, 2, 3].find((s) => !completedSteps.has(s)) || 4;
                return [1, 2, 3].map((step) => {
                  const isDone = completedSteps.has(step);
                  const isCurrent = currentStep === step;
                  const isTarget = step === targetStep;
                  const isClickable = isDone || isCurrent || isTarget;

                  let tabClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed';
                  if (isCurrent) {
                    tabClass = 'bg-indigo-600 text-white border-indigo-600 shadow-xs';
                  } else if (isTarget) {
                    tabClass = 'bg-amber-50 text-amber-900 border-2 border-amber-500 font-black hover:bg-amber-100 shadow-2xs';
                  } else if (isDone) {
                    tabClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
                  }

                  return (
                    <button
                      key={step}
                      disabled={!isClickable}
                      onClick={() => isClickable && setCurrentStep(step)}
                      className={`text-xs py-1.5 px-4 rounded-full font-bold transition-all border flex items-center gap-1.5 ${
                        isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                      } ${tabClass}`}
                    >
                      {isDone && <span>✓</span>}
                      <span>{step}단계</span>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Right: 개념 설명 보기 & 가이드 보기 Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConceptModalOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-900 border-2 border-indigo-600 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
              >
                <BookOpen size={15} className="text-indigo-600" />
                <span>개념 설명 보기</span>
              </button>

              <button
                onClick={() => setShowTutorialModal(true)}
                className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-900 border-2 border-purple-600 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
              >
                <HelpCircle size={15} className="text-purple-600" />
                <span>가이드 보기</span>
              </button>
            </div>
          </div>

          <div className="card-bento lg:flex-1 lg:overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
            {currentStep === 1 && (
              <Step1StateDefinition
                key={`${problem.id}-step1`}
                problem={problem}
                onComplete={handleStepComplete}
                soundOn={soundOn}
              />
            )}
            {currentStep === 2 && (
              <Step2FeatureExtraction
                key={`${problem.id}-step2`}
                problem={problem}
                onComplete={handleStepComplete}
                soundOn={soundOn}
              />
            )}
            {currentStep === 3 && (
              <Step3IpoStructuring
                key={`${problem.id}-step3`}
                problem={problem}
                onComplete={handleStepComplete}
                soundOn={soundOn}
              />
            )}
          </div>
        </div>
      </div>

      {/* Concept Intro Modal Popup */}
      <ConceptIntroModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
      />

      {/* Step Guide Popup Modal per Step */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-up">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-indigo-100 text-center relative animate-bounce-in">
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full inline-block mb-3">
              {currentStep}단계 학습 가이드
            </span>

            <h3 className="text-xl font-extrabold text-slate-800 mb-4">
              {currentStep === 1 && '1단계 : 상태 정의하기'}
              {currentStep === 2 && '2단계 : 핵심 요소 추출하기'}
              {currentStep === 3 && '3단계 : 문제 구조화하기'}
            </h3>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-left space-y-4 mb-6 text-slate-800 break-keep">
              {/* 개념 Section (Top) */}
              <div className="flex items-start gap-2.5 text-sm sm:text-base font-semibold leading-relaxed">
                <span className="shrink-0 text-base">📌</span>
                <div>
                  <span className="font-black text-indigo-600 mr-1.5">개념:</span>
                  {currentStep === 1 && (
                    <span>문제 해결의 출발점(초기)과 진행(현재), 도착점(목표)을 명확하게 정의하는 단계입니다.</span>
                  )}
                  {currentStep === 2 && (
                    <span>문제 해결에 필요한 핵심 요소는 남기고, 불필요한 정보는 제외하는 단계입니다.</span>
                  )}
                  {currentStep === 3 && (
                    <span>추출한 핵심 요소를 체계적으로 정리하는 단계입니다.</span>
                  )}
                </div>
              </div>

              {/* 방법 Section (Bottom) */}
              <div className="border-t border-slate-200/90 pt-3.5">
                <div className="flex items-start gap-2.5 text-sm sm:text-base font-semibold leading-relaxed">
                  <span className="shrink-0 text-base">💡</span>
                  <div>
                    <span className="font-black text-indigo-600 mr-1.5">방법:</span>
                    {currentStep === 1 && '하단 카드를 드래그하여 상단 초기 상태 및 목표 상태 칸에 배치하세요.'}
                    {currentStep === 2 && '하단 특징 카드 목록에서 필수적인 핵심 요소만 골라 상단 상자로 올려보세요.'}
                    {currentStep === 3 && '하단 카드를 상단의 입력, 처리, 출력 상자에 알맞게 배치하세요.'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTutorialModal(false)}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer text-sm"
            >
              알겠어요! {currentStep}단계 시작하기 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
