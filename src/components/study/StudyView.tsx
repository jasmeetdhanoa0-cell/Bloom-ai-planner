import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Brain,
  Layers,
  HelpCircle,
  Lightbulb,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  CheckCircle2,
  RotateCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { StudyDeck, StudyNote } from '../../types';

export const StudyView: React.FC = () => {
  const {
    studyDecks,
    addStudyDeck,
    studyNotes,
    addStudyNote,
    updateStudyNote,
    toggleFlashcardMastered,
    gainPetXP,
    triggerCelebration,
  } = useBloom();

  const [activeTab, setActiveTab] = useState<'notes' | 'summary' | 'flashcards' | 'quiz' | 'explain' | 'revision'>('notes');

  // Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string>(studyNotes[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Summary state
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Flashcards state
  const [selectedDeckId, setSelectedDeckId] = useState<string>(studyDecks[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState('Cognitive Biases & Memory');
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: 'What is the Availability Heuristic?',
      options: [
        'Judging frequency based on how easily examples come to mind',
        'Believing something because an expert confirmed it',
        'Always choosing the cheapest available option',
        'Forgetting details due to lack of sleep',
      ],
      correctIndex: 0,
      explanation: 'The availability heuristic relies on immediate mental examples that jump to mind easily.',
    },
    {
      question: 'Which method strengthens memory retention the most effectively?',
      options: [
        'Passive re-reading with pastel highlighters',
        'Active recall and spaced repetition',
        'Cramming for 6 hours the night before',
        'Listening to recorded lectures at 2x speed while sleeping',
      ],
      correctIndex: 1,
      explanation: 'Active recall forces your brain to reconstruct memory traces, reinforcing synapses.',
    },
  ]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Explain (Feynman) state
  const [explainConcept, setExplainConcept] = useState('Opportunity Cost');
  const [explainLevel, setExplainLevel] = useState<'simple' | 'school' | 'detailed' | 'exam'>('simple');
  const [explainOutput, setExplainOutput] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);

  // Dynamic Flashcards creation state
  const [newDeckTopic, setNewDeckTopic] = useState('');
  const [deckLoading, setDeckLoading] = useState(false);

  // Revision state
  const [revisionTopic, setRevisionTopic] = useState('Psychology Midterm');
  const [revisionPlan, setRevisionPlan] = useState('');
  const [revisionLoading, setRevisionLoading] = useState(false);

  // Active Deck
  const activeDeck = studyDecks.find((d) => d.id === selectedDeckId) || studyDecks[0];
  const currentCard = activeDeck?.cards[currentCardIndex] || activeDeck?.cards[0];

  // Active Note
  const currentNote = studyNotes.find((n) => n.id === selectedNoteId);

  // Handlers
  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    addStudyNote({
      title: noteTitle.trim(),
      content: noteContent,
      tags: ['Study', 'Personal'],
    });
    setNoteTitle('');
    setNoteContent('');
    setIsCreatingNote(false);
    triggerCelebration();
  };

  const handleGenerateSummary = async () => {
    if (!summaryInput.trim()) return;
    setSummaryLoading(true);
    setSummaryOutput('');
    try {
      const res = await fetch('/api/bloom/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'summary',
          content: summaryInput,
        }),
      });
      const data = await res.json();
      setSummaryOutput(data.text || 'Summary generated.');
      gainPetXP(15, 'Summary created');
    } catch (e) {
      setSummaryOutput('Could not reach Gemini service. Please check your connection.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!explainConcept.trim()) return;
    setExplainLoading(true);
    setExplainOutput('');
    try {
      const res = await fetch('/api/bloom/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'explain',
          topic: explainConcept,
          level: explainLevel,
        }),
      });
      const data = await res.json();
      setExplainOutput(data.text || 'Explanation ready.');
      gainPetXP(15, 'Concept explained simply');
    } catch (e) {
      setExplainOutput('Error generating explanation.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    try {
      const res = await fetch('/api/bloom/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'quiz',
          topic: quizTopic,
        }),
      });
      const data = await res.json();
      if (data.text) {
        const parsed = JSON.parse(data.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuizQuestions(parsed);
          setSelectedAnswers({});
          setQuizSubmitted(false);
          gainPetXP(20, 'Quiz generated');
          triggerCelebration();
        }
      }
    } catch (e) {
      console.warn('Failed to parse dynamic quiz:', e);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!newDeckTopic.trim()) return;
    setDeckLoading(true);
    try {
      const res = await fetch('/api/bloom/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'flashcards',
          topic: newDeckTopic,
        }),
      });
      const data = await res.json();
      if (data.text) {
        const parsed = JSON.parse(data.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const newDeck = addStudyDeck({
            title: newDeckTopic.trim(),
            category: 'Study',
            cards: parsed.map((c: any, idx: number) => ({
              id: `c-${Date.now()}-${idx}`,
              front: c.front || 'Concept',
              back: c.back || 'Explanation',
              mastered: false,
            })),
          });
          setSelectedDeckId(newDeck.id);
          setCurrentCardIndex(0);
          setNewDeckTopic('');
          gainPetXP(25, 'Deck created');
          triggerCelebration();
        }
      }
    } catch (e) {
      console.warn('Failed to generate flashcards:', e);
    } finally {
      setDeckLoading(false);
    }
  };

  const handleGenerateRevision = async () => {
    if (!revisionTopic.trim()) return;
    setRevisionLoading(true);
    setRevisionPlan('');
    try {
      const res = await fetch('/api/bloom/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'revision',
          topic: revisionTopic,
        }),
      });
      const data = await res.json();
      setRevisionPlan(data.text || 'Revision plan ready.');
      gainPetXP(20, 'Revision plan mapped');
    } catch (e) {
      setRevisionPlan('Error generating revision schedule.');
    } finally {
      setRevisionLoading(false);
    }
  };

  const studyTabs: { id: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'summary', label: 'Summary', icon: <Brain className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'explain', label: 'Explain (ELIF)', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'revision', label: 'Revision Plan', icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-gentle-float">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
            <span>📚</span>
            <span>Study Sanctuary</span>
          </h1>
          <p className="text-xs text-[var(--bloom-text-muted)] mt-1">
            Active recall, cozy notes, flashcards, and concept explanations powered by Bloom AI.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[var(--bloom-card-subtle)] rounded-2xl border border-[var(--bloom-border)] overflow-x-auto">
        {studyTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--bloom-card)] text-[var(--bloom-primary)] shadow-xs'
                : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes Sidebar List */}
          <div className="bg-[var(--bloom-card)] p-4 rounded-3xl border border-[var(--bloom-border)] space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[var(--bloom-text)] font-heading">My Notes</span>
              <button
                onClick={() => setIsCreatingNote(true)}
                className="p-1.5 rounded-xl bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] hover:bg-[var(--bloom-primary)] hover:text-white transition-colors"
                title="New Note"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {studyNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsCreatingNote(false);
                  }}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedNoteId === note.id && !isCreatingNote
                      ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] shadow-xs'
                      : 'border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)]/40 hover:bg-[var(--bloom-card-subtle)]'
                  }`}
                >
                  <p className="text-xs font-bold text-[var(--bloom-text)] truncate">{note.title}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--bloom-text-muted)]">
                    <span>{note.tags.join(' · ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Editor / Viewer (2 cols) */}
          <div className="md:col-span-2 bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] shadow-xs min-h-[400px]">
            {isCreatingNote ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">Create New Note</h3>
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-sm font-bold text-[var(--bloom-text)] focus:outline-none"
                />
                <textarea
                  rows={10}
                  placeholder="Write your notes here in markdown or plain text..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] leading-relaxed focus:outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingNote(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--bloom-text-muted)] hover:bg-[var(--bloom-card-subtle)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-sm"
                  >
                    Save Note 🌸
                  </button>
                </div>
              </div>
            ) : currentNote ? (
              <div className="space-y-4">
                <div className="border-b border-[var(--bloom-border)] pb-3">
                  <h2 className="text-lg font-bold text-[var(--bloom-text)] font-heading">{currentNote.title}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--bloom-text-muted)]">
                    <span>{currentNote.tags.join(' · ')}</span>
                    <span>·</span>
                    <span>Updated {currentNote.updatedAt.split('T')[0]}</span>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-xs text-[var(--bloom-text)] leading-relaxed whitespace-pre-line">
                  {currentNote.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-[var(--bloom-text-muted)]">
                Select a note on the left or create a new one!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SUMMARY TAB */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">
              Paste Text / Chapter / Lecture Notes
            </h3>
            <textarea
              rows={12}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Paste notes, textbook paragraphs, or articles here to extract high-yield insights..."
              className="w-full p-4 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] leading-relaxed focus:outline-none resize-none"
            />
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading || !summaryInput.trim()}
              className="w-full py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{summaryLoading ? 'Summarizing with Bloom AI...' : 'Generate Cozy Summary'}</span>
            </button>
          </div>

          <div className="bg-[var(--bloom-card)] p-6 rounded-3xl border border-[var(--bloom-border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--bloom-text)] font-heading">AI Bullet Summary</h3>
            {summaryOutput ? (
              <div className="p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs text-[var(--bloom-text)] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[380px]">
                {summaryOutput}
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-[var(--bloom-text-muted)] italic">
                Your concise, structured bullet summary will appear here ✨
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* AI Deck Generator Banner */}
          <div className="p-4 rounded-2xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <span className="text-[10px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider block mb-1">
                Generate Deck on Any Academic Topic
              </span>
              <input
                type="text"
                value={newDeckTopic}
                onChange={(e) => setNewDeckTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateFlashcards()}
                placeholder="e.g. Photosynthesis, Cellular Respiration, Newton's Laws, French Revolution..."
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] focus:outline-none"
              />
            </div>
            <button
              onClick={handleGenerateFlashcards}
              disabled={deckLoading || !newDeckTopic.trim()}
              className="w-full sm:w-auto px-4 py-2 mt-4 sm:mt-0 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{deckLoading ? 'Creating...' : 'Generate Deck'}</span>
            </button>
          </div>

          {/* Deck selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--bloom-text-muted)]">Select Deck:</span>
            <div className="flex flex-wrap gap-2">
              {studyDecks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedDeckId === deck.id
                      ? 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)]'
                      : 'border-[var(--bloom-border)] bg-[var(--bloom-card)] text-[var(--bloom-text-muted)]'
                  }`}
                >
                  {deck.title} ({deck.cards.length})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flip Card */}
          {currentCard ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-lg h-72 rounded-3xl p-8 bg-[var(--bloom-card)] border-2 border-[var(--bloom-border)] shadow-md hover:border-[var(--bloom-primary)]/70 transition-all cursor-pointer flex flex-col justify-between text-center select-none"
              >
                <div className="flex items-center justify-between text-xs text-[var(--bloom-text-muted)]">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Card {currentCardIndex + 1} of {activeDeck.cards.length}
                  </span>
                  <span className="text-[10px] text-[var(--bloom-primary)] font-bold">
                    {isFlipped ? 'Answer Side 💡' : 'Question Side ❓ (Click to Flip)'}
                  </span>
                </div>

                <div className="my-auto px-4">
                  <p className="text-base md:text-lg font-bold text-[var(--bloom-text)] leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                <div className="text-[11px] text-[var(--bloom-text-muted)]">
                  {currentCard.mastered ? (
                    <span className="text-emerald-500 font-bold">✓ Mastered</span>
                  ) : (
                    <span>Review in progress</span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((i) => i - 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--bloom-border)] text-xs font-semibold disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() => toggleFlashcardMastered(activeDeck.id, currentCard.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    currentCard.mastered
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100'
                  }`}
                >
                  {currentCard.mastered ? 'Mastered 🎉' : 'Mark Mastered +10 XP'}
                </button>

                <button
                  disabled={currentCardIndex === activeDeck.cards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((i) => i + 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--bloom-border)] text-xs font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-[var(--bloom-text-muted)]">No cards in this deck.</p>
          )}
        </div>
      )}

      {/* 4. QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="bg-[var(--bloom-card)] p-6 md:p-8 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-6">
          {/* AI Quiz Generator Banner */}
          <div className="p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <span className="text-[10px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider block mb-1">
                Generate Interactive Quiz on Any Topic
              </span>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateQuiz()}
                placeholder="e.g. Photosynthesis, Newton's Laws, World War II, Calculus..."
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] text-xs text-[var(--bloom-text)] focus:outline-none"
              />
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={quizLoading || !quizTopic.trim()}
              className="w-full sm:w-auto px-4 py-2 mt-4 sm:mt-0 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{quizLoading ? 'Generating...' : 'Generate AI Quiz'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--bloom-border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading">Interactive Knowledge Check</h3>
              <p className="text-xs text-[var(--bloom-text-muted)]">Active Topic: {quizTopic}</p>
            </div>

            <button
              onClick={() => {
                setSelectedAnswers({});
                setQuizSubmitted(false);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[var(--bloom-border)] text-xs font-semibold text-[var(--bloom-text-muted)] hover:text-[var(--bloom-text)] self-start sm:self-auto"
            >
              Reset Quiz
            </button>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              return (
                <div key={qIdx} className="p-4 rounded-2xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] space-y-3">
                  <p className="text-xs md:text-sm font-bold text-[var(--bloom-text)]">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let btnStyle = 'border-[var(--bloom-border)] bg-[var(--bloom-card)] text-[var(--bloom-text)]';

                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold';
                        } else if (isChosen && optIdx !== q.correctIndex) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 line-through';
                        }
                      } else if (isChosen) {
                        btnStyle = 'border-[var(--bloom-primary)] bg-[var(--bloom-primary-soft)] text-[var(--bloom-primary)] font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            if (!quizSubmitted) {
                              setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
                            }
                          }}
                          className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200 italic">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}

            {!quizSubmitted ? (
              <button
                onClick={() => {
                  setQuizSubmitted(true);
                  gainPetXP(25, 'Quiz completed');
                  triggerCelebration();
                }}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 shadow-sm"
              >
                Submit Answers & Check Score 🎉
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-pink-50 text-center text-xs font-bold text-pink-700">
                Quiz completed! Great practice for long-term retention ✨
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. EXPLAIN TAB (Feynman & Levels) */}
      {activeTab === 'explain' && (
        <div className="bg-[var(--bloom-card)] p-6 md:p-8 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Feynman Concept Explainer</span>
            </h3>
            <p className="text-xs text-[var(--bloom-text-muted)]">
              "If you can't explain it simply, you don't understand it well enough." Enter any complex formula, theorem, or doubt!
            </p>
          </div>

          {/* Explanation Level Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--bloom-text-muted)] uppercase">Level:</span>
            {[
              { id: 'simple', label: '🌱 Super Simple (ELIF 10)' },
              { id: 'school', label: '📚 School Level (Class 10)' },
              { id: 'detailed', label: '🧠 Detailed Deep Dive' },
              { id: 'exam', label: '🎯 Exam Ready (Scoring)' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setExplainLevel(lvl.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  explainLevel === lvl.id
                    ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                    : 'bg-[var(--bloom-card)] border-[var(--bloom-border)] text-[var(--bloom-text-muted)] hover:border-pink-300'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={explainConcept}
              onChange={(e) => setExplainConcept(e.target.value)}
              placeholder="e.g. Photosynthesis, Bayes Theorem, Krebs Cycle, Keynesian Multiplier..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] font-semibold focus:outline-none"
            />
            <button
              onClick={handleGenerateExplanation}
              disabled={explainLoading || !explainConcept.trim()}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{explainLoading ? 'Explaining...' : 'Explain'}</span>
            </button>
          </div>

          {explainOutput && (
            <div className="p-5 rounded-3xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs text-[var(--bloom-text)] leading-relaxed whitespace-pre-line animate-gentle-float">
              {explainOutput}
            </div>
          )}
        </div>
      )}

      {/* 6. REVISION PLAN TAB */}
      {activeTab === 'revision' && (
        <div className="bg-[var(--bloom-card)] p-6 md:p-8 rounded-3xl border border-[var(--bloom-border)] shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--bloom-text)] font-heading flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <span>Spaced Repetition &amp; Exam Countdown</span>
            </h3>
            <p className="text-xs text-[var(--bloom-text-muted)]">
              Generate a balanced 5-day study plan that avoids cramming and builds confident mastery.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={revisionTopic}
              onChange={(e) => setRevisionTopic(e.target.value)}
              placeholder="e.g. Biology Midterm, Final Macroeconomics Exam..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs text-[var(--bloom-text)] font-semibold focus:outline-none"
            />
            <button
              onClick={handleGenerateRevision}
              disabled={revisionLoading || !revisionTopic.trim()}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{revisionLoading ? 'Planning...' : 'Generate Plan'}</span>
            </button>
          </div>

          {revisionPlan ? (
            <div className="p-5 rounded-3xl bg-[var(--bloom-card-subtle)] border border-[var(--bloom-border)] text-xs text-[var(--bloom-text)] leading-relaxed whitespace-pre-line animate-gentle-float">
              {revisionPlan}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--bloom-text-muted)] italic">
              Enter your exam or project topic above to map out a calm revision strategy!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
