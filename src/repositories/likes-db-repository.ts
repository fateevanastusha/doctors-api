import {LikeModelClass} from "../types/models";
import {Like} from "../types/types";
import addressparser from "nodemailer/lib/addressparser";


export class LikesRepository {
    async createNewStatus(status : Like) : Promise<boolean> {
        await LikeModelClass.insertMany(status)
        const createdStatus = await this.findStatus(status.postOrCommentId, status.userId)
        if (createdStatus){
            return true
        } else {
            return false
        }
    }
    async findStatus(postOrCommentId : string, userId : string) : Promise<Like | null> {
        return await LikeModelClass.findOne({postOrCommentId : postOrCommentId, userId : userId})
    }
    async deleteStatus(commentId : string, userId : string) : Promise<boolean> {
        const result = await LikeModelClass.deleteOne({postOrCommentId : commentId, userId : userId})
        return result.deletedCount === 1
    }
    async updateStatus(status : Like) : Promise<boolean> {
        const result = await LikeModelClass.updateOne({postOrCommentId : status.postOrCommentId, userId : status.userId}, {
            $set: {
                status : status.status,
                userId : status.userId,
                postOrCommentId : status.postOrCommentId,
                createdAt : status.createdAt
            }
        })
        return result.matchedCount === 1
    }
    async getLikesById(commentId: string) : Promise<Like[]>{
        return await LikeModelClass.find({postOrCommentId : commentId, status : "Like"}, {_id: 0, __v: 0}).lean()
    }
    async findLikes(commentId: string) : Promise<number>{
        return await LikeModelClass.countDocuments({postOrCommentId : commentId, status : "Like"})
    }
    async findDislikes(commentId: string) : Promise<number>{
        return await LikeModelClass.countDocuments({postOrCommentId : commentId, status : "Dislike"})
    }
    async deleteAllData(){
        await LikeModelClass.deleteMany({})
        return []
    }
    async getAllLikes() : Promise <Like[]>{
        return await LikeModelClass.find({}).lean()
    }
}