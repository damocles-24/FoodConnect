const API_BASE = "../../api";

let deliveries = [];
let selectedDelivery = null;
let currentDeliveryFilter = "active";
let confirmCallback = null;

/* =========================================================
   LIVE DELIVERY TRACKING
========================================================= */

let riderLocationWatchId = null;

let activeTrackingAssignmentId = null;
let activeTrackingOrderId = null;

let firebaseTrackingModule = null;
let firebaseDatabaseTools = null;

let firebaseRiderAuth = null;

let lastFirebaseLocationWrite = 0;

const RIDER_LOCATION_WRITE_INTERVAL = 3000;

/* =========================================================
   RIDER DELIVERY MAP
========================================================= */

let deliveryMap = null;
let riderMapMarker = null;
let customerMapMarker = null;

let deliveryRouteLayer = null;

let latestRiderCoordinates = null;

let lastRouteRequestAt = 0;
let lastRouteCoordinates = null;
let routeRequestInProgress = false;
let latestRouteDistanceMeters = 0;
let latestRouteDurationSeconds = 0;

const ROUTE_REFRESH_INTERVAL = 15000;
const ROUTE_REFRESH_DISTANCE_METERS = 20;

async function loadFirebaseTrackingModules() {
  if (
    firebaseTrackingModule &&
    firebaseDatabaseTools
  ) {
    return;
  }

  firebaseTrackingModule =
    await import(
      "./firebase-config.js"
    );

  firebaseDatabaseTools =
    await import(
      "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js"
    );
}

async function authorizeLiveDeliveryTracking(
  assignmentId
) {
  const response = await fetch(
    `${API_BASE}/authorize_delivery_tracking.php`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assignment_id:
          Number(assignmentId)
      })
    }
  );

  const data =
    await readJsonResponse(response);

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to authorize live delivery tracking."
    );
  }

  if (
    !data.authorized ||
    !data.tracking_allowed
  ) {
    throw new Error(
      data.message ||
      "Live tracking is not available for this delivery."
    );
  }

  return data;
}

async function ensureFirebaseRiderAuthentication() {
  await loadFirebaseTrackingModules();

  if (
    firebaseRiderAuth?.user &&
    !firebaseRiderAuth.user.isAnonymous
  ) {
    return firebaseRiderAuth;
  }

  firebaseRiderAuth =
    await firebaseTrackingModule
      .authenticateFirebaseRider();

  return firebaseRiderAuth;
}

async function writeRiderLocationToFirebase(
  delivery,
  position
) {
  await loadFirebaseTrackingModules();

  const coords =
    position.coords;

  const restaurantId =
    Number(
      firebaseRiderAuth?.rider?.restaurant_id
    );

  const riderId =
    Number(
      firebaseRiderAuth?.rider?.user_id
    );

  const assignmentId =
    Number(
      delivery.assignment_id
    );

  const orderId =
    Number(
      delivery.order_id
    );

  if (
    restaurantId <= 0 ||
    riderId <= 0 ||
    assignmentId <= 0 ||
    orderId <= 0
  ) {
    throw new Error(
      "Invalid rider tracking information."
    );
  }

  const riderUid =
    `rider_${riderId}`;

  const locationRef =
    firebaseDatabaseTools.ref(
      firebaseTrackingModule.realtimeDatabase,
      `rider_locations/${restaurantId}/${riderUid}`
    );

  const heading =
    Number.isFinite(coords.heading)
      ? coords.heading
      : 0;

  const speed =
    Number.isFinite(coords.speed)
      ? coords.speed
      : 0;

  await firebaseDatabaseTools.set(
    locationRef,
    {
      latitude:
        Number(coords.latitude),

      longitude:
        Number(coords.longitude),

      accuracy:
        Number(coords.accuracy || 0),

      heading:
        heading,

      speed:
        speed,

      updated_at:
        Date.now(),

      assignment_id:
        assignmentId,

      order_id:
        orderId
    }
  );
}

async function startLiveRiderTracking(
  delivery
) {
  const assignmentId =
    Number(delivery.assignment_id);

  const orderId =
    Number(delivery.order_id);

  if (
    assignmentId <= 0 ||
    orderId <= 0
  ) {
    throw new Error(
      "Invalid delivery assignment."
    );
  }

  /*
   * Do not create a second GPS watcher for
   * the same delivery.
   */
  if (
    riderLocationWatchId !== null &&
    activeTrackingAssignmentId ===
      assignmentId
  ) {
    return;
  }

  if (!navigator.geolocation) {
    throw new Error(
      "This device does not support GPS location."
    );
  }

  /*
   * Server-side authorization FIRST.
   */
  await authorizeLiveDeliveryTracking(
    assignmentId
  );

  /*
   * Firebase authentication SECOND.
   */
  await ensureFirebaseRiderAuthentication();

  /*
   * Stop an old watcher before starting
   * another assignment.
   */
  stopLiveRiderTracking(false);

  activeTrackingAssignmentId =
    assignmentId;

  activeTrackingOrderId =
    orderId;

  lastFirebaseLocationWrite = 0;

  riderLocationWatchId =
    navigator.geolocation.watchPosition(
      async position => {
latestRiderCoordinates = {
  latitude:
    Number(position.coords.latitude),

  longitude:
    Number(position.coords.longitude),

  accuracy:
    Number(position.coords.accuracy || 0),

  heading:
    Number.isFinite(position.coords.heading)
      ? position.coords.heading
      : 0
};

updateRiderMapPosition(
  latestRiderCoordinates
);

        const now =
          Date.now();

        /*
         * Browser GPS can fire very frequently.
         * Limit Firebase writes to roughly once
         * every 3 seconds.
         */
        if (
          now -
            lastFirebaseLocationWrite <
          RIDER_LOCATION_WRITE_INTERVAL
        ) {
          return;
        }

        lastFirebaseLocationWrite =
          now;

        try {
          await writeRiderLocationToFirebase(
            delivery,
            position
          );

          console.log(
            "Live rider GPS updated:",
            position.coords.latitude,
            position.coords.longitude
          );
        } catch (error) {
          console.error(
            "Firebase rider location write error:",
            error
          );
        }
      },

      error => {
        console.error(
          "Rider GPS error:",
          error
        );

        let message =
          "Unable to access your current location.";

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access to continue delivery tracking.";
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          message =
            "Your GPS location is currently unavailable.";
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          message =
            "GPS location detection timed out. Please try again.";
        }

        showToast(
          "Live Tracking",
          message
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      }
    );

  showToast(
    "Live Tracking Started",
    "Your location is now being shared for this delivery."
  );
}

async function stopLiveRiderTracking(
  removeFirebaseLocation = true
) {
  if (
    riderLocationWatchId !== null
  ) {
    navigator.geolocation.clearWatch(
      riderLocationWatchId
    );

    riderLocationWatchId =
      null;
  }

  if (
    removeFirebaseLocation &&
    firebaseRiderAuth?.rider
  ) {
    try {
      await loadFirebaseTrackingModules();

      const restaurantId =
        Number(
          firebaseRiderAuth.rider
            .restaurant_id
        );

      const riderId =
        Number(
          firebaseRiderAuth.rider
            .user_id
        );

      if (
        restaurantId > 0 &&
        riderId > 0
      ) {
        const locationRef =
          firebaseDatabaseTools.ref(
            firebaseTrackingModule
              .realtimeDatabase,
            `rider_locations/${restaurantId}/rider_${riderId}`
          );

        await firebaseDatabaseTools.remove(
          locationRef
        );
      }
    } catch (error) {
      console.error(
        "Unable to clear Firebase rider location:",
        error
      );
    }
  }

  activeTrackingAssignmentId =
    null;

  activeTrackingOrderId =
    null;

  lastFirebaseLocationWrite =
    0;
}



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

      const activeOutForDelivery =
  deliveries.find(delivery => {
    return String(
      delivery.delivery_status || ""
    )
      .toLowerCase()
      .trim() ===
      "out_for_delivery";
  });

if (
  activeOutForDelivery &&
  riderLocationWatchId === null
) {
  startLiveRiderTracking(
    activeOutForDelivery
  ).catch(error => {
    console.error(
      "Unable to resume live delivery tracking:",
      error
    );
  });
}

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
  return [
    "assigned",
    "accepted"
  ].includes(
    String(
      delivery.delivery_status || ""
    ).toLowerCase()
  );
}).length;

  const ongoingCount = deliveries.filter(delivery => {
  return [
    "picked_up",
    "out_for_delivery"
  ].includes(
    String(
      delivery.delivery_status || ""
    ).toLowerCase()
  );
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
    window.FoodConnectPhone.format(delivery.contact_number, "No contact number");

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

/*
 * Initialize Leaflet only AFTER the modal
 * becomes visible.
 */
window.setTimeout(() => {
  if (selectedDelivery) {
    initializeDeliveryMap(
      selectedDelivery
    );
  }
}, 150);
}

function closeDeliveryModal() {
  document
    .getElementById("deliveryModal")
    ?.classList.remove("active");

  destroyDeliveryMap();

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

    const customerLatitude =
  Number(delivery.customer_latitude);

const customerLongitude =
  Number(delivery.customer_longitude);

const hasDeliveryCoordinates =
  Number.isFinite(customerLatitude) &&
  Number.isFinite(customerLongitude) &&
  customerLatitude >= -90 &&
  customerLatitude <= 90 &&
  customerLongitude >= -180 &&
  customerLongitude <= 180;

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
              item.variant_text || ""
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

    <div class="delivery-order-main">

        <div class="delivery-order-left">

            <h4>

                ${escapeHTML(
                    item.product_name ||
                    "Unnamed Item"
                )}

            </h4>

            <div class="delivery-order-meta">

                <span>

                    Qty:
                    ${quantity}

                </span>

                ${
                    variantText
                    ? `
                        <span>

                            Variant:
                            ${escapeHTML(
                                variantText
                            )}

                        </span>
                    `
                    : ""
                }

                ${
                    comboChoiceText
                    ? `
                        <span>

                            Selection:
                            ${escapeHTML(
                                comboChoiceText
                            )}

                        </span>
                    `
                    : ""
                }

                ${
                    hasAddon
                    ? `
                        <span>

                            Add-ons:
                            ${escapeHTML(
                                addonText
                            )}

                        </span>
                    `
                    : ""
                }

            </div>

        </div>

        <div class="delivery-order-right">

            ₱${formatMoney(
                itemSubtotal
            )}

        </div>

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
    Order Subtotal
  </span>

  <strong>
    ₱${formatMoney(
      delivery.subtotal
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
    Customer Total
  </span>

  <strong class="delivery-money-value">
    ₱${formatMoney(
      delivery.total_amount
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

    ${
      hasDeliveryCoordinates
        ? `
          <section class="delivery-map-section">

            <div class="delivery-map-header">

              <div>
                <span class="delivery-section-label">
                  DELIVERY MAP
                </span>

                <h3>
                  Customer Destination
                </h3>

                <p>
                  Your live position and the customer's pinned delivery location.
                </p>
              </div>

              <div class="live-tracking-badge">
                <span></span>
                Live GPS
              </div>

            </div>

           <div
  id="riderDeliveryMap"
  class="rider-delivery-map"
></div>

<div
  class="delivery-route-summary"
  id="deliveryRouteSummary"
>
  <div class="route-summary-item">
    <i class="fa-solid fa-route"></i>

    <div>
      <span>Distance</span>
      <strong id="deliveryRouteDistance">
        Calculating...
      </strong>
    </div>
  </div>

  <div class="route-summary-item">
    <i class="fa-solid fa-clock"></i>

    <div>
      <span>Estimated Time</span>
      <strong id="deliveryRouteEta">
        Calculating...
      </strong>
    </div>
  </div>
</div>

<div class="delivery-map-legend">

              <div>
                <i class="fa-solid fa-motorcycle"></i>
                Your Location
              </div>

              <div>
                <i class="fa-solid fa-location-dot"></i>
                Customer
              </div>

            </div>

          </section>
        `
        : `
          <section class="delivery-map-unavailable">
            <i class="fa-solid fa-map-location-dot"></i>

            <div>
              <strong>
                Map location unavailable
              </strong>

              <p>
                This delivery does not have saved destination coordinates.
              </p>
            </div>
          </section>
        `
    }

    <section class="delivery-items-section">

  <div class="delivery-items-header">

    <div>

      <span class="delivery-section-label">
        ORDER DETAILS
      </span>

      <h3>
        Ordered Items
      </h3>

    </div>

    <div class="delivery-item-total">

      ${
        items.length
      }

      ${
        items.length === 1
          ? "Item"
          : "Items"
      }

    </div>

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

/* =========================================================
   RIDER DELIVERY MAP
========================================================= */

function destroyDeliveryMap() {
  if (deliveryMap) {
    deliveryMap.remove();
    deliveryMap = null;
  }

  riderMapMarker = null;
  customerMapMarker = null;
  deliveryRouteLayer = null;

  lastRouteRequestAt = 0;
  lastRouteCoordinates = null;
  routeRequestInProgress = false;
  latestRouteDistanceMeters = 0;
latestRouteDurationSeconds = 0;
}

function createRiderMapIcon() {
  return L.divIcon({
    className: "foodconnect-map-icon",
    html: `
      <div class="rider-map-marker">
        <i class="fa-solid fa-motorcycle"></i>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function createCustomerMapIcon() {
  return L.divIcon({
    className: "foodconnect-map-icon",
    html: `
      <div class="customer-map-marker">
        <i class="fa-solid fa-location-dot"></i>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 40]
  });
}

function formatRouteDistance(
  distanceMeters
) {
  const distance =
    Number(distanceMeters || 0);

  if (
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return "Unavailable";
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(
    distance / 1000
  ).toFixed(1)} km`;
}

function formatRouteDuration(
  durationSeconds
) {
  const seconds =
    Number(durationSeconds || 0);

  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "Unavailable";
  }

  const minutes =
    Math.max(
      1,
      Math.round(
        seconds / 60
      )
    );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function updateDeliveryRouteSummary(
  distanceMeters,
  durationSeconds
) {
  latestRouteDistanceMeters =
    Number(distanceMeters || 0);

  latestRouteDurationSeconds =
    Number(durationSeconds || 0);

  const distanceElement =
    document.getElementById(
      "deliveryRouteDistance"
    );

  const etaElement =
    document.getElementById(
      "deliveryRouteEta"
    );

  if (distanceElement) {
    distanceElement.textContent =
      formatRouteDistance(
        latestRouteDistanceMeters
      );
  }

  if (etaElement) {
    etaElement.textContent =
      formatRouteDuration(
        latestRouteDurationSeconds
      );
  }
}

function getCoordinateDistanceMeters(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadius = 6371000;

  const toRadians = value =>
    value * Math.PI / 180;

  const lat1 =
    toRadians(latitude1);

  const lat2 =
    toRadians(latitude2);

  const latitudeDifference =
    toRadians(
      latitude2 - latitude1
    );

  const longitudeDifference =
    toRadians(
      longitude2 - longitude1
    );

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(
      longitudeDifference / 2
    ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

async function loadDeliveryRoute(
  delivery,
  riderCoordinates
) {
  if (
    !deliveryMap ||
    !delivery ||
    !riderCoordinates ||
    routeRequestInProgress
  ) {
    return;
  }

  const assignmentId =
    Number(delivery.assignment_id);

  const riderLatitude =
    Number(riderCoordinates.latitude);

  const riderLongitude =
    Number(riderCoordinates.longitude);

  if (
    assignmentId <= 0 ||
    !Number.isFinite(riderLatitude) ||
    !Number.isFinite(riderLongitude)
  ) {
    return;
  }

  routeRequestInProgress = true;

  try {
    const response = await fetch(
      `${API_BASE}/get_delivery_route.php`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          assignment_id:
            assignmentId,

          rider_latitude:
            riderLatitude,

          rider_longitude:
            riderLongitude
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
      throw new Error(
        data.message ||
        "Unable to calculate the delivery route."
      );
    }

    const geometry =
      data.route?.geometry;

    if (!geometry) {
      throw new Error(
        "The route does not contain map geometry."
      );
    }

    /*
     * Remove the previous road route
     * before displaying the refreshed one.
     */
    if (deliveryRouteLayer) {
      deliveryMap.removeLayer(
        deliveryRouteLayer
      );

      deliveryRouteLayer = null;
    }

    deliveryRouteLayer =
      L.geoJSON(
        geometry,
        {
          style: {
            color: "#2563eb",
            weight: 6,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
          }
        }
      )
        .addTo(deliveryMap);

  lastRouteRequestAt =
  Date.now();

    lastRouteCoordinates = {
      latitude:
        riderLatitude,

      longitude:
        riderLongitude
    };

    updateDeliveryRouteSummary(
  data.route?.distance_meters,
  data.route?.duration_seconds
);

    console.log(
      "Delivery road route updated:",
      {
        distance_meters:
          data.route?.distance_meters,

        duration_seconds:
          data.route?.duration_seconds
      }
    );
  } catch (error) {
    console.error(
      "Delivery route error:",
      error
    );
  } finally {
    routeRequestInProgress =
      false;
  }
}

function maybeRefreshDeliveryRoute(
  delivery,
  coordinates
) {
  if (
    !deliveryMap ||
    !delivery ||
    !coordinates
  ) {
    return;
  }

  const status =
    String(
      delivery.delivery_status || ""
    )
      .toLowerCase()
      .trim();

  if (
    status !==
    "out_for_delivery"
  ) {
    return;
  }

  const latitude =
    Number(coordinates.latitude);

  const longitude =
    Number(coordinates.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  /*
   * First route:
   * calculate immediately.
   */
  if (!lastRouteCoordinates) {
    loadDeliveryRoute(
      delivery,
      coordinates
    );

    return;
  }

  const timeSinceLastRoute =
    Date.now() -
    lastRouteRequestAt;

  if (
    timeSinceLastRoute <
    ROUTE_REFRESH_INTERVAL
  ) {
    return;
  }

  const distanceMoved =
    getCoordinateDistanceMeters(
      lastRouteCoordinates.latitude,
      lastRouteCoordinates.longitude,
      latitude,
      longitude
    );

  /*
   * Rider must have moved approximately
   * 20 meters before asking Geoapify
   * for another road route.
   */
  if (
    distanceMoved <
    ROUTE_REFRESH_DISTANCE_METERS
  ) {
    return;
  }

  loadDeliveryRoute(
    delivery,
    coordinates
  );
}

function initializeDeliveryMap(delivery) {
  const mapElement =
    document.getElementById(
      "riderDeliveryMap"
    );

  if (!mapElement) {
    return;
  }

  if (typeof L === "undefined") {
    console.error(
      "Leaflet is not available."
    );

    return;
  }

  const customerLatitude =
    Number(delivery.customer_latitude);

  const customerLongitude =
    Number(delivery.customer_longitude);

  if (
    !Number.isFinite(customerLatitude) ||
    !Number.isFinite(customerLongitude)
  ) {
    return;
  }

  destroyDeliveryMap();

  deliveryMap =
    L.map(
      mapElement,
      {
        zoomControl: true
      }
    );

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(deliveryMap);

  customerMapMarker =
    L.marker(
      [
        customerLatitude,
        customerLongitude
      ],
      {
        icon:
          createCustomerMapIcon()
      }
    )
      .addTo(deliveryMap)
      .bindPopup(
        `
          <strong>Customer Destination</strong>
          <br>
          ${escapeHTML(
            buildFullAddress(delivery)
          )}
        `
      );

  /*
   * If we already have rider GPS,
   * display both points.
   */
  if (
    latestRiderCoordinates &&
    Number.isFinite(
      latestRiderCoordinates.latitude
    ) &&
    Number.isFinite(
      latestRiderCoordinates.longitude
    )
  ) {
    riderMapMarker =
      L.marker(
        [
          latestRiderCoordinates.latitude,
          latestRiderCoordinates.longitude
        ],
        {
          icon:
            createRiderMapIcon()
        }
      )
        .addTo(deliveryMap)
        .bindPopup(
          "<strong>Your Current Location</strong>"
        );

    const bounds =
      L.latLngBounds([
        [
          customerLatitude,
          customerLongitude
        ],
        [
          latestRiderCoordinates.latitude,
          latestRiderCoordinates.longitude
        ]
      ]);

    deliveryMap.fitBounds(
      bounds,
      {
        padding: [50, 50],
        maxZoom: 17
      }
      
    );

    maybeRefreshDeliveryRoute(
  delivery,
  latestRiderCoordinates
);
  } else {
    deliveryMap.setView(
      [
        customerLatitude,
        customerLongitude
      ],
      16
    );
  }

  /*
   * Leaflet needs this because the
   * map is inside a modal.
   */
  window.setTimeout(() => {
    deliveryMap?.invalidateSize();
  }, 150);
}

function updateRiderMapPosition(
  coordinates
) {
  if (
    !deliveryMap ||
    !coordinates
  ) {
    return;
  }

  const latitude =
    Number(coordinates.latitude);

  const longitude =
    Number(coordinates.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return;
  }

  if (!riderMapMarker) {
  riderMapMarker =
  L.marker(
    [
      latitude,
      longitude
    ],
    {
      icon:
        createRiderMapIcon()
    }
  )
    .addTo(deliveryMap)
    .bindPopup(
      "<strong>Your Current Location</strong>"
    );

if (selectedDelivery) {
  maybeRefreshDeliveryRoute(
    selectedDelivery,
    coordinates
  );
}

return;
  }

  /*
   * Move existing marker instead of
   * creating new markers repeatedly.
   */
  riderMapMarker.setLatLng([
  latitude,
  longitude
]);

if (selectedDelivery) {
  maybeRefreshDeliveryRoute(
    selectedDelivery,
    coordinates
  );
}
}

function renderDeliveryActions(delivery) {
  const container = document.getElementById(
    "deliveryActions"
  );

  if (!container) {
    return;
  }

  const status = String(
    delivery.delivery_status || ""
  )
    .toLowerCase()
    .trim();

  /*
   * Internal restaurant riders are automatically
   * accepted when assigned by the cashier.
   *
   * Therefore, the rider's first action is
   * confirming that the order was picked up.
   */
  const actions = {
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

const deliverySnapshot = {
  ...selectedDelivery
};

/*
 * Delivery completion proximity check.
 *
 * The rider must be physically near the customer's
 * pinned delivery location before completing the order.
 *
 * Full anti-spoofing can be added later when the
 * system is deployed and tested on real rider devices.
 */
if (newStatus === "completed") {
  const riderLatitude =
    Number(latestRiderCoordinates?.latitude);

  const riderLongitude =
    Number(latestRiderCoordinates?.longitude);

  const customerLatitude =
    Number(selectedDelivery.customer_latitude);

  const customerLongitude =
    Number(selectedDelivery.customer_longitude);

  if (
    !Number.isFinite(riderLatitude) ||
    !Number.isFinite(riderLongitude)
  ) {
    showToast(
      "GPS Location Required",
      "Your current location could not be verified. Please enable location access and try again."
    );

    return;
  }

  if (
    !Number.isFinite(customerLatitude) ||
    !Number.isFinite(customerLongitude)
  ) {
    showToast(
      "Customer Location Unavailable",
      "The customer's delivery location could not be verified."
    );

    return;
  }

  const distanceFromCustomer =
    getCoordinateDistanceMeters(
      riderLatitude,
      riderLongitude,
      customerLatitude,
      customerLongitude
    );

  const COMPLETION_RADIUS_METERS = 100;

  if (
    distanceFromCustomer >
    COMPLETION_RADIUS_METERS
  ) {
    showToast(
      "Too Far From Customer",
      `You are approximately ${Math.round(
        distanceFromCustomer
      )} meters away. Move within ${COMPLETION_RADIUS_METERS} meters of the customer before completing the delivery.`
    );

    return;
  }
}

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
  delivery_status: newStatus,

  rider_latitude:
    newStatus === "completed"
      ? Number(latestRiderCoordinates?.latitude)
      : null,

  rider_longitude:
    newStatus === "completed"
      ? Number(latestRiderCoordinates?.longitude)
      : null
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

/*
 * Start Firebase GPS only AFTER PHP
 * successfully changes the delivery to
 * Out for Delivery.
 */
if (
  newStatus ===
  "out_for_delivery"
) {
  deliverySnapshot.delivery_status =
    "out_for_delivery";

  try {
    await startLiveRiderTracking(
      deliverySnapshot
    );
  } catch (trackingError) {
    console.error(
      "Unable to start live tracking:",
      trackingError
    );

    showToast(
      "Tracking Not Started",
      trackingError.message ||
        "The delivery is Out for Delivery, but GPS tracking could not start."
    );
  }
}

/*
 * Remove live GPS when delivery is completed.
 */
if (
  newStatus ===
  "completed"
) {
  await stopLiveRiderTracking(
    true
  );
}

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
  return window.FoodConnectPhone.tel(value);
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