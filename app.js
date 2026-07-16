const YEAR = 2026;
const TASK_KEY = "brn-pr-command-calendar-v4-items";

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

const statuses = ["ไอเดีย", "รอถ่าย", "ตัดต่อ", "รออนุมัติ", "เผยแพร่แล้ว"];
const entryTypes = ["งานเทศบาล", "วัน/กิจกรรม", "โน้ตทีม", "คอนเทนต์ไอเดีย"];

const pillars = {
  "เมืองสมดุล": {
    color: "#32155f",
    angle: "เล่าให้เห็นว่าการจัดการเมืองมีระบบ มีลำดับ และเกี่ยวกับชีวิตประจำวันของประชาชนจริง",
  },
  "สะอาด": {
    color: "#0f766e",
    angle: "ขยะ ท่อ คลอง ตลาด และพื้นที่สาธารณะ ต้องเห็นภาพก่อน-หลัง และผลลัพธ์ที่ประชาชนสัมผัสได้",
  },
  "ปลอดภัย": {
    color: "#cf4438",
    angle: "ไฟถนน ฝน น้ำท่วม จุดเสี่ยง และการเตือนภัย ควรสื่อสารแบบเร็ว ชัด และบอกช่องทางแจ้งเหตุ",
  },
  "สิ่งแวดล้อม": {
    color: "#138a80",
    angle: "ต้นไม้ คลอง การลดขยะ และพฤติกรรมรักษ์เมือง ให้ประชาชนรู้สึกว่าเขาเป็นส่วนหนึ่งของเมือง",
  },
  "คุณภาพชีวิต": {
    color: "#ff781f",
    angle: "เด็ก ผู้สูงอายุ สุขภาพ กีฬา อาชีพ และบริการประชาชน ต้องเล่าแบบอบอุ่นแต่ยังน่าเชื่อถือ",
  },
};

const importantEvents = [
  ["2026-01-01", "วันขึ้นปีใหม่", "คุณภาพชีวิต", "อวยพรปีใหม่ สรุปช่องทางบริการ และเตือนการเดินทางปลอดภัย"],
  ["2026-01-10", "วันเด็กแห่งชาติ", "คุณภาพชีวิต", "กิจกรรมเด็ก สิทธิเด็ก พื้นที่ปลอดภัย และครอบครัวในชุมชน"],
  ["2026-01-14", "วันอนุรักษ์ทรัพยากรป่าไม้ของชาติ", "สิ่งแวดล้อม", "ชวนดูแลต้นไม้ พื้นที่สีเขียว และการลดขยะในชุมชน"],
  ["2026-03-18", "วันท้องถิ่นไทย", "เมืองสมดุล", "เล่า 1 วันของเทศบาลว่าดูแลเมืองอย่างไร"],
  ["2026-03-22", "วันน้ำโลก", "สิ่งแวดล้อม", "คลอง ท่อระบายน้ำ การใช้น้ำ และการไม่ทิ้งขยะลงน้ำ"],
  ["2026-04-13", "สงกรานต์ / วันผู้สูงอายุ", "คุณภาพชีวิต", "ผู้สูงอายุ ครอบครัว จุดบริการ และความปลอดภัยช่วงหยุดยาว"],
  ["2026-04-24", "วันเทศบาล", "เมืองสมดุล", "5 งานเทศบาลใกล้ชีวิตประชาชน"],
  ["2026-05-31", "วันวิสาขบูชา / วันต้นไม้", "สิ่งแวดล้อม", "ทำบุญ ปลูกต้นไม้ และรักษาความสะอาดวัด"],
  ["2026-06-05", "วันสิ่งแวดล้อมโลก", "สิ่งแวดล้อม", "ลดขยะ แยกขยะ คลองสะอาด และพื้นที่สีเขียว"],
  ["2026-06-15", "วันไข้เลือดออกอาเซียน", "คุณภาพชีวิต", "สำรวจลูกน้ำยุงลาย 3 จุดในบ้านและชุมชน"],
  ["2026-06-26", "วันต่อต้านยาเสพติดโลก", "ปลอดภัย", "สื่อสารเชิงป้องกันสำหรับเยาวชนและครอบครัว"],
  ["2026-07-01", "วันสถาปนาลูกเสือแห่งชาติ", "คุณภาพชีวิต", "เยาวชน จิตอาสา ระเบียบวินัย และการช่วยชุมชน"],
  ["2026-07-28", "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", "เมืองสมดุล", "กิจกรรมจิตอาสาพัฒนาเมืองและดูแลพื้นที่สาธารณะ"],
  ["2026-07-29", "วันอาสาฬหบูชา / วันภาษาไทยแห่งชาติ", "คุณภาพชีวิต", "เวียนเทียน วัด ชุมชน และการใช้ภาษาราชการให้ประชาชนเข้าใจ"],
  ["2026-07-30", "วันเข้าพรรษา", "คุณภาพชีวิต", "ถวายเทียน งดเหล้าเข้าพรรษา ดูแลวัด และการเดินทางปลอดภัย"],
  ["2026-08-12", "วันแม่แห่งชาติ", "คุณภาพชีวิต", "ครอบครัว แม่ ผู้สูงอายุ และชุมชนดูแลกัน"],
  ["2026-09-20", "วันเยาวชนแห่งชาติ / วันอนุรักษ์คลอง", "สิ่งแวดล้อม", "เยาวชนร่วมดูแลคลองและเสนอไอเดียเมือง"],
  ["2026-09-24", "วันมหิดล", "คุณภาพชีวิต", "สาธารณสุข อสม. และบริการกลุ่มเปราะบาง"],
  ["2026-10-13", "วันคล้ายวันสวรรคต รัชกาลที่ 9", "เมืองสมดุล", "น้อมรำลึก กิจกรรมจิตอาสา และการทำความดีเพื่อชุมชน"],
  ["2026-10-23", "วันปิยมหาราช", "เมืองสมดุล", "เชื่อมประวัติศาสตร์กับการบริการประชาชน"],
  ["2026-10-26", "วันออกพรรษา", "คุณภาพชีวิต", "งานวัด ประเพณี และการจัดการจราจร"],
  ["2026-11-24", "วันลอยกระทง", "สิ่งแวดล้อม", "กระทงธรรมชาติ ความปลอดภัย และการเก็บขยะหลังงาน"],
  ["2026-12-04", "วันสิ่งแวดล้อมไทย", "สิ่งแวดล้อม", "สรุปผลงานลดขยะ เพิ่มพื้นที่สีเขียว และคลองสะอาด"],
  ["2026-12-05", "วันพ่อแห่งชาติ / วันชาติ", "เมืองสมดุล", "น้อมรำลึก กิจกรรมจิตอาสา และคุณภาพชีวิต"],
  ["2026-12-10", "วันรัฐธรรมนูญ", "เมืองสมดุล", "สิทธิ หน้าที่ และการมีส่วนร่วมของประชาชน"],
  ["2026-12-31", "วันสิ้นปี", "ปลอดภัย", "สรุปผลงานทั้งปีและเตือนเดินทางปลอดภัย"],
].map(([date, title, pillar, idea]) => ({ date, title, pillar, idea, type: "วันสำคัญ", channel: "หลายช่องทาง" }));

const buddhistDays = [
  ["2026-01-03", "ขึ้น ๑๕ ค่ำ เดือนยี่ (๒)"],
  ["2026-01-11", "แรม ๘ ค่ำ เดือนยี่ (๒)"],
  ["2026-01-18", "แรม ๑๕ ค่ำ เดือนยี่ (๒)"],
  ["2026-01-26", "ขึ้น ๘ ค่ำ เดือนสาม (๓)"],
  ["2026-02-02", "ขึ้น ๑๕ ค่ำ เดือนสาม (๓)"],
  ["2026-02-10", "แรม ๘ ค่ำ เดือนสาม (๓)"],
  ["2026-02-16", "แรม ๑๔ ค่ำ เดือนสาม (๓)"],
  ["2026-02-24", "ขึ้น ๘ ค่ำ เดือนสี่ (๔)"],
  ["2026-03-03", "ขึ้น ๑๕ ค่ำ เดือนสี่ (๔) / วันมาฆบูชา"],
  ["2026-03-11", "แรม ๘ ค่ำ เดือนสี่ (๔)"],
  ["2026-03-18", "แรม ๑๕ ค่ำ เดือนสี่ (๔)"],
  ["2026-03-26", "ขึ้น ๘ ค่ำ เดือนห้า (๕)"],
  ["2026-04-02", "ขึ้น ๑๕ ค่ำ เดือนห้า (๕)"],
  ["2026-04-10", "แรม ๘ ค่ำ เดือนห้า (๕)"],
  ["2026-04-16", "แรม ๑๔ ค่ำ เดือนห้า (๕)"],
  ["2026-04-24", "ขึ้น ๘ ค่ำ เดือนหก (๖)"],
  ["2026-05-01", "ขึ้น ๑๕ ค่ำ เดือนหก (๖)"],
  ["2026-05-09", "แรม ๘ ค่ำ เดือนหก (๖)"],
  ["2026-05-16", "แรม ๑๕ ค่ำ เดือนหก (๖)"],
  ["2026-05-24", "ขึ้น ๘ ค่ำ เดือนเจ็ด (๗)"],
  ["2026-05-31", "ขึ้น ๑๕ ค่ำ เดือนเจ็ด (๗) / วันวิสาขบูชา"],
  ["2026-06-08", "แรม ๘ ค่ำ เดือนเจ็ด (๗) / วันอัฏฐมีบูชา"],
  ["2026-06-14", "แรม ๑๔ ค่ำ เดือนเจ็ด (๗)"],
  ["2026-06-22", "ขึ้น ๘ ค่ำ เดือนแปด (๘)"],
  ["2026-06-29", "ขึ้น ๑๕ ค่ำ เดือนแปด (๘)"],
  ["2026-07-07", "แรม ๘ ค่ำ เดือนแปด (๘)"],
  ["2026-07-14", "แรม ๑๕ ค่ำ เดือนแปด (๘)"],
  ["2026-07-22", "ขึ้น ๘ ค่ำ เดือนแปดหลัง (๘๘)"],
  ["2026-07-29", "ขึ้น ๑๕ ค่ำ เดือนแปดหลัง (๘๘) / วันอาสาฬหบูชา"],
  ["2026-07-30", "แรม ๑ ค่ำ เดือนแปดหลัง (๘๘) / วันเข้าพรรษา"],
  ["2026-08-06", "แรม ๘ ค่ำ เดือนแปดหลัง (๘๘)"],
  ["2026-08-13", "แรม ๑๕ ค่ำ เดือนแปดหลัง (๘๘)"],
  ["2026-08-21", "ขึ้น ๘ ค่ำ เดือนเก้า (๙)"],
  ["2026-08-28", "ขึ้น ๑๕ ค่ำ เดือนเก้า (๙)"],
  ["2026-09-05", "แรม ๘ ค่ำ เดือนเก้า (๙)"],
  ["2026-09-11", "แรม ๑๔ ค่ำ เดือนเก้า (๙)"],
  ["2026-09-19", "ขึ้น ๘ ค่ำ เดือนสิบ (๑๐)"],
  ["2026-09-26", "ขึ้น ๑๕ ค่ำ เดือนสิบ (๑๐)"],
  ["2026-10-04", "แรม ๘ ค่ำ เดือนสิบ (๑๐)"],
  ["2026-10-11", "แรม ๑๕ ค่ำ เดือนสิบ (๑๐)"],
  ["2026-10-19", "ขึ้น ๘ ค่ำ เดือนสิบเอ็ด (๑๑)"],
  ["2026-10-26", "ขึ้น ๑๕ ค่ำ เดือนสิบเอ็ด (๑๑) / วันออกพรรษา"],
  ["2026-11-03", "แรม ๘ ค่ำ เดือนสิบเอ็ด (๑๑)"],
  ["2026-11-09", "แรม ๑๔ ค่ำ เดือนสิบเอ็ด (๑๑)"],
  ["2026-11-17", "ขึ้น ๘ ค่ำ เดือนสิบสอง (๑๒)"],
  ["2026-11-24", "ขึ้น ๑๕ ค่ำ เดือนสิบสอง (๑๒) / วันลอยกระทง"],
  ["2026-12-02", "แรม ๘ ค่ำ เดือนสิบสอง (๑๒)"],
  ["2026-12-09", "แรม ๑๕ ค่ำ เดือนสิบสอง (๑๒)"],
  ["2026-12-17", "ขึ้น ๘ ค่ำ เดือนอ้าย (๑)"],
  ["2026-12-24", "ขึ้น ๑๕ ค่ำ เดือนอ้าย (๑)"],
].map(([date, lunar]) => ({
  date,
  title: lunar.includes("/") ? `วันพระ / ${lunar.split("/").pop().trim()}` : "วันพระ",
  pillar: "คุณภาพชีวิต",
  idea: `มุมชุมชน วัด จิตอาสา ความสงบเรียบร้อย และการดูแลพื้นที่วันพระ (${lunar})`,
  lunar,
  type: "วันพระ",
  channel: "หลายช่องทาง",
}));

const defaultTasks = [
  {
    id: "sample-1",
    date: "2026-07-16",
    title: "สำรวจจุดน้ำขังหลังฝนและท่อระบายน้ำ",
    pillar: "ปลอดภัย",
    channel: "Facebook",
    status: "รอถ่าย",
    shot: "ภาพก่อน-หลัง จุดน้ำขัง ทีมลงพื้นที่ ฝาท่อ และช่องทางแจ้งเหตุ",
    note: "เปิดด้วยปัญหาที่ประชาชนเจอ แล้วปิดด้วยวิธีแจ้งพิกัด",
  },
  {
    id: "sample-2",
    date: "2026-07-17",
    title: "คลิปสั้นแนะนำการแจ้งไฟสาธารณะดับ",
    pillar: "ปลอดภัย",
    channel: "LINE @brn12345",
    status: "ไอเดีย",
    shot: "ไฟถนนตอนกลางคืน ป้ายซอย ตัวอย่างการส่งพิกัด และภาพหลังซ่อม",
    note: "ทำเป็นคลิป 30 วินาที ใช้ภาษาง่าย",
  },
  {
    id: "sample-3",
    date: "2026-07-20",
    title: "สรุปงานเก็บขยะตกค้างและล้างตลาด",
    pillar: "สะอาด",
    channel: "Facebook",
    status: "ตัดต่อ",
    shot: "ตลาด จุดทิ้งขยะ รถเก็บขยะ พื้นที่หลังทำความสะอาด และเสียงแม่ค้า",
    note: "อย่าให้เหมือนรายงานกิจกรรม ให้เห็นประโยชน์ชัด",
  },
  {
    id: "sample-4",
    date: "2026-07-28",
    title: "กิจกรรมจิตอาสาพัฒนาเมือง",
    pillar: "เมืองสมดุล",
    channel: "YouTube @BangraknoiNews",
    status: "รออนุมัติ",
    shot: "พิธีเปิด ทีมจิตอาสา ก่อน-หลังพื้นที่ และภาพประชาชนใช้พื้นที่",
    note: "ตรวจรายชื่อบุคคลและตำแหน่งก่อนเผยแพร่",
  },
  {
    id: "sample-5",
    date: "2026-07-30",
    title: "ถวายเทียนพรรษาและดูแลความสะอาดวัด",
    pillar: "คุณภาพชีวิต",
    channel: "หลายช่องทาง",
    status: "ไอเดีย",
    shot: "วัด เทียนพรรษา ประชาชนร่วมงาน จุดจอดรถ และทีมทำความสะอาด",
    note: "เชื่อมกับวันเข้าพรรษาและการดูแลพื้นที่สาธารณะ",
  },
];

const monthlyGuides = [
  {
    theme: "เริ่มปีให้ประชาชนจำช่องทางเทศบาล",
    goal: "ทบทวนบริการ ช่องทางแจ้งเหตุ และความปลอดภัยช่วงปีใหม่",
    rhythm: "ทำคอนเทนต์สั้น 2-3 ชิ้นเกี่ยวกับบริการที่ใช้บ่อย",
    angle: "ให้ประชาชนรู้ว่าอยากแจ้งเรื่องเมือง ต้องเริ่มตรงไหน",
    shots: ["ช่องทางติดต่อจริง", "เจ้าหน้าที่รับเรื่อง", "ภาพพื้นที่ที่แก้ไขแล้ว"],
    caption: "ปีใหม่นี้ เทศบาลเมืองบางรักน้อยพร้อมดูแลเมืองไปด้วยกัน",
  },
  {
    theme: "สุขภาพ ครอบครัว และพื้นที่ปลอดภัย",
    goal: "ชวนดูแลคนใกล้ตัวและพื้นที่สาธารณะ",
    rhythm: "เก็บเรื่องเล็กที่ทำให้ชีวิตประจำวันดีขึ้น",
    angle: "งานเทศบาลไม่ไกลตัว เพราะเริ่มจากบ้าน ถนน และชุมชน",
    shots: ["ครอบครัวในพื้นที่", "เจ้าหน้าที่บริการ", "จุดบริการหรือพื้นที่ชุมชน"],
    caption: "เรื่องเล็กในชุมชน คือคุณภาพชีวิตที่ดีขึ้นของทุกคน",
  },
  {
    theme: "น้ำ คลอง และงานท้องถิ่น",
    goal: "เชื่อมวันน้ำโลกกับงานระบายน้ำและดูแลคลอง",
    rhythm: "วาง 1 เรื่องใหญ่ต่อสัปดาห์เกี่ยวกับน้ำหรือท่อ",
    angle: "เมืองปลอดภัยขึ้นเมื่อระบบน้ำถูกดูแลต่อเนื่อง",
    shots: ["คลองหรือท่อระบายน้ำ", "ทีมลงพื้นที่", "ภาพก่อน-หลัง"],
    caption: "ดูแลน้ำ ดูแลคลอง คือดูแลความปลอดภัยของเมือง",
  },
  {
    theme: "สงกรานต์ ผู้สูงอายุ และการเดินทางปลอดภัย",
    goal: "สื่อสารแบบอบอุ่นและเตือนภัยอย่างชัดเจน",
    rhythm: "ก่อนหยุดยาวเน้นเตือน หลังงานสรุปภาพชุมชน",
    angle: "เทศบาลอยู่ข้างประชาชนในช่วงเวลาสำคัญของครอบครัว",
    shots: ["จุดบริการประชาชน", "ผู้สูงอายุร่วมกิจกรรม", "ป้ายเตือนและจุดเสี่ยง"],
    caption: "สงกรานต์ปลอดภัย ดูแลกันทั้งครอบครัวและชุมชน",
  },
  {
    theme: "วัด ต้นไม้ โรงเรียน และพื้นที่สีเขียว",
    goal: "เตรียมคอนเทนต์เปิดเทอมและวันวิสาขบูชา",
    rhythm: "สลับงานศาสนา สิ่งแวดล้อม และความปลอดภัยเด็ก",
    angle: "เมืองน่าอยู่คือเมืองที่เด็ก วัด และพื้นที่สีเขียวอยู่ร่วมกันได้ดี",
    shots: ["วัดและพื้นที่ทำบุญ", "ต้นไม้หรือพื้นที่สีเขียว", "ทางข้าม/โรงเรียน"],
    caption: "พื้นที่สะอาด ปลอดภัย และร่มรื่น เริ่มจากการช่วยกันดูแล",
  },
  {
    theme: "สิ่งแวดล้อม สุขภาพ และเยาวชน",
    goal: "ดันเรื่องลดขยะ ไข้เลือดออก และป้องกันยาเสพติด",
    rhythm: "ทำคอนเทนต์เชิงป้องกันที่ประชาชนทำตามได้ทันที",
    angle: "เทศบาลชวนประชาชนลดความเสี่ยงก่อนปัญหาเกิด",
    shots: ["จุดคัดแยกขยะ", "สำรวจลูกน้ำยุงลาย", "กิจกรรมเยาวชน"],
    caption: "เมืองสะอาดและปลอดภัย เริ่มจากพฤติกรรมเล็กๆ ของทุกบ้าน",
  },
  {
    theme: "ศาสนา จิตอาสา และความปลอดภัยช่วงฝน",
    goal: "เชื่อมวันสำคัญทางพระพุทธศาสนากับงานดูแลเมือง",
    rhythm: "ใช้วันพระและงานวัดเป็นจังหวะเล่าเรื่องชุมชน",
    angle: "ประเพณีอยู่คู่เมืองได้ เมื่อพื้นที่สะอาด ปลอดภัย และเดินทางสะดวก",
    shots: ["วัดหรือพื้นที่จัดงาน", "ทีมดูแลความสะอาด", "การจราจร/จุดบริการ"],
    caption: "ร่วมสืบสานประเพณี พร้อมดูแลพื้นที่ให้ประชาชนใช้ได้อย่างปลอดภัย",
  },
  {
    theme: "ครอบครัว แม่ และการดูแลกันในชุมชน",
    goal: "เล่าเรื่องคุณภาพชีวิตแบบอบอุ่นแต่ไม่หวานเกินไป",
    rhythm: "ใช้เรื่องคนจริงและบริการจริงเป็นแกน",
    angle: "เมืองที่ดีคือเมืองที่ดูแลคนทุกช่วงวัย",
    shots: ["แม่และครอบครัว", "ผู้สูงอายุ", "บริการสาธารณสุขหรือสวัสดิการ"],
    caption: "ขอบคุณทุกครอบครัวที่ร่วมกันทำให้บางรักน้อยน่าอยู่",
  },
  {
    theme: "เยาวชน คลอง และสุขภาพชุมชน",
    goal: "ให้เยาวชนมีบทบาทในเรื่องเมืองสะอาด",
    rhythm: "ทำคลิปสั้นถาม-ตอบหรือเสียงประชาชน",
    angle: "เมืองอนาคตเริ่มจากเยาวชนที่กล้าดูแลพื้นที่ของตัวเอง",
    shots: ["เยาวชนร่วมกิจกรรม", "คลองหรือพื้นที่ชุมชน", "ภาพก่อน-หลัง"],
    caption: "บางรักน้อยน่าอยู่ขึ้น เมื่อคนรุ่นใหม่ร่วมลงมือดูแลเมือง",
  },
  {
    theme: "จิตอาสา ประเพณี และความเรียบร้อย",
    goal: "สื่อสารความร่วมมือของเทศบาล วัด และชุมชน",
    rhythm: "จับงานพิธีให้เป็นเรื่องประโยชน์สาธารณะ",
    angle: "งานประเพณีที่ดี ต้องมีพื้นที่พร้อม คนพร้อม และความปลอดภัยพร้อม",
    shots: ["จิตอาสา", "วัด/พื้นที่จัดงาน", "ทีมดูแลจราจรหรือความสะอาด"],
    caption: "ร่วมใจดูแลพื้นที่สาธารณะ ให้ทุกกิจกรรมเป็นของคนทั้งเมือง",
  },
  {
    theme: "ลอยกระทง ความปลอดภัย และขยะหลังงาน",
    goal: "เตรียมก่อนงานและสรุปผลหลังงานให้เห็นความรับผิดชอบ",
    rhythm: "ก่อนงานเตือน หลังงานโชว์การเก็บกวาดและผลลัพธ์",
    angle: "ประเพณีสวยได้ เมืองก็ต้องสะอาดและปลอดภัยด้วย",
    shots: ["จุดลอยกระทง", "กระทงธรรมชาติ", "ทีมเก็บขยะหลังงาน"],
    caption: "ลอยกระทงอย่างรับผิดชอบ สวยงาม ปลอดภัย และไม่ทิ้งภาระให้เมือง",
  },
  {
    theme: "สรุปปี สิ่งแวดล้อม และเดินทางปลอดภัย",
    goal: "ทำภาพจำว่าทั้งปีเทศบาลทำอะไรให้เมืองดีขึ้น",
    rhythm: "ทำสรุปเป็นชุด: สะอาด ปลอดภัย สิ่งแวดล้อม คุณภาพชีวิต",
    angle: "หนึ่งปีของงานเทศบาล คือหลายเรื่องเล็กที่รวมกันเป็นคุณภาพชีวิต",
    shots: ["ภาพก่อน-หลังตลอดปี", "ทีมงานภาคสนาม", "ประชาชนใช้ประโยชน์"],
    caption: "ขอบคุณที่ร่วมกันทำให้บางรักน้อยน่าอยู่ขึ้นตลอดปี",
  },
];

const promptTypes = {
  "ล้างท่อ/น้ำท่วม": "ปัญหาน้ำขัง จุดเสี่ยง ทีมลงพื้นที่ วิธีที่ประชาชนช่วยลดน้ำท่วม และช่องทางแจ้งเหตุ",
  "ซ่อมไฟถนน": "จุดมืด ความปลอดภัย ก่อน-หลัง วิธีแจ้งเหตุพร้อมพิกัด และความร่วมมือจากชุมชน",
  "เก็บขยะ/ตลาดสะอาด": "พื้นที่สะอาดขึ้น กระบวนการทำงาน ผลลัพธ์ที่เห็นได้ และสิ่งที่ประชาชนช่วยได้",
  "งานวัด/วันพระ": "ประเพณี วัด ชุมชน ความสะอาด การจราจร และความสงบเรียบร้อย",
  "สุขภาพ/ไข้เลือดออก": "ความเสี่ยงใกล้บ้าน วิธีป้องกัน จุดสำรวจ และช่องทางติดต่อหน่วยงาน",
  "งานเด็ก/เยาวชน": "พื้นที่ปลอดภัย โอกาสของเยาวชน การเรียนรู้ และบทบาทของครอบครัว",
  "สรุปผลงานเทศบาล": "ปัญหาเดิม สิ่งที่เทศบาลทำ ผลลัพธ์ และสิ่งต่อไปที่ประชาชนจะได้เห็น",
};

const contentBlueprints = [
  {
    title: "ก่อน-หลังงานภาคสนาม",
    pillar: "สะอาด",
    channel: "Facebook",
    format: "โพสต์ภาพชุด + Reel สั้น",
    idea: "หยิบงานเล็กที่ประชาชนเห็นทุกวันมาเล่าให้เห็นผลลัพธ์ เช่น ขยะ ท่อ คลอง ตลาด หรือทางเท้า",
    photo: ["ภาพก่อนเริ่มงาน", "เจ้าหน้าที่ลงมือ", "รายละเอียดจุดปัญหา", "ภาพหลังทำเสร็จ", "ประชาชนใช้พื้นที่"],
    video: ["เปิดด้วยภาพปัญหา 2 วินาที", "ตามด้วยทีมลงมือ", "ตัดก่อน-หลังแบบชัด", "ปิดด้วยช่องทางแจ้งเหตุ"],
  },
  {
    title: "1 นาทีรู้จักบริการเทศบาล",
    pillar: "เมืองสมดุล",
    channel: "LINE @brn12345",
    format: "คลิปอธิบายสั้น",
    idea: "อธิบายบริการที่ประชาชนใช้บ่อย เช่น แจ้งไฟดับ แจ้งขยะ แจ้งน้ำขัง หรือขอข้อมูลบริการ",
    photo: ["หน้าจอช่องทางติดต่อ", "เจ้าหน้าที่รับเรื่อง", "ตัวอย่างข้อมูลที่ควรแจ้ง", "ภาพผลลัพธ์หลังรับเรื่อง"],
    video: ["Hook: จะแจ้งเรื่องนี้ต้องทำยังไง", "โชว์ขั้นตอน 1-2-3", "ย้ำข้อมูลที่ต้องเตรียม", "ปิดด้วย LINE และเพจ"],
  },
  {
    title: "เสียงประชาชนหลังแก้ปัญหา",
    pillar: "คุณภาพชีวิต",
    channel: "Facebook",
    format: "สัมภาษณ์สั้น + ภาพประกอบ",
    idea: "ให้คนในพื้นที่เล่าว่าก่อนแก้เป็นอย่างไร หลังแก้ชีวิตประจำวันดีขึ้นตรงไหน",
    photo: ["ภาพพื้นที่จริง", "ผู้ใช้พื้นที่", "เจ้าหน้าที่หน้างาน", "ภาพกว้างเห็นบริบทชุมชน"],
    video: ["คำถาม 1: ก่อนหน้านี้เจออะไร", "คำถาม 2: หลังทำแล้วดีขึ้นยังไง", "ภาพ B-roll พื้นที่", "ปิดด้วยข้อความขอบคุณ"],
  },
  {
    title: "เตือนภัยแบบเข้าใจง่าย",
    pillar: "ปลอดภัย",
    channel: "หลายช่องทาง",
    format: "โพสต์เตือน + LINE สั้น",
    idea: "ทำคอนเทนต์แจ้งเตือนฝน น้ำขัง จุดเสี่ยง ไฟดับ หรือเส้นทางที่ควรเลี่ยงแบบอ่านเร็ว",
    photo: ["ภาพจุดเสี่ยง", "ป้ายหรือพิกัด", "ทีมลงพื้นที่", "ช่องทางแจ้งเหตุ"],
    video: ["เปิดด้วยข้อความเตือนชัด", "โชว์จุดเสี่ยง", "บอกวิธีปฏิบัติ", "ปิดด้วยเบอร์ติดต่อ/LINE"],
  },
  {
    title: "วัด ชุมชน และวันพระ",
    pillar: "คุณภาพชีวิต",
    channel: "Facebook",
    format: "ภาพบรรยากาศ + แคปชันอบอุ่น",
    idea: "ใช้วันพระหรืองานวัดเล่าเรื่องชุมชน ความสงบเรียบร้อย ความสะอาด และการดูแลพื้นที่ร่วมกัน",
    photo: ["บรรยากาศวัด", "ประชาชนร่วมกิจกรรม", "ทีมดูแลความสะอาด", "จุดจอดรถหรือการจราจร"],
    video: ["เปิดด้วยบรรยากาศวัด", "ภาพประชาชนร่วมกิจกรรม", "ภาพทีมดูแลพื้นที่", "ปิดด้วยเชิญชวนรักษาความสะอาด"],
  },
  {
    title: "เมืองสีเขียวใกล้บ้าน",
    pillar: "สิ่งแวดล้อม",
    channel: "YouTube @BangraknoiNews",
    format: "คลิปเล่าเรื่อง 1-2 นาที",
    idea: "เล่าเรื่องต้นไม้ คลอง การลดขยะ และพื้นที่สีเขียวให้เชื่อมกับชีวิตประจำวันของประชาชน",
    photo: ["พื้นที่สีเขียว", "คลองหรือพื้นที่สาธารณะ", "คนในชุมชนช่วยกัน", "ภาพก่อน-หลังถ้ามี"],
    video: ["เปิดด้วยภาพเมือง/คลอง", "เล่าปัญหา", "เล่าการลงมือ", "ปิดด้วยสิ่งที่ประชาชนช่วยได้"],
  },
];

const pageTitles = {
  today: "ปฏิทินคอนเทนต์",
  day: "Day Board รายวัน",
  month: "เดือนนี้ควรเล่าเรื่องอะไร",
  calendar: "ปฏิทินคอนเทนต์",
  board: "สถานะงานของทีม",
  canon: "คัมภีร์ PR",
  prompts: "Prompt สำหรับทันใจ AI Studio",
};

let tasks = loadTasks();
let activeMonth = getToday().getFullYear() === YEAR ? getToday().getMonth() : 6;
let selectedDate = toISO(getToday());
let assistantOffset = 0;
let currentAssistantIdeas = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getToday() {
  return new Date();
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISO(iso) {
  return new Date(`${iso}T00:00:00`);
}

function thaiDate(date) {
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function loadTasks() {
  const saved = localStorage.getItem(TASK_KEY);
  if (!saved) return [...defaultTasks];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...defaultTasks];
  } catch {
    return [...defaultTasks];
  }
}

function saveTasks(nextTasks) {
  localStorage.setItem(TASK_KEY, JSON.stringify(nextTasks));
}

function allEvents() {
  return [...importantEvents, ...buddhistDays];
}

function eventForDate(iso) {
  return allEvents().filter((event) => event.date === iso);
}

function tasksForDate(iso) {
  return tasks.filter((task) => task.date === iso);
}

function monthItems(month) {
  return [
    ...allEvents().filter((event) => {
      const date = parseISO(event.date);
      return date.getFullYear() === YEAR && date.getMonth() === month;
    }),
    ...tasks
      .filter((task) => {
        const date = parseISO(task.date);
        return date.getFullYear() === YEAR && date.getMonth() === month;
      })
      .map((task) => ({ ...task, type: entryTypeOf(task), idea: task.shot || task.note })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

function guideForDate(iso) {
  return monthlyGuides[parseISO(iso).getMonth()] || monthlyGuides[0];
}

function entryTypeOf(item) {
  return item.entryType || item.type || "งานเทศบาล";
}

function itemsForDate(iso) {
  return [
    ...tasksForDate(iso).map((task) => ({ ...task, type: entryTypeOf(task) })),
    ...eventForDate(iso),
  ];
}

function recommendationForDate(iso) {
  const guide = guideForDate(iso);
  const items = itemsForDate(iso);
  const lead = items[0];
  const pillar = lead?.pillar || "เมืองสมดุล";
  const pillarAngle = pillars[pillar]?.angle || guide.angle;
  const title = lead ? lead.title : guide.theme;
  const type = lead ? entryTypeOf(lead) : "AI แนะนำ";
  const blueprint = lead?.blueprintId
    ? contentBlueprints.find((item) => item.title === lead.blueprintId)
    : contentBlueprints.find((item) => item.pillar === pillar) || contentBlueprints[0];

  const shots = Array.isArray(lead?.photoPlan)
    ? lead.photoPlan
    : lead?.shot
    ? lead.shot.split(/[,،|]/).map((item) => item.trim()).filter(Boolean).slice(0, 5)
    : guide.shots;
  const video = Array.isArray(lead?.videoPlan) ? lead.videoPlan : blueprint.video;
  const workflow = Array.isArray(lead?.workflowPlan)
    ? lead.workflowPlan.map((item, index) => [item.label || `ขั้นตอน ${index + 1}`, item.text || item])
    : [
        ["ก่อนออกงาน", "เช็กวัน เวลา สถานที่ ผู้รับผิดชอบ และข้อมูลที่ห้ามหลุด"],
        ["ตอนถ่าย", "เก็บภาพกว้าง ภาพคนทำงาน รายละเอียดหน้างาน และภาพผลลัพธ์"],
        ["หลังกลับ", "คัด 6-10 ภาพ เขียนสูตร ปัญหา > ลงมือ > ผลลัพธ์ > ประชาชนช่วยอะไรได้"],
        ["ก่อนโพสต์", "เช็กชื่อ ตำแหน่ง ข้อมูลส่วนตัว หน้าเด็ก และให้หัวหน้าดูงานอ่อนไหว"],
      ];

  return {
    title,
    type,
    pillar,
    priority: lead
      ? `${type}: ${title}`
      : `ธีมเดือนนี้: ${guide.theme}`,
    cards: [
      {
        label: "มุมเล่าเรื่อง",
        text: lead
          ? `เล่าให้เห็นว่า ${title} เกี่ยวกับชีวิตประชาชนอย่างไร แล้วปิดด้วยสิ่งที่ประชาชนทำต่อได้`
          : guide.angle,
      },
      {
        label: "โทนคอนเทนต์",
        text: `${pillar}: ${pillarAngle}`,
      },
      {
        label: "ช่องทางเหมาะ",
        text: lead?.channel || "Facebook สำหรับภาพรวม, LINE สำหรับแจ้งเร็ว, YouTube สำหรับคลิปเล่าเรื่อง",
      },
    ],
    shots,
    video,
    workflow,
  };
}

function nextContentDate(month, index = 0) {
  const today = getToday();
  const baseDay = today.getFullYear() === YEAR && today.getMonth() === month ? today.getDate() : 1;
  const daysInMonth = new Date(YEAR, month + 1, 0).getDate();
  return toISO(new Date(YEAR, month, Math.min(daysInMonth, baseDay + index * 3)));
}

function blueprintToIdea(blueprint, index) {
  const guide = monthlyGuides[activeMonth];
  return {
    id: `blueprint-${index}-${blueprint.title}`,
    title: blueprint.title,
    pillar: blueprint.pillar,
    channel: blueprint.channel,
    format: blueprint.format,
    date: nextContentDate(activeMonth, index + 1),
    idea: `${blueprint.idea} | เชื่อมกับธีมเดือนนี้: ${guide.theme}`,
    photo: blueprint.photo,
    video: blueprint.video,
    workflow: [
      ["วางโจทย์", "เลือกพื้นที่จริงและระบุประชาชนจะได้ประโยชน์อะไร"],
      ["เก็บภาพ", "ถ่ายภาพกว้าง รายละเอียด คนทำงาน และผลลัพธ์"],
      ["เล่าเรื่อง", "เรียง ปัญหา > เทศบาลลงมือ > ผลลัพธ์ > ประชาชนช่วยอะไรได้"],
    ],
    blueprintId: blueprint.title,
  };
}

function eventToIdea(item, index) {
  const guide = guideForDate(item.date);
  const blueprint = contentBlueprints.find((entry) => entry.pillar === item.pillar) || contentBlueprints[0];
  return {
    id: `event-${item.date}-${index}`,
    title: `ต่อยอด ${item.title}`,
    pillar: item.pillar || blueprint.pillar,
    channel: item.channel || "หลายช่องทาง",
    format: item.type === "วันพระ" ? "ภาพบรรยากาศ + แคปชันอบอุ่น" : "โพสต์ภาพชุด + คลิปสั้น",
    date: item.date,
    idea: item.idea || guide.angle,
    photo: item.type === "วันพระ" ? ["บรรยากาศวัด", "ประชาชนร่วมกิจกรรม", "ทีมดูแลพื้นที่", "จุดจอดรถหรือการจราจร"] : blueprint.photo,
    video: item.type === "วันพระ" ? ["เปิดด้วยบรรยากาศวัด", "ภาพประชาชนร่วมกิจกรรม", "ภาพทีมดูแลพื้นที่", "ปิดด้วยชวนรักษาความสะอาด"] : blueprint.video,
    workflow: [
      ["เช็กบริบท", "ดูว่าวันสำคัญนี้เกี่ยวกับประชาชนบางรักน้อยตรงไหน"],
      ["ถ่ายให้ครบ", "เก็บภาพบรรยากาศ คนทำงาน รายละเอียด และผลลัพธ์"],
      ["เขียนให้ง่าย", "ใช้ภาษาประชาชน ไม่แข็งแบบรายงานราชการ"],
    ],
    blueprintId: blueprint.title,
  };
}

function buildAssistantIdeas() {
  const filter = document.getElementById("assistant-pillar-filter")?.value || "ทั้งหมด";
  const guide = monthlyGuides[activeMonth];
  const monthItemsList = monthItems(activeMonth).filter((item) => entryTypeOf(item) !== "งานเทศบาล");
  const eventIdeas = monthItemsList.slice(0, 2).map(eventToIdea);
  const blueprintPool = contentBlueprints.filter((item) => filter === "ทั้งหมด" || item.pillar === filter);
  const rotated = blueprintPool.length
    ? blueprintPool.map((_, index) => blueprintPool[(index + assistantOffset) % blueprintPool.length])
    : contentBlueprints;

  const monthIdea = {
    id: `month-${activeMonth}`,
    title: `ธีมเดือนนี้: ${guide.theme}`,
    pillar: filter === "ทั้งหมด" ? "เมืองสมดุล" : filter,
    channel: "หลายช่องทาง",
    format: "ชุดคอนเทนต์ประจำเดือน",
    date: nextContentDate(activeMonth, 0),
    idea: guide.goal,
    photo: guide.shots,
    video: ["เปิดด้วยภาพพื้นที่จริง", "เล่าปัญหาหรือโอกาสของเดือนนี้", "แทรกงานเทศบาลที่ลงมือ", "ปิดด้วยสิ่งที่ประชาชนช่วยได้"],
    workflow: [
      ["เลือกเรื่องหลัก", "หยิบ 1 ธีมของเดือนให้ทีมทำต่อเนื่อง"],
      ["เก็บภาพชุด", "ถ่ายพื้นที่เดิมก่อน-หลังหรือความเปลี่ยนแปลง"],
      ["แตกเป็นหลายช่องทาง", "Facebook เล่าเต็ม, LINE สรุปสั้น, YouTube ทำคลิป"],
    ],
    blueprintId: "ชุดคอนเทนต์ประจำเดือน",
  };

  return [monthIdea, ...eventIdeas, ...rotated.slice(0, 4).map(blueprintToIdea)].slice(0, 6);
}

function renderAssistantIdeas() {
  const grid = document.getElementById("assistant-ideas");
  if (!grid) return;
  currentAssistantIdeas = buildAssistantIdeas();
  grid.innerHTML = currentAssistantIdeas
    .map(
      (idea) => `
        <article class="assistant-idea-card">
          <div class="idea-head">
            <span class="tag" style="background:${pillars[idea.pillar]?.color || "#ff781f"}">${escapeHtml(idea.pillar)}</span>
            <small>${escapeHtml(idea.format)}</small>
          </div>
          <h5>${escapeHtml(idea.title)}</h5>
          <p>${escapeHtml(idea.idea)}</p>
          <div class="idea-plan">
            <div><span>ภาพนิ่ง</span><p>${escapeHtml(idea.photo.slice(0, 3).join(" / "))}</p></div>
            <div><span>วิดีโอ</span><p>${escapeHtml(idea.video.slice(0, 3).join(" / "))}</p></div>
          </div>
          <div class="idea-actions">
            <button class="primary-action" type="button" data-add-idea="${escapeHtml(idea.id)}">เพิ่มลงปฏิทิน</button>
            <button class="secondary-action" type="button" data-prompt-idea="${escapeHtml(idea.id)}">สร้าง Prompt</button>
          </div>
        </article>
      `
    )
    .join("");
}

function ideaById(id) {
  return currentAssistantIdeas.find((idea) => idea.id === id) || buildAssistantIdeas().find((idea) => idea.id === id);
}

function addIdeaToCalendar(id) {
  const idea = ideaById(id);
  if (!idea) return;
  addTask({
    id: `idea-${Date.now()}-${Math.round(Math.random() * 999)}`,
    title: idea.title,
    date: idea.date,
    entryType: "คอนเทนต์ไอเดีย",
    pillar: idea.pillar,
    channel: idea.channel,
    status: "ไอเดีย",
    shot: `ภาพนิ่ง: ${idea.photo.join(", ")} | วิดีโอ: ${idea.video.join(", ")}`,
    note: idea.idea,
    photoPlan: idea.photo,
    videoPlan: idea.video,
    workflowPlan: idea.workflow.map(([label, text]) => ({ label, text })),
    blueprintId: idea.blueprintId,
  });
  showToast(`เพิ่ม "${idea.title}" ลงปฏิทินแล้ว`);
}

function setPromptFromIdea(id) {
  const idea = ideaById(id);
  if (!idea) return;
  selectedDate = idea.date;
  document.getElementById("prompt-details").value = [
    `วันที่เสนอ: ${thaiDate(parseISO(idea.date))}`,
    `ไอเดีย: ${idea.title}`,
    `เสาหลัก: ${idea.pillar}`,
    `รูปแบบ: ${idea.format}`,
    `มุมเล่าเรื่อง: ${idea.idea}`,
    `ภาพนิ่งที่ควรถ่าย: ${idea.photo.join(", ")}`,
    `วิดีโอที่ควรถ่าย: ${idea.video.join(", ")}`,
    `ขั้นตอนทำงาน: ${idea.workflow.map(([label, text]) => `${label} - ${text}`).join(" | ")}`,
  ].join("\n");
  showSection("prompts");
  document.getElementById("prompt-output").value = createPrompt();
}

function calendarItemsForCell(iso) {
  return [
    ...eventForDate(iso),
    ...tasksForDate(iso).map((task) => ({ ...task, type: entryTypeOf(task) })),
  ];
}

function pillClassFor(item) {
  const type = entryTypeOf(item);
  if (type === "วันพระ") return "dharma";
  if (type === "งานเทศบาล") return "task";
  if (type === "วัน/กิจกรรม") return "custom-day";
  if (type === "โน้ตทีม") return "note";
  return "";
}

function renderCalendarCells(targetId, month, compact = false) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const todayIso = toISO(getToday());
  const first = new Date(YEAR, month, 1);
  const firstOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(YEAR, month + 1, 0).getDate();
  const prevMonthDays = new Date(YEAR, month, 0).getDate();
  const cells = [];
  const maxItems = compact ? 3 : 4;

  for (let i = 0; i < 42; i += 1) {
    const day = i - firstOffset + 1;
    let date;
    let muted = false;
    if (day < 1) {
      date = new Date(YEAR, month - 1, prevMonthDays + day);
      muted = true;
    } else if (day > daysInMonth) {
      date = new Date(YEAR, month + 1, day - daysInMonth);
      muted = true;
    } else {
      date = new Date(YEAR, month, day);
    }

    const iso = toISO(date);
    const visible = calendarItemsForCell(iso);
    const shortVisible = visible.slice(0, maxItems);
    const hiddenCount = visible.length - shortVisible.length;
    const cellClass = compact ? "home-day-cell" : "day-cell";

    cells.push(`
      <button class="${cellClass} ${muted ? "muted" : ""}" type="button" data-open-day="${iso}" aria-label="เปิดแผนวันที่ ${thaiDate(date)}">
        <span class="day-head">
          <span>${date.getDate()}</span>
          ${iso === todayIso ? '<span class="today-badge">วันนี้</span>' : ""}
        </span>
        ${shortVisible
          .map((item) => `<span class="event-pill ${pillClassFor(item)}">${escapeHtml(item.title)}</span>`)
          .join("")}
        ${hiddenCount > 0 ? `<span class="event-pill more">+${hiddenCount} รายการ</span>` : ""}
      </button>
    `);
  }

  grid.innerHTML = cells.join("");
}

function renderHomeCalendar() {
  const title = document.getElementById("home-calendar-title");
  if (title) title.textContent = `${thaiMonths[activeMonth]} ${YEAR + 543}`;
  renderCalendarCells("home-calendar-grid", activeMonth, true);
}

function renderHomeAdvisor() {
  const iso = toISO(getToday());
  const rec = recommendationForDate(iso);
  const priority = document.getElementById("v4-ai-priority");
  const title = document.getElementById("v4-ai-title");
  const list = document.getElementById("v4-ai-list");
  const shots = document.getElementById("v4-shot-list");
  if (priority) priority.textContent = rec.priority;
  if (title) title.textContent = rec.title;
  if (list) {
    list.innerHTML = rec.cards
      .map((card) => `<div class="ai-card"><span>${escapeHtml(card.label)}</span><p>${escapeHtml(card.text)}</p></div>`)
      .join("");
  }
  if (shots) {
    shots.innerHTML = rec.shots.map((shot) => `<li>${escapeHtml(shot)}</li>`).join("");
  }
}

function renderMonthRunway() {
  const runway = document.getElementById("v4-month-runway");
  if (!runway) return;
  const guide = monthlyGuides[activeMonth];
  const items = monthItems(activeMonth).slice(0, 4);
  const runwayItems = items.length
    ? items
    : [
        { date: `${YEAR}-${String(activeMonth + 1).padStart(2, "0")}-01`, title: guide.theme, type: "AI แนะนำ", idea: guide.goal },
      ];
  runway.innerHTML = runwayItems
    .map((item) => {
      const date = parseISO(item.date);
      return `
        <button class="runway-item" type="button" data-open-day="${escapeHtml(item.date)}">
          <span>${date.getDate()} ${shortMonths[date.getMonth()]}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.idea || item.shot || item.note || guide.angle)}</p>
        </button>
      `;
    })
    .join("");
}

function renderWorkflow() {
  const box = document.getElementById("v4-workflow");
  if (!box) return;
  const rec = recommendationForDate(selectedDate || toISO(getToday()));
  box.innerHTML = rec.workflow
    .map(([label, text], index) => `
      <div class="workflow-step">
        <span>${index + 1}</span>
        <div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(text)}</p></div>
      </div>
    `)
    .join("");
}

function renderShell() {
  const sceneSlot = document.getElementById("v4-scene-slot");
  const sceneCanvas = document.getElementById("brn-3d-scene");
  if (sceneSlot && sceneCanvas && sceneCanvas.parentElement !== sceneSlot) {
    sceneSlot.appendChild(sceneCanvas);
    window.dispatchEvent(new Event("resize"));
  }
  document.getElementById("today-chip").textContent = thaiDate(getToday());
  document.querySelectorAll('select[name="pillar"]').forEach((select) => {
    select.innerHTML = Object.keys(pillars).map((pillar) => `<option>${escapeHtml(pillar)}</option>`).join("");
  });
  document.querySelectorAll('select[name="status"]').forEach((select) => {
    select.innerHTML = statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("");
  });
  document.querySelectorAll('select[name="entryType"]').forEach((select) => {
    select.innerHTML = entryTypes.map((type) => `<option>${escapeHtml(type)}</option>`).join("");
  });
  const assistantFilter = document.getElementById("assistant-pillar-filter");
  if (assistantFilter) {
    assistantFilter.innerHTML = ["ทั้งหมด", ...Object.keys(pillars)]
      .map((pillar) => `<option value="${escapeHtml(pillar)}">${escapeHtml(pillar)}</option>`)
      .join("");
  }
  document.getElementById("month-select").innerHTML = thaiMonths
    .map((month, index) => `<option value="${index}">${month}</option>`)
    .join("");
  document.getElementById("month-select").value = String(activeMonth);
  document.querySelectorAll('input[name="date"]').forEach((input) => {
    input.value = selectedDate;
  });
  document.getElementById("work-type").innerHTML = Object.keys(promptTypes).map((type) => `<option>${escapeHtml(type)}</option>`).join("");
}

function showSection(section) {
  document.querySelectorAll(".page-section").forEach((el) => el.classList.toggle("active", el.id === section));
  document.querySelectorAll(".nav-item").forEach((el) => {
    const navSection = el.dataset.section;
    el.classList.toggle("active", navSection === section || (section === "day" && navSection === "calendar"));
  });
  document.getElementById("page-title").textContent = section === "day" ? `${thaiDate(parseISO(selectedDate))}` : pageTitles[section];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderToday() {
  const today = getToday();
  const iso = toISO(today);
  const todayEvents = eventForDate(iso);
  const todayTasks = tasksForDate(iso);
  const guide = guideForDate(iso);
  const list = document.getElementById("today-list");

  const rows = [
    ...todayEvents.map((item) => ({ ...item, channel: item.channel || "หลายช่องทาง" })),
    ...todayTasks.map((item) => ({ ...item, idea: item.shot, type: entryTypeOf(item) })),
  ];

  const fallback = [
    {
      date: iso,
      title: guide.theme,
      pillar: "เมืองสมดุล",
      idea: guide.angle,
      type: "ข้อเสนอ",
      channel: "หลายช่องทาง",
    },
    {
      date: iso,
      title: "เลือกงานภาคสนาม 1 เรื่องให้จบวันนี้",
      pillar: "ปลอดภัย",
      idea: "ใช้สูตร ปัญหา → เทศบาลลงมือ → ผลลัพธ์ → ประชาชนช่วยอะไรได้",
      type: "ข้อเสนอ",
      channel: "Facebook",
    },
  ];

  const visibleRows = rows.length ? rows : fallback;
  const heroTitle = document.getElementById("hero-title");
  const heroSummary = document.getElementById("hero-summary");
  const focusLine = document.getElementById("focus-line");
  if (heroTitle) heroTitle.textContent = `วันนี้ ${thaiDate(today)}`;
  if (heroSummary) {
    heroSummary.textContent =
      rows.length > 0
        ? "มีประเด็นพร้อมทำงานแล้ว เลือก 1-2 เรื่องให้ทีมถ่าย เขียน และส่งต่อได้ในวันเดียว"
        : "วันนี้ยังไม่มีงานล็อกไว้ ใช้ธีมเดือนนี้เลือกประเด็นหนึ่งเรื่อง แล้วใส่ลงปฏิทินให้ทีมเห็นพร้อมกัน";
  }
  if (focusLine) focusLine.textContent = visibleRows[0]?.title || guide.theme;

  document.dispatchEvent(
    new CustomEvent("brn:data", {
      detail: {
        todayCount: visibleRows.length,
        hasLiveTask: todayTasks.length > 0,
        monthCount: monthItems(today.getMonth()).length,
      },
    })
  );

  list.innerHTML = visibleRows
    .map((item) => contentCard(item, iso))
    .join("");
}

function contentCard(item, fallbackDate = item.date) {
  const pillar = item.pillar || "เมืองสมดุล";
  return `
    <div class="content-card">
      <span class="tag" style="background:${pillars[pillar]?.color || "#0f766e"}">${escapeHtml(pillar)}</span>
      <div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.idea || item.shot || item.note || "เติมรายละเอียดงาน")}</p>
      </div>
      <div class="meta">
        <span>${escapeHtml(entryTypeOf(item))}</span>
        <span>${escapeHtml(item.channel || "หลายช่องทาง")}</span>
        <button class="ghost-button" data-open-day="${escapeHtml(item.date || fallbackDate)}">เปิดวัน</button>
      </div>
    </div>
  `;
}

function renderMetrics() {
  const month = activeMonth;
  const eventCount = allEvents().filter((event) => parseISO(event.date).getMonth() === month).length;
  const taskCount = tasks.filter((task) => parseISO(task.date).getMonth() === month).length;
  const readyCount = tasks.filter((task) => task.status === "เผยแพร่แล้ว" || task.status === "รออนุมัติ").length;
  document.querySelectorAll('[data-metric="events"]').forEach((item) => (item.textContent = eventCount));
  document.querySelectorAll('[data-metric="tasks"]').forEach((item) => (item.textContent = taskCount));
  document.querySelectorAll('[data-metric="ready"]').forEach((item) => (item.textContent = readyCount));
}

function renderMonth() {
  const month = Number(document.getElementById("month-select").value);
  activeMonth = month;
  const items = monthItems(month);
  const guide = monthlyGuides[month];

  document.getElementById("month-title").textContent = `${thaiMonths[month]} ${YEAR + 543}: เดือนนี้ควรเล่าเรื่องอะไร`;
  document.getElementById("month-brief").innerHTML = [
    ["ธีมหลัก", guide.theme],
    ["เป้าหมาย", guide.goal],
    ["จังหวะทีม", guide.rhythm],
  ]
    .map(([label, text]) => `<div class="brief-card"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></div>`)
    .join("");

  document.getElementById("month-timeline").innerHTML = items.length
    ? items
        .map((item) => {
          const date = parseISO(item.date);
          return `
            <div class="timeline-item">
              <div class="timeline-date">${date.getDate()} ${shortMonths[date.getMonth()]}</div>
              <div>
                <h4>${escapeHtml(item.title)}</h4>
                <p>${escapeHtml(item.idea || item.shot || item.note)}</p>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="timeline-item"><div class="timeline-date">ว่าง</div><div><h4>ยังไม่มีรายการ</h4><p>เพิ่มงานจากปฏิทินหรือหน้า วันนี้ เพื่อวางแผนเดือนนี้</p></div></div>`;

  renderPillarBars(items);
}

function renderPillarBars(items) {
  const total = Math.max(items.length, 1);
  document.getElementById("pillar-bars").innerHTML = Object.entries(pillars)
    .map(([name, config]) => {
      const count = items.filter((item) => item.pillar === name).length;
      const percent = Math.round((count / total) * 100);
      return `
        <div class="pillar-row">
          <div class="pillar-head"><span>${escapeHtml(name)}</span><span>${count} เรื่อง</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${percent}%; background:${config.color}"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const todayIso = toISO(getToday());
  const first = new Date(YEAR, activeMonth, 1);
  const firstOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(YEAR, activeMonth + 1, 0).getDate();
  const prevMonthDays = new Date(YEAR, activeMonth, 0).getDate();
  const cells = [];

  document.getElementById("calendar-title").textContent = `${thaiMonths[activeMonth]} ${YEAR + 543}`;

  for (let i = 0; i < 42; i += 1) {
    const day = i - firstOffset + 1;
    let date;
    let muted = false;
    if (day < 1) {
      date = new Date(YEAR, activeMonth - 1, prevMonthDays + day);
      muted = true;
    } else if (day > daysInMonth) {
      date = new Date(YEAR, activeMonth + 1, day - daysInMonth);
      muted = true;
    } else {
      date = new Date(YEAR, activeMonth, day);
    }

    const iso = toISO(date);
    const dayEvents = eventForDate(iso);
    const dayTasks = tasksForDate(iso);
    const visible = [
      ...dayEvents,
      ...dayTasks.map((task) => ({ ...task, type: entryTypeOf(task) })),
    ];
    const shortVisible = visible.slice(0, 4);
    const hiddenCount = visible.length - shortVisible.length;

    cells.push(`
      <button class="day-cell ${muted ? "muted" : ""}" type="button" data-open-day="${iso}" aria-label="เปิดแผนวันที่ ${thaiDate(date)}">
        <span class="day-head">
          <span>${date.getDate()}</span>
          ${iso === todayIso ? '<span class="today-badge">วันนี้</span>' : ""}
        </span>
        ${shortVisible
          .map((item) => {
            const className = pillClassFor(item);
            return `<span class="event-pill ${className}">${escapeHtml(item.title)}</span>`;
          })
          .join("")}
        ${hiddenCount > 0 ? `<span class="event-pill more">+${hiddenCount} รายการ</span>` : ""}
      </button>
    `);
  }

  grid.innerHTML = cells.join("");
}

function renderDayFocus() {
  const date = parseISO(selectedDate);
  const dayEvents = eventForDate(selectedDate);
  const dayTasks = tasksForDate(selectedDate);
  const guide = guideForDate(selectedDate);
  const rows = [
    ...dayEvents.map((item) => ({ ...item, channel: item.channel || "หลายช่องทาง" })),
    ...dayTasks.map((item) => ({ ...item, idea: item.shot, type: entryTypeOf(item) })),
  ];

  document.getElementById("day-focus-title").textContent = thaiDate(date);
  document.getElementById("day-angle").textContent =
    rows.length > 0
      ? `จับ ${rows[0].title} ให้เป็นเรื่องประชาชน: เริ่มจากบริบทของพื้นที่ ต่อด้วยสิ่งที่เทศบาลลงมือ และปิดด้วยประโยชน์ที่เห็นได้`
      : guide.angle;
  const rec = recommendationForDate(selectedDate);
  document.getElementById("day-shots").innerHTML = rec.shots.map((shot) => `<li>${escapeHtml(shot)}</li>`).join("");
  document.getElementById("day-video-plan").innerHTML = rec.video.map((shot) => `<li>${escapeHtml(shot)}</li>`).join("");
  document.getElementById("day-field-plan").innerHTML = rec.workflow.map(([label, text]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</li>`).join("");
  document.getElementById("day-caption").textContent = guide.caption;

  document.getElementById("day-items").innerHTML = rows.length
    ? rows.map((item) => contentCard(item, selectedDate)).join("")
    : `
      <div class="content-card">
        <span class="tag" style="background:${pillars["เมืองสมดุล"].color}">ข้อเสนอ</span>
        <div>
          <h4>${escapeHtml(guide.theme)}</h4>
          <p>${escapeHtml(guide.goal)}</p>
        </div>
        <div class="meta"><span>ยังไม่มีงาน</span><span>เพิ่มได้ด้านล่าง</span></div>
      </div>
    `;
}

function renderBoard() {
  const board = document.getElementById("kanban");
  board.innerHTML = statuses
    .map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);
      return `
        <div class="kanban-column">
          <h4>${escapeHtml(status)} (${columnTasks.length})</h4>
          ${columnTasks
            .map(
              (task) => `
                <div class="task-card">
                  <strong>${escapeHtml(task.title)}</strong>
                  <span>${escapeHtml(entryTypeOf(task))} · ${thaiDate(parseISO(task.date))} · ${escapeHtml(task.pillar)}</span>
                  <span>${escapeHtml(task.channel)}</span>
                  <span>${escapeHtml(task.shot || "ยังไม่มีโน้ตถ่ายทำ")}</span>
                  ${task.note ? `<span>${escapeHtml(task.note)}</span>` : ""}
                  <div class="task-actions">
                    <button data-open-day="${escapeHtml(task.date)}">เปิดวัน</button>
                    <button data-prompt-task="${escapeHtml(task.id)}">Prompt</button>
                    ${status !== "เผยแพร่แล้ว" ? `<button data-advance="${escapeHtml(task.id)}">ย้ายต่อ</button>` : ""}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `;
    })
    .join("");
}

function renderCanon() {
  document.getElementById("canon-grid").innerHTML = Object.entries(pillars)
    .map(
      ([name, config]) => `
        <div class="pillar-card">
          <span style="background:${config.color}">${escapeHtml(name)}</span>
          <h4>${escapeHtml(name)}</h4>
          <p>${escapeHtml(config.angle)}</p>
        </div>
      `
    )
    .join("");
}

function taskFromForm(form, dateOverride) {
  const data = new FormData(form);
  const title = data.get("title").toString().trim();
  if (!title) return null;
  const date = dateOverride || data.get("date")?.toString() || selectedDate;
  const pillar = data.get("pillar")?.toString() || "เมืองสมดุล";
  return {
    id: `task-${Date.now()}-${Math.round(Math.random() * 999)}`,
    title,
    date,
    entryType: data.get("entryType")?.toString() || "งานเทศบาล",
    pillar,
    channel: data.get("channel")?.toString() || "หลายช่องทาง",
    status: data.get("status")?.toString() || "ไอเดีย",
    shot:
      data.get("shot")?.toString().trim() ||
      `เก็บภาพ ${pillars[pillar]?.angle || "ภาพหน้างาน"} และข้อมูลที่ประชาชนต้องรู้`,
    note: data.get("note")?.toString().trim() || "",
  };
}

function addTask(task) {
  tasks = [...tasks, task];
  saveTasks(tasks);
  selectedDate = task.date;
  activeMonth = parseISO(task.date).getMonth();
  document.getElementById("month-select").value = String(activeMonth);
  rerenderAll();
  showToast(`เพิ่ม "${task.title}" ลงปฏิทินแล้ว`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function detailsForDayPrompt() {
  const date = parseISO(selectedDate);
  const events = eventForDate(selectedDate);
  const dayTasks = tasksForDate(selectedDate);
  const guide = guideForDate(selectedDate);
  const rec = recommendationForDate(selectedDate);
  const lines = [
    `วันที่: ${thaiDate(date)}`,
    `ธีมเดือน: ${guide.theme}`,
    events.length ? `วัน/ประเด็นสำคัญ: ${events.map((item) => item.title).join(", ")}` : "วัน/ประเด็นสำคัญ: ไม่มีรายการหลัก",
    dayTasks.length
      ? `งานเทศบาล/โน้ตทีม: ${dayTasks.map((item) => `${item.title} (${item.shot || item.note || "ยังไม่มีโน้ต"})`).join(" | ")}`
      : "งานเทศบาล/โน้ตทีม: ยังไม่มีงาน เพิ่มเป็นข้อเสนอจากธีมเดือน",
    `แนวภาพนิ่งที่ควรถ่าย: ${rec.shots.join(", ")}`,
    `แนววิดีโอที่ควรถ่าย: ${rec.video.join(", ")}`,
    `ขั้นตอนทำงาน: ${rec.workflow.map(([label, text]) => `${label} - ${text}`).join(" | ")}`,
  ];
  return lines.join("\n");
}

function createPrompt() {
  const type = document.getElementById("work-type").value;
  const channel = document.getElementById("prompt-channel").value;
  const details = document.getElementById("prompt-details").value.trim() || detailsForDayPrompt();
  const theme = promptTypes[type];
  return `ช่วยวางคอนเทนต์สำหรับทีมประชาสัมพันธ์เทศบาลเมืองบางรักน้อย

ประเภทงาน: ${type}
ช่องทางที่จะใช้: ${channel}
ข้อมูลหน้างาน:
${details}

กรอบการเล่าเรื่อง:
1. เชื่อมกับวิสัยทัศน์ "พัฒนาเมืองอย่างสมดุล สะอาด ปลอดภัย ใส่ใจสิ่งแวดล้อม และเสริมสร้างคุณภาพชีวิตของประชาชนทุกมิติ"
2. ใช้สูตร ปัญหา → เทศบาลลงมือ → ผลลัพธ์ → ประชาชนช่วยอะไรได้
3. ภาษาไทยสุภาพ เข้าใจง่าย ทันสมัย แต่ยังเหมาะกับหน่วยงานราชการ
4. ระวังข้อมูลส่วนตัว หน้าเด็ก ผู้ป่วย ผู้เดือดร้อน และเอกสารราชการ

ขอผลลัพธ์เป็น:
- หัวข้อโพสต์ 3 แบบ
- Hook เปิดคลิป 3 วินาทีแรก
- แคปชันสำหรับ ${channel}
- Shot list ที่ควรถ่าย
- ข้อความปิดท้าย/CTA
- เช็กลิสต์ความเสี่ยงก่อนโพสต์

ประเด็นที่ควรเน้น: ${theme}`;
}

function setPromptFromTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;
  document.getElementById("prompt-details").value = [
    `วันที่: ${thaiDate(parseISO(task.date))}`,
    `ชื่องาน: ${task.title}`,
    `เสาหลัก: ${task.pillar}`,
    `ช่องทาง: ${task.channel}`,
    `สถานะ: ${task.status}`,
    `สิ่งที่ต้องถ่าย/โน้ต: ${task.shot || task.note || "-"}`,
  ].join("\n");
  showSection("prompts");
  document.getElementById("prompt-output").value = createPrompt();
}

function rerenderAll() {
  renderToday();
  renderAssistantIdeas();
  renderHomeCalendar();
  renderHomeAdvisor();
  renderMonthRunway();
  renderWorkflow();
  renderMetrics();
  renderMonth();
  renderCalendar();
  renderDayFocus();
  renderBoard();
  renderCanon();
}

function bindEvents() {
  document.querySelectorAll(".nav-item, [data-section-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section || button.dataset.sectionTarget;
      showSection(section);
    });
  });

  document.body.addEventListener("click", (event) => {
    const openDay = event.target.closest("[data-open-day]");
    if (openDay) {
      selectedDate = openDay.dataset.openDay;
      activeMonth = parseISO(selectedDate).getMonth();
      document.getElementById("month-select").value = String(activeMonth);
      rerenderAll();
      showSection("day");
      return;
    }

    const promptButton = event.target.closest("[data-prompt-task]");
    if (promptButton) {
      setPromptFromTask(promptButton.dataset.promptTask);
      return;
    }

    const addIdeaButton = event.target.closest("[data-add-idea]");
    if (addIdeaButton) {
      addIdeaToCalendar(addIdeaButton.dataset.addIdea);
      return;
    }

    const promptIdeaButton = event.target.closest("[data-prompt-idea]");
    if (promptIdeaButton) {
      setPromptFromIdea(promptIdeaButton.dataset.promptIdea);
    }
  });

  document.getElementById("assistant-pillar-filter")?.addEventListener("change", () => {
    assistantOffset = 0;
    renderAssistantIdeas();
  });

  document.getElementById("assistant-refresh")?.addEventListener("click", () => {
    assistantOffset += 1;
    renderAssistantIdeas();
  });

  document.getElementById("task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const task = taskFromForm(event.currentTarget);
    if (!task) return;
    addTask(task);
    event.currentTarget.reset();
    document.querySelector("#task-form [name='date']").value = toISO(getToday());
  });

  document.getElementById("home-task-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const task = taskFromForm(event.currentTarget);
    if (!task) return;
    addTask(task);
    event.currentTarget.reset();
    document.querySelectorAll('input[name="date"]').forEach((input) => {
      input.value = selectedDate;
    });
  });

  document.getElementById("day-task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const task = taskFromForm(event.currentTarget, selectedDate);
    if (!task) return;
    addTask(task);
    event.currentTarget.reset();
    renderDayFocus();
  });

  document.getElementById("month-select").addEventListener("change", () => {
    activeMonth = Number(document.getElementById("month-select").value);
    renderMetrics();
    renderMonth();
    renderCalendar();
  });

  document.getElementById("prev-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 11) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMetrics();
    renderMonth();
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 1) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMetrics();
    renderMonth();
    renderCalendar();
  });

  document.getElementById("home-prev-month")?.addEventListener("click", () => {
    activeMonth = (activeMonth + 11) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMetrics();
    renderMonth();
    renderCalendar();
    renderHomeCalendar();
    renderMonthRunway();
    renderAssistantIdeas();
  });

  document.getElementById("home-next-month")?.addEventListener("click", () => {
    activeMonth = (activeMonth + 1) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMetrics();
    renderMonth();
    renderCalendar();
    renderHomeCalendar();
    renderMonthRunway();
    renderAssistantIdeas();
  });

  document.getElementById("kanban").addEventListener("click", (event) => {
    const button = event.target.closest("[data-advance]");
    if (!button) return;
    const id = button.dataset.advance;
    tasks = tasks.map((task) => {
      if (task.id !== id) return task;
      const nextIndex = Math.min(statuses.indexOf(task.status) + 1, statuses.length - 1);
      return { ...task, status: statuses[nextIndex] };
    });
    saveTasks(tasks);
    rerenderAll();
  });

  document.getElementById("reset-demo").addEventListener("click", () => {
    tasks = [...defaultTasks];
    saveTasks(tasks);
    selectedDate = toISO(getToday());
    activeMonth = parseISO(selectedDate).getMonth();
    document.getElementById("month-select").value = String(activeMonth);
    rerenderAll();
  });

  document.getElementById("use-day-prompt").addEventListener("click", () => {
    document.getElementById("prompt-details").value = detailsForDayPrompt();
    showSection("prompts");
    document.getElementById("prompt-output").value = createPrompt();
  });

  document.getElementById("v4-send-prompt")?.addEventListener("click", () => {
    selectedDate = toISO(getToday());
    document.getElementById("prompt-details").value = detailsForDayPrompt();
    showSection("prompts");
    document.getElementById("prompt-output").value = createPrompt();
  });

  document.getElementById("prompt-form").addEventListener("submit", (event) => {
    event.preventDefault();
    document.getElementById("prompt-output").value = createPrompt();
  });

  document.getElementById("copy-prompt").addEventListener("click", async () => {
    const output = document.getElementById("prompt-output");
    if (!output.value) output.value = createPrompt();
    output.select();
    try {
      await navigator.clipboard.writeText(output.value);
      document.getElementById("copy-prompt").textContent = "คัดลอกแล้ว";
      setTimeout(() => (document.getElementById("copy-prompt").textContent = "คัดลอก"), 1400);
    } catch {
      document.execCommand("copy");
    }
  });
}

renderShell();
bindEvents();
document.getElementById("prompt-output").value = createPrompt();
rerenderAll();
