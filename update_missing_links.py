import glob

# Specific replacements for inosuke2 and giyu2
REPLACEMENTS = {
    # Inosuke 2 URL
    "1MwSDJsiNgRf6_lWmdDfWz7lUp5XXpqhg": "https://lh3.googleusercontent.com/d/1MwSDJsiNgRf6_lWmdDfWz7lUp5XXpqhg",
    # Giyu 2 URL
    "1t7GUrVPNzC7q26IxZVYOoc2IrOu72ngR": "https://lh3.googleusercontent.com/d/1t7GUrVPNzC7q26IxZVYOoc2IrOu72ngR",
}

# Update files where inosuke2 and giyu2 were previously using inosuke1 or giyu1 as fallback
files_to_update = glob.glob("*.html") + glob.glob("*.js")

# Inosuke 1 URL: 13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm
# Giyu 1 URL: 1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5

inosuke2_target = "https://lh3.googleusercontent.com/d/1MwSDJsiNgRf6_lWmdDfWz7lUp5XXpqhg"
giyu2_target = "https://lh3.googleusercontent.com/d/1t7GUrVPNzC7q26IxZVYOoc2IrOu72ngR"

# In galaxia.html:
with open("galaxia.html", "r", encoding="utf-8") as f:
    galaxia_content = f.read()

# Replace inosuke2 in DEMON_SLAYER_CHARACTERS & char-badge-list
# Inosuke block:
# jpg: https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm
# png: https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm  -> change png to inosuke2_target

old_inosuke_block = """    {
      name: "Inosuke Hashibira",
      jpg: "https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm",
      png: "https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm","""

new_inosuke_block = f"""    {{
      name: "Inosuke Hashibira",
      jpg: "https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm",
      png: "{inosuke2_target}","""

if old_inosuke_block in galaxia_content:
    galaxia_content = galaxia_content.replace(old_inosuke_block, new_inosuke_block)
    print("Updated Inosuke 3D block in galaxia.html")

old_giyu_block = """    {
      name: "Giyu Tomioka",
      jpg: "https://lh3.googleusercontent.com/d/1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5",
      png: "https://lh3.googleusercontent.com/d/1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5","""

new_giyu_block = f"""    {{
      name: "Giyu Tomioka",
      jpg: "https://lh3.googleusercontent.com/d/1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5",
      png: "{giyu2_target}","""

if old_giyu_block in galaxia_content:
    galaxia_content = galaxia_content.replace(old_giyu_block, new_giyu_block)
    print("Updated Giyu 3D block in galaxia.html")

# Update avatar badge onclick handlers in galaxia.html
old_inosuke_badge = "showCharMsg('🐗 Inosuke Hashibira', '🐗 ¡JAJAJA! ¡El gran Inosuke-sama declara que Nayheli es la jefa conquistadora de todo el cosmos!', 'https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm'"
new_inosuke_badge = f"showCharMsg('🐗 Inosuke Hashibira', '🐗 ¡JAJAJA! ¡El gran Inosuke-sama declara que Nayheli es la jefa conquistadora de todo el cosmos!', '{inosuke2_target}'"

if old_inosuke_badge in galaxia_content:
    galaxia_content = galaxia_content.replace(old_inosuke_badge, new_inosuke_badge)
    print("Updated Inosuke badge in galaxia.html")

old_giyu_badge = "showCharMsg('🌊 Giyu Tomioka', '🌊 Giyu contempla la calma del espacio y te confía la serenidad de las mareas cósmicas para tus 11 años.', 'https://lh3.googleusercontent.com/d/1_5XoYHl1ILK5xt9tRBBr_CFtMDBZAVk5'"
new_giyu_badge = f"showCharMsg('🌊 Giyu Tomioka', '🌊 Giyu contempla la calma del espacio y te confía la serenidad de las mareas cósmicas para tus 11 años.', '{giyu2_target}'"

if old_giyu_badge in galaxia_content:
    galaxia_content = galaxia_content.replace(old_giyu_badge, new_giyu_badge)
    print("Updated Giyu badge in galaxia.html")

with open("galaxia.html", "w", encoding="utf-8") as f:
    f.write(galaxia_content)

# In escuadron_t.html:
with open("escuadron_t.html", "r", encoding="utf-8") as f:
    escuadron_content = f.read()

old_inosuke_card = '<img src="https://lh3.googleusercontent.com/d/13ff8imkrx0b-xCHM-6Ep7jACf9GHr_bm" alt="Inosuke Overlay" />'
new_inosuke_card = f'<img src="{inosuke2_target}" alt="Inosuke Overlay" />'

if old_inosuke_card in escuadron_content:
    escuadron_content = escuadron_content.replace(old_inosuke_card, new_inosuke_card)
    print("Updated Inosuke overlay card in escuadron_t.html")

with open("escuadron_t.html", "w", encoding="utf-8") as f:
    f.write(escuadron_content)

print("Update completed!")
