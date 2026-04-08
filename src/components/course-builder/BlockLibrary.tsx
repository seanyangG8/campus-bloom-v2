import { blockTypes, BlockType } from "@/lib/demo-data";
import { 
  Type, 
  Play, 
  Image, 
  HelpCircle, 
  ListOrdered, 
  PenTool, 
  MessageSquare, 
  MessagesSquare, 
  FileText, 
  Minus,
  GripVertical,
  TextCursorInput,
  BarChart3,
  ChevronDown,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Type,
  Play,
  Image,
  HelpCircle,
  ListOrdered,
  PenTool,
  MessageSquare,
  MessagesSquare,
  FileText,
  Minus,
  TextCursorInput,
  BarChart3,
  ChevronDown,
  Upload,
};

export function BlockLibrary() {
  const contentBlocks = blockTypes.filter(b => ['text', 'video', 'image', 'resource', 'divider', 'reveal'].includes(b.type));
  const activeBlocks = blockTypes.filter(b => ['micro-quiz', 'drag-drop-reorder', 'gap-fill', 'poll', 'whiteboard', 'reflection', 'file-upload', 'qa-thread'].includes(b.type));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Block Library</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag blocks to the page</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {/* Content Blocks */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Content
          </p>
          <div className="space-y-1">
            {contentBlocks.map((block) => (
              <BlockItem key={block.type} block={block} />
            ))}
          </div>
        </div>

        {/* Active Learning Blocks */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Active Learning
          </p>
          <div className="space-y-1">
            {activeBlocks.map((block) => (
              <BlockItem key={block.type} block={block} variant="active" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BlockItemProps {
  block: { type: BlockType; label: string; icon: string; description: string };
  variant?: 'default' | 'active';
}

function BlockItem({ block, variant = 'default' }: BlockItemProps) {
  const Icon = iconMap[block.icon] || Type;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("blockType", block.type);
    e.dataTransfer.setData("text/plain", block.type); // Fallback
    e.dataTransfer.effectAllowed = "copy";
    console.log("Drag started - blockType:", block.type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
        "hover:shadow-md hover:border-primary/30 active:scale-[0.98]",
        variant === 'active' 
          ? "bg-accent/5 border-accent/20 hover:bg-accent/10" 
          : "bg-card border-border hover:bg-muted/50"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        variant === 'active' ? "bg-accent/10" : "bg-primary/10"
      )}>
        <Icon className={cn(
          "h-4 w-4",
          variant === 'active' ? "text-accent" : "text-primary"
        )} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{block.label}</p>
        <p className="text-xs text-muted-foreground truncate">{block.description}</p>
      </div>
    </div>
  );
}
