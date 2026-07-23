(() => {
  if (window.__BRN_APP_LOADED__) return;
  window.__BRN_APP_LOADED__ = true;

  const cfg = window.BRN_AUTH_CONFIG?.firebaseConfig;
  const calendarData = window.BRN_CALENDAR_DATA || { important: [], buddhist: [] };
  const IMPORTANT = calendarData.important || [];
  const BUDDHIST = calendarData.buddhist || [];
  const $ = (id) => document.getElementById(id);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const CATEGORIES = {
    meeting: 'ประชุม / อบรม',
    activity: 'กิจกรรม',
    media: 'ถ่ายทำ / สื่อ',
    other: 'อื่น ๆ',
  };
  const STATUSES = {
    waiting_info: 'รอข้อมูล',
    confirmed: 'ยืนยันแล้ว',
    preparing: 'กำลังเตรียมสื่อ',
    ready: 'พร้อมปฏิบัติงาน',
    waiting_publish: 'รอเผยแพร่',
    published: 'เผยแพร่แล้ว',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
  };
  const STATUS_FLOW = ['waiting_info', 'confirmed', 'preparing', 'ready', 'waiting_publish', 'published', 'completed'];
  const OUTPUTS = {
    news: 'ข่าว Facebook',
    album: 'อัลบั้มภาพ',
    reel: 'Reel / คลิปสั้น',
    video: 'วิดีโอสรุป',
    live: 'ถ่ายทอดสด',
    poster: 'โปสเตอร์',
  };
  const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const SHORT_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const state = {
    cursor: startOfMonth(new Date()),
    selectedDate: new Date(),
    selectedEventId: null,
    events: [],
    editingId: null,
    detailId: null,
    cloud: false,
    db: null,
    fs: null,
    unsubscribe: null,
    query: '',
    category: 'all',
    status: 'all',
    view: window.innerWidth <= 700 ? 'list' : 'month',
    detailTab: 'prep',
    teamFilter: 'active',
    metricRange: null,
  };

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  function iso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function parseDate(value) {
    if (!value) return new Date();
    const [y, m, d] = String(value).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
  function daysBetween(from, to) {
    const a = parseDate(iso(from));
    const b = parseDate(iso(to));
    return Math.round((b - a) / 86400000);
  }
  function thaiDate(value, includeWeekday = true) {
    const date = typeof value === 'string' ? parseDate(value) : value;
    return date.toLocaleDateString('th-TH', {
      ...(includeWeekday ? { weekday: 'long' } : {}),
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok',
    });
  }
  function monthTitle(date) {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
  }
  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function normalizeEvent(raw) {
    return {
      ...raw,
      title: raw.title || 'งานประชาสัมพันธ์',
      description: raw.description || '',
      date: raw.date || iso(new Date()),
      category: raw.category || 'other',
      status: raw.status || inferLegacyStatus(raw),
      startTime: raw.startTime || raw.time || '',
      endTime: raw.endTime || '',
      allDay: Boolean(raw.allDay),
      location: raw.location || '',
      owner: raw.owner || '',
      contactName: raw.contactName || '',
      contactPhone: raw.contactPhone || '',
      chairperson: raw.chairperson || '',
      outputs: Array.isArray(raw.outputs) ? raw.outputs : [],
      publicationLinks: raw.publicationLinks || '',
      notifyLine: raw.notifyLine !== false,
    };
  }
  function inferLegacyStatus(event) {
    const today = iso(new Date());
    if (event.date < today) return event.publicationLinks ? 'published' : 'waiting_publish';
    return 'waiting_info';
  }
  function displayTime(event) {
    if (event.allDay) return 'ตลอดวัน';
    const start = event.startTime || event.time || '';
    const end = event.endTime || '';
    if (!start) return 'ไม่ระบุเวลา';
    return end ? `${start}–${end} น.` : `${start} น.`;
  }
  function sortedEvents(events = state.events) {
    return [...events].sort((a, b) => `${a.date} ${a.startTime || a.time || '99:99'}`.localeCompare(`${b.date} ${b.startTime || b.time || '99:99'}`));
  }
  function isActive(event) {
    return !['completed', 'cancelled'].includes(event.status);
  }
  function eventSearchText(event) {
    return [event.title, event.description, event.location, event.owner, event.contactName, STATUSES[event.status], CATEGORIES[event.category]].join(' ').toLowerCase();
  }
  function filteredEvents(events = state.events) {
    return events.filter((event) => {
      if (state.query && !eventSearchText(event).includes(state.query)) return false;
      if (state.category !== 'all' && event.category !== state.category) return false;
      if (state.status !== 'all' && event.status !== state.status) return false;
      return true;
    });
  }
  function outputLabels(event) {
    return (event.outputs || []).map((key) => OUTPUTS[key] || key);
  }

  function readiness(event) {
    const fields = [
      ['เวลาเริ่มงาน', Boolean(event.allDay || event.startTime || event.time)],
      ['สถานที่', Boolean(event.location)],
      ['กอง/สำนักเจ้าของงาน', Boolean(event.owner)],
      ['ผู้ประสานงาน', Boolean(event.contactName)],
      ['เบอร์ผู้ประสานงาน', Boolean(event.contactPhone)],
      ['ประธาน/ผู้กล่าวเปิดงาน', Boolean(event.chairperson)],
      ['ผลงานที่ต้องจัดทำ', Boolean(event.outputs?.length)],
    ];
    const missing = fields.filter(([, ok]) => !ok).map(([name]) => name);
    const score = Math.round(((fields.length - missing.length) / fields.length) * 100);
    const level = score >= 85 ? 'good' : score >= 55 ? 'warn' : 'risk';
    return { score, level, missing, fields };
  }

  function statusPill(event) {
    return `<span class="status-pill status-${esc(event.status)}">${esc(STATUSES[event.status] || 'รอข้อมูล')}</span>`;
  }
  function readinessPill(event) {
    const r = readiness(event);
    return `<span class="readiness-pill ${r.level}">${r.score}% พร้อม</span>`;
  }

  function guidance(event) {
    const text = [event.title, event.description, event.location, event.owner].join(' ').toLowerCase();
    const prep = ['ตรวจวัน เวลา สถานที่ และเบอร์ผู้ประสานงานก่อนออกจากสำนักงาน', 'ชาร์จแบตเตอรี่ เตรียมเมมโมรี และอุปกรณ์สำรอง', 'เปิดใบงานก่อนเริ่มงาน 10 นาทีเพื่อทบทวนภาพบังคับ'];
    const photo = ['เก็บภาพกว้างเพื่อบอกสถานที่และบรรยากาศ', 'เก็บภาพกลางของกิจกรรมหลักและบุคคลสำคัญ', 'เก็บภาพใกล้ของสีหน้า มือ และรายละเอียดที่เล่าเรื่องได้', 'เผื่อภาพแนวตั้งสำหรับ Story และหน้าปกคลิป'];
    const video = ['เปิดด้วยภาพที่บอกได้ทันทีว่างานคืออะไรภายใน 3–5 วินาที', 'เก็บ B-roll ทั้งภาพกว้าง กลาง ใกล้ และการเคลื่อนไหว', 'บันทึกเสียงบรรยากาศและคำสัมภาษณ์สั้นอย่างน้อย 1 คน', 'ปิดด้วยผลลัพธ์ของงานหรือช่องทางติดต่อ'];
    const content = ['พาดหัวควรบอกว่าเทศบาลทำอะไร ที่ไหน และประชาชนได้ประโยชน์อย่างไร', 'ข่าวหลังงานควรใช้ข้อมูลยืนยันแล้วเท่านั้น โดยเฉพาะชื่อ ตำแหน่ง วัน เวลา และจำนวน', 'เลือกภาพเปิดที่เห็นการลงมือทำหรือผลลัพธ์ ไม่ใช่ภาพยืนเรียงอย่างเดียว'];

    const add = (condition, target, items) => { if (condition) target.unshift(...items); };
    add(/ประชุม|อบรม|สัมมนา|ประชาคม|สภา/.test(text), prep, ['ขอวาระประชุม รายชื่อประธาน และประเด็นตัดสินใจที่ต้องสื่อ', 'เตรียมป้ายชื่อบุคคลและสะกดตำแหน่งให้ตรงเอกสาร']);
    add(/ประชาคม|รับฟัง|ความเห็น/.test(text), photo, ['เน้นภาพประชาชนแสดงความคิดเห็นและเจ้าหน้าที่รับฟัง', 'เก็บภาพเอกสาร แผนที่ หรือประเด็นปัญหาที่ประชาชนเสนอ']);
    add(/ประชุม|อบรม|สัมมนา|สภา/.test(text), video, ['เก็บช่วงเปิดงาน ประเด็นสำคัญ และข้อสรุป ไม่จำเป็นต้องถ่ายต่อเนื่องทั้งงาน']);
    add(/ทำความสะอาด|คลอง|ขยะ|สิ่งแวดล้อม|ปลูกต้นไม้/.test(text), photo, ['ถ่ายภาพก่อนทำ ระหว่างทำ และหลังทำจากมุมใกล้เคียงกัน', 'เน้นภาพเจ้าหน้าที่และประชาชนลงมือทำจริง']);
    add(/ทำความสะอาด|คลอง|ขยะ|สิ่งแวดล้อม/.test(text), content, ['ทำคอนเทนต์แบบ ก่อน–หลัง และบอกผลลัพธ์ที่วัดได้เมื่อมีข้อมูลยืนยัน']);
    add(/ผู้สูงอายุ|เด็ก|เยาวชน|ครอบครัว|สุขภาพ/.test(text), photo, ['ขออนุญาตก่อนถ่ายภาพใกล้ โดยเฉพาะเด็กและกลุ่มเปราะบาง', 'เน้นปฏิสัมพันธ์ รอยยิ้ม และการมีส่วนร่วมอย่างเป็นธรรมชาติ']);
    add(/ศาสนา|วัด|ตักบาตร|ถวาย|พระ|พรรษา/.test(text), prep, ['ตรวจลำดับพิธี การแต่งกาย และจุดยืนที่ไม่รบกวนพิธี']);
    add(/ศาสนา|วัด|ตักบาตร|ถวาย|พระ|พรรษา/.test(text), photo, ['หลีกเลี่ยงแฟลชและการเคลื่อนผ่านหน้าพิธี', 'เก็บภาพรวมพิธี เครื่องสักการะ และการมีส่วนร่วมของชุมชน']);
    add(/live|ถ่ายทอดสด|ถ่ายทอด/.test(text) || event.outputs?.includes('live'), prep, ['ทดสอบอินเทอร์เน็ต เสียง และไฟเลี้ยงก่อนเริ่มอย่างน้อย 30 นาที', 'เตรียมข้อความสำรองกรณีสัญญาณขัดข้อง']);
    add(event.outputs?.includes('reel'), video, ['เก็บคลิปแนวตั้ง 9:16 และเผื่อพื้นที่บน–ล่างสำหรับข้อความ']);
    add(event.outputs?.includes('poster'), content, ['ล็อกข้อความจริงที่ต้องใช้บนโปสเตอร์ก่อนสร้างภาพ และตรวจคำทุกครั้ง']);

    const r = readiness(event);
    if (r.missing.length) prep.unshift(`ข้อมูลที่ควรขอเพิ่มก่อนงาน: ${r.missing.join(', ')}`);
    return {
      prep: [...new Set(prep)].slice(0, 7),
      photo: [...new Set(photo)].slice(0, 7),
      video: [...new Set(video)].slice(0, 7),
      content: [...new Set(content)].slice(0, 7),
    };
  }

  function riskAlerts(event) {
    const r = readiness(event);
    const diff = daysBetween(new Date(), parseDate(event.date));
    const alerts = [];
    if (r.missing.length) alerts.push(`ยังขาด: ${r.missing.slice(0, 3).join(', ')}${r.missing.length > 3 ? ' และข้อมูลอื่น' : ''}`);
    if (diff <= 1 && diff >= 0 && r.score < 85) alerts.push('งานเริ่มภายใน 24 ชั่วโมง แต่ข้อมูลยังไม่พร้อม');
    if (event.date < iso(new Date()) && !['published', 'completed', 'cancelled'].includes(event.status)) alerts.push('งานผ่านไปแล้ว แต่ยังไม่ปิดสถานะหรือแนบลิงก์ผลงาน');
    if (event.status === 'waiting_publish' && !event.publicationLinks) alerts.push('รอเผยแพร่และยังไม่มีลิงก์ผลงาน');
    return alerts;
  }

  function localEvents() {
    try { return JSON.parse(localStorage.getItem('brn-pr-events-v2') || '[]').map(normalizeEvent); } catch { return []; }
  }
  function saveLocal() {
    localStorage.setItem('brn-pr-events-v2', JSON.stringify(state.events));
  }

  function toast(message, duration = 3200) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), duration);
  }

  function renderAll() {
    renderDashboard();
    renderCalendar();
    renderImportant();
    renderAssistant();
    if ($('team-work-dialog')?.open) renderTeamWork();
  }

  function renderDashboard() {
    const todayKey = iso(new Date());
    const weekEnd = iso(addDays(new Date(), 7));
    const todayEvents = sortedEvents(state.events.filter((e) => e.date === todayKey && e.status !== 'cancelled'));
    const weekEvents = sortedEvents(state.events.filter((e) => e.date >= todayKey && e.date <= weekEnd && isActive(e)));
    const missingEvents = state.events.filter((e) => e.date >= todayKey && isActive(e) && readiness(e).missing.length);
    const waitingPublish = state.events.filter((e) => e.status === 'waiting_publish');
    $('metric-today').textContent = todayEvents.length;
    $('metric-week').textContent = weekEvents.length;
    $('metric-missing').textContent = missingEvents.length;
    $('metric-publish').textContent = waitingPublish.length;

    if (todayEvents.length) {
      $('today-title').textContent = `วันนี้มี ${todayEvents.length} งานที่ต้องดูแล`;
      const risky = todayEvents.filter((e) => readiness(e).score < 85).length;
      $('today-summary').textContent = risky ? `${risky} งานยังมีข้อมูลหรือการเตรียมที่ต้องตามต่อ` : 'ข้อมูลหลักพร้อมแล้ว ทีมสามารถเปิดใบงานเพื่อทบทวนก่อนออกงาน';
    } else {
      $('today-title').textContent = 'วันนี้ไม่มีงานตามปฏิทิน';
      $('today-summary').textContent = weekEvents.length ? `มี ${weekEvents.length} งานใน 7 วันข้างหน้า ควรใช้วันนี้เตรียมข้อมูลและสื่อ` : 'ตารางสัปดาห์นี้ยังว่าง เหมาะสำหรับวางแผนคอนเทนต์ล่วงหน้า';
    }

    const upcoming = sortedEvents(state.events.filter((e) => e.date >= todayKey && isActive(e)));
    const next = upcoming[0];
    const card = $('next-event-card');
    if (!next) {
      card.className = 'next-event-card empty';
      card.innerHTML = `<span class="next-label">งานถัดไป</span><h2>ยังไม่มีงานที่กำลังจะมาถึง</h2><p>เพิ่มงานใหม่เพื่อให้ทีมเห็นแผนเดียวกันทุกอุปกรณ์</p><div class="next-actions"><button class="btn primary" data-add-empty type="button">＋ เพิ่มงาน</button></div>`;
    } else {
      const diff = daysBetween(new Date(), parseDate(next.date));
      const when = diff === 0 ? 'วันนี้' : diff === 1 ? 'พรุ่งนี้' : `อีก ${diff} วัน`;
      card.className = 'next-event-card';
      card.innerHTML = `<span class="next-label">งานถัดไป · ${when}</span><h2>${esc(next.title)}</h2><p>${esc(thaiDate(next.date))} · ${esc(displayTime(next))}</p><p>${esc(next.location || 'ยังไม่ระบุสถานที่')}</p><div class="next-actions"><button class="btn primary" data-open-next="${esc(next.id)}" type="button">เปิดใบงาน PR</button><button class="btn ghost" data-edit-next="${esc(next.id)}" type="button">แก้ไขข้อมูล</button></div>`;
    }

    const focusCandidates = sortedEvents(state.events.filter((e) => isActive(e) && (e.date >= todayKey || e.status === 'waiting_publish')))
      .sort((a, b) => {
        const ar = riskAlerts(a).length ? 0 : 1;
        const br = riskAlerts(b).length ? 0 : 1;
        return ar - br || `${a.date} ${a.startTime || ''}`.localeCompare(`${b.date} ${b.startTime || ''}`);
      }).slice(0, 6);
    $('focus-list').innerHTML = focusCandidates.length ? focusCandidates.map((event) => {
      const date = parseDate(event.date);
      const alerts = riskAlerts(event);
      return `<article class="focus-item"><div class="focus-date"><strong>${date.getDate()}</strong><span>${SHORT_MONTHS[date.getMonth()]}</span></div><div class="focus-copy"><strong>${esc(event.title)}</strong><span>${esc(displayTime(event))} · ${esc(event.location || event.owner || 'ยังไม่ระบุสถานที่')}</span><small>${alerts.length ? `⚠ ${esc(alerts[0])}` : '✓ ข้อมูลหลักอยู่ในระดับพร้อมใช้งาน'}</small></div><div class="focus-actions">${statusPill(event)}${readinessPill(event)}<button class="btn ghost" data-focus-id="${esc(event.id)}" type="button">เปิดงาน</button></div></article>`;
    }).join('') : '<div class="empty-state">ยังไม่มีงานที่ต้องติดตาม เพิ่มงานใหม่เพื่อเริ่มจัดลำดับให้ทีม</div>';
  }

  function renderCalendar() {
    $('month-title').textContent = monthTitle(state.cursor);
    renderViewState();
    renderMonthGrid();
    renderListView();
  }

  function renderViewState() {
    qsa('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === state.view));
    $('calendar-month-view').hidden = state.view !== 'month';
    $('calendar-list-view').hidden = state.view !== 'list';
  }

  function renderMonthGrid() {
    const year = state.cursor.getFullYear();
    const month = state.cursor.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = addDays(first, -first.getDay());
    const visibleEvents = filteredEvents();
    const todayKey = iso(new Date());
    const selectedKey = iso(state.selectedDate);
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const date = addDays(gridStart, i);
      const key = iso(date);
      const dayEvents = sortedEvents(visibleEvents.filter((event) => event.date === key));
      const important = IMPORTANT.filter((item) => item.date === key);
      const buddhist = BUDDHIST.find((item) => item.date === key);
      const chips = [];
      if ($('show-holidays').checked) important.forEach((item) => chips.push(`<button class="chip holiday" data-date-only="${key}" type="button">${esc(item.title)}</button>`));
      dayEvents.slice(0, 3).forEach((event) => chips.push(`<button class="chip ${esc(event.category)}" data-event-id="${esc(event.id)}" type="button">${esc(event.startTime || event.time || '')}${event.startTime || event.time ? ' ' : ''}${esc(event.title)}</button>`));
      const hiddenCount = Math.max(0, dayEvents.length + (($('show-holidays').checked) ? important.length : 0) - 3);
      cells.push(`<div class="day ${date.getMonth() !== month ? 'outside' : ''} ${key === todayKey ? 'today' : ''} ${key === selectedKey ? 'selected' : ''}" role="gridcell" data-day="${key}"><span class="day-number">${date.getDate()}</span>${$('show-buddhist').checked && buddhist ? `<span class="lunar">วันพระ · ${esc(buddhist.lunar)}</span>` : ''}<div class="entries">${chips.slice(0, 3).join('')}${hiddenCount ? `<span class="more">+${hiddenCount} รายการ</span>` : ''}</div></div>`);
    }
    $('calendar-grid').innerHTML = cells.join('');
  }

  function renderListView() {
    const y = state.cursor.getFullYear();
    const m = state.cursor.getMonth();
    const rows = sortedEvents(filteredEvents().filter((event) => {
      const date = parseDate(event.date);
      return date.getFullYear() === y && date.getMonth() === m;
    }));
    const groups = new Map();
    rows.forEach((event) => {
      if (!groups.has(event.date)) groups.set(event.date, []);
      groups.get(event.date).push(event);
    });
    $('calendar-list-view').innerHTML = groups.size ? [...groups.entries()].map(([date, events]) => `<section class="list-day-group"><div class="list-day-head">${esc(thaiDate(date))}</div>${events.map((event) => `<button class="list-event" data-list-event-id="${esc(event.id)}" type="button"><time>${esc(displayTime(event))}</time><span><strong>${esc(event.title)}</strong><span>${esc(event.location || event.owner || 'ยังไม่ระบุสถานที่')}</span></span>${statusPill(event)}</button>`).join('')}</section>`).join('') : '<div class="empty-state">ไม่พบงานในเดือนนี้ตามตัวกรองที่เลือก</div>';
  }

  function renderAssistant() {
    const event = state.events.find((item) => item.id === state.selectedEventId);
    const section = $('work-assistant');
    if (!event) { section.hidden = true; return; }
    const alerts = riskAlerts(event);
    $('assistant-title').textContent = `แผนเตรียม “${event.title}” พร้อมแล้ว`;
    $('assistant-summary-text').textContent = alerts.length ? 'ระบบพบข้อมูลหรือขั้นตอนที่ควรจัดการก่อนงาน' : 'ข้อมูลหลักพร้อม ระบบจัดแนวทางภาพ คลิป และคอนเทนต์จากรายละเอียดของงานแล้ว';
    $('assistant-alerts').innerHTML = alerts.length ? alerts.map((alert) => `<span class="assistant-alert">⚠ ${esc(alert)}</span>`).join('') : '<span class="assistant-alert" style="background:#e7f6ed;color:#176b4f">✓ ไม่พบความเสี่ยงสำคัญจากข้อมูลที่มี</span>';
    section.hidden = false;
  }

  function renderImportant() {
    const today = iso(new Date());
    const upcoming = IMPORTANT.filter((item) => item.date >= today).slice(0, 6);
    $('important-days').innerHTML = upcoming.length ? upcoming.map((item) => {
      const diff = daysBetween(new Date(), parseDate(item.date));
      const when = diff === 0 ? 'วันนี้' : diff === 1 ? 'พรุ่งนี้' : `อีก ${diff} วัน`;
      return `<article class="important-day"><strong>${esc(when)}</strong><span>${esc(item.title)}</span><small>${esc(thaiDate(item.date, false))}</small></article>`;
    }).join('') : '<div class="empty-state">ยังไม่มีข้อมูลวันสำคัญถัดไปในชุดข้อมูลปีนี้</div>';
  }

  function openDay(dateKey) {
    state.selectedDate = parseDate(dateKey);
    state.selectedEventId = null;
    renderCalendar();
    renderAssistant();
    const events = sortedEvents(state.events.filter((event) => event.date === dateKey));
    const special = IMPORTANT.filter((item) => item.date === dateKey);
    const buddhist = BUDDHIST.find((item) => item.date === dateKey);
    $('day-title').textContent = thaiDate(dateKey);
    const specialHtml = [...special.map((item) => `<div class="day-item"><strong>${esc(item.title)}</strong><span>${esc(item.note || item.type)}</span></div>`), ...(buddhist ? [`<div class="day-item"><strong>วันพระ</strong><span>${esc(buddhist.lunar)}</span></div>`] : [])];
    const eventHtml = events.map((event) => `<button class="day-item" data-day-event-id="${esc(event.id)}" type="button"><strong>${esc(event.title)}</strong><span>${esc(displayTime(event))} · ${esc(event.location || event.owner || 'ยังไม่ระบุสถานที่')}</span><span>${STATUSES[event.status] || 'รอข้อมูล'} · ความพร้อม ${readiness(event).score}%</span></button>`);
    $('day-list').innerHTML = [...specialHtml, ...eventHtml].join('') || '<div class="empty-state">วันนี้ยังไม่มีงาน กดเพิ่มงานเพื่อบันทึกลงปฏิทินทีม</div>';
    $('day-dialog').showModal();
  }

  function openEvent(dateKey = iso(state.selectedDate), event = null) {
    state.editingId = event?.id || null;
    $('event-heading').textContent = event ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่';
    $('event-kicker').textContent = event ? 'ปรับข้อมูลใบงานประชาสัมพันธ์' : 'จัดงานลงปฏิทินทีม';
    $('event-id').value = event?.id || '';
    $('event-title').value = event?.title || '';
    $('event-description').value = event?.description || '';
    $('event-date').value = event?.date || dateKey;
    $('event-status').value = event?.status || 'waiting_info';
    $('event-start-time').value = event?.startTime || event?.time || '';
    $('event-end-time').value = event?.endTime || '';
    $('event-all-day').checked = Boolean(event?.allDay);
    $('event-location').value = event?.location || '';
    $('event-owner').value = event?.owner || '';
    $('event-category').value = event?.category || 'meeting';
    $('event-contact-name').value = event?.contactName || '';
    $('event-contact-phone').value = event?.contactPhone || '';
    $('event-chairperson').value = event?.chairperson || '';
    $('event-publication-links').value = event?.publicationLinks || '';
    $('event-notify').checked = event?.notifyLine !== false;
    qsa('input[name="outputs"]', $('event-form')).forEach((input) => { input.checked = Boolean(event?.outputs?.includes(input.value)); });
    $('delete-event').hidden = !event;
    syncAllDayFields();
    $('event-dialog').showModal();
    setTimeout(() => $('event-title').focus(), 80);
  }

  function syncAllDayFields() {
    const disabled = $('event-all-day').checked;
    $('event-start-time').disabled = disabled;
    $('event-end-time').disabled = disabled;
    if (disabled) { $('event-start-time').value = ''; $('event-end-time').value = ''; }
  }

  function getFormData() {
    const current = window.BRN_CURRENT_USER || {};
    return normalizeEvent({
      title: $('event-title').value.trim(),
      description: $('event-description').value.trim(),
      date: $('event-date').value,
      status: $('event-status').value,
      startTime: $('event-all-day').checked ? '' : $('event-start-time').value,
      endTime: $('event-all-day').checked ? '' : $('event-end-time').value,
      allDay: $('event-all-day').checked,
      location: $('event-location').value.trim(),
      owner: $('event-owner').value.trim(),
      category: $('event-category').value,
      contactName: $('event-contact-name').value.trim(),
      contactPhone: $('event-contact-phone').value.trim(),
      chairperson: $('event-chairperson').value.trim(),
      outputs: qsa('input[name="outputs"]:checked', $('event-form')).map((input) => input.value),
      publicationLinks: $('event-publication-links').value.trim(),
      notifyLine: $('event-notify').checked,
      reminderEnabled: $('event-notify').checked,
      reminderPolicy: 'default',
      reminderTimezone: 'Asia/Bangkok',
      reminders: [
        { type: 'day_before', daysBefore: 1, time: '08:00' },
        { type: 'event_morning', daysBefore: 0, time: '07:00' },
      ],
      updatedBy: current.email || current.displayName || 'unknown',
    });
  }

  async function saveEvent(payload) {
    let savedId = state.editingId;
    const isEdit = Boolean(state.editingId);
    if (state.cloud) {
      if (isEdit) {
        await state.fs.setDoc(state.fs.doc(state.db, 'prEvents', state.editingId), { ...payload, updatedAt: state.fs.serverTimestamp() }, { merge: true });
      } else {
        const ref = await state.fs.addDoc(state.fs.collection(state.db, 'prEvents'), { ...payload, createdAt: state.fs.serverTimestamp(), updatedAt: state.fs.serverTimestamp() });
        savedId = ref.id;
      }
    } else if (isEdit) {
      const index = state.events.findIndex((event) => event.id === state.editingId);
      state.events[index] = { ...state.events[index], ...payload };
      saveLocal();
      renderAll();
    } else {
      savedId = `local-${Date.now()}`;
      state.events.push({ ...payload, id: savedId });
      saveLocal();
      renderAll();
    }
    state.selectedEventId = savedId;
    state.selectedDate = parseDate(payload.date);
    return { savedId, isEdit };
  }

  async function queueLine(event, action) {
    if (!event.notifyLine || !state.cloud) return { skipped: true };
    const r = readiness(event);
    const lines = [`📣 ${action}`, event.title, `📅 ${thaiDate(event.date)}${displayTime(event) !== 'ไม่ระบุเวลา' ? ` เวลา ${displayTime(event)}` : ''}`];
    if (event.location) lines.push(`📍 ${event.location}`);
    if (event.owner) lines.push(`เจ้าของงาน: ${event.owner}`);
    lines.push(`สถานะ: ${STATUSES[event.status] || 'รอข้อมูล'} · ความพร้อม ${r.score}%`);
    await state.fs.addDoc(state.fs.collection(state.db, 'lineOutbox'), {
      text: lines.join('\n'), status: 'pending', createdAt: state.fs.serverTimestamp(), eventId: event.id || null, type: 'pr-event',
    });
    return { queued: true };
  }

  async function deleteEvent() {
    if (!state.editingId || !confirm('ลบงานนี้ออกจากปฏิทินทีมใช่หรือไม่?')) return;
    if (state.cloud) await state.fs.deleteDoc(state.fs.doc(state.db, 'prEvents', state.editingId));
    else {
      state.events = state.events.filter((event) => event.id !== state.editingId);
      saveLocal();
      renderAll();
    }
    if (state.selectedEventId === state.editingId) state.selectedEventId = null;
    $('event-dialog').close();
    toast('ลบงานแล้ว');
  }

  function openDetail(id) {
    const event = state.events.find((item) => item.id === id);
    if (!event) return;
    state.detailId = id;
    state.selectedEventId = id;
    state.selectedDate = parseDate(event.date);
    state.detailTab = 'prep';
    renderAssistant();
    renderDetail();
    $('detail-dialog').showModal();
  }

  function renderDetail() {
    const event = state.events.find((item) => item.id === state.detailId);
    if (!event) return;
    const r = readiness(event);
    $('detail-category').textContent = CATEGORIES[event.category] || 'งานประชาสัมพันธ์';
    $('detail-title').textContent = event.title;
    $('detail-status-row').innerHTML = `${statusPill(event)}${readinessPill(event)}<span class="category-pill">${esc(CATEGORIES[event.category] || 'อื่น ๆ')}</span>`;
    const meta = [
      ['วันที่', thaiDate(event.date)], ['เวลา', displayTime(event)], ['สถานที่', event.location || 'ยังไม่ระบุ'], ['กอง/สำนัก', event.owner || 'ยังไม่ระบุ'], ['ผู้ประสานงาน', event.contactName || 'ยังไม่ระบุ'], ['เบอร์ติดต่อ', event.contactPhone || 'ยังไม่ระบุ'], ['ประธาน/ผู้กล่าวเปิด', event.chairperson || 'ยังไม่ระบุ'], ['สถานะ', STATUSES[event.status] || 'รอข้อมูล'],
    ];
    $('detail-meta').innerHTML = meta.map(([label, value]) => `<div class="meta-card"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('');
    $('detail-description').textContent = event.description || 'ยังไม่มีรายละเอียดกิจกรรม';
    $('detail-readiness').innerHTML = `<span class="readiness-pill ${r.level}">${r.score}% พร้อม</span>`;
    $('detail-missing').innerHTML = r.fields.map(([name, ok]) => `<div class="check-row ${ok ? 'ok' : 'missing'}"><span>${ok ? '✓' : '!'}</span><span>${esc(name)}${ok ? ' พร้อมแล้ว' : ' ยังไม่มีข้อมูล'}</span></div>`).join('');
    $('detail-outputs').innerHTML = event.outputs?.length ? outputLabels(event).map((label) => `<span class="output-tag">${esc(label)}</span>`).join('') : '<span class="empty-state" style="width:100%">ยังไม่ได้กำหนดผลงานที่ต้องจัดทำ</span>';
    const links = String(event.publicationLinks || '').split(/\n+/).map((item) => item.trim()).filter(Boolean);
    $('detail-links-section').hidden = !links.length;
    $('detail-links').innerHTML = links.map((url) => /^https?:\/\//i.test(url) ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>` : `<span>${esc(url)}</span>`).join('');
    renderDetailSupport();
    const index = STATUS_FLOW.indexOf(event.status);
    $('mark-next-status').hidden = index < 0 || index >= STATUS_FLOW.length - 1;
    $('mark-next-status').textContent = index >= 0 && index < STATUS_FLOW.length - 1 ? `เลื่อนไป: ${STATUSES[STATUS_FLOW[index + 1]]}` : 'เลื่อนสถานะ';
    $('retry-line').hidden = !event.notifyLine;
  }

  function renderDetailSupport() {
    const event = state.events.find((item) => item.id === state.detailId);
    if (!event) return;
    const guide = guidance(event);
    qsa('[data-support-tab]').forEach((button) => button.classList.toggle('active', button.dataset.supportTab === state.detailTab));
    $('detail-support-content').innerHTML = `<ul>${guide[state.detailTab].map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }

  async function advanceStatus() {
    const event = state.events.find((item) => item.id === state.detailId);
    if (!event) return;
    const index = STATUS_FLOW.indexOf(event.status);
    if (index < 0 || index >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[index + 1];
    if (state.cloud) await state.fs.setDoc(state.fs.doc(state.db, 'prEvents', event.id), { status: next, updatedAt: state.fs.serverTimestamp() }, { merge: true });
    else {
      event.status = next;
      saveLocal();
      renderAll();
      renderDetail();
    }
    toast(`เปลี่ยนสถานะเป็น “${STATUSES[next]}” แล้ว`);
  }

  function renderTeamWork() {
    const today = iso(new Date());
    let rows = sortedEvents(state.events);
    if (state.metricRange === 'today') rows = rows.filter((event) => event.date === today && event.status !== 'cancelled');
    else if (state.metricRange === 'week') rows = rows.filter((event) => event.date >= today && event.date <= iso(addDays(new Date(), 7)) && isActive(event));
    else if (state.teamFilter === 'active') rows = rows.filter((event) => isActive(event) && (event.date >= today || event.status === 'waiting_publish'));
    else if (state.teamFilter === 'missing') rows = rows.filter((event) => event.date >= today && isActive(event) && readiness(event).missing.length);
    else if (state.teamFilter === 'publish') rows = rows.filter((event) => event.status === 'waiting_publish');
    qsa('[data-team-filter]').forEach((button) => button.classList.toggle('active', !state.metricRange && button.dataset.teamFilter === state.teamFilter));
    $('team-work-list').innerHTML = rows.length ? rows.slice(0, 60).map((event) => `<button class="team-item" data-team-event-id="${esc(event.id)}" type="button"><strong>${esc(event.title)}</strong><span>${esc(thaiDate(event.date))} · ${esc(displayTime(event))}</span><span>${esc(event.location || event.owner || 'ยังไม่ระบุสถานที่')} · ${STATUSES[event.status]} · พร้อม ${readiness(event).score}%</span></button>`).join('') : '<div class="empty-state">ไม่พบงานในกลุ่มนี้</div>';
  }

  function openTeamWork(filter = 'active', metricRange = null) {
    state.teamFilter = filter;
    state.metricRange = metricRange;
    renderTeamWork();
    $('team-work-dialog').showModal();
  }

  async function initCloud() {
    if (!cfg || state.unsubscribe) return;
    try {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js'),
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      state.db = fs.getFirestore(app);
      state.fs = fs;
      const query = fs.query(fs.collection(state.db, 'prEvents'), fs.orderBy('date', 'asc'));
      state.unsubscribe = fs.onSnapshot(query, (snapshot) => {
        state.events = snapshot.docs.map((doc) => normalizeEvent({ id: doc.id, ...doc.data() }));
        state.cloud = true;
        $('sync-status').textContent = 'ซิงก์ข้อมูลกับทีมแล้ว';
        renderAll();
        if ($('detail-dialog').open) renderDetail();
      }, (error) => {
        console.error(error);
        state.cloud = false;
        state.events = localEvents();
        $('sync-status').textContent = 'Firestore ไม่พร้อม · ใช้ข้อมูลในเครื่อง';
        renderAll();
      });
    } catch (error) {
      console.error(error);
      state.cloud = false;
      state.events = localEvents();
      $('sync-status').textContent = 'ใช้งานข้อมูลในเครื่อง';
      renderAll();
    }
  }

  function updateLiveDateTime() {
    const now = new Date();
    $('live-date-text').textContent = now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' });
    $('live-time-text').textContent = `เวลา ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }).replace(':', '.')} น.`;
  }

  function bindEvents() {
    $('prev-month').addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() - 1, 1); renderCalendar(); });
    $('next-month').addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + 1, 1); renderCalendar(); });
    $('today-button').addEventListener('click', () => { state.cursor = startOfMonth(new Date()); state.selectedDate = new Date(); renderCalendar(); $('calendar').scrollIntoView({ behavior: 'smooth' }); });
    ['add-event-button', 'add-event-top'].forEach((id) => $(id).addEventListener('click', () => openEvent(iso(state.selectedDate))));
    $('event-all-day').addEventListener('change', syncAllDayFields);
    $('show-holidays').addEventListener('change', renderCalendar);
    $('show-buddhist').addEventListener('change', renderCalendar);
    $('event-search').addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); renderCalendar(); });
    $('event-filter').addEventListener('change', (event) => { state.category = event.target.value; renderCalendar(); });
    $('status-filter').addEventListener('change', (event) => { state.status = event.target.value; renderCalendar(); });
    qsa('[data-view]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view; renderViewState(); }));

    $('calendar-grid').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-event-id]');
      if (chip) { event.stopPropagation(); openDetail(chip.dataset.eventId); return; }
      const day = event.target.closest('[data-day]');
      if (day) openDay(day.dataset.day);
    });
    $('calendar-list-view').addEventListener('click', (event) => {
      const item = event.target.closest('[data-list-event-id]');
      if (item) openDetail(item.dataset.listEventId);
    });
    $('day-list').addEventListener('click', (event) => {
      const item = event.target.closest('[data-day-event-id]');
      if (!item) return;
      $('day-dialog').close();
      openDetail(item.dataset.dayEventId);
    });
    $('day-add').addEventListener('click', () => { const key = iso(state.selectedDate); $('day-dialog').close(); openEvent(key); });

    $('next-event-card').addEventListener('click', (event) => {
      const open = event.target.closest('[data-open-next]');
      const edit = event.target.closest('[data-edit-next]');
      const add = event.target.closest('[data-add-empty]');
      if (open) openDetail(open.dataset.openNext);
      if (edit) { const target = state.events.find((item) => item.id === edit.dataset.editNext); if (target) openEvent(target.date, target); }
      if (add) openEvent(iso(state.selectedDate));
    });
    $('focus-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-focus-id]');
      if (button) openDetail(button.dataset.focusId);
    });
    qsa('[data-metric]').forEach((button) => button.addEventListener('click', () => {
      const metric = button.dataset.metric;
      if (metric === 'today' || metric === 'week') openTeamWork('all', metric);
      else if (metric === 'missing') openTeamWork('missing');
      else if (metric === 'publish') openTeamWork('publish');
    }));

    $('event-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = getFormData();
      if (!payload.title || !payload.date) return;
      const submit = $('event-form').querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const { savedId, isEdit } = await saveEvent(payload);
        $('event-dialog').close();
        toast(isEdit ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มงานลงปฏิทินทีมแล้ว');
        try {
          await queueLine({ ...payload, id: savedId }, isEdit ? 'แก้ไขงานประชาสัมพันธ์' : 'เพิ่มงานประชาสัมพันธ์ใหม่');
        } catch (lineError) {
          console.error(lineError);
          toast('บันทึกงานแล้ว แต่แจ้ง LINE ไม่สำเร็จ กรุณาตรวจระบบส่งข้อความ', 5000);
        }
      } catch (error) {
        console.error(error);
        toast('บันทึกงานไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore');
      } finally { submit.disabled = false; }
    });
    $('delete-event').addEventListener('click', deleteEvent);
    $('edit-event').addEventListener('click', () => {
      const target = state.events.find((item) => item.id === state.detailId);
      if (!target) return;
      $('detail-dialog').close();
      openEvent(target.date, target);
    });
    $('mark-next-status').addEventListener('click', advanceStatus);
    $('print-work-order').addEventListener('click', () => window.print());
    $('copy-media-brief').addEventListener('click', async () => {
      const event = state.events.find((item) => item.id === state.detailId);
      if (!event) return;
      const guide = guidance(event);
      const r = readiness(event);
      const brief = [
        `ชื่องาน: ${event.title}`,
        `วันและเวลา: ${thaiDate(event.date)} · ${displayTime(event)}`,
        `สถานที่: ${event.location || 'ยังไม่ระบุ'}`,
        `เจ้าของงาน: ${event.owner || 'ยังไม่ระบุ'}`,
        `ประธาน/ผู้กล่าวเปิด: ${event.chairperson || 'ยังไม่ระบุ'}`,
        `รายละเอียด: ${event.description || 'ยังไม่มีรายละเอียด'}`,
        `ผลงานที่ต้องจัดทำ: ${outputLabels(event).join(', ') || 'ยังไม่กำหนด'}`,
        `ข้อมูลที่ยังขาด: ${r.missing.join(', ') || 'ไม่มี'}`,
        '', 'แนวทางภาพ:', ...guide.photo.map((item, index) => `${index + 1}. ${item}`),
        '', 'แนวทางคลิป:', ...guide.video.map((item, index) => `${index + 1}. ${item}`),
        '', 'แนวทางคอนเทนต์:', ...guide.content.map((item, index) => `${index + 1}. ${item}`),
        '', 'ข้อกำชับ: ห้ามสร้างหรือเปลี่ยนชื่อบุคคล ตำแหน่ง วัน เวลา ตัวเลข และข้อมูลราชการเอง ต้องใช้ข้อมูลที่ยืนยันแล้วเท่านั้น',
      ].join('\n');
      try { await navigator.clipboard.writeText(brief); toast('คัดลอกบรีฟสร้างสื่อแล้ว'); } catch { toast('เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ'); }
    });
    $('retry-line').addEventListener('click', async () => {
      const event = state.events.find((item) => item.id === state.detailId);
      if (!event) return;
      const button = $('retry-line');
      button.disabled = true;
      try {
        const result = await queueLine(event, 'แจ้งเตือนงานประชาสัมพันธ์');
        toast(result.skipped ? 'งานนี้ไม่ได้เปิดการแจ้ง LINE หรือกำลังใช้ข้อมูลในเครื่อง' : 'ส่งคิวแจ้ง LINE อีกครั้งแล้ว');
      } catch (error) {
        console.error(error);
        toast('ส่งแจ้ง LINE ไม่สำเร็จ กรุณาตรวจระบบหลังบ้าน');
      } finally { button.disabled = false; }
    });
    qsa('[data-support-tab]').forEach((button) => button.addEventListener('click', () => { state.detailTab = button.dataset.supportTab; renderDetailSupport(); }));
    $('copy-support').addEventListener('click', async () => {
      const event = state.events.find((item) => item.id === state.detailId);
      if (!event) return;
      const items = guidance(event)[state.detailTab];
      const text = `${event.title}\n${items.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
      try { await navigator.clipboard.writeText(text); toast('คัดลอกแนวทางแล้ว'); } catch { toast('เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ'); }
    });
    $('assistant-open-detail').addEventListener('click', () => { if (state.selectedEventId) openDetail(state.selectedEventId); });
    $('assistant-dismiss').addEventListener('click', () => { state.selectedEventId = null; renderAssistant(); });

    $('nav-team-work').addEventListener('click', () => openTeamWork('active'));
    $('team-work-list').addEventListener('click', (event) => {
      const item = event.target.closest('[data-team-event-id]');
      if (!item) return;
      $('team-work-dialog').close();
      openDetail(item.dataset.teamEventId);
    });
    qsa('[data-team-filter]').forEach((button) => button.addEventListener('click', () => { state.metricRange = null; state.teamFilter = button.dataset.teamFilter; renderTeamWork(); }));
    $('nav-dashboard').addEventListener('click', () => { $('nav-dashboard').classList.add('active'); $('nav-calendar').classList.remove('active'); });
    $('nav-calendar').addEventListener('click', () => { $('nav-calendar').classList.add('active'); $('nav-dashboard').classList.remove('active'); });

    qsa('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
    qsa('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  }

  function init() {
    state.events = localEvents();
    bindEvents();
    updateLiveDateTime();
    setInterval(updateLiveDateTime, 30000);
    renderAll();
    if (window.BRN_CURRENT_USER) initCloud();
    else document.addEventListener('brn-auth-ready', initCloud, { once: true });
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(console.error);
  }

  init();
})();
