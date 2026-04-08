

# Fix: Unnatural Cursor Movement in Assessment Builder Demo

## Root Cause

The drag cursor and ghost animations switch between `right` and `left` CSS positioning mid-keyframe:

```css
@keyframes tutor-cursor-move {
  0%   { right: 35px; left: auto; }   /* positioned from right */
  100% { left: 50%;   right: auto; }  /* suddenly positioned from left */
}
```

CSS cannot smoothly interpolate between `right` and `left` — the browser jumps between them, producing the jerky, unnatural movement.

## Fix

Replace `right`/`left` switching with consistent `left`-based positioning (or pure `transform: translate()`) throughout the keyframes. Both the cursor (`tutor-cursor-move`) and the ghost (`tutor-ghost-move`) need the same treatment.

**Approach**: Convert the starting position from `right: 35px` to an equivalent `left` value (roughly `calc(100% - 55px)` given element width), then animate smoothly to `left: 50%`.

### File: `src/components/landing/TutorAssessmentPreview.tsx`

1. Change the initial inline positions of `.anim-cursor` and `.anim-drag-ghost` from `right: 35px` to equivalent `left` values.

2. Rewrite `tutor-cursor-move`:
```css
@keyframes tutor-cursor-move {
  0%   { left: calc(100% - 55px); top: 125px; }
  25%  { left: calc(100% - 55px); top: 125px; }
  100% { left: 50%; top: 160px; transform: translateX(-50%); }
}
```

3. Rewrite `tutor-ghost-move` the same way:
```css
@keyframes tutor-ghost-move {
  0%   { left: calc(100% - 55px); top: 120px; opacity: 0.95; }
  25%  { left: calc(100% - 55px); top: 120px; opacity: 0.95; }
  85%  { left: 50%; top: 155px; opacity: 0.95; transform: translateX(-50%); }
  95%  { left: 50%; top: 155px; opacity: 0.5; transform: scale(0.95) translateX(-50%); }
  100% { left: 50%; top: 155px; opacity: 0; transform: scale(0.9) translateX(-50%); }
}
```

4. Update the corresponding `.tutor-preview-container.animate .anim-cursor` and `.anim-drag-ghost` rules to use `left` instead of `right` for initial position.

**Single file change, CSS-only fix.**

