from idealista_locations_get import IdealistaLocations
from fotocasa_locations_get import FotocasaLocations

if __name__ == "__main__":
    # idealista_locations = IdealistaLocations()
    fotocasa_locations = FotocasaLocations()
    # idealista_locations.search_locations("0-EU-ES-15")
    # idealista_locations.search_locations("0-EU-ES-27")
    # idealista_locations.search_locations("0-EU-ES-32")
    # idealista_locations.search_locations("0-EU-ES-36")
    # idealista_locations.get_json_result()

    # A Coruña, Provincia
    fotocasa_locations.get_locations("3", "724,12,15,0,0,0,0,0,0")
    # Pontevedra, Provincia
    fotocasa_locations.get_locations("3", "724,12,36,0,0,0,0,0,0")
    # Lugo, Provincia
    fotocasa_locations.get_locations("3", "724,12,27,0,0,0,0,0,0")
    # Ourense, Provincia
    fotocasa_locations.get_locations("3", "724,12,32,0,0,0,0,0,0")
    fotocasa_locations.get_json_result()