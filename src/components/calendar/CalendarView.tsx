import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { CalendarItem, CalendarItemType } from '../../types';

export const CalendarView: React.FC = () => {
  const { calendarItems, addCalendarItem, deleteCalendarItem, updateCalendarItem, openQuickAdd } = useBloom();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-30T12:00:00'));
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (8 = September, 9 = October)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-30T12:00:00'));
  };

  // Calendar matrix calculation for Month View
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Next month leading days to complete grid
  const remainingSlots = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let n = 1; n <= remainingSlots; n++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    calendarDays.push({ day: n, isCurrentMonth: false, dateStr });
  }

  // Type badge styling
  const getTypeColor = (type: CalendarItemType) => {
    switch (type) {
      case 'Exam':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Assignment':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Study session':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Task':
        return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'Reminder':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Event':
      default:
        return 'text-pink-600 bg-pink-50 border-pink-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)] hover:text-[var(--bloom-text)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)] hover:text-[var(--bloom-text)] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--bloom-text)] font-heading">
              {monthNames[month]} {year}
            </h1>
            <p className="text-xs text-[var(--bloom-text-muted)]">
              {viewMode.toUpperCase()} VIEW · Today is September 30, 2026
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Add Item */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-[var(--bloom-border)] text-xs font-semibold text-[var(--bloom-text)] hover:bg-[var(--bloom-card-subtle)] transition-colors"
          >
            Today
          </button>

          <div className="flex items-center p-1 bg-[var(--bloom-card-subtle)] rounded-xl border border-[var(--bloom-border)]">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                    : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => openQuickAdd('event', '2026-09-30')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-center py-2.5 text-[11px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[var(--bloom-border)]">
            {calendarDays.map((calDay, idx) => {
              const isToday = calDay.dateStr === '2026-09-30';
              const dayItems = calendarItems.filter((item) => item.date === calDay.dateStr);

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between group relative ${
                    !calDay.isCurrentMonth ? 'bg-[var(--bloom-card-subtle)]/40 opacity-40' : 'hover:bg-pink-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-[var(--bloom-primary)] text-white font-bold'
                          : 'text-[var(--bloom-text)]'
                      }`}
                    >
                      {calDay.day}
                    </span>
                    <div className="flex items-center gap-1">
                      {isToday && <span className="text-[10px] text-pink-500 font-bold hidden sm:inline">Today</span>}
                      <button
                        onClick={() => openQuickAdd('event', calDay.dateStr)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] transition-opacity"
                        title={`Add event on ${calDay.dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items for this day */}
                  <div className="mt-1.5 space-y-1 flex-1 overflow-hidden">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`text-[10px] font-medium px-2 py-1 rounded-lg border truncate cursor-pointer transition-transform hover:scale-102 ${getTypeColor(
                          item.type
                        )}`}
                        title={item.title}
                      >
                        {item.time && <span className="mr-1 opacity-75">{item.time}</span>}
                        <span>{item.title}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <span className="text-[9px] text-[var(--bloom-text-muted)] font-semibold px-1">
                        +{dayItems.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-6 space-y-4">
          <p className="text-xs font-semibold text-[var(--bloom-text-muted)]">
            Week view for late September / early October 2026
          </p>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'].map(
              (dateStr) => {
                const dateObj = new Date(dateStr + 'T12:00:00');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();
                const isToday = dateStr === '2026-09-30';
                const items = calendarItems.filter((i) => i.date === dateStr);

                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 rounded-2xl border flex flex-col min-h-[220px] transition-all ${
                      isToday
                        ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)]/50 shadow-xs'
                        : 'border-[var(--bloom-border)] bg-[var(--bloom-card)]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--bloom-border)]">
                      <span className="text-xs font-bold text-[var(--bloom-text)]">{dayName}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickAdd('event', dateStr);
                          }}
                          title={`Add event on ${dateStr}`}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--bloom-text-muted)] hover:text-white hover:bg-[var(--bloom-primary)] text-xs font-bold transition-all"
                        >
                          +
                        </button>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isToday ? 'bg-[var(--bloom-primary)] text-white' : 'text-[var(--bloom-text-muted)]'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2 flex-1 overflow-y-auto">
                      {items.length === 0 ? (
                        <p className="text-[10px] text-[var(--bloom-text-muted)] italic pt-4 text-center">Free</p>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer hover:shadow-xs transition-all ${getTypeColor(
                              item.type
                            )}`}
                          >
                            <p className="font-bold truncate">{item.title}</p>
                            {item.time && <p className="text-[10px] opacity-80 mt-0.5">{item.time}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--bloom-border)] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--bloom-text)] font-heading">Wednesday, September 30, 2026</h2>
              <p className="text-xs text-[var(--bloom-text-muted)]">Today's Hourly Schedule &amp; Study Sessions</p>
            </div>
            <button
              onClick={() => openQuickAdd('event', '2026-09-30')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] hover:bg-[var(--bloom-primary)] hover:text-white transition-colors"
            >
              + Add to Day
            </button>
          </div>

          <div className="space-y-3">
            {calendarItems
              .filter((i) => i.date === '2026-09-30')
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer hover:scale-101 transition-all ${getTypeColor(
                    item.type
                  )}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70">{item.type}</span>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                    </div>
                    {item.notes && <p className="text-xs opacity-85 mt-1">{item.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block">{item.time || 'All day'}</span>
                    {item.durationMinutes && (
                      <span className="text-[10px] opacity-75">{item.durationMinutes} min</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Item Detail / Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bloom-card)] rounded-3xl shadow-2xl border border-[var(--bloom-border)] p-6 space-y-4 animate-gentle-float">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getTypeColor(selectedItem.type)}`}>
                {selectedItem.type}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading">{selectedItem.title}</h3>
              <p className="text-xs text-[var(--bloom-text-muted)] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {selectedItem.date} {selectedItem.time ? `at ${selectedItem.time}` : ''}
                  {selectedItem.durationMinutes ? ` (${selectedItem.durationMinutes} min)` : ''}
                </span>
              </p>
            </div>

            {selectedItem.notes && (
              <div className="p-3 rounded-2xl bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] border border-[var(--bloom-border)]">
                {selectedItem.notes}
              </div>
            )}

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => {
                  deleteCalendarItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--bloom-primary)] hover:bg-[var(--bloom-primary-hover)] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
