(() => {
  'use strict';

  const config = window.BRN_AUTH_CONFIG?.firebaseConfig;
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
    meeting: 'ประชุม / อบรม',
    activity: 'กิจกรรม',
    important: 'วันสำคัญ',
    media: 'ถ่ายทำ / สื่อ',
    other: 'อื่น ๆ',
  };

  const importantDaysByMonth = {
    0: [{ day: 1, title: 'วันขึ้นปีใหม่', note: 'ข้อความอวยพรและสรุปภารกิจปีใหม่' }, { day: 11, title: 'วันเด็กแห่งชาติ', note: 'เตรียมภาพกิจกรรมเด็กและครอบครัว' }],
    1: [{ day: 14, title: 'วันวาเลนไทน์', note: 'คอนเทนต์ความรักต่อชุมชน' }, { day: 24, title: 'วันศิลปินแห่งชาติ', note: 'สื่อวัฒนธรรมและภูมิปัญญา' }],
    2: [{ day: 8, title: 'วันสตรีสากล', note: 'นำเสนอพลังสตรีในชุมชน' }, { day: 13, title: 'วันช้างไทย', note: 'คอนเทนต์อนุรักษ์ธรรมชาติ' }],
    3: [{ day: 6, title: 'วันจักรี', note: 'จัดเตรียมข้อความและภาพพิธีการ' }, { day: 13, title: 'วันสงกรานต์', note: 'วางแผนภาพบรรยากาศและความปลอดภัย' }, { day: 24, title: 'วันเทศบาล', note: 'สรุปผลงานและคนทำงานเบื้องหลัง' }],
    4: [{ day: 1, title: 'วันแรงงาน', note: 'สื่อสารคุณค่าของผู้ปฏิบัติงาน' }, { day: 31, title: 'วันงดสูบบุหรี่โลก', note: 'คอนเทนต์สุขภาพและการป้องกัน' }],
    5: [{ day: 5, title: 'วันสิ่งแวดล้อมโลก', note: 'กิจกรรมคลองสวย น้ำใส และคัดแยกขยะ' }, { day: 26, title: 'วันต่อต้านยาเสพติด', note: 'สื่อรณรงค์สำหรับเด็กและเยาวชน' }],
    6: [{ day: 28, title: 'วันเฉลิมพระชนมพรรษา', note: 'เตรียมสื่อเทิดพระเกียรติอย่างเหมาะสม' }, { day: 29, title: 'วันภาษาไทยแห่งชาติ', note: 'คอนเทนต์ภาษาและภูมิปัญญาท้องถิ่น' }],
    7: [{ day: 12, title: 'วันแม่แห่งชาติ', note: 'ภาพแม่ ลูก และครอบครัวในชุมชน' }, { day: 18, title: 'วันวิทยาศาสตร์', note: 'นำเสนอการเรียนรู้ของเด็กและเยาวชน' }],
    8: [{ day: 20, title: 'วันเยาวชนแห่งชาติ', note: 'กิจกรรมและเสียงของเยาวชนในพื้นที่' }, { day: 28, title: 'วันพระราชทานธงชาติไทย', note: 'เตรียมภาพธงชาติและกิจกรรมเคารพธงชาติ' }],
    9: [{ day: 13, title: 'วันนวมินทรมหาราช', note: 'สื่อพิธีการและกิจกรรมจิตอาสา' }, { day: 23, title: 'วันปิยมหาราช', note: 'เตรียมภาพพิธีวางพวงมาลา' }],
    10: [{ day: 14, title: 'วันพระบิดาแห่งฝนหลวง', note: 'คอนเทนต์น้ำ สิ่งแวดล้อม และเกษตร' }, { day: 25, title: 'วันยุติความรุนแรงต่อสตรี', note: 'ข้อมูลช่วยเหลือและการรณรงค์' }],
    11: [{ day: 5, title: 'วันพ่อแห่งชาติ', note: 'ภาพครอบครัวและกิจกรรมจิตอาสา' }, { day: 10, title: 'วันรัฐธรรมนูญ', note: 'ข้อมูลความรู้แบบเข้าใจง่าย' }, { day: 31, title: 'วันสิ้นปี', note: 'สรุปผลงานเด่นประจำปี' }],
  };

  const els = {
    title: $('month-title'), grid: $('calendar-grid'), prev: $('prev-month'), next: $('next-month'), today: $('today-button'), add: $('add-event-button'),
    eventDialog: $('event-dialog'), eventForm: $('event-form'), eventDialogTitle: $('event-dialog-title'), eventDialogKicker: $('event-dialog-kicker'), eventId: $('event-id'),
    eventTitle: $('event-title'), eventDescription: $('event-description'), eventDate: $('event-date'), eventTime: $('event-time'), eventLocation: $('event-location'), eventOwner: $('event-owner'), eventCategory: $('event-category'), eventReminder: $('event-reminder'), deleteEvent: $('delete-event'),
    detailDialog: $('detail-dialog'), detailTitle: $('detail-title'), detailCategory: $('detail-category'), detailDate: $('detail-date'), detailTime: $('detail-time'), detailLocation: $('detail-location'), detailOwner: $('detail-owner'), detailDescription: $('detail-description'), editEvent: $('edit-event'),
    guideTitle: $('guide-title'), photoGuide: $('photo-guide'), videoGuide: $('video-guide'), prepGuide: $('prep-guide'), contentGuide: $('content-guide'), importantDays: $('important-days'), syncStatus: $('sync-status'),
    ideasDialog: $('ideas-dialog'), ideasList: $('ideas-list'), toast: $('toast'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function parseDate(value) { const [y, m, d] = String(value).split('-').map(Number); return new Date(y, m - 1, d); }
  function thaiMonthYear(date) { return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { month: 'long', year: 'numeric' }).format(date); }
  function thaiFullDate(value) { return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(value)); }
  function monthKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`; }
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
  function saveLocalEvents() { localStorage.setItem('brn-pr-board-events', JSON.stringify(state.events)); }

  function guidanceFor(events) {
    const text = events.map(e => `${e.title} ${e.description || ''}`).join(' ').toLowerCase();
    let photo = ['ภาพเปิดที่เห็นสถานที่และผู้เข้าร่วม', 'ภาพกิจกรรมระยะกลางที่เห็นการมีส่วนร่วม', 'ภาพสีหน้าและรายละเอียดเล็ก ๆ', 'ภาพหมู่หรือภาพสรุปช่วงท้าย'];
    let video = ['คลิปเปิดบรรยากาศ 5–8 วินาที', 'B-roll การทำกิจกรรมหลายมุม', 'คำพูดสั้นจากผู้เกี่ยวข้อง', 'ช็อตปิดที่สรุปผลของงาน'];
    let prep = ['เช็กแบตเตอรี่และเมมโมรีการ์ด', 'เตรียมไมค์หรืออุปกรณ์เสียง', 'ตรวจเวลาและสถานที่ก่อนออกงาน', 'ดูรายชื่อบุคคลสำคัญที่ต้องเก็บภาพ'];
    let content = ['โพสต์ภาพเด่นพร้อมข้อมูลสั้นชัดเจน', 'คลิปแนวตั้งสรุปบรรยากาศ', 'ภาพ Before / During / After', 'ประโยคสั้นที่สะท้อนประโยชน์ต่อประชาชน'];

    if (/ประชุม|ประชาคม|อบรม|สัมมนา/.test(text)) {
      photo = ['ป้ายงานและโต๊ะลงทะเบียน', 'ประธานกล่าวเปิดและวิทยากร', 'ผู้เข้าร่วมกำลังฟังหรือแสดงความคิดเห็น', 'ภาพหมู่และเอกสารสรุปประเด็น'];
      video = ['Wide shot ให้เห็นภาพรวมของห้อง', 'ช็อตผู้พูดสลับกับผู้ฟัง', 'เสียงสัมภาษณ์สั้น 1 ประเด็น', 'คลิปสรุปผลหรือข้อเสนอสำคัญ'];
    } else if (/ทำความสะอาด|คลอง|ขยะ|สิ่งแวดล้อม|ปลูกต้นไม้/.test(text)) {
      photo = ['สภาพพื้นที่ก่อนเริ่มงาน', 'ทีมงานและประชาชนลงมือทำ', 'รายละเอียดอุปกรณ์หรือสิ่งที่เก็บได้', 'ภาพเปรียบเทียบก่อนและหลัง'];
      video = ['เปิดด้วย Before แล้วตัดไปช่วงลงมือ', 'Time-lapse หรือช็อตการทำงานต่อเนื่อง', 'ภาพใกล้การเก็บขยะหรือปรับภูมิทัศน์', 'ปิดด้วย After และภาพทีมงาน'];
      content = ['Reels แบบ Before–After', 'ตัวเลขปริมาณขยะหรือพื้นที่ที่ดำเนินการ', 'ขอบคุณประชาชนและหน่วยงานร่วม', 'เกร็ดคัดแยกขยะที่ทำได้ที่บ้าน'];
    } else if (/ผู้สูงอายุ|เด็ก|เยาวชน|กีฬา|ออกกำลังกาย/.test(text)) {
      photo = ['รอยยิ้มและการมีส่วนร่วม', 'กิจกรรมระหว่างบุคคลหลายช่วงวัย', 'ภาพเคลื่อนไหวที่มีพลัง', 'ภาพหมู่ที่เป็นธรรมชาติ'];
      video = ['ช็อตเคลื่อนไหวแบบสั้น กระชับ', 'Close-up สีหน้าและมือขณะทำกิจกรรม', 'คำพูดสั้นจากผู้ร่วมกิจกรรม', 'Highlight 20–30 วินาที'];
    } else if (/ลงพื้นที่|ช่วยเหลือ|มอบ|เยี่ยม|ตรวจ/.test(text)) {
      photo = ['ภาพพื้นที่และสภาพปัญหา', 'ช่วงพูดคุยรับฟังประชาชน', 'ขั้นตอนการช่วยเหลือหรือส่งมอบ', 'ภาพผลลัพธ์และการติดตามงาน'];
      video = ['เปิดด้วยบริบทของพื้นที่', 'เก็บเสียงประชาชนแบบสั้นและสุภาพ', 'ภาพการดำเนินการจริง', 'ปิดด้วยข้อมูลช่องทางติดต่อ'];
    }
    return { photo, video, prep, content };
  }

  function renderGuides() {
    const selectedIso = isoDate(state.selectedDate);
    const events = state.events.filter(e => e.date === selectedIso);
    const guide = guidanceFor(events);
    els.guideTitle.textContent = events.length ? `${thaiFullDate(selectedIso)} · ${events[0].title}` : thaiFullDate(selectedIso);
    const fill = (el, items) => { el.innerHTML = items.slice(0, 4).map(i => `<li>${escapeHtml(i)}</li>`).join(''); };
    fill(els.photoGuide, guide.photo); fill(els.videoGuide, guide.video); fill(els.prepGuide, guide.prep); fill(els.contentGuide, guide.content);
  }

  function renderImportantDays() {
    const days = importantDaysByMonth[state.cursor.getMonth()] || [];
    els.importantDays.innerHTML = days.map(d => `<article class="important-day"><strong>${d.day} ${new Intl.DateTimeFormat('th-TH',{month:'short'}).format(state.cursor)}</strong><span>${escapeHtml(d.title)}</span><small>${escapeHtml(d.note)}</small></article>`).join('');
  }

  function renderIdeas() {
    const days = importantDaysByMonth[state.cursor.getMonth()] || [];
    const monthName = new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(state.cursor);
    els.ideasList.innerHTML = (days.length ? days : [{day:'—',title:`เดือน${monthName}`,note:'เลือกประเด็นจากงานในปฏิทิน แล้วเล่าให้เห็นประโยชน์ต่อประชาชน'}]).map(d => `<div class="idea-row"><strong>${d.day} ${monthName}</strong><div><b>${escapeHtml(d.title)}</b><p>${escapeHtml(d.note)}</p></div></div>`).join('');
  }

  function renderCalendar() {
    const year = state.cursor.getFullYear();
    const month = state.cursor.getMonth();
    els.title.textContent = thaiMonthYear(state.cursor);
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const todayIso = isoDate(new Date());
    const selectedIso = isoDate(state.selectedDate);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 42; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i);
      const dateIso = isoDate(date);
      const cell = document.createElement('button');
      cell.type = 'button'; cell.className = 'day-cell'; cell.dataset.date = dateIso; cell.setAttribute('role','gridcell');
      if (date.getMonth() !== month) cell.classList.add('outside');
      if (dateIso === todayIso) cell.classList.add('today');
      if (dateIso === selectedIso) cell.classList.add('selected');
      const dayEvents = state.events.filter(e => e.date === dateIso).sort((a,b) => (a.time||'99:99').localeCompare(b.time||'99:99'));
      const chips = dayEvents.slice(0, 3).map(e => `<button type="button" class="event-chip ${e.category || 'other'}" data-event-id="${escapeHtml(e.id)}" title="${escapeHtml(e.title)}">${e.time ? `<b>${escapeHtml(e.time)}</b> ` : ''}${escapeHtml(e.title)}</button>`).join('');
      cell.innerHTML = `<span class="day-number">${date.getDate()}</span><div class="day-events">${chips}${dayEvents.length > 3 ? `<span class="more-events">+${dayEvents.length - 3} งาน</span>` : ''}</div>`;
      cell.addEventListener('click', (ev) => {
        const eventButton = ev.target.closest('[data-event-id]');
        if (eventButton) { ev.stopPropagation(); openDetail(eventButton.dataset.eventId); return; }
        state.selectedDate = date; renderCalendar(); renderGuides(); openEventDialog(dateIso);
      });
      fragment.appendChild(cell);
    }
    els.grid.replaceChildren(fragment);
    renderImportantDays();
  }

  function openEventDialog(dateIso, event = null) {
    state.editingId = event?.id || null;
    els.eventDialogTitle.textContent = event ? 'แก้ไขงาน' : 'เพิ่มงานใหม่';
    els.eventDialogKicker.textContent = event ? 'รายละเอียดงานในปฏิทิน' : 'จัดงานในปฏิทิน';
    els.eventId.value = event?.id || '';
    els.eventTitle.value = event?.title || '';
    els.eventDescription.value = event?.description || '';
    els.eventDate.value = event?.date || dateIso || isoDate(state.selectedDate);
    els.eventTime.value = event?.time || '';
    els.eventLocation.value = event?.location || '';
    els.eventOwner.value = event?.owner || '';
    els.eventCategory.value = event?.category || 'meeting';
    els.eventReminder.value = String(event?.reminder ?? 60);
    els.deleteEvent.hidden = !event;
    els.eventDialog.showModal();
    setTimeout(() => els.eventTitle.focus(), 100);
  }

  function openDetail(id) {
    const event = state.events.find(e => e.id === id); if (!event) return;
    state.detailId = id;
    els.detailTitle.textContent = event.title;
    els.detailCategory.textContent = categoryNames[event.category] || categoryNames.other;
    els.detailDate.textContent = thaiFullDate(event.date);
    els.detailTime.textContent = event.time || 'ไม่ระบุเวลา';
    els.detailLocation.textContent = event.location || 'ไม่ระบุสถานที่';
    els.detailOwner.textContent = event.owner || 'ทีม PR';
    els.detailDescription.textContent = event.description || 'ไม่มีรายละเอียดเพิ่มเติม';
    els.detailDialog.showModal();
  }

  function eventPayload() {
    return {
      title: els.eventTitle.value.trim(), description: els.eventDescription.value.trim(), date: els.eventDate.value,
      time: els.eventTime.value, location: els.eventLocation.value.trim(), owner: els.eventOwner.value.trim(),
      category: els.eventCategory.value, reminder: Number(els.eventReminder.value || 0),
      updatedAtLocal: new Date().toISOString(), updatedBy: window.BRN_CURRENT_USER?.displayName || 'ทีม PR',
    };
  }

  async function saveEvent(payload) {
    if (state.cloudReady && state.firestore) {
      const { addDoc, collection, doc, setDoc, serverTimestamp } = state.firestore;
      const cloudPayload = { ...payload, updatedAt: serverTimestamp() };
      if (state.editingId) await setDoc(doc(state.db, 'prEvents', state.editingId), cloudPayload, { merge: true });
      else {
        const ref = await addDoc(collection(state.db, 'prEvents'), { ...cloudPayload, createdAt: serverTimestamp() });
        await queueLineNotification({ ...payload, id: ref.id });
      }
      return;
    }
    if (state.editingId) {
      const idx = state.events.findIndex(e => e.id === state.editingId);
      if (idx >= 0) state.events[idx] = { ...state.events[idx], ...payload };
    } else {
      state.events.push({ ...payload, id: `local-${Date.now()}` });
    }
    saveLocalEvents(); renderCalendar();
  }

  async function queueLineNotification(event) {
    if (!state.cloudReady || !state.firestore || !event.reminder) return;
    try {
      const { addDoc, collection, serverTimestamp } = state.firestore;
      const when = `${thaiFullDate(event.date)}${event.time ? ` เวลา ${event.time} น.` : ''}`;
      const lines = [`📌 เพิ่มงานใหม่ใน BRN PR Board`, event.title, when];
      if (event.location) lines.push(`📍 ${event.location}`);
      if (event.owner) lines.push(`เจ้าของงาน: ${event.owner}`);
      await addDoc(collection(state.db, 'lineOutbox'), { text: lines.join('\n'), status: 'pending', createdAt: serverTimestamp(), eventId: event.id || null });
    } catch (error) { console.warn('LINE queue failed', error); }
  }

  async function deleteCurrentEvent() {
    if (!state.editingId || !confirm('ลบงานนี้ออกจากปฏิทินใช่หรือไม่?')) return;
    if (state.cloudReady && state.firestore) {
      const { deleteDoc, doc } = state.firestore;
      await deleteDoc(doc(state.db, 'prEvents', state.editingId));
    } else {
      state.events = state.events.filter(e => e.id !== state.editingId); saveLocalEvents(); renderCalendar();
    }
    els.eventDialog.close(); showToast('ลบงานแล้ว');
  }

  async function initCloud() {
    if (!config) throw new Error('Missing Firebase config');
    try {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js'),
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp(config);
      state.db = fs.getFirestore(app); state.firestore = fs;
      const q = fs.query(fs.collection(state.db, 'prEvents'), fs.orderBy('date', 'asc'));
      state.unsubscribe = fs.onSnapshot(q, (snapshot) => {
        state.events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        state.cloudReady = true; els.syncStatus.textContent = 'ซิงก์ข้อมูลกับทีมแล้ว'; renderCalendar(); renderGuides();
      }, (error) => {
        console.warn(error); state.events = localEvents(); state.cloudReady = false; els.syncStatus.textContent = 'ใช้งานบนเครื่องนี้'; renderCalendar(); renderGuides();
      });
    } catch (error) {
      console.warn(error); state.events = localEvents(); els.syncStatus.textContent = 'ใช้งานบนเครื่องนี้'; renderCalendar(); renderGuides();
    }
  }

  els.prev.addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() - 1, 1); renderCalendar(); renderIdeas(); });
  els.next.addEventListener('click', () => { state.cursor = new Date(state.cursor.getFullYear(), state.cursor.getMonth() + 1, 1); renderCalendar(); renderIdeas(); });
  els.today.addEventListener('click', () => { state.cursor = new Date(); state.selectedDate = new Date(); renderCalendar(); renderGuides(); });
  els.add.addEventListener('click', () => openEventDialog(isoDate(state.selectedDate)));
  els.eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = eventPayload(); if (!payload.title || !payload.date) return;
    try { await saveEvent(payload); els.eventDialog.close(); showToast(state.editingId ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มงานลงปฏิทินแล้ว'); }
    catch (error) { console.error(error); showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่'); }
  });
  els.deleteEvent.addEventListener('click', deleteCurrentEvent);
  els.editEvent.addEventListener('click', () => { const event = state.events.find(e => e.id === state.detailId); if (!event) return; els.detailDialog.close(); openEventDialog(event.date, event); });
  document.querySelectorAll('[data-close-dialog]').forEach(btn => btn.addEventListener('click', () => btn.closest('dialog').close()));
  document.querySelectorAll('.modal-dialog').forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }));
  $('open-month-ideas').addEventListener('click', () => { renderIdeas(); els.ideasDialog.showModal(); });
  $('open-ideas-card').addEventListener('click', () => { renderIdeas(); els.ideasDialog.showModal(); });
  $('refresh-guides').addEventListener('click', () => { renderGuides(); showToast('ปรับแนวทางตามวันที่เลือกแล้ว'); });
  document.querySelectorAll('.guide-more').forEach(btn => btn.addEventListener('click', () => { document.getElementById('guides').scrollIntoView({behavior:'smooth'}); showToast('แนวทางนี้ปรับตามงานในวันที่เลือก'); }));

  state.cursor = new Date(); state.cursor.setDate(1); state.selectedDate = new Date();
  state.events = localEvents(); renderCalendar(); renderGuides(); renderIdeas(); initCloud();
})();
