import { AppBar, Box, Button, Dialog, IconButton, Slide, Toolbar, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from '@mui/icons-material/Close';
import React, { forwardRef, Ref } from "react";
import LocationMapSelector from "./LocationMapSelector";

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
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

const LocationCoordDialog : React.FC<Props> = ({ openDialog, setOpenDialog }) => {
    const handleClickOpen = () => {
        setOpenDialog(true)
    }

    const handleClose = () => {
        setOpenDialog(false)
    }

    return (
        <Dialog
            fullScreen
            open={openDialog}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: "fixed" }}>
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
                        Seleccione una región en el mapa
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClose}>
                        Guardar
                    </Button>
                </Toolbar>
                <Box>
                    <LocationMapSelector />
                </Box>
            </AppBar>
        </Dialog>
    )
}

export default LocationCoordDialog