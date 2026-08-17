let products = [];
let activeProductMode = "menu";

/*
 * The main Dashboard and Advanced Analytics
 * must not share the same chart state.
 */
let dashboardSalesData = [];
let reportSalesData = [];

let users = [];
let activityLogs = [];
let currentLogFilter = "all";
let salesReport = {
  summary: {},
  previousSummary: {},
  comparisons: {},

  bestProducts: [],
  bestCategories: [],

  cashierPerformance: [],
  deliveryPerformance: [],

  performanceRange: {
    value: "weekly",
    label: "Last 7 Days",
    previous_label: "Previous 7 Days"
  }
};


/* =========================
   ELEMENTS
========================= */
const navItems = document.querySelectorAll(".nav-item[data-section]");
const sections = document.querySelectorAll(".content-section");
const productsGrid = document.getElementById("productsGrid");
const productSearch = document.getElementById("productSearch");
const productCategoryFilter = document.getElementById("productCategoryFilter");
const productSort = document.getElementById("productSort");
const menuItemsTabBtn = document.getElementById("menuItemsTabBtn");
const addonsTabBtn = document.getElementById("addonsTabBtn");
const addonModal = document.getElementById("addonModal");
const addonModalTitle = document.getElementById("addonModalTitle");
const addonProductId = document.getElementById("addonProductId");
const addonName = document.getElementById("addonName");
const addonPrice = document.getElementById("addonPrice");
const addonStatus = document.getElementById("addonStatus");
const saveAddonBtn = document.getElementById("saveAddonBtn");
const productAddonChoiceList = document.getElementById("productAddonChoiceList");
const editProductAddonChoiceList = document.getElementById("editProductAddonChoiceList");
const lowStockList = document.getElementById("lowStockList");
const salesChart = document.getElementById("salesChart");
const salesRange = document.getElementById("salesRange");
const globalSearch = document.getElementById("globalSearch");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const logoutBtn = document.getElementById("logoutBtn");

const sidebarRestaurantLogo =
  document.getElementById(
    "sidebarRestaurantLogo"
  );

const profileRestaurantLogo =
  document.getElementById(
    "profileRestaurantLogo"
  );

const sidebarRestaurantName =
  document.getElementById(
    "sidebarRestaurantName"
  );

const ownerWelcomeMessage =
  document.getElementById(
    "ownerWelcomeMessage"
  );

const ownerProfileName =
  document.getElementById(
    "ownerProfileName"
  );

const profileRestaurantName =
  document.getElementById(
    "profileRestaurantName"
  );

  const goLivePanel =
  document.getElementById(
    "goLivePanel"
  );

const goLiveTitle =
  document.getElementById(
    "goLiveTitle"
  );

const goLiveMessage =
  document.getElementById(
    "goLiveMessage"
  );

const goLiveRequirements =
  document.getElementById(
    "goLiveRequirements"
  );

const applyGoLiveBtn =
  document.getElementById(
    "applyGoLiveBtn"
  );

const goLiveEyebrow =
  document.getElementById(
    "goLiveEyebrow"
  );

const goLiveStatusIcon =
  document.getElementById(
    "goLiveStatusIcon"
  );

const goLiveProgressText =
  document.getElementById(
    "goLiveProgressText"
  );

const goLiveProgressBar =
  document.getElementById(
    "goLiveProgressBar"
  );

const readinessChecklist =
  document.getElementById(
    "readinessChecklist"
  );

const readinessScore =
  document.getElementById(
    "readinessScore"
  );

const readinessCard =
  document.getElementById(
    "readinessCard"
  );

const readinessDescription =
  document.getElementById(
    "readinessDescription"
  );

const readinessToggleBtn =
  document.getElementById(
    "readinessToggleBtn"
  );

const readinessCompleteSummary =
  document.getElementById(
    "readinessCompleteSummary"
  );

const readinessCompleteMessage =
  document.getElementById(
    "readinessCompleteMessage"
  );

const addProductModal = document.getElementById("addProductModal");
const editProductModal = document.getElementById("editProductModal");
const restockModal = document.getElementById("restockModal");
const editProductImageInput =
  document.getElementById(
    "editProductImage"
  );

const editProductImagePreview =
  document.getElementById(
    "editProductImagePreview"
  );

const editProductImagePreviewImg =
  document.getElementById(
    "editProductImagePreviewImg"
  );

const removeExistingImageInput =
  document.getElementById(
    "removeExistingProductImage"
  );

  const staffAccessCodeDisplay =
  document.getElementById(
    "staffAccessCodeDisplay"
  );

const toggleStaffAccessCodeButton =
  document.getElementById(
    "toggleStaffAccessCode"
  );

  const staffAccessCodeEyeIcon =
    document.getElementById(
        "staffAccessCodeEyeIcon"
    );

const copyStaffAccessCodeButton =
  document.getElementById(
    "copyStaffAccessCode"
  );

const regenerateStaffAccessCodeButton =
  document.getElementById(
    "regenerateStaffAccessCode"
  );

const staffAccessCodeMessage =
  document.getElementById(
    "staffAccessCodeMessage"
  );

let currentStaffAccessCode = "";
let staffAccessCodeVisible = false;

editProductImageInput?.addEventListener(
  "change",
  () => {
    const file =
      editProductImageInput.files?.[0];

    if (!file) {
      return;
    }

    try {
      showImagePreview(
        file,
        editProductImagePreview,
        editProductImagePreviewImg
      );

      if (removeExistingImageInput) {
  removeExistingImageInput.value =
    "0";
}
    } catch (error) {
      alert(error.message);
      editProductImageInput.value = "";
    }
  }
);

document
  .getElementById(
    "removeEditProductImageBtn"
  )
  ?.addEventListener(
    "click",
    () => {
     if (editProductImageInput) {
  editProductImageInput.value = "";
}

if (editProductImagePreviewImg) {
  editProductImagePreviewImg.src =
    "";
}

if (editProductImagePreview) {
  editProductImagePreview.hidden =
    true;
}

if (removeExistingImageInput) {
  removeExistingImageInput.value =
    "1";
}
    }
  );
const openAddProductModal = document.getElementById("openAddProductModal");

const closeAddProductModal = document.getElementById("closeAddProductModal");
const closeEditProductModal = document.getElementById("closeEditProductModal");
const closeRestockModal = document.getElementById("closeRestockModal");
const productDiscountType =
  document.getElementById(
    "productDiscountType"
  );

const productDiscountFields =
  document.getElementById(
    "productDiscountFields"
  );

const productDiscountValue =
  document.getElementById(
    "productDiscountValue"
  );

const productDiscountValueHelp =
  document.getElementById(
    "productDiscountValueHelp"
  );

const productDiscountValueLabel =
  document.getElementById(
    "productDiscountValueLabel"
  );

const productDiscountScheduleHelp =
  document.getElementById(
    "productDiscountScheduleHelp"
  );

const productDiscountStatus =
  document.getElementById(
    "productDiscountStatus"
  );

const productDiscountSchedule =
  document.getElementById(
    "productDiscountSchedule"
  );

const productDiscountScheduleFields =
  document.getElementById(
    "productDiscountScheduleFields"
  );

const productDiscountStart =
  document.getElementById(
    "productDiscountStart"
  );

const productDiscountEnd =
  document.getElementById(
    "productDiscountEnd"
  );

const productDiscountOriginalPrice =
  document.getElementById(
    "productDiscountOriginalPrice"
  );

const productDiscountFinalPrice =
  document.getElementById(
    "productDiscountFinalPrice"
  );

const productDiscountSavings =
  document.getElementById(
    "productDiscountSavings"
  );
const productDiscountPreviewMessage =
  document.getElementById(
    "productDiscountPreviewMessage"
  );

/* =========================
   EDIT PRODUCT DISCOUNT
========================= */

const editProductDiscountType =
  document.getElementById(
    "editProductDiscountType"
  );

const editProductDiscountFields =
  document.getElementById(
    "editProductDiscountFields"
  );

const editProductDiscountValue =
  document.getElementById(
    "editProductDiscountValue"
  );

const editProductDiscountValueLabel =
  document.getElementById(
    "editProductDiscountValueLabel"
  );

const editProductDiscountValueHelp =
  document.getElementById(
    "editProductDiscountValueHelp"
  );

const editProductDiscountStatus =
  document.getElementById(
    "editProductDiscountStatus"
  );

const editProductDiscountSchedule =
  document.getElementById(
    "editProductDiscountSchedule"
  );

const editProductDiscountScheduleHelp =
  document.getElementById(
    "editProductDiscountScheduleHelp"
  );

const editProductDiscountScheduleFields =
  document.getElementById(
    "editProductDiscountScheduleFields"
  );

const editProductDiscountStart =
  document.getElementById(
    "editProductDiscountStart"
  );

const editProductDiscountEnd =
  document.getElementById(
    "editProductDiscountEnd"
  );

const editProductDiscountOriginalPrice =
  document.getElementById(
    "editProductDiscountOriginalPrice"
  );

const editProductDiscountFinalPrice =
  document.getElementById(
    "editProductDiscountFinalPrice"
  );

const editProductDiscountSavings =
  document.getElementById(
    "editProductDiscountSavings"
  );

const editProductDiscountPreviewMessage =
  document.getElementById(
    "editProductDiscountPreviewMessage"
  );

const saveProductBtn = document.getElementById("saveProductBtn");
const updateProductBtn = document.getElementById("updateProductBtn");
const saveRestockBtn = document.getElementById("saveRestockBtn");
const restockProduct =
  document.getElementById(
    "restockProduct"
  );

const restockQuantity =
  document.getElementById(
    "restockQuantity"
  );

const restockCurrentStock =
  document.getElementById(
    "restockCurrentStock"
  );

  const restockProductName =
    document.getElementById(
        "restockProductName"
    );

const restockProductMeta =
    document.getElementById(
        "restockProductMeta"
    );

const restockNewStock =
  document.getElementById(
    "restockNewStock"
  );

const restockFormMessage =
  document.getElementById(
    "restockFormMessage"
  );

const decreaseRestockQuantity =
  document.getElementById(
    "decreaseRestockQuantity"
  );

const increaseRestockQuantity =
  document.getElementById(
    "increaseRestockQuantity"
  );

const cancelRestockBtn =
  document.getElementById(
    "cancelRestockBtn"
  );
const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventorySearch = document.getElementById("inventorySearch");
const inventoryFilter = document.getElementById("inventoryFilter");
const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");

const clearInventoryFilters =
  document.getElementById(
    "clearInventoryFilters"
  );

const inventoryResultCount =
  document.getElementById(
    "inventoryResultCount"
  );
const usersTableBody = document.getElementById("usersTableBody");
const userSearch = document.getElementById("userSearch");
const userRoleFilter = document.getElementById("userRoleFilter");
const userStatusFilter = document.getElementById("userStatusFilter");

const addUserModal = document.getElementById("addUserModal");
const editUserModal = document.getElementById("editUserModal");

const openAddUserModal = document.getElementById("openAddUserModal");
const closeAddUserModal = document.getElementById("closeAddUserModal");
const closeEditUserModal = document.getElementById("closeEditUserModal");

const saveUserBtn = document.getElementById("saveUserBtn");
const updateUserBtn = document.getElementById("updateUserBtn");

const resetStaffPasswordModal =
  document.getElementById(
    "resetStaffPasswordModal"
  );

const closeResetStaffPasswordModalBtn =
  document.getElementById(
    "closeResetStaffPasswordModal"
  );

const cancelResetStaffPasswordBtn =
  document.getElementById(
    "cancelResetStaffPasswordBtn"
  );

const saveResetStaffPasswordBtn =
  document.getElementById(
    "saveResetStaffPasswordBtn"
  );

const resetStaffUserId =
  document.getElementById(
    "resetStaffUserId"
  );

const resetStaffUserName =
  document.getElementById(
    "resetStaffUserName"
  );

const resetStaffTemporaryPassword =
  document.getElementById(
    "resetStaffTemporaryPassword"
  );

const resetStaffConfirmPassword =
  document.getElementById(
    "resetStaffConfirmPassword"
  );

const logsList =
  document.getElementById(
    "logsList"
  );

const logFilter =
  document.getElementById(
    "logFilter"
  );

const activitySearch =
  document.getElementById(
    "activitySearch"
  );

const activityDateFilter =
  document.getElementById(
    "activityDateFilter"
  );

const clearActivityFilters =
  document.getElementById(
    "clearActivityFilters"
  );

const refreshActivityLogs =
  document.getElementById(
    "refreshActivityLogs"
  );

const activityResultCount =
  document.getElementById(
    "activityResultCount"
  );

const activityOverviewTotal =
  document.getElementById(
    "activityOverviewTotal"
  );

const activityOverviewOrders =
  document.getElementById(
    "activityOverviewOrders"
  );

const activityOverviewInventory =
  document.getElementById(
    "activityOverviewInventory"
  );

const activityOverviewStaff =
  document.getElementById(
    "activityOverviewStaff"
  );

const reportTotalRevenue =
  document.getElementById(
    "reportTotalRevenue"
  );

const reportTotalOrders =
  document.getElementById(
    "reportTotalOrders"
  );

const reportSalesRange =
  document.getElementById(
    "reportSalesRange"
  );

const reportSalesChart =
  document.getElementById(
    "reportSalesChart"
  );

const cancellationRate =
  document.getElementById(
    "cancellationRate"
  );

const itemsSold =
  document.getElementById(
    "itemsSold"
  );

const analyticsCurrentPeriod =
  document.getElementById(
    "analyticsCurrentPeriod"
  );

const analyticsPreviousPeriod =
  document.getElementById(
    "analyticsPreviousPeriod"
  );

const revenueComparison =
  document.getElementById(
    "revenueComparison"
  );

const ordersComparison =
  document.getElementById(
    "ordersComparison"
  );

const completedOrdersComparison =
  document.getElementById(
    "completedOrdersComparison"
  );

const averageOrderComparison =
  document.getElementById(
    "averageOrderComparison"
  );

const cancellationComparison =
  document.getElementById(
    "cancellationComparison"
  );

const itemsSoldComparison =
  document.getElementById(
    "itemsSoldComparison"
  );
const bestProductsList = document.getElementById("bestProductsList");
const bestCategoriesList = document.getElementById("bestCategoriesList");

const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

const cashierPerformanceRange =
  document.getElementById(
    "cashierPerformanceRange"
  );

const deliveryPerformanceRange =
  document.getElementById(
    "deliveryPerformanceRange"
  );

const cashierRangeLabel =
  document.getElementById(
    "cashierRangeLabel"
  );

const deliveryRangeLabel =
  document.getElementById(
    "deliveryRangeLabel"
  );

const cashierPerformanceBody =
  document.getElementById(
    "cashierPerformanceBody"
  );

const deliveryPerformanceBody =
  document.getElementById(
    "deliveryPerformanceBody"
  );

  const settingsLogoPath =
  document.getElementById(
    "settingsLogoPath"
  );

const settingsLogoInput =
  document.getElementById(
    "settingsLogoInput"
  );

const selectSettingsLogoBtn =
  document.getElementById(
    "selectSettingsLogoBtn"
  );

const removeSettingsLogoBtn =
  document.getElementById(
    "removeSettingsLogoBtn"
  );

const settingsLogoPreviewImage =
  document.getElementById(
    "settingsLogoPreviewImage"
  );

const settingsLogoPlaceholder =
  document.getElementById(
    "settingsLogoPlaceholder"
  );

const settingsLogoMessage =
  document.getElementById(
    "settingsLogoMessage"
  );

const settingsPreviewLogoImage =
  document.getElementById(
    "settingsPreviewLogoImage"
  );

const settingsPreviewLogoInitials =
  document.getElementById(
    "settingsPreviewLogoInitials"
  );
const settingsRestaurantName = document.getElementById("settingsRestaurantName");
const settingsContactNumber = document.getElementById("settingsContactNumber");
const settingsAddress = document.getElementById("settingsAddress");
const settingsOpeningHours = document.getElementById("settingsOpeningHours");
const settingsBusinessHours = document.getElementById("settingsBusinessHours");
const settingsApplyMondayHours = document.getElementById("settingsApplyMondayHours");
const settingsHoursError = document.getElementById("settingsHoursError");
const settingsDeliveryFee = document.getElementById("settingsDeliveryFee");
const settingsBusinessStatus =
  document.getElementById(
    "settingsBusinessStatus"
  );

const settingsAddressCount =
  document.getElementById(
    "settingsAddressCount"
  );

const saveSettingsBtn =
  document.getElementById(
    "saveSettingsBtn"
  );
const settingsFormMessage =
  document.getElementById(
    "settingsFormMessage"
  );
const settingsStatusRadios =
  document.querySelectorAll(
    'input[name="restaurantBusinessStatus"]'
  );

const settingsPreviewName =
  document.getElementById(
    "settingsPreviewName"
  );

const settingsPreviewStatus =
  document.getElementById(
    "settingsPreviewStatus"
  );

const settingsPreviewContact =
  document.getElementById(
    "settingsPreviewContact"
  );

const settingsPreviewAddress =
  document.getElementById(
    "settingsPreviewAddress"
  );

const settingsPreviewHours =
  document.getElementById(
    "settingsPreviewHours"
  );

const settingsPreviewFee =
  document.getElementById(
    "settingsPreviewFee"
  );

const settingsSaveState =
  document.getElementById(
    "settingsSaveState"
  );

const settingsSaveStateText =
  document.getElementById(
    "settingsSaveStateText"
  );

const settingsFormControls = [
  settingsRestaurantName,
  settingsContactNumber,
  settingsAddress,
  settingsOpeningHours,
  settingsDeliveryFee
].filter(Boolean);

let savedRestaurantSettings = null;
let restaurantSettingsLoading = false;

let readinessChecklistExpanded = false;


settingsLogoInput?.addEventListener(
  "change",
  event => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadSettingsLogo(file);
  }
);

selectSettingsLogoBtn?.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      settingsLogoInput?.click();
    }
  }
);

removeSettingsLogoBtn?.addEventListener(
  "click",
  removeSettingsLogo
);

settingsPreviewLogoImage?.addEventListener(
  "error",
  () => {
    settingsPreviewLogoImage.hidden =
      true;

    if (
      settingsPreviewLogoInitials
    ) {
      settingsPreviewLogoInitials.hidden =
        false;
    }
  }
);

settingsFormControls.forEach(control => {
  control.addEventListener(
    "input",
    () => {
      control.classList.remove(
        "is-invalid"
      );

      control.removeAttribute(
        "aria-invalid"
      );

      if (
        control ===
        settingsContactNumber
      ) {
        const normalizedContact =
          window.FoodConnectPhone.toLocalDigits(
            control.value
          );

        if (
          control.value !==
          normalizedContact
        ) {
          control.value =
            normalizedContact;
        }
      }

      if (
        control ===
        settingsAddress
      ) {
        updateSettingsAddressCounter();
      }

      handleSettingsChange();
    }
  );

  control.addEventListener(
    "change",
    handleSettingsChange
  );

  control.addEventListener(
    "blur",
    () => {
      if (
        control ===
        settingsRestaurantName ||
        control ===
        settingsOpeningHours
      ) {
        control.value =
          normalizeSettingsText(
            control.value
          );
      }

      if (
        control ===
        settingsAddress
      ) {
        control.value =
          normalizeSettingsAddress(
            control.value
          );

        updateSettingsAddressCounter();
      }

      handleSettingsChange();
    }
  );
});

settingsStatusRadios.forEach(radio => {
  radio.addEventListener(
    "change",
    () => {
      if (!radio.checked) {
        return;
      }

      if (settingsBusinessStatus) {
        settingsBusinessStatus.value =
          radio.value;
      }

      handleSettingsChange();
    }
  );
});

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener(
    "click",
    saveRestaurantSettings
  );
}


/* =========================
   FORMAT
========================= */
function formatPeso(value) {
  return `₱${(Number(value) || 0).toLocaleString()}`;
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase();
}

function formatCompletionRate(value) {
  const rate = Math.max(
    0,
    Math.min(
      100,
      Number(value) || 0
    )
  );

  return rate;
}

function normalizeStatus(status) {
  const s = String(status || "").toLowerCase().trim();

  if (s === "pending") return "Pending";
  if (s === "preparing") return "Preparing";
  if (s === "done" || s === "completed") return "Completed";
  if (s === "cancelled" || s === "canceled") return "Cancelled";

  return "Pending";
}

function getStatusClass(status) {
  return "status-" + normalizeStatus(status).replace(/\s+/g, "-");
}

function getStockLevel(stock) {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "good";
}

function getProductDiscountLabel(
  product
) {
  if (!product) {
    return "";
  }

  const discountType =
    String(
      product.discountType ||
      "none"
    )
      .trim()
      .toLowerCase();

  const discountValue =
    Number(
      product.discountValue
    ) || 0;

  if (discountValue <= 0) {
    return "";
  }

  if (
    discountType ===
    "percentage"
  ) {
    return `${discountValue}% OFF`;
  }

  if (
    discountType ===
    "fixed"
  ) {
    return `${formatPeso(
      discountValue
    )} OFF`;
  }

  return "";
}

function getStockLabel(stock) {
  const quantity =
    Math.max(
      0,
      Number(stock) || 0
    );

  if (quantity <= 0) {
    return "Out of Stock";
  }

  if (quantity <= 5) {
    return "Restock Soon";
  }

  return "In Stock";
}

function sortInventoryList(list) {
  return [...list].sort((a, b) => {
    const priority = stock => {
      if (stock <= 0) return 1;
      if (stock <= 5) return 2;
      return 3;
    };

    const stockSort = priority(a.stock) - priority(b.stock);
    if (stockSort !== 0) return stockSort;

    return a.stock - b.stock;
  });
}

function updateInventoryResultCount(
  count
) {
  if (!inventoryResultCount) {
    return;
  }

  const safeCount =
    Math.max(
      0,
      Number(count) || 0
    );

  inventoryResultCount.textContent =
    `${safeCount} ${
      safeCount === 1
        ? "product"
        : "products"
    }`;
}

clearInventoryFilters?.addEventListener(
  "click",
  () => {
    if (inventorySearch) {
      inventorySearch.value = "";
    }

    if (inventoryFilter) {
      inventoryFilter.value = "all";
    }

    if (inventoryCategoryFilter) {
      inventoryCategoryFilter.value =
        "all";
    }

  applyInventoryFilters();
  }
);

async function loadActivityLogs() {
  if (logsList) {
    logsList.innerHTML = `
      <div class="activity-loading-state">
        Loading activity logs...
      </div>
    `;
  }

  try {
    const data = await fetchJSON(
      `${OWNER_API_BASE}/get_activity_logs.php`
    );

    if (
      !data.success ||
      !Array.isArray(data.logs)
    ) {
      activityLogs = [];
      renderActivityLogs();
      return;
    }

    activityLogs =
      data.logs.map(log => ({
        id:
          Number(log.log_id) || 0,

        type:
          String(
            log.action_type ||
            "system"
          )
            .trim()
            .toLowerCase(),

        icon:
          getActivityIcon(
            log.action_type
          ),

        title:
          String(
            log.action_title ||
            "Activity Recorded"
          ).trim(),

        message:
          String(
            log.action_description ||
            "No additional details."
          ).trim(),

        role:
          String(
            log.user_role ||
            "System"
          ).trim(),

        userId:
          log.user_id !== null
            ? Number(log.user_id)
            : null,

        isRead:
          Number(log.is_read) === 1,

        createdAt:
          log.created_at || null,

        time:
          formatLogTime(
            log.created_at
          )
      }));

    renderActivityLogs();

  } catch (error) {
    console.error(
      "Load activity logs failed:",
      error
    );

    activityLogs = [];

    if (logsList) {
      logsList.innerHTML = `
        <div class="empty-logs">
          <div class="empty-logs-icon">
            !
          </div>

          <h3>
            Unable to load activities
          </h3>

          <p>
            ${escapeHtml(
              error.message ||
              "Please refresh the page and try again."
            )}
          </p>
        </div>
      `;
    }
  }
}

function getActivityIcon(type) {
  const normalizedType =
    String(type || "")
      .trim()
      .toLowerCase();

if (normalizedType === "order") {
  return "✕";
}

  if (normalizedType === "product") {
    return "🍽️";
  }

  if (normalizedType === "inventory") {
    return "📦";
  }

  if (normalizedType === "staff") {
    return "👤";
  }

  if (normalizedType === "payment") {
    return "₱";
  }

  if (normalizedType === "settings") {
    return "⚙";
  }

  return "⚙️";
}

function parseActivityDate(
  dateValue
) {
  if (!dateValue) {
    return null;
  }

  const normalizedValue =
    String(dateValue)
      .trim()
      .replace(" ", "T");

  const date =
    new Date(normalizedValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatLogTime(
  dateValue
) {
  const date =
    parseActivityDate(
      dateValue
    );

  if (!date) {
    return "Recently";
  }

  return date.toLocaleTimeString(
    "en-PH",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }
  );
}

function getActivityDateKey(
  dateValue
) {
  const date =
    parseActivityDate(
      dateValue
    );

  if (!date) {
    return "unknown";
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0")
  ].join("-");
}

function getActivityDateLabel(
  dateValue
) {
  const date =
    parseActivityDate(
      dateValue
    );

  if (!date) {
    return "Earlier";
  }

  const today =
    new Date();

  const todayStart =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  const activityStart =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const difference =
    Math.round(
      (
        todayStart -
        activityStart
      ) /
      86400000
    );

  if (difference === 0) {
    return "Today";
  }

  if (difference === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );
}

async function saveActivityLog(
  type,
  title,
  description
) {
  try {
    const result =
      await fetchJSON(
        `${OWNER_API_BASE}/add_activity_log.php`,
        {
          method: "POST",
          body: JSON.stringify({
            action_type: type,
            action_title: title,
            action_description:
              description
          })
        }
      );

    if (!result.success) {
      throw new Error(
        result.message ||
        "The activity log was not saved."
      );
    }

    return true;

  } catch (error) {
    console.error(
      "Save activity log failed:",
      error
    );

    return false;
  }
}

/* =========================
   FETCH
========================= */

/* =========================
   API CONFIGURATION
========================= */

const OWNER_API_BASE = "/FoodConnect/api";

/* =========================
   OWNER AND RESTAURANT IDENTITY
========================= */

function showOwnerIdentityError(
  message
) {
  document.title =
    "Owner Dashboard | FoodConnect";

  if (sidebarRestaurantName) {
    sidebarRestaurantName.textContent =
      "Restaurant";
  }

  if (profileRestaurantName) {
    profileRestaurantName.textContent =
      "Restaurant unavailable";
  }

  if (ownerProfileName) {
    ownerProfileName.textContent =
      "Owner";
  }

  if (ownerWelcomeMessage) {
    ownerWelcomeMessage.textContent =
      message ||
      "Unable to load account information.";
  }
}

async function loadOwnerIdentity() {
  try {
    const response = await fetch(
      `${OWNER_API_BASE}/me.php`,
      {
        credentials: "include",
        cache: "no-store"
      }
    );

    const rawText =
      await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      throw new Error(
        "Unable to load your account right now. Please try again."
      );
    }

    if (
      !response.ok ||
      !data.logged_in
    ) {
      window.location.href =
        "/FoodConnect/frontend/html/index.html";

      return false;
    }

    const user =
      data.user || {};

    const restaurant =
      data.restaurant || {};

    const role =
      String(
        user.role || ""
      )
        .trim()
        .toLowerCase();

    if (role !== "owner") {
      throw new Error(
        "This account is not authorized to access the Owner Dashboard."
      );
    }

    if (
      data.onboarding_required ||
      !restaurant.restaurant_id
    ) {
      window.location.href =
        data.owner_redirect_url ||
        "/FoodConnect/frontend/html/create_restaurant.html";

      return false;
    }

    const ownerName =
      String(
        user.full_name ||
        "Restaurant Owner"
      ).trim();

    const restaurantName =
      String(
        restaurant.name ||
        "Restaurant"
      ).trim();

    document.title =
      `${restaurantName} | Owner Dashboard`;

    if (sidebarRestaurantName) {
      sidebarRestaurantName.textContent =
        restaurantName;
    }

    if (profileRestaurantName) {
      profileRestaurantName.textContent =
        restaurantName;
    }

    if (ownerProfileName) {
      ownerProfileName.textContent =
        ownerName;
    }

    if (ownerWelcomeMessage) {
      ownerWelcomeMessage.textContent =
        `Welcome back, ${ownerName}`;
    }

    return true;
  } catch (error) {
    console.error(
      "Load owner identity failed:",
      error
    );

    showOwnerIdentityError(
      error.message
    );

    return false;
  }
}
function normalizeOwnerApiUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    throw new Error("An API URL is required.");
  }

  /*
   * Convert old hardcoded localhost or 127.0.0.1 URLs
   * into same-origin URLs.
   *
   * This preserves the current browser hostname and
   * prevents PHP session cookies from being lost.
   */
  return value.replace(
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/FoodConnect\/api/i,
    OWNER_API_BASE
  );
}

/* =========================
   FETCH
========================= */
async function fetchJSON(
  url,
  options = {}
) {
  const requestUrl =
    normalizeOwnerApiUrl(url);

  const isFormData =
    options.body instanceof FormData;

  const requestHeaders = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (!isFormData) {
    requestHeaders["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    requestUrl,
    {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders
    }
  );

  const text =
    await response.text();

  let data;

  try {
    data =
      text
        ? JSON.parse(text)
        : {};
  } catch (error) {
    console.error(
      "Invalid JSON response:",
      requestUrl,
      text
    );

    throw new Error(
      "Something went wrong. Please try again."
    );
  }

  if (!response.ok) {
    console.error(
      `API error ${response.status}:`,
      requestUrl,
      data
    );

    throw new Error(
      data.message ||
      `Request failed with status ${response.status}.`
    );
  }

  return data;
}

/* =========================
   DASHBOARD SUMMARY
========================= */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openDashboardSection(
  sectionId
) {
  const matchingNav =
    document.querySelector(
      `.nav-item[data-section="${sectionId}"]`
    );

  if (matchingNav) {
    matchingNav.click();
  }
}

function updateReadinessCollapseState(
  isComplete
) {
  if (
    !readinessChecklist ||
    !readinessToggleBtn ||
    !readinessCompleteSummary
  ) {
    return;
  }

  if (!isComplete) {
    readinessChecklistExpanded = true;

    readinessChecklist.hidden = false;
    readinessCompleteSummary.hidden = true;
    readinessToggleBtn.hidden = true;

    if (readinessCard) {
      readinessCard.classList.remove(
        "is-complete",
        "is-expanded"
      );
    }

    return;
  }

  readinessCompleteSummary.hidden = false;
  readinessToggleBtn.hidden = false;

  readinessChecklist.hidden =
    !readinessChecklistExpanded;

  readinessToggleBtn.textContent =
    readinessChecklistExpanded
      ? "Hide checklist"
      : "View checklist";

  readinessToggleBtn.setAttribute(
    "aria-expanded",
    readinessChecklistExpanded
      ? "true"
      : "false"
  );

  if (readinessCard) {
    readinessCard.classList.add(
      "is-complete"
    );

    readinessCard.classList.toggle(
      "is-expanded",
      readinessChecklistExpanded
    );
  }
}

function renderReadinessChecklist(
  readiness = {}
) {
  const items =
    Array.isArray(readiness.items)
      ? readiness.items
      : [];

  const percentage = Math.max(
    0,
    Math.min(
      100,
      Number(readiness.percentage) || 0
    )
  );

  const readyToApply =
  Boolean(
    readiness.ready_to_apply
  );

const requiredCompleted =
  Number(
    readiness.required_completed
  ) || 0;

const requiredTotal =
  Number(
    readiness.required_total
  ) || 0;

const allRequirementsComplete =
  readyToApply &&
  requiredTotal > 0 &&
  requiredCompleted >= requiredTotal;

 if (readinessScore) {
  readinessScore.textContent =
    `${percentage}%`;
}

if (readinessDescription) {
  const restaurantIsLive =
    goLivePanel?.classList.contains(
      "is-live"
    );

  if (allRequirementsComplete) {
    readinessDescription.textContent =
      restaurantIsLive
        ? "Your restaurant setup and operational requirements are complete."
        : "All required setup items are complete. You may now submit your restaurant for administrator review.";
  } else if (restaurantIsLive) {
    readinessDescription.textContent =
      "Keep these restaurant details complete so customers receive accurate menu, stock, delivery, and operating information.";
  } else {
    readinessDescription.textContent =
      "Complete the required items below before submitting your restaurant for administrator review.";
  }
}

if (readinessCompleteMessage) {
  readinessCompleteMessage.textContent =
    `All ${requiredTotal} required setup item${
      requiredTotal === 1
        ? ""
        : "s"
    } are complete.`;
}

  if (!readinessChecklist) {
    return;
  }

  if (!items.length) {
    readinessChecklist.innerHTML = `
      <div class="readiness-loading">
        The readiness checklist is currently unavailable.
      </div>
    `;

    return;
  }

  readinessChecklist.innerHTML =
    items
      .map((item) => {
        const completed =
          Boolean(item.completed);

        const required =
          Boolean(item.required);

        const targetSection =
          String(
            item.target_section ||
            "dashboardSection"
          );

        const label =
          escapeHtml(
            item.label ||
            "Setup item"
          );

        const description =
          escapeHtml(
            item.description || ""
          );

        const safeTarget =
          escapeHtml(targetSection);

        return `
          <article class="readiness-item ${
            completed
              ? "is-complete"
              : ""
          }">
            <span
              class="readiness-check"
              aria-hidden="true"
            >
              ${completed ? "✓" : "!"}
            </span>

            <div class="readiness-content">
              <strong>
                ${label}
              </strong>

              <p>
                ${description}
              </p>

              ${
                !completed
                  ? `
                    <button
                      type="button"
                      class="readiness-action"
                      data-readiness-target="${safeTarget}"
                    >
                      Complete this step →
                    </button>
                  `
                  : ""
              }
            </div>

            <span class="readiness-tag">
              ${
                required
                  ? "Required"
                  : "Optional"
              }
            </span>
          </article>
        `;
      })
      .join("");

 readinessChecklist
  .querySelectorAll(
    "[data-readiness-target]"
  )
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        openDashboardSection(
          button.dataset
            .readinessTarget
        );
      }
    );
  });

updateReadinessCollapseState(
  allRequirementsComplete
);
}

function renderGoLiveStatus(
  restaurant,
  readiness = {}
) {
  if (
    !goLivePanel ||
    !goLiveTitle ||
    !goLiveMessage ||
    !applyGoLiveBtn
  ) {
    return;
  }

  const applicationStatus =
    String(
      restaurant
        ?.application_status ||
      "draft"
    )
      .trim()
      .toLowerCase();

  const visibility =
    String(
      restaurant
        ?.customer_visibility ||
      "Hidden"
    )
      .trim()
      .toLowerCase();

  const readyToApply =
    Boolean(
      readiness.ready_to_apply
    );

  const percentage = Math.max(
    0,
    Math.min(
      100,
      Number(
        readiness.percentage
      ) || 0
    )
  );

  const requiredCompleted =
    Number(
      readiness.required_completed
    ) || 0;

  const requiredTotal =
    Number(
      readiness.required_total
    ) || 0;

  const blockers =
    Array.isArray(
      readiness.blockers
    )
      ? readiness.blockers
      : [];

  goLivePanel.classList.remove(
    "is-live",
    "is-review",
    "is-warning",
    "is-rejected"
  );

  if (goLiveProgressText) {
    goLiveProgressText.textContent =
      `${requiredCompleted} of ${requiredTotal} completed`;
  }

  if (goLiveProgressBar) {
    goLiveProgressBar.style.width =
      `${percentage}%`;
  }

  applyGoLiveBtn.hidden = true;
  applyGoLiveBtn.disabled = false;

  if (visibility === "visible") {
    goLivePanel.classList.add(
      "is-live"
    );

    if (goLiveEyebrow) {
      goLiveEyebrow.textContent =
        "Approved / Live";
    }

    if (goLiveStatusIcon) {
      goLiveStatusIcon.textContent =
        "✓";
    }

    goLiveTitle.textContent =
      "Your Restaurant Is Live";

    goLiveMessage.textContent =
      "Customers can discover your restaurant and place orders.";

    if (goLiveRequirements) {
      goLiveRequirements.textContent =
        "Next action: keep your menu, stock, operating hours, delivery settings, and staff information accurate.";
    }

    return;
  }

  if (
    applicationStatus ===
    "submitted"
  ) {
    goLivePanel.classList.add(
      "is-review"
    );

    if (goLiveEyebrow) {
      goLiveEyebrow.textContent =
        "Under Review";
    }

    if (goLiveStatusIcon) {
      goLiveStatusIcon.textContent =
        "…";
    }

    goLiveTitle.textContent =
      "Administrator Review in Progress";

    goLiveMessage.textContent =
      "Your restaurant remains private while FoodConnect reviews the submitted information and menu.";

    if (goLiveRequirements) {
      goLiveRequirements.textContent =
        "Next action: continue preparing your restaurant. You will be notified when the application is approved, requires changes, or is rejected.";
    }

    return;
  }

  if (
    applicationStatus ===
    "needs_changes"
  ) {
    goLivePanel.classList.add(
      "is-warning"
    );

    if (goLiveEyebrow) {
      goLiveEyebrow.textContent =
        "Changes Required";
    }

    if (goLiveStatusIcon) {
      goLiveStatusIcon.textContent =
        "!";
    }

    goLiveTitle.textContent =
      "Update Your Restaurant Before Resubmitting";

    goLiveMessage.textContent =
      restaurant?.rejection_reason ||
      "The administrator requested changes before your restaurant can go live.";

    if (goLiveRequirements) {
      goLiveRequirements.textContent =
        readyToApply
          ? "Next action: review the administrator feedback, complete the requested changes, and resubmit for review."
          : `Next action: complete the remaining required setup item${
              blockers.length === 1
                ? ""
                : "s"
            }: ${blockers.join(", ")}.`;
    }

    applyGoLiveBtn.textContent =
      "Resubmit for Review";

    applyGoLiveBtn.hidden = false;

    applyGoLiveBtn.disabled =
      !readyToApply;

    return;
  }

  if (
    applicationStatus ===
    "rejected"
  ) {
    goLivePanel.classList.add(
      "is-rejected"
    );

    if (goLiveEyebrow) {
      goLiveEyebrow.textContent =
        "Rejected";
    }

    if (goLiveStatusIcon) {
      goLiveStatusIcon.textContent =
        "×";
    }

    goLiveTitle.textContent =
      "Go-Live Application Rejected";

    goLiveMessage.textContent =
      restaurant?.rejection_reason ||
      "The administrator rejected this restaurant application.";

    if (goLiveRequirements) {
      goLiveRequirements.textContent =
        "Review the reason above. This application cannot currently be resubmitted through the dashboard.";
    }

    return;
  }

  if (goLiveEyebrow) {
    goLiveEyebrow.textContent =
      "Private Setup";
  }

  if (goLiveStatusIcon) {
    goLiveStatusIcon.textContent =
      readyToApply
        ? "✓"
        : "●";
  }

  goLiveTitle.textContent =
    readyToApply
      ? "Your Restaurant Is Ready for Review"
      : "Complete Your Private Restaurant Setup";

  goLiveMessage.textContent =
    readyToApply
      ? "All required setup items are complete. Your restaurant is still hidden until an administrator approves it."
      : "Your restaurant is hidden from customers while you prepare its information, menu, inventory, and settings.";

  if (goLiveRequirements) {
    goLiveRequirements.textContent =
      readyToApply
        ? "Next action: submit your restaurant for administrator review."
        : `Next action: complete ${
            blockers.length
          } remaining required item${
            blockers.length === 1
              ? ""
              : "s"
          }.`;
  }

  applyGoLiveBtn.textContent =
    "Apply to Go Live";

  applyGoLiveBtn.hidden = false;

  applyGoLiveBtn.disabled =
    !readyToApply;
}

/* =========================
   DASHBOARD SUMMARY
========================= */

async function loadDashboardSummary() {
  const salesToday =
    document.getElementById(
      "salesToday"
    );

  const totalOrders =
    document.getElementById(
      "totalOrders"
    );

  const pendingOrders =
    document.getElementById(
      "pendingOrders"
    );

  const totalProducts =
    document.getElementById(
      "totalProducts"
    );

  const availableProducts =
    document.getElementById(
      "availableProducts"
    );

  const dashboardLowStock =
    document.getElementById(
      "dashboardLowStock"
    );

  const dashboardOutOfStock =
    document.getElementById(
      "dashboardOutOfStock"
    );

  const activeStaff =
    document.getElementById(
      "activeStaff"
    );

  try {
    const data =
      await fetchJSON(
        `${OWNER_API_BASE}/get_dashboard_summary.php`
      );

    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to load the dashboard right now. Please try again."
      );
    }

    if (salesToday) {
      salesToday.textContent =
        formatPeso(
          data.salesToday || 0
        );
    }

    if (totalOrders) {
      totalOrders.textContent =
        Number(
          data.totalOrders
        ) || 0;
    }

    if (pendingOrders) {
      pendingOrders.textContent =
        Number(
          data.pendingOrders
        ) || 0;
    }

    if (totalProducts) {
      totalProducts.textContent =
        Number(
          data.totalProducts
        ) || 0;
    }

    if (availableProducts) {
      availableProducts.textContent =
        Number(
          data.availableProducts
        ) || 0;
    }

    if (dashboardLowStock) {
      dashboardLowStock.textContent =
        Number(
          data.lowStockProducts
        ) || 0;
    }

    if (dashboardOutOfStock) {
      dashboardOutOfStock.textContent =
        Number(
          data.outOfStockProducts
        ) || 0;
    }

    if (activeStaff) {
      activeStaff.textContent =
        Number(
          data.activeStaff
        ) || 0;
    }

    renderReadinessChecklist(
      data.readiness || {}
    );

    renderGoLiveStatus(
      data.restaurant || {},
      data.readiness || {}
    );

  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    if (readinessChecklist) {
      readinessChecklist.innerHTML = `
        <div class="readiness-loading">
          Unable to load the restaurant
          readiness checklist.
        </div>
      `;
    }

    if (goLiveMessage) {
      goLiveMessage.textContent =
        "The dashboard summary could not be loaded. Please refresh the page.";
    }
  }
}

async function submitGoLiveApplication() {
  if (!applyGoLiveBtn) {
    return;
  }

  const confirmed = window.confirm(
    "Submit your restaurant for administrator review? Your restaurant will remain hidden until it is approved."
  );

  if (!confirmed) {
    return;
  }

  const originalText =
    applyGoLiveBtn.textContent;

  applyGoLiveBtn.disabled = true;
  applyGoLiveBtn.textContent =
    "Submitting...";

  try {
    const result = await fetchJSON(
      `${OWNER_API_BASE}/submit_restaurant_go_live.php`,
      {
        method: "POST",
        body: JSON.stringify({})
      }
    );

    alert(
      result.message ||
      "Restaurant submitted for review."
    );

    await Promise.all([
      loadDashboardSummary(),
      loadActivityLogs()
    ]);
  } catch (error) {
    console.error(
      "Go-live submission failed:",
      error
    );

    alert(
      error.message ||
      "Unable to submit the restaurant for review. Please try again."
    );

    applyGoLiveBtn.disabled = false;
    applyGoLiveBtn.textContent =
      originalText;
  }
}

if (applyGoLiveBtn) {
  applyGoLiveBtn.addEventListener(
    "click",
    submitGoLiveApplication
  );
}

if (readinessToggleBtn) {
  readinessToggleBtn.addEventListener(
    "click",
    () => {
      readinessChecklistExpanded =
        !readinessChecklistExpanded;

      updateReadinessCollapseState(
        true
      );
    }
  );
}

/* =========================
   PRODUCTS
========================= */
async function loadProducts() {
  const data = await fetchJSON("http://localhost/FoodConnect/api/get_products.php");
  const list = Array.isArray(data) ? data : data.products || [];

 products = list.map(p => {
  const regularPrice =
    Number(
      p.regular_price ??
      p.price
    ) || 0;

  const finalPrice =
    Number(
      p.final_price ??
      p.discounted_price ??
      regularPrice
    ) || regularPrice;

  return {
    id:
      p.product_id ||
      p.id,

    name:
      p.product_name ||
      p.name ||
      "Unnamed Product",

    category:
      p.category ||
      "Uncategorized",

    description:
      String(
        p.description || ""
      ).trim(),

    itemType:
      String(p.item_type || "menu_item").trim().toLowerCase() === "add_on"
        ? "add_on"
        : "menu_item",

    addonIds:
      Array.isArray(p.addon_ids)
        ? p.addon_ids.map(Number).filter(id => Number.isInteger(id) && id > 0)
        : [],

    size:
      p.size || "",

    price:
      regularPrice,

    regularPrice:
      regularPrice,

    finalPrice:
      finalPrice,

    discountSavings:
      Number(
        p.discount_savings
      ) || 0,

    discountType:
      String(
        p.discount_type ||
        "none"
      )
        .trim()
        .toLowerCase(),

    discountValue:
      Number(
        p.discount_value
      ) || 0,

    discountSchedule:
      String(
        p.discount_schedule ||
        "permanent"
      )
        .trim()
        .toLowerCase(),

    discountStart:
      p.discount_start ||
      null,

    discountEnd:
      p.discount_end ||
      null,

    discountStatus:
      String(
        p.discount_status ||
        "Inactive"
      ).trim(),

    isDiscountActive:
  p.is_discount_active === true ||
  p.is_discount_active === 1 ||
  String(
    p.is_discount_active
  )
    .trim()
    .toLowerCase() === "true" ||
  String(
    p.is_discount_active
  ).trim() === "1",

    stock:
      Number(
        p.stock
      ) || 0,

    status:
      String(
        p.status || ""
      ).trim() ||
      (
        Number(p.stock) > 0
          ? "Available"
          : "Unavailable"
      ),

    image:
      p.image_path ||
      p.image ||
      p.image_url ||
      ""
  };
});

  populateProductCategories();
  applyProductFilters();
  renderLowStock();
  populateInventoryCategories();
  applyInventoryFilters();
  renderAddonChoiceLists();
}

/* =========================
   STAFF ACCESS CODE
========================= */

function showStaffAccessCodeMessage(
  message = "",
  type = ""
) {
  if (!staffAccessCodeMessage) {
    return;
  }

  staffAccessCodeMessage.textContent =
    message;

  staffAccessCodeMessage.classList.remove(
    "success",
    "error",
    "info"
  );

  staffAccessCodeMessage.hidden =
    message === "";

  if (message && type) {
    staffAccessCodeMessage.classList.add(
      type
    );
  }
}

function renderStaffAccessCode() {
  if (!staffAccessCodeDisplay) {
    return;
  }

  if (!currentStaffAccessCode) {
    staffAccessCodeDisplay.textContent =
      "No code available";

    if (copyStaffAccessCodeButton) {
      copyStaffAccessCodeButton.disabled =
        true;
    }

    return;
  }

  staffAccessCodeDisplay.textContent =
    staffAccessCodeVisible
      ? currentStaffAccessCode
      : "••••-••••-••••";

 if (
  staffAccessCodeEyeIcon &&
  toggleStaffAccessCodeButton
) {
  staffAccessCodeEyeIcon.innerHTML =
    staffAccessCodeVisible
      ? `
          <path
            d="M3 3l18 18"
          ></path>

          <path
            d="M10.6 10.7a2 2 0 0 0 2.7 2.7"
          ></path>

          <path
            d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2"
          ></path>

          <path
            d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9"
          ></path>
        `
      : `
          <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          ></path>

          <circle
            cx="12"
            cy="12"
            r="3"
          ></circle>
        `;

  toggleStaffAccessCodeButton.setAttribute(
    "aria-label",
    staffAccessCodeVisible
      ? "Hide staff access code"
      : "Show staff access code"
  );

  toggleStaffAccessCodeButton.title =
    staffAccessCodeVisible
      ? "Hide staff access code"
      : "Show staff access code";
}

  if (copyStaffAccessCodeButton) {
    copyStaffAccessCodeButton.disabled =
      false;
  }
}

async function loadStaffAccessCode() {
  if (!staffAccessCodeDisplay) {
    return;
  }

  staffAccessCodeDisplay.textContent =
    "Loading...";

  showStaffAccessCodeMessage();

  try {
    const data = await fetchJSON(
      `${OWNER_API_BASE}/manage_staff_access_code.php`,
      {
        method: "GET"
      }
    );

    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to load the staff access code."
      );
    }

    currentStaffAccessCode =
      String(
        data.staff_access_code || ""
      ).trim();

    staffAccessCodeVisible = false;

    renderStaffAccessCode();

  } catch (error) {
    console.error(
      "Staff access code load error:",
      error
    );

    currentStaffAccessCode = "";

    staffAccessCodeDisplay.textContent =
      "Unable to load the staff access code";

    showStaffAccessCodeMessage(
      error.message ||
      "Unable to load the staff access code.",
      "error"
    );
  }
}

toggleStaffAccessCodeButton
  ?.addEventListener(
    "click",
    () => {
      if (!currentStaffAccessCode) {
        return;
      }

      staffAccessCodeVisible =
        !staffAccessCodeVisible;

      renderStaffAccessCode();
    }
  );

copyStaffAccessCodeButton
  ?.addEventListener(
    "click",
    async () => {
      if (!currentStaffAccessCode) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          currentStaffAccessCode
        );

        showStaffAccessCodeMessage(
          "Staff access code copied.",
          "success"
        );

      } catch (error) {
        console.error(
          "Copy staff code error:",
          error
        );

        showStaffAccessCodeMessage(
          "Unable to copy automatically. Show the code and copy it manually.",
          "error"
        );
      }
    }
  );

regenerateStaffAccessCodeButton
  ?.addEventListener(
    "click",
    async () => {
      const confirmed = window.confirm(
        "Generate a new staff access code? The current code will stop working immediately."
      );

      if (!confirmed) {
        return;
      }

      regenerateStaffAccessCodeButton.disabled =
        true;

      regenerateStaffAccessCodeButton.textContent =
        "Generating...";

      showStaffAccessCodeMessage(
        "Generating a secure staff access code...",
        "info"
      );

      try {
        const data = await fetchJSON(
          `${OWNER_API_BASE}/manage_staff_access_code.php`,
          {
            method: "POST",

            body: JSON.stringify({
              action: "regenerate"
            })
          }
        );

        if (!data.success) {
          throw new Error(
            data.message ||
            "Unable to generate a new staff access code."
          );
        }

        currentStaffAccessCode =
          String(
            data.staff_access_code || ""
          ).trim();

        staffAccessCodeVisible = true;

        renderStaffAccessCode();

        showStaffAccessCodeMessage(
          "A new staff access code was generated. Share it only with authorized staff.",
          "success"
        );

        await loadActivityLogs();

      } catch (error) {
        console.error(
          "Staff access code update error:",
          error
        );

        showStaffAccessCodeMessage(
          error.message ||
          "Unable to generate a new staff access code.",
          "error"
        );

      } finally {
        regenerateStaffAccessCodeButton.disabled =
          false;

        regenerateStaffAccessCodeButton.textContent =
          "Generate New Code";
      }
    }
  );

async function loadUsers() {
  const data = await fetchJSON(
    "http://localhost/FoodConnect/api/get_users.php"
  );

  users =
    data.success &&
    Array.isArray(data.users)
      ? data.users.map(u => ({
          id: u.user_id,
          restaurant_id: u.restaurant_id,
          role: u.role,
          full_name: u.full_name,
          email: u.email,
          contact_number:
            u.contact_number || "",
          address:
            u.address || "",
          status:
            Number(u.status),
          must_change_password:
            Number(
              u.must_change_password || 0
            ),
          created_at:
            u.created_at
        }))
      : [];

  applyUserFilters();
}

/* =========================
   SALES CHART
========================= */
async function loadDashboardSalesChart(
  range = "weekly"
) {
  const data =
    await fetchJSON(
      `${OWNER_API_BASE}/get_sales_chart.php?range=${encodeURIComponent(
        range
      )}`
    );

  dashboardSalesData =
    Array.isArray(data)
      ? data
      : [];

  renderChart();
}

async function loadReportSalesChart(
  range = "weekly"
) {
  const data =
    await fetchJSON(
      `${OWNER_API_BASE}/get_sales_chart.php?range=${encodeURIComponent(
        range
      )}`
    );

  reportSalesData =
    Array.isArray(data)
      ? data
      : [];

  renderReportSalesChart();
}

function renderChart() {
  if (!salesChart) return;

  if (!dashboardSalesData.length) {
  salesChart.innerHTML =
    "<p>No completed sales for this period.</p>";

  return;
}

const maxValue =
  Math.max(
    ...dashboardSalesData.map(
      item =>
        Number(item.total) || 0
    ),
    1
  );

  salesChart.innerHTML = `
    <div class="chart-bars">
      ${dashboardSalesData.map(item => {
        const total = Number(item.total) || 0;
        const height = Math.max((total / maxValue) * 100, 5);

        return `
          <div class="chart-item">
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height:${height}%"></div>
            </div>
            <small>${item.label}</small>
            <strong>${formatPeso(total)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderAnalyticsComparison(
  element,
  value,
  options = {}
) {
  if (!element) {
    return;
  }

  const numericValue =
    Number(value) || 0;

  const {
    lowerIsBetter = false,
    suffix = "%"
  } = options;

  element.classList.remove(
    "is-positive",
    "is-negative",
    "is-neutral"
  );

  if (numericValue === 0) {
    element.textContent =
      "No change from previous period";

    element.classList.add(
      "is-neutral"
    );

    return;
  }

  const businessIsPositive =
    lowerIsBetter
      ? numericValue < 0
      : numericValue > 0;

  const arrow =
    numericValue > 0
      ? "↑"
      : "↓";

  const formattedValue =
    Math.abs(
      numericValue
    ).toLocaleString(
      "en-PH",
      {
        maximumFractionDigits: 2
      }
    );

  element.textContent =
    `${arrow} ${formattedValue}${suffix} vs previous period`;

  element.classList.add(
    businessIsPositive
      ? "is-positive"
      : "is-negative"
  );
}

function renderSalesReport() {
  const completedOrders =
    document.getElementById(
      "completedOrders"
    );

  const cancelledOrders =
    document.getElementById(
      "cancelledOrders"
    );

  const averageOrderValue =
    document.getElementById(
      "averageOrderValue"
    );

  const bestSeller =
    document.getElementById(
      "bestSeller"
    );

  const summary =
    salesReport.summary || {};

  const comparisons =
    salesReport.comparisons || {};

  const performanceRange =
    salesReport.performanceRange || {};

  const bestProducts =
    salesReport.bestProducts || [];

  const bestCategories =
    salesReport.bestCategories || [];

  if (reportTotalRevenue) {
    reportTotalRevenue.textContent =
      formatPeso(
        summary.total_revenue || 0
      );
  }

  if (reportTotalOrders) {
    reportTotalOrders.textContent =
      Number(
        summary.total_orders
      ) || 0;
  }

  if (completedOrders) {
    completedOrders.textContent =
      Number(
        summary.completed_orders
      ) || 0;
  }

  if (cancelledOrders) {
    cancelledOrders.textContent =
      Number(
        summary.cancelled_orders
      ) || 0;
  }

  if (averageOrderValue) {
    averageOrderValue.textContent =
      formatPeso(
        summary.average_order_value || 0
      );
  }

  if (cancellationRate) {
    const rate =
      Number(
        summary.cancellation_rate
      ) || 0;

    cancellationRate.textContent =
      `${rate.toLocaleString(
        "en-PH",
        {
          maximumFractionDigits: 2
        }
      )}%`;
  }

  if (itemsSold) {
    itemsSold.textContent =
      Number(
        summary.items_sold
      ) || 0;
  }

  if (analyticsCurrentPeriod) {
    analyticsCurrentPeriod.textContent =
      performanceRange.label ||
      "Last 7 Days";
  }

  if (analyticsPreviousPeriod) {
    analyticsPreviousPeriod.textContent =
      performanceRange.previous_label ||
      "Previous 7 Days";
  }

  renderAnalyticsComparison(
    revenueComparison,
    comparisons.revenue_change
  );

  renderAnalyticsComparison(
    ordersComparison,
    comparisons.orders_change
  );

  renderAnalyticsComparison(
    completedOrdersComparison,
    comparisons.completed_orders_change
  );

  renderAnalyticsComparison(
    averageOrderComparison,
    comparisons.average_order_value_change
  );

  renderAnalyticsComparison(
    itemsSoldComparison,
    comparisons.items_sold_change
  );

  renderAnalyticsComparison(
    cancellationComparison,
    comparisons.cancellation_rate_change,
    {
      lowerIsBetter: true,
      suffix: " pts"
    }
  );

  if (bestSeller) {
    if (bestProducts.length) {
      const top =
        bestProducts[0];

      bestSeller.textContent =
        `${top.product_name}${
          top.size
            ? ` - ${top.size}`
            : ""
        }`;

    } else {
      bestSeller.textContent =
        "-";
    }
  }

  if (bestProductsList) {
    bestProductsList.innerHTML =
      bestProducts.length
        ? bestProducts
            .map(
              item => `
                <div class="report-list-item">
                  <div>
                    <strong>
                      ${escapeHtml(
                        item.product_name ||
                        "Unknown Product"
                      )}
                      ${
                        item.size
                          ? ` - ${escapeHtml(
                              item.size
                            )}`
                          : ""
                      }
                    </strong>

                    <span>
                      ${
                        Number(
                          item.total_sold
                        ) || 0
                      } sold
                    </span>
                  </div>

                  <div class="report-list-value">
                    ${formatPeso(
                      item.total_sales
                    )}
                  </div>
                </div>
              `
            )
            .join("")
        : `
    <div class="analytics-empty-state">
      <span aria-hidden="true">
        🏆
      </span>

      <strong>
        No completed product sales
      </strong>

      <p>
        Product rankings will appear
        after orders are completed.
      </p>
    </div>
  `;
  }

  if (bestCategoriesList) {
    bestCategoriesList.innerHTML =
      bestCategories.length
        ? bestCategories
            .map(
              item => `
                <div class="report-list-item">
                  <div>
                    <strong>
                      ${escapeHtml(
                        item.category ||
                        "Uncategorized"
                      )}
                    </strong>

                    <span>
                      ${
                        Number(
                          item.total_sold
                        ) || 0
                      } sold
                    </span>
                  </div>

                  <div class="report-list-value">
                    ${formatPeso(
                      item.total_sales
                    )}
                  </div>
                </div>
              `
            )
            .join("")
       : `
    <div class="analytics-empty-state">
      <span aria-hidden="true">
        📊
      </span>

      <strong>
        No completed category sales
      </strong>

      <p>
        Category rankings will appear
        after orders are completed.
      </p>
    </div>
  `;
  }
}

function renderReportSalesChart() {
  if (!reportSalesChart) return;

if (!reportSalesData.length) {
  reportSalesChart.innerHTML =
    "<p>No completed sales for this period.</p>";

  return;
}

const maxValue =
  Math.max(
    ...reportSalesData.map(
      item =>
        Number(item.total) || 0
    ),
    1
  );

  reportSalesChart.innerHTML = `
    <div class="chart-bars">
      ${reportSalesData.map(item => {
        const total = Number(item.total) || 0;
        const height = Math.max((total / maxValue) * 100, 5);

        return `
          <div class="chart-item">
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height:${height}%"></div>
            </div>
            <small>${item.label}</small>
            <strong>${formatPeso(total)}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCashierPerformance() {
  if (!cashierPerformanceBody) {
    return;
  }

  const cashiers =
    salesReport.cashierPerformance || [];

  if (cashierRangeLabel) {
    cashierRangeLabel.textContent =
      salesReport.performanceRange?.label ||
      "Last 7 Days";
  }

  if (!cashiers.length) {
    cashierPerformanceBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="performance-empty-cell"
        >
          <div class="performance-empty-state">
            <div class="performance-empty-icon">
              👤
            </div>

            <strong>No cashier data</strong>

            <span>
              No cashier activity was recorded
              for this period.
            </span>
          </div>
        </td>
      </tr>
    `;

    return;
  }

  cashierPerformanceBody.innerHTML =
    cashiers.map(cashier => {
      const isActive =
        Number(cashier.account_status) === 1;

      const handledOrders =
        Number(cashier.handled_orders) || 0;

      const completedOrders =
        Number(cashier.completed_orders) || 0;

      const cancelledOrders =
        Number(cashier.cancelled_orders) || 0;

      const totalSales =
        Number(
          cashier.total_sales_handled
        ) || 0;

      const averageValue =
        Number(
          cashier.average_order_value
        ) || 0;

      return `
        <tr>
          <td>
            <div class="performance-person">
              <div class="performance-avatar">
                ${getInitials(
                  cashier.cashier_name
                )}
              </div>

              <div class="performance-person-info">
                <strong>
                  ${cashier.cashier_name}
                </strong>

                <span
                  class="
                    performance-account-status
                    ${
                      isActive
                        ? "is-active"
                        : "is-inactive"
                    }
                  "
                >
                  ${
                    isActive
                      ? "Active"
                      : "Inactive"
                  }
                </span>
              </div>
            </div>
          </td>

          <td>
            <span class="
              performance-number
              ${
                handledOrders === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${handledOrders}
            </span>
          </td>

          <td>
            <span class="
              performance-number
              ${
                completedOrders === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${completedOrders}
            </span>
          </td>

          <td>
            <span class="
              performance-money
              ${
                totalSales === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${formatPeso(totalSales)}
            </span>
          </td>

          <td>
            <span class="
              performance-number
              ${
                cancelledOrders === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${cancelledOrders}
            </span>
          </td>

          <td>
            <span class="
              performance-money
              ${
                averageValue === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${formatPeso(averageValue)}
            </span>
          </td>
        </tr>
      `;
    }).join("");
}

function renderDeliveryPerformance() {
  if (!deliveryPerformanceBody) {
    return;
  }

  const riders =
    salesReport.deliveryPerformance || [];

  if (deliveryRangeLabel) {
    deliveryRangeLabel.textContent =
      salesReport.performanceRange?.label ||
      "Last 7 Days";
  }

  if (!riders.length) {
    deliveryPerformanceBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="performance-empty-cell"
        >
          <div class="performance-empty-state">
            <div class="performance-empty-icon">
              🛵
            </div>

            <strong>No delivery data</strong>

            <span>
              No rider activity was recorded
              for this period.
            </span>
          </div>
        </td>
      </tr>
    `;

    return;
  }

  deliveryPerformanceBody.innerHTML =
    riders.map(rider => {
      const isActive =
        Number(rider.account_status) === 1;

      const assigned =
        Number(
          rider.assigned_deliveries
        ) || 0;

      const completed =
        Number(
          rider.completed_deliveries
        ) || 0;

      const failed =
        Number(
          rider.failed_cancelled_deliveries
        ) || 0;

      const codHandled =
        Number(
          rider.cod_amount_handled
        ) || 0;

      const completionRate =
        formatCompletionRate(
          rider.completion_rate
        );

      return `
        <tr>
          <td>
            <div class="performance-person">
              <div class="performance-avatar">
                ${getInitials(
                  rider.rider_name
                )}
              </div>

              <div class="performance-person-info">
                <strong>
                  ${rider.rider_name}
                </strong>

                <span
                  class="
                    performance-account-status
                    ${
                      isActive
                        ? "is-active"
                        : "is-inactive"
                    }
                  "
                >
                  ${
                    isActive
                      ? "Active"
                      : "Inactive"
                  }
                </span>
              </div>
            </div>
          </td>

          <td>
            <span class="
              performance-number
              ${
                assigned === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${assigned}
            </span>
          </td>

          <td>
            <span class="
              performance-number
              ${
                completed === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${completed}
            </span>
          </td>

          <td>
            <span class="
              performance-number
              ${
                failed === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${failed}
            </span>
          </td>

          <td>
            <span class="
              performance-money
              ${
                codHandled === 0
                  ? "performance-zero"
                  : ""
              }
            ">
              ${formatPeso(codHandled)}
            </span>
          </td>

          <td class="completion-cell">
            <div class="completion-rate-header">
              <strong>
                ${completionRate.toFixed(0)}%
              </strong>
            </div>

            <div class="completion-progress">
              <div
                class="completion-progress-bar"
                style="
                  width:
                    ${completionRate}%;
                "
              ></div>
            </div>
          </td>
        </tr>
      `;
    }).join("");
}

async function loadSalesReport(
  range = "weekly"
) {
  try {
    const data = await fetchJSON(
      `${OWNER_API_BASE}/get_sales_report.php?range=${encodeURIComponent(
        range
      )}`
    );

    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to load the sales report right now. Please try again."
      );
    }

   salesReport = {
  summary:
    data.summary || {},

  previousSummary:
    data.previousSummary || {},

  comparisons:
    data.comparisons || {},

  bestProducts:
    data.bestProducts || [],

  bestCategories:
    data.bestCategories || [],

  cashierPerformance:
    data.cashierPerformance || [],

  deliveryPerformance:
    data.deliveryPerformance || [],

  performanceRange:
    data.performanceRange || {
      value: range,
      label: "Last 7 Days",
      previous_label:
        "Previous 7 Days"
    }
};

    renderSalesReport();
    renderCashierPerformance();
    renderDeliveryPerformance();

  } catch (error) {
    console.error(
      "Load sales report failed:",
      error
    );

    if (cashierPerformanceBody) {
      cashierPerformanceBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="performance-empty-cell"
          >
            Unable to load cashier performance.
          </td>
        </tr>
      `;
    }

    if (deliveryPerformanceBody) {
      deliveryPerformanceBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="performance-empty-cell"
          >
            Unable to load delivery performance.
          </td>
        </tr>
      `;
    }
  }
}

function exportSalesReportCSV() {
  const range =
    reportSalesRange?.value ||
    "weekly";

  const allowedRanges = [
    "daily",
    "weekly",
    "monthly"
  ];

  const safeRange =
    allowedRanges.includes(range)
      ? range
      : "weekly";

  const link =
    document.createElement("a");

  link.href =
    `${OWNER_API_BASE}/export_sales_report_csv.php?range=${encodeURIComponent(
      safeRange
    )}`;

  link.setAttribute(
    "download",
    ""
  );

  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportSalesReportExcel() {
  const summary = salesReport.summary || {};
  const bestProducts = salesReport.bestProducts || [];
  const bestCategories = salesReport.bestCategories || [];

  const dateGenerated = new Date().toLocaleString("en-PH");

  const html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
        }

        h1 {
          background: #111111;
          color: #cc9900;
          padding: 14px;
          text-align: center;
        }

        h2 {
          color: #111111;
          margin-top: 25px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }

        th {
          background: #cc9900;
          color: #ffffff;
          padding: 10px;
          border: 1px solid #999;
        }

        td {
          padding: 10px;
          border: 1px solid #999;
        }

        .summary-label {
          font-weight: bold;
          background: #f2f2f2;
        }

        .money {
          color: #008000;
          font-weight: bold;
        }

        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>

    <body>
      <h1>FoodConnect Sales Report</h1>

      <p><strong>Date Generated:</strong> ${dateGenerated}</p>

      <h2>Sales Summary</h2>
      <table>
        <tr>
          <td class="summary-label">Total Revenue</td>
          <td class="money">${formatPeso(summary.total_revenue || 0)}</td>
        </tr>
        <tr>
          <td class="summary-label">Completed Orders</td>
          <td>${summary.completed_orders || 0}</td>
        </tr>
        <tr>
          <td class="summary-label">Cancelled Orders</td>
          <td>${summary.cancelled_orders || 0}</td>
        </tr>
        <tr>
          <td class="summary-label">Average Order Value</td>
          <td class="money">${formatPeso(summary.average_order_value || 0)}</td>
        </tr>
      </table>

      <h2>Best Selling Products</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Variant</th>
          <th>Total Sold</th>
          <th>Total Sales</th>
        </tr>

        ${
          bestProducts.length
            ? bestProducts.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product_name}</td>
                <td>${item.size || "-"}</td>
                <td>${item.total_sold}</td>
                <td class="money">${formatPeso(item.total_sales)}</td>
              </tr>
            `).join("")
            : `<tr><td colspan="5">No product sales yet.</td></tr>`
        }
      </table>

      <h2>Best Categories</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Category</th>
          <th>Total Sold</th>
          <th>Total Sales</th>
        </tr>

        ${
          bestCategories.length
            ? bestCategories.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.category || "Uncategorized"}</td>
                <td>${item.total_sold}</td>
                <td class="money">${formatPeso(item.total_sales)}</td>
              </tr>
            `).join("")
            : `<tr><td colspan="4">No category sales yet.</td></tr>`
        }
      </table>

      <p class="footer">
        Generated by FoodConnect Owner Dashboard.
      </p>
    </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "foodconnect_sales_report.xls";
  link.click();

  URL.revokeObjectURL(url);
}

/* =========================
   PRODUCT PROMO STATUS
========================= */

function parseProductPromoDate(
  dateValue
) {
  if (!dateValue) {
    return null;
  }

  const normalizedValue =
    String(dateValue)
      .trim()
      .replace(
        " ",
        "T"
      );

  const parsedDate =
    new Date(normalizedValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate;
}

function formatProductPromoDate(
  dateValue
) {
  const parsedDate =
    parseProductPromoDate(
      dateValue
    );

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toLocaleString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }
  );
}

function getProductPromoStatus(
  product
) {
  const discountType =
    String(
      product.discountType ||
      "none"
    )
      .trim()
      .toLowerCase();

  const discountValue =
    Number(
      product.discountValue
    ) || 0;

  const discountStatus =
    String(
      product.discountStatus ||
      "Inactive"
    )
      .trim()
      .toLowerCase();

  const discountSchedule =
    String(
      product.discountSchedule ||
      "permanent"
    )
      .trim()
      .toLowerCase();

  /*
   * No valid promotion was created.
   */
  if (
    discountType === "none" ||
    discountValue <= 0
  ) {
    return {
      key: "none",
      label: "No Promo",
      description:
        "This product is using its regular price."
    };
  }

  /*
   * The owner saved a promotion but turned it off.
   */
  if (
    discountStatus !== "active"
  ) {
    return {
      key: "disabled",
      label: "Promo Off",
      description:
        "The promotion is saved but currently disabled."
    };
  }

  /*
   * Permanent promotion that was turned on.
   */
  if (
    discountSchedule !==
    "scheduled"
  ) {
    return {
      key: "active",
      label: "Active Promo",
      description:
        "The promotion is currently active."
    };
  }

  const startDate =
    parseProductPromoDate(
      product.discountStart
    );

  const endDate =
    parseProductPromoDate(
      product.discountEnd
    );

  /*
   * Treat an incomplete scheduled promotion as disabled
   * instead of incorrectly showing it as active.
   */
  if (
    !startDate ||
    !endDate
  ) {
    return {
      key: "disabled",
      label: "Promo Off",
      description:
        "The scheduled promotion has incomplete dates."
    };
  }

  const currentTime =
    new Date();

  if (
    currentTime < startDate
  ) {
    return {
      key: "scheduled",
      label: "Scheduled",
      description:
        "The promotion has not started yet."
    };
  }

  if (
    currentTime > endDate
  ) {
    return {
      key: "expired",
      label: "Expired",
      description:
        "The promotion has already ended."
    };
  }

  if (
  product.isDiscountActive
) {
  return {
    key: "active",
    label: "Active Promo",
    description:
      "The scheduled promotion is currently applied."
  };
}

return {
  key: "disabled",
  label: "Not Applied",
  description:
    "The promotion dates are active, but the discounted price is not currently being applied."
};
}

function getProductPromoScheduleText(
  product,
  promoStatus
) {
  const schedule =
    String(
      product.discountSchedule ||
      "permanent"
    )
      .trim()
      .toLowerCase();

  if (
    promoStatus.key === "none"
  ) {
    return "";
  }

  if (
    promoStatus.key === "disabled"
  ) {
    return "Saved promotion — currently turned off";
  }

  if (schedule !== "scheduled") {
    return promoStatus.key === "active"
      ? "Permanent promotion — active until manually turned off"
      : "Permanent promotion";
  }

  const startText =
    formatProductPromoDate(
      product.discountStart
    );

  const endText =
    formatProductPromoDate(
      product.discountEnd
    );

  if (
    promoStatus.key === "scheduled"
  ) {
    return startText
      ? `Starts ${startText}`
      : "Scheduled promotion";
  }

  if (
    promoStatus.key === "expired"
  ) {
    return endText
      ? `Ended ${endText}`
      : "Promotion has ended";
  }

  if (
    promoStatus.key === "active"
  ) {
    return endText
      ? `Ends ${endText}`
      : "Promotion is currently active";
  }

  return "";
}

/* =========================
   PRODUCTS RENDER
========================= */
function renderProducts(list = products) {
  if (!productsGrid) {
    return;
  }

  if (activeProductMode === "addons") {
    renderAddons(list);
    return;
  }

  const menuProducts = products.filter(
    product => product.itemType !== "add_on"
  );

  const productOverviewTotal =
    document.getElementById(
      "productOverviewTotal"
    );

  const productOverviewAvailable =
    document.getElementById(
      "productOverviewAvailable"
    );

  const productOverviewLow =
    document.getElementById(
      "productOverviewLow"
    );

   const productOverviewOut =
    document.getElementById(
      "productOverviewOut"
    );

  const promotionOverviewActive =
    document.getElementById(
      "promotionOverviewActive"
    );

  const promotionOverviewScheduled =
    document.getElementById(
      "promotionOverviewScheduled"
    );

  const promotionOverviewExpired =
    document.getElementById(
      "promotionOverviewExpired"
    );

  const promotionOverviewDisabled =
    document.getElementById(
      "promotionOverviewDisabled"
    );

  const promotionOverviewNone =
    document.getElementById(
      "promotionOverviewNone"
    );

  const totalProducts = menuProducts.length;

  const availableProducts =
    menuProducts.filter(
      product => Number(product.stock) > 5
    ).length;

  const lowStockProducts =
    menuProducts.filter(product => {
      const stock = Number(product.stock);

      return stock > 0 && stock <= 5;
    }).length;

    const outOfStockProducts =
    menuProducts.filter(
      product => Number(product.stock) <= 0
    ).length;

  const promotionCounts = {
    active: 0,
    scheduled: 0,
    expired: 0,
    disabled: 0,
    none: 0
  };

  menuProducts.forEach(product => {
    const promoStatus =
      getProductPromoStatus(
        product
      );

    if (
      Object.prototype.hasOwnProperty.call(
        promotionCounts,
        promoStatus.key
      )
    ) {
      promotionCounts[
        promoStatus.key
      ] += 1;
    } else {
      promotionCounts.none += 1;
    }
  });

  if (productOverviewTotal) {
    productOverviewTotal.textContent =
      totalProducts;
  }

  if (productOverviewAvailable) {
    productOverviewAvailable.textContent =
      availableProducts;
  }

  if (productOverviewLow) {
    productOverviewLow.textContent =
      lowStockProducts;
  }

    if (productOverviewOut) {
    productOverviewOut.textContent =
      outOfStockProducts;
  }

  if (promotionOverviewActive) {
    promotionOverviewActive.textContent =
      promotionCounts.active;
  }

  if (promotionOverviewScheduled) {
    promotionOverviewScheduled.textContent =
      promotionCounts.scheduled;
  }

  if (promotionOverviewExpired) {
    promotionOverviewExpired.textContent =
      promotionCounts.expired;
  }

  if (promotionOverviewDisabled) {
    promotionOverviewDisabled.textContent =
      promotionCounts.disabled;
  }

  if (promotionOverviewNone) {
    promotionOverviewNone.textContent =
      promotionCounts.none;
  }

  if (!list.length) {
    productsGrid.innerHTML = `
      <div class="product-empty-state">
        <div class="product-empty-icon">
          📦
        </div>

        <h3>No products found</h3>

        <p>
          Try changing your search, category,
          or sorting options.
        </p>
      </div>
    `;

    return;
  }

  productsGrid.innerHTML = list
    .map(product => {
      const stock = Number(product.stock) || 0;

      let stockClass = "is-available";
      let stockLabel = "Available";
      let stockDescription =
        `${stock} item${stock === 1 ? "" : "s"} in stock`;

      if (stock <= 0) {
        stockClass = "is-out";
        stockLabel = "Out of Stock";
        stockDescription =
          "This product is unavailable";
      } else if (stock <= 5) {
        stockClass = "is-low";
        stockLabel = "Low Stock";
        stockDescription =
          `Only ${stock} item${stock === 1 ? "" : "s"} remaining`;
      }

      const variant =
        String(product.size || "").trim() ||
        "Standard";

        const hasActiveDiscount =
  Boolean(
    product.isDiscountActive
  ) &&
  Number(
    product.finalPrice
  ) <
  Number(
    product.regularPrice
  );

const displayedPrice =
  hasActiveDiscount
    ? Number(
        product.finalPrice
      )
    : Number(
        product.regularPrice
      );

const discountLabel =
  getProductDiscountLabel(
    product
  );

const promoStatus =
  getProductPromoStatus(
    product
  );

const hasSavedPromotion =
  product.discountType !== "none" &&
  Number(product.discountValue) > 0;

const savedPromoPrice =
  calculateDiscountPrice(
    Number(
      product.regularPrice
    ) || 0,
    String(
      product.discountType ||
      "none"
    )
      .trim()
      .toLowerCase(),
    Number(
      product.discountValue
    ) || 0
  );

const promoScheduleText =
  getProductPromoScheduleText(
    product,
    promoStatus
  );

const currentCustomerPrice =
  promoStatus.key === "active"
    ? savedPromoPrice
    : Number(
        product.regularPrice
      ) || 0;

const compactPromoText =
  promoStatus.key === "active"
    ? `${discountLabel} • Active Promo`
    : promoStatus.key === "scheduled"
      ? `${discountLabel} • Scheduled`
      : promoStatus.key === "expired"
        ? `Previous promo: ${discountLabel}`
        : promoStatus.key === "disabled"
          ? `${discountLabel} • Promo Off`
          : "";

          let imageRibbon = "";

if (promoStatus.key === "active") {

    if (product.discountType === "percentage") {

        imageRibbon =
            `${Math.round(
                product.discountValue
            )}% OFF`;

    } else if (
        product.discountType === "fixed"
    ) {

        imageRibbon =
            `₱${formatNumber(
                product.discountValue
            )} OFF`;

    }

}
else if (
    promoStatus.key === "scheduled"
) {

    imageRibbon =
        "Starts Soon";

}

      return `
        <article
          class="product-card"
          data-promo-status="${escapeHtml(
            promoStatus.key
          )}"
        >

          ${
  product.image
    ? `
      <img
        class="product-card-image"
        src="${escapeHtml(product.image)}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
        onerror="this.remove()"
      />
    `
    : `
      <div class="product-card-image product-card-image-empty">
        <span>🍽️</span>
        <small>No product image</small>
      </div>
    `
}
${
    imageRibbon
        ? `
        <div
            class="
            product-image-ribbon
            is-${promoStatus.key}
            "
        >
            ${escapeHtml(
                imageRibbon
            )}
        </div>
        `
        : ""
}
          <div class="product-card-header">
            <div class="product-title-group">
              <span class="product-card-category">
                ${product.category}
              </span>

              <h3 title="${product.name}">
                ${product.name}
              </h3>
            </div>

            <span
              class="product-availability-badge ${stockClass}"
            >
              <span class="product-status-dot"></span>
              ${stockLabel}
            </span>
          </div>

       <div class="product-card-body">
<div
  class="product-compact-price ${
    hasSavedPromotion
      ? `has-promo is-${escapeHtml(
          promoStatus.key
        )}`
      : ""
  }"
>
  <div class="product-current-price-row">
    <div>
      <span class="product-price-label">
        Customer Price Now
      </span>

      <strong class="product-current-price">
        ${formatPeso(
          currentCustomerPrice
        )}
      </strong>
    </div>

    ${
      hasSavedPromotion
        ? `
          <span
            class="product-promo-status-badge is-${escapeHtml(
              promoStatus.key
            )}"
            title="${escapeHtml(
              promoStatus.description
            )}"
          >
            <span
              class="product-promo-status-dot"
            ></span>

            ${escapeHtml(
              promoStatus.label
            )}
          </span>
        `
        : ""
    }
  </div>

  ${
    promoStatus.key === "active"
      ? `
        <div class="product-active-price-details">
          <del>
            ${formatPeso(
              product.regularPrice
            )}
          </del>

          <strong>
            ${escapeHtml(
              discountLabel
            )}
          </strong>
        </div>
      `
      : hasSavedPromotion
        ? `
          <div class="product-inactive-promo-details">
            <span>
              ${escapeHtml(
                compactPromoText
              )}
            </span>

            <strong>
              Promo price:
              ${formatPeso(
                savedPromoPrice
              )}
            </strong>
          </div>
        `
        : ""
  }

  ${
    promoScheduleText
      ? `
        <p class="product-compact-schedule">
          ${escapeHtml(
            promoScheduleText
          )}
        </p>
      `
      : ""
  }
</div>

            <div class="product-details-grid">
              <div class="product-detail-item">
                <span>Variant</span>
                <strong>${variant}</strong>
              </div>

              <div class="product-detail-item">
                <span>Stock</span>

                <strong class="product-stock-value ${stockClass}">
                  ${stock}
                </strong>
              </div>
            </div>

            <div class="product-stock-summary ${stockClass}">
              <span class="product-stock-summary-icon">
                ${
                  stock <= 0
                    ? "!"
                    : stock <= 5
                      ? "↓"
                      : "✓"
                }
              </span>

              <span>
                ${stockDescription}
              </span>
            </div>
          </div>

          <div class="product-actions">
            <button
              type="button"
              class="product-action-btn product-edit-btn"
              data-product-action="edit"
              data-product-id="${Number(product.id)}"
            >
              <span>✎</span>
              Edit
            </button>

            <button
              type="button"
              class="product-action-btn product-delete-btn"
              data-product-action="delete"
              data-product-id="${Number(product.id)}"
            >
              <span>⌫</span>
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

/* Product card actions: delegated so dynamically-rendered cards stay clickable. */
productsGrid?.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-product-action][data-product-id]");
  if (!actionButton || !productsGrid.contains(actionButton)) return;

  const productId = Number(actionButton.dataset.productId);
  if (!Number.isInteger(productId) || productId <= 0) return;

  const action = actionButton.dataset.productAction;

  if (action === "edit") {
    window.openEditProductModal?.(productId);
    return;
  }

  if (action === "delete") {
    window.deleteProduct?.(productId);
  }
});

function normalizeCategoryKey(
  value
) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function populateProductCategories() {
  if (!productCategoryFilter) {
    return;
  }

  const currentValue =
    productCategoryFilter.value ||
    "all";

  const categoryMap =
    new Map();

  products
    .filter(product => product.itemType !== "add_on")
    .forEach(product => {
    const displayName =
      String(
        product.category || ""
      )
        .trim()
        .replace(/\s+/g, " ");

    if (!displayName) {
      return;
    }

    const categoryKey =
      normalizeCategoryKey(
        displayName
      );

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(
        categoryKey,
        displayName
      );
    }
  });

  const categories =
    [...categoryMap.entries()]
      .sort((a, b) =>
        a[1].localeCompare(
          b[1],
          undefined,
          {
            sensitivity: "base"
          }
        )
      );

  productCategoryFilter.innerHTML = `
    <option value="all">
      All Categories
    </option>

    ${categories
      .map(
        ([categoryKey, displayName]) => `
          <option
            value="${escapeHtml(
              categoryKey
            )}"
          >
            ${escapeHtml(
              displayName
            )}
          </option>
        `
      )
      .join("")}
  `;

  if (
    currentValue !== "all" &&
    categoryMap.has(currentValue)
  ) {
    productCategoryFilter.value =
      currentValue;
  } else {
    productCategoryFilter.value =
      "all";
  }
}
function applyProductFilters() {
  let list = products.filter(
    product =>
      activeProductMode === "addons"
        ? product.itemType === "add_on"
        : product.itemType !== "add_on"
  );

  const search = productSearch?.value.toLowerCase().trim() || "";
  const category = productCategoryFilter?.value || "all";
  const sort = productSort?.value || "newest";

  if (search) {
    list = list.filter(p =>
      String(p.name).toLowerCase().includes(search) ||
      String(p.category).toLowerCase().includes(search) ||
      String(p.size).toLowerCase().includes(search)
    );
  }

if (category !== "all") {
  list = list.filter(
    product =>
      normalizeCategoryKey(
        product.category
      ) === category
  );
}
  

  if (sort === "oldest") list.sort((a, b) => a.id - b.id);
  if (sort === "newest") list.sort((a, b) => b.id - a.id);
  if (sort === "name-az") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-za") list.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "price-low") {
  list.sort(
    (a, b) =>
      Number(
        a.isDiscountActive
          ? a.finalPrice
          : a.regularPrice
      ) -
      Number(
        b.isDiscountActive
          ? b.finalPrice
          : b.regularPrice
      )
  );
}

if (sort === "price-high") {
  list.sort(
    (a, b) =>
      Number(
        b.isDiscountActive
          ? b.finalPrice
          : b.regularPrice
      ) -
      Number(
        a.isDiscountActive
          ? a.finalPrice
          : a.regularPrice
      )
  );
}
  if (activeProductMode !== "addons" && sort === "stock-low") {
    list.sort((a, b) => a.stock - b.stock);
  }
  if (activeProductMode !== "addons" && sort === "stock-high") {
    list.sort((a, b) => b.stock - a.stock);
  }

  renderProducts(list);
}


function renderLowStock() {
  if (!lowStockList) return;

  const low = products
    .filter(product => product.itemType !== "add_on")
    .filter(product => {
      const stock = Number(product.stock) || 0;

      return stock > 0 && stock <= 5;
    })
    .sort(
      (a, b) =>
        Number(a.stock) -
        Number(b.stock)
    );

  lowStockList.innerHTML = low.length
    ? low.map(product => `
        <div class="low-stock-item">
          <span>
            ${escapeHtml(product.name)}
            ${
              product.size
                ? " - " + escapeHtml(product.size)
                : ""
            }
          </span>

          <strong>
            ${Number(product.stock)} left
          </strong>
        </div>
      `).join("")
    : "<p>No low-stock products.</p>";
}

/* =========================
   INVENTORY
========================= */
function renderInventory(
  list = products
) {
  if (!inventoryTableBody) {
    return;
  }

  const inventoryProducts = products.filter(
    product => product.itemType !== "add_on"
  );

  list = list.filter(
    product => product.itemType !== "add_on"
  );

  const total =
    inventoryProducts.length;

  const available =
    inventoryProducts.filter(
      product =>
        Number(product.stock) > 0
    ).length;

  const low =
    inventoryProducts.filter(
      product => {
        const stock =
          Number(product.stock) || 0;

        return (
          stock > 0 &&
          stock <= 5
        );
      }
    ).length;

  const out =
    inventoryProducts.filter(
      product =>
        Number(product.stock) <= 0
    ).length;

  const overviewTotalProducts =
    document.getElementById(
      "overviewTotalProducts"
    );

  const overviewAvailable =
    document.getElementById(
      "overviewAvailable"
    );

  const overviewLow =
    document.getElementById(
      "overviewLow"
    );

  const overviewOut =
    document.getElementById(
      "overviewOut"
    );

  if (overviewTotalProducts) {
    overviewTotalProducts.textContent =
      total;
  }

  if (overviewAvailable) {
    overviewAvailable.textContent =
      available;
  }

  if (overviewLow) {
    overviewLow.textContent =
      low;
  }

  if (overviewOut) {
    overviewOut.textContent =
      out;
  }

  const sortedList =
    sortInventoryList(list);

  updateInventoryResultCount(
    sortedList.length
  );

  if (!sortedList.length) {
    inventoryTableBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="inventory-loading-cell"
        >
          No inventory products match your filters.
        </td>
      </tr>
    `;

    return;
  }

  inventoryTableBody.innerHTML =
    sortedList
      .map(product => {
        const stock =
          Math.max(
            0,
            Number(product.stock) || 0
          );

        const stockLevel =
          getStockLevel(stock);

        const stockLabel =
          getStockLabel(stock);

        const category =
          escapeHtml(
            product.category ||
            "Uncategorized"
          );

        const productName =
          escapeHtml(
            product.name ||
            "Unnamed Product"
          );

        const size =
          escapeHtml(
            product.size || "-"
          );

        return `
          <tr class="inventory-table-row">
            <td>
              ${category}
            </td>

            <td>
              <strong>
                ${productName}
              </strong>
            </td>

            <td>
              ${size}
            </td>

           <td>
  <div class="inventory-quantity">
    <strong>
      ${stock}
    </strong>

    <span>
      ${
        stock === 1
          ? "item remaining"
          : "items remaining"
      }
    </span>
  </div>
</td>

           <td>
              <span
                class="inventory-stock-badge stock-${stockLevel}"
              >
                ${stockLabel}
              </span>
            </td>

            <td>
              <button
              type="button"
              class="inventory-restock-btn"
              onclick="openRestockFromInventory(${Number(product.id)})"
            >
              <span aria-hidden="true">+</span>
              Restock
            </button>
            </td>
          </tr>
        `;
      })
      .join("");
}

function populateInventoryCategories() {
  if (!inventoryCategoryFilter) return;

  const currentValue = inventoryCategoryFilter.value || "all";
  const categories = [
    ...new Set(
      products
        .filter(product => product.itemType !== "add_on")
        .map(product => product.category)
        .filter(Boolean)
    )
  ].sort();

  inventoryCategoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    ${categories.map(category => `
      <option value="${category}">${category}</option>
    `).join("")}
  `;

  if (categories.includes(currentValue)) {
    inventoryCategoryFilter.value = currentValue;
  }
}

function applyInventoryFilters() {
  let list = products.filter(
    product => product.itemType !== "add_on"
  );

  const search = inventorySearch?.value.toLowerCase().trim() || "";
  const stockFilter = inventoryFilter?.value || "all";
  const categoryFilter = inventoryCategoryFilter?.value || "all";

  if (search) {
    list = list.filter(p =>
      String(p.name).toLowerCase().includes(search) ||
      String(p.category).toLowerCase().includes(search) ||
      String(p.size).toLowerCase().includes(search)
    );
  }

  if (stockFilter === "low") {
    list = list.filter(p => p.stock > 0 && p.stock <= 5);
  }

  if (stockFilter === "out") {
    list = list.filter(p => p.stock <= 0);
  }

  if (stockFilter === "available") {
    list = list.filter(p => p.stock > 0);
  }

  if (categoryFilter !== "all") {
    list = list.filter(p => p.category === categoryFilter);
  }

  renderInventory(list);
}

function formatUserRoleLabel(role) {
  return String(role || "")
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

function renderUsers(list = users) {
  if (!usersTableBody) return;

  usersTableBody.innerHTML = list.length
    ? list.map(u => {
        const isOwner =
          String(u.role || "")
            .toLowerCase() ===
          "owner";

        const passwordRequired =
          Number(
            u.must_change_password || 0
          ) === 1;

        const roleLabel =
          formatUserRoleLabel(u.role);

        return `
          <tr>
            <td class="user-name-cell">${escapeHtml(u.full_name)}</td>
            <td class="user-email-cell">${escapeHtml(u.email)}</td>
            <td class="user-contact-cell">${escapeHtml(window.FoodConnectPhone.format(u.contact_number, "-"))}</td>
            <td class="user-address-cell">${escapeHtml(u.address || "-")}</td>
            <td class="user-role-cell">
              <span class="user-role-badge user-role-${escapeHtml(u.role)}">
                ${escapeHtml(roleLabel)}
              </span>
            </td>
            <td class="user-status-cell">
              <span class="user-status-badge ${u.status == 1 ? "user-status-active" : "user-status-inactive"}">
                ${u.status == 1 ? "Active" : "Inactive"}
              </span>
              ${
                !isOwner && passwordRequired
                  ? `
                    <span class="staff-password-required-badge">
                      Password change required
                    </span>
                  `
                  : ""
              }
            </td>
            <td class="user-created-cell">${escapeHtml(u.created_at || "-")}</td>
            <td class="user-actions-cell">
              <div class="user-actions">
                <button
                  class="action-btn"
                  onclick="openEditUserModal(${Number(u.id)})"
                >
                  Edit
                </button>

                ${
                  !isOwner
                    ? `
                      <button
                        class="action-btn reset-password-btn"
                        onclick="openResetStaffPasswordModal(${Number(u.id)})"
                      >
                        Reset Password
                      </button>
                    `
                    : ""
                }

                <button
                  class="action-btn secondary"
                  onclick="deleteUser(${Number(u.id)})"
                  ${isOwner ? "disabled" : ""}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="8" class="users-empty-state">No users found.</td></tr>`;
}

function formatActivityRole(
  role
) {
  const normalizedRole =
    String(role || "System")
      .trim()
      .toLowerCase();

  if (normalizedRole === "owner") {
    return "Restaurant Owner";
  }

  if (normalizedRole === "cashier") {
    return "Cashier";
  }

  if (
    normalizedRole ===
    "delivery_staff"
  ) {
    return "Delivery Staff";
  }

  if (
    normalizedRole ===
    "kitchen_staff"
  ) {
    return "Kitchen Staff";
  }

  if (normalizedRole === "admin") {
    return "Administrator";
  }

  return normalizedRole
    ? normalizedRole
        .replace(/_/g, " ")
        .replace(
          /\b\w/g,
          character =>
            character.toUpperCase()
        )
    : "System";
}

function isActivityWithinDateFilter(
  dateValue,
  filter
) {
  if (filter === "all") {
    return true;
  }

  const date =
    parseActivityDate(
      dateValue
    );

  if (!date) {
    return false;
  }

  const now =
    new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  const activityStart =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const differenceDays =
    Math.floor(
      (
        todayStart -
        activityStart
      ) /
      86400000
    );

  if (filter === "today") {
    return differenceDays === 0;
  }

  if (filter === "yesterday") {
    return differenceDays === 1;
  }

  if (filter === "week") {
    return (
      differenceDays >= 0 &&
      differenceDays <= 6
    );
  }

  if (filter === "month") {
    return (
      differenceDays >= 0 &&
      differenceDays <= 29
    );
  }

  return true;
}

function updateActivityOverview() {
  const total =
    activityLogs.length;

  const orders =
    activityLogs.filter(
      log => log.type === "order"
    ).length;

  const inventory =
    activityLogs.filter(
      log =>
        log.type === "inventory"
    ).length;

  const staff =
    activityLogs.filter(
      log => log.type === "staff"
    ).length;

  if (activityOverviewTotal) {
    activityOverviewTotal.textContent =
      total;
  }

  if (activityOverviewOrders) {
    activityOverviewOrders.textContent =
      orders;
  }

  if (activityOverviewInventory) {
    activityOverviewInventory.textContent =
      inventory;
  }

  if (activityOverviewStaff) {
    activityOverviewStaff.textContent =
      staff;
  }
}

function updateActivityResultCount(
  count
) {
  if (!activityResultCount) {
    return;
  }

  const safeCount =
    Math.max(
      0,
      Number(count) || 0
    );

  activityResultCount.textContent =
    `${safeCount} ${
      safeCount === 1
        ? "activity"
        : "activities"
    }`;
}

function renderActivityLogs() {
  if (!logsList) {
    return;
  }

  updateActivityOverview();

  const searchQuery =
    String(
      activitySearch?.value || ""
    )
      .trim()
      .toLowerCase();

  const dateFilter =
    String(
      activityDateFilter?.value ||
      "all"
    );

  let list =
    [...activityLogs];

  if (
    currentLogFilter !== "all"
  ) {
    list =
      list.filter(
        log =>
          log.type ===
          currentLogFilter
      );
  }

  if (searchQuery) {
    list =
      list.filter(log => {
        const searchableText = [
          log.title,
          log.message,
          log.role,
          log.type
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          searchQuery
        );
      });
  }

  if (dateFilter !== "all") {
    list =
      list.filter(log =>
        isActivityWithinDateFilter(
          log.createdAt,
          dateFilter
        )
      );
  }

  updateActivityResultCount(
    list.length
  );

  if (!list.length) {
    logsList.innerHTML = `
      <div class="empty-logs">
        <div class="empty-logs-icon">
          📋
        </div>

        <h3>
          No activities found
        </h3>

        <p>
          ${
            activityLogs.length
              ? "Try changing your search or filter options."
              : "Restaurant activities will automatically appear here as FoodConnect is used."
          }
        </p>
      </div>
    `;

    return;
  }

  const groupedLogs =
    new Map();

  list.forEach(log => {
    const dateKey =
      getActivityDateKey(
        log.createdAt
      );

    if (!groupedLogs.has(dateKey)) {
      groupedLogs.set(
        dateKey,
        []
      );
    }

    groupedLogs
      .get(dateKey)
      .push(log);
  });

  logsList.innerHTML =
    [...groupedLogs.entries()]
      .map(
        ([dateKey, logs]) => {
          const firstLog =
            logs[0];

          const dateLabel =
            getActivityDateLabel(
              firstLog.createdAt
            );

          const activityItems =
            logs
              .map(log => {
                const safeType =
                  escapeHtml(
                    log.type ||
                    "system"
                  );

                const safeTitle =
                  escapeHtml(
                    log.title
                  );

                const safeMessage =
                  escapeHtml(
                    log.message
                  ).replace(
                    /\r?\n/g,
                    "<br>"
                  );

                const safeRole =
                  escapeHtml(
                    formatActivityRole(
                      log.role
                    )
                  );

                const safeTime =
                  escapeHtml(
                    log.time
                  );

                const safeIcon =
                  escapeHtml(
                    log.icon
                  );

                return `
                  <article
                    class="
                      log-item
                      log-${safeType}
                      ${
                        log.isRead
                          ? ""
                          : "is-unread"
                      }
                    "
                  >
                    <div
                      class="log-icon ${safeType}"
                      aria-hidden="true"
                    >
                      ${safeIcon}
                    </div>

                    <div class="log-content">
                      <div class="log-content-header">
                        <h3>
                          ${safeTitle}
                        </h3>

                        <span class="log-type-badge">
                          ${safeType}
                        </span>
                      </div>

                      <p>
                        ${safeMessage}
                      </p>

                      <div class="log-meta">
                        <span class="log-role">
                          ${safeRole}
                        </span>

                        ${
                          !log.isRead
                            ? `
                              <span class="log-role">
                                New
                              </span>
                            `
                            : ""
                        }
                      </div>
                    </div>

                    <time class="log-time">
                      ${safeTime}
                    </time>
                  </article>
                `;
              })
              .join("");

          return `
            <section
              class="activity-date-group"
              data-activity-date="${escapeHtml(
                dateKey
              )}"
            >
              <div class="activity-date-label">
                ${escapeHtml(
                  dateLabel
                )}
              </div>

              ${activityItems}
            </section>
          `;
        }
      )
      .join("");
}

async function addActivityLog(
  type,
  icon,
  title,
  message
) {
  const saved =
    await saveActivityLog(
      type,
      title,
      message
    );

  if (!saved) {
    console.warn(
      `Business action succeeded, but activity logging failed: ${title}`
    );

    return false;
  }

  await loadActivityLogs();

  return true;
}

function generateActivityLogs() {

  const logs = [];

  products
    .filter(product => product.stock <= 5)
    .slice(0, 5)
    .forEach(product => {
      logs.push({
        type: "inventory",
        icon: "📦",
        title: "Inventory Alert",
        message: `${product.name}${product.size ? " - " + product.size : ""} has only ${product.stock} stock remaining.`,
        time: "Today"
      });
    });

  users.slice(0, 3).forEach(user => {
    logs.push({
      type: "staff",
      icon: "👤",
      title: "Staff Account",
      message: `${user.full_name} (${user.role}) is registered in the restaurant.`,
      time: user.created_at || "Recently"
    });
  });

  activityLogs = logs;

  renderActivityLogs();

}

function applyUserFilters() {
  let list = [...users];

  const search = userSearch?.value.toLowerCase().trim() || "";
  const role = userRoleFilter?.value || "all";
  const status = userStatusFilter?.value || "all";

  if (search) {
    list = list.filter(u =>
      String(u.full_name).toLowerCase().includes(search) ||
      String(u.email).toLowerCase().includes(search) ||
      String(u.contact_number).toLowerCase().includes(search) ||
      String(u.address).toLowerCase().includes(search)
    );
  }

  if (role !== "all") {
    list = list.filter(u => u.role === role);
  }

  if (status !== "all") {
    list = list.filter(u => String(u.status) === status);
  }

  renderUsers(list);
}

/* =========================
   PRODUCT DISCOUNT
========================= */

function calculateDiscountPrice(
  originalPrice,
  discountType,
  discountValue
) {
  const price =
    Math.max(
      0,
      Number(originalPrice) || 0
    );

  const value =
    Math.max(
      0,
      Number(discountValue) || 0
    );

  if (
    discountType ===
    "percentage"
  ) {
    const percentage =
      Math.min(
        100,
        value
      );

    return Math.max(
      0,
      price -
      (
        price *
        percentage /
        100
      )
    );
  }

  if (
    discountType ===
    "fixed"
  ) {
    return Math.max(
      0,
      price - value
    );
  }

  return price;
}

function updateAddDiscountPreview() {
  const price =
    Number(
      document.getElementById(
        "productPrice"
      )?.value
    ) || 0;

  const type =
    productDiscountType?.value ||
    "none";

  const value =
    Number(
      productDiscountValue?.value
    ) || 0;

  const finalPrice =
    calculateDiscountPrice(
      price,
      type,
      value
    );

  const savings =
    Math.max(
      0,
      price - finalPrice
    );

  if (
    productDiscountOriginalPrice
  ) {
    productDiscountOriginalPrice
      .textContent =
      `₱${price.toFixed(2)}`;
  }

  if (
    productDiscountFinalPrice
  ) {
    productDiscountFinalPrice
      .textContent =
      `₱${finalPrice.toFixed(2)}`;
  }

  if (productDiscountSavings) {
    productDiscountSavings
      .textContent =
      `₱${savings.toFixed(2)}`;
  }

  if (productDiscountPreviewMessage) {
  if (price <= 0) {
    productDiscountPreviewMessage.textContent =
      "Enter the regular product price to calculate the promotion.";
  } else if (type === "percentage" && value > 0) {
    productDiscountPreviewMessage.textContent =
      `${value}% will be deducted. The customer pays ₱${finalPrice.toFixed(
        2
      )} and saves ₱${savings.toFixed(2)}.`;
  } else if (type === "fixed" && value > 0) {
    productDiscountPreviewMessage.textContent =
      `₱${value.toFixed(
        2
      )} will be deducted. The customer pays ₱${finalPrice.toFixed(
        2
      )}.`;
  } else {
    productDiscountPreviewMessage.textContent =
      "Enter a discount greater than zero to see the customer's final price.";
  }
}
}

function updateAddDiscountVisibility() {
  const type =
    productDiscountType?.value ||
    "none";

  const hasDiscount =
    type !== "none";

  if (productDiscountFields) {
    productDiscountFields.hidden =
      !hasDiscount;
  }

  if (!hasDiscount) {
    if (productDiscountValue) {
      productDiscountValue.value =
        "0";
    }

    if (productDiscountStatus) {
      productDiscountStatus.value =
        "Inactive";
    }

    if (productDiscountSchedule) {
      productDiscountSchedule.value =
        "permanent";
    }

    if (productDiscountStart) {
      productDiscountStart.value =
        "";
    }

    if (productDiscountEnd) {
      productDiscountEnd.value =
        "";
    }
  }

  if (productDiscountValueLabel) {
  productDiscountValueLabel.textContent =
    type === "percentage"
      ? "Discount Percentage (%)"
      : type === "fixed"
        ? "Discount Amount (₱)"
        : "Discount Amount";
}

if (productDiscountValueHelp) {
  productDiscountValueHelp.textContent =
    type === "percentage"
      ? "Enter the percentage customers will save. Example: Enter 10 for 10% OFF."
      : type === "fixed"
        ? "Enter the exact peso amount to deduct. Example: Enter 50 for ₱50 OFF."
        : "Select a discount type to continue.";
}

  if (productDiscountValue) {
  const regularPrice =
    Number(
      document.getElementById(
        "productPrice"
      )?.value
    ) || 0;

  if (type === "percentage") {
    productDiscountValue.max = "100";
    productDiscountValue.placeholder =
      "Example: 10 for 10% OFF";
  } else if (type === "fixed") {
    if (regularPrice > 0) {
      productDiscountValue.max =
        String(regularPrice);
    } else {
      productDiscountValue.removeAttribute(
        "max"
      );
    }

    productDiscountValue.placeholder =
      "Example: 50 for ₱50 OFF";
  } else {
    productDiscountValue.removeAttribute(
      "max"
    );

    productDiscountValue.placeholder =
      "Select a discount type first";
  }
}

  updateAddDiscountScheduleVisibility();
  updateAddDiscountPreview();
}

function updateAddDiscountScheduleVisibility() {
  const scheduled =
    productDiscountType?.value !==
      "none" &&
    productDiscountSchedule?.value ===
      "scheduled";

  if (productDiscountScheduleHelp) {
    productDiscountScheduleHelp.textContent =
      scheduled
        ? "The promo will start and stop automatically using the dates below."
        : "The discount remains available until you manually turn the promo off.";
  }

  if (
    productDiscountScheduleFields
  ) {
    productDiscountScheduleFields
      .hidden =
      !scheduled;
  }

  if (!scheduled) {
    if (productDiscountStart) {
      productDiscountStart.value =
        "";
    }

    if (productDiscountEnd) {
      productDiscountEnd.value =
        "";
    }
  }
}

function resetAddProductDiscount() {
  if (productDiscountType) {
    productDiscountType.value =
      "none";
  }

  if (productDiscountValue) {
    productDiscountValue.value =
      "0";
  }

  if (productDiscountStatus) {
    productDiscountStatus.value =
      "Inactive";
  }

  if (productDiscountSchedule) {
    productDiscountSchedule.value =
      "permanent";
  }

  if (productDiscountStart) {
    productDiscountStart.value =
      "";
  }

  if (productDiscountEnd) {
    productDiscountEnd.value =
      "";
  }

  updateAddDiscountVisibility();
}

productDiscountType
  ?.addEventListener(
    "change",
    updateAddDiscountVisibility
  );

productDiscountSchedule
  ?.addEventListener(
    "change",
    updateAddDiscountScheduleVisibility
  );

productDiscountValue
  ?.addEventListener(
    "input",
    updateAddDiscountPreview
  );

document
  .getElementById(
    "productPrice"
  )
  ?.addEventListener(
    "input",
    () => {
      updateAddDiscountVisibility();
      updateAddDiscountPreview();
    }
  );

updateAddDiscountVisibility();

/* =========================
   EDIT PRODUCT DISCOUNT
========================= */

function formatDateTimeLocalValue(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const normalizedValue =
    String(dateValue)
      .trim()
      .replace(" ", "T");

  const match =
    normalizedValue.match(
      /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/
    );

  if (!match) {
    return "";
  }

  return `${match[1]}T${match[2]}`;
}

function updateEditDiscountPreview() {
  const regularPrice =
    Number(
      document.getElementById(
        "editProductPrice"
      )?.value
    ) || 0;

  const discountType =
    editProductDiscountType?.value ||
    "none";

  const discountValue =
    Number(
      editProductDiscountValue?.value
    ) || 0;

  const finalPrice =
    calculateDiscountPrice(
      regularPrice,
      discountType,
      discountValue
    );

  const savings =
    Math.max(
      0,
      regularPrice - finalPrice
    );

  if (
    editProductDiscountOriginalPrice
  ) {
    editProductDiscountOriginalPrice
      .textContent =
      `₱${regularPrice.toFixed(2)}`;
  }

  if (
    editProductDiscountFinalPrice
  ) {
    editProductDiscountFinalPrice
      .textContent =
      `₱${finalPrice.toFixed(2)}`;
  }

  if (
    editProductDiscountSavings
  ) {
    editProductDiscountSavings
      .textContent =
      `₱${savings.toFixed(2)}`;
  }

  if (
    !editProductDiscountPreviewMessage
  ) {
    return;
  }

  if (regularPrice <= 0) {
    editProductDiscountPreviewMessage
      .textContent =
      "Enter the regular product price to calculate the promotion.";

    return;
  }

  if (
    discountType === "percentage" &&
    discountValue > 0
  ) {
    editProductDiscountPreviewMessage
      .textContent =
      `${discountValue}% will be deducted. ` +
      `The customer pays ₱${finalPrice.toFixed(2)} ` +
      `and saves ₱${savings.toFixed(2)}.`;

    return;
  }

  if (
    discountType === "fixed" &&
    discountValue > 0
  ) {
    editProductDiscountPreviewMessage
      .textContent =
      `₱${discountValue.toFixed(2)} will be deducted. ` +
      `The customer pays ₱${finalPrice.toFixed(2)} ` +
      `and saves ₱${savings.toFixed(2)}.`;

    return;
  }

  editProductDiscountPreviewMessage
    .textContent =
    "Enter a discount greater than zero to preview the promo price.";
}

function updateEditDiscountScheduleVisibility() {
  const hasDiscount =
    editProductDiscountType?.value !==
    "none";

  const isScheduled =
    hasDiscount &&
    editProductDiscountSchedule?.value ===
    "scheduled";

  if (
    editProductDiscountScheduleFields
  ) {
    editProductDiscountScheduleFields
      .hidden =
      !isScheduled;
  }

  if (
    editProductDiscountScheduleHelp
  ) {
    editProductDiscountScheduleHelp
      .textContent =
      isScheduled
        ? "The promotion will automatically start and end using the dates below."
        : "The discount remains available until you manually turn the promotion off.";
  }
}

function updateEditDiscountVisibility() {
  const discountType =
    editProductDiscountType?.value ||
    "none";

  const hasDiscount =
    discountType !== "none";

  if (
    editProductDiscountFields
  ) {
    editProductDiscountFields.hidden =
      !hasDiscount;
  }

  if (
    editProductDiscountValueLabel
  ) {
    editProductDiscountValueLabel
      .textContent =
      discountType === "percentage"
        ? "Discount Percentage (%)"
        : discountType === "fixed"
          ? "Discount Amount (₱)"
          : "Discount Amount";
  }

  if (
    editProductDiscountValueHelp
  ) {
    editProductDiscountValueHelp
      .textContent =
      discountType === "percentage"
        ? "Enter the percentage customers will save. Example: Enter 10 for 10% OFF."
        : discountType === "fixed"
          ? "Enter the exact peso amount to deduct. Example: Enter 50 for ₱50 OFF."
          : "Select a discount type to continue.";
  }

  if (
    editProductDiscountValue
  ) {
    const regularPrice =
      Number(
        document.getElementById(
          "editProductPrice"
        )?.value
      ) || 0;

    if (
      discountType === "percentage"
    ) {
      editProductDiscountValue.max =
        "100";

      editProductDiscountValue.placeholder =
        "Example: 10 for 10% OFF";
    } else if (
      discountType === "fixed"
    ) {
      if (regularPrice > 0) {
        editProductDiscountValue.max =
          String(regularPrice);
      } else {
        editProductDiscountValue
          .removeAttribute(
            "max"
          );
      }

      editProductDiscountValue.placeholder =
        "Example: 50 for ₱50 OFF";
    } else {
      editProductDiscountValue
        .removeAttribute(
          "max"
        );

      editProductDiscountValue.placeholder =
        "Select a discount type first";
    }
  }

  updateEditDiscountScheduleVisibility();
  updateEditDiscountPreview();
}

editProductDiscountType
  ?.addEventListener(
    "change",
    updateEditDiscountVisibility
  );

editProductDiscountSchedule
  ?.addEventListener(
    "change",
    updateEditDiscountScheduleVisibility
  );

editProductDiscountValue
  ?.addEventListener(
    "input",
    updateEditDiscountPreview
  );

document
  .getElementById(
    "editProductPrice"
  )
  ?.addEventListener(
    "input",
    () => {
      updateEditDiscountVisibility();
      updateEditDiscountPreview();
    }
  );

const DEFAULT_PRODUCT_IMAGE = "";

function validateProductImage(
  file
) {
  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Product image must be JPG, PNG, or WEBP."
    );
  }

  const maxSize =
    2 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Product image cannot exceed 2 MB."
    );
  }
}

function showImagePreview(
  file,
  previewContainer,
  previewImage
) {
  validateProductImage(file);

  const reader =
    new FileReader();

  reader.addEventListener(
    "load",
    () => {
      previewImage.src =
        reader.result;

      previewContainer.hidden =
        false;
    }
  );

  reader.readAsDataURL(file);
}

function clearAddProductImage() {
  const imageInput =
    document.getElementById(
      "productImage"
    );

  const preview =
    document.getElementById(
      "productImagePreview"
    );

  const previewImage =
    document.getElementById(
      "productImagePreviewImg"
    );

  if (imageInput) {
    imageInput.value = "";
  }

  if (previewImage) {
    previewImage.src = "";
  }

  if (preview) {
    preview.hidden = true;
  }
}

const productImageInput =
  document.getElementById(
    "productImage"
  );

const productImagePreview =
  document.getElementById(
    "productImagePreview"
  );

const productImagePreviewImg =
  document.getElementById(
    "productImagePreviewImg"
  );

productImageInput?.addEventListener(
  "change",
  () => {
    const file =
      productImageInput.files?.[0];

    if (!file) {
      clearAddProductImage();
      return;
    }

    try {
      showImagePreview(
        file,
        productImagePreview,
        productImagePreviewImg
      );
    } catch (error) {
      alert(error.message);
      clearAddProductImage();
    }
  }
);

document
  .getElementById(
    "removeProductImageBtn"
  )
  ?.addEventListener(
    "click",
    clearAddProductImage
  );

document
  .getElementById(
    "cancelAddProductBtn"
  )
  ?.addEventListener(
    "click",
    () => {
      addProductModal?.classList.remove(
        "show"
      );
    }
  );

document
  .getElementById(
    "cancelEditProductBtn"
  )
  ?.addEventListener(
    "click",
    () => {
      editProductModal?.classList.remove(
        "show"
      );
    }
  );

/* =========================
   ADD PRODUCT
========================= */

if (saveProductBtn) {
  saveProductBtn.addEventListener(
    "click",
    async () => {
      const nameInput =
        document.getElementById(
          "productName"
        );

      const categoryInput =
        document.getElementById(
          "productCategory"
        );

      const descriptionInput =
        document.getElementById(
          "productDescription"
        );

      const sizeInput =
        document.getElementById(
          "productSize"
        );

      const priceInput =
        document.getElementById(
          "productPrice"
        );

      const stockInput =
        document.getElementById(
          "productStock"
        );

      const statusInput =
        document.getElementById(
          "productStatus"
        );

      const imageInput =
        document.getElementById(
          "productImage"
        );

        const discountType =
  productDiscountType?.value ||
  "none";

const discountValue =
  Number(
    productDiscountValue?.value
  ) || 0;

const discountStatus =
  productDiscountStatus?.value ||
  "Inactive";

const discountSchedule =
  productDiscountSchedule?.value ||
  "permanent";

const discountStart =
  productDiscountStart?.value ||
  "";

const discountEnd =
  productDiscountEnd?.value ||
  "";

      const productName =
        nameInput?.value.trim() || "";

      const category =
        categoryInput?.value.trim() || "";

      const description =
        descriptionInput?.value.trim() || "";

      const size =
        sizeInput?.value.trim() || "";

      const price =
        Number(priceInput?.value);

      const stock =
        Number(stockInput?.value);

      const status =
        statusInput?.value ||
        "Available";

      if (!productName) {
        alert(
          "Product name is required."
        );
        nameInput?.focus();
        return;
      }

      if (!category) {
        alert(
          "Product category is required."
        );
        categoryInput?.focus();
        return;
      }

      if (description.length > 1000) {
        alert(
          "Product description cannot exceed 1000 characters."
        );
        descriptionInput?.focus();
        return;
      }

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        alert(
          "Price must be greater than zero."
        );
        priceInput?.focus();
        return;
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        alert(
          "Stock must be zero or a positive whole number."
        );
        stockInput?.focus();
        return;
      }

      if (
  discountType !== "none"
) {
  if (discountValue <= 0) {
    alert(
      "Discount value must be greater than zero."
    );

    productDiscountValue?.focus();
    return;
  }

  if (
    discountType ===
      "percentage" &&
    discountValue > 100
  ) {
    alert(
      "Percentage discount cannot exceed 100%."
    );

    productDiscountValue?.focus();
    return;
  }

  if (
    discountType === "fixed" &&
    discountValue > price
  ) {
    alert(
      "Fixed discount cannot exceed the regular product price."
    );

    productDiscountValue?.focus();
    return;
  }

  if (
    discountSchedule ===
    "scheduled"
  ) {
    if (
      !discountStart ||
      !discountEnd
    ) {
      alert(
        "Start and end dates are required for a scheduled promo."
      );

      return;
    }

    const startTime =
      new Date(discountStart)
        .getTime();

    const endTime =
      new Date(discountEnd)
        .getTime();

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime)
    ) {
      alert(
        "Please enter valid promo dates."
      );

      return;
    }

    if (endTime <= startTime) {
      alert(
        "Promo end date must be later than its start date."
      );

      return;
    }
  }
}

      const imageFile =
        imageInput?.files?.[0];

            if (
        ![
          "none",
          "percentage",
          "fixed"
        ].includes(discountType)
      ) {
        alert(
          "Please select a valid discount type."
        );

        return;
      }

      if (
        discountType !== "none" &&
        discountValue <= 0
      ) {
        alert(
          "Discount value must be greater than zero."
        );

        editProductDiscountValue?.focus();

        return;
      }

      if (
        discountType === "percentage" &&
        discountValue > 100
      ) {
        alert(
          "Percentage discount cannot exceed 100%."
        );

        editProductDiscountValue?.focus();

        return;
      }

      if (
        discountType === "fixed" &&
        discountValue > price
      ) {
        alert(
          "Fixed discount cannot exceed the regular product price."
        );

        editProductDiscountValue?.focus();

        return;
      }

      if (
        discountType !== "none" &&
        ![
          "permanent",
          "scheduled"
        ].includes(discountSchedule)
      ) {
        alert(
          "Please select a valid promotion schedule."
        );

        return;
      }

      if (
        discountType !== "none" &&
        ![
          "Active",
          "Inactive"
        ].includes(discountStatus)
      ) {
        alert(
          "Please select whether the promotion is active or inactive."
        );

        return;
      }

      if (
        discountType !== "none" &&
        discountSchedule === "scheduled"
      ) {
        if (
          !discountStart ||
          !discountEnd
        ) {
          alert(
            "Scheduled promotions require both a start date and an end date."
          );

          return;
        }

        const startDate =
          new Date(discountStart);

        const endDate =
          new Date(discountEnd);

        if (
          Number.isNaN(
            startDate.getTime()
          ) ||
          Number.isNaN(
            endDate.getTime()
          )
        ) {
          alert(
            "Please enter valid promotion dates."
          );

          return;
        }

        if (
          endDate <= startDate
        ) {
          alert(
            "Promotion end date must be later than the start date."
          );

          editProductDiscountEnd?.focus();

          return;
        }
      }

      try {
        validateProductImage(
          imageFile
        );
      } catch (error) {
        alert(error.message);
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "product_name",
        productName
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "size",
        size
      );

      formData.append(
        "price",
        String(price)
      );

      formData.append(
        "stock",
        String(stock)
      );

      formData.append(
        "status",
        status
      );

      formData.append(
  "discount_type",
  discountType
);

formData.append(
  "discount_value",
  String(
    discountType === "none"
      ? 0
      : discountValue
  )
);

formData.append(
  "discount_schedule",
  discountType === "none"
    ? "permanent"
    : discountSchedule
);

const hasScheduledDiscount =
  discountType !== "none" &&
  discountSchedule === "scheduled";

formData.append(
  "discount_start",
  hasScheduledDiscount
    ? discountStart
    : ""
);

formData.append(
  "discount_end",
  hasScheduledDiscount
    ? discountEnd
    : ""
);

formData.append(
  "discount_status",
  discountType === "none"
    ? "Inactive"
    : discountStatus
);

      if (imageFile) {
        formData.append(
          "product_image",
          imageFile
        );
      }

      const originalText =
        saveProductBtn.textContent;

      saveProductBtn.disabled = true;
      saveProductBtn.textContent =
        "Saving...";

      try {
        const result =
          await fetchJSON(
            `${OWNER_API_BASE}/add_product.php`,
            {
              method: "POST",
              body: formData
            }
          );

        const createdProductId = Number(
          result.product_id || result.product?.product_id || 0
        );

        if (createdProductId > 0) {
          await saveProductAddonAssignments(
            createdProductId,
            collectSelectedAddonIds(productAddonChoiceList)
          );
        }

        addProductModal?.classList.remove(
          "show"
        );

        nameInput.value = "";
        categoryInput.value = "";
        if (descriptionInput) {
          descriptionInput.value = "";
        }
        sizeInput.value = "";
        priceInput.value = "";
        stockInput.value = "0";
        statusInput.value =
          "Available";

        clearAddProductImage();
        resetAddProductDiscount();

        await Promise.all([
          loadProducts(),
          loadDashboardSummary()
        ]);

  await loadActivityLogs();

alert(
  result.message ||
  "Product added successfully."
);
      } catch (error) {
        console.error(
          "Add product failed:",
          error
        );

        alert(
          error.message ||
          "Unable to add the product. Please try again."
        );
      } finally {
        saveProductBtn.disabled =
          false;

        saveProductBtn.textContent =
          originalText;
      }
    }
  );
}

/* =========================
   UPDATE PRODUCT
========================= */

if (updateProductBtn) {
  updateProductBtn.addEventListener(
    "click",
    async () => {
      const productId =
        document.getElementById(
          "editProductId"
        )?.value || "";

      const productName =
        document.getElementById(
          "editProductName"
        )?.value.trim() || "";

      const category =
        document.getElementById(
          "editProductCategory"
        )?.value.trim() || "";

      const description =
        document.getElementById(
          "editProductDescription"
        )?.value.trim() || "";

      const size =
        document.getElementById(
          "editProductSize"
        )?.value.trim() || "";

      const price =
        Number(
          document.getElementById(
            "editProductPrice"
          )?.value
        );

      const stock =
        Number(
          document.getElementById(
            "editProductStock"
          )?.value
        );

            const status =
        document.getElementById(
          "editProductStatus"
        )?.value ||
        "Available";

      const discountType =
        editProductDiscountType?.value ||
        "none";

      const discountValue =
        Number(
          editProductDiscountValue?.value
        ) || 0;

      const discountSchedule =
        editProductDiscountSchedule?.value ||
        "permanent";

      const discountStatus =
        editProductDiscountStatus?.value ||
        "Inactive";

      const discountStart =
        editProductDiscountStart?.value ||
        "";

      const discountEnd =
        editProductDiscountEnd?.value ||
        "";

      const imageFile =
        editProductImageInput
          ?.files?.[0];

      const removeImage =
        removeExistingImageInput
          ?.value || "0";

      if (!productId) {
        alert(
          "Product ID is missing."
        );
        return;
      }

      if (!productName) {
        alert(
          "Product name is required."
        );
        return;
      }

      if (!category) {
        alert(
          "Product category is required."
        );
        return;
      }

      if (description.length > 1000) {
        alert(
          "Product description cannot exceed 1000 characters."
        );
        document.getElementById(
          "editProductDescription"
        )?.focus();
        return;
      }

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        alert(
          "Price must be greater than zero."
        );
        return;
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        alert(
          "Stock must be zero or a positive whole number."
        );
        return;
      }

      try {
        validateProductImage(
          imageFile
        );
      } catch (error) {
        alert(error.message);
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "product_id",
        productId
      );

      formData.append(
        "product_name",
        productName
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "size",
        size
      );

      formData.append(
        "price",
        String(price)
      );

      formData.append(
        "stock",
        String(stock)
      );

            formData.append(
        "status",
        status
      );

      formData.append(
        "discount_type",
        discountType
      );

      formData.append(
        "discount_value",
        discountType === "none"
          ? "0"
          : String(
              discountValue
            )
      );

      formData.append(
        "discount_schedule",
        discountType === "none"
          ? "permanent"
          : discountSchedule
      );

      const isScheduledDiscount =
        discountType !== "none" &&
        discountSchedule ===
          "scheduled";

      formData.append(
        "discount_start",
        isScheduledDiscount
          ? discountStart
          : ""
      );

      formData.append(
        "discount_end",
        isScheduledDiscount
          ? discountEnd
          : ""
      );

      formData.append(
        "discount_status",
        discountType === "none"
          ? "Inactive"
          : discountStatus
      );

      formData.append(
        "remove_image",
        removeImage
      );

      if (imageFile) {
        formData.append(
          "product_image",
          imageFile
        );
      }

      const originalText =
        updateProductBtn.textContent;

      updateProductBtn.disabled =
        true;

      updateProductBtn.textContent =
        "Updating...";

      try {
        const result =
          await fetchJSON(
            `${OWNER_API_BASE}/update_product.php`,
            {
              method: "POST",
              body: formData
            }
          );

        await saveProductAddonAssignments(
          Number(productId),
          collectSelectedAddonIds(editProductAddonChoiceList)
        );

        editProductModal?.classList.remove(
          "show"
        );

        await Promise.all([
          loadProducts(),
          loadDashboardSummary()
        ]);

        await loadActivityLogs();

        alert(
          result.message ||
          "Product updated successfully."
        );
      } catch (error) {
        console.error(
          "Update product failed:",
          error
        );

        alert(
          error.message ||
          "Unable to update product."
        );
      } finally {
        updateProductBtn.disabled =
          false;

        updateProductBtn.textContent =
          originalText;
      }
    }
  );
}

/* =========================
   RESTOCK
========================= */

function getSelectedRestockProduct() {
  if (!restockProduct) {
    return null;
  }

  return products.find(
    product =>
      String(product.id) ===
      String(restockProduct.value)
  ) || null;
}

function getValidRestockQuantity() {
  const quantity =
    Number(restockQuantity?.value);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return 0;
  }

  return quantity;
}

function updateRestockPreview() {
  const selectedProduct =
    getSelectedRestockProduct();

    if(selectedProduct){

    restockProductName.textContent =
        selectedProduct.name;

    const category =
        selectedProduct.category ||
        "Uncategorized";

    const variant =
        selectedProduct.size ||
        "Standard";

    restockProductMeta.textContent =
        `${category} • ${variant}`;

}

  const currentStock =
    Math.max(
      0,
      Number(
        selectedProduct?.stock
      ) || 0
    );

  const quantity =
    getValidRestockQuantity();

  if (restockCurrentStock) {
    restockCurrentStock.textContent =
      currentStock;
  }

  if (restockNewStock) {
    restockNewStock.textContent =
      currentStock + quantity;
  }
}

function showRestockMessage(
  message = "",
  type = "error"
) {
  if (!restockFormMessage) {
    return;
  }

  restockFormMessage.textContent =
    message;

  restockFormMessage.hidden =
    message === "";

  restockFormMessage.classList.toggle(
    "success",
    type === "success"
  );
}

function resetRestockModal() {
  if (restockQuantity) {
    restockQuantity.value = "";
  }

  showRestockMessage();
  updateRestockPreview();
}

function closeRestockDialog() {
  restockModal?.classList.remove(
    "show"
  );

  resetRestockModal();
}

function populateRestockProducts() {
  const select = document.getElementById("restockProduct");
  if (!select) return;

  select.innerHTML = products.length
    ? products.map(p => `
      <option value="${p.id}">${p.name}${p.size ? " - " + p.size : ""}</option>
    `).join("")
    : `<option value="">No products available</option>`;
}

restockProduct?.addEventListener(
  "change",
  () => {
    showRestockMessage();
    updateRestockPreview();
  }
);

restockQuantity?.addEventListener(
  "input",
  () => {
    const cleanedValue =
      String(
        restockQuantity.value || ""
      )
        .replace(/[^\d]/g, "")
        .replace(/^0+(?=\d)/, "");

    restockQuantity.value =
      cleanedValue;

    showRestockMessage();
    updateRestockPreview();
  }
);

decreaseRestockQuantity
  ?.addEventListener(
    "click",
    () => {
      if (!restockQuantity) {
        return;
      }

      const currentValue =
        getValidRestockQuantity();

      restockQuantity.value =
        Math.max(
          1,
          currentValue - 1
        );

      showRestockMessage();
      updateRestockPreview();
    }
  );

increaseRestockQuantity
  ?.addEventListener(
    "click",
    () => {
      if (!restockQuantity) {
        return;
      }

      const currentValue =
        getValidRestockQuantity();

      restockQuantity.value =
        currentValue > 0
          ? currentValue + 1
          : 1;

      showRestockMessage();
      updateRestockPreview();
    }
  );

cancelRestockBtn?.addEventListener(
  "click",
  closeRestockDialog
);

if (saveRestockBtn) {
  saveRestockBtn.addEventListener(
    "click",
    async () => {
      const selectedProduct =
        getSelectedRestockProduct();

      const quantity =
        getValidRestockQuantity();

      if (!selectedProduct) {
        showRestockMessage(
          "Please select a valid product."
        );

        restockProduct?.focus();
        return;
      }

      if (quantity <= 0) {
        showRestockMessage(
          "Enter a quantity greater than zero."
        );

        restockQuantity?.focus();
        return;
      }

      const payload = {
        product_id:
          selectedProduct.id,

        quantity
      };

      const originalHTML =
        saveRestockBtn.innerHTML;

      try {
        saveRestockBtn.disabled =
          true;

        saveRestockBtn.innerHTML = `
          Updating Inventory...
        `;

        showRestockMessage();

        const result =
          await fetchJSON(
            `${OWNER_API_BASE}/restock_product.php`,
            {
              method: "POST",

              body: JSON.stringify(
                payload
              )
            }
          );

        if (!result.success) {
          throw new Error(
            result.message ||
            "Failed to update stock."
          );
        }

        const productLabel =
          `${selectedProduct.name}${
            selectedProduct.size
              ? ` - ${selectedProduct.size}`
              : ""
          }`;

        await Promise.all([
          loadProducts(),
          loadDashboardSummary()
        ]);

        await loadActivityLogs();

        closeRestockDialog();

        alert(
          `${productLabel} stock was updated successfully.`
        );

      } catch (error) {
        console.error(
          "Restock failed:",
          error
        );

        showRestockMessage(
          error.message ||
          "Unable to update inventory."
        );

      } finally {
        saveRestockBtn.disabled =
          false;

        saveRestockBtn.innerHTML =
          originalHTML;
      }
    }
  );
}

/* =========================
   EVENTS
========================= */

if (cashierPerformanceRange) {
  cashierPerformanceRange.addEventListener(
    "change",
    () => {
      const range =
        cashierPerformanceRange.value;

      if (deliveryPerformanceRange) {
        deliveryPerformanceRange.value =
          range;
      }

      loadSalesReport(range);
    }
  );
}

if (deliveryPerformanceRange) {
  deliveryPerformanceRange.addEventListener(
    "change",
    () => {
      const range =
        deliveryPerformanceRange.value;

      if (cashierPerformanceRange) {
        cashierPerformanceRange.value =
          range;
      }

      loadSalesReport(range);
    }
  );
}

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetSection =
      btn.dataset.section;

    // Existing navigation code continues here

    const currentSection =
      document.querySelector(
        ".content-section.active-section"
      );

    if (
      currentSection?.id ===
        "settingsSection" &&
      targetSection !==
        "settingsSection" &&
      settingsHaveChanges()
    ) {
      const shouldLeave =
        window.confirm(
          "You have unsaved restaurant settings. Leave without saving?"
        );

      if (!shouldLeave) {
        return;
      }

      /*
       * Reset the form to the last saved data
       * when the owner chooses to leave.
       */
      if (savedRestaurantSettings) {
        if (settingsRestaurantName) {
          settingsRestaurantName.value =
            savedRestaurantSettings.name;
        }

        if (settingsContactNumber) {
          settingsContactNumber.value =
            window.FoodConnectPhone.toLocalDigits(savedRestaurantSettings.contact_number);
        }

        if (settingsAddress) {
          settingsAddress.value =
            savedRestaurantSettings.address;
        }

        if (settingsOpeningHours) {
          settingsOpeningHours.value =
            savedRestaurantSettings.opening_hours;
        }

        if (settingsDeliveryFee) {
          settingsDeliveryFee.value =
            Number(
              savedRestaurantSettings.delivery_fee
            ).toFixed(2);
        }

        setSelectedBusinessStatus(
          savedRestaurantSettings.business_status
        );

        updateSettingsPreview();

        setSettingsSaveState(
          "saved",
          "All changes saved"
        );

        if (saveSettingsBtn) {
          saveSettingsBtn.disabled = true;
        }
      }
    }

    navItems.forEach(item => {
      item.classList.remove("active");
    });

    btn.classList.add("active");

    sections.forEach(section => {
      section.classList.toggle(
        "active-section",
        section.id === targetSection
      );
    });

    /*
     * Load expensive cloud-backed section data only when that
     * section is actually opened.
     */
    void ensureOwnerSectionLoaded(
      targetSection
    ).catch(error => {
      console.error(
        `Unable to load ${targetSection}:`,
        error
      );
    });

    sidebar?.classList.remove("show");
  });
});

document.querySelectorAll(".view-all-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    sections.forEach(section => {
      section.classList.toggle("active-section", section.id === target);
    });

    navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.section === target);
    });

    void ensureOwnerSectionLoaded(
      target
    ).catch(error => {
      console.error(
        `Unable to load ${target}:`,
        error
      );
    });
  });
});

logFilter?.addEventListener(
  "change",
  () => {
    currentLogFilter =
      logFilter.value;

    renderActivityLogs();
  }
);

activitySearch?.addEventListener(
  "input",
  renderActivityLogs
);

activitySearch?.addEventListener(
  "keydown",
  event => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    renderActivityLogs();

    activitySearch.blur();

    document
      .querySelector(
        ".activity-timeline-panel"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  }
);

activityDateFilter?.addEventListener(
  "change",
  renderActivityLogs
);

clearActivityFilters
  ?.addEventListener(
    "click",
    () => {
      if (activitySearch) {
        activitySearch.value = "";
      }

      if (logFilter) {
        logFilter.value = "all";
      }

      if (activityDateFilter) {
        activityDateFilter.value =
          "all";
      }

      currentLogFilter = "all";

      renderActivityLogs();
    }
  );

refreshActivityLogs
  ?.addEventListener(
    "click",
    async () => {
      const originalHTML =
        refreshActivityLogs.innerHTML;

      try {
        refreshActivityLogs.disabled =
          true;

        refreshActivityLogs.innerHTML = `
          <span aria-hidden="true">
            ↻
          </span>
          Refreshing...
        `;

        await loadActivityLogs();

      } finally {
        refreshActivityLogs.disabled =
          false;

        refreshActivityLogs.innerHTML =
          originalHTML;
      }
    }
  );

reportSalesRange?.addEventListener(
  "change",
  async () => {
    const range =
      reportSalesRange.value;

    /*
     * Keep the staff performance selectors synchronized
     * until they are removed during the analytics redesign.
     */
    if (cashierPerformanceRange) {
      cashierPerformanceRange.value =
        range;
    }

    if (deliveryPerformanceRange) {
      deliveryPerformanceRange.value =
        range;
    }

    reportSalesRange.disabled =
      true;

    try {
      await Promise.all([
        loadSalesReport(range),
        loadReportSalesChart(range)
      ]);

    } catch (error) {
      console.error(
        "Analytics range update failed:",
        error
      );

      alert(
        error.message ||
        "Unable to update the analytics period."
      );

    } finally {
      reportSalesRange.disabled =
        false;
    }
  }
);

exportExcelBtn?.addEventListener("click", exportSalesReportExcel);
exportPdfBtn?.addEventListener("click", exportSalesReportPDF);
exportCsvBtn?.addEventListener("click", exportSalesReportCSV);

salesRange?.addEventListener(
  "change",
  () => {
    loadDashboardSalesChart(
      salesRange.value
    );
  }
);

globalSearch?.addEventListener(
  "input",
  () => {
    const query =
      globalSearch.value
        .toLowerCase()
        .trim();

    if (productSearch) {
      productSearch.value =
        query;
    }

    applyProductFilters();
  }
);

inventorySearch?.addEventListener("input", applyInventoryFilters);
inventoryFilter?.addEventListener("change", applyInventoryFilters);
inventoryCategoryFilter?.addEventListener("change", applyInventoryFilters);

productSearch?.addEventListener("input", applyProductFilters);
productCategoryFilter?.addEventListener("change", applyProductFilters);
productSort?.addEventListener("change", applyProductFilters);

userSearch?.addEventListener("input", applyUserFilters);
userRoleFilter?.addEventListener("change", applyUserFilters);
userStatusFilter?.addEventListener("change", applyUserFilters);
/* =========================
   ADD USER
========================= */

saveUserBtn?.addEventListener(
  "click",
  async () => {
    const fullNameInput =
      document.getElementById(
        "userFullName"
      );

    const emailInput =
      document.getElementById(
        "userEmail"
      );

    const contactInput =
      document.getElementById(
        "userContactNumber"
      );

    const addressInput =
      document.getElementById(
        "userAddress"
      );

    const passwordInput =
      document.getElementById(
        "userPassword"
      );

    const roleInput =
      document.getElementById(
        "userRole"
      );

    const statusInput =
      document.getElementById(
        "userStatus"
      );

    const fullName =
      fullNameInput?.value.trim() || "";

    const email =
      emailInput?.value.trim().toLowerCase() || "";

    const contactNumber =
      contactInput?.value.trim() || "";

    const address =
      addressInput?.value.trim() || "";

    const password =
      passwordInput?.value || "";

    const role =
      roleInput?.value || "";

    const status =
      Number(
        statusInput?.value ?? 1
      );

    if (!fullName) {
      alert("Full name is required.");
      fullNameInput?.focus();
      return;
    }

    if (!email) {
      alert("Email is required.");
      emailInput?.focus();
      return;
    }

    if (!password) {
      alert("Password is required.");
      passwordInput?.focus();
      return;
    }

    if (
      contactNumber &&
      !window.FoodConnectPhone.isValid(
        contactNumber
      )
    ) {
      alert(
        "Enter a valid Philippine mobile number after +63, starting with 9."
      );

      contactInput?.focus();
      return;
    }

    const originalText =
      saveUserBtn.textContent;

    try {
      saveUserBtn.disabled = true;
      saveUserBtn.textContent =
        "Saving...";

      const result = await fetchJSON(
        `${OWNER_API_BASE}/add_user.php`,
        {
          method: "POST",

          body: JSON.stringify({
            full_name: fullName,
            email,
            contact_number:
              contactNumber
                ? window.FoodConnectPhone.normalize(contactNumber)
                : "",
            address,
            password,
            role,
            status
          })
        }
      );

      if (!result.success) {
        throw new Error(
          result.message ||
          "Unable to add the user."
        );
      }

      addUserModal?.classList.remove(
        "show"
      );

      if (fullNameInput) {
        fullNameInput.value = "";
      }

      if (emailInput) {
        emailInput.value = "";
      }

      if (contactInput) {
        contactInput.value = "";
      }

      if (addressInput) {
        addressInput.value = "";
      }

      if (passwordInput) {
        passwordInput.value = "";
      }

      if (roleInput) {
        roleInput.value = "cashier";
      }

      if (statusInput) {
        statusInput.value = "1";
      }

      await Promise.all([
        loadUsers(),
        loadDashboardSummary()
      ]);

      await saveActivityLog(
        "staff",
        "Staff Account Created",
        `${fullName} was added as ${role}.`
      );

      await loadActivityLogs();

      alert(
        result.message ||
        "User added successfully."
      );

    } catch (error) {
      console.error(
        "Add user failed:",
        error
      );

      alert(
        error.message ||
        "Unable to add the user."
      );

    } finally {
      saveUserBtn.disabled = false;
      saveUserBtn.textContent =
        originalText;
    }
  }
);

updateUserBtn?.addEventListener(
  "click",
  async () => {
    const userIdInput =
      document.getElementById(
        "editUserId"
      );

    const fullNameInput =
      document.getElementById(
        "editUserFullName"
      );

    const emailInput =
      document.getElementById(
        "editUserEmail"
      );

    const contactInput =
      document.getElementById(
        "editUserContactNumber"
      );

    const addressInput =
      document.getElementById(
        "editUserAddress"
      );

    const roleInput =
      document.getElementById(
        "editUserRole"
      );

    const statusInput =
      document.getElementById(
        "editUserStatus"
      );

    const userId =
      Number(userIdInput?.value || 0);

    const fullName =
      fullNameInput?.value.trim() || "";

    const email =
      emailInput?.value
        .trim()
        .toLowerCase() || "";

    const contactNumber =
      contactInput?.value.trim() || "";

    const address =
      addressInput?.value.trim() || "";

    const role =
      roleInput?.value || "";

    const status =
      Number(statusInput?.value ?? 1);

    if (!userId) {
      alert("Invalid user account.");
      return;
    }

    if (!fullName) {
      alert("Full name is required.");
      fullNameInput?.focus();
      return;
    }

    if (!email) {
      alert("Email is required.");
      emailInput?.focus();
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      alert(
        "Please enter a valid email address."
      );

      emailInput?.focus();
      return;
    }

    if (
      contactNumber &&
      !window.FoodConnectPhone.isValid(
        contactNumber
      )
    ) {
      alert(
        "Enter a valid Philippine mobile number after +63, starting with 9."
      );

      contactInput?.focus();
      return;
    }

    if (!role) {
      alert("Please select a staff role.");
      roleInput?.focus();
      return;
    }

    const originalText =
      updateUserBtn.textContent;

    try {
      updateUserBtn.disabled = true;
      updateUserBtn.textContent =
        "Updating...";

      const result = await fetchJSON(
        `${OWNER_API_BASE}/update_user.php`,
        {
          method: "POST",

          body: JSON.stringify({
            user_id: userId,
            full_name: fullName,
            email,
            contact_number:
              contactNumber
                ? window.FoodConnectPhone.normalize(contactNumber)
                : "",
            address,
            role,
            status
          })
        }
      );

      if (!result.success) {
        throw new Error(
          result.message ||
          "Unable to update the user."
        );
      }

      editUserModal?.classList.remove(
        "show"
      );

      await Promise.all([
        loadUsers(),
        loadDashboardSummary()
      ]);

      await saveActivityLog(
        "staff",
        "Staff Account Updated",
        `${fullName}'s staff account was updated.`
      );

      await loadActivityLogs();

      alert(
        result.message ||
        "User updated successfully."
      );

    } catch (error) {
      console.error(
        "Update user failed:",
        error
      );

      alert(
        error.message ||
        "Unable to update the user."
      );

    } finally {
      updateUserBtn.disabled = false;
      updateUserBtn.textContent =
        originalText;
    }
  }
);

openAddUserModal?.addEventListener("click", () => addUserModal.classList.add("show"));
closeAddUserModal?.addEventListener("click", () => addUserModal.classList.remove("show"));
closeEditUserModal?.addEventListener("click", () => editUserModal.classList.remove("show"));

menuToggle?.addEventListener("click", () => sidebar?.classList.add("show"));
closeSidebar?.addEventListener("click", () => sidebar?.classList.remove("show"));

openAddProductModal?.addEventListener("click", () => {
  if (activeProductMode === "addons") {
    openAddonModal();
    return;
  }

  renderAddonChoiceList(productAddonChoiceList, []);
  addProductModal?.classList.add("show");
});
closeAddProductModal?.addEventListener("click", () => addProductModal.classList.remove("show"));

closeEditProductModal?.addEventListener("click", () => {
  editProductModal.classList.remove("show");
});

closeRestockModal?.addEventListener(
  "click",
  closeRestockDialog
);
logoutBtn?.addEventListener("click", () => {
  window.location.href = "/FoodConnect/api/logout.php";
});


/* =========================
   ADD-ON MANAGEMENT
========================= */

function getAddonProducts() {
  return products.filter(product => product.itemType === "add_on");
}

function collectSelectedAddonIds(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
    .map(input => Number(input.value))
    .filter(id => Number.isInteger(id) && id > 0);
}

function renderAddonChoiceList(container, selectedIds = []) {
  if (!container) return;

  const addons = getAddonProducts();
  const selected = new Set((selectedIds || []).map(Number));

  if (!addons.length) {
    container.innerHTML = `
      <div class="product-addon-empty">
        No add-ons yet. Open the Add-ons tab and create one first.
      </div>
    `;
    return;
  }

  container.innerHTML = addons.map(addon => `
    <label class="product-addon-choice">
      <span>
        <input
          type="checkbox"
          value="${Number(addon.id)}"
          ${selected.has(Number(addon.id)) ? "checked" : ""}
        />
        <span class="product-addon-choice-name">${escapeHtml(addon.name)}</span>
      </span>
      <strong>+${formatPeso(addon.regularPrice)}</strong>
    </label>
  `).join("");
}

function renderAddonChoiceLists() {
  renderAddonChoiceList(
    productAddonChoiceList,
    collectSelectedAddonIds(productAddonChoiceList)
  );
}

async function saveProductAddonAssignments(productId, addonIds) {
  if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) return;

  await fetchJSON(
    `${OWNER_API_BASE}/save_product_addons.php`,
    {
      method: "POST",
      body: JSON.stringify({
        product_id: Number(productId),
        addon_ids: addonIds || []
      })
    }
  );
}

window.saveProductAddonAssignments =
  saveProductAddonAssignments;

function setProductMode(mode) {
  activeProductMode = mode === "addons" ? "addons" : "menu";

  menuItemsTabBtn?.classList.toggle("is-active", activeProductMode === "menu");
  addonsTabBtn?.classList.toggle("is-active", activeProductMode === "addons");
  menuItemsTabBtn?.setAttribute("aria-selected", activeProductMode === "menu" ? "true" : "false");
  addonsTabBtn?.setAttribute("aria-selected", activeProductMode === "addons" ? "true" : "false");

  document.getElementById("productsSection")?.classList.toggle(
    "showing-addons",
    activeProductMode === "addons"
  );

  const label = openAddProductModal?.querySelector("span:last-child");
  if (label) {
    label.textContent = activeProductMode === "addons" ? "Add Add-on" : "Add Product";
  }

  if (productSearch) {
    productSearch.placeholder = activeProductMode === "addons" ? "Search add-ons..." : "Search products...";
  }

  if (productCategoryFilter) {
    productCategoryFilter.hidden = activeProductMode === "addons";
  }

  if (productSort) {
    Array.from(productSort.options).forEach(option => {
      if (["stock-low", "stock-high"].includes(option.value)) {
        option.hidden = activeProductMode === "addons";
      }
    });

    if (
      activeProductMode === "addons" &&
      ["stock-low", "stock-high"].includes(productSort.value)
    ) {
      productSort.value = "newest";
    }
  }

  applyProductFilters();
}

function renderAddons(list) {
  if (!productsGrid) return;

  if (!list.length) {
    productsGrid.innerHTML = `
      <div class="product-empty-state">
        <div class="product-empty-icon">＋</div>
        <h3>No add-ons yet</h3>
        <p>Create extras such as Espresso Shot, Pearls, Syrup, Cheese, or Extra Rice.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = list.map(addon => {
    const available = String(addon.status || "").toLowerCase() === "available";

    return `
      <article class="addon-management-card">
        <div class="addon-management-main">
          <div>
            <span class="product-card-category">ADD-ON</span>
            <h3>${escapeHtml(addon.name)}</h3>
            <p>Optional extra for assigned menu items.</p>
          </div>
          <span class="addon-availability-badge ${available ? "is-available" : "is-unavailable"}">
            ${available ? "Available" : "Unavailable"}
          </span>
        </div>

        <div class="addon-management-price">
          <span>Extra price</span>
          <strong>${formatPeso(addon.regularPrice)}</strong>
        </div>

        <div class="addon-no-stock-inline">No stock / quantity tracking</div>

        <div class="product-actions">
          <button type="button" class="product-action-btn product-edit-btn"
            onclick="openEditAddonModal(${Number(addon.id)})">
            <span>✎</span> Edit
          </button>
          <button type="button" class="product-action-btn product-delete-btn"
            onclick="deleteProduct(${Number(addon.id)})">
            <span>⌫</span> Delete
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function resetAddonModal() {
  if (addonProductId) addonProductId.value = "";
  if (addonName) addonName.value = "";
  if (addonPrice) addonPrice.value = "";
  if (addonStatus) addonStatus.value = "Available";
  if (addonModalTitle) addonModalTitle.textContent = "Add Add-on";
  if (saveAddonBtn) saveAddonBtn.textContent = "Save Add-on";
}

function openAddonModal() {
  resetAddonModal();
  addonModal?.classList.add("show");
}

window.openEditAddonModal = function(id) {
  const addon = products.find(
    product => Number(product.id) === Number(id) && product.itemType === "add_on"
  );

  if (!addon) {
    alert("Add-on not found.");
    return;
  }

  addonProductId.value = String(addon.id);
  addonName.value = addon.name || "";
  addonPrice.value = String(addon.regularPrice || "");
  addonStatus.value =
    String(addon.status || "").toLowerCase() === "unavailable"
      ? "Unavailable"
      : "Available";

  addonModalTitle.textContent = "Edit Add-on";
  saveAddonBtn.textContent = "Update Add-on";
  addonModal?.classList.add("show");
};

menuItemsTabBtn?.addEventListener("click", () => setProductMode("menu"));
addonsTabBtn?.addEventListener("click", () => setProductMode("addons"));
document.getElementById("closeAddonModal")?.addEventListener("click", () => addonModal?.classList.remove("show"));
document.getElementById("cancelAddonBtn")?.addEventListener("click", () => addonModal?.classList.remove("show"));

saveAddonBtn?.addEventListener("click", async () => {
  const id = Number(addonProductId?.value || 0);
  const name = addonName?.value.trim() || "";
  const price = Number(addonPrice?.value);
  const status = addonStatus?.value || "Available";

  if (!name) {
    alert("Add-on name is required.");
    addonName?.focus();
    return;
  }

  if (!Number.isFinite(price) || price <= 0) {
    alert("Extra price must be greater than zero.");
    addonPrice?.focus();
    return;
  }

  const original = saveAddonBtn.textContent;

  try {
    saveAddonBtn.disabled = true;
    saveAddonBtn.textContent = id > 0 ? "Updating..." : "Saving...";

    const endpoint = id > 0 ? "update_addon.php" : "add_addon.php";
    const payload = { name, price, status };
    if (id > 0) payload.product_id = id;

    const result = await fetchJSON(
      `${OWNER_API_BASE}/${endpoint}`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    addonModal?.classList.remove("show");

    await Promise.all([
      loadProducts(),
      loadDashboardSummary()
    ]);

    alert(result.message || "Add-on saved successfully.");
  } catch (error) {
    console.error("Save add-on failed:", error);
    alert(error.message || "Changes could not be saved add-on.");
  } finally {
    saveAddonBtn.disabled = false;
    saveAddonBtn.textContent = original;
  }
});

/* =========================
   WINDOW FUNCTIONS
========================= */

window.openEditUserModal = function(id) {
  const user = users.find(u => u.id == id);

  if (!user) {
    alert("User not found.");
    return;
  }

  document.getElementById("editUserId").value = user.id;
  document.getElementById("editUserFullName").value = user.full_name;
  document.getElementById("editUserEmail").value = user.email;
  document.getElementById("editUserContactNumber").value = window.FoodConnectPhone.toLocalDigits(user.contact_number);
document.getElementById("editUserAddress").value = user.address || "";
  document.getElementById("editUserRole").value = user.role;
  document.getElementById("editUserStatus").value = String(user.status);

  editUserModal.classList.add("show");
};

function showOwnerActionToast(message, type = "success") {
  let toast =
    document.getElementById(
      "ownerActionToast"
    );

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ownerActionToast";
    toast.className = "owner-action-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  window.clearTimeout(
    showOwnerActionToast.hideTimer
  );

  toast.className =
    `owner-action-toast ${type}`;
  toast.textContent = String(message || "");

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  showOwnerActionToast.hideTimer =
    window.setTimeout(() => {
      toast.classList.remove("show");
    }, 4200);
}

function closeResetStaffPasswordDialog() {
  resetStaffPasswordModal?.classList.remove(
    "show"
  );

  if (resetStaffUserId) {
    resetStaffUserId.value = "";
  }

  if (resetStaffUserName) {
    resetStaffUserName.textContent = "—";
  }

  if (resetStaffTemporaryPassword) {
    resetStaffTemporaryPassword.value = "";
  }

  if (resetStaffConfirmPassword) {
    resetStaffConfirmPassword.value = "";
  }
}

window.openResetStaffPasswordModal =
  function(id) {
    const user =
      users.find(
        item =>
          Number(item.id) === Number(id)
      );

    if (!user) {
      alert("Staff account not found.");
      return;
    }

    if (
      String(user.role || "")
        .toLowerCase() === "owner"
    ) {
      alert(
        "The restaurant owner's password cannot be reset from Staff Management."
      );
      return;
    }

    if (resetStaffUserId) {
      resetStaffUserId.value =
        String(user.id);
    }

    if (resetStaffUserName) {
      resetStaffUserName.textContent =
        `${user.full_name} (${String(user.role || "").replaceAll("_", " ")})`;
    }

    if (resetStaffTemporaryPassword) {
      resetStaffTemporaryPassword.value =
        "";
    }

    if (resetStaffConfirmPassword) {
      resetStaffConfirmPassword.value =
        "";
    }

    resetStaffPasswordModal?.classList.add(
      "show"
    );

    window.setTimeout(() => {
      resetStaffTemporaryPassword?.focus();
    }, 80);
  };

closeResetStaffPasswordModalBtn
  ?.addEventListener(
    "click",
    closeResetStaffPasswordDialog
  );

cancelResetStaffPasswordBtn
  ?.addEventListener(
    "click",
    closeResetStaffPasswordDialog
  );

resetStaffPasswordModal?.addEventListener(
  "click",
  event => {
    if (
      event.target ===
      resetStaffPasswordModal
    ) {
      closeResetStaffPasswordDialog();
    }
  }
);

saveResetStaffPasswordBtn
  ?.addEventListener(
    "click",
    async () => {
      const userId =
        Number(
          resetStaffUserId?.value || 0
        );

      const temporaryPassword =
        resetStaffTemporaryPassword
          ?.value || "";

      const confirmPassword =
        resetStaffConfirmPassword
          ?.value || "";

      if (!userId) {
        alert("Select a valid staff account.");
        return;
      }

      if (
        temporaryPassword.length < 8
      ) {
        alert(
          "Temporary password must contain at least 8 characters."
        );

        resetStaffTemporaryPassword
          ?.focus();

        return;
      }

      if (
        temporaryPassword !==
        confirmPassword
      ) {
        alert(
          "Temporary password and confirmation do not match."
        );

        resetStaffConfirmPassword
          ?.focus();

        return;
      }

      const originalText =
        saveResetStaffPasswordBtn
          .textContent;

      try {
        saveResetStaffPasswordBtn
          .disabled = true;

        saveResetStaffPasswordBtn
          .textContent =
          "Saving...";

        const result =
          await fetchJSON(
            `${OWNER_API_BASE}/reset_staff_password.php`,
            {
              method: "POST",
              body: JSON.stringify({
                user_id: userId,
                new_password:
                  temporaryPassword
              })
            }
          );

        if (!result.success) {
          throw new Error(
            result.message ||
            "Unable to reset the staff password."
          );
        }

        closeResetStaffPasswordDialog();

        await loadUsers();
        await loadActivityLogs();

        showOwnerActionToast(
          result.message ||
          "Temporary password saved. The staff member must create a new password at the next login.",
          "success"
        );

      } catch (error) {
        console.error(
          "Reset staff password failed:",
          error
        );

        showOwnerActionToast(
          error.message ||
          "Unable to reset the staff password.",
          "error"
        );

      } finally {
        saveResetStaffPasswordBtn
          .disabled = false;

        saveResetStaffPasswordBtn
          .textContent =
          originalText;
      }
    }
  );

resetStaffTemporaryPassword
  ?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        resetStaffConfirmPassword
          ?.focus();
      }
    }
  );

resetStaffConfirmPassword
  ?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveResetStaffPasswordBtn
          ?.click();
      }
    }
  );

window.deleteUser = async function(id) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  const result = await fetchJSON("http://localhost/FoodConnect/api/delete_user.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: id
    })
  });

  if (!result.success) {
    alert(result.message || "Failed to delete user.");
    return;
  }

  await loadUsers();

  alert("User deleted successfully.");
};

window.openEditProductModal = function(id) {
  const p = products.find(
    product => product.id == id
  );

  if (!p) {
    alert("Product not found.");
    return;
  }

  // Open first so a secondary preview/helper can never block the editor itself.
  if (!editProductModal) {
    console.error("Edit Product modal element was not found.");
    alert("Unable to open the Edit Product form. Please refresh the page.");
    return;
  }

  editProductModal.classList.add("show");

  const editIdInput =
    document.getElementById(
      "editProductId"
    );

  const editNameInput =
    document.getElementById(
      "editProductName"
    );

  const editCategoryInput =
    document.getElementById(
      "editProductCategory"
    );

  const editDescriptionInput =
    document.getElementById(
      "editProductDescription"
    );

  const editSizeInput =
    document.getElementById(
      "editProductSize"
    );

  const editPriceInput =
    document.getElementById(
      "editProductPrice"
    );

  const editStockInput =
    document.getElementById(
      "editProductStock"
    );

   const editStatusInput =
    document.getElementById(
      "editProductStatus"
    );

  const savedDiscountType =
    ["percentage", "fixed"].includes(
      String(
        p.discountType || ""
      )
        .trim()
        .toLowerCase()
    )
      ? String(
          p.discountType
        )
          .trim()
          .toLowerCase()
      : "none";

  const savedDiscountSchedule =
    String(
      p.discountSchedule ||
      "permanent"
    )
      .trim()
      .toLowerCase() ===
    "scheduled"
      ? "scheduled"
      : "permanent";

  const savedDiscountStatus =
    String(
      p.discountStatus ||
      "Inactive"
    )
      .trim()
      .toLowerCase() ===
    "active"
      ? "Active"
      : "Inactive";

  if (editIdInput) {
    editIdInput.value = p.id;
  }

  if (editNameInput) {
    editNameInput.value =
      p.name || "";
  }

  if (editCategoryInput) {
    editCategoryInput.value =
      p.category || "";
  }

  if (editDescriptionInput) {
    editDescriptionInput.value =
      p.description || "";
  }

  if (editSizeInput) {
    editSizeInput.value =
      p.size || "";
  }

  if (editPriceInput) {
    editPriceInput.value =
      p.price;
  }

  if (editStockInput) {
    editStockInput.value =
      p.stock;
  }

   if (editStatusInput) {
    editStatusInput.value =
      String(p.status)
        .trim()
        .toLowerCase() ===
      "unavailable"
        ? "Unavailable"
        : "Available";
  }

  if (
    editProductDiscountType
  ) {
    editProductDiscountType.value =
      savedDiscountType;
  }

  if (
    editProductDiscountValue
  ) {
    editProductDiscountValue.value =
      savedDiscountType === "none"
        ? "0"
        : String(
            Number(
              p.discountValue
            ) || 0
          );
  }

  if (
    editProductDiscountSchedule
  ) {
    editProductDiscountSchedule.value =
      savedDiscountSchedule;
  }

  if (
    editProductDiscountStatus
  ) {
    editProductDiscountStatus.value =
      savedDiscountType === "none"
        ? "Inactive"
        : savedDiscountStatus;
  }

  if (
    editProductDiscountStart
  ) {
    editProductDiscountStart.value =
      savedDiscountSchedule ===
      "scheduled"
        ? formatDateTimeLocalValue(
            p.discountStart
          )
        : "";
  }

  if (
    editProductDiscountEnd
  ) {
    editProductDiscountEnd.value =
      savedDiscountSchedule ===
      "scheduled"
        ? formatDateTimeLocalValue(
            p.discountEnd
          )
        : "";
  }

  updateEditDiscountVisibility();
  updateEditDiscountPreview();

  if (editProductImageInput) {
    editProductImageInput.value =
      "";
  }

  if (removeExistingImageInput) {
    removeExistingImageInput.value =
      "0";
  }

  if (
    p.image &&
    editProductImagePreviewImg &&
    editProductImagePreview
  ) {
    editProductImagePreviewImg.src =
      p.image;

    editProductImagePreview.hidden =
      false;
  } else {
    if (editProductImagePreviewImg) {
      editProductImagePreviewImg.src =
        "";
    }

    if (editProductImagePreview) {
      editProductImagePreview.hidden =
        true;
    }
  }

  renderAddonChoiceList(
    editProductAddonChoiceList,
    p.addonIds || []
  );

};

window.openOrderModal = function(id) {
  const o = orders.find(x => x.id == id);

  if (!o || !modalBody || !orderModal) return;

  modalBody.innerHTML = `
    <p><strong>Order ID:</strong> ${o.id}</p>
    <p><strong>Customer:</strong> ${o.customer}</p>
    <p><strong>Items:</strong> ${o.items?.join(", ") || "No items"}</p>
    <p><strong>Total:</strong> ${formatPeso(o.total)}</p>
    <p><strong>Payment:</strong> ${o.payment}</p>
    <p><strong>Status:</strong> ${normalizeStatus(o.status)}</p>
    <p><strong>Address:</strong> ${o.address || "N/A"}</p>
    <p><strong>Date:</strong> ${o.date}</p>
  `;

  orderModal.classList.add("show");
};

window.deleteProduct = async function(id) {
  const product = products.find(p => p.id == id);
  const productName = product
    ? `${product.name}${product.size ? " - " + product.size : ""}`
    : "Product";

  const confirmDelete = confirm("Delete this product? This action cannot be undone.");
  if (!confirmDelete) return;

  try {
    const result = await fetchJSON("http://localhost/FoodConnect/api/delete_product.php", {
      method: "POST",
      body: JSON.stringify({
        product_id: id
      })
    });

    if (!result.success) {
      alert(result.message || "Failed to delete product.");
      return;
    }

    await loadProducts();
    await loadDashboardSummary();

    addActivityLog(
      "product",
      "🗑️",
      "Product Deleted",
      `${productName} was removed from the menu.`
    );

    alert("Product deleted successfully.");
  } catch (error) {
    console.error("Delete product failed:", error);
    alert("Error deleting product. Check console.");
  }
};

window.openRestockFromInventory =
  function(id) {
    populateRestockProducts();

    if (restockProduct) {
      restockProduct.value =
        String(id);
    }

    if (restockProduct) {
  restockProduct.disabled = true;
}

    if (restockQuantity) {
      restockQuantity.value =
        "";
    }

    showRestockMessage();
    updateRestockPreview();

    restockModal?.classList.add(
      "show"
    );

    window.setTimeout(
      () => {
        restockQuantity?.focus();
      },
      100
    );
  };

function exportSalesReportPDF() {
  const summary = salesReport.summary || {};
  const bestProducts = salesReport.bestProducts || [];
  const bestCategories = salesReport.bestCategories || [];

  const reportWindow = window.open("", "_blank");

  reportWindow.document.write(`
    <html>
    <head>
      <title>FoodConnect Sales Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #111;
        }

        h1 {
          text-align: center;
          color: #cc9900;
          margin-bottom: 5px;
        }

        .subtitle {
          text-align: center;
          margin-bottom: 30px;
          color: #555;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }

        .card {
          border: 1px solid #ccc;
          border-radius: 10px;
          padding: 15px;
          background: #f8f8f8;
        }

        .card h3 {
          margin-bottom: 8px;
          color: #555;
          font-size: 14px;
        }

        .card p {
          font-size: 22px;
          font-weight: bold;
          margin: 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }

        th {
          background: #cc9900;
          color: white;
          padding: 10px;
          border: 1px solid #aaa;
        }

        td {
          padding: 10px;
          border: 1px solid #aaa;
        }

        h2 {
          margin-top: 25px;
          color: #111;
        }

        .footer {
          margin-top: 25px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>

    <body>
      <h1>FoodConnect Sales Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleString("en-PH")}</p>

      <div class="summary">
        <div class="card">
          <h3>Total Revenue</h3>
          <p>${formatPeso(summary.total_revenue || 0)}</p>
        </div>

        <div class="card">
          <h3>Completed Orders</h3>
          <p>${summary.completed_orders || 0}</p>
        </div>

        <div class="card">
          <h3>Cancelled Orders</h3>
          <p>${summary.cancelled_orders || 0}</p>
        </div>

        <div class="card">
          <h3>Average Order Value</h3>
          <p>${formatPeso(summary.average_order_value || 0)}</p>
        </div>
      </div>

      <h2>Best Selling Products</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Product</th>
          <th>Variant</th>
          <th>Total Sold</th>
          <th>Total Sales</th>
        </tr>

        ${
          bestProducts.length
            ? bestProducts.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product_name}</td>
                <td>${item.size || "-"}</td>
                <td>${item.total_sold}</td>
                <td>${formatPeso(item.total_sales)}</td>
              </tr>
            `).join("")
            : `<tr><td colspan="5">No product sales yet.</td></tr>`
        }
      </table>

      <h2>Best Categories</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Category</th>
          <th>Total Sold</th>
          <th>Total Sales</th>
        </tr>

        ${
          bestCategories.length
            ? bestCategories.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.category || "Uncategorized"}</td>
                <td>${item.total_sold}</td>
                <td>${formatPeso(item.total_sales)}</td>
              </tr>
            `).join("")
            : `<tr><td colspan="4">No category sales yet.</td></tr>`
        }
      </table>

      <p class="footer">Generated by FoodConnect Owner Dashboard</p>

      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);

  reportWindow.document.close();
}

function normalizeBusinessStatus(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim();

  if (normalized === "closed") {
    return "Closed";
  }

  if (
    normalized === "temporarily unavailable" ||
    normalized === "temporary" ||
    normalized === "temporarily_unavailable"
  ) {
    return "Temporarily Unavailable";
  }

  return "Open";
}

function getSelectedBusinessStatus() {
  const checkedRadio =
    document.querySelector(
      'input[name="restaurantBusinessStatus"]:checked'
    );

  return normalizeBusinessStatus(
    checkedRadio?.value ||
    settingsBusinessStatus?.value ||
    "Open"
  );
}

function setSelectedBusinessStatus(status) {
  const normalizedStatus =
    normalizeBusinessStatus(status);

  if (settingsBusinessStatus) {
    settingsBusinessStatus.value =
      normalizedStatus;
  }

  settingsStatusRadios.forEach(radio => {
    radio.checked =
      radio.value === normalizedStatus;
  });
}

function normalizeSettingsText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSettingsAddress(value) {
  return String(value || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizePhilippineContactNumber(value) {
  return window.FoodConnectPhone.normalize(value);
}

function clearSettingsFieldErrors() {
  settingsFormControls.forEach(control => {
    control.classList.remove(
      "is-invalid"
    );

    control.removeAttribute(
      "aria-invalid"
    );
  });
}

function markSettingsFieldInvalid(
  control
) {
  if (!control) {
    return;
  }

  control.classList.add(
    "is-invalid"
  );

  control.setAttribute(
    "aria-invalid",
    "true"
  );

  control.focus();
}

function updateSettingsAddressCounter() {
  if (
    !settingsAddress ||
    !settingsAddressCount
  ) {
    return;
  }

  const currentLength =
    settingsAddress.value.length;

  settingsAddressCount.textContent =
    `${currentLength} / 255`;
}

const SETTINGS_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const SETTINGS_DAY_SHORT = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
};

function settingsTimeToMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  const meridiem = match[3].toUpperCase();
  if (hour === 12) hour = 0;
  if (meridiem === "PM") hour += 12;
  return hour * 60 + minute;
}

function settingsMinutesToInput(minutes) {
  if (minutes == null) return "08:00";
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function settingsInputToDisplay(value) {
  const [hourRaw, minuteRaw] = String(value || "08:00").split(":");
  let hour = Number(hourRaw || 0);
  const minute = Number(minuteRaw || 0);
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

function createDefaultSettingsSchedule() {
  return Object.fromEntries(
    SETTINGS_DAYS.map(day => [day, { closed: false, open: "08:00", close: "20:00" }])
  );
}

function expandSettingsDayToken(token) {
  const normalized = String(token || "").trim().toLowerCase();
  const map = {
    mon: 0, monday: 0, tue: 1, tues: 1, tuesday: 1, wed: 2, wednesday: 2,
    thu: 3, thur: 3, thurs: 3, thursday: 3, fri: 4, friday: 4,
    sat: 5, saturday: 5, sun: 6, sunday: 6
  };
  return map[normalized];
}

function parseSettingsDayExpression(expression) {
  const clean = String(expression || "").trim().replace(/\s+/g, " ");
  const result = [];
  clean.split(/\s*,\s*/).forEach(part => {
    const range = part.split(/\s*[-–—]\s*/);
    if (range.length === 2) {
      const start = expandSettingsDayToken(range[0]);
      const end = expandSettingsDayToken(range[1]);
      if (start != null && end != null) {
        if (start <= end) {
          for (let i = start; i <= end; i++) result.push(SETTINGS_DAYS[i]);
        } else {
          for (let i = start; i < 7; i++) result.push(SETTINGS_DAYS[i]);
          for (let i = 0; i <= end; i++) result.push(SETTINGS_DAYS[i]);
        }
        return;
      }
    }
    const index = expandSettingsDayToken(part);
    if (index != null) result.push(SETTINGS_DAYS[index]);
  });
  return [...new Set(result)];
}

function parseSettingsOpeningHours(value) {
  const schedule = createDefaultSettingsSchedule();
  const text = String(value || "").trim();
  if (!text || /^configured\s+(in|during)\b/i.test(text)) return schedule;

  SETTINGS_DAYS.forEach(day => { schedule[day].closed = true; });
  let matchedAny = false;

  text.split(/\s*;\s*/).forEach(segment => {
    const part = segment.trim();
    if (!part) return;

    const closedMatch = part.match(/^(.+?)\s+closed$/i);
    if (closedMatch) {
      const days = parseSettingsDayExpression(closedMatch[1]);
      days.forEach(day => { schedule[day].closed = true; });
      matchedAny = matchedAny || days.length > 0;
      return;
    }

    const timeMatch = part.match(/^(.+?)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))$/i);
    if (!timeMatch) return;
    const days = parseSettingsDayExpression(timeMatch[1]);
    const openMinutes = settingsTimeToMinutes(timeMatch[2]);
    const closeMinutes = settingsTimeToMinutes(timeMatch[3]);
    if (openMinutes == null || closeMinutes == null) return;
    days.forEach(day => {
      schedule[day] = {
        closed: false,
        open: settingsMinutesToInput(openMinutes),
        close: settingsMinutesToInput(closeMinutes)
      };
    });
    matchedAny = matchedAny || days.length > 0;
  });

  return matchedAny ? schedule : createDefaultSettingsSchedule();
}

function renderSettingsBusinessHours(schedule = createDefaultSettingsSchedule()) {
  if (!settingsBusinessHours) return;
  settingsBusinessHours.innerHTML = SETTINGS_DAYS.map(day => {
    const item = schedule[day] || { closed: false, open: "08:00", close: "20:00" };
    const dayKey = day.toLowerCase();
    return `
      <div class="settings-hours-row${item.closed ? " is-closed" : ""}" data-day="${day}">
        <div class="settings-hours-day">
          <strong>${day}</strong>
          <span class="settings-hours-mobile-status">${item.closed ? "Closed" : "Open"}</span>
        </div>
        <label class="settings-hours-time-field">
          <span class="settings-hours-mobile-label">Opening</span>
          <input type="time" class="settings-hours-time settings-hours-open" id="settings${dayKey}Open" value="${item.open}" ${item.closed ? "disabled" : ""} aria-label="${day} opening time">
        </label>
        <label class="settings-hours-time-field">
          <span class="settings-hours-mobile-label">Closing</span>
          <input type="time" class="settings-hours-time settings-hours-close" id="settings${dayKey}Close" value="${item.close}" ${item.closed ? "disabled" : ""} aria-label="${day} closing time">
        </label>
        <label class="settings-hours-toggle-wrap">
          <input type="checkbox" class="settings-hours-closed" ${item.closed ? "checked" : ""} aria-label="Mark ${day} closed">
          <span class="settings-hours-toggle" aria-hidden="true"></span>
          <span class="settings-hours-status-text">${item.closed ? "Closed" : "Open"}</span>
        </label>
      </div>`;
  }).join("");

  settingsBusinessHours.querySelectorAll(".settings-hours-closed").forEach(input => {
    input.addEventListener("change", handleSettingsClosedDayChange);
  });
  settingsBusinessHours.querySelectorAll(".settings-hours-time").forEach(input => {
    input.addEventListener("input", handleSettingsHoursEdited);
    input.addEventListener("change", handleSettingsHoursEdited);
  });
  syncSettingsOpeningHoursFromEditor(false);
}

function handleSettingsClosedDayChange(event) {
  const row = event.currentTarget.closest(".settings-hours-row");
  if (!row) return;
  const closed = event.currentTarget.checked;
  row.classList.toggle("is-closed", closed);
  row.querySelectorAll(".settings-hours-time").forEach(input => { input.disabled = closed; });
  const text = row.querySelector(".settings-hours-status-text");
  const mobile = row.querySelector(".settings-hours-mobile-status");
  if (text) text.textContent = closed ? "Closed" : "Open";
  if (mobile) mobile.textContent = closed ? "Closed" : "Open";
  syncSettingsOpeningHoursFromEditor();
}

function handleSettingsHoursEdited() {
  syncSettingsOpeningHoursFromEditor();
}

function collectSettingsSchedule() {
  const schedule = {};
  settingsBusinessHours?.querySelectorAll(".settings-hours-row").forEach(row => {
    const day = row.dataset.day;
    schedule[day] = {
      closed: row.querySelector(".settings-hours-closed")?.checked === true,
      open: row.querySelector(".settings-hours-open")?.value || "08:00",
      close: row.querySelector(".settings-hours-close")?.value || "20:00"
    };
  });
  return schedule;
}

function serializeSettingsSchedule(schedule) {
  const entries = SETTINGS_DAYS.map(day => ({ day, ...schedule[day] }));
  const groups = [];
  let start = 0;
  while (start < entries.length) {
    let end = start;
    const signature = item => item.closed ? "closed" : `${item.open}|${item.close}`;
    while (end + 1 < entries.length && signature(entries[end + 1]) === signature(entries[start])) end++;
    const first = entries[start];
    const dayLabel = start === end
      ? SETTINGS_DAY_SHORT[entries[start].day]
      : `${SETTINGS_DAY_SHORT[entries[start].day]}-${SETTINGS_DAY_SHORT[entries[end].day]}`;
    groups.push(first.closed
      ? `${dayLabel} Closed`
      : `${dayLabel} ${settingsInputToDisplay(first.open)}-${settingsInputToDisplay(first.close)}`);
    start = end + 1;
  }
  return groups.join("; ");
}

function validateSettingsSchedule() {
  const schedule = collectSettingsSchedule();
  let hasOpenDay = false;
  for (const day of SETTINGS_DAYS) {
    const item = schedule[day];
    if (!item || item.closed) continue;
    hasOpenDay = true;
    if (!item.open || !item.close) return `Set both opening and closing time for ${day}.`;
    if (item.open === item.close) return `${day}'s opening and closing time cannot be the same.`;
  }
  if (!hasOpenDay) return "Keep at least one day open for customers.";
  return "";
}

function syncSettingsOpeningHoursFromEditor(triggerChange = true) {
  if (!settingsOpeningHours || !settingsBusinessHours) return;
  const schedule = collectSettingsSchedule();
  settingsOpeningHours.value = serializeSettingsSchedule(schedule);
  if (settingsHoursError) settingsHoursError.textContent = validateSettingsSchedule();
  if (triggerChange && typeof handleSettingsChange === "function") handleSettingsChange();
}

function applySettingsMondayHoursToAll() {
  const monday = settingsBusinessHours?.querySelector('.settings-hours-row[data-day="Monday"]');
  if (!monday) return;
  const closed = monday.querySelector(".settings-hours-closed")?.checked === true;
  const open = monday.querySelector(".settings-hours-open")?.value || "08:00";
  const close = monday.querySelector(".settings-hours-close")?.value || "20:00";

  settingsBusinessHours.querySelectorAll(".settings-hours-row").forEach(row => {
    const checkbox = row.querySelector(".settings-hours-closed");
    const openInput = row.querySelector(".settings-hours-open");
    const closeInput = row.querySelector(".settings-hours-close");
    if (checkbox) checkbox.checked = closed;
    if (openInput) { openInput.value = open; openInput.disabled = closed; }
    if (closeInput) { closeInput.value = close; closeInput.disabled = closed; }
    row.classList.toggle("is-closed", closed);
    const status = row.querySelector(".settings-hours-status-text");
    const mobile = row.querySelector(".settings-hours-mobile-status");
    if (status) status.textContent = closed ? "Closed" : "Open";
    if (mobile) mobile.textContent = closed ? "Closed" : "Open";
  });
  syncSettingsOpeningHoursFromEditor();
}

settingsApplyMondayHours?.addEventListener("click", applySettingsMondayHoursToAll);

function getCurrentRestaurantSettings() {
  return {

    logo_path:
  String(
    settingsLogoPath?.value || ""
  ).trim(),
    name:
      normalizeSettingsText(
        settingsRestaurantName?.value
      ),

    contact_number:
      normalizePhilippineContactNumber(
        settingsContactNumber?.value
      ),

    address:
      normalizeSettingsAddress(
        settingsAddress?.value
      ),

    opening_hours:
      normalizeSettingsText(
        settingsOpeningHours?.value
      ),

    delivery_fee:
      Number(
        settingsDeliveryFee?.value || 0
      ),

    business_status:
      getSelectedBusinessStatus()
  };
}

function formatSettingsDeliveryFee(value) {
  return Number(value || 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

function resolveSettingsLogoUrl(
  logoPath
) {
  const normalizedPath =
    String(logoPath || "").trim();

  if (!normalizedPath) {
    return "";
  }

  if (
    normalizedPath.startsWith(
      "http://"
    ) ||
    normalizedPath.startsWith(
      "https://"
    ) ||
    normalizedPath.startsWith(
      "/FoodConnect/"
    )
  ) {
    return normalizedPath;
  }

  return (
    "/FoodConnect/" +
    normalizedPath.replace(
      /^\/+/,
      ""
    )
  );
}

function getRestaurantInitials(
  restaurantName
) {
  const words =
    String(
      restaurantName || "FC"
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return "FC";
  }

  return words
    .slice(0, 2)
    .map(word =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}

function updateOwnerDashboardLogos(
  logoPath
) {
  const logoUrl =
    resolveSettingsLogoUrl(
      logoPath
    );

  if (
    !logoUrl
  ) {
    return;
  }

  if (sidebarRestaurantLogo) {
    sidebarRestaurantLogo.src =
      logoUrl;
  }

  if (profileRestaurantLogo) {
    profileRestaurantLogo.src =
      logoUrl;
  }
}

function renderSettingsLogo(
  logoPath
) {
  const logoUrl =
    resolveSettingsLogoUrl(
      logoPath
    );

  const hasLogo =
    Boolean(logoUrl);

  if (
    settingsLogoPreviewImage
  ) {
    settingsLogoPreviewImage.src =
      hasLogo ? logoUrl : "";

    settingsLogoPreviewImage.hidden =
      !hasLogo;
  }

  if (
    settingsLogoPlaceholder
  ) {
    settingsLogoPlaceholder.hidden =
      hasLogo;
  }

  if (
    removeSettingsLogoBtn
  ) {
    removeSettingsLogoBtn.hidden =
      !hasLogo;
  }

  if (
    settingsPreviewLogoImage
  ) {
    settingsPreviewLogoImage.src =
      hasLogo ? logoUrl : "";

    settingsPreviewLogoImage.hidden =
      !hasLogo;
  }

  if (
    settingsPreviewLogoInitials
  ) {
    settingsPreviewLogoInitials.hidden =
      hasLogo;

    settingsPreviewLogoInitials.textContent =
      getRestaurantInitials(
        settingsRestaurantName?.value
      );
  }
}

function setSettingsLogoMessage(
  message = "",
  type = ""
) {
  if (!settingsLogoMessage) {
    return;
  }

  settingsLogoMessage.textContent =
    message;

  settingsLogoMessage.className =
    "settings-logo-message";

  if (type) {
    settingsLogoMessage.classList.add(
      `is-${type}`
    );
  }
}

function validateSettingsLogoFile(
  file
) {
  if (!file) {
    return "Select a restaurant logo.";
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    return "Only JPG, PNG, and WEBP logo files are allowed.";
  }

  const maximumSize =
    2 * 1024 * 1024;

  if (
    file.size <= 0 ||
    file.size > maximumSize
  ) {
    return "The restaurant logo must not exceed 2 MB.";
  }

  return "";
}

async function uploadSettingsLogo(
  file
) {
  const validationMessage =
    validateSettingsLogoFile(
      file
    );

  if (validationMessage) {
    setSettingsLogoMessage(
      validationMessage,
      "error"
    );

    return;
  }

  const previousLogoPath =
    settingsLogoPath?.value || "";

  const previewUrl =
    URL.createObjectURL(file);

  if (
    settingsLogoPreviewImage
  ) {
    settingsLogoPreviewImage.src =
      previewUrl;

    settingsLogoPreviewImage.hidden =
      false;
  }

  if (
    settingsLogoPlaceholder
  ) {
    settingsLogoPlaceholder.hidden =
      true;
  }

  setSettingsLogoMessage(
    "Uploading logo...",
    "uploading"
  );

  if (settingsLogoInput) {
    settingsLogoInput.disabled =
      true;
  }

  if (selectSettingsLogoBtn) {
    selectSettingsLogoBtn.disabled =
      true;
  }

  const formData =
    new FormData();

  formData.append(
    "restaurant_logo",
    file
  );

  try {
    const response =
  await fetch(
    `${OWNER_API_BASE}/upload_restaurant_logo.php`,
    {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      cache: "no-store"
    }
  );

   const responseText =
  await response.text();

let result;

try {
  result =
    JSON.parse(responseText);
} catch (parseError) {
  console.error(
    "Logo upload response:",
    responseText
  );

  throw new Error(
    "The logo upload API returned an invalid response."
  );
}

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
        "Unable to upload the restaurant logo."
      );
    }

    if (settingsLogoPath) {
      settingsLogoPath.value =
        result.logo_path || "";
    }

    renderSettingsLogo(
      result.logo_path || ""
    );

    setSettingsLogoMessage(
      "Logo uploaded. Click Save Changes to apply it to your restaurant.",
      "success"
    );

    handleSettingsChange();
  } catch (error) {
    if (settingsLogoPath) {
      settingsLogoPath.value =
        previousLogoPath;
    }

    renderSettingsLogo(
      previousLogoPath
    );

    setSettingsLogoMessage(
      error.message ||
      "Unable to upload the restaurant logo.",
      "error"
    );
  } finally {
    URL.revokeObjectURL(
      previewUrl
    );

    if (settingsLogoInput) {
      settingsLogoInput.disabled =
        false;

      settingsLogoInput.value =
        "";
    }

    if (selectSettingsLogoBtn) {
      selectSettingsLogoBtn.disabled =
        false;
    }
  }
}

function removeSettingsLogo() {
  const hasLogo =
    Boolean(
      settingsLogoPath?.value
    );

  if (!hasLogo) {
    return;
  }

  const confirmed =
    window.confirm(
      "Remove the restaurant logo? The change will only become permanent after you click Save Changes."
    );

  if (!confirmed) {
    return;
  }

  if (settingsLogoPath) {
    settingsLogoPath.value =
      "";
  }

  renderSettingsLogo("");

  setSettingsLogoMessage(
    "Logo marked for removal. Click Save Changes to confirm.",
    "warning"
  );

  handleSettingsChange();
}

function updateSettingsPreview() {

  if (
  settingsPreviewLogoInitials &&
  settingsPreviewLogoImage?.hidden
) {
  settingsPreviewLogoInitials.textContent =
    getRestaurantInitials(
      settingsRestaurantName?.value
    );
}
  const settings =
    getCurrentRestaurantSettings();

  if (settingsPreviewName) {
    settingsPreviewName.textContent =
      settings.name ||
      "Restaurant Name";
  }

  if (settingsPreviewContact) {
    settingsPreviewContact.textContent =
      window.FoodConnectPhone.format(
        settings.contact_number,
        "Not provided"
      );
  }

  if (settingsPreviewAddress) {
    settingsPreviewAddress.textContent =
      settings.address ||
      "Not provided";
  }

  if (settingsPreviewHours) {
    settingsPreviewHours.textContent =
      settings.opening_hours ||
      "Not provided";
  }

  if (settingsPreviewFee) {
    settingsPreviewFee.textContent =
      `₱${formatSettingsDeliveryFee(
        settings.delivery_fee
      )}`;
  }

  if (settingsPreviewStatus) {
    settingsPreviewStatus.textContent =
      settings.business_status;

    settingsPreviewStatus.classList.remove(
      "is-open",
      "is-closed",
      "is-temporary"
    );

    if (
      settings.business_status === "Closed"
    ) {
      settingsPreviewStatus.classList.add(
        "is-closed"
      );
    } else if (
      settings.business_status ===
      "Temporarily Unavailable"
    ) {
      settingsPreviewStatus.classList.add(
        "is-temporary"
      );
    } else {
      settingsPreviewStatus.classList.add(
        "is-open"
      );
    }
  }
}

function settingsHaveChanges() {
  if (!savedRestaurantSettings) {
    return false;
  }

  const current =
    getCurrentRestaurantSettings();

  return (
    current.logo_path !==
      String(
        savedRestaurantSettings.logo_path || ""
      ).trim() ||

    current.name !==
      savedRestaurantSettings.name ||

    current.contact_number !==
      savedRestaurantSettings.contact_number ||

    current.address !==
      savedRestaurantSettings.address ||

    current.opening_hours !==
      savedRestaurantSettings.opening_hours ||

    Number(current.delivery_fee) !==
      Number(
        savedRestaurantSettings.delivery_fee
      ) ||

    current.business_status !==
      savedRestaurantSettings.business_status
  );
}

function setSettingsSaveState(
  state,
  message
) {
  if (!settingsSaveState) {
    return;
  }

  settingsSaveState.classList.remove(
    "is-saved",
    "is-unsaved",
    "is-saving",
    "is-error"
  );

  settingsSaveState.classList.add(
    `is-${state}`
  );

  if (settingsSaveStateText) {
    settingsSaveStateText.textContent =
      message;
  }

  /*
   * Mirror the save status beside the actual Save Changes button.
   * Previously the bottom message existed in HTML but was never updated,
   * which made successful saves look like "nothing happened".
   */
  if (settingsFormMessage) {
    settingsFormMessage.hidden = false;
    settingsFormMessage.textContent =
      message;

    settingsFormMessage.classList.remove(
      "is-saved",
      "is-unsaved",
      "is-saving",
      "is-error"
    );

    settingsFormMessage.classList.add(
      `is-${state}`
    );
  }
}

function handleSettingsChange() {
  if (restaurantSettingsLoading) {
    return;
  }

  updateSettingsPreview();

  if (settingsHaveChanges()) {
    setSettingsSaveState(
      "unsaved",
      "Unsaved changes"
    );

    if (saveSettingsBtn) {
      saveSettingsBtn.disabled = false;
    }
  } else {
    setSettingsSaveState(
      "saved",
      "All changes saved"
    );

    if (saveSettingsBtn) {
      saveSettingsBtn.disabled = true;
    }
  }
}

function validateRestaurantSettings(
  settings
) {
  clearSettingsFieldErrors();

  if (!settings.name) {
    markSettingsFieldInvalid(
      settingsRestaurantName
    );

    return "Restaurant name is required.";
  }

  if (settings.name.length < 2) {
    markSettingsFieldInvalid(
      settingsRestaurantName
    );

    return "Restaurant name must contain at least 2 characters.";
  }

  if (
    !/[A-Za-z0-9]/.test(
      settings.name
    )
  ) {
    markSettingsFieldInvalid(
      settingsRestaurantName
    );

    return "Restaurant name must contain letters or numbers.";
  }

  if (!settings.contact_number) {
    markSettingsFieldInvalid(
      settingsContactNumber
    );

    return "Contact number is required.";
  }

  const philippineMobilePattern =
    /^09\d{9}$/;

  if (
    !philippineMobilePattern.test(
      settings.contact_number
    )
  ) {
    markSettingsFieldInvalid(
      settingsContactNumber
    );

    return "Enter a valid Philippine mobile number after +63, starting with 9.";
  }

  if (!settings.address) {
    markSettingsFieldInvalid(
      settingsAddress
    );

    return "Restaurant address is required.";
  }

  if (settings.address.length < 10) {
    markSettingsFieldInvalid(
      settingsAddress
    );

    return "Enter a more complete restaurant address.";
  }

  const settingsScheduleError = validateSettingsSchedule();

  if (settingsScheduleError) {
    if (settingsHoursError) {
      settingsHoursError.textContent = settingsScheduleError;
    }
    return settingsScheduleError;
  }

  if (!settings.opening_hours) {
    return "Opening hours are required.";
  }

  if (
    settings.opening_hours.length < 5
  ) {
    markSettingsFieldInvalid(
      settingsOpeningHours
    );

    return "Enter clear and understandable opening hours.";
  }

  if (
    !Number.isFinite(
      settings.delivery_fee
    )
  ) {
    markSettingsFieldInvalid(
      settingsDeliveryFee
    );

    return "Enter a valid delivery fee.";
  }

  if (settings.delivery_fee < 0) {
    markSettingsFieldInvalid(
      settingsDeliveryFee
    );

    return "Delivery fee cannot be negative.";
  }

  if (settings.delivery_fee > 999) {
    markSettingsFieldInvalid(
      settingsDeliveryFee
    );

    return "Delivery fee cannot exceed ₱999.00.";
  }

  return "";
}

async function loadRestaurantSettings() {
  restaurantSettingsLoading = true;

  setSettingsSaveState(
    "saving",
    "Loading settings..."
  );

  try {
    const data = await fetchJSON(
      `${OWNER_API_BASE}/get_restaurant_settings.php`
    );

    if (!data.success) {
      throw new Error(
        data.message ||
        "Failed to load restaurant settings."
      );
    }

    const restaurant =
      data.restaurant || {};

   if (settingsLogoPath) {
  settingsLogoPath.value =
    String(
      restaurant.logo_path || ""
    ).trim();
}

renderSettingsLogo(
  String(
    restaurant.logo_path || ""
  ).trim()
);

setSettingsLogoMessage("");   

const loadedSettings = {
  logo_path: String(
    restaurant.logo_path || ""
  ).trim(),

  name: String(
    restaurant.name || ""
  ).trim(),

  contact_number: String(
    restaurant.contact_number || ""
  ).trim(),

  address: String(
    restaurant.address || ""
  ).trim(),

  opening_hours: String(
    restaurant.opening_hours || ""
  ).trim(),

  delivery_fee:
    Number(
      restaurant.delivery_fee || 0
    ),

  business_status:
    normalizeBusinessStatus(
      restaurant.business_status
    )
};
   
    if (settingsRestaurantName) {
      settingsRestaurantName.value =
        loadedSettings.name;
    }

    if (settingsContactNumber) {
      settingsContactNumber.value =
        window.FoodConnectPhone.toLocalDigits(loadedSettings.contact_number);
    }

    if (settingsAddress) {
  settingsAddress.value =
    loadedSettings.address;

  updateSettingsAddressCounter();
}

    if (settingsOpeningHours) {
      settingsOpeningHours.value =
        loadedSettings.opening_hours;
      renderSettingsBusinessHours(
        parseSettingsOpeningHours(loadedSettings.opening_hours)
      );
      loadedSettings.opening_hours = settingsOpeningHours.value;
    }

    if (settingsDeliveryFee) {
      settingsDeliveryFee.value =
        loadedSettings.delivery_fee.toFixed(
          2
        );
    }

    setSelectedBusinessStatus(
      loadedSettings.business_status
    );

    savedRestaurantSettings = {
      ...loadedSettings
    };

    updateSettingsPreview();

    setSettingsSaveState(
      "saved",
      "All changes saved"
    );

    if (saveSettingsBtn) {
      saveSettingsBtn.disabled = true;
    }
  } catch (error) {
    console.error(
      "Load restaurant settings failed:",
      error
    );

    setSettingsSaveState(
      "error",
      "Unable to load settings"
    );
  } finally {
    restaurantSettingsLoading = false;
  }
}

async function saveRestaurantSettings() {
  if (!saveSettingsBtn) {
    return;
  }

  const payload =
    getCurrentRestaurantSettings();

    if (settingsRestaurantName) {
  settingsRestaurantName.value =
    payload.name;
}

if (settingsContactNumber) {
  settingsContactNumber.value =
    payload.contact_number;
}

if (settingsAddress) {
  settingsAddress.value =
    payload.address;
}

if (settingsOpeningHours) {
  syncSettingsOpeningHoursFromEditor(false);
  payload.opening_hours = settingsOpeningHours.value;
}

updateSettingsAddressCounter();

  const validationMessage =
    validateRestaurantSettings(payload);

  if (validationMessage) {
    setSettingsSaveState(
      "error",
      validationMessage
    );

    return;
  }

  if (!settingsHaveChanges()) {
    setSettingsSaveState(
      "saved",
      "No changes to save"
    );

    return;
  }

  const originalButtonHTML =
    saveSettingsBtn.innerHTML;

  try {
    saveSettingsBtn.disabled = true;

    saveSettingsBtn.innerHTML = `
      <span class="settings-button-spinner"></span>
      Saving Changes...
    `;

    setSettingsSaveState(
      "saving",
      "Saving changes..."
    );

    const result = await fetchJSON(
      `${OWNER_API_BASE}/update_restaurant_settings.php`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "Failed to update restaurant settings."
      );
    }

   savedRestaurantSettings = {
  ...payload
};

setSelectedBusinessStatus(
  payload.business_status
);

updateSettingsPreview();

updateOwnerDashboardLogos(
  payload.logo_path
);

if (sidebarRestaurantName) {
  sidebarRestaurantName.textContent =
    payload.name;
}

if (profileRestaurantName) {
  profileRestaurantName.textContent =
    payload.name;
}

document.title =
  `${payload.name} | Owner Dashboard`;

setSettingsSaveState(
  "saved",
  result.message ||
    "Settings saved successfully."
);



    await addActivityLog(
      "system",
      "⚙️",
      "Settings Updated",
      "Restaurant settings were updated."
    );

    await loadActivityLogs();

    window.setTimeout(() => {
      if (!settingsHaveChanges()) {
        setSettingsSaveState(
          "saved",
          "All changes saved"
        );
      }
    }, 2500);
  } catch (error) {
    console.error(
      "Save restaurant settings failed:",
      error
    );

    setSettingsSaveState(
      "error",
      error.message ||
      "Changes could not be saved settings."
    );
  } finally {
    saveSettingsBtn.innerHTML =
      originalButtonHTML;

    saveSettingsBtn.disabled =
      !settingsHaveChanges();
  }
}

/* =========================================
   LIVE OWNER DASHBOARD SYNCHRONIZATION
========================================= */

let ownerDashboardRefreshTimer = null;
let ownerDashboardRefreshRunning = false;
let ownerDashboardLastRefreshAt = 0;
let ownerDashboardReady = false;

/*
 * Hidden Owner Dashboard sections are loaded only when opened.
 * This avoids paying cloud-DB latency for data the owner is not
 * currently viewing.
 */
const ownerSectionLoadState = {
  productsSection: false,
  inventorySection: false,
  reportsSection: false,
  usersSection: false,
  logsSection: false,
  settingsSection: false
};

async function ensureOwnerSectionLoaded(
  sectionId,
  force = false
) {
  if (
    !force &&
    ownerSectionLoadState[sectionId]
  ) {
    return;
  }

  switch (sectionId) {
    case "productsSection":
    case "inventorySection":
      await loadProducts();
      ownerSectionLoadState.productsSection = true;
      ownerSectionLoadState.inventorySection = true;
      break;

    case "reportsSection":
      await Promise.all([
        loadReportSalesChart("weekly"),
        loadSalesReport("weekly")
      ]);
      ownerSectionLoadState.reportsSection = true;
      break;

    case "usersSection":
      await Promise.all([
        loadUsers(),
        loadStaffAccessCode()
      ]);
      ownerSectionLoadState.usersSection = true;
      break;

    case "logsSection":
      await loadActivityLogs();
      ownerSectionLoadState.logsSection = true;
      break;

    case "settingsSection":
      await loadRestaurantSettings();
      ownerSectionLoadState.settingsSection = true;
      break;

    default:
      break;
  }
}

function isOwnerModalOpen() {
  return Boolean(
    document.querySelector(
      ".modal-overlay.show, .modal.show"
    )
  );
}

async function refreshOwnerOperationalData(
  force = false
) {
  /*
   * Do not start background cloud requests while the initial
   * Owner Dashboard batch is still loading.
   */
  if (
    !ownerDashboardReady ||
    ownerDashboardRefreshRunning
  ) {
    return;
  }

  /*
   * Opening DevTools, switching tabs, and returning to the
   * window can fire focus + visibility events together.
   * Require a full minute between automatic refreshes.
   */
  const now = Date.now();

  if (
    !force &&
    ownerDashboardLastRefreshAt > 0 &&
    now - ownerDashboardLastRefreshAt < 60000
  ) {
    return;
  }

  /*
   * Do not refresh products while the owner is typing
   * inside an open modal.
   */
  if (isOwnerModalOpen()) {
    return;
  }

  ownerDashboardRefreshRunning = true;

  try {
    await Promise.all([
      loadProducts(),
      loadDashboardSummary()
    ]);

    ownerDashboardLastRefreshAt = Date.now();

    /*
     * Products and Inventory use the same data source.
     */
    ownerSectionLoadState.productsSection = true;
    ownerSectionLoadState.inventorySection = true;

  } catch (error) {
    console.error(
      "Owner dashboard live refresh failed:",
      error
    );
  } finally {
    ownerDashboardRefreshRunning = false;
  }
}

function startOwnerDashboardRefresh() {
  if (ownerDashboardRefreshTimer !== null) {
    clearInterval(ownerDashboardRefreshTimer);
  }

  /*
   * Keep the dashboard live, but avoid hammering the remote
   * cloud database every 15 seconds.
   */
  ownerDashboardRefreshTimer = window.setInterval(
    () => {
      if (
        document.visibilityState === "visible"
      ) {
        refreshOwnerOperationalData();
      }
    },
    60000
  );
}

function stopOwnerDashboardRefresh() {
  if (ownerDashboardRefreshTimer !== null) {
    clearInterval(ownerDashboardRefreshTimer);
    ownerDashboardRefreshTimer = null;
  }
}

document.addEventListener(
  "visibilitychange",
  () => {
    if (
      document.visibilityState === "visible" &&
      ownerDashboardReady
    ) {
      refreshOwnerOperationalData(false);
    }
  }
);

window.addEventListener(
  "focus",
  () => {
    if (ownerDashboardReady) {
      refreshOwnerOperationalData(false);
    }
  }
);

window.addEventListener(
  "beforeunload",
  stopOwnerDashboardRefresh
);

window.addEventListener(
  "beforeunload",
  event => {
    if (!settingsHaveChanges()) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  }
);

async function initDashboard() {
  try {
    const identityLoaded =
      await loadOwnerIdentity();

    if (!identityLoaded) {
      return false;
    }

await Promise.all([
  loadDashboardSummary(),
  loadProducts(),
  loadDashboardSalesChart(
    "weekly"
  )
]);

    /*
     * Products are also used by the Dashboard low-stock panel.
     * Other hidden sections load only when the owner opens them.
     */
    ownerSectionLoadState.productsSection = true;
    ownerSectionLoadState.inventorySection = true;
    ownerDashboardLastRefreshAt = Date.now();
    ownerDashboardReady = true;

    return true;
  } catch (error) {
    console.error(
      "Dashboard load failed:",
      error
    );

    return false;
  }
}

initDashboard().then(
  (dashboardLoaded) => {
    if (dashboardLoaded) {
      startOwnerDashboardRefresh();
    }
  }
);