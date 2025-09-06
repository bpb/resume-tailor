#!/usr/bin/env python3
"""
Resume Assets Generator Script
Scans the resources directory and generates a resumes.json file with available JSON and PNG pairs.
This script pairs resume data files with their corresponding profile photos.
"""

import json
from pathlib import Path
from datetime import datetime


def generate_resumes_json():
    """Generate the resumes.json file by scanning the resources directory"""
    print("📄 Scanning resources directory for resume files...")

    resources_dir = Path(__file__).parent.parent / "resources"

    if not resources_dir.exists():
        print(f"❌ Resources directory not found: {resources_dir}")
        return False

    # Find all JSON and PNG files
    json_files = [f for f in resources_dir.glob("**/*.json") if f.is_file()]
    png_files = [f for f in resources_dir.glob("**/*.png") if f.is_file()]

    print(f"🔍 Found {len(json_files)} JSON files and {len(png_files)} PNG files")

    # Create pairs based on naming patterns
    resume_pairs = []

    for json_file in json_files:
        json_name = json_file.stem

        # Look for matching PNG with similar name
        matching_png = None
        for png_file in png_files:
            png_name = png_file.stem

            # Check for exact match or related naming patterns
            # (e.g., "resume-data" might match with "profile-photo")
            if (
                png_name == json_name
                or (
                    json_name.endswith("-resume-data")
                    and png_name.endswith("-profile-photo")
                )
                or (json_name.startswith("resume-") and png_name.startswith("profile-"))
                or (
                    "resume" in json_name
                    and "profile" in png_name
                    and json_name.split("-")[0] == png_name.split("-")[0]
                )
            ):

                matching_png = png_file
                break

        # Extract subfolder name for resume naming
        # If the file is directly in resources, use "default", otherwise use the subfolder name
        relative_path = json_file.relative_to(resources_dir)
        subfolder = (
            str(relative_path.parent)
            if relative_path.parent != Path(".")
            else "default"
        )

        # Get file stats
        try:
            json_stats = json_file.stat()
            json_size = json_stats.st_size
            json_modified = json_stats.st_mtime
        except OSError:
            json_size = 0
            json_modified = 0

        # Create resume entry
        resume_entry = {
            "name": subfolder,  # Name the resume by its subfolder
            "jsonFile": str(json_file.relative_to(Path(__file__).parent.parent)),
            "jsonSize": json_size,
            "jsonLastModified": json_modified,
            "pngFile": (
                str(matching_png.relative_to(Path(__file__).parent.parent))
                if matching_png
                else None
            ),
            "hasPngPhoto": matching_png is not None,
        }

        # Add PNG file details if found
        if matching_png:
            try:
                png_stats = matching_png.stat()
                resume_entry["pngSize"] = png_stats.st_size
                resume_entry["pngLastModified"] = png_stats.st_mtime
            except:
                resume_entry["pngSize"] = 0
                resume_entry["pngLastModified"] = 0

        resume_pairs.append(resume_entry)
        print(
            f"✅ Added resume: {json_file.name}"
            + (
                f" with matching photo: {matching_png.name}"
                if matching_png
                else " (no matching photo found)"
            )
            + f" - Named: '{subfolder}'"
        )

    # Sort resumes alphabetically by JSON filename
    resume_pairs.sort(key=lambda r: r["jsonFile"])

    # Debug: Print resume entries before writing to file
    print("\n🔍 Debug - Resume entries before JSON serialization:")
    for entry in resume_pairs:
        print(f"   Entry: {entry}")

    # Create the JSON structure
    resumes_data = {
        "version": "1.0.0",
        "generated": datetime.now().isoformat(),
        "totalResumes": len(resume_pairs),
        "resumes": resume_pairs,
    }

    # Debug: Check if 'name' field is present right before serialization
    print("\n🧪 Verifying 'name' field is present in resume entries:")
    for idx, resume in enumerate(resumes_data["resumes"]):
        print(
            f"   Resume #{idx+1}: name={'name' in resume}, value={resume.get('name', 'MISSING')}"
        )

    # Write to resumes.json in the js directory
    output_file = Path(__file__).parent.parent / "data" / "resumes.json"

    # Create js directory if it doesn't exist
    output_file.parent.mkdir(exist_ok=True)

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(resumes_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Successfully generated {output_file}")
        print(f"📊 Total resumes: {len(resume_pairs)}")

        # List all included resumes
        for resume in resume_pairs:
            has_photo = "✓" if resume["hasPngPhoto"] else "✗"
            print(f"   📄 {resume['jsonFile']} ({has_photo} Photo)")

        return True

    except Exception as e:
        print(f"❌ Error writing resumes.json: {e}")
        return False


def main():
    """Main function"""
    print("🚀 Resume Assets Generator Script")
    print("=" * 50)

    success = generate_resumes_json()

    if success:
        print("\n✅ Resume assets generation completed successfully!")
        print(
            "💡 The resumes.json file contains a list of all JSON resume files and their matching profile photos."
        )
        print(
            "🔄 Run this script whenever you add new resume data files or profile photos."
        )
    else:
        print("\n❌ Resume assets generation failed!")
        exit(1)


if __name__ == "__main__":
    main()
