import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as React from "react";
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import { useLocation, useNavigate } from "react-router-dom";
import CogamiLogo from '../../assets/logo-cogami.png'
import { useCookies } from "react-cookie";
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user")!)
  const [cookies, _setCookies, removeCookies] = useCookies(["authentication"])
  const location = useLocation()
  
  const logout = () => {
    removeCookies('authentication')
    setAnchorElUser(null)
    sessionStorage.clear()
    localStorage.clear()
    navigate("/login", { replace: true })
  }

  const matches = useMediaQuery('(max-width: 1280px)')
  const pages = [{path: "/accessible-search", name: "Búsqueda viviendas accesibles"}, {path: "/accessible-search/historic", name: "Historial de búsquedas"}, {path: "/accessible-search/favorite_properties", name: "Viviendas favoritas"}]
  const user_options = [
    // { method: () => {}, name: "Configuración", component: <ListItemIcon><Settings fontSize="small" /></ListItemIcon> },
    { method: logout, name: "Cerrar sesión", component: <ListItemIcon><Logout fontSize="small" /></ListItemIcon>  },
  ];
  const navigate = useNavigate()
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)

  const onButtonClicked = (url : string, option : string) => {
    navigate(url)
  }


  const handleOpenUserMenu = (event : React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const renderMenuItems = () => {
    return (
      user_options.map(option => {
        return (
          <MenuItem key={option.name} onClick={option.method}>
            { option.component }
            <Typography textAlign="center">{option.name}</Typography>
          </MenuItem>
        )
      })
    )
  }

  return (
    <Box sx={{ width: "100%" }}>
      { user && cookies?.authentication &&
        <AppBar color="secondary" sx={{ width: "100%", borderBottom: "0.20rem solid #832756" }} >
          <Toolbar disableGutters>
            <Box sx={{ ml: matches ? "1rem" : "1.5rem" }}>
              <img src={CogamiLogo} alt="logo-cogami" />
            </Box>
            <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", flexGrow: 1, ml: matches ? "1.5rem" : "2rem" }}>
                {pages.map(page => {
                  return (
                    <Button size="small" variant={(location.pathname === "/" ? "/accessible-search" : location.pathname) === page.path ? "contained" : "outlined"} key={page.name} onClick={() => onButtonClicked(page.path, page.name)} 
                      sx={{ mr: matches ? "1rem" : "1.5rem", my: 2, color: (location.pathname === "/" ? "/accessible-search" : location.pathname) === page.path ? "white" : "black", display: "block", border: "0.15rem solid #832756", borderRadius: "0.60rem" }}
                    >
                      {page.name}
                    </Button>
                  )
                })}
              </Box>
              <Box sx={{ mr: matches ? "1.5rem" : "2rem", display: "flex", flexGrow: 0 }}>
                <Tooltip title="Configuración usuario">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <AccountCircleTwoToneIcon fontSize="large" color="primary" />
                  </IconButton>
                </Tooltip>
                { anchorElUser && 
                  <Menu sx={{ mt: "45px" }} id="menu-user" anchorEl={anchorElUser} anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    keepMounted transformOrigin={{ vertical: "top", horizontal: "right" }} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}
                    >
                      <MenuItem sx={{ color: "inherit", pointerEvents: 'none' }}>
                        <Typography sx={{ fontWeight: "bold" }} >
                          { user?.username }
                        </Typography>
                      </MenuItem>
                      <Divider />
                      {renderMenuItems()}
                  </Menu>
                }
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      }
    </Box>
  )
}
