const _va6 = viewAdmin;
viewAdmin = function () {
  _va6();
  const d = document.createElement('div');
  d.innerHTML = `<hr><b>💾 สำรองข้อมูล</b>
  <p class="muted">ระบบสำรองอัตโนมัติทุกวันอาทิตย์ (เก็บ 8 ชุดล่าสุด) กดสำรองเดี๋ยวนี้ได้</p>
  <button class="btn" id="bkn">สำรองข้อมูลตอนนี้</button>
  <hr><b>🎓 สิ้นปีการศึกษา</b>
  <p class="muted">ระบบสำรองข้อมูลให้อัตโนมัติก่อนดำเนินการ บัญชีแอดมินไม่ถูกเลื่อนชั้นหรือลบ</p>
  <label class="row"><input type="checkbox" id="yp" checked> เลื่อนชั้นนักเรียนทุกคน (+1)</label>
  <div class="row"><span>ชั้นสูงสุด</span><input id="ym" type="number" value="6" style="width:80px"></div>
  <label class="row"><input type="checkbox" id="yd"> ลบบัญชีนักเรียนที่จบชั้นสูงสุด</label>
  <label class="row"><input type="checkbox" id="yt"> ล้างข้อมูลขวดและการแลกของรางวัล</label>
  <label class="row"><input type="checkbox" id="ymg"> ล้างข้อความฝากบอก (และรูป)</label>
  <label class="row"><input type="checkbox" id="yl"> ล้างประวัติการใช้งาน (Logs)</label>
  <input id="yc" placeholder="พิมพ์ว่า ยืนยัน เพื่อดำเนินการ">
  <button class="btn alt" id="ygo">เริ่มดำเนินการ</button><pre id="yr" style="white-space:pre-wrap"></pre>`;
  document.querySelector('#app .box').appendChild(d);
  $('#bkn').onclick = async () => { const r = await call('backupNow'); if (r) toast('สำรองแล้ว: ' + r.name); };
  $('#ygo').onclick = async () => {
    const r = await call('yearEnd', { confirm: $('#yc').value.trim(), promote: $('#yp').checked, max: $('#ym').value,
      deleteGrad: $('#yd').checked, clearTrash: $('#yt').checked, clearMsg: $('#ymg').checked, clearLogs: $('#yl').checked });
    if (r) {
      $('#yr').textContent = 'เลื่อนชั้น ' + r.promoted + ' คน · ลบบัญชี ' + r.removed + ' คน' + (r.cleared.length ? '\nล้างแล้ว: ' + r.cleared.join(', ') : '');
      $('#yc').value = '';
    }
  };
};
