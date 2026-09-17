path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

import re
# Find definition of ar or api calls
pos = text.find("ar.auth")
if pos != -1:
    print("Found ar.auth at:", pos)
    print(text[pos-300:pos+300])

# Let's check how ar is initialized
pos_ar = text.find("auth:{")
print("\nauth:{ pos:", pos_ar)
if pos_ar != -1:
    print(text[pos_ar-100:pos_ar+400])
