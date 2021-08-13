
import os
import json
from slugify import slugify
from datetime import date
from collections import deque
def flatten(t):
    return [item for sublist in t for item in sublist]
def traverse(json,index):
    initial = index - 1
    mydata=[]
    queue=[]
    level=-1
    queue.append([json, -1, level])
    index = initial
    while len(queue) > 0:
        node, idx, lvl = queue.pop(0)
        mydata.append({"name":node["name"],"index": index, "parent": None if idx == initial else idx, "level": lvl})
        if ("sub" in node):
            level=lvl+1
            for i in node["sub"]:
                queue.append([i,index,level])
        index=index+1
    mydata.pop(0)
    return mydata

if os.path.exists("saleor.json"):
  os.remove("saleor.json")
else:
  print("The file does not exist") 
  
index=100
product_collection=index
data_set = []
sku=546451996
data_set.append(
        {
      "model": "product.collection",
      "pk": product_collection,
      "fields": {
      "private_metadata": {},
      "metadata": {},
      "seo_title": None,
      "seo_description": None,
      "name": "Featured Products",
      "slug": "featured-products",
      "background_image": "collection-backgrounds/clothing_R7nkNxS.jpg",
      "background_image_alt": "",
      "description": {
        "blocks": [{
          "key": "",
          "data": {},
          "text": "Featured Products. Literally, they are not real products, but the Saleor demo store is a genuine e-commerce leader.",
          "type": "unstyled",
          "depth": 0,
          "entityRanges": [],
          "inlineStyleRanges": []
        }],
        "entityMap": {}
      }
    }
        })
index=index+1
product_collectionchannellisting=index
data_set.append(
        {
      "model": "product.collectionchannellisting",
      "pk": product_collectionchannellisting,
      "fields": {
      "publication_date": date.today().strftime("%Y-%m-%d"),
      "is_published": True,
      "collection": product_collection,
      "channel": 1
    }
        })
index=index+1


car = open('cat_all.json')
data = json.load(car)
categories = traverse(data["categories"], index)
car.close()

for cat in categories:
    data_set.append(
            {
            "model": "product.category",
            "pk": cat["index"],
            "fields": {
            "private_metadata": {},
            "metadata": {},
            "seo_title": "",
            "seo_description": "",
            "name": cat["name"],
            "slug": slugify(cat["name"]),
            "description": {
                "blocks": [{
                "data": {
                    "text": ""
                },
                "type": "paragraph"
                }]
            },
            "parent": cat["parent"],
            "background_image": "category-backgrounds/accessories_HMorc9P.jpg",
            "background_image_alt": "",
            "tree_id": 1,
            "level": cat["level"]
            }
            })
product_moto_category=index
index = index + 1
product_rider_category=index 
index=index+len(categories) - 2



index=index+1
product_producttype = index
data_set.append({
    "model": "product.producttype",
    "pk": product_producttype,
    "fields": {
      "private_metadata": {},
      "metadata": {
        "vatlayer.code": "standard",
        "vatlayer.description": "standard"
      },
      "name": "Moto General",
      "slug": "moto-general",
      "has_variants": False,
      "is_shipping_required": True,
      "is_digital": False,
      "weight": "1.0:kg"
    }
})

# create fits and manufacturer lists
car_json = open("car.json") 
car = json.load(car_json)
fits_list=[]
for s in car["car"]:
    fits_list.append(s["fits"])
# fits_list = set(s["fits"] for s in car["car"])
fits_list = list(dict.fromkeys(flatten(fits_list)))
fits=[]
for s in fits_list:
    fits.append(s.strip())
manufacturer=[]
for s in car["car"]:
    manufacturer.append(s["manufacturer"].strip())
car_json.close()
#######################################

# create attributes

index = index + 1
attribute_attribute_manufacturer=index
data_set.append({
    "model": "attribute.attribute",
    "pk": attribute_attribute_manufacturer,
    "fields": {
    "private_metadata": {},
    "metadata": {},
    "slug": "manufacturer",
    "name": "Κατασκευαστής",
    "type": "product-type",
    "input_type": "multiselect",
    "value_required": False,
    "is_variant_only": False,
    "visible_in_storefront": True,
    "filterable_in_storefront": True,
    "filterable_in_dashboard": False,
    "storefront_search_position": 0,
    "available_in_grid": True
}
}
)

index = index + 1
attribute_attribute_model=index
data_set.append({
    "model": "attribute.attribute",
    "pk": attribute_attribute_model,
    "fields": {
    "private_metadata": {},
    "metadata": {},
    "slug": "model",
    "name": "Μοντέλο",
    "type": "product-type",
    "input_type": "rich-text",
    "value_required": False,
    "is_variant_only": False,
    "visible_in_storefront": True,
    "filterable_in_storefront": False,
    "filterable_in_dashboard": False,
    "storefront_search_position": 0,
    "available_in_grid": True
}
}
)

index = index + 1
attribute_attribute_fits=index
data_set.append({
    "model": "attribute.attribute",
    "pk": attribute_attribute_fits,
    "fields": {
    "private_metadata": {},
    "metadata": {},
    "slug": "motorycle-fitment",
    "name": "Μοντέλο Μοτοσυκλέτας",
    "type": "product-type",
    "input_type": "multiselect",
    "value_required": False,
    "is_variant_only": False,
    "visible_in_storefront": True,
    "filterable_in_storefront": True,
    "filterable_in_dashboard": False,
    "storefront_search_position": 0,
    "available_in_grid": True
}
}
)

index = index + 1
attribute_attribute_car_url=index
data_set.append({
    "model": "attribute.attribute",
    "pk": attribute_attribute_car_url,
    "fields": {
    "private_metadata": {},
    "metadata": {},
    "slug": "car_url",
    "name": "Car.gr Url",
    "type": "product-type",
    "input_type": "rich-text",
    "value_required": False,
    "is_variant_only": False,
    "visible_in_storefront": True,
    "filterable_in_storefront": False,
    "filterable_in_dashboard": False,
    "storefront_search_position": 0,
    "available_in_grid": True
}
}
)

index = index + 1
attribute_attribute_condition=index
data_set.append({
    "model": "attribute.attribute",
    "pk": attribute_attribute_condition,
    "fields": {
    "private_metadata": {},
    "metadata": {},
    "slug": "condition",
    "name": "Κατάσταση",
    "type": "product-type",
    "input_type": "dropdown",
    "value_required": True,
    "is_variant_only": False,
    "visible_in_storefront": True,
    "filterable_in_storefront": True,
    "filterable_in_dashboard": False,
    "storefront_search_position": 0,
    "available_in_grid": True
}
}
)
# assign attributes to product type
index = index + 1
product_attributeproduct_fits=index
data_set.append({
"model": "attribute.attributeproduct",
"pk": product_attributeproduct_fits,
"fields": {
    "sort_order": None,
    "attribute": attribute_attribute_fits,
    "product_type": product_producttype
}})

index = index + 1
product_attributeproduct_manufacturer=index
data_set.append({
"model": "attribute.attributeproduct",
"pk": product_attributeproduct_manufacturer,
"fields": {
    "sort_order": None,
    "attribute": attribute_attribute_manufacturer,
    "product_type": product_producttype
}})

index = index + 1
product_attributeproduct_model=index
data_set.append({
"model": "attribute.attributeproduct",
"pk": product_attributeproduct_model,
"fields": {
    "sort_order": None,
    "attribute": attribute_attribute_model,
    "product_type": product_producttype
}})

index = index + 1
product_attributeproduct_car_url=index
data_set.append({
"model": "attribute.attributeproduct",
"pk": product_attributeproduct_car_url,
"fields": {
    "sort_order": None,
    "attribute": attribute_attribute_car_url,
    "product_type": product_producttype
}})

index = index + 1
product_attributeproduct_condition=index
data_set.append({
"model": "attribute.attributeproduct",
"pk": product_attributeproduct_condition,
"fields": {
    "sort_order": None,
    "attribute": attribute_attribute_condition,
    "product_type": product_producttype
}})

# create attributes values
fits_index=[]
for i in fits:
    index = index + 1
    attribute_attributevalue_fits=index
    fits_index.append({"index":index, "value": i})
    data_set.append({
        "model": "attribute.attributevalue",
        "pk": attribute_attributevalue_fits,
        "fields": {
        "sort_order": 0,
        "name": i,
        "value": "",
        "slug": slugify(i),
        "attribute": attribute_attribute_fits
    }
    }
    )
manufacturer_index = []
for i in manufacturer:
    index = index + 1
    attribute_attributevalue_manufacturer=index
    manufacturer_index.append({"index":index, "value": i})
    data_set.append({
        "model": "attribute.attributevalue",
        "pk": attribute_attributevalue_manufacturer,
        "fields": {
        "sort_order": 0,
        "name": i,
        "value": "",
        "slug": slugify(i),
        "attribute": attribute_attribute_manufacturer
    }
    }
    )

index = index + 1
product_attributevalue_condition_new=index
data_set.append({
        "model": "attribute.attributevalue",
        "pk": product_attributevalue_condition_new,
        "fields": {
        "sort_order": 0,
        "name": "Καινούριο",
        "value": "",
        "slug": "new",
        "attribute": attribute_attribute_condition
    }
    }
)
index = index + 1
product_attributevalue_condition_used=index
data_set.append({
        "model": "attribute.attributevalue",
        "pk": product_attributevalue_condition_used,
        "fields": {
        "sort_order": 0,
        "name": "Μεταχειρισμένο",
        "value": "",
        "slug": "used",
        "attribute": attribute_attribute_condition
    }
    }
)
# index = index + 1
# attribute_attributevariant=index
# data_set.append({
# "model": "attribute.attributevariant",
# "pk": attribute_attributevariant,
# "fields": {
#     "sort_order": None,
#     "attribute": attribute_attribute,
#     "product_type": product_producttype
# }
# }
# )


car = open('car.json')
car_data = json.load(car)

for i in car_data['car']:
    index = index + 1
    product_product=index
    descrArr = []
    flt = list(filter(lambda x: x["name"] == i["category"],categories))
    cat =  flt[0]["index"] if len(flt)>0 else product_moto_category
    description =  i["description"].split("/n/n")
    for j in description:
        if j.find("\n") != -1:
            subArr=j.split("\n") 
            for k in subArr:
                descrArr.append({
                "data": {
                    "text": k
                },
                "type": "paragraph"
                })
        else:
            descrArr.append({
            "data": {
                "text": j
            },
            "type": "paragraph"
            })

    image_list =list(map(lambda x: "zenone/"+x[x.rfind('/')+1:], i["image"])	)
    data_set.append({
    "model": "product.product",
    "pk": product_product,
    "fields": {
      "private_metadata": {},
      "metadata": {
        "taxes": {
          "vatlayer": {
            "code": "standard",
            "description": "standard"
          }
        }
      },
      "seo_title": "",
      "seo_description": i["name"],
      "images": image_list,
    #   "description_plaintext": i["description"],
      "product_type": product_producttype,
      "name": i["name"],
      "slug": slugify(i["name"]),
      "description": {
        "blocks": descrArr
      },
      "category": cat,
      "updated_at": None,
      "charge_taxes": True,
      "weight": "0.0:kg"
    }
    })

    # create product images

    # index = index + 1
    # product_productimage=index
    # image_list =list(map(lambda x: "zenone/"+x[x.rfind('/')+1:], i["image"])	)
    # data_set.append(
    #   {
    # "model": "product.productimage",
    # "pk": product_productimage,
    # "fields": {
    #   "sort_order": 0,
    #   "product": product_product,
    #   "image": image_list,
    #   "ppoi": "0.5x0.5",
    #   "alt": ""
    # }
    # }
    # )

#  assign product to channel
    index = index + 1
    product_productchannellisting=index
    data_set.append(
      {
      "model": "product.productchannellisting",
      "pk": product_productchannellisting,
      "fields": {
      "publication_date": date.today().strftime("%Y-%m-%d"),
      "is_published": True,
      "product": product_product,
      "channel": 1,
      "visible_in_listings": True,
      "available_for_purchase": date.today().strftime("%Y-%m-%d"),
      "currency": "EUR"
      }
    }
    )

    # create product variant
    sku=sku+1
    index = index + 1
    product_productvariant=index
    data_set.append(
    {
    "model": "product.productvariant",
    "pk": product_productvariant,
    "fields": {
      "private_metadata": {},
      "metadata": {},
      "sku": sku,
      "name": "default",
      "product": product_product,
      "track_inventory": True,
      "default": True,
      "weight": "1.0:kg"
    }    
    }
    )

    # assign attributes to product
    index = index + 1
    product_assignedproductattribute_fits=index
    fits_attr=[]
    for j in i["fits"]:
        y = list(filter(lambda x: x["value"] == j.strip(), fits_index))[0]
        fits_attr.append(y["index"])
    data_set.append(      
        {
        "model": "attribute.assignedproductattribute",
        "pk": product_assignedproductattribute_fits,
        "fields": {
            "product": product_product,
            "assignment": product_attributeproduct_fits,
            "values": fits_attr
        }    
    })

    index = index + 1
    product_assignedproductattribute_manufacturer=index
    manufacturer_attr= list(filter(lambda x: x["value"] == i["manufacturer"].strip(), manufacturer_index))
    manufacturer_attr = [manufacturer_attr[0]["index"]]
    data_set.append(      
        {
        "model": "attribute.assignedproductattribute",
        "pk": product_assignedproductattribute_manufacturer,
        "fields": {
            "product": product_product,
            "assignment": product_attributeproduct_manufacturer,
            "values": manufacturer_attr
        }    
    })



    index = index + 1
    product_attributevalue_model=index
    data_set.append({
        "model": "attribute.attributevalue",
        "pk": product_attributevalue_model,
        "fields": {
        "sort_order": 0,
        "name": i["model"],
        "value": "",
        "slug": str(attribute_attribute_model) + "_" + str(product_attributevalue_model),
        "attribute": attribute_attribute_model
    }
    }
    )

    index = index + 1
    product_assignedproductattribute_model=index
    data_set.append(      
        {
        "model": "attribute.assignedproductattribute",
        "pk": product_assignedproductattribute_model,
        "fields": {
            "product": product_product,
            "assignment": product_attributeproduct_model,
            "values": [product_attributevalue_model]
        }    
    })

    index = index + 1
    product_attributevalue_car_url=index
    data_set.append({
        "model": "attribute.attributevalue",
        "pk": product_attributevalue_car_url,
        "fields": {
        "sort_order": 0,
        "name": i["car_url"],
        "value": "",
        "slug": str(attribute_attribute_car_url) + "_" + str(product_attributevalue_car_url),
        "attribute": attribute_attribute_car_url
    }
    }
    )

    index = index + 1
    product_assignedproductattribute_car_url=index
    data_set.append(      
        {
        "model": "attribute.assignedproductattribute",
        "pk": product_assignedproductattribute_car_url,
        "fields": {
            "product": product_product,
            "assignment": product_attributeproduct_car_url,
            "values": [product_attributevalue_car_url]
        }    
    })

    index = index + 1
    product_assignedproductattribute_condition=index
    condition = product_attributevalue_condition_new if i["condition"] == "Καινούριο" else product_attributevalue_condition_used
    print(condition)
    data_set.append(      
        {
        "model": "attribute.assignedproductattribute",
        "pk": product_assignedproductattribute_condition,
        "fields": {
            "product": product_product,
            "assignment": product_attributeproduct_condition,
            "values": [condition]
        }    
    })



#     index = index + 1
#     product_assignedvariantattribute=index
#     data_set.append(
#       {
#     "model": "attribute.assignedvariantattribute",
#     "pk": product_assignedvariantattribute,
#     "fields": {
#       "variant": product_productvariant,
#       "assignment": attribute_attributevariant,
#       "values": [
#         attribute_attributevalue
#       ]
#     }
#   })
    index = index + 1
    product_productvariantchannellisting=index
    data_set.append(
    {
     "model": "product.productvariantchannellisting",
     "pk": product_productvariantchannellisting,
     "fields": {
      "variant": product_productvariant,
      "channel": 1,
      "currency": "EUR",
      "price_amount": "15.000",
      "cost_price_amount": "5.000"
    }
    }    
    
    )
    index = index + 1
    product_collectionproduct=index
    data_set.append(
    {
    "model": "product.collectionproduct",
    "pk": product_collectionproduct,
    "fields": {
      "sort_order": None,
      "collection": product_collection,
      "product": product_product
    }
    }    
    )









saleor = open('saleor.json','x')

json.dump(data_set, saleor)

saleor.close()


# cat_moto = open("saleor.json", "x") 
# cat_list = set(s["category"] for s in data["car"])
# cat_list = list(dict.fromkeys(cat_list))