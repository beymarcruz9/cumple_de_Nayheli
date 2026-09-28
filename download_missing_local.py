import urllib.request

targets = {
    "inosuke2.png": "https://lh3.googleusercontent.com/d/1MwSDJsiNgRf6_lWmdDfWz7lUp5XXpqhg",
    "inuzuke2.png": "https://lh3.googleusercontent.com/d/1MwSDJsiNgRf6_lWmdDfWz7lUp5XXpqhg",
    "giyu2.png": "https://lh3.googleusercontent.com/d/1t7GUrVPNzC7q26IxZVYOoc2IrOu72ngR"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

for name, url in targets.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(name, "wb") as f:
                f.write(data)
            print(f"Downloaded local copy of {name} ({len(data)} bytes)")
    except Exception as e:
        print(f"Failed {name}: {e}")

print("Missing downloads complete.")
