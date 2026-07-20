"use strict";

/* =========================================================
   API PATHS
   ========================================================= */

const API_BASE = "/FoodConnect/api";

const API = {
    getApplication:
        `${API_BASE}/get_restaurant_application.php`,

    saveApplication:
        `${API_BASE}/save_restaurant_application.php`,

    logout:
        `${API_BASE}/logout.php`
};

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const loadingState =
    document.getElementById("loadingState");

const restaurantForm =
    document.getElementById("restaurantForm");

const statusBanner =
    document.getElementById("statusBanner");

const businessHoursContainer =
    document.getElementById("businessHoursContainer");

const restaurantNameInput =
    document.getElementById("restaurantName");

const cuisineInput =
    document.getElementById("cuisine");

const restaurantContactInput =
    document.getElementById("restaurantContact");

const businessEmailInput =
    document.getElementById("businessEmail");

const restaurantDescriptionInput =
    document.getElementById("restaurantDescription");

const restaurantAddressInput =
    document.getElementById("restaurantAddress");

const provinceInput =
    document.getElementById("province");

const cityMunicipalityInput =
    document.getElementById("cityMunicipality");

const barangayInput =
    document.getElementById("barangay");

const postalCodeInput =
    document.getElementById("postalCode");

const minimumOrderInput =
    document.getElementById("minimumOrder");

const deliveryFeeInput =
    document.getElementById("deliveryFee");

const descriptionCounter =
    document.getElementById("descriptionCounter");

const deliveryOptionsError =
    document.getElementById("deliveryOptionsError");

const confirmationCheckbox =
    document.getElementById("confirmationCheckbox");

const saveDraftButton =
    document.getElementById("saveDraftButton");

const submitButton =
    document.getElementById("submitButton");

const logoutButton =
    document.getElementById("logoutButton");

const applyMondayButton =
    document.getElementById("applyMondayButton");

const toastContainer =
    document.getElementById("toastContainer");

const submissionModal =
    document.getElementById("submissionModal");

const modalContinueButton =
    document.getElementById("modalContinueButton");

/* =========================================================
   PAGE STATE
   ========================================================= */

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

let currentApplicationStatus = "draft";
let isSubmitting = false;

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);

async function initializePage() {
    renderBusinessHours();
    bindEvents();
    updateDescriptionCounter();

    await loadApplication();
}

/* =========================================================
   EVENT BINDINGS
   ========================================================= */

function bindEvents() {
    restaurantForm.addEventListener(
        "submit",
        handleSubmitApplication
    );

    saveDraftButton.addEventListener(
        "click",
        handleSaveDraft
    );

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

    applyMondayButton.addEventListener(
        "click",
        applyMondayScheduleToAll
    );

    restaurantDescriptionInput.addEventListener(
        "input",
        updateDescriptionCounter
    );

    postalCodeInput.addEventListener(
        "input",
        () => {
            postalCodeInput.value =
                postalCodeInput.value.replace(
                    /[^0-9]/g,
                    ""
                );
        }
    );

    document
        .querySelectorAll(
            'input[name="delivery_options"]'
        )
        .forEach((checkbox) => {
            checkbox.addEventListener(
                "change",
                () => {
                    deliveryOptionsError.textContent = "";
                }
            );
        });

    modalContinueButton.addEventListener(
        "click",
        () => {
            submissionModal.classList.add("hidden");
            window.location.reload();
        }
    );
}

/* =========================================================
   BUSINESS HOURS UI
   ========================================================= */

function renderBusinessHours() {
    businessHoursContainer.innerHTML =
        DAYS.map((day) => {
            const dayKey =
                day.toLowerCase();

            return `
                <div
                    class="hours-row"
                    data-day="${escapeHtml(day)}"
                >
                    <div class="hours-day">
                        ${escapeHtml(day)}
                    </div>

                    <input
                        type="time"
                        class="hours-input hours-open"
                        id="${dayKey}Open"
                        value="08:00"
                        aria-label="${escapeHtml(day)} opening time"
                    >

                    <input
                        type="time"
                        class="hours-input hours-close"
                        id="${dayKey}Close"
                        value="20:00"
                        aria-label="${escapeHtml(day)} closing time"
                    >

                    <label class="closed-label">
                        <input
                            type="checkbox"
                            class="hours-closed"
                            id="${dayKey}Closed"
                        >

                        Closed
                    </label>
                </div>
            `;
        }).join("");

    document
        .querySelectorAll(".hours-closed")
        .forEach((checkbox) => {
            checkbox.addEventListener(
                "change",
                handleClosedDayChange
            );
        });
}

function handleClosedDayChange(event) {
    const checkbox = event.currentTarget;

    const row =
        checkbox.closest(".hours-row");

    if (!row) {
        return;
    }

    const openInput =
        row.querySelector(".hours-open");

    const closeInput =
        row.querySelector(".hours-close");

    openInput.disabled =
        checkbox.checked;

    closeInput.disabled =
        checkbox.checked;
}

function applyMondayScheduleToAll() {
    const mondayRow =
        document.querySelector(
            '.hours-row[data-day="Monday"]'
        );

    if (!mondayRow) {
        return;
    }

    const mondayOpen =
        mondayRow.querySelector(
            ".hours-open"
        ).value;

    const mondayClose =
        mondayRow.querySelector(
            ".hours-close"
        ).value;

    const mondayClosed =
        mondayRow.querySelector(
            ".hours-closed"
        ).checked;

    document
        .querySelectorAll(".hours-row")
        .forEach((row) => {
            const openInput =
                row.querySelector(".hours-open");

            const closeInput =
                row.querySelector(".hours-close");

            const closedInput =
                row.querySelector(".hours-closed");

            openInput.value =
                mondayOpen;

            closeInput.value =
                mondayClose;

            closedInput.checked =
                mondayClosed;

            openInput.disabled =
                mondayClosed;

            closeInput.disabled =
                mondayClosed;
        });

    showToast(
        "Schedule copied",
        "Monday's schedule was applied to every day.",
        "success"
    );
}

/* =========================================================
   LOAD APPLICATION
   ========================================================= */

async function loadApplication() {
    try {
        const response = await fetch(
            API.getApplication,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const result =
            await parseJsonResponse(response);

        if (response.status === 401) {
            window.location.href =
                "/FoodConnect/frontend/html/login.html";

            return;
        }

        if (response.status === 403) {
            throw new Error(
                result.message ||
                "Only restaurant owners can access this page."
            );
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load the restaurant application."
            );
        }

        if (result.has_restaurant) {
            redirectApprovedOwner(
                result.restaurant
            );

            return;
        }

        populateApplication(
            result.application
        );

        showForm();
    } catch (error) {
        console.error(
            "Restaurant application load error:",
            error
        );

        loadingState.innerHTML = `
            <div class="status-banner status-rejected">
                <strong>Unable to load restaurant setup.</strong>
                <br>
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}

function populateApplication(application) {
    currentApplicationStatus =
        String(
            application.application_status ||
            "draft"
        ).toLowerCase();

    restaurantNameInput.value =
        application.restaurant_name || "";

    cuisineInput.value =
        application.cuisine || "";

    restaurantContactInput.value =
        application.restaurant_contact || "";

    businessEmailInput.value =
        application.business_email || "";

    restaurantDescriptionInput.value =
        application.restaurant_description || "";

    restaurantAddressInput.value =
        application.restaurant_address || "";

    provinceInput.value =
        application.province || "";

    cityMunicipalityInput.value =
        application.city_municipality || "";

    barangayInput.value =
        application.barangay || "";

    postalCodeInput.value =
        application.postal_code || "";

    minimumOrderInput.value =
        formatMoneyInput(
            application.minimum_order
        );

    deliveryFeeInput.value =
        formatMoneyInput(
            application.delivery_fee
        );

    populateBusinessHours(
        application.business_hours
    );

    populateDeliveryOptions(
        application.delivery_options
    );

    updateDescriptionCounter();

    renderApplicationStatus(
        currentApplicationStatus,
        application.rejection_reason
    );

    applyStatusRestrictions(
        currentApplicationStatus
    );
}

function populateBusinessHours(hours) {
    if (
        !hours ||
        typeof hours !== "object"
    ) {
        return;
    }

    DAYS.forEach((day) => {
        const row =
            document.querySelector(
                `.hours-row[data-day="${day}"]`
            );

        if (!row) {
            return;
        }

        const daySchedule =
            hours[day];

        if (!daySchedule) {
            return;
        }

        const openInput =
            row.querySelector(".hours-open");

        const closeInput =
            row.querySelector(".hours-close");

        const closedInput =
            row.querySelector(".hours-closed");

        const isClosed =
            Boolean(daySchedule.closed);

        closedInput.checked =
            isClosed;

        if (
            typeof daySchedule.open === "string" &&
            daySchedule.open !== ""
        ) {
            openInput.value =
                daySchedule.open;
        }

        if (
            typeof daySchedule.close === "string" &&
            daySchedule.close !== ""
        ) {
            closeInput.value =
                daySchedule.close;
        }

        openInput.disabled =
            isClosed;

        closeInput.disabled =
            isClosed;
    });
}

function populateDeliveryOptions(options) {
    const selectedOptions =
        Array.isArray(options)
            ? options
            : [];

    document
        .querySelectorAll(
            'input[name="delivery_options"]'
        )
        .forEach((checkbox) => {
            checkbox.checked =
                selectedOptions.includes(
                    checkbox.value
                );
        });

    if (selectedOptions.length === 0) {
        const pickupCheckbox =
            document.querySelector(
                'input[name="delivery_options"][value="pickup"]'
            );

        if (pickupCheckbox) {
            pickupCheckbox.checked = true;
        }
    }
}

function renderApplicationStatus(
    status,
    rejectionReason = ""
) {
    statusBanner.className =
        "status-banner";

    if (status === "submitted") {
        statusBanner.classList.add(
            "status-submitted"
        );

        statusBanner.innerHTML = `
            <strong>Application under review</strong>
            <br>
            Your restaurant application has already been submitted.
            You cannot edit it until an administrator reviews it.
        `;

        statusBanner.classList.remove("hidden");
        return;
    }

    if (status === "rejected") {
        statusBanner.classList.add(
            "status-rejected"
        );

        statusBanner.innerHTML = `
            <strong>Changes are required</strong>
            <br>
            ${escapeHtml(
                rejectionReason ||
                "The administrator returned your application for changes."
            )}
        `;

        statusBanner.classList.remove("hidden");
        return;
    }

    statusBanner.classList.add(
        "status-draft"
    );

    statusBanner.innerHTML = `
        <strong>Draft application</strong>
        <br>
        Your restaurant is not yet visible to customers.
        Complete the setup and submit it for review.
    `;

    statusBanner.classList.remove("hidden");
}

function applyStatusRestrictions(status) {
    const isReadOnly =
        status === "submitted" ||
        status === "approved";

    const formControls =
        restaurantForm.querySelectorAll(
            "input, textarea, button"
        );

    formControls.forEach((control) => {
        if (
            control === logoutButton ||
            control === modalContinueButton
        ) {
            return;
        }

        control.disabled =
            isReadOnly;
    });

    if (isReadOnly) {
        saveDraftButton.classList.add("hidden");
        submitButton.classList.add("hidden");
    }
}

function showForm() {
    loadingState.classList.add("hidden");
    restaurantForm.classList.remove("hidden");
}

/* =========================================================
   SAVE AND SUBMIT
   ========================================================= */

async function handleSaveDraft() {
    if (isSubmitting) {
        return;
    }

    clearValidationErrors();

    const payload =
        collectFormData("save");

    const basicValidation =
        validateRequiredInformation();

    if (!basicValidation) {
        showToast(
            "Missing information",
            "Complete the required restaurant fields before saving.",
            "error"
        );

        focusFirstInvalidField();
        return;
    }

    await saveApplication(
        payload,
        "save"
    );
}

async function handleSubmitApplication(event) {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    clearValidationErrors();

    const isValid =
        validateFormForSubmission();

    if (!isValid) {
        showToast(
            "Check your application",
            "Some required information is missing or invalid.",
            "error"
        );

        focusFirstInvalidField();
        return;
    }

    const payload =
        collectFormData("submit");

    await saveApplication(
        payload,
        "submit"
    );
}

async function saveApplication(
    payload,
    action
) {
    setSubmittingState(
        true,
        action
    );

    try {
        const response = await fetch(
            API.saveApplication,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const result =
            await parseJsonResponse(response);

        if (response.status === 401) {
            window.location.href =
                "FoodConnect/frontend/html/login.html";

            return;
        }

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to save the restaurant application."
            );
        }

        currentApplicationStatus =
            result.status || action;

        if (action === "submit") {
            renderApplicationStatus(
                "submitted"
            );

            applyStatusRestrictions(
                "submitted"
            );

            submissionModal.classList.remove(
                "hidden"
            );

            return;
        }

        renderApplicationStatus(
            "draft"
        );

        showToast(
            "Draft saved",
            result.message ||
            "Restaurant setup draft saved successfully.",
            "success"
        );
    } catch (error) {
        console.error(
            "Restaurant application save error:",
            error
        );

        showToast(
            "Unable to save",
            error.message,
            "error"
        );
    } finally {
        setSubmittingState(
            false,
            action
        );
    }
}

function collectFormData(action) {
    const selectedDeliveryOptions =
        Array.from(
            document.querySelectorAll(
                'input[name="delivery_options"]:checked'
            )
        ).map((checkbox) => checkbox.value);

    return {
        action,

        restaurant_name:
            restaurantNameInput.value.trim(),

        cuisine:
            cuisineInput.value.trim(),

        restaurant_contact:
            restaurantContactInput.value.trim(),

        business_email:
            businessEmailInput.value.trim(),

        restaurant_description:
            restaurantDescriptionInput.value.trim(),

        restaurant_address:
            restaurantAddressInput.value.trim(),

        province:
            provinceInput.value.trim(),

        city_municipality:
            cityMunicipalityInput.value.trim(),

        barangay:
            barangayInput.value.trim(),

        postal_code:
            postalCodeInput.value.trim(),

        business_hours:
            collectBusinessHours(),

        delivery_options:
            selectedDeliveryOptions,

        minimum_order:
            normalizeMoneyValue(
                minimumOrderInput.value
            ),

        delivery_fee:
            normalizeMoneyValue(
                deliveryFeeInput.value
            )
    };
}

function collectBusinessHours() {
    const hours = {};

    document
        .querySelectorAll(".hours-row")
        .forEach((row) => {
            const day =
                row.dataset.day;

            const closed =
                row.querySelector(
                    ".hours-closed"
                ).checked;

            const open =
                row.querySelector(
                    ".hours-open"
                ).value;

            const close =
                row.querySelector(
                    ".hours-close"
                ).value;

            hours[day] = {
                closed,
                open:
                    closed
                        ? null
                        : open,

                close:
                    closed
                        ? null
                        : close
            };
        });

    return hours;
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateRequiredInformation() {
    let valid = true;

    valid =
        validateRequiredField(
            restaurantNameInput,
            "Restaurant name is required."
        ) && valid;

    valid =
        validateRequiredField(
            cuisineInput,
            "Restaurant type or cuisine is required."
        ) && valid;

    valid =
        validateRequiredField(
            restaurantContactInput,
            "Business contact number is required."
        ) && valid;

    valid =
        validateRequiredField(
            restaurantAddressInput,
            "Restaurant address is required."
        ) && valid;

    if (
        businessEmailInput.value.trim() !== "" &&
        !businessEmailInput.validity.valid
    ) {
        setFieldError(
            businessEmailInput,
            "Enter a valid email address."
        );

        valid = false;
    }

    if (
        postalCodeInput.value.trim() !== "" &&
        !/^[0-9]{4,10}$/.test(
            postalCodeInput.value.trim()
        )
    ) {
        setFieldError(
            postalCodeInput,
            "Postal code must contain 4 to 10 digits."
        );

        valid = false;
    }

    return valid;
}

function validateFormForSubmission() {
    let valid =
        validateRequiredInformation();

    const deliveryOptions =
        document.querySelectorAll(
            'input[name="delivery_options"]:checked'
        );

    if (deliveryOptions.length === 0) {
        deliveryOptionsError.textContent =
            "Select at least one order or delivery service.";

        valid = false;
    }

    const hoursAreValid =
        validateBusinessHours();

    valid =
        hoursAreValid && valid;

    if (!confirmationCheckbox.checked) {
        confirmationCheckbox.focus();

        showToast(
            "Confirmation required",
            "Confirm that the restaurant information is accurate.",
            "error"
        );

        valid = false;
    }

    return valid;
}

function validateBusinessHours() {
    let valid = true;

    document
        .querySelectorAll(".hours-row")
        .forEach((row) => {
            const day =
                row.dataset.day;

            const closed =
                row.querySelector(
                    ".hours-closed"
                ).checked;

            if (closed) {
                return;
            }

            const openInput =
                row.querySelector(
                    ".hours-open"
                );

            const closeInput =
                row.querySelector(
                    ".hours-close"
                );

            if (
                openInput.value === "" ||
                closeInput.value === ""
            ) {
                showToast(
                    "Incomplete business hours",
                    `Enter the opening and closing time for ${day}.`,
                    "error"
                );

                valid = false;
                return;
            }

            if (
                openInput.value ===
                closeInput.value
            ) {
                showToast(
                    "Invalid business hours",
                    `${day}'s opening and closing time cannot be the same.`,
                    "error"
                );

                valid = false;
            }
        });

    return valid;
}

function validateRequiredField(
    field,
    message
) {
    if (field.value.trim() !== "") {
        return true;
    }

    setFieldError(
        field,
        message
    );

    return false;
}

function setFieldError(
    field,
    message
) {
    field.classList.add("invalid");

    const group =
        field.closest(".form-group");

    if (!group) {
        return;
    }

    const errorElement =
        group.querySelector(".field-error");

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function clearValidationErrors() {
    document
        .querySelectorAll(".invalid")
        .forEach((field) => {
            field.classList.remove("invalid");
        });

    document
        .querySelectorAll(".field-error")
        .forEach((errorElement) => {
            errorElement.textContent = "";
        });

    deliveryOptionsError.textContent = "";
}

function focusFirstInvalidField() {
    const invalidField =
        document.querySelector(".invalid");

    if (!invalidField) {
        return;
    }

    invalidField.focus();

    invalidField.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {
    logoutButton.disabled = true;

    try {
        await fetch(
            API.logout,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Accept": "application/json"
                }
            }
        );
    } catch (error) {
        console.error(
            "Logout error:",
            error
        );
    } finally {
        window.location.href =
            "/FoodConnect/frontend/html/login.html";
    }
}

/* =========================================================
   HELPERS
   ========================================================= */

function redirectApprovedOwner(restaurant) {
    const businessStatus =
        String(
            restaurant?.business_status ||
            ""
        ).toLowerCase();

    if (
        businessStatus === "approved" ||
        businessStatus === "active"
    ) {
        window.location.href =
            "/FoodConnect/frontend/html/owner_dashboard_BH.html";

        return;
    }

    showToast(
        "Restaurant record found",
        "Your restaurant already exists and is awaiting activation.",
        "success"
    );

    setTimeout(() => {
        window.location.href =
            "/FoodConnect/frontend/html/owner_dashboard_BH.html";
    }, 1200);
}

function updateDescriptionCounter() {
    const length =
        restaurantDescriptionInput.value.length;

    descriptionCounter.textContent =
        `${length} / 1000`;
}

function setSubmittingState(
    submitting,
    action
) {
    isSubmitting = submitting;

    saveDraftButton.disabled =
        submitting;

    submitButton.disabled =
        submitting;

    logoutButton.disabled =
        submitting;

    if (submitting) {
        if (action === "submit") {
            submitButton.textContent =
                "Submitting...";
        } else {
            saveDraftButton.textContent =
                "Saving...";
        }

        return;
    }

    saveDraftButton.textContent =
        "Save as draft";

    submitButton.textContent =
        "Submit for review";

    if (
        currentApplicationStatus === "submitted"
    ) {
        applyStatusRestrictions(
            "submitted"
        );
    }
}

function showToast(
    title,
    message,
    type = "success"
) {
    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.innerHTML = `
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
    `;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 4500);
}

async function parseJsonResponse(response) {
    const responseText =
        await response.text();

    if (responseText.trim() === "") {
        return {};
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        console.error(
            "Invalid JSON response:",
            responseText
        );

        throw new Error(
            "The server returned an invalid response."
        );
    }
}

function normalizeMoneyValue(value) {
    const number =
        Number.parseFloat(value);

    if (
        !Number.isFinite(number) ||
        number < 0
    ) {
        return 0;
    }

    return Number(
        number.toFixed(2)
    );
}

function formatMoneyInput(value) {
    const number =
        Number.parseFloat(value);

    if (!Number.isFinite(number)) {
        return "0.00";
    }

    return Math.max(
        0,
        number
    ).toFixed(2);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}