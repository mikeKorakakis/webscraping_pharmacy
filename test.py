# define my products usually extracted from csv or scraped...
from saleor_gql_loader import ETLDataLoader
from slugify import slugify
import json
import time
# initialize the data_loader (optionally provide an endpoint url as second parameter)
etl_data_loader = ETLDataLoader("HxwnUnFMS0Wl57gOm4sqLmxhjROWQT")
warehouse_id="V2FyZWhvdXNlOjIyNDJlNWVmLWFmMDYtNGRhMi1hMWFjLWM0NjY1NWQ1Yzg4MQ=="
products = [
    {
        "name": "tea a",
        "description": "description for tea a",
        "category": "green tea",
        "price": 5.5,
        "strength": "medium"
    },
    {
        "name": "tea b",
        "description": "description for tea b",
        "category": "black tea",
        "price": 10.5,
        "strength": "strong"
    },
    {
        "name": "tea c",
        "description": "description for tea c",
        "category": "green tea",
        "price": 9.5,
        "strength": "light"
    }
]

for i, product in enumerate(products):
    product["sku"] = "{:05}-00".format(i)
    # create the strength attribute
strength_attribute_id = etl_data_loader.create_attribute(name="strength")
unique_strength = set([product['strength'] for product in products])
for strength in unique_strength:
    etl_data_loader.create_attribute_value(strength_attribute_id, name=strength)

# print(products)

# create another quantity attribute used as variant:
qty_attribute_id =  etl_data_loader.create_attribute(name="qty")
unique_qty = {"100g", "200g", "300g"}
for qty in unique_qty:
    etl_data_loader.create_attribute_value(qty_attribute_id, name=qty)

# # create a product type: tea
product_type_id = etl_data_loader.create_product_type(name="tea",
                                                      hasVariants=True, 
                                                      productAttributes=[strength_attribute_id],
                                                      variantAttributes=[qty_attribute_id])

unique_categories = set([product['category'] for product in products])

# # create categories

cat_to_id = {}
for category in unique_categories:
    cat_to_id[category] = etl_data_loader.create_category(name=category)


# create products and store id
for i, product in enumerate(products):
  

    product_id = etl_data_loader.create_product(product_type_id,
                                                name=product["name"],
                                                description=json.dumps({"time":time.gmtime(), "blocks": [{"type":"paragraph", "data":{"text": product["description"]}}], "version":"2.20.0"}),
                                                # basePrice=product["price"],
                                                # sku=product["sku"],
                                                category=cat_to_id[product["category"]],
                                                attributes=[{"id": strength_attribute_id, "values": [product["strength"]]}],
                                                # isPublished=True
                                                )
    products[i]["id"] = product_id
# # create some variant for each product:
# for product in products[0]:
product=products[0]
print(product)
for i, qty in enumerate(unique_qty):
    variant_id = etl_data_loader.create_product_variant(product_id,
                                                        sku=product["sku"].replace("-00", "-1{}".format(i+1)),
                                                        attributes=[{"id": qty_attribute_id, "values": [qty]}],
                                                        # costPrice=product["price"],
                                                        trackInventory= True,
                                                        weight=0.75,
                                                        stocks=[{"warehouse": warehouse_id, "quantity": 15}])
