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

    const staffLoginMsg =
      document.getElementById(
        "staffLoginMsg"
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

    const ownerLoginBtn =
      document.getElementById(
        "ownerLoginBtn"
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

    const restaurantCards = [
      ...document.querySelectorAll(
        ".restaurant-slide"
      )
    ];

    const restaurantLinks =
      document.querySelectorAll(
        ".restaurant-link"
      );

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

    function openLoginModal() {
      if (!loginModal) {
        return;
      }

      loginModal.style.display =
        "block";

      document.body.style.overflow =
        "hidden";
    }

    function closeLoginModal() {
      if (!loginModal) {
        return;
      }

      loginModal.style.display =
        "none";

      document.body.style.overflow =
        "";
    }

    /* =========================
       STAFF MESSAGE
    ========================= */

    function setStaffMessage(
      message = "",
      type = "error"
    ) {
      if (!staffLoginMsg) {
        return;
      }

      staffLoginMsg.textContent =
        message;

      staffLoginMsg.style.color =
        type === "success"
          ? "#65d68a"
          : "#ff777b";
    }

        /* =========================
       PORTAL VIEWS
    ========================= */

    function showStaffAccessView() {
      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "block";
      }

      if (ownerLoginBox) {
        ownerLoginBox.style.display =
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

      setStaffMessage("");

      window.setTimeout(() => {
        staffAccessCode?.focus();
      }, 50);
    }

    function showStaffCredentialsView() {
      if (staffCodeBox) {
        staffCodeBox.style.display =
          "none";
      }

      if (staffLoginBox) {
        staffLoginBox.style.display =
          "block";
      }

      setStaffMessage("");

      window.setTimeout(() => {
        staffEmail?.focus();
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
      if (staffAccessPanel) {
        staffAccessPanel.style.display =
          "none";
      }

      if (ownerVerificationBox) {
  ownerVerificationBox.style.display =
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

      setStaffMessage("");

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

      staffModal.style.display =
        "block";

      document.body.style.overflow =
        "hidden";

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

      if (ownerVerificationCode) {
  ownerVerificationCode.value = "";
}

      showStaffAccessView();
    }

    function closeStaffModal() {
      if (!staffModal) {
        return;
      }

      staffModal.style.display =
        "none";

      document.body.style.overflow =
        "";

      setStaffMessage("");

      staffAccessCard?.classList.remove(
        "partner-mode"
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
          "The server returned an invalid response."
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
    restaurantHours.textContent =
      `${formatTime(
        card.dataset.openingTime
      )} – ${formatTime(
        card.dataset.closingTime
      )}`;
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
          event.key.toLowerCase() ===
            "q"
        ) {
          event.preventDefault();

          openStaffModal();
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

    /* =========================
       OPEN RESTAURANT DIRECTLY
    ========================= */

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
        } catch (error) {
          console.error(
            "Staff access verification failed:",
            error
          );

          setStaffMessage(
            error.message ||
            "Cannot connect to server."
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
            error.message ||
            "Cannot connect to the server."
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
        error.message ||
        "Cannot connect to the server."
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
        error.message ||
        "Cannot connect to the server."
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

          const role =
            String(
              data.user?.role || ""
            ).toLowerCase();

          switch (role) {
            case "admin":
              window.location.href =
                "admin.html";
              break;

            case "owner":
              setStaffMessage(
                "Restaurant owners must use the FoodConnect Partner Portal."
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
            error.message ||
            "Cannot connect to server."
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

filterRestaurants();

updateAllRestaurantCards();

restaurantCards.forEach(card => {
  loadPublicRestaurantCard(card);
});

window.setInterval(
  updateAllRestaurantCards,
  60000
);
  }
);