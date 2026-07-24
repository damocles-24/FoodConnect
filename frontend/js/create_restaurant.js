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

const wizardStatus =
    document.getElementById("wizardStatus");

const wizardStepLabel =
    document.getElementById("wizardStepLabel");

const wizardStepTitle =
    document.getElementById("wizardStepTitle");

const wizardProgressBar =
    document.getElementById("wizardProgressBar");

const businessHoursContainer =
    document.getElementById(
        "businessHoursContainer"
    );

const businessHoursError =
    document.getElementById(
        "businessHoursError"
    );

const restaurantNameInput =
    document.getElementById(
        "restaurantName"
    );

const cuisineInput =
    document.getElementById(
        "cuisine"
    );

const restaurantContactInput =
    document.getElementById(
        "restaurantContact"
    );

const businessEmailInput =
    document.getElementById(
        "businessEmail"
    );

const restaurantDescriptionInput =
    document.getElementById(
        "restaurantDescription"
    );

const restaurantAddressInput =
    document.getElementById(
        "restaurantAddress"
    );

const provinceInput =
    document.getElementById(
        "province"
    );

const cityMunicipalityInput =
    document.getElementById(
        "cityMunicipality"
    );

const barangayInput =
    document.getElementById(
        "barangay"
    );

const postalCodeInput =
    document.getElementById(
        "postalCode"
    );

const minimumOrderInput =
    document.getElementById(
        "minimumOrder"
    );

const deliveryFeeInput =
    document.getElementById(
        "deliveryFee"
    );

const descriptionCounter =
    document.getElementById(
        "descriptionCounter"
    );

const deliveryOptionsError =
    document.getElementById(
        "deliveryOptionsError"
    );

const confirmationCheckbox =
    document.getElementById(
        "confirmationCheckbox"
    );

const confirmationError =
    document.getElementById(
        "confirmationError"
    );

const saveDraftButton =
    document.getElementById(
        "saveDraftButton"
    );

const nextButton =
    document.getElementById(
        "nextButton"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const applyMondayButton =
    document.getElementById(
        "applyMondayButton"
    );

const toastContainer =
    document.getElementById(
        "toastContainer"
    );

const submissionModal =
    document.getElementById(
        "submissionModal"
    );

const modalContinueButton =
    document.getElementById(
        "modalContinueButton"
    );

const submittedState =
    document.getElementById(
        "submittedState"
    );

const applicationReview =
    document.getElementById(
        "applicationReview"
    );

const reviewRestaurantName =
    document.getElementById(
        "reviewRestaurantName"
    );

const reviewCuisine =
    document.getElementById(
        "reviewCuisine"
    );

const reviewRestaurantContact =
    document.getElementById(
        "reviewRestaurantContact"
    );

const reviewBusinessEmail =
    document.getElementById(
        "reviewBusinessEmail"
    );

const reviewAddress =
    document.getElementById(
        "reviewAddress"
    );

const reviewBusinessHours =
    document.getElementById(
        "reviewBusinessHours"
    );

const reviewDeliveryOptions =
    document.getElementById(
        "reviewDeliveryOptions"
    );

const wizardSteps =
    Array.from(
        document.querySelectorAll(
            ".wizard-step"
        )
    );

const progressItems =
    Array.from(
        document.querySelectorAll(
            "[data-progress-step]"
        )
    );

const reviewEditButtons =
    Array.from(
        document.querySelectorAll(
            "[data-edit-step]"
        )
    );

const deliveryOptionInputs =
    Array.from(
        document.querySelectorAll(
            'input[name="delivery_options"]'
        )
    );

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

const TOTAL_STEPS = 5;

const STEP_TITLES = {
    1: "Restaurant details",
    2: "Business location",
    3: "Business hours",
    4: "Order services",
    5: "Review application"
};

const DELIVERY_OPTION_LABELS = {
    pickup:
        "Customer pickup",

    restaurant_delivery:
        "Restaurant delivery",

    foodconnect_delivery:
        "FoodConnect delivery"
};

let currentApplicationStatus =
    "draft";

let currentStep =
    1;

let isSubmitting =
    false;

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
    updateWizardButtons();

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

    nextButton.addEventListener(
        "click",
        handleNextStep
    );

    backButton.addEventListener(
        "click",
        handlePreviousStep
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

            clearFieldError(
                postalCodeInput
            );

            updateWizardButtons();
        }
    );

    [
        restaurantNameInput,
        cuisineInput,
        restaurantContactInput,
        businessEmailInput,
        restaurantDescriptionInput,
        restaurantAddressInput,
        provinceInput,
        cityMunicipalityInput,
        barangayInput,
        minimumOrderInput,
        deliveryFeeInput
    ].forEach((field) => {
        field.addEventListener(
            "input",
            () => {
                clearFieldError(field);
                updateWizardButtons();
            }
        );

        field.addEventListener(
            "change",
            () => {
                clearFieldError(field);
                updateWizardButtons();
            }
        );
    });

    deliveryOptionInputs.forEach(
        (checkbox) => {
            checkbox.addEventListener(
                "change",
                () => {
                    clearDeliveryOptionsError();
                    updateWizardButtons();
                }
            );
        }
    );

    confirmationCheckbox.addEventListener(
        "change",
        () => {
            clearConfirmationError();
            updateWizardButtons();
        }
    );

    reviewEditButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                handleReviewEdit
            );
        }
    );

    modalContinueButton.addEventListener(
        "click",
        () => {
            submissionModal.classList.add(
                "hidden"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
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

    document
        .querySelectorAll(
            ".hours-open, .hours-close"
        )
        .forEach((input) => {
            input.addEventListener(
                "input",
                () => {
                    clearBusinessHoursError();
                    updateWizardButtons();
                }
            );

            input.addEventListener(
                "change",
                () => {
                    clearBusinessHoursError();
                    updateWizardButtons();
                }
            );
        });
}

function handleClosedDayChange(event) {
    const checkbox =
        event.currentTarget;

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

    row.classList.remove(
        "invalid-row"
    );

    openInput.classList.remove(
        "invalid"
    );

    closeInput.classList.remove(
        "invalid"
    );

    clearBusinessHoursError();
    updateWizardButtons();
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
                row.querySelector(
                    ".hours-open"
                );

            const closeInput =
                row.querySelector(
                    ".hours-close"
                );

            const closedInput =
                row.querySelector(
                    ".hours-closed"
                );

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

            row.classList.remove(
                "invalid-row"
            );

            openInput.classList.remove(
                "invalid"
            );

            closeInput.classList.remove(
                "invalid"
            );
        });

    clearBusinessHoursError();
    updateWizardButtons();

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
        const response =
            await fetch(
                API.getApplication,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        const result =
            await parseJsonResponse(
                response
            );

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

        if (
            !response.ok ||
            !result.success
        ) {
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
            result.application || {}
        );

        showForm();
    } catch (error) {
        console.error(
            "Restaurant application load error:",
            error
        );

        loadingState.innerHTML = `
            <div class="status-banner status-rejected">
                <strong>
                    Unable to load restaurant setup.
                </strong>

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

        const schedule =
            hours[day];

        if (!schedule) {
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

        const closedInput =
            row.querySelector(
                ".hours-closed"
            );

        const isClosed =
            Boolean(schedule.closed);

        closedInput.checked =
            isClosed;

        if (
            typeof schedule.open ===
                "string" &&
            schedule.open !== ""
        ) {
            openInput.value =
                schedule.open;
        }

        if (
            typeof schedule.close ===
                "string" &&
            schedule.close !== ""
        ) {
            closeInput.value =
                schedule.close;
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

    deliveryOptionInputs.forEach(
        (checkbox) => {
            checkbox.checked =
                selectedOptions.includes(
                    checkbox.value
                );
        }
    );

    if (selectedOptions.length === 0) {
        const pickupCheckbox =
            deliveryOptionInputs.find(
                (checkbox) =>
                    checkbox.value === "pickup"
            );

        if (pickupCheckbox) {
            pickupCheckbox.checked =
                true;
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
            <strong>
                Application under review
            </strong>

            <br>

            Your restaurant application has already been submitted.
            You cannot edit it until an administrator reviews it.
        `;

        statusBanner.classList.remove(
            "hidden"
        );

        return;
    }

    if (status === "rejected") {
        statusBanner.classList.add(
            "status-rejected"
        );

        statusBanner.innerHTML = `
            <strong>
                Changes are required
            </strong>

            <br>

            ${escapeHtml(
                rejectionReason ||
                "The administrator returned your application for changes."
            )}
        `;

        statusBanner.classList.remove(
            "hidden"
        );

        return;
    }

    statusBanner.classList.add(
        "status-draft"
    );

    statusBanner.innerHTML = `
        <strong>
            Draft application
        </strong>

        <br>

        Your restaurant is not yet visible to customers.
        Complete the setup and submit it for review.
    `;

    statusBanner.classList.remove(
        "hidden"
    );
}

function applyStatusRestrictions(status) {
    const isReadOnly =
        status === "submitted" ||
        status === "approved";

    restaurantForm
        .querySelectorAll(
            "input, textarea"
        )
        .forEach((control) => {
            control.disabled =
                isReadOnly;
        });

    applyMondayButton.disabled =
        isReadOnly;

    reviewEditButtons.forEach(
        (button) => {
            button.disabled =
                isReadOnly;
        }
    );

    if (isReadOnly) {
        confirmationCheckbox
            .closest(".confirmation-check")
            ?.classList.add("hidden");

        document
            .querySelector(".review-notice")
            ?.classList.add("hidden");

        confirmationError.classList.add(
            "hidden"
        );

        submittedState.classList.remove(
            "hidden"
        );

        restaurantForm
            .querySelector(".form-actions")
            ?.classList.add("hidden");

        return;
    }

    confirmationCheckbox
        .closest(".confirmation-check")
        ?.classList.remove("hidden");

    document
        .querySelector(".review-notice")
        ?.classList.remove("hidden");

    confirmationError.classList.remove(
        "hidden"
    );

    submittedState.classList.add(
        "hidden"
    );

    restaurantForm
        .querySelector(".form-actions")
        ?.classList.remove("hidden");
}

function showForm() {
    loadingState.classList.add(
        "hidden"
    );

    restaurantForm.classList.remove(
        "hidden"
    );

    wizardStatus.classList.remove(
        "hidden"
    );

    if (
        currentApplicationStatus ===
            "submitted" ||
        currentApplicationStatus ===
            "approved"
    ) {
        currentStep = 5;
    }

    showWizardStep(
        currentStep,
        false
    );
}

/* =========================================================
   WIZARD NAVIGATION
   ========================================================= */

function showWizardStep(
    step,
    shouldScroll = true
) {
    currentStep =
        Math.min(
            TOTAL_STEPS,
            Math.max(1, step)
        );

    wizardSteps.forEach((section) => {
        const sectionStep =
            Number(
                section.dataset.step
            );

        section.classList.toggle(
            "active",
            sectionStep === currentStep
        );
    });

    progressItems.forEach((item) => {
        const itemStep =
            Number(
                item.dataset.progressStep
            );

        item.classList.toggle(
            "active",
            itemStep === currentStep
        );

        item.classList.toggle(
            "completed",
            itemStep < currentStep
        );
    });

    wizardStepLabel.textContent =
        `Step ${currentStep} of ${TOTAL_STEPS}`;

    wizardStepTitle.textContent =
        STEP_TITLES[currentStep] ||
        "Restaurant setup";

    wizardProgressBar.style.width =
        `${(
            currentStep /
            TOTAL_STEPS
        ) * 100}%`;

    if (currentStep === 5) {
        renderReviewSummary();
    }

    updateWizardButtons();

    if (shouldScroll) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

function handleNextStep() {
    if (
        isSubmitting ||
        nextButton.disabled
    ) {
        return;
    }

    clearValidationErrors();

    if (
        !validateCurrentStep(
            true
        )
    ) {
        updateWizardButtons();
        focusFirstInvalidField();

        showToast(
            "Check this step",
            "Complete all required information before continuing.",
            "error"
        );

        return;
    }

    showWizardStep(
        currentStep + 1
    );
}

function handlePreviousStep() {
    if (
        isSubmitting ||
        currentStep <= 1
    ) {
        return;
    }

    clearValidationErrors();

    showWizardStep(
        currentStep - 1
    );
}

function handleReviewEdit(event) {
    const button =
        event.currentTarget;

    const step =
        Number(
            button.dataset.editStep
        );

    if (
        !Number.isInteger(step) ||
        step < 1 ||
        step >= TOTAL_STEPS
    ) {
        return;
    }

    showWizardStep(step);
}

function updateWizardButtons() {
    const isReadOnly =
        currentApplicationStatus ===
            "submitted" ||
        currentApplicationStatus ===
            "approved";

    backButton.classList.toggle(
        "hidden",
        currentStep === 1 ||
        isReadOnly
    );

    nextButton.classList.toggle(
        "hidden",
        currentStep === TOTAL_STEPS ||
        isReadOnly
    );

    submitButton.classList.toggle(
        "hidden",
        currentStep !== TOTAL_STEPS ||
        isReadOnly
    );

    saveDraftButton.classList.toggle(
        "hidden",
        isReadOnly
    );

    if (!isReadOnly) {
        nextButton.disabled =
            currentStep < TOTAL_STEPS
                ? !validateCurrentStep(false)
                : true;

        submitButton.disabled =
            currentStep === TOTAL_STEPS
                ? !validateFormForSubmission(
                    false
                )
                : true;
    }
}

/* =========================================================
   STEP VALIDATION
   ========================================================= */

function validateCurrentStep(
    showErrors = true
) {
    switch (currentStep) {
        case 1:
            return validateRestaurantDetailsStep(
                showErrors
            );

        case 2:
            return validateLocationStep(
                showErrors
            );

        case 3:
            return validateBusinessHours(
                showErrors
            );

        case 4:
            return validateOrderServicesStep(
                showErrors
            );

        case 5:
            return validateConfirmationStep(
                showErrors
            );

        default:
            return false;
    }
}

function validateRestaurantDetailsStep(
    showErrors = true
) {
    let valid = true;

    valid =
        validateRequiredField(
            restaurantNameInput,
            "Restaurant name is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            cuisineInput,
            "Restaurant type or cuisine is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            restaurantContactInput,
            "Business contact number is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            businessEmailInput,
            "Business email is required.",
            showErrors
        ) && valid;

    if (
        businessEmailInput.value.trim() !== "" &&
        !businessEmailInput.validity.valid
    ) {
        if (showErrors) {
            setFieldError(
                businessEmailInput,
                "Enter a valid email address."
            );
        }

        valid = false;
    }

    return valid;
}

function validateLocationStep(
    showErrors = true
) {
    let valid = true;

    valid =
        validateRequiredField(
            restaurantAddressInput,
            "Street address is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            provinceInput,
            "Province is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            cityMunicipalityInput,
            "City or municipality is required.",
            showErrors
        ) && valid;

    valid =
        validateRequiredField(
            barangayInput,
            "Barangay is required.",
            showErrors
        ) && valid;

    if (
        postalCodeInput.value.trim() !== "" &&
        !/^[0-9]{4,10}$/.test(
            postalCodeInput.value.trim()
        )
    ) {
        if (showErrors) {
            setFieldError(
                postalCodeInput,
                "Postal code must contain 4 to 10 digits."
            );
        }

        valid = false;
    }

    return valid;
}

function validateBusinessHours(
    showErrors = true
) {
    let valid = true;
    let firstErrorMessage = "";

    if (showErrors) {
        clearBusinessHoursError();
    }

    document
        .querySelectorAll(".hours-row")
        .forEach((row) => {
            const day =
                row.dataset.day || "";

            const closedInput =
                row.querySelector(
                    ".hours-closed"
                );

            const openInput =
                row.querySelector(
                    ".hours-open"
                );

            const closeInput =
                row.querySelector(
                    ".hours-close"
                );

            const isClosed =
                closedInput.checked;

            if (showErrors) {
                row.classList.remove(
                    "invalid-row"
                );

                openInput.classList.remove(
                    "invalid"
                );

                closeInput.classList.remove(
                    "invalid"
                );
            }

            if (isClosed) {
                return;
            }

            if (
                openInput.value === "" ||
                closeInput.value === ""
            ) {
                valid = false;

                if (
                    firstErrorMessage === ""
                ) {
                    firstErrorMessage =
                        `Enter opening and closing times for ${day}.`;
                }

                if (showErrors) {
                    row.classList.add(
                        "invalid-row"
                    );

                    if (
                        openInput.value === ""
                    ) {
                        openInput.classList.add(
                            "invalid"
                        );
                    }

                    if (
                        closeInput.value === ""
                    ) {
                        closeInput.classList.add(
                            "invalid"
                        );
                    }
                }

                return;
            }

            if (
                openInput.value ===
                closeInput.value
            ) {
                valid = false;

                if (
                    firstErrorMessage === ""
                ) {
                    firstErrorMessage =
                        `${day}'s opening and closing times cannot be the same.`;
                }

                if (showErrors) {
                    row.classList.add(
                        "invalid-row"
                    );

                    openInput.classList.add(
                        "invalid"
                    );

                    closeInput.classList.add(
                        "invalid"
                    );
                }
            }
        });

    if (
        !valid &&
        showErrors
    ) {
        businessHoursContainer.classList.add(
            "invalid-section"
        );

        businessHoursError.textContent =
            firstErrorMessage ||
            "Enter valid business hours.";
    }

    return valid;
}

function validateOrderServicesStep(
    showErrors = true
) {
    const selectedOptions =
        deliveryOptionInputs.filter(
            (checkbox) =>
                checkbox.checked
        );

    const valid =
        selectedOptions.length > 0;

    if (showErrors) {
        if (valid) {
            clearDeliveryOptionsError();
        } else {
            deliveryOptionsError.textContent =
                "Select at least one order service.";

            document
                .querySelector(
                    ".service-options"
                )
                ?.classList.add(
                    "invalid-section"
                );
        }
    }

    return valid;
}

function validateConfirmationStep(
    showErrors = true
) {
    const valid =
        confirmationCheckbox.checked;

    if (showErrors) {
        if (valid) {
            clearConfirmationError();
        } else {
            confirmationError.textContent =
                "You must confirm that the information is complete and accurate.";

            confirmationCheckbox
                .closest(
                    ".confirmation-check"
                )
                ?.classList.add(
                    "invalid-confirmation"
                );
        }
    }

    return valid;
}

function validateRequiredInformation(
    showErrors = true
) {
    let valid = true;

    valid =
        validateRestaurantDetailsStep(
            showErrors
        ) && valid;

    valid =
        validateLocationStep(
            showErrors
        ) && valid;

    return valid;
}

function validateFormForSubmission(
    showErrors = true
) {
    let valid = true;

    valid =
        validateRequiredInformation(
            showErrors
        ) && valid;

    valid =
        validateBusinessHours(
            showErrors
        ) && valid;

    valid =
        validateOrderServicesStep(
            showErrors
        ) && valid;

    valid =
        validateConfirmationStep(
            showErrors
        ) && valid;

    return valid;
}

/* =========================================================
   SAVE AND SUBMIT
   ========================================================= */

async function handleSaveDraft() {
    if (isSubmitting) {
        return;
    }

    clearValidationErrors();

    const valid =
        validateRequiredInformation(
            true
        );

    if (!valid) {
        openFirstInvalidStep();

        showToast(
            "Missing information",
            "Complete all required restaurant and location fields before saving.",
            "error"
        );

        focusFirstInvalidField();
        return;
    }

    const payload =
        collectFormData("save");

    await saveApplication(
        payload,
        "save"
    );
}

async function handleSubmitApplication(
    event
) {
    event.preventDefault();

    if (
        isSubmitting ||
        currentApplicationStatus ===
            "submitted" ||
        currentApplicationStatus ===
            "approved"
    ) {
        return;
    }

    clearValidationErrors();

    const valid =
        validateFormForSubmission(
            true
        );

    if (!valid) {
        openFirstInvalidStep();

        showToast(
            "Check your application",
            "Complete every required field before submitting.",
            "error"
        );

        focusFirstInvalidField();
        updateWizardButtons();

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
        const response =
            await fetch(
                API.saveApplication,
                {
                    method: "POST",
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        const result =
            await parseJsonResponse(
                response
            );

        if (response.status === 401) {
            window.location.href =
                "/FoodConnect/frontend/html/login.html";

            return;
        }

        if (
            !response.ok ||
            !result.success
        ) {
            if (
                response.status === 422 &&
                result.errors
            ) {
                applyServerValidationErrors(
                    result.errors
                );
            }

            throw new Error(
                result.message ||
                "Unable to save the restaurant application."
            );
        }

        currentApplicationStatus =
            result.status ||
            (
                action === "submit"
                    ? "submitted"
                    : "draft"
            );

        if (action === "submit") {
            currentApplicationStatus =
                "submitted";

            renderApplicationStatus(
                "submitted"
            );

            showWizardStep(
                5,
                false
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

/* =========================================================
   REVIEW SUMMARY
   ========================================================= */

function renderReviewSummary() {
    reviewRestaurantName.textContent =
        valueOrDash(
            restaurantNameInput.value
        );

    reviewCuisine.textContent =
        valueOrDash(
            cuisineInput.value
        );

    reviewRestaurantContact.textContent =
        valueOrDash(
            restaurantContactInput.value
        );

    reviewBusinessEmail.textContent =
        valueOrDash(
            businessEmailInput.value
        );

    const addressParts = [
        restaurantAddressInput.value,
        barangayInput.value,
        cityMunicipalityInput.value,
        provinceInput.value,
        postalCodeInput.value
    ]
        .map((value) =>
            String(value).trim()
        )
        .filter((value) =>
            value !== ""
        );

    reviewAddress.textContent =
        addressParts.length > 0
            ? addressParts.join(", ")
            : "—";

    const hours =
        collectBusinessHours();

    reviewBusinessHours.innerHTML =
        DAYS.map((day) => {
            const schedule =
                hours[day];

            const scheduleText =
                schedule.closed
                    ? "Closed"
                    : `${formatTimeDisplay(
                        schedule.open
                    )} – ${formatTimeDisplay(
                        schedule.close
                    )}`;

            return `
                <div class="review-hour-item">
                    <strong>
                        ${escapeHtml(day)}
                    </strong>

                    <span>
                        ${escapeHtml(scheduleText)}
                    </span>
                </div>
            `;
        }).join("");

    const selectedOptions =
        deliveryOptionInputs
            .filter(
                (checkbox) =>
                    checkbox.checked
            )
            .map(
                (checkbox) =>
                    checkbox.value
            );

    reviewDeliveryOptions.innerHTML =
        selectedOptions.length > 0
            ? selectedOptions
                .map((option) => {
                    const label =
                        DELIVERY_OPTION_LABELS[
                            option
                        ] || option;

                    return `
                        <span class="review-service-tag">
                            ${escapeHtml(label)}
                        </span>
                    `;
                })
                .join("")
            : `
                <span class="review-service-tag">
                    No service selected
                </span>
            `;
}

/* =========================================================
   COLLECT FORM DATA
   ========================================================= */

function collectFormData(action) {
    const selectedDeliveryOptions =
        deliveryOptionInputs
            .filter(
                (checkbox) =>
                    checkbox.checked
            )
            .map(
                (checkbox) =>
                    checkbox.value
            );

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
   VALIDATION ERROR HELPERS
   ========================================================= */

function validateRequiredField(
    field,
    message,
    showErrors = true
) {
    const valid =
        field.value.trim() !== "";

    if (
        !valid &&
        showErrors
    ) {
        setFieldError(
            field,
            message
        );
    }

    return valid;
}

function setFieldError(
    field,
    message
) {
    field.classList.add(
        "invalid"
    );

    const group =
        field.closest(
            ".form-group"
        );

    if (!group) {
        return;
    }

    const errorElement =
        group.querySelector(
            ".field-error"
        );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function clearFieldError(field) {
    field.classList.remove(
        "invalid"
    );

    const group =
        field.closest(
            ".form-group"
        );

    const errorElement =
        group?.querySelector(
            ".field-error"
        );

    if (errorElement) {
        errorElement.textContent = "";
    }
}

function clearBusinessHoursError() {
    businessHoursError.textContent = "";

    businessHoursContainer.classList.remove(
        "invalid-section"
    );

    document
        .querySelectorAll(".hours-row")
        .forEach((row) => {
            row.classList.remove(
                "invalid-row"
            );
        });

    document
        .querySelectorAll(
            ".hours-open, .hours-close"
        )
        .forEach((input) => {
            input.classList.remove(
                "invalid"
            );
        });
}

function clearDeliveryOptionsError() {
    deliveryOptionsError.textContent = "";

    document
        .querySelector(
            ".service-options"
        )
        ?.classList.remove(
            "invalid-section"
        );
}

function clearConfirmationError() {
    confirmationError.textContent = "";

    confirmationCheckbox
        .closest(
            ".confirmation-check"
        )
        ?.classList.remove(
            "invalid-confirmation"
        );
}

function clearValidationErrors() {
    document
        .querySelectorAll(
            ".invalid"
        )
        .forEach((field) => {
            field.classList.remove(
                "invalid"
            );
        });

    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach((errorElement) => {
            errorElement.textContent = "";
        });

    clearBusinessHoursError();
    clearDeliveryOptionsError();
    clearConfirmationError();
}

function openFirstInvalidStep() {
    const invalidField =
        document.querySelector(
            ".form-group .invalid"
        );

    if (invalidField) {
        const section =
            invalidField.closest(
                ".wizard-step"
            );

        const step =
            Number(
                section?.dataset.step
            );

        if (
            Number.isInteger(step)
        ) {
            showWizardStep(
                step,
                false
            );

            return;
        }
    }

    if (
        businessHoursContainer.classList.contains(
            "invalid-section"
        )
    ) {
        showWizardStep(
            3,
            false
        );

        return;
    }

    if (
        document
            .querySelector(
                ".service-options"
            )
            ?.classList.contains(
                "invalid-section"
            )
    ) {
        showWizardStep(
            4,
            false
        );

        return;
    }

    if (
        confirmationCheckbox
            .closest(
                ".confirmation-check"
            )
            ?.classList.contains(
                "invalid-confirmation"
            )
    ) {
        showWizardStep(
            5,
            false
        );
    }
}

function focusFirstInvalidField() {
    const invalidField =
        document.querySelector(
            ".form-group .invalid"
        );

    if (invalidField) {
        invalidField.focus();

        invalidField.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    const invalidHoursInput =
        document.querySelector(
            ".hours-input.invalid"
        );

    if (invalidHoursInput) {
        invalidHoursInput.focus();

        invalidHoursInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }

    if (
        document
            .querySelector(
                ".service-options"
            )
            ?.classList.contains(
                "invalid-section"
            )
    ) {
        deliveryOptionInputs[0]?.focus();

        document
            .querySelector(
                ".service-options"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        return;
    }

    if (
        confirmationCheckbox
            .closest(
                ".confirmation-check"
            )
            ?.classList.contains(
                "invalid-confirmation"
            )
    ) {
        confirmationCheckbox.focus();
    }
}

function applyServerValidationErrors(
    errors
) {
    if (
        !errors ||
        typeof errors !== "object"
    ) {
        return;
    }

    const fieldMap = {
        restaurant_name:
            restaurantNameInput,

        cuisine:
            cuisineInput,

        restaurant_contact:
            restaurantContactInput,

        business_email:
            businessEmailInput,

        restaurant_address:
            restaurantAddressInput,

        province:
            provinceInput,

        city_municipality:
            cityMunicipalityInput,

        barangay:
            barangayInput,

        postal_code:
            postalCodeInput
    };

    Object.entries(errors).forEach(
        ([fieldName, message]) => {
            if (
                fieldName ===
                "business_hours"
            ) {
                businessHoursError.textContent =
                    String(message);

                businessHoursContainer.classList.add(
                    "invalid-section"
                );

                return;
            }

            if (
                fieldName ===
                "delivery_options"
            ) {
                deliveryOptionsError.textContent =
                    String(message);

                document
                    .querySelector(
                        ".service-options"
                    )
                    ?.classList.add(
                        "invalid-section"
                    );

                return;
            }

            const field =
                fieldMap[fieldName];

            if (field) {
                setFieldError(
                    field,
                    String(message)
                );
            }
        }
    );

    openFirstInvalidStep();
    focusFirstInvalidField();
}

/* =========================================================
   SUBMITTING STATE
   ========================================================= */

function setSubmittingState(
    submitting,
    action
) {
    isSubmitting =
        submitting;

    saveDraftButton.disabled =
        submitting;

    nextButton.disabled =
        submitting;

    backButton.disabled =
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
        currentApplicationStatus ===
        "submitted"
    ) {
        applyStatusRestrictions(
            "submitted"
        );

        return;
    }

    updateWizardButtons();
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {
    logoutButton.disabled =
        true;

    try {
        await fetch(
            API.logout,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
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

function redirectApprovedOwner(
    restaurant
) {
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

    window.setTimeout(() => {
        window.location.href =
            "/FoodConnect/frontend/html/owner_dashboard_BH.html";
    }, 1200);
}

function updateDescriptionCounter() {
    const length =
        restaurantDescriptionInput
            .value
            .length;

    descriptionCounter.textContent =
        `${length} / 1000`;
}

function showToast(
    title,
    message,
    type = "success"
) {
    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast ${type}`;

    toast.innerHTML = `
        <strong>
            ${escapeHtml(title)}
        </strong>

        <p>
            ${escapeHtml(message)}
        </p>
    `;

    toastContainer.appendChild(
        toast
    );

    window.setTimeout(() => {
        toast.remove();
    }, 4500);
}

async function parseJsonResponse(
    response
) {
    const responseText =
        await response.text();

    if (
        responseText.trim() === ""
    ) {
        return {};
    }

    try {
        return JSON.parse(
            responseText
        );
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

function normalizeMoneyValue(
    value
) {
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

function formatMoneyInput(
    value
) {
    const number =
        Number.parseFloat(value);

    if (
        !Number.isFinite(number)
    ) {
        return "0.00";
    }

    return Math.max(
        0,
        number
    ).toFixed(2);
}

function formatTimeDisplay(
    time
) {
    if (
        typeof time !== "string" ||
        !/^[0-2][0-9]:[0-5][0-9]$/.test(
            time
        )
    ) {
        return time || "—";
    }

    const [
        hoursText,
        minutes
    ] = time.split(":");

    const hours =
        Number(hoursText);

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHours =
        hours % 12 === 0
            ? 12
            : hours % 12;

    return `${displayHours}:${minutes} ${period}`;
}

function valueOrDash(
    value
) {
    const cleaned =
        String(value).trim();

    return cleaned !== ""
        ? cleaned
        : "—";
}

function escapeHtml(
    value
) {
    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}