import { DELETE, GET, PUT } from "../shared/Constants";
import { ApiCall } from "../types";

export const getSearchsByUser = (userId: string) : ApiCall => {
    return { url: `search/userSearch/${userId}`, body: {}, method: GET }
}

export const flagSearch = (searchId: string, flagValue: boolean) : ApiCall => {
    return { url: `search/flag/${searchId}/${flagValue}`, body: {}, method: PUT }
}

export const deleteSearch = (searchId: string) : ApiCall => {
    return { url: `search/${searchId}`, body: {}, method: DELETE }
}