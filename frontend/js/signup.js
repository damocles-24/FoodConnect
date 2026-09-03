const API = "/api";

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

/* =========================================================
   ELEMENTS
   ========================================================= */

const signupForm =
    document.getElementById("signupForm");

const firstNameInput =
    document.getElementById("firstName");

const middleNameInput =
    document.getElementById("middleName");

const lastNameInput =
    document.getElementById("lastName");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirm-password");

const agreementInput =
    document.getElementById("agreement");

const signupMessage =
    document.getElementById("signupMessage");

const signupSubmitButton =
    document.getElementById("signupSubmitButton");

const signupSuccess =
    document.getElementById("signupSuccess");

const loginPrompt =
    document.getElementById("loginPrompt");

const createAnotherAccountButton =
    document.getElementById("createAnotherAccount");

const passwordMatchMessage =
    document.getElementById("passwordMatchMessage");

const lengthRequirement =
    document.getElementById("lengthRequirement");

const letterRequirement =
    document.getElementById("letterRequirement");

const numberRequirement =
    document.getElementById("numberRequirement");

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================================================
   HELPERS
   ========================================================= */

function setMessage(message = "", type = "") {
    if (!signupMessage) {
        return;
    }

    signupMessage.textContent = message;

    signupMessage.classList.remove(
        "error",
        "success"
    );

    if (message && type) {
        signupMessage.classList.add(type);
    }
}

function setLoading(isLoading) {
    if (!signupSubmitButton) {
        return;
    }

    const label =
        signupSubmitButton.querySelector(
            ".button-label"
        );

    signupSubmitButton.disabled =
        isLoading;

    if (label) {
        label.textContent =
            isLoading
                ? "Creating Account..."
                : "Create Customer Account";
    }
}

async function readJsonResponse(response) {
    const raw =
        await response.text();

    try {
        return JSON.parse(raw);
    } catch {
        console.error(
            "Non-JSON signup response:",
            raw
        );

        throw new Error(
            "Something went wrong. Please try again."
        );
    }
}

function updateRequirement(
    element,
    isValid
) {
    if (!element) {
        return;
    }

    element.classList.toggle(
        "valid",
        isValid
    );

    const icon =
        element.querySelector("i");

    if (icon) {
        icon.className =
            isValid
                ? "fa-solid fa-circle-check"
                : "fa-solid fa-circle";
    }
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
            }
        );
    });

/* =========================================================
   PASSWORD REQUIREMENTS
   ========================================================= */

function validatePasswordRequirements() {
    const password =
        passwordInput?.value || "";

    const hasLength =
        password.length >= 8;

    const hasLetter =
        /[a-zA-Z]/.test(password);

    const hasNumber =
        /\d/.test(password);

    updateRequirement(
        lengthRequirement,
        hasLength
    );

    updateRequirement(
        letterRequirement,
        hasLetter
    );

    updateRequirement(
        numberRequirement,
        hasNumber
    );

    return {
        hasLength,
        hasLetter,
        hasNumber,
        valid:
            hasLength &&
            hasLetter &&
            hasNumber
    };
}

function validatePasswordMatch() {
    if (!passwordMatchMessage) {
        return false;
    }

    const password =
        passwordInput?.value || "";

    const confirmation =
        confirmPasswordInput?.value || "";

    passwordMatchMessage.classList.remove(
        "valid",
        "invalid"
    );

    if (!confirmation) {
        passwordMatchMessage.textContent = "";
        return false;
    }

    if (password === confirmation) {
        passwordMatchMessage.textContent =
            "Passwords match.";

        passwordMatchMessage.classList.add(
            "valid"
        );

        return true;
    }

    passwordMatchMessage.textContent =
        "Passwords do not match.";

    passwordMatchMessage.classList.add(
        "invalid"
    );

    return false;
}

passwordInput?.addEventListener(
    "input",
    () => {
        validatePasswordRequirements();
        validatePasswordMatch();
    }
);

confirmPasswordInput?.addEventListener(
    "input",
    validatePasswordMatch
);

/* =========================================================
   SIGNUP
   ========================================================= */

signupForm?.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const firstName =
            firstNameInput?.value.trim() || "";

        const middleName =
            middleNameInput?.value.trim() || "";

        const lastName =
            lastNameInput?.value.trim() || "";

        const email =
            emailInput?.value.trim() || "";

        const password =
            passwordInput?.value || "";

        const confirmPassword =
            confirmPasswordInput?.value || "";

        const agreement =
            Boolean(agreementInput?.checked);

        setMessage();

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            setMessage(
                "Please complete all required fields.",
                "error"
            );

            return;
        }

        if (firstName.length < 2) {
            setMessage(
                "Please enter a valid first name.",
                "error"
            );

            firstNameInput?.focus();
            return;
        }

        if (lastName.length < 2) {
            setMessage(
                "Please enter a valid last name.",
                "error"
            );

            lastNameInput?.focus();
            return;
        }

        const composedName =
            [firstName, middleName, lastName]
                .filter(Boolean)
                .join(" ");

        if (
            firstName.length > 100 ||
            middleName.length > 100 ||
            lastName.length > 100 ||
            composedName.length > 150
        ) {
            setMessage(
                "Please enter a shorter name.",
                "error"
            );
            return;
        }

        if (!emailRegex.test(email)) {
            setMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        const passwordRequirements =
            validatePasswordRequirements();

        if (!passwordRequirements.valid) {
            setMessage(
                "Your password must contain at least 8 characters, one letter, and one number.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            setMessage(
                "The passwords do not match.",
                "error"
            );

            confirmPasswordInput.focus();
            return;
        }

        if (!agreement) {
            setMessage(
                "Please confirm that your information is correct.",
                "error"
            );

            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API}/signup.php`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email,
                        password,
                        confirm: confirmPassword
                    })
                }
            );

            const data =
                await readJsonResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to create your account."
                );
            }

            signupForm.reset();

            validatePasswordRequirements();
            validatePasswordMatch();

            signupForm.classList.add(
                "hidden"
            );

            loginPrompt?.classList.add(
                "hidden"
            );

            signupSuccess?.classList.remove(
                "hidden"
            );
        } catch (error) {
            console.error(
                "Customer signup error:",
                error
            );

            setMessage(
                error.message ||
                "Server error. Make sure Apache and MySQL are running.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }
);

/* =========================================================
   CREATE ANOTHER ACCOUNT
   ========================================================= */

createAnotherAccountButton?.addEventListener(
    "click",
    () => {
        signupSuccess?.classList.add(
            "hidden"
        );

        signupForm?.classList.remove(
            "hidden"
        );

        loginPrompt?.classList.remove(
            "hidden"
        );

        setMessage();

        firstNameInput?.focus();
    }
);
