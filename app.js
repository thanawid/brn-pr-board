(() => {
  'use strict';

  const config = window.BRN_AUTH_CONFIG || {};
  const firebaseConfig = config.firebaseConfig;
  const LINE_OUTBOX_COLLECTION = 'lineOutbox';
  const LINE_GROUP_PATH = 'system/lineGroup';
  const TEAM_NAME = 'ทีม PR';
  const $ = (id) => document.getElementById(id);
  const state = {
    cursor: new Date(),
    selectedDate: new Date(),
    events: [],
    editingId: null,
    detailId: null,
    db: null,
    firestore: null,
    unsubscribe: null,
    cloudReady: false,
  };

  const categoryNames = {
    work: 'งานทีม PR',
    meeting: 'ประชุม / อบรม',
    activity: 'กิจกรรม',
    important: 'วันสำคัญ',
    media: 'ถ่ายทำ / สื่อ',
    buddhist: 'วันพระ',
    other: 'งานทีม PR',
  };

  const importantDaysByMonth = {
    0: [{ day: 1, title: 'วันขึ้นปีใหม่', note: 'ข้อความอวยพรและสรุปภารกิจปีใหม่' }, { day: 11, title: 'วันเด็กแห่งชาติ', note: 'เตรียมภาพกิจกรรมเด็กและครอบครัว' }],
    1: [{ day: 14, title: 'วันวาเลนไทน์', note: 'คอนเทนต์ความรักต่อชุมชน' }, { day: 24, title: 'วันศิลปินแห่งชาติ', note: 'สื่อวัฒนธรรมและภูมิปัญญา' }],
    2: [{ day: 8, title: 'วันสตรีสากล', note: 'นำเสนอพลังสตรีในชุมชน' }, { day: 13, title: 'วันช้างไทย', note: 'คอนเทนต์อนุรักษ์ธรรมชาติ' }],
    3: [{ day: 6, title: 'วันจักรี', note: 'จัดเตรียมข้อความและภาพพิธีการ' }, { day: 13, title: 'วันสงกรานต์', note: 'วางแผนภาพบรรยากาศและความปลอดภัย' }, { day: 24, title: 'วันเทศบาล', note: 'สรุปผลงานและคนทำงานเบื้องหลัง' }],
    4: [{ day: 1, title: 'วันแรงงาน', note: 'สื่อสารคุณค่าของผู้ปฏิบัติงาน' }, { day: 31, title: 'วันงดสูบบุหรี่โลก', note: 'คอนเทนต์สุขภาพและการป้องกัน' }],
    5: [{ day: 5, title: 'วันสิ่งแวดล้อมโลก', note: 'กิจกรรมคลองสวย น้ำใส และคัดแยกขยะ' }, { day: 26, title: 'วันต่อต้านยาเสพติด', note: 'สื่อรณรงค์สำหรับเด็กและเยาวชน' }],
    6: [{ day: 1, title: 'วันสถาปนาลูกเสือแห่งชาติ', note: 'เยาวชน จิตอาสา ระเบียบวินัย และการช่วยชุมชน' }, { day: 28, title: 'วันเฉลิมพระชนมพรรษา', note: 'เตรียมสื่อเทิดพระเกียรติอย่างเหมาะสม' }, { day: 29, title: 'วันภาษาไทยแห่งชาติ', note: 'คอนเทนต์ภาษาและภูมิปัญญาท้องถิ่น' }],
    7: [{ day: 12, title: 'วันแม่แห่งชาติ', note: 'ภาพแม่ ลูก และครอบครัวในชุมชน' }, { day: 18, title: 'วันวิทยาศาสตร์', note: 'นำเสนอการเรียนรู้ของเด็กและเยาวชน' }],
    8: [{ day: 20, title: 'วันเยาวชนแห่งชาติ', note: 'กิจกรรมและเสียงของเยาวชนในพื้นที่' }, { day: 28, title: 'วันพระราชทานธงชาติไทย', note: 'เตรียมภาพธงชาติและกิจกรรมเคารพธงชาติ' }],
    9: [{ day: 13, title: 'วันนวมินทรมหาราช', note: 'สื่อพิธีการและกิจกรรมจิตอาสา' }, { day: 23, title: 'วันปิยมหาราช', note: 'เตรียมภาพพิธีวางพวงมาลา' }],
    10: [{ day: 14, title: 'วันพระบิดาแห่งฝนหลวง', note: 'คอนเทนต์น้ำ สิ่งแวดล้อม และเกษตร' }, { day: 25, title: 'วันยุติความรุนแรงต่อสตรี', note: 'ข้อมูลช่วยเหลือและการรณรงค์' }],
    11: [{ day: 5, title: 'วันพ่อแห่งชาติ', note: 'ภาพครอบครัวและกิจกรรมจิตอาสา' }, { day: 10, title: 'วันรัฐธรรมนูญ', note: 'ข้อมูลความรู้แบบเข้าใจง่าย' }, { day: 31, title: 'วันสิ้นปี', note: 'สรุปผลงานเด่นประจำปี' }],
  };

  const buddhistDays = [
    ['2026-01-03', 'ขึ้น 15 ค่ำ เดือนยี่'], ['2026-01-11', 'แรม 8 ค่ำ เดือนยี่'], ['2026-01-18', 'แรม 15 ค่ำ เดือนยี่'], ['2026-01-26', 'ขึ้น 8 ค่ำ เดือนสาม'],
    ['2026-02-02', 'ขึ้น 15 ค่ำ เดือนสาม'], ['2026-02-10', 'แรม 8 ค่ำ เดือนสาม'], ['2026-02-16', 'แรม 14 ค่ำ เดือนสาม'], ['2026-02-24', 'ขึ้น 8 ค่ำ เดือนสี่'],
    ['2026-03-03', 'ขึ้น 15 ค่ำ เดือนสี่'], ['2026-03-11', 'แรม 8 ค่ำ เดือนสี่'], ['2026-03-18', 'แรม 15 ค่ำ เดือนสี่'], ['2026-03-26', 'ขึ้น 8 ค่ำ เดือนห้า'],
    ['2026-04-02', 'ขึ้น 15 ค่ำ เดือนห้า'], ['2026-04-10', 'แรม 8 ค่ำ เดือนห้า'], ['2026-04-16', 'แรม 14 ค่ำ เดือนห้า'], ['2026-04-24', 'ขึ้น 8 ค่ำ เดือนหก'],
    ['2026-05-01', 'ขึ้น 15 ค่ำ เดือนหก'], ['2026-05-09', 'แรม 8 ค่ำ เดือนหก'], ['2026-05-16', 'แรม 15 ค่ำ เดือนหก'], ['2026-05-24', 'ขึ้น 8 ค่ำ เดือนเจ็ด'], ['2026-05-31', 'ขึ้น 15 ค่ำ เดือนเจ็ด'],
    ['2026-06-08', 'แรม 8 ค่ำ เดือนเจ็ด / วันอัฏฐมีบูชา'], ['2026-06-14', 'แรม 14 ค่ำ เดือนเจ็ด'], ['2026-06-22', 'ขึ้น 8 ค่ำ เดือนแปด'], ['2026-06-29', 'ขึ้น 15 ค่ำ เดือนแปด'],
    ['2026-07-07', 'แรม 8 ค่ำ เดือนแปด'], ['2026-07-14', 'แรม 15 ค่ำ เดือนแปด'], ['2026-07-22', 'ขึ้น 8 ค่ำ เดือนแปดหลัง'], ['2026-07-29', 'ขึ้น 15 ค่ำ เดือนแปดหลัง'], ['2026-07-30', 'แรม 1 ค่ำ เดือนแปดหลัง / วันเข้าพรรษา'],
    ['2026-08-06', 'แรม 8 ค่ำ เดือนแปดหลัง'], ['2026-08-13', 'แรม 15 ค่ำ เดือนแปดหลัง'], ['2026-08-21', 'ขึ้น 8 ค่ำ เดือนเก้า'], ['2026-08-28', 'ขึ้น 15 ค่ำ เดือนเก้า'],
    ['2026-09-05', 'แรม 8 ค่ำ เดือนเก้า'], ['2026-09-11', 'แรม 14 ค่ำ เดือนเก้า'], ['2026-09-19', 'ขึ้น 8 ค่ำ เดือนสิบ'], ['2026-09-26', 'ขึ้น 15 ค่ำ เดือนสิบ'],
    ['2026-10-04', 'แรม 8 ค่ำ เดือนสิบ'], ['2026-10-11', 'แรม 15 ค่ำ เดือนสิบ'], ['2026-10-19', 'ขึ้น 8 ค่ำ เดือนสิบเอ็ด'], ['2026-10-26', 'ขึ้น 15 ค่ำ เดือนสิบเอ็ด'],
    ['2026-11-03', 'แรม 8 ค่ำ เดือนสิบเอ็ด'], ['2026-11-09', 'แรม 14 ค่ำ เดือนสิบเอ็ด'], ['2026-11-17', 'ขึ้น 8 ค่ำ เดือนสิบสอง'], ['2026-11-24', 'ขึ้น 15 ค่ำ เดือนสิบสอง'],
    ['2026-12-02', 'แรม 8 ค่ำ เดือนสิบสอง'], ['2026-12-09', 'แรม 15 ค่ำ เดือนสิบสอง'], ['2026-12-17', 'ขึ้น 8 ค่ำ เดือนอ้าย'], ['2026-12-24', 'ขึ้น 15 ค่ำ เดือนอ้าย'],
  ].map(([date, lunar]) => ({ id: `buddhist-${date}`, date, title: 'วันพระ', description: lunar, category: 'buddhist', owner: TEAM_NAME, source: 'system' }));

  const els = {
    title: $('month-title'), grid: $('calendar-grid'), prev: $('prev-month'), next: $('next-month'), today: $('today-button'), add: $('add-event-button'),
    syncStatus: $('sync-status'),
    eventDialog: $('event-dialog'), eventForm: $('event-form'), eventDialogTitle: $('event-dialog-title'), eventDialogKicker: $('event-dialog-kicker'), eventId: $('event-id'),
    eventTitle: $('event-title'), eventDescription: $('event-description'), eventDate: $('event-date'), eventTime: $('event-time'), eventLocation: $('event-location'), eventOwner: $('event-owner'), deleteEvent: $('delete-event'),
    detailDialog: $('detail-dialog'), detailTitle: $('detail-title'), detailCategory: $('detail-category'), detailDate: $('detail-date'), detailTime: $('detail-time'), detailLocation: $('detail-location'), detailOwner: $('detail-owner'), detailDescription: $('detail-description'), editEvent: $('edit-event'),
    guideTitle: $('guide-title'), photoGuide: $('photo-guide'), videoGuide: $('video-guide'), prepGuide: $('prep-guide'), contentGuide: $('content-guide'), importantDays: $('important-days'),
    ideasDialog: $('ideas-dialog'), ideasList: $('ideas-list'), toast: $('toast'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function parseDate(value) { const [y, m, d] = String(value).split('-').map(Number); return new Date(y, m - 1, d); }
  function thaiMonthYear(date) { return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(date); }
  function thaiFullDate(value) { return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(value)); }
  function thaiShortMonth(date) { return new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date); }
  function escapeHtml(text) { return String(text ?? '').replace(/[&<>'"]/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[m])); }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function localEvents() {
    try { return JSON.parse(localStorage.getItem('brn-pr-board-events') || '[]'); } catch { return []; }
  }

  function saveLocalEvents() {
    localStorage.setItem('brn-pr-board-events', JSON.stringify(state.events));
  }

  function localLineJobs() {
    try { return JSON.parse(localStorage.getItem('brn-pr-board-line-jobs') || '[]'); } catch { return []; }
  }

  function saveLocalLineJob(job) {
    const jobs = localLineJobs();
    jobs.unshift(job);
    localStorage.setItem('brn-pr-board-line-jobs', JSON.stringify(jobs.slice(0, 50)));
  }

  function renderLineStatus() {
    // LINE status is handled by the existing backend; keep this quiet in the UI.
  }

  function specialItemsForDate(dateIso) {
    const date = parseDate(dateIso);
    const important = (importantDaysByMonth[date.getMonth()] || [])
      .filter((item) => item.day === date.getDate())
      .map((item, index) => ({
        id: `important-${dateIso}-${index}`,
        date: dateIso,
        title: item.title,
        description: item.note,
        category: 'important',
        owner: TEAM_NAME,
        source: 'system',
      }));
    return [...important, ...buddhistDays.filter((item) => item.date === dateIso)];
  }

  function userEventsForDate(dateIso) {
    return state.events.filter((event) => event.date === dateIso).map((event) => ({ ...event, source: 'user' }));
  }

  function allItemsForDate(dateIso) {
    return [...specialItemsForDate(dateIso), ...userEventsForDate(dateIso)]
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  }

  function selectedIso() {
    return isoDate(state.selectedDate);
  }

  function setSelectedDate(dateIso, { keepMonth = false } = {}) {
    state.selectedDate = parseDate(dateIso);
    if (!keepMonth) state.cursor = new Date(state.selectedDate.getFullYear(), state.selectedDate.getMonth(), 1);
    renderAll();
  }

  function syncQuickDate() {
    return selectedIso();
  }

  function guidanceFor(items) {
    const text = items.map((e) => `${e.title} ${e.description || ''}`).join(' ').toLowerCase();
    let photo = ['ภาพเปิดที่เห็นสถานที่และผู้เข้าร่วม', 'ภาพกิจกรรมระยะกลางที่เห็นการมีส่วนร่วม', 'ภาพสีหน้าและรายละเอียดเล็ก ๆ', 'ภาพหมู่หรือภาพสรุปช่วงท้าย'];
    let video = ['คลิปเปิดบรรยากาศ 5-8 วินาที', 'B-roll การทำกิจกรรมหลายมุม', 'คำพูดสั้นจากผู้เกี่ยวข้อง', 'ช็อตปิดที่สรุปผลของงาน'];
    let prep = ['เช็กแบตเตอรี่และเมมโมรีการ์ด', 'เตรียมไมค์หรืออุปกรณ์เสียง', 'ตรวจเวลาและสถานที่ก่อนออกงาน', 'ดูรายชื่อบุคคลสำคัญที่ต้องเก็บภาพ'];
    let content = ['โพสต์ภาพเด่นพร้อมข้อมูลสั้นชัดเจน', 'คลิปแนวตั้งสรุปบรรยากาศ', 'ภาพ Before / During / After', 'ประโยคสั้นที่สะท้อนประโยชน์ต่อประชาชน'];

    if (/ประชุม|ประชาคม|อบรม|สัมมนา/.test(text)) {
      photo = ['ป้ายงานและโต๊ะลงทะเบียน', 'ประธานกล่าวเปิดและวิทยากร', 'ผู้เข้าร่วมกำลังฟังหรือแสดงความคิดเห็น', 'ภาพหมู่และเอกสารสรุปประเด็น'];
      video = ['Wide shot ให้เห็นภาพรวมของห้อง', 'ช็อตผู้พูดสลับกับผู้ฟัง', 'เสียงสัมภาษณ์สั้น 1 ประเด็น', 'คลิปสรุปผลหรือข้อเสนอสำคัญ'];
    } else if (/ทำความสะอาด|คลอง|ขยะ|สิ่งแวดล้อม|ปลูกต้นไม้/.test(text)) {
      photo = ['สภาพพื้นที่ก่อนเริ่มงาน', 'ทีมงานและประชาชนลงมือทำ', 'รายละเอียดอุปกรณ์หรือสิ่งที่เก็บได้', 'ภาพเปรียบเทียบก่อนและหลัง'];
      video = ['เปิดด้วย Before แล้วตัดไปช่วงลงมือ', 'Time-lapse หรือช็อตการทำงานต่อเนื่อง', 'ภาพใกล้การเก็บขยะหรือปรับภูมิทัศน์', 'ปิดด้วย After และภาพทีมงาน'];
      content = ['Reels แบบ Before-After', 'ตัวเลขปริมาณขยะหรือพื้นที่ที่ดำเนินการ', 'ขอบคุณประชาชนและหน่วยงานร่วม', 'เกร็ดคัดแยกขยะที่ทำได้ที่บ้าน'];
    } else if (/ผู้สูงอายุ|เด็ก|เยาวชน|กีฬา|ออกกำลังกาย/.test(text)) {
      photo = ['รอยยิ้มและการมีส่วนร่วม', 'กิจกรรมระหว่างบุคคลหลายช่วงวัย', 'ภาพเคลื่อนไหวที่มีพลัง', 'ภาพหมู่ที่เป็นธรรมชาติ'];
      video = ['ช็อตเคลื่อนไหวแบบสั้น กระชับ', 'Close-up สีหน้าและมือขณะทำกิจกรรม', 'คำพูดสั้นจากผู้ร่วมกิจกรรม', 'Highlight 20-30 วินาที'];
    } else if (/ลงพื้นที่|ช่วยเหลือ|มอบ|เยี่ยม|ตรวจ/.test(text)) {
      photo = ['ภาพพื้นที่และสภาพปัญหา', 'ช่วงพูดคุยรับฟังประชาชน', 'ขั้นตอนการช่วยเหลือหรือส่งมอบ', 'ภาพผลลัพธ์และการติดตามงาน'];
      video = ['เปิดด้วยบริบทของพื้นที่', 'เก็บเสียงประชาชนแบบสั้นและสุภาพ', 'ภาพการดำเนินการจริง', 'ปิดด้วยข้อมูลช่องทางติดต่อ'];
    } else if (/วันพระ|วัด|พรรษา|พระ/.test(text)) {
      photo = ['ภาพบรรยากาศวัดและพื้นที่โดยรอบ', 'ประชาชนร่วมกิจกรรมอย่างเหมาะสม', 'ทีมดูแลความสะอาดหรือความเรียบร้อย', 'ภาพป้ายแจ้งบริการหรือจุดจอดรถ'];
      video = ['เปิดด้วยบรรยากาศสงบของพื้นที่', 'ช็อตทีมงานดูแลพื้นที่หรืออำนวยความสะดวก', 'ภาพประชาชนใช้พื้นที่อย่างเรียบร้อย', 'ปิดด้วยข้อความชวนรักษาความสะอาด'];
      content = ['โพสต์เตือนวันพระพร้อมมารยาทการใช้พื้นที่', 'ภาพชุดวัดสะอาดชุมชนร่วมดูแล', 'คลิปสั้นบรรยากาศและการอำนวยความสะดวก', 'CTA ชวนรักษาความสะอาดและแจ้งเหตุ'];
    }
    return { photo, video, prep, content };
  }

  function renderGuides() {
    const items = allItemsForDate(selectedIso());
    const guide = guidanceFor(items);
    els.guideTitle.textContent = items.length ? `${thaiFullDate(selectedIso())} · ${items[0].title}` : thaiFullDate(selectedIso());
    const fill = (el, values) => { el.innerHTML = values.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join(''); };
    fill(els.photoGuide, guide.photo);
    fill(els.videoGuide, guide.video);
    fill(els.prepGuide, guide.prep);
    fill(els.contentGuide, guide.content);
  }

  function renderImportantDays() {
    const days = importantDaysByMonth[state.cursor.getMonth()] || [];
    const month = thaiShortMonth(state.cursor);
    const buddhistInMonth = buddhistDays
      .filter((item) => parseDate(item.date).getMonth() === state.cursor.getMonth())
      .slice(0, 4)
      .map((item) => ({ day: parseDate(item.date).getDate(), title: item.title, note: item.description }));
    els.importantDays.innerHTML = [...days, ...buddhistInMonth]
      .map((item) => `<article class="important-day"><strong>${item.day} ${month}</strong><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.note)}</small></article>`)
      .join('');
  }

  function renderIdeas() {
    const days = importantDaysByMonth[state.cursor.getMonth()] || [];
    const monthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(state.cursor);
    els.ideasList.innerHTML = (days.length ? days : [{ day: '-', title: `เดือน${monthName}`, note: 'เลือกประเด็นจากงานในปฏิทิน แล้วเล่าให้เห็นประโยชน์ต่อประชาชน' }])
      .map((item) => `<div class="idea-row"><strong>${item.day} ${monthName}</strong><div><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.note)}</p></div></div>`)
      .join('');
  }

  function renderCalendar() {
    const year = state.cursor.getFullYear();
    const month = state.cursor.getMonth();
    els.title.textContent = thaiMonthYear(state.cursor);
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const todayIso = isoDate(new Date());
    const currentSelected = selectedIso();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 42; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateIso = isoDate(date);
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.date = dateIso;
      cell.tabIndex = 0;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `เลือกวันที่ ${thaiFullDate(dateIso)}`);
      if (date.getMonth() !== month) cell.classList.add('outside');
      if (dateIso === todayIso) cell.classList.add('today');
      if (dateIso === currentSelected) cell.classList.add('selected');
      const dayItems = allItemsForDate(dateIso);
      const chips = dayItems.slice(0, 4).map((item) => {
        const eventAttr = item.source === 'user' ? ` data-event-id="${escapeHtml(item.id)}"` : '';
        return `<button type="button" class="event-chip ${item.category || 'other'}"${eventAttr} title="${escapeHtml(item.title)}">${item.time ? `<b>${escapeHtml(item.time)}</b> ` : ''}${escapeHtml(item.title)}</button>`;
      }).join('');
      cell.innerHTML = `<span class="day-number">${date.getDate()}</span><div class="day-events">${chips}${dayItems.length > 4 ? `<span class="more-events">+${dayItems.length - 4} งาน</span>` : ''}</div>`;
      cell.addEventListener('click', (event) => {
        const eventButton = event.target.closest('[data-event-id]');
        if (eventButton) {
          event.stopPropagation();
          openDetail(eventButton.dataset.eventId);
          return;
        }
        setSelectedDate(dateIso, { keepMonth: true });
        openEventDialog(dateIso);
      });
      cell.addEventListener('dblclick', (event) => {
        event.preventDefault();
        if (!els.eventDialog.open) openEventDialog(dateIso);
      });
      cell.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        setSelectedDate(dateIso, { keepMonth: true });
        openEventDialog(dateIso);
      });
      fragment.appendChild(cell);
    }
    els.grid.replaceChildren(fragment);
    renderImportantDays();
  }

  function renderSelectedDayPanel() {
    // Kept as a no-op for older cached pages that may still call it.
  }

  function renderAll() {
    renderCalendar();
    renderGuides();
    renderIdeas();
  }

  function resetQuickForm(keepDate = true) {
    return keepDate;
  }

  function payloadFromQuickForm() {
    return { date: selectedIso() };
  }

  function payloadFromDialog() {
    return {
      title: els.eventTitle.value.trim(),
      description: els.eventDescription.value.trim(),
      date: els.eventDate.value,
      time: els.eventTime.value,
      location: els.eventLocation.value.trim(),
      owner: els.eventOwner.value.trim(),
      category: 'work',
      lineNotify: true,
      lineTarget: LINE_GROUP_PATH,
      updatedAtLocal: new Date().toISOString(),
      updatedBy: window.BRN_CURRENT_USER?.displayName || TEAM_NAME,
    };
  }

  function fillDialogFromPayload(payload) {
    els.eventTitle.value = payload.title || '';
    els.eventDescription.value = payload.description || '';
    els.eventDate.value = payload.date || selectedIso();
    els.eventTime.value = payload.time || '';
    els.eventLocation.value = payload.location || '';
    els.eventOwner.value = payload.owner || '';
  }

  function openEventDialog(dateIso, event = null, seed = null) {
    state.editingId = event?.id || null;
    els.eventDialogTitle.textContent = event ? 'แก้ไขงาน' : 'เพิ่มงานใหม่';
    els.eventDialogKicker.textContent = event ? 'รายละเอียดงานในปฏิทิน' : 'จัดงานในปฏิทิน';
    els.eventId.value = event?.id || '';
    fillDialogFromPayload(event || seed || { date: dateIso || selectedIso() });
    els.deleteEvent.hidden = !event;
    els.eventDialog.showModal();
    setTimeout(() => els.eventTitle.focus(), 100);
  }

  function openDetail(id) {
    const event = state.events.find((item) => item.id === id);
    if (!event) return;
    state.detailId = id;
    els.detailTitle.textContent = event.title;
    els.detailCategory.textContent = categoryNames[event.category] || categoryNames.other;
    els.detailDate.textContent = thaiFullDate(event.date);
    els.detailTime.textContent = event.time || 'ไม่ระบุเวลา';
    els.detailLocation.textContent = event.location || 'ไม่ระบุสถานที่';
    els.detailOwner.textContent = event.owner || TEAM_NAME;
    els.detailDescription.textContent = event.description || 'ไม่มีรายละเอียดเพิ่มเติม';
    els.detailDialog.showModal();
  }

  function eventDateTime(event) {
    const date = parseDate(event.date);
    if (event.time) {
      const [hour, minute] = event.time.split(':').map(Number);
      date.setHours(hour || 0, minute || 0, 0, 0);
    } else {
      date.setHours(8, 0, 0, 0);
    }
    return date;
  }

  function buildLineMessage(event, immediate = false) {
    const when = `${thaiFullDate(event.date)}${event.time ? ` เวลา ${event.time} น.` : ''}`;
    return [
      immediate ? 'แจ้งงาน PR เทศบาลเมืองบางรักน้อย' : 'เพิ่มงานใหม่ใน BRN PR Board',
      event.title,
      when,
      event.location ? `สถานที่: ${event.location}` : '',
      event.owner ? `เจ้าของงาน: ${event.owner}` : '',
      event.description ? `รายละเอียด: ${event.description}` : '',
    ].filter(Boolean).join('\n');
  }

  function buildLineJob(event, { immediate = false, reason = 'save' } = {}) {
    const sendAt = immediate ? new Date() : eventDateTime(event);
    return {
      kind: immediate ? 'line-immediate' : 'line-reminder',
      reason,
      status: 'pending',
      target: LINE_GROUP_PATH,
      targetRef: LINE_GROUP_PATH,
      groupRef: LINE_GROUP_PATH,
      lineGroupPath: LINE_GROUP_PATH,
      eventId: event.id || null,
      sendAtLocal: sendAt.toISOString(),
      message: buildLineMessage(event, immediate),
      event: {
        id: event.id || null,
        title: event.title,
        date: event.date,
        time: event.time || '',
        location: event.location || '',
        owner: event.owner || '',
        category: event.category || 'work',
      },
      createdBy: window.BRN_CURRENT_USER || null,
      createdAtLocal: new Date().toISOString(),
    };
  }

  async function queueLineNotification(event, options = {}) {
    const immediate = options.immediate !== false;
    const job = buildLineJob(event, { ...options, immediate });
    const collectionName = LINE_OUTBOX_COLLECTION;
    try {
      if (state.cloudReady && state.firestore) {
        const { addDoc, collection, serverTimestamp, Timestamp } = state.firestore;
        await addDoc(collection(state.db, collectionName), {
          ...job,
          sendAt: Timestamp.fromDate(new Date(job.sendAtLocal)),
          createdAt: serverTimestamp(),
        });
        return true;
      }
      saveLocalLineJob(job);
      return true;
    } catch (error) {
      console.warn('LINE queue failed', error);
      saveLocalLineJob({ ...job, status: 'pending-local' });
      return false;
    }
  }

  async function saveEvent(payload) {
    if (!payload.title || !payload.date) return null;
    let savedEvent = null;
    if (state.cloudReady && state.firestore) {
      const { addDoc, collection, doc, setDoc, serverTimestamp } = state.firestore;
      const cloudPayload = { ...payload, updatedAt: serverTimestamp() };
      if (state.editingId) {
        await setDoc(doc(state.db, 'prEvents', state.editingId), cloudPayload, { merge: true });
        savedEvent = { ...payload, id: state.editingId };
      } else {
        const ref = await addDoc(collection(state.db, 'prEvents'), { ...cloudPayload, createdAt: serverTimestamp() });
        savedEvent = { ...payload, id: ref.id };
      }
    } else if (state.editingId) {
      const index = state.events.findIndex((event) => event.id === state.editingId);
      if (index >= 0) state.events[index] = { ...state.events[index], ...payload };
      savedEvent = { ...payload, id: state.editingId };
      saveLocalEvents();
    } else {
      savedEvent = { ...payload, id: `local-${Date.now()}` };
      state.events.push(savedEvent);
      saveLocalEvents();
    }
    if (savedEvent) {
      state.events = [...state.events.filter((event) => event.id !== savedEvent.id), savedEvent];
      await queueLineNotification(savedEvent, { immediate: true, reason: state.editingId ? 'event-updated' : 'event-created' });
      setSelectedDate(savedEvent.date);
    }
    return savedEvent;
  }

  async function deleteCurrentEvent() {
    if (!state.editingId || !confirm('ลบงานนี้ออกจากปฏิทินใช่หรือไม่?')) return;
    if (state.cloudReady && state.firestore) {
      const { deleteDoc, doc } = state.firestore;
      await deleteDoc(doc(state.db, 'prEvents', state.editingId));
    } else {
      state.events = state.events.filter((event) => event.id !== state.editingId);
      saveLocalEvents();
      renderAll();
    }
    els.eventDialog.close();
    showToast('ลบงานแล้ว');
  }

  async function initCloud() {
    if (!firebaseConfig) throw new Error('Missing Firebase config');
    try {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js'),
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      state.db = fs.getFirestore(app);
      state.firestore = fs;
      const q = fs.query(fs.collection(state.db, 'prEvents'), fs.orderBy('date', 'asc'));
      state.unsubscribe = fs.onSnapshot(q, (snapshot) => {
        state.events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        state.cloudReady = true;
        els.syncStatus.textContent = 'ซิงก์ข้อมูลกับทีมแล้ว';
        renderAll();
      }, (error) => {
        console.warn(error);
        state.events = localEvents();
        state.cloudReady = false;
        els.syncStatus.textContent = 'ใช้งานบนเครื่องนี้';
        renderAll();
      });
    } catch (error) {
      console.warn(error);
      state.events = localEvents();
      state.cloudReady = false;
      els.syncStatus.textContent = 'ใช้งานบนเครื่องนี้';
      renderAll();
    }
  }

  els.prev.addEventListener('click', () => {
    state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() - 1, 1);
    state.selectedDate = new Date(state.cursor.getFullYear(), state.cursor.getMonth(), 1);
    renderAll();
  });

  els.next.addEventListener('click', () => {
    state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + 1, 1);
    state.selectedDate = new Date(state.cursor.getFullYear(), state.cursor.getMonth(), 1);
    renderAll();
  });

  els.today.addEventListener('click', () => setSelectedDate(isoDate(new Date())));
  els.add.addEventListener('click', () => openEventDialog(selectedIso()));

  els.eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = payloadFromDialog();
    try {
      await saveEvent(payload);
      els.eventDialog.close();
      showToast(state.editingId ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มงานลงปฏิทินแล้ว');
    } catch (error) {
      console.error(error);
      showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  });

  els.deleteEvent.addEventListener('click', deleteCurrentEvent);
  els.editEvent.addEventListener('click', () => {
    const event = state.events.find((item) => item.id === state.detailId);
    if (!event) return;
    els.detailDialog.close();
    openEventDialog(event.date, event);
  });

  document.body.addEventListener('click', (event) => {
    const detail = event.target.closest('[data-detail-id]');
    if (detail) {
      openDetail(detail.dataset.detailId);
      return;
    }
    const edit = event.target.closest('[data-edit-id]');
    if (edit) {
      const item = state.events.find((entry) => entry.id === edit.dataset.editId);
      if (item) openEventDialog(item.date, item);
    }
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('.modal-dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  const ideasButton = $('open-month-ideas');
  if (ideasButton) ideasButton.addEventListener('click', () => { renderIdeas(); els.ideasDialog.showModal(); });

  state.cursor = new Date();
  state.cursor.setDate(1);
  state.selectedDate = new Date();
  state.events = localEvents();
  renderAll();
  initCloud();
})();
