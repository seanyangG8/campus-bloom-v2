import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Chapter, Page, Block, BlockType, demoChapters, demoPages, demoBlocks } from '@/lib/demo-data';
import { BlockProgress, checkQuizPassed, checkReorderCorrect } from '@/lib/completion-rules';
import { toast } from 'sonner';

interface CourseBuilderContextType {
  // Data
  chapters: Chapter[];
  pages: Page[];
  blocks: Block[];
  selectedPageId: string | null;
  selectedBlockId: string | null;
  
  // Student Progress
  studentProgress: Map<string, BlockProgress>;
  
  // Selection
  setSelectedPageId: (id: string | null) => void;
  setSelectedBlockId: (id: string | null) => void;
  
  // Chapter CRUD
  addChapter: (courseId: string, title: string) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  reorderChapters: (courseId: string, orderedIds: string[]) => void;
  
  // Page CRUD
  addPage: (chapterId: string, title: string) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  reorderPages: (chapterId: string, orderedIds: string[]) => void;
  
  // Block CRUD
  addBlock: (pageId: string, type: BlockType, title?: string, insertAtIndex?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (pageId: string, orderedIds: string[]) => void;
  duplicateBlock: (id: string) => void;
  
  // Student Progress Actions
  markBlockViewed: (blockId: string) => void;
  submitQuizAnswer: (blockId: string, answers: Record<string, number | number[] | string>) => { passed: boolean; score: number };
  submitReorderAttempt: (blockId: string, userOrder: number[]) => { correct: boolean; score: number };
  submitWhiteboardWork: (blockId: string, data: any) => void;
  submitReflection: (blockId: string, text: string) => void;
  submitGapFill: (blockId: string, answers: Record<string, string>) => { score: number; passed: boolean; correctCount: number; totalBlanks: number };
  submitFileUpload: (blockId: string, files: { name: string; size: number; type: string }[]) => void;
  submitPollVote: (blockId: string, choices: number[]) => void;
  updateVideoProgress: (blockId: string, watchedPercentage: number) => void;
  getBlockProgress: (blockId: string) => BlockProgress | undefined;
  resetBlockProgress: (blockId: string) => void;
  
  // Page helpers
  getPagesByChapter: (chapterId: string) => Page[];
  getBlocksByPage: (pageId: string) => Block[];
  getChaptersByCourse: (courseId: string) => Chapter[];
}

const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function CourseBuilderProvider({ children, courseId }: { children: ReactNode; courseId: string }) {
  const [chapters, setChapters] = useState<Chapter[]>(
    demoChapters.filter(c => c.courseId === courseId)
  );
  const [pages, setPages] = useState<Page[]>(demoPages);
  const [blocks, setBlocks] = useState<Block[]>(demoBlocks);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<Map<string, BlockProgress>>(new Map());

  // Chapter operations
  const addChapter = useCallback((courseId: string, title: string) => {
    const newChapter: Chapter = {
      id: generateId('ch'),
      courseId,
      title,
      order: chapters.filter(c => c.courseId === courseId).length + 1,
      pagesCount: 0,
      isLocked: false,
    };
    setChapters(prev => [...prev, newChapter]);
    toast.success('Chapter added');
  }, [chapters]);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    setChapters(prev => prev.map(ch => 
      ch.id === id ? { ...ch, ...updates } : ch
    ));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    // Also delete all pages and blocks in this chapter
    const chapterPages = pages.filter(p => p.chapterId === id);
    const pageIds = chapterPages.map(p => p.id);
    
    setBlocks(prev => prev.filter(b => !pageIds.includes(b.pageId)));
    setPages(prev => prev.filter(p => p.chapterId !== id));
    setChapters(prev => prev.filter(ch => ch.id !== id));
    
    if (selectedPageId && pageIds.includes(selectedPageId)) {
      setSelectedPageId(null);
    }
    toast.success('Chapter deleted');
  }, [pages, selectedPageId]);

  const reorderChapters = useCallback((courseId: string, orderedIds: string[]) => {
    setChapters(prev => {
      const courseChapters = prev.filter(c => c.courseId === courseId);
      const otherChapters = prev.filter(c => c.courseId !== courseId);
      
      const reordered = orderedIds.map((id, index) => {
        const chapter = courseChapters.find(c => c.id === id);
        return chapter ? { ...chapter, order: index + 1 } : null;
      }).filter(Boolean) as Chapter[];
      
      return [...otherChapters, ...reordered];
    });
  }, []);

  // Page operations
  const addPage = useCallback((chapterId: string, title: string) => {
    const chapterPages = pages.filter(p => p.chapterId === chapterId);
    const newPage: Page = {
      id: generateId('pg'),
      chapterId,
      title,
      order: chapterPages.length + 1,
      blocksCount: 0,
      isRequired: true,
      isCompleted: false,
      isLocked: false,
    };
    setPages(prev => [...prev, newPage]);
    
    // Update chapter page count
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, pagesCount: ch.pagesCount + 1 } : ch
    ));
    
    toast.success('Page added');
    return newPage.id;
  }, [pages]);

  const updatePage = useCallback((id: string, updates: Partial<Page>) => {
    setPages(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deletePage = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    
    // Delete all blocks in this page
    setBlocks(prev => prev.filter(b => b.pageId !== id));
    setPages(prev => prev.filter(p => p.id !== id));
    
    // Update chapter page count
    setChapters(prev => prev.map(ch => 
      ch.id === page.chapterId ? { ...ch, pagesCount: Math.max(0, ch.pagesCount - 1) } : ch
    ));
    
    if (selectedPageId === id) {
      setSelectedPageId(null);
    }
    toast.success('Page deleted');
  }, [pages, selectedPageId]);

  const reorderPages = useCallback((chapterId: string, orderedIds: string[]) => {
    setPages(prev => {
      const chapterPages = prev.filter(p => p.chapterId === chapterId);
      const otherPages = prev.filter(p => p.chapterId !== chapterId);
      
      const reordered = orderedIds.map((id, index) => {
        const page = chapterPages.find(p => p.id === id);
        return page ? { ...page, order: index + 1 } : null;
      }).filter(Boolean) as Page[];
      
      return [...otherPages, ...reordered];
    });
  }, []);

  // Block operations
  const addBlock = useCallback((pageId: string, type: BlockType, title?: string, insertAtIndex?: number) => {
    const pageBlocks = blocks.filter(b => b.pageId === pageId).sort((a, b) => a.order - b.order);
    const blockLabel: Record<BlockType, string> = {
      'text': 'Text Block',
      'video': 'Video',
      'image': 'Image',
      'micro-quiz': 'Micro-Quiz',
      'drag-drop-reorder': 'Reorder Activity',
      'whiteboard': 'Whiteboard Activity',
      'reflection': 'Reflection',
      'qa-thread': 'Q&A Thread',
      'resource': 'Resource',
      'divider': 'Divider',
      'gap-fill': 'Gap Fill',
      'poll': 'Poll',
      'reveal': 'Reveal',
      'file-upload': 'File Upload',
    };
    
    const newBlock: Block = {
      id: generateId('blk'),
      pageId,
      type,
      title: title || blockLabel[type] || 'New Block',
      content: getDefaultContent(type),
      order: insertAtIndex !== undefined ? insertAtIndex + 1 : pageBlocks.length + 1,
      isRequired: false,
      isCompleted: false,
    };
    
    // If inserting at a specific index, update orders of existing blocks
    if (insertAtIndex !== undefined && insertAtIndex < pageBlocks.length) {
      setBlocks(prev => {
        const otherBlocks = prev.filter(b => b.pageId !== pageId);
        const updatedPageBlocks = pageBlocks.map((b, i) => ({
          ...b,
          order: i >= insertAtIndex ? b.order + 1 : b.order
        }));
        return [...otherBlocks, ...updatedPageBlocks, newBlock];
      });
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }
    
    // Update page block count
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, blocksCount: p.blocksCount + 1 } : p
    ));
    
    toast.success(`${blockLabel[type]} added`);
    return newBlock.id;
  }, [blocks]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    setBlocks(prev => prev.filter(b => b.id !== id));
    
    // Update page block count
    setPages(prev => prev.map(p => 
      p.id === block.pageId ? { ...p, blocksCount: Math.max(0, p.blocksCount - 1) } : p
    ));
    
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Block deleted');
  }, [blocks, selectedBlockId]);

  const reorderBlocks = useCallback((pageId: string, orderedIds: string[]) => {
    setBlocks(prev => {
      const pageBlocks = prev.filter(b => b.pageId === pageId);
      const otherBlocks = prev.filter(b => b.pageId !== pageId);
      
      const reordered = orderedIds.map((id, index) => {
        const block = pageBlocks.find(b => b.id === id);
        return block ? { ...block, order: index + 1 } : null;
      }).filter(Boolean) as Block[];
      
      return [...otherBlocks, ...reordered];
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    const newBlock: Block = {
      ...block,
      id: generateId('blk'),
      title: `${block.title} (Copy)`,
      order: blocks.filter(b => b.pageId === block.pageId).length + 1,
      isCompleted: false,
    };
    
    setBlocks(prev => [...prev, newBlock]);
    
    // Update page block count
    setPages(prev => prev.map(p => 
      p.id === block.pageId ? { ...p, blocksCount: p.blocksCount + 1 } : p
    ));
    
    toast.success('Block duplicated');
  }, [blocks]);

  // Student Progress Actions
  const markBlockViewed = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      
      // For video blocks, check watch threshold
      if (block.type === 'video') {
        const threshold = block.content?.watchThreshold || 80;
        const watched = existing?.watchedPercentage || 0;
        if (watched >= threshold) {
          newMap.set(blockId, {
            ...existing,
            blockId,
            status: 'completed',
            attempts: (existing?.attempts || 0),
            completedAt: new Date().toISOString(),
          });
        }
      } else {
        // For other viewable blocks, mark complete immediately
        newMap.set(blockId, {
          blockId,
          status: 'completed',
          attempts: 1,
          completedAt: new Date().toISOString(),
        });
      }
      return newMap;
    });
  }, [blocks]);

  const submitQuizAnswer = useCallback((blockId: string, answers: Record<string, number | number[] | string>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { passed: false, score: 0 };
    
    const questions = block.content?.questions || [];
    const result = checkQuizPassed(block, answers, questions);
    
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: result.passed ? 'completed' : 'in_progress',
        attempts: (existing?.attempts || 0) + 1,
        score: result.score,
        maxScore: result.maxScore,
        lastAttemptAt: new Date().toISOString(),
        completedAt: result.passed ? new Date().toISOString() : undefined,
        responses: answers,
      });
      return newMap;
    });
    
    return result;
  }, [blocks]);

  const submitReorderAttempt = useCallback((blockId: string, userOrder: number[]) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { correct: false, score: 0 };
    
    const result = checkReorderCorrect(block, userOrder);
    
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: result.correct ? 'completed' : 'in_progress',
        attempts: (existing?.attempts || 0) + 1,
        score: result.score,
        maxScore: result.maxScore,
        lastAttemptAt: new Date().toISOString(),
        completedAt: result.correct ? new Date().toISOString() : undefined,
        responses: userOrder,
      });
      return newMap;
    });
    
    return result;
  }, [blocks]);

  const submitWhiteboardWork = useCallback((blockId: string, data: any) => {
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: 'completed',
        attempts: (existing?.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        responses: data,
      });
      return newMap;
    });
  }, []);

  const submitReflection = useCallback((blockId: string, text: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const minWords = block.content?.minWords || 0;
    const mustSubmit = block.content?.mustSubmitToComplete !== false; // default true
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const meetsMinimum = wordCount >= minWords;
    // If submission is not required to complete, ANY submit completes; otherwise it must meet min words.
    const isComplete = mustSubmit ? meetsMinimum : true;
    
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: isComplete ? 'completed' : 'in_progress',
        attempts: (existing?.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        completedAt: isComplete ? new Date().toISOString() : undefined,
        responses: { text, wordCount },
      });
      return newMap;
    });
  }, [blocks]);

  // Gap-fill submission with proper scoring + pass-mark gating
  const submitGapFill = useCallback((blockId: string, answers: Record<string, string>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { score: 0, passed: false, correctCount: 0, totalBlanks: 0 };

    const sentences = block.content?.sentences || [];
    const allBlanks = sentences.flatMap((s: any) => s.blanks || []);
    const totalBlanks = allBlanks.length;
    const passMark = block.content?.passMark ?? 70;
    const scoringMode = block.content?.scoringMode || 'partial-credit';

    let correctCount = 0;
    allBlanks.forEach((blank: any) => {
      const userAnswer = (answers[blank.id] || '').trim();
      const caseSensitive = blank.caseSensitive || false;
      const matches = (blank.acceptedAnswers || []).some((a: string) => {
        const expected = (a || '').trim();
        return caseSensitive ? expected === userAnswer : expected.toLowerCase() === userAnswer.toLowerCase();
      });
      if (matches && userAnswer.length > 0) correctCount++;
    });

    const score = totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) : 100;
    const passed = scoringMode === 'all-or-nothing' ? correctCount === totalBlanks : score >= passMark;

    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: passed ? 'completed' : 'in_progress',
        attempts: (existing?.attempts || 0) + 1,
        score,
        maxScore: 100,
        lastAttemptAt: new Date().toISOString(),
        completedAt: passed ? new Date().toISOString() : undefined,
        responses: answers,
      });
      return newMap;
    });

    return { score, passed, correctCount, totalBlanks };
  }, [blocks]);

  // File upload submission — completes when at least one file is submitted
  const submitFileUpload = useCallback((blockId: string, files: { name: string; size: number; type: string }[]) => {
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: files.length > 0 ? 'completed' : 'in_progress',
        attempts: (existing?.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        completedAt: files.length > 0 ? new Date().toISOString() : undefined,
        responses: { files },
      });
      return newMap;
    });
  }, []);

  // Poll vote — voting completes the block
  const submitPollVote = useCallback((blockId: string, choices: number[]) => {
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: 'completed',
        attempts: (existing?.attempts || 0) + 1,
        lastAttemptAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        responses: { choices },
      });
      return newMap;
    });
  }, []);

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const threshold = block.content?.watchThreshold || 80;
    const isComplete = watchedPercentage >= threshold;
    
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(blockId);
      newMap.set(blockId, {
        blockId,
        status: isComplete ? 'completed' : 'in_progress',
        attempts: existing?.attempts || 1,
        watchedPercentage,
        completedAt: isComplete ? new Date().toISOString() : undefined,
      });
      return newMap;
    });
  }, [blocks]);

  const getBlockProgress = useCallback((blockId: string) => {
    return studentProgress.get(blockId);
  }, [studentProgress]);

  const resetBlockProgress = useCallback((blockId: string) => {
    setStudentProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(blockId);
      return newMap;
    });
  }, []);

  // Helpers
  const getPagesByChapter = useCallback((chapterId: string) => {
    return pages
      .filter(p => p.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  }, [pages]);

  const getBlocksByPage = useCallback((pageId: string) => {
    return blocks
      .filter(b => b.pageId === pageId)
      .sort((a, b) => a.order - b.order);
  }, [blocks]);

  const getChaptersByCourse = useCallback((courseId: string) => {
    return chapters
      .filter(c => c.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }, [chapters]);

  return (
    <CourseBuilderContext.Provider
      value={{
        chapters,
        pages,
        blocks,
        selectedPageId,
        selectedBlockId,
        studentProgress,
        setSelectedPageId,
        setSelectedBlockId,
        addChapter,
        updateChapter,
        deleteChapter,
        reorderChapters,
        addPage,
        updatePage,
        deletePage,
        reorderPages,
        addBlock,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        duplicateBlock,
        markBlockViewed,
        submitQuizAnswer,
        submitReorderAttempt,
        submitWhiteboardWork,
        submitReflection,
        updateVideoProgress,
        getBlockProgress,
        resetBlockProgress,
        getPagesByChapter,
        getBlocksByPage,
        getChaptersByCourse,
      }}
    >
      {children}
    </CourseBuilderContext.Provider>
  );
}

export function useCourseBuilder() {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within CourseBuilderProvider');
  }
  return context;
}

// Helper to get default content for different block types — every default is complete so new blocks work without configuration.
function getDefaultContent(type: BlockType): any {
  switch (type) {
    case 'text':
      return { html: '<p>Enter your content here...</p>', calloutStyle: 'none' };
    case 'video':
      return { url: '', duration: '', watchThreshold: 80, chapters: [], allowDownload: false };
    case 'image':
      return { url: '', alt: '', caption: '', displaySize: 'large', galleryMode: false, images: [] };
    case 'micro-quiz':
      return {
        questions: [
          {
            id: generateId('q'),
            type: 'single-choice',
            question: 'Enter your question here',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            hint: '',
            explanation: '',
            points: 1,
          },
        ],
        passMark: 70,
        completionRule: 'attempted',
        shuffleQuestions: false,
        shuffleAnswers: false,
        showCorrectAfterAttempt: true,
        showOneAtATime: false,
        timeLimit: 0,
      };
    case 'drag-drop-reorder':
      return {
        instruction: 'Drag and drop to reorder the steps:',
        items: ['Step 1', 'Step 2', 'Step 3'],
        correctOrder: [0, 1, 2],
        scoringMode: 'all-or-nothing',
        showCorrectOrderAfter: true,
        distractorItems: [],
        explanation: '',
      };
    case 'whiteboard':
      return {
        prompt: 'Show your work here:',
        canvasSize: 'a4',
        background: 'blank',
        enabledTools: { pen: true, highlighter: true, eraser: true, shapes: true, text: true, undo: true },
        allowImage: true,
        multiPage: false,
        rubric: '',
      };
    case 'reflection':
      return {
        prompt: 'Reflect on what you learned:',
        minWords: 50,
        privacyMode: 'private',
        mustSubmitToComplete: true,
        allowPeerComments: false,
        exampleResponse: '',
        rubric: '',
      };
    case 'qa-thread':
      return {
        whoCanPost: 'students-only',
        anonymity: 'off',
        allowAttachments: false,
        moderationEnabled: true,
        categories: [],
      };
    case 'resource':
      return {
        resourceType: 'file',
        url: '',
        fileName: '',
        fileSize: '',
        fileType: 'pdf',
        mustOpenToComplete: false,
        openInNewTab: true,
      };
    case 'divider':
      return { style: 'line', spacing: 'normal', anchorId: '' };
    case 'gap-fill':
      return {
        instruction: 'Fill in the blanks:',
        sentences: [{
          id: generateId('s'),
          textWithBlanks: 'The answer is {{1}}.',
          blanks: [{ id: generateId('b'), acceptedAnswers: [''], caseSensitive: false }],
        }],
        showCorrectAfter: true,
        scoringMode: 'partial-credit',
        mode: 'text',
        passMark: 70,
      };
    case 'poll':
      return {
        question: 'What do you think?',
        options: ['Option A', 'Option B', 'Option C'],
        allowMultiple: false,
        showResults: true,
        chartType: 'bar',
        anonymousVoting: false,
      };
    case 'reveal':
      return {
        sections: [
          { id: generateId('r'), title: 'Section 1', content: '<p>Click to reveal this content.</p>' },
          { id: generateId('r'), title: 'Section 2', content: '<p>More hidden content here.</p>' },
        ],
        style: 'accordion',
        allowMultipleOpen: false,
      };
    case 'file-upload':
      return {
        prompt: 'Upload your work:',
        allowedTypes: ['document', 'image'],
        maxFileSize: 20,
        maxFiles: 1,
        mustSubmitToComplete: true,
        rubric: '',
      };
    default:
      return {};
  }
}
