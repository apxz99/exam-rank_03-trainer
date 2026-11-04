# Exam Rank 03 Trainer

A standalone, static website recreated from the supplied legacy HTML. The original file was left untouched.

## Run it

Open `index.html` in a modern browser. If you prefer a local web server, open PowerShell in this folder and run:

```powershell
py -m http.server 8000
```

Then visit <http://localhost:8000>. The site has no build step or package dependencies. Progress and typing preferences are stored in the browser's local storage.

## Preserved features

- Eight Rank 03 exercises, grouped by level, with per-exercise typing progress.
- Three solution variants where available: the trainer's reference, Modey, and short form.
- Multi-file exercises, with file tabs and per-file typing practice.
- Typing practice with character-level error feedback, progress, error count, and elapsed time.
- Reveal modes for full answer, partially hidden words, or fully hidden answer; adjustable hide percentages and keyboard hints.
- Whole-file practice, restart, focused section drills, and keyboard navigation while typing.
- Per-exercise walkthrough notes and live flowcharts that follow the current typing position.
- The built-in lesson and Rank 03 reference guide, plus solution animations where provided.
- Responsive layout, collapsible sidebar, and reset controls. Progress persists in the current browser.
- Interactive, step-by-step algorithm motion for powerset, permutations, n_queens, and rip. The powerset view includes a binary recursion tree: each node shows the `solve` call at that depth, the active branch, the complete call stack, and the stdout lines produced at `print`. The visualizer uses GSAP from jsDelivr for transitions and includes playback, previous/next, a seek bar, and keyboard controls.
- A custom SVG favicon for the browser tab.
- The Powerset animation is a local fork of the supplied `Powerset Backtracking.html` player. It opens as a near-fullscreen floating 16:9 video player and starts automatically.

The legacy page itself describes this as typing practice: it does not compile or execute the C solutions in the browser. GSAP and the original font stylesheet load from public CDNs; the visualizer controls remain available if GSAP cannot load.

## Project layout

- `index.html` — page structure and lesson content
- `assets/css/app.css` — trainer styles
- `assets/css/fonts.css` — original typeface stylesheet with system fallbacks
- `assets/js/` — exercise data, solutions, notes, flowcharts, and interface behavior# exam-rank_03-trainer
