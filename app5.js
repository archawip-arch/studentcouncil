async function viewTrashAdmin(x) {
  const r = await call('trashAll');
  if (!r) return;
  const bc = i => `<div class="box" style="margin:8px 0" data-b="${esc(i.id)}"><b>${esc(i.name)}</b> <span class="muted">${esc(i.cls)} · ${esc(i.sid)} · ${dt(i.time)}</span>
  <button class="btn alt vi">ดูรูป</button><div class="pic"></div>
  <input class="cn" type="number" value="${i.count}" aria-label="จำนวนขวด"><input class="nt" placeholder="หมายเหตุ (ว่างได้)">
  <div class="row"><button class="btn ok">✅ อนุมัติ</button><button class="btn alt no">❌ ไม่อนุมัติ</button></div></div>`;
  const rc = i => `<div class="box" style="margin:8px 0" data-r="${esc(i.id)}"><b>${esc(i.name)}</b> <span class="muted">${esc(i.cls)} · ${esc(i.sid)}</span>
  <div>แลก ${esc(i.reward)} (${i.cost} ขวด)</div>
  <div class="row"><button class="btn ok">✅ อนุมัติ</button><button class="btn alt no">❌ ไม่อนุมัติ</button></div></div>`;
  const wc = w => `<div class="box" style="margin:8px 0" data-w="${esc(w.id)}"><div class="row"><input type="checkbox" class="ac" ${w.active ? 'checked' : ''} aria-label="เปิดให้แลก">
  <input class="wn" value="${esc(w.name)}" placeholder="ชื่อของรางวัล"><input class="wk" type="number" value="${w.cost}" placeholder="ขวด" style="width:90px"></div>
  <input class="wi" value="${esc(w.image)}" placeholder="ลิงก์รูป (ว่างได้)">
  <div class="row"><button class="btn sv">บันทึก</button><button class="btn alt dl">ลบ</button></div></div>`;
  $('#app').innerHTML = `<div class="top"><h2>ตรวจขยะแลกแต้ม</h2><button class="btn alt" id="bk">กลับ</button></div>
  <b>ตรวจรูปขวด (${r.bottles.length})</b>${r.bottles.map(bc).join('') || '<p class="muted">ไม่มีรายการรอตรวจ</p>'}
  <b>คำขอแลกของรางวัล (${r.redeems.length})</b>${r.redeems.map(rc).join('') || '<p class="muted">ไม่มีคำขอ</p>'}
  <hr><b>ของรางวัล</b><p class="muted">ติ๊ก = เปิดให้แลก · ช่องขวาคือจำนวนขวดที่ใช้แลก · กล่องล่างสุดคือเพิ่มของใหม่</p>
  ${r.rewards.map(wc).join('')}${wc({ id: '', name: '', cost: '', image: '', active: true })}`;
  $('#bk').onclick = () => viewTrash(x, 'home');
  document.querySelectorAll('[data-b]').forEach(c => {
    const id = c.dataset.b;
    c.querySelector('.vi').onclick = async () => {
      const d = await call('trashImg', { id });
      if (d) c.querySelector('.pic').innerHTML = `<img src="${d.data}" alt="" style="width:100%;border-radius:14px;margin:6px 0">`;
    };
    const go = ok => async () => {
      if (await call('trashReview', { id, ok, count: c.querySelector('.cn').value, note: c.querySelector('.nt').value })) viewTrashAdmin(x);
    };
    c.querySelector('.ok').onclick = go(true); c.querySelector('.no').onclick = go(false);
  });
  document.querySelectorAll('[data-r]').forEach(c => {
    const id = c.dataset.r;
    const go = ok => async () => { if (await call('redeemReview', { id, ok })) viewTrashAdmin(x); };
    c.querySelector('.ok').onclick = go(true); c.querySelector('.no').onclick = go(false);
  });
  document.querySelectorAll('[data-w]').forEach(c => {
    const id = c.dataset.w;
    c.querySelector('.sv').onclick = async () => {
      if (await call('rewardSave', { id, name: c.querySelector('.wn').value, cost: c.querySelector('.wk').value,
        image: c.querySelector('.wi').value, active: c.querySelector('.ac').checked })) { toast('บันทึกแล้ว'); viewTrashAdmin(x); }
    };
    c.querySelector('.dl').onclick = async () => {
      if (id && confirm('ลบของรางวัลนี้?') && await call('rewardDel', { id })) viewTrashAdmin(x);
    };
  });
}
