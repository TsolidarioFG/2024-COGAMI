import { GET, POST, PUT } from "../shared/Constants";
import { ApiCall, SearchParams } from "../types";

type CreateSearchDto = {
    searchOptions: SearchParams,
    properties: string[],
    userFk: string
}

export const getIdealistaLocations = () : ApiCall => {
    return { url: "locations/idealista", method: GET, body: {} }
}

export const getFotocasaLocations = () : ApiCall => {
    return { url: "locations/fotocasa", method: GET, body: {} }
}

export const createSearch = (createSearchDto: CreateSearchDto) : ApiCall => {
    return { url: 'search', body: {
        portal: createSearchDto.searchOptions.portal,
        operation: createSearchDto.searchOptions.operation,
        propertyType: createSearchDto.searchOptions.propertyType,
        priceRange: createSearchDto.searchOptions.priceRange,
        sizeRange: createSearchDto.searchOptions.sizeRange,
        bathrooms: createSearchDto.searchOptions.bathrooms,
        bedrooms: createSearchDto.searchOptions.bedrooms,
        characteristics: createSearchDto.searchOptions.searchCharacteristics,
        locationDbId: createSearchDto.searchOptions.locationDbId,
        coordinates: createSearchDto.searchOptions.coordinates === null ? { longitude: 0, latitude: 0 } : createSearchDto.searchOptions.coordinates,
        propertiesPropertyCode: createSearchDto.properties,
        userFk: createSearchDto.userFk
    }, method: POST }
}

export const addPropertyInSearch = (searchId: string, propertyCodes: string[]) : ApiCall => {
    return { url: `search/addPropertyCodes/${searchId}`, body: { propertyCodes }, method: PUT }
}

