// src/components/step/Step3IpoStructuring.jsx
// 3단계: IPO 구조화 — 다중 [빈칸], [빈칸1], [빈칸2] 드롭 슬롯 완전 지원

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Lightbulb, CheckCircle2, Info, Sparkles, HelpCircle } from 'lucide-react';
import FeedbackModal from '../common/FeedbackModal';

function reorder(list, sIdx, dIdx) {
  const res = [...list];
  const [r] = res.splice(sIdx, 1);
  res.splice(dIdx, 0, r);
  return res;
}

function parseProcessQuestion(qStr) {
  const text = qStr || '처리 조건: [빈칸]';
  const regex = /\[빈칸\d*\]/g;
  const parts = text.split(regex);
  const matches = text.match(regex) || ['[빈칸]'];

  const blanks = matches.map((m, idx) => {
    const numMatch = m.match(/\d+/);
    const targetIdx = numMatch ? parseInt(numMatch[0], 10) - 1 : idx;
    return {
      droppableId: `processZone_${targetIdx}`,
      blankIndex: targetIdx,
      label: `빈칸 ${targetIdx + 1}`
    };
  });

  return { parts, blanks };
}

export default function Step3IpoStructuring({ problem, onComplete, soundOn }) {
  const [inputPool, setInputPool] = useState([]);
  const [processPool, setProcessPool] = useState([]);
  const [outputPool, setOutputPool] = useState([]);

  const [inputZone, setInputZone] = useState([]);
  // processZones map: { processZone_0: [], processZone_1: [] }
  const [processZones, setProcessZones] = useState({});
  const [outputZone, setOutputZone] = useState([]);

  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState({ open: false, correct: false });

  // Parse process question into parts and blank slots ([빈칸], [빈칸1], [빈칸2] etc.)
  const { parts, blanks } = parseProcessQuestion(problem.step3.processQuestion);
  const blankCount = Math.max(
    blanks.length,
    ...blanks.map((b) => b.blankIndex + 1)
  );

  useEffect(() => {
    const inOpts = problem.step3.inputOptions || problem.step3.input;
    const prOpts = problem.step3.processOptions || (
      Array.isArray(problem.step3.processAnswer)
        ? problem.step3.processAnswer
        : [problem.step3.processAnswer]
    );
    const outOpts = problem.step3.outputOptions || problem.step3.output;

    setInputPool(inOpts.map((t, i) => ({ id: `in-${i}`, text: t })).sort(() => Math.random() - 0.5));
    setProcessPool(prOpts.map((t, i) => ({ id: `pr-${i}`, text: t })).sort(() => Math.random() - 0.5));
    setOutputPool(outOpts.map((t, i) => ({ id: `out-${i}`, text: t })).sort(() => Math.random() - 0.5));

    setInputZone([]);
    const initialProcessZones = {};
    for (let i = 0; i < blankCount; i++) {
      initialProcessZones[`processZone_${i}`] = [];
    }
    setProcessZones(initialProcessZones);
    setOutputZone([]);

    setShowHint(false);
    setModal({ open: false, correct: false });
  }, [problem]);

  function getListById(id) {
    if (id === 'inputPool') return inputPool;
    if (id === 'processPool') return processPool;
    if (id === 'outputPool') return outputPool;

    if (id === 'inputZone') return inputZone;
    if (id === 'outputZone') return outputZone;
    if (id.startsWith('processZone_')) return processZones[id] || [];
    return [];
  }

  function setListById(id, val) {
    if (id === 'inputPool') setInputPool(val);
    if (id === 'processPool') setProcessPool(val);
    if (id === 'outputPool') setOutputPool(val);

    if (id === 'inputZone') setInputZone(val);
    if (id === 'outputZone') setOutputZone(val);
    if (id.startsWith('processZone_')) {
      setProcessZones((prev) => ({ ...prev, [id]: val }));
    }
  }

  function moveCard(cardId, fromZoneId, toZoneId) {
    if (fromZoneId === toZoneId) return;

    let srcList = getListById(fromZoneId);
    let dstList = getListById(toZoneId);

    const card = srcList.find((c) => c.id === cardId);
    if (!card) return;

    let newSrc = srcList.filter((c) => c.id !== cardId);
    let newDst = [...dstList];

    // If target is a process blank zone and already has 1 card, eject old card back to pool
    if (toZoneId.startsWith('processZone_') && newDst.length >= 1) {
      const oldCard = newDst[0];
      newDst = [card];
      if (fromZoneId === 'processPool') {
        newSrc.push(oldCard);
      } else {
        setProcessPool((p) => [...p, oldCard]);
      }
    } else {
      newDst.push(card);
    }

    setListById(fromZoneId, newSrc);
    setListById(toZoneId, newDst);
  }

  function onDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) {
      setListById(source.droppableId, reorder(getListById(source.droppableId), source.index, destination.index));
    } else {
      moveCard(draggableId, source.droppableId, destination.droppableId);
    }
  }

  function handleCheck() {
    const isInputFilled = inputZone.length > 0;
    const isOutputFilled = outputZone.length > 0;
    const isProcessFilled = Array.from({ length: blankCount }).every(
      (_, i) => (processZones[`processZone_${i}`] || []).length > 0
    );

    if (!isInputFilled || !isProcessFilled || !isOutputFilled) {
      setModal({
        open: true,
        correct: false,
        incomplete: true,
      });
      return;
    }

    const inputOk =
      inputZone.length === problem.step3.input.length &&
      inputZone.every((c) => problem.step3.input.includes(c.text));

    const outputOk =
      outputZone.length === problem.step3.output.length &&
      outputZone.every((c) => problem.step3.output.includes(c.text));

    // Check process blanks
    const expectedAnswers = Array.isArray(problem.step3.processAnswer)
      ? problem.step3.processAnswer
      : [problem.step3.processAnswer];

    const processOk = Array.from({ length: blankCount }).every((_, i) => {
      const card = processZones[`processZone_${i}`]?.[0];
      const targetAns = expectedAnswers[i] || expectedAnswers[0];
      return card && card.text === targetAns;
    });

    setModal({
      open: true,
      correct: inputOk && processOk && outputOk,
      incomplete: false,
    });
  }

  function handleRetry() {
    setModal({ open: false, correct: false, incomplete: false });
  }

  const allProcessFilled = Array.from({ length: blankCount }).every(
    (_, i) => (processZones[`processZone_${i}`] || []).length > 0
  );

  return (
    <div className="animate-slide-left">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-0.5">3단계: IPO 구조화</h2>
          <p className="text-slate-500 text-xs font-medium">{problem.step3.question}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-extrabold shadow-2xs shrink-0">
          <Info size={14} className="text-amber-600 shrink-0" />
          <span>입력(Input)과 출력(Output)은 문제에 따라 여러 개일 수 있습니다.</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* IPO Target Zones (Top) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-stretch">
          {/* Input Target */}
          <div className="flex flex-col h-full">
            <p className="text-xs font-bold text-indigo-600 mb-0.5 flex items-center gap-1 shrink-0">
              📥 입력
            </p>
            <Droppable droppableId="inputZone">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`drop-zone h-full min-h-[70px] flex flex-col justify-center gap-1 p-2 rounded-xl transition-all ${
                    snapshot.isDraggingOver ? 'is-over' : ''
                  } ${inputZone.length > 0 ? 'border-indigo-400 bg-indigo-50/70' : 'border-2 border-dashed border-indigo-300 bg-slate-50/50'}`}
                >
                  {inputZone.map((card, idx) => (
                    <Draggable key={card.id} draggableId={card.id} index={idx}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`drag-card bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-800 shadow-2xs select-none ${
                            snap.isDragging ? 'is-dragging' : ''
                          }`}
                        >
                          {card.text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {inputZone.length === 0 && (
                    <p className="text-slate-400 text-xs font-bold m-auto pointer-events-none">
                      [입력] 카드를 올리세요
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Process Target (Supports Multiple Blanks: [빈칸], [빈칸1], [빈칸2]) */}
          <div className="flex flex-col h-full">
            <p className="text-xs font-bold text-purple-600 mb-0.5 flex items-center gap-1 shrink-0">
              ⚙️ 처리 {blankCount > 1 && <span className="text-xs text-purple-500 font-semibold">(빈칸 {blankCount}개)</span>}
            </p>
            
            {/* Inline Process Sentence Container */}
            {(() => {
              const isProcessFilled = Array.from({ length: blankCount }).every(
                (_, i) => (processZones[`processZone_${i}`] || []).length > 0
              );
              return (
                <div
                  className={`drop-zone h-full min-h-[70px] flex flex-col justify-center items-center gap-1 p-2 rounded-xl transition-all ${
                    isProcessFilled
                      ? 'border-purple-400 bg-purple-50/70'
                      : 'border-2 border-dashed border-purple-300 bg-slate-50/50'
                  }`}
                >
                  <div className="text-center leading-relaxed text-slate-800 break-keep font-bold text-xs sm:text-sm w-full my-auto">
                    {parts.map((part, i) => {
                      const blankInfo = blanks[i];
                      const hasCard = (processZones[blankInfo?.droppableId] || []).length > 0;

                      return (
                        <span key={`part-${i}`} className="inline">
                          {part && <span className="align-middle inline">{part}</span>}
                          {blankInfo && (
                            <Droppable droppableId={blankInfo.droppableId}>
                              {(provided, snapshot) => (
                                <span
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`inline-flex items-center justify-center mx-1 px-2 py-0.5 rounded-lg border-2 text-xs sm:text-sm font-extrabold transition-colors align-middle ${
                                    snapshot.isDraggingOver
                                      ? 'border-purple-500 bg-purple-200/90 text-purple-900 shadow-2xs'
                                      : hasCard
                                      ? 'border-purple-400/90 bg-purple-100/90 text-purple-950 shadow-2xs'
                                      : 'border-dashed border-purple-400 bg-white/90 text-purple-600 shadow-2xs'
                                  }`}
                                >
                                  {hasCard ? (
                                    (processZones[blankInfo.droppableId] || []).map((card, idx) => (
                                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                                        {(prov, snap) => (
                                          <span
                                            ref={prov.innerRef}
                                            {...prov.draggableProps}
                                            {...prov.dragHandleProps}
                                            className={`drag-card inline-flex items-center justify-center select-none ${
                                              snap.isDragging ? 'is-dragging shadow-md bg-purple-200 rounded-md border border-purple-400 px-2 py-0.5' : ''
                                            }`}
                                          >
                                            {card.text}
                                          </span>
                                        )}
                                      </Draggable>
                                    ))
                                  ) : (
                                    <span className="pointer-events-none whitespace-nowrap text-purple-600 font-bold">
                                      [ {blankCount > 1 ? blankInfo.label : '여기에 드롭'} ]
                                    </span>
                                  )}
                                  <span className="hidden">{provided.placeholder}</span>
                                </span>
                              )}
                            </Droppable>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Output Target */}
          <div className="flex flex-col h-full">
            <p className="text-xs font-bold text-indigo-600 mb-0.5 flex items-center gap-1 shrink-0">
              📤 출력
            </p>
            <Droppable droppableId="outputZone">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`drop-zone h-full min-h-[70px] flex flex-col justify-center gap-1 p-2 rounded-xl transition-all ${
                    snapshot.isDraggingOver ? 'is-over' : ''
                  } ${outputZone.length > 0 ? 'border-indigo-400 bg-indigo-50/70' : 'border-2 border-dashed border-indigo-300 bg-slate-50/50'}`}
                >
                  {outputZone.map((card, idx) => (
                    <Draggable key={card.id} draggableId={card.id} index={idx}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`drag-card bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-800 shadow-2xs select-none ${
                            snap.isDragging ? 'is-dragging' : ''
                          }`}
                        >
                          {card.text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {outputZone.length === 0 && (
                    <p className="text-slate-400 text-xs font-bold m-auto pointer-events-none">
                      [출력] 카드를 올리세요
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* Source Option Pools (Bottom) */}
        <div className="space-y-1.5 bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400">👇 아래 보기 카드를 위 상자로 끌어다 놓으세요</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Input Pool */}
            <div className="bg-indigo-50/40 rounded-xl p-2 border border-indigo-100/60">
              <p className="text-[11px] font-bold text-indigo-500 mb-1">📥 입력 보기</p>
              <Droppable droppableId="inputPool">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-1 min-h-[38px]"
                  >
                    {inputPool.map((card, idx) => (
                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`drag-card bg-white border border-indigo-200 hover:border-indigo-400 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs select-none cursor-grab active:cursor-grabbing ${
                              snap.isDragging ? 'is-dragging' : ''
                            }`}
                          >
                            {card.text}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Process Pool */}
            <div className="bg-purple-50/40 rounded-xl p-2 border border-purple-100/60">
              <p className="text-[11px] font-bold text-purple-500 mb-1">⚙️ 처리 보기</p>
              <Droppable droppableId="processPool">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-1 min-h-[38px]"
                  >
                    {processPool.map((card, idx) => (
                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`drag-card bg-white border border-purple-200 hover:border-purple-400 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs select-none cursor-grab active:cursor-grabbing ${
                              snap.isDragging ? 'is-dragging' : ''
                            }`}
                          >
                            {card.text}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Output Pool */}
            <div className="bg-emerald-50/40 rounded-xl p-2 border border-emerald-100/60">
              <p className="text-[11px] font-bold text-emerald-500 mb-1">📤 출력 보기</p>
              <Droppable droppableId="outputPool">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-1 min-h-[38px]"
                  >
                    {outputPool.map((card, idx) => (
                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`drag-card bg-white border border-emerald-200 hover:border-emerald-400 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs select-none cursor-grab active:cursor-grabbing ${
                              snap.isDragging ? 'is-dragging' : ''
                            }`}
                          >
                            {card.text}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Action Footer */}
      <div className="flex gap-2.5 mt-2.5">
        <button onClick={() => setShowHint(true)} className="btn-secondary py-2 px-5 text-xs flex items-center gap-1.5 cursor-pointer">
          <Lightbulb size={15} className="text-amber-500" />
          <span>힌트 보기</span>
        </button>
        <button onClick={handleCheck} className="btn-primary py-2 px-5 text-xs flex-1 flex items-center justify-center gap-1.5 cursor-pointer">
          <CheckCircle2 size={16} />
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
              <h3 className="text-lg font-black text-slate-800 mb-3">3단계 힌트</h3>
              {typeof problem.step3.hint === 'object' && problem.step3.hint !== null ? (
                <div className="space-y-2.5 text-left">
                  {problem.step3.hint.input && (
                    <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5 shadow-2xs">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">📥 입력</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-keep">{problem.step3.hint.input}</p>
                    </div>
                  )}
                  {problem.step3.hint.process && (
                    <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-start gap-2.5 shadow-2xs">
                      <span className="text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">⚙️ 처리</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-keep">{problem.step3.hint.process}</p>
                    </div>
                  )}
                  {problem.step3.hint.output && (
                    <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-start gap-2.5 shadow-2xs">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 mt-0.5">📤 출력</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug break-keep">{problem.step3.hint.output}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
                  {problem.step3.hint || '입력-처리-출력 관계를 생각해서 카드를 배치해보세요.'}
                </p>
              )}
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={modal.open}
        isCorrect={modal.correct}
        explanation={
          modal.incomplete
            ? '📌 [입력], [처리], [출력] 모든 상자에 카드를 1개 이상 끌어다 놓은 후 정답을 확인해보세요!'
            : problem.step3.explanation
        }
        onNext={() => {
          setModal({ open: false, correct: false, incomplete: false });
          if (modal.correct) onComplete();
        }}
        onRetry={handleRetry}
        isLastStep={true}
      />
    </div>
  );
}
