
The lockfile is out of sync with package.json. The workflow uses `npm ci` which requires exact sync. Two fixes:

1. **Quick fix (workflow-only)**: Change `npm ci` → `npm install` in `.github/workflows/deploy.yml`. Works immediately, no local setup needed.
2. **Proper fix**: Run `npm install` locally and commit the updated `package-lock.json`. Lovable doesn't regenerate lockfiles, so option 1 is the practical path here.

## Plan

Update `.github/workflows/deploy.yml`:
- Replace `- run: npm ci` with `- run: npm install --no-audit --no-fund`

This lets the build resolve the missing packages (katex, react-katex, @types/katex, @testing-library/dom, etc.) on the fly. Slightly slower than `npm ci` but reliable, and avoids needing to regenerate the lockfile.

That's the only change needed. After the next sync, re-run the GitHub Action.
