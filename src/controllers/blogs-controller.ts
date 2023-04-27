import {BlogsService} from "../domain/blogs-service";
import {Request, Response} from "express";
import {paginationHelpers} from "../helpers/pagination-helpers";
import {SortDirection} from "mongodb";
import {Blog, Post} from "../types/types";
import {PostsService} from "../domain/posts-service";
import {JwtService} from "../application/jwt-service";

export class BlogsController {
    constructor(protected blogsService : BlogsService, protected postsService : PostsService, protected jwtService : JwtService) {
    }
    //GET - return all
    async getAllBlogs(req: Request, res: Response){
        let pageSize : number = paginationHelpers.pageSize(<string>req.query.pageSize)
        let pageNumber : number = paginationHelpers.pageNumber(<string>req.query.pageNumber)
        let sortBy : string = paginationHelpers.sortBy(<string>req.query.sortBy)
        let sortDirection : SortDirection = paginationHelpers.sortDirection(<string>req.query.sortDirection)
        let searchNameTerm : string = paginationHelpers.searchNameTerm(<string>req.query.searchNameTerm)
        let allBlogs = await this.blogsService.returnAllBlogs(pageSize, pageNumber, sortBy, sortDirection, searchNameTerm);
        res.status(200).send(allBlogs);
    }
    //GET - return by ID
    async getBlogsById(req: Request, res: Response){
        const foundBlog : Blog | null= await this.blogsService.returnBlogById(req.params.id);
        if (foundBlog) {
            res.status(200).send(foundBlog);
        } else {
            res.sendStatus(404)
        }
    }
    //DELETE - delete by ID
    async deleteBlogById(req: Request, res: Response){
        let status = await this.blogsService.deleteBlogById(req.params.id);
        if (status){
            res.sendStatus(204);
            return
        } else {
            res.sendStatus(404)
            return
        }
    }
    //POST - create new
    async createBlog(req: Request, res: Response){
        const newBlog : Blog| null = await this.blogsService.createNewBlog(req.body);
        res.status(201).send(newBlog);
    }
    //PUT - update
    async updateBlog(req: Request, res: Response){
        const status : boolean = await this.blogsService.updateBlogById(req.body, req.params.id)
        if (status){
            res.sendStatus(204)
        } else {
            res.send(404)
        }
    }
    //NEW - POST - create post for blog
    async createPostForBlog(req: Request, res: Response){
        const foundBlog : Blog | null = await this.blogsService.returnBlogById(req.params.id);
        if (!foundBlog) {
            res.sendStatus(404)
        } else {
            const blogId = foundBlog.id;
            const blogName = foundBlog.name;
            const newPost : Post | null = await this.postsService.createNewPost(req.body, blogName, blogId);
            res.status(201).send(newPost)
        }
    }
    //NEW - GET - get all posts in blog
    async getPostsByBlog(req: Request, res: Response){
        const blogId = req.params.id;
        const foundBlog : Blog | null = await this.blogsService.returnBlogById(blogId);
        if (!foundBlog) {
            res.sendStatus(404)
            return
        }
        const token = req.headers.authorization!.split(" ")[1]
        let userId : string = await this.jwtService.getUserByIdToken(token)
        let pageSize : number = paginationHelpers.pageSize(<string>req.query.pageSize);
        let pageNumber : number = paginationHelpers.pageNumber(<string>req.query.pageNumber);
        let sortBy : string = paginationHelpers.sortBy(<string>req.query.sortBy);
        let sortDirection : SortDirection = paginationHelpers.sortDirection(<string>req.query.sortDirection);
        let allPosts = await this.postsService.returnAllPostByBlogId(pageSize, pageNumber, sortBy, sortDirection, blogId, userId);
        if (allPosts.items) {
            res.status(200).send(allPosts)
        }
    }
}