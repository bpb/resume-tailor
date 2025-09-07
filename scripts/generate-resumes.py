#!/usr/bin/env python3
"""
Minimal Resume Assets Generator

- Scan both `resources/` and `.private/resources/`.
- For each immediate subdir, grab the first *.json and first *.png (alphabetical).
- Write `data/resumes.json` with those paths (relative to repo root).

Assumption: The user ensures that each subdir contains the needed files.
"""

import json
from pathlib import Path
from datetime import datetime


def collect_from_root(root: Path, base: Path):
    """Collect resume entries from a given root (resources or .private/resources)."""
    entries = {}
    if not root.exists():
        return entries

    for subdir in sorted([p for p in root.iterdir() if p.is_dir()]):
        # Look only at top-level files in each subdir
        json_candidates = sorted(subdir.glob("*.json"))
        png_candidates = sorted(subdir.glob("*.png"))

        if not json_candidates or not png_candidates:
            print(f"⚠️  Skipping '{subdir}' (missing .json or .png)")
            continue

        json_path = json_candidates[0]
        png_path = png_candidates[0]

        # File stats (optional metadata)
        try:
            js = json_path.stat()
            json_size, json_mtime = js.st_size, js.st_mtime
        except OSError:
            json_size, json_mtime = 0, 0

        try:
            ps = png_path.stat()
            png_size, png_mtime = ps.st_size, ps.st_mtime
        except OSError:
            png_size, png_mtime = 0, 0

        entry = {
            "jsonFile": str(json_path.relative_to(base)),
            "jsonSize": json_size,
            "jsonLastModified": json_mtime,
            "pngFile": str(png_path.relative_to(base)),
            "pngSize": png_size,
            "pngLastModified": png_mtime,
            "hasPngPhoto": True,
        }
        entries[subdir.name] = entry
        print(f"✅ {subdir.name}: {entry['jsonFile']} + {entry['pngFile']}")

    return entries


def generate_resumes_json():
    base = Path(__file__).parent.parent
    roots = [base / "resources", base / ".private" / "resources"]
    out_file = base / "data" / "resumes.json"

    all_entries = {}
    for root in roots:
        all_entries.update(collect_from_root(root, base))

    # Sort and write JSON
    out_file.parent.mkdir(parents=True, exist_ok=True)

    data = {
        "version": "1.0.0",
        "generated": datetime.now().isoformat(),
        "totalResumes": len(all_entries),
        "resumes": all_entries,
    }

    with out_file.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"📦 Wrote {out_file} (total {len(all_entries)})")
    return True


if __name__ == "__main__":
    print("🚀 Minimal Resume Assets Generator")
    print("=" * 50)
    ok = generate_resumes_json()
    if not ok:
        exit(1)
