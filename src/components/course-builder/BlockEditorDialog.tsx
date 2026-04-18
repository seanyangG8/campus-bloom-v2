import { useState, useEffect } from "react";
import { Block, BlockType } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Info, AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";
import { useCourseBuilder } from "@/contexts/CourseBuilderContext";
import { BlockSettingsPanel } from "./BlockSettingsPanel";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

interface BlockEditorDialogProps {
  block: Block | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockEditorDialog({ block, open, onOpenChange }: BlockEditorDialogProps) {
  const { updateBlock } = useCourseBuilder();
  const [title, setTitle] = useState(block?.title || "");
  const [content, setContent] = useState<any>(block?.content || {});
  const [isRequired, setIsRequired] = useState(block?.isRequired || false);
  const [points, setPoints] = useState<number | undefined>(block?.points);
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>(block?.maxAttempts);
  const [visibilityCondition, setVisibilityCondition] = useState<'always' | 'after_prev_complete' | 'score_threshold'>(
    block?.visibilityCondition || 'always'
  );
  const [visibilityThreshold, setVisibilityThreshold] = useState<number | undefined>(block?.visibilityThreshold);

  // Reset state when block changes
  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setContent(JSON.parse(JSON.stringify(block.content || {})));
      setIsRequired(block.isRequired);
      setPoints(block.points);
      setMaxAttempts(block.maxAttempts);
      setVisibilityCondition(block.visibilityCondition || 'always');
      setVisibilityThreshold(block.visibilityThreshold);
    }
  }, [block]);

  const handleSave = () => {
    if (block) {
      updateBlock(block.id, { 
        title, 
        content, 
        isRequired,
        points,
        maxAttempts,
        visibilityCondition,
        visibilityThreshold,
      });
      onOpenChange(false);
    }
  };

  if (!block) return null;

  const hasAdvancedSettings = ['micro-quiz', 'drag-drop-reorder', 'whiteboard', 'reflection', 'gap-fill', 'file-upload'].includes(block.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {getBlockTypeLabel(block.type)}</DialogTitle>
          <DialogDescription>
            Configure the content and settings for this block.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6 py-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Block Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter block title..."
              />
            </div>

            {/* Block-specific editors */}
            {block.type === "text" && (
              <TextBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "video" && (
              <VideoBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "image" && (
              <ImageBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "micro-quiz" && (
              <MicroQuizEditor content={content} onChange={setContent} />
            )}
            {block.type === "drag-drop-reorder" && (
              <ReorderBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "whiteboard" && (
              <WhiteboardBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "reflection" && (
              <ReflectionBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "resource" && (
              <ResourceBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "divider" && (
              <DividerBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "qa-thread" && (
              <QAThreadBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "gap-fill" && (
              <GapFillBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "poll" && (
              <PollBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "reveal" && (
              <RevealBlockEditor content={content} onChange={setContent} />
            )}
            {block.type === "file-upload" && (
              <FileUploadBlockEditor content={content} onChange={setContent} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="py-4">
            <BlockSettingsPanel
              block={block}
              isRequired={isRequired}
              setIsRequired={setIsRequired}
              points={points}
              setPoints={setPoints}
              maxAttempts={maxAttempts}
              setMaxAttempts={setMaxAttempts}
              visibilityCondition={visibilityCondition}
              setVisibilityCondition={setVisibilityCondition}
              visibilityThreshold={visibilityThreshold}
              setVisibilityThreshold={setVisibilityThreshold}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Text Block Editor with Rich Text Editor
function TextBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const calloutStyles = [
    { value: 'none', label: 'None', icon: null },
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-500' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-amber-500' },
    { value: 'tip', label: 'Tip', icon: Lightbulb, color: 'text-green-500' },
    { value: 'success', label: 'Success', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Callout Style (optional)</Label>
        <Select
          value={content.calloutStyle || 'none'}
          onValueChange={(val) => onChange({ ...content, calloutStyle: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {calloutStyles.map(style => (
              <SelectItem key={style.value} value={style.value}>
                <div className="flex items-center gap-2">
                  {style.icon && <style.icon className={cn("h-4 w-4", style.color)} />}
                  <span>{style.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <RichTextEditor
          value={content.html || ""}
          onChange={(html) => onChange({ ...content, html })}
          placeholder="Start typing your content..."
          minHeight="200px"
        />
      </div>

      {content.calloutStyle && content.calloutStyle !== 'none' && (
        <div className={cn(
          "p-4 rounded-lg border-l-4",
          content.calloutStyle === 'info' && "bg-blue-50 border-blue-500 dark:bg-blue-950/30",
          content.calloutStyle === 'warning' && "bg-amber-50 border-amber-500 dark:bg-amber-950/30",
          content.calloutStyle === 'tip' && "bg-green-50 border-green-500 dark:bg-green-950/30",
          content.calloutStyle === 'success' && "bg-emerald-50 border-emerald-500 dark:bg-emerald-950/30",
        )}>
          <p className="text-sm font-medium mb-1">Callout Preview</p>
          <div dangerouslySetInnerHTML={{ __html: content.html || '<p>Your content here...</p>' }} className="text-sm prose prose-sm max-w-none" />
        </div>
      )}
    </div>
  );
}

// Video Block Editor with chapters editor
function VideoBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const chapters = content.chapters || [];

  const addChapter = () => {
    onChange({ ...content, chapters: [...chapters, { time: '', title: '' }] });
  };
  const updateChapter = (index: number, field: string, value: string) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, chapters: updated });
  };
  const removeChapter = (index: number) => {
    onChange({ ...content, chapters: chapters.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or Vimeo link"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input
            value={content.duration || ""}
            onChange={(e) => onChange({ ...content, duration: e.target.value })}
            placeholder="e.g., 12:34"
          />
        </div>
        <div className="space-y-2">
          <Label>Watch Threshold (%)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[content.watchThreshold || 80]}
              onValueChange={([val]) => onChange({ ...content, watchThreshold: val })}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{content.watchThreshold || 80}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Students must watch this percentage to complete
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Transcript (optional)</Label>
        <Textarea
          value={content.transcript || ""}
          onChange={(e) => onChange({ ...content, transcript: e.target.value })}
          placeholder="Paste video transcript here for accessibility..."
          className="min-h-[100px]"
        />
      </div>

      {/* Chapters Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Chapters (optional)</Label>
          <Button variant="outline" size="sm" onClick={addChapter}>
            <Plus className="h-4 w-4 mr-1" />
            Add Chapter
          </Button>
        </div>
        {chapters.length > 0 ? (
          <div className="space-y-2">
            {chapters.map((ch: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={ch.time || ''}
                  onChange={(e) => updateChapter(i, 'time', e.target.value)}
                  placeholder="0:00"
                  className="w-20"
                />
                <Input
                  value={ch.title || ''}
                  onChange={(e) => updateChapter(i, 'title', e.target.value)}
                  placeholder="Chapter title"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeChapter(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No chapters. Add chapters to help students navigate the video.</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Hide" : "Show"} Advanced Options
      </Button>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                value={content.startTime || ""}
                onChange={(e) => onChange({ ...content, startTime: e.target.value })}
                placeholder="e.g., 0:30"
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                value={content.endTime || ""}
                onChange={(e) => onChange({ ...content, endTime: e.target.value })}
                placeholder="e.g., 10:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Captions URL (VTT/SRT)</Label>
            <Input
              value={content.captionsUrl || ""}
              onChange={(e) => onChange({ ...content, captionsUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="allowDownload"
              checked={content.allowDownload === true}
              onCheckedChange={(checked) => onChange({ ...content, allowDownload: checked })}
            />
            <Label htmlFor="allowDownload">Allow download</Label>
          </div>
        </div>
      )}
    </div>
  );
}

// Image Block Editor with gallery CRUD
function ImageBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const galleryImages = content.images || [];

  const addGalleryImage = () => {
    onChange({ ...content, images: [...galleryImages, { url: '', alt: '', caption: '' }] });
  };
  const updateGalleryImage = (index: number, field: string, value: string) => {
    const updated = [...galleryImages];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, images: updated });
  };
  const removeGalleryImage = (index: number) => {
    onChange({ ...content, images: galleryImages.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Alt Text (required for accessibility)</Label>
        <Input
          value={content.alt || ""}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          placeholder="Describe the image..."
        />
      </div>

      <div className="space-y-2">
        <Label>Caption (optional)</Label>
        <Input
          value={content.caption || ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Image caption..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Display Size</Label>
          <Select
            value={content.displaySize || 'large'}
            onValueChange={(val) => onChange({ ...content, displaySize: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (25%)</SelectItem>
              <SelectItem value="medium">Medium (50%)</SelectItem>
              <SelectItem value="large">Large (75%)</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="allowImgDownload"
          checked={content.allowDownload === true}
          onCheckedChange={(checked) => onChange({ ...content, allowDownload: checked })}
        />
        <Label htmlFor="allowImgDownload">Allow download</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="galleryMode"
          checked={content.galleryMode === true}
          onCheckedChange={(checked) => onChange({ ...content, galleryMode: checked })}
        />
        <Label htmlFor="galleryMode">Gallery mode (multiple images)</Label>
      </div>

      {/* Gallery images CRUD */}
      {content.galleryMode && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <Label>Gallery Images</Label>
            <Button variant="outline" size="sm" onClick={addGalleryImage}>
              <Plus className="h-4 w-4 mr-1" />
              Add Image
            </Button>
          </div>
          {galleryImages.length > 0 ? (
            <div className="space-y-3">
              {galleryImages.map((img: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Image {i + 1}</Label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeGalleryImage(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input value={img.url || ''} onChange={(e) => updateGalleryImage(i, 'url', e.target.value)} placeholder="Image URL" />
                  <Input value={img.alt || ''} onChange={(e) => updateGalleryImage(i, 'alt', e.target.value)} placeholder="Alt text" />
                  <Input value={img.caption || ''} onChange={(e) => updateGalleryImage(i, 'caption', e.target.value)} placeholder="Caption (optional)" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No gallery images. Add images to create a gallery.</p>
          )}
        </div>
      )}

      {content.url && (
        <div className="mt-4">
          <Label className="mb-2 block">Preview</Label>
          <div className={cn(
            "rounded-lg overflow-hidden border bg-muted",
            content.displaySize === 'small' && "w-1/4",
            content.displaySize === 'medium' && "w-1/2",
            content.displaySize === 'large' && "w-3/4",
            content.displaySize === 'full' && "w-full",
          )}>
            <img 
              src={content.url} 
              alt={content.alt || ""} 
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Micro-Quiz Editor
function MicroQuizEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const questions = content.questions || [];

  const generateQuestionId = () => `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addQuestion = () => {
    onChange({
      ...content,
      questions: [
        ...questions,
        {
          id: generateQuestionId(),
          type: 'single-choice',
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          correctAnswerText: "",
          hint: "",
          explanation: "",
          points: 1,
          caseSensitive: false,
        },
      ],
    });
  };

  const updateQuestion = (index: number, updates: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onChange({ ...content, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    onChange({
      ...content,
      questions: questions.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-4">
        <h4 className="font-medium text-sm">Quiz Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pass Mark (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={content.passMark || ""}
              onChange={(e) => onChange({ ...content, passMark: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 70"
            />
          </div>
          <div className="space-y-2">
            <Label>Completion Rule</Label>
            <Select
              value={content.completionRule || 'attempted'}
              onValueChange={(val) => onChange({ ...content, completionRule: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attempted">Attempted (any answer)</SelectItem>
                <SelectItem value="passed">Passed (meet pass mark)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="shuffleQuestions"
              checked={content.shuffleQuestions === true}
              onCheckedChange={(checked) => onChange({ ...content, shuffleQuestions: checked })}
            />
            <Label htmlFor="shuffleQuestions">Shuffle questions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="shuffleAnswers"
              checked={content.shuffleAnswers === true}
              onCheckedChange={(checked) => onChange({ ...content, shuffleAnswers: checked })}
            />
            <Label htmlFor="shuffleAnswers">Shuffle answers</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="showCorrect"
              checked={content.showCorrectAfterAttempt !== false}
              onCheckedChange={(checked) => onChange({ ...content, showCorrectAfterAttempt: checked })}
            />
            <Label htmlFor="showCorrect">Show correct answer after attempt</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="showOneAtATime"
              checked={content.showOneAtATime === true}
              onCheckedChange={(checked) => onChange({ ...content, showOneAtATime: checked })}
            />
            <Label htmlFor="showOneAtATime">One question at a time</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Time Limit (seconds, 0 = none)</Label>
          <Input
            type="number"
            min={0}
            value={content.timeLimit || ""}
            onChange={(e) => onChange({ ...content, timeLimit: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 300"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="flex items-center justify-between">
        <Label>Questions</Label>
        <Button variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>

      {questions.map((q: any, qIndex: number) => (
        <div key={q.id} className="p-4 border rounded-lg space-y-4 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Question {qIndex + 1}</span>
              <Select
                value={q.type || 'single-choice'}
                onValueChange={(val) => updateQuestion(qIndex, { type: val })}
              >
                <SelectTrigger className="w-36 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-choice">Single Choice</SelectItem>
                  <SelectItem value="multi-select">Multi-Select</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="long-answer">Long Answer (rich text + math)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
            placeholder="Enter your question..."
            className="min-h-[60px]"
          />

          {/* Answer Options */}
          {(q.type === 'single-choice' || q.type === 'multi-select' || !q.type) && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              {q.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-2">
                  {q.type === 'multi-select' ? (
                    <input
                      type="checkbox"
                      checked={Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(optIndex) : false}
                      onChange={(e) => {
                        const current = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                        const newCorrect = e.target.checked
                          ? [...current, optIndex]
                          : current.filter((i: number) => i !== optIndex);
                        updateQuestion(qIndex, { correctAnswer: newCorrect });
                      }}
                      className="h-4 w-4"
                    />
                  ) : (
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() => updateQuestion(qIndex, { correctAnswer: optIndex })}
                      className="h-4 w-4"
                    />
                  )}
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...q.options];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(qIndex, { options: newOptions });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    className="flex-1"
                  />
                  {q.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        const newOptions = q.options.filter((_: any, i: number) => i !== optIndex);
                        // Adjust correctAnswer if needed
                        let newCorrect = q.correctAnswer;
                        if (q.type === 'multi-select' && Array.isArray(newCorrect)) {
                          newCorrect = newCorrect.filter((i: number) => i !== optIndex).map((i: number) => i > optIndex ? i - 1 : i);
                        } else if (typeof newCorrect === 'number' && newCorrect >= optIndex) {
                          newCorrect = Math.max(0, newCorrect > optIndex ? newCorrect - 1 : 0);
                        }
                        updateQuestion(qIndex, { options: newOptions, correctAnswer: newCorrect });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuestion(qIndex, { options: [...q.options, ''] })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
                <p className="text-xs text-muted-foreground">
                  {q.type === 'multi-select' 
                    ? 'Check all correct answers.' 
                    : 'Select the radio button next to the correct answer.'}
                </p>
              </div>
            </div>
          )}

          {q.type === 'true-false' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select
                value={q.correctAnswer === 0 ? 'true' : 'false'}
                onValueChange={(val) => updateQuestion(qIndex, { 
                  correctAnswer: val === 'true' ? 0 : 1,
                  options: ['True', 'False']
                })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {q.type === 'short-answer' && (
            <div className="space-y-2">
              <Label>Expected Answer</Label>
              <Input
                value={q.correctAnswerText || q.options?.[0] || ""}
                onChange={(e) => updateQuestion(qIndex, { 
                  correctAnswerText: e.target.value,
                  options: [e.target.value],
                  correctAnswer: 0
                })}
                placeholder="Enter the expected answer..."
              />
              <div className="flex items-center gap-2">
                <Switch
                  id={`caseSensitive-${q.id}-${qIndex}`}
                  checked={q.caseSensitive === true}
                  onCheckedChange={(checked) => updateQuestion(qIndex, { caseSensitive: checked })}
                />
                <Label htmlFor={`caseSensitive-${q.id}-${qIndex}`}>Case sensitive</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {q.caseSensitive ? "Exact match required" : "Case insensitive matching"}
              </p>
            </div>
          )}

          {/* Hint and Explanation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hint (optional)</Label>
              <Input
                value={q.hint || ""}
                onChange={(e) => updateQuestion(qIndex, { hint: e.target.value })}
                placeholder="Give students a hint..."
              />
            </div>
            <div className="space-y-2">
              <Label>Explanation (shown after answer)</Label>
              <Input
                value={q.explanation || ""}
                onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                placeholder="Explain the correct answer..."
              />
            </div>
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
          No questions yet. Click "Add Question" to create one.
        </div>
      )}
    </div>
  );
}

// Enhanced Reorder Block Editor
function ReorderBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const items = content.items || [];

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, ""],
      correctOrder: [...(content.correctOrder || []), items.length],
    });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({
      ...content,
      items: items.filter((_: any, i: number) => i !== index),
      correctOrder: (content.correctOrder || [])
        .filter((i: number) => i !== index)
        .map((i: number) => (i > index ? i - 1 : i)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Instruction</Label>
        <Input
          value={content.instruction || ""}
          onChange={(e) => onChange({ ...content, instruction: e.target.value })}
          placeholder="e.g., Drag and drop to reorder the steps:"
        />
      </div>

      {/* Scoring Settings */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-4">
        <h4 className="font-medium text-sm">Scoring Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Scoring Mode</Label>
            <Select
              value={content.scoringMode || 'all-or-nothing'}
              onValueChange={(val) => onChange({ ...content, scoringMode: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-or-nothing">All or Nothing</SelectItem>
                <SelectItem value="partial-credit">Partial Credit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {content.scoringMode === 'partial-credit' 
                ? 'Students get points for each correctly placed item'
                : 'Students must get the entire order correct'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="showCorrectOrder"
            checked={content.showCorrectOrderAfter !== false}
            onCheckedChange={(checked) => onChange({ ...content, showCorrectOrderAfter: checked })}
          />
          <Label htmlFor="showCorrectOrder">Show correct order after submission</Label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Items (in correct order)</Label>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="w-6 text-sm text-muted-foreground">{index + 1}.</span>
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Distractor Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Distractor Items (don't belong in sequence)</Label>
          <Button variant="outline" size="sm" onClick={() => {
            const distractors = content.distractorItems || [];
            onChange({ ...content, distractorItems: [...distractors, ''] });
          }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Distractor
          </Button>
        </div>
        {(content.distractorItems || []).length > 0 ? (
          <div className="space-y-2">
            {(content.distractorItems || []).map((d: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-amber-600 w-6">⚠️</span>
                <Input
                  value={d}
                  onChange={(e) => {
                    const updated = [...(content.distractorItems || [])];
                    updated[i] = e.target.value;
                    onChange({ ...content, distractorItems: updated });
                  }}
                  placeholder={`Distractor ${i + 1}`}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                  onChange({ ...content, distractorItems: (content.distractorItems || []).filter((_: any, j: number) => j !== i) });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No distractors. Add items that don't belong to increase difficulty.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Explanation (shown after attempt)</Label>
        <Textarea
          value={content.explanation || ""}
          onChange={(e) => onChange({ ...content, explanation: e.target.value })}
          placeholder="Explain why this order is correct..."
          className="min-h-[80px]"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Enter items in the correct order. Students will see them shuffled.
      </p>
    </div>
  );
}

// Enhanced Whiteboard Block Editor
function WhiteboardBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const defaultTools = {
    pen: true,
    highlighter: true,
    eraser: true,
    shapes: true,
    text: true,
    undo: true,
  };
  const tools = content.enabledTools || defaultTools;

  const updateTool = (tool: string, enabled: boolean) => {
    onChange({
      ...content,
      enabledTools: { ...tools, [tool]: enabled }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          value={content.prompt || ""}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          placeholder="What should students draw or write?"
          className="min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Canvas Size</Label>
          <Select
            value={content.canvasSize || 'a4'}
            onValueChange={(val) => onChange({ ...content, canvasSize: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4 (Portrait)</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="wide">Wide (Landscape)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Background</Label>
          <Select
            value={content.background || 'blank'}
            onValueChange={(val) => onChange({ ...content, background: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Blank</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="ruled">Ruled Lines</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Enabled Tools</Label>
        <div className="flex flex-wrap gap-4">
          {Object.entries(tools).map(([tool, enabled]) => (
            <div key={tool} className="flex items-center gap-2">
              <Switch
                id={`tool-${tool}`}
                checked={enabled as boolean}
                onCheckedChange={(checked) => updateTool(tool, checked)}
              />
              <Label htmlFor={`tool-${tool}`} className="capitalize">{tool}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="allowImage"
          checked={content.allowImage !== false}
          onCheckedChange={(checked) => onChange({ ...content, allowImage: checked })}
        />
        <Label htmlFor="allowImage">Allow image upload onto canvas</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="multiPage"
          checked={content.multiPage === true}
          onCheckedChange={(checked) => onChange({ ...content, multiPage: checked })}
        />
        <Label htmlFor="multiPage">Allow multiple pages</Label>
      </div>

      <div className="space-y-2">
        <Label>Rubric / Marking Criteria (for tutor)</Label>
        <Textarea
          value={content.rubric || ""}
          onChange={(e) => onChange({ ...content, rubric: e.target.value })}
          placeholder="Describe what you're looking for in submissions..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}

// Enhanced Reflection Block Editor
function ReflectionBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Reflection Prompt</Label>
        <Textarea
          value={content.prompt || ""}
          onChange={(e) => onChange({ ...content, prompt: e.target.value })}
          placeholder="What should students reflect on?"
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Example Response (optional)</Label>
        <Textarea
          value={content.exampleResponse || ""}
          onChange={(e) => onChange({ ...content, exampleResponse: e.target.value })}
          placeholder="Provide an example of a good response..."
          className="min-h-[60px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum Words</Label>
          <Input
            type="number"
            value={content.minWords || ""}
            onChange={(e) => onChange({ ...content, minWords: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 50"
          />
        </div>
        <div className="space-y-2">
          <Label>Maximum Words (optional)</Label>
          <Input
            type="number"
            value={content.maxWords || ""}
            onChange={(e) => onChange({ ...content, maxWords: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Privacy Mode</Label>
        <Select
          value={content.privacyMode || 'private'}
          onValueChange={(val) => onChange({ ...content, privacyMode: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private (tutor only)</SelectItem>
            <SelectItem value="peer-gallery">Peer Gallery (shared with class)</SelectItem>
            <SelectItem value="anonymous">Anonymous Peer Gallery</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {content.privacyMode === 'peer-gallery' && "Students can see each other's reflections with names visible"}
          {content.privacyMode === 'anonymous' && "Students can see each other's reflections without names"}
          {(!content.privacyMode || content.privacyMode === 'private') && "Only the tutor can see submissions"}
        </p>
      </div>

      {(content.privacyMode === 'peer-gallery' || content.privacyMode === 'anonymous') && (
        <div className="flex items-center gap-2">
          <Switch
            id="allowPeerComments"
            checked={content.allowPeerComments === true}
            onCheckedChange={(checked) => onChange({ ...content, allowPeerComments: checked })}
          />
          <Label htmlFor="allowPeerComments">Allow peer comments</Label>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="mustSubmit"
          checked={content.mustSubmitToComplete !== false}
          onCheckedChange={(checked) => onChange({ ...content, mustSubmitToComplete: checked })}
        />
        <Label htmlFor="mustSubmit">Must submit to complete</Label>
      </div>

      <div className="space-y-2">
        <Label>Rubric / Marking Criteria (optional)</Label>
        <Textarea
          value={content.rubric || ""}
          onChange={(e) => onChange({ ...content, rubric: e.target.value })}
          placeholder="Describe what makes a good reflection..."
          className="min-h-[60px]"
        />
      </div>
    </div>
  );
}

// Enhanced Resource Block Editor
function ResourceBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const fileTypeIcons: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    ppt: '📊',
    xls: '📈',
    image: '🖼️',
    zip: '📦',
    other: '📎',
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Resource Type</Label>
        <Select
          value={content.resourceType || 'file'}
          onValueChange={(val) => onChange({ ...content, resourceType: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="file">File Download</SelectItem>
            <SelectItem value="link">External Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{content.resourceType === 'link' ? 'Link URL' : 'File URL'}</Label>
        <Input
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{content.resourceType === 'link' ? 'Link Label' : 'File Name'}</Label>
          <Input
            value={content.fileName || ""}
            onChange={(e) => onChange({ ...content, fileName: e.target.value })}
            placeholder={content.resourceType === 'link' ? "Click here to view..." : "worksheet.pdf"}
          />
        </div>
        {content.resourceType !== 'link' && (
          <div className="space-y-2">
            <Label>File Type</Label>
            <Select
              value={content.fileType || 'pdf'}
              onValueChange={(val) => onChange({ ...content, fileType: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fileTypeIcons).map(([type, icon]) => (
                  <SelectItem key={type} value={type}>
                    {icon} {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {content.resourceType !== 'link' && (
        <div className="space-y-2">
          <Label>File Size</Label>
          <Input
            value={content.fileSize || ""}
            onChange={(e) => onChange({ ...content, fileSize: e.target.value })}
            placeholder="2.5 MB"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Version Label (optional)</Label>
          <Input
            value={content.versionLabel || ""}
            onChange={(e) => onChange({ ...content, versionLabel: e.target.value })}
            placeholder="e.g., v2.0"
          />
        </div>
        <div className="space-y-2">
          <Label>Expiry Date (optional)</Label>
          <Input
            type="date"
            value={content.expiryDate || ""}
            onChange={(e) => onChange({ ...content, expiryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="mustOpen"
          checked={content.mustOpenToComplete === true}
          onCheckedChange={(checked) => onChange({ ...content, mustOpenToComplete: checked })}
        />
        <Label htmlFor="mustOpen">Must open to complete</Label>
      </div>

      {content.resourceType === 'link' && (
        <div className="flex items-center gap-2">
          <Switch
            id="openNewTab"
            checked={content.openInNewTab !== false}
            onCheckedChange={(checked) => onChange({ ...content, openInNewTab: checked })}
          />
          <Label htmlFor="openNewTab">Open in new tab</Label>
        </div>
      )}
    </div>
  );
}

// New Divider Block Editor
function DividerBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={content.style || 'line'}
          onValueChange={(val) => onChange({ ...content, style: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="whitespace">Whitespace</SelectItem>
            <SelectItem value="section-break">Section Break</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {content.style === 'section-break' && (
        <div className="space-y-2">
          <Label>Section Heading (optional)</Label>
          <Input
            value={content.sectionHeading || ""}
            onChange={(e) => onChange({ ...content, sectionHeading: e.target.value })}
            placeholder="e.g., Part 2: Advanced Topics"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Spacing</Label>
        <Select
          value={content.spacing || 'normal'}
          onValueChange={(val) => onChange({ ...content, spacing: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Anchor ID (for deep links)</Label>
        <Input
          value={content.anchorId || ""}
          onChange={(e) => onChange({ ...content, anchorId: e.target.value })}
          placeholder="e.g., section-2"
        />
        <p className="text-xs text-muted-foreground">
          Students can link directly to this section using #anchor-id
        </p>
      </div>

      {/* Preview */}
      <div className="mt-4">
        <Label className="mb-2 block">Preview</Label>
        <div className={cn(
          "border rounded-lg p-4",
          content.spacing === 'compact' && "py-2",
          content.spacing === 'large' && "py-8",
        )}>
          {content.style === 'line' && <hr className="border-t" />}
          {content.style === 'whitespace' && <div className="h-8" />}
          {content.style === 'section-break' && (
            <div className="text-center">
              <hr className="border-t mb-4" />
              {content.sectionHeading && (
                <p className="font-semibold text-lg">{content.sectionHeading}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// New Q&A Thread Block Editor
function QAThreadBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const categories = content.categories || [];

  const addCategory = () => {
    onChange({ ...content, categories: [...categories, ""] });
  };

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    onChange({ ...content, categories: newCategories });
  };

  const removeCategory = (index: number) => {
    onChange({
      ...content,
      categories: categories.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Who Can Post</Label>
        <Select
          value={content.whoCanPost || 'students-only'}
          onValueChange={(val) => onChange({ ...content, whoCanPost: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="students-only">Students Only</SelectItem>
            <SelectItem value="students-and-tutors">Students and Tutors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Anonymity</Label>
        <Select
          value={content.anonymity || 'off'}
          onValueChange={(val) => onChange({ ...content, anonymity: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Names visible</SelectItem>
            <SelectItem value="optional">Optional anonymous</SelectItem>
            <SelectItem value="always-anonymous">Always anonymous to peers</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {content.anonymity === 'always-anonymous' && "Student names are hidden from other students"}
          {content.anonymity === 'optional' && "Students can choose to post anonymously"}
          {(!content.anonymity || content.anonymity === 'off') && "All names are visible"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="allowAttachments"
          checked={content.allowAttachments === true}
          onCheckedChange={(checked) => onChange({ ...content, allowAttachments: checked })}
        />
        <Label htmlFor="allowAttachments">Allow attachments (images/files)</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="moderationEnabled"
          checked={content.moderationEnabled !== false}
          onCheckedChange={(checked) => onChange({ ...content, moderationEnabled: checked })}
        />
        <Label htmlFor="moderationEnabled">Enable moderation (tutors can pin/lock threads)</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Categories (optional)</Label>
          <Button variant="outline" size="sm" onClick={addCategory}>
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
        {categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((cat: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={cat}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  placeholder={`Category ${index + 1} (e.g., Homework)`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeCategory(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No categories defined. Questions will be untagged.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Gap Fill Block Editor ---
function GapFillBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const sentences = content.sentences || [];
  const generateId = () => `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addSentence = () => {
    onChange({
      ...content,
      sentences: [...sentences, {
        id: generateId(),
        textWithBlanks: 'The answer is {{1}}.',
        blanks: [{ id: generateId(), acceptedAnswers: [''] }],
      }],
    });
  };

  const updateSentence = (index: number, updates: any) => {
    const updated = [...sentences];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...content, sentences: updated });
  };

  const removeSentence = (index: number) => {
    onChange({ ...content, sentences: sentences.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Instruction</Label>
        <Input value={content.instruction || ''} onChange={(e) => onChange({ ...content, instruction: e.target.value })} />
      </div>
      {sentences.map((sentence: any, si: number) => (
        <div key={sentence.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>Sentence {si + 1}</Label>
            {sentences.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeSentence(si)}><Trash2 className="h-4 w-4" /></Button>
            )}
          </div>
          <Textarea
            value={sentence.textWithBlanks}
            onChange={(e) => updateSentence(si, { textWithBlanks: e.target.value })}
            placeholder="Use {{1}}, {{2}} for blanks"
          />
          <div className="space-y-2">
            <Label className="text-xs">Accepted answers per blank</Label>
            {sentence.blanks?.map((blank: any, bi: number) => (
              <div key={blank.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Blank {bi + 1}:</span>
                <Input
                  value={blank.acceptedAnswers?.join(', ') || ''}
                  onChange={(e) => {
                    const blanks = [...sentence.blanks];
                    blanks[bi] = { ...blanks[bi], acceptedAnswers: e.target.value.split(',').map((a: string) => a.trim()) };
                    updateSentence(si, { blanks });
                  }}
                  placeholder="answer1, answer2"
                  className="flex-1"
                />
                <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={blank.caseSensitive === true}
                    onChange={(e) => {
                      const blanks = [...sentence.blanks];
                      blanks[bi] = { ...blanks[bi], caseSensitive: e.target.checked };
                      updateSentence(si, { blanks });
                    }}
                    className="rounded"
                  />
                  Case sensitive
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addSentence} className="gap-2">
        <Plus className="h-4 w-4" /> Add Sentence
      </Button>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={content.showCorrectAfter !== false} onCheckedChange={(v) => onChange({ ...content, showCorrectAfter: v })} />
          <Label className="text-sm">Show correct answers after</Label>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Scoring</Label>
          <Select value={content.scoringMode || 'partial-credit'} onValueChange={(v) => onChange({ ...content, scoringMode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-or-nothing">All or nothing</SelectItem>
              <SelectItem value="partial-credit">Partial credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Input Mode</Label>
        <Select value={content.mode || 'text'} onValueChange={(v) => onChange({ ...content, mode: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text input (students type answers)</SelectItem>
            <SelectItem value="dropdown">Dropdown (students select from word bank)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {content.mode === 'dropdown' ? 'Blanks show a dropdown with shuffled options from all accepted answers' : 'Students type their answers into blank fields'}
        </p>
      </div>
    </div>
  );
}

// --- Poll Block Editor ---
function PollBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const options = content.options || [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input value={content.question || ''} onChange={(e) => onChange({ ...content, question: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((opt: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={opt}
              onChange={(e) => {
                const updated = [...options];
                updated[i] = e.target.value;
                onChange({ ...content, options: updated });
              }}
              placeholder={`Option ${i + 1}`}
            />
            {options.length > 2 && (
              <Button variant="ghost" size="sm" onClick={() => onChange({ ...content, options: options.filter((_: any, j: number) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange({ ...content, options: [...options, ''] })} className="gap-2">
          <Plus className="h-4 w-4" /> Add Option
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={content.allowMultiple || false} onCheckedChange={(v) => onChange({ ...content, allowMultiple: v })} />
          <Label className="text-sm">Allow multiple</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={content.showResults !== false} onCheckedChange={(v) => onChange({ ...content, showResults: v })} />
          <Label className="text-sm">Show results</Label>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Chart Type</Label>
        <Select value={content.chartType || 'bar'} onValueChange={(v) => onChange({ ...content, chartType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// --- Reveal Block Editor ---
function RevealBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const sections = content.sections || [];
  const generateId = () => `r-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addSection = () => {
    onChange({
      ...content,
      sections: [...sections, { id: generateId(), title: 'New Section', content: '<p>Content here...</p>' }],
    });
  };

  const updateSection = (index: number, updates: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...content, sections: updated });
  };

  const removeSection = (index: number) => {
    onChange({ ...content, sections: sections.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Style</Label>
        <Select value={content.style || 'accordion'} onValueChange={(v) => onChange({ ...content, style: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="accordion">Accordion</SelectItem>
            <SelectItem value="click-to-reveal">Click to Reveal</SelectItem>
            <SelectItem value="tabs">Tabs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {sections.map((section: any, i: number) => (
        <div key={section.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label>Section {i + 1}</Label>
            {sections.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeSection(i)}><Trash2 className="h-4 w-4" /></Button>
            )}
          </div>
          <Input value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} placeholder="Section title" />
          <RichTextEditor value={section.content} onChange={(v) => updateSection(i, { content: v })} minHeight="100px" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addSection} className="gap-2">
        <Plus className="h-4 w-4" /> Add Section
      </Button>
      <div className="flex items-center gap-2">
        <Switch checked={content.allowMultipleOpen || false} onCheckedChange={(v) => onChange({ ...content, allowMultipleOpen: v })} />
        <Label className="text-sm">Allow multiple sections open</Label>
      </div>
    </div>
  );
}

// --- File Upload Block Editor ---
function FileUploadBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea value={content.prompt || ''} onChange={(e) => onChange({ ...content, prompt: e.target.value })} placeholder="Instructions for students..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Max File Size (MB)</Label>
          <Input type="number" value={content.maxFileSize || 20} onChange={(e) => onChange({ ...content, maxFileSize: parseInt(e.target.value) || 20 })} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Files</Label>
          <Input type="number" value={content.maxFiles || 1} onChange={(e) => onChange({ ...content, maxFiles: parseInt(e.target.value) || 1 })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Allowed File Types</Label>
        <div className="flex flex-wrap gap-2">
          {['document', 'image', 'video', 'audio', 'presentation'].map(type => (
            <label key={type} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={(content.allowedTypes || []).includes(type)}
                onChange={(e) => {
                  const types = content.allowedTypes || [];
                  onChange({
                    ...content,
                    allowedTypes: e.target.checked ? [...types, type] : types.filter((t: string) => t !== type),
                  });
                }}
                className="rounded"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rubric (optional)</Label>
        <Textarea value={content.rubric || ''} onChange={(e) => onChange({ ...content, rubric: e.target.value })} placeholder="Grading criteria..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={content.mustSubmitToComplete !== false} onCheckedChange={(v) => onChange({ ...content, mustSubmitToComplete: v })} />
        <Label className="text-sm">Must submit to complete</Label>
      </div>
    </div>
  );
}

// Helper function
function getBlockTypeLabel(type: BlockType): string {
  const labels: Record<BlockType, string> = {
    text: "Text Block",
    video: "Video",
    image: "Image",
    "micro-quiz": "Micro-Quiz",
    "drag-drop-reorder": "Reorder Activity",
    whiteboard: "Whiteboard Activity",
    reflection: "Reflection",
    "qa-thread": "Q&A Thread",
    resource: "Resource",
    divider: "Divider",
    "gap-fill": "Gap Fill",
    poll: "Poll",
    reveal: "Reveal",
    "file-upload": "File Upload",
  };
  return labels[type] || "Block";
}
