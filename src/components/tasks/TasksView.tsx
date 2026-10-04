import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  Flag,
  ArrowUpDown,
  Tag,
  Check,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { Task, TaskPriority, TaskCategory } from '../../types';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, setIsQuickAddOpen, gainPetXP } = useBloom();

  // Filters & Section active state
  const [filter, setFilter] = useState<'All' | 'High Priority' | 'Study' | 'Personal' | 'Work'>('All');
  const [activeSection, setActiveSection] = useState<'Today' | 'Upcoming' | 'Completed'>('Today');

  // Edit modal / inline edit state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [breakdownLoadingId, setBreakdownLoadingId] = useState<string | null>(null);

  // Quick inline add input
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('Study');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  const todayDateStr = '2026-09-30';

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Section check
    if (activeSection === 'Completed') {
      if (!task.completed) return false;
    } else if (activeSection === 'Today') {
      if (task.completed || task.date !== todayDateStr) return false;
    } else if (activeSection === 'Upcoming') {
      if (task.completed || task.date <= todayDateStr) return false;
    }

    // Filter check
    if (filter === 'High Priority') return task.priority === 'high';
    if (filter === 'Study') return task.category === 'Study';
    if (filter === 'Personal') return task.category === 'Personal';
    if (filter === 'Work') return task.category === 'Work';
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      completed: false,
      date: activeSection === 'Upcoming' ? '2026-10-01' : todayDateStr,
      duration: '25m',
      priority: quickPriority,
      category: quickCategory,
    });
    setQuickTitle('');
  };

  // AI Breakdown feature: calls /api/bloom/breakdown
  const handleAIBreakdown = async (task: Task) => {
    setBreakdownLoadingId(task.id);
    try {
      const res = await fetch('/api/bloom/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          details: task.notes || '',
        }),
      });
      const data = await res.json();
      if (data.suggestedTasks && data.suggestedTasks.length > 0) {
        data.suggestedTasks.forEach((st: any) => {
          addTask({
            title: st.title,
            completed: false,
            date: task.date,
            duration: st.duration || '20m',
            priority: st.priority || 'medium',
            category: task.category,
            notes: `Subtask of: ${task.title}`,
          });
        });
        gainPetXP(15, 'Task broken into bite-sized steps');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBreakdownLoadingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>📝</span>
            <span>Task Planner</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Organize with clarity. Small steps, high focus, zero guilt.
          </p>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Detailed Task</span>
        </button>
      </div>

      {/* Sections & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Sections Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--bloom-card-subtle)] rounded-2xl border border-[var(--bloom-border)] self-start">
          {(['Today', 'Upcoming', 'Completed'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === sec
                  ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                  : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-[var(--bloom-text-muted)] mr-1">Filter:</span>
          {(['All', 'High Priority', 'Study', 'Personal', 'Work'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                filter === f
                  ? 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] border border-[var(--bloom-primary)] shadow-2xs'
                  : 'bg-[var(--bloom-card)] border border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:border-[var(--bloom-primary)]/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Bar */}
      {activeSection !== 'Completed' && (
        <form
          onSubmit={handleQuickAdd}
          className="flex items-center gap-2 p-2 bg-[var(--bloom-card)] rounded-2xl border border-[var(--bloom-border)] shadow-xs"
        >
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder={`Add a quick task to ${activeSection}...`}
            className="flex-1 px-3 py-2 text-xs text-[var(--bloom-text)] bg-transparent focus:outline-none placeholder:text-[var(--bloom-text-muted)]"
          />

          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
            className="text-[11px] font-medium bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] px-2.5 py-1.5 rounded-xl border border-[var(--bloom-border)] focus:outline-none"
          >
            <option value="Study">Study</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Creator">Creator</option>
            <option value="Learning">Learning</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--bloom-primary-soft)] hover:bg-[var(--bloom-primary)] text-[var(--bloom-primary)] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] text-[var(--bloom-text-muted)] space-y-2">
            <span className="text-3xl block">🌷</span>
            <p className="text-sm font-semibold">No tasks in this section.</p>
            <p className="text-xs">Take a peaceful break or add a task above!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                task.completed
                  ? 'bg-[var(--bloom-card-subtle)]/70 border-[var(--bloom-border)] opacity-60'
                  : 'bg-[var(--bloom-card)] border-[var(--bloom-border)] hover:border-[var(--bloom-primary)]/70 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Complete Toggle */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-[var(--bloom-primary)] hover:scale-110 active:scale-95 transition-transform"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 fill-[var(--bloom-primary)] text-white" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold text-[var(--bloom-text)] ${
                      task.completed ? 'line-through text-[var(--bloom-text-muted)]' : ''
                    }`}
                  >
                    {task.title}
                  </p>

                  {task.notes && (
                    <p className="text-xs text-[var(--bloom-text-muted)] mt-0.5 line-clamp-1 italic">
                      {task.notes}
                    </p>
                  )}

                  {/* Clean unboxed metadata with subtle separators */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--bloom-text-muted)]">
                    <span className="font-semibold text-[var(--bloom-primary)]">{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{task.date}</span>
                    {task.time && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{task.time}</span>
                      </>
                    )}
                    {task.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{task.duration}</span>
                      </>
                    )}
                    {task.priority === 'high' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-500 font-bold">High Priority</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* AI Breakdown Button */}
                {!task.completed && (
                  <button
                    onClick={() => handleAIBreakdown(task)}
                    disabled={breakdownLoadingId === task.id}
                    title="Break down into smaller steps with Bloom AI"
                    className="p-2 rounded-xl text-pink-500 hover:bg-pink-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${breakdownLoadingId === task.id ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline">
                      {breakdownLoadingId === task.id ? 'Breaking...' : 'Breakdown'}
                    </span>
                  </button>
                )}

                {/* Edit */}
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)] transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 space-y-4 animate-gentle-float">
            <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading">Edit Task</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTask.date}
                    onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Time</label>
                  <input
                    type="time"
                    value={editingTask.time || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 25m"
                    value={editingTask.duration || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Category</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                  >
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Creator">Creator</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingTask.notes || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTask(editingTask.id, editingTask);
                  setEditingTask(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--bloom-primary)] hover:bg-[var(--bloom-primary-hover)] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
