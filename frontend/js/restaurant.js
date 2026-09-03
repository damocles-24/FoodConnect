

function formatUserName(user) {
  return [
    user?.first_name,
    user?.middle_name,
    user?.last_name
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    || String(user?.display_name || user?.name || "").trim();
}
function goToCart() {
  if (
    typeof IS_PREVIEW_MODE !==
      "undefined" &&
    IS_PREVIEW_MODE
  ) {
    return;
  }

  localStorage.setItem(
    "lastPage",
    window.location.href
  );

  window.location.href =
    "/frontend/html/cart.html";
}


const API = "/api";

let currentRestaurantStatus =
  "Closed";

let restaurantAcceptingOrders =
  false;
const pageParameters =
  new URLSearchParams(
    window.location.search
  );

const previewParameter =
  String(
    pageParameters.get(
      "preview"
    ) || ""
  )
    .trim()
    .toLowerCase();

const previewApplicationId =
  Number.parseInt(
    pageParameters.get(
      "application_id"
    ) || "",
    10
  );

const IS_OWNER_PREVIEW =
  previewParameter === "owner";

const IS_ADMIN_PREVIEW =
  previewParameter === "admin";

const IS_PREVIEW_MODE =
  IS_OWNER_PREVIEW ||
  IS_ADMIN_PREVIEW;

const restaurantIdParameter =
  pageParameters.get(
    "restaurant_id"
  );

const requestedRestaurantId =
  Number.parseInt(
    restaurantIdParameter || "",
    10
  );

/*
 * Every public restaurant page must receive a valid
 * restaurant_id through the URL.
 *
 * Example:
 * restaurant.html?restaurant_id=2
 */
const CURRENT_RESTAURANT_ID =
  Number.isInteger(
    requestedRestaurantId
  ) &&
  requestedRestaurantId > 0
    ? requestedRestaurantId
    : 0;

    let resolvedRestaurantId =
  CURRENT_RESTAURANT_ID;


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

  /* =========================
   ACCOUNT DROPDOWN
========================= */

accountBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  accountDropdown?.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (
    accountDropdown &&
    !accountDropdown.contains(e.target) &&
    !accountBtn.contains(e.target)
  ) {
    accountDropdown.classList.remove("show");
  }
});

  let loggedIn = false;

  /* =========================================================
     CLOUD PERFORMANCE

     Session/account validation is independent from the public
     restaurant/menu request. Start it immediately, but do not
     block the restaurant storefront while Aiven responds.
  ========================================================= */

  const accountSessionTask = (async () => {
    try {
      const authResponse =
          await fetch(
              `${API}/me.php`,
              {
                  credentials: "include",
                  cache: "no-store"
              }
          );

      const authData =
          await authResponse.json();

      const authenticatedUser =
      authData.user ||
      authData.data?.user ||
      authData;

  const authenticatedRole =
      String(
          authenticatedUser.role ||
          authData.role ||
          ""
      )
          .trim()
          .toLowerCase();

  loggedIn =
      authResponse.ok &&
      authData.logged_in === true &&
      authenticatedRole === "customer" &&
      Number(
          authenticatedUser.user_id ||
          0
      ) > 0;

      if (loggedIn) {
          if (nameEl) {
              nameEl.textContent =
                  formatUserName(authenticatedUser) ||
                  "Customer";
          }

          if (goProfileBtn) {
              goProfileBtn.style.display = "block";
          }

          if (logoutBtn) {
              logoutBtn.style.display = "block";
          }

          wrapper?.classList.add(
              "logged-in"
          );
      } else {
          if (nameEl) {
              nameEl.textContent = "Guest";
          }

          if (goProfileBtn) {
              goProfileBtn.style.display = "block";
          }

          if (logoutBtn) {
              logoutBtn.style.display = "none";
          }

          wrapper?.classList.remove(
              "logged-in"
          );
      }
  } catch (error) {
      console.error(
          "Customer session check error:",
          error
      );

      loggedIn = false;
  }

  })();

    /* =========================
     RESTAURANT IDENTITY
  ========================= */

  const restaurantPreviewBanner =
  document.getElementById(
    "restaurantPreviewBanner"
  );

const restaurantPreviewTitle =
  document.getElementById(
    "restaurantPreviewTitle"
  );

const closeRestaurantPreview =
  document.getElementById(
    "closeRestaurantPreview"
  );

const headerRestaurantLogo =
  document.getElementById(
    "headerRestaurantLogo"
  );

const footerRestaurantLogo =
  document.getElementById(
    "footerRestaurantLogo"
  );

const restaurantInformationSection =
  document.getElementById(
    "restaurantInformationSection"
  );

const restaurantAboutName =
  document.getElementById(
    "restaurantAboutName"
  );

const restaurantDescription =
  document.getElementById(
    "restaurantDescription"
  );

const restaurantServiceTags =
  document.getElementById(
    "restaurantServiceTags"
  );


const restaurantPreviewDeliveryFee =
  document.getElementById(
    "restaurantPreviewDeliveryFee"
  );

  const restaurantName =
    document.getElementById(
      "restaurantName"
    );

  const heroRestaurantName =
    document.getElementById(
      "heroRestaurantName"
    );

  const heroRestaurantDetails =
    document.getElementById(
      "heroRestaurantDetails"
    );

  const footerRestaurantName =
    document.getElementById(
      "footerRestaurantName"
    );

  const restaurantOpeningHours =
    document.getElementById(
      "restaurantOpeningHours"
    );

  const restaurantBusinessStatus =
    document.getElementById(
      "restaurantBusinessStatus"
    );

  const restaurantAddress =
    document.getElementById(
      "restaurantAddress"
    );

  const restaurantContactNumber =
    document.getElementById(
      "restaurantContactNumber"
    );

  const restaurantDeliveryFee =
    document.getElementById(
      "restaurantDeliveryFee"
    );

  const restaurantCopyright =
    document.getElementById(
      "restaurantCopyright"
    );

  function formatRestaurantDeliveryFee(
    value
  ) {
    const amount = Number(value || 0);

    if (amount <= 0) {
      return "Free delivery";
    }

    return `Delivery fee: ₱${amount.toFixed(2)}`;
  }

closeRestaurantPreview?.addEventListener(
  "click",
  () => {
    if (IS_ADMIN_PREVIEW) {
      /*
       * The Admin preview was opened through
       * window.open(), so closing this tab returns
       * the administrator to the still-open review modal.
       */
      window.close();

      /*
       * Fallback for cases where the preview URL
       * was opened manually and the browser refuses
       * to close the tab.
       */
      window.setTimeout(
        () => {
          if (!window.closed) {
            window.location.href =
              "/frontend/html/admin.html";
          }
        },
        150
      );

      return;
    }

    window.location.href =
      "/frontend/html/create_restaurant.html";
  }
);

  function showRestaurantPageError(
    message
  ) {
    document.title =
      "Restaurant Unavailable | FoodConnect";

    if (restaurantName) {
      restaurantName.textContent =
        "Restaurant unavailable";
    }

    if (heroRestaurantName) {
      heroRestaurantName.textContent =
        "Restaurant unavailable";
    }

    if (heroRestaurantDetails) {
      heroRestaurantDetails.textContent =
        message;
    }

    const menuGrid =
      document.getElementById(
        "menuGrid"
      );

    if (menuGrid) {
      menuGrid.innerHTML = `
        <div class="orders-empty">
          ${escapeMenuText(message)}
        </div>
      `;
    }
  }

  function resolveRestaurantImageUrl(
  imagePath
) {
  const cleanedPath =
    String(
      imagePath || ""
    ).trim();

  if (cleanedPath === "") {
    return "";
  }

  if (
    cleanedPath.startsWith(
      "http://"
    ) ||
    cleanedPath.startsWith(
      "https://"
    ) ||
    cleanedPath.startsWith(
      "/"
    )
  ) {
    return cleanedPath;
  }

  return `/${cleanedPath}`;
}

function formatPesoAmount(
  value,
  zeroLabel = "Free"
) {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return zeroLabel;
  }

  return `₱${amount.toFixed(2)}`;
}

function formatTimeForDisplay(
  value
) {
  const time =
    String(
      value || ""
    ).trim();

  if (
    !/^[0-2][0-9]:[0-5][0-9]$/.test(
      time
    )
  ) {
    return time;
  }

  const [
    hourText,
    minutes
  ] = time.split(":");

  const hour =
    Number(hourText);

  const period =
    hour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${displayHour}:${minutes} ${period}`;
}

function getTodayPreviewSchedule(
  businessHours
) {
  if (
    !businessHours ||
    typeof businessHours !==
      "object"
  ) {
    return null;
  }

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const today =
    dayNames[
      new Date().getDay()
    ];

  return {
    day:
      today,

    schedule:
      businessHours[today] || null
  };
}

function renderRestaurantServices(
  deliveryOptions
) {
  if (!restaurantServiceTags) {
    return;
  }

  const labels = {
    pickup:
      "Customer pickup",

    restaurant_delivery:
      "Restaurant delivery",

    foodconnect_delivery:
      "FoodConnect delivery"
  };

  const options =
    Array.isArray(
      deliveryOptions
    )
      ? deliveryOptions
      : [];

  restaurantServiceTags.innerHTML =
    options.length > 0
      ? options
          .map((option) => {
            const label =
              labels[option] ||
              option;

            return `
              <span class="restaurant-service-tag">
                ${escapeMenuText(label)}
              </span>
            `;
          })
          .join("")
      : `
          <span class="restaurant-service-tag">
            No service selected
          </span>
        `;
}
async function loadRestaurantIdentity() {
  if (
    !IS_PREVIEW_MODE &&
    CURRENT_RESTAURANT_ID <= 0
  ) {
    showRestaurantPageError(
      "No valid restaurant was selected."
    );

    return false;
  }

  try {
    let requestUrl;

    if (IS_OWNER_PREVIEW) {
      requestUrl =
        `${API}/get_restaurant_preview.php` +
        `?mode=owner`;
    } else if (IS_ADMIN_PREVIEW) {
      if (
        !Number.isInteger(
          previewApplicationId
        ) ||
        previewApplicationId <= 0
      ) {
        throw new Error(
          "No valid restaurant application was selected."
        );
      }

      requestUrl =
        `${API}/get_restaurant_preview.php` +
        `?mode=admin` +
        `&application_id=${encodeURIComponent(
          previewApplicationId
        )}`;
    } else {
      requestUrl =
        `${API}/get_public_restaurant.php` +
        `?restaurant_id=${encodeURIComponent(
          CURRENT_RESTAURANT_ID
        )}`;
    }

    const response =
      await fetch(
        requestUrl,
        {
          credentials: "include",
          cache: "no-store"
        }
      );

    const rawText =
      await response.text();

    let data;

    try {
      data =
        JSON.parse(
          rawText
        );
    } catch (parseError) {
      throw new Error(
        "Unable to load the restaurant right now. Please try again."
      );
    }

    if (
      !response.ok ||
      !data.success ||
      !data.restaurant
    ) {
      throw new Error(
        data.message ||
        "Unable to load this restaurant."
      );
    }

    const restaurant =
      data.restaurant;

      const loadedRestaurantId =
  Number.parseInt(
    restaurant.restaurant_id ||
    0,
    10
  );

if (
  Number.isInteger(
    loadedRestaurantId
  ) &&
  loadedRestaurantId > 0
) {
  resolvedRestaurantId =
    loadedRestaurantId;
}

    const name =
      String(
        restaurant.name ||
        "Restaurant"
      ).trim();

    const address =
      String(
        restaurant.address ||
        "Address unavailable"
      ).trim();

    const contactNumber =
      window.FoodConnectPhone.format(
        restaurant.contact_number,
        "Contact number unavailable"
      );

    const description =
      String(
        restaurant.description ||
        ""
      ).trim();

    const businessStatus =
      String(
        restaurant.business_status ||
        (
          IS_PREVIEW_MODE
            ? "Preview"
            : "Closed"
        )
      ).trim();

    currentRestaurantStatus =
      businessStatus;

    restaurantAcceptingOrders =
      IS_PREVIEW_MODE
        ? false
        : (
            restaurant
              .is_accepting_orders ===
            true
          );

    document.title =
      IS_PREVIEW_MODE
        ? `${name} Preview | FoodConnect`
        : `${name} | FoodConnect`;

    if (restaurantName) {
      restaurantName.textContent =
        name;
    }

    if (heroRestaurantName) {
      heroRestaurantName.textContent =
        name;
    }

    if (footerRestaurantName) {
      footerRestaurantName.textContent =
        name;
    }

    if (restaurantAboutName) {
      restaurantAboutName.textContent =
        `About ${name}`;
    }

    if (restaurantDescription) {
      restaurantDescription.textContent =
        description !== ""
          ? description
          : "No restaurant description provided.";
    }

    const logoUrl =
      resolveRestaurantImageUrl(
        restaurant.logo_path
      );

    if (
      logoUrl !== "" &&
      headerRestaurantLogo
    ) {
      headerRestaurantLogo.src =
        logoUrl;
    }

    if (
      logoUrl !== "" &&
      footerRestaurantLogo
    ) {
      footerRestaurantLogo.src =
        logoUrl;
    }

    let openingHoursText =
      String(
        restaurant.opening_hours ||
        ""
      ).trim();

    if (
      restaurant.business_hours &&
      typeof restaurant.business_hours ===
        "object"
    ) {
      const today =
        getTodayPreviewSchedule(
          restaurant.business_hours
        );

      if (
        today &&
        today.schedule
      ) {
        if (
          today.schedule.closed ===
          true
        ) {
          openingHoursText =
            `${today.day}: Closed`;
        } else {
          openingHoursText =
            `${today.day}: ` +
            `${formatTimeForDisplay(
              today.schedule.open
            )} – ` +
            `${formatTimeForDisplay(
              today.schedule.close
            )}`;
        }
      }
    }

    if (openingHoursText === "") {
      openingHoursText =
        "Operating hours unavailable";
    }

    if (heroRestaurantDetails) {
      heroRestaurantDetails.textContent =
        IS_PREVIEW_MODE
          ? `${address} • Customer page preview`
          : (
              restaurantAcceptingOrders
                ? `${address} • Currently accepting orders`
                : `${address} • Currently closed`
            );
    }

    if (restaurantOpeningHours) {
      restaurantOpeningHours.textContent =
        openingHoursText;
    }

    if (restaurantBusinessStatus) {
      restaurantBusinessStatus.textContent =
        IS_PREVIEW_MODE
          ? "Preview only"
          : businessStatus;
    }

    if (restaurantAddress) {
      restaurantAddress.textContent =
        address;
    }

    if (restaurantContactNumber) {
      restaurantContactNumber.textContent =
        contactNumber;
    }

    if (restaurantDeliveryFee) {
      restaurantDeliveryFee.textContent =
        formatRestaurantDeliveryFee(
          restaurant.delivery_fee
        );
    }

    if (
      restaurantPreviewDeliveryFee
    ) {
      restaurantPreviewDeliveryFee.textContent =
        formatPesoAmount(
          restaurant.delivery_fee,
          "Free"
        );
    }

    renderRestaurantServices(
      restaurant.delivery_options
    );

    if (restaurantInformationSection) {
      restaurantInformationSection.hidden =
        false;
    }

    if (restaurantCopyright) {
      restaurantCopyright.textContent =
        `© 2026 ${name}. All rights reserved. | Powered by FoodConnect`;
    }

    if (IS_PREVIEW_MODE) {
      document.body.classList.add(
        "restaurant-preview-mode"
      );

      if (restaurantPreviewBanner) {
        restaurantPreviewBanner.hidden =
          false;
      }

      if (closeRestaurantPreview) {
  closeRestaurantPreview.textContent =
    IS_ADMIN_PREVIEW
      ? "Return to Admin Review"
      : "Return to Setup";
}
    }

    return true;
  } catch (error) {
    console.error(
      "Load restaurant identity error:",
      error
    );

    showRestaurantPageError(
      error.message ||
      "This restaurant is currently unavailable."
    );

    return false;
  }
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


  function resolveCartRestaurantLogo(value) {
    const path =
      String(value || "").trim();

    if (!path) {
      return "";
    }

    if (
      /^https?:\/\//i.test(path) ||
      path.startsWith("/")
    ) {
      return path;
    }

    return (
      "/" +
      path.replace(/^\/+/, "")
    );
  }

  function getCurrentRestaurantDisplayName() {
    return String(
      document.getElementById(
        "restaurantName"
      )?.textContent ||
      document.getElementById(
        "heroRestaurantName"
      )?.textContent ||
      "this restaurant"
    ).trim();
  }

  function ensureCartRestaurantSwitchModal() {
    let modal =
      document.getElementById(
        "cartRestaurantSwitchModal"
      );

    if (modal) {
      return modal;
    }

    modal =
      document.createElement("div");

    modal.id =
      "cartRestaurantSwitchModal";

    modal.className =
      "cart-restaurant-switch-modal";

    modal.innerHTML = `
      <div
        class="cart-restaurant-switch-backdrop"
        data-cart-switch-cancel
      ></div>

      <section
        class="cart-restaurant-switch-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartRestaurantSwitchTitle"
        aria-describedby="cartRestaurantSwitchMessage"
      >
        <div class="cart-restaurant-switch-icon">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>

        <h3 id="cartRestaurantSwitchTitle">
          Your Cart Has Items From Another Restaurant
        </h3>

        <p id="cartRestaurantSwitchMessage">
          Your current cart belongs to another restaurant.
        </p>

        <div class="cart-restaurant-current">
          <div class="cart-restaurant-current-logo">
            <img
              id="cartSwitchRestaurantLogo"
              alt=""
              hidden
            >

            <span id="cartSwitchRestaurantFallback">
              <i class="fa-solid fa-store"></i>
            </span>
          </div>

          <div>
            <span>Your current cart</span>
            <strong id="cartSwitchRestaurantName">
              Restaurant
            </strong>
            <small id="cartSwitchItemCount">
              0 items in your cart
            </small>
          </div>
        </div>

        <p class="cart-restaurant-switch-warning">
          You can only order from one restaurant at a time.
          Starting a new order here will remove your current cart items.
        </p>

        <div class="cart-restaurant-switch-actions">
          <button
            type="button"
            class="cart-switch-cancel"
            data-cart-switch-cancel
          >
            Cancel
          </button>

          <button
            type="button"
            class="cart-switch-confirm"
            data-cart-switch-confirm
          >
            Start New Order
          </button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);

    return modal;
  }

  function showCartRestaurantSwitchModal(
    currentCart = {}
  ) {
    const modal =
      ensureCartRestaurantSwitchModal();

    const restaurantName =
      String(
        currentCart.restaurant_name ||
        "Current Restaurant"
      ).trim();

    const totalItems =
      Math.max(
        0,
        Number(
          currentCart.total_items
        ) || 0
      );

    const targetRestaurantName =
      getCurrentRestaurantDisplayName();

    const nameElement =
      modal.querySelector(
        "#cartSwitchRestaurantName"
      );

    const countElement =
      modal.querySelector(
        "#cartSwitchItemCount"
      );

    const messageElement =
      modal.querySelector(
        "#cartRestaurantSwitchMessage"
      );

    const logoElement =
      modal.querySelector(
        "#cartSwitchRestaurantLogo"
      );

    const fallbackElement =
      modal.querySelector(
        "#cartSwitchRestaurantFallback"
      );

    if (nameElement) {
      nameElement.textContent =
        restaurantName;
    }

    if (countElement) {
      countElement.textContent =
        `${totalItems} item${
          totalItems === 1 ? "" : "s"
        } in your cart`;
    }

    if (messageElement) {
      messageElement.textContent =
        `You are trying to order from ${targetRestaurantName}.`;
    }

    const logoUrl =
      resolveCartRestaurantLogo(
        currentCart.restaurant_logo
      );

    if (logoElement) {
      logoElement.onerror = () => {
        logoElement.hidden = true;

        if (fallbackElement) {
          fallbackElement.hidden = false;
        }
      };

      if (logoUrl) {
        logoElement.src = logoUrl;
        logoElement.alt =
          `${restaurantName} logo`;
        logoElement.hidden = false;

        if (fallbackElement) {
          fallbackElement.hidden = true;
        }
      } else {
        logoElement.removeAttribute("src");
        logoElement.hidden = true;

        if (fallbackElement) {
          fallbackElement.hidden = false;
        }
      }
    }

    modal.classList.add("show");
    document.body.classList.add(
      "cart-switch-modal-open"
    );

    return new Promise((resolve) => {
      let settled = false;

      const finish = (result) => {
        if (settled) {
          return;
        }

        settled = true;

        modal.classList.remove("show");
        document.body.classList.remove(
          "cart-switch-modal-open"
        );

        modal.removeEventListener(
          "click",
          handleClick
        );

        document.removeEventListener(
          "keydown",
          handleKeydown
        );

        resolve(result);
      };

      const handleClick = (event) => {
        if (
          event.target.closest(
            "[data-cart-switch-confirm]"
          )
        ) {
          finish(true);
          return;
        }

        if (
          event.target.closest(
            "[data-cart-switch-cancel]"
          )
        ) {
          finish(false);
        }
      };

      const handleKeydown = (event) => {
        if (event.key === "Escape") {
          finish(false);
        }
      };

      modal.addEventListener(
        "click",
        handleClick
      );

      document.addEventListener(
        "keydown",
        handleKeydown
      );

      modal.querySelector(
        "[data-cart-switch-confirm]"
      )?.focus();
    });
  }

  async function clearCartForRestaurantSwitch() {
    const response = await fetch(
      `${API}/cart_clear.php`,
      {
        method: "POST",
        credentials: "include"
      }
    );

    const rawText =
      await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (error) {
      throw new Error(
        "Unable to start a new order right now. Please try again."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to clear your current cart. Please try again."
      );
    }
  }

  const menuFilters =
  document.getElementById(
    "menuFilters"
  );

  let items = [];
  const searchInput = document.querySelector(".search-bar input");
  const searchBtn = document.getElementById("searchBtn");
  const searchResults = document.getElementById("searchResults");
  const menuGrid = document.getElementById("menuGrid");
  const popularSection =
  document.getElementById(
    "popularSection"
  );

const popularGrid =
  document.getElementById(
    "popularGrid"
  );

const popularDescription =
  document.getElementById(
    "popularDescription"
  );

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

function normalizeProductIds(value) {
  if (Array.isArray(value)) {
    return value
      .map((id) =>
        Number.parseInt(id, 10)
      )
      .filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
      );
  }

  if (
    typeof value === "string"
  ) {
    return value
      .split(",")
      .map((id) =>
        Number.parseInt(
          id.trim(),
          10
        )
      )
      .filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
      );
  }

  const singleId =
    Number.parseInt(value, 10);

  return Number.isInteger(singleId) &&
    singleId > 0
      ? [singleId]
      : [];
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
    category.includes("add-on") ||
    category.includes("addon")
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

function formatCategoryLabel(
  categorySlug,
  rawCategory
) {
  const knownLabels = {
    shawarma: "Shawarma",
    frappe: "Frappe",
    "non-coffee": "Non-Coffee",
    coffee: "Coffee",
    milktea: "Milktea",
    "fruit-tea": "Fruit Tea",
    "milktea-creamcheese":
      "Milktea Creamcheese",
    "shawarma-burger":
      "Shawarma Burger",
    fries: "Fries"
  };

  if (knownLabels[categorySlug]) {
    return knownLabels[categorySlug];
  }

  const fallbackLabel =
    String(rawCategory || "")
      .trim();

  return fallbackLabel ||
    "Uncategorized";
}

function renderDynamicMenuFilters(
  productGroups
) {
  if (!menuFilters) {
    return;
  }

  const categories =
    new Map();

  productGroups.forEach(
    (group) => {
      const categorySlug =
        String(
          group.categorySlug || ""
        ).trim();

      if (!categorySlug) {
        return;
      }

      if (
        !categories.has(
          categorySlug
        )
      ) {
        categories.set(
          categorySlug,
          formatCategoryLabel(
            categorySlug,
            group.rawCategory
          )
        );
      }
    }
  );

  menuFilters.innerHTML = "";

  const allButton =
    document.createElement(
      "button"
    );

  allButton.type = "button";
  allButton.className =
    "filter-btn main-filter-btn active";

  allButton.dataset.filter =
    "all";

  allButton.textContent =
    "All";

  menuFilters.appendChild(
    allButton
  );

  categories.forEach(
    (
      categoryLabel,
      categorySlug
    ) => {
      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "filter-btn main-filter-btn";

      button.dataset.filter =
        categorySlug;

      button.textContent =
        categoryLabel;

      menuFilters.appendChild(
        button
      );
    }
  );
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
    if (
      String(product.item_type || "").trim().toLowerCase() === "add_on" ||
      categoryMapping.isAddonCategory
    ) {
      return;
    }

    const size = normalizeProductName(
      product.size
    );

    const description =
      String(
        product.description || ""
      ).trim();

   const regularPrice =
  Number(
    product.regular_price ??
    product.price ??
    0
  ) || 0;

const finalPrice =
  Number(
    product.final_price ??
    product.discounted_price ??
    regularPrice
  ) || regularPrice;

const discountSavings =
  Number(
    product.discount_savings
  ) || 0;

const discountType =
  String(
    product.discount_type ||
    "none"
  )
    .trim()
    .toLowerCase();

const discountValue =
  Number(
    product.discount_value
  ) || 0;

const discountSchedule =
  String(
    product.discount_schedule ||
    "permanent"
  )
    .trim()
    .toLowerCase();

const discountStatus =
  String(
    product.discount_status ||
    "Inactive"
  ).trim();

const discountStart =
  String(
    product.discount_start || ""
  ).trim();

const discountEnd =
  String(
    product.discount_end || ""
  ).trim();

const isDiscountActive =
  product.is_discount_active === true ||
  product.is_discount_active === 1 ||
  String(
    product.is_discount_active
  ).trim() === "1";

const image =
  String(
    product.image_path ||
    product.image ||
    ""
  ).trim();

const stock =
  Number(product.stock || 0);

const status =
  String(product.status || "")
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
      String(product.group_key || "").trim() ||
      (rawCategory.toLowerCase() +
      "::" +
      name.toLowerCase());

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

        allowedAddonIds: [],

        description: "",

        variants: []
      });
    }

    const group = grouped.get(groupKey);

    if (!group.description && description) {
      group.description = description;
    }

    const configuredAddonIds =
      Array.isArray(product.addon_ids)
        ? product.addon_ids
            .map(Number)
            .filter(id => Number.isInteger(id) && id > 0)
        : [];

    group.allowedAddonIds = Array.from(
      new Set([
        ...(group.allowedAddonIds || []),
        ...configuredAddonIds
      ])
    );

    group.variants.push({
  productId,
  size,

  price:
    regularPrice,

  regularPrice:
    regularPrice,

  finalPrice:
    finalPrice,

  discountSavings:
    discountSavings,

  discountType:
    discountType,

  discountValue:
    discountValue,

  discountSchedule:
    discountSchedule,

  discountStatus:
  discountStatus,

discountStart:
  discountStart,

discountEnd:
  discountEnd,

isDiscountActive:
  isDiscountActive,

  image:
    image,

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

        const aSellingPrice =
  a.isDiscountActive
    ? a.finalPrice
    : a.regularPrice;

const bSellingPrice =
  b.isDiscountActive
    ? b.finalPrice
    : b.regularPrice;

return (
  aSellingPrice -
  bSellingPrice
);
      });

      return group;
    }
  );
}

function getVariantSellingPrice(
  variant
) {
  if (!variant) {
    return 0;
  }

  return variant.isDiscountActive
    ? Number(
        variant.finalPrice
      ) || 0
    : Number(
        variant.regularPrice
      ) || 0;
}

function getGroupActivePromoVariants(
  group
) {
  return Array.isArray(group?.variants)
    ? group.variants.filter(
        variant =>
          variant.available &&
          variant.isDiscountActive &&
          Number(
            variant.finalPrice
          ) <
          Number(
            variant.regularPrice
          )
      )
    : [];
}

function getGroupPrimaryVariant(
  group
) {
  const availableVariants =
    Array.isArray(group?.variants)
      ? group.variants.filter(
          variant =>
            variant.available
        )
      : [];

  const variants =
    availableVariants.length > 0
      ? availableVariants
      : (
          Array.isArray(group?.variants)
            ? group.variants
            : []
        );

  if (!variants.length) {
    return null;
  }

  return [...variants].sort(
    (a, b) =>
      getVariantSellingPrice(a) -
      getVariantSellingPrice(b)
  )[0];
}

function getGroupPromoLabel(
  group
) {
  const promoVariants =
    getGroupActivePromoVariants(
      group
    );

  if (!promoVariants.length) {
    return "";
  }

  const firstPromo =
    promoVariants[0];

  const samePromotion =
    promoVariants.every(
      variant =>
        variant.discountType ===
          firstPromo.discountType &&
        Number(
          variant.discountValue
        ) ===
          Number(
            firstPromo.discountValue
          )
    );

  if (!samePromotion) {
    return "ON SALE";
  }

  if (
    firstPromo.discountType ===
    "percentage"
  ) {
    return `${
      Number(
        firstPromo.discountValue
      ) || 0
    }% OFF`;
  }

  if (
    firstPromo.discountType ===
    "fixed"
  ) {
    return `₱${
      Number(
        firstPromo.discountValue
      ).toFixed(2)
    } OFF`;
  }

  return "ON SALE";
}

function parseCustomerPromoDate(
  value
) {
  const cleanedValue =
    String(value || "")
      .trim();

  if (!cleanedValue) {
    return null;
  }

  const parsedDate =
    new Date(
      cleanedValue.replace(
        " ",
        "T"
      )
    );

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate;
}

function getCustomerPromoEndText(
  variant
) {
  if (
    !variant ||
    !variant.isDiscountActive ||
    variant.discountSchedule !==
      "scheduled"
  ) {
    return "";
  }

  const endDate =
    parseCustomerPromoDate(
      variant.discountEnd
    );

  if (!endDate) {
    return "";
  }

  const now = new Date();

  const remainingMilliseconds =
    endDate.getTime() -
    now.getTime();

  if (
    remainingMilliseconds <= 0
  ) {
    return "";
  }

  const remainingMinutes =
    Math.ceil(
      remainingMilliseconds /
      60000
    );

  if (remainingMinutes < 60) {
    return `Promo ends in ${remainingMinutes} min`;
  }

  const remainingHours =
    Math.floor(
      remainingMinutes / 60
    );

  const extraMinutes =
    remainingMinutes % 60;

  if (remainingHours < 24) {
    return extraMinutes > 0
      ? `Promo ends in ${remainingHours}h ${extraMinutes}m`
      : `Promo ends in ${remainingHours}h`;
  }

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const endDay =
    new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

  const dayDifference =
    Math.round(
      (
        endDay.getTime() -
        today.getTime()
      ) /
      86400000
    );

  const timeText =
    endDate.toLocaleTimeString(
      "en-PH",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
    );

  if (dayDifference === 0) {
    return `Ends today • ${timeText}`;
  }

  if (dayDifference === 1) {
    return `Ends tomorrow • ${timeText}`;
  }

  return `Ends ${endDate.toLocaleString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }
  )}`;
}

function getGroupPromoPriceMarkup(
  group
) {
  const primaryVariant =
    getGroupPrimaryVariant(
      group
    );

  if (!primaryVariant) {
    return `
      <p class="price">
        Price unavailable
      </p>
    `;
  }

  const sellingPrice =
    getVariantSellingPrice(
      primaryVariant
    );

  const hasActivePromo =
    primaryVariant
      .isDiscountActive &&
    Number(
      primaryVariant.finalPrice
    ) <
    Number(
      primaryVariant.regularPrice
    );

    const promoEndText =
  getCustomerPromoEndText(
    primaryVariant
  );

  if (!hasActivePromo) {
    return `
      <p class="price">
        ₱${sellingPrice.toFixed(2)}
      </p>
    `;
  }

  return `
    <div class="customer-promo-price">
      <strong>
        ₱${sellingPrice.toFixed(2)}
      </strong>

      <del>
        ₱${Number(
          primaryVariant.regularPrice
        ).toFixed(2)}
      </del>
    </div>

    <small class="customer-promo-saving">
  Save ₱${Number(
    primaryVariant.discountSavings
  ).toFixed(2)}
</small>

${
  promoEndText
    ? `
      <small class="customer-promo-ending">
        ${escapeMenuText(
          promoEndText
        )}
      </small>
    `
    : ""
}
  `;
}

function getProductPriceLabel(
  group
) {
  const availableVariants =
    group.variants.filter(
      variant =>
        variant.available
    );

  const variants =
    availableVariants.length > 0
      ? availableVariants
      : group.variants;

  const sellingPrices =
    variants
      .map(
        variant =>
          getVariantSellingPrice(
            variant
          )
      )
      .filter(
        price =>
          Number.isFinite(
            price
          )
      );

  if (!sellingPrices.length) {
    return "Price unavailable";
  }

  const minimum =
    Math.min(
      ...sellingPrices
    );

  const maximum =
    Math.max(
      ...sellingPrices
    );

  if (minimum === maximum) {
    return `₱${minimum.toFixed(2)}`;
  }

  return (
    `₱${minimum.toFixed(2)}` +
    ` – ` +
    `₱${maximum.toFixed(2)}`
  );
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
  const variantSummary =
  getVariantSummary(group);

const promoLabel =
  getGroupPromoLabel(
    group
  );

const primaryVariant =
  getGroupPrimaryVariant(
    group
  );

const productImage =
  resolveRestaurantImageUrl(
    primaryVariant?.image
  ) ||
  DEFAULT_PRODUCT_IMAGE;

return `
    <article
      class="menu-item dynamic-menu-item"
      data-product-group="${escapeMenuText(group.key)}"
      data-category="${escapeMenuText(group.categorySlug)}"
      data-subcategory="${escapeMenuText(group.subcategorySlug)}"
    >
      
    <div class="menu-item-image-wrap">
  ${
    promoLabel
      ? `
        <span class="customer-promo-ribbon">
          ${escapeMenuText(
            promoLabel
          )}
        </span>
      `
      : ""
  }

  <img
    src="${escapeMenuText(
      productImage
    )}"
    alt="${escapeMenuText(
      group.name
    )}"
    loading="lazy"
    onerror="this.src='${DEFAULT_PRODUCT_IMAGE}'"
  >
</div>

      <div class="menu-item-info">
        <div class="menu-item-details">
          <h3>${escapeMenuText(group.name)}</h3>

          ${
            group.description
              ? `
                <p class="product-description">
                  ${escapeMenuText(group.description)}
                </p>
              `
              : ""
          }

          ${getGroupPromoPriceMarkup(group)}

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

function buildPopularProductCard(
  group,
  popularProduct,
  rank
) {
  if (!group) {
    return "";
  }

  const availableVariants =
    group.variants.filter(
      (variant) =>
        variant.available
    );

  const isBundle =
    isPotentialBundleGroup(group);

  const isUnavailable =
    !isBundle &&
    availableVariants.length === 0;

  const variantSummary =
  getVariantSummary(group);

const promoLabel =
  getGroupPromoLabel(
    group
  );

const primaryVariant =
  getGroupPrimaryVariant(
    group
  );

const productImage =
  resolveRestaurantImageUrl(
    primaryVariant?.image
  ) ||
  DEFAULT_PRODUCT_IMAGE;

const totalSold = Math.max(

    0,
    Number(
      popularProduct.total_sold || 0
    )
  );

  const fallbackValue =
  popularProduct.is_fallback;

const isFallback =
  fallbackValue === true ||
  fallbackValue === 1 ||
  fallbackValue === "1" ||
  String(
    fallbackValue
  ).toLowerCase() === "true";

  const popularityLabel =
    isFallback
      ? `
          <span
            class="popular-card-label is-new"
          >
            Recommended product
          </span>
        `
      : `
          <span
            class="popular-card-label"
          >
            🔥 ${totalSold}
            ${totalSold === 1
              ? "item"
              : "items"}
            ordered
          </span>
        `;

  const buttonText =
    group.variants.length > 1
      ? "Choose Options"
      : "Add to Cart";

  return `
    <article
      class="menu-item dynamic-menu-item popular-card"
      data-product-group="${
        escapeMenuText(group.key)
      }"
      data-category="${
        escapeMenuText(
          group.categorySlug
        )
      }"
      data-subcategory="${
        escapeMenuText(
          group.subcategorySlug
        )
      }"
    >
      <span class="popular-rank">
        #${rank}
      </span>

      <div class="menu-item-image-wrap">
  ${
    promoLabel
      ? `
        <span class="customer-promo-ribbon">
          ${escapeMenuText(
            promoLabel
          )}
        </span>
      `
      : ""
  }

  <img
    src="${escapeMenuText(
      productImage
    )}"
    alt="${
      escapeMenuText(
        group.name
      )
    }"
    loading="lazy"
    onerror="this.src='${DEFAULT_PRODUCT_IMAGE}'"
  >
</div>

      <div class="menu-item-info">
        <div class="menu-item-details">
          <h3>
            ${escapeMenuText(group.name)}
          </h3>

          ${
            group.description
              ? `
                  <p class="product-description">
                    ${escapeMenuText(group.description)}
                  </p>
                `
              : ""
          }

          ${getGroupPromoPriceMarkup(group)}

          ${
            variantSummary
              ? `
                  <p
                    class="product-variant-summary"
                  >
                    ${
                      escapeMenuText(
                        variantSummary
                      )
                    }
                  </p>
                `
              : ""
          }

          ${popularityLabel}

          ${
            isUnavailable
              ? `
                  <p
                    class="product-stock-message"
                  >
                    Currently unavailable
                  </p>
                `
              : ""
          }
        </div>

        <button
          type="button"
          class="add-to-cart dynamic-add-to-cart"
          data-product-group="${
            escapeMenuText(
              group.key
            )
          }"
          data-original-text="${
            buttonText
          }"
          ${
            isUnavailable
              ? "disabled"
              : ""
          }
        >
          ${buttonText}
        </button>
      </div>
    </article>
  `;
}

function getAddonsForProductGroup(group) {
  if (!group) {
    return [];
  }

  const allowedIds = new Set(
    Array.isArray(group.allowedAddonIds)
      ? group.allowedAddonIds.map(Number)
      : []
  );

  return databaseAddons.filter(
    addon =>
      allowedIds.has(
        Number(addon.productId)
      )
  );
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
    throw new Error("Please select a valid product option.");
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
      "Unable to load this item right now. Please try again."
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      "Unable to load this item right now. Please try again."
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

function getSelectedVariantCustomerPrice(
  variant
) {
  if (!variant) {
    return 0;
  }

  const regularPrice =
    Number(
      variant.regularPrice ??
      variant.price ??
      0
    ) || 0;

  const finalPrice =
    Number(
      variant.finalPrice ??
      regularPrice
    ) || regularPrice;

  const hasActiveDiscount =
    variant.isDiscountActive === true &&
    finalPrice < regularPrice;

  return hasActiveDiscount
    ? finalPrice
    : regularPrice;
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

const productUnitPrice =
  getSelectedVariantCustomerPrice(
    activeSelectedVariant
  );

const unitTotal =
  productUnitPrice +
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

const selectedPromoLabel =
  getGroupPromoLabel(
    group
  );

productOptionsCategory.textContent =
  selectedPromoLabel
    ? `${group.rawCategory || "Product"} • ${selectedPromoLabel}`
    : group.rawCategory || "Product";

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

              <small
  class="${
    variant.isDiscountActive
      ? "variant-option-promo-price"
      : ""
  }"
>
  ${
    variant.isDiscountActive &&
    Number(
      variant.finalPrice
    ) <
    Number(
      variant.regularPrice
    )
      ? `
        <strong>
          ₱${getSelectedVariantCustomerPrice(
            variant
          ).toFixed(2)}
        </strong>

        <del>
          ₱${Number(
            variant.regularPrice
          ).toFixed(2)}
        </del>
      `
      : `
        ₱${getSelectedVariantCustomerPrice(
          variant
        ).toFixed(2)}
      `
  }
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
        "Unable to load this item right now. Please try again."
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
  `${API}/get_public_products.php?restaurant_id=${encodeURIComponent(
  resolvedRestaurantId
)}`,

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
        "Unable to load the menu right now. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load the menu right now. Please try again."
      );
    }

    /*
     * Supports both:
     * [ ...products ]
     *
     * and:
     * { success: true, products: [...] }
     */
  const products =
  Array.isArray(data.products)
    ? data.products
    : Array.isArray(data)
      ? data
      : [];

const restaurant =
  data.restaurant || {};

currentRestaurantStatus =
  String(
    restaurant.business_status ||
    "Closed"
  );

restaurantAcceptingOrders =
  restaurant.is_accepting_orders === true;

        

const addonMap = new Map();

products.forEach((product) => {
  const category =
    normalizeAddonCategory(
      product.category
    );

  const isAddon =
    String(
      product.item_type || ""
    ).trim().toLowerCase() === "add_on" ||
    category.includes("add-on") ||
    category.includes("addon");

  if (!isAddon) {
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
    product.final_price ??
    product.price ??
    0
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

  if (
    !existing ||
    productId > existing.productId
  ) {
    addonMap.set(addonKey, {
      productId,
      name,
      category,
      price,
      stock: null,
      status
    });
  }
});

databaseAddons = Array.from(
  addonMap.values()
);

    
databaseProductGroups =
  groupProducts(products);

renderDynamicMenuFilters(
  databaseProductGroups
);

renderDatabaseProducts(
  databaseProductGroups
);

return databaseProductGroups;


  } catch (error) {
    console.error("Load products error:", error);

    menuGrid.innerHTML = `
      <div class="orders-empty">
        ${escapeMenuText(
          error.message || "Unable to load the menu right now. Please try again."
        )}
      </div>
    `;

    items = [];

    return [];
  }
}

async function loadPopularProducts() {
  if (
    !popularSection ||
    !popularGrid
  ) {
    return;
  }

  popularSection.hidden = false;

  popularGrid.innerHTML = `
    <div class="popular-loading">
      Loading popular products...
    </div>
  `;

  try {
    const response = await fetch(
      `${API}/get_popular_products.php` +
      `?restaurant_id=${
        encodeURIComponent(
          CURRENT_RESTAURANT_ID
        )
      }&limit=4`,
      {
        credentials: "include",
        cache: "no-store"
      }
    );

    const rawText =
      await response.text();

    let data;

    try {
      data = JSON.parse(
        rawText
      );
    } catch (parseError) {
      console.error(
        "Invalid popular products response:",
        rawText
      );

      throw new Error(
        "Unable to load popular items right now. Please try again."
      );
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to load popular products."
      );
    }

    const popularProducts =
      Array.isArray(data.products)
        ? data.products
        : [];

    if (
      popularProducts.length === 0
    ) {
      popularSection.hidden = true;
      popularGrid.innerHTML = "";
      return;
    }

    if (popularDescription) {
      popularDescription.textContent =
        data.source === "fallback"
          ? "Recommended products from this restaurant."
          : "The most frequently ordered products from this restaurant.";
    }

    const cards = [];

    popularProducts.forEach(
  (popularProduct) => {
    const popularProductIds =
      normalizeProductIds(
        popularProduct.product_ids
      );

    /*
     * Primary matching:
     * Match using real database product IDs.
     *
     * This is safer than matching category labels
     * because category capitalization and spacing
     * can differ between APIs.
     */
    let matchingGroup = null;

    if (
      popularProductIds.length > 0
    ) {
      matchingGroup =
        databaseProductGroups.find(
          (group) =>
            group.variants.some(
              (variant) =>
                popularProductIds.includes(
                  Number(
                    variant.productId
                  )
                )
            )
        ) || null;
    }

    /*
     * Compatibility fallback:
     * Used only when an older API response does not
     * contain product_ids.
     */
    if (!matchingGroup) {
      const productName =
        normalizeProductName(
          popularProduct.product_name
        ).toLowerCase();

      const category =
        normalizeProductName(
          popularProduct.category
        ).toLowerCase();

      matchingGroup =
        databaseProductGroups.find(
          (group) => {
            const groupName =
              normalizeProductName(
                group.name
              ).toLowerCase();

            const groupCategory =
              normalizeProductName(
                group.rawCategory
              ).toLowerCase();

            return (
              groupName === productName &&
              (
                category === "" ||
                groupCategory === category
              )
            );
          }
        ) || null;
    }

    if (!matchingGroup) {
      console.warn(
        "Popular product was not found in the loaded menu:",
        popularProduct
      );

      return;
    }

    const displayRank =
      cards.length + 1;

    cards.push(
      buildPopularProductCard(
        matchingGroup,
        popularProduct,
        displayRank
      )
    );
  }
);

    if (cards.length === 0) {
  console.warn(
    "Popular products were returned, but none matched the currently loaded restaurant menu."
  );

  popularSection.hidden = true;
  popularGrid.innerHTML = "";

  return;
}

    popularGrid.innerHTML =
      cards.join("");

  } catch (error) {
    console.error(
      "Load popular products:",
      error
    );

    /*
     * Popular products are optional.
     * Do not break the normal menu when this request fails.
     */
    popularSection.hidden = true;
    popularGrid.innerHTML = "";
  }
}

 function getActiveMainFilter() {
  const activeMainButton =
    document.querySelector(
      ".main-filter-btn.active"
    );

  return activeMainButton
    ? activeMainButton.dataset
        .filter || "all"
    : "all";
}

function showCorrectSubfilters() {
  /*
   * Subfilters were previously tied to
   * restaurant-specific categories.
   *
   * Public restaurant filtering now
   * uses each restaurant's own dynamic
   * categories.
   */
}

 function getItemPriceText(item) {
  const priceElement =
    item.querySelector(".price");

  return String(
    priceElement?.textContent || ""
  ).toLowerCase();
}

function matchesCurrentFilters(
  item
) {
  const activeMain =
    getActiveMainFilter();

  const searchTerm =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";

  const itemCategory =
    String(
      item.dataset.category || ""
    ).toLowerCase();

  const itemSubcategory =
    String(
      item.dataset.subcategory ||
      ""
    ).toLowerCase();

  const itemName =
    String(
      item.querySelector("h3")
        ?.textContent || ""
    ).toLowerCase();

  const itemPriceText =
    getItemPriceText(item);

  const matchesMain =
    activeMain === "all" ||
    itemCategory === activeMain;

  let matchesSearch = true;

  if (searchTerm !== "") {
    matchesSearch =
      itemName.includes(
        searchTerm
      ) ||
      itemPriceText.includes(
        searchTerm
      ) ||
      itemCategory.includes(
        searchTerm
      ) ||
      itemSubcategory.includes(
        searchTerm
      );
  }

  return (
    matchesMain &&
    matchesSearch
  );
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

  if (menuFilters) {
  menuFilters.addEventListener(
    "click",
    (event) => {
      const selectedButton =
        event.target.closest(
          ".main-filter-btn"
        );

      if (
        !selectedButton ||
        !menuFilters.contains(
          selectedButton
        )
      ) {
        return;
      }

      menuFilters
        .querySelectorAll(
          ".main-filter-btn"
        )
        .forEach(
          (filterButton) => {
            filterButton.classList
              .remove("active");
          }
        );

      selectedButton.classList.add(
        "active"
      );

      applyFilters();
      renderSearchSuggestions();
    }
  );
}


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

  function showCartSuccessToast(message) {
    let toast = document.getElementById("cartSuccessToast");

    if(!toast) {
      toast = document.createElement("div");
      toast.id = "cartSuccessToast";
      toast.className = "cart-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
    <div class="popup">
      <div class="popup-check">✓</div>
      <div class="popup-title">${message}</div>
    </div>
    `;
    toast.classList.add("show");

    setTimeout(() => {      
      toast.classList.remove("show");
    }, 2500);
  }

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
    alert("Please select a valid product option.");
    return false;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Adding...";
    }
if (!restaurantAcceptingOrders) {

    alert(
        currentRestaurantStatus ===
        "Temporarily Unavailable"
            ? "This restaurant is temporarily unavailable."
            : "This restaurant is currently closed."
    );

    return;
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
        "Unable to update your cart right now. Please try again."
      );
    }

    if (
      response.status === 409 &&
      data.error_code ===
        "different_restaurant"
    ) {
      const shouldStartNewOrder =
        await showCartRestaurantSwitchModal(
          data.current_cart || {}
        );

      if (!shouldStartNewOrder) {
        return false;
      }

      await clearCartForRestaurantSwitch();

      const retryResponse = await fetch(
        `${API}/cart_add.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            product_id:
              safeProductId,
            quantity:
              safeQuantity,
            addon_ids:
              safeAddonIds,
            combo_choice_ids:
              safeComboChoiceIds
          })
        }
      );

      const retryRawText =
        await retryResponse.text();

      let retryData;

      try {
        retryData =
          JSON.parse(retryRawText);
      } catch (error) {
        throw new Error(
          "Your old cart was cleared, but the new item could not be added. Please try again."
        );
      }

      if (
        !retryResponse.ok ||
        !retryData.success
      ) {
        throw new Error(
          retryData.message ||
          "Your old cart was cleared, but the new item could not be added. Please try again."
        );
      }

      await updateCartBadge();

      showCartSuccessToast(
        `New order started from ${
          getCurrentRestaurantDisplayName()
        }.`
      );

      return true;
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to add this item to your cart. Please try again."
      );
    }

    await updateCartBadge();

    showCartSuccessToast("Added to cart successfully.");

    return true;
    

  } catch (error) {
    console.error(
      "Add database product to cart:",
      error
    );

    alert(
      error.message ||
      "Unable to add this item to your cart. Please try again."
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

async function handleProductGridClick(
  event
) {
  const button =
    event.target.closest(
      ".dynamic-add-to-cart"
    );

  if (
    !button ||
    button.disabled
  ) {
    return;
  }

  const groupKey =
    button.dataset.productGroup || "";

  const group =
    databaseProductGroups.find(
      (item) =>
        item.key === groupKey
    );

  if (!group) {
    alert(
      "Product information was not found."
    );

    return;
  }

  const isBundle =
    isPotentialBundleGroup(group);

  const availableVariants =
    isBundle
      ? group.variants
      : group.variants.filter(
          (variant) =>
            variant.available
        );

  const addons =
    getAddonsForProductGroup(
      group
    );

  /*
   * A normal product with one variant,
   * no size, and no add-ons can be added
   * immediately.
   */
  if (
    !isBundle &&
    availableVariants.length === 1 &&
    addons.length === 0 &&
    !availableVariants[0].size
  ) {
    await addDatabaseProductToCart({
      productId:
        availableVariants[0]
          .productId,

      quantity: 1,
      addonIds: [],
      button
    });

    return;
  }

  await openProductOptionsModal(
    groupKey
  );
}

menuGrid?.addEventListener(
  "click",
  handleProductGridClick
);

popularGrid?.addEventListener(
  "click",
  handleProductGridClick
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

const restaurantLoaded =
  await loadRestaurantIdentity();

if (!restaurantLoaded) {
  if (!IS_PREVIEW_MODE) {
    await updateCartBadge();
  }

  return;
}

if (IS_PREVIEW_MODE) {
  if (popularSection) {
    popularSection.hidden =
      true;
  }

  await loadDatabaseProducts();

  document
    .querySelectorAll(
      ".dynamic-add-to-cart"
    )
    .forEach((button) => {
      button.disabled = true;
      button.textContent =
        "Preview Only";
    });

  showCorrectSubfilters();
  applyFilters();

  return;
}

await loadDatabaseProducts();

/*
 * The primary menu is ready now.
 * Do not let optional customer widgets delay it.
 */
showCorrectSubfilters();
applyFilters();

/*
 * Popular Products requires databaseProductGroups, so it
 * starts after the main menu but does not block the page.
 */
void loadPopularProducts();

/*
 * Cart badge is secondary UI and may update independently.
 */
void updateCartBadge();

  /*
   * Account UI may finish after the menu. Wait here only so
   * profile/logout handlers use the final authenticated state.
   * The customer menu has already rendered before this wait.
   */
  await accountSessionTask;


goProfileBtn?.addEventListener("click", () => {
    window.location.href = loggedIn
        ? "profile.html"
        : "login.html";
});

logoutBtn?.addEventListener("click", () => {
    window.location.href = `${API}/logout.php`;
});

});
