from transliterate import translit, get_available_language_codes
from slugify import slugify

text = "Δαγκάνες/Εμβολάκια"
# text = translit(text, 'el', reversed=True)

print(slugify(text))