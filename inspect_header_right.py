path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

pos_Uz = text.find("function Uz")
print(text[pos_Uz+1000:pos_Uz+3000])
