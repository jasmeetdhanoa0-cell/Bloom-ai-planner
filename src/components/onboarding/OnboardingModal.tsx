import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { ModeType, PetType, ThemeId, AILevel } from '../../types';
import { CutePet } from '../pet/CutePet';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, profile, updateProfile, setTheme, triggerCelebration } = useBloom();
  const [step, setStep] = useState(1);

  // Local state for wizard
  const [selectedName, setSelectedName] = useState(profile.name || 'Bloom Friend');
  const [selectedModes, setSelectedModes] = useState<ModeType[]>(profile.modes || ['Student']);
  const [selectedPet, setSelectedPet] = useState<PetType>(profile.petType || 'Bunny');
  const [selectedPetName, setSelectedPetName] = useState(profile.petName || 'Mochi');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(profile.theme || 'soft-pastel');
  const [selectedAI, setSelectedAI] = useState<AILevel>(profile.aiLevel || 'Balanced');

  if (!isOnboardingOpen) return null;

  const modeOptions: { id: ModeType; label: string; icon: string; desc: string }[] = [
    { id: 'Student', label: 'Student', icon: '🎓', desc: 'Lectures, exams, assignments & revision' },
    { id: 'Work', label: 'Work', icon: '💼', desc: 'Projects, client tasks & daily meetings' },
    { id: 'Creator', label: 'Creator', icon: '🎨', desc: 'Moodboards, writing, media & design' },
    { id: 'Personal', label: 'Personal', icon: '🏠', desc: 'Habits, wellness, hydration & routines' },
    { id: 'Learning', label: 'Learning', icon: '📚', desc: 'Languages, books, skills & curiosities' },
  ];

  const petOptions: { type: PetType; emoji: string; personality: string }[] = [
    { type: 'Bunny', emoji: '🐰', personality: 'Gentle, curious & loves reading cozy notes' },
    { type: 'Cat', emoji: '🐱', personality: 'Calm, independent & purrs when you finish tasks' },
    { type: 'Dog', emoji: '🐶', personality: 'Enthusiastic, loyal & always cheers you on' },
    { type: 'Bear', emoji: '🐻', personality: 'Warm, huggable & keeps study sessions grounded' },
    { type: 'Fox', emoji: '🦊', personality: 'Clever, playful & loves quick deep sprints' },
    { type: 'Hamster', emoji: '🐹', personality: 'Tiny, hardworking & stores little study wins' },
    { type: 'Panda', emoji: '🐼', personality: 'Peaceful, chill & prevents study burnout' },
    { type: 'Frog', emoji: '🐸', personality: 'Fresh, zen & loves taking mindful tea breaks' },
  ];

  const themeOptions: { id: ThemeId; label: string; icon: string; preview: string }[] = [
    { id: 'soft-pastel', label: 'Soft Pastel', icon: '🌸', preview: 'bg-pink-100 border-pink-300' },
    { id: 'coquette', label: 'Coquette', icon: '🎀', preview: 'bg-rose-100 border-rose-300' },
    { id: 'clean', label: 'Clean', icon: '🫧', preview: 'bg-sky-50 border-sky-300' },
    { id: 'dark-academia', label: 'Dark Academia', icon: '📚', preview: 'bg-stone-800 border-amber-600 text-amber-200' },
    { id: 'lavender', label: 'Lavender', icon: '🪻', preview: 'bg-purple-100 border-purple-300' },
    { id: 'strawberry', label: 'Strawberry', icon: '🍓', preview: 'bg-red-50 border-rose-300' },
    { id: 'cozy', label: 'Cozy', icon: '☕', preview: 'bg-amber-50 border-amber-300' },
    { id: 'night', label: 'Night', icon: '🌙', preview: 'bg-slate-900 border-indigo-500 text-indigo-200' },
  ];

  const aiOptions: { id: AILevel; label: string; icon: string; desc: string }[] = [
    { id: 'Minimal', label: 'Minimal', icon: '🌱', desc: 'Manual control first; AI only speaks when explicitly asked.' },
    { id: 'Balanced', label: 'Balanced', icon: '⚖️', desc: 'Helpful schedule suggestions, gentle study summaries & reminders.' },
    { id: 'Full AI', label: 'Full AI', icon: '✨', desc: 'Smart task breakdowns, automatic study schedules & deep insights.' },
  ];

  const toggleSelectMode = (m: ModeType) => {
    setSelectedModes((prev) =>
      prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m]
    );
  };

  const handleFinish = () => {
    updateProfile({
      name: selectedName.trim() || 'Bloom Friend',
      modes: selectedModes,
      petType: selectedPet,
      petName: selectedPetName.trim() || selectedPet,
      theme: selectedTheme,
      aiLevel: selectedAI,
      onboardingCompleted: true,
    });
    setTheme(selectedTheme);
    triggerCelebration();
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] overflow-hidden my-8 transition-all">
        {/* Progress Bar */}
        <div className="w-full bg-[var(--bloom-border)] h-1.5">
          <div
            className="bg-[var(--bloom-primary)] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-4 space-y-6 animate-gentle-float">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-pink-50 border border-pink-200 text-4xl shadow-sm">
                🌷
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--bloom-text)] font-heading">
                  Welcome to your world 🌷
                </h2>
                <p className="text-base text-[var(--bloom-primary)] font-medium mt-1">
                  Plan • Focus • Grow
                </p>
                <p className="text-sm text-[var(--bloom-text-muted)] max-w-md mx-auto mt-3">
                  A calming, aesthetic planner designed to help you organize your studies and daily life without the noise or stress.
                </p>
              </div>

              <div className="max-w-xs mx-auto text-left">
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1.5">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  placeholder="Your name or nickname"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Choose Modes */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <span className="text-2xl">🌿</span>
                <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading mt-1">
                  Choose your modes
                </h2>
                <p className="text-xs text-[var(--bloom-text-muted)]">
                  Select all that fit your daily rhythm (you can toggle these anytime)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modeOptions.map((mode) => {
                  const isSelected = selectedModes.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      onClick={() => toggleSelectMode(mode.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] ring-1 ring-[var(--bloom-primary)] shadow-xs'
                          : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)]/50'
                      }`}
                    >
                      <span className="text-2xl">{mode.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--bloom-text)]">{mode.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--bloom-primary)]" />}
                        </div>
                        <p className="text-[11px] text-[var(--bloom-text-muted)] mt-0.5 line-clamp-2">{mode.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Choose Pet */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-2xl">🐾</span>
                <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading mt-1">
                  Choose your companion
                </h2>
                <p className="text-xs text-[var(--bloom-text-muted)]">
                  Your pet grows and celebrates your focus sessions alongside you
                </p>
              </div>

              {/* Pet preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-[var(--bloom-card-subtle)] rounded-2xl border border-[var(--bloom-border)] mb-4">
                <CutePet type={selectedPet} state="happy" size="lg" />
                <div className="mt-2 text-center">
                  <input
                    type="text"
                    value={selectedPetName}
                    onChange={(e) => setSelectedPetName(e.target.value)}
                    placeholder="Give your pet a cute name"
                    className="text-center font-bold text-base text-[var(--bloom-text)] border-b border-[var(--bloom-primary)] bg-transparent focus:outline-none px-2 py-0.5"
                  />
                  <p className="text-[11px] text-[var(--bloom-text-muted)] mt-1">Tap above to rename your pet</p>
                </div>
              </div>

              {/* Pet selector grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {petOptions.map((p) => {
                  const isSelected = selectedPet === p.type;
                  return (
                    <button
                      key={p.type}
                      onClick={() => {
                        setSelectedPet(p.type);
                        if (selectedPetName === selectedPet || selectedPetName === 'Mochi') {
                          setSelectedPetName(p.type === 'Bunny' ? 'Mochi' : p.type);
                        }
                      }}
                      className={`p-2 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] ring-2 ring-[var(--bloom-primary)] scale-105'
                          : 'border-[var(--bloom-border)] hover:bg-[var(--bloom-card-subtle)]'
                      }`}
                    >
                      <span className="text-2xl block">{p.emoji}</span>
                      <span className="text-[10px] font-medium text-[var(--bloom-text)] block truncate mt-1">
                        {p.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Choose Theme */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-2xl">🎨</span>
                <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading mt-1">
                  Choose your aesthetic
                </h2>
                <p className="text-xs text-[var(--bloom-text-muted)]">
                  Pick a palette that feels calming to your eyes
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themeOptions.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        setSelectedTheme(th.id);
                        document.documentElement.setAttribute('data-theme', th.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${th.preview} ${
                        isSelected
                          ? 'ring-2 ring-pink-400 shadow-md scale-102'
                          : 'opacity-85 hover:opacity-100 hover:scale-101'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{th.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-pink-600" />}
                      </div>
                      <span className="block text-xs font-bold mt-2 truncate">{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Choose AI Assistance */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <span className="text-2xl">✨</span>
                <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading mt-1">
                  Choose AI assistance
                </h2>
                <p className="text-xs text-[var(--bloom-text-muted)]">
                  Remember: AI suggests. You always decide.
                </p>
              </div>

              <div className="space-y-3">
                {aiOptions.map((opt) => {
                  const isSelected = selectedAI === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedAI(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                        isSelected
                          ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] ring-1 ring-[var(--bloom-primary)] shadow-xs'
                          : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)]/50'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[var(--bloom-text)]">{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--bloom-primary)]" />}
                        </div>
                        <p className="text-xs text-[var(--bloom-text-muted)] mt-1">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons Navigation */}
          <div className="mt-8 pt-4 border-t border-[var(--bloom-border)] flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 shadow-sm flex items-center gap-2 active:scale-95 transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Enter My Bloom Space
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
