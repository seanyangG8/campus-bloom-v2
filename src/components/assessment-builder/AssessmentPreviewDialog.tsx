import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  Check,
  X,
  ArrowRightLeft,
  Upload,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Assessment,
  Question,
  MultipleChoiceContent,
  MultipleSelectContent,
  TrueFalseContent,
  ShortAnswerContent,
  FillBlankContent,
  MatchingContent,
  EssayContent,
  FileUploadContent,
  LongAnswerContent,
} from '@/lib/assessment-types';

interface AssessmentPreviewDialogProps {
  assessment: Assessment | null;
  questions: Question[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssessmentPreviewDialog({
  assessment,
  questions,
  open,
  onOpenChange,
}: AssessmentPreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  const sortedQuestions = useMemo(() => {
    const sorted = [...questions].sort((a, b) => a.order - b.order);
    if (assessment?.shuffleQuestions) {
      // Fisher-Yates shuffle with stable seed per dialog open
      const shuffled = [...sorted];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    return sorted;
  }, [questions, assessment?.shuffleQuestions, open]);

  const currentQuestion = sortedQuestions[currentIndex];
  const progress = ((currentIndex + 1) / sortedQuestions.length) * 100;

  // Timer
  useEffect(() => {
    if (open && assessment?.duration && assessment.duration > 0) {
      setTimeRemaining(assessment.duration * 60);
      setTimerActive(true);
    }
    return () => setTimerActive(false);
  }, [open, assessment?.duration]);

  useEffect(() => {
    if (!timerActive || timeRemaining === null || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const handleNext = () => {
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    if (assessment?.duration && assessment.duration > 0) {
      setTimeRemaining(assessment.duration * 60);
      setTimerActive(true);
    }
  };

  const handleClose = () => {
    handleReset();
    setTimerActive(false);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!assessment || questions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assessment Preview</DialogTitle>
            <DialogDescription>No questions to preview</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add some questions to preview the assessment.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {assessment.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            {timeRemaining !== null && timeRemaining > 0 ? (
              <span className={cn(
                "flex items-center gap-1 font-mono font-medium",
                timeRemaining < 60 && "text-destructive"
              )}>
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeRemaining)}
              </span>
            ) : assessment.duration > 0 ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {assessment.duration} mins
              </span>
            ) : null}
            <span>
              {sortedQuestions.length} {sortedQuestions.length === 1 ? 'question' : 'questions'}
            </span>
            <span>Pass: {assessment.passMark}%</span>
          </DialogDescription>
        </DialogHeader>

        {showResults ? (
          <ResultsView
            assessment={assessment}
            questions={sortedQuestions}
            answers={answers}
            onRetry={handleReset}
            onClose={handleClose}
          />
        ) : (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentIndex + 1} of {sortedQuestions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <QuestionPreview
                    question={currentQuestion}
                    answer={answers[currentQuestion.id]}
                    onAnswer={(value) =>
                      setAnswers({ ...answers, [currentQuestion.id]: value })
                    }
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {currentIndex === sortedQuestions.length - 1 ? (
                  'Submit'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuestionPreview({
  question,
  answer,
  onAnswer,
}: {
  question: Question;
  answer: any;
  onAnswer: (value: any) => void;
}) {
  const isSubmission = ['essay', 'long-answer', 'file-upload'].includes(question.type);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            isSubmission ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
          )}>
            {question.points} {question.points === 1 ? 'pt' : 'pts'}
          </span>
          {question.required && (
            <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
              Required
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-medium">{question.text}</h3>

      <Card className="p-4">
        {question.type === 'multiple-choice' && (
          <MultipleChoicePreview
            content={question.content as MultipleChoiceContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'multiple-select' && (
          <MultipleSelectPreview
            content={question.content as MultipleSelectContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'true-false' && (
          <TrueFalsePreview
            content={question.content as TrueFalseContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'short-answer' && (
          <ShortAnswerPreview answer={answer} onAnswer={onAnswer} />
        )}
        {question.type === 'fill-blank' && (
          <FillBlankPreview
            content={question.content as FillBlankContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'matching' && (
          <MatchingPreview
            content={question.content as MatchingContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'essay' && (
          <EssayPreview
            content={question.content as EssayContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'long-answer' && (
          <LongAnswerPreview
            content={question.content as LongAnswerContent}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}
        {question.type === 'file-upload' && (
          <FileUploadPreview
            content={question.content as FileUploadContent}
          />
        )}
      </Card>
    </div>
  );
}

function MultipleChoicePreview({
  content,
  answer,
  onAnswer,
}: {
  content: MultipleChoiceContent;
  answer: string;
  onAnswer: (value: string) => void;
}) {
  return (
    <RadioGroup value={answer || ''} onValueChange={onAnswer}>
      <div className="space-y-2">
        {content.options.map((option) => (
          <div
            key={option.id}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
              answer === option.id
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50'
            )}
            onClick={() => onAnswer(option.id)}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}

function MultipleSelectPreview({
  content,
  answer,
  onAnswer,
}: {
  content: MultipleSelectContent;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const selected = answer || [];
  const correctCount = content.options.filter(o => o.isCorrect).length;

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onAnswer(selected.filter((id) => id !== optionId));
    } else {
      onAnswer([...selected, optionId]);
    }
  };

  return (
    <div className="space-y-2">
      {correctCount > 0 && (
        <p className="text-xs text-muted-foreground italic">Select {correctCount} answer{correctCount > 1 ? 's' : ''}</p>
      )}
      {content.options.map((option) => (
        <div
          key={option.id}
          className={cn(
            'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
            selected.includes(option.id)
              ? 'border-primary bg-primary/5'
              : 'hover:bg-muted/50'
          )}
          onClick={() => toggleOption(option.id)}
        >
          <Checkbox
            checked={selected.includes(option.id)}
            onCheckedChange={() => toggleOption(option.id)}
          />
          <Label className="flex-1 cursor-pointer">{option.text}</Label>
        </div>
      ))}
    </div>
  );
}

function TrueFalsePreview({
  content,
  answer,
  onAnswer,
}: {
  content: TrueFalseContent;
  answer: boolean | undefined;
  onAnswer: (value: boolean) => void;
}) {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant={answer === true ? 'default' : 'outline'}
        className="flex-1 gap-2"
        onClick={() => onAnswer(true)}
      >
        <Check className="h-4 w-4" />
        True
      </Button>
      <Button
        type="button"
        variant={answer === false ? 'default' : 'outline'}
        className="flex-1 gap-2"
        onClick={() => onAnswer(false)}
      >
        <X className="h-4 w-4" />
        False
      </Button>
    </div>
  );
}

function ShortAnswerPreview({
  answer,
  onAnswer,
}: {
  answer: string;
  onAnswer: (value: string) => void;
}) {
  return (
    <Input
      value={answer || ''}
      onChange={(e) => onAnswer(e.target.value)}
      placeholder="Type your answer here..."
      className="w-full"
    />
  );
}

function FillBlankPreview({
  content,
  answer,
  onAnswer,
}: {
  content: FillBlankContent;
  answer: Record<string, string>;
  onAnswer: (value: Record<string, string>) => void;
}) {
  const answers = answer || {};

  // Render text with inline blanks
  const renderInlineText = () => {
    const text = content.textWithBlanks || '';
    const parts = text.split(/(\{\{\d+\}\})/g);
    let blankCounter = 0;
    
    return (
      <p className="text-sm leading-8 flex flex-wrap items-center gap-1">
        {parts.map((part, pi) => {
          const match = part.match(/\{\{(\d+)\}\}/);
          if (match) {
            const blankIndex = blankCounter;
            blankCounter++;
            const blank = content.blanks[blankIndex];
            if (!blank) return <span key={pi}>___</span>;
            return (
              <input
                key={pi}
                value={answers[blank.id] || ''}
                onChange={(e) => onAnswer({ ...answers, [blank.id]: e.target.value })}
                placeholder="..."
                className="inline-block w-28 h-7 px-2 text-sm border-b-2 border-muted-foreground/30 bg-transparent outline-none text-center focus:border-primary transition-colors"
              />
            );
          }
          return <span key={pi}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-4">
      {renderInlineText()}
    </div>
  );
}

function MatchingPreview({
  content,
  answer,
  onAnswer,
}: {
  content: MatchingContent;
  answer: Record<string, string>;
  onAnswer: (value: Record<string, string>) => void;
}) {
  const matches = answer || {};

  return (
    <div className="space-y-3">
      {content.pairs.map((pair) => (
        <div key={pair.id} className="flex items-center gap-3">
          <div className="flex-1 p-2 rounded bg-muted text-sm">{pair.left}</div>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={matches[pair.id] || ''}
            onChange={(e) =>
              onAnswer({ ...matches, [pair.id]: e.target.value })
            }
            className="flex-1 p-2 rounded border bg-background text-sm"
          >
            <option value="">Select match...</option>
            {content.pairs.map((p) => (
              <option key={p.id} value={p.right}>
                {p.right}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function EssayPreview({
  content,
  answer,
  onAnswer,
}: {
  content: EssayContent;
  answer: string;
  onAnswer: (value: string) => void;
}) {
  const wordCount = (answer || '').split(/\s+/).filter(Boolean).length;
  const belowMin = content.minWords && wordCount > 0 && wordCount < content.minWords;
  const aboveMax = content.maxWords && wordCount > content.maxWords;

  return (
    <div className="space-y-2">
      {content.rubric && (
        <details className="text-xs border rounded-lg p-2">
          <summary className="cursor-pointer text-muted-foreground hover:text-primary font-medium">View Rubric</summary>
          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{content.rubric}</p>
        </details>
      )}
      <Textarea
        value={answer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Write your essay here..."
        className="min-h-[200px] resize-none"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className={cn(
          belowMin && "text-destructive",
          aboveMax && "text-destructive",
          !belowMin && !aboveMax && wordCount > 0 && "text-success"
        )}>
          {wordCount} words
          {belowMin && ` (min ${content.minWords} required)`}
          {aboveMax && ` (max ${content.maxWords} exceeded)`}
        </span>
        {(content.minWords || content.maxWords) && (
          <span>
            {content.minWords && `Min: ${content.minWords}`}
            {content.minWords && content.maxWords && ' | '}
            {content.maxWords && `Max: ${content.maxWords}`}
          </span>
        )}
      </div>
    </div>
  );
}

function LongAnswerPreview({
  content,
  answer,
  onAnswer,
}: {
  content: LongAnswerContent;
  answer: string;
  onAnswer: (value: string) => void;
}) {
  const wordCount = (answer || '').split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-2">
      <Textarea
        value={answer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder={content.placeholder || 'Enter your answer here...'}
        className="min-h-[120px] resize-none"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{wordCount} words</span>
        {(content.minWords || content.maxWords) && (
          <span>
            {content.minWords && `Min: ${content.minWords}`}
            {content.minWords && content.maxWords && ' | '}
            {content.maxWords && `Max: ${content.maxWords}`}
          </span>
        )}
      </div>
    </div>
  );
}

function FileUploadPreview({ content }: { content: FileUploadContent }) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {content.maxFileSize}MB • Up to {content.maxFiles} file(s)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Allowed: {content.allowedTypes.join(', ')}
        </p>
      </div>
      {content.instructions && (
        <p className="text-sm text-muted-foreground">{content.instructions}</p>
      )}
    </div>
  );
}

// Scoring helper
function scoreQuestion(question: Question, answer: any): { correct: boolean; earned: number } {
  if (answer === undefined || answer === null) return { correct: false, earned: 0 };

  switch (question.type) {
    case 'multiple-choice': {
      const content = question.content as MultipleChoiceContent;
      const correctOption = content.options.find(o => o.isCorrect);
      const isCorrect = correctOption?.id === answer;
      return { correct: isCorrect, earned: isCorrect ? question.points : 0 };
    }
    case 'multiple-select': {
      const content = question.content as MultipleSelectContent;
      const correctIds = content.options.filter(o => o.isCorrect).map(o => o.id).sort();
      const selectedIds = (answer as string[] || []).sort();
      const isCorrect = correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i]);
      if (isCorrect) return { correct: true, earned: question.points };
      // Partial credit: fraction of correct selections
      const correctSelections = selectedIds.filter(id => correctIds.includes(id)).length;
      const wrongSelections = selectedIds.filter(id => !correctIds.includes(id)).length;
      const partial = Math.max(0, (correctSelections - wrongSelections) / correctIds.length);
      return { correct: false, earned: Math.round(question.points * partial * 100) / 100 };
    }
    case 'true-false': {
      const content = question.content as TrueFalseContent;
      const isCorrect = answer === content.correctAnswer;
      return { correct: isCorrect, earned: isCorrect ? question.points : 0 };
    }
    case 'short-answer': {
      const content = question.content as ShortAnswerContent;
      const userAnswer = (answer as string || '').trim();
      const isCorrect = content.acceptedAnswers.some(a =>
        content.caseSensitive ? a.trim() === userAnswer : a.trim().toLowerCase() === userAnswer.toLowerCase()
      );
      return { correct: isCorrect, earned: isCorrect ? question.points : 0 };
    }
    case 'fill-blank': {
      const content = question.content as FillBlankContent;
      const userAnswers = answer as Record<string, string> || {};
      let correctCount = 0;
      content.blanks.forEach(blank => {
        const userVal = (userAnswers[blank.id] || '').trim();
        if (blank.acceptedAnswers.some(a => a.trim().toLowerCase() === userVal.toLowerCase())) {
          correctCount++;
        }
      });
      const fraction = content.blanks.length > 0 ? correctCount / content.blanks.length : 0;
      return { correct: fraction === 1, earned: Math.round(question.points * fraction * 100) / 100 };
    }
    case 'matching': {
      const content = question.content as MatchingContent;
      const userMatches = answer as Record<string, string> || {};
      let correctCount = 0;
      content.pairs.forEach(pair => {
        if (userMatches[pair.id] === pair.right) correctCount++;
      });
      const fraction = content.pairs.length > 0 ? correctCount / content.pairs.length : 0;
      return { correct: fraction === 1, earned: Math.round(question.points * fraction * 100) / 100 };
    }
    // Submission types - always "answered" (graded manually)
    case 'essay':
    case 'long-answer':
    case 'file-upload':
      return { correct: true, earned: 0 }; // manually graded
    default:
      return { correct: false, earned: 0 };
  }
}

function ResultsView({
  assessment,
  questions,
  answers,
  onRetry,
  onClose,
}: {
  assessment: Assessment;
  questions: Question[];
  answers: Record<string, any>;
  onRetry: () => void;
  onClose: () => void;
}) {
  const autoGradedTypes = ['multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'fill-blank', 'matching'];
  const autoGradedQuestions = questions.filter(q => autoGradedTypes.includes(q.type));
  const submissionQuestions = questions.filter(q => !autoGradedTypes.includes(q.type));

  let earnedPoints = 0;
  let totalAutoPoints = 0;
  const questionResults: { question: Question; result: { correct: boolean; earned: number } }[] = [];

  questions.forEach(q => {
    const result = scoreQuestion(q, answers[q.id]);
    questionResults.push({ question: q, result });
    if (autoGradedTypes.includes(q.type)) {
      earnedPoints += result.earned;
      totalAutoPoints += q.points;
    }
  });

  const scorePercent = totalAutoPoints > 0 ? Math.round((earnedPoints / totalAutoPoints) * 100) : 0;
  const passed = scorePercent >= assessment.passMark;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="py-4 space-y-6 overflow-y-auto max-h-[60vh]">
      {/* Score summary */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className={cn(
            'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
            passed ? 'bg-green-100' : 'bg-red-100'
          )}
        >
          {passed ? (
            <Check className="h-10 w-10 text-green-600" />
          ) : (
            <X className="h-10 w-10 text-red-600" />
          )}
        </motion.div>

        <h3 className="text-2xl font-bold mb-1">
          {passed ? 'Passed!' : 'Not Passed'}
        </h3>
        <p className="text-muted-foreground text-sm">
          Score: {scorePercent}% ({earnedPoints}/{totalAutoPoints} points)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{scorePercent}%</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{answeredCount}/{questions.length}</p>
          <p className="text-xs text-muted-foreground">Answered</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{assessment.passMark}%</p>
          <p className="text-xs text-muted-foreground">Pass Mark</p>
        </div>
      </div>

      {/* Per-question feedback */}
      {assessment.showResults && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Question Review</h4>
          {questionResults.map(({ question, result }, i) => {
            const isSubmission = !autoGradedTypes.includes(question.type);
            return (
              <div key={question.id} className={cn(
                "flex items-start gap-3 p-3 rounded-lg border text-sm",
                isSubmission ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" :
                result.correct ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" :
                "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
              )}>
                <span className="font-medium text-muted-foreground shrink-0">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{question.text}</p>
                  {question.explanation && (
                    <p className="text-xs text-muted-foreground mt-1">{question.explanation}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium">
                  {isSubmission ? 'Pending' : result.correct ? `✓ ${result.earned}/${question.points}` : `✗ ${result.earned}/${question.points}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {submissionQuestions.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {submissionQuestions.length} submission question(s) require manual grading.
        </p>
      )}

      <div className="flex gap-3 justify-center pt-2">
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
        <Button onClick={onClose}>Close Preview</Button>
      </div>
    </div>
  );
}
