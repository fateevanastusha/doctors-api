import {RefreshTokensMeta} from "../types/types";
import {SecurityRepository} from "../repositories/security-db-repository";
import {JwtService} from "../application/jwt-service";



export class SecurityService {
    constructor(protected securityRepository : SecurityRepository, protected jwtService : JwtService) {
    }
    async getAllSessions(refreshToken : string) : Promise<RefreshTokensMeta[] | null> {
        const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
        if(!idList) return null
        const userId = idList.userId
        return await this.securityRepository.getAllSessions(userId)
    }
    async deleteAllSessions(refreshToken : string) : Promise<boolean> {
        const idList = await this.jwtService.getIdByRefreshToken(refreshToken)
        if(!idList) return false
        return await this.securityRepository.deleteAllSessions(idList.deviceId, idList.userId)
    }
    async deleteOneSession(deviceId : string) : Promise<boolean> {
        return await this.securityRepository.deleteOneSessions(deviceId)
    }
    async checkForSameDevice(title : string, userId : string) : Promise<boolean> {
        return await this.securityRepository.checkSameDevice(title,userId)
    }
}

