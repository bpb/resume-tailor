/**
 * Theme Switcher Module
 * Dynamically loads themes from themes.json and handles theme switching
 */

class ThemeSwitcher {
  constructor() {
    // Core properties
    this.themesData = null;
    this.themeSelect = document.getElementById("themeSelect");
    this.themeStylesheet = document.getElementById("theme-stylesheet");
    this.currentTheme = null;

    // Path to themes and CSS
    this.themesJsonPath = "data/themes.json";
    this.cssBasePath = "css/";

    // Initialize
    this.init();
  }

  /**
   * Initialize the theme switcher
   */
  async init() {
    try {
      // Load themes data from JSON
      await this.loadThemesData();

      // Populate the theme dropdown
      this.populateThemeOptions();

      // Setup event listeners
      this.setupEventListeners();

      // Set initial theme
      this.setInitialTheme();

      console.log("🎨 Theme Switcher initialized");
    } catch (error) {
      console.error("Error initializing theme switcher:", error);
    }
  }

  /**
   * Load themes data from the JSON file
   */
  async loadThemesData() {
    try {
      const response = await fetch(this.themesJsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load themes data: ${response.status}`);
      }

      this.themesData = await response.json();
      console.log(
        `Loaded ${this.themesData.totalThemes} themes from themes.json`,
      );

      return this.themesData;
    } catch (error) {
      console.error("Error loading themes data:", error);
      // Create minimal fallback data
      this.themesData = {
        version: "fallback",
        generated: new Date().toISOString(),
        totalThemes: 0,
        themes: [],
      };
    }
  }

  /**
   * Populate the theme dropdown with options from themes.json
   */
  populateThemeOptions() {
    if (!this.themeSelect || !this.themesData) return;

    // Clear existing options
    this.themeSelect.innerHTML = "";

    // Array for all themes
    const themeOptions = [];

    // Process themes from data
    this.themesData.themes.forEach((theme) => {
      // Create theme option
      const themeOption = document.createElement("option");

      // Format theme name for display (capitalize words)
      let displayName = theme.name.replace(/-/g, " ").trim();

      // Capitalize first letter of each word
      displayName = displayName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Setup theme option
      themeOption.value = `${theme.name}/theme`;
      themeOption.textContent = displayName;
      themeOptions.push(themeOption);
    });

    // Add all themes to the select element
    if (themeOptions.length > 0) {
      const themeGroup = document.createElement("optgroup");
      themeGroup.label = "Themes";
      themeOptions.forEach((option) => themeGroup.appendChild(option));
      this.themeSelect.appendChild(themeGroup);
    }

    console.log(`Populated theme selector with ${themeOptions.length} themes`);
  }
  /**
   * Setup event listeners for theme switching
   */
  setupEventListeners() {
    // Theme select change event
    if (this.themeSelect) {
      this.themeSelect.addEventListener("change", () => {
        this.changeTheme(this.themeSelect.value);
      });
    }

    // Listen for keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Alt+T to focus theme selector
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        if (this.themeSelect) {
          this.themeSelect.focus();
          this.toggleThemeSelector(true);
        }
      }
    });
  }

  /**
   * Set the initial theme
   * - First checks URL parameters
   * - Then checks localStorage
   * - Falls back to first theme in the list
   */
  setInitialTheme() {
    // Check for theme in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get("theme");

    // Check for theme in localStorage
    const storedTheme = localStorage.getItem("selectedTheme");

    // Determine which theme to use
    let initialTheme = null;

    if (themeParam && this.themeExists(themeParam)) {
      // Use theme from URL parameter
      initialTheme = themeParam;
      console.log(`Using theme from URL parameter: ${initialTheme}`);
    } else if (storedTheme && this.themeExists(storedTheme)) {
      // Use theme from localStorage
      initialTheme = storedTheme;
      console.log(`Using theme from localStorage: ${initialTheme}`);
    } else if (this.themesData?.themes?.length > 0) {
      // Use first theme from themes.json
      const firstTheme = this.themesData.themes[0];
      initialTheme = `${firstTheme.name}/theme`;
      console.log(`Using default theme: ${initialTheme}`);
    } else {
      // Fallback to cyberpunk theme
      initialTheme = "cyberpunk/theme";
      console.log(`Using fallback theme: ${initialTheme}`);
    }

    // Apply the initial theme
    this.changeTheme(initialTheme);

    // Update the select element
    if (this.themeSelect) {
      this.themeSelect.value = initialTheme;
    }
  }

  /**
   * Check if a theme exists in the loaded themes data
   */
  themeExists(themePath) {
    if (!this.themesData || !this.themesData.themes) return false;

    // Parse the theme path to get the theme name and file
    const pathParts = themePath.split("/");
    const themeName = pathParts[0];

    // Check if the theme directory exists
    return this.themesData.themes.some((theme) => theme.name === themeName);
  }

  /**
   * Change the active theme
   */
  changeTheme(themePath) {
    // Skip if theme is already active
    if (this.currentTheme === themePath) return;

    // Parse the theme path (format: "theme-name/file-name")
    let themeName, themeFile;

    if (themePath.includes("/")) {
      // New format: "theme-name/file-name"
      const parts = themePath.split("/");
      themeName = parts[0];
      themeFile = parts[1];

      // Add .css extension if not present
      if (!themeFile.endsWith(".css")) {
        themeFile += ".css";
      }
    } else {
      // Legacy format: direct filename
      // This handles backward compatibility with old links
      themeName = "cyberpunk"; // Default fallback
      themeFile = "theme";

      // Ensure it ends with .css
      if (!themeFile.endsWith(".css")) {
        themeFile += ".css";
      }

      console.warn(
        `Legacy theme format detected: ${themePath}, using ${themeName}/${themeFile}`,
      );
    }

    // Build the full path to the CSS file
    const fullPath = `${this.cssBasePath}${themeName}/${themeFile}`;

    // Update the stylesheet link
    if (this.themeStylesheet) {
      this.themeStylesheet.href = fullPath;
      console.log(`Theme changed to: ${themeName}/${themeFile} (${fullPath})`);
    } else {
      console.error("Theme stylesheet element not found");
    }

    // Update body attribute for theme-specific styling
    document.body.setAttribute("data-theme", themeName);

    // Store current theme
    this.currentTheme = themePath;

    // Save to localStorage for persistence
    localStorage.setItem("selectedTheme", themePath);

    // Dispatch theme changed event for other components
    const event = new CustomEvent("themeChanged", {
      detail: {
        themeName: themeName,
        themeFile: themeFile,
        fullPath: fullPath,
        isPDFMode: document.body.classList.contains("pdf-mode"),
      },
    });
    document.dispatchEvent(event);

    // Update PDF toggle state if it exists
    if (window.pdfHandler) {
      this.updatePDFToggleState();
    }
  }

  /**
   * Toggle theme selector visibility (for mobile)
   */
  toggleThemeSelector(show) {
    const selector = document.getElementById("themeSelector");
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
   * Get the current theme information
   */
  getCurrentThemeInfo() {
    return {
      name: this.currentTheme,
      isPdf: this.currentTheme?.includes("pdf") || false,
      path: this.themeStylesheet?.href || null,
    };
  }

  /**
   * Get all available themes
   */
  getAllThemes() {
    return this.themesData?.themes || [];
  }
}

// Initialize theme switcher when DOM is ready
let themeSwitcher;

document.addEventListener("DOMContentLoaded", function () {
  themeSwitcher = new ThemeSwitcher();

  // Make it globally accessible
  window.themeSwitcher = themeSwitcher;

  // For backward compatibility
  window.changeTheme = function () {
    const select = document.getElementById("themeSelect");
    if (select && themeSwitcher) {
      themeSwitcher.changeTheme(select.value);
    }
  };

  // For mobile toggle
  window.toggleThemeSelector = function () {
    if (themeSwitcher) {
      themeSwitcher.toggleThemeSelector();
    }
  };

  // For info panel
  window.hideInfo = function () {
    const info = document.getElementById("infoPanel");
    if (info) {
      info.classList.add("hidden");
    }
  };
});

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeSwitcher;
}
