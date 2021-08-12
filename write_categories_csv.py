

import os
import json
if os.path.exists("cat.csv"):
  os.remove("cat.csv")
else:
  print("The file does not exist") 
  
f = open('data.json')
data = json.load(f)

f2 = open("cat.csv", "x") 
cat_list = []
for i in data['car']:
    cat_list.append(i['category'])

cat_list = list(dict.fromkeys(cat_list))
for j in cat_list:
    f2.write(j + ", ")
# Closing file
f.close()
f2.close()