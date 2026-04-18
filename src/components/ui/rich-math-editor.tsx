import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Sigma,
  Image as ImageIcon,
  RemoveFormatting,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface RichMathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

/**
 * Rich text editor with math (LaTeX/KaTeX) and image support.
 * Math is inserted as inline rendered HTML (data-formula attribute preserves source).
 */
export function RichMathEditor({
  value,
  onChange,
  placeholder = "Start typing... use the Σ button for math formulas",
  minHeight = "200px",
  className,
}: RichMathEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showHtml, setShowHtml] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [formula, setFormula] = useState("");
  const [formulaPopoverOpen, setFormulaPopoverOpen] = useState(false);
  const [formulaPreview, setFormulaPreview] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Live-render formula preview as user types
  useEffect(() => {
    if (!formula.trim()) {
      setFormulaPreview("");
      return;
    }
    try {
      setFormulaPreview(katex.renderToString(formula, { throwOnError: false, displayMode: false }));
    } catch {
      setFormulaPreview('<span class="text-destructive text-xs">Invalid formula</span>');
    }
  }, [formula]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    },
    [handleInput],
  );

  const formatBlock = useCallback(
    (tag: string) => {
      document.execCommand("formatBlock", false, tag);
      editorRef.current?.focus();
      handleInput();
    },
    [handleInput],
  );

  const insertLink = useCallback(() => {
    if (linkUrl) {
      let url = linkUrl;
      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
        url = "https://" + url;
      }
      execCommand("createLink", url);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  }, [linkUrl, execCommand]);

  const insertImage = useCallback(() => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" alt="" style="max-width: 100%; height: auto; border-radius: 4px; margin: 0.5rem 0;" />`;
      document.execCommand("insertHTML", false, html);
      setImageUrl("");
      setImagePopoverOpen(false);
      handleInput();
    }
  }, [imageUrl, handleInput]);

  const insertFormula = useCallback(() => {
    if (!formula.trim()) return;
    try {
      const rendered = katex.renderToString(formula, { throwOnError: false, displayMode: false });
      // Wrap with data-formula so the source is preserved for editing/round-trip
      const html = `<span class="math-inline" data-formula="${formula.replace(/"/g, "&quot;")}" contenteditable="false" style="display:inline-block; padding: 0 4px; vertical-align: middle;">${rendered}</span>&nbsp;`;
      document.execCommand("insertHTML", false, html);
      setFormula("");
      setFormulaPopoverOpen(false);
      handleInput();
    } catch {
      // ignore
    }
  }, [formula, handleInput]);

  const removeFormatting = useCallback(() => execCommand("removeFormat"), [execCommand]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleInput();
    },
    [handleInput],
  );

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}>
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (showHtml) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-medium text-muted-foreground">HTML View</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowHtml(false)} className="h-7 gap-1">
            <Eye className="h-3.5 w-3.5" />
            Visual Editor
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-mono text-sm p-3 border rounded-md bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ minHeight }}
          placeholder="Enter HTML..."
        />
      </div>
    );
  }

  const commonFormulas = [
    { label: "x²", value: "x^2" },
    { label: "√x", value: "\\sqrt{x}" },
    { label: "a/b", value: "\\frac{a}{b}" },
    { label: "Σ", value: "\\sum_{i=1}^{n} i" },
    { label: "∫", value: "\\int_{a}^{b} f(x)\\,dx" },
    { label: "x±y", value: "x \\pm y" },
    { label: "≤≥", value: "\\leq \\geq" },
    { label: "π", value: "\\pi" },
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      <div className="flex flex-wrap items-center gap-0.5 p-1 border-b bg-muted/30">
        <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => execCommand("underline")} icon={Underline} title="Underline" />

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => formatBlock("h2")} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => formatBlock("h3")} icon={Heading3} title="Heading 3" />
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={ListOrdered} title="Numbered List" />
        <ToolbarButton onClick={() => formatBlock("blockquote")} icon={Quote} title="Quote" />
        <ToolbarButton onClick={() => formatBlock("pre")} icon={Code} title="Code Block" />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Insert Link</p>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === "Enter" && insertLink()}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setLinkPopoverOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertLink}>Insert</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Insert Image</p>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => e.key === "Enter" && insertImage()}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setImagePopoverOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertImage}>Insert</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Math Formula */}
        <Popover open={formulaPopoverOpen} onOpenChange={setFormulaPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Math Formula (LaTeX)">
              <Sigma className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="start">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Insert Math Formula</p>
                <p className="text-xs text-muted-foreground">Use LaTeX syntax (powered by KaTeX)</p>
              </div>
              <Textarea
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., \frac{a}{b} or x^2 + y^2 = z^2"
                className="font-mono text-sm min-h-[80px]"
              />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Quick insert:</p>
                <div className="flex flex-wrap gap-1">
                  {commonFormulas.map((f) => (
                    <Button
                      key={f.value}
                      variant="outline"
                      size="sm"
                      type="button"
                      className="h-7 text-xs"
                      onClick={() => setFormula(f.value)}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
              {formulaPreview && (
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                  <div dangerouslySetInnerHTML={{ __html: formulaPreview }} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => { setFormula(""); setFormulaPopoverOpen(false); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertFormula} disabled={!formula.trim()}>Insert</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={() => execCommand("undo")} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => execCommand("redo")} icon={Redo} title="Redo" />
        <ToolbarButton onClick={removeFormatting} icon={RemoveFormatting} title="Clear Formatting" />

        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowHtml(true)} className="h-7 gap-1 text-xs">
            <EyeOff className="h-3.5 w-3.5" />
            HTML
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "p-4 focus:outline-none prose prose-sm max-w-none",
          "prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg",
          "prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-pre:bg-muted prose-pre:p-2 prose-pre:rounded",
          "prose-a:text-primary prose-a:underline",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground",
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  );
}
