// Short answers: as little code as possible, easy to remember, only the
// functions each subject allows, plain if/else (no ?: or comma returns).
// Where the exam hands out a file the short answer never changes it, it only
// adds code: ft_scanf fills in after "// You may insert code here" and the
// "// ..." lines (the given return (0) is the failure case; ungetc(EOF) is a
// no-op, so no EOF guard before it), tsp adds the
// functions after main. broken_gnl has to be fixed in place, so it is the
// reference's minimal fixes. test/verify-all.cjs checks this.
const SOLUTIONS_SHORT = {

filter: {
'filter.c': `#define _GNU_SOURCE   // ต้องมาก่อน include ทุกตัว ไม่งั้น memmem ไม่ถูกประกาศ
#include <stdio.h>   // perror
#include <stdlib.h>   // realloc, free
#include <string.h>   // memmem, strlen
#include <unistd.h>   // read, write

int	main(int ac, char **av)
{
	char	*s = NULL;   // ข้อความทั้งหมดจาก stdin
	char	*tmp;
	size_t	len = 0;   // อ่านมาแล้วกี่ไบต์
	ssize_t	r = 1;   // เริ่มที่ 1 ให้เข้าลูปรอบแรก

	if (ac != 2 || !av[1][0])   // ต้องมี argument 1 ตัว และไม่ว่าง
		return (1);
	while (r > 0)   // วนจน read ได้ 0 (หมด)
	{
		tmp = realloc(s, len + 1024);   // ขยายที่ให้พออ่านอีก 1024
		if (!tmp)   // realloc พัง
		{
			perror("Error");   // พิมพ์ "Error: ..." ลง stderr
			free(s);
			return (1);
		}
		s = tmp;   // ใช้ก้อนใหม่ (ทิศ s = tmp)
		r = read(0, s + len, 1024);   // อ่านต่อท้ายข้อมูลเดิม
		if (r < 0)   // read พัง
		{
			perror("Error");
			free(s);
			return (1);
		}
		len += r;   // นับเพิ่มครั้งเดียวต่อรอบ
	}
	size_t	n = strlen(av[1]);   // ความยาวคำที่ต้องหา
	size_t	i = 0;
	while (i < len)   // ไล่ทีละตำแหน่ง
	{
		if (i + n <= len && memmem(s + i, n, av[1], n))   // ยังเหลือพอ และ n ตัวตรงนี้ตรงกับคำ
		{
			for (size_t k = 0; k < n; k++)   // พิมพ์ * เท่าความยาวคำ
				write(1, "*", 1);
			i += n;   // ข้ามทั้งคำ
		}
		else
			write(1, &s[i++], 1);   // ไม่ตรง → พิมพ์ตัวเดิมแล้วขยับ 1
	}
	free(s);
	return (0);
}
`,
},

ft_scanf: {
'ft_scanf.c': `#include <stdarg.h>
#include <stdio.h>
#include <ctype.h>

int match_space(FILE *f)
{
        // You may insert code here
	int	c;

	while ((c = fgetc(f)) != EOF && isspace(c))   // อ่านทิ้งช่องว่าง
		;
	ungetc(c, f);   // คืนตัวที่ไม่ใช่ช่องว่าง (ungetc(EOF) ไม่ทำอะไร)
    return (0);
}

int match_char(FILE *f, char c)
{
        // You may insert code here
	int	ch = fgetc(f);   // อ่านมา 1 ตัว

	if (ch == c)   // ตรงกับตัวใน format
		return (1);
	ungetc(ch, f);   // ไม่ตรง → คืนตัวที่อ่านมา (ch ไม่ใช่ c)
    return (0);
}

int scan_char(FILE *f, va_list ap)
{
        // You may insert code here
	int	ch = fgetc(f);   // %c ไม่ข้ามช่องว่าง

	if (ch != EOF)
	{
		*va_arg(ap, char *) = ch;   // เขียนลงตัวแปรของผู้เรียก
		return (1);
	}
    return (0);
}

int scan_int(FILE *f, va_list ap)
{
        // You may insert code here
	int	sign = 1;   // เครื่องหมาย
	int	n = 0;
	int	c = fgetc(f);   // ตัวแรก

	if (c == '-')   // ติดลบ
		sign = -1;
	if (c == '-' || c == '+')   // || = เป็นตัวใดตัวหนึ่ง
		c = fgetc(f);
	if (isdigit(c))   // ต้องมีตัวเลขอย่างน้อย 1 ตัว
	{
		while (isdigit(c))
		{
			n = n * 10 + (c - '0');   // สะสมทีละหลัก
			c = fgetc(f);
		}
		ungetc(c, f);   // คืนตัวที่เกินมา
		*va_arg(ap, int *) = n * sign;   // ใส่เครื่องหมาย
		return (1);
	}
	ungetc(c, f);
    return (0);
}

int scan_string(FILE *f, va_list ap)
{
        // You may insert code here
	char	*s = va_arg(ap, char *);   // ที่เก็บของผู้เรียก
	int		i = 0;
	int		c;

	while ((c = fgetc(f)) != EOF && !isspace(c))   // เก็บจนเจอช่องว่าง / EOF
		s[i++] = c;
	ungetc(c, f);
	s[i] = '\\0';   // ปิดท้ายสตริง
	if (i > 0)   // อ่านได้อย่างน้อย 1 ตัว
		return (1);
    return (0);
}


int	match_conv(FILE *f, const char **format, va_list ap)
{
	switch (**format)
	{
		case 'c':
			return scan_char(f, ap);
		case 'd':
			match_space(f);
			return scan_int(f, ap);
		case 's':
			match_space(f);
			return scan_string(f, ap);
		case EOF:
			return -1;
		default:
			return -1;
	}
}

int ft_vfscanf(FILE *f, const char *format, va_list ap)
{
	int nconv = 0;

	int c = fgetc(f);
	if (c == EOF)
		return EOF;
	ungetc(c, f);

	while (*format)
	{
		if (*format == '%')
		{
			format++;
			if (match_conv(f, &format, ap) != 1)
				break;
			else
				nconv++;
		}
		else if (isspace(*format))
		{
			if (match_space(f) == -1)
				break;
		}
		else if (match_char(f, *format) != 1)
			break;
		format++;
	}
	
	if (ferror(f))
		return EOF;
	return nconv;
}


int ft_scanf(const char *format, ...)
{
	// ...
	va_list	ap;

	va_start(ap, format);   // เริ่มอ่าน argument ที่ตามหลัง format
	int ret = ft_vfscanf(stdin, format, ap);
	// ...
	va_end(ap);   // จบการใช้ ap
	return ret;
}
`,
},

broken_gnl: {
'get_next_line.c': `#include "get_next_line.h"

char *ft_strchr(char *s, int c)
{
  int i = 0;
  while (s[i] && s[i] != c)   // หยุดที่ \\0 ด้วย (ของเดิมวิ่งเกิน)
    i++;
  if (s[i] == c)
    return s + i;
  else
    return NULL;
}

void *ft_memcpy(void *dest, const void *src, size_t n)
{
  while(n-- > 0)   // ลดหลังเช็ค: n = 0 ไม่เข้าลูป
    ((char *)dest)[n] = ((char *)src)[n];   // ก๊อปจากท้ายมาหน้า
  return dest;
}

size_t ft_strlen(char *s)
{
  size_t res = 0;
  if (!s)   // ครั้งแรก ret ยังเป็น NULL
    return 0;
  while (*s)
  {
    s++;
    res++;
  }
  return res;
}

int str_append_mem(char **s1, char *s2, size_t size2)
{
  size_t size1 = ft_strlen(*s1);
  char *tmp = malloc(size2 + size1 + 1);
  if (!tmp)
    return 0;
  ft_memcpy(tmp, *s1, size1);
  ft_memcpy(tmp + size1, s2, size2);
  tmp[size1 + size2] = '\\0';
  free(*s1);
  *s1 = tmp;
  return 1;
}

int str_append_str(char **s1, char *s2)
{
  return str_append_mem(s1, s2, ft_strlen(s2));
}

void *ft_memmove(void *dest, const void *src, size_t n)
{
  if (dest > src)
    return ft_memcpy(dest, src, n);   // dest อยู่หลัง → ก๊อปจากท้าย (ft_memcpy)
  else if (dest == src)
    return dest;
  size_t i = 0;   // dest อยู่หน้า → ก๊อปจากหน้า
  while (i < n)   // n ตัว (ไม่ใช่ strlen)
  {
    ((char *)dest)[i] = ((char *)src)[i];
    i++;
  }
  return dest;
}

char *get_next_line(int fd)
{
  static char b[BUFFER_SIZE + 1] = "";
  char *ret = NULL;
  char *tmp = ft_strchr(b, '\\n');
  while(!tmp)
  {
    if (!str_append_str(&ret, b))
      return (NULL);
    int read_ret = read(fd, b, BUFFER_SIZE);
    if (read_ret == -1)
    {
      free(ret);   // read พัง: free ก่อนคืน NULL
      return (NULL);
    }
    b[read_ret] = 0;
    if (read_ret == 0)   // หมดไฟล์
    {
      if (*ret)   // มีข้อมูลค้าง (บรรทัดท้ายไม่มี \\n)
        return ret;
      free(ret);   // ไม่มีอะไรแล้ว
      return NULL;
    }
    tmp = ft_strchr(b, '\\n');   // หา \\n ใหม่ทุกรอบ (ของเดิมลืม = ค้าง)
  }
  if (!str_append_mem(&ret, b, tmp - b + 1))
  {
    free(ret);
    return NULL;
  }
  ft_memmove(b, tmp + 1, ft_strlen(tmp + 1) + 1);   // เลื่อนที่เหลือหลัง \\n มาต้น b
  return ret;
}
`,
'get_next_line.h': `#ifndef GNL
# define GNL

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <fcntl.h>


# ifndef BUFFER_SIZE
#  define BUFFER_SIZE 10
# endif

char    *get_next_line(int fd);

#endif
`,
},

n_queens: {
'n_queens.c': `#include <stdio.h>   // fprintf
#include <stdlib.h>   // atoi, malloc, free

int	*q;   // q[col] = แถวของควีนในคอลัมน์ col
int	n;   // ขนาดกระดาน

int	ok(int col, int row)   // วางที่ (col, row) ได้ไหม
{
	for (int c = 0; c < col; c++)   // ทุกคอลัมน์ที่วางแล้ว
		if (q[c] == row || q[c] - row == col - c || row - q[c] == col - c)   // แถวซ้ำ / ทแยงลง / ทแยงขึ้น
			return (0);   // ชน
	return (1);   // ไม่ชนใคร
}

void	solve(int col)   // วางควีนคอลัมน์ col
{
	if (col == n)   // ครบทุกคอลัมน์ → พิมพ์
	{
		for (int i = 0; i < n; i++)
		{
			if (i > 0)   // ช่องว่างก่อนทุกตัวยกเว้นตัวแรก
				fprintf(stdout, " ");
			fprintf(stdout, "%d", q[i]);
		}
		fprintf(stdout, "\\n");
		return ;
	}
	for (int row = 0; row < n; row++)   // ลองทุกแถว
	{
		if (ok(col, row))
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
	if (n <= 0)   // n ใช้ไม่ได้ → ไม่พิมพ์อะไร
		return (0);
	q = malloc(sizeof(int) * n);
	if (!q)
		return (1);
	solve(0);   // เริ่มคอลัมน์แรก
	free(q);
	return (0);
}
`,
},

permutations: {
'permutations.c': `#include <stdlib.h>   // malloc, calloc, free
#include <unistd.h>   // write

char	*s;   // ตัวอักษรที่รับมา
char	*out;   // คำที่กำลังสร้าง (+ \\n ท้าย)
int		*used;   // used[i] = ใช้ s[i] แล้วหรือยัง
int		n;   // ความยาว

void	perm(int k)   // เลือกตัวที่ k ของคำ
{
	if (k == n)   // ครบ n ตัว
	{
		write(1, out, n + 1);   // พิมพ์ทั้งคำพร้อม \\n
		return ;
	}
	for (int i = 0; i < n; i++)   // ลองทุกตัว จากน้อยไปมาก
	{
		if (used[i])   // ใช้แล้ว ข้าม
			continue ;
		used[i] = 1;   // เลือก
		out[k] = s[i];
		perm(k + 1);   // ไปตัวถัดไป
		used[i] = 0;   // ยกเลิก (backtrack)
	}
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	s = av[1];
	while (s[n])   // นับความยาว
		n++;
	for (int i = 0; i < n; i++)   // bubble sort: เรียง a → z
		for (int j = 0; j + 1 < n; j++)
			if (s[j] > s[j + 1])   // คู่ติดกันผิดลำดับ → สลับ
			{
				char t = s[j];
				s[j] = s[j + 1];
				s[j + 1] = t;
			}
	out = malloc(n + 1);
	used = calloc(n + 1, sizeof(int));   // calloc = เริ่มเป็น 0
	if (!out || !used)
	{
		free(out);
		free(used);
		return (1);
	}
	out[n] = '\\n';   // ใส่ \\n ไว้ท้ายคำครั้งเดียว
	perm(0);
	free(out);
	free(used);
	return (0);
}
`,
},

powerset: {
'powerset.c': `#include <stdio.h>   // printf
#include <stdlib.h>   // atoi, malloc, free

int	*set;   // ตัวเลขในเซต
int	*pick;   // ตัวที่เลือก
int	n;   // จำนวนตัวเลข
int	target;   // ผลรวมที่ต้องการ

void	solve(int i, int k, int sum)   // i = ถามตัวไหน · k = เลือกไว้กี่ตัว · sum = ผลรวม
{
	if (i == n)   // ถามครบทุกตัวแล้ว
	{
		if (sum != target)   // ผลรวมไม่ตรง → ไม่พิมพ์
			return ;
		for (int j = 0; j < k; j++)   // พิมพ์ pick[0..k-1]
		{
			if (j > 0)   // ช่องว่างก่อนทุกตัวยกเว้นตัวแรก
				printf(" ");
			printf("%d", pick[j]);
		}
		printf("\\n");
		return ;
	}
	pick[k] = set[i];   // ใส่ไว้ก่อน (ใช้ทาง "เอา")
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
	solve(0, 0, 0);   // เริ่ม: ตัวแรก ยังไม่เลือก ผลรวม 0
	free(set);
	free(pick);
	return (0);
}
`,
},

rip: {
'rip.c': `#include <stdio.h>   // puts

void	solve(char *s, int i, int left, int open)   // left = ต้องลบอีกกี่ตัว · open = ( ที่ยังรอคู่
{
	if (open < 0)   // ) เกิน → ทางนี้ใช้ไม่ได้
		return ;
	if (!s[i])   // หมดสตริง
	{
		if (left == 0 && open == 0)   // ลบครบ และไม่มี ( ค้าง
			puts(s);
		return ;
	}
	char	c = s[i];   // จำตัวเดิมไว้
	if (left > 0)   // ยังลบได้ → ลองลบตัวนี้
	{
		s[i] = ' ';   // ลบ = แทนด้วยช่องว่าง
		solve(s, i + 1, left - 1, open);
		s[i] = c;   // คืนตัวเดิม
	}
	if (c == '(')   // ลองเก็บตัวนี้
		solve(s, i + 1, left, open + 1);   // ( เปิดเพิ่ม
	else
		solve(s, i + 1, left, open - 1);   // ) ปิด 1 ตัว
}

int	main(int ac, char **av)
{
	int	open = 0;   // ( ที่ยังไม่มีคู่
	int	close = 0;   // ) ที่ไม่มีคู่

	if (ac != 2)
		return (1);
	for (int i = 0; av[1][i]; i++)   // นับว่าต้องลบน้อยที่สุดกี่ตัว
	{
		if (av[1][i] == '(')
			open++;
		else if (open > 0)   // ) จับคู่กับ ( ที่รออยู่
			open--;
		else
			close++;   // ) ไม่มีคู่
	}
	solve(av[1], 0, open + close, 0);   // ต้องลบ = open + close
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

float	distance(t_city a, t_city b)   // ระยะตรงระหว่าง 2 เมือง
{
	float	dx = a.x - b.x;
	float	dy = a.y - b.y;

	return (sqrtf(dx * dx + dy * dy));   // พีทาโกรัส
}

float	total_distance(t_city *cities, int *path, int n)   // ระยะรวมของเส้นทาง
{
	float	d = 0;

	for (int i = 0; i < n; i++)
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
	if (pos == n)   // ได้เส้นทางครบ
	{
		float	d = total_distance(cities, path, n);

		if (d < *min)   // สั้นกว่าที่เคยเจอ → เก็บ
			*min = d;
		return ;
	}
	for (int i = pos; i < n; i++)   // ลองทุกเมืองที่ยังไม่ไป
	{
		swap(&path[pos], &path[i]);   // เอาเมือง i มาไว้ที่ pos
		solve(cities, path, n, pos + 1, min);
		swap(&path[pos], &path[i]);   // สลับคืน (backtrack)
	}
}
`,
},
};

if (typeof module !== 'undefined') module.exports = { SOLUTIONS_SHORT };
