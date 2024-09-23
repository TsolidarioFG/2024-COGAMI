import { AppBar, IconButton, Box, Dialog, Slide, Typography, Toolbar, useMediaQuery } from "@mui/material"
import { TransitionProps } from "@mui/material/transitions"
import { FC, forwardRef, Ref, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import Carousel from "react-material-ui-carousel"
import { ImageContent } from "../../../types";
import { translateImagesTags } from "../../Utils/Utils";

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
    images: ImageContent[]
}

const ImageDialogViewer : FC<Props> = ({ openDialog, setOpenDialog, images }) => {

    const matches2000 = useMediaQuery('(min-width: 2000px)')
    const matches1780 = useMediaQuery('(max-width: 1780px)')

    const [imageIndex, setImageIndex] = useState<number>(0)

    const handleClose = () => {
        setOpenDialog(false)
    }

    const renderImages = (image: ImageContent, i: any) => {
        return (
            <Box key={i} aria-label="img" sx={{ height: "100%", width: "100%", objectFit: "contain" }}
                    component="img" alt={translateImagesTags(image.roomType)} src={image.url}
            />
        )
    }

    return (
        <Dialog
            open={openDialog}
            onClose={handleClose}
            TransitionComponent={Transition}
            fullScreen
        >
            <AppBar color="primary" sx={{ position: "relative" }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="cerrar"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 3, flex: 1 }} variant="h6" component="div">
                        {translateImagesTags(images[imageIndex].roomType)}
                    </Typography>
                </Toolbar>
                
            </AppBar>
            <Box sx={{ mt: matches2000 ? "4rem" : "1rem", mb: matches1780 ? "2rem" : "auto" }}>
                <Carousel
                    autoPlay={false}
                    navButtonsAlwaysVisible
                    swipe={false}
                    height="730px"
                    sx={{ mt: "1rem" }}
                    indicators={true}
                    next={ (next) => { setImageIndex(next ?? 0) } }
                    prev={ (prev) => { setImageIndex(prev ?? 0) } }
                >
                    { images.map((image, i) => renderImages(image, i)) }
                </Carousel>
            </Box>
        </Dialog>
    )
}

export default ImageDialogViewer