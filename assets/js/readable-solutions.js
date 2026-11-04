// Easy-to-read answers (อ่านง่าย): level 2 written for understanding — one job per
// function, names that say what they do, a comment at the end of each line that
// needs one. Comments are shown in typing practice but never typed (main.js strips
// them from the lines to check), so every comment sits at the end of a code line,
// never on a line of its own. Level 1 uses the short answers (already plain).
// test/verify-all.cjs builds and tests every one.
const SHORT_FOR_EASY = typeof SOLUTIONS_SHORT !== 'undefined' ? SOLUTIONS_SHORT : require('./solutions-short.js').SOLUTIONS_SHORT;

const SOLUTIONS_EASY = {

filter: SHORT_FOR_EASY.filter,
ft_scanf: SHORT_FOR_EASY.ft_scanf,
broken_gnl: SHORT_FOR_EASY.broken_gnl,

n_queens: {
'n_queens.c': `#include <stdio.h>
#include <stdlib.h>

int	*q;   // q[col] = แถวของควีนในคอลัมน์ col
int	n;    // ขนาดกระดาน n x n

int	is_safe(int col, int row)   // วางที่ (col, row) ได้ไหม
{
	for (int c = 0; c < col; c++)   // เทียบกับทุกคอลัมน์ที่วางไปแล้ว
	{
		if (q[c] == row)   // แถวเดียวกัน
			return (0);
		if (q[c] - row == col - c)   // ทแยงลง
			return (0);
		if (row - q[c] == col - c)   // ทแยงขึ้น
			return (0);
	}
	return (1);   // ไม่ชนใครเลย
}

void	print_board(void)   // พิมพ์ 1 คำตอบ
{
	for (int i = 0; i < n; i++)
	{
		if (i > 0)   // ช่องว่างก่อนทุกตัว ยกเว้นตัวแรก
			fprintf(stdout, " ");
		fprintf(stdout, "%d", q[i]);
	}
	fprintf(stdout, "\\n");
}

void	solve(int col)   // วางควีนของคอลัมน์ col
{
	if (col == n)   // วางครบทุกคอลัมน์แล้ว
	{
		print_board();
		return ;
	}
	for (int row = 0; row < n; row++)   // ลองทุกแถว
	{
		if (is_safe(col, row))
		{
			q[col] = row;   // วาง
			solve(col + 1);   // ไปคอลัมน์ถัดไป
		}
	}
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	n = atoi(av[1]);
	if (n <= 0)   // n ใช้ไม่ได้ ไม่พิมพ์อะไร
		return (0);
	q = malloc(sizeof(int) * n);
	if (!q)
		return (1);
	solve(0);   // เริ่มที่คอลัมน์แรก
	free(q);
	return (0);
}
`,
},

permutations: {
'permutations.c': `#include <stdlib.h>
#include <unistd.h>

char	*s;      // ตัวอักษรที่รับมา (จะเรียงก่อนใช้)
char	*out;    // คำที่กำลังสร้าง
int		*used;   // used[i] = 1 ถ้าใช้ s[i] ไปแล้ว
int		n;       // จำนวนตัวอักษร

void	sort(void)   // เรียงตัวอักษร a → z (bubble sort)
{
	for (int i = 0; i < n; i++)
	{
		for (int j = 0; j + 1 < n; j++)
		{
			if (s[j] > s[j + 1])   // คู่ติดกันผิดลำดับ → สลับ
			{
				char	t = s[j];

				s[j] = s[j + 1];
				s[j + 1] = t;
			}
		}
	}
}

void	perm(int k)   // เลือกตัวอักษรตัวที่ k ของคำ
{
	if (k == n)   // เลือกครบ n ตัวแล้ว
	{
		write(1, out, n);
		write(1, "\\n", 1);
		return ;
	}
	for (int i = 0; i < n; i++)   // ลองทุกตัว จากน้อยไปมาก
	{
		if (used[i])   // ใช้ไปแล้ว ข้าม
			continue ;
		used[i] = 1;   // เลือก s[i]
		out[k] = s[i];
		perm(k + 1);   // ไปเลือกตัวถัดไป
		used[i] = 0;   // ยกเลิก เพื่อลองตัวอื่น (backtrack)
	}
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	s = av[1];
	while (s[n])   // นับความยาว
		n++;
	sort();
	out = malloc(n + 1);
	used = calloc(n + 1, sizeof(int));   // calloc = เริ่มเป็น 0 ทุกช่อง
	if (!out || !used)
	{
		free(out);
		free(used);
		return (1);
	}
	perm(0);
	free(out);
	free(used);
	return (0);
}
`,
},

powerset: {
'powerset.c': `#include <stdio.h>
#include <stdlib.h>

int	*set;     // ตัวเลขทั้งหมดในเซต
int	*pick;    // ตัวที่เลือกไว้
int	n;        // จำนวนตัวเลขในเซต
int	target;   // ผลรวมที่ต้องการ

void	print_pick(int k)   // พิมพ์ตัวที่เลือก pick[0..k-1]
{
	for (int j = 0; j < k; j++)
	{
		if (j > 0)   // ช่องว่างก่อนทุกตัว ยกเว้นตัวแรก
			printf(" ");
		printf("%d", pick[j]);
	}
	printf("\\n");
}

void	solve(int i, int k, int sum)   // i = ถามถึงตัวไหน · k = เลือกไว้กี่ตัว · sum = ผลรวม
{
	if (i == n)   // ถามครบทุกตัวแล้ว
	{
		if (sum == target)
			print_pick(k);
		return ;
	}
	pick[k] = set[i];   // ใส่ไว้ก่อน (ใช้เฉพาะทาง "เอา")
	solve(i + 1, k + 1, sum + set[i]);   // เอา set[i]
	solve(i + 1, k, sum);   // ไม่เอา set[i]
}

int	main(int ac, char **av)
{
	if (ac < 2)
		return (1);
	target = atoi(av[1]);
	n = ac - 2;   // ที่เหลือคือเซต
	set = malloc(sizeof(int) * (n + 1));   // +1 กัน malloc(0)
	pick = malloc(sizeof(int) * (n + 1));
	if (!set || !pick)
	{
		free(set);
		free(pick);
		return (1);
	}
	for (int i = 0; i < n; i++)
		set[i] = atoi(av[i + 2]);
	solve(0, 0, 0);
	free(set);
	free(pick);
	return (0);
}
`,
},

rip: {
'rip.c': `#include <stdio.h>

int	need;   // ต้องลบกี่ตัว (น้อยที่สุด)

int	min_remove(char *s)   // นับวงเล็บที่ไม่มีคู่
{
	int	open = 0;    // '(' ที่ยังรอคู่
	int	close = 0;   // ')' ที่ไม่มีคู่

	for (int i = 0; s[i]; i++)
	{
		if (s[i] == '(')
			open++;
		else if (open > 0)   // ')' จับคู่กับ '(' ที่รออยู่
			open--;
		else   // ')' ไม่มีคู่
			close++;
	}
	return (open + close);
}

int	is_valid(char *s)   // วงเล็บ balanced ไหม (ช่องว่างข้ามไป)
{
	int	open = 0;

	for (int i = 0; s[i]; i++)
	{
		if (s[i] == '(')
			open++;
		if (s[i] == ')')
		{
			open--;
			if (open < 0)   // ')' มาก่อน '(' ที่เป็นคู่
				return (0);
		}
	}
	return (open == 0);   // ต้องไม่มี '(' ค้าง
}

void	solve(char *s, int i, int removed)   // ตัวที่ i: ลบ หรือ เก็บ
{
	if (removed == need)   // ลบครบแล้ว → เช็คทั้งสตริง
	{
		if (is_valid(s))
			puts(s);
		return ;
	}
	if (!s[i])   // หมดสตริงแต่ยังลบไม่ครบ
		return ;
	char	c = s[i];

	s[i] = ' ';   // ลบ = แทนด้วยช่องว่าง
	solve(s, i + 1, removed + 1);
	s[i] = c;   // คืนค่าเดิม
	solve(s, i + 1, removed);   // เก็บไว้
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	need = min_remove(av[1]);
	solve(av[1], 0, 0);
	return (0);
}
`,
},

tsp: {
'tsp.c': `#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <float.h>

typedef struct s_city
{
	float x;
	float y;
}	t_city;

/*
** You must implement this function
** It should return the Euclidean distance between 2 cities
*/
float	distance(t_city a, t_city b);

/*
** You must implement this function
** It should compute total distance of the path
** including the return to the starting city
*/
float	total_distance(t_city *cities, int *path, int n);

/*
** You must implement this function
** Use backtracking to try all permutations
*/
void	solve(t_city *cities, int *path, int n, int pos, float *min);

int	main(void)
{
	t_city	cities[11];
	int		n = 0;

	// Read input from stdin
	while (n < 11 && fscanf(stdin, "%f, %f", &cities[n].x, &cities[n].y) == 2)
		n++;

	// If less than 2 cities → distance = 0
	if (n < 2)
	{
		printf("0.00\\n");
		return (0);
	}

	// Initialize path: [0,1,2,...]
	int path[11];
	for (int i = 0; i < n; i++)
		path[i] = i;

	float min = FLT_MAX;

	/*
	** Optimization:
	** Fix first city → start from pos = 1
	*/
	solve(cities, path, n, 1, &min);

	printf("%.2f\\n", min);
	return (0);
}
float	distance(t_city a, t_city b)   // ระยะทางตรงระหว่าง 2 เมือง
{
	float	dx = a.x - b.x;
	float	dy = a.y - b.y;

	return (sqrtf(dx * dx + dy * dy));   // พีทาโกรัส
}

float	total_distance(t_city *cities, int *path, int n)   // ระยะรวมของเส้นทาง path
{
	float	d = 0;

	for (int i = 0; i < n; i++)   // เมือง i → เมืองถัดไป
		d += distance(cities[path[i]], cities[path[(i + 1) % n]]);   // % n = เมืองสุดท้ายวนกลับเมืองแรก
	return (d);
}

void	swap(int *a, int *b)   // สลับค่า 2 ตัว
{
	int	t = *a;

	*a = *b;
	*b = t;
}

void	solve(t_city *cities, int *path, int n, int pos, float *min)   // เลือกเมืองลำดับที่ pos
{
	if (pos == n)   // ได้เส้นทางครบแล้ว
	{
		float	d = total_distance(cities, path, n);

		if (d < *min)   // สั้นกว่าที่เคยเจอ → เก็บ
			*min = d;
		return ;
	}
	for (int i = pos; i < n; i++)   // ลองทุกเมืองที่ยังไม่ได้ไป
	{
		swap(&path[pos], &path[i]);   // เอาเมือง i มาไว้ลำดับที่ pos
		solve(cities, path, n, pos + 1, min);
		swap(&path[pos], &path[i]);   // สลับคืน (backtrack)
	}
}
`,
},
};

if (typeof module !== 'undefined') module.exports = { SOLUTIONS_EASY };
