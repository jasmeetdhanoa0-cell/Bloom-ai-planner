export type ModeType = 'Student' | 'Work' | 'Creator' | 'Personal' | 'Learning';

export type PetType = 'Bunny' | 'Cat' | 'Dog' | 'Bear' | 'Fox' | 'Hamster' | 'Panda' | 'Frog';

export type PetState = 'idle' | 'happy' | 'studying' | 'sleepy' | 'celebrating' | 'comforting';

export type ThemeId =
  | 'soft-pastel'
  | 'coquette'
  | 'clean'
  | 'dark-academia'
  | 'lavender'
  | 'strawberry'
  | 'cozy'
  | 'night';

export type AILevel = 'Minimal' | 'Balanced' | 'Full AI';

export type MoodType =
  | 'Great'
  | 'Good'
  | 'Okay'
  | 'Tired'
  | 'Sleepy'
  | 'Overwhelmed'
  | 'Stressed'
  | 'Motivated'
  | 'Low'
  | 'Focused';

export type AvailableTime =
  | '15–30 min'
  | '30–60 min'
  | '1–2 hours'
  | '2–4 hours'
  | 'Most of the day'
  | 'Custom';

export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskCategory = 'Study' | 'Work' | 'Personal' | 'Creator' | 'Learning';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  duration?: string; // e.g. "25m", "1h"
  priority: TaskPriority;
  category: TaskCategory;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type CalendarItemType =
  | 'Task'
  | 'Event'
  | 'Exam'
  | 'Assignment'
  | 'Reminder'
  | 'Study session';

export interface CalendarItem {
  id: string;
  title: string;
  type: CalendarItemType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  notes?: string;
  color?: string;
  completed?: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: MoodType;
  text: string;
  photoUrl?: string;
  stickers?: string[];
  createdAt: string;
}

export type DocumentCategory =
  | 'Education'
  | 'Scholarships'
  | 'Identity'
  | 'Applications'
  | 'Certificates'
  | 'Other';

export interface StoredDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  size: string;
  dateUploaded: string;
  tags: string[];
  notes?: string;
  fileDataUrl?: string;
  fileType?: string;
  hasStoredFile?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface StudyDeck {
  id: string;
  title: string;
  category: string;
  cards: Flashcard[];
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  modes: ModeType[];
  petType: PetType;
  petName: string;
  petXP: number;
  petLevel: number;
  theme: ThemeId;
  aiLevel: AILevel;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
}

export type ExplanationLevel = 'simple' | 'school' | 'detailed' | 'exam';

export type HomeworkHelpMode = 'teach' | 'hint' | 'solve' | 'solution';

export interface QuizQuestion {
  id?: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  type?: 'mcq' | 'true_false' | 'short_answer' | 'concept' | 'exam';
  answer?: string;
}

export interface InteractiveQuiz {
  title?: string;
  topic?: string;
  questions: QuizQuestion[];
}

export interface SuggestedAction {
  title: string;
  duration?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  type?: CalendarItemType;
  date?: string;
  time?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bloom';
  text: string;
  timestamp: string;
  actionSummary?: string;
  suggestedTasks?: SuggestedAction[];
  suggestedEvents?: SuggestedAction[];
  petNote?: string;
  isPendingConfirmation?: boolean;
  actionsConfirmed?: boolean;
  actionsDismissed?: boolean;
  isError?: boolean;
  // Tutor extensions
  imageAttachment?: string;
  attachedDocName?: string;
  explanationLevel?: ExplanationLevel;
  homeworkMode?: HomeworkHelpMode;
  interactiveQuiz?: InteractiveQuiz;
  interactiveFlashcards?: Flashcard[];
  detectedSubject?: string;
}
