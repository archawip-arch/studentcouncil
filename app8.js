const _vm8 = viewMsg;
const sg = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
const ss = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
document.documentElement.style.setProperty('--pf', sg('pf_c', '#b9dcf9'));
document.head.insertAdjacentHTML('beforeend', '<style>.pg{display:grid;gap:8px;margin:8px 0}.pg>div{position:relative}.pg img{width:100%;aspect-ratio:1;object-fit:cover;border:4px solid var(--pf,#b9dcf9);border-radius:16px;background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.08);cursor:zoom-in;display:block}.rm{position:absolute;top:6px;right:6px;border:0;border-radius:50%;width:28px;height:28px;background:#fff;font-weight:700;cursor:pointer}#lb{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:20;padding:12px}#lb img{max-width:100%;max-height:88vh;border:5px solid var(--pf,#b9dcf9);border-radius:18px;background:#fff}.sw{width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #ccc;cursor:pointer;display:inline-block}</style>');
document.body.insertAdjacentHTML('beforeend', '<div id="lb"></div>');
$('#lb').onclick = () => { $('#lb').style.display = 'none'; };

function openLb(src) {
  const lb = $('#lb');
  lb.innerHTML = '<img alt="">';
  lb.firstChild.src = src;
  lb.style.display = 'flex';
}

function setCols(g) {
  const z = sg('pf_s', 'm');
  g.style.gridTemplateColumns = 'repeat(' + (z === 's' ? 3 : z === 'l' ? 1 : 2) + ',1fr)';
  g.querySelectorAll('img').forEach(i => { i.style.aspectRatio = z === 'l' ? '4/3' : '1'; });
}

function bar8() {
  const d = document.createElement('div');
  d.className = 'box'; d.style.margin = '10px 0';
  const z = sg('pf_s', 'm');
  d.innerHTML = '<div class="row"><b>ขนาดรูป</b>' + [['s', 'เล็ก'], ['m', 'กลาง'], ['l', 'ใหญ่']].map(a =>
    '<button class="btn ' + (z === a[0] ? '' : 'alt') + '" data-sz="' + a[0] + '" style="margin:0;padding:8px">' + a[1] + '</button>').join('') +
    '</div><div class="row"><b>สีกรอบ</b>' + ['#b9dcf9', '#ffd04a', '#ffb3d1', '#a8e6c1', '#d4bfff'].map(c =>
    '<span class="sw" data-c="' + c + '" style="background:' + c + '"></span>').join('') +
    '<input type="color" id="pfc" value="' + sg('pf_c', '#b9dcf9') + '" style="width:44px;height:34px;padding:2px;margin:0"></div>';
  const pick = d.querySelector('#pfc');
  const setC = c => { ss('pf_c', c); document.documentElement.style.setProperty('--pf', c); pick.value = c; };
  d.querySelectorAll('[data-sz]').forEach(b => b.onclick = () => {
    ss('pf_s', b.dataset.sz);
    d.querySelectorAll('[data-sz]').forEach(x => x.classList.toggle('alt', x !== b));
    document.querySelectorAll('.pg').forEach(setCols);
  });
  d.querySelectorAll('[data-c]').forEach(s => s.onclick = () => setC(s.dataset.c));
  pick.oninput = e => setC(e.target.value);
  return d;
}

viewMsg = async function (x, tab) {
  await _vm8(x, tab);
  if (tab === 'new') {
    const list = [], inp = $('#mf'), g = document.createElement('div'), cnt = document.createElement('div');
    g.className = 'pg'; cnt.className = 'muted';
    inp.multiple = true;
    $('#mp').replaceWith(g); g.after(cnt);
    const draw = () => {
      g.innerHTML = list.map((s, i) => '<div><img alt="" src="' + s + '"><button class="rm" data-i="' + i + '">✕</button></div>').join('');
      setCols(g);
      cnt.textContent = list.length ? 'แนบแล้ว ' + list.length + '/10 รูป' : 'แนบได้สูงสุด 10 รูป';
      g.querySelectorAll('.rm').forEach(b => b.onclick = () => { list.splice(+b.dataset.i, 1); draw(); });
    };
    inp.onchange = async e => {
      const files = Array.from(e.target.files);
      for (const f of files) {
        if (list.length >= 10) { toast('แนบได้สูงสุด 10 รูป'); break; }
        try { list.push(await shrink(f)); } catch (z) { toast('เปิดรูปบางรูปไม่ได้'); }
      }
      inp.value = ''; draw();
    };
    $('#ms').onclick = async () => {
      if (await call('msgSend2', { kind: $('#mk').value, text: $('#mt').value, images: list })) { toast('ส่งข้อความแล้ว'); viewMsg(x, 'mine'); }
    };
    draw();
  } else {
    const first = document.querySelector('#app .row');
    if (first) first.after(bar8());
    document.querySelectorAll('[data-m]').forEach(c => {
      const vi = c.querySelector('.vi');
      if (!vi) return;
      vi.onclick = async () => {
        const r = await call('msgImgs', { id: c.dataset.m });
        if (!r) return;
        const pic = c.querySelector('.pic'), g = document.createElement('div');
        g.className = 'pg'; pic.innerHTML = ''; pic.appendChild(g);
        r.list.forEach(d => { const i = document.createElement('img'); i.alt = ''; i.src = d; i.onclick = () => openLb(d); g.appendChild(i); });
        setCols(g);
      };
    });
  }
};
