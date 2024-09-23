import { Table, TableHead, Tooltip, TableRow, TableCell, TableBody, Box, Typography, Checkbox, IconButton, TableContainer, Paper, FormGroup, FormControlLabel, Button } from "@mui/material";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Category, FavoriteProperty, SearchParams, UserSearch } from "../../../types";
import { formatDate } from "../../../shared/Utils/Utils";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import { useApi } from "../../../shared/Hooks/useApi";
import { getById } from "../../../api/categoryApi";

interface Props {
    historicSearchOptions: SearchParams,
    searchResult: UserSearch,
    setSearchOptions: Dispatch<SetStateAction<SearchParams>>,
    favoriteProperties: FavoriteProperty[],
    setSelectedLocation: Dispatch<SetStateAction<{ name: string, locationId: string } | null>>,
    setSelectedCategory: Dispatch<SetStateAction<Category | null>>,
    onParentSubmit: (childSearchOptions: SearchParams | null) => void,
    handleClose: () => void
}

const FavoriteSearchByHistoricDialogResult : FC<Props> = ({ historicSearchOptions, searchResult, setSearchOptions, favoriteProperties,
    setSelectedLocation, setSelectedCategory, onParentSubmit, handleClose }) => {

    const [favoriteCount, setFavoriteCount] = useState<number>(0)
    const callApi = useApi()
    const [categoryNameTitle, setCategoryNameTitle] = useState("Sin categoría")

    useEffect(() => {
        let count = 0
        searchResult.properties.forEach(searchPropertyCode => {
            if (favoriteProperties.find(item => item.propertyCode === searchPropertyCode && item.portal === historicSearchOptions.portal)) {
                count++
            }
        })
        setFavoriteCount(count)
    }, [searchResult])

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
                        <TableCell align="right">{searchResult.searchOptions.priceRange[0]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.priceRange[1]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.sizeRange[0]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.sizeRange[1]}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.bedrooms}</TableCell>
                        <TableCell align="right">{searchResult.searchOptions.bathrooms}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )
    }

    const handlePickSearch = () => {
        setSearchOptions(searchResult.searchOptions)
        setSelectedLocation({ locationId: searchResult.searchOptions.locationId!, name: searchResult.locationName })
        setSelectedCategory(null)
        onParentSubmit(searchResult.searchOptions)
        handleClose()
    }

    return (
        <Box display="flex" sx={{ mx: "1rem", my: "1rem", py: "1rem", alignItems: "flex-start", flexDirection: "column",
            boxShadow: "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;", borderRadius: "1rem"}}
        >
            <Box display="flex" sx={{ width: "97%", mx: "1.25rem", alignItems: "center", justifyContent: "space-between" }}>
                <Box display="flex" sx={{ alignItems: "baseline" }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.25rem", mr: "0.75rem" }}>
                        {historicSearchOptions.portal.charAt(0).toUpperCase() + historicSearchOptions.portal.slice(1)}
                    </Typography>
                    <Typography>
                        {formatDate(searchResult.creationDate)}
                    </Typography>
                </Box>
                <Box display="flex" sx={{ flexDirection: "row" }}>
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center", mr: "1.20rem" }}>
                        <CategoryIcon color="primary" />
                        <Typography sx={{ fontSize: "0.90rem", fontWeight: "bold", ml: "0.5rem" }}>
                            {categoryNameTitle}
                        </Typography>
                    </Box>
                    { searchResult.isFlagged &&
                        <Box>
                            <Tooltip title="Fijada">
                                <BookmarkIcon color="primary" />
                            </Tooltip>
                        </Box>
                    }
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
                <Box display="flex" sx={{ flexDirection: "row", alignItems: "center", mt: "1rem" }}>
                    <Button
                        size="small"
                        type="submit"
                        color="primary"
                        sx={{ borderRadius: "1rem", textTransform: "none", mx: "1rem" }}
                        variant="contained"
                        onClick={() => handlePickSearch()}
                    >
                        Seleccionar
                    </Button>
                    { favoriteCount > 0 &&
                        <Box display="flex" sx={{ flexDirection: "row", alignItems: "flex-start", alignContent: "center" }}>
                            <InfoIcon color="action" sx={{ fontSize: "1.20rem" }} />
                            <Typography color="primary" sx={{ fontWeight: "bold", ml: "0.5rem", fontSize: "0.90rem" }}>
                                {`Tiene viviendas favoritas en esta búsqueda`}
                            </Typography>
                        </Box>
                    }
                </Box>
            </Box>


        </Box>
    )
}

export default FavoriteSearchByHistoricDialogResult