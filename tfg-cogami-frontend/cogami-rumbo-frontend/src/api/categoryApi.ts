import { DELETE, GET, POST, PUT } from "../shared/Constants"
import { ApiCall } from "../types"

export const getUserCreatedCategories = (userId: string) : ApiCall => {
    return { url: `categories/byUser/${userId}`, body: {}, method: GET }
}

export const getById = (id: string) : ApiCall => {
    return { url: `categories/${id}`, body: {}, method: GET }
}

export const createCategory = (userId: string, name: string) :ApiCall => {
    return { url: 'categories', body: { name, userFk: userId }, method: POST }
}

export const update = (categoryId: string, userId: string, name: string) : ApiCall => {
    return { url: `categories/${categoryId}`, body: { name, userFk: userId }, method: PUT }
}

export const deleteCategory = (categoryId: string) : ApiCall => {
    return { url: `categories/${categoryId}`, body: {}, method: DELETE }
} 

export const addCategoryToSearch = (categoryId: string, searchId: string) : ApiCall => {
    return { url: 'categories/addCategoryToSearch', body: { categoryId, id: searchId }, method: PUT }
}