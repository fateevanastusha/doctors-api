import {Comment, Paginator, User, SortDirection} from "../types/types";
import {CommentsRepository} from "../repositories/comments-db-repository";
import {UsersService} from "./users-service";
import {queryRepository} from "../queryRepo";
import {LikesRepository} from "../repositories/likes-db-repository";
import {LikesHelpers} from "../helpers/likes-helpers";

export class CommentsService {

    constructor(protected usersService : UsersService, protected commentsRepository : CommentsRepository, protected likesRepository : LikesRepository, protected likesHelper : LikesHelpers) {
    }

    async getCommentById (id : string) : Promise<Comment | null> {
        let comment : Comment | null = await this.commentsRepository.getCommentById(id)
        if (!comment) return null
        return comment
    }

    async getCommentByIdWithUser (id : string, userId : string) : Promise<Comment | null> {
        const currentStatus = await this.likesHelper.requestType(await this.likesRepository.findStatus(id, userId))
        let comment : Comment | null = await this.commentsRepository.getCommentById(id)
        if (!comment) return null
        comment.likesInfo.myStatus = currentStatus
        return comment
    }
    async deleteCommentById (id: string) : Promise<boolean> {
        return this.commentsRepository.deleteCommentById(id)
    }
    async updateCommentById (content: string, id: string) : Promise <boolean> {
        return await this.commentsRepository.updateCommentById(content, id)
    }
    async createComment(postId : string, userId: string, content : string) : Promise <Comment | null> {
        const user : User | null = await this.usersService.getUserById(userId)
        const comment : Comment = {
            id : (+new Date()).toString(),
            content : content,
            commentatorInfo : {
                userId: userId,
                userLogin: user!.login
            },
            createdAt: new Date().toISOString(),
            postId : postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            }
        }
        return this.commentsRepository.createNewComment(comment);
    }
    async getAllCommentsByPostId(PageSize: number, Page: number, sortBy : string, sortDirection: SortDirection, postId: string, userId : string) : Promise<Paginator> {
        let total : number | null |  Comment []= await this.commentsRepository.getAllCommentsByPostId(postId)
        if (total === null) {
            total = 0
        } else {
            total = total.length
        }
        const PageCount = Math.ceil( total / PageSize)
        const Items = await queryRepository.PaginatorForCommentsByBlogId(PageCount, PageSize, Page, sortBy, sortDirection, postId);
        let comments = await queryRepository.CommentsMapping(Items, userId)
        let paginatedComments = await queryRepository.PaginationForm(PageCount, PageSize, Page, total, comments)
        return paginatedComments
    }

    //change like status

    async changeLikeStatus(requestType : string, commentId : string, userId : string) : Promise <boolean> {
        const comment : Comment | null = await this.commentsRepository.getCommentById(commentId)
        if (!comment) {
            return false;
        }
        const status1 = await this.likesRepository.findStatus(commentId, userId)
        const currentStatus = await this.likesHelper.requestType(status1)
        if (currentStatus === requestType) {
            return true
        }
        const status = {
            status : requestType,
            userId : userId,
            postOrCommentId : commentId,
            createdAt : new Date().toISOString()
        }

        //if no status
        if (currentStatus === "None"){
            //add new like or dislike
            await this.likesRepository.createNewStatus(status)
        }

        else if (requestType === "None"){
            //delete status
            await this.likesRepository.deleteStatus(commentId, userId)
        } else {
            //change status
            await this.likesRepository.updateStatus(status)
        }
        //change total
        await this.changeTotalCount(commentId)
        return true;
    }

    async changeTotalCount(commentId : string) : Promise<boolean> {
        const likesCount : number = await this.likesRepository.findLikes(commentId)
        const dislikesCount : number = await this.likesRepository.findDislikes(commentId)
        return this.commentsRepository.changeLikesTotalCount(commentId, likesCount, dislikesCount)
    }



}
