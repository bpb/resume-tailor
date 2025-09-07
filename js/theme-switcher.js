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

    // Process themes from data (now a dictionary)
    Object.keys(this.themesData.themes).forEach((displayName) => {
      // Create theme option
      const themeOption = document.createElement("option");

      // Get the theme value from the dictionary
      const theme = this.themesData.themes[displayName];

      // Setup theme option
      themeOption.value = `${displayName}`;
      themeOption.textContent = displayName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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
    } else if (Object.keys(this.themesData?.themes || {}).length > 0) {
      // Use first theme from themes.json
      const firstThemeKey = Object.keys(this.themesData.themes)[0];
      initialTheme = `${firstThemeKey}`;
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
  themeExists(themeName) {
    // Check if the theme directory exists
    if (!this.themesData || !this.themesData.themes) return false;

    // Check if the theme exists in our themes data
    for (const displayName in this.themesData.themes) {
      const theme = this.themesData.themes[displayName];
      if (theme === themeName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Change the active theme
   */
  changeTheme(themeName) {
    // Skip if theme is already active
    if (this.currentTheme === themeName) return;

    // Find the theme in our themes data
    let fullPath = "";

    // Look through available themes to find the matching one

    const theme = this.themesData.themes[themeName];
    fullPath = theme.filePath; // Get the full path from the theme object

    // Update the stylesheet link
    if (this.themeStylesheet) {
      this.themeStylesheet.href = fullPath;
      console.log(`Theme changed to: ${themeName} (${fullPath})`);
    } else {
      console.error("Theme stylesheet element not found");
    }

    // Update body attribute for theme-specific styling
    document.body.setAttribute("data-theme", themeName);

    // Store current theme
    this.currentTheme = themeName;

    // Save to localStorage for persistence
    localStorage.setItem("selectedTheme", themeName);

    // Dispatch theme changed event for other components
    const event = new CustomEvent("themeChanged", {
      detail: {
        themeName: themeName,
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
