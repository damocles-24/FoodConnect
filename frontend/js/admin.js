"use strict";

const API_BASE =
  "/FoodConnect/api";

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
   RESTAURANT ELEMENTS
========================= */

const refreshRestaurantsButton =
  document.getElementById(
    "refreshRestaurantsButton"
  );

const restaurantSearchInput =
  document.getElementById(
    "restaurantSearchInput"
  );

const searchRestaurantsButton =
  document.getElementById(
    "searchRestaurantsButton"
  );

const clearRestaurantSearchButton =
  document.getElementById(
    "clearRestaurantSearchButton"
  );

const restaurantsMessage =
  document.getElementById(
    "restaurantsMessage"
  );

const restaurantsLoading =
  document.getElementById(
    "restaurantsLoading"
  );

const restaurantsEmpty =
  document.getElementById(
    "restaurantsEmpty"
  );

const restaurantsTableWrapper =
  document.getElementById(
    "restaurantsTableWrapper"
  );

const restaurantsTableBody =
  document.getElementById(
    "restaurantsTableBody"
  );

const totalRestaurantsCount =
  document.getElementById(
    "totalRestaurantsCount"
  );

const openRestaurantsCount =
  document.getElementById(
    "openRestaurantsCount"
  );

const closedRestaurantsCount =
  document.getElementById(
    "closedRestaurantsCount"
  );

const unavailableRestaurantsCount =
  document.getElementById(
    "unavailableRestaurantsCount"
  );

let loadedRestaurants = [];

/* =========================
   PLATFORM USER ELEMENTS
========================= */

const refreshPlatformUsersButton =
  document.getElementById(
    "refreshPlatformUsersButton"
  );

const platformUserSearchInput =
  document.getElementById(
    "platformUserSearchInput"
  );

const platformUserRoleFilter =
  document.getElementById(
    "platformUserRoleFilter"
  );

const platformUserStatusFilter =
  document.getElementById(
    "platformUserStatusFilter"
  );

const searchPlatformUsersButton =
  document.getElementById(
    "searchPlatformUsersButton"
  );

const clearPlatformUserFiltersButton =
  document.getElementById(
    "clearPlatformUserFiltersButton"
  );

const platformUsersMessage =
  document.getElementById(
    "platformUsersMessage"
  );

const platformUsersLoading =
  document.getElementById(
    "platformUsersLoading"
  );

const platformUsersEmpty =
  document.getElementById(
    "platformUsersEmpty"
  );

const platformUsersTableWrapper =
  document.getElementById(
    "platformUsersTableWrapper"
  );

const platformUsersTableBody =
  document.getElementById(
    "platformUsersTableBody"
  );

const totalPlatformUsersCount =
  document.getElementById(
    "totalPlatformUsersCount"
  );

const activePlatformUsersCount =
  document.getElementById(
    "activePlatformUsersCount"
  );

const inactivePlatformUsersCount =
  document.getElementById(
    "inactivePlatformUsersCount"
  );

const restaurantStaffCount =
  document.getElementById(
    "restaurantStaffCount"
  );

let loadedPlatformUsers = [];

/* =========================
   ACTIVITY LOG ELEMENTS
========================= */

const refreshActivityLogsButton =
  document.getElementById(
    "refreshActivityLogsButton"
  );

const activityLogSearchInput =
  document.getElementById(
    "activityLogSearchInput"
  );

const activityLogTypeFilter =
  document.getElementById(
    "activityLogTypeFilter"
  );

const searchActivityLogsButton =
  document.getElementById(
    "searchActivityLogsButton"
  );

const clearActivityLogFiltersButton =
  document.getElementById(
    "clearActivityLogFiltersButton"
  );

const activityLogsMessage =
  document.getElementById(
    "activityLogsMessage"
  );

const activityLogsLoading =
  document.getElementById(
    "activityLogsLoading"
  );

const activityLogsEmpty =
  document.getElementById(
    "activityLogsEmpty"
  );

const activityLogsTableWrapper =
  document.getElementById(
    "activityLogsTableWrapper"
  );

const activityLogsTableBody =
  document.getElementById(
    "activityLogsTableBody"
  );

const totalActivityLogsCount =
  document.getElementById(
    "totalActivityLogsCount"
  );

const todayActivityLogsCount =
  document.getElementById(
    "todayActivityLogsCount"
  );

const restaurantActivityLogsCount =
  document.getElementById(
    "restaurantActivityLogsCount"
  );

const userActivityLogsCount =
  document.getElementById(
    "userActivityLogsCount"
  );

let loadedActivityLogs = [];

let currentAdminId = 0;

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

      refreshRestaurantsButton
    ?.addEventListener(
      "click",
      loadRestaurants
    );

  searchRestaurantsButton
    ?.addEventListener(
      "click",
      loadRestaurants
    );

  clearRestaurantSearchButton
    ?.addEventListener(
      "click",
      () => {
        if (restaurantSearchInput) {
          restaurantSearchInput.value = "";
        }

        loadRestaurants();
      }
    );

  restaurantSearchInput
    ?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          loadRestaurants();
        }
      }
    );

      refreshPlatformUsersButton
    ?.addEventListener(
      "click",
      loadPlatformUsers
    );

  searchPlatformUsersButton
    ?.addEventListener(
      "click",
      loadPlatformUsers
    );

  platformUserSearchInput
    ?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          loadPlatformUsers();
        }
      }
    );

      refreshActivityLogsButton
    ?.addEventListener(
      "click",
      loadActivityLogs
    );

  searchActivityLogsButton
    ?.addEventListener(
      "click",
      loadActivityLogs
    );

  activityLogSearchInput
    ?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          loadActivityLogs();
        }
      }
    );

  activityLogTypeFilter
    ?.addEventListener(
      "change",
      loadActivityLogs
    );

  clearActivityLogFiltersButton
    ?.addEventListener(
      "click",
      () => {
        if (activityLogSearchInput) {
          activityLogSearchInput.value =
            "";
        }

        if (activityLogTypeFilter) {
          activityLogTypeFilter.value =
            "";
        }

        loadActivityLogs();
      }
    );

  platformUserRoleFilter
    ?.addEventListener(
      "change",
      loadPlatformUsers
    );

  platformUserStatusFilter
    ?.addEventListener(
      "change",
      loadPlatformUsers
    );

  clearPlatformUserFiltersButton
    ?.addEventListener(
      "click",
      () => {
        if (platformUserSearchInput) {
          platformUserSearchInput.value =
            "";
        }

        if (platformUserRoleFilter) {
          platformUserRoleFilter.value =
            "all";
        }

        if (platformUserStatusFilter) {
          platformUserStatusFilter.value =
            "all";
        }

        loadPlatformUsers();
      }
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

    if (
    sectionId ===
    "restaurantsSection"
  ) {
    loadRestaurants();
  }

    if (
    sectionId ===
    "platformUsersSection"
  ) {
    loadPlatformUsers();
  }

  if (
    sectionId ===
    "activityLogsSection"
  ) {
    loadActivityLogs();
  }
}

/* =========================
   RESTAURANTS
========================= */

async function loadRestaurants() {
  restaurantsLoading?.classList.remove(
    "hidden"
  );

  restaurantsEmpty?.classList.add(
    "hidden"
  );

  restaurantsTableWrapper?.classList.add(
    "hidden"
  );

  setRestaurantsMessage(
    "",
    ""
  );

  try {
    const search =
      restaurantSearchInput?.value
        ?.trim() || "";

    const params =
      new URLSearchParams();

    if (search !== "") {
      params.set(
        "search",
        search
      );
    }

    const response = await fetch(
      `${API_BASE}/get_admin_restaurants.php?${params.toString()}`,
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
        "Unable to load restaurants."
      );
    }

    loadedRestaurants =
      Array.isArray(
        data.restaurants
      )
        ? data.restaurants
        : [];

    updateRestaurantSummary(
      data.summary || {}
    );

    renderRestaurants(
      loadedRestaurants
    );
  } catch (error) {
    console.error(
      "Load restaurants error:",
      error
    );

    restaurantsEmpty?.classList.remove(
      "hidden"
    );

    if (restaurantsEmpty) {
      restaurantsEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>Unable to load restaurants</h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Please try again."
          )}
        </p>
      `;
    }
  } finally {
    restaurantsLoading?.classList.add(
      "hidden"
    );
  }
}

function renderRestaurants(
  restaurants
) {
  if (!restaurantsTableBody) {
    return;
  }

  restaurantsTableBody.innerHTML = "";

  if (restaurants.length === 0) {
    restaurantsEmpty?.classList.remove(
      "hidden"
    );

    restaurantsTableWrapper?.classList.add(
      "hidden"
    );

    return;
  }

  restaurantsEmpty?.classList.add(
    "hidden"
  );

  restaurantsTableWrapper?.classList.remove(
    "hidden"
  );

  restaurants.forEach(
    (restaurant) => {
      const row =
        document.createElement("tr");

      const statusClass =
        getRestaurantStatusClass(
          restaurant.business_status
        );

      row.innerHTML = `
        <td>
          <strong>
            ${escapeHtml(
              restaurant.name
            )}
          </strong>

          <small class="table-subtext">
            ${escapeHtml(
              restaurant.address ||
              "No address"
            )}
          </small>

          <small class="table-subtext">
            Delivery fee:
            ${formatCurrency(
              restaurant.delivery_fee
            )}
          </small>
        </td>

        <td>
          <strong>
            ${escapeHtml(
              restaurant.owner_name
            )}
          </strong>

          <small class="table-subtext">
            ${escapeHtml(
              restaurant.owner_email
            )}
          </small>
        </td>

        <td>
          <span class="status-badge ${statusClass}">
            ${escapeHtml(
              restaurant.business_status
            )}
          </span>

          <small class="table-subtext">
            Owner:
            ${
              Number(
                restaurant.owner_status
              ) === 1
                ? "Active"
                : "Inactive"
            }
          </small>
        </td>

        <td>
          ${Number(
            restaurant.staff_count || 0
          )}
        </td>

        <td>
          <strong>
            ${Number(
              restaurant.total_orders || 0
            )}
          </strong>

          <small class="table-subtext">
            Active:
            ${Number(
              restaurant.active_orders || 0
            )}
          </small>
        </td>

        <td>
          ${formatCurrency(
            restaurant.total_sales
          )}
        </td>

                <td>
          <div class="restaurant-action-group">

            <select
              class="restaurant-status-select"
              data-restaurant-id="${Number(
                restaurant.restaurant_id
              )}"
              data-restaurant-name="${escapeHtml(
                restaurant.name
              )}"
              data-current-status="${escapeHtml(
                restaurant.business_status
              )}"
              ${
                Number(
                  restaurant.owner_status
                ) === 0
                  ? "disabled"
                  : ""
              }
            >
              <option
                value="Open"
                ${
                  restaurant.business_status ===
                  "Open"
                    ? "selected"
                    : ""
                }
              >
                Open
              </option>

              <option
                value="Closed"
                ${
                  restaurant.business_status ===
                  "Closed"
                    ? "selected"
                    : ""
                }
              >
                Closed
              </option>

              <option
                value="Temporarily Unavailable"
                ${
                  restaurant.business_status ===
                  "Temporarily Unavailable"
                    ? "selected"
                    : ""
                }
              >
                Temporarily Unavailable
              </option>
            </select>

            <button
              type="button"
              class="
                restaurant-access-button
                ${
                  Number(
                    restaurant.owner_status
                  ) === 1
                    ? "deactivate"
                    : "reactivate"
                }
              "
              data-restaurant-id="${Number(
                restaurant.restaurant_id
              )}"
              data-restaurant-name="${escapeHtml(
                restaurant.name
              )}"
              data-owner-status="${Number(
                restaurant.owner_status || 0
              )}"
              data-active-orders="${Number(
                restaurant.active_orders || 0
              )}"
            >
              <i class="
                fa-solid
                ${
                  Number(
                    restaurant.owner_status
                  ) === 1
                    ? "fa-ban"
                    : "fa-rotate-left"
                }
              "></i>

              ${
                Number(
                  restaurant.owner_status
                ) === 1
                  ? "Deactivate"
                  : "Reactivate"
              }
            </button>

          </div>
        </td>
      `;

      restaurantsTableBody.appendChild(
        row
      );
    }
  );

  bindRestaurantStatusControls();
}

function bindRestaurantStatusControls() {
  const statusSelects =
    restaurantsTableBody
      ?.querySelectorAll(
        ".restaurant-status-select"
      ) || [];

  statusSelects.forEach(
    (select) => {
      select.addEventListener(
        "change",
        async () => {
          const restaurantId =
            Number(
              select.dataset
                .restaurantId
            );

          const restaurantName =
            select.dataset
              .restaurantName ||
            "this restaurant";

          const previousStatus =
            select.dataset
              .currentStatus;

          const selectedStatus =
            select.value;

          const confirmed =
            window.confirm(
              `Change ${restaurantName} from ${previousStatus} to ${selectedStatus}?`
            );

          if (!confirmed) {
            select.value =
              previousStatus;

            return;
          }

          select.disabled = true;

          try {
            await updateRestaurantStatus(
              restaurantId,
              selectedStatus
            );

            select.dataset.currentStatus =
              selectedStatus;

            await loadRestaurants();

            setRestaurantsMessage(
              `${restaurantName} is now ${selectedStatus}.`,
              "success"
            );
          } catch (error) {
            console.error(
              "Update restaurant status error:",
              error
            );

            select.value =
              previousStatus;

            setRestaurantsMessage(
              error.message ||
              "Unable to update restaurant status.",
              "error"
            );
          } finally {
            select.disabled = false;
          }
        }
      );
    }
  );

  const accessButtons =
    restaurantsTableBody
      ?.querySelectorAll(
        ".restaurant-access-button"
      ) || [];

  accessButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        async () => {
          const restaurantId =
            Number(
              button.dataset
                .restaurantId || 0
            );

          const restaurantName =
            button.dataset
              .restaurantName ||
            "this restaurant";

          const ownerStatus =
            Number(
              button.dataset
                .ownerStatus || 0
            );

          const activeOrders =
            Number(
              button.dataset
                .activeOrders || 0
            );

          const action =
            ownerStatus === 1
              ? "deactivate"
              : "reactivate";

          if (
            action === "deactivate" &&
            activeOrders > 0
          ) {
            setRestaurantsMessage(
              `${restaurantName} still has ${activeOrders} active order(s). Complete or cancel them first.`,
              "error"
            );

            return;
          }

          const confirmationMessage =
            action === "deactivate"
              ? `Deactivate ${restaurantName} from FoodConnect?\n\nThe restaurant will disappear from the customer website. The Owner, Cashiers, and Delivery Staff will no longer be able to log in. Existing records will be preserved.`
              : `Reactivate ${restaurantName}?\n\nThe owner account will regain access. Staff accounts will remain inactive until reviewed.`;

          const confirmed =
            window.confirm(
              confirmationMessage
            );

          if (!confirmed) {
            return;
          }

          const originalHtml =
            button.innerHTML;

          button.disabled = true;

          button.textContent =
            action === "deactivate"
              ? "Deactivating..."
              : "Reactivating...";

          try {
            const data =
              await updateRestaurantAccess(
                restaurantId,
                action
              );

            await loadRestaurants();

            setRestaurantsMessage(
              data.message ||
              `${restaurantName} was updated successfully.`,
              "success"
            );
          } catch (error) {
            console.error(
              "Update restaurant access error:",
              error
            );

            setRestaurantsMessage(
              error.message ||
              "Unable to update restaurant access.",
              "error"
            );

            button.disabled = false;
            button.innerHTML =
              originalHtml;
          }
        }
      );
    }
  );
}

async function updateRestaurantStatus(
  restaurantId,
  businessStatus
) {
  const response = await fetch(
    `${API_BASE}/update_admin_restaurant_status.php`,
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
        restaurant_id:
          restaurantId,

        business_status:
          businessStatus
      })
    }
  );

  const data =
    await readJson(response);

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    showAdminAccess();

    throw new Error(
      "Administrator session expired."
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to update restaurant status."
    );
  }

  return data;
}

async function updateRestaurantAccess(
  restaurantId,
  action
) {
  const response = await fetch(
    `${API_BASE}/update_admin_restaurant_access.php`,
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
        restaurant_id:
          restaurantId,

        action:
          action
      })
    }
  );

  const data =
    await readJson(response);

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    showAdminAccess();

    throw new Error(
      data.message ||
      "Administrator session expired."
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to update restaurant access."
    );
  }

  return data;
}

function updateRestaurantSummary(
  summary
) {
  setText(
    totalRestaurantsCount,
    Number(
      summary.total_restaurants || 0
    )
  );

  setText(
    openRestaurantsCount,
    Number(
      summary.open_restaurants || 0
    )
  );

  setText(
    closedRestaurantsCount,
    Number(
      summary.closed_restaurants || 0
    )
  );

  setText(
    unavailableRestaurantsCount,
    Number(
      summary.temporarily_unavailable || 0
    )
  );
}

function getRestaurantStatusClass(
  status
) {
  switch (status) {
    case "Open":
      return "status-approved";

    case "Closed":
      return "status-rejected";

    case "Temporarily Unavailable":
      return "status-draft";

    default:
      return "";
  }
}

function setRestaurantsMessage(
  message,
  type = ""
) {
  if (!restaurantsMessage) {
    return;
  }

  restaurantsMessage.textContent =
    message;

  restaurantsMessage.className =
    "form-message";

  if (type) {
    restaurantsMessage.classList.add(
      type
    );
  }
}

/* =========================
   PLATFORM USERS
========================= */

async function loadPlatformUsers() {
  platformUsersLoading?.classList.remove(
    "hidden"
  );

  platformUsersEmpty?.classList.add(
    "hidden"
  );

  platformUsersTableWrapper
    ?.classList.add(
      "hidden"
    );

  setPlatformUsersMessage(
    "",
    ""
  );

  try {
    const search =
      platformUserSearchInput
        ?.value
        ?.trim() || "";

    const role =
      platformUserRoleFilter
        ?.value || "all";

    const status =
      platformUserStatusFilter
        ?.value || "all";

    const params =
      new URLSearchParams({
        search,
        role,
        status
      });

    const response = await fetch(
      `${API_BASE}/get_platform_users.php?${params.toString()}`,
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
        "Unable to load platform users."
      );
    }

    loadedPlatformUsers =
      Array.isArray(
        data.users
      )
        ? data.users
        : [];

    currentAdminId =
      Number(
        data.current_admin_id || 0
      );

    updatePlatformUserSummary(
      data.summary || {}
    );

    renderPlatformUsers(
      loadedPlatformUsers
    );
  } catch (error) {
    console.error(
      "Load platform users error:",
      error
    );

    platformUsersEmpty
      ?.classList.remove(
        "hidden"
      );

    platformUsersTableWrapper
      ?.classList.add(
        "hidden"
      );

    if (platformUsersEmpty) {
      platformUsersEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>
          Unable to load platform users
        </h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Please try again."
          )}
        </p>
      `;
    }
  } finally {
    platformUsersLoading
      ?.classList.add(
        "hidden"
      );
  }
}

function updatePlatformUserSummary(
  summary
) {
  setText(
    totalPlatformUsersCount,
    Number(
      summary.total_users || 0
    )
  );

  setText(
    activePlatformUsersCount,
    Number(
      summary.active_users || 0
    )
  );

  setText(
    inactivePlatformUsersCount,
    Number(
      summary.inactive_users || 0
    )
  );

  setText(
    restaurantStaffCount,
    Number(
      summary.restaurant_staff || 0
    )
  );
}

function renderPlatformUsers(users) {
  if (!platformUsersTableBody) {
    return;
  }

  platformUsersTableBody.innerHTML =
    "";

  if (users.length === 0) {
    platformUsersEmpty
      ?.classList.remove(
        "hidden"
      );

    platformUsersTableWrapper
      ?.classList.add(
        "hidden"
      );

    return;
  }

  platformUsersEmpty
    ?.classList.add(
      "hidden"
    );

  platformUsersTableWrapper
    ?.classList.remove(
      "hidden"
    );

  users.forEach((user) => {
    const row =
      document.createElement("tr");

    const userId =
      Number(
        user.user_id || 0
      );

    const userStatus =
      Number(
        user.status || 0
      );

    const isCurrentAdmin =
      Boolean(
        user.is_current_admin
      ) ||
      (
        userId > 0 &&
        userId === currentAdminId
      );

    const role =
      String(
        user.role || ""
      ).toLowerCase();

    const roleLabel =
      getPlatformUserRoleLabel(
        role
      );

    const restaurantName =
      String(
        user.restaurant_name || ""
      ).trim();

    const contactNumber =
      String(
        user.contact_number || ""
      ).trim();

    const isVerified =
      Number(
        user.is_verified || 0
      ) === 1;

    const actionMarkup =
      isCurrentAdmin
        ? `
          <span class="current-admin-label">
            <i class="fa-solid fa-user-shield"></i>
            Current Admin
          </span>
        `
        : `
          <button
            type="button"
            class="
              platform-user-action-button
              ${
                userStatus === 1
                  ? "deactivate"
                  : "activate"
              }
            "
            data-user-id="${userId}"
            data-user-name="${escapeHtml(
              user.full_name
            )}"
            data-current-status="${userStatus}"
          >
            ${
              userStatus === 1
                ? "Deactivate"
                : "Activate"
            }
          </button>
        `;

    row.innerHTML = `
      <td data-label="Name">
        <span class="platform-user-name">
          ${escapeHtml(
            user.full_name ||
            "Unnamed User"
          )}
        </span>

        ${
          contactNumber
            ? `
              <span class="platform-user-contact">
                ${escapeHtml(
                  contactNumber
                )}
              </span>
            `
            : ""
        }
      </td>

      <td data-label="Email">
        ${escapeHtml(
          user.email || "—"
        )}
      </td>

      <td data-label="Role">
        <span class="
          platform-user-role-badge
          ${escapeHtml(role)}
        ">
          ${escapeHtml(
            roleLabel
          )}
        </span>
      </td>

      <td data-label="Restaurant">
        ${
          restaurantName
            ? escapeHtml(
                restaurantName
              )
            : `
              <span class="table-secondary">
                Platform account
              </span>
            `
        }
      </td>

      <td data-label="Verification">
        <span class="
          platform-user-verification-badge
          ${
            isVerified
              ? "verified"
              : "unverified"
          }
        ">
          <i class="
            fa-solid
            ${
              isVerified
                ? "fa-circle-check"
                : "fa-circle-exclamation"
            }
          "></i>

          ${
            isVerified
              ? "Verified"
              : "Unverified"
          }
        </span>
      </td>

      <td data-label="Status">
        <span class="
          platform-user-account-badge
          ${
            userStatus === 1
              ? "active"
              : "inactive"
          }
        ">
          ${
            userStatus === 1
              ? "Active"
              : "Inactive"
          }
        </span>
      </td>

      <td data-label="Date Joined">
        ${escapeHtml(
          formatDate(
            user.created_at
          )
        )}
      </td>

      <td data-label="Action">
        ${actionMarkup}
      </td>
    `;

    platformUsersTableBody
      .appendChild(row);
  });

  bindPlatformUserActions();
}

function bindPlatformUserActions() {
  const actionButtons =
    platformUsersTableBody
      ?.querySelectorAll(
        ".platform-user-action-button"
      ) || [];

  actionButtons.forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        const userId =
          Number(
            button.dataset.userId || 0
          );

        const userName =
          button.dataset.userName ||
          "this user";

        const currentStatus =
          Number(
            button.dataset
              .currentStatus || 0
          );

        const newStatus =
          currentStatus === 1
            ? 0
            : 1;

        const actionWord =
          newStatus === 1
            ? "activate"
            : "deactivate";

        const confirmed =
          window.confirm(
            `Are you sure you want to ${actionWord} ${userName}?`
          );

        if (!confirmed) {
          return;
        }

        const originalText =
          button.textContent;

        button.disabled = true;

        button.textContent =
          newStatus === 1
            ? "Activating..."
            : "Deactivating...";

        try {
          const data =
            await updatePlatformUserStatus(
              userId,
              newStatus
            );

          await loadPlatformUsers();

setPlatformUsersMessage(
  data.message ||
  `${userName} was updated successfully.`,
  "success"
);
        } catch (error) {
          console.error(
            "Platform user status update error:",
            error
          );

          setPlatformUsersMessage(
            error.message ||
            "Unable to update the user account.",
            "error"
          );
        } finally {
          button.disabled = false;

          button.textContent =
            originalText;
        }
      }
    );
  });
}

async function updatePlatformUserStatus(
  userId,
  status
) {
  const response = await fetch(
    `${API_BASE}/update_platform_user_status.php`,
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
        user_id:
          userId,

        status
      })
    }
  );

  const data =
    await readJson(response);

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    showAdminAccess();

    throw new Error(
      data.message ||
      "Administrator session expired."
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to update the user account."
    );
  }

  return data;
}

function getPlatformUserRoleLabel(
  role
) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "owner":
      return "Restaurant Owner";

    case "customer":
      return "Customer";

    case "cashier":
      return "Cashier";

    case "delivery_staff":
      return "Delivery Staff";

    default:
      return formatStatus(role);
  }
}

function setPlatformUsersMessage(
  message,
  type = ""
) {
  if (!platformUsersMessage) {
    return;
  }

  platformUsersMessage.textContent =
    message;

  platformUsersMessage.className =
    "platform-users-message";

  if (type) {
    platformUsersMessage.classList.add(
      type
    );
  }
}

/* =========================
   ACTIVITY LOGS
========================= */

async function loadActivityLogs() {
  activityLogsLoading
    ?.classList.remove(
      "hidden"
    );

  activityLogsEmpty
    ?.classList.add(
      "hidden"
    );

  activityLogsTableWrapper
    ?.classList.add(
      "hidden"
    );

  setActivityLogsMessage(
    "",
    ""
  );

  try {
    const search =
      activityLogSearchInput
        ?.value
        ?.trim() || "";

    const actionType =
      activityLogTypeFilter
        ?.value
        ?.trim() || "";

    const params =
      new URLSearchParams();

    if (search !== "") {
      params.set(
        "search",
        search
      );
    }

    if (actionType !== "") {
      params.set(
        "action_type",
        actionType
      );
    }

    params.set(
      "limit",
      "500"
    );

    const queryString =
      params.toString();

    const requestUrl =
      queryString !== ""
        ? `${API_BASE}/get_admin_activity_logs.php?${queryString}`
        : `${API_BASE}/get_admin_activity_logs.php`;

    const response =
      await fetch(
        requestUrl,
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
        "Unable to load platform activity logs."
      );
    }

    loadedActivityLogs =
      Array.isArray(
        data.logs
      )
        ? data.logs
        : [];

    updateActivityLogSummary(
      loadedActivityLogs
    );

    renderActivityLogs(
      loadedActivityLogs
    );
  } catch (error) {
    console.error(
      "Load activity logs error:",
      error
    );

    loadedActivityLogs = [];

    updateActivityLogSummary([]);

    activityLogsEmpty
      ?.classList.remove(
        "hidden"
      );

    activityLogsTableWrapper
      ?.classList.add(
        "hidden"
      );

    if (activityLogsEmpty) {
      activityLogsEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>
          Unable to load activity logs
        </h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Please try again."
          )}
        </p>
      `;
    }

    setActivityLogsMessage(
      error.message ||
      "Unable to load activity logs.",
      "error"
    );
  } finally {
    activityLogsLoading
      ?.classList.add(
        "hidden"
      );
  }
}

function updateActivityLogSummary(
  logs
) {
  const safeLogs =
    Array.isArray(logs)
      ? logs
      : [];

  const todayKey =
    getLocalDateKey(
      new Date()
    );

  let todayCount = 0;
  let restaurantCount = 0;
  let userCount = 0;

  safeLogs.forEach((log) => {
    const actionType =
      String(
        log.action_type || ""
      ).toLowerCase();

    const createdAt =
      parseDatabaseDate(
        log.created_at
      );

    if (
      createdAt &&
      getLocalDateKey(createdAt) ===
        todayKey
    ) {
      todayCount += 1;
    }

    if (
      actionType.startsWith(
        "restaurant"
      )
    ) {
      restaurantCount += 1;
    }

    if (
      actionType ===
      "account_status" ||
      actionType ===
      "user_status" ||
      actionType ===
      "owner_verification"
    ) {
      userCount += 1;
    }
  });

  setText(
    totalActivityLogsCount,
    safeLogs.length
  );

  setText(
    todayActivityLogsCount,
    todayCount
  );

  setText(
    restaurantActivityLogsCount,
    restaurantCount
  );

  setText(
    userActivityLogsCount,
    userCount
  );
}

function renderActivityLogs(logs) {
  if (!activityLogsTableBody) {
    return;
  }

  activityLogsTableBody.innerHTML =
    "";

  if (
    !Array.isArray(logs) ||
    logs.length === 0
  ) {
    activityLogsEmpty
      ?.classList.remove(
        "hidden"
      );

    activityLogsTableWrapper
      ?.classList.add(
        "hidden"
      );

    if (activityLogsEmpty) {
      activityLogsEmpty.innerHTML = `
        <i class="fa-solid fa-clock-rotate-left"></i>

        <h3>
          No activity logs found
        </h3>

        <p>
          Platform actions matching the selected
          filters will appear here.
        </p>
      `;
    }

    return;
  }

  activityLogsEmpty
    ?.classList.add(
      "hidden"
    );

  activityLogsTableWrapper
    ?.classList.remove(
      "hidden"
    );

  logs.forEach((log) => {
    const row =
      document.createElement(
        "tr"
      );

    const administratorName =
      String(
        log.administrator_name ||
        "System Administrator"
      ).trim();

    const administratorEmail =
      String(
        log.administrator_email ||
        ""
      ).trim();

    const actionTitle =
      String(
        log.action_title ||
        formatStatus(
          log.action_type
        ) ||
        "Platform Action"
      ).trim();

    const actionType =
      String(
        log.action_type || "system"
      ).toLowerCase();

    const targetName =
      String(
        log.target_name ||
        log.restaurant_name ||
        "Platform"
      ).trim();

    const description =
      String(
        log.action_description ||
        "No description was provided."
      ).trim();

    const badgeClass =
      getActivityLogBadgeClass(
        actionType,
        actionTitle
      );

    row.innerHTML = `
      <td data-label="Date & Time">
        <span class="activity-log-date">
          ${escapeHtml(
            formatDate(
              log.created_at
            )
          )}
        </span>
      </td>

      <td data-label="Administrator">
        <div class="activity-log-administrator">
          <strong>
            ${escapeHtml(
              administratorName
            )}
          </strong>

          ${
            administratorEmail !== ""
              ? `
                <span>
                  ${escapeHtml(
                    administratorEmail
                  )}
                </span>
              `
              : ""
          }
        </div>
      </td>

      <td data-label="Action">
        <span class="
          activity-log-action-badge
          ${escapeHtml(badgeClass)}
        ">
          ${escapeHtml(
            actionTitle
          )}
        </span>
      </td>

      <td data-label="Target User / Restaurant">
        <strong class="activity-log-target">
          ${escapeHtml(
            targetName
          )}
        </strong>
      </td>

      <td data-label="Description">
        <p class="activity-log-description">
          ${escapeHtml(
            description
          )}
        </p>
      </td>
    `;

    activityLogsTableBody.appendChild(
      row
    );
  });
}

function getActivityLogBadgeClass(
  actionType,
  actionTitle
) {
  const normalizedType =
    String(
      actionType || ""
    ).toLowerCase();

  const normalizedTitle =
    String(
      actionTitle || ""
    ).toLowerCase();

  if (
    normalizedTitle.includes(
      "rejected"
    ) ||
    normalizedTitle.includes(
      "deactivated"
    )
  ) {
    return "danger";
  }

  if (
    normalizedTitle.includes(
      "changes requested"
    ) ||
    normalizedTitle.includes(
      "closed"
    )
  ) {
    return "warning";
  }

  if (
    normalizedTitle.includes(
      "approved"
    ) ||
    normalizedTitle.includes(
      "activated"
    ) ||
    normalizedTitle.includes(
      "verified"
    )
  ) {
    return "success";
  }

  if (
    normalizedType ===
      "restaurant_application" ||
    normalizedType ===
      "restaurant_status" ||
    normalizedType ===
      "restaurant_access"
  ) {
    return "restaurant";
  }

  if (
    normalizedType ===
      "account_status" ||
    normalizedType ===
      "user_status" ||
    normalizedType ===
      "owner_verification"
  ) {
    return "user";
  }

  return "system";
}

function setActivityLogsMessage(
  message,
  type = ""
) {
  if (!activityLogsMessage) {
    return;
  }

  activityLogsMessage.textContent =
    message;

  activityLogsMessage.className =
    "activity-logs-message";

  if (type) {
    activityLogsMessage.classList.add(
      type
    );
  }
}

function parseDatabaseDate(value) {
  if (!value) {
    return null;
  }

  const parsedDate =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate;
}

function getLocalDateKey(date) {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
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

  const isSubmitted =
    application.application_status ===
    "submitted";

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
      isSubmitted
        ? `
          <div class="application-preview-card">
            <div class="application-preview-card-copy">
              <span class="application-preview-label">
                Customer storefront preview
              </span>

              <h3>
                Review the customer-facing page
              </h3>

              <p>
                Open the same shared restaurant page customers
                will see after approval. Ordering and customer
                actions remain disabled while previewing.
              </p>
            </div>

            <button
              type="button"
              id="openAdminCustomerPreviewButton"
              class="application-preview-button"
            >
              <i class="fa-solid fa-arrow-up-right-from-square"></i>

              Open Customer Preview
            </button>
          </div>

          <div class="application-review-panel">
  <h3>
    Review application
  </h3>

  <p>
    Choose the correct decision after reviewing
    the application details and customer storefront.
  </p>

  <div
    id="applicationReviewReasonGroup"
    class="rejection-reason-group hidden"
  >
    <label
      id="applicationReviewReasonLabel"
      for="applicationReviewReason"
    >
      Review reason
    </label>

    <textarea
      id="applicationReviewReason"
      rows="4"
      maxlength="1000"
      placeholder="Explain the reason clearly."
    ></textarea>

    <small
      id="applicationReviewReasonHint"
    >
      Use at least 10 characters.
    </small>
  </div>

  <p
    id="applicationReviewMessage"
    class="application-review-message"
  ></p>

  <div class="application-review-actions">
    <button
      type="button"
      id="approveApplicationButton"
      class="approve-button"
    >
      <i class="fa-solid fa-check"></i>

      Approve Application
    </button>

   <button
  type="button"
  id="requestChangesApplicationButton"
  class="request-changes-button"
>
      <i class="fa-solid fa-pen-to-square"></i>

      Request Changes
    </button>

    <button
      type="button"
      id="rejectApplicationButton"
      class="reject-button"
    >
      <i class="fa-solid fa-ban"></i>

      Reject Application
    </button>

    <button
      type="button"
      id="confirmApplicationReviewButton"
      class="reject-button hidden"
    >
      Confirm Decision
    </button>

    <button
      type="button"
      id="cancelApplicationReviewButton"
      class="secondary-button hidden"
    >
      Cancel
    </button>
  </div>
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

  bindApplicationReviewControls(
    application
  );
}

function bindApplicationReviewControls(
  application
) {
  if (
    application.application_status !==
    "submitted"
  ) {
    return;
  }

  const previewButton =
    document.getElementById(
      "openAdminCustomerPreviewButton"
    );

    const approveButton =
    document.getElementById(
      "approveApplicationButton"
    );

  const requestChangesButton =
    document.getElementById(
      "requestChangesApplicationButton"
    );

  const rejectButton =
    document.getElementById(
      "rejectApplicationButton"
    );

  const confirmReviewButton =
    document.getElementById(
      "confirmApplicationReviewButton"
    );

  const cancelReviewButton =
    document.getElementById(
      "cancelApplicationReviewButton"
    );

  const reviewReasonGroup =
    document.getElementById(
      "applicationReviewReasonGroup"
    );

  const reviewReasonLabel =
    document.getElementById(
      "applicationReviewReasonLabel"
    );

  const reviewReasonInput =
    document.getElementById(
      "applicationReviewReason"
    );

  const reviewReasonHint =
    document.getElementById(
      "applicationReviewReasonHint"
    );

  let pendingDecision = "";

  previewButton?.addEventListener(
    "click",
    () => {
      const applicationId =
        Number(
          application.application_id ||
          0
        );

      if (applicationId <= 0) {
        setApplicationReviewMessage(
          "Invalid restaurant application."
        );

        return;
      }

      const previewUrl =
        "/FoodConnect/frontend/html/restaurant.html" +
        `?preview=admin&application_id=${encodeURIComponent(
          applicationId
        )}`;

      const previewWindow =
  window.open(
    previewUrl,
    "_blank"
  );

if (!previewWindow) {
  setApplicationReviewMessage(
    "The preview window was blocked. Allow pop-ups for FoodConnect and try again."
  );

  return;
}

previewWindow.opener = null;

setApplicationReviewMessage("");
    }
  );

  approveButton?.addEventListener(
    "click",
    async () => {
      const confirmed =
        window.confirm(
          `Approve ${application.restaurant_name}? This will create its restaurant account.`
        );

      if (!confirmed) {
        return;
      }

      await reviewPartnerApplication({
        applicationId:
          application.application_id,

        decision:
          "approve"
      });
    }
  );

  requestChangesButton
    ?.addEventListener(
      "click",
      () => {
        pendingDecision =
          "request_changes";

        showReviewReasonForm({
          title:
            "Requested changes",

          placeholder:
            "Explain what the owner must update before resubmitting.",

          confirmText:
            "Confirm Request Changes",
          confirmClass:
          "request-changes-button"
        });
      }
    );

  rejectButton?.addEventListener(
    "click",
    () => {
      pendingDecision =
        "reject";

      showReviewReasonForm({
        title:
          "Permanent rejection reason",

        placeholder:
          "Explain why this application is being permanently rejected.",

        confirmText:
          "Confirm Permanent Rejection",

        confirmClass:
          "reject-button"
      });
    }
  );

  cancelReviewButton
    ?.addEventListener(
      "click",
      resetReviewDecision
    );

  confirmReviewButton
    ?.addEventListener(
      "click",
      async () => {
        const reason =
          reviewReasonInput
            ?.value
            .trim() || "";

        if (
          ![
            "request_changes",
            "reject"
          ].includes(
            pendingDecision
          )
        ) {
          setApplicationReviewMessage(
            "Select a review decision first."
          );

          return;
        }

        if (reason.length < 10) {
          setApplicationReviewMessage(
            "Enter a clear review reason with at least 10 characters."
          );

          reviewReasonInput?.focus();
          return;
        }

        const confirmationMessage =
          pendingDecision ===
          "request_changes"
            ? `Request changes from ${application.restaurant_name}?`
            : `Permanently reject ${application.restaurant_name}'s application? The owner will no longer be able to edit or resubmit it.`;

        const confirmed =
          window.confirm(
            confirmationMessage
          );

        if (!confirmed) {
          return;
        }

        await reviewPartnerApplication({
          applicationId:
            application.application_id,

          decision:
            pendingDecision,

          rejectionReason:
            reason
        });
      }
    );

  function showReviewReasonForm({
    title,
    placeholder,
    confirmText,
    confirmClass
  }) {
    reviewReasonGroup
      ?.classList.remove(
        "hidden"
      );

    approveButton?.classList.add(
      "hidden"
    );

    requestChangesButton
      ?.classList.add(
        "hidden"
      );

    rejectButton?.classList.add(
      "hidden"
    );

    confirmReviewButton
      ?.classList.remove(
        "hidden"
      );

    cancelReviewButton
      ?.classList.remove(
        "hidden"
      );

    if (reviewReasonLabel) {
      reviewReasonLabel.textContent =
        title;
    }

    if (reviewReasonInput) {
      reviewReasonInput.value = "";

      reviewReasonInput.placeholder =
        placeholder;
    }

    if (reviewReasonHint) {
      reviewReasonHint.textContent =
        "Use at least 10 characters.";
    }

    if (confirmReviewButton) {
      confirmReviewButton.textContent =
        confirmText;

      confirmReviewButton.className =
        `${confirmClass}`;
    }

    setApplicationReviewMessage("");

    reviewReasonInput?.focus();
  }

  function resetReviewDecision() {
    pendingDecision = "";

    reviewReasonGroup?.classList.add(
      "hidden"
    );

    approveButton?.classList.remove(
      "hidden"
    );

    requestChangesButton
      ?.classList.remove(
        "hidden"
      );

    rejectButton?.classList.remove(
      "hidden"
    );

    confirmReviewButton
      ?.classList.add(
        "hidden"
      );

    cancelReviewButton
      ?.classList.add(
        "hidden"
      );

    if (reviewReasonInput) {
      reviewReasonInput.value = "";
    }

    setApplicationReviewMessage("");
  }
}
async function reviewPartnerApplication({
  applicationId,
  decision,
  rejectionReason = ""
}) {
 const approveButton =
    document.getElementById(
      "approveApplicationButton"
    );

const requestChangesButton =
    document.getElementById(
      "requestChangesApplicationButton"
    );

const rejectButton =
    document.getElementById(
      "rejectApplicationButton"
    );

const confirmReviewButton =
    document.getElementById(
      "confirmApplicationReviewButton"
    );

const cancelReviewButton =
    document.getElementById(
      "cancelApplicationReviewButton"
    );

    const reviewButtons = [
    approveButton,
    requestChangesButton,
    rejectButton,
    confirmReviewButton,
    cancelReviewButton
  ];

  reviewButtons.forEach(
    (button) => {
      if (button) {
        button.disabled = true;
      }
    }
  );

   let loadingMessage =
    "Reviewing restaurant application...";

  if (decision === "approve") {
    loadingMessage =
      "Approving restaurant application...";
  } else if (
    decision ===
    "request_changes"
  ) {
    loadingMessage =
      "Sending requested changes...";
  } else if (
    decision === "reject"
  ) {
    loadingMessage =
      "Permanently rejecting restaurant application...";
  }

  setApplicationReviewMessage(
    loadingMessage,
    "loading"
  );

  try {
    const response = await fetch(
      `${API_BASE}/review_partner_application.php`,
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
          application_id:
            Number(applicationId),

          decision,

          rejection_reason:
            rejectionReason
        })
      }
    );

    const data =
      await readJson(response);

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      closeDetailsModal();
      showAdminAccess();
      return;
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to review the application."
      );
    }

    setApplicationReviewMessage(
      data.message,
      "success"
    );

    showDashboardMessage(
      data.message,
      "success"
    );

    window.setTimeout(
      async () => {
        closeDetailsModal();

        await loadApplications();
      },
      700
    );
  } catch (error) {
    console.error(
      "Application review failed:",
      error
    );

    setApplicationReviewMessage(
      error.message ||
      "Unable to review the application."
    );

    reviewButtons.forEach(
      (button) => {
        if (button) {
          button.disabled = false;
        }
      }
    );
  }
}

function setApplicationReviewMessage(
  message = "",
  type = "error"
) {
  const messageElement =
    document.getElementById(
      "applicationReviewMessage"
    );

  if (!messageElement) {
    return;
  }

  messageElement.textContent =
    message;

  messageElement.classList.remove(
    "success",
    "error",
    "loading"
  );

  if (message) {
    messageElement.classList.add(
      type
    );
  }
}

function showDashboardMessage(
  message,
  type = "success"
) {
  const dashboardMessage =
    document.getElementById(
      "dashboardMessage"
    );

  if (!dashboardMessage) {
    return;
  }

  dashboardMessage.textContent =
    message;

  dashboardMessage.className =
    `dashboard-message ${type}`;

  window.setTimeout(
    () => {
      dashboardMessage.classList.add(
        "hidden"
      );
    },
    4000
  );
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
  "needsChangesApplicationsCount",
  counts.needs_changes || 0
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
  elementOrId,
  value
) {
  const element =
    typeof elementOrId ===
    "string"
      ? document.getElementById(
          elementOrId
        )
      : elementOrId;

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
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
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