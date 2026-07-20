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
  const data = await fetchJSON("http://localhost/FoodConnect/api/get_dashboard_summary.php");

  const salesToday = document.getElementById("salesToday");
  const totalOrders = document.getElementById("totalOrders");
  const pendingOrders = document.getElementById("pendingOrders");
  const totalProducts = document.getElementById("totalProducts");
  const completedOrders = document.getElementById("completedOrders");
  const cancelledOrders = document.getElementById("cancelledOrders");
  const averageOrderValue = document.getElementById("averageOrderValue");
  const bestSeller = document.getElementById("bestSeller");

  if (salesToday) salesToday.textContent = formatPeso(data.salesToday);
  if (totalOrders) totalOrders.textContent = data.totalOrders || 0;
  if (pendingOrders) pendingOrders.textContent = data.pendingOrders || 0;
  if (totalProducts) totalProducts.textContent = data.totalProducts || 0;
  if (completedOrders) completedOrders.textContent = data.completedOrders || 0;
  if (cancelledOrders) cancelledOrders.textContent = data.cancelledOrders || 0;
  if (averageOrderValue) averageOrderValue.textContent = formatPeso(data.averageOrderValue);
  if (bestSeller) bestSeller.textContent = data.bestSeller || "-";
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
  if (!productsGrid) return;

  productsGrid.innerHTML = list.length
    ? list.map(p => `
      <div class="product-card">
        <h3>${p.name}</h3>

        <div class="product-info-grid">
          <div class="product-info-row">
            <span>Category</span>
            <strong>${p.category}</strong>
          </div>

          <div class="product-info-row">
            <span>Variant</span>
            <strong>${p.size || "-"}</strong>
          </div>

          <div class="product-info-row">
            <span>Price</span>
            <strong>${formatPeso(p.price)}</strong>
          </div>

          <div class="product-info-row">
            <span>Stock</span>
            <strong class="${p.stock <= 5 ? "product-stock low" : "product-stock ok"}">
              ${p.stock}
            </strong>
          </div>

          <div class="product-info-row">
            <span>Status</span>
            <strong>
              <span class="product-status-badge 
              ${p.stock > 0 ? "product-status-available" : "product-status-unavailable"}">
                ${
                  p.status.toLowerCase() === "available" &&
                  p.stock > 0
                  ? "🟢 Available"
                  : "🔴 Unavailable"
                }
              </span>
            </strong>
          </div>
        </div>

        <div class="product-actions">
          <button class="action-btn" onclick="openEditProductModal(${p.id})">Edit</button>
          <button class="action-btn secondary" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </div>
    `).join("")
    : `<p>No products found.</p>`;
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
    const target = btn.dataset.section;

    navItems.forEach(item => item.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(section => {
      section.classList.toggle("active-section", section.id === target);
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

saveSettingsBtn?.addEventListener("click", saveRestaurantSettings);

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

async function loadRestaurantSettings() {
  try {
    const data = await fetchJSON("http://localhost/FoodConnect/api/get_restaurant_settings.php");

    if (!data.success) {
      console.error(data.message || "Failed to load restaurant settings.");
      return;
    }

    const restaurant = data.restaurant || {};

    if (settingsRestaurantName) settingsRestaurantName.value = restaurant.name || "";
    if (settingsContactNumber) settingsContactNumber.value = restaurant.contact_number || "";
    if (settingsAddress) settingsAddress.value = restaurant.address || "";
    if (settingsOpeningHours) settingsOpeningHours.value = restaurant.opening_hours || "";
    if (settingsDeliveryFee) settingsDeliveryFee.value = restaurant.delivery_fee || 0;
    if (settingsBusinessStatus) settingsBusinessStatus.value = restaurant.business_status || "Open";

  } catch (error) {
    console.error("Load restaurant settings failed:", error);
  }
}

async function saveRestaurantSettings() {
  const payload = {
    name: settingsRestaurantName?.value.trim() || "",
    contact_number: settingsContactNumber?.value.trim() || "",
    address: settingsAddress?.value.trim() || "",
    opening_hours: settingsOpeningHours?.value.trim() || "",
    delivery_fee: settingsDeliveryFee?.value || 0,
    business_status: settingsBusinessStatus?.value || "Open"
  };

  if (
    !payload.name ||
    !payload.contact_number ||
    !payload.address ||
    !payload.opening_hours ||
    Number(payload.delivery_fee) < 0
  ) {
    alert("Please complete all restaurant settings correctly.");
    return;
  }

  try {
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = "Saving...";

    const result = await fetchJSON("http://localhost/FoodConnect/api/update_restaurant_settings.php", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!result.success) {
      alert(result.message || "Failed to update settings.");
      return;
    }

    await loadRestaurantSettings();

    await addActivityLog(
  "system",
  "⚙️",
  "Settings Updated",
  "Restaurant settings were updated."
);

await loadActivityLogs();

    alert("Restaurant settings saved successfully.");

  } catch (error) {
    console.error("Save restaurant settings failed:", error);
    alert("Error saving settings. Check console.");
  } finally {
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.textContent = "Save Settings";
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
    5000
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