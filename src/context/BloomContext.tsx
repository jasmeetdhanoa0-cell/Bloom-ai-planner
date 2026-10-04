import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Task,
  CalendarItem,
  DiaryEntry,
  StoredDocument,
  StudyDeck,
  StudyNote,
  MoodType,
  AvailableTime,
  PetType,
  PetState,
  ThemeId,
  ModeType,
  AILevel,
} from '../types';
import { storage } from '../services/storage';
import { documentStorage } from '../services/documentStorage';

export type ActiveTab =
  | 'home'
  | 'calendar'
  | 'tasks'
  | 'ai'
  | 'focus'
  | 'study'
  | 'pet'
  | 'diary'
  | 'documents'
  | 'themes'
  | 'settings';

interface BloomContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Profile & Preferences
  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeId) => void;
  toggleMode: (mode: ModeType) => void;

  // Mood & Daily State
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  energy: number;
  setEnergy: (energy: number) => void;
  availableTime: AvailableTime;
  setAvailableTime: (time: AvailableTime) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Calendar
  calendarItems: CalendarItem[];
  addCalendarItem: (item: Omit<CalendarItem, 'id'>) => CalendarItem;
  updateCalendarItem: (id: string, updates: Partial<CalendarItem>) => void;
  deleteCalendarItem: (id: string) => void;

  // Pet System
  petState: PetState;
  setPetState: (state: PetState) => void;
  gainPetXP: (amount: number, reason?: string) => void;
  petInteraction: (type: 'pat' | 'feed' | 'study') => void;
  petQuote: string;

  // Diary
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  deleteDiaryEntry: (id: string) => void;

  // Documents
  documents: StoredDocument[];
  addDocument: (doc: Omit<StoredDocument, 'id' | 'dateUploaded'> & { id?: string; file?: File | Blob }) => Promise<StoredDocument>;
  deleteDocument: (id: string) => void;

  // Study
  studyDecks: StudyDeck[];
  addStudyDeck: (deck: Omit<StudyDeck, 'id'>) => StudyDeck;
  studyNotes: StudyNote[];
  addStudyNote: (note: Omit<StudyNote, 'id' | 'updatedAt'>) => void;
  updateStudyNote: (id: string, content: string) => void;
  toggleFlashcardMastered: (deckId: string, cardId: string) => void;

  // Modals & Triggers
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isOverwhelmedOpen: boolean;
  setIsOverwhelmedOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialDate?: string;
  quickAddInitialTab?: 'task' | 'event';
  openQuickAdd: (tab?: 'task' | 'event', date?: string) => void;

  // Sound effects
  playChime: (type?: 'complete' | 'levelUp' | 'timer' | 'tap') => void;
  triggerCelebration: () => void;
}

const BloomContext = createContext<BloomContextType | undefined>(undefined);

// Web Audio sound synthesizer for cozy chimes (no external files required)
function playGentleSound(type: 'complete' | 'levelUp' | 'timer' | 'tap' = 'complete') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'complete') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.28); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'levelUp') {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } else if (type === 'tap') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'timer') {
      const now = ctx.currentTime;
      [587.33, 739.99, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.6);
      });
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export const BloomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>(() => storage.getCalendarItems());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => storage.getDiary());
  const [documents, setDocuments] = useState<StoredDocument[]>(() => storage.getDocuments());
  const [studyDecks, setStudyDecks] = useState<StudyDeck[]>(() => storage.getStudyDecks());
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>(() => storage.getStudyNotes());

  const [mood, setMoodState] = useState<MoodType>(() => storage.getMood());
  const [energy, setEnergyState] = useState<number>(() => storage.getEnergy());
  const [availableTime, setAvailableTimeState] = useState<AvailableTime>(() => storage.getAvailableTime());

  const [petState, setPetState] = useState<PetState>('idle');
  const [petQuote, setPetQuote] = useState<string>('Ready for a lovely, productive session! 🌷');

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!profile.onboardingCompleted);
  const [isOverwhelmedOpen, setIsOverwhelmedOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickAddInitialDate, setQuickAddInitialDate] = useState<string | undefined>(undefined);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'task' | 'event' | undefined>(undefined);

  const openQuickAdd = (tab: 'task' | 'event' = 'task', date?: string) => {
    setQuickAddInitialTab(tab);
    setQuickAddInitialDate(date);
    setIsQuickAddOpen(true);
  };

  // Sync theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // Dynamic pet quotes based on mood/energy
  useEffect(() => {
    if (mood === 'Overwhelmed' || mood === 'Stressed') {
      setPetState('comforting');
      setPetQuote(`I'm sitting right beside you. Breathe in, breathe out... you don't have to do it all right now 🍵`);
    } else if (mood === 'Tired' || mood === 'Sleepy' || energy <= 2) {
      setPetState('sleepy');
      setPetQuote(`Even seedlings rest before they bloom. Let's do just one small cozy task and drink water! 🌸`);
    } else if (mood === 'Motivated' || mood === 'Focused') {
      setPetState('happy');
      setPetQuote(`Look at that spark! Let's tackle that top priority task together ✨`);
    } else {
      setPetState('idle');
      setPetQuote(`Every small step forward counts! What should we gently work on? 🐰`);
    }
  }, [mood, energy]);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...partial };
      storage.saveProfile(updated);
      return updated;
    });
  };

  const setTheme = (theme: ThemeId) => {
    updateProfile({ theme });
  };

  const toggleMode = (mode: ModeType) => {
    const current = profile.modes;
    const next = current.includes(mode)
      ? current.length > 1
        ? current.filter((m) => m !== mode)
        : current
      : [...current, mode];
    updateProfile({ modes: next });
  };

  const setMood = (newMood: MoodType) => {
    setMoodState(newMood);
    storage.saveMood(newMood);
  };

  const setEnergy = (newEnergy: number) => {
    setEnergyState(newEnergy);
    storage.saveEnergy(newEnergy);
  };

  const setAvailableTime = (time: AvailableTime) => {
    setAvailableTimeState(time);
    storage.saveAvailableTime(time);
  };

  const triggerCelebration = () => {
    playGentleSound('complete');
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F472B6', '#C084FC', '#6EE7B7', '#FBBF24'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const gainPetXP = (amount: number, reason: string = 'task') => {
    setProfile((prev) => {
      const nextXP = prev.petXP + amount;
      const nextLevel = Math.floor(nextXP / 100) + 1;
      const leveledUp = nextLevel > prev.petLevel;

      if (leveledUp) {
        playGentleSound('levelUp');
        setPetState('celebrating');
        setPetQuote(`Level up! ${prev.petName} grew into a stronger, happier companion! 🎉 (Level ${nextLevel})`);
        setTimeout(() => setPetState('happy'), 4000);
      } else {
        setPetState('happy');
        setTimeout(() => setPetState('idle'), 2500);
      }

      const updated = {
        ...prev,
        petXP: nextXP,
        petLevel: nextLevel,
      };
      storage.saveProfile(updated);
      return updated;
    });
  };

  const petInteraction = (type: 'pat' | 'feed' | 'study') => {
    playGentleSound('tap');
    if (type === 'pat') {
      gainPetXP(5, 'pat');
      setPetState('happy');
      setPetQuote(`*purrs softly & wiggles ears* Thank you for the pats! 💕`);
    } else if (type === 'feed') {
      gainPetXP(10, 'snack');
      setPetState('happy');
      setPetQuote(`Yum! That cozy strawberry snack gave me so much energy! 🍓`);
    } else if (type === 'study') {
      gainPetXP(15, 'study');
      setPetState('studying');
      setPetQuote(`Putting on my reading spectacles. Let's study in quiet harmony 📚✨`);
    }
  };

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      storage.saveTasks(updated);
      return updated;
    });
    playGentleSound('tap');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      storage.saveTasks(updated);
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.saveTasks(updated);
      return updated;
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            triggerCelebration();
            gainPetXP(20, 'Task Completed');
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      storage.saveTasks(updated);
      return updated;
    });
  };

  // Calendar actions
  const addCalendarItem = (itemData: Omit<CalendarItem, 'id'>): CalendarItem => {
    const newItem: CalendarItem = {
      ...itemData,
      id: `c-${Date.now()}`,
    };
    setCalendarItems((prev) => {
      const updated = [...prev, newItem];
      storage.saveCalendarItems(updated);
      return updated;
    });
    playGentleSound('tap');
    return newItem;
  };

  const updateCalendarItem = (id: string, updates: Partial<CalendarItem>) => {
    setCalendarItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      storage.saveCalendarItems(updated);
      return updated;
    });
  };

  const deleteCalendarItem = (id: string) => {
    setCalendarItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.saveCalendarItems(updated);
      return updated;
    });
  };

  // Diary actions
  const addDiaryEntry = (entryData: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDiaryEntries((prev) => {
      const updated = [newEntry, ...prev];
      storage.saveDiary(updated);
      return updated;
    });
    triggerCelebration();
    gainPetXP(25, 'Diary reflection logged');
  };

  const deleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      storage.saveDiary(updated);
      return updated;
    });
  };

  // Document actions
  const addDocument = async (
    docData: Omit<StoredDocument, 'id' | 'dateUploaded'> & { id?: string; file?: File | Blob }
  ): Promise<StoredDocument> => {
    const docId = docData.id || `doc-${Date.now()}`;
    const { file, ...rest } = docData;

    let dataUrl = docData.fileDataUrl;
    let actualFile = file;

    if (actualFile) {
      try {
        if (!dataUrl && actualFile.size <= 3 * 1024 * 1024) {
          dataUrl = await documentStorage.fileToDataUrl(actualFile);
        }
        await documentStorage.saveDocumentFile(docId, actualFile, {
          name: docData.name,
          type: docData.fileType || actualFile.type,
          size: actualFile.size,
        });
      } catch (err) {
        console.warn('Failed to save file to primary storage:', err);
      }
    } else {
      // If user created entry without picking a file, generate and save high-fidelity file blob
      const sample = documentStorage.generateSampleDocumentBlob(docId, {
        id: docId,
        name: docData.name,
        category: docData.category,
        size: docData.size || '1.2 MB',
        dateUploaded: new Date().toISOString().split('T')[0],
        tags: docData.tags || [],
        notes: docData.notes,
      });
      try {
        dataUrl = await documentStorage.fileToDataUrl(sample.blob);
        await documentStorage.saveDocumentFile(docId, sample.blob, {
          name: sample.fileName,
          type: sample.mimeType,
          size: sample.size,
        });
      } catch (err) {
        console.warn('Failed to save generated document blob:', err);
      }
    }

    const newDoc: StoredDocument = {
      ...rest,
      id: docId,
      dateUploaded: new Date().toISOString().split('T')[0],
      fileDataUrl: dataUrl,
      fileType: docData.fileType || (actualFile ? actualFile.type : undefined),
      hasStoredFile: true,
    };

    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      storage.saveDocuments(updated);
      return updated;
    });
    gainPetXP(15, 'Document filed safely');
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      storage.saveDocuments(updated);
      return updated;
    });
    documentStorage.deleteDocumentFile(id).catch(console.warn);
  };

  // Study actions
  const addStudyNote = (noteData: Omit<StudyNote, 'id' | 'updatedAt'>) => {
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setStudyNotes((prev) => {
      const updated = [newNote, ...prev];
      storage.saveStudyNotes(updated);
      return updated;
    });
    gainPetXP(20, 'Note created');
  };

  const updateStudyNote = (id: string, content: string) => {
    setStudyNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n));
      storage.saveStudyNotes(updated);
      return updated;
    });
  };

  const addStudyDeck = (deckData: Omit<StudyDeck, 'id'>) => {
    const newDeck: StudyDeck = {
      ...deckData,
      id: `deck-${Date.now()}`,
    };
    setStudyDecks((prev) => {
      const updated = [newDeck, ...prev];
      storage.saveStudyDecks(updated);
      return updated;
    });
    gainPetXP(25, 'Deck added to study hub');
    return newDeck;
  };

  const toggleFlashcardMastered = (deckId: string, cardId: string) => {
    setStudyDecks((prev) => {
      const updated = prev.map((deck) => {
        if (deck.id === deckId) {
          const cards = deck.cards.map((c) => {
            if (c.id === cardId) {
              const mastered = !c.mastered;
              if (mastered) gainPetXP(10, 'Flashcard mastered');
              return { ...c, mastered };
            }
            return c;
          });
          return { ...deck, cards };
        }
        return deck;
      });
      storage.saveStudyDecks(updated);
      return updated;
    });
  };

  return (
    <BloomContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        setTheme,
        toggleMode,
        mood,
        setMood,
        energy,
        setEnergy,
        availableTime,
        setAvailableTime,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        calendarItems,
        addCalendarItem,
        updateCalendarItem,
        deleteCalendarItem,
        petState,
        setPetState,
        gainPetXP,
        petInteraction,
        petQuote,
        diaryEntries,
        addDiaryEntry,
        deleteDiaryEntry,
        documents,
        addDocument,
        deleteDocument,
        studyDecks,
        addStudyDeck,
        studyNotes,
        addStudyNote,
        updateStudyNote,
        toggleFlashcardMastered,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isOverwhelmedOpen,
        setIsOverwhelmedOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialDate,
        quickAddInitialTab,
        openQuickAdd,
        playChime: playGentleSound,
        triggerCelebration,
      }}
    >
      {children}
    </BloomContext.Provider>
  );
};

export const useBloom = (): BloomContextType => {
  const context = useContext(BloomContext);
  if (!context) {
    throw new Error('useBloom must be used within a BloomProvider');
  }
  return context;
};
