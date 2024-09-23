import { Box, Button, Container, Dialog, Grid, IconButton, InputAdornment, Slide, TextField, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { ChangeEvent, useState } from "react";
import { FC } from "react";
import { validateEmail } from "../../../../shared/Utils/Utils";
import { useApi } from "../../../../shared/Hooks/useApi";
import { changePassword } from "../../../../api/authenticationApi";
import { useSnackBar } from "../../../../shared/components/SnackBarContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    openDialog: boolean,
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

type ChangePasswordForm = {
    email: string | null,
    newPassword: string | null,
    confirmNewPassword: string | null
}

const ChangePasswordDialog : FC<Props> = ({ openDialog, setOpenDialog }) => {

    const callApi = useApi()
    const snackBar = useSnackBar()

    const [form, setForm] = useState<ChangePasswordForm>({
        email: null,
        newPassword: null,
        confirmNewPassword: null
    })
    const [formError, setFormError] = useState({
        email: false,
        newPassword: false,
        confirmNewPassword: false
    })
    const [formErrorText, setFormErrorText] = useState({
        email: "",
        newPassword: "",
        confirmNewPassword: ""
    })

    const [showPasswd, setShowPasswd] = useState({ newPassword: false, confirmNewPassword: false })

    const handleShowNewPasswd = () => {
        setShowPasswd(state => {
            return {...state, newPassword: !state.newPassword}
        })
    }

    const handleShowConfirmNewPasswd = () => {
        setShowPasswd(state => {
            return {...state, confirmNewPassword: !state.confirmNewPassword}
        })
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    };

    const handleClose = () => {
        setForm({ email: null, newPassword: null, confirmNewPassword: null })
        setFormError({ email: false, newPassword: false, confirmNewPassword: false })
        setFormErrorText({ email: "", newPassword: "", confirmNewPassword: "" })
        setShowPasswd({ newPassword: false, confirmNewPassword: false })
        setOpenDialog(false)
    }

    const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.email) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Campo obligatorio"} })
        }

        if (!form.newPassword) {
            setFormError(state => { return {...state, newPassword: true} })
            setFormErrorText(state => { return {...state, newPassword: "Campo obligatorio"} })
        }

        if (!form.confirmNewPassword) {
            setFormError(state => { return {...state, confirmNewPassword: true} })
            setFormErrorText(state => { return {...state, confirmNewPassword: "Campo obligatorio"} })
        }

        if (!validateEmail(form.email!)) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Introduzca un correo electrónico válido"} })
        }

        if ((form.newPassword && form.confirmNewPassword) && form.newPassword !== form.confirmNewPassword) {
            setFormError(state => { return {...state, newPassword: true, confirmNewPassword: true} })
            setFormErrorText(state => { return {...state, newPassword: "Las contraseñas no coinciden", confirmNewPassword: "Las contraseñas no coinciden"} })
        } else if (form.email && form.confirmNewPassword && form.newPassword) {
            callApi(changePassword({ email: form.email, newPassword: form.newPassword, confirmNewPassword: form.confirmNewPassword })).then((result) => {
                if (!result) {
                    snackBar.showSnackBar("Contraseña cambiada correctamente", "success", { vertical: "top", horizontal: "center" }, 3000)
                    setOpenDialog(false)
                }
            })
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormError(state => { return {...state, [event.target.name]: false} })
        setFormErrorText(state => { return {...state, [event.target.name]: ""} })
        setForm(state => { return {...state, [event.target.name]: event.target.value} })
    }


    return (
        <Dialog
            open={openDialog}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="change-password-dialog"
            PaperProps={{
                sx: { borderRadius: "1rem", border: "0.3rem solid #832756" }
            }}
        >
            <Container component="main" maxWidth="sm">
                <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", mt: "1.5rem", mb: "0.70rem" }}>
                    <Typography component="h1" variant="h4">
                        Cambiar contraseña
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    type="email"
                                    autoComplete="email"
                                    name="email"
                                    required
                                    fullWidth
                                    id="changePasswdEmail"
                                    label="Correo electrónico"
                                    autoFocus
                                    value={form.email ?? ""}
                                    onChange={handleChange}
                                    error={formError.email}
                                    helperText={formErrorText.email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    type={showPasswd.newPassword ? "text" : "password"}
                                    name="newPassword"
                                    required
                                    fullWidth
                                    id="newPassword"
                                    label="Nueva contraseña"
                                    value={form.newPassword ?? ""}
                                    onChange={handleChange}
                                    error={formError.newPassword}
                                    helperText={formErrorText.newPassword}
                                    InputProps={{
                                        endAdornment: 
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle newPasswd visibility"
                                                    onClick={handleShowNewPasswd}
                                                    onMouseDown={handleMouseDownPassword}
                                                >
                                                    {showPasswd.newPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    type={showPasswd.confirmNewPassword ? "text" : "password"}
                                    name="confirmNewPassword"
                                    required
                                    fullWidth
                                    id="confirmNewPassword"
                                    label="Confirmar contraseña"
                                    value={form.confirmNewPassword ?? ""}
                                    onChange={handleChange}
                                    error={formError.confirmNewPassword}
                                    helperText={formErrorText.confirmNewPassword}
                                    InputProps={{
                                        endAdornment: 
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirmNewPasswd visibility"
                                                    onClick={handleShowConfirmNewPasswd}
                                                    onMouseDown={handleMouseDownPassword}
                                                >
                                                    {showPasswd.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button type="submit" fullWidth variant="contained" sx={{ my: 3, b: 2 }}>
                            Cambiar contraseña
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Dialog>
    )
}

export default ChangePasswordDialog