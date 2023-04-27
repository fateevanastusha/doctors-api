import {AuthRepository} from "../repositories/auth-db-repository";
import {RefreshToken, RefreshTokensMeta, AccessToken, TokenList, User} from "../types/types";
import {JwtService} from "../application/jwt-service";
import {UsersService} from "./users-service";
import {businessService} from "./business-service";
import {securityRepository} from "../repositories/security-db-repository";
import {UsersRepository} from "../repositories/users-db-repository";
import {injectable} from "inversify";


@injectable()

export class AuthService {
    constructor(
        protected authRepository : AuthRepository,
        protected usersService : UsersService,
        protected usersRepository : UsersRepository,
        protected jwtService : JwtService
        ) {
    }

    async authRequest (password : string, ip : string, loginOrEmail : string, title : string) : Promise<TokenList | null> {
        //CHECK FOR CORRECT PASSWORD
        const status : boolean = await this.authRepository.authRequest(loginOrEmail, password)
        if (!status) return null
        //CHECK FOR USER
        const user : User | null = await this.authFindUser(loginOrEmail);
        if (!user) return null;
        //CREATE DEVICE ID
        const deviceId : string = (+new Date()).toString();
        //GET USER ID
        const userId : string = user.id;
        //GET TOKENS
        const refreshToken : RefreshToken = await this.jwtService.createJWTRefresh(userId, deviceId);
        const accessToken = await this.jwtService.createJWTAccess(userId)
        //GET DATE
        const date : string | null = await this.jwtService.getRefreshTokenDate(refreshToken.refreshToken)
        if (!date) return null
        //CREATE REFRESH TOKENS META
        const refreshTokenMeta : RefreshTokensMeta = {
            userId : userId,
            ip: ip,
            title: title,
            lastActiveDate: date,
            deviceId: deviceId
        }
        //CREATE NEW SESSION
        await securityRepository.createNewSession(refreshTokenMeta)
        //RETURN TOKENS
        return {
            accessToken : accessToken.accessToken,
            refreshToken : refreshToken.refreshToken
        }
    }
    async logoutRequest (refreshToken : string) : Promise<boolean> {
        //ADD REFRESH TO BLACK LIST
        const statusBlackList : boolean = await this.addRefreshTokenToBlackList(refreshToken)
        if (!statusBlackList) return false
        //GET USER ID AND DEVICE ID BY REFRESH TOKEN
        const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
        if (!idList) return false
        return await securityRepository.deleteOneSessions(idList.deviceId)

    }

    //CREATE NEW TOKENS

    async createNewToken (refreshToken : string, ip : string, title : string) : Promise<TokenList | null> {
        await this.authRepository.addRefreshTokenToBlackList(refreshToken)
        const session : RefreshTokensMeta | null = await securityRepository.findSessionByIp(ip)
        if (!session) return null
        const deviceId : string = session.deviceId
        const userId : string = await this.jwtService.getUserByIdToken(refreshToken)
        const user = await this.usersService.getUserById(userId)
        if (user === null) return null
        const accessToken : AccessToken = await this.jwtService.createJWTAccess(userId)
        const newRefreshToken : RefreshToken = await this.jwtService.createJWTRefresh(userId, deviceId)
        const date : string | null = await this.jwtService.getRefreshTokenDate(newRefreshToken.refreshToken)
        if (!date) return null
        //UPDATE SESSION
        await securityRepository.updateSession(ip, title, date, deviceId)
        return {
            accessToken : accessToken.accessToken,
            refreshToken : newRefreshToken.refreshToken
        }
    }

    async addRefreshTokenToBlackList (refreshToken : string) : Promise<boolean> {
        return await this.authRepository.addRefreshTokenToBlackList(refreshToken)
    }


    //GET USER BY TOKEN

    async getUserByToken (token : string) : Promise<User | null> {
        const userId : string = await this.jwtService.getUserByIdToken(token)
        const user : User | null = await this.usersService.getUserById(userId)
        return user
    }

    //FIND USER BY LOGIN OR EMAIL

    async authFindUser (loginOrEmail : string) : Promise<User | null> {
        return await this.usersRepository.returnUserByField(
            loginOrEmail
        )
    }

    //

    async checkForConfirmationCode (confirmationCode : string) : Promise <boolean>  {
        return await this.usersRepository.changeConfirmedStatus(confirmationCode)

    }

    //CHANGE PASSWORD

    async changePasswordWithCode (confirmationCode : string, newPassword : string ) : Promise <boolean>  {
        //change confirmed code
        return await this.usersService.changeUserPassword(confirmationCode, newPassword)
    }

    //UPDATE CONFIRMATION CODE

    async updateConfirmationCode (confirmationCode : string, email : string) : Promise <boolean> {
        return this.usersRepository.changeConfirmationCode(confirmationCode,email)
    }

    //REGISTRATION USER

    async registrationUser (user: User) : Promise <boolean> {

        let confirmationCode : string = (+new Date()).toString()

        //CREATE NEW USER

        const newUser : User | null = await this.usersService.createNewUser(user, false, confirmationCode)
        if (!newUser) {
            return false
        }
        //SEND EMAIL

        await businessService.sendConfirmationCode(user.email, confirmationCode)
        return true

    }

    //PASSWORD RECOVERY

    async passwordRecovery (email : string) : Promise <boolean> {

        let confirmationCode : string = (+new Date()).toString()

        //UPDATE CONFIRMATION CODE

        const status = await this.updateConfirmationCode(confirmationCode, email)
        if (!status) {
            return false
        }
        //SEND EMAIL

        await businessService.sendRecoveryCode(email, confirmationCode)
        return true

    }

    //EMAIL RESENDING

    async emailResending (user: User) : Promise <boolean> {

        let confirmationCode : string = (+new Date()).toString()
        let email : string = user.email

        //UPDATE CONFIRMATION CODE

        const status = await this.updateConfirmationCode(confirmationCode, email)
        if (!status) {
            return false
        }
        //SEND EMAIL

        await businessService.sendConfirmationCode(user.email, confirmationCode)
        return true

    }

    //GET INFORMATION ABOUT CURRENT USER

    async getInformationAboutCurrentUser (accessToken : string) : Promise <User | null> {

        const token : string = accessToken
        const getUser : User | null = await this.getUserByToken(token)

        if (getUser) {
            return getUser
        }
        else {
            return null
        }

    }
}
