// Flowcharts for typing practice. They fill in as the student types: a box
// appears once its line has been reached, and the box the caret is on is lit.
// FLOWS[set][problem] = [{ fn, title, nodes }] — one chart per function.
//   fn      anchor of the function's first line (searched in order, like walkthrough.js)
//   nodes   ['s', at, text]                 step
//           ['r', at, text]                 return / end
//           ['c', at, text]                 recursive call
//           ['if', at, question, yes, no]   decision (no may be omitted)
//           ['loop', at, condition, body]   loop
// `at` is a piece of the line the box belongs to; anchors are searched in
// document order (a node's line is at or after the previous node's line).
// test/verify-all.cjs checks every anchor still matches its answer.

// Handed-out parts (same text in the reference and short answers).
const FLOW_GIVEN_VFSCANF = { fn: 'int ft_vfscanf', title: 'ft_vfscanf (ให้มา)', nodes: [
  ['s', 'int c = fgetc(f)', 'อ่านตัวแรก'],
  ['if', 'if (c == EOF)', 'ว่างตั้งแต่ต้น?', [['r', 'return EOF', 'คืน `EOF`']]],
  ['loop', 'while (*format)', 'format ยังไม่หมด', [
    ['if', "if (*format == '%')", 'เจอ `%`?', [
      ['if', 'match_conv(f, &format, ap) != 1', 'แปลงไม่สำเร็จ?', [['s', 'break', 'หยุด']], [['s', 'nconv++', '`nconv++`']]],
    ], [
      ['if', 'isspace(*format)', 'ช่องว่าง?', [['s', 'match_space(f)', '`match_space`']],
        [['s', 'match_char(f, *format)', '`match_char` ไม่ตรง → หยุด']]],
    ]],
    ['s', 'format++', '`format++`'],
  ]],
  ['r', 'return nconv', 'คืน `nconv` (stream error → `EOF`)'],
] };

const FLOW_GIVEN_TSP_MAIN = { fn: 'int\tmain(void)', title: 'main (ให้มา)', nodes: [
  ['loop', 'while (n < 11 && fscanf', 'อ่านพิกัด `x, y` ได้', [['s', 'n++', '`n++`']]],
  ['if', 'if (n < 2)', 'น้อยกว่า 2 เมือง?', [['r', 'printf("0.00', 'พิมพ์ `0.00`']]],
  ['s', 'path[i] = i', 'path = 0, 1, …, n-1'],
  ['s', 'float min = FLT_MAX', '`min = FLT_MAX`'],
  ['s', 'solve(cities, path, n, 1, &min)', 'solve เริ่ม pos = 1 (ตรึงเมืองแรก)'],
  ['r', 'printf("%.2f', 'พิมพ์ min แบบ `%.2f`'],
] };

const FLOWS = {
  // -------------------------------------------------------------------------
  short: {
    filter: [{ fn: 'main(int ac', title: 'main', nodes: [
      ['if', 'if (ac != 2', 'argument ไม่ใช่ 1 ตัว หรือว่าง?', [['r', 'return (1)', 'return 1']]],
      ['loop', 'while (r > 0)', 'ยังอ่านได้ (`r > 0`)', [
        ['s', 'realloc(s, len + 1024)', 'ขยาย s อีก 1024'],
        ['if', 'if (!tmp)', 'realloc พัง?', [['r', 'perror("Error")', 'perror → free → return 1']]],
        ['s', 'r = read(0, s + len', 'read ต่อท้ายที่ `s + len`'],
        ['if', 'if (r < 0)', 'read พัง?', [['r', 'perror("Error")', 'perror → free → return 1']]],
        ['s', 'len += r', '`len += r`'],
      ]],
      ['s', 'n = strlen(av[1])', 'n = ความยาวคำ, i = 0'],
      ['loop', 'while (i < len)', '`i < len`', [
        ['if', 'memmem(s + i', 'ตรงกับคำที่ตำแหน่ง i?',
          [['s', 'write(1, "*", 1)', 'พิมพ์ `*` n ตัว'], ['s', 'i += n', '`i += n`']],
          [['s', 'write(1, &s[i++], 1)', 'พิมพ์ `s[i]`, `i++`']]],
      ]],
      ['r', 'free(s);', 'free → return 0'],
    ] }],

    ft_scanf: [
      { fn: 'match_space(FILE', title: 'match_space', nodes: [
        ['loop', 'while ((c = fgetc(f))', 'อ่าน c: เป็นช่องว่าง → ทิ้ง', []],
        ['s', 'ungetc(c, f)', 'ungetc คืนตัวที่ไม่ใช่ช่องว่าง'],
        ['r', 'return (0)', 'คืน 0 (ให้มา)'],
      ] },
      { fn: 'match_char(FILE', title: 'match_char', nodes: [
        ['s', 'ch = fgetc(f)', 'อ่าน 1 ตัว'],
        ['if', 'if (ch == c)', 'ตรงกับ c?', [['r', 'return (1)', 'คืน 1']]],
        ['s', 'ungetc(ch, f)', 'ไม่ตรง: ungetc คืน'],
        ['r', 'return (0)', 'คืน 0 (ให้มา)'],
      ] },
      { fn: 'scan_char(FILE', title: 'scan_char', nodes: [
        ['s', 'ch = fgetc(f)', 'อ่าน 1 ตัว (ไม่ข้ามช่องว่าง)'],
        ['if', 'if (ch != EOF)', 'ไม่ใช่ EOF?', [['s', '*va_arg(ap, char *)', 'เขียนลง `va_arg(ap, char *)`'], ['r', 'return (1)', 'คืน 1']]],
        ['r', 'return (0)', 'คืน 0 (ให้มา)'],
      ] },
      { fn: 'scan_int(FILE', title: 'scan_int', nodes: [
        ['s', 'c = fgetc(f)', 'อ่านตัวแรก'],
        ['if', "if (c == '-')", '`-`?', [['s', 'sign = -1', 'sign = -1']]],
        ['if', "if (c == '-' || c == '+')", 'เป็นเครื่องหมาย?', [['s', 'c = fgetc(f)', 'อ่านตัวถัดไป']]],
        ['if', 'if (isdigit(c))', 'เป็นตัวเลข?', [
          ['loop', 'while (isdigit(c))', 'ยังเป็นตัวเลข', [['s', 'n = n * 10', '`n = n * 10 + digit`, อ่านต่อ']]],
          ['s', 'ungetc(c, f)', 'ungetc ตัวที่เกิน'],
          ['s', '*va_arg(ap, int *)', 'เขียน `n * sign`'],
          ['r', 'return (1)', 'คืน 1'],
        ]],
        ['s', 'ungetc(c, f)', 'ไม่ใช่ตัวเลข: ungetc คืน'],
        ['r', 'return (0)', 'คืน 0 (ให้มา)'],
      ] },
      { fn: 'scan_string(FILE', title: 'scan_string', nodes: [
        ['s', 'va_arg(ap, char *)', 'รับ s จาก `va_arg`'],
        ['loop', 'while ((c = fgetc(f))', 'ไม่ใช่ EOF / ช่องว่าง', [['s', 's[i++] = c', '`s[i++] = c`']]],
        ['s', 'ungetc(c, f)', 'ungetc คืน'],
        ['s', "s[i] = '\\0'", 'ปิด `\\0`'],
        ['if', 'if (i > 0)', 'ได้อย่างน้อย 1 ตัว?', [['r', 'return (1)', 'คืน 1']]],
        ['r', 'return (0)', 'คืน 0 (ให้มา)'],
      ] },
      FLOW_GIVEN_VFSCANF,
      { fn: 'int ft_scanf', title: 'ft_scanf', nodes: [
        ['s', 'va_start', '`va_start` (เติมใต้ `// ...`)'],
        ['s', 'ft_vfscanf(stdin', '`ft_vfscanf(stdin, format, ap)` (ให้มา)'],
        ['s', 'va_end', '`va_end` (เติมใต้ `// ...`)'],
        ['r', 'return', 'คืนผล'],
      ] },
    ],

    n_queens: [
      { fn: 'ok(int col', title: 'ok', nodes: [
        ['loop', 'for (int c = 0; c < col', 'ทุกคอลัมน์ก่อนหน้า c', [
          ['if', 'if (q[c] == row', 'แถวเดียวกัน หรือ ทแยง?', [['r', 'return (0)', 'คืน 0 (วางไม่ได้)']]],
        ]],
        ['r', 'return (1)', 'คืน 1 (วางได้)'],
      ] },
      { fn: 'solve(int col)', title: 'solve', nodes: [
        ['if', 'if (col == n)', 'ครบ n คอลัมน์?', [
          ['loop', 'for (int i = 0; i < n; i++)', 'ทุกคอลัมน์', [
            ['if', 'if (i > 0)', 'ไม่ใช่ตัวแรก?', [['s', 'fprintf(stdout, " ")', 'พิมพ์ช่องว่าง']]],
            ['s', 'fprintf(stdout, "%d", q[i])', 'พิมพ์ `q[i]`'],
          ]],
          ['s', 'fprintf(stdout, "\\n")', 'พิมพ์ `\\n`'],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['loop', 'for (int row = 0', 'ทุกแถว row', [
          ['if', 'if (ok(col, row))', 'วางได้?', [['s', 'q[col] = row', '`q[col] = row`'], ['c', 'solve(col + 1)', '`solve(col + 1)`']]],
        ]],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['s', 'n = atoi', '`n = atoi(av[1])`'],
        ['if', 'if (n <= 0)', '`n <= 0`?', [['r', 'return (0)', 'return 0']]],
        ['s', 'q = malloc', 'จอง q'],
        ['s', 'solve(0)', '`solve(0)`'],
        ['r', 'free(q)', 'free → return 0'],
      ] },
    ],

    permutations: [
      { fn: 'perm(int k)', title: 'perm', nodes: [
        ['if', 'if (k == n)', 'ครบ n ตัว?', [['s', 'write(1, out', 'write out (มี `\\n` ท้าย)'], ['r', 'return ;', 'กลับ']]],
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว i', [
          ['if', 'if (used[i])', 'ใช้ไปแล้ว?', [['s', 'continue', 'ข้าม']]],
          ['s', 'used[i] = 1', '`used[i] = 1`, `out[k] = s[i]`'],
          ['c', 'perm(k + 1)', '`perm(k + 1)`'],
          ['s', 'used[i] = 0', '`used[i] = 0` (คืน)'],
        ]],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['loop', 'while (s[n])', 'นับความยาว n', []],
        ['loop', 'for (int i = 0; i < n; i++)', 'bubble sort n รอบ', [
          ['if', 'if (s[j] > s[j + 1])', 'คู่ติดกันกลับลำดับ?', [['s', 'char t = s[j]', 'สลับ']]],
        ]],
        ['s', 'out = malloc', 'จอง out กับ used'],
        ['s', "out[n] = '\\n'", "`out[n] = '\\n'`"],
        ['c', 'perm(0)', '`perm(0)`'],
        ['r', 'free(out)', 'free → return 0'],
      ] },
    ],

    powerset: [
      { fn: 'solve(int i', title: 'solve', nodes: [
        ['if', 'if (i == n)', 'ครบทุกตัว?', [
          ['if', 'if (sum != target)', 'ผลรวมไม่ตรง?', [['r', 'return ;', 'กลับ']]],
          ['loop', 'for (int j = 0; j < k; j++)', 'ทุกตัวใน pick', [
            ['if', 'if (j > 0)', 'ไม่ใช่ตัวแรก?', [['s', 'printf(" ")', 'พิมพ์ช่องว่าง']]],
            ['s', 'printf("%d", pick[j])', 'พิมพ์ `pick[j]`'],
          ]],
          ['s', 'printf("\\n")', 'พิมพ์ `\\n`'],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['s', 'pick[k] = set[i]', 'เอา: `pick[k] = set[i]`'],
        ['c', 'solve(i + 1, k + 1', '`solve(i + 1, k + 1, sum + set[i])`'],
        ['c', 'solve(i + 1, k, sum)', 'ไม่เอา: `solve(i + 1, k, sum)`'],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac < 2)', 'ไม่มี target?', [['r', 'return (1)', 'return 1']]],
        ['s', 'target = atoi', 'target, n = ac - 2'],
        ['s', 'set = malloc', 'จอง set กับ pick'],
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว', [['s', 'set[i] = atoi', '`set[i] = atoi(av[i + 2])`']]],
        ['c', 'solve(0, 0, 0)', '`solve(0, 0, 0)`'],
        ['r', 'free(set)', 'free → return 0'],
      ] },
    ],

    rip: [
      { fn: 'solve(char *s', title: 'solve', nodes: [
        ['if', 'if (open < 0)', '`)` เกิน?', [['r', 'return ;', 'ตัดทิ้ง']]],
        ['if', 'if (!s[i])', 'จบสตริง?', [
          ['if', 'if (left == 0 && open == 0)', 'ลบครบ และ balanced?', [['s', 'puts(s)', 'puts']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['if', 'if (left > 0)', 'ยังลบได้?', [
          ['s', "s[i] = ' '", "ลบ: `s[i] = ' '`"],
          ['c', 'solve(s, i + 1, left - 1', '`solve(i + 1, left - 1)`'],
          ['s', 's[i] = c', 'คืนตัวเดิม'],
        ]],
        ['if', "if (c == '(')", 'เก็บ: `(`?', [['c', 'solve(s, i + 1, left, open + 1)', '`solve(i + 1, open + 1)`']],
          [['c', 'solve(s, i + 1, left, open - 1)', '`)` → `solve(i + 1, open - 1)`']]],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['loop', 'for (int i = 0; av[1][i]', 'ทุกตัวอักษร', [
          ['if', "if (av[1][i] == '(')", '`(`?', [['s', 'open++', '`open++`']], [
            ['if', 'else if (open > 0)', 'มี `(` ให้จับคู่?', [['s', 'open--', '`open--`']], [['s', 'close++', '`close++`']]],
          ]],
        ]],
        ['c', 'solve(av[1], 0', '`solve(s, 0, open + close, 0)`'],
      ] },
    ],

    tsp: [
      FLOW_GIVEN_TSP_MAIN,
      { fn: 'total_distance(t_city', title: 'total_distance', nodes: [
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุก i', [['s', 'd += distance', 'บวกระยะ `path[i]` → `path[(i + 1) % n]`']]],
        ['r', 'return (d)', 'คืน d'],
      ] },
      { fn: 'solve(t_city', title: 'solve', nodes: [
        ['if', 'if (pos == n)', 'ครบทุกตำแหน่ง?', [
          ['s', 'd = total_distance', 'd = ระยะรวม'],
          ['if', 'if (d < *min)', 'สั้นกว่า?', [['s', '*min = d', '`*min = d`']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['loop', 'for (int i = pos; i < n; i++)', 'ทุก i ตั้งแต่ pos', [
          ['s', 'swap(&path[pos], &path[i])', 'สลับ i มาที่ pos'],
          ['c', 'solve(cities, path, n, pos + 1', '`solve(pos + 1)`'],
          ['s', 'swap(&path[pos], &path[i])', 'สลับคืน'],
        ]],
      ] },
    ],
  },

  // -------------------------------------------------------------------------
  modey: {
    filter: [{ fn: 'main(int ac', title: 'main', nodes: [
      ['if', 'if (ac != 2', 'argument ไม่ใช่ 1 ตัว หรือว่าง?', [['r', 'return (1)', 'return 1']]],
      ['s', 'len = strlen(s)', 's = คำ, len = ความยาว'],
      ['loop', 'while ((r = read', 'read ได้ (`r > 0`)', [
        ['s', 'realloc(data, total + r + 1)', 'ขยาย data'],
        ['if', 'if (!tmp)', 'realloc พัง?', [['r', 'perror("Error")', 'free → perror → return 1']]],
        ['s', 'memmove(data + total', 'ต่อท้าย, `total += r`, ปิด `\\0`'],
      ]],
      ['if', 'if (r < 0)', 'read พัง?', [['r', 'perror("Error")', 'free → perror → return 1']]],
      ['if', 'if (!data)', 'ไม่มีข้อมูลเลย?', [['r', 'return (0)', 'return 0']]],
      ['loop', 'while ((tmp = memmem', 'หาคำถัดไปเจอ', [
        ['s', 'write(1, data + i, tmp', 'พิมพ์ข้อความก่อนคำ'],
        ['s', 'write(1, "*", 1)', 'พิมพ์ `*` len ตัว'],
        ['s', 'i = (tmp - data) + len', 'i = หลังคำ'],
      ]],
      ['s', 'write(1, data + i, total - i)', 'พิมพ์ที่เหลือ'],
      ['r', 'free(data)', 'free → return 0'],
    ] }],

    ft_scanf: [
      { fn: 'match_space(FILE', title: 'match_space', nodes: [
        ['loop', 'while ((c = fgetc(f))', 'อ่าน c: เป็นช่องว่าง → ทิ้ง', []],
        ['if', 'if (c != EOF)', 'ไม่ใช่ EOF?', [['s', 'ungetc(c, f)', 'ungetc คืน']]],
        ['r', 'return (0)', 'คืน 0'],
      ] },
      { fn: 'match_char(FILE', title: 'match_char', nodes: [
        ['s', 'int r = fgetc(f)', 'อ่าน 1 ตัว'],
        ['if', 'if (r == c)', 'ตรงกับ c?', [['r', 'return (1)', 'คืน 1']]],
        ['if', 'if (r != EOF)', 'ไม่ใช่ EOF?', [['s', 'ungetc(r, f)', 'ungetc คืน']]],
        ['r', 'return (0)', 'คืน 0'],
      ] },
      { fn: 'scan_char(FILE', title: 'scan_char', nodes: [
        ['s', 'va_arg(ap, char *)', 'c = `va_arg(ap, char *)`'],
        ['s', 'int ch = fgetc(f)', 'อ่าน 1 ตัว'],
        ['if', 'if (ch == EOF)', 'EOF?', [['r', 'return (0)', 'คืน 0']]],
        ['s', '*c = (char)ch', '`*c = ch`'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'scan_int(FILE', title: 'scan_int', nodes: [
        ['s', 'va_arg(ap, int *)', 'n = `va_arg(ap, int *)`'],
        ['s', 'int c = fgetc(f)', 'อ่านตัวแรก'],
        ['if', "if (c == '-')", '`-`?', [['s', 'sign = -1', 'sign = -1, อ่านต่อ']], [
          ['if', "else if (c == '+')", '`+`?', [['s', 'c = fgetc(f)', 'อ่านต่อ']]],
        ]],
        ['if', 'if (!isdigit(c))', 'ไม่ใช่ตัวเลข?', [['r', 'return (0)', 'ungetc → คืน 0']]],
        ['loop', 'while (c != EOF && isdigit(c))', 'เป็นตัวเลข', [['s', 'num = num * 10', '`num * 10 + digit`, อ่านต่อ']]],
        ['s', 'ungetc(c, f)', 'ungetc ตัวที่เกิน'],
        ['s', '*n = num * sign', '`*n = num * sign`'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'scan_string(FILE', title: 'scan_string', nodes: [
        ['s', 'va_arg(ap, char *)', 'รับ s จาก `va_arg`'],
        ['loop', 'while ((c = fgetc(f))', 'ไม่ใช่ EOF / ช่องว่าง', [['s', 's[i++] = c', '`s[i++] = c`']]],
        ['s', 'ungetc(c, f)', 'ungetc คืน'],
        ['s', "s[i] = '\\0'", 'ปิด `\\0`'],
        ['r', 'return (i > 0)', 'ได้อย่างน้อย 1 ตัว → 1'],
      ] },
      { fn: 'ft_vfscanf(FILE', title: 'ft_vfscanf', nodes: [
        ['s', 'int c = fgetc(f)', 'อ่านตัวแรก'],
        ['if', 'if (c == EOF)', 'ว่างตั้งแต่ต้น?', [['r', 'return (EOF)', 'คืน `EOF`']]],
        ['loop', 'while (*format)', 'format ยังไม่หมด', [
          ['if', "if (*format == '%')", 'เจอ `%`?', [
            ['if', 'match_nconv(f, &format, ap) != 1', 'แปลงไม่สำเร็จ?', [['s', 'break', 'หยุด']]],
            ['s', 'nconv++', '`nconv++`'],
          ], [
            ['if', 'else if (isspace(*format))', 'ช่องว่าง?', [['s', 'match_space(f)', '`match_space`']], [
              ['if', 'else if (!match_char', 'ไม่ตรงกับตัวใน format?', [['s', 'break', 'หยุด']]],
            ]],
          ]],
          ['s', 'format++', '`format++`'],
        ]],
        ['r', 'return (nconv)', 'คืน `nconv`'],
      ] },
      { fn: 'ft_scanf(const char', title: 'ft_scanf', nodes: [
        ['s', 'va_start', '`va_start`'],
        ['s', 'ft_vfscanf(stdin', '`ft_vfscanf(stdin, format, ap)`'],
        ['s', 'va_end', '`va_end`'],
        ['r', 'return (ret)', 'คืนผล'],
      ] },
    ],

    broken_gnl: [
      { fn: 'join(char *s1', title: 'join', nodes: [
        ['s', 'malloc(len + n + 1)', 'จอง len + n + 1'],
        ['s', 'ft_memcpy(new, s1, len)', 'ก๊อป s1 แล้วต่อ n ตัวแรกของ s2'],
        ['s', 'new[len + n] = 0', 'ปิด `\\0`'],
        ['r', 'free(s1)', 'free s1 → คืนก้อนใหม่'],
      ] },
      { fn: 'get_next_line(int fd)', title: 'get_next_line', nodes: [
        ['loop', 'while (!(tmp = ft_strchr', 'buf ยังไม่มี `\\n`', [
          ['s', 'line = join(line, buf, ft_strlen', 'ต่อ buf ทั้งก้อนเข้า line'],
          ['s', 'r = read(fd', 'read ก้อนใหม่'],
          ['if', 'if (r <= 0)', 'หมด / error?', [
            ['if', 'if (line && *line)', 'line มีข้อมูล?', [['r', 'return (line)', 'ล้าง buf → คืน line']]],
            ['r', 'return (NULL)', 'free → NULL'],
          ]],
          ['s', 'buf[r] = 0', 'ปิด `\\0`'],
        ]],
        ['s', 'line = join(line, buf, tmp - buf + 1)', 'ต่อถึง `\\n`'],
        ['s', 'ft_memcpy(buf, tmp + 1', 'เลื่อนที่เหลือมาต้น buf'],
        ['r', 'return (line)', 'คืน line'],
      ] },
    ],

    n_queens: [
      { fn: 'check(char *s)', title: 'check', nodes: [
        ['if', "if (s[i] == '+' || s[i] == '-')", 'มีเครื่องหมาย?', [['s', 'i++', 'ข้าม']]],
        ['if', 'if (!s[i])', 'ไม่มีตัวเลข?', [['r', 'return (0)', 'คืน 0']]],
        ['loop', 'while (s[i])', 'ทุกตัว', [
          ['if', "if (s[i] < '0'", 'ไม่ใช่ตัวเลข?', [['r', 'return (0)', 'คืน 0']]],
          ['s', 'i++', '`i++`'],
        ]],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'print_board(int', title: 'print_board', nodes: [
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกคอลัมน์', [
          ['if', 'if (i)', 'ไม่ใช่ตัวแรก?', [['s', 'printf(" ")', 'พิมพ์ช่องว่าง']]],
          ['s', 'printf("%d", board[i])', 'พิมพ์ `board[i]`'],
        ]],
        ['r', 'printf("\\n")', 'พิมพ์ `\\n`'],
      ] },
      { fn: 'safe(int *board', title: 'safe', nodes: [
        ['loop', 'for (int i = 0; i < col; i++)', 'ทุกคอลัมน์ก่อนหน้า i', [
          ['if', 'if (board[i] == row', 'แถวเดียวกัน หรือ ทแยง?', [['r', 'return (0)', 'คืน 0']]],
        ]],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'solve(int *board', title: 'solve', nodes: [
        ['if', 'if (col == n)', 'ครบ n คอลัมน์?', [['s', 'print_board(board, n)', 'print_board'], ['r', 'return ;', 'กลับ']]],
        ['loop', 'for (int row = 0', 'ทุกแถว row', [
          ['if', 'if (safe(board, col, row))', 'วางได้?', [['s', 'board[col] = row', '`board[col] = row`'], ['c', 'solve(board, n, col + 1)', '`solve(col + 1)`']]],
        ]],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['if', 'if (!check(av[1]))', 'ไม่ใช่ตัวเลข?', [['r', 'return (1)', 'return 1']]],
        ['s', 'int n = atoi', '`n = atoi(av[1])`'],
        ['if', 'if (n <= 0)', '`n <= 0`?', [['r', 'return (0)', 'return 0']]],
        ['s', 'malloc(sizeof(int) * n)', 'จอง board'],
        ['c', 'solve(board, n, 0)', '`solve(0)`'],
        ['r', 'free(board)', 'free → return 0'],
      ] },
    ],

    permutations: [
      { fn: 'sort(char *s)', title: 'sort', nodes: [
        ['loop', 'while (s[i])', 'ทุก i', [
          ['loop', 'while (s[j])', 'ทุก j หลัง i', [
            ['if', 'if (s[i] > s[j])', '`s[i] > s[j]`?', [['s', 'swap(&s[i], &s[j])', 'สลับ']]],
          ]],
        ]],
      ] },
      { fn: 'next_perm(char *s)', title: 'next_perm', nodes: [
        ['s', 'int i = n - 2', 'i = n - 2'],
        ['loop', 'while (i >= 0 && s[i] >= s[i + 1])', 'จากขวา: ยังไม่เจอ `s[i] < s[i + 1]`', [['s', 'i--', '`i--`']]],
        ['if', 'if (i < 0)', 'ไม่เจอ = ลำดับสุดท้าย?', [['r', 'return (0)', 'คืน 0']]],
        ['s', 'int j = n - 1', 'j = n - 1'],
        ['loop', 'while (s[j] <= s[i])', 'จากขวา: หา `s[j] > s[i]`', [['s', 'j--', '`j--`']]],
        ['s', 'swap(&s[i], &s[j])', 'สลับ s[i] กับ s[j]'],
        ['s', 'reverse(s, i + 1, n - 1)', 'กลับลำดับส่วนหลัง i'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['if', 'if (ft_strlen(av[1]) == 0)', 'สตริงว่าง?', [['r', 'return (0)', 'return 0']]],
        ['loop', 'while (av[1][i])', 'ทุกตัว', [['if', 'if (!ft_isalpha', 'ไม่ใช่ตัวอักษร?', [['r', 'return (1)', 'return 1']]]]],
        ['s', 'char *s = malloc', 'ก๊อป argv[1] ใส่ s'],
        ['s', 'sort(s)', 'เรียง'],
        ['loop', 'while (1)', 'วน', [
          ['s', 'write(1, s, ft_strlen(s))', 'พิมพ์ s + `\\n`'],
          ['if', 'if (!next_perm(s))', 'ไม่มีลำดับถัดไป?', [['s', 'break', 'ออกลูป']]],
        ]],
        ['r', 'free(s)', 'free → return 0'],
      ] },
    ],

    powerset: [
      { fn: 'check_args(int ac', title: 'check_args', nodes: [
        ['loop', 'while (i < ac)', 'ทุก argument', [
          ['if', "if (av[i][j] == '+'", 'มีเครื่องหมาย?', [['s', 'j++', 'ข้าม']]],
          ['loop', 'while (av[i][j])', 'ทุกตัว', [
            ['if', "if (av[i][j] < '0'", 'ไม่ใช่ตัวเลข?', [['r', 'return (0)', 'คืน 0']]],
            ['s', 'j++', '`j++`'],
          ]],
          ['s', 'i++', '`i++`'],
        ]],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'print_set(int *set', title: 'print_set', nodes: [
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว', [
          ['if', 'if (used[i])', 'เลือกตัวนี้?', [
            ['if', 'if (!first)', 'ไม่ใช่ตัวแรก?', [['s', 'printf(" ")', 'พิมพ์ช่องว่าง']]],
            ['s', 'printf("%d", set[i])', 'พิมพ์ `set[i]`'],
          ]],
        ]],
        ['r', 'printf("\\n")', 'พิมพ์ `\\n`'],
      ] },
      { fn: 'solve(int *set', title: 'solve', nodes: [
        ['if', 'if (idx == n)', 'ครบทุกตัว?', [
          ['if', 'if (target == sum)', 'ผลรวมตรง?', [['s', 'print_set', 'print_set']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['s', 'used[idx] = 1', 'เอา: `used[idx] = 1`'],
        ['c', 'solve(set, used, n, target, idx + 1, sum + set[idx])', '`solve(idx + 1, sum + set[idx])`'],
        ['s', 'used[idx] = 0', 'ไม่เอา: `used[idx] = 0`'],
        ['c', 'solve(set, used, n, target, idx + 1, sum)', '`solve(idx + 1, sum)`'],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac < 3)', 'ไม่มีเซต?', [['r', 'return (1)', 'return 1 (`"0"` พิมพ์บรรทัดว่างก่อน)']]],
        ['if', 'if (!check_args', 'ไม่ใช่ตัวเลข?', [['r', 'return (1)', 'return 1']]],
        ['s', 'int target = atoi', 'target, n = ac - 2'],
        ['s', 'set = malloc', 'จอง set กับ used'],
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว', [['s', 'set[i] = atoi', '`set[i] = atoi(av[i + 2])`']]],
        ['c', 'solve(set, used, n, target, 0, 0)', '`solve(0, 0)`'],
        ['r', 'free(set)', 'free → return 0'],
      ] },
    ],

    rip: [
      { fn: 'valid(char *s)', title: 'valid', nodes: [
        ['loop', 'while (s[i])', 'ทุกตัว', [
          ['if', "if (s[i] == '(')", '`(`?', [['s', 'open++', '`open++`']], [
            ['if', "else if (s[i] == ')')", '`)`?', [
              ['s', 'open--', '`open--`'],
              ['if', 'if (open < 0)', 'ติดลบ?', [['r', 'return (0)', 'คืน 0']]],
            ]],
          ]],
          ['s', 'i++', '`i++`'],
        ]],
        ['r', 'return (open == 0)', 'คืน `open == 0`'],
      ] },
      { fn: 'solve(char *s, int idx', title: 'solve', nodes: [
        ['if', 'if (rm == 0)', 'ลบครบแล้ว?', [
          ['if', 'if (valid(s))', 'balanced?', [['s', 'print(s)', 'พิมพ์']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['loop', 'while (s[idx])', 'ทุกตัวตั้งแต่ idx', [
          ['if', "if (s[idx] == '('", 'เป็นวงเล็บ?', [
            ['s', "s[idx] = ' '", "ลบ: `s[idx] = ' '`"],
            ['c', 'solve(s, idx + 1, rm - 1)', '`solve(idx + 1, rm - 1)`'],
            ['s', 's[idx] = tmp', 'คืนตัวเดิม'],
          ]],
          ['s', 'idx++', '`idx++`'],
        ]],
      ] },
      { fn: 'main(int ac', title: 'main', nodes: [
        ['if', 'if (ac != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['loop', 'while (av[1][i])', 'ทุกตัว', [
          ['if', "if (av[1][i] == '(')", '`(`?', [['s', 'open++', '`open++`']], [
            ['if', "else if (av[1][i] == ')')", '`)`?', [
              ['if', 'if (open > 0)', 'มี `(` ให้จับคู่?', [['s', 'open--', '`open--`']], [['s', 'close++', '`close++`']]],
            ]],
          ]],
          ['s', 'i++', '`i++`'],
        ]],
        ['c', 'solve(av[1], 0, open + close)', '`solve(s, 0, open + close)`'],
      ] },
    ],

    tsp: [
      { fn: 'total(t *c', title: 'total', nodes: [
        ['loop', 'for(int i = 0; i < n - 1; i++)', 'ทุกคู่ติดกัน', [['s', 'd += dist', 'บวกระยะ `p[i]` → `p[i + 1]`']]],
        ['r', 'return (d + dist', 'บวกขากลับ → คืน'],
      ] },
      { fn: 'solve(t *c', title: 'solve', nodes: [
        ['if', 'if(pos == n)', 'ครบทุกตำแหน่ง?', [
          ['s', 'd = total(c, p, n)', 'd = ระยะรวม'],
          ['if', 'if(d < *min)', 'สั้นกว่า?', [['s', '*min = d', '`*min = d`']]],
          ['r', 'return;', 'กลับ'],
        ]],
        ['loop', 'for(int i = pos; i < n; i++)', 'ทุก i ตั้งแต่ pos', [
          ['s', 'swap(&p[pos], &p[i])', 'สลับ i มาที่ pos'],
          ['c', 'solve(c, p, n, pos+1,min)', '`solve(pos + 1)`'],
          ['s', 'swap(&p[pos], &p[i])', 'สลับคืน'],
        ]],
      ] },
      { fn: 'main()', title: 'main', nodes: [
        ['loop', 'while(n < 11 && fscanf', 'อ่านพิกัดได้', [['s', 'n++', '`n++`']]],
        ['if', 'if(n < 2)', 'น้อยกว่า 2 เมือง?', [['r', 'return !printf', 'พิมพ์ `0.00`']]],
        ['loop', 'for(int i = 0; i < n; i++)', 'ทุก i', [['s', 'p[i] = i', '`p[i] = i`']]],
        ['c', 'solve(c, p, n, 1, &min)', 'solve เริ่ม pos = 1'],
        ['r', 'printf("%.2f', 'พิมพ์ min แบบ `%.2f`'],
      ] },
    ],
  },

  // -------------------------------------------------------------------------
  ref: {
    filter: [{ fn: 'main(int argc', title: 'main', nodes: [
      ['if', 'if (argc != 2', 'argument ไม่ใช่ 1 ตัว หรือว่าง?', [['r', 'return (1)', 'return 1']]],
      ['loop', 'while (1)', 'อ่านจนหมด', [
        ['s', 'tmp = realloc(buf, len + CHUNK)', 'ขยาย buf'],
        ['if', 'if (!tmp)', 'realloc พัง?', [['r', 'return (fail(buf))', '`fail` → return 1']]],
        ['s', 'r = read(0, buf + len', 'read ต่อท้าย'],
        ['if', 'if (r < 0)', 'read พัง?', [['r', 'return (fail(buf))', '`fail` → return 1']]],
        ['if', 'if (r == 0)', 'หมดแล้ว?', [['s', 'break', 'ออกลูป']]],
        ['s', 'len += r', '`len += r`'],
      ]],
      ['s', 'n = strlen(argv[1])', 'n = ความยาวคำ, i = 0'],
      ['loop', 'while (i < len)', '`i < len`', [
        ['if', 'memmem(buf + i', 'ตรงกับคำที่ตำแหน่ง i?',
          [['s', 'write(1, "*", 1)', 'พิมพ์ `*` n ตัว'], ['s', 'i += n', '`i += n`']],
          [['s', 'write(1, &buf[i++], 1)', 'พิมพ์ `buf[i]`, `i++`']]],
      ]],
      ['r', 'free(buf)', 'free → return 0'],
    ] }],

    ft_scanf: [
      { fn: 'int match_space', title: 'match_space', nodes: [
        ['s', 'int ch = fgetc(f)', 'อ่านตัวแรก'],
        ['loop', 'while (ch != EOF && isspace(ch))', 'เป็นช่องว่าง', [['s', 'ch = fgetc(f)', 'อ่านต่อ']]],
        ['if', 'if (ch != EOF)', 'ไม่ใช่ EOF?', [['s', 'ungetc(ch, f)', 'ungetc คืน']]],
        ['if', 'if (ferror(f))', 'stream error?', [['r', 'return (-1)', 'คืน -1']]],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'int match_char', title: 'match_char', nodes: [
        ['s', 'int ch = fgetc(f)', 'อ่าน 1 ตัว'],
        ['if', 'if (ch == c)', 'ตรงกับ c?', [['r', 'return (1)', 'คืน 1']]],
        ['if', 'if (ch != EOF)', 'ไม่ใช่ EOF?', [['s', 'ungetc(ch, f)', 'ungetc คืน']]],
        ['r', 'return (-1)', 'คืน -1'],
      ] },
      { fn: 'int scan_char', title: 'scan_char', nodes: [
        ['s', 'int ch = fgetc(f)', 'อ่าน 1 ตัว (ไม่ข้ามช่องว่าง)'],
        ['if', 'if (ch == EOF)', 'EOF?', [['r', 'return (-1)', 'คืน -1']]],
        ['s', '*va_arg(ap, char *)', 'เขียนลง `va_arg(ap, char *)`'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'int scan_int', title: 'scan_int', nodes: [
        ['s', 'int ch = fgetc(f)', 'อ่านตัวแรก'],
        ['if', "if (ch == '-' || ch == '+')", 'เป็นเครื่องหมาย?', [['s', 'sign = -1', '`-` → sign = -1'], ['s', 'ch = fgetc(f)', 'อ่านตัวถัดไป']]],
        ['if', 'if (ch == EOF || !isdigit(ch))', 'ไม่ใช่ตัวเลข?', [['r', 'return (-1)', 'ungetc → คืน -1']]],
        ['loop', 'while (ch != EOF && isdigit(ch))', 'เป็นตัวเลข', [['s', 'value = value * 10', '`value * 10 + digit`, อ่านต่อ']]],
        ['s', 'ungetc(ch, f)', 'ungetc ตัวที่เกิน'],
        ['s', '*va_arg(ap, int *)', 'เขียน `value * sign`'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'int scan_string', title: 'scan_string', nodes: [
        ['s', 'va_arg(ap, char *)', 'รับ s จาก `va_arg`'],
        ['loop', 'while (ch != EOF && !isspace(ch))', 'ไม่ใช่ EOF / ช่องว่าง', [['s', 's[i++] = (char)ch', '`s[i++] = ch`, อ่านต่อ']]],
        ['s', 'ungetc(ch, f)', 'ungetc คืน'],
        ['if', 'if (i == 0)', 'ไม่ได้สักตัว?', [['r', 'return (-1)', 'คืน -1']]],
        ['s', "s[i] = '\\0'", 'ปิด `\\0`'],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      FLOW_GIVEN_VFSCANF,
      { fn: 'int ft_scanf', title: 'ft_scanf', nodes: [
        ['s', 'va_start', '`va_start`'],
        ['s', 'ft_vfscanf(stdin', '`ft_vfscanf(stdin, format, ap)`'],
        ['s', 'va_end', '`va_end`'],
        ['r', 'return ret', 'คืนผล'],
      ] },
    ],

    broken_gnl: [
      { fn: 'void *ft_memcpy', title: 'ft_memcpy', nodes: [
        ['loop', 'while(n-- > 0)', 'ยังเหลือ n ตัว', [['s', '((char *)dest)[n]', 'ก๊อปตัวที่ n (จากท้ายมาหน้า)']]],
        ['r', 'return dest', 'คืน dest'],
      ] },
      { fn: 'void *ft_memmove', title: 'ft_memmove', nodes: [
        ['if', 'if (dest > src)', 'dest อยู่หลัง src?', [['r', 'return ft_memcpy', 'ft_memcpy (ก๊อปจากท้าย)']]],
        ['if', 'else if (dest == src)', 'ที่เดียวกัน?', [['r', 'return dest', 'คืน dest']]],
        ['loop', 'while (i < n)', 'ก๊อปจากหน้าไปท้าย', [['s', '((char *)dest)[i]', 'ก๊อปตัวที่ i'], ['s', 'i++', '`i++`']]],
        ['r', 'return dest', 'คืน dest'],
      ] },
      { fn: 'char *get_next_line', title: 'get_next_line', nodes: [
        ['s', 'char *tmp = ft_strchr', 'หา `\\n` ใน b'],
        ['loop', 'while(!tmp)', 'ยังไม่เจอ `\\n`', [
          ['s', 'str_append_str(&ret, b)', 'ต่อ b ทั้งก้อนเข้า ret'],
          ['s', 'int read_ret = read', 'read ก้อนใหม่'],
          ['if', 'if (read_ret == -1)', 'error?', [['r', 'return (NULL)', 'free → NULL']]],
          ['s', 'b[read_ret] = 0', 'ปิด `\\0`'],
          ['if', 'if (read_ret == 0)', 'หมดไฟล์?', [['r', 'return ret', 'ret มีข้อมูล → คืน ไม่งั้น NULL']]],
          ['s', 'tmp = ft_strchr(b', 'หา `\\n` ใหม่'],
        ]],
        ['s', 'str_append_mem(&ret, b, tmp - b + 1)', 'ต่อถึง `\\n`'],
        ['s', 'ft_memmove(b, tmp + 1', 'เลื่อนที่เหลือมาต้น b'],
        ['r', 'return ret;', 'คืน ret'],
      ] },
    ],

    n_queens: [
      { fn: 'safe(int *q', title: 'safe', nodes: [
        ['loop', 'for (int c = 0; c < col; c++)', 'ทุกคอลัมน์ก่อนหน้า c', [
          ['s', 'int d = q[c] - row', '`d = q[c] - row`'],
          ['if', 'if (d == 0', 'แถวเดียวกัน หรือ ทแยง?', [['r', 'return (0)', 'คืน 0']]],
        ]],
        ['r', 'return (1)', 'คืน 1'],
      ] },
      { fn: 'solve(int *q', title: 'solve', nodes: [
        ['if', 'if (col == n)', 'ครบ n คอลัมน์?', [['s', 'fprintf(stdout, i ?', 'พิมพ์ q ทั้งแถว'], ['r', 'return ;', 'กลับ']]],
        ['loop', 'for (int row = 0', 'ทุกแถว row', [
          ['if', 'if (safe(q, col, row))', 'วางได้?', [['s', 'q[col] = row', '`q[col] = row`'], ['c', 'solve(q, n, col + 1)', '`solve(col + 1)`']]],
        ]],
      ] },
      { fn: 'main(int argc', title: 'main', nodes: [
        ['if', 'if (argc != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['s', 'n = atoi', '`n = atoi(argv[1])`'],
        ['if', 'if (n <= 0)', '`n <= 0`?', [['r', 'return (0)', 'return 0']]],
        ['s', 'q = calloc', 'จอง q'],
        ['c', 'solve(q, n, 0)', '`solve(0)`'],
        ['r', 'free(q)', 'free → return 0'],
      ] },
    ],

    permutations: [
      { fn: 'sort(char *s', title: 'sort', nodes: [
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุก i', [
          ['loop', 'for (int j = i + 1', 'ทุก j หลัง i', [
            ['if', 'if (s[j] < s[i])', '`s[j] < s[i]`?', [['s', 'char t = s[i]', 'สลับ']]],
          ]],
        ]],
      ] },
      { fn: 'permute(char *src', title: 'permute', nodes: [
        ['if', 'if (depth == n)', 'ครบ n ตัว?', [['s', 'write(1, cur, n)', 'พิมพ์ cur + `\\n`'], ['r', 'return ;', 'กลับ']]],
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว i', [
          ['if', 'if (used[i])', 'ใช้ไปแล้ว?', [['s', 'continue', 'ข้าม']]],
          ['s', 'used[i] = 1', '`used[i] = 1`, `cur[depth] = src[i]`'],
          ['c', 'permute(src, used, cur, depth + 1', '`permute(depth + 1)`'],
          ['s', 'used[i] = 0', '`used[i] = 0` (คืน)'],
        ]],
      ] },
      { fn: 'main(int argc', title: 'main', nodes: [
        ['if', 'if (argc != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['s', 'n = len(argv[1])', 'n = ความยาว'],
        ['s', 'src = malloc', 'จอง src, cur, used'],
        ['loop', 'for (int i = 0; i <= n', 'ทุกตัว (รวม `\\0`)', [['s', 'src[i] = argv[1][i]', 'ก๊อป']]],
        ['s', 'sort(src, n)', 'เรียง'],
        ['c', 'permute(src, used, cur, 0, n)', '`permute(0)`'],
        ['r', 'free(src)', 'free → return 0'],
      ] },
    ],

    powerset: [
      { fn: 'solve(int *set', title: 'solve', nodes: [
        ['if', 'if (i == n)', 'ครบทุกตัว?', [
          ['if', 'if (sum != target)', 'ผลรวมไม่ตรง?', [['r', 'return ;', 'กลับ']]],
          ['s', 'printf(j ?', 'พิมพ์ pick ทั้ง k ตัว'],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['s', 'pick[k] = set[i]', 'เอา: `pick[k] = set[i]`'],
        ['c', 'solve(set, n, pick, k + 1', '`solve(k + 1, i + 1, sum + set[i])`'],
        ['c', 'solve(set, n, pick, k, i + 1', 'ไม่เอา: `solve(k, i + 1, sum)`'],
      ] },
      { fn: 'main(int argc', title: 'main', nodes: [
        ['if', 'if (argc < 2)', 'ไม่มี target?', [['r', 'return (1)', 'return 1']]],
        ['s', 'n = argc - 2', 'n = argc - 2'],
        ['s', 'set = malloc', 'จอง set กับ pick'],
        ['loop', 'for (int i = 0; i < n; i++)', 'ทุกตัว', [['s', 'set[i] = atoi', '`set[i] = atoi(argv[i + 2])`']]],
        ['c', 'solve(set, n, pick, 0, 0', '`solve` เริ่มที่ 0'],
        ['r', 'free(set)', 'free → return 0'],
      ] },
    ],

    rip: [
      { fn: 'min_removals(', title: 'min_removals', nodes: [
        ['loop', 'for (int i = 0; s[i]; i++)', 'ทุกตัว', [
          ['if', "if (s[i] == '(')", '`(`?', [['s', 'open++', '`open++`']], [
            ['if', "else if (s[i] == ')')", '`)`?', [
              ['if', 'if (open > 0)', 'มี `(` ให้จับคู่?', [['s', 'open--', '`open--`']], [['s', 'close++', '`close++`']]],
            ]],
          ]],
        ]],
        ['r', 'return (open + close)', 'คืน open + close'],
      ] },
      { fn: 'solve(char *s', title: 'solve', nodes: [
        ['if', 'if (depth < 0)', '`)` เกิน?', [['r', 'return ;', 'ตัดทิ้ง']]],
        ['if', 'if (!s[i])', 'จบสตริง?', [
          ['if', 'if (left == 0 && depth == 0)', 'ลบครบ และ balanced?', [['s', 'puts(s)', 'puts']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['s', 'char c = s[i]', 'c = ตัวนี้'],
        ['if', "if (left > 0 && (c == '('", 'ยังลบได้ และเป็นวงเล็บ?', [
          ['s', "s[i] = ' '", "ลบ: `s[i] = ' '`"],
          ['c', 'solve(s, i + 1, left - 1, depth)', '`solve(i + 1, left - 1)`'],
          ['s', 's[i] = c', 'คืนตัวเดิม'],
        ]],
        ['if', "if (c == '(')", 'เก็บ: `(`?', [['c', 'solve(s, i + 1, left, depth + 1)', '`solve(depth + 1)`']], [
          ['if', "else if (c == ')')", '`)`?', [['c', 'solve(s, i + 1, left, depth - 1)', '`solve(depth - 1)`']],
            [['c', 'solve(s, i + 1, left, depth)', '`solve(depth)`']]],
        ]],
      ] },
      { fn: 'main(int argc', title: 'main', nodes: [
        ['if', 'if (argc != 2)', 'argument ไม่ใช่ 1 ตัว?', [['r', 'return (1)', 'return 1']]],
        ['c', 'solve(argv[1], 0, min_removals', '`solve(s, 0, min_removals(s), 0)`'],
      ] },
    ],

    tsp: [
      { fn: 'total_distance(t_city', title: 'total_distance', nodes: [
        ['loop', 'for (int i = 0; i < n - 1; i++)', 'ทุกคู่ติดกัน', [['s', 'total += distance', 'บวกระยะ `path[i]` → `path[i + 1]`']]],
        ['s', 'total += distance(cities[path[n - 1]]', 'บวกขากลับเมืองแรก'],
        ['r', 'return (total)', 'คืน total'],
      ] },
      { fn: 'solve(t_city', title: 'solve', nodes: [
        ['if', 'if (pos == n)', 'ครบทุกตำแหน่ง?', [
          ['s', 'float d = total_distance', 'd = ระยะรวม'],
          ['if', 'if (d < *min)', 'สั้นกว่า?', [['s', '*min = d', '`*min = d`']]],
          ['r', 'return ;', 'กลับ'],
        ]],
        ['loop', 'for (int i = pos; i < n; i++)', 'ทุก i ตั้งแต่ pos', [
          ['s', 'swap(&path[pos], &path[i])', 'สลับ i มาที่ pos'],
          ['c', 'solve(cities, path, n, pos + 1, min)', '`solve(pos + 1)`'],
          ['s', 'swap(&path[pos], &path[i])', 'สลับคืน'],
        ]],
      ] },
      FLOW_GIVEN_TSP_MAIN,
    ],
  },
};

// The short broken_gnl is the reference's file (fixed in place).
FLOWS.short.broken_gnl = FLOWS.ref.broken_gnl;

// Finds each chart's and node's line (0-based) in `text`.
// Returns [{ title, line, end, nodes }] with node.line set; missing anchors → line -1.
function resolveFlow(charts, text) {
  const lines = text.split('\n');
  const find = (anchor, from) => lines.findIndex((l, j) => j >= from && l.includes(anchor));
  const out = [];
  let from = 0;
  for (const ch of charts || []) {
    const line = find(ch.fn, from);
    if (line < 0) { out.push({ title: ch.title, line: -1, nodes: [], missing: [ch.fn] }); continue; }
    from = line + 1;
    const missing = [];
    let at = line;
    const walk = list => list.map(([t, anchor, text, a, b]) => {
      const l = find(anchor, at);
      if (l < 0) missing.push(anchor); else at = l;
      const n = { t, text, line: l };
      if (t === 'if') { n.yes = walk(a || []); n.no = walk(b || []); }
      if (t === 'loop') n.body = walk(a || []);
      return n;
    });
    out.push({ title: ch.title, line, nodes: walk(ch.nodes), missing });
  }
  out.forEach((c, k) => { c.end = k + 1 < out.length && out[k + 1].line > 0 ? out[k + 1].line - 1 : lines.length - 1; });
  return out;
}

if (typeof module !== 'undefined') module.exports = { FLOWS, resolveFlow };
