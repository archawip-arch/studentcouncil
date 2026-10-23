const _o4 = openModule;
const TS = { 'รอตรวจ': '⏳', 'อนุมัติ': '✅', 'ไม่อนุมัติ': '❌' };
openModule = async function (k) {
  const x = D.modules.find(y => y.key === k);
  return x.type === 'trash' ? viewTrash(x, 'home') : _o4(k);
};

async function viewTrash(x, tab) {
  const adm = D.me.role === 'admin', h = await call('trashHome');
  if (!h) return;
  const b = h.bal;
  let body = '', img = '';
  if (tab === 'home') {
    body = `<div class="box" style="text-align:center"><div style="font-size:3rem">🧴</div>
    <div style="font-size:2.4rem;font-weight:700">${b.left} ขวด</div><div class="muted">ใช้แลกได้ตอนนี้</div><hr>
    <div class="muted">สะสมทั้งหมด ${b.got} · รอตรวจ ${b.pend} · แลกแล้ว/รออนุมัติ ${b.spent + b.hold}</div></div>`;
  } else if (tab === 'shop') {
    body = h.rewards.map(w => `<div class="box" style="margin:10px 0">
    ${im(w.image) ? `<img src="${esc(im(w.image))}" alt="" style="width:100%;border-radius:14px">` : ''}
    <b>${esc(w.name)}</b><div class="muted">ใช้ ${w.cost} ขวด</div>
    <button class="btn" data-rw="${esc(w.id)}" ${b.left < w.cost ? 'disabled style="opacity:.5"' : ''}>${b.left < w.cost ? 'ขวดไม่พอ' : 'แลกเลย'}</button></div>`).join('')
      || '<p class="muted">ยังไม่มีของรางวัล</p>';
  } else if (tab === 'send') {
    body = `<div class="box"><b>ส่งรูปจุดทิ้งขวด</b>
    <input id="tc" type="number" min="1" max="200" inputmode="numeric" placeholder="จำนวนขวด">
    <input type="file" id="tf" accept="image/*"><img id="tp" alt="" style="display:none;width:100%;border-radius:14px;margin:6px 0">
    <button class="btn" id="tsd">ส่งให้พี่สภาตรวจ</button><p class="muted">พี่สภาจะตรวจรูปและอนุมัติจำนวนขวดให้</p></div>`;
  } else {
    const m = await call('trashMine');
    if (!m) return;
    const li = (t, s, ex) => `<div class="box" style="margin:8px 0">${TS[s] || ''} ${t} <span class="muted">· ${esc(s)}${ex || ''}</span></div>`;
    body = '<b>การส่งขวด</b>' + (m.bottles.map(i => li(i.count + ' ขวด', i.status, ' · ' + dt(i.time) + (i.note ? ' · 💬 ' + esc(i.note) : ''))).join('') || '<p class="muted">ยังไม่มี</p>')
      + '<b>การแลกของรางวัล</b>' + (m.redeems.map(i => li(esc(i.name) + ' (' + i.cost + ' ขวด)', i.status, ' · ' + dt(i.time))).join('') || '<p class="muted">ยังไม่มี</p>');
  }
  const tb = (t, l) => `<button class="btn ${tab === t ? '' : 'alt'}" data-t="${t}" style="margin:0;padding:10px 4px;font-size:.85rem">${l}</button>`;
  $('#app').innerHTML = `<div class="top"><h2>${esc(x.icon)} ${esc(x.name)}</h2><button class="btn alt" id="bk">กลับ</button></div>
  <div class="row">${tb('home', 'ขวดฉัน')}${tb('send', 'ส่งขวด')}${tb('shop', 'ของรางวัล')}${tb('hist', 'ประวัติ')}${adm ? '<button class="btn alt" id="ta" style="margin:0;padding:10px 4px;font-size:.85rem">ตรวจ</button>' : ''}</div>${body}`;
  $('#bk').onclick = viewHome;
  document.querySelectorAll('[data-t]').forEach(e => e.onclick = () => viewTrash(x, e.dataset.t));
  if (adm) $('#ta').onclick = () => viewTrashAdmin(x);
  document.querySelectorAll('[data-rw]').forEach(e => e.onclick = async () => {
    if (confirm('ยืนยันการแลก?') && await call('redeem', { id: e.dataset.rw })) { toast('ส่งคำขอแลกแล้ว รอพี่สภาอนุมัติ'); viewTrash(x, 'hist'); }
  });
  if (tab === 'send') {
    $('#tf').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { img = await shrink(f); $('#tp').src = img; $('#tp').style.display = 'block'; } catch (z) { toast('เปิดรูปนี้ไม่ได้'); }
    };
    $('#tsd').onclick = async () => {
      if (await call('trashSend', { count: $('#tc').value, image: img })) { toast('ส่งแล้ว รอพี่สภาตรวจ'); viewTrash(x, 'hist'); }
    };
  }
}
document.head.appendChild(Object.assign(document.createElement('script'), { src: 'app5.js?v=1' }));
