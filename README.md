# resume-tailor

> ✂️👔 A JSON-powered wardrobe for your career — tailor resumes to any job with custom CSS styles.

## Overview

`resume-tailor` takes structured JSON resumes and applies different CSS themes to render tailored resumes in HTML or PDF.
Because one size never fits all, this tool helps you match the style and tone of your resume to specific job listings.

- **JSON in** → **Styled HTML/PDF out**
- Multiple resume variants, one source of truth
- Easy to extend with your own themes

## Features

- Render resumes from multiple JSON files
- Apply different CSS styles per job target
- Export to print-ready PDF through standard browser
- Cyberpunk/terminal-friendly themes included
- Extendable theme system for custom branding
- Currently only support one resume layout

### 🔧 Prerequisites

To run the development server, you’ll need:

- **Python 3.7+** (preferred) — required to generate resumes and serve files locally
- **Bash** (Linux/macOS or Git Bash/WSL on Windows)
- (Optional) **Node.js** if you want to use an alternative static file server (`http-server` or `serve`)
- A modern browser (Chrome, Firefox, Safari, Edge)

---

### 🖥️ Usage

Run the development server:

```sh
bash ./start-dev.sh
```

### 🚀 What the script does

1. Kills any existing server running on port 8000

1. Runs ./scripts/generate-resumes.py to build resumes from JSON

1. Runs ./scripts/generate-themes.py to build CSS themes

1. Starts a local HTTP server at http://localhost:8000

1. Opens your browser to resume-dynamic.html

1. Keeps the server running until you stop with Ctrl+C

---

_A fun evening project where parts were accelerated with AI assistance,
but all design, decisions, and final implementation are my own._
