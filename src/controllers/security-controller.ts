import {Request, Response} from "express";
import {RefreshTokensMeta} from "../types/types";
import {SecurityService} from "../domain/security-service";

export class SecurityController {
    constructor(protected securityService : SecurityService) {
    }
    //GET ALL SESSIONS

    async getAllSessions(req: Request, res: Response){

        const sessions : RefreshTokensMeta[] | null = await this.securityService.getAllSessions(req.cookies.refreshToken)
        if (sessions) {
            res.status(200).send(sessions)
        } else {
            res.sendStatus(401)
        }
    }

    //DELETE ALL SESSIONS

    async deleteAllSessions(req: Request, res: Response){

        const status : boolean = await this.securityService.deleteAllSessions(req.cookies.refreshToken)
        if (status) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    }

    //DELETE SESSION

    async deleteSession(req: Request, res: Response){

        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(401)
        const status : boolean = await this.securityService.deleteOneSession(req.params.id)
        if(!status) return res.sendStatus(403)
        res.sendStatus(204)
    }

}