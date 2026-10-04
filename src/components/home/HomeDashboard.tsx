import React, { useState } from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Zap,
  Smile,
  AlertCircle,
  Plus,
  Play,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { MoodType, AvailableTime, Task } from '../../types';
import { CutePet } from '../pet/CutePet';
import { BloomDropdown, BloomDropdownOption } from '../common/BloomDropdown';

export const HomeDashboard: React.FC = () => {
  const {
    profile,
    mood,
    setMood,
    energy,
    setEnergy,
    availableTime,
    setAvailableTime,
    tasks,
    toggleTask,
    calendarItems,
    setActiveTab,
    setIsOverwhelmedOpen,
    setIsQuickAddOpen,
    petState,
    petQuote,
    petInteraction,
  } = useBloom();

  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlanResult, setAiPlanResult] = useState<string | null>(null);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const moodOptions: { value: MoodType; emoji: string; label: string }[] = [
    { value: 'Great', emoji: '😊', label: 'Great' },
    { value: 'Good', emoji: '🙂', label: 'Good' },
    { value: 'Okay', emoji: '😐', label: 'Okay' },
    { value: 'Tired', emoji: '😴', label: 'Tired' },
    { value: 'Sleepy', emoji: '🥱', label: 'Sleepy' },
    { value: 'Overwhelmed', emoji: '😵💫', label: 'Overwhelmed' },
    { value: 'Stressed', emoji: '😤', label: 'Stressed' },
    { value: 'Motivated', emoji: '🔥', label: 'Motivated' },
    { value: 'Low', emoji: '😔', label: 'Low' },
    { value: 'Focused', emoji: '🧠', label: 'Focused' },
  ];

  const availableTimeOptions: AvailableTime[] = [
    '15–30 min',
    '30–60 min',
    '1–2 hours',
    '2–4 hours',
    'Most of the day',
    'Custom',
  ];

  // Filter tasks for today (2026-09-30)
  const todayDateStr = '2026-09-30';
  const todayTasks = tasks.filter((t) => t.date === todayDateStr);
  const completedTasks = todayTasks.filter((t) => t.completed);
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = calendarItems
    .filter((c) => c.date >= todayDateStr && (c.type === 'Exam' || c.type === 'Assignment'))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Plan with AI trigger
  const handlePlanWithAI = async () => {
    setAiPlanLoading(true);
    setAiPlanResult(null);
    try {
      const res = await fetch('/api/bloom/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          energy,
          availableTime,
          tasks: todayTasks,
          mode: profile.modes[0] || 'Student',
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiPlanResult(data.reply);
      }
    } catch (e) {
      setAiPlanResult("Here is a gentle rhythm for today: Start with a 25-minute study sprint, enjoy a 5-minute stretch with water, and tackle your top priority reading 🌷");
    } finally {
      setAiPlanLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Top Greeting & Overwhelmed Button Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 md:p-8 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--bloom-text)] font-heading">
              {getGreeting()}, {profile.name}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[var(--bloom-text-muted)]">
            Active modes:{' '}
            {profile.modes.map((m, idx) => (
              <span key={m} className="font-semibold text-[var(--bloom-text)]">
                {m}{idx < profile.modes.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </div>

        {/* Emergency Overwhelmed Button */}
        <button
          onClick={() => setIsOverwhelmedOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-xs active:scale-95 group shrink-0"
        >
          <span className="text-base group-hover:rotate-12 transition-transform">😵💫</span>
          <span>I'm Overwhelmed</span>
        </button>
      </div>

      {/* Mood, Energy & Time Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bloom-card)] p-5 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        {/* Mood Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--bloom-text)]">
            <Smile className="w-4 h-4 text-pink-500" />
            <span>How are you feeling?</span>
          </div>
          <BloomDropdown
            value={mood}
            onChange={(val) => setMood(val as MoodType)}
            options={moodOptions}
          />
        </div>

        {/* Energy Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--bloom-text)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Energy Level</span>
            </div>
            <span className="text-[11px] font-semibold text-[var(--bloom-primary)]">
              {energy === 1 && '🌱 Low / Rest'}
              {energy === 2 && '🍵 Gentle'}
              {energy === 3 && '☕ Balanced'}
              {energy === 4 && '⚡ Good'}
              {energy === 5 && '🔥 High Flow'}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs">🌱</span>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-[var(--bloom-primary)] cursor-pointer"
            />
            <span className="text-xs">🔥</span>
          </div>
        </div>

        {/* Available Time Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--bloom-text)]">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Available Time</span>
          </div>
          <BloomDropdown
            value={availableTime}
            onChange={(val) => setAvailableTime(val as AvailableTime)}
            options={availableTimeOptions.map((opt) => ({
              value: opt,
              label: opt,
              emoji: '⏰',
            }))}
          />
        </div>
      </div>

      {/* 3 Planning Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Plan with AI */}
        <div
          onClick={handlePlanWithAI}
          className="p-5 rounded-3xl bg-gradient-to-br from-pink-50/80 via-white to-purple-50/50 border border-pink-200/70 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Gemini
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Plan with AI</h3>
            <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
              Let Bloom tailor today's focus block to your exact energy ({energy}/5) and mood.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-pink-500 group-hover:translate-x-1 transition-transform">
            <span>{aiPlanLoading ? 'Thinking softly...' : 'Generate Plan'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 2: Plan Myself */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-3xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] hover:border-[var(--bloom-primary)]/70 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Plan Myself</h3>
            <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
              Add your own custom tasks, drag schedules, and set priorities manually.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--bloom-primary)] group-hover:translate-x-1 transition-transform">
            <span>Open Tasks</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Option 3: Plan Together */}
        <div
          onClick={() => setActiveTab('ai')}
          className="p-5 rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 border border-purple-200/70 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl group-hover:scale-110 transition-transform">🤝</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Plan Together</h3>
            <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
              Chat with Bloom AI to brainstorm, break down assignments, and approve each step.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>Start Chat</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* AI Plan Banner if generated */}
      {aiPlanResult && (
        <div className="p-5 rounded-3xl bg-pink-50/90 border border-pink-200 text-stone-800 space-y-2 animate-gentle-float">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌷</span>
              <span className="text-xs font-bold text-pink-700 uppercase tracking-wide">Bloom's Suggested Rhythm</span>
            </div>
            <button
              onClick={() => setAiPlanResult(null)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs leading-relaxed text-stone-700 whitespace-pre-line">{aiPlanResult}</p>
        </div>
      )}

      {/* Main Grid: Today's Tasks + Pet Companion + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks & Progress (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--bloom-text)] font-heading">
                  Today's Tasks
                </h2>
                <p className="text-xs text-[var(--bloom-text-muted)] mt-0.5">
                  {completedTasks.length} of {todayTasks.length} completed
                </p>
              </div>

              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] hover:bg-[var(--bloom-primary)] hover:text-white text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[var(--bloom-border)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--bloom-text-muted)]">
                <span>{progressPercent}% completed today</span>
                <span>{todayTasks.length - completedTasks.length} remaining</span>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-2.5 pt-2">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--bloom-text-muted)] space-y-2">
                  <span className="text-3xl block">🌱</span>
                  <p>No tasks scheduled for today yet. Enjoy your peace or add one!</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                      task.completed
                        ? 'bg-[var(--bloom-card-subtle)]/60 border-[var(--bloom-border)] opacity-60'
                        : 'bg-[var(--bloom-card)] border-[var(--bloom-border)] hover:border-[var(--bloom-primary)]/60 shadow-xs'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-[var(--bloom-primary)] hover:scale-110 active:scale-95 transition-transform"
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-[var(--bloom-primary)] text-white" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs md:text-sm font-medium text-[var(--bloom-text)] ${
                          task.completed ? 'line-through text-[var(--bloom-text-muted)]' : ''
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--bloom-text-muted)]">
                        <span>{task.category}</span>
                        {task.duration && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{task.duration}</span>
                          </>
                        )}
                        {task.time && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{task.time}</span>
                          </>
                        )}
                        {task.priority === 'high' && (
                          <span className="font-semibold text-rose-500">· High Priority</span>
                        )}
                      </div>
                    </div>

                    {!task.completed && (
                      <button
                        onClick={() => setActiveTab('focus')}
                        className="p-1.5 rounded-xl hover:bg-[var(--bloom-primary-soft)] text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] transition-colors"
                        title="Focus on this task"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pet Companion & Upcoming Deadlines (1 col) */}
        <div className="space-y-6">
          {/* Pet Companion Card */}
          <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs text-center space-y-4">
            <div className="relative inline-block">
              <CutePet
                type={profile.petType}
                state={petState}
                size="lg"
                onPetClick={() => petInteraction('pat')}
              />
              <span className="absolute -bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bloom-primary)] text-white shadow-xs">
                Lv. {profile.petLevel}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">
                {profile.petName} the {profile.petType}
              </h3>
              <p className="text-xs text-[var(--bloom-primary)] font-semibold mt-0.5">
                {profile.petXP % 100} / 100 XP to next level
              </p>
            </div>

            {/* Pet Speech Bubble */}
            <div className="p-3.5 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs text-[var(--bloom-text)] leading-relaxed italic relative">
              "{petQuote}"
            </div>

            {/* Pet Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => petInteraction('pat')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 transition-colors"
              >
                💖 Pat
              </button>
              <button
                onClick={() => petInteraction('feed')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
              >
                🍓 Snack
              </button>
              <button
                onClick={() => {
                  petInteraction('study');
                  setActiveTab('focus');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 transition-colors"
              >
                📚 Study
              </button>
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-[var(--bloom-text)] font-heading uppercase tracking-wider">
                  Upcoming Deadlines
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-[11px] font-semibold text-[var(--bloom-primary)] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-[var(--bloom-text-muted)] italic">No urgent exams or assignments.</p>
              ) : (
                upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--bloom-text)]">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--bloom-text-muted)] mt-0.5">
                        <span className="font-semibold text-rose-500">{item.type}</span>
                        <span>·</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    {item.time && (
                      <span className="text-[10px] font-mono text-[var(--bloom-text-muted)]">{item.time}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
