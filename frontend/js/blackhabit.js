
function goToCart() {
  localStorage.setItem("lastPage", window.location.href);
  window.location.href = "cart.html";
}


const API = "/FoodConnect/api";


let databaseProductGroups = [];
let databaseAddons = [];

let activeProductGroup = null;
let activeSelectedVariant = null;

let activeComboDetails = null;
let activeComboMaxPackages = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const wrapper = document.querySelector(".account-wrapper");
  const btn = document.getElementById("accountBtn");
  const drop = document.getElementById("accountDropdown");
  const nameEl = document.getElementById("accountName");
  const logoutBtn = document.getElementById("logoutBtn");
  const goProfileBtn = document.getElementById("goProfile");

  let loggedIn = false;


  try {
    const res = await fetch(`${API}/me.php`, { credentials: "include" });
    const d = await res.json();

  loggedIn = Boolean(d.logged_in);

if (nameEl) {
  nameEl.textContent =
    loggedIn
      ? (
          d.user?.full_name ||
          d.user?.fullname ||
          d.user?.name ||
          "User"
        )
      : "Guest";
}

    if (logoutBtn) {
      logoutBtn.style.display = loggedIn ? "block" : "none";
    }
} catch (error) {
  console.error(
    "Authentication check failed:",
    error
  );

  loggedIn = false;

  if (nameEl) {
    nameEl.textContent = "Guest";
  }

  if (logoutBtn) {
    logoutBtn.style.display = "none";
  }
}

  if (wrapper && btn && drop) {
    btn.style.cursor = "pointer";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper.classList.toggle("open");
    });

    drop.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      wrapper.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        wrapper.classList.remove("open");
      }
    });
  }

  if (goProfileBtn) {
    goProfileBtn.addEventListener("click", () => {
      window.location.href = loggedIn ? "profile.html" : "login.html";
    });
  }

 if (logoutBtn) {
  logoutBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        `${API}/logout.php`;
    }
  );
}
  async function updateCartBadge() {
    const cartLink = document.querySelector(".cart-link");
    if (!cartLink) return;

    let badge = cartLink.querySelector(".cart-badge");

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartLink.style.position = "relative";
      cartLink.appendChild(badge);
    }

    try {
      const res = await fetch(`${API}/cart_get.php`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data.success && Number(data.total_items) > 0) {
        badge.textContent = data.total_items;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    } catch (err) {
      badge.style.display = "none";
    }
  }

  const mainFilterBtns = document.querySelectorAll(".main-filter-btn");
  const allSubFilterBtns = document.querySelectorAll(".sub-filter-btn");

  const shawarmaSubfilters = document.getElementById("shawarma-subfilters");
  const coffeeSubfilters = document.getElementById("coffee-subfilters");
  const shawarmaBurgerSubfilters = document.getElementById("shawarma-burger-subfilters");
  const friesSubfilters = document.getElementById("fries-subfilters");

  const subfilterGroups = [
    shawarmaSubfilters,
    coffeeSubfilters,
    shawarmaBurgerSubfilters,
    friesSubfilters
  ].filter(Boolean);

  let items = [];
  const searchInput = document.querySelector(".search-bar input");
  const searchBtn = document.getElementById("searchBtn");
  const searchResults = document.getElementById("searchResults");
  const menuGrid = document.getElementById("menuGrid");

  const productOptionsModal = document.createElement("div");

productOptionsModal.id = "productOptionsModal";
productOptionsModal.className = "product-options-modal";

productOptionsModal.innerHTML = `
  <div class="product-options-backdrop"></div>

  <div
    class="product-options-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="productOptionsTitle"
  >
    <button
      type="button"
      class="close-product-options"
      aria-label="Close"
    >
      ×
    </button>

    <div class="product-options-header">
      <div>
        <small id="productOptionsCategory">
          Product
        </small>

        <h3 id="productOptionsTitle">
          Choose Options
        </h3>
      </div>
    </div>

    <div class="product-options-body">

      <div
        class="product-option-section"
        id="variantOptionsSection"
      >
        <h4>Choose an option</h4>

        <div
          class="variant-options-list"
          id="variantOptionsList"
        ></div>
      </div>

<div
  class="product-option-section"
  id="comboComponentsSection"
  hidden
>
  <h4>Included in this bundle</h4>

  <div
    class="combo-components-list"
    id="comboComponentsList"
  ></div>
</div>

<div
  class="product-option-section"
  id="comboChoiceSection"
  hidden
>
  <div
    class="combo-choice-groups"
    id="comboChoiceGroups"
  ></div>
</div>

      <div
        class="product-option-section"
        id="addonOptionsSection"
        hidden
      >
        <h4>Add-ons</h4>

        <div
          class="addon-options-list"
          id="addonOptionsList"
        ></div>
      </div>



      <div class="product-option-section">
        <h4>Quantity</h4>

        <div class="product-quantity-control">
          <button
            type="button"
            id="decreaseProductQuantity"
          >
            −
          </button>

          <input
            type="number"
            id="productModalQuantity"
            value="1"
            min="1"
            max="99"
            readonly
          >

          <button
            type="button"
            id="increaseProductQuantity"
          >
            +
          </button>
        </div>
      </div>

      <div class="product-options-summary">
        <div>
          <span>Total</span>

          <strong id="productModalTotal">
            ₱0.00
          </strong>
        </div>

        <button
          type="button"
          id="confirmProductAddToCart"
        >
          Add to Cart
        </button>
      </div>

    </div>
  </div>
`;

document.body.appendChild(productOptionsModal);

const closeProductOptionsButton =
  productOptionsModal.querySelector(
    ".close-product-options"
  );

const productOptionsBackdrop =
  productOptionsModal.querySelector(
    ".product-options-backdrop"
  );

const productOptionsTitle =
  document.getElementById(
    "productOptionsTitle"
  );

const productOptionsCategory =
  document.getElementById(
    "productOptionsCategory"
  );

const variantOptionsSection =
  document.getElementById(
    "variantOptionsSection"
  );

const variantOptionsList =
  document.getElementById(
    "variantOptionsList"
  );

const addonOptionsSection =
  document.getElementById(
    "addonOptionsSection"
  );

const addonOptionsList =
  document.getElementById(
    "addonOptionsList"
  );

  const comboComponentsSection =
  document.getElementById(
    "comboComponentsSection"
  );

const comboComponentsList =
  document.getElementById(
    "comboComponentsList"
  );

const comboChoiceSection =
  document.getElementById(
    "comboChoiceSection"
  );

const comboChoiceGroups =
  document.getElementById(
    "comboChoiceGroups"
  );

const productModalQuantity =
  document.getElementById(
    "productModalQuantity"
  );

const decreaseProductQuantity =
  document.getElementById(
    "decreaseProductQuantity"
  );

const increaseProductQuantity =
  document.getElementById(
    "increaseProductQuantity"
  );

const productModalTotal =
  document.getElementById(
    "productModalTotal"
  );

const confirmProductAddToCart =
  document.getElementById(
    "confirmProductAddToCart"
  );

const DEFAULT_PRODUCT_IMAGE =
  "https://placehold.co/600x400/171717/ffffff?text=FoodConnect";

  function normalizeMenuCategory(value) {
  return String(value || "uncategorized")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProductName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeAddonCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ");
}

function escapeMenuText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mapDatabaseCategory(rawCategory) {
  const category = String(rawCategory || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const mappings = {
    // Shawarma
    "solo": {
      main: "shawarma",
      sub: "solo"
    },
    "buy 1 take 1": {
      main: "shawarma",
      sub: "b1t1"
    },
    "combo": {
      main: "shawarma",
      sub: "combo"
    },

    // Frappe
    "frappe": {
      main: "frappe",
      sub: ""
    },

    // Non-coffee
    "non coffee": {
      main: "non-coffee",
      sub: ""
    },
    "non coffee cream": {
      main: "non-coffee",
      sub: ""
    },

    // Coffee
    "coffee - hot and iced": {
      main: "coffee",
      sub: "hot-coffee iced-coffee"
    },
    "coffee - iced coffee": {
      main: "coffee",
      sub: "iced-coffee"
    },

    // Milktea
    "milktea classic": {
      main: "milktea",
      sub: ""
    },

    // Fruit Tea
    "fruit tea": {
      main: "fruit-tea",
      sub: ""
    },

    // Milktea Creamcheese
    "milktea creamcheese": {
      main: "milktea-creamcheese",
      sub: ""
    },

    // Shawarma Burger
    "shawarma burger - buy 1 take 1": {
      main: "shawarma-burger",
      sub: "b1t1"
    },
    "shawarma burger combo": {
      main: "shawarma-burger",
      sub: "combo"
    },

    // Fries
    "fries": {
      main: "fries",
      sub: "solo"
    },
    "fries combo": {
      main: "fries",
      sub: "combo"
    }
  };

  /*
   * These are supporting add-on categories.
   * They must not appear as regular product cards.
   */
  if (
    category === "milktea classic add-on" ||
    category === "milktea creamcheese add-on"
  ) {
    return {
      main: "",
      sub: "",
      isAddonCategory: true
    };
  }

  if (mappings[category]) {
    return {
      ...mappings[category],
      isAddonCategory: false
    };
  }

  /*
   * Safe fallback for future categories.
   * The product can still appear under All.
   */
  return {
    main: normalizeMenuCategory(rawCategory),
    sub: "",
    isAddonCategory: false
  };
}

function groupProducts(products) {
  const grouped = new Map();

  products.forEach((product) => {
    const productId = Number(
      product.product_id ||
      product.id ||
      0
    );

    const name = normalizeProductName(
      product.product_name ||
      product.name
    );

    const rawCategory = normalizeProductName(
      product.category
    );

    const categoryMapping =
      mapDatabaseCategory(rawCategory);

    /*
     * Add-on products are saved separately for the
     * future options modal and are not rendered as cards.
     */
    if (categoryMapping.isAddonCategory) {
      return;
    }

    const size = normalizeProductName(
      product.size
    );

    const price = Number(product.price || 0);
    const stock = Number(product.stock || 0);

    const status = String(product.status || "")
      .trim()
      .toLowerCase();

    if (!productId || !name) {
      return;
    }

    /*
     * Use the original database category in the grouping
     * key to avoid merging similarly named products from
     * different sections.
     */
    const groupKey =
      rawCategory.toLowerCase() +
      "::" +
      name.toLowerCase();

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        key: groupKey,
        name,
        rawCategory,

        /*
         * These values connect to your existing HTML
         * data-filter and data-subfilter buttons.
         */
        categorySlug: categoryMapping.main,
        subcategorySlug: categoryMapping.sub,

        variants: []
      });
    }

    grouped.get(groupKey).variants.push({
      productId,
      size,
      price,
      stock,
      status,

      available:
        stock > 0 &&
        ![
          "unavailable",
          "inactive",
          "disabled"
        ].includes(status)
    });
  });

  return Array.from(grouped.values()).map(
    (group) => {
      group.variants.sort((a, b) => {
        const preferredOrder = {
          regular: 1,
          small: 2,
          medium: 3,
          large: 4,
          cream: 5,
          hot: 6,
          iced: 7
        };

        const aSize = a.size.toLowerCase();
        const bSize = b.size.toLowerCase();

        const aOrder =
          preferredOrder[aSize] || 99;

        const bOrder =
          preferredOrder[bSize] || 99;

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        return a.price - b.price;
      });

      return group;
    }
  );
}

function getProductPriceLabel(group) {
  const availableVariants = group.variants.filter(
    (variant) => variant.available
  );

  const variants =
    availableVariants.length > 0
      ? availableVariants
      : group.variants;

  const prices = variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) {
    return "Price unavailable";
  }

  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);

  if (minimum === maximum) {
    return `₱${minimum.toFixed(2)}`;
  }

  return `₱${minimum.toFixed(2)} – ₱${maximum.toFixed(2)}`;
}

function getVariantSummary(group) {
  const labels = group.variants
    .map((variant) => variant.size)
    .filter(Boolean);

  const uniqueLabels = [...new Set(labels)];

  if (uniqueLabels.length === 0) {
    return "";
  }

  return uniqueLabels.join(" • ");
}

function buildProductCard(group) {
  const availableVariants = group.variants.filter(
    (variant) => variant.available
  );

  const isBundle =
  isPotentialBundleGroup(group);

const isUnavailable =
  !isBundle &&
  availableVariants.length === 0;
  const variantSummary = getVariantSummary(group);

  return `
    <article
      class="menu-item dynamic-menu-item"
      data-product-group="${escapeMenuText(group.key)}"
      data-category="${escapeMenuText(group.categorySlug)}"
      data-subcategory="${escapeMenuText(group.subcategorySlug)}"
    >
      <img
        src="${DEFAULT_PRODUCT_IMAGE}"
        alt="${escapeMenuText(group.name)}"
        loading="lazy"
      >

      <div class="menu-item-info">
        <div class="menu-item-details">
          <h3>${escapeMenuText(group.name)}</h3>

          <p class="price">
            ${escapeMenuText(getProductPriceLabel(group))}
          </p>

          ${
            variantSummary
              ? `
                <p class="product-variant-summary">
                  ${escapeMenuText(variantSummary)}
                </p>
              `
              : ""
          }

          ${
            isUnavailable
              ? `
                <p class="product-stock-message">
                  Currently unavailable
                </p>
              `
              : ""
          }
        </div>
<button
  type="button"
  class="add-to-cart dynamic-add-to-cart"
  data-product-group="${escapeMenuText(group.key)}"
  data-original-text="${
    group.variants.length > 1
      ? "Choose Options"
      : "Add to Cart"
  }"
  ${isUnavailable ? "disabled" : ""}
>
  ${
    group.variants.length > 1
      ? "Choose Options"
      : "Add to Cart"
  }
</button>
        
      </div>
    </article>
  `;
}

function getAddonsForProductGroup(group) {
  if (!group) {
    return [];
  }

  const categorySlug = String(
    group.categorySlug || ""
  )
    .trim()
    .toLowerCase();

  if (categorySlug === "milktea") {
    return databaseAddons.filter(
      (addon) =>
        normalizeAddonCategory(
          addon.category
        ) === "milktea classic add-on"
    );
  }

  if (
    categorySlug ===
    "milktea-creamcheese"
  ) {
    return databaseAddons.filter(
      (addon) =>
        normalizeAddonCategory(
          addon.category
        ) ===
        "milktea creamcheese add-on"
    );
  }

  return [];
}

function isPotentialBundleGroup(group) {
  if (!group) {
    return false;
  }

  const category = String(
    group.rawCategory || ""
  )
    .trim()
    .toLowerCase();

  const subcategory = String(
    group.subcategorySlug || ""
  )
    .trim()
    .toLowerCase();

  return (
    category.includes("combo") ||
    category.includes("buy 1 take 1") ||
    subcategory.includes("combo") ||
    subcategory.includes("b1t1")
  );
}

async function loadComboDetails(productId) {
  const safeProductId = Number(productId || 0);

  if (safeProductId <= 0) {
    throw new Error("Invalid product selection.");
  }

  const response = await fetch(
    `${API}/get_combo_details.php?product_id=${encodeURIComponent(
      safeProductId
    )}`,
    {
      credentials: "include",
      cache: "no-store"
    }
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Invalid combo-details response:",
      responseText
    );

    throw new Error(
      "The combo server returned an invalid response."
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      "Unable to load the combo information."
    );
  }

  return data;
}

function renderComboDetails(combo) {
  activeComboDetails = combo || null;

  activeComboMaxPackages = combo
    ? Math.max(
        0,
        Number(combo.max_packages || 0)
      )
    : 0;

  if (!combo) {
    comboComponentsSection.hidden = true;
    comboChoiceSection.hidden = true;

    comboComponentsList.innerHTML = "";
    comboChoiceGroups.innerHTML = "";

    return;
  }

  const components = Array.isArray(
    combo.components
  )
    ? combo.components
    : [];

  if (components.length > 0) {
    comboComponentsSection.hidden = false;

    comboComponentsList.innerHTML = components
      .map((component) => {
        const requiredQuantity = Math.max(
          1,
          Number(
            component.required_quantity || 1
          )
        );

        const sizeText = String(
          component.size || ""
        ).trim();

        return `
          <div class="combo-component-row">
            <span>
              <strong>
                ${escapeMenuText(
                  component.product_name ||
                  "Included product"
                )}
              </strong>

              ${
                sizeText
                  ? `
                      <small>
                        ${escapeMenuText(sizeText)}
                      </small>
                    `
                  : ""
              }
            </span>

            <b>×${requiredQuantity}</b>
          </div>
        `;
      })
      .join("");
  } else {
    comboComponentsSection.hidden = true;
    comboComponentsList.innerHTML = "";
  }

  const choiceGroups = Array.isArray(
    combo.choice_groups
  )
    ? combo.choice_groups
    : [];

  if (choiceGroups.length === 0) {
    comboChoiceSection.hidden = true;
    comboChoiceGroups.innerHTML = "";
    return;
  }

  comboChoiceSection.hidden = false;

  comboChoiceGroups.innerHTML = choiceGroups
    .map((group) => {
      const groupId = Number(
        group.choice_group_id || 0
      );

      const minimum = Math.max(
        0,
        Number(group.min_select || 0)
      );

      const maximum = Math.max(
        minimum,
        Number(group.max_select || 1)
      );

      const inputType =
        maximum === 1
          ? "radio"
          : "checkbox";

      const inputName =
        `comboChoiceGroup_${groupId}`;

      const options = Array.isArray(
        group.options
      )
        ? group.options
        : [];

      const optionsHtml = options
        .map((option) => {
          const available =
            option.available === true;

          const priceAdjustment = Number(
            option.price_adjustment || 0
          );

          const sizeText = String(
            option.size || ""
          ).trim();

          const detailParts = [];

          if (sizeText) {
            detailParts.push(sizeText);
          }

          if (priceAdjustment > 0) {
            detailParts.push(
              `+₱${priceAdjustment.toFixed(2)}`
            );
          }

          if (!available) {
            detailParts.push("Unavailable");
          }

          return `
            <label
              class="combo-choice-option ${
                available
                  ? ""
                  : "is-unavailable"
              }"
            >
              <input
                type="${inputType}"
                name="${escapeMenuText(inputName)}"
                value="${Number(
                  option.choice_option_id || 0
                )}"
                data-group-id="${groupId}"
                data-price="${priceAdjustment}"
                ${available ? "" : "disabled"}
              >

              <span>
                <strong>
                  ${escapeMenuText(
                    option.product_name ||
                    "Option"
                  )}
                </strong>

                <small>
                  ${escapeMenuText(
                    detailParts.join(" • ")
                  )}
                </small>
              </span>
            </label>
          `;
        })
        .join("");

      return `
        <div
          class="combo-choice-group"
          data-choice-group-id="${groupId}"
          data-min-select="${minimum}"
          data-max-select="${maximum}"
        >
          <div class="combo-choice-heading">
            <h4>
              ${escapeMenuText(
                group.group_name ||
                "Choose an option"
              )}
            </h4>

            ${
              group.is_required
                ? `<span>Required</span>`
                : `<span>Optional</span>`
            }
          </div>

          <div class="combo-choice-options">
            ${optionsHtml}
          </div>
        </div>
      `;
    })
    .join("");
}

function getSelectedComboChoiceIds() {
  if (!comboChoiceGroups) {
    return [];
  }

  return Array.from(
    comboChoiceGroups.querySelectorAll(
      'input[type="radio"]:checked, input[type="checkbox"]:checked'
    )
  )
    .map((input) => Number(input.value))
    .filter((id) => id > 0);
}

function validateComboChoiceSelection() {
  if (!activeComboDetails) {
    return true;
  }

  const groupElements =
    comboChoiceGroups.querySelectorAll(
      ".combo-choice-group"
    );

  for (const groupElement of groupElements) {
    const minimum = Math.max(
      0,
      Number(
        groupElement.dataset.minSelect || 0
      )
    );

    const maximum = Math.max(
      minimum,
      Number(
        groupElement.dataset.maxSelect || 1
      )
    );

    const checkedCount =
      groupElement.querySelectorAll(
        'input[type="radio"]:checked, input[type="checkbox"]:checked'
      ).length;

    const title =
      groupElement.querySelector("h4")
        ?.textContent.trim() ||
      "Combo selection";

    if (checkedCount < minimum) {
      alert(`${title} is required.`);
      return false;
    }

    if (checkedCount > maximum) {
      alert(
        `${title} allows a maximum of ${maximum} selection(s).`
      );

      return false;
    }
  }

  return true;
}

function closeProductOptionsModal() {
  productOptionsModal.classList.remove("show");

  document.body.classList.remove(
    "product-modal-open"
  );

  activeProductGroup = null;
  activeSelectedVariant = null;

  activeComboDetails = null;
activeComboMaxPackages = 0;

if (comboComponentsList) {
  comboComponentsList.innerHTML = "";
}

if (comboChoiceGroups) {
  comboChoiceGroups.innerHTML = "";
}

if (comboComponentsSection) {
  comboComponentsSection.hidden = true;
}

if (comboChoiceSection) {
  comboChoiceSection.hidden = true;
}

  if (variantOptionsList) {
    variantOptionsList.innerHTML = "";
  }

  if (addonOptionsList) {
    addonOptionsList.innerHTML = "";
  }

  if (productModalQuantity) {
    productModalQuantity.value = "1";
  }
}

function updateProductModalTotal() {
  if (
    !activeSelectedVariant ||
    !productModalTotal
  ) {
    return;
  }

  const quantity = Math.max(
    1,
    Number(productModalQuantity.value || 1)
  );

  const selectedAddonCheckboxes =
    addonOptionsList.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

  const selectedComboInputs =
    comboChoiceGroups.querySelectorAll(
      'input[type="radio"]:checked, input[type="checkbox"]:checked'
    );

  let addonTotal = 0;
  let comboChoiceAdjustment = 0;

  selectedAddonCheckboxes.forEach(
    (checkbox) => {
      addonTotal += Number(
        checkbox.dataset.price || 0
      );
    }
  );

  selectedComboInputs.forEach((input) => {
    comboChoiceAdjustment += Number(
      input.dataset.price || 0
    );
  });

  const unitTotal =
    Number(activeSelectedVariant.price || 0) +
    addonTotal +
    comboChoiceAdjustment;

  const finalTotal =
    unitTotal * quantity;

  productModalTotal.textContent =
    `₱${finalTotal.toFixed(2)}`;
}

function selectProductVariant(productId) {
  if (!activeProductGroup) {
    return;
  }

  activeSelectedVariant =
    activeProductGroup.variants.find(
      (variant) =>
        Number(variant.productId) ===
        Number(productId)
    ) || null;

  if (!activeSelectedVariant) {
    return;
  }

  const currentQuantity = Math.max(
    1,
    Number(productModalQuantity.value || 1)
  );

  const maximumStock = Math.max(
    1,
    Number(activeSelectedVariant.stock || 1)
  );

  productModalQuantity.value = String(
    Math.min(currentQuantity, maximumStock)
  );

  updateProductModalTotal();
}

async function openProductOptionsModal(groupKey) {
  const group =
    databaseProductGroups.find(
      (item) => item.key === groupKey
    );

  if (!group) {
    alert("Product information was not found.");
    return;
  }

  activeProductGroup = group;
  activeComboDetails = null;
  activeComboMaxPackages = 0;

  const potentialBundle =
    isPotentialBundleGroup(group);

  let selectableVariants;

  if (potentialBundle) {
    /*
     * Bundle rows may show stock 0 because their stock
     * is derived from their components.
     */
    selectableVariants = group.variants;
  } else {
    selectableVariants =
      group.variants.filter(
        (variant) => variant.available
      );
  }

  if (selectableVariants.length === 0) {
    alert("This product is currently unavailable.");
    return;
  }

  activeSelectedVariant =
    selectableVariants[0];

  productOptionsTitle.textContent =
    group.name;

  productOptionsCategory.textContent =
    group.rawCategory || "Product";

  variantOptionsList.innerHTML =
    selectableVariants
      .map((variant, index) => {
        const optionLabel =
          variant.size ||
          group.name;

        return `
          <label class="variant-option-card">
            <input
              type="radio"
              name="productVariantOption"
              value="${variant.productId}"
              ${index === 0 ? "checked" : ""}
            >

            <span class="variant-option-content">
              <strong>
                ${escapeMenuText(optionLabel)}
              </strong>

              <small>
                ₱${Number(
                  variant.price || 0
                ).toFixed(2)}
              </small>
            </span>
          </label>
        `;
      })
      .join("");

  variantOptionsSection.hidden =
    selectableVariants.length === 1 &&
    !selectableVariants[0].size;

  comboComponentsSection.hidden = true;
  comboChoiceSection.hidden = true;

  comboComponentsList.innerHTML = "";
  comboChoiceGroups.innerHTML = "";

  if (potentialBundle) {
    confirmProductAddToCart.disabled = true;
    confirmProductAddToCart.textContent =
      "Loading combo...";

    try {
      const comboData =
        await loadComboDetails(
          activeSelectedVariant.productId
        );

      if (!comboData.is_combo || !comboData.combo) {
        throw new Error(
          "This bundle has not been configured."
        );
      }

      if (!comboData.combo.available) {
        throw new Error(
          "This combo cannot currently be prepared because one or more required items are unavailable."
        );
      }

      renderComboDetails(comboData.combo);
    } catch (error) {
      console.error(
        "Load combo modal:",
        error
      );

      alert(
        error.message ||
        "Unable to load this combo."
      );

      activeProductGroup = null;
      activeSelectedVariant = null;
      activeComboDetails = null;

      return;
    } finally {
      confirmProductAddToCart.disabled = false;
      confirmProductAddToCart.textContent =
        "Add to Cart";
    }
  } else {
    renderComboDetails(null);
  }

  const addons =
    getAddonsForProductGroup(group);

  if (addons.length > 0) {
    addonOptionsSection.hidden = false;

    addonOptionsList.innerHTML = addons
      .map((addon) => {
        return `
          <label class="addon-option-card">
            <input
              type="checkbox"
              value="${addon.productId}"
              data-price="${addon.price}"
            >

            <span>
              <strong>
                ${escapeMenuText(addon.name)}
              </strong>

              <small>
                +₱${Number(
                  addon.price || 0
                ).toFixed(2)}
              </small>
            </span>
          </label>
        `;
      })
      .join("");
  } else {
    addonOptionsSection.hidden = true;
    addonOptionsList.innerHTML = "";
  }

  productModalQuantity.value = "1";

  updateProductModalTotal();

  productOptionsModal.classList.add("show");

  document.body.classList.add(
    "product-modal-open"
  );
}

function renderDatabaseProducts(productGroups) {
  if (!menuGrid) {
    console.error("Missing #menuGrid element.");
    return;
  }

  if (productGroups.length === 0) {
    menuGrid.innerHTML = `
      <div class="orders-empty">
        No available products were found.
      </div>
    `;

    items = [];
    return;
  }

  menuGrid.innerHTML = productGroups
    .map((group) => buildProductCard(group))
    .join("");

  /*
   * Refresh the list after dynamic cards have been inserted.
   */
  items = Array.from(
    menuGrid.querySelectorAll(".menu-item")
  );
}


async function loadDatabaseProducts() {
  if (!menuGrid) {
    return [];
  }

  menuGrid.innerHTML = `
    <div class="orders-loading">
      Loading menu...
    </div>
  `;

  try {
    const response = await fetch(
      `${API}/get_products.php`,
      {
        credentials: "include",
        cache: "no-store"
      }
    );

    const rawText = await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      throw new Error(
        "The products API returned invalid JSON."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load products."
      );
    }

    /*
     * Supports both:
     * [ ...products ]
     *
     * and:
     * { success: true, products: [...] }
     */
    const products = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : [];

        

const addonMap = new Map();

products.forEach((product) => {
  const category = normalizeAddonCategory(
    product.category
  );

  const isClassicAddon =
    category === "milktea classic add-on";

  const isCreamcheeseAddon =
    category === "milktea creamcheese add-on";

  if (!isClassicAddon && !isCreamcheeseAddon) {
    return;
  }

  const productId = Number(
    product.product_id ||
    product.id ||
    0
  );

  const name = normalizeProductName(
    product.product_name ||
    product.name
  );

  const price = Number(
    product.price || 0
  );

  const stock = Number(
    product.stock || 0
  );

  const status = String(
    product.status || ""
  )
    .trim()
    .toLowerCase();

  if (
    productId <= 0 ||
    name === "" ||
    stock <= 0 ||
    status !== "available"
  ) {
    return;
  }

  const addonKey =
    category +
    "::" +
    name.toLowerCase();

  const existing =
    addonMap.get(addonKey);

  /*
   * Your database contains old and new duplicate
   * add-on rows. Keep only the newer available ID.
   */
  if (
    !existing ||
    productId > existing.productId
  ) {
    addonMap.set(addonKey, {
      productId,
      name,
      category,
      price,
      stock,
      status
    });
  }
});

databaseAddons = Array.from(
  addonMap.values()
);

console.log(
  "Loaded FoodConnect add-ons:",
  databaseAddons
);

    databaseProductGroups =
  groupProducts(products);

renderDatabaseProducts(
  databaseProductGroups
);

return databaseProductGroups;

  } catch (error) {
    console.error("Load products error:", error);

    menuGrid.innerHTML = `
      <div class="orders-empty">
        ${escapeMenuText(
          error.message || "Failed to load menu."
        )}
      </div>
    `;

    items = [];

    return [];
  }
}

  function getActiveMainFilter() {
    const activeMainBtn = document.querySelector(".main-filter-btn.active");
    return activeMainBtn ? activeMainBtn.dataset.filter : "all";
  }

  function getSubfilterGroupByMainFilter(mainFilter) {
    if (mainFilter === "shawarma") return shawarmaSubfilters;
    if (mainFilter === "coffee") return coffeeSubfilters;
    if (mainFilter === "shawarma-burger") return shawarmaBurgerSubfilters;
    if (mainFilter === "fries") return friesSubfilters;
    return null;
  }

  function getActiveSubFilter() {
    const activeMain = getActiveMainFilter();
    const activeGroup = getSubfilterGroupByMainFilter(activeMain);

    if (!activeGroup) return "all";

    const activeBtn = activeGroup.querySelector(".sub-filter-btn.active");
    return activeBtn ? activeBtn.dataset.subfilter : "all";
  }

  function resetSubfilters(group) {
    if (!group) return;

    group.querySelectorAll(".sub-filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const allBtn = group.querySelector('[data-subfilter="all"]');
    if (allBtn) allBtn.classList.add("active");
  }

  function showCorrectSubfilters() {
    subfilterGroups.forEach((group) => group.classList.remove("show"));

    const activeMain = getActiveMainFilter();
    const activeGroup = getSubfilterGroupByMainFilter(activeMain);

    if (activeGroup) {
      activeGroup.classList.add("show");
    }
  }

 function getItemPriceText(item) {
  const priceElement =
    item.querySelector(".price");

  return String(
    priceElement?.textContent || ""
  ).toLowerCase();
}

  function matchesCurrentFilters(item) {
    const activeMain = getActiveMainFilter();
    const activeSub = getActiveSubFilter();
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const itemCategory = (item.dataset.category || "").toLowerCase();
    const itemSub = (item.dataset.subcategory || "").toLowerCase();
    const itemName = item.querySelector("h3")?.textContent.toLowerCase() || "";
    const itemPriceText = getItemPriceText(item);

    let matchesMain = activeMain === "all" ? true : itemCategory === activeMain;
    let matchesSub = true;
    let matchesSearch = true;

    if (
      activeMain === "shawarma" ||
      activeMain === "coffee" ||
      activeMain === "shawarma-burger" ||
      activeMain === "fries"
    ) {
      matchesSub = activeSub === "all" ? true : itemSub.includes(activeSub);
    }

    if (searchTerm !== "") {
      matchesSearch =
        itemName.includes(searchTerm) ||
        itemPriceText.includes(searchTerm) ||
        itemCategory.includes(searchTerm) ||
        itemSub.includes(searchTerm);
    }

    return matchesMain && matchesSub && matchesSearch;
  }

  function applyFilters() {
    items.forEach((item) => {
      const show = matchesCurrentFilters(item);
      item.style.display = show ? "" : "none";
      item.style.opacity = show ? "1" : "0";
    });
  }

  function highlightItem(item) {
    item.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    item.style.outline = "3px solid #cc9900";
    item.style.transform = "scale(1.03)";

    setTimeout(() => {
      item.style.outline = "";
      item.style.transform = "";
    }, 1500);
  }

  function goToFirstMatch() {
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) return;

    applyFilters();

    let foundItem = null;

    items.forEach((item) => {
      if (!foundItem && matchesCurrentFilters(item)) {
        foundItem = item;
      }
    });

    if (foundItem) {
      highlightItem(foundItem);
    }
  }

  function renderSearchSuggestions() {
    if (!searchInput || !searchResults) return;

    const term = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (!term) {
      searchResults.classList.remove("show");
      return;
    }

    let found = false;

    items.forEach((item) => {
      const itemName = item.querySelector("h3")?.textContent || "";
      const rawImage =
        item.querySelector(":scope > img")?.getAttribute("src") ||
        item.querySelector("img")?.getAttribute("src") ||
        "";

      const itemImage =
        rawImage && rawImage.trim() !== ""
          ? rawImage
          : "https://via.placeholder.com/80x80?text=Food";

      if (matchesCurrentFilters(item) && itemName.toLowerCase().includes(term)) {
        found = true;

        const div = document.createElement("div");
        div.className = "search-item";
        div.innerHTML = `
          <img src="${itemImage}" alt="${itemName}">
          <span>${itemName}</span>
        `;

        div.addEventListener("click", () => {
          applyFilters();
          highlightItem(item);
          searchResults.classList.remove("show");
        });

        searchResults.appendChild(div);
      }
    });

    if (found) {
      searchResults.classList.add("show");
    } else {
      searchResults.classList.remove("show");
    }
  }

  mainFilterBtns.forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        mainFilterBtns.forEach(
          (filterButton) => {
            filterButton.classList.remove(
              "active"
            );
          }
        );

        button.classList.add(
          "active"
        );

        const selectedFilter =
          button.dataset.filter || "all";

        subfilterGroups.forEach(
          (group) => {
            let groupMainFilter = "";

            if (
              group ===
              shawarmaSubfilters
            ) {
              groupMainFilter =
                "shawarma";
            } else if (
              group ===
              coffeeSubfilters
            ) {
              groupMainFilter =
                "coffee";
            } else if (
              group ===
              shawarmaBurgerSubfilters
            ) {
              groupMainFilter =
                "shawarma-burger";
            } else if (
              group ===
              friesSubfilters
            ) {
              groupMainFilter =
                "fries";
            }

            if (
              selectedFilter !==
              groupMainFilter
            ) {
              resetSubfilters(
                group
              );
            }
          }
        );

        showCorrectSubfilters();
        applyFilters();
        renderSearchSuggestions();
      }
    );
  }
);

allSubFilterBtns.forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        const parentGroup =
          button.closest(
            ".menu-subfilters"
          );

        if (
          !parentGroup ||
          !parentGroup.classList
            .contains("show")
        ) {
          return;
        }

        parentGroup
          .querySelectorAll(
            ".sub-filter-btn"
          )
          .forEach(
            (filterButton) => {
              filterButton.classList
                .remove("active");
            }
          );

        button.classList.add(
          "active"
        );

        applyFilters();
        renderSearchSuggestions();
      }
    );
  }
);

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyFilters();
      renderSearchSuggestions();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const firstSuggestion = searchResults?.querySelector(".search-item");
        if (firstSuggestion) {
          firstSuggestion.click();
        } else {
          goToFirstMatch();
        }
      }
    });
  }




  if (searchBtn) {
    searchBtn.style.cursor = "pointer";

    searchBtn.addEventListener("click", () => {
      const firstSuggestion = searchResults?.querySelector(".search-item");
      if (firstSuggestion) {
        firstSuggestion.click();
      } else {
        goToFirstMatch();
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-bar") && searchResults) {
      searchResults.classList.remove("show");
    }
  });

  async function addDatabaseProductToCart({
  productId,
  quantity,
  addonIds,
  comboChoiceIds = [],
  button = null
})
   {
  const safeProductId =
    Number(productId || 0);

  const safeQuantity =
    Math.max(1, Number(quantity || 1));

  const safeAddonIds =
    Array.isArray(addonIds)
      ? addonIds
          .map(Number)
          .filter((id) => id > 0)
      : [];

      const safeComboChoiceIds =
  Array.isArray(comboChoiceIds)
    ? comboChoiceIds
        .map(Number)
        .filter((id) => id > 0)
    : [];

  if (safeProductId <= 0) {
    alert("Invalid product selection.");
    return false;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Adding...";
    }

    const response = await fetch(
      `${API}/cart_add.php`,
      {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
  product_id: safeProductId,
  quantity: safeQuantity,
  addon_ids: safeAddonIds,
  combo_choice_ids: safeComboChoiceIds
})
      }
    );

    const rawText =
      await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (error) {
      throw new Error(
        "The cart API returned invalid JSON."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to add product to cart."
      );
    }

    await updateCartBadge();

    return true;

  } catch (error) {
    console.error(
      "Add database product to cart:",
      error
    );

    alert(
      error.message ||
      "Something went wrong while adding to cart."
    );

    return false;

  } finally {
    if (button) {
      button.disabled = false;

      button.textContent =
        button.dataset.originalText ||
        "Add to Cart";
    }
  }
}

menuGrid?.addEventListener(
  "click",
  async (event) => {
    const button = event.target.closest(
      ".dynamic-add-to-cart"
    );

    if (!button || button.disabled) {
      return;
    }

    if (!loggedIn) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
    }

    const groupKey =
      button.dataset.productGroup || "";

    const group =
      databaseProductGroups.find(
        (item) => item.key === groupKey
      );

    if (!group) {
      alert("Product information was not found.");
      return;
    }

    const isBundle =
  isPotentialBundleGroup(group);

const availableVariants = isBundle
  ? group.variants
  : group.variants.filter(
      (variant) => variant.available
    );

    const addons =
      getAddonsForProductGroup(group);

    /*
     * Products with one option and no add-ons can
     * be added immediately.
     */
    if (
  !isBundle &&
  availableVariants.length === 1 &&
  addons.length === 0 &&
  !availableVariants[0].size
) {
      await addDatabaseProductToCart({
        productId:
          availableVariants[0].productId,

        quantity: 1,
        addonIds: [],
        button
      });

      return;
    }

    await openProductOptionsModal(groupKey);
  }
);

closeProductOptionsButton?.addEventListener(
  "click",
  closeProductOptionsModal
);

productOptionsBackdrop?.addEventListener(
  "click",
  closeProductOptionsModal
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      productOptionsModal.classList.contains(
        "show"
      )
    ) {
      closeProductOptionsModal();
    }
  }
);

variantOptionsList?.addEventListener(
  "change",
  (event) => {
    const input = event.target.closest(
      'input[name="productVariantOption"]'
    );

    if (!input) {
      return;
    }

    selectProductVariant(input.value);
  }
);

addonOptionsList?.addEventListener(
  "change",
  updateProductModalTotal

);

comboChoiceGroups?.addEventListener(
  "change",
  updateProductModalTotal
);

decreaseProductQuantity?.addEventListener(
  "click",
  () => {
    const current = Math.max(
      1,
      Number(productModalQuantity.value || 1)
    );

    productModalQuantity.value =
      String(Math.max(1, current - 1));

    updateProductModalTotal();
  }
);

increaseProductQuantity?.addEventListener(
  "click",
  () => {
    const current = Math.max(
      1,
      Number(productModalQuantity.value || 1)
    );

   const maximumStock = Math.max(
  1,
  activeComboDetails
    ? Number(activeComboMaxPackages || 1)
    : Number(
        activeSelectedVariant?.stock || 1
      )
);

    productModalQuantity.value =
      String(
        Math.min(
          maximumStock,
          current + 1
        )
      );

    updateProductModalTotal();
  }
);

confirmProductAddToCart?.addEventListener(
  "click",
  async () => {
    if (!activeSelectedVariant) {
      alert("Please select a product option.");
      return;
    }

    if (!validateComboChoiceSelection()) {
      return;
    }

    const quantity = Math.max(
      1,
      Number(
        productModalQuantity.value || 1
      )
    );

    const maximumQuantity =
      activeComboDetails
        ? activeComboMaxPackages
        : Number(
            activeSelectedVariant.stock || 0
          );

    if (
      maximumQuantity <= 0 ||
      quantity > maximumQuantity
    ) {
      const quantityLabel =
        activeComboDetails
          ? "package(s)"
          : "item(s)";

      alert(
        `Only ${maximumQuantity} ${quantityLabel} are currently available.`
      );

      return;
    }

    const addonIds = Array.from(
      addonOptionsList.querySelectorAll(
        'input[type="checkbox"]:checked'
      )
    )
      .map((checkbox) =>
        Number(checkbox.value)
      )
      .filter((id) => id > 0);

    const comboChoiceIds =
      getSelectedComboChoiceIds();

    confirmProductAddToCart.disabled = true;
    confirmProductAddToCart.textContent =
      "Adding...";

    const success =
      await addDatabaseProductToCart({
        productId:
          activeSelectedVariant.productId,

        quantity,
        addonIds,
        comboChoiceIds
      });

    confirmProductAddToCart.disabled = false;
    confirmProductAddToCart.textContent =
      "Add to Cart";

    if (success) {
      closeProductOptionsModal();
    }
  }
);

await loadDatabaseProducts();

showCorrectSubfilters();
applyFilters();
await updateCartBadge();





});

  