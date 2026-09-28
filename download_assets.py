import os
import urllib.request
import re

files_info = [
    ("zenitsu2", "1ySzACxbZPYilH350sFEQT00nP1JHB1Vv"),
    ("shinobu1", "1d-AHwC5p8dAoxgYMIOP2Jfdnz6aY8HJi"),
    ("tanjiro2", "1x5o3MJa7ZfA3gLoBmF9edegAD6gi_08W"),
    ("gyomei1", "1a2G7qY8Jqp1PfScSSGPkwXjeRd02Acki"),
    ("nezuko1", "1aIuJPi9-HTD0ivEsMW1YKmkS5aR-LkXL"),
    ("tengen1", "1srmjOC1DmgHXtLBJBbbqA6JMNu8_rvOb"),
    ("tokito1", "1Ys60axoitMaXhle1rZB_sGF4diL6rpbN"),
    ("mitsuri1", "1c8GiqLzzjanLBz0yMOhgYZNPOgREoP3J"),
    ("mitsuri2", "1u8w6V3yZ6YanIh3TBg5iGNnJCbnEoc5G"),
    ("shinobu2", "1LiJvhDtoqAoEadKc2IheUK9aEk9ytiPT"),
    ("obanai2", "10UL8KH62cN6FYRE50wEvfNoneKArrQnu"),
    ("zenitsu1", "1l0-WUevVv1TGsJKKeFsjTFiXki3YjS_e"),
    ("rengoku1", "1FA9mZOOEJQTGQfhy-kTJEqastAs7j5Wq"),
    ("sanemi1", "1MoU8dHxxInMzkka3gr_g-Izse-lznOpl"),
    ("obanai1", "1lwtqrqqUlClinLmrw9BlHZr1TfGBjrlu"),
    ("inozuke1", "13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm"),
    ("giyu1", "1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5"),
    ("tangiro1", "1loWgD3S2sKaOaUWAv9DNJrN9ARNwgtxz"),
    ("rengoku2", "1loWgD3S2sKaOaUWAv9DNJrN9ARNwgtxz"),
    ("tokito2", "1bFO8SqPKQQ80lZECN3LzIZyLXr4LyKpP"),
    ("gyimei2", "1xUvYc8QPgCxqJcu6c4I9orxMsNwDPYd0"),
    ("tengen2", "1-EwkuHml7uktoqUttrH1ZAoHIlLwxwTG"),
    ("nezuko2", "1kKQAYTf3TaFGd7GRdAw172uBheQZne0j"),
    ("sanemi2", "1JAP1S36zurSPHYyFS4At_IzrboP4IdoL"),
    ("nezuko3", "10LejHl21yLFW7IlGlt_BWB-c0w43-UxG"),
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

def download_drive_file(file_id, target_base):
    urls_to_try = [
        f"https://lh3.googleusercontent.com/d/{file_id}",
        f"https://drive.usercontent.google.com/download?id={file_id}&export=download&authuser=0",
        f"https://drive.google.com/uc?export=download&id={file_id}",
    ]
    
    for url in urls_to_try:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                if len(data) > 1000: # ensure it's not an error HTML page
                    # determine image format from magic bytes
                    ext = ".png"
                    if data.startswith(b'\xff\xd8\xff'):
                        ext = ".jpg"
                    elif data.startswith(b'\x89PNG'):
                        ext = ".png"
                    elif data.startswith(b'GIF'):
                        ext = ".gif"
                    elif b'WEBP' in data[:20]:
                        ext = ".webp"
                    
                    filename = f"{target_base}{ext}"
                    with open(filename, "wb") as f:
                        f.write(data)
                    print(f"Downloaded {filename} ({len(data)} bytes) from {url}")
                    return filename, data
        except Exception as e:
            print(f"Failed {url}: {e}")
    return None, None

for name, file_id in files_info:
    filename, data = download_drive_file(file_id, name)
    # Also save aliases based on existing project usage
    if filename and data:
        # Check aliases
        aliases = []
        if name == "tangiro1":
            aliases.extend(["tanjiro1.jpeg", "tanjiro1.jpg"])
        elif name == "zenitsu1":
            aliases.extend(["zenitsu1.jpeg", "zenitsu1.jpg"])
        elif name == "inozuke1":
            aliases.extend(["inosuke1.jpeg", "inosuke1.jpg", "inosuke1.png"])
        elif name == "gyimei2":
            aliases.extend(["gyomei2.png", "gyomei2.jpg"])
        elif name.endswith("1"):
            base = name
            aliases.extend([f"{base}.jpg", f"{base}.jpeg"])
        elif name.endswith("2") or name.endswith("3"):
            base = name
            aliases.extend([f"{base}.png"])

        for alias in aliases:
            with open(alias, "wb") as f:
                f.write(data)
            print(f"  Created alias: {alias}")

print("Download process completed.")
