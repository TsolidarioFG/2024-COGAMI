export interface ApiCall {
    url: string,
    body: object,
    method: string
}

type ImageContent = {
    url: string,
    roomType: string
}

export interface PropertySearchResult {
    propertyCode: string,
    operation: string,
    propertyType: string
    images: ImageContent[],
    title: string,
    price: string,
    bedrooms: number,
    bathrooms: number,
    size: string,
    linkToPortal: string,
    description: string,
    summaryTagSection: SummaryTagSection,
    ubication: {
        name: string,
        coordinates: Coordinates,
        locationId: string
    }
}

export interface IdealistaPropertyDetails {
    propertyCode: string,
    propertyType: string,
    operation: string,
    link: string,
    images: ImageContent[],
    title: string,
    price: string,
    bedrooms: number,
    bathrooms: number,
    size: string,
    floorAndSmallDescr: string,
    ubication: {
        coordinates: Coordinates,
        name: string,
        locationId: string
    },
    description: string,
    lastModification: string,
    lastModificationDate: number,
    characteristicsDescriptions: string[],
    summaryTagSection: SummaryTagSection 
}


export interface SearchParams {
    portal: string,
    operation: string,
    propertyType: string,
    priceRange: number[],
    sizeRange: number[],
    bathrooms: number,
    bedrooms: number,
    searchCharacteristics: SearchCharacteristics,
    locationDbId: string | null | undefined,
    locationId: string | null | undefined,
    coordinates: Coordinates | null | undefined
}

export interface Location {
    id: string,
    name: string,
    portal: string,
    locationId: string
    divisible: boolean,
    subTypeText: string
    // children: Location[] | null
}

interface SearchCharacteristics {
    ac: boolean,
    elevator: boolean,
    garage: boolean,
    newConstruction: boolean,
    terrace: boolean,
    storeRoom: boolean,
    groundFloor: boolean
}

interface Coordinates {
    longitude: number,
    latitude: number
}

type TagValue = {
    title: string,
    value: boolean
}

export interface SummaryTagSection {
    hasElevator: TagValue,
    hasVideo: TagValue,
    hasGuidedVisite: TagValue,
    hasSwimmingPool: TagValue,
    hasTerrace: TagValue,
    hasVirtualTour: TagValue,
    hasAC: TagValue,
    hasGarden: TagValue,
    newDevelopment: TagValue
}

export interface FavoriteProperty {
    id: string,
    portal: string,
    propertyCode: string,
    portalLink: string,
    rawData: string,
    comment: string,
    categoryId: string,
    notifications: number,
    notificationMessage: string | null
}

export interface NotInterestedProperty {
    portal: string,
    propertyCode: string
}

export type UserSearch = {
    id: string,
    creationDate: string,
    searchOptions: SearchParams,
    isFlagged: boolean,
    locationName: string,
    properties: string[],
    categoryId: string | null
}

export type Category = {
    id: string,
    name: string,
    creationDate: string,
    userFk: string
}