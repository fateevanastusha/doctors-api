import {Comment} from "../types/types";
import {BlogModelClass, CommentModelClass} from "../types/models";

export class CommentsRepository {
    async getCommentById(id: string): Promise<Comment | null> {
        return await CommentModelClass.findOne(
            {id: id},
            {
                _id: 0, __v: 0,
                postId: 0,
            }
        ).lean()
    }

    async deleteCommentById(id: string): Promise<boolean> {
        const result = await CommentModelClass.deleteOne({id: id})
        return result.deletedCount === 1
    }

    async updateCommentById(content: string, id: string): Promise<boolean> {
        const result = await CommentModelClass.updateOne({id: id}, {
            $set: {
                content: content
            }
        })
        return result.matchedCount === 1
    }

    async createNewComment(comment: Comment): Promise<Comment | null> {
        await CommentModelClass.insertMany(comment)
        const createdComment = await this.getCommentById(comment.id)
        if (createdComment) {
            return createdComment
        } else {
            return null
        }
    }

    async getAllCommentsByPostId(postId: string): Promise<Comment[] | null> {
        return CommentModelClass
            .find({postId: postId}, {_id: 0, __v: 0, postId: 0})
            .lean()
    }

    async commentsCount(): Promise<number> {
        return CommentModelClass
            .find()
            .count()
    }


    async changeLikesTotalCount(commentId: string, likesCount: number, dislikesCount: number): Promise<boolean> {
        const status = await CommentModelClass.updateOne({
            id: commentId,
        }, {
            $set: {
                'likesInfo.likesCount': likesCount,
                'likesInfo.dislikesCount': dislikesCount
            }
        })
        return status.matchedCount === 1
    }

    async deleteAllData() {
        const result = await CommentModelClass.deleteMany({})
        return []
    }

    async getAllComments() {
        return await CommentModelClass.find({}).lean()
    }
}

export const commentsRepository = new CommentsRepository()