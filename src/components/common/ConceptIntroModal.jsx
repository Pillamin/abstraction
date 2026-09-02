// src/components/common/ConceptIntroModal.jsx
// 추상화 개념 학습 스토리 카드 (2페이지 가로 배치 + 선명한 색상 + 설명 텍스트 자연 통합)

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

const STORY_STEPS = [
  {
    type: 'TYPE_1_PROBLEM',
    badge: '1/6 단계',
    icon: '❓',
    title: '문제의 개념',
    examples: [
      { text: '시험 성적 평균이 몇 점이지?', tag: '학습', icon: '📊' },
      { text: '오늘 우산을 챙겨야 하나?', tag: '날씨', icon: '🌧️' },
      { text: '학교까지 어떻게 가야 제일 빠르지?', tag: '이동', icon: '🚌' },
    ],
    highlight: '컴퓨터는 이러한 실생활 문제들을 빠르고 정확하게 해결할 수 있도록 도와줍니다.'
  },
  {
    type: 'TYPE_2_SOLVING_PROCESS',
    badge: '2/6 단계',
    icon: '💻',
    title: '컴퓨터를 활용한 문제 해결 과정',
    flowSteps: [
      { num: '1', title: '문제 이해 및 분석', isAbstraction: true },
      { num: '2', title: '핵심 요소 추출', isAbstraction: true },
      { num: '3', title: '문제 구조화', isAbstraction: true },
      { num: '4', title: '알고리즘 설계', isAbstraction: false },
      { num: '5', title: '프로그래밍 및 실행', isAbstraction: false },
    ],
    highlight: '이 중 1~3단계(문제 분석, 핵심 추출, 구조화)를 통틀어 [추상화]라고 합니다.'
  },
  {
    type: 'TYPE_3_ABSTRACTION',
    badge: '3/6 단계',
    icon: '🧩',
    title: '문제 추상화의 정의',
    bullets: [
      '복잡한 문제 상황을 핵심 위주로 단순하게 정리',
      '컴퓨터가 명확하게 처리할 수 있도록 구조화',
      '불필요한 세부사항을 줄여 문제의 핵심에 집중',
      '효율적인 문제 해결 및 알고리즘 설계를 가능하게 함'
    ],
    highlight: '이제 추상화의 세부 3단계를 하나씩 살펴보겠습니다.'
  },
  {
    type: 'TYPE_4_STEP1_STATE',
    badge: '4/6 단계',
    icon: '🎯',
    title: '추상화 1단계: 상태 정의하기',
    stepDesc: '문제 해결의 출발점(초기)과 진행(현재), 도착점(목표)을 명확하게 정의하는 단계입니다.',
    stateBoxes: [
      { label: '초기 상태', badgeColor: 'bg-blue-600', border: 'border-blue-200 bg-blue-50/70', desc: '문제를 시작할 때의 상황 및 주어진 데이터', example: '성적표(국어 80, 수학 90)가 준비된 상태' },
      { label: '현재 상태', badgeColor: 'bg-amber-600', border: 'border-amber-200 bg-amber-50/70', desc: '현재 상황', example: '점수를 합산하여 평균을 계산하는 상태' },
      { label: '목표 상태', badgeColor: 'bg-emerald-600', border: 'border-emerald-200 bg-emerald-50/70', desc: '목표에 도달하여 문제가 해결된 상황', example: '목표 평균 점수(85점)가 출력된 상태' },
    ],
    highlight: '초기 상태에서 출발하여 목표 상태에 도달하는 것이 문제 해결입니다.'
  },
  {
    type: 'TYPE_5_STEP2_FEATURE',
    badge: '5/6 단계',
    icon: '🔍',
    title: '추상화 2단계: 핵심 요소 추출',
    stepDesc: '문제 해결에 필요한 핵심 요소는 남기고, 불필요한 정보는 제외하는 단계입니다.',
    features: [
      { type: 'essential', tag: '핵심 요소', title: '문제 해결에 꼭 필요한 조건이나 요소', desc: '예: 국어 점수(80점), 수학 점수(90점), 과목 수(2개)', isGood: true },
      { type: 'non_essential', tag: '비핵심 요소', title: '문제 해결과 직접 상관없는 부가 정보', desc: '예: 성적표 종이 색상, 학생의 옷 색상, 글씨체 등', isGood: false },
    ],
    highlight: '핵심 요소는 문제 해결의 목적과 상황에 따라 달라질 수 있습니다.'
  },
  {
    type: 'TYPE_6_STEP3_IPO',
    badge: '6/6 단계',
    icon: '⚙️',
    title: '추상화 3단계: 문제 구조화',
    stepDesc: '추출한 핵심 요소들을 정리 및 배열하여 통일된 구조로 만드는 단계입니다.',
    ipoCards: [
      { type: '입력', sub: '입력 데이터', desc: '문제를 해결하기 위해 컴퓨터에 넣는 데이터', bg: 'bg-indigo-50 border-indigo-200 text-indigo-900', badge: 'bg-indigo-600', example: '과목별 점수, 과목 수' },
      { type: '처리', sub: '계산 및 판단', desc: '데이터를 계산하고 판단하는 조건 및 규칙', bg: 'bg-amber-50 border-amber-200 text-amber-900', badge: 'bg-amber-600', example: '평균 점수 = (점수 합계) ÷ 과목 수' },
      { type: '출력', sub: '최종 결과물', desc: '처리가 완료된 후 컴퓨터가 내보내는 결과', bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', badge: 'bg-emerald-600', example: '평균 점수' },
    ],
    highlight: '개념 학습 완료! 이제 직접 실습 문제를 풀어봅시다.'
  }
];

export default function ConceptIntroModal({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current = STORY_STEPS[currentIdx];

  function handleNext() {
    if (currentIdx < STORY_STEPS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onClose();
    }
  }

  function handlePrev() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
      {/* 팝업 창 규격: 데스크톱 780px x 600px, 모바일 반응형 */}
      <div className="card-bento responsive-concept-card w-full max-w-[780px] h-[600px] bg-white shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between rounded-3xl border border-indigo-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-extrabold px-3 py-1 rounded-full">
              {current.badge}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Card Content Area */}
        <div className="my-2 flex-1 flex flex-col justify-between overflow-hidden animate-fade-up" key={currentIdx}>
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-lg sm:text-xl shrink-0">{current.icon}</span>
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                {current.title}
              </h3>
            </div>

            {/* SLIDE 1: TYPE_1_PROBLEM */}
            {current.type === 'TYPE_1_PROBLEM' && (
              <div className="space-y-4 mb-2">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-center shadow-sm">
                  <p className="text-base sm:text-lg font-extrabold text-indigo-950 leading-relaxed break-keep">
                    <span className="text-indigo-600 underline decoration-indigo-300">
                      생활 속에서 해결해야 하는 질문 또는 과제
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-base sm:text-lg font-black text-slate-800 mb-2 text-left flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl">📌</span>
                    <span>실생활 예시</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {current.examples.map((ex, i) => (
                      <div key={i} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-start items-start min-h-[85px] shadow-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{ex.icon}</span>
                          <span className="text-xs font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">{ex.tag}</span>
                        </div>
                        <span className="text-slate-800 font-extrabold text-sm leading-snug break-keep text-left">{ex.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-base sm:text-lg font-black text-slate-800 mb-2 text-left flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl">💻</span>
                    <span>컴퓨터로 문제를 해결하면 좋은 점</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                      <span className="text-base shrink-0">⚡</span>
                      <p className="text-slate-800 font-extrabold text-sm leading-snug break-keep text-left">
                        많은 문제나 데이터를 빠르고 정확하게 처리
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                      <span className="text-base shrink-0">🔄</span>
                      <p className="text-slate-800 font-extrabold text-sm leading-snug break-keep text-left">
                        반복적인 복잡한 작업을 실수 없이 자동 수행
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                      <span className="text-base shrink-0">💾</span>
                      <p className="text-slate-800 font-extrabold text-sm leading-snug break-keep text-left">
                        방대한 자료를 안전하게 저장하고 빠른 검색
                      </p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                      <span className="text-base shrink-0">🌐</span>
                      <p className="text-slate-800 font-extrabold text-sm leading-snug break-keep text-left">
                        장소 제약 없이 결과를 쉽게 공유하고 협업
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: TYPE_2_SOLVING_PROCESS */}
            {current.type === 'TYPE_2_SOLVING_PROCESS' && (
              <div className="flex items-start justify-center gap-6 pt-5 pb-2">
                {/* 좌측: 1~5단계 세로 목록 */}
                <div className="flex flex-col gap-2 w-[250px] shrink-0">
                  {current.flowSteps.map((step) => (
                    <div
                      key={step.num}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition-all shadow-xs ${
                        step.isAbstraction
                          ? 'border-emerald-400 bg-emerald-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        step.isAbstraction ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {step.num}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 중앙: 1~3단계를 지목하는 중괄호({) 기호 SVG */}
                <div className="flex flex-col justify-start shrink-0 pt-0.5">
                  <svg className="w-7 h-[146px] text-emerald-500" viewBox="0 0 24 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M 4 5 Q 18 5 18 25 L 18 40 Q 18 50 24 50 Q 18 50 18 60 L 18 75 Q 18 95 4 95" />
                  </svg>
                </div>

                {/* 우측: 추상화 설명 박스 */}
                <div className="w-[300px] shrink-0 flex flex-col justify-center h-[146px] pt-0.5">
                  <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col gap-2">
                    <span className="text-base sm:text-lg font-black text-emerald-800 border-b border-emerald-200 pb-1 inline-block">
                      추상화
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-950 leading-relaxed break-keep">
                      1~3단계를 통틀어 <span className="text-emerald-700 font-black underline underline-offset-4">추상화</span>라고 합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: TYPE_3_ABSTRACTION */}
            {current.type === 'TYPE_3_ABSTRACTION' && (
              <div className="space-y-4 mb-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-center shadow-sm">
                  <p className="text-base sm:text-lg font-extrabold text-purple-950 leading-relaxed break-keep">
                    문제를 이해·분석하고, 핵심 요소만 추출한 뒤,<br />
                    단순한 형태로 구조화하는 과정
                  </p>
                </div>

                <div>
                  <p className="text-base sm:text-lg font-black text-slate-800 mb-2 text-left flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl">🚀</span>
                    <span>문제 추상화 과정</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 flex flex-col justify-start items-start shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">1</span>
                        <span className="text-xs sm:text-sm font-black text-amber-950 break-keep">상태 정의하기</span>
                      </div>
                      <span className="pl-7 pr-7 text-xs sm:text-sm font-bold text-slate-700 leading-snug break-keep text-left">
                        초기·현재·목표 상태를 명확하게 정의
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 flex flex-col justify-start items-start shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">2</span>
                        <span className="text-xs sm:text-sm font-black text-amber-950 break-keep">핵심 요소 추출</span>
                      </div>
                      <span className="pl-7 pr-7 text-xs sm:text-sm font-bold text-slate-700 leading-snug break-keep text-left">
                        불필요한 정보를 제거하고<br />핵심 요소만 추출
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50/70 flex flex-col justify-start items-start shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black shrink-0">3</span>
                        <span className="text-xs sm:text-sm font-black text-amber-950 break-keep">문제 구조화</span>
                      </div>
                      <span className="pl-7 pr-7 text-xs sm:text-sm font-bold text-slate-700 leading-snug break-keep text-left">
                        추출한 핵심 요소를 체계적인 형태로 정리
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-base sm:text-lg font-black text-slate-800 mb-2 text-left flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl">💡</span>
                    <span>문제 추상화의 필요성</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {current.bullets.map((b, i) => (
                      <div key={i} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800 font-extrabold text-xs sm:text-sm shadow-xs">
                        <span className="text-purple-600 text-base font-black shrink-0">✔</span>
                        <span className="break-keep leading-snug">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: TYPE_4_STEP1_STATE */}
            {current.type === 'TYPE_4_STEP1_STATE' && (
              <div className="space-y-4 my-auto py-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                    {current.stepDesc}
                  </p>
                </div>

                {/* 좌우 2컬럼 레이아웃: 좌측 3가지 상태 블록 (가로길이 조절) / 우측 예시 정리 박스 */}
                <div className="flex gap-3.5 items-stretch">
                  {/* 좌측: 상태 3가지 정의 (가로 1줄씩 3줄 배치) */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    {current.stateBoxes.map((sb, i) => (
                      <div key={i} className={`p-3 rounded-2xl border-2 ${sb.border} flex items-center gap-3.5 h-[48px] shadow-sm transition-all hover:shadow-md`}>
                        <span className={`inline-block text-xs font-black px-3 py-1.5 rounded-xl text-white shadow-xs shrink-0 w-[85px] text-center ${sb.badgeColor}`}>
                          {sb.label}
                        </span>
                        <div className="flex-1 border-l-2 border-slate-200/60 pl-3">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep leading-relaxed text-left">
                            {sb.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 우측: 전체 통합 실생활 예시 정리 박스 */}
                  <div className="w-[285px] shrink-0 p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 flex flex-col justify-center shadow-sm">
                    <div>
                      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-indigo-200/80">
                        <span className="text-base">💡</span>
                        <span className="text-sm sm:text-base font-black text-indigo-950">성적 평균 계산 문제 실생활 예시</span>
                      </div>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">초기</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">과목별 점수를 아는 상태</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">현재</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">평균을 계산하고 있는 상태</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">목표</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">평균 점수를 아는 상태</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5: TYPE_5_STEP2_FEATURE */}
            {current.type === 'TYPE_5_STEP2_FEATURE' && (
              <div className="space-y-4 my-auto py-2">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                    {current.stepDesc}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {current.features.map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 sm:p-4.5 rounded-2xl border-2 flex flex-col justify-center min-h-[105px] shadow-sm transition-all hover:shadow-md ${
                        item.isGood ? 'border-emerald-300 bg-emerald-50/70' : 'border-rose-300 bg-rose-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.isGood ? (
                          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                        ) : (
                          <XCircle className="text-rose-500 shrink-0" size={20} />
                        )}
                        <span className={`text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-md shadow-xs ${
                          item.isGood ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className="pl-7 pr-2 text-sm sm:text-base font-medium text-slate-700 break-keep leading-relaxed text-left">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 5페이지 하단 공백 전용 실생활 예시 정리 박스 */}
                <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 shadow-sm text-left space-y-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-200/80">
                    <span className="text-base">💡</span>
                    <span className="text-sm sm:text-base font-black text-indigo-950">성적 평균 계산 문제 실생활 예시</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5 pt-0.5">
                    <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">핵심</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 break-keep leading-snug">국어 점수, 수학 점수, 영어 점수, 과목 수</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-indigo-100/80">
                      <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">비핵심</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-700 break-keep leading-snug">성적표 종이 색상, 학생 옷 색상, 글씨 폰트</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 6: TYPE_6_STEP3_IPO */}
            {current.type === 'TYPE_6_STEP3_IPO' && (
              <div className="space-y-3.5 my-auto py-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                    {current.stepDesc}
                  </p>
                </div>

                {/* IPO 구조화 장점 설명 박스 */}
                <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-2xs flex items-center gap-3 text-left">
                  <span className="text-lg shrink-0">💡</span>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-black text-indigo-950 inline-block mb-0.5">IPO(입력-처리-출력) 형태로 구조화하는 이유</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed break-keep">
                      실제 컴퓨팅 시스템의 데이터 처리 절차 흐름을 쉽게 파악할 수 있어 문제를 체계적으로 정리하기에 좋습니다.
                    </p>
                  </div>
                </div>

                {/* 좌우 2컬럼 레이아웃: 좌측 3가지 IPO 정의 / 우측 실생활 예시 정리 박스 */}
                <div className="flex gap-3.5 items-stretch">
                  {/* 좌측: IPO 3가지 개념 & 정의 */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    {current.ipoCards.map((card, i) => (
                      <div key={i} className={`p-3.5 rounded-2xl border-2 ${card.bg} flex items-center gap-3.5 shadow-sm transition-all hover:shadow-md`}>
                        <span className={`inline-block text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl text-white shadow-xs shrink-0 text-center ${card.badge}`}>
                          {card.type}
                        </span>
                        <div className="flex-1 border-l-2 border-slate-200/60 pl-3.5">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep leading-relaxed text-left">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 우측: 성적 평균 계산 실생활 예시 정리 박스 */}
                  <div className="w-[285px] shrink-0 p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 flex flex-col justify-center shadow-sm">
                    <div>
                      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-indigo-200/80">
                        <span className="text-base">💡</span>
                        <span className="text-sm sm:text-base font-black text-indigo-950">성적 평균 계산 문제 실생활 예시</span>
                      </div>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">입력</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">과목별 점수, 과목 수</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">처리</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">평균 점수 = (점수 합계) ÷ 과목 수</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md shrink-0 w-[42px] text-center">출력</span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">평균 점수</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Highlight (1, 2, 3, 6단계에서는 숨김) */}
          {current.type !== 'TYPE_1_PROBLEM' && current.type !== 'TYPE_2_SOLVING_PROCESS' && current.type !== 'TYPE_3_ABSTRACTION' && current.type !== 'TYPE_6_STEP3_IPO' && (
            <div className="flex flex-col gap-2 mt-2 shrink-0">
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-950 font-extrabold leading-relaxed flex items-center gap-3 break-keep">
                <Lightbulb size={20} className="text-amber-500 shrink-0" />
                <span>{current.highlight}</span>
              </div>

              {/* 4페이지 전용 꿀팁 박스 (동일 디자인: bg-amber-50 border-amber-300) */}
              {current.type === 'TYPE_4_STEP1_STATE' && (
                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-950 font-extrabold leading-relaxed flex items-center gap-3 break-keep">
                  <Lightbulb size={20} className="text-amber-500 shrink-0" />
                  <span>상태 정의를 명확하게 해야 문제 해결 방향 설정 및 알고리즘 설계가 쉬워집니다.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 shrink-0">
          <div className="flex gap-2">
            {STORY_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all ${
                  i === currentIdx ? 'bg-indigo-600 w-7' : 'bg-slate-200 w-2.5'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2.5">
            {currentIdx > 0 && (
              <button
                onClick={handlePrev}
                className="btn-secondary text-xs sm:text-sm py-2 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer font-bold leading-none"
              >
                <ChevronLeft size={16} />
                <span>이전</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary text-xs sm:text-sm py-2 px-6 inline-flex items-center justify-center gap-1.5 cursor-pointer font-extrabold leading-none"
            >
              {currentIdx < STORY_STEPS.length - 1 ? (
                <>
                  <span>다음 개념</span>
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  <span>닫기</span>
                  <X size={16} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
