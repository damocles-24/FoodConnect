const API = "/FoodConnect/api";

let deliveryAvailability = {
    checked: false,
    available: false,
    checking: false,
    availableRiderCount: 0
};

let cartPricing = {
    subtotal: 0,
    deliveryFee: 0,
    selectedOrderType: ""
};

/* =========================================================
   CUSTOMER ORDERS STATE
========================================================= */

let customerOrders = [];
let currentOrderFilter = "active";
let customerOrdersLoading = false;
let customerOrdersInterval = null;

let expandedCustomerOrderIds =
    new Set();

let clearedCompletedOrderIds =
    new Set();

const CLEARED_COMPLETED_ORDERS_KEY =
    "foodconnect_cleared_completed_orders";

/* =========================================================
   HELPERS
   ========================================================= */

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
            "The server returned an invalid response."
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
}

function resetCartPricing() {
    cartPricing = {
        subtotal: 0,
        deliveryFee: 0,
        selectedOrderType: ""
    };
}

function getBackPage() {
    return (
        localStorage.getItem("lastPage") ||
        "index.html"
    );
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
                    href="login.html"
                    class="empty-primary-button"
                >
                    <i class="fa-solid fa-right-to-bracket"></i>
                    Log In
                </a>

                <a
                    href="signup.html"
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
                    href="index.html#restaurants"
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
            renderEmptyCart();

            if (checkoutSection) {
                checkoutSection.style.display =
                    "none";
            }

            return;
        }

        cartItemsContainer.innerHTML =
            data.items
                .map(renderCartItem)
                .join("");
        cartPricing.subtotal =
    Number(
        data.subtotal ??
        data.total_price ??
        0
    );

cartPricing.deliveryFee =
    Number(
        data.delivery_fee ?? 0
    );

cartPricing.selectedOrderType =
    document
        .getElementById("orderType")
        ?.value || "";

updateTotals(
    data.total_items
);

        setCartActionState(true);

        if (checkoutSection) {
            checkoutSection.style.display =
                "none";
        }
    } catch (error) {
        console.error(
            "Load cart error:",
            error
        );

        renderLoadError();

        showCartNotice(
            error.message ||
            "Unable to connect to the server.",
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

    const basePrice =
        Number(item.base_price);

    const addonTotal =
        Number(item.addon_total);

    const comboChoiceText =
        String(
            item.combo_choice_text || ""
        ).trim();

    const baseText =
        String(
            item.base_text || ""
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
        <article class="cart-item">

            <div class="cart-item-image">

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

                <h3>
                    ${escapeHtml(item.product_name)}
                </h3>

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

                    <p>
                        <span>
                            Base price
                        </span>

                        <strong>
                            ${formatPrice(basePrice)}
                        </strong>
                    </p>

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

                    <p>
                        <span>
                            Unit price
                        </span>

                        <strong>
                            ${formatPrice(item.unit_price)}
                        </strong>
                    </p>

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

        await loadCart();
        return;
    }

    showCartNotice(
        "Updating quantity...",
        "info"
    );

    try {
        const response = await fetch(
            `${API}/cart_update.php`,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    cart_id: cartId,
                    quantity: newQuantity
                })
            }
        );

        const data =
            await readJsonResponse(response);

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Failed to update quantity."
            );
        }

        await loadCart();

        showCartNotice(
            "Cart quantity updated.",
            "success"
        );
    } catch (error) {
        console.error(
            "Change quantity error:",
            error
        );

        showCartNotice(
            error.message ||
            "Unable to update quantity.",
            "error"
        );

        await loadCart();
    }
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

    try {
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
                "Failed to remove item."
            );
        }

        await loadCart();

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
paymentMethod.value = "";

    resetDeliveryAvailability();
    showCheckoutMessage();

    if (type === "dine-in") {
        paymentMethod.value = "Cash";

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
        paymentMethod.value = "Cash";

        dynamicFields.innerHTML = `
            <label for="pickupTime">
                Pickup Time
            </label>

            <input
                type="time"
                id="pickupTime"
            >

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
        paymentMethod.value =
            "Cash on Delivery";

        dynamicFields.innerHTML = `
            <label for="address">
                Complete Address
            </label>

            <textarea
                id="address"
                rows="3"
                placeholder="House number, street, barangay, and city"
            ></textarea>

            <label for="landmark">
                Landmark
            </label>

            <input
                type="text"
                id="landmark"
                placeholder="Nearby landmark"
            >

            <label for="notes">
                Delivery Instructions
            </label>

            <textarea
                id="notes"
                rows="3"
                placeholder="Optional delivery instructions"
            ></textarea>
        `;

        await checkDeliveryAvailability();
    }

    setPlaceOrderAvailability();
}

/* =========================================================
   PLACE ORDER
   ========================================================= */

let isPlacingOrder = false;

function closeOrderQrModal() {
    const modal =
        document.getElementById(
            "orderQrModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "order-qr-modal-open"
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

 

const qrValue =
    orderData.order_qr_value ||
    (
        "FOODCONNECT_ORDER:" +
        orderData.order_qr_token
    );

    if (!orderData.order_qr_token) {
        console.error(
            "The checkout response did not include an Order QR token."
        );

        return;
    }

    qrContainer.innerHTML = "";

    if (orderIdElement) {
        orderIdElement.textContent =
            orderData.order_id || "—";
    }

    if (queueNumberElement) {
        queueNumberElement.textContent =
            orderData.queue_number || "—";
    }

    new QRCode(
        qrContainer,
        {
            text: qrValue,
            width: 220,
            height: 220,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "order-qr-modal-open"
    );
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

    if (!/^9\d{9}$/.test(contact)) {
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
        contact_number: contact,
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
        const pickupTime =
            document
                .getElementById("pickupTime")
                ?.value
                .trim() || "";

        if (!pickupTime) {
            showCheckoutMessage(
                "Select your preferred pickup time.",
                "error"
            );

            document
                .getElementById("pickupTime")
                ?.focus();

            return;
        }

        payload.pickup_time =
            pickupTime;

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

            document
                .getElementById("address")
                ?.focus();

            return;
        }

        payload.address =
            address;

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
    `Order placed successfully. Your order ID is ${data.order_id}.`,
    "success"
);

if (
    type === "dine-in" ||
    type === "takeout"
) {
    showOrderQrModal(data);
}

        if (buttonLabel) {
            buttonLabel.textContent =
                "Order Placed";
        }

        orderType.value = "";
        customerName.value = "";
        contactNumber.value = "";
        paymentMethod.value = "";
        resetDeliveryAvailability();
        resetCartPricing();
        updateTotals(0);

        document.getElementById(
            "dynamicFields"
        ).innerHTML = "";

        await loadCart();

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
            "Something went wrong during checkout.",
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
            order.order_status
        );

    const deliveryStatus =
        normalizeOrderStatus(
            order.delivery
                ?.delivery_status
        );

    const orderType =
        normalizeOrderType(
            order.order_type
        );

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
        orderStatus === "ready"
    ) {
        return "preparing";
    }

    if (
        orderStatus ===
        "order_received"
    ) {
        return "order_received";
    }

    return orderStatus ||
        "order_received";
}

function getOrderStatusLabel(status) {
    const labels = {
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
                    item.base_text || ""
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
                    key:
                        "order_received",
                    label:
                        "Order Received",
                    icon:
                        "fa-receipt"
                },
                {
                    key:
                        "preparing",
                    label:
                        "Preparing",
                    icon:
                        "fa-fire-burner"
                },
                {
                    key:
                        "out_for_delivery",
                    label:
                        "Out for Delivery",
                    icon:
                        "fa-motorcycle"
                },
                {
                    key:
                        "completed",
                    label:
                        "Completed",
                    icon:
                        "fa-circle-check"
                }
            ]
            : [
                {
                    key:
                        "order_received",
                    label:
                        "Order Received",
                    icon:
                        "fa-receipt"
                },
                {
                    key:
                        "preparing",
                    label:
                        "Preparing",
                    icon:
                        "fa-fire-burner"
                },
                {
                    key:
                        "completed",
                    label:
                        "Completed",
                    icon:
                        "fa-circle-check"
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
                            getOrderStatusLabel(
                                status
                            )
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

                ${buildCustomerOrderTimeline(
                    order,
                    status
                )}

            </div>

        </article>
    `;
}

/* =========================================================
   RENDER CUSTOMER ORDERS
========================================================= */

function renderFilteredCustomerOrders() {
    const ordersContent =
        document.getElementById(
            "ordersContent"
        );

    if (!ordersContent) {
        return;
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
}

/* =========================================================
   LOAD CUSTOMER ORDERS
========================================================= */

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

        customerOrders =
            Array.isArray(
                data.orders
            )
                ? data.orders
                : [];

        renderFilteredCustomerOrders();

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

   window.scrollTo({
    top: 0,
    behavior: "smooth"
});
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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

const viewOrdersAfterCheckoutButton =
    document.getElementById(
        "viewOrdersAfterCheckout"
    );

closeOrderQrButton?.addEventListener(
    "click",
    closeOrderQrModal
);

orderQrBackdrop?.addEventListener(
    "click",
    closeOrderQrModal
);

viewOrdersAfterCheckoutButton
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
    (event) => {
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
            !Number.isInteger(
                orderId
            ) ||
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

        contactNumberInput?.addEventListener(
            "input",
            function () {
                this.value =
                    this.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 10);
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
                .getElementById("cartMainLayout")
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
loadCustomerOrders(true);

if (
    customerOrdersInterval ===
    null
) {
    customerOrdersInterval =
        window.setInterval(
            () => {
                loadCustomerOrders(
                    false
                );
            },
            5000
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

/*contact number validation */

const phone = document.getElementById("contactNumber");

if(phone) {
    phone.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").substring(0, 10);    
    });
}


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