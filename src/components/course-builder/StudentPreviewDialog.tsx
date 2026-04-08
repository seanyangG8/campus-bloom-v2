import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Eye, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Play,
  AlertTriangle,
  GripVertical,
  Download,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  X,
  Send,
  MessageCircle,
  ZoomIn,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCourseBuilder } from "@/contexts/CourseBuilderContext";
import { Chapter, Page, Block, BlockType } from "@/lib/demo-data";
import { calculatePageCompletion, getBlockCompletionRule, isBlockComplete, BlockProgress } from "@/lib/completion-rules";
import { toast } from "sonner";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

interface StudentPreviewDialogProps {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Helpers ---

function parseVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'unknown'; embedUrl: string } | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  return { type: 'unknown', embedUrl: url };
}

function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// --- Main Dialog ---

export function StudentPreviewDialog({ 
  courseId, 
  courseTitle, 
  open, 
  onOpenChange 
}: StudentPreviewDialogProps) {
  const { 
    getChaptersByCourse, 
    getPagesByChapter, 
    getBlocksByPage,
    studentProgress,
    markBlockViewed,
    submitQuizAnswer,
    submitReorderAttempt,
    submitReflection,
    submitWhiteboardWork,
    updateVideoProgress,
    getBlockProgress,
  } = useCourseBuilder();
  
  const chapters = getChaptersByCourse(courseId);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
  
  const allPages: { page: Page; chapter: Chapter; blocks: Block[] }[] = [];
  chapters.forEach(chapter => {
    const pages = getPagesByChapter(chapter.id);
    pages.forEach(page => {
      const blocks = getBlocksByPage(page.id);
      allPages.push({ page, chapter, blocks });
    });
  });

  const currentPageData = allPages[currentPageIndex];
  const totalPages = allPages.length;
  
  const isPageLocked = (index: number): boolean => {
    if (index === 0) return false;
    for (let i = 0; i < index; i++) {
      if (allPages[i].page.isLocked && !completedPages.has(allPages[i].page.id)) {
        return true;
      }
    }
    return false;
  };

  // Auto-complete page when all required blocks are done
  useEffect(() => {
    if (!currentPageData) return;
    const blocks = currentPageData.blocks;
    const requiredBlocks = blocks.filter(b => b.isRequired && getBlockCompletionRule(b.type).countsTowardsCompletion);
    if (requiredBlocks.length === 0) return;
    const allDone = requiredBlocks.every(b => {
      const p = getBlockProgress(b.id);
      return p?.status === 'completed';
    });
    if (allDone && !completedPages.has(currentPageData.page.id)) {
      setCompletedPages(prev => new Set([...prev, currentPageData.page.id]));
      toast.success("Page complete!");
    }
  }, [studentProgress, currentPageData, completedPages, getBlockProgress]);

  const handleMarkComplete = () => {
    if (currentPageData) {
      setCompletedPages(prev => new Set([...prev, currentPageData.page.id]));
    }
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1 && !isPageLocked(currentPageIndex + 1)) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const progressPercent = totalPages > 0 
    ? Math.round((completedPages.size / totalPages) * 100) 
    : 0;

  // Filter visible blocks based on visibility conditions
  const getVisibleBlocks = (blocks: Block[]): Block[] => {
    return blocks.filter((block, idx) => {
      const vc = block.visibilityCondition;
      if (!vc || vc === 'always') return true;
      if (vc === 'after prev_complete' || vc === 'after_prev_complete') {
        if (idx === 0) return true;
        const prevBlock = blocks[idx - 1];
        const prevProgress = getBlockProgress(prevBlock.id);
        return prevProgress?.status === 'completed';
      }
      if (vc === 'score_threshold') {
        if (idx === 0) return true;
        const prevBlock = blocks[idx - 1];
        const prevProgress = getBlockProgress(prevBlock.id);
        const threshold = (block as any).visibilityThreshold || 50;
        return (prevProgress?.score || 0) >= threshold;
      }
      return true;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Student Preview</DialogTitle>
              <DialogDescription className="text-xs">{courseTitle}</DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{progressPercent}% Complete</p>
              <p className="text-xs text-muted-foreground">{completedPages.size} of {totalPages} pages</p>
            </div>
            <Progress value={progressPercent} className="w-24 h-2" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r bg-muted/30 overflow-y-auto shrink-0">
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Course Structure</p>
            </div>
            {chapters.map((chapter) => {
              const pages = getPagesByChapter(chapter.id);
              return (
                <div key={chapter.id} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{chapter.title}</div>
                  {pages.map((page) => {
                    const pageGlobalIndex = allPages.findIndex(p => p.page.id === page.id);
                    const isLocked = isPageLocked(pageGlobalIndex);
                    const isComplete = completedPages.has(page.id);
                    const isCurrent = currentPageIndex === pageGlobalIndex;
                    return (
                      <button
                        key={page.id}
                        onClick={() => !isLocked && setCurrentPageIndex(pageGlobalIndex)}
                        disabled={isLocked}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                          isCurrent && "bg-primary/10 text-primary",
                          !isCurrent && !isLocked && "hover:bg-muted",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isComplete ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          : isLocked ? <Lock className="h-3.5 w-3.5 shrink-0" />
                          : <div className="h-3.5 w-3.5 rounded-full border shrink-0" />}
                        <span className="truncate">{page.title}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Page Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentPageData ? (
              <>
                <div className="p-4 border-b shrink-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>{currentPageData.chapter.title}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>Page {currentPageIndex + 1} of {totalPages}</span>
                  </div>
                  <h2 className="text-lg font-semibold">{currentPageData.page.title}</h2>
                  {currentPageData.page.isLocked && !completedPages.has(currentPageData.page.id) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Complete this page to unlock the next one</span>
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {currentPageData.blocks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground"><p>This page has no content yet.</p></div>
                    ) : (
                      getVisibleBlocks(currentPageData.blocks).map((block) => (
                        <InteractiveBlock 
                          key={block.id} 
                          block={block}
                          progress={getBlockProgress(block.id)}
                          onMarkViewed={() => markBlockViewed(block.id)}
                          onSubmitQuiz={(answers) => submitQuizAnswer(block.id, answers)}
                          onSubmitReorder={(order) => submitReorderAttempt(block.id, order)}
                          onSubmitReflection={(text) => submitReflection(block.id, text)}
                          onSubmitWhiteboard={(data) => submitWhiteboardWork(block.id, data)}
                          onUpdateVideoProgress={(pct) => updateVideoProgress(block.id, pct)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t shrink-0 flex items-center justify-between">
                  <Button variant="outline" onClick={handlePrev} disabled={currentPageIndex === 0} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {!completedPages.has(currentPageData.page.id) ? (
                      <Button onClick={handleMarkComplete}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                      </Button>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </span>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleNext} disabled={currentPageIndex === totalPages - 1 || isPageLocked(currentPageIndex + 1)} className="gap-2">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground"><p>No pages available in this course.</p></div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Interactive Block ---
interface InteractiveBlockProps {
  block: Block;
  progress?: BlockProgress;
  onMarkViewed: () => void;
  onSubmitQuiz: (answers: Record<string, number | number[] | string>) => { passed: boolean; score: number };
  onSubmitReorder: (order: number[]) => { correct: boolean; score: number };
  onSubmitReflection: (text: string) => void;
  onSubmitWhiteboard: (data: any) => void;
  onUpdateVideoProgress: (pct: number) => void;
}

function InteractiveBlock({ 
  block, progress, onMarkViewed, onSubmitQuiz, onSubmitReorder, onSubmitReflection, onSubmitWhiteboard, onUpdateVideoProgress,
}: InteractiveBlockProps) {
  const rule = getBlockCompletionRule(block.type);
  const isComplete = progress?.status === 'completed';

  useEffect(() => {
    if (block.type === 'text' && !isComplete) {
      const timer = setTimeout(() => onMarkViewed(), 1000);
      return () => clearTimeout(timer);
    }
  }, [block.type, isComplete, onMarkViewed]);

  return (
    <div className={cn("p-4 rounded-lg border bg-card transition-all", isComplete && "ring-2 ring-success/30")}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {block.type === 'text' && '📝'}{block.type === 'video' && '🎬'}{block.type === 'image' && '🖼️'}
          {block.type === 'micro-quiz' && '❓'}{block.type === 'drag-drop-reorder' && '↕️'}
          {block.type === 'whiteboard' && '✏️'}{block.type === 'reflection' && '💭'}
          {block.type === 'qa-thread' && '💬'}{block.type === 'resource' && '📎'}{block.type === 'divider' && '—'}
        </span>
        <span className="font-medium text-sm">{block.title}</span>
        {block.isRequired && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Required</span>}
        {isComplete && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
      </div>
      <div className="mt-3">
        {block.type === 'text' && <TextBlockPreview block={block} />}
        {block.type === 'video' && <VideoBlockPreview block={block} progress={progress} onMarkViewed={onMarkViewed} onUpdateProgress={onUpdateVideoProgress} />}
        {block.type === 'image' && <ImageBlockPreview block={block} onMarkViewed={onMarkViewed} isComplete={isComplete} />}
        {block.type === 'micro-quiz' && <QuizBlockInteractive block={block} progress={progress} onSubmit={onSubmitQuiz} />}
        {block.type === 'drag-drop-reorder' && <ReorderBlockInteractive block={block} progress={progress} onSubmit={onSubmitReorder} />}
        {block.type === 'whiteboard' && <WhiteboardBlockInteractive block={block} progress={progress} onSubmit={onSubmitWhiteboard} />}
        {block.type === 'reflection' && <ReflectionBlockInteractive block={block} progress={progress} onSubmit={onSubmitReflection} />}
        {block.type === 'resource' && <ResourceBlockPreview block={block} onMarkViewed={onMarkViewed} isComplete={isComplete} />}
        {block.type === 'qa-thread' && <QAThreadBlockInteractive block={block} onMarkViewed={onMarkViewed} isComplete={isComplete} />}
        {block.type === 'divider' && <DividerBlockPreview block={block} />}
      </div>
    </div>
  );
}

// --- Text Block ---
function TextBlockPreview({ block }: { block: Block }) {
  const calloutStyle = block.content?.calloutStyle;
  const sanitizeHtml = (html: string) => {
    return html.replace(/<a\s+([^>]*href=[^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('target=')) attrs += ' target="_blank"';
      if (!attrs.includes('rel=')) attrs += ' rel="noopener noreferrer"';
      return `<a ${attrs}>`;
    });
  };
  return (
    <div className={cn(
      "p-4 bg-muted/50 rounded prose prose-sm max-w-none",
      "prose-a:text-primary prose-a:underline",
      calloutStyle === 'info' && "bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950/30",
      calloutStyle === 'warning' && "bg-amber-50 border-l-4 border-amber-500 dark:bg-amber-950/30",
      calloutStyle === 'tip' && "bg-green-50 border-l-4 border-green-500 dark:bg-green-950/30",
      calloutStyle === 'success' && "bg-emerald-50 border-l-4 border-emerald-500 dark:bg-emerald-950/30",
    )}>
      {block.content?.html ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content.html) }} />
      ) : (
        <p className="text-muted-foreground italic">No content yet</p>
      )}
    </div>
  );
}

// --- Video Block with actual embed + watch progress ---
function VideoBlockPreview({ block, progress, onMarkViewed, onUpdateProgress }: { 
  block: Block; progress?: BlockProgress; onMarkViewed: () => void; onUpdateProgress: (pct: number) => void;
}) {
  const [watchPct, setWatchPct] = useState(progress?.watchedPercentage || 0);
  const [showTranscript, setShowTranscript] = useState(false);
  const threshold = block.content?.watchThreshold || 80;
  const embed = parseVideoEmbed(block.content?.url || '');
  const isComplete = progress?.status === 'completed';

  // Simulate watch progress for embedded videos
  useEffect(() => {
    if (!embed || isComplete) return;
    const interval = setInterval(() => {
      setWatchPct(prev => {
        const next = Math.min(prev + 5, 100);
        onUpdateProgress(next);
        if (next >= threshold) {
          onMarkViewed();
          clearInterval(interval);
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [embed, isComplete, threshold]);

  return (
    <div className="space-y-2">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        {embed && (embed.type === 'youtube' || embed.type === 'vimeo') ? (
          <iframe
            src={embed.embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={block.title}
          />
        ) : block.content?.url ? (
          <div className="w-full h-full flex items-center justify-center">
            <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="text-center">
              <Play className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2 hover:text-primary cursor-pointer transition-colors" />
              <p className="text-sm text-muted-foreground">Open video</p>
            </a>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No video URL set</p>
          </div>
        )}
      </div>
      {/* Watch progress bar */}
      {embed && !isComplete && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Watch progress</span>
            <span>{watchPct}% / {threshold}% required</span>
          </div>
          <Progress value={watchPct} className="h-1.5" />
        </div>
      )}
      {block.content?.duration && (
        <p className="text-xs text-muted-foreground">Duration: {block.content.duration}</p>
      )}
      {block.content?.transcript && (
        <div>
          <button onClick={() => setShowTranscript(!showTranscript)} className="text-xs text-primary hover:underline">
            {showTranscript ? 'Hide' : 'View'} Transcript
          </button>
          {showTranscript && (
            <div className="mt-2 p-3 bg-muted/50 rounded text-xs max-h-40 overflow-y-auto whitespace-pre-wrap">
              {block.content.transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Image Block with zoom modal ---
function ImageBlockPreview({ block, onMarkViewed, isComplete }: { block: Block; onMarkViewed: () => void; isComplete?: boolean }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isComplete) {
      const timer = setTimeout(() => onMarkViewed(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onMarkViewed]);

  return (
    <>
      <div
        className={cn(
          "bg-muted rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative group",
          block.content?.displaySize === 'small' && "max-w-[25%]",
          block.content?.displaySize === 'medium' && "max-w-[50%]",
          block.content?.displaySize === 'large' && "max-w-[75%]",
        )}
        onClick={() => block.content?.url && setIsZoomed(true)}
      >
        {block.content?.url ? (
          <div className="relative">
            <img src={block.content.url} alt={block.content.alt || ""} className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
            </div>
            {block.content.caption && (
              <p className="text-xs text-center text-muted-foreground mt-2 italic">{block.content.caption}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground p-8">No image URL set</p>
        )}
      </div>

      {/* Zoom modal */}
      {isZoomed && block.content?.url && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-white/80" onClick={() => setIsZoomed(false)}>
            <X className="h-6 w-6" />
          </button>
          <img
            src={block.content.url}
            alt={block.content.alt || ""}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// --- Quiz Block with shuffle, retry, maxAttempts, showCorrectAfterAttempt ---
function QuizBlockInteractive({ block, progress, onSubmit }: { 
  block: Block; progress?: BlockProgress;
  onSubmit: (answers: Record<string, number | number[] | string>) => { passed: boolean; score: number };
}) {
  const questions = block.content?.questions || [];
  const shouldShuffle = block.content?.shuffleQuestions;
  const shouldShuffleAnswers = block.content?.shuffleAnswers;
  const showCorrect = block.content?.showCorrectAfterAttempt !== false;
  const maxAttempts = block.content?.maxAttempts || block.maxAttempts || 0; // 0 = unlimited

  // Stable shuffled question order
  const questionOrder = useMemo(() => {
    const indices = questions.map((_: any, i: number) => i);
    return shouldShuffle ? shuffleArray(indices) : indices;
  }, [questions.length, shouldShuffle]);

  // Stable shuffled answer option maps per question
  const answerMaps = useMemo(() => {
    const maps: Record<string, number[]> = {};
    questions.forEach((q: any) => {
      if (shouldShuffleAnswers && q.options && q.type !== 'short-answer' && q.type !== 'true-false') {
        maps[q.id] = shuffleArray(q.options.map((_: any, i: number) => i));
      }
    });
    return maps;
  }, [questions, shouldShuffleAnswers]);

  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [attemptCount, setAttemptCount] = useState(progress?.attempts || 0);

  const handleAnswerChange = (questionId: string, value: number | number[] | string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Map displayed index back to original for shuffled answers
  const getOriginalIndex = (questionId: string, displayIndex: number): number => {
    const map = answerMaps[questionId];
    return map ? map[displayIndex] : displayIndex;
  };

  const handleSubmit = () => {
    // Remap answers from display indices to original indices
    const remappedAnswers: Record<string, number | number[] | string> = {};
    questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      if (userAnswer === undefined) return;
      if (answerMaps[q.id]) {
        if (Array.isArray(userAnswer)) {
          remappedAnswers[q.id] = (userAnswer as number[]).map(di => getOriginalIndex(q.id, di));
        } else if (typeof userAnswer === 'number') {
          remappedAnswers[q.id] = getOriginalIndex(q.id, userAnswer);
        } else {
          remappedAnswers[q.id] = userAnswer;
        }
      } else {
        remappedAnswers[q.id] = userAnswer;
      }
    });

    const res = onSubmit(remappedAnswers);
    setResult(res);
    setSubmitted(true);
    setAttemptCount(prev => prev + 1);
    if (res.passed) {
      toast.success(`Quiz passed! Score: ${res.score}%`);
    } else {
      toast.error(`Quiz not passed. Score: ${res.score}%`);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setShowHints(new Set());
  };

  const canRetry = submitted && !result?.passed && (maxAttempts === 0 || attemptCount < maxAttempts);

  const toggleHint = (questionId: string) => {
    setShowHints(prev => {
      const newSet = new Set(prev);
      newSet.has(questionId) ? newSet.delete(questionId) : newSet.add(questionId);
      return newSet;
    });
  };

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions configured</p>;
  }

  return (
    <div className="space-y-4">
      {questionOrder.map((origIdx: number) => {
        const q = questions[origIdx];
        if (!q) return null;
        const userAnswer = answers[q.id];
        const isAnswered = userAnswer !== undefined && userAnswer !== '';

        // Get the display-order options for this question
        const optionOrder = answerMaps[q.id] || q.options?.map((_: any, i: number) => i) || [];
        
        // Check correctness using original indices (after remapping)
        const getIsCorrect = () => {
          if (!submitted) return false;
          // Need to use remapped answer for checking
          const remapped = answerMaps[q.id] 
            ? (Array.isArray(userAnswer) 
                ? (userAnswer as number[]).map(di => getOriginalIndex(q.id, di))
                : typeof userAnswer === 'number' ? getOriginalIndex(q.id, userAnswer) : userAnswer)
            : userAnswer;
          
          if (q.type === 'multi-select') {
            const userArr = Array.isArray(remapped) ? [...remapped].sort((a: number, b: number) => a - b) : [];
            const correctArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer].sort((a: number, b: number) => a - b) : [];
            return JSON.stringify(userArr) === JSON.stringify(correctArr);
          } else if (q.type === 'short-answer') {
            const userText = typeof remapped === 'string' ? remapped.trim() : '';
            const expectedText = (q.correctAnswerText || q.options?.[0] || '').trim();
            return q.caseSensitive ? userText === expectedText : userText.toLowerCase() === expectedText.toLowerCase();
          } else {
            return remapped === q.correctAnswer;
          }
        };
        const isCorrect = getIsCorrect();

        return (
          <div key={q.id || origIdx} className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium text-sm mb-3">
              Q{questionOrder.indexOf(origIdx) + 1}: {q.question || "Question not set"}
            </p>

            {/* Single choice */}
            {(q.type === 'single-choice' || !q.type) && (
              <div className="space-y-2">
                {optionOrder.map((origOptIdx: number, displayIdx: number) => {
                  const opt = q.options?.[origOptIdx];
                  const isSelected = userAnswer === displayIdx;
                  const isCorrectOption = q.correctAnswer === origOptIdx;
                  return (
                    <button 
                      key={displayIdx}
                      onClick={() => !submitted && handleAnswerChange(q.id, displayIdx)}
                      disabled={submitted}
                      className={cn(
                        "w-full p-3 text-left text-sm border rounded-lg transition-all",
                        isSelected && !submitted && "border-primary bg-primary/10",
                        submitted && showCorrect && isCorrectOption && "border-success bg-success/10",
                        submitted && showCorrect && isSelected && !isCorrectOption && "border-destructive bg-destructive/10",
                        submitted && !showCorrect && isSelected && "border-muted-foreground bg-muted",
                        !submitted && !isSelected && "hover:bg-muted"
                      )}
                    >
                      {String.fromCharCode(65 + displayIdx)}) {opt || `Option ${displayIdx + 1}`}
                      {submitted && showCorrect && isCorrectOption && <CheckCircle2 className="inline h-4 w-4 ml-2 text-success" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multi-select */}
            {q.type === 'multi-select' && (
              <div className="space-y-2">
                {optionOrder.map((origOptIdx: number, displayIdx: number) => {
                  const opt = q.options?.[origOptIdx];
                  const selected = Array.isArray(userAnswer) && userAnswer.includes(displayIdx);
                  const isCorrectOption = Array.isArray(q.correctAnswer) && q.correctAnswer.includes(origOptIdx);
                  return (
                    <button 
                      key={displayIdx}
                      onClick={() => {
                        if (submitted) return;
                        const current = (userAnswer as number[]) || [];
                        const newAnswer = selected ? current.filter(x => x !== displayIdx) : [...current, displayIdx];
                        handleAnswerChange(q.id, newAnswer);
                      }}
                      disabled={submitted}
                      className={cn(
                        "w-full p-3 text-left text-sm border rounded-lg transition-all flex items-center gap-2",
                        selected && !submitted && "border-primary bg-primary/10",
                        submitted && showCorrect && isCorrectOption && "border-success bg-success/10",
                        submitted && showCorrect && selected && !isCorrectOption && "border-destructive bg-destructive/10",
                        submitted && !showCorrect && selected && "border-muted-foreground bg-muted",
                        !submitted && !selected && "hover:bg-muted"
                      )}
                    >
                      <input type="checkbox" checked={selected} readOnly className="h-4 w-4" />
                      {String.fromCharCode(65 + displayIdx)}) {opt || `Option ${displayIdx + 1}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {q.type === 'true-false' && (
              <div className="flex gap-4">
                {['True', 'False'].map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => !submitted && handleAnswerChange(q.id, i)}
                    disabled={submitted}
                    className={cn(
                      "flex-1 p-3 text-center text-sm border rounded-lg transition-all",
                      userAnswer === i && !submitted && "border-primary bg-primary/10",
                      submitted && showCorrect && q.correctAnswer === i && "border-success bg-success/10",
                      submitted && showCorrect && userAnswer === i && q.correctAnswer !== i && "border-destructive bg-destructive/10",
                      submitted && !showCorrect && userAnswer === i && "border-muted-foreground bg-muted",
                      !submitted && userAnswer !== i && "hover:bg-muted"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {q.type === 'short-answer' && (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={(userAnswer as string) || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer..."
                  disabled={submitted}
                  className={cn(
                    submitted && showCorrect && isCorrect && "border-success bg-success/10",
                    submitted && showCorrect && !isCorrect && "border-destructive bg-destructive/10",
                    submitted && !showCorrect && "border-muted-foreground"
                  )}
                />
                {submitted && showCorrect && (
                  <div className={cn("text-xs p-2 rounded", isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                    {isCorrect ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Correct!</span>
                    ) : (
                      <span>Expected: <strong>{q.correctAnswerText || q.options?.[0]}</strong></span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            {q.hint && !submitted && (
              <button onClick={() => toggleHint(q.id)} className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {showHints.has(q.id) ? 'Hide hint' : 'Show hint'}
              </button>
            )}
            {showHints.has(q.id) && q.hint && <p className="mt-2 text-xs bg-muted p-2 rounded">{q.hint}</p>}

            {/* Explanation */}
            {submitted && showCorrect && q.explanation && (
              <div className="mt-3 p-2 bg-muted rounded text-xs"><strong>Explanation:</strong> {q.explanation}</div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="w-full">
          Submit Answers
        </Button>
      ) : (
        <div className="space-y-2">
          <div className={cn("p-3 rounded-lg text-center", result?.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            <p className="font-medium">{result?.passed ? "Passed!" : "Not passed"} - Score: {result?.score}%</p>
            {maxAttempts > 0 && <p className="text-xs mt-1">Attempt {attemptCount} of {maxAttempts}</p>}
          </div>
          {canRetry && (
            <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// --- Reorder Block ---
function ReorderBlockInteractive({ block, progress, onSubmit }: { 
  block: Block; progress?: BlockProgress;
  onSubmit: (order: number[]) => { correct: boolean; score: number };
}) {
  const items = block.content?.items || [];
  const maxAttempts = block.maxAttempts || 0;
  const [userOrder, setUserOrder] = useState<number[]>(() => shuffleArray(items.map((_: any, i: number) => i)));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; score: number } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState(progress?.attempts || 0);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setUserOrder(newOrder);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const handleSubmit = () => {
    const res = onSubmit(userOrder);
    setResult(res);
    setSubmitted(true);
    setAttemptCount(prev => prev + 1);
    res.correct ? toast.success("Correct order!") : toast.error(`Score: ${res.score}%`);
  };

  const handleRetry = () => {
    setUserOrder(shuffleArray(items.map((_: any, i: number) => i)));
    setSubmitted(false);
    setResult(null);
  };

  const canRetry = submitted && !result?.correct && (maxAttempts === 0 || attemptCount < maxAttempts);

  if (items.length === 0) return <p className="text-sm text-muted-foreground">No items configured</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{block.content?.instruction || "Drag and drop to reorder:"}</p>
      <div className="space-y-2">
        {userOrder.map((itemIndex, displayIndex) => (
          <div
            key={itemIndex}
            draggable={!submitted}
            onDragStart={() => handleDragStart(displayIndex)}
            onDragOver={(e) => handleDragOver(e, displayIndex)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 p-3 bg-muted/50 rounded border transition-all",
              !submitted && "cursor-move hover:bg-muted",
              draggedIndex === displayIndex && "opacity-50",
              submitted && block.content?.correctOrder?.[displayIndex] === itemIndex && "border-success bg-success/10",
              submitted && block.content?.correctOrder?.[displayIndex] !== itemIndex && "border-destructive bg-destructive/10"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{items[itemIndex] || `Item ${itemIndex + 1}`}</span>
          </div>
        ))}
      </div>
      {!submitted ? (
        <Button onClick={handleSubmit} className="w-full">Check Order</Button>
      ) : (
        <div className="space-y-2">
          <div className={cn("p-3 rounded-lg text-center", result?.correct ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            <p className="font-medium">{result?.correct ? "Correct!" : `Score: ${result?.score}%`}</p>
            {maxAttempts > 0 && <p className="text-xs mt-1">Attempt {attemptCount} of {maxAttempts}</p>}
          </div>
          {canRetry && (
            <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          )}
          {block.content?.showCorrectOrderAfter !== false && !result?.correct && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Correct order:</p>
              {(block.content?.correctOrder || []).map((idx: number, i: number) => (
                <p key={i} className="text-xs">{i + 1}. {items[idx]}</p>
              ))}
            </div>
          )}
          {block.content?.explanation && <p className="text-xs text-muted-foreground">{block.content.explanation}</p>}
        </div>
      )}
    </div>
  );
}

// --- Whiteboard Block ---
function WhiteboardBlockInteractive({ block, progress, onSubmit }: { 
  block: Block; progress?: BlockProgress; onSubmit: (data: any) => void;
}) {
  const isComplete = progress?.status === 'completed';
  const maxAttempts = block.maxAttempts || 0;
  const canSubmit = maxAttempts === 0 || (progress?.attempts || 0) < maxAttempts;
  
  if (isComplete && !canSubmit) {
    return (
      <div className="p-4 bg-success/10 rounded-lg text-center">
        <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
        <p className="text-sm font-medium text-success">Whiteboard submitted</p>
        {progress?.responses?.pngDataUrl && <img src={progress.responses.pngDataUrl} alt="Your submission" className="mt-3 border rounded max-h-48 mx-auto" />}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{block.content?.prompt || "Draw or write your answer"}</p>
      <WhiteboardCanvas
        blockId={block.id}
        canvasSize={block.content?.canvasSize}
        background={block.content?.background}
        enabledTools={block.content?.enabledTools}
        multiPage={block.content?.multiPage}
        onSubmit={onSubmit}
        disabled={isComplete && !canSubmit}
      />
    </div>
  );
}

// --- Reflection Block ---
function ReflectionBlockInteractive({ block, progress, onSubmit }: { 
  block: Block; progress?: BlockProgress; onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(progress?.status === 'completed');
  const minWords = block.content?.minWords || 0;
  const maxWords = block.content?.maxWords;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinimum = wordCount >= minWords;
  const exceedsMax = maxWords && wordCount > maxWords;

  const handleSubmit = () => {
    if (!meetsMinimum || exceedsMax) return;
    onSubmit(text);
    setSubmitted(true);
    toast.success("Reflection submitted!");
  };

  if (submitted) {
    return (
      <div className="p-3 rounded-lg bg-success/10 text-success text-center">
        <CheckCircle2 className="h-5 w-5 inline mr-2" /> Reflection submitted
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{block.content?.prompt || "Share your reflection..."}</p>
      {block.content?.exampleResponse && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-primary">View example response</summary>
          <p className="mt-2 p-2 bg-muted rounded italic">{block.content.exampleResponse}</p>
        </details>
      )}
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your reflection here..." className="min-h-[120px]" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn(!meetsMinimum && wordCount > 0 && "text-destructive", meetsMinimum && "text-success")}>
          {wordCount} words{minWords > 0 && ` (min: ${minWords})`}{maxWords && ` (max: ${maxWords})`}
        </span>
        {exceedsMax && <span className="text-destructive">Exceeds maximum</span>}
      </div>
      <Button onClick={handleSubmit} disabled={!meetsMinimum || !!exceedsMax} className="w-full">Submit Reflection</Button>
    </div>
  );
}

// --- Resource Block with functional download/open ---
function ResourceBlockPreview({ block, onMarkViewed, isComplete }: { block: Block; onMarkViewed: () => void; isComplete?: boolean }) {
  const fileTypeIcons: Record<string, string> = {
    pdf: '📄', doc: '📝', ppt: '📊', xls: '📈', image: '🖼️', zip: '📦', other: '📎',
  };
  const icon = fileTypeIcons[block.content?.fileType || 'other'] || '📎';
  const isLink = block.content?.resourceType === 'link';
  const url = block.content?.url || block.content?.fileUrl;

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    if (block.content?.mustOpenToComplete && !isComplete) {
      onMarkViewed();
    }
    if (!url) toast.info("No URL configured for this resource");
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium">{block.content?.fileName || "Resource file"}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {block.content?.fileSize && <span>{block.content.fileSize}</span>}
            {block.content?.versionLabel && <span>• {block.content.versionLabel}</span>}
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleClick}>
        {isLink ? (<><ExternalLink className="h-4 w-4 mr-1" />Open</>) : (<><Download className="h-4 w-4 mr-1" />Download</>)}
      </Button>
    </div>
  );
}

// --- Q&A Thread Interactive ---
function QAThreadBlockInteractive({ block, onMarkViewed, isComplete }: { block: Block; onMarkViewed: () => void; isComplete?: boolean }) {
  const [questions, setQuestions] = useState<{ id: string; text: string; author: string; reply?: string }[]>([
    { id: 'demo-1', text: 'Can you explain the difference between these two approaches?', author: 'Student A', reply: 'Great question! The first approach is more efficient for large datasets, while the second is simpler to implement.' },
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handlePost = () => {
    if (!newQuestion.trim()) return;
    setQuestions(prev => [...prev, { id: `q-${Date.now()}`, text: newQuestion.trim(), author: 'You' }]);
    setNewQuestion('');
    if (!isComplete) onMarkViewed();
    toast.success("Question posted!");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Ask questions and discuss with your tutor</p>
      
      {/* Thread */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {questions.map(q => (
          <div key={q.id} className="space-y-2">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">{q.author}</span>
              </div>
              <p className="text-sm">{q.text}</p>
            </div>
            {q.reply && (
              <div className="ml-6 p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">Tutor</span>
                </div>
                <p className="text-sm">{q.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post new question */}
      <div className="flex gap-2">
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <Button size="sm" onClick={handlePost} disabled={!newQuestion.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// --- Divider Block ---
function DividerBlockPreview({ block }: { block: Block }) {
  const style = block.content?.style || 'line';
  const spacing = block.content?.spacing || 'normal';
  return (
    <div className={cn(
      spacing === 'compact' && "py-2",
      spacing === 'normal' && "py-4",
      spacing === 'large' && "py-8",
    )}>
      {style === 'line' && <hr className="border-t" />}
      {style === 'whitespace' && <div className="h-8" />}
      {style === 'section-break' && (
        <div className="text-center">
          <hr className="border-t mb-4" />
          {block.content?.sectionHeading && <p className="font-semibold text-lg">{block.content.sectionHeading}</p>}
        </div>
      )}
    </div>
  );
}
