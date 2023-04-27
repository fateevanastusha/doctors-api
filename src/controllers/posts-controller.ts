import {PostsService} from "../domain/posts-service";
import {Request, Response} from "express";
import {paginationHelpers} from "../helpers/pagination-helpers";
import {SortDirection} from "mongodb";
import {Blog, Post} from "../types/types";
import {PostsRepository} from "../repositories/posts-db-repositiory";
import {JwtService} from "../application/jwt-service";
import {BlogsService} from "../domain/blogs-service";
import {CommentsService} from "../domain/comments-service";
import {postsService} from "../compositon-root";

export class PostsController {
    constructor(
        protected postsService : PostsService,
        protected blogsService : BlogsService,
        protected postsRepository : PostsRepository,
        protected commentsService : CommentsService,
        protected jwtService : JwtService
        ) {
    }
    //GET - return all
    async getAllPosts(req: Request, res: Response){
        let pageSize : number = paginationHelpers.pageSize(<string>req.query.pageSize);
        let pageNumber : number = paginationHelpers.pageNumber(<string>req.query.pageNumber)
        let sortBy : string = paginationHelpers.sortBy(<string>req.query.sortBy);
        let sortDirection : SortDirection = paginationHelpers.sortDirection(<string>req.query.sortDirection);
        let token
        if (!req.headers.authorization){
            token = 'lala'
        } else {
            token = req.headers.authorization!.split(" ")[1]
        }
        let userId : string = await this.jwtService.getUserByIdToken(token);
        let allPosts = await this.postsService.returnAllPost(pageSize, pageNumber, sortBy, sortDirection, userId);
        res.status(200).send(allPosts)
    }
    //GET - return by ID

    async getPostsById(req: Request, res: Response){
        if (!req.headers.authorization){
            const foundPost = await this.postsService.returnPostById(req.params.id)
            if (foundPost){
                res.status(200).send(foundPost)

            } else {
                res.sendStatus(404)

            }
        } else if (req.headers.authorization){
            const token = req.headers.authorization!.split(" ")[1]
            let userId : string = await this.jwtService.getUserByIdToken(token);
            const post = await this.postsService.returnPostByIdWithUser(req.params.id, userId)
            if (!post) {
                res.sendStatus(404)
            } else {
                res.send(post).status(200)
            }
        }
    }

    //DELETE - delete by ID

    async deletePostById(req: Request, res: Response){
        let status = await this.postsService.deletePostById(req.params.id)
        if (status){
            res.sendStatus(204)
            return
        } else{
            res.sendStatus(404)
            return
        }
    }

    //POST - create new

    async createPost(req: Request, res: Response){
        const foundBlog : Blog | null = await this.blogsService.returnBlogById(req.body.blogId);
        if (foundBlog === null) {
            res.sendStatus(404)
        } else {
            const blogId = foundBlog.id
            const blogName = foundBlog.name
            const newPost = await this.postsService.createNewPost(req.body, blogName, blogId);
            res.status(201).send(newPost)
        }
    }

    //PUT - update

    async updatePost(req: Request, res: Response){
        const status : boolean = await this.postsService.updatePostById(req.body, req.params.id);
        if (status){
            res.sendStatus(204)
        }
        else {
            res.sendStatus(404)
        }
    }

    //CREATE COMMENT BY POST ID

    async createComment(req: Request, res: Response){
        const foundPost : Post | null = await this.postsRepository.returnPostById(req.params.id)
        if (foundPost === null) {
            res.sendStatus(404)
        } else {
            const postId = req.params.id
            let userId = await this.jwtService.getUserByIdToken(req.headers.authorization!.split(" ")[1])
            const createdComment = await this.commentsService.createComment(postId, userId, req.body.content)
            if (createdComment) {
                res.status(201).send(createdComment)
            } else {
                res.sendStatus(401)
            }
        }
    }

    //GET COMMENTS

    async getCommentsByPost(req: Request, res: Response){
        const foundPost = await this.postsService.returnPostById(req.params.id)
        if (foundPost === null) {
            res.sendStatus(404)
        } else {
            let pageSize : number = paginationHelpers.pageSize(<string>req.query.pageSize);
            let pageNumber : number = paginationHelpers.pageNumber(<string>req.query.pageNumber)
            let sortBy : string = paginationHelpers.sortBy(<string>req.query.sortBy);
            let sortDirection : SortDirection = paginationHelpers.sortDirection(<string>req.query.sortDirection);
            let userId = await this.jwtService.getUserByIdToken(req.headers.authorization!.split(" ")[1])
            const foundComments = await this.commentsService.getAllCommentsByPostId(pageSize, pageNumber, sortBy, sortDirection, req.params.id, userId)
            res.status(200).send(foundComments)
        }
    }

    //LIKE STATUS

    async changeLikeStatus(req: Request, res: Response){
        const requestType : string = req.body.likeStatus
        const postId : string = req.params.id;
        const token = req.headers.authorization!.split(" ")[1]
        let userId : string = await this.jwtService.getUserByIdToken(token)
        const status : boolean = await postsService.changeLikeStatus(requestType, postId, userId)
        if (status){
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}