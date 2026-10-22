const _om = openModule, _va = viewAdmin, _vh = viewHome;
const ST = { 'รอดำเนินการ': '⏳', 'กำลังดำเนินการ': '🔧', 'เสร็จแล้ว': '✅' };
const KD = { listen: '👂 กล่องฟังเสียง (เรื่องไม่สบายใจ)', page: '📣 ส่งเรื่องลงเพจ' };
const dt = t => t ? new Date(t).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '';

function applyTheme(t) {
  const s = document.documentElement.style, mix = c => `color-mix(in srgb, ${c} 80%, #000)`;
  [['sun', '--sun', '--sun2'], ['sky', '--sky', '--sky2']].forEach(a => {
    if (t[a[0]]) { s.setProperty(a[1], t[a[0]]); s.setProperty(a[2], mix(t[a[0]])); }
    else { s.removeProperty(a[1]); s.removeProperty(a[2]); }
  });
  document.body.style.background = t.bg && okU(t.bg) ? `url('${t.bg.replace(/'/g, '%27')}') center/cover fixed var(--bg)` : '';
}

viewHome = function () {
  _vh();
  if (D.theme) applyTheme(D.theme);
  else call('theme').then(r => { if (r) { D.theme = r; applyTheme(r); } });
};

openModule = async function (k) {
  const x = D.modules.find(y => y.key === k);
  if (x.type === 'msg') return viewMsg(x, 'new');
  return _om(k);
};

function shrink(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = im.width * s; c.height = im.height * s;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.7));
      };
      im.onerror = rej; im.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

const mc = (m, a) => `<div class="box" style="margin:10px 0" data-m="${esc(m.id)}">
  <b>${ST[m.status] || ''} ${esc(m.status)}</b> <span class="muted">· ${KD[m.kind] ? KD[m.kind].slice(0, 2) : ''} ${dt(m.time)}</span>
  ${a ? `<div class="muted">${esc(m.name)} · ${esc(m.cls)} · ${esc(m.sid)}</div>` : ''}
  <p>${esc(m.text).replace(/\n/g, '<br>')}</p>
  ${m.img ? '<button class="btn alt vi">ดูรูป</button><div class="pic"></div>' : ''}
  ${m.reply && !a ? `<p class="muted">💬 ตอบกลับ: ${esc(m.reply)}</p>` : ''}
  ${a ? `<select class="ss" style="width:100%;padding:10px;border-radius:12px;margin-top:8px">${Object.keys(ST).map(s => `<option ${s === m.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
  <input class="rp" placeholder="ข้อความตอบกลับ (ว่างได้)" value="${esc(m.reply)}"><button class="btn sv">บันทึก</button>` : ''}</div>`;

async function viewMsg(x, tab) {
  const adm = D.me.role === 'admin';
  let body = '', img = '';
  if (tab === 'new') {
    body = `<div class="box"><b>ส่งข้อความฝากบอก</b>
    <select id="mk" style="width:100%;padding:10px;border-radius:12px;margin:6px 0">${Object.keys(KD).map(k => `<option value="${k}">${KD[k]}</option>`).join('')}</select>
    <textarea id="mt" style="${TA}" maxlength="2000" placeholder="อยากฝากบอกเรื่องอะไร พิมพ์ได้เลย..."></textarea>
    <input type="file" id="mf" accept="image/*"><img id="mp" alt="" style="display:none;width:100%;border-radius:14px;margin:6px 0">
    <button class="btn" id="ms">ส่งข้อความ</button><p class="muted">ระบบแนบชื่อ ชั้น และเลขประจำตัวของคุณให้อัตโนมัติ</p></div>`;
  } else {
    const r = await call(tab === 'all' ? 'msgAll' : 'msgMine');
    if (!r) return;
    body = r.list.map(m => mc(m, tab === 'all')).join('') || '<p class="muted">ยังไม่มีรายการ</p>';
  }
  const tb = (t, l) => `<button class="btn ${tab === t ? '' : 'alt'}" data-t="${t}" style="margin:0">${l}</button>`;
  $('#app').innerHTML = `<div class="top"><h2>${esc(x.icon)} ${esc(x.name)}</h2><button class="btn alt" id="bk">กลับ</button></div>
  <div class="row">${tb('new', 'ส่งเรื่อง')}${tb('mine', 'เรื่องของฉัน')}${adm ? tb('all', 'กล่องรับเรื่อง') : ''}</div>${body}`;
  $('#bk').onclick = viewHome;
  document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => viewMsg(x, b.dataset.t));
  if (tab === 'new') {
    $('#mf').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { img = await shrink(f); $('#mp').src = img; $('#mp').style.display = 'block'; } catch (x2) { toast('เปิดรูปนี้ไม่ได้'); }
    };
    $('#ms').onclick = async () => {
      if (await call('msgSend', { kind: $('#mk').value, text: $('#mt').value, image: img })) { toast('ส่งข้อความแล้ว'); viewMsg(x, 'mine'); }
    };
  }
  document.querySelectorAll('[data-m]').forEach(card => {
    const id = card.dataset.m, vi = card.querySelector('.vi'), sv = card.querySelector('.sv');
    if (vi) vi.onclick = async () => {
      const r = await call('msgImg', { id });
      if (r) card.querySelector('.pic').innerHTML = `<img src="${r.data}" alt="" style="width:100%;border-radius:14px;margin:6px 0">`;
    };
    if (sv) sv.onclick = async () => {
      if (await call('msgSet', { id, status: card.querySelector('.ss').value, reply: card.querySelector('.rp').value })) toast('บันทึกแล้ว');
    };
  });
}

viewAdmin = function () {
  _va();
  document.querySelectorAll('[data-k] .en').forEach(c => {
    const s = document.createElement('b'); s.style.minWidth = '64px';
    const u = () => { s.textContent = c.checked ? '🟢 เปิด' : '⚪ ปิด'; };
    u(); c.after(s); c.style.cssText += ';width:34px;height:34px';
    c.onchange = () => { u(); c.closest('[data-k]').querySelector('.sv').click(); };
  });
  const t = D.theme || {}, d = document.createElement('div');
  d.innerHTML = `<hr><b>ธีมสี / พื้นหลัง</b>
  <div class="row"><span>สีหลัก</span><input type="color" id="ts" value="${t.sun || '#ffe48a'}" style="width:70px;padding:2px"><span>สีรอง</span><input type="color" id="tk" value="${t.sky || '#dff0ff'}" style="width:70px;padding:2px"></div>
  <input id="tb" placeholder="ลิงก์รูปพื้นหลัง (ว่างได้)" value="${esc(t.bg || '')}">
  <button class="btn" id="tsv">บันทึกธีม</button><button class="btn alt" id="trs">คืนค่าเดิม</button>
  <hr><button class="btn" id="inb">📥 เปิดกล่องรับเรื่องฝากบอก</button>`;
  document.querySelector('#app .box').appendChild(d);
  const save = async (v) => { if (await call('setTheme', v)) { D.theme = v; applyTheme(v); toast('บันทึกธีมแล้ว'); } };
  $('#tsv').onclick = () => save({ sun: $('#ts').value, sky: $('#tk').value, bg: $('#tb').value });
  $('#trs').onclick = () => save({ sun: '', sky: '', bg: '' });
  $('#inb').onclick = () => { const x = D.modules.find(m => m.type === 'msg'); if (x) viewMsg(x, 'all'); };
};
document.head.insertAdjacentHTML('beforeend', '<style>.mod:not(.off){background:var(--sun)!important;box-shadow:0 4px 0 var(--sun2)!important}</style>');
