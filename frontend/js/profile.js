const API = "/FoodConnect/api";

const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const contactNumber = document.getElementById("contactNumber");
const address = document.getElementById("address");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const saveBtn = document.getElementById("saveBtn");
const passwordBtn = document.getElementById("passwordBtn");
const cancelBtn = document.getElementById("cancelBtn");
const headerBackBtn = document.getElementById("headerBackBtn");
const logoutSettingsBtn = document.getElementById("logoutSettingsBtn");

const profileStatus = document.getElementById("profileStatus");
const passwordStatus = document.getElementById("passwordStatus");
const globalStatusMessage = document.getElementById("globalStatusMessage");

const deactivateModal = document.getElementById("deactivateModal");
const openDeactivateBtn = document.getElementById("openDeactivateBtn");
const closeDeactivateBtn = document.getElementById("closeDeactivateBtn");
const cancelDeactivateBtn = document.getElementById("cancelDeactivateBtn");
const confirmDeactivateBtn = document.getElementById("confirmDeactivateBtn");
const deactivatePassword = document.getElementById("deactivatePassword");
const deactivateStatus = document.getElementById("deactivateStatus");

function showStatus(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `${element.classList.contains("status-message") ? "status-message" : "inline-status"} show ${type}`;
}

function clearStatus(element) {
  if (!element) return;
  element.textContent = "";
  element.className = element.classList.contains("status-message")
    ? "status-message"
    : "inline-status";
}

function setButtonLoading(button, loading, loadingText, normalHtml) {
  if (!button) return;
  button.disabled = loading;

  if (loading) {
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>${loadingText}</span>`;
  } else {
    button.innerHTML = normalHtml;
  }
}

async function readJson(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (_) {
    throw new Error("Something went wrong. Please try again.");
  }
}

function redirectToLogin() {
  window.location.href = "login.html";
}

async function loadProfile() {
  clearStatus(globalStatusMessage);

  try {
    const response = await fetch(`${API}/get_customer_profile.php`, {
      credentials: "include",
      cache: "no-store"
    });

    const data = await readJson(response);

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load account settings.");
    }

    fullName.value = data.user.full_name || "";
    email.value = data.user.email || "";
    contactNumber.value = window.FoodConnectPhone.toLocalDigits(data.user.contact_number);
    address.value = data.user.address || "";
  } catch (error) {
    showStatus(
      globalStatusMessage,
      error.message || "Unable to load account settings.",
      "error"
    );
  }
}

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus(profileStatus);

  const payload = {
    full_name: fullName.value.trim(),
    email: email.value.trim(),
    contact_number: contactNumber.value.trim() ? window.FoodConnectPhone.normalize(contactNumber.value) : "",
    address: address.value.trim()
  };

  if (!payload.full_name) {
    showStatus(profileStatus, "Full name is required.", "error");
    fullName.focus();
    return;
  }

  if (!email.checkValidity()) {
    showStatus(profileStatus, "Please enter a valid email address.", "error");
    email.focus();
    return;
  }

  if (
    payload.contact_number &&
    !/^(09\d{9}|\+639\d{9})$/.test(payload.contact_number)
  ) {
    showStatus(
      profileStatus,
      "Enter a valid Philippine mobile number after +63, starting with 9.",
      "error"
    );
    contactNumber.focus();
    return;
  }

  setButtonLoading(
    saveBtn,
    true,
    "Saving...",
    '<i class="fa-solid fa-floppy-disk"></i><span>Save changes</span>'
  );

  try {
    const response = await fetch(`${API}/update_customer_profile.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await readJson(response);

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Changes could not be saved account settings.");
    }

    showStatus(
      profileStatus,
      data.message || "Profile updated successfully.",
      "success"
    );
  } catch (error) {
    showStatus(
      profileStatus,
      error.message || "Changes could not be saved account settings.",
      "error"
    );
  } finally {
    setButtonLoading(
      saveBtn,
      false,
      "",
      '<i class="fa-solid fa-floppy-disk"></i><span>Save changes</span>'
    );
  }
});

passwordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus(passwordStatus);

  const payload = {
    current_password: currentPassword.value,
    new_password: newPassword.value,
    confirm_password: confirmPassword.value
  };

  if (!payload.current_password || !payload.new_password || !payload.confirm_password) {
    showStatus(passwordStatus, "Please complete all password fields.", "error");
    return;
  }

  if (payload.new_password.length < 8) {
    showStatus(passwordStatus, "New password must be at least 8 characters.", "error");
    newPassword.focus();
    return;
  }

  if (
    !/[a-z]/.test(payload.new_password) ||
    !/[A-Z]/.test(payload.new_password) ||
    !/\d/.test(payload.new_password)
  ) {
    showStatus(
      passwordStatus,
      "New password must include uppercase, lowercase, and a number.",
      "error"
    );
    newPassword.focus();
    return;
  }

  if (payload.new_password !== payload.confirm_password) {
    showStatus(passwordStatus, "New passwords do not match.", "error");
    confirmPassword.focus();
    return;
  }

  setButtonLoading(
    passwordBtn,
    true,
    "Updating...",
    '<i class="fa-solid fa-shield-halved"></i><span>Update password</span>'
  );

  try {
    const response = await fetch(`${API}/change_customer_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await readJson(response);

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to change your password.");
    }

    passwordForm.reset();

    showStatus(
      passwordStatus,
      data.message || "Password updated successfully.",
      "success"
    );
  } catch (error) {
    showStatus(
      passwordStatus,
      error.message || "Unable to change your password.",
      "error"
    );
  } finally {
    setButtonLoading(
      passwordBtn,
      false,
      "",
      '<i class="fa-solid fa-shield-halved"></i><span>Update password</span>'
    );
  }
});

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    if (!input) return;

    const show = input.type === "password";
    input.type = show ? "text" : "password";

    const icon = button.querySelector("i");
    if (icon) {
      icon.className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    }

    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
});

const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const settingsNav = document.getElementById("settingsNav");
const settingsNavOverlay = document.getElementById("settingsNavOverlay");
const closeSettingsMenuBtn = document.getElementById("closeSettingsMenuBtn");

function openSettingsMenu() {
  settingsNav?.classList.add("open");
  settingsNavOverlay?.classList.add("show");
  settingsMenuBtn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("settings-menu-open");
}

function closeSettingsMenu() {
  settingsNav?.classList.remove("open");
  settingsNavOverlay?.classList.remove("show");
  settingsMenuBtn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("settings-menu-open");
}

function showSettingsPanel(panelId) {
  const target = document.getElementById(panelId);
  if (!target) return;

  document.querySelectorAll(".settings-panel").forEach((panel) => {
    panel.classList.remove("active-panel");
  });

  document.querySelectorAll(".settings-nav-item[data-target]").forEach((item) => {
    item.classList.toggle("active", item.dataset.target === panelId);
  });

  target.classList.add("active-panel");

  if (window.innerWidth <= 640) {
    closeSettingsMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.querySelectorAll(".settings-nav-item[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    showSettingsPanel(button.dataset.target);
  });
});

settingsMenuBtn?.addEventListener("click", openSettingsMenu);
closeSettingsMenuBtn?.addEventListener("click", closeSettingsMenu);
settingsNavOverlay?.addEventListener("click", closeSettingsMenu);

window.addEventListener("resize", () => {
  if (window.innerWidth > 640) {
    closeSettingsMenu();
  }
});

function openDeactivateModal() {
  clearStatus(deactivateStatus);
  deactivatePassword.value = "";
  deactivateModal.classList.remove("hidden");
  deactivateModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setTimeout(() => deactivatePassword.focus(), 50);
}

function closeDeactivateModal() {
  deactivateModal.classList.add("hidden");
  deactivateModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  deactivatePassword.value = "";
  clearStatus(deactivateStatus);
}

openDeactivateBtn?.addEventListener("click", openDeactivateModal);
closeDeactivateBtn?.addEventListener("click", closeDeactivateModal);
cancelDeactivateBtn?.addEventListener("click", closeDeactivateModal);

deactivateModal?.addEventListener("click", (event) => {
  if (event.target === deactivateModal) {
    closeDeactivateModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!deactivateModal.classList.contains("hidden")) {
    closeDeactivateModal();
    return;
  }

  closeSettingsMenu();
});

confirmDeactivateBtn?.addEventListener("click", async () => {
  clearStatus(deactivateStatus);

  const password = deactivatePassword.value;

  if (!password) {
    showStatus(
      deactivateStatus,
      "Enter your current password to confirm deactivation.",
      "error"
    );
    deactivatePassword.focus();
    return;
  }

  setButtonLoading(
    confirmDeactivateBtn,
    true,
    "Deactivating...",
    "<span>Yes, deactivate</span>"
  );

  try {
    const response = await fetch(`${API}/deactivate_customer_account.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password })
    });

    const data = await readJson(response);

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to deactivate your account.");
    }

    showStatus(
      deactivateStatus,
      "Account deactivated. Redirecting...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  } catch (error) {
    showStatus(
      deactivateStatus,
      error.message || "Unable to deactivate your account.",
      "error"
    );

    setButtonLoading(
      confirmDeactivateBtn,
      false,
      "",
      "<span>Yes, deactivate</span>"
    );
  }
});

logoutSettingsBtn?.addEventListener("click", () => {
  window.location.href = `${API}/logout.php`;
});

cancelBtn?.addEventListener("click", () => history.back());
headerBackBtn?.addEventListener("click", () => history.back());

loadProfile();
