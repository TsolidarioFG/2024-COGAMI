import requests
import json
import xmltodict

class FotocasaLocations:
    _fotocasa_url = "https://ws.fotocasa.es/mobile/api/v2.asmx/GetLocations"
    _locations_result = []

    # Con respecto al valor de nextLevel del padre, en el caso de no tenerlo será una provincia
    _location_codes = {
        "3": "Comarca",
        "5": "Municipio",
        "7": "Distrito",
        "8": "Distrito",
    }


    def get_locations(self, location_level, location_id, parent_level = None):
        params = { "iLocationLevel": location_level, "pars": location_id }
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
        r = requests.get(url=self._fotocasa_url, headers=headers, params=params)

        if r.status_code == 200:
            raw_data = xmltodict.parse(r.content)

            for location in raw_data["LocationsCollection"]["Locations"]["ItemLocation"]:

                self._locations_result.append({
                    "Name": location["suggest"],
                    "Portal": "fotocasa",
                    "LocationId": location["locationKey"],
                    "Divisible": True if location["hasChildren"] == "true" else False,
                    "SubTypeText": "Distrito divisible" if location["hasChildren"] == "true" and location["nextLevel"] == "8" else 
                        "Comarca" if parent_level is None else self._location_codes[parent_level]
                })

                if location["hasChildren"] == 'true':
                    self.get_locations(location["nextLevel"], location["locationKey"], location["nextLevel"])

    def get_json_result(self):
        with open("fotocasa-locations.json", "w", encoding="utf-8") as file:
            json.dump(self._locations_result, file, indent=4, ensure_ascii=False)