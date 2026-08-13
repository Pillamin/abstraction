# 🧩 추상화(Abstraction) - 중학교 정보 교과 학습 웹 애플리케이션

> **중학교 정보 교과 '추상화(Abstraction)' 개념 학습 및 실생활 문제 해결 능력 배양을 위한 인터랙티브 웹 애플리케이션**  
> 실생활 밀착형 상황(자판기, 배달 앱, 교통카드 등)을 통해 **상태 정의**, **핵심 요소 추출**, **IPO(입력-처리-출력) 구조화** 3단계를 직관적이고 재미있게 학습합니다.

---

## 🌟 주요 기능 (Key Features)

- 🔓 **비회원 즉시 학습**: 개인정보 수집이나 회원가입 절차 없이 클릭 한 번으로 자유롭게 학습 시작.
- 🥤 **10가지 실생활 문제 시나리오**: 무인 자판기, 배달 앱, 교통카드, 도서관 키오스크 등 중학생 눈높이에 맞춘 문제 상황 제공.
- 🧩 **3단계 추상화 인터랙티브 프로세스**:
  - **1단계 (상태 정의)**: 초기 상태(Start)와 목표 상태(Goal) 카드 드래그 앤 드롭 분류.
  - **2단계 (핵심 요소 추출)**: 문제 해결에 꼭 필요한 정보와 불필요한 비핵심 요소(소음 정보) 구분.
  - **3단계 (IPO 구조화)**: 입력(Input)-처리(Process)-출력(Output) 모델 완성 및 알고리즘 조건문 빈칸 채우기.
- 📖 **시각적 개념 가이드 (`/learn`)**: 추상화 핵심 개념과 생활 속 적용 사례를 직관적인 카드 형태로 제공.
- ⚙️ **교사 전용 관리자 패널 (`/admin`)**: PIN 인증 후 문제 추가/수정/삭제, 데이터 .js 파일 내보내기/업로드, Firebase Firestore 클라우드 동기화 지원.
- 🏆 **게이미피케이션 & 진도 자동 저장**: 뱃지 수집, 폭죽 연출(`canvas-confetti`), 사운드 효과음, `localStorage` 기반 학습 진도 보관.

---

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework & Library**: React (Vite)
- **Routing**: React Router DOM (v7)
- **Styling**: Vanilla CSS / TailwindCSS (v4)
- **Icons & Animation**: Lucide React, Canvas-Confetti

### Backend & Database
- **Database**: Firebase Firestore (선택적 클라우드 데이터 동기화)
- **Local Storage**: Web Storage API (`localStorage` 기반 진도 및 문제 데이터 저장)

### Deployment & Tools
- **Build Tool**: Vite
- **Deployment**: Vercel

---

## 📁 디렉토리 구조 (Directory Structure)

```text
abstraction-app/
├── public/                # 파비콘 및 사운드 효과음 등 정적 에셋
├── src/
│   ├── components/        # UI 컴포넌트 모듈
│   │   ├── admin/         # 교사 전용 관리자 패널 (AdminPanel.jsx)
│   │   ├── common/        # Header, Footer, 힌트/정답 모달 등 공통 UI
│   │   ├── practice/      # 3단계 학습 인터랙티브 컴포넌트 (Step1, Step2, Step3)
│   │   └── step/          # 스텝별 렌더링 뷰
│   ├── config/            # Firebase 설정 및 CRUD 헬퍼 (firebase.js)
│   ├── data/              # 초기 10개 실생활 문제 시나리오 (initialProblems.js)
│   ├── pages/             # 페이지 라우트 (Home, Practice, Learn, Admin)
│   ├── App.jsx            # 메인 데이터 흐름 및 라우팅
│   └── main.jsx           # 앱 진입점
├── vite.config.js         # Vite 개발 서버 및 미들웨어 설정
└── package.json
```

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론 및 패키지 설치

```bash
git clone https://github.com/Pillamin/abstraction.git
cd abstraction/abstraction-app
npm install
```

### 2. 환경 변수 설정 (`.env`)

`abstraction-app` 루트 경로에 `.env` 파일을 생성하고 아래 구조 예시를 참고하여 필요한 설정을 입력합니다.

### 3. 로컬 개발 서버 실행

```bash
npm run dev
```

서버 실행 후 브라우저에서 `http://localhost:5173` 으로 접속합니다.

---

## 🔑 환경 변수 (Environment Variables)

`.env` 파일에 필요한 설정 항목 예시 구조입니다. (실제 Secret Key 및 개인 암호는 명시하지 않으며, 미설정 시에도 로컬 데이터로 정상 작동합니다.)

```env
# Firebase Configuration (선택사항 - 미설정 시 로컬 JS 데이터로 동작)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 교사 전용 관리자 PIN 암호
VITE_ADMIN_PIN=your_custom_admin_pin
```

---

