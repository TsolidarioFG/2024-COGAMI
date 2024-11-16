from pymongo import MongoClient
import json

with open('config.json', 'r') as file:
    config = json.load(file)

MONGO_URI = config["cogami-database-connection-string"]
DB_NAME = "cogami"
COLLECTIONS = ["User", "Location", "Property", "Category", "Search"]
TARGET_COLLECTION = "Location"
JSON_FILES = ["idealista-locations.json", "fotocasa-locations.json"]

client = MongoClient(MONGO_URI)

def create_database_and_collections(client):
    db = client[DB_NAME]
    for collection_name in COLLECTIONS:
        db.create_collection(collection_name)
    print(f"Base de datos '{DB_NAME}' y colecciones creadas con éxito")

def insert_data_from_json(db, collection_name, file_path):
    collection = db[collection_name]
    with open(file_path, 'r', encoding="utf-8") as file:
        data = json.load(file)
        if isinstance(data, list):
            collection.insert_many(data)
        else:
            collection.insert_one(data)
    print(f"Datos de '{file_path}' insertados en la colección '{collection_name}'")

def main():
    client = MongoClient(MONGO_URI)
    print("Conexión a MongoDB establecida con éxito")

    create_database_and_collections(client)

    db = client[DB_NAME]

    for json_file in JSON_FILES:
        insert_data_from_json(db, TARGET_COLLECTION, json_file)

    print("Proceso completado con éxito")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'client' in locals():
            client.close()
            print("Conexión a MongoDB cerrada")
        