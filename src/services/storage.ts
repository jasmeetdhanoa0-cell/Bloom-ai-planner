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
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'bloom_user_profile',
  TASKS: 'bloom_tasks',
  CALENDAR: 'bloom_calendar_items',
  DIARY: 'bloom_diary_entries',
  DOCUMENTS: 'bloom_documents',
  STUDY_DECKS: 'bloom_study_decks',
  STUDY_NOTES: 'bloom_study_notes',
  CURRENT_MOOD: 'bloom_current_mood',
  CURRENT_ENERGY: 'bloom_current_energy',
  CURRENT_TIME: 'bloom_current_available_time',
};

// Initial realistic seed data for 2026-09-30
const INITIAL_PROFILE: UserProfile = {
  name: 'Aria',
  avatar: '🌸',
  modes: ['Student', 'Creator', 'Personal'],
  petType: 'Bunny',
  petName: 'Mochi',
  petXP: 180,
  petLevel: 2,
  theme: 'soft-pastel',
  aiLevel: 'Balanced',
  onboardingCompleted: true,
  notificationsEnabled: true,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review Chapter 4: Cognitive Biases & Heuristics',
    completed: false,
    date: '2026-09-30',
    time: '11:00',
    duration: '30m',
    priority: 'high',
    category: 'Study',
    notes: 'Highlight anchoring effect and availability heuristic examples',
    createdAt: '2026-09-30T08:00:00Z',
  },
  {
    id: 't-2',
    title: 'Finish Microeconomics Problem Set #2',
    completed: false,
    date: '2026-09-30',
    time: '14:30',
    duration: '45m',
    priority: 'high',
    category: 'Study',
    notes: 'Questions 4 through 8 on elasticity calculations',
    createdAt: '2026-09-30T08:10:00Z',
  },
  {
    id: 't-3',
    title: 'Curate Pinterest moodboard for aesthetic stationery line',
    completed: false,
    date: '2026-09-30',
    time: '16:00',
    duration: '25m',
    priority: 'medium',
    category: 'Creator',
    notes: 'Pastel palette: soft lilac, rose blush, and cream',
    createdAt: '2026-09-30T08:30:00Z',
  },
  {
    id: 't-4',
    title: 'Hydrate & morning sun stretch with Mochi 🐰',
    completed: true,
    date: '2026-09-30',
    time: '08:30',
    duration: '15m',
    priority: 'low',
    category: 'Personal',
    notes: 'Felt very refreshing!',
    createdAt: '2026-09-30T07:30:00Z',
    completedAt: '2026-09-30T08:45:00Z',
  },
  {
    id: 't-5',
    title: 'Draft personal statement for Global Scholars Program',
    completed: false,
    date: '2026-10-02',
    time: '10:00',
    duration: '1h',
    priority: 'high',
    category: 'Study',
    notes: 'Focus on community research and cross-disciplinary projects',
    createdAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 't-6',
    title: 'Weekly sync with study group on Discord',
    completed: false,
    date: '2026-10-01',
    time: '18:00',
    duration: '45m',
    priority: 'medium',
    category: 'Study',
    notes: 'Go over practice midterm solutions',
    createdAt: '2026-09-29T12:00:00Z',
  },
  {
    id: 't-7',
    title: 'French language conversation practice (20 cards)',
    completed: false,
    date: '2026-10-03',
    time: '15:00',
    duration: '20m',
    priority: 'low',
    category: 'Learning',
    notes: 'Review past tense irregular conjugations',
    createdAt: '2026-09-29T14:00:00Z',
  },
];

const INITIAL_CALENDAR: CalendarItem[] = [
  {
    id: 'c-1',
    title: 'Cognitive Psychology Lecture',
    type: 'Study session',
    date: '2026-09-30',
    time: '09:00',
    durationMinutes: 90,
    notes: 'Hall B - Prof. Henderson. Bring tablet & lecture slides.',
    color: '#F472B6',
    completed: true,
  },
  {
    id: 'c-2',
    title: 'Focus Sprint: Microeconomics',
    type: 'Study session',
    date: '2026-09-30',
    time: '14:30',
    durationMinutes: 50,
    notes: 'Focus mode with lofi sounds and Mochi studying along',
    color: '#A78BFA',
  },
  {
    id: 'c-3',
    title: 'Matcha Latte Break & Journaling',
    type: 'Event',
    date: '2026-09-30',
    time: '15:30',
    durationMinutes: 30,
    notes: 'Cozy cafe table near the garden window',
    color: '#6EE7B7',
  },
  {
    id: 'c-4',
    title: 'Statistics Midterm Exam Prep',
    type: 'Exam',
    date: '2026-10-03',
    time: '10:00',
    durationMinutes: 120,
    notes: 'Formula sheet allowed. Bring scientific calculator.',
    color: '#F87171',
  },
  {
    id: 'c-5',
    title: 'Design Critique & Portfolio Review',
    type: 'Assignment',
    date: '2026-10-05',
    time: '13:00',
    durationMinutes: 60,
    notes: 'Bring prototype mockups and user research interview notes',
    color: '#FBBF24',
  },
  {
    id: 'c-6',
    title: 'Water plants & tidy study nook',
    type: 'Reminder',
    date: '2026-09-30',
    time: '19:30',
    durationMinutes: 15,
    notes: 'Mochi loves when the plant leaves are clean 🌿',
    color: '#34D399',
  },
];

const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: 'd-1',
    date: '2026-09-29',
    mood: 'Motivated',
    text: 'Made a cozy cup of vanilla rooibos tea and organized my desk. Finished my biology flashcard deck ahead of schedule. Mochi took a nap right on top of my notebook page—too cute to disturb! Feeling grounded and ready for the week ahead 🌷',
    stickers: ['🐰', '🍵', '🌸', '✨'],
    createdAt: '2026-09-29T21:30:00Z',
  },
  {
    id: 'd-2',
    date: '2026-09-28',
    mood: 'Good',
    text: 'Spent the afternoon studying at the botanical gardens greenhouse. The natural light was wonderful. Managed two 50-minute deep focus sprints without checking social media once.',
    stickers: ['🌿', '📖', '☕'],
    createdAt: '2026-09-28T20:00:00Z',
  },
];

const INITIAL_DOCUMENTS: StoredDocument[] = [
  {
    id: 'doc-1',
    name: 'Official_University_Transcript_Fall.pdf',
    category: 'Education',
    size: '1.2 MB',
    dateUploaded: '2026-09-15',
    tags: ['Academics', 'Official', 'Semester 1'],
    notes: 'Verified copy with registrar seal',
  },
  {
    id: 'doc-2',
    name: 'Global_Excellence_Scholarship_Form.pdf',
    category: 'Scholarships',
    size: '840 KB',
    dateUploaded: '2026-09-22',
    tags: ['Financial Aid', 'Application', '2026-2027'],
    notes: 'Submitted draft, waiting for recommendation letter',
  },
  {
    id: 'doc-3',
    name: 'Student_Identity_Card_Scan.pdf',
    category: 'Identity',
    size: '420 KB',
    dateUploaded: '2026-09-01',
    tags: ['ID', 'Campus Pass'],
    notes: 'Valid through June 2028',
  },
  {
    id: 'doc-4',
    name: 'UX_Design_Foundations_Certificate.pdf',
    category: 'Certificates',
    size: '2.1 MB',
    dateUploaded: '2026-08-20',
    tags: ['Design', 'Credentials'],
  },
];

const INITIAL_STUDY_DECKS: StudyDeck[] = [
  {
    id: 'deck-1',
    title: 'Cognitive Psychology: Key Heuristics',
    category: 'Psychology',
    cards: [
      {
        id: 'c-1',
        front: 'What is the Availability Heuristic?',
        back: 'Estimating the likelihood of events based on their mental availability and ease of recall (e.g., plane crash fears after news coverage).',
        mastered: true,
      },
      {
        id: 'c-2',
        front: 'Define Anchoring and Adjustment.',
        back: 'The tendency to rely heavily on the first piece of information offered (the "anchor") when making decisions.',
        mastered: false,
      },
      {
        id: 'c-3',
        front: 'What is Confirmation Bias?',
        back: 'The human tendency to search for, interpret, and recall information that validates preexisting beliefs while discounting contrary evidence.',
        mastered: true,
      },
      {
        id: 'c-4',
        front: 'What is the Framing Effect?',
        back: 'Drawing different conclusions from the same information depending on how that information is presented (e.g., 90% lean vs 10% fat).',
        mastered: false,
      },
    ],
  },
  {
    id: 'deck-2',
    title: 'Microeconomics: Core Principles',
    category: 'Economics',
    cards: [
      {
        id: 'e-1',
        front: 'What is Opportunity Cost?',
        back: 'The loss of potential gain from other alternatives when one alternative is chosen.',
        mastered: true,
      },
      {
        id: 'e-2',
        front: 'Define Price Elasticity of Demand.',
        back: 'A measure of the responsiveness of the quantity demanded of a good to a change in its price (% change in Q / % change in P).',
        mastered: false,
      },
    ],
  },
];

const INITIAL_STUDY_NOTES: StudyNote[] = [
  {
    id: 'n-1',
    title: 'Cognitive Biases in Product Architecture',
    content: `# Cognitive Biases & Aesthetic UX

1. **Choice Architecture**: Humans experience decision fatigue when faced with too many unorganized options. Keep menus serene and hierarchical.
2. **Default Effect**: Users strongly stick with gentle defaults (e.g. 25-minute Pomodoro, soft pastel themes).
3. **Peak-End Rule**: Memories of experiences are dominated by their peak intensity and their ending. *Celebration confetti & pet smiles create warm peak-ends!*

## Key Takeaway
Plan gently. Small, reliable habits compound far faster than chaotic sprints 🌷.`,
    tags: ['Psychology', 'Design', 'Habits'],
    updatedAt: '2026-09-30T09:40:00Z',
  },
  {
    id: 'n-2',
    title: 'Feynman Technique Guide',
    content: `# The Feynman Technique in 4 Steps 💡

1. **Choose a Concept**: Write the title at the top of a fresh pastel page.
2. **Explain it to a 12-Year-Old**: Use plain English, simple analogies, and zero academic buzzwords.
3. **Identify Gaps**: Whenever you get stuck or resort to complicated terms, re-read the primary source.
4. **Simplify & Create an Analogy**: Connect the concept to something tactile (like baking cookies or organizing bookshelves).`,
    tags: ['Study Skills', 'Productivity'],
    updatedAt: '2026-09-28T16:00:00Z',
  },
];

export const storage = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  },
  saveProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  },
  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  },

  getCalendarItems: (): CalendarItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      return data ? JSON.parse(data) : INITIAL_CALENDAR;
    } catch {
      return INITIAL_CALENDAR;
    }
  },
  saveCalendarItems: (items: CalendarItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving calendar:', e);
    }
  },

  getDiary: (): DiaryEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIARY);
      return data ? JSON.parse(data) : INITIAL_DIARY;
    } catch {
      return INITIAL_DIARY;
    }
  },
  saveDiary: (entries: DiaryEntry[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving diary:', e);
    }
  },

  getDocuments: (): StoredDocument[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  },
  saveDocuments: (docs: StoredDocument[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.error('Error saving documents:', e);
    }
  },

  getStudyDecks: (): StudyDeck[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_DECKS);
      return data ? JSON.parse(data) : INITIAL_STUDY_DECKS;
    } catch {
      return INITIAL_STUDY_DECKS;
    }
  },
  saveStudyDecks: (decks: StudyDeck[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_DECKS, JSON.stringify(decks));
    } catch (e) {
      console.error('Error saving decks:', e);
    }
  },

  getStudyNotes: (): StudyNote[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_NOTES);
      return data ? JSON.parse(data) : INITIAL_STUDY_NOTES;
    } catch {
      return INITIAL_STUDY_NOTES;
    }
  },
  saveStudyNotes: (notes: StudyNote[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  },

  getMood: (): MoodType => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_MOOD) as MoodType) || 'Good';
  },
  saveMood: (mood: MoodType): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MOOD, mood);
  },

  getEnergy: (): number => {
    const e = localStorage.getItem(STORAGE_KEYS.CURRENT_ENERGY);
    return e ? Number(e) : 3;
  },
  saveEnergy: (energy: number): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ENERGY, String(energy));
  },

  getAvailableTime: (): AvailableTime => {
    return (
      (localStorage.getItem(STORAGE_KEYS.CURRENT_TIME) as AvailableTime) || '1–2 hours'
    );
  },
  saveAvailableTime: (time: AvailableTime): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, time);
  },

  resetAllData: () => {
    localStorage.clear();
    window.location.reload();
  },
};
