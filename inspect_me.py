path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
pos = text.find("async me(")
if pos == -1:
    pos = text.find("me(){")
if pos == -1:
    pos = text.find("/auth/me")
print("pos:", pos)
if pos != -1:
    print(text[pos-200:pos+500])
