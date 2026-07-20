(() => {
  document.documentElement.classList.add("auth-pending");
  window.__BRN_AUTH_READY__ = false;

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(() => {
      if (window.__BRN_AUTH_READY__) return;
      const status = document.getElementById("auth-status");
      const statusText = document.getElementById("auth-status-text");
      const retry = document.getElementById("auth-retry-button");
      if (status) status.dataset.state = "error";
      if (statusText) statusText.textContent = "เชื่อมต่อระบบเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่";
      if (retry) retry.hidden = false;
    }, 15000);
  });
})();
