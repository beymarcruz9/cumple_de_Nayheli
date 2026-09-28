import os, shutil

# Fallback copies for characters that only had version 1 provided in the drive list
fallbacks = {
    "inosuke2.png": "inosuke1.jpeg",
    "giyu2.png": "giyu1.jpg",
    "inosuke2.jpg": "inosuke1.jpeg",
    "giyu2.jpg": "giyu1.jpg"
}

for dest, src in fallbacks.items():
    if not os.path.exists(dest) and os.path.exists(src):
        shutil.copy(src, dest)
        print(f"Created fallback alias {dest} from {src}")

print("Fallback verification complete.")
