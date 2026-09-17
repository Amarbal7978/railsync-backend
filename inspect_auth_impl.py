path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
pos = text.find("loginViaEmailPassword")
if pos != -1:
    print("loginViaEmailPassword pos:", pos)
    print(text[pos-200:pos+600])

pos_me = text.find("me:async")
if pos_me != -1:
    print("\nme:async pos:", pos_me)
    print(text[pos_me-200:pos_me+600])
else:
    pos_me2 = text.find("auth.me")
    print("auth.me pos:", pos_me2)
