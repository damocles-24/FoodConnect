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
      apply("light", false);
    }
  };

  /* All roles default to Light. Saved choice wins. */
  apply(stored() || "light", false);

  document.addEventListener("DOMContentLoaded", () => {
    apply(stored() || root.dataset.theme || "light", false);

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
})();
