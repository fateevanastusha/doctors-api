import {RefreshTokensMeta} from "../types/types";
import {RefreshTokensMetaModelClass} from "../types/models";

export class SecurityRepository {
    async getAllSessions(userId : string) : Promise<RefreshTokensMeta[] | null> {
        return RefreshTokensMetaModelClass
            .find({userId}, {_id: 0, __v: 0, userId : 0})
            .lean()
    }
    async deleteAllSessions(deviceId : string, userId : string) : Promise<boolean> {
        const result = await RefreshTokensMetaModelClass
            .deleteMany({
                userId,
                deviceId : {$ne : deviceId}
            })
        return result.deletedCount > 0
    }
    async deleteOneSessions(deviceId : string) : Promise<boolean> {
        const result = await RefreshTokensMetaModelClass
            .deleteOne({deviceId})
        return result.deletedCount === 1
    }
    async createNewSession(refreshTokensMeta : RefreshTokensMeta) : Promise<boolean> {
        await RefreshTokensMetaModelClass
            .insertMany({
                userId : refreshTokensMeta.userId,
                ip: refreshTokensMeta.ip,
                title: refreshTokensMeta.title,
                lastActiveDate: refreshTokensMeta.lastActiveDate,
                deviceId: refreshTokensMeta.deviceId
            });
        const createdSession = await this.findSessionByIp(refreshTokensMeta.ip);
        if (createdSession) return true;
        return false;


    }
    async findSessionByIp(ip : string) : Promise<RefreshTokensMeta | null> {
        return RefreshTokensMetaModelClass
            .findOne({ip: ip})
    }
    async findSessionByDeviceId(deviceId: string) : Promise<RefreshTokensMeta | null> {
        return RefreshTokensMetaModelClass
            .findOne({deviceId: deviceId})
    }
    async findSessionByDeviceIdAndUserId(userId : string, deviceId: string) : Promise<RefreshTokensMeta | null> {
        return RefreshTokensMetaModelClass
            .findOne({userId : userId, deviceId: deviceId})
    }
    async updateSession(ip : string, title : string, lastActiveDate : string, deviceId : string) : Promise<boolean>{
        const result = await RefreshTokensMetaModelClass
            .updateOne({deviceId : deviceId},
                 {$set : {
                         ip: ip,
                         title: title,
                         lastActiveDate: lastActiveDate,
                         deviceId: deviceId
                     }
            });
        return result.matchedCount === 1;
    }
    //DELETE ALL DATA
    async deleteAllData() {
        await RefreshTokensMetaModelClass.deleteMany({});
        return [];
    }
    //CHECK FOR THE SAME SESSION
    async checkSameDevice(title : string, userId : string) : Promise<boolean> {
        const result = await RefreshTokensMetaModelClass.find({title: title, userId : userId})
        if (result) return true
        return false
    }
}

export const securityRepository = new SecurityRepository()