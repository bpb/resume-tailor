#!/usr/bin/env python3
"""
Theme Generator Script
Scans the CSS directory for theme subdirectories and generates a themes.json file.
Each theme directory should contain theme-combined.css file with both screen and print styles.
"""

import json
from pathlib import Path
from datetime import datetime


def generate_themes_json():
    """Generate the themes.json file by scanning the CSS directory for theme subdirectories"""
    print("🎨 Scanning CSS directory for theme folders...")

    css_dir = Path(__file__).parent.parent / "css"

    if not css_dir.exists():
        print(f"❌ CSS directory not found: {css_dir}")
        return False

    themes = []

    # Get all subdirectories in the CSS directory
    theme_dirs = [d for d in css_dir.iterdir() if d.is_dir()]

    print(f"🔍 Found {len(theme_dirs)} theme directories")

    for theme_dir in theme_dirs:
        theme_name = theme_dir.name
        theme_path = theme_dir.relative_to(css_dir.parent)

        # Check for combined theme file
        combined_theme_file = theme_dir / "theme.css"

        # Skip if neither combined nor legacy theme exists
        if not combined_theme_file.exists():
            print(f"⚠️  Skipping directory without theme files: {theme_name}")
            continue

        primary_theme_file = combined_theme_file
        theme_file_name = "theme.css"
        has_media_query_print = True

        # Get file stats for theme file
        try:
            theme_stats = primary_theme_file.stat()
            theme_size = theme_stats.st_size
            theme_modified_time = theme_stats.st_mtime
        except OSError:
            theme_size = 0
            theme_modified_time = 0

        # Create theme entry
        theme_entry = {
            "name": theme_name,
            "directory": str(theme_path),
            "themeFile": theme_file_name,
            "fileSize": theme_size,
            "lastModified": theme_modified_time,
            "hasMediaQueryPrint": has_media_query_print,
        }

        themes.append(theme_entry)
        print(f"✅ Added theme: {theme_name}")

    # Sort themes alphabetically by name
    themes.sort(key=lambda t: t["name"])

    # Create the JSON structure
    themes_data = {
        "version": "1.0.0",
        "generated": datetime.now().isoformat(),
        "totalThemes": len(themes),
        "themes": themes,
    }

    # Write to themes.json in the js directory
    output_file = Path(__file__).parent.parent / "data" / "themes.json"

    # Create js directory if it doesn't exist
    output_file.parent.mkdir(exist_ok=True)

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(themes_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Successfully generated {output_file}")
        print(f"📊 Total themes: {len(themes)}")

        # List all included themes
        for theme in themes:
            pdf_status = (
                "combined PDF"
                if theme.get("hasMediaQueryPrint")
                else "separate PDF" if theme.get("hasSeparatePdfFile") else "no PDF"
            )
            print(f"   📄 {theme['name']} ({theme['fileSize']} bytes, {pdf_status})")

        return True

    except Exception as e:
        print(f"❌ Error writing themes.json: {e}")
        return False


def main():
    """Main function"""
    print("🚀 Theme Generator Script")
    print("=" * 50)

    success = generate_themes_json()

    if success:
        print("\n✅ Theme generation completed successfully!")
        print("💡 The themes.json file contains a list of all CSS files found.")
        print("🔄 Run this script whenever you add new CSS theme files.")
        print("📝 Excluded files: pdf-layout-locks.css")
    else:
        print("\n❌ Theme generation failed!")
        exit(1)


if __name__ == "__main__":
    main()
