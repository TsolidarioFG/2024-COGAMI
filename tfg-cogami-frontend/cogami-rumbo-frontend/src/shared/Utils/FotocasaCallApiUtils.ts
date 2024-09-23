import { ImageContent, PropertySearchResult, SearchParams, SummaryTagSection } from "../../types";


export const constructFotocasaUrlSearchParams = (searchParams: SearchParams, numPage: number) : URLSearchParams => {
    let urlParams = new URLSearchParams({
        operation: searchParams.operation,
        culture: "es-ES",
        locationId: searchParams.locationId ?? "",
        pageNumber: numPage.toString(),
        latitude: searchParams.coordinates?.latitude.toString() ?? "40.4096",
        longitude: searchParams.coordinates?.longitude.toString() ?? "-3.68624",
        sorting: "scoring",
        propertyType: "Homes",
        
    })

    if (searchParams.searchCharacteristics.newConstruction) {
        urlParams.append("isNewConstruction", "true")
    }

    if (searchParams.searchCharacteristics.groundFloor) {
        urlParams.append("groundFloor", "true")
    }

    if (searchParams.propertyType === "flat") {
        urlParams.append("allFlats", "true")
    }

    if (searchParams.propertyType === "house") {
        urlParams.append("allHouses", "true")
    }

    if (searchParams.propertyType === "studio") {
        urlParams.append("studioType", "true")
    }

    return urlParams
}

export const filterFotocasaSearchResult = (searchOptions: SearchParams, apiResult: Array<any>) => {
    let result = apiResult

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "bathrooms")?.value[0] === searchOptions.bathrooms)
    }

    if (searchOptions.bathrooms !== 0) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "rooms")?.value[0] === searchOptions.bedrooms)
    }

    if (searchOptions.searchCharacteristics.elevator) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "elevator")?.value[0] === 1)
    }

    if (searchOptions.searchCharacteristics.terrace) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "terrace")?.value[0] === 1)
    }

    if (searchOptions.searchCharacteristics.ac) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "air_conditioner")?.value[0] === 1)
    }

    if (searchOptions.sizeRange[0] !== 0) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "surface")?.value[0] > searchOptions.priceRange[0])
    }

    if (searchOptions.sizeRange[1] !== 0) {
        result = result.filter(item => item?.features?.find((feature : any) => feature?.key === "surface")?.value[0] < searchOptions.priceRange[1])
    }

    if (searchOptions.priceRange[0] !== 0) {
        result = result.filter(item => item?.transactions[0]?.value[0] > searchOptions.priceRange[0])
    }

    if (searchOptions.priceRange[1] !== 0) {
        result = result.filter(item => item?.transactions[0]?.value[0] < searchOptions.priceRange[1])
    }

    return result
}

export const formatFotocasaSearchResult = (property : any, operation: string, locationId: string) : PropertySearchResult => {
    const images : ImageContent[] = property?.multimedias.map((image: any) => { return { url: image?.url, roomType: image?.roomType ?? "other" } })
    const priceInfo = {
        price: property?.transactions[0]?.value[0],
        priceType: property?.transactions[0]?.periodicityId === 0 ? " €" : " €/mes"
    }
    const size = property?.features?.find((feature: any) => feature?.key === "surface")?.value[0]
    const tagSection = buildSummaryTagSection(property)
    return {
        propertyCode: property?.id,
        operation: operation,
        propertyType: "",
        bathrooms: property?.features?.find((feature: any) => feature?.key === "bathrooms")?.value[0] ?? "A consultar",
        bedrooms: property?.features?.find((feature: any) => feature?.key === "rooms")?.value[0] ?? "A consultar",
        description: property?.description === "" ? "No tiene descripción" : property?.description,
        images: images,
        linkToPortal: `https://www.fotocasa.es${property?.detail?.es}`,
        price: priceInfo.price === 0 ? "A consultar" : `${priceInfo.price}${priceInfo.priceType}`,
        size: size ? `${size} m²` : "No especifica tamaño",
        title: `Vivienda en ${property?.address?.ubication}`,
        summaryTagSection: tagSection,
        ubication: {
            name: property?.address?.ubication,
            coordinates: { latitude: property?.address?.coordinates?.latitude, longitude: property?.address?.coordinates?.longitude },
            locationId
        }
    }
}

const buildSummaryTagSection = (property: any) : SummaryTagSection => {
    const hasAc = property?.features.find((feature: any) => feature?.key === "air_conditioner")?.value[0] === 1
    const hasElevator = property?.features.find((feature : any) => feature?.key === "elevator")?.value[0] === 1
    const hasGarden = property?.features.find((feature : any) => feature?.key === "garden")?.value[0] === 1
    const hasTerrace = property?.features.find((feature : any) => feature?.key === "terrace")?.value[0] === 1
    const hasSwimmingPool = property?.features.find((feature : any) => feature?.key === "swimming_pool")?.value[0] === 1

    return {
        hasGuidedVisite: { title: "Visita guiada", value: property?.hasVgo ?? false },
        hasAC: { title: "Aire acondicionado", value: hasAc },
        hasElevator: { title: "Tiene ascensor", value: hasElevator },
        hasGarden: { title: "Tiene jardín", value: hasGarden },
        hasTerrace: { title: "Tiene terraza", value: hasTerrace },
        hasSwimmingPool: { title: "Tiene piscina", value: hasSwimmingPool },
        hasVideo: { title: "Vídeo disponible", value: false },
        hasVirtualTour: { title: "Tour virtual disponible", value: property?.isVirtualTour ?? false },
        newDevelopment: { title: "Es obra nueva", value: (property?.isNew ?? false) || (property?.isTop ?? false) }
    }
}