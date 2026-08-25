const API = "/FoodConnect/api";

function formatUserName(user) {
  return [
    user?.first_name,
    user?.middle_name,
    user?.last_name
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    || String(user?.full_name || user?.fullname || user?.name || "").trim();
}

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

/* =========================================================
   ELEMENTS
   ========================================================= */

const panelTitle =
    document.getElementById("panelTitle");

const panelDescription =
    document.getElementById("panelDescription");

const loginPanel =
    document.getElementById("loginPanel");

const forgotPanel =
    document.getElementById("forgotPanel");

const resetPanel =
    document.getElementById("resetPanel");

const reactivationPanel =
    document.getElementById("reactivationPanel");

const reactivationMsg =
    document.getElementById("reactivationMsg");

const sendReactivationCodeBtn =
    document.getElementById("sendReactivationCodeBtn");

const verifyReactivationCodeBtn =
    document.getElementById("verifyReactivationCodeBtn");

const resendReactivationCodeBtn =
    document.getElementById("resendReactivationCodeBtn");

const reactivationCodeArea =
    document.getElementById("reactivationCodeArea");

const reactivationCode =
    document.getElementById("reactivationCode");

let pendingReactivation = null;

const loginForm =
    document.getElementById("loginForm");

const forgotForm =
    document.getElementById("forgotForm");

const resetForm =
    document.getElementById("resetForm");

const loginMsg =
    document.getElementById("loginMsg");

const forgotMsg =
    document.getElementById("forgotMsg");

const resetMsg =
    document.getElementById("resetMsg");

const verifyHelp =
    document.getElementById("verifyHelp");

const resendBtn =
    document.getElementById("resendVerifyBtn");

const loginSubmitButton =
    document.getElementById("loginSubmitButton");

const forgotSubmitButton =
    document.getElementById("forgotSubmitButton");

const resetSubmitButton =
    document.getElementById("resetSubmitButton");

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function setMessage(element, message = "", type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.remove(
        "error",
        "success"
    );

    if (message && type) {
        element.classList.add(type);
    }
}

function setButtonLoading(
    button,
    isLoading,
    loadingText,
    normalText
) {
    if (!button) {
        return;
    }

    const label =
        button.querySelector(".button-label");

    button.disabled = isLoading;

    if (label) {
        label.textContent =
            isLoading
                ? loadingText
                : normalText;
    }
}

async function readJsonResponse(response) {
    const raw = await response.text();

    try {
        return JSON.parse(raw);
    } catch {
        console.error(
            "Unexpected server response:",
            raw
        );

        throw new Error(
            "Something went wrong. Please try again."
        );
    }
}

function showVerifyHelp(show) {
    if (!verifyHelp) {
        return;
    }

    verifyHelp.classList.toggle(
        "hidden",
        !show
    );
}

/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

document
    .querySelectorAll(".toggle-password")
    .forEach((button) => {
        button.addEventListener("click", () => {
            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            const icon =
                button.querySelector("i");

            if (!input || !icon) {
                return;
            }

            const shouldShow =
                input.type === "password";

            input.type =
                shouldShow
                    ? "text"
                    : "password";

            icon.className =
                shouldShow
                    ? "fa-regular fa-eye-slash"
                    : "fa-regular fa-eye";

            button.setAttribute(
                "aria-label",
                shouldShow
                    ? "Hide password"
                    : "Show password"
            );
        });
    });

/* =========================================================
   PANELS
   ========================================================= */

function showPanel(panelName) {
    loginPanel?.classList.add("hidden");
    forgotPanel?.classList.add("hidden");
    resetPanel?.classList.add("hidden");
    reactivationPanel?.classList.add("hidden");

    setMessage(loginMsg);
    setMessage(forgotMsg);
    setMessage(resetMsg);
    setMessage(reactivationMsg);

    showVerifyHelp(false);

    if (panelName === "reactivation") {
        panelTitle.textContent =
            "Reactivate your account";

        panelDescription.textContent =
            "Verify your email to restore access to FoodConnect.";

        reactivationPanel?.classList.remove("hidden");

        return;
    }

    if (panelName === "forgot") {
        panelTitle.textContent =
            "Forgot your password?";

        panelDescription.textContent =
            "Enter your customer email and we’ll send a reset link.";

        forgotPanel?.classList.remove("hidden");

        document
            .getElementById("forgotEmail")
            ?.focus();

        return;
    }

    if (panelName === "reset") {
        panelTitle.textContent =
            "Create a new password";

        panelDescription.textContent =
            "Choose a secure password for your customer account.";

        resetPanel?.classList.remove("hidden");

        document
            .getElementById("newPass")
            ?.focus();

        return;
    }

    panelTitle.textContent =
        "Welcome back";

    panelDescription.textContent =
        "Log in to continue ordering with FoodConnect.";

    loginPanel?.classList.remove("hidden");

    document
        .getElementById("email")
        ?.focus();
}

document
    .getElementById("openForgot")
    ?.addEventListener("click", () => {
        const loginEmail =
            document
                .getElementById("email")
                ?.value
                .trim() || "";

        const forgotEmail =
            document.getElementById("forgotEmail");

        if (forgotEmail) {
            forgotEmail.value = loginEmail;
        }

        showPanel("forgot");
    });

document
    .getElementById("backToLogin1")
    ?.addEventListener("click", () => {
        showPanel("login");
    });

/* =========================================================
   LOGIN
   ========================================================= */

loginForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const remember =
            document
                .getElementById("remember")
                .checked;

        setMessage(loginMsg);
        showVerifyHelp(false);

        if (!email || !password) {
            setMessage(
                loginMsg,
                "Enter your email address and password.",
                "error"
            );

            return;
        }

        setButtonLoading(
            loginSubmitButton,
            true,
            "Signing In...",
            "Log In"
        );

        try {
            const response = await fetch(
                `${API}/login.php`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password,
                        remember
                    })
                }
            );

            const data =
                await readJsonResponse(response);

            if (!response.ok) {
                const errorMessage =
                    data.error ||
                    "Unable to log in.";

                const lowerMessage =
                    errorMessage.toLowerCase();

                if (data.deactivated === true) {
                    pendingReactivation = {
                        email,
                        password,
                        remember
                    };

                    if (reactivationCodeArea) {
                        reactivationCodeArea.classList.add("hidden");
                    }

                    if (reactivationCode) {
                        reactivationCode.value = "";
                    }

                    showPanel("reactivation");

                    setMessage(
                        reactivationMsg,
                        "Your account is deactivated. Send a verification code to reactivate it.",
                        "error"
                    );
                } else if (
                    lowerMessage.includes("verify")
                ) {
                    setMessage(
                        loginMsg,
                        "Verify your email before logging in.",
                        "error"
                    );

                    showVerifyHelp(true);
                } else {
                    setMessage(
                        loginMsg,
                        errorMessage,
                        "error"
                    );
                }

                return;
            }

            localStorage.setItem(
                "user_full_name",
                formatUserName(data.user)
            );

            localStorage.setItem(
                "user_role",
                data.user?.role || "customer"
            );

            setMessage(
                loginMsg,
                "Login successful. Redirecting...",
                "success"
            );

            window.setTimeout(() => {
                window.location.href =
                    "index.html";
            }, 650);
        } catch (error) {
            console.error(
                "Customer login error:",
                error
            );

            setMessage(
                loginMsg,
                error.message ||
                "Cannot reach the server. Make sure Apache and MySQL are running.",
                "error"
            );
        } finally {
            setButtonLoading(
                loginSubmitButton,
                false,
                "Signing In...",
                "Log In"
            );
        }
    }
);

/* =========================================================
   CUSTOMER SELF-REACTIVATION
   ========================================================= */

async function sendReactivationCode() {
    setMessage(reactivationMsg);

    if (!pendingReactivation?.email || !pendingReactivation?.password) {
        setMessage(
            reactivationMsg,
            "Please return to login and enter your email and password again.",
            "error"
        );
        return false;
    }

    setButtonLoading(
        sendReactivationCodeBtn,
        true,
        "Sending Code...",
        "Send Verification Code"
    );

    if (resendReactivationCodeBtn) {
        resendReactivationCodeBtn.disabled = true;
    }

    try {
        const response = await fetch(
            `${API}/request_customer_reactivation.php`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: pendingReactivation.email,
                    password: pendingReactivation.password
                })
            }
        );

        const data = await readJsonResponse(response);

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Unable to send the verification code."
            );
        }

        reactivationCodeArea?.classList.remove("hidden");

        setMessage(
            reactivationMsg,
            data.message ||
            "Verification code sent to your email.",
            "success"
        );

        reactivationCode?.focus();

        return true;
    } catch (error) {
        setMessage(
            reactivationMsg,
            error.message ||
            "Unable to send the verification code.",
            "error"
        );

        return false;
    } finally {
        setButtonLoading(
            sendReactivationCodeBtn,
            false,
            "Sending Code...",
            "Send Verification Code"
        );

        if (resendReactivationCodeBtn) {
            resendReactivationCodeBtn.disabled = false;
        }
    }
}

sendReactivationCodeBtn?.addEventListener(
    "click",
    async () => {
        await sendReactivationCode();
    }
);

resendReactivationCodeBtn?.addEventListener(
    "click",
    async () => {
        const sent = await sendReactivationCode();

        if (sent && resendReactivationCodeBtn) {
            beginCooldown(
                resendReactivationCodeBtn,
                30,
                "Resend code"
            );
        }
    }
);

verifyReactivationCodeBtn?.addEventListener(
    "click",
    async () => {
        setMessage(reactivationMsg);

        const code =
            reactivationCode?.value
                .replace(/\D/g, "")
                .trim() || "";

        if (!/^\d{6}$/.test(code)) {
            setMessage(
                reactivationMsg,
                "Enter the 6-digit verification code.",
                "error"
            );
            reactivationCode?.focus();
            return;
        }

        setButtonLoading(
            verifyReactivationCodeBtn,
            true,
            "Verifying...",
            "Reactivate Account"
        );

        try {
            const response = await fetch(
                `${API}/verify_customer_reactivation.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ code })
                }
            );

            const data = await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to reactivate your account."
                );
            }

            setMessage(
                reactivationMsg,
                "Account reactivated. Signing you in...",
                "success"
            );

            const loginResponse = await fetch(
                `${API}/login.php`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pendingReactivation)
                }
            );

            const loginData =
                await readJsonResponse(loginResponse);

            if (!loginResponse.ok) {
                showPanel("login");

                setMessage(
                    loginMsg,
                    "Account reactivated successfully. Please log in again.",
                    "success"
                );

                return;
            }

            localStorage.setItem(
                "user_full_name",
                formatUserName(loginData.user)
            );

            localStorage.setItem(
                "user_role",
                loginData.user?.role || "customer"
            );

            window.setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        } catch (error) {
            setMessage(
                reactivationMsg,
                error.message ||
                "Unable to reactivate your account.",
                "error"
            );
        } finally {
            setButtonLoading(
                verifyReactivationCodeBtn,
                false,
                "Verifying...",
                "Reactivate Account"
            );
        }
    }
);

reactivationCode?.addEventListener("input", () => {
    reactivationCode.value =
        reactivationCode.value
            .replace(/\D/g, "")
            .slice(0, 6);
});

document
    .getElementById("backToLoginReactivation")
    ?.addEventListener("click", () => {
        pendingReactivation = null;

        if (reactivationCodeArea) {
            reactivationCodeArea.classList.add("hidden");
        }

        if (reactivationCode) {
            reactivationCode.value = "";
        }

        showPanel("login");
    });

/* =========================================================
   RESEND VERIFICATION
   ========================================================= */

function beginCooldown(
    button,
    seconds,
    originalText = "Resend verification email"
) {

    let remaining =
        seconds;

    button.disabled = true;

    button.textContent =
        `Resend in ${remaining}s`;

    const interval =
        window.setInterval(() => {
            remaining -= 1;

            if (remaining <= 0) {
                window.clearInterval(interval);

                button.disabled = false;
                button.textContent =
                    originalText;

                return;
            }

            button.textContent =
                `Resend in ${remaining}s`;
        }, 1000);
}

resendBtn?.addEventListener(
    "click",
    async () => {
        const email =
            document
                .getElementById("email")
                .value
                .trim();

        if (!email) {
            setMessage(
                loginMsg,
                "Enter your email address first.",
                "error"
            );

            return;
        }

        resendBtn.disabled = true;
        resendBtn.textContent =
            "Sending verification email...";

        try {
            const response = await fetch(
                `${API}/resend_verification.php`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );

            const data =
                await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to resend verification."
                );
            }

            setMessage(
                loginMsg,
                data.message ||
                "Verification email sent.",
                "success"
            );

            beginCooldown(
                resendBtn,
                30
            );
        } catch (error) {
            console.error(
                "Resend verification error:",
                error
            );

            setMessage(
                loginMsg,
                error.message ||
                "Unable to resend verification.",
                "error"
            );

            resendBtn.disabled = false;
            resendBtn.textContent =
                "Resend verification email";
        }
    }
);

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

forgotForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const email =
            document
                .getElementById("forgotEmail")
                .value
                .trim();

        setMessage(forgotMsg);

        if (!email) {
            setMessage(
                forgotMsg,
                "Enter your registered email address.",
                "error"
            );

            return;
        }

        setButtonLoading(
            forgotSubmitButton,
            true,
            "Sending Link...",
            "Send Reset Link"
        );

        try {
            const response = await fetch(
                `${API}/forgot_password_request.php`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );

            const data =
                await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to send reset link."
                );
            }

            setMessage(
                forgotMsg,
                data.message ||
                "If the email exists, a reset link has been sent.",
                "success"
            );
        } catch (error) {
            console.error(
                "Forgot password error:",
                error
            );

            setMessage(
                forgotMsg,
                error.message ||
                "Unable to send reset link.",
                "error"
            );
        } finally {
            setButtonLoading(
                forgotSubmitButton,
                false,
                "Sending Link...",
                "Send Reset Link"
            );
        }
    }
);

/* =========================================================
   RESET PASSWORD
   ========================================================= */

const queryParams =
    new URLSearchParams(
        window.location.search
    );

const resetEmail =
    queryParams.get("email") || "";

const resetToken =
    queryParams.get("token") || "";

if (resetEmail && resetToken) {
    showPanel("reset");
} else {
    showPanel("login");
}

resetForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const newPassword =
            document
                .getElementById("newPass")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPass")
                .value;

        setMessage(resetMsg);

        if (
            !newPassword ||
            !confirmPassword
        ) {
            setMessage(
                resetMsg,
                "Complete both password fields.",
                "error"
            );

            return;
        }

        if (newPassword.length < 8) {
            setMessage(
                resetMsg,
                "Password must contain at least 8 characters.",
                "error"
            );

            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            setMessage(
                resetMsg,
                "The passwords do not match.",
                "error"
            );

            return;
        }

        if (!resetEmail || !resetToken) {
            setMessage(
                resetMsg,
                "The reset link is missing or invalid.",
                "error"
            );

            return;
        }

        setButtonLoading(
            resetSubmitButton,
            true,
            "Updating Password...",
            "Update Password"
        );

        try {
            const response = await fetch(
                `${API}/reset_password.php`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: resetEmail,
                        token: resetToken,
                        new_password: newPassword
                    })
                }
            );

            const data =
                await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to update password."
                );
            }

            setMessage(
                resetMsg,
                data.message ||
                "Password updated successfully.",
                "success"
            );

            resetForm.reset();

            window.setTimeout(() => {
                window.location.href =
                    "login.html";
            }, 1200);
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            setMessage(
                resetMsg,
                error.message ||
                "Unable to update password.",
                "error"
            );
        } finally {
            setButtonLoading(
                resetSubmitButton,
                false,
                "Updating Password...",
                "Update Password"
            );
        }
    }
);