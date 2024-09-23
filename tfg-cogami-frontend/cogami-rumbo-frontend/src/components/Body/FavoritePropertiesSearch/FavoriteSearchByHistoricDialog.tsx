import { Autocomplete, Box, Button, ButtonGroup, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, IconButton, InputAdornment, MenuItem, Pagination, Radio, RadioGroup, Slide, TextField, Typography, useMediaQuery } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ChangeEvent, Dispatch, FC, forwardRef, SetStateAction, useEffect, useState } from "react";
import { useApi } from "../../../shared/Hooks/useApi";
import { useSnackBar } from "../../../shared/components/SnackBarContext";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Category, FavoriteProperty, Location, SearchParams, UserSearch } from "../../../types";
import EuroIcon from '@mui/icons-material/Euro';
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CloseIcon from '@mui/icons-material/Close';
import { getSearchsByUser } from "../../../api/searchHistoricApi";
import { filterUserSearch, formatDate, formatUserSearch } from "../../../shared/Utils/Utils";
import { getFotocasaLocations, getIdealistaLocations } from "../../../api/searchPropertiesApi";
import FavoriteSearchByHistoricDialogResult from "./FavoriteSearchByHistoricDialogResult";
import { getUserCreatedCategories } from "../../../api/categoryApi";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    searchOptions: SearchParams,
    favoriteProperties: FavoriteProperty[],
    setSearchOptions: Dispatch<SetStateAction<SearchParams>>,
    setOriginalSelectedLocation: Dispatch<SetStateAction<{ name: string, locationId: string } | null>>,
    setFavoritePropCategory: Dispatch<SetStateAction<Category | null>>,
    onParentSubmit: (childSearchOptions: SearchParams | null) => void;
}

type PaginationType = {
    totalElements: number,
    elementsPerPage: number,
    currentPage: number,
    maxPage: number
}

const FavoriteSearchByHistoricDialog : FC<Props> = ({ open, setOpen, searchOptions, favoriteProperties, setSearchOptions
    , setOriginalSelectedLocation, setFavoritePropCategory, onParentSubmit }) => {

    const originalHistoricSearchOptions: SearchParams = {
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
    }

    const handleCloseDialog = () => {
        setHistoricSearchOptions(originalHistoricSearchOptions)
        setSelectedLocation(null)
        setFilteredList([])
        setSearchListResult([])
        setPagination(originalPaginationState)
        setSelectedCategory(null)
        setOpen(false)
    }

    const callApi = useApi()
    const snackBar = useSnackBar()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const matches_2000 = useMediaQuery('(min-width:2000px)')
    const matches_1280 = useMediaQuery('(max-width:1280px)')

    const [historicSearchOptions, setHistoricSearchOptions] = useState<SearchParams>(originalHistoricSearchOptions)

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

    const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
    const [idealistaLocations, setIdealistaLocations] = useState<Location[]>([])
    const [fotocasaLocations, setFotocasaLocations] = useState<Location[]>([])

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    const [flagged, setFlagged] = useState<boolean>(false)

    const portalValues = { idealista: "Idealista", fotocasa: "Fotocasa" }

    useEffect(() => {
        if (!user || !cookies?.authentication) {
            navigate("/login")
        } else {
            callApi(getSearchsByUser(user?.id)).then((result: any) => {
                let _searchList : UserSearch[] = []
                let _result : UserSearch[] = []
                let _filteredList : UserSearch[] = []
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
                setSearchList(_searchList)
                // setSearchListResult(_result)
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
        }
        callApi(getIdealistaLocations()).then((locationsResult : Location[]) => {
            setIdealistaLocations(locationsResult)
        })
        callApi(getFotocasaLocations()).then((locationsResult : Location[]) => {
            setFotocasaLocations(locationsResult)
        })
    }, [open])

    useEffect(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.elementsPerPage;
        const endIndex = startIndex + pagination.elementsPerPage;
        setSearchListResult(filteredList.slice(startIndex, endIndex))
    }, [pagination.currentPage])

    const handlePortalChanged = (portal : string) => {
        setHistoricSearchOptions({...historicSearchOptions, portal, locationId: null, locationDbId: null, coordinates: null })
        setSelectedLocation(null)
        setFilteredList([])
        setSearchListResult([])
        setPagination(originalPaginationState)
    }

    const handleOperationChanged = (event : ChangeEvent<HTMLInputElement>) => {
        setHistoricSearchOptions({...historicSearchOptions, operation: event.target.value})
    }

    const handleChangePropertyType = (event: ChangeEvent<HTMLInputElement>) => {
        setHistoricSearchOptions({...historicSearchOptions, propertyType: event.target.value})
    }

    const handleChangePriceRange = (event : ChangeEvent<HTMLInputElement>, position : number) => {
        if (!Number.isNaN(event.target.value)) {
            let range = historicSearchOptions.priceRange
            range[position] = parseFloat(event.target.value === "" ? "0" : event.target.value)
            setHistoricSearchOptions({...historicSearchOptions, priceRange: range})
        }
    }

    const handleChangeSizeRange = (event : ChangeEvent<HTMLInputElement>, position : number) => {
        if (!Number.isNaN(event.target.value)) {
            let range = historicSearchOptions.sizeRange
            range[position] = parseFloat(event.target.value === "" ? "0" : event.target.value)
            setHistoricSearchOptions({...historicSearchOptions, sizeRange: range})
        }
    }

    const handleChangeBedOrBath = (event : ChangeEvent<HTMLInputElement>, type : string) => {
        if (!Number.isNaN(event.target.value)) {
            setHistoricSearchOptions({...historicSearchOptions, [type]: event.target.value === "" ? 0 : parseInt(event.target.value)})
        }
    }

    const handleChangeCharacteristics = (event : ChangeEvent<HTMLInputElement>) => {
        setHistoricSearchOptions({...historicSearchOptions, searchCharacteristics: {...historicSearchOptions.searchCharacteristics, [event.target.name]: event.target.checked}})
    }

    const handleLocationSelectedChange = (event : any, newValue : string | null) => {
        setSelectedLocation(newValue)
        if (newValue) {
            let locationName = newValue.split('/')[0].trim()
            let subTypeText = newValue.split('/')[1].trim()
            const location = historicSearchOptions.portal === "idealista" ? 
                idealistaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText) : 
                fotocasaLocations.find(location => location.name === locationName && location.subTypeText === subTypeText)
            setHistoricSearchOptions({...historicSearchOptions, locationDbId: location?.id, locationId: location?.locationId})
        } else {
            setHistoricSearchOptions({...historicSearchOptions, locationDbId: null, locationId: null})
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

    const onSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()

        let _pagination = originalPaginationState
        setPagination(originalPaginationState)

        let filteredResult : UserSearch[] = []

        if (historicSearchOptions.portal === "idealista") {
            let idealistaSearches = searchList.filter((search: UserSearch) => search.searchOptions.portal === "idealista")
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
            let fotocasaSearches = searchList.filter((search: UserSearch) => search.searchOptions.portal === "fotocasa")
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
        filteredResult = filterUserSearch(filteredResult, historicSearchOptions)
        if (dateSelected !== "") {
            const tempDate = new Date(dateSelected)
            filteredResult = filteredResult.filter(item => formatDate(item.creationDate) === formatDate(tempDate.toString()))
        }
        setFilteredList(filteredResult)
        const startIndex = (_pagination.currentPage - 1) * _pagination.elementsPerPage;
        const endIndex = startIndex + _pagination.elementsPerPage;
        setSearchListResult(filteredResult.slice(startIndex, endIndex))
    }

    return (
        <Dialog
            fullWidth
            TransitionComponent={Transition}
            maxWidth="xl"
            open={open}
            onClose={handleCloseDialog}
        >
            <DialogTitle>Filtrar por búsqueda</DialogTitle>
            <DialogContent>
                { user &&
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                        <Box display="flex" sx={{ alignItems: "center" }}>
                            <ButtonGroup size="medium" variant='outlined' aria-label='portal-selector' color='primary' sx={{ width: "20%", height: "40%", mt: "0.5rem", mr: "1rem" }}>
                                <Button fullWidth sx={{ fontFamily: "Roboto" }} variant={historicSearchOptions.portal === "idealista" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("idealista")}} >{portalValues.idealista}</Button>
                                <Button fullWidth sx={{ fontFamily: "Roboto" }} variant={historicSearchOptions.portal === "fotocasa" ? 'contained' : 'outlined'} onClick={() => {handlePortalChanged("fotocasa")}}>{portalValues.fotocasa}</Button>
                            </ButtonGroup>
                            <Box display="flex" sx={{ alignItems: "center", width: "20%", mt: "0.5rem", ml: "1rem" }}>
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
                            <Autocomplete
                                    disablePortal
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    size="small"
                                    id="category-selector"
                                    value={selectedCategory}
                                    onChange={handleChangeSelectedCategory}
                                    getOptionLabel={(option) => option.name}
                                    options={categories}
                                    sx={{ width: "25%", fontFamily: "Roboto", ml: "1.20rem" }}
                                    renderInput={(params) => <TextField {...params} label="Categoría" inputProps={{...params.inputProps, style: { fontFamily: "Roboto", fontSize: "1rem" }}}
                                    variant="standard" sx={{ fontFamily: "Roboto" }}
                                        SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }}
                                    />}
                                    ListboxProps={{ sx: { fontSize: "1rem" } }}
                                />
                        </Box>
                        <Box display="flex" sx={{ flexDirection: "row" }}>
                            <Box display="flex" component="form" onSubmit={onSubmit} 
                                sx={{ flexDirection: "column", alignItems: "center", backgroundColor: "#de6ab80a", borderRadius: "1rem", border: "0.2rem solid #832756",
                                    width: "20%", mt: "0.5rem", height: matches_2000 ? "48rem" : "45.5rem"
                                }}
                            >
                                <RadioGroup defaultValue="sale" row aria-labelledby='property-type-radio' value={historicSearchOptions.operation} onChange={handleOperationChanged}>
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
                                        value={selectedLocation}
                                        onChange={handleLocationSelectedChange}
                                        sx={{ width: "100%", fontFamily: "Roboto" }}
                                        id='locations-combo'
                                        disabled={historicSearchOptions.portal === "" || (historicSearchOptions.coordinates !== null)}
                                        options={historicSearchOptions.portal === "idealista" ? idealistaLocations.map((location : Location) => { return `${location.name} / ${location.subTypeText}` }) :
                                        historicSearchOptions.portal === "fotocasa" ? fotocasaLocations.map((location : Location) => { return `${location.name} / ${location.subTypeText}` }) : []}
                                        renderInput={(params) => <TextField {...params} name='' inputProps={{ ...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" } }}
                                        variant='standard' label="Localización" sx={{ fontFamily: "Roboto" }} 
                                            SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }}
                                            InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "0.90rem"} }} 
                                            />}
                                        ListboxProps={{ sx: { fontSize: "0.90rem" } }}
                                    />
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
                                            InputProps={{ inputProps: { step: 0.5, min: 0, max: historicSearchOptions.priceRange[1] === 0 ? 500000 : historicSearchOptions.priceRange[1] }, startAdornment: (
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
                                            InputProps={{ inputProps: { step: 0.5, min: historicSearchOptions.priceRange[0]}, startAdornment: (
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
                                            InputProps={{ inputProps: { step: 0.5, min: 0, max: historicSearchOptions.sizeRange[1] }, startAdornment: (
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
                                            InputProps={{ inputProps: { step: 0.5, min: historicSearchOptions.sizeRange[0] }, startAdornment: (
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
                                    <Box display="flex" sx={{ mt: "0rem", flexDirection: "column" }}>
                                        <Typography fontFamily="Roboto" sx={{ mb: "0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                                            Características
                                        </Typography>
                                        <FormGroup>
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.ac} onChange={handleChangeCharacteristics}  name='ac' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Aire acondicionado</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.elevator} onChange={handleChangeCharacteristics} name='elevator' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Ascensor</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.garage} onChange={handleChangeCharacteristics} name='garage' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Garaje</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.newConstruction} onChange={handleChangeCharacteristics} name='newConstruction' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Obra nueva</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.terrace} onChange={handleChangeCharacteristics} name='terrace' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Terraza</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.storeRoom} onChange={handleChangeCharacteristics} name='storeRoom' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Trastero</Typography>}
                                            />
                                            <FormControlLabel control={
                                                <Checkbox size='small' checked={historicSearchOptions.searchCharacteristics.groundFloor} onChange={handleChangeCharacteristics} name='groundFloor' />
                                            }
                                                label={<Typography variant='body1' sx={{ fontSize: "0.90rem" }}>Planta baja</Typography>}
                                            />
                                        </FormGroup>
                                    </Box> 
                                    <Button
                                        type='submit'
                                        size='medium'
                                        color='primary'
                                        sx={{ borderRadius: "1rem", mt: matches_2000 ? "3rem" : "0.5rem", mb: "1rem" }}
                                        variant='contained'
                                    >
                                        Filtrar
                                    </Button>
                                </Box>
                            </Box>
                            { searchListResult.length >= 1 &&
                                <Box sx={{ overflow: "auto", width: "80%", height: matches_2000 ? "48rem" : "45.5rem", ml: "1.5rem",
                                    mt: "0.5rem", borderRadius: "1rem 0 0 1rem", border: "0.2rem solid #832756" }}
                                >
                                    { searchListResult.map((search: UserSearch, index: number) => {
                                        return (
                                            <FavoriteSearchByHistoricDialogResult
                                                historicSearchOptions={historicSearchOptions}
                                                searchResult={search}
                                                setSearchOptions={setSearchOptions}
                                                favoriteProperties={favoriteProperties}
                                                setSelectedLocation={setOriginalSelectedLocation}
                                                setSelectedCategory={setFavoritePropCategory}
                                                handleClose={handleCloseDialog}
                                                onParentSubmit={onParentSubmit}
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
                    </Box>
                }
            </DialogContent>

        </Dialog>
    )
}

export default FavoriteSearchByHistoricDialog