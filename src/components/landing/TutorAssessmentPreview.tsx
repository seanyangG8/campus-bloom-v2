import { useEffect, useRef, useState } from "react";
import { 
  CheckCircle2,
  Circle,
  GripVertical,
  SquareCheck,
  ToggleLeft,
  Type,
  ListOrdered,
  Plus,
} from "lucide-react";

export function TutorAssessmentPreview() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [showNewEditor, setShowNewEditor] = useState(false);
  const [editorStage, setEditorStage] = useState(0);
  const [selectionStage, setSelectionStage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (hasAnimated || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
      
      if (isVisible && window.scrollY > 50) {
        setIsAnimating(true);
        setHasAnimated(true);
        
        // Show new question after drag animation completes
        setTimeout(() => {
          setShowNewQuestion(true);
        }, 2400);
        
        // Update editor to show new question type with progressive reveal
        setTimeout(() => {
          setShowNewEditor(true);
          // Progressive editor build-out - SLOWER timing
          setTimeout(() => setEditorStage(1), 0);       // Header
          setTimeout(() => setEditorStage(2), 300);     // Question text starts typing (1.5s duration)
          setTimeout(() => setEditorStage(3), 2000);    // Option 1 (after typing done)
          setTimeout(() => setEditorStage(4), 2600);    // Option 2 (600ms gap)
          setTimeout(() => setEditorStage(5), 3200);    // Option 3
          setTimeout(() => setEditorStage(6), 3800);    // Option 4
          setTimeout(() => setEditorStage(7), 4400);    // Points input
          setTimeout(() => setEditorStage(8), 4800);    // Add option button
          
          // Selection phase - cursor clicks correct answers
          setTimeout(() => setSelectionStage(1), 5600); // Cursor appears, clicks option "2"
          setTimeout(() => setSelectionStage(2), 6400); // Cursor moves, clicks option "7"
        }, 2600);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  return (
    <div 
      ref={containerRef}
      className={`tutor-preview-container relative w-full h-full bg-gradient-to-br from-muted/30 to-muted/50 overflow-hidden ${isAnimating ? 'animate' : 'paused'}`}
    >
      {/* Browser Chrome - Always visible, entire UI static from start */}
      <div className="absolute inset-3 bg-background rounded-lg shadow-lg border overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="h-8 bg-muted/50 border-b flex items-center px-3 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background/80 rounded px-3 py-0.5 text-[10px] text-muted-foreground">
              app.learncampus.com/assessments/new
            </div>
          </div>
        </div>

        {/* Assessment Builder Header */}
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Chapter 5 Quiz</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] text-muted-foreground anim-count ${showNewQuestion ? 'updated' : ''}`}>
                {showNewQuestion ? '4' : '3'} questions
              </span>
              <span className="text-[9px] text-muted-foreground">•</span>
              <span className={`text-[9px] text-muted-foreground anim-count ${showNewQuestion ? 'updated' : ''}`}>
                {showNewQuestion ? '35' : '25'} pts
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="px-2 py-1 bg-muted text-muted-foreground rounded text-[9px]">Preview</div>
            <div className="px-2 py-1 bg-primary text-primary-foreground rounded text-[9px]">Publish</div>
          </div>
        </div>

        {/* 3-Column Layout - Entirely visible from start */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Question List */}
          <div className="w-[140px] border-r p-2 bg-muted/20 relative">
            <p className="text-[9px] font-medium text-muted-foreground mb-2">Questions</p>
            
            <div className="space-y-1">
              <div className={`flex items-center gap-1.5 p-1.5 rounded border text-[9px] ${!showNewEditor ? 'bg-primary/10 border-primary/30' : 'bg-background'}`}>
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
                <ToggleLeft className="h-2.5 w-2.5 text-primary" />
                <span className="flex-1 truncate">True / False</span>
                <span className="text-[8px] text-muted-foreground">5</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-background border text-[9px]">
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
                <Type className="h-2.5 w-2.5 text-primary" />
                <span className="flex-1 truncate">Fill in blank</span>
                <span className="text-[8px] text-muted-foreground">10</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded bg-background border text-[9px]">
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
                <ListOrdered className="h-2.5 w-2.5 text-primary" />
                <span className="flex-1 truncate">Ordering</span>
                <span className="text-[8px] text-muted-foreground">10</span>
              </div>
              
              {/* New Question - HIDDEN initially, expands after drag completes */}
              <div className={`anim-new-question flex items-center gap-1.5 p-1.5 rounded border text-[9px] ${showNewQuestion ? 'bg-primary/10 border-primary/30' : 'bg-background'}`}>
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
                <SquareCheck className="h-2.5 w-2.5 text-success" />
                <span className="flex-1 truncate">Multi-select</span>
                <span className="text-[8px] text-muted-foreground">10</span>
              </div>
            </div>
          </div>

          {/* Center: Question Editor - Updates to show new question type */}
          <div className="flex-1 p-3 relative">
            {/* Drop Zone Highlight - animates during drag in center */}
            <div className="anim-drop-zone absolute inset-3 rounded-lg pointer-events-none z-10" />
            
            <div className={`anim-editor bg-card rounded-lg border p-3 transition-all duration-300 ${showNewEditor ? 'ring-2 ring-primary/20' : ''}`}>
              {showNewEditor ? (
                // New Multi-select question editor with progressive reveal
                <>
                  <div className={`flex items-center gap-2 mb-3 anim-editor-item ${editorStage >= 1 ? 'visible' : ''}`}>
                    <SquareCheck className="h-4 w-4 text-success" />
                    <span className="text-[10px] font-medium">Multi-select</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">10 points</span>
                  </div>
                  
                  <div className={`mb-3 anim-editor-item ${editorStage >= 2 ? 'visible' : ''}`}>
                    <p className="text-[11px] font-medium mb-2">
                      <span className="anim-typing">Select all the prime numbers:</span>
                    </p>
                  </div>
                  
                  {/* Options - appear with EMPTY checkboxes first, then get selected */}
                  <div className="space-y-1.5 mb-3 relative">
                    {/* Option 2 (prime - will be selected) */}
                    <div className={`anim-option flex items-center gap-2 p-2 rounded border transition-all duration-300 anim-editor-item ${editorStage >= 3 ? 'visible' : ''} ${selectionStage >= 1 ? 'selected' : ''}`}>
                      {selectionStage >= 1 ? (
                        <SquareCheck className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded border border-muted-foreground" />
                      )}
                      <span className="text-[10px]">2</span>
                      {selectionStage >= 1 && <span className="ml-auto text-[8px] text-success">Correct</span>}
                    </div>
                    
                    {/* Option 4 (not prime) */}
                    <div className={`flex items-center gap-2 p-2 rounded border anim-editor-item ${editorStage >= 4 ? 'visible' : ''}`}>
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground" />
                      <span className="text-[10px]">4</span>
                    </div>
                    
                    {/* Option 7 (prime - will be selected) */}
                    <div className={`anim-option flex items-center gap-2 p-2 rounded border transition-all duration-300 anim-editor-item ${editorStage >= 5 ? 'visible' : ''} ${selectionStage >= 2 ? 'selected' : ''}`}>
                      {selectionStage >= 2 ? (
                        <SquareCheck className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded border border-muted-foreground" />
                      )}
                      <span className="text-[10px]">7</span>
                      {selectionStage >= 2 && <span className="ml-auto text-[8px] text-success">Correct</span>}
                    </div>
                    
                    {/* Option 9 (not prime) */}
                    <div className={`flex items-center gap-2 p-2 rounded border anim-editor-item ${editorStage >= 6 ? 'visible' : ''}`}>
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground" />
                      <span className="text-[10px]">9</span>
                    </div>
                    
                    {/* Selection cursor - appears during selection phase */}
                    <div className={`anim-select-cursor absolute pointer-events-none ${selectionStage >= 1 ? 'visible' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 drop-shadow-lg">
                        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" fill="white" stroke="black" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 pt-2 border-t anim-editor-item ${editorStage >= 7 ? 'visible' : ''}`}>
                    <span className="text-[9px] text-muted-foreground">Points:</span>
                    <div className="w-12 h-6 rounded border bg-background flex items-center justify-center text-[10px]">10</div>
                  </div>
                  
                  {/* Add Option Button */}
                  <div className={`flex items-center gap-1.5 mt-3 anim-editor-item anim-add-option ${editorStage >= 8 ? 'visible' : ''}`}>
                    <button className="flex items-center gap-1 px-2 py-1 rounded border border-dashed border-muted-foreground/50 text-[9px] text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Plus className="h-3 w-3" />
                      Add option
                    </button>
                  </div>
                </>
              ) : (
                // Original True/False question editor
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <ToggleLeft className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium">True / False</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">5 points</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-[11px] font-medium mb-2">All quadrilaterals have exactly 4 sides.</p>
                  </div>
                  
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 p-2 rounded border bg-success/5 border-success/30">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span className="text-[10px]">True</span>
                      <span className="ml-auto text-[8px] text-success">Correct</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border">
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px]">False</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-[9px] text-muted-foreground">Points:</span>
                    <div className="w-12 h-6 rounded border bg-background flex items-center justify-center text-[10px]">5</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Question Library */}
          <div className="w-[130px] border-l p-2 bg-muted/20 relative">
            <p className="text-[9px] font-medium text-muted-foreground mb-1.5">Question Types</p>
            <p className="text-[8px] text-muted-foreground mb-2 anim-drag-hint">Drag to add</p>
            
            <div className="space-y-1">
              <div className="text-[8px] text-muted-foreground mb-1">Auto-Graded</div>
              <div className="flex items-center gap-1.5 p-1.5 rounded border bg-background text-[9px]">
                <Circle className="h-2.5 w-2.5 text-muted-foreground" />
                <span>Multiple choice</span>
              </div>
              
              {/* Multi-select - the dragged item */}
              <div className="anim-drag-source flex items-center gap-1.5 p-1.5 rounded border bg-background text-[9px] relative">
                <SquareCheck className="h-2.5 w-2.5 text-muted-foreground" />
                <span>Multi-select</span>
              </div>
              
              <div className="flex items-center gap-1.5 p-1.5 rounded border bg-background text-[9px]">
                <ToggleLeft className="h-2.5 w-2.5 text-muted-foreground" />
                <span>True / False</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded border bg-background text-[9px]">
                <Type className="h-2.5 w-2.5 text-muted-foreground" />
                <span>Fill in blank</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor and Ghost at ROOT level - NOT clipped by any container */}
      {/* Cursor - Larger for visibility */}
      <div className="anim-cursor absolute w-8 h-8 pointer-events-none z-50">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-lg">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" fill="white" stroke="black" strokeWidth="1.5"/>
        </svg>
      </div>
      
      {/* Dragging Ghost Element - Same size as source */}
      <div className="anim-drag-ghost absolute flex items-center gap-1.5 p-1.5 rounded border-2 border-primary bg-primary/10 text-[9px] shadow-lg pointer-events-none z-40">
        <SquareCheck className="h-2.5 w-2.5 text-primary" />
        <span className="font-medium">Multi-select</span>
      </div>

      <style>{`
        /* No opacity hiding on structural elements - UI is fully visible from start */
        
        /* Only animated elements start hidden */
        .tutor-preview-container.paused .anim-cursor,
        .tutor-preview-container.paused .anim-drag-ghost {
          opacity: 0;
        }
        
        .tutor-preview-container.paused .anim-drop-zone {
          opacity: 0;
        }
        
        /* New question is COMPLETELY hidden initially */
        .tutor-preview-container.paused .anim-new-question {
          opacity: 0;
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          margin: 0;
          overflow: hidden;
          visibility: hidden;
        }
        
        /* Selection cursor hidden initially */
        .anim-select-cursor {
          opacity: 0;
          left: 10px;
          top: 8px;
        }
        
        /* Drag hint pulses to draw attention */
        .tutor-preview-container.animate .anim-drag-hint {
          animation: tutor-hint-pulse 0.6s ease-in-out 0.3s;
        }
        
        /* Cursor appears and moves to center editor - POSITIONED FROM ROOT */
        .tutor-preview-container.animate .anim-cursor {
          opacity: 0;
          left: calc(100% - 55px);
          top: 125px;
          animation: 
            tutor-cursor-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards,
            tutor-cursor-move 1.4s cubic-bezier(0.4, 0, 0.2, 1) 1.0s forwards,
            tutor-cursor-fade-out 0.3s ease-out 2.4s forwards;
        }
        
        /* Ghost appears when drag starts - same size as source - POSITIONED FROM ROOT */
        .tutor-preview-container.animate .anim-drag-ghost {
          opacity: 0;
          left: calc(100% - 55px);
          top: 120px;
          animation: 
            tutor-ghost-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards,
            tutor-ghost-move 1.4s cubic-bezier(0.4, 0, 0.2, 1) 1.0s forwards;
        }
        
        /* Drop zone highlight during drag - in center editor */
        .tutor-preview-container.animate .anim-drop-zone {
          animation: tutor-drop-zone 1.4s ease-in-out 1.0s forwards;
        }
        
        /* Source item dims during drag */
        .tutor-preview-container.animate .anim-drag-source {
          animation: tutor-source-dim 0.2s ease-out 0.9s forwards;
        }
        
        /* New question expands after drop - includes visibility fix */
        .tutor-preview-container.animate .anim-new-question {
          visibility: visible;
          animation: tutor-new-question 0.5s cubic-bezier(0.16, 1, 0.3, 1) 2.4s forwards;
        }
        
        /* Count badges pulse when updating */
        .anim-count.updated {
          animation: tutor-count-pulse 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Option gets selected styling */
        .anim-option.selected {
          background: hsl(var(--success) / 0.05);
          border-color: hsl(var(--success) / 0.3);
        }
        
        /* Selection cursor animation */
        .anim-select-cursor.visible {
          animation: tutor-select-cursor 1.6s ease-in-out forwards;
        }
        
        @keyframes tutor-select-cursor {
          0% { 
            opacity: 1; 
            left: 10px; 
            top: 8px;
            transform: scale(1);
          }
          15% { 
            opacity: 1; 
            left: 10px; 
            top: 8px;
            transform: scale(0.85);
          }
          20% { 
            transform: scale(1);
          }
          45% { 
            opacity: 1; 
            left: 10px; 
            top: 8px;
          }
          70% { 
            opacity: 1; 
            left: 10px; 
            top: 68px;
            transform: scale(1);
          }
          80% { 
            transform: scale(0.85);
          }
          85% { 
            transform: scale(1);
          }
          100% { 
            opacity: 0; 
            left: 10px; 
            top: 68px;
          }
        }
        
        @keyframes tutor-hint-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; color: hsl(var(--primary)); }
        }
        
        @keyframes tutor-cursor-appear {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* Cursor moves from right panel to CENTER of editor */
        @keyframes tutor-cursor-move {
          0% { left: calc(100% - 55px); top: 125px; }
          25% { left: calc(100% - 55px); top: 125px; }
          100% { left: 50%; top: 160px; transform: translateX(-50%); }
        }
        
        /* Cursor fades out after drag completes */
        @keyframes tutor-cursor-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes tutor-ghost-appear {
          from { opacity: 0; transform: scale(0.9) rotate(-2deg); }
          to { opacity: 0.95; transform: scale(1) rotate(0deg); }
        }
        
        /* Ghost moves to CENTER of editor area */
        @keyframes tutor-ghost-move {
          0% { left: calc(100% - 55px); top: 120px; opacity: 0.95; transform: scale(1); }
          25% { left: calc(100% - 55px); top: 120px; opacity: 0.95; transform: scale(1); }
          85% { left: 50%; top: 155px; opacity: 0.95; transform: scale(1) translateX(-50%); }
          95% { left: 50%; top: 155px; opacity: 0.5; transform: scale(0.95) translateX(-50%); }
          100% { left: 50%; top: 155px; opacity: 0; transform: scale(0.9) translateX(-50%); }
        }
        
        @keyframes tutor-drop-zone {
          0% { 
            opacity: 0; 
            border: 2px dashed transparent; 
            background: transparent; 
          }
          15% { 
            opacity: 1; 
            border: 3px dashed hsl(var(--primary)); 
            background: hsl(var(--primary) / 0.1);
            box-shadow: 0 0 20px hsl(var(--primary) / 0.2);
          }
          75% { 
            opacity: 1; 
            border: 3px dashed hsl(var(--primary)); 
            background: hsl(var(--primary) / 0.1);
            box-shadow: 0 0 20px hsl(var(--primary) / 0.2);
          }
          85% {
            opacity: 1;
            border: 3px solid hsl(var(--success));
            background: hsl(var(--success) / 0.15);
            box-shadow: 0 0 30px hsl(var(--success) / 0.3);
          }
          100% { 
            opacity: 0; 
            border: 2px dashed transparent; 
            background: transparent; 
          }
        }
        
        @keyframes tutor-source-dim {
          from { opacity: 1; }
          to { opacity: 0.3; }
        }
        
        @keyframes tutor-new-question {
          from { 
            opacity: 0; 
            max-height: 0; 
            padding-top: 0;
            padding-bottom: 0;
            margin: 0;
          }
          to { 
            opacity: 1; 
            max-height: 36px; 
            padding-top: 6px;
            padding-bottom: 6px;
            margin-top: 4px;
          }
        }
        
        @keyframes tutor-count-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); color: hsl(var(--success)); }
          100% { transform: scale(1); }
        }
        
        /* Progressive editor item reveal */
        .anim-editor-item {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        
        .anim-editor-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Typing animation for question text - FIXED to stop at end of text */
        .anim-editor-item.visible .anim-typing {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid hsl(var(--primary));
          animation: 
            tutor-typing 1.5s steps(30, end) forwards,
            tutor-blink-caret 0.5s step-end 4;
          width: 0;
        }
        
        @keyframes tutor-typing {
          from { width: 0; }
          to { width: max-content; border-right-color: transparent; }
        }
        
        @keyframes tutor-blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: hsl(var(--primary)); }
        }
        
        /* Add option button special animation */
        .anim-add-option.visible {
          animation: tutor-add-option-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes tutor-add-option-pop {
          0% { opacity: 0; transform: translateY(8px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
