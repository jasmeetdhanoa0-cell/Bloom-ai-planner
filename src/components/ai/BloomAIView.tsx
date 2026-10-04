import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Check,
  Plus,
  RefreshCw,
  X,
  CheckCircle2,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  AlertCircle,
  GraduationCap,
  Lightbulb,
  HelpCircle,
  Camera,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useBloom } from '../../context/BloomContext';
import { ChatMessage, SuggestedAction, ExplanationLevel, HomeworkHelpMode, InteractiveQuiz } from '../../types';
import { CutePet } from '../pet/CutePet';
import { InteractiveQuizCard } from './InteractiveQuizCard';
import { InteractiveFlashcardsCard } from './InteractiveFlashcardsCard';

export const BloomAIView: React.FC = () => {
  const {
    profile,
    mood,
    energy,
    availableTime,
    tasks,
    addTask,
    addCalendarItem,
    addStudyDeck,
    gainPetXP,
    triggerCelebration,
    playChime,
  } = useBloom();

  // Load preferred explanation level from localStorage if available
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(() => {
    return (localStorage.getItem('bloom_tutor_explanation_level') as ExplanationLevel) || 'school';
  });

  const [homeworkMode, setHomeworkMode] = useState<HomeworkHelpMode | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bloom',
      text: `Hello ${profile.name}! 🌷 I'm Bloom AI, your personal student doubt-solving tutor and study companion.\n\nI can help you understand any concept across Science, Math, History, Literature, and more. Upload or snap photos of tricky problems, choose how simply you want things explained, request interactive quizzes and flashcards, or let me design your exam study plan.\n\nHow can I help you learn today? ✨`,
      timestamp: '10:00 AM',
      petNote: `${profile.petName} is sitting close by ready to learn with you! 🐾`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);

  // Editable suggestion state: tracks msgId currently being edited
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editableTasks, setEditableTasks] = useState<{ [msgId: string]: SuggestedAction[] }>({});
  const [editableEvents, setEditableEvents] = useState<{ [msgId: string]: SuggestedAction[] }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleLevelChange = (lvl: ExplanationLevel) => {
    setExplanationLevel(lvl);
    localStorage.setItem('bloom_tutor_explanation_level', lvl);
    setShowLevelDropdown(false);
    playChime('tap');
  };

  // Voice dictation using Web Speech API if supported
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        setInput((prev) => (prev ? prev + ' ' : '') + 'What is photosynthesis?');
        setIsRecording(false);
      }, 1200);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Image attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Document attachment
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedDocName(file.name);
    }
  };

  const handleSend = async (customPrompt?: string, overrideHomeworkMode?: HomeworkHelpMode) => {
    const activeHwMode = overrideHomeworkMode !== undefined ? overrideHomeworkMode : homeworkMode;
    const textToSend = customPrompt !== undefined ? customPrompt : input.trim();
    if (!textToSend && !attachedImage && !attachedDocName) return;

    let userLabel = textToSend;
    if (!userLabel && attachedImage) {
      userLabel = activeHwMode
        ? `Please solve this question in ${activeHwMode.toUpperCase()} mode`
        : 'Please solve and explain this question';
    } else if (!userLabel && attachedDocName) {
      userLabel = `Please review and help me study ${attachedDocName}`;
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageAttachment: attachedImage || undefined,
      attachedDocName: attachedDocName || undefined,
      explanationLevel,
      homeworkMode: activeHwMode || undefined,
    };

    // Save previous conversation history (excluding initial greeting or errors)
    const priorHistory = messages
      .filter((m) => !m.isError && m.id !== 'm-1')
      .slice(-12)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const tempImage = attachedImage;
    const tempDoc = attachedDocName;
    setAttachedImage(null);
    setAttachedDocName(null);
    setLoading(true);

    try {
      const res = await fetch('/api/bloom/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend + (tempDoc ? ` [Document attached: ${tempDoc}]` : ''),
          history: priorHistory,
          image: tempImage || undefined,
          explanationLevel,
          homeworkMode: activeHwMode,
          context: {
            mood,
            energy,
            availableTime,
            modes: profile.modes,
            petType: profile.petType,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'bloom',
          text: data.error || data.reply || "Bloom AI couldn't connect right now. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const msgId = `blm-${Date.now()}`;
      const hasSuggestions =
        (Array.isArray(data.suggestedTasks) && data.suggestedTasks.length > 0) ||
        (Array.isArray(data.suggestedEvents) && data.suggestedEvents.length > 0);

      const bloomMessage: ChatMessage = {
        id: msgId,
        sender: 'bloom',
        text: data.reply || "Here is what I found for you! ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSummary: data.actionSummary,
        suggestedTasks: data.suggestedTasks || [],
        suggestedEvents: data.suggestedEvents || [],
        petNote: data.petNote,
        isPendingConfirmation: hasSuggestions,
        actionsConfirmed: false,
        actionsDismissed: false,
        interactiveQuiz: data.interactiveQuiz || undefined,
        interactiveFlashcards: data.interactiveFlashcards || undefined,
        explanationLevel,
        homeworkMode: activeHwMode || undefined,
      };

      if (hasSuggestions) {
        setEditableTasks((prev) => ({ ...prev, [msgId]: data.suggestedTasks || [] }));
        setEditableEvents((prev) => ({ ...prev, [msgId]: data.suggestedEvents || [] }));
      }

      setMessages((prev) => [...prev, bloomMessage]);
      playChime('tap');
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bloom',
        text: "Bloom AI couldn't connect right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Save Quiz to Bloom Study Decks
  const handleSaveQuizToStudy = (quiz: InteractiveQuiz) => {
    const cards = (quiz.questions || []).map((q, idx) => ({
      id: `q-card-${Date.now()}-${idx}`,
      front: q.question,
      back:
        q.options && q.correctIndex !== undefined
          ? `Correct: ${q.options[q.correctIndex]}\n\nExplanation: ${q.explanation || ''}`
          : q.answer || q.explanation || 'See study notes',
      mastered: false,
    }));

    addStudyDeck({
      title: quiz.title || 'Practice Quiz Deck',
      category: 'Study',
      cards,
    });
    triggerCelebration();
  };

  // Save Flashcards to Bloom Study Decks
  const handleSaveFlashcardsToStudy = (
    cards: Array<{ front: string; back: string }>,
    topic?: string
  ) => {
    addStudyDeck({
      title: topic || 'Flashcards Deck',
      category: 'Study',
      cards: cards.map((c, idx) => ({
        id: `fc-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        mastered: false,
      })),
    });
    triggerCelebration();
  };

  // User decides: Accept single AI suggested task
  const handleAcceptSingleTask = (msgId: string, taskItem: SuggestedAction) => {
    addTask({
      title: taskItem.title,
      completed: false,
      date: taskItem.date || '2026-09-30',
      duration: taskItem.duration || '25m',
      priority: taskItem.priority || 'medium',
      category: taskItem.category || 'Study',
      notes: 'Added from Bloom AI suggestions ✨',
    });
    triggerCelebration();
    gainPetXP(15, 'Task confirmed from AI');

    setEditableTasks((prev) => {
      const current = prev[msgId] || [];
      const updated = current.filter((t) => t !== taskItem);
      return { ...prev, [msgId]: updated };
    });

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentTasks = editableTasks[msgId] || m.suggestedTasks || [];
        const remainingTasks = currentTasks.filter((t) => t !== taskItem);
        const currentEvents = editableEvents[msgId] || m.suggestedEvents || [];
        const isAllDone = remainingTasks.length === 0 && currentEvents.length === 0;
        return {
          ...m,
          suggestedTasks: remainingTasks,
          actionsConfirmed: isAllDone,
          isPendingConfirmation: !isAllDone,
        };
      })
    );
  };

  // User decides: Accept single AI suggested calendar event
  const handleAcceptSingleEvent = (msgId: string, eventItem: SuggestedAction) => {
    addCalendarItem({
      title: eventItem.title,
      type: eventItem.type || 'Study session',
      date: eventItem.date || '2026-09-30',
      time: eventItem.time || '15:00',
      durationMinutes: 45,
      notes: 'Scheduled by Bloom AI recommendation',
    });
    triggerCelebration();
    gainPetXP(15, 'Calendar event confirmed');

    setEditableEvents((prev) => {
      const current = prev[msgId] || [];
      const updated = current.filter((e) => e !== eventItem);
      return { ...prev, [msgId]: updated };
    });

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentTasks = editableTasks[msgId] || m.suggestedTasks || [];
        const currentEvents = editableEvents[msgId] || m.suggestedEvents || [];
        const remainingEvents = currentEvents.filter((e) => e !== eventItem);
        const isAllDone = currentTasks.length === 0 && remainingEvents.length === 0;
        return {
          ...m,
          suggestedEvents: remainingEvents,
          actionsConfirmed: isAllDone,
          isPendingConfirmation: !isAllDone,
        };
      })
    );
  };

  // Accept ALL suggested tasks & events for a message
  const handleAcceptAll = (msgId: string) => {
    const tasksToAdd = editableTasks[msgId] || [];
    const eventsToAdd = editableEvents[msgId] || [];

    tasksToAdd.forEach((st) => {
      addTask({
        title: st.title,
        completed: false,
        date: st.date || '2026-09-30',
        duration: st.duration || '25m',
        priority: st.priority || 'medium',
        category: st.category || 'Study',
        notes: 'Added from Bloom AI suggestions ✨',
      });
    });

    eventsToAdd.forEach((se) => {
      addCalendarItem({
        title: se.title,
        type: se.type || 'Study session',
        date: se.date || '2026-09-30',
        time: se.time || '15:00',
        durationMinutes: 45,
        notes: 'Scheduled by Bloom AI recommendation',
      });
    });

    triggerCelebration();
    gainPetXP(25, 'All suggestions added');

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              actionsConfirmed: true,
              isPendingConfirmation: false,
              suggestedTasks: [],
              suggestedEvents: [],
            }
          : m
      )
    );
    setEditingMsgId(null);
  };

  // Cancel / Dismiss suggestions with zero data modification
  const handleDismissActions = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              actionsDismissed: true,
              isPendingConfirmation: false,
            }
          : m
      )
    );
    setEditingMsgId(null);
  };

  const levelLabels: Record<ExplanationLevel, { icon: string; label: string; desc: string }> = {
    simple: { icon: '🌱', label: 'Super Simple', desc: 'Analogies like I’m 10' },
    school: { icon: '📚', label: 'School Level', desc: 'Class 10 / High School syllabus' },
    detailed: { icon: '🧠', label: 'Detailed', desc: 'Deep dive & mechanisms' },
    exam: { icon: '🎯', label: 'Exam Ready', desc: 'Structured points & keywords' },
  };

  const hwModes: Array<{ id: HomeworkHelpMode; label: string; icon: string; desc: string }> = [
    { id: 'teach', label: 'Teach Me', icon: '🧑‍🏫', desc: 'Explain concept without spoiling answer' },
    { id: 'hint', label: 'Give Me a Hint', icon: '💡', desc: 'Useful hint to solve independently' },
    { id: 'solve', label: 'Solve With Me', icon: '🤝', desc: 'Step-by-step interactive guidance' },
    { id: 'solution', label: 'Show Solution', icon: '✅', desc: 'Full solution with reasoning' },
  ];

  const samplePrompts = [
    'What is photosynthesis?',
    "Explain photosynthesis like I'm 10",
    'Give me 5 quiz questions about photosynthesis',
    'What is motion?',
    "Explain Newton's second law with an example",
    'What is 2+2?',
    'I have a test next Friday. Make me a study plan.',
    "I'm overwhelmed by my homework.",
    'Tell me a joke.',
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-[var(--bloom-card)] rounded-3xl border border-[var(--bloom-border)] shadow-xs overflow-hidden pb-3">
      {/* Assistant Header */}
      <div className="p-3 md:px-6 md:py-3 border-b border-[var(--bloom-border)] flex items-center justify-between bg-[var(--bloom-card-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-purple-300 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--bloom-text)]">Bloom AI Tutor</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Connected
              </span>
            </div>
            <p className="text-[11px] text-[var(--bloom-text-muted)]">
              Student Doubt-Solving Assistant • All Academic Subjects
            </p>
          </div>
        </div>

        {/* Level Selector & Pet Status */}
        <div className="flex items-center gap-2">
          {/* Explanation Level Pill */}
          <div className="relative">
            <button
              onClick={() => setShowLevelDropdown(!showLevelDropdown)}
              className="px-2.5 py-1.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] hover:border-[var(--bloom-primary)] flex items-center gap-1.5 text-xs text-[var(--bloom-text)] transition-colors shadow-2xs"
              title="Change Explanation Level"
            >
              <span>{levelLabels[explanationLevel].icon}</span>
              <span className="font-semibold hidden sm:inline">{levelLabels[explanationLevel].label}</span>
              <ChevronDown className="w-3 h-3 text-[var(--bloom-text-muted)]" />
            </button>

            {showLevelDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bloom-card)] border border-[var(--bloom-border)] shadow-lg p-1.5 z-50 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--bloom-text-muted)] uppercase tracking-wider">
                  Explanation Level
                </div>
                {(['simple', 'school', 'detailed', 'exam'] as ExplanationLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelChange(lvl)}
                    className={`w-full p-2 rounded-xl text-left text-xs flex items-center gap-2 transition-colors ${
                      explanationLevel === lvl
                        ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold'
                        : 'hover:bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)]'
                    }`}
                  >
                    <span className="text-sm">{levelLabels[lvl].icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="leading-tight">{levelLabels[lvl].label}</div>
                      <div className="text-[9px] text-[var(--bloom-text-muted)] truncate">{levelLabels[lvl].desc}</div>
                    </div>
                    {explanationLevel === lvl && <Check className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pet Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card)]">
            <CutePet type={profile.petType} state="studying" size="sm" />
            <div className="text-left">
              <div className="text-[11px] font-bold text-[var(--bloom-text)]">{profile.petName}</div>
              <div className="text-[9px] text-[var(--bloom-text-muted)]">Lvl {profile.petLevel} • Tutor Mode</div>
            </div>
          </div>
        </div>
      </div>

      {/* Homework Help Mode Quick Selector Bar */}
      <div className="px-4 py-2 border-b border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)]/70 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold text-[var(--bloom-text-muted)] uppercase shrink-0 mr-1">
          Homework Mode:
        </span>
        <button
          onClick={() => {
            setHomeworkMode(null);
            playChime('tap');
          }}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all shrink-0 ${
            homeworkMode === null
              ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
              : 'bg-[var(--bloom-card)] border-[var(--bloom-border)] text-[var(--bloom-text)] hover:border-pink-300'
          }`}
        >
          General Q&A
        </button>
        {hwModes.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setHomeworkMode(homeworkMode === m.id ? null : m.id);
              playChime('tap');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all shrink-0 flex items-center gap-1 ${
              homeworkMode === m.id
                ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                : 'bg-[var(--bloom-card)] border-[var(--bloom-border)] text-[var(--bloom-text)] hover:border-pink-300'
            }`}
            title={m.desc}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const currentTasks = editableTasks[msg.id] || msg.suggestedTasks || [];
          const currentEvents = editableEvents[msg.id] || msg.suggestedEvents || [];
          const hasSuggestions = currentTasks.length > 0 || currentEvents.length > 0;
          const isEditing = editingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[90%] md:max-w-[85%] p-4 rounded-3xl text-xs md:text-sm leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-br-xs shadow-xs'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-xs shadow-xs'
                    : 'bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] rounded-bl-xs border border-[var(--bloom-border)] shadow-xs'
                }`}
              >
                {msg.isError && (
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Connection Notice</span>
                  </div>
                )}

                {/* Attached question image preview in chat */}
                {msg.imageAttachment && (
                  <div className="mb-2.5">
                    <img
                      src={msg.imageAttachment}
                      alt="Question"
                      className="max-h-60 rounded-2xl border border-white/40 shadow-xs object-contain"
                    />
                    <span className="text-[10px] opacity-80 mt-1 block">📷 Question photo attached</span>
                  </div>
                )}

                {/* Attached doc indicator */}
                {msg.attachedDocName && (
                  <div className="mb-2 p-2 rounded-xl bg-white/20 text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{msg.attachedDocName}</span>
                  </div>
                )}

                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Pet note bubble if attached */}
                {msg.petNote && (
                  <div className="mt-2.5 pt-2 border-t border-[var(--bloom-border)] text-[11px] text-pink-600 dark:text-pink-400 italic flex items-center gap-1.5">
                    <span>🐾</span>
                    <span>{msg.petNote}</span>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-pink-100 text-right' : 'text-[var(--bloom-text-muted)] text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* INTERACTIVE QUIZ CARD */}
              {msg.interactiveQuiz && (
                <div className="w-full max-w-[90%] md:max-w-[85%]">
                  <InteractiveQuizCard
                    quiz={msg.interactiveQuiz}
                    onSaveToStudyDecks={handleSaveQuizToStudy}
                  />
                </div>
              )}

              {/* INTERACTIVE FLASHCARDS CARD */}
              {msg.interactiveFlashcards && (
                <div className="w-full max-w-[90%] md:max-w-[85%]">
                  <InteractiveFlashcardsCard
                    cards={msg.interactiveFlashcards}
                    topic="Generated Study Deck"
                    onSaveToStudyDecks={handleSaveFlashcardsToStudy}
                  />
                </div>
              )}

              {/* ACTION HANDLING: Confirmed State */}
              {msg.actionsConfirmed && (
                <div className="w-full max-w-[85%] md:max-w-[80%] p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Confirmed! Items were added to your tasks and calendar.</span>
                </div>
              )}

              {/* ACTION HANDLING: Dismissed State */}
              {msg.actionsDismissed && (
                <div className="w-full max-w-[85%] md:max-w-[80%] p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-stone-500 text-xs flex items-center justify-between">
                  <span>Proposed suggestions dismissed. No changes were made.</span>
                  <button
                    onClick={() => {
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === msg.id ? { ...m, actionsDismissed: false, isPendingConfirmation: true } : m
                        )
                      );
                    }}
                    className="text-[10px] font-bold text-pink-600 hover:underline"
                  >
                    Restore
                  </button>
                </div>
              )}

              {/* "AI Suggests. The User Decides." Action Cards */}
              {msg.isPendingConfirmation && hasSuggestions && !msg.actionsConfirmed && !msg.actionsDismissed && (
                <div className="w-full max-w-[85%] md:max-w-[80%] p-4 rounded-3xl bg-pink-50/80 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/60 space-y-3 text-left shadow-xs">
                  {/* Action Summary Header & Primary Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-pink-200/80 dark:border-pink-900/60">
                    <div>
                      <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider block">
                        Study Schedule Suggestion
                      </span>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {msg.actionSummary || 'I can add these study blocks to your calendar.'}
                      </p>
                    </div>

                    {/* Standard Action Buttons: [Add to Calendar] [Edit] [Cancel] */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => handleAcceptAll(msg.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1 shadow-xs transition-colors"
                        title="Add to calendar and planner"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Add to Calendar</span>
                      </button>

                      <button
                        onClick={() => setEditingMsgId(isEditing ? null : msg.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                          isEditing
                            ? 'bg-stone-200 border-stone-300 text-stone-800'
                            : 'bg-white border-pink-200 text-stone-700 hover:bg-pink-100'
                        }`}
                        title="Edit proposed plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Done' : 'Edit Plan'}</span>
                      </button>

                      <button
                        onClick={() => handleDismissActions(msg.id)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        title="Cancel without making changes"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  {/* Proposed Tasks List */}
                  {currentTasks.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Study Tasks ({currentTasks.length})
                      </span>
                      {currentTasks.map((st, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-pink-100 dark:border-pink-900/40 shadow-2xs text-xs"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={st.title}
                                onChange={(e) => {
                                  const updated = [...currentTasks];
                                  updated[sIdx] = { ...st, title: e.target.value };
                                  setEditableTasks((prev) => ({ ...prev, [msg.id]: updated }));
                                }}
                                className="w-full px-2 py-1 text-xs border border-pink-300 rounded-lg bg-pink-50/50"
                              />
                            ) : (
                              <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                                {st.title}
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400">
                              {st.duration || '25m'} · {st.category || 'Study'} {st.date ? `· ${st.date}` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAcceptSingleTask(msg.id, st)}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Task</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Proposed Events List */}
                  {currentEvents.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Calendar Events ({currentEvents.length})
                      </span>
                      {currentEvents.map((se, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-purple-100 dark:border-purple-900/40 shadow-2xs text-xs"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={se.title}
                                onChange={(e) => {
                                  const updated = [...currentEvents];
                                  updated[eIdx] = { ...se, title: e.target.value };
                                  setEditableEvents((prev) => ({ ...prev, [msg.id]: updated }));
                                }}
                                className="w-full px-2 py-1 text-xs border border-purple-300 rounded-lg bg-purple-50/50"
                              />
                            ) : (
                              <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                                {se.title}
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400">
                              {se.date || '2026-09-30'} at {se.time || '15:00'} ({se.type || 'Event'})
                            </span>
                          </div>
                          <button
                            onClick={() => handleAcceptSingleEvent(msg.id, se)}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1 transition-colors shrink-0"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            <span>Add Event</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--bloom-text-muted)] italic p-2">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span>Bloom AI is analyzing your question thoughtfully with your companion...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto border-t border-[var(--bloom-border)]">
        <span className="text-[10px] font-bold text-[var(--bloom-text-muted)] uppercase shrink-0">
          Try:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full text-[11px] font-medium border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] hover:border-[var(--bloom-primary)] hover:text-[var(--bloom-primary)] whitespace-nowrap transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Attachment Previews and Quick Action Chips for Attached Study Material */}
      {(attachedImage || attachedDocName) && (
        <div className="px-4 py-2 border-t border-[var(--bloom-border)] flex flex-wrap items-center justify-between gap-2 bg-[var(--bloom-card-subtle)]">
          <div className="flex items-center gap-2">
            {attachedImage && (
              <div className="relative inline-block">
                <img
                  src={attachedImage}
                  alt="Question Attachment"
                  className="w-14 h-14 object-cover rounded-xl border-2 border-pink-400"
                />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1 -right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {attachedDocName && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate max-w-xs">{attachedDocName}</span>
                <button onClick={() => setAttachedDocName(null)}>
                  <X className="w-3 h-3 text-stone-400 hover:text-stone-700" />
                </button>
              </div>
            )}
          </div>

          {/* Quick study actions for the attachment */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {attachedImage && (
              <>
                <button
                  onClick={() => handleSend('Please solve and teach me how to approach this problem step by step.', 'teach')}
                  className="px-2.5 py-1 rounded-xl bg-pink-100 text-pink-700 font-semibold hover:bg-pink-200"
                >
                  🧑‍🏫 Teach Me
                </button>
                <button
                  onClick={() => handleSend('Please give me a strategic hint for this question.', 'hint')}
                  className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200"
                >
                  💡 Give Me a Hint
                </button>
                <button
                  onClick={() => handleSend('Please show the complete verified solution and point out common mistakes.', 'solution')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200"
                >
                  ✅ Show Solution
                </button>
              </>
            )}

            {attachedDocName && (
              <>
                <button
                  onClick={() => handleSend(`Summarize the core concepts and formulas from ${attachedDocName}`)}
                  className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200"
                >
                  📝 Summarize
                </button>
                <button
                  onClick={() => handleSend(`Create 5 high-yield flashcards from ${attachedDocName}`)}
                  className="px-2.5 py-1 rounded-xl bg-pink-100 text-pink-700 font-semibold hover:bg-pink-200"
                >
                  🎴 Flashcards
                </button>
                <button
                  onClick={() => handleSend(`Generate a 4-question practice quiz based on ${attachedDocName}`)}
                  className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-800 font-semibold hover:bg-teal-200"
                >
                  ❓ Quiz Me
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-[var(--bloom-border)] flex items-center gap-2">
        {/* Hidden inputs */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          ref={docInputRef}
          onChange={handleDocUpload}
          className="hidden"
        />

        {/* Attachment Buttons */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)] transition-colors"
          title="Upload question photo or diagram"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => cameraInputRef.current?.click()}
          className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)] transition-colors"
          title="Snap photo with camera"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={() => docInputRef.current?.click()}
          className="p-2 rounded-xl text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)] transition-colors"
          title="Attach study notes / document"
        >
          <FileText className="w-4 h-4" />
        </button>

        <button
          onClick={toggleRecording}
          className={`p-2 rounded-xl transition-colors ${
            isRecording
              ? 'bg-rose-100 text-rose-600 animate-pulse'
              : 'text-[var(--bloom-text-muted)] hover:text-[var(--bloom-primary)] hover:bg-[var(--bloom-card-subtle)]'
          }`}
          title={isRecording ? 'Listening...' : 'Voice dictation'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={
            homeworkMode
              ? `Ask question in "${hwModes.find((m) => m.id === homeworkMode)?.label}" mode...`
              : 'Ask any academic question, doubt, or request a study plan...'
          }
          className="flex-1 px-4 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-xs md:text-sm text-[var(--bloom-text)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={loading || (!input.trim() && !attachedImage && !attachedDocName)}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white shadow-xs active:scale-95 transition-all"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
