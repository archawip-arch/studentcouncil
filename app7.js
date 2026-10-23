const _vm7 = viewMsg;
viewMsg = async function (x, tab) {
  await _vm7(x, tab);
  if (tab !== 'all') return;
  const bar = document.createElement('div');
  bar.className = 'box';
  bar.style.margin = '10px 0';
  bar.innerHTML = '<label class="row"><input type="checkbox" id="shn"> <b>แสดงชื่อผู้ส่ง</b></label><div class="muted">ปิดไว้ = ซ่อนชื่อ ชั้น เลขประจำตัว (เหมาะตอนแคปหน้าจอ)</div>';
  const first = document.querySelector('[data-m]');
  if (first) first.parentNode.insertBefore(bar, first); else document.querySelector('#app').appendChild(bar);
  const cards = document.querySelectorAll('[data-m]');
  cards.forEach(c => {
    const s = c.querySelector(':scope > div.muted');
    if (s) s.dataset.real = s.textContent;
  });
  const apply = on => cards.forEach(c => {
    const s = c.querySelector(':scope > div.muted');
    if (s) s.textContent = on ? s.dataset.real : '🙈 ซ่อนชื่อผู้ส่ง';
  });
  apply(false);
  $('#shn').onchange = e => apply(e.target.checked);
};
