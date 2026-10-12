import re,sys,glob,os,subprocess
def norm(s):
    s=re.sub(r'[’‘“”"\']',"'",s).replace('<br>','')
    for i in range(20): s=s.replace(chr(0xF02B1+i),chr(0x2460+i))
    return re.sub(r'[\s*#|\\>`　\xa0]','',s)
D=sys.argv[1]; V=sys.argv[2]
res=[]
# 1) binary HWP: hwp5txt lines vs md
for f in sorted(glob.glob(D+'/원본/*.hwp')):
    b=os.path.basename(f)[:-4]; md=open(f'{D}/마크다운/{b}.md',encoding='utf-8').read(); mN=norm(md)
    txt=subprocess.run([V+'/hwp5txt',f],capture_output=True,text=True).stdout
    units=[l for l in txt.splitlines() if l.strip() and l.strip() not in('<표>','<그림>')]
    miss=[u for u in units if norm(u) and norm(u) not in mN]
    res.append((b,len(units),miss))
# 2) HWPML: each P's CHAR text (incl. inside tables) vs md
for f in sorted(glob.glob(D+'/원본/붙임4-관련규정/*.hwp')):
    b=os.path.basename(f)[:-4]; md=open(f'{D}/마크다운/붙임4-관련규정/{b}.md',encoding='utf-8').read(); mN=norm(md)
    raw=open(f,encoding='utf-8').read()
    units=[]
    for p in re.findall(r'<P [^>]*>(.*?)</P>',raw,re.S):
        p=re.sub(r'<TABLE.*','',p,flags=re.S)  # 표 앞 텍스트만(중첩은 셀 P로 따로 잡힘)
        t=''.join(re.findall(r'<CHAR[^>]*>(.*?)</CHAR>',p,re.S))
        t=re.sub(r'<[^>]+>',' ',t).replace('&lt;','<').replace('&gt;','>').replace('&amp;','&').replace('&nbsp;',' ').replace('&#160;',' ')
        if t.strip(): units.append(t)
    miss=[u for u in units if norm(u) not in mN]
    res.append((b,len(units),miss))
for b,n,m in res:
    print(f"{len(m):>3} 누락 / {n:>5} 단위  {b}")
    for x in m[:5]: print('      -',x.strip()[:100])
