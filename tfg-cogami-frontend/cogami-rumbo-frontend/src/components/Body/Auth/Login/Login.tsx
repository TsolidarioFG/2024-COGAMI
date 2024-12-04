import { Box, Button, Container, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../../shared/Hooks/useApi";
import { login } from "../../../../api/authenticationApi";
import CogamiLogo from "../../../../assets/logo-cogami.png";
import { validateEmail } from "../../../../shared/Utils/Utils";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type LoginForm = {
    email: string | null,
    password: string | null
}

const Login : FC = () => {
    const [cookies, setCookie] = useCookies(['authentication'])
    const callApi = useApi()
    const navigate = useNavigate()
    const [form, setForm] = useState<LoginForm>({ email: null, password: null })
    const [formError, setFormError] = useState({ email: false, password: false })
    const [formErrorText, setFormErrorText] = useState({ email: "", password: "" })

    const [openDialog, setOpenDialog] = useState(false)

    const [showPasswd, setShowPasswd] = useState(false)

    useEffect(() => {
        if (cookies?.authentication) {
            navigate("/accessible-search", { replace: true })
        }
    }, [])

    const handleShowPasswd = () => {
        setShowPasswd((show) => !show)
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    };

    const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.email) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Campo obligatorio"} })
            return
        }
        
        if (!validateEmail(form.email!)) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Introduzca un correo electrónico válido"} })
            return
        }

        if (!form.password) {
            setFormError(state => { return {...state, password: true} })
            setFormErrorText(state => { return {...state, password: "Campo obligatorio"} })
            return
        }

        if (form.email && form.password) {
            callApi(login({ email: form.email, password: form.password })).then((result: any) => {
                setCookie('authentication', result?.jwtToken, { path: '/', maxAge: 14400, secure: false, sameSite: 'lax' })
                localStorage.setItem("user", JSON.stringify(result?.userInfo))
                navigate("/accessible-search", { replace: true })
            })
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormError(state => { return {...state, [event.target.name]: false} })
        setFormErrorText(state => { return {...state, [event.target.name]: ""} })
        setForm(state => { return {...state, [event.target.name]: event.target.value} })
    }

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ mt: "10.5rem", py: "2.5rem", display: "flex", backgroundColor: "#83d9eaffede1ff", flexDirection: "column", alignItems: "center", borderRadius: "1.2rem", border: "0.2rem solid #832756" }}>
                <Box sx={{ mb: "1.5rem" }}>
                    <img src={CogamiLogo} alt="logo-cogami" />
                </Box>
                <Typography component="h1" variant="h4">
                    Iniciar sesión
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
                                id="email"
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
                                type={showPasswd ? "text" : "password"}
                                name="password"
                                required
                                fullWidth
                                id="password"
                                label="Contraseña"
                                value={form.password ?? ""}
                                onChange={handleChange}
                                error={formError.password}
                                helperText={formErrorText.password}
                                InputProps={{
                                    endAdornment: 
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle newPasswd visibility"
                                                onClick={handleShowPasswd}
                                                onMouseDown={handleMouseDownPassword}
                                            >
                                                {showPasswd ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Button type="submit" fullWidth variant="contained" sx={{ my: 3, b: 2 }}>
                        Iniciar sesión
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Button variant="text" sx={{ textTransform: "none" }} onClick={() => { setOpenDialog(true) }}>
                                ¿Olvidaste la contraseña?
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="text" onClick={() => { navigate("/signup") }} sx={{ textTransform: "none" }}>
                                ¿No tienes una cuenta? Crea una
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <ChangePasswordDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
            </Box>

        </Container>
    )
}

export default Login