import React, { useState, useEffect } from 'react';
import { X, Heart, Wind, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { CutePet } from '../pet/CutePet';

export const OverwhelmedModal: React.FC = () => {
  const { isOverwhelmedOpen, setIsOverwhelmedOpen, profile, tasks, toggleTask } = useBloom();
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [selectedMicroStep, setSelectedMicroStep] = useState<string>('Drink a warm cup of water or tea slowly');

  // Breathing pacer cycle (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!isOverwhelmedOpen) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setBreathePhase((phase) => {
            if (phase === 'Inhale') return 'Hold';
            if (phase === 'Hold') return 'Exhale';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOverwhelmedOpen]);

  if (!isOverwhelmedOpen) return null;

  // Single easiest unfinished task or self-care task
  const easiestTask = tasks.find((t) => !t.completed && (t.duration === '10m' || t.duration === '15m' || t.priority === 'low')) ||
    tasks.find((t) => !t.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 md:p-8 overflow-hidden text-center space-y-6 animate-gentle-float">
        {/* Close Button */}
        <button
          onClick={() => setIsOverwhelmedOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-bold border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            Safe Space • Zero Guilt
          </div>
          <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading pt-2">
            You don't have to do it all today 🌷
          </h2>
          <p className="text-xs text-[var(--bloom-text-muted)] max-w-sm mx-auto">
            When everything feels too loud, we stop, breathe, and only look at the next single step.
          </p>
        </div>

        {/* Pet Comforting Message */}
        <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-left">
          <CutePet type={profile.petType} state="comforting" size="md" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--bloom-primary)]">{profile.petName} whispers:</p>
            <p className="text-xs text-[var(--bloom-text)] mt-1 italic">
              "I'm right here with you. The world won't end if we pause. Let's just breathe together for a moment."
            </p>
          </div>
        </div>

        {/* Calming Box Breathing Circle */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-4 border-pink-300 transition-all duration-1000 ${
                breathePhase === 'Inhale'
                  ? 'scale-110 bg-pink-100/60 shadow-lg shadow-pink-200'
                  : breathePhase === 'Hold'
                  ? 'scale-105 bg-purple-100/60 shadow-md shadow-purple-200'
                  : 'scale-90 bg-sky-100/60'
              }`}
            />
            <div className="relative z-10 flex flex-col items-center">
              <Wind className="w-5 h-5 text-pink-500 mb-1" />
              <span className="text-sm font-bold text-[var(--bloom-text)] font-heading">{breathePhase}</span>
              <span className="text-xs text-[var(--bloom-text-muted)]">{seconds}s</span>
            </div>
          </div>
        </div>

        {/* Pick One Micro-Step Section */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left space-y-2">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            If you want to do just ONE tiny thing right now:
          </span>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Coffee className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-medium text-stone-800">
                {easiestTask ? easiestTask.title : selectedMicroStep}
              </span>
            </div>
            {easiestTask && (
              <button
                onClick={() => {
                  toggleTask(easiestTask.id);
                  setIsOverwhelmedOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                Mark Done
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsOverwhelmedOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 shadow-sm transition-all"
          >
            I feel a little lighter now 🌸
          </button>
        </div>
      </div>
    </div>
  );
};
