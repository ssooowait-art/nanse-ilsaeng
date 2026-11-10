"""src/nanse.html -> site/ (정적 배포본). 사용: python3 tools/build.py [배포 주소]"""
import sys,re,os,shutil,hashlib
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'src');OUT=os.path.join(ROOT,'site');os.makedirs(OUT,exist_ok=True)
BASE=(sys.argv[1] if len(sys.argv)>1 else 'https://nanse-ilsaeng.pages.dev').rstrip('/')
s=open(os.path.join(SRC,'nanse.html'),encoding='utf-8').read()
ver=hashlib.sha1(open(os.path.join(SRC,'portraits.webp'),'rb').read()).hexdigest()[:8]
s=s.replace('url(portraits.webp)',f'url(portraits.webp?v={ver})')
i=s.index('<div class="gloss"');head,body=s[:i],s[i:]
head=head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
body=re.sub(r"window\.__nanse=\{.*?\};\n","",body)
body=body.replace("const SHARE_URL='';",f"const SHARE_URL='{BASE+'/' if BASE else ''}';")
img=(BASE+'/og.png') if BASE else 'og.png'
desc='후한 말 오천만 백성 중 한 사람으로 랜덤하게 태어나, 실시간 선택으로 난세를 살아내는 삼국지 인생 시뮬레이션.'
meta=f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{desc}">
<meta name="theme-color" content="#E3E7DE">
<meta property="og:type" content="website">
<meta property="og:title" content="난세일생 · 오천만 중 한 사람">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
{f'<meta property="og:url" content="{BASE}/">' if BASE else ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{{color-scheme:light}}body{{margin:0;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);font-family:system-ui,-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:14px}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
'''
out=meta+head+'<noscript>이 게임은 자바스크립트가 필요합니다.</noscript>\n</head>\n<body>\n'+body+'\n</body>\n</html>\n'
open(os.path.join(OUT,'index.html'),'w',encoding='utf-8').write(out)
for fn in ['portraits.webp','og.png','favicon-32.png','apple-touch-icon.png','icon-512.png']:shutil.copy(os.path.join(SRC,fn),os.path.join(OUT,fn))
print('built',len(out)//1024,'KB','base=',BASE or '(relative)')
