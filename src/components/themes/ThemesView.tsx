import React from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { ThemeId } from '../../types';

export const ThemesView: React.FC = () => {
  const { profile, setTheme, triggerCelebration } = useBloom();

  const themes: {
    id: ThemeId;
    name: string;
    icon: string;
    description: string;
    palette: string[];
    bgPreview: string;
  }[] = [
    {
      id: 'soft-pastel',
      name: 'Soft Pastel',
      icon: '🌸',
      description: 'Dreamy blush pink, lavender haze, soft mint, and warm cream notes.',
      palette: ['#F472B6', '#C084FC', '#6EE7B7', '#FCF8F7'],
      bgPreview: 'bg-[#FCF8F7]',
    },
    {
      id: 'coquette',
      name: 'Coquette',
      icon: '🎀',
      description: 'Delicate rose ribbon, lace cream, pearl blush, and vintage romance.',
      palette: ['#FB7185', '#F472B6', '#FBBF24', '#FFF5F7'],
      bgPreview: 'bg-[#FFF5F7]',
    },
    {
      id: 'clean',
      name: 'Clean',
      icon: '🫧',
      description: 'Crisp minimal white, glassmorphism, soft slate, and fresh sky blue.',
      palette: ['#0284C7', '#8B5CF6', '#10B981', '#F8FAFC'],
      bgPreview: 'bg-[#F8FAFC]',
    },
    {
      id: 'dark-academia',
      name: 'Dark Academia',
      icon: '📚',
      description: 'Antique amber, espresso parchment, muted gold, and cozy mahogany paper.',
      palette: ['#D97706', '#EAB308', '#10B981', '#1C1917'],
      bgPreview: 'bg-[#1C1917] text-amber-100',
    },
    {
      id: 'lavender',
      name: 'Lavender',
      icon: '🪻',
      description: 'Misty lilac, royal violet, periwinkle accents, and soothing twilight.',
      palette: ['#9333EA', '#C084FC', '#F472B6', '#FAF5FF'],
      bgPreview: 'bg-[#FAF5FF]',
    },
    {
      id: 'strawberry',
      name: 'Strawberry',
      icon: '🍓',
      description: 'Sweet ripe berry, strawberry milk pink, fresh mint leaf, and sugar cream.',
      palette: ['#E11D48', '#FB7185', '#34D399', '#FFF1F2'],
      bgPreview: 'bg-[#FFF1F2]',
    },
    {
      id: 'cozy',
      name: 'Cozy',
      icon: '☕',
      description: 'Warm oat milk latte, roasted cinnamon, soft brown, and bakery warmth.',
      palette: ['#B45309', '#D97706', '#059669', '#FAF6F0'],
      bgPreview: 'bg-[#FAF6F0]',
    },
    {
      id: 'night',
      name: 'Night',
      icon: '🌙',
      description: 'Midnight star indigo, cosmic violet, gentle lunar glow, and calm shadows.',
      palette: ['#818CF8', '#C084FC', '#FBBF24', '#0B0F19'],
      bgPreview: 'bg-[#0B0F19] text-indigo-100',
    },
  ];

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    triggerCelebration();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>🎨</span>
            <span>Aesthetic Themes</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Choose your personal palette. Every corner of Bloom transforms with zero friction.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] border border-[var(--bloom-primary)]/40 self-start sm:self-auto">
          Active: <strong className="capitalize">{profile.theme}</strong>
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((th) => {
          const isSelected = profile.theme === th.id;
          return (
            <div
              key={th.id}
              onClick={() => handleSelectTheme(th.id)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-[var(--bloom-primary)] ring-2 ring-[var(--bloom-primary)]/30 shadow-md scale-101 bg-[var(--bloom-card)]'
                  : 'border-[var(--bloom-border)] hover:border-[var(--bloom-primary)]/50 hover:shadow-xs bg-[var(--bloom-card)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{th.icon}</span>
                    <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading">{th.name}</h3>
                  </div>

                  {isSelected ? (
                    <span className="p-1 rounded-full bg-[var(--bloom-primary)] text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--bloom-text-muted)] font-medium">Select</span>
                  )}
                </div>

                <p className="text-xs text-[var(--bloom-text-muted)] mt-2 leading-relaxed">{th.description}</p>
              </div>

              {/* Color Swatches */}
              <div className="mt-5 pt-4 border-t border-[var(--bloom-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {th.palette.map((color, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[var(--bloom-primary)] text-white shadow-xs'
                      : 'bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] hover:bg-[var(--bloom-primary-soft)] hover:text-[var(--bloom-primary)]'
                  }`}
                >
                  {isSelected ? 'Applied 🌸' : 'Apply Theme'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
