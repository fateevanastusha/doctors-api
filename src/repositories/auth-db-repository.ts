import {RefreshToken, User} from "../types/types";
import bcrypt from "bcrypt";
import {RefreshTokenBlackListModelClass} from "../types/models";
import {UsersRepository} from "./users-db-repository";
import {injectable} from "inversify";
import "reflect-metadata"

const usersRepository = new UsersRepository()

@injectable()

export class AuthRepository {

    //AUTH

    async authRequest(loginOrEmail: string, password: string) : Promise <boolean> {

        //find by loginOrEmail

        const user : User | null = await usersRepository.returnUserByField(loginOrEmail)
        if (user) {
            return bcrypt.compareSync(password, user.password)
        } else {
            return false
        }
    }

    async recoveryRequest(recoveryCode: string, password: string) : Promise <boolean> {

        //find by loginOrEmail

        const user : User | null = await usersRepository.returnUserByField(recoveryCode)
        if (user) {
            return bcrypt.compareSync(password, user.password)
        } else {
            return false
        }
    }

    //CHECK FOR REFRESH TOKEN IN BLACK LIST

    async checkRefreshToken(refreshToken : string) : Promise <boolean> {
        //find by loginOrEmail
        const status : RefreshToken | null =  await RefreshTokenBlackListModelClass.findOne({refreshToken : refreshToken})
        if (status) {
            return true
        } else {
            return false
        }
    }

    //ADD REFRESH TOKEN TO BLACK LIST

    async addRefreshTokenToBlackList(refreshToken : string) : Promise <boolean> {
        //find by loginOrEmail
        await RefreshTokenBlackListModelClass.insertMany({refreshToken : refreshToken})
        const status = await this.checkRefreshToken(refreshToken)
        if (status) {
            return true
        } else {
            return false
        }
    }

}

export const authRepository = new AuthRepository()