

# Course Builder & Assessment Builder: Best-in-Class Audit

## Reference: What Insendi (and peers) offer

Insendi provides **30+ activity types** across three pedagogical categories:

**Present** (content delivery): Explanatory Text, Information Box (colored callouts), Reading (aggregated reading list), Video Player, Interactive Video (bookmarks + embedded questions in video), Reveal (click-to-reveal), Text Reveal (inline word tooltips), Audio player, Image Swap (before/after), Live Class (session scheduling), Learning Outcomes (self-assessment), Exam (scheduling + grading)

**Practice** (formative): Question (structured multi-part Q&A), Interactive Table (fill cells), Poll (with bar/pie/line chart results), Matrix Poll, Formative Quiz (MCQ private), Geotagging (map pins), Quick Answer Check (free-text with auto-check), Multi Quick Answer Check, Ordering (drag reorder), Image Drag & Drop (label a diagram), Drag & Drop Table, Gap Fill (cloze/dropdown)

**Produce** (summative/creative): File Upload, Summative Quiz (graded MCQ), Participation Grade, Journal (private reflective diary), Sticky Notes (collaborative board), Whiteboard (text + peer voting), Image Tile (image submission wall), Bubblecloud (visual voting), Wordcloud, Forum (threaded discussion), Video Submission

Key platform features: Assessed flag (any activity can be graded), Community flag (shared/peer submissions, voting), Content History tracking, Course Reports/Analytics, Grading workflows, Reading/Calendar/Assessment tabs that aggregate data across activities.

---

## Current State: What You Have vs. What's Missing

### Course Builder Blocks (10 types)

| Block | Editor | Student Preview | Verdict |
|-------|--------|----------------|---------|
| **Text** | WYSIWYG editor with callouts | Renders HTML, auto-completes | **Working** |
| **Video** | URL, duration, threshold, transcript | YouTube/Vimeo iframe, simulated progress bar | **Working** |
| **Image** | URL, alt, caption, size, download | Renders with zoom modal | **Working** |
| **Micro-Quiz** | 4 question types, shuffle, attempts, pass mark | Shuffle, retry, maxAttempts, showCorrect | **Working** |
| **Reorder** | Items, correct order, scoring mode | Drag-and-drop, retry, scoring | **Working** |
| **Whiteboard** | Canvas size, background, tools, multi-page | Drawing canvas with submit | **Working** |
| **Reflection** | Prompt, word limits, privacy, rubric | Text input with word count, submit | **Working** |
| **Resource** | File/link, type icons, must-open | Download/open with completion tracking | **Working** |
| **Q&A Thread** | Permissions, anonymity, moderation | Post questions, mock tutor replies | **Working** |
| **Divider** | Style, heading, spacing | Line/whitespace/section-break rendering | **Working** |

### Assessment Builder (9 question types)

| Type | Editor | Preview | Verdict |
|------|--------|---------|---------|
| Multiple Choice | Options + correct answer | Radio buttons | **Working but no scoring** |
| Multiple Select | Options + correct answers | Checkboxes | **Working but no scoring** |
| True/False | Correct answer toggle | Buttons | **Working but no scoring** |
| Short Answer | Accepted answers | Text input | **Working but no scoring** |
| Fill in Blank | Blanks with answers | Blank inputs | **Preview only** |
| Matching | Pairs | Drag matching | **Preview only** |
| Essay | Word limits, rubric | Textarea | **Preview only** |
| Long Answer | Word limits | Textarea | **Preview only** |
| File Upload | File types, size limits | Upload zone | **Preview only** |

---

## What Still Needs to Be Built

### Priority 1: Assessment Builder Gaps (Critical)

**A. Assessment Preview has no actual scoring.**
The `ResultsView` calculates score as `answeredCount / questions.length * 100` -- it just counts how many were answered, not whether answers are correct. This is fundamentally broken for a grading tool.

**Fix:** Implement actual answer checking in `AssessmentPreviewDialog`:
- Multiple Choice: compare selected index to `correctAnswer`
- Multiple Select: compare selected indices to `correctOptions`
- True/False: compare to `correctAnswer`
- Short Answer: compare to `acceptedAnswers` list with case sensitivity
- Fill Blank: compare each blank to accepted values
- Matching: compare pairs

**B. Assessment Preview has no shuffle support.**
`assessment.shuffleQuestions` is stored but ignored in preview. Questions always appear in order.

**C. Assessment Preview has no timer.**
`assessment.duration` is displayed but no countdown timer runs. Best-in-class assessments have a visible countdown.

**D. Assessment Preview has no per-question feedback.**
After submission, no correct/incorrect highlighting per question. Just a total count.

**E. No assessment-course integration.**
Assessments exist as standalone pages but aren't embeddable as course blocks. Insendi embeds quizzes inline within learning sequences.

### Priority 2: Missing Block Types (High Value)

Comparing to Insendi's activity library, these high-value types are missing:

**F. Gap Fill / Cloze block** -- Sentences with blanks that students fill via text or dropdown. Already exists as assessment question type but not as an inline course block.

**G. Poll block** -- Quick single/multi-choice poll with live results visualization (bar/pie chart). Community feature.

**H. Image Drag & Drop block** -- Drag labels onto an image (label a diagram). Very popular for STEM subjects.

**I. Interactive Video block** -- Video with embedded questions/bookmarks at timestamps. Insendi's most distinctive feature.

**J. Reveal / Accordion block** -- Click-to-reveal content sections. Simple but very useful for scaffolding.

**K. File Upload block** -- Students upload files (essays, spreadsheets) inline within a course page. Currently only in Assessment Builder.

### Priority 3: Student-Facing View (Medium)

**L. Student view mode in PageEditor.**
When `currentRole === 'student'`, the `PageEditor` still shows admin-style block cards with drag handles and edit buttons. Should render clean student-facing content (like `StudentPreviewDialog` blocks) directly in the page editor.

### Priority 4: Course-Level Features (Polish)

**M. Publish Dialog uses mock changes.**
The changes list is hardcoded. Should track actual edits.

**N. Course Analytics / Reports tab.**
No per-student progress dashboard within a course. Insendi provides completion rates, time spent, activity engagement per student.

**O. Reading/Resource aggregation.**
Insendi auto-aggregates all Reading activities into a top-level "Reading" tab. Resources scattered across pages aren't surfaced anywhere.

**P. Course duplication.**
No way to duplicate an entire course structure.

---

## Recommended Implementation Order

### Phase 1: Fix Assessment Scoring (most impactful bug)
1. **Implement actual scoring in `AssessmentPreviewDialog` ResultsView** -- check answers against correct values for all 6 auto-graded types
2. **Add per-question correct/incorrect feedback** after submission
3. **Add countdown timer** using `assessment.duration`
4. **Add question shuffling** using `assessment.shuffleQuestions`

### Phase 2: Add High-Value Block Types
5. **Gap Fill block** -- cloze text with blanks (editor + student runtime)
6. **Poll block** -- question + options + bar chart results visualization
7. **Reveal/Accordion block** -- click-to-expand content sections
8. **File Upload block** -- student file submission within course pages

### Phase 3: Student View & Integration
9. **Student-facing PageEditor view** -- render interactive blocks instead of admin cards when role is student
10. **Assessment-as-block** -- embed an assessment inline within a course page

### Phase 4: Platform Polish
11. **Publish dialog real changes tracking**
12. **Course duplication**
13. **Course-level analytics tab**
14. **Image Drag & Drop block** (complex)
15. **Interactive Video block** (complex)

---

## Files to Modify/Create

| File | Changes |
|------|---------|
| `src/components/assessment-builder/AssessmentPreviewDialog.tsx` | Actual scoring, per-question feedback, timer, shuffle |
| `src/components/course-builder/PageEditor.tsx` | Student-facing view mode |
| `src/lib/demo-data.ts` | New block types (gap-fill, poll, reveal, file-upload) |
| `src/contexts/CourseBuilderContext.tsx` | New block type defaults, progress handlers |
| `src/lib/completion-rules.ts` | Completion rules for new block types |
| `src/components/course-builder/BlockEditorDialog.tsx` | Editors for new block types |
| `src/components/course-builder/BlockLibrary.tsx` | New block type entries |
| `src/components/course-builder/StudentPreviewDialog.tsx` | Student runtime for new block types |

### New Files
| File | Purpose |
|------|---------|
| (none -- all additions go into existing files following current patterns) | |

---

## Estimated Scope

- Phase 1 (Assessment scoring): ~250 lines changed
- Phase 2 (New blocks): ~600 lines added
- Phase 3 (Student view): ~200 lines
- Phase 4 (Polish): ~400 lines

