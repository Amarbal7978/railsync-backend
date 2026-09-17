import re

src_path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44.html"
with open(src_path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

links = re.findall(r'<link[^>]+>', text)
for l in links:
    print("Link:", l)
