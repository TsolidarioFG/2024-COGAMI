import json
from pymongo.mongo_client import MongoClient
from bson.objectid import ObjectId
import random
import requests

with open('config.json', 'r') as file:
    config = json.load(file)

cogami_database_connection_url = config["cogami_database_connection_url"]
rapid_api_keys = config["RAPID_API"]["keys"]

client = MongoClient(cogami_database_connection_url)

cogami_database = client["cogami"]
user_col = cogami_database["User"]
property_col = cogami_database["Property"]

cached_api_properties = {}

def get_random_rapid_api_key():
    values = list(rapid_api_keys.values())
    return random.choice(values)

def get_users():
    users = []
    for user in user_col.find():
        users.append(user)

    return users
"""
Elimina del usuario las viviendas que tenga en FollowedProperties que tengan Notifications a -1
"""
def remove_followed_property(user_id: str):
    query = {
        '_id': ObjectId(user_id)
    }
    update = {
        '$pull': {'FollowedProperties': {'Notifications': -1}}
    }

    result = user_col.update_one(query, update)

    if result.modified_count > 0:
        print(f"Eliminadas viviendas favoritas marcadas a eliminar en usuario = {user_id} ")
    else:
        print(f"No hay viviendas favoritas a eliminar para el usuario = {user_id}")

def _check_characteristics_description(api_value, database_value):
    for api_chr, database_chr in zip(api_value, database_value):
        if api_chr["phrase"].strip() != database_chr.strip():
            return True 
    return False
        
def _check_images_diff(api_images, database_images):
    for api_image, database_image in zip(api_images, database_images):
        if api_image["url"] != database_image["url"]:
            return True 
    return False


def check_idealista_api(property_code: str, database_data, property_id: str, user_id):
    url = config["RAPID_API"]["RAPIDAPI_IDEALISTA_GETDETAIL"]
    query_string = {"country": "es", "language": "es", "propertyCode": property_code}

    headers = {
        "x-rapidapi-key": get_random_rapid_api_key(),
	    "x-rapidapi-host": config["RAPID_API"]["RAPIDAPI_HOST_IDEALISTA"]
    }

    def _process_idealista_property_data(data, is_cached: bool):

        if is_cached:
            price = data["price"]
            characteristics_description = data["characteristics_description"]
            description = data["description"]
            images_list = data["images"]
            last_updated_date = data["last_updated_date"]
            last_updated_text = data["last_updated_text"]
        else:
            amount = int(data.get("priceInfo", {}).get("amount", 0))
            operation = database_data.get("operation", "").lower()

            price = f"{amount} €/mes" if operation == "rent" else f"{amount} €"

            for chr in data["translatedTexts"]["characteristicsDescriptions"]:
                if chr["key"] == "features":
                    characteristics_description = chr["detailFeatures"]

            description = data["propertyComment"]
            images_list = [] 
            for image in data["multimedia"]["images"]:
                images_list.append({
                    "url": image["url"],
                    "roomType": image["tag"]
                })   
            last_updated_date = data["modificationDate"]["value"]
            last_updated_text = data["modificationDate"]["text"]
            

        database_price = database_data["price"]

        chr_description_diff = _check_characteristics_description(characteristics_description, database_data["characteristicsDescriptions"]) if len(characteristics_description) == len(database_data["characteristicsDescriptions"]) else len(characteristics_description) != len(database_data["characteristicsDescriptions"])

        image_diff = _check_images_diff(images_list, database_data["images"]) if len(images_list) == len(database_data["images"]) else len(images_list) != len(database_data["images"])

        if database_price != price or chr_description_diff or description.strip() != database_data["description"].strip() or database_data["lastModificationDate"] != last_updated_date or image_diff:

            message = ""

            if database_price != price:
                message += f"El precio de la vivienda ha aumentado ({database_price} => {price})\n" if price > database_price else f"El precio de la vivienda ha disminuido ({database_price} => {price})\n"
            if chr_description_diff:
                message += "La lista de características de Idealista ha cambiado\n"
            if description.strip() != database_data["description"].strip():
                message += "La descripción de la vivienda ha sido alterada\n"
            if database_data["lastModificationDate"] != last_updated_date:
                message += "La fecha de última actualización proporcionado por el portal ha cambiado\n"
            if image_diff: 
                message += "Se ha modificado la lista de imágenes\n"


            query = { "_id": user_id }
            update = { "$set": { "FollowedProperties.$[elem].Notifications": 1, "FollowedProperties.$[elem].NotificationMessage": message } }
            array_filters = [{"elem._id": str(property_id)}]

            user_col.update_one(query, update, upsert=False, array_filters=array_filters)
            
            database_data["price"] = price
            database_data["description"] = description
            _temp_chrs = []
            for chr in characteristics_description:
                _temp_chrs.append(chr["phrase"])
            database_data["characteristicsDescriptions"] = _temp_chrs
            database_data["images"] = images_list
            database_data["lastModificationDate"] = last_updated_date
        
        database_data["lastModification"] = last_updated_text

        property_col.update_one(
            { "_id": property_id },
            { "$set": { "RawData": json.dumps(database_data) } }
        )
        
        if (property_code, "idealista") not in cached_api_properties:
            cached_api_properties[(property_code, "idealista")] = {
                "price": price,
                "characteristics_description": _temp_chrs,
                "images": database_data["images"] if len(images_list) == 0 else images_list,
                "description": description,
                "last_updated_date": last_updated_date,
                "last_updated_text": last_updated_text
            }

    if (property_code, "idealista") in cached_api_properties:
        data = cached_api_properties[(property_code, "idealista")]
        _process_idealista_property_data(data, True)
    else:
        response = requests.get(url, headers=headers, params=query_string)

        if response.status_code == 200:
            data = response.json()
            if "httpStatus" in data:
                query = { "_id": user_id }
                update = { "$set": { "FollowedProperties.$[elem].Notifications": -1 } }
                array_filters = [{"elem._id": str(property_id)}]

                user_col.update_one(query, update, upsert=False, array_filters=array_filters)
                return
            _process_idealista_property_data(data, False)

def check_fotocasa_api(property_code: str, database_data, property_id: str, user_id):
    url = config["RAPID_API"]["RAPIDAPI_FOTOCASA_GETDETAIL"]
    query_string = {"id": property_code, "operation": database_data["operation"] ,"culture": "es-ES"}

    headers = {
        "x-rapidapi-key": get_random_rapid_api_key(),
	    "x-rapidapi-host": config["RAPID_API"]["RAPIDAPI_HOST_FOTOCASA"]
    }

    def _process_fotocasa_property_data(data, is_cached: bool):
        if is_cached:
            price = data["price"]
            description = data["description"]
            images_list = data["images"]
        else:
            transactions = data.get("transactions", [])
            if transactions and isinstance(transactions[0], dict):
                value = transactions[0].get("value", [])
                price = value[0] if value else "N/A"
            else:
                price = "N/A"

            operation = database_data.get("operation", "").lower()

            if price != "N/A":
                if operation == "rent":
                    price = f"{price} €/mes"
                else:
                    price = f"{price} €"
            
            description = data["descriptions"]["es-ES"]
            images_list = []
            for image in data["multimedias"]:
                images_list.append({
                    "url": image["url"],
                    "roomType": "other" if image["roomType"] is None else image["roomType"]
                })
            
        database_price = database_data["price"]

        image_diff = _check_images_diff(images_list, database_data["images"]) if len(images_list) == len(database_data["images"]) else len(images_list) != len(database_data["images"])

        if database_price != price or description.strip() != database_data["description"].strip() or image_diff:
            message = ""

            if database_price != price:
                message += f"El precio de la vivienda ha aumentado ({database_price} => {price})\n" if price > database_price else f"El precio de la vivienda ha disminuido ({database_price} => {price})\n"

            if description.strip() != database_data["description"].strip():
                message += "Se ha modificado la descripción\n"

            if image_diff:
                message += "Ha habido cambios en las imágenes\n"


            database_data["price"] = price
            database_data["description"] = description
            database_data["images"] = images_list

            
            query = { "_id": user_id }
            update = { "$set": { "FollowedProperties.$[elem].Notifications": 1, "FollowedProperties.$[elem].NotificationMessage": message } }
            array_filters = [{"elem._id": str(property_id)}]

            user_col.update_one(query, update, upsert=False, array_filters=array_filters)

            property_col.update_one(
                { "_id": property_id },
                { "$set": { "RawData": json.dumps(database_data) } }
            )
        
        if (property_code, "fotocasa") not in cached_api_properties:
            cached_api_properties[(property_code, "idealista")] = {
                "price": price,
                "images": database_data["images"] if len(images_list) == 0 else images_list,
                "description": description
            }

    if (property_code, "fotocasa") in cached_api_properties:
        data = cached_api_properties[(property_code, "fotocasa")]
        _process_fotocasa_property_data(data, True)
    else:
        response = requests.get(url, headers=headers, params=query_string)

        if response.status_code == 200:
            data = response.json()
            if "id" not in data:
                query = { "_id": user_id }
                update = { "$set": { "FollowedProperties.$[elem].Notifications": 1 } }
                array_filters = [{"elem._id": str(property_id)}]

                user_col.update_one(query, update, upsert=False, array_filters=array_filters)
                return
            _process_fotocasa_property_data(data, False)

"""
Elimina de Property aquellas viviendas que no aparezcan en ninguna lista de FollowedProperties de ningun usuario
"""
def _remove_unused_properties():
    followed_properties = []
    for user in user_col.find({}, {'FollowedProperties._id': 1}):
        for property in user.get('FollowedProperties', []):
            followed_properties.append(ObjectId(property["_id"]))
    query = {"_id": {"$nin": list(followed_properties)}}

    result = property_col.delete_many(query)
    if result.deleted_count > 0:
        print(f"Eliminadas {result.deleted_count} viviendas no seguidas por usuarios")


def process_api_property_data(property_code: str, portal: str, property_id: str, user_id, database_data):
    check_idealista_api(property_code, database_data, property_id, user_id) if portal == "idealista" else check_fotocasa_api(property_code, database_data, property_id, user_id)

def main_process(property_id: str, user_id):
    query = {
        '_id': ObjectId(property_id)
    }

    property = property_col.find_one(query)

    if not property:
        raise Exception(f"Propiedad no encontrada para _id: {property_id} del usuario: {user_id}")

    database_data = json.loads(property["RawData"])
    process_api_property_data(property["PropertyCode"], property["Portal"], property["_id"], user_id, database_data)
    
    

if __name__ == "__main__":
    try:
        users = get_users()
        _remove_unused_properties()
        for user in users:
            # remove_followed_property(user["_id"])
            for followed_property in user.get("FollowedProperties", []):
                main_process(followed_property["_id"], user["_id"])

    except Exception as e:
        print(e)
    finally:
        client.close()