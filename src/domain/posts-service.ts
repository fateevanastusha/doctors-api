import {PostsRepository} from "../repositories/posts-db-repositiory";
import {LikeView, Paginator, Post, PostView, SortDirection} from "../types/types";
import {queryRepository} from "../queryRepo";
import {LikesRepository} from "../repositories/likes-db-repository";
import {LikesHelpers} from "../helpers/likes-helpers";

export class PostsService {
    constructor(protected postsRepository : PostsRepository, protected likesRepository : LikesRepository, protected likesHelper : LikesHelpers) {
    }
    //return all posts
    async returnAllPost(PageSize: number, Page: number, sortBy : string, sortDirection: SortDirection, userId : string) : Promise<Paginator>{
        const total = (await this.postsRepository.returnAllPost()).length
        const PageCount = Math.ceil( total / PageSize)
        const Items = await queryRepository.PaginatorForPosts(PageCount, PageSize, Page, sortBy, sortDirection );
        let posts = await queryRepository.PostsMapping(Items, userId)
        let paginatedPost = queryRepository.PaginationForm(PageCount, PageSize, Page, total, posts)
        return paginatedPost
    }
    async returnAllPostByBlogId (PageSize: number, Page: number, sortBy : string, sortDirection: SortDirection, blogId: string, userId : string) : Promise<Paginator>{
        let total = (await this.postsRepository.getAllPostsByBlogId(blogId))
        let totalNumber
        if (total === null) {
            totalNumber = 0
        } else {
            totalNumber = total.length
        }
        const PageCount = Math.ceil( totalNumber / PageSize)
        const Items = await queryRepository.PaginatorForPostsByBlogId(PageCount, PageSize, Page, sortBy, sortDirection, blogId);
        let posts = await queryRepository.PostsMapping(Items, userId)
        let paginatedPost = queryRepository.PaginationForm(PageCount, PageSize, Page, totalNumber, posts)
        return paginatedPost
    }
    //return post by id
    async returnPostById(id: string) : Promise<null | PostView> {
        const likes : LikeView[] = await queryRepository.getLastLikes(id)
        const post =  await this.postsRepository.returnPostById(id)
        if (!post) return null
        post.extendedLikesInfo.newestLikes = likes
        const newPost = {...post, extendedLikesInfo: {...post.extendedLikesInfo, newestLikes: likes}}

        return newPost
    }

    async returnPostByIdWithUser(id: string, userId : string) : Promise<PostView | null>{
        const currentStatus = await this.likesHelper.requestType(await this.likesRepository.findStatus(id, userId))
        const likes = await queryRepository.getLastLikes(id)
        const post = await this.postsRepository.returnPostById(id);
        if (!post) return null
        post.extendedLikesInfo.myStatus = currentStatus
        post.extendedLikesInfo.newestLikes = []
        const newPost = {...post, extendedLikesInfo: {...post.extendedLikesInfo, newestLikes: likes}}
        return newPost
    }
    //delete post by id
    async deletePostById(id:string) : Promise<boolean>{
        return this.postsRepository.deletePostById(id);
    }
    //delete all data
    async deleteAllData() {
        await this.postsRepository.deleteAllData();
    }
    //create new post
    async createNewPost(post: Post, blogName: string, blogId : string) : Promise <PostView | null>{
        const newPost = {
            id: '' + (+(new Date())),
            title : post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: blogId,
            blogName: blogName,
            createdAt : new Date().toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            }
        };
        const createdPost = await this.postsRepository.createNewPost(newPost);
        if (!createdPost) return null
        const mappedPost : PostView = {...createdPost, extendedLikesInfo: {...createdPost.extendedLikesInfo, newestLikes: []}}
        return mappedPost;
    }
    //update post by id
    async updatePostById(post : Post, id : string) : Promise <boolean>{
        return await this.postsRepository.updatePostById(post,id)
    }

    //change like status

    async changeLikeStatus(requestType : string, postId : string, userId : string) : Promise <boolean> {
        const post : Post | null = await this.postsRepository.returnPostById(postId)
        if (!post) {
            return false
        }
        const status1 = await this.likesRepository.findStatus(postId, userId)
        const currentStatus = await this.likesHelper.requestType(status1)
        if (currentStatus === requestType) {
            return true
        }

        const status = {
            status : requestType,
            userId : userId,
            postOrCommentId : postId,
            createdAt : new Date().toISOString()
        }


        //if no status
        if (currentStatus === "None"){
            //add new like or dislike
            await this.likesRepository.createNewStatus(status)
        }

        else if (requestType === "None"){
            //delete status
            await this.likesRepository.deleteStatus(postId, userId)
        } else {
            //change status
            await this.likesRepository.updateStatus(status)
        }
        await this.changeTotalCount(postId)
        return true;
    }

    async changeTotalCount(postId : string) : Promise<boolean> {
        const likesCount : number = await this.likesRepository.findLikes(postId)
        const dislikesCount : number = await this.likesRepository.findDislikes(postId)
        return this.postsRepository.changeLikesTotalCount(postId, likesCount, dislikesCount)
    }
}