import { NextFunction } from "express";
import { Response, Request } from "express";
import {JwtService} from "../application/jwt-service";
import {authRepository} from "../repositories/auth-db-repository";
import {RefreshTokensMeta, User} from "../types/types";
import {securityRepository} from "../repositories/security-db-repository";
import {UsersRepository} from "../repositories/users-db-repository";
import {authService, commentsService, securityService} from "../compositon-root";


const jwtService = new JwtService()
const usersRepository = new UsersRepository()

export const authMiddlewares = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization) {
        res.sendStatus(401)
    } else {
        const token : string = req.headers.authorization.split(" ")[1]
        const user = await jwtService.getUserByIdToken(token)
        if (user) {
            next()
        } else {
            res.sendStatus(401);
        }
    }
}
export const checkForUser = async (req: Request, res: Response, next: NextFunction) => {
    const token : string = req.headers.authorization!.split(" ")[1]
    const userId = await jwtService.getUserByIdToken(token)
    const comment = await commentsService.getCommentByIdWithUser(req.params.id, userId)
    if (!comment) {
        res.sendStatus(404)
    }
    else if (comment.commentatorInfo.userId === userId) {
        next()
    } else {
        res.sendStatus(403)
    }
}

export const checkForRefreshToken = async (req: Request, res: Response, next: NextFunction) => {

    //CHECK FOR EXISTING REFRESH TOKEN
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(401)

    //CHECK FOR NOT BLOCKED REFRESH TOKEN
    const isTokenBlocked : boolean = await authRepository.checkRefreshToken(refreshToken)
    if (isTokenBlocked) return res.sendStatus(401)

    //CHECK FOR EXISTING SESSION WITH THIS REFRESH TOKEN

    const tokenList = await jwtService.getIdByRefreshToken(refreshToken)
    if (!tokenList) return res.sendStatus(401)
    const session : RefreshTokensMeta | null = await securityRepository.findSessionByDeviceId(tokenList.deviceId)
    if (!session) return res.sendStatus(401)
    const userId = await jwtService.getIdByRefreshToken(refreshToken)
    if(!userId) return res.sendStatus(401)
    next();
}

export const checkForSameDevice = async (req: Request, res: Response, next: NextFunction) => {
    const title : string = req.headers["user-agent"] || "unknown";
    const user : User | null = await authService.authFindUser(req.body.loginOrEmail);
    if (!user) return res.sendStatus(401);
    const userId : string = user.id;
    const status : boolean = await securityService.checkForSameDevice(title, userId);
    if (!status) return res.sendStatus(403);
    next();
}

export const checkForSameUser = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken : string = req.cookies.refreshToken;
    const id : string = req.params.id;
    const userInfo = await jwtService.getIdByRefreshToken(refreshToken)
    const session = await securityRepository.findSessionByDeviceId(id)
    if(!session) return res.sendStatus(404)
    if (!userInfo) return res.sendStatus(401)
    if (session.userId !== userInfo.userId) return res.sendStatus(403)
    next()
}

export const checkForDeviceId = async (req: Request, res: Response, next: NextFunction) => {
    const deviceId : string = req.params.id;
    const session : RefreshTokensMeta | null = await securityRepository.findSessionByDeviceId(deviceId);
    if (!session) return res.sendStatus(404)
    next()
}

export const checkForExistingEmail  = async (req : Request, res : Response, next : NextFunction) => {
    const User = await usersRepository.returnUserByEmail(req.body.email)
    if (!User) {
       return  res.sendStatus(204)
    }
    next()
}

export const checkForNotSamePassword = async (req: Request, res: Response, next : NextFunction) => {
    const status : boolean = await authRepository.recoveryRequest(req.body.recoveryCode, req.body.newPassword)
    if (status) {
        return res.sendStatus(401)
    } else {
        next()
    }
}

