print("🚀 Script started...")  # Add this at the very top

import json
import urllib.request

# Download word list
url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json"
file_name = "all_words.json"
urllib.request.urlretrieve(url, file_name)

# Load full dictionary
with open(file_name, 'r') as file:
    all_words = json.load(file)

# Create word lists by length
words5 = [word for word in all_words if len(word) == 5 and word.isalpha()]
words6 = [word for word in all_words if len(word) == 6 and word.isalpha()]
words7 = [word for word in all_words if len(word) == 7 and word.isalpha()]

# Save to separate JSON files
with open("words/words5.json", "w") as f:
    json.dump(words5, f)

with open("words/words6.json", "w") as f:
    json.dump(words6, f)

with open("words/words7.json", "w") as f:
    json.dump(words7, f)

print("✅ Word lists created successfully!")
