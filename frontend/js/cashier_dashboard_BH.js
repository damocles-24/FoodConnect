const API_BASE = "../../api";

let orders = [];
let selectedOrder = null;
let currentStatusFilter = "all";
let soundEnabled = true;

let knownOrderIds = new Set();
let knownOrderStatuses = new Map();

let firstLoadDone = false;
let confirmCallback = null;
let restoreAssignModalAfterConfirm = false;
let pendingCancellationReason = "";

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     INITIAL DATA LOADING
  ========================================= */

  loadOrders();
  loadCashierNotifications();

  setInterval(() => {
    loadOrders();
    loadCashierNotifications();
  }, 5000);

  /* =========================================
     ORDER FILTERS AND REFRESH
  ========================================= */

  document
    .getElementById("refreshOrdersBtn")
    ?.addEventListener("click", loadOrders);

  document
    .getElementById("orderSearch")
    ?.addEventListener("input", renderOrders);

  document
    .getElementById("statusFilter")
    ?.addEventListener(
      "change",
      handleStatusSelect
    );

  document
    .getElementById("orderTypeFilter")
    ?.addEventListener(
      "change",
      renderOrders
    );

  /* =========================================
     STATUS TABS
  ========================================= */

  document
    .querySelectorAll(".status-tab")
    .forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".status-tab")
          .forEach((button) => {
            button.classList.remove("active");
          });

        tab.classList.add("active");

        currentStatusFilter =
          tab.dataset.status || "all";

        const statusFilter =
          document.getElementById(
            "statusFilter"
          );

        if (statusFilter) {
          statusFilter.value =
            currentStatusFilter;
        }

        renderOrders();
      });
    });

  /* =========================================
     SIDEBAR NAVIGATION
  ========================================= */

  document
    .querySelectorAll(".nav-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        switchSection(
          item.dataset.section
        );
      });
    });

  document
    .getElementById("menuToggle")
    ?.addEventListener("click", () => {
      document
        .getElementById("sidebar")
        ?.classList.toggle("active");
    });

  /* =========================================
     SOUND
  ========================================= */

  document
    .getElementById("soundToggle")
    ?.addEventListener(
      "click",
      toggleSound
    );

  /* =========================================
     LOGOUT
  ========================================= */

  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", () => {
      openConfirmModal(
        "Logout Account",
        "Are you sure you want to logout from the cashier dashboard?",
        () => {
          window.location.href =
            `${API_BASE}/logout.php`;
        }
      );
    });

  /* =========================================
     ORDER DETAILS MODAL
  ========================================= */

  document
    .getElementById("closeModal")
    ?.addEventListener(
      "click",
      closeModal
    );

  document
    .getElementById("cancelModalBtn")
    ?.addEventListener(
      "click",
      closeModal
    );

  /* =========================================
     ORDER STATUS BUTTONS
  ========================================= */

  document
    .getElementById("markPreparingBtn")
    ?.addEventListener("click", () => {
      updateOrderStatus("preparing");
    });

  document
    .getElementById("markReadyBtn")
    ?.addEventListener("click", () => {
      updateOrderStatus("ready");
    });

  document
    .getElementById("markCompletedBtn")
    ?.addEventListener("click", () => {
      updateOrderStatus("completed");
    });

  /*
   * Important:
   * Cancellation uses its own reason modal.
   * Do not call updateOrderStatus("cancelled") here.
   */
  document
    .getElementById("markCancelledBtn")
    ?.addEventListener(
      "click",
      openCancelReasonModal
    );

  /* =========================================
     RECEIPT BUTTONS
  ========================================= */

  document
    .getElementById("printReceiptBtn")
    ?.addEventListener(
      "click",
      printCustomerReceipt
    );

  document
    .getElementById(
      "printKitchenTicketBtn"
    )
    ?.addEventListener(
      "click",
      printKitchenTicket
    );

  /* =========================================
     GENERIC CONFIRMATION MODAL
  ========================================= */

  document
    .getElementById("confirmCancelBtn")
    ?.addEventListener(
      "click",
      closeConfirmModal
    );

  document
    .getElementById("confirmOkBtn")
    ?.addEventListener(
      "click",
      async () => {
        const callback =
          confirmCallback;

        document
          .getElementById(
            "confirmModal"
          )
          ?.classList.remove(
            "active"
          );

        confirmCallback = null;
        restoreAssignModalAfterConfirm =
          false;

        if (
          typeof callback ===
          "function"
        ) {
          await callback();
        }
      }
    );

  /* =========================================
     ASSIGN RIDER MODAL
  ========================================= */

  document
    .getElementById("assignRiderBtn")
    ?.addEventListener(
      "click",
      openAssignRiderModal
    );

  document
    .getElementById(
      "closeAssignRiderModal"
    )
    ?.addEventListener(
      "click",
      closeAssignRiderModal
    );

  document
    .getElementById(
      "cancelAssignRiderBtn"
    )
    ?.addEventListener(
      "click",
      closeAssignRiderModal
    );

  document
    .getElementById(
      "confirmAssignRiderBtn"
    )
    ?.addEventListener(
      "click",
      submitRiderAssignment
    );

  /* =========================================
     CANCELLATION REASON MODAL
  ========================================= */

  document
    .getElementById(
      "closeCancelReasonModal"
    )
    ?.addEventListener(
      "click",
      closeCancelReasonModal
    );

  document
    .getElementById(
      "backCancelReasonBtn"
    )
    ?.addEventListener(
      "click",
      closeCancelReasonModal
    );

  document
    .getElementById(
      "confirmCancelOrderBtn"
    )
    ?.addEventListener(
      "click",
      submitCashierCancellation
    );

  document
    .querySelectorAll(
      'input[name="cashierCancellationReason"]'
    )
    .forEach((radio) => {
      radio.addEventListener(
        "change",
        handleCancellationReasonChange
      );
    });

  document
    .getElementById(
      "cancelOtherReasonInput"
    )
    ?.addEventListener(
      "input",
      updateCancellationReasonState
    );

  /* Close cancellation modal when
     clicking the dark background */

  document
    .getElementById(
      "cancelReasonModal"
    )
    ?.addEventListener(
      "click",
      (event) => {
        if (
          event.target.id ===
          "cancelReasonModal"
        ) {
          closeCancelReasonModal();
        }
      }
    );

  /* =========================================
     ESCAPE KEY MODAL CLOSING
  ========================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") {
        return;
      }

      const cancellationModal =
        document.getElementById(
          "cancelReasonModal"
        );

      if (
        cancellationModal
          ?.classList.contains(
            "active"
          )
      ) {
        closeCancelReasonModal();
        return;
      }

      const riderModal =
        document.getElementById(
          "assignRiderModal"
        );

      if (
        riderModal
          ?.classList.contains(
            "active"
          )
      ) {
        closeAssignRiderModal();
        return;
      }

      const confirmationModal =
        document.getElementById(
          "confirmModal"
        );

      if (
        confirmationModal
          ?.classList.contains(
            "active"
          )
      ) {
        closeConfirmModal();
        return;
      }

      const orderModal =
        document.getElementById(
          "orderModal"
        );

      if (
        orderModal
          ?.classList.contains(
            "active"
          )
      ) {
        closeModal();
      }
    }
  );
});

async function loadOrders() {
  const tbody = document.getElementById("ordersTableBody");
  const isFirstLoad = orders.length === 0 && !firstLoadDone;

  const refreshBtn = document.getElementById("refreshOrdersBtn");

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `<i class="fa-solid fa-rotate fa-spin"></i> Refreshing...`;
  }

  try {
    if (isFirstLoad) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-message">
            Loading orders...
          </td>
        </tr>
      `;
    }

    const response = await fetch(`${API_BASE}/get_cashier_orders.php`, {
      method: "GET",
      credentials: "include"
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to load orders.");
    }

    const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];

    const cancelledOrders = fetchedOrders.filter(order => {
  const orderId = String(order.order_id);
  const currentStatus = String(order.order_status || "").toLowerCase();
  const previousStatus = knownOrderStatuses.get(orderId);

  return (
    firstLoadDone &&
    currentStatus === "cancelled" &&
    previousStatus &&
    previousStatus !== "cancelled"
  );
});

    const newPendingOrders = fetchedOrders.filter(order => {
      const orderId = String(order.order_id);

      return (
        order.order_status === "pending" &&
        !knownOrderIds.has(orderId)
      );
    });

    orders = fetchedOrders;

    orders.forEach(order => {
      knownOrderIds.add(String(order.order_id));
    });

    orders.forEach(order => {
  knownOrderStatuses.set(
    String(order.order_id),
    String(order.order_status || "").toLowerCase()
  );
});

    if (firstLoadDone && newPendingOrders.length > 0) {
      playNotificationSound();

      newPendingOrders.forEach(order => {
        const message =
          `Queue #${order.queue_number || "N/A"} • Order #${order.order_id} from ${order.customer_name || "Customer"}`;

        addNotification("New order received", message);
        showToast("New Order Received", message);
      });
    }

    if (firstLoadDone && cancelledOrders.length > 0) {
  playNotificationSound();

  cancelledOrders.forEach(order => {
    const message =
      `Queue #${order.queue_number || "N/A"} • Order #${order.order_id} from ${order.customer_name || "Customer"} was cancelled.`;

    addNotification("Order cancelled", message);
    showToast("Order Cancelled", message);
  });
}

    firstLoadDone = true;

    updateSummaryCards();
    renderOrders();

  } catch (error) {
    console.error("Load orders error:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="table-empty-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Unable to Load Orders</h3>
            <p>Please check your connection, session, API path, or PHP error.</p>
          </div>
        </td>
      </tr>
    `;

  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Refresh
      `;
    }
  }
}

function renderOrders() {
  const tbody =
    document.getElementById("ordersTableBody");

  if (!tbody) {
    return;
  }

  const searchValue =
    document
      .getElementById("orderSearch")
      ?.value
      .toLowerCase()
      .trim() || "";

  const orderTypeValue =
    document
      .getElementById("orderTypeFilter")
      ?.value || "all";

  let filteredOrders = [...orders];

  /*
   * Public cashier status filtering.
   *
   * Internal ready and assigned orders are displayed
   * under Preparing.
   */
  if (currentStatusFilter !== "all") {
    filteredOrders =
      filteredOrders.filter(order => {
        return orderMatchesPublicStatus(
          order,
          currentStatusFilter
        );
      });
  }

  if (orderTypeValue !== "all") {
    filteredOrders =
      filteredOrders.filter(order => {
        return (
          String(
            order.order_type || ""
          ).toLowerCase() ===
          orderTypeValue.toLowerCase()
        );
      });
  }

  if (searchValue !== "") {
    filteredOrders =
      filteredOrders.filter(order => {
        const orderId =
          String(
            order.order_id || ""
          ).toLowerCase();

        const customer =
          String(
            order.customer_name || ""
          ).toLowerCase();

        const contact =
          String(
            order.contact_number || ""
          ).toLowerCase();

        return (
          orderId.includes(searchValue) ||
          customer.includes(searchValue) ||
          contact.includes(searchValue)
        );
      });
  }

  if (filteredOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="table-empty-state">
            <i class="fa-solid fa-receipt"></i>

            <h3>No Orders Found</h3>

            <p>
              There are no customer orders matching
              the selected filters.
            </p>
          </div>
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    filteredOrders
      .map(order => {
        const publicStatusClass =
          getPublicStatusClass(
            order.order_status
          );

        const publicStatusLabel =
          getStatusDisplayLabel(
            order.order_status,
            order.order_type
          );

        return `
          <tr>
            <td>
              #${escapeHTML(
                order.queue_number || "N/A"
              )}
            </td>

            <td>
              #${escapeHTML(order.order_id)}
            </td>

            <td>
              <strong>
                ${escapeHTML(
                  order.customer_name ||
                  "Unknown"
                )}
              </strong>

              <br>

              <small>
                ${escapeHTML(
                  order.contact_number ||
                  "No contact"
                )}
              </small>
            </td>

            <td>
              ${formatOrderType(
                order.order_type
              )}
            </td>

            <td>
              ${escapeHTML(
                order.payment_method || "N/A"
              )}
            </td>

            <td>
              ₱${formatMoney(
                order.total_amount
              )}
            </td>

            <td>
              <span
                class="status-badge ${escapeHTML(
                  publicStatusClass
                )}"
              >
                ${escapeHTML(
                  publicStatusLabel
                )}
              </span>
            </td>

            <td>
              ${formatDateTime(
                order.created_at
              )}
            </td>

            <td>
              <button
                class="view-order-btn"
                onclick="openOrderModal(
                  ${Number(order.order_id)}
                )"
              >
                View
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
}

function updateSummaryCards() {
  const receivedCount =
    orders.filter(order => {
      return (
        normalizeOrderStatus(
          order.order_status
        ) === "pending"
      );
    }).length;

  /*
   * Ready and assigned remain internal statuses.
   * They are displayed publicly as Preparing.
   */
  const preparingCount =
    orders.filter(order => {
      return [
        "preparing",
        "ready",
        "assigned"
      ].includes(
        normalizeOrderStatus(
          order.order_status
        )
      );
    }).length;

  const outForDeliveryCount =
    orders.filter(order => {
      return (
        normalizeOrderStatus(
          order.order_status
        ) === "out_for_delivery"
      );
    }).length;

  const pickedUpCount =
    orders.filter(order => {
      return (
        normalizeOrderStatus(
          order.order_status
        ) === "completed"
      );
    }).length;

  const cancelledCount =
    orders.filter(order => {
      return (
        normalizeOrderStatus(
          order.order_status
        ) === "cancelled"
      );
    }).length;

  const pendingElement =
    document.getElementById(
      "pendingCount"
    );

  const preparingElement =
    document.getElementById(
      "preparingCount"
    );

  const outForDeliveryElement =
    document.getElementById(
      "readyCount"
    );

  const completedElement =
    document.getElementById(
      "completedCount"
    );

  const cancelledElement =
    document.getElementById(
      "cancelledCount"
    );

  if (pendingElement) {
    pendingElement.textContent =
      receivedCount;
  }

  if (preparingElement) {
    preparingElement.textContent =
      preparingCount;
  }

  if (outForDeliveryElement) {
    outForDeliveryElement.textContent =
      outForDeliveryCount;
  }

  if (completedElement) {
    completedElement.textContent =
      pickedUpCount;
  }

  if (cancelledElement) {
    cancelledElement.textContent =
      cancelledCount;
  }
}

function handleStatusSelect() {
  const selected = document.getElementById("statusFilter").value;
  currentStatusFilter = selected;

  document.querySelectorAll(".status-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.status === selected);
  });

  renderOrders();
}

function openOrderModal(orderId) {
  selectedOrder = orders.find(order => Number(order.order_id) === Number(orderId));

  if (!selectedOrder) {
    showToast(
  "Order Not Found",
  "The selected order no longer exists."
);  
    return;
  }

  document.getElementById("modalOrderSubtitle").textContent =
  `Queue #${selectedOrder.queue_number || "N/A"} • ` +
  `Order #${selectedOrder.order_id} • ` +
  getStatusDisplayLabel(
    selectedOrder.order_status,
    selectedOrder.order_type
  );

  document.getElementById("modalBody").innerHTML = buildModalContent(selectedOrder);

  updateModalButtons(selectedOrder.order_status);

  document.getElementById("orderModal").classList.add("active");
}

function buildModalContent(order) {
  const items = Array.isArray(order.items) ? order.items : [];

  const orderItemsHTML = items.length > 0
    ? items.map(item => `
        <div class="order-item">
          <div class="order-item-info">
            <h4>${escapeHTML(item.product_name || "Unnamed Item")}</h4>
            <p>
    Qty: ${escapeHTML(item.quantity || 0)}

    ${item.base_text
        ? `<br><strong>Variant:</strong> ${escapeHTML(item.base_text)}`
        : ""
    }

    ${item.has_combo_choice
        ? `<br><strong>Drink:</strong> ${escapeHTML(item.combo_choice_text)}`
        : ""
    }

    ${
        item.addon_text &&
        item.addon_text !== "No Add-on"
            ? `<br><strong>Add-ons:</strong> ${escapeHTML(item.addon_text)}`
            : ""
    }
</p>
          </div>
          <div class="order-item-price">
            ₱${formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
          </div>
        </div>
      `).join("")
    : `<p class="empty-message">No items found for this order.</p>`;


    const cancellationHTML =
  String(order.order_status || "").toLowerCase() === "cancelled"
    ? `
      <div class="cancellation-detail-box">
        <span>Cancellation Information</span>

        <strong>
          ${escapeHTML(
            order.cancellation_reason ||
            "No cancellation reason recorded."
          )}
        </strong>

        <div class="cancellation-meta">
          Cancelled by:
          ${escapeHTML(
            formatCancelledBy(order.cancelled_by)
          )}

          ${
            order.cancelled_at
              ? ` • ${escapeHTML(
                  formatDateTime(order.cancelled_at)
                )}`
              : ""
          }
        </div>
      </div>
    `
    : "";
  return `
<div class="order-detail-box">
  <span>Queue Number</span>
  <strong>#${escapeHTML(order.queue_number || "N/A")}</strong>
</div>

    <div class="order-details-grid">
      <div class="order-detail-box">
        <span>Customer Name</span>
        <strong>${escapeHTML(order.customer_name || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Contact Number</span>
        <strong>${escapeHTML(order.contact_number || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Order Type</span>
        <strong>${formatOrderType(order.order_type)}</strong>
      </div>

      <div class="order-detail-box">
        <span>Payment Method</span>
        <strong>${escapeHTML(order.payment_method || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Total Amount</span>
        <strong>₱${formatMoney(order.total_amount)}</strong>
      </div>

      <div class="order-detail-box">
        <span>Status</span>
        <strong>
  ${escapeHTML(
    getStatusDisplayLabel(order.order_status, order.order_type)
  )}
</strong>
      </div>

      <div class="order-detail-box">
        <span>Address</span>
        <strong>${escapeHTML(order.address || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Landmark</span>
        <strong>${escapeHTML(order.landmark || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Table Number</span>
        <strong>${escapeHTML(order.table_number || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Pickup Time</span>
        <strong>${escapeHTML(order.pickup_time || "N/A")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Notes</span>
        <strong>${escapeHTML(order.notes || "None")}</strong>
      </div>

      <div class="order-detail-box">
        <span>Date / Time</span>
        <strong>${formatDateTime(order.created_at)}</strong>
      </div>
      ${cancellationHTML}
    </div>

    <h3 class="order-items-title">Order Items</h3>

    <div class="order-items-list">
      ${orderItemsHTML}
    </div>
  `;
}
function formatCancelledBy(value) {
  const normalized =
    String(value || "").toLowerCase();

  if (normalized === "cashier") {
    return "Cashier";
  }

  if (normalized === "customer") {
    return "Customer";
  }

  return "Unknown";
}
function closeModal() {
  document.getElementById("orderModal").classList.remove("active");
  selectedOrder = null;
}

function updateModalButtons(status) {
  const preparingBtn =
    document.getElementById(
      "markPreparingBtn"
    );

  const readyBtn =
    document.getElementById(
      "markReadyBtn"
    );

  const completedBtn =
    document.getElementById(
      "markCompletedBtn"
    );

  const assignRiderBtn =
    document.getElementById(
      "assignRiderBtn"
    );

  const cancelBtn =
    document.getElementById(
      "markCancelledBtn"
    );

  if (preparingBtn) {
    preparingBtn.style.display = "none";
  }

  if (readyBtn) {
    readyBtn.style.display = "none";
  }

  if (completedBtn) {
    completedBtn.style.display = "none";
  }

  if (assignRiderBtn) {
    assignRiderBtn.style.display = "none";
  }

  if (cancelBtn) {
    cancelBtn.style.display = "none";
  }

  if (!selectedOrder) {
    return;
  }

  const normalizedStatus =
    normalizeOrderStatus(status);

  const orderType =
    String(
      selectedOrder.order_type || ""
    )
      .toLowerCase()
      .trim();

  /*
   * New order:
   * Cashier begins preparation.
   */
  if (normalizedStatus === "pending") {
    if (preparingBtn) {
      preparingBtn.style.display =
        "inline-flex";
    }

    if (cancelBtn) {
      cancelBtn.style.display =
        "inline-flex";
    }

    return;
  }

  /*
   * The internal Ready status is still required,
   * but publicly it remains displayed as Preparing.
   */
  if (
    normalizedStatus === "preparing"
  ) {
    if (readyBtn) {
      readyBtn.textContent =
        "Finish Preparing";

      readyBtn.style.display =
        "inline-flex";
    }

    if (cancelBtn) {
      cancelBtn.style.display =
        "inline-flex";
    }

    return;
  }

  /*
   * Internally ready, publicly still Preparing.
   */
  if (normalizedStatus === "ready") {
    if (orderType === "delivery") {
      if (assignRiderBtn) {
        assignRiderBtn.style.display =
          "inline-flex";
      }
    } else {
      if (completedBtn) {
        completedBtn.textContent =
          "Picked Up by Customer";

        completedBtn.style.display =
          "inline-flex";
      }
    }

    if (cancelBtn) {
      cancelBtn.style.display =
        "inline-flex";
    }

    return;
  }

  /*
   * assigned, out_for_delivery, completed,
   * and cancelled have no cashier status button.
   */
}

function openConfirmModal(title, message, callback) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;

  confirmCallback = callback;

  document.getElementById("confirmModal").classList.add("active");
}

function closeConfirmModal() {
  confirmCallback = null;

  document
    .getElementById("confirmModal")
    ?.classList.remove("active");

  if (restoreAssignModalAfterConfirm) {
    document
      .getElementById("assignRiderModal")
      ?.classList.add("active");

    restoreAssignModalAfterConfirm = false;
  }
}

async function openAssignRiderModal() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );
    return;
  }

  const orderType = String(
    selectedOrder.order_type || ""
  ).toLowerCase();

  const orderStatus = String(
    selectedOrder.order_status || ""
  ).toLowerCase();

  if (orderType !== "delivery") {
    showToast(
      "Invalid Order Type",
      "Only delivery orders can be assigned to a rider."
    );
    return;
  }

  if (orderStatus !== "ready") {
    showToast(
      "Order Not Ready",
      "The order must be ready before assigning a rider."
    );
    return;
  }

  document.getElementById("assignRiderSubtitle").textContent =
    `Assign a rider to Order #${selectedOrder.order_id}`;

  document.getElementById("assignmentOrderSummary").innerHTML = `
    <div class="assignment-summary-item">
      <span>Queue Number</span>
      <strong>
        #${escapeHTML(selectedOrder.queue_number || "N/A")}
      </strong>
    </div>

    <div class="assignment-summary-item">
      <span>Customer</span>
      <strong>
        ${escapeHTML(selectedOrder.customer_name || "N/A")}
      </strong>
    </div>

    <div class="assignment-summary-item">
      <span>Contact</span>
      <strong>
        ${escapeHTML(selectedOrder.contact_number || "N/A")}
      </strong>
    </div>

    <div class="assignment-summary-item">
      <span>Order Total</span>
      <strong>
        ₱${formatMoney(selectedOrder.total_amount)}
      </strong>
    </div>

    <div class="assignment-summary-item">
      <span>Address</span>
      <strong>
        ${escapeHTML(selectedOrder.address || "N/A")}
      </strong>
    </div>

    <div class="assignment-summary-item">
      <span>Landmark</span>
      <strong>
        ${escapeHTML(selectedOrder.landmark || "N/A")}
      </strong>
    </div>
  `;

  document.getElementById("deliveryFeeInput").value = "0.00";

  document
    .getElementById("assignRiderModal")
    .classList.add("active");

  

  await loadAvailableRiders();
}

function closeAssignRiderModal() {
  document
    .getElementById("assignRiderModal")
    ?.classList.remove("active");

  const riderSelect = document.getElementById("riderSelect");

  if (riderSelect) {
    riderSelect.innerHTML = `
      <option value="">
        Select an available rider
      </option>
    `;
  }
}

async function loadAvailableRiders() {
  const riderSelect = document.getElementById("riderSelect");
  const message = document.getElementById(
    "riderAvailabilityMessage"
  );

  if (!riderSelect) return;

  riderSelect.disabled = true;

  riderSelect.innerHTML = `
    <option value="">
      Loading available riders...
    </option>
  `;

  if (message) {
    message.textContent =
      "Checking restaurant rider availability...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/get_available_riders.php`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load riders."
      );
    }

    const riders = Array.isArray(data.riders)
      ? data.riders
      : [];

    if (riders.length === 0) {
      riderSelect.innerHTML = `
        <option value="">
          No available riders
        </option>
      `;

      if (message) {
        message.textContent =
          "No active restaurant riders are currently available.";
      }

      return;
    }

    riderSelect.innerHTML = `
      <option value="">
        Select an available rider
      </option>

      ${riders.map(rider => `
        <option value="${Number(rider.user_id)}">
          ${escapeHTML(rider.full_name)}
          ${
            rider.contact_number
              ? ` — ${escapeHTML(rider.contact_number)}`
              : ""
          }
        </option>
      `).join("")}
    `;

    if (message) {
      message.textContent =
        `${riders.length} available rider${
          riders.length === 1 ? "" : "s"
        } found.`;
    }

  } catch (error) {
    console.error("Load available riders error:", error);

    riderSelect.innerHTML = `
      <option value="">
        Unable to load riders
      </option>
    `;

    if (message) {
      message.textContent =
        error.message || "Failed to load rider availability.";
    }

  } finally {
    riderSelect.disabled = false;
  }
}

async function submitRiderAssignment() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );
    return;
  }

  const riderSelect = document.getElementById("riderSelect");
  const deliveryFeeInput = document.getElementById(
    "deliveryFeeInput"
  );
  
  const submitBtn = document.getElementById(
    "confirmAssignRiderBtn"
  );

 const riderId = Number(riderSelect?.value || 0);
const deliveryFee = Number(deliveryFeeInput?.value || 0);

  if (riderId <= 0) {
    showToast(
      "Rider Required",
      "Please select an available rider."
    );
    return;
  }

if (
  !Number.isFinite(deliveryFee) ||
  deliveryFee < 0
) {
  showToast(
    "Invalid Delivery Fee",
    "The delivery fee must be a valid non-negative amount."
  );

  return;
}

restoreAssignModalAfterConfirm = true;

document
  .getElementById("assignRiderModal")
  ?.classList.remove("active");

openConfirmModal(
  "Assign Delivery Rider",
  `Assign the selected rider to Order #${selectedOrder.order_id}?`,
  async () => {
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i>
          Assigning...
        `;
      }

      const response = await fetch(
        `${API_BASE}/assign_delivery_rider.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            order_id: selectedOrder.order_id,
            rider_id: riderId,
            delivery_fee: deliveryFee,
            rider_payment: 0
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to assign rider."
        );
      }

      showToast(
        "Rider Assigned",
        `${data.assignment?.rider_name || "The rider"} was assigned to Order #${selectedOrder.order_id}.`
      );

      closeAssignRiderModal();
      closeModal();

      await loadOrders();
      await loadCashierNotifications();

    } catch (error) {
      console.error("Assign rider error:", error);

      showToast(
        "Assignment Failed",
        error.message || "Failed to assign the rider."
      );

      document
        .getElementById("assignRiderModal")
        ?.classList.add("active");

      await loadAvailableRiders();

    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <i class="fa-solid fa-motorcycle"></i>
          Assign Rider
        `;
      }
    }
  }
);
}

function openCancelReasonModal() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );

    return;
  }

  const status = String(
    selectedOrder.order_status || ""
  ).toLowerCase();

  if (
    !["pending", "preparing", "ready"].includes(status)
  ) {
    showToast(
      "Cancellation Not Allowed",
      "This order can no longer be cancelled."
    );

    return;
  }

  resetCancellationReasonForm();

  const subtitle =
    document.getElementById("cancelReasonSubtitle");

  if (subtitle) {
    subtitle.textContent =
      `Select the reason for cancelling Order #${selectedOrder.order_id}.`;
  }

  document
    .getElementById("orderModal")
    ?.classList.remove("active");

  document
    .getElementById("cancelReasonModal")
    ?.classList.add("active");
}

function resetCancellationReasonForm() {
  pendingCancellationReason = "";

  document
    .querySelectorAll(
      'input[name="cashierCancellationReason"]'
    )
    .forEach((radio) => {
      radio.checked = false;
    });

  const otherReasonGroup =
    document.getElementById(
      "cancelOtherReasonGroup"
    );

  const otherReasonInput =
    document.getElementById(
      "cancelOtherReasonInput"
    );

  const errorElement =
    document.getElementById(
      "cancelReasonError"
    );

  const confirmButton =
    document.getElementById(
      "confirmCancelOrderBtn"
    );

  const characterCount =
    document.getElementById(
      "cancelReasonCharacterCount"
    );

  if (otherReasonGroup) {
    otherReasonGroup.hidden = true;
  }

  if (otherReasonInput) {
    otherReasonInput.value = "";
  }

  if (errorElement) {
    errorElement.hidden = true;
    errorElement.textContent =
      "Please select a cancellation reason.";
  }

  if (confirmButton) {
    confirmButton.disabled = true;

    confirmButton.innerHTML = `
      <i class="fa-solid fa-ban"></i>
      Confirm Cancellation
    `;
  }

  if (characterCount) {
    characterCount.textContent = "0";
  }
}

function handleCancellationReasonChange() {
  const selectedRadio =
    document.querySelector(
      'input[name="cashierCancellationReason"]:checked'
    );

  const selectedValue =
    String(selectedRadio?.value || "").trim();

  const otherReasonGroup =
    document.getElementById(
      "cancelOtherReasonGroup"
    );

  const otherReasonInput =
    document.getElementById(
      "cancelOtherReasonInput"
    );

  if (otherReasonGroup) {
    otherReasonGroup.hidden =
      selectedValue !== "Other";
  }

  if (
    selectedValue !== "Other" &&
    otherReasonInput
  ) {
    otherReasonInput.value = "";
  }

  updateCancellationReasonState();

  if (
    selectedValue === "Other" &&
    otherReasonInput
  ) {
    otherReasonInput.focus();
  }
} 
function closeCancelReasonModal() {
  const cancellationModal =
    document.getElementById(
      "cancelReasonModal"
    );

  cancellationModal?.classList.remove(
    "active"
  );

  resetCancellationReasonForm();

  /*
   * Return to Order Details only when
   * an order is still selected.
   */
  if (selectedOrder) {
    document
      .getElementById("orderModal")
      ?.classList.add("active");
  }
}

function updateCancellationReasonState() {
  const selectedRadio =
    document.querySelector(
      'input[name="cashierCancellationReason"]:checked'
    );

  const selectedValue =
    selectedRadio?.value || "";

  const otherInput =
    document.getElementById(
      "cancelOtherReasonInput"
    );

  const otherReason =
    String(otherInput?.value || "").trim();

  const confirmButton =
    document.getElementById(
      "confirmCancelOrderBtn"
    );

  const error =
    document.getElementById(
      "cancelReasonError"
    );

  const characterCount =
    document.getElementById(
      "cancelReasonCharacterCount"
    );

  if (characterCount) {
    characterCount.textContent =
      String(otherInput?.value.length || 0);
  }

  if (selectedValue === "Other") {
    pendingCancellationReason =
      otherReason;

    if (confirmButton) {
      confirmButton.disabled =
        otherReason.length < 3;
    }
  } else {
    pendingCancellationReason =
      selectedValue;

    if (confirmButton) {
      confirmButton.disabled =
        selectedValue === "";
    }
  }

  if (
    error &&
    pendingCancellationReason !== ""
  ) {
    error.hidden = true;
  }
}

async function submitCashierCancellation() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );

    return;
  }

  updateCancellationReasonState();

  const reason = String(
    pendingCancellationReason || ""
  ).trim();

  const errorElement =
    document.getElementById(
      "cancelReasonError"
    );

  if (reason.length < 3) {
    if (errorElement) {
      errorElement.textContent =
        "Please select or enter a valid cancellation reason.";

      errorElement.hidden = false;
    }

    return;
  }

  const orderId = Number(
    selectedOrder.order_id
  );

  const confirmButton =
    document.getElementById(
      "confirmCancelOrderBtn"
    );

  try {
    if (confirmButton) {
      confirmButton.disabled = true;

      confirmButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cancelling...
      `;
    }

    const response = await fetch(
      `${API_BASE}/update_order_status.php`,
      {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          order_id: orderId,
          order_status: "cancelled",
          cancellation_reason: reason
        })
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
        "Failed to cancel the order."
      );
    }

    document
      .getElementById(
        "cancelReasonModal"
      )
      ?.classList.remove("active");

    document
      .getElementById("orderModal")
      ?.classList.remove("active");

    resetCancellationReasonForm();

    selectedOrder = null;

    showToast(
      "Order Cancelled",
      `Order #${orderId} was cancelled successfully.`
    );

    await loadOrders();
    await loadCashierNotifications();

  } catch (error) {
    console.error(
      "Cashier cancellation error:",
      error
    );

    if (errorElement) {
      errorElement.textContent =
        error.message ||
        "Unable to cancel the order.";

      errorElement.hidden = false;
    }

  } finally {
    if (confirmButton) {
      confirmButton.innerHTML = `
        <i class="fa-solid fa-ban"></i>
        Confirm Cancellation
      `;

      updateCancellationReasonState();
    }
  }
}

async function updateOrderStatus(newStatus) {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );

    return;
  }

  const orderId = Number(
    selectedOrder.order_id || 0
  );

  if (orderId <= 0) {
    showToast(
      "Invalid Order",
      "The selected order is invalid."
    );

    return;
  }

  let cancellationReason = "";

  if (newStatus === "cancelled") {
    cancellationReason = window.prompt(
      "Why is this order being cancelled?\n\n" +
      "Examples:\n" +
      "• Product unavailable\n" +
      "• Restaurant unable to fulfill order\n" +
      "• Customer requested cancellation\n" +
      "• Invalid order information"
    );

    if (cancellationReason === null) {
      return;
    }

    cancellationReason =
      cancellationReason.trim();

    if (
      cancellationReason.length < 3 ||
      cancellationReason.length > 255
    ) {
      showToast(
        "Reason Required",
        "Enter a cancellation reason between 3 and 255 characters."
      );

      return;
    }
  }

  const statusLabel =
    getStatusDisplayLabel(
      newStatus,
      selectedOrder.order_type
    );

  const confirmationMessage =
    newStatus === "cancelled"
      ? (
          `Cancel Order #${orderId}?\n\n` +
          `Reason: ${cancellationReason}\n\n` +
          "The customer will be notified and the stock will be restored."
        )
      : (
          `Are you sure you want to update Order #${orderId} to ${statusLabel}?`
        );

  openConfirmModal(
    newStatus === "cancelled"
      ? "Cancel Order"
      : "Update Order Status",

    confirmationMessage,

    async () => {
      try {
        const response = await fetch(
          `${API_BASE}/update_order_status.php`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              order_id: orderId,
              order_status: newStatus,

              cancellation_reason:
                newStatus === "cancelled"
                  ? cancellationReason
                  : ""
            })
          }
        );

        const responseText =
          await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error(
            "Invalid status response:",
            responseText
          );

          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Failed to update order status."
          );
        }

        showToast(
          newStatus === "cancelled"
            ? "Order Cancelled"
            : "Order Updated",

          newStatus === "cancelled"
            ? (
                `Order #${orderId} was cancelled. ` +
                "The customer will be notified."
              )
            : (
                `Order #${orderId} status updated successfully.`
              )
        );

        closeModal();

        await loadOrders();

      } catch (error) {
        console.error(
          "Update order status error:",
          error
        );

        showToast(
          "Update Failed",
          error.message ||
          "Failed to update the order status."
        );
      }
    }
  );
}

function switchSection(sectionId) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  document.querySelectorAll(".content-section").forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });

  document.getElementById("sidebar")?.classList.remove("active");
}

function toggleSound() {
  soundEnabled = !soundEnabled;

  const icon = document.querySelector("#soundToggle i");

  if (soundEnabled) {
    icon.className = "fa-solid fa-volume-high";
  } else {
    icon.className = "fa-solid fa-volume-xmark";
  }
}

function playNotificationSound() {
  if (!soundEnabled) return;

  const sound = document.getElementById("notificationSound");

  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {
      console.log("Notification sound blocked until user interacts with page.");
    });
  }
}

async function loadCashierNotifications() {
  const list = document.getElementById("notificationsList");
  const badge = document.getElementById("cashierNotificationBadge");

  if (!list) return;

  try {
    const response = await fetch(
      `${API_BASE}/get_cashier_notifications.php`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      }
    );

    const data = await response.json();

    if (
      !response.ok ||
      !data.success ||
      !Array.isArray(data.notifications)
    ) {
      throw new Error(
        data.message || "Failed to load notifications."
      );
    }

    if (data.notifications.length === 0) {
      list.innerHTML = `
        <p class="empty-message">
          No notifications yet.
        </p>
      `;

      if (badge) {
        badge.textContent = "0";
        badge.style.display = "none";
      }

      return;
    }

    const unreadCount = Number(data.unread_count || 0);

    if (badge) {
      badge.textContent = String(unreadCount);
      badge.style.display =
        unreadCount > 0 ? "inline-flex" : "none";
    }

    list.innerHTML = data.notifications
      .map((notif) => {
        const logId = Number(notif.log_id);
        const isRead = Number(notif.is_read) === 1;

        const title =
          notif.action_title || "Notification";

        const message =
          notif.action_description || "";

        const time =
          formatDateTime(notif.created_at);

        const icon = title
          .toLowerCase()
          .includes("cancel")
            ? "fa-circle-xmark"
            : "fa-bell";

        return `
          <div
            class="notification-item ${isRead ? "is-read" : "is-unread"}"
            data-log-id="${logId}"
          >
            <i class="fa-solid ${icon}"></i>

            <div class="notification-content">
              <h4>${escapeHTML(title)}</h4>
              <p>${escapeHTML(message)}</p>
              <small>${escapeHTML(time)}</small>

              ${
                isRead
                  ? `
                    <span class="notification-read-label">
                      Read
                    </span>
                  `
                  : `
                    <button
                      type="button"
                      class="mark-read-btn"
                      onclick="markCashierNotificationRead(${logId})"
                    >
                      Mark as Read
                    </button>
                  `
              }
            </div>
          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error(
      "Load cashier notifications error:",
      error
    );
  }
}

async function markCashierNotificationRead(logId) {
  const id = Number(logId);

  if (!Number.isInteger(id) || id <= 0) {
    showToast(
      "Invalid Notification",
      "The selected notification is invalid."
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/mark_notification_read.php`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          log_id: id
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to mark notification as read."
      );
    }

    await loadCashierNotifications();

  } catch (error) {
    console.error(
      "Mark cashier notification read error:",
      error
    );

    showToast(
      "Update Failed",
      error.message ||
      "Unable to mark notification as read."
    );
  }
}

function addNotification(title, message) {
  const list = document.getElementById("notificationsList");

  if (!list) return;

  const empty = list.querySelector(".empty-message");
  if (empty) empty.remove();

  const notification = document.createElement("div");
  notification.className = "notification-item";

  notification.innerHTML = `
  <i class="fa-solid fa-bell"></i>
  <div>
    <h4>${escapeHTML(title)}</h4>
    <p>${escapeHTML(message)}</p>
    <small>Just now</small>
  </div>
`;

  list.prepend(notification);
}

function showToast(title, message) {
  const container = document.getElementById("toastContainer");

  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";

  toast.innerHTML = `
    <h4>${escapeHTML(title)}</h4>
    <p>${escapeHTML(message)}</p>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");

    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 4000);
}

function printCustomerReceipt() {
  if (!selectedOrder) {
    showToast("No Order Selected", "Please select an order first.");
    return;
  }

  const order = selectedOrder;
  const items = Array.isArray(order.items) ? order.items : [];

  const itemRows = items.map(item => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const subtotal = quantity * price;

    return `
      <tr>
        <td>
          ${escapeHTML(item.product_name || "Unnamed Item")}
         ${item.base_text
    ? `<br><small>Variant: ${escapeHTML(item.base_text)}</small>`
    : ""
}

${item.combo_choice_text
    ? `<br><small>Drink: ${escapeHTML(item.combo_choice_text)}</small>`
    : ""
}

${
    item.addon_text &&
    item.addon_text !== "No Add-on"
        ? `<br><small>Add-ons: ${escapeHTML(item.addon_text)}</small>`
        : ""
}
        </td>
        <td class="center">${quantity}</td>
        <td class="right">₱${formatMoney(price)}</td>
        <td class="right">₱${formatMoney(subtotal)}</td>
      </tr>
    `;
  }).join("");

 const content = `
  <div class="receipt customer-receipt">
    <h1>BlackHabit</h1>
    <p class="center-text">CUSTOMER RECEIPT</p>
    <p class="center-text">Thank you for your order</p>

    <hr>

    <p><strong>Queue:</strong> #${escapeHTML(order.queue_number || "N/A")}</p>
    <p><strong>Order:</strong> #${escapeHTML(order.order_id)}</p>
    <p><strong>Customer:</strong> ${escapeHTML(order.customer_name || "N/A")}</p>
    <p><strong>Type:</strong> ${escapeHTML(formatOrderType(order.order_type))}</p>
    <p><strong>Payment:</strong> ${escapeHTML(order.payment_method || "N/A")}</p>
    <p><strong>Date:</strong> ${escapeHTML(formatDateTime(order.created_at))}</p>

    <hr>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <hr>

    <h2 class="right">
      TOTAL: ₱${formatMoney(order.total_amount)}
    </h2>

    ${
      order.notes
        ? `
          <hr>
          <p><strong>Notes:</strong> ${escapeHTML(order.notes)}</p>
        `
        : ""
    }

    <p class="thank-you">
      THANK YOU!
    </p>
  </div>
`;

  openPrintWindow("Customer Receipt", content);
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusDisplayLabel(
  status,
  orderType
) {
  const normalizedStatus =
    normalizeOrderStatus(status);

  /*
   * Simplified cashier-facing statuses.
   *
   * ready and assigned are internal workflow states,
   * but the cashier continues seeing Preparing.
   */
  const labels = {
    pending:
      "Order Received",

    preparing:
      "Preparing",

    ready:
      "Preparing",

    assigned:
      "Preparing",

    out_for_delivery:
      "Out for Delivery",

    completed:
      "Picked Up by Customer",

    cancelled:
      "Cancelled"
  };

  return (
    labels[normalizedStatus] ||
    "Order Received"
  );
}

function normalizeOrderStatus(status) {
  return String(
    status || ""
  )
    .toLowerCase()
    .trim();
}

function getPublicStatusClass(status) {
  const normalizedStatus =
    normalizeOrderStatus(status);

  if (normalizedStatus === "pending") {
    return "pending";
  }

  if (
    [
      "preparing",
      "ready",
      "assigned"
    ].includes(normalizedStatus)
  ) {
    return "preparing";
  }

  if (
    normalizedStatus ===
    "out_for_delivery"
  ) {
    return "out_for_delivery";
  }

  if (
    normalizedStatus === "completed"
  ) {
    return "completed";
  }

  if (
    normalizedStatus === "cancelled"
  ) {
    return "cancelled";
  }

  return "pending";
}

function orderMatchesPublicStatus(
  order,
  publicStatus
) {
  const internalStatus =
    normalizeOrderStatus(
      order.order_status
    );

  if (publicStatus === "pending") {
    return internalStatus === "pending";
  }

  if (publicStatus === "preparing") {
    return [
      "preparing",
      "ready",
      "assigned"
    ].includes(internalStatus);
  }

  if (
    publicStatus ===
    "out_for_delivery"
  ) {
    return (
      internalStatus ===
      "out_for_delivery"
    );
  }

  if (publicStatus === "completed") {
    return (
      internalStatus === "completed"
    );
  }

  if (publicStatus === "cancelled") {
    return (
      internalStatus === "cancelled"
    );
  }

  return true;
}

function formatOrderType(type) {
  if (!type) return "N/A";

  return String(type)
    .replace("-", " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printKitchenTicket() {
  if (!selectedOrder) {
    showToast("No Order Selected", "Please select an order first.");
    return;
  }

  const order = selectedOrder;
  const items = Array.isArray(order.items) ? order.items : [];

  const itemRows = items.map(item => {
  const quantity = Number(item.quantity || 0);
  const price = Number(item.price || 0);
  const subtotal = quantity * price;

  const baseText = String(item.base_text || "").trim();
  const comboChoiceText = String(
    item.combo_choice_text || ""
  ).trim();

  const addonText = String(
    item.addon_text || ""
  ).trim();

  return `
    <tr>
      <td>
        ${escapeHTML(item.product_name || "Unnamed Item")}

        ${
          baseText
            ? `<br><small>Variant: ${escapeHTML(baseText)}</small>`
            : ""
        }

        ${
          comboChoiceText
            ? `<br><small>Drink: ${escapeHTML(comboChoiceText)}</small>`
            : ""
        }

        ${
          addonText && addonText !== "No Add-on"
            ? `<br><small>Add-ons: ${escapeHTML(addonText)}</small>`
            : ""
        }
      </td>

      <td class="center">${quantity}</td>
      <td class="right">₱${formatMoney(price)}</td>
      <td class="right">₱${formatMoney(subtotal)}</td>
    </tr>
  `;
}).join("");

  const content = `
  <div class="receipt kitchen-ticket">
    <h1>KITCHEN ORDER</h1>

    <div class="queue-number">
      #${escapeHTML(order.queue_number || "N/A")}
    </div>

    <p class="center-text">
      Order #${escapeHTML(order.order_id)}
    </p>

    <hr>

    <p>
      <strong>Type:</strong>
      ${escapeHTML(formatOrderType(order.order_type))}
    </p>

    <p>
      <strong>Customer:</strong>
      ${escapeHTML(order.customer_name || "N/A")}
    </p>

    ${
      String(order.order_type || "").toLowerCase() === "dine-in"
        ? `
          <p>
            <strong>Table:</strong>
            ${escapeHTML(order.table_number || "N/A")}
          </p>
        `
        : ""
    }

    ${
      String(order.order_type || "").toLowerCase() === "take-out"
        ? `
          <p>
            <strong>Pickup:</strong>
            ${escapeHTML(order.pickup_time || "N/A")}
          </p>
        `
        : ""
    }

    <p>
      <strong>Time:</strong>
      ${escapeHTML(formatDateTime(order.created_at))}
    </p>

    <hr>

    ${itemRows || "<p>No items found.</p>"}

    ${
      order.notes
        ? `
          <hr>

          <div class="notes">
            <strong>IMPORTANT NOTES</strong>
            <p>${escapeHTML(order.notes)}</p>
          </div>
        `
        : ""
    }

    <hr>

    <p class="center-text">
      --- END OF ORDER ---
    </p>
  </div>
`;

  openPrintWindow("Kitchen Order Ticket", content);
}



function openPrintWindow(title, content) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=420,height=700"
  );

  if (!printWindow) {
    showToast(
      "Printing Blocked",
      "Please allow pop-ups so the receipt can be printed."
    );
    return;
  }

  printWindow.document.open();

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >

      <title>${escapeHTML(title)}</title>

      <style>
        @page {
          size: 58mm auto;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          width: 58mm;
          min-width: 58mm;
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
        }

        body {
          font-family:
            "Courier New",
            Courier,
            monospace;

          font-size: 10px;
          line-height: 1.3;

          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .receipt {
          width: 54mm;
          max-width: 54mm;
          margin: 0 auto;
          padding: 3mm 2mm 5mm;
          overflow-wrap: anywhere;
        }

        h1 {
          margin: 0 0 2mm;
          text-align: center;
          font-size: 16px;
          line-height: 1.15;
          font-weight: 700;
          text-transform: uppercase;
        }

        h2 {
          margin: 2mm 0;
          font-size: 13px;
          line-height: 1.2;
        }

        p {
          margin: 1mm 0;
          font-size: 10px;
          line-height: 1.3;
        }

        small {
          font-size: 8px;
          line-height: 1.2;
        }

        hr {
          width: 100%;
          margin: 2.5mm 0;
          border: 0;
          border-top: 1px dashed #000000;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 9px;
        }

        th,
        td {
          padding: 1mm 0.5mm;
          vertical-align: top;
          overflow-wrap: anywhere;
        }

        th {
          border-bottom: 1px dashed #000000;
          font-size: 8px;
          text-align: left;
        }

        th:nth-child(1),
        td:nth-child(1) {
          width: 43%;
        }

        th:nth-child(2),
        td:nth-child(2) {
          width: 11%;
          text-align: center;
        }

        th:nth-child(3),
        td:nth-child(3) {
          width: 21%;
          text-align: right;
        }

        th:nth-child(4),
        td:nth-child(4) {
          width: 25%;
          text-align: right;
        }

        .right {
          text-align: right;
        }

        .center {
          text-align: center;
        }

        .center-text {
          text-align: center;
        }

        .thank-you {
          margin-top: 4mm;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
        }

        .queue-number {
          margin: 3mm 0;
          text-align: center;
          font-size: 30px;
          line-height: 1;
          font-weight: 900;
        }

        .kitchen-ticket h1 {
          font-size: 18px;
        }

        .kitchen-item {
          padding: 2.5mm 0;
          border-bottom: 1px dashed #000000;
          font-size: 14px;
          line-height: 1.25;
          page-break-inside: avoid;
        }

        .kitchen-item strong {
          display: block;
          font-size: 14px;
          font-weight: 900;
        }

        .kitchen-item p {
          margin: 1mm 0 0 4mm;
          font-size: 11px;
          font-weight: 700;
        }

        .notes {
          margin-top: 2mm;
          padding: 2mm;
          border: 2px solid #000000;
          font-size: 12px;
          line-height: 1.3;
          font-weight: 700;
          page-break-inside: avoid;
        }

        .notes p {
          margin-top: 1mm;
          font-size: 12px;
          font-weight: 700;
        }

        @media screen {
          body {
            margin: 0 auto;
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.18);
          }
        }

        @media print {
          html,
          body {
            width: 58mm !important;
            min-width: 58mm !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          .receipt {
            width: 54mm !important;
            max-width: 54mm !important;
          }
        }
      </style>
    </head>

    <body>
      ${content}

      <script>
        window.onload = function () {
          setTimeout(function () {
            window.focus();
            window.print();
          }, 250);
        };

        window.onafterprint = function () {
          window.close();
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
}