import re, os

src_path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\fusion.html"
with open(src_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

head_match = re.search(r"<head>(.*?)</head>", text, re.DOTALL)
if head_match:
    head = head_match.group(1)
    links = re.findall(r"<link[^>]+>", head)
    for l in links:
        print("Link tag:", l)
    scripts = re.findall(r"<script[^>]*src=[\"'](.*?)[\"']", head)
    for s in scripts:
        print("Script src:", s)

# Check for inline styles or classes in body
body_match = re.search(r"<body[^>]*>(.*?)</body>", text, re.DOTALL)
if body_match:
    body = body_match.group(1)
    print("Body length:", len(body))
    # Check top-level elements inside root
    root_match = re.search(r'<div id="root"[^>]*>(.*?)</div>\s*<div role="region"', text, re.DOTALL)
    if root_match:
        print("Root length:", len(root_match.group(1)))
