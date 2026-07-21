let orders = [];
let products = [];
let salesData = [];
let users = [];
let notifications = [];
let currentNotificationFilter = "all";
let activityLogs = [];
let currentLogFilter = "all";
let salesReport = {
  summary: {},
  bestProducts: [],
  bestCategories: []
};

/* =========================
   ELEMENTS
========================= */
const navItems = document.querySelectorAll(".nav-item[data-section]");
const sections = document.querySelectorAll(".content-section");

const recentOrdersBody = document.getElementById("recentOrdersBody");
const ordersTableBody = document.getElementById("ordersTableBody");
const productsGrid = document.getElementById("productsGrid");
const productSearch = document.getElementById("productSearch");
const productCategoryFilter = document.getElementById("productCategoryFilter");
const productSort = document.getElementById("productSort");
const lowStockList = document.getElementById("lowStockList");
const salesChart = document.getElementById("salesChart");

const salesRange = document.getElementById("salesRange");
const statusFilter = document.getElementById("statusFilter");
const orderSearch = document.getElementById("orderSearch");
const globalSearch = document.getElementById("globalSearch");

const orderModal = document.getElementById("orderModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const sidebar = document.getElementById("sidebar");

const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const logoutBtn = document.getElementById("logoutBtn");

const addProductModal = document.getElementById("addProductModal");
const editProductModal = document.getElementById("editProductModal");
const restockModal = document.getElementById("restockModal");

const openAddProductModal = document.getElementById("openAddProductModal");

const closeAddProductModal = document.getElementById("closeAddProductModal");
const closeEditProductModal = document.getElementById("closeEditProductModal");
const closeRestockModal = document.getElementById("closeRestockModal");

const saveProductBtn = document.getElementById("saveProductBtn");
const updateProductBtn = document.getElementById("updateProductBtn");
const saveRestockBtn = document.getElementById("saveRestockBtn");

const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventorySearch = document.getElementById("inventorySearch");
const inventoryFilter = document.getElementById("inventoryFilter");
const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");

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

const notificationsList = document.getElementById("notificationsList");
const notificationCount = document.getElementById("notificationCount");
const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");
const notificationFilterBtns = document.querySelectorAll(".notification-filter-btn"); 

const logsList = document.getElementById("logsList");
const logFilter = document.getElementById("logFilter");

const reportTotalRevenue = document.getElementById("reportTotalRevenue");
const reportSalesRange = document.getElementById("reportSalesRange");
const reportSalesChart = document.getElementById("reportSalesChart");
const bestProductsList = document.getElementById("bestProductsList");
const bestCategoriesList = document.getElementById("bestCategoriesList");

const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

const settingsRestaurantName = document.getElementById("settingsRestaurantName");
const settingsContactNumber = document.getElementById("settingsContactNumber");
const settingsAddress = document.getElementById("settingsAddress");
const settingsOpeningHours = document.getElementById("settingsOpeningHours");
const settingsDeliveryFee = document.getElementById("settingsDeliveryFee");
const settingsBusinessStatus = document.getElementById("settingsBusinessStatus");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
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


settingsFormControls.forEach(control => {
  control.addEventListener(
    "input",
    handleSettingsChange
  );

  control.addEventListener(
    "change",
    handleSettingsChange
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

function getStockLabel(stock) {
  if (stock <= 0) return "🔴 Out of Stock";
  if (stock <= 5) return "🟡 Low Stock";
  return "🟢 In Stock";
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

async function loadActivityLogs() {
  try {
    const data = await fetchJSON("http://localhost/FoodConnect/api/get_activity_logs.php");

    if (!data.success || !Array.isArray(data.logs)) {
      activityLogs = [];
      renderActivityLogs();
      return;
    }

    activityLogs = data.logs.map(log => ({
      type: log.action_type,
      icon: getActivityIcon(log.action_type),
      title: log.action_title,
      message: log.action_description,
      time: formatLogTime(log.created_at)
    }));

    renderActivityLogs();

  } catch (error) {
    console.error("Load activity logs failed:", error);
  }
}

function getActivityIcon(type) {
  if (type === "order") return "🧾";
  if (type === "product") return "🍔";
  if (type === "inventory") return "📦";
  if (type === "staff") return "👤";
  return "⚙️";
}

function formatLogTime(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function saveActivityLog(type, title, description) {
  try {
    await fetchJSON("http://localhost/FoodConnect/api/add_activity_log.php", {
      method: "POST",
      body: JSON.stringify({
        action_type: type,
        action_title: title,
        action_description: description
      })
    });
  } catch (error) {
    console.error("Save activity log failed:", error);
  }
}

/* =========================
   FETCH
========================= */

/* =========================
   API CONFIGURATION
========================= */

const OWNER_API_BASE = "/FoodConnect/api";

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


async function fetchJSON(url, options = {}) {
  const requestUrl = normalizeOwnerApiUrl(url);

  const response = await fetch(requestUrl, {
    ...options,

    credentials: "include",
    cache: "no-store",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(
      "Invalid JSON response:",
      requestUrl,
      text
    );

    throw new Error(
      "The server returned invalid JSON."
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
async function loadDashboardSummary() {
  const salesToday =
    document.getElementById("salesToday");

  const totalOrders =
    document.getElementById("totalOrders");

  const pendingOrders =
    document.getElementById("pendingOrders");

  const totalProducts =
    document.getElementById("totalProducts");

  const completedOrders =
    document.getElementById("completedOrders");

  const cancelledOrders =
    document.getElementById("cancelledOrders");

  const averageOrderValue =
    document.getElementById("averageOrderValue");

  const bestSeller =
    document.getElementById("bestSeller");

  try {
    const data = await fetchJSON(
      `${OWNER_API_BASE}/get_dashboard_summary.php`
    );

    if (!data.success) {
      throw new Error(
        data.message ||
        "Unable to load dashboard summary."
      );
    }

    if (salesToday) {
      salesToday.textContent =
        formatPeso(data.salesToday || 0);
    }

    if (totalOrders) {
      totalOrders.textContent =
        Number(data.totalOrders) || 0;
    }

    if (pendingOrders) {
      pendingOrders.textContent =
        Number(data.pendingOrders) || 0;
    }

    if (totalProducts) {
      totalProducts.textContent =
        Number(data.totalProducts) || 0;
    }

    if (completedOrders) {
      completedOrders.textContent =
        Number(data.completedOrders) || 0;
    }

    if (cancelledOrders) {
      cancelledOrders.textContent =
        Number(data.cancelledOrders) || 0;
    }

    if (averageOrderValue) {
      averageOrderValue.textContent =
        formatPeso(
          data.averageOrderValue || 0
        );
    }

    if (bestSeller) {
      bestSeller.textContent =
        data.bestSeller || "-";
    }
  } catch (error) {
    console.error(
      "Load dashboard summary failed:",
      error
    );

    if (salesToday) {
      salesToday.textContent = "₱0.00";
    }

    if (totalOrders) {
      totalOrders.textContent = "0";
    }

    if (pendingOrders) {
      pendingOrders.textContent = "0";
    }

    if (totalProducts) {
      totalProducts.textContent = "0";
    }
  }
}

/* =========================
   PRODUCTS
========================= */
async function loadProducts() {
  const data = await fetchJSON("http://localhost/FoodConnect/api/get_products.php");
  const list = Array.isArray(data) ? data : data.products || [];

  products = list.map(p => ({
    id: p.product_id || p.id,
    name: p.product_name || p.name || "Unnamed Product",
    category: p.category || "Uncategorized",
    size: p.size || "",
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    status:
    String(p.status || "").trim() ||
  (
    Number(p.stock) > 0
      ? "Available"
      : "Unavailable"
  ),
    image: p.image || p.image_url || "https://via.placeholder.com/400x250"
  }));

  populateProductCategories();
  applyProductFilters();
  renderLowStock();
  populateInventoryCategories();
  applyInventoryFilters();
  
}

async function loadUsers() {
  const data = await fetchJSON("http://localhost/FoodConnect/api/get_users.php");

  users = data.success && Array.isArray(data.users) ? data.users.map(u => ({
    id: u.user_id,
    restaurant_id: u.restaurant_id,
    role: u.role,
    full_name: u.full_name,
    email: u.email,
    contact_number: u.contact_number || "",
    address: u.address || "",
    status: Number(u.status),
    created_at: u.created_at
  })) : [];

  applyUserFilters();
  loadOwnerNotifications();
}

/* =========================
   ORDERS
========================= */
async function loadRecentOrders() {
  const data = await fetchJSON("http://localhost/FoodConnect/api/get_recent_orders.php");
  orders = Array.isArray(data) ? data : [];

  renderRecentOrders();
  renderOrders();
}

/* =========================
   SALES CHART
========================= */
async function loadSalesChart(range = "weekly") {
  const data = await fetchJSON(`http://localhost/FoodConnect/api/get_sales_chart.php?range=${range}`);
  salesData = Array.isArray(data) ? data : [];
  renderChart();
  renderReportSalesChart();
}

function renderChart() {
  if (!salesChart) return;

  if (!salesData.length) {
    salesChart.innerHTML = "<p>No sales data yet</p>";
    return;
  }

  const maxValue = Math.max(...salesData.map(item => Number(item.total) || 0), 1);

  salesChart.innerHTML = `
    <div class="chart-bars">
      ${salesData.map(item => {
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

function renderSalesReport() {
  const completedOrders = document.getElementById("completedOrders");
  const cancelledOrders = document.getElementById("cancelledOrders");
  const averageOrderValue = document.getElementById("averageOrderValue");
  const bestSeller = document.getElementById("bestSeller");

  const summary = salesReport.summary || {};
  const bestProducts = salesReport.bestProducts || [];
  const bestCategories = salesReport.bestCategories || [];

  if (reportTotalRevenue) {
    reportTotalRevenue.textContent = formatPeso(summary.total_revenue || 0);
  }

  if (completedOrders) {
    completedOrders.textContent = summary.completed_orders || 0;
  }

  if (cancelledOrders) {
    cancelledOrders.textContent = summary.cancelled_orders || 0;
  }

  if (averageOrderValue) {
    averageOrderValue.textContent = formatPeso(summary.average_order_value || 0);
  }

  if (bestSeller) {
    if (bestProducts.length) {
      const top = bestProducts[0];
      bestSeller.textContent = `${top.product_name}${top.size ? " - " + top.size : ""}`;
    } else {
      bestSeller.textContent = "-";
    }
  }

  if (bestProductsList) {
    bestProductsList.innerHTML = bestProducts.length
      ? bestProducts.map(item => `
        <div class="report-list-item">
          <div>
            <strong>${item.product_name}${item.size ? " - " + item.size : ""}</strong>
            <span>${item.total_sold} sold</span>
          </div>

          <div class="report-list-value">
            ${formatPeso(item.total_sales)}
          </div>
        </div>
      `).join("")
      : `<p>No product sales yet.</p>`;
  }

  if (bestCategoriesList) {
    bestCategoriesList.innerHTML = bestCategories.length
      ? bestCategories.map(item => `
        <div class="report-list-item">
          <div>
            <strong>${item.category || "Uncategorized"}</strong>
            <span>${item.total_sold} sold</span>
          </div>

          <div class="report-list-value">
            ${formatPeso(item.total_sales)}
          </div>
        </div>
      `).join("")
      : `<p>No category sales yet.</p>`;
  }
}

function renderReportSalesChart() {
  if (!reportSalesChart) return;

  if (!salesData.length) {
    reportSalesChart.innerHTML = "<p>No sales data yet</p>";
    return;
  }

  const maxValue = Math.max(...salesData.map(item => Number(item.total) || 0), 1);

  reportSalesChart.innerHTML = `
    <div class="chart-bars">
      ${salesData.map(item => {
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

async function loadSalesReport() {
  try {
    const data = await fetchJSON("http://localhost/FoodConnect/api/get_sales_report.php");

    if (!data.success) {
      console.error(data.message || "Failed to load sales report.");
      return;
    }

    salesReport = {
      summary: data.summary || {},
      bestProducts: data.bestProducts || [],
      bestCategories: data.bestCategories || []
    };

    renderSalesReport();

  } catch (error) {
    console.error("Load sales report failed:", error);
  }
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
   RENDER ORDERS
========================= */
function renderRecentOrders() {
  if (!recentOrdersBody) return;

  recentOrdersBody.innerHTML = orders.length
    ? orders.slice(0, 5).map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${formatPeso(o.total)}</td>
        <td>${o.payment}</td>
        <td><span class="status-badge ${getStatusClass(o.status)}">${normalizeStatus(o.status)}</span></td>
        <td>${o.date}</td>
        <td><button class="action-btn" onclick="openOrderModal('${o.id}')">View</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">No recent orders found.</td></tr>`;
}

function renderOrders(list = orders) {
  if (!ordersTableBody) return;

  ordersTableBody.innerHTML = list.length
    ? list.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer}</td>
        <td>${o.items?.join(", ") || "No items"}</td>
        <td>${formatPeso(o.total)}</td>
        <td>${o.payment}</td>
        <td><span class="status-badge ${getStatusClass(o.status)}">${normalizeStatus(o.status)}</span></td>
        <td>${o.date}</td>
        <td><button class="action-btn" onclick="openOrderModal('${o.id}')">View</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="8">No orders found.</td></tr>`;
}

/* =========================
   PRODUCTS RENDER
========================= */
function renderProducts(list = products) {
  if (!productsGrid) {
    return;
  }

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

  const totalProducts = products.length;

  const availableProducts =
    products.filter(
      product => Number(product.stock) > 5
    ).length;

  const lowStockProducts =
    products.filter(product => {
      const stock = Number(product.stock);

      return stock > 0 && stock <= 5;
    }).length;

  const outOfStockProducts =
    products.filter(
      product => Number(product.stock) <= 0
    ).length;

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

      return `
        <article class="product-card">
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
            <div class="product-price-block">
              <span>Price</span>

              <strong>
                ${formatPeso(product.price)}
              </strong>
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
              onclick="openEditProductModal(${product.id})"
            >
              <span>✎</span>
              Edit
            </button>

            <button
              type="button"
              class="product-action-btn product-delete-btn"
              onclick="deleteProduct(${product.id})"
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

function populateProductCategories() {
  if (!productCategoryFilter) return;

  const currentValue = productCategoryFilter.value || "all";
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  productCategoryFilter.innerHTML = `
    <option value="all">All Categories</option>
    ${categories.map(category => `
      <option value="${category}">${category}</option>
    `).join("")}
  `;

  if (categories.includes(currentValue)) {
    productCategoryFilter.value = currentValue;
  }
}

function applyProductFilters() {
  let list = [...products];

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
    list = list.filter(p => p.category === category);
  }

  if (sort === "oldest") list.sort((a, b) => a.id - b.id);
  if (sort === "newest") list.sort((a, b) => b.id - a.id);
  if (sort === "name-az") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-za") list.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  if (sort === "stock-low") list.sort((a, b) => a.stock - b.stock);
  if (sort === "stock-high") list.sort((a, b) => b.stock - a.stock);

  renderProducts(list);
}


function renderLowStock() {
  if (!lowStockList) return;

  const low = products.filter(p => p.stock <= 5);

  lowStockList.innerHTML = low.length
    ? low.map(p => `
      <div class="low-stock-item">
        <span>${p.name}${p.size ? " - " + p.size : ""}</span>
        <strong>${p.stock}</strong>
      </div>
    `).join("")
    : "<p>No low stock</p>";
}

/* =========================
   INVENTORY
========================= */
function renderInventory(list = products) {
  if (!inventoryTableBody) return;

  const total = products.length;
  const available = products.filter(p => p.stock > 0).length;
  const low = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const out = products.filter(p => p.stock <= 0).length;

  const overviewTotalProducts = document.getElementById("overviewTotalProducts");
const overviewAvailable = document.getElementById("overviewAvailable");
const overviewLow = document.getElementById("overviewLow");
const overviewOut = document.getElementById("overviewOut");

if (overviewTotalProducts) overviewTotalProducts.textContent = total;
if (overviewAvailable) overviewAvailable.textContent = available;
if (overviewLow) overviewLow.textContent = low;
if (overviewOut) overviewOut.textContent = out;



  const sortedList = sortInventoryList(list);


  inventoryTableBody.innerHTML = sortedList.length
    ? sortedList.map(p => {
        const stockLevel = getStockLevel(p.stock);
        const stockLabel = getStockLabel(p.stock);

        return `
          <tr class="inventory-table-row">
            <td>${p.category}</td>
            <td>${p.name}</td>
            <td>${p.size || "-"}</td>
            <td>
              <span class="inventory-stock-badge stock-${stockLevel}">
                ${stockLabel} (${p.stock})
              </span>
            </td>
            <td>
              <span class="status-badge ${p.stock > 0 ? "status-Completed" : "status-Cancelled"}">
                ${
  p.status.toLowerCase() === "available" &&
  p.stock > 0
    ? "product-status-available"
    : "product-status-unavailable"
}
              </span>
            </td>
            <td>
              <button class="action-btn" onclick="openRestockFromInventory(${p.id})">
                Restock
              </button>
            </td>
          </tr>
        `;
      }).join("")
    : `
      <tr>
        <td colspan="6">No inventory items found.</td>
      </tr>
    `;
}

function populateInventoryCategories() {
  if (!inventoryCategoryFilter) return;

  const currentValue = inventoryCategoryFilter.value || "all";
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

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
  let list = [...products];

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

function renderUsers(list = users) {
  if (!usersTableBody) return;

  usersTableBody.innerHTML = list.length
    ? list.map(u => `
      <tr>
        <td>${u.full_name}</td>
        <td>${u.email}</td>
<td>${u.contact_number || "-"}</td>
<td>${u.address || "-"}</td>
<td>
  <span class="user-role-badge user-role-${u.role}">
            ${u.role}
          </span>
        </td>
        <td>
          <span class="user-status-badge ${u.status == 1 ? "user-status-active" : "user-status-inactive"}">
            ${u.status == 1 ? "Active" : "Inactive"}
          </span>
        </td>
        <td>${u.created_at}</td>
        <td>
          <div class="user-actions">
            <button class="action-btn" onclick="openEditUserModal(${u.id})">Edit</button>
            <button class="action-btn secondary" onclick="deleteUser(${u.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="8">No users found.</td></tr>`;
}

async function loadOwnerNotifications() {
  try {
    const data = await fetchJSON("http://localhost/FoodConnect/api/get_activity_logs.php");

    if (!data.success || !Array.isArray(data.logs)) {
      notifications = [];
      renderNotifications();
      return;
    }

    notifications = data.logs
      .filter(log => {
        const title = String(log.action_title || "").toLowerCase();
        const type = String(log.action_type || "").toLowerCase();

        return (
          type === "order" ||
          title.includes("cancel") ||
          title.includes("low stock") ||
          title.includes("out of stock")
        );
      })
      .slice(0, 20)
      .map(log => ({
  logId: Number(log.log_id),
  type:
    log.action_type === "order"
      ? "order"
      : "system",

  icon: String(log.action_title || "")
    .toLowerCase()
    .includes("cancel")
      ? "🔴"
      : "🧾",

  title: log.action_title,
  message: log.action_description,
  time: formatLogTime(log.created_at),
  isRead: Number(log.is_read) === 1
}));

    renderNotifications();

  } catch (error) {
    console.error("Load owner notifications failed:", error);
  }
}

function renderNotifications() {
  if (!notificationsList) return;

  let list = [...notifications];

  if (currentNotificationFilter !== "all") {
    list = list.filter(
      notification =>
        notification.type === currentNotificationFilter
    );
  }

  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length;

  if (notificationCount) {
    notificationCount.textContent =
      `(${unreadCount} unread)`;
  }

  const sidebarBadge = document.getElementById(
    "sidebarNotificationBadge"
  );

  if (sidebarBadge) {
    sidebarBadge.textContent = String(unreadCount);
    sidebarBadge.style.display =
      unreadCount > 0 ? "inline-flex" : "none";
  }

  if (!list.length) {
    notificationsList.innerHTML = `
      <div class="empty-notification">
        <h3>No Notifications</h3>
        <p>No notifications available.</p>
      </div>
    `;

    return;
  }

  notificationsList.innerHTML = list
    .map(notification => `
      <div
        class="notification-card ${
          notification.isRead
            ? "is-read"
            : "is-unread"
        }"
        data-log-id="${notification.logId}"
      >
        <div class="notification-icon ${notification.type}">
          ${notification.icon}
        </div>

        <div class="notification-content">
          <h3>${escapeOwnerNotificationHTML(
            notification.title
          )}</h3>

          <p>${escapeOwnerNotificationHTML(
            notification.message
          )}</p>

          <small>${escapeOwnerNotificationHTML(
            notification.time
          )}</small>

          ${
            notification.isRead
              ? `
                <span class="notification-read-label">
                  Read
                </span>
              `
              : `
                <button
                  type="button"
                  class="mark-read-btn"
                  onclick="markOwnerNotificationRead(${notification.logId})"
                >
                  Mark as Read
                </button>
              `
          }
        </div>
      </div>
    `)
    .join("");
}

function escapeOwnerNotificationHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function markOwnerNotificationRead(logId) {
  const id = Number(logId);

  if (!Number.isInteger(id) || id <= 0) {
    alert("Invalid notification.");
    return;
  }

  try {
    const result = await fetchJSON(
      "http://localhost/FoodConnect/api/mark_notification_read.php",
      {
        method: "POST",
        body: JSON.stringify({
          log_id: id
        })
      }
    );

    if (!result.success) {
      alert(
        result.message ||
        "Failed to mark notification as read."
      );
      return;
    }

    const notification = notifications.find(
      item => item.logId === id
    );

    if (notification) {
      notification.isRead = true;
    }

    renderNotifications();

  } catch (error) {
    console.error(
      "Mark owner notification read failed:",
      error
    );

    alert(
      error.message ||
      "Unable to mark notification as read."
    );
  }
}

window.markOwnerNotificationRead =
  markOwnerNotificationRead;

function renderActivityLogs() {

  if (!logsList) return;

  let list = [...activityLogs];

  if (currentLogFilter !== "all") {
    list = list.filter(log => log.type === currentLogFilter);
  }

  if (!list.length) {
    logsList.innerHTML = `
      <div class="empty-logs">
        <h3>No Activity Logs</h3>
        <p>No activities available.</p>
      </div>
    `;
    return;
  }

  logsList.innerHTML = list.map(log => `
    <div class="log-item">

      <div class="log-time">
        ${log.time}
      </div>

      <div class="log-icon ${log.type}">
        ${log.icon}
      </div>

      <div class="log-content">
        <h3>${log.title}</h3>
        <p>${log.message}</p>
      </div>

    </div>
  `).join("");

}

async function addActivityLog(type, icon, title, message) {
  activityLogs.unshift({
    type,
    icon,
    title,
    message,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  renderActivityLogs();

  await saveActivityLog(type, title, message);
}

function generateActivityLogs() {

  const logs = [];

  orders.slice(0, 5).forEach(order => {
    logs.push({
      type: "order",
      icon: "🧾",
      title: "Order Activity",
      message: `Order #${order.id} by ${order.customer} is currently ${normalizeStatus(order.status)}.`,
      time: order.date || "Today"
    });
  });

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
   ADD PRODUCT
========================= */
if (saveProductBtn) {
  saveProductBtn.addEventListener("click", async () => {
    const stockValue = Number(document.getElementById("productStock").value);

    const payload = {
      product_name: document.getElementById("productName").value.trim(),
      category: document.getElementById("productCategory").value.trim(),
      size: document.getElementById("productSize").value.trim(),
      price: document.getElementById("productPrice").value,
      stock: document.getElementById("productStock").value,
      status: stockValue > 0 ? "Available" : "Unavailable"
    };

    if (
      !payload.product_name ||
      !payload.category ||
      !payload.size ||
      Number(payload.price) <= 0 ||
      stockValue < 0
    ) {
      alert("Please complete product name, category, variant/size, price, and stock correctly.");
      return;
    }

    const result = await fetchJSON("http://localhost/FoodConnect/api/add_product.php", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      alert(result.message || "Failed to add product.");
      return;
    }

    addProductModal.classList.remove("show");

    document.getElementById("productName").value = "";
    document.getElementById("productCategory").value = "";
    document.getElementById("productSize").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productStock").value = "";

   await loadProducts();
await loadDashboardSummary();

addActivityLog(
  "product",
  "🍔",
  "Product Added",
  `${payload.product_name} - ${payload.size} was added to the menu.`
);

alert("Product added successfully.");
  });
}

/* =========================
   UPDATE PRODUCT
========================= */
if (updateProductBtn) {
  updateProductBtn.addEventListener("click", async () => {
    const stockValue = Number(document.getElementById("editProductStock").value);

    const payload = {
      product_id: document.getElementById("editProductId").value,
      product_name: document.getElementById("editProductName").value.trim(),
      category: document.getElementById("editProductCategory").value.trim(),
      size: document.getElementById("editProductSize").value.trim(),
      price: document.getElementById("editProductPrice").value,
      stock: document.getElementById("editProductStock").value,
      status: stockValue > 0 ? "Available" : "Unavailable"
    };

    if (
      !payload.product_id ||
      !payload.product_name ||
      !payload.category ||
      !payload.size ||
      Number(payload.price) <= 0 ||
      stockValue < 0
    ) {
      alert("Please complete all required fields correctly.");
      return;
    }

    try {
      const result = await fetchJSON("http://localhost/FoodConnect/api/update_product.php", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!result.success) {
        alert(result.message || "Failed to update product.");
        return;
      }

      editProductModal.classList.remove("show");

     await loadProducts();
await loadDashboardSummary();

addActivityLog(
  "product",
  "✏️",
  "Product Updated",
  `${payload.product_name} - ${payload.size} was updated.`
);

alert("Product updated successfully.");

    } catch (error) {
      console.error("Update product failed:", error);
      alert("Error updating product. Check console.");
    }
  });
}

if (updateUserBtn) {
  updateUserBtn.addEventListener("click", async () => {
    const payload = {
  user_id: document.getElementById("editUserId").value,
  full_name: document.getElementById("editUserFullName").value.trim(),
  email: document.getElementById("editUserEmail").value.trim(),
  contact_number: document.getElementById("editUserContactNumber").value.trim(),
  address: document.getElementById("editUserAddress").value.trim(),
  role: document.getElementById("editUserRole").value,
  status: document.getElementById("editUserStatus").value
};

    if (
      !payload.user_id ||
      !payload.full_name ||
      !payload.email ||
      !payload.role
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const result = await fetchJSON("http://localhost/FoodConnect/api/update_user.php", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      alert(result.message || "Failed to update user.");
      return;
    }

    editUserModal.classList.remove("show");

   await loadUsers();

addActivityLog(
  "staff",
  "✏️",
  "Staff Updated",
  `${payload.full_name} account was updated.`
);

alert("User updated successfully.");
  });
}

if (saveUserBtn) {
  saveUserBtn.addEventListener("click", async () => {
    const payload = {
      full_name: document.getElementById("userFullName").value.trim(),
      email: document.getElementById("userEmail").value.trim(),
      password: document.getElementById("userPassword").value.trim(),
      contact_number: document.getElementById("userContactNumber").value.trim(),
      address: document.getElementById("userAddress").value.trim(),
      role: document.getElementById("userRole").value,
      status: document.getElementById("userStatus").value
    };

    if (
      !payload.full_name ||
      !payload.email ||
      !payload.password ||
      !payload.role
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (payload.contact_number && !/^[0-9]{11}$/.test(payload.contact_number)) {
      alert("Contact number must be exactly 11 digits.");
      return;
    }

    const result = await fetchJSON("http://localhost/FoodConnect/api/add_user.php", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      alert(result.message || "Failed to add user.");
      return;
    }

    addUserModal.classList.remove("show");

    document.getElementById("userFullName").value = "";
    document.getElementById("userEmail").value = "";
    document.getElementById("userPassword").value = "";
    document.getElementById("userContactNumber").value = "";
    document.getElementById("userAddress").value = "";
    document.getElementById("userRole").value = "";
    document.getElementById("userStatus").value = "1";

    await loadUsers();

addActivityLog(
  "staff",
  "👤",
  "Staff Added",
  `${payload.full_name} was added as ${payload.role}.`
);

alert("User added successfully.");
  });
}

/* =========================
   RESTOCK
========================= */
function populateRestockProducts() {
  const select = document.getElementById("restockProduct");
  if (!select) return;

  select.innerHTML = products.length
    ? products.map(p => `
      <option value="${p.id}">${p.name}${p.size ? " - " + p.size : ""}</option>
    `).join("")
    : `<option value="">No products available</option>`;
}

if (saveRestockBtn) {
  saveRestockBtn.addEventListener("click", async () => {
    const payload = {
      product_id: document.getElementById("restockProduct").value,
      quantity: document.getElementById("restockQuantity").value
    };

    if (!payload.product_id || Number(payload.quantity) <= 0) {
      alert("Please select product and enter valid quantity.");
      return;
    }

    const result = await fetchJSON("http://localhost/FoodConnect/api/restock_product.php", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      alert(result.message || "Failed to update stock.");
      return;
    }

    restockModal.classList.remove("show");
    document.getElementById("restockQuantity").value = "";

   await loadProducts();
await loadDashboardSummary();

const selectedProduct = products.find(p => String(p.id) === String(payload.product_id));

addActivityLog(
  "inventory",
  "📦",
  "Inventory Restocked",
  `${selectedProduct ? selectedProduct.name : "Product"} was restocked by ${payload.quantity}.`
);

alert("Stock updated successfully.");
  });
}

/* =========================
   EVENTS
========================= */
navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetSection =
      btn.dataset.section;

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
            savedRestaurantSettings.contact_number;
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
  });
});

logFilter?.addEventListener("change", () => {
  currentLogFilter = logFilter.value;
  renderActivityLogs();
});

reportSalesRange?.addEventListener("change", () => {
  loadSalesChart(reportSalesRange.value);
});

exportExcelBtn?.addEventListener("click", exportSalesReportExcel);
exportPdfBtn?.addEventListener("click", exportSalesReportPDF);

salesRange?.addEventListener("change", () => {
  loadSalesChart(salesRange.value);
});

statusFilter?.addEventListener("change", () => {
  const value = statusFilter.value;

  if (value === "all") {
    renderOrders();
    return;
  }

  renderOrders(orders.filter(o => normalizeStatus(o.status) === value));
});

orderSearch?.addEventListener("input", () => {
  const q = orderSearch.value.toLowerCase();

  renderOrders(
    orders.filter(o =>
      String(o.id).toLowerCase().includes(q) ||
      String(o.customer).toLowerCase().includes(q)
    )
  );
});

globalSearch?.addEventListener("input", () => {
  const q = globalSearch.value.toLowerCase();

  const filteredOrders = orders.filter(o =>
    String(o.id).toLowerCase().includes(q) ||
    String(o.customer).toLowerCase().includes(q)
  );

  renderOrders(filteredOrders);
});

inventorySearch?.addEventListener("input", applyInventoryFilters);
inventoryFilter?.addEventListener("change", applyInventoryFilters);
inventoryCategoryFilter?.addEventListener("change", applyInventoryFilters);

productSearch?.addEventListener("input", applyProductFilters);
productCategoryFilter?.addEventListener("change", applyProductFilters);
productSort?.addEventListener("change", applyProductFilters);

userSearch?.addEventListener("input", applyUserFilters);
userRoleFilter?.addEventListener("change", applyUserFilters);
userStatusFilter?.addEventListener("change", applyUserFilters);

openAddUserModal?.addEventListener("click", () => addUserModal.classList.add("show"));
closeAddUserModal?.addEventListener("click", () => addUserModal.classList.remove("show"));
closeEditUserModal?.addEventListener("click", () => editUserModal.classList.remove("show"));

menuToggle?.addEventListener("click", () => sidebar?.classList.add("show"));
closeSidebar?.addEventListener("click", () => sidebar?.classList.remove("show"));

openAddProductModal?.addEventListener("click", () => addProductModal.classList.add("show"));
closeAddProductModal?.addEventListener("click", () => addProductModal.classList.remove("show"));

closeEditProductModal?.addEventListener("click", () => {
  editProductModal.classList.remove("show");
});

notificationFilterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    notificationFilterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentNotificationFilter = btn.dataset.type;
    renderNotifications();
  });
});





closeRestockModal?.addEventListener("click", () => restockModal.classList.remove("show"));
closeModal?.addEventListener("click", () => orderModal.classList.remove("show"));

logoutBtn?.addEventListener("click", () => {
  window.location.href = "/FoodConnect/api/logout.php";
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
  document.getElementById("editUserContactNumber").value = user.contact_number || "";
document.getElementById("editUserAddress").value = user.address || "";
  document.getElementById("editUserRole").value = user.role;
  document.getElementById("editUserStatus").value = String(user.status);

  editUserModal.classList.add("show");
};

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
  const p = products.find(product => product.id == id);

  if (!p) {
    alert("Product not found.");
    return;
  }

  document.getElementById("editProductId").value = p.id;
  document.getElementById("editProductName").value = p.name;
  document.getElementById("editProductSize").value = p.size;
  document.getElementById("editProductCategory").value = p.category;
  document.getElementById("editProductPrice").value = p.price;
  document.getElementById("editProductStock").value = p.stock;

  editProductModal.classList.add("show");
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

  const confirmDelete = confirm("Are you sure you want to delete this product?");
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

window.openRestockFromInventory = function(id) {
  populateRestockProducts();

  const restockProduct = document.getElementById("restockProduct");

  if (restockProduct) {
    restockProduct.value = id;
  }

  restockModal.classList.add("show");
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

function getCurrentRestaurantSettings() {
  return {
    name:
      settingsRestaurantName?.value.trim() ||
      "",

    contact_number:
      settingsContactNumber?.value.trim() ||
      "",

    address:
      settingsAddress?.value.trim() ||
      "",

    opening_hours:
      settingsOpeningHours?.value.trim() ||
      "",

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

function updateSettingsPreview() {
  const settings =
    getCurrentRestaurantSettings();

  if (settingsPreviewName) {
    settingsPreviewName.textContent =
      settings.name ||
      "Restaurant Name";
  }

  if (settingsPreviewContact) {
    settingsPreviewContact.textContent =
      settings.contact_number ||
      "Not provided";
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
  if (!settings.name) {
    settingsRestaurantName?.focus();

    return "Restaurant name is required.";
  }

  if (!settings.contact_number) {
    settingsContactNumber?.focus();

    return "Contact number is required.";
  }

  const phonePattern =
    /^[0-9+\-\s()]{7,20}$/;

  if (
    !phonePattern.test(
      settings.contact_number
    )
  ) {
    settingsContactNumber?.focus();

    return "Enter a valid contact number.";
  }

  if (!settings.address) {
    settingsAddress?.focus();

    return "Restaurant address is required.";
  }

  if (!settings.opening_hours) {
    settingsOpeningHours?.focus();

    return "Opening hours are required.";
  }

  if (
    !Number.isFinite(
      settings.delivery_fee
    ) ||
    settings.delivery_fee < 0
  ) {
    settingsDeliveryFee?.focus();

    return "Delivery fee cannot be negative.";
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

    const loadedSettings = {
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
        loadedSettings.contact_number;
    }

    if (settingsAddress) {
      settingsAddress.value =
        loadedSettings.address;
    }

    if (settingsOpeningHours) {
      settingsOpeningHours.value =
        loadedSettings.opening_hours;
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

    setSettingsSaveState(
      "saved",
      "Settings saved successfully"
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
      "Unable to save settings."
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

function isOwnerModalOpen() {
  return Boolean(
    document.querySelector(
      ".modal-overlay.show, .modal.show"
    )
  );
}

async function refreshOwnerOperationalData() {
  if (ownerDashboardRefreshRunning) {
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
      loadRecentOrders(),
      loadDashboardSummary()
    ]);

    await Promise.all([
      loadOwnerNotifications(),
      loadActivityLogs()
    ]);

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

  ownerDashboardRefreshTimer = window.setInterval(
    () => {
      if (
        document.visibilityState === "visible"
      ) {
        refreshOwnerOperationalData();
      }
    },
    15000
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
      document.visibilityState === "visible"
    ) {
      refreshOwnerOperationalData();
    }
  }
);

window.addEventListener(
  "focus",
  refreshOwnerOperationalData
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
  await Promise.all([
  loadDashboardSummary(),
  loadRecentOrders(),
  loadProducts(),
  loadUsers(),
  loadSalesChart("weekly"),
  loadSalesReport(),
  loadRestaurantSettings()
]);

await loadOwnerNotifications();
await loadActivityLogs();

  } catch (error) {
    console.error("Dashboard load failed:", error);
  }
}

initDashboard().then(() => {
  startOwnerDashboardRefresh();
});