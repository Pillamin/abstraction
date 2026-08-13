// src/components/common/FeedbackModal.jsx
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Lightbulb } from 'lucide-react';

function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };
  function fire(particleRatio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.6 } });
  fire(0.2, { spread: 60, origin: { x: 0.8, y: 0.6 } });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.5, y: 0.5 } });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export default function FeedbackModal({
  isOpen,
  isCorrect,
  explanation,
  onNext,
  onRetry,
  nextLabel = '다음 단계로',
  soundOn = true,
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    let ctx = null;
    if (isCorrect) {
      fireConfetti();
      if (soundOn) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.6);
          setTimeout(() => { if (ctx && ctx.state !== 'closed') ctx.close(); }, 700);
        } catch (e) {
          console.warn('Audio play error:', e);
        }
      }
    } else {
      if (soundOn) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          setTimeout(() => { if (ctx && ctx.state !== 'closed') ctx.close(); }, 500);
        } catch (e) {
          console.warn('Audio play error:', e);
        }
      }
    }

    return () => {
      if (ctx && ctx.state !== 'closed') {
        try { ctx.close(); } catch {}
      }
    };
  }, [isOpen, isCorrect, soundOn]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={isCorrect ? undefined : onRetry}
      />

      {/* Modal */}
      <div
        className={`relative z-10 max-w-md w-full rounded-3xl p-8 shadow-2xl animate-bounce-in ${
          isCorrect ? 'bg-white border-2 border-emerald-200' : 'bg-white border-2 border-rose-200 animate-shake'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle size={48} className="text-rose-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-extrabold text-center mb-2 ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isCorrect ? '🎉 정답입니다!' : '😅 다시 도전해 봐요!'}
        </h2>
        <p className="text-slate-500 text-center text-sm mb-6">
          {isCorrect ? '훌륭해요! 다음 단계로 진행해요.' : '틀렸어도 괜찮아요. 다시 생각해 보세요!'}
        </p>

        {/* Explanation */}
        {explanation && (
          <div className={`rounded-2xl p-4 mb-6 flex gap-3 ${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <Lightbulb size={20} className={isCorrect ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-rose-400 shrink-0 mt-0.5'} />
            <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isCorrect ? (
            <button onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {nextLabel}
              <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={onRetry} className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full py-3 px-6 font-bold transition-all active:scale-95">
              <RotateCcw size={18} />
              다시 시도하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
