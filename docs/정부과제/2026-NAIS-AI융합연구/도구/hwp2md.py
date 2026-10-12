"""HWP -> Markdown (hwp5html 출력 기반). 표는 병합셀을 펼친 마크다운 표로, 1셀 표는 인용 블록으로."""
import re, sys, subprocess, os, html
from html.parser import HTMLParser

class Node:
    def __init__(s, tag, attrs=None, parent=None):
        s.tag, s.attrs, s.parent, s.kids = tag, dict(attrs or []), parent, []

class Tree(HTMLParser):
    VOID = {'br', 'img', 'meta', 'link', 'col', 'hr', 'input'}
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.root = Node('root'); s.cur = s.root
    def handle_starttag(s, tag, attrs):
        n = Node(tag, attrs, s.cur); s.cur.kids.append(n)
        if tag not in s.VOID: s.cur = n
    def handle_endtag(s, tag):
        c = s.cur
        while c is not s.root and c.tag != tag: c = c.parent
        if c is not s.root: s.cur = c.parent
    def handle_data(s, d):
        s.cur.kids.append(d)

def text(n):
    if isinstance(n, str): return n
    if n.tag == 'br': return '\n'
    if n.tag in ('script', 'style', 'head', 'title'): return ''
    t = ''.join(text(k) for k in n.kids)
    if n.tag == 'p': t = t + '\n'
    return t

PUA = {chr(0xF02B1 + i): chr(0x2460 + i) for i in range(20)}
def clean(s):
    s = s.replace('　', ' ').replace('\xa0', ' ')
    for a, b in PUA.items(): s = s.replace(a, b)
    return re.sub(r'[ \t]+', ' ', s)

def cell_md(td):
    lines = [l.strip() for l in clean(text(td)).split('\n')]
    return '<br>'.join(l for l in lines if l).replace('|', '\\|')

def rows_of(table):
    out = []
    def walk(n):
        for k in n.kids:
            if isinstance(k, str): continue
            if k.tag == 'tr': out.append(k)
            elif k.tag in ('tbody', 'thead', 'tfoot'): walk(k)
    walk(table); return out

def table_md(table):
    rows = rows_of(table)
    grid, spans = [], {}
    for r, tr in enumerate(rows):
        row, c = [], 0
        cells = [k for k in tr.kids if not isinstance(k, str) and k.tag in ('td', 'th')]
        for td in cells:
            while (r, c) in spans: row.append(spans.pop((r, c))); c += 1
            cs = int(td.attrs.get('colspan', 1) or 1); rs = int(td.attrs.get('rowspan', 1) or 1)
            v = cell_md(td)
            row.append(v)
            for j in range(1, cs): row.append('')
            for i in range(1, rs):
                for j in range(cs): spans[(r + i, c + j)] = ''
            c += cs
        while (r, c) in spans: row.append(spans.pop((r, c))); c += 1
        grid.append(row)
    if not grid: return ''
    w = max(len(r) for r in grid)
    grid = [r + [''] * (w - len(r)) for r in grid]
    # 내용 없는 열/행 제거
    keep = [j for j in range(w) if any(r[j] for r in grid)]
    grid = [[r[j] for j in keep] for r in grid if any(r[j] for j in keep)]
    if not grid: return ''
    if len(grid) == 1 and len(grid[0]) == 1:
        return '\n'.join('> ' + l for l in grid[0][0].split('<br>')) + '\n'
    w = len(grid[0])
    out = ['| ' + ' | '.join(grid[0]) + ' |', '|' + '---|' * w]
    out += ['| ' + ' | '.join(r) + ' |' for r in grid[1:]]
    return '\n'.join(out) + '\n'

def render(n, out):
    for k in n.kids:
        if isinstance(k, str):
            continue
        if k.tag == 'table':
            out.append(table_md(k))
        elif k.tag == 'p':
            # 문단 안에 표가 들어있는 경우(hwp 컨트롤) 분리
            buf = []
            for kk in k.kids:
                if not isinstance(kk, str) and kk.tag == 'table':
                    if ''.join(buf).strip(): out.append(clean(''.join(buf)).strip())
                    buf = []; out.append(table_md(kk))
                elif not isinstance(kk, str) and has_table(kk):
                    if ''.join(buf).strip(): out.append(clean(''.join(buf)).strip())
                    buf = []; render(kk, out)
                else:
                    buf.append(text(kk))
            t = clean(''.join(buf)).strip()
            if t: out.append(t)
        elif k.tag in ('script', 'style', 'head'):
            continue
        else:
            render(k, out)

def has_table(n):
    if isinstance(n, str): return False
    return n.tag == 'table' or any(has_table(k) for k in n.kids)

def _n(x): return re.sub(r'[\s*|\\<>br]', '', x)

def repair(body, hwp, venv_bin):
    """hwp5html이 필드(하이퍼링크 등) 글자를 누락하는 경우, hwp5txt 원문 줄로 문단을 교체."""
    import difflib
    txt = subprocess.run([f'{venv_bin}/hwp5txt', hwp], capture_output=True, text=True).stdout
    joined = _n(''.join(body)); used = set()
    for line in txt.splitlines():
        L = clean(line).strip()
        if not L or L in ('<표>', '<그림>') or _n(L) in joined: continue
        best, bi = 0, -1
        for i, b in enumerate(body):
            if b.startswith(('|', '>')) or i in used: continue
            r = difflib.SequenceMatcher(None, _n(b), _n(L)).ratio()
            if r > best: best, bi = r, i
        if best > 0.85:
            body[bi] = L; used.add(bi); joined = _n(''.join(body))
    return body

def convert(hwp, md_path, title, src_note, venv_bin):
    tmpd = md_path + '.htmldir'
    subprocess.run([f'{venv_bin}/hwp5html', '--output', tmpd, hwp], check=True,
                   stderr=subprocess.DEVNULL)
    h = open(os.path.join(tmpd, 'index.xhtml'), encoding='utf-8').read()
    t = Tree(); t.feed(h)
    body = []
    render(t.root, body)
    md = f'# {title}\n\n> 원문: `{src_note}` — HWP 자동 변환(pyhwp). 내용 생략·요약 없음, 표는 마크다운 표로 재구성(병합셀은 빈 칸으로 펼침).\n\n'
    body = repair(body, hwp, venv_bin)
    body = [re.sub(r'^\*', r'\\*', b.rstrip()) for b in body if b.strip()]
    md += '\n\n'.join(body) + '\n'
    open(md_path, 'w', encoding='utf-8').write(md)
    subprocess.run(['rm', '-rf', tmpd])
    return md

if __name__ == '__main__':
    convert(*sys.argv[1:6])
