import { ChangeEvent, FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useApi } from "../../../shared/Hooks/useApi";
import { useIdealistaApi } from "../../../shared/Hooks/useIdealistaApi";
import { useFotocasaApi } from "../../../shared/Hooks/useFotocasaApi";
import { useSnackBar } from "../../../shared/components/SnackBarContext";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Accordion, AccordionDetails, AccordionSummary, alpha, Autocomplete, Box, Button, ButtonGroup, Checkbox, Divider, FormControlLabel, FormGroup, InputAdornment, Menu, MenuItem, MenuProps, Pagination, Radio, RadioGroup, styled, TextField, Typography, useMediaQuery } from "@mui/material";
import { FavoriteProperty, SearchParams, Location, PropertySearchResult, Category } from "../../../types";
import { getPropertyById, getUserFavoriteProperties, removeFavoriteProperty } from "../../../api/propertyApi";
import { getFotocasaLocations, getIdealistaLocations } from "../../../api/searchPropertiesApi";
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EuroIcon from '@mui/icons-material/Euro';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatIdealistaPropertyIntoPropertySearchResult } from "../../../shared/Utils/IdealistaCallApiUtils";
import PropertySearchResultSummary from "../PropertySearchResult/PropertySearchResultSummary";
import { filterFavoriteProperties } from "../../../shared/Utils/Utils";
import FavoriteSearchByHistoricDialogResult from "./FavoriteSearchByHistoricDialog";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { getUserCreatedCategories } from "../../../api/categoryApi";
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog/ConfirmationDIalog";

type LocationsId = {
    idealista: string[], fotocasa: string[]
}

const FavoritePropertiesSearch : FC = () => {
    const callApi = useApi()
    const snackBar = useSnackBar()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const matches_2000 = useMediaQuery('(min-width:2000px)')
    const matches_1280 = useMediaQuery('(max-width:1280px)')

    const [openHistoricSearch, setOpenHistoricSearch] = useState(false)

    const [searchOptions, setSearchOptions] = useState<SearchParams>(JSON.parse(sessionStorage.getItem("lastFavSearch")!)?.searchOptions || {
        portal: "idealista",
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

    const [showCommentsOnly, setShowCommentsOnly] = useState(false)
    const [showUpdatedAds, setShowUpdatedAds] = useState(false)
    const [showNotAvailableAds, setShowNotAvailableAds] = useState(false)

    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

    const originalPaginationState = {
        totalPages: 0,
        totalElements: 0,
        currentPage: 1
    }
    const [pagination, setPagination] = useState(JSON.parse(sessionStorage.getItem("lastFavSearch")!)?.pagination || originalPaginationState)
    
    const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([])
    const [propertySearchResult, setPropertySearchResult] = useState<PropertySearchResult[]>(JSON.parse(sessionStorage.getItem("lastFavSearch")!)?.propertySearchResult || [])

    const [selectedLocation, setSelectedLocation] = useState<{ name: string, locationId: string } | null>(JSON.parse(sessionStorage.getItem("lastFavSearch")!)?.selectedLocation || null)
    const [idealistaLocations, setIdealistaLocations] = useState<Location[]>([])
    const [fotocasaLocations, setFotocasaLocations] = useState<Location[]>([])

    const portalValues = { idealista: "Idealista", fotocasa: "Fotocasa" }

    const [favoriteLocationsId, setFavoriteLocationsId] = useState<{ idealista: string[], fotocasa: string[] }>({ idealista: [], fotocasa: [] })

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(JSON.parse(sessionStorage.getItem("lastFavSearch")!)?.selectedCategory || null)
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() : void => {
        if (!user || !cookies.authentication) {
            navigate("/login")
        } else {
            callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
                if (result && result.length !== favoriteProperties.length && propertySearchResult.length === 0) {
                    let favProps : FavoriteProperty[] = []
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
                            favProps.push(formatFavProp)
                            // setFavoriteProperties(state => { return [...state, formatFavProp] })
                            let parsedRawData = JSON.parse(formatFavProp.rawData)
                            let locationId = String(parsedRawData?.ubication?.locationId)
                            if (formatFavProp.portal === "idealista" && searchOptions.portal === "idealista" && parsedRawData?.operation === "rent") {
                                if (!favoriteLocationsId.idealista.includes(locationId)) {
                                    let tempLocations = favoriteLocationsId.idealista
                                    tempLocations.push(locationId)
                                    setFavoriteLocationsId(state => { return {...state, idealista: tempLocations} })
                                }
                                if (propertySearchResult.length === 0) {
                                    setPropertySearchResult(state => { return [...state, 
                                        formatIdealistaPropertyIntoPropertySearchResult(JSON.parse(formatFavProp.rawData))]})
                                    }
                            } else {
                                if (!favoriteLocationsId.fotocasa.includes(locationId)) {
                                    let tempLocations = favoriteLocationsId.fotocasa
                                    tempLocations.push(locationId)
                                    setFavoriteLocationsId(state => { return {...state, fotocasa: tempLocations} })
                                }
                            }
                        })
                    })
                    setFavoriteProperties(favProps)
                }
            })

            callApi(getIdealistaLocations()).then((locationsResult: Location[]) => {
                setIdealistaLocations(locationsResult)
            })

            callApi(getFotocasaLocations()).then((locationsResult: Location[]) => {
                setFotocasaLocations(locationsResult)
            })
        }
    }, [])

    useEffect(() => {
        callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
            let locationResult : LocationsId = { idealista: [], fotocasa: [] }
            let favoriteResult : FavoriteProperty[] = []
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
                    favoriteResult.push(formatFavProp)
                    let parsedRawData = JSON.parse(formatFavProp.rawData)
                    let locationId = String(parsedRawData?.ubication?.locationId)
                    if (!locationResult[formatFavProp.portal as keyof LocationsId].includes(locationId)) {
                        setFavoriteLocationsId(state => {
                            const newLoc = {...state}
                            const key = formatFavProp.portal as keyof LocationsId

                            if (!newLoc[key]) {
                                newLoc[key] = []
                            }
                            newLoc[key].push(locationId)

                            return newLoc
                        })
                        // locationResult[formatFavProp.portal as keyof LocationsId].push(locationId)
                    }

                })
            })
            setFavoriteLocationsId(locationResult)
            // setFavoriteProperties(favoriteResult)
        })
    }, [])

    useEffect(() => {
        if (!user || !cookies.authentication) {
            navigate("/login")
        } else {
            callApi(getUserCreatedCategories(user?.id)).then((result: any) => {
                let _categories : Category[] = []
                result.forEach((category: any) => {
                    let formatCategory = {
                        id: category?.id,
                        name: category?.name,
                        creationDate: category?.creationDate,
                        userFk: category?.userFk
                    }
                    _categories.push(formatCategory)
                });
                setCategories(_categories)
            })
        }
    }, [])

    useEffect(() => {
        sessionStorage.setItem("lastFavSearch", JSON.stringify({
            propertySearchResult,
            selectedLocation,
            pagination,
            searchOptions,
            selectedCategory
        }))
    }, [propertySearchResult, pagination, searchOptions, selectedCategory])

    //#region Eventos

    const handlePortalChanged = (portal : string) => {
        setSearchOptions({...searchOptions, portal, locationId: null, locationDbId: null, coordinates: null })
        setSelectedLocation(null)
        setPropertySearchResult([])
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

    const handleLocationSelectedChange = (event : any, newValue : { name: string, locationId: string } | null) => {
        setSelectedLocation(newValue)
        if (newValue?.name!) {
            let locationName = newValue!.name.split('/')[0].trim()
            let subTypeText = newValue!.name.split('/')[1].trim()
            const location = searchOptions.portal === "idealista" ? 
                idealistaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText) : 
                fotocasaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText)
            setSearchOptions({...searchOptions, locationDbId: location?.id, locationId: location?.locationId})
        } else {
            setSearchOptions({...searchOptions, locationDbId: null, locationId: null})
        }
    }

    const handleRemoveFavorite = (property: PropertySearchResult) => {
        let favProp = favoriteProperties.find((prop: FavoriteProperty) => prop.portal === searchOptions.portal && prop.propertyCode === property.propertyCode.toString())
        if (favProp) {
            callApi(removeFavoriteProperty(user?.id, favProp.id, favProp.comment, favProp.categoryId, favProp.notifications, favProp.notificationMessage)).then(() => {
                setFavoriteProperties(state => state.filter(prop => prop.id !== favProp.id))
                setPropertySearchResult(state => state.filter(prop => prop.propertyCode !== property.propertyCode))
                localStorage.setItem("favoriteProperties", JSON.stringify(favoriteProperties))

                if (property.linkToPortal.includes("idealista")) {
                    if (propertySearchResult.filter(item => item.ubication.locationId === property.ubication.locationId).length - 1 < 1) {
                        setFavoriteLocationsId(state => { return {...state, idealista: state.idealista.filter(item => item !== property.ubication.locationId)} })
                    }
                } else {
                    if (propertySearchResult.filter(item => item.ubication.locationId === property.ubication.locationId).length - 1 < 1) {
                        setFavoriteLocationsId(state => { return {...state, fotocasa: state.fotocasa.filter(item => item !== property.ubication.locationId)} })
                    }
                }
            })
        }
    }

    const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
        setPagination((state: any) => {
            return {...state, currentPage: value}
        })
    }

    const filterResult = () => {
        let filteredResult : PropertySearchResult[] = []

        if (searchOptions.portal === "idealista") {
            let idealistaFavs = favoriteProperties.filter((prop: FavoriteProperty) => prop.portal === "idealista")

            if (showCommentsOnly) {
                idealistaFavs = idealistaFavs.filter(item => item.comment.trim() !== "")
            }
            if (showUpdatedAds) {
                idealistaFavs = idealistaFavs.filter(item => item.notifications === 1)
            }
            if (showNotAvailableAds) {
                idealistaFavs = idealistaFavs.filter(item => item.notifications === -1)
            }
            if (selectedCategory) {
                idealistaFavs = idealistaFavs.filter(item => item.categoryId === selectedCategory.id)
            }
            filteredResult = idealistaFavs.map((favProp: FavoriteProperty) => {
                return formatIdealistaPropertyIntoPropertySearchResult(JSON.parse(favProp.rawData))
            })
        } else if (searchOptions.portal === "fotocasa") {
            let fotocasaFavs = favoriteProperties.filter((prop: FavoriteProperty) => prop.portal === "fotocasa")
            if (showCommentsOnly) {
                fotocasaFavs = fotocasaFavs.filter(item => item.comment.trim() !== "")
            }
            if (showUpdatedAds) {
                fotocasaFavs = fotocasaFavs.filter(item => item.notifications === 1)
            }
            if (showNotAvailableAds) {
                fotocasaFavs = fotocasaFavs.filter(item => item.notifications === -1)
            }
            if (selectedCategory) {
                fotocasaFavs = fotocasaFavs.filter(item => item.categoryId === selectedCategory.id)
            }
            filteredResult = fotocasaFavs.map((favProp: FavoriteProperty) => {
                return JSON.parse(favProp.rawData)
            })
        }

        filteredResult = filterFavoriteProperties(filteredResult, searchOptions)

        if (filteredResult.length === 0) {
            snackBar.showSnackBar("No tiene viviendas favoritas para estos filtros", "info", { vertical: "top", horizontal: "center" }, 3000)
        }

        setPropertySearchResult(filteredResult)
    }

    const onSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()
        filterResult()
    }

    //#endregion

    const GroupHeader = styled('div')(({ theme }) => ({
        padding: '5px 10px',
        fontSize: '0.90rem',
        fontWeight: 700,
    }));
    
    const GroupItems = styled('ul')({
        padding: 0,
    });

    const sortLocations = (locations: { name: string, locationId: string }[], favoriteLocationsId: string[]) => {
        return locations.sort((a, b) => {
            const aIsFavorite = favoriteLocationsId.includes(a.locationId);
            const bIsFavorite = favoriteLocationsId.includes(b.locationId);
    
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return a.name.localeCompare(b.name);
        });
    };

    const handleChangeSelectedCategory = (event: any, newValue: Category | null) => {
        setSelectedCategory(newValue)
    }

    const removeAllNotAvailableAds = () => {
        let _notAvailablefavProperties = favoriteProperties.filter(item => item.notifications === -1 && item.portal === searchOptions.portal)
        _notAvailablefavProperties.forEach(favProp => {
            let _formattedFavProp = favProp.portal === "idealista" ? formatIdealistaPropertyIntoPropertySearchResult(JSON.parse(favProp.rawData)) : JSON.parse(favProp.rawData)

            handleRemoveFavorite(_formattedFavProp)
        });
        setOpenConfirmationDialog(false)
    }

    return (
        <Box display="block" sx={{ ml: "1.5rem", mr: "1.5rem" }}>
            { user && 
                <Box display="flex" sx={{ mt: matches_1280 ? 'auto' : matches_1750 ? 'auto' : '0.50rem', flexDirection: "row", width: "100%" }}>
                    <Box onSubmit={onSubmit} component="form" sx={{ height: matches_2000 ? "54.25rem" : "51.00rem", width: matches_1280 ? "40%" : matches_1750 ? "26%" : "19%", display: "flex", flexDirection: "column", overflowY: "auto", my: "1.5rem" }}>
                        <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", height: matches_2000 ? "54rem" : "54rem", backgroundColor: "#de6ab80a", borderRadius: "1rem", border: "0.2rem solid #832756" }}>
                            <ButtonGroup fullWidth sx={{ mb: "0.5rem" }} variant='outlined' aria-label='portal-selector' color='primary'>
                                <Button sx={{ fontFamily: "Roboto", borderTopLeftRadius: "0.75rem", borderBottomLeftRadius: "0rem" }} variant={searchOptions.portal === "idealista" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("idealista")}} >{portalValues.idealista}</Button>
                                <Button sx={{ fontFamily: "Roboto", borderTopRightRadius: "0.75rem", borderBottomRightRadius: "0rem" }} variant={searchOptions.portal === "fotocasa" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("fotocasa")}}>{portalValues.fotocasa}</Button>
                            </ButtonGroup>
                            <FormGroup sx={{ mb: "0.5rem" }}>
                                <FormControlLabel control={<Checkbox size='small' checked={showCommentsOnly} onChange={() => setShowCommentsOnly(!showCommentsOnly)} />} 
                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }} >Solo con observaciones</Typography>} />
                                <FormControlLabel control={<Checkbox size='small' checked={showUpdatedAds} onChange={() => { 
                                    setShowUpdatedAds(!showUpdatedAds)
                                    setShowNotAvailableAds(false)
                                 }} />} 
                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }} >Solo actualizados</Typography>} />
                                <FormControlLabel control={<Checkbox size='small' checked={showNotAvailableAds} onChange={() => { 
                                    setShowNotAvailableAds(!showNotAvailableAds)
                                    setShowUpdatedAds(false)
                                 } } />} 
                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem", wordWrap: "break-word" }} >Solo no disponibles</Typography>} />
                            </FormGroup>
                            <RadioGroup defaultValue="sale" row aria-labelledby='property-type-radio' value={searchOptions.operation} onChange={handleOperationChanged}>
                                <FormControlLabel value="sale" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Comprar</Typography>} />
                                <FormControlLabel value="rent" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Alquilar</Typography>} />
                            </RadioGroup>
                            <TextField
                                select
                                label="Tipo de propiedad"
                                variant='standard'
                                disabled={searchOptions.portal === "fotocasa"}
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
                                        favoriteLocationsId[searchOptions.portal as keyof typeof favoriteLocationsId].includes(option.locationId) ? "Localizaciones en favorito" : "Otras"
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
                                            sortLocations(idealistaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, locationId: location.locationId } }), favoriteLocationsId[searchOptions.portal]) 
                                        :
                                        searchOptions.portal === "fotocasa" ? sortLocations(fotocasaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, locationId: location.locationId } }), favoriteLocationsId[searchOptions.portal]) : []}
                                    renderInput={(params) => <TextField {...params} name='' inputProps={{ ...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" } }}
                                    variant='standard' label="Localización" sx={{ fontFamily: "Roboto" }} 
                                        SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }} 
                                        />}
                                    ListboxProps={{ sx: { fontSize: "0.90rem" } }}
                                />
                                <Autocomplete
                                    disablePortal
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    size="small"
                                    id="category-selector"
                                    value={selectedCategory}
                                    onChange={handleChangeSelectedCategory}
                                    getOptionLabel={(option) => option.name}
                                    options={categories.sort((a, b) => (a.name > b.name) ? 1 : -1)}
                                    sx={{ width: "100%", fontFamily: "Roboto", mt: "0.50rem" }}
                                    renderInput={(params) => <TextField {...params} label="Categoría" inputProps={{...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" }}}
                                    variant="standard" sx={{ fontFamily: "Roboto" }}
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
                                <Box display="flex" sx={{ mt: "0rem", flexDirection: "column", overflow: "auto", height: matches_2000 ? "13rem" : "11rem" }}>
                                    <Accordion disableGutters sx={{ background: "#ffffff0a" }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography fontFamily="Roboto" sx={{ mb: "0.5rem", fontSize: "0.95rem", fontWeight: "bold" }}>
                                                Características
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
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
                                                    <Checkbox size='small' checked={searchOptions.searchCharacteristics.newConstruction} onChange={handleChangeCharacteristics} name='newConstruction' />
                                                }
                                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Obra nueva</Typography>}
                                                />
                                                <FormControlLabel control={
                                                    <Checkbox size='small' checked={searchOptions.searchCharacteristics.terrace} onChange={handleChangeCharacteristics} name='terrace' />
                                                }
                                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Terraza</Typography>}
                                                />
                                            </FormGroup>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box> 
                                <Box display="flex" sx={{ flexDirection: "column", mt: matches_2000 ? "3.5rem" : "2.25rem" }}>
                                    <Button
                                        size='medium'
                                        type="submit"
                                        color='primary'
                                        sx={{ borderRadius: "1rem", mb: "0.15rem" }}
                                        variant='contained'
                                    >
                                        Buscar
                                    </Button>
                                    {/* <Button
                                        size='medium'
                                        color='primary'
                                        sx={{ borderRadius: "1rem" }}
                                        variant='contained'
                                        onClick={() => setOpenHistoricSearch(true)}
                                        endIcon={<OpenInNewIcon sx={{ fontSize: "0.90rem" }} />}
                                    >
                                        Filtrar por búsqueda
                                    </Button> */}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    { propertySearchResult.length >= 1 && 
                        <Box sx={{ overflow: "auto", width: "100%", height: matches_2000 ? "54rem" : "50.75rem", ml: "1.5rem", my: "1.5rem", borderRadius: "1rem 0 0 1rem", border: "0.2rem solid #832756" }}>
                            { favoriteProperties.filter(item => item.portal === searchOptions.portal).find(item => item.notifications === -1) &&
                                <>
                                    <Button
                                        size="small"
                                        color="primary"
                                        sx={{ borderRadius: "1rem", textTransform: "none", mx: "1rem", mt: "1rem" }}
                                        variant="contained"
                                        endIcon={<DeleteTwoToneIcon />}
                                        onClick={() => setOpenConfirmationDialog(true)}
                                    >
                                        Eliminar todas las viviendas no disponibles
                                    </Button>
                                    <ConfirmationDialog
                                        confirmationAction={removeAllNotAvailableAds}
                                        confirmationText={`Esta acción es irreversible, eliminará todas las viviendas favoritas con anuncios no disponibles en ${searchOptions.portal === "idealista" ? "Idealista" : "Fotocasa"}, incluyendo todas las observaciones que puedan tener las viviendas`}
                                        openDialog={openConfirmationDialog}
                                        setOpenDialog={setOpenConfirmationDialog}
                                    />
                                </>
                            }
                            { propertySearchResult.map((property : PropertySearchResult) => {
                                return (
                                    <PropertySearchResultSummary 
                                        key={property.propertyCode}
                                        searchOptions={searchOptions} 
                                        handleAddFavorite={() => {}} 
                                        handleRemoveFavorite={handleRemoveFavorite}
                                        handleMarkAsNotInterested={() => {}}
                                        handleUnmarkAsNotInterested={() => {}}
                                        searchResult={property} 
                                        isFavorite={true}
                                        favoritePropertyData={favoriteProperties.find((favProp: FavoriteProperty) => favProp.portal === searchOptions.portal && favProp.propertyCode === property.propertyCode.toString())!}
                                        showNotInterested={false}
                                        isNotInterested={false}
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

export default FavoritePropertiesSearch