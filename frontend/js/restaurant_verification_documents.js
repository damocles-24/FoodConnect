"use strict";

(() => {
  const API_BASE = "/api";
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const REQUIRED_TYPES = ["bir_2303", "restaurant_menu", "applicant_id"];
  const statusIds = {
    bir_2303: "verificationBir2303Status",
    restaurant_menu: "verificationRestaurantMenuStatus",
    applicant_id: "verificationApplicantIdStatus"
  };

  const uploaded = new Set();
  let menuUploadedCount = 0;
  let menuUploadedNames = [];

  function setStatus(type, text, state = "") {
    const el = document.getElementById(statusIds[type]);
    if (!el) return;

    el.textContent = text;
    el.classList.remove("uploaded", "error");

    if (state) {
      el.classList.add(state);
    }
  }

  function setMenuStatus(state = "uploaded", suffix = "") {
    const el = document.getElementById(statusIds.restaurant_menu);
    if (!el) return;

    if (menuUploadedCount <= 0) {
      el.removeAttribute("title");
      setStatus("restaurant_menu", suffix || "Not uploaded", state === "error" ? "error" : "");
      return;
    }

    const countText = `${menuUploadedCount} menu file${menuUploadedCount === 1 ? "" : "s"} uploaded`;
    const statusText = suffix ? `${countText}. ${suffix}` : countText;

    setStatus("restaurant_menu", statusText, state);

    if (menuUploadedNames.length) {
      el.title = menuUploadedNames.join("\n");
    } else {
      el.removeAttribute("title");
    }
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
      const response = await fetch(
        `${API_BASE}/get_restaurant_verification_documents.php`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store"
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      const documents = Array.isArray(data.documents) ? data.documents : [];
      const menuDocuments = documents.filter(
        doc => doc.document_type === "restaurant_menu"
      );

      menuUploadedCount = menuDocuments.length;
      menuUploadedNames = menuDocuments
        .map(doc => String(doc.original_name || "").trim())
        .filter(Boolean);

      if (menuUploadedCount > 0) {
        uploaded.add("restaurant_menu");
        setMenuStatus("uploaded");
      }

      ["bir_2303", "applicant_id"].forEach(type => {
        const doc = documents.find(item => item.document_type === type);

        if (!doc) {
          return;
        }

        uploaded.add(type);
        setStatus(type, `Uploaded: ${doc.original_name}`, "uploaded");
      });

      notifyStateChanged();
    } catch (_) {
      notifyStateChanged();
    }
  }

  async function uploadOne(type, file) {
    const body = new FormData();
    body.append("document_type", type);
    body.append("document", file);

    const response = await fetch(
      `${API_BASE}/upload_restaurant_verification_document.php`,
      {
        method: "POST",
        credentials: "include",
        body
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Upload failed.");
    }

    return data.document || {};
  }

  async function uploadFiles(type, fileList) {
    const error = document.getElementById("verificationDocumentsError");

    if (error) {
      error.textContent = "";
    }

    const files = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    if (files.some(file => file.size > MAX_FILE_SIZE)) {
      if (type === "restaurant_menu") {
        setMenuStatus(
          "error",
          "Each selected file must be 5 MB or smaller."
        );
      } else {
        setStatus(type, "File is larger than 5 MB.", "error");
      }

      return;
    }

    if (type !== "restaurant_menu") {
      const file = files[0];
      setStatus(type, "Uploading…");

      try {
        const documentData = await uploadOne(type, file);
        uploaded.add(type);
        setStatus(
          type,
          `Uploaded: ${documentData.original_name || file.name}`,
          "uploaded"
        );
      } catch (uploadError) {
        setStatus(type, uploadError.message || "Upload failed.", "error");
      }

      notifyStateChanged();
      return;
    }

    setStatus(
      "restaurant_menu",
      `Uploading ${files.length} menu file${files.length === 1 ? "" : "s"}…`
    );

    let successfulUploads = 0;
    const failures = [];

    for (const file of files) {
      try {
        const documentData = await uploadOne("restaurant_menu", file);
        successfulUploads += 1;
        menuUploadedCount += 1;
        menuUploadedNames.push(
          String(documentData.original_name || file.name).trim()
        );
      } catch (uploadError) {
        failures.push(uploadError.message || `${file.name} failed to upload.`);
      }
    }

    if (menuUploadedCount > 0) {
      uploaded.add("restaurant_menu");
    }

    if (failures.length) {
      setMenuStatus(
        "error",
        `${failures.length} file${failures.length === 1 ? "" : "s"} failed to upload.`
      );
    } else if (successfulUploads > 0) {
      setMenuStatus("uploaded");
    }

    notifyStateChanged();
  }

  function validateForSubmit(showErrors = true) {
    const missing = REQUIRED_TYPES.filter(type => !uploaded.has(type));
    const error = document.getElementById("verificationDocumentsError");

    if (missing.length) {
      if (showErrors && error) {
        error.textContent =
          "Upload BIR Form 2303, at least 1 Restaurant / Dine-in Menu file, and Applicant Identification Document before continuing.";
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

    if (error) {
      error.textContent = "";
    }

    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".verification-upload-button").forEach(button => {
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.inputId)?.click();
      });
    });

    document
      .querySelectorAll('.verification-document-item input[type="file"]')
      .forEach(input => {
        input.addEventListener("change", async () => {
          const item = input.closest(".verification-document-item");
          const type = item?.dataset.documentType || "";

          await uploadFiles(type, input.files);
          input.value = "";
        });
      });

    document.getElementById("restaurantForm")?.addEventListener(
      "submit",
      event => {
        if (!validateForSubmit()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );

    loadExisting();
  });

  window.FoodConnectVerificationDocuments = {
    validateForSubmit,
    loadExisting,
    isComplete
  };
})();
