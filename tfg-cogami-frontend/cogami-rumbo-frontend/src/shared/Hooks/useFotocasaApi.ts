import { useCallback, useContext } from "react"
import { X_RAPIDAPI_HOST_FOTOCASA, X_RAPIDAPI_KEY_IDEALISTA_POOL_0, X_RAPIDAPI_KEY_IDEALISTA_POOL_1, X_RAPIDAPI_KEY_IDEALISTA_POOL_2, X_RAPIDAPI_KEY_IDEALISTA_POOL_3, X_RAPIDAPI_KEY_IDEALISTA_POOL_4, X_RAPIDAPI_KEY_IDEALISTA_POOL_5, X_RAPIDAPI_KEY_IDEALISTA_POOL_6, X_RAPIDAPI_KEY_IDEALISTA_POOL_7 } from "../Constants"
import { SpinnerContext } from "../components/SpinnerHandlerContext"

export const useFotocasaApi = () => {

    const rapidApiKeys = [X_RAPIDAPI_KEY_IDEALISTA_POOL_0, X_RAPIDAPI_KEY_IDEALISTA_POOL_1, X_RAPIDAPI_KEY_IDEALISTA_POOL_2, X_RAPIDAPI_KEY_IDEALISTA_POOL_3,
         X_RAPIDAPI_KEY_IDEALISTA_POOL_4, X_RAPIDAPI_KEY_IDEALISTA_POOL_5, X_RAPIDAPI_KEY_IDEALISTA_POOL_6, X_RAPIDAPI_KEY_IDEALISTA_POOL_7]
    const {increaseLoader, decreaseLoader} = useContext(SpinnerContext)

    const callFotocasaApi = useCallback(async function callFotocasaApi(url : string, searchParams : URLSearchParams) {
        let data = null
        const key = rapidApiKeys[Math.floor(Math.random() * rapidApiKeys.length)]
        // console.log(`Using ${key} for API CALL`)
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': key,
		        'x-rapidapi-host': X_RAPIDAPI_HOST_FOTOCASA
            }
        }
        
        const response = fetch(url + searchParams, options)
        increaseLoader()

        data = await response.then(async (apiResponse) => {
            if (apiResponse.status === 500) {
                return Promise.reject({message: "Se ha producido un error en el servidor de Fotocasa", status: apiResponse.status})
            } else if (apiResponse.status === 400 || apiResponse.status === 404) {
                return Promise.reject({message: apiResponse.status === 400 ? "No se han especificado todos los parametros necesarios" : "No existe la ruta de petición", status: apiResponse.status})
            }
            if (!apiResponse.status.toString().startsWith("2")) {
                return Promise.reject({message: apiResponse.text().then((text) => { return text }), status: apiResponse.status})
            }

            if (apiResponse.headers.get('Content-Type')?.includes('application/json')) {
                return await apiResponse.json()
            }

            if (apiResponse.headers.get('Content-Type')?.includes('text/plain')) {
                return await apiResponse.json()
            }

        }).catch((err : any) => {
            return Promise.reject({message: "Se ha producido un error interno para realizar la consulta a Fotocasa", errorMessage: err.status})
        }).finally(() => {
            decreaseLoader()
        })

        return data
    }, [])

    return callFotocasaApi

}