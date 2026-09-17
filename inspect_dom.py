import re

path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\fusion.html"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

# Let's inspect the entire sidebar NAV list
nav_match = re.search(r'<nav[^>]*>(.*?)</nav>', html, re.DOTALL)
if nav_match:
    print("=== SIDEBAR NAV ITEMS ===")
    nav_links = re.findall(r'<a[^>]*>(.*?)</a>', nav_match.group(1), re.DOTALL)
    for nl in nav_links:
        clean = re.sub(r'<[^>]+>', ' ', nl).strip()
        clean = re.sub(r'\s+', ' ', clean)
        print("Nav item:", clean)

# Let's inspect what is in the main body / views
main_match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
if main_match:
    print("\n=== MAIN CONTENT SUMMARY ===")
    main_text = main_match.group(1)
    print("Main content length:", len(main_text))
    # Look for headers or cards inside main
    cards = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', main_text, re.DOTALL)
    for c in cards[:25]:
        clean = re.sub(r'<[^>]+>', '', c).strip()
        print("Header in main:", clean)

# Let's inspect the Header elements in Layout
header_match = re.search(r'<header[^>]*>(.*?)</header>', html, re.DOTALL)
if header_match:
    print("\n=== HEADER ELEMENTS ===")
    h_text = header_match.group(1)
    print(re.sub(r'<[^>]+>', ' | ', h_text))
