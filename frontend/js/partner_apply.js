const partnerForm =
    document.getElementById("partnerForm");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.getElementById("submitButton");

const buttonText =
    submitButton.querySelector(".button-text");

function showMessage(type, message) {
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = message;
}

function clearMessage() {
    formMessage.className = "form-message";
    formMessage.textContent = "";
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;

    buttonText.textContent = isLoading
        ? "Submitting Application..."
        : "Submit Partner Application";
}

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

            const isPassword =
                input.type === "password";

            input.type =
                isPassword ? "text" : "password";

            icon.className = isPassword
                ? "fa-regular fa-eye-slash"
                : "fa-regular fa-eye";

            button.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );
        });
    });

partnerForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        clearMessage();

        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById("confirm_password")
                .value;

        const agreement =
            document
                .getElementById("agreement")
                .checked;

        if (password.length < 8) {
            showMessage(
                "error",
                "Password must contain at least 8 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
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
            full_name:
                document
                    .getElementById("full_name")
                    .value
                    .trim(),

            email:
                document
                    .getElementById("email")
                    .value
                    .trim(),

            contact_number:
                document
                    .getElementById("contact_number")
                    .value
                    .trim(),

            password,

            restaurant_name:
                document
                    .getElementById("restaurant_name")
                    .value
                    .trim(),

            restaurant_address:
                document
                    .getElementById("restaurant_address")
                    .value
                    .trim(),

            restaurant_contact:
                document
                    .getElementById("restaurant_contact")
                    .value
                    .trim(),

            cuisine:
                document
                    .getElementById("cuisine")
                    .value
        };

        setLoading(true);

        try {
            const response = await fetch(
                "/FoodConnect/api/partner_register.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

            const result =
                await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Unable to submit the application."
                );
            }

            showMessage(
                "success",
                result.message ||
                "Application submitted successfully."
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