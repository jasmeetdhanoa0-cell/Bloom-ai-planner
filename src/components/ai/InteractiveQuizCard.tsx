import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ChevronLeft, ChevronRight, Award, BookmarkCheck, Eye } from 'lucide-react';
import { InteractiveQuiz, QuizQuestion } from '../../types';
import { useBloom } from '../../context/BloomContext';

interface InteractiveQuizCardProps {
  quiz: InteractiveQuiz;
  onSaveToStudyDecks?: (quiz: InteractiveQuiz) => void;
}

export const InteractiveQuizCard: React.FC<InteractiveQuizCardProps> = ({
  quiz,
  onSaveToStudyDecks,
}) => {
  const { gainPetXP, triggerCelebration, playChime } = useBloom();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const questions = quiz.questions || [];
  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));

    const question = questions[qIdx];
    const isCorrect = question.correctIndex === optIdx;
    if (isCorrect) {
      playChime('tap');
      gainPetXP(10, 'Correct quiz answer');
    }
  };

  const handleRevealSingle = (qIdx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [qIdx]: true }));
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = Object.entries(selectedAnswers).filter(([qIdx, optIdx]) => {
    const q = questions[Number(qIdx)];
    return q && q.correctIndex === optIdx;
  }).length;

  const isCompleted = totalAnswered === questions.length && questions.length > 0;

  const handleSave = () => {
    if (onSaveToStudyDecks) {
      onSaveToStudyDecks(quiz);
      setIsSaved(true);
      triggerCelebration();
    }
  };

  return (
    <div className="w-full mt-3 p-4 rounded-3xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] shadow-xs space-y-3.5 text-left">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--bloom-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--bloom-text)]">
              {quiz.title || 'Interactive Practice Quiz'}
            </h4>
            <p className="text-[10px] text-[var(--bloom-text-muted)]">
              {questions.length} Question{questions.length > 1 ? 's' : ''} • Test your understanding
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'all' : 'single')}
            className="px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] hover:border-[var(--bloom-primary)] transition-colors"
          >
            {viewMode === 'single' ? 'View All' : 'One by One'}
          </button>
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] hover:border-[var(--bloom-primary)] flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>{showAnswerKey ? 'Hide Key' : 'Answer Key'}</span>
          </button>
          {onSaveToStudyDecks && (
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              <BookmarkCheck className="w-3 h-3" />
              <span>{isSaved ? 'Saved to Decks' : 'Save to Study'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Score Banner when completed */}
      {isCompleted && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                Quiz Complete! You scored {totalCorrect}/{questions.length}
              </span>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {totalCorrect === questions.length
                  ? 'Perfect score! Excellent conceptual mastery! 🌟'
                  : 'Great effort! Review the explanations below to solidify your understanding.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE QUESTION MODE */}
      {viewMode === 'single' && (
        <div className="space-y-3">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between text-[11px] text-[var(--bloom-text-muted)]">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-1">
              {questions.map((_, idx) => {
                const ans = selectedAnswers[idx];
                const isCorr = ans !== undefined && questions[idx].correctIndex === ans;
                const isWrong = ans !== undefined && questions[idx].correctIndex !== ans;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-5 bg-pink-500'
                        : isCorr
                        ? 'bg-emerald-400'
                        : isWrong
                        ? 'bg-rose-400'
                        : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] space-y-3">
            <p className="text-xs md:text-sm font-semibold text-[var(--bloom-text)] leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === oIdx;
                  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
                  const isCorrect = currentQ.correctIndex === oIdx;

                  let optStyles =
                    'border-[var(--bloom-border)] bg-[var(--bloom-card)] text-[var(--bloom-text)] hover:border-pink-300';
                  if (hasAnswered || showAnswerKey) {
                    if (isCorrect) {
                      optStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-medium';
                    } else if (isSelected) {
                      optStyles = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                    } else {
                      optStyles = 'opacity-60 border-[var(--bloom-border)]';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(currentIndex, oIdx)}
                      disabled={hasAnswered}
                      className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between text-left transition-all ${optStyles}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-[var(--bloom-card-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--bloom-text-muted)] shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {hasAnswered && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Short Answer Reveal */
              <div className="space-y-2">
                {revealedAnswers[currentIndex] || showAnswerKey ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block mb-1">Answer:</span>
                    <p>{currentQ.answer || currentQ.explanation}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRevealSingle(currentIndex)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-100 text-pink-700 hover:bg-pink-200"
                  >
                    Reveal Answer
                  </button>
                )}
              </div>
            )}

            {/* Explanation box */}
            {(selectedAnswers[currentIndex] !== undefined || showAnswerKey) && currentQ.explanation && (
              <div className="p-2.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/60 text-[11px] text-[var(--bloom-text)]">
                <span className="font-bold text-pink-700 dark:text-pink-300 block mb-0.5">
                  Explanation:
                </span>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--bloom-border)] disabled:opacity-30 flex items-center gap-1 hover:bg-[var(--bloom-card-subtle)]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500 text-white disabled:opacity-30 flex items-center gap-1 hover:bg-pink-600"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ALL QUESTIONS MODE */}
      {viewMode === 'all' && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="p-3.5 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-pink-600 shrink-0">
                  Q{qIdx + 1}.
                </span>
                <p className="text-xs font-semibold text-[var(--bloom-text)] flex-1">
                  {q.question}
                </p>
              </div>

              {q.options && q.options.length > 0 && (
                <div className="space-y-1.5 pl-4">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[qIdx] === oIdx;
                    const hasAnswered = selectedAnswers[qIdx] !== undefined;
                    const isCorrect = q.correctIndex === oIdx;

                    let optStyles =
                      'border-[var(--bloom-border)] bg-[var(--bloom-card)] text-[var(--bloom-text)]';
                    if (hasAnswered || showAnswerKey) {
                      if (isCorrect) {
                        optStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-medium';
                      } else if (isSelected) {
                        optStyles = 'border-rose-400 bg-rose-50 text-rose-800';
                      } else {
                        optStyles = 'opacity-60 border-[var(--bloom-border)]';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                        disabled={hasAnswered}
                        className={`w-full p-2 rounded-xl border text-[11px] flex items-center justify-between text-left transition-all ${optStyles}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] text-[var(--bloom-text-muted)]">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        {hasAnswered && isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {(selectedAnswers[qIdx] !== undefined || showAnswerKey) && q.explanation && (
                <div className="p-2 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 text-[10px] text-[var(--bloom-text)]">
                  <span className="font-bold text-pink-700">Explanation:</span> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
