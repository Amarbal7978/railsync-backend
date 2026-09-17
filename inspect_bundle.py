import re

path = r"C:\Users\bal98\OneDrive\Pictures\RailSync AI _ Base44_files\index-CTkgGKhC.js.download"
with open(path, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Search for route definitions or component names
# Look for page names
pages = ["Dashboard", "AI Block Planner", "Maintenance Intelligence", "Asset Health", "Opportunity Radar", 
         "Job Fusion", "Railway Network", "Train Operations", "Conflict Center", "What-If Simulator", 
         "Weekly Plan", "Monthly Plan", "Analytics", "Block Passport", "AI Copilot", "Settings"]

for p in pages:
    idx = text.find(p)
    print(f"Page '{p}': found at pos {idx}")

# Check what router is used
if "react-router" in text:
    print("Uses react-router")
if "createBrowserRouter" in text:
    print("Uses createBrowserRouter")
if "Routes" in text:
    print("Mentions Routes")
