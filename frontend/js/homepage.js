function goToCart() {
  localStorage.setItem(
    "lastPage",
    window.location.href
  );

  window.location.href = "cart.html";
}

window.API =
  window.API ||
  "/FoodConnect/api";

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const loginModal =
      document.getElementById("loginModal");

    const closeLoginModalBtn =
      loginModal?.querySelector(".close-btn");

    const accountWrapper =
      document.querySelector(".account-wrapper");

    const accountBtn =
      document.getElementById("accountBtn");

    const accountDropdown =
      document.getElementById("accountDropdown");

    const accountName =
      document.getElementById("accountName");

    const welcomeUser =
      document.getElementById("welcomeUser");

    const loginBtn =
      document.getElementById("loginBtn");

    const signupBtn =
      document.getElementById("signupBtn");

    const goProfileBtn =
      document.getElementById("goProfile");

    const logoutBtn =
      document.getElementById("logoutBtn");

    const staffTrigger =
      document.getElementById(
        "staffAccessTrigger"
      );

    const staffModal =
      document.getElementById(
        "staffAccessModal"
      );

    const closeStaffModalBtn =
      document.getElementById(
        "closeStaffAccess"
      );

    const staffRestaurantId =
      document.getElementById(
        "staffRestaurantId"
      );

    const staffCodeBox =
      document.getElementById(
        "staffCodeBox"
      );

    const staffLoginBox =
      document.getElementById(
        "staffLoginBox"
      );

    const staffAccessCode =
      document.getElementById(
        "staffAccessCode"
      );

    const verifyStaffCodeBtn =
      document.getElementById(
        "verifyStaffCodeBtn"
      );

    const staffEmail =
      document.getElementById(
        "staffEmail"
      );

    const staffPassword =
      document.getElementById(
        "staffPassword"
      );

    const staffLoginBtn =
      document.getElementById(
        "staffLoginBtn"
      );

    const staffForgotPasswordBtn =
      document.getElementById(
        "staffForgotPasswordBtn"
      );

    const staffPasswordChangeBox =
      document.getElementById(
        "staffPasswordChangeBox"
      );

    const staffNewPassword =
      document.getElementById(
        "staffNewPassword"
      );

    const staffConfirmNewPassword =
      document.getElementById(
        "staffConfirmNewPassword"
      );

    const saveStaffNewPasswordBtn =
      document.getElementById(
        "saveStaffNewPasswordBtn"
      );

    const backToStaffLoginFromPasswordBtn =
      document.getElementById(
        "backToStaffLoginFromPasswordBtn"
      );

    const staffLoginMsg =
      document.getElementById(
        "staffLoginMsg"
      );

    const staffPortalMessage =
      document.getElementById(
        "staffPortalMessage"
      );

    const staffAccessCard =
      staffModal?.querySelector(
        ".staff-access-card"
      );

    const staffAccessPanel =
      document.getElementById(
        "staffAccessPanel"
      );

    const ownerLoginBox =
      document.getElementById(
        "ownerLoginBox"
      );

    const openPartnerPortalBtn =
      document.getElementById(
        "openPartnerPortalBtn"
      );

      const trustOwnerDevice =
  document.getElementById(
    "trustOwnerDevice"
  );

      const ownerVerificationBox =
  document.getElementById(
    "ownerVerificationBox"
  );

const ownerVerificationEmail =
  document.getElementById(
    "ownerVerificationEmail"
  );

const ownerVerificationCode =
  document.getElementById(
    "ownerVerificationCode"
  );

const verifyOwnerCodeBtn =
  document.getElementById(
    "verifyOwnerCodeBtn"
  );

const resendOwnerCodeBtn =
  document.getElementById(
    "resendOwnerCodeBtn"
  );

const backToOwnerLoginBtn =
  document.getElementById(
    "backToOwnerLoginBtn"
  );

          const backToStaffPortalBtn =
      document.getElementById(
        "backToStaffPortalBtn"
      );

    const backToAccessCodeBtn =
      document.getElementById(
        "backToAccessCodeBtn"
      );

    const ownerEmail =
      document.getElementById(
        "ownerEmail"
      );

    const ownerPassword =
      document.getElementById(
        "ownerPassword"
      );

    const toggleOwnerPassword = 
      document.getElementById(
        "toggleOwnerPassword"
      );

    const ownerLoginBtn =
      document.getElementById(
        "ownerLoginBtn"
      );

    const ownerForgotPasswordBtn =
      document.getElementById(
        "ownerForgotPasswordBtn"
      );

    const ownerPasswordResetRequestBox =
      document.getElementById(
        "ownerPasswordResetRequestBox"
      );

    const ownerPasswordResetFormView =
      document.getElementById(
        "ownerPasswordResetFormView"
      );

    const ownerPasswordResetStatusView =
      document.getElementById(
        "ownerPasswordResetStatusView"
      );

    const ownerRecoveryStatusIcon =
      document.getElementById(
        "ownerRecoveryStatusIcon"
      );

    const ownerRecoveryStatusBadge =
      document.getElementById(
        "ownerRecoveryStatusBadge"
      );

    const ownerRecoveryStatusTitle =
      document.getElementById(
        "ownerRecoveryStatusTitle"
      );

    const ownerRecoveryStatusText =
      document.getElementById(
        "ownerRecoveryStatusText"
      );

    const ownerRecoveryEmailCard =
      document.getElementById(
        "ownerRecoveryEmailCard"
      );

    const ownerRecoveryMaskedEmail =
      document.getElementById(
        "ownerRecoveryMaskedEmail"
      );

    const ownerRecoveryProgress =
      document.getElementById(
        "ownerRecoveryProgress"
      );

    const ownerRecoveryStepRequest =
      document.getElementById(
        "ownerRecoveryStepRequest"
      );

    const ownerRecoveryStepReview =
      document.getElementById(
        "ownerRecoveryStepReview"
      );

    const ownerRecoveryStepEmail =
      document.getElementById(
        "ownerRecoveryStepEmail"
      );

    const ownerRecoveryNextStep =
      document.getElementById(
        "ownerRecoveryNextStep"
      );

    const ownerRecoveryNextStepText =
      document.getElementById(
        "ownerRecoveryNextStepText"
      );

    const ownerRecoveryPrimaryActionBtn =
      document.getElementById(
        "ownerRecoveryPrimaryActionBtn"
      );

    const ownerRecoverySecondaryActionBtn =
      document.getElementById(
        "ownerRecoverySecondaryActionBtn"
      );

    const ownerResetRestaurantName =
      document.getElementById(
        "ownerResetRestaurantName"
      );

    const ownerResetEmail =
      document.getElementById(
        "ownerResetEmail"
      );

    const ownerResetContactNumber =
      document.getElementById(
        "ownerResetContactNumber"
      );

    const ownerResetReason =
      document.getElementById(
        "ownerResetReason"
      );

    const submitOwnerPasswordResetRequestBtn =
      document.getElementById(
        "submitOwnerPasswordResetRequestBtn"
      );

    const backToOwnerLoginFromResetRequestBtn =
      document.getElementById(
        "backToOwnerLoginFromResetRequestBtn"
      );

    const OWNER_RESET_TRACKING_STORAGE_KEY =
      "foodconnect_owner_reset_tracking_token";

    let ownerPasswordResetTrackingToken = "";
    let ownerPasswordResetStatusTimer = null;
    let ownerPasswordResetStatusNotice = null;
    let ownerPasswordResetStatusFailures = 0;

    try {
      ownerPasswordResetTrackingToken =
        window.sessionStorage.getItem(
          OWNER_RESET_TRACKING_STORAGE_KEY
        ) || "";
    } catch (error) {
      console.warn(
        "Owner recovery status storage is unavailable:",
        error
      );
    }

    const ownerPasswordChangeBox =
      document.getElementById(
        "ownerPasswordChangeBox"
      );

    const ownerNewPassword =
      document.getElementById(
        "ownerNewPassword"
      );

    const ownerConfirmNewPassword =
      document.getElementById(
        "ownerConfirmNewPassword"
      );

    const saveOwnerNewPasswordBtn =
      document.getElementById(
        "saveOwnerNewPasswordBtn"
      );

    const backToOwnerLoginFromPasswordChangeBtn =
      document.getElementById(
        "backToOwnerLoginFromPasswordChangeBtn"
      );

    const staffPortalTitle =
      document.getElementById(
        "staffPortalTitle"
      );

    const staffPortalSubtitle =
      document.getElementById(
        "staffPortalSubtitle"
      );

    const staffPortalIcon =
      document.getElementById(
        "staffPortalIcon"
      );

    const restaurantSearchForm =
      document.getElementById(
        "restaurantSearchForm"
      );

    const restaurantSearch =
      document.getElementById(
        "restaurantSearch"
      );

    let restaurantCards = [];

    const restaurantTrack =
      document.getElementById(
        "restaurantTrack"
      );

      const restaurantsPageTrack =
  document.getElementById(
    "restaurantsPageTrack"
  );

const restaurantsPageSearch =
  document.getElementById(
    "restaurantsPageSearch"
  );

const restaurantsPageSearchForm =
  document.getElementById(
    "restaurantsPageSearchForm"
  );

const restaurantsPageResultCount =
  document.getElementById(
    "restaurantsPageResultCount"
  );

const restaurantsPageEmptyState =
  document.getElementById(
    "restaurantsPageEmptyState"
  );

const restaurantsPageView =
  document.getElementById(
    "restaurants-page"
  );

const backToHomepageBtn =
  document.getElementById(
    "backToHomepageBtn"
  );

const restaurantsPageCategories =
  document.querySelectorAll(
    ".restaurants-page-category"
  );

let restaurantsPageCards = [];

    const restaurantResultCount =
      document.getElementById(
        "restaurantResultCount"
      );

    const restaurantEmptyState =
      document.getElementById(
        "restaurantEmptyState"
      );

    const categoryCards =
      document.querySelectorAll(
        ".category-card"
      );

    let userLoggedIn = false;
    let logoTapCount = 0;
    let logoTapTimer = null;

    /* =========================
       LOGIN MODAL
    ========================= */

    function syncModalScrollLock() {
      const hasOpenModal =
        loginModal?.classList.contains(
          "is-open"
        ) ||
        staffModal?.classList.contains(
          "is-open"
        );

      document.body.classList.toggle(
        "modal-scroll-locked",
        Boolean(hasOpenModal)
      );
    }

    function openLoginModal() {
      if (!loginModal) {
        return;
      }

      loginModal.classList.add(
        "is-open"
      );
      loginModal.setAttribute(
        "aria-hidden",
        "false"
      );
      loginModal.scrollTop = 0;

      syncModalScrollLock();
    }

    function closeLoginModal() {
      if (!loginModal) {
        return;
      }

      loginModal.classList.remove(
        "is-open"
      );
      loginModal.setAttribute(
        "aria-hidden",
        "true"
      );

      syncModalScrollLock();
    }

    /* =========================
       STAFF MESSAGE
    ========================= */

    function setStaffMessage(
      message = "",
      type = "error"
    ) {
      const messageTarget =
        staffPortalMessage ||
        staffLoginMsg;

      if (!messageTarget) {
        return;
      }

      messageTarget.textContent =
        message;

      messageTarget.classList.remove(
        "error",
        "success",
        "info"
      );

      if (!message) {
        return;
      }

      messageTarget.classList.add(
        type === "success"
          ? "success"
          : type === "info"
            ? "info"
            : "error"
      );
    }

        /* =========================
       PORTAL VIEWS
    ========================= */

    function setStaffRestaurantSelectorVisible(isVisible) {
      const restaurantGroup =
        staffRestaurantId?.closest(
          ".staff-input-group"
        );

      if (restaurantGroup) {
        restaurantGroup.style.display =
          isVisible ? "block" : "none";
      }
    }

    function showStaffAccessView() {
      setStaffRestaurantSelectorVisible(true);

      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "block";
      }

      if (ownerLoginBox) {
        ownerLoginBox.style.display =
          "none";
      }

      if (ownerPasswordResetRequestBox) {
        ownerPasswordResetRequestBox.style.display =
          "none";
      }

      if (ownerPasswordChangeBox) {
        ownerPasswordChangeBox.style.display =
          "none";
      }

      if (ownerVerificationBox) {
  ownerVerificationBox.style.display =
    "none";
}

      if (staffCodeBox) {
        staffCodeBox.style.display =
          "block";
      }

      if (staffLoginBox) {
        staffLoginBox.style.display =
          "none";
      }

      if (staffPasswordChangeBox) {
        staffPasswordChangeBox.style.display =
          "none";
      }

      staffAccessCard?.classList.remove(
        "partner-mode"
      );

      if (staffPortalTitle) {
        staffPortalTitle.textContent =
          "Restaurant Staff Portal";
      }

      if (staffPortalSubtitle) {
        staffPortalSubtitle.textContent =
          "Authorized restaurant personnel only";
      }

      if (staffPortalIcon) {
        staffPortalIcon.className =
          "fa-solid fa-lock";
      }

      stopOwnerPasswordResetStatusPolling();
      setStaffMessage("");

      window.setTimeout(() => {
        staffAccessCode?.focus();
      }, 50);
    }

    function showStaffCredentialsView() {
      /*
       * The restaurant was already verified by the access code.
       * Keep its value internally, but do not ask the staff member
       * to select the same restaurant a second time.
       */
      setStaffRestaurantSelectorVisible(false);

      if (staffCodeBox) {
        staffCodeBox.style.display =
          "none";
      }

      if (staffLoginBox) {
        staffLoginBox.style.display =
          "block";
      }

      if (staffPasswordChangeBox) {
        staffPasswordChangeBox.style.display =
          "none";
      }

      setStaffMessage("");

      window.setTimeout(() => {
        staffEmail?.focus();
      }, 50);
    }

    function showStaffPasswordChangeView(
      staffName = ""
    ) {
      /* The verified restaurant remains locked in the server session. */
      setStaffRestaurantSelectorVisible(false);

      if (staffCodeBox) {
        staffCodeBox.style.display =
          "none";
      }

      if (staffLoginBox) {
        staffLoginBox.style.display =
          "none";
      }

      if (staffPasswordChangeBox) {
        staffPasswordChangeBox.style.display =
          "block";
      }

      if (staffPortalTitle) {
        staffPortalTitle.textContent =
          "Create New Password";
      }

      if (staffPortalSubtitle) {
        staffPortalSubtitle.textContent =
          staffName
            ? `${staffName}, secure your staff account`
            : "Secure your staff account";
      }

      if (staffPortalIcon) {
        staffPortalIcon.className =
          "fa-solid fa-key";
      }

      if (staffNewPassword) {
        staffNewPassword.value = "";
      }

      if (staffConfirmNewPassword) {
        staffConfirmNewPassword.value = "";
      }

      setStaffMessage(
        "Your temporary password was accepted. Create a new private password to continue.",
        "info"
      );

      window.setTimeout(() => {
        staffNewPassword?.focus();
      }, 50);
    }

    function showOwnerPasswordResetRequestView() {
      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "none";
      }

      if (ownerLoginBox) {
        ownerLoginBox.style.display =
          "none";
      }

      if (ownerVerificationBox) {
        ownerVerificationBox.style.display =
          "none";
      }

      if (ownerPasswordChangeBox) {
        ownerPasswordChangeBox.style.display =
          "none";
      }

      if (ownerPasswordResetRequestBox) {
        ownerPasswordResetRequestBox.style.display =
          "block";
      }

      staffAccessCard?.classList.add(
        "partner-mode"
      );

      if (staffPortalTitle) {
        staffPortalTitle.textContent =
          "Request Password Recovery";
      }

      if (staffPortalSubtitle) {
        staffPortalSubtitle.textContent =
          "Administrator-assisted owner account recovery";
      }

      if (staffPortalIcon) {
        staffPortalIcon.className =
          "fa-solid fa-life-ring";
      }

      if (ownerResetEmail && ownerEmail?.value) {
        ownerResetEmail.value =
          ownerEmail.value.trim();
      }

      if (ownerPasswordResetTrackingToken) {
        if (!ownerPasswordResetStatusNotice) {
          ownerPasswordResetStatusNotice = {
            status: "pending",
            message:
              "Checking the latest recovery request status...",
            type: "info",
            ownerEmailMasked: "",
            reviewedAt: null
          };
        }

        renderOwnerPasswordResetRecoveryState();
        startOwnerPasswordResetStatusPolling();
        return;
      }

      ownerPasswordResetStatusNotice = null;
      showOwnerPasswordResetFormState(true);
    }

    function showOwnerPasswordChangeView(
      ownerName = ""
    ) {
      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "none";
      }

      if (ownerLoginBox) {
        ownerLoginBox.style.display =
          "none";
      }

      if (ownerVerificationBox) {
        ownerVerificationBox.style.display =
          "none";
      }

      if (ownerPasswordResetRequestBox) {
        ownerPasswordResetRequestBox.style.display =
          "none";
      }

      if (ownerPasswordChangeBox) {
        ownerPasswordChangeBox.style.display =
          "block";
      }

      staffAccessCard?.classList.add(
        "partner-mode"
      );

      if (staffPortalTitle) {
        staffPortalTitle.textContent =
          "Create New Owner Password";
      }

      if (staffPortalSubtitle) {
        staffPortalSubtitle.textContent =
          ownerName
            ? `${ownerName}, secure your owner account`
            : "Secure your owner account";
      }

      if (staffPortalIcon) {
        staffPortalIcon.className =
          "fa-solid fa-key";
      }

      if (ownerNewPassword) {
        ownerNewPassword.value = "";
      }

      if (ownerConfirmNewPassword) {
        ownerConfirmNewPassword.value = "";
      }

      setStaffMessage(
        "Temporary password accepted. Create a new private password before continuing.",
        "info"
      );

      window.setTimeout(() => {
        ownerNewPassword?.focus();
      }, 50);
    }

    function showOwnerVerificationView(
  maskedEmail = ""
) {
  
  if (staffAccessPanel) {
    staffAccessPanel.style.display =
      "none";
  }

  if (ownerLoginBox) {
    ownerLoginBox.style.display =
      "none";
  }

  if (ownerPasswordResetRequestBox) {
    ownerPasswordResetRequestBox.style.display =
      "none";
  }

  if (ownerPasswordChangeBox) {
    ownerPasswordChangeBox.style.display =
      "none";
  }

  if (ownerVerificationBox) {
    ownerVerificationBox.style.display =
      "block";
  }

  if (ownerVerificationEmail) {
    ownerVerificationEmail.textContent =
      maskedEmail ||
      "your registered email";
  }

  if (staffPortalTitle) {
    staffPortalTitle.textContent =
      "Verify Owner Login";
  }

  if (staffPortalSubtitle) {
    staffPortalSubtitle.textContent =
      "Enter the code sent to your email";
  }

  if (staffPortalIcon) {
    staffPortalIcon.className =
      "fa-solid fa-envelope-circle-check";
  }

  if (ownerVerificationCode) {
    ownerVerificationCode.value = "";
  }

  if (trustOwnerDevice) {
  trustOwnerDevice.checked = false;
}

  setStaffMessage("");

  window.setTimeout(() => {
    ownerVerificationCode?.focus();
  }, 50);
}

    function showOwnerLoginView() {
      staffAccessCard?.classList.remove(
        "owner-recovery-status-active",
        "owner-recovery-status-approved",
        "owner-recovery-status-rejected",
        "owner-recovery-status-unavailable",
        "owner-recovery-status-pending"
      );

      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "none";
      }

      if (ownerVerificationBox) {
  ownerVerificationBox.style.display =
    "none";
}

      if (ownerPasswordResetRequestBox) {
        ownerPasswordResetRequestBox.style.display =
          "none";
      }

      if (ownerPasswordChangeBox) {
        ownerPasswordChangeBox.style.display =
          "none";
      }

      if (ownerLoginBox) {
        ownerLoginBox.style.display =
          "block";
      }

      staffAccessCard?.classList.add(
        "partner-mode"
      );

      if (staffPortalTitle) {
        staffPortalTitle.textContent =
          "FoodConnect Partner Portal";
      }

      if (staffPortalSubtitle) {
        staffPortalSubtitle.textContent =
          "Restaurant owner account access";
      }

      if (staffPortalIcon) {
        staffPortalIcon.className =
          "fa-solid fa-store";
      }

      renderOwnerPasswordResetStatusNotice();

      if (ownerPasswordResetTrackingToken) {
        startOwnerPasswordResetStatusPolling();
      }

      window.setTimeout(() => {
        ownerEmail?.focus();
      }, 50);
    }

    /* =========================
       STAFF MODAL
    ========================= */

    function openStaffModal() {
      if (!staffModal) {
        return;
      }

      staffModal.classList.add(
        "is-open"
      );
      staffModal.setAttribute(
        "aria-hidden",
        "false"
      );
      staffModal.scrollTop = 0;

      if (staffAccessCard) {
        staffAccessCard.scrollTop = 0;
      }

      syncModalScrollLock();

      if (staffRestaurantId) {
        staffRestaurantId.value = "1";
      }

      if (staffAccessCode) {
        staffAccessCode.value = "";
      }

      if (staffEmail) {
        staffEmail.value = "";
      }

      if (staffPassword) {
        staffPassword.value = "";
      }

      if (ownerEmail) {
        ownerEmail.value = "";
      }

      if (ownerPassword) {
        ownerPassword.value = "";
      }

      if (ownerResetRestaurantName) {
        ownerResetRestaurantName.value = "";
      }

      if (ownerResetEmail) {
        ownerResetEmail.value = "";
      }

      if (ownerResetContactNumber) {
        ownerResetContactNumber.value = "";
      }

      if (ownerResetReason) {
        ownerResetReason.value = "";
      }

      if (ownerNewPassword) {
        ownerNewPassword.value = "";
      }

      if (ownerConfirmNewPassword) {
        ownerConfirmNewPassword.value = "";
      }

      if (ownerVerificationCode) {
  ownerVerificationCode.value = "";
}

      showStaffAccessView();
    }

    function closeStaffModal() {
      if (!staffModal) {
        return;
      }

      staffModal.classList.remove(
        "is-open"
      );
      staffModal.setAttribute(
        "aria-hidden",
        "true"
      );

      syncModalScrollLock();

      stopOwnerPasswordResetStatusPolling();
      setStaffMessage("");

      staffAccessCard?.classList.remove(
        "partner-mode",
        "owner-recovery-status-active",
        "owner-recovery-status-approved",
        "owner-recovery-status-rejected",
        "owner-recovery-status-unavailable",
        "owner-recovery-status-pending"
      );
    }

    /* =========================
       JSON RESPONSE HELPER
    ========================= */

    async function readJsonResponse(
      response
    ) {
      const text =
        await response.text();

      try {
        return JSON.parse(text);
      } catch {
        console.error(
          "Invalid JSON response:",
          text
        );

        throw new Error(
          "Something went wrong. Please try again."
        );
      }
    }

    /* =========================
       OWNER PASSWORD RECOVERY STATUS
    ========================= */

    function isOwnerPasswordResetRequestViewVisible() {
      return Boolean(
        ownerPasswordResetRequestBox &&
        ownerPasswordResetRequestBox.style.display !== "none"
      );
    }

    function setOwnerRecoveryStepState(
      stepElement,
      state = "waiting",
      stepNumber = ""
    ) {
      if (!stepElement) {
        return;
      }

      stepElement.classList.remove(
        "is-complete",
        "is-current",
        "is-stopped",
        "is-waiting"
      );

      const normalizedState =
        ["complete", "current", "stopped"].includes(state)
          ? state
          : "waiting";

      stepElement.classList.add(
        `is-${normalizedState}`
      );

      const icon =
        stepElement.querySelector(
          ".owner-recovery-step-icon"
        );

      if (!icon) {
        return;
      }

      if (normalizedState === "complete") {
        icon.innerHTML =
          '<i class="fa-solid fa-check"></i>';
      } else if (normalizedState === "stopped") {
        icon.innerHTML =
          '<i class="fa-solid fa-minus"></i>';
      } else {
        icon.textContent =
          String(stepNumber || "");
      }
    }

    function setOwnerRecoveryAction(
      button,
      label,
      iconClass = "fa-solid fa-arrow-left"
    ) {
      if (!button) {
        return;
      }

      const icon = button.querySelector("i");
      const text = button.querySelector("span");

      if (icon) {
        icon.className = iconClass;
      }

      if (text) {
        text.textContent = label;
      } else {
        button.textContent = label;
      }
    }

    function showOwnerPasswordResetFormState(
      focusFirstField = false
    ) {
      staffAccessCard?.classList.remove(
        "owner-recovery-status-active",
        "owner-recovery-status-approved",
        "owner-recovery-status-rejected",
        "owner-recovery-status-unavailable",
        "owner-recovery-status-pending"
      );

      if (ownerPasswordResetFormView) {
        ownerPasswordResetFormView.style.display =
          "block";
      }

      if (ownerPasswordResetStatusView) {
        ownerPasswordResetStatusView.style.display =
          "none";
      }

      setStaffMessage("");

      if (focusFirstField) {
        window.setTimeout(() => {
          ownerResetRestaurantName?.focus();
        }, 50);
      }
    }

    function renderOwnerPasswordResetRecoveryState(
      focusStatus = false
    ) {
      if (!ownerPasswordResetStatusNotice) {
        showOwnerPasswordResetFormState(
          focusStatus
        );
        return;
      }

      const status =
        String(
          ownerPasswordResetStatusNotice.status ||
          "pending"
        ).toLowerCase();

      if (ownerPasswordResetFormView) {
        ownerPasswordResetFormView.style.display =
          "none";
      }

      if (ownerPasswordResetStatusView) {
        ownerPasswordResetStatusView.style.display =
          "block";
        ownerPasswordResetStatusView.classList.remove(
          "is-pending",
          "is-approved",
          "is-rejected",
          "is-unavailable"
        );
      }

      const isApproved = status === "approved";
      const isRejected = status === "rejected";
      const isUnavailable =
        status === "expired" ||
        status === "unavailable";

      const viewClass = isApproved
        ? "is-approved"
        : isRejected
          ? "is-rejected"
          : isUnavailable
            ? "is-unavailable"
            : "is-pending";

      ownerPasswordResetStatusView?.classList.add(
        viewClass
      );

      staffAccessCard?.classList.remove(
        "owner-recovery-status-approved",
        "owner-recovery-status-rejected",
        "owner-recovery-status-unavailable",
        "owner-recovery-status-pending"
      );
      staffAccessCard?.classList.add(
        "owner-recovery-status-active",
        `owner-recovery-status-${
          isApproved
            ? "approved"
            : isRejected
              ? "rejected"
              : isUnavailable
                ? "unavailable"
                : "pending"
        }`
      );

      if (ownerRecoveryStatusIcon) {
        ownerRecoveryStatusIcon.innerHTML =
          isApproved
            ? '<i class="fa-solid fa-check"></i>'
            : isRejected
              ? '<i class="fa-solid fa-xmark"></i>'
              : isUnavailable
                ? '<i class="fa-solid fa-circle-question"></i>'
                : '<i class="fa-solid fa-clock"></i>';
      }

      if (ownerRecoveryStatusBadge) {
        ownerRecoveryStatusBadge.textContent =
          isApproved
            ? "Email sent"
            : isRejected
              ? "Not approved"
              : isUnavailable
                ? "Status unavailable"
                : "Waiting for review";
      }

      if (ownerRecoveryStatusTitle) {
        ownerRecoveryStatusTitle.textContent =
          isApproved
            ? "Password Reset Approved"
            : isRejected
              ? "Recovery Request Not Approved"
              : isUnavailable
                ? "Recovery Status Unavailable"
                : "Recovery Request Submitted";
      }

      if (ownerRecoveryStatusText) {
        ownerRecoveryStatusText.textContent =
          isApproved
            ? "Your temporary password has been sent to your registered owner email."
            : isRejected
              ? "The administrator reviewed your recovery request, but it was not approved."
              : isUnavailable
                ? (
                    ownerPasswordResetStatusNotice.message ||
                    "FoodConnect can no longer display the status of this recovery request in this browser session."
                  )
                : "Your request is waiting for administrator review. This screen will update automatically when the review is completed.";
      }

      const maskedEmail =
        String(
          ownerPasswordResetStatusNotice.ownerEmailMasked ||
          ""
        ).trim();

      if (ownerRecoveryEmailCard) {
        ownerRecoveryEmailCard.style.display =
          isApproved ? "flex" : "none";
      }

      if (ownerRecoveryMaskedEmail) {
        ownerRecoveryMaskedEmail.textContent =
          maskedEmail ||
          "your registered owner email";
      }

      if (ownerRecoveryProgress) {
        ownerRecoveryProgress.style.display =
          isUnavailable ? "none" : "grid";
      }

      if (!isUnavailable) {
        setOwnerRecoveryStepState(
          ownerRecoveryStepRequest,
          "complete",
          "1"
        );

        if (isApproved) {
          setOwnerRecoveryStepState(
            ownerRecoveryStepReview,
            "complete",
            "2"
          );
          setOwnerRecoveryStepState(
            ownerRecoveryStepEmail,
            "complete",
            "3"
          );
        } else if (isRejected) {
          setOwnerRecoveryStepState(
            ownerRecoveryStepReview,
            "complete",
            "2"
          );
          setOwnerRecoveryStepState(
            ownerRecoveryStepEmail,
            "stopped",
            "3"
          );
        } else {
          setOwnerRecoveryStepState(
            ownerRecoveryStepReview,
            "current",
            "2"
          );
          setOwnerRecoveryStepState(
            ownerRecoveryStepEmail,
            "waiting",
            "3"
          );
        }
      }

      const reviewCopy =
        ownerRecoveryStepReview?.querySelector(
          ".owner-recovery-step-copy small"
        );
      const emailCopy =
        ownerRecoveryStepEmail?.querySelector(
          ".owner-recovery-step-copy small"
        );

      if (reviewCopy) {
        reviewCopy.textContent =
          isApproved
            ? "Your owner account details were verified."
            : isRejected
              ? "The administrator completed the review."
              : "Waiting for account verification.";
      }

      if (emailCopy) {
        emailCopy.textContent =
          isApproved
            ? "Temporary password was sent successfully."
            : isRejected
              ? "No temporary password was sent."
              : "Temporary password will be sent after approval.";
      }

      if (ownerRecoveryNextStep) {
        ownerRecoveryNextStep.classList.remove(
          "is-success",
          "is-warning",
          "is-danger",
          "is-info"
        );
        ownerRecoveryNextStep.classList.add(
          isApproved
            ? "is-success"
            : isRejected
              ? "is-danger"
              : isUnavailable
                ? "is-warning"
                : "is-info"
        );

        const nextStepIcon =
          ownerRecoveryNextStep.querySelector("i");

        if (nextStepIcon) {
          nextStepIcon.className =
            isApproved
              ? "fa-solid fa-envelope-circle-check"
              : isRejected
                ? "fa-solid fa-circle-exclamation"
                : isUnavailable
                  ? "fa-solid fa-triangle-exclamation"
                  : "fa-solid fa-circle-info";
        }
      }

      if (ownerRecoveryNextStepText) {
        ownerRecoveryNextStepText.textContent =
          isApproved
            ? "Check Inbox or Spam/Junk → use the temporary password for your next owner login → create a new private password when FoodConnect prompts you."
            : isRejected
              ? "If you still need access, verify your registered account details and contact the FoodConnect administrator before sending another request."
              : isUnavailable
                ? "Check your registered email first. If you still cannot access the account, you can start a new recovery request."
                : "You do not need to submit another request. If approved, FoodConnect will email the temporary password automatically.";
      }

      setOwnerRecoveryAction(
        ownerRecoveryPrimaryActionBtn,
        isApproved
          ? "Go to Owner Login"
          : "Back to Owner Login",
        isApproved
          ? "fa-solid fa-right-to-bracket"
          : "fa-solid fa-arrow-left"
      );

      if (ownerRecoverySecondaryActionBtn) {
        ownerRecoverySecondaryActionBtn.style.display =
          isRejected || isUnavailable
            ? "inline-flex"
            : "none";

        setOwnerRecoveryAction(
          ownerRecoverySecondaryActionBtn,
          isUnavailable
            ? "Start New Recovery Request"
            : "Submit Another Request",
          "fa-solid fa-rotate-right"
        );
      }

      /*
       * The dedicated recovery state replaces the generic portal banner.
       * Validation/API errors can still use the shared banner while the form
       * is displayed.
       */
      setStaffMessage("");

      if (focusStatus) {
        window.setTimeout(() => {
          if (staffAccessCard) {
            staffAccessCard.scrollTop = 0;
          }

          ownerRecoveryStatusTitle?.focus();
        }, 50);
      }
    }

    function stopOwnerPasswordResetStatusPolling() {
      if (ownerPasswordResetStatusTimer) {
        window.clearTimeout(
          ownerPasswordResetStatusTimer
        );

        ownerPasswordResetStatusTimer =
          null;
      }
    }

    function saveOwnerPasswordResetTrackingToken(
      token = ""
    ) {
      const normalizedToken =
        String(token).trim().toLowerCase();

      if (!/^[a-f0-9]{48}$/.test(normalizedToken)) {
        return;
      }

      ownerPasswordResetTrackingToken =
        normalizedToken;

      try {
        window.sessionStorage.setItem(
          OWNER_RESET_TRACKING_STORAGE_KEY,
          normalizedToken
        );
      } catch (error) {
        console.warn(
          "Unable to save owner recovery status token:",
          error
        );
      }
    }

    function clearOwnerPasswordResetTracking() {
      stopOwnerPasswordResetStatusPolling();

      ownerPasswordResetTrackingToken = "";
      ownerPasswordResetStatusNotice = null;
      ownerPasswordResetStatusFailures = 0;

      try {
        window.sessionStorage.removeItem(
          OWNER_RESET_TRACKING_STORAGE_KEY
        );
      } catch (error) {
        console.warn(
          "Unable to clear owner recovery status token:",
          error
        );
      }
    }

    function setOwnerPasswordResetStatusNotice(
      status,
      message,
      details = {}
    ) {
      const previousStatus =
        ownerPasswordResetStatusNotice?.status ||
        "";

      const normalizedStatus =
        String(status || "pending").toLowerCase();

      const messageType =
        normalizedStatus === "approved"
          ? "success"
          : normalizedStatus === "rejected"
            ? "error"
            : "info";

      ownerPasswordResetStatusNotice = {
        status: normalizedStatus,
        message:
          String(message || "").trim(),
        type: messageType,
        ownerEmailMasked:
          String(
            details.owner_email_masked ||
            details.ownerEmailMasked ||
            ""
          ).trim(),
        reviewedAt:
          details.reviewed_at ||
          details.reviewedAt ||
          null
      };

      if (isOwnerPasswordResetRequestViewVisible()) {
        renderOwnerPasswordResetRecoveryState(
          previousStatus !== normalizedStatus
        );
        return;
      }

      if (ownerPasswordResetStatusNotice.message) {
        setStaffMessage(
          ownerPasswordResetStatusNotice.message,
          ownerPasswordResetStatusNotice.type
        );
      }
    }

    function renderOwnerPasswordResetStatusNotice(
      fallbackMessage = ""
    ) {
      if (isOwnerPasswordResetRequestViewVisible()) {
        if (ownerPasswordResetStatusNotice) {
          renderOwnerPasswordResetRecoveryState();
        } else {
          showOwnerPasswordResetFormState();
        }

        return;
      }

      if (
        ownerPasswordResetStatusNotice &&
        ownerPasswordResetStatusNotice.message
      ) {
        setStaffMessage(
          ownerPasswordResetStatusNotice.message,
          ownerPasswordResetStatusNotice.type
        );

        return;
      }

      setStaffMessage(
        fallbackMessage,
        "info"
      );
    }

    function scheduleOwnerPasswordResetStatusCheck(
      delay = 8000
    ) {
      stopOwnerPasswordResetStatusPolling();

      if (!ownerPasswordResetTrackingToken) {
        return;
      }

      ownerPasswordResetStatusTimer =
        window.setTimeout(
          checkOwnerPasswordResetStatus,
          delay
        );
    }

    async function checkOwnerPasswordResetStatus() {
      if (!ownerPasswordResetTrackingToken) {
        return;
      }

      try {
        const response =
          await fetch(
            `${window.API}/get_owner_password_reset_status.php`,
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
                tracking_token:
                  ownerPasswordResetTrackingToken
              })
            }
          );

        const data =
          await readJsonResponse(
            response
          );

        if (!response.ok || !data.success) {
          ownerPasswordResetStatusFailures += 1;

          if (ownerPasswordResetStatusFailures >= 3) {
            setStaffMessage(
              "Your recovery request is still being tracked, but FoodConnect could not refresh its status right now. Check your email and try again shortly.",
              "info"
            );
          }

          scheduleOwnerPasswordResetStatusCheck(
            15000
          );

          return;
        }

        ownerPasswordResetStatusFailures = 0;

        const status =
          String(
            data.status || "pending"
          ).toLowerCase();

        if (status === "approved") {
          setOwnerPasswordResetStatusNotice(
            "approved",
            data.message ||
              "Password reset approved. FoodConnect sent the temporary password to your registered owner email. Check your Inbox and Spam/Junk folder, then return to Owner Login.",
            data
          );

          stopOwnerPasswordResetStatusPolling();
          return;
        }

        if (status === "rejected") {
          setOwnerPasswordResetStatusNotice(
            "rejected",
            data.message ||
              "Your recovery request was reviewed but was not approved.",
            data
          );

          stopOwnerPasswordResetStatusPolling();
          return;
        }

        if (
          status === "expired" ||
          status === "unavailable"
        ) {
          setOwnerPasswordResetStatusNotice(
            status,
            data.message ||
              "Recovery status tracking is no longer available in this browser session. Check your email or submit another request if needed.",
            data
          );

          stopOwnerPasswordResetStatusPolling();
          return;
        }

        setOwnerPasswordResetStatusNotice(
          "pending",
          data.message ||
            "Your recovery request is waiting for administrator review. If approved, FoodConnect will automatically email the temporary password to your registered owner email.",
          data
        );

        scheduleOwnerPasswordResetStatusCheck(
          8000
        );
      } catch (error) {
        console.error(
          "Owner password recovery status check failed:",
          error
        );

        ownerPasswordResetStatusFailures += 1;

        scheduleOwnerPasswordResetStatusCheck(
          15000
        );
      }
    }

    function startOwnerPasswordResetStatusPolling(
      immediate = true
    ) {
      stopOwnerPasswordResetStatusPolling();

      if (!ownerPasswordResetTrackingToken) {
        return;
      }

      if (immediate) {
        checkOwnerPasswordResetStatus();
      } else {
        scheduleOwnerPasswordResetStatusCheck(
          3000
        );
      }
    }

    /* =========================
       LOGIN CHECK
    ========================= */

    async function checkLogin() {
      try {
        const response =
          await fetch(
            `${window.API}/me.php`,
            {
              credentials: "include"
            }
          );

        const data =
          await readJsonResponse(
            response
          );

        userLoggedIn =
          Boolean(data.logged_in);

        return data;
      } catch (error) {
        console.error(
          "Unable to check login:",
          error
        );

        userLoggedIn = false;

        return {
          logged_in: false
        };
      }
    }

    /* =========================
       ACCOUNT UI
    ========================= */

    async function setupAccountUI() {
      const data =
        await checkLogin();

      if (data.logged_in) {
        const fullName =
          data.user?.full_name ||
          data.user?.fullname ||
          data.user?.name ||
          "User";

        const role =
          String(
            data.user?.role || ""
          ).toLowerCase();

        const currentPage =
          window.location.pathname
            .toLowerCase();

        if (
          role === "owner" &&
          currentPage.includes(
            "index.html"
          )
        ) {
          const ownerDestination =
            data.owner_redirect_url ||
            (
              Number(
                data.user
                  ?.restaurant_id || 0
              ) > 0
                ? "owner_dashboard.html"
                : "create_restaurant.html"
            );

          window.location.href =
            ownerDestination;

          return;
        }

        if (accountName) {
          accountName.textContent =
            fullName;
        }

        if (welcomeUser) {
          welcomeUser.textContent =
            `Welcome, ${fullName}`;
        }

        if (loginBtn) {
          loginBtn.style.display =
            "none";
        }

        if (signupBtn) {
          signupBtn.style.display =
            "none";
        }

        if (goProfileBtn) {
          goProfileBtn.style.display =
            "block";
        }

        if (logoutBtn) {
          logoutBtn.style.display =
            "block";
        }
      } else {
        if (accountName) {
          accountName.textContent =
            "Guest";
        }

        if (welcomeUser) {
          welcomeUser.textContent = "";
        }

        if (loginBtn) {
          loginBtn.style.display =
            "block";
        }

        if (signupBtn) {
          signupBtn.style.display =
            "block";
        }

        if (goProfileBtn) {
          goProfileBtn.style.display =
            "none";
        }

        if (logoutBtn) {
          logoutBtn.style.display =
            "none";
        }
      }
    }

    /* =========================
   SAFE HTML OUTPUT
========================= */

function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   RESTAURANT CARDS
========================= */

function createRestaurantCard(
  restaurant
) {
  const restaurantId =
    Number(
      restaurant.restaurant_id || 0
    );

  const restaurantName =
    String(
      restaurant.name ||
      "Unnamed Restaurant"
    ).trim();

  const restaurantAddress =
    String(
      restaurant.address ||
      "Address not available"
    ).trim();

  const openingHours =
    String(
      restaurant.opening_hours ||
      "Hours not available"
    ).trim();

  const businessStatus =
    String(
      restaurant.business_status ||
      "Closed"
    ).trim();

  const deliveryFee =
    Number(
      restaurant.delivery_fee || 0
    );

  const article =
    document.createElement("article");

  article.className =
    "restaurant-card restaurant-slide";

  article.dataset.restaurantId =
    String(restaurantId);

  article.dataset.name =
    restaurantName;

  article.dataset.description = [
    restaurantName,
    restaurantAddress
  ].join(" ");

  article.dataset.deliveryFee =
    String(deliveryFee);

  article.dataset.businessStatus =
    businessStatus;

    article.dataset.openingHours =
  openingHours;

  article.dataset.restaurantStatus =
    "active";

  article.dataset.operatingDays =
    "0,1,2,3,4,5,6";

  /*
   * Your current database stores operating hours as
   * one text value instead of separate opening and
   * closing time columns.
   *
   * The business status remains the primary indicator
   * until the schedule structure is expanded later.
   */
  article.dataset.openingTime = "";
  article.dataset.closingTime = "";

  article.innerHTML = `
    <div class="restaurant-card-image">

      <img
        src="https://raw.githubusercontent.com/damocles-24/IMAGES/refs/heads/main/05f3b888-5229-477b-87a0-0b27c7ddee38%20(1)-Photoroom.png"
        alt="${escapeHtml(restaurantName)}"
      >

      <span class="status-badge">
        Checking...
      </span>

    </div>

    <div class="restaurant-card-body">

      <div class="restaurant-title-row">

        <div>

          <h3>
            ${escapeHtml(restaurantName)}
          </h3>

          <p>
            ${escapeHtml(restaurantAddress)}
          </p>

        </div>

        <span class="rating">

          <i class="fa-solid fa-store"></i>

          Restaurant

        </span>

      </div>

      <div class="restaurant-meta">

        <span class="restaurant-meta-item">

          <i class="fa-solid fa-motorcycle"></i>

          <span class="restaurant-meta-copy">

            <strong>
              Delivery
            </strong>

            <small class="delivery-fee">
              ${escapeHtml(
                formatDeliveryFee(
                  deliveryFee
                )
              )}
            </small>

          </span>

        </span>

        <span class="restaurant-meta-item">

          <i class="fa-solid fa-clock"></i>

          <span class="restaurant-meta-copy">

            <strong>
              Store Hours
            </strong>

            <small class="restaurant-hours">
              ${escapeHtml(openingHours)}
            </small>

          </span>

        </span>

      </div>

      <a
        class="card-action restaurant-link"
        href="restaurant.html?restaurant_id=${restaurantId}"
      >

        View Restaurant

        <i class="fa-solid fa-arrow-right"></i>

      </a>

    </div>
  `;

  return article;
}

function updateStaffRestaurantOptions(
  restaurants
) {
  if (!staffRestaurantId) {
    return;
  }

  staffRestaurantId.innerHTML = "";

  const defaultOption =
    document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent =
    "Select a restaurant";

  staffRestaurantId.appendChild(
    defaultOption
  );

  restaurants.forEach(
    (restaurant) => {
      const restaurantId =
        Number(
          restaurant.restaurant_id || 0
        );

      if (restaurantId <= 0) {
        return;
      }

      const option =
        document.createElement("option");

      option.value =
        String(restaurantId);

      option.textContent =
        String(
          restaurant.name ||
          `Restaurant ${restaurantId}`
        );

      staffRestaurantId.appendChild(
        option
      );
    }
  );
}

function bindRestaurantLinks() {
  const restaurantLinks =
    document.querySelectorAll(
      ".restaurant-link"
    );

  restaurantLinks.forEach(
    (link) => {
      link.addEventListener(
        "click",
        async (event) => {
          event.preventDefault();

          const restaurantUrl =
            link.getAttribute("href");

          if (!restaurantUrl) {
            return;
          }

          const login =
            await checkLogin();

          if (!login.logged_in) {
            openLoginModal();

            return;
          }

          window.location.href =
            restaurantUrl;
        }
      );
    }
  );
}

/* =========================================================
   RESTAURANTS PAGE VIEW
========================================================= */

function renderRestaurantsPageCards() {

  if (!restaurantsPageTrack) {
    return;
  }

  restaurantsPageTrack.innerHTML = "";

  const originalCards =
    restaurantTrack
      ? restaurantTrack.querySelectorAll(
          ".restaurant-slide"
        )
      : [];

  originalCards.forEach(
    (card) => {

      const clonedCard =
        card.cloneNode(true);

      clonedCard.style.display = "";

      restaurantsPageTrack.appendChild(
        clonedCard
      );

    }
  );

  restaurantsPageCards = [
    ...restaurantsPageTrack.querySelectorAll(
      ".restaurant-slide"
    )
  ];

  bindRestaurantsPageLinks();

  filterRestaurantsPage(
    restaurantsPageSearch?.value || ""
  );
}


function bindRestaurantsPageLinks() {

  if (!restaurantsPageTrack) {
    return;
  }

  const links =
    restaurantsPageTrack.querySelectorAll(
      ".restaurant-link"
    );

  links.forEach(
    (link) => {

      link.addEventListener(
        "click",
        async (event) => {

          event.preventDefault();

          const restaurantUrl =
            link.getAttribute("href");

          if (!restaurantUrl) {
            return;
          }

          const login =
            await checkLogin();

          if (!login.logged_in) {
            openLoginModal();

            return;
          }

          window.location.href =
            restaurantUrl;

        }
      );

    }
  );
}


function filterRestaurantsPage(
  searchValue = ""
) {

  const query =
    String(searchValue)
      .trim()
      .toLowerCase();

  let visibleCount = 0;

  restaurantsPageCards.forEach(
    (card) => {

      const searchableText = [

        card.dataset.name || "",

        card.dataset.description || ""

      ]
        .join(" ")
        .toLowerCase();


      const matches =
        !query ||
        searchableText.includes(
          query
        );


      card.style.display =
        matches ? "" : "none";


      if (matches) {
        visibleCount += 1;
      }

    }
  );


  if (restaurantsPageResultCount) {

    restaurantsPageResultCount.textContent =
      `${visibleCount} restaurant${
        visibleCount === 1
          ? ""
          : "s"
      }`;

  }


  if (restaurantsPageEmptyState) {

    restaurantsPageEmptyState.style.display =
      visibleCount === 0
        ? "block"
        : "none";

  }

}


function showRestaurantsPage() {

  const main =
    document.querySelector("main");

  const partnerCTA =
    document.getElementById(
      "restaurant-partner"
    );


  if (main) {
    main.style.display = "none";
  }


  if (partnerCTA) {
    partnerCTA.style.display = "none";
  }


  if (restaurantsPageView) {

    restaurantsPageView.style.display =
      "block";

  }
document.body.classList.add(
  "restaurants-page-active"
);

  renderRestaurantsPageCards();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showHomePage() {

  const main =
    document.querySelector("main");

  const partnerCTA =
    document.getElementById(
      "restaurant-partner"
    );


  if (restaurantsPageView) {

    restaurantsPageView.style.display =
      "none";

  }


  if (main) {
    main.style.display = "";
  }


  if (partnerCTA) {
    partnerCTA.style.display = "";
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

async function loadPublicRestaurants() {
  if (!restaurantTrack) {
    return;
  }

  restaurantTrack.innerHTML = "";

  if (restaurantResultCount) {
    restaurantResultCount.textContent =
      "Loading restaurants...";
  }

  try {
    const response = await fetch(
      `${window.API}/get_public_restaurants.php`,
      {
        cache: "no-store"
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to load restaurants."
      );
    }

    const restaurants =
      Array.isArray(data.restaurants)
        ? data.restaurants
        : [];

    restaurants.forEach(
      (restaurant) => {
        const card =
          createRestaurantCard(
            restaurant
          );

        restaurantTrack.appendChild(
          card
        );
      }
    );

    restaurantCards = [
      ...restaurantTrack.querySelectorAll(
        ".restaurant-slide"
      )
    ];

    updateStaffRestaurantOptions(
      restaurants
    );

    bindRestaurantLinks();

    updateAllRestaurantCards();

    filterRestaurants(
      restaurantSearch?.value || ""
    );
  } catch (error) {
    console.error(
      "Load public restaurants failed:",
      error
    );

    restaurantCards = [];

    restaurantTrack.innerHTML = "";

    if (restaurantResultCount) {
      restaurantResultCount.textContent =
        "0 restaurants";
    }

    if (restaurantEmptyState) {
      restaurantEmptyState.textContent =
        "Restaurants could not be loaded.";

      restaurantEmptyState.style.display =
        "block";
    }

    updateStaffRestaurantOptions([]);
  }
}

    /* =========================
       RESTAURANT SEARCH
    ========================= */

    function filterRestaurants(
      searchValue = ""
    ) {
      const query =
        searchValue
          .trim()
          .toLowerCase();

      let visibleCount = 0;

      restaurantCards.forEach(
        (card) => {
          const searchableText = [
            card.dataset.name || "",
            card.dataset.description || ""
          ]
            .join(" ")
            .toLowerCase();

          const matches =
            !query ||
            searchableText.includes(
              query
            );

          card.style.display =
            matches ? "" : "none";

          if (matches) {
            visibleCount += 1;
          }
        }
      );

      if (restaurantResultCount) {
        restaurantResultCount.textContent =
          `${visibleCount} restaurant${
            visibleCount === 1
              ? ""
              : "s"
          }`;
      }

      if (restaurantEmptyState) {
        restaurantEmptyState.style.display =
          visibleCount === 0
            ? "block"
            : "none";
      }
    }

    /* =========================
   RESTAURANT AVAILABILITY
========================= */

function timeToMinutes(
  timeValue = ""
) {
  const parts =
    String(timeValue)
      .split(":")
      .map(Number);

  if (
    parts.length !== 2 ||
    parts.some(Number.isNaN)
  ) {
    return null;
  }

  const [hours, minutes] =
    parts;

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTime(
  timeValue = ""
) {
  const totalMinutes =
    timeToMinutes(timeValue);

  if (totalMinutes === null) {
    return "Schedule unavailable";
  }

  const hours24 =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  const period =
    hours24 >= 12
      ? "PM"
      : "AM";

  const hours12 =
    hours24 % 12 || 12;

  return `${hours12}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
}

function formatDeliveryFee(
  feeValue = 0
) {
  const fee =
    Number(feeValue);

  if (!Number.isFinite(fee)) {
    return "Unavailable";
  }

  if (fee <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2
    }
  ).format(fee);
}

function isRestaurantOpen(
  card,
  currentDate = new Date()
) {
  const businessStatus =
    String(
      card.dataset.businessStatus ||
      "Closed"
    )
      .trim()
      .toLowerCase();

  /*
   * The owner-controlled business status takes
   * priority over the operating schedule.
   */
  if (businessStatus !== "open") {
    return false;
  }

  const restaurantStatus =
    String(
      card.dataset.restaurantStatus ||
      ""
    )
      .trim()
      .toLowerCase();

  if (
    restaurantStatus !== "active"
  ) {
    return false;
  }

  const operatingDays =
    String(
      card.dataset.operatingDays || ""
    )
      .split(",")
      .map(day =>
        Number(day.trim())
      )
      .filter(day =>
        Number.isInteger(day)
      );

  const currentDay =
    currentDate.getDay();

  if (
    !operatingDays.includes(
      currentDay
    )
  ) {
    return false;
  }

  const openingMinutes =
    timeToMinutes(
      card.dataset.openingTime
    );

  const closingMinutes =
    timeToMinutes(
      card.dataset.closingTime
    );

  /*
   * Your database currently also stores a combined
   * opening_hours string. Until separate opening and
   * closing columns are dynamic, use the existing
   * card schedule.
   */
  if (
    openingMinutes === null ||
    closingMinutes === null
  ) {
    return true;
  }

  const currentMinutes =
    currentDate.getHours() * 60 +
    currentDate.getMinutes();

  if (
    openingMinutes === closingMinutes
  ) {
    return true;
  }

  if (
    closingMinutes > openingMinutes
  ) {
    return (
      currentMinutes >= openingMinutes &&
      currentMinutes < closingMinutes
    );
  }

  return (
    currentMinutes >= openingMinutes ||
    currentMinutes < closingMinutes
  );
}

async function loadPublicRestaurantCard(
  card
) {
  const restaurantId =
    Number(
      card.dataset.restaurantId || 0
    );

  if (
    !Number.isInteger(restaurantId) ||
    restaurantId <= 0
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${window.API}/get_public_restaurant.php?restaurant_id=${restaurantId}`,
      {
        cache: "no-store"
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to load restaurant."
      );
    }

    const restaurant =
      data.restaurant || {};
    card.hidden = false;
    card.dataset.businessStatus =

      String(
        restaurant.business_status ||
        "Closed"
      );

    card.dataset.deliveryFee =
      String(
        restaurant.delivery_fee || 0
      );

    const nameElement =
      card.querySelector("h3");

    if (
      nameElement &&
      restaurant.name
    ) {
      nameElement.textContent =
        restaurant.name;

      card.dataset.name =
        restaurant.name;
    }

    updateRestaurantCard(card);
  } catch (error) {
    console.error(
      "Load public restaurant card failed:",
      error
    );

    /*
     * A restaurant with an inactive owner is administratively
     * deactivated and must not appear to customers.
     */

    card.hidden = true;
  }
}

function updateRestaurantCard(
  card
) {
  const statusBadge =
    card.querySelector(
      ".status-badge"
    );

  const deliveryFee =
    card.querySelector(
      ".delivery-fee"
    );

  const restaurantHours =
    card.querySelector(
      ".restaurant-hours"
    );

  const open =
    isRestaurantOpen(card);

 if (statusBadge) {
  const businessStatus =
    String(
      card.dataset.businessStatus ||
      "Closed"
    ).trim();

  statusBadge.textContent =
    open
      ? "Open Now"
      : businessStatus
          .toLowerCase() ===
        "temporarily unavailable"
        ? "Temporarily Unavailable"
        : "Closed";

  statusBadge.classList.toggle(
    "open",
    open
  );

  statusBadge.classList.toggle(
    "closed",
    !open
  );
}

  if (deliveryFee) {
    deliveryFee.textContent =
      formatDeliveryFee(
        card.dataset.deliveryFee
      );
  }

  if (restaurantHours) {
  const storedHours =
    String(
      card.dataset.openingHours || ""
    ).trim();

  if (storedHours) {
    restaurantHours.textContent =
      storedHours;
  } else {
    restaurantHours.textContent =
      "Hours not available";
  }
}
}

function updateAllRestaurantCards() {
  restaurantCards.forEach(
    updateRestaurantCard
  );
}

    /* =========================
       LOGIN MODAL EVENTS
    ========================= */

    closeLoginModalBtn?.addEventListener(
      "click",
      closeLoginModal
    );

    window.addEventListener(
      "click",
      (event) => {
        if (
          event.target === loginModal
        ) {
          closeLoginModal();
        }

        if (
          event.target === staffModal
        ) {
          closeStaffModal();
        }
      }
    );

    /* =========================
       ACCOUNT DROPDOWN
    ========================= */

    accountBtn?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        accountWrapper?.classList.toggle(
          "open"
        );

        accountBtn.setAttribute(
          "aria-expanded",
          accountWrapper?.classList.contains(
            "open"
          )
            ? "true"
            : "false"
        );
      }
    );

    accountDropdown?.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
      }
    );

    document.addEventListener(
      "click",
      () => {
        accountWrapper?.classList.remove(
          "open"
        );

        accountBtn?.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    );

    /* =========================
       ESC KEY
    ========================= */

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          accountWrapper?.classList.remove(
            "open"
          );

          closeLoginModal();
          closeStaffModal();
        }
      }
    );

    /* =========================
       ALT + Q STAFF SHORTCUT
    ========================= */

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.altKey &&
          event.code === "KeyQ"
        ) {
          event.preventDefault();
          event.stopPropagation();

          if (event.repeat) {
            return;
          }

          if (
            !staffModal?.classList.contains(
              "is-open"
            )
          ) {
            openStaffModal();
          }
        }
      }
    );

    /* =========================
       ACCOUNT BUTTONS
    ========================= */

    loginBtn?.addEventListener(
      "click",
      () => {
        window.location.href =
          "login.html";
      }
    );

    signupBtn?.addEventListener(
      "click",
      () => {
        window.location.href =
          "signup.html";
      }
    );

    logoutBtn?.addEventListener(
      "click",
      () => {
        window.location.href =
          `${window.API}/logout.php`;
      }
    );

    /* =========================
       ACCOUNT SETTINGS
    ========================= */

    goProfileBtn?.addEventListener(
      "click",
      async () => {
        const data =
          await checkLogin();

        if (!data.logged_in) {
          window.location.href =
            "login.html";

          return;
        }

        const role =
          String(
            data.user?.role || ""
          ).toLowerCase();

        switch (role) {
          case "owner":
            window.location.href =
              data.owner_redirect_url ||
              (
                Number(
                  data.user
                    ?.restaurant_id || 0
                ) > 0
                  ? "owner_dashboard.html"
                  : "create_restaurant.html"
              );
            break;

          case "cashier":
            window.location.href =
              "cashier_dashboard.html";
            break;

          case "delivery_staff":
            window.location.href =
              "delivery_dashboard.html";
            break;

          case "admin":
            window.location.href =
              "admin.html";
            break;

          default:
            window.location.href =
              "profile.html";
        }
      }
    );

    bindRestaurantLinks();

    /* =========================
       RESTAURANT SEARCH FORM
    ========================= */

   restaurantSearchForm?.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    filterRestaurants(
      restaurantSearch?.value || ""
    );

    document
      .querySelector(".restaurants-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  }
);

/* =========================================================
   RESTAURANTS PAGE NAVIGATION
========================================================= */

document
  .querySelectorAll(
    'a[href="#restaurants-page"]'
  )
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          showRestaurantsPage();

        }
      );

    }
  );


backToHomepageBtn?.addEventListener(
  "click",
  () => {

    showHomePage();

  }
);

    /* =========================
       CATEGORY BUTTONS
    ========================= */

    categoryCards.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const keyword =
              button.dataset.search || "";

            if (restaurantSearch) {
              restaurantSearch.value =
                keyword;
            }

            filterRestaurants(keyword);
          }
        );
      }
    );

    /* =========================
       MOBILE STAFF ACCESS
    ========================= */

    staffTrigger?.addEventListener(
      "click",
      () => {
        logoTapCount += 1;

        clearTimeout(
          logoTapTimer
        );

        logoTapTimer =
          setTimeout(() => {
            logoTapCount = 0;
          }, 2000);

        if (logoTapCount >= 5) {
          logoTapCount = 0;

          openStaffModal();
        }
      }
    );

    /* =========================
   OPEN PARTNER PORTAL FROM URL
========================= */

const pageParams =
  new URLSearchParams(
    window.location.search
  );

if (
  pageParams.get("open") ===
  "partner-portal"
) {
  openStaffModal();
  showOwnerLoginView();

  /*
  Remove the query parameter so refreshing the
  homepage does not repeatedly reopen the portal.
  */

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}

    /* =========================
       CLOSE STAFF MODAL
    ========================= */

    closeStaffModalBtn?.addEventListener(
      "click",
      closeStaffModal
    );

    /* =========================
       PORTAL NAVIGATION
    ========================= */

        openPartnerPortalBtn?.addEventListener(
      "click",
      showOwnerLoginView
    );

    backToStaffPortalBtn?.addEventListener(
      "click",
      showStaffAccessView
    );

    ownerForgotPasswordBtn?.addEventListener(
      "click",
      showOwnerPasswordResetRequestView
    );

    backToOwnerLoginFromResetRequestBtn?.addEventListener(
      "click",
      showOwnerLoginView
    );

    ownerRecoveryPrimaryActionBtn?.addEventListener(
      "click",
      showOwnerLoginView
    );

    ownerRecoverySecondaryActionBtn?.addEventListener(
      "click",
      () => {
        clearOwnerPasswordResetTracking();
        ownerPasswordResetStatusNotice = null;
        showOwnerPasswordResetRequestView();
      }
    );

    backToOwnerLoginFromPasswordChangeBtn?.addEventListener(
      "click",
      showOwnerLoginView
    );

    backToAccessCodeBtn?.addEventListener(
      "click",
      showStaffAccessView
    );

    /* =========================
       VERIFY STAFF ACCESS CODE
    ========================= */

    verifyStaffCodeBtn?.addEventListener(
      "click",
      async () => {
        const accessCode =
          staffAccessCode?.value.trim() ||
          "";

        const restaurantId =
          Number(
            staffRestaurantId?.value ||
            0
          );

        setStaffMessage("");

        if (!restaurantId) {
          setStaffMessage(
            "Select a restaurant."
          );

          return;
        }

        if (!accessCode) {
          setStaffMessage(
            "Enter the restaurant access code."
          );

          staffAccessCode?.focus();

          return;
        }

        verifyStaffCodeBtn.disabled =
          true;

        verifyStaffCodeBtn.textContent =
          "Verifying...";

        try {
          const response =
            await fetch(
              `${window.API}/verify_staff_access.php`,
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

                  access_code:
                    accessCode
                })
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            setStaffMessage(
              data.message ||
              "Invalid access code."
            );

            staffAccessCode?.select();

            return;
          }

          showStaffCredentialsView();

          setStaffMessage(
            "Access code verified. Enter your staff account credentials.",
            "success"
          );
        } catch (error) {
          console.error(
            "Staff access verification failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );
        } finally {
          verifyStaffCodeBtn.disabled =
            false;

          verifyStaffCodeBtn.textContent =
            "Continue";
        }
      }
    );

    /* =========================
       OWNER LOGIN
    ========================= */

    ownerLoginBtn?.addEventListener(
      "click",
      async () => {
        const email =
          ownerEmail?.value.trim() ||
          "";

        const password =
          ownerPassword?.value || "";

        setStaffMessage("");

        if (!email || !password) {
          setStaffMessage(
            "Enter your owner email and password."
          );

          if (!email) {
            ownerEmail?.focus();
          } else {
            ownerPassword?.focus();
          }

          return;
        }

        ownerLoginBtn.disabled =
          true;

        ownerLoginBtn.textContent =
          "Logging in...";

        try {
          const response =
            await fetch(
              `${window.API}/owner_login.php`,
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
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            setStaffMessage(
              data.message ||
              "Invalid owner login credentials."
            );

            return;
          }

          /*
           * A successful owner credential check means the recovery email, if
           * one was being tracked in this browser, has already served its
           * purpose. Remove the stale approval notice before continuing.
           */
          clearOwnerPasswordResetTracking();

          if (data.password_change_required === true) {
            showOwnerPasswordChangeView(
              data.user?.full_name || ""
            );

            return;
          }

         /*
A trusted browser may be authenticated immediately
without sending another email code.
*/

if (
  data.verification_required === false &&
  data.redirect_url
) {
  localStorage.setItem(
    "user_full_name",
    data.user?.full_name || ""
  );

  localStorage.setItem(
    "user_role",
    "owner"
  );

  setStaffMessage(
    data.message ||
    "Trusted device recognized. Redirecting...",
    "success"
  );

  window.setTimeout(() => {
    window.location.href =
      data.redirect_url;
  }, 500);

  return;
}

if (!data.verification_required) {
  throw new Error(
    "The server did not provide a valid owner login response."
  );
}

showOwnerVerificationView(
  data.masked_email || ""
);

setStaffMessage(
  data.message ||
  "Check your email for the verification code.",
  "success"
);
        } catch (error) {
          console.error(
            "Owner login failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );
        } finally {
          ownerLoginBtn.disabled =
            false;

          ownerLoginBtn.textContent =
            "Login as Restaurant Owner";
        }
      }
    );

    /* =========================
       OWNER PASSWORD RECOVERY REQUEST
    ========================= */

    submitOwnerPasswordResetRequestBtn?.addEventListener(
      "click",
      async () => {
        const restaurantName =
          ownerResetRestaurantName?.value.trim() ||
          "";

        const email =
          ownerResetEmail?.value.trim() ||
          "";

        const contactNumber =
          ownerResetContactNumber?.value.trim() ||
          "";

        const reason =
          ownerResetReason?.value.trim() ||
          "";

        setStaffMessage("");

        if (!restaurantName || !email || !contactNumber || !reason) {
          setStaffMessage(
            "Complete the restaurant name, owner email, registered mobile number, and recovery reason."
          );
          return;
        }

        if (reason.length < 10) {
          setStaffMessage(
            "Please provide at least 10 characters explaining the recovery request."
          );
          ownerResetReason?.focus();
          return;
        }

        submitOwnerPasswordResetRequestBtn.disabled =
          true;

        submitOwnerPasswordResetRequestBtn.textContent =
          "Sending request...";

        try {
          const response =
            await fetch(
              `${window.API}/request_owner_password_reset.php`,
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
                  restaurant_name:
                    restaurantName,
                  email,
                  contact_number:
                    contactNumber,
                  reason
                })
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (!response.ok || !data.success) {
            setStaffMessage(
              data.message ||
              "Unable to submit the password recovery request."
            );
            return;
          }

          saveOwnerPasswordResetTrackingToken(
            data.tracking_token || ""
          );

          if (ownerEmail && email) {
            ownerEmail.value = email;
          }

          if (ownerResetRestaurantName) {
            ownerResetRestaurantName.value =
              "";
          }

          if (ownerResetEmail) {
            ownerResetEmail.value =
              "";
          }

          if (ownerResetContactNumber) {
            ownerResetContactNumber.value =
              "";
          }

          if (ownerResetReason) {
            ownerResetReason.value =
              "";
          }

          setOwnerPasswordResetStatusNotice(
            "pending",
            (
              data.message ||
              "Your recovery request was submitted for administrator review."
            ) +
              " This screen will update automatically when the administrator reviews the request."
          );

          startOwnerPasswordResetStatusPolling(
            false
          );
        } catch (error) {
          console.error(
            "Owner password recovery request failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );
        } finally {
          submitOwnerPasswordResetRequestBtn.disabled =
            false;

          submitOwnerPasswordResetRequestBtn.textContent =
            "Send Request to Admin";
        }
      }
    );

    /* =========================
       OWNER FORCED PASSWORD CHANGE
    ========================= */

    saveOwnerNewPasswordBtn?.addEventListener(
      "click",
      async () => {
        const newPassword =
          ownerNewPassword?.value ||
          "";

        const confirmPassword =
          ownerConfirmNewPassword?.value ||
          "";

        setStaffMessage("");

        if (newPassword.length < 8) {
          setStaffMessage(
            "New password must contain at least 8 characters."
          );
          ownerNewPassword?.focus();
          return;
        }

        if (
          !/[A-Z]/.test(newPassword) ||
          !/[a-z]/.test(newPassword) ||
          !/\d/.test(newPassword)
        ) {
          setStaffMessage(
            "Use at least one uppercase letter, one lowercase letter, and one number."
          );
          ownerNewPassword?.focus();
          return;
        }

        if (newPassword !== confirmPassword) {
          setStaffMessage(
            "New password and confirmation do not match."
          );
          ownerConfirmNewPassword?.focus();
          return;
        }

        saveOwnerNewPasswordBtn.disabled =
          true;

        saveOwnerNewPasswordBtn.textContent =
          "Saving password...";

        try {
          const response =
            await fetch(
              `${window.API}/change_owner_temporary_password.php`,
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
                  new_password:
                    newPassword,
                  confirm_password:
                    confirmPassword
                })
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (!response.ok || !data.success) {
            setStaffMessage(
              data.message ||
              "Unable to save the new owner password."
            );

            if (data.login_required) {
              window.setTimeout(() => {
                showOwnerLoginView();
              }, 1400);
            }

            return;
          }

          if (ownerPassword) {
            ownerPassword.value =
              "";
          }

          showOwnerLoginView();

          setStaffMessage(
            data.message ||
            "New password saved. Log in again to continue.",
            "success"
          );
        } catch (error) {
          console.error(
            "Owner password change failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );
        } finally {
          saveOwnerNewPasswordBtn.disabled =
            false;

          saveOwnerNewPasswordBtn.textContent =
            "Save New Password";
        }
      }
    );

    ownerConfirmNewPassword?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveOwnerNewPasswordBtn?.click();
        }
      }
    );

    ownerResetReason?.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          submitOwnerPasswordResetRequestBtn?.click();
        }
      }
    );

    /* =========================
   VERIFY OWNER EMAIL CODE
========================= */

verifyOwnerCodeBtn?.addEventListener(
  "click",
  async () => {
    const code =
      ownerVerificationCode
        ?.value
        .replace(/\D/g, "")
        .slice(0, 6) || "";

    setStaffMessage("");

    if (code.length !== 6) {
      setStaffMessage(
        "Enter the complete 6-digit verification code."
      );

      ownerVerificationCode?.focus();

      return;
    }

    verifyOwnerCodeBtn.disabled =
      true;

    verifyOwnerCodeBtn.textContent =
      "Verifying...";

    try {
      const response =
        await fetch(
          `${window.API}/verify_owner_login_code.php`,
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
            code,

            trust_device:
              Boolean(
                trustOwnerDevice?.checked
    )
})
          }
        );

      const data =
        await readJsonResponse(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        setStaffMessage(
          data.message ||
          "The verification code is invalid."
        );

        if (data.login_required) {
          window.setTimeout(() => {
            showOwnerLoginView();
          }, 1200);
        }

        return;
      }

      if (!data.redirect_url) {
        throw new Error(
          "The server did not provide an owner destination."
        );
      }

      localStorage.setItem(
        "user_full_name",
        data.user?.full_name || ""
      );

      localStorage.setItem(
        "user_role",
        "owner"
      );

      setStaffMessage(
        "Owner verified. Redirecting...",
        "success"
      );

      window.setTimeout(() => {
        window.location.href =
          data.redirect_url;
      }, 500);
    } catch (error) {
      console.error(
        "Owner code verification failed:",
        error
      );

      setStaffMessage(
        "Unable to connect. Please check your connection and try again."
      );
    } finally {
      verifyOwnerCodeBtn.disabled =
        false;

      verifyOwnerCodeBtn.textContent =
        "Verify and Continue";
    }
  }
);

/* =========================
   RESEND OWNER EMAIL CODE
========================= */

resendOwnerCodeBtn?.addEventListener(
  "click",
  async () => {
    setStaffMessage("");

    resendOwnerCodeBtn.disabled =
      true;

    resendOwnerCodeBtn.textContent =
      "Sending...";

    try {
      const response =
        await fetch(
          `${window.API}/resend_owner_login_code.php`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );

      const data =
        await readJsonResponse(
          response
        );

      if (
        !response.ok ||
        !data.success
      ) {
        setStaffMessage(
          data.message ||
          "Unable to resend the code."
        );

        if (data.login_required) {
          window.setTimeout(() => {
            showOwnerLoginView();
          }, 1200);
        }

        return;
      }

      if (ownerVerificationCode) {
        ownerVerificationCode.value =
          "";

        ownerVerificationCode.focus();
      }

      setStaffMessage(
        data.message ||
        "A new code was sent.",
        "success"
      );
    } catch (error) {
      console.error(
        "Resend owner code failed:",
        error
      );

      setStaffMessage(
        "Unable to connect. Please check your connection and try again."
      );
    } finally {
      resendOwnerCodeBtn.disabled =
        false;

      resendOwnerCodeBtn.textContent =
        "Resend Code";
    }
  }
);

backToOwnerLoginBtn?.addEventListener(
  "click",
  showOwnerLoginView
);

ownerVerificationCode?.addEventListener(
  "input",
  () => {
    ownerVerificationCode.value =
      ownerVerificationCode.value
        .replace(/\D/g, "")
        .slice(0, 6);
  }
);

ownerVerificationCode?.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      verifyOwnerCodeBtn?.click();
    }
  }
);

    /* =========================
       STAFF LOGIN
    ========================= */

    staffLoginBtn?.addEventListener(
      "click",
      async () => {
        const email =
          staffEmail?.value.trim() ||
          "";

        const password =
          staffPassword?.value || "";

        const restaurantId =
          Number(
            staffRestaurantId?.value ||
            0
          );

        setStaffMessage("");

        if (!restaurantId) {
          setStaffMessage(
            "Select a restaurant."
          );

          return;
        }

        if (!email || !password) {
          setStaffMessage(
            "Enter email and password."
          );

          if (!email) {
            staffEmail?.focus();
          } else {
            staffPassword?.focus();
          }

          return;
        }

        staffLoginBtn.disabled =
          true;

        staffLoginBtn.textContent =
          "Logging in...";

        try {
          const response =
            await fetch(
              `${window.API}/staff_login.php`,
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

                  email,
                  password
                })
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            setStaffMessage(
              data.message ||
              "Invalid login credentials."
            );

            return;
          }

          if (data.must_change_password === true) {
            showStaffPasswordChangeView(
              String(
                data.user?.full_name || ""
              )
            );

            return;
          }

          const role =
            String(
              data.user?.role || ""
            ).toLowerCase();

          switch (role) {
            case "admin":
              setStaffMessage(
                "Login successful. Opening the admin dashboard...",
                "success"
              );

              window.setTimeout(() => {
                window.location.href =
                  "admin.html";
              }, 450);
              break;

            case "owner":
              setStaffMessage(
                "Restaurant owners must use the FoodConnect Partner Portal."
              );
              break;

            case "cashier":
              setStaffMessage(
                "Login successful. Opening the cashier dashboard...",
                "success"
              );

              window.setTimeout(() => {
                window.location.href =
                  "cashier_dashboard.html";
              }, 450);
              break;

            case "delivery_staff":
              setStaffMessage(
                "Login successful. Opening the delivery dashboard...",
                "success"
              );

              window.setTimeout(() => {
                window.location.href =
                  "delivery_dashboard.html";
              }, 450);
              break;

            default:
              setStaffMessage(
                "This account does not have an available dashboard."
              );
          }
        } catch (error) {
          console.error(
            "Staff login failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );
        } finally {
          staffLoginBtn.disabled =
            false;

          staffLoginBtn.textContent =
            "Login to Dashboard";
        }
      }
    );

    /* =========================
       STAFF PASSWORD RECOVERY
    ========================= */

    staffForgotPasswordBtn?.addEventListener(
      "click",
      () => {
        setStaffMessage(
          "Forgot your password? Contact your restaurant owner. The owner can issue a temporary password from Staff Management. FoodConnect never shows your current password.",
          "info"
        );
      }
    );

    backToStaffLoginFromPasswordBtn?.addEventListener(
      "click",
      () => {
        showStaffCredentialsView();
      }
    );

    saveStaffNewPasswordBtn?.addEventListener(
      "click",
      async () => {
        const newPassword =
          staffNewPassword?.value || "";

        const confirmPassword =
          staffConfirmNewPassword?.value || "";

        setStaffMessage("");

        if (newPassword.length < 8) {
          setStaffMessage(
            "New password must contain at least 8 characters."
          );
          staffNewPassword?.focus();
          return;
        }

        if (newPassword !== confirmPassword) {
          setStaffMessage(
            "New password and confirmation do not match."
          );
          staffConfirmNewPassword?.focus();
          return;
        }

        const originalText =
          saveStaffNewPasswordBtn.textContent;

        try {
          saveStaffNewPasswordBtn.disabled =
            true;

          saveStaffNewPasswordBtn.textContent =
            "Saving...";

          const response =
            await fetch(
              `${window.API}/change_staff_temporary_password.php`,
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
                  new_password:
                    newPassword,
                  confirm_password:
                    confirmPassword
                })
              }
            );

          const data =
            await readJsonResponse(
              response
            );

          if (
            !response.ok ||
            !data.success
          ) {
            setStaffMessage(
              data.message ||
              "Unable to update the password."
            );

            return;
          }

          setStaffMessage(
            "Password updated successfully. Opening your dashboard...",
            "success"
          );

          const role =
            String(
              data.user?.role || ""
            ).toLowerCase();

          window.setTimeout(() => {
            if (role === "cashier") {
              window.location.href =
                "cashier_dashboard.html";
              return;
            }

            if (
              role === "delivery_staff" ||
              role === "delivery_coordinator"
            ) {
              window.location.href =
                "delivery_dashboard.html";
              return;
            }

            setStaffMessage(
              "Password updated, but this account does not have an available dashboard."
            );
          }, 550);

        } catch (error) {
          console.error(
            "Staff password change failed:",
            error
          );

          setStaffMessage(
            "Unable to connect. Please check your connection and try again."
          );

        } finally {
          saveStaffNewPasswordBtn.disabled =
            false;

          saveStaffNewPasswordBtn.textContent =
            originalText;
        }
      }
    );

    /* =========================
       ENTER KEY SHORTCUTS
    ========================= */

    staffAccessCode?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          verifyStaffCodeBtn?.click();
        }
      }
    );

    staffEmail?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          staffPassword?.focus();
        }
      }
    );

    staffPassword?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          staffLoginBtn?.click();
        }
      }
    );

    staffNewPassword?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          staffConfirmNewPassword?.focus();
        }
      }
    );

    staffConfirmNewPassword?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveStaffNewPasswordBtn?.click();
        }
      }
    );

    ownerEmail?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          ownerPassword?.focus();
        }
      }
    );

    ownerPassword?.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          ownerLoginBtn?.click();
        }
      }
    );

    /* =========================
       URL LOGIN PROMPT
    ========================= */

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("login_required") ===
      "1"
    ) {
      openLoginModal();
    }

    /* =========================
   INITIALIZE HOMEPAGE
========================= */

setupAccountUI();

loadPublicRestaurants();

window.setInterval(
  updateAllRestaurantCards,
  60000
);

    // ===== Owner Password Toggle (Partner Portal) =====
if (ownerPassword && toggleOwnerPassword) {
  toggleOwnerPassword.addEventListener("click", function (e) {
    e.preventDefault();
    const icon = this.querySelector("i");
    if (ownerPassword.type === "password") {
      ownerPassword.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
      this.setAttribute("aria-label", "Hide password");
    } else {
      ownerPassword.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      this.setAttribute("aria-label", "Show password");
    }
  });
}

/* =========================================================
   RESTAURANTS PAGE SEARCH
========================================================= */

restaurantsPageSearchForm?.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const searchValue =
      restaurantsPageSearch?.value || "";

    filterRestaurantsPage(
      searchValue
    );

    const query =
      String(searchValue)
        .trim()
        .toLowerCase();

    if (!query) {
      return;
    }

    setTimeout(() => {

      const matchedCard =
        restaurantsPageCards.find(
          (card) => {

            const restaurantName =
              String(
                card.dataset.name || ""
              )
                .trim()
                .toLowerCase();

            return restaurantName === query;
          }
        );

      if (!matchedCard) {
        return;
      }

      matchedCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      matchedCard.classList.remove(
        "restaurant-search-pop"
      );

      void matchedCard.offsetWidth;

      matchedCard.classList.add(
        "restaurant-search-pop"
      );

      setTimeout(() => {

        matchedCard.classList.remove(
          "restaurant-search-pop"
        );

      }, 900);

    }, 150);

  }
);

restaurantsPageSearch?.addEventListener(
  "input",
  () => {

    filterRestaurantsPage(
      restaurantsPageSearch.value
    );

  }
);

/* =========================================================
   RESTAURANTS PAGE CATEGORIES
========================================================= */

restaurantsPageCategories.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const category =
          button.dataset.category || "";

        if (restaurantsPageSearch) {

          restaurantsPageSearch.value =
            category;

          filterRestaurantsPage(
            category
          );

        }

      }
    );

  }
);
  }
);
