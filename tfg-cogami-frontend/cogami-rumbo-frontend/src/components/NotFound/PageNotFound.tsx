import { Box, Button, Container, Typography } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";


const PageNotFound : FC = () => {
    const navigate = useNavigate()
    return (
        <Container component="main" maxWidth="lg">
            <Box sx={{ mt: "10.5rem", py: "2.5rem", display: "flex", flexDirection: "column", alignContent: "center", alignItems: "center" }}>
                <Typography component="h1" variant="h2" sx={{ mb: "1.5rem" }}>(╯°□°)╯︵ ┻━┻</Typography>
                <Typography color="#832756" component="h1" variant="h3" >404</Typography>
                <Typography sx={{ my: "1.75rem", fontSize: "1.2rem" }}>No hemos encontrado la página, pruebe a volver al inicio</Typography>
                <Button variant="contained" onClick={() => navigate("/")} sx={{ width: "30%" }} >Volver</Button>
            </Box>
        </Container>
    )
}

export default PageNotFound