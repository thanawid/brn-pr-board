# BRN PR Board

Frontend ใหม่สำหรับกระดานงานประชาสัมพันธ์ โดยคง Firebase project `brn-pr-board` และระบบ Authentication เดิม

## อัปโหลด GitHub Pages
นำไฟล์ทั้งหมดในโฟลเดอร์นี้วางที่ root ของ repository `brn-pr-board`

## โครงข้อมูลที่เว็บใช้
- `prEvents` — งานในปฏิทิน
- `lineOutbox` — คิวแจ้งเตือน LINE เมื่อเพิ่มงานและเลือกการแจ้งเตือน

หาก Firestore rules ยังไม่อนุญาต `prEvents` เว็บจะทำงานด้วย localStorage บนเครื่องนั้นชั่วคราว
