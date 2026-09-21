const API_BASE =
    `${window.location.origin}/api`;

const partnerForm =
    document.getElementById("partnerForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton = 
    document.getElementById("submitButton");

const buttonText =
    submitButton?.querySelector(".button-text");

const verificationSuccessPanel =
    document.getElementById(
        "verificationSuccessPanel"
    );

const submittedPartnerEmail =
    document.getElementById(
        "submittedPartnerEmail"
    );

const verificationSuccessNote =
    document.getElementById(
        "verificationSuccessNote"
    );

const continuePartnerSetupButton =
    document.getElementById(
        "continuePartnerSetupButton"
    );

const resendVerificationMessage =
    document.getElementById(
        "resendVerificationMessage"
    );

const resendPartnerVerificationButton =
    document.getElementById(
        "resendPartnerVerificationButton"
    );

const verificationResendRequestHelp =
    document.getElementById(
        "verificationResendRequestHelp"
    );

const openVerificationRequestButton =
    document.getElementById(
        "openVerificationRequestButton"
    );

const verificationRequestPanel =
    document.getElementById(
        "verificationRequestPanel"
    );

const verificationRequestEmail =
    document.getElementById(
        "verificationRequestEmail"
    );

const verificationRequestMessage =
    document.getElementById(
        "verificationRequestMessage"
    );

const submitVerificationRequestButton =
    document.getElementById(
        "submitVerificationRequestButton"
    );

const registerAnotherPartnerButton =
    document.getElementById(
        "registerAnotherPartnerButton"
    );

const cuisineSelect =
    document.getElementById("cuisine");

const otherCuisineGroup =
    document.getElementById("otherCuisineGroup");

const otherCuisineInput =
    document.getElementById("other_cuisine");

let registeredPartnerEmail = "";
let verificationRequestSubmitted = false;
let partnerSetupRedirectUrl =
    "/frontend/html/create_restaurant.html";

/* =========================================================
   MESSAGE HELPERS
   ========================================================= */

function showMessage(type, message) {
    if (!formMessage) {
        return;
    }

    formMessage.className =
        `form-message ${type}`;

    formMessage.textContent =
        message;
}

function clearMessage() {
    if (!formMessage) {
        return;
    }

    formMessage.className =
        "form-message";

    formMessage.textContent =
        "";
}

function showResendMessage(
    type,
    message
) {
    if (!resendVerificationMessage) {
        return;
    }

    resendVerificationMessage.className =
        `form-message ${type}`;

    resendVerificationMessage.textContent =
        message;
}

function clearResendMessage() {
    if (!resendVerificationMessage) {
        return;
    }

    resendVerificationMessage.className =
        "form-message";

    resendVerificationMessage.textContent =
        "";
}

function showVerificationRequestMessage(type, message) {
    if (!verificationRequestMessage) {
        return;
    }

    verificationRequestMessage.className =
        `form-message ${type}`;

    verificationRequestMessage.textContent =
        message;
}

function clearVerificationRequestMessage() {
    if (!verificationRequestMessage) {
        return;
    }

    verificationRequestMessage.className =
        "form-message";

    verificationRequestMessage.textContent =
        "";
}

/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setLoading(isLoading) {
    if (!submitButton) {
        return;
    }

    submitButton.disabled =
        isLoading;

    if (buttonText) {
        buttonText.textContent =
            isLoading
                ? "Submitting Application..."
                : "Submit Partner Application";
    }
}

function setResendButtonLoading(isLoading) {
    if (!resendPartnerVerificationButton) {
        return;
    }

    const label =
        resendPartnerVerificationButton
            .querySelector(".button-text");

    resendPartnerVerificationButton.disabled =
        isLoading || verificationRequestSubmitted;

    if (label) {
        label.textContent =
            verificationRequestSubmitted
                ? "Waiting for Administrator"
                : isLoading
                    ? "Submitting Request..."
                    : "Request New Verification Email";
    }
}

function setVerificationRequestButtonLoading(isLoading) {
    if (!submitVerificationRequestButton) {
        return;
    }

    const label =
        submitVerificationRequestButton
            .querySelector(".button-text");

    submitVerificationRequestButton.disabled =
        isLoading || verificationRequestSubmitted;

    submitVerificationRequestButton.classList.toggle(
        "is-submitted",
        verificationRequestSubmitted
    );

    if (label) {
        label.textContent =
            verificationRequestSubmitted
                ? "Waiting for Administrator"
                : isLoading
                    ? "Submitting Request..."
                    : "Send Request to Administrator";
    }
}

/* =========================================================
   RESPONSE HELPER
   ========================================================= */

async function readJsonResponse(response) {
    const rawResponse =
        await response.text();

    try {
        return JSON.parse(rawResponse);
    } catch (error) {
        console.error(
            "Invalid JSON response:",
            rawResponse
        );

        throw new Error(
            "Something went wrong. Please try again."
        );
    }
}

/* =========================================================
   SUCCESS PANEL
   ========================================================= */

function showVerificationSuccess(
    email,
    options = {}
) {
    registeredPartnerEmail =
        email;

    partnerSetupRedirectUrl =
        String(
            options.redirect_url ||
            "/frontend/html/create_restaurant.html"
        ).trim() ||
        "/frontend/html/create_restaurant.html";

    if (continuePartnerSetupButton) {
        continuePartnerSetupButton.href =
            partnerSetupRedirectUrl;
    }

    const verificationEmailSent =
        options.verification_email_sent !== false;

    if (verificationSuccessNote) {
        verificationSuccessNote.textContent =
            verificationEmailSent
                ? "Your application is saved. Check your email for the 24-hour verification link. You may continue filling in your restaurant details while verification is pending; email verification is required before final setup completion."
                : "Your application is saved, but the first verification email could not be delivered. You may continue filling in your restaurant details. From the restaurant setup page, request a new verification email for FoodConnect administrator approval.";
    }

    verificationRequestSubmitted = false;
    verificationResendRequestHelp?.setAttribute(
        "hidden",
        ""
    );

    if (submittedPartnerEmail) {
        submittedPartnerEmail.textContent =
            email;
    }

    partnerForm?.setAttribute(
        "hidden",
        ""
    );

    verificationSuccessPanel?.removeAttribute(
        "hidden"
    );

    clearMessage();
    clearResendMessage();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showApplicationForm() {
    registeredPartnerEmail = "";
    verificationRequestSubmitted = false;
    partnerSetupRedirectUrl =
        "/frontend/html/create_restaurant.html";

    if (continuePartnerSetupButton) {
        continuePartnerSetupButton.href =
            partnerSetupRedirectUrl;
    }

    verificationSuccessPanel?.setAttribute(
        "hidden",
        ""
    );

    partnerForm?.removeAttribute(
        "hidden"
    );

    verificationResendRequestHelp?.removeAttribute(
        "hidden"
    );

    verificationRequestPanel?.setAttribute(
        "hidden",
        ""
    );

    openVerificationRequestButton?.setAttribute(
        "aria-expanded",
        "false"
    );

    partnerForm?.reset();

    if (verificationRequestEmail) {
        verificationRequestEmail.value = "";
    }

    clearMessage();
    clearResendMessage();
    clearVerificationRequestMessage();

    setResendButtonLoading(false);
    setVerificationRequestButtonLoading(false);

    document
        .getElementById("first_name")
        ?.focus();
}

/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

document
    .querySelectorAll(".toggle-password")
    .forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(
                        targetId
                    );

                const icon =
                    button.querySelector("i");

                if (!input || !icon) {
                    return;
                }

                const isPassword =
                    input.type === "password";

                input.type =
                    isPassword
                        ? "text"
                        : "password";

                icon.className =
                    isPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";

                button.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );
            }
        );
    });

    /* =========================================================
   CONTACT NUMBER INPUT
========================================================= */

[
    "contact_number",
    "restaurant_contact"
].forEach((id) => {
    const input =
        document.getElementById(id);

    input?.addEventListener(
        "input",
        () => {
            input.value =
                input.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
        }
    );
});

/* =========================================================
   OTHER RESTAURANT TYPE
   ========================================================= */

function syncOtherCuisineField() {
    const usesOtherType =
        cuisineSelect?.value === "Other";

    if (!otherCuisineGroup || !otherCuisineInput) {
        return;
    }

    if (usesOtherType) {
        otherCuisineGroup.removeAttribute("hidden");
        otherCuisineInput.required = true;
        return;
    }

    otherCuisineGroup.setAttribute("hidden", "");
    otherCuisineInput.required = false;
    otherCuisineInput.value = "";
}

cuisineSelect?.addEventListener(
    "change",
    () => {
        const selectedOther =
            cuisineSelect.value === "Other";

        syncOtherCuisineField();

        if (selectedOther) {
            otherCuisineInput?.focus();
        }
    }
);

partnerForm?.addEventListener(
    "reset",
    () => {
        window.setTimeout(
            syncOtherCuisineField,
            0
        );
    }
);

syncOtherCuisineField();

/* =========================================================
   PARTNER REGISTRATION
   ========================================================= */

partnerForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        clearMessage();

        const firstName =
            document
                .getElementById("first_name")
                ?.value
                .trim() || "";

        const middleName =
            document
                .getElementById("middle_name")
                ?.value
                .trim() || "";

        const lastName =
            document
                .getElementById("last_name")
                ?.value
                .trim() || "";

        const email =
            document
                .getElementById("email")
                ?.value
                .trim()
                .toLowerCase() || "";

        const contactNumber =
            document
                .getElementById("contact_number")
                ?.value
                .trim() || "";

        const password =
            document
                .getElementById("password")
                ?.value || "";

        const confirmPassword =
            document
                .getElementById("confirm_password")
                ?.value || "";

        const restaurantName =
            document
                .getElementById("restaurant_name")
                ?.value
                .trim() || "";

        const restaurantAddress =
            document
                .getElementById("restaurant_address")
                ?.value
                .trim() || "";

        const restaurantContact =
            document
                .getElementById("restaurant_contact")
                ?.value
                .trim() || "";

        const selectedCuisine =
            cuisineSelect?.value || "";

        const otherCuisine =
            otherCuisineInput
                ?.value
                .trim() || "";

        const cuisine =
            selectedCuisine === "Other"
                ? otherCuisine
                : selectedCuisine;

        const agreement =
            document
                .getElementById("agreement")
                ?.checked || false;

        if (
            selectedCuisine === "Other" &&
            !otherCuisine
        ) {
            showMessage(
                "error",
                "Please specify the restaurant type."
            );

            otherCuisineInput?.focus();

            return;
        }

        if (
            !firstName ||
            !lastName ||
            !email ||
            !contactNumber ||
            !password ||
            !confirmPassword ||
            !restaurantName ||
            !restaurantAddress ||
            !restaurantContact ||
            !cuisine
        ) {
            showMessage(
                "error",
                "Please complete all required fields."
            );

            return;
        }
const philippineMobilePattern =
    /^9\d{9}$/;

if (
    !philippineMobilePattern.test(
        contactNumber
    )
) {
    showMessage(
        "error",
        "Personal contact number must start with 9 and contain 10 digits after +63."
    );

    document
        .getElementById("contact_number")
        ?.focus();

    return;
}

if (
    !philippineMobilePattern.test(
        restaurantContact
    )
) {
    showMessage(
        "error",
        "Business contact number must start with 9 and contain 10 digits after +63."
    );

    document
        .getElementById("restaurant_contact")
        ?.focus();

    return;
}

        if (password.length < 8) {
            showMessage(
                "error",
                "Password must contain at least 8 characters."
            );

            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            showMessage(
                "error",
                "Passwords do not match."
            );

            return;
        }

        if (!agreement) {
            showMessage(
                "error",
                "Please confirm that the provided information is accurate."
            );

            return;
        }

        const payload = {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            email,
            contact_number:
            window.FoodConnectPhone.normalize(contactNumber),
            password,
            restaurant_name: restaurantName,
            restaurant_address: restaurantAddress,
            restaurant_contact:
            window.FoodConnectPhone.normalize(restaurantContact),
            cuisine
        };

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE}/partner_register.php`,
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
                await readJsonResponse(
                    response
                );

            if (
                !response.ok ||
                !result.success
            ) {
                if (result.application_saved) {
                    showVerificationSuccess(
                        email,
                        result
                    );
                    partnerForm.reset();

                    showResendMessage(
                        "error",
                        result.message ||
                        "Your application was saved, but the verification email could not be sent. Request a new verification email from the FoodConnect administrator."
                    );

                    return;
                }

                throw new Error(
                    result.message ||
                    "Unable to submit the application."
                );
            }

            /*
            Do not reset the form before preserving
            the registered owner email.
            */

            showVerificationSuccess(
                email,
                result
            );

            partnerForm.reset();
        } catch (error) {
            console.error(
                "Partner application error:",
                error
            );

            showMessage(
                "error",
                error.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }
);

/* =========================================================
   PARTNER VERIFICATION RESEND REQUEST
   The owner requests; only an authenticated administrator can send.
   ========================================================= */

async function submitPartnerVerificationResendRequest(email, messageTarget = "success") {
    const normalizedEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    if (!normalizedEmail) {
        const message =
            "Enter the email address used for your partner application.";

        if (messageTarget === "panel") {
            showVerificationRequestMessage("error", message);
        } else {
            showResendMessage("error", message);
        }

        return false;
    }

    const emailLooksValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            normalizedEmail
        );

    if (!emailLooksValid) {
        const message =
            "Enter a valid email address.";

        if (messageTarget === "panel") {
            showVerificationRequestMessage("error", message);
        } else {
            showResendMessage("error", message);
        }

        return false;
    }

    if (messageTarget === "panel") {
        clearVerificationRequestMessage();
        setVerificationRequestButtonLoading(true);
    } else {
        clearResendMessage();
        setResendButtonLoading(true);
    }

    try {
        const response = await fetch(
            `${API_BASE}/request_partner_verification_resend.php`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email: normalizedEmail
                })
            }
        );

        const result =
            await readJsonResponse(
                response
            );

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to submit the verification resend request."
            );
        }

        verificationRequestSubmitted =
            Boolean(result.request_pending);

        const successMessage =
            result.message ||
            "Your request is waiting for FoodConnect administrator review.";

        if (messageTarget === "panel") {
            showVerificationRequestMessage(
                "success",
                successMessage
            );
        } else {
            showResendMessage(
                "success",
                successMessage
            );
        }

        setResendButtonLoading(false);
        setVerificationRequestButtonLoading(false);

        return true;
    } catch (error) {
        console.error(
            "Partner verification resend request error:",
            error
        );

        verificationRequestSubmitted = false;

        if (messageTarget === "panel") {
            showVerificationRequestMessage(
                "error",
                error.message ||
                "Unable to submit the verification resend request."
            );
        } else {
            showResendMessage(
                "error",
                error.message ||
                "Unable to submit the verification resend request."
            );
        }

        setResendButtonLoading(false);
        setVerificationRequestButtonLoading(false);

        return false;
    }
}

resendPartnerVerificationButton
    ?.addEventListener(
        "click",
        async () => {
            if (!registeredPartnerEmail) {
                showResendMessage(
                    "error",
                    "The registered partner email is unavailable."
                );
                return;
            }

            await submitPartnerVerificationResendRequest(
                registeredPartnerEmail,
                "success"
            );
        }
    );

openVerificationRequestButton
    ?.addEventListener(
        "click",
        () => {
            const isHidden =
                verificationRequestPanel
                    ?.hasAttribute("hidden");

            if (isHidden) {
                verificationRequestPanel
                    ?.removeAttribute("hidden");

                openVerificationRequestButton
                    .setAttribute(
                        "aria-expanded",
                        "true"
                    );

                window.setTimeout(() => {
                    verificationRequestEmail
                        ?.focus();
                }, 50);
            } else {
                verificationRequestPanel
                    ?.setAttribute(
                        "hidden",
                        ""
                    );

                openVerificationRequestButton
                    .setAttribute(
                        "aria-expanded",
                        "false"
                    );
            }
        }
    );

submitVerificationRequestButton
    ?.addEventListener(
        "click",
        async () => {
            await submitPartnerVerificationResendRequest(
                verificationRequestEmail?.value || "",
                "panel"
            );
        }
    );

verificationRequestEmail
    ?.addEventListener(
        "keydown",
        async (event) => {
            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();

            await submitPartnerVerificationResendRequest(
                verificationRequestEmail.value,
                "panel"
            );
        }
    );

/*
 * Expired owner links are redirected here by verify.php. Open the request
 * panel automatically so an older applicant is never stranded.
 */
const verificationQuery =
    new URLSearchParams(
        window.location.search
    ).get("verification");

if (verificationQuery === "expired") {
    verificationRequestPanel
        ?.removeAttribute("hidden");

    openVerificationRequestButton
        ?.setAttribute(
            "aria-expanded",
            "true"
        );

    showVerificationRequestMessage(
        "error",
        "Your partner verification link has expired. Enter the email used in your application to request a new verification email from the FoodConnect administrator."
    );

    window.setTimeout(() => {
        verificationRequestEmail
            ?.focus();
    }, 80);
}

/* =========================================================
   REGISTER ANOTHER PARTNER
   ========================================================= */

registerAnotherPartnerButton
    ?.addEventListener(
        "click",
        showApplicationForm
    );