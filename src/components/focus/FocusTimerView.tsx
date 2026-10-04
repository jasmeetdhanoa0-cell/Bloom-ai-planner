import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Music,
  Radio,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { CutePet } from '../pet/CutePet';
import { BloomDropdown, BloomDropdownOption } from '../common/BloomDropdown';
import { focusAudio, FocusSoundId, FOCUS_SOUND_OPTIONS } from '../../utils/focusAudio';

export const FocusTimerView: React.FC = () => {
  const { tasks, toggleTask, gainPetXP, triggerCelebration, playChime, profile } = useBloom();

  // Presets: 25/5, 50/10, Custom
  const [focusDuration, setFocusDuration] = useState(25 * 60); // seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [preset, setPreset] = useState<'25/5' | '50/10' | 'custom'>('25/5');
  const [customMinutes, setCustomMinutes] = useState(30);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState<string>(tasks[0]?.id || '');
  const [sessionCompletedModal, setSessionCompletedModal] = useState(false);

  // Audio system state (subscribed from focusAudio singleton)
  const [selectedSound, setSelectedSound] = useState<FocusSoundId>(() => focusAudio.getSoundId());
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(() => focusAudio.isEnabled());
  const [volume, setVolume] = useState<number>(() => focusAudio.getVolume());
  const [isAudioBlocked, setIsAudioBlocked] = useState<boolean>(() => focusAudio.isBlocked());

  // Subscribe to audio changes
  useEffect(() => {
    const unsubscribe = focusAudio.subscribe(() => {
      setSelectedSound(focusAudio.getSoundId());
      setIsMusicEnabled(focusAudio.isEnabled());
      setVolume(focusAudio.getVolume());
      setIsAudioBlocked(focusAudio.isBlocked());
    });
    return unsubscribe;
  }, []);

  // Switch presets
  const handleSelectPreset = (p: '25/5' | '50/10' | 'custom') => {
    setPreset(p);
    setIsRunning(false);
    setIsBreak(false);
    if (p === '25/5') {
      setFocusDuration(25 * 60);
      setBreakDuration(5 * 60);
      setTimeLeft(25 * 60);
    } else if (p === '50/10') {
      setFocusDuration(50 * 60);
      setBreakDuration(10 * 60);
      setTimeLeft(50 * 60);
    } else {
      setFocusDuration(customMinutes * 60);
      setBreakDuration(5 * 60);
      setTimeLeft(customMinutes * 60);
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed session!
      setIsRunning(false);
      playChime('timer');
      triggerCelebration();

      if (!isBreak) {
        gainPetXP(40, 'Focus Session Completed');
        setSessionCompletedModal(true);
      } else {
        // Break ended
        setIsBreak(false);
        setTimeLeft(focusDuration);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, focusDuration]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    playChime('tap');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration : focusDuration);
    playChime('tap');
  };

  // Sound selection handler
  const handleSoundChange = (soundId: FocusSoundId) => {
    focusAudio.setSound(soundId);
    playChime('tap');
  };

  // Music toggle handler
  const handleToggleMusic = () => {
    focusAudio.resumeAudioContext();
    focusAudio.setMusicEnabled(!isMusicEnabled);
    playChime('tap');
  };

  // Volume slider handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    focusAudio.setVolume(val);
  };

  const totalTime = isBreak ? breakDuration : focusDuration;
  const progressPercent = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const linkedTask = tasks.find((t) => t.id === linkedTaskId);

  // Task dropdown options for BloomDropdown
  const taskOptions: BloomDropdownOption[] = [
    { value: '', label: '-- No specific task (Pure Focus) --', emoji: '🧘' },
    ...tasks
      .filter((t) => !t.completed)
      .map((t) => ({
        value: t.id,
        label: t.title,
        emoji: '📌',
        desc: `${t.category} · ${t.duration || '25m'}`,
      })),
  ];

  // Sound dropdown options
  const soundDropdownOptions: BloomDropdownOption<FocusSoundId>[] = FOCUS_SOUND_OPTIONS.map((s) => ({
    value: s.id,
    label: s.label,
    emoji: s.emoji,
    desc: s.desc,
  }));

  // Determine current timer state for smooth status styling
  const timerState: 'ready' | 'running' | 'paused' | 'break' = isBreak
    ? 'break'
    : isRunning
    ? 'running'
    : timeLeft < focusDuration
    ? 'paused'
    : 'ready';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Focus Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>⏱️</span>
            <span>Focus Sanctuary</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Deep, uninterrupted flow with your cozy companion studying right beside you.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--bloom-card-subtle)] rounded-2xl border border-[var(--bloom-border)] self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => handleSelectPreset('25/5')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              preset === '25/5'
                ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
            }`}
          >
            25/5 Pomodoro
          </button>
          <button
            onClick={() => handleSelectPreset('50/10')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              preset === '50/10'
                ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
            }`}
          >
            50/10 Deep Work
          </button>
          <button
            onClick={() => handleSelectPreset('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              preset === 'custom'
                ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom Duration Stepper if Custom is active */}
      {preset === 'custom' && (
        <div className="bg-[var(--bloom-card)] p-4 rounded-2xl border border-[var(--bloom-border)] shadow-xs flex flex-wrap items-center justify-between gap-3 max-w-md mx-auto transition-all">
          <span className="text-xs font-bold text-[var(--bloom-text)]">Custom Focus Duration:</span>
          <div className="flex items-center gap-1.5">
            {[10, 15, 25, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setCustomMinutes(m);
                  setFocusDuration(m * 60);
                  setTimeLeft(m * 60);
                  setIsRunning(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  customMinutes === m
                    ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] font-bold shadow-2xs'
                    : 'border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Focus Card */}
      <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-6 md:p-10 flex flex-col items-center justify-center space-y-6 text-center transition-colors duration-300">
        {/* Linked Task Selector with BloomDropdown (No white rectangle glitch!) */}
        <div className="w-full max-w-md text-left space-y-1.5">
          <label className="block text-[11px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider">
            Focusing on:
          </label>
          <BloomDropdown
            value={linkedTaskId}
            onChange={(val) => setLinkedTaskId(val)}
            options={taskOptions}
          />
        </div>

        {/* Circular Timer Visual Display */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center select-none">
          {/* Outer circular track */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-[var(--bloom-border)]"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-[var(--bloom-primary)] transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 125}
              strokeDashoffset={2 * Math.PI * 125 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all duration-300 ${
                timerState === 'break'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : timerState === 'running'
                  ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 animate-pulse'
                  : timerState === 'paused'
                  ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                  : 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)]'
              }`}
            >
              {timerState === 'break'
                ? '☕ Cozy Break'
                : timerState === 'running'
                ? '✨ Deep Focus'
                : timerState === 'paused'
                ? '⏸️ Paused'
                : '🌸 Ready to Flow'}
            </span>

            <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-[var(--bloom-text)] font-heading transition-colors">
              {formatTime(timeLeft)}
            </span>

            <span className="text-xs text-[var(--bloom-text-muted)] font-medium">
              {Math.round(progressPercent)}% completed
            </span>
          </div>
        </div>

        {/* Companion Pet Studying Beside You with Gentle Non-distracting Animation */}
        <div className="flex items-center gap-3 p-3.5 px-6 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] transition-all duration-300">
          <CutePet
            type={profile.petType}
            state={isBreak ? 'comforting' : isRunning ? 'studying' : 'idle'}
            size="sm"
          />
          <div className="text-left text-xs">
            <span className="font-bold text-[var(--bloom-text)] block">
              {profile.petName} is{' '}
              {isBreak
                ? 'taking a mindful rest with you ☕'
                : isRunning
                ? 'studying alongside you 📚'
                : 'waiting for you to start'}
            </span>
            <span className="text-[11px] text-[var(--bloom-text-muted)]">
              {isBreak
                ? 'Hydrate, stretch, and relax your eyes.'
                : isRunning
                ? 'Holding quiet focus with gentle care...'
                : 'Take a soft breath and press Play!'}
            </span>
          </div>
        </div>

        {/* Primary Timer Controls: Start/Pause & Reset */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl text-sm font-bold text-white shadow-md active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] hover:bg-[var(--bloom-card)] text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)] active:scale-95 transition-all duration-150 cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* BLOOM FOCUS AMBIENT SOUND SYSTEM & USER MUSIC CONTROLS */}
        {/* ============================================================ */}
        <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] space-y-3.5 text-left transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bloom-border)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-[var(--bloom-primary)] flex items-center justify-center">
                <Music className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--bloom-text)] block">
                  Focus Ambient Music
                </span>
                <span className="text-[10px] text-[var(--bloom-text-muted)] block">
                  Smooth crossfading • User controlled
                </span>
              </div>
            </div>

            {/* Music ON / OFF Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--bloom-text-muted)]">Music:</span>
              <button
                type="button"
                onClick={handleToggleMusic}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isMusicEnabled && selectedSound !== 'none'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-[var(--bloom-card)] border border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
                }`}
                title="Turn music ON or OFF"
              >
                <Radio className={`w-3.5 h-3.5 ${isMusicEnabled && selectedSound !== 'none' ? 'animate-pulse' : ''}`} />
                <span>{isMusicEnabled && selectedSound !== 'none' ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Autoplay blocked notice if browser requires user gesture */}
          {isAudioBlocked && (
            <button
              onClick={() => focusAudio.resumeAudioContext()}
              className="w-full p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <span>Tap to start Focus sounds 🎵</span>
            </button>
          )}

          {/* Sound Selector (Custom BloomDropdown: Guaranteed Dark Bloom Card Background, No White Rectangle!) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider block">
              Ambient Sound Track:
            </label>
            <BloomDropdown<FocusSoundId>
              value={selectedSound}
              onChange={handleSoundChange}
              options={soundDropdownOptions}
              icon={<Volume2 className="w-3.5 h-3.5 text-[var(--bloom-primary)]" />}
            />
          </div>

          {/* Volume Control Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--bloom-text)]">
              <div className="flex items-center gap-1.5">
                {volume === 0 || !isMusicEnabled ? (
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[var(--bloom-primary)]" />
                )}
                <span>Sound Volume</span>
              </div>
              <span className="text-[10px] text-[var(--bloom-text-muted)] font-mono">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!isMusicEnabled || selectedSound === 'none'}
                className="w-full accent-[var(--bloom-primary)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Session Completed Celebration Modal */}
      {sessionCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 md:p-8 text-center space-y-4 animate-celebrate">
            <div className="inline-block p-3 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 text-3xl">
              🎉
            </div>

            <h3 className="text-xl font-bold text-[var(--bloom-text)] font-heading">
              Session Complete! 🌸
            </h3>

            <p className="text-xs text-[var(--bloom-text-muted)]">
              You worked with serene dedication. Your brain and body earned a lovely break!
            </p>

            <div className="p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs font-semibold text-[var(--bloom-primary)] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+40 Pet XP earned! {profile.petName} is celebrating!</span>
            </div>

            {linkedTask && !linkedTask.completed && (
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs flex items-center justify-between">
                <span className="font-medium text-[var(--bloom-text)] truncate mr-2">
                  Mark "{linkedTask.title}" done?
                </span>
                <button
                  onClick={() => {
                    toggleTask(linkedTask.id);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-500 text-white hover:bg-pink-600 shrink-0 cursor-pointer shadow-2xs"
                >
                  Mark Done
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSessionCompletedModal(false);
                  setIsBreak(true);
                  setTimeLeft(breakDuration);
                  setIsRunning(true);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-sm transition-all cursor-pointer"
              >
                Start 5m Break ☕
              </button>
              <button
                onClick={() => setSessionCompletedModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
