(function () {
  "use strict";

  const API_BASE = "https://psgc.cloud/api";
  const NCR_CODE = "1300000000";
  const NCR_NAME = "Metro Manila (NCR)";
  const instances = new Map();
  let provincesPromise = null;

  function injectStyles() {
    if (document.getElementById("phAddressDropdownStyles")) return;
    const style = document.createElement("style");
    style.id = "phAddressDropdownStyles";
    style.textContent = `
      .ph-address-dropdown{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;width:100%;overflow:visible}
      .ph-address-dropdown.ph-address-layout-full{grid-column:1/-1;min-width:0}
      .ph-address-field{display:flex;flex-direction:column;gap:8px;min-width:0;position:relative;overflow:visible}
      .ph-address-field-full{grid-column:1/-1}
      .ph-search-select{position:relative;display:block;width:100%;overflow:visible}
      .ph-search-select-input{display:block;width:100%;height:48px;padding:0 44px 0 14px;border:1px solid #d7dbe1;border-radius:10px;background:#fff;box-sizing:border-box}
      .ph-search-select-arrow{position:absolute;right:15px;top:50%;transform:translateY(-50%);pointer-events:none}
      .ph-search-select-menu{position:absolute;z-index:2147483000;left:0;right:0;top:calc(100% + 7px);max-height:260px;overflow:auto;border:1px solid #e0e3e8;border-radius:12px;background:#fff;box-shadow:0 14px 35px rgba(31,41,55,.16);padding:6px}
      .ph-search-select-menu[hidden]{display:none!important}
      .ph-search-select-option{display:block;width:100%;padding:9px 11px;border-radius:8px;box-sizing:border-box;cursor:pointer}
      .ph-search-select-option:hover,.ph-search-select-option.active{background:#fff1eb;color:#d94f1e}
      @media(max-width:720px){.ph-address-dropdown{grid-template-columns:1fr}.ph-address-field-full,.ph-address-status,.ph-address-saved{grid-column:1}}
    `;
    document.head.appendChild(style);
  }

  function extractItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    for (const key of ["data", "items", "results", "provinces", "cities_municipalities", "barangays"]) {
      if (Array.isArray(payload[key])) return payload[key];
      if (payload[key] && Array.isArray(payload[key].data)) return payload[key].data;
    }
    return [];
  }

  function normalizeItem(item) {
    const code = String(item?.code ?? item?.psgc_code ?? item?.correspondence_code ?? "").trim();
    const name = String(item?.name ?? item?.area_name ?? item?.label ?? "").trim();
    return { code, name, raw: item };
  }

  async function fetchJson(urls) {
    let lastError;
    for (const url of urls) {
      try {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to load Philippine location data.");
  }

  async function getProvinces() {
    if (!provincesPromise) {
      provincesPromise = (async () => {
        const payload = await fetchJson([
          `${API_BASE}/provinces`,
          `${API_BASE}/v1/provinces?per_page=100`,
          "https://psgc.gitlab.io/api/provinces/"
        ]);
        const items = extractItems(payload).map(normalizeItem).filter(x => x.code && x.name);
        if (!items.some(x => x.code === NCR_CODE || /national capital region|metro manila/i.test(x.name))) {
          items.push({ code: NCR_CODE, name: NCR_NAME, raw: null });
        }
        items.sort((a, b) => a.name.localeCompare(b.name));
        return items;
      })();
    }
    return provincesPromise;
  }

  async function getLocalities(
    areaCode,
    areaName = ""
  ) {
    const cleanName =
      String(areaName || "")
        .trim();

    /*
     * PSGC Cloud v2 accepts either a code OR a name in the
     * {code_name} path. Use the human-readable province name
     * whenever it is available so FoodConnect is not dependent
     * on old-vs-new PSGC code formats.
     *
     * Official v2 form:
     * /api/v2/provinces/{code_name}/cities-municipalities
     */
    const encodedAreaName =
      encodeURIComponent(cleanName);

    const urls = [];

    if (cleanName) {
      urls.push(
        `${API_BASE}/v2/provinces/${encodedAreaName}/cities-municipalities`
      );
    }

    /*
     * Keep the legacy PSGC dataset as a compatibility fallback
     * for existing stored codes.
     */
    if (areaCode) {
      urls.push(
        `https://psgc.gitlab.io/api/provinces/${areaCode}/cities-municipalities/`
      );
    }

    const payload =
      await fetchJson(urls);

    return extractItems(payload)
      .map(normalizeItem)
      .filter(
        item =>
          item.code &&
          item.name
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );
  }

  async function getBarangays(
    localityCode,
    localityName = ""
  ) {
    const cleanName =
      String(localityName || "")
        .trim();

    /*
     * Official PSGC Cloud v2 form:
     * /api/v2/cities-municipalities/{code_name}/barangays
     *
     * Use the selected city/municipality name to avoid PSGC
     * code-version mismatches.
     */
    const encodedLocalityName =
      encodeURIComponent(cleanName);

    const urls = [];

    if (cleanName) {
      urls.push(
        `${API_BASE}/v2/cities-municipalities/${encodedLocalityName}/barangays`
      );
    }

    if (localityCode) {
      urls.push(
        `https://psgc.gitlab.io/api/cities-municipalities/${localityCode}/barangays/`
      );
    }

    const payload =
      await fetchJson(urls);

    return extractItems(payload)
      .map(normalizeItem)
      .filter(
        item =>
          item.code &&
          item.name
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );
  }

  function fillSelect(select, items, placeholder, selectedName) {
    select.innerHTML = "";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item.code;
      option.textContent = item.name;
      option.dataset.name = item.name;
      option.dataset.code = item.code;
      if (selectedName && item.name.toLowerCase() === selectedName.toLowerCase()) option.selected = true;
      select.appendChild(option);
    });
    refreshSearchableSelect(select);
  }

  function selectedName(select) {
    const option = select.options[select.selectedIndex];
    return option?.dataset?.name || option?.textContent?.trim() || "";
  }


  const searchableSelects = new WeakMap();

  function makeSearchableSelect(select) {
    if (!select) return null;
    if (searchableSelects.has(select)) return searchableSelects.get(select);

    const wrapper = document.createElement("div");
    wrapper.className = "ph-search-select";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "ph-search-select-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");

    const arrow = document.createElement("span");
    arrow.className = "ph-search-select-arrow";
    arrow.textContent = "▼";
    const menu = document.createElement("div");
    menu.className = "ph-search-select-menu";
    menu.hidden = true;
    menu.setAttribute("role", "listbox");

    select.insertAdjacentElement("afterend", wrapper);
    wrapper.append(input, arrow, menu);
    select.style.display = "none";
    select.setAttribute("aria-hidden", "true");

    const state = { select, wrapper, input, menu, filtered: [], activeIndex: -1 };
    searchableSelects.set(select, state);

    function realOptions() {
      return Array.from(select.options).filter(o => o.value !== "");
    }

    function placeholderText() {
      const blank = Array.from(select.options).find(o => o.value === "");
      return blank?.textContent?.trim() || "Type to search...";
    }

    function syncFromSelect() {
      input.disabled = !!select.disabled;
      input.placeholder = placeholderText();
      const selected = select.options[select.selectedIndex];
      input.value = selected && selected.value !== "" ? selected.textContent.trim() : "";
    }

    function closeMenu() {
      menu.hidden = true;
      input.setAttribute("aria-expanded", "false");
      state.activeIndex = -1;
    }

    function choose(option) {
      if (!option) return;
      select.value = option.value;
      input.value = option.textContent.trim();
      closeMenu();
      select.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
    }

    function renderMenu(query) {
      const term = String(query || "").trim().toLowerCase();
      state.filtered = realOptions().filter(option => option.textContent.toLowerCase().includes(term));
      state.activeIndex = -1;
      menu.innerHTML = "";
      if (!state.filtered.length) {
        const empty = document.createElement("div");
        empty.className = "ph-search-select-empty";
        empty.textContent = "No matching Philippine location";
        menu.appendChild(empty);
      } else {
        state.filtered.forEach(option => {
          const item = document.createElement("div");
          item.className = "ph-search-select-option";
          item.setAttribute("role", "option");
          item.setAttribute("tabindex", "-1");
          item.textContent = option.textContent;
          item.addEventListener("mousedown", e => e.preventDefault());
          item.addEventListener("click", () => choose(option));
          menu.appendChild(item);
        });
      }
      menu.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    input.addEventListener("focus", () => {
      if (!input.disabled) renderMenu(input.value);
    });
    input.addEventListener("click", () => {
      if (!input.disabled) renderMenu(input.value);
    });
    input.addEventListener("input", () => {
      const current = select.options[select.selectedIndex];
      if (current && current.value !== "" && current.textContent.trim() !== input.value) {
        select.value = "";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      renderMenu(input.value);
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (menu.hidden && (e.key === "ArrowDown" || e.key === "Enter")) {
        renderMenu(input.value);
      }
      const buttons = Array.from(menu.querySelectorAll(".ph-search-select-option"));
      if (!buttons.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.activeIndex = Math.min(state.activeIndex + 1, buttons.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        state.activeIndex = Math.max(state.activeIndex - 1, 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const idx = state.activeIndex >= 0 ? state.activeIndex : 0;
        choose(state.filtered[idx]);
        return;
      } else {
        return;
      }
      buttons.forEach((b, i) => b.classList.toggle("active", i === state.activeIndex));
      buttons[state.activeIndex]?.scrollIntoView({ block: "nearest" });
    });
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        const exact = realOptions().find(o => o.textContent.trim().toLowerCase() === input.value.trim().toLowerCase());
        if (exact && select.value !== exact.value) choose(exact);
        if (!select.value) input.value = "";
        closeMenu();
      }, 120);
    });
    select.addEventListener("change", syncFromSelect);

    const observer = new MutationObserver(syncFromSelect);
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    syncFromSelect();
    return state;
  }

  function refreshSearchableSelect(select) {
    const state = makeSearchableSelect(select);
    if (!state) return;
    state.input.disabled = !!select.disabled;
    const blank = Array.from(select.options).find(o => o.value === "");
    state.input.placeholder = blank?.textContent?.trim() || "Type to search...";
    const selected = select.options[select.selectedIndex];
    state.input.value = selected && selected.value !== "" ? selected.textContent.trim() : "";
  }

  function cleanSavedAddress(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function composeAddress(instance) {
    const area = selectedName(instance.areaSelect);
    const locality = selectedName(instance.localitySelect);
    const barangay = selectedName(instance.barangaySelect);
    const street = instance.streetInput.value.trim();
    if (!area || !locality || !barangay) return "";
    const areaText = area === NCR_NAME ? "Metro Manila" : area;
    return [street, barangay, locality, areaText, "Philippines"].filter(Boolean).join(", ");
  }

  function updateTarget(instance) {
    const value = composeAddress(instance);
    if (value) {
      instance.target.value = value;
      instance.target.dataset.phAddressGenerated = "1";
      instance.lastObservedValue = value;
      instance.savedBox.hidden = true;
      instance.target.dispatchEvent(new Event("input", { bubbles: true }));
      instance.target.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function setStatus(instance, message, isError) {
    instance.status.textContent = message || "";
    instance.status.classList.toggle("error", !!isError);
  }

  function makeField(labelText, element, full) {
    const box = document.createElement("div");
    box.className = `ph-address-field${full ? " ph-address-field-full" : ""}`;
    const label = document.createElement("label");
    label.textContent = labelText;
    if (element.id) label.htmlFor = element.id;
    box.append(label, element);
    return box;
  }

  async function enhance(target, options = {}) {
    if (!target || target.dataset.phAddressEnhanced === "1") return instances.get(target) || null;
    injectStyles();
    target.dataset.phAddressEnhanced = "1";

    const wasRequired = target.required || target.dataset.phAddressRequired === "1";
    target.required = false;
    target.setAttribute("aria-hidden", "true");
    target.style.display = "none";

    const wrap = document.createElement("div");
    wrap.className = "ph-address-dropdown";
    wrap.dataset.phAddressUi = target.id || "address";

    const country = document.createElement("div");
    country.className = "ph-address-country ph-address-field-full";
    country.innerHTML = "<strong>Philippines</strong><span>Country is fixed</span>";

    const areaSelect = document.createElement("select");
    areaSelect.id = `${target.id || "phAddress"}ProvinceArea`;
    areaSelect.disabled = true;
    const localitySelect = document.createElement("select");
    localitySelect.id = `${target.id || "phAddress"}CityMunicipality`;
    localitySelect.disabled = true;
    const barangaySelect = document.createElement("select");
    barangaySelect.id = `${target.id || "phAddress"}Barangay`;
    barangaySelect.disabled = true;
    const streetInput = document.createElement("input");
    streetInput.type = "text";
    streetInput.id = `${target.id || "phAddress"}StreetDetails`;
    streetInput.maxLength = 180;
    streetInput.autocomplete = "street-address";
    streetInput.placeholder = "House / building / street / subdivision (optional)";

    const status = document.createElement("div");
    status.className = "ph-address-status";
    status.setAttribute("role", "status");
    const savedBox = document.createElement("div");
    savedBox.className = "ph-address-saved";
    savedBox.hidden = true;

    wrap.append(
      country,
      makeField("Province / Area", areaSelect),
      makeField("City / Municipality", localitySelect),
      makeField("Barangay", barangaySelect),
      makeField("House / Building / Street details", streetInput),
      status,
      savedBox
    );
    makeSearchableSelect(areaSelect);
    makeSearchableSelect(localitySelect);
    makeSearchableSelect(barangaySelect);
    let insertionAnchor = target;
    const enclosingFieldLabel = target.closest("label.field");
    const inputWrapper = target.parentElement?.matches?.(".input-wrapper, .input-wrap")
      ? target.parentElement
      : null;

    if (enclosingFieldLabel) {
      if (enclosingFieldLabel.classList.contains("field-full")) {
        wrap.classList.add("ph-address-layout-full");
      }
      enclosingFieldLabel.style.display = "none";
      insertionAnchor = enclosingFieldLabel;
    } else if (inputWrapper) {
      inputWrapper.style.display = "none";
      insertionAnchor = inputWrapper;
    }

    insertionAnchor.insertAdjacentElement("afterend", wrap);

    const instance = { target, wrap, areaSelect, localitySelect, barangaySelect, streetInput, status, savedBox, required: wasRequired, lastObservedValue: cleanSavedAddress(target.value) };
    instances.set(target, instance);

    fillSelect(areaSelect, [], "Loading provinces / areas...");
    fillSelect(localitySelect, [], "Select province / area first");
    fillSelect(barangaySelect, [], "Select city / municipality first");

    const original = cleanSavedAddress(target.value);
    if (original) {
      savedBox.textContent = `Current saved address: ${original}`;
      savedBox.hidden = false;
    }

    try {
      const provinces = await getProvinces();
      fillSelect(areaSelect, provinces, "Select province / area");
      areaSelect.disabled = false;
      setStatus(instance, "Select your Philippine location from the dropdowns.", false);
    } catch (error) {
      areaSelect.disabled = true;
      setStatus(instance, "Philippine address list could not be loaded. Check the internet connection and reload the page.", true);
    }

    areaSelect.addEventListener("change", async () => {
      fillSelect(localitySelect, [], areaSelect.value ? "Loading cities / municipalities..." : "Select province / area first");
      fillSelect(barangaySelect, [], "Select city / municipality first");
      localitySelect.disabled = true;
      barangaySelect.disabled = true;
      if (!areaSelect.value) return;
      setStatus(instance, "Loading cities and municipalities...", false);
      try {
        const items = await getLocalities(
          areaSelect.value,
          selectedName(areaSelect)
        );
        fillSelect(localitySelect, items, "Select city / municipality");
        localitySelect.disabled = false;
        setStatus(instance, "", false);
      } catch (error) {
        setStatus(instance, "Unable to load cities / municipalities. Please try again.", true);
      }
    });

    localitySelect.addEventListener("change", async () => {
      fillSelect(barangaySelect, [], localitySelect.value ? "Loading barangays..." : "Select city / municipality first");
      barangaySelect.disabled = true;
      if (!localitySelect.value) return;
      setStatus(instance, "Loading barangays...", false);
      try {
        const items = await getBarangays(
          localitySelect.value,
          selectedName(localitySelect)
        );
        fillSelect(barangaySelect, items, "Select barangay");
        barangaySelect.disabled = false;
        setStatus(instance, "", false);
      } catch (error) {
        setStatus(instance, "Unable to load barangays. Please try again.", true);
      }
    });

    barangaySelect.addEventListener("change", () => updateTarget(instance));
    streetInput.addEventListener("input", () => updateTarget(instance));

    // Keep the current saved value visible when existing page logic loads it after this helper.
    instance.valueWatcher = window.setInterval(() => {
      const current = cleanSavedAddress(target.value);
      if (current !== instance.lastObservedValue && target.dataset.phAddressGenerated !== "1") {
        instance.lastObservedValue = current;
        savedBox.textContent = current ? `Current saved address: ${current}` : "";
        savedBox.hidden = !current;
      }
      target.dataset.phAddressGenerated = "0";
    }, 700);

    return instance;
  }

  function validate(targetOrId) {
    const target = typeof targetOrId === "string" ? document.getElementById(targetOrId) : targetOrId;
    const instance = instances.get(target);
    if (!instance) return !!cleanSavedAddress(target?.value);
    const generated = composeAddress(instance);
    const existing = cleanSavedAddress(target.value);
    if (!instance.required) return true;
    if (generated || existing) return true;
    setStatus(instance, "Please select province / area, city / municipality, and barangay.", true);
    instance.areaSelect.focus();
    return false;
  }


  async function bindCascadingSelects(config) {
    const areaSelect = typeof config.areaSelect === "string" ? document.getElementById(config.areaSelect) : config.areaSelect;
    const localitySelect = typeof config.localitySelect === "string" ? document.getElementById(config.localitySelect) : config.localitySelect;
    const barangaySelect = typeof config.barangaySelect === "string" ? document.getElementById(config.barangaySelect) : config.barangaySelect;
    if (!areaSelect || !localitySelect || !barangaySelect) return null;
    if (areaSelect.dataset.phCascadeBound === "1") return { areaSelect, localitySelect, barangaySelect };
    areaSelect.dataset.phCascadeBound = "1";
    makeSearchableSelect(areaSelect);
    makeSearchableSelect(localitySelect);
    makeSearchableSelect(barangaySelect);

    const setNameOptions = (select, items, placeholder, selected) => {
      select.innerHTML = "";
      const first = document.createElement("option");
      first.value = "";
      first.textContent = placeholder;
      select.appendChild(first);
      items.forEach(item => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.code = item.code;
        if (selected && item.name.toLowerCase() === selected.toLowerCase()) option.selected = true;
        select.appendChild(option);
      });
      refreshSearchableSelect(select);
    };

    areaSelect.disabled = true;
    localitySelect.disabled = true;
    barangaySelect.disabled = true;
    setNameOptions(areaSelect, [], "Loading provinces / areas...");
    setNameOptions(localitySelect, [], "Select province / area first");
    setNameOptions(barangaySelect, [], "Select city / municipality first");

    try {
      const provinces = await getProvinces();
      setNameOptions(areaSelect, provinces, "Select province / area");
      areaSelect.disabled = false;
    } catch (e) {
      setNameOptions(areaSelect, [], "Unable to load Philippine locations");
      return { areaSelect, localitySelect, barangaySelect, error: e };
    }

    areaSelect.addEventListener("change", async () => {
      const code = areaSelect.options[areaSelect.selectedIndex]?.dataset?.code || "";
      setNameOptions(localitySelect, [], code ? "Loading cities / municipalities..." : "Select province / area first");
      setNameOptions(barangaySelect, [], "Select city / municipality first");
      localitySelect.disabled = true;
      barangaySelect.disabled = true;
      if (!code) return;
      try {
        const items = await getLocalities(
          code,
          areaSelect.value
        );
        setNameOptions(localitySelect, items, "Select city / municipality");
        localitySelect.disabled = false;
      } catch (e) {
        setNameOptions(localitySelect, [], "Unable to load cities / municipalities");
      }
    });

    localitySelect.addEventListener("change", async () => {
      const code = localitySelect.options[localitySelect.selectedIndex]?.dataset?.code || "";
      setNameOptions(barangaySelect, [], code ? "Loading barangays..." : "Select city / municipality first");
      barangaySelect.disabled = true;
      if (!code) return;
      try {
        const items = await getBarangays(
          code,
          localitySelect.value
        );
        setNameOptions(barangaySelect, items, "Select barangay");
        barangaySelect.disabled = false;
      } catch (e) {
        setNameOptions(barangaySelect, [], "Unable to load barangays");
      }
    });

    return { areaSelect, localitySelect, barangaySelect };
  }

  async function setCascadingValues(config) {
    const bound = await bindCascadingSelects(config);
    if (!bound) return;
    const { areaSelect, localitySelect, barangaySelect } = bound;
    const areaName = String(config.areaName || "").trim();
    const localityName = String(config.localityName || "").trim();
    const barangayName = String(config.barangayName || "").trim();
    if (!areaName) return;

    const areaOption = Array.from(areaSelect.options).find(o => o.value.toLowerCase() === areaName.toLowerCase() || (/metro manila|national capital region/i.test(areaName) && /metro manila/i.test(o.value)));
    if (!areaOption) return;
    areaSelect.value = areaOption.value;
    const areaCode = areaOption.dataset.code || "";
    if (!areaCode) return;

    try {
      const localities = await getLocalities(
        areaCode,
        areaOption.value
      );
      const setNameOptions = (select, items, placeholder, selected) => {
        select.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
          const option = document.createElement("option");
          option.value = item.name;
          option.textContent = item.name;
          option.dataset.code = item.code;
          if (selected && item.name.toLowerCase() === selected.toLowerCase()) option.selected = true;
          select.appendChild(option);
        });
        refreshSearchableSelect(select);
      };
      setNameOptions(localitySelect, localities, "Select city / municipality", localityName);
      localitySelect.disabled = false;
      const localityOption = Array.from(localitySelect.options).find(o => o.value.toLowerCase() === localityName.toLowerCase());
      const localityCode = localityOption?.dataset?.code || "";
      if (!localityCode) return;
      const barangays = await getBarangays(
        localityCode,
        localityOption.value
      );
      setNameOptions(barangaySelect, barangays, "Select barangay", barangayName);
      barangaySelect.disabled = false;
    } catch (e) {
      // Keep the address form usable even if restoring an old saved value fails.
    }
  }

function normalizeLocationName(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\bprovince\s+of\b/g, " ")
        .replace(/\bprovince\b/g, " ")
        .replace(/\bcity\s+of\b/g, " ")
        .replace(/\bcity\b/g, " ")
        .replace(/\bmunicipality\s+of\b/g, " ")
        .replace(/\bmunicipality\b/g, " ")
        .replace(/\bmetro manila\b/g, "national capital region")
        .replace(/\bncr\b/g, "national capital region")
        .replace(/\bph\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

  function findLocationOption(select, wantedName) {
    const wanted =
      normalizeLocationName(wantedName);

    if (!wanted) {
      return null;
    }

    const options =
      Array
        .from(select.options)
        .filter(
          option =>
            option.value !== ""
        );

    /*
     * 1) Safest match first:
     * exact normalized visible label.
     */
    const exactLabelMatch =
      options.find(
        option =>
          normalizeLocationName(
            option.textContent
          ) === wanted
      );

    if (exactLabelMatch) {
      return exactLabelMatch;
    }

    /*
     * 2) Some address datasets attach a small suffix/prefix
     * to the official name. Allow a partial name match ONLY
     * when it resolves to exactly one option.
     *
     * Example:
     *   Geoapify: "Poblacion"
     *   PSGC option: "Poblacion (Zone ...)"
     *
     * We do not auto-select if several barangays match the
     * same short name.
     */
    const partialMatches =
      options.filter(option => {
        const optionName =
          normalizeLocationName(
            option.textContent
          );

        if (!optionName) {
          return false;
        }

        return (
          optionName === wanted ||
          optionName.startsWith(
            `${wanted} `
          ) ||
          optionName.endsWith(
            ` ${wanted}`
          ) ||
          wanted.startsWith(
            `${optionName} `
          )
        );
      });

    if (partialMatches.length === 1) {
      return partialMatches[0];
    }

    return null;
  }

  async function setEnhancedValues(targetOrId, config = {}) {
    const target =
      typeof targetOrId === "string"
        ? document.getElementById(targetOrId)
        : targetOrId;

    if (!target) {
      return {
        success: false,
        reason: "target_missing"
      };
    }

    let instance =
      instances.get(target) || null;

    if (!instance) {
      instance = await enhance(target);
    }

    if (!instance) {
      return {
        success: false,
        reason: "address_ui_unavailable"
      };
    }

    const areaName =
      String(
        config.areaName ||
        config.provinceName ||
        ""
      ).trim();

    const localityName =
      String(
        config.localityName ||
        config.cityName ||
        ""
      ).trim();

    const barangayName =
      String(
        config.barangayName ||
        ""
      ).trim();

    const streetDetails =
      String(
        config.streetDetails ||
        config.road ||
        ""
      ).trim();

    if (streetDetails) {
      instance.streetInput.value =
        streetDetails;
    }

    if (!areaName) {
      setStatus(
        instance,
        "Location found. Please select your province / area.",
        true
      );

      return {
        success: false,
        areaMatched: false,
        localityMatched: false,
        barangayMatched: false
      };
    }

    try {
      const provinces =
        await getProvinces();

      fillSelect(
        instance.areaSelect,
        provinces,
        "Select province / area"
      );

      instance.areaSelect.disabled =
        false;

      const areaOption =
        findLocationOption(
          instance.areaSelect,
          areaName
        );

      if (!areaOption) {
        refreshSearchableSelect(
          instance.areaSelect
        );

        setStatus(
          instance,
          "Location found, but the province / area could not be matched automatically. Please select it.",
          true
        );

        return {
          success: false,
          areaMatched: false,
          localityMatched: false,
          barangayMatched: false
        };
      }

      instance.areaSelect.value =
        areaOption.value;

      refreshSearchableSelect(
        instance.areaSelect
      );

      const areaCode =
        areaOption.dataset.code ||
        areaOption.value ||
        "";

      const localities =
        areaCode
          ? await getLocalities(
              areaCode,
              areaOption.textContent || areaName
            )
          : [];

      fillSelect(
        instance.localitySelect,
        localities,
        "Select city / municipality"
      );

      instance.localitySelect.disabled =
        false;

      const localityOption =
        findLocationOption(
          instance.localitySelect,
          localityName
        );

      if (!localityOption) {
        fillSelect(
          instance.barangaySelect,
          [],
          "Select city / municipality first"
        );

        instance.barangaySelect.disabled =
          true;

        refreshSearchableSelect(
          instance.localitySelect
        );

        setStatus(
          instance,
          "Province / area was filled. Please select the city / municipality.",
          true
        );

        return {
          success: false,
          areaMatched: true,
          localityMatched: false,
          barangayMatched: false
        };
      }

      instance.localitySelect.value =
        localityOption.value;

      refreshSearchableSelect(
        instance.localitySelect
      );

      const localityCode =
        localityOption.dataset.code ||
        localityOption.value ||
        "";

      const barangays =
        localityCode
          ? await getBarangays(
              localityCode,
              localityOption.textContent || localityName
            )
          : [];

      fillSelect(
        instance.barangaySelect,
        barangays,
        "Select barangay"
      );

      instance.barangaySelect.disabled =
        false;

      const barangayOption =
        findLocationOption(
          instance.barangaySelect,
          barangayName
        );

      if (barangayOption) {
        instance.barangaySelect.value =
          barangayOption.value;

        refreshSearchableSelect(
          instance.barangaySelect
        );

        updateTarget(instance);

        setStatus(
          instance,
          "Address fields were filled from your current location.",
          false
        );

        return {
          success: true,
          areaMatched: true,
          localityMatched: true,
          barangayMatched: true
        };
      }

      refreshSearchableSelect(
        instance.barangaySelect
      );

      /*
       * Do not invent a barangay when Geoapify cannot map it exactly.
       * Province, city, street and GPS stay filled; customer only needs
       * to choose the barangay.
       */
      setStatus(
        instance,
        "Province / area and city were filled. Please select your barangay to complete the address.",
        false
      );

      return {
        success: false,
        areaMatched: true,
        localityMatched: true,
        barangayMatched: false
      };

    } catch (error) {
      console.error(
        "PH address auto-fill error:",
        error
      );

      setStatus(
        instance,
        "Your location was found, but the Philippine address lists could not be loaded. Please select the address manually.",
        true
      );

      return {
        success: false,
        reason: "lookup_failed"
      };
    }
  }


  function autoEnhance(root) {
    (root || document).querySelectorAll?.("[data-ph-address]:not([data-ph-address-enhanced='1'])").forEach(el => enhance(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    autoEnhance(document);
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.("[data-ph-address]:not([data-ph-address-enhanced='1'])")) enhance(node);
          autoEnhance(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.PHAddressDropdown = {
    enhance,
    validate,
    autoEnhance,
    bindCascadingSelects,
    setCascadingValues,
    setEnhancedValues,
    makeSearchableSelect
  };
})();
