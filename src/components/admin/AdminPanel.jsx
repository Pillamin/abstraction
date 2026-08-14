// src/components/admin/AdminPanel.jsx
// 교사용 PIN 인증 및 문제 CRUD 모달 패널

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Plus, Pencil, Trash2, Save, X, ShieldCheck, Check, Info, Search, Filter, Eye, EyeOff, CloudUpload, Download, Upload, ArrowUpDown, GripVertical, RotateCcw, History } from 'lucide-react';
import { saveProblem, deleteProblemFromDB, saveQuizQuestion, deleteQuizQuestionFromDB, saveVersionSnapshot, fetchVersionSnapshots, deleteVersionSnapshot } from '../../config/firebase';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN;

const EMOJI_CATEGORIES = [
  { name: '디지털/기기', emojis: ['📱', '💻', '🖥️', '🤖', '⏰', '🎮', '🔍', '⚙️', '🔋', '📷', '🎧', '📡'] },
  { name: '생활/일상', emojis: ['🧺', '☕', '🛒', '🍔', '🎒', '📚', '🧹', '🔑', '💡', '💳', '🎁', '📫'] },
  { name: '이동/교통', emojis: ['🧭', '🚗', '🚌', '🚲', '✈️', '🚦', '🗺️', '⛽', '🎫', '🚇'] },
  { name: '문화/예술', emojis: ['🎵', '🎨', '🎬', '⚽', '🏆', '🧩', '🎤', '🍿', '🎟️', '📸'] },
  { name: '자연/상황', emojis: ['🌱', '☀️', '🌧️', '🐶', '🐱', '🏥', '🏫', '🏪', '🚨', '📌'] }
];

const CATEGORY_PRESETS = [
  '추상화 연습',
  '생활가전',
  '음식/앱',
  '교통',
  '도서관',
  '스마트폰',
  '음식/가전',
  '날씨/앱',
  '엔터테인먼트',
  '앱/쇼핑'
];

function normalizeProblemData(p) {
  const prob = JSON.parse(JSON.stringify(p || {}));
  if (!prob.id) prob.id = `problem_${Date.now()}`;
  if (!prob.title) prob.title = '';
  if (!prob.category) prob.category = '생활/편의';
  if (!prob.emoji) prob.emoji = '📝';
  if (!prob.description) prob.description = '';
  if (!prob.badgeIcon) prob.badgeIcon = '🏅';
  if (!prob.themeColor) prob.themeColor = '#6366f1';
  if (!prob.themeBg) prob.themeBg = 'from-indigo-50 to-violet-50';

  if (!prob.step1) prob.step1 = {};
  if (!prob.step1.question) prob.step1.question = '다음 상태 카드를 [초기 상태]와 [목표 상태] 상자에 배치하세요.';
  if (!prob.step1.initialStateAnswer) prob.step1.initialStateAnswer = '';
  if (!prob.step1.finalStateAnswer) prob.step1.finalStateAnswer = '';
  if (!prob.step1.options) prob.step1.options = [];
  if (!prob.step1.hint) prob.step1.hint = '';
  if (!prob.step1.explanation) prob.step1.explanation = '';

  if (!prob.step2) prob.step2 = {};
  if (!prob.step2.question) prob.step2.question = '다음 정보 카드 중 문제 해결에 꼭 필요한 것과 불필요한 것을 분류하세요.';
  if (!prob.step2.coreFeatures) prob.step2.coreFeatures = [];
  if (!prob.step2.nonCoreFeatures) prob.step2.nonCoreFeatures = [];
  if (!prob.step2.hint) prob.step2.hint = '';
  if (!prob.step2.explanation) prob.step2.explanation = '';

  if (!prob.step3) prob.step3 = {};
  if (!prob.step3.question) prob.step3.question = 'IPO(입력-처리-출력) 모델을 완성하고, 처리(Process) 단계의 빈칸을 채우세요.';
  if (!prob.step3.input) prob.step3.input = [];
  if (!prob.step3.inputOptions) prob.step3.inputOptions = [];
  if (!prob.step3.output) prob.step3.output = [];
  if (!prob.step3.outputOptions) prob.step3.outputOptions = [];
  if (!prob.step3.processQuestion) prob.step3.processQuestion = '';
  if (!prob.step3.processAnswer) prob.step3.processAnswer = '';
  if (!prob.step3.processOptions) prob.step3.processOptions = [];
  if (!prob.step3.hint) prob.step3.hint = '';
  if (!prob.step3.explanation) prob.step3.explanation = '';

  return prob;
}

export default function AdminPanel({ problems, onProblemsChange, quizQuestions = [], onQuizQuestionsChange }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Main Section Tab: 'quiz' (개념 퀴즈) | 'problems' (실생활 문제)
  const [mainSectionTab, setMainSectionTab] = useState('quiz');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'public' | 'hidden'

  // Edit / Add Modal States for Real-Life Problems
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'step1' | 'step2' | 'step3'
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingOriginalId, setEditingOriginalId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Edit / Add Modal States for Concept Quiz Questions
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState(null);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [deleteQuizConfirm, setDeleteQuizConfirm] = useState(null);

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  // Version History Modal State
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionList, setVersionList] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersionForRestore, setSelectedVersionForRestore] = useState(null);

  // Drag and drop state & Order History for Undo
  const [draggedId, setDraggedId] = useState(null);
  const [orderedProblems, setOrderedProblems] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]); // Stack of previous problem lists for Undo

  async function openVersionModal(type) {
    setShowVersionModal(true);
    setLoadingVersions(true);
    try {
      const list = await fetchVersionSnapshots(type);
      setVersionList(list);
    } catch (e) {
      console.error(e);
      setVersionList([]);
    } finally {
      setLoadingVersions(false);
    }
  }

  async function handleDeleteVersion(versionId) {
    const type = mainSectionTab === 'quiz' ? 'quiz' : 'problems';
    await deleteVersionSnapshot(type, versionId);
    setVersionList((prev) => prev.filter((v) => v.id !== versionId));
    setSyncMsg('🗑️ 해당 버전 스냅샷이 삭제되었습니다.');
    setTimeout(() => setSyncMsg(''), 4000);
  }

  async function handleRestoreVersion(versionItem) {
    const type = mainSectionTab === 'quiz' ? 'quiz' : 'problems';
    if (!versionItem || !versionItem.data) return;

    if (type === 'quiz') {
      onQuizQuestionsChange(versionItem.data);
      setSyncing(true);
      setSyncMsg('☁️ 복원된 개념 퀴즈를 DB에 반영 중...');
      try {
        for (const q of versionItem.data) {
          await saveQuizQuestion(q);
        }
        setSyncMsg(`✅ [${versionItem.dateStr}] 버전 (${versionItem.data.length}문항) 복원 완료!`);
      } catch {
        setSyncMsg(`✅ [${versionItem.dateStr}] 버전으로 로컬 복원 완료!`);
      } finally {
        setSyncing(false);
        setTimeout(() => setSyncMsg(''), 5000);
      }
    } else {
      onProblemsChange(versionItem.data);
      saveToDiskFile(versionItem.data);
      setSyncing(true);
      setSyncMsg('☁️ 복원된 실생활 문제를 DB에 반영 중...');
      try {
        for (const p of versionItem.data) {
          await saveProblem(p);
        }
        setSyncMsg(`✅ [${versionItem.dateStr}] 버전 (${versionItem.data.length}개 문제) 복원 완료!`);
      } catch {
        setSyncMsg(`✅ [${versionItem.dateStr}] 버전으로 로컬 복원 완료!`);
      } finally {
        setSyncing(false);
        setTimeout(() => setSyncMsg(''), 5000);
      }
    }
    setShowVersionModal(false);
  }

  function handleCardDragStart(e, problem) {
    if (problem.isTutorial || searchQuery || statusFilter !== 'all') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', problem.id);
    setDraggedId(problem.id);
    setOrderedProblems(problems);
  }

  function handleCardDragOver(e, targetProblem) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedId || targetProblem.isTutorial) return;

    // Use current ordered list or fallback to problems
    const current = orderedProblems || problems;
    const currentSrcIdx = current.findIndex((p) => p.id === draggedId);
    const targetIdx = current.findIndex((p) => p.id === targetProblem.id);

    if (currentSrcIdx !== -1 && targetIdx !== -1 && currentSrcIdx !== targetIdx) {
      const next = Array.from(current);
      const [item] = next.splice(currentSrcIdx, 1);
      next.splice(targetIdx, 0, item);
      setOrderedProblems(next);
    }
  }

  function handleCardDrop(e) {
    e.preventDefault();
    if (!draggedId || !orderedProblems) {
      setDraggedId(null);
      setOrderedProblems(null);
      return;
    }

    const nextList = orderedProblems;
    const moved = nextList.find((p) => p.id === draggedId);

    // Save previous state to history before committing new order
    setOrderHistory((prev) => [...prev, problems]);

    setDraggedId(null);
    setOrderedProblems(null);

    onProblemsChange(nextList);
    saveToDiskFile(nextList);

    if (moved) {
      setSyncing(true);
      setSyncMsg('☁️ 변경된 순서를 DB에 저장 중...');
      saveProblem(moved)
        .then(() => {
          setSyncMsg('✅ 문제 순서 반영 완료!');
          setTimeout(() => setSyncMsg(''), 5000);
        })
        .catch((err) => console.warn(err))
        .finally(() => setSyncing(false));
    }
  }

  function handleCardDragEnd() {
    setDraggedId(null);
    setOrderedProblems(null);
  }

  // 순서 변경 되돌리기 (Undo)
  function handleUndoReorder() {
    if (orderHistory.length === 0) return;
    const previousList = orderHistory[orderHistory.length - 1];
    setOrderHistory((prev) => prev.slice(0, -1));

    onProblemsChange(previousList);
    saveToDiskFile(previousList);

    setSyncing(true);
    setSyncMsg('↩️ 이전 문제 순서로 복구 중...');
    Promise.all(previousList.map((p) => saveProblem(p)))
      .then(() => {
        setSyncMsg('✅ 이전 순서로 되돌리기 완료!');
        setTimeout(() => setSyncMsg(''), 5000);
      })
      .catch((err) => console.warn(err))
      .finally(() => setSyncing(false));
  }

  function saveToDiskFile(list) {
    fetch('/api/save-initial-problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    }).catch((e) => console.warn('Disk save skipped:', e));
  }

  async function handleSyncToDB() {
    setSyncing(true);
    setSyncMsg('');
    try {
      for (const p of problems) {
        await saveProblem(p);
      }
      saveToDiskFile(problems);
      // Automatically record a timestamped version snapshot
      const snapshot = await saveVersionSnapshot('problems', problems, 'DB 직접 저장');
      setSyncMsg(`✅ 구글 DB 저장 및 버전 기록 완료! (${snapshot?.dateStr || '방금'})`);
      setTimeout(() => setSyncMsg(''), 5000);
    } catch (e) {
      console.error(e);
      setSyncMsg('❌ DB 전송 실패: Firestore 규칙을 확인해 주세요.');
    } finally {
      setSyncing(false);
    }
  }

  function getVersionTimestamp() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function handleDownloadFile() {
    const version = getVersionTimestamp();
    const fileContent = `// src/data/initialProblems.js\n// 버전: v_${version}\n// 저장일시: ${new Date().toLocaleString('ko-KR')}\n// 문제 데이터 세트 (총 ${problems.length}개)\n\nexport const initialProblems = ${JSON.stringify(problems, null, 2)};\n`;
    const blob = new Blob([fileContent], { type: 'text/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `initialProblems_v${version}.js`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawText = evt.target.result || '';

        // Strip single line (// ...) and block (/* ... */) JS comments
        const cleanText = rawText
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '');

        let parsedProblems = null;

        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
          parsedProblems = JSON.parse(jsonStr);
        } else {
          parsedProblems = JSON.parse(cleanText);
        }

        if (!Array.isArray(parsedProblems) || parsedProblems.length === 0) {
          alert('올바른 문제 데이터 (.js 또는 .json) 파일이 아닙니다.');
          return;
        }

        const normalized = parsedProblems.map(normalizeProblemData);

        // 기존 문제 목록과 업로드된 문제 병합 (id 일치 시 업데이트, 신규 id는 추가, 미포함 기존 문제도 모두 유지)
        const uploadedMap = new Map(normalized.map((p) => [p.id, p]));
        const mergedMap = new Map();

        // 1. 기존 문제 순서 유지하며 id 일치 항목 업데이트
        problems.forEach((p) => {
          if (p && p.id) {
            if (uploadedMap.has(p.id)) {
              mergedMap.set(p.id, uploadedMap.get(p.id));
              uploadedMap.delete(p.id);
            } else {
              mergedMap.set(p.id, p);
            }
          }
        });

        // 2. 업로드 파일에만 있는 신규 문제 추가
        uploadedMap.forEach((p, id) => {
          mergedMap.set(id, p);
        });

        const mergedProblems = Array.from(mergedMap.values());

        // 1. Update React state & localStorage
        onProblemsChange(mergedProblems);

        // 2. Save to local disk initialProblems.js
        saveToDiskFile(mergedProblems);

        // 3. Sync all merged problems to Firestore DB
        setSyncing(true);
        setSyncMsg('☁️ 업로드된 문제를 DB에 반영 중...');
        for (const p of mergedProblems) {
          await saveProblem(p);
        }

        setSyncMsg(`✅ ${normalized.length}개 업로드 처리 완료! (총 ${mergedProblems.length}개 문제 유지 및 반영)`);
        setTimeout(() => setSyncMsg(''), 5000);
      } catch (err) {
        console.error(err);
        alert('파일을 다루는 중 오류가 발생했습니다: ' + err.message);
      } finally {
        setSyncing(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  // --- Concept Quiz Download / Upload / DB Sync ---
  function handleQuizDownloadFile() {
    const version = getVersionTimestamp();
    const fileContent = `// src/data/initialQuizQuestions.js\n// 버전: v_${version}\n// 저장일시: ${new Date().toLocaleString('ko-KR')}\n// 초기 개념 퀴즈 데이터 세트 (총 ${quizQuestions.length}문항)\n\nexport const initialQuizQuestions = ${JSON.stringify(quizQuestions, null, 2)};\n`;
    const blob = new Blob([fileContent], { type: 'text/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `initialQuizQuestions_v${version}.js`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleQuizFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawText = evt.target.result || '';
        const cleanText = rawText.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
        let parsed = null;
        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsed = JSON.parse(cleanText.substring(jsonStart, jsonEnd + 1));
        } else {
          parsed = JSON.parse(cleanText);
        }

        if (!Array.isArray(parsed) || parsed.length === 0) {
          alert('올바른 개념 퀴즈 데이터 (.js 또는 .json) 파일이 아닙니다.');
          return;
        }

        onQuizQuestionsChange(parsed);

        // Try syncing to Firebase in background without blocking local state update if permissions fail
        setSyncing(true);
        setSyncMsg('☁️ 업로드된 퀴즈를 DB에 반영 중...');
        try {
          for (const q of parsed) {
            await saveQuizQuestion(q);
          }
          setSyncMsg(`✅ ${parsed.length}개 개념 퀴즈 업로드 및 DB 전송 완료!`);
        } catch (dbErr) {
          console.warn('Firebase sync failed (permission or rule setting issue):', dbErr);
          setSyncMsg(`✅ ${parsed.length}개 개념 퀴즈 업로드 완료! (DB 전송은 권한 필요)`);
        }
        setTimeout(() => setSyncMsg(''), 5000);
      } catch (err) {
        console.error(err);
        alert('퀴즈 파일 파싱 중 오류가 발생했습니다: ' + err.message);
      } finally {
        setSyncing(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  async function handleSyncQuizToDB() {
    setSyncing(true);
    setSyncMsg('');
    try {
      for (const q of quizQuestions) {
        await saveQuizQuestion(q);
      }
      // Automatically record a timestamped version snapshot for quizzes
      const snapshot = await saveVersionSnapshot('quiz', quizQuestions, '개념 퀴즈 DB 저장');
      setSyncMsg(`✅ 개념 퀴즈 DB 저장 및 버전 기록 완료! (${snapshot?.dateStr || '방금'})`);
      setTimeout(() => setSyncMsg(''), 5000);
    } catch (e) {
      console.error(e);
      setSyncMsg('❌ 퀴즈 DB 전송 실패: Firestore 규칙을 확인해 주세요.');
    } finally {
      setSyncing(false);
    }
  }

  function createNewProblemTemplate() {
    const nextNum = (problems.length + 1).toString().padStart(2, '0');
    return normalizeProblemData({
      id: `problem_${nextNum}`,
      title: '',
      emoji: '💡',
      category: '신규 카테고리',
      badgeIcon: '🏅',
      description: '',
      hidden: false,
      step1: {
        question: '다음 상태 카드를 [초기 상태]와 [목표 상태] 상자에 배치하세요.',
        initialStateAnswer: '주어진 자원과 데이터가 준비된 상태',
        finalStateAnswer: '목표 결과가 완성된 상태',
        options: [
          { id: 'c1', text: '주어진 자원과 데이터가 준비된 상태', type: 'initial' },
          { id: 'c2', text: '목표 결과가 완성된 상태', type: 'final' },
          { id: 'c3', text: '과정을 진행하고 있는 중간 상태', type: 'wrong' },
          { id: 'c4', text: '관련 없는 엉뚱한 행동을 하는 상태', type: 'wrong' },
        ],
        hint: '문제 해결의 출발점(기초 데이터)과 최종 목표 결과를 고르세요.',
        explanation: '초기 상태는 출발점 데이터이며, 목표 상태는 문제 해결 완결 상태입니다.',
      },
      step2: {
        question: '다음 정보 카드 중 문제 해결에 꼭 필요한 것과 불필요한 것을 분류하세요.',
        coreFeatures: [
          { id: 'f1', text: '핵심 정보 1' },
          { id: 'f2', text: '핵심 정보 2' },
          { id: 'f3', text: '핵심 정보 3' },
        ],
        nonCoreFeatures: [
          { id: 'f4', text: '불필요한 정보 1' },
          { id: 'f5', text: '불필요한 정보 2' },
          { id: 'f6', text: '불필요한 정보 3' },
        ],
        hint: '결과를 계산하거나 결정할 때 실제 영향을 미치는 요소만 고르세요.',
        explanation: '문제와 직접적 영향이 없는 비핵심 요소를 버려 복잡함을 단순화합니다.',
      },
      step3: {
        question: 'IPO(입력-처리-출력) 모델을 완성하고, 처리(Process) 단계의 빈칸을 채우세요.',
        input: ['입력 데이터 1', '입력 데이터 2'],
        inputOptions: ['입력 데이터 1', '입력 데이터 2', '불필요한 입력 데이터'],
        output: ['출력 결과 1', '출력 결과 2'],
        outputOptions: ['출력 결과 1', '출력 결과 2', '불필요한 출력 결과'],
        processQuestion: '입력된 데이터를 바탕으로 조건이 맞으면 [빈칸1] 처리한다.',
        processAnswer: '확인하여',
        processOptions: ['확인하여', '무시하고', '삭제하여'],
        hint: '컴퓨터의 입-출력 흐름과 처리 기준을 생각해보세요.',
        explanation: 'IPO 구조는 컴퓨터가 문제 해결을 처리하는 기본 골격입니다.',
      },
    });
  }

  function handlePinSubmit(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  }

  function startAdd() {
    setIsAdding(true);
    setEditForm(createNewProblemTemplate());
    setEditingOriginalId(null);
    setActiveTab('basic');
    setShowEmojiPicker(false);
    setShowEditModal(true);
  }

  function startEdit(problem) {
    setIsAdding(false);
    const normalized = normalizeProblemData(problem);
    setEditForm(normalized);
    setEditingOriginalId(problem.id);
    setActiveTab('basic');
    setShowEmojiPicker(false);
    setShowEditModal(true);
  }

  function closeModal() {
    setShowEditModal(false);
    setEditForm(null);
    setEditingOriginalId(null);
    setIsAdding(false);
    setShowEmojiPicker(false);
  }

  function handleSave() {
    if (!editForm.title.trim()) {
      alert('문제 제목을 입력해주세요.');
      return;
    }
    if (!editForm.id.trim()) {
      alert('문제 ID를 입력해주세요.');
      return;
    }

    let updatedList;
    if (isAdding) {
      updatedList = [...problems, editForm];
    } else {
      updatedList = problems.map((p) => (p.id === editingOriginalId ? editForm : p));
    }

    // Update local state & localStorage & disk initialProblems.js instantly
    onProblemsChange(updatedList);
    saveToDiskFile(updatedList);

    // If ID changed in edit mode, delete the old document in DB
    if (!isAdding && editingOriginalId && editingOriginalId !== editForm.id) {
      deleteProblemFromDB(editingOriginalId).catch((err) => console.warn('Old DB doc delete failed:', err));
    }

    // Sync to DB in background safely without blocking
    saveProblem(editForm).catch((err) => console.warn('DB sync postponed:', err));

    closeModal();
  }

  function handleDelete(id) {
    const updatedList = problems.filter((p) => p.id !== id);

    // Update local state & localStorage & disk initialProblems.js instantly
    onProblemsChange(updatedList);
    saveToDiskFile(updatedList);

    // Sync to DB in background safely without blocking
    deleteProblemFromDB(id).catch((err) => console.warn('DB delete postponed:', err));

    setDeleteConfirm(null);
  }

  // --- Concept Quiz Handlers ---
  function startQuizAdd() {
    setIsAddingQuiz(true);
    const nextId = quizQuestions.length > 0 ? Math.max(...quizQuestions.map(q => Number(q.id) || 0)) + 1 : 1;
    setQuizForm({
      id: nextId,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '[개념 슬라이드 1/6] 해설 문구를 작성하세요.'
    });
    setShowQuizModal(true);
  }

  function startQuizEdit(qItem) {
    setIsAddingQuiz(false);
    setQuizForm({
      ...qItem,
      options: [...(qItem.options || ['', '', '', ''])]
    });
    setShowQuizModal(true);
  }

  function closeQuizModal() {
    setShowQuizModal(false);
    setQuizForm(null);
    setIsAddingQuiz(false);
  }

  function handleQuizSave() {
    if (!quizForm.question.trim()) {
      alert('퀴즈 질문을 입력해주세요.');
      return;
    }
    if (!quizForm.correctAnswer.trim()) {
      alert('정답을 선택하거나 입력해주세요.');
      return;
    }

    let updatedQuizList;
    if (isAddingQuiz) {
      updatedQuizList = [...quizQuestions, quizForm];
    } else {
      updatedQuizList = quizQuestions.map((q) => (q.id === quizForm.id ? quizForm : q));
    }

    onQuizQuestionsChange(updatedQuizList);
    saveQuizQuestion(quizForm).catch((e) => console.warn('Quiz DB sync error:', e));

    closeQuizModal();
  }

  function handleQuizDelete(id) {
    const updatedList = quizQuestions.filter((q) => q.id !== id);
    onQuizQuestionsChange(updatedList);
    deleteQuizQuestionFromDB(id).catch((e) => console.warn('Quiz DB delete error:', e));
    setDeleteQuizConfirm(null);
  }

  function handleResetAllProgress() {
    setShowResetConfirmModal(true);
  }

  function toggleProblemVisibility(problem, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const currentHidden = Boolean(problem.hidden);
    const updated = { ...problem, hidden: !currentHidden };

    // Update state immediately for instant UI feedback
    onProblemsChange(problems.map((p) => (p.id === problem.id ? updated : p)));

    // Save to Firebase in background without blocking UI
    saveProblem(updated).catch((err) => console.warn('Firebase sync warning:', err));
  }

  // Source list to display: during drag, use live ordered list; otherwise normal problems list
  const displayProblems = orderedProblems || problems;

  // Filtered & Sorted problems list (Tutorial #00 always stays at index 0)
  const sortedProblems = [...displayProblems].sort((a, b) => {
    if (a.isTutorial || a.id === 'problem_practice') return -1;
    if (b.isTutorial || b.id === 'problem_practice') return 1;
    return 0;
  });

  const filteredProblems = sortedProblems.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'public' && !p.hidden) ||
      (statusFilter === 'hidden' && p.hidden);

    return matchSearch && matchStatus;
  });

  // --- PIN Auth Screen ---
  if (!authenticated) {
    return (
      <div className="card-bento max-w-sm mx-auto my-16 text-center space-y-6 animate-fade-up">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xs">
          🔒
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">교사 인증 (관리자)</h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">교사 전용 인증 암호를 입력해주세요.</p>
        </div>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={30}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="교사 인증 암호 입력"
            className="w-full text-center text-lg tracking-wider font-extrabold py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          {pinError && (
            <p className="text-xs text-rose-500 font-extrabold">PIN 번호가 일치하지 않습니다.</p>
          )}
          <button type="submit" className="btn-primary w-full py-3 font-extrabold cursor-pointer">
            인증하기
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleResetAllProgress}
            className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 px-4 rounded-xl transition-all cursor-pointer w-full flex items-center justify-center gap-1.5"
          >
            <span>🔄</span>
            <span>학습 데이터 초기화 (최초 접속 상태로)</span>
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-up">
            <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-rose-100 text-center space-y-5 animate-bounce-in">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs">
                🔄
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-1.5">학습 데이터 전체 초기화</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  퀴즈 통과 기록, 튜토리얼 완료 상태, 풀어본 문제 목록이 모두 완전히 삭제되며 최초 접속 상태로 돌아갑니다.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowResetConfirmModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                  }}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  초기화 실행
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Admin Panel Main Screen ---
  return (
    <div className="animate-fade-up pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>⚙️ 관리자 메뉴</span>
            </h1>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 py-1.5 px-2.5 rounded-xl transition-colors"
              title="로그아웃"
            >
              <Lock size={12} />
              <span>로그아웃</span>
            </button>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            실생활 문제: <strong className="text-indigo-600 font-bold">{problems.length}개</strong> | 개념 퀴즈: <strong className="text-amber-600 font-bold">{quizQuestions.length}개</strong>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">

          {/* Hidden File Input for Quiz Upload */}
          <input
            id="quiz-file-upload-input"
            type="file"
            accept=".js,.json"
            onChange={handleQuizFileUpload}
            className="hidden"
          />

          {mainSectionTab === 'quiz' && (
            <>
              <button
                type="button"
                onClick={() => document.getElementById('quiz-file-upload-input')?.click()}
                disabled={syncing}
                className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all disabled:opacity-50"
                title="수정된 개념 퀴즈 .js 또는 .json 파일 선택 업로드"
              >
                <Upload size={14} className="text-slate-600" />
                <span>.js 업로드</span>
              </button>

              <button
                type="button"
                onClick={handleQuizDownloadFile}
                className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all"
                title="현재 개념 퀴즈 데이터 세트를 initialQuizQuestions.js 파일로 내보내기 다운로드"
              >
                <Download size={14} className="text-slate-600" />
                <span>.js 다운로드</span>
              </button>

              <button
                onClick={handleSyncQuizToDB}
                disabled={syncing}
                className="h-9 bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 text-xs px-3.5 rounded-xl cursor-pointer font-extrabold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
                title="현재 전체 개념 퀴즈 데이터를 구글 Firestore 클라우드 DB로 전송합니다."
              >
                <CloudUpload size={15} />
                <span>{syncing ? 'DB 저장 중...' : 'DB 저장'}</span>
              </button>

              <button
                type="button"
                onClick={() => openVersionModal('quiz')}
                className="h-9 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all shadow-2xs"
                title="개념 퀴즈 저장 일시/버전 기록 목록 및 복원·삭제 관리"
              >
                <History size={14} className="text-amber-600" />
                <span>버전 관리</span>
              </button>

              <button
                onClick={startQuizAdd}
                className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 px-3.5"
              >
                <Plus size={15} />
                <span>퀴즈 추가</span>
              </button>
            </>
          )}

          {mainSectionTab === 'problems' && (
            <>
              {orderHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndoReorder}
                  disabled={syncing}
                  className="h-9 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all disabled:opacity-50 shadow-2xs"
                  title={`최근 순서 변경 되돌리기 (남은 기록: ${orderHistory.length}회)`}
                >
                  <RotateCcw size={14} className="text-amber-600" />
                  <span>순서 되돌리기 ({orderHistory.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => document.getElementById('file-upload-input')?.click()}
                disabled={syncing}
                className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all disabled:opacity-50"
                title="수정된 문제 .js 또는 .json 파일 선택 업로드"
              >
                <Upload size={14} className="text-slate-600" />
                <span>.js 업로드</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all"
                title="현재 문제 데이터 세트를 버전 포함 .js 파일로 다운로드 백업"
              >
                <Download size={14} className="text-slate-600" />
                <span>.js 다운로드</span>
              </button>

              <button
                onClick={handleSyncToDB}
                disabled={syncing}
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs px-3.5 rounded-xl cursor-pointer font-extrabold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
                title="현재 전체 문제 데이터를 구글 Firestore 클라우드 DB로 전송합니다."
              >
                <CloudUpload size={15} />
                <span>{syncing ? 'DB 저장 중...' : 'DB 저장'}</span>
              </button>

              <button
                type="button"
                onClick={() => openVersionModal('problems')}
                className="h-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 text-xs px-3 rounded-xl cursor-pointer font-extrabold transition-all shadow-2xs"
                title="실생활 문제 저장 일시/버전 기록 목록 및 복원·삭제 관리"
              >
                <History size={14} className="text-indigo-600" />
                <span>버전 관리</span>
              </button>

              <button
                onClick={startAdd}
                className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 px-3.5"
              >
                <Plus size={15} />
                <span>문제 추가</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Section Navigation Tabs (개념 퀴즈가 왼쪽에 오도록 순서 배치) */}
      <div className="flex border-b border-slate-200 mb-5 gap-2">
        <button
          onClick={() => setMainSectionTab('quiz')}
          className={`pb-2.5 px-4 text-sm font-black transition-all border-b-2 cursor-pointer ${mainSectionTab === 'quiz'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          💡 개념 퀴즈 문제 편집 ({quizQuestions.length})
        </button>
        <button
          onClick={() => setMainSectionTab('problems')}
          className={`pb-2.5 px-4 text-sm font-black transition-all border-b-2 cursor-pointer ${mainSectionTab === 'problems'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          🧩 실생활 문제 편집 ({problems.length})
        </button>
      </div>

      {/* SECTION 1: 실생활 문제 편집 목록 */}
      {mainSectionTab === 'problems' && (
        <>
          {/* 🔍 Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 mb-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="문제 제목 또는 카테고리 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs font-bold bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-xl outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <span className="text-[11px] font-extrabold text-slate-400 mr-1 flex items-center gap-1">
                <Filter size={12} /> 상태:
              </span>
              {[
                { id: 'all', label: `전체 (${problems.length})` },
                { id: 'public', label: `🟢 공개 (${problems.filter((p) => !p.hidden).length})` },
                { id: 'hidden', label: `🙈 숨김 (${problems.filter((p) => p.hidden).length})` },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isActive
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Cards Bento Grid (4열 격자 및 드래그 앤 드롭 순서 변경) */}
          {filteredProblems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-2xl">🔍</p>
              <p className="text-sm font-extrabold text-slate-600">검색 조건에 맞는 문제가 없습니다.</p>
              <p className="text-xs text-slate-400">검색어나 상태 필터를 확인해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {filteredProblems.map((problem) => {
                const mainProblemsOnly = displayProblems.filter((p) => !p.isTutorial);
                const mainIdx = mainProblemsOnly.findIndex((p) => p.id === problem.id);
                const numStr = problem.isTutorial ? '00' : (mainIdx + 1).toString().padStart(2, '0');
                const isDragDisabled = Boolean(problem.isTutorial || searchQuery || statusFilter !== 'all');
                const isDragging = draggedId === problem.id;

                return (
                  <div
                    key={problem.id}
                    draggable={!isDragDisabled}
                    onDragStart={(e) => handleCardDragStart(e, problem)}
                    onDragOver={(e) => handleCardDragOver(e, problem)}
                    onDrop={(e) => handleCardDrop(e)}
                    onDragEnd={handleCardDragEnd}
                    className={`group relative bg-white border rounded-2xl p-3.5 transition-all duration-150 flex flex-col justify-between overflow-hidden select-none ${isDragging
                        ? 'opacity-40 border-2 border-dashed border-indigo-400 scale-[0.97] bg-indigo-50/40'
                        : problem.isTutorial
                          ? 'border-purple-200/80 bg-purple-50/20'
                          : problem.hidden
                            ? 'border-slate-300 bg-slate-100/80 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 hover:shadow-md'
                            : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                      } ${!isDragDisabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    {/* Subtle muted overlay for hidden cards */}
                    {problem.hidden && (
                      <div className="absolute inset-0 bg-slate-900/5 pointer-events-none" />
                    )}

                    {/* Header Row: Drag Handle, #Index, Action Icons */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5 relative z-10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!problem.isTutorial && !isDragDisabled && (
                          <div
                            className="text-slate-400 group-hover:text-indigo-600 p-0.5 rounded shrink-0 transition-colors"
                            title="드래그하여 문제 순서 변경"
                          >
                            <GripVertical size={16} />
                          </div>
                        )}
                        {problem.isTutorial ? (
                          <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 shrink-0">
                            #튜토리얼
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md shrink-0">
                            #{numStr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Visibility Toggle Icon Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleProblemVisibility(problem, e)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${problem.hidden
                              ? 'bg-slate-200/80 text-slate-400 border-slate-300 hover:bg-slate-300'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                            }`}
                          title={problem.hidden ? '학생에게 숨김 상태 (클릭 시 공개)' : '학생에게 공개 중 (클릭 시 숨김)'}
                        >
                          {problem.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>

                        {/* Edit Icon Button */}
                        <button
                          onClick={() => startEdit(problem)}
                          className="w-7 h-7 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 hover:border-indigo-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="문제 상세 수정"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Delete Icon Button */}
                        {deleteConfirm === problem.id ? (
                          <div className="flex items-center gap-1 animate-fade-up">
                            <button
                              onClick={() => handleDelete(problem.id)}
                              className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                            >
                              삭제
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="h-7 px-1.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(problem.id)}
                            className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-rose-100"
                            title="문제 삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Content: Emoji & Title */}
                    <div className="flex items-start gap-3 pt-1 pb-1 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50/80 text-2xl flex items-center justify-center border border-indigo-100/60 shrink-0 shadow-2xs group-hover:scale-105 transition-transform mt-0.5">
                        {problem.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug break-keep group-hover:text-indigo-600 transition-colors">
                          {problem.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SECTION 2: 개념 퀴즈 문제 편집 목록 (가로 한 줄 배치 UI) */}
      {mainSectionTab === 'quiz' && (
        <div className="space-y-3">
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-bold">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-amber-600 shrink-0" />
              <span>개념 학습 후 풀게 되는 객관식 퀴즈 문항 목록입니다. (풀에서 무작위 10문항 자동 출제)</span>
            </div>
            <span className="text-amber-700 font-black bg-amber-100 px-2.5 py-0.5 rounded-full shrink-0">
              총 {quizQuestions.length}문항
            </span>
          </div>

          <div className="space-y-2">
            {quizQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200/80 hover:border-amber-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4"
              >
                {/* Left: Index badge & Horizontal Quiz Question title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      정답: <span className="text-emerald-600 font-extrabold">{q.correctAnswer}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions (Edit, Delete) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => startQuizEdit(q)}
                    className="h-8 px-3 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Pencil size={13} />
                    <span>수정</span>
                  </button>

                  {deleteQuizConfirm === q.id ? (
                    <div className="flex items-center gap-1 animate-fade-up">
                      <button
                        onClick={() => handleQuizDelete(q.id)}
                        className="h-8 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeleteQuizConfirm(null)}
                        className="h-8 px-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteQuizConfirm(q.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-rose-100"
                      title="퀴즈 문제 삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 PROBLEM EDIT / ADD POPUP MODAL */}
      {/* ========================================================================= */}
      {showEditModal && editForm && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md animate-fade-up">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] my-auto flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-900/10 animate-bounce-in">

            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{editForm.emoji || '📝'}</span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <span>{isAdding ? '➕ 새 실생활 문제 추가' : '✏️ 문제 콘텐츠 상세 수정'}</span>
                    {editForm.isTutorial && (
                      <span className="text-xs bg-purple-100 text-purple-700 font-extrabold px-2.5 py-0.5 rounded-md border border-purple-200">
                        🎓 튜토리얼
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                    {editForm.title ? editForm.title : '새 문제를 작성해 주세요'} (ID: {editForm.id})
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Step Navigation Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex gap-1 shrink-0 overflow-x-auto">
              {[
                { id: 'basic', label: '📌 1. 기본 정보' },
                { id: 'step1', label: '🧩 2. Step 1 (상태 정의)' },
                { id: 'step2', label: '🔍 3. Step 2 (핵심 추출)' },
                { id: 'step3', label: '🔄 4. Step 3 (IPO 구조화)' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 rounded-t-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isActive
                        ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-5 animate-fade-up">
                  <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 flex items-center gap-2 text-xs text-indigo-800 font-bold">
                    <Info size={16} className="text-indigo-600 shrink-0" />
                    <span>홈 화면 및 카드 목록에 표시되는 기본 정보(제목, 카테고리, 대표 이모지 등)를 설정합니다.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Emoji */}
                    <div className="md:col-span-1">
                      <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">대표 이모지</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-full h-11 border-2 border-slate-200 hover:border-indigo-400 bg-white rounded-xl px-3 text-center flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        >
                          <span className="text-2xl leading-none">{editForm.emoji || '❓'}</span>
                          <span className="text-[10px] text-indigo-600 font-extrabold ml-1 bg-indigo-50 px-1.5 py-0.5 rounded">변경</span>
                        </button>
                      </div>
                    </div>

                    {/* Category & Problem ID */}
                    <div className="md:col-span-3">
                      {!editForm.isTutorial ? (
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">카테고리</label>
                            <select
                              className="w-full h-11 border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-3 text-xs outline-none bg-white font-bold text-slate-700 cursor-pointer"
                              value={CATEGORY_PRESETS.includes(editForm.category) ? editForm.category : 'CUSTOM'}
                              onChange={(e) => {
                                if (e.target.value === 'CUSTOM') {
                                  setEditForm({ ...editForm, category: '' });
                                } else {
                                  setEditForm({ ...editForm, category: e.target.value });
                                }
                              }}
                            >
                              <option value="CUSTOM">✏️ 직접 입력하기...</option>
                              {CATEGORY_PRESETS.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {(!CATEGORY_PRESETS.includes(editForm.category) || editForm.category === '') && (
                              <input
                                type="text"
                                placeholder="새 카테고리 명칭..."
                                className="w-full h-9 border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-3 text-xs font-bold outline-none bg-white mt-2"
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              />
                            )}
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">
                              문제 ID
                            </label>
                            <input
                              type="text"
                              placeholder="예: problem_01"
                              value={editForm.id || ''}
                              onChange={(e) => setEditForm({ ...editForm, id: e.target.value.trim() })}
                              className="w-full h-11 border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-3 text-xs outline-none bg-white font-bold font-mono text-slate-700"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">
                            문제 ID
                          </label>
                          <input
                            type="text"
                            placeholder="예: problem_practice"
                            value={editForm.id || ''}
                            onChange={(e) => setEditForm({ ...editForm, id: e.target.value.trim() })}
                            className="w-full h-11 border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-3 text-xs outline-none bg-white font-bold font-mono text-slate-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-indigo-200 shadow-md animate-fade-up">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-slate-700">😀 원하시는 이모지를 선택하세요</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          닫기 ✕
                        </button>
                      </div>
                      <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
                        {EMOJI_CATEGORIES.map((cat) => (
                          <div key={cat.name}>
                            <p className="text-[11px] font-bold text-slate-400 mb-1">{cat.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setEditForm({ ...editForm, emoji });
                                    setShowEmojiPicker(false);
                                  }}
                                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${editForm.emoji === emoji ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white hover:bg-indigo-50 border border-slate-200'
                                    }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">문제 제목</label>
                    <input
                      className="w-full h-11 border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-3 text-sm font-extrabold outline-none bg-white text-slate-800"
                      placeholder="예: 무인 자판기에서 음료수 뽑기"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">문제 종합 설명 문구</label>
                    <textarea
                      rows={3}
                      className="w-full border-2 border-slate-200 focus:border-indigo-400 rounded-xl p-3 text-xs font-medium outline-none bg-white leading-relaxed"
                      placeholder="문제 개요 및 학습 목표에 대한 설명을 적어주세요."
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>

                  {/* Visibility Setting */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">학생 공개 설정</span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        '숨김'으로 설정하면 학생 문제 선택 화면(홈)에서 노출되지 않습니다.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, hidden: !editForm.hidden })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${editForm.hidden
                          ? 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        }`}
                    >
                      <span>{editForm.hidden ? '🙈 학생에게 숨김' : '🟢 학생에게 공개 중'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: STEP 1 (STATE DEFINITION) */}
              {activeTab === 'step1' && (
                <div className="space-y-5 animate-fade-up">
                  <div className="bg-violet-50/70 p-3.5 rounded-2xl border border-violet-100 flex items-center gap-2 text-xs text-violet-800 font-bold">
                    <Info size={16} className="text-violet-600 shrink-0" />
                    <span>
                      <strong>1단계 (상태 정의)</strong>: 문제 해결의 출발점(초기 상태)과 완성점(목표 상태)을 드래그하여 맞추는 단계입니다.
                    </span>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">1단계 문제 지시문</label>
                    <input
                      className="w-full h-11 border-2 border-slate-200 focus:border-violet-400 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                      value={editForm.step1.question}
                      onChange={(e) => setEditForm({ ...editForm, step1: { ...editForm.step1, question: e.target.value } })}
                    />
                  </div>

                  {/* Options List with Add/Delete */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <span>🎴 상태 카드 보기 목록 (총 {editForm.step1.options.length}개)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const maxNum = editForm.step1.options.reduce((acc, curr) => {
                            const m = (curr.id || '').match(/^c(\d+)$/);
                            return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
                          }, 0);
                          const newId = `c${maxNum + 1}`;
                          const updated = [...editForm.step1.options, { id: newId, text: '새 상태 카드' }];
                          setEditForm({ ...editForm, step1: { ...editForm.step1, options: updated } });
                        }}
                        className="text-xs font-extrabold text-violet-600 hover:text-violet-700 bg-violet-100 hover:bg-violet-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={14} /> + 카드 추가
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editForm.step1.options.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-400 w-6 text-center">{idx + 1}.</span>
                          <input
                            className="flex-1 h-10 border border-slate-300 focus:border-violet-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = editForm.step1.options.map((item, i) =>
                                i === idx ? { ...item, text: e.target.value } : item
                              );
                              setEditForm({ ...editForm, step1: { ...editForm.step1, options: updated } });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editForm.step1.options.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, step1: { ...editForm.step1, options: updated } });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Answers Select / Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <label className="text-xs font-black text-emerald-700 mb-1.5 block flex items-center gap-1">
                        <Check size={14} /> 🟢 초기 상태 정답 카드
                      </label>
                      <select
                        className="w-full h-11 border-2 border-emerald-300 focus:border-emerald-500 rounded-xl px-3 text-xs font-extrabold outline-none bg-white text-emerald-900 cursor-pointer"
                        value={editForm.step1.initialStateAnswer}
                        onChange={(e) => setEditForm({ ...editForm, step1: { ...editForm.step1, initialStateAnswer: e.target.value } })}
                      >
                        <option value="">-- 정답 카드 선택 --</option>
                        {editForm.step1.options.map((opt) => (
                          <option key={opt.id} value={opt.text}>
                            {opt.text}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-black text-indigo-700 mb-1.5 block flex items-center gap-1">
                        <Check size={14} /> 🔵 목표 상태 정답 카드
                      </label>
                      <select
                        className="w-full h-11 border-2 border-indigo-300 focus:border-indigo-500 rounded-xl px-3 text-xs font-extrabold outline-none bg-white text-indigo-900 cursor-pointer"
                        value={editForm.step1.finalStateAnswer}
                        onChange={(e) => setEditForm({ ...editForm, step1: { ...editForm.step1, finalStateAnswer: e.target.value } })}
                      >
                        <option value="">-- 정답 카드 선택 --</option>
                        {editForm.step1.options.map((opt) => (
                          <option key={opt.id} value={opt.text}>
                            {opt.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hint & Explanation */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-extrabold text-slate-600 mb-1 block">Step 1 힌트 문구</label>
                      <input
                        className="w-full h-10 border border-slate-200 focus:border-violet-400 rounded-xl px-3 text-xs font-medium outline-none bg-white"
                        value={editForm.step1.hint}
                        onChange={(e) => setEditForm({ ...editForm, step1: { ...editForm.step1, hint: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-600 mb-1 block">Step 1 정답 해설 문구</label>
                      <input
                        className="w-full h-10 border border-slate-200 focus:border-violet-400 rounded-xl px-3 text-xs font-medium outline-none bg-white"
                        value={editForm.step1.explanation}
                        onChange={(e) => setEditForm({ ...editForm, step1: { ...editForm.step1, explanation: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STEP 2 (FEATURE EXTRACTION) */}
              {activeTab === 'step2' && (
                <div className="space-y-5 animate-fade-up">
                  <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800 font-bold">
                    <Info size={16} className="text-blue-600 shrink-0" />
                    <span>
                      <strong>2단계 (핵심 요소 추출)</strong>: 필수적인 핵심 정보와 불필요한 정보(비핵심 요소)를 분류하는 단계입니다.
                    </span>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">2단계 문제 지시문</label>
                    <input
                      className="w-full h-11 border-2 border-slate-200 focus:border-blue-400 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                      value={editForm.step2.question}
                      onChange={(e) => setEditForm({ ...editForm, step2: { ...editForm.step2, question: e.target.value } })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Core Features */}
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-800">
                          ⭐ 핵심 요소 (필수 정보 - 정답)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const all = [...(editForm.step2.coreFeatures || []), ...(editForm.step2.nonCoreFeatures || [])];
                            const maxNum = all.reduce((acc, curr) => {
                              const m = (curr.id || '').match(/^f(\d+)$/);
                              return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
                            }, 0);
                            const newId = `f${maxNum + 1}`;
                            const updated = [...editForm.step2.coreFeatures, { id: newId, text: '새 핵심 정보' }];
                            setEditForm({ ...editForm, step2: { ...editForm.step2, coreFeatures: updated } });
                          }}
                          className="text-[11px] font-black text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          + 추가
                        </button>
                      </div>

                      <div className="space-y-2">
                        {editForm.step2.coreFeatures.map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center gap-1.5">
                            <input
                              className="flex-1 h-9 border border-indigo-200 focus:border-indigo-500 rounded-xl px-2.5 text-xs font-bold outline-none bg-white"
                              value={item.text}
                              onChange={(e) => {
                                const updated = editForm.step2.coreFeatures.map((f, i) =>
                                  i === idx ? { ...f, text: e.target.value } : f
                                );
                                setEditForm({ ...editForm, step2: { ...editForm.step2, coreFeatures: updated } });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editForm.step2.coreFeatures.filter((_, i) => i !== idx);
                                setEditForm({ ...editForm, step2: { ...editForm.step2, coreFeatures: updated } });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Non Core Features */}
                    <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">
                          🗑️ 비핵심 요소 (불필요 정보 - 오답)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const all = [...(editForm.step2.coreFeatures || []), ...(editForm.step2.nonCoreFeatures || [])];
                            const maxNum = all.reduce((acc, curr) => {
                              const m = (curr.id || '').match(/^f(\d+)$/);
                              return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
                            }, 0);
                            const newId = `f${maxNum + 1}`;
                            const updated = [...editForm.step2.nonCoreFeatures, { id: newId, text: '새 불필요 정보' }];
                            setEditForm({ ...editForm, step2: { ...editForm.step2, nonCoreFeatures: updated } });
                          }}
                          className="text-[11px] font-black text-slate-600 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          + 추가
                        </button>
                      </div>

                      <div className="space-y-2">
                        {editForm.step2.nonCoreFeatures.map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center gap-1.5">
                            <input
                              className="flex-1 h-9 border border-slate-300 focus:border-slate-500 rounded-xl px-2.5 text-xs font-bold outline-none bg-white text-slate-600"
                              value={item.text}
                              onChange={(e) => {
                                const updated = editForm.step2.nonCoreFeatures.map((f, i) =>
                                  i === idx ? { ...f, text: e.target.value } : f
                                );
                                setEditForm({ ...editForm, step2: { ...editForm.step2, nonCoreFeatures: updated } });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editForm.step2.nonCoreFeatures.filter((_, i) => i !== idx);
                                setEditForm({ ...editForm, step2: { ...editForm.step2, nonCoreFeatures: updated } });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hint & Explanation */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-extrabold text-slate-600 mb-1 block">Step 2 힌트 문구</label>
                      <input
                        className="w-full h-10 border border-slate-200 focus:border-blue-400 rounded-xl px-3 text-xs font-medium outline-none bg-white"
                        value={editForm.step2.hint}
                        onChange={(e) => setEditForm({ ...editForm, step2: { ...editForm.step2, hint: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-600 mb-1 block">Step 2 정답 해설 문구</label>
                      <input
                        className="w-full h-10 border border-slate-200 focus:border-blue-400 rounded-xl px-3 text-xs font-medium outline-none bg-white"
                        value={editForm.step2.explanation}
                        onChange={(e) => setEditForm({ ...editForm, step2: { ...editForm.step2, explanation: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STEP 3 (IPO STRUCTURING) */}
              {activeTab === 'step3' && (
                <div className="space-y-5 animate-fade-up">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <Info size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      <strong>3단계 (IPO 구조화)</strong>: 입력(Input)-처리(Process)-출력(Output) 흐름을 완성하고 빈칸 정답을 설정합니다.
                    </span>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 mb-1.5 block">3단계 문제 지시문</label>
                    <input
                      className="w-full h-11 border-2 border-slate-200 focus:border-emerald-400 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                      value={editForm.step3.question}
                      onChange={(e) => setEditForm({ ...editForm, step3: { ...editForm.step3, question: e.target.value } })}
                    />
                  </div>

                  {/* Input & Output Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Input Options */}
                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-sky-900">📥 입력 (Input) 보기 목록</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOpts = [...editForm.step3.inputOptions, '새 입력 보기'];
                            setEditForm({ ...editForm, step3: { ...editForm.step3, inputOptions: updatedOpts } });
                          }}
                          className="text-[11px] font-black text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          + 보기 추가
                        </button>
                      </div>

                      <div className="space-y-2">
                        {editForm.step3.inputOptions.map((text, idx) => {
                          const isCorrect = editForm.step3.input.includes(text);
                          return (
                            <div key={idx} className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  let newInputs = [...editForm.step3.input];
                                  if (isCorrect) {
                                    newInputs = newInputs.filter((t) => t !== text);
                                  } else {
                                    newInputs.push(text);
                                  }
                                  setEditForm({ ...editForm, step3: { ...editForm.step3, input: newInputs } });
                                }}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                  }`}
                                title={isCorrect ? '정답 항목' : '클릭해서 정답 지정'}
                              >
                                {isCorrect ? '✓ 정답' : '오답'}
                              </button>
                              <input
                                className="flex-1 h-9 border border-sky-200 focus:border-sky-500 rounded-xl px-2.5 text-xs font-bold outline-none bg-white"
                                value={text}
                                onChange={(e) => {
                                  const oldVal = editForm.step3.inputOptions[idx];
                                  const newVal = e.target.value;
                                  const updatedOpts = editForm.step3.inputOptions.map((t, i) => (i === idx ? newVal : t));
                                  const updatedInputs = editForm.step3.input.map((t) => (t === oldVal ? newVal : t));
                                  setEditForm({
                                    ...editForm,
                                    step3: { ...editForm.step3, inputOptions: updatedOpts, input: updatedInputs },
                                  });
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const deletedVal = editForm.step3.inputOptions[idx];
                                  const updatedOpts = editForm.step3.inputOptions.filter((_, i) => i !== idx);
                                  const updatedInputs = editForm.step3.input.filter((t) => t !== deletedVal);
                                  setEditForm({
                                    ...editForm,
                                    step3: { ...editForm.step3, inputOptions: updatedOpts, input: updatedInputs },
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Output Options */}
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900">📤 출력 (Output) 보기 목록</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOpts = [...editForm.step3.outputOptions, '새 출력 보기'];
                            setEditForm({ ...editForm, step3: { ...editForm.step3, outputOptions: updatedOpts } });
                          }}
                          className="text-[11px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          + 보기 추가
                        </button>
                      </div>

                      <div className="space-y-2">
                        {editForm.step3.outputOptions.map((text, idx) => {
                          const isCorrect = editForm.step3.output.includes(text);
                          return (
                            <div key={idx} className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  let newOutputs = [...editForm.step3.output];
                                  if (isCorrect) {
                                    newOutputs = newOutputs.filter((t) => t !== text);
                                  } else {
                                    newOutputs.push(text);
                                  }
                                  setEditForm({ ...editForm, step3: { ...editForm.step3, output: newOutputs } });
                                }}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                  }`}
                                title={isCorrect ? '정답 항목' : '클릭해서 정답 지정'}
                              >
                                {isCorrect ? '✓ 정답' : '오답'}
                              </button>
                              <input
                                className="flex-1 h-9 border border-amber-200 focus:border-amber-500 rounded-xl px-2.5 text-xs font-bold outline-none bg-white"
                                value={text}
                                onChange={(e) => {
                                  const oldVal = editForm.step3.outputOptions[idx];
                                  const newVal = e.target.value;
                                  const updatedOpts = editForm.step3.outputOptions.map((t, i) => (i === idx ? newVal : t));
                                  const updatedOutputs = editForm.step3.output.map((t) => (t === oldVal ? newVal : t));
                                  setEditForm({
                                    ...editForm,
                                    step3: { ...editForm.step3, outputOptions: updatedOpts, output: updatedOutputs },
                                  });
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const deletedVal = editForm.step3.outputOptions[idx];
                                  const updatedOpts = editForm.step3.outputOptions.filter((_, i) => i !== idx);
                                  const updatedOutputs = editForm.step3.output.filter((t) => t !== deletedVal);
                                  setEditForm({
                                    ...editForm,
                                    step3: { ...editForm.step3, outputOptions: updatedOpts, output: updatedOutputs },
                                  });
                                }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Process Question & Answer & Options */}
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80 space-y-4">
                    {(() => {
                      const matches = editForm.step3.processQuestion.match(/\[빈칸\d*\]/g) || [];
                      const blankCount = matches.length || 1;
                      const currentAnswers = Array.isArray(editForm.step3.processAnswer)
                        ? editForm.step3.processAnswer
                        : [editForm.step3.processAnswer];

                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-black text-purple-900 mb-1.5 block flex items-center justify-between">
                              <span>⚙️ 처리 (Process) 빈칸 문장</span>
                              <span className="text-[11px] text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded-md">
                                감지된 빈칸: {blankCount}개
                              </span>
                            </label>
                            <input
                              className="w-full h-11 border border-purple-200 focus:border-purple-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                              placeholder="예: 각 과목 점수를 [빈칸1] 총점을 구한 뒤 과목 수로 [빈칸2] 평균을 산출한다."
                              value={editForm.step3.processQuestion}
                              onChange={(e) => {
                                const newQ = e.target.value;
                                const newMatches = newQ.match(/\[빈칸\d*\]/g) || [];
                                const newCount = newMatches.length || 1;
                                let newAns = Array.isArray(editForm.step3.processAnswer)
                                  ? [...editForm.step3.processAnswer]
                                  : [editForm.step3.processAnswer];
                                if (newAns.length < newCount) {
                                  while (newAns.length < newCount) newAns.push(editForm.step3.processOptions[0] || '');
                                } else if (newAns.length > newCount) {
                                  newAns = newAns.slice(0, newCount);
                                }
                                setEditForm({
                                  ...editForm,
                                  step3: {
                                    ...editForm.step3,
                                    processQuestion: newQ,
                                    processAnswer: newCount > 1 ? newAns : (newAns[0] || ''),
                                  },
                                });
                              }}
                            />
                            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                              💡 문장 내에 <strong className="text-purple-600 font-bold">[빈칸1]</strong>, <strong className="text-purple-600 font-bold">[빈칸2]</strong> 또는 <strong className="text-purple-600 font-bold">[빈칸]</strong> 표기를 원하시는 위치에 자유롭게 넣으시면 상자가 순서대로 생성됩니다.
                            </p>
                          </div>

                          {/* Answer selection for each blank */}
                          <div className="bg-white/80 p-3.5 rounded-xl border border-purple-200 space-y-2.5 shadow-2xs">
                            <p className="text-xs font-black text-purple-900">🎯 각 빈칸별 정답 카드 설정</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {Array.from({ length: blankCount }).map((_, bIdx) => {
                                const currentVal = currentAnswers[bIdx] || '';
                                return (
                                  <div key={bIdx} className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-200">
                                    <label className="text-[11px] font-black text-purple-700 mb-1 block">
                                      [빈칸 {bIdx + 1}] 정답 선택
                                    </label>
                                    <select
                                      className="w-full h-9 border border-purple-300 focus:border-purple-500 rounded-lg px-2 text-xs font-extrabold outline-none bg-white text-purple-900 cursor-pointer"
                                      value={currentVal}
                                      onChange={(e) => {
                                        const selected = e.target.value;
                                        let updated = [...currentAnswers];
                                        updated[bIdx] = selected;
                                        setEditForm({
                                          ...editForm,
                                          step3: {
                                            ...editForm.step3,
                                            processAnswer: blankCount > 1 ? updated : updated[0],
                                          },
                                        });
                                      }}
                                    >
                                      <option value="">-- 정답 카드 선택 --</option>
                                      {editForm.step3.processOptions.map((opt, oIdx) => (
                                        <option key={oIdx} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Process Options */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-purple-900">
                                ⚙️ Process 선택지 (객관식 보기 카드)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedOpts = [...editForm.step3.processOptions, '새 보기 단어'];
                                  setEditForm({ ...editForm, step3: { ...editForm.step3, processOptions: updatedOpts } });
                                }}
                                className="text-[11px] font-black text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                              >
                                + 보기 추가
                              </button>
                            </div>

                            <div className="space-y-2">
                              {editForm.step3.processOptions.map((text, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-black text-purple-500 w-5 text-center">{idx + 1}.</span>
                                  <input
                                    className="flex-1 h-9 border border-purple-200 focus:border-purple-500 rounded-xl px-2.5 text-xs font-bold outline-none bg-white"
                                    value={text}
                                    onChange={(e) => {
                                      const oldVal = editForm.step3.processOptions[idx];
                                      const newVal = e.target.value;
                                      const updatedOpts = editForm.step3.processOptions.map((t, i) => (i === idx ? newVal : t));
                                      let updatedAns = Array.isArray(editForm.step3.processAnswer)
                                        ? editForm.step3.processAnswer.map((a) => (a === oldVal ? newVal : a))
                                        : (editForm.step3.processAnswer === oldVal ? newVal : editForm.step3.processAnswer);
                                      setEditForm({
                                        ...editForm,
                                        step3: {
                                          ...editForm.step3,
                                          processOptions: updatedOpts,
                                          processAnswer: updatedAns,
                                        },
                                      });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedOpts = editForm.step3.processOptions.filter((_, i) => i !== idx);
                                      setEditForm({ ...editForm, step3: { ...editForm.step3, processOptions: updatedOpts } });
                                    }}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Hint & Explanation */}
                  <div className="space-y-3">
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                      <label className="text-xs font-black text-amber-900 block">💡 3단계 IPO 힌트 설정 (입력 / 처리 / 출력 3단계 분리)</label>
                      {(() => {
                        const isObj = typeof editForm.step3.hint === 'object' && editForm.step3.hint !== null;
                        const hintInput = isObj ? (editForm.step3.hint.input || '') : editForm.step3.hint;
                        const hintProcess = isObj ? (editForm.step3.hint.process || '') : '';
                        const hintOutput = isObj ? (editForm.step3.hint.output || '') : '';

                        const updateHintField = (field, val) => {
                          const currentObj = isObj ? { ...editForm.step3.hint } : { input: editForm.step3.hint || '', process: '', output: '' };
                          currentObj[field] = val;
                          setEditForm({
                            ...editForm,
                            step3: { ...editForm.step3, hint: currentObj }
                          });
                        };

                        return (
                          <div className="space-y-2.5">
                            <div>
                              <span className="text-[11px] font-black text-indigo-700 block mb-1">📥 [입력 힌트]</span>
                              <input
                                className="w-full h-9 border border-indigo-200 focus:border-indigo-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                                placeholder="입력 데이터 힌트를 입력하세요"
                                value={hintInput}
                                onChange={(e) => updateHintField('input', e.target.value)}
                              />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-purple-700 block mb-1">⚙️ [처리 힌트]</span>
                              <input
                                className="w-full h-9 border border-purple-200 focus:border-purple-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                                placeholder="처리 규칙 및 조건 힌트를 입력하세요"
                                value={hintProcess}
                                onChange={(e) => updateHintField('process', e.target.value)}
                              />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-emerald-700 block mb-1">📤 [출력 힌트]</span>
                              <input
                                className="w-full h-9 border border-emerald-200 focus:border-emerald-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                                placeholder="출력 결과물 힌트를 입력하세요"
                                value={hintOutput}
                                onChange={(e) => updateHintField('output', e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-600 mb-1 block">Step 3 정답 해설 문구</label>
                      <input
                        className="w-full h-10 border border-slate-200 focus:border-emerald-400 rounded-xl px-3 text-xs font-medium outline-none bg-white"
                        value={editForm.step3.explanation}
                        onChange={(e) => setEditForm({ ...editForm, step3: { ...editForm.step3, explanation: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/80 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X size={16} /> 취소
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
                  작성을 마치면 아래 저장 버튼을 누르세요.
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>{saving ? '저장 처리 중...' : '변경사항 저장하기'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 💡 CONCEPT QUIZ EDIT / ADD POPUP MODAL */}
      {/* ========================================================================= */}
      {showQuizModal && quizForm && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md animate-fade-up">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] my-auto flex flex-col shadow-2xl overflow-hidden ring-1 ring-slate-900/10 animate-bounce-in">
            {/* Modal Header */}
            <div className="bg-amber-50/60 border-b border-amber-200/80 px-6 pt-5 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span>{isAddingQuiz ? '➕ 새 개념 퀴즈 문항 추가' : '✏️ 개념 퀴즈 문항 상세 수정'}</span>
                  </h3>
                  <p className="text-xs text-amber-900/70 font-semibold">
                    퀴즈 번호 #{quizForm.id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeQuizModal}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">❓ 퀴즈 질문 문구</label>
                <textarea
                  className="w-full border border-slate-200 focus:border-amber-500 rounded-xl p-3 text-xs font-bold outline-none bg-white min-h-[70px] leading-relaxed"
                  placeholder="학생들이 풀 객관식 퀴즈 질문을 작성하세요"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <label className="text-xs font-black text-slate-700 block mb-1">
                  🔢 객관식 선택지 4개 (정답 버튼을 클릭하여 지정하세요)
                </label>
                {quizForm.options.map((optText, optIdx) => {
                  const isCorrect = quizForm.correctAnswer === optText && optText.trim() !== '';
                  return (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuizForm({ ...quizForm, correctAnswer: optText })}
                        className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${isCorrect
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        title={isCorrect ? '현재 정답' : '클릭해서 정답으로 지정'}
                      >
                        {isCorrect ? '✓ 정답' : `${optIdx + 1}번`}
                      </button>
                      <input
                        className="flex-1 h-9 border border-slate-200 focus:border-amber-500 rounded-xl px-3 text-xs font-bold outline-none bg-white"
                        placeholder={`${optIdx + 1}번 보기 선택지 문구`}
                        value={optText}
                        onChange={(e) => {
                          const newOpts = [...quizForm.options];
                          const oldVal = newOpts[optIdx];
                          const newVal = e.target.value;
                          newOpts[optIdx] = newVal;
                          const newCorrect = quizForm.correctAnswer === oldVal ? newVal : quizForm.correctAnswer;
                          setQuizForm({
                            ...quizForm,
                            options: newOpts,
                            correctAnswer: newCorrect
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">💡 오답 및 정답 해설 문구</label>
                <textarea
                  className="w-full border border-slate-200 focus:border-amber-500 rounded-xl p-3 text-xs font-medium outline-none bg-white min-h-[60px]"
                  placeholder="[개념 슬라이드 N/6] 정답 이유 및 슬라이드 참조 해설"
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={closeQuizModal}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/80 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X size={16} /> 취소
              </button>

              <button
                type="button"
                onClick={handleQuizSave}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Save size={16} />
                <span>퀴즈 저장하기</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Version History Management Modal */}
      {showVersionModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-up">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-bounce-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${mainSectionTab === 'quiz' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {mainSectionTab === 'quiz' ? '개념 퀴즈' : '실생활 문제'} 버전 관리 히스토리
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold">
                    DB에 저장된 시점별 스냅샷 목록을 확인하고 복원하거나 삭제할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {loadingVersions ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-7 h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">버전 기록을 불러오는 중...</p>
                </div>
              ) : versionList.length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-2xl">⏳</p>
                  <p className="text-xs font-black text-slate-600">저장된 버전 기록이 없습니다.</p>
                  <p className="text-[11px] text-slate-400">
                    상단의 <strong>[DB 저장]</strong> 버튼을 누르면 날짜와 시간이 자동 기록됩니다.
                  </p>
                </div>
              ) : (
                versionList.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                          {idx === 0 ? '최신 버전' : `v_${ver.id.replace('v_', '')}`}
                        </span>
                        <span className="text-xs font-black text-slate-700">
                          {ver.dateStr || new Date(ver.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold">
                        {mainSectionTab === 'quiz' ? `퀴즈 ${ver.count || ver.data?.length || 0}문항` : `문제 ${ver.count || ver.data?.length || 0}개`}
                        {ver.note && ` · ${ver.note}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-200/80 hover:border-indigo-600 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs"
                        title="이 버전 상태로 데이터 복원"
                      >
                        복원
                      </button>
                      <button
                        onClick={() => handleDeleteVersion(ver.id)}
                        className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-rose-100"
                        title="이 버전 기록 영구 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-400">
              <span>총 {versionList.length}개 버전 기록</span>
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-extrabold cursor-pointer transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-up">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-rose-100 text-center space-y-5 animate-bounce-in">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs">
              🔄
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-1.5">학습 데이터 전체 초기화</h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                퀴즈 통과 기록, 튜토리얼 완료 상태, 풀어본 문제 목록이 모두 완전히 삭제되며 최초 접속 상태로 돌아갑니다.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                초기화 실행
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Toast Notification (화면 상단 중앙 플로팅 토스트) */}
      {syncMsg && createPortal(
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] animate-bounce-in">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl text-xs font-black border flex items-center gap-2.5 backdrop-blur-md ${syncMsg.includes('✅')
              ? 'bg-emerald-600/95 text-white border-emerald-400'
              : syncMsg.includes('☁️')
                ? 'bg-amber-500/95 text-white border-amber-300'
                : 'bg-rose-600/95 text-white border-rose-400'
            }`}>
            <span>{syncMsg}</span>
            <button
              onClick={() => setSyncMsg('')}
              className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
