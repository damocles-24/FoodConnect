const API = "/api";

const OWNER_LOGIN_URL = "/?open=partner-portal";

const resetTitle = document.getElementById("resetTitle");
const resetDescription = document.getElementById("resetDescription");
const resetCardIcon = document.getElementById("resetCardIcon");

const resetCheckingPanel = document.getElementById("resetCheckingPanel");
const resetFormPanel = document.getElementById("resetFormPanel");
const resetSuccessPanel = document.getElementById("resetSuccessPanel");
const resetInvalidPanel = document.getElementById("resetInvalidPanel");
const resetInvalidMsg = document.getElementById("resetInvalidMsg");

const ownerResetForm = document.getElementById("ownerResetForm");
const ownerNewPass = document.getElementById("ownerNewPass");
const ownerConfirmPass = document.getElementById("ownerConfirmPass");
const ownerResetMsg = document.getElementById("ownerResetMsg");
const ownerResetSubmitButton = document.getElementById("ownerResetSubmitButton");

const resetToken = (
    new URLSearchParams(window.location.search).get("token") || ""
).trim().toLowerCase();

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function setMessage(element, message = "", type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("error", "success");

    if (message && type) {
        element.classList.add(type);
    }
}

function setButtonLoading(button, isLoading, loadingText, normalText) {
    if (!button) {
        return;
    }

    const label = button.querySelector(".button-label");

    button.disabled = isLoading;

    if (label) {
        label.textContent = isLoading ? loadingText : normalText;
    }
}

async function readJsonResponse(response) {
    const raw = await response.text();

    try {
        return JSON.parse(raw);
    } catch {
        console.error("Unexpected server response:", raw);

        throw new Error("Something went wrong. Please try again.");
    }
}

function showOnly(panel) {
    [
        resetCheckingPanel,
        resetFormPanel,
        resetSuccessPanel,
        resetInvalidPanel
    ].forEach((item) => {
        item?.classList.toggle("hidden", item !== panel);
    });
}

function showFormState() {
    resetTitle.textContent = "Reset Password";
    resetDescription.textContent =
        "Create a new password for your owner account.";
    resetCardIcon.className = "fa-solid fa-key";

    showOnly(resetFormPanel);

    window.setTimeout(() => {
        ownerNewPass?.focus();
    }, 50);
}

function showInvalidState(message = "") {
    resetTitle.textContent = "Link Unavailable";
    resetDescription.textContent =
        "This reset link can no longer be used.";
    resetCardIcon.className = "fa-solid fa-link-slash";

    if (message) {
        resetInvalidMsg.textContent = message;
    }

    showOnly(resetInvalidPanel);
}

function showSuccessState() {
    resetTitle.textContent = "Password Changed";
    resetDescription.textContent =
        "Your owner account password has been updated.";
    resetCardIcon.className = "fa-solid fa-circle-check";

    showOnly(resetSuccessPanel);

    window.setTimeout(() => {
        window.location.href = OWNER_LOGIN_URL;
    }, 4000);
}

/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

document
    .querySelectorAll(".toggle-password")
    .forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);
            const icon = button.querySelector("i");

            if (!input || !icon) {
                return;
            }

            const shouldShow = input.type === "password";

            input.type = shouldShow ? "text" : "password";
            icon.className = shouldShow
                ? "fa-regular fa-eye-slash"
                : "fa-regular fa-eye";

            button.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );
        });
    });

/* =========================================================
   CHECK THE LINK
   ========================================================= */

async function checkResetLink() {
    if (!/^[a-f0-9]{96}$/.test(resetToken)) {
        showInvalidState();
        return;
    }

    try {
        const response = await fetch(`${API}/reset_owner_password.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                action: "validate",
                token: resetToken
            })
        });

        const data = await readJsonResponse(response);

        if (data.invalid_link) {
            showInvalidState(data.message);
            return;
        }

        showFormState();

        if (!response.ok || !data.success) {
            setMessage(
                ownerResetMsg,
                data.message || "Unable to verify the reset link.",
                "error"
            );
        }
    } catch (error) {
        console.error("Reset link check failed:", error);

        showFormState();

        setMessage(
            ownerResetMsg,
            "Unable to verify the link right now. You can still try to reset your password.",
            "error"
        );
    }
}

/* =========================================================
   SUBMIT NEW PASSWORD
   ========================================================= */

ownerResetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = ownerNewPass.value;
    const confirmPassword = ownerConfirmPass.value;

    setMessage(ownerResetMsg);

    if (newPassword.length < 8) {
        setMessage(
            ownerResetMsg,
            "New password must contain at least 8 characters.",
            "error"
        );
        ownerNewPass.focus();
        return;
    }

    if (newPassword.length > 72) {
        setMessage(
            ownerResetMsg,
            "New password must not exceed 72 characters.",
            "error"
        );
        ownerNewPass.focus();
        return;
    }

    if (
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/\d/.test(newPassword)
    ) {
        setMessage(
            ownerResetMsg,
            "Use at least one uppercase letter, one lowercase letter, and one number.",
            "error"
        );
        ownerNewPass.focus();
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage(
            ownerResetMsg,
            "New password and confirmation do not match.",
            "error"
        );
        ownerConfirmPass.focus();
        return;
    }

    setButtonLoading(
        ownerResetSubmitButton,
        true,
        "Resetting...",
        "Reset Password"
    );

    try {
        const response = await fetch(`${API}/reset_owner_password.php`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                action: "reset",
                token: resetToken,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });

        const data = await readJsonResponse(response);

        if (data.invalid_link) {
            showInvalidState(data.message);
            return;
        }

        if (!response.ok || !data.success) {
            setMessage(
                ownerResetMsg,
                data.message || "Unable to reset the password.",
                "error"
            );
            return;
        }

        ownerNewPass.value = "";
        ownerConfirmPass.value = "";

        showSuccessState();
    } catch (error) {
        console.error("Owner password reset failed:", error);

        setMessage(
            ownerResetMsg,
            error.message ||
            "Unable to connect. Please check your connection and try again.",
            "error"
        );
    } finally {
        setButtonLoading(
            ownerResetSubmitButton,
            false,
            "Resetting...",
            "Reset Password"
        );
    }
});

checkResetLink();
