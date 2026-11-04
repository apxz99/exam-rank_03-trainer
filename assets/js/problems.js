// Exam Rank 03 problems: what the student edits, hidden test harnesses, and
// test cases. Expected outputs come from small JS oracles below (independent
// of the C reference solutions, which test/verify-all.cjs checks against them).
// Subject texts and handed-out files come from subjects.js (generated).
//
// Test fields:
//   args   argv after the program name          stdin  text fed to stdin
//   chunk  max bytes per read() on stdin (random sizes, like the exam tester)
//   expect expected stdout (null = don't check output)
//   exit   expected exit code (default 0)        cmp    'exact' | 'unordered'
//   build  key into problem.builds (default 'default')
// problem.input: where the program gets its data — 'argv' | 'stdin' | 'both'

// ---------------------------------------------------------------------------
// Oracles
// ---------------------------------------------------------------------------
const lines = a => a.map(l => l + '\n').join('');

function oFilter(text, pat) {
  return text.split(pat).join('*'.repeat(pat.length));
}

function oQueens(n) {
  const out = [], q = [];
  (function go(col) {
    if (col === n) { out.push(q.join(' ')); return; }
    for (let r = 0; r < n; r++) {
      if (q.every((qr, c) => qr !== r && Math.abs(qr - r) !== col - c)) {
        q[col] = r; go(col + 1); q.length = col;
      }
    }
  })(0);
  return lines(out);
}

function oPerms(s) {
  const chars = [...s].sort(), out = [];
  (function go(cur, rest) {
    if (!rest.length) { out.push(cur); return; }
    rest.forEach((ch, i) => go(cur + ch, rest.filter((_, j) => j !== i)));
  })('', chars);
  return lines(out);
}

function oPowerset(target, set) {
  const out = [];
  for (let m = 0; m < (1 << set.length); m++) {
    const pick = set.filter((_, i) => m & (1 << i));
    if (pick.reduce((a, b) => a + b, 0) === target) out.push(pick.join(' '));
  }
  return lines(out);
}

function oRip(s) {
  let open = 0, close = 0;
  for (const c of s) {
    if (c === '(') open++;
    else if (c === ')') { if (open) open--; else close++; }
  }
  const k = open + close, out = new Set();
  const balanced = t => {
    let d = 0;
    for (const c of t) { d += c === '(' ? 1 : c === ')' ? -1 : 0; if (d < 0) return false; }
    return d === 0;
  };
  (function go(i, t, left) {
    if (i === s.length) { if (!left && balanced(t)) out.add(t); return; }
    if (left && (s[i] === '(' || s[i] === ')')) go(i + 1, t + ' ', left - 1);
    go(i + 1, t + s[i], left);
  })(0, '', k);
  return lines([...out]);
}

function oGnl(text) {
  const ls = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  return ls.map(l => `[${l}]\n`).join('') + `lines=${ls.length}\n`;
}

// ---------------------------------------------------------------------------
// Hidden harnesses
// ---------------------------------------------------------------------------
const SCANF_MAIN = `#include <stdio.h>
#include <stdlib.h>

int	ft_scanf(const char *, ...);

#ifdef REAL_SCANF
# define SCAN scanf
#else
# define SCAN ft_scanf
#endif

int	main(int argc, char **argv)
{
	int		d1 = 0, d2 = 0, r = 0;
	char	s1[256] = "", s2[256] = "";
	char	c1 = '.', c2 = '.';
	int		mode = (argc > 1) ? atoi(argv[1]) : 0;

	switch (mode)
	{
		case 0: r = SCAN("%d %s %c", &d1, s1, &c1); break;
		case 1: r = SCAN("%s %d", s1, &d1); break;
		case 2: r = SCAN("%c%c", &c1, &c2); break;
		case 3: r = SCAN("%d,%d", &d1, &d2); break;
		case 4: r = SCAN("%s%s", s1, s2); break;
		case 5: r = SCAN("%d%d", &d1, &d2); break;
		case 6: r = SCAN("%c %c", &c1, &c2); break;
		case 7: r = SCAN("x%dy", &d1); break;
	}
	printf("return = %d\\n", r);
	printf("d1=%d d2=%d s1=[%s] s2=[%s] c1=[%c] c2=[%c]\\n", d1, d2, s1, s2, c1, c2);
	return (0);
}
`;
const SCANF_FORMATS = ['%d %s %c', '%s %d', '%c%c', '%d,%d', '%s%s', '%d%d', '%c %c', 'x%dy'];

const GNL_MAIN = `#include "get_next_line.h"
#include <stdio.h>
#include <stdlib.h>

int	main(void)
{
	char	*line;
	int		n = 0;

	while ((line = get_next_line(0)) != NULL)
	{
		printf("[%s]\\n", line);
		free(line);
		n++;
	}
	printf("lines=%d\\n", n);
	return (0);
}
`;

// ---------------------------------------------------------------------------
// Problems
// ---------------------------------------------------------------------------
const R = (typeof EXAM_RESOURCES !== 'undefined') ? EXAM_RESOURCES
        : require('./subjects.js').EXAM_RESOURCES;

const LONG = 'the quick bonjour fox jumps over bonjourbonjour the lazy dog\n'.repeat(60);
const GNL_LONG = 'x'.repeat(150) + '\nshort\n' + 'y'.repeat(99) + '\n';

const PROBLEMS = [
  {
    id: 'filter', level: 1, title: 'filter', input: 'both',
    files: { 'filter.c': '' },
    builds: { default: {} },
    run: { args: 'abc', stdin: 'abcdefaaaabcdeabcabcdabc\n' },
    th: `โปรแกรมรับ argument 1 ตัว (สตริง s) แล้วอ่าน stdin ทั้งหมด พิมพ์ออก stdout
โดยแทนที่ทุกครั้งที่เจอ s ด้วย '*' จำนวนเท่าความยาว s (เหมือน sed 's/s/***/g')

กติกาสำคัญ
• ไม่มี argument / argument ว่าง "" / มีมากกว่า 1 ตัว → return 1
• read หรือ malloc พัง → เขียน "Error: <ข้อความ>" ลง stderr (ใช้ perror("Error")) แล้ว return 1
• ผู้ตรวจใช้ read ที่คืนจำนวนไบต์สุ่ม — คำที่ต้องหาอาจถูกตัดกลางระหว่าง read 2 ครั้ง

แนวคิด: อ่านทุกอย่างเก็บใน buffer ก่อน (realloc ต่อท้ายเรื่อย ๆ จน read คืน 0)
แล้วไล่ทีละตำแหน่ง ถ้าตรงกับ s ให้พิมพ์ * แล้วกระโดดข้ามไป len(s) ตัว

บนเว็บนี้: test ที่มีป้าย "read สุ่ม" จะให้ read คืนทีละ 1–N ไบต์แบบสุ่ม`,
    tests: [
      { args: ['abc'], stdin: 'abcdefaaaabcdeabcabcdabc\n' },
      { args: ['ababc'], stdin: 'ababcabababc\n' },
      { args: ['bonjour'], stdin: 'bonjour world bonjour universe\n' },
      { args: ['abc'], stdin: 'abcabcabc\n' },
      { args: ['test'], stdin: '\n' },
      { args: ['very long pattern'], stdin: 'this is a very long pattern to test replacement functionality\n' },
      { args: ['test'], stdin: 'line1\ntest line2\ntest line3' },
      { args: ['aa'], stdin: 'aaa\n' },
      { args: ['xyz'], stdin: '' },
      { args: ['bonjour'], stdin: LONG, chunk: 5 },
      { args: ['abc'], stdin: 'abcdefaaaabcdeabcabcdabc\n', chunk: 2 },
      { args: [], stdin: 'abc\n', expect: null, exit: 1, name: 'ไม่มี argument → exit 1' },
      { args: ['a', 'b'], stdin: 'abc\n', expect: null, exit: 1, name: 'argument 2 ตัว → exit 1' },
      { args: [''], stdin: 'abc\n', expect: null, exit: 1, name: 'argument ว่าง → exit 1' },
    ].map(t => ('expect' in t) ? t : { ...t, expect: oFilter(t.stdin, t.args[0]) }),
  },
  {
    id: 'ft_scanf', level: 1, title: 'ft_scanf', input: 'stdin',
    files: R.given.ft_scanf,
    hidden: { 'main.c': SCANF_MAIN },
    builds: { default: {} },
    x86VaList: true,
    run: { args: '0', stdin: '42 hello x\n' },
    th: `เติมฟังก์ชันในไฟล์ที่ข้อสอบให้มา ให้ ft_scanf ทำงานเหมือน scanf จริง สำหรับ %s %d %c เท่านั้น
(ไม่ต้องทำ field width, *, modifier h/l ฯลฯ)

สิ่งที่ต้องเติม
• match_space — ข้าม whitespace ทั้งหมด แล้ว ungetc ตัวแรกที่ไม่ใช่ space คืน
• match_char — อ่าน 1 ตัว ถ้าตรงกับ c คืน 1 ถ้าไม่ตรง ungetc คืนแล้วคืน -1
• scan_char (%c) — อ่าน 1 ตัว (ไม่ข้าม space!)
• scan_int (%d) — รองรับเครื่องหมาย +/- ต้องมีตัวเลขอย่างน้อย 1 ตัว ตัวที่ไม่ใช่ตัวเลข ungetc คืน
• scan_string (%s) — อ่านจนเจอ whitespace ต้องได้อย่างน้อย 1 ตัว ปิดท้ายด้วย '\\0'
• ft_scanf — va_start / ft_vfscanf(stdin, …) / va_end

ค่าที่คืน: จำนวน conversion ที่สำเร็จ หรือ EOF (-1) ถ้า input หมดก่อนแปลงได้สักตัว
แต่ละฟังก์ชัน scan_* ต้องคืน 1 เมื่อสำเร็จ (ft_vfscanf เช็ค != 1)

บนเว็บนี้: main ที่ซ่อนอยู่เรียก ft_scanf ด้วย format ต่าง ๆ (เลือกด้วย argument 0–7)
แล้วพิมพ์ค่าที่ได้ — expected มาจากการรัน scanf ของจริงกับ input เดียวกัน
format: ${SCANF_FORMATS.map((f, i) => `${i}="${f}"`).join('  ')}`,
    tests: [
      [0, '42 hello x\n'], [0, '  -7   abc   Z'], [0, '42 hello'], [0, 'abc 1 x'], [0, ''],
      [1, 'hello 42'], [1, 'hello world'], [1, '  word\t\n  -12\n'],
      [2, 'ab'], [2, ' x'], [2, 'a'],
      [3, '3,4'], [3, '3 ,4'], [3, '-3,+4'],
      [4, 'foo bar'], [4, '   one\n\ntwo  '],
      [5, '12 34'], [5, '12x'],
      [6, 'a b'], [6, 'a\n\n b'],
      [7, 'x5y'], [7, 'x 5y'], [7, 'y5'],
    ].map(([m, stdin]) => ({ args: [String(m)], stdin, name: `"${SCANF_FORMATS[m]}"` })),
    // expect filled from SCANF_EXPECTED (real scanf output, see tools/gen-scanf-expected.cjs)
  },
  {
    id: 'broken_gnl', level: 1, title: 'broken_gnl', input: 'stdin',
    files: R.given.broken_gnl,
    hidden: { 'test_main.c': GNL_MAIN },
    builds: { default: { BUFFER_SIZE: 42 }, bs1: { BUFFER_SIZE: 1 }, bs5: { BUFFER_SIZE: 5 } },
    run: { args: '', stdin: 'Line 1\nLine 2\nLine 3\n' },
    th: `ข้อสอบให้ get_next_line.c ที่ "พัง" มา — ต้องซ่อมให้ทำงานถูก (ซ่อมฟังก์ชันช่วยด้วย)

get_next_line(fd) คืน 1 บรรทัดต่อการเรียก 1 ครั้ง รวม '\\n' ท้ายบรรทัด (ถ้ามี)
บรรทัดสุดท้ายที่ไม่มี '\\n' ก็ต้องคืน • หมดไฟล์แล้วคืน NULL • error คืน NULL
ใช้ได้แค่ read, free, malloc • ต้องไม่ leak • ต้องใช้ BUFFER_SIZE ตอน read

บั๊กในไฟล์ที่ให้มา (ลองหาเองก่อน!) — ใบ้: ดู ft_strchr, ft_memcpy, ft_strlen กับ NULL,
ft_memmove, ลูปใน get_next_line ที่ไม่เคยอัปเดต tmp, กรณี read คืน 0,
และการเลื่อนข้อมูลที่เหลือใน buffer หลังตัดบรรทัด

บนเว็บนี้: main ที่ซ่อนอยู่อ่านจาก stdin (fd 0) แล้วพิมพ์ทุกบรรทัดเป็น [บรรทัด] ตามด้วย lines=จำนวน
คอมไพล์ด้วย -Wall -Wextra -Werror เหมือนข้อสอบ และทดสอบหลาย BUFFER_SIZE (1, 5, 42)`,
    tests: [
      { stdin: 'Line 1\nLine 2\nLine 3\n' },
      { stdin: 'no trailing newline' },
      { stdin: '\n\n\nx' },
      { stdin: '' },
      { stdin: '\n' },
      { stdin: 'one line\n', build: 'bs1' },
      { stdin: 'ab\ncd\n\nef', build: 'bs1' },
      { stdin: GNL_LONG, build: 'bs5' },
      { stdin: GNL_LONG },
      { stdin: 'Line 1\nLine 2\nLine 3\n', build: 'bs5', chunk: 3 },
    ].map(t => ({ ...t, expect: oGnl(t.stdin), name: `BUFFER_SIZE=${{ default: 42, bs1: 1, bs5: 5 }[t.build || 'default']}` })),
  },
  {
    id: 'n_queens', level: 2, title: 'n_queens', input: 'argv',
    files: { 'n_queens.c': '' },
    builds: { default: {} },
    run: { args: '4', stdin: '' },
    th: `รับ n จาก argument แล้วพิมพ์ทุกวิธีวางควีน n ตัวบนกระดาน n×n ที่ไม่มีตัวไหนกินกันได้

รูปแบบ: 1 บรรทัดต่อ 1 คำตอบ ตัวเลขตัวที่ i = แถวของควีนในคอลัมน์ i (เริ่มที่ 0) คั่นด้วย space
ลำดับของคำตอบไม่สำคัญ (เว็บนี้ตรวจแบบไม่สนลำดับบรรทัด)
n = 2 หรือ 3 ไม่มีคำตอบ → ไม่ต้องพิมพ์อะไรเลย

แนวคิด backtracking: วางทีละคอลัมน์ ลองทุกแถว เช็คว่าไม่ชนแถวเดียวกัน
และไม่ชนแนวทแยง (|row1 - row2| == |col1 - col2|) แล้ว recurse ไปคอลัมน์ถัดไป
ฟังก์ชันที่ใช้ได้: atoi, fprintf, write, calloc, malloc, free, realloc`,
    tests: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ args: [String(n)], expect: oQueens(n), cmp: 'unordered' })),
  },
  {
    id: 'permutations', level: 2, title: 'permutations', input: 'argv',
    files: { 'permutations.c': '' },
    builds: { default: {} },
    run: { args: 'abc', stdin: '' },
    th: `พิมพ์ทุก permutation ของสตริงที่รับจาก argument — ต้องเรียงตามตัวอักษร (alphabetical order)
ไม่มีตัวอักษรซ้ำใน input

ถ้า input ไม่ได้เรียงมา (เช่น "cab") ก็ต้องเริ่มจาก abc เสมอ → เรียง input ก่อน
แล้ว generate แบบ "เลือกตัวที่ยังไม่ใช้ จากซ้ายไปขวา" จะได้ลำดับตัวอักษรอัตโนมัติ
(การ swap แบบธรรมดาจะ "ไม่" ได้ลำดับตัวอักษร — ระวัง!)

บนเว็บนี้ตรวจแบบ "ลำดับต้องตรง" ทุกบรรทัด
ฟังก์ชันที่ใช้ได้: puts, malloc, calloc, realloc, free, write`,
    tests: ['a', 'ab', 'abc', 'cab', 'abcd', 'dcba', 'xyzab'].map(s => ({ args: [s], expect: oPerms(s) })),
  },
  {
    id: 'powerset', level: 2, title: 'powerset', input: 'argv',
    files: { 'powerset.c': '' },
    builds: { default: {} },
    run: { args: '3 1 0 2 4 5 3', stdin: '' },
    th: `argument แรกคือเลขเป้าหมาย n ที่เหลือคือเซต s (เลขไม่ซ้ำกัน)
พิมพ์ทุก subset ของ s ที่ผลรวม = n — 1 บรรทัดต่อ subset ตัวเลขคั่นด้วย space

• ลำดับบรรทัดไม่สำคัญ แต่ลำดับตัวเลขในบรรทัดต้องตามลำดับใน s (ห้าม "4 1" ถ้า s คือ 1 … 4)
• subset ว่างผลรวม = 0 → ถ้า n = 0 ต้องพิมพ์บรรทัดว่าง 1 บรรทัด
• malloc พัง → exit 1

แนวคิด: recursion ทีละตัว "เอา" หรือ "ไม่เอา" ตัวที่ i ไปจนครบทุกตัว แล้วเช็คผลรวม
ฟังก์ชันที่ใช้ได้: atoi, printf, fprintf, malloc, calloc, realloc, free, write`,
    tests: [
      [3, 1, 0, 2, 4, 5, 3], [12, 5, 2, 1, 8, 4, 3, 7, 11], [0, 1, -1], [7, 3, 8, 2], [5, 1, 2, 3, 4, 5],
      [-1, 1, 2, 3, 4, 5, -10], [0, -1, 1, 2, 3, -2], [13, 65, 23, 3, 4, 6, 7, 1, 2],
      [10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [50, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    ].map(([n, ...s]) => ({ args: [n, ...s].map(String), expect: oPowerset(n, s), cmp: 'unordered' })),
  },
  {
    id: 'rip', level: 2, title: 'rip', input: 'argv',
    files: { 'rip.c': '' },
    builds: { default: {} },
    run: { args: '(()(()(', stdin: '' },
    th: `รับสตริงที่มีแต่วงเล็บ ถ้าไม่ balanced ให้ "ลบ" วงเล็บน้อยที่สุดเท่าที่ทำให้ balanced
การลบ = แทนที่ด้วย space แล้วพิมพ์ "ทุก" คำตอบที่เป็นไปได้ (ไม่ซ้ำ) บรรทัดละคำตอบ

• จำนวนที่ต้องลบน้อยสุด = วงเล็บเปิดที่ไม่มีคู่ + วงเล็บปิดที่ไม่มีคู่ (นับได้ใน 1 รอบ)
• ลองลบทุกแบบด้วย backtracking โดยลบได้ไม่เกินจำนวนนั้น แล้วพิมพ์อันที่ balanced
• ระวังคำตอบซ้ำ (เช่นลบ "(" ตัวที่ 1 หรือ 2 ใน "((" แล้วได้ผลเหมือนกัน — ต้องไม่ซ้ำ)
• ลำดับคำตอบไม่สำคัญ (เว็บนี้ตรวจแบบไม่สนลำดับ แต่ต้องไม่มีบรรทัดซ้ำ)
ฟังก์ชันที่ใช้ได้: puts, write`,
    tests: ['(()', '((()()())())', '()())()', '(()(()(', '()', ')(', '(((', '))((', '())(()', '(()())(()'].map(s => ({ args: [s], expect: oRip(s), cmp: 'unordered' })),
  },
  {
    id: 'tsp', level: 2, title: 'tsp', input: 'stdin',
    files: R.given.tsp,
    builds: { default: {} },
    run: { args: '', stdin: '1, 1\n0, 1\n1, 0\n0, 0\n' },
    th: `ข้อสอบให้ tsp.c มาพร้อม main แล้ว — ต้องเขียน 3 ฟังก์ชัน: distance, total_distance, solve
อ่านพิกัดเมือง "x, y" จาก stdin (ไม่เกิน 11 เมือง) แล้วพิมพ์ความยาวเส้นทางปิด (วนกลับจุดเริ่ม)
ที่สั้นที่สุด ในรูป %.2f

• distance = sqrtf(dx*dx + dy*dy)
• total_distance = ผลรวมระยะตาม path + ระยะจากเมืองสุดท้ายกลับเมืองแรก
• solve = ลองทุก permutation ของ path[pos..n-1] (swap → recurse → swap คืน)
  ตรึงเมืองแรกไว้ (main เรียกจาก pos = 1) เพื่อลดงานจาก n! เหลือ (n-1)!
  เมื่อ pos == n คำนวณระยะแล้วอัปเดต *min

11 เมือง = 3.6 ล้าน permutation — ต้องรันจบภายในเวลาที่กำหนด`,
    tests: [
      { stdin: '0, 0\n1, 0\n2, 0\n0, 1\n1, 1\n2, 1\n1, 2\n2, 2\n', expect: '8.00\n' },
      { stdin: '1, 1\n0, 1\n1, 0\n0, 0\n', expect: '4.00\n' },
      { stdin: '0, 0\n', expect: '0.00\n' },
      { stdin: '0, 0\n3, 4\n', expect: '10.00\n' },
      { stdin: '0, 0\n1, 0\n2, 0\n3, 0\n', expect: '6.00\n' },
      { stdin: '0.5, 0.5\n1.5, 0.5\n1.5, 1.5\n0.5, 1.5\n', expect: '4.00\n' },
      { stdin: '0, 0\n4, 0\n4, 3\n0, 3\n2, 1.5\n', expect: '15.00\n' },
      { stdin: '-1, -1\n1, -1\n1, 1\n-1, 1\n0, 2\n2, 0\n0, -2\n-2, 0\n', expect: '11.31\n' },
      { stdin: '0, 0\n10, 0\n20, 0\n30, 0\n30, 10\n20, 10\n10, 10\n0, 10\n5, 5\n15, 5\n25, 5\n', expect: 'TSP11' },
    ],
  },
];

// Real scanf output for each ft_scanf test (same order). Regenerate with
// node tools/gen-scanf-expected.cjs if the tests above change.
const SCANF_EXPECTED = [
 "return = 3\nd1=42 d2=0 s1=[hello] s2=[] c1=[x] c2=[.]\n",
 "return = 3\nd1=-7 d2=0 s1=[abc] s2=[] c1=[Z] c2=[.]\n",
 "return = 2\nd1=42 d2=0 s1=[hello] s2=[] c1=[.] c2=[.]\n",
 "return = 0\nd1=0 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = -1\nd1=0 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=42 d2=0 s1=[hello] s2=[] c1=[.] c2=[.]\n",
 "return = 1\nd1=0 d2=0 s1=[hello] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=-12 d2=0 s1=[word] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=0 d2=0 s1=[] s2=[] c1=[a] c2=[b]\n",
 "return = 2\nd1=0 d2=0 s1=[] s2=[] c1=[ ] c2=[x]\n",
 "return = 1\nd1=0 d2=0 s1=[] s2=[] c1=[a] c2=[.]\n",
 "return = 2\nd1=3 d2=4 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 1\nd1=3 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=-3 d2=4 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=0 d2=0 s1=[foo] s2=[bar] c1=[.] c2=[.]\n",
 "return = 2\nd1=0 d2=0 s1=[one] s2=[two] c1=[.] c2=[.]\n",
 "return = 2\nd1=12 d2=34 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 1\nd1=12 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 2\nd1=0 d2=0 s1=[] s2=[] c1=[a] c2=[b]\n",
 "return = 2\nd1=0 d2=0 s1=[] s2=[] c1=[a] c2=[b]\n",
 "return = 1\nd1=5 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 1\nd1=5 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n",
 "return = 0\nd1=0 d2=0 s1=[] s2=[] c1=[.] c2=[.]\n"
];

// TSP11: filled by tools — brute force in JS is too slow to do on page load.
const TSP11_EXPECTED = '92.43\n';

(function fill() {
  const sc = PROBLEMS.find(p => p.id === 'ft_scanf');
  if (SCANF_EXPECTED) sc.tests.forEach((t, i) => { t.expect = SCANF_EXPECTED[i]; });
  const tsp = PROBLEMS.find(p => p.id === 'tsp');
  tsp.tests.forEach(t => { if (t.expect === 'TSP11') t.expect = TSP11_EXPECTED; });
})();

if (typeof module !== 'undefined')
  module.exports = { PROBLEMS, SCANF_MAIN, SCANF_FORMATS, oQueens, oPerms, oPowerset, oRip, oGnl, oFilter };
