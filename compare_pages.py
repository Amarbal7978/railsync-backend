import re

for fname in ["saved_resource.html", "fusion.html"]:
    path = rf"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\{fname}"
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    print(f"=== {fname} ===")
    print("Length:", len(content))
    # Check if there are stylesheet links
    css = re.findall(r'<link[^>]*rel=[\"\']stylesheet[\"\'][^>]*>', content)
    print("CSS links:", css)
    # Check title
    title = re.findall(r'<title>(.*?)</title>', content)
    print("Title:", title)
    # Check script tags
    scripts = re.findall(r'<script[^>]*src=[\"\'](.*?)[\"\']', content)
    print("Scripts:", scripts)
