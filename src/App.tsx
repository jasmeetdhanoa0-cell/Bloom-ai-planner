/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BloomProvider, useBloom } from './context/BloomContext';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileNav } from './components/navigation/MobileNav';
import { HomeDashboard } from './components/home/HomeDashboard';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { BloomAIView } from './components/ai/BloomAIView';
import { FocusTimerView } from './components/focus/FocusTimerView';
import { StudyView } from './components/study/StudyView';
import { PetView } from './components/pet/PetView';
import { DiaryView } from './components/diary/DiaryView';
import { DocumentsView } from './components/documents/DocumentsView';
import { ThemesView } from './components/themes/ThemesView';
import { SettingsView } from './components/settings/SettingsView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { OverwhelmedModal } from './components/modals/OverwhelmedModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { Sparkles, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, profile, mood } = useBloom();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'ai':
        return <BloomAIView />;
      case 'focus':
        return <FocusTimerView />;
      case 'study':
        return <StudyView />;
      case 'pet':
        return <PetView />;
      case 'diary':
        return <DiaryView />;
      case 'documents':
        return <DocumentsView />;
      case 'themes':
        return <ThemesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bloom-bg)] text-[var(--bloom-text)] selection:bg-[var(--bloom-primary-soft)] selection:text-[var(--bloom-primary)] relative overflow-x-hidden font-sans">
      {/* Decorative Subtle Background Doodles */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
        <span className="absolute top-12 left-[18%] text-2xl select-none animate-gentle-float">🌸</span>
        <span className="absolute top-44 right-[12%] text-xl select-none animate-gentle-float" style={{ animationDelay: '1s' }}>✨</span>
        <span className="absolute bottom-28 left-[24%] text-xl select-none animate-gentle-float" style={{ animationDelay: '2s' }}>🌷</span>
        <span className="absolute bottom-16 right-[20%] text-2xl select-none animate-gentle-float" style={{ animationDelay: '1.5s' }}>🍵</span>
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top and Bottom Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 px-4 py-6 md:px-8 md:py-8 lg:px-10 overflow-y-auto max-h-screen">
        {renderActiveView()}
      </main>

      {/* Modals */}
      <OnboardingModal />
      <OverwhelmedModal />
      <QuickAddModal />
    </div>
  );
};

export default function App() {
  return (
    <BloomProvider>
      <AppContent />
    </BloomProvider>
  );
}
