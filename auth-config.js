/*
 * BRN PR Workspace — Firebase Authentication configuration
 *
 * accessMode:
 *   "google-only" = บัญชี Google ทุกบัญชีเข้าสู่หน้าเว็บได้
 *   "allowlist"   = เข้าได้เฉพาะอีเมลใน allowedEmails
 *
 * เมื่อต้องการจำกัดผู้ใช้ ให้เปลี่ยน accessMode เป็น "allowlist"
 * แล้วเพิ่มอีเมลลงใน allowedEmails ด้านล่าง
 */
window.BRN_AUTH_CONFIG = {
  appName: "BRN PR Workspace",
  accessMode: "allowlist",

  allowedEmails: [
    "thanawid@gmail.com",
  ],

  adminEmails: [
    "thanawid@gmail.com",
  ],

  firebaseConfig: {
    apiKey: "AIzaSyByR15Ptjs6Q-DMzVWPQmTOihqMMhW_868",
    authDomain: "brn-pr-board.firebaseapp.com",
    projectId: "brn-pr-board",
    storageBucket: "brn-pr-board.firebasestorage.app",
    messagingSenderId: "53207804495",
    appId: "1:53207804495:web:0c1f4d232eb3893accd83a",
    measurementId: "G-2CLDLX6RLD",
  },
};
