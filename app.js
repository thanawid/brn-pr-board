const YEAR = 2026;
const THAI_YEAR = YEAR + 543;
const STORAGE_KEY = "brn-pr-content-calendar-live";

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const shortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const weekDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const entryTypes = ["งานเทศบาล", "วันของเทศบาล", "โน้ตทีม", "คอนเทนต์ไอเดีย"];
const statuses = ["📋 รอถ่าย", "🎬 กำลังทำ", "✅ โพสต์แล้ว"];
const LEGACY_STATUS = {
  "ไอเดีย": "📋 รอถ่าย",
  "ต้องถ่าย": "📋 รอถ่าย",
  "กำลังตัด": "🎬 กำลังทำ",
  "รออนุมัติ": "🎬 กำลังทำ",
  "เผยแพร่แล้ว": "✅ โพสต์แล้ว",
};
const migrateStatus = (item) => ({ ...item, status: LEGACY_STATUS[item.status] || (statuses.includes(item.status) ? item.status : statuses[0]) });

const pillars = {
  "เมืองสมดุล": {
    color: "#51247a",
    angle: "ทำให้เห็นว่าเทศบาลจัดการเมืองเป็นระบบ มีข้อมูล มีคนรับผิดชอบ และประชาชนรู้ว่าจะใช้บริการอย่างไร",
    shots: ["ภาพรวมพื้นที่หรือจุดบริการ", "เจ้าหน้าที่ประสานงาน", "ป้าย/ข้อมูลสำคัญ", "ประชาชนใช้บริการจริง", "ภาพสรุปผลลัพธ์"],
  },
  "สะอาด": {
    color: "#1b8a72",
    angle: "เล่าจากปัญหาที่เห็นจริง ไปสู่การลงมือ และปิดด้วยผลลัพธ์ที่ประชาชนสัมผัสได้",
    shots: ["ภาพก่อน-หลัง", "ทีมงานลงพื้นที่", "รายละเอียดขยะ/ท่อ/คลอง", "อุปกรณ์ที่ใช้", "พื้นที่หลังดำเนินการ"],
  },
  "ปลอดภัย": {
    color: "#dc4b3e",
    angle: "สื่อสารให้เร็ว ชัด และบอกช่องทางแจ้งเหตุหรือสิ่งที่ประชาชนต้องระวัง",
    shots: ["จุดเสี่ยงหรือสภาพปัญหา", "เจ้าหน้าที่ตรวจสอบ", "ภาพแก้ไขหรือป้องกัน", "ป้ายเตือน/ไฟส่องสว่าง", "ช่องทางแจ้งเหตุ"],
  },
  "สิ่งแวดล้อม": {
    color: "#148a80",
    angle: "ทำให้คนรู้สึกว่าเมืองน่าอยู่เกิดจากพฤติกรรมร่วมกัน ไม่ใช่งานของเทศบาลฝ่ายเดียว",
    shots: ["พื้นที่สีเขียวหรือคลอง", "กิจกรรมแยกขยะ/ลดขยะ", "ประชาชนหรือชุมชนร่วมมือ", "ผลลัพธ์ที่สะอาดขึ้น", "วิธีที่คนทำตามได้"],
  },
  "คุณภาพชีวิต": {
    color: "#ff6f22",
    angle: "เล่าแบบอบอุ่น เห็นคนจริง ได้ประโยชน์จริง แต่ยังสุภาพและน่าเชื่อถือ",
    shots: ["ผู้รับบริการหรือบรรยากาศกิจกรรม", "เจ้าหน้าที่ให้บริการ", "รายละเอียดที่เป็นประโยชน์", "รอยยิ้มหรือภาพมีชีวิต", "ช่องทางติดต่อ"],
  },
};

const importantEvents = [
  event("2026-01-01", "วันขึ้นปีใหม่", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "อวยพรปีใหม่ สรุปช่องทางบริการ และเตือนเดินทางปลอดภัย"),
  event("2026-01-02", "วันหยุดพิเศษช่วงปีใหม่", "วันหยุดราชการ", "ปลอดภัย", "วางโพสต์บริการจำเป็น ช่องทางติดต่อ และการเดินทางปลอดภัย"),
  event("2026-01-10", "วันเด็กแห่งชาติ", "วันสำคัญ", "คุณภาพชีวิต", "กิจกรรมเด็ก ครอบครัว พื้นที่ปลอดภัย และการเรียนรู้ของเยาวชน"),
  event("2026-01-16", "วันครู", "วันสำคัญ", "คุณภาพชีวิต", "ขอบคุณครูและบุคลากรการศึกษา เชื่อมกับอนาคตของชุมชน"),
  event("2026-03-03", "วันมาฆบูชา", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "วัด ชุมชน ความสงบเรียบร้อย และการดูแลพื้นที่รอบวัด"),
  event("2026-03-18", "วันท้องถิ่นไทย", "วันสำคัญ", "เมืองสมดุล", "เล่า 1 วันของเทศบาลว่าดูแลเมืองและบริการประชาชนอย่างไร"),
  event("2026-03-22", "วันน้ำโลก", "วันสำคัญ", "สิ่งแวดล้อม", "คลอง ท่อระบายน้ำ การใช้น้ำ และการไม่ทิ้งขยะลงแหล่งน้ำ"),
  event("2026-04-06", "วันจักรี", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "กิจกรรมรำลึกและงานดูแลความเรียบร้อยในพื้นที่"),
  event("2026-04-13", "สงกรานต์ / วันผู้สูงอายุ", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "ครอบครัว ผู้สูงอายุ จุดบริการ และความปลอดภัยช่วงหยุดยาว"),
  event("2026-04-14", "วันครอบครัว", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "ชวนดูแลผู้สูงอายุ เด็ก และความปลอดภัยในบ้าน"),
  event("2026-04-15", "สงกรานต์", "วันหยุด/วันสำคัญ", "ปลอดภัย", "เตือนการเดินทาง จุดเสี่ยง และช่องทางแจ้งเหตุ"),
  event("2026-04-24", "วันเทศบาล", "วันสำคัญ", "เมืองสมดุล", "5 งานเทศบาลใกล้ชีวิตประชาชน และคนเบื้องหลังที่ทำให้เมืองเดินต่อ"),
  event("2026-05-01", "วันแรงงานแห่งชาติ", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "ขอบคุณแรงงานและเจ้าหน้าที่ภาคสนามที่ดูแลเมืองทุกวัน"),
  event("2026-05-04", "วันฉัตรมงคล", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "กิจกรรมพิธีการและจิตอาสาพัฒนาเมือง"),
  event("2026-05-11", "วันพืชมงคล", "วันหยุดราชการ", "สิ่งแวดล้อม", "เชื่อมเกษตร พื้นที่สีเขียว ตลาด และคุณภาพชีวิตในเมือง"),
  event("2026-05-31", "วันวิสาขบูชา / วันต้นไม้", "วันหยุด/วันสำคัญ", "สิ่งแวดล้อม", "ทำบุญ ปลูกต้นไม้ ดูแลวัด และรักษาความสะอาดพื้นที่สาธารณะ"),
  event("2026-06-01", "วันหยุดชดเชยวันวิสาขบูชา", "วันหยุดราชการ", "คุณภาพชีวิต", "แจ้งบริการช่วงหยุดยาวและสรุปกิจกรรมวัด/ชุมชน"),
  event("2026-06-02", "วันหยุดพิเศษ", "วันหยุดราชการ", "เมืองสมดุล", "เตรียมคอนเทนต์ล่วงหน้า แจ้งช่องทางบริการและงานด่วน"),
  event("2026-06-03", "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "กิจกรรมจิตอาสาและการดูแลพื้นที่สาธารณะ"),
  event("2026-06-05", "วันสิ่งแวดล้อมโลก", "วันสำคัญ", "สิ่งแวดล้อม", "ลดขยะ แยกขยะ คลองสะอาด และพื้นที่สีเขียว"),
  event("2026-06-15", "วันไข้เลือดออกอาเซียน", "วันสำคัญ", "คุณภาพชีวิต", "สำรวจลูกน้ำยุงลาย 3 จุดในบ้านและชุมชน"),
  event("2026-06-26", "วันต่อต้านยาเสพติดโลก", "วันสำคัญ", "ปลอดภัย", "สื่อสารเชิงป้องกันสำหรับเยาวชนและครอบครัว"),
  event("2026-07-01", "วันสถาปนาลูกเสือแห่งชาติ", "วันสำคัญ", "คุณภาพชีวิต", "เยาวชน จิตอาสา ระเบียบวินัย และการช่วยชุมชน"),
  event("2026-07-28", "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "กิจกรรมจิตอาสาพัฒนาเมืองและดูแลพื้นที่สาธารณะ"),
  event("2026-07-29", "วันอาสาฬหบูชา / วันภาษาไทยแห่งชาติ", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "วัด ชุมชน การใช้ภาษาไทยที่เข้าใจง่าย และความเรียบร้อยพื้นที่วัด"),
  event("2026-07-30", "วันเข้าพรรษา", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "ถวายเทียน งดเหล้าเข้าพรรษา ดูแลวัด และการเดินทางปลอดภัย"),
  event("2026-08-12", "วันแม่แห่งชาติ", "วันหยุด/วันสำคัญ", "คุณภาพชีวิต", "ครอบครัว แม่ ผู้สูงอายุ และชุมชนดูแลกัน"),
  event("2026-09-20", "วันเยาวชนแห่งชาติ / วันอนุรักษ์คลอง", "วันสำคัญ", "สิ่งแวดล้อม", "เยาวชนร่วมดูแลคลองและเสนอไอเดียเมือง"),
  event("2026-09-24", "วันมหิดล", "วันสำคัญ", "คุณภาพชีวิต", "สาธารณสุข อสม. และบริการกลุ่มเปราะบาง"),
  event("2026-10-13", "วันคล้ายวันสวรรคต รัชกาลที่ 9", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "น้อมรำลึก กิจกรรมจิตอาสา และการทำความดีเพื่อชุมชน"),
  event("2026-10-23", "วันปิยมหาราช", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "เชื่อมประวัติศาสตร์กับการบริการประชาชน"),
  event("2026-10-26", "วันออกพรรษา", "วันสำคัญ", "คุณภาพชีวิต", "งานวัด ประเพณี ความเรียบร้อย และการจัดการจราจร"),
  event("2026-11-24", "วันลอยกระทง", "วันสำคัญ", "สิ่งแวดล้อม", "กระทงธรรมชาติ ความปลอดภัย และการเก็บขยะหลังงาน"),
  event("2026-12-04", "วันสิ่งแวดล้อมไทย", "วันสำคัญ", "สิ่งแวดล้อม", "สรุปผลงานลดขยะ พื้นที่สีเขียว และคลองสะอาด"),
  event("2026-12-05", "วันพ่อแห่งชาติ / วันชาติ", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "น้อมรำลึก กิจกรรมจิตอาสา และคุณภาพชีวิต"),
  event("2026-12-07", "วันหยุดชดเชยวันพ่อแห่งชาติ / วันชาติ", "วันหยุดราชการ", "เมืองสมดุล", "แจ้งบริการช่วงหยุดยาวและสรุปกิจกรรมจิตอาสา"),
  event("2026-12-10", "วันรัฐธรรมนูญ", "วันหยุด/วันสำคัญ", "เมืองสมดุล", "สิทธิ หน้าที่ และการมีส่วนร่วมของประชาชน"),
  event("2026-12-31", "วันสิ้นปี", "วันหยุด/วันสำคัญ", "ปลอดภัย", "สรุปผลงานทั้งปีและเตือนเดินทางปลอดภัย"),
];

const buddhistDays = [
  ["2026-01-03", "ขึ้น 15 ค่ำ เดือนยี่"],
  ["2026-01-11", "แรม 8 ค่ำ เดือนยี่"],
  ["2026-01-18", "แรม 15 ค่ำ เดือนยี่"],
  ["2026-01-26", "ขึ้น 8 ค่ำ เดือนสาม"],
  ["2026-02-02", "ขึ้น 15 ค่ำ เดือนสาม"],
  ["2026-02-10", "แรม 8 ค่ำ เดือนสาม"],
  ["2026-02-16", "แรม 14 ค่ำ เดือนสาม"],
  ["2026-02-24", "ขึ้น 8 ค่ำ เดือนสี่"],
  ["2026-03-03", "ขึ้น 15 ค่ำ เดือนสี่"],
  ["2026-03-11", "แรม 8 ค่ำ เดือนสี่"],
  ["2026-03-18", "แรม 15 ค่ำ เดือนสี่"],
  ["2026-03-26", "ขึ้น 8 ค่ำ เดือนห้า"],
  ["2026-04-02", "ขึ้น 15 ค่ำ เดือนห้า"],
  ["2026-04-10", "แรม 8 ค่ำ เดือนห้า"],
  ["2026-04-16", "แรม 14 ค่ำ เดือนห้า"],
  ["2026-04-24", "ขึ้น 8 ค่ำ เดือนหก"],
  ["2026-05-01", "ขึ้น 15 ค่ำ เดือนหก"],
  ["2026-05-09", "แรม 8 ค่ำ เดือนหก"],
  ["2026-05-16", "แรม 15 ค่ำ เดือนหก"],
  ["2026-05-24", "ขึ้น 8 ค่ำ เดือนเจ็ด"],
  ["2026-05-31", "ขึ้น 15 ค่ำ เดือนเจ็ด"],
  ["2026-06-08", "แรม 8 ค่ำ เดือนเจ็ด / วันอัฏฐมีบูชา"],
  ["2026-06-14", "แรม 14 ค่ำ เดือนเจ็ด"],
  ["2026-06-22", "ขึ้น 8 ค่ำ เดือนแปด"],
  ["2026-06-29", "ขึ้น 15 ค่ำ เดือนแปด"],
  ["2026-07-07", "แรม 8 ค่ำ เดือนแปด"],
  ["2026-07-14", "แรม 15 ค่ำ เดือนแปด"],
  ["2026-07-22", "ขึ้น 8 ค่ำ เดือนแปดหลัง"],
  ["2026-07-29", "ขึ้น 15 ค่ำ เดือนแปดหลัง"],
  ["2026-07-30", "แรม 1 ค่ำ เดือนแปดหลัง / วันเข้าพรรษา"],
  ["2026-08-06", "แรม 8 ค่ำ เดือนแปดหลัง"],
  ["2026-08-13", "แรม 15 ค่ำ เดือนแปดหลัง"],
  ["2026-08-21", "ขึ้น 8 ค่ำ เดือนเก้า"],
  ["2026-08-28", "ขึ้น 15 ค่ำ เดือนเก้า"],
  ["2026-09-05", "แรม 8 ค่ำ เดือนเก้า"],
  ["2026-09-11", "แรม 14 ค่ำ เดือนเก้า"],
  ["2026-09-19", "ขึ้น 8 ค่ำ เดือนสิบ"],
  ["2026-09-26", "ขึ้น 15 ค่ำ เดือนสิบ"],
  ["2026-10-04", "แรม 8 ค่ำ เดือนสิบ"],
  ["2026-10-11", "แรม 15 ค่ำ เดือนสิบ"],
  ["2026-10-19", "ขึ้น 8 ค่ำ เดือนสิบเอ็ด"],
  ["2026-10-26", "ขึ้น 15 ค่ำ เดือนสิบเอ็ด"],
  ["2026-11-03", "แรม 8 ค่ำ เดือนสิบเอ็ด"],
  ["2026-11-09", "แรม 14 ค่ำ เดือนสิบเอ็ด"],
  ["2026-11-17", "ขึ้น 8 ค่ำ เดือนสิบสอง"],
  ["2026-11-24", "ขึ้น 15 ค่ำ เดือนสิบสอง"],
  ["2026-12-02", "แรม 8 ค่ำ เดือนสิบสอง"],
  ["2026-12-09", "แรม 15 ค่ำ เดือนสิบสอง"],
  ["2026-12-17", "ขึ้น 8 ค่ำ เดือนอ้าย"],
  ["2026-12-24", "ขึ้น 15 ค่ำ เดือนอ้าย"],
].map(([date, lunar]) => ({
  id: `buddhist-${date}`,
  date,
  title: "วันพระ",
  type: "วันพระ",
  pillar: "คุณภาพชีวิต",
  note: lunar,
  source: "buddhist",
}));

const monthGuides = [
  guide("เริ่มปีใหม่ให้ประชาชนรู้ช่องทางบริการ", "ปีใหม่, วันเด็ก, ความปลอดภัยช่วงเดินทาง", [
    idea("รวมช่องทางติดต่อเทศบาลฉบับจำง่าย", "เมืองสมดุล", "โพสต์ภาพชุด", "ทำเป็น 5 ช่องทางสำคัญ พร้อมเบอร์/ไลน์/เพจ"),
    idea("วันเด็ก: เมืองนี้อยากให้เด็กโตมาแบบไหน", "คุณภาพชีวิต", "Reel สั้น", "สัมภาษณ์เด็กหรือผู้ปกครอง 3 คำถาม"),
    idea("เช็กจุดเสี่ยงหลังเทศกาล", "ปลอดภัย", "ก่อน-หลัง", "สำรวจไฟส่องสว่าง ทางม้าลาย จุดน้ำขัง หรือขยะตกค้าง"),
  ]),
  guide("สุขภาพชุมชนและบริการใกล้บ้าน", "อสม., ผู้สูงอายุ, จุดบริการ, งานประจำที่ประชาชนอาจไม่รู้", [
    idea("1 นาทีรู้จักบริการเทศบาล", "เมืองสมดุล", "คลิปอธิบายสั้น", "เลือกบริการ 1 เรื่องแล้วอธิบายขั้นตอน 1-2-3"),
    idea("เสียงประชาชนหลังรับบริการ", "คุณภาพชีวิต", "สัมภาษณ์สั้น", "ถามก่อนมาแก้อะไร หลังรับบริการรู้สึกอย่างไร"),
    idea("พื้นที่สะอาดเริ่มจากจุดเล็ก", "สะอาด", "ภาพชุด", "จุดทิ้งขยะ ตลาด หรือพื้นที่สาธารณะ"),
  ]),
  guide("เมืองท้องถิ่น น้ำ และการทำงานหลังบ้าน", "วันท้องถิ่นไทย, วันน้ำโลก, ระบบระบายน้ำ", [
    idea("1 วันของคนดูแลเมือง", "เมืองสมดุล", "สารคดีสั้น", "ตามทีมงานตั้งแต่เช้าจนจบงาน"),
    idea("น้ำไม่ท่วมต้องเริ่มก่อนฝนมา", "ปลอดภัย", "คลิปอธิบาย", "เปิดด้วยจุดเสี่ยง ต่อด้วยการลอกท่อ/ตรวจคลอง"),
    idea("คลองสะอาด ประชาชนช่วยอะไรได้", "สิ่งแวดล้อม", "โพสต์ให้ความรู้", "ทำเป็นข้อควรทำ/ไม่ควรทำ"),
  ]),
  guide("สงกรานต์ปลอดภัยและครอบครัวอบอุ่น", "ผู้สูงอายุ, ความปลอดภัย, การเดินทาง, งานประเพณี", [
    idea("จุดบริการช่วงสงกรานต์อยู่ตรงไหน", "ปลอดภัย", "แผนที่โพสต์", "ใช้ภาพสถานที่จริงและเวลาทำการ"),
    idea("ดูแลผู้สูงอายุในวันครอบครัว", "คุณภาพชีวิต", "Reel อบอุ่น", "เก็บบรรยากาศครอบครัวและบริการเทศบาล"),
    idea("หลังเทศกาล เมืองกลับมาสะอาดยังไง", "สะอาด", "ก่อน-หลัง", "ขยะ น้ำ ถนน และทีมภาคสนาม"),
  ]),
  guide("สิ่งแวดล้อมและพื้นที่สีเขียว", "วันต้นไม้, วัด, ขยะ, ความสะอาดช่วงฝนต้นฤดู", [
    idea("ปลูกต้นไม้แล้วต้องดูแลต่ออย่างไร", "สิ่งแวดล้อม", "โพสต์ภาพชุด", "ก่อนปลูก ระหว่างปลูก หลังดูแล"),
    idea("วัดสะอาด ชุมชนสบายใจ", "สะอาด", "คลิปบรรยากาศ", "ภาพวัด ประชาชนร่วมกิจกรรม ทีมดูแลพื้นที่"),
    idea("ลดขยะหนึ่งอย่างที่บ้านทำได้วันนี้", "สิ่งแวดล้อม", "อินโฟโพสต์", "ทำเป็นข้อสั้นๆ ใช้ภาษาประชาชน"),
  ]),
  guide("หน้าฝนต้องสื่อสารเร็วและชัด", "ฝน, ไข้เลือดออก, ลูกน้ำยุงลาย, จุดน้ำขัง", [
    idea("สำรวจลูกน้ำยุงลาย 3 จุดในบ้าน", "คุณภาพชีวิต", "Reel สั้น", "เปิดด้วยคำถาม แล้วพาเช็กทีละจุด"),
    idea("จุดน้ำขังแจ้งทางไหน", "ปลอดภัย", "โพสต์แจ้งข่าว", "บอกช่องทางแจ้งเหตุและข้อมูลที่ควรส่ง"),
    idea("ทีมลอกท่อทำงานก่อนฝนหนัก", "สะอาด", "ก่อน-หลัง", "เก็บภาพหน้างานและผลหลังเปิดทางน้ำ"),
  ]),
  guide("ศาสนา จิตอาสา และความปลอดภัยช่วงฝน", "วันพระ, อาสาฬหบูชา, เข้าพรรษา, วันเฉลิมฯ", [
    idea("ต่อยอดวันพระ: วัดสะอาด ชุมชนร่วมดูแล", "คุณภาพชีวิต", "ภาพบรรยากาศ", "ภาพวัด ประชาชน ทีมดูแลพื้นที่ และจุดจอดรถ"),
    idea("สำรวจจุดน้ำขังหลังฝน", "ปลอดภัย", "รายงานภาคสนาม", "ภาพก่อน-หลัง จุดน้ำขัง ทีมลงพื้นที่ ฝาท่อ และช่องทางแจ้งเหตุ"),
    idea("คลิปสั้นแนะนำการแจ้งไฟสาธารณะดับ", "ปลอดภัย", "Reel อธิบายสั้น", "เปิดด้วยไฟดับจริง แล้วบอกข้อมูลที่ต้องแจ้ง"),
  ]),
  guide("ครอบครัว แม่ และชุมชนดูแลกัน", "วันแม่, สุขภาพครอบครัว, ผู้สูงอายุ, บริการประชาชน", [
    idea("เรื่องเล่าคนดูแลแม่ในชุมชน", "คุณภาพชีวิต", "สัมภาษณ์สั้น", "ถาม 2 คำถาม เน้นอบอุ่นและให้เกียรติ"),
    idea("บริการเทศบาลที่ช่วยครอบครัว", "เมืองสมดุล", "โพสต์ภาพชุด", "เลือก 3 บริการใกล้ตัว"),
    idea("พื้นที่สาธารณะปลอดภัยสำหรับครอบครัว", "ปลอดภัย", "ภาพตรวจพื้นที่", "สนามเด็กเล่น ทางเดิน ไฟส่องสว่าง"),
  ]),
  guide("เยาวชน คลอง และเมืองที่ร่วมกันดูแล", "เยาวชน, คลอง, สุขภาพ, ปลายฤดูฝน", [
    idea("เยาวชนเสนอไอเดียเมืองน่าอยู่", "คุณภาพชีวิต", "คลิป vox pop", "ถามเด็ก/เยาวชน 1 คำถาม"),
    idea("คลองสะอาดเริ่มจากหน้าบ้าน", "สิ่งแวดล้อม", "โพสต์เชิงชวนทำ", "เชื่อมชุมชนกับการไม่ทิ้งขยะลงคลอง"),
    idea("สรุปจุดเสี่ยงฝนปลายฤดู", "ปลอดภัย", "แจ้งเตือน", "ทำเป็นรายการสั้นๆ พร้อมช่องทางแจ้งเหตุ"),
  ]),
  guide("จิตอาสา ประเพณี และความเรียบร้อย", "วันสำคัญ, งานวัด, จราจร, บริการพื้นที่", [
    idea("กิจกรรมจิตอาสาที่เห็นผลจริง", "เมืองสมดุล", "ก่อน-หลัง", "ปัญหา ลงมือ ผลลัพธ์ และประชาชนช่วยอะไรได้"),
    idea("งานวัดให้ปลอดภัยและเรียบร้อย", "ปลอดภัย", "โพสต์แจ้งข่าว", "จุดจอดรถ จราจร ความสะอาด และช่องทางติดต่อ"),
    idea("เรื่องเล่าคนเก็บรายละเอียดงานพิธี", "คุณภาพชีวิต", "ภาพเบื้องหลัง", "ทีมงาน เตรียมสถานที่ เช็กความเรียบร้อย"),
  ]),
  guide("ลอยกระทงอย่างปลอดภัยและไม่เพิ่มขยะ", "ลอยกระทง, คลอง, ขยะหลังงาน, ความปลอดภัย", [
    idea("กระทงแบบไหนช่วยเมืองได้", "สิ่งแวดล้อม", "อินโฟโพสต์", "ธรรมชาติ ปลอดโฟม ไม่ทิ้งลงจุดห้าม"),
    idea("หลังลอยกระทง ทีมเก็บอะไรบ้าง", "สะอาด", "ก่อน-หลัง", "ภาพขยะหลังงาน ทีมเก็บ และพื้นที่กลับมาสะอาด"),
    idea("จุดเสี่ยงริมน้ำต้องระวัง", "ปลอดภัย", "แจ้งเตือน", "แสงสว่าง ริมคลอง เด็กเล็ก และจุดบริการ"),
  ]),
  guide("สรุปผลงานทั้งปีและเตรียมปีใหม่", "สิ่งแวดล้อมไทย, วันพ่อ, ปีใหม่, ความปลอดภัย", [
    idea("สรุป 5 เรื่องที่เมืองดีขึ้นปีนี้", "เมืองสมดุล", "โพสต์สรุปผลงาน", "ใช้ภาพก่อน-หลังและตัวเลขเท่าที่มี"),
    idea("สิ่งแวดล้อมไทย: เมืองสะอาดขึ้นตรงไหน", "สิ่งแวดล้อม", "ภาพชุด", "คลอง ขยะ พื้นที่สีเขียว และชุมชนร่วมมือ"),
    idea("ปีใหม่ปลอดภัย เริ่มจากเตรียมตัว", "ปลอดภัย", "Reel เตือนภัย", "เดินทาง ไฟฟ้า ขยะ จุดเสี่ยง และช่องทางแจ้งเหตุ"),
  ]),
];

const defaultEntries = [
  {
    id: "sample-drainage",
    date: "2026-07-16",
    time: "09.00 น.",
    location: "จุดเสี่ยงน้ำขังในพื้นที่เทศบาล",
    owner: "งานประชาสัมพันธ์ + กองช่าง",
    responsible: "ทีมถ่ายภาพ + แอดมินเพจ",
    image: "",
    title: "สำรวจจุดน้ำขังหลังฝนและท่อระบายน้ำ",
    type: "งานเทศบาล",
    pillar: "ปลอดภัย",
    channel: "Facebook",
    status: "ต้องถ่าย",
    note: "เก็บภาพก่อน-หลัง จุดน้ำขัง ทีมลงพื้นที่ ฝาท่อ และช่องทางแจ้งเหตุ",
  },
  {
    id: "sample-light",
    date: "2026-07-17",
    time: "14.00 น.",
    location: "ถนน/ซอยที่มีไฟสาธารณะดับ",
    owner: "งานประชาสัมพันธ์",
    responsible: "ทีมวิดีโอสั้น",
    image: "",
    title: "คลิปสั้นแนะนำการแจ้งไฟสาธารณะดับ",
    type: "คอนเทนต์ไอเดีย",
    pillar: "ปลอดภัย",
    channel: "YouTube @BangraknoiNews",
    status: "📋 รอถ่าย",
    note: "เปิดด้วยไฟดับจริง แล้วบอกข้อมูลที่ประชาชนต้องแจ้ง",
  },
  {
    id: "sample-clean",
    date: "2026-07-20",
    time: "10.00 น.",
    location: "คลองและจุดเก็บขยะตกค้าง",
    owner: "งานประชาสัมพันธ์ + งานรักษาความสะอาด",
    responsible: "ทีมภาพข่าว",
    image: "",
    title: "สรุปงานเก็บขยะตกค้างและคลองสะอาด",
    type: "งานเทศบาล",
    pillar: "สะอาด",
    channel: "Facebook",
    status: "กำลังตัด",
    note: "ก่อน-หลัง จุดที่เก็บ ทีมงาน และประโยชน์กับประชาชน",
  },
];

let selectedDate = toISO(safeToday());
let activeMonth = parseISO(selectedDate).getMonth();
let entries = loadEntries();
let editingEntryId = null;
let ideaOffset = 0;

function event(date, title, type, pillar, note) {
  return { id: `event-${date}-${title}`, date, title, type, pillar, note, source: "event" };
}

function guide(theme, summary, ideas) {
  return { theme, summary, ideas };
}

function idea(title, pillar, format, note) {
  return { title, pillar, format, note };
}

function safeToday() {
  const now = new Date();
  if (now.getFullYear() === YEAR) return now;
  return new Date(YEAR, 6, 19);
}

function parseISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function thaiDate(date) {
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function shortThaiDate(iso) {
  const date = parseISO(iso);
  return `${date.getDate()} ${shortMonths[date.getMonth()]}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...defaultEntries].map(migrateStatus);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(migrateStatus) : [...defaultEntries].map(migrateStatus);
  } catch {
    return [...defaultEntries].map(migrateStatus);
  }
}

function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    toast("พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็ม ลองใช้รูปขนาดเล็กลงหรือลบงานเก่า");
  }
}

function userEntriesForDate(iso) {
  return entries.filter((item) => item.date === iso);
}

function calendarEventsForDate(iso) {
  return importantEvents.filter((item) => item.date === iso);
}

function buddhistForDate(iso) {
  return buddhistDays.filter((item) => item.date === iso);
}

function allItemsForDate(iso) {
  return [...calendarEventsForDate(iso), ...buddhistForDate(iso), ...userEntriesForDate(iso).map((item) => ({ ...item, source: "user" }))];
}

function itemsForMonth(month) {
  const monthText = `-${String(month + 1).padStart(2, "0")}-`;
  return [
    ...importantEvents.filter((item) => item.date.includes(monthText)),
    ...buddhistDays.filter((item) => item.date.includes(monthText)),
    ...entries.filter((item) => item.date.includes(monthText)).map((item) => ({ ...item, source: "user" })),
  ];
}

function activeGuide() {
  return monthGuides[activeMonth] || monthGuides[0];
}

function preferredItem(items) {
  return items.find((item) => item.source === "user") || items.find((item) => item.source === "event") || items[0] || null;
}

function displayLocation(item) {
  if (!item) return "พื้นที่เทศบาลเมืองบางรักน้อย";
  if (item.location) return item.location;
  if (item.source === "buddhist") return "วัดและชุมชนในพื้นที่";
  if (item.source === "event") return "พื้นที่เทศบาลเมืองบางรักน้อย";
  return "รอระบุสถานที่";
}

function displayOwner(item) {
  if (!item) return "ทีม PR";
  if (item.owner) return item.owner;
  if (item.source === "event") return "ทีม PR + หน่วยงานที่เกี่ยวข้อง";
  if (item.source === "buddhist") return "ทีม PR";
  return "รอระบุเจ้าของงาน";
}

function displayResponsible(item) {
  if (!item) return "ทีม PR";
  if (item.responsible) return item.responsible;
  if (item.source === "event") return "ทีม PR";
  if (item.source === "buddhist") return "ทีมภาพข่าว/แอดมินเพจ";
  return "รอระบุผู้รับผิดชอบ";
}

function displayAction(item) {
  if (!item) return "เลือกไอเดียสำรองของเดือน";
  if (item.source === "user") return item.status || item.type || "เตรียมคอนเทนต์";
  if (item.source === "buddhist") return "เก็บภาพบรรยากาศวัด/ชุมชน";
  return "เตรียมโพสต์และเก็บภาพประกอบ";
}

function displayChannel(item) {
  if (!item) return "Facebook";
  if (item.channel) return item.channel;
  if (item.source === "event") return "Facebook + LINE";
  return "Facebook";
}

function displayTime(item) {
  if (!item) return "ตามแผนทีม";
  return item.time || "ยังไม่ระบุเวลา";
}

function displayImage(item) {
  return item?.image || "";
}

function adviceForDate(iso) {
  const date = parseISO(iso);
  const items = allItemsForDate(iso);
  const guideData = monthGuides[date.getMonth()];
  const target = preferredItem(items);
  const fallbackIdea = guideData.ideas[(date.getDate() + ideaOffset) % guideData.ideas.length];
  const title = target?.title || fallbackIdea.title;
  const pillar = target?.pillar || fallbackIdea.pillar || "เมืองสมดุล";
  const pillarData = pillars[pillar] || pillars["เมืองสมดุล"];
  const note = target?.note || fallbackIdea.note || guideData.summary;
  const angle = target
    ? `เริ่มจาก "${title}" แล้วเล่าให้ประชาชนเห็นว่าเกี่ยวกับชีวิตจริงอย่างไร ต่อด้วยสิ่งที่เทศบาลลงมือ และปิดด้วยประโยชน์หรือช่องทางที่ประชาชนใช้ต่อได้`
    : `วันนี้ยังไม่มีงานเฉพาะ ใช้ธีมเดือนนี้: ${guideData.theme} แล้วหยิบไอเดีย "${title}" เป็นคอนเทนต์สำรองได้`;

  const shots = [
    ...pillarData.shots.slice(0, 4),
    "ภาพปิดท้ายที่เห็นผลลัพธ์หรือช่องทางติดต่อ",
  ];

  const video = [
    `เปิดด้วยคำถามหรือภาพปัญหา: ${title}`,
    `ให้เห็นพื้นที่จริงและคนทำงานจริง`,
    `เล่า 1-2 ขั้นตอนที่เทศบาลลงมือ`,
    "ปิดด้วยผลลัพธ์ ประโยชน์กับประชาชน และช่องทางแจ้งเหตุ/ติดตามข่าว",
  ];

  return {
    title,
    pillar,
    note,
    angle,
    shots,
    video,
    pillarData,
    item: target,
    location: displayLocation(target),
    owner: displayOwner(target),
    responsible: displayResponsible(target),
    action: displayAction(target),
    channel: displayChannel(target),
    time: displayTime(target),
  };
}

function shortTitle(title = "") {
  let t = String(title).split(" / ")[0].trim();
  const map = {
    "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว": "วันเฉลิมฯ ร.10",
    "วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี": "วันเฉลิมฯ พระราชินี",
    "วันสถาปนาลูกเสือแห่งชาติ": "วันสถาปนาลูกเสือฯ",
    "วันคล้ายวันสวรรคตพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร": "วันนวมินทรมหาราช",
  };
  if (map[t]) return map[t];
  if (t.length > 24) t = t.slice(0, 22).trim() + "ฯ";
  return t;
}

function itemClass(item) {
  if (item.source === "buddhist") return "buddhist";
  if (item.source === "user") return item.type === "โน้ตทีม" ? "note" : item.type === "วันของเทศบาล" ? "custom" : "work";
  return "holiday";
}

function itemTag(item) {
  if (item.source === "buddhist") return "วันพระ";
  if (item.source === "event") return item.type;
  return item.type || "งานทีม";
}

function renderShell() {
  document.getElementById("today-weekday").textContent = `วัน${weekDays[safeToday().getDay()]}`;
  document.getElementById("today-number").textContent = safeToday().getDate();
  document.getElementById("today-month").textContent = `${thaiMonths[safeToday().getMonth()]} ${safeToday().getFullYear() + 543}`;

  document.querySelectorAll("select[name='type']").forEach((select) => {
    select.innerHTML = entryTypes.map((type) => `<option>${type}</option>`).join("");
  });
  document.querySelectorAll("select[name='pillar']").forEach((select) => {
    select.innerHTML = Object.keys(pillars).map((pillar) => `<option>${pillar}</option>`).join("");
  });
  document.querySelectorAll("select[name='status']").forEach((select) => {
    select.innerHTML = statuses.map((status) => `<option>${status}</option>`).join("");
  });

  const monthSelect = document.getElementById("month-select");
  monthSelect.innerHTML = thaiMonths.map((month, index) => `<option value="${index}">${month} ${THAI_YEAR}</option>`).join("");
  monthSelect.value = String(activeMonth);
}

function renderCalendar() {
  const monthStart = new Date(YEAR, activeMonth, 1);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(YEAR, activeMonth, 1 - startOffset);
  const todayIso = toISO(safeToday());
  const cells = [];
  const pulseItems = [];

  document.getElementById("calendar-title").textContent = `${thaiMonths[activeMonth]} ${THAI_YEAR}`;
  document.getElementById("month-select").value = String(activeMonth);

  const daysInMonth = new Date(YEAR, activeMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toISO(new Date(YEAR, activeMonth, day));
    const dayItems = allItemsForDate(iso);
    const hasWork = dayItems.some((item) => item.source === "user");
    const hasEvent = dayItems.some((item) => item.source === "event");
    const hasBuddhist = dayItems.some((item) => item.source === "buddhist");
    const pulseClass = hasWork ? "work" : hasEvent ? "event" : hasBuddhist ? "buddhist" : "";
    pulseItems.push(`<button class="pulse-dot ${pulseClass}" type="button" data-open-date="${iso}" title="${day} ${thaiMonths[activeMonth]}"></button>`);
  }

  const monthPulse = document.getElementById("month-pulse");
  if (monthPulse) monthPulse.innerHTML = pulseItems.join("");

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = toISO(date);
    const items = allItemsForDate(iso);
    const visible = items.slice(0, 3);
    const hidden = Math.max(items.length - visible.length, 0);
    const classes = [
      "day-cell",
      date.getMonth() !== activeMonth ? "muted" : "",
      iso === todayIso ? "today" : "",
      iso === selectedDate ? "selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    cells.push(`
      <button class="${classes}" type="button" data-open-date="${iso}" aria-label="เปิดวันที่ ${thaiDate(date)}" title="คลิกเพื่อดูงาน ดับเบิ้ลคลิกเพื่อเพิ่มงาน">
        <span class="day-number">
          <span>${date.getDate()}</span>
          ${iso === todayIso ? '<span class="today-tag">วันนี้</span>' : ""}
        </span>
        ${visible.map((item) => `<span class="event-pill ${itemClass(item)}" title="${escapeHtml(item.title)}">${escapeHtml(shortTitle(item.title))}</span>`).join("")}
        ${hidden ? `<span class="event-pill more">+${hidden} รายการ</span>` : ""}
      </button>
    `);
  }

  document.getElementById("calendar-grid").innerHTML = cells.join("");
}

function renderDay() {
  const date = parseISO(selectedDate);
  const items = allItemsForDate(selectedDate);
  const advice = adviceForDate(selectedDate);
  const daySummary = `${advice.time} · ${advice.location} · ${advice.channel}`;
  const dayPanel = document.querySelector(".day-panel");
  if (dayPanel) {
    dayPanel.classList.remove("is-refreshing");
    void dayPanel.offsetWidth;
    dayPanel.classList.add("is-refreshing");
  }

  document.getElementById("selected-date-title").textContent = thaiDate(date);
  document.getElementById("pulse-title").textContent = advice.title;
  document.getElementById("pulse-date").textContent = thaiDate(date);
  document.getElementById("pulse-location").textContent = advice.location;
  document.getElementById("pulse-action").textContent = advice.action;
  document.getElementById("pulse-channel").textContent = advice.channel;
  document.getElementById("command-title").textContent = advice.title;
  document.getElementById("command-subtitle").textContent = daySummary;
  document.getElementById("command-time").textContent = `เวลา: ${advice.time}`;
  document.getElementById("command-location").textContent = `สถานที่: ${advice.location}`;
  document.getElementById("command-owner").textContent = `เจ้าของงาน: ${advice.owner}`;
  document.getElementById("command-responsible").textContent = `ผู้รับผิดชอบ: ${advice.responsible}`;
  document.getElementById("advice-title").textContent = advice.title;
  document.getElementById("advice-angle").textContent = `${advice.angle} | เสาหลัก: ${advice.pillar}`;
  document.getElementById("shot-list").innerHTML = advice.shots.map((shot) => `<li>${escapeHtml(shot)}</li>`).join("");
  document.getElementById("video-plan").innerHTML = advice.video.map((step) => `<li>${escapeHtml(step)}</li>`).join("");

  document.getElementById("day-items").innerHTML = items.length
    ? items
        .map(
          (item) => `
          <article class="day-item">
            ${
              displayImage(item)
                ? `<div class="work-card-image"><img src="${escapeHtml(displayImage(item))}" alt="ภาพประกอบ ${escapeHtml(item.title)}" /></div>`
                : item.source === "user"
                  ? '<div class="work-card-visual"><span>BRN PR</span><strong>FIELD CARD</strong></div>'
                  : ""
            }
            <div class="item-meta">
              <span class="tag ${itemClass(item)}">${escapeHtml(itemTag(item))}</span>
              <span class="tag" style="background:${pillars[item.pillar]?.color || pillars["เมืองสมดุล"].color}">${escapeHtml(item.pillar || "เมืองสมดุล")}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
            <small>${escapeHtml([displayTime(item), displayLocation(item), displayOwner(item), displayResponsible(item), displayChannel(item), item.status].filter(Boolean).join(" · "))}</small>
            <div class="card-actions work-ai-actions">
              <button class="mini-button primary" type="button" data-ai-action="post">คิดโพสต์</button>
              <button class="mini-button" type="button" data-ai-action="shots">ภาพที่ต้องถ่าย</button>
              <button class="mini-button" type="button" data-ai-action="short">สคริปต์คลิป</button>
              <button class="mini-button" type="button" data-ai-action="field">เช็กลิสต์</button>
              ${item.source === "user" ? `<button class="mini-button" type="button" data-edit-entry="${item.id}">✏️ แก้ไข</button><button class="mini-button danger-mini" type="button" data-delete-entry="${item.id}">ลบ</button>` : ""}
            </div>
          </article>
        `
        )
        .join("")
    : `<div class="empty-state compact-empty">วันนี้ยังไม่มีงานที่จดไว้ กด “จดงานวันนี้” เพื่อเพิ่มงานเทศบาลลงปฏิทิน</div>`;
}

function renderStats() {
  const items = itemsForMonth(activeMonth);
  document.getElementById("stat-events").textContent = items.filter((item) => item.source === "event").length;
  document.getElementById("stat-buddhist").textContent = items.filter((item) => item.source === "buddhist").length;
  document.getElementById("stat-work").textContent = items.filter((item) => item.source === "user").length;
  document.getElementById("stat-ready").textContent = entries.filter((item) => item.date.includes(`-${String(activeMonth + 1).padStart(2, "0")}-`) && item.status === "✅ โพสต์แล้ว").length;
}

function startOfWeek(date) {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  return start;
}

function renderWeekIdeas() {
  const start = startOfWeek(parseISO(selectedDate));
  const guideData = monthGuides[activeMonth];
  const rows = [];

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = toISO(date);
    const items = allItemsForDate(iso);
    const item = preferredItem(items);
    const ideaData = item || guideData.ideas[(i + ideaOffset) % guideData.ideas.length];
    const title = item ? item.title : ideaData.title;
    const note = item ? item.note : ideaData.note;
    const pillar = item?.pillar || ideaData.pillar || "เมืองสมดุล";

    rows.push(`
      <article class="week-card">
        <div class="week-date">
          <span>วัน${weekDays[date.getDay()]}</span>
          <strong>${shortThaiDate(iso)}</strong>
        </div>
        <div>
          <div class="item-meta">
            <span class="tag" style="background:${pillars[pillar]?.color || pillars["เมืองสมดุล"].color}">${escapeHtml(pillar)}</span>
            ${item ? `<span class="tag ${itemClass(item)}">${escapeHtml(itemTag(item))}</span>` : '<span class="tag holiday">ไอเดียสำรอง</span>'}
          </div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(note || pillars[pillar]?.angle || "")}</p>
        </div>
        <div class="card-actions">
          <button class="mini-button" type="button" data-open-date="${iso}">เปิดวัน</button>
          ${item ? "" : `<button class="mini-button primary" type="button" data-add-idea="${guideData.ideas.indexOf(ideaData)}" data-idea-date="${iso}">เพิ่มลงวัน</button>`}
        </div>
      </article>
    `);
  }

  document.getElementById("week-list").innerHTML = rows.join("");
}

function renderMonthFocus() {
  const guideData = activeGuide();
  document.getElementById("month-direction-title").textContent = `${thaiMonths[activeMonth]}ควรเล่าเรื่องอะไร`;
  document.getElementById("month-focus").innerHTML = guideData.ideas
    .map(
      (item, index) => `
      <article class="focus-card">
        <div class="item-meta">
          <span class="tag" style="background:${pillars[item.pillar]?.color || pillars["เมืองสมดุล"].color}">${escapeHtml(item.pillar)}</span>
          <span class="tag holiday">${escapeHtml(item.format)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.note)}</p>
        <div class="card-actions">
          <button class="mini-button primary" type="button" data-add-idea="${index}" data-idea-date="${selectedDate}">เพิ่มลงวันที่เลือก</button>
          <button class="mini-button" type="button" data-prompt-idea="${index}">ทำ Prompt</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderBoard() {
  document.getElementById("board-grid").innerHTML = statuses
    .map((status) => {
      const tasks = entries.filter((item) => item.status === status);
      return `
        <section class="board-column">
          <h3>${status} (${tasks.length})</h3>
          ${
            tasks.length
              ? tasks
                  .map(
                    (item) => `
                    <article class="board-task">
                      ${displayImage(item) ? `<div class="board-task-image"><img src="${escapeHtml(displayImage(item))}" alt="ภาพประกอบ ${escapeHtml(item.title)}" /></div>` : ""}
                      <strong>${escapeHtml(item.title)}</strong>
                      <small>${thaiDate(parseISO(item.date))} · ${escapeHtml(displayTime(item))} · ${escapeHtml(displayLocation(item))}</small>
                      <small>${escapeHtml(item.type)} · ${escapeHtml(displayChannel(item))} · เจ้าของงาน: ${escapeHtml(displayOwner(item))}</small>
                      <small>ผู้รับผิดชอบ: ${escapeHtml(displayResponsible(item))}</small>
                      <small>${escapeHtml(item.note || "ยังไม่มีโน้ต")}</small>
                      <div class="board-actions">
                        <button type="button" data-open-date="${item.date}">เปิด</button>
                        ${status !== statuses[statuses.length - 1] ? `<button type="button" data-next-status="${item.id}">ต่อไป</button>` : ""}
                        <button type="button" data-edit-entry="${item.id}">แก้ไข</button>
                        <button type="button" data-delete-entry="${item.id}">ลบ</button>
                      </div>
                    </article>
                  `
                  )
                  .join("")
              : '<div class="empty-state">ยังไม่มีงานในสถานะนี้</div>'
          }
        </section>
      `;
    })
    .join("");
}

function createPromptFromDetails(promptType, details) {
  const advice = adviceForDate(selectedDate);
  const dateText = thaiDate(parseISO(selectedDate));
  return `ช่วยวางคอนเทนต์สำหรับทีมประชาสัมพันธ์ เทศบาลเมืองบางรักน้อย

รูปแบบที่ต้องการ: ${promptType}
วันที่/บริบท: ${dateText}
เสาหลัก: ${advice.pillar}

ข้อมูลหน้างาน:
${details || promptDetailsForSelectedDay()}

กรอบการเล่าเรื่อง:
1. เริ่มจากสิ่งที่ประชาชนเจอหรือประโยชน์ที่ประชาชนจะได้รับ
2. อธิบายว่าเทศบาลลงมือทำอะไร โดยใช้ภาษาประชาชน ไม่แข็งแบบหนังสือราชการ
3. ใส่ข้อมูลจำเป็น เช่น สถานที่ เวลา ช่องทางแจ้งเหตุ หรือข้อควรปฏิบัติ
4. ระวังข้อมูลส่วนตัว เด็ก ผู้ป่วย ผู้เดือดร้อน เอกสารราชการ และเลขบ้าน/ทะเบียนรถ
5. เชื่อมกับวิสัยทัศน์: พัฒนาเมืองอย่างสมดุล สะอาด ปลอดภัย ใส่ใจสิ่งแวดล้อม และเสริมสร้างคุณภาพชีวิตของประชาชนทุกมิติ

ช่วยตอบเป็น:
- หัวข้อโพสต์ 3 แบบ
- Hook เปิดคลิป 3 วินาทีแรก
- แคปชันภาษาไทยสุภาพ ทันสมัย เข้าใจง่าย
- Shot list ที่ควรถ่าย
- CTA ปิดท้าย
- เช็กลิสต์ความเสี่ยงก่อนเผยแพร่`;
}

function promptDetailsForSelectedDay() {
  const items = allItemsForDate(selectedDate);
  const advice = adviceForDate(selectedDate);
  const lines = [
    `วันที่: ${thaiDate(parseISO(selectedDate))}`,
    `ประเด็นหลัก: ${advice.title}`,
    `เวลา: ${advice.time}`,
    `สถานที่: ${advice.location}`,
    `เจ้าของงาน: ${advice.owner}`,
    `ผู้รับผิดชอบ: ${advice.responsible}`,
    `ช่องทางที่เหมาะ: ${advice.channel}`,
    `สิ่งที่ต้องทำ: ${advice.action}`,
    `มุมเล่าเรื่อง: ${advice.angle}`,
    items.length ? `รายการในปฏิทิน: ${items.map((item) => item.title).join(", ")}` : "รายการในปฏิทิน: ยังไม่มีงานเฉพาะ ใช้เป็นไอเดียสำรองของเดือน",
    items.some((item) => displayImage(item)) ? "ภาพประกอบ: มีภาพแนบในงานของวันนี้ ใช้เป็นภาพอ้างอิงในการคิดคอนเทนต์ได้" : "ภาพประกอบ: ยังไม่มีภาพแนบ",
    `ควรถ่าย: ${advice.shots.join(", ")}`,
    `แนวคลิป: ${advice.video.join(" | ")}`,
  ];
  return lines.join("\n");
}

function renderPromptOutput() {
  const type = document.getElementById("prompt-type").value;
  const details = document.getElementById("prompt-details").value.trim();
  document.getElementById("prompt-output").value = createPromptFromDetails(type, details);
}

function applyAiAction(action) {
  const advice = adviceForDate(selectedDate);
  const actionMap = {
    post: {
      type: "โพสต์ Facebook",
      label: "คิดโพสต์ประชาสัมพันธ์",
      ask: "ช่วยคิดโพสต์ Facebook ให้ประชาชนอ่านแล้วเข้าใจทันที",
    },
    short: {
      type: "YouTube Shorts",
      label: "ทำสคริปต์คลิปสั้น",
      ask: "ช่วยทำสคริปต์คลิปสั้น 30-45 วินาที พร้อม Hook และลำดับภาพ",
    },
    shots: {
      type: "ข่าวประชาสัมพันธ์",
      label: "แตก Shot list",
      ask: "ช่วยแตก Shot list แบบละเอียดสำหรับทีมลงพื้นที่ถ่ายภาพและวิดีโอ",
    },
    field: {
      type: "ข่าวประชาสัมพันธ์",
      label: "เช็กลิสต์หน้างาน",
      ask: "ช่วยทำเช็กลิสต์ก่อนลงพื้นที่ ระหว่างถ่าย และก่อนเผยแพร่",
    },
  };
  const config = actionMap[action] || actionMap.post;
  document.getElementById("prompt-type").value = config.type;
  document.getElementById("prompt-details").value = [
    `คำสั่ง: ${config.ask}`,
    `วันที่: ${thaiDate(parseISO(selectedDate))}`,
    `ประเด็น: ${advice.title}`,
    `เวลา: ${advice.time}`,
    `สถานที่: ${advice.location}`,
    `เจ้าของงาน: ${advice.owner}`,
    `ผู้รับผิดชอบ: ${advice.responsible}`,
    `ช่องทาง: ${advice.channel}`,
    `สิ่งที่ต้องทำ: ${advice.action}`,
    `มุมเล่าเรื่อง: ${advice.angle}`,
    `ควรถ่าย: ${advice.shots.join(", ")}`,
    `แนวคลิป: ${advice.video.join(" | ")}`,
  ].join("\n");
  renderPromptOutput();
  document.getElementById("prompt").scrollIntoView({ behavior: "smooth" });
  toast(`เตรียม Prompt: ${config.label}`);
}

function formValue(data, key, fallback = "") {
  return data.get(key)?.toString().trim() || fallback;
}

function readFileAsDataUrl(file) {
  if (!file || !file.size) return Promise.resolve("");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }

    const image = new Image();
    image.onload = () => {
      const maxSize = 1100;
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      if (ratio >= 1) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * ratio);
      canvas.height = Math.round(image.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

async function fileToDataUrl(file) {
  const dataUrl = await readFileAsDataUrl(file);
  return resizeImageDataUrl(dataUrl);
}

async function entryFromForm(form, date = selectedDate) {
  const data = new FormData(form);
  const title = formValue(data, "title");
  const noteParts = [formValue(data, "noteQuick"), formValue(data, "note")].filter(Boolean);
  const imageFile = data.get("image");
  const image = imageFile && typeof imageFile.size === "number" && imageFile.size > 0 ? await fileToDataUrl(imageFile) : "";
  if (!title) return null;

  return {
    id: `entry-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    date,
    time: formValue(data, "time", "ยังไม่ระบุเวลา"),
    location: formValue(data, "location", "รอระบุสถานที่"),
    owner: formValue(data, "owner", "รอระบุเจ้าของงาน"),
    responsible: formValue(data, "responsible", "ทีม PR"),
    title,
    type: formValue(data, "type", "งานเทศบาล"),
    pillar: formValue(data, "pillar", "เมืองสมดุล"),
    channel: formValue(data, "channel", "Facebook"),
    status: formValue(data, "status", "📋 รอถ่าย"),
    note: noteParts.join(" | "),
    image,
  };
}

function addEntry(entry) {
  if (!entry) return;
  entries = [...entries, entry];
  saveEntries();
  selectedDate = entry.date;
  activeMonth = parseISO(entry.date).getMonth();
  rerender();
  toast(`เพิ่ม "${entry.title}" ลงปฏิทินแล้ว`);
}

function addIdeaToDate(ideaIndex, iso) {
  const guideData = monthGuides[parseISO(iso).getMonth()];
  const item = guideData.ideas[Number(ideaIndex)];
  if (!item) return;
  addEntry({
    id: `entry-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    date: iso,
    time: "ตามแผนทีม",
    location: "พื้นที่ตามแผนคอนเทนต์",
    owner: "ทีม PR",
    responsible: "ทีม PR",
    title: item.title,
    type: "คอนเทนต์ไอเดีย",
    pillar: item.pillar,
    channel: "Facebook",
    status: "📋 รอถ่าย",
    note: `${item.format}: ${item.note}`,
    image: "",
  });
}

function toast(message) {
  const toastEl = document.getElementById("toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function rerender() {
  renderCalendar();
  renderDay();
  renderStats();
  renderWeekIdeas();
  renderMonthFocus();
  renderBoard();
  renderPromptOutput();
}

function setSelectValue(select, value) {
  if (!select || !value) return;
  const option = [...select.options].find((item) => item.value === value || item.textContent === value);
  if (option) select.value = option.value;
}

function openWorkModal(iso = selectedDate) {
  const modal = document.getElementById("work-modal");
  const form = document.getElementById("modal-work-form");
  if (!modal || !form) return;

  editingEntryId = null;
  const modalTitleEl = document.getElementById("modal-title");
  if (modalTitleEl) modalTitleEl.textContent = "จดงานเทศบาลลงปฏิทิน";
  const modalSubmitEl = form.querySelector('button[type="submit"]');
  if (modalSubmitEl) modalSubmitEl.textContent = "จดงานลงวันนี้";

  selectedDate = iso;
  activeMonth = parseISO(iso).getMonth();
  const advice = adviceForDate(iso);
  form.reset();
  document.getElementById("modal-date-title").textContent = thaiDate(parseISO(iso));
  form.elements.dateText.value = thaiDate(parseISO(iso));
  form.elements.location.value = advice.location === "พื้นที่เทศบาลเมืองบางรักน้อย" ? "" : advice.location;
  form.elements.owner.value = advice.owner === "ทีม PR" ? "" : advice.owner;
  form.elements.responsible.value = advice.responsible;
  form.elements.noteQuick.value = advice.shots.slice(0, 3).join(", ");
  setSelectValue(form.elements.channel, advice.channel);
  setSelectValue(form.elements.pillar, advice.pillar);
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => form.elements.title.focus(), 40);
}

function openEditModal(id) {
  const item = entries.find((entry) => entry.id === id);
  if (!item) return;
  openWorkModal(item.date);
  const form = document.getElementById("modal-work-form");
  if (!form) return;
  editingEntryId = id;
  form.elements.title.value = item.title || "";
  form.elements.time.value = item.time === "ยังไม่ระบุเวลา" ? "" : item.time || "";
  form.elements.location.value = item.location === "รอระบุสถานที่" ? "" : item.location || "";
  form.elements.owner.value = item.owner === "รอระบุเจ้าของงาน" ? "" : item.owner || "";
  form.elements.responsible.value = item.responsible || "";
  if (form.elements.noteQuick) form.elements.noteQuick.value = "";
  if (form.elements.note) form.elements.note.value = item.note || "";
  setSelectValue(form.elements.type, item.type);
  setSelectValue(form.elements.pillar, item.pillar);
  setSelectValue(form.elements.channel, item.channel);
  setSelectValue(form.elements.status, item.status);
  const modalTitleEl = document.getElementById("modal-title");
  if (modalTitleEl) modalTitleEl.textContent = "แก้ไขงานในปฏิทิน";
  const modalSubmitEl = form.querySelector('button[type="submit"]');
  if (modalSubmitEl) modalSubmitEl.textContent = "บันทึกการแก้ไข";
}

function updateEntry(id, patch) {
  if (!patch) return;
  const old = entries.find((entry) => entry.id === id);
  if (!old) {
    addEntry(patch);
    return;
  }
  const updated = { ...patch, id, image: patch.image || old.image };
  entries = entries.map((entry) => (entry.id === id ? updated : entry));
  editingEntryId = null;
  saveEntries();
  selectedDate = updated.date;
  activeMonth = parseISO(updated.date).getMonth();
  rerender();
  toast(`อัปเดต "${updated.title}" เรียบร้อย`);
}

function closeWorkModal() {
  const modal = document.getElementById("work-modal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function cueQuickForm({ focus = false, scroll = false } = {}) {
  const form = document.getElementById("quick-form");
  if (!form) return;
  form.classList.remove("is-focus");
  void form.offsetWidth;
  form.classList.add("is-focus");
  clearTimeout(cueQuickForm.timer);
  cueQuickForm.timer = setTimeout(() => form.classList.remove("is-focus"), 1400);
  if (scroll) form.scrollIntoView({ behavior: "smooth", block: "center" });
  if (focus) setTimeout(() => form.elements.title?.focus(), 180);
}

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const goToday = () => {
    selectedDate = toISO(safeToday());
    activeMonth = parseISO(selectedDate).getMonth();
    rerender();
    document.getElementById("calendar").scrollIntoView({ behavior: "smooth" });
  };

  [document.getElementById("go-today"), document.getElementById("go-today-inline")]
    .filter(Boolean)
    .forEach((button) => button.addEventListener("click", goToday));

  document.getElementById("prev-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 11) % 12;
    selectedDate = toISO(new Date(YEAR, activeMonth, 1));
    rerender();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 1) % 12;
    selectedDate = toISO(new Date(YEAR, activeMonth, 1));
    rerender();
  });

  document.getElementById("month-select").addEventListener("change", (event) => {
    activeMonth = Number(event.target.value);
    selectedDate = toISO(new Date(YEAR, activeMonth, 1));
    rerender();
  });

  document.body.addEventListener("click", (event) => {
    const quickAddButton = event.target.closest("[data-focus-quick-add]");
    if (quickAddButton) {
      cueQuickForm({ focus: true, scroll: true });
      return;
    }

    const modalButton = event.target.closest("[data-open-work-modal]");
    if (modalButton) {
      openWorkModal(selectedDate);
      return;
    }

    const openButton = event.target.closest("[data-open-date]");
    if (openButton) {
      selectedDate = openButton.dataset.openDate;
      activeMonth = parseISO(selectedDate).getMonth();
      rerender();
      if (openButton.closest("#calendar-grid")) {
        openWorkModal(selectedDate);
      } else {
        document.getElementById("calendar").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const addIdeaButton = event.target.closest("[data-add-idea]");
    if (addIdeaButton) {
      addIdeaToDate(addIdeaButton.dataset.addIdea, addIdeaButton.dataset.ideaDate || selectedDate);
      return;
    }

    const promptIdeaButton = event.target.closest("[data-prompt-idea]");
    if (promptIdeaButton) {
      const guideData = activeGuide();
      const item = guideData.ideas[Number(promptIdeaButton.dataset.promptIdea)];
      document.getElementById("prompt-details").value = [
        `ไอเดีย: ${item.title}`,
        `เสาหลัก: ${item.pillar}`,
        `รูปแบบ: ${item.format}`,
        `โน้ต: ${item.note}`,
      ].join("\n");
      renderPromptOutput();
      document.getElementById("prompt").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const aiActionButton = event.target.closest("[data-ai-action]");
    if (aiActionButton) {
      applyAiAction(aiActionButton.dataset.aiAction);
      return;
    }

    const nextButton = event.target.closest("[data-next-status]");
    if (nextButton) {
      const id = nextButton.dataset.nextStatus;
      entries = entries.map((item) => {
        if (item.id !== id) return item;
        const nextIndex = Math.min(statuses.indexOf(item.status) + 1, statuses.length - 1);
        return { ...item, status: statuses[nextIndex] };
      });
      saveEntries();
      rerender();
      return;
    }

    const editButton = event.target.closest("[data-edit-entry]");
    if (editButton) {
      openEditModal(editButton.dataset.editEntry);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-entry]");
    if (deleteButton) {
      const id = deleteButton.dataset.deleteEntry;
      const item = entries.find((entry) => entry.id === id);
      if (!item || !window.confirm(`ลบ "${item.title}" ออกจากปฏิทินใช่ไหม`)) return;
      entries = entries.filter((entry) => entry.id !== id);
      saveEntries();
      rerender();
      toast("ลบงานออกจากปฏิทินแล้ว");
    }
  });

  document.body.addEventListener("dblclick", (event) => {
    const dayButton = event.target.closest("#calendar-grid [data-open-date]");
    if (!dayButton) return;
    event.preventDefault();
    selectedDate = dayButton.dataset.openDate;
    activeMonth = parseISO(selectedDate).getMonth();
    rerender();
    openWorkModal(selectedDate);
  });

  document.body.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal]")) {
      closeWorkModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeWorkModal();
  });

  document.getElementById("quick-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = event.submitter;
    if (submitter) submitter.disabled = true;
    try {
      const entry = await entryFromForm(form, selectedDate);
      addEntry(entry);
      if (entry) form.reset();
    } catch {
      toast("อ่านภาพประกอบไม่สำเร็จ ลองเลือกรูปใหม่อีกครั้ง");
    } finally {
      if (submitter) submitter.disabled = false;
    }
  });

  document.getElementById("modal-work-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = event.submitter;
    if (submitter) submitter.disabled = true;
    try {
      const entry = await entryFromForm(form, selectedDate);
      if (editingEntryId) {
        if (entry) updateEntry(editingEntryId, entry);
      } else {
        addEntry(entry);
      }
      if (entry) closeWorkModal();
      if (entry) form.reset();
    } catch {
      toast("อ่านภาพประกอบไม่สำเร็จ ลองเลือกรูปใหม่อีกครั้ง");
    } finally {
      if (submitter) submitter.disabled = false;
    }
  });

  document.getElementById("shuffle-week").addEventListener("click", () => {
    ideaOffset += 1;
    renderWeekIdeas();
    renderDay();
    renderPromptOutput();
  });

  document.getElementById("reset-demo").addEventListener("click", () => {
    if (!window.confirm("คืนค่างานตัวอย่างและลบงานที่เพิ่มไว้ในเครื่องนี้ใช่ไหม")) return;
    entries = [...defaultEntries];
    saveEntries();
    rerender();
    toast("คืนค่างานตัวอย่างแล้ว");
  });

  document.getElementById("use-day-prompt").addEventListener("click", () => {
    document.getElementById("prompt-details").value = promptDetailsForSelectedDay();
    renderPromptOutput();
    document.getElementById("prompt").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("prompt-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderPromptOutput();
    toast("สร้าง Prompt แล้ว");
  });

  document.getElementById("copy-prompt").addEventListener("click", async () => {
    const output = document.getElementById("prompt-output");
    if (!output.value) renderPromptOutput();
    output.select();
    try {
      await navigator.clipboard.writeText(output.value);
      toast("คัดลอก Prompt แล้ว");
    } catch {
      document.execCommand("copy");
      toast("คัดลอก Prompt แล้ว");
    }
  });
}

renderShell();
bindEvents();
rerender();
