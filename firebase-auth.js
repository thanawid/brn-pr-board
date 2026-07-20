import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const config = window.BRN_AUTH_CONFIG;
const root = document.documentElement;
const gate = document.getElementById("auth-gate");
const appShell = document.querySelector(".app-shell");
const signInButton = document.getElementById("google-signin-button");
const retryButton = document.getElementById("auth-retry-button");
const statusBox = document.getElementById("auth-status");
const statusText = document.getElementById("auth-status-text");
const blockedBox = document.getElementById("auth-user-blocked");
const blockedPhoto = document.getElementById("blocked-user-photo");
const blockedName = document.getElementById("blocked-user-name");
const blockedEmail = document.getElementById("blocked-user-email");
const otherAccountButton = document.getElementById("use-other-account-button");
const accountArea = document.getElementById("account-area");
const accountButton = document.getElementById("account-button");
const accountMenu = document.getElementById("account-menu");
const accountPhoto = document.getElementById("account-photo");
const accountName = document.getElementById("account-name");
const accountRole = document.getElementById("account-role");
const accountMenuName = document.getElementById("account-menu-name");
const accountEmail = document.getElementById("account-email");
const signOutButton = document.getElementById("signout-button");

let auth;
let provider;
let workspaceLoaded = false;
let signingIn = false;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizedList(values) {
  return Array.isArray(values) ? values.map(normalizeEmail).filter(Boolean) : [];
}

function isAllowed(user) {
  const mode = config?.accessMode === "allowlist" ? "allowlist" : "google-only";
  if (mode === "google-only") return true;
  return normalizedList(config?.allowedEmails).includes(normalizeEmail(user?.email));
}

function isAdmin(user) {
  return normalizedList(config?.adminEmails).includes(normalizeEmail(user?.email));
}

function initials(name, email) {
  const source = String(name || email || "BRN").trim();
  return source.slice(0, 2).toUpperCase();
}

function avatarDataUri(label) {
  const text = encodeURIComponent(label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#51247a"/><stop offset="1" stop-color="#ff6f22"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#g)"/><text x="48" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="white">${text}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

function photoFor(user) {
  return user?.photoURL || avatarDataUri(initials(user?.displayName, user?.email));
}

function setStatus(message, state = "loading") {
  statusText.textContent = message;
  statusBox.dataset.state = state;
  statusBox.hidden = false;
}

function showSignedOut(message = "พร้อมเข้าสู่ระบบด้วยบัญชี Google") {
  root.classList.remove("auth-pending", "auth-authenticated", "auth-blocked");
  root.classList.add("auth-signed-out");
  gate.hidden = false;
  appShell.setAttribute("aria-hidden", "true");
  accountArea.hidden = true;
  blockedBox.hidden = true;
  signInButton.hidden = false;
  signInButton.disabled = false;
  retryButton.hidden = true;
  setStatus(message, "ready");
}

function showBlocked(user) {
  root.classList.remove("auth-pending", "auth-authenticated", "auth-signed-out");
  root.classList.add("auth-blocked");
  gate.hidden = false;
  appShell.setAttribute("aria-hidden", "true");
  accountArea.hidden = true;
  signInButton.hidden = true;
  retryButton.hidden = true;
  statusBox.hidden = true;
  blockedBox.hidden = false;
  blockedPhoto.src = photoFor(user);
  blockedPhoto.alt = user?.displayName ? `รูปของ ${user.displayName}` : "รูปบัญชี Google";
  blockedName.textContent = "บัญชีนี้ยังไม่ได้รับอนุญาต";
  blockedEmail.textContent = user?.email || "ไม่พบอีเมลของบัญชี";
}

function updateAccountUi(user) {
  const photo = photoFor(user);
  const role = isAdmin(user) ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน";
  accountPhoto.src = photo;
  accountPhoto.alt = user?.displayName ? `รูปของ ${user.displayName}` : "รูปผู้ใช้งาน";
  accountName.textContent = user?.displayName || user?.email || "ผู้ใช้งาน";
  accountRole.textContent = role;
  accountMenuName.textContent = user?.displayName || "ผู้ใช้งาน";
  accountEmail.textContent = user?.email || "";
  accountArea.hidden = false;
}

async function loadScript(src) {
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`โหลดไฟล์ ${src} ไม่สำเร็จ`));
    document.body.appendChild(script);
  });
}

async function loadWorkspace() {
  if (workspaceLoaded) return;
  workspaceLoaded = true;
  const files = [
    "./app.js",
    "./assets/vendor/three.min.js",
    "./stage3d.js",
    "./polish.js",
    "./responsive.js",
  ];
  for (const file of files) await loadScript(file);
}

async function showWorkspace(user) {
  root.classList.remove("auth-pending", "auth-signed-out", "auth-blocked");
  root.classList.add("auth-authenticated");
  gate.hidden = true;
  appShell.setAttribute("aria-hidden", "false");
  blockedBox.hidden = true;
  updateAccountUi(user);
  await loadWorkspace();
}

function readableError(error) {
  const code = String(error?.code || "");
  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return "ยกเลิกการเลือกบัญชีแล้ว กดเข้าสู่ระบบเมื่อต้องการลองอีกครั้ง";
  }
  if (code.includes("popup-blocked")) {
    return "เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ กรุณาอนุญาตป๊อปอัปแล้วลองใหม่";
  }
  if (code.includes("network-request-failed")) {
    return "เชื่อมต่ออินเทอร์เน็ตไม่สำเร็จ กรุณาตรวจสัญญาณแล้วลองใหม่";
  }
  if (code.includes("unauthorized-domain")) {
    return "โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication";
  }
  return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

async function startSignIn() {
  if (signingIn) return;
  signingIn = true;
  signInButton.disabled = true;
  setStatus("กำลังเปิดหน้าต่างเลือกบัญชี Google…", "loading");
  try {
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  } catch (error) {
    showSignedOut(readableError(error));
    statusBox.dataset.state = "error";
  } finally {
    signingIn = false;
    signInButton.disabled = false;
  }
}

function closeAccountMenu() {
  accountMenu.hidden = true;
  accountButton.setAttribute("aria-expanded", "false");
}

async function initializeAuthentication() {
  if (!config?.firebaseConfig) throw new Error("ไม่พบ Firebase configuration");
  const app = initializeApp(config.firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = "th";
  provider = new GoogleAuthProvider();
  await setPersistence(auth, browserLocalPersistence);

  onAuthStateChanged(auth, async (user) => {
    window.__BRN_AUTH_READY__ = true;
    if (!user) {
      showSignedOut();
      return;
    }
    if (!isAllowed(user)) {
      showBlocked(user);
      return;
    }
    try {
      await showWorkspace(user);
    } catch (error) {
      console.error(error);
      root.classList.remove("auth-authenticated");
      root.classList.add("auth-signed-out");
      gate.hidden = false;
      setStatus("เข้าสู่ระบบแล้ว แต่โหลดพื้นที่ทำงานไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ", "error");
      retryButton.hidden = false;
    }
  });
}

signInButton.addEventListener("click", startSignIn);
retryButton.addEventListener("click", () => location.reload());
otherAccountButton.addEventListener("click", async () => {
  await signOut(auth);
  showSignedOut("ออกจากบัญชีเดิมแล้ว กรุณาเลือกบัญชี Google ที่ได้รับอนุญาต");
  startSignIn();
});
signOutButton.addEventListener("click", async () => {
  closeAccountMenu();
  await signOut(auth);
});
accountButton.addEventListener("click", () => {
  const nextOpen = accountMenu.hidden;
  accountMenu.hidden = !nextOpen;
  accountButton.setAttribute("aria-expanded", String(nextOpen));
});
document.addEventListener("click", (event) => {
  if (!accountArea.contains(event.target)) closeAccountMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAccountMenu();
});

initializeAuthentication().catch((error) => {
  console.error(error);
  window.__BRN_AUTH_READY__ = true;
  root.classList.remove("auth-pending");
  root.classList.add("auth-signed-out");
  signInButton.hidden = true;
  retryButton.hidden = false;
  setStatus("ตั้งค่าระบบเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจไฟล์ auth-config.js", "error");
});
