import React from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  CheckSquare,
  Sparkles,
  Timer,
  BookOpen,
  Heart,
  BookMarked,
  FolderLock,
  Palette,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useBloom, ActiveTab } from '../../context/BloomContext';
import { CutePet } from '../pet/CutePet';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, profile, petState, petInteraction } = useBloom();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'ai', label: 'Bloom AI', icon: <Sparkles className="w-5 h-5 text-pink-400" />, badge: 'AI' },
    { id: 'focus', label: 'Focus', icon: <Timer className="w-5 h-5" /> },
    { id: 'study', label: 'Study', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'pet', label: 'My Pet', icon: <Heart className="w-5 h-5 text-rose-400" /> },
    { id: 'diary', label: 'Diary', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'documents', label: 'Documents', icon: <FolderLock className="w-5 h-5" /> },
    { id: 'themes', label: 'Themes', icon: <Palette className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const xpProgress = profile.petXP % 100;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[var(--bloom-card)] border-r border-[var(--bloom-border)] h-screen sticky top-0 select-none transition-colors duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--bloom-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white shadow-sm text-xl">
            🌷
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--bloom-text)] font-heading">
              BLOOM
            </h1>
            <p className="text-xs text-[var(--bloom-text-muted)] font-medium">Plan • Focus • Grow</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] font-semibold shadow-xs'
                  : 'text-[var(--bloom-text)] hover:bg-[var(--bloom-card-subtle)] hover:text-[var(--bloom-primary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--bloom-primary)]' : 'text-[var(--bloom-text-muted)]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bloom-primary)] text-white">
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 text-[var(--bloom-primary)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini Pet Card at Sidebar Footer */}
      <div className="p-4 border-t border-[var(--bloom-border)]">
        <div
          onClick={() => setActiveTab('pet')}
          className="p-3.5 rounded-2xl bg-[var(--bloom-card-subtle)] hover:bg-[var(--bloom-primary-soft)] transition-colors cursor-pointer border border-[var(--bloom-border)] group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <CutePet type={profile.petType} state={petState} size="sm" interactive={false} />
              <span className="absolute -bottom-1 -right-1 text-xs">✨</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--bloom-text)] truncate">{profile.petName}</span>
                <span className="text-[10px] font-semibold text-[var(--bloom-text-muted)]">Lv.{profile.petLevel}</span>
              </div>
              {/* Pet XP bar */}
              <div className="mt-1.5 w-full bg-[var(--bloom-border)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--bloom-primary)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--bloom-text-muted)]">
                <span>{profile.petType}</span>
                <span>{xpProgress}/100 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
