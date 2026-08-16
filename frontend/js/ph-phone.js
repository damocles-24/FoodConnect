(() => {
  "use strict";
  const digitsOnly = value => String(value ?? "").replace(/\D/g, "");

  function toLocalDigits(value) {
    let digits = digitsOnly(value);
    if (digits.startsWith("63")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
  }

  function normalize(value) {
    const local = toLocalDigits(value);
    return /^9\d{9}$/.test(local) ? `+63${local}` : "";
  }

  function isValid(value) {
    return normalize(value) !== "";
  }

  function format(value, fallback = "") {
    const normalized = normalize(value);
    if (!normalized) {
      const raw = String(value ?? "").trim();
      return raw || fallback;
    }
    const local = normalized.slice(3);
    return `+63 ${local.slice(0,3)} ${local.slice(3,6)} ${local.slice(6)}`;
  }

  function bindLocalInput(input) {
    if (!input || input.dataset.phPhoneBound === "1") return;
    input.dataset.phPhoneBound = "1";
    input.inputMode = "numeric";
    input.maxLength = 10;
    const clean = () => { input.value = toLocalDigits(input.value); };
    input.addEventListener("input", clean);
    input.addEventListener("paste", () => setTimeout(clean, 0));
  }

  function bindAll(root = document) {
    root.querySelectorAll("[data-ph-phone-local]").forEach(bindLocalInput);
  }

  window.FoodConnectPhone = {
    toLocalDigits,
    normalize,
    isValid,
    format,
    tel: normalize,
    bindLocalInput,
    bindAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bindAll());
  } else {
    bindAll();
  }
})();