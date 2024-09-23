import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Link, Stack, styled, Tooltip, Typography } from "@mui/material"
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SyntheticEvent, useEffect, useState } from "react";
import { useIdealistaApi } from "../../../shared/Hooks/useIdealistaApi";
import { useFotocasaApi } from "../../../shared/Hooks/useFotocasaApi";
import { useApi } from "../../../shared/Hooks/useApi";
import { X_RAPIDAPI_IDEALISTA_GETDETAIL } from "../../../shared/Constants";
import { constructIdealistaUrlSearchParams, constructIdealistaUrlSearchParamsDetail, formatPropertyDetails } from "../../../shared/Utils/IdealistaCallApiUtils";
import { Category, FavoriteProperty, IdealistaPropertyDetails, NotInterestedProperty, PropertySearchResult } from "../../../types";
import ImageDialogViewer from "../../../shared/components/ImageDialogViewer/ImageDialogViewer";
import { translateImagesTags } from "../../../shared/Utils/Utils";
import IdealistaLogo from '../../../assets/idealista.svg'
import FotocasaLogo from '../../../assets/fotocasa-seeklogo.svg'
import BedIcon from '@mui/icons-material/Bed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import DoNotDisturbOffIcon from '@mui/icons-material/DoNotDisturbOff';
import BorderColorTwoToneIcon from '@mui/icons-material/BorderColorTwoTone';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesTwoToneIcon from '@mui/icons-material/NewReleasesTwoTone';
import BathtubIcon from '@mui/icons-material/Bathtub';
import TagSection from "../PropertySearchResult/TagSection";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import MapLocationDialog from "../../../shared/components/MapLocation/MapLocationDialog";
import { useCookies } from "react-cookie";
import { createProperty, favoriteProperty, getNotInterestedProperties, getPropertyById, getPropertyByPortalAndPropertyCode, getUserFavoriteProperties, markAsNotInterested, removeFavoriteProperty, unmarkAsNotInterested, updateFavoritePropertyCategory, updateNotificationsProperty } from "../../../api/propertyApi";
import CommentDialog from "../../../shared/components/CommentDialog/CommentDialog";
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getById } from "../../../api/categoryApi";
import CategorySelectorDialog from "../../../shared/components/CategorySelectorDialog/CategorySelectorDialog";
import ReportTwoToneIcon from '@mui/icons-material/ReportTwoTone';
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog/ConfirmationDIalog";

const PropertyDetails : React.FC = () => {

    const {portal, propertyCode, operation} = useParams()
    const location = useLocation()
    const {searchOptions} = location?.state || {}
    const navigate = useNavigate()
    const callApi = useApi()
    const callIdealistaApi = useIdealistaApi()
    const callFotocasaApi = useFotocasaApi()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    const [propertyDetails, setPropertyDetails] : IdealistaPropertyDetails | PropertySearchResult | any = useState(null)

    const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([])
    const [notInterestedProperties, setNotInterestedProperties] = useState<NotInterestedProperty[]>([])

    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [openMapDialog, setOpenMapDialog] = useState(false)
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
    const [openCommentDialog, setOpenCommentDialog] = useState(false)

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false)
    const [lastFavedProperty, setLastFavedProperty] = useState<any | null>(null)

    const isNotInterested = notInterestedProperties.find(item => item.propertyCode === propertyDetails?.propertyCode?.toString()) ? true : false

    const favoritePropertyData = favoriteProperties.find((favProp: FavoriteProperty) => favProp.portal === portal
        && favProp.propertyCode === propertyDetails?.propertyCode?.toString())

    const [expanded, setExpanded] = useState<string | false>(false)

    const [categoryNameTitle, setCategoryNameTitle] = useState("Sin categoría")

    const handleChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false)
    }

    const handleOpenImageDialog = () => {
        setOpenImageDialog(true)
    }

    const handleOpenMapDialog = () => {
        setOpenMapDialog(true)
    }

    const getCategoryName = (id: string) => {
        callApi(getById(id)).then((result: any) => {
            setCategoryNameTitle(result?.name)
        })
    }

    useEffect(() => {
        if (favoritePropertyData) {
            setExpanded("observ")
            getCategoryName(favoritePropertyData.categoryId)
        } else {
            setExpanded("descr")
        }
    }, [favoritePropertyData])

    const markNotificationAsRead = (favProp: FavoriteProperty) => {
        callApi(updateNotificationsProperty(user?.id, favProp.id, favProp.comment, favProp.categoryId, 0, null))
    }

    useEffect(() => {
        if (!user || !cookies['authentication']) {
            navigate("/login")
        } else {
            let _propertyDetails: any = null 
            const computeRestUseEffect = () => {
                callApi(getUserFavoriteProperties(user?.id)).then((result: any) => {
                    if (result && result.length !== favoriteProperties.length) {
                        result.map((favProperty: any) => {
                            callApi(getPropertyById(favProperty?.id)).then((property: any) => {
                                let formatFavProp = {
                                    id: property?.id,
                                    portal: property?.portal,
                                    propertyCode: property?.propertyCode,
                                    portalLink: property?.portalLink,
                                    rawData: property?.rawData,
                                    comment: favProperty?.comment,
                                    categoryId: favProperty?.categoryId,
                                    notifications: favProperty?.notifications === 1 ? 0 : favProperty?.notifications,
                                    notificationMessage: null
                                }
                                if (favProperty?.notifications === 1 && formatFavProp.propertyCode.toString() === _propertyDetails?.propertyCode.toString()) {
                                    markNotificationAsRead(formatFavProp)
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

            }
            
            if (portal === "idealista" && propertyCode) {
                const parsedIdealistaLastProperty : PropertySearchResult = JSON.parse(localStorage.getItem('idealistaLastProperty')!)
                callIdealistaApi(X_RAPIDAPI_IDEALISTA_GETDETAIL, constructIdealistaUrlSearchParamsDetail(propertyCode)).then((response) => {
                    if (response?.message === 'ad not found') {
                        callApi(getPropertyByPortalAndPropertyCode("idealista", propertyCode)).then((result: any) => {
                            setPropertyDetails(JSON.parse(result?.rawData))
                        })
                    } else {
                        _propertyDetails = formatPropertyDetails(response, parsedIdealistaLastProperty.summaryTagSection)
                        setPropertyDetails(_propertyDetails)
                    }
                    computeRestUseEffect()
                })
            } else if (portal === "fotocasa" && propertyCode && operation) {
                const parsedFotocasaProperty = JSON.parse(localStorage.getItem('fotocasaLastProperty') ?? "")
                _propertyDetails = localStorage.getItem('fotocasaLastProperty') !== null ? parsedFotocasaProperty : null
                setPropertyDetails(_propertyDetails)
                computeRestUseEffect()
            }

            
        }

    }, [portal, propertyCode, operation])

    const renderCharacteristics = (chr: string) => {
        return (
            <Typography key={chr}>
                {chr}
            </Typography>
        )
    }

    const isIdealistaPropertyDetails = (property: IdealistaPropertyDetails | PropertySearchResult): property is IdealistaPropertyDetails => {
        return (property as IdealistaPropertyDetails)?.link !== undefined
    }

    const handleAddFavorite = () => {
        const portalLink = isIdealistaPropertyDetails(propertyDetails) ? propertyDetails?.link : propertyDetails?.linkToPortal
        callApi(createProperty({
            portal: portal!,
            propertyCode: propertyDetails?.propertyCode.toString(),
            portalLink: portalLink,
            rawData: JSON.stringify(propertyDetails)
        })).then(async (result: any) => {
            if (result) {
                setOpenCategoryDialog(true)
                setLastFavedProperty(result)
            }
        })
        

    }

    const handleRemoveFavorite = () => {
        const favProp = favoriteProperties.find((prop: FavoriteProperty) => prop.portal === portal && prop.propertyCode === propertyDetails?.propertyCode.toString())
        if (favProp) {
            callApi(removeFavoriteProperty(user?.id, favProp.id, favProp.comment, favProp.categoryId, favProp.notifications, favProp.notificationMessage)).then(() => {
                setFavoriteProperties(state => state.filter(prop => prop.id !== favProp.id))
                let _lastFavSearch = JSON.parse(sessionStorage.getItem("lastFavSearch")!)
                _lastFavSearch = {..._lastFavSearch, propertySearchResult: _lastFavSearch?.propertySearchResult.filter((item: any) => item?.propertyCode !== propertyDetails?.propertyCode)}
                sessionStorage.setItem("lastFavSearch", JSON.stringify(_lastFavSearch))
            })
        }
    }

    const handleMarkAsNotInterested = () => {
        callApi(markAsNotInterested(user?.id, portal!, propertyDetails.propertyCode.toString())).then(() => {
            setNotInterestedProperties(state => [...state, { portal: portal!, propertyCode: propertyDetails.propertyCode.toString() }])
        })
    }

    const handleUnmarkAsNotInterested = () => {
        callApi(unmarkAsNotInterested(user?.id, portal!, propertyDetails.propertyCode.toString())).then(() => {
            setNotInterestedProperties(state => state.filter(prop => prop.portal !== portal! && prop.propertyCode !== propertyDetails.propertyCode.toString()))
        })
    }

    const renderIdealistaCharacteristics = () => {
        return (
            <Box display="flex" sx={{ flexDirection: "column", width: "50%" }}>
                <Stack spacing={2}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                        { propertyDetails?.floorAndSmallDescr }
                    </Typography>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.35rem" }}>
                        {propertyDetails?.price}
                    </Typography>
                    { propertyDetails?.characteristicsDescriptions.map((chr: any) => { return renderCharacteristics(chr) }) }
                    { favoritePropertyData?.notifications === -1 ?
                        <Box display="flex" sx={{ flexDirection: "row" }}>
                            <Tooltip title={`El anuncio no se encuentra diponible en ${favoritePropertyData?.portal === "idealista" ? "Idealista" : "Fotocasa"}, la vivienda se eliminará de tu listado de favoritos automáticamente sino lo haces tú`}>
                                <ReportTwoToneIcon color="error" />
                            </Tooltip>
                            <Typography color="#d13257" sx={{ fontWeight: "bold", fontSize: "1rem", ml: "0.5rem" }}>
                                Anuncio no disponible
                            </Typography>
                        </Box>
                        :
                        <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                            <NewReleasesTwoToneIcon color="warning" sx={{ fontSize: "1.20rem" }} />
                            <Typography color="primary" sx={{ fontWeight: "bold", ml: "0.5rem" }}>
                                {propertyDetails?.lastModification}
                            </Typography>
                        </Box>
                    }
                    <Link underline="hover" target="_blank" rel="noopener" href={propertyDetails?.link} sx={{ fontWeight: 550 }} variant="body1">
                        "Enlace a Idealista"
                    </Link>
                </Stack>
                <Box sx={{ mb: "1.20rem" }}>
                    <TagSection tagSection={propertyDetails?.summaryTagSection} />
                </Box>
                { favoritePropertyData &&
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                        <Tooltip title="Editar categoría">
                            <IconButton onClick={() => setOpenCategoryDialog(true)}>
                                <CategoryIcon color="primary" sx={{ mr: "0.5rem" }} />
                            </IconButton>
                        </Tooltip>
                        <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                            {categoryNameTitle}
                        </Typography>
                    </Box>
                }
            </Box>
        )
    }

    const renderFotocasaCharacteristics = () => {
        return (
            <Box display="flex" sx={{ flexDirection: "column", width: "30%" }}>
                <Stack spacing={3}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.35rem" }}>
                        {propertyDetails?.price}
                    </Typography>
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                        <BedIcon sx={{ fontSize: "1.20rem" }} />
                        <Typography sx={{ ml: "0.5rem" }}>
                            {`${propertyDetails?.bedrooms} hab.`}
                        </Typography>
                    </Box>
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                        <BathtubIcon sx={{ fontSize: "1.20rem" }} />
                        <Typography sx={{ ml: "0.5rem" }}>
                            {`${propertyDetails?.bathrooms} baños.`}
                        </Typography>
                    </Box>
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                        <SquareFootIcon sx={{ fontSize: "1.20rem" }} />
                        <Typography sx={{ ml: "0.5rem" }}>
                            {`${propertyDetails.size}`}
                        </Typography>
                    </Box>
                    <Link underline="none" target="_blank" rel="noopener" href={propertyDetails?.linkToPortal} sx={{ fontWeight: 550 }} variant="body1">
                        Enlace a Fotocasa
                    </Link>
                    { favoritePropertyData?.notifications === -1 &&
                        <Box display="flex" sx={{ flexDirection: "row" }}>
                            <Tooltip title={`El anuncio no se encuentra diponible en ${favoritePropertyData?.portal === "idealista" ? "Idealista" : "Fotocasa"}, la vivienda se eliminará de tu listado de favoritos automáticamente sino lo haces tú`}>
                                <ReportTwoToneIcon color="error" />
                            </Tooltip>
                            <Typography color="#d13257" sx={{ fontWeight: "bold", fontSize: "1rem", ml: "0.5rem" }}>
                                Anuncio no disponible
                            </Typography>
                        </Box>
                    }
                </Stack>
                <Box sx={{ mb: "1.20rem" }}>
                    <TagSection tagSection={propertyDetails?.summaryTagSection} />
                </Box>
                { favoritePropertyData &&
                    <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                        <Tooltip title="Editar categoría">
                            <IconButton onClick={() => setOpenCategoryDialog(true)}>
                                <CategoryIcon color="primary" sx={{ mr: "0.5rem" }} />
                            </IconButton>
                        </Tooltip>
                        <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
                            {categoryNameTitle}
                        </Typography>
                    </Box>
                }
            </Box>
        )
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

    const handleAssignCategoryToExistantFavProperty = async (result: any, categoryId: string) => {
        callApi(updateFavoritePropertyCategory(user?.id, result?.id, result?.comment, categoryId, result?.notifications, result?.notificationMessage)).then(() => {
            setFavoriteProperties(state => {
                return state.map(item => item.id === result?.id ? {...item, categoryId: categoryId} : item)
            })
            localStorage.setItem("favoriteProperties", JSON.stringify(favoriteProperties))
        })
    }

    return (
        <Box display="flex" sx={{ flexDirection: "column", mt: "1.85rem" }}>
            <Box sx={{ mx: "16.5rem", mb: "1.25rem" }}>
                <Button variant="text" sx={{ textTransform: "unset" }} onClick={() => { navigate(-1) }} startIcon={<KeyboardBackspaceIcon />}>
                    Volver
                </Button>
            </Box>
            { propertyDetails &&
                <Box display="flex" sx={{ mx: "16.5rem", mb: "1.5rem", flexDirection: "column", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;", borderRadius: "1rem" }}>
                    <Box sx={{ mx: "1rem", mt: "1rem", mb: portal === "idealista" ? "1rem": "auto" }}>
                        <Box display="block" aria-label="img" 
                            sx={{ verticalAlign: "bottom", height: "100%", width: "100%", my: "auto",
                                borderRadius: "0.75rem", cursor: "pointer", objectFit: "contain" }}
                            onClick={handleOpenImageDialog}
                            component="img" alt={!propertyDetails?.images ? "Imágenes no encontradas" : translateImagesTags(propertyDetails?.images[0]?.roomType ?? "Imagen de la vivienda no disponible")} 
                            src={!propertyDetails?.images ? "src\\assets\\512px-Image_not_available.png" : propertyDetails?.images[0]?.url ?? "src\\assets\\512px-Image_not_available.png"}
                        />
                        <Button sx={{ mt: "0.3rem", textTransform: "none" }} onClick={handleOpenMapDialog} startIcon={<FmdGoodIcon sx={{ fontSize: "1.50rem" }} />}>
                            <Typography sx={{ fontSize: "1rem" }}>Ver en mapa</Typography>
                        </Button>
                        <MapLocationDialog ubication={propertyDetails?.ubication}
                            propertyTitle={propertyDetails?.title}
                            openDialog={openMapDialog}
                            setOpenDialog={setOpenMapDialog}
                        />
                    </Box>

                    { propertyDetails && propertyDetails?.images?.length !== 0 &&
                        <ImageDialogViewer images={propertyDetails?.images} openDialog={openImageDialog} setOpenDialog={setOpenImageDialog} />
                    } 
                    <Box display="flex" sx={{ flexDirection: "column", width: "100%" }}>
                        <Box display="flex" sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                                ml: portal !== "idealista" ? "0.5rem" : "1.25rem", mr: "1.25rem", mt: portal === "idealista" ? "1.30rem" : "auto" }}>
                            <Box display="flex" sx={{ flexDirection: "row", alignItems: "center" }}>
                                <Box component="img"
                                    aria-label="img" 
                                    alt="Imagen del portal" 
                                    src={portal === "idealista" ? IdealistaLogo : FotocasaLogo}
                                    sx={{ width: portal === "idealista" ? "130px" : "160px", mr: portal === "idealista" ? "1.25rem" : "auto" }} 
                                />
                                <Box display="flex" sx={{ alignItems: "flex-end" }}>
                                    <Typography color="primary" sx={{ fontWeight: "bold", fontSize: "1.55rem", mt: "0.25rem", mr: "0.5rem" }}>
                                        {propertyDetails?.title}
                                    </Typography>
                                </Box>

                            </Box> 
                            { 
                            isNotInterested ?
                                <Box display="flex" sx={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                    <Button 
                                        sx={{ textTransform: "none"}} 
                                        onClick={() => { handleUnmarkAsNotInterested() }}
                                        startIcon={<DoNotDisturbOffIcon sx={{ fontSize: "0.80rem" }} />}                                     
                                    >
                                        <Typography sx={{ fontSize: "0.80rem" }}>Desmarcar no me interesa</Typography>
                                    </Button>
                                </Box>
                            :
                            !favoritePropertyData
                            ?
                                <>
                                    <Box display="flex" sx={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <Button 
                                            sx={{ textTransform: "none", mr: "1rem"}}
                                            onClick={() => { handleMarkAsNotInterested() }} 
                                            startIcon={<NotInterestedIcon sx={{ fontSize: "0.80rem" }} />}>
                                            <Typography sx={{ fontSize: "0.80rem" }}>No me interesa</Typography>
                                        </Button>
                                        <Button sx={{ textTransform: "none"}} startIcon={<FavoriteBorderIcon sx={{ fontSize: "0.80rem" }} />}
                                            onClick={() => { handleAddFavorite() }}
                                        >
                                            <Typography sx={{ fontSize: "0.80rem" }}>Añadir a favoritos</Typography>
                                        </Button>
                                    </Box>
                                    <CategorySelectorDialog
                                        existantCategoryId={null}
                                        setOriginalCategories={null}
                                        openDialog={openCategoryDialog}
                                        setOpenDialog={setOpenCategoryDialog}
                                        handleAssignCategory={handleAssignCategoryToFavProperty}
                                        result={lastFavedProperty}
                                    />
                                </>
                            :
                                <>
                                    <Box display="flex" sx={{ flexDirection: "row", justifyContent: "flex-end" }}>
                                        <Button 
                                            sx={{ textTransform: "none"}} 
                                            onClick={() => { setOpenConfirmationDialog(true) }}
                                            startIcon={<FavoriteIcon sx={{ fontSize: "0.80rem" }} />}                                     
                                        >
                                            <Typography sx={{ fontSize: "0.80rem" }}>Eliminar de favoritos</Typography>
                                        </Button>
                                    </Box>
                                    <ConfirmationDialog
                                        confirmationAction={handleRemoveFavorite}
                                        confirmationText="Esta acción es irreversible y eliminará la vivienda de favoritos, incluyendo las observaciones asociadas a la vivienda"
                                        openDialog={openConfirmationDialog}
                                        setOpenDialog={setOpenConfirmationDialog}
                                    />
                                    <CategorySelectorDialog
                                        existantCategoryId={favoritePropertyData.categoryId}
                                        setOriginalCategories={null}
                                        openDialog={openCategoryDialog}
                                        setOpenDialog={setOpenCategoryDialog}
                                        handleAssignCategory={handleAssignCategoryToExistantFavProperty}
                                        result={favoritePropertyData}
                                    />
                                </>
                            }
                        </Box>
                        <Box display="flex" sx={{ flexDirection: "row", ml: "1.20rem", mt: portal === "idealista" ? "0.45rem" : "auto", mb: "1.20rem" }}>
                            { portal === "idealista" ? renderIdealistaCharacteristics() : renderFotocasaCharacteristics() }
                            <Box sx={{ my: "1rem", mx: "1.20rem", width: "100%", borderRadius: "1rem", maxHeight: "90rem" }}>
                                <Accordion expanded={expanded === "descr"} onChange={handleChange("descr")} square={false} 
                                    sx={{ boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;" }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            Descripción
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>    
                                        <Typography sx={{ mx: "1rem", mb: "1rem" }}>
                                            {propertyDetails?.description}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                { favoritePropertyData &&
                                    <Accordion expanded={expanded === "observ"} onChange={handleChange("observ")} square={false} sx={{ boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;" }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography sx={{ fontWeight: "bold" }}>
                                                Observaciones
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <CommentDialog 
                                                setFavoriteProperties={setFavoriteProperties}
                                                propertyId={favoritePropertyData.id}
                                                comment={favoritePropertyData.comment}
                                                categoryId={favoritePropertyData.categoryId}
                                                notifications={favoritePropertyData.notifications}
                                                userId={user?.id}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                }
                            </Box>
                        </Box>
                    </Box>
                </Box>
            }
        </Box>
    )
}

export default PropertyDetails