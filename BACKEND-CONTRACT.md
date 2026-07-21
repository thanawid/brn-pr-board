# BRN PR Board — Backend Contract

ห้ามเปลี่ยน Firebase project `brn-pr-board` หรือ Cloud Functions เดิม

- Authentication: Google admin `thanawid@gmail.com` และ staff `pr01`–`pr05` ผ่าน `@brn.local`
- Firestore งานทีม: collection `prEvents`
- LINE queue: collection `lineOutbox`
- LINE group: document `system/lineGroup`
- Cloud Functions ที่ล็อกไว้: `lineWebhook`, `sendLineOutbox`

Frontend จะเขียนงานเข้า `prEvents` และสร้างเอกสารใหม่ใน `lineOutbox` เมื่อเลือกแจ้ง LINE
