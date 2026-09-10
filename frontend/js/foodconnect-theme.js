(() => {
  "use strict";

  const KEY = "foodconnect-theme";
  const root = document.documentElement;

  function normalize(value) {
    return value === "dark" ? "dark" : "light";
  }

  function stored() {
    try {
      const value = localStorage.getItem(KEY);
      return value === "dark" || value === "light"
        ? value
        : null;
    } catch (_) {
      return null;
    }
  }

  function fallbackTheme() {
    return normalize(
      root.dataset.theme ||
      root.dataset.defaultTheme ||
      "light"
    );
  }

  function syncControls(theme) {
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const active = button.dataset.themeChoice === theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const next = theme === "dark" ? "light" : "dark";
      const label = `Switch to ${next} mode`;
      button.dataset.currentTheme = theme;
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  function apply(value, save = false) {
    const theme = normalize(value);

    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    if (document.body) {
      document.body.dataset.theme = theme;
    }

    if (save) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (_) {}
    }

    syncControls(theme);

    window.dispatchEvent(
      new CustomEvent("foodconnectthemechange", {
        detail: { theme }
      })
    );
  }

  function syncFromStorage() {
    const theme = stored() || fallbackTheme();

    if (
      root.dataset.theme !== theme ||
      (document.body && document.body.dataset.theme !== theme)
    ) {
      apply(theme, false);
      return;
    }

    syncControls(theme);
  }

  function toggle() {
    apply(
      (root.dataset.theme || "light") === "dark"
        ? "light"
        : "dark",
      true
    );
  }

  window.FoodConnectTheme = {
    get() {
      return root.dataset.theme || "light";
    },

    set(theme) {
      apply(theme, true);
    },

    toggle,

    reset() {
      try {
        localStorage.removeItem(KEY);
      } catch (_) {}
      apply(
        normalize(root.dataset.defaultTheme || "light"),
        false
      );
    },

    sync() {
      syncFromStorage();
    }
  };

  /* Apply saved theme as early as possible to prevent a light/dark flash. */
  apply(stored() || fallbackTheme(), false);

  document.addEventListener("DOMContentLoaded", () => {
    syncFromStorage();

    document.addEventListener("click", (event) => {
      const choice = event.target.closest?.("[data-theme-choice]");

      if (choice) {
        event.preventDefault();
        apply(choice.dataset.themeChoice, true);
        return;
      }

      const toggleButton = event.target.closest?.("[data-theme-toggle]");

      if (toggleButton) {
        event.preventDefault();
        toggle();
      }
    });

    const riderName = document.getElementById("riderName");
    const headerName = document.getElementById("deliveryHeaderName");

    if (riderName && headerName) {
      const syncName = () => {
        headerName.textContent =
          riderName.textContent.trim() || "Delivery Staff";
      };

      syncName();

      new MutationObserver(syncName).observe(riderName, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  });

  /*
   * Mobile browsers and normal browsers can restore pages from the
   * back/forward cache without re-running scripts. Re-sync the saved
   * preference whenever a cached page becomes visible again.
   */
  window.addEventListener("pageshow", syncFromStorage);
  window.addEventListener("focus", syncFromStorage);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncFromStorage();
    }
  });

  /* Keep another open FoodConnect tab/window in sync instantly. */
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY) {
      return;
    }

    apply(
      event.newValue || root.dataset.defaultTheme || "light",
      false
    );
  });
})();
