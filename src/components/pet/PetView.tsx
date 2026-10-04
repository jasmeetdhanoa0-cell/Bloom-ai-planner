import React, { useState } from 'react';
import { Heart, Sparkles, Coffee, BookOpen, Smile, Award, Edit2, Check } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { PetType, PetState } from '../../types';
import { CutePet } from './CutePet';

export const PetView: React.FC = () => {
  const { profile, updateProfile, petState, setPetState, gainPetXP, petInteraction, petQuote } = useBloom();

  const [isEditingName, setIsEditingName] = useState(false);
  const [petNameInput, setPetNameInput] = useState(profile.petName);

  const petTypes: { type: PetType; emoji: string; desc: string }[] = [
    { type: 'Bunny', emoji: '🐰', desc: 'Gentle, attentive & loves pastel reading nooks' },
    { type: 'Cat', emoji: '🐱', desc: 'Calm, independent & purrs when tasks are done' },
    { type: 'Dog', emoji: '🐶', desc: 'Cheerful, loyal & always celebrates your wins' },
    { type: 'Bear', emoji: '🐻', desc: 'Warm, cozy & keeps you grounded during long sessions' },
    { type: 'Fox', emoji: '🦊', desc: 'Quick, clever & enjoys sharp 25m sprints' },
    { type: 'Hamster', emoji: '🐹', desc: 'Tiny, hardworking & collects little victories' },
    { type: 'Panda', emoji: '🐼', desc: 'Peaceful, zen & prevents study burnout' },
    { type: 'Frog', emoji: '🐸', desc: 'Fresh, serene & loves hydration breaks' },
  ];

  const petStatesList: { state: PetState; label: string; icon: string }[] = [
    { state: 'idle', label: 'Idle / Resting', icon: '🌱' },
    { state: 'happy', label: 'Happy', icon: '💖' },
    { state: 'studying', label: 'Studying', icon: '👓' },
    { state: 'sleepy', label: 'Sleepy', icon: '💤' },
    { state: 'celebrating', label: 'Celebrating', icon: '🎉' },
    { state: 'comforting', label: 'Comforting', icon: '🧣' },
  ];

  const handleSavePetName = () => {
    if (!petNameInput.trim()) return;
    updateProfile({ petName: petNameInput.trim() });
    setIsEditingName(false);
  };

  const levelProgress = profile.petXP % 100;
  const levelNames = ['Seedling', 'Sprout', 'Bud', 'Bloom', 'Blossom', 'Garden Master'];
  const currentTitle = levelNames[Math.min(levelNames.length - 1, profile.petLevel - 1)] || 'Blossom';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>🐾</span>
            <span>My Companion Sanctuary</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            A gentle companion that grows with your daily progress and never shames you.
          </p>
        </div>
      </div>

      {/* Main Pet Stage */}
      <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-8 md:p-12 text-center space-y-6">
        <div className="relative inline-block">
          <CutePet
            type={profile.petType}
            state={petState}
            size="xl"
            onPetClick={() => petInteraction('pat')}
          />
        </div>

        {/* Pet Name & Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  className="px-3 py-1 rounded-xl border border-[var(--bloom-primary)] bg-[var(--bloom-card-subtle)] text-sm font-bold text-center text-[var(--bloom-text)]"
                />
                <button
                  onClick={handleSavePetName}
                  className="p-1.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[var(--bloom-text)] font-heading">
                  {profile.petName}
                </h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] p-1"
                  title="Rename pet"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          <p className="text-xs font-semibold text-[var(--bloom-primary)]">
            Level {profile.petLevel} · {currentTitle} {profile.petType}
          </p>
        </div>

        {/* XP Progress Bar */}
        <div className="max-w-md mx-auto space-y-1.5">
          <div className="w-full bg-[var(--bloom-border)] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--bloom-text-muted)]">
            <span>Current: {profile.petXP} total XP</span>
            <span>{levelProgress} / 100 XP to Level {profile.petLevel + 1}</span>
          </div>
        </div>

        {/* Pet Quote Speech Bubble */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs md:text-sm text-[var(--bloom-text)] italic leading-relaxed">
          "{petQuote}"
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => petInteraction('pat')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>💖 Gentle Pat</span>
            <span className="text-[10px] text-pink-400">(+5 XP)</span>
          </button>

          <button
            onClick={() => petInteraction('feed')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🍓 Sweet Strawberry Snack</span>
            <span className="text-[10px] text-rose-400">(+10 XP)</span>
          </button>

          <button
            onClick={() => petInteraction('study')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>👓 Study Spectacles</span>
            <span className="text-[10px] text-purple-400">(+15 XP)</span>
          </button>
        </div>
      </div>

      {/* Switch Pet Companion */}
      <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">
          Choose a Different Companion
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {petTypes.map((p) => {
            const isSelected = profile.petType === p.type;
            return (
              <button
                key={p.type}
                onClick={() => updateProfile({ petType: p.type })}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] ring-1 ring-[var(--bloom-primary)] shadow-xs'
                    : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:border-[var(--bloom-primary)]/50'
                }`}
              >
                <span className="text-3xl block">{p.emoji}</span>
                <span className="text-xs font-bold text-[var(--bloom-text)] block mt-2">{p.type}</span>
                <p className="text-[10px] text-[var(--bloom-text-muted)] mt-0.5 line-clamp-2">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Pet States */}
      <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">
          Test Pet Emotional States
        </h3>
        <p className="text-xs text-[var(--bloom-text-muted)]">
          Pet states naturally adapt as you work, take breaks, feel overwhelmed, or celebrate completions.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {petStatesList.map((st) => (
            <button
              key={st.state}
              onClick={() => setPetState(st.state)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                petState === st.state
                  ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] font-bold'
                  : 'border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]'
              }`}
            >
              <span className="text-lg block">{st.icon}</span>
              <span className="text-[11px] block mt-1">{st.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
