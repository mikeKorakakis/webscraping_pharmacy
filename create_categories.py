from saleor_gql_loader import ETLDataLoader
from slugify import slugify
# initialize the data_loader (optionally provide an endpoint url as second parameter)
data_loader = ETLDataLoader("HxwnUnFMS0Wl57gOm4sqLmxhjROWQT")

# category_id1 = data_loader.create_category(name="Αναβάτης", slug="rider")
# category_id2 = data_loader.create_category(name="Μοτοσυκλέτα", slug="moto")
# data_loader.create_category_image(category_id, "./brembo.png")
# print(category_id1)
# print(category_id2)
parent_moto="Q2F0ZWdvcnk6MzE="
parent_rider="Q2F0ZWdvcnk6MzI="

f = open("cat_moto.csv")
data = f.read()
data = data.split(", ")
for j in data:
    print(j)
    category_id1 = data_loader.create_category(name=j, slug=slugify(j), parent=parent_moto)
    # print(category_id1)


f2 = open("cat_rider.csv")
data2 = f2.read()
data2 = data2.split(", ")
for k in data2:
    print(k)
    category_id2 = data_loader.create_category(name=k, slug=slugify(k), parent=parent_rider)
    # print(category_id2)