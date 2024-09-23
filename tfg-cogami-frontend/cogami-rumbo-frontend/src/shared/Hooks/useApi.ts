import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ApiCall } from "../../types";
import { COGAMI_API_URL, DELETE, GET, POST, PUT } from "../Constants";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackBar } from "../components/SnackBarContext";
import { SpinnerContext } from "../components/SpinnerHandlerContext";
import { useCookies } from "react-cookie";


export const useApi = () => {
    const navigate = useNavigate()
    const [cookies] = useCookies(['authentication'])
    const {pathname} = useLocation()
    const callData = useRef({url: "", method: 'GET', body: {}})
    const snackBar = useSnackBar()
    const {increaseLoader, decreaseLoader} = useContext(SpinnerContext)

    const errorHandler = useCallback(function handleError(message: any, status: any) {
        switch (status) {
            case 401:
                snackBar.showSnackBar("No dispone permisos suficientes", 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                break
            case 403:
                snackBar.showSnackBar("No dispone permisos suficientes", 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                break
            case 404:
                snackBar.showSnackBar(message ?? "No se ha encontrado la página", 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                break
            case 504:
                snackBar.showSnackBar("Tiempo de respuesta del servidor superado, no se ha dado respuesta", 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                break
            default:
                if (!message) {
                    snackBar.showSnackBar("Error inesperado", 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                } else {
                    snackBar.showSnackBar(message, 'error', { vertical: 'top', horizontal: 'center' }, 3000)
                }
        }
        return {message, status}
    }, [navigate, pathname])

    const callApi = useCallback(async function callApi({ url, method, body } : ApiCall) {
        let call = null
        callData.current = { url, method, body }
        increaseLoader()
        const apiUrl = `${COGAMI_API_URL}${url}`
        switch(method) {
            case POST:
                call = post(apiUrl, body, cookies.authentication ?? "")
                break
            case GET:
                call = get(apiUrl, cookies.authentication ?? "")
                break
            case DELETE:
                call = remove(apiUrl, cookies.authentication ?? "")
                break
            case PUT:
                call = put(apiUrl, body, cookies.authentication ?? "")
                break
            default:
                return
        }

        let data = null
        let resultError = null

        data = await call.then(async (response : Response) => {
            if (response.status === 500) {
                let message = (await response.json())?.errorMessage
                return Promise.reject({message: message ?? "Ha ocurrido un error inesperado", status: response.status})
            }
            else if (response.status === 400) {
                let message = (await response.json())?.errorMessage
                return Promise.reject({message: message ?? "Los campos introducidos no son correctos", status: response.status})
            }
            if (!response.status.toString().startsWith("2")) {
                let message = null;
                if(response.headers.get('Content-Type')?.includes('text/plain')){
                     message = await response.text();
                }
                if(response.headers.get('Content-Type')?.includes('application/json')){
                    message = (await response.json()).errorMessage;
                }
                return Promise.reject({message, status:response.status});
            }

            if (response.headers.get('Content-Type')?.includes('application/json'))
                return await response.json()

        }).catch((error : any) => {
            resultError = errorHandler(error.message, error.status)
        }).finally(() => {
            decreaseLoader()
        })

        if (!resultError && data && data.code && data.code !== 200) {
            resultError = errorHandler(data.message, data.code);
        }

        if (resultError) {
            return Promise.reject(resultError)
        }
        return data
    }, [errorHandler, increaseLoader, decreaseLoader])

    return callApi
}

async function get(url : string, jwt: string) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
    })
    return response
}

async function post(url : string, body = {}, jwt: string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(body),
    })
    return response
}

async function put(url : string, body = {}, jwt: string) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(body)
    })
    return response
}

async function remove(url : string, jwt: string) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
    })
    return response
}