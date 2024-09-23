import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Link, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { FavoriteProperty, PropertySearchResult, SearchParams } from "../../../types";
import BedIcon from '@mui/icons-material/Bed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DoNotDisturbOffIcon from '@mui/icons-material/DoNotDisturbOff';
import { useEffect, useState } from "react";
import ImageDialogViewer from "../../../shared/components/ImageDialogViewer/ImageDialogViewer";
import { translateImagesTags } from "../../../shared/Utils/Utils";
import TagSection from "./TagSection";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../shared/Hooks/useApi";
import { getById } from "../../../api/categoryApi";
import ImageNotFound from "../../../assets/512px-Image_not_available.png"
import ReportTwoToneIcon from '@mui/icons-material/ReportTwoTone';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog/ConfirmationDIalog";
import React from "react";

interface Props {
    searchOptions: SearchParams,
    searchResult: PropertySearchResult,
    handleAddFavorite(property: PropertySearchResult): void,
    handleRemoveFavorite(property: PropertySearchResult): void,
    handleMarkAsNotInterested(property: PropertySearchResult): void,
    handleUnmarkAsNotInterested(property: PropertySearchResult): void,
    isFavorite: boolean,
    favoritePropertyData: FavoriteProperty | null,
    showNotInterested: boolean
    isNotInterested: boolean
}

const PropertySearchResultSummary : React.FC<Props> = ({ searchOptions, searchResult, handleRemoveFavorite, handleAddFavorite, 
    handleMarkAsNotInterested, handleUnmarkAsNotInterested, isFavorite, favoritePropertyData, showNotInterested, isNotInterested }) => {

    const matches_1750 = useMediaQuery('(max-width:1750px)')
    const callApi = useApi()

    const navigate = useNavigate()

    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
    const [showFavorite, setShowFavorite] = useState(true)
    const [categoryNameTitle, setCategoryNameTitle] = useState("Sin categoría")

    const handleOpenDialog = () => {
        setOpenImageDialog(true)
    }

    const handleNavigateToDetail = () => {
        localStorage.setItem(searchOptions.portal === "fotocasa" ? 'fotocasaLastProperty' : 'idealistaLastProperty', JSON.stringify(searchResult))
        navigate(`/accessible-search/${searchOptions.portal}/${searchResult.propertyCode}/${searchOptions.operation}`)
    }

    const getCategoryName = (id: string) => {
        callApi(getById(id)).then((result: any) => {
            setCategoryNameTitle(result?.name)
        })
    }

    const confirmRemoveFavorite = () => {
        handleRemoveFavorite(searchResult)
        setShowFavorite(true)
    }

    useEffect(() => {
        if (isFavorite && favoritePropertyData) {
            getCategoryName(favoritePropertyData?.categoryId!)
        }
    }, [favoritePropertyData])


    const showProp = isNotInterested === false || (showNotInterested && isNotInterested)

    return (
        <Box display={ showProp ? "flex" : "none" } sx={{ mx: "1rem", my: "1rem", alignItems: "flex-start",
            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;", borderRadius: "1rem", border: isNotInterested ? "0.2rem solid red" : favoritePropertyData?.notifications === -1 ? "0.2rem solid #d13257" : "unset" }}
        >
            <Box display="block" aria-label="img" 
                sx={{ verticalAlign: "bottom", height: "280px", minWidth: "340px", width: "340px", mx: "0.45rem", my: "0.45rem",
                    borderRadius: "0.75rem", cursor: searchOptions.portal === "fotocasa" && searchResult.images.length !== 0 ? "pointer" : "auto" }}
                onClick={searchOptions.portal === "fotocasa" ? handleOpenDialog : () => {}}
                component="img" alt={!searchResult?.images ? "Imágenes no encontradas" : translateImagesTags(searchResult?.images[0]?.roomType ?? "Imagen de la vivienda no disponible")} 
                src={!searchResult.images ? ImageNotFound : searchResult?.images[0]?.url ?? ImageNotFound}
            />
            { searchOptions.portal === "fotocasa" && searchResult.images.length !== 0 &&
                <ImageDialogViewer images={searchResult.images} openDialog={openImageDialog} setOpenDialog={setOpenImageDialog} />
            } 
            <Box display="flex" sx={{ flexDirection: "column", width: "80%" }}>
                <Box display="flex" sx={{ justifyContent: "space-between", alignItems: "center", mx: "1rem" }}>
                    <Button sx={{ textTransform: "none", paddingLeft: "unset" }} variant="text" endIcon={<KeyboardDoubleArrowRightIcon />} 
                        onClick={handleNavigateToDetail}
                    >
                        <Typography color="primary" sx={{ fontWeight: "bold", fontSize: "1.35rem" }}>
                            {searchResult.title}
                        </Typography>
                    </Button>
                    <Box display="flex" sx={{ flexDirection: "row", justifyContent: "flex-end" }}>
                        { 
                        isNotInterested ?
                            <Box>
                                <Button sx={{ textTransform: "none"}} startIcon={<DoNotDisturbOffIcon sx={{ fontSize: "0.80rem" }} />} 
                                onClick={() => {
                                    handleUnmarkAsNotInterested(searchResult)
                                }}
                                >
                                    <Typography sx={{ fontSize: "0.80rem" }}>Desmarcar no me interesa</Typography>
                                </Button>
                            </Box> 
                        :
                        !isFavorite ?
                            <Box>
                                <Button 
                                    sx={{ textTransform: "none", mr: "1rem"}} 
                                    startIcon={<NotInterestedIcon sx={{ fontSize: "0.80rem" }} />}
                                    onClick={() => { handleMarkAsNotInterested(searchResult) }}
                                >
                                    <Typography sx={{ fontSize: "0.80rem" }}>No me interesa</Typography>
                                </Button>
                                <Button sx={{ textTransform: "none"}} startIcon={<FavoriteBorderIcon sx={{ fontSize: "0.80rem" }} />}
                                onClick={() => {
                                    handleAddFavorite(searchResult)
                                    setShowFavorite(false)
                                }}
                                >
                                    <Typography sx={{ fontSize: "0.80rem" }}>Añadir a favoritos</Typography>
                                </Button>
                            </Box>
                            :
                            <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                                <Box display="flex" sx={{ flexDirection: "row", mr: "0.75rem" }}>
                                    <CategoryIcon color="primary" sx={{ fontSize: "1.20rem", ml: "0.75rem" }} />
                                    <Typography sx={{ fontSize: "0.80rem", ml: "0.5rem" }}>{categoryNameTitle}</Typography>
                                </Box>
                                <Button sx={{ textTransform: "none"}} startIcon={<FavoriteIcon sx={{ fontSize: "0.80rem" }} />} 
                                onClick={() => {
                                    setOpenConfirmationDialog(true)
                                }}
                                >
                                    <Typography sx={{ fontSize: "0.80rem" }}>Eliminar de favoritos</Typography>
                                </Button>
                                <ConfirmationDialog
                                    confirmationAction={confirmRemoveFavorite}
                                    confirmationText="Esta acción es irreversible y eliminará la vivienda de favoritos, incluyendo las observaciones asociadas a la vivienda"
                                    openDialog={openConfirmationDialog}
                                    setOpenDialog={setOpenConfirmationDialog}
                                />
                            </Box>
                        }
                    </Box>
                </Box>
                <Box display="flex" sx={{ flexDirection: "row" }}>
                    <Box display="flex" sx={{ width: "80%", maxWidth: "90%", ml: "1rem", mr: "1rem", flexDirection: "column", alignContent: "center", alignItems: "flex-start", my: "0.45rem" }}>
                        <Stack spacing={matches_1750 ? 1.5 : favoritePropertyData?.notifications === -1 || favoritePropertyData?.notifications === 1 ? 1.5 : 2} divider={<Divider orientation="horizontal" flexItem />}>
                            <Typography sx={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                                {searchResult.price}
                            </Typography>
                            <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                                <BedIcon sx={{ fontSize: "1.20rem" }} />
                                <Typography sx={{ ml: "0.5rem" }}>
                                    {`${searchResult.bedrooms} hab.`}
                                </Typography>
                            </Box>
                            <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                                <SquareFootIcon sx={{ fontSize: "1.20rem" }} />
                                <Typography sx={{ ml: "0.5rem" }}>
                                    {`${searchResult.size}`}
                                </Typography>
                            </Box>
                            <Link underline="none" target="_blank" rel="noopener" href={searchResult.linkToPortal} sx={{ fontWeight: 550 }} variant="body1">
                                { searchResult.linkToPortal.includes("idealista") ? "Enlace a Idealista" : "Enlace a Fotocasa" }
                            </Link>
                            { favoritePropertyData?.notifications === -1 &&
                                <Tooltip title={`El anuncio no se encuentra diponible en ${favoritePropertyData.portal === "idealista" ? "Idealista" : "Fotocasa"}`}>
                                    <Box display="flex" sx={{ flexDirection: "row" }}>
                                        <ReportTwoToneIcon color="error" />
                                        <Typography color="#d13257" sx={{ fontWeight: "bold", fontSize: "1rem", ml: "0.5rem" }}>
                                            Anuncio no disponible
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            }
                            { favoritePropertyData?.notifications === 1 &&
                                <Tooltip title={
                                    `El anuncio ha cambiado desde la última vez que lo consultaste:\n\n${favoritePropertyData.notificationMessage?.trim()}`.split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))
                                }
                                >
                                    <Box display="flex" sx={{ flexDirection: "row" }}>
                                        <NotificationsActiveTwoToneIcon color="info" />
                                        <Typography color="primary" sx={{ fontWeight: "bold", fontSize: "1rem", ml: "0.5rem" }}>
                                             Anuncio actualizado
                                         </Typography>
                                     </Box>
                                </Tooltip>
                            }
                        </Stack>
                    </Box>
                    <Box display="flex" sx={{ width: "100%", flexDirection: "column", mr: "1.20rem", my: "0.45rem" }}>
                        <Box sx={{ mt: "0rem" }}>
                            { isFavorite ?
                                <Box sx={{ overflow: "auto", height: "10rem" }}>
                                    <Accordion disableGutters>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                Descripción
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                        <Typography>
                                            {searchResult.description?.length > 320 ? `${searchResult?.description?.substring(0, 320).trim()}...` : searchResult.description}
                                        </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Accordion disableGutters defaultExpanded={true}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                Observaciones
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ overflow: "auto", maxHeight: "20rem" }}>
                                                <Typography>
                                                    {favoritePropertyData?.comment.trim() === "" ? "Sin observaciones" : favoritePropertyData?.comment}
                                                </Typography>
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                                :
                                <Typography>
                                    {searchResult.description?.length > 320 ? `${searchResult?.description?.substring(0, 320).trim()}...` : searchResult.description}
                                </Typography>
                            }
                        </Box>
                        <TagSection tagSection={searchResult.summaryTagSection} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default PropertySearchResultSummary