#!/usr/bin/env python3
"""
Theme Generator Script
Scans both public and private CSS directories for theme subdirectories
and generates a themes.json file.
"""

import json
from pathlib import Path
from datetime import datetime


def generate_themes_json():
    """Generate the themes.json file by scanning CSS directories"""
    print("🎨 Scanning CSS directories for theme folders...")

    base_dir = Path(__file__).parent.parent
    css_dirs = [
        base_dir / "css",
        base_dir / ".private" / "css",
    ]

    themes = {}

    for css_dir in css_dirs:
        if not css_dir.exists():
            print(f"ℹ️  Skipping missing CSS directory: {css_dir}")
            continue

        # Get all subdirectories in this CSS directory
        theme_dirs = [d for d in css_dir.iterdir() if d.is_dir()]
        print(f"🔍 Found {len(theme_dirs)} theme directories in {css_dir}")

        for theme_dir in theme_dirs:
            theme_name = theme_dir.name
            # record directory relative to repo root
            theme_path = theme_dir.relative_to(base_dir)

            combined_theme_file = theme_dir / "theme.css"

            if not combined_theme_file.exists():
                print(f"⚠️  Skipping directory without theme.css: {theme_name}")
                continue

            try:
                theme_stats = combined_theme_file.stat()
                theme_size = theme_stats.st_size
                theme_modified_time = theme_stats.st_mtime
            except OSError:
                theme_size = 0
                theme_modified_time = 0

            theme_entry = {
                "filePath": str(theme_path / "theme.css"),
                "fileSize": theme_size,
                "lastModified": theme_modified_time,
                "hasMediaQueryPrint": True,
            }

            themes[theme_name] = theme_entry
            print(f"✅ Added theme: {theme_name} from {css_dir}")

    themes_data = {
        "version": "1.0.0",
        "generated": datetime.now().isoformat(),
        "totalThemes": len(themes),
        "themes": themes,
    }

    output_file = base_dir / "data" / "themes.json"
    output_file.parent.mkdir(exist_ok=True)

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(themes_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Successfully generated {output_file}")
        print(f"📊 Total themes: {len(themes)}")
        return True

    except Exception as e:
        print(f"❌ Error writing themes.json: {e}")
        return False


def main():
    print("🚀 Theme Generator Script")
    print("=" * 50)

    if generate_themes_json():
        print("\n✅ Theme generation completed successfully!")
    else:
        print("\n❌ Theme generation failed!")
        exit(1)


if __name__ == "__main__":
    main()
