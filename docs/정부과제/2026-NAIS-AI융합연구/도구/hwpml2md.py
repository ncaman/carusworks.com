"""HWPML(XML 형식 .hwp) -> Markdown. 법령정보센터 배포 규정 파일용."""
import re, sys, os, base64, subprocess
import xml.etree.ElementTree as ET

def ptext(p):
    """P 하나의 텍스트(표 제외)."""
    out = []
    for t in p.iter():
        if t.tag == 'TABLE':
            continue
        if t.tag == 'IMAGE' and not inside_table(t, p):
            out.append(f"\n[[IMG:{t.get('BinItem')}]]\n")
        if t.tag == 'CHAR' and not inside_table(t, p):
            out.append(t.text or '')
            for k in t:
                if k.tag == 'TAB': out.append(' ')
                elif k.tag == 'LINEBREAK': out.append('\n')
                if k.tail: out.append(k.tail)
    return re.sub(r'[ \t　\xa0]+', ' ', ''.join(out))

_parent = {}
def inside_table(node, stop):
    n = _parent.get(node)
    while n is not None and n is not stop:
        if n.tag == 'TABLE': return True
        n = _parent.get(n)
    return False

def cell_text(cell):
    lines = []
    for pl in cell.findall('PARALIST'):
        for p in pl.findall('P'):
            t = re.sub(r'\[\[IMG:\d+\]\]', '', ptext(p)).strip()
            if t: lines += [l.strip() for l in t.split('\n') if l.strip()]
            for tb in direct_tables(p):
                lines.append(flat_table(tb))
    return '<br>'.join(lines).replace('|', '\\|')

def flat_table(tb):
    return ' / '.join(cell_text(c) for c in tb.iter('CELL'))

def direct_tables(p):
    res = []
    for t in p.iter('TABLE'):
        n = _parent.get(t); ok = True
        while n is not None and n is not p:
            if n.tag == 'TABLE': ok = False; break
            n = _parent.get(n)
        if ok: res.append(t)
    return res

def table_md(tb):
    cells = list(tb.iter('CELL'))
    cells = [c for c in cells if nearest_table(c) is tb]
    if not cells: return ''
    R = max(int(c.get('RowAddr')) + int(c.get('RowSpan', 1)) for c in cells)
    C = max(int(c.get('ColAddr')) + int(c.get('ColSpan', 1)) for c in cells)
    g = [[''] * C for _ in range(R)]
    for c in cells:
        g[int(c.get('RowAddr'))][int(c.get('ColAddr'))] = cell_text(c)
    keep = [j for j in range(C) if any(r[j] for r in g)]
    g = [[r[j] for j in keep] for r in g if any(r[j] for j in keep)]
    if not g: return ''
    if len(g) == 1 and len(g[0]) == 1:
        return '\n'.join('> ' + l for l in g[0][0].split('<br>'))
    out = ['| ' + ' | '.join(g[0]) + ' |', '|' + '---|' * len(g[0])]
    out += ['| ' + ' | '.join(r) + ' |' for r in g[1:]]
    return '\n'.join(out)

def nearest_table(n):
    n = _parent.get(n)
    while n is not None and n.tag != 'TABLE': n = _parent.get(n)
    return n

def convert(src, dst, title, note):
    raw = open(src, encoding='utf-8').read()
    raw = re.sub(r'<!DOCTYPE.*?\]>', '', raw, count=1, flags=re.S).replace('&nbsp;', '&#160;')
    root = ET.fromstring(raw)
    for par in root.iter():
        for k in par: _parent[k] = par
    body = root.find('BODY')
    blocks = []
    for sec in body.findall('SECTION'):
        for p in sec.findall('P'):
            t = ptext(p).strip()
            if t: blocks.append(t)
            for tb in direct_tables(p):
                m = table_md(tb)
                if m: blocks.append(m)
    # 이미지 처리: 본문용 GIF만 저장·삽입(+OCR), 로고/QR(bmp/jpg/png)은 제외
    fmt = dict(re.findall(r'<BINITEM Type="Embedding" BinData="(\d+)" Format="(\w+)"', raw))
    bins = {i: b for i, b in re.findall(r'<BINDATA [^>]*Id="(\d+)"[^>]*>(.*?)</BINDATA>', raw, re.S)}
    imgdir = os.path.join(os.path.dirname(dst), 'img'); prefix = os.path.basename(dst).split('.')[0]
    def img_md(m):
        i = m.group(1)
        if fmt.get(i) != 'gif' or i not in bins: return ''
        os.makedirs(imgdir, exist_ok=True)
        name = f'{prefix}_{int(i):02d}.gif'; path = os.path.join(imgdir, name)
        open(path, 'wb').write(base64.b64decode(re.sub(r'\s', '', bins[i])))
        png = path[:-4] + '.ocr.png'
        subprocess.run(['convert', path, '-resize', '300%', png], check=True)
        ocr = subprocess.run(['tesseract', png, '-', '-l', 'kor+eng', '--psm', '6'], capture_output=True, text=True).stdout
        os.remove(png)
        ocr = '\n'.join(l.rstrip() for l in ocr.splitlines() if l.strip())
        return f'\n![{name}](img/{name})\n\n<details><summary>이미지 OCR 텍스트 (tesseract 자동인식 · 미검증 — 원문은 위 이미지)</summary>\n\n```text\n{ocr}\n```\n\n</details>\n'
    blocks = [re.sub(r'\[\[IMG:(\d+)\]\]', img_md, b) for b in blocks]
    blocks = [b.strip() for b in blocks if b.strip()]
    blocks = [re.sub(r'^([*#>+])', r'\\\1', b) if not b.startswith(('| ', '> ')) else b for b in blocks]
    blocks = [b.replace('\n', '  \n') if not b.startswith(('| ', '> ', '![', '<details')) and '<details>' not in b else b for b in blocks]
    md = f'# {title}\n\n> 원문: `{note}` — HWPML 자동 변환. 내용 생략·요약 없음, 표는 마크다운 표로 재구성(병합셀은 빈 칸으로 펼침).\n\n'
    md += '\n\n'.join(blocks) + '\n'
    open(dst, 'w', encoding='utf-8').write(md)

if __name__ == '__main__':
    convert(*sys.argv[1:5])
