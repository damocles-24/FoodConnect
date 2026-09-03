const API_BASE =
    "/api";

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

const resendVerificationMessage =
    document.getElementById(
        "resendVerificationMessage"
    );

const resendPartnerVerificationButton =
    document.getElementById(
        "resendPartnerVerificationButton"
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

let resendCooldownInterval = null;

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
        isLoading;

    if (label) {
        label.textContent =
            isLoading
                ? "Sending Verification..."
                : "Resend Verification Email";
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

function showVerificationSuccess(email) {
    registeredPartnerEmail =
        email;

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

    if (resendCooldownInterval) {
        window.clearInterval(
            resendCooldownInterval
        );

        resendCooldownInterval = null;
    }

    verificationSuccessPanel?.setAttribute(
        "hidden",
        ""
    );

    partnerForm?.removeAttribute(
        "hidden"
    );

    partnerForm?.reset();

    clearMessage();
    clearResendMessage();

    if (
        resendPartnerVerificationButton
    ) {
        resendPartnerVerificationButton.disabled =
            false;

        const label =
            resendPartnerVerificationButton
                .querySelector(".button-text");

        if (label) {
            label.textContent =
                "Resend Verification Email";
        }
    }

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
                email
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
   RESEND VERIFICATION
   ========================================================= */

function startResendCooldown(seconds) {
    if (
        !resendPartnerVerificationButton
    ) {
        return;
    }

    if (resendCooldownInterval) {
        window.clearInterval(
            resendCooldownInterval
        );
    }

    let remaining =
        seconds;

    const label =
        resendPartnerVerificationButton
            .querySelector(".button-text");

    resendPartnerVerificationButton.disabled =
        true;

    if (label) {
        label.textContent =
            `Resend in ${remaining}s`;
    }

    resendCooldownInterval =
        window.setInterval(() => {
            remaining -= 1;

            if (remaining <= 0) {
                window.clearInterval(
                    resendCooldownInterval
                );

                resendCooldownInterval =
                    null;

                resendPartnerVerificationButton.disabled =
                    false;

                if (label) {
                    label.textContent =
                        "Resend Verification Email";
                }

                return;
            }

            if (label) {
                label.textContent =
                    `Resend in ${remaining}s`;
            }
        }, 1000);
}

resendPartnerVerificationButton
    ?.addEventListener(
        "click",
        async () => {
            clearResendMessage();

            if (!registeredPartnerEmail) {
                showResendMessage(
                    "error",
                    "The registered partner email is unavailable."
                );

                return;
            }

            setResendButtonLoading(true);

            try {
                const response = await fetch(
                    `${API_BASE}/resend_verification.php`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                registeredPartnerEmail
                        })
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
                    throw new Error(
                        result.message ||
                        result.error ||
                        "Unable to resend the verification email."
                    );
                }

                showResendMessage(
                    "success",
                    result.message ||
                    "Verification email sent. Please check your inbox."
                );

                startResendCooldown(30);
            } catch (error) {
                console.error(
                    "Partner resend verification error:",
                    error
                );

                showResendMessage(
                    "error",
                    error.message ||
                    "Unable to resend the verification email."
                );

                setResendButtonLoading(false);
            }
        }
    );

/* =========================================================
   REGISTER ANOTHER PARTNER
   ========================================================= */

registerAnotherPartnerButton
    ?.addEventListener(
        "click",
        showApplicationForm
    );