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

const pillars = {
  "เมืองสมดุล": {
    color: "#225a84",
    angle: "ทำให้ประชาชนเห็นภาพการพัฒนาเมืองที่มีระบบ ไม่ใช่แค่งานรายวัน",
  },
  "สะอาด": {
    color: "#0f6b57",
    angle: "ขยะ ท่อ คลอง ถนน ตลาด และพื้นที่สาธารณะที่ดูแลต่อเนื่อง",
  },
  "ปลอดภัย": {
    color: "#d94d42",
    angle: "ถนน ไฟส่องสว่าง ฝน น้ำท่วม จุดเสี่ยง และการเตือนภัย",
  },
  "สิ่งแวดล้อม": {
    color: "#1a8a70",
    angle: "ต้นไม้ คลอง การลดขยะ พื้นที่สีเขียว และพฤติกรรมรักษ์เมือง",
  },
  "คุณภาพชีวิต": {
    color: "#ef8a3d",
    angle: "เด็ก ผู้สูงอายุ สุขภาพ กีฬา อาชีพ บริการประชาชน และชุมชน",
  },
};

const events = [
  ["2026-01-01", "วันขึ้นปีใหม่", "คุณภาพชีวิต", "อวยพรปีใหม่และสรุปช่องทางบริการเทศบาล"],
  ["2026-01-10", "วันเด็กแห่งชาติ", "คุณภาพชีวิต", "กิจกรรมเด็ก สิทธิเด็ก และพื้นที่ปลอดภัยสำหรับครอบครัว"],
  ["2026-01-14", "วันอนุรักษ์ทรัพยากรป่าไม้ของชาติ", "สิ่งแวดล้อม", "ชวนดูแลต้นไม้และพื้นที่สีเขียวในชุมชน"],
  ["2026-03-18", "วันท้องถิ่นไทย", "เมืองสมดุล", "เล่า 1 วันของเทศบาลว่าดูแลเมืองอย่างไร"],
  ["2026-03-22", "วันน้ำโลก", "สิ่งแวดล้อม", "คลอง ท่อระบายน้ำ การใช้น้ำ และการไม่ทิ้งขยะลงน้ำ"],
  ["2026-04-13", "สงกรานต์ / วันผู้สูงอายุ", "คุณภาพชีวิต", "ผู้สูงอายุ ครอบครัว จุดบริการ และความปลอดภัยช่วงหยุดยาว"],
  ["2026-04-24", "วันเทศบาล", "เมืองสมดุล", "5 งานเทศบาลใกล้ชีวิตประชาชน"],
  ["2026-05-31", "วันวิสาขบูชา / วันต้นไม้", "สิ่งแวดล้อม", "ทำบุญ ปลูกต้นไม้ และรักษาความสะอาดวัด"],
  ["2026-06-05", "วันสิ่งแวดล้อมโลก", "สิ่งแวดล้อม", "ลดขยะ แยกขยะ คลองสะอาด และพื้นที่สีเขียว"],
  ["2026-06-15", "วันไข้เลือดออกอาเซียน", "คุณภาพชีวิต", "สำรวจลูกน้ำยุงลาย 3 จุดในบ้านและชุมชน"],
  ["2026-06-26", "วันต่อต้านยาเสพติดโลก", "ปลอดภัย", "สื่อสารเชิงป้องกันสำหรับเยาวชนและครอบครัว"],
  ["2026-07-01", "วันสถาปนาลูกเสือแห่งชาติ", "คุณภาพชีวิต", "จิตอาสา ระเบียบวินัย และเยาวชนช่วยชุมชน"],
  ["2026-07-28", "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", "เมืองสมดุล", "กิจกรรมจิตอาสาพัฒนาเมือง"],
  ["2026-07-29", "วันอาสาฬหบูชา / วันภาษาไทยแห่งชาติ", "คุณภาพชีวิต", "เวียนเทียนและการใช้ภาษาราชการให้ประชาชนเข้าใจ"],
  ["2026-07-30", "วันเข้าพรรษา", "คุณภาพชีวิต", "ถวายเทียน งดเหล้าเข้าพรรษา และดูแลวัด"],
  ["2026-08-12", "วันแม่แห่งชาติ", "คุณภาพชีวิต", "เรื่องราวแม่ ครอบครัว และชุมชนดูแลกัน"],
  ["2026-09-20", "วันเยาวชนแห่งชาติ / วันอนุรักษ์คลอง", "สิ่งแวดล้อม", "เยาวชนร่วมดูแลคลองและเสนอไอเดียเมือง"],
  ["2026-09-24", "วันมหิดล", "คุณภาพชีวิต", "งานสาธารณสุข อสม. และบริการกลุ่มเปราะบาง"],
  ["2026-10-13", "วันคล้ายวันสวรรคต รัชกาลที่ 9", "เมืองสมดุล", "น้อมรำลึกและกิจกรรมจิตอาสา"],
  ["2026-10-23", "วันปิยมหาราช", "เมืองสมดุล", "เชื่อมประวัติศาสตร์กับการบริการประชาชน"],
  ["2026-10-26", "วันออกพรรษา", "คุณภาพชีวิต", "งานวัด ประเพณี และการจัดการจราจร"],
  ["2026-11-24", "วันลอยกระทง", "สิ่งแวดล้อม", "กระทงธรรมชาติ ความปลอดภัย และขยะหลังงาน"],
  ["2026-12-04", "วันสิ่งแวดล้อมไทย", "สิ่งแวดล้อม", "สรุปผลงานลดขยะและเพิ่มพื้นที่สีเขียว"],
  ["2026-12-05", "วันพ่อแห่งชาติ / วันชาติ", "เมืองสมดุล", "น้อมรำลึก กิจกรรมจิตอาสา และคุณภาพชีวิต"],
  ["2026-12-10", "วันรัฐธรรมนูญ", "เมืองสมดุล", "สิทธิ หน้าที่ และการมีส่วนร่วมของประชาชน"],
  ["2026-12-31", "วันสิ้นปี", "ปลอดภัย", "สรุปผลงานทั้งปีและเตือนเดินทางปลอดภัย"],
].map(([date, title, pillar, idea]) => ({ date, title, pillar, idea, type: "วันสำคัญ" }));

const defaultTasks = [
  {
    id: "sample-1",
    date: "2026-07-16",
    title: "สำรวจจุดน้ำขังหลังฝนและท่อระบายน้ำ",
    pillar: "ปลอดภัย",
    channel: "Facebook",
    status: "รอถ่าย",
    shot: "ภาพก่อน-หลัง จุดน้ำขัง ทีมลงพื้นที่ และช่องทางแจ้งเหตุ",
  },
  {
    id: "sample-2",
    date: "2026-07-17",
    title: "คลิปสั้นแนะนำการแจ้งไฟสาธารณะดับ",
    pillar: "ปลอดภัย",
    channel: "LINE @brn12345",
    status: "ไอเดีย",
    shot: "ไฟถนนตอนกลางคืน ป้ายซอย และตัวอย่างการแจ้งพิกัด",
  },
  {
    id: "sample-3",
    date: "2026-07-20",
    title: "สรุปงานเก็บขยะตกค้างและล้างตลาด",
    pillar: "สะอาด",
    channel: "Facebook",
    status: "ตัดต่อ",
    shot: "ตลาด จุดทิ้งขยะ รถเก็บขยะ และพื้นที่หลังทำความสะอาด",
  },
  {
    id: "sample-4",
    date: "2026-07-28",
    title: "กิจกรรมจิตอาสาพัฒนาเมือง",
    pillar: "เมืองสมดุล",
    channel: "YouTube @BangraknoiNews",
    status: "รออนุมัติ",
    shot: "พิธีเปิด ทีมจิตอาสา ก่อน-หลังพื้นที่ และเสียงประชาชน",
  },
  {
    id: "sample-5",
    date: "2026-07-30",
    title: "ถวายเทียนพรรษาและดูแลความสะอาดวัด",
    pillar: "คุณภาพชีวิต",
    channel: "หลายช่องทาง",
    status: "ไอเดีย",
    shot: "วัด เทียนพรรษา ประชาชนร่วมงาน จุดจอดรถ และทีมทำความสะอาด",
  },
];

const promptTypes = {
  "ล้างท่อ/น้ำท่วม": "ปัญหาน้ำขัง จุดเสี่ยง ทีมลงพื้นที่ วิธีที่ประชาชนช่วยลดน้ำท่วม",
  "ซ่อมไฟถนน": "จุดมืด ความปลอดภัย ก่อน-หลัง วิธีแจ้งเหตุพร้อมพิกัด",
  "เก็บขยะ/ตลาดสะอาด": "จุดปัญหา ทีมเก็บขยะ เวลาเก็บขยะ และการแยกขยะ",
  "พ่นหมอกควัน/ไข้เลือดออก": "ลูกน้ำยุงลาย 3 จุด อสม. ลงพื้นที่ และการป้องกันในบ้าน",
  "ประชาคม/รับฟังความเห็น": "หัวข้อ วันเวลา ใครเข้าร่วมได้ และผลที่จะนำไปใช้",
  "กิจกรรมผู้สูงอายุ/เด็ก": "คนในชุมชน บริการเทศบาล ความปลอดภัย และคุณภาพชีวิต",
  "คลิปข่าว Bangraknoi News": "เปิดประเด็น สรุปเหตุการณ์ ภาพภาคสนาม เสียงประชาชน และปิดด้วยช่องทางติดตาม",
};

const pageTitles = {
  today: "วันนี้ทีมต้องสื่อสารอะไร",
  month: "เดือนนี้ทีมควรเล่าเรื่องอะไร",
  calendar: "ปฏิทินคอนเทนต์บางรักน้อย",
  board: "บอร์ดงานทีมประชาสัมพันธ์",
  canon: "คัมภีร์กันหลงของทีม",
  prompts: "Prompt สำหรับทันใจ AI Studio",
};

const storageKey = "brn-pr-workspace-tasks";
let activeMonth = 6;

function getToday() {
  const now = new Date();
  if (now.getFullYear() === 2026) return now;
  return new Date(2026, 6, 16);
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseISO(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function thaiDate(date) {
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function loadTasks() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [...defaultTasks];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...defaultTasks];
  } catch {
    return [...defaultTasks];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

let tasks = loadTasks();

function eventForDate(iso) {
  return events.filter((event) => event.date === iso);
}

function tasksForDate(iso) {
  return tasks.filter((task) => task.date === iso);
}

function monthItems(month) {
  return [
    ...events.filter((event) => parseISO(event.date).getMonth() === month),
    ...tasks.filter((task) => parseISO(task.date).getMonth() === month).map((task) => ({ ...task, type: "งานเทศบาล", idea: task.shot })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

function renderShell() {
  const today = getToday();
  activeMonth = today.getMonth();
  document.getElementById("today-chip").textContent = thaiDate(today);
  document.querySelector("[name='date']").value = toISO(today);

  const monthSelect = document.getElementById("month-select");
  monthSelect.innerHTML = thaiMonths.map((month, index) => `<option value="${index}">${month} ${2026 + 543}</option>`).join("");
  monthSelect.value = String(activeMonth);

  const workType = document.getElementById("work-type");
  workType.innerHTML = Object.keys(promptTypes).map((type) => `<option>${type}</option>`).join("");
}

function renderToday() {
  const today = getToday();
  const iso = toISO(today);
  const todayEvents = eventForDate(iso);
  const todayTasks = tasksForDate(iso);
  const list = document.getElementById("today-list");

  document.getElementById("today-heading").textContent = `วันนี้ ${thaiDate(today)}`;
  document.getElementById("today-summary").textContent =
    todayEvents.length || todayTasks.length
      ? "มีหัวข้อที่ควรสื่อสารแล้ว เลือก 1-2 เรื่องให้ทีมทำให้จบในวันนี้"
      : "วันนี้ไม่มีวันสำคัญหลักในฐานข้อมูล เลือกภารกิจประจำเมือง 1 เรื่อง แล้วเล่าให้ประชาชนเห็นผลลัพธ์";

  const fallback = [
    {
      title: "เลือกงานภาคสนาม 1 จุด",
      pillar: "สะอาด",
      idea: "ใช้สูตรก่อน-หลัง เช่น เก็บขยะ ล้างท่อ ตัดกิ่งไม้ หรือซ่อมไฟ",
      type: "ข้อเสนอ",
      channel: "Facebook",
    },
    {
      title: "ทำคลิปสั้นเตือนภัยช่วงฝน",
      pillar: "ปลอดภัย",
      idea: "บอกจุดเสี่ยง วิธีแจ้งเหตุ และเบอร์/ช่องทางติดต่อเทศบาล",
      type: "ข้อเสนอ",
      channel: "LINE @brn12345",
    },
    {
      title: "เตรียมคอนเทนต์วันสำคัญถัดไป",
      pillar: "เมืองสมดุล",
      idea: "ดูปฏิทินเดือนนี้ แล้วนัดหมายภาพที่ต้องถ่ายล่วงหน้า",
      type: "ข้อเสนอ",
      channel: "หลายช่องทาง",
    },
  ];

  const rows = [
    ...todayEvents.map((item) => ({ ...item, channel: "หลายช่องทาง" })),
    ...todayTasks.map((item) => ({ ...item, idea: item.shot, type: "งานเทศบาล" })),
  ];
  const visibleRows = rows.length ? rows : fallback;

  list.innerHTML = visibleRows
    .map(
      (item) => `
        <div class="content-card">
          <span class="tag" style="background:${pillars[item.pillar]?.color || "#0f6b57"}">${item.pillar}</span>
          <div>
            <h4>${item.title}</h4>
            <p>${item.idea}</p>
          </div>
          <div class="meta">
            <span>${item.type}</span>
            <span>${item.channel || "หลายช่องทาง"}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderMetrics() {
  const today = getToday();
  const month = today.getMonth();
  const items = monthItems(month);
  document.getElementById("metric-events").textContent = events.filter((event) => parseISO(event.date).getMonth() === month).length;
  document.getElementById("metric-tasks").textContent = tasks.filter((task) => parseISO(task.date).getMonth() === month).length;
  document.getElementById("metric-ready").textContent = tasks.filter((task) => task.status === "เผยแพร่แล้ว" || task.status === "รออนุมัติ").length;
  return items;
}

function renderMonth() {
  const month = Number(document.getElementById("month-select").value);
  activeMonth = month;
  const items = monthItems(month);
  document.getElementById("month-title").textContent = `${thaiMonths[month]} ${2026 + 543}: เดือนนี้ควรเล่าเรื่องอะไร`;

  const topPillars = Object.keys(pillars).map((pillar) => ({
    pillar,
    count: items.filter((item) => item.pillar === pillar).length,
  }));

  document.getElementById("month-brief").innerHTML = [
    ["ธีมหลัก", topPillars.sort((a, b) => b.count - a.count)[0]?.pillar || "เมืองสมดุล"],
    ["เป้าหมาย", "ให้ประชาชนเห็นว่างานประจำของเทศบาลเชื่อมกับคุณภาพชีวิตจริง"],
    ["จังหวะทีม", "เลือกงานใหญ่ 1 เรื่องต่อสัปดาห์ และเก็บงานภาคสนามเป็นคลิปสั้น"],
  ]
    .map(([label, text]) => `<div class="brief-card"><span>${label}</span><p>${text}</p></div>`)
    .join("");

  document.getElementById("month-timeline").innerHTML = items.length
    ? items
        .map((item) => {
          const date = parseISO(item.date);
          return `
            <div class="timeline-item">
              <div class="timeline-date">${date.getDate()} ${shortMonths[date.getMonth()]}</div>
              <div>
                <h4>${item.title}</h4>
                <p>${item.idea || item.shot}</p>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="timeline-item"><div class="timeline-date">ว่าง</div><div><h4>ยังไม่มีรายการ</h4><p>เพิ่มงานเทศบาลจากหน้า วันนี้ เพื่อวางแผนเดือนนี้</p></div></div>`;

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
          <div class="pillar-head"><span>${name}</span><span>${count} เรื่อง</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${percent}%; background:${config.color}"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const todayIso = toISO(getToday());
  const first = new Date(2026, activeMonth, 1);
  const firstOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(2026, activeMonth + 1, 0).getDate();
  const cells = [];
  const prevMonthDays = new Date(2026, activeMonth, 0).getDate();

  document.getElementById("calendar-title").textContent = `${thaiMonths[activeMonth]} ${2026 + 543}`;

  for (let i = 0; i < 42; i += 1) {
    const day = i - firstOffset + 1;
    let date;
    let muted = false;
    if (day < 1) {
      date = new Date(2026, activeMonth - 1, prevMonthDays + day);
      muted = true;
    } else if (day > daysInMonth) {
      date = new Date(2026, activeMonth + 1, day - daysInMonth);
      muted = true;
    } else {
      date = new Date(2026, activeMonth, day);
    }
    const iso = toISO(date);
    const dayEvents = eventForDate(iso);
    const dayTasks = tasksForDate(iso);
    cells.push(`
      <div class="day-cell ${muted ? "muted" : ""}">
        <div class="day-number ${iso === todayIso ? "today" : ""}">
          <span>${date.getDate()}</span>
          ${iso === todayIso ? "<span>วันนี้</span>" : ""}
        </div>
        ${dayEvents.map((event) => `<span class="event-pill">${event.title}</span>`).join("")}
        ${dayTasks.map((task) => `<span class="event-pill task">${task.title}</span>`).join("")}
      </div>
    `);
  }
  grid.innerHTML = cells.join("");
}

function renderBoard() {
  const board = document.getElementById("kanban");
  board.innerHTML = statuses
    .map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);
      return `
        <div class="kanban-column">
          <h4>${status} (${columnTasks.length})</h4>
          ${columnTasks
            .map(
              (task) => `
                <div class="task-card">
                  <strong>${task.title}</strong>
                  <span>${thaiDate(parseISO(task.date))} · ${task.pillar}</span>
                  <span>${task.channel}</span>
                  ${status !== "เผยแพร่แล้ว" ? `<button data-advance="${task.id}">ย้ายต่อ</button>` : ""}
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
          <span style="background:${config.color}">${name}</span>
          <h4>${name}</h4>
          <p>${config.angle}</p>
        </div>
      `
    )
    .join("");
}

function createPrompt() {
  const type = document.getElementById("work-type").value;
  const channel = document.getElementById("prompt-channel").value;
  const details = document.getElementById("prompt-details").value.trim() || "[ใส่รายละเอียดงานจริง]";
  const theme = promptTypes[type];
  return `ช่วยวางคอนเทนต์สำหรับทีมประชาสัมพันธ์เทศบาลเมืองบางรักน้อย

ประเภทงาน: ${type}
ช่องทางที่จะใช้: ${channel}
รายละเอียดหน้างาน: ${details}

กรอบการเล่าเรื่องของเทศบาล:
1. เชื่อมกับวิสัยทัศน์ "พัฒนาเมืองอย่างสมดุล สะอาด ปลอดภัย ใส่ใจสิ่งแวดล้อม และเสริมสร้างคุณภาพชีวิตของประชาชนทุกมิติ"
2. ใช้สูตร ปัญหา → เทศบาลลงมือ → ผลลัพธ์ → ประชาชนช่วยอะไรได้
3. ภาษาสุภาพ เข้าใจง่าย ไม่แข็งแบบประกาศราชการ
4. ระวังข้อมูลส่วนตัว หน้าเด็ก ผู้ป่วย ผู้เดือดร้อน และเอกสารราชการ

ขอผลลัพธ์เป็น:
- หัวข้อโพสต์ 3 แบบ
- Hook เปิดคลิป 3 วินาทีแรก
- แคปชันสำหรับ ${channel}
- Shot list ที่ควรถ่าย
- ข้อความปิดท้าย/CTA

ประเด็นที่ควรเน้น: ${theme}`;
}

function rerenderAll() {
  renderToday();
  renderMetrics();
  renderMonth();
  renderCalendar();
  renderBoard();
  renderCanon();
}

function bindEvents() {
  document.querySelectorAll(".nav-item, [data-section-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section || button.dataset.sectionTarget;
      document.querySelectorAll(".page-section").forEach((el) => el.classList.toggle("active", el.id === section));
      document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.section === section));
      document.getElementById("page-title").textContent = pageTitles[section];
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.getElementById("task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = form.get("title").toString().trim();
    if (!title) return;
    tasks = [
      ...tasks,
      {
        id: `task-${Date.now()}`,
        title,
        date: form.get("date").toString(),
        pillar: form.get("pillar").toString(),
        channel: form.get("channel").toString(),
        status: "ไอเดีย",
        shot: "เติมภาพที่ต้องถ่ายและข้อมูลหน้างาน",
      },
    ];
    saveTasks(tasks);
    event.currentTarget.reset();
    document.querySelector("[name='date']").value = toISO(getToday());
    rerenderAll();
  });

  document.getElementById("month-select").addEventListener("change", () => {
    activeMonth = Number(document.getElementById("month-select").value);
    renderMonth();
    renderCalendar();
  });

  document.getElementById("prev-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 11) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMonth();
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    activeMonth = (activeMonth + 1) % 12;
    document.getElementById("month-select").value = String(activeMonth);
    renderMonth();
    renderCalendar();
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
    rerenderAll();
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
