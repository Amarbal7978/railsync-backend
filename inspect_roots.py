import re

for fname in ["saved_resource.html", "fusion.html"]:
    path = rf"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\{fname}"
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    root_match = re.search(r'<div id="root"[^>]*>(.*?)</div>\s*<div role="region"', content, re.DOTALL)
    if root_match:
        root_html = root_match.group(1)
        print(f"=== {fname} ROOT LENGTH: {len(root_html)} ===")
        # check if it has the sidebar, header, etc.
        headers = re.findall(r'<header[^>]*>(.*?)</header>', root_html, re.DOTALL)
        print(f"Headers count: {len(headers)}")
        asides = re.findall(r'<aside[^>]*>(.*?)</aside>', root_html, re.DOTALL)
        print(f"Asides count: {len(asides)}")
        main = re.findall(r'<main[^>]*>(.*?)</main>', root_html, re.DOTALL)
        print(f"Main count: {len(main)}")
