import {
  realtimeDatabase,
  authenticateFirebaseCustomerTracking
} from "./firebase-config.js";

import {
  ref,
  onValue,
  off
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js";

const API = "/api";

let customerTrackingMaps =
  new Map();

let customerTrackingListeners =
  new Map();

let customerTrackingAuth =
  new Map();

let deliveryAvailability = {
    checked: false,
    available: false,
    checking: false,
    availableRiderCount: 0
};

let deliveryLocationMap = null;
let deliveryLocationMarker = null;

let selectedDeliveryLocation = {
    latitude: null,
    longitude: null
};

let cartPricing = {
    subtotal: 0,
    promotionSavings: 0,
    deliveryFee: 0,
    selectedOrderType: ""
};

/*
 * Local cart snapshot used for instant quantity/remove UI updates.
 * The server remains authoritative; a failed mutation triggers a
 * full reload to restore the correct cart.
 */
let currentCartItems = [];
let currentCartRestaurant = null;
let currentCustomerTab = "cart";

/*
 * Per-cart-item quantity sync state.
 *
 * Rapid +/- clicks update the UI immediately, but only the latest
 * quantity is sent after a short pause. At most one cart_update.php
 * request per item is allowed in flight at a time.
 */
const cartQuantitySyncStates =
    new Map();

const CART_QUANTITY_DEBOUNCE_MS =
    450;

/* =========================================================
   CUSTOMER ORDERS STATE
========================================================= */

let customerOrders = [];
let customerOrdersRenderSignature = "";

let selectedCustomerCancelOrderId =
    null;

let customerCancellationSubmitting =
    false;
let currentOrderFilter = "active";
let customerOrdersLoading = false;

/*
 * Local/test PayMongo confirmation fallback.
 *
 * PayMongo Dashboard "Simulate Payment" does not redirect the
 * customer's browser back to FoodConnect, so the normal
 * paymongo_return handler is not triggered. While My Orders is
 * visible, only QR-verified pending PayMongo orders are checked,
 * and each order is throttled to one verification every 10 seconds.
 */
const payMongoPendingSyncLastAttempt =
    new Map();

const PAYMONGO_PENDING_SYNC_INTERVAL_MS =
    10000;

let customerOrdersInterval = null;
let customerCancelCountdownInterval =
    null;

let expandedCustomerOrderIds =
    new Set();

let clearedCompletedOrderIds =
    new Set();

const CLEARED_COMPLETED_ORDERS_KEY =
    "foodconnect_cleared_completed_orders";

/* =========================================================
   HELPERS
   ========================================================= */

function updateCustomerCancelCountdowns() {
    let hasCancellableOrder = false;

    customerOrders.forEach((order) => {
        const orderId =
            Number(order?.order_id || 0);

        if (orderId <= 0) {
            return;
        }

        const remainingMs =
            getCustomerCancelRemainingMs(
                order
            );

        const countdownElement =
            document.querySelector(
                `[data-customer-cancel-countdown="${orderId}"]`
            );

        const cancelButton =
            document.querySelector(
                `[data-cancel-customer-order="${orderId}"]`
            );

        if (
            canCustomerCancelOrder(order) &&
            remainingMs > 0
        ) {
            hasCancellableOrder = true;

            if (countdownElement) {
                countdownElement.textContent =
                    formatCustomerCancelCountdown(
                        remainingMs
                    );
            }

            return;
        }

        if (countdownElement) {
            countdownElement.textContent =
                "00:00";
        }

        if (cancelButton) {
            cancelButton.disabled = true;
            cancelButton.hidden = true;
        }
    });

    return hasCancellableOrder;
}


function startCustomerCancelCountdown() {
    if (
        customerCancelCountdownInterval
    ) {
        clearInterval(
            customerCancelCountdownInterval
        );

        customerCancelCountdownInterval =
            null;
    }

    const hasCancellableOrder =
        updateCustomerCancelCountdowns();

    if (!hasCancellableOrder) {
        return;
    }

    customerCancelCountdownInterval =
        window.setInterval(
            () => {
                const stillHasCancellableOrder =
                    updateCustomerCancelCountdowns();

                if (
                    !stillHasCancellableOrder
                ) {
                    clearInterval(
                        customerCancelCountdownInterval
                    );

                    customerCancelCountdownInterval =
                        null;
                }
            },
            1000
        );
} 

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatPrice(value) {
    const amount = Number(value);

    return `₱${Number.isFinite(amount)
        ? amount.toFixed(2)
        : "0.00"}`;
}


function resolveRestaurantLogoUrl(value) {
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

function hideCartRestaurantSummary() {
    const summary =
        document.getElementById(
            "cartRestaurantSummary"
        );

    if (summary) {
        summary.hidden = true;
    }
}

function renderCartRestaurantSummary(
    restaurant,
    totalItems = 0
) {
    const summary =
        document.getElementById(
            "cartRestaurantSummary"
        );

    if (!summary) {
        return;
    }

    const restaurantId =
        Number(
            restaurant?.restaurant_id ||
            0
        );

    const restaurantName =
        String(
            restaurant?.name ||
            "Restaurant"
        ).trim();

    if (restaurantId <= 0) {
        summary.hidden = true;
        return;
    }

    const nameElement =
        document.getElementById(
            "cartRestaurantName"
        );

    const countElement =
        document.getElementById(
            "cartRestaurantItemCount"
        );

    const logoElement =
        document.getElementById(
            "cartRestaurantLogo"
        );

    const fallbackElement =
        document.getElementById(
            "cartRestaurantFallback"
        );

    const linkElement =
        document.getElementById(
            "cartRestaurantLink"
        );

    if (nameElement) {
        nameElement.textContent =
            restaurantName;
    }

    if (countElement) {
        const count =
            Math.max(
                0,
                Number(totalItems) || 0
            );

        countElement.textContent =
            `${count} item${
                count === 1 ? "" : "s"
            } in your cart`;
    }

    const logoUrl =
        resolveRestaurantLogoUrl(
            restaurant?.logo_path
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

    if (linkElement) {
        linkElement.href =
            `restaurant.html?restaurant_id=${restaurantId}`;
    }

    summary.hidden = false;
}

function renderCheckoutSummary() {
    const restaurantNameElement =
        document.getElementById(
            "checkoutRestaurantName"
        );

    const itemsElement =
        document.getElementById(
            "checkoutSummaryItems"
        );

    const subtotalElement =
        document.getElementById(
            "checkoutSummarySubtotal"
        );

    const deliveryFeeElement =
        document.getElementById(
            "checkoutSummaryDeliveryFee"
        );

    const totalElement =
        document.getElementById(
            "checkoutSummaryTotal"
        );

    if (restaurantNameElement) {
        restaurantNameElement.textContent =
            currentCartRestaurant?.name ||
            "Restaurant";
    }

    if (itemsElement) {
        itemsElement.innerHTML =
            currentCartItems.length > 0
                ? currentCartItems
                    .map((item) => {
                        const quantity =
                            Math.max(
                                1,
                                Number(item.quantity) || 1
                            );

                        return `
                            <div class="checkout-summary-item">
                                <span>
                                    ${quantity}×
                                    ${escapeHtml(
                                        item.product_name ||
                                        "Item"
                                    )}
                                </span>

                                <strong>
                                    ${formatPrice(
                                        item.subtotal || 0
                                    )}
                                </strong>
                            </div>
                        `;
                    })
                    .join("")
                : `
                    <p class="checkout-summary-empty">
                        Your cart is empty.
                    </p>
                `;
    }

    const subtotal =
        Number(cartPricing.subtotal || 0);

    const deliveryFee =
        cartPricing.selectedOrderType ===
        "delivery"
            ? Number(
                cartPricing.deliveryFee || 0
            )
            : 0;

    const total =
        subtotal + deliveryFee;

    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(subtotal);
    }

    if (deliveryFeeElement) {
        deliveryFeeElement.textContent =
            formatPrice(deliveryFee);
    }

    if (totalElement) {
        totalElement.textContent =
            formatPrice(total);
    }
}

async function readJsonResponse(response) {
    const raw = await response.text();

    try {
        return JSON.parse(raw);
    } catch {
        console.error(
            "Invalid server response:",
            raw
        );

        throw new Error(
            "Something went wrong. Please try again."
        );
    }
}

function showCartNotice(
    message = "",
    type = ""
) {
    const notice =
        document.getElementById("cartNotice");

    if (!notice) {
        return;
    }

    notice.textContent = message;

    notice.classList.remove(
        "error",
        "success",
        "info"
    );

    if (message && type) {
        notice.classList.add(type);
    }
}

function showCheckoutMessage(
    message = "",
    type = ""
) {
    const messageElement =
        document.getElementById("checkoutMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;

    messageElement.classList.remove(
        "error",
        "success",
        "info"
    );

    if (message && type) {
        messageElement.classList.add(type);
    }
}

function setCartActionState(
    enabled
) {
    const clearButton =
        document.getElementById("clearCartBtn");

    const checkoutButton =
        document.getElementById("checkoutBtn");

    if (clearButton) {
        clearButton.disabled = !enabled;
    }

    if (checkoutButton) {
        checkoutButton.disabled = !enabled;
    }
}

function updateCartBadge(totalItems) {
    const badge =
        document.getElementById("cartItemBadge");

    if (!badge) {
        return;
    }

    const total =
        Number(totalItems || 0);

    badge.textContent =
        `${total} item${total === 1 ? "" : "s"}`;
}

function updateTotals(
    totalItems = 0
) {
    const totalItemsElement =
        document.getElementById(
            "totalItems"
        );

const cartTabCount =
    document.getElementById(
        "cartTabCount"
    );

    const subtotalElement =
        document.getElementById(
            "subtotalPrice"
        );

    const promotionSavingsSummary =
    document.getElementById(
        "promotionSavingsSummary"
    );

const promotionSavingsElement =
    document.getElementById(
        "promotionSavingsPrice"
    );

const deliveryFeeElement =
    document.getElementById(
        "deliveryFeePrice"
    );

const totalPriceElement =
    document.getElementById(
        "totalPrice"
    );

    const subtotal =
        Number(
            cartPricing.subtotal || 0
        );

    const promotionSavings =
    Number(
        cartPricing.promotionSavings || 0
    );

const restaurantDeliveryFee =
    Number(
        cartPricing.deliveryFee || 0
    );

    const appliedDeliveryFee =
        cartPricing.selectedOrderType ===
        "delivery"
            ? restaurantDeliveryFee
            : 0;

    const grandTotal =
        subtotal +
        appliedDeliveryFee;

    if (totalItemsElement) {
        totalItemsElement.textContent =
            String(
                Number(totalItems || 0)
            );
    }

    if (cartTabCount) {
    cartTabCount.textContent =
        String(
            Number(totalItems || 0)
        );
}

    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(subtotal);
    }

    if (promotionSavingsSummary) {
    promotionSavingsSummary.hidden =
        promotionSavings <= 0;
}

if (promotionSavingsElement) {
    promotionSavingsElement.textContent =
        `−${formatPrice(
            promotionSavings
        )}`;
}

    if (deliveryFeeElement) {
        deliveryFeeElement.textContent =
            formatPrice(
                appliedDeliveryFee
            );
    }

    if (totalPriceElement) {
        totalPriceElement.textContent =
            formatPrice(grandTotal);
    }

    updateCartBadge(totalItems);

    if (
        currentCartRestaurant &&
        Number(totalItems || 0) > 0
    ) {
        renderCartRestaurantSummary(
            currentCartRestaurant,
            totalItems
        );
    } else if (
        Number(totalItems || 0) <= 0
    ) {
        hideCartRestaurantSummary();
    }

    renderCheckoutSummary();
}

function resetCartPricing() {
    cartPricing = {
        subtotal: 0,
        promotionSavings: 0,
        deliveryFee: 0,
        selectedOrderType: ""
    };
}

function getBackPage() {
    const storedPage =
        localStorage.getItem("lastPage") ||
        "/";

    try {
        const target =
            new URL(
                storedPage,
                window.location.origin
            );

        const path =
            target.pathname
                .replace(/\/+$/, "")
                .toLowerCase();

        /*
         * Old local/deployment homepage paths must never
         * be restored by the Cart "Back to Menu" button.
         */
        if (
            path === "/frontend/html/index.html" ||
            path === "/foodconnect/frontend/html/index.html" ||
            path === "/foodconnect"
        ) {
            return "/";
        }

        if (
            target.origin !==
            window.location.origin
        ) {
            return "/";
        }

        return (
            target.pathname +
            target.search +
            target.hash
        );
    } catch (_) {
        return "/";
    }
}

function goBackToMenu() {
    window.location.href =
        getBackPage();
}

/* =========================================================
   CART STATES
   ========================================================= */

function renderLoginRequired(message) {
    const container =
        document.getElementById("cartItems");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-cart">

            <span class="empty-cart-icon">
                <i class="fa-solid fa-lock"></i>
            </span>

            <h3>
                Log in to view your cart
            </h3>

            <p>
                ${escapeHtml(
                    message ||
                    "Sign in to access your saved cart and continue ordering."
                )}
            </p>

            <div class="empty-cart-actions">

                <a
                    href="/frontend/html/login.html"
                    class="empty-primary-button"
                >
                    <i class="fa-solid fa-right-to-bracket"></i>
                    Log In
                </a>

                <a
                    href="/frontend/html/signup.html"
                    class="empty-secondary-button"
                >
                    Create Account
                </a>

            </div>

        </div>
    `;
}

function renderEmptyCart() {
    const container =
        document.getElementById("cartItems");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-cart">

            <span class="empty-cart-icon">
                <i class="fa-solid fa-basket-shopping"></i>
            </span>

            <h3>
                Your cart is empty
            </h3>

            <p>
                Browse FoodConnect partner restaurants
                and add your favorite meals.
            </p>

            <div class="empty-cart-actions">

                <a
                    href="/#restaurants"
                    class="empty-primary-button"
                >
                    <i class="fa-solid fa-store"></i>
                    Browse Restaurants
                </a>

            </div>

        </div>
    `;
}

function renderLoadError() {
    const container =
        document.getElementById("cartItems");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-cart">

            <span class="empty-cart-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </span>

            <h3>
                Unable to load your cart
            </h3>

            <p>
                Check your connection and make sure
                Apache and MySQL are running.
            </p>

            <div class="empty-cart-actions">

                <button
                    type="button"
                    class="empty-primary-button"
                    onclick="loadCart()"
                >
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>

            </div>

        </div>
    `;
}

/* =========================================================
   LOAD CART
   ========================================================= */

function applyRestaurantOrderTypes(orderTypes) {
    const orderTypeSelect =
        document.getElementById("orderType");

    if (!orderTypeSelect) {
        return;
    }

    const allowedValues = [
        "dine-in",
        "takeout",
        "delivery"
    ];

    const normalizedTypes = Array.isArray(orderTypes)
        ? [
            ...new Set(
                orderTypes.filter(
                    (value) =>
                        allowedValues.includes(value)
                )
            )
        ]
        : allowedValues;

    const effectiveTypes =
        normalizedTypes.length > 0
            ? normalizedTypes
            : allowedValues;

    const labels = {
        "dine-in": "Dine-in",
        "takeout": "Takeout",
        "delivery": "Delivery"
    };

    const previousValue =
        orderTypeSelect.value;

    orderTypeSelect.innerHTML = `
        <option value="">
            Select order type
        </option>
        ${effectiveTypes
            .map(
                (value) => `
                    <option value="${value}">
                        ${labels[value]}
                    </option>
                `
            )
            .join("")}
    `;

    if (
        effectiveTypes.includes(
            previousValue
        )
    ) {
        orderTypeSelect.value =
            previousValue;
    } else {
        orderTypeSelect.value = "";
        resetDeliveryAvailability();
    }

    updateOrderTypeFields();
}

async function loadCart() {
    const cartItemsContainer =
        document.getElementById("cartItems");

    const checkoutSection =
        document.getElementById("checkoutSection");

    if (!cartItemsContainer) {
        return;
    }

    showCartNotice();

    cartItemsContainer.innerHTML = `
        <div class="cart-loading">

            <span class="loading-spinner"></span>

            <p>
                Loading your cart...
            </p>

        </div>
    `;

    setCartActionState(false);
    resetCartPricing();
    updateTotals(0);

    try {
        const response = await fetch(
            `${API}/cart_get.php`,
            {
                credentials: "include"
            }
        );

        const data =
            await readJsonResponse(response);

        if (!response.ok || !data.success) {
            currentCartItems = [];
            currentCartRestaurant = null;
            hideCartRestaurantSummary();
            renderCheckoutSummary();

            renderLoginRequired(
                data.message ||
                "Please log in first."
            );

            if (checkoutSection) {
                checkoutSection.style.display =
                    "none";
            }

            return;
        }

        if (
            !Array.isArray(data.items) ||
            data.items.length === 0
        ) {
            currentCartItems = [];
            currentCartRestaurant = null;
            hideCartRestaurantSummary();
            renderCheckoutSummary();
            renderEmptyCart();

            if (checkoutSection) {
                checkoutSection.style.display =
                    "none";
            }

            return;
        }

        currentCartItems =
            data.items.map(item => ({
                ...item
            }));

        currentCartRestaurant =
            data.restaurant ||
            (
                data.restaurant_id
                    ? {
                        restaurant_id:
                            Number(
                                data.restaurant_id
                            ),
                        name:
                            data.restaurant_name ||
                            "Restaurant",
                        logo_path:
                            data.restaurant_logo ||
                            ""
                    }
                    : null
            );

        renderCartRestaurantSummary(
            currentCartRestaurant,
            data.total_items
        );

        cartItemsContainer.innerHTML =
            currentCartItems
                .map(renderCartItem)
                .join("");
        cartPricing.subtotal =
    Number(
        data.subtotal ??
        data.total_price ??
        0
    );

cartPricing.promotionSavings =
    Number(
        data.total_discount_savings ??
        0
    );

cartPricing.deliveryFee =
    Number(
        data.delivery_fee ?? 0
    );

applyRestaurantOrderTypes(
    data.order_types
);

cartPricing.selectedOrderType =
    document
        .getElementById("orderType")
        ?.value || "";

updateTotals(
    data.total_items
);

       setCartActionState(true);

if (data.prices_updated === true) {
    showCartNotice(
        "Your cart prices were updated using the latest available promotions.",
        "info"
    );
}

if (checkoutSection) {
            checkoutSection.style.display =
                "none";
        }
    } catch (error) {
        console.error(
            "Load cart error:",
            error
        );

        currentCartRestaurant = null;
        hideCartRestaurantSummary();
        renderCheckoutSummary();
        renderLoadError();

        showCartNotice(
            error.message ||
            "Unable to connect. Please check your connection and try again.",
            "error"
        );
    }
}

function renderCartItem(item) {
    const cartId =
        Number(item.cart_id);

    const quantity =
        Number(item.quantity);

    const subtotal =
        Number(item.subtotal);

    const regularBasePrice =
    Number(
        item.regular_base_price ??
        item.base_price ??
        0
    );

const basePrice =
    Number(
        item.final_base_price ??
        item.base_price ??
        regularBasePrice
    );

const discountSavings =
    Number(
        item.discount_savings ?? 0
    );

const discountLabel =
    String(
        item.discount_label || ""
    ).trim();

const isDiscountActive =
    item.is_discount_active === true ||
    item.is_discount_active === 1 ||
    String(
        item.is_discount_active
    ).trim() === "1";

const hasActivePromotion =
    isDiscountActive &&
    basePrice < regularBasePrice &&
    discountSavings > 0;

const addonTotal =
    Number(item.addon_total);

    const comboChoiceText =
        String(
            item.combo_choice_text || ""
        ).trim();

    const baseText =
        String(
            item.variant_text || ""
        ).trim();

    const imageSource =
        item.image_url ||
        item.product_image ||
        item.image ||
        "https://via.placeholder.com/300x200?text=FoodConnect";

    const addons =
        Array.isArray(item.addons)
            ? item.addons
            : [];

    const metaItems = [];

    if (comboChoiceText) {
        metaItems.push(
            `<span>
                Drink: ${escapeHtml(comboChoiceText)}
            </span>`
        );
    } else if (
        baseText &&
        baseText.toLowerCase() !== "default"
    ) {
        metaItems.push(
            `<span>
                Size: ${escapeHtml(baseText)}
            </span>`
        );
    }

    const addonMarkup =
        addons.length > 0
            ? addons
                .map((addon) => `
                    <div class="cart-addon-line">

                        <span>
                            ${escapeHtml(addon.name)}
                        </span>

                        <span>
                            +${formatPrice(addon.price)}
                        </span>

                    </div>
                `)
                .join("")
            : `
                <div class="cart-addon-line">

                    <span>
                        No add-ons selected
                    </span>

                </div>
            `;

    return `
        <article
            class="cart-item"
            data-cart-id="${cartId}"
        >

           <div class="cart-item-image">

    ${
        hasActivePromotion &&
        discountLabel
            ? `
                <span class="cart-image-promo-badge">
                    ${escapeHtml(
                        discountLabel
                    )}
                </span>
            `
            : ""
    }

    <img
                    src="${escapeHtml(imageSource)}"
                    alt="${escapeHtml(item.product_name)}"
                    loading="lazy"
                    onerror="
                        this.src='https://via.placeholder.com/300x200?text=FoodConnect'
                    "
                >

            </div>

            <div class="cart-info">

                <div class="cart-product-heading">
    <h3>
        ${escapeHtml(
            item.product_name
        )}
    </h3>

    ${
        hasActivePromotion &&
        discountLabel
            ? `
                <span class="cart-promo-badge">
                    <span
                        class="cart-promo-dot"
                        aria-hidden="true"
                    ></span>

                    ${escapeHtml(
                        discountLabel
                    )}
                </span>
            `
            : ""
    }
</div>

                ${
                    metaItems.length
                        ? `
                            <div class="cart-meta">
                                ${metaItems.join("")}
                            </div>
                        `
                        : ""
                }

                <div class="cart-price-breakdown">

                   ${
    hasActivePromotion
        ? `
            <div class="cart-promotion-pricing">
                <div class="cart-promo-current-price">
                    <span>
                        Promo price
                    </span>

                    <strong>
                        ${formatPrice(
                            basePrice
                        )}
                    </strong>
                </div>

                <div class="cart-promo-regular-price">
                    <span>
                        Regular price
                    </span>

                    <del>
                        ${formatPrice(
                            regularBasePrice
                        )}
                    </del>
                </div>

                <small class="cart-promo-savings">
                    You save
                    ${formatPrice(
                        discountSavings
                    )}
                    per item
                </small>
            </div>
        `
        : `
            <p>
                <span>
                    Base price
                </span>

                <strong>
                    ${formatPrice(
                        basePrice
                    )}
                </strong>
            </p>
        `
}

                    ${
                        addonTotal > 0
                            ? `
                                <p>
                                    <span>
                                        Add-on total
                                    </span>

                                    <strong>
                                        ${formatPrice(addonTotal)}
                                    </strong>
                                </p>
                            `
                            : ""
                    }


                </div>

                <div class="cart-addons">

                    <strong>
                        Add-ons
                    </strong>

                    ${addonMarkup}

                </div>

            </div>

            <div class="cart-right">

                <div class="item-price">
                    ${formatPrice(subtotal)}
                </div>

                <div class="qty-controls">

                    <button
                        class="qty-btn"
                        type="button"
                        aria-label="Decrease quantity"
                        onclick="changeQty(
                            ${cartId},
                            ${quantity - 1}
                        )"
                    >
                        −
                    </button>

                    <input
                        type="number"
                        class="qty-number"
                        value="${quantity}"
                        min="1"
                        max="99"
                        inputmode="numeric"
                        aria-label="Product quantity"
                        onkeydown="
                            handleQtyKey(
                                event,
                                ${cartId},
                                this
                            )
                        "
                        onblur="
                            handleQtyInput(
                                ${cartId},
                                this.value
                            )
                        "
                    >

                    <button
                        class="qty-btn"
                        type="button"
                        aria-label="Increase quantity"
                        onclick="changeQty(
                            ${cartId},
                            ${quantity + 1}
                        )"
                    >
                        +
                    </button>

                </div>

                <button
                    class="remove-btn"
                    type="button"
                    onclick="removeItem(${cartId})"
                >
                    <i class="fa-regular fa-trash-can"></i>
                    Remove
                </button>

            </div>

        </article>
    `;
}

/* =========================================================
   FAST LOCAL CART UPDATES
   ========================================================= */

function getLocalCartItem(cartId) {
    const numericId =
        Number(cartId);

    return currentCartItems.find(
        item =>
            Number(item.cart_id) ===
            numericId
    ) || null;
}

function getLocalCartTotalItems() {
    return currentCartItems.reduce(
        (sum, item) =>
            sum +
            Math.max(
                0,
                Number(item.quantity) || 0
            ),
        0
    );
}

function updateCartItemDomQuantity(
    cartId,
    quantity
) {
    const itemElement =
        document.querySelector(
            `.cart-item[data-cart-id="${Number(cartId)}"]`
        );

    if (!itemElement) {
        return;
    }

    const item =
        getLocalCartItem(cartId);

    if (!item) {
        return;
    }

    const input =
        itemElement.querySelector(
            ".qty-number"
        );

    const buttons =
        itemElement.querySelectorAll(
            ".qty-btn"
        );

    const itemPrice =
        itemElement.querySelector(
            ".item-price"
        );

    if (input) {
        input.value =
            String(quantity);
    }

    const unitSubtotal =
        Number(
            item.__unitSubtotal ??
            (
                Number(item.subtotal || 0) /
                Math.max(
                    1,
                    Number(item.__previousQuantity || item.quantity || 1)
                )
            )
        ) || 0;

    item.__unitSubtotal =
        unitSubtotal;

    const nextSubtotal =
        unitSubtotal *
        quantity;

    item.subtotal =
        nextSubtotal;

    if (itemPrice) {
        itemPrice.textContent =
            formatPrice(
                nextSubtotal
            );
    }

    if (buttons.length >= 2) {
        buttons[0].setAttribute(
            "onclick",
            `changeQty(${Number(cartId)}, ${quantity - 1})`
        );

        buttons[1].setAttribute(
            "onclick",
            `changeQty(${Number(cartId)}, ${quantity + 1})`
        );
    }
}

function applyLocalQuantity(
    cartId,
    newQuantity
) {
    const item =
        getLocalCartItem(cartId);

    if (!item) {
        return false;
    }

    const previousQuantity =
        Math.max(
            1,
            Number(item.quantity) || 1
        );

    if (
        previousQuantity ===
        newQuantity
    ) {
        return true;
    }

    const previousSubtotal =
        Number(item.subtotal || 0);

    const unitSubtotal =
        Number(
            item.__unitSubtotal ??
            (
                previousSubtotal /
                previousQuantity
            )
        ) || 0;

    const discountPerItem =
        Number(
            item.discount_savings || 0
        ) || 0;

    item.__unitSubtotal =
        unitSubtotal;

    const nextSubtotal =
        unitSubtotal *
        newQuantity;

    item.__previousQuantity =
        previousQuantity;

    item.quantity =
        newQuantity;

    item.subtotal =
        nextSubtotal;

    cartPricing.subtotal =
        Math.max(
            0,
            Number(cartPricing.subtotal || 0) -
            previousSubtotal +
            nextSubtotal
        );

    cartPricing.promotionSavings =
        Math.max(
            0,
            Number(
                cartPricing.promotionSavings ||
                0
            ) +
            (
                newQuantity -
                previousQuantity
            ) *
            discountPerItem
        );

    updateCartItemDomQuantity(
        cartId,
        newQuantity
    );

    updateTotals(
        getLocalCartTotalItems()
    );

    return true;
}

function applyLocalRemove(cartId) {
    const numericId =
        Number(cartId);

    const itemIndex =
        currentCartItems.findIndex(
            item =>
                Number(item.cart_id) ===
                numericId
        );

    if (itemIndex < 0) {
        return false;
    }

    const item =
        currentCartItems[
            itemIndex
        ];

    const quantity =
        Math.max(
            1,
            Number(item.quantity) || 1
        );

    cartPricing.subtotal =
        Math.max(
            0,
            Number(cartPricing.subtotal || 0) -
            Number(item.subtotal || 0)
        );

    cartPricing.promotionSavings =
        Math.max(
            0,
            Number(
                cartPricing.promotionSavings ||
                0
            ) -
            (
                Number(
                    item.discount_savings ||
                    0
                ) *
                quantity
            )
        );

    currentCartItems.splice(
        itemIndex,
        1
    );

    document
        .querySelector(
            `.cart-item[data-cart-id="${numericId}"]`
        )
        ?.remove();

    const totalItems =
        getLocalCartTotalItems();

    updateTotals(totalItems);

    if (
        currentCartItems.length ===
        0
    ) {
        currentCartRestaurant = null;
        hideCartRestaurantSummary();
        renderCheckoutSummary();
        renderEmptyCart();

        const checkoutSection =
            document.getElementById(
                "checkoutSection"
            );

        if (checkoutSection) {
            checkoutSection.style.display =
                "none";
        }
    }

    return true;
}

/* =========================================================
   DEBOUNCED SERVER QUANTITY SYNC
   ========================================================= */

function getCartQuantitySyncState(cartId) {
    const numericId =
        Number(cartId);

    if (
        !cartQuantitySyncStates.has(
            numericId
        )
    ) {
        cartQuantitySyncStates.set(
            numericId,
            {
                timer: null,
                inFlight: false,
                promise: null,
                lastSentQuantity: null
            }
        );
    }

    return cartQuantitySyncStates.get(
        numericId
    );
}

function clearCartQuantitySyncTimer(
    cartId
) {
    const state =
        cartQuantitySyncStates.get(
            Number(cartId)
        );

    if (!state?.timer) {
        return;
    }

    window.clearTimeout(
        state.timer
    );

    state.timer = null;
}

async function sendLatestCartQuantity(
    cartId
) {
    const numericId =
        Number(cartId);

    const state =
        getCartQuantitySyncState(
            numericId
        );

    if (state.inFlight) {
        return state.promise;
    }

    const item =
        getLocalCartItem(
            numericId
        );

    if (!item) {
        cartQuantitySyncStates.delete(
            numericId
        );

        return;
    }

    const quantity =
        Math.max(
            1,
            Math.min(
                99,
                Number(item.quantity) || 1
            )
        );

    /*
     * The latest quantity is already on the server.
     */
    if (
        state.lastSentQuantity ===
        quantity
    ) {
        return;
    }

    state.inFlight = true;
    state.lastSentQuantity =
        quantity;

    state.promise = (async () => {
        try {
            const response =
                await fetch(
                    `${API}/cart_update.php`,
                    {
                        method: "POST",
                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            cart_id:
                                numericId,

                            quantity:
                                quantity
                        })
                    }
                );

            const data =
                await readJsonResponse(
                    response
                );

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to update the quantity. Please try again."
                );
            }

            const latestItem =
                getLocalCartItem(
                    numericId
                );

            const latestQuantity =
                Number(
                    latestItem?.quantity ||
                    quantity
                );

            if (
                latestQuantity ===
                quantity
            ) {
                showCartNotice(
                    "Cart quantity updated.",
                    "success"
                );
            }

        } catch (error) {
            console.error(
                "Quantity sync error:",
                error
            );

            showCartNotice(
                error.message ||
                "Unable to update quantity.",
                "error"
            );

            /*
             * Server stays authoritative on any failed mutation.
             */
            await loadCart();

        } finally {
            state.inFlight = false;
            state.promise = null;

            const latestItem =
                getLocalCartItem(
                    numericId
                );

            const latestQuantity =
                Number(
                    latestItem?.quantity ||
                    0
                );

            /*
             * If the owner/customer clicked again while the request
             * was in flight, send only the newest final quantity.
             */
            if (
                latestItem &&
                latestQuantity !==
                state.lastSentQuantity
            ) {
                state.timer =
                    window.setTimeout(
                        () => {
                            state.timer =
                                null;

                            void sendLatestCartQuantity(
                                numericId
                            );
                        },
                        120
                    );
            }
        }
    })();

    return state.promise;
}

function scheduleCartQuantitySync(
    cartId
) {
    const numericId =
        Number(cartId);

    const state =
        getCartQuantitySyncState(
            numericId
        );

    clearCartQuantitySyncTimer(
        numericId
    );

    state.timer =
        window.setTimeout(
            () => {
                state.timer = null;

                void sendLatestCartQuantity(
                    numericId
                );
            },
            CART_QUANTITY_DEBOUNCE_MS
        );
}

async function settleCartQuantitySync(
    cartId
) {
    const numericId =
        Number(cartId);

    const state =
        cartQuantitySyncStates.get(
            numericId
        );

    if (!state) {
        return;
    }

    clearCartQuantitySyncTimer(
        numericId
    );

    if (state.inFlight && state.promise) {
        try {
            await state.promise;
        } catch (_) {
            // sendLatestCartQuantity handles recovery.
        }
    }
}

/* =========================================================
   QUANTITY
   ========================================================= */

function handleQtyKey(
    event,
    cartId,
    input
) {
    if (event.key === "Enter") {
        handleQtyInput(
            cartId,
            input.value
        );

        input.blur();
    }
}

async function handleQtyInput(
    cartId,
    value
) {
    const newQuantity =
        Number.parseInt(value, 10);

    if (
        !Number.isInteger(newQuantity) ||
        newQuantity < 1 ||
        newQuantity > 99
    ) {
        showCartNotice(
            "Quantity must be between 1 and 99.",
            "error"
        );

        await loadCart();
        return;
    }

    await changeQty(
        cartId,
        newQuantity
    );
}

async function changeQty(
    cartId,
    newQuantity
) {
    if (newQuantity < 1) {
        await removeItem(cartId);
        return;
    }

    if (newQuantity > 99) {
        showCartNotice(
            "Maximum quantity is 99.",
            "error"
        );

        return;
    }

    /*
     * Update visible quantity/price instantly.
     */
    const changed =
        applyLocalQuantity(
            cartId,
            newQuantity
        );

    if (!changed) {
        await loadCart();
        return;
    }

    showCartNotice(
        "Saving quantity...",
        "info"
    );

    /*
     * Do NOT send one cloud request per click.
     * Wait briefly, then send only the latest quantity.
     */
    scheduleCartQuantitySync(
        cartId
    );
}

/* =========================================================
   REMOVE ITEM
   ========================================================= */

async function removeItem(cartId) {
    const confirmed =
        window.confirm(
            "Remove this item from your cart?"
        );

    if (!confirmed) {
        return;
    }

    /*
     * Cancel any not-yet-sent quantity update for this item.
     * If one update is already in flight, let it finish before the
     * remove request so server-side mutation order stays predictable.
     */
    const pendingSync =
        settleCartQuantitySync(
            cartId
        );

    /*
     * Remove immediately from the visible cart.
     * If the server rejects it, loadCart() restores the item.
     */
    applyLocalRemove(cartId);

    showCartNotice(
        "Removing item...",
        "info"
    );

    try {
        await pendingSync;

        cartQuantitySyncStates.delete(
            Number(cartId)
        );

        const response = await fetch(
            `${API}/cart_remove.php`,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    cart_id: cartId
                })
            }
        );

        const data =
            await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to remove this item. Please try again."
            );
        }

        showCartNotice(
            "Item removed from your cart.",
            "success"
        );
    } catch (error) {
        console.error(
            "Remove item error:",
            error
        );

        showCartNotice(
            error.message ||
            "Unable to remove item.",
            "error"
        );

        await loadCart();
    }
}

function resetDeliveryAvailability() {
    deliveryAvailability = {
        checked: false,
        available: false,
        checking: false,
        availableRiderCount: 0
    };
}

function setPlaceOrderAvailability() {
    const orderType =
        document.getElementById("orderType");

    const placeOrderButton =
        document.getElementById(
            "placeOrderBtn"
        );

    if (!placeOrderButton) {
        return;
    }

    const type =
        orderType?.value || "";

    if (isPlacingOrder) {
        placeOrderButton.disabled = true;
        return;
    }

    if (type !== "delivery") {
        placeOrderButton.disabled = false;
        return;
    }

    placeOrderButton.disabled =
        deliveryAvailability.checking ||
        !deliveryAvailability.checked ||
        !deliveryAvailability.available;
}

async function checkDeliveryAvailability() {
    const orderType =
        document.getElementById("orderType");

    if (
        !orderType ||
        orderType.value !== "delivery"
    ) {
        resetDeliveryAvailability();
        setPlaceOrderAvailability();
        return;
    }

    deliveryAvailability.checked = false;
    deliveryAvailability.available = false;
    deliveryAvailability.checking = true;
    deliveryAvailability.availableRiderCount = 0;

    setPlaceOrderAvailability();

    showCheckoutMessage(
        "Checking delivery rider availability...",
        "info"
    );

    try {
        const response = await fetch(
            `${API}/check_delivery_availability.php`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        const data =
            await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to check delivery availability."
            );
        }

        deliveryAvailability.checked = true;

        deliveryAvailability.available =
            data.delivery_available === true;

        deliveryAvailability.availableRiderCount =
            Number(
                data.available_rider_count || 0
            );

        if (!deliveryAvailability.available) {
            showCheckoutMessage(
                "No delivery rider is currently available for this restaurant. Please try again later.",
                "error"
            );

            return;
        }

        const riderCount =
            deliveryAvailability
                .availableRiderCount;

        showCheckoutMessage(
            `${riderCount} delivery rider${
                riderCount === 1 ? "" : "s"
            } currently available.`,
            "success"
        );

    } catch (error) {
        console.error(
            "Delivery availability error:",
            error
        );

        deliveryAvailability.checked = true;
        deliveryAvailability.available = false;
        deliveryAvailability.availableRiderCount = 0;

        showCheckoutMessage(
            error.message ||
            "Unable to check delivery availability.",
            "error"
        );

    } finally {
        deliveryAvailability.checking = false;
        setPlaceOrderAvailability();
    }
}

/* =========================================================
   CUSTOMER DELIVERY LOCATION PICKER
   ========================================================= */

function resetSelectedDeliveryLocation() {
    selectedDeliveryLocation = {
        latitude: null,
        longitude: null
    };

    if (deliveryLocationMap) {
        deliveryLocationMap.remove();
        deliveryLocationMap = null;
    }

    deliveryLocationMarker = null;
}

function updateDeliveryCoordinateDisplay(
    latitude,
    longitude
) {
    const locationStatus =
        document.getElementById(
            "deliveryLocationStatus"
        );

    if (!locationStatus) {
        return;
    }

    locationStatus.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        <span>
            Delivery location selected:
            <strong>
                ${latitude.toFixed(6)},
                ${longitude.toFixed(6)}
            </strong>
        </span>
    `;

    locationStatus.classList.add(
        "location-selected"
    );
}

function setDeliveryLocation(
    latitude,
    longitude
) {
    const parsedLatitude =
        Number(latitude);

    const parsedLongitude =
        Number(longitude);

    if (
        !Number.isFinite(parsedLatitude) ||
        !Number.isFinite(parsedLongitude)
    ) {
        return;
    }

    selectedDeliveryLocation = {
        latitude: parsedLatitude,
        longitude: parsedLongitude
    };

    const markerPosition = [
        parsedLatitude,
        parsedLongitude
    ];

  if (!deliveryLocationMarker) {
    deliveryLocationMarker =
        L.marker(
            markerPosition,
            {
                draggable: true,
                title: "Drag to adjust delivery location"
            }
        )
            .addTo(deliveryLocationMap);

    deliveryLocationMarker.on(
        "dragend",
        (event) => {
            const newPosition =
                event.target.getLatLng();

            selectedDeliveryLocation = {
                latitude: newPosition.lat,
                longitude: newPosition.lng
            };

            updateDeliveryCoordinateDisplay(
                newPosition.lat,
                newPosition.lng
            );
        }
    );
} else {
    deliveryLocationMarker.setLatLng(
        markerPosition
    );
}

    deliveryLocationMap.setView(
        markerPosition,
        17
    );

    updateDeliveryCoordinateDisplay(
        parsedLatitude,
        parsedLongitude
    );
}

async function reverseGeocodeDeliveryLocation(
    latitude,
    longitude
) {
    const response = await fetch(
        `${API}/reverse_geocode_delivery_location.php`,
        {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                latitude,
                longitude
            })
        }
    );

    const data =
        await readJsonResponse(
            response
        );

    if (
        !response.ok ||
        !data.success
    ) {
        throw new Error(
            data.message ||
            "Unable to identify your current address."
        );
    }

    return data;
}

function useCustomerCurrentLocation() {
    if (!navigator.geolocation) {
        showCheckoutMessage(
            "Your browser does not support location services.",
            "error"
        );

        return;
    }

    const locationButton =
        document.getElementById(
            "useCurrentLocationButton"
        );

    const addressInput =
        document.getElementById(
            "address"
        );

    const originalButtonContent =
        locationButton?.innerHTML || "";

    const restoreLocationButton = () => {
        if (!locationButton) {
            return;
        }

        locationButton.disabled = false;
        locationButton.innerHTML =
            originalButtonContent;
    };

    if (locationButton) {
        locationButton.disabled = true;

        locationButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Detecting your location...
        `;
    }

    setDeliveryAddressSearchMessage(
        "Detecting your current location...",
        "info"
    );

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude =
                Number(
                    position.coords.latitude
                );

            const longitude =
                Number(
                    position.coords.longitude
                );

            /*
             * Place the marker immediately using the
             * phone's actual GPS coordinates.
             */
            setDeliveryLocation(
                latitude,
                longitude
            );

            if (locationButton) {
                locationButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Finding your address...
                `;
            }

            setDeliveryAddressSearchMessage(
                "Your location was found. Identifying the written address...",
                "info"
            );

            try {
                const data =
                    await reverseGeocodeDeliveryLocation(
                        latitude,
                        longitude
                    );

                const location =
                    data.location &&
                    typeof data.location ===
                        "object"
                        ? data.location
                        : {};

                const formattedAddress =
                    String(
                        location.display_name ||
                        ""
                    ).trim();

                if (
                    data.address_found &&
                    formattedAddress !== ""
                ) {
                    let structuredResult = null;

                    if (
                        window.PHAddressDropdown &&
                        typeof window
                            .PHAddressDropdown
                            .setEnhancedValues ===
                            "function"
                    ) {
                        structuredResult =
                            await window
                                .PHAddressDropdown
                                .setEnhancedValues(
                                    addressInput,
                                    {
                                        /*
                                         * Defensive Philippine mapping:
                                         * if Geoapify repeats the city as
                                         * "province", use region/state instead.
                                         */
                                        provinceName:
                                            (
                                                String(
                                                    location.province || ""
                                                )
                                                    .trim()
                                                    .toLowerCase() ===
                                                String(
                                                    location.city || ""
                                                )
                                                    .trim()
                                                    .toLowerCase()
                                            )
                                                ? (
                                                    location.region ||
                                                    location.province_county ||
                                                    location.province ||
                                                    ""
                                                )
                                                : (
                                                    location.province ||
                                                    location.region ||
                                                    location.province_county ||
                                                    ""
                                                ),
                                        cityName:
                                            location.city ||
                                            "",
                                        barangayName:
                                            location.barangay ||
                                            "",
                                        streetDetails:
                                            location.street_details ||
                                            location.road ||
                                            ""
                                    }
                                );
                    } else if (addressInput) {
                        /*
                         * Compatibility fallback only.
                         * The structured Philippine address helper should
                         * normally handle this branch.
                         */
                        addressInput.value =
                            formattedAddress;

                        addressInput.dispatchEvent(
                            new Event(
                                "input",
                                {
                                    bubbles: true
                                }
                            )
                        );

                        addressInput.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles: true
                                }
                            )
                        );
                    }

                    clearDeliveryAddressResults();

                    if (
                        structuredResult &&
                        structuredResult.areaMatched &&
                        structuredResult.localityMatched &&
                        !structuredResult.barangayMatched
                    ) {
                        setDeliveryAddressSearchMessage(
                            "Current location found. Province and city were filled automatically; please select the correct barangay.",
                            "info"
                        );

                        showCheckoutMessage(
                            "Location detected. Please select your barangay to complete the delivery address.",
                            "success"
                        );
                    } else if (
                        structuredResult &&
                        structuredResult.success
                    ) {
                        setDeliveryAddressSearchMessage(
                            "Your current location and Philippine address fields were filled automatically.",
                            "success"
                        );

                        showCheckoutMessage(
                            "Your current location and address were selected successfully.",
                            "success"
                        );
                    } else {
                        setDeliveryAddressSearchMessage(
                            "Your current location was found. Please check the address fields and complete anything that could not be matched.",
                            "info"
                        );

                        showCheckoutMessage(
                            "Your current location was selected. Please review the delivery address.",
                            "success"
                        );
                    }
                } else {
                    setDeliveryAddressSearchMessage(
                        "Your location was selected, but no written address was found. Please enter your address or landmark manually.",
                        "info"
                    );

                    showCheckoutMessage(
                        "Your current location was placed on the map. Please enter the written address manually.",
                        "success"
                    );
                }
            } catch (error) {
                console.error(
                    "Reverse geocoding error:",
                    error
                );

                /*
                 * Do not remove the GPS marker.
                 * The exact coordinates are still valid.
                 */
                setDeliveryAddressSearchMessage(
                    "Your location was selected, but the written address could not be loaded. Please type the address manually.",
                    "error"
                );

                showCheckoutMessage(
                    "Your current location was placed on the map. Please type the written address manually.",
                    "success"
                );
            } finally {
                restoreLocationButton();
            }
        },

        (error) => {
            console.error(
                "Unable to get customer location:",
                error
            );

            let message =
                "Unable to detect your location. Please tap the correct destination on the map.";

            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {
                message =
                    "Location permission was denied. Please allow location access or tap the destination manually on the map.";
            } else if (
                error.code ===
                error.POSITION_UNAVAILABLE
            ) {
                message =
                    "Your location is currently unavailable. Turn on GPS or select the destination manually.";
            } else if (
                error.code ===
                error.TIMEOUT
            ) {
                message =
                    "Location detection took too long. Try again outdoors or select the destination manually.";
            }

            setDeliveryAddressSearchMessage(
                message,
                "error"
            );

            showCheckoutMessage(
                message,
                "error"
            );

            restoreLocationButton();
        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 30000
        }
    );
}

/* =========================================================
   DELIVERY ADDRESS SEARCH
========================================================= */

let deliveryAddressSearchRunning = false;

function setDeliveryAddressSearchMessage(
    message = "",
    type = ""
) {
    const messageElement =
        document.getElementById(
            "deliveryAddressSearchMessage"
        );

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;

    messageElement.classList.remove(
        "error",
        "success",
        "info"
    );

    messageElement.hidden = !message;

    if (message && type) {
        messageElement.classList.add(type);
    }
}

function clearDeliveryAddressResults() {
    const resultsElement =
        document.getElementById(
            "deliveryAddressResults"
        );

    if (!resultsElement) {
        return;
    }

    resultsElement.innerHTML = "";
    resultsElement.hidden = true;
}

function buildDeliveryAddressResultSubtitle(
    location
) {
    const parts = [
        location.road,
        location.barangay,
        location.city,
        location.province
    ]
        .map((part) =>
            String(part || "").trim()
        )
        .filter(Boolean);

    return [...new Set(parts)].join(", ");
}

function selectDeliveryAddressResult(
    location
) {
    const addressInput =
        document.getElementById("address");

    const latitude =
        Number(location.latitude);

    const longitude =
        Number(location.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        setDeliveryAddressSearchMessage(
            "The selected address has invalid map coordinates.",
            "error"
        );

        return;
    }

    if (addressInput) {
        addressInput.value =
            String(
                location.display_name || ""
            ).trim();

        addressInput.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );
    }

    setDeliveryLocation(
        latitude,
        longitude
    );

    clearDeliveryAddressResults();

    setDeliveryAddressSearchMessage(
        "Address selected. Drag the map marker if you need to adjust the exact delivery point.",
        "success"
    );

    document
        .getElementById(
            "deliveryLocationMap"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}

function renderDeliveryAddressResults(
    locations
) {
    const resultsElement =
        document.getElementById(
            "deliveryAddressResults"
        );

    if (!resultsElement) {
        return;
    }

    if (
        !Array.isArray(locations) ||
        locations.length === 0
    ) {
        clearDeliveryAddressResults();

        setDeliveryAddressSearchMessage(
            "No matching address was found. Try a nearby landmark, barangay, street, or a more complete location.",
            "info"
        );

        return;
    }

    resultsElement.innerHTML =
        locations
            .map((location, index) => {
                const displayName =
                    escapeHtml(
                        location.display_name ||
                        "Unnamed location"
                    );

                const subtitle =
                    escapeHtml(
                        buildDeliveryAddressResultSubtitle(
                            location
                        )
                    );

                return `
                    <button
                        type="button"
                        class="delivery-address-result"
                        data-address-result-index="${index}"
                    >
                        <span class="delivery-address-result-icon">
                            <i class="fa-solid fa-location-dot"></i>
                        </span>

                        <span class="delivery-address-result-content">
                            <strong>
                                ${displayName}
                            </strong>

                            ${
                                subtitle
                                    ? `
                                        <small>
                                            ${subtitle}
                                        </small>
                                    `
                                    : ""
                            }
                        </span>

                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                `;
            })
            .join("");

    resultsElement.hidden = false;

    resultsElement
        .querySelectorAll(
            "[data-address-result-index]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const index =
                        Number(
                            button.dataset
                                .addressResultIndex
                        );

                    const selectedLocation =
                        locations[index];

                    if (!selectedLocation) {
                        return;
                    }

                    selectDeliveryAddressResult(
                        selectedLocation
                    );
                }
            );
        });
}

async function searchDeliveryAddress() {
    if (deliveryAddressSearchRunning) {
        return;
    }

    const addressInput =
        document.getElementById("address");

    const searchButton =
        document.getElementById(
            "searchDeliveryAddressButton"
        );

    const query =
        String(
            addressInput?.value || ""
        ).trim();

    if (query.length < 3) {
        setDeliveryAddressSearchMessage(
            "Enter at least 3 characters before searching.",
            "error"
        );

        addressInput?.focus();
        return;
    }

    deliveryAddressSearchRunning = true;

    const originalButtonContent =
        searchButton?.innerHTML || "";

    if (searchButton) {
        searchButton.disabled = true;

        searchButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Searching...
        `;
    }

    clearDeliveryAddressResults();

    setDeliveryAddressSearchMessage(
        "Searching for matching addresses...",
        "info"
    );

    try {
        const response = await fetch(
            `${API}/search_delivery_address.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    query
                })
            }
        );

        const data =
            await readJsonResponse(response);

        if (
            !response.ok ||
            data.success !== true
        ) {
            throw new Error(
                data.message ||
                "Unable to search for the address."
            );
        }

        renderDeliveryAddressResults(
            data.locations
        );
    } catch (error) {
        console.error(
            "Delivery address search error:",
            error
        );

        clearDeliveryAddressResults();

        setDeliveryAddressSearchMessage(
            error.message ||
            "Unable to search for the address.",
            "error"
        );
    } finally {
        deliveryAddressSearchRunning = false;

        if (searchButton) {
            searchButton.disabled = false;
            searchButton.innerHTML =
                originalButtonContent;
        }
    }
}

function initializeDeliveryLocationMap() {
    const mapElement =
        document.getElementById(
            "deliveryLocationMap"
        );

    const currentLocationButton =
        document.getElementById(
            "useCurrentLocationButton"
        );

      const addressSearchButton =
    document.getElementById(
        "searchDeliveryAddressButton"
    );

const addressInput =
    document.getElementById(
        "address"
    );  

    if (
        !mapElement ||
        typeof L === "undefined"
    ) {
        return;
    }

    resetSelectedDeliveryLocation();

    /*
     * Default map center:
     * Alaminos City, Pangasinan.
     * The customer can use their current location
     * or tap another destination.
     */
    const defaultLocation = [
        16.1552,
        119.9801
    ];

    deliveryLocationMap =
        L.map(mapElement, {
            zoomControl: true
        }).setView(
            defaultLocation,
            14
        );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(deliveryLocationMap);

    deliveryLocationMap.on(
        "click",
        (event) => {
            setDeliveryLocation(
                event.latlng.lat,
                event.latlng.lng
            );
        }
    );

    currentLocationButton?.addEventListener(
        "click",
        useCustomerCurrentLocation
    );

    addressSearchButton?.addEventListener(
    "click",
    searchDeliveryAddress
);

addressInput?.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            searchDeliveryAddress();
        }
    }
);

    const refreshMapSize = () => {
    if (!deliveryLocationMap) {
        return;
    }

    deliveryLocationMap.invalidateSize({
        pan: false,
        debounceMoveend: true
    });
};

window.requestAnimationFrame(() => {
    refreshMapSize();

    window.setTimeout(
        refreshMapSize,
        250
    );

    window.setTimeout(
        refreshMapSize,
        700
    );
});
}

/* =========================================================
   CHECKOUT DYNAMIC FIELDS
   ========================================================= */

async function updateOrderTypeFields() {
    const orderType =
        document.getElementById("orderType");

    const dynamicFields =
        document.getElementById("dynamicFields");

    const paymentMethod =
        document.getElementById("paymentMethod");

    if (
        !orderType ||
        !dynamicFields ||
        !paymentMethod
    ) {
        return;
    }

    const type =
    orderType.value;

cartPricing.selectedOrderType =
    type;

updateTotals(
    Number(
        document
            .getElementById(
                "totalItems"
            )
            ?.textContent || 0
    )
);

dynamicFields.innerHTML = "";
paymentMethod.innerHTML = `
    <option value="">Select payment method</option>
`;

    resetDeliveryAvailability();
    showCheckoutMessage();

    if (type === "dine-in") {
        paymentMethod.innerHTML = `
            <option value="Cash">Cash</option>
            <option value="PayMongo QR Ph">Online Payment - PayMongo QR Ph</option>
        `;

        dynamicFields.innerHTML = `
            <label for="notes">
                Notes
            </label>

            <textarea
                id="notes"
                rows="3"
                placeholder="Special request (optional)"
            ></textarea>
        `;
    }

    if (type === "takeout") {
        paymentMethod.innerHTML = `
            <option value="Cash">Cash</option>
            <option value="PayMongo QR Ph">Online Payment - PayMongo QR Ph</option>
        `;

        dynamicFields.innerHTML = `
            <label for="notes">
                Notes
            </label>

            <textarea
                id="notes"
                rows="3"
                placeholder="Special request (optional)"
            ></textarea>
        `;
    }

  if (type === "delivery") {
    paymentMethod.innerHTML = `
        <option value="Cash on Delivery">Cash on Delivery</option>
        <option value="PayMongo QR Ph">Online Payment - PayMongo QR Ph</option>
    `;

    dynamicFields.innerHTML = `
       <label for="address">
    Complete Address
</label>

<textarea
    id="address"
    rows="3"
    data-ph-address="1"
    data-ph-address-required="1"
    required
></textarea>

        <label for="landmark">
            Landmark
        </label>

        <input
            type="text"
            id="landmark"
            placeholder="Nearby landmark"
        >

        <section class="delivery-location-picker">
            <div class="delivery-location-heading">
                <div>
                    <strong>
                        Pin the Delivery Location
                    </strong>

                    <p>
                        Use your current location or tap the
                        exact delivery destination on the map.
                    </p>
                </div>

                <button
                    type="button"
                    id="useCurrentLocationButton"
                    class="use-current-location-button"
                >
                    <i class="fa-solid fa-location-crosshairs"></i>
                    Use My Current Location
                </button>
            </div>

            <div
                id="deliveryLocationMap"
                class="delivery-location-map"
                aria-label="Select delivery location"
            ></div>

            <div
                id="deliveryLocationStatus"
                class="delivery-location-status"
            >
                <i class="fa-solid fa-location-dot"></i>

                <span>
                    No delivery location selected yet.
                </span>
            </div>
        </section>

        <label for="notes">
            Delivery Instructions
        </label>

        <textarea
            id="notes"
            rows="3"
            placeholder="Optional delivery instructions"
        ></textarea>
    `;

    initializeDeliveryLocationMap();

    await checkDeliveryAvailability();
}

    setPlaceOrderAvailability();
}

/* =========================================================
   PLACE ORDER
   ========================================================= */

let isPlacingOrder = false;
let activeQrModalOrderId = 0;
let orderQrCountdownInterval = null;
let activeQrExpirationTime = null;

function stopOrderQrCountdown() {
    if (orderQrCountdownInterval) {
        clearInterval(
            orderQrCountdownInterval
        );

        orderQrCountdownInterval = null;
    }

    activeQrExpirationTime = null;
}

function parseOrderQrExpiration(
    expirationValue
) {
    const value =
        String(
            expirationValue || ""
        ).trim();

    if (!value) {
        return null;
    }

    /*
     * MySQL returns:
     * YYYY-MM-DD HH:MM:SS
     *
     * FoodConnect currently runs in Philippine time.
     */
    const mysqlDatePattern =
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    const normalizedValue =
        mysqlDatePattern.test(value)
            ? (
                value.replace(
                    " ",
                    "T"
                ) +
                "+08:00"
            )
            : value;

    const timestamp =
        new Date(
            normalizedValue
        ).getTime();

    return Number.isFinite(timestamp)
        ? timestamp
        : null;
}

function formatOrderQrCountdown(
    milliseconds
) {
    const totalSeconds =
        Math.max(
            0,
            Math.ceil(
                milliseconds / 1000
            )
        );

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(
            2,
            "0"
        ) +
        ":" +
        String(seconds).padStart(
            2,
            "0"
        )
    );
}

function renderOrderQrExpiredState() {
    stopOrderQrCountdown();

    const modal =
        document.getElementById(
            "orderQrModal"
        );

    const qrContainer =
        document.getElementById(
            "customerOrderQrCode"
        );

    const headerIcon =
        document.getElementById(
            "orderQrHeaderIcon"
        );

    const label =
        document.getElementById(
            "orderQrLabel"
        );

    const title =
        document.getElementById(
            "orderQrTitle"
        );

    const description =
        document.getElementById(
            "orderQrDescription"
        );

    const statusIcon =
        document.getElementById(
            "orderQrStatusIcon"
        );

    const statusTitle =
        document.getElementById(
            "orderQrStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "orderQrStatusDescription"
        );

    const qrCodeSection =
        document.getElementById(
            "orderQrCodeSection"
        );

    const reminder =
        document.getElementById(
            "orderQrReminder"
        );

    const goToOrdersButton =
        document.getElementById(
            "orderQrGoToOrders"
        );

    const payNowButton =
        document.getElementById(
            "orderQrPayNow"
        );

    modal?.classList.remove(
        "verified"
    );

    if (payNowButton) {
        payNowButton.hidden = true;
        payNowButton.dataset.orderId = "";
    }

    if (headerIcon) {
        headerIcon.className =
            "fa-solid fa-clock-rotate-left";
    }

    if (label) {
        label.textContent =
            "QR code expired";
    }

    if (title) {
        title.textContent =
            "QR Code Expired";
    }

    if (description) {
        description.textContent =
            "This order QR can no longer be scanned by the cashier.";
    }

    if (statusIcon) {
        statusIcon.className =
            "fa-solid fa-circle-xmark";
    }

    if (statusTitle) {
        statusTitle.textContent =
            "QR Expired";
    }

    if (statusDescription) {
        statusDescription.textContent =
            "The 20-minute verification period has ended.";
    }

    if (qrContainer) {
        qrContainer.innerHTML = "";
    }

    if (qrCodeSection) {
        qrCodeSection.hidden = true;
    }

    if (reminder) {
        reminder.hidden = true;
    }

    if (goToOrdersButton) {
        goToOrdersButton.hidden = false;
    }
}

function updateOrderQrCountdown() {
    if (!activeQrExpirationTime) {
        return;
    }

    const remainingMilliseconds =
        activeQrExpirationTime -
        Date.now();

    if (
        remainingMilliseconds <= 0
    ) {
        renderOrderQrExpiredState();
        return;
    }

    const statusTitle =
        document.getElementById(
            "orderQrStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "orderQrStatusDescription"
        );

    if (statusTitle) {
        statusTitle.textContent =
            "Waiting for QR Verification";
    }

    if (statusDescription) {
        statusDescription.textContent =
            "Expires in " +
            formatOrderQrCountdown(
                remainingMilliseconds
            );
    }
}

function startOrderQrCountdown(
    expirationValue
) {
    stopOrderQrCountdown();

    const expirationTimestamp =
        parseOrderQrExpiration(
            expirationValue
        );

    if (!expirationTimestamp) {
        const statusDescription =
            document.getElementById(
                "orderQrStatusDescription"
            );

        if (statusDescription) {
            statusDescription.textContent =
                "The cashier must scan this QR before preparing your order.";
        }

        return;
    }

    activeQrExpirationTime =
        expirationTimestamp;

    updateOrderQrCountdown();

    if (
        activeQrExpirationTime &&
        activeQrExpirationTime >
            Date.now()
    ) {
        orderQrCountdownInterval =
            window.setInterval(
                updateOrderQrCountdown,
                1000
            );
    }
}


function closeOrderQrModal() {
    stopOrderQrCountdown();
    
    const modal =
        document.getElementById(
            "orderQrModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show",
        "verified"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "order-qr-modal-open"
    );

    activeQrModalOrderId = 0;
}

function formatOrderNumber(value) {
    const orderId =
        Number(value || 0);

    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        return "#000000";
    }

    return (
        "#" +
        String(orderId).padStart(
            6,
            "0"
        )
    );
}

function buildOrderQrReceiptItems(
    orderData
) {
    const items =
        Array.isArray(orderData?.items)
            ? orderData.items
            : [];

    if (items.length === 0) {
        return `
            <p class="order-qr-empty-items">
                Order details are available in My Orders.
            </p>
        `;
    }

    return items
        .map((item) => {
            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity || 1
                    )
                );

            const itemSubtotal =
                Number(
                    item.subtotal ??
                    (
                        Number(
                            item.price || 0
                        ) *
                        quantity
                    )
                );

                const unitPrice =
    Number(item.price || 0);

const regularPrice =
    Number(
        item.regular_price ??
        unitPrice
    );

const discountSavings =
    Number(
        item.discount_savings ?? 0
    );

const discountApplied =
    item.discount_applied === true ||
    item.discount_applied === 1;

const hasPromotion =
    discountApplied &&
    regularPrice > unitPrice &&
    discountSavings > 0;

let discountLabel = "";

if (hasPromotion) {

    if (
        item.discount_type ===
        "percentage"
    ) {

        discountLabel =
            `${Number(
                item.discount_value
            )}% OFF`;

    } else if (
        item.discount_type ===
        "fixed"
    ) {

        discountLabel =
            `Save ${formatPrice(
                item.discount_value
            )}`;

    }

}

            const details = [];

            const baseText =
                String(
                    item.variant_text || ""
                ).trim();

            const comboText =
                String(
                    item.combo_choice_text ||
                    ""
                ).trim();

            const addonText =
                String(
                    item.addon_text || ""
                ).trim();

            if (
                baseText &&
                baseText.toLowerCase() !==
                    "default"
            ) {
                details.push(baseText);
            }

            if (
                comboText &&
                comboText !== "[]" &&
                comboText.toLowerCase() !==
                    "null"
            ) {
                details.push(comboText);
            }

            if (
                addonText &&
                addonText !== "[]" &&
                addonText.toLowerCase() !==
                    "null" &&
                addonText.toLowerCase() !==
                    "no add-on"
            ) {
                details.push(addonText);
            }

            return `
                <div class="order-qr-item">

                    <div class="order-qr-item-main">

                        <span class="order-qr-item-quantity">
                            ${quantity}×
                        </span>

                        <div>
                            <strong>
                                ${escapeHtml(
                                    item.product_name ||
                                    "Order Item"
                                )}
                            </strong>

                            ${
                                details.length > 0
                                    ? `
                                        <small>
                                            ${details
                                                .map(
                                                    escapeHtml
                                                )
                                                .join(
                                                    " • "
                                                )}
                                        </small>
                                    `
                                    : ""
                            }
                        </div>

                    </div>

                    <div class="order-qr-item-price">

    <strong>
        ${formatPrice(itemSubtotal)}
    </strong>

    ${
        hasPromotion
            ? `
               <div class="order-qr-item-promo">

    <div class="order-qr-promo-line">
        <del>
            ${formatPrice(
                regularPrice *
                quantity
            )}
        </del>

        <span class="order-qr-discount-badge">
            ${escapeHtml(
                discountLabel
            )}
        </span>
    </div>

    <small>
        Saved
        ${formatPrice(
            discountSavings *
            quantity
        )}
    </small>

</div>
            `
            : ""
    }

</div>

                </div>
            `;
        })
        .join("");
}

function renderOrderQrPendingState() {
    const modal =
        document.getElementById(
            "orderQrModal"
        );

    const headerIcon =
        document.getElementById(
            "orderQrHeaderIcon"
        );

    const label =
        document.getElementById(
            "orderQrLabel"
        );

    const title =
        document.getElementById(
            "orderQrTitle"
        );

    const description =
        document.getElementById(
            "orderQrDescription"
        );

    const statusIcon =
        document.getElementById(
            "orderQrStatusIcon"
        );

    const statusTitle =
        document.getElementById(
            "orderQrStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "orderQrStatusDescription"
        );

    const qrCodeSection =
        document.getElementById(
            "orderQrCodeSection"
        );

    const reminder =
        document.getElementById(
            "orderQrReminder"
        );

    const goToOrdersButton =
        document.getElementById(
            "orderQrGoToOrders"
        );

    const payNowButton =
        document.getElementById(
            "orderQrPayNow"
        );

    modal?.classList.remove(
        "verified"
    );

    if (payNowButton) {
        payNowButton.hidden = true;
        payNowButton.dataset.orderId = "";
    }

    if (headerIcon) {
        headerIcon.className =
            "fa-solid fa-circle-check";
    }

    if (label) {
        label.textContent =
            "Order placed successfully";
    }

    if (title) {
        title.textContent =
            "Present Your Order QR";
    }

    if (description) {
        description.textContent =
            "Show this QR code to the restaurant cashier. Your order will enter the processing queue after verification.";
    }

    if (statusIcon) {
        statusIcon.className =
            "fa-solid fa-clock";
    }

    if (statusTitle) {
        statusTitle.textContent =
            "Waiting for QR Verification";
    }

    if (statusDescription) {
        statusDescription.textContent =
            "The cashier must scan this QR before preparing your order.";
    }

    if (qrCodeSection) {
        qrCodeSection.hidden = false;
    }

    if (reminder) {
        reminder.hidden = false;
    }

    if (goToOrdersButton) {
        goToOrdersButton.hidden = true;
    }
}

function renderOrderQrVerifiedState(
    orderData
) {
stopOrderQrCountdown();

    const modal =
        document.getElementById(
            "orderQrModal"
        );

    const headerIcon =
        document.getElementById(
            "orderQrHeaderIcon"
        );

    const label =
        document.getElementById(
            "orderQrLabel"
        );

    const title =
        document.getElementById(
            "orderQrTitle"
        );

    const description =
        document.getElementById(
            "orderQrDescription"
        );

    const statusIcon =
        document.getElementById(
            "orderQrStatusIcon"
        );

    const statusTitle =
        document.getElementById(
            "orderQrStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "orderQrStatusDescription"
        );

    const qrCodeSection =
        document.getElementById(
            "orderQrCodeSection"
        );

    const reminder =
        document.getElementById(
            "orderQrReminder"
        );

    const goToOrdersButton =
        document.getElementById(
            "orderQrGoToOrders"
        );

    const payNowButton =
        document.getElementById(
            "orderQrPayNow"
        );

    modal?.classList.add(
        "verified"
    );

    if (headerIcon) {
        headerIcon.className =
            "fa-solid fa-circle-check";
    }

    if (label) {
        label.textContent =
            "QR verified successfully";
    }

    const paymentMethod =
        String(
            orderData?.payment_method || ""
        ).trim();

    const paymentStatus =
        String(
            orderData?.payment_status || ""
        )
            .trim()
            .toLowerCase();

    const requiresPayMongo =
        paymentMethod === "PayMongo QR Ph" &&
        paymentStatus !== "paid";

    if (title) {
        title.textContent =
            requiresPayMongo
                ? "QR Verified — Complete Payment"
                : "Order Received";
    }

    if (description) {
        description.textContent =
            requiresPayMongo
                ? "Your order is verified. Complete your PayMongo payment so the restaurant can start preparing it."
                : "Your QR has been verified. The restaurant can now process your order.";
    }

    if (statusIcon) {
        statusIcon.className =
            requiresPayMongo
                ? "fa-solid fa-wallet"
                : "fa-solid fa-check";
    }

    if (statusTitle) {
        statusTitle.textContent =
            requiresPayMongo
                ? "Payment Required"
                : "QR Verified";
    }

    if (statusDescription) {
        const trackingStatus =
            getCustomerTrackingStatus(
                orderData
            );

        statusDescription.textContent =
            requiresPayMongo
                ? `Pay ${formatPrice(
                    Number(
                        orderData?.total_amount || 0
                    )
                )} with PayMongo QR Ph to continue.`
                : (
                    trackingStatus === "preparing"
                        ? "The restaurant is now preparing your order."
                        : "Your order has been added to the restaurant processing queue."
                );
    }

    if (qrCodeSection) {
        qrCodeSection.hidden = true;
    }

    if (reminder) {
        reminder.hidden = true;
    }

    if (payNowButton) {
        payNowButton.hidden =
            !requiresPayMongo;

        payNowButton.dataset.orderId =
            requiresPayMongo
                ? String(
                    orderData?.order_id || ""
                )
                : "";
    }

    if (goToOrdersButton) {
        goToOrdersButton.hidden =
            requiresPayMongo;
    }
}

function renderOrderQrCancelledState() {
    const modal =
        document.getElementById(
            "orderQrModal"
        );

    const label =
        document.getElementById(
            "orderQrLabel"
        );

    const title =
        document.getElementById(
            "orderQrTitle"
        );

    const description =
        document.getElementById(
            "orderQrDescription"
        );

    const statusIcon =
        document.getElementById(
            "orderQrStatusIcon"
        );

    const statusTitle =
        document.getElementById(
            "orderQrStatusTitle"
        );

    const statusDescription =
        document.getElementById(
            "orderQrStatusDescription"
        );

    const qrCodeSection =
        document.getElementById(
            "orderQrCodeSection"
        );

    const reminder =
        document.getElementById(
            "orderQrReminder"
        );

    const goToOrdersButton =
        document.getElementById(
            "orderQrGoToOrders"
        );

    const payNowButton =
        document.getElementById(
            "orderQrPayNow"
        );

    modal?.classList.remove(
        "verified"
    );

    if (label) {
        label.textContent =
            "Order cancelled";
    }

    if (title) {
        title.textContent =
            "Order Is No Longer Active";
    }

    if (description) {
        description.textContent =
            "This order has been cancelled and its QR code can no longer be used.";
    }

    if (statusIcon) {
        statusIcon.className =
            "fa-solid fa-ban";
    }

    if (statusTitle) {
        statusTitle.textContent =
            "Order Cancelled";
    }

    if (statusDescription) {
        statusDescription.textContent =
            "The cashier should not process this QR code.";
    }

    if (qrCodeSection) {
        qrCodeSection.hidden = true;
    }

    if (reminder) {
        reminder.hidden = true;
    }

    if (goToOrdersButton) {
        goToOrdersButton.hidden = false;
    }
}

function syncOpenOrderQrModal() {
    if (activeQrModalOrderId <= 0) {
        return;
    }

    const modal =
        document.getElementById(
            "orderQrModal"
        );

    if (
        !modal ||
        !modal.classList.contains(
            "show"
        )
    ) {
        return;
    }

    const updatedOrder =
        customerOrders.find(
            (order) =>
                Number(
                    order.order_id
                ) ===
                activeQrModalOrderId
        );

    if (!updatedOrder) {
        return;
    }

    const orderStatus =
        String(
            updatedOrder.order_status ||
            ""
        )
            .trim()
            .toLowerCase();

    if (
        orderStatus === "cancelled"
    ) {
        stopOrderQrCountdown();
        return;
    }

    if (
        updatedOrder.qr_expired === true
    ) {
        renderOrderQrExpiredState();
        return;
    }

    if (
        updatedOrder.qr_verified === true ||
        updatedOrder.qr_verified_at
    ) {
        renderOrderQrVerifiedState(
            updatedOrder
        );

        return;
    }

    startOrderQrCountdown(
        updatedOrder.qr_expires_at
    );
}

function showOrderQrModal(orderData) {
    const modal =
        document.getElementById(
            "orderQrModal"
        );

    const qrContainer =
        document.getElementById(
            "customerOrderQrCode"
        );

    const orderIdElement =
        document.getElementById(
            "orderQrOrderId"
        );

    const queueNumberElement =
        document.getElementById(
            "orderQrQueueNumber"
        );

    const restaurantNameElement =
        document.getElementById(
            "orderQrRestaurantName"
        );

    const orderTypeElement =
        document.getElementById(
            "orderQrOrderType"
        );

    const itemsElement =
        document.getElementById(
            "orderQrItems"
        );

    const subtotalElement =
        document.getElementById(
            "orderQrSubtotal"
        );

    const deliveryFeeElement =
        document.getElementById(
            "orderQrDeliveryFee"
        );

    const totalElement =
        document.getElementById(
            "orderQrTotal"
        );

    if (
        !modal ||
        !qrContainer ||
        typeof QRCode === "undefined"
    ) {
        console.error(
            "Order QR components are unavailable."
        );

        return;
    }

    const token =
        String(
            orderData.order_qr_token ||
            ""
        ).trim();

    const qrValue =
        String(
            orderData.order_qr_value ||
            ""
        ).trim() ||
        (
            token
                ? (
                    "FOODCONNECT_ORDER:" +
                    token
                )
                : ""
        );

    if (!qrValue) {
        console.error(
            "Unable to generate the customer QR."
        );

        return;
    }

    const orderId =
        Number(
            orderData.order_id || 0
        );

    activeQrModalOrderId =
        Number.isInteger(orderId)
            ? orderId
            : 0;

    renderOrderQrPendingState();

if (
    orderData.qr_expired === true
) {
    renderOrderQrExpiredState();
} else {
    startOrderQrCountdown(
        orderData.qr_expires_at
    );
}

qrContainer.innerHTML = "";

    if (orderIdElement) {
        orderIdElement.textContent =
            formatOrderNumber(orderId);
    }

    if (queueNumberElement) {
        const queueNumber =
            orderData.queue_number;

        queueNumberElement.textContent =
            queueNumber !== null &&
            queueNumber !== undefined &&
            String(queueNumber).trim() !== ""
                ? String(queueNumber)
                : "Pending";
    }

    if (restaurantNameElement) {
        restaurantNameElement.textContent =
            orderData.restaurant_name ||
            orderData.restaurant?.name ||
            "FoodConnect Restaurant";
    }

    if (orderTypeElement) {
        orderTypeElement.textContent =
            formatOrderType(
                orderData.order_type ||
                "Order"
            );
    }

    if (itemsElement) {
        itemsElement.innerHTML =
            buildOrderQrReceiptItems(
                orderData
            );
    }

    const subtotal =
        Number(
            orderData.subtotal ??
            (
                Number(
                    orderData.total_amount ||
                    0
                ) -
                Number(
                    orderData.delivery_fee ||
                    0
                )
            )
        );

    const deliveryFee =
        Number(
            orderData.delivery_fee || 0
        );

    const total =
        Number(
            orderData.total_amount || 0
        );

    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(subtotal);
    }

    if (deliveryFeeElement) {
        deliveryFeeElement.textContent =
            formatPrice(deliveryFee);
    }

    if (totalElement) {
        totalElement.textContent =
            formatPrice(total);
    }

   if (
    orderData.qr_expired !== true
) {
    new QRCode(
        qrContainer,
        {
            text: qrValue,
            width: 260,
            height: 260,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );
}

    modal.classList.add(
        "show"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "order-qr-modal-open"
    );
}

async function startPayMongoPayment(orderId) {
    const normalizedOrderId =
        Number(orderId || 0);

    if (
        !Number.isInteger(normalizedOrderId) ||
        normalizedOrderId <= 0
    ) {
        throw new Error(
            "A valid order is required before starting payment."
        );
    }

    const response = await fetch(
        `${API}/create_paymongo_checkout.php`,
        {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_id: normalizedOrderId
            })
        }
    );

    const data =
        await readJsonResponse(response);

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
            "Unable to start PayMongo payment."
        );
    }

    const checkoutUrl =
        String(
            data.checkout_url || ""
        ).trim();

    if (!checkoutUrl) {
        throw new Error(
            "PayMongo did not return a checkout page."
        );
    }

    window.location.href = checkoutUrl;
}

async function placeOrder() {
    if (isPlacingOrder) {
        return;
    }

    const orderType =
        document.getElementById("orderType");

    const customerName =
        document.getElementById("customerName");

    const contactNumber =
        document.getElementById("contactNumber");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const placeOrderButton =
        document.getElementById("placeOrderBtn");

    const type =
        orderType?.value.trim() || "";

    const name =
        customerName?.value.trim() || "";

    const contact =
        contactNumber?.value.trim() || "";

    const payment =
        paymentMethod?.value.trim() || "";

    showCheckoutMessage();

    if (!type) {
        showCheckoutMessage(
            "Select an order type.",
            "error"
        );

        orderType?.focus();
        return;
    }

    if (!name) {
        showCheckoutMessage(
            "Enter your full name.",
            "error"
        );

        customerName?.focus();
        return;
    }

    if (!contact) {
        showCheckoutMessage(
            "Enter your contact number.",
            "error"
        );

        contactNumber?.focus();
        return;
    }

    if (!payment) {
        showCheckoutMessage(
            "Select a payment method.",
            "error"
        );

        paymentMethod?.focus();
        return;
    }

    if (!window.FoodConnectPhone.isValid(contact)) {
    showCheckoutMessage(
        "Enter a valid 10-digit mobile number after +63, starting with 9.",
        "error"
    );

        contactNumber?.focus();
        return;
    }

    const payload = {
        order_type: type,
        customer_name: name,
        contact_number: window.FoodConnectPhone.normalize(contact),
        payment_method: payment
    };

    if (type === "dine-in") {
        payload.notes =
            document
                .getElementById("notes")
                ?.value
                .trim() || "";
    }

    if (type === "takeout") {
        payload.notes =
            document
                .getElementById("notes")
                ?.value
                .trim() || "";
    }

    if (type === "delivery") {
                if (
            !deliveryAvailability.checked ||
            !deliveryAvailability.available
        ) {
            await checkDeliveryAvailability();

            if (
                !deliveryAvailability.available
            ) {
                showCheckoutMessage(
                    "No delivery rider is currently available for this restaurant. Please choose Takeout or Dine-in.",
                    "error"
                );

                return;
            }
        }
        const address =
            document
                .getElementById("address")
                ?.value
                .trim() || "";

       if (!address) {
    showCheckoutMessage(
        "Enter your complete delivery address.",
        "error"
    );

    if (window.PHAddressDropdown) {
        window.PHAddressDropdown.validate("address");
    }

    return;
}

if (
    !Number.isFinite(
        selectedDeliveryLocation.latitude
    ) ||
    !Number.isFinite(
        selectedDeliveryLocation.longitude
    )
) {
    showCheckoutMessage(
        "Please pin the exact delivery location on the map.",
        "error"
    );

    document
        .getElementById(
            "deliveryLocationMap"
        )
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    return;
}

payload.address =
    address;

payload.customer_latitude =
    selectedDeliveryLocation.latitude;

payload.customer_longitude =
    selectedDeliveryLocation.longitude;

        payload.landmark =
            document
                .getElementById("landmark")
                ?.value
                .trim() || "";

        payload.notes =
            document
                .getElementById("notes")
                ?.value
                .trim() || "";
    }

    const buttonLabel =
        placeOrderButton?.querySelector("span");

    isPlacingOrder = true;

    if (placeOrderButton) {
        placeOrderButton.disabled = true;
    }

    if (buttonLabel) {
        buttonLabel.textContent =
            "Processing Order...";
    }

    showCheckoutMessage(
        "Submitting your order...",
        "info"
    );

    try {
        const response = await fetch(
            `${API}/checkout.php`,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const data =
            await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                `Checkout failed with status ${response.status}.`
            );
        }

        showCheckoutMessage(
    "Order placed successfully!",
    "success"
);

if (
    payment === "PayMongo QR Ph" &&
    type === "delivery"
) {
    showCheckoutMessage(
        "Order created. Opening PayMongo payment...",
        "info"
    );

    await startPayMongoPayment(
        data.order_id
    );

    return;
}

if (
    payment === "PayMongo QR Ph" &&
    (
        type === "dine-in" ||
        type === "takeout"
    )
) {
    showCheckoutMessage(
        "Order created. Present your FoodConnect QR to the cashier first. PayMongo payment becomes available after QR verification.",
        "success"
    );
}

if (
    type === "dine-in" ||
    type === "takeout"
) {
    let completeOrder = null;

    await loadCustomerOrders(
        false
    );

    completeOrder =
        customerOrders.find(
            (order) =>
                Number(
                    order.order_id
                ) ===
                Number(
                    data.order_id
                )
        ) || null;

    showOrderQrModal(
        completeOrder || data
    );
}

        if (buttonLabel) {
            buttonLabel.textContent =
                "Order Placed";
        }

        orderType.value = "";
        customerName.value = "";
        contactNumber.value = "";
        paymentMethod.innerHTML = `
            <option value="">Select payment method</option>
        `;
        resetDeliveryAvailability();
        resetCartPricing();
        updateTotals(0);

        document.getElementById(
            "dynamicFields"
        ).innerHTML = "";

       await loadCart();

isPlacingOrder = false;

if (placeOrderButton) {
    placeOrderButton.disabled = false;
}

if (buttonLabel) {
    buttonLabel.textContent =
        "Place Order";
}

window.setTimeout(() => {

            const checkoutSection =
                document.getElementById(
                    "checkoutSection"
                );

            if (checkoutSection) {
                checkoutSection.style.display =
                    "none";
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 1400);
    } catch (error) {
        console.error(
            "Checkout error:",
            error
        );

        showCheckoutMessage(
            error.message ||
            "Unable to place your order right now. Please try again.",
            "error"
        );

        isPlacingOrder = false;

        if (placeOrderButton) {
            placeOrderButton.disabled = false;
        }

        if (buttonLabel) {
            buttonLabel.textContent =
                "Place Order";
        }
    }
}

/* =========================================================
   CUSTOMER ORDERS HELPERS
========================================================= */

const CUSTOMER_CANCEL_WINDOW_MS =
    5 * 60 * 1000;

function parseCustomerOrderDate(
    dateValue
) {
    const value =
        String(
            dateValue || ""
        ).trim();

    if (!value) {
        return null;
    }

    /*
     * MySQL returns:
     * YYYY-MM-DD HH:MM:SS
     *
     * FoodConnect currently uses Philippine time.
     */
    const mysqlDatePattern =
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    const normalizedValue =
        mysqlDatePattern.test(value)
            ? (
                value.replace(
                    " ",
                    "T"
                ) +
                "+08:00"
            )
            : value;

    const timestamp =
        new Date(
            normalizedValue
        ).getTime();

    return Number.isFinite(timestamp)
        ? timestamp
        : null;
}

function getCustomerCancelRemainingMs(
    order
) {
    const createdTimestamp =
        parseCustomerOrderDate(
            order?.created_at
        );

    if (!createdTimestamp) {
        return 0;
    }

    const deadline =
        createdTimestamp +
        CUSTOMER_CANCEL_WINDOW_MS;

    return Math.max(
        0,
        deadline - Date.now()
    );
}

function canCustomerCancelOrder(
    order
) {
    const rawStatus =
        normalizeOrderStatus(
            order?.order_status
        );

    return (
        rawStatus === "pending" &&
        getCustomerCancelRemainingMs(
            order
        ) > 0
    );
}

function formatCustomerCancelCountdown(
    milliseconds
) {
    const totalSeconds =
        Math.max(
            0,
            Math.ceil(
                milliseconds / 1000
            )
        );

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(
            2,
            "0"
        ) +
        ":" +
        String(seconds).padStart(
            2,
            "0"
        )
    );
}

function normalizeOrderStatus(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

function normalizeOrderType(value) {
    const normalized =
        String(value || "")
            .trim()
            .toLowerCase()
            .replaceAll("_", "-")
            .replaceAll(" ", "-");

    if (normalized === "takeout") {
        return "take-out";
    }

    if (normalized === "dinein") {
        return "dine-in";
    }

    return normalized;
}

function formatOrderType(value) {
    return String(value || "N/A")
        .replaceAll("-", " ")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
}

function formatOrderDate(value) {
    if (!value) {
        return "Date unavailable";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "en-PH",
        {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function getCustomerTrackingStatus(order) {
    const orderStatus =
        normalizeOrderStatus(
            order?.order_status
        );

    const deliveryStatus =
        normalizeOrderStatus(
            order?.delivery
                ?.delivery_status
        );

    const orderType =
        normalizeOrderType(
            order?.order_type
        );

    const requiresQrVerification =
        [
            "dine-in",
            "take-out"
        ].includes(orderType);

    /*
     * qr_verified_at is the authoritative database field.
     *
     * Accept qr_verified only when it is an actual true
     * boolean or numeric/string 1. Do not use Boolean()
     * because the string "false" becomes true.
     */
    const qrVerifiedAt =
        String(
            order?.qr_verified_at ?? ""
        ).trim();

    const qrVerifiedFlag =
        order?.qr_verified === true ||
        order?.qr_verified === 1 ||
        order?.qr_verified === "1";

    const qrVerified =
        qrVerifiedAt !== "" &&
        qrVerifiedAt !==
            "0000-00-00 00:00:00"
            ? true
            : qrVerifiedFlag;

    /*
     * Cancellation and completion always take priority.
     */
    if (orderStatus === "cancelled") {
        return "cancelled";
    }

    if (
        deliveryStatus === "completed" ||
        orderStatus === "completed" ||
        orderStatus === "done" ||
        orderStatus ===
            "picked_up_by_customer"
    ) {
        return "completed";
    }

    const paymentMethod =
        String(
            order?.payment_method || ""
        ).trim();

    const paymentStatus =
        String(
            order?.payment_status || ""
        )
            .trim()
            .toLowerCase();

    /*
     * Dine-in and takeout must remain here until the
     * cashier successfully scans the order QR.
     */
    if (
        requiresQrVerification &&
        !qrVerified
    ) {
        return "waiting_for_qr";
    }

    if (
        paymentMethod === "PayMongo QR Ph" &&
        paymentStatus !== "paid"
    ) {
        return "waiting_for_payment";
    }

    if (
        deliveryStatus ===
        "out_for_delivery"
    ) {
        return "out_for_delivery";
    }

    if (
        orderType === "delivery" &&
        [
            "ready",
            "assigned",
            "accepted",
            "picked_up"
        ].includes(
            deliveryStatus ||
            orderStatus
        )
    ) {
        return "preparing";
    }

    if (
        orderType !== "delivery" &&
        [
            "preparing",
            "ready"
        ].includes(orderStatus)
    ) {
        return "preparing";
    }

    /*
     * A pending order is received only after its QR
     * requirement has passed.
     */
    if (
        [
            "pending",
            "order_received"
        ].includes(orderStatus)
    ) {
        return "order_received";
    }

    return orderStatus ||
        "order_received";
}

function getOrderStatusLabel(status) {
    const labels = {
        waiting_for_qr:
            "Waiting for QR Verification",

        waiting_for_payment:
            "Waiting for Payment",

        order_received:
            "Order Received",

        pending:
            "Order Received",

        preparing:
            "Preparing",

        out_for_delivery:
            "Out for Delivery",

        completed:
            "Completed",

        cancelled:
            "Cancelled"
    };

    return (
        labels[status] ||
        formatOrderType(status)
    );
}

function getClearedCompletedOrderIds() {
    try {
        const stored =
            JSON.parse(
                localStorage.getItem(
                    CLEARED_COMPLETED_ORDERS_KEY
                ) || "[]"
            );

        if (!Array.isArray(stored)) {
            return new Set();
        }

        return new Set(
            stored
                .map(Number)
                .filter(
                    (orderId) =>
                        Number.isInteger(
                            orderId
                        ) &&
                        orderId > 0
                )
        );
    } catch {
        return new Set();
    }
}

function saveClearedCompletedOrderIds() {
    localStorage.setItem(
        CLEARED_COMPLETED_ORDERS_KEY,
        JSON.stringify(
            Array.from(
                clearedCompletedOrderIds
            )
        )
    );
}

/* =========================================================
   CUSTOMER ORDER COUNTERS
========================================================= */

function updateCustomerOrderCounters() {
    const visibleOrders =
        customerOrders.filter(
            (order) => {
                const orderId =
                    Number(
                        order.order_id
                    );

                const status =
                    getCustomerTrackingStatus(
                        order
                    );

                return !(
                    status ===
                        "completed" &&
                    clearedCompletedOrderIds
                        .has(orderId)
                );
            }
        );

    const activeCount =
        visibleOrders.filter(
            (order) =>
                ![
                    "completed",
                    "cancelled"
                ].includes(
                    getCustomerTrackingStatus(
                        order
                    )
                )
        ).length;

    const completedCount =
        visibleOrders.filter(
            (order) =>
                getCustomerTrackingStatus(
                    order
                ) === "completed"
        ).length;

    const allCount =
        visibleOrders.length;

    const values = {
        activeOrdersCount:
            activeCount,

        activeOrdersTabCount:
            activeCount,

        completedOrdersCount:
            completedCount,

        allOrdersCount:
            allCount
    };

    Object.entries(values).forEach(
        ([elementId, value]) => {
            const element =
                document.getElementById(
                    elementId
                );

            if (element) {
                element.textContent =
                    String(value);
            }
        }
    );
}

/* =========================================================
   CUSTOMER ORDER CARD
========================================================= */

function buildCustomerOrderItems(order) {
    const items =
        Array.isArray(order.items)
            ? order.items
            : [];

    if (items.length === 0) {
        return `
            <p class="customer-order-item-meta">
                No order items found.
            </p>
        `;
    }

    return items
        .map((item) => {
            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity || 1
                    )
                );

            const subtotal =
                Number(
                    item.subtotal ??
                    (
                        Number(
                            item.price || 0
                        ) *
                        quantity
                    )
                );

            const detailParts = [];

            const baseText =
                String(
                    item.variant_text || ""
                ).trim();

            const comboText =
                String(
                    item.combo_choice_text ||
                    ""
                ).trim();

            const addonText =
                String(
                    item.addon_text || ""
                ).trim();

            if (
                baseText &&
                baseText.toLowerCase() !==
                    "default"
            ) {
                detailParts.push(
                    `Variant: ${baseText}`
                );
            }

            if (
                comboText &&
                comboText !== "[]" &&
                comboText.toLowerCase() !==
                    "null"
            ) {
                detailParts.push(
                    `Choice: ${comboText}`
                );
            }

            if (
                addonText &&
                addonText !== "[]" &&
                addonText.toLowerCase() !==
                    "null" &&
                addonText.toLowerCase() !==
                    "no add-on"
            ) {
                detailParts.push(
                    `Add-ons: ${addonText}`
                );
            }

            return `
                <div class="customer-order-item">

                    <div>
                        <div class="customer-order-item-name">
                            ${escapeHtml(
                                item.product_name ||
                                "Order Item"
                            )}
                            ×${quantity}
                        </div>

                        ${
                            detailParts.length
                                ? `
                                    <div class="customer-order-item-meta">
                                        ${detailParts
                                            .map(
                                                escapeHtml
                                            )
                                            .join(
                                                "<br>"
                                            )}
                                    </div>
                                `
                                : ""
                        }
                    </div>

                    <strong class="customer-order-item-price">
                        ${formatPrice(
                            subtotal
                        )}
                    </strong>

                </div>
            `;
        })
        .join("");
}

function buildCustomerOrderTimeline(
    order,
    currentStatus
) {
    const orderType =
        normalizeOrderType(
            order.order_type
        );

  const steps =
    orderType === "delivery"
        ? [
            {
                key: "order_received",
                label: "Order Received",
                icon: "fa-receipt"
            },
            {
                key: "preparing",
                label: "Preparing",
                icon: "fa-fire-burner"
            },
            {
                key: "out_for_delivery",
                label: "Out for Delivery",
                icon: "fa-motorcycle"
            },
            {
                key: "completed",
                label: "Completed",
                icon: "fa-circle-check"
            }
        ]
        : [
            {
                key: "waiting_for_qr",
                label:
                    currentStatus === "waiting_for_qr" &&
                    order.qr_expired === true
                        ? "QR Expired"
                        : "Waiting for QR Verification",
                icon: "fa-qrcode"
            },
            {
                key: "waiting_for_payment",
                label: "Payment",
                icon: "fa-wallet"
            },
            {
                key: "order_received",
                label: "Order Received",
                icon: "fa-receipt"
            },
            {
                key: "preparing",
                label: "Preparing",
                icon: "fa-fire-burner"
            },
            {
                key: "completed",
                label: "Completed",
                icon: "fa-circle-check"
            }
        ];

    if (currentStatus === "cancelled") {
        return `
            <div class="customer-order-timeline">

                <div class="customer-order-timeline-step current">

                    <span class="customer-order-timeline-icon">
                        <i class="fa-solid fa-ban"></i>
                    </span>

                    <span>
                        Order Cancelled
                    </span>

                </div>

            </div>
        `;
    }

    const normalizedStatus =
        currentStatus === "pending"
            ? "order_received"
            : currentStatus;

    const currentIndex =
        steps.findIndex(
            (step) =>
                step.key ===
                normalizedStatus
        );

    return `
        <div class="customer-order-timeline">

            ${steps
                .map(
                    (
                        step,
                        index
                    ) => {
                        let stateClass = "";

                        if (
                            currentIndex >= 0 &&
                            index <
                                currentIndex
                        ) {
                            stateClass =
                                "done";
                        }

                        if (
                            index ===
                                currentIndex
                        ) {
                            stateClass =
                                "current";
                        }

                        if (
                            normalizedStatus ===
                            "completed"
                        ) {
                            stateClass =
                                "done";
                        }

                        return `
                            <div class="customer-order-timeline-step ${stateClass}">

                                <span class="customer-order-timeline-icon">
                                    <i class="fa-solid ${step.icon}"></i>
                                </span>

                                <span>
                                    ${escapeHtml(
                                        step.label
                                    )}
                                </span>

                            </div>
                        `;
                    }
                )
                .join("")}

        </div>
    `;
}

function buildCustomerOrderCard(order) {
    const orderId =
        Number(
            order.order_id || 0
        );

    const status =
        getCustomerTrackingStatus(
            order
        );

    const customerStatusLabel =
        status === "waiting_for_qr" &&
        order.qr_expired === true
            ? "QR Expired"
            : getOrderStatusLabel(
                status
            );

    const canTrackDelivery =
    status === "out_for_delivery" &&
    Number(
        order?.delivery?.assignment_id || 0
    ) > 0 &&
    Number(
        order?.delivery?.delivery_staff_id || 0
    ) > 0;

    const expanded =
        expandedCustomerOrderIds
            .has(orderId);

    const subtotal =
        Number(
            order.subtotal ??
            (
                Number(
                    order.total_amount || 0
                ) -
                Number(
                    order.delivery_fee || 0
                )
            )
        );

    const deliveryFee =
        Number(
            order.delivery_fee || 0
        );

    const total =
        Number(
            order.total_amount || 0
        );

    const canShowQr =
    status === "waiting_for_qr" &&
    Boolean(
        String(
            order.order_qr_token || ""
        ).trim()
    );

    const canPayOnline =
        status === "waiting_for_payment" &&
        String(
            order.payment_method || ""
        ).trim() === "PayMongo QR Ph" &&
        String(
            order.payment_status || ""
        )
            .trim()
            .toLowerCase() !== "paid";

const cancelRemainingMs =
    getCustomerCancelRemainingMs(
        order
    );

const canCustomerCancel =
    canCustomerCancelOrder(
        order
    );

    return `
        <article
            class="customer-order-card ${
                expanded
                    ? "expanded"
                    : ""
            }"
            data-order-id="${orderId}"
        >

            <button
                type="button"
                class="customer-order-card-header"
                data-toggle-customer-order="${orderId}"
            >
                <span>
                    <span class="customer-order-number">
                        Order #${orderId}
                    </span>

                    <span class="customer-order-date">
                        ${escapeHtml(
                            formatOrderDate(
                                order.created_at
                            )
                        )}
                        •
                        ${escapeHtml(
                            formatOrderType(
                                order.order_type
                            )
                        )}
                    </span>
                </span>

                <span class="customer-order-header-right">

                    <span
                        class="customer-order-status ${status}"
                    >
                        ${escapeHtml(
                            customerStatusLabel
                        )}
                    </span>

                    <span class="customer-order-toggle">
                        <i class="fa-solid fa-chevron-down"></i>
                    </span>

                </span>
            </button>

            <div
                class="customer-order-details"
                ${
                    expanded
                        ? ""
                        : "hidden"
                }
            >

                <div class="customer-order-items">
                    ${buildCustomerOrderItems(
                        order
                    )}
                </div>

                <div class="customer-order-price-summary">

                    <div class="customer-order-price-row">
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ${formatPrice(
                                subtotal
                            )}
                        </strong>
                    </div>

                    <div class="customer-order-price-row">
                        <span>
                            Delivery Fee
                        </span>

                        <strong>
                            ${formatPrice(
                                deliveryFee
                            )}
                        </strong>
                    </div>

                    <div class="customer-order-price-row total">
                        <span>
                            Total
                        </span>

                        <strong>
                            ${formatPrice(
                                total
                            )}
                        </strong>
                    </div>

                </div>

               ${
    canShowQr ||
    canPayOnline ||
    canCustomerCancel
        ? `
            <section class="customer-order-actions-card">

                <div class="customer-order-actions-header">

                    <div class="customer-order-actions-icon">
                        <i class="fa-solid fa-sliders"></i>
                    </div>

                    <div>
                        <h4>
                            Order Actions
                        </h4>

                        <p>
                            Complete the available actions for this order.
                        </p>
                    </div>

                </div>

                ${
                    canShowQr
                        ? `
                            <div class="customer-order-action-section qr-action">

                                <div class="customer-order-action-copy">

                                    <span class="customer-order-action-label">
                                        QR Verification
                                    </span>

                                    <strong>
                                        Present your order QR
                                    </strong>

                                    <p>
                                        Show the QR code to the cashier
                                        so your order can enter the
                                        processing queue.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    class="customer-order-show-qr-button"
                                    data-show-order-qr="${orderId}"
                                >
                                    <i class="fa-solid fa-qrcode"></i>

                                    <span>
                                        Show Order QR
                                    </span>
                                </button>

                            </div>
                        `
                        : ""
                }

                ${
                    canPayOnline
                        ? `
                            <div class="customer-order-action-section payment-action">

                                <div class="customer-order-action-copy">
                                    <span class="customer-order-action-label">
                                        Online Payment
                                    </span>

                                    <strong>
                                        QR verified — payment is ready
                                    </strong>

                                    <p>
                                        Continue to PayMongo QR Ph. Your order
                                        will not enter preparation until payment
                                        is confirmed.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    class="customer-order-show-qr-button customer-order-pay-button"
                                    data-pay-order="${orderId}"
                                >
                                    <i class="fa-solid fa-wallet"></i>
                                    <span>Pay with PayMongo</span>
                                </button>

                            </div>
                        `
                        : ""
                }

                ${
                    (canShowQr || canPayOnline) &&
                    canCustomerCancel
                        ? `
                            <div
                                class="customer-order-actions-divider"
                                aria-hidden="true"
                            ></div>
                        `
                        : ""
                }

                ${
                    canCustomerCancel
                        ? `
                            <div class="customer-order-action-section cancel-action">

                                <div class="customer-order-cancel-heading">

                                    <div class="customer-order-cancel-icon">
                                        <i class="fa-solid fa-clock"></i>
                                    </div>

                                    <div>
                                        <span class="customer-order-action-label">
                                            Cancellation Available
                                        </span>

                                        <strong>
                                            You may still cancel this order
                                        </strong>
                                    </div>

                                </div>

                                <div class="customer-order-cancel-timer">

                                    <span>
                                        Time Remaining
                                    </span>

                                    <strong
                                        class="
                                            customer-cancel-countdown
                                            ${
                                                cancelRemainingMs <=
                                                60000
                                                    ? "danger"
                                                    : cancelRemainingMs <=
                                                      180000
                                                        ? "warning"
                                                        : ""
                                            }
                                        "
                                    >
                                        ${formatCustomerCancelCountdown(
                                            cancelRemainingMs
                                        )}
                                    </strong>

                                    <small>
                                        Cancellation also closes immediately
                                        once preparation starts.
                                    </small>

                                </div>

                                <button
                                    type="button"
                                    class="customer-order-cancel-button"
                                    data-cancel-customer-order="${orderId}"
                                >
                                    <i class="fa-solid fa-ban"></i>

                                    <span>
                                        Cancel Order
                                    </span>
                                </button>

                            </div>
                        `
                        : ""
                }

            </section>
        `
        : ""
}

                ${buildCustomerOrderTimeline(
    order,
    status
)}

${
    canTrackDelivery
        ? `
            <section
                class="customer-live-tracking-card"
                data-live-tracking-order="${orderId}"
            >
                <div class="customer-live-tracking-header">

                    <div>
                        <span class="customer-live-tracking-label">
                            Live Delivery
                        </span>

                        <h4>
                            Track Your Rider
                        </h4>

                        <p>
                            Rider location updates automatically while
                            your order is out for delivery.
                        </p>
                    </div>

                    <span class="customer-live-tracking-status">
                        <i class="fa-solid fa-circle"></i>
                        Live GPS
                    </span>

                </div>

                <div
                    id="customerTrackingMap-${orderId}"
                    class="customer-live-tracking-map"
                ></div>

                <div class="customer-route-summary">

    <div class="customer-route-summary-item">
        <i class="fa-solid fa-route"></i>

        <div>
            <span>Distance</span>

            <strong
                id="customerRouteDistance-${orderId}"
            >
                Calculating...
            </strong>
        </div>
    </div>

    <div class="customer-route-summary-item">
        <i class="fa-solid fa-clock"></i>

        <div>
            <span>Estimated Time</span>

            <strong
                id="customerRouteEta-${orderId}"
            >
                Calculating...
            </strong>
        </div>
    </div>

</div>

                <div
                    class="customer-live-tracking-footer"
                >
                    <span>
                        <i class="fa-solid fa-motorcycle"></i>
                        ${
                            escapeHtml(
                                order?.delivery?.rider_name ||
                                "Delivery Rider"
                            )
                        }
                    </span>

                    <span
                        id="customerTrackingUpdated-${orderId}"
                    >
                        Waiting for rider location...
                    </span>
                </div>
            </section>
        `
        : ""
}

            </div>

        </article>
    `;
}

function formatCustomerRouteDistance(
    distanceMeters
) {
    const distance =
        Number(distanceMeters || 0);

    if (
        !Number.isFinite(distance) ||
        distance <= 0
    ) {
        return "Unavailable";
    }

    if (distance < 1000) {
        return `${Math.round(distance)} m`;
    }

    return `${(
        distance / 1000
    ).toFixed(1)} km`;
}


function formatCustomerRouteDuration(
    durationSeconds
) {
    const seconds =
        Number(durationSeconds || 0);

    if (
        !Number.isFinite(seconds) ||
        seconds <= 0
    ) {
        return "Unavailable";
    }

    const minutes =
        Math.max(
            1,
            Math.round(
                seconds / 60
            )
        );

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    const remainingMinutes =
        minutes % 60;

    return remainingMinutes > 0
        ? `${hours} hr ${remainingMinutes} min`
        : `${hours} hr`;
}

function calculateCustomerTrackingDistanceMeters(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {
    const earthRadius =
        6371000;

    const toRadians =
        (degrees) =>
            degrees *
            Math.PI /
            180;

    const lat1 =
        toRadians(latitude1);

    const lat2 =
        toRadians(latitude2);

    const deltaLatitude =
        toRadians(
            latitude2 -
            latitude1
        );

    const deltaLongitude =
        toRadians(
            longitude2 -
            longitude1
        );

    const a =
        Math.sin(
            deltaLatitude / 2
        ) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(
            deltaLongitude / 2
        ) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}


function shouldRefreshCustomerDeliveryRoute(
    orderId,
    riderLatitude,
    riderLongitude
) {
    const mapData =
        customerTrackingMaps.get(
            Number(orderId)
        );

    if (!mapData) {
        return false;
    }

    if (
        mapData.routeRequestInProgress
    ) {
        return false;
    }

    const now =
        Date.now();

    /*
     * Always request the first route.
     */
    if (
        !mapData.lastRouteCoordinates
    ) {
        return true;
    }

    const elapsedMilliseconds =
        now -
        Number(
            mapData.lastRouteRequestAt || 0
        );

    /*
     * Don't ask Geoapify again sooner
     * than 15 seconds.
     */
    if (
        elapsedMilliseconds < 15000
    ) {
        return false;
    }

    const previous =
        mapData.lastRouteCoordinates;

    const movedMeters =
        calculateCustomerTrackingDistanceMeters(
            Number(previous.latitude),
            Number(previous.longitude),
            riderLatitude,
            riderLongitude
        );

    /*
     * Recalculate after the rider moved
     * roughly 20 meters.
     */
    return movedMeters >= 20;
}

async function loadCustomerDeliveryRoute(
    order,
    riderLatitude,
    riderLongitude
) {
    const orderId =
        Number(
            order?.order_id || 0
        );

    const mapData =
        customerTrackingMaps.get(
            orderId
        );

    if (
        !mapData ||
        mapData.routeRequestInProgress
    ) {
        return;
    }

    const assignmentId =
        Number(
            order?.delivery?.assignment_id || 0
        );

    if (
        assignmentId <= 0 ||
        !Number.isFinite(riderLatitude) ||
        !Number.isFinite(riderLongitude)
    ) {
        return;
    }

    mapData.routeRequestInProgress =
    true;

/*
 * Record this attempt immediately.
 *
 * Even if Geoapify temporarily fails,
 * Firebase GPS updates must not spam
 * the routing API repeatedly.
 */

try {
        const response =
            await fetch(
                `${API}/get_customer_delivery_route.php`,
                {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        assignment_id:
                            assignmentId,

                        rider_latitude:
                            riderLatitude,

                        rider_longitude:
                            riderLongitude
                    })
                }
            );

        const data =
            await readJsonResponse(
                response
            );

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to calculate delivery route."
            );
        }

        if (mapData.routeLayer) {
            mapData.map.removeLayer(
                mapData.routeLayer
            );

            mapData.routeLayer =
                null;
        }

        mapData.routeLayer =
            L.geoJSON(
                data.route?.geometry,
                {
                    style: {
                        color: "#2563eb",
                        weight: 6,
                        opacity: 0.9,
                        lineCap: "round",
                        lineJoin: "round"
                    }
                }
            ).addTo(
                mapData.map
            );

        const distanceElement =
            document.getElementById(
                `customerRouteDistance-${orderId}`
            );

        const etaElement =
            document.getElementById(
                `customerRouteEta-${orderId}`
            );

        if (distanceElement) {
            distanceElement.textContent =
                formatCustomerRouteDistance(
                    data.route
                        ?.distance_meters
                );
        }

        if (etaElement) {
            etaElement.textContent =
                formatCustomerRouteDuration(
                    data.route
                        ?.duration_seconds
                );
        }

        mapData.lastRouteRequestAt =
            Date.now();

        mapData.lastRouteCoordinates = {
            latitude:
                riderLatitude,

            longitude:
                riderLongitude
        };

    } catch (error) {
        console.error(
            "Customer delivery route error:",
            error
        );
    } finally {
        mapData.routeRequestInProgress =
            false;
    }
}

/* =========================================================
   CUSTOMER ORDER CANCELLATION
========================================================= */

function getCustomerCancelElements() {
    return {
        modal:
            document.getElementById(
                "customerCancelModal"
            ),

        closeButton:
            document.getElementById(
                "closeCustomerCancelModal"
            ),

        backButton:
            document.getElementById(
                "backCustomerCancelModal"
            ),

        confirmButton:
            document.getElementById(
                "confirmCustomerCancelBtn"
            ),

        reasons:
            document.querySelectorAll(
                'input[name="customerCancelReason"]'
            ),

        otherGroup:
            document.getElementById(
                "customerOtherReasonGroup"
            ),

        otherInput:
            document.getElementById(
                "customerOtherCancelReason"
            ),

        message:
            document.getElementById(
                "customerCancelMessage"
            )
    };
}

function showCustomerCancelMessage(
    message = "",
    type = "error"
) {
    const { message: messageElement } =
        getCustomerCancelElements();

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    messageElement.classList.remove(
        "success",
        "error"
    );

    if (message) {
        messageElement.classList.add(
            type === "success"
                ? "success"
                : "error"
        );
    }
}

function resetCustomerCancelForm() {
    const {
        reasons,
        otherGroup,
        otherInput
    } = getCustomerCancelElements();

    reasons.forEach(
        (radio) => {
            radio.checked = false;
        }
    );

    if (otherGroup) {
        otherGroup.hidden = true;
    }

    if (otherInput) {
        otherInput.value = "";
    }

    showCustomerCancelMessage();
}

function openCustomerCancelModal(
    orderId
) {
    const { modal } =
        getCustomerCancelElements();

    const order =
        customerOrders.find(
            (customerOrder) =>
                Number(
                    customerOrder.order_id
                ) === Number(orderId)
        );

    if (!order) {
        window.alert(
            "The order could not be found. Please refresh your orders."
        );

        return;
    }

    const canCancel =
    canCustomerCancelOrder(
        order
    );

    if (!canCancel) {
    const rawStatus =
        normalizeOrderStatus(
            order.order_status
        );

    const message =
        rawStatus !== "pending"
            ? "This order can no longer be cancelled because the restaurant has already started processing it."
            : "The 5-minute cancellation period for this order has already expired.";

    window.alert(message);

    loadCustomerOrders(true);
    return;
}

    selectedCustomerCancelOrderId =
        Number(orderId);

    resetCustomerCancelForm();

    modal?.classList.add(
        "show"
    );

    modal?.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}

function closeCustomerCancelModal() {
    const { modal } =
        getCustomerCancelElements();

    modal?.classList.remove(
        "show"
    );

    modal?.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    selectedCustomerCancelOrderId =
        null;

    resetCustomerCancelForm();
}

function getSelectedCustomerCancelReason() {
    const {
        reasons,
        otherInput
    } = getCustomerCancelElements();

    const selectedReason =
    [...reasons].find(
        (radio) =>
            radio.checked
    );

    if (!selectedReason) {
        return "";
    }

    if (
        selectedReason.value ===
        "other"
    ) {
        return String(
            otherInput?.value || ""
        ).trim();
    }

    return String(
        selectedReason.value || ""
    ).trim();
}

async function submitCustomerCancellation() {
    if (
        customerCancellationSubmitting
    ) {
        return;
    }

    const {
        confirmButton,
        otherInput
    } = getCustomerCancelElements();

    const orderId =
        Number(
            selectedCustomerCancelOrderId
        );

    const cancellationReason =
        getSelectedCustomerCancelReason();

    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        showCustomerCancelMessage(
            "Invalid order. Please close the dialog and try again."
        );

        return;
    }

    if (
        cancellationReason.length < 3
    ) {
        showCustomerCancelMessage(
            "Please select or enter a clear cancellation reason."
        );

        otherInput?.focus();
        return;
    }

    if (
        cancellationReason.length > 250
    ) {
        showCustomerCancelMessage(
            "The cancellation reason must not exceed 250 characters."
        );

        otherInput?.focus();
        return;
    }

    const originalHtml =
        confirmButton?.innerHTML || "";

    try {
        customerCancellationSubmitting =
            true;

        if (confirmButton) {
            confirmButton.disabled =
                true;

            confirmButton.innerHTML = `
                <span>
                    Cancelling...
                </span>

                <i class="fa-solid fa-spinner fa-spin"></i>
            `;
        }

        showCustomerCancelMessage();

        const response = await fetch(
            `${API}/cancel_customer_order.php`,
            {
                method: "POST",

                credentials:
                    "include",

                cache:
                    "no-store",

                headers: {
                    "Content-Type":
                        "application/json",

                    Accept:
                        "application/json"
                },

                body: JSON.stringify({
                    order_id:
                        orderId,

                    cancellation_reason:
                        cancellationReason
                })
            }
        );

        const data =
            await readJsonResponse(
                response
            );

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to cancel the order."
            );
        }

        closeCustomerCancelModal();

        await loadCustomerOrders(
            true
        );

        window.alert(
            data.message ||
            "Your order was cancelled successfully."
        );

    } catch (error) {
        console.error(
            "Customer cancellation error:",
            error
        );

        showCustomerCancelMessage(
            error.message ||
            "Unable to cancel the order."
        );

    } finally {
        customerCancellationSubmitting =
            false;

        if (confirmButton) {
            confirmButton.disabled =
                false;

            confirmButton.innerHTML =
                originalHtml;
        }
    }
}

/* =========================================================
   RENDER CUSTOMER ORDERS
========================================================= */

function createCustomerDestinationIcon() {
    return L.divIcon({
        className:
            "customer-destination-map-marker",

        html: `
            <div class="customer-destination-pin">
                <div class="customer-destination-pin-center">
                    <i class="fa-solid fa-house"></i>
                </div>
            </div>
        `,

        iconSize:
            [48, 56],

        iconAnchor:
            [24, 54],

        popupAnchor:
            [0, -48]
    });
}

function createCustomerRiderIcon() {
    return L.divIcon({
        className:
            "customer-rider-map-marker",

        html: `
            <div class="customer-rider-marker-inner">
                <i class="fa-solid fa-motorcycle"></i>
            </div>
        `,

        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });
}

function destroyCustomerTrackingMap(
    orderId
) {
    const numericOrderId =
        Number(orderId);

    const listenerData =
        customerTrackingListeners.get(
            numericOrderId
        );

    if (listenerData) {
        off(
            listenerData.reference,
            "value",
            listenerData.callback
        );

        customerTrackingListeners.delete(
            numericOrderId
        );
    }

    const mapData =
        customerTrackingMaps.get(
            numericOrderId
        );

    if (mapData?.staleStatusInterval) {
        window.clearInterval(
            mapData.staleStatusInterval
        );
    }

    if (mapData?.map) {
        mapData.map.remove();
    }

    customerTrackingMaps.delete(
        numericOrderId
    );
}

async function startCustomerLiveTracking(
    order
) {
    const orderId =
        Number(
            order?.order_id || 0
        );

    if (
        orderId <= 0 ||
        getCustomerTrackingStatus(order) !==
            "out_for_delivery"
    ) {
        return;
    }

    const mapElement =
        document.getElementById(
            `customerTrackingMap-${orderId}`
        );

    if (!mapElement) {
        return;
    }

    destroyCustomerTrackingMap(
        orderId
    );

    try {
        const authResult =
            await authenticateFirebaseCustomerTracking(
                orderId
            );

        const tracking =
            authResult?.tracking;

        if (!tracking) {
            throw new Error(
                "Tracking information is unavailable."
            );
        }

        customerTrackingAuth.set(
            orderId,
            tracking
        );

        const map =
            L.map(
                mapElement,
                {
                    zoomControl: true,
                    attributionControl: true
                }
            );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);

      const rawCustomerLatitude =
    order?.customer_latitude;

const rawCustomerLongitude =
    order?.customer_longitude;

const customerLatitude =
    rawCustomerLatitude !== null &&
    rawCustomerLatitude !== undefined &&
    String(rawCustomerLatitude).trim() !== ""
        ? Number(rawCustomerLatitude)
        : null;

const customerLongitude =
    rawCustomerLongitude !== null &&
    rawCustomerLongitude !== undefined &&
    String(rawCustomerLongitude).trim() !== ""
        ? Number(rawCustomerLongitude)
        : null;

let customerMarker = null;

if (
    Number.isFinite(customerLatitude) &&
    Number.isFinite(customerLongitude)
) {
  customerMarker =
    L.marker(
        [
            customerLatitude,
            customerLongitude
        ],
     {
    icon:
        createCustomerDestinationIcon(),

    title:
        "Your Delivery Location",

    zIndexOffset:
        2000
}
    )
        .addTo(map)
        .bindPopup(`
            <strong>
                Your Delivery Location
            </strong>
        `);
} 

        const riderMarker =
    L.marker(
        [0, 0],
        {
            icon:
                createCustomerRiderIcon(),

            zIndexOffset:
                500
        }
    );

        let riderMarkerAdded =
            false;

    customerTrackingMaps.set(
    orderId,
    {
        map,
        riderMarker,
        customerMarker,
        routeLayer: null,
        lastRouteRequestAt: 0,
        lastRouteCoordinates: null,
        routeRequestInProgress: false,
        lastRiderLocationAt: 0,
        staleStatusInterval: null
    }
);

        const riderPath =
            `rider_locations/${tracking.restaurant_id}/${tracking.rider_uid}`;

        const riderReference =
            ref(
                realtimeDatabase,
                riderPath
            );

        const callback =
            onValue(
                riderReference,
                (snapshot) => {
                    if (!snapshot.exists()) {
                        return;
                    }

                    const data =
                        snapshot.val();

                    const latitude =
                        Number(
                            data?.latitude
                        );

                    const longitude =
                        Number(
                            data?.longitude
                        );

                    if (
                        !Number.isFinite(latitude) ||
                        !Number.isFinite(longitude)
                    ) {
                        return;
                    }

                   if (!riderMarkerAdded) {
    riderMarker
        .setLatLng([
            latitude,
            longitude
        ])
        .addTo(map);

    riderMarkerAdded =
        true;

    /*
     * On FIRST load only:
     * show both rider and customer.
     *
     * We intentionally do NOT fitBounds()
     * on later GPS updates because that
     * would keep resetting the customer's
     * manual zoom.
     */
    if (
        customerMarker &&
        Number.isFinite(
            customerLatitude
        ) &&
        Number.isFinite(
            customerLongitude
        )
    ) {
        const bounds =
            L.latLngBounds([
                [
                    latitude,
                    longitude
                ],
                [
                    customerLatitude,
                    customerLongitude
                ]
            ]);

        map.fitBounds(
            bounds,
            {
                padding:
                    [35, 35],

                maxZoom:
                    17
            }
        );
    } else {
        map.setView(
            [
                latitude,
                longitude
            ],
            16
        );
    }
} else {
    riderMarker.setLatLng([
        latitude,
        longitude
    ]);
}


/*
 * Firebase may update GPS frequently.
 *
 * Route calculation is intentionally
 * slower and controlled separately.
 */
if (
    shouldRefreshCustomerDeliveryRoute(
        orderId,
        latitude,
        longitude
    )
) {
    loadCustomerDeliveryRoute(
        order,
        latitude,
        longitude
    );
}

                    const updatedElement =
                        document.getElementById(
                            `customerTrackingUpdated-${orderId}`
                        );

                    const locationUpdatedAt =
                        Number(data?.updated_at || 0);

                    const effectiveUpdatedAt =
                        Number.isFinite(locationUpdatedAt) && locationUpdatedAt > 0
                            ? locationUpdatedAt
                            : Date.now();

                    const trackingMapData =
                        customerTrackingMaps.get(orderId);

                    if (trackingMapData) {
                        trackingMapData.lastRiderLocationAt =
                            effectiveUpdatedAt;
                    }

                    if (updatedElement) {
                        updatedElement.textContent =
                            "Live • updated just now";
                    }
                },
                (error) => {
                    console.error(
                        "Customer live tracking error:",
                        error
                    );
                }
            );

        customerTrackingListeners.set(
            orderId,
            {
                reference:
                    riderReference,

                callback
            }
        );

        const trackingMapData =
            customerTrackingMaps.get(orderId);

        if (trackingMapData) {
            trackingMapData.staleStatusInterval =
                window.setInterval(() => {
                    const updatedElement =
                        document.getElementById(
                            `customerTrackingUpdated-${orderId}`
                        );

                    if (!updatedElement) {
                        return;
                    }

                    const lastUpdatedAt =
                        Number(trackingMapData.lastRiderLocationAt || 0);

                    if (lastUpdatedAt <= 0) {
                        updatedElement.textContent =
                            "Waiting for rider location…";
                        return;
                    }

                    const ageSeconds = Math.max(
                        0,
                        Math.floor((Date.now() - lastUpdatedAt) / 1000)
                    );

                    if (ageSeconds <= 15) {
                        updatedElement.textContent =
                            ageSeconds <= 2
                                ? "Live • updated just now"
                                : `Live • updated ${ageSeconds}s ago`;
                    } else if (ageSeconds <= 60) {
                        updatedElement.textContent =
                            `Location delayed • last update ${ageSeconds}s ago`;
                    } else {
                        const ageMinutes = Math.floor(ageSeconds / 60);
                        updatedElement.textContent =
                            `Location signal interrupted • last update ${ageMinutes}m ago`;
                    }
                }, 5000);
        }

        window.setTimeout(
            () => {
                map.invalidateSize();
            },
            100
        );

    } catch (error) {
        console.error(
            "Unable to start customer tracking:",
            error
        );

        mapElement.innerHTML = `
            <div class="customer-tracking-error">
                Live rider tracking is currently unavailable.
            </div>
        `;
    }
}

function renderFilteredCustomerOrders() {
    const ordersContent =
        document.getElementById(
            "ordersContent"
        );

    if (!ordersContent) {
        return;
    }

    /*
     * IMPORTANT:
     * The order list is about to be rebuilt.
     *
     * Properly destroy existing Leaflet maps
     * and Firebase listeners first so they
     * never remain attached to removed DOM.
     */
    for (
        const orderId
        of Array.from(
            customerTrackingMaps.keys()
        )
    ) {
        destroyCustomerTrackingMap(
            orderId
        );
    }

    const filteredOrders =
        customerOrders.filter(
            (order) => {
                const orderId =
                    Number(
                        order.order_id
                    );

                const status =
                    getCustomerTrackingStatus(
                        order
                    );

                if (
                    status ===
                        "completed" &&
                    clearedCompletedOrderIds
                        .has(orderId)
                ) {
                    return false;
                }

                if (
                    currentOrderFilter ===
                    "active"
                ) {
                    return ![
                        "completed",
                        "cancelled"
                    ].includes(status);
                }

                if (
                    currentOrderFilter ===
                    "completed"
                ) {
                    return (
                        status ===
                        "completed"
                    );
                }

                return true;
            }
        );

    updateCustomerOrderCounters();

    if (
        filteredOrders.length === 0
    ) {
        let message =
            "No orders found.";

        if (
            currentOrderFilter ===
            "active"
        ) {
            message =
                "No active orders.";
        }

        if (
            currentOrderFilter ===
            "completed"
        ) {
            message =
                "No completed orders.";
        }

        ordersContent.innerHTML = `
            <div class="empty-customer-orders">

                <i class="fa-solid fa-receipt"></i>

                <h3>
                    ${escapeHtml(
                        message
                    )}
                </h3>

                <p>
                    Your submitted orders will appear here.
                </p>

            </div>
        `;

        return;
    }

    ordersContent.innerHTML =
        filteredOrders
            .map(
                buildCustomerOrderCard
            )
            .join("");

    filteredOrders.forEach(
    (order) => {
        if (
            getCustomerTrackingStatus(
                order
            ) === "out_for_delivery"
        ) {
            startCustomerLiveTracking(
                order
            );
        }
    }
);
}

/* =========================================================
   LOAD CUSTOMER ORDERS
========================================================= */


function orderNeedsPayMongoStatusSync(
    order
) {
    const paymentMethod =
        String(
            order?.payment_method || ""
        ).trim();

    const paymentStatus =
        String(
            order?.payment_status || ""
        )
            .trim()
            .toLowerCase();

    const orderType =
        normalizeOrderType(
            order?.order_type
        );

    const qrVerifiedAt =
        String(
            order?.qr_verified_at ?? ""
        ).trim();

    const qrVerifiedFlag =
        order?.qr_verified === true ||
        order?.qr_verified === 1 ||
        order?.qr_verified === "1";

    const qrVerified =
        (
            qrVerifiedAt !== "" &&
            qrVerifiedAt !==
                "0000-00-00 00:00:00"
        ) ||
        qrVerifiedFlag;

    return (
        paymentMethod ===
            "PayMongo QR Ph" &&
        paymentStatus !== "paid" &&
        (
            orderType === "delivery" ||
            (
                [
                    "dine-in",
                    "take-out"
                ].includes(orderType) &&
                qrVerified
            )
        )
    );
}

async function syncPendingPayMongoOrders(
    ordersToCheck
) {
    if (
        currentCustomerTab !== "orders" ||
        !Array.isArray(ordersToCheck)
    ) {
        return false;
    }

    const now =
        Date.now();

    const eligibleOrders =
        ordersToCheck
            .filter(
                orderNeedsPayMongoStatusSync
            )
            .filter(order => {
                const orderId =
                    Number(
                        order?.order_id || 0
                    );

                if (
                    !Number.isInteger(orderId) ||
                    orderId <= 0
                ) {
                    return false;
                }

                const lastAttempt =
                    Number(
                        payMongoPendingSyncLastAttempt
                            .get(orderId) || 0
                    );

                return (
                    now - lastAttempt >=
                    PAYMONGO_PENDING_SYNC_INTERVAL_MS
                );
            })
            .slice(0, 2);

    if (eligibleOrders.length === 0) {
        return false;
    }

    let paymentChanged =
        false;

    for (const order of eligibleOrders) {
        const orderId =
            Number(order.order_id);

        payMongoPendingSyncLastAttempt.set(
            orderId,
            Date.now()
        );

        try {
            const response =
                await fetch(
                    `${API}/sync_paymongo_payment.php`,
                    {
                        method: "POST",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            order_id: orderId
                        })
                    }
                );

            const data =
                await readJsonResponse(
                    response
                );

            if (
                !response.ok ||
                !data.success
            ) {
                console.warn(
                    `PayMongo background sync for Order #${orderId}:`,
                    data.message ||
                    `HTTP ${response.status}`
                );

                continue;
            }

            if (data.paid === true) {
                paymentChanged =
                    true;

                payMongoPendingSyncLastAttempt
                    .delete(orderId);
            }
        } catch (error) {
            console.warn(
                `PayMongo background sync for Order #${orderId} failed:`,
                error
            );
        }
    }

    return paymentChanged;
}

async function loadCustomerOrders(
    showLoading = true
) {
    const ordersContent =
        document.getElementById(
            "ordersContent"
        );

    if (
        customerOrdersLoading ||
        !ordersContent
    ) {
        return false;
    }

    customerOrdersLoading = true;

    if (showLoading) {
        ordersContent.innerHTML = `
            <div class="cart-loading">

                <span class="loading-spinner"></span>

                <p>
                    Loading your orders...
                </p>

            </div>
        `;
    }

    try {
        const response = await fetch(
            `${API}/get_customer_orders.php`,
            {
                credentials:
                    "include",

                cache:
                    "no-store"
            }
        );

        const data =
            await readJsonResponse(
                response
            );

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to load your orders."
            );
        }

    let nextCustomerOrders =
    Array.isArray(
        data.orders
    )
        ? data.orders
        : [];

const paymentChanged =
    await syncPendingPayMongoOrders(
        nextCustomerOrders
    );

/*
 * If PayMongo changed a pending order to paid, fetch once more
 * immediately so the customer UI reflects the confirmed status
 * without waiting for the next 5-second My Orders poll.
 */
if (paymentChanged) {
    const refreshedResponse =
        await fetch(
            `${API}/get_customer_orders.php`,
            {
                credentials:
                    "include",

                cache:
                    "no-store"
            }
        );

    const refreshedData =
        await readJsonResponse(
            refreshedResponse
        );

    if (
        refreshedResponse.ok &&
        refreshedData.success &&
        Array.isArray(
            refreshedData.orders
        )
    ) {
        nextCustomerOrders =
            refreshedData.orders;
    }
}

const nextRenderSignature =
    JSON.stringify(
        nextCustomerOrders
    );

const ordersChanged =
    nextRenderSignature !==
    customerOrdersRenderSignature;

customerOrders =
    nextCustomerOrders;

customerOrdersRenderSignature =
    nextRenderSignature;

syncOpenOrderQrModal();

/*
 * Do NOT rebuild the entire order list
 * every 5 seconds when nothing changed.
 *
 * Rebuilding destroys Leaflet's DOM,
 * causing the gray flash and zoom reset.
 */
if (
    ordersChanged ||
    showLoading
) {
    renderFilteredCustomerOrders();
} else {
    updateCustomerOrderCounters();
}

startCustomerCancelCountdown();

return true;

    } catch (error) {
        console.error(
            "Load customer orders error:",
            error
        );

        ordersContent.innerHTML = `
            <div class="empty-customer-orders">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Please try again."
                    )}
                </p>

            </div>
        `;

        return false;

    } finally {
        customerOrdersLoading =
            false;
    }
}

/* =========================================================
   CART AND MY ORDERS NAVIGATION
========================================================= */

function switchCustomerTab(tabName) {
    const cartTabButton =
        document.getElementById(
            "showCartTabBtn"
        );

    const ordersTabButton =
        document.getElementById(
            "showOrdersTabBtn"
        );

    const cartTabSection =
        document.getElementById(
            "cartTabSection"
        );

    const ordersTabSection =
        document.getElementById(
            "ordersTabSection"
        );

    const showingOrders =
        tabName === "orders";

    currentCustomerTab =
        showingOrders
            ? "orders"
            : "cart";

    cartTabButton?.classList.toggle(
        "active",
        !showingOrders
    );

    ordersTabButton?.classList.toggle(
        "active",
        showingOrders
    );

    cartTabButton?.setAttribute(
        "aria-selected",
        String(!showingOrders)
    );

    ordersTabButton?.setAttribute(
        "aria-selected",
        String(showingOrders)
    );

    if (cartTabSection) {
        cartTabSection.hidden =
            showingOrders;

        cartTabSection.classList.toggle(
            "active",
            !showingOrders
        );
    }

    if (ordersTabSection) {
        ordersTabSection.hidden =
            !showingOrders;

        ordersTabSection.classList.toggle(
            "active",
            showingOrders
        );
    }

    if (showingOrders) {
        void loadCustomerOrders(
            customerOrders.length === 0
        );
    }

   window.scrollTo({
    top: 0,
    behavior: "smooth"
});
}


async function handlePayMongoReturn() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const returnState =
        String(
            params.get(
                "paymongo_return"
            ) || ""
        )
            .trim()
            .toLowerCase();

    const orderId =
        Number(
            params.get("order_id") || 0
        );

    if (
        !["success", "cancelled"]
            .includes(returnState)
    ) {
        return;
    }

    const cleanedUrl =
        new URL(
            window.location.href
        );

    cleanedUrl.searchParams.delete(
        "paymongo_return"
    );

    cleanedUrl.searchParams.delete(
        "order_id"
    );

    window.history.replaceState(
        {},
        "",
        cleanedUrl.pathname +
            cleanedUrl.search +
            cleanedUrl.hash
    );

    switchCustomerTab("orders");

    if (returnState === "cancelled") {
        showToast(
            "Payment Not Completed",
            "Your order is still waiting for payment. You can try again from My Orders."
        );

        await loadCustomerOrders(true);
        return;
    }

    try {
        showToast(
            "Confirming Payment",
            "Checking your PayMongo payment..."
        );

        const response =
            await fetch(
                `${API}/sync_paymongo_payment.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        order_id: orderId
                    })
                }
            );

        const data =
            await readJsonResponse(
                response
            );

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to confirm the payment right now."
            );
        }

        if (data.paid) {
            showToast(
                "Payment Confirmed",
                "Your payment was successful. The restaurant can now process your order."
            );
        } else {
            showToast(
                "Payment Processing",
                "Your payment is still being confirmed. Refresh My Orders in a moment."
            );
        }
    } catch (error) {
        console.error(
            "PayMongo return sync error:",
            error
        );

        showToast(
            "Payment Confirmation Delayed",
            "Your payment may already be successful, but FoodConnect could not confirm it yet. Refresh My Orders shortly."
        );
    }

    await loadCustomerOrders(true);
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        void handlePayMongoReturn();

        const customerCancelModal =
    document.getElementById(
        "customerCancelModal"
    );

const closeCustomerCancelButton =
    document.getElementById(
        "closeCustomerCancelModal"
    );

const backCustomerCancelButton =
    document.getElementById(
        "backCustomerCancelModal"
    );

const confirmCustomerCancelButton =
    document.getElementById(
        "confirmCustomerCancelBtn"
    );

const customerCancelBackdrop =
    document.querySelector(
        "[data-close-customer-cancel-modal]"
    );

const customerCancelReasonInputs =
    document.querySelectorAll(
        'input[name="customerCancelReason"]'
    );

const customerOtherReasonGroup =
    document.getElementById(
        "customerOtherReasonGroup"
    );

const customerOtherReasonInput =
    document.getElementById(
        "customerOtherCancelReason"
    );

    closeCustomerCancelButton
    ?.addEventListener(
        "click",
        closeCustomerCancelModal
    );

backCustomerCancelButton
    ?.addEventListener(
        "click",
        closeCustomerCancelModal
    );

customerCancelBackdrop
    ?.addEventListener(
        "click",
        closeCustomerCancelModal
    );

confirmCustomerCancelButton
    ?.addEventListener(
        "click",
        submitCustomerCancellation
    );

customerCancelReasonInputs.forEach(
    (radio) => {
        radio.addEventListener(
            "change",
            () => {
                const isOther =
                    radio.checked &&
                    radio.value ===
                        "other";

                if (
                    customerOtherReasonGroup
                ) {
                    customerOtherReasonGroup.hidden =
                        !isOther;
                }

                if (
                    !isOther &&
                    customerOtherReasonInput
                ) {
                    customerOtherReasonInput.value =
                        "";
                }

                showCustomerCancelMessage();

                if (isOther) {
                    window.setTimeout(
                        () => {
                            customerOtherReasonInput
                                ?.focus();
                        },
                        50
                    );
                }
            }
        );
    }
);

const showCartTabButton =
    document.getElementById(
        "showCartTabBtn"
    );

const showOrdersTabButton =
    document.getElementById(
        "showOrdersTabBtn"
    );

        const backButton =
            document.getElementById("backBtn");

        const continueShoppingButton =
            document.getElementById(
                "continueShoppingBtn"
            );

        const clearCartButton =
            document.getElementById(
                "clearCartBtn"
            );

        const checkoutButton =
            document.getElementById(
                "checkoutBtn"
            );

        const checkoutSection =
            document.getElementById(
                "checkoutSection"
            );

        const backToCartButton =
            document.getElementById(
                "backToCartBtn"
            );

        const backToCartSecondaryButton =
            document.getElementById(
                "backToCartSecondaryBtn"
            );

        const orderType =
            document.getElementById(
                "orderType"
            );

        const placeOrderButton =
            document.getElementById(
                "placeOrderBtn"
            );

        const contactNumberInput =
            document.getElementById(
                "contactNumber"
            );

            const closeOrderQrButton =
    document.getElementById(
        "closeOrderQrModal"
    );

const orderQrBackdrop =
    document.querySelector(
        "[data-close-order-qr]"
    );

const orderQrGoToOrdersButton =
    document.getElementById(
        "orderQrGoToOrders"
    );

closeOrderQrButton?.addEventListener(
    "click",
    closeOrderQrModal
);

orderQrGoToOrdersButton
    ?.addEventListener(
        "click",
        async () => {
            closeOrderQrModal();

            switchCustomerTab(
                "orders"
            );

            await loadCustomerOrders(
                true
            );
        }
    );

const orderQrPayNowButton =
    document.getElementById(
        "orderQrPayNow"
    );

orderQrPayNowButton
    ?.addEventListener(
        "click",
        async () => {
            const orderId =
                Number(
                    orderQrPayNowButton
                        .dataset.orderId || 0
                );

            if (orderId <= 0) {
                showToast(
                    "Payment Unavailable",
                    "The order could not be found. Please refresh and try again."
                );
                return;
            }

            orderQrPayNowButton.disabled = true;

            try {
                await startPayMongoPayment(
                    orderId
                );
            } finally {
                orderQrPayNowButton.disabled = false;
            }
        }
    );

orderQrBackdrop?.addEventListener(
    "click",
    closeOrderQrModal
);

            showCartTabButton?.addEventListener(
    "click",
    () => {
        switchCustomerTab("cart");
    }
);

showOrdersTabButton?.addEventListener(
    "click",
    async () => {
        switchCustomerTab("orders");

        await loadCustomerOrders(
            customerOrders.length === 0
        );
    }
);

const refreshCustomerOrdersButton =
    document.getElementById(
        "refreshCustomerOrdersBtn"
    );

const clearCompletedOrdersButton =
    document.getElementById(
        "clearCompletedOrdersBtn"
    );

const orderFilterButtons =
    document.querySelectorAll(
        ".customer-order-filter"
    );

const ordersContent =
    document.getElementById(
        "ordersContent"
    );

clearedCompletedOrderIds =
    getClearedCompletedOrderIds();

refreshCustomerOrdersButton
    ?.addEventListener(
        "click",
        async () => {
            await loadCustomerOrders(
                true
            );
        }
    );

orderFilterButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                orderFilterButtons
                    .forEach(
                        (
                            filterButton
                        ) => {
                            filterButton
                                .classList
                                .remove(
                                    "active"
                                );
                        }
                    );

                button.classList.add(
                    "active"
                );

                currentOrderFilter =
                    button.dataset
                        .orderFilter ||
                    "active";

                renderFilteredCustomerOrders();
            }
        );
    }
);

clearCompletedOrdersButton
    ?.addEventListener(
        "click",
        () => {
            const completedOrders =
                customerOrders.filter(
                    (order) =>
                        getCustomerTrackingStatus(
                            order
                        ) ===
                        "completed"
                );

            if (
                completedOrders.length ===
                0
            ) {
                window.alert(
                    "There are no completed orders to clear."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Clear completed orders from this list? This will not delete them from the database."
                );

            if (!confirmed) {
                return;
            }

            completedOrders.forEach(
                (order) => {
                    const orderId =
                        Number(
                            order.order_id
                        );

                    if (
                        Number.isInteger(
                            orderId
                        ) &&
                        orderId > 0
                    ) {
                        clearedCompletedOrderIds
                            .add(
                                orderId
                            );
                    }
                }
            );

            saveClearedCompletedOrderIds();
            renderFilteredCustomerOrders();
        }
    );

ordersContent?.addEventListener(
    "click",
    async (event) => {

const payOrderButton =
    event.target.closest(
        "[data-pay-order]"
    );

if (payOrderButton) {
    const orderId =
        Number(
            payOrderButton.dataset.payOrder
        );

    if (
        Number.isInteger(orderId) &&
        orderId > 0
    ) {
        payOrderButton.disabled = true;

        try {
            await startPayMongoPayment(orderId);
        } catch (error) {
            payOrderButton.disabled = false;
            window.alert(
                error.message ||
                "Unable to start PayMongo payment."
            );
            await loadCustomerOrders(true);
        }
    }

    return;
}

const cancelOrderButton =
    event.target.closest(
        "[data-cancel-customer-order]"
    );

if (cancelOrderButton) {
    const orderId =
        Number(
            cancelOrderButton.dataset
                .cancelCustomerOrder
        );

    if (
        Number.isInteger(orderId) &&
        orderId > 0
    ) {
        openCustomerCancelModal(
            orderId
        );
    }

    return;
}

        const showQrButton =
            event.target.closest(
                "[data-show-order-qr]"
            );

        if (showQrButton) {
            const orderId =
                Number(
                    showQrButton.dataset
                        .showOrderQr
                );

            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                return;
            }

            const order =
                customerOrders.find(
                    (customerOrder) =>
                        Number(
                            customerOrder.order_id
                        ) === orderId
                );

            if (!order) {
                window.alert(
                    "The order could not be found. Please refresh your orders."
                );

                return;
            }

            if (
                getCustomerTrackingStatus(
                    order
                ) !== "waiting_for_qr"
            ) {
                window.alert(
                    "This order QR has already been verified."
                );

                loadCustomerOrders(true);
                return;
            }

            if (
                !String(
                    order.order_qr_token || ""
                ).trim()
            ) {
                window.alert(
                    "The QR code is unavailable. Please refresh your orders."
                );

                loadCustomerOrders(true);
                return;
            }

            showOrderQrModal(order);
            return;
        }

        const toggleButton =
            event.target.closest(
                "[data-toggle-customer-order]"
            );

        if (!toggleButton) {
            return;
        }

        const orderId =
            Number(
                toggleButton.dataset
                    .toggleCustomerOrder
            );

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {
            return;
        }

        if (
            expandedCustomerOrderIds
                .has(orderId)
        ) {
            expandedCustomerOrderIds
                .delete(orderId);
        } else {
            expandedCustomerOrderIds
                .add(orderId);
        }

        renderFilteredCustomerOrders();
    }
);

        backButton?.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                goBackToMenu();
            }
        );

        continueShoppingButton?.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                goBackToMenu();
            }
        );
clearCartButton?.addEventListener(
            "click",
            async () => {
                const confirmed =
                    window.confirm(
                        "Remove every item from your cart?"
                    );

                if (!confirmed) {
                    return;
                }

                clearCartButton.disabled = true;

                try {
                    const response = await fetch(
                        `${API}/cart_clear.php`,
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                    const data =
                        await readJsonResponse(response);

                    if (
                        !response.ok ||
                        !data.success
                    ) {
                        throw new Error(
                            data.message ||
                            "Failed to clear cart."
                        );
                    }

                    if (checkoutSection) {
                        checkoutSection.style.display =
                            "none";
                    }

                    await loadCart();

                    showCartNotice(
                        "Your cart has been cleared.",
                        "success"
                    );
                } catch (error) {
                    console.error(
                        "Clear cart error:",
                        error
                    );

                    showCartNotice(
                        error.message ||
                        "Unable to clear your cart.",
                        "error"
                    );

                    clearCartButton.disabled =
                        false;
                }
            }
        );

        checkoutButton?.addEventListener(
            "click",
            () => {
                const totalItems =
                    Number(
                        document
                            .getElementById(
                                "totalItems"
                            )
                            ?.textContent || 0
                    );

                if (totalItems <= 0) {
                    showCartNotice(
                        "Your cart is empty.",
                        "error"
                    );

                    return;
                }

                if (checkoutSection) {
                    checkoutSection.style.display =
                        "block";

                    checkoutSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );

        function closeCheckout() {
            if (checkoutSection) {
                checkoutSection.style.display =
                    "none";
            }

            showCheckoutMessage();

            document
    .getElementById(
        "cartTabSection"
    )
    ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
        }

        backToCartButton?.addEventListener(
            "click",
            closeCheckout
        );

        backToCartSecondaryButton?.addEventListener(
            "click",
            closeCheckout
        );

        orderType?.addEventListener(
            "change",
            updateOrderTypeFields
        );

        placeOrderButton?.addEventListener(
            "click",
            placeOrder
        );

        switchCustomerTab("cart");

clearedCompletedOrderIds =
    getClearedCompletedOrderIds();

loadCart();

/*
 * Fetch order counters once without blocking the Cart tab.
 * Continuous order polling is only needed while My Orders
 * is actually visible.
 */
loadCustomerOrders(false);

if (
    customerOrdersInterval ===
    null
) {
    customerOrdersInterval =
        window.setInterval(
            () => {
                const qrModal =
                    document.getElementById(
                        "orderQrModal"
                    );

                const qrModalIsOpen =
                    activeQrModalOrderId > 0 &&
                    qrModal?.classList.contains(
                        "show"
                    );

                /*
                 * Keep the existing lightweight 5-second polling,
                 * but also refresh while the QR modal is open.
                 *
                 * This lets Dine-In/Takeout customers see the
                 * PayMongo step automatically as soon as the
                 * cashier verifies their QR, without manually
                 * opening My Orders.
                 */
                if (
                
                    currentCustomerTab ===
                        "orders" ||
                    qrModalIsOpen
                ) {
                    loadCustomerOrders(
                        false
                    );
                }
            },
            3000
        );
}
                }
);

window.addEventListener(
    "beforeunload",
    () => {
        if (
            customerOrdersInterval !==
            null
        ) {
            window.clearInterval(
                customerOrdersInterval
            );

            customerOrdersInterval =
                null;
        }
    }
);

document.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Escape") {
            closeOrderQrModal();
        }
    }
);

/* Required for inline cart-item controls. */

window.loadCart = loadCart;
window.handleQtyKey = handleQtyKey;
window.handleQtyInput = handleQtyInput;
window.changeQty = changeQty;
window.removeItem = removeItem;