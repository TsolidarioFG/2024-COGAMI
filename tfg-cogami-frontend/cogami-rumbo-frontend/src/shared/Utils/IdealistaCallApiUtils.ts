import { IdealistaPropertyDetails, ImageContent, Location, PropertySearchResult, SearchParams, SummaryTagSection } from "../../types";
import { IDEALISTA_TOTAL_ELEMENTS_PER_PAGE } from "../Constants";

export const constructIdealistaUrlSearchParams = (searchParams : SearchParams, numPage : number) : URLSearchParams => {
    // Ver si añadir el campo accessible
    let urlSearchParams = new URLSearchParams({
        operation: searchParams.operation,
        numPage: numPage.toString(),
        maxItems: IDEALISTA_TOTAL_ELEMENTS_PER_PAGE.toString(),
        sort: "asc",
        locale: "es",
        country: "es",
        // accessible: "true",
        airConditioning: searchParams.searchCharacteristics.ac.toString(),
        elevator: searchParams.searchCharacteristics.elevator.toString(),
        garage: searchParams.searchCharacteristics.garage.toString(),
        terrace: searchParams.searchCharacteristics.terrace.toString(),
        storeRoom: searchParams.searchCharacteristics.storeRoom.toString(),
        minSize: searchParams.sizeRange[0].toString(),
        maxSize: searchParams.sizeRange[1].toString(),
        minPrice: searchParams.priceRange[0].toString(),
        maxPrice: searchParams.priceRange[1].toString(),
    })
    if (!searchParams.locationId) {
        // Llamar a la api oficial ya que la de RapidApi no deja filtrar por coordenadas
    } else {
        urlSearchParams.append("locationId", searchParams.locationId) 
        
    }

    if (searchParams.searchCharacteristics.groundFloor) {
        urlSearchParams.append("floorHeights", "groundFloor")
    }

    return urlSearchParams
}

export const constructIdealistaUrlSearchParamsDetail = (propertyCodeValue : string) : URLSearchParams => {
    return new URLSearchParams({
        country: "es",
        language: "es",
        propertyCode: propertyCodeValue
    })
}

/**
 * Realiza una serie de filtros que no se pueden aplicar a la busqueda general y devuelve las propiedades que hayan cumplido tales filtros
 * @param searchOptions Las opciones de busqueda
 * @param callResult El resultado de viviendas obtenidas tras la busqueda
 */
export const filterIdealistaApiResult = (searchOptions : SearchParams, callResult : Array<any>) => {
    let result = callResult

    if (searchOptions.propertyType !== "") {
        result = result.filter(item => item?.detailedType?.typology === (searchOptions.propertyType === "house" ? "chalet" : searchOptions.propertyType))
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item?.bathrooms === searchOptions.bathrooms)
    }

    if (searchOptions.bedrooms !== 0) {
        result = result.filter(item => item?.rooms === searchOptions.bedrooms)
    }

    if (searchOptions.searchCharacteristics.newConstruction) {
        result = result.filter(item => item?.newDevelopment === searchOptions.searchCharacteristics.newConstruction)
    }
    
    return result
}

/**
 * Devuelve la lista de propiedades de la busqueda, para todas las página una vez se haya filtrado
 * @param properties La lista de propiedades virgen tras ser devuelta por la API
 */
export const formatPropertyResult = (property : any, operation: string) => {
    let formattedProperty : PropertySearchResult
    let images : ImageContent[] = property?.multimedia?.images?.map((image: any) => { return { url: image?.url, roomType: image?.tag } })
    const tagSection = buildSummaryTagSection(property)
    formattedProperty = {
        propertyCode: property?.propertyCode,
        operation: operation,
        propertyType: property?.extendedPropertyType,
        bathrooms: property?.bathrooms === 0 ? 1 : property?.bathrooms,
        bedrooms: property?.rooms === 0 ? 1 : property?.rooms,
        description: property?.description === "" || property?.description === undefined ? "No tiene descripción" : property?.description,
        linkToPortal: property?.url ?? "https://idealista.com",
        images: images,
        price: property?.price === 0 ? "A consultar" : `${property?.price}${property?.operation === "rent" ? " €/mes" : ""}`,
        size: property?.size === 0 ? "No especifica tamaño" : `${property?.size} m²`,
        title: !property?.suggestedTexts?.title.includes('en') ? `${property?.suggestedTexts?.title} en ${property?.address}` : property?.suggestedTexts?.title,
        summaryTagSection: tagSection,
        ubication: {
            name: property?.address,
            coordinates: { latitude: property?.latitude, longitude: property?.longitude },
            locationId: property?.locationId
        }
    }

    return formattedProperty
}

const buildSummaryTagSection = (property: any) : SummaryTagSection => {
    return {
        hasElevator: { title: "Tiene ascensor", value: property?.hasLift ?? false },
        newDevelopment: { title: "Es obra nueva", value: property?.newDevelopment ?? false },
        hasVirtualTour: { title: "Tour virtual disponible", value: property?.has3DTour ?? false },
        hasAC: { title: "Aire acondicionado", value: property?.features ? property?.features?.hasAirConditioning ?? false : false },
        hasGarden: { title: "Tiene jardín", value: property?.features ? property?.features?.hasGarden ?? false : false },
        hasSwimmingPool: { title: "Tiene piscina", value: property?.features ? property?.features?.hasSwimmingPool ?? false : false },
        hasTerrace: { title: "Tiene terraza", value: property?.features ? property?.features?.hasTerrace ?? false : false },
        hasVideo: { title: "Vídeo disponible", value: property?.hasVideo ?? false },
        hasGuidedVisite: { title: "Visita guiada", value: false }
    }
}

export const formatPropertyDetails = (property: any, summaryTagSection: SummaryTagSection) : IdealistaPropertyDetails => {
    const images : ImageContent[] = property?.multimedia?.images.map((image: any) => { return { url: image?.url, roomType: image?.tag ?? "other" } })
    const characteristics = property?.translatedTexts?.characteristicsDescriptions?.find((item: any) => item?.key === "features")?.detailFeatures
    return {
        propertyCode: property?.adid,
        operation: property?.operation,
        propertyType: property?.extendedPropertyType,
        link: property?.detailWebLink,
        price: `${property?.priceInfo?.amount} ${property?.priceInfo?.currencySuffix}`,
        bathrooms: property?.moreCharacteristics?.bathNumber === 0 ? 1 : property?.moreCharacteristics?.bathNumber,
        bedrooms: property?.moreCharacteristics?.roomNumber === 0 ? 1 : property?.moreCharacteristics?.roomNumber,
        images: images,
        description: property?.propertyComment,
        title: property?.suggestedTexts?.title,
        lastModification: property?.modificationDate?.text,
        lastModificationDate: property?.modificationDate?.value,
        size: `${property?.moreCharacteristics?.constructedArea} m²`,
        floorAndSmallDescr: property?.translatedTexts?.layoutDescription ?? (property?.translatedTexts?.floorNumberDescription ?? ""),
        ubication: {
            name: property?.ubication?.locationName,
            coordinates: {
                latitude: property?.ubication?.latitude,
                longitude: property?.ubication?.longitude
            },
            locationId: property?.ubication?.locationId
        },
        characteristicsDescriptions: characteristics?.map((ch: any) => { return ch?.phrase }),
        summaryTagSection: summaryTagSection
    }
}

export const formatIdealistaPropertyIntoPropertySearchResult = (property: IdealistaPropertyDetails) : PropertySearchResult => {
    return {
        propertyCode: property.propertyCode,
        operation: property.operation,
        propertyType: property.propertyType,
        bathrooms: property.bathrooms,
        bedrooms: property.bedrooms,
        description: property.description,
        images: property.images,
        linkToPortal: property.link,
        price: property.price,
        size: property.size,
        summaryTagSection: property.summaryTagSection,
        title: property.title,
        ubication: property.ubication
    }
}