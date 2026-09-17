import re

path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\fusion.html"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

root_match = re.search(r'<div id="root"[^>]*>(.*?)</div>\s*<div role="region"', content, re.DOTALL)
if root_match:
    root_html = root_match.group(1)
    header = re.search(r'<header[^>]*>(.*?)</header>', root_html, re.DOTALL)
    if header:
        print("=== HEADER ===")
        print(header.group(0)[:1500])
    aside = re.search(r'<aside[^>]*>(.*?)</aside>', root_html, re.DOTALL)
    if aside:
        print("=== ASIDE (FIRST 1500 CHARS) ===")
        print(aside.group(0)[:1500])
