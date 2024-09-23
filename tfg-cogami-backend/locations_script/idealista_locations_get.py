import requests
import json

class IdealistaLocations:
    _location_url = "https://secure.idealista.com/api/3/es/locations?country=es&language=es&locationId="
    _token_url = "https://api.idealista.com/oauth/token?grant_type=client_credentials&scope=read"
    _bearer_token = None
    _location_result = []

    def __init__(self):
        headers = {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Authorization": "Basic NTdza3JidzRxZGszcWkzYmVtZ203dWV4M2VkZzloMWg6Uk1CeEVDN3lNdVFE"
        }

        r = requests.post(self._token_url, headers=headers)
        if r.status_code == 200:
            datos = r.json()
            self._bearer_token = datos["access_token"]
        else:
            raise Exception("No se ha encontrado el token válido para realizar peticiones")

    def search_locations(self, base_location_id):
        headers = {
            "Authorization": "Bearer " + self._bearer_token
        }

        response = requests.get(self._location_url + base_location_id, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data["total"] != 0:
                locations = data["locations"]
                for location in locations:
                    self._location_result.append({
                        "Name": location["name"],
                        "Portal": "idealista",
                        "LocationId": location["locationId"],
                        "Divisible": location["divisible"],
                        "SubTypeText": location["subTypeText"]
                    })   
                    if location["divisible"]:
                        self.search_locations(location["locationId"])
    
    def get_json_result(self):
        with open("idealista-locations.json", "w", encoding="utf-8") as file:
            json.dump(self._location_result, file, indent=4, ensure_ascii=False)

        