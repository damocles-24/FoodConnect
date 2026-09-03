function formatUserName(user) {
  return [
    user?.first_name,
    user?.middle_name,
    user?.last_name
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    || String(user?.display_name || user?.name || "").trim();
}

function goToCart() {
  localStorage.setItem("lastPage", window.location.href);
  window.location.href = "cart.html";
}

const API = "/api";

document.addEventListener("DOMContentLoaded", async () => {
  const wrapper = document.querySelector(".account-wrapper");
  const btn = document.getElementById("accountBtn");
  const drop = document.getElementById("accountDropdown");
  const nameEl = document.getElementById("accountName");
  const logoutBtn = document.getElementById("logoutBtn");
  const goProfileBtn = document.getElementById("goProfile");

  let loggedIn = false;

  try {
    const res = await fetch(`${API}/me.php`, { credentials: "include" });
    const d = await res.json();

    loggedIn = !!d.logged_in;

    if (nameEl) {
      nameEl.textContent =
        loggedIn
          ? (formatUserName(d.user) || "User")
          : "Guest";
    }

    if (logoutBtn) {
      logoutBtn.style.display = loggedIn ? "block" : "none";
    }
  } catch (e) {
    loggedIn = false;
    if (nameEl) nameEl.textContent = "Guest";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  if (wrapper && btn && drop) {
    btn.style.cursor = "pointer";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      wrapper.classList.toggle("open");
    });

    drop.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      wrapper.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        wrapper.classList.remove("open");
      }
    });
  }

  if (goProfileBtn) {
    goProfileBtn.addEventListener("click", () => {
      window.location.href = loggedIn ? "profile.html" : "login.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = `${API}/logout.php`;
    });
  }

  async function updateCartBadge() {
    const cartLink = document.querySelector(".cart-link");
    if (!cartLink) return;

    let badge = cartLink.querySelector(".cart-badge");

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartLink.style.position = "relative";
      cartLink.appendChild(badge);
    }

    try {
      const res = await fetch(`${API}/cart_get.php`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data.success && Number(data.total_items) > 0) {
        badge.textContent = data.total_items;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    } catch (err) {
      badge.style.display = "none";
    }
  }

  const mainFilterBtns = document.querySelectorAll(".main-filter-btn");
  const subFilterBtns = document.querySelectorAll(".sub-filter-btn");
  const subFilterWrapper = document.querySelector(".menu-subfilters");
  const items = document.querySelectorAll(".menu-item");
  const addToCartBtns = document.querySelectorAll(".add-to-cart");
  const searchInput = document.querySelector(".search-bar input");
  const searchBtn = document.getElementById("searchBtn");
  const searchResults = document.getElementById("searchResults");

  function getActiveMainFilter() {
    const activeMainBtn = document.querySelector(".main-filter-btn.active");
    return activeMainBtn ? activeMainBtn.dataset.filter : "all";
  }

  function getActiveSubFilter() {
    const activeSubBtn = document.querySelector(".sub-filter-btn.active");
    return activeSubBtn ? activeSubBtn.dataset.subfilter : "all";
  }

  function matchesCurrentFilters(item) {
    const activeMain = getActiveMainFilter();
    const activeSub = getActiveSubFilter();
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const itemCategory = (item.dataset.category || "").toLowerCase();
    const itemSub = (item.dataset.subcategory || "").toLowerCase();
    const itemName = item.querySelector("h3")?.textContent.toLowerCase() || "";
    const itemPriceText = item.querySelector(".price")?.textContent.toLowerCase() || "";

    let matchesMain = activeMain === "all" ? true : itemCategory === activeMain;
    let matchesSub = activeMain === "shawarma" ? (activeSub === "all" ? true : itemSub === activeSub) : true;
    let matchesSearch = true;

    if (searchTerm !== "") {
      matchesSearch =
        itemName.includes(searchTerm) ||
        itemPriceText.includes(searchTerm) ||
        itemCategory.includes(searchTerm) ||
        itemSub.includes(searchTerm);
    }

    return matchesMain && matchesSub && matchesSearch;
  }

  function applyFilters() {
    items.forEach((item) => {
      const show = matchesCurrentFilters(item);
      item.style.display = show ? "" : "none";
      item.style.opacity = show ? "1" : "0";
    });
  }

  function highlightItem(item) {
    item.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    item.style.outline = "3px solid #cc9900";
    item.style.transform = "scale(1.03)";

    setTimeout(() => {
      item.style.outline = "";
      item.style.transform = "";
    }, 1500);
  }

  function goToFirstMatch() {
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) return;

    applyFilters();

    let foundItem = null;
    items.forEach((item) => {
      if (!foundItem && matchesCurrentFilters(item)) {
        foundItem = item;
      }
    });

    if (foundItem) {
      highlightItem(foundItem);
    }
  }

  function renderSearchSuggestions() {
    if (!searchInput || !searchResults) return;

    const term = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (!term) {
      searchResults.classList.remove("show");
      return;
    }

    let found = false;

    items.forEach((item) => {
      const itemName = item.querySelector("h3")?.textContent || "";
      const itemImage =
        item.querySelector(":scope > img")?.src ||
        item.querySelector("img")?.src ||
        "https://via.placeholder.com/80x80?text=Food";

      if (matchesCurrentFilters(item) && itemName.toLowerCase().includes(term)) {
        found = true;

        const div = document.createElement("div");
        div.className = "search-item";
        div.innerHTML = `
          <img src="${itemImage}" alt="${itemName}">
          <span>${itemName}</span>
        `;

        div.addEventListener("click", () => {
          applyFilters();
          highlightItem(item);
          searchResults.classList.remove("show");
        });

        searchResults.appendChild(div);
      }
    });

    if (found) {
      searchResults.classList.add("show");
    } else {
      searchResults.classList.remove("show");
    }
  }

  mainFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mainFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      if (filter === "shawarma") {
        if (subFilterWrapper) subFilterWrapper.classList.add("show");
      } else {
        if (subFilterWrapper) subFilterWrapper.classList.remove("show");

        subFilterBtns.forEach((b) => b.classList.remove("active"));
        document.querySelector('.sub-filter-btn[data-subfilter="all"]')?.classList.add("active");
      }

      applyFilters();
      renderSearchSuggestions();
    });
  });

  subFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      subFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
      renderSearchSuggestions();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyFilters();
      renderSearchSuggestions();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const firstSuggestion = searchResults?.querySelector(".search-item");
        if (firstSuggestion) {
          firstSuggestion.click();
        } else {
          goToFirstMatch();
        }
      }
    });
  }

  if (searchBtn) {
    searchBtn.style.cursor = "pointer";
    searchBtn.addEventListener("click", () => {
      const firstSuggestion = searchResults?.querySelector(".search-item");
      if (firstSuggestion) {
        firstSuggestion.click();
      } else {
        goToFirstMatch();
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-bar") && searchResults) {
      searchResults.classList.remove("show");
    }
  });

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const menuItem = e.currentTarget.closest(".menu-item");
      if (!menuItem) return;

      if (!loggedIn) {
        alert("Please log in to continue.");
        window.location.href = "login.html";
        return;
      }

      const itemName = menuItem.querySelector("h3")?.textContent.trim() || "Item";
      const itemImage =
        menuItem.querySelector(":scope > img")?.src ||
        menuItem.querySelector("img")?.src ||
        "https://via.placeholder.com/300x200?text=No+Image";

      const priceEl = menuItem.querySelector(".price");
      const price = parseFloat((priceEl?.textContent || "").replace(/[^\d.]/g, "")) || 0;
      const baseText = priceEl?.textContent.trim() || "";

      if (!itemName || price <= 0) {
        alert("This item could not be added. Please refresh and try again.");
        return;
      }

      try {
        const payload = {
          restaurant_id: 2,
          product_name: itemName,
          product_image: itemImage,
          variant_text: baseText,
          addon_text: "No Add-on",
          price: price,
          quantity: 1
        };

        const res = await fetch(`${API}/cart_add.php`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Unable to add this item to your cart. Please try again.");
          return;
        }

        await updateCartBadge();

        btn.innerHTML = "Added!";
        btn.style.background = "#28a745";

        setTimeout(() => {
          btn.innerHTML = `
            <img src="https://raw.githubusercontent.com/damocles-24/IMAGES/refs/heads/main/shopping-cart.png" alt="Cart Icon">
            Add to Cart
          `;
          btn.style.background = "";
        }, 1500);

      } catch (error) {
        console.error("Add to cart error:", error);
        alert("Unable to add this item to your cart. Please try again.");
      }
    });
  });

  if (subFilterWrapper) subFilterWrapper.classList.remove("show");
  applyFilters();
  await updateCartBadge();
});