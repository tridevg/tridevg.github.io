# adsnjhfyeqw231eas.github.io

Personal portfolio site for Tridev Guha — DevOps Engineer.

Static site, no build step: `index.html`, `css/style.css`, `js/script.js`.

## Deploy to GitHub Pages

1. Create a new **public** repo on GitHub named exactly `adsnjhfyeqw231eas.github.io` under the `adsnjhfyeqw231eas` account.
2. From this folder (remote is already set):
   ```
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git push -u origin main
   ```
3. In the repo's Settings → Pages, confirm the source is the `main` branch, root folder. GitHub Pages auto-serves repos named `<username>.github.io` from `main` without extra config.
4. Site will be live at `https://adsnjhfyeqw231eas.github.io` within a few minutes.

## Local preview

```
python3 -m http.server 8000
```
then open `http://localhost:8000`.
