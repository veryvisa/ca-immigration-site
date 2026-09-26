/* Shared reading list; only public same-origin paths, no personal form data. */
(() => {
  'use strict';
  const site = document.body.dataset.vfSite;
  if (!site) return;
  const key = 'veryvisa-reading-v1';
  const checkKey = `veryvisa-preparation-v1:${site}`;
  const status = document.querySelector('[data-vf-status]');
  const notify = (text) => { if (status) status.textContent = text; };
  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { notify('浏览器无法保存。可使用书签或打印保留本页。'); return false; } };
  const safe = (u) => { try { const p = new URL(u, location.origin); return p.origin === location.origin && !p.search && p.pathname.startsWith('/') && p.pathname !== '/'; } catch { return false; } };
  const saved = () => { const value = read(key, []); return Array.isArray(value) ? value.filter(x => x && typeof x.title === 'string' && safe(x.url)).slice(0, 200) : []; };
  document.querySelectorAll('[data-vf-print]').forEach(b => { b.hidden = false; b.addEventListener('click', () => window.print()); });
  document.querySelectorAll('[data-vf-save]').forEach(b => {
    b.hidden = false;
    const url = location.pathname;
    const refresh = () => { const on = saved().some(x => x.url === url); b.textContent = on ? '已保存 · 点击移除' : '保存本页'; b.setAttribute('aria-pressed', String(on)); };
    refresh();
    b.addEventListener('click', () => {
      let rows = saved(); const on = rows.some(x => x.url === url);
      rows = on ? rows.filter(x => x.url !== url) : [...rows, {url, title:document.querySelector('h1')?.textContent.trim() || document.title, site}];
      if (write(key, rows.slice(-200))) { refresh(); notify(on ? '已从阅读清单移除。' : '已保存到「我的清单」，只保留在本浏览器。'); }
    });
  });
  const list = document.querySelector('[data-vf-saved]');
  const render = () => {
    if (!list) return;
    list.replaceChildren();
    const rows = saved();
    if (!rows.length) { const li = document.createElement('li'); li.textContent = '还没有保存资料。打开需要的页面，点击正文末尾的「保存本页」。'; list.append(li); }
    rows.forEach(row => {
      const li = document.createElement('li'), a = document.createElement('a'), b = document.createElement('button');
      a.href = row.url; a.textContent = row.title;
      b.type = 'button'; b.textContent = '移除'; b.setAttribute('aria-label', `移除 ${row.title}`);
      b.addEventListener('click', () => { if (write(key, saved().filter(x => x.url !== row.url))) render(); });
      li.append(a, b); list.append(li);
    });
  };
  render();
  const checks = [...document.querySelectorAll('[data-vf-check]')];
  const progress = document.querySelector('[data-vf-progress]');
  const initial = read(checkKey, {});
  const report = () => { if(progress) progress.textContent = `已准备 ${checks.filter(c=>c.checked).length} / ${checks.length} 项；勾选不代表获得资格或完成申请。`; };
  checks.forEach(c => { c.checked = initial?.[c.dataset.vfCheck] === true; c.addEventListener('change', () => { const next = Object.fromEntries(checks.map(x=>[x.dataset.vfCheck,x.checked])); if(!write(checkKey,next) && progress) progress.textContent = '本次勾选未能保存，请打印保留。'; else report(); }); });
  report();
  document.querySelectorAll('[data-vf-clear]').forEach(b => { b.hidden=false; b.addEventListener('click', () => { if(write(checkKey, {})){ checks.forEach(c=>c.checked=false); report(); } }); });
  window.addEventListener('storage', e => { if(e.key===key) render(); });
})();
