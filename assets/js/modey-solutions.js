// Modey-Codey/Practice-Exam-Rank3 (https://github.com/Modey-Codey/Practice-Exam-Rank3):
// shorter answers, shown when the student picks "Modey". Copied as-is except:
// filter prints "Error" (subject wants "Error: ..."), ft_scanf drops its demo
// main, tsp gets the missing & in fscanf (-Werror),
// broken_gnl keeps the handed-out get_next_line.h.
const SOLUTIONS_MODEY = {

filter: {
'filter.c': `#define _GNU_SOURCE
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int	main(int ac, char **av)
{
	char	buf[1024];
	char	*data = NULL;
	char	*tmp;
	ssize_t	r;
	size_t	total = 0;
	size_t	i = 0;
	
	if (ac != 2 || !av[1][0])
		return (1);
	char	*s = av[1];
	size_t len = strlen(s);
	while ((r = read(0, buf, sizeof(buf))) > 0)
	{
		tmp = realloc(data, total + r + 1);
		if (!tmp)
		{
			free(data);
			perror("Error");
			return (1);
		}
		data = tmp;
		memmove(data + total, buf, r);
		total += r;
		data[total] = '\\0';
	}
	if (r < 0)
	{
		free(data);
		perror("Error");
		return (1);
	}
	if (!data)
		return (0);
	while ((tmp = memmem(data + i, total - i, s, len)))
	{
		write(1, data + i, tmp - (data + i));
		for (size_t j = 0; j < len; j++)
			write(1, "*", 1);
		i = (tmp - data) + len;
	}
	write(1, data + i, total - i);
	free(data);
	return (0);
}
`,
},

ft_scanf: {
'ft_scanf.c': `#include <stdarg.h>
#include <ctype.h>
#include <stdio.h>

int	match_space(FILE *f)
{
	int c;
	
	while ((c = fgetc(f)) != EOF && isspace(c))
		;
	if (c != EOF)
		ungetc(c, f);
	return (0); 
}

int	match_char(FILE *f, char c)
{
	int r = fgetc(f);

	if (r == c)
		return (1);
	if (r != EOF)
		ungetc(r, f);
	return (0);
}

int	scan_char(FILE *f, va_list ap)
{
	char *c = va_arg(ap, char *);
	int ch = fgetc(f);

	if (ch == EOF)
		return (0);
	*c = (char)ch;
	return (1);
}

int	scan_int(FILE *f, va_list ap)
{
	int *n = va_arg(ap, int *);
	int sign = 1;
	int num = 0;
	int c = fgetc(f);

	if (c == '-')
	{
		sign = -1;
		c = fgetc(f);
	}
	else if (c == '+')
		c = fgetc(f);
	if (!isdigit(c))
	{
		if (c != EOF)
			ungetc(c, f);
		return (0);
	}
	while (c != EOF && isdigit(c))
	{
		num = num * 10 + (c - '0');
		c = fgetc(f);
	}
	if (c != EOF)
		ungetc(c, f);
	*n = num * sign;
	return (1);
}

int	scan_string(FILE *f, va_list ap)
{
	char *s = va_arg(ap, char *);
	int i = 0;
	int c;

	while ((c = fgetc(f)) != EOF && !isspace(c))
		s[i++] = c;
	if (c != EOF)
		ungetc(c, f);
	s[i] = '\\0';
	return (i > 0);
}

int	match_nconv(FILE *f, const char **format, va_list ap)
{
	switch (**format)
	{
		case 'c':
			return (scan_char(f, ap));
		case 'd':
			match_space(f);
			return (scan_int(f, ap));
		case 's':
			match_space(f);
			return (scan_string(f, ap));
		default :
			return (-1);
	}
}

int	ft_vfscanf(FILE *f, const char *format, va_list ap)
{
	int nconv = 0;
	int c = fgetc(f);

	if (c == EOF)
		return (EOF);
	ungetc(c, f);
	while (*format)
	{
		if (*format == '%')
		{
			format++;
			if (match_nconv(f, &format, ap) != 1)
				break ;
			nconv++;
		}
		else if (isspace(*format))
			match_space(f);
		else if (!match_char(f, *format))
			break ;
		format++;
	}
	if (ferror(f))
		return (EOF);
	return (nconv);
}

int	ft_scanf(const char *format, ...)
{
	va_list ap;
	int ret;

	va_start(ap, format);
	ret = ft_vfscanf(stdin, format, ap);
	va_end(ap);
	return (ret);
}
`,
},

broken_gnl: {
'get_next_line.c': `#include "get_next_line.h"

size_t	ft_strlen(char *s)
{
	size_t	i = 0;

	while (s && s[i])
		i++;
	return (i);
}

char	*ft_strchr(char *s, int c)
{
	int	i = 0;

	if (!s)
		return (NULL);
	while (s[i])
	{
		if (s[i] == c)
			return (&s[i]);
		i++;
	}
	return (NULL);
}

void	*ft_memcpy(void *dst, void *src, size_t n)
{
	size_t	i = 0;

	while (i < n)
	{
		((char *)dst)[i] = ((char *)src)[i];
		i++;
	}
	return (dst);
}

char	*join(char *s1, char *s2, size_t n)
{
	char	*new;
	size_t	len = ft_strlen(s1);

	new = malloc(len + n + 1);
	if (!new)
		return (NULL);
	ft_memcpy(new, s1, len);
	ft_memcpy(new + len, s2, n);
	new[len + n] = 0;
	free(s1);
	return (new);
}

char	*get_next_line(int fd)
{
	static char	buf[BUFFER_SIZE + 1];
	char		*line = NULL;
	char		*tmp;
	int			r;

	while (!(tmp = ft_strchr(buf, '\\n')))
	{
		line = join(line, buf, ft_strlen(buf));

		r = read(fd, buf, BUFFER_SIZE);
		if (r <= 0)
		{
			if (line && *line)
			{
				buf[0] = 0;
				return (line);
			}
			free(line);
			return (NULL);
		}
		buf[r] = 0;
	}
	line = join(line, buf, tmp - buf + 1);
	ft_memcpy(buf, tmp + 1, ft_strlen(tmp + 1) + 1);
	return (line);
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
'n_queens.c': `#include <stdio.h>
#include <stdlib.h>

int	check(char *s)
{
	int	i = 0;

	if (s[i] == '+' || s[i] == '-')
		i++;
	if (!s[i])
		return (0);
	while (s[i])
	{
		if (s[i] < '0' || s[i] > '9')
			return (0);
		i++;
	}
	return (1);
}

void	print_board(int *board, int n)
{
	for (int i = 0; i < n; i++)
	{
		if (i)
			printf(" ");
		printf("%d", board[i]);
	}
	printf("\\n");
}

int	safe(int *board, int col, int row)
{
	for (int i = 0; i < col; i++)
	{
		if (board[i] == row || abs(board[i] - row) == abs(i - col))
			return (0);
	}
	return (1);
}

void	solve(int *board, int n, int col)
{
	if (col == n)
	{
		print_board(board, n);
		return ;
	}
	for (int row = 0; row < n; row++)
	{
		if (safe(board, col, row))
		{
			board[col] = row;
			solve(board, n, col + 1);
		}
	}
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	if (!check(av[1]))
		return (1);
	int n = atoi(av[1]);
	if (n <= 0)
		return (0);
	int *board = malloc(sizeof(int) * n);
	if (!board)
		return (1);
	solve(board, n, 0);
	free(board);
	return (0);
}
`,
},

permutations: {
'permutations.c': `#include <unistd.h>
#include <stdlib.h>

int	ft_isalpha(int c)
{
	return ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'));
}

int	ft_strlen(char *s)
{
	int	i = 0;

	while (s[i])
		i++;
	return (i);
}

void	swap(char *a, char *b)
{
	char	tmp;

	tmp = *a;
	*a = *b;
	*b = tmp;
}

void	sort(char *s)
{
	int	i = 0;

	while (s[i])
	{
		int j = i + 1;
		while (s[j])
		{
			if (s[i] > s[j])
				swap(&s[i], &s[j]);
			j++;
		}
		i++;
	}
}

void	reverse(char *s, int start, int end)
{
	while (start < end)
	{
		swap(&s[start], &s[end]);
		start++;
		end--;
	}
}

int	next_perm(char *s)
{
	int n = ft_strlen(s);
	int i = n - 2;

	while (i >= 0 && s[i] >= s[i + 1])
		i--;
	if (i < 0)
		return (0);
	int j = n - 1;
	while (s[j] <= s[i])
		j--;
	swap(&s[i], &s[j]);
	reverse(s, i + 1, n - 1);
	return (1);
}

int	main(int ac, char **av)
{
	if (ac != 2)
		return (1);
	if (ft_strlen(av[1]) == 0)
		return (0);
	int i = 0;
	while (av[1][i])
	{
		if (!ft_isalpha(av[1][i]))
			return (1);
		i++;
	}
	char *s = malloc(ft_strlen(av[1]) + 1);
	if (!s)
		return (1);
	i = 0;
	while (av[1][i])
	{
		s[i] = av[1][i];
		i++;
	}
	s[i] = '\\0';
	sort(s);
	while (1)
	{
		write(1, s, ft_strlen(s));
		write(1, "\\n", 1);
		if (!next_perm(s))
			break ;
	}
	free(s);
	return (0);
}
`,
},

powerset: {
'powerset.c': `#include <stdio.h>
#include <stdlib.h>

int	check_args(int ac, char **av)
{
	int i = 1;
	int j;

	while (i < ac)
	{
		j = 0;
		if (av[i][j] == '+' || av[i][j] == '-')
			j++;
		while (av[i][j])
		{
			if (av[i][j] < '0' || av[i][j] > '9')
				return (0);
			j++;
		}
		i++;
	}
	return (1);
}

void	print_set(int *set, int *used, int n)
{
	int first = 1;

	for (int i = 0; i < n; i++)
	{
		if (used[i])
		{
			if (!first)
				printf(" ");
			printf("%d", set[i]);
			first = 0;
		}
	}
	printf("\\n");
}

void	solve(int *set, int *used, int n, int target, int idx, int sum)
{
	if (idx == n)
	{
		if (target == sum)
			print_set(set, used, n);
		return ;
	}
	used[idx] = 1;
	solve(set, used, n, target, idx + 1, sum + set[idx]);
	used[idx] = 0;
	solve(set, used, n, target, idx + 1, sum);
}

int	main(int ac, char **av)
{
	if (ac < 3)
	{
		if (ac == 2 && av[1][0] == '0' && av[1][1] == '\\0')
			printf("\\n");
		return (1);
	}
	if (!check_args(ac, av))
		return (1);
	int target = atoi(av[1]);
	int n = ac - 2;
	int	*set = malloc(sizeof(int) * n);
	int	*used = malloc(sizeof(int) * n);
	if (!set || !used)
	{
		free(set);
		free(used);
		return (1);
	}
	for (int i = 0; i < n; i++)
	{
		set[i] = atoi(av[i + 2]);
		used[i] = 0;
	}
	solve(set, used, n, target, 0, 0);
	free(set);
	free(used);
	return (0);
}
`,
},

rip: {
'rip.c': `#include <unistd.h>

int		len(char *s)
{
	int i = 0;
	while (s[i])
		i++;
	return (i);
}

int		valid(char *s)
{
	int i = 0;
	int open = 0;

	while (s[i])
	{
		if (s[i] == '(')
			open++;
		else if (s[i] == ')')
		{
			open--;
			if (open < 0)
				return (0);
		}
		i++;
	}
	return (open == 0);
}

void	print(char *s)
{
	write(1, s, len(s));
	write(1, "\\n", 1);
}

void	solve(char *s, int idx, int rm)
{
	if (rm == 0)
	{
		if (valid(s))
			print(s);
		return ;
	}

	while (s[idx])
	{
		if (s[idx] == '(' || s[idx] == ')')
		{
			char tmp = s[idx];
			s[idx] = ' ';
			solve(s, idx + 1, rm - 1);
			s[idx] = tmp;
		}
		idx++;
	}
}

int	main(int ac, char **av)
{
	int i = 0;
	int open = 0;
	int close = 0;

	if (ac != 2)
		return (1);

	while (av[1][i])
	{
		if (av[1][i] == '(')
			open++;
		else if (av[1][i] == ')')
		{
			if (open > 0)
				open--;
			else
				close++;
		}
		i++;
	}

	solve(av[1], 0, open + close);
}
`,
},

tsp: {
'tsp.c': `#include <stdio.h>
#include <math.h>
#include <float.h>

typedef struct s{float x, y;} t;

float	dist(t a, t b)
{
	return (sqrtf((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)));
}

float	total(t *c, int *p, int n)
{
	float d = 0;
	for(int i = 0; i < n - 1; i++)
		d += dist(c[p[i]], c[p[i + 1]]);
	return (d + dist(c[p[n - 1]], c[p[0]]));
}

void	swap(int *a, int *b)
{
	int t = *a;
	*a = *b;
	*b = t;
}

void	solve(t *c, int *p, int n, int pos, float *min)
{
	float d;

	if(pos == n)
	{
		d = total(c, p, n);
		if(d < *min)
			*min = d;
		return;
	}
	for(int i = pos; i < n; i++)
	{
		swap(&p[pos], &p[i]);
		solve(c, p, n, pos+1,min);
		swap(&p[pos], &p[i]);
	}
}

int	main()
{
	t c[11];
	int n = 0, p[11];
	float min = FLT_MAX;

	while(n < 11 && fscanf(stdin,"%f, %f",&c[n].x, &c[n].y) == 2)
		n++;
	if(n < 2)
		return !printf("0.00\\n");
	for(int i = 0; i < n; i++)
		p[i] = i;
	solve(c, p, n, 1, &min);
	printf("%.2f\\n", min);
}
`,
},
};

if (typeof module !== 'undefined') module.exports = { SOLUTIONS_MODEY };
