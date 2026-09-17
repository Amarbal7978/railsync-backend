path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'path:[\"\']/login[\"\']', text)]
print("Login matches:", matches)
for pos in matches:
    print("--- SNIPPET ---")
    print(text[pos-200:pos+800])

# Also check route definition table
route_table_pos = text.find('path:"/planner"')
if route_table_pos != -1:
    print("\n--- ROUTE TABLE SNIPPET ---")
    print(text[route_table_pos-300:route_table_pos+1000])
