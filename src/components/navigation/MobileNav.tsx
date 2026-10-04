import React, { useState } from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Heart,
  Menu,
  X,
  CheckSquare,
  Timer,
  BookOpen,
  BookMarked,
  FolderLock,
  Palette,
  Settings,
} from 'lucide-react';
import { useBloom, ActiveTab } from '../../context/BloomContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, profile } = useBloom();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'ai', label: 'AI', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'pet', label: 'Pet', icon: <Heart className="w-5 h-5" /> },
  ];

  const drawerItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'focus', label: 'Focus Timer', icon: <Timer className="w-5 h-5" /> },
    { id: 'study', label: 'Study Mode', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'diary', label: 'Diary & Journal', icon: <BookMarked className="w-5 h-5" /> },
    { id: 'documents', label: 'Documents', icon: <FolderLock className="w-5 h-5" /> },
    { id: 'themes', label: 'Themes', icon: <Palette className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bloom-card)] border-b border-[var(--bloom-border)] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-300 flex items-center justify-center text-white text-base shadow-xs">
            🌷
          </div>
          <div>
            <span className="text-base font-bold text-[var(--bloom-text)] font-heading">BLOOM</span>
            <span className="text-[10px] text-[var(--bloom-text-muted)] ml-2">Plan • Focus • Grow</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-xl text-[var(--bloom-text)] hover:bg-[var(--bloom-card-subtle)] active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-out Menu Drawer for other pages */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[var(--bloom-card)] shadow-2xl p-6 flex flex-col z-50">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--bloom-border)]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌷</span>
                <span className="font-bold text-[var(--bloom-text)] font-heading">Bloom Menu</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--bloom-card-subtle)] text-[var(--bloom-text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {drawerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] font-semibold'
                      : 'text-[var(--bloom-text)] hover:bg-[var(--bloom-card-subtle)]'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-[var(--bloom-primary)]' : 'text-[var(--bloom-text-muted)]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--bloom-border)] text-xs text-[var(--bloom-text-muted)] text-center">
              Active Theme: <span className="capitalize font-semibold text-[var(--bloom-primary)]">{profile.theme}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bloom-card)] border-t border-[var(--bloom-border)] px-3 py-2 flex items-center justify-around shadow-lg">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'home' ? 'text-[var(--bloom-primary)] font-bold' : 'text-[var(--bloom-text-muted)]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'calendar' ? 'text-[var(--bloom-primary)] font-bold' : 'text-[var(--bloom-text-muted)]'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px]">Calendar</span>
        </button>

        {/* Centered Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label="Add new task or event"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* AI */}
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'ai' ? 'text-[var(--bloom-primary)] font-bold' : 'text-[var(--bloom-text-muted)]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">AI</span>
        </button>

        {/* Pet */}
        <button
          onClick={() => setActiveTab('pet')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'pet' ? 'text-[var(--bloom-primary)] font-bold' : 'text-[var(--bloom-text-muted)]'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">Pet</span>
        </button>
      </nav>
    </>
  );
};
