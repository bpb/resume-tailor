#!/usr/bin/env bash
set -euo pipefail

# ======= CONFIG (edit these) ===========================================
PRIVATE_REMOTE="git@github.com:$(git remote get-url origin 2>/dev/null | grep -o '[^:]*\/[^\.]*' | cut -d'/' -f1)/resume-tailor-private.git"

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"
git rev-parse --is-inside-work-tree >/dev/null

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# 1) Ensure .gitignore hides the private checkout
if ! grep -qE '^\s*\.private/\s*$' .gitignore 2>/dev/null; then
    {
        echo ""
        echo "# Private checkout (do not commit)"
        echo ".private/"
        echo ".private/**"
    } >>.gitignore
    echo "Added .private/ to .gitignore"
fi

# 2) Clone private repo if missing
if [[ ! -d ".private/.git" ]]; then
    echo "Cloning private repo into .private ..."
    git clone "$PRIVATE_REMOTE" .private
else
    echo ".private already present; skipping clone"
fi
