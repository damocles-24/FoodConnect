"use strict";

(() => {
  const API_BASE = "/FoodConnect/api";

  const structure =
    document.getElementById("productStructure");

  const singleFields =
    document.getElementById("singleProductFields");

  const builder =
    document.getElementById("productVariantsBuilder");

  const rows =
    document.getElementById("productVariantRows");

  const addRowButton =
    document.getElementById("addVariantRowBtn");

  const saveButton =
    document.getElementById("saveProductBtn");

  const modal =
    document.getElementById("addProductModal");

  if (
    !structure ||
    !builder ||
    !rows ||
    !addRowButton ||
    !saveButton
  ) {
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function makeVariantRow(data = {}) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "product-variant-row";

    wrapper.innerHTML = `
      <div class="form-group">
        <label>Size / Version *</label>
        <input
          type="text"
          class="variant-label-input"
          maxlength="20"
          placeholder="Small, Medium, Large, Hot, 6 PCS..."
          autocomplete="off"
          value="${escapeHtml(data.label || "")}"
        >
      </div>

      <div class="form-group">
        <label>Selling Price *</label>
        <input
          type="number"
          class="variant-price-input"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value="${escapeHtml(data.price || "")}"
        >
      </div>

      <div class="form-group">
        <label>Initial Stock *</label>
        <input
          type="number"
          class="variant-stock-input"
          min="0"
          step="1"
          value="${escapeHtml(
            data.stock === undefined
              ? "0"
              : data.stock
          )}"
        >
      </div>

      <div class="form-group">
        <label>Availability *</label>
        <select class="variant-status-input">
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      <button
        type="button"
        class="variant-remove-btn"
        aria-label="Remove variant"
      >
        Remove
      </button>
    `;

    wrapper.querySelector(
      ".variant-status-input"
    ).value =
      data.status || "Available";

    wrapper
      .querySelector(".variant-remove-btn")
      .addEventListener("click", () => {
        wrapper.remove();
        updateRemoveButtons();
      });

    rows.appendChild(wrapper);
    updateRemoveButtons();

    return wrapper;
  }

  function updateRemoveButtons() {
    const allRows =
      rows.querySelectorAll(
        ".product-variant-row"
      );

    allRows.forEach(row => {
      const remove =
        row.querySelector(
          ".variant-remove-btn"
        );

      if (remove) {
        remove.disabled =
          allRows.length <= 2;
      }
    });
  }

  function ensureDefaultRows() {
    if (
      rows.querySelectorAll(
        ".product-variant-row"
      ).length > 0
    ) {
      return;
    }

    makeVariantRow();
    makeVariantRow();
  }

  function setMode() {
    const multi =
      structure.value === "variants";

    if (singleFields) {
      singleFields.hidden = multi;
    }

    const singlePricingFields =
      document.getElementById(
        "singleProductPricingFields"
      );

    if (singlePricingFields) {
      singlePricingFields.hidden = multi;
    }

    builder.hidden = !multi;

    if (multi) {
      ensureDefaultRows();
    }
  }

  function collectVariants() {
    const result = [];

    rows
      .querySelectorAll(
        ".product-variant-row"
      )
      .forEach((row, index) => {
        const label =
          row.querySelector(
            ".variant-label-input"
          )?.value.trim() || "";

        const price =
          Number(
            row.querySelector(
              ".variant-price-input"
            )?.value
          );

        const stock =
          Number(
            row.querySelector(
              ".variant-stock-input"
            )?.value
          );

        const status =
          row.querySelector(
            ".variant-status-input"
          )?.value || "Available";

        result.push({
          index,
          label,
          price,
          stock,
          status
        });
      });

    return result;
  }

  function validateVariants(variants) {
    if (variants.length < 2) {
      throw new Error(
        "Add at least two variants."
      );
    }

    if (variants.length > 12) {
      throw new Error(
        "A product can have up to 12 variants."
      );
    }

    const labels = new Set();

    variants.forEach((variant, index) => {
      const rowNumber = index + 1;

      if (!variant.label) {
        throw new Error(
          `Variant ${rowNumber} needs a name.`
        );
      }

      if (variant.label.length > 20) {
        throw new Error(
          `Variant ${rowNumber} is too long.`
        );
      }

      const normalized =
        variant.label
          .toLowerCase()
          .replace(/\s+/g, " ");

      if (labels.has(normalized)) {
        throw new Error(
          `Duplicate variant: ${variant.label}.`
        );
      }

      labels.add(normalized);

      if (
        !Number.isFinite(
          variant.price
        ) ||
        variant.price <= 0
      ) {
        throw new Error(
          `${variant.label}: price must be greater than zero.`
        );
      }

      if (
        !Number.isInteger(
          variant.stock
        ) ||
        variant.stock < 0
      ) {
        throw new Error(
          `${variant.label}: stock must be zero or a positive whole number.`
        );
      }
    });
  }

  function getCommonFormData(
    variants
  ) {
    const name =
      document.getElementById(
        "productName"
      )?.value.trim() || "";

    const category =
      document.getElementById(
        "productCategory"
      )?.value.trim() || "";

    const description =
      document.getElementById(
        "productDescription"
      )?.value.trim() || "";

    if (!name) {
      throw new Error(
        "Product name is required."
      );
    }

    if (!category) {
      throw new Error(
        "Product category is required."
      );
    }

    if (description.length > 1000) {
      throw new Error(
        "Product description cannot exceed 1000 characters."
      );
    }

    const discountType =
      document.getElementById(
        "productDiscountType"
      )?.value || "none";

    const discountValue =
      Number(
        document.getElementById(
          "productDiscountValue"
        )?.value
      ) || 0;

    const discountSchedule =
      document.getElementById(
        "productDiscountSchedule"
      )?.value || "permanent";

    const discountStatus =
      document.getElementById(
        "productDiscountStatus"
      )?.value || "Inactive";

    const discountStart =
      document.getElementById(
        "productDiscountStart"
      )?.value || "";

    const discountEnd =
      document.getElementById(
        "productDiscountEnd"
      )?.value || "";

    if (
      discountType === "fixed"
    ) {
      const minPrice =
        Math.min(
          ...variants.map(
            item => item.price
          )
        );

      if (
        discountValue >
        minPrice
      ) {
        throw new Error(
          "A fixed discount cannot be greater than the lowest variant price."
        );
      }
    }

    const formData =
      new FormData();

    formData.append(
      "product_name",
      name
    );

    formData.append(
      "category",
      category
    );

    formData.append(
      "description",
      description
    );

    formData.append(
      "variants_json",
      JSON.stringify(
        variants.map(item => ({
          label: item.label,
          price: item.price,
          stock: item.stock,
          status: item.status
        }))
      )
    );

    formData.append(
      "discount_type",
      discountType
    );

    formData.append(
      "discount_value",
      String(discountValue)
    );

    formData.append(
      "discount_schedule",
      discountSchedule
    );

    formData.append(
      "discount_status",
      discountStatus
    );

    formData.append(
      "discount_start",
      discountStart
    );

    formData.append(
      "discount_end",
      discountEnd
    );

    const image =
      document.getElementById(
        "productImage"
      )?.files?.[0];

    if (image) {
      formData.append(
        "product_image",
        image
      );
    }

    return formData;
  }

  async function saveVariants() {
    const variants =
      collectVariants();

    validateVariants(
      variants
    );

    const formData =
      getCommonFormData(
        variants
      );

    const original =
      saveButton.textContent;

    saveButton.disabled = true;
    saveButton.textContent =
      "Saving variants...";

    try {
      const response =
        await fetch(
          `${API_BASE}/add_product_variants.php`,
          {
            method: "POST",
            credentials: "include",
            body: formData
          }
        );

      const raw =
        await response.text();

      let result;

      try {
        result =
          JSON.parse(raw);
      } catch (_) {
        throw new Error(
          "Variant API returned invalid JSON."
        );
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Changes could not be saved product variants."
        );
      }

      const firstProductId =
        Number(
          Array.isArray(result.product_ids)
            ? result.product_ids[0]
            : 0
        );

      if (
        firstProductId > 0 &&
        typeof window.saveProductAddonAssignments === "function"
      ) {
        const container =
          document.getElementById(
            "productAddonChoiceList"
          );

        const addonIds =
          container
            ? Array.from(
                container.querySelectorAll(
                  'input[type="checkbox"]:checked'
                )
              )
                .map(input => Number(input.value))
                .filter(id => Number.isInteger(id) && id > 0)
            : [];

        await window.saveProductAddonAssignments(
          firstProductId,
          addonIds
        );
      }

      modal?.classList.remove(
        "show"
      );

      structure.value =
        "single";

      rows.innerHTML = "";
      setMode();

      const name =
        document.getElementById(
          "productName"
        );

      const category =
        document.getElementById(
          "productCategory"
        );

      const description =
        document.getElementById(
          "productDescription"
        );

      if (name) name.value = "";
      if (category) category.value = "";
      if (description) description.value = "";

      if (
        typeof window.loadProducts ===
        "function"
      ) {
        await window.loadProducts();
      } else if (
        typeof loadProducts ===
        "function"
      ) {
        await loadProducts();
      }

      if (
        typeof window.loadDashboardSummary ===
        "function"
      ) {
        await window
          .loadDashboardSummary();
      } else if (
        typeof loadDashboardSummary ===
        "function"
      ) {
        await loadDashboardSummary();
      }

      alert(
        result.message ||
        "Product variants added successfully."
      );
    } finally {
      saveButton.disabled =
        false;

      saveButton.textContent =
        original;
    }
  }

  structure.addEventListener(
    "change",
    setMode
  );

  addRowButton.addEventListener(
    "click",
    () => {
      if (
        rows.querySelectorAll(
          ".product-variant-row"
        ).length >= 12
      ) {
        alert(
          "A product can have up to 12 variants."
        );
        return;
      }

      makeVariantRow();
    }
  );

  /*
   * Capture phase lets multiple-variant mode safely intercept the existing
   * single-product click handler without rewriting the large dashboard file.
   */
  saveButton.addEventListener(
    "click",
    async event => {
      if (
        structure.value !==
        "variants"
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        await saveVariants();
      } catch (error) {
        console.error(
          "Save product variants:",
          error
        );

        alert(
          error.message ||
          "Changes could not be saved product variants."
        );
      }
    },
    true
  );

  document
    .getElementById(
      "closeAddProductModal"
    )
    ?.addEventListener(
      "click",
      () => {
        structure.value =
          "single";

        rows.innerHTML = "";
        setMode();
      }
    );

  setMode();
})();
