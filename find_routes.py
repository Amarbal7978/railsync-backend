path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
# Let's find Route path="..." or path:"..."
routes = re.findall(r'path:[\"\']([^\"\']+)[\"\']', text)
print("Routes:", set(routes))

# Let's search for entities or models (e.g. Train, Block, MaintenanceJob, etc.)
models = re.findall(r'ar\.entities\.([a-zA-Z0-9_]+)', text)
print("Entities:", set(models))

# Let's check how many components or pages are defined
pages = re.findall(r'function ([A-Z][a-zA-Z0-9_]*Page)\b', text)
print("Pages:", set(pages))
