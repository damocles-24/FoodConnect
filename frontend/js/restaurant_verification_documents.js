"use strict";

(() => {
  const API_BASE = "/api";
  const REQUIRED_TYPES = ["bir_2303", "restaurant_menu", "applicant_id"];
  const statusIds = {
    bir_2303: "verificationBir2303Status",
    restaurant_menu: "verificationRestaurantMenuStatus",
    applicant_id: "verificationApplicantIdStatus"
  };
  const uploaded = new Set();

  function setStatus(type, text, state = "") {
    const el = document.getElementById(statusIds[type]);
    if (!el) return;
    el.textContent = text;
    el.classList.remove("uploaded", "error");
    if (state) el.classList.add(state);
  }

  function notifyStateChanged() {
    document.dispatchEvent(
      new CustomEvent("foodconnect:verification-documents-changed")
    );
  }

  function isComplete() {
    return REQUIRED_TYPES.every(type => uploaded.has(type));
  }

  async function loadExisting() {
    try {
      const response = await fetch(`${API_BASE}/get_restaurant_verification_documents.php`, { credentials: "include", headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok || !data.success) return;
      (data.documents || []).forEach(doc => {
        uploaded.add(doc.document_type);
        setStatus(doc.document_type, `Uploaded: ${doc.original_name}`, "uploaded");
      });
      notifyStateChanged();
    } catch (_) {
      notifyStateChanged();
    }
  }

  async function upload(type, file) {
    const error = document.getElementById("verificationDocumentsError");
    if (error) error.textContent = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus(type, "File is larger than 5 MB.", "error");
      return;
    }
    setStatus(type, "Uploading…");
    const body = new FormData();
    body.append("document_type", type);
    body.append("document", file);
    try {
      const response = await fetch(`${API_BASE}/upload_restaurant_verification_document.php`, { method: "POST", credentials: "include", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Upload failed.");
      uploaded.add(type);
      setStatus(type, `Uploaded: ${data.document.original_name}`, "uploaded");
      notifyStateChanged();
    } catch (e) {
      setStatus(type, e.message || "Upload failed.", "error");
    }
  }

  function validateForSubmit(showErrors = true) {
    const missing = REQUIRED_TYPES.filter(type => !uploaded.has(type));
    const error = document.getElementById("verificationDocumentsError");

    if (missing.length) {
      if (showErrors && error) {
        error.textContent =
          "Upload BIR Form 2303, Restaurant / Dine-in Menu, and Applicant Identification Document before continuing.";
      }

      if (showErrors) {
        document
          .querySelector(".verification-documents-card")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
      }

      return false;
    }

    if (error) error.textContent = "";
    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".verification-upload-button").forEach(button => {
      button.addEventListener("click", () => document.getElementById(button.dataset.inputId)?.click());
    });
    document.querySelectorAll('.verification-document-item input[type="file"]').forEach(input => {
      input.addEventListener("change", () => {
        const item = input.closest(".verification-document-item");
        upload(item?.dataset.documentType || "", input.files?.[0]);
        input.value = "";
      });
    });
    document.getElementById("restaurantForm")?.addEventListener("submit", event => {
      if (!validateForSubmit()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    loadExisting();
  });

  window.FoodConnectVerificationDocuments = {
    validateForSubmit,
    loadExisting,
    isComplete
  };
})();
