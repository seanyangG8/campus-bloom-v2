
# Course Builder: Full Functionality Audit and Fix Plan

## Current State Summary

The course builder has a solid foundation: 3-column layout, chapter/page/block CRUD, drag-and-drop block insertion and reordering, click-to-edit, a WYSIWYG rich text editor, a tabbed block editor with settings panel, student preview dialog with interactive blocks, completion rules, and progress tracking. However, several areas are incomplete or have bugs that prevent full end-to-end functionality.

---

## What Works

- Chapter/page CRUD (add, rename, delete, reorder)
- Page gating (lock/unlock)
- Block library drag-and-drop insertion with position indicators
- Block reordering (drag + move up/down)
- Block duplicate and delete with confirmation
- Click-to-edit on block cards
- Rich text editor (contentEditable with toolbar)
- Text block with callout styles
- Video block editor (URL, duration, transcript, watch threshold, advanced options)
- Image block editor (URL, alt, caption, display size, download toggle, preview)
- Micro-quiz editor (4 question types, hints, explanations, pass mark, completion rule)
- Reorder block editor (items, scoring mode, show correct order, explanation)
- Whiteboard block editor (prompt, canvas size, background, tool toggles, multi-page, rubric)
- Reflection block editor (prompt, example, min/max words, privacy mode, peer comments, rubric)
- Resource block editor (file/link type, file type icons, must-open, version, expiry)
- Divider block editor (style, section heading, anchor ID, spacing)
- Q&A thread block editor (posting permissions, anonymity, attachments, moderation, categories)
- Block settings panel (required, points, attempts, visibility rules, availability)
- Student preview dialog with interactive quiz, reorder, whiteboard canvas, and reflection
- Completion rules engine with scoring functions
- Unit tests for scoring logic

---

## Issues Found (Bugs and Missing Functionality)

### 1. Course Settings Button (Still a TODO)
**File:** `CourseDetail.tsx` line 77-82
The Settings button shows a toast "Course settings dialog coming soon" instead of opening a dialog.
**Fix:** Create a `CourseSettingsDialog` with fields for title, description, subject, level, thumbnail URL, and status.

### 2. Video Block: No Actual Video Embed in Preview
**Files:** `StudentPreviewDialog.tsx` lines 430-454, `PageEditor.tsx` lines 754-774
Both the admin preview and student preview show a static Play icon placeholder instead of embedding the actual YouTube/Vimeo video.
**Fix:** Parse YouTube/Vimeo URLs and render `<iframe>` embeds. Add a simulated progress tracker for watch threshold completion.

### 3. Video Block: No Watch Progress Tracking in Student Preview
**File:** `StudentPreviewDialog.tsx`
The `updateVideoProgress` function exists in context but is never called from the student preview. Videos auto-complete via `markBlockViewed` after 1 second regardless of watch threshold.
**Fix:** Add a simulated progress bar or use iframe API postMessage to track watch progress, calling `updateVideoProgress` instead of `markBlockViewed`.

### 4. Image Block: No Zoom/Fullscreen in Student Preview
**File:** `StudentPreviewDialog.tsx` lines 457-487
The `isZoomed` state is toggled on click but nothing visually changes — there's no fullscreen/modal overlay.
**Fix:** Add a modal overlay when `isZoomed` is true showing the full-resolution image.

### 5. Resource Block: Download/Open Buttons Are Non-Functional
**File:** `StudentPreviewDialog.tsx` lines 974-1015
The Download/Open buttons render but do nothing on click. They don't open the URL or track the "must open to complete" logic.
**Fix:** Wire the button to `window.open(url)` and call `markBlockViewed` when `mustOpenToComplete` is true.

### 6. Q&A Thread: Completely Static Placeholder
**File:** `StudentPreviewDialog.tsx` lines 1018-1028
Shows only a static "Ask a Question" button that does nothing.
**Fix:** Add a basic interactive thread: text input to post a question, list of posted questions, and mock tutor reply. Track as "participated" for completion.

### 7. Micro-Quiz: `shuffleAnswers` and `shuffleQuestions` Not Applied in Student Runtime
**File:** `StudentPreviewDialog.tsx` lines 490-727
The quiz settings for shuffling exist in the editor but are completely ignored in the student preview. Options always display in authoring order.
**Fix:** When rendering, if `shuffleAnswers` is true, create a shuffled index map per question and use original indices for scoring. If `shuffleQuestions` is true, shuffle question order on mount.

### 8. Micro-Quiz: `maxAttempts` Not Enforced
**File:** `StudentPreviewDialog.tsx`
The quiz shows submit once and then results, with no retry mechanism and no attempt limit enforcement.
**Fix:** After submission, if attempts remain (based on `content.maxAttempts` or block-level `maxAttempts`), show a "Retry" button. Disable retry when max attempts reached.

### 9. Micro-Quiz: `showCorrectAfterAttempt` Not Respected
When set to false, the student preview still highlights correct/incorrect answers after submission.
**Fix:** Conditionally show correct answer highlighting based on `content.showCorrectAfterAttempt`.

### 10. Reorder Block: `correctOrder` Not Properly Initialized
**File:** `CourseBuilderContext.tsx` line 541-544
Default content sets `correctOrder: [0, 1, 2]` but when the author adds/removes items, the `correctOrder` array can get out of sync or remain as a simple sequential list.
**Fix:** In `ReorderBlockEditor`, auto-generate `correctOrder` as `items.map((_, i) => i)` since items are entered in correct order. The student sees them shuffled.

### 11. Page Completion Not Auto-Calculated in Student Preview
**File:** `StudentPreviewDialog.tsx` lines 93-97
Page completion is manual ("Mark Complete" button). It doesn't auto-detect when all required blocks are completed based on `studentProgress`.
**Fix:** Auto-mark page as complete when all required blocks have `completed` status in progress. Keep manual button as fallback for pages with no required blocks.

### 12. Visibility Conditions Not Enforced in Student Preview
Blocks with `visibilityCondition: 'after_prev_complete'` or `'score_threshold'` still render normally.
**Fix:** In `StudentPreviewDialog`, filter or conditionally show blocks based on their visibility conditions and the progress of previous blocks.

### 13. `maxAttempts` Not Enforced for Reorder/Whiteboard
The reorder and whiteboard blocks allow unlimited submissions regardless of `maxAttempts` settings.
**Fix:** Check `progress.attempts` against `block.maxAttempts` before allowing re-submission.

### 14. Publish Dialog: Uses Mock Changes List
**File:** `PublishDialog.tsx`
The changes list is hardcoded mock data, not derived from actual edits.
**Fix:** Track a simple "dirty" state per block/page/chapter in context. Show actual changes in the publish dialog.

### 15. Student View (Non-Admin) Missing Full Runtime
When `currentRole` is `student`, the `CourseDetail` page shows the page editor without the block library (correct), but students see the admin-style block cards instead of the clean student-facing content view.
**Fix:** When `isAdmin` is false, render student-facing block content (similar to `StudentPreviewDialog` blocks) instead of the admin `BlockPreview` cards.

---

## Implementation Priorities

### Phase 1: Critical Fixes (Make existing features actually work)
1. **Video embed rendering** — Parse YouTube/Vimeo URLs, render iframes in both previews
2. **Resource block click handling** — Wire download/open buttons, track completion
3. **Image zoom modal** — Add fullscreen overlay on click
4. **Quiz shuffle implementation** — Apply `shuffleAnswers`/`shuffleQuestions` with stable scoring
5. **Quiz retry + maxAttempts** — Add retry button, enforce attempt limits
6. **Quiz `showCorrectAfterAttempt` flag** — Conditionally hide correct answers
7. **Auto page completion** — Detect all required blocks complete → auto-mark page

### Phase 2: Missing Features
8. **Course Settings Dialog** — Title, description, subject, level, status editor
9. **Q&A Thread interactive** — Basic post/reply functionality
10. **Visibility conditions enforcement** — Hide/show blocks based on conditions
11. **Student-facing view** — Clean content rendering when role is student
12. **Reorder correctOrder sync** — Auto-maintain correct order array

### Phase 3: Polish
13. **Publish dialog real changes** — Track and display actual modifications
14. **Attempt tracking for all interactive blocks** — Enforce limits consistently

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/course-builder/StudentPreviewDialog.tsx` | Video embed, image zoom, resource click, quiz shuffle/retry/showCorrect, Q&A interactive, visibility conditions, auto page completion |
| `src/components/course-builder/PageEditor.tsx` | Student-facing block rendering when !isAdmin |
| `src/pages/app/CourseDetail.tsx` | Course settings dialog integration |
| `src/components/course-builder/BlockEditorDialog.tsx` | Minor: ensure correctOrder stays in sync in ReorderBlockEditor |
| `src/contexts/CourseBuilderContext.tsx` | Minor: dirty tracking for publish dialog |

## New Files

| File | Purpose |
|------|---------|
| `src/components/course-builder/CourseSettingsDialog.tsx` | Course metadata editing dialog |

---

## Estimated Scope

- Phase 1 (Critical): ~400 lines of changes across StudentPreviewDialog + PageEditor
- Phase 2 (Missing): ~300 lines (CourseSettingsDialog + Q&A thread + visibility)
- Phase 3 (Polish): ~100 lines

Total: ~800 lines of changes/additions
