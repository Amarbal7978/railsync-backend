path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
# Find function r7
pos_r7 = text.find("function r7")
if pos_r7 != -1:
    print("function r7 snippet:")
    print(text[pos_r7:pos_r7+800])

pos_Uz = text.find("function Uz")
if pos_Uz != -1:
    print("\nfunction Uz (Layout) snippet:")
    print(text[pos_Uz:pos_Uz+2000])
