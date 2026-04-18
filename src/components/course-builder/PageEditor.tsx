import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  GripVertical,
  Trash2,
  MoreVertical,
  Type,
  Play,
  Image,
  HelpCircle,
  ListOrdered,
  PenTool,
  MessageSquare,
  FileText,
  Minus,
  Copy,
  Edit,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Info,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Block, BlockType, Page } from "@/lib/demo-data";
import { useCourseBuilder } from "@/contexts/CourseBuilderContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockEditorDialog } from "./BlockEditorDialog";
import { CompletionRulesSummary } from "./CompletionRulesSummary";

const iconMap: Record<BlockType, any> = {
  text: Type,
  video: Play,
  image: Image,
  "micro-quiz": HelpCircle,
  "drag-drop-reorder": ListOrdered,
  whiteboard: PenTool,
  reflection: MessageSquare,
  "qa-thread": MessageSquare,
  resource: FileText,
  divider: Minus,
  "gap-fill": Type,
  poll: HelpCircle,
  reveal: ListOrdered,
  "file-upload": FileText,
};

interface PageEditorProps {
  pageId: string;
  isAdmin: boolean;
}

export function PageEditor({ pageId, isAdmin }: PageEditorProps) {
  const { pages, getBlocksByPage, updatePage, addBlock, studentProgress } = useCourseBuilder();
  const page = pages.find((p) => p.id === pageId);
  const blocks = getBlocksByPage(pageId);

  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isLibraryDrag, setIsLibraryDrag] = useState(false);

  if (!page) return null;

  // Use live studentProgress map (not stale block.isCompleted flag) so the
  // student footer reflects real-time completion as blocks are interacted with.
  const countableBlocks = blocks.filter((b) => b.type !== 'divider' && b.type !== 'qa-thread');
  const completedBlocks = countableBlocks.filter((b) => {
    const p = studentProgress.get(b.id);
    return p?.status === 'completed' || b.isCompleted;
  }).length;
  const requiredBlocks = blocks.filter((b) => b.isRequired).length;

  // Check if drag is from library
  const hasBlockType = (e: React.DragEvent) => {
    return e.dataTransfer.types.some(t => t.toLowerCase() === "blocktype");
  };

  const handleInsertBlock = useCallback((index: number, blockType: BlockType) => {
    addBlock(pageId, blockType, undefined, index);
  }, [addBlock, pageId]);

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{page.title}</h2>
            <p className="text-sm text-muted-foreground">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''} • {requiredBlocks} required
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="gating"
                        checked={page.isLocked}
                        onCheckedChange={(checked) => updatePage(pageId, { isLocked: checked })}
                      />
                      <Label htmlFor="gating" className="text-sm cursor-pointer flex items-center gap-1">
                        Gate page
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[250px]">
                    <p className="text-xs">
                      When enabled, students must complete this page before accessing the next page.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="ghost" size="icon" onClick={() => setPageSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Completion Rules Summary */}
        {isAdmin && blocks.length > 0 && (
          <CompletionRulesSummary blocks={blocks} isGated={page.isLocked} />
        )}
      </div>

      {/* Blocks List - Full area drop zone */}
      <FullAreaDropZone
        pageId={pageId}
        blocks={blocks}
        isAdmin={isAdmin}
        dropTargetIndex={dropTargetIndex}
        setDropTargetIndex={setDropTargetIndex}
        isLibraryDrag={isLibraryDrag}
        setIsLibraryDrag={setIsLibraryDrag}
        onInsertBlock={handleInsertBlock}
        draggedBlockId={draggedBlockId}
        setDraggedBlockId={setDraggedBlockId}
        onEditBlock={setEditingBlock}
      />

      {/* Page Footer - Progress for students */}
      {!isAdmin && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden w-32">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{
                    width: countableBlocks.length > 0 ? `${(completedBlocks / countableBlocks.length) * 100}%` : "0%",
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedBlocks} of {countableBlocks.length} blocks complete
              </span>
            </div>
            <Button
              className="gradient-accent text-accent-foreground"
              disabled={page.isCompleted}
            >
              {page.isCompleted ? "Completed" : "Mark as Complete"}
            </Button>
          </div>
        </div>
      )}

      {/* Block Editor Dialog */}
      <BlockEditorDialog
        block={editingBlock}
        open={!!editingBlock}
        onOpenChange={(open) => !open && setEditingBlock(null)}
      />

      {/* Page Settings Dialog */}
      <PageSettingsDialog
        page={page}
        open={pageSettingsOpen}
        onOpenChange={setPageSettingsOpen}
      />
    </div>
  );
}

// Full Area Drop Zone - allows dropping anywhere and auto-calculates position
function FullAreaDropZone({
  pageId,
  blocks,
  isAdmin,
  dropTargetIndex,
  setDropTargetIndex,
  isLibraryDrag,
  setIsLibraryDrag,
  onInsertBlock,
  draggedBlockId,
  setDraggedBlockId,
  onEditBlock,
}: {
  pageId: string;
  blocks: Block[];
  isAdmin: boolean;
  dropTargetIndex: number | null;
  setDropTargetIndex: (index: number | null) => void;
  isLibraryDrag: boolean;
  setIsLibraryDrag: (value: boolean) => void;
  onInsertBlock: (index: number, blockType: BlockType) => void;
  draggedBlockId: string | null;
  setDraggedBlockId: (id: string | null) => void;
  onEditBlock: (block: Block) => void;
}) {
  const { reorderBlocks } = useCourseBuilder();

  const hasBlockType = (e: React.DragEvent) => {
    return e.dataTransfer.types.some(t => t.toLowerCase() === "blocktype");
  };

  const hasReorderBlockId = (e: React.DragEvent) => {
    return e.dataTransfer.types.some(t => t.toLowerCase() === "reorderblockid");
  };

  // Calculate insert position based on cursor Y position
  const calculateInsertIndex = useCallback((e: React.DragEvent): number => {
    const container = e.currentTarget as HTMLElement;
    const blockElements = container.querySelectorAll('[data-block-index]');
    
    if (blockElements.length === 0) return 0;

    const mouseY = e.clientY;
    
    for (let i = 0; i < blockElements.length; i++) {
      const rect = blockElements[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (mouseY < midY) {
        return i;
      }
    }
    
    return blockElements.length;
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    if (hasBlockType(e) || hasReorderBlockId(e)) {
      e.preventDefault();
      const insertIndex = calculateInsertIndex(e);
      
      if (hasBlockType(e)) {
        setIsLibraryDrag(true);
        setDropTargetIndex(insertIndex);
      } else if (hasReorderBlockId(e)) {
        setIsLibraryDrag(false);
        setDropTargetIndex(insertIndex);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetIndex(null);
      setIsLibraryDrag(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const blockType = e.dataTransfer.getData("blockType") as BlockType;
    const reorderBlockId = e.dataTransfer.getData("reorderBlockId");
    
    if (blockType && dropTargetIndex !== null) {
      onInsertBlock(dropTargetIndex, blockType);
    } else if (reorderBlockId && dropTargetIndex !== null) {
      const draggedIndex = blocks.findIndex(b => b.id === reorderBlockId);
      if (draggedIndex !== -1 && draggedIndex !== dropTargetIndex && draggedIndex !== dropTargetIndex - 1) {
        const newOrder = [...blocks];
        const [removed] = newOrder.splice(draggedIndex, 1);
        const insertAt = dropTargetIndex > draggedIndex ? dropTargetIndex - 1 : dropTargetIndex;
        newOrder.splice(insertAt, 0, removed);
        reorderBlocks(pageId, newOrder.map(b => b.id));
      }
    }
    
    setDropTargetIndex(null);
    setIsLibraryDrag(false);
    setDraggedBlockId(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <EmptyDropZone pageId={pageId} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 scrollbar-thin"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-0">
        {blocks.map((block, index) => {
          // Calculate if drop indicator should be shown
          // For reordering: don't show indicator directly above or below the dragged block
          const draggedIndex = draggedBlockId ? blocks.findIndex(b => b.id === draggedBlockId) : -1;
          const isReordering = !isLibraryDrag && draggedBlockId !== null;
          const wouldResultInNoChange = isReordering && (
            index === draggedIndex || // directly above dragged block
            index === draggedIndex + 1 // directly below dragged block (same position after move)
          );
          const showIndicator = dropTargetIndex === index && !wouldResultInNoChange;
          
          return (
            <div key={block.id} data-block-index={index}>
              {/* Drop indicator before block */}
              <DropIndicator 
                isActive={showIndicator} 
                isLibraryDrag={isLibraryDrag}
              />
              
              <DraggableBlockCard
                block={block}
                blocks={blocks}
                isAdmin={isAdmin}
                onEdit={() => onEditBlock(block)}
                isDragging={draggedBlockId === block.id}
                onDragStart={() => setDraggedBlockId(block.id)}
                onDragEnd={() => setDraggedBlockId(null)}
                pageId={pageId}
              />
            </div>
          );
        })}
        
        {/* Drop indicator at end - also check if it's the same position */}
        {(() => {
          const draggedIndex = draggedBlockId ? blocks.findIndex(b => b.id === draggedBlockId) : -1;
          const isReordering = !isLibraryDrag && draggedBlockId !== null;
          const wouldResultInNoChange = isReordering && draggedIndex === blocks.length - 1;
          const showIndicator = dropTargetIndex === blocks.length && !wouldResultInNoChange;
          
          return (
            <DropIndicator 
              isActive={showIndicator} 
              isLibraryDrag={isLibraryDrag}
            />
          );
        })()}
      </div>
    </div>
  );
}

// Drop Indicator - smooth animated line showing where block will be inserted
function DropIndicator({ isActive, isLibraryDrag }: { isActive: boolean; isLibraryDrag: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isActive ? 64 : 0,
        opacity: isActive ? 1 : 0,
        marginTop: isActive ? 8 : 0,
        marginBottom: isActive ? 8 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
      }}
      className="relative flex items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isActive ? 1 : 0.98,
          opacity: isActive ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          "w-full h-12 rounded-lg border-2 border-dashed flex items-center justify-center",
          isLibraryDrag 
            ? "border-primary bg-primary/10" 
            : "border-accent bg-accent/10"
        )}
      >
        <p className={cn(
          "text-sm font-medium",
          isLibraryDrag ? "text-primary" : "text-accent"
        )}>
          {isLibraryDrag ? "Drop to insert" : "Move here"}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Empty state drop zone
function EmptyDropZone({ pageId, isAdmin }: { pageId: string; isAdmin: boolean }) {
  const { addBlock } = useCourseBuilder();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const hasBlockType = (e: React.DragEvent) => {
    return e.dataTransfer.types.some(t => t.toLowerCase() === "blocktype");
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (hasBlockType(e)) {
      e.preventDefault();
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const blockType = e.dataTransfer.getData("blockType") as BlockType;
    if (blockType && isAdmin) {
      addBlock(pageId, blockType);
    }
  };

  return (
    <div 
      className={cn(
        "h-full flex items-center justify-center transition-all",
        isDraggingOver && "bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        "text-center py-12 border-2 border-dashed rounded-xl w-full transition-colors",
        isDraggingOver ? "border-primary bg-primary/10" : "border-muted"
      )}>
        <p className="text-muted-foreground mb-2">
          {isDraggingOver ? "Drop to add block" : "No blocks yet"}
        </p>
        <p className="text-sm text-muted-foreground">
          Drag blocks from the library to add content
        </p>
      </div>
    </div>
  );
}

// Draggable Block Card with smooth animations
function DraggableBlockCard({
  block,
  blocks,
  isAdmin,
  onEdit,
  isDragging,
  onDragStart,
  onDragEnd,
  pageId,
}: {
  block: Block;
  blocks: Block[];
  isAdmin: boolean;
  onEdit: () => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  pageId: string;
}) {
  const { updateBlock, deleteBlock, duplicateBlock, reorderBlocks } = useCourseBuilder();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const Icon = iconMap[block.type] || Type;
  const isActiveBlock = [
    "micro-quiz",
    "drag-drop-reorder",
    "whiteboard",
    "reflection",
    "qa-thread",
    "gap-fill",
    "poll",
    "file-upload",
  ].includes(block.type);

  const currentIndex = blocks.findIndex((b) => b.id === block.id);

  const moveBlock = (direction: "up" | "down") => {
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newOrder = [...blocks];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    reorderBlocks(pageId, newOrder.map((b) => b.id));
  };

  // Handle reorder drag for existing blocks
  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.dataTransfer.setData("reorderBlockId", block.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart();
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  return (
    <>
      <div
        draggable={isAdmin}
        onDragStartCapture={handleDragStart}
        onDragEndCapture={handleDragEnd}
      >
        <motion.div
          layout
          layoutId={block.id}
          initial={false}
          animate={{ 
            scale: isDragging ? 1.03 : 1,
            y: isDragging ? -4 : 0,
            zIndex: isDragging ? 50 : 1,
          }}
          transition={{ 
            layout: { 
              type: "spring", 
              stiffness: 400, 
              damping: 28,
              mass: 0.8,
            },
            scale: { type: "spring", stiffness: 500, damping: 30 },
            y: { type: "spring", stiffness: 500, damping: 30 },
          }}
          style={{
            boxShadow: isDragging 
              ? "0 20px 50px -15px rgba(0,0,0,0.25), 0 10px 20px -10px rgba(0,0,0,0.15)" 
              : "0 1px 3px 0 rgba(0,0,0,0.1)",
          }}
          className={cn(
            "rounded-xl border bg-card my-2 cursor-default",
            isActiveBlock ? "bg-accent/5 border-accent/20" : "bg-card",
            block.isCompleted && "ring-2 ring-success/20",
            isDragging && "cursor-grabbing opacity-95",
            isAdmin && "cursor-grab"
          )}
        >
          <div className="p-4">
          <div className="flex items-start gap-3">
            {isAdmin && (
              <div className="pt-1 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isActiveBlock ? "bg-accent/10" : "bg-primary/10"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActiveBlock ? "text-accent" : "text-primary")}
              />
            </div>
            <div 
              className={cn(
                "flex-1 min-w-0",
                isAdmin && "cursor-pointer hover:bg-muted/50 rounded-lg transition-colors -m-2 p-2"
              )}
              onClick={() => isAdmin && onEdit()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{block.title}</h3>
                  {block.isRequired && (
                    <span className="text-xs text-accent font-medium">Required</span>
                  )}
                  {block.isCompleted && (
                    <span className="text-xs text-success font-medium">✓ Complete</span>
                  )}
                </div>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Block
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateBlock(block.id, { isRequired: !block.isRequired })
                        }
                      >
                        {block.isRequired ? "Mark as Optional" : "Mark as Required"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => moveBlock("up")}
                        disabled={currentIndex === 0}
                      >
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => moveBlock("down")}
                        disabled={currentIndex === blocks.length - 1}
                      >
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Move Down
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {block.type.replace("-", " ")}
                {block.content?.questions?.length &&
                  ` • ${block.content.questions.length} questions`}
                {block.content?.duration && ` • ${block.content.duration}`}
              </p>
            </div>
          </div>

          {/* Block Preview Content */}
          <BlockPreview block={block} isAdmin={isAdmin} />
        </div>
        </motion.div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{block.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteBlock(block.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Old BlockCard removed - using DraggableBlockCard above

// Block Preview Component with enhanced field display
function BlockPreview({ block, isAdmin }: { block: Block; isAdmin: boolean }) {
  if (block.type === "divider") {
    const style = block.content?.style || 'line';
    const spacing = block.content?.spacing || 'normal';
    
    return (
      <div className={cn(
        "mt-4 ml-11",
        spacing === 'compact' && "py-1",
        spacing === 'normal' && "py-2",
        spacing === 'large' && "py-4",
      )}>
        {style === 'line' && <hr className="border-t" />}
        {style === 'whitespace' && <div className="h-4" />}
        {style === 'section-break' && (
          <div className="text-center">
            <hr className="border-t mb-2" />
            {block.content?.sectionHeading && (
              <p className="font-semibold text-sm">{block.content.sectionHeading}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 ml-11">
      {block.type === "text" && (
        <div className={cn(
          "p-3 bg-muted/30 rounded-lg text-sm prose prose-sm max-w-none",
          block.content?.calloutStyle === 'info' && "bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-950/30",
          block.content?.calloutStyle === 'warning' && "bg-amber-50 border-l-4 border-amber-500 dark:bg-amber-950/30",
          block.content?.calloutStyle === 'tip' && "bg-green-50 border-l-4 border-green-500 dark:bg-green-950/30",
          block.content?.calloutStyle === 'success' && "bg-emerald-50 border-l-4 border-emerald-500 dark:bg-emerald-950/30",
        )}>
          {block.content?.html ? (
            <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
          ) : (
            <p className="text-muted-foreground italic">No content yet</p>
          )}
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-2">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            {block.content?.url ? (
              <div className="text-center">
                <Play className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{block.content.duration || "Video"}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No video URL set</p>
            )}
          </div>
          {block.content?.watchThreshold && (
            <p className="text-xs text-muted-foreground">
              Watch threshold: {block.content.watchThreshold}%
            </p>
          )}
          {block.content?.transcript && (
            <p className="text-xs text-muted-foreground">📝 Transcript available</p>
          )}
        </div>
      )}

      {block.type === "image" && (
        <div className={cn(
          "bg-muted rounded-lg flex items-center justify-center overflow-hidden",
          block.content?.displaySize === 'small' && "max-w-[25%]",
          block.content?.displaySize === 'medium' && "max-w-[50%]",
          block.content?.displaySize === 'large' && "max-w-[75%]",
        )}>
          {block.content?.url ? (
            <div>
              <img
                src={block.content.url}
                alt={block.content.alt || ""}
                className="w-full h-auto max-h-48 object-cover"
              />
              {block.content.caption && (
                <p className="text-xs text-center text-muted-foreground p-2">{block.content.caption}</p>
              )}
            </div>
          ) : (
            <div className="p-8">
              <Image className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
      )}

      {block.type === "micro-quiz" && (
        <div className="space-y-2">
          {block.content?.questions?.length > 0 ? (
            <>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize">
                    {block.content.questions[0].type || 'single-choice'}
                  </span>
                </div>
                Q1: {block.content.questions[0].question || "Enter question..."}
              </div>
              {(() => {
                const q = block.content.questions[0];
                const qType = q.type || 'single-choice';
                if (qType === 'short-answer') {
                  return (
                    <div className="p-2 border rounded-md bg-background text-sm text-muted-foreground italic">
                      {q.expectedAnswer ? `Expected: ${q.expectedAnswer}` : 'Short answer response...'}
                    </div>
                  );
                }
                if (qType === 'long-answer') {
                  const constraints = [
                    q.minWords ? `min ${q.minWords} words` : null,
                    q.maxWords ? `max ${q.maxWords} words` : null,
                  ].filter(Boolean).join(' • ');
                  return (
                    <div className="p-3 border rounded-md bg-background text-sm text-muted-foreground italic space-y-1">
                      <div>Rich text + math response (manual grading)</div>
                      {constraints && <div className="text-xs not-italic">{constraints}</div>}
                    </div>
                  );
                }
                if (qType === 'true-false') {
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="justify-start">True</Button>
                      <Button variant="outline" size="sm" className="justify-start">False</Button>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-2 gap-2">
                    {q.options?.map((opt: string, i: number) => (
                      <Button key={i} variant="outline" size="sm" className="justify-start">
                        {String.fromCharCode(65 + i)}) {opt || `Option ${i + 1}`}
                      </Button>
                    ))}
                  </div>
                );
              })()}
              {block.content.questions.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{block.content.questions.length - 1} more questions
                </p>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                {block.content.passMark && (
                  <span>Pass mark: {block.content.passMark}%</span>
                )}
                {block.content.shuffleQuestions && <span>• Shuffled</span>}
                {block.content.completionRule === 'passed' && <span>• Must pass</span>}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">No questions configured</p>
          )}
        </div>
      )}

      {block.type === "drag-drop-reorder" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {block.content?.instruction || "Reorder the items:"}
          </p>
          {block.content?.items?.length > 0 ? (
            <div className="space-y-1">
              {block.content.items.slice(0, 3).map((item: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded border"
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{item || `Item ${i + 1}`}</span>
                </div>
              ))}
              {block.content.items.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{block.content.items.length - 3} more items
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No items configured</p>
          )}
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{block.content?.scoringMode || 'all-or-nothing'}</span>
            {block.content?.showCorrectOrderAfter !== false && <span>• Shows correct order</span>}
          </div>
        </div>
      )}

      {block.type === "whiteboard" && (
        <div className={cn(
          "border-2 border-dashed rounded-lg flex items-center justify-center",
          block.content?.canvasSize === 'square' && "aspect-square h-32",
          block.content?.canvasSize === 'wide' && "aspect-video h-24",
          (!block.content?.canvasSize || block.content?.canvasSize === 'a4') && "aspect-[1/1.2] h-32",
          block.content?.background === 'grid' && "bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:12px_12px]",
          block.content?.background === 'ruled' && "bg-[linear-gradient(transparent_15px,#e5e7eb_16px)] bg-[size:100%_16px]",
        )}>
          <div className="text-center">
            <PenTool className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
            <p className="text-sm text-muted-foreground">
              {block.content?.prompt || "Draw or write your answer"}
            </p>
          </div>
        </div>
      )}

      {block.type === "reflection" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {block.content?.prompt || "Share your thoughts..."}
          </p>
          <textarea
            className="w-full h-20 p-3 bg-muted/30 border rounded-lg text-sm resize-none"
            placeholder="Type your reflection..."
            disabled={isAdmin}
          />
          <div className="flex gap-2 text-xs text-muted-foreground">
            {block.content?.minWords && <span>Min: {block.content.minWords} words</span>}
            {block.content?.maxWords && <span>Max: {block.content.maxWords} words</span>}
            {block.content?.privacyMode && block.content.privacyMode !== 'private' && (
              <span className="capitalize">• {block.content.privacyMode.replace('-', ' ')}</span>
            )}
          </div>
        </div>
      )}

      {block.type === "resource" && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <span className="text-xl">
            {block.content?.fileType === 'pdf' && '📄'}
            {block.content?.fileType === 'doc' && '📝'}
            {block.content?.fileType === 'ppt' && '📊'}
            {block.content?.fileType === 'xls' && '📈'}
            {block.content?.fileType === 'image' && '🖼️'}
            {block.content?.fileType === 'zip' && '📦'}
            {(!block.content?.fileType || block.content?.fileType === 'other') && '📎'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {block.content?.fileName || "Resource file"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {block.content?.fileSize && <span>{block.content.fileSize}</span>}
              {block.content?.versionLabel && <span>• {block.content.versionLabel}</span>}
              {block.content?.mustOpenToComplete && <span>• Must open</span>}
            </div>
          </div>
          <FileText className="h-5 w-5 text-primary" />
        </div>
      )}

      {block.type === "qa-thread" && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Q&A Thread</p>
          <div className="flex gap-2 text-xs text-muted-foreground mb-2">
            <span className="capitalize">{block.content?.whoCanPost || 'students-only'}</span>
            {block.content?.anonymity && block.content.anonymity !== 'off' && (
              <span>• {block.content.anonymity === 'always-anonymous' ? 'Anonymous' : 'Optional anonymous'}</span>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Ask a Question
          </Button>
        </div>
      )}

      {block.type === "gap-fill" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{block.content?.instruction || 'Fill in the blanks:'}</p>
          {block.content?.sentences?.slice(0, 2).map((s: any, i: number) => (
            <div key={i} className="p-2 bg-muted/50 rounded text-sm">
              {s.textWithBlanks?.replace(/\{\{\d+\}\}/g, '____') || 'Sentence with blanks...'}
            </div>
          ))}
          {block.content?.sentences?.length > 2 && (
            <p className="text-xs text-muted-foreground">+{block.content.sentences.length - 2} more sentences</p>
          )}
        </div>
      )}

      {block.type === "poll" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{block.content?.question || 'Poll question'}</p>
          <div className="space-y-1">
            {block.content?.options?.slice(0, 3).map((opt: string, i: number) => (
              <div key={i} className="p-2 bg-muted/50 rounded text-sm flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-muted-foreground" />
                {opt || `Option ${i + 1}`}
              </div>
            ))}
          </div>
          {block.content?.allowMultiple && <span className="text-xs text-muted-foreground">Multiple selection</span>}
        </div>
      )}

      {block.type === "reveal" && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase">{block.content?.style || 'accordion'}</p>
          {block.content?.sections?.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              {s.title || `Section ${i + 1}`}
            </div>
          ))}
        </div>
      )}

      {block.type === "file-upload" && (
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
          <p className="text-sm text-muted-foreground">{block.content?.prompt || 'Upload your work'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {block.content?.maxFileSize || 20}MB • {block.content?.maxFiles || 1} file(s)
          </p>
        </div>
      )}
    </div>
  );
}
function PageSettingsDialog({
  page,
  open,
  onOpenChange,
}: {
  page: Page;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updatePage } = useCourseBuilder();
  const [title, setTitle] = useState(page.title);

  const handleSave = () => {
    updatePage(page.id, { title });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
          <DialogDescription>Configure the settings for this page.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Page Title</Label>
            <Input
              id="pageTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Required Page</Label>
              <p className="text-xs text-muted-foreground">
                Students must complete this page to progress
              </p>
            </div>
            <Switch
              checked={page.isRequired}
              onCheckedChange={(checked) => updatePage(page.id, { isRequired: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Gate Next Page</Label>
              <p className="text-xs text-muted-foreground">
                Lock the next page until this one is complete
              </p>
            </div>
            <Switch
              checked={page.isLocked}
              onCheckedChange={(checked) => updatePage(page.id, { isLocked: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
