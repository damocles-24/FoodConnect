/*
 * FoodConnect service area (City of Alaminos, Pangasinan).
 *
 * Loads the official boundary + barangay list from the API
 * (api/get_service_area.php -> api/config/service_area_alaminos.json),
 * the same data the server uses, and gives instant client-side checks.
 * The server re-validates every save / quote / checkout.
 */
(function () {
  "use strict";

  const API_BASE = window.API || "/api";
  const PROVINCE = "Pangasinan";
  const CITY = "City of Alaminos";

  const FALLBACK_MESSAGES = {
    area: {
      title: "Location Outside Service Area",
      message:
        "FoodConnect currently accepts delivery locations within City of Alaminos, Pangasinan only. Please select a location within City of Alaminos to continue."
    },
    gps: {
      title: "Location Not Supported",
      message:
        "Your current location is outside FoodConnect's service area. FoodConnect currently serves City of Alaminos, Pangasinan only. Please choose a delivery location within City of Alaminos."
    },
    address: {
      title: "Address Not Supported",
      message:
        "The address you entered is outside the FoodConnect service area. Please enter an address within City of Alaminos, Pangasinan."
    },
    restaurant: {
      title: "Location Outside Service Area",
      message:
        "FoodConnect currently operates only in City of Alaminos, Pangasinan. Please choose a restaurant location within City of Alaminos."
    },
    gps_near: {
      title: "Location Near Service Area Boundary",
      message:
        "Your GPS location is just outside the City of Alaminos boundary, possibly due to GPS accuracy. Please tap your exact delivery location inside the highlighted City of Alaminos area on the map."
    },
    unavailable: {
      title: "Location Check Unavailable",
      message:
        "FoodConnect could not verify your location right now. Please check your internet connection and try again."
    }
  };

  let configPromise = null;
  let loadedConfig = null;

  function key(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\b(brgy|barangay|bgy)\b\.?/g, " ")
      .replace(/\bsta\b\.?/g, "santa")
      .replace(/[^a-z0-9]+/g, "");
  }

  function computeBbox(boundary) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    (boundary?.coordinates || []).forEach((polygon) => {
      (polygon || []).forEach((ring) => {
        (ring || []).forEach(([lng, lat]) => {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        });
      });
    });
    return [minLat, minLng, maxLat, maxLng];
  }

  function load() {
    if (loadedConfig) {
      return Promise.resolve(loadedConfig);
    }

    if (!configPromise) {
      configPromise = fetch(`${API_BASE}/get_service_area.php`, {
        headers: { Accept: "application/json" }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => null);
          if (!response.ok || !data || data.success !== true || !data.boundary) {
            throw new Error(
              data?.message || FALLBACK_MESSAGES.unavailable.message
            );
          }
          data._bbox = computeBbox(data.boundary);
          // Max edge tolerance, used only for device GPS (map/search are strict).
          data.gps_tolerance_meters = Math.max(
            0,
            Math.min(100, Number(data.gps_tolerance_meters) || 0)
          );
          loadedConfig = data;
          return data;
        })
        .catch((error) => {
          // Allow a later retry (e.g. after the connection comes back).
          configPromise = null;
          throw error;
        });
    }

    return configPromise;
  }

  function pointInRing(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (
        (yi > lat) !== (yj > lat) &&
        lng < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  function distanceToBoundaryMeters(config, lat, lng) {
    const mLat = 111320;
    const mLng = 111320 * Math.cos((lat * Math.PI) / 180);
    let best = Infinity;
    (config.boundary.coordinates || []).forEach((polygon) => {
      (polygon || []).forEach((ring) => {
        for (let i = 0; i < ring.length - 1; i++) {
          const ax = (ring[i][0] - lng) * mLng;
          const ay = (ring[i][1] - lat) * mLat;
          const bx = (ring[i + 1][0] - lng) * mLng;
          const by = (ring[i + 1][1] - lat) * mLat;
          const dx = bx - ax, dy = by - ay;
          const len = dx * dx + dy * dy;
          const t = len > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0;
          const px = ax + t * dx, py = ay + t * dy;
          best = Math.min(best, Math.sqrt(px * px + py * py));
        }
      });
    });
    return best;
  }

  /*
   * UX only: how far outside the edge a GPS fix may be to get the friendlier
   * "near the boundary" message. Never used to accept a location; the
   * service area itself is strict (0 m), exactly like the server.
   */
  function toleranceForSource(config, source, accuracyMeters) {
    if (String(source || "").toLowerCase() !== "gps") return 0;
    const max = Number(config.gps_tolerance_meters) || 0;
    const accuracy = Number(accuracyMeters);
    return Number.isFinite(accuracy) && accuracy > 0 ? Math.min(max, accuracy) : max;
  }

  function checkWithConfig(config, latitude, longitude, nearToleranceMeters = 0) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const result = { validCoordinates: false, inside: false, allowed: false, nearBoundary: false, distanceMeters: null };

    if (
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180
    ) {
      return result;
    }

    result.validCoordinates = true;

    const tolerance = Math.max(
      0,
      Math.min(Number(config.gps_tolerance_meters) || 0, Number(nearToleranceMeters) || 0)
    );
    const [minLat, minLng, maxLat, maxLng] = config._bbox;
    const padLat = tolerance / 111320;
    const padLng = tolerance / (111320 * Math.max(0.1, Math.cos((lat * Math.PI) / 180)));

    if (
      lat < minLat - padLat || lat > maxLat + padLat ||
      lng < minLng - padLng || lng > maxLng + padLng
    ) {
      return result;
    }

    for (const polygon of config.boundary.coordinates || []) {
      if (!polygon?.length || !pointInRing(lng, lat, polygon[0])) continue;
      let inHole = false;
      for (let h = 1; h < polygon.length; h++) {
        if (pointInRing(lng, lat, polygon[h])) { inHole = true; break; }
      }
      if (!inHole) {
        result.inside = true;
        result.allowed = true;
        return result;
      }
    }

    if (tolerance > 0) {
      const distance = distanceToBoundaryMeters(config, lat, lng);
      result.distanceMeters = Math.round(distance * 10) / 10;
      // Still NOT allowed: only flags a near miss for a friendlier message.
      result.nearBoundary = distance <= tolerance;
    }

    return result;
  }

  /* options: { source: "gps" | "area" | "address", accuracy: meters } */
  async function check(latitude, longitude, options = {}) {
    const config = await load();
    return checkWithConfig(
      config,
      latitude,
      longitude,
      toleranceForSource(config, options.source, options.accuracy)
    );
  }

  function matchBarangay(name, list) {
    const wanted = key(name);
    if (!wanted) return "";
    const barangays = list || loadedConfig?.barangays || [];
    return barangays.find((item) => key(item) === wanted) || "";
  }

  function getMessage(context) {
    const fromServer = loadedConfig?.messages?.[context];
    return fromServer || FALLBACK_MESSAGES[context] || FALLBACK_MESSAGES.area;
  }

  /* Draws the service-area outline on an existing Leaflet map. */
  async function addBoundaryLayer(map) {
    if (!map || typeof window.L === "undefined") return null;
    try {
      const config = await load();
      return window.L.geoJSON(config.boundary, {
        interactive: false,
        style: {
          color: "#f78021",
          weight: 2,
          opacity: 0.85,
          fillColor: "#f78021",
          fillOpacity: 0.04,
          dashArray: "6 6"
        }
      }).addTo(map);
    } catch (error) {
      console.warn("FoodConnect service-area outline could not be drawn:", error);
      return null;
    }
  }

  window.FCServiceArea = {
    PROVINCE,
    CITY,
    LABEL: `${CITY}, ${PROVINCE}`,
    load,
    check,
    checkWithConfig,
    toleranceForSource,
    matchBarangay,
    getMessage,
    addBoundaryLayer,
    normalizeKey: key
  };
})();
