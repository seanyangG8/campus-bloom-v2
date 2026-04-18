# Deploying to GitHub Pages

This project is configured to deploy to GitHub Pages via GitHub Actions.

## One-time setup

1. **Connect Lovable to GitHub** (Connectors → GitHub → Connect project) and push the code to a repo.
2. In your GitHub repo, edit `.github/workflows/deploy.yml` and replace
   `BASE_PATH: /your-repo-name/` with your actual repo name (keep both slashes,
   e.g. `/tuition-campus/`).
3. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push to `main` (or run the workflow manually). The action builds the Vite app
   and deploys `dist/` to Pages.

## How it works

- `vite.config.ts` reads `BASE_PATH` at build time so assets resolve correctly
  under `https://<user>.github.io/<repo>/`. Local dev and Lovable hosting are
  unaffected (default base is `/`).
- The app uses `HashRouter`, so URLs look like
  `https://<user>.github.io/<repo>/#/app/courses/course-1`. This avoids the
  GitHub Pages SPA 404 problem entirely — no `404.html` workaround needed.

## Custom domain

If you point a custom domain at GitHub Pages, set `BASE_PATH: /` in the workflow
and add a `public/CNAME` file containing your domain.

## Notes

- Lovable Cloud (backend, auth, edge functions) is **not** hosted on GitHub
  Pages. The frontend will still call your Lovable Cloud backend over the
  internet, which works fine — you just lose the all-in-one hosting story.
- The Lovable preview and Publish button continue to work independently.
