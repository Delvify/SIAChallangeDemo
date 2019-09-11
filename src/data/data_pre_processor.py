import pandas as pd
import os
import numpy as np
import sys
import tensorflow as tf
import re

file_path = 'data/raw/ProductFeed.csv'
data = pd.read_csv(file_path, header=0)

data.head()

# Header column as a list
header = list(data)
print(header)


# Check if the data is accuracately displayed
for i in range(len(data)):
    for head in header:
        if i == 50:
            if head == "id":
                print(head, " => ", data[head][i])


"""
Creating an Class for an items from the dataframe
:param:  features of the item eg: sku, title, description, price etc\n
:returns: 
"""
class MyCompany:
    def __init__(self, sku, availability, condition, description, image_link, link, title, price, sale_price, brand, color, google_product_category, 
                 product_type, gender, custom_label_0, custom_label_1, custom_label_2, custom_label_3, custom_label_4,
                 embedding, similarSkus):
        self.sku = sku
        self.availability = availability
        self.condition = condition
        self.description= description
        self.image_link = image_link
        self.link = link
        self.title = title
        self.price = price
        self.sale_price = sale_price
        self.brand = brand
        self.color = color
        self.google_product_category = google_product_category
        self.product_type = product_type
        self.gender = gender
        self.custom_label_0 = custom_label_0
        self.custom_label_1 = custom_label_1
        self.custom_label_2 = custom_label_2
        self.custom_label_3 = custom_label_3
        self.custom_label_4 = custom_label_4 
        self.embedding = embedding
        self.similarSkus = similarSkus


myCompanyLst = []
item_desList = []
# minor regularExpression
rEx = '([a-zA-Z]+)(:|\s:|：)|>|\/|(eu+|size|length)([0-9]+=|=)|;|▪|❤|★|●|【|】|-'


for count in range(len(data)):
    sku = ""; availability=""; condition=""; description=""; image_link=""; link=""; title=""; price=""; sale_price=""; brand=""; color=""; 
    google_product_category=""; product_type=""; gender=""; cust_lbl_0=""; cust_lbl_1=""; cust_lbl_2=""; cust_lbl_3=""; cust_lbl_4="";
    for head in header:
        txt_desc = ""
        if head == "id":
            sku = data[head][count]
        if head == 'availability':
            availability = data[head][count]
        if head == 'condition':
            condition = data[head][count]
        if head == 'description':
            description = str(data[head][count])
        if head == 'image_link':
            image_link = data[head][count]
        if head == 'link':
            link = data[head][count]
        if head == 'title':
            title = data[head][count]
        if head == 'price':
            price = data[head][count]
        if head == 'sale_price':
            sale_price = data[head][count]
        if head == 'brand':
            brand = data[head][count]
        if head == 'color':
            color = data[head][count]
        if head == 'google_product_category':
            google_product_category = data[head][count]
        if head == 'product_type':
            product_type = data[head][count]
        if head == 'gender':
            gender = data[head][count]
        if head == 'custom_label_0':
            cust_lbl_0 = data[head][count]
        if head == 'custom_label_1':
            cust_lbl_1 = data[head][count]
        if head == 'custom_label_2':
            cust_lbl_2 = data[head][count]
        if head == 'custom_label_3':
            cust_lbl_3 = data[head][count]
        if head == 'custom_label_4':
            cust_lbl_4 = data[head][count]
            
        txt_desc += color + " " + google_product_category + " " + brand + " " + gender + " " +  title + " " +  description    
        txt_desc = re.sub(rEx,' ',txt_desc.strip())
        myCompayObj = MyCompany(sku, availability, condition, description, image_link, link, title, price, sale_price, brand, color, google_product_category, 
                 product_type, gender, cust_lbl_0, cust_lbl_1, cust_lbl_2, cust_lbl_3, cust_lbl_4,
                 np.zeros([1, 768]), [])
    item_desList.append(txt_desc.strip())
    myCompanyLst.append(myCompayObj)


myCompanyLst[1].sku

for line in item_desList[40:50]:
    print(line, '\n')


print(len(item_desList))
print(len(myCompanyLst))

write_fname = 'data/processed/mycompanyData.json'

def write_to_file(scoresSkus, i):
    mydicyt = {}
    with open(write_fname, 'a+', True) as fp:
        mydicyt['sku'] = myCompanyLst[i].sku
        mydicyt['availability'] = myCompanyLst[i].availability
        mydicyt['condition'] = myCompanyLst[i].condition
        mydicyt['description'] = myCompanyLst[i].description
        mydicyt['image_link'] = myCompanyLst[i].image_link
        mydicyt['link'] = myCompanyLst[i].link
        mydicyt['title'] = myCompanyLst[i].title
        mydicyt['price'] = myCompanyLst[i].price
        mydicyt['sale_price'] = myCompanyLst[i].sale_price
        mydicyt['brand'] = myCompanyLst[i].brand
        mydicyt['color'] = myCompanyLst[i].color
        mydicyt['google_product_category'] = myCompanyLst[i].google_product_category
        mydicyt['product_type'] = myCompanyLst[i].product_type
        mydicyt['gender'] = myCompanyLst[i].gender
        mydicyt['custom_label_0'] = myCompanyLst[i].custom_label_0
        mydicyt['custom_label_1'] = myCompanyLst[i].custom_label_1
        mydicyt['custom_label_2'] = myCompanyLst[i].custom_label_2
        mydicyt['custom_label_3'] = myCompanyLst[i].custom_label_3
        mydicyt['custom_label_4'] = myCompanyLst[i].custom_label_4
        mydicyt['simskus'] = scoresSkus
        fp.write(str(mydicyt))
    fp.close()

