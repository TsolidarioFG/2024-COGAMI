import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Category, Location, PropertySearchResult, SearchParams, UserSearch } from "../../../types";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../shared/Utils/Utils";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import { useApi } from "../../../shared/Hooks/useApi";
import { addCategoryToSearch, getById } from "../../../api/categoryApi";
import CategorySelectorDialog from "../../../shared/components/CategorySelectorDialog/CategorySelectorDialog";
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog/ConfirmationDIalog";

interface Props {
    searchOptions: SearchParams,
    searchResult: UserSearch,
    handleFlagSearch(search: UserSearch): void,
    handleDeleteSearch(search: UserSearch): void,
    searchList: UserSearch[]
    setSearchList: Dispatch<SetStateAction<UserSearch[]>>,
    filteredList: UserSearch[],
    setFilteredList: Dispatch<SetStateAction<UserSearch[]>>,
    setOriginalCategories: Dispatch<SetStateAction<Category[]>>,
    filterList: (childrenSearchList: UserSearch[] | null) => void,
    containsFavProps: boolean,
    favProps: PropertySearchResult[] | null,
    locations: Location[]
}

const SearchHistoricResult : FC<Props> = ({ searchOptions, searchResult, searchList, setSearchList
    , filterList, filteredList, setFilteredList, handleFlagSearch, handleDeleteSearch, setOriginalCategories, containsFavProps, favProps, locations }) => {
    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const callApi = useApi()
    const navigate = useNavigate()
    const [categoryNameTitle, setCategoryNameTitle] = useState("Sin categoría")
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
    const [currentSearchResult, setCurrentSearchResult] = useState(searchResult)

    const getPropertyTypeName = (propertyType: string) => {
        return propertyType === "flat" ? "Piso" : propertyType === "house" ? "Casa" : propertyType === "studio" ? "Estudio" : "-"
    }

    const getCategoryName = (id: string | null) => {
        if (id) {
            callApi(getById(id)).then((result: any) => {
                setCategoryNameTitle(result?.name)
            })
        } else {
            return setCategoryNameTitle("Sin categoría")
        }
    }

    const confirmDeleteSearch = () => {
        handleDeleteSearch(searchResult)
        setOpenConfirmationDialog(false)
    }

    useEffect(() => {
        getCategoryName(searchResult.categoryId)
    }, [searchResult.categoryId])

    const renderTable = () => {
        return (
            <Table sx={{ borderBottom: "none" }}>
                <TableHead sx={{ backgroundColor: "#832756" }}>
                    <TableRow>
                        <TableCell sx={{ color: "white" }} align="center">Operacion</TableCell>
                        <TableCell sx={{ color: "white" }} align="center">Tipo vivienda</TableCell>
                        <TableCell sx={{ color: "white" }} align="center">Localización</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Precio mín. (€)</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Precio máx. (€)</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Tamaño mín. (m²)</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Tamaño máx. (m²)</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Nº Habitaciones</TableCell>
                        <TableCell sx={{ color: "white" }} align="right">Nº Baños</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderBottom: "none" }}>
                        <TableCell align="center">{searchResult.searchOptions.operation === "rent" ? "Alquiler" : "Comprar"}</TableCell>
                        <TableCell align="center">{getPropertyTypeName(searchResult.searchOptions.propertyType)}</TableCell>
                        <TableCell align="center">{searchResult.locationName}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.priceRange[0] === 0 ? '-' : searchResult.searchOptions.priceRange[0]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.priceRange[1] === 0 ? '-' : searchResult.searchOptions.priceRange[1]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.sizeRange[0] === 0 ? '-' : searchResult.searchOptions.sizeRange[0]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.sizeRange[1] === 0 ? '-' : searchResult.searchOptions.sizeRange[1]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.bedrooms === 0 ? '-' : searchResult.searchOptions.bedrooms}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.bathrooms === 0 ? '-' : searchResult.searchOptions.bathrooms}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )
    }

    const handleRedoSearch = () => {
        sessionStorage.setItem("lastSearch", JSON.stringify({
            propertySearchResult: null,
            selectedLocation: { name: searchResult.locationName, subTypeText: locations.find(item => item.locationId === searchResult.searchOptions.locationId)?.subTypeText , locationId: searchResult.searchOptions.locationId },
            searchCreatedId: searchResult.id,
            pagination: {
                totalPages: 0,
                totalElements: 0,
                currentPage: 1
            },
            searchOptions: searchResult.searchOptions,
            showNotInterested: null
        }))
        navigate("/accessible-search")
    }

    const handlePickSearchFavProps = () => {
        let _lastFavSearch = JSON.parse(sessionStorage.getItem("lastFavSearch")!)
        let _searchOptions = {
            portal: searchResult.searchOptions.portal,
            operation: searchResult.searchOptions.operation,
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
        _lastFavSearch = {..._lastFavSearch, propertySearchResult: favProps, searchOptions: _searchOptions, selectedLocation: null, selectedCategory: null}
        sessionStorage.setItem("lastFavSearch", JSON.stringify(_lastFavSearch))
        
        navigate("/accessible-search/favorite_properties")
    }

    const handleAssignCategoryToSearch = async (result: any, categoryId: string) => {
        callApi(addCategoryToSearch(categoryId, searchResult.id)).then(() => {
            let _searchList = searchList.map(item => item.id === result?.id ? {...item, categoryId} : item)
            let _filteredList = filteredList.map(item => item.id === result?.id ? {...item, categoryId} : item)
            setSearchList(_searchList)
            setFilteredList(_filteredList)
            setCurrentSearchResult(state => { return {...state, categoryId} })
            filterList(_searchList)
        })
    }

    return (
        <Box display="flex" sx={{ mx: "1rem", my: "1rem", py: "1rem", alignItems: "flex-start", flexDirection: "column",
            boxShadow: "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;", borderRadius: "1rem"}}
        >
            <Box display="flex" sx={{ width: "97%", mx: "1.25rem", alignItems: "center", justifyContent: "space-between" }}>
                <Box display="flex" sx={{ alignItems: "baseline" }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.35rem", mr: "0.75rem" }}>
                        {searchOptions.portal.charAt(0).toUpperCase() + searchOptions.portal.slice(1)}
                    </Typography>
                    <Typography>
                        {formatDate(searchResult.creationDate)}
                    </Typography>
                </Box>
                <Box display="flex" sx={{ flexDirection: "row" }}>
                    <Box display="flex" sx={{ flexDirection: "row"}}>
                        <Button sx={{ textTransform: "none" }} onClick={() => setOpenCategoryDialog(true)} startIcon={<CategoryIcon color="primary" sx={{ ml: "1rem" }} />}>
                            <Typography sx={{ fontSize: "0.90rem", fontWeight: "bold" }}>
                                {categoryNameTitle}
                            </Typography>
                        </Button>
                    </Box>
                    <Tooltip title="Fijar">
                        <Checkbox checked={searchResult.isFlagged} onChange={() => handleFlagSearch({...searchResult, isFlagged: !searchResult.isFlagged})} icon={<BookmarkBorderIcon />} checkedIcon={<BookmarkIcon />} />
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <>
                            <IconButton onClick={() => setOpenConfirmationDialog(true)}>
                                <DeleteOutlineIcon color="error" />
                            </IconButton>
                            <ConfirmationDialog
                                confirmationAction={confirmDeleteSearch}
                                confirmationText="Esta acción es irreversible y eliminará de tu historial esta búsqueda"
                                openDialog={openConfirmationDialog}
                                setOpenDialog={setOpenConfirmationDialog}
                            />
                        </>
                    </Tooltip>
                    <CategorySelectorDialog
                        existantCategoryId={currentSearchResult.categoryId}
                        openDialog={openCategoryDialog}
                        setOpenDialog={setOpenCategoryDialog}
                        setOriginalCategories={setOriginalCategories}
                        result={searchResult}
                        handleAssignCategory={handleAssignCategoryToSearch}
                    />
                </Box>
            </Box>
            <TableContainer component={Paper} sx={{ mt: "1rem" }}>
                { renderTable() }
            </TableContainer>
            <Box>
                <Box display="flex" sx={{ mx: "1rem", mt: "1rem", flexDirection: "column" }}>
                    <Typography fontFamily="Roboto" sx={{ mb: "0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                        Características
                    </Typography>
                    <FormGroup row>
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.ac} name='ac' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Aire acondicionado</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.elevator} name='elevator' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Ascensor</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.garage} name='garage' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Garaje</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.newConstruction} name='newConstruction' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Obra nueva</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small'disabled checked={searchResult.searchOptions.searchCharacteristics.terrace} name='terrace' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Terraza</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.storeRoom}  name='storeRoom' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Trastero</Typography>}
                        />
                        <FormControlLabel control={
                            <Checkbox size='small' disabled checked={searchResult.searchOptions.searchCharacteristics.groundFloor} name='groundFloor' />
                        }
                            label={<Typography color="grey" variant='body1' sx={{ fontSize: "0.90rem" }}>Planta baja</Typography>}
                        />
                    </FormGroup>
                </Box>
                <Box display="flex" sx={{ flexDirection: "row" }}>
                    <Button
                        size="small"
                        color="primary"
                        sx={{ borderRadius: "1rem", textTransform: "none", mx: "1rem", mt: "1rem" }}
                        variant="contained"
                        endIcon={<ReplayIcon />}
                        onClick={() => handleRedoSearch()}
                    >
                        Realizar búsqueda
                    </Button>
                    { containsFavProps &&
                        <Tooltip title="Tiene viviendas favoritas asociadas a esta búsqueda">
                            <Button
                                size="small"
                                color="primary"
                                sx={{ borderRadius: "1rem", textTransform: "none", mx: "0.5rem", mt: "1rem" }}
                                variant="contained"
                                endIcon={<SearchIcon />}
                                onClick={() => handlePickSearchFavProps()}
                            >
                                Consultar viviendas favoritas
                            </Button>
                        </Tooltip>
                    }
                </Box>
            </Box>


        </Box>
    )

    

}

export default SearchHistoricResult