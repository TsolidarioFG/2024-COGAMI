import { Autocomplete, Box, Button, Dialog, DialogContent, Slide, Tab, Tabs, TextField } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ChangeEvent, Dispatch, FC, forwardRef, SetStateAction, SyntheticEvent, useEffect, useState } from "react";
import { useApi } from "../../Hooks/useApi";
import { useSnackBar } from "../SnackBarContext";
import { createCategory, deleteCategory, getUserCreatedCategories } from "../../../api/categoryApi";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { updateFavoritePropertyCategory } from "../../../api/propertyApi";
import { Category, FavoriteProperty, UserSearch } from "../../../types";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
    openDialog: boolean,
    setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>,
    existantCategoryId: string | null,
    result: any
    handleAssignCategory: (result: any, categoryId: string) => Promise<void>,
    setOriginalCategories: Dispatch<SetStateAction<Category[]>> | null
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const CategorySelectorDialog : FC<Props> = ({ openDialog, setOpenDialog, existantCategoryId, 
    result, handleAssignCategory, setOriginalCategories }) => {
    const callApi = useApi()
    const snackBar = useSnackBar()
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user")!)
    const [cookies] = useCookies(["authentication"])

    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<Category | null | undefined>(null)
    const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<Category | null | undefined>(null)
    
    useEffect(() => {
        if (!user || !cookies.authentication) {
            navigate("/login")
        } else {
            callApi(getUserCreatedCategories(user?.id)).then((result: any) => {
                let _categories : Category[] = []
                result.forEach((category: any) => {
                    let formatCategory = {
                        id: category?.id,
                        name: category?.name,
                        creationDate: category?.creationDate,
                        userFk: category?.userFk
                    }
                    _categories.push(formatCategory)
                });
                setCategories(_categories)
                if (existantCategoryId) {
                    const _existantCategory = _categories.find(item => item.id === existantCategoryId)
                    setSelectedCategory(_existantCategory)
                }
            })
        }
    }, [openDialog])

    const [form, setForm] = useState<{name: string | null}>({
        name: null
    })
    const [formError, setFormError] = useState({
        name: false
    })
    const [formErrorText, setFormErrorText] = useState({
        name: ""
    })

    const [currentTab, setCurrentTab] = useState(0)

    const handleChangeTab = (event: SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormError(state => { return {...state, [event.target.name]: false} })
        setFormErrorText(state => { return {...state, [event.target.name]: ""} })
        setForm(state => { return {...state, [event.target.name]: event.target.value} })
    }

    const handleClose = () => {
        setForm({ name: null })
        setFormError({ name: false })
        setFormErrorText({ name: "" })
        setSelectedCategory(null)
        setForm({ name: null })
        setFormError({ name: false })
        setFormErrorText({ name: "" })
        setCurrentTab(0)
        setOpenDialog(false)
    }

    const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!form.name) {
            setFormError(state => { return {...state, name: true} })
            setFormErrorText(state => { return {...state, name: "Campo obligatorio"} })
        } else if (form.name.length > 45) {
            setFormError(state => { return {...state, name: true} })
            setFormErrorText(state => { return {...state, name: "El campo debe tener como máximo 45 caracteres"} })
        } else {
            callApi(createCategory(user?.id, form.name)).then((category: any) => {
                setCategories(state => { return [...state, category]} )
                snackBar.showSnackBar("Categoría creada, selecciónela en la lista", "success", { vertical: "top", horizontal: "center" }, 3000)
            })
        }
        
    }

    const CustomTabPanel = (props: TabPanelProps) => {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
          </div>
        );
    }

    const handleChangeSelectedCategory = (event: any, newValue: string | null) => {
        const _selectedCategory = categories.find(item => item.name === newValue)
        setSelectedCategory(_selectedCategory)
    }

    const handleChangeSelectedCategoryToDelete = (event: any, newValue: string | null) => {
        const _selectedCategory = categories.find(item => item.name === newValue)
        setSelectedCategoryToDelete(_selectedCategory)
    }

    const handleSelectCategory = () => {
        handleAssignCategory(result, selectedCategory?.id!)
        setOpenDialog(false)
    }

    const handleDeleteCategory = () => {
        callApi(deleteCategory(selectedCategoryToDelete?.id!)).then(() => {
            let _categories = categories.filter(item => item.id !== selectedCategoryToDelete?.id)
            setCategories(_categories)
            setSelectedCategoryToDelete(null)
            if (setOriginalCategories) {
                setOriginalCategories(_categories)
            }
            snackBar.showSnackBar("Categoría eliminada con éxito", "success", { vertical: "top", horizontal: "center" }, 3000)
        })
    }

    return (
        <Dialog
            open={openDialog}
            TransitionComponent={Transition}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: { borderRadius: "1rem", border: "0.3rem solid #832756" }
            }}
        >
            <DialogContent>
                { user &&
                    <Box sx={{ height: "18rem" }}>
                        <Box>
                            <Tabs value={currentTab} onChange={handleChangeTab}>
                                <Tab label="Seleccionar categoría" />
                                <Tab label="Crear nueva categoría" />
                                <Tab label="Eliminar categoría" />
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={currentTab} index={0}>
                            <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", mt: "1.5rem" }}>
                                <Autocomplete
                                    disablePortal
                                    id="category-selector"
                                    value={selectedCategory?.name}
                                    onChange={handleChangeSelectedCategory}
                                    options={categories.sort((a, b) => (a.name > b.name) ? 1 : -1).map(category => { return category.name })}
                                    sx={{ width: "70%" }}
                                    renderInput={(params) => <TextField {...params} name='' inputProps={{ ...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" } }}
                                    variant='standard' label="Categorías" sx={{ fontFamily: "Roboto" }} 
                                        SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }} 
                                    />}
                                    ListboxProps={{ sx: { maxHeight: "10rem", overflowY: "auto" } }}
                                />
                                <Button disabled={!selectedCategory} variant="contained" sx={{ mt: "1.5rem", width: "70%" }} onClick={() => handleSelectCategory()}>
                                    Confirmar
                                </Button>
                            </Box>
                        </CustomTabPanel>
                        <CustomTabPanel value={currentTab} index={1}>
                            <Box component="form" onSubmit={handleSubmit} display="flex" sx={{ flexDirection: "column", alignItems: "center", mt: "1.5rem" }}>
                                <TextField
                                    type="text"
                                    autoFocus
                                    id="category-name"
                                    name="name"
                                    sx={{ width: "70%" }}
                                    required
                                    label="Nombre de la categoría"
                                    value={form.name ?? ""}
                                    onChange={handleChange}
                                    variant="standard"
                                    error={formError.name}
                                    helperText={formErrorText.name}
                                />
                                <Button 
                                    type="submit"
                                    disabled={!form.name}
                                    sx={{ width: "70%", mt: "1.5rem" }}
                                    variant="contained"
                                >
                                    Crear
                                </Button>
                            </Box>
                        </CustomTabPanel>
                        <CustomTabPanel value={currentTab} index={2}>
                            <Box display="flex" sx={{ flexDirection: "column", alignItems: "center", mt: "1.5rem" }}>
                            <Autocomplete
                                    disablePortal
                                    id="category-selector"
                                    value={selectedCategoryToDelete?.name}
                                    onChange={handleChangeSelectedCategoryToDelete}
                                    options={categories.map(category => { return category.name })}
                                    sx={{ width: "70%" }}
                                    renderInput={(params) => <TextField {...params} name='' inputProps={{ ...params.inputProps, style: { fontFamily: "Roboto", fontSize: "0.90rem" } }}
                                    variant='standard' label="Categorías" sx={{ fontFamily: "Roboto" }} 
                                        SelectProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }}
                                        InputLabelProps={{ sx: {fontFamily: "Roboto", fontSize: "1rem"} }} 
                                    />}
                                    ListboxProps={{ sx: { maxHeight: "10rem", overflowY: "auto" } }}
                                />
                                <Button disabled={!selectedCategoryToDelete} variant="contained" sx={{ mt: "1.5rem", width: "70%" }} onClick={() => handleDeleteCategory()}>
                                    Eliminar
                                </Button>
                            </Box>
                        </CustomTabPanel>
                    </Box>
                }
            </DialogContent>
        </Dialog>
    )
}

export default CategorySelectorDialog