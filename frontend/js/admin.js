"use strict";

const API_BASE =
  "/capshit/api";

/* =========================
   LOGIN AND SETUP ELEMENTS
========================= */

const adminLoginView =
  document.getElementById(
    "adminLoginView"
  );

const adminSetupCard =
  document.getElementById(
    "adminSetupCard"
  );

const adminLoginCard =
  document.getElementById(
    "adminLoginCard"
  );

const adminAccessCard =
  document.getElementById(
    "adminAccessCard"
  );

const adminSetupForm =
  document.getElementById(
    "adminSetupForm"
  );

const adminAccessForm =
  document.getElementById(
    "adminAccessForm"
  );

const adminLoginForm =
  document.getElementById(
    "adminLoginForm"
  );

const setupFullName =
  document.getElementById(
    "setupFullName"
  );

const setupEmail =
  document.getElementById(
    "setupEmail"
  );

const setupContactNumber =
  document.getElementById(
    "setupContactNumber"
  );

const setupPassword =
  document.getElementById(
    "setupPassword"
  );

const setupConfirmPassword =
  document.getElementById(
    "setupConfirmPassword"
  );

const adminSetupMessage =
  document.getElementById(
    "adminSetupMessage"
  );

const adminSetupButton =
  document.getElementById(
    "adminSetupButton"
  );

const adminAccessCode =
  document.getElementById(
    "adminAccessCode"
  );

const adminAccessMessage =
  document.getElementById(
    "adminAccessMessage"
  );

const adminAccessButton =
  document.getElementById(
    "adminAccessButton"
  );

const adminEmail =
  document.getElementById(
    "adminEmail"
  );

const adminPassword =
  document.getElementById(
    "adminPassword"
  );

const adminLoginButton =
  document.getElementById(
    "adminLoginButton"
  );

const adminLoginMessage =
  document.getElementById(
    "adminLoginMessage"
  );

/* =========================
   DASHBOARD ELEMENTS
========================= */

const adminDashboard =
  document.getElementById(
    "adminDashboard"
  );

const adminLogoutButton =
  document.getElementById(
    "adminLogoutButton"
  );

const adminName =
  document.getElementById(
    "adminName"
  );

const pageTitle =
  document.getElementById(
    "pageTitle"
  );

const adminSidebar =
  document.getElementById(
    "adminSidebar"
  );

const sidebarToggle =
  document.getElementById(
    "sidebarToggle"
  );

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );

const dashboardSections =
  document.querySelectorAll(
    ".dashboard-section"
  );

const statusFilters =
  document.querySelectorAll(
    ".status-filter"
  );

const refreshApplicationsButton =
  document.getElementById(
    "refreshApplicationsButton"
  );

const applicationsLoading =
  document.getElementById(
    "applicationsLoading"
  );

const applicationsEmpty =
  document.getElementById(
    "applicationsEmpty"
  );

const applicationsTableWrapper =
  document.getElementById(
    "applicationsTableWrapper"
  );

const applicationsTableBody =
  document.getElementById(
    "applicationsTableBody"
  );

const applicationModal =
  document.getElementById(
    "applicationModal"
  );

const closeApplicationModal =
  document.getElementById(
    "closeApplicationModal"
  );

const applicationModalContent =
  document.getElementById(
    "applicationModalContent"
  );

let currentApplicationStatus =
  "all";

let loadedApplications = [];

/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeAdmin
);

async function initializeAdmin() {
  bindEvents();

  const adminSession =
    await checkAdminSession();

  if (adminSession.logged_in) {
    showDashboard(
      adminSession.user
    );

    await loadApplications();
    return;
  }

  const setupStatus =
    await checkAdminSetupStatus();

  if (setupStatus.setup_required) {
    showAdminSetup();
  } else {
    showAdminAccess();
  }
}

/* =========================
   EVENT BINDINGS
========================= */

function bindEvents() {
  adminAccessForm?.addEventListener(
    "submit",
    handleAdminAccess
  );

  adminSetupForm?.addEventListener(
    "submit",
    handleAdminSetup
  );

  adminLoginForm?.addEventListener(
    "submit",
    handleAdminLogin
  );

  adminLogoutButton?.addEventListener(
    "click",
    handleAdminLogout
  );

  sidebarToggle?.addEventListener(
    "click",
    () => {
      adminSidebar?.classList.toggle(
        "open"
      );
    }
  );

  navItems.forEach((item) => {
    item.addEventListener(
      "click",
      () => {
        openDashboardSection(item);
      }
    );
  });

  statusFilters.forEach((filter) => {
    filter.addEventListener(
      "click",
      async () => {
        statusFilters.forEach(
          (button) => {
            button.classList.remove(
              "active"
            );
          }
        );

        filter.classList.add(
          "active"
        );

        currentApplicationStatus =
          filter.dataset.status ||
          "all";

        await loadApplications();
      }
    );
  });

  refreshApplicationsButton
    ?.addEventListener(
      "click",
      loadApplications
    );

  closeApplicationModal
    ?.addEventListener(
      "click",
      closeDetailsModal
    );

  applicationModal?.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        applicationModal
      ) {
        closeDetailsModal();
      }
    }
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        closeDetailsModal();

        adminSidebar?.classList.remove(
          "open"
        );
      }
    }
  );
}

/* =========================
   ADMIN ACCESS CODE
========================= */

function showAdminAccess() {
  adminLoginView?.classList.remove(
    "hidden"
  );

  adminDashboard?.classList.add(
    "hidden"
  );

  adminSetupCard?.classList.add(
    "hidden"
  );

  adminLoginCard?.classList.add(
    "hidden"
  );

  adminAccessCard?.classList.remove(
    "hidden"
  );

  setAdminAccessMessage("");

  if (adminAccessCode) {
    adminAccessCode.value = "";
  }

  adminAccessCode?.focus();
}

async function handleAdminAccess(
  event
) {
  event.preventDefault();

  const accessCode =
    adminAccessCode?.value.trim() ||
    "";

  setAdminAccessMessage("");

  if (!accessCode) {
    setAdminAccessMessage(
      "Enter the administrator access code."
    );

    adminAccessCode?.focus();
    return;
  }

  if (adminAccessButton) {
    adminAccessButton.disabled =
      true;

    adminAccessButton.textContent =
      "Verifying...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/verify_admin_access.php`,
      {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",

          "Accept":
            "application/json"
        },

        body: JSON.stringify({
          access_code: accessCode
        })
      }
    );

    const data =
      await readJson(response);

    if (
      !response.ok ||
      !data.success
    ) {
      setAdminAccessMessage(
        data.message ||
        "Invalid administrator access code."
      );

      adminAccessCode?.select();
      return;
    }

    if (adminAccessCode) {
      adminAccessCode.value = "";
    }

    showAdminLogin();

    adminEmail?.focus();
  } catch (error) {
    console.error(
      "Admin access verification failed:",
      error
    );

    setAdminAccessMessage(
      error.message ||
      "Cannot connect to the server."
    );
  } finally {
    if (adminAccessButton) {
      adminAccessButton.disabled =
        false;

      adminAccessButton.textContent =
        "Continue";
    }
  }
}

/* =========================
   ADMIN SETUP
========================= */

async function checkAdminSetupStatus() {
  try {
    const response = await fetch(
      `${API_BASE}/setup_first_admin.php`,
      {
        method: "GET",

        headers: {
          "Accept":
            "application/json"
        }
      }
    );

    const data =
      await readJson(response);

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to check administrator setup."
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Admin setup check failed:",
      error
    );

    return {
      success: false,
      setup_required: false
    };
  }
}

async function handleAdminSetup(
  event
) {
  event.preventDefault();

  const fullName =
    setupFullName?.value.trim() ||
    "";

  const email =
    setupEmail?.value.trim() ||
    "";

  const contactNumber =
    setupContactNumber?.value.trim() ||
    "";

  const password =
    setupPassword?.value || "";

  const confirmPassword =
    setupConfirmPassword?.value || "";

  setAdminSetupMessage("");

  if (
    !fullName ||
    !email ||
    !contactNumber ||
    !password ||
    !confirmPassword
  ) {
    setAdminSetupMessage(
      "Complete all administrator fields."
    );

    return;
  }

  if (password !== confirmPassword) {
    setAdminSetupMessage(
      "The password confirmation does not match."
    );

    setupConfirmPassword?.focus();
    return;
  }

  if (adminSetupButton) {
    adminSetupButton.disabled =
      true;

    adminSetupButton.textContent =
      "Creating account...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/setup_first_admin.php`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "Accept":
            "application/json"
        },

        body: JSON.stringify({
          full_name:
            fullName,

          email,

          contact_number:
            contactNumber,

          password,

          confirm_password:
            confirmPassword
        })
      }
    );

    const data =
      await readJson(response);

    if (
      !response.ok ||
      !data.success
    ) {
      setAdminSetupMessage(
        data.message ||
        "Unable to create administrator."
      );

      return;
    }

    adminSetupForm?.reset();

    showAdminAccess();

    setAdminAccessMessage(
      "Administrator account created. Enter the private access code to continue.",
      "success"
    );
  } catch (error) {
    console.error(
      "Admin setup failed:",
      error
    );

    setAdminSetupMessage(
      error.message ||
      "Cannot connect to the server."
    );
  } finally {
    if (adminSetupButton) {
      adminSetupButton.disabled =
        false;

      adminSetupButton.textContent =
        "Create Administrator Account";
    }
  }
}

/* =========================
   ADMIN SESSION
========================= */

async function checkAdminSession() {
  try {
    const response = await fetch(
      `${API_BASE}/admin_me.php`,
      {
        credentials: "include",

        headers: {
          "Accept":
            "application/json"
        }
      }
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      return {
        logged_in: false
      };
    }

    return data;
  } catch (error) {
    console.error(
      "Admin session check failed:",
      error
    );

    return {
      logged_in: false
    };
  }
}

/* =========================
   ADMIN LOGIN
========================= */

async function handleAdminLogin(event) {
  event.preventDefault();

  const email =
    adminEmail?.value.trim() || "";

  const password =
    adminPassword?.value || "";

  setAdminLoginMessage("");

  if (!email || !password) {
    setAdminLoginMessage(
      "Enter your admin email and password."
    );

    return;
  }

  if (adminLoginButton) {
    adminLoginButton.disabled =
      true;

    adminLoginButton.textContent =
      "Logging in...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/admin_login.php`,
      {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",

          "Accept":
            "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data =
      await readJson(response);

    if (
      !response.ok ||
      !data.success
    ) {
      setAdminLoginMessage(
        data.message ||
        "Admin login failed."
      );

      const errorMessage =
        String(
          data.message || ""
        ).toLowerCase();

      if (
        response.status === 403 &&
        errorMessage.includes(
          "access-code verification"
        )
      ) {
        window.setTimeout(() => {
          showAdminAccess();
        }, 900);
      }

      return;
    }

    if (adminPassword) {
      adminPassword.value = "";
    }

    showDashboard(
      data.user
    );

    await loadApplications();
  } catch (error) {
    console.error(
      "Admin login failed:",
      error
    );

    setAdminLoginMessage(
      error.message ||
      "Cannot connect to the server."
    );
  } finally {
    if (adminLoginButton) {
      adminLoginButton.disabled =
        false;

      adminLoginButton.textContent =
        "Login as Administrator";
    }
  }
}

/* =========================
   ADMIN LOGOUT
========================= */

async function handleAdminLogout() {
  if (adminLogoutButton) {
    adminLogoutButton.disabled =
      true;
  }

  try {
    await fetch(
      `${API_BASE}/logout.php`,
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
      "Admin logout failed:",
      error
    );
  } finally {
    window.location.reload();
  }
}

/* =========================
   VIEW SWITCHING
========================= */

function showAdminSetup() {
  adminLoginView?.classList.remove(
    "hidden"
  );

  adminDashboard?.classList.add(
    "hidden"
  );

  adminSetupCard?.classList.remove(
    "hidden"
  );

  adminAccessCard?.classList.add(
    "hidden"
  );

  adminLoginCard?.classList.add(
    "hidden"
  );

  setAdminSetupMessage("");

  setupFullName?.focus();
}

function showAdminLogin() {
  adminLoginView?.classList.remove(
    "hidden"
  );

  adminDashboard?.classList.add(
    "hidden"
  );

  adminSetupCard?.classList.add(
    "hidden"
  );

  adminAccessCard?.classList.add(
    "hidden"
  );

  adminLoginCard?.classList.remove(
    "hidden"
  );

  setAdminLoginMessage("");

  adminEmail?.focus();
}

function showDashboard(user) {
  adminLoginView?.classList.add(
    "hidden"
  );

  adminDashboard?.classList.remove(
    "hidden"
  );

  adminSetupCard?.classList.add(
    "hidden"
  );

  adminAccessCard?.classList.add(
    "hidden"
  );

  adminLoginCard?.classList.add(
    "hidden"
  );

  if (adminName) {
    adminName.textContent =
      user?.full_name ||
      "Administrator";
  }
}

/* =========================
   DASHBOARD NAVIGATION
========================= */

function openDashboardSection(navItem) {
  const sectionId =
    navItem.dataset.section;

  if (!sectionId) {
    return;
  }

  navItems.forEach((item) => {
    item.classList.remove(
      "active"
    );
  });

  navItem.classList.add(
    "active"
  );

  dashboardSections.forEach(
    (section) => {
      section.classList.toggle(
        "active",
        section.id === sectionId
      );
    }
  );

  if (pageTitle) {
    pageTitle.textContent =
      navItem
        .querySelector("span")
        ?.textContent
        ?.trim() ||
      "FoodConnect Admin";
  }

  adminSidebar?.classList.remove(
    "open"
  );

  if (
    sectionId ===
    "applicationsSection"
  ) {
    loadApplications();
  }
}

/* =========================
   APPLICATIONS
========================= */

async function loadApplications() {
  applicationsLoading?.classList.remove(
    "hidden"
  );

  applicationsEmpty?.classList.add(
    "hidden"
  );

  applicationsTableWrapper
    ?.classList.add(
      "hidden"
    );

  try {
    const params =
      new URLSearchParams({
        status:
          currentApplicationStatus
      });

    const response = await fetch(
      `${API_BASE}/get_partner_applications.php?${params}`,
      {
        credentials: "include",

        headers: {
          "Accept":
            "application/json"
        }
      }
    );

    const data =
      await readJson(response);

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      showAdminAccess();
      return;
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to load applications."
      );
    }

    loadedApplications =
      Array.isArray(
        data.applications
      )
        ? data.applications
        : [];

    updateApplicationCounts(
      data.counts || {}
    );

    renderApplications(
      loadedApplications
    );
  } catch (error) {
    console.error(
      "Application load failed:",
      error
    );

    if (applicationsEmpty) {
      applicationsEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>
          Unable to load applications
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>
      `;

      applicationsEmpty.classList.remove(
        "hidden"
      );
    }
  } finally {
    applicationsLoading?.classList.add(
      "hidden"
    );
  }
}

function renderApplications(
  applications
) {
  if (!applicationsTableBody) {
    return;
  }

  applicationsTableBody.innerHTML =
    "";

  if (applications.length === 0) {
    applicationsEmpty?.classList.remove(
      "hidden"
    );

    applicationsTableWrapper
      ?.classList.add(
        "hidden"
      );

    return;
  }

  applicationsEmpty?.classList.add(
    "hidden"
  );

  applications.forEach(
    (application) => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>
          <span class="table-primary">
            ${escapeHtml(
              application.restaurant_name
            )}
          </span>

          <span class="table-secondary">
            ${escapeHtml(
              application.restaurant_address
            )}
          </span>
        </td>

        <td>
          <span class="table-primary">
            ${escapeHtml(
              application.owner_name
            )}
          </span>

          <span class="table-secondary">
            ${escapeHtml(
              application.owner_email
            )}
          </span>
        </td>

        <td>
          ${escapeHtml(
            application.cuisine ||
            "—"
          )}
        </td>

        <td>
          <span class="
            status-badge
            status-${escapeHtml(
              application.application_status
            )}
          ">
            ${escapeHtml(
              formatStatus(
                application.application_status
              )
            )}
          </span>
        </td>

        <td>
          ${escapeHtml(
            formatDate(
              application.submitted_at ||
              application.updated_at
            )
          )}
        </td>

        <td>
          <button
            type="button"
            class="view-button"
            data-application-id="${
              application.application_id
            }"
          >
            View
          </button>
        </td>
      `;

      applicationsTableBody.appendChild(
        row
      );
    }
  );

  applicationsTableBody
    .querySelectorAll(
      ".view-button"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const applicationId =
            Number(
              button.dataset
                .applicationId || 0
            );

          openApplicationDetails(
            applicationId
          );
        }
      );
    });

  applicationsTableWrapper
    ?.classList.remove(
      "hidden"
    );
}

function openApplicationDetails(
  applicationId
) {
  const application =
    loadedApplications.find(
      (item) =>
        Number(
          item.application_id
        ) ===
        Number(applicationId)
    );

  if (
    !application ||
    !applicationModalContent
  ) {
    return;
  }

  applicationModalContent.innerHTML = `
    <h2>
      ${escapeHtml(
        application.restaurant_name
      )}
    </h2>

    <p>
      Restaurant application details
    </p>

    <div class="details-grid">
      ${createDetail(
        "Application Status",
        formatStatus(
          application.application_status
        )
      )}

      ${createDetail(
        "Cuisine",
        application.cuisine ||
        "—"
      )}

      ${createDetail(
        "Owner Name",
        application.owner_name
      )}

      ${createDetail(
        "Owner Email",
        application.owner_email
      )}

      ${createDetail(
        "Owner Contact",
        application.owner_contact ||
        "—"
      )}

      ${createDetail(
        "Restaurant Contact",
        application.restaurant_contact ||
        "—"
      )}

      ${createDetail(
        "Business Email",
        application.business_email ||
        "—"
      )}

      ${createDetail(
        "Minimum Order",
        formatCurrency(
          application.minimum_order
        )
      )}

      ${createDetail(
        "Delivery Fee",
        formatCurrency(
          application.delivery_fee
        )
      )}

      ${createDetail(
        "Address",
        application.restaurant_address,
        true
      )}

      ${
        application.rejection_reason
          ? createDetail(
              "Rejection Reason",
              application.rejection_reason,
              true
            )
          : ""
      }
    </div>

    ${
      application.application_status ===
      "submitted"
        ? `
          <div
            style="
              margin-top:22px;
              padding:15px;
              border-radius:12px;
              background:#fff6e8;
              color:#89520e;
            "
          >
            Approval and rejection controls
            will be added next.
          </div>
        `
        : ""
    }
  `;

  applicationModal?.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";
}

function closeDetailsModal() {
  applicationModal?.classList.add(
    "hidden"
  );

  document.body.style.overflow =
    "";
}

function updateApplicationCounts(
  counts
) {
  setText(
    "allApplicationsCount",
    counts.all || 0
  );

  setText(
    "submittedApplicationsCount",
    counts.submitted || 0
  );

  setText(
    "draftApplicationsCount",
    counts.draft || 0
  );

  setText(
    "approvedApplicationsCount",
    counts.approved || 0
  );

  setText(
    "rejectedApplicationsCount",
    counts.rejected || 0
  );

  setText(
    "submittedCount",
    counts.submitted || 0
  );

  setText(
    "approvedCount",
    counts.approved || 0
  );

  const submittedBadge =
    document.getElementById(
      "submittedBadge"
    );

  if (submittedBadge) {
    const total =
      Number(
        counts.submitted || 0
      );

    submittedBadge.textContent =
      total;

    submittedBadge.classList.toggle(
      "hidden",
      total <= 0
    );
  }
}

/* =========================
   MESSAGE HELPERS
========================= */

function setAdminAccessMessage(
  message = "",
  type = "error"
) {
  if (!adminAccessMessage) {
    return;
  }

  adminAccessMessage.textContent =
    message;

  adminAccessMessage.style.color =
    type === "success"
      ? "#198754"
      : "#dc3545";
}

function setAdminSetupMessage(
  message = "",
  type = "error"
) {
  if (!adminSetupMessage) {
    return;
  }

  adminSetupMessage.textContent =
    message;

  adminSetupMessage.style.color =
    type === "success"
      ? "#198754"
      : "#dc3545";
}

function setAdminLoginMessage(
  message = "",
  type = "error"
) {
  if (!adminLoginMessage) {
    return;
  }

  adminLoginMessage.textContent =
    message;

  adminLoginMessage.style.color =
    type === "success"
      ? "#198754"
      : "#dc3545";
}

/* =========================
   GENERAL HELPERS
========================= */

function setText(
  elementId,
  value
) {
  const element =
    document.getElementById(
      elementId
    );

  if (element) {
    element.textContent =
      String(value);
  }
}

function createDetail(
  label,
  value,
  fullWidth = false
) {
  return `
    <div class="
      detail-item
      ${fullWidth
        ? "detail-full"
        : ""}
    ">
      <span>
        ${escapeHtml(label)}
      </span>

      <strong>
        ${escapeHtml(value || "—")}
      </strong>
    </div>
  `;
}

async function readJson(
  response
) {
  const text =
    await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error(
      "Invalid API response:",
      text
    );

    throw new Error(
      "The server returned invalid JSON."
    );
  }
}

function formatStatus(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatCurrency(value) {
  const amount =
    Number(value || 0);

  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP"
    }
  ).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "Not submitted";
  }

  const date =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-PH",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}