// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Admin from './pages/Admin';
import Learn from './pages/Learn';
import { initialProblems } from './data/initialProblems';
import { initialQuizQuestions } from './data/initialQuizQuestions';
import { fetchProblems, saveProblem, fetchQuizQuestions } from './config/firebase';

const STORAGE_KEY = 'abstraction_completed';

import Footer from './components/common/Footer';

function AppContent({ problems, setProblems, quizQuestions, setQuizQuestions }) {
  const location = useLocation();
  const [soundOn, setSoundOn] = useState(true);
  const [entered, setEntered] = useState(false);
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (location.state?.showGrid) {
      setEntered(true);
    } else if (location.state?.resetHome) {
      setEntered(false);
    }
  }, [location.state]);

  const isPractice = location.pathname.startsWith('/practice');
  const isAdmin = location.pathname.startsWith('/admin');
  const showConceptBtn = !isAdmin && isPractice;

  function handleComplete(problemId) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(problemId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div id="app-root" className="app-container h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((s) => !s)}
        completedCount={completedIds.has('problem_practice') ? completedIds.size - 1 : completedIds.size}
        totalCount={problems.filter((p) => !p.isTutorial && !p.hidden).length}
        showProgress={!isAdmin}
        showConceptBtn={showConceptBtn}
      />
      <main id="app-main" className="app-main flex-1 overflow-hidden relative">
        <Routes>
          <Route
            path="/"
            element={
              <div className="page-scroll-container h-full overflow-y-auto overflow-x-hidden">
                <Home
                  problems={problems}
                  completedIds={completedIds}
                  entered={entered}
                  setEntered={setEntered}
                />
              </div>
            }
          />
          <Route
            path="/learn"
            element={
              <div className="page-scroll-container h-full overflow-y-auto overflow-x-hidden">
                <Learn quizPool={quizQuestions} />
              </div>
            }
          />
          <Route
            path="/practice"
            element={
              <div className="page-scroll-container h-full overflow-y-auto overflow-x-hidden">
                <Home
                  problems={problems}
                  completedIds={completedIds}
                  entered={true}
                  setEntered={setEntered}
                />
              </div>
            }
          />
          <Route
            path="/practice/:id"
            element={
              <div className="page-scroll-container practice-scroll-container h-full overflow-hidden">
                <Practice
                  problems={problems}
                  completedIds={completedIds}
                  onComplete={handleComplete}
                  soundOn={soundOn}
                />
              </div>
            }
          />
          <Route
            path="/admin"
            element={
              <div className="page-scroll-container h-full overflow-y-auto overflow-x-hidden">
                <Admin
                  problems={problems}
                  onProblemsChange={setProblems}
                  quizQuestions={quizQuestions}
                  onQuizQuestionsChange={setQuizQuestions}
                />
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function sanitizeProblemText(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/최종 상태/g, '목표 상태').replace(/\[최종 상태\]/g, '[목표 상태]');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeProblemText);
  }
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const key of Object.keys(obj)) {
      res[key] = sanitizeProblemText(obj[key]);
    }
    return res;
  }
  return obj;
}

export default function App() {
  const [problems, setProblems] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);

  const handleProblemsChange = (newProblems) => {
    const sanitized = sanitizeProblemText(newProblems);
    setProblems(sanitized);
  };

  const handleQuizQuestionsChange = (newQuizQuestions) => {
    setQuizQuestions(newQuizQuestions);
  };

  useEffect(() => {
    // Try to load problems from Firebase; fall back to local data silently
    fetchProblems().then((remote) => {
      if (remote !== null) {
        const tutorialProb = initialProblems.find((p) => p.isTutorial);
        const hasTutorial = remote.some((p) => p.id === 'problem_practice' || p.isTutorial);
        const merged = (tutorialProb && !hasTutorial) ? [tutorialProb, ...remote] : remote;
        
        const sanitized = sanitizeProblemText(merged);
        setProblems(sanitized);
      } else {
        // Firebase fetch failed, fallback to JS file
        let loaded = initialProblems.map((p) => {
          if (p.step3 && typeof p.step3.hint === 'object') {
            return { ...p, step3: { ...p.step3, hint: p.step3.hint } };
          }
          return p;
        });
        setProblems(sanitizeProblemText(loaded));
      }
    });

    // Try to load quiz questions from Firebase
    fetchQuizQuestions().then((remoteQuiz) => {
      if (remoteQuiz !== null) {
        setQuizQuestions(remoteQuiz);
      } else {
        // Firebase fetch failed, fallback to JS file
        setQuizQuestions(initialQuizQuestions);
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <AppContent
        problems={problems}
        setProblems={handleProblemsChange}
        quizQuestions={quizQuestions}
        setQuizQuestions={handleQuizQuestionsChange}
      />
    </BrowserRouter>
  );
}
