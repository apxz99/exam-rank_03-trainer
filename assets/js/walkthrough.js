// Section-by-section notes for the reference solutions, shown beside the
// typing practice. Each entry: [anchor, title, explanation]. A section starts
// at the first line (after the previous section) that contains `anchor`.
// test/verify-all.cjs checks every anchor still matches solutions.js.
const WALKTHROUGH = {
  filter: [
    ['#define _GNU_SOURCE', 'เปิดใช้ memmem + include', '`_GNU_SOURCE` ต้องมาก่อน include ทุกตัว ไม่งั้น `memmem` ไม่ถูกประกาศ\ninclude: string (memmem, strlen), stdlib (realloc, free), unistd (read, write), stdio (perror)\nไม่ต้องใช้ errno.h (perror อยู่ใน stdio) และ fcntl.h (ไม่ได้ใช้ open)'],
    ['#define CHUNK', 'ขนาดก้อนที่อ่าน', 'ขยาย buffer และ read ทีละ 1024 ไบต์ จะกี่ไบต์ก็ได้ เพราะเราอ่านต่อท้ายจนหมดอยู่แล้ว'],
    ['fail(char *buf)', 'fail: แจ้ง error แล้วคืน 1', '`perror("Error")` พิมพ์ `Error: <ข้อความ>` ลง stderr ตามที่โจทย์สั่ง\nfree buffer ก่อนออก แล้วคืน 1 ให้ main return ต่อได้ในบรรทัดเดียว'],
    ['main(int argc', 'main: ตัวแปร', '`buf` เก็บ stdin ทั้งหมด, `len` จำนวนไบต์ที่มีจริง (ไม่มี `\\0` ปิดท้าย)\n`r` เป็น `ssize_t` เพราะ read คืน -1 ได้'],
    ['if (argc != 2', 'เช็ค argument', 'ต้องมี argument เดียวพอดี และห้ามว่าง `""` ไม่งั้น return 1 ทันที (ไม่พิมพ์อะไร)'],
    ['while (1)', 'อ่าน stdin ให้หมด', 'ทุกรอบ: ขยาย buffer → `read` ต่อท้ายที่ `buf + len`\nr < 0 = error, r == 0 = หมดแล้ว ออกลูป\nเก็บผล realloc ใส่ `tmp` ก่อน กันเสีย buf เดิมเมื่อ realloc พัง\nอ่านให้หมดก่อน คำที่โดนตัดครึ่งระหว่างสอง read ก็ยังหาเจอ'],
    ['n = strlen(argv[1])', 'แทนที่แล้วพิมพ์', 'ไล่ i ทีละตำแหน่ง: ถ้าเหลือพอ (`i + n <= len`) และ n ตัวตรงนั้นตรงกับคำ → พิมพ์ `*` n ตัวแล้วกระโดด n\nไม่งั้นพิมพ์ตัวเดิมแล้วขยับ 1\n`memmem` บนช่วงยาว n พอดี = เทียบทั้งคำ'],
    ['free(buf);', 'จบ', 'คืนหน่วยความจำ แล้ว return 0'],
  ],

  ft_scanf: [
    ['#include <stdarg.h>', 'include', 'stdarg (va_list), stdio (fgetc, ungetc), ctype (isspace, isdigit)'],
    ['int match_space', 'match_space: กินช่องว่าง', 'อ่านทิ้งตราบที่เป็นช่องว่าง เจอตัวแรกที่ไม่ใช่ → `ungetc` คืนให้คนถัดไปอ่าน\nคืน 1 ถ้าปกติ, -1 ถ้า stream error'],
    ['int match_char', 'match_char: ตัวอักษรใน format', 'อ่าน 1 ตัว ตรงกับที่ format ต้องการคืน 1\nไม่ตรง → คืนตัวนั้นกลับ (ungetc) แล้วคืน -1 ให้ scanf หยุด'],
    ['int scan_char', 'scan_char: %c', 'อ่าน 1 ตัวเลย **ไม่ข้ามช่องว่าง** (ต่างจาก %d %s)\nเขียนลง pointer ที่ได้จาก `va_arg(ap, char *)`'],
    ['int scan_int', 'scan_int: %d', 'จำเครื่องหมาย `-` `+` → ตัวถัดไปต้องเป็นตัวเลข ไม่งั้นคืน -1\nสะสม `value * 10 + digit` จนเจอตัวที่ไม่ใช่ตัวเลข → ungetc คืน\nเขียนผลลง `va_arg(ap, int *)`'],
    ['int scan_string', 'scan_string: %s', 'อ่านเก็บจนเจอช่องว่าง/EOF แล้ว ungetc ช่องว่างคืน\nต้องได้อย่างน้อย 1 ตัว และปิดท้ายด้วย `\\0`'],
    ['match_conv(', 'match_conv (ให้มา)', 'เลือกฟังก์ชันตามตัวหลัง `%`\n%d กับ %s เรียก match_space ก่อน = ข้ามช่องว่างนำหน้า'],
    ['int ft_vfscanf', 'ft_vfscanf (ให้มา)', 'เช็ค EOF ตั้งแต่ต้น → คืน EOF\nวน format: `%` = conversion, ช่องว่าง = match_space, อื่น ๆ = match_char\nนับ `nconv` เมื่อฟังก์ชันคืน 1, ไม่ใช่ 1 หยุดทันที'],
    ['int ft_scanf', 'ft_scanf', '`va_start` → ส่ง `stdin` กับ ap ให้ ft_vfscanf → `va_end` → คืนผล'],
  ],

  broken_gnl: [
    ['#include "get_next_line.h"', 'include', 'header มี read, malloc, free และ BUFFER_SIZE (ค่า default 10)'],
    ['char *ft_strchr', 'ft_strchr (ซ่อมแล้ว)', 'หาตัว c ในสตริง\nเงื่อนไข `s[i] &&` ทำให้หยุดที่ `\\0` (ของเดิมวิ่งเกิน)'],
    ['void *ft_memcpy', 'ft_memcpy (ซ่อมแล้ว)', 'ก๊อป n ไบต์**จากท้ายมาหน้า** (แบบเดิมของไฟล์) แก้แค่ `--n > 0` → `n-- > 0` และ `[n - 1]` → `[n]`\nของเดิมก๊อปขาด 1 ตัว และ n = 0 จะ underflow'],
    ['size_t ft_strlen', 'ft_strlen (ซ่อมแล้ว)', 'เพิ่ม `if (!s) return 0;` เพราะครั้งแรก ret ยังเป็น NULL'],
    ['int str_append_mem', 'str_append_mem', 'จองก้อนใหม่ = s1 + size2 + 1 → ก๊อปทั้งสองส่วน → ปิด `\\0`\nfree ก้อนเก่าแล้วชี้ s1 ไปก้อนใหม่ (ส่ง `char **` จึงเปลี่ยน pointer ของผู้เรียกได้)'],
    ['int str_append_str', 'str_append_str', 'ต่อท้ายทั้งสตริง = append_mem ด้วยความยาว strlen'],
    ['void *ft_memmove', 'ft_memmove (ซ่อมแล้ว)', 'ก๊อปที่ทับซ้อนกันได้\ndest อยู่หลัง src → ft_memcpy (ก๊อปจากท้าย ข้อมูลไม่โดนทับก่อนก๊อป) · ของเดิมเรียก ft_memmove ตัวเองไม่รู้จบ\ndest อยู่หน้า → ก๊อปจากหน้าไปท้าย i จาก 0 ถึง n · ของเดิมใช้ strlen และ i ที่ติดลบไม่ได้'],
    ['char *get_next_line', 'get_next_line: เริ่มต้น', '`static char b[]` = ข้อมูลที่อ่านมาแล้วแต่ยังไม่ได้คืน อยู่ข้ามการเรียกแต่ละครั้ง\n`ret` = บรรทัดที่กำลังประกอบ, `tmp` = ตำแหน่ง `\\n` ใน b'],
    ['while(!tmp)', 'ลูป: ยังไม่เจอ \\n', 'ต่อ b ทั้งก้อนเข้า ret → read ก้อนใหม่ใส่ b\n-1: free แล้วคืน NULL · 0 (หมดไฟล์): คืน ret ถ้ามีข้อมูล (`*ret`) ไม่งั้น NULL\nท้ายลูปต้องหา `\\n` ใหม่ (ของเดิมลืม = ลูปไม่จบ)'],
    ['if (!str_append_mem(&ret, b, tmp - b + 1))', 'ตัดบรรทัด', 'ต่อ b ตั้งแต่ต้นจนถึง `\\n` (รวม `\\n`) เข้า ret'],
    ['ft_memmove(b, tmp + 1', 'เลื่อนส่วนที่เหลือ', 'ย้ายข้อมูลหลัง `\\n` มาไว้ต้น b (รวม `\\0`) ให้การเรียกครั้งถัดไปใช้ต่อ แล้วคืน ret'],
  ],

  n_queens: [
    ['#include', 'include', 'stdio (fprintf), stdlib (atoi, calloc, free)'],
    ['safe(int *q', 'safe: วางตรงนี้ได้ไหม', 'เทียบกับทุกคอลัมน์ก่อนหน้า `c`\n`d == 0` แถวเดียวกัน · `d == ±(col - c)` อยู่แนวทแยง → วางไม่ได้'],
    ['solve(int *q', 'solve: backtracking', 'ครบ n คอลัมน์ → พิมพ์ q ทั้งแถว (ตัวแรกไม่มีช่องว่างนำ)\nไม่งั้นลองทุกแถวในคอลัมน์นี้ วางได้ก็ recurse คอลัมน์ถัดไป\nไม่ต้องลบค่า เพราะรอบหน้าเขียนทับ `q[col]` เอง'],
    ['main(int argc', 'main', 'รับ n จาก argv → จอง q (calloc) → solve จากคอลัมน์ 0 → free'],
  ],

  permutations: [
    ['#include', 'include', 'unistd (write), stdlib (malloc, calloc, free) — ไม่มี printf/strlen ในข้อนี้'],
    ['len(char *s)', 'len: ความยาวสตริง', 'เขียนเองเพราะ strlen ไม่อยู่ในรายการที่อนุญาต'],
    ['sort(char *s', 'sort: เรียงตัวอักษร', 'selection sort ง่าย ๆ เรียง input ก่อน → ผลลัพธ์จะออกตามลำดับตัวอักษร'],
    ['permute(char *src', 'permute: สร้างทีละตำแหน่ง', 'ครบ n ตัว → write ออกพร้อม `\\n`\nไม่งั้นลองทุกตัวที่ยังไม่ใช้ (`used[i]`) จากซ้ายไปขวา ใส่ที่ `cur[depth]` แล้ว recurse\nกลับมาแล้วคืน `used[i] = 0` (backtrack)'],
    ['main(int argc', 'main', 'จอง src (สำเนาที่จะเรียง), cur (คำตอบที่กำลังสร้าง), used (calloc = 0 ทั้งหมด)\nก๊อป argv[1] → sort → permute → free'],
  ],

  powerset: [
    ['#include', 'include', 'stdio (printf), stdlib (atoi, malloc, free)'],
    ['solve(int *set', 'solve: เอา / ไม่เอา', 'ครบทุกตัว (`i == n`) → ผลรวมเท่าเป้าหมายก็พิมพ์ pick ทั้งหมด (k = 0 → บรรทัดว่าง)\nไม่งั้น: ใส่ set[i] ลง pick แล้ว recurse ด้วย k + 1 → แล้ว recurse อีกทางโดยไม่เอา\nไม่ตัดกิ่งกลางทาง เพราะมีเลขลบได้'],
    ['main(int argc', 'main', 'argv[1] = เป้าหมาย, argv[2..] = เซต → atoi ลง set\nmalloc พังคืน 1 ตามโจทย์ → solve เริ่มที่ i = 0, k = 0, sum = 0'],
  ],

  rip: [
    ['#include', 'include', 'stdio (puts) — puts พิมพ์แล้วขึ้นบรรทัดใหม่ให้'],
    ['min_removals(', 'min_removals: ต้องลบกี่ตัว', '`(` เพิ่ม open · `)` จับคู่กับ open ถ้ามี ไม่งั้นนับเป็น close เกิน\nผลรวม open + close = จำนวนน้อยที่สุดที่ต้องลบ'],
    ['solve(char *s', 'solve: ลองลบ/เก็บ', 'depth = วงเล็บเปิดค้าง ติดลบเมื่อไหร่ตัดทิ้ง\nจบสตริงแล้ว `left == 0` (ลบครบโควตา) และ `depth == 0` → puts\nทางที่ 1 ลบ: เปลี่ยนเป็น `\' \'` → recurse → คืนค่าเดิม\nทางที่ 2 เก็บ: ปรับ depth ตาม `(` `)` แล้ว recurse\nแต่ละชุดตำแหน่งถูกลองครั้งเดียว จึงไม่มีคำตอบซ้ำ'],
    ['main(int argc', 'main', 'แก้ argv[1] ในที่เลย (เป็นหน่วยความจำของเรา) → solve ด้วยโควตา = min_removals'],
  ],

  tsp: [
    ['#include', 'include', 'math (sqrtf), float (FLT_MAX) — ส่วนนี้ข้อสอบให้มา'],
    ['typedef struct', 't_city (ให้มา)', 'เมือง 1 เมือง = พิกัด x, y แบบ float'],
    ['distance(t_city a', 'distance', 'ระยะเส้นตรง = `sqrtf(dx² + dy²)`'],
    ['total_distance(', 'total_distance', 'รวมระยะตามลำดับใน path ทีละคู่\n**บวกขากลับ** จากเมืองสุดท้ายกลับเมืองแรก (เส้นทางปิด)'],
    ['swap(int', 'swap', 'สลับสองช่องใน path ใช้ใน solve'],
    ['solve(t_city', 'solve: ลองทุกลำดับ', 'pos == n → ได้ลำดับครบ คำนวณระยะ อัปเดต *min ถ้าสั้นกว่า\nไม่งั้นสลับ path[pos] กับทุกตัวที่เหลือ → recurse → สลับคืน (backtrack)'],
    ['main(void)', 'main (ให้มา)', 'อ่านพิกัดด้วย fscanf จน input หมด (ไม่เกิน 11)\nn < 2 พิมพ์ 0.00 · solve เริ่ม pos = 1 (ตรึงเมืองแรก) → พิมพ์ `%.2f`'],
  ],
};

// Notes for the Modey solutions (solutions-modey.js), same format.
const WALKTHROUGH_MODEY = {
  filter: [
    ['#define _GNU_SOURCE', 'เปิดใช้ memmem + include', '`_GNU_SOURCE` ต้องมาก่อน include ทุกตัว ไม่งั้น `memmem` ไม่ถูกประกาศ\ninclude: string (memmem, strlen, memmove), stdio (perror), stdlib (realloc, free), unistd (read, write)'],
    ['main(int ac', 'main: ตัวแปร', '`buf` ก้อนที่ read มาแต่ละรอบ · `data` เก็บ stdin ทั้งหมด · `total` จำนวนไบต์ใน data\n`i` = ตำแหน่งใน data ที่พิมพ์ไปถึงแล้ว · `r` เป็น `ssize_t` เพราะ read คืน -1 ได้'],
    ['if (ac != 2', 'เช็ค argument', 'ต้องมี argument เดียวพอดี และห้ามว่าง `""` ไม่งั้น return 1\n`s` = คำที่ต้องหา, `len` = ความยาวของมัน'],
    ['while ((r = read', 'อ่าน stdin ให้หมด', 'read ทีละก้อนจนได้ 0 (หมด) หรือ -1 (error)\nขยาย data ให้พอใส่ก้อนใหม่ + `\\0` → ก๊อปก้อนต่อท้าย → total += r\nเก็บผล realloc ใส่ `tmp` ก่อน ถ้าพังจะยัง free data เดิมได้'],
    ['if (r < 0)', 'read พัง', 'ออกจากลูปเพราะ -1 → `perror("Error")` พิมพ์ `Error: <ข้อความ>` ลง stderr แล้ว return 1'],
    ['if (!data)', 'stdin ว่าง', 'ไม่ได้อ่านอะไรเลย data ยังเป็น NULL → ไม่มีอะไรต้องพิมพ์ return 0'],
    ['while ((tmp = memmem', 'แทนที่แล้วพิมพ์', '`memmem` หาคำครั้งถัดไป เริ่มจาก `data + i`\nเจอ → พิมพ์ข้อความก่อนหน้าคำ → พิมพ์ `*` len ตัว → ให้ i กระโดดไปหลังคำ\nไม่เจอแล้ว memmem คืน NULL ลูปจบ'],
    ['write(1, data + i, total - i)', 'พิมพ์ที่เหลือ', 'พิมพ์ส่วนหลังคำสุดท้ายที่เจอจนจบ แล้ว free'],
  ],

  ft_scanf: [
    ['#include <stdarg.h>', 'include', 'stdarg (va_list), ctype (isspace, isdigit), stdio (fgetc, ungetc)'],
    ['match_space(FILE', 'match_space: กินช่องว่าง', 'อ่านทิ้งตราบที่เป็นช่องว่าง\nตัวแรกที่ไม่ใช่ช่องว่าง → `ungetc` คืนให้คนถัดไปอ่าน'],
    ['match_char(FILE', 'match_char: ตัวอักษรใน format', 'อ่าน 1 ตัว ตรงกับที่ format ต้องการคืน 1\nไม่ตรง → ungetc คืนแล้วคืน 0 ให้ scanf หยุด'],
    ['scan_char(FILE', 'scan_char: %c', 'อ่าน 1 ตัวเลย **ไม่ข้ามช่องว่าง**\nเขียนลง `va_arg(ap, char *)` · เจอ EOF คืน 0'],
    ['scan_int(FILE', 'scan_int: %d', 'จำเครื่องหมาย `-` `+` → ตัวถัดไปต้องเป็นตัวเลข ไม่งั้น ungetc แล้วคืน 0\nสะสม `num * 10 + digit` จนเจอตัวที่ไม่ใช่ตัวเลข → ungetc คืน\nเขียน `num * sign` ลง `va_arg(ap, int *)`'],
    ['scan_string(FILE', 'scan_string: %s', 'อ่านเก็บจนเจอช่องว่าง/EOF แล้ว ungetc ช่องว่างคืน\nปิดท้ายด้วย `\\0` · คืน 1 ถ้าได้อย่างน้อย 1 ตัว (`i > 0`)'],
    ['match_nconv(FILE', 'match_nconv: เลือก conversion', 'ตัวเดียวกับ `match_conv` ที่ข้อสอบให้มา (ข้อสอบจริงไม่ต้องพิมพ์เอง)\n%d กับ %s เรียก match_space ก่อน = ข้ามช่องว่างนำหน้า, %c ไม่ข้าม'],
    ['ft_vfscanf(FILE', 'ft_vfscanf (ให้มา)', 'เช็ค EOF ตั้งแต่ต้น → คืน EOF\nวน format: `%` = conversion, ช่องว่าง = match_space, อื่น ๆ = match_char\nนับ `nconv` เมื่อสำเร็จ ไม่สำเร็จหยุดทันที'],
    ['ft_scanf(const char', 'ft_scanf', '`va_start` → ส่ง `stdin` กับ ap ให้ ft_vfscanf → `va_end` → คืนผล\nข้อนี้ในข้อสอบเหลือแค่เติม 3 บรรทัดนี้'],
  ],

  broken_gnl: [
    ['#include "get_next_line.h"', 'include', 'เขียนใหม่ทั้งไฟล์แทนการซ่อมทีละจุด ใช้ helper แค่ 4 ตัว\nheader มี read, malloc, free และ BUFFER_SIZE'],
    ['ft_strlen(char *s)', 'ft_strlen', '`s &&` ทำให้ส่ง NULL มาได้ (คืน 0) เพราะครั้งแรก line ยังเป็น NULL'],
    ['ft_strchr(char *s', 'ft_strchr', 'หาตัว c ในสตริง ไม่เจอคืน NULL\nเช็ค `s[i]` ในเงื่อนไขลูป = หยุดที่ `\\0` (ของเดิมวิ่งเกิน)'],
    ['ft_memcpy(void', 'ft_memcpy', 'ก๊อป n ไบต์จากหน้าไปหลัง ด้วย i ตั้งแต่ 0 ถึง n-1'],
    ['join(char *s1', 'join: ต่อสตริง', 'จองก้อนใหม่ = s1 + n + 1 → ก๊อป s1 แล้วต่อด้วย n ตัวแรกของ s2 → ปิด `\\0`\nfree s1 เก่าแล้วคืนก้อนใหม่ (ใช้แทน str_append_mem ของเดิม)'],
    ['get_next_line(int fd)', 'get_next_line: เริ่มต้น', '`static char buf[]` = ข้อมูลที่อ่านมาแต่ยังไม่ได้คืน อยู่ข้ามการเรียกแต่ละครั้ง (static เริ่มเป็น 0 ทั้งหมด)\n`line` = บรรทัดที่กำลังประกอบ, `tmp` = ตำแหน่ง `\\n` ใน buf'],
    ['while (!(tmp', 'ลูป: ยังไม่เจอ \\n', 'ต่อ buf ทั้งก้อนเข้า line → read ก้อนใหม่ใส่ buf\nread ได้ 0 หรือ -1: ถ้า line มีข้อมูล ล้าง buf แล้วคืน line (บรรทัดสุดท้ายไม่มี `\\n`) ไม่งั้น free คืน NULL\nเงื่อนไขลูปหา `\\n` ใหม่ทุกรอบ (ของเดิมลืม = ลูปไม่จบ)'],
    ['line = join(line, buf, tmp - buf + 1)', 'ตัดบรรทัด', 'ต่อ buf ตั้งแต่ต้นจนถึง `\\n` (รวม `\\n`) เข้า line'],
    ['ft_memcpy(buf, tmp + 1', 'เลื่อนส่วนที่เหลือ', 'ย้ายข้อมูลหลัง `\\n` มาไว้ต้น buf (+1 = รวม `\\0`) ให้ครั้งหน้าใช้ต่อ แล้วคืน line\nก๊อปจากหน้าไปหลังเลยไม่ทับข้อมูลที่ยังไม่ได้ก๊อป'],
  ],

  n_queens: [
    ['#include <stdio.h>', 'include', 'stdio (printf), stdlib (atoi, abs, malloc, free)\nระวัง: subject ข้อนี้อนุญาต `fprintf` แต่ไม่มี `printf` กับ `abs` ในรายการ จะให้ชัวร์ใช้ `fprintf(stdout, ...)` และเขียน abs เอง'],
    ['check(char *s)', 'check: เป็นตัวเลขไหม', 'ข้าม `+`/`-` ตัวแรกได้ แล้วต้องมีตัวเลขอย่างน้อย 1 ตัว และเป็นตัวเลขล้วน'],
    ['print_board(int', 'print_board: พิมพ์ 1 คำตอบ', '`board[i]` = แถวของควีนในคอลัมน์ i\nคั่นด้วยช่องว่าง (ตัวแรกไม่มี) แล้วขึ้นบรรทัดใหม่'],
    ['safe(int *board', 'safe: วางตรงนี้ได้ไหม', 'เทียบกับทุกคอลัมน์ก่อนหน้า i\n`board[i] == row` แถวเดียวกัน · `abs(แถวต่าง) == abs(คอลัมน์ต่าง)` อยู่แนวทแยง → วางไม่ได้'],
    ['solve(int *board', 'solve: backtracking', 'ครบ n คอลัมน์ → พิมพ์\nไม่งั้นลองทุกแถวในคอลัมน์นี้ วางได้ก็ recurse คอลัมน์ถัดไป\nไม่ต้องลบค่า เพราะรอบหน้าเขียนทับ `board[col]` เอง'],
    ['main(int ac', 'main', 'ต้องมี argument เดียวและเป็นตัวเลข ไม่งั้น return 1 · n <= 0 ไม่พิมพ์อะไร\nจอง board → solve จากคอลัมน์ 0 → free'],
  ],

  permutations: [
    ['#include <unistd.h>', 'include', 'unistd (write), stdlib (malloc, free)'],
    ['ft_isalpha(int c)', 'ft_isalpha', 'เป็นตัวอักษร a–z หรือ A–Z ไหม (ใช้เช็ค input)'],
    ['ft_strlen(char *s)', 'ft_strlen', 'เขียนเองเพราะ strlen ไม่อยู่ในรายการที่อนุญาต'],
    ['swap(char *a', 'swap', 'สลับตัวอักษร 2 ตัวผ่าน pointer'],
    ['sort(char *s)', 'sort: เรียงตัวอักษร', 'เทียบ s[i] กับทุกตัวหลังมัน ตัวไหนน้อยกว่าก็สลับขึ้นมา\nเริ่มจากสตริงที่เรียงแล้ว = permutation แรกตามตัวอักษร'],
    ['reverse(char *s', 'reverse: กลับช่วง', 'สลับหัวท้ายเข้าหากันจาก start ถึง end'],
    ['next_perm(char *s)', 'next_perm: ลำดับถัดไป', '1. จากขวา หา i ตัวแรกที่ `s[i] < s[i + 1]` — ไม่มี = ตัวสุดท้ายแล้ว คืน 0\n2. จากขวา หา j ตัวแรกที่มากกว่า s[i] → สลับ\n3. กลับลำดับส่วนหลัง i ให้เป็นน้อยไปมาก'],
    ['main(int ac', 'main: เช็ค input', 'ต้องมี argument เดียว · สตริงว่างไม่พิมพ์อะไร · ต้องเป็นตัวอักษรล้วน'],
    ['char *s = malloc', 'ก๊อป argument', 'ก๊อป argv[1] ใส่ s พร้อม `\\0` (จะได้เรียงได้)'],
    ['sort(s);', 'เรียงแล้วพิมพ์', 'เรียงก่อน → พิมพ์ → ขอ next_perm ไปเรื่อย ๆ จนคืน 0 → free'],
  ],

  powerset: [
    ['#include <stdio.h>', 'include', 'stdio (printf), stdlib (atoi, malloc, free)'],
    ['check_args(int ac', 'check_args: ตัวเลขทั้งหมด', 'ทุก argument ข้าม `+`/`-` ได้ 1 ตัว ที่เหลือต้องเป็นตัวเลข'],
    ['print_set(int *set', 'print_set: พิมพ์ subset', 'พิมพ์เฉพาะตัวที่ `used[i]` เป็น 1 ตามลำดับเดิม คั่นด้วยช่องว่าง\nไม่ได้เลือกสักตัว = บรรทัดว่าง'],
    ['solve(int *set', 'solve: เอา / ไม่เอา', 'ครบทุกตัว (`idx == n`) → ผลรวมเท่าเป้าหมายก็พิมพ์\nไม่งั้น: เอาตัวที่ idx (used = 1, sum บวกเพิ่ม) แล้ว recurse → ไม่เอา (used = 0) แล้ว recurse\nไม่ตัดกิ่งกลางทาง เพราะมีเลขลบได้'],
    ['main(int ac', 'main: เช็ค argument', 'น้อยกว่า 3 ตัว (ไม่มีเซต) → return 1\nเช็คว่าเป็นตัวเลขทั้งหมด'],
    ['int target = atoi', 'แปลงเลข + จองที่', '`target` = argument แรก, n = จำนวนตัวในเซต\nจอง set (ค่าตัวเลข) กับ used (เลือกหรือไม่) · จองพังให้ free ที่จองได้แล้ว return 1'],
    ['solve(set, used, n, target, 0, 0)', 'เริ่มค้น', 'เริ่มจากตัวที่ 0 ผลรวม 0 → free ทั้งคู่'],
  ],

  rip: [
    ['#include <unistd.h>', 'include', 'unistd (write) อย่างเดียว'],
    ['len(char *s)', 'len', 'ความยาวสตริง (ใช้ตอน write)'],
    ['valid(char *s)', 'valid: balanced ไหม', 'นับ `(` +1, `)` -1 ข้ามช่องว่าง\nติดลบเมื่อไหร่ = `)` เกิน → ไม่ผ่าน · จบต้องได้ 0 พอดี'],
    ['print(char *s)', 'print', 'write สตริงตามด้วย `\\n`'],
    ['solve(char *s, int idx', 'solve: ลองลบ', 'ลบครบแล้ว (`rm == 0`) → valid ก็พิมพ์\nไม่งั้นไล่วงเล็บตั้งแต่ idx: แทนด้วย `\' \'` → recurse ตัวถัดไปโดย rm - 1 → คืนตัวเดิม\nเลือกเฉพาะตัวที่อยู่ "หลัง" ตัวที่ลบล่าสุด = ไม่ลองชุดเดิมซ้ำ จึงไม่มีบรรทัดซ้ำ'],
    ['main(int ac', 'main: นับจำนวนที่ต้องลบ', '`(` ที่ยังไม่มีคู่ = open · `)` ที่ไม่มี `(` ให้จับคู่ = close\nopen + close = จำนวนน้อยสุดที่ต้องลบ'],
    ['solve(av[1], 0, open + close)', 'เริ่มค้น', 'ลบตรงใน av[1] เลยไม่ต้อง malloc'],
  ],

  tsp: [
    ['#include <stdio.h>', 'include', 'stdio (fscanf, printf), math (sqrtf), float (FLT_MAX)'],
    ['typedef struct s', 'struct เมือง', 'ชื่อสั้น `t` มี x, y\nในข้อสอบไฟล์ให้ `t_city` และ main มาแล้ว เติมแค่ distance / total_distance / solve'],
    ['dist(t a', 'dist: ระยะ 2 เมือง', 'สูตรพีทาโกรัส `sqrtf(dx² + dy²)`'],
    ['total(t *c', 'total: ความยาวเส้นทาง', 'รวมระยะเมืองติดกันตามลำดับใน p แล้วบวกระยะจากเมืองสุดท้ายกลับเมืองแรก'],
    ['swap(int *a', 'swap', 'สลับเลข 2 ตัวใน p'],
    ['solve(t *c', 'solve: ลองทุกลำดับ', 'ครบทุกตำแหน่ง → คิดความยาว ถ้าสั้นกว่า *min ก็จำไว้\nไม่งั้นสลับแต่ละตัวมาไว้ที่ pos → recurse pos + 1 → สลับคืน'],
    ['main()', 'main', 'อ่านพิกัด `x, y` ด้วย fscanf จนหมด (ไม่เกิน 11)\nn < 2 พิมพ์ 0.00 (`!printf` = 0 เป็นค่า return)\np เริ่ม 0..n-1 · solve เริ่ม pos = 1 (ตรึงเมืองแรก) → พิมพ์ `%.2f`'],
  ],
};

// Notes for the short answers (solutions-short.js), same format.
// broken_gnl is the reference's file (it has to be fixed in place), so it
// shares the reference notes — set after this object.
const WALKTHROUGH_SHORT = {
  filter: [
    ['#define _GNU_SOURCE', 'include', '`_GNU_SOURCE` ก่อน include ทุกตัว ไม่งั้นไม่มี `memmem`\nstdio (perror), stdlib (realloc, free), string (strlen, memmem), unistd (read, write)'],
    ['main(int ac', 'ตัวแปร', '`s` เก็บ stdin ทั้งหมด · `len` จำนวนไบต์ · `r = 1` ให้เข้าลูปรอบแรกได้'],
    ['if (ac != 2', 'เช็ค argument', 'ต้องมี 1 ตัวพอดีและไม่ว่าง ไม่งั้น return 1'],
    ['while (r > 0)', 'อ่านให้หมด', 'ขยาย s อีก 1024 → read ต่อท้ายที่ `s + len` → len += r\nr == 0 (หมด) ลูปจบเอง · พังเมื่อไหร่: `perror("Error")` → free → return 1'],
    ['n = strlen(av[1])', 'แทนที่แล้วพิมพ์', 'ไล่ i ทีละตำแหน่ง: ตรงกับคำ (`memmem` บนช่วงยาว n พอดี) → พิมพ์ `*` n ตัว กระโดด n\nไม่ตรง → พิมพ์ตัวนั้นแล้วขยับ 1'],
    ['free(s);', 'จบ', 'free แล้ว return 0'],
  ],

  ft_scanf: [
    ['#include <stdarg.h>', 'include (ให้มา)', 'stdarg (va_list), stdio (fgetc, ungetc, ferror), ctype (isspace, isdigit)\nไฟล์ที่ข้อสอบให้มาไม่แก้เลย เติมโค้ดใต้ `// You may insert code here` อย่างเดียว'],
    ['match_space(FILE', 'match_space', 'กินช่องว่างจนเจอตัวอื่น → ungetc คืน แล้วตกไปที่ `return (0)` ที่ให้มา\n`ungetc(EOF)` ไม่ทำอะไร เลยไม่ต้องเช็ค EOF ก่อน'],
    ['match_char(FILE', 'match_char', 'ตรงคืน 1 · ไม่ตรง ungetc คืนแล้วตกไปที่ `return (0)` ที่ให้มา (ไม่ใช่ 1 = หยุด)'],
    ['scan_char(FILE', 'scan_char: %c', 'อ่าน 1 ตัว ไม่ข้ามช่องว่าง · ไม่ใช่ EOF → `*va_arg(ap, char *) = ch` แล้วคืน 1\nEOF ตกไปที่ `return (0)` ที่ให้มา'],
    ['scan_int(FILE', 'scan_int: %d', '`-` → sign = -1 · มีเครื่องหมายก็อ่านตัวถัดไป → ถ้าเป็นตัวเลข: สะสม `n * 10 + digit` → ungetc ตัวที่เกิน → เขียน `n * sign` คืน 1\nไม่ใช่ตัวเลข: ungetc คืน แล้วตกไปที่ `return (0)`'],
    ['scan_string(FILE', 'scan_string: %s', 'เก็บจนเจอช่องว่าง → ungetc → ปิด `\\0` · ได้อย่างน้อย 1 ตัวคืน 1 ไม่งั้น `return (0)` ที่ให้มา'],
    ['match_conv(FILE', 'match_conv (ให้มา)', 'ข้อสอบให้มาแล้ว ไม่ต้องแก้'],
    ['int ft_vfscanf', 'ft_vfscanf (ให้มา)', 'ข้อสอบให้มาแล้ว ไม่ต้องแก้\nscan_* ต้องคืน 1 เมื่อสำเร็จ เพราะตรงนี้เช็ค `!= 1`'],
    ['int ft_scanf', 'ft_scanf', 'เติมใต้ `// ...` ตัวแรก: ประกาศ ap + `va_start` · ใต้ตัวที่สอง: `va_end`'],
  ],

  n_queens: [
    ['#include', 'include', 'stdio (fprintf), stdlib (atoi, malloc, free)'],
    ['*q;', 'ตัวแปร global', '`q[col]` = แถวของควีนในคอลัมน์ col · `n` = ขนาดกระดาน\nเป็น global จะได้ไม่ต้องส่งต่อทุกฟังก์ชัน'],
    ['ok(int col', 'ok: วางได้ไหม', 'เทียบทุกคอลัมน์ก่อนหน้า: แถวเดียวกัน หรือห่างแถว = ห่างคอลัมน์ (ทแยง) → วางไม่ได้'],
    ['solve(int col)', 'solve', 'ครบ n คอลัมน์ → พิมพ์ทุกตัว คั่นด้วยช่องว่าง (ตัวแรกไม่มี) แล้วพิมพ์ `\\n`\nไม่งั้นลองทุกแถว วางได้ก็ไปคอลัมน์ถัดไป'],
    ['main(int ac', 'main', 'n จาก argv · n <= 0 ไม่พิมพ์อะไร · จอง q → solve(0) → free'],
  ],

  permutations: [
    ['#include', 'include', 'stdlib (malloc, calloc, free), unistd (write)'],
    ['*s;', 'ตัวแปร global', '`s` ตัวอักษร (เรียงแล้ว) · `out` คำที่กำลังสร้าง · `used[i]` ใช้ s[i] ไปหรือยัง'],
    ['perm(int k)', 'perm', 'ครบ n ตัว → write out ทีเดียว (ช่องสุดท้ายเป็น `\\n` เตรียมไว้แล้ว)\nไม่งั้นลองทุกตัวที่ยังไม่ใช้ จากซ้ายไปขวา → recurse → คืน used'],
    ['main(int ac', 'main: ความยาว', 'ใช้ argv[1] ตรง ๆ · นับ n เอง (ไม่มี strlen ให้ใช้)'],
    ['for (int i = 0; i < n; i++)', 'bubble sort', 'สลับคู่ที่ติดกันที่กลับลำดับ ทำ n รอบ → s เรียงตามตัวอักษร\nเรียงก่อน = ผลลัพธ์ออกตามลำดับตัวอักษรเอง'],
    ['out = malloc(n + 1)', 'จอง แล้วเริ่ม', 'out ยาว n + 1 ใส่ `\\n` ท้ายไว้เลย · used (calloc = 0 ทั้งหมด) → perm(0) → free'],
  ],

  powerset: [
    ['#include', 'include', 'stdio (printf), stdlib (atoi, malloc, free)'],
    ['*set;', 'ตัวแปร global', '`set` ตัวเลขทั้งหมด · `pick` ตัวที่เลือกอยู่ (k ตัว) · `target` ผลรวมที่ต้องการ'],
    ['solve(int i', 'solve: เอา / ไม่เอา', 'ครบทุกตัว → ผลรวมตรงก็พิมพ์ pick (k = 0 ได้บรรทัดว่าง)\nเอา: ใส่ pick[k] แล้วไปต่อ k + 1 · ไม่เอา: ไปต่อ k เดิม\nไม่ตัดกิ่งกลางทาง เพราะเลขติดลบได้'],
    ['main(int ac', 'main', 'target = argv[1] · n = จำนวนที่เหลือ\nจอง +1 กัน malloc(0) · พังคืน 1 · atoi ใส่ set → solve(0, 0, 0) → free'],
  ],

  rip: [
    ['#include', 'include', 'stdio (puts — พิมพ์แล้วขึ้นบรรทัดใหม่ให้)'],
    ['solve(char *s', 'solve: จบสตริง', '`open` = วงเล็บเปิดค้าง ติดลบ = `)` เกิน ตัดทิ้งทันที\nจบสตริง: ลบครบโควตา (`left == 0`) และ open = 0 → puts'],
    ['if (left > 0)', 'ทางที่ 1: ลบตัวนี้', 'แทนด้วย `\' \'` → ไปตัวถัดไปโดย left - 1 → คืนตัวเดิม'],
    ['solve(s, i + 1, left, open +', 'ทางที่ 2: เก็บตัวนี้', '`(` → open + 1 · `)` → open - 1 (input มีแต่วงเล็บ)\nทุกชุดตำแหน่งถูกลองครั้งเดียว จึงไม่มีบรรทัดซ้ำ'],
    ['main(int ac', 'main: ต้องลบกี่ตัว', '`(` → open++ · `)` จับคู่ได้ → open-- · จับคู่ไม่ได้ → close++\nopen + close = จำนวนน้อยสุดที่ต้องลบ'],
    ['solve(av[1]', 'เริ่ม', 'แก้ใน argv[1] ได้เลย ไม่ต้อง malloc'],
  ],

  tsp: [
    ['#include', 'include (ให้มา)', 'math (sqrtf), float (FLT_MAX)\nไฟล์ที่ข้อสอบให้มาไม่แก้เลย เขียนฟังก์ชันต่อท้ายไฟล์ (มี prototype ด้านบนแล้ว)'],
    ['typedef struct', 't_city (ให้มา)', 'เมือง = พิกัด x, y'],
    ['float\tdistance(t_city a, t_city b);', 'prototype (ให้มา)', 'ข้อสอบประกาศไว้แล้ว เราเขียนตัวจริงไว้ท้ายไฟล์'],
    ['int\tmain(void)', 'main (ให้มา)', 'อ่านพิกัด → solve(…, 1, &min) ตรึงเมืองแรก → พิมพ์ `%.2f`'],
    ['distance(t_city a', 'distance', 'พีทาโกรัส `sqrtf(dx * dx + dy * dy)`'],
    ['total_distance(t_city', 'total_distance', 'รวมระยะ path[i] → path[i + 1] ทุกคู่\n`(i + 1) % n` ทำให้คู่สุดท้ายวนกลับเมืองแรกเอง ไม่ต้องบวกแยก'],
    ['swap(int', 'swap', 'สลับเลข 2 ตัวใน path (อยู่ก่อน solve เพราะ solve เรียกใช้)'],
    ['solve(t_city', 'solve', 'ครบทุกตำแหน่ง → คิดระยะ สั้นกว่าก็เก็บใน *min\nไม่งั้นสลับแต่ละตัวมาไว้ที่ pos → recurse → สลับคืน'],
  ],
};

WALKTHROUGH_SHORT.broken_gnl = WALKTHROUGH.broken_gnl;

// Notes for the easy-to-read answers (solutions-easy.js), same format. Level 1
// and tsp have the short answers' code (tsp with comments added), so they share
// those notes.
const WALKTHROUGH_EASY = {
  filter: WALKTHROUGH_SHORT.filter,
  ft_scanf: WALKTHROUGH_SHORT.ft_scanf,
  broken_gnl: WALKTHROUGH_SHORT.broken_gnl,
  tsp: WALKTHROUGH_SHORT.tsp,

  n_queens: [
    ['#include <stdio.h>', 'include + global', 'stdio (fprintf), stdlib (atoi, malloc, free)\n`q[col]` = แถวของควีนในคอลัมน์ col · `n` = ขนาดกระดาน'],
    ['is_safe(int col', 'is_safe: วางได้ไหม', 'เทียบทุกคอลัมน์ก่อนหน้า 3 กรณี: แถวเดียวกัน · ทแยงลง · ทแยงขึ้น\nชนอันไหนคืน 0 ทันที ไม่ชนเลยคืน 1'],
    ['print_board(void)', 'print_board: พิมพ์คำตอบ', 'ช่องว่างก่อนทุกตัวยกเว้นตัวแรก แล้วขึ้นบรรทัด'],
    ['solve(int col)', 'solve: backtracking', 'ครบ n คอลัมน์ → พิมพ์ · ไม่งั้นลองทุกแถว วางได้ก็ไปคอลัมน์ถัดไป'],
    ['main(int ac', 'main', 'argument 1 ตัว → `n = atoi` · n <= 0 ไม่พิมพ์ · จอง q → solve(0) → free'],
  ],

  permutations: [
    ['#include <stdlib.h>', 'include + global', 'stdlib (malloc, calloc, free), unistd (write)\n`s` ตัวอักษร · `out` คำที่สร้าง · `used[]` ใช้ไปแล้วหรือยัง · `n` ความยาว'],
    ['sort(void)', 'sort: เรียง a → z', 'bubble sort: คู่ติดกันผิดลำดับก็สลับ วนซ้ำ n รอบ'],
    ['perm(int k)', 'perm: backtracking', 'เลือกครบ n ตัว → พิมพ์ · ไม่งั้นลองทุกตัวที่ยังไม่ใช้ จากน้อยไปมาก\nเลือก → ไปต่อ → ยกเลิก (`used[i] = 0`)'],
    ['main(int ac', 'main', 'นับความยาว → sort → จอง out กับ used (calloc = เริ่มเป็น 0) → perm(0) → free'],
  ],

  powerset: [
    ['#include <stdio.h>', 'include + global', 'stdio (printf), stdlib (atoi, malloc, free)\n`set` ตัวเลข · `pick` ตัวที่เลือก · `n` จำนวน · `target` ผลรวมที่ต้องการ'],
    ['print_pick(int k)', 'print_pick: พิมพ์ตัวที่เลือก', 'พิมพ์ pick[0..k-1] คั่นช่องว่าง แล้วขึ้นบรรทัด (k = 0 → บรรทัดว่าง)'],
    ['solve(int i', 'solve: เอา / ไม่เอา', 'ถามครบทุกตัว → ผลรวมตรงเป้าก็พิมพ์\nไม่งั้นใส่ `pick[k]` แล้วลอง "เอา" (k + 1, sum + set[i]) และ "ไม่เอา"'],
    ['main(int ac', 'main', 'เป้า = av[1] · ที่เหลือคือเซต · จอง +1 กัน malloc(0) · solve(0, 0, 0) → free'],
  ],

  rip: [
    ['#include <stdio.h>', 'include + global', 'stdio (puts) · `need` = ต้องลบกี่ตัว'],
    ['min_remove(char *s)', 'min_remove: ต้องลบกี่ตัว', 'ไล่ซ้ายไปขวา: `(` → open++ · `)` มีคู่ → open-- · ไม่มีคู่ → close++\nต้องลบ = open (ค้าง) + close (เกิน) · ผลต่างของจำนวน `(` กับ `)` ใช้ไม่ได้ เช่น `)(`'],
    ['is_valid(char *s)', 'is_valid: balanced ไหม', 'open ห้ามติดลบระหว่างทาง และต้องเป็น 0 ตอนจบ · ช่องว่างข้ามไป'],
    ['solve(char *s', 'solve: ลบ / เก็บ', 'ลบครบ need ตัว → เช็ค is_valid แล้วพิมพ์ · หมดสตริงก่อนก็เลิก\nลบ = แทน `\' \'` แล้วไปต่อ → คืนตัวเดิม → ลองแบบเก็บ'],
    ['main(int ac', 'main', 'argument 1 ตัว · need = min_remove · solve(av[1], 0, 0)'],
  ],
};

// Short set, broken_gnl: how to find the bugs on the exam machine instead of
// remembering them — compile, run, read what goes wrong, fix, repeat. The
// output shown is what gcc / AddressSanitizer really print for each stage.
// Each fix is a find → replace on the handed-out file; test/verify-all.cjs
// applies them in order and checks the result is the short answer. `alts`:
// other right ways to write `to` (same number of lines) that repair mode accepts.
const DEBUG_LESSON = {
  broken_gnl: {
    setup: [
      ['ไฟล์ทดสอบ', 'main.c วนเรียกจนได้ NULL · ใส่ `[ ]` รอบบรรทัดให้เห็นว่า `\\n` อยู่ไหน',
        '#include <stdio.h>\n#include "get_next_line.h"\n\nint main(void)\n{\n\tchar *line;\n\n\twhile ((line = get_next_line(0)))\n\t{\n\t\tprintf("[%s]", line);\n\t\tfree(line);\n\t}\n\treturn (0);\n}'],
      ['ข้อมูลทดสอบ', '`t2.txt` บรรทัดท้ายไม่มี `\\n`',
        "printf 'Line 1\\nLine 2\\nLine 3\\n' > t1.txt\nprintf 'ab\\ncd' > t2.txt"],
      ['compile + รัน', 'ค้างให้กด Ctrl+C · พัง (Segmentation fault) ให้ compile ใหม่ด้วย `-g -fsanitize=address` จะบอกชื่อฟังก์ชันกับเลขบรรทัด',
        'gcc -Wall -Wextra -Werror -D BUFFER_SIZE=42 get_next_line.c main.c\n./a.out < t1.txt\n./a.out < t2.txt\n\ngcc -g -fsanitize=address -D BUFFER_SIZE=42 get_next_line.c main.c'],
    ],
    steps: [
      { title: 'compile ไม่ผ่าน → ft_memmove',
        see: "error: comparison of unsigned expression in '>= 0' is always true\n   58 |   while (i >= 0)",
        why: '`size_t` ไม่มีทางติดลบ ลูปไม่จบ · อ่านทั้งฟังก์ชัน: ft_memcpy ของไฟล์นี้ก๊อป**จากท้าย** (ปลอดภัยเมื่อ dest อยู่หลัง src) เลยตั้งใจให้ `dest > src` ส่งไป **ft_memcpy** (ของเดิมเรียกตัวเองไม่รู้จบ)\nส่วนล่างคือกรณี dest อยู่หน้า → ก๊อป**จากหน้า**: i จาก 0 ถึง n (ไม่ใช่ strlen)\nclang (`cc`) อาจไม่ขึ้น error นี้ ต้องอ่านเอง',
        from: '    return ft_memmove(dest, src, n);\n  else if (dest == src)\n    return dest;\n  size_t i = ft_strlen((char *)src) - 1;\n  while (i >= 0)\n  {\n    ((char *)dest)[i] = ((char *)src)[i];\n    i--;\n  }',
        to: '    return ft_memcpy(dest, src, n);\n  else if (dest == src)\n    return dest;\n  size_t i = 0;\n  while (i < n)\n  {\n    ((char *)dest)[i] = ((char *)src)[i];\n    i++;\n  }' },
      { title: 'รันแล้วพัง → ft_strchr',
        see: 'Segmentation fault\n\n(-fsanitize=address)\nERROR: AddressSanitizer: global-buffer-overflow\n    #0 in ft_strchr get_next_line.c:6',
        why: '`buffer-overflow` = อ่านเลยท้าย array · ลูปหยุดแค่ตอนเจอ c ไม่หยุดที่ `\\0`',
        from: '  while(s[i] != c)', to: '  while (s[i] && s[i] != c)',
        alts: ["  while (s[i] != c && s[i] != '\\0')", '  while (s[i] != c && s[i])', "  while (s[i] != '\\0' && s[i] != c)"] },
      { title: 'พังต่อ → ft_strlen ได้ NULL',
        see: 'ERROR: AddressSanitizer: SEGV on unknown address 0x000000000000\n    #0 in ft_strlen get_next_line.c:24\n    #1 in str_append_mem\n    #2 in str_append_str\n    #3 in get_next_line',
        why: 'address `0x0` = อ่าน NULL · ไล่ #3 → #0: ครั้งแรก `ret` ยังเป็น NULL แล้วส่งเข้า strlen',
        from: '  size_t res = 0;\n', to: '  size_t res = 0;\n  if (!s)\n    return 0;\n',
        alts: ['  size_t res = 0;\n  if (s == NULL)\n    return 0;\n'] },
      { title: 'พังต่อ → ft_memcpy',
        see: 'ERROR: AddressSanitizer: SEGV on unknown address\n    #0 in ft_memcpy get_next_line.c:17\n    #1 in str_append_mem',
        why: 'ครั้งแรก b ว่าง n = 0 → `--n` ทำให้ size_t วนกลับเป็นเลขใหญ่มาก ก๊อปจนพัง · n อื่นก็ก๊อปขาด 1 ตัว\nคงการก๊อปจากท้ายไว้ (ft_memmove พึ่งอันนี้) แก้แค่ลด n **หลัง**เช็ค: `n-- > 0` แล้วใช้ `[n]`',
        from: '  while(--n > 0)\n    ((char *)dest)[n - 1] = ((char *)src)[n - 1];',
        to: '  while(n-- > 0)\n    ((char *)dest)[n] = ((char *)src)[n];' },
      { title: 'ค้าง → get_next_line (4 จุด แก้ทีเดียว)',
        see: './a.out < t1.txt\n(ค้าง ไม่พิมพ์อะไร ต้องกด Ctrl+C)',
        why: 'helper ใช้ได้หมดแล้ว ที่เหลือพังใน get_next_line ทั้งหมด 4 จุด แก้รวดเดียวไล่**จากบนลงล่าง**:\n1. read คืน -1 → `free(ret)` ก่อนคืน NULL (ไม่งั้น leak)\n2. หลัง `b[read_ret] = 0;` → read คืน 0 = หมดไฟล์: `*ret` มีข้อมูลคืน ret (บรรทัดท้ายไม่มี `\\n`) ไม่งั้น free คืน NULL\n3. ท้ายลูป → หา `\\n` ใหม่: `tmp = ft_strchr(b, \'\\n\');` (ของเดิมไม่เปลี่ยน tmp = ค้าง)\n4. ก่อน `return ret;` → เลื่อนที่เหลือหลัง `\\n` มาต้น b (+1 = รวม `\\0`) ไม่งั้นได้บรรทัดแรกซ้ำ\nตรงข้อ 2 ret ไม่มีทางเป็น NULL (เพิ่งต่อ b เข้าไป) เช็คแค่ `*ret` พอ · เสร็จแล้วลอง `-D BUFFER_SIZE=1` กับ `=5`',
        from: '    if (read_ret == -1)\n      return (NULL);\n    b[read_ret] = 0;\n  }\n  if (!str_append_mem(&ret, b, tmp - b + 1))\n  {\n    free(ret);\n    return NULL;\n  }\n  return ret;',
        to: "    if (read_ret == -1)\n    {\n      free(ret);\n      return (NULL);\n    }\n    b[read_ret] = 0;\n    if (read_ret == 0)\n    {\n      if (*ret)\n        return ret;\n      free(ret);\n      return NULL;\n    }\n    tmp = ft_strchr(b, '\\n');\n  }\n  if (!str_append_mem(&ret, b, tmp - b + 1))\n  {\n    free(ret);\n    return NULL;\n  }\n  ft_memmove(b, tmp + 1, ft_strlen(tmp + 1) + 1);\n  return ret;",
        alts: ["    if (read_ret == -1)\n    {\n      free(ret);\n      return (NULL);\n    }\n    b[read_ret] = 0;\n    if (read_ret == 0)\n    {\n      if (ret && *ret)\n        return ret;\n      free(ret);\n      return NULL;\n    }\n    tmp = ft_strchr(b, '\\n');\n  }\n  if (!str_append_mem(&ret, b, tmp - b + 1))\n  {\n    free(ret);\n    return NULL;\n  }\n  ft_memmove(b, tmp + 1, ft_strlen(tmp + 1) + 1);\n  return ret;"] },
    ],
  },
};

// How the answer sets differ, per problem: [all, reference, modey, short, easy].
// Shown under the set switch in the answer dialog and in typing practice.
const SOLUTION_DIFF = {
  filter: ['อ่าน stdin ให้หมดก่อน แล้วค่อยแทนที่ (คำที่โดนตัดระหว่าง 2 read ก็ยังเจอ)',
    'read ต่อท้าย buffer ตรง ๆ แล้วไล่ทีละตัว ใช้ `memmem` เทียบเฉพาะตำแหน่ง i · error ไปที่ฟังก์ชัน `fail`',
    'read ใส่ buf ชั่วคราวแล้ว `memmove` ต่อท้าย · ใช้ `memmem` "หา" คำถัดไป แล้ว write ข้อความก่อนหน้าทีเดียวทั้งก้อน',
    'realloc + read ต่อท้ายในลูปเดียว · แทนที่แบบเดียวกับเฉลยหลัก · ไม่มีท่าลัด อ่านตรง ๆ ทุกบรรทัด',
    'เหมือนชุดสั้น (level 1 ชุดสั้นอ่านตรงอยู่แล้ว)'],
  ft_scanf: ['ตรรกะเหมือนกันเกือบทุกบรรทัด ข้อสอบให้ match_conv กับ ft_vfscanf มาแล้ว',
    'ใช้โครงไฟล์ของข้อสอบตรง ๆ: ไม่ตรงคืน -1, match_space เช็ค `ferror`',
    'สั้นลงนิดหน่อย: ไม่ตรงคืน 0, ไม่เช็ค ferror ใน match_space, เปลี่ยนชื่อเป็น `match_nconv`',
    'ไม่แก้ไฟล์ที่ให้มาเลย เติมใต้ `// You may insert code here` อย่างเดียว · `return (0)` ที่ให้มาใช้เป็นกรณีไม่สำเร็จ',
    'เหมือนชุดสั้น'],
  broken_gnl: ['ผลลัพธ์เหมือนกัน: คืนทีละบรรทัดรวม `\\n`, บรรทัดท้ายที่ไม่มี `\\n` ก็คืน',
    '**ซ่อม** ไฟล์ที่ข้อสอบให้ทีละจุด ชื่อฟังก์ชันเดิมทั้งหมด (str_append_mem, ft_memmove …) ตรงกับโจทย์ที่สั่งให้ซ่อม',
    '**เขียนใหม่** ทั้งไฟล์ เหลือ helper 4 ตัว + `join` สั้นกว่าและจำง่ายกว่า แต่ต้องพิมพ์เองตั้งแต่ศูนย์',
    'เหมือนเฉลยหลัก: ข้อนี้ต้องซ่อมไฟล์ที่ให้มา เลยแก้เฉพาะจุดที่พัง ไม่เขียนไฟล์ใหม่ · มีวิธีหาบั๊กเองทีละขั้น: compile → รัน → ดูอาการ → แก้',
    'เหมือนชุดสั้น: แก้ไฟล์ที่ข้อสอบแจกเฉพาะจุดที่พัง'],
  n_queens: ['backtracking ทีละคอลัมน์ `board[col] = row` เหมือนกัน',
    '3 ฟังก์ชัน · เช็คทแยงด้วย `d == ±(col - c)` · พิมพ์ด้วย `fprintf` (อยู่ในรายการที่อนุญาต)',
    'แยก check / print_board ให้อ่านง่าย · เช็คว่า argument เป็นตัวเลข · ใช้ `abs` เช็คทแยง\nแต่ `printf` กับ `abs` ไม่อยู่ในรายการที่อนุญาตของข้อนี้',
    'ตัวแปร global (q, n) ทำให้ฟังก์ชันรับแค่ col · พิมพ์ด้วย `fprintf` ตามที่อนุญาต',
    'แยก `is_safe` (เช็คแถว / ทแยงลง / ทแยงขึ้น ทีละ if) กับ `print_board` · คอมเมนต์ท้ายบรรทัด (ไม่ต้องพิมพ์)'],
  permutations: ['เรียง input ก่อนเหมือนกัน ผลออกตามลำดับตัวอักษร',
    'recursion + `used[]` เลือกตัวที่ยังไม่ใช้ทีละตำแหน่ง (จอง 3 ก้อน)',
    'ไม่มี recursion: วน `next_perm` (หาลำดับถัดไป → สลับ → กลับหาง) จนหมด · เช็คว่าเป็นตัวอักษร\nบรรทัดเยอะกว่า แต่แต่ละฟังก์ชันสั้น',
    'global + recursion แบบ used[] สั้นที่สุด · bubble sort 2 ลูป · out มี `\\n` ท้ายไว้แล้ว write ทีเดียว',
    'แบบเดียวกับชุดสั้น แต่แยก `sort` เป็นฟังก์ชัน และพิมพ์ขึ้นบรรทัดแยก · คอมเมนต์ท้ายบรรทัด'],
  powerset: ['recursion "เอา / ไม่เอา" ทีละตัวเหมือนกัน',
    'ฟังก์ชันเดียว เก็บตัวที่เลือกลง `pick[]` แล้วพิมพ์ k ตัว',
    'ใช้ `used[]` เป็นธง 0/1 แล้ว `print_set` พิมพ์ตัวที่ธงเป็น 1 · มี `check_args` เช็คตัวเลข',
    'แบบเดียวกับเฉลยหลักแต่ใช้ global ฟังก์ชันรับแค่ (i, k, sum)',
    'แบบเดียวกับชุดสั้น แต่แยก `print_pick` และเช็ค `sum == target` ตรง ๆ · คอมเมนต์ท้ายบรรทัด'],
  rip: ['หาจำนวนที่ต้องลบน้อยสุดก่อน (open + close) แล้วลองลบด้วยการแทนเป็น `\' \'`',
    'ไล่ทีละตัว: ลบ หรือ เก็บ พร้อมนับ `depth` ตัดทิ้งทันทีที่ `)` เกิน (เร็วกว่า)',
    'เลือกตำแหน่งที่จะลบให้ครบโควตาก่อน แล้วค่อยเช็ค `valid` ทั้งสตริง คิดตามง่ายกว่า แต่ช้ากว่าถ้า input ยาว',
    'แบบเดียวกับเฉลยหลัก (ลบ / เก็บ + นับ open) แต่ไม่มีฟังก์ชันแยก นับจำนวนที่ต้องลบใน main',
    '`min_remove` นับว่าต้องลบกี่ตัว → `solve` ลอง ลบ / เก็บ จนลบครบ → `is_valid` เช็คทั้งสตริงทีเดียว ไม่ต้องนับ open ใน recursion'],
  tsp: ['อัลกอริทึมเดียวกัน: ตรึงเมืองแรก สลับ path ลองทุกลำดับ',
    'เขียนแค่ 3 ฟังก์ชันในไฟล์ที่ข้อสอบให้ ใช้ชื่อตามข้อสอบ (t_city, distance, total_distance)',
    'เขียนใหม่ทั้งไฟล์ ชื่อสั้น (t, dist, total) และ main ย่อ\nในข้อสอบ main ให้มาแล้ว ต้องใช้ชื่อตามไฟล์ที่ให้',
    'ไม่แก้ไฟล์ที่ให้มาเลย เขียน 3 ฟังก์ชัน (+ swap) ต่อท้ายไฟล์ · `(i + 1) % n` วนกลับเมืองแรกในลูปเดียว',
    'แบบเดียวกับชุดสั้น (ไม่แก้ main ที่ให้มา) · คอมเมนต์ท้ายบรรทัด'],
};

// "Before you type" page of ซ้อมพิมพ์: what the program has to do and the steps
// of its logic, one problem each. Every step must be ticked before typing
// starts. `by` replaces the steps for an answer set whose logic differs.
const BRIEF = {
  filter: {
    goal: 'แทนทุกที่ที่เจอคำใน argument ด้วย `*` (เท่าความยาวคำ) แล้วพิมพ์ข้อความจาก stdin ออกมา',
    io: 'รับ: argument 1 คำ + ข้อความทาง stdin · ส่ง: stdout',
    steps: [
      'argument ต้องมี 1 ตัวพอดีและไม่ว่าง ไม่งั้น `return 1`',
      'อ่าน stdin ให้หมดเก็บใน buffer: `realloc` ขยาย → `read` ต่อท้าย วนจน read ได้ 0',
      '`read` หรือ `realloc` พัง → `perror("Error")` → free → `return 1`',
      'ไล่ทีละตำแหน่ง: ตรงกับคำ (`memmem`) → พิมพ์ `*` เท่าความยาวแล้วกระโดดข้ามคำ · ไม่ตรง → พิมพ์ตัวนั้น',
      'free แล้ว `return 0`',
    ],
  },
  ft_scanf: {
    goal: 'เขียน ft_scanf ให้อ่าน `%d` `%s` `%c` จาก stdin เหมือน scanf จริง (ไฟล์ให้โครงมาแล้ว)',
    io: 'รับ: stdin · ส่ง: ค่าที่อ่านได้ลงตัวแปร + จำนวนตัวที่แปลงสำเร็จ (หรือ EOF)',
    steps: [
      '`match_space`: อ่านทิ้งช่องว่างจนเจอตัวอื่น แล้ว `ungetc` คืน',
      '`match_char`: อ่าน 1 ตัว ตรงกับตัวใน format คืน 1 · ไม่ตรง `ungetc` คืน',
      '`scan_char` (%c): อ่าน 1 ตัว **ไม่ข้ามช่องว่าง** เขียนลง `va_arg(ap, char *)`',
      '`scan_int` (%d): เครื่องหมาย `-` `+` → ตัวเลขสะสม `n * 10 + digit` → `ungetc` ตัวที่เกิน → เขียน `n * sign`',
      '`scan_string` (%s): เก็บจนเจอช่องว่าง → `ungetc` → ปิด `\\0`',
      'ทุก scan_* สำเร็จต้องคืน 1 เพราะ ft_vfscanf (ให้มา) เช็ค `!= 1`',
      '`ft_scanf`: `va_start` → `ft_vfscanf(stdin, format, ap)` → `va_end` → คืนผล',
    ],
  },
  broken_gnl: {
    goal: 'ซ่อม get_next_line ที่ข้อสอบให้มา ให้คืนทีละบรรทัด',
    io: 'รับ: fd · ส่ง: บรรทัด (รวม `\\n` ถ้ามี) หรือ NULL เมื่อหมด / error',
    steps: [
      'helper: `ft_strchr` หยุดที่ `\\0` · `ft_strlen` รับ NULL ได้ · `ft_memcpy` ก๊อปครบ n ตัว',
      '`ft_memmove`: ก๊อปช่วงที่ซ้อนกันได้ (ไม่เรียกตัวเองวนไม่จบ)',
      'ลูป: ยังไม่เจอ `\\n` ใน b → ต่อ b ทั้งก้อนเข้า ret → read ก้อนใหม่ → หา `\\n` ใหม่',
      'read ได้ -1 → free คืน NULL · ได้ 0 (หมด) → คืน ret ถ้ามีข้อมูล ไม่งั้น NULL',
      'เจอ `\\n` → ต่อถึง `\\n` เข้า ret → เลื่อนที่เหลือมาต้น b → คืน ret',
    ],
    by: {
      modey: [
        'เขียนใหม่ทั้งไฟล์: helper `ft_strlen` `ft_strchr` `ft_memcpy` + `join` (ต่อสตริง แล้ว free ก้อนเก่า)',
        '`static char buf[]` เก็บที่อ่านมาแล้วแต่ยังไม่ได้คืน',
        'ลูป: buf ยังไม่มี `\\n` → join buf ทั้งก้อนเข้า line → read ก้อนใหม่',
        'read ได้ 0 หรือ -1 → line มีข้อมูลก็คืน line ไม่งั้น free คืน NULL',
        'เจอ `\\n` → join ถึง `\\n` → ย้ายที่เหลือมาต้น buf → คืน line',
      ],
      short: [
        'ชุดสั้นข้อนี้ = **ซ่อมไฟล์ที่ข้อสอบแจก** ไม่ต้องพิมพ์ใหม่ทั้งไฟล์: ลบ / เพิ่ม / แก้เฉพาะจุดที่พัง',
        'กด **compile + รัน** (Ctrl+Enter) จะเห็นสิ่งที่เครื่องจริงแสดง: compile error, พัง, ค้าง หรือผลผิด',
        'อ่านอาการ → หาว่าบั๊กอยู่ฟังก์ชันไหน (ASan บอกชื่อฟังก์ชัน + บรรทัด) → แก้จุดนั้น → กดใหม่',
        'หลัง compile ครั้งแรก จุดที่ยังพังขึ้นแถบเหลือง **แก้จุดไหนก่อนก็ได้** กดใหม่จนผ่าน · ติดกด ใบ้ (Ctrl+/) ครั้งแรกบอกว่าพังเพราะอะไร ครั้งที่สองดูวิธีแก้',
      ],
    },
  },
  n_queens: {
    goal: 'พิมพ์ทุกวิธีวางควีน n ตัวบนกระดาน n×n โดยไม่มีตัวไหนกินกัน',
    io: 'รับ: argument n · ส่ง: บรรทัดละคำตอบ = แถวของควีนในแต่ละคอลัมน์ คั่นช่องว่าง',
    steps: [
      'argument 1 ตัว → `n = atoi` · n <= 0 ไม่พิมพ์อะไร',
      'วางทีละคอลัมน์ ในแต่ละคอลัมน์ลองทุกแถว',
      'วางได้ไหม: เทียบทุกคอลัมน์ก่อนหน้า แถวซ้ำ หรือ ห่างแถว = ห่างคอลัมน์ (ทแยง) → วางไม่ได้',
      'วางได้ → `q[col] = row` → recursion ไปคอลัมน์ถัดไป',
      'ครบ n คอลัมน์ → พิมพ์ q ทั้งแถว คั่นช่องว่าง แล้วขึ้นบรรทัด',
    ],
  },
  permutations: {
    goal: 'พิมพ์ทุกการเรียงสับเปลี่ยนของตัวอักษรใน argument **ตามลำดับตัวอักษร**',
    io: 'รับ: argument 1 สตริง · ส่ง: บรรทัดละแบบ',
    steps: [
      'argument 1 ตัว',
      'เรียงตัวอักษรใน input ก่อน (bubble sort) → ผลจะออกตามลำดับตัวอักษรเอง',
      'สร้างทีละตำแหน่ง: ลองทุกตัวที่ยังไม่ใช้ (`used[i]`) จากซ้ายไปขวา แล้ว recursion',
      'ครบ n ตัว → write ตามด้วย `\\n`',
      'กลับมาแล้วคืน `used[i] = 0` (backtrack) ให้ตัวอื่นได้ลองตำแหน่งนี้',
    ],
    by: {
      modey: [
        'argument 1 ตัว และต้องเป็นตัวอักษรล้วน',
        'ก๊อป argument แล้วเรียง (sort) = ลำดับแรก',
        'พิมพ์ลำดับปัจจุบัน แล้วหา `next_perm` ไปเรื่อย ๆ จนไม่มีลำดับถัดไป',
        '`next_perm`: จากขวาหา i ที่ `s[i] < s[i + 1]` (ไม่มี = จบ) → หา j จากขวาที่ `s[j] > s[i]` → สลับ → กลับลำดับส่วนหลัง i',
      ],
    },
  },
  powerset: {
    goal: 'พิมพ์ทุก subset ของเซตที่ผลรวมเท่ากับเลขเป้าหมาย',
    io: 'รับ: argument แรก = เป้าหมาย, ที่เหลือ = เซต · ส่ง: บรรทัดละ subset (ลำดับตามเซตเดิม)',
    steps: [
      'เป้าหมาย = `atoi(argv[1])`, เซต = argument ที่เหลือ (atoi) · malloc พัง → return 1',
      'recursion ทีละตัว: "เอา" ตัวนี้ แล้ว "ไม่เอา" ตัวนี้',
      'ครบทุกตัว → ผลรวมตรงเป้า → พิมพ์ตัวที่เลือก คั่นช่องว่าง',
      'ไม่ตัดกิ่งกลางทาง เพราะเลขติดลบได้ · subset ว่าง (ผลรวม 0) = บรรทัดว่าง',
    ],
  },
  rip: {
    goal: 'ลบวงเล็บให้น้อยที่สุด (แทนด้วยช่องว่าง) ให้ balanced แล้วพิมพ์ทุกแบบที่เป็นไปได้',
    io: 'รับ: argument สตริงวงเล็บ · ส่ง: บรรทัดละคำตอบ (ห้ามซ้ำ)',
    steps: [
      'นับจำนวนที่ต้องลบ: `(` ที่ค้าง + `)` ที่ไม่มีคู่',
      'ไล่ทีละตัว: ทางที่ 1 ลบ (แทนด้วย `\' \'`) ถ้ายังมีโควตา → ทางที่ 2 เก็บไว้',
      'นับ `open` ระหว่างทาง ติดลบเมื่อไหร่ = `)` เกิน ตัดทิ้งทันที',
      'จบสตริง: ลบครบโควตา และ `open == 0` → `puts`',
    ],
    by: {
      modey: [
        'นับจำนวนที่ต้องลบ: `(` ที่ค้าง + `)` ที่ไม่มีคู่',
        'เลือกวงเล็บที่จะลบทีละตัว (เฉพาะที่อยู่หลังตัวล่าสุดที่ลบ) แทนด้วย `\' \'` จนครบโควตา',
        'ลบครบ → เช็ค `valid` ทั้งสตริง (นับ `(` `)` ห้ามติดลบ จบต้องได้ 0) → ผ่านก็พิมพ์',
        'กลับมาแล้วคืนตัวเดิม (backtrack)',
      ],
    },
  },
  tsp: {
    goal: 'หาความยาวเส้นทางปิด (วนกลับจุดเริ่ม) ที่สั้นที่สุด ผ่านทุกเมือง',
    io: 'รับ: พิกัด `x, y` ทาง stdin (ไม่เกิน 11 เมือง) · ส่ง: ความยาวแบบ `%.2f`',
    steps: [
      'main ให้มาแล้ว: อ่านพิกัด → `solve(..., 1, &min)` (ตรึงเมืองแรก) → พิมพ์ `%.2f`',
      '`distance`: `sqrtf(dx * dx + dy * dy)`',
      '`total_distance`: รวมระยะตามลำดับใน path + ขากลับไปเมืองแรก',
      '`solve`: ครบทุกตำแหน่ง → คิดระยะ สั้นกว่า `*min` ก็เก็บ',
      'ไม่งั้นสลับ `path[pos]` กับทุกตัวที่เหลือ → recursion `pos + 1` → สลับคืน',
    ],
    by: {
      modey: [
        'เขียน main เอง: อ่านพิกัดด้วย `fscanf` → น้อยกว่า 2 เมืองพิมพ์ `0.00` → `solve(pos = 1)` → พิมพ์ `%.2f`',
        '`dist`: `sqrtf(dx * dx + dy * dy)`',
        '`total`: รวมระยะตามลำดับใน p + ขากลับไปเมืองแรก',
        '`solve`: ครบทุกตำแหน่ง → คิดระยะ สั้นกว่า `*min` ก็เก็บ',
        'ไม่งั้นสลับ `p[pos]` กับทุกตัวที่เหลือ → recursion `pos + 1` → สลับคืน',
      ],
    },
  },
};

// UMPIRE for each problem (the info page): Understand (examples + edge cases),
// Match (which pattern), Plan (= BRIEF steps), Implement (layer by layer, run
// every layer), Review (trace by hand + this problem's usual slips), Evaluate
// (build + run the examples). Example outputs were made by running the
// reference answers with gcc; [command, output, exit code if not 0].
const UMPIRE = {
 "filter": {
  "edge": [
   "ไม่มี argument / argument ว่าง `\"\"` → return 1 ไม่พิมพ์อะไร",
   "คำโดนตัดครึ่งระหว่าง read 2 ครั้ง ก็ต้องเจอ",
   "read / realloc พัง → `perror(\"Error\")` แล้ว return 1"
  ],
  "match": "วนอ่านจนหมด",
  "mq": [
   [
    "อ่านอะไร",
    "`read(0, …)` ทีละก้อน ต่อท้าย buffer"
   ],
   [
    "หยุดเมื่อ",
    "read คืน 0 (หมด) · คืน -1 = error"
   ],
   [
    "เศษเก็บไว้ไหน",
    "อ่านให้หมดก่อนค่อยแทนที่ จึงไม่มีเศษ"
   ]
  ],
  "layers": [
   "อ่าน stdin ทั้งหมดแล้วพิมพ์กลับเหมือนเดิม (เหมือน cat)",
   "เพิ่มการแทนคำด้วย `*`",
   "เพิ่มกรณี error: argument ผิด, read / realloc พัง"
  ],
  "review": [
   "ไล่ `abcabcd` หา `abc` ด้วยมือ: i = 0, 3, 6",
   "`s = tmp` (ทิศถูกไหม) · `i + n <= len` กันอ่านเลยท้าย",
   "free ทุกทางที่ออกจากโปรแกรม"
  ],
  "build": "gcc -Wall -Wextra -Werror filter.c -o filter",
  "ex": [
   [
    "echo 'abcabcd' | ./filter abc",
    "******d\n"
   ],
   [
    "echo 'hello' | ./filter xyz",
    "hello\n"
   ],
   [
    "./filter",
    "",
    1
   ]
  ]
 },
 "ft_scanf": {
  "edge": [
   "input ว่าง → คืน EOF (-1)",
   "ตัวแรกไม่ตรงชนิด → คืน 0 (แปลงไม่ได้สักตัว)",
   "`%c` ไม่ข้ามช่องว่าง · `%d` รับ `-` และ `+`"
  ],
  "match": "วนอ่านจนหมด",
  "mq": [
   [
    "อ่านอะไร",
    "`fgetc` ทีละตัว"
   ],
   [
    "หยุดเมื่อ",
    "เจอตัวที่ไม่ใช่ของชนิดนั้น หรือ EOF"
   ],
   [
    "เศษเก็บไว้ไหน",
    "ตัวที่อ่านเกิน `ungetc` คืนให้ stream"
   ]
  ],
  "layers": [
   "ft_scanf: `va_start` → `ft_vfscanf` → `va_end` + scan_char ให้ `%c` ใช้ได้ก่อน",
   "match_space + scan_int",
   "scan_string + match_char แล้วลองกรณีว่าง / ไม่ตรง"
  ],
  "review": [
   "ไล่ `42 hello x` ทีละ fgetc",
   "`c = fgetc(f)` เก็บค่าหรือยัง · ungetc ตัวที่อ่านมา (`ch`) ไม่ใช่ตัวที่คาดหวัง",
   "`!= EOF` ไม่ใช่ `== EOF` · `||` ตอนเช็ค `-` `+` · ปิด `\\0` ท้ายสตริง"
  ],
  "build": "gcc -Wall -Wextra -Werror ft_scanf.c main.c",
  "main": "main ทดสอบ: `ft_scanf(\"%d %s %c\", &n, s, &c)` แล้วพิมพ์ r n s c",
  "ex": [
   [
    "echo '42 hello x' | ./a.out",
    "r=3 n=42 s=hello c=x\n"
   ],
   [
    "echo 'abc' | ./a.out",
    "r=0 n=0 s= c=-\n"
   ],
   [
    "printf '' | ./a.out",
    "r=-1 n=0 s= c=-\n"
   ]
  ]
 },
 "broken_gnl": {
  "edge": [
   "ไฟล์ว่าง → NULL ตั้งแต่ครั้งแรก",
   "บรรทัดท้ายไม่มี `\\n` ก็ต้องคืน",
   "`-D BUFFER_SIZE=1` และใหญ่กว่าไฟล์",
   "จบแล้วต้องไม่ leak"
  ],
  "match": "วนอ่านจนหมด",
  "mq": [
   [
    "อ่านอะไร",
    "`read(fd, b, BUFFER_SIZE)` ทีละก้อน"
   ],
   [
    "หยุดเมื่อ",
    "เจอ `\\n` ใน buffer · read คืน 0 (หมด) / -1 (error)"
   ],
   [
    "เศษเก็บไว้ไหน",
    "`static` buffer เก็บส่วนหลัง `\\n` ไว้ให้ครั้งหน้า"
   ]
  ],
  "layers": [
   "compile ผ่าน (`-Wall -Wextra -Werror`)",
   "รันไม่พัง (`-g -fsanitize=address` บอกบรรทัดที่พัง)",
   "ไม่ค้าง ได้ทุกบรรทัดถูก รวมบรรทัดท้าย",
   "ไม่ leak"
  ],
  "review": [
   "ลูปที่รอ `\\n` เปลี่ยนเงื่อนไขทุกรอบไหม (หา `\\n` ใหม่)",
   "คืนบรรทัดแล้วเลื่อนที่เหลือมาต้น buffer หรือยัง",
   "pointer ที่อาจเป็น NULL (ret ตอนแรก) · free ตอน error"
  ],
  "build": "gcc -Wall -Wextra -Werror -D BUFFER_SIZE=42 get_next_line.c main.c",
  "main": "main ทดสอบ: วน `get_next_line(0)` พิมพ์ `[%s]` แล้ว free",
  "ex": [
   [
    "printf 'ab\\ncd\\n' | ./a.out",
    "[ab\n][cd\n]"
   ],
   [
    "printf 'ab\\ncd' | ./a.out",
    "[ab\n][cd]"
   ],
   [
    "printf '' | ./a.out",
    ""
   ]
  ]
 },
 "n_queens": {
  "edge": [
   "n = 1 → `0`",
   "n = 2, 3 → ไม่มีคำตอบ ไม่พิมพ์อะไร",
   "n <= 0 → ไม่พิมพ์อะไร"
  ],
  "match": "ลองทุกทาง (backtracking)",
  "mq": [
   [
    "ครบเมื่อ",
    "`col == n`"
   ],
   [
    "ทางเลือก",
    "แถว 0..n-1 ของคอลัมน์นี้"
   ],
   [
    "ผิดกฎเมื่อ",
    "แถวซ้ำ หรือ ห่างแถว = ห่างคอลัมน์ (ทแยง)"
   ],
   [
    "ครบแล้ว",
    "พิมพ์ q[0..n-1] คั่นช่องว่าง"
   ]
  ],
  "layers": [
   "main + พิมพ์ q ตายตัว 1 ชุด → เช็ครูปแบบการพิมพ์",
   "วางทุกแถวโดยยังไม่เช็ค → n = 2 ต้องได้ 4 บรรทัด",
   "เพิ่มเช็คแถว + ทแยง → n = 4 ได้ 2 คำตอบ"
  ],
  "review": [
   "ไล่ n = 4 คอลัมน์ 0 แถว 0 → คอลัมน์ 1 วางได้แถวไหน",
   "`==` ไม่ใช่ `=` ในเช็คทแยง",
   "ช่องว่างก่อนทุกตัวยกเว้นตัวแรก: `if (i > 0)`"
  ],
  "build": "gcc -Wall -Wextra -Werror n_queens.c -o n_queens",
  "ex": [
   [
    "./n_queens 4",
    "1 3 0 2\n2 0 3 1\n"
   ],
   [
    "./n_queens 1",
    "0\n"
   ],
   [
    "./n_queens 3",
    ""
   ]
  ]
 },
 "permutations": {
  "edge": [
   "ตัวเดียว → พิมพ์ตัวนั้น",
   "input ไม่เรียง (`cba`) → ผลต้องเรียงตามตัวอักษรเสมอ"
  ],
  "match": "ลองทุกทาง (backtracking)",
  "mq": [
   [
    "ครบเมื่อ",
    "เลือกครบ n ตัว"
   ],
   [
    "ทางเลือก",
    "ตัวที่ยังไม่ใช้ ไล่จากน้อยไปมาก"
   ],
   [
    "ผิดกฎเมื่อ",
    "ตัวนั้นใช้ไปแล้ว"
   ],
   [
    "ครบแล้ว",
    "พิมพ์แล้วขึ้นบรรทัด"
   ]
  ],
  "layers": [
   "เรียงตัวอักษรแล้วพิมพ์ 1 บรรทัด",
   "recursion พิมพ์ทุกแบบ",
   "ลอง `cba` ต้องได้ลำดับเดียวกับ `abc`"
  ],
  "review": [
   "ไล่ `ab`: เลือก a → b · เลือก b → a",
   "ย้อนกลับแล้วคืน `used[i] = 0` หรือยัง",
   "malloc +1 สำหรับ `\\n` / `\\0`"
  ],
  "build": "gcc -Wall -Wextra -Werror permutations.c -o permutations",
  "ex": [
   [
    "./permutations abc",
    "abc\nacb\nbac\nbca\ncab\ncba\n"
   ],
   [
    "./permutations a",
    "a\n"
   ],
   [
    "./permutations cba",
    "abc\nacb\nbac\nbca\ncab\ncba\n"
   ]
  ]
 },
 "powerset": {
  "edge": [
   "ไม่มีเซต เป้า 0 → บรรทัดว่าง 1 บรรทัด",
   "ไม่มีชุดไหนรวมได้ → ไม่พิมพ์อะไร",
   "มีเลขติดลบได้ → ห้ามตัดทิ้งกลางทาง"
  ],
  "match": "ลองทุกทาง (backtracking)",
  "mq": [
   [
    "ครบเมื่อ",
    "`i == n` (ถามครบทุกตัว)"
   ],
   [
    "ทางเลือก",
    "เอา / ไม่เอา ตัวที่ i"
   ],
   [
    "ผิดกฎเมื่อ",
    "ไม่มี (เพราะเลขติดลบได้)"
   ],
   [
    "ครบแล้ว",
    "`sum == target` → พิมพ์ pick[0..k-1]"
   ]
  ],
  "layers": [
   "main อ่าน argv แล้วพิมพ์ set → เช็คว่าอ่านถูก",
   "recursion พิมพ์ทุก subset (ยังไม่กรอง) → `./powerset 0 1 2` ได้ 4 บรรทัด",
   "เพิ่ม `if (sum != target) return ;`"
  ],
  "review": [
   "ไล่ `./powerset 3 1 2` เป็นตาราง i k sum pick",
   "ลูปพิมพ์ใช้ `j` ไม่ใช่ `k` · ทาง \"เอา\" ต้อง `sum + set[i]`",
   "ใส่ค่าจาก av ลง set แล้วหรือยัง · base case มี `return`"
  ],
  "build": "gcc -Wall -Wextra -Werror powerset.c -o powerset",
  "ex": [
   [
    "./powerset 3 1 0 2 4 5 3",
    "1 0 2\n1 2\n0 3\n3\n"
   ],
   [
    "./powerset 0",
    "\n"
   ],
   [
    "./powerset 7 3 8 2",
    ""
   ]
  ]
 },
 "rip": {
  "edge": [
   "balanced อยู่แล้ว → พิมพ์เดิม",
   "วงเล็บที่ลบแทนด้วย **ช่องว่าง** (ไม่ได้ตัดทิ้ง) ดูช่องว่างหน้า/ท้ายบรรทัดด้วย",
   "ห้ามพิมพ์บรรทัดซ้ำ"
  ],
  "match": "ลองทุกทาง (backtracking)",
  "mq": [
   [
    "ครบเมื่อ",
    "ไล่ครบทุกตัวของสตริง"
   ],
   [
    "ทางเลือก",
    "ลบ (แทนช่องว่าง) / เก็บ วงเล็บตัวนี้"
   ],
   [
    "ผิดกฎเมื่อ",
    "วงเล็บเปิดค้างติดลบ · ลบเกินจำนวนที่ต้องลบ"
   ],
   [
    "ครบแล้ว",
    "ลบครบจำนวนและ balanced → พิมพ์"
   ]
  ],
  "layers": [
   "นับจำนวนน้อยที่สุดที่ต้องลบ (open ค้าง + close เกิน) แล้วพิมพ์ตัวเลขดู",
   "recursion ลอง ลบ / เก็บ พิมพ์ทุกแบบที่ balanced",
   "เช็คว่าไม่มีบรรทัดซ้ำ"
  ],
  "review": [
   "ไล่ `(()` ด้วยมือ: ต้องลบ 1 ตัว",
   "หลังลองลบแล้วคืนตัวเดิม `s[i] = c` หรือยัง",
   "นับ open / close ถูกไหม"
  ],
  "build": "gcc -Wall -Wextra -Werror rip.c -o rip",
  "ex": [
   [
    "./rip '(()'",
    " ()\n( )\n"
   ],
   [
    "./rip '()())()'",
    "( ())()\n()( )()\n()() ()\n"
   ],
   [
    "./rip '()'",
    "()\n"
   ]
  ]
 },
 "tsp": {
  "edge": [
   "เมืองเดียว → `0.00`",
   "ต้องนับระยะกลับจุดเริ่มด้วย (เส้นทางปิด)",
   "ใช้ `sqrtf` → compile ต้องมี `-lm`"
  ],
  "match": "ลองทุกทาง (backtracking)",
  "mq": [
   [
    "ครบเมื่อ",
    "`pos == n`"
   ],
   [
    "ทางเลือก",
    "เมืองที่ยังไม่ไป (swap มาไว้ที่ pos)"
   ],
   [
    "ผิดกฎเมื่อ",
    "ไม่มี"
   ],
   [
    "ครบแล้ว",
    "ระยะรวม (รวมกลับจุดเริ่ม) น้อยกว่า min → เก็บ"
   ]
  ],
  "layers": [
   "distance + total_distance ของลำดับ 0..n-1 แล้วพิมพ์",
   "recursion swap ลองทุกลำดับ เก็บ min",
   "ลองเมืองเดียว / 3 เมือง"
  ],
  "review": [
   "ไล่ 3 เมือง (0,0) (3,0) (0,4): 3 + 4 + 5 = 12",
   "`(i + 1) % n` ใส่วงเล็บ · `*min = d` ทิศถูกไหม",
   "swap กลับหลัง recurse"
  ],
  "build": "gcc -Wall -Wextra -Werror tsp.c -o tsp -lm",
  "ex": [
   [
    "printf '0, 0\\n1, 0\\n1, 1\\n0, 1\\n' | ./tsp",
    "4.00\n"
   ],
   [
    "printf '0, 0\\n3, 0\\n0, 4\\n' | ./tsp",
    "12.00\n"
   ],
   [
    "printf '5, 5\\n' | ./tsp",
    "0.00\n"
   ]
  ]
 }
};

if (typeof module !== 'undefined') module.exports = { WALKTHROUGH, WALKTHROUGH_MODEY, WALKTHROUGH_SHORT, WALKTHROUGH_EASY, SOLUTION_DIFF, BRIEF, DEBUG_LESSON, UMPIRE };
