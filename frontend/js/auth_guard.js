(function () {
  const API = window.API || "/api";

  function redirectAccessDenied(message) {
    sessionStorage.setItem(
      "foodconnect_access_message",
      message || "You do not have permission to access this page."
    );

    window.location.href = "/frontend/html/login.html";
  }

  async function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles.map(r => String(r).toLowerCase())
      : [String(allowedRoles).toLowerCase()];

    try {
      const response = await fetch(`${API}/me.php`, {
        credentials: "include",
        cache: "no-store"
      });

      const data = await response.json();

      if (!data.logged_in) {
        redirectAccessDenied("Please log in to access this page.");
        return false;
      }

      const userRole = String(data.user?.role || "").toLowerCase();

      if (!roles.includes(userRole)) {
        redirectAccessDenied("You do not have permission to access this page.");
        return false;
      }

      document.documentElement.dataset.authReady = "true";
      return true;
    } catch (error) {
      console.error("Auth guard failed:", error);
      redirectAccessDenied("Unable to verify your access. Please log in again.");
      return false;
    }
  }

  window.requireRole = requireRole;
})();
