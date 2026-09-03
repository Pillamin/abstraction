// src/components/step/Step1StateDefinition.jsx
// 1단계: 상태 정의 — 드롭 상자 상단 배치 + 순수 드래그 앤 드롭 지원

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import FeedbackModal from '../common/FeedbackModal';

function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function Step1StateDefinition({ problem, onComplete, soundOn }) {
  const [pool, setPool] = useState([]);
  const [initialZone, setInitialZone] = useState([]);
  const [finalZone, setFinalZone] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState({ open: false, correct: false });

  useEffect(() => {
    const shuffled = [...problem.step1.options].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setInitialZone([]);
    setFinalZone([]);
    setShowHint(false);
    setModal({ open: false, correct: false });
  }, [problem]);

  const getList = (id) => {
    if (id === 'pool') return pool;
    if (id === 'initial') return initialZone;
    if (id === 'final') return finalZone;
    return [];
  };

  const setList = (id, val) => {
    if (id === 'pool') setPool(val);
    if (id === 'initial') setInitialZone(val);
    if (id === 'final') setFinalZone(val);
  };

  function moveCard(cardId, fromZoneId, toZoneId) {
    if (fromZoneId === toZoneId) return;

    let srcList = getList(fromZoneId);
    let dstList = getList(toZoneId);

    const card = srcList.find((c) => c.id === cardId);
    if (!card) return;

    let newSrc = srcList.filter((c) => c.id !== cardId);
    let newDst = [...dstList];

    // If target is initial or final zone and already has a card, return old card to pool
    if ((toZoneId === 'initial' || toZoneId === 'final') && newDst.length >= 1) {
      const oldCard = newDst[0];
      newDst = [card];
      if (fromZoneId === 'pool') {
        newSrc.push(oldCard);
      } else {
        setPool((p) => [...p, oldCard]);
      }
    } else {
      newDst.push(card);
    }

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
    const initialCard = initialZone[0];
    const finalCard = finalZone[0];

    const initialOk =
      initialZone.length === 1 &&
      (initialCard.type === 'initial' ||
        initialCard.isInitial === true ||
        initialCard.text === problem.step1.initialStateAnswer);

    const finalOk =
      finalZone.length === 1 &&
      (finalCard.type === 'final' ||
        finalCard.isFinal === true ||
        finalCard.text === problem.step1.finalStateAnswer);

    const correct = initialOk && finalOk;
    setModal({ open: true, correct });
  }

  function handleRetry() {
    setModal({ open: false, correct: false });
  }

  const canCheck = initialZone.length === 1 && finalZone.length === 1;

  return (
    <div className="animate-slide-left">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-800 mb-0.5">1단계: 상태 정의</h2>
        <p className="text-slate-500 text-xs">{problem.step1.question}</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Drop Zones (Top) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            { id: 'initial', label: '🏁 초기 상태', zone: initialZone, color: 'indigo' },
            { id: 'final', label: '🎯 목표 상태', zone: finalZone, color: 'indigo' },
          ].map(({ id, label, zone }) => (
            <div key={id}>
              <p className="text-xs font-bold text-slate-500 mb-1.5">{label}</p>
              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`drop-zone min-h-[52px] flex flex-col justify-center gap-1.5 p-2.5 transition-all rounded-2xl ${
                      snapshot.isDraggingOver ? 'is-over' : ''
                    } ${zone.length === 1 ? 'border-indigo-400 bg-indigo-50/70' : ''}`}
                  >
                    {zone.map((card, idx) => (
                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`drag-card w-fit inline-flex items-center bg-white border-2 border-indigo-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-800 shadow-xs select-none ${
                              snap.isDragging ? 'is-dragging' : ''
                            }`}
                          >
                            {card.text}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    <span className="hidden">{provided.placeholder}</span>
                    {zone.length === 0 && (
                      <p className="text-slate-300 text-xs font-bold text-center py-1.5 pointer-events-none">
                        여기로 카드를 끌어다 놓으세요
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        {/* Card Pool (Bottom) */}
        <div className="mb-4">
          <Droppable droppableId="pool" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`drop-zone min-h-[52px] flex flex-wrap items-center gap-2 p-2.5 relative transition-all rounded-2xl ${
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
                        className={`drag-card w-fit inline-flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs select-none ${
                          snap.isDragging ? 'is-dragging' : ''
                        }`}
                      >
                        {card.text}
                      </div>
                    )}
                  </Draggable>
                ))}
                <span className="hidden">{provided.placeholder}</span>
                {pool.length === 0 && !snapshot.isDraggingOver && (
                  <p className="text-slate-400 font-bold text-xs text-center py-1.5 w-full">모든 카드를 배치했어요!</p>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Actions */}
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
              <h3 className="text-lg font-black text-slate-800 mb-1.5">1단계 힌트</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                {problem.step1.hint || '기초 자원 데이터(초기 상태)와 구하고자 하는 최종 목표(목표 상태)를 생각해보세요.'}
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

      <FeedbackModal
        isOpen={modal.open}
        isCorrect={modal.correct}
        explanation={modal.correct ? problem.step1.explanation : '초기 상태는 문제가 시작되기 전, 목표 상태는 문제가 해결된 후의 상황입니다.'}
        onNext={() => { setModal({ open: false, correct: false }); onComplete(); }}
        onRetry={handleRetry}
        soundOn={soundOn}
      />
    </div>
  );
}
