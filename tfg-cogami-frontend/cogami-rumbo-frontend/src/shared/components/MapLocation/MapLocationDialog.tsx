import { AppBar, Box, Button, Dialog, IconButton, Slide, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from '@mui/icons-material/Close';
import React, { forwardRef, Ref } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"
import "../../../styles.css"
import { Coordinates } from "../../../types";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement
    },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />
})

interface Props {
    openDialog: boolean,
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>,
    ubication: { name: string, coordinates: Coordinates },
    propertyTitle: string
}

const MapLocationDialog : React.FC<Props> = ({ openDialog, setOpenDialog, ubication, propertyTitle }) => {
    const handleClickOpen = () => {
        setOpenDialog(true)
    }

    const handleClose = () => {
        setOpenDialog(false)
    }

    return (
        <Dialog
            // fullScreen
            fullWidth
            maxWidth="xl"
            open={openDialog}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            {/* <AppBar sx={{ position: "static" }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="cerrar"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        { ubication?.name }
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box>
                <MapContainer center={[ubication.coordinates.latitude, ubication.coordinates.longitude]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[ubication.coordinates.latitude, ubication.coordinates.longitude]}>
                        <Popup>
                            {propertyTitle}
                        </Popup>
                    </Marker>
                </MapContainer>
            </Box> */}
            <Box>
                <MapContainer center={[ubication.coordinates.latitude, ubication.coordinates.longitude]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[ubication.coordinates.latitude, ubication.coordinates.longitude]}>
                        <Popup>
                            {propertyTitle}
                        </Popup>
                    </Marker>
                </MapContainer>
            </Box>
        </Dialog>
    )
}

export default MapLocationDialog