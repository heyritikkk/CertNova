import { newBlockId } from './contentBlocks';

export const SUGGESTED_QUIZ_SIZE = 5;

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function normalizeSuggestedQuiz(raw) {
  if (!raw) return null;
  const list = Array.isArray(raw) ? raw : raw.questions;
  if (!Array.isArray(list) || list.length < 1) return null;

  const questions = list
    .map((q, i) => {
      const options = (q.options || [])
        .map((o) => String(o || '').trim())
        .filter(Boolean)
        .slice(0, 4);
      while (options.length < 4) {
        options.push(`Option ${OPTION_LETTERS[options.length]}`);
      }
      const question = String(q.question || '').trim();
      if (!question) return null;
      const correctIndex = Number.isFinite(q.correctIndex)
        ? Math.min(Math.max(0, q.correctIndex), 3)
        : 0;
      return {
        id: q.id || `sq-${i}`,
        question,
        options,
        correctIndex,
        explanation: String(q.explanation || '').trim(),
      };
    })
    .filter(Boolean);

  return questions.length ? questions : null;
}

/** Placeholder 5-question quiz when none is stored on the lesson block. */
export function buildPlaceholderSuggestedQuiz(block) {
  const topic =
    block?.navTitle?.trim() ||
    block?.sectionTitle?.trim() ||
    'this topic';

  const templates = [
    {
      question: `What is the primary learning goal of "${topic}"?`,
      options: [
        'Understand core concepts and how they apply in practice',
        'Memorize unrelated historical dates only',
        'Skip risk assessment entirely',
        'Disable all logging and monitoring',
      ],
      correctIndex: 0,
      explanation:
        'Each sub-lesson focuses on practical security concepts you can apply on the job.',
    },
    {
      question: `Which activity best reinforces what you learned in "${topic}"?`,
      options: [
        'Hands-on lab or scenario walkthrough',
        'Ignoring vendor documentation',
        'Sharing admin passwords in chat',
        'Disabling encryption to save time',
      ],
      correctIndex: 0,
      explanation: 'Scenario-based practice helps transfer knowledge into real defenses.',
    },
    {
      question: 'In the CIA triad, which pillar ensures data is not altered without detection?',
      options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
      correctIndex: 1,
      explanation: 'Integrity covers tamper detection via hashing, signatures, and controls.',
    },
    {
      question: 'What is a sound first step when you observe suspicious network traffic?',
      options: [
        'Document, isolate if needed, and escalate per playbook',
        'Delete all logs immediately',
        'Pay the ransom without telling anyone',
        'Post credentials on social media for help',
      ],
      correctIndex: 0,
      explanation: 'Follow incident response basics: contain, preserve evidence, notify stakeholders.',
    },
    {
      question: `How should you use this "${topic}" lesson in a certification path?`,
      options: [
        'Review notes, attempt this quiz, then move to the next sub-lesson',
        'Skip quizzes and only read headlines',
        'Assume one lesson replaces all practice exams',
        'Turn off every security control to test speed',
      ],
      correctIndex: 0,
      explanation: 'Combine lesson study with quizzes and hands-on labs for best retention.',
    },
  ];

  return templates.map((t, i) => ({
    id: `sq-placeholder-${i}`,
    ...t,
  }));
}

export function getSuggestedQuizForBlock(block) {
  const stored = normalizeSuggestedQuiz(block?.suggestedQuiz);
  if (stored?.length >= SUGGESTED_QUIZ_SIZE) {
    return stored.slice(0, SUGGESTED_QUIZ_SIZE);
  }
  if (stored?.length) {
    const base = buildPlaceholderSuggestedQuiz(block);
    return [...stored, ...base].slice(0, SUGGESTED_QUIZ_SIZE);
  }
  return buildPlaceholderSuggestedQuiz(block);
}

export function createEmptySuggestedQuestion() {
  return {
    id: newBlockId(),
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  };
}

export function createDefaultSuggestedQuiz() {
  return Array.from({ length: SUGGESTED_QUIZ_SIZE }, () => createEmptySuggestedQuestion());
}
