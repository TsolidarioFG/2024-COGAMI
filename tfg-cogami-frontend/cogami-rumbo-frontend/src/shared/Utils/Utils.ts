import { PropertySearchResult, SearchParams, UserSearch } from "../../types";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const translateImagesTags = (tag: string) => {
    const translation = {
        kitchen: "Cocina",
        views: "Vistas",
        terrace: "Terraza",
        other: "Otro",
        bedroom: "Dormitorio",
        balcony: "Balcón",
        bathroom: "Baño",
        garage: "Garaje",
        exterior: "Exterior",
        "swimming pool": "Piscina",
        "living room": "Sala de estar",
        livingRoom: "Salón",
    }
    let key = tag as keyof typeof translation
    return translation[key] ?? "Imagen de la vivienda"
}

export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export const filterFavoriteProperties = (properties: PropertySearchResult[], searchOptions: SearchParams) => {
    let result = properties

    if (searchOptions.operation) {
        result = result.filter(item => item.operation === searchOptions.operation)
    }

    if (searchOptions.portal === "idealista") {
        if (searchOptions.propertyType !== "") {
            result = result.filter(item => searchOptions.propertyType === (item.propertyType !== "flat" ? "house" : searchOptions.propertyType))
        }
    }

    if (searchOptions.searchCharacteristics.ac) {
        result = result.filter(item => item.summaryTagSection.hasAC.value === searchOptions.searchCharacteristics.ac)
    }
    if (searchOptions.searchCharacteristics.elevator) {
        result = result.filter(item => item.summaryTagSection.hasElevator.value === searchOptions.searchCharacteristics.elevator)
    }
    if (searchOptions.searchCharacteristics.newConstruction) {
        result = result.filter(item => item.summaryTagSection.newDevelopment.value === searchOptions.searchCharacteristics.newConstruction)
    }
    if (searchOptions.searchCharacteristics.terrace) {
        result = result.filter(item => item.summaryTagSection.hasTerrace.value === searchOptions.searchCharacteristics.terrace)
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item.bathrooms === searchOptions.bathrooms)
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item.bedrooms === searchOptions.bedrooms)
    }

    if (searchOptions.sizeRange[0] !== 0) {
        result = result.filter(item => parseFloat(item.size) > searchOptions.priceRange[0])
    }

    if (searchOptions.sizeRange[1] !== 0) {
        result = result.filter(item => parseFloat(item.size) < searchOptions.priceRange[1])
    }

    if (searchOptions.priceRange[0] !== 0) {
        result = result.filter(item => parseFloat(item.price) > searchOptions.priceRange[0])
    }

    if (searchOptions.priceRange[1] !== 0) {
        result = result.filter(item => parseFloat(item.price) < searchOptions.priceRange[1])
    }

    if (searchOptions.locationId && searchOptions.locationId !== "") {
        result = result.filter(item => item.ubication.locationId === searchOptions.locationId)
    } else if (!searchOptions.locationId || searchOptions.locationId === "") {
        result = result.filter(item => item.ubication.locationId)
    }

    return result
}

export const formatUserSearch = (search: any) : UserSearch => {
    let searchOptions : SearchParams = {
        portal: search?.portal,
        bathrooms: search?.bathrooms,
        bedrooms: search?.bedrooms,
        coordinates: null,
        locationDbId: search?.location?.id,
        locationId: search?.location?.locationId,
        operation: search?.operation,
        priceRange: search?.priceRange,
        sizeRange: search?.sizeRange,
        propertyType: search?.propertyType,
        searchCharacteristics: search?.characteristics
    }

    return { id: search?.id, creationDate: search?.creationDate, isFlagged: search?.flagged, searchOptions, locationName: `${search?.location?.name} / ${search?.location?.subTypeText}`, properties: search?.propertiesPropertyCode, categoryId: search?.fkCategoryId }
}

/**
 * Devuelve la fecha en el formato dd/mm/yyyy
 * @param date La fecha a convertir
 */
export const formatDate = (date: string) : string => {
    const _date = new Date(date)
    const day = String(_date.getDate()).padStart(2, '0')
    const month = String(_date.getMonth() + 1).padStart(2, '0')
    const year = String(_date.getFullYear())

    return `${day}/${month}/${year}`
}

export const filterUserSearch = (searchList: UserSearch[], searchOptions: SearchParams) : UserSearch[] => {
    let result = searchList

    result = result.filter(item => item.searchOptions.operation === searchOptions.operation)

    if (searchOptions.propertyType !== "") {
        result = result.filter(item => item.searchOptions.propertyType === searchOptions.propertyType)
    }

    if (searchOptions.locationId && searchOptions.locationId != "") {
        result = result.filter(item => item.searchOptions.locationId === searchOptions.locationId)
    } else if (!searchOptions.locationId || searchOptions.locationId === "") {
        result = result.filter(item => item.searchOptions.locationId)
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item.searchOptions.bathrooms === searchOptions.bathrooms)
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item.searchOptions.bedrooms === searchOptions.bedrooms)
    }

    if (searchOptions.sizeRange[0] !== 0) {
        result = result.filter(item => item.searchOptions.sizeRange[0] > searchOptions.priceRange[0])
    }

    if (searchOptions.sizeRange[1] !== 0) {
        result = result.filter(item => item.searchOptions.sizeRange[1] < searchOptions.priceRange[1])
    }

    if (searchOptions.priceRange[0] !== 0) {
        result = result.filter(item => item.searchOptions.priceRange[0] > searchOptions.priceRange[0])
    }

    if (searchOptions.priceRange[1] !== 0) {
        result = result.filter(item => item.searchOptions.priceRange[1] < searchOptions.priceRange[1])
    }

    if (searchOptions.searchCharacteristics.ac) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.ac)
    }

    if (searchOptions.searchCharacteristics.elevator) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.elevator)
    }

    if (searchOptions.searchCharacteristics.garage) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.garage)
    }

    if (searchOptions.searchCharacteristics.newConstruction) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.newConstruction)
    }

    if (searchOptions.searchCharacteristics.terrace) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.terrace)
    }

    if (searchOptions.searchCharacteristics.storeRoom) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.storeRoom)
    }

    if (searchOptions.searchCharacteristics.groundFloor) {
        result = result.filter(item => item.searchOptions.searchCharacteristics.groundFloor)
    }

    return result
}