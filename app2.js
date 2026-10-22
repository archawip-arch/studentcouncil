const TY = {
  announce: ['📢', 'ประกาศ / ประชาสัมพันธ์', 'title body date image'],
  page: ['🌐', 'ช่องทางเพจโรงเรียน', 'title body link image'],
  links: ['🔗', 'รวมลิงก์ที่ใช้บ่อย', 'title link'],
  event: ['📅', 'กิจกรรม / นับถอยหลัง', 'title date body'],
  lost: ['🔎', 'แจ้งของหาย', 'title body image extra'],
  faq: ['❓', 'คำถามที่พบบ่อย', 'title body'],
  gallery: ['🖼️', 'แกลเลอรีรูป', 'title image'],
  people: ['👥', 'ทำเนียบสภา / ติดต่อ', 'title extra image'],
  schedule: ['🗓️', 'กำหนดการ / ตารางสอบ', 'title date body'],
  form: ['📝', 'ลิงก์แบบฟอร์ม', 'title body link']
};
const FL = { title: 'หัวข้อ', body: 'รายละเอียด', date: 'วันที่', image: 'ลิงก์รูป (https://...)', link: 'ลิงก์ (https://...)', extra: 'หมายเหตุ' };
const LB = { faq: { title: 'คำถาม', body: 'คำตอบ' }, people: { title: 'ชื่อ', extra: 'ตำแหน่ง' }, lost: { title: 'ของที่หาย / เก็บได้', extra: 'สถานะ (ตามหา / เก็บได้)' } };
const okU = u => /^https?:\/\//i.test(u || '');
const TA = 'width:100%;min-height:90px;padding:12px;border:2px solid var(--sky2);border-radius:14px;background:var(--card);color:var(--ink);font:inherit;margin:6px 0';
function im(u) {
  if (!okU(u)) return '';
  const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/);
  return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w800' : u;
}

function viewHome() {
  const m = D.me, adm = m.role === 'admin', b = D.banner || {};
  const bg = b.img ? `style="background-image:url('${esc(b.img)}')"` : '';
  $('#app').innerHTML = `<div class="top"><div><b>สวัสดี ${esc(m.name)}</b><div class="muted">${esc([m.class, m.studentId].filter(Boolean).join(' · '))}</div></div>
  <div class="row">${adm ? '<button class="btn alt" id="ad">จัดการ</button>' : ''}<button class="btn alt" id="lo">ออก</button></div></div>
  <div class="banner" ${bg}><span>${esc(b.text)}</span></div>
  <div class="grid">${D.modules.map(x => `<button class="mod ${x.enabled ? '' : 'off'}" data-k="${esc(x.key)}">
  <span class="ic">${esc(x.icon)}</span>${esc(x.name)}${x.enabled ? '' : '<small>เร็วๆ นี้</small>'}</button>`).join('')}</div>`;
  $('#lo').onclick = logout; if (adm) $('#ad').onclick = viewAdmin;
  document.querySelectorAll('.mod').forEach(el => el.onclick = () => {
    const x = D.modules.find(y => y.key === el.dataset.k);
    x.enabled ? openModule(x.key) : ($('#pop').style.display = 'flex');
  });
}

async function openModule(k) {
  const x = D.modules.find(y => y.key === k);
  if (!TY[x.type]) { toast('เมนูนี้กำลังพัฒนา จะมาในเฟสถัดไป'); return; }
  const r = await call('items', { menu: k });
  if (r) viewMenu(x, r.items);
}

function viewMenu(x, items) {
  const adm = D.me.role === 'admin', f = TY[x.type][2].split(' '), L = LB[x.type] || {};
  const byDate = x.type === 'event' || x.type === 'schedule';
  items = items.slice().sort(byDate ? (a, b) => (a.date || '9').localeCompare(b.date || '9') : (a, b) => b.time - a.time);
  const left = d => {
    const n = Math.ceil((new Date(d + 'T00:00:00+07:00') - Date.now()) / 864e5);
    return isNaN(n) ? '' : n > 0 ? ' · อีก ' + n + ' วัน' : n === 0 ? ' · วันนี้!' : ' · ผ่านไปแล้ว';
  };
  const card = i => {
    const del = adm ? `<button class="btn alt" data-del="${esc(i.id)}">ลบ</button>` : '';
    const body = esc(i.body).replace(/\n/g, '<br>');
    if (x.type === 'faq') return `<details class="box" style="margin:8px 0"><summary><b>${esc(i.title)}</b></summary><p>${body}</p>${del}</details>`;
    const pic = im(i.image) ? `<img src="${esc(im(i.image))}" alt="" style="width:100%;border-radius:14px;margin:6px 0">` : '';
    const ln = okU(i.link) ? `<a class="btn" style="display:block;text-align:center;text-decoration:none" href="${esc(i.link)}" target="_blank" rel="noopener">เปิดลิงก์</a>` : '';
    return `<div class="box" style="margin:10px 0"><b>${esc(i.title)}</b>${i.extra ? ` <span class="muted">· ${esc(i.extra)}</span>` : ''}${i.date ? `<div class="muted">${esc(i.date)}${x.type === 'event' ? left(i.date) : ''}</div>` : ''}${pic}<p>${body}</p>${ln}${del}</div>`;
  };
  const inp = k => k === 'date' ? `<input type="date" id="f_${k}" aria-label="วันที่">`
    : k === 'body' ? `<textarea id="f_${k}" style="${TA}" placeholder="${esc(L[k] || FL[k])}"></textarea>`
    : `<input id="f_${k}" placeholder="${esc(L[k] || FL[k])}">`;
  const form = adm ? `<div class="box" style="margin:10px 0"><b>เพิ่มรายการ</b>${f.map(inp).join('')}<button class="btn" id="add">เพิ่ม</button></div>` : '';
  $('#app').innerHTML = `<div class="top"><h2>${esc(x.icon)} ${esc(x.name)}</h2><button class="btn alt" id="bk">กลับ</button></div>${form}${items.map(card).join('') || '<p class="muted">ยังไม่มีรายการ</p>'}`;
  $('#bk').onclick = viewHome;
  if (adm) {
    $('#add').onclick = async () => {
      const d = { menu: x.key }; f.forEach(k => d[k] = $('#f_' + k).value);
      if (await call('addItem', d)) { toast('เพิ่มแล้ว'); openModule(x.key); }
    };
    document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (confirm('ลบรายการนี้?') && await call('delItem', { id: b.dataset.del })) openModule(x.key);
    });
  }
}

function viewAdmin() {
  const b = D.banner || {};
  const opt = v => Object.keys(TY).map(k => `<option value="${k}" ${k === v ? 'selected' : ''}>${TY[k][0]} ${TY[k][1]}</option>`).join('');
  $('#app').innerHTML = `<div class="top"><h2>จัดการระบบ</h2><button class="btn alt" id="bk">กลับ</button></div>
  <div class="box"><b>เมนู</b><p class="muted">ติ๊กถูก = เปิดให้นักเรียนใช้ เลือกประเภทแล้วกดบันทึก</p>
  ${D.modules.map(x => {
    const sys = x.type === 'msg' || x.type === 'trash';
    return `<div class="box" style="margin:8px 0;box-shadow:none;border:2px solid var(--sky2)" data-k="${esc(x.key)}">
    <div class="row"><input type="checkbox" class="en" ${x.enabled ? 'checked' : ''} aria-label="เปิดใช้งาน"><input class="ic" style="width:70px" maxlength="8" value="${esc(x.icon)}"><input class="nm" maxlength="30" value="${esc(x.name)}"></div>
    <select class="ty" ${sys ? 'disabled' : ''} style="width:100%;padding:10px;border-radius:12px">${sys ? '<option>เมนูระบบ</option>' : opt(x.type)}</select>
    <button class="btn sv">บันทึก</button></div>`;
  }).join('')}
  <button class="btn alt" id="am">+ เพิ่มเมนูใหม่</button>
  <hr><b>แบนเนอร์หน้าแรก</b>
  <input id="bt" value="${esc(b.text)}" placeholder="ข้อความ" maxlength="80"><input id="bi" value="${esc(b.img)}" placeholder="ลิงก์รูปแบนเนอร์ (ว่างได้)">
  <button class="btn" id="sb">บันทึกแบนเนอร์</button>
  <hr><b>นำเข้ารายชื่อ</b><p class="muted">1 บรรทัด = 1 คน: ชื่อผู้ใช้,รหัสผ่าน,ชื่อ-นามสกุล,ชั้น,เลขประจำตัว (ว่างรหัสได้ ระบบสุ่มให้) ก๊อปจากชีตวางได้เลย</p>
  <textarea id="imt" style="${TA}" placeholder="s001,1234ab,สมชาย ใจดี,ม.5/1,12345"></textarea>
  <button class="btn" id="im">นำเข้า</button><pre id="imr" style="white-space:pre-wrap"></pre>
  <hr><b>รีเซ็ตรหัสผ่านให้นักเรียน</b>
  <input id="ru" placeholder="ชื่อผู้ใช้" autocapitalize="off"><input id="rp" placeholder="รหัสชั่วคราว (6 ตัวขึ้นไป)" autocapitalize="off">
  <button class="btn" id="rs">รีเซ็ตรหัสผ่าน</button></div>`;
  const refresh = async () => { const h = await call('home'); if (h) D = h; };
  $('#bk').onclick = viewHome;
  document.querySelectorAll('[data-k]').forEach(row => row.querySelector('.sv').onclick = async () => {
    const x = D.modules.find(y => y.key === row.dataset.k), sys = x.type === 'msg' || x.type === 'trash';
    const r = await call('setModule2', { key: x.key, name: row.querySelector('.nm').value, icon: row.querySelector('.ic').value,
      type: sys ? x.type : row.querySelector('.ty').value, enabled: row.querySelector('.en').checked });
    if (r) { toast('บันทึกแล้ว'); await refresh(); }
  });
  $('#am').onclick = async () => { if (await call('addModule')) { await refresh(); viewAdmin(); } };
  $('#sb').onclick = async () => { if (await call('setBanner', { text: $('#bt').value, img: $('#bi').value })) { toast('บันทึกแบนเนอร์แล้ว'); await refresh(); } };
  $('#im').onclick = async () => {
    const r = await call('importUsers', { text: $('#imt').value });
    if (r) { $('#imr').textContent = 'เพิ่ม ' + r.added + ' บัญชี, ข้าม (ซ้ำ) ' + r.skipped + (r.generated.length ? '\nรหัสที่ระบบสุ่มให้:\n' + r.generated.join('\n') : ''); $('#imt').value = ''; }
  };
  $('#rs').onclick = async () => {
    if (await call('resetPassword', { username: $('#ru').value.trim(), newPassword: $('#rp').value })) { toast('รีเซ็ตรหัสผ่านแล้ว'); $('#ru').value = $('#rp').value = ''; }
  };
}
