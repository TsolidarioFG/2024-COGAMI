import { POST, PUT } from "../shared/Constants"
import { ApiCall } from "../types"

type LoginDto = {
    email: string,
    password: string
}

type SignUpDto = {
    name: string,
    lastName: string,
    username: string,
    email: string,
    password: string
}

type ChangePasswordDto = {
    email: string,
    newPassword: string,
    confirmNewPassword: string
}

export const login = (loginDto: LoginDto) : ApiCall => {
    return { url: "authentication/login", body: { email: loginDto.email, password: loginDto.password }, method: POST }
}

export const signUp = (signUpDto: SignUpDto) : ApiCall => {
    return { 
        url: "authentication/signup", 
        body: { name: signUpDto.name, lastName: signUpDto.lastName, username: signUpDto.username, email: signUpDto.email, password: signUpDto.password },
        method: POST
    }
}

export const changePassword = (changePasswordDto: ChangePasswordDto) : ApiCall => {
    return {
        url: "authentication/changePassword",
        body: { email: changePasswordDto.email, newPassword: changePasswordDto.newPassword, newConfirmPassword: changePasswordDto.confirmNewPassword },
        method: PUT
    }
}