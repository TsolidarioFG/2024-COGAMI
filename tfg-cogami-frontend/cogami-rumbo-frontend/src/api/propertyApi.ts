import { GET, POST, PUT } from "../shared/Constants"
import { ApiCall, FavoriteProperty } from "../types"

type CreatePropertyDto = {
    portal: string,
    propertyCode: string,
    portalLink: string,
    rawData: string
}

export const getPropertyByPortalAndPropertyCode = (portal: string, propertyCode: string) : ApiCall => {
    return { url: `search/property/${portal}/${propertyCode}`, body: {}, method: GET }
}

export const createProperty = (property: CreatePropertyDto) : ApiCall => {
    return { url: 'search/property', body: property, method: POST }
}
export const favoriteProperty = (userId: string, propertyId: string, categoryId: string) : ApiCall => {
    return { url: `search/property/favorite/${userId}/${propertyId}/${categoryId}`, body: {}, method: PUT }
}

export const removeFavoriteProperty = (userId: string, propertyId: string, comment: string, categoryId: string, notifications: number, notificationMessage: string | null) : ApiCall => {
    return { url: `search/property/unfavorite/${userId}`, body: {id: propertyId, comment, categoryId, notifications, notificationMessage}, method: PUT }
}

export const markAsNotInterested = (userId: string, portal: string, propertyCode: string) : ApiCall => {
    return { url: `search/property/markNotInterested/${userId}`, body: { portal, propertyCode }, method: PUT }
}

export const unmarkAsNotInterested = (userId: string, portal: string, propertyCode: string) : ApiCall => {
    return { url: `search/property/unmarkNotInterested/${userId}`, body: { portal, propertyCode }, method: PUT }
}

export const getNotInterestedProperties = (userId: string) : ApiCall => {
    return { url: `search/property/notInterested/${userId}`, body: {}, method: GET }
}

export const getUserFavoriteProperties = (userId: string) : ApiCall => {
    return { url: `search/property/favorite/${userId}`, body: {}, method: GET }
}

export const getPropertyByPropertyCodeAndPortal = (propertyCode: string, portal: string) : ApiCall => {
    return { url: `search/property/${portal}/${propertyCode}`, body: {}, method: GET }
}

export const commentFavoriteProperty = (userId: string, propertyId: string, comment: string, categoryId: string, notifications: number, notificationMessage: string | null) : ApiCall => {
    return { url: `search/property/favorite/comment/${userId}`, body: { id: propertyId, comment, categoryId, notifications, notificationMessage }, method: PUT }
}

export const updateNotificationsProperty = (userId: string, propertyId: string, comment: string, categoryId: string, notifications: number, notificationMessage: string | null) : ApiCall => {
    return { url: `search/property/favorite/notifications/${userId}`, body: { id: propertyId, comment, categoryId, notifications, notificationMessage }, method: PUT }
}

export const getPropertyById = (propertyId: string) :ApiCall => {
    return { url: `search/property/${propertyId}`, body: {}, method: GET }
}

export const updateFavoritePropertyCategory = (userId: string, propertyId: string, comment: string, categoryId: string, notifications: number, notificationMessage: string | null) : ApiCall => {
    return { url: `search/property/favorite/updateCategory/${userId}`, body: { id: propertyId, comment, categoryId, notifications, notificationMessage }, method: PUT,  }
}