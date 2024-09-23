import { Autocomplete, Box, Button, ButtonGroup, Checkbox, FormControlLabel, FormGroup, InputAdornment, MenuItem, Pagination, Radio, RadioGroup, Select, styled, TextField, Typography, useMediaQuery } from '@mui/material'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useApi } from '../../../shared/Hooks/useApi'
import { FOTOCASA_TOTAL_ELEMENTS_PER_PAGE, IDEALISTA_TOTAL_ELEMENTS_PER_PAGE, X_RAPIDAPI_FOTOCASA_GETALL, X_RAPIDAPI_IDEALISTA_GETALL, X_RAPIDAPI_IDEALISTA_GETDETAIL } from '../../../shared/Constants'
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EuroIcon from '@mui/icons-material/Euro';
import { FavoriteProperty, IdealistaPropertyDetails, Location, NotInterestedProperty, PropertySearchResult, SearchParams } from '../../../types'
import { addPropertyInSearch, createSearch, getFotocasaLocations, getIdealistaLocations } from '../../../api/searchPropertiesApi';
import PropertySearchResultSummary from '../PropertySearchResult/PropertySearchResultSummary';
import { useSnackBar } from '../../../shared/components/SnackBarContext';
import { useIdealistaApi } from '../../../shared/Hooks/useIdealistaApi';
import { constructIdealistaUrlSearchParams, constructIdealistaUrlSearchParamsDetail, filterIdealistaApiResult, formatPropertyDetails, formatPropertyResult } from '../../../shared/Utils/IdealistaCallApiUtils';
import LocationCoordDialog from './LocationCoordSelector/LocationCoordDialog';
import { createProperty, favoriteProperty, getNotInterestedProperties, getPropertyById, getUserFavoriteProperties, markAsNotInterested, removeFavoriteProperty, unmarkAsNotInterested } from '../../../api/propertyApi';
import { useFotocasaApi } from '../../../shared/Hooks/useFotocasaApi';
import { constructFotocasaUrlSearchParams, filterFotocasaSearchResult, formatFotocasaSearchResult } from '../../../shared/Utils/FotocasaCallApiUtils';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import CategorySelectorDialog from '../../../shared/components/CategorySelectorDialog/CategorySelectorDialog';
const PropertySearch : React.FC = () => {
    //#region Contextos y hooks personalizados
    const callApi = useApi()
    const callIdealistaApi = useIdealistaApi()
    const callFotocasaApi = useFotocasaApi()
    const snackBar = useSnackBar()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])
    //#endregion

    //#region Definición de estados
    
    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const matches_2000 = useMediaQuery('(min-width:2000px)')
    const matches_1280 = useMediaQuery('(max-width:1280px)')
    const [showNotInterested, setShowNotInterested] = useState(JSON.parse(sessionStorage.getItem("lastSearch")!)?.showNotInterested || false)
    const [searchOptions, setSearchOptions] = useState<SearchParams>(JSON.parse(sessionStorage.getItem("lastSearch")!)?.searchOptions || {
        portal: "",
        operation: "rent",
        propertyType: "",
        priceRange: [0, 0],
        sizeRange: [0, 0],
        bathrooms: 0,
        bedrooms: 0,
        searchCharacteristics: {
            ac: false,
            elevator: false,
            garage: false,
            groundFloor: false,
            newConstruction: false,
            storeRoom: false,
            terrace: false
        },
        locationDbId: null,
        locationId: null,
        coordinates: null
    })

    const originalPaginationState = {
        totalPages: 0,
        totalElements: 0,
        currentPage: 1
    }
    const [pagination, setPagination] = useState(JSON.parse(sessionStorage.getItem("lastSearch")!)?.pagination || originalPaginationState)
    
    const [searchCreatedId, setSearchCreatedId] = useState<string | null>(JSON.parse(sessionStorage.getItem("lastSearch")!)?.searchCreatedId || null)
    const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([])
    const [notInterestedProperties, setNotInterestedProperties] = useState<NotInterestedProperty[]>([])

    const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
    const [lastFavedProperty, setLastFavedProperty] = useState<any>(null)
    
    useEffect(() : void => {
        if (!user || !cookies?.authentication) {
            navigate("/login")
        } else {
            callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
                if (result && result.length !== favoriteProperties.length) {
                    result.map((favProp: any) => {
                        callApi(getPropertyById(favProp?.id)).then((property: any) => {
                            let formatFavProp = {
                                id: property?.id,
                                portal: property?.portal,
                                propertyCode: property?.propertyCode,
                                portalLink: property?.portalLink,
                                rawData: property?.rawData,
                                comment: favProp?.comment,
                                categoryId: favProp?.categoryId,
                                notifications: favProp?.notifications,
                                notificationMessage: favProp?.notificationMessage
                            }
                            setFavoriteProperties(state => { return [...state, formatFavProp] })
                        })
                    })
                }
            })

            callApi(getNotInterestedProperties(user?.id)).then((result: any) => {
                if (result && result.length !== notInterestedProperties.length) {
                    setNotInterestedProperties(result)
                }
            })
            
            callApi(getIdealistaLocations()).then((locationsResult : Location[]) => {
                setIdealistaLocations(locationsResult)
            })
            callApi(getFotocasaLocations()).then((locationsResult : Location[]) => {
                setFotocasaLocations(locationsResult)
            })
        }
    }, [])

    
    const [selectedLocation, setSelectedLocation] = useState<{ name: string, subTypeText: string, locationId: string } | null>(JSON.parse(sessionStorage.getItem("lastSearch")!)?.selectedLocation || null)
    const [idealistaLocations, setIdealistaLocations] = useState<Location[]>([])
    const [fotocasaLocations, setFotocasaLocations] = useState<Location[]>([])
    
    const [propertySearchResult, setPropertySearchResult] = useState<PropertySearchResult[]>(JSON.parse(sessionStorage.getItem("lastSearch")!)?.result || [])
    const [openDialog, setOpenDialog] = useState<boolean>(false)
    
    useEffect(() => {
        if (pagination.totalPages !== 0 && searchOptions.portal !== "") {
            const searchAgain = async () => {
                setPropertySearchResult([])
                searchOptions.portal === "idealista" ? await searchIdealista() : await searchFotocasa()
            }
            searchAgain()
        }
    }, [pagination.currentPage])
    
    useEffect(() => {
        sessionStorage.setItem("lastSearch", JSON.stringify({
            propertySearchResult,
            selectedLocation,
            searchCreatedId,
            pagination,
            searchOptions,
            showNotInterested
        }))
    }, [searchCreatedId, propertySearchResult, pagination, searchOptions, showNotInterested])

    //#endregion
    
    const portalValues = { idealista: "Idealista", fotocasa: "Fotocasa" }
    const elementsPerPage = { idealista: IDEALISTA_TOTAL_ELEMENTS_PER_PAGE, fotocasa: FOTOCASA_TOTAL_ELEMENTS_PER_PAGE }

    //#region Eventos

    const handlePortalChanged = (portal : string) => {
        setSearchOptions({...searchOptions, portal, locationId: null, locationDbId: null, coordinates: null })
        setSelectedLocation(null)
        setPropertySearchResult([])
        setSearchCreatedId(null)
        setPagination(originalPaginationState)
    }

    const handleOperationChanged = (event : ChangeEvent<HTMLInputElement>) => {
        setSearchOptions({...searchOptions, operation: event.target.value})
    }

    const handleChangePropertyType = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchOptions({...searchOptions, propertyType: event.target.value})
    }

    const handleChangePriceRange = (event : ChangeEvent<HTMLInputElement>, position : number) => {
        if (!Number.isNaN(event.target.value)) {
            let range = searchOptions.priceRange
            range[position] = parseFloat(event.target.value === "" ? "0" : event.target.value)
            setSearchOptions({...searchOptions, priceRange: range})
        }
    }

    const handleChangeSizeRange = (event : ChangeEvent<HTMLInputElement>, position : number) => {
        if (!Number.isNaN(event.target.value)) {
            let range = searchOptions.sizeRange
            range[position] = parseFloat(event.target.value === "" ? "0" : event.target.value)
            setSearchOptions({...searchOptions, sizeRange: range})
        }
    }

    const handleChangeBedOrBath = (event : ChangeEvent<HTMLInputElement>, type : string) => {
        if (!Number.isNaN(event.target.value)) {
            setSearchOptions({...searchOptions, [type]: event.target.value === "" ? 0 : parseInt(event.target.value)})
        }
    }

    const handleChangeCharacteristics = (event : ChangeEvent<HTMLInputElement>) => {
        setSearchOptions({...searchOptions, searchCharacteristics: {...searchOptions.searchCharacteristics, [event.target.name]: event.target.checked}})
    }

    const handleLocationSelectedChange = (event : any, newValue : { name: string, subTypeText: string, locationId: string } | null) => {
        setSelectedLocation(newValue)
        if (newValue?.name!) {
            let locationName = newValue.name.split('/')[0].trim()
            let subTypeText = newValue.name.split('/')[1].trim()
            const location = searchOptions.portal === "idealista" ? 
                idealistaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText) : 
                fotocasaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText)
            setSearchOptions({...searchOptions, locationDbId: location?.id, locationId: location?.locationId})
        }
    }

    const searchIdealista = async () => {
        let filteredPropertyCodes : string[] = []

        let response = await callIdealistaApi(X_RAPIDAPI_IDEALISTA_GETALL, constructIdealistaUrlSearchParams(searchOptions, pagination.currentPage))

        let filteredResponse = filterIdealistaApiResult(searchOptions, response?.elementList)

        // if (!showNotInterested) {
        //     let idealistaNotInterested = notInterestedProperties.filter((prop: NotInterestedProperty) => prop.portal === "idealista")
        //     idealistaNotInterested.forEach((prop: NotInterestedProperty) => {
        //         filteredResponse = filteredResponse.filter((item: any) => item?.propertyCode?.toString() !== prop.propertyCode)
        //     })
        // }

        if (filteredResponse?.length === 0 || response?.total === 0) {
            snackBar.showSnackBar("No se han encontrado viviendas", 'warning', { horizontal: 'center', vertical: 'top' }, 3000)
            setSearchCreatedId("0"!)
            return
        }

        let _result : PropertySearchResult[] = []
        filteredResponse?.forEach(filteredResponse => {
            _result.push(formatPropertyResult(filteredResponse, searchOptions.operation))
            filteredPropertyCodes.push(filteredResponse?.propertyCode)
        })

        setPropertySearchResult(_result)

        if (JSON.stringify(pagination) === JSON.stringify(originalPaginationState)) {
            setPagination((state: any) => {
                return {...state, totalElements: response?.total, totalPages: response?.totalPages}
            })
        }

        if (searchCreatedId === "-1" || searchCreatedId === null) {
            let search = await callApi(createSearch({ searchOptions, properties: filteredPropertyCodes, userFk: user?.id  }))
            setSearchCreatedId(search?.id)
        } else {
            await callApi(addPropertyInSearch(searchCreatedId, filteredPropertyCodes))
        }
    }

    const searchFotocasa = async () => {
        let filteredPropertyCodes : string[] = []

        let response = await callFotocasaApi(X_RAPIDAPI_FOTOCASA_GETALL, constructFotocasaUrlSearchParams(searchOptions, pagination.currentPage))
        
        let filteredResponse = filterFotocasaSearchResult(searchOptions, response?.realEstates)

        // if (!showNotInterested) {
        //     let fotocasaNotInterested = notInterestedProperties.filter((prop: NotInterestedProperty) => prop.portal === "fotocasa")
        //     fotocasaNotInterested.forEach((prop: NotInterestedProperty) => {
        //         filteredResponse = filteredResponse.filter((item: any) => item?.id?.toString() !== prop.propertyCode)
        //     })
        // }
        
        if (filteredResponse?.length === 0 || response?.count === 0) {
            snackBar.showSnackBar("No se han encontrado viviendas", 'warning', { horizontal: 'center', vertical: 'top' }, 3000)
            setSearchCreatedId("0"!)
            return
        }
        let _result : PropertySearchResult[] = []
        filteredResponse?.forEach(filteredResponse => {
            if (!propertySearchResult.find(item => item.propertyCode.toString() === filteredResponse?.id?.toString())) {
                _result.push(formatFotocasaSearchResult(filteredResponse, searchOptions.operation, searchOptions.locationId!))
                filteredPropertyCodes.push(filteredResponse?.id?.toString())
            }
        })
        setPropertySearchResult(_result)

        if (JSON.stringify(pagination) === JSON.stringify(originalPaginationState)) {
            setPagination((state: any) => {
                return {...state, totalElements: response?.count, totalPages: Math.ceil(response?.count / elementsPerPage.fotocasa)}
            })
        }

        if (searchCreatedId === "-1" || searchCreatedId === null) {
            let search = await callApi(createSearch({ searchOptions, properties: filteredPropertyCodes, userFk: user?.id }))
            setSearchCreatedId(search?.id)
        } else {
            await callApi(addPropertyInSearch(searchCreatedId, filteredPropertyCodes))
        }
    }

    const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
        setPagination((state: any) => {
            return {...state, currentPage: value}
        })
    }

    useEffect(() => {
        if (searchCreatedId !== null && searchCreatedId !== "0" && propertySearchResult.length === 0) {
            (async () => {
                searchOptions?.portal === "idealista" ? await searchIdealista() : await searchFotocasa()
            })()
        }
    }, [searchCreatedId])

    const onSearchSubmitted = (event : ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (searchOptions.portal === "") {
            snackBar.showSnackBar('Seleccione un portal', 'error', { vertical: 'bottom', horizontal: 'left' }, 3000)
            return
        }
        if (!searchOptions.locationId && !searchOptions.coordinates) {
            snackBar.showSnackBar('Seleccione una localización del selector o bien del mapa', 'error', { vertical: 'bottom', horizontal: 'left' }, 3000)
            return
        }

        setPropertySearchResult([])
        setSearchCreatedId("-1")
        setPagination(originalPaginationState)
    }

    const isIdealistaPropertyDetails = (property: IdealistaPropertyDetails | PropertySearchResult): property is IdealistaPropertyDetails => {
        return (property as IdealistaPropertyDetails)?.link !== undefined
    }

    const handleAssignCategoryToFavProperty = async (result: any, categoryId: string) => {
        await callApi(favoriteProperty(user?.id, result?.id, categoryId))
        let formatFavProp = {
            id: result?.id,
            portal: result?.portal,
            propertyCode: result?.propertyCode,
            portalLink: result?.portalLink,
            rawData: result?.rawData,
            comment: "",
            categoryId,
            notifications: 0,
            notificationMessage: null
        }
        setFavoriteProperties(state => { return [...state, formatFavProp] })
        localStorage.setItem("favoriteProperties", JSON.stringify(favoriteProperties))
    }

    const handleAddFavorite = async (property: PropertySearchResult) => {
        let propertyData = searchOptions.portal === "idealista" ? 
            formatPropertyDetails(await callIdealistaApi(X_RAPIDAPI_IDEALISTA_GETDETAIL, constructIdealistaUrlSearchParamsDetail(property.propertyCode)), property.summaryTagSection) :
            property
        const portalLink = isIdealistaPropertyDetails(propertyData) ? propertyData?.link : propertyData?.linkToPortal
        callApi(createProperty({
            portal: searchOptions.portal,
            propertyCode: propertyData.propertyCode.toString(),
            portalLink: portalLink,
            rawData: JSON.stringify(propertyData)
        })).then(async (result: any) => {
            if (result) {
                setLastFavedProperty(result)
                setOpenCategoryDialog(true)
            }
        })
        

    }

    const handleRemoveFavorite = (property: PropertySearchResult) => {
        let favProp = favoriteProperties.find((prop: FavoriteProperty) => prop.portal === searchOptions.portal && prop.propertyCode === property.propertyCode.toString())
        if (favProp) {
            callApi(removeFavoriteProperty(user?.id, favProp.id, favProp.comment, favProp.categoryId, favProp.notifications, favProp.notificationMessage)).then(() => {
                setFavoriteProperties(state => state.filter(prop => prop.id !== favProp.id))
                localStorage.setItem("favoriteProperties", JSON.stringify(favoriteProperties))
            })
        }
    }

    const handleMarkAsNotInterested = (property: PropertySearchResult) => {
        callApi(markAsNotInterested(user?.id, searchOptions.portal, property.propertyCode.toString())).then(() => {
            setNotInterestedProperties(state => [...state, { portal: searchOptions.portal, propertyCode: property.propertyCode.toString() }])
        })
    }

    const handleUnmarkAsNotInterested = (property: PropertySearchResult) => {
        callApi(unmarkAsNotInterested(user?.id, searchOptions.portal, property.propertyCode.toString())).then(() => {
            setNotInterestedProperties(state => state.filter(prop => prop.portal !== searchOptions.portal && prop.propertyCode !== property.propertyCode.toString()))
        })
    }

    //#endregion Eventos

    const GroupHeader = styled('div')(({ theme }) => ({
        padding: '5px 10px',
        fontSize: '0.90rem',
        fontWeight: 700,
    }));
    
    const GroupItems = styled('ul')({
        padding: 0,
    });

    

    return (
        <Box display="block" sx={{ ml: "1.5rem", mr: "1.5rem" }}>
            { user && 
                <Box display="flex" sx={{ mt: matches_1280 ? 'auto' : matches_1750 ? 'auto' : '0.50rem', flexDirection: "row", width: "100%" }}>
                    <Box onSubmit={onSearchSubmitted} component="form" sx={{ width: matches_1280 ? "40%" : matches_1750 ? "26%" : "19%", display: "flex", flexDirection: "column", overflowY: "auto", my: "1.5rem" }}>
                        <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", height: matches_2000 ? "54rem" : "50.75rem", backgroundColor: "#de6ab80a", borderRadius: "1rem", border: "0.2rem solid #832756" }}>
                            <ButtonGroup fullWidth sx={{ mb: "0.5rem" }} variant='outlined' aria-label='portal-selector' color='primary'>
                                <Button sx={{ fontFamily: "Roboto", borderTopLeftRadius: "0.75rem", borderBottomLeftRadius: "0rem" }} variant={searchOptions.portal === "idealista" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("idealista")}} >{portalValues.idealista}</Button>
                                <Button sx={{ fontFamily: "Roboto", borderTopRightRadius: "0.75rem", borderBottomRightRadius: "0rem" }} variant={searchOptions.portal === "fotocasa" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("fotocasa")}}>{portalValues.fotocasa}</Button>
                            </ButtonGroup>
                            <RadioGroup defaultValue="rent" row aria-labelledby='property-type-radio' value={searchOptions.operation} onChange={handleOperationChanged}>
                                <FormControlLabel value="sale" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Comprar</Typography>} />
                                <FormControlLabel value="rent" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Alquilar</Typography>} />
                            </RadioGroup>
                            <FormControlLabel control={<Checkbox size='small' checked={showNotInterested} onChange={() => setShowNotInterested(!showNotInterested)} />} 
                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }} >Mostrar "No me interesa"</Typography>} />
                            <TextField
                                select
                                label="Tipo de propiedad"
                                variant='standard'
                                defaultValue=""
                                onChange={handleChangePropertyType}
                                sx={{ fontFamily: "Roboto", mb: "0.50rem", width: "70%" }}
                                SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                            >
                                <MenuItem sx={{ fontFamily: "Roboto" }} value={""}>-----</MenuItem>
                                <MenuItem sx={{ fontFamily: "Roboto" }} value={"flat"}>Piso</MenuItem>
                                <MenuItem sx={{ fontFamily: "Roboto" }} value={"house"}>Casa</MenuItem>
                                <MenuItem sx={{ fontFamily: "Roboto" }} value={"studio"}>Estudio</MenuItem>
                            </TextField>
                            <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", width: "70%", mx: "1.25rem" }}>
                                <Autocomplete 
                                    disablePortal 
                                    isOptionEqualToValue={(option, value) => option.locationId === value.locationId}
                                    size='small'
                                    value={selectedLocation}
                                    onChange={handleLocationSelectedChange}
                                    sx={{ width: "100%", fontFamily: "Roboto" }}
                                    id='locations-combo'
                                    groupBy={(option) => (
                                        option.subTypeText
                                    )}
                                    getOptionLabel={(option) => option.name}
                                    renderGroup={(params) => {
                                        return (
                                            <li key={params.key}>
                                                <GroupHeader>{params.group}</GroupHeader>
                                                <GroupItems>{params.children}</GroupItems>
                                            </li>
                                        )
                                    }}
                                    disabled={searchOptions.portal === "" || (searchOptions.coordinates !== null)}
                                    options={
                                        searchOptions.portal === "idealista" ? 
                                            idealistaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, subTypeText: location.subTypeText, locationId: location.locationId } }) 
                                        :

                                        searchOptions.portal === "fotocasa" ? 
                                            fotocasaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, subTypeText: location.subTypeText, locationId: location.locationId }  }) : []}
                                    renderInput={(params) => <TextField {...params} name='' inputProps={{ ...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" } }}
                                    variant='standard' label="Localización" sx={{ fontFamily: "Roboto" }} 
                                        SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }} 
                                        />}
                                    ListboxProps={{ sx: { fontSize: "0.90rem" } }}
                                />
                            </Box>
                            <Box display="flex" sx={{ flexDirection: "column", mt: "1.5rem", mx: "1.25rem" }}>
                                <Box display="flex" sx={{ mb: "1rem" }}>
                                    <TextField
                                        id='min-prize'
                                        type='number'
                                        label="Precio mín."
                                        size='small'
                                        sx={{ fontFamily: "Roboto", width: "100%", mr: "1rem" }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputProps={{ inputProps: { step: 0.5, min: 0, max: searchOptions.priceRange[1] === 0 ? 500000 : searchOptions.priceRange[1] }, startAdornment: (
                                            <InputAdornment position='start'>
                                                <EuroIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                            </InputAdornment>
                                        ) }}
                                        onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangePriceRange(event, 0)}
                                    >
                                        Precio mínimo
                                    </TextField>
                                    <TextField
                                        id='max-prize'
                                        type='number'
                                        label="Precio máx."
                                        size='small'
                                        sx={{ fontFamily: "Roboto", width: "100%" }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputProps={{ inputProps: { step: 0.5, min: searchOptions.priceRange[0]}, startAdornment: (
                                            <InputAdornment position='start'>
                                                <EuroIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                            </InputAdornment>
                                        ) }}
                                        onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangePriceRange(event, 1)}
                                    >
                                        Precio máximo
                                    </TextField>
                                </Box>
                                <Box display="flex" sx={{ mb: "1rem" }}>
                                    <TextField
                                        id='min-size'
                                        label="Tamaño mín."
                                        type='number'
                                        size='small'
                                        sx={{ fontFamily: "Roboto", width: "100%", mr: "1rem" }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputProps={{ inputProps: { step: 0.5, min: 0, max: searchOptions.sizeRange[1] }, startAdornment: (
                                            <InputAdornment position='start'>
                                                <SquareFootIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                            </InputAdornment>
                                        ) }}
                                        onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangeSizeRange(event, 0)}
                                    >
                                        Tamaño mínimo
                                    </TextField>
                                    <TextField
                                        id='max-size'
                                        label="Tamaño máx."
                                        type='number'
                                        size='small'
                                        sx={{ fontFamily: "Roboto", width: "100%" }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputProps={{ inputProps: { step: 0.5, min: searchOptions.sizeRange[0] }, startAdornment: (
                                            <InputAdornment position='start'>
                                                <SquareFootIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                            </InputAdornment>
                                        ) }}
                                        onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangeSizeRange(event, 1)}
                                    >
                                        Max
                                    </TextField>
                                </Box>
                                <Box display="flex" sx={{ mb: "1rem", width: "100%" }}>
                                    <Box sx={{ width: "100%", mr: "1rem" }}>
                                        <TextField
                                            id='bedrooms'
                                            type='number'
                                            label="Habitaciones"
                                            size='small'
                                            sx={{ fontFamily: "Roboto", width: "100%" }}
                                            InputLabelProps={{ sx: {fontFamily: "Roboto"} }}
                                            InputProps={{ inputProps: { min: 0, max: 4 }, startAdornment: (
                                                <InputAdornment position='start'>
                                                    <BedIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                                </InputAdornment>
                                            ) }}
                                            onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangeBedOrBath(event, "bedrooms")}
                                        >
                                            Habitaciones
                                        </TextField>
                                    </Box>
                                    <Box sx={{ width: "100%" }}>
                                        <TextField
                                            id='bathrooms'
                                            label="Baños"
                                            type='number'
                                            size='small'
                                            sx={{ fontFamily: "Roboto", width: "100%" }}
                                            InputLabelProps={{ sx: {fontFamily: "Roboto"} }}
                                            InputProps={{ inputProps: { min: 0, max: 3 }, startAdornment: (
                                                <InputAdornment position='start'>
                                                    <ShowerIcon sx={{ fontSize: "1.20rem" }} color='primary' />
                                                </InputAdornment>
                                            ) }}
                                            onChange={(event : ChangeEvent<HTMLInputElement>) => handleChangeBedOrBath(event, "bathrooms")}
                                        >
                                            Baños
                                        </TextField>
                                    </Box>
                                </Box>
                                <Box display="flex" sx={{ mt: "0.5rem", flexDirection: "column" }}>
                                    <Typography fontFamily="Roboto" sx={{ mb: "0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                                        Características
                                    </Typography>
                                    <FormGroup>
                                        <FormControlLabel control={
                                            <Checkbox size='small' checked={searchOptions.searchCharacteristics.ac} onChange={handleChangeCharacteristics}  name='ac' />
                                        }
                                            label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Aire acondicionado</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' checked={searchOptions.searchCharacteristics.elevator} onChange={handleChangeCharacteristics} name='elevator' />
                                        }
                                            label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Ascensor</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' disabled={searchOptions.portal === "fotocasa"} checked={searchOptions.searchCharacteristics.garage} onChange={handleChangeCharacteristics} name='garage' />
                                        }
                                            label={<Typography color={searchOptions.portal === "fotocasa" ? "grey" : "inherit"} variant='body1' sx={{ fontSize: "0.90rem" }}>Garaje</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' checked={searchOptions.searchCharacteristics.newConstruction} onChange={handleChangeCharacteristics} name='newConstruction' />
                                        }
                                            label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Obra nueva</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' checked={searchOptions.searchCharacteristics.terrace} onChange={handleChangeCharacteristics} name='terrace' />
                                        }
                                            label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Terraza</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' disabled={searchOptions.portal === "fotocasa"} checked={searchOptions.searchCharacteristics.storeRoom} onChange={handleChangeCharacteristics} name='storeRoom' />
                                        }
                                            label={<Typography color={searchOptions.portal === "fotocasa" ? "grey" : "inherit"} variant='body1' sx={{ fontSize: "0.90rem" }}>Trastero</Typography>}
                                        />
                                        <FormControlLabel control={
                                            <Checkbox size='small' disabled={searchOptions.portal === "fotocasa"} checked={searchOptions.searchCharacteristics.groundFloor} onChange={handleChangeCharacteristics} name='groundFloor' />
                                        }
                                            label={<Typography color={searchOptions.portal === "fotocasa" ? "grey" : "inherit"} variant='body1' sx={{ fontSize: "0.90rem" }}>Planta baja</Typography>}
                                        />
                                    </FormGroup>
                                </Box> 
                                <Button
                                    type='submit'
                                    size='medium'
                                    color='primary'
                                    sx={{ borderRadius: "1rem", mt: matches_2000 ? "6rem" : "3rem", mb: "0.75rem" }}
                                    variant='contained'
                                >
                                    Buscar
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <CategorySelectorDialog 
                        openDialog={openCategoryDialog}
                        setOpenDialog={setOpenCategoryDialog}
                        existantCategoryId={null}
                        handleAssignCategory={handleAssignCategoryToFavProperty}
                        setOriginalCategories={null}
                        result={lastFavedProperty}
                    />
                    { propertySearchResult.length >= 1 && 
                        <Box sx={{ overflow: "auto", width: "100%", height: matches_2000 ? "54rem" : "50.75rem", ml: "1.5rem", my: "1.5rem", borderRadius: "1rem 0 0 1rem", border: "0.2rem solid #832756" }}>
                            { propertySearchResult.map((property : PropertySearchResult) => {
                                return (
                                    <PropertySearchResultSummary 
                                        key={property.propertyCode}
                                        searchOptions={searchOptions} 
                                        handleAddFavorite={handleAddFavorite} 
                                        handleRemoveFavorite={handleRemoveFavorite}
                                        handleMarkAsNotInterested={handleMarkAsNotInterested}
                                        handleUnmarkAsNotInterested={handleUnmarkAsNotInterested}
                                        searchResult={property} 
                                        isFavorite={favoriteProperties.find((favProp: FavoriteProperty) => favProp.portal === searchOptions.portal && favProp.propertyCode === property.propertyCode.toString() ) ? true : false}
                                        favoritePropertyData={favoriteProperties.find((favProp: FavoriteProperty) => favProp.portal === searchOptions.portal && favProp.propertyCode === property.propertyCode.toString())!}
                                        showNotInterested={showNotInterested}
                                        isNotInterested={notInterestedProperties.find((prop: NotInterestedProperty) => prop.portal === searchOptions.portal && prop.propertyCode === property.propertyCode.toString()) ? true : false
                                        }
                                    />
                                ) 
                            }) }
                            { pagination.totalPages > 1 &&
                                <Box display="flex" sx={{ justifyContent: "center", alignItems: "center", mb: "1rem" }}>
                                    <Pagination 
                                        count={pagination.totalPages}
                                        page={pagination.currentPage}
                                        onChange={handleChangePage}
                                        variant='outlined'
                                        color='primary'
                                    />
                                </Box>
                            }
                        </Box>
                    }
                </Box>
            }
        </Box>
    )
}

export default PropertySearch