import React, { useState } from 'react';
import { BookMarked, Calendar as CalendarIcon, Smile, Heart, Image as ImageIcon, Plus, Trash2, Search } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { MoodType } from '../../types';

export const DiaryView: React.FC = () => {
  const { diaryEntries, addDiaryEntry, deleteDiaryEntry, mood: currentMood } = useBloom();

  const [date, setDate] = useState('2026-09-30');
  const [mood, setMood] = useState<MoodType>(currentMood || 'Good');
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['🌸', '✨']);
  const [searchQuery, setSearchQuery] = useState('');

  const availableStickers = ['🌸', '✨', '🐰', '🍵', '☕', '🍓', '🌿', '📖', '🕯️', '🧸', '🍰', '🌧️'];

  const moodList: { value: MoodType; emoji: string }[] = [
    { value: 'Great', emoji: '😊' },
    { value: 'Good', emoji: '🙂' },
    { value: 'Okay', emoji: '😐' },
    { value: 'Tired', emoji: '😴' },
    { value: 'Sleepy', emoji: '🥱' },
    { value: 'Overwhelmed', emoji: '😵💫' },
    { value: 'Stressed', emoji: '😤' },
    { value: 'Motivated', emoji: '🔥' },
    { value: 'Low', emoji: '😔' },
    { value: 'Focused', emoji: '🧠' },
  ];

  const handleToggleSticker = (s: string) => {
    setSelectedStickers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addDiaryEntry({
      date,
      mood,
      text: text.trim(),
      photoUrl: photoUrl.trim() || undefined,
      stickers: selectedStickers,
    });

    setText('');
    setPhotoUrl('');
  };

  const filteredEntries = diaryEntries.filter((entry) =>
    entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.date.includes(searchQuery)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>📔</span>
            <span>Private Diary &amp; Reflections</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Safe, private thoughts, daily gratitude, and cozy reflections.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
          <span>🔒</span>
          <span>Stored privately on this device</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-[var(--bloom-text)] font-heading">
            Today's Cozy Journal Entry
          </h2>

          <form onSubmit={handleSaveEntry} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MoodType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
                >
                  {moodList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.emoji} {m.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                Reflections, moments of peace, or what made you smile today...
              </label>
              <textarea
                rows={6}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write freely... no pressure, no judgment."
                className="w-full p-4 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs md:text-sm text-[var(--bloom-text)] leading-relaxed focus:outline-none resize-none"
              />
            </div>

            {/* Sticker Picker */}
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1.5">
                Add cozy stickers:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableStickers.map((stk) => {
                  const isChosen = selectedStickers.includes(stk);
                  return (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => handleToggleSticker(stk)}
                      className={`text-lg p-2 rounded-xl border transition-all ${
                        isChosen
                          ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] scale-110 shadow-2xs'
                          : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      {stk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Photo Attachment */}
            <div>
              <label className="block text-xs font-semibold text-[var(--bloom-text-muted)] mb-1">
                Optional photo memory
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] cursor-pointer hover:bg-[var(--bloom-card-hover)] transition-all">
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--bloom-primary)]" />
                  <span>{photoUrl ? 'Change photo' : 'Attach a photo...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {photoUrl && (
                  <div className="relative inline-block">
                    <img
                      src={photoUrl}
                      alt="Memory preview"
                      className="w-12 h-12 object-cover rounded-xl border border-[var(--bloom-border)]"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-sm transition-all"
              >
                Save to Diary 🌸
              </button>
            </div>
          </form>
        </div>

        {/* Past Entries Timeline (1 col) */}
        <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Past Entries</h3>
            <span className="text-xs text-[var(--bloom-text-muted)]">{diaryEntries.length} total</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--bloom-text-muted)]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
            />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)]/50 hover:bg-[var(--bloom-card-subtle)] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--bloom-text)]">
                    <span>{entry.date}</span>
                    <span className="text-[10px] text-pink-500">· {entry.mood}</span>
                  </div>
                  <button
                    onClick={() => deleteDiaryEntry(entry.id)}
                    className="text-[var(--bloom-text-muted)] hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[var(--bloom-text)] leading-relaxed line-clamp-4">
                  {entry.text}
                </p>

                {entry.stickers && entry.stickers.length > 0 && (
                  <div className="flex gap-1 text-sm pt-1">
                    {entry.stickers.map((s, idx) => (
                      <span key={idx}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
