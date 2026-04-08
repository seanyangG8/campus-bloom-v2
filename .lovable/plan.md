

# Course Builder: Block-by-Block Functional Improvements

## Overview

After reviewing all 14 block types across the editor, student runtime, and data model, here are the concrete improvements that would make each block significantly better. These focus on functional gaps -- things that would make a real difference to course authors and students.

---

## 1. Text Block

**Current**: WYSIWYG editor, callout styles, auto-complete on view.

**Improvements**:
- **Read time estimate**: Show "~2 min read" badge in student preview based on word count (words / 200)
- **Code block rendering**: Detect `<pre><code>` in HTML and render with monospace styling + syntax highlighting CSS classes
- **Collapsible long content**: If text exceeds ~500 words, auto-collapse with a "Read more" toggle in student view
- **Math/LaTeX indicator**: Show a toggle in the editor for `enableMathSupport` (field exists but is unused); render `$...$` patterns with basic formatting

---

## 2. Video Block

**Current**: YouTube/Vimeo embed, watch progress simulation, transcript, chapters as buttons, start/end clipping.

**Improvements**:
- **Student notes panel**: Add a collapsible "My Notes" textarea alongside the video that persists per-block (stored in progress state)
- **Playback speed selector**: Add 0.5x / 1x / 1.5x / 2x buttons (for YouTube, append `&playbackRate=` or show an overlay tip)
- **Chapter editor in BlockEditorDialog**: Currently no way to add chapters in the editor -- add a "Chapters" section with time + title inputs and add/remove buttons
- **Download button**: When `allowDownload` is true, show a download link below the video

---

## 3. Image Block

**Current**: Single image display, gallery mode with lightbox, zoom, captions.

**Improvements**:
- **Gallery image editor**: Add an "Images" CRUD list in `ImageBlockEditor` when `galleryMode` is toggled on (URL + alt + caption per image) -- currently the editor has no way to add gallery images
- **Image annotation overlay**: In student view, allow clicking to place a pin/marker on the image with a text note (useful for anatomy, maps, diagrams)
- **Zoom percentage indicator**: Show current zoom level in lightbox
- **Keyboard navigation**: Add left/right arrow key support in the lightbox

---

## 4. Micro-Quiz Block

**Current**: 4 question types, shuffle, retry, hints, explanations, progress indicator.

**Improvements**:
- **Points display per question**: Show "2 pts" badge next to each question when `q.points` is set
- **One-at-a-time mode**: Add a `showOneAtATime` toggle -- display questions sequentially with Next/Previous rather than all at once
- **Timer**: Add optional countdown timer (configurable in editor, e.g., 30s per question or total quiz time)
- **Image support in questions**: Allow an optional image URL per question, rendered above the question text
- **Add/remove options button**: In the editor, allow adding or removing options from a question (currently fixed at 4)

---

## 5. Reorder Block

**Current**: Drag-and-drop, distractor items, numbered positions, correct/incorrect highlighting.

**Improvements**:
- **Per-item correctness indicator**: After submission with `partial-credit` scoring, show checkmark/X next to each item individually
- **Touch-friendly move buttons**: Add up/down arrow buttons alongside drag handles for mobile/accessibility
- **Distractor editor**: Add a "Distractor Items" section in `ReorderBlockEditor` with add/remove inputs (currently the field exists in the type but there's no editor UI)
- **Animation on drag**: Add subtle spring animation when items are reordered

---

## 6. Whiteboard Block

**Current**: Pen, eraser, color picker, brush size, undo/redo, multi-page, grid/ruled backgrounds.

**Improvements**:
- **Shape tools**: Implement rectangle, circle, line, and arrow drawing when `enabledTools.shapes` is true
- **Text tool**: Click to place a text box on the canvas when `enabledTools.text` is true
- **Background image**: When `allowImage` is true, allow uploading/pasting an image as a canvas background layer
- **Rubric display**: Show the rubric text to students before submission (field exists but is never rendered)
- **Zoom and pan**: Add pinch-to-zoom and pan for detailed work on small screens

---

## 7. Reflection Block

**Current**: Prompt, word count, example response, submit, rubric collapsible, peer gallery (mock data shown).

**Improvements**:
- **Rich text editor**: Replace the plain `<Textarea>` with `<RichTextEditor>` so students can format their reflections
- **Draft auto-save**: Auto-save draft text to local state every 10 seconds with a "Draft saved" indicator
- **Peer commenting**: When `allowPeerComments` is true and peer gallery is shown, add a comment input under each peer reflection
- **Character count option**: Add a `countMode: 'words' | 'characters'` toggle for language courses that need character counts

---

## 8. Resource Block

**Current**: File type icons, download/open buttons, version label, expiry date.

**Improvements**:
- **Inline PDF preview**: When `fileType === 'pdf'`, embed an `<iframe>` preview of the PDF instead of just a download button
- **Download confirmation toast**: Show a "Download started" toast with a checkmark when the download button is clicked
- **Multiple resources per block**: Allow adding multiple files/links in a single resource block (a resource list) via the editor
- **Open tracking**: Show "Opened" badge after the student has clicked the resource

---

## 9. Q&A Thread Block

**Current**: Post questions, mock tutor replies, upvoting, category filters, anonymous posting.

**Improvements**:
- **Nested replies**: Allow students to reply to specific questions (not just top-level), creating threaded conversations
- **Edit/delete own posts**: Add edit and delete buttons on posts authored by "You"
- **Pin important threads**: Show a pinned indicator for tutor-highlighted threads
- **Search/filter**: Add a search input to filter questions by keyword
- **Attachment support**: When `allowAttachments` is true, add a file attachment button next to the post input

---

## 10. Divider Block

**Current**: Line, whitespace, section-break styles with heading and spacing.

**Improvements**:
- **Custom colors/styles**: Allow choosing divider line color and style (solid, dashed, dotted)
- **Icon divider**: Add a new style option with a centered icon (e.g., book, star, arrow) between two lines
- Mostly complete -- lowest priority for changes.

---

## 11. Gap Fill Block

**Current**: Inline blanks within text, per-blank scoring, correct answer reveal, retry.

**Improvements**:
- **Dropdown mode**: Add a `mode: 'text' | 'dropdown'` toggle in the editor; in dropdown mode, render each blank as a `<select>` with shuffled options from a word bank
- **Case sensitivity toggle per blank**: Surface the `caseSensitive` field in the editor per blank (it exists but is never exposed)
- **Hint per sentence**: Allow an optional hint per sentence that students can reveal
- **Auto-sizing inputs**: Make blank input width adapt to the expected answer length rather than fixed `w-28`

---

## 12. Poll Block

**Current**: Single/multi-select voting, bar chart and pie chart, anonymous voting indicator.

**Improvements**:
- **Re-vote**: Allow changing your vote before results are finalized (add a "Change Vote" button)
- **Results hide until threshold**: Add a `minVotesToShowResults` option -- hide results until N students have voted
- **Donut chart variant**: Add a donut option alongside pie (hollow center with total count)
- **Percentage labels on pie**: Show percentage labels directly on pie chart segments
- **Export results**: Add a "Copy results" button for tutors

---

## 13. Reveal/Accordion Block

**Current**: Accordion, click-to-reveal, tabs styles; rich text editor in editor; complete when all sections revealed.

**Improvements**:
- **Section icons**: Allow choosing an emoji or icon per section header in the editor
- **Progress indicator**: Show "2 of 4 sections viewed" progress in student view
- **Numbered sections**: Add an option to auto-number sections (1, 2, 3...)
- **Animation**: Add smooth expand/collapse animation (currently instant show/hide)

---

## 14. File Upload Block

**Current**: Real `<input type="file">`, drag-and-drop, file preview thumbnails, rubric display, submit.

**Improvements**:
- **Upload progress bar**: Show a simulated upload progress bar when files are being "submitted"
- **File type validation feedback**: Show inline error for rejected file types instead of just filtering silently
- **Resubmission**: Allow resubmitting files after initial submission (with a "Resubmit" button)
- **Due date display**: When `rubric` includes a due date or a `dueDate` field is set, show a deadline badge
- **Preview modal**: Click on file thumbnails to open a larger preview (especially for images and PDFs)

---

## Implementation Priority

### Phase 1 -- Editor Gaps (things authors can't currently configure)
1. Video chapter editor in BlockEditorDialog (~60 lines)
2. Image gallery editor in BlockEditorDialog (~50 lines)
3. Reorder distractor editor in BlockEditorDialog (~40 lines)
4. Gap Fill case sensitivity + dropdown mode toggle (~30 lines)
5. Micro-Quiz add/remove options button (~20 lines)

### Phase 2 -- Student Runtime Enhancements
6. Text read time estimate + collapsible long content (~40 lines)
7. Video student notes panel (~50 lines)
8. Micro-Quiz points display + one-at-a-time mode (~80 lines)
9. Reflection rich text editor replacement (~15 lines)
10. Resource inline PDF preview + download toast (~30 lines)
11. Q&A nested replies + edit/delete (~80 lines)
12. Reveal section animation + progress indicator (~40 lines)
13. File Upload progress bar + resubmit (~40 lines)
14. Poll re-vote + pie chart labels (~30 lines)

### Phase 3 -- Advanced Features
15. Whiteboard shape and text tools (~200 lines)
16. Image annotation overlay (~100 lines)
17. Gap Fill dropdown mode runtime (~60 lines)
18. Micro-Quiz timer (~50 lines)
19. Reorder touch-friendly move buttons (~30 lines)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course-builder/BlockEditorDialog.tsx` | Phase 1: video chapters editor, gallery image editor, distractor editor, quiz option add/remove, gap fill toggles |
| `src/components/course-builder/StudentPreviewDialog.tsx` | Phase 2-3: all student runtime enhancements |
| `src/components/course-builder/WhiteboardCanvas.tsx` | Phase 3: shape and text tools |
| `src/lib/demo-data.ts` | Add `mode` field to GapFillBlockContent, `showOneAtATime`/`timeLimit` to MicroQuizBlockContent, `notes` to VideoBlockContent |

## Estimated Scope
- Phase 1: ~200 lines
- Phase 2: ~420 lines
- Phase 3: ~440 lines
- **Total: ~1,060 lines across 4 files**

