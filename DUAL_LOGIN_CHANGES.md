# Dual Login Changes

- เพิ่ม Google Login สำหรับผู้ดูแลระบบ `thanawid@gmail.com`
- เพิ่ม Username/Password Login สำหรับ `pr01` ถึง `pr05`
- ผู้ใช้กรอกเฉพาะ `pr01` ระบบเติม `@brn.local` ให้เอง
- เพิ่มการแสดง/ซ่อนรหัสผ่าน
- เพิ่มข้อความผิดพลาดภาษาไทยสำหรับรหัสผิด บัญชีถูกปิด และการล็อกอินถี่เกินไป
- กำหนดบทบาท `admin` และ `staff`
- เปิดตัวแปร `window.BRN_CURRENT_USER` สำหรับเชื่อม Firestore ในขั้นถัดไป
- เปลี่ยน Service Worker cache เป็น `brn-pr-v7-dual-auth`
