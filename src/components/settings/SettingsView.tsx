import React, { useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  Palette,
  Sparkles,
  Bell,
  Shield,
  Lock,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { ModeType, AILevel } from '../../types';
import { storage } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    setTheme,
    toggleMode,
    setIsOnboardingOpen,
    triggerCelebration,
  } = useBloom();

  const [savedNotice, setSavedNotice] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  const modeOptions: ModeType[] = ['Student', 'Work', 'Creator', 'Personal', 'Learning'];
  const aiOptions: { level: AILevel; desc: string }[] = [
    { level: 'Minimal', desc: 'Manual control first; AI only speaks when explicitly asked.' },
    { level: 'Balanced', desc: 'Gentle suggestions, study summaries & energy-based advice.' },
    { level: 'Full AI', desc: 'Smart breakdowns, automated schedules & proactive insights.' },
  ];

  const handleSaveProfile = () => {
    updateProfile({
      name: name.trim() || 'Bloom Friend',
      avatar,
    });
    setSavedNotice(true);
    triggerCelebration();
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      profile,
      tasks: storage.getTasks(),
      calendar: storage.getCalendarItems(),
      diary: storage.getDiary(),
      documents: storage.getDocuments(),
      studyDecks: storage.getStudyDecks(),
      studyNotes: storage.getStudyNotes(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings &amp; Preferences</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Customize your persona, modes, AI behavior, and data privacy.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved!</span>
          </div>
        )}
      </div>

      {/* 1. Profile Section */}
      <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--bloom-border)] pb-3">
          <User className="w-4 h-4 text-pink-500" />
          <h2 className="text-sm font-bold text-[var(--bloom-text)] font-heading">User Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Avatar Emoji</label>
            <div className="flex items-center gap-2">
              {['🌸', '🌷', '✨', '🍵', '🐰', '⭐', '🍓', '🌿'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`p-2 rounded-xl border text-base transition-all ${
                    avatar === em
                      ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] scale-110 shadow-2xs'
                      : 'border-[var(--bloom-border)] hover:bg-[var(--bloom-card-subtle)]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-[var(--bloom-primary)] hover:bg-[var(--bloom-primary-hover)] transition-colors shadow-xs"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* 2. Active Modes */}
      <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--bloom-border)] pb-3">
          <Sliders className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Active Productivity Modes</h2>
        </div>
        <p className="text-xs text-[var(--bloom-text-muted)]">
          Enable or disable modes based on your lifestyle:
        </p>

        <div className="flex flex-wrap gap-2">
          {modeOptions.map((m) => {
            const isSelected = profile.modes.includes(m);
            return (
              <button
                key={m}
                onClick={() => toggleMode(m)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] shadow-2xs'
                    : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)]'
                }`}
              >
                {m} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AI Preferences */}
      <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--bloom-border)] pb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-[var(--bloom-text)] font-heading">AI Assistance Level</h2>
        </div>

        <div className="space-y-2">
          {aiOptions.map((opt) => {
            const isSelected = profile.aiLevel === opt.level;
            return (
              <div
                key={opt.level}
                onClick={() => updateProfile({ aiLevel: opt.level })}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] shadow-2xs'
                    : 'border-[var(--bloom-border)] hover:bg-[var(--bloom-card-subtle)]'
                }`}
              >
                <div className="mt-0.5">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary)]' : 'border-stone-400'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--bloom-text)]">{opt.level}</span>
                  <p className="text-[11px] text-[var(--bloom-text-muted)] mt-0.5">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Privacy & Notifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-[var(--bloom-text)] font-heading">Privacy &amp; Security</h3>
          </div>
          <p className="text-[11px] text-[var(--bloom-text-muted)] leading-relaxed">
            Your diary, tasks, and documents reside in your local browser sandbox. Ready for Firestore &amp; Firebase Authentication sync without sacrificing confidentiality.
          </p>
          <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
            ✓ 100% Local data first architecture
          </div>
        </div>

        <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-[var(--bloom-text)] font-heading">Gentle Chimes &amp; Reminders</h3>
          </div>
          <p className="text-[11px] text-[var(--bloom-text-muted)] leading-relaxed">
            Cozy sound blips play upon completing tasks, timer sessions, and leveling up your virtual pet.
          </p>
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--bloom-text)] pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.notificationsEnabled}
              onChange={(e) => updateProfile({ notificationsEnabled: e.target.checked })}
              className="accent-[var(--bloom-primary)] rounded-md w-4 h-4"
            />
            <span>Enable Gentle Chimes &amp; Reminders</span>
          </label>
        </div>
      </div>

      {/* 5. Account & Data Management */}
      <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--bloom-border)] pb-3">
          <Lock className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Account &amp; Data Control</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:bg-[var(--bloom-card)] text-[var(--bloom-text)] transition-colors flex items-center gap-2"
          >
            <span>🌷 Replay Onboarding Flow</span>
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:bg-[var(--bloom-card)] text-[var(--bloom-text)] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export All Planner Data (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all planner data back to defaults?')) {
                storage.resetAllData();
              }
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
