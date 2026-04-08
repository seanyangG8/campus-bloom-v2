

# Course Builder & Assessment Builder: Enhancement Plan

## Current Inventory

### Course Builder: 14 Block Types
### Assessment Builder: 9 Question Types

---

## Block-by-Block Improvements

### COURSE BUILDER BLOCKS

#### 1. Text Block
- **Has**: WYSIWYG editor, callout styles (info/warning/tip/success), auto-complete on view
- **Missing**:
  - **Code syntax highlighting** — no way to embed formatted code snippets (important for STEM/CS courses)
  - **Math/LaTeX rendering** — `enableMathSupport` field exists in the type but is never used in the editor or preview
  - **Read time estimate** — show estimated reading time based on word count
  - **Expandable/collapsible sections within text** — long text blocks have no way to hide portions

#### 2. Video Block
- **Has**: YouTube/Vimeo embed, watch progress simulation, transcript toggle, duration display
- **Missing**:
  - **Playback speed controls** — no speed adjustment (0.5x, 1x, 1.5x, 2x)
  - **Video chapters/timestamps** — `chapters` field exists in the type but is never rendered as clickable timestamps
  - **Notes alongside video** — no student note-taking while watching
  - **Start/end time clipping** — `startTime`/`endTime` fields exist but are ignored in the embed URL

#### 3. Image Block
- **Has**: URL display, alt text, caption, size options, zoom modal, auto-complete
- **Missing**:
  - **Gallery mode** — `galleryMode` and `images[]` fields exist in the type but the preview only renders a single image
  - **Image annotation** — no ability for students to annotate/mark up images
  - **Lightbox navigation** — zoom modal has no prev/next for multi-image blocks

#### 4. Micro-Quiz Block
- **Has**: 4 question types, shuffle questions/answers, retry with maxAttempts, pass mark, hints, explanations, correct answer highlighting
- **Missing**:
  - **Question-level points display** — points field exists per question but isn't shown in the student view
  - **Time limit per quiz** — no countdown timer (assessment builder has one, but micro-quiz doesn't)
  - **Progress indicator** — no "Question 2 of 5" indicator when multiple questions exist

#### 5. Reorder Block
- **Has**: Drag-and-drop, scoring (all-or-nothing implied), correct order reveal, retry, explanation
- **Missing**:
  - **Partial credit display** — `scoringMode: 'partial-credit'` exists but the student view only shows overall % without indicating which items are in the correct position
  - **Distractor items** — `distractorItems` field exists in the type but is never used (items that don't belong in the sequence)
  - **Numbered position indicators** — no visual position numbers during drag

#### 6. Whiteboard Block
- **Has**: Drawing canvas, pen/eraser/highlighter, color picker, brush size, undo/redo, multi-page, grid/ruled backgrounds, PNG submission
- **Missing**:
  - **Shape tools** — `shapes: true` in enabledTools but no shape drawing (rectangle, circle, line, arrow)
  - **Text tool** — `text: true` in enabledTools but no text insertion on canvas
  - **Image import** — `allowImage` field exists but no way to paste/upload an image onto the canvas
  - **Rubric display** — `rubric` field exists but is never shown to students

#### 7. Reflection Block
- **Has**: Prompt, word count with min/max, example response toggle, submit with completion
- **Missing**:
  - **Peer reflections gallery** — `privacyMode: 'peer-gallery'` and `showPeerReflections` exist but are never rendered (no mock peer responses shown)
  - **Rubric display** — `rubric` field exists but is not shown to students before submitting
  - **Draft saving** — no auto-save or explicit "Save Draft" before final submission
  - **Rich text formatting** — reflection input is a plain textarea, no formatting options

#### 8. Resource Block
- **Has**: File type icons, download/open buttons, version label, must-open-to-complete
- **Missing**:
  - **PDF inline preview** — no embedded PDF viewer; always opens in new tab
  - **Download progress/confirmation** — no visual feedback that a download has started
  - **Expiry date display** — `expiryDate` field exists but is never rendered
  - **Multiple resources per block** — each resource needs its own block; no bundled resource list

#### 9. Q&A Thread Block
- **Has**: Post questions, mock tutor replies, basic thread display
- **Missing**:
  - **Upvoting/liking** — no way for students to upvote useful questions or answers
  - **Categories/tags** — `categories` field exists but is never rendered as filterable tags
  - **Anonymous posting** — `anonymity` options exist but are ignored in the preview
  - **Attachment support** — `allowAttachments` field exists but no file attachment UI
  - **Reply threading** — only single-level replies; no nested responses
  - **Edit/delete own posts** — posted questions cannot be modified or removed

#### 10. Divider Block
- **Has**: Line/whitespace/section-break styles, section heading, spacing options
- **Missing**:
  - **Anchor link navigation** — `anchorId` field exists but no way to jump to a divider from a table of contents
  - Functionally complete for its purpose

#### 11. Gap Fill Block
- **Has**: Multiple sentences with blanks, per-blank scoring, correct answer reveal, retry
- **Missing**:
  - **Dropdown mode** — blanks are always free-text input; no option for dropdown selection from predefined choices
  - **Inline rendering** — blanks are rendered below the sentence rather than inline within the text where `{{1}}` markers are
  - **Case sensitivity per blank** — `caseSensitive` field exists per blank but is ignored (always case-insensitive)
  - **Scoring mode** — `scoringMode` field exists but partial-credit vs all-or-nothing is not surfaced

#### 12. Poll Block
- **Has**: Single/multi-select voting, mock results with bar chart visualization, vote count
- **Missing**:
  - **Pie chart mode** — `chartType: 'pie'` exists in the type but only bar charts are rendered
  - **Anonymous voting indicator** — `anonymousVoting` field exists but is not displayed
  - **Results after everyone votes** — no option to hide results until a threshold of votes is reached
  - **Re-vote** — once voted, cannot change selection

#### 13. Reveal/Accordion Block
- **Has**: Accordion, click-to-reveal, tabs styles; auto-complete when all sections revealed
- **Missing**:
  - **Rich content editing** — sections store HTML but the editor just has a plain textarea for content
  - **Icons per section** — no way to add an icon or image to section headers
  - **Nested reveals** — cannot nest accordions within accordion sections

#### 14. File Upload Block
- **Has**: Simulated file selection, submit, max files/size display, type constraints
- **Missing**:
  - **Actual file input** — uses simulated file names; no real `<input type="file">` or drag-and-drop zone
  - **File preview** — no thumbnail preview of selected files (images, PDFs)
  - **Progress bar** — no upload progress indicator
  - **Rubric display** — `rubric` field exists but is never shown

---

### ASSESSMENT BUILDER QUESTIONS

#### 1. Multiple Choice
- **Has**: Radio selection, scoring, per-question feedback with explanation
- **Missing**:
  - **Image options** — no way to use images as answer choices
  - **Option randomization indicator** — shuffled but no visual cue that order was randomized

#### 2. Multiple Select
- **Has**: Checkboxes, partial credit scoring, feedback
- **Missing**:
  - **"Select N" hint** — no indication of how many correct answers exist (e.g., "Select 3")
  - **Negative marking option** — wrong selections reduce score, but there's no toggle to disable this

#### 3. True/False
- **Has**: Toggle buttons, scoring, feedback
- **Missing**: Functionally complete

#### 4. Short Answer
- **Has**: Text input, accepted answers list, case sensitivity, scoring
- **Missing**:
  - **Regex matching** — only exact string matching; no pattern-based validation
  - **Numeric tolerance** — no way to accept "approximately 3.14" (e.g., ±0.01)

#### 5. Fill in the Blank
- **Has**: Text with blanks, per-blank accepted answers, scoring with partial credit
- **Missing**:
  - **Inline blank rendering** — blanks appear as separate inputs below the text, not inline where `{{1}}` markers are
  - **Dropdown mode** — no option to provide a word bank or dropdown choices per blank

#### 6. Matching
- **Has**: Left-right pairs, dropdown selection, partial credit scoring
- **Missing**:
  - **Drag-and-drop matching** — uses `<select>` dropdowns; no visual drag-to-connect UI
  - **Distractor items** — no extra right-side items that don't match anything
  - **Visual line-drawing** — no Sankey-style connecting lines between matched pairs

#### 7. Essay
- **Has**: Textarea with word count, min/max words, rubric field (editor only)
- **Missing**:
  - **Rubric display to students** — rubric is stored but never shown in the preview
  - **Rich text editor** — plain textarea only; no formatting
  - **Auto-save drafts** — no draft persistence
  - **Word count enforcement** — min/max shown but not enforced (submit not disabled)

#### 8. Long Answer
- **Has**: Textarea with word count, min/max, placeholder
- **Missing**: Same gaps as Essay (rubric display, rich text, enforcement)

#### 9. File Upload
- **Has**: Upload zone UI, file type/size constraints display
- **Missing**:
  - **Actual file selection** — completely static; no `<input type="file">` or interaction
  - **File preview** — no preview of selected files
  - **Multiple file management** — no add/remove file list

---

## Recommended Implementation Priorities

### Tier 1: High-impact, low-effort fixes (use existing fields)

| # | Enhancement | Files | Effort |
|---|-------------|-------|--------|
| 1 | **Gap Fill inline rendering** — render blanks as `<input>` elements inline within the sentence text instead of below it | `StudentPreviewDialog.tsx`, `AssessmentPreviewDialog.tsx` | ~60 lines |
| 2 | **Video chapters as clickable timestamps** — render `block.content.chapters` as a clickable list below the video | `StudentPreviewDialog.tsx` | ~30 lines |
| 3 | **Image gallery mode** — when `galleryMode` is true, render all images from `images[]` with lightbox prev/next navigation | `StudentPreviewDialog.tsx` | ~80 lines |
| 4 | **Reorder distractor items** — shuffle in `distractorItems` that don't belong in the sequence | `StudentPreviewDialog.tsx` | ~40 lines |
| 5 | **Q&A anonymous posting + categories** — use the existing `anonymity` and `categories` fields to add toggles and filter chips | `StudentPreviewDialog.tsx` | ~50 lines |
| 6 | **Reflection rubric display + peer gallery** — show rubric before submit; show mock peer reflections when `showPeerReflections` is true | `StudentPreviewDialog.tsx` | ~60 lines |
| 7 | **Resource expiry date display** — show expiry date badge when `expiryDate` is set | `StudentPreviewDialog.tsx` | ~10 lines |
| 8 | **Essay/Long Answer word count enforcement** — disable submit when below min or above max words | `AssessmentPreviewDialog.tsx` | ~20 lines |
| 9 | **Multiple Select "select N" hint** — show how many correct answers exist | `AssessmentPreviewDialog.tsx` | ~10 lines |

### Tier 2: Medium-effort, high-value new features

| # | Enhancement | Files | Effort |
|---|-------------|-------|--------|
| 10 | **File Upload block with real `<input type="file">`** — replace simulated selection with actual file picker and drag-drop zone, with file preview thumbnails | `StudentPreviewDialog.tsx`, `AssessmentPreviewDialog.tsx` | ~100 lines |
| 11 | **Gap Fill dropdown mode** — add a `mode: 'text' | 'dropdown'` field; when dropdown, render a `<select>` with shuffled options per blank | `demo-data.ts`, `BlockEditorDialog.tsx`, `StudentPreviewDialog.tsx` | ~80 lines |
| 12 | **Poll pie chart** — when `chartType === 'pie'`, render results as a CSS pie chart instead of bar | `StudentPreviewDialog.tsx` | ~60 lines |
| 13 | **Matching drag-and-drop** — replace `<select>` dropdowns with a visual drag-to-match UI | `AssessmentPreviewDialog.tsx` | ~150 lines |
| 14 | **Q&A upvoting + reply threading** — add vote counts and nested reply support | `StudentPreviewDialog.tsx` | ~100 lines |
| 15 | **Micro-quiz timer + progress indicator** — add optional countdown and "Q2 of 5" header | `StudentPreviewDialog.tsx` | ~60 lines |

### Tier 3: Higher-effort polish

| # | Enhancement | Files | Effort |
|---|-------------|-------|--------|
| 16 | **Whiteboard shape + text tools** — implement rectangle/circle/arrow drawing and text insertion on canvas | `WhiteboardCanvas.tsx` | ~200 lines |
| 17 | **Reflection rich text editor** — replace plain textarea with RichTextEditor component | `StudentPreviewDialog.tsx` | ~30 lines |
| 18 | **Reveal section rich text editing** — use RichTextEditor in the editor dialog instead of plain textarea | `BlockEditorDialog.tsx` | ~20 lines |
| 19 | **Video start/end time clipping** — append `?start=X&end=Y` params to YouTube/Vimeo embed URLs | `StudentPreviewDialog.tsx` | ~20 lines |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course-builder/StudentPreviewDialog.tsx` | Tiers 1-2: inline gap fill, video chapters, image gallery, reorder distractors, Q&A enhancements, reflection rubric/peers, resource expiry, poll pie chart, file upload real input, micro-quiz timer |
| `src/components/assessment-builder/AssessmentPreviewDialog.tsx` | Inline fill-blank rendering, word count enforcement, select-N hint, matching drag-drop, file upload real input |
| `src/components/course-builder/BlockEditorDialog.tsx` | Gap fill dropdown mode toggle, reveal rich text editing |
| `src/components/course-builder/WhiteboardCanvas.tsx` | Shape and text tools |
| `src/lib/demo-data.ts` | Gap fill `mode` field, update type interfaces |

## Estimated Total Scope
- Tier 1: ~360 lines of changes
- Tier 2: ~550 lines of changes
- Tier 3: ~270 lines of changes
- **Total: ~1,180 lines across 5 files**

