// Reference solutions (one possible answer each). test/verify-all.cjs builds
// every one of them against every test case; the page shows them only when
// the student asks for the answer in practice mode.
const SOLUTIONS = {

filter: { 'filter.c': `#define _GNU_SOURCE
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>

#define CHUNK 1024

static int	fail(char *buf)
{
	perror("Error");
	free(buf);
	return (1);
}

int	main(int argc, char **argv)
{
	char	*buf = NULL;
	char	*tmp;
	size_t	len = 0;
	size_t	n;
	size_t	i;
	ssize_t	r;

	if (argc != 2 || !argv[1][0])
		return (1);
	while (1)
	{
		tmp = realloc(buf, len + CHUNK);
		if (!tmp)
			return (fail(buf));
		buf = tmp;
		r = read(0, buf + len, CHUNK);
		if (r < 0)
			return (fail(buf));
		if (r == 0)
			break ;
		len += r;
	}
	n = strlen(argv[1]);
	i = 0;
	while (i < len)
	{
		if (i + n <= len && memmem(buf + i, n, argv[1], n))
		{
			for (size_t k = 0; k < n; k++)
				write(1, "*", 1);
			i += n;
		}
		else
			write(1, &buf[i++], 1);
	}
	free(buf);
	return (0);
}
` },

ft_scanf: { 'ft_scanf.c': `#include <stdarg.h>
#include <stdio.h>
#include <ctype.h>

int match_space(FILE *f)
{
	int ch = fgetc(f);

	while (ch != EOF && isspace(ch))
		ch = fgetc(f);
	if (ch != EOF)
		ungetc(ch, f);
	if (ferror(f))
		return (-1);
	return (1);
}

int match_char(FILE *f, char c)
{
	int ch = fgetc(f);

	if (ch == c)
		return (1);
	if (ch != EOF)
		ungetc(ch, f);
	return (-1);
}

int scan_char(FILE *f, va_list ap)
{
	int ch = fgetc(f);

	if (ch == EOF)
		return (-1);
	*va_arg(ap, char *) = (char)ch;
	return (1);
}

int scan_int(FILE *f, va_list ap)
{
	int sign = 1;
	int value = 0;
	int ch = fgetc(f);

	if (ch == '-' || ch == '+')
	{
		if (ch == '-')
			sign = -1;
		ch = fgetc(f);
	}
	if (ch == EOF || !isdigit(ch))
	{
		if (ch != EOF)
			ungetc(ch, f);
		return (-1);
	}
	while (ch != EOF && isdigit(ch))
	{
		value = value * 10 + (ch - '0');
		ch = fgetc(f);
	}
	if (ch != EOF)
		ungetc(ch, f);
	*va_arg(ap, int *) = value * sign;
	return (1);
}

int scan_string(FILE *f, va_list ap)
{
	char *s = va_arg(ap, char *);
	int ch = fgetc(f);
	int i = 0;

	while (ch != EOF && !isspace(ch))
	{
		s[i++] = (char)ch;
		ch = fgetc(f);
	}
	if (ch != EOF)
		ungetc(ch, f);
	if (i == 0)
		return (-1);
	s[i] = '\\0';
	return (1);
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
	va_list	ap;

	va_start(ap, format);
	int ret = ft_vfscanf(stdin, format, ap);
	va_end(ap);
	return ret;
}
` },

broken_gnl: {
'get_next_line.c': `#include "get_next_line.h"

char *ft_strchr(char *s, int c)
{
  int i = 0;
  while (s[i] && s[i] != c)
    i++;
  if (s[i] == c)
    return s + i;
  else
    return NULL;
}

void *ft_memcpy(void *dest, const void *src, size_t n)
{
  while(n-- > 0)
    ((char *)dest)[n] = ((char *)src)[n];
  return dest;
}

size_t ft_strlen(char *s)
{
  size_t res = 0;
  if (!s)
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
    return ft_memcpy(dest, src, n);
  else if (dest == src)
    return dest;
  size_t i = 0;
  while (i < n)
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
      free(ret);
      return (NULL);
    }
    b[read_ret] = 0;
    if (read_ret == 0)
    {
      if (*ret)
        return ret;
      free(ret);
      return NULL;
    }
    tmp = ft_strchr(b, '\\n');
  }
  if (!str_append_mem(&ret, b, tmp - b + 1))
  {
    free(ret);
    return NULL;
  }
  ft_memmove(b, tmp + 1, ft_strlen(tmp + 1) + 1);
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
` },

n_queens: { 'n_queens.c': `#include <stdio.h>
#include <stdlib.h>

static int	safe(int *q, int col, int row)
{
	for (int c = 0; c < col; c++)
	{
		int d = q[c] - row;
		if (d == 0 || d == col - c || d == c - col)
			return (0);
	}
	return (1);
}

static void	solve(int *q, int n, int col)
{
	if (col == n)
	{
		for (int i = 0; i < n; i++)
			fprintf(stdout, i ? " %d" : "%d", q[i]);
		fprintf(stdout, "\\n");
		return ;
	}
	for (int row = 0; row < n; row++)
	{
		if (safe(q, col, row))
		{
			q[col] = row;
			solve(q, n, col + 1);
		}
	}
}

int	main(int argc, char **argv)
{
	int	n;
	int	*q;

	if (argc != 2)
		return (1);
	n = atoi(argv[1]);
	if (n <= 0)
		return (0);
	q = calloc(n, sizeof(int));
	if (!q)
		return (1);
	solve(q, n, 0);
	free(q);
	return (0);
}
` },

permutations: { 'permutations.c': `#include <unistd.h>
#include <stdlib.h>

static int	len(char *s)
{
	int i = 0;

	while (s[i])
		i++;
	return (i);
}

static void	sort(char *s, int n)
{
	for (int i = 0; i < n; i++)
		for (int j = i + 1; j < n; j++)
			if (s[j] < s[i])
			{
				char t = s[i];
				s[i] = s[j];
				s[j] = t;
			}
}

static void	permute(char *src, int *used, char *cur, int depth, int n)
{
	if (depth == n)
	{
		write(1, cur, n);
		write(1, "\\n", 1);
		return ;
	}
	for (int i = 0; i < n; i++)
	{
		if (used[i])
			continue ;
		used[i] = 1;
		cur[depth] = src[i];
		permute(src, used, cur, depth + 1, n);
		used[i] = 0;
	}
}

int	main(int argc, char **argv)
{
	int		n;
	char	*src;
	char	*cur;
	int		*used;

	if (argc != 2)
		return (1);
	n = len(argv[1]);
	src = malloc(n + 1);
	cur = malloc(n + 1);
	used = calloc(n + 1, sizeof(int));
	if (!src || !cur || !used)
		return (free(src), free(cur), free(used), 1);
	for (int i = 0; i <= n; i++)
		src[i] = argv[1][i];
	sort(src, n);
	permute(src, used, cur, 0, n);
	free(src);
	free(cur);
	free(used);
	return (0);
}
` },

powerset: { 'powerset.c': `#include <stdio.h>
#include <stdlib.h>

static void	solve(int *set, int n, int *pick, int k, int i, int target, int sum)
{
	if (i == n)
	{
		if (sum != target)
			return ;
		for (int j = 0; j < k; j++)
			printf(j ? " %d" : "%d", pick[j]);
		printf("\\n");
		return ;
	}
	pick[k] = set[i];
	solve(set, n, pick, k + 1, i + 1, target, sum + set[i]);
	solve(set, n, pick, k, i + 1, target, sum);
}

int	main(int argc, char **argv)
{
	int	n;
	int	*set;
	int	*pick;

	if (argc < 2)
		return (1);
	n = argc - 2;
	set = malloc(sizeof(int) * (n + 1));
	pick = malloc(sizeof(int) * (n + 1));
	if (!set || !pick)
		return (free(set), free(pick), 1);
	for (int i = 0; i < n; i++)
		set[i] = atoi(argv[i + 2]);
	solve(set, n, pick, 0, 0, atoi(argv[1]), 0);
	free(set);
	free(pick);
	return (0);
}
` },

rip: { 'rip.c': `#include <stdio.h>

static int	min_removals(char *s)
{
	int open = 0, close = 0;

	for (int i = 0; s[i]; i++)
	{
		if (s[i] == '(')
			open++;
		else if (s[i] == ')')
		{
			if (open > 0)
				open--;
			else
				close++;
		}
	}
	return (open + close);
}

static void	solve(char *s, int i, int left, int depth)
{
	if (depth < 0)
		return ;
	if (!s[i])
	{
		if (left == 0 && depth == 0)
			puts(s);
		return ;
	}
	char c = s[i];
	if (left > 0 && (c == '(' || c == ')'))
	{
		s[i] = ' ';
		solve(s, i + 1, left - 1, depth);
		s[i] = c;
	}
	if (c == '(')
		solve(s, i + 1, left, depth + 1);
	else if (c == ')')
		solve(s, i + 1, left, depth - 1);
	else
		solve(s, i + 1, left, depth);
}

int	main(int argc, char **argv)
{
	if (argc != 2)
		return (1);
	solve(argv[1], 0, min_removals(argv[1]), 0);
	return (0);
}
` },

tsp: { 'tsp.c': `#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <float.h>

typedef struct s_city
{
	float x;
	float y;
}	t_city;

float	distance(t_city a, t_city b)
{
	float dx = a.x - b.x;
	float dy = a.y - b.y;

	return (sqrtf(dx * dx + dy * dy));
}

float	total_distance(t_city *cities, int *path, int n)
{
	float total = 0;

	for (int i = 0; i < n - 1; i++)
		total += distance(cities[path[i]], cities[path[i + 1]]);
	total += distance(cities[path[n - 1]], cities[path[0]]);
	return (total);
}

static void	swap(int *a, int *b)
{
	int t = *a;

	*a = *b;
	*b = t;
}

void	solve(t_city *cities, int *path, int n, int pos, float *min)
{
	if (pos == n)
	{
		float d = total_distance(cities, path, n);
		if (d < *min)
			*min = d;
		return ;
	}
	for (int i = pos; i < n; i++)
	{
		swap(&path[pos], &path[i]);
		solve(cities, path, n, pos + 1, min);
		swap(&path[pos], &path[i]);
	}
}

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
` },
};

if (typeof module !== 'undefined') module.exports = { SOLUTIONS };
