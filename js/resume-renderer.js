/**
 * Resume Renderer Module
 * Handles loading and rendering resume data
 */

class ResumeRenderer {
  constructor() {
    // Core properties
    this.currentResumeData = null;
    this.resumeContainer = document.getElementById("resume");
    this.defaultResumePath = "resources/example/resume-data.json";

    // Initialize with default resume
    this.init();

    // Setup print optimization handlers
    this.setupPrintHandlers();
  }

  /**
   * Initialize the resume renderer
   */
  async init() {
    try {
      // Initial load of default resume
      await this.loadResumeData(this.defaultResumePath);
      console.log("📝 Resume Renderer initialized");
    } catch (error) {
      console.error("Error initializing resume renderer:", error);
    }
  }

  /**
   * Load resume data from the specified JSON file
   * @param {string} resumePath - Path to the resume JSON file
   */
  async loadResumeData(resumePath = this.defaultResumePath) {
    try {
      console.log(`Loading resume data from: ${resumePath}`);
      const response = await fetch(resumePath);

      if (!response.ok) {
        throw new Error(`Failed to load resume data: ${response.status}`);
      }

      this.currentResumeData = await response.json();
      this.renderResume(this.currentResumeData);
      return this.currentResumeData;
    } catch (error) {
      console.error("Error loading resume data:", error);
      console.warn(
        "🚨 CORS Error: To view this resume properly, please run a local HTTP server:",
      );
      console.warn("   cd resume_template_styler");
      console.warn("   python3 -m http.server 8000");
      console.warn("   Then open: http://localhost:8000/resume-dynamic.html");
      return this.getFallbackResumeData();
    }
  }

  /**
   * Get fallback resume data for error cases
   * @returns {Object} Empty resume data structure
   */
  getFallbackResumeData() {
    console.log("Error loading resume data, no fallback will be displayed");
    return {};
  }

  /**
   * Render the resume from the provided data
   * @param {Object} data - Resume data to render
   */
  renderResume(data) {
    if (!this.resumeContainer || !data) {
      console.error("Resume container not found or data is empty");
      return;
    }

    // Sidebar (left)
    const sidebar = `
      <aside class="sidebar">
        <div class="avatar"><img src="${data.personal.photo}" alt="${data.personal.name}" /></div>
        <div class="name">${data.personal.name}</div>
        <div class="role">${data.personal.title}</div>

        <div class="section"><h3>Personal Details</h3>
          <div class="contact">
            <div class="contact-row"><span class="contact-key">Phone:</span><span class="contact-value">${data.personal.phone}</span></div>
            <div class="contact-row"><span class="contact-key">Email:</span><span class="contact-value">${data.personal.email}</span></div>
            <div class="contact-row"><span class="contact-key">Location:</span><span class="contact-value">${data.personal.location}</span></div>
            <div class="contact-row"><span class="contact-key">LinkedIn:</span><span class="contact-value"><a href="https://www.linkedin.com/in/${data.personal.linkedin}" target="_blank">${data.personal.linkedin}</a></span></div>
            <div class="contact-row"><span class="contact-key">Instagram:</span><span class="contact-value"><a href="https://www.instagram.com/${data.personal.instagram}" target="_blank">${data.personal.instagram}</a></span></div>
            <div class="contact-row"><span class="contact-key">GitHub:</span><span class="contact-value"><a href="https://www.github.com/${data.personal.github}" target="_blank">${data.personal.github}</a></span></div>
            <div class="contact-row"><span class="contact-key">Work Auth:</span><span class="contact-value">${data.personal.workAuth}</span></div>
            <div class="contact-row"><span class="contact-key">Hobbies:</span><span class="contact-value">${data.personal.hobbies}</span></div>
          </div>
        </div>

        ${Object.keys(data.skills)
          .map((category) => {
            const title =
              category.charAt(0).toUpperCase() +
              category.slice(1).replace(/_/g, " ");
            const items = data.skills[category];
            return `
        <div class="section"><h3>${title}</h3>
          ${items
            .map(
              (item) =>
                `<div class="skill-row"><span class="skill-name">${item.name}</span><div class="meter" data-level="${item.level}">${Array(
                  5,
                )
                  .fill()
                  .map(() => '<div class="seg"></div>')
                  .join("")}</div></div>`,
            )
            .join("")}
        </div>`;
          })
          .join("")}

        <div class="section"><h3>Qualities</h3>
          ${data.qualities.map((q) => `<span class="pill">${q}</span>`).join(" ")}
        </div>

      </aside>
    `;

    // Main content (right)
    const main = `
      <main class="main">
        <section class="card">
          <h2>Professional Summary</h2>
          <p class="muted">${data.personal.summaryMini}</p>
        </section>

        <section class="card"><h2>Experience</h2>
          ${data.experience
            .map(
              (job) => `
            <article class="job">
              <div class="top"><h3>${job.role} — ${job.company}</h3><div class="muted">${job.date} · ${job.location}</div></div>
              <div class="muted">${job.tech}</div>
              <ul>${job.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            </article>`,
            )
            .join("")}
        </section>

        <section class="card two-col">
          <div>
            <h2>Education</h2>
            ${data.education
              .map(
                (ed) => `
              <div class="job"><div class="top"><h3>${ed.degree} — ${ed.school}</h3><div class="muted">${ed.date}</div></div><div class="muted">${ed.focus}</div></div>`,
              )
              .join("")}
          </div>
          <div>
            <h2>Projects & Publications</h2>
            ${data.projects.map((pr) => `<div class="job"><h3>${pr.title}</h3><div class="muted"><a href="${pr.desc}" target="_blank">Link To Paper</a></div></div>`).join("")}
          </div>
        </section>
      </main>
    `;

    this.resumeContainer.innerHTML = `<div class="page"><div class="grid">${sidebar}${main}</div></div>`;
    console.log("Resume rendered successfully");
  }

  /**
   * Get the current resume data
   * @returns {Object} The current resume data
   */
  getCurrentResumeData() {
    return this.currentResumeData;
  }

  /**
   * Apply print optimizations when printing
   * Adds print-specific classes and adjusts page breaks
   */
  optimizeForPrint() {
    if (!this.resumeContainer) {
      console.error("Resume container not found");
      return;
    }

    // Add print optimization class
    this.resumeContainer.classList.add("print-optimized");

    // Apply page break adjustments
    this.adjustPageBreaks();

    console.log("Print optimizations applied");
  }

  /**
   * Remove print optimizations after printing
   */
  restoreFromPrint() {
    if (!this.resumeContainer) {
      console.error("Resume container not found");
      return;
    }

    // Remove print optimization class
    this.resumeContainer.classList.remove("print-optimized");

    // Remove any inline page-break styles
    const jobSections = this.resumeContainer.querySelectorAll(".job");
    jobSections.forEach((section) => {
      section.style.pageBreakInside = "";
    });

    // Remove any print-specific classes
    const cardSections =
      this.resumeContainer.querySelectorAll(".print-spacing");
    cardSections.forEach((card) => {
      card.classList.remove("print-spacing");
    });

    console.log("Print optimizations removed");
  }

  /**
   * Adjust content to prevent bad page breaks when printing
   * This ensures that sections don't break across pages poorly
   */
  adjustPageBreaks() {
    if (!this.resumeContainer) return;

    // Find all job/education sections
    const jobSections = this.resumeContainer.querySelectorAll(".job");
    const cardSections = this.resumeContainer.querySelectorAll(".card");

    // Add page-break-inside: avoid to prevent breaking inside important sections
    jobSections.forEach((section) => {
      section.style.pageBreakInside = "avoid";
    });

    // Add space for better visual separation in print
    cardSections.forEach((card) => {
      card.classList.add("print-spacing");
    });
  }

  /**
   * Setup print event handlers
   * This method adds event listeners to respond to browser print events
   */
  setupPrintHandlers() {
    // Listen for browser print events
    window.addEventListener("beforeprint", () => {
      // Apply print optimizations before printing
      this.optimizeForPrint();
    });

    window.addEventListener("afterprint", () => {
      // Remove print optimizations after printing
      this.restoreFromPrint();
    });

    console.log("Print handlers setup complete");
  }
}

// Initialize resume renderer
let resumeRenderer;

// Function to initialize the resume renderer
function initResumeRenderer() {
  if (!resumeRenderer) {
    resumeRenderer = new ResumeRenderer();

    // Make it globally accessible for other modules like resume-switcher.js
    window.resumeRenderer = resumeRenderer;

    // Dispatch an event to notify other components that the renderer is ready
    document.dispatchEvent(
      new CustomEvent("resumeRendererReady", {
        detail: { resumeRenderer },
      }),
    );

    console.log("ResumeRenderer initialized and exposed globally");
  }
  return resumeRenderer;
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initResumeRenderer();
});

// Allow immediate initialization if the DOM is already loaded
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(initResumeRenderer, 1);
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ResumeRenderer;
}
