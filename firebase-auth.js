import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const config = window.BRN_AUTH_CONFIG;
const root = document.documentElement;
const gate = document.getElementById("auth-gate");
const appShell = document.querySelector(".app-shell");
const loginOptions = document.getElementById("auth-login-options");
const signInButton = document.getElementById("google-signin-button");
const staffForm = document.getElementById("staff-login-form");
const staffUsername = document.getElementById("staff-username");
const staffPassword = document.getElementById("staff-password");
const staffSignInButton = document.getElementById("staff-signin-button");
const togglePasswordButton = document.getElementById("toggle-password");
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

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function normalizedList(values) {
  return Array.isArray(values) ? values.map(normalizeEmail).filter(Boolean) : [];
}

function internalDomain() {
  return String(config?.internalEmailDomain || "brn.local").trim().toLowerCase();
}

function staffAccounts() {
  return Array.isArray(config?.staffAccounts) ? config.staffAccounts : [];
}

function staffAccountByUsername(username) {
  const normalized = normalizeUsername(username);
  return staffAccounts().find((account) => normalizeUsername(account?.username) === normalized) || null;
}

function staffAccountByEmail(email) {
  const normalized = normalizeEmail(email);
  return staffAccounts().find((account) => `${normalizeUsername(account?.username)}@${internalDomain()}` === normalized) || null;
}

function emailForUsername(username) {
  return `${normalizeUsername(username)}@${internalDomain()}`;
}

function roleFor(user) {
  const email = normalizeEmail(user?.email);
  if (normalizedList(config?.adminEmails).includes(email)) return "admin";
  if (staffAccountByEmail(email)) return "staff";
  return "blocked";
}

function displayNameFor(user) {
  const staff = staffAccountByEmail(user?.email);
  if (staff) return staff.displayName || String(staff.username).toUpperCase();
  return user?.displayName || user?.email || "ผู้ใช้งาน";
}

function initials(name, email) {
  const source = String(name || email || "BRN").trim();
  const username = normalizeUsername(String(email || "").split("@")[0]);
  if (/^pr\d+/.test(username)) return username.replace(/^pr/, "PR ");
  const ascii = source.match(/[A-Za-z0-9]+/g)?.join("").slice(0, 2);
  return (ascii || source.slice(0, 2)).toUpperCase();
}

function escapeSvgText(value) {
  return String(value || "PR").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function avatarDataUri(label) {
  const text = escapeSvgText(label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#51247a"/><stop offset="1" stop-color="#ff6f22"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#g)"/><text x="48" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="white">${text}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function photoFor(user) {
  const name = displayNameFor(user);
  return String(user?.photoURL || "").trim() || avatarDataUri(initials(name, user?.email));
}

function setAvatarImage(img, user, name = displayNameFor(user)) {
  if (!img) return;
  const fallback = avatarDataUri(initials(name, user?.email));
  img.onerror = () => {
    img.onerror = null;
    img.src = fallback;
  };
  img.alt = "";
  img.src = photoFor(user);
}

function unlockStaffField(event) {
  const field = event.currentTarget;
  field.readOnly = false;
  field.dataset.touched = "true";
}

function clearStaffFieldsUnlessEditing() {
  [staffUsername, staffPassword].forEach((field) => {
    if (!field || field.dataset.touched === "true" || document.activeElement === field) return;
    field.value = "";
  });
}

function prepareStaffFields() {
  [staffUsername, staffPassword].forEach((field) => {
    if (!field) return;
    field.value = "";
    field.readOnly = true;
    field.dataset.touched = "false";
    field.addEventListener("pointerdown", unlockStaffField, { once: true });
    field.addEventListener("focus", unlockStaffField, { once: true });
    field.addEventListener("input", () => { field.dataset.touched = "true"; });
  });

  [60, 250, 800].forEach((delay) => {
    window.setTimeout(clearStaffFieldsUnlessEditing, delay);
  });

  window.addEventListener("pageshow", () => {
    [staffUsername, staffPassword].forEach((field) => {
      if (!field) return;
      field.dataset.touched = "false";
      field.readOnly = true;
    });
    window.setTimeout(clearStaffFieldsUnlessEditing, 80);
  });
}

function setStatus(message, state = "loading") {
  statusText.textContent = message;
  statusBox.dataset.state = state;
  statusBox.hidden = false;
}

function setSigningState(active) {
  signingIn = active;
  signInButton.disabled = active;
  staffSignInButton.disabled = active;
  staffUsername.disabled = active;
  staffPassword.disabled = active;
}

function showSignedOut(message = "") {
  root.classList.remove("auth-pending", "auth-authenticated", "auth-blocked");
  root.classList.add("auth-signed-out");
  delete root.dataset.userRole;
  gate.hidden = false;
  appShell.setAttribute("aria-hidden", "true");
  accountArea.hidden = true;
  blockedBox.hidden = true;
  loginOptions.hidden = false;
  retryButton.hidden = true;
  setSigningState(false);
  if (message) {
    setStatus(message, "ready");
  } else {
    statusBox.hidden = true;
  }
  clearStaffFieldsUnlessEditing();
}

function showBlocked(user) {
  root.classList.remove("auth-pending", "auth-authenticated", "auth-signed-out");
  root.classList.add("auth-blocked");
  delete root.dataset.userRole;
  gate.hidden = false;
  appShell.setAttribute("aria-hidden", "true");
  accountArea.hidden = true;
  loginOptions.hidden = true;
  retryButton.hidden = true;
  statusBox.hidden = true;
  blockedBox.hidden = false;
  setAvatarImage(blockedPhoto, user);
  blockedName.textContent = "บัญชีนี้ยังไม่ได้รับอนุญาต";
  blockedEmail.textContent = "กรุณาใช้บัญชีที่ผู้ดูแลระบบอนุญาต";
}

function updateAccountUi(user, role) {
  const name = displayNameFor(user);
  const roleLabel = role === "admin" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่ประชาสัมพันธ์";
  setAvatarImage(accountPhoto, user, name);
  accountName.textContent = name;
  accountRole.textContent = roleLabel;
  accountMenuName.textContent = name;
  accountEmail.textContent = role === "staff" ? `ชื่อผู้ใช้ ${normalizeUsername(user?.email?.split("@")[0])}` : "ผู้ดูแลระบบ";
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
  if (window.__BRN_APP_STARTED__) return;
  await loadScript('./app.js?v=1.0.3');
}

async function showWorkspace(user, role) {
  root.classList.remove("auth-pending", "auth-signed-out", "auth-blocked");
  root.classList.add("auth-authenticated");
  root.dataset.userRole = role;
  gate.hidden = true;
  appShell.setAttribute("aria-hidden", "false");
  blockedBox.hidden = true;
  window.BRN_CURRENT_USER = {
    uid: user.uid,
    email: normalizeEmail(user.email),
    username: role === "staff" ? normalizeUsername(user.email?.split("@")[0]) : null,
    displayName: displayNameFor(user),
    role,
  };
  updateAccountUi(user, role);
  await loadWorkspace();
  document.dispatchEvent(new CustomEvent("brn-auth-ready", { detail: window.BRN_CURRENT_USER }));
}

function readableError(error, method = "google") {
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
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (code.includes("too-many-requests")) {
    return "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
  }
  if (code.includes("user-disabled")) {
    return "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ";
  }
  return method === "staff" ? "เข้าสู่ระบบเจ้าหน้าที่ไม่สำเร็จ กรุณาลองใหม่" : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}

async function startGoogleSignIn() {
  if (signingIn) return;
  setSigningState(true);
  setStatus("กำลังเปิดหน้าต่างเลือกบัญชี Google…", "loading");
  try {
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  } catch (error) {
    showSignedOut(readableError(error, "google"));
    statusBox.dataset.state = "error";
  } finally {
    setSigningState(false);
  }
}

async function startStaffSignIn(event) {
  event.preventDefault();
  if (signingIn) return;
  const username = normalizeUsername(staffUsername.value);
  const password = staffPassword.value;
  if (!username || !password) {
    setStatus("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบ", "error");
    (!username ? staffUsername : staffPassword).focus();
    return;
  }
  if (!staffAccountByUsername(username)) {
    setStatus("ไม่พบชื่อผู้ใช้นี้ในระบบ", "error");
    staffUsername.focus();
    staffUsername.select();
    return;
  }
  setSigningState(true);
  setStatus(`กำลังตรวจสอบบัญชี ${username}…`, "loading");
  try {
    await signInWithEmailAndPassword(auth, emailForUsername(username), password);
    staffPassword.value = "";
    staffUsername.dataset.touched = "false";
    staffPassword.dataset.touched = "false";
  } catch (error) {
    setStatus(readableError(error, "staff"), "error");
    staffPassword.focus();
    staffPassword.select();
  } finally {
    setSigningState(false);
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
      window.BRN_CURRENT_USER = null;
      showSignedOut();
      return;
    }
    const role = roleFor(user);
    if (role === "blocked") {
      showBlocked(user);
      return;
    }
    try {
      await showWorkspace(user, role);
    } catch (error) {
      console.error(error);
      root.classList.remove("auth-authenticated");
      root.classList.add("auth-signed-out");
      gate.hidden = false;
      loginOptions.hidden = true;
      setStatus("เข้าสู่ระบบแล้ว แต่โหลดพื้นที่ทำงานไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ", "error");
      retryButton.hidden = false;
    }
  });
}

signInButton.addEventListener("click", startGoogleSignIn);
staffForm.addEventListener("submit", startStaffSignIn);
retryButton.addEventListener("click", () => location.reload());
togglePasswordButton.addEventListener("click", () => {
  const showing = staffPassword.type === "text";
  staffPassword.type = showing ? "password" : "text";
  togglePasswordButton.textContent = showing ? "แสดง" : "ซ่อน";
  togglePasswordButton.setAttribute("aria-label", showing ? "แสดงรหัสผ่าน" : "ซ่อนรหัสผ่าน");
  togglePasswordButton.setAttribute("aria-pressed", String(!showing));
  staffPassword.focus();
});
otherAccountButton.addEventListener("click", async () => {
  await signOut(auth);
  showSignedOut("ออกจากบัญชีเดิมแล้ว กรุณาเข้าสู่ระบบด้วยบัญชีที่ได้รับอนุญาต");
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

prepareStaffFields();

initializeAuthentication().catch((error) => {
  console.error(error);
  window.__BRN_AUTH_READY__ = true;
  root.classList.remove("auth-pending");
  root.classList.add("auth-signed-out");
  loginOptions.hidden = true;
  retryButton.hidden = false;
  setStatus("ตั้งค่าระบบเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจไฟล์ auth-config.js", "error");
});
