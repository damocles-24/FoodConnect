const API_BASE = "../../api";

let deliveries = [];
let selectedDelivery = null;
let currentDeliveryFilter = "active";
let confirmCallback = null;

/*
|--------------------------------------------------------------------------
| Initialize dashboard
|--------------------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {
  loadDeliveries();

  const refreshInterval = setInterval(() => {
    loadDeliveries(false);
  }, 5000);

  window.addEventListener("beforeunload", () => {
    clearInterval(refreshInterval);
  });

  document
    .getElementById("refreshDeliveriesBtn")
    ?.addEventListener("click", () => {
      loadDeliveries(true);
    });

  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", () => {
      openConfirmModal(
        "Logout Account",
        "Are you sure you want to log out from the delivery dashboard?",
        () => {
          window.location.href = `${API_BASE}/logout.php`;
        }
      );
    });

  document
    .getElementById("closeDeliveryModal")
    ?.addEventListener("click", closeDeliveryModal);

  document
    .getElementById("closeDeliveryModalBtn")
    ?.addEventListener("click", closeDeliveryModal);

  document
    .getElementById("confirmCancelBtn")
    ?.addEventListener("click", closeConfirmModal);

  document
    .getElementById("confirmOkBtn")
    ?.addEventListener("click", async () => {
      const callback = confirmCallback;

      closeConfirmModal();

      if (typeof callback === "function") {
        await callback();
      }
    });

  document.querySelectorAll(".delivery-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".delivery-tab").forEach(button => {
        button.classList.remove("active");
      });

      tab.classList.add("active");
      currentDeliveryFilter = tab.dataset.status || "active";

      renderDeliveries();
    });
  });

  document
    .getElementById("deliveryModal")
    ?.addEventListener("click", event => {
      if (event.target.id === "deliveryModal") {
        closeDeliveryModal();
      }
    });

  document
    .getElementById("confirmModal")
    ?.addEventListener("click", event => {
      if (event.target.id === "confirmModal") {
        closeConfirmModal();
      }
    });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeDeliveryModal();
      closeConfirmModal();
    }
  });
});

/*
|--------------------------------------------------------------------------
| Load assigned deliveries
|--------------------------------------------------------------------------
*/

async function loadDeliveries(showLoading = true) {
  const list = document.getElementById("deliveryList");
  const refreshButton = document.getElementById(
    "refreshDeliveriesBtn"
  );

  if (!list) return;

  if (showLoading && deliveries.length === 0) {
    list.innerHTML = `
      <div class="delivery-empty-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <h3>Loading Deliveries</h3>
        <p>Please wait while your assigned deliveries are loaded.</p>
      </div>
    `;
  }

  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.innerHTML = `
      <i class="fa-solid fa-rotate fa-spin"></i>
      Refreshing
    `;
  }

  try {
    const response = await fetch(
      `${API_BASE}/get_delivery_staff_orders.php`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      }
    );

    const data = await readJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load delivery assignments."
      );
    }

    deliveries = Array.isArray(data.deliveries)
      ? data.deliveries
      : [];

    const riderName =
      data.rider?.full_name || "Delivery Staff";

    document.getElementById("riderName").textContent =
      riderName;

    updateRiderStatus();
    updateSummaryCards();
    renderDeliveries();

    if (
      selectedDelivery &&
      !deliveries.some(
        delivery =>
          Number(delivery.assignment_id) ===
          Number(selectedDelivery.assignment_id)
      )
    ) {
      closeDeliveryModal();
    }

  } catch (error) {
    console.error("Load deliveries error:", error);

    list.innerHTML = `
      <div class="delivery-empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Unable to Load Deliveries</h3>
        <p>${escapeHTML(
          error.message ||
          "Please check your connection and account session."
        )}</p>
      </div>
    `;

  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Refresh
      `;
    }
  }
}

/*
|--------------------------------------------------------------------------
| Summary and rider availability text
|--------------------------------------------------------------------------
*/

function updateSummaryCards() {
  const assignedCount = deliveries.filter(delivery => {
    return delivery.delivery_status === "assigned";
  }).length;

  const ongoingCount = deliveries.filter(delivery => {
    return [
      "accepted",
      "picked_up",
      "out_for_delivery"
    ].includes(delivery.delivery_status);
  }).length;

  const completedCount = deliveries.filter(delivery => {
    return delivery.delivery_status === "completed";
  }).length;

  document.getElementById("assignedCount").textContent =
    assignedCount;

  document.getElementById("ongoingCount").textContent =
    ongoingCount;

  document.getElementById("completedCount").textContent =
    completedCount;
}

function updateRiderStatus() {
  const statusElement = document.getElementById("riderStatus");

  if (!statusElement) return;

  const activeDeliveries = deliveries.filter(delivery => {
    return !["completed", "cancelled"].includes(
      String(delivery.delivery_status || "").toLowerCase()
    );
  });

  if (activeDeliveries.length === 0) {
    statusElement.textContent =
      "Ready to receive deliveries";

    return;
  }

  const outForDelivery = activeDeliveries.some(delivery => {
    return delivery.delivery_status === "out_for_delivery";
  });

  if (outForDelivery) {
    statusElement.textContent =
      "Currently delivering an order";

    return;
  }

  statusElement.textContent =
    `${activeDeliveries.length} active delivery${
      activeDeliveries.length === 1 ? "" : "ies"
    }`;
}

/*
|--------------------------------------------------------------------------
| Render delivery cards
|--------------------------------------------------------------------------
*/

function renderDeliveries() {
  const list = document.getElementById("deliveryList");

  if (!list) return;

  const filteredDeliveries = deliveries.filter(delivery => {
    const status = String(
      delivery.delivery_status || ""
    ).toLowerCase();

    if (currentDeliveryFilter === "completed") {
      return status === "completed";
    }

    if (currentDeliveryFilter === "active") {
      return !["completed", "cancelled"].includes(status);
    }

    return true;
  });

  if (filteredDeliveries.length === 0) {
    list.innerHTML = buildEmptyState();
    return;
  }

  list.innerHTML = filteredDeliveries
    .map(delivery => buildDeliveryCard(delivery))
    .join("");
}

function buildEmptyState() {
  let title = "No Active Deliveries";
  let message =
    "You currently have no assigned or ongoing deliveries.";

  if (currentDeliveryFilter === "completed") {
    title = "No Completed Deliveries";
    message =
      "Completed delivery orders will appear here.";
  }

  if (currentDeliveryFilter === "all") {
    title = "No Deliveries Yet";
    message =
      "Assigned delivery orders will appear here.";
  }

  return `
    <div class="delivery-empty-state">
      <i class="fa-solid fa-motorcycle"></i>
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

function buildDeliveryCard(delivery) {
  const assignmentId = Number(delivery.assignment_id);
  const customerName =
    delivery.customer_name || "Unknown Customer";

  const contactNumber =
    delivery.contact_number || "No contact number";

  const fullAddress = buildFullAddress(delivery);

  const amountToCollect = getAmountToCollect(delivery);

  const statusClass = escapeHTML(
    delivery.delivery_status || "assigned"
  );

  const statusLabel = getDeliveryStatusLabel(
    delivery.delivery_status
  );

  return `
    <article class="delivery-card">

      <div class="delivery-card-header">

        <div>
          <h3>
            Queue #${escapeHTML(
              delivery.queue_number || "N/A"
            )}
          </h3>

          <p>
            Order #${escapeHTML(delivery.order_id)}
            • ${escapeHTML(customerName)}
          </p>
        </div>

        <span class="delivery-status-badge ${statusClass}">
          ${escapeHTML(statusLabel)}
        </span>

      </div>

      <div class="delivery-info-grid">

        <div class="delivery-info-item">
          <span>Customer</span>
          <strong>${escapeHTML(customerName)}</strong>
        </div>

        <div class="delivery-info-item">
          <span>Contact Number</span>
          <strong>${escapeHTML(contactNumber)}</strong>
        </div>

        <div class="delivery-info-item">
          <span>Delivery Address</span>
          <strong>${escapeHTML(fullAddress)}</strong>
        </div>

        <div class="delivery-info-item">
          <span>Amount to Collect</span>
          <strong>₱${formatMoney(amountToCollect)}</strong>
        </div>

      </div>

      <div class="delivery-card-actions">

        ${buildCallButton(delivery)}

        ${buildMapButton(delivery)}

        <button
          type="button"
          class="card-action-btn primary"
          onclick="openDeliveryModal(${assignmentId})"
        >
          <i class="fa-solid fa-eye"></i>
          View Details
        </button>

      </div>

    </article>
  `;
}

/*
|--------------------------------------------------------------------------
| Phone and map links
|--------------------------------------------------------------------------
*/

function buildCallButton(delivery) {
  const phoneNumber = sanitizePhoneNumber(
    delivery.contact_number
  );

  if (!phoneNumber) {
    return `
      <button
        type="button"
        class="card-action-btn call"
        disabled
      >
        <i class="fa-solid fa-phone"></i>
        No Contact
      </button>
    `;
  }

  return `
    <a
      class="card-action-btn call"
      href="tel:${escapeHTML(phoneNumber)}"
    >
      <i class="fa-solid fa-phone"></i>
      Call Customer
    </a>
  `;
}

function buildMapButton(delivery) {
  const address = buildFullAddress(delivery);

  if (!address || address === "Address unavailable") {
    return `
      <button
        type="button"
        class="card-action-btn map"
        disabled
      >
        <i class="fa-solid fa-location-dot"></i>
        No Address
      </button>
    `;
  }

  const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(address);

  return `
    <a
      class="card-action-btn map"
      href="${escapeHTML(mapUrl)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fa-solid fa-map-location-dot"></i>
      Open Maps
    </a>
  `;
}

/*
|--------------------------------------------------------------------------
| Delivery details modal
|--------------------------------------------------------------------------
*/

function openDeliveryModal(assignmentId) {
  selectedDelivery = deliveries.find(delivery => {
    return Number(delivery.assignment_id) ===
      Number(assignmentId);
  });

  if (!selectedDelivery) {
    showToast(
      "Delivery Not Found",
      "This delivery assignment is no longer available."
    );

    return;
  }

  const subtitle = document.getElementById(
    "deliveryModalSubtitle"
  );

  const body = document.getElementById(
    "deliveryModalBody"
  );

  if (subtitle) {
    subtitle.textContent =
      `Queue #${selectedDelivery.queue_number || "N/A"} • ` +
      `Order #${selectedDelivery.order_id} • ` +
      getDeliveryStatusLabel(
        selectedDelivery.delivery_status
      );
  }

  if (body) {
    body.innerHTML = buildDeliveryDetails(
      selectedDelivery
    );
  }

  renderDeliveryActions(selectedDelivery);

  document
    .getElementById("deliveryModal")
    ?.classList.add("active");
}

function closeDeliveryModal() {
  document
    .getElementById("deliveryModal")
    ?.classList.remove("active");

  selectedDelivery = null;
}

function buildDeliveryDetails(delivery) {
  const items = Array.isArray(
    delivery.items
  )
    ? delivery.items
    : [];

  const amountToCollect =
    getAmountToCollect(delivery);

  const itemRows =
    items.length > 0
      ? items
          .map((item) => {
            const quantity = Math.max(
              0,
              Number(item.quantity || 0)
            );

            const itemPrice = Number(
              item.price || 0
            );

            const itemSubtotal =
              quantity * itemPrice;

            const variantText = String(
              item.base_text || ""
            ).trim();

            const comboChoiceText = String(
              item.combo_choice_text || ""
            ).trim();

            const addonText = String(
              item.addon_text || ""
            ).trim();

            const hasAddon =
              addonText !== "" &&
              addonText.toLowerCase() !==
                "no add-on";

            return `
              <div class="delivery-order-item">

                <div class="delivery-order-item-info">

                  <h4>
                    ${escapeHTML(
                      item.product_name ||
                      "Unnamed Item"
                    )}
                  </h4>

                  <p>
                    <strong>Quantity:</strong>
                    ${escapeHTML(quantity)}
                  </p>

                  ${
                    variantText
                      ? `
                          <p>
                            <strong>
                              Variant:
                            </strong>

                            ${escapeHTML(
                              variantText
                            )}
                          </p>
                        `
                      : ""
                  }

                  ${
                    comboChoiceText
                      ? `
                          <p>
                            <strong>
                              Selection:
                            </strong>

                            ${escapeHTML(
                              comboChoiceText
                            )}
                          </p>
                        `
                      : ""
                  }

                  ${
                    hasAddon
                      ? `
                          <p>
                            <strong>
                              Add-ons:
                            </strong>

                            ${escapeHTML(
                              addonText
                            )}
                          </p>
                        `
                      : ""
                  }

                </div>

                <div class="delivery-order-item-price">
                  ₱${formatMoney(
                    itemSubtotal
                  )}
                </div>

              </div>
            `;
          })
          .join("")
      : `
          <div class="delivery-items-empty">
            <i class="fa-solid fa-receipt"></i>

            <p>
              No order items were found.
            </p>
          </div>
        `;

  return `
    <section class="delivery-detail-section">

      <div
        class="delivery-detail-box
               delivery-detail-highlight"
      >
        <span>
          Queue Number
        </span>

        <strong>
          #${escapeHTML(
            delivery.queue_number ||
            "N/A"
          )}
        </strong>
      </div>

      <div class="delivery-detail-grid">

        <div class="delivery-detail-box">
          <span>
            Order ID
          </span>

          <strong>
            #${escapeHTML(
              delivery.order_id ||
              "N/A"
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Delivery Status
          </span>

          <strong>
            ${escapeHTML(
              getDeliveryStatusLabel(
                delivery.delivery_status
              )
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Customer Name
          </span>

          <strong>
            ${escapeHTML(
              delivery.customer_name ||
              "N/A"
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Contact Number
          </span>

          <strong>
            ${escapeHTML(
              delivery.contact_number ||
              "N/A"
            )}
          </strong>
        </div>

        <div
          class="delivery-detail-box
                 full-width"
        >
          <span>
            Delivery Address
          </span>

          <strong>
            ${escapeHTML(
              buildFullAddress(
                delivery
              )
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Payment Method
          </span>

          <strong>
            ${escapeHTML(
              delivery.payment_method ||
              "N/A"
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Amount to Collect
          </span>

          <strong class="delivery-money-value">
            ₱${formatMoney(
              amountToCollect
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Order Total
          </span>

          <strong>
            ₱${formatMoney(
              delivery.total_amount
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Delivery Fee
          </span>

          <strong>
            ₱${formatMoney(
              delivery.delivery_fee
            )}
          </strong>
        </div>

        <div
          class="delivery-detail-box
                 full-width"
        >
          <span>
            Customer Notes
          </span>

          <strong>
            ${escapeHTML(
              delivery.notes ||
              "None"
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Assigned At
          </span>

          <strong>
            ${escapeHTML(
              formatDateTime(
                delivery.assigned_at
              )
            )}
          </strong>
        </div>

        <div class="delivery-detail-box">
          <span>
            Order Created
          </span>

          <strong>
            ${escapeHTML(
              formatDateTime(
                delivery.created_at
              )
            )}
          </strong>
        </div>

      </div>

    </section>

    <section class="delivery-items-section">

      <div class="delivery-items-heading">

        <div>
          <span>
            Order Contents
          </span>

          <h3>
            Ordered Items
          </h3>
        </div>

        <strong class="delivery-item-count">
          ${items.length}
          ${
            items.length === 1
              ? "item"
              : "items"
          }
        </strong>

      </div>

      <div class="delivery-items-list">
        ${itemRows}
      </div>

    </section>
  `;
}

/*
|--------------------------------------------------------------------------
| Dynamic status buttons
|--------------------------------------------------------------------------
*/

function renderDeliveryActions(delivery) {
  const container = document.getElementById(
    "deliveryActions"
  );

  if (!container) return;

  const status = String(
    delivery.delivery_status || ""
  ).toLowerCase();

  const actions = {
    assigned: {
      label: "Accept Delivery",
      nextStatus: "accepted",
      icon: "fa-check",
      className: "accept-btn"
    },

    accepted: {
      label: "Confirm Pick Up",
      nextStatus: "picked_up",
      icon: "fa-box",
      className: "pickup-btn"
    },

    picked_up: {
      label: "Start Delivery",
      nextStatus: "out_for_delivery",
      icon: "fa-motorcycle",
      className: "out-for-delivery-btn"
    },

    out_for_delivery: {
      label: "Complete Delivery",
      nextStatus: "completed",
      icon: "fa-circle-check",
      className: "complete-btn"
    }
  };

  const action = actions[status];

  if (!action) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <button
      type="button"
      class="delivery-status-btn ${action.className}"
      onclick="confirmDeliveryStatusUpdate(
        '${action.nextStatus}'
      )"
    >
      <i class="fa-solid ${action.icon}"></i>
      ${escapeHTML(action.label)}
    </button>
  `;
}

/*
|--------------------------------------------------------------------------
| Update delivery status
|--------------------------------------------------------------------------
*/

function confirmDeliveryStatusUpdate(newStatus) {
  if (!selectedDelivery) {
    showToast(
      "No Delivery Selected",
      "Please select a delivery assignment first."
    );

    return;
  }

  const messages = {
    accepted:
      "Accept this assigned delivery order?",

    picked_up:
      "Confirm that you have picked up the order from the restaurant?",

    out_for_delivery:
      "Confirm that you are now heading to the customer?",

    completed:
      "Confirm that the order was successfully delivered to the customer?"
  };

  openConfirmModal(
    "Update Delivery Status",
    messages[newStatus] ||
      "Continue with this delivery status update?",
    () => updateDeliveryStatus(newStatus)
  );
}

async function updateDeliveryStatus(newStatus) {
  if (!selectedDelivery) {
    showToast(
      "No Delivery Selected",
      "Please select a delivery assignment first."
    );

    return;
  }

  const assignmentId =
    Number(selectedDelivery.assignment_id);

  const statusButton = document.querySelector(
    ".delivery-status-btn"
  );

  try {
    if (statusButton) {
      statusButton.disabled = true;
      statusButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Updating...
      `;
    }

    const response = await fetch(
      `${API_BASE}/update_delivery_status.php`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          delivery_status: newStatus
        })
      }
    );

    const data = await readJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Failed to update the delivery status."
      );
    }

    showToast(
      "Delivery Updated",
      `Delivery status changed to ${getDeliveryStatusLabel(
        newStatus
      )}.`
    );

    closeDeliveryModal();

    await loadDeliveries(false);

  } catch (error) {
    console.error("Update delivery status error:", error);

    showToast(
      "Update Failed",
      error.message ||
      "The delivery status could not be updated."
    );

    if (selectedDelivery) {
      renderDeliveryActions(selectedDelivery);
    }
  }
}

/*
|--------------------------------------------------------------------------
| Confirmation modal
|--------------------------------------------------------------------------
*/

function openConfirmModal(title, message, callback) {
  document.getElementById("confirmTitle").textContent =
    title;

  document.getElementById("confirmMessage").textContent =
    message;

  confirmCallback = callback;

  document
    .getElementById("confirmModal")
    ?.classList.add("active");
}

function closeConfirmModal() {
  confirmCallback = null;

  document
    .getElementById("confirmModal")
    ?.classList.remove("active");
}

/*
|--------------------------------------------------------------------------
| Toast notification
|--------------------------------------------------------------------------
*/

function showToast(title, message) {
  const container = document.getElementById(
    "toastContainer"
  );

  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";

  toast.innerHTML = `
    <h4>${escapeHTML(title)}</h4>
    <p>${escapeHTML(message)}</p>
  `;

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("hide");

    window.setTimeout(() => {
      toast.remove();
    }, 250);
  }, 4000);
}

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

function getDeliveryStatusLabel(status) {
  const labels = {
    requested: "Requested",
    assigned: "Assigned",
    accepted: "Accepted",
    picked_up: "Picked Up",
    out_for_delivery: "Out for Delivery",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  return labels[normalizedStatus] ||
    normalizedStatus ||
    "Unknown";
}

function getAmountToCollect(delivery) {
  const paymentMethod = String(
    delivery.payment_method || ""
  ).toLowerCase();

  const totalAmount =
    Number(delivery.total_amount || 0);

  const deliveryFee =
    Number(delivery.delivery_fee || 0);

  /*
   * Cash and COD deliveries require collection.
   * Online-paid orders only show the delivery fee when it
   * has not already been included in total_amount.
   *
   * For the current FoodConnect version, total_amount is
   * treated as the complete customer charge.
   */
  if (
    paymentMethod.includes("cash") ||
    paymentMethod.includes("cod")
  ) {
    return totalAmount;
  }

  return 0;
}

function buildFullAddress(delivery) {
  const address = String(
    delivery.address || ""
  ).trim();

  const landmark = String(
    delivery.landmark || ""
  ).trim();

  if (!address && !landmark) {
    return "Address unavailable";
  }

  if (address && landmark) {
    return `${address} — Landmark: ${landmark}`;
  }

  return address || `Landmark: ${landmark}`;
}

function sanitizePhoneNumber(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return "";

  return rawValue.replace(/[^\d+]/g, "");
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      "The server returned an empty response."
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", text);

    throw new Error(
      "The server returned an invalid JSON response. Check the PHP error log."
    );
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}