import { Box, Button, Container, Dialog, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { FC, forwardRef, Ref } from "react";

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
    confirmationText: string,
    confirmationAction: () => void
}

const ConfirmationDialog : FC<Props> = ({ openDialog, setOpenDialog, confirmationText, confirmationAction }) => {
    
    const handleClose = () => {
        setOpenDialog(false)
    }

    return (
        <Dialog
            open={openDialog}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <Container component="main" maxWidth="sm">
                <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", mt: "1.5rem", mb: "0.70rem" }}>
                    <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
                        Confirmar
                    </Typography>
                    <Box display="flex" sx={{ flexDirection: "column", mt: 3 }}>
                        <Box>
                            <Typography>{confirmationText}</Typography>
                        </Box>
                        <Box display="flex" sx={{ flexDirection: "row", justifyContent: "center" }}>
                            <Button onClick={() => confirmationAction()} variant="contained" size="small" sx={{ my: 3, px: 5, py: 0.75, mx: 2, b: 2 }}>
                                Aceptar
                            </Button>
                            <Button onClick={() => handleClose()} variant="contained" color="error" size="small" sx={{ my: 3, px: 5, mx: 2, b: 2 }}>
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Dialog>
    )
}

export default ConfirmationDialog