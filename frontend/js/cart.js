const API = "/capshit/api";

let deliveryAvailability = {
    checked: false,
    available: false,
    checking: false,
    availableRiderCount: 0
};

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
    totalItems = 0,
    totalPrice = 0
) {
    const totalItemsElement =
        document.getElementById("totalItems");

    const subtotalElement =
        document.getElementById("subtotalPrice");

    const totalPriceElement =
        document.getElementById("totalPrice");

    if (totalItemsElement) {
        totalItemsElement.textContent =
            String(Number(totalItems || 0));
    }

    if (subtotalElement) {
        subtotalElement.textContent =
            formatPrice(totalPrice);
    }

    if (totalPriceElement) {
        totalPriceElement.textContent =
            formatPrice(totalPrice);
    }

    updateCartBadge(totalItems);
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
    updateTotals(0, 0);

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

        updateTotals(
            data.total_items,
            data.total_price
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

    if (!/^09\d{9}$/.test(contact)) {
        showCheckoutMessage(
            "Enter a valid 11-digit Philippine mobile number starting with 09.",
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

        if (buttonLabel) {
            buttonLabel.textContent =
                "Order Placed";
        }

        orderType.value = "";
        customerName.value = "";
        contactNumber.value = "";
        paymentMethod.value = "";
        resetDeliveryAvailability();

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
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
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
                        .slice(0, 11);
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

        loadCart();
    }
);

/* Required for inline cart-item controls. */

window.loadCart = loadCart;
window.handleQtyKey = handleQtyKey;
window.handleQtyInput = handleQtyInput;
window.changeQty = changeQty;
window.removeItem = removeItem;