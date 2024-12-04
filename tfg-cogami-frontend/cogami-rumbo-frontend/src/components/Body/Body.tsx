import React, { useEffect } from 'react'
import PropertySearch from './PropertySearch/PropertySearch'
import { Box, Button, useMediaQuery } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import PropertyDetails from './PropertyDetails.tsx/PropertyDetails'
import Login from './Auth/Login/Login'
import PageNotFound from '../NotFound/PageNotFound'
import SignUp from './Auth/SignUp'
import FavoritePropertiesSearch from './FavoritePropertiesSearch/FavoritePropertiesSearch'
import SearchHistoric from './SearchHistoric/SearchHistoric'
import { useApi } from '../../shared/Hooks/useApi'
import { useSnackBar } from '../../shared/components/SnackBarContext'
import { useCookies } from 'react-cookie'
import { getUserFavoriteProperties } from '../../api/propertyApi'

const Body : React.FC = () => {
    const matches = useMediaQuery('(max-width: 800px)')
    const callApi = useApi()
    const snackBar = useSnackBar()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    useEffect(() => {
        if (user && cookies?.authentication) {
            callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
                let isAlertNotifications = false
                let isAlertNotAvailable = false

                if (result) {
                    result.map((favProp: any) => {
                        if (favProp?.notifications === 1) {
                            isAlertNotifications = true
                        }
                        if (favProp?.notifications === -1) {
                            isAlertNotAvailable = true
                        }
                    })
                }

                let snackText = ""

                if (isAlertNotifications) {
                    snackText = "Hay actualizaciones en anuncios de tus viviendas favoritas\n"
                }
                if (isAlertNotAvailable) {
                    snackText = `${snackText}Tiene viviendas favoritas con anuncios no disponibles en su portal de origen`
                }

                if (snackText !== "") {
                    snackBar.showSnackBar(snackText, "info", { vertical: "top", horizontal: "right" }, null)
                }
            })
        }
    }, [cookies])

    return (
        <Box sx={{ mt: matches ? "8rem" : "3.25rem" }}>
            <Routes>
                <Route path='/' element={<PropertySearch />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<SignUp />} />
                <Route path='/accessible-search' element={<PropertySearch />} />
                <Route path='/accessible-search/historic' element={<SearchHistoric />} />
                <Route path='/accessible-search/:portal/:propertyCode/:operation' element={<PropertyDetails />} />
                <Route path='/accessible-search/favorite_properties' element={<FavoritePropertiesSearch />} />
                <Route path='*' element={<PageNotFound />} />
            </Routes>
        </Box>
    )
}

export default Body