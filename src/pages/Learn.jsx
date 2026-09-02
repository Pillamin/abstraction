import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

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
      { label: '목표 상태', badgeColor: 'bg-emerald-600', border: 'border-emerald-200 bg-emerald-50/70', desc: '목표에 도달하여 문제가 해결된 상황', example: '최종 평균 점수(85점)가 출력된 상태' },
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
    highlight: '개념 학습 완료! 이제 퀴즈 10문항을 풀어봅시다.'
  }
];

const RAW_QUIZ_QUESTIONS = [
  {
    "id": 1,
    "question": "컴퓨터를 활용하여 문제를 해결할 때의 장점으로 가장 적절하지 않은 것은?",
    "options": [
      "방대한 데이터를 빠르고 정확하게 처리한다.",
      "반복적인 복잡한 작업을 실수 없이 자동 수행한다.",
      "사람의 분석 과정 없이 정답을 컴퓨터 스스로 알아서 만들어 낸다.",
      "시간과 장소의 제약 없이 결과를 쉽게 공유하고 협업한다."
    ],
    "correctAnswer": "사람의 분석 과정 없이 정답을 컴퓨터 스스로 알아서 만들어 낸다.",
    "explanation": "[개념 슬라이드 1/6] 컴퓨터는 사람이 명확하게 분석하고 구조화한 규칙과 데이터를 바탕으로 많은 문제나 데이터를 빠르고 정확하게 처리합니다."
  },
  {
    "id": 2,
    "question": "컴퓨터를 활용한 문제 해결 5단계 중 [추상화]에 해당하는 단계 범위로 올바르게 짝지어진 것은?",
    "options": [
      "1단계(문제 분석), 2단계(핵심 추출), 3단계(문제 구조화)",
      "4단계(알고리즘 설계), 5단계(프로그래밍 및 실행)",
      "3단계(문제 구조화), 4단계(알고리즘 설계)",
      "1단계(문제 분석)부터 5단계(프로그래밍)까지 전체"
    ],
    "correctAnswer": "1단계(문제 분석), 2단계(핵심 추출), 3단계(문제 구조화)",
    "explanation": "[개념 슬라이드 2/6] 컴퓨터를 활용한 문제 해결 5단계 중 1단계(문제 이해 및 분석), 2단계(핵심 요소 추출), 3단계(문제 구조화)를 통틀어 '추상화'라고 합니다."
  },
  {
    "id": 3,
    "question": "문제 추상화(Abstraction)의 핵심 정의와 주요 목적으로 가장 올바른 것은?",
    "options": [
      "복잡한 문제를 핵심 위주로 단순화하고 컴퓨터가 명확하게 처리하도록 구조화하는 과정",
      "프로그램의 명령 코드를 복잡하게 늘려 작성하는 과정",
      "알고리즘 설계 없이 프로그래밍부터 무작정 실행하는 과정",
      "모든 계산을 컴퓨터 대신 사람이 종이에 직접 손으로 다 쓰는 과정"
    ],
    "correctAnswer": "복잡한 문제를 핵심 위주로 단순화하고 컴퓨터가 명확하게 처리하도록 구조화하는 과정",
    "explanation": "[개념 슬라이드 3/6] 추상화는 문제를 이해·분석하고 불필요한 세부사항을 줄여 핵심 요소만 추출한 뒤, 컴퓨터가 명확하게 처리할 수 있도록 구조화하는 과정입니다."
  },
  {
    "id": 4,
    "question": "추상화 1단계 '상태 정의하기'에서 문제 해결의 출발점이 되는 상황 및 주어진 데이터를 뜻하는 상태는?",
    "options": [
      "초기 상태",
      "현재 상태",
      "목표 상태",
      "결과 상태"
    ],
    "correctAnswer": "초기 상태",
    "explanation": "[개념 슬라이드 4/6] 초기 상태는 문제를 시작할 때의 상황 및 주어진 데이터를 명확하게 정의하는 출발점입니다."
  },
  {
    "id": 5,
    "question": "추상화 1단계 '상태 정의하기'에서 문제 해결이 최종 완료되어 도달하고자 하는 결과 상황을 뜻하는 상태는?",
    "options": [
      "목표 상태",
      "초기 상태",
      "현재 상태",
      "임시 상태"
    ],
    "correctAnswer": "목표 상태",
    "explanation": "[개념 슬라이드 4/6] 목표 상태는 목표에 도달하여 문제가 최종적으로 해결된 결과 상황을 명확하게 정의하는 상태입니다."
  },
  {
    "id": 6,
    "question": "추상화 1단계 '상태 정의하기'에서 초기 상태에서 출발하여 목표 상태에 도달해 나가는 중간 과정을 뜻하는 상태는?",
    "options": [
      "현재 상태",
      "초기 상태",
      "목표 상태",
      "완료 상태"
    ],
    "correctAnswer": "현재 상태",
    "explanation": "[개념 슬라이드 4/6] 현재 상태는 초기 상태에서 출발하여 목표 상태에 도달하기 위해 문제 해결을 진행하고 있는 중간 상태를 뜻합니다."
  },
  {
    "id": 7,
    "question": "추상화 2단계 '핵심 요소 추출'에 대한 설명으로 가장 올바른 것은?",
    "options": [
      "문제 해결에 꼭 필요한 핵심 요소는 남기고, 불필요한 세부 정보는 제외한다.",
      "문제 해결 목적과 무관한 부가적인 정보도 모두 중요한 요소로 다룬다.",
      "한 번 추출한 핵심 요소는 문제 목적이 바뀌어도 절대 변하지 않는다.",
      "화려한 디자인을 완성하는 것이 핵심 요소 추출의 주된 목적이다."
    ],
    "correctAnswer": "문제 해결에 꼭 필요한 핵심 요소는 남기고, 불필요한 세부 정보는 제외한다.",
    "explanation": "[개념 슬라이드 5/6] 핵심 요소 추출은 문제 해결에 꼭 필요한 핵심 요소는 남기고, 문제 해결과 직접 상관없는 불필요한 비핵심 요소는 제외하는 단계입니다."
  },
  {
    "id": 8,
    "question": "추상화 2단계 '핵심 요소 추출'에서 [비핵심 요소]에 대한 올바른 설명은?",
    "options": [
      "문제 해결 목적과 직접 상관없는 불필요한 부가 정보로, 추상화 과정에서 제외되는 요소",
      "문제 해결에 반드시 필요한 필수 조건 및 필수 데이터",
      "컴퓨터가 가장 먼저 계산하고 판단해야 하는 핵심 규칙",
      "상태 정의하기에서 문제의 출발점이 되는 데이터"
    ],
    "correctAnswer": "문제 해결 목적과 직접 상관없는 불필요한 부가 정보로, 추상화 과정에서 제외되는 요소",
    "explanation": "[개념 슬라이드 5/6] 비핵심 요소는 문제 해결 목적과 직접적인 상관이 없는 부가적인 정보로, 추상화 과정에서 제외되는 요소입니다."
  },
  {
    "id": 9,
    "question": "추상화 2단계에서 핵심 요소와 비핵심 요소를 구분하는 가장 중요한 기준은?",
    "options": [
      "문제 해결 목적과의 직접적인 연관성 유무",
      "데이터의 글자 수나 디자인의 화려함",
      "컴퓨터의 가격이나 모니터 화면 크기",
      "문제를 해결하는 사람의 개인적인 취향"
    ],
    "correctAnswer": "문제 해결 목적과의 직접적인 연관성 유무",
    "explanation": "[개념 슬라이드 5/6] 문제 해결 목적에 꼭 필요한 정보는 핵심 요소가 되고, 목적과 직접 관련 없는 부가 정보는 비핵심 요소로 구분합니다."
  },
  {
    "id": 10,
    "question": "추상화 3단계 '문제 구조화'에서 자주 활용되는 IPO의 구성 의미를 올바르게 연결한 것은?",
    "options": [
      "Input(입력) - Process(처리) - Output(출력)",
      "Index(목록) - Page(페이지) - Output(출력)",
      "Image(이미지) - Process(처리) - Option(선택)",
      "Input(입력) - Print(인쇄) - Object(객체)"
    ],
    "correctAnswer": "Input(입력) - Process(처리) - Output(출력)",
    "explanation": "[개념 슬라이드 6/6] IPO 구조화는 데이터를 넣는 입력(Input), 계산 및 판단하는 처리(Process), 최종 결과물을 내보내는 출력(Output)으로 문제를 정리하는 방식입니다."
  },
  {
    "id": 11,
    "question": "추상화 3단계 '문제 구조화'의 IPO(입력-처리-출력) 중 [입력(Input)] 단계의 설명으로 가장 올바른 것은?",
    "options": [
      "문제를 해결하기 위해 필요한 기초 데이터 및 외부 신호를 받아들이는 단계",
      "받은 데이터를 바탕으로 합계나 평균을 계산하는 알고리즘 규칙 단계",
      "계산이 종료된 후 화면이나 스피커로 결과물을 내보내는 단계",
      "초기 상태와 목표 상태를 구분하여 문제를 완전히 종료하는 단계"
    ],
    "correctAnswer": "문제를 해결하기 위해 필요한 기초 데이터 및 외부 신호를 받아들이는 단계",
    "explanation": "[개념 슬라이드 6/6] 입력(Input) 단계는 문제를 해결하기 위해 필요한 기초 데이터나 신호를 시스템으로 받아들이는 단계입니다."
  },
  {
    "id": 12,
    "question": "추상화 3단계 '문제 구조화'의 IPO(입력-처리-출력) 중 [처리(Process)] 단계의 역할로 올바른 것은?",
    "options": [
      "입력받은 데이터를 활용하여 계산하고 판단하는 조건 및 규칙을 적용하는 과정",
      "문제를 해결하기 위해 필요한 기초 데이터를 컴퓨터에 전달하는 과정",
      "모든 과정이 완료된 후 최종 결과를 모니터에 내보내는 과정",
      "문제를 시작할 때의 초기 상태와 환경을 명확히 설정하는 과정"
    ],
    "correctAnswer": "입력받은 데이터를 활용하여 계산하고 판단하는 조건 및 규칙을 적용하는 과정",
    "explanation": "[개념 슬라이드 6/6] 처리(Process) 단계는 입력받은 데이터를 활용하여 계산하고 판단하는 조건 및 규칙을 적용하는 과정입니다."
  },
  {
    "id": 13,
    "question": "추상화 3단계 '문제 구조화'의 IPO(입력-처리-출력) 중 [출력(Output)] 단계의 역할로 올바른 것은?",
    "options": [
      "처리가 완료된 후 컴퓨터가 내보내는 최종 결과물",
      "컴퓨터가 데이터를 받아들이는 입력창 단계",
      "데이터를 계산하거나 비교 판단하는 조건 설정 단계",
      "문제를 이해하고 핵심 요소를 골라내는 단계"
    ],
    "correctAnswer": "처리가 완료된 후 컴퓨터가 내보내는 최종 결과물",
    "explanation": "[개념 슬라이드 6/6] 출력(Output)은 처리가 완료된 후 컴퓨터가 내보내는 최종 결과물입니다."
  },
  {
    "id": 14,
    "question": "추상화를 잘 적용했을 때 얻을 수 있는 효과로 보기 어려운 것은?",
    "options": [
      "불필요한 정보가 늘어나서 문제 파악이 더 복잡하고 어려워진다.",
      "복잡한 문제를 핵심 위주로 단순하게 정리할 수 있다.",
      "컴퓨터가 명확히 처리할 수 있는 형태로 문제를 구조화한다.",
      "효율적인 알고리즘 설계 및 프로그래밍 작성을 돕는다."
    ],
    "correctAnswer": "불필요한 정보가 늘어나서 문제 파악이 더 복잡하고 어려워진다.",
    "explanation": "[개념 슬라이드 3/6] 추상화를 잘 적용하면 불필요한 세부사항이 줄어들어 문제의 핵심에 집중할 수 있고 효율적인 알고리즘 설계를 가능하게 합니다."
  },
  {
    "id": 15,
    "question": "컴퓨터를 활용한 문제 해결 5단계 중 추상화(1~3단계)를 마친 뒤 진행되는 4단계와 5단계로 올바른 것은?",
    "options": [
      "4단계: 알고리즘 설계, 5단계: 프로그래밍 및 실행",
      "4단계: 문제 구조화, 5단계: 핵심 요소 추출",
      "4단계: 초기 상태 정의, 5단계: 목표 상태 정의",
      "4단계: 아이디어 회의, 5단계: 보고서 제출"
    ],
    "correctAnswer": "4단계: 알고리즘 설계, 5단계: 프로그래밍 및 실행",
    "explanation": "[개념 슬라이드 2/6] 추상화(1~3단계) 과정을 마친 후에는 4단계(알고리즘 설계)와 5단계(프로그래밍 및 실행)를 거쳐 문제를 최종 해결합니다."
  },
  {
    "id": 16,
    "question": "추상화 1단계인 '상태 정의하기'에서 다루는 3가지 상태의 조합으로 올바른 것은?",
    "options": [
      "초기 상태, 현재 상태, 목표 상태",
      "과거 상태, 현재 상태, 미래 상태",
      "입력 상태, 처리 상태, 출력 상태",
      "시작 상태, 실행 상태, 종료 상태"
    ],
    "correctAnswer": "초기 상태, 현재 상태, 목표 상태",
    "explanation": "[개념 슬라이드 4/6] 추상화 1단계에서는 초기 상태(출발점), 현재 상태(진행), 목표 상태(도착점)의 3가지 상태를 정의합니다."
  },
  {
    "id": 17,
    "question": "다음 중 [추상화의 정의(3/6 단계)]에 관한 설명으로 가장 올바른 문장은?",
    "options": [
      "복잡한 문제 상황에서 불필요한 세부사항을 줄이고 핵심 위주로 단순하게 정리하는 것",
      "문제의 모든 세부 정보와 디자인을 가능한 한 아주 복잡하게 늘려 작성하는 것",
      "알고리즘 작성 없이 프로그래밍 언어 코드부터 무작정 입력하는 과정",
      "컴퓨터를 사용하지 않고 사람이 직접 손으로 모든 시험 성적을 계산하는 것"
    ],
    "correctAnswer": "복잡한 문제 상황에서 불필요한 세부사항을 줄이고 핵심 위주로 단순하게 정리하는 것",
    "explanation": "[개념 슬라이드 3/6] 추상화란 복잡한 문제 상황을 핵심 위주로 단순하게 정리하여 컴퓨터가 명확히 처리할 수 있도록 구조화하는 것을 뜻합니다."
  },
  {
    "id": 18,
    "question": "추상화 3단계에서 핵심 요소를 IPO(입력-처리-출력) 형태로 구조화하는 주요 이유로 가장 적절한 것은?",
    "options": [
      "컴퓨팅 시스템의 데이터 처리 절차 흐름에 맞춰 체계적으로 정리하기 위해서",
      "화면 디자인의 색상을 한층 화려하게 만들기 위해서",
      "알고리즘 단계를 거치지 않고 바로 프로그램을 완성하기 위해서",
      "문제를 단순화하지 않고 더 복잡하게 늘려 작성하기 위해서"
    ],
    "correctAnswer": "컴퓨팅 시스템의 데이터 처리 절차 흐름에 맞춰 체계적으로 정리하기 위해서",
    "explanation": "[개념 슬라이드 6/6] IPO 구조화는 실제 컴퓨팅 시스템의 데이터 처리 절차 흐름을 쉽게 파악할 수 있어 문제를 체계적으로 정리하기에 좋습니다."
  },
  {
    "id": 19,
    "question": "컴퓨터를 활용한 문제 해결 5단계 중 가장 첫 번째인 1단계에서 수행하는 과정으로 가장 올바른 것은?",
    "options": [
      "해결하고자 하는 문제의 상황을 명확히 이해하고 분석한다.",
      "프로그래밍 언어 코드를 먼저 작성하여 컴퓨터에 입력한다.",
      "알고리즘 순서도를 가장 먼저 정교하게 그린다.",
      "문제 해결 결과를 모니터와 출력 장치로 확인할 준비를 마친다."
    ],
    "correctAnswer": "해결하고자 하는 문제의 상황을 명확히 이해하고 분석한다.",
    "explanation": "[개념 슬라이드 2/6] 컴퓨터를 활용한 문제 해결의 가장 첫 단계(1단계)는 해결하려는 문제를 명확하게 이해하고 분석하는 것부터 시작합니다."
  },
  {
    "id": 20,
    "question": "추상화 과정에서 핵심 요소를 선정할 때 유의해야 할 점으로 가장 올바른 설명은?",
    "options": [
      "핵심 요소는 문제 해결 목적과 상황에 따라 달라질 수 있다.",
      "한 번 정한 핵심 요소는 어떤 문제를 풀더라도 모두 동일하다.",
      "글자 수가 가장 긴 데이터만 무조건 핵심 요소가 된다.",
      "모든 세부 사항을 빠짐없이 넣어야만 핵심 요소 추출이 성공한다."
    ],
    "correctAnswer": "핵심 요소는 문제 해결 목적과 상황에 따라 달라질 수 있다.",
    "explanation": "[개념 슬라이드 5/6] 핵심 요소는 문제 해결의 목적과 주어진 상황에 따라 달라질 수 있습니다."
  },
  {
    "id": 21,
    "question": "컴퓨터를 활용한 문제 해결 5단계 중 2단계에서 수행하는 과정으로 가장 올바른 것은?",
    "options": [
      "문제 해결에 꼭 필요한 핵심 요소만 골라내고 불필요한 부가 정보는 제외한다.",
      "문제 해결과 무관한 글씨 폰트나 성적표 종이 색상 등도 모두 핵심 요소로 담는다.",
      "컴퓨터가 알아서 판단하도록 아무 정보도 추출하지 않고 비워둔다.",
      "추출한 핵심 요소를 프로그램 코드로 변환하여 바로 실행한다."
    ],
    "correctAnswer": "문제 해결에 꼭 필요한 핵심 요소만 골라내고 불필요한 부가 정보는 제외한다.",
    "explanation": "[개념 슬라이드 5/6] 2단계(핵심 요소 추출)는 문제 해결 목적에 꼭 필요한 정보만 남기고 불필요한 비핵심 요소는 제외하는 과정입니다."
  },
  {
    "id": 22,
    "question": "컴퓨터를 활용한 문제 해결 5단계 중 3단계에서 수행하는 과정으로 가장 올바른 것은?",
    "options": [
      "추출한 핵심 요소를 입력, 처리, 출력(IPO) 절차에 맞게 체계적으로 정리한다.",
      "문제를 해결하기 전 초기 상태와 목표 상태만 단순 기록한다.",
      "컴퓨터 화면의 버튼 색상과 레이아웃 디자인을 만드는 작업을 수행한다.",
      "프로그램 코드의 오류를 수정하여 최종 결과 보고서를 작성한다."
    ],
    "correctAnswer": "추출한 핵심 요소를 입력, 처리, 출력(IPO) 절차에 맞게 체계적으로 정리한다.",
    "explanation": "[개념 슬라이드 6/6] 3단계(문제 구조화)는 추출한 핵심 요소를 컴퓨팅 시스템의 데이터 처리 흐름인 입력-처리-출력(IPO) 모델로 구조화하는 과정입니다."
  }
];

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Learn({ quizPool }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'SLIDES' | 'QUIZ' | 'RESULT'
  const [mode, setMode] = useState(() => (location.state?.mode === 'QUIZ' ? 'QUIZ' : 'SLIDES'));
  const [slideIdx, setSlideIdx] = useState(0);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { qIndex: selectedOptionString }

  // State for explanation modal
  const [selectedDetailQuestion, setSelectedDetailQuestion] = useState(null);

  // Generate randomized quiz
  function startQuiz() {
    const questionsToUse = (Array.isArray(quizPool) && quizPool.length > 0) ? quizPool : RAW_QUIZ_QUESTIONS;
    const selected10 = shuffleArray(questionsToUse).slice(0, 10);
    const shuffledQuestions = selected10.map((q) => {
      const shuffledOptions = shuffleArray(q.options);
      return {
        ...q,
        options: shuffledOptions
      };
    });
    setQuizQuestions(shuffledQuestions);
    setQuizIdx(0);
    setUserAnswers({});
    setMode('QUIZ');
  }

  // Handle route mode changes
  useEffect(() => {
    if (location.state?.mode === 'QUIZ') {
      startQuiz();
    } else if (location.state?.mode === 'SLIDES') {
      setMode('SLIDES');
      setSlideIdx(0);
    }
  }, [location.state]);

  // Initial load for quiz mode if directly accessed
  useEffect(() => {
    if (mode === 'QUIZ' && quizQuestions.length === 0) {
      startQuiz();
    }
  }, [mode]);

  // Mark conceptual learn as completed when reaching the last slide (Slide 6)
  useEffect(() => {
    if (mode === 'SLIDES' && slideIdx === STORY_STEPS.length - 1) {
      localStorage.setItem('abstraction_learn_completed', 'true');
    }
  }, [mode, slideIdx]);

  // Handle choice select
  function handleSelectAnswer(option) {
    setUserAnswers((prev) => ({
      ...prev,
      [quizIdx]: option
    }));
  }

  // Calculate score & finish quiz
  const scoreResult = useMemo(() => {
    if (mode !== 'RESULT' || quizQuestions.length === 0) return { score: 0, passed: false, details: [] };

    let score = 0;
    const details = quizQuestions.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        ...q,
        selectedAnswer: selected,
        isCorrect
      };
    });

    const passed = score === quizQuestions.length; // 10/10 만점 통과

    if (passed) {
      localStorage.setItem('abstraction_quiz_passed', 'true');
    }

    return { score, passed, details };
  }, [mode, quizQuestions, userAnswers]);

  // Navigate to problem grid or tutorial after quiz pass
  function handleGoToProblems() {
    const tutorialDone = localStorage.getItem('abstraction_tutorial_first_done') === 'true';
    if (!tutorialDone) {
      navigate('/practice/problem_practice');
    } else {
      navigate('/practice');
    }
  }

  const currentSlide = STORY_STEPS[slideIdx];
  const currentQuiz = quizQuestions[quizIdx];

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-hidden">
      {/* MODE 1: CONCEPT SLIDES (데스크톱: 780px x 600px, 모바일: 반응형 및 스크롤 지원) */}
      {mode === 'SLIDES' && (
        <div className="card-bento responsive-learn-card w-full max-w-[780px] h-[600px] bg-white shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between rounded-3xl border border-indigo-100 animate-fade-up">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-extrabold px-3 py-1 rounded-full">
                {currentSlide.badge}
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                개념 학습 슬라이드
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <span>{slideIdx + 1}</span>
              <span>/</span>
              <span>{STORY_STEPS.length}</span>
            </div>
          </div>

          {/* Dynamic Card Content Area */}
          <div className="my-2 flex-1 flex flex-col justify-between overflow-hidden animate-fade-up" key={slideIdx}>
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-lg sm:text-xl shrink-0">{currentSlide.icon}</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  {currentSlide.title}
                </h3>
              </div>

              {/* SLIDE 1: TYPE_1_PROBLEM */}
              {currentSlide.type === 'TYPE_1_PROBLEM' && (
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
                      {currentSlide.examples.map((ex, i) => (
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
              {currentSlide.type === 'TYPE_2_SOLVING_PROCESS' && (
                <div className="flex items-start justify-center gap-6 pt-5 pb-2">
                  <div className="flex flex-col gap-2 w-[250px] shrink-0">
                    {currentSlide.flowSteps.map((step) => (
                      <div
                        key={step.num}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border-2 transition-all shadow-xs ${step.isAbstraction
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-slate-200 bg-white'
                          }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${step.isAbstraction ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                          }`}>
                          {step.num}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800 break-keep">
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-start shrink-0 pt-0.5">
                    <svg className="w-7 h-[146px] text-emerald-500" viewBox="0 0 24 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M 4 5 Q 18 5 18 25 L 18 40 Q 18 50 24 50 Q 18 50 18 60 L 18 75 Q 18 95 4 95" />
                    </svg>
                  </div>

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
              {currentSlide.type === 'TYPE_3_ABSTRACTION' && (
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
                      {currentSlide.bullets.map((b, i) => (
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
              {currentSlide.type === 'TYPE_4_STEP1_STATE' && (
                <div className="space-y-4 my-auto py-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                      {currentSlide.stepDesc}
                    </p>
                  </div>

                  <div className="flex gap-3.5 items-stretch">
                    <div className="flex-1 flex flex-col gap-2.5">
                      {currentSlide.stateBoxes.map((sb, i) => (
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
              {currentSlide.type === 'TYPE_5_STEP2_FEATURE' && (
                <div className="space-y-4 my-auto py-2">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                    <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                      {currentSlide.stepDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {currentSlide.features.map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 sm:p-4.5 rounded-2xl border-2 flex flex-col justify-center min-h-[105px] shadow-sm transition-all hover:shadow-md ${item.isGood ? 'border-emerald-300 bg-emerald-50/70' : 'border-rose-300 bg-rose-50/70'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {item.isGood ? (
                            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                          ) : (
                            <XCircle className="text-rose-500 shrink-0" size={20} />
                          )}
                          <span className={`text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-md shadow-xs ${item.isGood ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
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
              {currentSlide.type === 'TYPE_6_STEP3_IPO' && (
                <div className="space-y-3.5 my-auto py-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                    <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-relaxed break-keep">
                      {currentSlide.stepDesc}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-2xs flex items-center gap-3 text-left">
                    <span className="text-lg shrink-0">💡</span>
                    <div className="flex-1">
                      <span className="text-sm sm:text-base font-black text-indigo-950 inline-block mb-0.5">IPO(입력-처리-출력) 형태로 구조화하는 이유</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed break-keep">
                        실제 컴퓨팅 시스템의 데이터 처리 절차 흐름을 쉽게 파악할 수 있어 문제를 체계적으로 정리하기에 좋습니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-stretch">
                    <div className="flex-1 flex flex-col gap-2.5">
                      {currentSlide.ipoCards.map((card, i) => (
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
            {currentSlide.type !== 'TYPE_1_PROBLEM' && currentSlide.type !== 'TYPE_2_SOLVING_PROCESS' && currentSlide.type !== 'TYPE_3_ABSTRACTION' && currentSlide.type !== 'TYPE_6_STEP3_IPO' && (
              <div className="flex flex-col gap-2 mt-2 shrink-0">
                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm text-amber-950 font-extrabold leading-relaxed flex items-center gap-3 break-keep">
                  <Lightbulb size={20} className="text-amber-500 shrink-0" />
                  <span>{currentSlide.highlight}</span>
                </div>

                {currentSlide.type === 'TYPE_4_STEP1_STATE' && (
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
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${i === slideIdx ? 'bg-indigo-600 w-7' : 'bg-slate-200 w-2.5 hover:bg-slate-300'
                    }`}
                />
              ))}
            </div>

            <div className="flex gap-2.5">
              {slideIdx > 0 && (
                <button
                  onClick={() => setSlideIdx((i) => i - 1)}
                  className="btn-secondary text-xs sm:text-sm py-2 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer font-bold leading-none"
                >
                  <ChevronLeft size={16} />
                  <span>이전</span>
                </button>
              )}
              {slideIdx < STORY_STEPS.length - 1 ? (
                <button
                  onClick={() => setSlideIdx((i) => i + 1)}
                  className="btn-primary text-xs sm:text-sm py-2 px-6 inline-flex items-center justify-center gap-1.5 cursor-pointer font-extrabold leading-none"
                >
                  <span>다음 개념</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('abstraction_learn_completed', 'true');
                    navigate('/', { state: { resetHome: Date.now() } });
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm py-2.5 px-6 rounded-2xl font-black shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 animate-bounce-in leading-none"
                >
                  <span>🏁</span>
                  <span>학습 완료</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUIZ SOLVING (데스크톱: 780px x 600px, 모바일: 반응형) */}
      {mode === 'QUIZ' && currentQuiz && (
        <div className="card-bento responsive-learn-card w-full max-w-[780px] h-[600px] bg-white shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between rounded-3xl border border-indigo-100 animate-fade-up">
          {/* Header Bar */}
          <div className="flex flex-col gap-2 shrink-0 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-extrabold px-3 py-1 rounded-full">
                  개념 퀴즈
                </span>
                <span className="text-slate-400 text-xs font-bold">
                  문제 {quizIdx + 1} / {quizQuestions.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setSlideIdx(0);
                  setMode('SLIDES');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer font-bold"
              >
                <BookOpen size={14} />
                <span>다시 학습하기</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress-fill bg-gradient-to-r from-purple-500 to-indigo-600"
                style={{ width: `${((quizIdx + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question & Options Area */}
          <div className="my-2 flex-1 flex flex-col justify-start gap-2.5 overflow-hidden" key={quizIdx}>
            {/* Question Text */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 shadow-xs">
              <span className="inline-block text-xs font-black text-indigo-600 mb-1">
                Q{quizIdx + 1}.
              </span>
              <h3 className="text-base font-black text-slate-800 leading-snug break-keep">
                {currentQuiz.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-start overflow-y-auto pt-1">
              {currentQuiz.options.map((option, optIdx) => {
                const isSelected = userAnswers[quizIdx] === option;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(option)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer ${isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700 font-bold hover:bg-slate-50/50'
                      }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {optIdx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold leading-snug break-keep">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 shrink-0">
            <button
              onClick={() => setQuizIdx((i) => Math.max(0, i - 1))}
              disabled={quizIdx === 0}
              className="btn-secondary text-xs sm:text-sm py-2 px-4 inline-flex items-center justify-center gap-1 cursor-pointer font-bold leading-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>이전 문제</span>
            </button>

            {quizIdx < quizQuestions.length - 1 ? (
              <button
                onClick={() => setQuizIdx((i) => i + 1)}
                disabled={!userAnswers[quizIdx]}
                className="btn-primary text-xs sm:text-sm py-2 px-5 inline-flex items-center justify-center gap-1.5 cursor-pointer font-extrabold leading-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>다음 문제</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setMode('RESULT')}
                disabled={Object.keys(userAnswers).length < quizQuestions.length}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-2.5 px-6 rounded-2xl font-black shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed leading-none"
              >
                <span>🚀</span>
                <span>퀴즈 제출하기</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: RESULT & EXPLANATION (데스크톱: 780px x 600px, 모바일: 반응형) */}
      {mode === 'RESULT' && (
        <div className="card-bento responsive-learn-card w-full max-w-[780px] h-[600px] bg-white shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between rounded-3xl border border-indigo-100 animate-fade-up">
          {/* Result Banner (Top Half) */}
          <div className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center justify-center shrink-0 ${scoreResult.passed
              ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 border-emerald-300'
              : 'bg-gradient-to-br from-amber-50 via-orange-50 to-indigo-50 border-amber-300'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">{scoreResult.passed ? '🎉' : '💡'}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {scoreResult.passed ? '축하합니다! 통과하셨습니다' : '아쉽지만 조금 더 복습해볼까요?'}
              </h2>
            </div>

            <p className="text-slate-600 text-sm font-bold mb-3">
              총 {quizQuestions.length}문항 중 <span className="text-indigo-600 text-xl font-black">{scoreResult.score}</span>문항 정답 (100점 만점 기준 {scoreResult.score * 10}점)
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={handleGoToProblems}
                className="btn-primary text-xs sm:text-sm px-6 py-2.5 flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer font-black transform hover:-translate-y-0.5"
              >
                <span>✏️</span>
                <span>실생활 문제 풀러가기</span>
                <ChevronRight size={18} />
              </button>
              <button
                onClick={startQuiz}
                className="btn-secondary text-xs sm:text-sm px-5 py-2.5 flex items-center gap-1.5 cursor-pointer font-extrabold"
              >
                <RotateCcw size={16} />
                <span>퀴즈 다시 풀기</span>
              </button>
              <button
                onClick={() => {
                  setSlideIdx(0);
                  setMode('SLIDES');
                }}
                className="btn-secondary text-xs sm:text-sm px-5 py-2.5 flex items-center gap-1.5 cursor-pointer font-extrabold"
              >
                <BookOpen size={16} />
                <span>개념 다시 학습하기</span>
              </button>
            </div>

            {!scoreResult.passed && (
              <p className="text-[11px] text-amber-700 font-extrabold mt-2">
                ※ 10문항을 모두 맞히면 [개념 퀴즈 학습 완료] 뱃지가 부여됩니다! 아래 오답 카드를 클릭하여 정답 해설을 확인해보세요.
              </p>
            )}
          </div>

          {/* Question Grid Section (Bottom Half) */}
          <div className="flex-1 flex flex-col justify-start overflow-hidden mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-600" />
                <span>문항별 정/오답 확인 (클릭 시 상세 해설 팝업)</span>
              </h3>
            </div>

            {/* 10 Question Grid Buttons */}
            <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
              {scoreResult.details.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDetailQuestion(item)}
                  className={`p-2.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer hover:shadow-sm ${item.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60'
                      : 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/60'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${item.isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                      }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 truncate">
                      {item.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${item.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      {item.isCorrect ? '정답 ✓' : '오답 ✕'}
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-600 underline">해설</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explanation Detail Popup Modal */}
      {selectedDetailQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-indigo-100 text-left space-y-4 animate-bounce-in relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full text-white ${selectedDetailQuestion.isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                  }`}>
                  문항 {selectedDetailQuestion.id} - {selectedDetailQuestion.isCorrect ? '정답 ✓' : '오답 ✕'}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailQuestion(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕ 닫기
              </button>
            </div>

            {/* Question */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                Q{selectedDetailQuestion.id}. {selectedDetailQuestion.question}
              </h4>
            </div>

            {/* Detailed Explanation */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-800 font-black mb-1.5 pb-1 border-b border-amber-200/60">
                <span className="text-base">💡</span>
                <span className="text-sm font-extrabold">해설</span>
              </div>
              <p className="text-slate-800 font-bold break-keep leading-relaxed">{selectedDetailQuestion.explanation}</p>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDetailQuestion(null)}
                className="btn-primary text-xs py-2 px-5 rounded-xl font-bold cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
