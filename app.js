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
  const PR_TASKS = {
    photo: 'ถ่ายภาพนิ่ง',
    video: 'ถ่ายวิดีโอ',
    mc: 'เป็นพิธีกร',
    live: 'ถ่ายทอดสด',
    write_news: 'เขียนข่าวประชาสัมพันธ์',
    facebook: 'เผยแพร่ Facebook',
    website: 'เผยแพร่เว็บไซต์',
    poster: 'จัดทำโปสเตอร์',
    reel: 'จัดทำ Reel / คลิปสั้น',
    audio: 'บันทึกเสียงประชาสัมพันธ์',
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
    contentIdeaOffset: 0,
    mainView: location.hash === '#dashboard' ? 'dashboard' : 'calendar',
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

  function specialImageType(item = {}) {
    const hay = `${item.title || ''} ${item.type || ''} ${item.note || ''}`;
    if (/ลูกเสือ/.test(hay)) return 'scout';
    if (/ภาษาไทย/.test(hay)) return 'thai-language';
    if (/แม่/.test(hay)) return 'mother';
    if (/พ่อ|วันชาติ|ธงไทย|รัฐธรรมนูญ|จักรี|ปิยมหาราช/.test(hay)) return 'thai-flag';
    if (/สิ่งแวดล้อม|ต้นไม้|คลอง|ลอยกระทง|น้ำโลก/.test(hay)) return 'water';
    if (/เทศบาล|ท้องถิ่นไทย/.test(hay)) return 'municipality';
    if (/วิสาข|มาฆ|อาสาฬห|เข้าพรรษา|ออกพรรษา|บูชา|วันพระ/.test(hay)) return 'temple';
    return 'special';
  }

  function dayPictureAsset(kind) {
    return `assets/day-pictures/${kind}.webp`;
  }

  function dayPictureMarkup(kind, alt = '') {
    return `<img src="${dayPictureAsset(kind)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  }

  function buildDayPicture(important = [], buddhist = null) {
    const parts = [];
    if (important.length) {
      const primary = important[0];
      const kind = specialImageType(primary);
      const extra = important.length > 1 ? `<small class="day-picture-count">+${important.length - 1}</small>` : '';
      parts.push(`<div class="day-picture day-picture-important ${kind}" title="${esc(primary.title)}" aria-label="${esc(primary.title)}">${dayPictureMarkup(kind, primary.title)}${extra}</div>`);
    }
    if (buddhist) {
      parts.push(`<div class="day-picture day-picture-buddhist" title="วันพระ" aria-label="วันพระ">${dayPictureMarkup('buddhist', 'วันพระ')}</div>`);
    }
    return parts.join('');
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
      prTasks: Array.isArray(raw.prTasks) ? raw.prTasks : inferLegacyPrTasks(raw),
      prSummary: raw.prSummary || '',
      prTasksOther: raw.prTasksOther || '',
      requestSource: raw.requestSource || '',
      publicationLinks: raw.publicationLinks || '',
      notifyLine: raw.notifyLine !== false,
    };
  }
  function inferLegacyStatus(event) {
    const today = iso(new Date());
    if (event.date < today) return event.publicationLinks ? 'published' : 'waiting_publish';
    return 'waiting_info';
  }
  function inferLegacyPrTasks(event) {
    const outputs = Array.isArray(event.outputs) ? event.outputs : [];
    const tasks = [];
    if (outputs.includes('album')) tasks.push('photo');
    if (outputs.includes('video') || outputs.includes('reel')) tasks.push('video');
    if (outputs.includes('reel')) tasks.push('reel');
    if (outputs.includes('live')) tasks.push('live');
    if (outputs.includes('news')) tasks.push('write_news', 'facebook');
    if (outputs.includes('poster')) tasks.push('poster');
    return [...new Set(tasks)];
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
    return [event.title, event.description, event.prSummary, event.location, event.owner, event.contactName, ...(event.prTasks || []).map((key) => PR_TASKS[key] || key), STATUSES[event.status], CATEGORIES[event.category]].join(' ').toLowerCase();
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
  function prTaskLabels(event) {
    const labels = (event.prTasks || []).filter((key) => key !== 'other').map((key) => PR_TASKS[key] || key);
    if ((event.prTasks || []).includes('other') && event.prTasksOther) labels.push(event.prTasksOther);
    return labels;
  }
  function autoPrSummary(event) {
    const tasks = prTaskLabels(event);
    if (!tasks.length) return 'ยังไม่ได้ระบุรายละเอียดการปฏิบัติงานประชาสัมพันธ์';
    return `งานประชาสัมพันธ์ดำเนินการ ${tasks.join(' · ')} สำหรับงาน “${event.title}”`;
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
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.classList.remove('show');
      el.setAttribute('aria-hidden', 'true');
    }, duration);
  }

  function setMainView(view, options = {}) {
    const nextView = view === 'calendar' ? 'calendar' : 'dashboard';
    state.mainView = nextView;
    $('nav-dashboard')?.classList.toggle('active', nextView === 'dashboard');
    $('nav-calendar')?.classList.toggle('active', nextView === 'calendar');
    if ($('nav-dashboard')) nextView === 'dashboard' ? $('nav-dashboard').setAttribute('aria-current', 'page') : $('nav-dashboard').removeAttribute('aria-current');
    if ($('nav-calendar')) nextView === 'calendar' ? $('nav-calendar').setAttribute('aria-current', 'page') : $('nav-calendar').removeAttribute('aria-current');
    if (options.updateHash !== false) {
      const targetHash = `#${nextView}`;
      if (location.hash !== targetHash) history.pushState({ brnView: nextView }, '', targetHash);
    }
    if (options.scroll !== false) {
      const target = nextView === 'calendar' ? $('calendar') : $('dashboard');
      target?.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function renderAll() {
    renderDashboard();
    renderCalendar();
    renderImportant();
    renderMonthlyContent();
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

    const overdueEvents = sortedEvents(state.events.filter((e) => e.date < todayKey && !['published', 'completed', 'cancelled'].includes(e.status)))
      .sort((a, b) => `${b.date} ${b.startTime || b.time || '99:99'}`.localeCompare(`${a.date} ${a.startTime || a.time || '99:99'}`));
    const overdueSummary = $('focus-overdue-summary');
    if (overdueEvents.length) {
      overdueSummary.hidden = false;
      overdueSummary.innerHTML = `<div><strong>มีงานค้างหรือเลยกำหนด ${overdueEvents.length} งาน</strong><span>แยกไว้ต่างหาก เพื่อไม่ให้ปนกับงานที่กำลังจะมาถึง</span></div><button class="btn ghost" data-open-overdue type="button">ดูงานค้าง</button>`;
    } else {
      overdueSummary.hidden = true;
      overdueSummary.innerHTML = '';
    }

    const focusCandidates = sortedEvents(state.events.filter((e) => e.date >= todayKey && isActive(e))).slice(0, 3);
    $('focus-list').innerHTML = focusCandidates.length ? focusCandidates.map((event) => {
      const date = parseDate(event.date);
      const alerts = riskAlerts(event);
      const diff = daysBetween(new Date(), parseDate(event.date));
      const urgencyClass = diff === 0 ? 'is-today' : diff === 1 ? 'is-tomorrow' : '';
      return `<article class="focus-item ${urgencyClass}"><div class="focus-date"><strong>${date.getDate()}</strong><span>${SHORT_MONTHS[date.getMonth()]}</span></div><div class="focus-copy"><strong>${esc(event.title)}</strong><span>${esc(displayTime(event))} · ${esc(event.location || event.owner || 'ยังไม่ระบุสถานที่')}</span><small>${alerts.length ? `⚠ ${esc(alerts[0])}` : '✓ ข้อมูลหลักอยู่ในระดับพร้อมใช้งาน'}</small></div><div class="focus-actions">${statusPill(event)}${readinessPill(event)}<button class="btn ghost" data-focus-id="${esc(event.id)}" type="button">เปิดงาน</button></div></article>`;
    }).join('') : '<div class="empty-state">ยังไม่มีงานที่กำลังจะมาถึง เพิ่มงานใหม่เพื่อเริ่มจัดลำดับให้ทีม</div>';
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
    const showHolidays = $('show-holidays').checked;
    const showBuddhist = $('show-buddhist').checked;
    for (let i = 0; i < 42; i += 1) {
      const date = addDays(gridStart, i);
      const key = iso(date);
      const dayEvents = sortedEvents(visibleEvents.filter((event) => event.date === key));
      const important = IMPORTANT.filter((item) => item.date === key);
      const buddhist = BUDDHIST.find((item) => item.date === key);
      const visibleImportant = showHolidays ? important : [];
      const visibleBuddhist = showBuddhist ? buddhist : null;
      const chips = [];
      visibleImportant.forEach((item) => chips.push(`<button class="chip holiday" data-date-only="${key}" type="button">${esc(item.title)}</button>`));
      dayEvents.slice(0, 3).forEach((event) => chips.push(`<button class="chip ${esc(event.category)}" data-event-id="${esc(event.id)}" type="button">${esc(event.startTime || event.time || '')}${event.startTime || event.time ? ' ' : ''}${esc(event.title)}</button>`));
      const hiddenCount = Math.max(0, dayEvents.length + visibleImportant.length - 3);
      const dayClasses = ['day'];
      if (date.getMonth() !== month) dayClasses.push('outside');
      if (key === todayKey) dayClasses.push('today');
      if (key === selectedKey) dayClasses.push('selected');
      if (visibleBuddhist) dayClasses.push('has-buddhist');
      if (visibleImportant.length) dayClasses.push('has-important');
      cells.push(`<div class="${dayClasses.join(' ')}" role="gridcell" data-day="${key}">${buildDayPicture(visibleImportant, visibleBuddhist)}<span class="day-number">${date.getDate()}</span>${visibleBuddhist ? `<span class="lunar">วันพระ · ${esc(visibleBuddhist.lunar)}</span>` : ''}<div class="entries">${chips.slice(0, 3).join('')}${hiddenCount ? `<span class="more">+${hiddenCount} รายการ</span>` : ''}</div></div>`);
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

  function monthlyContentPool() {
    const year = state.cursor.getFullYear();
    const month = state.cursor.getMonth();
    const events = sortedEvents(state.events.filter((event) => {
      const date = parseDate(event.date);
      return date.getFullYear() === year && date.getMonth() === month && event.status !== 'cancelled';
    }));
    const important = IMPORTANT.filter((item) => {
      const date = parseDate(item.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    const ideas = [];
    const addIdea = (title, description, tag) => {
      if (!ideas.some((item) => item.title === title)) ideas.push({ title, description, tag });
    };

    events.slice(0, 4).forEach((event) => {
      addIdea(`ก่อนถึงงาน “${event.title}”`, 'ทำโพสต์สั้นบอกสิ่งที่ประชาชนควรรู้ โดยใช้วัน เวลา สถานที่ และรายละเอียดที่ยืนยันแล้ว', 'จากปฏิทิน');
      addIdea(`เบื้องหลัง “${event.title}”`, 'เก็บภาพหรือคลิปช่วงเตรียมงาน 3–5 ช็อต แล้วเล่าให้เห็นขั้นตอนทำงานของทีมแบบกระชับ', 'เบื้องหลัง');
      if (['published', 'completed', 'waiting_publish'].includes(event.status)) addIdea(`สรุปผล “${event.title}”`, 'สรุปสิ่งที่ดำเนินการและประโยชน์ที่เกิดขึ้น พร้อมภาพผลงานจริงและข้อมูลที่ตรวจสอบแล้ว', 'สรุปผลงาน');
    });

    important.slice(0, 3).forEach((item) => {
      addIdea(`เตรียมคอนเทนต์ “${item.title}”`, 'วางภาพหลัก ข้อความสั้น และรูปแบบโพสต์ล่วงหน้า โดยตรวจถ้อยคำและข้อมูลทางการก่อนเผยแพร่', 'วันสำคัญ');
    });

    addIdea('รู้จักบริการเทศบาลใน 1 นาที', 'เลือกหนึ่งบริการมาเล่าให้อ่านจบง่าย พร้อมขั้นตอนและช่องทางติดต่อที่ตรวจสอบแล้ว', 'บริการประชาชน');
    addIdea('เบื้องหลังคนทำงาน', 'เล่าหนึ่งวันของเจ้าหน้าที่ผ่านภาพสั้น ๆ เพื่อให้ประชาชนเห็นขั้นตอนและความตั้งใจในการทำงาน', 'เรื่องเล่าทีมงาน');
    addIdea('ถาม–ตอบเรื่องใกล้ตัว', 'หยิบคำถามที่ประชาชนถามบ่อย มาตอบสั้น ชัด และใส่ช่องทางสอบถามเพิ่มเติม', 'ความรู้ใกล้ตัว');
    addIdea('ก่อน–หลังการพัฒนาพื้นที่', 'ใช้ภาพมุมเดียวกันเปรียบเทียบก่อนและหลัง พร้อมอธิบายผลลัพธ์ตามข้อมูลจริง', 'ภาพเล่าเรื่อง');
    addIdea('สรุปงานเด่นประจำสัปดาห์', 'รวม 3–5 เรื่องสำคัญเป็นโพสต์เดียว เพื่อให้ติดตามงานเทศบาลได้ง่ายขึ้น', 'สรุปรายสัปดาห์');
    addIdea('เรื่องที่ประชาชนควรรู้เดือนนี้', 'รวบรวมกำหนดการ การแจ้งเตือน หรือบริการที่ควรรู้ โดยใช้เฉพาะข้อมูลที่หน่วยงานยืนยันแล้ว', 'ข้อมูลประชาชน');
    return ideas;
  }

  function renderMonthlyContent() {
    const ideas = monthlyContentPool();
    const offset = ideas.length ? state.contentIdeaOffset % ideas.length : 0;
    const rotated = ideas.length ? [...ideas.slice(offset), ...ideas.slice(0, offset)] : [];
    const visible = rotated.slice(0, 3);
    $('content-month-label').textContent = monthTitle(state.cursor);
    $('monthly-content-ideas').innerHTML = visible.length ? visible.map((idea, index) => `<article class="content-idea-card"><span>${esc(idea.tag)}</span><strong>${esc(idea.title)}</strong><p>${esc(idea.description)}</p><small>${String(index + 1).padStart(2, '0')}</small></article>`).join('') : '<div class="empty-state">ยังไม่มีไอเดียสำหรับเดือนนี้</div>';
    $('content-dialog-month').textContent = monthTitle(state.cursor);
    $('content-ideas-all').innerHTML = rotated.slice(0, 12).map((idea, index) => `<article class="content-idea-row"><b>${String(index + 1).padStart(2, '0')}</b><div><span>${esc(idea.tag)}</span><strong>${esc(idea.title)}</strong><p>${esc(idea.description)}</p></div></article>`).join('');
  }

  function renderImportant() {
    const today = iso(new Date());
    const upcoming = IMPORTANT.filter((item) => item.date >= today).slice(0, 6);
    $('important-days').innerHTML = upcoming.length ? upcoming.map((item) => {
      const diff = daysBetween(new Date(), parseDate(item.date));
      const when = diff === 0 ? 'วันนี้' : diff === 1 ? 'พรุ่งนี้' : `อีก ${diff} วัน`;
      const kind = specialImageType(item);
      return `<article class="important-day has-picture"><div class="important-day-image ${kind}" aria-hidden="true">${dayPictureMarkup(kind, item.title)}</div><div class="important-day-copy"><strong>${esc(when)}</strong><span>${esc(item.title)}</span><small>${esc(thaiDate(item.date, false))}</small></div></article>`;
    }).join('') : '<div class="empty-state">ยังไม่มีข้อมูลวันสำคัญถัดไปในชุดข้อมูลปีนี้</div>';
  }

  function openDay(dateKey) {
    state.selectedDate = parseDate(dateKey);
    state.selectedEventId = null;
    renderCalendar();
    renderMonthlyContent();
    const events = sortedEvents(state.events.filter((event) => event.date === dateKey));
    const special = IMPORTANT.filter((item) => item.date === dateKey);
    const buddhist = BUDDHIST.find((item) => item.date === dateKey);
    $('day-title').textContent = thaiDate(dateKey);
    const specialHtml = [
      ...special.map((item) => {
        const kind = specialImageType(item);
        return `<div class="day-item special-item"><div class="item-image ${kind}" aria-hidden="true">${dayPictureMarkup(kind, item.title)}</div><div class="item-copy"><strong>${esc(item.title)}</strong><span>${esc(item.note || item.type)}</span></div></div>`;
      }),
      ...(buddhist ? [`<div class="day-item special-item"><div class="item-image buddhist" aria-hidden="true">${dayPictureMarkup('buddhist', 'วันพระ')}</div><div class="item-copy"><strong>วันพระ</strong><span>${esc(buddhist.lunar)}</span></div></div>`] : []),
    ];
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
    $('event-pr-summary').value = event?.prSummary || '';
    $('event-publication-links').value = event?.publicationLinks || '';
    $('event-notify').checked = event?.notifyLine !== false;
    qsa('input[name="outputs"]', $('event-form')).forEach((input) => { input.checked = Boolean(event?.outputs?.includes(input.value)); });
    qsa('input[name="prTasks"]', $('event-form')).forEach((input) => { input.checked = Boolean(event?.prTasks?.includes(input.value)); });
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
      prTasks: qsa('input[name="prTasks"]:checked', $('event-form')).map((input) => input.value),
      prSummary: $('event-pr-summary').value.trim(),
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
    renderMonthlyContent();
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
    const taskLabels = prTaskLabels(event);
    $('detail-pr-tasks').innerHTML = taskLabels.length ? taskLabels.map((label) => `<span class="output-tag pr-task-tag">${esc(label)}</span>`).join('') : '<span class="empty-state" style="width:100%">ยังไม่ได้ระบุลักษณะงานประชาสัมพันธ์</span>';
    $('detail-pr-summary').textContent = event.prSummary || autoPrSummary(event);
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
    else if (state.teamFilter === 'overdue') rows = rows.filter((event) => event.date < today && !['published', 'completed', 'cancelled'].includes(event.status))
      .sort((a, b) => `${b.date} ${b.startTime || b.time || '99:99'}`.localeCompare(`${a.date} ${a.startTime || a.time || '99:99'}`));
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

  function printPrSummary(event) {
    const popup = window.open('', '_blank', 'width=980,height=900');
    if (!popup) {
      toast('เบราว์เซอร์บล็อกหน้าพิมพ์ กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
      return;
    }
    const logoUrl = new URL('./assets/logo.png', window.location.href).href;
    const tasks = prTaskLabels(event);
    const outputs = outputLabels(event);
    const links = String(event.publicationLinks || '').split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const summary = event.prSummary || autoPrSummary(event);
    const taskHtml = (tasks.length ? tasks : ['ยังไม่ได้ระบุ']).map((label) => `<span class="task"><b>✓</b>${esc(label)}</span>`).join('');
    const outputHtml = (outputs.length ? outputs : ['ยังไม่ได้ระบุ']).map((label) => `<span class="output">${esc(label)}</span>`).join('');
    const linksHtml = links.length ? links.map((link) => `<div class="link">${esc(link)}</div>`).join('') : '<span class="muted">ยังไม่มีลิงก์ผลงาน</span>';
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ใบสรุปการปฏิบัติงานประชาสัมพันธ์ - ${esc(event.title)}</title><style>
      @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{margin:0;background:#eef0f3;color:#1f1724;font-family:"Noto Sans Thai",Tahoma,sans-serif;font-size:12.4px;line-height:1.42}.sheet{width:190mm;margin:12px auto;background:#fff;padding:7mm 9mm 5mm;box-shadow:0 8px 35px rgba(0,0,0,.16)}.top{display:grid;grid-template-columns:22mm 1fr 25mm;align-items:center;gap:4mm;padding-bottom:3mm;border-bottom:2px solid #6a268e}.logo{width:20mm;height:20mm;object-fit:contain}.heading{text-align:center}.heading h1{font-size:20px;line-height:1.2;margin:0;color:#4b176f}.heading h2{font-size:14.5px;margin:2px 0 0}.doc-date{text-align:right;align-self:start;font-size:10px;color:#655b69}.gold-line{height:2px;background:#d7a22a;margin-top:1px}.event-title{margin:4mm 0 3mm;padding:3mm 4mm;background:#f6f0fa;border-left:4px solid #6a268e;border-radius:2.5mm}.event-title small{display:block;color:#6a268e;font-weight:700}.event-title strong{font-size:17px;line-height:1.28}.meta{width:100%;border-collapse:separate;border-spacing:0;border:1px solid #ded7e2;border-radius:2.5mm;overflow:hidden}.meta td{width:50%;padding:2.2mm 3mm;vertical-align:top;border-right:1px solid #e7e1e9;border-bottom:1px solid #e7e1e9}.meta td:last-child{border-right:0}.meta tr:last-child td{border-bottom:0}.meta small{display:block;color:#756a79;margin-bottom:1px}.meta strong{font-size:12.8px}.section{margin-top:3.2mm;break-inside:avoid}.section h3{font-size:13.5px;color:#4b176f;margin:0 0 1.7mm;padding-bottom:1mm;border-bottom:1px solid #d9cbe1}.description,.summary{border:1px solid #e2dce5;border-radius:2.5mm;padding:2.5mm 3mm;min-height:10mm;white-space:pre-wrap}.summary{min-height:13mm;background:#fcfafc}.tasks{display:grid;grid-template-columns:1fr 1fr;gap:1.4mm}.task{display:flex;align-items:center;gap:1.7mm;padding:1.7mm 2.5mm;background:#f7f2fa;border-radius:2mm}.task b{display:inline-grid;place-items:center;width:4.4mm;height:4.4mm;border-radius:50%;background:#6a268e;color:#fff;font-size:9px}.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.result-box{min-width:0}.outputs{display:flex;flex-wrap:wrap;gap:1.2mm}.output{padding:1mm 2.3mm;border:1px solid #cdb8d8;border-radius:999px;color:#4b176f;font-weight:700;font-size:11px}.link{font-size:10px;word-break:break-all;padding:1mm 0;border-bottom:1px dashed #ddd}.muted{color:#877d8a}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:13mm;margin-top:5mm;break-inside:avoid}.sign{text-align:center;padding-top:6mm;border-top:1px dotted #777}.sign small{display:block;color:#6e6571}.footer-note{text-align:center;color:#8a818d;font-size:9px;margin-top:4mm;padding-top:2mm;border-top:1px solid #eee}.no-print{position:fixed;right:20px;bottom:20px;border:0;border-radius:999px;background:#5c207f;color:#fff;padding:12px 18px;font-family:inherit;font-size:14px;font-weight:700;box-shadow:0 8px 25px rgba(75,23,111,.3)}
      @media print{body{background:#fff}.sheet{width:auto;margin:0;padding:0;box-shadow:none}.no-print{display:none}}
    </style></head><body><main class="sheet"><header class="top"><img class="logo" src="${logoUrl}" alt="โลโก้งานประชาสัมพันธ์"><div class="heading"><h1>ใบสรุปการปฏิบัติงานประชาสัมพันธ์</h1><h2>เทศบาลเมืองบางรักน้อย</h2></div><div class="doc-date">วันที่จัดทำ<br><strong>${esc(thaiDate(new Date(), false))}</strong></div></header><div class="gold-line"></div>
      <section class="event-title"><small>ชื่องาน / กิจกรรม</small><strong>${esc(event.title)}</strong></section>
      <table class="meta"><tr><td><small>วันที่</small><strong>${esc(thaiDate(event.date))}</strong></td><td><small>เวลา</small><strong>${esc(displayTime(event))}</strong></td></tr><tr><td colspan="2"><small>สถานที่</small><strong>${esc(event.location || 'ยังไม่ระบุ')}</strong></td></tr><tr><td><small>กอง / สำนักเจ้าของงาน</small><strong>${esc(event.owner || 'ยังไม่ระบุ')}</strong></td><td><small>สถานะงาน</small><strong>${esc(STATUSES[event.status] || 'รอข้อมูล')}</strong></td></tr><tr><td><small>ผู้ประสานงาน</small><strong>${esc(event.contactName || 'ยังไม่ระบุ')}</strong></td><td><small>เบอร์ติดต่อ</small><strong>${esc(event.contactPhone || 'ยังไม่ระบุ')}</strong></td></tr></table>
      <section class="section"><h3>รายละเอียดงาน / กิจกรรม</h3><div class="description">${esc(event.description || 'ยังไม่มีรายละเอียด')}</div></section>
      <section class="section"><h3>งานประชาสัมพันธ์ที่ดำเนินการ</h3><div class="tasks">${taskHtml}</div></section>
      <section class="section"><h3>สรุปการปฏิบัติงาน</h3><div class="summary">${esc(summary)}</div></section>
      <section class="section result-grid"><div class="result-box"><h3>ผลงานที่จัดทำ</h3><div class="outputs">${outputHtml}</div></div><div class="result-box"><h3>ช่องทางเผยแพร่ / ลิงก์ผลงาน</h3>${linksHtml}</div></section>
      <section class="signatures"><div class="sign"><strong>&nbsp;</strong><small>ผู้บันทึก / ผู้ปฏิบัติงานประชาสัมพันธ์</small></div><div class="sign"><strong>${esc(thaiDate(new Date(), false))}</strong><small>วันที่บันทึก</small></div></section>
      <div class="footer-note">จัดทำจาก BRN PR Board · งานประชาสัมพันธ์ เทศบาลเมืองบางรักน้อย</div></main><button class="no-print" onclick="window.print()">พิมพ์ / บันทึก PDF</button></body></html>`);
    const launchPrint = () => {
      if (popup.__brnPrintStarted) return;
      popup.__brnPrintStarted = true;
      setTimeout(() => { if (!popup.closed) { popup.focus(); popup.print(); } }, 450);
    };
    popup.addEventListener('load', launchPrint, { once: true });
    popup.document.close();
    setTimeout(launchPrint, 1000);
  }


  function printBlankRequestForm() {
    const popup = window.open('', '_blank', 'width=980,height=900');
    if (!popup) {
      toast('เบราว์เซอร์บล็อกหน้าพิมพ์ กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้');
      return;
    }
    const logoUrl = new URL('./assets/logo.png', window.location.href).href;
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>แบบแจ้งงานประชาสัมพันธ์</title><style>
      @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{margin:0;background:#eef0f3;color:#211725;font-family:"Noto Sans Thai",Tahoma,sans-serif;font-size:13px;line-height:1.5}.sheet{width:190mm;min-height:277mm;margin:12px auto;background:#fff;padding:8mm 10mm 7mm;box-shadow:0 8px 35px rgba(0,0,0,.16)}.top{display:grid;grid-template-columns:22mm 1fr 28mm;align-items:center;gap:4mm;padding-bottom:3mm;border-bottom:2px solid #5b207d}.logo{width:20mm;height:20mm;object-fit:contain}.heading{text-align:center}.heading h1{font-size:21px;line-height:1.2;margin:0;color:#4b176f}.heading h2{font-size:15px;margin:2px 0 0}.doc-no{text-align:right;align-self:start;font-size:10px;color:#6f6573}.gold-line{height:2px;background:#d5a53b;margin-top:1px}.note{margin:4mm 0 3mm;padding:2.7mm 3.5mm;border-radius:2.5mm;background:#f7f1fa;color:#5d4d64}.row{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.field{margin-top:3.2mm}.field label{display:block;color:#4b176f;font-weight:700;margin-bottom:1mm}.line{height:11mm;border:1px solid #d9d1dd;border-radius:2.5mm}.line.tall{height:30mm}.write-line{height:8mm;border-bottom:1px dotted #777}.checks{display:grid;grid-template-columns:1fr 1fr;gap:2mm 5mm;padding:3mm;border:1px solid #ddd4e2;border-radius:2.5mm}.check{display:flex;align-items:center;gap:2mm;min-height:8mm}.box{width:4.5mm;height:4.5mm;border:1.4px solid #5b207d;border-radius:1mm;flex:0 0 auto}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:15mm;margin-top:10mm}.sign{text-align:center;padding-top:8mm;border-top:1px dotted #777}.sign small{display:block;color:#6f6573}.footer{text-align:center;color:#8d8391;font-size:9.5px;margin-top:8mm;padding-top:2mm;border-top:1px solid #eee}.no-print{position:fixed;right:20px;bottom:20px;border:0;border-radius:999px;background:#5b207d;color:#fff;padding:12px 18px;font-family:inherit;font-size:14px;font-weight:700;box-shadow:0 8px 25px rgba(75,23,111,.3)}@media print{body{background:#fff}.sheet{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none}.no-print{display:none}}
    </style></head><body><main class="sheet"><header class="top"><img class="logo" src="${logoUrl}" alt="โลโก้งานประชาสัมพันธ์"><div class="heading"><h1>แบบแจ้งงานประชาสัมพันธ์</h1><h2>เทศบาลเมืองบางรักน้อย</h2></div><div class="doc-no">วันที่รับเรื่อง<br>____ / ____ / ______</div></header><div class="gold-line"></div>
      <div class="note">สำหรับกอง / สำนัก หรือผู้เกี่ยวข้องใช้แจ้งรายละเอียดงานให้ทีมประชาสัมพันธ์</div>
      <div class="field"><label>ชื่องาน / กิจกรรม</label><div class="line"></div></div>
      <div class="row"><div class="field"><label>วันที่จัดงาน</label><div class="line"></div></div><div class="field"><label>เวลา</label><div class="line"></div></div></div>
      <div class="field"><label>สถานที่</label><div class="line"></div></div>
      <div class="row"><div class="field"><label>กอง / สำนักผู้แจ้ง</label><div class="line"></div></div><div class="field"><label>ผู้ประสานงาน</label><div class="line"></div></div></div>
      <div class="field"><label>เบอร์ติดต่อ</label><div class="line"></div></div>
      <div class="field"><label>รายละเอียดงาน / ข้อมูลที่ควรทราบ</label><div class="line tall"></div></div>
      <div class="field"><label>ต้องการให้ประชาสัมพันธ์ดำเนินการ</label><div class="checks"><div class="check"><span class="box"></span>ถ่ายภาพนิ่ง</div><div class="check"><span class="box"></span>ถ่ายวิดีโอ</div><div class="check"><span class="box"></span>เป็นพิธีกร</div><div class="check"><span class="box"></span>ถ่ายทอดสด</div><div class="check"><span class="box"></span>เขียนข่าวประชาสัมพันธ์</div><div class="check"><span class="box"></span>เผยแพร่ Facebook</div><div class="check"><span class="box"></span>จัดทำโปสเตอร์</div><div class="check"><span class="box"></span>อื่น ๆ __________________________</div></div></div>
      <section class="signatures"><div class="sign"><strong>&nbsp;</strong><small>ผู้แจ้งงาน</small></div><div class="sign"><strong>&nbsp;</strong><small>วันที่แจ้ง</small></div></section>
      <div class="footer">งานประชาสัมพันธ์ เทศบาลเมืองบางรักน้อย</div></main><button class="no-print" onclick="window.print()">พิมพ์ / บันทึก PDF</button></body></html>`);
    const launchPrint = () => {
      if (popup.__brnPrintStarted) return;
      popup.__brnPrintStarted = true;
      setTimeout(() => { if (!popup.closed) { popup.focus(); popup.print(); } }, 450);
    };
    popup.addEventListener('load', launchPrint, { once: true });
    popup.document.close();
    setTimeout(launchPrint, 1000);
  }

  function bindEvents() {
    $('prev-month').addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() - 1, 1); state.contentIdeaOffset = 0; renderCalendar(); renderMonthlyContent(); });
    $('next-month').addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + 1, 1); state.contentIdeaOffset = 0; renderCalendar(); renderMonthlyContent(); });
    $('today-button').addEventListener('click', () => { state.cursor = startOfMonth(new Date()); state.selectedDate = new Date(); state.contentIdeaOffset = 0; renderCalendar(); renderMonthlyContent(); $('calendar').scrollIntoView({ behavior: 'smooth' }); });
    ['add-event-button', 'add-event-top'].forEach((id) => $(id).addEventListener('click', () => openEvent(iso(state.selectedDate))));
    $('print-request-form-button')?.addEventListener('click', () => {
      if ($('account-menu')) $('account-menu').hidden = true;
      $('account-button')?.setAttribute('aria-expanded', 'false');
      printBlankRequestForm();
    });
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
    $('focus-all-button').addEventListener('click', () => openTeamWork('active'));
    $('focus-overdue-summary').addEventListener('click', (event) => {
      if (event.target.closest('[data-open-overdue]')) openTeamWork('overdue');
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
    $('print-work-order').addEventListener('click', () => {
      const event = state.events.find((item) => item.id === state.detailId);
      if (event) printPrSummary(event);
    });
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
    const refreshContentIdeas = () => {
      const ideas = monthlyContentPool();
      state.contentIdeaOffset = ideas.length ? (state.contentIdeaOffset + 3) % ideas.length : 0;
      renderMonthlyContent();
      toast('จัดไอเดียชุดใหม่ให้แล้ว');
    };
    $('content-refresh').addEventListener('click', refreshContentIdeas);
    $('content-dialog-refresh').addEventListener('click', refreshContentIdeas);
    $('content-view-all').addEventListener('click', () => { renderMonthlyContent(); $('content-ideas-dialog').showModal(); });

    $('nav-team-work').addEventListener('click', () => openTeamWork('active'));
    $('team-work-list').addEventListener('click', (event) => {
      const item = event.target.closest('[data-team-event-id]');
      if (!item) return;
      $('team-work-dialog').close();
      openDetail(item.dataset.teamEventId);
    });
    qsa('[data-team-filter]').forEach((button) => button.addEventListener('click', () => { state.metricRange = null; state.teamFilter = button.dataset.teamFilter; renderTeamWork(); }));
    $('nav-dashboard').addEventListener('click', (event) => { event.preventDefault(); setMainView('dashboard'); });
    $('nav-calendar').addEventListener('click', (event) => { event.preventDefault(); setMainView('calendar'); });
    $('brand-home')?.addEventListener('click', (event) => { event.preventDefault(); setMainView('calendar'); });
    window.addEventListener('popstate', () => setMainView(location.hash === '#dashboard' ? 'dashboard' : 'calendar', { updateHash: false }));

    qsa('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
    qsa('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  }

  function init() {
    state.events = localEvents();
    bindEvents();
    updateLiveDateTime();
    setInterval(updateLiveDateTime, 30000);
    renderAll();
    setMainView(state.mainView, { updateHash: false, scroll: false, instant: true });
    if (window.BRN_CURRENT_USER) initCloud();
    else document.addEventListener('brn-auth-ready', initCloud, { once: true });
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(console.error);
  }

  init();
})();
