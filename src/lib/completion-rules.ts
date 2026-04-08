// Unified completion rules for the learning platform
import { Block, BlockType, Page, Chapter, Course, MicroQuizBlockContent } from './demo-data';

// Block completion rules by type
export type CompletionMethod = 'viewed' | 'answered' | 'correct_order' | 'submitted' | 'passed' | 'not_counted';

export interface BlockCompletionRule {
  type: BlockType;
  method: CompletionMethod;
  label: string;
  description: string;
  countsTowardsCompletion: boolean;
  supportsPassMark?: boolean;
}

export const blockCompletionRules: Record<BlockType, BlockCompletionRule> = {
  'text': {
    type: 'text',
    method: 'viewed',
    label: 'View content',
    description: 'Complete when viewed',
    countsTowardsCompletion: true,
  },
  'video': {
    type: 'video',
    method: 'viewed',
    label: 'Watch video',
    description: 'Complete when watch threshold met',
    countsTowardsCompletion: true,
  },
  'image': {
    type: 'image',
    method: 'viewed',
    label: 'View image',
    description: 'Complete when viewed',
    countsTowardsCompletion: true,
  },
  'resource': {
    type: 'resource',
    method: 'viewed',
    label: 'Access resource',
    description: 'Complete when opened',
    countsTowardsCompletion: true,
  },
  'divider': {
    type: 'divider',
    method: 'not_counted',
    label: 'Visual only',
    description: 'No completion required',
    countsTowardsCompletion: false,
  },
  'micro-quiz': {
    type: 'micro-quiz',
    method: 'answered',
    label: 'Answer quiz',
    description: 'Complete when answered or passed',
    countsTowardsCompletion: true,
    supportsPassMark: true,
  },
  'drag-drop-reorder': {
    type: 'drag-drop-reorder',
    method: 'correct_order',
    label: 'Correct order',
    description: 'Complete when correct order achieved',
    countsTowardsCompletion: true,
    supportsPassMark: true,
  },
  'whiteboard': {
    type: 'whiteboard',
    method: 'submitted',
    label: 'Submit work',
    description: 'Complete when submission exists',
    countsTowardsCompletion: true,
  },
  'reflection': {
    type: 'reflection',
    method: 'submitted',
    label: 'Submit reflection',
    description: 'Complete when submitted',
    countsTowardsCompletion: true,
  },
  'qa-thread': {
    type: 'qa-thread',
    method: 'not_counted',
    label: 'Optional',
    description: 'Not counted towards completion',
    countsTowardsCompletion: false,
  },
  'gap-fill': {
    type: 'gap-fill',
    method: 'answered',
    label: 'Fill blanks',
    description: 'Complete when blanks are filled correctly',
    countsTowardsCompletion: true,
    supportsPassMark: true,
  },
  'poll': {
    type: 'poll',
    method: 'answered',
    label: 'Vote',
    description: 'Complete when voted',
    countsTowardsCompletion: true,
  },
  'reveal': {
    type: 'reveal',
    method: 'viewed',
    label: 'View content',
    description: 'Complete when all sections revealed',
    countsTowardsCompletion: true,
  },
  'file-upload': {
    type: 'file-upload',
    method: 'submitted',
    label: 'Upload file',
    description: 'Complete when file uploaded',
    countsTowardsCompletion: true,
  },
};

// Student progress tracking for a block
export interface BlockProgress {
  blockId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  score?: number;
  maxScore?: number;
  lastAttemptAt?: string;
  completedAt?: string;
  responses?: any; // Block-specific response data
  watchedPercentage?: number; // For video blocks
}

// Get completion rule for a block type
export function getBlockCompletionRule(type: BlockType): BlockCompletionRule {
  return blockCompletionRules[type];
}

// Check if a block is complete based on its type, state, and progress
export function isBlockComplete(block: Block, progress?: BlockProgress): boolean {
  const rule = getBlockCompletionRule(block.type);
  
  // Blocks that don't count are always "complete" for calculation purposes
  if (!rule.countsTowardsCompletion) {
    return true;
  }
  
  // If we have progress data, use it
  if (progress) {
    return progress.status === 'completed';
  }
  
  // For demo purposes, we rely on the isCompleted flag
  return block.isCompleted;
}

// Check if a quiz attempt passes based on content settings
export function checkQuizPassed(
  block: Block,
  answers: Record<string, number | number[] | string>,
  questions: any[]
): { passed: boolean; score: number; maxScore: number } {
  const content = block.content as MicroQuizBlockContent;
  const passMark = content.passMark || 0;
  const completionRule = content.completionRule || 'attempted';
  
  let correct = 0;
  let total = questions.length;
  
  if (total === 0) {
    return { passed: true, score: 100, maxScore: 100 };
  }
  
  questions.forEach((q) => {
    const userAnswer = answers[q.id];
    const correctAnswer = q.correctAnswer;
    
    if (q.type === 'multi-select') {
      // For multi-select, compare arrays (sort copies to avoid mutation)
      const userArr = Array.isArray(userAnswer) ? [...userAnswer].sort((a, b) => a - b) : [];
      const correctArr = Array.isArray(correctAnswer) ? [...correctAnswer].sort((a, b) => a - b) : [];
      if (JSON.stringify(userArr) === JSON.stringify(correctArr)) {
        correct++;
      }
    } else if (q.type === 'short-answer') {
      // For short-answer, compare text
      const userText = typeof userAnswer === 'string' ? userAnswer.trim() : '';
      const expectedText = (q.correctAnswerText || q.options?.[0] || '').trim();
      const caseSensitive = q.caseSensitive === true;
      
      if (caseSensitive) {
        if (userText === expectedText) correct++;
      } else {
        if (userText.toLowerCase() === expectedText.toLowerCase()) correct++;
      }
    } else {
      // For single choice, true/false - compare as numbers
      const userNum = typeof userAnswer === 'number' ? userAnswer : parseInt(String(userAnswer), 10);
      const correctNum = typeof correctAnswer === 'number' ? correctAnswer : parseInt(String(correctAnswer), 10);
      
      if (!isNaN(userNum) && !isNaN(correctNum) && userNum === correctNum) {
        correct++;
      }
    }
  });
  
  const score = total > 0 ? Math.round((correct / total) * 100) : 100;
  const passed = completionRule === 'attempted' || score >= passMark;
  
  return { passed, score, maxScore: 100 };
}

// Check if a reorder attempt is correct
export function checkReorderCorrect(
  block: Block,
  userOrder: number[]
): { correct: boolean; score: number; maxScore: number } {
  const content = block.content;
  const correctOrder = content.correctOrder || [];
  const scoringMode = content.scoringMode || 'all-or-nothing';
  
  if (scoringMode === 'all-or-nothing') {
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    return { correct: isCorrect, score: isCorrect ? 100 : 0, maxScore: 100 };
  } else {
    // Partial credit - count correct positions
    let correctCount = 0;
    const total = correctOrder.length;
    
    userOrder.forEach((item, index) => {
      if (correctOrder[index] === item) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / total) * 100);
    return { correct: score === 100, score, maxScore: 100 };
  }
}

// Calculate page completion percentage and status
export interface PageCompletionStatus {
  completedBlocks: number;
  requiredBlocks: number;
  totalBlocks: number;
  percentage: number;
  isComplete: boolean;
}

export function calculatePageCompletion(blocks: Block[]): PageCompletionStatus {
  // Filter out blocks that don't count towards completion
  const countableBlocks = blocks.filter(b => {
    const rule = getBlockCompletionRule(b.type);
    return rule.countsTowardsCompletion;
  });
  
  // For required blocks
  const requiredBlocks = countableBlocks.filter(b => b.isRequired);
  const completedRequiredBlocks = requiredBlocks.filter(b => isBlockComplete(b));
  
  // All countable blocks for percentage
  const completedBlocks = countableBlocks.filter(b => isBlockComplete(b));
  
  const percentage = countableBlocks.length > 0 
    ? Math.round((completedBlocks.length / countableBlocks.length) * 100)
    : 100;
  
  // Page is complete when all REQUIRED blocks are complete
  const isComplete = requiredBlocks.length === 0 || 
    completedRequiredBlocks.length === requiredBlocks.length;
  
  return {
    completedBlocks: completedBlocks.length,
    requiredBlocks: requiredBlocks.length,
    totalBlocks: countableBlocks.length,
    percentage,
    isComplete,
  };
}

// Calculate chapter completion
export interface ChapterCompletionStatus {
  completedPages: number;
  totalPages: number;
  percentage: number;
  isComplete: boolean;
}

export function calculateChapterCompletion(pages: Page[], blocks: Block[]): ChapterCompletionStatus {
  if (pages.length === 0) {
    return { completedPages: 0, totalPages: 0, percentage: 100, isComplete: true };
  }
  
  let completedPages = 0;
  
  pages.forEach(page => {
    const pageBlocks = blocks.filter(b => b.pageId === page.id);
    const pageCompletion = calculatePageCompletion(pageBlocks);
    if (pageCompletion.isComplete) {
      completedPages++;
    }
  });
  
  const percentage = Math.round((completedPages / pages.length) * 100);
  const isComplete = completedPages === pages.length;
  
  return {
    completedPages,
    totalPages: pages.length,
    percentage,
    isComplete,
  };
}

// Calculate course completion
export interface CourseCompletionStatus {
  completedChapters: number;
  totalChapters: number;
  percentage: number;
  isComplete: boolean;
}

export function calculateCourseCompletion(
  chapters: Chapter[], 
  pages: Page[], 
  blocks: Block[]
): CourseCompletionStatus {
  if (chapters.length === 0) {
    return { completedChapters: 0, totalChapters: 0, percentage: 100, isComplete: true };
  }
  
  let completedChapters = 0;
  
  chapters.forEach(chapter => {
    const chapterPages = pages.filter(p => p.chapterId === chapter.id);
    const chapterCompletion = calculateChapterCompletion(chapterPages, blocks);
    if (chapterCompletion.isComplete) {
      completedChapters++;
    }
  });
  
  const percentage = Math.round((completedChapters / chapters.length) * 100);
  const isComplete = completedChapters === chapters.length;
  
  return {
    completedChapters,
    totalChapters: chapters.length,
    percentage,
    isComplete,
  };
}

// Get human-readable completion summary for a page
export function getPageCompletionSummary(blocks: Block[]): string {
  const countableBlocks = blocks.filter(b => {
    const rule = getBlockCompletionRule(b.type);
    return rule.countsTowardsCompletion;
  });
  
  const requiredBlocks = countableBlocks.filter(b => b.isRequired);
  
  if (requiredBlocks.length === 0) {
    if (countableBlocks.length === 0) {
      return 'No completion requirements';
    }
    return 'View all content to complete';
  }
  
  // Group required blocks by type for summary
  const typeGroups: Record<string, number> = {};
  requiredBlocks.forEach(block => {
    const rule = getBlockCompletionRule(block.type);
    const key = rule.label;
    typeGroups[key] = (typeGroups[key] || 0) + 1;
  });
  
  const parts = Object.entries(typeGroups).map(([label, count]) => {
    return count > 1 ? `${count} × ${label}` : label;
  });
  
  return parts.join(', ');
}
