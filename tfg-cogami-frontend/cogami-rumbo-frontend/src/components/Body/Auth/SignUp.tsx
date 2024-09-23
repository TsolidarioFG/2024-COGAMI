import { Box, Container, Grid, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";
import CogamiLogo from "../../../assets/logo-cogami.png"
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../../shared/Utils/Utils";
import { useApi } from "../../../shared/Hooks/useApi";
import { signUp } from "../../../api/authenticationApi";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSnackBar } from "../../../shared/components/SnackBarContext";

type SignUpForm = {
    name: string | null,
    lastName: string | null,
    username: string | null,
    email: string | null,
    password: string | null
}

const SignUp : FC = () => {

    const [cookies, setCookie] = useCookies(['authentication'])
    const navigate = useNavigate()
    const callApi = useApi()
    const snackBar = useSnackBar()

    const [form, setForm] = useState<SignUpForm>({
        name: null, lastName: null,
        username: null, email: null,
        password: null
    })
    const [formError, setFormError] = useState({
        name: false, lastName: false,
        username: false, email: false,
        password: false
    })
    const [formErrorText, setFormErrorText] = useState({
        name: "", lastName: "",
        username: "", email: "",
        password: ""
    })
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

        if (!form.name) {
            setFormError(state => { return {...state, name: true} })
            setFormErrorText(state => { return {...state, name: "Campo obligatorio"} })
        }

        if (!form.lastName) {
            setFormError(state => { return {...state, lastName: true} })
            setFormErrorText(state => { return {...state, lastName: "Campo obligatorio"} })
        }

        if (!form.username) {
            setFormError(state => { return {...state, username: true} })
            setFormErrorText(state => { return {...state, username: "Campo obligatorio"} })
        }

        if (!form.email) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Campo obligatorio"} })
        }

        if (!form.password) {
            setFormError(state => { return {...state, password: true} })
            setFormErrorText(state => { return {...state, password: "Campo obligatorio"} })
        }

        if (!validateEmail(form.email!)) {
            setFormError(state => { return {...state, email: true} })
            setFormErrorText(state => { return {...state, email: "Introduzca un correo electrónico válido"} })
        }

        if (form.name && form.lastName && form.email && form.username && form.password) {
            callApi(signUp({ name: form.name, lastName: form.lastName, username: form.username, email: form.email, password: form.password })).then((result: any) => {
                snackBar.showSnackBar("Usuario creado satisfactoriamente", "success", { vertical: "top", horizontal: "center" }, 3000)
                setCookie('authentication', result?.jwtToken, { path: '/', maxAge: 1296000, secure: true, sameSite: "strict" })
                localStorage.setItem("user", JSON.stringify(result?.userInfo))
                navigate("/", { replace: true })
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
            <Box sx={{ mt: "3.25rem", py: "2.5rem", px: "2.5rem", display: "flex", backgroundColor: "#83d9eaffede1ff", flexDirection: "column", alignItems: "center", borderRadius: "1.2rem", border: "0.2rem solid #832756" }}>
                <Box sx={{ mb: "1.5rem" }}>
                    <img src={CogamiLogo} alt="logo-cogami" />
                </Box>
                <Typography component="h1" variant="h4">
                    Crear cuenta
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                required
                                fullWidth
                                id="name"
                                label="Nombre"
                                autoFocus
                                value={form.name ?? ""}
                                onChange={handleChange}
                                error={formError.name}
                                helperText={formErrorText.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="lastName"
                                required
                                fullWidth
                                id="lastName"
                                label="Apellidos"
                                value={form.lastName ?? ""}
                                onChange={handleChange}
                                error={formError.lastName}
                                helperText={formErrorText.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="username"
                                required
                                fullWidth
                                id="username"
                                label="Nombre de usuario"
                                value={form.username ?? ""}
                                onChange={handleChange}
                                error={formError.username}
                                helperText={formErrorText.username}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                type="email"
                                name="email"
                                required
                                fullWidth
                                id="email"
                                label="Correo electrónico"
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
                    <Button type="submit" fullWidth variant="contained" sx={{ my: 3, b: 2}}>
                        Crear cuenta
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Box display="flex" sx={{ flexDirection: "column" }}>
                                <Button variant="text" onClick={() => { navigate("/login") }} sx={{ textTransform: "none" }}>
                                    ¿Ya tienes una cuenta? Inicie sesión
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        </Container>
    )
}

export default SignUp