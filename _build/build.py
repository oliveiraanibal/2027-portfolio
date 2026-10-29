#!/usr/bin/env python3
"""Builds the static pages of the portfolio from the fragments in _build/src.

Each fragment starts with a small header comment:

    <!--
    title: KB RetroTool
    description: One sentence for search results and link previews.
    image: imgs/kb-card.jpg
    -->

Case-study fragments mark their sections with <section id="..." data-nav="Label">;
the side rail, the contact line and the previous/next links are added here, so every
page shares the same header, footer and metadata. Run: python3 _build/build.py
"""
import html
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "_build" / "src"
BASE_URL = "https://oliveiraanibal.github.io/2027-portfolio/"
EMAIL = "oliveira.anibal@gmail.com"
LINKEDIN = "https://www.linkedin.com/in/oliveiraanibal/"
NAME = "Aníbal Oliveira"

# Case studies in reading order; drives previous/next.
CASES = [
    ("case-study-feedzai", "Feedzai RiskOps Studio"),
    ("case-study-maya", "Maya, L5 Trip Concierge"),
    ("case-study-kb", "KB RetroTool"),
    ("case-study-sancus", "Sancus AI"),
    ("case-study-shell", "Shell Mobility offers"),
    ("case-study-lichtmonitor", "lichtMONITOR"),
    ("case-study-tds", "Tridonic Design System"),
    ("case-study-continente", "Continente Online"),
    ("case-study-weblicious", "WebLicious"),
]

GTAG = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-BQ8R2S5PRK"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-BQ8R2S5PRK');
</script>"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link href="https://fonts.googleapis.com/css2?family=SUSE:wght@200..700&amp;'
         'family=Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400&amp;display=swap" rel="stylesheet">')

ICON_MAIL = ('<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">'
             '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>')
ICON_IN = ('<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04'
           '-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43'
           'a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>')


def parse(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--(.*?)-->", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        text = text[m.end():]
    return meta, text.strip()


def head(meta, slug):
    title = meta["title"]
    full = title if title.startswith(NAME) else f"{title} | {NAME}"
    desc = meta.get("description", "")
    img = BASE_URL + meta.get("image", "imgs/og.jpg")
    url = BASE_URL + ("" if slug == "index" else slug + ".html")
    e = html.escape
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{GTAG}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(full)}</title>
<meta name="description" content="{e(desc)}">
<meta name="author" content="{NAME}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NAME}">
<meta property="og:title" content="{e(full)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image">
{FONTS}
<link rel="stylesheet" href="site.css">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
{meta.get('head', '')}
</head>
"""


def header(current):
    def cur(name):
        return ' aria-current="page"' if name == current else ""
    return f"""<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="in">
    <a class="brand" href="index.html">{NAME}</a>
    <nav class="site-nav" aria-label="Main">
      <a href="index.html#work"{cur('work')}>Work</a>
      <a href="about.html"{cur('about')}>About</a>
      <a class="opt" href="mailto:{EMAIL}">Email</a>
    </nav>
  </div>
</header>
"""


def footer():
    return f"""<footer class="site-footer">
  <div class="in">
    <span>{NAME}, Senior UX Product Designer. Porto, working remotely.</span>
    <span class="links"><a href="mailto:{EMAIL}">{EMAIL}</a><a href="{LINKEDIN}" rel="noopener">LinkedIn</a></span>
  </div>
</footer>
<script src="site.js" defer></script>
</body>
</html>
"""


def case_page(slug, meta, body):
    sections = re.findall(r'<section id="([^"]+)" data-nav="([^"]+)"', body)
    rail = "\n".join(f'        <li><a href="#{i}">{html.escape(label)}</a></li>' for i, label in sections)
    idx = [s for s, _ in CASES].index(slug)
    prev_ = CASES[idx - 1] if idx > 0 else None
    next_ = CASES[idx + 1] if idx < len(CASES) - 1 else CASES[0]
    pager = ""
    if prev_:
        pager += f'<a class="prev" href="{prev_[0]}.html"><span>Previous</span><strong>{prev_[1]}</strong></a>'
    pager += f'<a class="next" href="{next_[0]}.html"><span>Next</span><strong>{next_[1]}</strong></a>'
    end = f"""
    <div class="case-end">
      <p class="hire">Want the longer version of this story? Email me at <a href="mailto:{EMAIL}">{EMAIL}</a> or find me on <a href="{LINKEDIN}" rel="noopener">LinkedIn</a>.</p>
      <nav class="pager" aria-label="More case studies">{pager}</nav>
    </div>"""
    return (head(meta, slug) + header("work") + f"""<div class="case">
  <aside class="rail">
    <nav aria-label="On this page">
      <a class="back" href="index.html#work">All work</a>
      <ol>
{rail}
      </ol>
    </nav>
  </aside>
  <main id="main" class="case-main">
{body}
{end}
  </main>
</div>
""" + footer())


def plain_page(slug, meta, body, current):
    return head(meta, slug) + header(current) + f'<main id="main">\n{body}\n</main>\n' + footer()


def main():
    for path in sorted(SRC.glob("*.html")):
        slug = path.stem
        meta, body = parse(path)
        body = body.replace("{{EMAIL}}", EMAIL).replace("{{LINKEDIN}}", LINKEDIN)
        if slug.startswith("case-study-"):
            out = case_page(slug, meta, body)
        else:
            out = plain_page(slug, meta, body, "work" if slug == "index" else "about")
        (ROOT / f"{slug}.html").write_text(out, encoding="utf-8")
        print("built", slug)


if __name__ == "__main__":
    main()
