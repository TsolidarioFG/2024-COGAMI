import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useApi } from "../../../shared/Hooks/useApi";
import { useSnackBar } from "../../../shared/components/SnackBarContext";
import { Search, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, ButtonGroup, Checkbox, FormControlLabel, FormGroup, IconButton, InputAdornment, MenuItem, Pagination, Radio, RadioGroup, styled, TextField, Typography, useMediaQuery } from "@mui/material";
import { Category, FavoriteProperty, Location, PropertySearchResult, SearchParams, UserSearch } from "../../../types";
import { deleteSearch, flagSearch, getSearchsByUser } from "../../../api/searchHistoricApi";
import { filterUserSearch, formatDate, formatUserSearch } from "../../../shared/Utils/Utils";
import { getFotocasaLocations, getIdealistaLocations } from "../../../api/searchPropertiesApi";
import EuroIcon from '@mui/icons-material/Euro';
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchHistoricResult from "./SearchHistoricResult";
import { format } from "date-fns";
import { getUserCreatedCategories } from "../../../api/categoryApi";
import { getPropertyById, getUserFavoriteProperties } from "../../../api/propertyApi";
import { formatIdealistaPropertyIntoPropertySearchResult } from "../../../shared/Utils/IdealistaCallApiUtils";

type PaginationType = {
    totalElements: number,
    elementsPerPage: number,
    currentPage: number,
    maxPage: number
}

const SearchHistoric : FC = () => {
    const callApi = useApi()
    const snackBar = useSnackBar()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const matches_2000 = useMediaQuery('(min-width:2000px)')
    const matches_1280 = useMediaQuery('(max-width:1280px)')
    const [searchOptions, setSearchOptions] = useState<SearchParams>({
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

    const [dateSelected, setDateSelected] = useState<string>("")

    const originalPaginationState : PaginationType = {
        totalElements: 0,
        elementsPerPage: 5,
        currentPage: 1,
        maxPage: 1
    }

    const [pagination, setPagination] = useState<PaginationType>(originalPaginationState)
    const [searchList, setSearchList] = useState<UserSearch[]>([])
    const [filteredList, setFilteredList] = useState<UserSearch[]>([])
    const [searchListResult, setSearchListResult] = useState<UserSearch[]>([])

    const [selectedLocation, setSelectedLocation] = useState<{ name: string, subTypeText: string, locationId: string } | null>(null)
    const [idealistaLocations, setIdealistaLocations] = useState<Location[]>([])
    const [fotocasaLocations, setFotocasaLocations] = useState<Location[]>([])

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    const [flagged, setFlagged] = useState<boolean>(false)

    const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([])

    const portalValues = { idealista: "Idealista", fotocasa: "Fotocasa" }

    useEffect(() => {
        if (!user || !cookies?.authentication) {
            navigate("/login")
        } else {
            callApi(getSearchsByUser(user?.id)).then((result: any) => {
                let _result : UserSearch[] = []
                let _filteredList : UserSearch[] = []
                let _searchList : UserSearch[] = []
                let _totalElements = 0
                result.forEach((search: any) => {
                    let formattedSearch = formatUserSearch(search)
                    _searchList.push(formattedSearch)
                    if (formattedSearch.searchOptions.portal === "idealista" 
                        && formattedSearch.searchOptions.operation === "rent") {

                        _result.push(formattedSearch)
                        _filteredList.push(formattedSearch)
                        _totalElements++
                    }
                });
                // setSearchListResult(_result)
                setSearchList(_searchList)
                setFilteredList(_filteredList)
                setPagination(state => { return {...state, totalElements: _totalElements} })
                const startIndex = (pagination.currentPage - 1) * pagination.elementsPerPage;
                const endIndex = startIndex + pagination.elementsPerPage;
                setSearchListResult(_filteredList.slice(startIndex, endIndex))
            })
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
            callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
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
                        favoriteResult.push(formatFavProp)
                    })
                })
                setFavoriteProperties(favoriteResult)
            })
        }
        callApi(getIdealistaLocations()).then((locationsResult : Location[]) => {
            setIdealistaLocations(locationsResult)
        })
        callApi(getFotocasaLocations()).then((locationsResult : Location[]) => {
            setFotocasaLocations(locationsResult)
        })
    }, [])

    const checkIfSearchContainsFavProps = (search: UserSearch) : boolean => {
        let _favoriteProperties = favoriteProperties.filter(item => item.portal === search.searchOptions.portal)
        let result = false
        _favoriteProperties.forEach(favProp => {
            if (search.properties.find(item => item === favProp.propertyCode)) {
                result = true
            }
        });
        return result
    }

    const getFavPropsFromSearch = (search: UserSearch) : PropertySearchResult[] => {
        let _favoriteProperties = favoriteProperties.filter(item => item.portal === search.searchOptions.portal)
        let result : PropertySearchResult[] = []
        _favoriteProperties.forEach(favProp => {
            if (search.properties.find(item => item === favProp.propertyCode)) {
                result.push(search.searchOptions.portal === "idealista" ? formatIdealistaPropertyIntoPropertySearchResult(JSON.parse(favProp.rawData)) : JSON.parse(favProp.rawData))
            }
        });
        return result
    }

    const handlePortalChanged = (portal : string) => {
        setSearchOptions({...searchOptions, portal, locationId: null, locationDbId: null, coordinates: null })
        setSelectedLocation(null)
        setFilteredList([])
        setSearchListResult([])
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
        } else {
            setSearchOptions({...searchOptions, locationDbId: null, locationId: null})
        }
    }

    const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
        setPagination((state: any) => {
            return {...state, currentPage: value}
        })

    }

    const handleChangeSelectedCategory = (event: any, newValue: Category | null) => {
        setSelectedCategory(newValue)
    }

    useEffect(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.elementsPerPage;
        const endIndex = startIndex + pagination.elementsPerPage;
        setSearchListResult(filteredList.slice(startIndex, endIndex))
    }, [pagination.currentPage])

    const handleFlagSearch = (search: UserSearch) => {
        callApi(flagSearch(search.id, search.isFlagged)).then(() => {
            let _searchList = searchList.map(item => {
                if (search.id === item.id) {
                    return {...item, isFlagged: search.isFlagged}
                }

                return item
            })
            let _filteredList = filteredList.map(item => {
                if (search.id === item.id) {
                    return {...item, isFlagged: search.isFlagged}
                }

                return item
            })
            let _searchListResult = searchListResult.map(item => {
                if (search.id === item.id) {
                    return {...item, isFlagged: search.isFlagged}
                }

                return item
            })            
            setSearchList(_searchList)
            setFilteredList(_filteredList)
            setSearchListResult(_searchListResult)
        })
    }

    const handleDeleteSearch = (search: UserSearch) => {
        callApi(deleteSearch(search.id)).then(() => {
            let _searchList = searchList.filter(item => item.id !== search.id)
            let _filteredList = filteredList.filter(item => item.id !== search.id)
            let _searchListResult = searchListResult.filter(item => item.id !== search.id)
            setSearchList(_searchList)
            setFilteredList(_filteredList)
            setSearchListResult(_searchListResult)
            if (_searchListResult.length === 0) {
                setPagination(state => { return { ...state, currentPage: state.currentPage - 1 > 1 ? state.currentPage - 1 : 1 } })
            }
        })
    }

    const filterResult = (childrenSearchList: UserSearch[] | null) => {
        setPagination(originalPaginationState)
        let _pagination = originalPaginationState
        let _searchList = searchList

        if (childrenSearchList) {
            _searchList = childrenSearchList
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

        let filteredResult : UserSearch[] = []

        if (searchOptions.portal === "idealista") {
            let idealistaSearches = _searchList.filter((search: UserSearch) => search.searchOptions.portal === "idealista")
            if (flagged) {
                idealistaSearches = idealistaSearches.sort((a, b) => {
                    return (a.isFlagged === b.isFlagged) ? 0 : a.isFlagged ? -1 : 1
                })
            }
            if (selectedCategory) {
                idealistaSearches = idealistaSearches.filter(item => item.categoryId === selectedCategory.id)
            }
            filteredResult = idealistaSearches
        } else {
            let fotocasaSearches = _searchList.filter((search: UserSearch) => search.searchOptions.portal === "fotocasa")
            if (flagged) {
                fotocasaSearches = fotocasaSearches.sort((a, b) => {
                    return (a.isFlagged === b.isFlagged) ? 0 : a.isFlagged ? -1 : 1
                })
            }
            if (selectedCategory) {
                fotocasaSearches = fotocasaSearches.filter(item => item.categoryId === selectedCategory.id)
            }
            filteredResult = fotocasaSearches
        }
        filteredResult = filterUserSearch(filteredResult, searchOptions)
        if (dateSelected !== "") {
            const tempDate = new Date(dateSelected)
            filteredResult = filteredResult.filter(item => formatDate(item.creationDate) === formatDate(tempDate.toString()))
        }
        setFilteredList(filteredResult)
        const startIndex = (_pagination.currentPage - 1) * _pagination.elementsPerPage;
        const endIndex = startIndex + _pagination.elementsPerPage;
        setSearchListResult(filteredResult.slice(startIndex, endIndex))

        if (filteredResult.length === 0) {
            snackBar.showSnackBar("No se han encontrado búsquedas con estos filtros", "info", { vertical: "top", horizontal: "center" }, 3000)
        }
    }

    const onSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()
        filterResult(null)

    }

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
                    <Box onSubmit={onSubmit} component="form" sx={{ width: matches_1280 ? "40%" : matches_1750 ? "26%" : "19%", display: "flex", flexDirection: "column", overflowY: "auto", my: "1.5rem" }}>
                        <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", height: matches_2000 ? "54rem" : "50.75rem", backgroundColor: "#de6ab80a", borderRadius: "1rem", border: "0.2rem solid #832756" }}>
                            <ButtonGroup fullWidth sx={{ mb: "0.5rem" }} variant='outlined' aria-label='portal-selector' color='primary'>
                                <Button sx={{ fontFamily: "Roboto", borderTopLeftRadius: "0.75rem", borderBottomLeftRadius: "0rem" }} variant={searchOptions.portal === "idealista" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("idealista")}} >{portalValues.idealista}</Button>
                                <Button sx={{ fontFamily: "Roboto", borderTopRightRadius: "0.75rem", borderBottomRightRadius: "0rem" }} variant={searchOptions.portal === "fotocasa" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("fotocasa")}}>{portalValues.fotocasa}</Button>
                            </ButtonGroup>
                            <RadioGroup defaultValue="sale" row aria-labelledby='property-type-radio' value={searchOptions.operation} onChange={handleOperationChanged}>
                                <FormControlLabel value="sale" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Comprar</Typography>} />
                                <FormControlLabel value="rent" control={<Radio size='small' />} label={<Typography sx={{ fontFamily: "Roboto", fontSize: "0.90rem" }}>Alquilar</Typography>} />
                            </RadioGroup>
                            <FormControlLabel control={<Checkbox size='small' checked={flagged} onChange={() => setFlagged(!flagged)} />} 
                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }} >Mostrar fijadas primero</Typography>} />
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
                            <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", width: "70%", mx: "1.25rem", mb: "0.75rem" }}>
                                <Autocomplete 
                                    disablePortal 
                                    size='small'
                                    isOptionEqualToValue={(option, value) => option.locationId === value.locationId}
                                    value={selectedLocation}
                                    onChange={handleLocationSelectedChange}
                                    sx={{ width: "100%", fontFamily: "Roboto" }}
                                    id='locations-combo'
                                    groupBy={(option) => (
                                        option.subTypeText
                                    )}
                                    disabled={searchOptions.portal === "" || (searchOptions.coordinates !== null)}
                                    getOptionLabel={(option) => option.name}
                                    renderGroup={(params) => {
                                        return (
                                            <li key={params.key}>
                                                <GroupHeader>{params.group}</GroupHeader>
                                                <GroupItems>{params.children}</GroupItems>
                                            </li>
                                        )
                                    }}
                                    options={
                                        searchOptions.portal === "idealista" ? 
                                            idealistaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, subTypeText: location.subTypeText, locationId: location.locationId } })
                                        :

                                        searchOptions.portal === "fotocasa" ? fotocasaLocations.map((location : Location) => { return { name: `${location.name} / ${location.subTypeText}`, subTypeText: location.subTypeText, locationId: location.locationId } }) : []}
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
                            <Box display="flex" sx={{ width: "80%", mt: "0.5rem" }}>
                                <TextField
                                    label="Fecha creación"
                                    variant="outlined"
                                    size="small"
                                    type="date"
                                    value={dateSelected}
                                    sx={{ width: "100%" }}
                                    onChange={(event) => setDateSelected(event.target.value)}
                                    InputProps={{ sx: { fontSize: "0.90rem" } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <IconButton aria-label="delete-date" disabled={dateSelected === ""} onClick={() => setDateSelected("")}>
                                    <CloseIcon sx={{ fontSize: "1.20rem" }} />
                                </IconButton>
                            </Box>
                            <Box display="flex" sx={{ flexDirection: "column", mt: "1rem", mx: "1.25rem" }}>
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
                                <Box display="flex" sx={{ mt: "0rem", flexDirection: "column", overflow: "auto", height: "15rem" }}>
                                    <Accordion disableGutters sx={{ backgroundColor: "#ffffff0a" }}>
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
                                                    <Checkbox size='small' checked={searchOptions.searchCharacteristics.garage} onChange={handleChangeCharacteristics} name='garage' />
                                                }
                                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Garaje</Typography>}
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
                                                    <Checkbox size='small' checked={searchOptions.searchCharacteristics.storeRoom} onChange={handleChangeCharacteristics} name='storeRoom' />
                                                }
                                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Trastero</Typography>}
                                                />
                                                <FormControlLabel control={
                                                    <Checkbox size='small' checked={searchOptions.searchCharacteristics.groundFloor} onChange={handleChangeCharacteristics} name='groundFloor' />
                                                }
                                                    label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Planta baja</Typography>}
                                                />
                                            </FormGroup>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box> 
                                <Button
                                    type='submit'
                                    size='medium'
                                    color='primary'
                                    sx={{ borderRadius: "1rem", mt: matches_2000 ? "3rem" : "0.5rem", mb: "0rem" }}
                                    variant='contained'
                                >
                                    Buscar
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    { searchListResult.length >= 1 && 
                        <Box sx={{ overflow: "auto", width: "80%", height: matches_2000 ? "54rem" : "50.75rem", ml: "1.5rem", my: "1.5rem", borderRadius: "1rem 0 0 1rem", border: "0.2rem solid #832756" }}>
                            { searchListResult.map((search : UserSearch, index: number) => {
                                return (
                                    <SearchHistoricResult
                                        searchOptions={searchOptions}
                                        searchResult={search}
                                        searchList={searchList}
                                        setSearchList={setSearchList}
                                        filteredList={filteredList}
                                        setFilteredList={setFilteredList}
                                        filterList={filterResult}
                                        handleFlagSearch={handleFlagSearch}
                                        handleDeleteSearch={handleDeleteSearch}
                                        setOriginalCategories={setCategories}
                                        containsFavProps={checkIfSearchContainsFavProps(search)}
                                        favProps={checkIfSearchContainsFavProps(search) ? getFavPropsFromSearch(search) : null}
                                        locations={search.searchOptions.portal === "idealista" ? idealistaLocations : fotocasaLocations}
                                        key={index}
                                    />
                                ) 
                            }) }
                            { Math.ceil(filteredList.length / pagination.elementsPerPage) > 1 &&
                                <Box display="flex" sx={{ justifyContent: "center", alignItems: "center", mb: "1rem" }}>
                                    <Pagination 
                                        count={Math.ceil(filteredList.length / pagination.elementsPerPage)}
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

export default SearchHistoric