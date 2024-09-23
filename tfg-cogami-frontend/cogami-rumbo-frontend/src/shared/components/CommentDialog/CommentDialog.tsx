import { Box, Button, Container, Dialog, Grid, Slide, TextareaAutosize, TextField, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ChangeEvent, Dispatch, FC, forwardRef, Ref, SetStateAction, useState } from "react";
import { useApi } from "../../Hooks/useApi";
import { commentFavoriteProperty } from "../../../api/propertyApi";
import { useSnackBar } from "../SnackBarContext";
import { FavoriteProperty } from "../../../types";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement
    },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />
})

interface Props {
    setFavoriteProperties: Dispatch<SetStateAction<FavoriteProperty[]>>
    userId: string,
    propertyId: string,
    comment: string,
    categoryId: string,
    notifications: number
}

type AddCommentForm = {
    id: string,
    comment: string
}

const CommentDialog : FC<Props> = ({ setFavoriteProperties, userId, propertyId, comment, categoryId, notifications }) => {
    const callApi = useApi()
    const snackBar = useSnackBar()

    const [previousComment, setPreviousComment] = useState(comment)
    const [form, setForm] = useState<AddCommentForm>({ id: propertyId, comment: comment })
    const [formSent, setFormSent] = useState(false)

    const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()

        callApi(commentFavoriteProperty(userId, form.id, form.comment, categoryId, notifications)).then(() => {
            setFavoriteProperties(state => {
                return state.map(item => item.id === form.id ? {...item, comment: form.comment} : item)
            })
            snackBar.showSnackBar("Añadida observación", "success", { horizontal: "center", vertical: "top" }, 3000)
            setPreviousComment(form.comment)
            setFormSent(true)
        })
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setForm(state => { return {...state, [event.target.name]: event.target.value} })
        setFormSent(false)
    }

    return (
        <>
            <Box display="flex" sx={{ flexDirection: "column", alignItems: "center" }}>
                <Box display="flex" component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0, width: "100%", flexDirection: "column", alignItems: "center" }}>
                    <TextField
                        type="text"
                        placeholder="Sin observaciones"
                        multiline
                        rows={5}
                        name="comment"
                        autoFocus
                        fullWidth
                        id="comment"
                        value={form.comment}
                        onChange={handleChange}
                        helperText={form.comment !== previousComment && !formSent ? "Tiene cambios sin confirmar" : ""}
                    />
                    <Button type="submit" disabled={form.comment === previousComment} variant="contained" sx={{ mt: 1.5, b: 2, width: "20%" }}>
                        Confirmar
                    </Button>
                </Box>
            </Box>
        
        </>
    )
}

export default CommentDialog