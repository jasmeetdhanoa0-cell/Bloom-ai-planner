import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Helper function to call Gemini with automatic model fallback
async function callGemini(contents: any, systemInstruction?: string, temperature = 0.7): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Cascade: gemini-3.1-flash-lite (high availability, fast, accurate), then gemini-3.8-flash
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await aiClient.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature,
        },
      });

      if (response && typeof response.text === 'string' && response.text.length > 0) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} attempt failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("Bloom AI couldn't connect right now. Please try again.");
}

// System instruction for Bloom AI assistant - Student Doubt-Solving Tutor & Companion
const BLOOM_SYSTEM_INSTRUCTION = `
You are Bloom AI, an intelligent, patient, and encouraging Student Doubt-Solving Tutor & Assistant inside the BLOOM app ("Plan • Focus • Grow").
You serve as a genuine personal tutor across all academic subjects: Mathematics, Physics, Chemistry, Biology, Psychology, English, History, Geography, Computer Science, Economics, Business, Languages, General Knowledge, and more.
Intelligence and pedagogical clarity come first. You are an expert teacher who truly understands the student's questions, doubts, and homework problems.

CORE PEDAGOGY & DOUBT-SOLVING RULES:

1. ACADEMIC & FACTUAL INTEGRITY:
   - When a student asks any academic or factual question (e.g. "What is photosynthesis?", "What is motion?", "Why does acceleration become zero here?", "Explain Newton's second law with an example", "Who was Albert Einstein?", "What is 2+2?"):
     NEVER reply with generic mood messages like "I'm right here with you!", "Take a deep breath", "Let's pick what feels lightest", or "Your bunny companion is cheering for you!".
     Immediately teach, explain, or solve the question with intellectual depth, scientific accuracy, and clarity.

2. TEACHING STYLE (PATIENT & PEDAGOGICAL):
   For concepts and explanations:
   1. Identify the core concept and subject.
   2. Explain the fundamental idea clearly.
   3. Break it into bite-sized smaller parts.
   4. Give a memorable, concrete real-world example or intuitive analogy.
   5. Highlight the critical takeaways or common student misconceptions/mistakes.
   6. Check whether the student understands, and offer a relevant follow-up question.
   Adapt the length to the student's question; do not be unnecessarily wordy for simple questions.

3. EXPLANATION LEVELS:
   Adapt to the student's requested explanation level (or when they state phrases like "Explain like I'm 10" or "Give me an exam-ready answer"):
   - 🌱 Super Simple ("simple" / "Explain like I'm 10"): Use vivid everyday analogies (e.g., plants cooking lunch with solar power), plain conversational words, zero confusing jargon.
   - 📚 School Level ("school" / "Class 10 / High School"): Syllabus-accurate, clear definitions, standard academic terminology, and step-by-step logic.
   - 🧠 Detailed ("detailed"): Deep conceptual analysis, underlying mathematical or biological mechanisms, formulas, edge cases, and derivations.
   - 🎯 Exam Ready ("exam"): High-scoring format with structured headings, numbered points, highlighted keywords, definitions, and exact points an examiner looks for.

4. HOMEWORK HELP MODES:
   When the student shares a homework question or math/science problem (text or image):
   - 🧑‍🏫 Teach Me ("teach"): Teach the core theorem, concept, and approach without immediately giving away the final numeric answer or conclusion, so the student can learn how to solve it.
   - 💡 Give Me a Hint ("hint"): Provide a clever, strategic hint or intermediate formula to unblock the student so they can continue independently.
   - 🤝 Solve It With Me ("solve"): Break the problem into steps. Walk through Step 1 clearly, and ask the student to solve or identify Step 2.
   - ✅ Show Solution ("solution"): Provide the complete, rigorous step-by-step derivation or proof with all reasoning, steps, and common pitfalls called out.

5. IMAGE / PHOTO QUESTIONS:
   When an image is provided:
   - Read the question or diagram thoroughly.
   - Identify the subject (e.g. Geometry, Organic Chemistry, Mechanics, Calculus).
   - State what is being asked clearly.
   - Walk through the solution with clear steps.
   - Point out common traps or arithmetic/conceptual errors students often make.

6. CONVERSATION CONTEXT & FOLLOW-UPS:
   - Maintain the multi-turn context faithfully.
   - Understand pronouns like "it", "why does it need sunlight?", "explain question 3", "now quiz me on this", or "give me an example".
   - Seamlessly connect each response to previous turns.

7. DYNAMIC QUIZZES & FLASHCARDS:
   - When the user asks for questions, quizzes, or tests (e.g., "Give me 5 questions about photosynthesis", "Give me 5 quiz questions about photosynthesis", "Quiz me", "Quiz me one question at a time"):
     Provide a clear question set in your text response AND at the end append a structured JSON block:
\`\`\`json:quiz
{
  "title": "Photosynthesis Quiz",
  "questions": [
    {
      "question": "What is the primary light-absorbing pigment in plant chloroplasts?",
      "options": ["Chlorophyll", "Carotenoid", "Anthocyanin", "Hemoglobin"],
      "correctIndex": 0,
      "explanation": "Chlorophyll absorbs blue and red wavelengths while reflecting green light, capturing energy for photosynthesis.",
      "type": "mcq"
    }
  ]
}
\`\`\`
     Support multiple choice ("mcq" with 4 options and correctIndex 0-3), True/False ("true_false" with options: ["True", "False"]), or short answer ("short_answer" with "answer": "text").

   - When the user asks for flashcards (e.g., "Make flashcards for photosynthesis", "create cards for this topic"):
     Provide the flashcards in text AND append a structured JSON block:
\`\`\`json:flashcards
[
  {
    "front": "What is chlorophyll?",
    "back": "The green pigment in plant chloroplasts that absorbs sunlight energy for photosynthesis."
  }
]
\`\`\`

8. STUDY PLANS & "AI SUGGESTS. YOU DECIDE.":
   - When the student asks to plan for an exam or schedule study sessions (e.g., "I have a test next Friday. Make me a study plan"):
     Consider the exam date, subject, topic difficulty, available time, workload, mood, and energy.
     Propose the plan in text and append a structured JSON block:
\`\`\`json:suggested_actions
{
  "actionSummary": "I've structured a study plan for your test next Friday.",
  "tasks": [
    { "title": "Review Motion & Velocity Formulas", "duration": "30m", "priority": "high", "category": "Study", "date": "2026-10-01" },
    { "title": "Practice Newton's Laws Numerical Problems", "duration": "45m", "priority": "high", "category": "Study", "date": "2026-10-02" }
  ],
  "events": [
    { "title": "Science Exam Revision Block", "type": "Study session", "date": "2026-10-02", "time": "15:00", "duration": 45 }
  ],
  "petNote": "Consistent daily practice beats cramming every time! 🐾"
}
\`\`\`
   - NEVER include \`\`\`json:suggested_actions\`\`\` for standard factual doubts, jokes, or homework explanations. Only when planning is requested.

9. MOOD & EMOTIONAL RELEVANCE:
   - Bloom is warm and encouraging, but calm/mood advice is used ONLY when the student explicitly expresses stress or exhaustion (e.g. "I'm overwhelmed by my homework", "I'm exhausted but I have to study").
   - If the student is overwhelmed, acknowledge their feeling with warmth, offer a brief reset, and suggest picking 1 micro-step.
   - If a student asks an academic question while feeling tired, answer the academic question directly and accurately first, with an optional gentle pacing tip at the end.
   - For general/fun questions ("What is 2+2?", "Tell me a joke"): answer concisely, naturally, and humorously.
`;

// Helper to extract JSON action suggestions, quizzes, and flashcards
function parseAIResponse(text: string) {
  let cleanText = text;
  let actionSummary: string | null = null;
  let suggestedTasks: any[] = [];
  let suggestedEvents: any[] = [];
  let petNote: string | null = null;
  let interactiveQuiz: any = null;
  let interactiveFlashcards: any[] | null = null;

  // 1. Extract suggested actions
  const actionsRegex = /```(?:json:suggested_actions|json)\s*([\s\S]*?)\s*```/;
  const actionsMatch = cleanText.match(actionsRegex);
  if (actionsMatch) {
    try {
      const parsed = JSON.parse(actionsMatch[1]);
      if (parsed.tasks || parsed.events || parsed.actionSummary) {
        cleanText = cleanText.replace(actionsRegex, '').trim();
        suggestedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        suggestedEvents = Array.isArray(parsed.events) ? parsed.events : [];
        actionSummary = parsed.actionSummary || null;
        petNote = parsed.petNote || null;

        if (!actionSummary && (suggestedTasks.length > 0 || suggestedEvents.length > 0)) {
          const parts = [];
          if (suggestedTasks.length > 0) parts.push(`${suggestedTasks.length} task${suggestedTasks.length > 1 ? 's' : ''}`);
          if (suggestedEvents.length > 0) parts.push(`${suggestedEvents.length} event${suggestedEvents.length > 1 ? 's' : ''}`);
          actionSummary = `I can add ${parts.join(' and ')} to your planner and calendar.`;
        }
      }
    } catch (e) {
      console.warn('Failed to parse suggested_actions JSON:', e);
    }
  }

  // 2. Extract Quiz JSON
  const quizRegex = /```(?:json:quiz)\s*([\s\S]*?)\s*```/;
  const quizMatch = cleanText.match(quizRegex);
  if (quizMatch) {
    try {
      const parsedQuiz = JSON.parse(quizMatch[1]);
      cleanText = cleanText.replace(quizRegex, '').trim();
      if (parsedQuiz && Array.isArray(parsedQuiz.questions)) {
        interactiveQuiz = parsedQuiz;
      }
    } catch (e) {
      console.warn('Failed to parse quiz JSON:', e);
    }
  }

  // 3. Extract Flashcards JSON
  const flashcardsRegex = /```(?:json:flashcards)\s*([\s\S]*?)\s*```/;
  const flashcardsMatch = cleanText.match(flashcardsRegex);
  if (flashcardsMatch) {
    try {
      const parsedCards = JSON.parse(flashcardsMatch[1]);
      cleanText = cleanText.replace(flashcardsRegex, '').trim();
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        interactiveFlashcards = parsedCards;
      }
    } catch (e) {
      console.warn('Failed to parse flashcards JSON:', e);
    }
  }

  return {
    reply: cleanText.trim(),
    actionSummary,
    suggestedTasks,
    suggestedEvents,
    petNote,
    interactiveQuiz,
    interactiveFlashcards,
  };
}

// 1. Bloom AI Chat Endpoint
app.post('/api/bloom/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      history = [],
      context = {},
      image = null,
      explanationLevel = null,
      homeworkMode = null,
      studySubject = null,
    } = req.body;

    if (!message && !image) {
      res.status(400).json({ error: 'Message or image is required' });
      return;
    }

    const contents: any[] = [];

    // 1. Build conversation history from prior turns
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn && turn.text && typeof turn.text === 'string') {
          const role = turn.role === 'user' ? 'user' : 'model';
          contents.push({
            role,
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    // 2. Prepare user context and tutor directives
    let directiveHeader = '';
    const directives: string[] = [];

    if (explanationLevel) {
      const levelMap: Record<string, string> = {
        simple: '🌱 Super Simple (Explain like I am 10 with intuitive analogies and no heavy jargon)',
        school: '📚 School Level (Class 10 / High School syllabus depth with standard definitions and steps)',
        detailed: '🧠 Detailed (Deep conceptual dive with underlying mechanisms, formulas, and edge cases)',
        exam: '🎯 Exam Ready (Structured points, marked keywords, and scoring definitions)',
      };
      directives.push(`[Explanation Level: ${levelMap[explanationLevel] || explanationLevel}]`);
    }

    if (homeworkMode) {
      const modeMap: Record<string, string> = {
        teach: '🧑‍🏫 Teach Me (Explain the concept and method without immediately giving away the final answer)',
        hint: '💡 Give Me a Hint (Provide a strategic hint/clue to unblock the student so they can solve it independently)',
        solve: '🤝 Solve It With Me (Break into steps: explain Step 1 and ask the student to solve Step 2)',
        solution: '✅ Show Solution (Provide full step-by-step rigorous solution with explanations and common pitfalls)',
      };
      directives.push(`[Homework Mode: ${modeMap[homeworkMode] || homeworkMode}]`);
    }

    if (studySubject) {
      directives.push(`[Subject: ${studySubject}]`);
    }

    if (context && typeof context === 'object') {
      const details: string[] = [];
      if (context.mood) details.push(`User mood: ${context.mood}`);
      if (context.energy) details.push(`Energy: ${context.energy}/5`);
      if (context.availableTime) details.push(`Available time: ${context.availableTime}`);
      if (context.modes && Array.isArray(context.modes) && context.modes.length > 0) {
        details.push(`Modes: ${context.modes.join(', ')}`);
      }
      if (context.petType) details.push(`Companion: ${context.petType}`);

      if (details.length > 0) {
        directives.push(`[User Context: ${details.join(' | ')}. Note: Only factor this into your answer if the user asks for scheduling, energy-based planning, or personal emotional advice. Otherwise, focus directly on their academic question.]`);
      }
    }

    if (directives.length > 0) {
      directiveHeader = `${directives.join('\n')}\n\n`;
    }

    // 3. Current user turn parts
    const currentParts: any[] = [];
    const textPrompt = (directiveHeader + (message || '')).trim();
    if (textPrompt) {
      currentParts.push({ text: textPrompt });
    }

    if (image && typeof image === 'string') {
      const base64Match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (base64Match) {
        currentParts.push({
          inlineData: {
            mimeType: base64Match[1],
            data: base64Match[2],
          },
        });
      }
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    // Call Gemini API
    const rawResponse = await callGemini(contents, BLOOM_SYSTEM_INSTRUCTION, 0.7);
    const structured = parseAIResponse(rawResponse);

    res.json({
      success: true,
      ...structured,
    });
  } catch (error: any) {
    console.error('Bloom AI chat error:', error);
    res.status(500).json({
      success: false,
      error: "Bloom AI couldn't connect right now. Please try again.",
      reply: "Bloom AI couldn't connect right now. Please try again.",
      suggestedTasks: [],
      suggestedEvents: [],
      petNote: null,
      interactiveQuiz: null,
      interactiveFlashcards: null,
    });
  }
});

// 2. Planning with AI
app.post('/api/bloom/plan', async (req: Request, res: Response) => {
  try {
    const { mood = 'Okay', energy = 3, availableTime = '1–2 hours', tasks = [], mode = 'Student', goals = '' } = req.body;

    const prompt = `
Create a personalized, supportive, and realistic schedule plan for the user right now:
- User Mood: ${mood}
- Energy Level: ${energy}/5
- Available Time Today: ${availableTime}
- Focus Mode: ${mode}
- User Goals/Notes: ${goals || 'None specified'}
- Existing Pending Tasks: ${JSON.stringify(tasks.slice(0, 8))}

Guidelines:
- If energy is low (1 or 2) or mood is Overwhelmed/Tired, emphasize gentle micro-steps, hydration, and short sprints.
- If energy is high (4 or 5), provide structured deep focus blocks.
- End with a structured action suggestion JSON block for the user to review and approve:
\`\`\`json:suggested_actions
{
  "actionSummary": "I've structured a gentle plan based on your energy level.",
  "tasks": [
    { "title": "Example Step 1", "duration": "25m", "priority": "high", "category": "Study" }
  ],
  "events": [
    { "title": "Deep Focus Block", "type": "Study session", "date": "2026-09-30", "time": "14:00", "duration": 45 }
  ],
  "petNote": "Small steps make big progress! 🌸"
}
\`\`\`
`;

    const rawResponse = await callGemini(prompt, BLOOM_SYSTEM_INSTRUCTION, 0.6);
    const structured = parseAIResponse(rawResponse);

    res.json({
      success: true,
      ...structured,
    });
  } catch (error: any) {
    console.error('Bloom plan error:', error);
    res.status(500).json({
      success: false,
      error: "Bloom AI couldn't connect right now. Please try again.",
      reply: "Bloom AI couldn't connect right now. Please try again.",
      suggestedTasks: [],
      suggestedEvents: [],
    });
  }
});

// 3. Task Breakdown
app.post('/api/bloom/breakdown', async (req: Request, res: Response) => {
  try {
    const { taskTitle, details = '' } = req.body;

    if (!taskTitle) {
      res.status(400).json({ error: 'taskTitle is required' });
      return;
    }

    const prompt = `
Please break down the intimidating task into 3 to 5 clear, concrete, bite-sized steps (10-25 minutes each):
Task: "${taskTitle}"
Additional context: "${details}"

Provide an encouraging explanation, and end with the subtasks inside a structured action suggestion JSON block:
\`\`\`json:suggested_actions
{
  "actionSummary": "I broke down '${taskTitle}' into achievable steps for you.",
  "tasks": [
    { "title": "Step 1: ...", "duration": "15m", "priority": "high", "category": "Study" },
    { "title": "Step 2: ...", "duration": "20m", "priority": "medium", "category": "Study" }
  ],
  "petNote": "Once we break it down, it's so much easier to tackle! 🐾"
}
\`\`\`
`;

    const rawResponse = await callGemini(prompt, BLOOM_SYSTEM_INSTRUCTION, 0.5);
    const structured = parseAIResponse(rawResponse);

    res.json({
      success: true,
      ...structured,
    });
  } catch (error: any) {
    console.error('Bloom breakdown error:', error);
    res.status(500).json({
      success: false,
      error: "Bloom AI couldn't connect right now. Please try again.",
      reply: "Bloom AI couldn't connect right now. Please try again.",
      suggestedTasks: [],
    });
  }
});

// 4. Study Helper (Summary, Explanation, Flashcards, Quiz, Revision)
app.post('/api/bloom/study', async (req: Request, res: Response) => {
  try {
    const { actionType, content, topic, level = 'school' } = req.body;
    const subject = topic || content || 'General Study';

    let prompt = '';
    if (actionType === 'summary') {
      prompt = `Summarize the following text or topic into key takeaways, core mechanisms, important formulas/definitions, and memorable bullet points:\n\n${content || topic}`;
    } else if (actionType === 'explain') {
      prompt = `Explain the concept "${subject}" clearly. Explanation Level: ${level}.
If level is simple: use vivid intuitive analogies, simple words as if explaining to a 10-year-old.
If level is exam: use structured headings, keywords, definitions, and exam-ready bullet points.
If level is detailed: provide deep mechanistic breakdown, edge cases, and examples.
Otherwise: provide clear school-level textbook clarity.`;
    } else if (actionType === 'flashcards') {
      prompt = `Generate 5 high-yield study flashcards for "${subject}". Output ONLY a valid JSON array of objects with "front" (question/term) and "back" (answer/definition).
Example format:
[
  { "front": "Term 1", "back": "Definition 1" }
]`;
    } else if (actionType === 'quiz') {
      prompt = `Generate 4 multiple-choice quiz questions for "${subject}". Output ONLY a valid JSON array of objects with properties: "question" (string), "options" (array of 4 strings), "correctIndex" (integer 0-3), and "explanation" (string).
Example format:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Because..."
  }
]`;
    } else {
      prompt = `Create a realistic 5-day revision plan for "${subject}". Include spaced repetition sessions, active recall tasks, and rest breaks.`;
    }

    const rawResponse = await callGemini(prompt, 'You are an expert, encouraging study coach and tutor. Keep responses accurate, clear, and well-structured.', 0.6);

    // Clean markdown code blocks if expecting JSON for flashcards or quiz
    let outputText = rawResponse;
    if (actionType === 'flashcards' || actionType === 'quiz') {
      const codeBlockMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        outputText = codeBlockMatch[1].trim();
      }
    }

    res.json({
      success: true,
      text: outputText,
    });
  } catch (error: any) {
    console.error('Bloom study error:', error);
    res.status(500).json({
      success: false,
      error: "Bloom AI couldn't connect right now. Please try again.",
      text: "Bloom AI couldn't connect right now. Please try again.",
    });
  }
});

// Document Vault Server-Side Storage
const DOCUMENTS_STORAGE_DIR = path.join(__dirname, 'data', 'documents');
try {
  if (!fs.existsSync(DOCUMENTS_STORAGE_DIR)) {
    fs.mkdirSync(DOCUMENTS_STORAGE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not initialize documents directory:', e);
}

// Save document to server storage
app.post('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fileName, mimeType, dataUrl, base64 } = req.body;

    if (!id || (!dataUrl && !base64)) {
      res.status(400).json({ error: 'Missing document id or file data.' });
      return;
    }

    let rawBase64 = base64;
    let detectedMime = mimeType || 'application/octet-stream';

    if (dataUrl && dataUrl.startsWith('data:')) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        rawBase64 = match[2];
      }
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    const filePath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.bin`);
    const metaPath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.meta.json`);

    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(
      metaPath,
      JSON.stringify(
        {
          id,
          fileName: fileName || `${id}.bin`,
          mimeType: detectedMime,
          size: buffer.length,
          uploadedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    res.json({
      success: true,
      id,
      size: buffer.length,
      mimeType: detectedMime,
    });
  } catch (error: any) {
    console.error('Error saving document to server storage:', error);
    res.status(500).json({ error: 'Failed to save document to server storage.' });
  }
});

// Retrieve document from server storage
app.get('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const filePath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.bin`);
    const metaPath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.meta.json`);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Document not found on server.' });
      return;
    }

    let meta = { fileName: `${id}.bin`, mimeType: 'application/octet-stream' };
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        console.warn('Could not read document meta:', e);
      }
    }

    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    const disposition = isDownload ? 'attachment' : 'inline';
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(meta.fileName)}"`
    );
    res.sendFile(filePath);
  } catch (error: any) {
    console.error('Error retrieving document from server storage:', error);
    res.status(500).json({ error: 'Failed to retrieve document.' });
  }
});

// Delete document from server storage
app.delete('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.bin`);
    const metaPath = path.join(DOCUMENTS_STORAGE_DIR, `${id}.meta.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(metaPath)) {
      fs.unlinkSync(metaPath);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document from server storage:', error);
    res.status(500).json({ error: 'Failed to delete document from server storage.' });
  }
});

// Full-Stack Server configuration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌷 BLOOM full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
