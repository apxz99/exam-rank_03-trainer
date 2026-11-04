// UI for the Exam Rank 03 trainer: typing practice (ซ้อมพิมพ์) only. Code is
// compiled and tested in examshell, not here; test/verify-all.cjs still builds
// every answer with clang (runner.js) to keep them right.
'use strict';

const $ = s => document.querySelector(s);

// ---------------------------------------------------------------------------
// Storage (per-browser conveniences; everything still works without it)
// ---------------------------------------------------------------------------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};

let current = null;                    // problem object on screen
const byId = id => PROBLEMS.find(p => p.id === id);

// Problems typed through at least once (a best time is stored), any answer set.
function typedSet() {
  const done = new Set();
  try { for (const k of Object.keys(localStorage)) { const m = /^r3:speed:([a-z_]+):/.exec(k); if (m) done.add(m[1]); } } catch (e) { /* no storage */ }
  return done;
}

// ---------------------------------------------------------------------------
// Problem list
// ---------------------------------------------------------------------------
// Level 2 in the order to practise it, easiest first (no label on the page); each builds on the one before:
// powerset (2 calls, no loop) → permutations (+ loop, used[], undo) → tsp (same
// try-every-order with swap, main handed out) → n_queens (+ a rule check) → rip
// (count first, then two rules at once).
const PRACTICE_ORDER = ['powerset', 'permutations', 'tsp', 'n_queens', 'rip'];
const byPractice = (a, b) => (PRACTICE_ORDER.indexOf(a.id) + 1 || 99) - (PRACTICE_ORDER.indexOf(b.id) + 1 || 99);

function renderList() {
  const done = typedSet();
  for (const lvl of [1, 2]) {
    const box = $(`#list${lvl}`);
    box.innerHTML = '';
    for (const p of PROBLEMS.filter(x => x.level === lvl).sort(byPractice)) {
      const b = document.createElement('button');
      b.className = 'prob' + (done.has(p.id) ? ' done' : '') + (current && current.id === p.id ? ' on' : '');
      b.innerHTML = `${p.title}${done.has(p.id) ? '<span class="mark" aria-label="พิมพ์ครบแล้ว">✓</span>' : ''}`;
      b.onclick = () => {
        saveMiss();
        selectProblem(p.id);
        openSpeed();
      };
      box.appendChild(b);
    }
  }
  const n = PROBLEMS.filter(p => done.has(p.id)).length;
  $('#progressText').textContent = `พิมพ์ครบแล้ว ${n}/${PROBLEMS.length}`;
}

function selectProblem(id) {
  const p = byId(id);
  if (!p) return;
  current = p;
  store.set('r3:current', id);
  renderList();
}

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
function dialog(title, html, buttons = [{ label: 'ตกลง', value: 'ok', cls: 'primary' }]) {
  const d = $('#dialog');
  $('#dialogTitle').textContent = title;
  $('#dialogBody').innerHTML = html;
  $('#dialogButtons').innerHTML = buttons.map(b => `<button type="button" class="btn ${{ primary: 'go', danger: 'bad' }[b.cls] || ''}" value="${b.value}">${b.label}</button>`).join('');
  return new Promise(resolve => {
    // Resolve from the click itself: the 'close' event can be delayed while the tab is hidden.
    let done = false;
    const finish = v => { if (!done) { done = true; resolve(v); } };
    for (const b of $('#dialogButtons').children) b.onclick = () => { d.close(b.value); finish(b.value); };
    d.onclose = () => finish(d.returnValue);   // Esc
    d.returnValue = '';
    d.showModal();
  });
}

// Answer sets: the reference (solutions.js), Modey's (solutions-modey.js) and
// short ones (solutions-short.js). The choice is shared by "ดูเฉลย" and ซ้อมพิมพ์.
const SOL_SETS = {
  ref: { label: 'เฉลยหลัก', sol: SOLUTIONS, walk: WALKTHROUGH, about: 'เฉลยหลักของเว็บนี้' },
  modey: { label: 'Modey', sol: SOLUTIONS_MODEY, walk: WALKTHROUGH_MODEY, about: 'เฉลยของ Modey-Codey: แยกเป็นฟังก์ชันเล็ก ๆ อ่านง่าย' },
  short: { label: 'สั้น', sol: SOLUTIONS_SHORT, walk: WALKTHROUGH_SHORT, comments: true, about: 'เฉลยสั้น: โค้ดน้อยที่สุด จำง่าย ใช้แค่ฟังก์ชันที่ subject อนุญาต · มีคอมเมนต์ท้ายบรรทัด (ไม่ต้องพิมพ์)' },
  easy: { label: 'อ่านง่าย', sol: SOLUTIONS_EASY, walk: WALKTHROUGH_EASY, comments: true,
          about: 'เฉลยอ่านง่าย: ฟังก์ชันละหน้าที่ ชื่อบอกหน้าที่ มีคอมเมนต์ท้ายบรรทัด (ไม่ต้องพิมพ์) · level 1 = ชุดสั้น' },
};
const shownSet = k => SOL_SETS[k] && !SOL_SETS[k].hidden;
let solSet = shownSet(store.get('r3:solset', 'modey')) ? store.get('r3:solset', 'modey') : 'modey';
const solOf = id => SOL_SETS[solSet].sol[id];

// "How the two sets differ" for one problem (SOLUTION_DIFF in walkthrough.js).
function diffHtml(id) {
  const d = SOLUTION_DIFF[id];
  if (!d) return '';
  const row = (k, t, on) => `<dt class="${on ? 'on' : ''}">${k}</dt><dd class="${on ? 'on' : ''}">${t.split('\n').map(inlineMd).join('<br>')}</dd>`;
  return `<dl class="solDiff">${row('ทุกชุด', d[0])}` +
    Object.entries(SOL_SETS).map(([k, s], i) => s.hidden ? '' : row(s.label, d[i + 1], solSet === k)).join('') + '</dl>';
}

function setButtons() {
  return Object.entries(SOL_SETS).filter(([, s]) => !s.hidden).map(([k, s]) =>
    `<button type="button" data-set="${k}" class="${k === solSet ? 'on' : ''}" title="${esc(s.about)}">${esc(s.label)}</button>`).join('');
}

function bindSetTabs(root, after) {
  for (const b of root.querySelectorAll('[data-set]')) b.onclick = () => {
    solSet = b.dataset.set;
    store.set('r3:solset', solSet);
    after();
  };
}

// ---------------------------------------------------------------------------
// Thai explanations (thai.txt: "=== id" sections in a small markdown subset)
// ---------------------------------------------------------------------------
let THAI = null;
fetch('thai.txt').then(r => r.ok ? r.text() : '').then(t => {
  THAI = {};
  for (const part of t.replace(/\r\n/g, '\n').split(/^=== /m).slice(1)) {
    const nl = part.indexOf('\n');
    THAI[part.slice(0, nl).trim()] = part.slice(nl + 1);
  }
  if (current) renderUmpire();
}).catch(() => { THAI = {}; });

function inlineMd(t) {
  return esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

function mdToHtml(src) {
  const out = [];
  let list = null, code = null;
  const flush = () => { if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; } };
  for (const line of src.split('\n')) {
    if (line.startsWith('```')) {
      if (code) { out.push('<pre class="out">' + esc(code.join('\n')) + '</pre>'); code = null; }
      else { flush(); code = []; }
      continue;
    }
    if (code) { code.push(line); continue; }
    if (line.startsWith('## ')) { flush(); out.push('<h3>' + inlineMd(line.slice(3)) + '</h3>'); }
    else if (line.startsWith('- ')) { (list = list || []).push('<li>' + inlineMd(line.slice(2)) + '</li>'); }
    else if (/^\s+\S/.test(line) && list) {
      // indented line = continuation of the previous bullet
      list[list.length - 1] = list[list.length - 1].replace(/<\/li>$/, '<br>' + inlineMd(line.trim()) + '</li>');
    }
    else if (line.trim() === '') flush();
    else { flush(); out.push('<p>' + inlineMd(line) + '</p>'); }
  }
  flush();
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Reset the whole site (best times, weak lines, settings in this browser)
// ---------------------------------------------------------------------------
$('#resetAllBtn').onclick = async () => {
  const v = await dialog('รีเซ็ตเว็บทั้งหมด?',
    '<p>ลบทุกอย่างที่เว็บเก็บไว้ในเบราว์เซอร์นี้: เวลาที่ดีที่สุด, บรรทัดที่เคยพิมพ์ผิด และการตั้งค่า แล้วโหลดหน้าใหม่ — ย้อนกลับไม่ได้</p>',
    [{ label: 'ยกเลิก', value: 'no' }, { label: 'รีเซ็ตทั้งหมด', value: 'yes', cls: 'danger' }]);
  if (v !== 'yes') return;
  try { Object.keys(localStorage).filter(k => k.startsWith('r3:')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* no storage */ }
  location.reload();
};

// ---------------------------------------------------------------------------
// Typing practice (ซ้อมพิมพ์): type an answer for muscle memory, with a note on
// whatever section the caret is in (walkthrough.js).
// A real textarea (backspace, arrows, selection, undo all work) lies on top of
// a <pre> that paints what's typed plus the rest of the answer as ghost text.
// Checking is per line: typed line i is compared with answer line i, and only
// lines above the caret's line are marked — the line being typed is left
// alone, so a bracket left open for a moment isn't flagged.
// Ghost: show / half (about half the words hidden at random, new draw every
// round; punctuation always shown) / hide; in half
// and hide, Ctrl+/ peeks at the next word, pressed again the rest of the line.
// One section can be drilled on its own. Lines left wrong are remembered for
// the last few rounds, so weak sections are marked in the list.
// A flowchart of the function being typed (flow.js) fills in as lines are reached.
// ---------------------------------------------------------------------------
const sp = { text: '', lines: [], del: [], add: [], cmt: [], file: null, drill: null, start: 0, end: 0, timer: null,
             mistakes: 0, keys: 0, hints: 0, secs: [], all: [], checked: {}, roundMiss: {} };
const spInput = $('#speedInput');
const spCode = $('#speedCode');
const spScroll = $('#speedScroll');
const GHOST = { show: 'เห็นเฉลย', half: 'ครึ่งเดียว', hide: 'ซ่อนเฉลย' };
const NEXT_GHOST = { show: 'half', half: 'hide' };
const MISS_ROUNDS = 5;

// A space typed where the answer has a tab (between type and name) counts as right.
// Whitespace doesn't count: tabs or spaces, how many, spaces around ( = + ;
// all fine. Only a gap between two words (int c) has to be there.
// Text inside "..." and '...' is kept as is (printf(" ") is not printf("")).
const squash = l => l.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/)
  .map((part, k) => k % 2 ? part : part.replace(/\s+/g, ' ').replace(/ (?=\W)|(?<=\W) /g, ''))
  .join('').trim();
const lineSame = (got, want) => want !== undefined && squash(got) === squash(want);
const isWs = c => c === ' ' || c === '\t';
const nonWs = t => t.replace(/\s/g, '').length;

// Match the typed line against the answer line skipping whitespace on both
// sides. Returns how far each got: i in the typed text, j in the answer.
function walk(got, want = '') {
  let i = 0, j = 0;
  for (;;) {
    while (i < got.length && isWs(got[i])) i++;
    if (i >= got.length) break;
    while (j < want.length && isWs(want[j])) j++;
    if (j >= want.length || got[i] !== want[j]) break;
    i++; j++;
  }
  if (i > 0 && isWs(got[i - 1])) while (j < want.length && isWs(want[j])) j++;
  return { i, j };
}
const isWord = c => /[A-Za-z0-9_]/.test(c || '');

function openSpeed() {
  if (!current) return;
  const files = Object.keys(solOf(current.id)).filter(f => f.endsWith('.c'));
  $('#speedTitle').textContent = current.title;
  $('#speedSet').innerHTML = setButtons();
  $('#tourDiff').innerHTML = diffHtml(current.id);
  bindSetTabs($('#speedSet'), openSpeed);
  $('#speedFiles').innerHTML = files.length > 1
    ? files.map(f => `<button data-f="${f}">${f}</button>`).join('') : `<code>${files[0]}</code>`;
  for (const b of $('#speedFiles').querySelectorAll('button')) b.onclick = () => { saveMiss(); loadSpeed(b.dataset.f); };
  setGhost(store.get('r3:ghost', store.get('r3:noghost', false) ? 'hide' : 'show'));
  $('#speed').hidden = false;
  loadSpeed(files[0]);
  renderUmpire();
}

// Right panel: the problem laid out as UMPIRE (BRIEF + UMPIRE in walkthrough.js),
// with the subject and the Thai note folded on top. Redrawn when the problem or
// the answer set changes (Plan has steps per set).
// Interactive algorithm explanations, opened from the UMPIRE panel.
const ANIM = {
  powerset: { title: 'powerset · เลือกชุดย่อยให้ผลรวมเป็นเป้าหมาย' },
  permutations: { title: 'permutations · สร้างทุกลำดับด้วย backtracking' },
  n_queens: { title: 'n_queens · วางควีนโดยไม่ให้โจมตีกัน' },
  rip: { title: 'rip · ลบวงเล็บให้น้อยที่สุด' },
};
function openAnim(id) {
  const a = ANIM[id];
  if (!a) return;
  $('#animTitle').textContent = a.title;
  const isPowersetVideo = id === 'powerset';
  $('#anim').classList.toggle('videoPlayer', isPowersetVideo);
  $('#animFrame').hidden = !isPowersetVideo;
  if (isPowersetVideo) {
    $('#animFrame').src = 'assets/animations/powerset-backtracking.html';
    $('#animFrame').onload = () => { try { $('#animFrame').contentWindow.focus(); } catch (e) {} };
  }
  else AlgorithmMotion.open(id);
  $('#anim').showModal();
}
function closeAnim() {
  $('#anim').close();
  $('#anim').classList.remove('videoPlayer');
  $('#animFrame').src = 'about:blank';
  AlgorithmMotion.close();
}

function renderUmpire() {
  const b = BRIEF[current.id];
  const el = $('#umPanel');
  if (!b) { el.innerHTML = ''; return; }
  const steps = (b.by && b.by[solSet]) || b.steps;
  const u = UMPIRE[current.id];
  const li = t => `<li>${inlineMd(t)}</li>`;
  // An example run: the command, then its output cat -e style ($ = end of line).
  const run = ([cmd, out, code]) => `<pre class="out um-ex"><span class="um-cmd">$ ${esc(cmd)}</span>\n` +
    (out ? out.replace(/\n$/, '').split('\n').map(l => esc(l) + '<span class="eol">$</span>').join('\n')
         : '<span class="um-none">(ไม่พิมพ์อะไร)</span>') +
    (code ? `\n<span class="um-none">exit ${code}</span>` : '') + '</pre>';
  const sec = (k, name, body) => `<section class="um"><h4><b>${k}</b>${name}</h4>${body}</section>`;
  el.innerHTML = `<div class="k">UMPIRE · ${esc(SOL_SETS[solSet].label)}</div>
    <h3>${esc(current.title)} ต้องทำอะไร</h3>` +
    (ANIM[current.id] ? `<button class="btn umAnim" id="umAnim"><svg class="ic" aria-hidden="true"><use href="#i-play"/></svg>ดูภาพเคลื่อนไหว</button>` : '') +
    `<details class="um-doc"><summary>Subject (ต้นฉบับ)</summary><pre class="out">${esc(EXAM_RESOURCES.subjects[current.id])}</pre></details>` +
    (THAI && THAI[current.id] ? `<details class="um-doc"><summary>อธิบายภาษาไทย</summary><div class="um-thai">${mdToHtml(THAI[current.id])}</div></details>` : '') +
    sec('U', 'Understand · เข้าใจโจทย์', `<p>${inlineMd(b.goal)}</p><p class="io">${inlineMd(b.io)}</p>` +
      (u ? `<p class="um-sub">ตัวอย่าง (ผลจริงจากเฉลย)</p>${u.ex.map(run).join('')}<p class="um-sub">กรณีขอบ</p><ul>${u.edge.map(li).join('')}</ul>` : '')) +
    (u ? sec('M', 'Match · จับแพทเทิร์น', `<p><b>${esc(u.match)}</b></p><dl class="um-q">` +
      u.mq.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${inlineMd(a)}</dd>`).join('') + '</dl>') : '') +
    sec('P', 'Plan · ขั้นตอน', `<ol>${steps.map(li).join('')}</ol>`) +
    (u ? sec('I', 'Implement · เขียนทีละชั้น รันทุกชั้น', `<ol>${u.layers.map(li).join('')}</ol>`) +
      sec('R', 'Review · ไล่ด้วยมือ + จุดที่พลาดบ่อย', `<ul>${u.review.map(li).join('')}</ul>`) +
      sec('E', 'Evaluate · ทดสอบก่อนส่ง', `<pre class="out um-ex"><span class="um-cmd">$ ${esc(u.build)}</span></pre>` +
        (u.main ? `<p class="io">${inlineMd(u.main)}</p>` : '') +
        '<p class="io">รันตัวอย่างทุกอันในข้อ U ให้ผลตรง → ลองกรณีขอบ → push → grademe</p>') : '');
  if ($('#umAnim')) $('#umAnim').onclick = () => openAnim(current.id);   // plays in a dialog on this page
  el.scrollTop = 0;
}

function setGhost(g) {
  if (!GHOST[g]) g = 'show';
  sp.ghost = g;
  $('#speedEditor').classList.toggle('g-half', g === 'half');
  $('#speedEditor').classList.toggle('g-hide', g === 'hide');
  for (const b of $('#spGhostMode').querySelectorAll('button')) b.classList.toggle('on', b.dataset.g === g);
  $('#spHint').hidden = g === 'show';
  $('#spHideLevel').hidden = g !== 'half';
  for (const b of $('#spHideLevel').querySelectorAll('button')) b.classList.toggle('on', +b.dataset.h === hideLevel());
  store.set('r3:ghost', g);
}

// Split the answer into sections: [{ line, lineEnd, title, note }] (1-based lines).
function sections(id, text) {
  const notes = SOL_SETS[solSet].walk[id] || [];
  const lines = text.split('\n');
  const out = [];
  let from = 0;
  for (const [anchor, title, note] of notes) {
    const i = lines.findIndex((l, j) => j >= from && l.includes(anchor));
    if (i < 0) continue;
    out.push({ line: out.length ? i + 1 : 1, title, note });
    from = i + 1;
  }
  out.forEach((sec, k) => {
    // last line of the section, not counting the blank lines before the next one
    let last = k + 1 < out.length ? out[k + 1].line - 1 : lines.length;
    while (last > sec.line && !lines[last - 1].trim()) last--;
    sec.lineEnd = last;
  });
  return out;
}

const missKey = () => `r3:miss:${current.id}:${solSet}:${sp.file}`;

// Lines left wrong in this round → history (absolute line numbers, last few rounds).
function saveMiss() {
  if (!sp.file || !sp.keys) return;
  checkLines(true);
  const base = sp.drill === null ? 0 : sp.all[sp.drill].line - 1;
  const round = {};
  for (const [i, n] of Object.entries(sp.roundMiss)) round[+i + base + 1] = n;
  store.set(missKey(), [round, ...store.get(missKey(), [])].slice(0, MISS_ROUNDS));
  sp.keys = 0;
}

function weakness(sec) {
  let n = 0;
  for (const round of store.get(missKey(), []))
    for (const [line, c] of Object.entries(round)) if (+line >= sec.line && +line <= sec.lineEnd) n += c;
  return n;
}

// Lines of the answer that are already in the file the exam hands out
// (ft_scanf, broken_gnl, tsp): matched with a line-level LCS, whitespace
// ignored; #include lines in any order. A bare brace / blank line only counts
// when it sits next to a given line, so a `}` of the student's own code is never
// taken for the skeleton's.
function givenMask(answer, handed) {
  const norm = l => l.replace(/\s+/g, ' ').trim();
  const a = answer.split('\n').map(norm), b = (handed || '').split('\n').map(norm);
  const mask = a.map(() => false);
  if (!handed) return mask;
  const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { mask[i] = true; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  // #include lines count wherever they are: answers may list them in another order.
  a.forEach((l, i) => { if (l.startsWith('#include') && b.includes(l)) mask[i] = true; });
  const trivial = i => /^[{}]?;?$/.test(a[i]);
  const solid = mask.map((m, i) => m && !trivial(i));
  const near = (i, d) => { for (let k = i + d; k >= 0 && k < a.length; k += d) if (a[k] !== '') return solid[k]; return false; };
  return mask.map((m, i) => m && (!trivial(i) || near(i, -1) || near(i, 1)));
}

// Skeleton mode (a handed-out file): the page opens with the whole file, the
// handed-out lines in place and every line the student writes left as just its
// indentation. While the line count still matches the answer, Enter / Backspace
// move between those gaps instead of adding or joining lines.
const skeleton = () => sp.hasGiven && spInput.value.split('\n').length === sp.lines.length;
const indentOf = l => (l || '').match(/^[\t ]*/)[0];
// A gap: a line to write, or (fix in place) a line still to delete.
const toGap = (from, step) => {
  const vl = spInput.value.split('\n');
  for (let j = from; j >= 0 && j < sp.lines.length; j += step)
    if ((!sp.given[j] && sp.lines[j].trim()) || (sp.del[j] && (vl[j] || '').trim())) return j;
  return -1;
};

// Answers that fix the handed-out file in place (broken_gnl, เฉลยหลัก / สั้น) are
// typed as a line diff of it: kept lines are there from the start (grey), lines
// to delete are there too but marked (the student deletes them), lines to add
// are gaps. A deleted line becomes an empty line, so the line count never changes.
const FIX_IN_PLACE = { broken_gnl: ['ref', 'short', 'easy'] };

// A line split into code and its trailing // comment (not one inside quotes).
function splitComment(l) {
  let q = null;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '/' && l[i + 1] === '/') return [l.slice(0, i).replace(/\s+$/, ''), l.slice(i)];
  }
  return [l, ''];
}

function fixRows(handed, answer) {
  const a = handed.replace(/\n$/, '').split('\n'), b = answer.split('\n');
  const n = a.length, m = b.length, sa = a.map(squash), sb = b.map(squash);
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = sa[i] === sb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const rows = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && sa[i] === sb[j]) { rows.push({ t: 'keep', text: b[j] }); i++; j++; }
    else if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) rows.push({ t: 'del', text: a[i++] });
    else rows.push({ t: 'add', text: b[j++] });
  }
  return rows;
}

function caretToLineEnd(j) {
  const vl = spInput.value.split('\n');
  let o = 0;
  for (let i = 0; i < j; i++) o += vl[i].length + 1;
  spInput.selectionStart = spInput.selectionEnd = o + vl[j].length;
  onSpeedCaret(true);
}

function loadSpeed(file, drill = null) {
  clearInterval(sp.timer);
  const answer = solOf(current.id)[file].replace(/\r/g, '');
  const handed = current.files && current.files[file];
  const fix = handed && (FIX_IN_PLACE[current.id] || []).includes(solSet) ? fixRows(handed, answer) : null;
  let full = fix ? fix.map(r => r.t === 'del' ? '' : r.text).join('\n') : answer;
  // Answer sets with comments (สั้น, อ่านง่าย): comments are shown, never typed. Lines
  // of the handed-out file stay as they are.
  let cmt = [];
  if (SOL_SETS[solSet].comments) {
    const kept = new Set((handed || '').split('\n'));
    const parts = full.split('\n').map(l => kept.has(l) ? [l, ''] : splitComment(l));
    cmt = parts.map(p => p[1]);
    full = parts.map(p => p[0]).join('\n');
  }
  const all = sections(current.id, full);
  let text = full, secs = all;
  if (drill !== null && all[drill]) {
    const s = all[drill];
    text = full.split('\n').slice(s.line - 1, s.lineEnd).join('\n');
    secs = [{ ...s, line: 1, lineEnd: s.lineEnd - s.line + 1 }];
  } else drill = null;
  let given = fix ? fix.map(r => r.t === 'keep') : givenMask(full, handed);
  let del = fix ? fix.map(r => r.t === 'del') : [];
  let old = fix ? fix.map(r => r.text) : [];
  if (drill !== null) {
    const [a, b] = [all[drill].line - 1, all[drill].lineEnd];
    [given, del, old, cmt] = [given.slice(a, b), del.slice(a, b), old.slice(a, b), cmt.slice(a, b)];
  }
  if (!del.some(Boolean) && given.every((g, i) => g || !text.split('\n')[i].trim())) given = given.map(() => false);   // nothing left to type
  Object.assign(sp, { file, drill, text, lines: text.split('\n'), given, del, cmt, add: fix ? text.split('\n').map((l, i) => !given[i] && !del[i] && !!l.trim()) : [], secs, all, start: 0, end: 0, mistakes: 0, keys: 0,
                      hints: 0, peekLine: -1, peekTo: 0, seed: (Math.random() * 2 ** 32) >>> 0, checked: {}, roundMiss: {}, caretLine: -1, shown: -1,
                      base: drill === null ? 0 : all[drill].line - 1,
                      flow: resolveFlow((FLOWS[solSet] || {})[current.id], full).filter(c => c.line >= 0),
                      flowSeen: new Set(), flowCur: null, flowOn: null, flowPin: null });
  for (const b of $('#speedFiles').querySelectorAll('button')) b.classList.toggle('on', b.dataset.f === file);
  $('#speedDone').hidden = true;
  $('#spWhole').hidden = drill === null;
  $('#tourListHead').textContent = drill === null ? 'ส่วนของโค้ด · ⌨ ซ้อมทีละส่วน' : 'ซ้อมเฉพาะส่วน — กดส่วนอื่นเพื่อเปลี่ยน';
  $('#tourSecs').open = drill !== null;
  spInput.readOnly = false;
  // Handed-out file: start from the whole skeleton (gaps = indentation only).
  // Otherwise start empty, on the first line's indentation.
  sp.hasGiven = sp.given.some(Boolean);
  spInput.value = sp.hasGiven ? sp.lines.map((l, i) => sp.given[i] ? l : del[i] ? old[i] : indentOf(l)).join('\n') : indentOf(sp.lines[0]);
  spInput.selectionStart = spInput.selectionEnd = 0;   // not at the end of a prefilled skeleton
  sp.maxCaret = 0;
  $('#tourList').innerHTML = all.map(s => {
    const w = weakness(s);
    return `<li><span class="m"></span><span class="t">${esc(s.title)}</span>` +
      (w ? `<span class="weak" title="บรรทัดที่พิมพ์ผิดในส่วนนี้ ${MISS_ROUNDS} รอบล่าสุด">ผิด ${w}</span>` : '') +
      `<span class="ln">${lineRange(s)}</span><button class="iconBtn drill" title="ซ้อมเฉพาะส่วนนี้"><svg class="ic" aria-hidden="true"><use href="#i-keyboard"/></svg></button></li>`;
  }).join('');
  $('#tourList').querySelectorAll('li').forEach((li, k) => {
    li.onclick = () => {
      if (sp.drill !== null) { saveMiss(); loadSpeed(file, k); return; }
      scrollToLine(all[k].line);
      spInput.focus({ preventScroll: true });
    };
    li.querySelector('.drill').onclick = e => { e.stopPropagation(); saveMiss(); loadSpeed(file, k); };
  });
  spScroll.scrollTop = spScroll.scrollLeft = 0;
  renderSpeed();
  speedStats();
  spInput.focus();
  spInput.selectionStart = spInput.selectionEnd = spInput.value.length;
  if (sp.hasGiven && toGap(0, 1) >= 0) caretToLineEnd(toGap(0, 1));
}

const caretLine = () => spInput.value.slice(0, spInput.selectionEnd).split('\n').length - 1;

// Line-level diff of a typed line against the answer line (whitespace skipped,
// LCS over the remaining characters). cls[k] says how to paint typed char k:
// 'ok', 'bad' (extra / wrong), plus ' miss' when answer chars are missing just
// before it, ' missEnd' when they are missing after the last one.
function align(got, want) {
  const gi = [], wi = [];
  for (let k = 0; k < got.length; k++) if (!isWs(got[k])) gi.push(k);
  for (let k = 0; k < want.length; k++) if (!isWs(want[k])) wi.push(k);
  const n = gi.length, m = wi.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = got[gi[i]] === want[wi[j]] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const cls = [...got].map(() => 'ok');
  let bad = 0, miss = 0, i = 0, j = 0;
  while (i < n && j < m) {
    if (got[gi[i]] === want[wi[j]]) { i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { cls[gi[i]] = 'bad'; bad++; i++; }
    else { if (!cls[gi[i]].includes('miss')) cls[gi[i]] += ' miss'; miss++; j++; }
  }
  for (; i < n; i++) { cls[gi[i]] = 'bad'; bad++; }
  if (j < m) { miss += m - j; if (n) cls[gi[n - 1]] += ' missEnd'; }
  return { cls, bad, miss };
}

function diffCount(got, want) {
  if (want === undefined) return nonWs(got);
  if (lineSame(got, want)) return 0;
  const { bad, miss } = align(got, want);
  return Math.max(1, bad + miss);
}

// Mark lines above the caret line as checked; a line left wrong counts its
// wrong chars as mistakes once (again only if it is changed and still wrong).
function checkLines(all = false) {
  const vl = spInput.value.split('\n');
  const upto = all ? vl.length : Math.min(caretLine(), vl.length);
  for (let i = 0; i < upto; i++) {
    if (sp.checked[i] === vl[i] || sp.del[i]) continue;
    sp.checked[i] = vl[i];
    const n = diffCount(vl[i], sp.lines[i]);
    if (n) { sp.mistakes += n; sp.roundMiss[i] = (sp.roundMiss[i] || 0) + 1; }
  }
}

function spans(text, cls) { return text ? `<span class="${cls}">${esc(text)}</span>` : ''; }

// Typed line checked against the answer line: only the wrong characters are
// red; a thin red mark shows where characters are missing.
function markLine(got, want) {
  if (want === undefined) return spans(got, 'bad');
  if (lineSame(got, want)) return spans(got, 'ok');
  const { cls } = align(got, want);
  let html = '', run = '', key = null;
  for (let k = 0; k < got.length; k++) {
    if (cls[k] !== key) { html += spans(run, key); run = ''; key = cls[k]; }
    run += got[k];
  }
  return html + spans(run, key);
}

// Where the ghost of line i continues: after the matched part of the answer
// when everything typed so far is right, else under the typed text.
function ghostFrom(got, want) {
  const w = walk(got, want);
  return w.i >= got.length ? w.j : got.length;
}

// How many words half mode hides, in percent (buttons next to the ghost modes).
const HIDE_LEVELS = [30, 50, 70, 90];
const hideLevel = () => { const v = store.get('r3:hide', 70); return HIDE_LEVELS.includes(v) ? v : 70; };

// Is the word starting at (line, col) one of this round's hidden ones? A
// hash of the round's seed and the position, so it stays put while typing.
function draw(line, col, salt) {
  let h = (sp.seed ^ salt ^ (line * 7919 + col * 104729)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) % 100;
}
// Same seed, so a higher level only adds to what is hidden.
const wordHidden = (line, col) => draw(line, col, 0) < hideLevel();
// In the words left visible, letters after the first go missing too (half as often).
const letterHidden = (line, col) => draw(line, col, 0x9e3779b9) < hideLevel() / 2;

// Rest of answer line i from column `from`. In half mode the words picked by
// wordHidden are hidden, and some letters of the others (class hid); the
// peeked part is always shown.
function ghostLine(i, from) {
  const want = sp.lines[i];
  if (want === undefined || from >= want.length) return '';
  let html = '', run = '', key = null, start = -1;
  for (let c = 0; c < from; c++) if (isWord(want[c]) && !isWord(want[c - 1])) start = c;
  for (let c = from; c < want.length; c++) {
    if (isWord(want[c]) && !isWord(want[c - 1])) start = c;
    const k = (isWord(want[c]) && (wordHidden(i, start) || (c > start && letterHidden(i, c))) ? 'hid' : '') + (i === sp.peekLine && c < sp.peekTo ? ' peek' : '');
    if (k !== key) { html += run ? (key ? spans(run, key) : esc(run)) : ''; run = ''; key = k; }
    run += want[c];
  }
  html += run ? (key ? spans(run, key) : esc(run)) : '';
  return `<span class="gh">${html}</span>`;
}

function renderSpeed() {
  const vl = spInput.value.split('\n'), tl = sp.lines, cl = caretLine();
  const n = Math.max(vl.length, tl.length);
  let html = '';
  for (let i = 0; i < n; i++) {
    const got = i < vl.length ? vl[i] : '';
    html += sp.del[i] ? (got.trim() ? spans(got, 'del') : '')
          : sp.given[i] && got === tl[i] ? spans(got, 'gv') : i < cl ? markLine(got, tl[i]) : spans(got, 'ok');
    html += ghostLine(i, ghostFrom(got, tl[i]));
    if (sp.cmt[i]) html += `<span class="cmt">  ${esc(sp.cmt[i])}</span>`;   // shown, not typed
    if (i < n - 1) html += i >= vl.length - 1 && i < tl.length - 1 ? '<span class="nl">↵</span>\n' : '\n';
  }
  spCode.innerHTML = html + '\n';
  sp.lastValue = spInput.value;
  sp.caretLine = cl;
  sp.maxCaret = Math.max(sp.maxCaret || 0, cl);
  renderGutter(vl, cl);
  renderTour();
}

const lineRange = s => s.lineEnd > s.line ? `${s.line}–${s.lineEnd}` : `${s.line}`;

// Line numbers (absolute, also in a drill); the current section's lines are
// brighter, checked lines that are wrong are red.
function renderGutter(vl, cl) {
  const base = sp.drill === null ? 0 : sp.all[sp.drill].line - 1;
  const sec = sp.secs[sectionAt(cl)];
  let html = '';
  for (let i = 0; i < Math.max(sp.lines.length, vl.length); i++) {
    const cls = sp.del[i] ? ((vl[i] || '').trim() ? 'gdel' : '')
              : i < cl && i < vl.length && !lineSame(vl[i], sp.lines[i]) ? 'err'
              : sp.add[i] ? 'gadd'
              : sec && i + 1 >= sec.line && i + 1 <= sec.lineEnd ? 'sec' : '';
    html += cls ? `<span class="${cls}">${base + i + 1}</span>\n` : `${base + i + 1}\n`;
  }
  $('#speedGutter').innerHTML = html;
}

const spMetrics = () => {
  const cs = getComputedStyle(spInput);
  return { lh: parseFloat(cs.lineHeight), top: parseFloat(cs.paddingTop), left: parseFloat(cs.paddingLeft) };
};

function scrollToLine(line) {
  const { lh } = spMetrics();
  spScroll.scrollTo({ top: Math.max(0, (line - 3) * lh), behavior: 'smooth' });
}

// The textarea never scrolls itself, so keep the caret in view by scrolling the area.
function followCaret() {
  const { lh, top, left } = spMetrics();
  const before = spInput.value.slice(0, spInput.selectionEnd).split('\n');
  const y = top + (before.length - 1) * lh;
  const col = before[before.length - 1].replace(/\t/g, '    ').length;
  const x = $('#speedGutter').offsetWidth + left + col * (spMetrics.ch || (spMetrics.ch = charWidth()));
  const view = spScroll.clientHeight, gut = $('#speedGutter').offsetWidth;
  if (y < spScroll.scrollTop + lh) spScroll.scrollTop = Math.max(0, y - 2 * lh);
  else if (y + 2 * lh > spScroll.scrollTop + view) spScroll.scrollTop = y + 3 * lh - view;
  if (x < spScroll.scrollLeft + gut + 20) spScroll.scrollLeft = Math.max(0, x - gut - 60);
  else if (x + 20 > spScroll.scrollLeft + spScroll.clientWidth) spScroll.scrollLeft = x + 60 - spScroll.clientWidth;
}

function charWidth() {
  const s = document.createElement('span');
  s.textContent = 'x'.repeat(100);
  spCode.appendChild(s);
  const w = s.getBoundingClientRect().width / 100;
  s.remove();
  return w;
}

// Index into sp.secs of the section holding (0-based) line cl.
function sectionAt(cl) {
  let k = 0;
  while (k + 1 < sp.secs.length && sp.secs[k + 1].line <= cl + 1) k++;
  return k;
}

const secDone = (s, vl) => { for (let l = s.line; l <= s.lineEnd; l++) if (!lineSame(vl[l - 1] ?? '', sp.lines[l - 1])) return false; return true; };

// Flowchart of the function the caret is in. With the answer shown (show /
// half) the whole chart is drawn faint from the start and boxes brighten as
// their line is reached, so the picture stays put and can be memorised; in
// hide mode only reached boxes are drawn. The box at the caret is lit.
// Clicking a function name above the chart previews that chart.
function renderFlow() {
  const el = $('#tourFlow');
  $('#tourFlowHead').hidden = el.hidden = !sp.flow.length;
  if (!sp.flow.length) return;
  const full = sp.ghost !== 'hide';
  $('#tourFlowHead').textContent = full ? 'แผนผัง — ส่วนที่พิมพ์แล้วจะชัดขึ้น' : 'แผนผัง — ขึ้นตามที่พิมพ์';
  // last line reached (0-based, whole file): the furthest the caret has been in skeleton mode
  const reach = sp.base + (sp.hasGiven ? sp.maxCaret : spInput.value.split('\n').length - 1);
  const caret = sp.base + caretLine();
  const list = full ? sp.flow : sp.flow.filter(c => c.line <= reach);
  if (!list.length) { el.innerHTML = '<p class="fl-empty">แผนผังจะค่อย ๆ ขึ้นตามที่พิมพ์</p>'; return; }
  const atCaret = list.find(c => caret >= c.line && caret <= c.end) || null;
  if (sp.flowPin && (atCaret !== sp.flowPinAt || !list.includes(sp.flowPin))) sp.flowPin = null;
  const cur = sp.flowPin || atCaret || (list.includes(sp.flowCur) ? sp.flowCur : full ? list[0] : list[list.length - 1]);
  sp.flowCur = cur;
  let active = null;
  if (cur === atCaret) {
    const visit = ns => ns.forEach(n => {
      if (n.line >= 0 && n.line <= reach && n.line <= caret) active = n;
      visit(n.yes || []); visit(n.no || []); visit(n.body || []);
    });
    visit(cur.nodes);
  }
  const fresh = [];
  const node = n => {
    const reached = n.line >= 0 && n.line <= reach;
    if (!reached && !full) return '';
    const key = `${cur.line}:${n.line}:${n.text}`;
    if (reached && !sp.flowSeen.has(key)) fresh.push(key);
    const cls = !reached ? ' fl-dim' : (n === active ? ' fl-on' : '') + (sp.flowSeen.has(key) ? '' : ' fl-new');
    const box = (k, pre) => `<div class="fl-${k}${cls}">${pre}${inlineMd(n.text)}</div>`;
    if (n.t === 'if') {
      const yes = seq(n.yes), no = seq(n.no);
      return '<div class="fl-if">' + box('q', '◇ ') + (yes || no ? '<div class="fl-br">' +
        (yes ? `<div class="fl-arm"><span class="fl-l">ใช่</span>${yes}</div>` : '') +
        (no ? `<div class="fl-arm"><span class="fl-l">ไม่</span>${no}</div>` : '') + '</div>' : '') + '</div>';
    }
    if (n.t === 'loop') { const b = seq(n.body); return '<div class="fl-loop">' + box('q', '↺ ') + (b ? `<div class="fl-body">${b}</div>` : '') + '</div>'; }
    return n.t === 'c' ? box('s fl-c', '↻ ') : box(n.t === 'r' ? 'r' : 's', '');
  };
  const seq = ns => { const parts = ns.map(node).filter(Boolean); return parts.length ? `<div class="fl-seq">${parts.join('')}</div>` : ''; };
  const chart = seq(cur.nodes);
  el.innerHTML = '<div class="fl-chips">' + list.map(c =>
    `<button type="button" data-k="${sp.flow.indexOf(c)}" class="${c === cur ? 'on' : c.line > reach ? 'dim' : ''}" title="ดูแผนผังของ ${esc(c.title)}">${esc(c.title)}</button>`).join('') + '</div>' +
    (chart || '<p class="fl-empty">เริ่มฟังก์ชัน ' + esc(cur.title) + '…</p>');
  fresh.forEach(k => sp.flowSeen.add(k));
  if (active && active !== sp.flowOn) { const on = el.querySelector('.fl-on'); if (on) on.scrollIntoView({ block: 'nearest' }); }
  sp.flowOn = active;
}

// Explain the section the caret is in; tick sections typed correctly.
function renderTour() {
  if (!sp.secs.length) { $('#tourNow').innerHTML = ''; return; }
  const vl = spInput.value.split('\n');
  const k = sectionAt(caretLine());
  const at = sp.drill === null ? k : sp.drill;
  $('#tourList').querySelectorAll('li').forEach((li, i) => {
    const done = sp.drill === null ? secDone(sp.secs[i], vl) : i === sp.drill && secDone(sp.secs[0], vl);
    li.classList.toggle('now', i === at);
    li.classList.toggle('done', done && i !== at);
    li.querySelector('.m').textContent = done ? '✓' : i === at ? '›' : '';
  });
  if (sp.shown === at) return;
  sp.shown = at;
  const s = sp.all[at];
  $('#tourNow').innerHTML = `<div class="k">ส่วนที่ ${at + 1} / ${sp.all.length} · บรรทัด ${lineRange(s)}</div><h3>${inlineMd(s.title)}</h3>` +
    s.note.split('\n').map(l => `<p>${inlineMd(l)}</p>`).join('');
}

function progress() {
  const vl = spInput.value.split('\n');
  let ok = 0;
  sp.lines.forEach((want, i) => {
    const got = vl[i] ?? '';
    if (lineSame(got, want)) { ok += want.length + 1; return; }
    ok += walk(got, want).j;
  });
  return Math.min(100, Math.floor((100 * ok) / (sp.text.length + 1)));
}

// Done when every line matches (the answer's final empty line is optional).
function allDone() {
  const vl = spInput.value.split('\n'), tl = sp.lines;
  const need = tl.length > 1 && tl[tl.length - 1] === '' ? tl.length - 1 : tl.length;
  if (vl.length < need || vl.length > tl.length || (vl.length > need && vl[need] !== '')) return false;
  for (let i = 0; i < need; i++) if (!lineSame(vl[i], tl[i])) return false;
  return true;
}

function speedStats() {
  const ms = sp.start ? (sp.end || Date.now()) - sp.start : 0;
  const m = Math.floor(ms / 60000), sec = (ms / 1000) % 60;
  $('#spTime').textContent = `${m}:${sec.toFixed(1).padStart(4, '0')}`;
  $('#spProg').textContent = progress() + '%';
  $('#spErr').textContent = sp.mistakes;
}

function onSpeedInput(e) {
  if (sp.end) return;
  if (!sp.start) { sp.start = Date.now(); sp.timer = setInterval(speedStats, 200); }
  if (e && e.inputType && e.inputType.startsWith('insert')) sp.keys++;
  sp.peekLine = -1;
  checkLines();
  renderSpeed();
  speedStats();
  followCaret();
  if (allDone()) finishSpeed();
}

// Caret moved without typing: the checked/unchecked boundary may have moved.
function onSpeedCaret(scroll) {
  if (spInput.value !== sp.lastValue) { onSpeedInput(null); return; }
  if (caretLine() !== sp.caretLine) { sp.peekLine = -1; checkLines(); renderSpeed(); speedStats(); }
  else renderTour();
  if (scroll) followCaret();
}

// Ctrl+/ (half / hide): show the next word of the answer; again → rest of the line.
function peekHint() {
  if (sp.ghost === 'show' || sp.end) return;
  const vl = spInput.value.split('\n');
  let line = caretLine(), from = ghostFrom(vl[line] || '', sp.lines[line]);
  if (sp.lines[line] === undefined) return;
  if (from >= sp.lines[line].length) { line++; from = 0; }          // line finished → hint the next one
  const want = sp.lines[line];
  if (want === undefined) return;
  if (sp.peekLine === line && sp.peekTo > from && sp.peekTo < want.length) sp.peekTo = want.length;
  else {
    let j = from;
    while (j < want.length && /\s/.test(want[j])) j++;
    while (j < want.length && !/\s/.test(want[j])) j++;
    sp.peekTo = j;
  }
  sp.peekLine = line;
  sp.hints++;
  renderSpeed();
  spInput.focus();
}

function speedInsert(text) {
  if (!document.execCommand || !document.execCommand('insertText', false, text)) {
    const a = spInput.selectionStart, b = spInput.selectionEnd;
    spInput.value = spInput.value.slice(0, a) + text + spInput.value.slice(b);
    spInput.selectionStart = spInput.selectionEnd = a + text.length;
    onSpeedInput({ inputType: 'insertText' });
  }
}

function finishSpeed() {
  sp.end = Date.now();
  clearInterval(sp.timer);
  spInput.readOnly = true;
  checkLines(true);
  speedStats();
  const ms = sp.end - sp.start;
  const key = `r3:speed:${current.id}:${solSet === 'ref' ? '' : solSet + ':'}${sp.file}${sp.drill === null ? '' : ':s' + sp.drill}`;
  const prev = store.get(key, null);
  const best = prev === null || ms < prev;
  if (best) store.set(key, ms);
  const keys = sp.keys;
  const acc = keys ? Math.max(0, Math.floor((1000 * (keys - sp.mistakes)) / keys) / 10) : 100;
  const base = sp.drill === null ? 0 : sp.all[sp.drill].line - 1;
  const worst = Object.entries(sp.roundMiss).sort((a, b) => b[1] - a[1]).slice(0, 3);
  saveMiss();
  const weakSec = sp.drill === null && worst.length ? sectionAt(+worst[0][0]) : -1;
  const next = NEXT_GHOST[sp.ghost];
  $('#speedDone').innerHTML = `<div class="card" tabindex="-1"><h3>พิมพ์ครบแล้ว — ${esc(current.title)}</h3><dl>
    <dt>เฉลย</dt><dd>${SOL_SETS[solSet].label}${sp.drill === null ? '' : ' · ' + esc(sp.all[sp.drill].title)}</dd>
    <dt>โหมด</dt><dd>${GHOST[sp.ghost]}</dd>
    <dt>เวลา</dt><dd>${$('#spTime').textContent}</dd>
    <dt>ความแม่น</dt><dd>${acc}% (พิมพ์ผิด ${sp.mistakes})</dd>` +
    (sp.ghost === 'show' ? '' : `<dt>ใช้ใบ้</dt><dd>${sp.hints} ครั้ง</dd>`) +
    `<dt>เร็วที่สุด</dt><dd class="${best ? 'best' : ''}">${best ? 'ใหม่! ' : ''}${((best ? ms : prev) / 1000).toFixed(1)} วินาที</dd>
  </dl>` +
    (worst.length ? '<h4>ผิดบ่อยรอบนี้</h4><ul class="worst">' + worst.map(([i, c]) =>
      `<li><span>บรรทัด ${+i + base + 1}</span><code>${esc(sp.lines[i].trim())}</code>${c > 1 ? `<span>×${c}</span>` : ''}</li>`).join('') + '</ul>' : '') +
    `<div class="actions"><button class="btn go" id="spAgain">อีกรอบ</button>` +
    (next ? `<button class="btn" id="spHard">อีกรอบแบบ${GHOST[next]}</button>` : '') +
    (weakSec >= 0 ? '<button class="btn" id="spWeak">ซ้อมส่วนที่ผิด</button>' : '') +
    (sp.drill !== null ? '<button class="btn" id="spDoneWhole">ทั้งไฟล์</button>' : '') +
    `<button class="btn" id="spDoneClose">ปิด</button></div></div>`;
  $('#speedDone').hidden = false;
  $('#spAgain').onclick = () => loadSpeed(sp.file, sp.drill);
  if ($('#spHard')) $('#spHard').onclick = () => { setGhost(next); loadSpeed(sp.file, sp.drill); };
  if ($('#spWeak')) $('#spWeak').onclick = () => loadSpeed(sp.file, weakSec);
  if ($('#spDoneWhole')) $('#spDoneWhole').onclick = () => loadSpeed(sp.file);
  $('#spDoneClose').onclick = () => { $('#speedDone').hidden = true; spInput.focus(); };
  // Focus the card, not a button: an Enter typed out of habit right after the
  // last line must not restart and wipe the summary.
  $('#speedDone .card').focus();
}

spInput.addEventListener('input', onSpeedInput);
spInput.addEventListener('scroll', () => { spInput.scrollTop = spInput.scrollLeft = 0; });   // the area scrolls, not the textarea
// Caret moved → update colours / note. Also catches text changes that arrived
// without an 'input' event (some IMEs / automation), so nothing goes stale.
for (const ev of ['keyup', 'click', 'select']) spInput.addEventListener(ev, () => onSpeedCaret(ev === 'keyup'));
spInput.addEventListener('keydown', e => {
  if (e.key === '/' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); peekHint(); return; }
  if (e.key === 'Tab' && !e.ctrlKey && !e.altKey) { e.preventDefault(); speedInsert('\t'); return; }
  const atLineEnd = spInput.selectionStart === spInput.selectionEnd &&
    /^(\n|$)/.test(spInput.value.slice(spInput.selectionEnd));
  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    if (skeleton() && atLineEnd) {               // jump to the next line to write
      const j = toGap(caretLine() + 1, 1);
      if (j >= 0) caretToLineEnd(j);
      return;
    }
    // Indent the new line the way the answer's next line is indented.
    speedInsert('\n' + indentOf(sp.lines[caretLine() + 1]));
    return;
  }
  if ((e.key === 'Backspace' || e.key === 'Delete') && sp.del[caretLine()] && spInput.selectionStart === spInput.selectionEnd) {
    // A line to delete goes in one key press (one undo step).
    const vl = spInput.value.split('\n'), cl = caretLine();
    if (vl[cl].trim()) {
      e.preventDefault();
      let o = 0;
      for (let i = 0; i < cl; i++) o += vl[i].length + 1;
      spInput.selectionStart = o;
      spInput.selectionEnd = o + vl[cl].length;
      if (!document.execCommand || !document.execCommand('delete')) {
        spInput.value = spInput.value.slice(0, o) + spInput.value.slice(o + vl[cl].length);
        spInput.selectionStart = spInput.selectionEnd = o;
        onSpeedInput({ inputType: 'deleteContent' });
      }
      return;
    }
  }
  if (e.key === 'Backspace' && skeleton() && spInput.selectionStart === spInput.selectionEnd) {
    // At a gap's indentation start: go back to the previous gap instead of joining lines.
    const before = spInput.value.slice(0, spInput.selectionStart).split('\n').pop();
    if (before === '' || (before === indentOf(sp.lines[caretLine()]) && !sp.given[caretLine()])) {
      e.preventDefault();
      const j = toGap(caretLine() - 1, -1);
      if (j >= 0) caretToLineEnd(j);
    }
  }
});
$('#speedRestart').onclick = () => { saveMiss(); loadSpeed(sp.file, sp.drill); };
$('#spWhole').onclick = () => { saveMiss(); loadSpeed(sp.file); };
$('#spHint').onclick = peekHint;
$('#tourFlow').addEventListener('click', e => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  const caret = sp.base + caretLine();
  sp.flowPin = sp.flow[+b.dataset.k];
  sp.flowPinAt = sp.flow.find(c => caret >= c.line && caret <= c.end) || null;
  renderFlow();
  spInput.focus({ preventScroll: true });
});
$('#spHideLevel').innerHTML = HIDE_LEVELS.map(h => `<button data-h="${h}">${h}%</button>`).join('');
for (const b of $('#spHideLevel').querySelectorAll('button')) b.onclick = () => {
  store.set('r3:hide', +b.dataset.h);
  setGhost('half');
  renderSpeed();
  spInput.focus();
};
for (const b of $('#spGhostMode').querySelectorAll('button')) b.onclick = () => { setGhost(b.dataset.g); renderSpeed(); spInput.focus(); };

// ---------------------------------------------------------------------------
// Sidebar collapse (remembered per browser)
// ---------------------------------------------------------------------------
function setCollapsed(on) {
  $('#layout').classList.toggle('collapsed', on);
  $('#sideToggle').setAttribute('aria-expanded', String(!on));
  store.set('r3:collapsed', on);
}
$('#sideToggle').onclick = () => setCollapsed(!$('#layout').classList.contains('collapsed'));
setCollapsed(store.get('r3:collapsed', false));

// ---------------------------------------------------------------------------
// Help (คู่มือ)
// ---------------------------------------------------------------------------
function openHelp(section) {
  const d = $('#help');
  if (!d.open) d.showModal();
  const target = section && document.getElementById(section);
  $('.helpBody').scrollTop = target ? target.offsetTop - $('.helpBody').offsetTop : 0;
}
$('#helpBtn').onclick = () => openHelp();
$('#helpClose').onclick = () => $('#help').close();
$('#animClose').onclick = closeAnim;
$('#anim').addEventListener('click', e => { if (e.target === $('#anim')) closeAnim(); }); // backdrop
$('#anim').addEventListener('cancel', e => { e.preventDefault(); closeAnim(); });       // Esc
for (const a of document.querySelectorAll('.helpNav a')) {
  a.onclick = e => { e.preventDefault(); openHelp(a.getAttribute('href').slice(1)); };
}
$('#help').addEventListener('click', e => { if (e.target === $('#help')) $('#help').close(); }); // backdrop

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
selectProblem(store.get('r3:current', PROBLEMS[0].id));
openSpeed();
