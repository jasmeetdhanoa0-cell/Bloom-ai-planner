import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar as CalendarIcon, Clock, Tag, Flag } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { TaskCategory, TaskPriority, CalendarItemType } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    addTask,
    addCalendarItem,
    quickAddInitialDate,
    quickAddInitialTab,
  } = useBloom();

  const [tab, setTab] = useState<'task' | 'event'>('task');

  // Task form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('25m');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [notes, setNotes] = useState('');

  // Calendar form state
  const [eventType, setEventType] = useState<CalendarItemType>('Study session');

  useEffect(() => {
    if (isQuickAddOpen) {
      if (quickAddInitialTab) setTab(quickAddInitialTab);
      if (quickAddInitialDate) setDate(quickAddInitialDate);
    }
  }, [isQuickAddOpen, quickAddInitialTab, quickAddInitialDate]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (tab === 'task') {
      addTask({
        title: title.trim(),
        completed: false,
        date,
        time,
        duration,
        priority,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addCalendarItem({
        title: title.trim(),
        type: eventType,
        date,
        time,
        durationMinutes: duration === '1h' ? 60 : parseInt(duration) || 30,
        notes: notes.trim() || undefined,
        color: '#F472B6',
      });
    }

    // Reset and close
    setTitle('');
    setNotes('');
    setIsQuickAddOpen(false);
  };

  const categories: TaskCategory[] = ['Study', 'Work', 'Personal', 'Creator', 'Learning'];
  const eventTypes: CalendarItemType[] = ['Task', 'Event', 'Exam', 'Assignment', 'Reminder', 'Study session'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 overflow-hidden my-6 animate-gentle-float">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--bloom-border)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('task')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'task'
                  ? 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] border border-[var(--bloom-primary)]'
                  : 'text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              New Task
            </button>
            <button
              onClick={() => setTab('event')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'event'
                  ? 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] border border-[var(--bloom-primary)]'
                  : 'text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar Item
            </button>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 rounded-full hover:bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
              {tab === 'task' ? 'What do you want to accomplish? 🌷' : 'Event / Session Title ✨'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tab === 'task' ? 'e.g. Read Chapter 5 or Draft Presentation' : 'e.g. History Midterm or Lab Office Hours'}
              className="w-full px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]"
            />
          </div>

          {/* Date, Time, Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs focus:outline-none"
              >
                <option value="15m">15 min</option>
                <option value="25m">25 min (Pomodoro)</option>
                <option value="45m">45 min</option>
                <option value="50m">50 min (Deep Work)</option>
                <option value="1h">1 hour</option>
                <option value="2h">2 hours</option>
              </select>
            </div>
          </div>

          {/* Specific options for Task */}
          {tab === 'task' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        priority === p
                          ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)]'
                          : 'border-[var(--bloom-border)] text-[var(--bloom-text-muted)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Event Type</label>
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map((et) => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => setEventType(et)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      eventType === et
                        ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)]'
                        : 'border-[var(--bloom-border)] text-[var(--bloom-text-muted)]'
                    }`}
                  >
                    {et}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add gentle reminders, links, or textbook pages..."
              className="w-full px-4 py-2 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 shadow-sm"
            >
              Add to {tab === 'task' ? 'Planner' : 'Calendar'} 🌸
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
