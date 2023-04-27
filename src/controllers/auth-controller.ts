import {Request, Response} from "express";
import {AuthService} from "../domain/auth-service";
import {AccessToken, TokenList, User} from "../types/types";
import {injectable} from "inversify";

@injectable()

export class AuthController {
    constructor(protected authService : AuthService) {
    }
    //LOGIN

    async loginRequest(req: Request, res: Response){
        const title = req.headers["user-agent"] || "unknown"
        const tokenList: TokenList | null = await this.authService.authRequest(req.body.password, req.ip, req.body.loginOrEmail, title)
        if (tokenList) {
            let token: AccessToken = {
                accessToken: tokenList.accessToken
            }
            res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
            res.status(200).send(token)
        } else {
            res.sendStatus(401)
        }
    }


    //GET INFORMATION ABOUT CURRENT AUTH

    async getInfoAboutUser(req: Request, res: Response){
        const auth = req.headers.authorization
        if (!auth) return res.sendStatus(401)
        const [authType, token] = auth.split(' ')
        if (authType !== 'Bearer') return res.sendStatus(401)
        const user: User | null = await this.authService.getInformationAboutCurrentUser(token)
        if (user) {
            const currentUser = {
                email: user.email,
                login : user.login,
                userId : user.id
            }
            res.status(200).send(currentUser)
        } else {
            res.sendStatus(401)
        }
    }

    //PASSWORD RECOVERY SENDING EMAIL WITH CODE

    async passwordRecoverySendEmail(req: Request, res: Response){
        const status : boolean = await this.authService.passwordRecovery(req.body.email)
        if (status) {
            res.sendStatus(204)
        } else {
            res.sendStatus(400)
        }
    }

    //PASSWORD RECOVERY. CHANGE PASSWORD

    async passwordRecoveryChangePassword(req: Request, res: Response){
        const status : boolean = await this.authService.changePasswordWithCode(req.body.recoveryCode, req.body.newPassword)
        if(status) {
            res.sendStatus(204)
        } else {
            res.sendStatus(400)
        }
    }

    //REGISTRATION IN THE SYSTEM

    async registrationUser(req: Request, res: Response){
        const status: boolean = await this.authService.registrationUser(req.body);
        if (status) {
            res.send(204);
        } else {
            res.send(404);
        }
    }

    //CODE CONFIRMATION

    async codeConfirmation(req: Request, res: Response){
        const status = await this.authService.checkForConfirmationCode(req.body.code)
        if (!status) {
            res.sendStatus(400)
        } else {
            res.sendStatus(204)
        }
    }

    //RESEND CODE CONFIRMATION

    async resendCode(req: Request, res: Response){
        const status: boolean = await this.authService.emailResending(req.body)
        if (status) {
            res.send(204)
        } else {
            res.send(400)
        }
    }

    //LOGOUT. KILL REFRESH TOKEN + KILL SESSION

    async logoutRequest(req: Request, res: Response){
        const status : boolean = await this.authService.logoutRequest(req.cookies.refreshToken)
        if (status) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    }

    //REFRESH TOKEN

    async refreshTokenRequest(req: Request, res: Response){

        const title = req.headers["user-agent"] || "unknown"
        const tokenList: TokenList | null = await this.authService.createNewToken(req.cookies.refreshToken, req.ip, title)
        if (tokenList) {
            let token: AccessToken = {
                accessToken: tokenList.accessToken
            }
            res.cookie('refreshToken', tokenList.refreshToken, {httpOnly: true, secure: true})
            res.status(200).send(token)
        } else {
            res.sendStatus(401)
        }
    }
}