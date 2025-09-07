/**
 * Resume Switcher Module
 * Dynamically loads resumes from resumes.json and handles resume switching
 */

class ResumeSwitcher {
  constructor() {
    // Core properties
    this.resumesData = null;
    this.resumeSelect = document.getElementById("resumeSelect");
    this.currentResume = null;

    // Path to resumes JSON
    this.resumesJsonPath = "data/resumes.json";

    // Initialize
    this.init();
  }

  /**
   * Initialize the resume switcher
   */
  async init() {
    try {
      // Load resumes data from JSON
      await this.loadResumesData();

      // Populate the resume dropdown
      this.populateResumeOptions();

      // Setup event listeners
      this.setupEventListeners();

      // Check if resume renderer is available
      if (window.resumeRenderer) {
        console.log("Resume renderer found, initializing resume switching");
        this.setInitialResume();
      } else {
        console.log(
          "Resume renderer not found yet, waiting for renderer ready event",
        );
        // Listen for the resume renderer ready event
        document.addEventListener("resumeRendererReady", () => {
          console.log(
            "Resume renderer ready event received, initializing resume switching",
          );
          this.setInitialResume();
        });

        // Fallback if event never fires (after 2 seconds)
        setTimeout(() => {
          if (!this.currentResume) {
            console.warn(
              "Resume renderer ready event never received, trying fallback initialization",
            );
            this.setInitialResume();
          }
        }, 2000);
      }

      console.log("📄 Resume Switcher initialized");
    } catch (error) {
      console.error("Error initializing resume switcher:", error);
    }
  }

  /**
   * Load resumes data from the JSON file
   */
  async loadResumesData() {
    try {
      const response = await fetch(this.resumesJsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load resumes data: ${response.status}`);
      }

      this.resumesData = await response.json();
      console.log(
        `Loaded ${this.resumesData.totalResumes} resumes from resumes.json`,
      );

      return this.resumesData;
    } catch (error) {
      console.error("Error loading resumes data:", error);
      // Create minimal fallback data
      this.resumesData = {
        version: "fallback",
        generated: new Date().toISOString(),
        totalResumes: 1,
        resumes: [
          {
            jsonFile: "resources/example/resume-data.json",
            jsonSize: 0,
            jsonLastModified: Date.now(),
            hasPngPhoto: false,
          },
        ],
      };
    }
  }

  /**
   * Populate the resume dropdown with options from resumes.json
   */
  populateResumeOptions() {
    if (!this.resumeSelect || !this.resumesData) return;

    // Clear existing options
    this.resumeSelect.innerHTML = "";

    // Process resumes from data (now an object with keys as resume names)
    Object.entries(this.resumesData.resumes).forEach(([name, resume]) => {
      const option = document.createElement("option");

      // Use the name from the key in resumes.json
      let displayName = name;

      // Capitalize first letter of each word
      displayName = displayName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Setup option
      option.value = resume.jsonFile;
      option.textContent = displayName;

      this.resumeSelect.appendChild(option);
    });

    console.log(
      `Populated resume selector with ${Object.keys(this.resumesData.resumes).length} resumes`,
    );
  }

  /**
   * Setup event listeners for resume switching
   */
  setupEventListeners() {
    // Resume select change event
    if (this.resumeSelect) {
      this.resumeSelect.addEventListener("change", () => {
        this.changeResume(this.resumeSelect.value);
      });
    }

    // Listen for keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Alt+R to focus resume selector
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (this.resumeSelect) {
          this.resumeSelect.focus();
          this.toggleResumeSelector(true);
        }
      }
    });
  }

  /**
   * Set the initial resume
   * - First checks URL parameters
   * - Then checks localStorage
   * - Falls back to first resume in the list
   */
  setInitialResume() {
    // Check for resume in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resumeParam = urlParams.get("resume");

    // Check for resume in localStorage
    const storedResume = localStorage.getItem("selectedResume");

    // Determine which resume to use
    let initialResume = null;

    if (resumeParam && this.resumeExists(resumeParam)) {
      // Use resume from URL parameter
      initialResume = resumeParam;
      console.log(`Using resume from URL parameter: ${initialResume}`);
    } else if (storedResume && this.resumeExists(storedResume)) {
      // Use resume from localStorage
      initialResume = storedResume;
      console.log(`Using resume from localStorage: ${initialResume}`);
    } else if (Object.keys(this.resumesData?.resumes || {}).length > 0) {
      // Use first resume from resumes.json
      initialResume =
        this.resumesData.resumes[Object.keys(this.resumesData.resumes)[0]]
          .jsonFile;
      console.log(`Using default resume: ${initialResume}`);
    } else {
      // Fallback to example resume
      initialResume = "resources/example/resume-data.json";
      console.log(`Using fallback resume: ${initialResume}`);
    }

    // Apply the initial resume
    this.changeResume(initialResume);

    // Update the select element
    if (this.resumeSelect) {
      this.resumeSelect.value = initialResume;
    }
  }

  /**
   * Check if a resume exists in the loaded resumes data
   */
  resumeExists(resumePath) {
    if (!this.resumesData || !this.resumesData.resumes) return false;

    // Check if any resume in the object has the matching jsonFile path
    return Object.values(this.resumesData.resumes).some(
      (resume) => resume.jsonFile === resumePath,
    );
  }

  /**
   * Change the active resume
   */
  changeResume(resumePath) {
    // Skip if resume is already active
    if (this.currentResume === resumePath) return;

    // Store current resume
    this.currentResume = resumePath;

    // Save to localStorage for persistence
    localStorage.setItem("selectedResume", resumePath);

    // Render the resume (assuming we have a renderer)
    if (window.resumeRenderer) {
      window.resumeRenderer.loadResumeData(resumePath);
    } else {
      console.error("Resume renderer not found");
      // Check if we're already in a reload cycle (avoid infinite loop)
      const urlParams = new URLSearchParams(window.location.search);
      const currentResumeParam = urlParams.get("resume");

      if (!currentResumeParam) {
        // Only reload if we don't already have a resume parameter
        window.location.href = `?resume=${encodeURIComponent(resumePath)}`;
      } else {
        console.warn(
          "Resume renderer still not available after reload. Please check implementation.",
        );
        // Display user-friendly error message
        const mainContent = document.querySelector("main") || document.body;
        if (mainContent) {
          const errorMsg = document.createElement("div");
          errorMsg.className = "resume-error";
          errorMsg.innerHTML = `<h2>Resume loading error</h2>
                                <p>The resume renderer is not available. Please check the console for more details.</p>`;
          errorMsg.style.cssText =
            "padding: 20px; margin: 20px; border: 1px solid #f00; background: #fff3f3;";
          mainContent.prepend(errorMsg);
        }
      }
    }

    console.log(`Resume changed to: ${resumePath}`);

    // Dispatch resume changed event for other components
    const event = new CustomEvent("resumeChanged", {
      detail: {
        resumePath: resumePath,
      },
    });
    document.dispatchEvent(event);
  }

  /**
   * Toggle resume selector visibility (for mobile)
   */
  toggleResumeSelector(show) {
    const selector = document.getElementById("resumeSelector");
    if (selector) {
      if (show === undefined) {
        // Toggle based on current state
        selector.classList.toggle("active");
      } else if (show) {
        // Force show
        selector.classList.add("active");
      } else {
        // Force hide
        selector.classList.remove("active");
      }
    }
  }

  /**
   * Get the current resume information
   */
  getCurrentResumeInfo() {
    return {
      path: this.currentResume,
    };
  }

  /**
   * Get all available resumes
   */
  getAllResumes() {
    return this.resumesData?.resumes || [];
  }
}

// Initialize resume switcher when DOM is ready
let resumeSwitcher;

document.addEventListener("DOMContentLoaded", function () {
  resumeSwitcher = new ResumeSwitcher();

  // Make it globally accessible
  window.resumeSwitcher = resumeSwitcher;

  // For backward compatibility
  window.changeResume = function () {
    const select = document.getElementById("resumeSelect");
    if (select && resumeSwitcher) {
      resumeSwitcher.changeResume(select.value);
    }
  };

  // For mobile toggle
  window.toggleResumeSelector = function () {
    if (resumeSwitcher) {
      resumeSwitcher.toggleResumeSelector();
    }
  };
});

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ResumeSwitcher;
}
