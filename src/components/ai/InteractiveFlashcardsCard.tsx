import React, { useState } from 'react';
import { Layers, ChevronLeft, ChevronRight, RotateCw, BookmarkCheck, Sparkles, Check } from 'lucide-react';
import { Flashcard } from '../../types';
import { useBloom } from '../../context/BloomContext';

interface InteractiveFlashcardsCardProps {
  cards: Array<{ front: string; back: string }>;
  topic?: string;
  onSaveToStudyDecks?: (cards: Array<{ front: string; back: string }>, topic?: string) => void;
}

export const InteractiveFlashcardsCard: React.FC<InteractiveFlashcardsCardProps> = ({
  cards,
  topic = 'Study Flashcards',
  onSaveToStudyDecks,
}) => {
  const { gainPetXP, triggerCelebration } = useBloom();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards((prev) => {
      const next = !prev[idx];
      if (next) gainPetXP(10, 'Card mastered');
      return { ...prev, [idx]: next };
    });
  };

  const handleSave = () => {
    if (onSaveToStudyDecks) {
      onSaveToStudyDecks(cards, topic);
      setIsSaved(true);
      triggerCelebration();
    }
  };

  return (
    <div className="w-full mt-3 p-4 rounded-3xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] shadow-xs space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--bloom-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--bloom-text)]">
              {topic}
            </h4>
            <p className="text-[10px] text-[var(--bloom-text-muted)]">
              Card {currentIndex + 1} of {cards.length} • Tap card to flip
            </p>
          </div>
        </div>

        {onSaveToStudyDecks && (
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors ${
              isSaved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <BookmarkCheck className="w-3 h-3" />
            <span>{isSaved ? 'Saved to Decks' : 'Save to Study'}</span>
          </button>
        )}
      </div>

      {/* 3D Interactive Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[140px] md:min-h-[160px] p-5 rounded-2xl cursor-pointer border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-white dark:from-purple-950/20 dark:to-stone-900 flex flex-col justify-between items-center text-center transition-all hover:shadow-xs active:scale-[0.99] select-none"
      >
        <div className="w-full flex items-center justify-between text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
          <span>{isFlipped ? 'Answer / Definition' : 'Question / Term'}</span>
          <span className="flex items-center gap-1 text-[9px] lowercase bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
            <RotateCw className="w-2.5 h-2.5" /> tap to flip
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="text-sm md:text-base font-bold text-[var(--bloom-text)] leading-relaxed">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <div className="w-full flex items-center justify-between text-[10px] text-[var(--bloom-text-muted)] pt-2 border-t border-purple-100/80 dark:border-purple-900/40">
          <span>
            {masteredCards[currentIndex] ? '⭐ Mastered' : '🌱 Learning'}
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-300">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Navigation & Mastery Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--bloom-border)] disabled:opacity-30 flex items-center gap-1 hover:bg-[var(--bloom-card-subtle)]"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => toggleMastered(currentIndex)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
            masteredCards[currentIndex]
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:border-emerald-300 hover:text-emerald-600'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{masteredCards[currentIndex] ? 'Mastered!' : 'Mark Mastered'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500 text-white disabled:opacity-30 flex items-center gap-1 hover:bg-purple-600"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
