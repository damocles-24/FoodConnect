const API_BASE = "../../api";

let orders = [];
let selectedOrder = null;
let currentStatusFilter = "all";
let soundEnabled = true;

let knownOrderIds = new Set();
let knownOrderStatuses = new Map();

let knownCashierNotificationIds =
  new Set();

let cashierNotificationsFirstLoadDone =
  false;

let cashierNotifications = [];
let currentNotificationFilter = "all";

let firstLoadDone = false;
let confirmCallback = null;
let restoreAssignModalAfterConfirm = false;
let pendingCancellationReason = "";

/* =========================================
   AUTOMATIC RECEIPT PRINT QUEUE
========================================= */

let automaticReceiptPrintBusy = false;
let automaticReceiptPrintTimer = null;
let automaticReceiptPrintErrorShown = false;

/* =========================================
   QR SCANNER STATE
========================================= */

let orderQrScanner = null;
let orderQrScannerRunning = false;
let orderQrScanProcessing = false;
let qrScannerRestartTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     INITIAL DATA LOADING
  ========================================= */

  loadCashierProfile();
  loadOrders();
  loadCashierNotifications();

  /*
   * Automatic first-print worker.
   * Delivery orders become eligible immediately.
   * Dine-in / Takeout become eligible after QR verification.
   */
  setTimeout(() => {
    processAutomaticReceiptPrintQueue();
  }, 1200);

  automaticReceiptPrintTimer = setInterval(() => {
    processAutomaticReceiptPrintQueue();
  }, 2000);

  setInterval(() => {
    loadOrders();
    loadCashierNotifications();
  }, 5000);

  /* =========================================
     ORDER FILTERS AND REFRESH
  ========================================= */

  document
    .querySelectorAll(".notification-filter-btn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        currentNotificationFilter =
          button.dataset.notificationFilter || "all";

        document
          .querySelectorAll(".notification-filter-btn")
          .forEach((item) => item.classList.remove("active"));

        button.classList.add("active");
        renderCashierNotifications();
      });
    });

  const markAllNotificationsReadBtn =
    document.getElementById("markAllNotificationsReadBtn");

  if (markAllNotificationsReadBtn) {
    markAllNotificationsReadBtn.addEventListener(
      "click",
      markAllCashierNotificationsRead
    );
  }

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
   QR SCANNER MODAL
========================================= */

function openQrScannerModal() {
  const modal =
    document.getElementById(
      "qrScannerModal"
    );

  const message =
    document.getElementById(
      "qrScannerMessage"
    );

  const startButton =
    document.getElementById(
      "startQrScannerBtn"
    );

  if (!modal) {
    console.error(
      "QR scanner modal was not found."
    );

    return;
  }

  if (message) {
    message.textContent =
      "Press Start Camera to begin scanning.";

    message.classList.remove(
      "success",
      "error"
    );
  }

  if (startButton) {
    startButton.disabled = false;

    startButton.innerHTML = `
      <i class="fa-solid fa-camera"></i>
      Start Camera
    `;
  }

  orderQrScanProcessing = false;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

async function closeQrScannerModal() {
  if (qrScannerRestartTimer) {
    clearTimeout(qrScannerRestartTimer);
    qrScannerRestartTimer = null;
}
  await stopOrderQrScanner();

  const modal =
    document.getElementById(
      "qrScannerModal"
    );

  modal?.classList.remove("active");

  document.body.style.overflow = "";

  orderQrScanProcessing = false;
}

/* =========================================
   QR CAMERA CONTROL
========================================= */

async function startOrderQrScanner() {
  const readerId = "qrScannerReader";

  const reader =
    document.getElementById(readerId);

  const message =
    document.getElementById(
      "qrScannerMessage"
    );

  const startButton =
    document.getElementById(
      "startQrScannerBtn"
    );

  if (!reader) {
    console.error(
      "QR scanner reader was not found."
    );

    return;
  }

  if (
    typeof Html5Qrcode !==
    "function"
  ) {
    setQrScannerMessage(
      "The QR scanner library could not be loaded.",
      "error"
    );

    return;
  }

  if (orderQrScannerRunning) {
    return;
  }

  if (startButton) {
    startButton.disabled = true;

    startButton.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Starting Camera...
    `;
  }

  if (message) {
    message.textContent =
      "Requesting camera access...";

    message.classList.remove(
      "success",
      "error"
    );
  }

  try {
    if (!orderQrScanner) {
      orderQrScanner =
        new Html5Qrcode(readerId);
    }

    orderQrScanProcessing = false;

    await orderQrScanner.start(
      {
        facingMode: "environment"
      },
      {
        fps: 10,

        qrbox: (viewfinderWidth,
                viewfinderHeight) => {
          const minimumSide =
            Math.min(
              viewfinderWidth,
              viewfinderHeight
            );

          const boxSize =
            Math.floor(
              minimumSide * 0.72
            );

          return {
            width: boxSize,
            height: boxSize
          };
        },

        aspectRatio: 1
      },
      handleOrderQrDecoded,
      () => {
        /*
         * Normal scan misses are ignored.
         * The library repeatedly checks
         * camera frames until a QR is found.
         */
      }
    );

    orderQrScannerRunning = true;

    setQrScannerMessage(
      "Camera is active. Point it at the customer's FoodConnect QR.",
      ""
    );

    if (startButton) {
      startButton.innerHTML = `
        <i class="fa-solid fa-camera"></i>
        Camera Active
      `;
    }
  } catch (error) {
    console.error(
      "Unable to start QR scanner:",
      error
    );

    orderQrScannerRunning = false;

    if (startButton) {
      startButton.disabled = false;

      startButton.innerHTML = `
        <i class="fa-solid fa-camera"></i>
        Try Again
      `;
    }

    let errorMessage =
      "The camera could not be started.";

    if (
      window.isSecureContext === false
    ) {
      errorMessage =
        "Camera access requires HTTPS or localhost.";
    } else if (
      error?.name ===
      "NotAllowedError"
    ) {
      errorMessage =
        "Camera permission was denied. Allow camera access in the browser and try again.";
    } else if (
      error?.name ===
      "NotFoundError"
    ) {
      errorMessage =
        "No available camera was found on this device.";
    } else if (
      error?.name ===
      "NotReadableError"
    ) {
      errorMessage =
        "The camera is being used by another application.";
    }

    setQrScannerMessage(
      errorMessage,
      "error"
    );
  }
}

async function stopOrderQrScanner() {
    if (qrScannerRestartTimer) {
    clearTimeout(
      qrScannerRestartTimer
    );

    qrScannerRestartTimer = null;
  }

  const startButton =
    document.getElementById(
      "startQrScannerBtn"
    );

  if (!orderQrScanner) {
    orderQrScannerRunning = false;
    return;
  }

  try {
    if (orderQrScannerRunning) {
      await orderQrScanner.stop();
    }
  } catch (error) {
    console.warn(
      "QR scanner stop warning:",
      error
    );
  }

  try {
    orderQrScanner.clear();
  } catch (error) {
    console.warn(
      "QR scanner clear warning:",
      error
    );
  }

  orderQrScanner = null;
  orderQrScannerRunning = false;

  if (startButton) {
    startButton.disabled = false;

    startButton.innerHTML = `
      <i class="fa-solid fa-camera"></i>
      Start Camera
    `;
  }
}

function restartOrderQrScanner(
  delay = 2000
) {
  const modal =
    document.getElementById(
      "qrScannerModal"
    );

  /*
   * Do not schedule a restart when the
   * scanner modal has already been closed.
   */
  if (
    !modal ||
    !modal.classList.contains("active")
  ) {
    return;
  }

  /*
   * Prevent multiple restart timers from
   * being scheduled at the same time.
   */
  if (qrScannerRestartTimer) {
    clearTimeout(
      qrScannerRestartTimer
    );
  }

  qrScannerRestartTimer =
    setTimeout(async () => {
      qrScannerRestartTimer = null;

      /*
       * Recheck the modal after the delay.
       * The cashier may have closed it while
       * the error message was displayed.
       */
      const currentModal =
        document.getElementById(
          "qrScannerModal"
        );

      if (
        !currentModal ||
        !currentModal.classList.contains(
          "active"
        )
      ) {
        return;
      }

      try {
        await startOrderQrScanner();
      } catch (error) {
        console.error(
          "Unable to restart QR scanner:",
          error
        );
      }
    }, delay);
}

async function handleOrderQrDecoded(
  decodedText
) {
  if (orderQrScanProcessing) {
    return;
  }

  orderQrScanProcessing = true;

  const scannedValue =
    String(decodedText || "").trim();

  await stopOrderQrScanner();

if (scannedValue === "") {
  setQrScannerMessage(
    "The scanned QR code is empty.",
    "error"
  );

  orderQrScanProcessing = false;

  restartOrderQrScanner();

  return;
}

 setQrScannerMessage(
  "Verifying order...",
  "loading"
);

const verificationStartedAt =
  Date.now();

  try {
    const response = await fetch(
      `${API_BASE}/scan_order_qr.php`,
      {
        method: "POST",

        credentials: "include",

        cache: "no-store",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          qr_value: scannedValue
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
        "Invalid QR verification response:",
        responseText
      );

      throw new Error(
        "Something went wrong. Please try again."
      );
    }

   const verificationElapsed =
  Date.now() - verificationStartedAt;

const minimumLoadingTime = 1000;

if (
  verificationElapsed <
  minimumLoadingTime
) {
  await new Promise(resolve => {
    setTimeout(
      resolve,
      minimumLoadingTime -
        verificationElapsed
    );
  });
}

if (
  !response.ok ||
  !data.success
) {
  throw new Error(
    data.message ||
    "The order QR could not be verified."
  );
}

    const orderId = Number(
      data.order?.order_id || 0
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      throw new Error(
        "The verified QR did not return a valid order."
      );
    }

    const waitingForPayment =
      data.waiting_for_payment === true ||
      data.order?.waiting_for_payment === true;

    if (waitingForPayment) {
      setQrScannerMessage(
        "Order QR verified. Waiting for the customer to complete payment.",
        "success"
      );

      playNotificationSound();

      showToast(
        "QR Verified",
        "Waiting for customer payment. The order will appear automatically after payment is confirmed."
      );

      await loadOrders();

      await new Promise(resolve => {
        setTimeout(resolve, 1800);
      });

      await closeQrScannerModal();

      orderQrScanProcessing = false;

      return;
    }

    /*
     * Refresh the global orders array so that
     * openOrderModal() can find the scanned order.
     */
    await loadOrders();

    const scannedOrderExists =
      orders.some(order => {
        return (
          Number(order.order_id) ===
          orderId
        );
      });

    if (!scannedOrderExists) {
      throw new Error(
        "The order was verified, but it is not currently available in the cashier order list."
      );
    }

 setQrScannerMessage(
  `Order verified successfully.`,
  "success"
);

/*
 * Play confirmation sound only after
 * the order QR has been fully verified.
 */
playNotificationSound();

await new Promise(resolve => {
  setTimeout(resolve, 1500);
});

    /*
     * Close the scanner before opening the
     * normal cashier order details modal.
     */
    await closeQrScannerModal();

    openOrderModal(orderId);

    /*
     * Do not wait for the next 2-second queue poll after a successful
     * Dine-in / Takeout QR verification.
     */
    processAutomaticReceiptPrintQueue();

    showToast(
      "Order QR Verified",
      `Order opened successfully.`
    );

  } catch (error) {
    console.error(
      "Order QR verification error:",
      error
    );

    setQrScannerMessage(
      error.message ||
      "Unable to verify this QR code. Please try again.",
      "error"
    );

    restartOrderQrScanner();

    /*
     * Allow the cashier to press Start Camera
     * and scan again after an invalid QR.
     */
    orderQrScanProcessing = false;
  }
}

function setQrScannerMessage(
  text,
  type = ""
) {
  const message =
    document.getElementById(
      "qrScannerMessage"
    );

  if (!message) {
    return;
  }

  message.classList.remove(
    "success",
    "error",
    "loading"
  );

  if (type === "loading") {
    message.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>${escapeHTML(text)}</span>
    `;

    message.classList.add("loading");

    return;
  }

  if (type === "success") {
  message.innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    <span>${escapeHTML(text)}</span>
  `;

  message.classList.add("success");

  return;
}

if (type === "error") {
  message.innerHTML = `
    <i class="fa-solid fa-circle-xmark"></i>
    <span>${escapeHTML(text)}</span>
  `;

  message.classList.add("error");

  return;
}

message.textContent = text;
}

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
     QR SCANNER MODAL
  ========================================= */

  document
    .getElementById("scanOrderQrBtn")
    ?.addEventListener(
      "click",
      openQrScannerModal
    );

  document
    .getElementById("closeQrScannerBtn")
    ?.addEventListener(
      "click",
      closeQrScannerModal
    );

  document
    .getElementById("cancelQrScannerBtn")
    ?.addEventListener(
      "click",
      closeQrScannerModal
    );

      document
    .getElementById("startQrScannerBtn")
    ?.addEventListener(
      "click",
      startOrderQrScanner
    );

  document
    .getElementById("qrScannerModal")
    ?.addEventListener("click", (event) => {
      if (
        event.target.id ===
        "qrScannerModal"
      ) {
        closeQrScannerModal();
      }
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
        "Log out of the cashier dashboard?",
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

      const qrScannerModal =
        document.getElementById(
          "qrScannerModal"
        );

      if (
        qrScannerModal
          ?.classList.contains(
            "active"
          )
      ) {
        closeQrScannerModal();
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

    const response = await fetch(
  `${API_BASE}/get_cashier_orders.php`,
  {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  }
);

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Unable to load orders right now. Please try again.");
    }

    const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];

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

        addNotification(
  "New pending order",
  message
);

showToast(
  "New Pending Order",
  message
);
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
 * Existing ready and assigned records remain
 * displayed under Preparing for compatibility.
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
                  window.FoodConnectPhone.format(order.contact_number, "No contact")
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
  updateReceiptRecoveryButtons();

  document.getElementById("orderModal").classList.add("active");
}

function updateReceiptRecoveryButtons() {
  const customerReceiptBtn =
    document.getElementById("printReceiptBtn");

  const kitchenTicketBtn =
    document.getElementById("printKitchenTicketBtn");

  const onlinePaymentPending =
    selectedOrder &&
    String(
      selectedOrder.payment_method || ""
    ).trim() === "PayMongo QR Ph" &&
    String(
      selectedOrder.payment_status || ""
    )
      .trim()
      .toLowerCase() !== "paid";

  if (customerReceiptBtn) {
    customerReceiptBtn.hidden =
      Boolean(onlinePaymentPending);

    customerReceiptBtn.disabled =
      Boolean(onlinePaymentPending);

    customerReceiptBtn.innerHTML = `
      <i class="fa-solid fa-receipt"></i>
      Print / Reprint Customer Receipt
    `;

    customerReceiptBtn.title =
      "Use this again if the print dialog was cancelled, closed, or the receipt needs another copy.";
  }

  if (kitchenTicketBtn) {
    kitchenTicketBtn.hidden =
      Boolean(onlinePaymentPending);

    kitchenTicketBtn.disabled =
      Boolean(onlinePaymentPending);

    kitchenTicketBtn.innerHTML = `
      <i class="fa-solid fa-print"></i>
      Print / Reprint Kitchen Ticket
    `;

    kitchenTicketBtn.title =
      "Use this again if the print dialog was cancelled, closed, or the kitchen ticket needs another copy.";
  }
}

function buildModalContent(order) {
  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const orderType = String(
    order.order_type || ""
  )
    .toLowerCase()
    .trim();

  const normalizedStatus =
    normalizeOrderStatus(
      order.order_status
    );

  const publicStatusClass =
    getPublicStatusClass(
      normalizedStatus
    );

  const publicStatusLabel =
    getStatusDisplayLabel(
      order.order_status,
      order.order_type
    );

  const orderItemsHTML =
    items.length > 0
      ? items
          .map((item, index) => {
            const quantity =
              Number(item.quantity || 0);

            const price =
              Number(item.price || 0);

            const subtotal =
              quantity * price;

            const baseText =
              String(
                item.variant_text || ""
              ).trim();

            const comboChoiceText =
              String(
                item.combo_choice_text ||
                ""
              ).trim();

            const addonText =
              String(
                item.addon_text || ""
              ).trim();

            return `
              <article class="ticket-order-item">
                <div class="ticket-item-number">
                  ${index + 1}
                </div>

                <div class="ticket-item-content">
                  <div class="ticket-item-heading">
                    <div>
                      <h4>
                        ${escapeHTML(
                          item.product_name ||
                          "Unnamed Item"
                        )}
                      </h4>

                      <span class="ticket-item-quantity">
                        Quantity: ${escapeHTML(
                          quantity
                        )}
                      </span>
                    </div>

                    <strong class="ticket-item-subtotal">
                      ₱${formatMoney(subtotal)}
                    </strong>
                  </div>

                  ${
                    baseText ||
                    comboChoiceText ||
                    (
                      addonText &&
                      addonText !== "No Add-on"
                    )
                      ? `
                        <div class="ticket-item-options">
                          ${
                            baseText
                              ? `
                                <div>
                                  <span>Variant</span>
                                  <strong>
                                    ${escapeHTML(
                                      baseText
                                    )}
                                  </strong>
                                </div>
                              `
                              : ""
                          }

                          ${
                            comboChoiceText
                              ? `
                                <div>
                                  <span>Drink</span>
                                  <strong>
                                    ${escapeHTML(
                                      comboChoiceText
                                    )}
                                  </strong>
                                </div>
                              `
                              : ""
                          }

                          ${
                            addonText &&
                            addonText !==
                              "No Add-on"
                              ? `
                                <div>
                                  <span>Add-ons</span>
                                  <strong>
                                    ${escapeHTML(
                                      addonText
                                    )}
                                  </strong>
                                </div>
                              `
                              : ""
                          }
                        </div>
                      `
                      : ""
                  }
                </div>
              </article>
            `;
          })
          .join("")
      : `
        <div class="ticket-empty-state">
          <i class="fa-solid fa-basket-shopping"></i>

          <p>
            No items were found for this order.
          </p>
        </div>
      `;

  const deliveryHTML =
    orderType === "delivery"
      ? `
        <section class="ticket-section">
          <div class="ticket-section-heading">
            <div class="ticket-section-icon">
              <i class="fa-solid fa-location-dot"></i>
            </div>

            <div>
              <h3>Delivery Information</h3>
              <p>
                Customer delivery destination
              </p>
            </div>
          </div>

          <div class="ticket-address-card">
            <div class="ticket-address-row">
              <span>Address</span>

              <strong>
                ${escapeHTML(
                  order.address ||
                  "No delivery address provided"
                )}
              </strong>
            </div>

            ${
              order.landmark &&
              String(order.landmark).trim() !== ""
                ? `
                  <div class="ticket-address-row">
                    <span>Landmark</span>

                    <strong>
                      ${escapeHTML(
                        order.landmark
                      )}
                    </strong>
                  </div>
                `
                : ""
            }
          </div>
        </section>
      `
      : "";

  const notesHTML =
    order.notes &&
    String(order.notes).trim() !== ""
      ? `
        <section class="ticket-section">
          <div class="ticket-section-heading">
            <div class="ticket-section-icon">
              <i class="fa-solid fa-note-sticky"></i>
            </div>

            <div>
              <h3>Customer Notes</h3>
              <p>
                Special instructions for this order
              </p>
            </div>
          </div>

          <div class="ticket-notes-card">
            ${escapeHTML(order.notes)}
          </div>
        </section>
      `
      : "";

  const cancellationHTML =
    normalizedStatus === "cancelled"
      ? `
        <section class="ticket-section">
          <div class="ticket-section-heading cancellation-heading">
            <div class="ticket-section-icon">
              <i class="fa-solid fa-ban"></i>
            </div>

            <div>
              <h3>Cancellation Information</h3>
              <p>
                This order was cancelled
              </p>
            </div>
          </div>

          <div class="ticket-cancellation-card">
            <span>Cancellation Reason</span>

            <strong>
              ${escapeHTML(
                order.cancellation_reason ||
                "No cancellation reason recorded."
              )}
            </strong>

            <div class="ticket-cancellation-meta">
              <span>
                Cancelled by
                ${escapeHTML(
                  formatCancelledBy(
                    order.cancelled_by
                  )
                )}
              </span>

              ${
                order.cancelled_at
                  ? `
                    <span>
                      ${escapeHTML(
                        formatDateTime(
                          order.cancelled_at
                        )
                      )}
                    </span>
                  `
                  : ""
              }
            </div>
          </div>
        </section>
      `
      : "";

  return `
    <div class="cashier-order-ticket">

      <section class="ticket-identity-card">
        <div class="ticket-identity-main">
          <span class="ticket-overline">
            Current Order
          </span>

          <h2>
            Order #${escapeHTML(
              order.order_id || "N/A"
            )}
          </h2>

          <div class="ticket-identity-meta">
            <span>
              <i class="fa-solid fa-clock"></i>

              ${escapeHTML(
                formatDateTime(
                  order.created_at
                )
              )}
            </span>

            <span>
              <i class="fa-solid fa-utensils"></i>

              ${escapeHTML(
                formatOrderType(
                  order.order_type
                )
              )}
            </span>
          </div>
        </div>

        <div class="ticket-queue-card">
          <span>Queue Number</span>

          <strong>
            #${escapeHTML(
              order.queue_number || "N/A"
            )}
          </strong>
        </div>

        <span
          class="status-badge ticket-status-badge ${escapeHTML(
            publicStatusClass
          )}"
        >
          ${escapeHTML(
            publicStatusLabel
          )}
        </span>
      </section>

      <section class="ticket-section">
        <div class="ticket-section-heading">
          <div class="ticket-section-icon">
            <i class="fa-solid fa-user"></i>
          </div>

          <div>
            <h3>Customer Information</h3>
            <p>
              Customer and contact details
            </p>
          </div>
        </div>

        <div class="ticket-info-grid">
          <div class="ticket-info-card">
            <span>Customer Name</span>

            <strong>
              ${escapeHTML(
                order.customer_name ||
                "Unknown Customer"
              )}
            </strong>
          </div>

          <div class="ticket-info-card">
            <span>Contact Number</span>

            <strong>
              ${escapeHTML(
                window.FoodConnectPhone.format(order.contact_number, "No contact number")
              )}
            </strong>
          </div>

          <div class="ticket-info-card">
            <span>Order Type</span>

            <strong>
              ${escapeHTML(
                formatOrderType(
                  order.order_type
                )
              )}
            </strong>
          </div>

          <div class="ticket-info-card">
            <span>Payment Method</span>

            <strong>
              ${escapeHTML(
                order.payment_method ||
                "N/A"
              )}
            </strong>
          </div>

          <div class="ticket-info-card">
            <span>Payment Status</span>

            <strong>
              ${escapeHTML(
                String(
                  order.payment_status ||
                  "cash_pending"
                )
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, character =>
                    character.toUpperCase()
                  )
              )}
            </strong>
          </div>
        </div>
      </section>

      ${deliveryHTML}

      <section class="ticket-section ticket-items-section">
        <div class="ticket-section-heading">
          <div class="ticket-section-icon">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>

          <div>
            <h3>Order Items</h3>

            <p>
              ${items.length}
              item${items.length === 1 ? "" : "s"}
              in this order
            </p>
          </div>
        </div>

        <div class="ticket-items-list">
          ${orderItemsHTML}
        </div>
      </section>

      ${notesHTML}

      ${cancellationHTML}

      <section class="ticket-payment-card">
        <div>
          <span>Payment Method</span>

          <strong>
            ${escapeHTML(
              order.payment_method ||
              "N/A"
            )}
          </strong>
        </div>

        <div class="ticket-total">
          <span>Total Amount</span>

          <strong>
            ₱${formatMoney(
              order.total_amount
            )}
          </strong>
        </div>
      </section>

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

  /*
   * Hide every workflow button first.
   * Only the valid actions for the current
   * order status will be shown below.
   */
  if (preparingBtn) {
    preparingBtn.style.display = "none";
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

  const onlinePaymentPending =
    String(
      selectedOrder.payment_method || ""
    ).trim() === "PayMongo QR Ph" &&
    String(
      selectedOrder.payment_status || ""
    )
      .trim()
      .toLowerCase() !== "paid";

  if (onlinePaymentPending) {
    if (cancelBtn) {
      cancelBtn.style.display =
        "inline-flex";
    }

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
   * Pending:
   * Begin preparing the order.
   */
  if (normalizedStatus === "pending") {
    if (preparingBtn) {
      preparingBtn.textContent =
        "Mark as Preparing";

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
   * Preparing delivery order:
   * The next cashier action is rider assignment.
   *
   * Preparing dine-in/take-out:
   * The next action is customer pickup/completion.
   */
  if (normalizedStatus === "preparing") {
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
   * Backward compatibility:
   *
   * Existing orders may still have the old
   * internal ready status. Allow the cashier
   * to complete those orders without exposing
   * a Finish Preparing action.
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
   * assigned, out_for_delivery,
   * completed, and cancelled do not
   * require another cashier action.
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
  )
    .toLowerCase()
    .trim();

  const orderStatus = normalizeOrderStatus(
    selectedOrder.order_status
  );

  if (orderType !== "delivery") {
    showToast(
      "Invalid Order Type",
      "Only delivery orders can be assigned to a rider."
    );

    return;
  }

  if (
  ![
    "preparing",
    "ready"
  ].includes(orderStatus)
) {
  showToast(
    "Order Not Preparing",
    "The order must be in Preparing status before assigning a rider."
  );

  return;
}

  /*
   * The delivery fee must come from the order returned
   * by get_cashier_orders.php.
   *
   * The cashier cannot manually enter or change it.
   */
  const deliveryFee = Number(
    selectedOrder.delivery_fee
  );

  const hasValidDeliveryFee =
    Number.isFinite(deliveryFee) &&
    deliveryFee >= 0;

  const subtitle =
    document.getElementById(
      "assignRiderSubtitle"
    );

  const summary =
    document.getElementById(
      "assignmentOrderSummary"
    );

  const deliveryFeeInput =
    document.getElementById(
      "deliveryFeeInput"
    );

  const riderPaymentInput =
    document.getElementById(
      "riderPaymentInput"
    );

  const deliveryFeeDisplay =
    document.getElementById(
      "deliveryFeeDisplay"
    );

  const deliveryFeeError =
    document.getElementById(
      "deliveryFeeError"
    );

  const confirmButton =
    document.getElementById(
      "confirmAssignRiderBtn"
    );

  if (subtitle) {
    subtitle.textContent =
      `Queue #${selectedOrder.queue_number || "N/A"} • ` +
      `Order #${selectedOrder.order_id}`;
  }

  if (summary) {
    summary.innerHTML = `
      <div class="assignment-summary-item is-highlighted">
        <span>Queue Number</span>

        <strong>
          #${escapeHTML(
            selectedOrder.queue_number ||
            "N/A"
          )}
        </strong>
      </div>

      <div class="assignment-summary-item">
        <span>Order Number</span>

        <strong>
          #${escapeHTML(
            selectedOrder.order_id ||
            "N/A"
          )}
        </strong>
      </div>

      <div class="assignment-summary-item">
        <span>Customer</span>

        <strong>
          ${escapeHTML(
            selectedOrder.customer_name ||
            "Unknown Customer"
          )}
        </strong>
      </div>

      <div class="assignment-summary-item is-highlighted">
        <span>Order Total</span>

        <strong>
          ₱${formatMoney(
            selectedOrder.total_amount
          )}
        </strong>
      </div>

      <div class="assignment-summary-item">
        <span>Contact Number</span>

        <strong>
          ${escapeHTML(
            window.FoodConnectPhone.format(selectedOrder.contact_number, "No contact number")
          )}
        </strong>
      </div>

      <div class="assignment-summary-item">
        <span>Payment Method</span>

        <strong>
          ${escapeHTML(
            selectedOrder.payment_method ||
            "N/A"
          )}
        </strong>
      </div>

      <div class="assignment-summary-item assignment-address">
        <span>Delivery Address</span>

        <strong>
          ${escapeHTML(
            selectedOrder.address ||
            "No delivery address provided"
          )}
        </strong>
      </div>

      <div class="assignment-summary-item assignment-address">
        <span>Landmark</span>

        <strong>
          ${escapeHTML(
            selectedOrder.landmark ||
            "No landmark provided"
          )}
        </strong>
      </div>
    `;
  }

  if (deliveryFeeInput) {
    deliveryFeeInput.value =
      hasValidDeliveryFee
        ? deliveryFee.toFixed(2)
        : "";
  }

  /*
   * Internal restaurant riders are not paid through
   * this cashier assignment interface.
   */
  if (riderPaymentInput) {
    riderPaymentInput.value = "0.00";
  }

  if (deliveryFeeDisplay) {
    deliveryFeeDisplay.textContent =
      hasValidDeliveryFee
        ? `₱${formatMoney(deliveryFee)}`
        : "Unavailable";
  }

  if (deliveryFeeError) {
    deliveryFeeError.hidden =
      hasValidDeliveryFee;
  }

  /*
   * Prevent assignment when the order API did not
   * provide a valid database delivery fee.
   */
  if (confirmButton) {
    confirmButton.disabled =
      !hasValidDeliveryFee;
  }

  document
    .getElementById("assignRiderModal")
    ?.classList.add("active");

  await loadAvailableRiders();
}

function closeAssignRiderModal() {
  document
    .getElementById(
      "assignRiderModal"
    )
    ?.classList.remove("active");

  const riderSelect =
    document.getElementById(
      "riderSelect"
    );

  const deliveryFeeInput =
    document.getElementById(
      "deliveryFeeInput"
    );

  const riderPaymentInput =
    document.getElementById(
      "riderPaymentInput"
    );

  const deliveryFeeDisplay =
    document.getElementById(
      "deliveryFeeDisplay"
    );

  const deliveryFeeError =
    document.getElementById(
      "deliveryFeeError"
    );

  const confirmButton =
    document.getElementById(
      "confirmAssignRiderBtn"
    );

  if (riderSelect) {
    riderSelect.innerHTML = `
      <option value="">
        Select an available rider
      </option>
    `;

    riderSelect.disabled = false;
  }

  if (deliveryFeeInput) {
    deliveryFeeInput.value = "0.00";
  }

  if (riderPaymentInput) {
    riderPaymentInput.value = "0.00";
  }

  if (deliveryFeeDisplay) {
    deliveryFeeDisplay.textContent =
      "₱0.00";
  }

  if (deliveryFeeError) {
    deliveryFeeError.hidden = true;
  }

  if (confirmButton) {
    confirmButton.disabled = false;

    confirmButton.innerHTML = `
      <i class="fa-solid fa-motorcycle"></i>
      Assign Rider
      <i class="fa-solid fa-arrow-right"></i>
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
        data.message || "Unable to load delivery staff right now. Please try again."
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
              ? ` — ${escapeHTML(window.FoodConnectPhone.format(rider.contact_number, rider.contact_number))}`
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
        error.message || "Unable to check delivery staff availability right now.";
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

  const riderSelect =
    document.getElementById(
      "riderSelect"
    );

  const submitButton =
    document.getElementById(
      "confirmAssignRiderBtn"
    );

  const riderId = Number(
    riderSelect?.value || 0
  );

  /*
   * Use the delivery fee that came from the database
   * through the selected order.
   *
   * Do not accept a cashier-entered fee.
   */
  const deliveryFee = Number(
    selectedOrder.delivery_fee
  );

  if (riderId <= 0) {
    showToast(
      "Rider Required",
      "Please select an available restaurant rider."
    );

    riderSelect?.focus();

    return;
  }

  if (
    !Number.isFinite(deliveryFee) ||
    deliveryFee < 0
  ) {
    showToast(
      "Delivery Fee Unavailable",
      "The fixed delivery fee was not loaded from this order. Refresh the orders and try again."
    );

    return;
  }

  const selectedRiderName =
    riderSelect?.options[
      riderSelect.selectedIndex
    ]?.textContent?.trim() ||
    "the selected rider";

  const orderId = Number(
    selectedOrder.order_id
  );

  /*
   * Keep a local immutable copy because selectedOrder
   * may change after modal operations.
   */
  const assignmentPayload = {
    order_id: orderId,
    delivery_staff_id: riderId,
    delivery_fee: deliveryFee,
    delivery_staff_payment: 0
  };

  restoreAssignModalAfterConfirm = true;

  document
    .getElementById(
      "assignRiderModal"
    )
    ?.classList.remove("active");

  openConfirmModal(
    "Assign Delivery Rider",
    `Assign ${selectedRiderName} to Order #${orderId} with the fixed ₱${formatMoney(deliveryFee)} delivery fee?`,
    async () => {
      try {
        if (submitButton) {
          submitButton.disabled = true;

          submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Assigning Rider...
          `;
        }

        const response = await fetch(
          `${API_BASE}/assign_delivery_rider.php`,
          {
            method: "POST",
            credentials: "include",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              assignmentPayload
            )
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
            "Unable to assign the delivery staff. Please try again."
          );
        }

        showToast(
          "Rider Assigned",
          `${
            data.assignment?.rider_name ||
            selectedRiderName
          } was assigned to Order #${orderId}.`
        );

        restoreAssignModalAfterConfirm =
          false;

        closeAssignRiderModal();
        closeModal();

        await loadOrders();
        await loadCashierNotifications();

      } catch (error) {
        console.error(
          "Assign rider error:",
          error
        );

        showToast(
          "Assignment Failed",
          error.message ||
          "Unable to assign the delivery staff. Please try again."
        );

        document
          .getElementById(
            "assignRiderModal"
          )
          ?.classList.add("active");

        await loadAvailableRiders();

      } finally {
        if (submitButton) {
          submitButton.disabled = false;

          submitButton.innerHTML = `
            <i class="fa-solid fa-motorcycle"></i>
            Assign Rider
            <i class="fa-solid fa-arrow-right"></i>
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
        "Unable to cancel the order. Please try again."
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
      `Order cancelled successfully.`
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
          `Update this order to ${statusLabel}?`
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
            "Something went wrong. Please try again."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Unable to update the order status. Please try again."
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
                `Order status updated successfully.`
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
          "Unable to update the order status. Please try again."
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

async function loadCashierProfile() {
  const profileName = document.getElementById("cashierProfileName");
  if (!profileName) return;

  try {
    const response = await fetch(`${API_BASE}/me.php`, {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    });
    const data = await response.json();
    const fullName = String(data?.user?.full_name || "").trim();
    if (response.ok && data.logged_in && fullName) {
      profileName.textContent = fullName;
      profileName.title = fullName;
    }
  } catch (error) {
    console.error("Load cashier profile error:", error);
  }
}

function renderCashierNotifications() {
  const list = document.getElementById("notificationsList");
  if (!list) return;

  const markAllBtn =
    document.getElementById("markAllNotificationsReadBtn");

  const hasUnread = cashierNotifications.some(
    (notif) => Number(notif.is_read || 0) !== 1
  );

  if (markAllBtn) {
    markAllBtn.disabled = !hasUnread;
  }

  const filtered = cashierNotifications.filter((notif) => {
    const isRead = Number(notif.is_read) === 1;
    if (currentNotificationFilter === "unread") return !isRead;
    if (currentNotificationFilter === "read") return isRead;
    return true;
  });

  if (filtered.length === 0) {
    const message = currentNotificationFilter === "unread"
      ? "You're all caught up. No unread notifications."
      : currentNotificationFilter === "read"
        ? "No read notifications yet."
        : "No notifications yet.";
    list.innerHTML = `<div class="notification-empty-state"><i class="fa-regular fa-bell"></i><strong>${escapeHTML(message)}</strong></div>`;
    return;
  }

  list.innerHTML = filtered.map((notif) => {
    const logId = Number(notif.log_id);
    const isRead = Number(notif.is_read) === 1;
    const title = notif.action_title || "Notification";
    let message = String(notif.action_description || "");
    // Keep internal database order IDs out of the cashier-facing notification.
    message = message.replace(/\s*Order\s*#\d+\s*\/\s*/i, " ");
    const time = formatDateTime(notif.created_at);
    const icon = title.toLowerCase().includes("cancel") ? "fa-circle-xmark" : "fa-bell";

    return `
      <article class="notification-item ${isRead ? "is-read" : "is-unread"}" data-log-id="${logId}">
        <div class="notification-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="notification-content">
          <div class="notification-title-row">
            <h4>${escapeHTML(title)}</h4>
            ${!isRead ? '<span class="notification-new-dot">New</span>' : ''}
          </div>
          <p>${escapeHTML(message)}</p>
          <div class="notification-meta">
            <small>${escapeHTML(time)}</small>
            ${isRead ? '<span class="notification-read-label">Read</span>' : `<button type="button" class="mark-read-btn" onclick="markCashierNotificationRead(${logId})">Mark as Read</button>`}
          </div>
        </div>
      </article>`;
  }).join("");
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
        data.message || "Unable to load notifications right now. Please try again."
      );
    }

  if (
  data.notifications.length === 0
) {
  cashierNotifications = [];
  list.innerHTML = `
    <p class="empty-message">
      No notifications yet.
    </p>
  `;

  if (badge) {
    badge.textContent = "0";
    badge.style.display =
      "none";
  }

  cashierNotificationsFirstLoadDone =
    true;

  return;
}

    const newCustomerCancellationNotifications =
  data.notifications.filter(
    notification => {
      const logId =
        Number(
          notification.log_id
        );

      const title =
        String(
          notification.action_title ||
          ""
        )
          .trim()
          .toLowerCase();

      return (
        cashierNotificationsFirstLoadDone &&
        Number.isInteger(logId) &&
        logId > 0 &&
        !knownCashierNotificationIds.has(
          logId
        ) &&
        title ===
          "customer cancelled order"
      );
    }
  );

data.notifications.forEach(
  notification => {
    const logId =
      Number(
        notification.log_id
      );

    if (
      Number.isInteger(logId) &&
      logId > 0
    ) {
      knownCashierNotificationIds.add(
        logId
      );
    }
  }
);

if (
  newCustomerCancellationNotifications
    .length > 0
) {
  playNotificationSound();

  newCustomerCancellationNotifications
    .forEach(notification => {
      const message =
        String(
          notification
            .action_description ||
          "A customer cancelled an order."
        ).trim();

      showToast(
        "Customer Cancelled Order",
        message
      );
    });
}

cashierNotificationsFirstLoadDone =
  true;

    const unreadCount = Number(data.unread_count || 0);

    if (badge) {
      badge.textContent = String(unreadCount);
      badge.style.display =
        unreadCount > 0 ? "inline-flex" : "none";
    }

    cashierNotifications = data.notifications;
    renderCashierNotifications();

  } catch (error) {
    console.error(
      "Load cashier notifications error:",
      error
    );
  }
}

async function markAllCashierNotificationsRead() {
  const button =
    document.getElementById("markAllNotificationsReadBtn");

  if (!cashierNotifications.some(
    (notif) => Number(notif.is_read || 0) !== 1
  )) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Marking...';
  }

  try {
    const response = await fetch(
      `${API_BASE}/mark_all_notifications_read.php`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to mark all notifications as read. Please try again."
      );
    }

    cashierNotifications = cashierNotifications.map(
      (notif) => ({ ...notif, is_read: 1 })
    );

    const badge =
      document.getElementById("cashierNotificationBadge");

    if (badge) {
      badge.textContent = "0";
      badge.style.display = "none";
    }

    renderCashierNotifications();

    showToast(
      "Notifications Updated",
      "All notifications have been marked as read."
    );

  } catch (error) {
    console.error(
      "Mark all cashier notifications read error:",
      error
    );

    showToast(
      "Update Failed",
      error.message ||
      "Unable to mark all notifications as read."
    );
  } finally {
    if (button) {
      button.innerHTML =
        '<i class="fa-solid fa-check-double"></i> Mark all as read';

      button.disabled = !cashierNotifications.some(
        (notif) => Number(notif.is_read || 0) !== 1
      );
    }
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
        "Unable to mark this notification as read. Please try again."
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

function buildCustomerReceiptContent(order) {
  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const orderType = String(
    order?.order_type || ""
  ).toLowerCase().trim();

  const isDelivery = orderType === "delivery";

  const itemsSubtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);

    return sum + (quantity * price);
  }, 0);

  const deliveryFee = isDelivery
    ? Number(order?.delivery_fee || 0)
    : 0;

  /*
   * FoodConnect receipts treat menu prices / order totals as
   * VAT-inclusive. VAT is therefore a BREAKDOWN of the amount
   * already paid, not an extra 12% charge.
   *
   * VATable Sales = Gross VAT-inclusive Amount / 1.12
   * VAT (12%)     = Gross VAT-inclusive Amount - VATable Sales
   */
  const receiptTotal = Math.max(
    0,
    Number(
      order?.total_amount ??
      (itemsSubtotal + deliveryFee)
    ) || 0
  );

  const vatableSales =
    receiptTotal / 1.12;

  const vatAmount =
    receiptTotal - vatableSales;

  const vatExemptSales = 0;
  const zeroRatedSales = 0;

  const itemBlocks = items.map(item => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const lineTotal = quantity * price;

    const optionLines = [
      item.variant_text
        ? `<div>Variant: ${escapeHTML(item.variant_text)}</div>`
        : "",
      item.combo_choice_text
        ? `<div>Drink: ${escapeHTML(item.combo_choice_text)}</div>`
        : "",
      item.addon_text &&
      item.addon_text !== "No Add-on"
        ? `<div>Add-ons: ${escapeHTML(item.addon_text)}</div>`
        : ""
    ].filter(Boolean).join("");

    return `
      <div class="receipt-item">
        <div class="receipt-item-top">
          <strong class="receipt-item-name">
            ${escapeHTML(item.product_name || "Unnamed Item")}
          </strong>

          <strong class="receipt-item-total">
            ₱${formatMoney(lineTotal)}
          </strong>
        </div>

        <div class="receipt-item-subline">
          ${quantity} x ₱${formatMoney(price)}
        </div>

        ${
          optionLines
            ? `<div class="receipt-item-options">${optionLines}</div>`
            : ""
        }
      </div>
    `;
  }).join("");

  return `
    <div class="receipt customer-receipt">
      <h1 class="restaurant-name">
        ${escapeHTML(order?.restaurant_name || "FoodConnect")}
      </h1>

      <p class="receipt-document-label">
        CUSTOMER RECEIPT
      </p>

      <hr>

      <div class="customer-queue-block">
        <div class="customer-queue-label">
          QUEUE NUMBER
        </div>

        <div class="customer-queue-number">
          #${escapeHTML(order?.queue_number || "N/A")}
        </div>

        <div class="customer-queue-help">
          Please keep this receipt for your order.
        </div>
      </div>

      <hr>

      <div class="receipt-meta">
        <div class="receipt-meta-row">
          <span>Customer</span>
          <strong>${escapeHTML(order?.customer_name || "N/A")}</strong>
        </div>

        <div class="receipt-meta-row">
          <span>Order Type</span>
          <strong>${escapeHTML(formatOrderType(order?.order_type))}</strong>
        </div>

        <div class="receipt-meta-row">
          <span>Payment</span>
          <strong>${escapeHTML(order?.payment_method || "N/A")}</strong>
        </div>

        <div class="receipt-meta-row">
          <span>Date</span>
          <strong>${escapeHTML(formatDateTime(order?.created_at))}</strong>
        </div>
      </div>

      <hr>

      <div class="receipt-section-title">
        ORDER SUMMARY
      </div>

      <div class="receipt-items">
        ${itemBlocks || "<p>No items found.</p>"}
      </div>

      <hr>

      <div class="receipt-totals">
        <div class="receipt-total-row">
          <span>Subtotal</span>
          <strong>₱${formatMoney(itemsSubtotal)}</strong>
        </div>

        ${
          isDelivery
            ? `
              <div class="receipt-total-row delivery-fee-row">
                <span>Delivery Fee</span>
                <strong>₱${formatMoney(deliveryFee)}</strong>
              </div>
            `
            : ""
        }

        <div class="receipt-grand-total">
          <span>TOTAL</span>
          <strong>₱${formatMoney(receiptTotal)}</strong>
        </div>
      </div>

      <hr>

      <div class="receipt-vat-breakdown">
        <div class="receipt-vat-title">
          VAT BREAKDOWN
        </div>

        <div class="receipt-total-row">
          <span>VATable Sales</span>
          <strong>₱${formatMoney(vatableSales)}</strong>
        </div>

        <div class="receipt-total-row">
          <span>VAT (12%)</span>
          <strong>₱${formatMoney(vatAmount)}</strong>
        </div>

        <div class="receipt-total-row">
          <span>VAT-Exempt Sales</span>
          <strong>₱${formatMoney(vatExemptSales)}</strong>
        </div>

        <div class="receipt-total-row">
          <span>Zero-Rated Sales</span>
          <strong>₱${formatMoney(zeroRatedSales)}</strong>
        </div>
      </div>

      ${
        isDelivery && order?.address
          ? `
              <hr>

              <div class="receipt-delivery-info">
                <strong>DELIVERY TO</strong>
                <p>${escapeHTML(order.address)}</p>
                ${
                  order?.landmark
                    ? `<p>Landmark: ${escapeHTML(order.landmark)}</p>`
                    : ""
                }
              </div>
            `
          : ""
      }

      ${
        order?.notes
          ? `
              <hr>
              <div class="receipt-customer-notes">
                <strong>Notes:</strong>
                ${escapeHTML(order.notes)}
              </div>
            `
          : ""
      }

      <p class="thank-you">
        THANK YOU!
      </p>
    </div>
  `;
}

function printCustomerReceipt() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );
    return;
  }

  if (
    String(
      selectedOrder.payment_method || ""
    ).trim() === "PayMongo QR Ph" &&
    String(
      selectedOrder.payment_status || ""
    )
      .trim()
      .toLowerCase() !== "paid"
  ) {
    showToast(
      "Payment Pending",
      "PayMongo payment must be confirmed before printing the receipt."
    );
    return;
  }

  const orderId = Number(
    selectedOrder.order_id || 0
  );

  const content =
    buildCustomerReceiptContent(selectedOrder);

  /*
   * Keep window.open() inside the cashier's direct click event.
   * Waiting for the activity-log request first could cause the
   * browser to block the print popup.
   */
  openPrintWindow(
    "Customer Receipt",
    content
  );

  /*
   * Accountability log only for this MANUAL button path.
   * Automatic first printing never calls this function, so it
   * will not be recorded as a receipt reprint/request.
   */
  logManualReceiptPrintRequest(
    orderId,
    "customer_receipt"
  );
}

async function processAutomaticReceiptPrintQueue() {
  if (automaticReceiptPrintBusy) {
    return;
  }

  automaticReceiptPrintBusy = true;
  let claimedPrintJobId = 0;

  try {
    const response = await fetch(
      `${API_BASE}/claim_receipt_print_job.php`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store"
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
        "Unable to check the automatic receipt print queue."
      );
    }

    if (!data.job || !data.order) {
      automaticReceiptPrintErrorShown = false;
      return;
    }

    claimedPrintJobId = Number(
      data.job.print_job_id || 0
    );

    const order = data.order;

    if (
      !Number.isInteger(claimedPrintJobId) ||
      claimedPrintJobId <= 0 ||
      !Number(order.order_id)
    ) {
      throw new Error(
        "The receipt print queue returned invalid data."
      );
    }

    const printKind = String(
      data.job.print_kind || ""
    ).trim();

    let content = "";
    let printTitle = "";
    let toastLabel = "";

    if (printKind === "customer_receipt") {
      content = buildCustomerReceiptContent(order);
      printTitle = `Order #${order.order_id} Customer Receipt`;
      toastLabel = "Customer receipt";
    } else if (printKind === "kitchen_ticket") {
      content = buildKitchenTicketContent(order);
      printTitle = `Order #${order.order_id} Kitchen Ticket`;
      toastLabel = "Kitchen ticket";
    } else {
      throw new Error(
        "Unknown automatic print job type."
      );
    }

    await openAutomaticPrintFrame(
      printTitle,
      content
    );

    await finishAutomaticReceiptPrintJob(
      claimedPrintJobId
    );

    automaticReceiptPrintErrorShown = false;

    showToast(
      "Print Job Processed",
      `${toastLabel} for Order #${order.order_id} was sent to the printer.`
    );

    /*
 * Give Chrome enough time to completely close the previous
 * print dialog before requesting the next print job.
 *
 * This is especially important when the same order has:
 * 1. Customer Receipt
 * 2. Kitchen Ticket
 */
setTimeout(() => {
  processAutomaticReceiptPrintQueue();
}, 2500);

  } catch (error) {
    console.error(
      "Automatic receipt printing error:",
      error
    );

    /*
     * A claimed job is intentionally NOT auto-released here.
     * This prevents a browser/network problem from printing the same
     * first receipt repeatedly. The existing manual receipt button
     * remains available if the physical print fails.
     */
    if (!automaticReceiptPrintErrorShown) {
      showToast(
        "Automatic Printing Error",
        error.message ||
        "Unable to automatically print the receipt."
      );

      automaticReceiptPrintErrorShown = true;
    }

  } finally {
    automaticReceiptPrintBusy = false;
  }
}

async function finishAutomaticReceiptPrintJob(
  printJobId
) {
  const response = await fetch(
    `${API_BASE}/finish_receipt_print_job.php`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        print_job_id: printJobId
      })
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      "The receipt printed, but FoodConnect could not finish its print job."
    );
  }
}

function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const rawValue =
    String(dateValue).trim();

  /*
   * Cloud MySQL DATETIME values normally arrive without a timezone.
   * Treat timezone-less values as UTC, then display them explicitly
   * in Philippine Standard Time (Asia/Manila, UTC+8).
   */
  const mysqlDateTimePattern =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

  const normalizedValue =
    mysqlDateTimePattern.test(rawValue)
      ? `${rawValue.replace(" ", "T")}Z`
      : rawValue;

  const date =
    new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  return date.toLocaleString(
    "en-PH",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  );
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
      "Pending",

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
    "Pending"
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

function buildKitchenTicketContent(order) {
  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const itemBlocks = items.map(item => {
    const quantity = Number(item.quantity || 0);
    const baseText = String(item.variant_text || "").trim();
    const comboChoiceText = String(
      item.combo_choice_text || ""
    ).trim();
    const addonText = String(
      item.addon_text || ""
    ).trim();

    return `
      <div class="kitchen-item">
        <strong>
          ${quantity}x ${escapeHTML(item.product_name || "Unnamed Item")}
        </strong>

        ${
          baseText
            ? `<p>Variant: ${escapeHTML(baseText)}</p>`
            : ""
        }

        ${
          comboChoiceText
            ? `<p>Drink: ${escapeHTML(comboChoiceText)}</p>`
            : ""
        }

        ${
          addonText && addonText !== "No Add-on"
            ? `<p>Add-ons: ${escapeHTML(addonText)}</p>`
            : ""
        }
      </div>
    `;
  }).join("");

  const normalizedOrderType = String(
    order?.order_type || ""
  ).toLowerCase();

  return `
    <div class="receipt kitchen-ticket">
      <h1>KITCHEN TICKET</h1>

      <div class="queue-number">
        #${escapeHTML(order?.queue_number || "N/A")}
      </div>

      <p class="center-text">
        Order #${escapeHTML(order?.order_id || "N/A")}
      </p>

      <hr>

      <p>
        <strong>Type:</strong>
        ${escapeHTML(formatOrderType(order?.order_type))}
      </p>

      <p>
        <strong>Customer:</strong>
        ${escapeHTML(order?.customer_name || "N/A")}
      </p>

      ${
        normalizedOrderType === "dine-in"
          ? `
            <p>
              <strong>Table:</strong>
              ${escapeHTML(order?.table_number || "N/A")}
            </p>
          `
          : ""
      }
<p>
        <strong>Time:</strong>
        ${escapeHTML(formatDateTime(order?.created_at))}
      </p>

      <hr>

      ${itemBlocks || "<p>No items found.</p>"}

      ${
        order?.notes
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
}

function printKitchenTicket() {
  if (!selectedOrder) {
    showToast(
      "No Order Selected",
      "Please select an order first."
    );
    return;
  }

  if (
    String(
      selectedOrder.payment_method || ""
    ).trim() === "PayMongo QR Ph" &&
    String(
      selectedOrder.payment_status || ""
    )
      .trim()
      .toLowerCase() !== "paid"
  ) {
    showToast(
      "Payment Pending",
      "PayMongo payment must be confirmed before printing the kitchen ticket."
    );
    return;
  }

  const orderId = Number(
    selectedOrder.order_id || 0
  );

  const content =
    buildKitchenTicketContent(selectedOrder);

  /*
   * Keep the real print popup tied directly to the cashier click.
   */
  openPrintWindow(
    "Kitchen Ticket",
    content
  );

  /* Manual print/reprint accountability only. */
  logManualReceiptPrintRequest(
    orderId,
    "kitchen_ticket"
  );
}

async function logManualReceiptPrintRequest(
  orderId,
  documentType
) {
  const normalizedOrderId = Number(orderId || 0);

  if (
    !Number.isInteger(normalizedOrderId) ||
    normalizedOrderId <= 0
  ) {
    console.error(
      "Receipt print activity log skipped: invalid order ID.",
      orderId
    );

    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/add_activity_log.php`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action_type: "receipt_print_request",
          order_id: normalizedOrderId,
          document_type: documentType
        })
      }
    );

    const responseText = await response.text();
    let data = null;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Invalid receipt print activity-log response:",
        responseText
      );

      return;
    }

    if (!response.ok || !data.success) {
      console.error(
        "Receipt print activity log failed:",
        data.message || "Unknown logging error."
      );
    }
  } catch (error) {
    /*
     * Logging must never block or cancel the cashier's print action.
     * The print request already happened, so we only report the
     * logging problem in the developer console.
     */
    console.error(
      "Receipt print activity log error:",
      error
    );
  }
}


function buildPrintDocumentMarkup(title, content) {
  return `
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
            Arial,
            Helvetica,
            sans-serif;

          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;

          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .receipt {
          width: 48mm;
          max-width: 48mm;
          margin: 0 auto;
          padding: 2mm 1mm 4mm;
          overflow-wrap: anywhere;
        }

        h1 {
          margin: 0 0 2mm;
          text-align: center;
          font-size: 17px;
          line-height: 1.15;
          font-weight: 800;
          text-transform: uppercase;
        }

        h2 {
          margin: 2mm 0;
          font-size: 14px;
          line-height: 1.2;
          font-weight: 800;
        }

        p {
          margin: 1mm 0;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;
        }

        strong {
          font-weight: 800;
        }

        small {
          font-size: 10px;
          font-weight: 600;
          line-height: 1.25;
        }

        hr {
          width: 100%;
          margin: 2.25mm 0;
          border: 0;
          border-top: 1.5px dashed #000000;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 10px;
          font-weight: 600;
        }

        th,
        td {
          padding: 1mm 0.35mm;
          vertical-align: top;
          overflow-wrap: anywhere;
        }

        th {
          border-bottom: 1.5px dashed #000000;
          font-size: 9px;
          font-weight: 800;
          text-align: left;
        }

        td {
          font-weight: 600;
        }

        th:nth-child(1),
        td:nth-child(1) {
          width: 42%;
        }

        th:nth-child(2),
        td:nth-child(2) {
          width: 10%;
          text-align: center;
        }

        th:nth-child(3),
        td:nth-child(3) {
          width: 22%;
          text-align: right;
        }

        th:nth-child(4),
        td:nth-child(4) {
          width: 26%;
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
          font-size: 11px;
          font-weight: 800;
        }

        .restaurant-name {
          margin-bottom: 1mm;
          font-size: 18px;
          font-weight: 900;
        }

        .receipt-document-label {
          margin: 0;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .customer-queue-block {
          text-align: center;
          page-break-inside: avoid;
        }

        .customer-queue-label {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .customer-queue-number {
          margin: 1.8mm 0 1.2mm;
          font-size: 46px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .customer-queue-help {
          font-size: 9px;
          font-weight: 700;
          line-height: 1.25;
        }

        .receipt-meta {
          display: flex;
          flex-direction: column;
          gap: 0.7mm;
        }

        .receipt-meta-row,
        .receipt-total-row,
        .receipt-grand-total {
          display: flex;
          justify-content: space-between;
          gap: 2mm;
          align-items: flex-start;
        }

        .receipt-meta-row span,
        .receipt-total-row span {
          flex: 0 0 auto;
          font-size: 10px;
          font-weight: 700;
        }

        .receipt-meta-row strong,
        .receipt-total-row strong {
          text-align: right;
          font-size: 10px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .receipt-section-title {
          margin-bottom: 1mm;
          text-align: center;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .receipt-item {
          padding: 1.7mm 0;
          border-bottom: 1px dashed #000000;
          page-break-inside: avoid;
        }

        .receipt-item:last-child {
          border-bottom: 0;
        }

        .receipt-item-top {
          display: flex;
          justify-content: space-between;
          gap: 2mm;
          align-items: flex-start;
        }

        .receipt-item-name {
          flex: 1;
          font-size: 11px;
          font-weight: 900;
        }

        .receipt-item-total {
          flex: 0 0 auto;
          text-align: right;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .receipt-item-subline {
          margin-top: 0.5mm;
          font-size: 10px;
          font-weight: 700;
        }

        .receipt-item-options {
          margin-top: 0.8mm;
          padding-left: 2mm;
          font-size: 9px;
          font-weight: 700;
          line-height: 1.3;
        }

        .receipt-totals {
          display: flex;
          flex-direction: column;
          gap: 1mm;
          page-break-inside: avoid;
        }

        .receipt-vat-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.8mm;
          page-break-inside: avoid;
        }

        .receipt-vat-title {
          margin-bottom: 0.5mm;
          text-align: center;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.35px;
        }

        .receipt-vat-breakdown .receipt-total-row span,
        .receipt-vat-breakdown .receipt-total-row strong {
          font-size: 9.5px;
        }

        .delivery-fee-row {
          padding-bottom: 1mm;
          border-bottom: 1px dashed #000000;
        }

        .receipt-grand-total {
          margin-top: 0.7mm;
          align-items: baseline;
        }

        .receipt-grand-total span,
        .receipt-grand-total strong {
          font-size: 16px;
          font-weight: 900;
        }

        .receipt-delivery-info {
          padding: 1.5mm;
          border: 1.5px solid #000000;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.3;
          page-break-inside: avoid;
        }

        .receipt-delivery-info > strong {
          display: block;
          margin-bottom: 1mm;
          font-size: 10px;
          font-weight: 900;
        }

        .receipt-delivery-info p {
          margin: 0.7mm 0;
          font-size: 9px;
          font-weight: 700;
        }

        .receipt-customer-notes {
          font-size: 10px;
          font-weight: 700;
          line-height: 1.3;
        }

        .queue-number {
          margin: 3mm 0;
          text-align: center;
          font-size: 32px;
          line-height: 1;
          font-weight: 900;
        }

        .kitchen-ticket h1 {
          font-size: 19px;
        }

        .kitchen-item {
          padding: 2.5mm 0;
          border-bottom: 1.5px dashed #000000;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.25;
          page-break-inside: avoid;
        }

        .kitchen-item strong {
          display: block;
          font-size: 15px;
          font-weight: 900;
        }

        .kitchen-item p {
          margin: 1mm 0 0 3mm;
          font-size: 11px;
          font-weight: 700;
        }

        .notes {
          margin-top: 2mm;
          padding: 2mm;
          border: 2px solid #000000;
          font-size: 12px;
          line-height: 1.3;
          font-weight: 800;
          page-break-inside: avoid;
        }

        .notes p {
          margin-top: 1mm;
          font-size: 12px;
          font-weight: 800;
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
            width: 48mm !important;
            max-width: 48mm !important;
          }
        }
      </style>
    </head>

    <body>
      ${content}
    </body>
    </html>
  `;
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
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(
    buildPrintDocumentMarkup(
      title,
      content
    )
  );
  printWindow.document.close();

  /*
   * Manual Print / Reprint:
   * Do not depend on popup.onload because Chrome may not fire it
   * reliably after document.write() into about:blank.
   *
   * Give the receipt a moment to render, then open the real
   * browser print dialog directly.
   */
  setTimeout(() => {
    try {
      if (printWindow.closed) {
        return;
      }

      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error(
        "Manual receipt print error:",
        error
      );
    }
  }, 500);

  /*
   * Close the temporary receipt window after Chrome finishes
   * the print dialog. If Chrome does not fire afterprint,
   * the cashier can simply close the temporary window manually.
   */
  printWindow.onafterprint = function () {
    try {
      printWindow.close();
    } catch (error) {
      console.warn(
        "Unable to close manual receipt window:",
        error
      );
    }
  };

  return true;
}

function openAutomaticPrintFrame(
  title,
  content
) {
  return new Promise((resolve, reject) => {
    const printFrame =
      document.createElement("iframe");

    printFrame.setAttribute(
      "aria-hidden",
      "true"
    );

    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "1px";
    printFrame.style.height = "1px";
    printFrame.style.opacity = "0";
    printFrame.style.border = "0";
    printFrame.style.pointerEvents = "none";

    document.body.appendChild(printFrame);

    let finished = false;

    const cleanup = () => {
      if (printFrame.isConnected) {
        printFrame.remove();
      }
    };

    const finish = () => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      resolve();
    };

    const fail = error => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      reject(error);
    };

    try {
      const frameWindow =
        printFrame.contentWindow;

      const frameDocument =
        printFrame.contentDocument ||
        frameWindow?.document;

      if (!frameWindow || !frameDocument) {
        throw new Error(
          "Unable to create the automatic print frame."
        );
      }

      frameDocument.open();
      frameDocument.write(
        buildPrintDocumentMarkup(
          title,
          content
        )
      );
      frameDocument.close();

      /*
       * Chrome normally pauses JavaScript while the print dialog
       * is open. frameWindow.print() therefore returns after the
       * cashier closes the dialog by printing or cancelling.
       *
       * Do not wait for iframe.onafterprint here because Chrome can
       * delay that event for many seconds on some printer drivers.
       */
      setTimeout(() => {
        try {
          frameWindow.focus();
          frameWindow.print();

          /*
           * Give Chrome / the printer driver a short moment to fully
           * close the previous dialog before the queue continues.
           */
          setTimeout(
            finish,
            700
          );
        } catch (error) {
          fail(error);
        }
      }, 300);

    } catch (error) {
      fail(error);
    }
  });
}
