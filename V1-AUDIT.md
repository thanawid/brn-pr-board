# BRN PR Board V1.1.0 Audit

## ผ่านการตรวจ

- JavaScript syntax: `app.js`, `calendar-data.js`, `firebase-auth.js`, `auth-bootstrap.js`, `auth-config.js`
- ตรวจ ID ที่ JavaScript เรียกใช้กับ HTML: ไม่พบ ID หายหรือซ้ำ
- Firestore collection และ LINE queue คงชื่อเดิม
- ฟิลด์ใหม่เป็น optional และรองรับงานเก่า
- cache bust และ Service Worker เปลี่ยนเป็น V1.1.0
- จำนวนไฟล์ในแพ็กเกจต่ำกว่า 100 ไฟล์

## ข้อจำกัดของการตรวจในสภาพแวดล้อมนี้

Chromium headless ของระบบทดสอบไม่สามารถสร้างภาพหน้าจอได้แม้กับหน้า HTML เปล่า จึงตรวจด้วย syntax, DOM reference, file reference และโครงสร้างโค้ดแทน ควรเปิด `preview.html` บน Chrome/Edge อีกครั้งก่อนนำขึ้น GitHub Pages เพื่อดูการจัดวางจริงทุก breakpoint

## จุดที่ควรทดสอบบนระบบจริง

1. เข้าสู่ระบบด้วย Google admin และบัญชี PR01–PR05
2. เพิ่มและแก้ไขงานเดิมใน Firestore
3. เลื่อนสถานะงานจากใบงาน PR
4. ส่ง LINE ตอนบันทึกและปุ่มส่งซ้ำ
5. เปิดบนมือถือและตรวจว่ามุมมองรายการเป็นค่าเริ่มต้น
6. ทดสอบพิมพ์ใบงาน PR
7. ตรวจข้อมูลวันสำคัญ/วันพระก่อนขึ้นปีใหม่
