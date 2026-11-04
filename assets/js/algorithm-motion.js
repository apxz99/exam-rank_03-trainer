/* Small, keyboard-friendly algorithm visualizer. GSAP is used when available;
   the explanations and controls remain usable if the CDN is unavailable. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const state = { problem: '', steps: [], index: 0, timer: 0 };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  function powersetSteps() {
    const numbers = [1, 2, 3, 4, 5];
    const target = 5;
    const steps = [];
    const visited = new Set();
    const printed = [];
    const add = (title, description, hint, data) => {
      steps.push({ title, description, hint, view: {
        numbers, target, ...data, visited: [...visited], output: [...printed],
      } });
    };
    const search = (index, chosen, sum, path, stack) => {
      visited.add(path);
      const call = `solve(i=${index}, sum=${sum})`;
      const nextStack = [...stack, call];
      add(`เรียก ${call}`, `เข้าสู่ชั้น ${index} ของ recursion พร้อมชุด { ${chosen.join(', ') || '∅'} }`,
        index === numbers.length ? 'ใช้ตัวเลขครบแล้ว จึงตรวจผลรวม' : `เลขที่กำลังตัดสินใจคือ ${numbers[index]}`,
        { chosen, sum, next: index, path, depth: index, stack: nextStack, event: 'call' });
      if (sum > target) {
        add(`ตัดกิ่ง: ${sum} เกิน ${target}`, 'ผลรวมเกินเป้าหมายแล้ว จึง return ทันทีโดยไม่เรียกชั้นลึกกว่านี้',
          'ย้อนกลับไปยังพ่อของโหนดนี้ แล้วลองกิ่งอีกฝั่ง',
          { chosen, sum, next: index, path, depth: index, stack: nextStack, event: 'prune', result: 'เกิน' });
        return;
      }
      if (index === numbers.length) {
        const found = sum === target;
        if (found) {
          const line = chosen.join(' ');
          printed.push(line);
          add(`print("${line}")`, `ผลรวมเท่ากับ ${target} จึงพิมพ์ ${line} ลง stdout แล้ว return`,
            'ดูบรรทัดใหม่ใน Output log ด้านล่างของต้นไม้',
            { chosen, sum, next: index, path, depth: index, stack: nextStack, event: 'print', result: 'พบคำตอบ' });
        } else add(`return: ผลรวม ${sum} ไม่ตรง`, 'ใช้ตัวเลขครบทุกตัวแล้ว แต่ผลรวมไม่ใช่เป้าหมาย จึงไม่ print อะไร',
          'ย้อนกลับไปยังการเรียกก่อนหน้า',
          { chosen, sum, next: index, path, depth: index, stack: nextStack, event: 'return', result: 'ไม่พบ' });
        return;
      }
      const n = numbers[index];
      add(`กิ่งซ้าย: เลือก ${n}`, `เพิ่ม ${n} แล้วเรียก solve ชั้น ${index + 1}: ผลรวม ${sum} → ${sum + n}`,
        'กิ่งซ้าย = include',
        { chosen: [...chosen, n], sum: sum + n, next: index + 1, path, depth: index, stack: nextStack, event: 'choose' });
      search(index + 1, [...chosen, n], sum + n, path + 'L', nextStack);
      add(`กลับมาที่ ${call}`, `กิ่งซ้ายทำงานเสร็จแล้ว คืนสถานะชุดเดิม { ${chosen.join(', ') || '∅'} }`,
        `ต่อไปเปิดกิ่งขวา: ข้าม ${n}`,
        { chosen, sum, next: index, path, depth: index, stack: nextStack, event: 'back' });
      add(`กิ่งขวา: ข้าม ${n}`, `ไม่เพิ่ม ${n} แล้วเรียก solve ชั้น ${index + 1} ด้วยผลรวมเดิม ${sum}`,
        'กิ่งขวา = exclude',
        { chosen, sum, next: index + 1, path, depth: index, stack: nextStack, event: 'skip' });
      search(index + 1, chosen, sum, path + 'R', nextStack);
    };
    search(0, [], 0, '', []);
    return steps;
  }

  function permutationSteps() {
    const source = 'abc';
    const steps = [{ title: 'เริ่มสร้างคำตอบ', description: 'เลือกตัวอักษรหนึ่งตัวมาเติมตำแหน่งปัจจุบัน แล้วเรียกฟังก์ชันซ้ำกับตัวที่เหลือ', hint: 'ลำดับที่ได้จะถูกบันทึกเมื่อใช้ครบทุกตัว', view: { source, prefix: '', remaining: source, output: [] } }];
    const walk = (prefix, remaining) => {
      if (!remaining.length) {
        const output = steps.filter(s => s.view.output).at(-1)?.view.output || [];
        steps.push({ title: `ได้ permutation: ${prefix}`,
          description: 'ไม่มีตัวอักษรเหลือแล้ว จึงบันทึก prefix นี้เป็นหนึ่งคำตอบ', hint: 'จากนั้นย้อนกลับไปเลือกตัวอื่น', view: { source, prefix, remaining, output: [...output, prefix], leaf: true } });
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        const ch = remaining[i];
        const rest = remaining.slice(0, i) + remaining.slice(i + 1);
        steps.push({ title: `เลือก ${ch} ต่อท้าย ${prefix || '∅'}`,
          description: `prefix กลายเป็น ${prefix + ch}; ตัวที่ยังใช้ได้คือ ${rest || 'ไม่มี'}. ค้นหาต่อจากสถานะใหม่นี้`,
          hint: 'ตำแหน่งใน prefix จะไม่เปลี่ยนระหว่างการเรียกซ้ำ', view: { source, prefix: prefix + ch, remaining: rest, output: [], chosen: ch } });
        walk(prefix + ch, rest);
        steps.push({ title: `ย้อนกลับจาก ${prefix + ch}`,
          description: `นำ ${ch} ออกจาก prefix เพื่อให้ลองตัวเลือกถัดไปที่ตำแหน่งเดิม`,
          hint: 'การคืนสถานะทำให้ทุกลำดับถูกลองครั้งเดียว', view: { source, prefix, remaining, output: [], backtrack: ch } });
      }
    };
    walk('', source);
    // Keep a separate running list of completed leaves so the display grows as the trace advances.
    const found = [];
    for (const step of steps) {
      if (step.view.leaf) found.push(step.view.prefix);
      step.view.output = [...found];
    }
    return steps;
  }

  function queenSteps() {
    const size = 4;
    const steps = [{ title: 'เริ่มที่คอลัมน์ 0', description: 'วางควีนทีละคอลัมน์ แถวหนึ่งมีควีนได้ตัวเดียว และห้ามซ้ำแถวหรือทแยง', hint: 'ลองแถวจากบนลงล่าง', view: { size, queens: [], solutions: 0 } }];
    let solutions = 0;
    const safe = (queens, col, row) => queens.every(q => q.row !== row && Math.abs(q.row - row) !== col - q.col);
    const solve = (col, queens) => {
      if (col === size) {
        solutions++;
        steps.push({ title: `พบคำตอบที่ ${solutions}`,
          description: 'วางครบทุกคอลัมน์โดยไม่มีควีนตัวใดโจมตีกัน บันทึกกระดานนี้แล้วค้นหาต่อ',
          hint: 'คำตอบอีกชุดอาจอยู่ในกิ่งอื่น', view: { size, queens: [...queens], solutions, solved: true } });
        return;
      }
      for (let row = 0; row < size; row++) {
        const ok = safe(queens, col, row);
        steps.push({ title: ok ? `ตรวจแถว ${row} ในคอลัมน์ ${col}` : `แถว ${row} ชนควีนเดิม`,
          description: ok ? 'ไม่มีควีนร่วมแถวหรือทแยง จึงวางได้และลองคอลัมน์ถัดไป' : 'มีควีนอยู่แถวเดียวกันหรือแนวทแยง ตัดตัวเลือกนี้ทิ้ง',
          hint: ok ? 'วางควีนแล้วไปต่อ' : 'ลองแถวถัดไป', view: { size, queens: [...queens], candidate: { col, row, ok }, solutions } });
        if (ok) {
          const placed = [...queens, { col, row }];
          steps.push({ title: `วางควีนที่ (${col}, ${row})`, description: 'เลือกตำแหน่งที่ปลอดภัย แล้วเรียก solve สำหรับคอลัมน์ถัดไป', hint: 'หนึ่งคอลัมน์ต่อหนึ่งควีน', view: { size, queens: placed, solutions } });
          solve(col + 1, placed);
          if (col < size - 1) steps.push({ title: `ย้อนกลับมาคอลัมน์ ${col}`,
            description: 'ทางเลือกถัดไปของคอลัมน์นี้อาจนำไปสู่คำตอบอีกแบบ ลองย้ายควีนไปแถวอื่น',
            hint: 'backtracking คืนกระดานก่อนลองใหม่', view: { size, queens: [...queens], candidate: { col, row, ok: false }, solutions, backtrack: true } });
        }
      }
    };
    solve(0, []);
    return steps;
  }

  function ripSteps() {
    const input = '()())()';
    const steps = [{ title: 'นับวงเล็บที่เกิน', description: 'เดินจากซ้ายไปขวา: ถ้าเจอ ) โดยไม่มี ( รอจับคู่ แสดงว่าต้องลบอย่างน้อยหนึ่งตัว', hint: 'ตัวอย่างนี้ต้องลบ ) อย่างน้อยหนึ่งตัว', view: { input, candidate: input, removed: -1, frontier: [input], solutions: [] } }];
    const valid = text => {
      let depth = 0;
      for (const ch of text) { if (ch === '(') depth++; else if (ch === ')' && --depth < 0) return false; }
      return depth === 0;
    };
    let frontier = [input];
    while (frontier.length) {
      const next = new Set();
      const found = new Set();
      for (const text of frontier) {
        const seen = new Set();
        for (let i = 0; i < text.length; i++) {
          if (text[i] !== '(' && text[i] !== ')') continue;
          if (seen.has(text[i])) continue;
          seen.add(text[i]);
          const candidate = text.slice(0, i) + text.slice(i + 1);
          const isValid = valid(candidate);
          if (isValid) found.add(candidate);
          steps.push({ title: isValid ? `พบคำตอบ: ${candidate}` : `ลองลบตัวที่ ${i + 1}`,
            description: isValid ? 'สตริงสมดุลแล้ว เก็บคำตอบไว้ และค้นหาตัวเลือกอื่นในระดับการลบเดียวกัน' : `ผลที่ได้คือ ${candidate || 'สตริงว่าง'} ยังไม่สมดุล จึงลองลบอีกตำแหน่ง`,
            hint: isValid ? 'หยุดเมื่อพบคำตอบในระดับนี้ เพื่อให้จำนวนครั้งที่ลบน้อยที่สุด' : 'ไม่ลบตัวอักษรที่ไม่ใช่วงเล็บ',
            view: { input: text, candidate, removed: i, frontier, solutions: [...found], valid: isValid } });
          if (!isValid) next.add(candidate);
        }
      }
      if (found.size) {
        steps.push({ title: 'ครบทุกคำตอบที่ลบน้อยที่สุด', description: `คำตอบมี ${found.size} แบบ: ${[...found].join(' · ')}`, hint: 'ไม่ต้องลองลบเพิ่ม เพราะจะไม่ใช่จำนวนขั้นต่ำ', view: { input, candidate: '', removed: -1, frontier: [...next], solutions: [...found], done: true } });
        break;
      }
      frontier = [...next];
    }
    return steps;
  }

  function powersetView(v) {
    const nodes = [];
    for (let level = 0; level <= 3; level++) {
      for (let n = 0; n < 2 ** level; n++) {
        const path = n.toString(2).padStart(level, '0').replaceAll('0', 'L').replaceAll('1', 'R');
        const called = v.visited.includes(path);
        const active = path === v.path || (v.path.length > 3 && path === v.path.slice(0, 3));
        const left = ((n + .5) / 2 ** level) * 100;
        nodes.push(`<div class="mv-treeNode ${called ? 'called' : ''} ${active ? 'active' : ''} ${v.event === 'print' && active ? 'printed' : ''}" style="--top:${level * 72}px;--left:${left}%"><small>ชั้น ${level}</small><b>solve(${level})</b><em>${level === 0 ? 'เริ่ม' : path.endsWith('L') ? 'เลือก' : 'ข้าม'}</em></div>`);
      }
    }
    const edges = Array.from({ length: 7 }, (_, n) => {
      const level = Math.floor(Math.log2(n + 1));
      const slot = n - (2 ** level - 1);
      const from = ((slot + .5) / 2 ** level) * 660;
      return [-1, 1].map(direction => {
        const to = ((slot * 2 + (direction < 0 ? .5 : 1.5)) / 2 ** (level + 1)) * 660;
        const dx = to - from;
        const dy = 26;
        return `<i class="mv-treeEdge" style="--x:${from}px;--y:${level * 72 + 46}px;--length:${Math.hypot(dx, dy)}px;--angle:${Math.atan2(dx, dy)}rad"></i>`;
      }).join('');
    }).join('');
    const output = v.output.length ? v.output.map(line => `<code>print: ${escapeHtml(line)}</code>`).join('') : '<span class="mv-dim">ยังไม่มี print</span>';
    return `<div class="mv-kicker">BINARY RECURSION TREE · ซ้าย = เลือก · ขวา = ข้าม</div>
      <div class="mv-callBar"><span>กำลังเรียก</span><b>${escapeHtml(v.stack.at(-1))}</b><span>ชั้น ${v.depth}</span></div>
      <div class="mv-treeWrap"><div class="mv-tree">${edges}${nodes.join('')}</div></div>
      <div class="mv-readout"><span>call stack</span><b>${v.stack.map(escapeHtml).join(' → ')}</b></div>
      <div class="mv-readout"><span>ชุดตอนนี้</span><b>{ ${v.chosen.join(', ') || '∅'} }</b><span>ผลรวม ${v.sum} / ${v.target}</span></div>
      <div class="mv-label">stdout · เกิดขึ้นเฉพาะตอนถึง print</div><div class="mv-outputList mv-printLog">${output}</div>`;
  }

  function permutationsView(v) {
    return `<div class="mv-kicker">RECURSION · CHOOSE / RECURSE / UNDO</div>
      <div class="mv-label">PREFIX</div><div class="mv-letterRow">${[...v.source].map((ch, i) => `<span class="mv-letter ${i < v.prefix.length ? 'picked' : ''} ${i === v.prefix.length - 1 && v.prefix ? 'active' : ''}">${v.prefix[i] || '·'}</span>`).join('')}</div>
      <div class="mv-readout"><span>ตัวอักษรที่เหลือ</span><b>${v.remaining || 'ไม่มี'}</b><span>${v.prefix ? `กำลังสร้าง ${v.prefix}` : 'เลือกตัวถัดไป'}</span></div>
      <div class="mv-label">คำตอบที่พบแล้ว · ${v.output.length}/6</div><div class="mv-outputList">${v.output.map(x => `<code>${x}</code>`).join('') || '<span class="mv-dim">ยังไม่มี</span>'}</div>`;
  }

  function queensView(v) {
    const cells = [];
    for (let row = 0; row < v.size; row++) for (let col = 0; col < v.size; col++) {
      const q = v.queens.some(p => p.col === col && p.row === row);
      const candidate = v.candidate && v.candidate.col === col && v.candidate.row === row;
      cells.push(`<div class="mv-cell ${(row + col) % 2 ? 'shade' : ''} ${candidate ? (v.candidate.ok ? 'candidate' : 'conflict') : ''} ${q ? 'queen' : ''}">${q ? '<span aria-label="queen">♛</span>' : candidate ? (v.candidate.ok ? '·' : '×') : ''}</div>`);
    }
    return `<div class="mv-kicker">BACKTRACKING · ONE QUEEN PER COLUMN</div>
      <div class="mv-board" style="--board-size:${v.size}">${cells.join('')}</div>
      <div class="mv-readout"><span>ควีนที่วางแล้ว</span><b>${v.queens.length}/${v.size}</b><span class="mv-good">พบ ${v.solutions} คำตอบ</span></div>`;
  }

  function ripView(v) {
    const parts = [...v.input].map((ch, i) => `<span class="mv-paren ${ch === '(' ? 'open' : 'close'} ${i === v.removed ? 'removed' : ''}">${escapeHtml(ch)}</span>`).join('');
    return `<div class="mv-kicker">BREADTH-FIRST SEARCH · ลบทีละระดับ</div>
      <div class="mv-label">สตริงที่กำลังตรวจ</div><div class="mv-parentheses">${parts || '<span class="mv-dim">(ว่าง)</span>'}</div>
      ${v.candidate && v.removed >= 0 ? `<div class="mv-readout"><span>หลังลบแล้ว</span><b>${escapeHtml(v.candidate || '∅')}</b></div>` : ''}
      <div class="mv-readout"><span>ระดับการลบ</span><b>${v.done ? 'ขั้นต่ำ' : v.solutions.length ? 'พบคำตอบ' : 'กำลังค้นหา'}</b><span>${v.valid ? '<span class="mv-good">สมดุล ✓</span>' : '<span class="mv-dim">ตรวจวงเล็บจากซ้ายไปขวา</span>'}</span></div>
      <div class="mv-label">คำตอบขั้นต่ำที่พบ</div><div class="mv-outputList">${v.solutions.map(x => `<code>${escapeHtml(x)}</code>`).join('') || '<span class="mv-dim">กำลังตรวจตัวเลือก</span>'}</div>`;
  }

  const renderers = { powerset: powersetView, permutations: permutationsView, n_queens: queensView, rip: ripView };

  function render() {
    const step = state.steps[state.index];
    if (!step) return;
    $('motionStage').innerHTML = renderers[state.problem](step.view);
    $('motionStep').textContent = `ขั้น ${state.index + 1} จาก ${state.steps.length}`;
    $('motionHeading').textContent = step.title;
    $('motionDescription').textContent = step.description;
    $('motionHint').textContent = step.hint;
    $('motionRange').max = String(Math.max(0, state.steps.length - 1));
    $('motionRange').value = String(state.index);
    $('motionCount').textContent = `${state.index + 1} / ${state.steps.length}`;
    $('motionPrev').disabled = state.index === 0;
    $('motionNext').disabled = state.index === state.steps.length - 1;
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timeline = window.gsap.timeline();
      timeline.fromTo('#motionStage > *', { autoAlpha: 0.55, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' });
      timeline.fromTo('#motionHeading', { autoAlpha: 0.65 }, { autoAlpha: 1, duration: 0.2 }, '<');
    }
  }

  function stop() {
    window.clearInterval(state.timer);
    state.timer = 0;
    const button = $('motionToggle');
    button.setAttribute('aria-label', 'เล่นภาพเคลื่อนไหว');
    button.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-play"></use></svg><span>เล่น</span>';
  }

  function goTo(index) {
    state.index = Math.max(0, Math.min(state.steps.length - 1, index));
    render();
    if (state.index === state.steps.length - 1) stop();
  }

  function toggle() {
    if (state.timer) { stop(); return; }
    if (state.index >= state.steps.length - 1) goTo(0);
    const button = $('motionToggle');
    button.setAttribute('aria-label', 'หยุดภาพเคลื่อนไหว');
    button.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-stop"></use></svg><span>หยุด</span>';
    state.timer = window.setInterval(() => goTo(state.index + 1), 900);
  }

  function open(problem) {
    stop();
    state.problem = problem;
    state.index = 0;
    state.steps = ({ powerset: powersetSteps, permutations: permutationSteps, n_queens: queenSteps, rip: ripSteps })[problem]();
    render();
    toggle();
    $('motionToggle').focus();
  }

  function close() {
    stop();
    if (window.gsap) window.gsap.killTweensOf('#motionStage, #motionStage > *, #motionHeading');
  }

  $('motionPrev').addEventListener('click', () => goTo(state.index - 1));
  $('motionNext').addEventListener('click', () => goTo(state.index + 1));
  $('motionToggle').addEventListener('click', toggle);
  $('motionRange').addEventListener('input', event => goTo(Number(event.target.value)));
  $('anim').addEventListener('keydown', event => {
    if (event.target.closest('button, input')) return;
    if (event.code === 'Space') { event.preventDefault(); toggle(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(state.index - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); goTo(state.index + 1); }
  });

  window.AlgorithmMotion = { open, close };
})();
