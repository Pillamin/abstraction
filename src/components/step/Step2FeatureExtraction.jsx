// src/components/step/Step2FeatureExtraction.jsx
// 2단계: 핵심 요소 추출 — 핵심 요소 상단 배치 + 별 아이콘 제거 및 레이아웃 안정이 유지된 수용 상자

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import FeedbackModal from '../common/FeedbackModal';

function shuffleArray(arr) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function Step2FeatureExtraction({ problem, onComplete, soundOn }) {
  const [pool, setPool] = useState([]);
  const [coreZone, setCoreZone] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState({ open: false, correct: false });

  useEffect(() => {
    const all = [
      ...problem.step2.coreFeatures.map((f) => ({ ...f, isCore: true })),
      ...problem.step2.nonCoreFeatures.map((f) => ({ ...f, isCore: false })),
    ];
    setPool(shuffleArray(all));
    setCoreZone([]);
    setShowHint(false);
    setModal({ open: false, correct: false });
  }, [problem]);

  const getList = (id) => {
    if (id === 'pool') return pool;
    if (id === 'core') return coreZone;
    return [];
  };

  const setList = (id, val) => {
    if (id === 'pool') setPool(val);
    if (id === 'core') setCoreZone(val);
  };

  function moveCard(cardId, fromZoneId, toZoneId) {
    if (fromZoneId === toZoneId) return;

    let srcList = getList(fromZoneId);
    let dstList = getList(toZoneId);

    const card = srcList.find((c) => c.id === cardId);
    if (!card) return;

    const newSrc = srcList.filter((c) => c.id !== cardId);
    const newDst = [...dstList, card];

    setList(fromZoneId, newSrc);
    setList(toZoneId, newDst);
  }

  function onDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) {
      setList(source.droppableId, reorder(getList(source.droppableId), source.index, destination.index));
    } else {
      moveCard(draggableId, source.droppableId, destination.droppableId);
    }
  }

  function handleCheck() {
    const coreIds = new Set(problem.step2.coreFeatures.map((f) => f.id));
    const correct = coreZone.length === problem.step2.coreFeatures.length && coreZone.every((c) => coreIds.has(c.id));
    setModal({ open: true, correct });
  }

  function handleRetry() {
    setModal({ open: false, correct: false });
  }

  const canCheck = coreZone.length > 0;

  return (
    <div className="animate-slide-left">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-800 mb-0.5">2단계: 핵심 요소 추출</h2>
        <p className="text-slate-500 text-xs">{problem.step2.question}</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Core Zone (Top) */}
        <div className="mb-4">
          <p className="text-xs font-bold text-indigo-600 mb-1.5 flex items-center gap-1">
            핵심 요소
          </p>
          <Droppable droppableId="core" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`drop-zone min-h-[58px] flex flex-wrap items-center justify-start gap-2 p-2.5 rounded-2xl transition-all ${
                  snapshot.isDraggingOver ? 'is-over' : ''
                } ${coreZone.length > 0 ? 'border-indigo-400 bg-indigo-50/70' : 'border-2 border-dashed border-indigo-300 bg-slate-50/60'}`}
              >
                {coreZone.map((card, idx) => (
                  <Draggable key={card.id} draggableId={card.id} index={idx}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className={`drag-card w-fit inline-flex items-center justify-center text-center bg-white border-2 border-indigo-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-800 shadow-xs select-none ${
                          snap.isDragging ? 'is-dragging' : ''
                        }`}
                      >
                        {card.text}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {coreZone.length === 0 && (
                  <p className="text-slate-400 text-xs font-bold py-1.5 text-center w-full pointer-events-none">
                    아래 특징 카드 중 꼭 필요한 핵심 요소만 이곳으로 끌어올리세요
                  </p>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {/* Option Pool (Bottom) */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">제시된 특징 목록</p>
          <Droppable droppableId="pool" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`drop-zone min-h-[58px] flex flex-wrap items-center justify-start gap-2 p-2.5 rounded-2xl ${
                  snapshot.isDraggingOver ? 'is-over' : ''
                }`}
              >
                {pool.map((card, idx) => (
                  <Draggable key={card.id} draggableId={card.id} index={idx}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className={`drag-card w-fit inline-flex items-center justify-center text-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs select-none ${
                          snap.isDragging ? 'is-dragging' : ''
                        }`}
                      >
                        {card.text}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {pool.length === 0 && !snapshot.isDraggingOver && (
                  <p className="text-slate-400 font-bold text-xs py-1.5 w-full text-center">모든 카드를 살펴봤어요!</p>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button onClick={() => setShowHint(true)} className="btn-secondary flex items-center gap-2 cursor-pointer">
          <Lightbulb size={16} className="text-amber-500" />
          <span>힌트 보기</span>
        </button>
        <button onClick={handleCheck} disabled={!canCheck} className="btn-primary flex-1 flex items-center justify-center gap-2 cursor-pointer">
          <CheckCircle2 size={18} />
          <span>정답 확인</span>
        </button>
      </div>

      {/* Hint Popup Modal */}
      {showHint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-4 animate-bounce-in relative">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-xs">
              💡
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">2단계 힌트</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                {problem.step2.hint || '문제 해결에 핵심적인 정보만 고르고, 관련 없는 정보는 버리세요.'}
              </p>
            </div>
            <button
              onClick={() => setShowHint(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all cursor-pointer font-black"
            >
              확인 후 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <FeedbackModal
        isOpen={modal.open}
        isCorrect={modal.correct}
        explanation={problem.step2.explanation}
        onRetry={handleRetry}
        onNext={() => {
          setModal({ open: false, correct: false });
          onComplete();
        }}
      />
    </div>
  );
}
