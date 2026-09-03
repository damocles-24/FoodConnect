"use strict";

const API_BASE =
  "/api";

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

const setupFirstName =
  document.getElementById(
    "setupFirstName"
  );

const setupMiddleName =
  document.getElementById(
    "setupMiddleName"
  );

const setupLastName =
  document.getElementById(
    "setupLastName"
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

const dashboardRestaurantTotal =
  document.getElementById("dashboardRestaurantTotal");
const dashboardOpenRestaurants =
  document.getElementById("dashboardOpenRestaurants");
const dashboardOwnerCount =
  document.getElementById("dashboardOwnerCount");
const dashboardStaffCount =
  document.getElementById("dashboardStaffCount");
const dashboardClosedRestaurants =
  document.getElementById("dashboardClosedRestaurants");

const dashboardQuickActions =
  document.querySelectorAll(
    ".dashboard-quick-action"
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
   PARTNER REQUEST ELEMENTS
========================= */

const refreshPartnerRequestsButton =
  document.getElementById(
    "refreshPartnerRequestsButton"
  );

  const partnerRequestSearchInput =
  document.getElementById(
    "partnerRequestSearchInput"
  );

  const partnerRequestStatusFilter =
  document.getElementById(
    "partnerRequestStatusFilter"
  );

const searchPartnerRequestsButton =
  document.getElementById(
    "searchPartnerRequestsButton"
  );

const clearPartnerRequestSearchButton =
  document.getElementById(
    "clearPartnerRequestSearchButton"
  );

const partnerRequestsLoading =
  document.getElementById(
    "partnerRequestsLoading"
  );

const partnerRequestsMessage =
  document.getElementById(
    "partnerRequestsMessage"
  );

const partnerRequestsEmpty =
  document.getElementById(
    "partnerRequestsEmpty"
  );

const partnerRequestsTableWrapper =
  document.getElementById(
    "partnerRequestsTableWrapper"
  );

const partnerRequestsTableBody =
  document.getElementById(
    "partnerRequestsTableBody"
  );

const pendingPartnerRequestsCount =
  document.getElementById(
    "pendingPartnerRequestsCount"
  );

const approvedPartnerRequestsCount =
  document.getElementById(
    "approvedPartnerRequestsCount"
  );

const rejectedPartnerRequestsCount =
  document.getElementById(
    "rejectedPartnerRequestsCount"
  );

  const partnerRequestResultCount =
  document.getElementById(
    "partnerRequestResultCount"
  );

const partnerRequestPagination =
  document.getElementById(
    "partnerRequestPagination"
  );

const partnerRequestPreviousButton =
  document.getElementById(
    "partnerRequestPreviousButton"
  );

const partnerRequestNextButton =
  document.getElementById(
    "partnerRequestNextButton"
  );

const partnerRequestPageInfo =
  document.getElementById(
    "partnerRequestPageInfo"
  );

const partnerRequestRangeInfo =
  document.getElementById(
    "partnerRequestRangeInfo"
  );

const totalPartnerRequestsCount =

  document.getElementById(
    "totalPartnerRequestsCount"
  );

const pendingPartnerRequestsBadge =
  document.getElementById(
    "pendingPartnerRequestsBadge"
  );

let loadedPartnerRequests = [];

let filteredPartnerRequests = [];

let currentPartnerRequestPage = 1;

const partnerRequestsPerPage = 10;

const partnerRequestModal =
  document.getElementById(
    "partnerRequestModal"
  );

const partnerRequestModalContent =
  document.getElementById(
    "partnerRequestModalContent"
  );

const closePartnerRequestModalButton =
  document.getElementById(
    "closePartnerRequestModal"
  );

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
   OWNER PASSWORD RESET ELEMENTS
========================= */

const pendingOwnerPasswordResetsBadge =
  document.getElementById(
    "pendingOwnerPasswordResetsBadge"
  );

const refreshOwnerPasswordResetsButton =
  document.getElementById(
    "refreshOwnerPasswordResetsButton"
  );

const ownerPasswordResetSearchInput =
  document.getElementById(
    "ownerPasswordResetSearchInput"
  );

const ownerPasswordResetStatusFilter =
  document.getElementById(
    "ownerPasswordResetStatusFilter"
  );

const clearOwnerPasswordResetFiltersButton =
  document.getElementById(
    "clearOwnerPasswordResetFiltersButton"
  );

const ownerPasswordResetsMessage =
  document.getElementById(
    "ownerPasswordResetsMessage"
  );

const ownerPasswordResetsLoading =
  document.getElementById(
    "ownerPasswordResetsLoading"
  );

const ownerPasswordResetsEmpty =
  document.getElementById(
    "ownerPasswordResetsEmpty"
  );

const ownerPasswordResetsTableWrapper =
  document.getElementById(
    "ownerPasswordResetsTableWrapper"
  );

const ownerPasswordResetsTableBody =
  document.getElementById(
    "ownerPasswordResetsTableBody"
  );

const pendingOwnerPasswordResetsCount =
  document.getElementById(
    "pendingOwnerPasswordResetsCount"
  );

const approvedOwnerPasswordResetsCount =
  document.getElementById(
    "approvedOwnerPasswordResetsCount"
  );

const rejectedOwnerPasswordResetsCount =
  document.getElementById(
    "rejectedOwnerPasswordResetsCount"
  );

const totalOwnerPasswordResetsCount =
  document.getElementById(
    "totalOwnerPasswordResetsCount"
  );

const ownerTemporaryPasswordModal =
  document.getElementById(
    "ownerTemporaryPasswordModal"
  );

const closeOwnerTemporaryPasswordModalButton =
  document.getElementById(
    "closeOwnerTemporaryPasswordModal"
  );

const ownerTemporaryPasswordSummary =
  document.getElementById(
    "ownerTemporaryPasswordSummary"
  );

let loadedOwnerPasswordResetRequests = [];

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
let currentAdminId = 0;

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
/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeAdmin
);

async function loadAdminDashboardSummary() {
  try {
    const response = await fetch(`${API_BASE}/get_admin_dashboard_summary.php`, {
      credentials: "include",
      headers: { "Accept": "application/json" }
    });

    const data = await readJson(response);
    const summary = data.summary || {};

    setText("submittedCount", summary.submitted_applications || 0);
    setText("approvedCount", summary.approved_restaurants || 0);
    setText(dashboardRestaurantTotal, summary.total_restaurants || 0);
    setText(dashboardOpenRestaurants, summary.open_restaurants || 0);
    setText(dashboardClosedRestaurants, summary.closed_restaurants || 0);
    setText(dashboardOwnerCount, summary.restaurant_owners || 0);
    setText(dashboardStaffCount, summary.restaurant_staff || 0);
  } catch (error) {
    console.error("Dashboard summary error:", error);
  }
}

async function loadDashboardPartnerRequestSummary() {
  try {
    const params = new URLSearchParams({
      status: "all"
    });

    const response = await fetch(
      `${API_BASE}/get_partner_invitation_requests.php?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      }
    );

    const data = await readJson(response);

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return;
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to load partner request summary."
      );
    }

    updatePartnerRequestSummary(
      data.summary || {}
    );
  } catch (error) {
    console.error(
      "Dashboard partner request summary error:",
      error
    );
  }
}

function updateDashboardAttentionVisibility(
  itemId,
  count
) {
  const item =
    document.getElementById(
      itemId
    );

  if (item) {
    item.classList.toggle(
      "hidden",
      Number(count || 0) <= 0
    );
  }

  const attentionPanel =
    document.getElementById(
      "dashboardAttentionPanel"
    );

  const dashboardMainGrid =
    document.querySelector(
      ".dashboard-main-grid"
    );

  if (!attentionPanel) {
    return;
  }

  const hasVisibleAttention =
    Array.from(
      attentionPanel.querySelectorAll(
        ".dashboard-attention-item"
      )
    ).some(
      (attentionItem) =>
        !attentionItem.classList.contains(
          "hidden"
        )
    );

  attentionPanel.classList.toggle(
    "hidden",
    !hasVisibleAttention
  );

  dashboardMainGrid?.classList.toggle(
    "attention-empty",
    !hasVisibleAttention
  );
}

async function initializeAdmin() {
  bindEvents();

  const adminSession =
    await checkAdminSession();

  if (adminSession.logged_in) {
    showDashboard(
      adminSession.user
    );

    await loadAdminDashboardSummary();
    await loadDashboardPartnerRequestSummary();
    await loadApplications();
    await loadOwnerPasswordResetRequests();
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

  partnerRequestsTableBody
  ?.addEventListener(
    "click",
    handlePartnerRequestTableClick
  );

  partnerRequestModalContent
  ?.addEventListener(
    "click",
    handlePartnerRequestModalClick
  );

closePartnerRequestModalButton
  ?.addEventListener(
    "click",
    closePartnerRequestModal
  );

partnerRequestModal
  ?.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        partnerRequestModal
      ) {
        closePartnerRequestModal();
      }
    }
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

  dashboardQuickActions.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const targetSection =
            button.dataset.dashboardTarget;

          if (!targetSection) {
            return;
          }

          const matchingNavItem =
            Array.from(navItems).find(
              (item) =>
                item.dataset.section ===
                targetSection
            );

          if (matchingNavItem) {
            openDashboardSection(
              matchingNavItem
            );
          }
        }
      );
    }
  );

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

    refreshPartnerRequestsButton
  ?.addEventListener(
    "click",
    loadPartnerRequests
  );

 searchPartnerRequestsButton
  ?.addEventListener(
    "click",
    applyPartnerRequestFilters
  );

partnerRequestSearchInput
  ?.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        applyPartnerRequestFilters();
      }
    }
  );

  partnerRequestStatusFilter
  ?.addEventListener(
    "change",
    applyPartnerRequestFilters
  );

partnerRequestSearchInput
  ?.addEventListener(
    "input",
    () => {
      if (
        !partnerRequestSearchInput.value
          .trim()
      ) {
        applyPartnerRequestFilters();
      }
    }
  );

clearPartnerRequestSearchButton
  ?.addEventListener(
    "click",
    () => {
      if (partnerRequestSearchInput) {
        partnerRequestSearchInput.value =
          "";
      }

      if (partnerRequestStatusFilter) {
        partnerRequestStatusFilter.value =
          "all";
      }

      applyPartnerRequestFilters();

      partnerRequestSearchInput?.focus();
    }
  );

  partnerRequestPreviousButton
  ?.addEventListener(
    "click",
    () => {
      if (
        currentPartnerRequestPage <= 1
      ) {
        return;
      }

      currentPartnerRequestPage -= 1;

      renderPartnerRequestPage();
    }
  );

partnerRequestNextButton
  ?.addEventListener(
    "click",
    () => {
      const totalPages =
        getPartnerRequestTotalPages();

      if (
        currentPartnerRequestPage >=
        totalPages
      ) {
        return;
      }

      currentPartnerRequestPage += 1;

      renderPartnerRequestPage();
    }
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

      refreshOwnerPasswordResetsButton
    ?.addEventListener(
      "click",
      loadOwnerPasswordResetRequests
    );

  ownerPasswordResetSearchInput
    ?.addEventListener(
      "input",
      renderOwnerPasswordResetRequests
    );

  ownerPasswordResetSearchInput
    ?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          renderOwnerPasswordResetRequests();
        }
      }
    );

  ownerPasswordResetStatusFilter
    ?.addEventListener(
      "change",
      renderOwnerPasswordResetRequests
    );

  clearOwnerPasswordResetFiltersButton
    ?.addEventListener(
      "click",
      () => {
        if (ownerPasswordResetSearchInput) {
          ownerPasswordResetSearchInput.value =
            "";
        }

        if (ownerPasswordResetStatusFilter) {
          ownerPasswordResetStatusFilter.value =
            "all";
        }

        renderOwnerPasswordResetRequests();
      }
    );

  ownerPasswordResetsTableBody
    ?.addEventListener(
      "click",
      handleOwnerPasswordResetAction
    );

  closeOwnerTemporaryPasswordModalButton
    ?.addEventListener(
      "click",
      closeOwnerTemporaryPasswordModal
    );

  ownerTemporaryPasswordModal
    ?.addEventListener(
      "click",
      (event) => {
        if (event.target === ownerTemporaryPasswordModal) {
          closeOwnerTemporaryPasswordModal();
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
      closePartnerRequestModal();

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
        "Unable to check the administrator setup right now. Please try again."
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

  const firstName =
    setupFirstName?.value.trim() ||
    "";

  const middleName =
    setupMiddleName?.value.trim() ||
    "";

  const lastName =
    setupLastName?.value.trim() ||
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
    !firstName ||
    !lastName ||
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

  if (!window.FoodConnectPhone.isValid(contactNumber)) {
    setAdminSetupMessage(
      "Enter a valid Philippine mobile number after +63, starting with 9."
    );
    setupContactNumber?.focus();
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
          first_name:
            firstName,

          middle_name:
            middleName,

          last_name:
            lastName,

          email,

          contact_number:
            window.FoodConnectPhone.normalize(contactNumber),

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
        "Unable to create the administrator account. Please try again."
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

    await loadAdminDashboardSummary();
    await loadDashboardPartnerRequestSummary();
    await loadApplications();
    await loadOwnerPasswordResetRequests();
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

  setupFirstName?.focus();
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
      formatUserName(user);
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
    "overviewSection"
  ) {
    loadAdminDashboardSummary();
    loadDashboardPartnerRequestSummary();
    loadApplications();
    loadOwnerPasswordResetRequests();
  }

  if (
  sectionId ===
  "partnerRequestsSection"
) {
  loadPartnerRequests();
}

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
    "ownerPasswordResetsSection"
  ) {
    loadOwnerPasswordResetRequests();
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
   PARTNER REQUESTS
========================= */

async function loadPartnerRequests() {
  partnerRequestsLoading
    ?.classList.remove(
      "hidden"
    );

  partnerRequestsEmpty
    ?.classList.add(
      "hidden"
    );

  partnerRequestsTableWrapper
    ?.classList.add(
      "hidden"
    );

    partnerRequestPagination
  ?.classList.add(
    "hidden"
  );

  if (partnerRequestsMessage) {
    partnerRequestsMessage.textContent =
      "";
  }

  try {
    const params =
      new URLSearchParams({
        status: "all"
      });

      if (partnerRequestResultCount) {
  partnerRequestResultCount.textContent =
    "Loading requests...";
}

    const response = await fetch(
      `${API_BASE}/get_partner_invitation_requests.php?${params.toString()}`,
      {
        method: "GET",

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
        "Unable to load partner requests."
      );
    }

    loadedPartnerRequests =
      Array.isArray(
        data.requests
      )
        ? data.requests
        : [];

    updatePartnerRequestSummary(
      data.summary || {}
    );

    applyPartnerRequestFilters();

  } catch (error) {
    console.error(
      "Load partner requests error:",
      error
    );

    if (partnerRequestResultCount) {
  partnerRequestResultCount.textContent =
    "Unable to load partner requests right now. Please try again.";
}

    loadedPartnerRequests = [];

filteredPartnerRequests = [];

currentPartnerRequestPage = 1;

partnerRequestsTableWrapper
  ?.classList.add(
    "hidden"
  );

partnerRequestPagination
  ?.classList.add(
    "hidden"
  );

    if (partnerRequestsEmpty) {
      partnerRequestsEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>
          Unable to load partner requests
        </h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Please try again."
          )}
        </p>
      `;

      partnerRequestsEmpty.classList.remove(
        "hidden"
      );
    }
  } finally {
    partnerRequestsLoading
      ?.classList.add(
        "hidden"
      );
  }
}

/* =========================
   PARTNER REQUEST FILTERS
========================= */
function applyPartnerRequestFilters() {
  const searchTerm =
    partnerRequestSearchInput
      ?.value
      .trim()
      .toLowerCase() || "";

  const selectedStatus =
    partnerRequestStatusFilter
      ?.value
      .trim()
      .toLowerCase() || "all";

  filteredPartnerRequests =
    loadedPartnerRequests.filter(
      (request) => {
        const restaurantName =
          String(
            request.intended_restaurant ||
            ""
          ).toLowerCase();

        const ownerName =
          String(
            request.full_name || ""
          ).toLowerCase();

        const email =
          String(
            request.email || ""
          ).toLowerCase();

        const requestStatus =
          String(
            request.request_status ||
            "pending"
          ).toLowerCase();

        const matchesSearch =
          !searchTerm ||
          restaurantName.includes(
            searchTerm
          ) ||
          ownerName.includes(
            searchTerm
          ) ||
          email.includes(
            searchTerm
          );

        const matchesStatus =
          selectedStatus === "all" ||
          requestStatus ===
            selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  const filtersApplied =
    Boolean(searchTerm) ||
    selectedStatus !== "all";

  currentPartnerRequestPage = 1;

  updatePartnerRequestResultCount({
    visibleCount:
      filteredPartnerRequests.length,

    totalCount:
      loadedPartnerRequests.length,

    filtersApplied
  });

  renderPartnerRequestPage();
}

function updatePartnerRequestResultCount({
  visibleCount = 0,
  totalCount = 0,
  filtersApplied = false
}) {
  if (!partnerRequestResultCount) {
    return;
  }

  const visibleLabel =
    visibleCount === 1
      ? "request"
      : "requests";

  const totalLabel =
    totalCount === 1
      ? "request"
      : "requests";

  if (filtersApplied) {
    partnerRequestResultCount.textContent =
      `Showing ${visibleCount} of ${totalCount} ${totalLabel}`;

    return;
  }

  partnerRequestResultCount.textContent =
    `${totalCount} ${totalLabel}`;
}

/* =========================
   PARTNER REQUEST PAGINATION
========================= */

function getPartnerRequestTotalPages() {
  return Math.max(
    1,
    Math.ceil(
      filteredPartnerRequests.length /
      partnerRequestsPerPage
    )
  );
}

function renderPartnerRequestPage() {
  const totalPages =
    getPartnerRequestTotalPages();

  if (
    currentPartnerRequestPage >
    totalPages
  ) {
    currentPartnerRequestPage =
      totalPages;
  }

  if (
    currentPartnerRequestPage < 1
  ) {
    currentPartnerRequestPage = 1;
  }

  const startIndex =
    (
      currentPartnerRequestPage - 1
    ) *
    partnerRequestsPerPage;

  const endIndex =
    startIndex +
    partnerRequestsPerPage;

  const requestsForPage =
    filteredPartnerRequests.slice(
      startIndex,
      endIndex
    );

  const searchTerm =
    partnerRequestSearchInput
      ?.value
      .trim() || "";

  const selectedStatus =
    partnerRequestStatusFilter
      ?.value || "all";

  const filtersApplied =
    Boolean(searchTerm) ||
    selectedStatus !== "all";

  renderPartnerRequests(
    requestsForPage,
    filtersApplied
  );

  updatePartnerRequestPagination({
    totalItems:
      filteredPartnerRequests.length,

    startIndex,

    pageItemCount:
      requestsForPage.length,

    totalPages
  });
}

function updatePartnerRequestPagination({
  totalItems = 0,
  startIndex = 0,
  pageItemCount = 0,
  totalPages = 1
}) {
  if (!partnerRequestPagination) {
    return;
  }

  if (totalItems === 0) {
    partnerRequestPagination
      .classList.add(
        "hidden"
      );

    return;
  }

  partnerRequestPagination
    .classList.remove(
      "hidden"
    );

  if (partnerRequestPageInfo) {
    partnerRequestPageInfo.textContent =
      `Page ${currentPartnerRequestPage} of ${totalPages}`;
  }

  if (partnerRequestRangeInfo) {
    const rangeStart =
      startIndex + 1;

    const rangeEnd =
      startIndex +
      pageItemCount;

    partnerRequestRangeInfo.textContent =
      `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`;
  }

  if (partnerRequestPreviousButton) {
    partnerRequestPreviousButton.disabled =
      currentPartnerRequestPage <= 1;
  }

  if (partnerRequestNextButton) {
    partnerRequestNextButton.disabled =
      currentPartnerRequestPage >=
      totalPages;
  }
}

/* =========================
   PARTNER REQUEST SUMMARY
========================= */

function updatePartnerRequestSummary(
  summary
) {
  const pending =
    Number(
      summary.pending || 0
    );

  const approved =
    Number(
      summary.approved || 0
    );

  const rejected =
    Number(
      summary.rejected || 0
    );

  const total =
    Number(
      summary.all || 0
    );

  setText(
    pendingPartnerRequestsCount,
    pending
  );

  setText(
    approvedPartnerRequestsCount,
    approved
  );

  setText(
    rejectedPartnerRequestsCount,
    rejected
  );

  setText(
    totalPartnerRequestsCount,
    total
  );

  setText(
    "dashboardPendingPartnerRequestsAttention",
    pending
  );

  updateDashboardAttentionVisibility(
    "dashboardPartnerRequestsAttentionItem",
    pending
  );

  if (
    pendingPartnerRequestsBadge
  ) {
    pendingPartnerRequestsBadge.textContent =
      String(pending);

    pendingPartnerRequestsBadge
      .classList.toggle(
        "hidden",
        pending === 0
      );
  }
}

/* =========================
   PARTNER REQUEST TABLE
========================= */
function renderPartnerRequests(
  requests,
  filtersApplied = false
) {
  if (!partnerRequestsTableBody) {
    return;
  }

  partnerRequestsTableBody.innerHTML =
    "";

  if (
    !Array.isArray(requests) ||
    requests.length === 0
  ) {
    const searchTerm =
      partnerRequestSearchInput
        ?.value
        .trim() || "";

    const selectedStatus =
      partnerRequestStatusFilter
        ?.value || "all";

    let emptyTitle =
      "No partner requests yet";

    let emptyDescription =
      "New partnership applications will appear here.";

    if (
      searchTerm &&
      selectedStatus !== "all"
    ) {
      emptyTitle =
        "No matching partner requests";

      emptyDescription =
        `No ${selectedStatus} requests match “${searchTerm}”.`;
    } else if (searchTerm) {
      emptyTitle =
        "No matching partner requests";

      emptyDescription =
        `No requests match “${searchTerm}”.`;
    } else if (
      selectedStatus !== "all"
    ) {
      emptyTitle =
        `No ${selectedStatus} requests`;

      emptyDescription =
        `There are currently no partner requests with the ${selectedStatus} status.`;
    } else if (filtersApplied) {
      emptyTitle =
        "No matching partner requests";

      emptyDescription =
        "No requests match the selected filters.";
    }

        partnerRequestsTableWrapper
      ?.classList.add(
        "hidden"
      );

    partnerRequestPagination
      ?.classList.add(
        "hidden"
      );

    if (partnerRequestsEmpty) {

      partnerRequestsEmpty.innerHTML = `
        <div class="partner-request-empty-icon">
          <i class="fa-solid fa-inbox"></i>
        </div>

        <h3>
          ${escapeHtml(emptyTitle)}
        </h3>

        <p>
          ${escapeHtml(
            emptyDescription
          )}
        </p>
      `;

      partnerRequestsEmpty
        .classList.remove(
          "hidden"
        );
    }

    return;
  }

  partnerRequestsEmpty
    ?.classList.add(
      "hidden"
    );

  requests.forEach(
    (request) => {
      const row =
        document.createElement("tr");

      const status =
        String(
          request.request_status ||
          "pending"
        ).toLowerCase();

      row.innerHTML = `
        <td>
          <span class="table-primary">
            ${escapeHtml(
              request.intended_restaurant ||
              "Unnamed Restaurant"
            )}
          </span>

          <span class="table-secondary">
            ${escapeHtml(
              request.business_address ||
              "No business address provided"
            )}
          </span>
        </td>

        <td>
          <span class="table-primary">
            ${escapeHtml(
              request.full_name ||
              "Not provided"
            )}
          </span>

          <span class="table-secondary">
            ${escapeHtml(
              window.FoodConnectPhone.format(request.contact_number, "No contact number")
            )}
          </span>
        </td>

        <td>
          ${escapeHtml(
            request.email ||
            "Not provided"
          )}
        </td>

        <td>
          ${escapeHtml(
            formatDate(
              request.created_at
            )
          )}
        </td>

        <td>
          <span class="
            status-badge
            status-${escapeHtml(status)}
          ">
            ${escapeHtml(
              formatStatus(status)
            )}
          </span>
        </td>

        <td>
          <button
            type="button"
            class="
              view-button
              partner-request-view-button
            "
            data-request-id="${Number(
              request.request_id || 0
            )}"
          >
            View
          </button>
        </td>
      `;

      partnerRequestsTableBody
        .appendChild(row);
    }
  );

  partnerRequestsTableWrapper
    ?.classList.remove(
      "hidden"
    );
}

/* =========================
   PARTNER REQUEST MODAL
========================= */

function handlePartnerRequestTableClick(
  event
) {
  const viewButton =
    event.target.closest(
      ".partner-request-view-button"
    );

  if (!viewButton) {
    return;
  }

  const requestId =
    Number(
      viewButton.dataset.requestId || 0
    );

  if (!requestId) {
    return;
  }

  openPartnerRequestModal(
    requestId
  );
}

function openPartnerRequestModal(
  requestId
) {
  const request =
    loadedPartnerRequests.find(
      (item) =>
        Number(item.request_id) ===
        Number(requestId)
    );

  if (
    !request ||
    !partnerRequestModal ||
    !partnerRequestModalContent
  ) {
    return;
  }

  const status =
    String(
      request.request_status ||
      "pending"
    ).toLowerCase();

  let reviewDetailsHtml = "";

  if (
    status === "approved"
  ) {
    reviewDetailsHtml = `
      <div class="application-detail-row">
        <span>Reviewed by</span>

        <strong>
          ${escapeHtml(
            request.reviewer_name ||
            "Administrator"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Reviewed at</span>

        <strong>
          ${escapeHtml(
            request.reviewed_at
              ? formatDate(
                  request.reviewed_at
                )
              : "Not available"
          )}
        </strong>
      </div>
    `;
  }

  if (
    status === "rejected"
  ) {
    reviewDetailsHtml = `
      <div class="application-detail-row">
        <span>Reviewed by</span>

        <strong>
          ${escapeHtml(
            request.reviewer_name ||
            "Administrator"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Reviewed at</span>

        <strong>
          ${escapeHtml(
            request.reviewed_at
              ? formatDate(
                  request.reviewed_at
                )
              : "Not available"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Rejection reason</span>

        <strong>
          ${escapeHtml(
            request.rejection_reason ||
            "No reason was recorded."
          )}
        </strong>
      </div>
    `;
  }

  const actionButtonsHtml =
    status === "pending"
      ? `
        <div class="modal-actions">
          <button type="button" class="secondary-button partner-request-reject-button" data-request-id="${Number(request.request_id)}">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
          <button type="button" class="primary-button partner-request-approve-button" data-request-id="${Number(request.request_id)}">
            <i class="fa-solid fa-check"></i> Approve
          </button>
        </div>
      `
      : "";

  partnerRequestModalContent.innerHTML = `
    <div class="application-modal-header">
      <div>
        <span class="
          status-badge
          status-${escapeHtml(status)}
        ">
          ${escapeHtml(
            formatStatus(status)
          )}
        </span>

        <h2>
          ${escapeHtml(
            request.intended_restaurant ||
            "Partner Request"
          )}
        </h2>

        <p>
          Partner invitation request details
        </p>
      </div>
    </div>

    <div class="application-details-grid">

      <div class="application-detail-row">
        <span>Restaurant name</span>

        <strong>
          ${escapeHtml(
            request.intended_restaurant ||
            "Not provided"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Owner name</span>

        <strong>
          ${escapeHtml(
            request.full_name ||
            "Not provided"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Email address</span>

        <strong>
          ${escapeHtml(
            request.email ||
            "Not provided"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Contact number</span>

        <strong>
          ${escapeHtml(
            request.contact_number ||
            "Not provided"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Business address</span>

        <strong>
          ${escapeHtml(
            request.business_address ||
            "Not provided"
          )}
        </strong>
      </div>

      <div class="application-detail-row">
        <span>Submitted</span>

        <strong>
          ${escapeHtml(
            request.created_at
              ? formatDate(
                  request.created_at
                )
              : "Not available"
          )}
        </strong>
      </div>

      <div class="application-detail-row application-detail-full">
        <span>Applicant message</span>

        <strong>
          ${escapeHtml(
            request.message ||
            "No message was provided."
          )}
        </strong>
      </div>

      ${reviewDetailsHtml}

    </div>

      <p
  id="partnerRequestReviewMessage"
  class="form-message"
></p>

<div
  id="partnerRequestRejectionPanel"
  class="partner-request-rejection-panel hidden"
></div>

${actionButtonsHtml}
  `;

  partnerRequestModal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );
}

function closePartnerRequestModal() {
  const rejectionReasonInput =
    document.getElementById(
      "partnerRequestRejectionReason"
    );

  if (
    rejectionReasonInput &&
    rejectionReasonInput.value.trim()
  ) {
    rejectionReasonInput.value = "";
  }

  partnerRequestModal
    ?.classList.add(
      "hidden"
    );

  document.body.classList.remove(
    "modal-open"
  );

  if (partnerRequestModalContent) {
    partnerRequestModalContent.innerHTML =
      "";
  }
}

/* =========================
   PARTNER REQUEST ACTIONS
========================= */

async function handlePartnerRequestModalClick(event) {
  const approveButton = event.target.closest(".partner-request-approve-button");
  const rejectButton = event.target.closest(".partner-request-reject-button");
  const cancelRejectButton = event.target.closest(".partner-request-cancel-reject-button");
  const confirmRejectButton = event.target.closest(".partner-request-confirm-reject-button");
  const approvalDoneButton = event.target.closest(".partner-request-approval-done-button");

  if (approvalDoneButton) { closePartnerRequestModal(); return; }

  if (approveButton) {
    const requestId = Number(approveButton.dataset.requestId || 0);
    if (!requestId) return;
    if (!window.confirm("Approve this partner request and email the registration instructions?")) return;
    await reviewPartnerRequest({ requestId, decision: "approve", button: approveButton });
    return;
  }

  if (rejectButton) {
    const requestId = Number(rejectButton.dataset.requestId || 0);
    if (requestId) openPartnerRequestRejectionForm(requestId);
    return;
  }

  if (cancelRejectButton) { closePartnerRequestRejectionForm(); return; }

  if (confirmRejectButton) {
    const requestId = Number(confirmRejectButton.dataset.requestId || 0);
    const input = document.getElementById("partnerRequestRejectionReason");
    const rejectionReason = input?.value.trim() || "";
    if (rejectionReason.length < 10) {
      setPartnerRequestRejectionMessage("Enter a clear rejection reason with at least 10 characters.", "error");
      input?.focus();
      return;
    }
    if (!window.confirm("Reject this partner request and email the applicant?")) return;
    await reviewPartnerRequest({ requestId, decision: "reject", rejectionReason, button: confirmRejectButton });
  }
}

/* =========================
   PARTNER REQUEST
   REJECTION FORM
========================= */

function openPartnerRequestRejectionForm(
  requestId
) {
  const rejectionPanel =
    document.getElementById(
      "partnerRequestRejectionPanel"
    );

  const modalActions =
    partnerRequestModalContent
      ?.querySelector(
        ".modal-actions"
      );

  if (
    !rejectionPanel ||
    !requestId
  ) {
    return;
  }

  rejectionPanel.innerHTML = `
    <div class="partner-request-rejection-header">
      <div>
        <h3>
          Reject Partner Request
        </h3>

        <p>
          Explain why this request is being rejected.
          This reason will be included in the email
          sent to the applicant.
        </p>
      </div>
    </div>

    <div class="partner-request-rejection-group">
      <label
        for="partnerRequestRejectionReason"
      >
        Rejection reason
      </label>

      <textarea
        id="partnerRequestRejectionReason"
        rows="5"
        maxlength="1000"
        placeholder="Enter a clear rejection reason..."
      ></textarea>

      <div class="partner-request-rejection-help">
        <small>
          Minimum 10 characters
        </small>

        <small
          id="partnerRequestRejectionCount"
        >
          0 / 1000
        </small>
      </div>
    </div>

    <p
      id="partnerRequestRejectionMessage"
      class="partner-request-rejection-message"
    ></p>

    <div class="partner-request-rejection-actions">
      <button
        type="button"
        class="
          secondary-button
          partner-request-cancel-reject-button
        "
      >
        <i class="fa-solid fa-arrow-left"></i>

        Cancel
      </button>

      <button
        type="button"
        class="
          reject-button
          partner-request-confirm-reject-button
        "
        data-request-id="${Number(
          requestId
        )}"
        disabled
      >
        <i class="fa-solid fa-envelope-circle-xmark"></i>

        Reject & Send Email
      </button>
    </div>
  `;

  rejectionPanel.classList.remove(
    "hidden"
  );

  modalActions?.classList.add(
    "hidden"
  );

  setPartnerRequestReviewMessage(
    ""
  );

  const rejectionReasonInput =
    document.getElementById(
      "partnerRequestRejectionReason"
    );

  rejectionReasonInput
    ?.addEventListener(
      "input",
      handlePartnerRequestRejectionInput
    );

  rejectionReasonInput?.focus();
}

function closePartnerRequestRejectionForm() {
  const rejectionPanel =
    document.getElementById(
      "partnerRequestRejectionPanel"
    );

  const modalActions =
    partnerRequestModalContent
      ?.querySelector(
        ".modal-actions"
      );

  rejectionPanel?.classList.add(
    "hidden"
  );

  if (rejectionPanel) {
    rejectionPanel.innerHTML = "";
  }

  modalActions?.classList.remove(
    "hidden"
  );

  setPartnerRequestReviewMessage(
    ""
  );
}

function handlePartnerRequestRejectionInput(
  event
) {
  const textarea =
    event.currentTarget;

  const value =
    textarea.value || "";

  const cleanLength =
    value.trim().length;

  const countElement =
    document.getElementById(
      "partnerRequestRejectionCount"
    );

  const confirmButton =
    partnerRequestModalContent
      ?.querySelector(
        ".partner-request-confirm-reject-button"
      );

  if (countElement) {
    countElement.textContent =
      `${value.length} / 1000`;
  }

  if (confirmButton) {
    confirmButton.disabled =
      cleanLength < 10;
  }

  setPartnerRequestRejectionMessage(
    cleanLength > 0 &&
    cleanLength < 10
      ? "The rejection reason must contain at least 10 characters."
      : "",
    cleanLength > 0 &&
    cleanLength < 10
      ? "error"
      : ""
  );
}

function setPartnerRequestRejectionMessage(
  message,
  type = ""
) {
  const messageElement =
    document.getElementById(
      "partnerRequestRejectionMessage"
    );

  if (!messageElement) {
    return;
  }

  messageElement.textContent =
    message;

  messageElement.className =
    "partner-request-rejection-message";

  if (type) {
    messageElement.classList.add(
      type
    );
  }
}

function showPartnerRequestApprovalResult({ data, requestId }) {
  if (!partnerRequestModalContent) return;
  const request = loadedPartnerRequests.find((item) => Number(item.request_id) === Number(requestId)) || {};
  const assignedEmail = String(data.assigned_email || request.email || "");
  const restaurantName = String(data.intended_restaurant || request.intended_restaurant || "Restaurant");
  const emailSent = data.email_sent !== false;
  partnerRequestModalContent.innerHTML = `
    <div class="partner-request-success-panel">
      <div class="partner-request-success-icon"><i class="fa-solid fa-check"></i></div>
      <div class="partner-request-success-heading">
        <span>Partner Request Approved</span>
        <h2>Registration is now allowed</h2>
        <p>${escapeHtml(restaurantName)} may now create an owner account, verify the email, and continue to the restaurant setup wizard.</p>
      </div>
      <div class="partner-request-email-result ${emailSent ? "success" : "warning"}">
        <i class="${emailSent ? "fa-solid fa-envelope-circle-check" : "fa-solid fa-triangle-exclamation"}"></i>
        <div><strong>${emailSent ? "Registration instructions sent" : "Approved, but email delivery failed"}</strong>
        <p>${emailSent ? `Instructions were sent to ${escapeHtml(assignedEmail || "the applicant")}.` : "The request is approved. Ask the applicant to open the partner registration page."}</p></div>
      </div>
      <div class="partner-request-success-actions"><button type="button" class="primary-button partner-request-approval-done-button"><i class="fa-solid fa-check"></i> Done</button></div>
    </div>`;
}

async function reviewPartnerRequest({ requestId, decision, rejectionReason = "", button }) {
  const modalButtons = partnerRequestModalContent?.querySelectorAll(`.partner-request-approve-button, .partner-request-reject-button, .partner-request-cancel-reject-button, .partner-request-confirm-reject-button`) || [];
  modalButtons.forEach((actionButton) => { actionButton.disabled = true; });
  const originalButtonHtml = button?.innerHTML || "";
  if (button) button.innerHTML = decision === "approve" ? `<i class="fa-solid fa-spinner fa-spin"></i> Approving...` : `<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...`;
  setPartnerRequestReviewMessage(decision === "approve" ? "Approving partner request..." : "Rejecting partner request...", "loading");
  try {
    const payload = { request_id: requestId, decision };
    if (decision === "reject") payload.rejection_reason = rejectionReason;
    const response = await fetch(`${API_BASE}/review_partner_invitation_request.php`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
    const data = await readJson(response);
    if (response.status === 401 || response.status === 403) { closePartnerRequestModal(); showAdminAccess(); throw new Error("Administrator session expired."); }
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to review this partner request. Please try again.");
    await loadPartnerRequests();
    if (decision === "approve") { showPartnerRequestApprovalResult({ data, requestId }); return; }
    setPartnerRequestReviewMessage(data.message || "Partner request rejected successfully.", "success");
    window.setTimeout(() => closePartnerRequestModal(), 1200);
  } catch (error) {
    console.error("Partner request review error:", error);
    setPartnerRequestReviewMessage(error.message || "Unable to review this partner request. Please try again.", "error");
    modalButtons.forEach((actionButton) => { actionButton.disabled = false; });
    if (button) button.innerHTML = originalButtonHtml;
  }
}

function setPartnerRequestReviewMessage(
  message,
  type = ""
) {
  const messageElement =
    document.getElementById(
      "partnerRequestReviewMessage"
    );

  if (!messageElement) {
    return;
  }

  messageElement.textContent =
    message;

  messageElement.className =
    "form-message";

  if (type) {
    messageElement.classList.add(
      type
    );
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
              "Unable to update the restaurant status. Please try again.",
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
              "Unable to update restaurant access. Please try again.",
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
      "Unable to update the restaurant status. Please try again."
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
      "Unable to update restaurant access. Please try again."
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
   OWNER PASSWORD RESETS
========================= */

async function loadOwnerPasswordResetRequests() {
  ownerPasswordResetsLoading
    ?.classList.remove(
      "hidden"
    );

  ownerPasswordResetsEmpty
    ?.classList.add(
      "hidden"
    );

  ownerPasswordResetsTableWrapper
    ?.classList.add(
      "hidden"
    );

  setOwnerPasswordResetsMessage(
    "",
    ""
  );

  try {
    const response = await fetch(
      `${API_BASE}/get_owner_password_reset_requests.php`,
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
        "Unable to load owner password reset requests."
      );
    }

    loadedOwnerPasswordResetRequests =
      Array.isArray(data.requests)
        ? data.requests
        : [];

    updateOwnerPasswordResetSummary(
      data.summary || {}
    );

    renderOwnerPasswordResetRequests();
  } catch (error) {
    console.error(
      "Load owner password reset requests error:",
      error
    );

    ownerPasswordResetsTableWrapper
      ?.classList.add(
        "hidden"
      );

    ownerPasswordResetsEmpty
      ?.classList.remove(
        "hidden"
      );

    if (ownerPasswordResetsEmpty) {
      ownerPasswordResetsEmpty.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Unable to load password reset requests</h3>
        <p>${escapeHtml(
          error.message ||
          "Please try again."
        )}</p>
      `;
    }

    setOwnerPasswordResetsMessage(
      error.message ||
      "Unable to load password reset requests.",
      "error"
    );
  } finally {
    ownerPasswordResetsLoading
      ?.classList.add(
        "hidden"
      );
  }
}

function updateOwnerPasswordResetSummary(
  summary
) {
  const pending = Number(
    summary.pending_requests || 0
  );

  setText(
    pendingOwnerPasswordResetsCount,
    pending
  );

  setText(
    "dashboardPendingPasswordResetsAttention",
    pending
  );

  updateDashboardAttentionVisibility(
    "dashboardPasswordResetsAttentionItem",
    pending
  );

  setText(
    approvedOwnerPasswordResetsCount,
    Number(
      summary.approved_requests || 0
    )
  );

  setText(
    rejectedOwnerPasswordResetsCount,
    Number(
      summary.rejected_requests || 0
    )
  );

  setText(
    totalOwnerPasswordResetsCount,
    Number(
      summary.total_requests || 0
    )
  );

  if (pendingOwnerPasswordResetsBadge) {
    pendingOwnerPasswordResetsBadge.textContent =
      String(pending);

    pendingOwnerPasswordResetsBadge.classList.toggle(
      "hidden",
      pending <= 0
    );
  }
}

function getFilteredOwnerPasswordResetRequests() {
  const search =
    ownerPasswordResetSearchInput
      ?.value
      ?.trim()
      ?.toLowerCase() || "";

  const status =
    ownerPasswordResetStatusFilter
      ?.value || "all";

  return loadedOwnerPasswordResetRequests
    .filter((request) => {
      if (
        status !== "all" &&
        String(
          request.request_status || ""
        ).toLowerCase() !== status
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        request.owner_name,
        request.owner_email,
        request.owner_contact_number,
        request.actual_restaurant_name,
        request.submitted_restaurant_name,
        request.submitted_email,
        request.submitted_contact_number,
        request.reason,
        request.review_note,
        request.reviewer_name
      ]
        .map((value) =>
          String(value || "")
            .toLowerCase()
        )
        .join(" ");

      return haystack.includes(search);
    });
}

function renderOwnerPasswordResetRequests() {
  if (!ownerPasswordResetsTableBody) {
    return;
  }

  const requests =
    getFilteredOwnerPasswordResetRequests();

  ownerPasswordResetsTableBody.innerHTML =
    "";

  if (requests.length === 0) {
    ownerPasswordResetsEmpty
      ?.classList.remove(
        "hidden"
      );

    ownerPasswordResetsTableWrapper
      ?.classList.add(
        "hidden"
      );

    if (ownerPasswordResetsEmpty) {
      ownerPasswordResetsEmpty.innerHTML = `
        <i class="fa-solid fa-key"></i>
        <h3>No password reset requests found</h3>
        <p>Try another filter or wait for an owner recovery request.</p>
      `;
    }

    return;
  }

  ownerPasswordResetsEmpty
    ?.classList.add(
      "hidden"
    );

  ownerPasswordResetsTableWrapper
    ?.classList.remove(
      "hidden"
    );

  requests.forEach((request) => {
    const row =
      document.createElement("tr");

    const requestId = Number(
      request.request_id || 0
    );

    const status = String(
      request.request_status ||
      "pending"
    ).toLowerCase();

    const ownerName =
      String(
        request.owner_name ||
        "Unnamed Owner"
      );

    const actualRestaurantName =
      String(
        request.actual_restaurant_name ||
        request.submitted_restaurant_name ||
        "Restaurant not linked"
      );

    const submittedRestaurantName =
      String(
        request.submitted_restaurant_name ||
        "—"
      );

    const ownerContact =
      window.FoodConnectPhone?.format
        ? window.FoodConnectPhone.format(
            request.owner_contact_number,
            ""
          )
        : String(
            request.owner_contact_number ||
            ""
          );

    const submittedContact =
      window.FoodConnectPhone?.format
        ? window.FoodConnectPhone.format(
            request.submitted_contact_number,
            ""
          )
        : String(
            request.submitted_contact_number ||
            ""
          );

    const reviewedMarkup =
      status === "pending"
        ? `
          <span class="table-secondary">
            Not reviewed
          </span>
        `
        : `
          <span class="owner-reset-review-meta">
            <strong>${escapeHtml(
              request.reviewer_name ||
              "Administrator"
            )}</strong>
            <br>
            ${escapeHtml(
              formatDate(
                request.reviewed_at
              )
            )}
            ${
              request.review_note
                ? `<br>${escapeHtml(
                    request.review_note
                  )}`
                : ""
            }
          </span>
        `;

    const actionMarkup =
      status === "pending"
        ? `
          <div class="owner-reset-action-group">
            <button
              type="button"
              class="owner-reset-action-button approve"
              data-owner-reset-action="approve"
              data-request-id="${requestId}"
              data-owner-name="${escapeHtml(ownerName)}"
              data-restaurant-name="${escapeHtml(actualRestaurantName)}"
            >
              Approve
            </button>

            <button
              type="button"
              class="owner-reset-action-button reject"
              data-owner-reset-action="reject"
              data-request-id="${requestId}"
              data-owner-name="${escapeHtml(ownerName)}"
              data-restaurant-name="${escapeHtml(actualRestaurantName)}"
            >
              Reject
            </button>
          </div>
        `
        : `
          <span class="table-secondary">
            Completed
          </span>
        `;

    row.innerHTML = `
      <td data-label="Owner / Restaurant">
        <span class="owner-reset-owner-name">
          ${escapeHtml(ownerName)}
        </span>
        <span class="owner-reset-restaurant-name">
          ${escapeHtml(actualRestaurantName)}
        </span>
      </td>

      <td data-label="Submitted Details">
        <span class="owner-reset-submitted-detail">
          <strong>Restaurant:</strong>
          ${escapeHtml(submittedRestaurantName)}
        </span>
        <span class="owner-reset-submitted-detail">
          <strong>Email:</strong>
          ${escapeHtml(
            request.submitted_email ||
            "—"
          )}
        </span>
        <span class="owner-reset-submitted-detail">
          <strong>Mobile:</strong>
          ${escapeHtml(
            submittedContact || "—"
          )}
        </span>
        <span class="owner-reset-submitted-detail table-secondary">
          Registered: ${escapeHtml(
            request.owner_email || "—"
          )}${
            ownerContact
              ? ` • ${escapeHtml(ownerContact)}`
              : ""
          }
        </span>
      </td>

      <td data-label="Reason">
        <span class="owner-reset-reason">
          ${escapeHtml(
            request.reason || "—"
          )}
        </span>
      </td>

      <td data-label="Requested">
        ${escapeHtml(
          formatDate(
            request.created_at
          )
        )}
      </td>

      <td data-label="Status">
        <span class="owner-reset-status-badge ${escapeHtml(status)}">
          ${escapeHtml(status)}
        </span>
      </td>

      <td data-label="Reviewed">
        ${reviewedMarkup}
      </td>

      <td data-label="Action">
        ${actionMarkup}
      </td>
    `;

    ownerPasswordResetsTableBody
      .appendChild(row);
  });
}

async function handleOwnerPasswordResetAction(
  event
) {
  const button =
    event.target.closest(
      "[data-owner-reset-action]"
    );

  if (!button) {
    return;
  }

  const requestId = Number(
    button.dataset.requestId || 0
  );

  const action = String(
    button.dataset.ownerResetAction ||
    ""
  ).toLowerCase();

  const ownerName =
    button.dataset.ownerName ||
    "this owner";

  const restaurantName =
    button.dataset.restaurantName ||
    "this restaurant";

  if (!requestId || !["approve", "reject"].includes(action)) {
    return;
  }

  let reviewNote = "";

  if (action === "approve") {
    const confirmed = window.confirm(
      `Approve password recovery for ${ownerName} (${restaurantName})?\n\nFoodConnect will replace the current owner password with a temporary password, revoke trusted owner devices, and automatically email the temporary password to the registered owner email.`
    );

    if (!confirmed) {
      return;
    }
  } else {
    const rejectionReason = window.prompt(
      `Why are you rejecting the password recovery request for ${ownerName}?`,
      "Account details require further verification."
    );

    if (rejectionReason === null) {
      return;
    }

    reviewNote = rejectionReason.trim();

    if (reviewNote.length < 3) {
      setOwnerPasswordResetsMessage(
        "Enter a short reason before rejecting the request.",
        "error"
      );
      return;
    }
  }

  const row = button.closest("tr");
  const rowButtons =
    row?.querySelectorAll(
      ".owner-reset-action-button"
    ) || [];

  rowButtons.forEach((rowButton) => {
    rowButton.disabled = true;
  });

  const originalText =
    button.textContent;

  button.textContent =
    action === "approve"
      ? "Approving..."
      : "Rejecting...";

  setOwnerPasswordResetsMessage(
    "",
    ""
  );

  try {
    const response = await fetch(
      `${API_BASE}/review_owner_password_reset_request.php`,
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
          request_id: requestId,
          action,
          review_note: reviewNote
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
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to review this password recovery request."
      );
    }

    if (action === "approve") {
      if (!data.email_sent) {
        throw new Error(
          "The password reset was approved, but email delivery was not confirmed."
        );
      }

      showOwnerTemporaryPasswordModal(
        data
      );
    }

    await loadOwnerPasswordResetRequests();

    setOwnerPasswordResetsMessage(
      data.message ||
      `Password recovery request ${action === "approve" ? "approved" : "rejected"}.`,
      "success"
    );
  } catch (error) {
    console.error(
      "Owner password reset review error:",
      error
    );

    setOwnerPasswordResetsMessage(
      error.message ||
      "Unable to review this password recovery request.",
      "error"
    );
  } finally {
    rowButtons.forEach((rowButton) => {
      rowButton.disabled = false;
    });

    button.textContent = originalText;
  }
}

function showOwnerTemporaryPasswordModal(
  data
) {
  if (!ownerTemporaryPasswordModal) {
    return;
  }

  if (ownerTemporaryPasswordSummary) {
    const owner =
      data.owner_name ||
      "Restaurant owner";

    const restaurant =
      data.restaurant_name ||
      "the restaurant";

    const email =
      data.owner_email ||
      "the registered owner email";

    ownerTemporaryPasswordSummary.textContent =
      `${owner} (${restaurant}) was issued a temporary password. FoodConnect sent it automatically to ${email}.`;
  }

  ownerTemporaryPasswordModal.classList.remove(
    "hidden"
  );
}

function closeOwnerTemporaryPasswordModal() {
  ownerTemporaryPasswordModal?.classList.add(
    "hidden"
  );

  if (ownerTemporaryPasswordSummary) {
    ownerTemporaryPasswordSummary.textContent =
      "The temporary password was sent automatically to the owner's registered email.";
  }
}

function setOwnerPasswordResetsMessage(
  message,
  type = ""
) {
  if (!ownerPasswordResetsMessage) {
    return;
  }

  ownerPasswordResetsMessage.textContent =
    message;

  ownerPasswordResetsMessage.className =
    "owner-password-resets-message";

  if (type) {
    ownerPasswordResetsMessage.classList.add(
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

   const status =
  platformUserStatusFilter
    ?.value || "all";

const params =
  new URLSearchParams();

if (search) {
  params.set("search", search);
}

if (status && status !== "all") {
  params.set("status", status);
}

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
        "Unable to load user accounts right now. Please try again."
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
      window.FoodConnectPhone.format(
        user.contact_number,
        ""
      );

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
  formatUserName(user)
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
 formatUserName(user)
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
            `${actionWord.charAt(0).toUpperCase() + actionWord.slice(1)} ${userName}?`
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
            "Unable to update this account. Please try again.",
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
      "Unable to update this account. Please try again."
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
        "Unable to load activity logs right now. Please try again."
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
      "owner_verification" ||
      actionType ===
      "owner_password_reset"
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
        "Unable to load applications right now. Please try again."
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

    <div class="application-preview-card">
      <div class="application-preview-card-copy">
        <span class="application-preview-label">Verification documents</span>
        <h3>Restaurant verification files</h3>
        <p>Open each submitted file before approving the restaurant.</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
          ${(application.verification_documents || []).length
            ? (application.verification_documents || []).map(doc => `<a class="application-preview-button" target="_blank" rel="noopener" href="${escapeHtml(doc.view_url)}">${escapeHtml(({bir_2303:'BIR Form 2303',restaurant_menu:'Restaurant Menu',applicant_id:'Applicant ID'})[doc.document_type] || doc.document_type)}</a>`).join("")
            : '<span class="table-secondary">No verification documents uploaded.</span>'}
        </div>
      </div>
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
        "/frontend/html/restaurant.html" +
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
        "Unable to review this application. Please try again."
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
      "Unable to review this application. Please try again."
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
    "dashboardPendingApplicationsAttention",
    counts.submitted || 0
  );

  updateDashboardAttentionVisibility(
    "dashboardApplicationsAttentionItem",
    counts.submitted || 0
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
function formatUserName(user) {
  return [
    user.first_name,
    user.middle_name,
    user.last_name
  ]
  .filter(Boolean)
  .join(" ")
  || user.display_name
  || "Unnamed User";
}

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
      "Something went wrong. Please try again."
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

// Password visibility toggle for normal password fields only.
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const icon = button.querySelector("i");

    if (!input || !icon) return;

    const show = input.type === "password";
    input.type = show ? "text" : "password";
    icon.className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
});
