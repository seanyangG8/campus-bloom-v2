
The user wants a comprehensive audit + fix pass on the entire Course Builder. This is a large, multi-area task. Before I commit to a plan I need to understand scope properly — there are 14 block types, each with admin editor + student preview + completion logic + settings (required, points, attempts, visibility, availability, gating). That's easily 100+ behaviours to verify.

Let me think about what "best version" means here, and what I already know from memory:
- Course Builder = 3-column layout (ChapterPageNav | PageEditor | BlockLibrary)
- 14 block types: Text, Video, Image, Resource, Divider, Micro-Quiz, Drag-Drop Reorder, Whiteboard, Reflection, Q&A Thread, Gap Fill, Poll, Reveal, File Upload
- Each has: admin editor (BlockEditorDialog), student runtime (StudentPreviewDialog), completion rule (completion-rules.ts), settings panel (BlockSettingsPanel)
- Page-level: gating (lock until prev complete), required toggle, completion summary
- Chapter-level: lock, rename, reorder, delete cascade
- Drag-drop: from library → page (insert at index), reorder within page
- Progress tracking via studentProgress Map in CourseBuilderContext

What "best" looks like per block (my standard):
1. **Admin editor** — every config field works, saves, persists, validates, has sensible defaults
2. **Student runtime** — renders correctly, accepts input, validates, shows feedback, marks complete per rule
3. **Completion** — fires at the right moment, respects required flag, contributes to page %
4. **Settings** — required/points/attempts/visibility/availability all honoured
5. **Edge cases** — empty content, max attempts hit, gated when prev incomplete, locked page

I should scope the audit deliverable rather than try to fix everything blindly. Better to:
1. Run a structured audit (read all relevant files, document findings per block in a checklist)
2. Categorise issues: Critical (broken), Major (wrong behaviour), Minor (polish)
3. Fix in priority order
4. Re-verify

Given the size, I'll ask the user 2 clarifying questions before plan-finalising — but actually, the user said "test every single block, every single option" — that IS the scope. Let me just present a clear plan.

I won't ask questions; the brief is clear. Plan:

---

## Course Builder Full Audit & Hardening

### Scope
Audit and fix every block type's admin editor, student runtime, completion logic, and shared settings (required, points, attempts, visibility, availability, gating). Plus page/chapter-level behaviours.

### Approach (3 phases)

**Phase 1 — Structured audit (read-only)**
Build a per-block checklist by reading source files. For each of the 14 blocks, verify against this matrix:

| Area | Checks |
|---|---|
| Admin editor | All fields render, save, persist on reopen, validate, sensible defaults |
| Student runtime | Renders, accepts input, validates, shows feedback, handles empty/edge cases |
| Completion rule | Fires at correct trigger, respects `isRequired`, updates progress map |
| Settings panel | Required, points, attempts, visibility (always/after-prev/score-threshold), availability window all honoured at runtime |
| Edge cases | Empty content, max attempts reached, gated previous incomplete, page locked, multi-attempt retry |

Plus shared behaviours:
- Drag-from-library insert at index (DropIndicator position accuracy)
- Reorder within page (drop above/below correctness)
- Duplicate/move-up/move-down/delete (with cascade)
- Page completion % calculation (excludes dividers/qa-thread)
- Chapter lock prevents page entry
- Student preview reflects gating + auto-completes pages

I will produce a written audit report listing every defect found, grouped by severity.

**Phase 2 — Fix in priority order**
1. Critical (block doesn't function: save fails, runtime crashes, completion never fires)
2. Major (wrong behaviour: settings ignored, gating bypassed, scoring incorrect)
3. Minor (polish: missing validation messages, unclear empty states, inconsistent defaults)

Each fix touches the relevant editor/runtime/rule file. Files likely changed:
- `src/components/course-builder/BlockEditorDialog.tsx` (14 sub-editors)
- `src/components/course-builder/StudentPreviewDialog.tsx` (14 interactive previews)
- `src/components/course-builder/PageEditor.tsx` (drag-drop, block actions)
- `src/components/course-builder/ChapterPageNav.tsx` (chapter/page CRUD, gating)
- `src/components/course-builder/BlockSettingsPanel.tsx` (settings honoured)
- `src/lib/completion-rules.ts` (rule triggers, scoring)
- `src/contexts/CourseBuilderContext.tsx` (state mutations, progress)
- `src/components/course-builder/WhiteboardCanvas.tsx`
- `src/components/course-builder/CompletionRulesSummary.tsx`
- `src/lib/demo-data.ts` (defaults for content interfaces if missing fields)

**Phase 3 — Verify**
Walk through preview as student for each block type, confirm completion fires, page % updates, gating works. Report what was fixed vs what was already correct.

### Deliverable
- Audit report posted in chat (table per block: Pass / Issue → Fix applied)
- All critical and major issues fixed in code
- Minor issues fixed where low-risk; flagged otherwise

### Notes
- This is one very large change. I'll batch fixes by block type to keep diffs reviewable.
- I will NOT change the block model schema or storage shape (would break demo data); fixes stay within editor/runtime/rule layers.
- I will preserve the Attio-flat aesthetic and existing UX patterns (drag-drop, dialog-based editing).
