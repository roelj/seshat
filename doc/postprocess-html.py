import re
import sys

path   = sys.argv[1]
html   = open(path, encoding='utf-8').read()

# Move <style> to the <head>.
head = re.search(r'(<body\b[^>]*>)\s*(<style\b[^>]*>.*?</style>)', html, re.S)
if head:
    html = (html[:head.start()] + head.group(1) + html[head.end():]).replace('</head>', head.group(2) + '</head>', 1)

# Optimize syntax highlighting colors.
colors = sorted({c.lower() for c in re.findall(r'<span style="color: (#[0-9a-fA-F]{6})">', html)})
names  = {c: f't{i}' for i, c in enumerate(colors)}
html   = re.sub(r'<span style="color: (#[0-9a-fA-F]{6})">', lambda m: f'<span class={names[m.group(1).lower()]}>', html)

def collapse (run):
    out, cls, text = [], None, ''
    for c, t in re.findall(r'<span class=(t\d+)>([^<]*)</span>', run.group()):
        if c == cls:
            text += t
            continue
        if cls:
            out.append(f'<span class={cls}>{text}</span>')
        cls, text = c, t
    out.append(f'<span class={cls}>{text}</span>')
    return ''.join(out)

html   = re.sub(r'(?:<span class=t\d+>[^<]*</span>)+', collapse, html)
html   = re.sub(r'(https?:)<span class=t\d+>(//[^<]*)</span>', r'\1\2', html)
html   = re.sub(r'(?<=\w)<span class=t\d+>(-?\d[\d.]*)</span>', r'\1', html)
rules  = ''.join(f'.{n}{{color:{c}}}' for c, n in names.items())

# Overwrite the file.
open(path, 'w', encoding='utf-8').write(html.replace('</style>', rules + '</style>', 1))
